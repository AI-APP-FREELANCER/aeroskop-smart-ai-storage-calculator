'use client';

import { useState } from 'react';
import { AIRecommendationResponse } from '@/lib/types';
import { generatePDFReport } from '@/lib/pdfGenerator';
import { formatStorage, formatDailyStorage } from '@/lib/storageFormatter';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: AIRecommendationResponse;
}

export default function RecommendationModal({ 
  isOpen, 
  onClose, 
  recommendations 
}: RecommendationModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDFReport(recommendations);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareEmail = () => {
    const subject = 'Storage Recommendation Report - Aeroskop';
    const body = `Hi,

Please find attached the storage recommendation report based on your requirements:

${recommendations.summary}

Best regards,
Aeroskop Team`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleWhatsAppConsultation = () => {
    const message = `Hi, I'd like to schedule a consultation for storage solutions based on the AI recommendations I received.`;
    window.open(`https://wa.me/97377992203?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI Storage Recommendations</h2>
              <p className="text-slate-600 mt-1">
                {recommendations.cached ? 'Cached recommendation' : 'Fresh AI analysis'} • 
                {formatStorage(Number(recommendations.calculations.total_storage_tb || 0), 1)} total storage needed
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Powered by AI
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Demo Mode Badge */}
        {recommendations.is_fallback && (
          <div className="mx-6 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              📊 Demo Mode: Using intelligent mock recommendations. Please check Gemini API configuration for AI-powered analysis.
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Single Recommended Solution */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 relative">
              <div className="absolute -top-4 left-8">
                <span className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold rounded-full">
                  Recommended Solution
                </span>
              </div>
              <div className="pt-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {recommendations.recommendation.product_name}
                </h3>
                <p className="text-slate-600 text-lg mb-6">
                  {recommendations.recommendation.why_recommended}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Channels:</span>
                      <span className="font-semibold text-lg">{recommendations.recommendation.channel_capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Storage:</span>
                      <span className="font-semibold text-lg">{recommendations.recommendation.storage_capacity_tb} TB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">CPU:</span>
                      <span className="font-semibold text-sm">{recommendations.recommendation.cpu}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">RAM:</span>
                      <span className="font-semibold text-lg">{recommendations.recommendation.ram}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">RAID Support:</span>
                      <span className="font-semibold text-sm">{recommendations.recommendation.raid_support}</span>
                    </div>
                  </div>
                </div>

                {/* Key Benefits */}
                {recommendations.recommendation.key_benefits && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-4">Key Benefits</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {recommendations.recommendation.key_benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-700 font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-slate-900">Advantages</h4>
                    <ul className="text-slate-600 space-y-2">
                      {recommendations.recommendation.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-slate-900">Considerations</h4>
                    <ul className="text-slate-600 space-y-2">
                      {recommendations.recommendation.cons.map((con, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Best For:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.recommendation.suitable_for.map((use, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Suggestions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Optimization Suggestions
              </h4>
              <ul className="text-sm text-slate-600 space-y-2">
                {recommendations.optimization.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Technical Insights
              </h4>
              <ul className="text-sm text-slate-600 space-y-2">
                {recommendations.optimization.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Storage Calculation Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Professional Storage Calculation
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">1. Base Bitrate</h4>
                <p className="text-sm text-slate-600">
                  {Number(recommendations.calculations.bitrate_per_camera || 0).toFixed(2)} Mbps/camera
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Industry standard bitrate calculation
                </p>
              </div>
              
              {/* Step 2 */}
              <div>
                <h4 className="font-semibold text-green-600 mb-2">2. Compression</h4>
                <p className="text-sm text-slate-600">
                  Applied compression optimization
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Adjusted: {Number(recommendations.calculations.adjusted_bitrate || 0).toFixed(2)} Mbps
                </p>
              </div>
              
              {/* Step 3 */}
              <div>
                <h4 className="font-semibold text-purple-600 mb-2">3. Daily Storage</h4>
                <p className="text-sm text-slate-600">
                  {Number(recommendations.calculations.daily_storage_per_camera_gb || 0).toFixed(2)} GB/camera/day
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Per camera daily storage requirement
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Final Calculation</h4>
              <p className="text-sm text-slate-700">
                Total Storage: <span className="font-bold text-blue-600 text-lg">
                  {formatStorage(Number(recommendations.calculations.total_storage_tb || 0))}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  (includes {Number(recommendations.calculations.overhead_factor || 1.2).toFixed(1)}x overhead)
                </span>
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatStorage(Number(recommendations.calculations.total_storage_tb || 0), 1)}</div>
                <div className="text-sm text-slate-600">Total Storage Needed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatDailyStorage(Number(recommendations.calculations.daily_storage_tb || 0))}</div>
                <div className="text-sm text-slate-600">Daily Storage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Number(recommendations.calculations.total_bitrate_mbps || 0).toFixed(1)} Mbps</div>
                <div className="text-sm text-slate-600">Total Bitrate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{recommendations.calculations.retention_days} days</div>
                <div className="text-sm text-slate-600">Retention Period</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-6 rounded-b-2xl">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Report
                </>
              )}
            </button>
            
            <button
              onClick={handleShareEmail}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share via Email
            </button>
            
            <button
              onClick={handleWhatsAppConsultation}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Schedule Consultation
            </button>
            
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
