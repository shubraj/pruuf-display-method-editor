# PRUUF Display Method Editor

A lightweight, no-code web application that allows issuer administrators to design branded credential cards visually. The app enables users to upload logos and background images, select brand colors, choose card orientation, preview credentials in real time, and publish templates to DigitalOcean Spaces.

## Features

- 🎨 **Visual Design Editor**: Intuitive interface for designing credential cards
- 🎯 **Credential Type Selection**: Support for multiple credential schemas (Proof of Enrollment, Member Proof, Certificate)
- ✍️ **Content Fields**: Title, description, and issuer name customization
- 🖼️ **Asset Upload**: Upload logos (SVG/PNG) and background images (PNG/JPG)
- 🎨 **Color Customization**: Primary and accent color pickers with inline color picker
- 📱 **Layout Options**: Horizontal and vertical card orientations (vertical for preview only)
- 👁️ **Live Preview**: Real-time preview of credential designs
- 📋 **Metadata Preview**: View generated Display Method JSON
- 🌐 **DigitalOcean Spaces Integration**: Automatic upload to DigitalOcean Spaces
- 🔗 **Gateway URLs**: Returns both CDN URLs and HTTPS gateway URLs
- 🔐 **Authentication**: Username and password-based authentication
- 📱 **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14 (React) + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Storage**: DigitalOcean Spaces (S3-compatible API)
- **Gateway**: https://ipfs.pruuf.tech (configurable)
- **Authentication**: Password-based (bcrypt hashing)

## Prerequisites

- Node.js 18+ and npm/yarn
- DigitalOcean Spaces account with API credentials
- Domain configured for your deployment (optional)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# DigitalOcean Spaces Configuration
SPACES_ACCESS_KEY=your_digitalocean_spaces_key
SPACES_SECRET_KEY=your_digitalocean_spaces_secret
SPACES_BUCKET=your_bucket_name
SPACES_REGION=your_region
SPACES_ENDPOINT=https://your_region.digitaloceanspaces.com
SPACES_CDN_ENDPOINT=https://your_bucket_name.your_region.cdn.digitaloceanspaces.com

# Public IPFS Gateway (optional - if using separate IPFS service)
PUBLIC_IPFS_GATEWAY=https://ipfs.pruuf.tech/ipfs/

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Admin Credentials (username and password)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password
# Note: If ADMIN_PASSWORD_HASH is not a bcrypt hash (doesn't start with $2a$, $2b$, or $2y$),
# it will be treated as a plain text password (for development only).
```

### 3. Generate Admin Password Hash

For production, generate a bcrypt hash:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 10).then(hash => console.log(hash));"
```

Add the hash to `ADMIN_PASSWORD_HASH` in `.env.local`.

For development, you can use a plain text password (not recommended for production).

### 4. DigitalOcean Spaces Bucket Setup

1. Log in to your DigitalOcean account
2. Create a new Space (bucket) or use an existing one
3. Note your Space name, region, and generate API keys (Access Key and Secret Key)
4. Configure CORS on your Space to allow GET requests from your frontend:
   - Go to Settings → CORS Configurations
   - Add a rule allowing GET and HEAD methods from your domain (or `*` for development)
5. Add credentials to `.env.local`

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to the login page if not authenticated.

## Authentication

The application uses username/password authentication:

1. **Login Page**: Navigate to `/login` or you'll be redirected there if not authenticated
2. **Username**: Set via `ADMIN_USERNAME` environment variable
3. **Password**: Set via `ADMIN_PASSWORD_HASH` environment variable (can be bcrypt hash or plain text for development)
4. **Session**: Sessions are stored in httpOnly cookies and expire after 24 hours
5. **Logout**: Use the logout button in the header to end your session

## Usage

### Creating a Display Method Template

1. **Login**: Enter your username and password on the login page

2. **Select Credential Type**: Choose from available credential types (Proof of Enrollment, Member Proof, Certificate)

3. **Choose Orientation**: Select horizontal or vertical card layout (note: vertical is preview-only; issuer-node renders as horizontal)

4. **Enter Content**:
   - **Title**: The main title of the credential card
   - **Description**: A brief description of the credential
   - **Issuer Name**: The name of the issuing organization

5. **Customize Colors**:
   - **Primary Color**: Background color for the credential card
   - **Accent/Text Color**: Text and accent element color (applies to all text elements)

6. **Upload Assets**:
   - **Logo**: SVG or PNG file (max 2MB)
   - **Logo Alt Text**: Alternative text for the logo
   - **Background Image**: PNG or JPG file (max 3MB, recommended 1280x720 for horizontal, 720x1280 for vertical)

7. **Preview**: View real-time preview of your design in the preview panel

8. **Review Metadata**: Check the generated Display Method JSON in the metadata preview section

9. **Publish**: Click "Save & Publish to IPFS" to:
   - Upload assets to DigitalOcean Spaces
   - Generate Display-Method JSON (flat format for Privado/issuer-node)
   - Upload JSON to Spaces
   - Receive CID and gateway URLs

### Using the Published Template

After publishing, you'll receive:
- **CID**: File identifier
- **IPFS URL**: `ipfs://<CID>` (placeholder format)
- **Gateway URL**: `https://your-bucket.region.cdn.digitaloceanspaces.com/<CID>`

Copy the Gateway URL and register it in the PRUUF Issuer UI under Display Methods.

