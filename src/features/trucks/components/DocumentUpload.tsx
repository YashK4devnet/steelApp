import React, { useState, useRef } from 'react';

interface DocumentUploadProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  value: File | null;
  onChange: (file: File | null, fileName: string) => void;
}

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <text x="7" y="18" fill="#DC2626" fontSize="7" fontWeight="bold" stroke="none">PDF</text>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export function DocumentUpload({
  id,
  label,
  required = false,
  hint,
  value,
  onChange
}: DocumentUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = value ? (value.type === 'application/pdf' || value.name.toLowerCase().endsWith('.pdf')) : false;
  const isImage = value ? (value.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(value.name)) : false;

  const validateAndProcessFile = (file: File) => {
    setError(null);

    const typeLower = file.type.toLowerCase();
    const nameLower = file.name.toLowerCase();
    
    const isValidType = 
      typeLower === 'application/pdf' || 
      typeLower.startsWith('image/') ||
      nameLower.endsWith('.pdf') ||
      nameLower.endsWith('.jpg') ||
      nameLower.endsWith('.jpeg') ||
      nameLower.endsWith('.png') ||
      nameLower.endsWith('.webp');

    if (!isValidType) {
      setError('Only PDF or image files (JPG, PNG, WEBP) are allowed.');
      onChange(null, '');
      setPreviewUrl(null);
      return;
    }

    // Auto-pick file name
    onChange(file, file.name);

    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, '');
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <label htmlFor={id} className="text-sm font-semibold text-text-primary">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {hint && <span className="text-xs text-text-secondary">{hint}</span>}
      </div>

      <input 
        id={id}
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        /* Selected File Card */
        <div className="bg-white border border-slate-200 rounded-[16px] p-3 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            {isImage && previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-12 h-12 rounded-[10px] object-cover border border-slate-100 flex-shrink-0"
              />
            ) : isPdf ? (
              <div className="w-12 h-12 rounded-[10px] bg-red-50 flex items-center justify-center flex-shrink-0">
                <PdfIcon />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-[10px] bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-xs uppercase">
                File
              </div>
            )}

            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {value.name}
              </p>
              <p className="text-xs text-text-secondary font-medium">
                {formatFileSize(value.size)} • {isPdf ? 'PDF Document' : 'Image File'}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleRemove}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-error flex items-center justify-center transition-colors flex-shrink-0"
            title="Remove document"
          >
            <TrashIcon />
          </button>
        </div>
      ) : (
        /* Upload Area */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-[16px] p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : error 
              ? 'border-red-300 bg-red-50/30' 
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <UploadIcon />
          </div>
          <p className="text-sm font-semibold text-text-primary">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            Supported formats: <strong className="text-slate-700">PDF or Images (JPG, PNG, WEBP)</strong>
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-error mt-1 flex items-center gap-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
