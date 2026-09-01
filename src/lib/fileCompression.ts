export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.82)
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export interface CompressedImageResult {
  base64: string;
  blob: Blob;
  width: number;
  height: number;
  originalSizeKB: number;
  compressedSizeKB: number;
}

export interface ProcessedDocumentResult {
  base64: string;
  fileName: string;
  isPdf: boolean;
  originalSizeKB: number;
  compressedSizeKB: number;
}

/**
 * Converts any File object (including unlimited size PDFs) directly into a Base64 data URL string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Loads an image from a File, Blob, or Base64 data URL string into an HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for compression: ' + err));
    img.src = src;
  });
}

/**
 * Compresses and resizes an image on the client side using HTML5 Canvas.
 * - Downscales large phone camera resolutions to a max dimension (default 1600px).
 * - Encodes as clean JPEG with high fidelity and compact payload (~200KB - 400KB).
 */
export async function compressImage(
  input: File | Blob | string,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options;

  let srcUrl: string;
  let originalSizeBytes = 0;

  if (typeof input === 'string') {
    srcUrl = input;
    // Estimate original bytes from base64 length
    originalSizeBytes = Math.round((input.length * 3) / 4);
  } else {
    originalSizeBytes = input.size;
    srcUrl = URL.createObjectURL(input);
  }

  try {
    const img = await loadImage(srcUrl);

    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    // Calculate proportional aspect ratio downscaling
    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const widthRatio = maxWidth / targetWidth;
      const heightRatio = maxHeight / targetHeight;
      const scale = Math.min(widthRatio, heightRatio);

      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context could not be created for image compression.');
    }

    // Use high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // If converting PNG/Transparent to JPEG, fill white background
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const base64 = canvas.toDataURL(mimeType, quality);

    // Convert data URL to Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to generate image blob from canvas'));
        },
        mimeType,
        quality
      );
    });

    const compressedSizeKB = Math.round((blob.size / 1024) * 10) / 10;
    const originalSizeKB = Math.round((originalSizeBytes / 1024) * 10) / 10;

    return {
      base64,
      blob,
      width: targetWidth,
      height: targetHeight,
      originalSizeKB,
      compressedSizeKB,
    };
  } finally {
    if (typeof input !== 'string') {
      URL.revokeObjectURL(srcUrl);
    }
  }
}

/**
 * Universal document processor:
 * - If PDF: Encodes directly without compression or size limits.
 * - If Image: Resizes and compresses with Canvas before encoding to Base64.
 */
export async function processDocumentFile(
  file: File,
  options?: ImageCompressionOptions
): Promise<ProcessedDocumentResult> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const originalSizeKB = Math.round((file.size / 1024) * 10) / 10;

  if (isPdf) {
    // For PDFs: No file size limit, preserve native vector/text fidelity
    const base64 = await fileToBase64(file);
    return {
      base64,
      fileName: file.name,
      isPdf: true,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
    };
  }

  // For Images: Run client-side compression
  const compressed = await compressImage(file, options);
  const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';

  return {
    base64: compressed.base64,
    fileName: cleanName,
    isPdf: false,
    originalSizeKB,
    compressedSizeKB: compressed.compressedSizeKB,
  };
}
