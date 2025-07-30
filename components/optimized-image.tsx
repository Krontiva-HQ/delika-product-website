'use client';

import Image from 'next/image';
import { getOptimizedImageProps, logLCPImageWarning } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  isAboveFold?: boolean;
  isHeroImage?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className = "",
  isAboveFold = false,
  isHeroImage = false,
  priority: explicitPriority,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  // Determine if this image should have priority
  const shouldHavePriority = explicitPriority !== undefined 
    ? explicitPriority 
    : isAboveFold || isHeroImage || src.includes('hero') || src.includes('banner') || src.includes('header');

  // Log warning for LCP images without priority
  if (shouldHavePriority && explicitPriority === false) {
    logLCPImageWarning(src, 'OptimizedImage');
  }

  const imageProps = {
    src,
    alt,
    priority: shouldHavePriority,
    sizes: sizes || (fill ? "100vw" : undefined),
    className,
    onLoad,
    onError,
    ...props
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return (
    <Image
      {...imageProps}
      width={width || 300}
      height={height || 200}
    />
  );
} 