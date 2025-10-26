'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, Sparkles, ArrowRight } from 'lucide-react';

export default function FloatingAICalculator() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href="/unified-calculator">
      <div
        className="fixed bottom-8 right-8 z-50 group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Button */}
        <div className="relative">
          {/* Background Circle */}
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          
          {/* Expanding Label */}
          <div
            className={`absolute right-20 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg px-4 py-2 transition-all duration-300 whitespace-nowrap ${
              isHovered 
                ? 'opacity-100 translate-x-0 scale-100' 
                : 'opacity-0 translate-x-4 scale-95'
            }`}
          >
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Try Smart AI Calculator</span>
              <ArrowRight className="w-3 h-3 text-blue-600" />
            </div>
            
            {/* Arrow pointing to button */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-l-4 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
        
        {/* Ripple Effect */}
        <div className={`absolute inset-0 rounded-full bg-blue-400 opacity-20 transition-all duration-500 ${
          isHovered ? 'scale-150' : 'scale-100'
        }`}></div>
      </div>
    </Link>
  );
}
