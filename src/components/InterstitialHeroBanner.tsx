'use client';

import Image from 'next/image';

export default function InterstitialHeroBanner() {
  return (
    <div className="w-full my-12 md:my-16 px-0">
      <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:scale-[1.01]" style={{ aspectRatio: '4/1', minHeight: '200px' }}>
        <Image
          src="/images/Hero-Banners/Hero-Banner-Home-2.png"
          alt="Future-Proof Surveillance: End-to-End Encryption and PoE+"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
    </div>
  );
}

