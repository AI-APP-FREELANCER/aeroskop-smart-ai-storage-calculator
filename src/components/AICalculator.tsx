"use client";
import { useState, useEffect } from "react";
import RecommendationModal from "@/components/RecommendationModal";
import { AIRecommendationResponse } from "@/lib/types";
import { calculateAccurateStorage } from "@/lib/storageCalculations";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";
import { analyticsService } from "@/services/analyticsService";
import { formatStorage } from "@/lib/storageFormatter";

interface CalculatorForm {
  cameras: number | '';      // Allow empty string for UX
  resolution: string;
  fps: number;
  codec: string;
  quality: string;           // NEW: Low, Medium, High
  activityPercent: number;   // NEW: 0-100 percentage
  recordingHoursPerDay: number; // NEW: 1-24 hours
  retentionDays: number;
  recordingMode: string;
}

interface CalculationResult {
  totalStorageTB: number;
  dailyStorageTB: number;
  dailyStoragePerCameraGB: number; // NEW
  totalBitrateMbps: number;
  bitratePerCamera: number;   // NEW
  adjustedBitrate: number;    // NEW
  overhead: number;           // NEW
  aiInsights: any;
  optimizationSuggestions: any;
  riskAssessment: any;
}

interface AICalculatorProps {
  onInteraction?: () => void;
  onAIRecommendations?: (recommendations: AIRecommendationResponse) => void;
  compact?: boolean;
}

