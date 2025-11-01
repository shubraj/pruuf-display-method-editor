'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DocsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#0125CF] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <img 
                src="/logo.png" 
                alt="PRUUF Logo" 
                className="h-8 sm:h-10 w-auto object-contain flex-shrink-0"
                loading="eager"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient truncate sm:whitespace-normal">
                  PRUUF Display Method Editor
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                  Documentation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="btn-secondary flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline text-sm sm:text-base">Editor</span>
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 flex-shrink-0"
                  title="Logout"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline text-sm sm:text-base">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-glass p-6 sm:p-8 lg:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-6">
            Custom Display Methods
          </h1>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">What are Custom Display Methods?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              They define how a credential is presented to its holder. For instance, a university may issue digital diplomas in a specific layout (with the university's logo, official colors, etc.) that is visually appealing. A Custom Display Method ensures consistency and brand adherence across all issued credentials.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Example Use Case</h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Scenario</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                A company wants to issue secure digital certificates as Verifiable Credentials for its employees' achievements or training. Instead of generic text-based credentials, they want a branded, visually appealing credential that includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Company logo</li>
                <li>Employee photo</li>
                <li>Distinct color scheme</li>
                <li>Signature of the HR manager</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                By creating a Custom Display Method and referencing it during credential issuance, they ensure each certificate is displayed exactly as intended, maintaining brand identity and professionalism.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Building a Display Method</h2>

            <div className="space-y-8">
              <div className="border-l-4 border-[#0125CF] pl-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Step 1: Fill Out Metadata</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>Open the <a href="/" className="text-[#0125CF] hover:underline font-semibold">Display Method Editor</a>.</li>
                  <li>Enter all required metadata fields:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Credential Type</strong>: Select from available types (Proof of Enrollment, Member Proof, Certificate)</li>
                      <li><strong>Card Orientation</strong>: Choose horizontal or vertical layout (vertical is preview-only - issuer-node renders as horizontal)</li>
                      <li><strong>Title</strong>: The main title displayed on the credential card</li>
                      <li><strong>Description</strong>: A brief description of the credential</li>
                      <li><strong>Issuer Name</strong>: The name of the issuing organization</li>
                      <li><strong>Primary Color</strong>: Background color for the credential card</li>
                      <li><strong>Accent Color</strong>: Text and accent element color</li>
                      <li><strong>Logo</strong>: Upload your organization's logo (SVG or PNG, max 2MB)</li>
                      <li><strong>Background Image</strong>: Upload a background image (PNG or JPG, max 3MB)</li>
                      <li><strong>Logo Alt Text</strong>: Alternative text for accessibility</li>
                    </ul>
                  </li>
                  <li>Make sure to follow any restrictions or formatting requirements.</li>
                </ol>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Use the live preview panel on the right to see how your credential will look in real-time as you make changes.
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-[#0125CF] pl-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Step 2: Publish to DigitalOcean Spaces</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>After filling out all metadata fields, review your design in the preview panel.</li>
                  <li>Check the metadata preview section to verify the generated JSON structure.</li>
                  <li>Click on <strong>"Save & Publish to IPFS"</strong> button.</li>
                  <li>The Editor will:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Upload your logo and background image to DigitalOcean Spaces</li>
                      <li>Generate the Display Method JSON in the format expected by issuer-node</li>
                      <li>Upload the JSON file to DigitalOcean Spaces</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="border-l-4 border-[#0125CF] pl-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Step 3: Obtain the Gateway URL</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>Wait for the publishing response (this may take a few seconds).</li>
                  <li>You'll receive:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>CID</strong>: File identifier</li>
                      <li><strong>IPFS URL</strong>: Placeholder format (ipfs://...)</li>
                      <li><strong>Gateway URL</strong>: The HTTPS URL you'll use (https://your-bucket.region.cdn.digitaloceanspaces.com/...)</li>
                    </ul>
                  </li>
                  <li>Copy the <strong>Gateway URL</strong> - this is what you'll use in the Issuer Node.</li>
                  <li>This URL uniquely references your Display Method and will be used for credential display.</li>
                </ol>
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Important:</strong> Make sure CORS is configured on your DigitalOcean Spaces bucket to allow the issuer-node frontend to fetch the JSON file. See the README for CORS configuration instructions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Usage of a Display Method in Issuer Node</h2>

            <div className="space-y-8">
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Adding the Display Method to the Issuer Node</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>In your Issuer Node, navigate to the Display Method section (go to <code className="bg-gray-100 px-2 py-1 rounded text-sm">/display-methods/create</code> or click <strong>Create a Display Method</strong>).</li>
                  <li>Fill out the form:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Provide a unique name for the Display Method (e.g., <em>KYC Age Display Method</em> or <em>Employee Achievement Method</em>).</li>
                      <li>Paste the <strong>Gateway URL</strong> from the previous step into the URL field.</li>
                    </ul>
                  </li>
                  <li>Save your changes. The Display Method is now registered with your Issuer Node.</li>
                </ol>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Using a Display Method When Issuing Credentials</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>In the Issue Credential flow, enable the Display Method checkbox.</li>
                  <li>Select your newly created method from the dropdown list.</li>
                  <li>Once you issue the credential, it will reference your custom Display Method and display according to your design.</li>
                </ol>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Setting a Default Display Method for a Schema</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>On the Schema Details page in the Issuer Node, find the Display Method selector.</li>
                  <li>Choose a default method for that schema.</li>
                  <li>Any credential issued under this schema will automatically use the default Display Method (unless manually overridden during issuance).</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editing or Deleting a Display Method</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To edit or delete a Display Method:
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
              <li>Go to the detail page of the Display Method, or</li>
              <li>Navigate to the list of all Display Methods in your Issuer Node.</li>
              <li>Locate the edit or delete icons to make changes accordingly.</li>
            </ol>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If you update a Display Method JSON file, make sure to update the URL in the Issuer Node to point to the new version, or create a new Display Method entry.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Display Method JSON Format</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The PRUUF Display Method Editor generates a flat JSON format expected by Privado/issuer-node:
            </p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100">
{`{
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
}`}
              </pre>
            </div>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> All fields (<code className="bg-yellow-100 px-1 rounded">title</code>, <code className="bg-yellow-100 px-1 rounded">description</code>, <code className="bg-yellow-100 px-1 rounded">issuerName</code>, <code className="bg-yellow-100 px-1 rounded">backgroundImageUrl</code>, <code className="bg-yellow-100 px-1 rounded">logo.uri</code>, <code className="bg-yellow-100 px-1 rounded">logo.alt</code>, <code className="bg-yellow-100 px-1 rounded">titleTextColor</code>, <code className="bg-yellow-100 px-1 rounded">descriptionTextColor</code>, and <code className="bg-yellow-100 px-1 rounded">issuerTextColor</code>) are required by issuer-node validation, though they can be empty strings if no values are provided. The <code className="bg-yellow-100 px-1 rounded">credentialType</code> and <code className="bg-yellow-100 px-1 rounded">orientation</code> fields are optional metadata and are not validated by issuer-node.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Display Method Validation Error</h3>
                <p className="text-sm text-red-700">
                  If issuer-node shows "Display method is invalid", check that:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 ml-4 mt-2 space-y-1">
                  <li>All required fields are present in the JSON</li>
                  <li>URLs are valid and accessible</li>
                  <li>The JSON format matches the flat structure expected by issuer-node</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Network Error</h3>
                <p className="text-sm text-red-700">
                  If you see a "Network Error" when adding the Display Method URL, ensure CORS is configured on your DigitalOcean Spaces bucket. See the README for detailed CORS configuration instructions.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Conclusion</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              With the PRUUF Display Method Editor, you can easily create, manage, and apply custom Display Methods to credentials in the Privado Issuer Node. By leveraging custom layouts, organizations and institutions can ensure consistent branding and meaningful designs for their verifiable credentials. This not only adds professionalism but also improves the user's trust and recognition of your issued credentials.
            </p>
            <div className="bg-gradient-to-r from-[#0125CF] to-[#2d46e0] rounded-xl p-6 text-white mt-6">
              <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
              <p className="mb-4">Start creating your custom Display Method now!</p>
              <a
                href="/"
                className="inline-block bg-white text-[#0125CF] font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Open Display Method Editor →
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

