'use client';

import { TemplateDesign } from '@/types/display-method';
import { getCredentialType } from '@/lib/credential-types';

interface CredentialPreviewProps {
  design: TemplateDesign;
}

export default function CredentialPreview({ design }: CredentialPreviewProps) {
  const credentialType = getCredentialType(design.credentialType);
  const isHorizontal = design.orientation === 'horizontal';

  return (
    <div className="flex justify-center items-center min-h-[400px] p-8 gradient-bg rounded-xl">
      <div
        className={`preview-card hover:scale-[1.02] ${
          isHorizontal ? 'w-full max-w-2xl credential-card-horizontal' : 'w-full max-w-sm credential-card-vertical'
        }`}
        style={{
          backgroundColor: design.primaryColor || '#0125CF',
          backgroundImage: design.backgroundUrl
            ? `url(${design.backgroundUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: design.accentColor || '#FFFFFF',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Background overlay if image exists */}
        {design.backgroundUrl && (
          <div className="absolute inset-0 bg-black/30" />
        )}

        <div className="relative z-10 h-full w-full flex flex-col" style={{ minHeight: 0 }}>
          {/* Title */}
          <h1 className="credential-card-title flex-shrink-0" style={{ color: design.accentColor || '#FFFFFF' }}>
            {design.title || credentialType?.name || 'Title'}
          </h1>
          
          {/* Description */}
          <span className="credential-card-description flex-shrink-0" style={{ color: design.accentColor || '#FFFFFF', opacity: 0.9 }}>
            {design.description || 'Description'}
          </span>

          {/* Spacer to push footer to bottom */}
          <div className="flex-1 min-h-0" style={{ minHeight: '1rem' }}></div>

          {/* Footer with Issuer Name */}
          <div className="credential-card-footer">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {design.logoUrl && (
                <img
                  src={design.logoUrl}
                  alt={design.logoAlt || 'Logo'}
                  className="object-contain flex-shrink-0"
                  style={{ maxHeight: '2.2em', maxWidth: '2.2em', height: '2.2em', width: 'auto' }}
                />
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs opacity-70 whitespace-nowrap" style={{ color: design.accentColor || '#FFFFFF', lineHeight: '1.2' }}>
                  Issuer
                </span>
                <span className="text-sm font-semibold truncate" style={{ color: design.accentColor || '#FFFFFF', lineHeight: '1.3' }}>
                  {design.issuerName || 'Name'}
                </span>
              </div>
            </div>
            <svg 
              width="1.2em" 
              height="1.2em" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="flex-shrink-0"
              style={{ color: design.accentColor || '#FFFFFF', minWidth: '1.2em' }}
            >
              <path 
                d="M11.9754 3.98438C11.1091 3.98438 10.4004 4.69312 10.4004 5.55937C10.4004 6.42562 11.1091 7.13437 11.9754 7.13437C12.8416 7.13437 13.5504 6.42562 13.5504 5.55937C13.5504 4.69312 12.8416 3.98438 11.9754 3.98438ZM11.9754 16.8994C11.1091 16.8994 10.4004 17.6081 10.4004 18.4744C10.4004 19.3406 11.1091 20.0494 11.9754 20.0494C12.8416 20.0494 13.5504 19.3406 13.5504 18.4744C13.5504 17.6081 12.8416 16.8994 11.9754 16.8994ZM11.9754 10.4419C11.1091 10.4419 10.4004 11.1506 10.4004 12.0169C10.4004 12.8831 11.1091 13.5919 11.9754 13.5919C12.8416 13.5919 13.5504 12.8831 13.5504 12.0169C13.5504 11.1506 12.8416 10.4419 11.9754 10.4419Z" 
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
