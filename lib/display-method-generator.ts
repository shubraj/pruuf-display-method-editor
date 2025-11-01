import { DisplayMethod, TemplateDesign } from '@/types/display-method';
import { uploadToFilebase, uploadJsonToFilebase } from './filebase';
import { getCredentialType } from './credential-types';

export function generateDisplayMethod(
  design: TemplateDesign,
  credentialSubjectId: string = 'did:example:123'
): DisplayMethod {
  const credentialType = getCredentialType(design.credentialType);
  
  // Get URLs for logo and background
  const logoUrl = design.logoUrl || (design.logoCid ? `${process.env.PUBLIC_IPFS_GATEWAY || 'https://ipfs.pruuf.tech/ipfs/'}${design.logoCid}` : '');
  const backgroundUrl = design.backgroundUrl || (design.backgroundCid ? `${process.env.PUBLIC_IPFS_GATEWAY || 'https://ipfs.pruuf.tech/ipfs/'}${design.backgroundCid}` : '');

  // Privado/issuer-node expects a FLAT JSON object, not a W3C VC structure
  // According to displayMethodMetadataParser, all fields are REQUIRED:
  // - backgroundImageUrl (string URL - required)
  // - description (string - required)
  // - descriptionTextColor (string - required)
  // - issuerName (string - required)
  // - issuerTextColor (string - required)
  // - logo.alt (string - required)
  // - logo.uri (string URL - required)
  // - title (string - required)
  // - titleTextColor (string - required)
  
  // Note: We include orientation and credentialType as optional metadata fields
  // even though issuer-node doesn't validate them. This allows for:
  // - Future compatibility if issuer-node adds support
  // - Use in other systems that might need this data
  // - Reference/audit purposes
  
  const flatDisplayMethod: any = {
    title: design.title || credentialType?.name || 'Credential',
    description: design.description || '',
    issuerName: design.issuerName || '',
    titleTextColor: design.accentColor || '#000000',
    descriptionTextColor: design.accentColor || '#000000',
    issuerTextColor: design.accentColor || '#000000',
    backgroundImageUrl: backgroundUrl || '',
    logo: {
      uri: logoUrl || '',
      alt: design.logoAlt || '',
    },
    // Optional metadata fields (not validated by issuer-node but included for reference)
    credentialType: design.credentialType || '',
    orientation: design.orientation || 'horizontal',
  };

  // Build credential subject with sample data (for W3C compatibility)
  const credentialSubject: any = {
    id: credentialSubjectId,
  };
  
  if (credentialType) {
    credentialType.schema.fields.forEach((field) => {
      switch (field.type) {
        case 'string':
          credentialSubject[field.key] = `Sample ${field.label}`;
          break;
        case 'date':
          credentialSubject[field.key] = new Date().toISOString().split('T')[0];
          break;
        case 'number':
          credentialSubject[field.key] = '12345';
          break;
      }
    });
  }

  // Return flat format as the main structure (Privado expects this)
  // Store it in a way that satisfies TypeScript but outputs the flat JSON
  return flatDisplayMethod as any as DisplayMethod;
}

export async function publishTemplate(design: TemplateDesign): Promise<{
  success: boolean;
  cid: string;
  ipfsUrl: string;
  gatewayUrl: string;
  displayMethod: DisplayMethod;
}> {
  try {
    // Upload logo if provided - MUST have a URL for Privado validation
    let logoCid: string | undefined;
    let logoUrl: string | undefined;
    if (design.logo) {
      const logoResult = await uploadToFilebase(
        design.logo,
        `logo-${Date.now()}.${design.logo.name.split('.').pop()}`
      );
      logoCid = logoResult.cid;
      logoUrl = logoResult.gatewayUrl;
    }

    // Upload background image if provided - MUST have a URL for Privado validation
    let backgroundCid: string | undefined;
    let backgroundUrl: string | undefined;
    if (design.backgroundImage) {
      const bgResult = await uploadToFilebase(
        design.backgroundImage,
        `background-${Date.now()}.${design.backgroundImage.name.split('.').pop()}`
      );
      backgroundCid = bgResult.cid;
      backgroundUrl = bgResult.gatewayUrl;
    }

    // Update design with uploaded CIDs
    const finalDesign: TemplateDesign = {
      ...design,
      logoCid,
      logoUrl,
      backgroundCid,
      backgroundUrl,
    };

    // Generate Display Method JSON (flat format for Privado)
    const displayMethod = generateDisplayMethod(finalDesign);

    // Upload Display Method JSON - this will be the flat format Privado expects
    const jsonResult = await uploadJsonToFilebase(
      displayMethod as any, // Upload flat format
      `display-method-${design.credentialType}-${Date.now()}.json`
    );

    return {
      success: true,
      cid: jsonResult.cid,
      ipfsUrl: jsonResult.ipfsUrl,
      gatewayUrl: jsonResult.gatewayUrl,
      displayMethod,
    };
  } catch (error) {
    console.error('Publish error:', error);
    throw error;
  }
}
