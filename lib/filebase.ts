import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// DigitalOcean Spaces configuration
const SPACES_ENDPOINT = process.env.SPACES_ENDPOINT || process.env.DO_SPACES_ENDPOINT;
const SPACES_REGION = process.env.SPACES_REGION || 'nyc3';
const SPACES_ACCESS_KEY = process.env.SPACES_ACCESS_KEY || process.env.DO_SPACES_KEY;
const SPACES_SECRET_KEY = process.env.SPACES_SECRET_KEY || process.env.DO_SPACES_SECRET;
const SPACES_BUCKET = process.env.SPACES_BUCKET || 'pruuf-display';
const SPACES_CDN_ENDPOINT = process.env.SPACES_CDN_ENDPOINT; // Optional CDN endpoint

// Construct endpoint URL if not provided
// DigitalOcean Spaces endpoint format: https://[region].digitaloceanspaces.com
// NOT: https://[bucket].[region].digitaloceanspaces.com (that's for the full URL, not the endpoint)
let endpoint = SPACES_ENDPOINT;
if (!endpoint) {
  endpoint = `https://${SPACES_REGION}.digitaloceanspaces.com`;
} else if (endpoint.includes('.digitaloceanspaces.com')) {
  // If user provided bucket-specific endpoint, extract just the base endpoint
  // Match: https://bucket.nyc3.digitaloceanspaces.com -> https://nyc3.digitaloceanspaces.com
  const match = endpoint.match(/https?:\/\/(?:[^.]+\.)?([^.]+\.digitaloceanspaces\.com)/);
  if (match && match[1]) {
    endpoint = `https://${match[1]}`;
  }
}

const s3Client = new S3Client({
  endpoint: endpoint,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_ACCESS_KEY || '',
    secretAccessKey: SPACES_SECRET_KEY || '',
  },
  forcePathStyle: false, // DigitalOcean Spaces uses virtual-hosted style by default
});

const BUCKET = SPACES_BUCKET;
const GATEWAY_BASE = process.env.PUBLIC_IPFS_GATEWAY || 'https://ipfs.pruuf.tech/ipfs/';

export interface UploadResult {
  cid: string;
  ipfsUrl: string;
  gatewayUrl: string;
}

/**
 * Upload a file to DigitalOcean Spaces
 * @param file - File or Buffer to upload
 * @param fileName - Name for the file (optional, will generate UUID if not provided)
 * @param contentType - MIME type of the file
 * @returns UploadResult with file identifier and URLs
 */
export async function uploadToFilebase(
  file: File | Buffer | any,
  fileName?: string,
  contentType?: string
): Promise<UploadResult> {
  try {
    const key = fileName || `${uuidv4()}-${Date.now()}`;
    
    // Check if it's a File-like object (from FormData) or Buffer
    const isFileLike = (obj: any): obj is File => {
      return obj && typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && !Buffer.isBuffer(obj);
    };
    
    // Convert file to Buffer
    let fileBuffer: Buffer;
    let mimeType = contentType || 'application/octet-stream';
    
    if (isFileLike(file)) {
      // File-like object from FormData (has arrayBuffer method)
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      // Try to get MIME type from the file object
      if (file.type) {
        mimeType = file.type;
      }
    } else if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else {
      // Fallback: try to convert to Buffer
      fileBuffer = Buffer.from(file);
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read', // Make files publicly accessible
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
      Metadata: {
        'x-amz-meta-uploaded-at': new Date().toISOString(),
      },
    });

    const response = await s3Client.send(command);
    
    // DigitalOcean Spaces returns ETag (MD5 hash)
    // We'll use the key as the identifier and construct CDN URLs
    const fileIdentifier = key;
    
    // Construct URLs
    // DigitalOcean Spaces URL format: https://[bucket].[region].digitaloceanspaces.com/[key]
    // Or with CDN: https://[bucket].[region].cdn.digitaloceanspaces.com/[key]
    let spacesUrl: string;
    if (SPACES_CDN_ENDPOINT) {
      // CDN endpoint provided - format: https://bucket.region.cdn.digitaloceanspaces.com
      // Just append the key
      spacesUrl = `${SPACES_CDN_ENDPOINT}/${key}`;
    } else {
      // Regular Spaces endpoint - construct from bucket and endpoint
      // endpoint is https://region.digitaloceanspaces.com, need https://bucket.region.digitaloceanspaces.com
      const baseEndpoint = (endpoint || `https://${SPACES_REGION}.digitaloceanspaces.com`).replace(`https://`, '').replace(`http://`, '');
      spacesUrl = `https://${BUCKET}.${baseEndpoint}/${key}`;
    }
    
    const ipfsUrl = `ipfs://${fileIdentifier}`; // Placeholder - if IPFS needed, use separate service
    const gatewayUrl = spacesUrl; // Use Spaces URL as gateway URL

    return {
      cid: fileIdentifier,
      ipfsUrl,
      gatewayUrl,
    };
  } catch (error) {
    console.error('DigitalOcean Spaces upload error:', error);
    throw new Error(`Failed to upload to DigitalOcean Spaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload JSON object to DigitalOcean Spaces
 */
export async function uploadJsonToFilebase(
  data: any,
  fileName?: string
): Promise<UploadResult> {
  const jsonString = JSON.stringify(data, null, 2);
  const jsonBuffer = Buffer.from(jsonString, 'utf-8');
  
  return uploadToFilebase(
    jsonBuffer,
    fileName || `display-method-${Date.now()}.json`,
    'application/json'
  );
}

/**
 * Verify CID is accessible via gateway
 */
export async function verifyGatewayAccess(cid: string): Promise<boolean> {
  try {
    const response = await fetch(`${GATEWAY_BASE}${cid}`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch (error) {
    console.error('Gateway verification error:', error);
    return false;
  }
}
