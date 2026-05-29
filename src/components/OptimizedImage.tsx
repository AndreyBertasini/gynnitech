interface Props {
  /** Primary image, preferably WebP or AVIF. */
  src: string;
  /** Explicit fallback image, used only when the file exists. */
  fallbackSrc?: string;
  /** Alt text for accessibility. */
  alt: string;
  /** Additional CSS classes. */
  className?: string;
  /** Whether to lazy load. */
  lazy?: boolean;
  /** Object-fit style. */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Width attribute. */
  width?: number;
  /** Height attribute. */
  height?: number;
  /** Decoding mode. */
  decoding?: 'async' | 'sync' | 'auto';
}

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
  const isAvif = src.toLowerCase().endsWith('.avif');
  const isWebp = src.toLowerCase().endsWith('.webp');
  const isModern = isAvif || isWebp;

  if (!isModern) {
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
      {isAvif && <source srcSet={src} type="image/avif" />}
      {isAvif ? (
        <source srcSet={src.replace(/\.avif$/i, '.webp')} type="image/webp" />
      ) : (
        <source srcSet={src} type="image/webp" />
      )}
      <img
        src={fallbackSrc || src}
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
