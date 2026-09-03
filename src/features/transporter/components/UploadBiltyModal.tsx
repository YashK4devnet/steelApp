import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { TransporterLoadingTruck } from '../types';
import { useSubmitBilty } from '../hooks/useBiltyMutations';
import { processDocumentFile, compressImage } from '../../../lib/fileCompression';
import { dispatchGlobalToast } from '../../../app/providers/ToastProvider';
import { hapticFeedback } from '../../../utils/haptics';

interface UploadBiltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  truck: TransporterLoadingTruck | null;
}

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
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

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export function UploadBiltyModal({ isOpen, onClose, truck }: UploadBiltyModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useSubmitBilty();

  // Reset state, lock body scrolling, and notify layout when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      setIsProcessing(false);
      document.body.style.overflow = 'hidden';
      hapticFeedback.light();
    } else {
      document.body.style.overflow = '';
    }
    window.dispatchEvent(new CustomEvent('toggle-modal-overlay', { detail: { open: isOpen } }));
    return () => {
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('toggle-modal-overlay', { detail: { open: false } }));
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isProcessing || submitMutation.isPending || isClosing) return;
    hapticFeedback.light();
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240);
  };

  if (!isOpen || !truck) return null;

  const isPdf = selectedFile ? (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) : false;
  const isImage = selectedFile ? (selectedFile.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(selectedFile.name)) : false;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const typeLower = file.type.toLowerCase();
    const nameLower = file.name.toLowerCase();

    const isValid = 
      typeLower === 'application/pdf' || 
      typeLower.startsWith('image/') ||
      nameLower.endsWith('.pdf') ||
      nameLower.endsWith('.jpg') ||
      nameLower.endsWith('.jpeg') ||
      nameLower.endsWith('.png') ||
      nameLower.endsWith('.webp');

    if (!isValid) {
      setError('Please select a valid PDF or Image file (JPG, PNG, WEBP).');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleTakePhoto = async () => {
    // E2E Mock Bypass
    if ((window as any).__E2E_MOCK_IMAGE__) {
      const mockData = (window as any).__E2E_MOCK_IMAGE__;
      const file = new File([new Blob()], `bilty_mock_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(mockData);
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        // Compress captured camera photo
        const compressed = await compressImage(image.dataUrl, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.82,
        });

        const file = new File([compressed.blob], `bilty_${truck.truck_number_plate}_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        setSelectedFile(file);
        setPreviewUrl(compressed.base64);
        setError(null);
      }
    } catch (err) {
      console.warn('Camera capture cancelled or failed:', err);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or capture a bilty document before submitting.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Smart document compression: images are resized & compressed, PDFs pass through with full fidelity
      const processed = await processDocumentFile(selectedFile);

      await submitMutation.mutateAsync({
        truck_line_id: truck.id,
        bilty_document: processed.base64,
        bilty_document_name: processed.fileName || 'bilty.pdf',
      });

      dispatchGlobalToast({
        type: 'success',
        title: 'Bilty Uploaded',
        message: `Bilty document submitted successfully for ${truck.truck_number_plate}.`,
      });

      handleClose();
    } catch (err: unknown) {
      // Handled centrally in apiRequest
      setError(err instanceof Error ? err.message : 'Failed to submit bilty document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isSubmitting = isProcessing || submitMutation.isPending;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-250 cursor-pointer ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-page-transition'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[24px] shadow-[0_20px_50px_rgba(15,23,42,0.25)] border border-slate-900/10 p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,1rem)+1.25rem)] sm:pb-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto cursor-default ${
          isClosing ? 'animate-slide-down-bottom' : 'animate-slide-up-bottom'
        }`}
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-1 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="text-[18px] font-bold text-text-primary tracking-tight">Upload Bilty Document</h3>
            <p className="text-xs text-text-secondary font-medium mt-0.5">Capture or upload freight bilty document</p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Truck Context Summary Card */}
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-[18px] p-3.5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <TruckIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[15px] font-bold text-text-primary tracking-tight">
                {truck.truck_number_plate}
              </h4>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                {truck.truck_type || 'Loading Truck'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              <span className="font-semibold text-slate-700">Driver:</span> {truck.driver_name || 'Not assigned'}
            </p>
            <p className="text-xs text-text-secondary mt-0.5 truncate">
              <span className="font-semibold text-slate-700">To:</span> {truck.delivery_address_name}
            </p>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFile ? (
            /* Selected File Card */
            <div className="bg-white border border-slate-200 rounded-[16px] p-3 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                {isImage && previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Bilty Preview" 
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
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-text-secondary font-medium">
                    {formatFileSize(selectedFile.size)} • {isPdf ? 'PDF Document' : 'Image Photo'}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleRemove}
                disabled={isSubmitting}
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors flex-shrink-0 active:scale-95"
                title="Remove document"
              >
                <TrashIcon />
              </button>
            </div>
          ) : (
            /* Dual Capture & Upload Choice Area */
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Take Photo with Camera */}
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  className="bg-slate-50 hover:bg-blue-50/60 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-[18px] p-4 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <CameraIcon />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-text-primary">Take Photo</p>
                    <p className="text-[11px] text-text-secondary font-medium mt-0.5">Use camera</p>
                  </div>
                </button>

                {/* Option 2: Choose File / PDF */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-50 hover:bg-emerald-50/60 border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-[18px] p-4 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <FileIcon />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-text-primary">Choose Document</p>
                    <p className="text-[11px] text-text-secondary font-medium mt-0.5">PDF or Gallery</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200/80 rounded-lg p-2 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-[14px] border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className={`flex-1 py-3 px-4 rounded-[14px] text-white text-sm font-bold shadow-[0_4px_12px_rgba(10,46,99,0.15)] flex items-center justify-center gap-2 active:scale-95 transition-all ${
                isSubmitting || !selectedFile
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-primary hover:shadow-[0_4px_16px_rgba(10,46,99,0.2)]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading Bilty...</span>
                </>
              ) : (
                'Upload Bilty'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
