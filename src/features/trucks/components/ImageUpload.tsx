import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { compressImage } from '../../../lib/fileCompression';

interface ImageUploadProps {
  label: string;
  onImageSelected: (base64Data: string | undefined) => void;
  required?: boolean;
}

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export function ImageUpload({ label, onImageSelected, required = false }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const takePicture = async () => {
    // E2E Mock Bypass
    if ((window as any).__E2E_MOCK_IMAGE__) {
      setPreviewUrl((window as any).__E2E_MOCK_IMAGE__);
      onImageSelected((window as any).__E2E_MOCK_IMAGE__);
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      if (image.dataUrl) {
        // Run through client-side canvas compression to optimize dimensions & payload
        const compressed = await compressImage(image.dataUrl, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.82,
        });

        setPreviewUrl(compressed.base64);
        onImageSelected(compressed.base64);
      }
    } catch (error) {
      console.error('Error taking photo', error);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onImageSelected(undefined);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-semibold text-text-primary">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      
      <div 
        onClick={takePicture}
        className={`relative w-full h-40 rounded-[16px] border-2 border-dashed ${previewUrl ? 'border-transparent' : 'border-slate-300 bg-gray-50'} overflow-hidden flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-transform`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               {/* Overlay */}
            </div>
            <button 
              onClick={removeImage}
              className="absolute top-2 right-2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-accent shadow-md z-10 active:scale-95"
            >
              <TrashIcon />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-secondary">
            <CameraIcon />
            <span className="text-[14px] font-medium">Tap to add photo</span>
          </div>
        )}
      </div>
    </div>
  );
}
