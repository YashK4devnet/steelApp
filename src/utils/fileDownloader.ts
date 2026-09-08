import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';

export interface DownloadFileOptions {
  base64Data: string;
  filename: string;
  mimeType?: string;
  autoOpen?: boolean;
}

export interface DownloadResult {
  filename: string;
  uri?: string;
  location: 'downloads' | 'documents' | 'app_storage';
  opened: boolean;
}

/**
 * Downloads and saves a Base64-encoded file directly to the device's Downloads directory,
 * and automatically opens the file using the default viewer.
 * - On Native (Android / iOS): Writes to the device's Downloads folder, then triggers FileOpener.
 * - On Web Browser: Initiates browser download and opens the document in a new tab.
 */
export async function downloadPdfFile({
  base64Data,
  filename,
  mimeType = 'application/pdf',
  autoOpen = true,
}: DownloadFileOptions): Promise<DownloadResult> {
  // Normalize base64 string
  let cleanBase64 = base64Data;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }
  cleanBase64 = cleanBase64.trim();

  // Sanitize filename
  const safeFilename = filename.replace(/[/\\?%*:|"<>]/g, '_') || 'document.pdf';

  if (Capacitor.isNativePlatform()) {
    // Request permission if needed on older Android versions
    try {
      const permStatus = await Filesystem.checkPermissions();
      if (permStatus.publicStorage !== 'granted') {
        await Filesystem.requestPermissions();
      }
    } catch {
      // Handled automatically on modern Scoped Storage
    }

    let savedUri = '';
    let location: 'downloads' | 'documents' | 'app_storage' = 'downloads';

    // 1. Try saving directly into the device's public Downloads directory
    try {
      const downloadPath = `/storage/emulated/0/Download/${safeFilename}`;
      const savedFile = await Filesystem.writeFile({
        path: downloadPath,
        data: cleanBase64,
        recursive: true,
      });
      savedUri = savedFile.uri;
      location = 'downloads';
    } catch {
      // 2. If direct Download path is restricted, save to Documents directory
      try {
        const savedFile = await Filesystem.writeFile({
          path: safeFilename,
          data: cleanBase64,
          directory: Directory.Documents,
          recursive: true,
        });
        savedUri = savedFile.uri;
        location = 'documents';
      } catch {
        // 3. Fallback to app-isolated data storage
        const fallbackFile = await Filesystem.writeFile({
          path: safeFilename,
          data: cleanBase64,
          directory: Directory.Data,
          recursive: true,
        });
        savedUri = fallbackFile.uri;
        location = 'app_storage';
      }
    }

    // Auto-open using the device's default PDF viewer
    let opened = false;
    if (autoOpen && savedUri) {
      try {
        await FileOpener.open({
          filePath: savedUri,
          contentType: mimeType,
          openWithDefault: true,
        });
        opened = true;
      } catch (openErr) {
        console.warn('FileOpener could not open PDF automatically:', openErr);
      }
    }

    return {
      filename: safeFilename,
      uri: savedUri,
      location,
      opened,
    };
  } else {
    // Web browser environment: decode Base64 into binary Blob
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // Auto-open in a browser tab
    let opened = false;
    if (autoOpen) {
      try {
        window.open(url, '_blank');
        opened = true;
      } catch (e) {
        console.warn('Browser blocked popup for PDF tab:', e);
      }
    }

    // Trigger standard browser download into the user's Downloads directory
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = safeFilename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 4000);

    return {
      filename: safeFilename,
      location: 'downloads',
      opened,
    };
  }
}

// Backwards-compatible alias
export const downloadAndSharePdf = downloadPdfFile;
