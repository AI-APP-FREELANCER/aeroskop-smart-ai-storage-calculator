'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { DO_ASSET_BASE_URL } from '@/lib/constants';

interface HeroBannerProps {
  imagePath?: string;
  caption?: string;
  showTextOverlay?: boolean;
  excludeBanner?: string; // Banner to exclude from random selection
}

// Available banners for random selection (excluding Hero-Banner-Home-2.webp which is reserved for Home Page)
const availableBanners = [
  `${DO_ASSET_BASE_URL}/images/Hero-Banners/Hero-Banner-Home-1.webp`,
  `${DO_ASSET_BASE_URL}/images/Hero-Banners/Hero-Banner-Home-1-1.webp`,
  `${DO_ASSET_BASE_URL}/images/Hero-Banners/Hero-Banner-Home-1-2.webp`,
  `${DO_ASSET_BASE_URL}/images/Hero-Banners/Hero-Banner-Home-1-3.webp`,
];

export default function HeroBanner({ 
  imagePath, 
  caption, 
  showTextOverlay = false,
  excludeBanner
}: HeroBannerProps) {
  // Use a stable default for SSR, then update on client
  const [selectedBanner, setSelectedBanner] = useState(() => {
    if (imagePath) {
      return imagePath;
    }
    // Use first banner as default for SSR (prevents hydration mismatch)
    const bannersToChooseFrom = excludeBanner 
      ? availableBanners.filter(banner => banner !== excludeBanner)
      : availableBanners;
    return bannersToChooseFrom[0] || availableBanners[0];
  });

  // Randomly select a banner on client-side only (after hydration)
  useEffect(() => {
    if (!imagePath) {
      // Filter out excluded banner if provided
      const bannersToChooseFrom = excludeBanner 
        ? availableBanners.filter(banner => banner !== excludeBanner)
        : availableBanners;
      
      // Random selection from available banners (client-side only)
      const randomIndex = Math.floor(Math.random() * bannersToChooseFrom.length);
      setSelectedBanner(bannersToChooseFrom[randomIndex] || availableBanners[0]);
    }
  }, [imagePath, excludeBanner]);

  return (
    <div className="w-full my-6 md:my-8 px-0">
      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:scale-[1.01]" style={{ aspectRatio: '4/1', minHeight: '200px' }}>
        <Image
          src={selectedBanner}
          alt={caption || "Hero Banner"}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        
        {/* Text Overlay (if enabled) */}
        {showTextOverlay && caption && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-transparent" />
            <div className="relative z-10 text-center px-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                {caption}
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

