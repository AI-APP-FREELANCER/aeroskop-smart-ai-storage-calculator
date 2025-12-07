'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, MessageSquare, Send, Bot, User, AlertCircle, X, GitCompare, Download, FileText, FileSpreadsheet, File } from 'lucide-react';
// Note: Storage calculations are now done by Gemini AI, not locally
import { generateEnhancedPDFReport } from '@/lib/pdfGenerator';
import { generateExcelReport } from '@/lib/excelGenerator';
import { generateCSVReport } from '@/lib/csvGenerator';
import { AIRecommendationResponse, CalculatorForm, EnhancedStorageCalculation } from '@/lib/types';
import { formatStorage, formatDailyStorage, formatDailyStorageAlwaysGB } from '@/lib/storageFormatter';
import LoginModal from '@/components/LoginModal';

interface EnhancedUnifiedAICalculatorProps {
  className?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  metadata?: {
    resultId?: string;
    paramsHash?: string;
    isSystemMessage?: boolean;
  };
}

export default function EnhancedUnifiedAICalculator({ className = '' }: EnhancedUnifiedAICalculatorProps) {
  // Calculator states
  const [formData, setFormData] = useState<CalculatorForm>({
    cameras: '',
    resolution: '1080p',
    fps: 30,
    codec: 'H.265',
    quality: 'Medium',
    activityPercent: 70,
    recordingHoursPerDay: 24,
    retentionDays: 30,
    recordingMode: 'continuous',
    // New fields
    customFps: undefined,
    customBitrate: undefined,
    numberOfServers: undefined,
    hddPerServer: undefined,
    driveCapacityTB: undefined,
    serverModel: undefined,
    preRecordSeconds: 2,
    postRecordSeconds: 5
  });

  const [calculationResult, setCalculationResult] = useState<EnhancedStorageCalculation | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useCustomFps, setUseCustomFps] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resultHistory, setResultHistory] = useState<Array<{
    id: string;
    params: CalculatorForm;
    result: any;
    recommendations: AIRecommendationResponse;
    timestamp: Date;
  }>>([]);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [sessionId] = useState('enhanced-session-' + Date.now());

  // User capture states
  const [userCaptured, setUserCaptured] = useState(() => {
    // Check localStorage on component mount
    if (typeof window !== 'undefined') {
      const captured = localStorage.getItem('userCaptured') === 'true';
      console.log('🔍 Initial userCaptured state from localStorage:', captured);
      return captured;
    }
    return false;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [tempFormData, setTempFormData] = useState<CalculatorForm | null>(null);

  // Auto-scroll to results when calculations are done
  useEffect(() => {
    if (calculationResult || aiRecommendations) {
      const resultsElement = document.getElementById('results-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [calculationResult, aiRecommendations]);

  const handleInputChange = (field: keyof CalculatorForm, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // CRITICAL: Lock Recording Mode IMMEDIATELY when Motion Activity >= 90%
      if (field === 'activityPercent') {
        if (Number(value) >= 90) {
          // Force to continuous immediately
          updated.recordingMode = 'continuous';
        }
      }
      
      // Prevent changing Recording Mode if Motion Activity >= 90%
      if (field === 'recordingMode' && Number(prev.activityPercent) >= 90) {
        // Don't allow the change - keep it as 'continuous'
        updated.recordingMode = 'continuous';
      }
      
      return updated;
    });
  };

  // Enforce Recording Mode lock when Motion Activity >= 90%
  // This runs immediately when activityPercent changes
  useEffect(() => {
    if (Number(formData.activityPercent) >= 90) {
      // Force Recording Mode to 'continuous' immediately
      setFormData(prev => {
        if (prev.recordingMode !== 'continuous') {
          return {
            ...prev,
            recordingMode: 'continuous'
          };
        }
        return prev;
      });
    }
  }, [formData.activityPercent]); // Only depend on activityPercent to avoid loops

  const generateParamsHash = (params: CalculatorForm): string => {
    return btoa(JSON.stringify(params)).substring(0, 16);
  };

  const appendSystemMessage = async (message: string, metadata: any) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: message,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        isSystemMessage: true
      }
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    // Store in backend for context
    try {
      await fetch('/api/chat/append-system-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message,
          metadata
        })
      });
    } catch (error) {
      console.error('Failed to store system message:', error);
    }
  };



  const handleUserSubmit = async (userInfo: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: userInfo.firstName,
          last_name: userInfo.lastName,
          email: userInfo.email,
          country_code: userInfo.countryCode,
          phone_number: userInfo.phoneNumber,
          company: userInfo.company,
        }),
      });

      if (response.ok) {
        const user = await response.json();
        console.log('User registered successfully:', user);
        setUserCaptured(true);
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('userCaptured', 'true');
        }
        setIsLoginModalOpen(false);
        
        // Restore form data if it was saved
        if (tempFormData) {
          setFormData(tempFormData);
          setTempFormData(null);
          // Trigger calculation after user is captured
          setTimeout(() => {
            performCalculation();
          }, 100);
        }
      } else {
        const error = await response.json();
        console.error('Registration failed:', error);
        throw new Error(error.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const handleCalculate = async () => {
    console.log('🔘 Calculate button clicked');
    console.log('👤 User captured status:', userCaptured);
    
    // Check if user has been captured
    if (!userCaptured) {
      console.log('📝 User not captured, showing login modal');
      // Save current form data temporarily
      setTempFormData({ ...formData });
      // Show login modal
      setIsLoginModalOpen(true);
      return;
    }
    
    console.log('✅ User captured, proceeding with calculation');
    // User is captured, proceed with calculation
    await performCalculation();
  };

  const performCalculation = async () => {
    // Front-end validation with guardrails
    const cameras = Number(formData.cameras) || 1;
    const activityPercent = formData.activityPercent || 1;
    const retentionDays = formData.retentionDays || 1;
    const recordingHoursPerDay = formData.recordingHoursPerDay || 1;
    const customBitrate = formData.customBitrate || undefined;
    
    if (!formData.cameras || cameras <= 0) {
      alert('Please enter a valid number of cameras');
      return;
    }
    
    // Validate critical fields - apply guardrails
    if (cameras === 0) {
      alert('Number of cameras cannot be 0. Using default value of 1.');
      return;
    }
    
    if (activityPercent === 0) {
      alert('Activity level cannot be 0%. Using default value of 1%.');
      return;
    }
    
    if (retentionDays === 0) {
      alert('Retention days cannot be 0. Using default value of 1 day.');
      return;
    }
    
    if (recordingHoursPerDay === 0) {
      alert('Recording hours per day cannot be 0. Using default value of 1 hour.');
      return;
    }
    
    if (customBitrate !== undefined && customBitrate <= 0) {
      alert('Custom bitrate cannot be 0 or negative. Please enter a valid bitrate.');
      return;
    }

    // Clear previous results to ensure fresh display
    setIsCalculating(true);
    setCalculationResult(null);
    setAiRecommendations(null);

    try {
      // Use custom FPS if available, otherwise use default FPS
      const effectiveFps = useCustomFps && formData.customFps ? formData.customFps : formData.fps;
      const effectiveBitrate = customBitrate || undefined;
      
      // Prepare final payload with validated values
      const payload = {
        cameras: cameras,
        resolution: formData.resolution,
        fps: effectiveFps,
        codec: formData.codec,
        quality: 'Medium',
        activity_percent: activityPercent,
        recording_hours_per_day: recordingHoursPerDay,
        retention_days: retentionDays,
        recording_mode: formData.recordingMode,
        pre_record_seconds: formData.preRecordSeconds || 2,
        post_record_seconds: formData.postRecordSeconds || 5,
        custom_bitrate: effectiveBitrate,
        custom_fps: useCustomFps && formData.customFps ? formData.customFps : undefined,
        sessionId,
        userId: null
      };
      
      // Log final payload for verification
      console.log('🧮 Final payload being sent to API (with guardrails applied):', payload);
      console.log('✅ Validation check:', {
        cameras: payload.cameras > 0,
        activity_percent: payload.activity_percent > 0,
        retention_days: payload.retention_days > 0,
        recording_hours_per_day: payload.recording_hours_per_day > 0,
        custom_bitrate: payload.custom_bitrate === undefined || payload.custom_bitrate > 0
      });
      
      const response = await fetch('/api/ai-storage-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const recommendations = await response.json();
        console.log('✅ AI Recommendations received:', recommendations);
        console.log('💾 Storage TB from Gemini:', recommendations.calculations?.total_storage_tb);
        console.log('📦 Cache status:', recommendations.cached ? 'Cache Hit' : 'Cache Miss - Fresh Calculation');
        
        // Set AI recommendations (contains all calculations from Gemini)
        setAiRecommendations(recommendations);
        
        // Convert Gemini calculations to EnhancedStorageCalculation format for display
        const storageCalc: EnhancedStorageCalculation = {
          bitratePerCamera: recommendations.calculations.bitrate_per_camera,
          dailyStoragePerCameraGB: recommendations.calculations.daily_storage_per_camera_gb,
          totalStorageTB: recommendations.calculations.total_storage_tb || recommendations.calculations.total_usable_storage_tb,
          totalBitrateMbps: recommendations.calculations.total_bitrate_mbps,
          adjustedBitrate: recommendations.calculations.adjusted_bitrate,
          overhead: 0 // No longer used - removed from calculations
        };
        setCalculationResult(storageCalc);
        
        // Generate result ID and store in history
        const resultId = `result-${Date.now()}`;
        const paramsHash = generateParamsHash(formData);
        
        const resultEntry = {
          id: resultId,
          params: { ...formData },
          result: storageCalc,
          recommendations,
          timestamp: new Date()
        };
        
        setResultHistory(prev => [...prev, resultEntry]);
        
        // Store calculation context with enhanced summary
        try {
          const effectiveFps = useCustomFps && formData.customFps ? formData.customFps : formData.fps;
          const effectiveBitrate = formData.customBitrate || 4.0;
          
          const enhancedSummary = `The user's current storage calculation shows:
- Required Storage: ${formatStorage(recommendations.calculations.total_storage_tb)}
- Number of Cameras: ${formData.cameras}
- Resolution: ${formData.resolution}
- FPS: ${effectiveFps}
- Codec: ${formData.codec}
- Bitrate: ${recommendations.calculations.bitrate_per_camera.toFixed(1)} Mbps per camera
- Activity/Motion: ${formData.activityPercent}%
- Retention Period: ${formData.retentionDays} days
- Recording Mode: ${formData.recordingMode}
- Recommended Product: ${recommendations.recommendation?.product_name || 'Aeroskop solution'}
- Product Model: ${recommendations.recommendation?.product_model || 'N/A'}
- Channel Capacity: ${recommendations.recommendation?.channel_capacity || 'N/A'}
- Storage Capacity: ${recommendations.recommendation?.storage_capacity_tb || 'N/A'} TB`;

          await fetch('/api/chat/context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resultId: `${resultId}-${sessionId}`, // Include sessionId in resultId for better matching
              userId: null,
              sessionId: sessionId, // Add sessionId for direct matching
              timestamp: new Date().toISOString(),
              params: formData,
              summary: enhancedSummary,
              productMapping: {
                sku: recommendations.recommendation?.product_name || 'Unknown',
                model: recommendations.recommendation?.product_model || 'Unknown',
                channels: recommendations.recommendation?.channel_capacity || 'Unknown',
                storage: recommendations.recommendation?.storage_capacity_tb || 'Unknown',
                confidence: 0.95
              }
            })
          });
        } catch (error) {
          console.error('Failed to store calculation context:', error);
        }
        
        // Add system message to chat
        const systemMessage = `I've analyzed your requirements and found the perfect solution! You need ${formatStorage(recommendations.calculations.total_storage_tb, 1)} of storage, and I recommend the ${recommendations.recommendation?.product_name || 'Aeroskop solution'}. This system will handle your ${formData.cameras} cameras perfectly. Feel free to ask me about optimization tips, cost savings, or any questions about your surveillance setup!`;
        
        await appendSystemMessage(systemMessage, {
          resultId,
          paramsHash
        });
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', response.status, errorData);
        
        // Show graceful error with WhatsApp support
        const errorMessage = errorData.message || errorData.error || 'We encountered an issue generating recommendations';
        const shouldContactSupport = confirm(
          `${errorMessage}\n\nWould you like to contact our support team via WhatsApp for assistance?`
        );
        
        if (shouldContactSupport) {
          window.open(
            `https://wa.me/97377992203?text=I'm having trouble with the storage calculator. The error is: ${encodeURIComponent(errorMessage)}. Can you help?`,
            '_blank'
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Calculation error:', error);
      
      // Show graceful error with WhatsApp support
      const errorMessage = error.message || 'Failed to calculate storage requirements';
      const shouldContactSupport = confirm(
        `We're sorry, but we encountered an issue while calculating your storage requirements.\n\nError: ${errorMessage}\n\nWould you like to contact our support team via WhatsApp for assistance?`
      );
      
      if (shouldContactSupport) {
        window.open(
          `https://wa.me/97377992203?text=I'm having trouble with the storage calculator. Error: ${encodeURIComponent(errorMessage)}. Can you help?`,
          '_blank'
        );
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const sendChatMessage = async () => {
    if (!userInput.trim() || chatLoading) return;

    const trimmedInput = userInput.trim();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      console.log('📤 Sending chat message to API:', {
        prompt: trimmedInput.substring(0, 100) + (trimmedInput.length > 100 ? '...' : ''),
        sessionId: sessionId
      });
      
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmedInput,
          sessionId,
          pageUrl: '/unified-calculator'
        })
      });

      console.log('📥 Received response from API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Only throw error for actual HTTP errors (4xx, 5xx)
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Parsed response data:', {
        hasResponse: !!data.response,
        responseType: typeof data.response,
        responseLength: data.response?.length || 0,
        isFallback: data.isFallback,
        isRestricted: data.isRestricted,
        hasError: !!data.error
      });
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        console.error('❌ Invalid response structure: not an object', data);
        throw new Error('Invalid response format from server');
      }
      
      // Check if response text exists and is not empty
      if (!data.response || typeof data.response !== 'string' || data.response.trim().length === 0) {
        console.error('❌ Empty or invalid response text:', {
          response: data.response,
          type: typeof data.response
        });
        throw new Error('Empty response from AI');
      }
      
      // Only show error message if it's an actual error (not a fallback response)
      if (data.error) {
        console.error('❌ Error in response data:', data.error);
        throw new Error(data.error);
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.response,
        timestamp: new Date()
      };

      console.log('✅ Adding AI message to chat:', {
        messageLength: aiMessage.text.length,
        messagePreview: aiMessage.text.substring(0, 100) + '...'
      });

      setMessages(prev => [...prev, aiMessage]);
      setChatError(null); // Clear any previous errors

    } catch (err: any) {
      console.error('❌ Chat error details:', {
        errorType: err?.constructor?.name,
        errorMessage: err?.message,
        errorStack: err?.stack?.substring(0, 500),
        isNetworkError: err?.name === 'TypeError' && err?.message?.includes('fetch'),
        isHTTPError: err?.message?.includes('HTTP error')
      });
      
      // Only set error for actual failures, not for successful responses with fallback messages
      if (err?.message?.includes('HTTP error') || err?.message?.includes('Invalid response') || err?.message?.includes('Empty response')) {
        setChatError(err.message || 'Failed to get response from AI');
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'An issue occurred while fetching recommendations from the AI system. Please try again or report this inconsistency to our support team.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } else {
        // For other errors (like network issues), show a different message
        setChatError(err.message || 'Failed to connect to AI service');
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I apologize, but I encountered a connection issue. Please check your internet connection and try again.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const compareResults = () => {
    if (resultHistory.length < 2) return;
    
    const latest = resultHistory[resultHistory.length - 1];
    const previous = resultHistory[resultHistory.length - 2];
    
    const latestStorage = formatStorage(latest.result.totalStorageTB, 1);
    const previousStorage = formatStorage(previous.result.totalStorageTB, 1);
    const storageDiff = Math.abs(latest.result.totalStorageTB - previous.result.totalStorageTB);
    const storageDiffFormatted = formatStorage(storageDiff, 1);
    
    const comparisonMessage = `Here's how your two scenarios compare:

**Your Latest Setup:**
- ${latest.params.cameras} cameras → ${latestStorage} storage
- Recommended: ${latest.recommendations.recommendation?.product_name}

**Your Previous Setup:**
- ${previous.params.cameras} cameras → ${previousStorage} storage  
- Recommended: ${previous.recommendations.recommendation?.product_name}

**My Analysis:** ${latest.result.totalStorageTB > previous.result.totalStorageTB ? 'Your latest setup requires more storage' : 'Your latest setup is more efficient'} (${storageDiffFormatted} difference). ${latest.result.totalStorageTB > previous.result.totalStorageTB ? 'This is likely due to higher resolution, more cameras, or longer retention periods.' : 'Great optimization! You\'ve reduced storage needs while maintaining quality.'}`;

    const comparisonChatMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: comparisonMessage,
      timestamp: new Date(),
      metadata: { isSystemMessage: true }
    };
    
    setMessages(prev => [...prev, comparisonChatMessage]);
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className} bg-gradient-to-br from-gray-50 via-white to-blue-50/30 min-h-screen relative`}>
      {/* Loading Overlay */}
      {isCalculating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-white/50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI System is Recalculating...</h3>
                <p className="text-sm text-gray-600">Generating accurate recommendations based on your parameters</p>
                <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Storage Calculator & Assistant
        </h1>
        <p className="text-xl text-gray-600">
          Calculate your storage needs and get personalized AI recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calculator Form (2 columns) */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-lg rounded-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Storage Calculator</h2>
          </div>

          <div className="space-y-6">
            {/* Number of Cameras */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Cameras *
              </label>
              <input
                type="text"
                value={formData.cameras}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    handleInputChange('cameras', value);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleInputChange('cameras', '');
                  } else {
                    const num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                      handleInputChange('cameras', num.toString());
                    }
                  }
                }}
                className="w-full p-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 placeholder:text-gray-400 hover:border-blue-300 hover:bg-white/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                placeholder="Enter number of cameras"
              />
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution
              </label>
              <select
                value={formData.resolution}
                onChange={(e) => handleInputChange('resolution', e.target.value)}
                className="w-full p-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-white/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
              >
                <option value="720p">720p (0.92 MP)</option>
                <option value="1080p">1080p (2.07 MP)</option>
                <option value="4MP">4MP (4 MP)</option>
                <option value="4K">4K (8.29 MP)</option>
                <option value="8K">8K</option>
              </select>
            </div>

            {/* FPS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frame Rate (FPS)
              </label>
              <div className="flex gap-2">
                <select
                  value={useCustomFps ? '' : formData.fps}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setUseCustomFps(true);
                    } else {
                      setUseCustomFps(false);
                      handleInputChange('fps', parseInt(e.target.value));
                      handleInputChange('customFps', undefined);
                    }
                  }}
                  disabled={useCustomFps}
                  className="flex-1 p-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-white/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] disabled:bg-gray-300/50 backdrop-blur-sm disabled:opacity-60 transition-all"
                >
                  <option value="">Custom...</option>
                  <option value={2}>2 FPS</option>
                  <option value={4}>4 FPS</option>
                  <option value={6}>6 FPS</option>
                  <option value={12}>12 FPS</option>
                  <option value={15}>15 FPS</option>
                  <option value={20}>20 FPS</option>
                  <option value={25}>25 FPS</option>
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
                {useCustomFps && (
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.customFps || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 120) {
                        handleInputChange('customFps', value);
                      }
                    }}
                    placeholder="Custom FPS"
                    className="flex-1 p-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-white/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                  />
                )}
              </div>
              {useCustomFps && formData.customFps && (
                <p className="text-xs text-gray-500 mt-1">Using custom FPS: {formData.customFps}</p>
              )}
            </div>

            {/* Codec */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compression Codec
              </label>
              <select
                value={formData.codec}
                onChange={(e) => handleInputChange('codec', e.target.value)}
                className="w-full p-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-white/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
              >
                <option value="H.265">H.265 (HEVC)</option>
                <option value="H.264">H.264 (AVC)</option>
                <option value="MJPEG">MJPEG</option>
              </select>
            </div>

            {/* Bitrate Slider - Always Visible */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Bitrate (Mbps)
                </label>
                <span className="text-sm font-semibold text-blue-600 min-w-[60px] text-right">
                  {(formData.customBitrate || 4.0).toFixed(1)} Mbps
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.1"
                  value={formData.customBitrate || 4.0}
                  onChange={(e) => handleInputChange('customBitrate', parseFloat(e.target.value))}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Range: 0.5 - 20.0 Mbps (adjustable in 0.1 steps)</p>
            </div>

            {/* Recording Hours Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recording Hours Per Day: {formData.recordingHoursPerDay} hours
              </label>
              <input
                type="range"
                min="1"
                max="24"
                value={formData.recordingHoursPerDay}
                onChange={(e) => handleInputChange('recordingHoursPerDay', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Activity Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motion Activity: {formData.activityPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.activityPercent}
                onChange={(e) => handleInputChange('activityPercent', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Retention Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Period: {formData.retentionDays} days
              </label>
              <input
                type="range"
                min="1"
                max="365"
                value={formData.retentionDays}
                onChange={(e) => handleInputChange('retentionDays', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Recording Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recording Mode
                {formData.activityPercent >= 90 && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                    🔒 Locked
                  </span>
                )}
              </label>
              <select
                value={formData.recordingMode || 'continuous'}
                onChange={(e) => {
                  // Only allow change if Motion Activity < 90%
                  if (formData.activityPercent < 90) {
                    handleInputChange('recordingMode', e.target.value);
                  }
                }}
                onMouseDown={(e) => {
                  // Prevent dropdown from opening when disabled
                  if (formData.activityPercent >= 90) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }}
                onClick={(e) => {
                  // Prevent dropdown from opening when disabled
                  if (formData.activityPercent >= 90) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }}
                disabled={formData.activityPercent >= 90}
                style={formData.activityPercent >= 90 ? { pointerEvents: 'none' } : {}}
                className={`w-full p-3 bg-white/70 backdrop-blur-sm border rounded-xl px-4 py-3 transition-all ${
                  formData.activityPercent >= 90
                    ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-300 pointer-events-none'
                    : 'border-gray-200/60 hover:border-blue-300 hover:bg-white/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                }`}
              >
                <option value="continuous">Continuous Recording</option>
                <option value="motion" disabled={formData.activityPercent >= 90}>
                  Motion-Triggered Recording
                  {formData.activityPercent >= 90 ? ' (Not available when Motion Activity ≥ 90%)' : ''}
                </option>
              </select>
              {formData.activityPercent >= 90 && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <span>🔒</span>
                  <span>Recording Mode is locked to "Continuous" because Motion Activity is {formData.activityPercent}% (must be &lt; 90% for Motion-Triggered Recording)</span>
                </p>
              )}
            </div>

            {/* Motion-Triggered Settings */}
            {formData.recordingMode === 'motion' && (
              <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl space-y-4 border border-gray-200/60">
                <h4 className="text-sm font-semibold text-gray-700">Motion Recording Settings</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-Record Time: {formData.preRecordSeconds || 2} seconds
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.preRecordSeconds || 2}
                    onChange={(e) => handleInputChange('preRecordSeconds', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post-Record Time: {formData.postRecordSeconds || 5} seconds
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={formData.postRecordSeconds || 5}
                    onChange={(e) => handleInputChange('postRecordSeconds', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Effective recording percentage will be adjusted based on motion event duration and pre/post-record times.
                </p>
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={(e) => {
                console.log('🔘 Button clicked!', { 
                  isCalculating, 
                  cameras: formData.cameras,
                  userCaptured,
                  buttonDisabled: isCalculating || !formData.cameras
                });
                e.preventDefault();
                handleCalculate();
              }}
              disabled={isCalculating || !formData.cameras}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-300/50 disabled:opacity-60 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Calculating with Gemini AI...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate Storage Requirements
                </>
              )}
            </button>

            {/* Active Parameters - Below Calculate Button, Horizontal Layout */}
            <div className="mt-6 pt-6 border-t border-gray-200/60">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Active Parameters</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Cameras</p>
                  <p className="text-lg font-bold text-blue-600">{formData.cameras || 'Not set'}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Resolution</p>
                  <p className="text-sm font-semibold text-gray-900">{formData.resolution}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">FPS</p>
                  <p className="text-sm font-semibold text-gray-900">{useCustomFps && formData.customFps ? formData.customFps : formData.fps}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Codec</p>
                  <p className="text-sm font-semibold text-gray-900">{formData.codec}</p>
                </div>
                {formData.customBitrate && formData.customBitrate > 0 && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200/50 p-3">
                    <p className="text-xs text-gray-600 mb-1">Custom Bitrate</p>
                    <p className="text-sm font-semibold text-orange-600">{formData.customBitrate.toFixed(1)} Mbps</p>
                  </div>
                )}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-green-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Recording Hours/Day</p>
                  <p className="text-sm font-semibold text-green-600">{formData.recordingHoursPerDay} hours</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Motion Activity</p>
                  <p className="text-sm font-semibold text-purple-600">{formData.activityPercent}%</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Retention</p>
                  <p className="text-sm font-semibold text-gray-900">{formData.retentionDays} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chat Interface */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-lg rounded-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col sticky top-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
            {resultHistory.length >= 2 && (
              <button
                onClick={compareResults}
                className="ml-auto flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-xl text-sm hover:bg-blue-200 transition-colors shadow-[0_2px_8px_rgba(59,130,246,0.15)]"
              >
                <GitCompare className="w-4 h-4" />
                Compare Results
              </button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Start a conversation about your storage requirements!</p>
                <p className="text-sm mt-2">Try asking: "What's the difference between H.264 and H.265?"</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                      : message.metadata?.isSystemMessage
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-white/90 backdrop-blur-sm border border-gray-200/60 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'ai' && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200/60 pt-4 mt-4">
            {chatError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {chatError}
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about storage, compression, or optimization..."
                className="flex-1 p-3 bg-white/70 backdrop-blur-sm border border-blue-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] outline-none transition-all"
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !userInput.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-300/50 disabled:opacity-60 disabled:cursor-not-allowed backdrop-blur-sm text-white px-4 py-3 rounded-xl font-medium shadow-[0_4px_14px_0_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {chatLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>


          {/* Quick Stats - Shown when calculated */}
          {calculationResult && (
            <div className="mt-4 pt-4 border-t border-gray-200/60">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Calculation Results</h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-blue-50/80 to-blue-100/60 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Total Storage Required</p>
                  <p className="text-xl font-bold text-blue-600">{formatStorage(calculationResult.totalStorageTB)}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Daily per Camera</p>
                  <p className="text-sm font-semibold text-gray-900">{calculationResult.dailyStoragePerCameraGB.toFixed(2)} GB</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Total Bitrate</p>
                  <p className="text-sm font-semibold text-gray-900">{calculationResult.totalBitrateMbps.toFixed(2)} Mbps</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Tips - Always visible in remaining space */}
          {!calculationResult && (
            <div className="mt-4 pt-4 border-t border-gray-200/60">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Tips</h3>
              <div className="space-y-2">
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-1">💡 H.265 Codec</p>
                  <p className="text-xs text-gray-700">Saves up to 50% storage vs H.264</p>
                </div>
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-1">🎯 Motion Detection</p>
                  <p className="text-xs text-gray-700">Reduces storage needs by 70%+</p>
                </div>
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-1">⚡ AI Recommendations</p>
                  <p className="text-xs text-gray-700">Get optimized system configuration</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(calculationResult || aiRecommendations) && (
        <div id="results-section" className="mt-8 lg:col-span-3 bg-gradient-to-br from-white/90 via-blue-50/20 to-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Storage Analysis Results</h2>
          </div>
          
          {calculationResult && (
            <>
              {/* Storage Metrics Section */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Total Usable Capacity */}
                  <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Total Storage Required</h3>
                    <p className="text-2xl font-bold text-blue-600">{formatStorage(calculationResult.totalStorageTB)}</p>
                    <p className="text-xs text-gray-500 mt-1">Rounded up to nearest whole TB for safety margin</p>
                  </div>
                  
                  {/* Daily Storage Capacity - ALWAYS in GB */}
                  <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Daily Storage Capacity</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {aiRecommendations?.calculations?.daily_storage_tb 
                        ? formatDailyStorageAlwaysGB(aiRecommendations.calculations.daily_storage_tb)
                        : `${(calculationResult.dailyStoragePerCameraGB * Number(formData.cameras || 0)).toFixed(2)} GB`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Always displayed in GB</p>
                  </div>
                  
                  {/* Bitrate Per Camera */}
                  <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Bitrate Per Camera</h3>
                    <p className="text-2xl font-bold text-purple-600">{calculationResult.bitratePerCamera.toFixed(2)} Mbps</p>
                  </div>
                  
                  {/* Total Bit Rate */}
                  <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Total Bit Rate</h3>
                    <p className="text-2xl font-bold text-orange-600">{calculationResult.totalBitrateMbps.toFixed(2)} Mbps</p>
                  </div>
                </div>
              </div>


              {/* Aeroskop Product Recommendation Section - Single Best Match */}
              {aiRecommendations && (aiRecommendations.recommendation || (aiRecommendations.top_products && aiRecommendations.top_products.length > 0)) && (() => {
                // Get the best single product recommendation
                let bestProduct: any = null;
                
                if (aiRecommendations.recommendation) {
                  bestProduct = aiRecommendations.recommendation;
                } else if (aiRecommendations.top_products && aiRecommendations.top_products.length > 0) {
                  // Use the first product from top_products as the best match
                  bestProduct = aiRecommendations.top_products[0];
                }
                
                // Only show if we have a product
                if (!bestProduct) return null;
                
                return (
                  <div className="mb-6 border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Aeroskop Product</h2>
                    
                    <div className="grid grid-cols-1">
                      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{bestProduct.product_name}</h3>
                            <p className="text-sm text-gray-600">Model: {bestProduct.product_model}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            Best Match
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-4">{bestProduct.why_recommended}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-blue-50/50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Channels</p>
                            <p className="text-sm font-semibold text-gray-900">{bestProduct.channel_capacity}</p>
                          </div>
                          <div className="bg-blue-50/50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Storage</p>
                            <p className="text-sm font-semibold text-gray-900">{bestProduct.storage_capacity_tb} TB</p>
                          </div>
                          <div className="bg-blue-50/50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">CPU</p>
                            <p className="text-sm font-semibold text-gray-900">{bestProduct.cpu}</p>
                          </div>
                          <div className="bg-blue-50/50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">RAM</p>
                            <p className="text-sm font-semibold text-gray-900">{bestProduct.ram}</p>
                          </div>
                        </div>

                        {bestProduct.key_benefits && bestProduct.key_benefits.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Key Features:</p>
                            <ul className="space-y-1">
                              {bestProduct.key_benefits.map((benefit: string, idx: number) => (
                                <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {bestProduct.product_url && (
                          <a
                            href={bestProduct.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-block text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all"
                          >
                            View Product Details →
                          </a>
                        )}
        </div>
      </div>

      {/* Login Modal for User Capture */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          console.log('🚪 Login modal closed');
          setIsLoginModalOpen(false);
          // Restore form data if user closes modal without submitting
          if (tempFormData) {
            console.log('📝 Restoring form data from temp storage');
            setFormData(tempFormData);
            setTempFormData(null);
          }
        }}
        onSubmit={async (userInfo) => {
          console.log('📝 Login modal submit triggered');
          try {
            await handleUserSubmit(userInfo);
          } catch (error) {
            console.error('❌ Error in handleUserSubmit:', error);
            // Keep modal open on error
          }
        }}
      />
    </div>
  );
})()}

            </>
          )}


          {/* Export Buttons */}
          {calculationResult && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Results</h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (isExporting) return;
                    setIsExporting(true);
                    try {
                      await generateEnhancedPDFReport({
                        formData,
                        calculationResult
                      });
                    } catch (error) {
                      console.error('PDF export failed:', error);
                      alert('Failed to generate PDF. Please try again.');
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300/50 disabled:opacity-60 backdrop-blur-sm text-white rounded-xl text-sm font-medium shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_16px_rgba(220,38,38,0.4)] transition-all"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={async () => {
                    if (isExporting) return;
                    setIsExporting(true);
                    try {
                      await generateExcelReport({
                        formData,
                        calculationResult
                      });
                    } catch (error) {
                      console.error('Excel export failed:', error);
                      alert('Failed to generate Excel file. Please try again.');
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300/50 disabled:opacity-60 backdrop-blur-sm text-white rounded-xl text-sm font-medium shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)] transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={async () => {
                    if (isExporting) return;
                    setIsExporting(true);
                    try {
                      await generateCSVReport({
                        formData,
                        calculationResult
                      });
                    } catch (error) {
                      console.error('CSV export failed:', error);
                      alert('Failed to generate CSV file. Please try again.');
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300/50 disabled:opacity-60 backdrop-blur-sm text-white rounded-xl text-sm font-medium shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)] transition-all"
                >
                  <File className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>
          )}


          {/* Disclaimer Section */}
          <div className="border-t border-gray-300 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Disclaimer</h3>
            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Disclaimer:</strong> The results provided by this calculator are approximate estimations intended for planning and reference purposes only. 
                Actual storage requirements may vary based on codec efficiency, scene complexity, motion levels, network performance, and recording configurations. 
                Users are advised to verify the results through real-world testing and consult their storage vendor before final implementation. 
                Aeroskop Technologies and its affiliates shall not be held responsible for discrepancies arising from these estimations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
