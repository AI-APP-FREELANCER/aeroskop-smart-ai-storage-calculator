import Header from '@/components/Header';
import EnhancedUnifiedAICalculator from '@/components/EnhancedUnifiedAICalculator';

export default function UnifiedCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <EnhancedUnifiedAICalculator />
      </main>
    </div>
  );
}