**Note**: Make sure CORS is configured on your DigitalOcean Spaces bucket to allow the issuer-node frontend to fetch the JSON file.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── publish/          # API route for publishing templates
│   │   └── auth/              # Authentication API routes
│   │       ├── route.ts       # Login and session verification
│   │       └── logout/        # Logout endpoint
│   ├── login/                 # Login page
│   │   └── page.tsx
│   ├── globals.css            # Global styles and Tailwind CSS
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main editor page
├── components/
│   ├── CredentialPreview.tsx  # Live preview component
│   ├── ColorPicker.tsx        # Color selection component
│   ├── InlineColorPicker.tsx  # Compact inline color picker
│   ├── FileUpload.tsx         # File upload component
│   └── MetadataPreview.tsx    # Display Method JSON preview
├── lib/
│   ├── filebase.ts            # DigitalOcean Spaces integration
│   ├── display-method-generator.ts  # Display Method JSON generator
│   └── credential-types.ts    # Credential type definitions
├── types/
│   └── display-method.ts     # TypeScript type definitions
└── .env.local.example         # Environment variables template
```

## Display Method JSON Format

The generated Display Method JSON follows a flat format expected by Privado/issuer-node:

```json
{
  "title": "Credential Title",
  "description": "Credential Description",
  "issuerName": "Issuer Name",
  "titleTextColor": "#000000",
  "descriptionTextColor": "#000000",
  "issuerTextColor": "#000000",
  "backgroundImageUrl": "https://...",
  "logo": {
    "uri": "https://...",
    "alt": "Logo Alt Text"
  },
  "credentialType": "proof-of-enrollment",
  "orientation": "horizontal"
}
```

**Note**: All fields (`title`, `description`, `issuerName`, `backgroundImageUrl`, `logo.uri`, `logo.alt`, and color fields) are required by issuer-node validation, though they can be empty strings if no values are provided.

## API Endpoints

### POST /api/publish

Publishes a display method template to DigitalOcean Spaces.

**Authentication**: Required (httpOnly cookie)

**Request**: `FormData`
- `credentialType`: string (required)
- `title`: string (required)
- `description`: string (required)
- `issuerName`: string (required)
- `primaryColor`: string
- `accentColor`: string
- `orientation`: "horizontal" | "vertical"
- `logoAlt`: string
- `logo`: File (optional)
- `backgroundImage`: File (optional)

**Response**:
```json
{
  "success": true,
  "cid": "file-identifier",
  "ipfsUrl": "ipfs://file-identifier",
  "gatewayUrl": "https://bucket.region.cdn.digitaloceanspaces.com/file-identifier",
  "displayMethod": { ... }
}
```

### POST /api/auth

Authenticates admin user.

**Request**: `JSON`
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response**:
```json
{
  "success": true,
  "token": "session_token"
}
```

Sets an httpOnly cookie named `auth_token` valid for 24 hours.

### GET /api/auth

Verifies current authentication status.

**Response**:
```json
{
  "authenticated": true
}
```

### POST /api/auth/logout

Logs out the current user by clearing the authentication cookie.

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## CORS Configuration

For the issuer-node frontend to successfully fetch Display Method JSON files from your DigitalOcean Spaces, you need to configure CORS:

1. Go to DigitalOcean Dashboard → Spaces → Your Space → Settings
2. Navigate to CORS Configurations
3. Add a rule with:
   - **AllowedMethods**: `["GET", "HEAD"]`
   - **AllowedOrigins**: Your issuer-node domain (or `["*"]` for development)
   - **AllowedHeaders**: `["*"]`
   - **MaxAgeSeconds**: `3000`

For production, restrict `AllowedOrigins` to specific domains for security.

## Troubleshooting

### Upload Failures

- Verify DigitalOcean Spaces credentials are correct
- Check bucket name matches `SPACES_BUCKET`
- Ensure `SPACES_ENDPOINT` is in the format `https://region.digitaloceanspaces.com` (without bucket name)
- Check file size limits (logo: 2MB, background: 3MB)

### Authentication Issues

- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` are set correctly
- Check that the password hash is valid (if using bcrypt)
- For development, you can use plain text password (not recommended for production)
- Clear browser cookies if experiencing session issues

### Gateway Access Issues

- Verify `PUBLIC_IPFS_GATEWAY` is correctly configured (if using separate IPFS gateway)
- Check that DigitalOcean Spaces files are publicly accessible
- Ensure CORS is configured on your Spaces bucket

### Display Method Validation Errors

- Ensure all required fields (title, description, issuerName, backgroundImageUrl, logo.uri, logo.alt) are provided
- Check that URLs are valid and accessible
- Verify the JSON format matches the flat structure expected by issuer-node

### Build Errors

- Ensure Node.js version is 18+
- Clear `.next` directory and rebuild: `rm -rf .next && npm run build`
- Verify all dependencies are installed: `npm install`

## Future Enhancements

- [ ] Template versioning and history
- [ ] Additional credential types
- [ ] Custom field mappings
- [ ] Template marketplace
- [ ] Batch template creation
- [ ] Migration to PRUUF self-hosted IPFS gateway
- [ ] Additional authentication methods (OAuth, etc.)

## License

Proprietary - PRUUF Integration Team

## Support

For issues or questions, contact the PRUUF Development Team.

---

**Version**: 1.0 (DigitalOcean Spaces Integration)  
