'use client';

import Header from '@/components/Header';
import UnifiedAICalculator from '@/components/UnifiedAICalculator';

export default function UnifiedCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <UnifiedAICalculator />
      </main>
    </div>
  );
}
