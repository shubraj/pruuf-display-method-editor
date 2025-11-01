'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TemplateDesign } from '@/types/display-method';
import { getAllCredentialTypes } from '@/lib/credential-types';
import CredentialPreview from '@/components/CredentialPreview';
import ColorPicker from '@/components/ColorPicker';
import FileUpload from '@/components/FileUpload';
import MetadataPreview from '@/components/MetadataPreview';
import InlineColorPicker from '@/components/InlineColorPicker';

export default function EditorPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/auth');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/login');
        }
      } else {
        setIsAuthenticated(false);
        router.push('/login');
      }
    } catch (err) {
      setIsAuthenticated(false);
      router.push('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API fails, try to redirect
      router.push('/login');
    }
  };
  const credentialTypes = getAllCredentialTypes();
  const [loading, setLoading] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    cid: string;
    ipfsUrl: string;
    gatewayUrl: string;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const [design, setDesign] = useState<TemplateDesign>({
    credentialType: credentialTypes[0]?.id || '',
    title: '',
    description: '',
    issuerName: '',
    primaryColor: '#0125CF',
    accentColor: '#FFFFFF',
    orientation: 'horizontal',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');

  const handleLogoChange = useCallback((file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setDesign((prev) => ({ ...prev, logo: file }));
    } else {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview('');
      setDesign((prev) => {
        const { logo, ...rest } = prev;
        return rest;
      });
    }
  }, [logoPreview]);

  const handleBackgroundChange = useCallback((file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundPreview(url);
      setDesign((prev) => ({ ...prev, backgroundImage: file }));
    } else {
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
      setBackgroundPreview('');
      setDesign((prev) => {
        const { backgroundImage, ...rest } = prev;
        return rest;
      });
    }
  }, [backgroundPreview]);

  const handlePublish = async () => {
    if (!design.credentialType) {
      setError('Please select a credential type');
      return;
    }
    
    if (!design.title || !design.description || !design.issuerName) {
      setError('Please fill in all required fields: Title, Description, and Issuer name');
      return;
    }

    setLoading(true);
    setError('');
    setPublishResult(null);

    try {
      const formData = new FormData();
      formData.append('credentialType', design.credentialType);
      formData.append('title', design.title || '');
      formData.append('description', design.description || '');
      formData.append('issuerName', design.issuerName || '');
      formData.append('primaryColor', design.primaryColor);
      formData.append('accentColor', design.accentColor);
      formData.append('orientation', design.orientation);
      formData.append('logoAlt', design.logoAlt || '');
      
      if (design.logo) {
        formData.append('logo', design.logo);
      }
      if (design.backgroundImage) {
        formData.append('backgroundImage', design.backgroundImage);
      }

      const response = await fetch('/api/publish', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish template');
      }

      setPublishResult({
        cid: result.cid,
        ipfsUrl: result.ipfsUrl,
        gatewayUrl: result.gatewayUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#0125CF] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Checking authentication...</p>
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
              <Image 
                src="/logo.png" 
                alt="PRUUF Logo" 
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto object-contain flex-shrink-0"
                priority
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient truncate sm:whitespace-normal">
                  PRUUF Display Method Editor
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                  To change the look of your credential card, edit the details below. See{' '}
                  <a 
                    href="/docs" 
                    className="text-[#0125CF] hover:underline inline-flex items-center gap-1"
                  >
                    documentation
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline">
                      <path d="M14.75 5.75001L14.75 1.25001M14.75 1.25001H10.25M14.75 1.25001L8 8M6.5 1.25H4.85C3.58988 1.25 2.95982 1.25 2.47852 1.49524C2.05516 1.71095 1.71095 2.05516 1.49524 2.47852C1.25 2.95982 1.25 3.58988 1.25 4.85V11.15C1.25 12.4101 1.25 13.0402 1.49524 13.5215C1.71095 13.9448 2.05516 14.289 2.47852 14.5048C2.95982 14.75 3.58988 14.75 4.85 14.75H11.15C12.4101 14.75 13.0402 14.75 13.5215 14.5048C13.9448 14.289 14.289 13.9448 14.5048 13.5215C14.75 13.0402 14.75 12.4101 14.75 11.15V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  {' '}to learn more.
                </p>
              </div>
            </div>
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Credential Type & Orientation Card */}
            <div className="card-glass space-y-6">
              <div className="section-header">
                <div className="section-icon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="section-title">Design Configuration</h2>
              </div>

              {/* Credential Type Selection */}
              <div>
                <label className="form-label">
                  Credential Type
                </label>
                <select
                  value={design.credentialType}
                  onChange={(e) =>
                    setDesign((prev) => ({ ...prev, credentialType: e.target.value }))
                  }
                  className="select-field"
                >
                  {credentialTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Orientation Selection */}
              <div>
                <label className="form-label">
                  Card Orientation
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (Preview only - Studio renders as horizontal)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setDesign((prev) => ({ ...prev, orientation: 'horizontal' }))
                    }
                    className={design.orientation === 'horizontal' ? 'orientation-btn-active' : 'orientation-btn-inactive'}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-10 mx-auto rounded-lg mb-3 transition-all ${
                        design.orientation === 'horizontal'
                          ? 'bg-[#0125CF]'
                          : 'bg-gray-200'
                      }`} />
                      <span className={`text-sm font-semibold ${
                        design.orientation === 'horizontal' ? 'text-[#0125CF]' : 'text-gray-700'
                      }`}>Horizontal</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDesign((prev) => ({ ...prev, orientation: 'vertical' }))
                    }
                    className={design.orientation === 'vertical' ? 'orientation-btn-active' : 'orientation-btn-inactive'}
                    title="Vertical orientation is for preview only. issuer-node will render credentials as horizontal."
                  >
                    <div className="text-center">
                      <div className={`w-10 h-16 mx-auto rounded-lg mb-3 transition-all ${
                        design.orientation === 'vertical'
                          ? 'bg-[#0125CF]'
                          : 'bg-gray-200'
                      }`} />
                      <span className={`text-sm font-semibold ${
                        design.orientation === 'vertical' ? 'text-[#0125CF]' : 'text-gray-700'
                      }`}>Vertical</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Fields Card */}
            <div className="card-glass">
              <div className="section-header">
                <div className="section-icon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="section-title">Content</h2>
              </div>
              <div className="space-y-6">
                {/* Title Field */}
                <div className="form-field-with-color">
                  <div className="form-field-input">
                    <label className="form-label">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter title"
                      value={design.title || ''}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="mt-[40px]">
                    <InlineColorPicker
                      color={design.accentColor}
                      onChange={(color) =>
                        setDesign((prev) => ({ ...prev, accentColor: color }))
                      }
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div className="form-field-with-color">
                  <div className="form-field-input">
                    <label className="form-label">
                      Description <span className="text-red-500">*</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" className="tooltip-icon">
                        <g clipPath="url(#clip0_9941_35437)">
                          <path d="M9 12V9M9 6H9.0075M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_9941_35437">
                            <rect width="18" height="18" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter description"
                      value={design.description || ''}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="mt-[40px]">
                    <InlineColorPicker
                      color={design.accentColor}
                      onChange={(color) =>
                        setDesign((prev) => ({ ...prev, accentColor: color }))
                      }
                    />
                  </div>
                </div>

                {/* Issuer Name Field */}
                <div className="form-field-with-color">
                  <div className="form-field-input">
                    <label className="form-label">
                      Issuer name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter issuer name"
                      value={design.issuerName || ''}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, issuerName: e.target.value }))
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="mt-[40px]">
                    <InlineColorPicker
                      color={design.accentColor}
                      onChange={(color) =>
                        setDesign((prev) => ({ ...prev, accentColor: color }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Color Pickers Card */}
            <div className="card-glass">
              <div className="section-header">
                <div className="section-icon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h2 className="section-title">Color Palette</h2>
              </div>
              <div className="space-y-6">
                <ColorPicker
                  label="Primary Color"
                  color={design.primaryColor}
                  onChange={(color) =>
                    setDesign((prev) => ({ ...prev, primaryColor: color }))
                  }
                />
                <ColorPicker
                  label="Accent/Text Color"
                  color={design.accentColor}
                  onChange={(color) =>
                    setDesign((prev) => ({ ...prev, accentColor: color }))
                  }
                />
              </div>
            </div>

            {/* File Uploads Card */}
            <div className="card-glass">
              <div className="section-header">
                <div className="section-icon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="section-title">Assets</h2>
              </div>
              <div className="space-y-6">
                <FileUpload
                  label="Logo (SVG or PNG, max 2MB)"
                  accept=".svg,.png,image/svg+xml,image/png"
                  maxSize={2}
                  currentFile={design.logo}
                  currentUrl={logoPreview}
                  onChange={handleLogoChange}
                  onRemove={() => handleLogoChange(null)}
                />
                <div>
                  <label className="form-label">
                    Logo Alt
                  </label>
                  <input
                    type="text"
                    placeholder="Enter logo alt text"
                    value={design.logoAlt || ''}
                    onChange={(e) =>
                      setDesign((prev) => ({ ...prev, logoAlt: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <FileUpload
                  label="Background Image (PNG or JPG, max 3MB)"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  maxSize={3}
                  currentFile={design.backgroundImage}
                  currentUrl={backgroundPreview}
                  onChange={handleBackgroundChange}
                  onRemove={() => handleBackgroundChange(null)}
                />
              </div>
            </div>

            {/* Publish Button */}
            <div className="gradient-primary rounded-2xl shadow-2xl p-6">
              <button
                onClick={handlePublish}
                disabled={loading || !design.credentialType || !design.title || !design.description || !design.issuerName}
                className="w-full py-4 px-6 bg-white text-[#0125CF] font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Publishing to IPFS...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Save & Publish to IPFS</span>
                  </>
                )}
              </button>
              {error && (
                <div className="error-card mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-red-900">Error</p>
                  </div>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              {publishResult && (
                <div className="success-card mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-green-900 text-lg">
                      Template Published Successfully!
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        CID
                      </div>
                      <code className="text-xs text-gray-800 font-mono break-all">{publishResult.cid}</code>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        IPFS URL
                      </div>
                      <code className="text-xs text-gray-800 font-mono break-all">{publishResult.ipfsUrl}</code>
                    </div>
                    <div className="gateway-url-container rounded-lg p-3 border border-gray-200">
                      <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Gateway URL
                      </div>
                      <a
                        href={publishResult.gatewayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0125CF] hover:text-[#0111a8] underline break-all text-xs font-mono block mb-2"
                      >
                        {publishResult.gatewayUrl}
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(publishResult.gatewayUrl);
                        }}
                        className="btn-primary w-full mt-2 text-sm py-2"
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy URL to Clipboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="card-glass">
              <div className="section-header">
                <div className="section-icon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="section-title">Live Preview</h2>
              </div>
              <CredentialPreview
                design={{
                  ...design,
                  logoUrl: logoPreview || design.logoUrl,
                  backgroundUrl: backgroundPreview || design.backgroundUrl,
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Metadata Section */}
        <div className="mt-8">
          <MetadataPreview
            design={{
              ...design,
              logoUrl: logoPreview || design.logoUrl,
              backgroundUrl: backgroundPreview || design.backgroundUrl,
            }}
          />
        </div>
      </main>
    </div>
  );
}
