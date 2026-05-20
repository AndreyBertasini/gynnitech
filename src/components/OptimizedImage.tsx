import React from 'react';

interface Props {
  /** Primary modern-format image (WebP or AVIF) */
  src: string;
  /** Fallback image in JPEG/PNG format */
  fallbackSrc?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to lazy load */
  lazy?: boolean;
  /** Object-fit style */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Width attribute */
  width?: number;
  /** Height attribute */
  height?: number;
  /** Decoding mode */
  decoding?: 'async' | 'sync' | 'auto';
}

/**
 * OptimizedImage — renders an image with modern format sources (WebP, AVIF)
 * and a JPEG/PNG fallback via the <picture> element.
 * 
 * Automatically detects format from the src extension. If src is already
 * .webp or .avif, generates appropriate fallback paths by changing extension.
 * 
 * Usage:
 *   <OptimizedImage src="/images/cover.webp" alt="Cover" />
 *   <OptimizedImage src="/images/cover.avif" alt="Cover" fallbackSrc="/images/cover.jpg" />
 */
export function OptimizedImage({
  src,
  fallbackSrc,
  alt,
  className = '',
  lazy = true,
  fit = 'cover',
  width,
  height,
  decoding = 'async',
}: Props) {
  // Derive fallback path by swapping extension
  const deriveFallback = (): string | undefined => {
    if (fallbackSrc) return fallbackSrc;
    
    const lower = src.toLowerCase();
    if (lower.endsWith('.webp')) {
      return src.replace(/\.webp$/i, '.jpg');
    }
    if (lower.endsWith('.avif')) {
      // Try .webp then .jpg
      return undefined; // we handle AVIF→WebP→JPEG chain below
    }
    return undefined; // src is already JPEG/PNG, no fallback needed
  };

  const jpgFallback = deriveFallback();
  const isAvif = src.toLowerCase().endsWith('.avif');
  const isWebp = src.toLowerCase().endsWith('.webp');
  const isModern = isAvif || isWebp;

  if (!isModern) {
    // Already a fallback format; just render a plain img
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={lazy ? 'lazy' : 'eager'}
        decoding={decoding}
        width={width}
        height={height}
        style={{ objectFit: fit }}
      />
    );
  }

  return (
    <picture>
      {/* AVIF source if the primary is AVIF */}
      {isAvif && (
        <source srcSet={src} type="image/avif" />
      )}
      {/* WebP source */}
      {isAvif ? (
        // WebP fallback for AVIF
        <source srcSet={src.replace(/\.avif$/i, '.webp')} type="image/webp" />
      ) : (
        // Direct WebP
        <source srcSet={src} type="image/webp" />
      )}
      {/* JPEG/PNG fallback */}
      <img
        src={jpgFallback || src.replace(/\.(webp|avif)$/i, '.jpg')}
        alt={alt}
        className={className}
        loading={lazy ? 'lazy' : 'eager'}
        decoding={decoding}
        width={width}
        height={height}
        style={{ objectFit: fit }}
      />
    </picture>
  );
}
