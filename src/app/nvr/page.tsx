'use client';

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import ProductBanner from "@/components/ProductBanner";

// Helper function to get image path based on product model
const getImagePath = (model: string): string => {
  // Map models to their actual image filenames
  const imageMap: { [key: string]: string } = {
    'AF-64128': 'AF-64128.webp',
    'AF-3264': 'AF-3264.webp',
    'AF-1632': 'AF-1632.webp'
  };
  
  const filename = imageMap[model] || `${model}.webp`;
  return `/images/NVR/${filename}`;
};

// Product data - simplified for clean card design
const nvrProducts = [
  {
    id: 1,
    name: "Aeroflex NVR",
    model: "AF-64128",
    tagline: "High-performance NVR",
    benefit: "Enterprise-grade NVR with extensive channel capacity and storage"
  },
  {
    id: 2,
    name: "Aeroflex NVR",
    model: "AF-3264",
    tagline: "Compact yet Powerful NVR",
    benefit: "Space-efficient design with professional surveillance capabilities"
  },
  {
    id: 3,
    name: "Aeroflex NVR",
    model: "AF-1632",
    tagline: "32 Channel NVR-POE",
    benefit: "Integrated PoE support for streamlined installation and management"
  }
];

export default function NVR() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-sky-50/50 to-white">
      <Header />
      
      {/* Category-Specific Product Banner (Top) */}
      <ProductBanner category="NVR" imagePath="/images/NVR/AF-64128.webp" caption="Enterprise-Grade NVR Solutions: High-Performance Video Management." />
      
      {/* Page Title & Introduction Section */}
      <section className="pt-12 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Aeroflex NVR
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Professional-grade Network Video Recorders engineered for reliability, performance, and exceptional value. 
              Our diverse range of high-performance NVR systems includes compact and enterprise models, all designed to 
              deliver seamless video recording, playback, and integration with various IP cameras for comprehensive 
              security coverage in any environment.
            </p>
          </div>
        </div>
      </section>

      {/* Product Catalog Section - Simplified Card Design */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nvrProducts.map((product) => (
              <Link
                key={product.id}
                href={`/nvr/${product.model}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-300 group cursor-pointer block"
              >
                {/* Product Content - Reordered */}
                <div className="p-5 relative">
                  {/* 1. Product Category (Main Title) */}
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  
                  {/* 2. Product Model (Secondary Identifier) */}
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {product.model}
                  </p>
                  
                  {/* 3. Product Image - Smaller (10% reduction) */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 rounded-lg mb-3">
                    <Image
                      src={getImagePath(product.model)}
                      alt={`${product.name} ${product.model}`}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-110 p-3"
                      style={{ transform: 'scale(0.9)' }}
                    />
                  </div>
                  
                  {/* 4. High-Level Catchy Text/Feature */}
                  <p className="text-slate-700 font-semibold mb-3 text-sm leading-relaxed">
                    {product.tagline}
                  </p>
                  
                  {/* 5. Impactful Benefit Tagline */}
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">
                    {product.benefit}
                  </p>
                  
                  {/* 6. Professional Arrow Icon */}
                  <div className="flex items-center justify-end">
                    <svg 
                      className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 py-12 backdrop-blur">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
          <div>
            <div className="relative h-8 w-36 mb-4">
              <Image 
                src="/images/company_logo/aeroskop_logo.png" 
                alt="Aeroskop" 
                fill 
                className="object-contain" 
              />
            </div>
            <p className="text-sm text-slate-600 max-w-xs">
              Aeroskop manufactures high‑performance security products for reliable, scalable surveillance.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-3">Products</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/security-cameras" className="hover:text-slate-900">Security Cameras</a></li>
              <li><a href="/nvr" className="hover:text-slate-900">NVR</a></li>
              <li><a href="/poeswitches" className="hover:text-slate-900">PoE Switches</a></li>
              <li><a href="/rhinoservers" className="hover:text-slate-900">Rhino Servers</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-3">Company</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/about" className="hover:text-slate-900">About</a></li>
              <li><a href="/contact" className="hover:text-slate-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-3">Get in touch</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="tel:+97377992203" className="hover:text-slate-900">Tel: +973 77992203</a></li>
              <li><a href="mailto:info@aeroskop.com" className="hover:text-slate-900">info@aeroskop.com</a></li>
              <li>Umm Al Hassam, Kingdom of Bahrain</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 border-t border-slate-200 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Aeroskop. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
