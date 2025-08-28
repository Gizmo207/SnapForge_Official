/**
 * Browser-based Image Resize Service
 * Uses Canvas API for client-side image processing - no backend needed.
 */

/**
 * Resize an image using browser Canvas API
 * @param {File|Blob} imageFile - The image file to resize
 * @param {number} targetWidth - Target width (pixels)
 * @param {number} targetHeight - Target height (pixels)
 * @param {boolean} maintainAspect - Whether to maintain original aspect ratio
 * @param {'jpeg'|'png'|'webp'} format - Output format
 * @param {number} [quality=0.9] - Output quality (0..1) for lossy formats
 * @returns {Promise<Blob>} - The resized image as a Blob
 */
export const resizeImage = async (
  imageFile,
  targetWidth,
  targetHeight,
  maintainAspect = false,
  format = 'jpeg',
  quality = 0.9
) => {
  if (!imageFile) throw new Error('No image provided');
  if (!targetWidth || !targetHeight) throw new Error('Target size missing');

  const img = await fileToImage(imageFile);

  const { width, height } = calculateDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    targetWidth,
    targetHeight,
    maintainAspect
  );

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const mimeType = format === 'png' ? 'image/png'
                 : format === 'webp' ? 'image/webp'
                 : 'image/jpeg';

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob'));
      },
      mimeType,
      typeof quality === 'number' ? Math.min(1, Math.max(0, quality)) : 0.9
    );
  });
};

/** Convert a File/Blob into a loaded HTMLImageElement */
const fileToImage = (file) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

/** Calculate target draw size given aspect ratio settings. */
const calculateDimensions = (originalWidth, originalHeight, targetWidth, targetHeight, maintainAspect) => {
  if (!maintainAspect) return { width: targetWidth, height: targetHeight };

  const sourceAR = originalWidth / originalHeight;
  const targetAR = targetWidth / targetHeight;

  if (sourceAR > targetAR) {
    // source wider -> fit width
    const width = targetWidth;
    const height = Math.round(targetWidth / sourceAR);
    return { width, height };
  } else {
    // source taller -> fit height
    const height = targetHeight;
    const width = Math.round(targetHeight * sourceAR);
    return { width, height };
  }
};

/** Trigger a client-side download of a Blob */
export const downloadBlob = (blob, filename = 'image.jpg') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/** Create an object URL for previewing a Blob in <img src=...> */
export const createImagePreview = (blob) => {
  return URL.createObjectURL(blob);
};
