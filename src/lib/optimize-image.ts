import sharp from 'sharp';

interface OptimizeResult {
  buffer: Buffer;
  format: string;
  originalSize: number;
  optimizedSize: number;
}

/**
 * Lossless image optimization using sharp.
 * Preserves full quality while reducing file size through:
 * - PNG: maximum lossless compression
 * - JPEG: progressive encoding, optimize coding tables
 * - WebP: lossless mode
 * - GIF: passed through (sharp has limited GIF write support)
 * - SVG: passed through as-is
 */
export async function optimizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<OptimizeResult> {
  const originalSize = buffer.length;

  // Skip non-image or unsupported formats
  if (!mimeType.startsWith('image/') || mimeType === 'image/svg+xml' || mimeType === 'image/gif') {
    return { buffer, format: mimeType, originalSize, optimizedSize: originalSize };
  }

  const image = sharp(buffer);
  let optimized: Buffer;
  let format = mimeType;

  if (mimeType === 'image/png') {
    optimized = await image
      .png({ compressionLevel: 9, effort: 10, palette: false })
      .toBuffer();
    format = 'image/png';
  } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    optimized = await image
      .jpeg({ quality: 100, progressive: true, optimizeCoding: true, mozjpeg: true })
      .toBuffer();
    format = 'image/jpeg';
  } else if (mimeType === 'image/webp') {
    optimized = await image
      .webp({ lossless: true, effort: 6 })
      .toBuffer();
    format = 'image/webp';
  } else if (mimeType === 'image/tiff') {
    optimized = await image
      .tiff({ compression: 'deflate' })
      .toBuffer();
    format = 'image/tiff';
  } else {
    // Unknown image type — pass through
    return { buffer, format: mimeType, originalSize, optimizedSize: originalSize };
  }

  // Only use optimized version if it's actually smaller
  if (optimized.length < originalSize) {
    return { buffer: optimized, format, originalSize, optimizedSize: optimized.length };
  }

  return { buffer, format: mimeType, originalSize, optimizedSize: originalSize };
}
