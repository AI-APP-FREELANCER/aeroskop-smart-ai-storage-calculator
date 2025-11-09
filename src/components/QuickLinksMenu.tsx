'use client';

import { useState } from 'react';
import AICalculator from './AICalculator';
import RecommendationModal from './RecommendationModal';
import { AIRecommendationResponse } from '@/lib/types';

interface QuickLinksMenuProps {
  showCalculator?: boolean;
}

export default function QuickLinksMenu({ showCalculator = true }: QuickLinksMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationResponse | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  const handleCalculatorSubmit = (recommendations: AIRecommendationResponse) => {
    setAiRecommendations(recommendations);
    setShowRecommendationModal(true);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleMenu}
        className={`fixed right-6 top-1/2 transform -translate-y-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'rotate-45' : ''
        }`}
        aria-label="Quick Links Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">AI Storage Calculator</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            Get intelligent storage recommendations for your surveillance system
          </p>
        </div>

        {/* Calculator Content */}
        <div className="p-6 h-full overflow-y-auto">
          {showCalculator ? (
            <AICalculator 
              onAIRecommendations={handleCalculatorSubmit}
              compact={true}
            />
          ) : (
            <div className="text-center text-gray-500">
              <p>Quick Links Menu</p>
              <p className="text-sm mt-2">Additional options coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendation Modal */}
      {showRecommendationModal && aiRecommendations && (
        <RecommendationModal
          recommendations={aiRecommendations}
          onClose={() => setShowRecommendationModal(false)}
          isOpen={showRecommendationModal}
        />
      )}
    </>
  );
}
