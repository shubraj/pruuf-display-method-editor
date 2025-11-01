'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  accept: string;
  maxSize: number; // in MB
  currentFile?: File;
  currentUrl?: string;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}

export default function FileUpload({
  label,
  accept,
  maxSize,
  currentFile,
  currentUrl,
  onChange,
  onRemove,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Validate file type
    const validTypes = accept.split(',').map((t) => t.trim());
    const isValidType = validTypes.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });

    if (!isValidType) {
      setError(`Invalid file type. Accepted: ${accept}`);
      return;
    }

    setError('');
    onChange(file);
  };

  return (
    <div className="space-y-3">
      <label className="form-label">{label}</label>
      
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Upload Area */}
      {!currentFile && !currentUrl && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="upload-area group"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[var(--primary-light)] flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-gray-500 group-hover:text-[#0125CF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#0125CF] transition-colors">
                Click to upload
              </span>
              <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {(currentFile || currentUrl) && (
        <div className="file-preview-container rounded-xl p-4 border-2 border-gray-200">
          <div className="flex items-center gap-4">
            {currentUrl && (
              <div className="flex-shrink-0">
                <Image
                  src={currentUrl}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain rounded-lg border-2 border-white shadow-sm"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {currentFile && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {currentFile.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {(currentFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-sm py-2 px-4"
              >
                Change
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 rounded-lg text-sm font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-card">
          <p className="text-sm text-red-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