export default function AICalculator({ onInteraction, onAIRecommendations }: AICalculatorProps) {
  const [formData, setFormData] = useState<CalculatorForm>({
    cameras: 4,
    resolution: "4K",
    fps: 30,
    codec: "H.265",
    quality: "Medium",        // NEW: Default quality
    activityPercent: 70,      // NEW: Default 70% activity
    recordingHoursPerDay: 24, // NEW: Default 24 hours
    retentionDays: 30,
    recordingMode: "continuous"
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationResponse | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  // Analytics tracking
  const analyticsSessionId = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const { analyticsData, trackParameterChange, trackAction, startTracking, stopTracking } = useAnalyticsTracker({
    sessionId: analyticsSessionId,
    onDataChange: (data) => {
      // Send analytics data to backend
      analyticsService.trackUserBehavior(data as any);
    }
  });

  // Create session on component mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_type: 'guest',
            ip_address: '127.0.0.1',
            user_agent: navigator.userAgent
          })
        });
        
        if (response.ok) {
          const session = await response.json();
          setSessionId(session.id);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };

    createSession();
  }, []);

  const handleInputChange = (field: keyof CalculatorForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Track parameter changes for analytics
    trackParameterChange(field, value);
    trackAction(`parameter_change_${field}`);
  };

  const calculateStorage = () => {
    // Validate cameras is a number
    const cameras = typeof formData.cameras === 'number' ? formData.cameras : 1;
    
    // Use the new accurate calculation function
    const result = calculateAccurateStorage({
      cameras: cameras,
      resolution: formData.resolution,
      fps: formData.fps,
      codec: formData.codec,
      quality: formData.quality,
      recordingHoursPerDay: formData.recordingHoursPerDay,
      activityPercent: formData.activityPercent,
      retentionDays: formData.retentionDays
    });

    return {
      totalBitrateMbps: result.totalBitrateMbps,
      dailyStorageTB: result.dailyStoragePerCameraGB * cameras / 1000, // Convert GB to TB
      totalStorageTB: result.totalStorageTB,
      dailyStoragePerCameraGB: result.dailyStoragePerCameraGB,
      bitratePerCamera: result.bitratePerCamera,
      adjustedBitrate: result.adjustedBitrate,
      overhead: result.overhead
    };
  };


  const generateAIInsights = (storage: any) => {
    const insights = [];
    const suggestions = [];
    const riskAssessment = [];

    // Storage insights
    if (storage.totalStorageTB > 100) {
      insights.push("Large storage requirement detected - consider enterprise solutions");
    } else if (storage.totalStorageTB < 10) {
      insights.push("Small-scale deployment - efficient solutions available");
    }

    // Optimization suggestions
    if (formData.codec === "H.264") {
      suggestions.push("Consider H.265 codec for 50% storage reduction");
    }
    if (formData.recordingMode === "continuous" && formData.activityPercent < 30) {
      suggestions.push("Motion-based recording could reduce storage by 70%");
    }
    if (formData.retentionDays > 90) {
      suggestions.push("Consider tiered storage for long-term retention");
    }

    // Risk assessment
    if (storage.totalBitrateMbps > 1000) {
      riskAssessment.push("High bandwidth requirements - ensure network capacity");
    }
    if (formData.retentionDays > 365) {
      riskAssessment.push("Long retention period - plan for data lifecycle management");
    }

    return { insights, suggestions, riskAssessment };
  };

  const handleCalculate = async () => {
    console.log('Calculate button clicked!');
    console.log('Form data:', formData);
    
    // Validate cameras field
    const cameras = typeof formData.cameras === 'number' ? formData.cameras : 0;
    if (formData.cameras === '' || cameras < 1) {
      alert('Please enter a valid number of cameras');
      return;
    }
    
    // Track calculation start
    trackAction('calculation_start');
    setIsCalculating(true);
    
    try {
      // First perform local calculation
      const storage = calculateStorage();
      const ai = generateAIInsights(storage);

      const calculationResult: CalculationResult = {
        totalStorageTB: storage.totalStorageTB,
        dailyStorageTB: storage.dailyStorageTB,
        dailyStoragePerCameraGB: storage.dailyStoragePerCameraGB,
        totalBitrateMbps: storage.totalBitrateMbps,
        bitratePerCamera: storage.bitratePerCamera,
        adjustedBitrate: storage.adjustedBitrate,
        overhead: storage.overhead,
        aiInsights: ai.insights,
        optimizationSuggestions: ai.suggestions,
        riskAssessment: ai.riskAssessment
      };

      setResult(calculationResult);

      // Call AI recommendation API
      try {
        console.log('Calling AI recommendation API...');
        const cameras = typeof formData.cameras === 'number' ? formData.cameras : 1;
        const requestBody = {
          cameras: cameras,
          resolution: formData.resolution,
          fps: formData.fps,
          codec: formData.codec,
          quality: formData.quality,
          activity_percent: formData.activityPercent,
          recording_hours_per_day: formData.recordingHoursPerDay,
          retention_days: formData.retentionDays,
          recording_mode: formData.recordingMode,
          // Pass calculated values to ensure accurate display
          calculated_storage_tb: storage.totalStorageTB,
          calculated_daily_storage_tb: storage.dailyStorageTB,
          calculated_bitrate_mbps: storage.totalBitrateMbps
        };
        
        console.log('Sending request body:', requestBody);
        
        const aiResponse = await fetch('/api/ai-storage-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        console.log('AI Response status:', aiResponse.status);

        if (aiResponse.ok) {
          const aiRecommendations = await aiResponse.json();
          console.log('AI Recommendations received:', aiRecommendations);
          
          // Check if this is a fallback response
          if (aiRecommendations.is_fallback) {
            console.warn('📊 Using demo recommendations:', aiRecommendations.fallback_reason);
          }
          
          setAiRecommendations(aiRecommendations);
          setShowRecommendationModal(true);
          
          // Track recommendation generation
          trackAction('recommendation_generated');
          analyticsService.trackRecommendationGenerated(
            analyticsSessionId,
            formData,
            {
              productName: aiRecommendations.recommendation.product_name,
              storageTB: aiRecommendations.calculations.total_storage_tb,
              bitrate: aiRecommendations.calculations.total_bitrate_mbps
            }
          );
          
          // Show subtle notice if in fallback mode (don't block workflow)
          if (aiRecommendations.is_fallback) {
            console.log('💡 Tip: AI recommendations are using fallback mode. Please check Gemini API configuration.');
          }
          
          // Pass to parent component
          if (onAIRecommendations) {
            onAIRecommendations(aiRecommendations);
          }
        } else {
          const errorText = await aiResponse.text();
          console.error('AI recommendation failed:', errorText);
          
          // Don't block user - just log error
          console.warn('⚠️  Unable to generate recommendations at this time');
        }
      } catch (aiError) {
        console.error('AI recommendation error:', aiError);
        // Don't block user - just log error
        console.warn('⚠️  Unable to generate recommendations at this time');
      }

      // Save to database if session exists
      if (sessionId) {
        try {
          await fetch('/api/ai-recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              cameras: cameras,
              resolution: formData.resolution,
              fps: formData.fps,
              codec: formData.codec,
              activity_percent: formData.activityPercent,
              retention_days: formData.retentionDays,
              recording_mode: formData.recordingMode,
              total_storage_tb: storage.totalStorageTB,
              daily_storage_tb: storage.dailyStorageTB,
              total_bitrate_mbps: storage.totalBitrateMbps,
              ai_insights: JSON.stringify(ai.insights),
              optimization_suggestions: JSON.stringify(ai.suggestions),
              risk_assessment: JSON.stringify(ai.riskAssessment)
            })
          });

          // Track activity
          await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              activity_type: 'calculator_used',
              page_url: window.location.href,
              activity_data: {
                form_data: formData,
                results: calculationResult
              }
            })
          });
        } catch (error) {
          console.error('Failed to save calculation:', error);
        }
      }

    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputInteraction = () => {
    if (onInteraction) {
      onInteraction();
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            {/* Number of Cameras */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Cameras
              </label>
              <input
                type="text"
                value={formData.cameras}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and empty
                  if (value === '' || /^\d+$/.test(value)) {
                    handleInputChange('cameras', value === '' ? '' : parseInt(value));
                    handleInputInteraction();
                  }
                }}
                onBlur={(e) => {
                  // Ensure valid number on blur
                  if (formData.cameras === '' || formData.cameras < 1) {
                    handleInputChange('cameras', 1);
                  }
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of cameras"
              />
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Resolution
              </label>
              <select
                value={formData.resolution}
                onChange={(e) => {
                  handleInputChange('resolution', e.target.value);
                  handleInputInteraction();
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
                <option value="8K">8K</option>
              </select>
            </div>

            {/* FPS */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Frames Per Second (FPS)
              </label>
              <select
                value={formData.fps}
                onChange={(e) => {
                  handleInputChange('fps', parseInt(e.target.value));
                  handleInputInteraction();
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={15}>15 FPS</option>
                <option value={30}>30 FPS</option>
                <option value={60}>60 FPS</option>
              </select>
            </div>

            {/* Codec */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Video Codec
              </label>
              <select
                value={formData.codec}
                onChange={(e) => {
                  handleInputChange('codec', e.target.value);
                  handleInputInteraction();
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="H.264">H.264</option>
                <option value="H.265">H.265</option>
              </select>
            </div>

            {/* Video Quality */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Video Quality
              </label>
              <select
                value={formData.quality}
                onChange={(e) => {
                  handleInputChange('quality', e.target.value);
                  handleInputInteraction();
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low (0.75x bitrate)</option>
                <option value="Medium">Medium (1.0x bitrate)</option>
                <option value="High">High (1.25x bitrate)</option>
              </select>
            </div>

            {/* Recording Hours Per Day */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recording Hours: {formData.recordingHoursPerDay} hrs/day
              </label>
              <input
                type="range"
                min="1"
                max="24"
                value={formData.recordingHoursPerDay}
                onChange={(e) => {
                  handleInputChange('recordingHoursPerDay', parseInt(e.target.value));
                  handleInputInteraction();
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 hr</span>
                <span>24 hrs</span>
              </div>
            </div>

            {/* Activity Percentage */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Motion Activity: {formData.activityPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.activityPercent}
                onChange={(e) => {
                  handleInputChange('activityPercent', parseInt(e.target.value));
                  handleInputInteraction();
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Static</span>
                <span>Active</span>
              </div>
            </div>

            {/* Retention Days */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Retention Period (Days)
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                value={formData.retentionDays}
                onChange={(e) => {
                  handleInputChange('retentionDays', parseInt(e.target.value) || 30);
                  handleInputInteraction();
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter retention period in days"
              />
            </div>

            {/* Recording Mode */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recording Mode
              </label>
              <select
                value={formData.recordingMode}
                onChange={(e) => {
                  handleInputChange('recordingMode', e.target.value);
                  handleInputInteraction();
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="continuous">Continuous</option>
                <option value="motion">Motion-based</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Storage Needs'}
          </button>
        </div>
      </div>

      {/* Calculation Results Display */}
      {result && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">Calculation Breakdown</h3>
          
          {/* Input Summary */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Input Parameters</h4>
              <ul className="text-sm space-y-1">
                <li>Cameras: {typeof formData.cameras === 'number' ? formData.cameras : 0}</li>
                <li>Resolution: {formData.resolution} @ {formData.fps} fps</li>
                <li>Codec: {formData.codec}</li>
                <li>Quality: {formData.quality}</li>
                <li>Recording: {formData.recordingHoursPerDay} hrs/day</li>
                <li>Activity: {formData.activityPercent}%</li>
                <li>Retention: {formData.retentionDays} days</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Calculation Results</h4>
              <ul className="text-sm space-y-1">
                <li>Bitrate/Camera: {result.bitratePerCamera.toFixed(2)} Mbps</li>
                <li>Daily/Camera: {result.dailyStoragePerCameraGB.toFixed(2)} GB</li>
                <li>Total Bitrate: {result.totalBitrateMbps.toFixed(1)} Mbps</li>
                <li className="font-bold text-blue-600">
                  Total Storage: {formatStorage(result.totalStorageTB)}
                </li>
                <li className="text-xs text-gray-500">
                  (includes 20% overhead)
                </li>
              </ul>
            </div>
          </div>

          {/* Professional Calculation Steps */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-slate-900 mb-4">
              Professional Storage Calculation
            </h4>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div>
                <h5 className="font-semibold text-blue-600 mb-2">1. Base Bitrate</h5>
                <p className="text-sm text-slate-600">
                  {result.bitratePerCamera.toFixed(2)} Mbps/camera
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Based on {formData.resolution} @ {formData.fps}fps, {formData.quality} quality
                </p>
              </div>
              
              {/* Step 2 */}
              <div>
                <h5 className="font-semibold text-green-600 mb-2">2. Compression</h5>
                <p className="text-sm text-slate-600">
                  {formData.codec} = {formData.codec === 'H.265' ? '0.6x' : '1.0x'} reduction
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Adjusted: {result.adjustedBitrate.toFixed(2)} Mbps
                </p>
              </div>
              
              {/* Step 3 */}
              <div>
                <h5 className="font-semibold text-purple-600 mb-2">3. Daily Storage</h5>
                <p className="text-sm text-slate-600">
                  {result.dailyStoragePerCameraGB.toFixed(2)} GB/camera/day
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Recording {formData.recordingHoursPerDay} hrs, {formData.activityPercent}% active
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">Final Calculation</h5>
              <p className="text-sm text-slate-700">
                {typeof formData.cameras === 'number' ? formData.cameras : 0} cameras × {result.dailyStoragePerCameraGB.toFixed(2)} GB/day × {formData.retentionDays} days 
                × 1.2 overhead = <span className="font-bold text-blue-600 text-lg">
                  {formatStorage(result.totalStorageTB)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation Modal - Only show when we have actual AI recommendations */}
      {showRecommendationModal && aiRecommendations && (
        <RecommendationModal
          isOpen={showRecommendationModal}
          onClose={() => setShowRecommendationModal(false)}
          recommendations={aiRecommendations}
        />
      )}
    </>
  );
}