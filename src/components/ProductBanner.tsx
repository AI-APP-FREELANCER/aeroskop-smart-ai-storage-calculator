'use client';

import Image from 'next/image';
import { getBannerData, getCategoryBanner, contentFetchIdToImagePath } from '@/lib/productBanners';

interface ProductBannerProps {
  productId?: string;
  category?: string;
  imagePath?: string;
  caption?: string;
}

export default function ProductBanner({ productId, category, imagePath: providedImagePath, caption: providedCaption }: ProductBannerProps) {
  // Get banner data based on productId or category
  const bannerData = productId 
    ? getBannerData(productId)
    : category 
      ? getCategoryBanner(category)
      : null;

  // Determine image path: use provided imagePath, or convert from banner data, or return null
  let imagePath: string | null = null;
  if (providedImagePath) {
    imagePath = providedImagePath;
  } else if (bannerData) {
    imagePath = contentFetchIdToImagePath(bannerData.contentFetchId);
  }

  // If no image path available, return null (don't render anything)
  if (!imagePath) {
    return null;
  }

  // Determine caption: use provided caption, or use banner data caption
  const caption = providedCaption || bannerData?.caption || '';
  const altText = bannerData?.product || 'Product';

  return (
    <div className="w-full my-0 px-0">
      <div 
        className="relative w-full overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:scale-[1.01] bg-slate-100"
        style={{ aspectRatio: '4/1', minHeight: '200px' }}
      >
        {/* Background Image - Use object-contain to show full product without cropping */}
        <Image
          src={imagePath}
          alt={altText}
          fill
          className="object-contain p-4"
          priority
          sizes="100vw"
        />
        
        {/* Dark Overlay for Text Legibility - Lighter overlay to show product better */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
        
        {/* Caption Text - Bottom Center */}
        <div className="absolute inset-0 flex items-end justify-center z-10 pb-8 md:pb-12">
          <div className="text-center px-4 max-w-4xl">
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight drop-shadow-lg">
              {caption}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

