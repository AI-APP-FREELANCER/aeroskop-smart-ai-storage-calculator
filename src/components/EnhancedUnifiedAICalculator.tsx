'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, MessageSquare, Send, Bot, User, AlertCircle, X, GitCompare, Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { calculateAccurateStorage, calculateRAIDOverhead } from '@/lib/storageCalculations';
import { generateServerRecommendations } from '@/lib/serverRecommendations';
import { generateEnhancedPDFReport } from '@/lib/pdfGenerator';
import { generateExcelReport } from '@/lib/excelGenerator';
import { generateCSVReport } from '@/lib/csvGenerator';
import { AIRecommendationResponse, CalculatorForm, EnhancedStorageCalculation, ServerRecommendation } from '@/lib/types';

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
    raidType: undefined,
    hddPerServer: undefined,
    driveCapacityTB: undefined,
    serverModel: undefined,
    preRecordSeconds: 2,
    postRecordSeconds: 5
  });

  const [calculationResult, setCalculationResult] = useState<EnhancedStorageCalculation | null>(null);
  const [raidInfo, setRaidInfo] = useState<any>(null);
  const [serverRecommendations, setServerRecommendations] = useState<ServerRecommendation | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useCustomFps, setUseCustomFps] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGettingSystemRecommendations, setIsGettingSystemRecommendations] = useState(false);
  const [systemRecommendationError, setSystemRecommendationError] = useState<string | null>(null);
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  // Calculate RAID overhead when RAID type is selected and system config is available
  useEffect(() => {
    if (formData.raidType && (formData.numberOfServers && formData.hddPerServer && formData.driveCapacityTB)) {
      // Use manual input values if available, otherwise use server recommendations
      const totalHDDs = (formData.numberOfServers || 1) * (formData.hddPerServer || 1);
      const driveCapacityTB = formData.driveCapacityTB || 18;
      
      const raidCalc = calculateRAIDOverhead(
        formData.raidType,
        totalHDDs,
        driveCapacityTB
      );
      setRaidInfo(raidCalc);
    } else if (formData.raidType && serverRecommendations) {
      // Fallback to server recommendations if manual values not set
      const totalHDDs = serverRecommendations.numberOfServers * serverRecommendations.drivesPerServer;
      // Extract drive capacity from drive type string or use default
      const driveCapacityMatch = serverRecommendations.driveType.match(/(\d+)/);
      const driveCapacityTB = driveCapacityMatch ? parseInt(driveCapacityMatch[1]) : 18;
      
      const raidCalc = calculateRAIDOverhead(
        formData.raidType,
        totalHDDs,
        driveCapacityTB
      );
      setRaidInfo(raidCalc);
    } else if (!formData.raidType) {
      setRaidInfo(null);
    }
  }, [formData.raidType, formData.numberOfServers, formData.hddPerServer, formData.driveCapacityTB, serverRecommendations]);

  // Handle AI System Recommendations
  const handleGetSystemRecommendations = async () => {
    if (!formData.cameras || Number(formData.cameras) <= 0) {
      alert('Please enter number of cameras first and calculate initial storage requirements');
      return;
    }

    // First calculate basic storage to get total storage TB
    try {
      const basicCalc = calculateAccurateStorage({
        cameras: Number(formData.cameras),
        resolution: formData.resolution,
        fps: useCustomFps && formData.customFps ? formData.customFps : formData.fps,
        codec: formData.codec,
        quality: 'Medium', // Default quality, bitrate is now controlled by slider
        recordingHoursPerDay: formData.recordingHoursPerDay,
        activityPercent: formData.activityPercent,
        retentionDays: formData.retentionDays,
        customBitrate: formData.customBitrate || undefined,
        customFps: useCustomFps && formData.customFps ? formData.customFps : undefined,
        recordingMode: formData.recordingMode,
        preRecordSeconds: formData.preRecordSeconds,
        postRecordSeconds: formData.postRecordSeconds
      });

      setIsGettingSystemRecommendations(true);
      setSystemRecommendationError(null);

      const response = await fetch('/api/ai-system-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameras: Number(formData.cameras),
          totalStorageTB: basicCalc.totalStorageTB,
          totalBitrateMbps: basicCalc.totalBitrateMbps,
          retentionDays: formData.retentionDays,
          resolution: formData.resolution,
          sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to get system recommendations');
      }

      const recommendations = await response.json();
      
      // Update form data with AI recommendations
      setServerRecommendations(recommendations);
      handleInputChange('numberOfServers', recommendations.numberOfServers);
      handleInputChange('hddPerServer', recommendations.drivesPerServer);
      handleInputChange('serverModel', recommendations.serverModel);
      
      // Extract drive capacity from drive type
      const driveCapacityMatch = recommendations.driveType.match(/(\d+)/);
      if (driveCapacityMatch) {
        handleInputChange('driveCapacityTB', parseInt(driveCapacityMatch[1]));
      }

      console.log('✅ AI System recommendations received:', recommendations);

    } catch (error: any) {
      console.error('❌ Failed to get system recommendations:', error);
      setSystemRecommendationError(error.message || 'Failed to get AI system recommendations. Please try again or contact support via WhatsApp.');
    } finally {
      setIsGettingSystemRecommendations(false);
    }
  };

  const handleCalculate = async () => {
    if (!formData.cameras || Number(formData.cameras) <= 0) {
      alert('Please enter a valid number of cameras');
      return;
    }

    // Clear previous results to ensure fresh display
    setIsCalculating(true);
    setCalculationResult(null);
    setAiRecommendations(null);
    // Note: raidInfo and serverRecommendations are preserved for RAID calculations
    // but will be refreshed if parameters change

    try {
      // Calculate storage requirements
      console.log('🧮 Frontend calculation input:', {
        cameras: Number(formData.cameras),
        resolution: formData.resolution,
        fps: useCustomFps && formData.customFps ? formData.customFps : formData.fps,
        codec: formData.codec,
        quality: 'Medium', // Default quality, bitrate is now controlled by slider
        customBitrate: formData.customBitrate || undefined,
        customFps: useCustomFps ? formData.customFps : undefined,
        recordingHoursPerDay: formData.recordingHoursPerDay,
        activityPercent: formData.activityPercent,
        retentionDays: formData.retentionDays,
        recordingMode: formData.recordingMode,
        preRecordSeconds: formData.preRecordSeconds,
        postRecordSeconds: formData.postRecordSeconds
      });
      
      const storageCalc = calculateAccurateStorage({
        cameras: Number(formData.cameras),
        resolution: formData.resolution,
        fps: formData.fps,
        codec: formData.codec,
        quality: 'Medium', // Default quality, bitrate is now controlled by slider
        recordingHoursPerDay: formData.recordingHoursPerDay,
        activityPercent: formData.activityPercent,
        retentionDays: formData.retentionDays,
        customBitrate: formData.customBitrate || undefined,
        customFps: useCustomFps && formData.customFps ? formData.customFps : undefined,
        recordingMode: formData.recordingMode,
        preRecordSeconds: formData.preRecordSeconds,
        postRecordSeconds: formData.postRecordSeconds
      });

      console.log('📊 Frontend storage calculation result:', storageCalc);
      console.log('💾 Frontend Total storage TB:', storageCalc.totalStorageTB);
      
      setCalculationResult(storageCalc);
      
      // Calculate RAID overhead if RAID type is selected and system recommendations are available
      if (formData.raidType && serverRecommendations) {
        const totalHDDs = serverRecommendations.numberOfServers * serverRecommendations.drivesPerServer;
        // Extract drive capacity from drive type string
        const driveCapacityMatch = serverRecommendations.driveType.match(/(\d+)/);
        const driveCapacityTB = driveCapacityMatch ? parseInt(driveCapacityMatch[1]) : 18;
        
        const raidCalc = calculateRAIDOverhead(
          formData.raidType,
          totalHDDs,
          driveCapacityTB
        );
        setRaidInfo(raidCalc);
      } else if (!serverRecommendations) {
        // If no system recommendations, generate basic recommendations based on calculated storage
        const recommendations = generateServerRecommendations(
          storageCalc.totalStorageTB,
          Number(formData.cameras),
          storageCalc.totalBitrateMbps
        );
        setServerRecommendations(recommendations);
      }

      // Get AI recommendations
      // Use custom FPS if available, otherwise use default FPS
      const effectiveFps = useCustomFps && formData.customFps ? formData.customFps : formData.fps;
      const effectiveBitrate = formData.customBitrate || undefined;
      
      const response = await fetch('/api/ai-storage-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameras: Number(formData.cameras),
          resolution: formData.resolution,
          fps: effectiveFps,
          codec: formData.codec,
          quality: 'Medium', // Default quality, bitrate is now controlled by slider
          activity_percent: formData.activityPercent,
          recording_hours_per_day: formData.recordingHoursPerDay,
          retention_days: formData.retentionDays,
          recording_mode: formData.recordingMode,
          pre_record_seconds: formData.preRecordSeconds || 2,
          post_record_seconds: formData.postRecordSeconds || 5,
          custom_bitrate: effectiveBitrate,
          sessionId,
          userId: null // Add user ID if available
        })
      });

      if (response.ok) {
        const recommendations = await response.json();
        console.log('✅ AI Recommendations received:', recommendations);
        console.log('💾 Storage TB from API:', recommendations.calculations?.total_storage_tb);
        console.log('📦 Cache status:', recommendations.cached ? 'Cache Hit' : 'Cache Miss - Fresh Calculation');
        
        // Refresh all recommendations (works for both cached and fresh results)
        setAiRecommendations(recommendations);
        
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
- Required Storage: ${storageCalc.totalStorageTB.toFixed(2)} TB
- Number of Cameras: ${formData.cameras}
- Resolution: ${formData.resolution}
- FPS: ${effectiveFps}
- Codec: ${formData.codec}
- Bitrate: ${effectiveBitrate.toFixed(1)} Mbps
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
        const systemMessage = `I've analyzed your requirements and found the perfect solution! You need ${storageCalc.totalStorageTB.toFixed(1)} TB of storage, and I recommend the ${recommendations.recommendation?.product_name || 'Aeroskop solution'}. This system will handle your ${formData.cameras} cameras perfectly. Feel free to ask me about optimization tips, cost savings, or any questions about your surveillance setup!`;
        
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
    
    const comparisonMessage = `Here's how your two scenarios compare:

**Your Latest Setup:**
- ${latest.params.cameras} cameras → ${latest.result.totalStorageTB.toFixed(1)} TB storage
- Recommended: ${latest.recommendations.recommendation?.product_name}

**Your Previous Setup:**
- ${previous.params.cameras} cameras → ${previous.result.totalStorageTB.toFixed(1)} TB storage  
- Recommended: ${previous.recommendations.recommendation?.product_name}

**My Analysis:** ${latest.result.totalStorageTB > previous.result.totalStorageTB ? 'Your latest setup requires more storage' : 'Your latest setup is more efficient'} (${Math.abs(latest.result.totalStorageTB - previous.result.totalStorageTB).toFixed(1)} TB difference). ${latest.result.totalStorageTB > previous.result.totalStorageTB ? 'This is likely due to higher resolution, more cameras, or longer retention periods.' : 'Great optimization! You\'ve reduced storage needs while maintaining quality.'}`;

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
                <option value="720p">720p (HD)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="4MP">4MP (1440p)</option>
                <option value="4K">4K (2160p)</option>
                <option value="8K">8K (4320p)</option>
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
                <option value="H.264+">H.264+ (Smart Codec)</option>
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
              </label>
              <select
                value={formData.recordingMode || 'continuous'}
                onChange={(e) => handleInputChange('recordingMode', e.target.value)}
                className="w-full p-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-white/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
              >
                <option value="continuous">Continuous Recording</option>
                <option value="motion">Motion-Triggered Recording</option>
              </select>
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
              onClick={handleCalculate}
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

          {/* Active Parameters - Always Visible */}
          <div className="mt-4 pt-4 border-t border-gray-200/60">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Parameters</h3>
            <div className="space-y-2">
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
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                <p className="text-xs text-gray-600 mb-1">Retention</p>
                <p className="text-sm font-semibold text-gray-900">{formData.retentionDays} days</p>
              </div>
            </div>
          </div>

          {/* Quick Stats - Shown when calculated */}
          {calculationResult && (
            <div className="mt-4 pt-4 border-t border-gray-200/60">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Calculation Results</h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-blue-50/80 to-blue-100/60 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Total Storage Required</p>
                  <p className="text-xl font-bold text-blue-600">{calculationResult.totalStorageTB.toFixed(2)} TB</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Daily per Camera</p>
                  <p className="text-sm font-semibold text-gray-900">{calculationResult.dailyStoragePerCameraGB.toFixed(2)} GB</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                  <p className="text-xs text-gray-600 mb-1">Total Bitrate</p>
                  <p className="text-sm font-semibold text-gray-900">{calculationResult.totalBitrateMbps.toFixed(2)} Mbps</p>
                </div>
                {raidInfo && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/50 p-3">
                    <p className="text-xs text-gray-600 mb-1">Usable Capacity</p>
                    <p className="text-sm font-semibold text-blue-600">{raidInfo.usableCapacityTB.toFixed(2)} TB</p>
                  </div>
                )}
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
              {/* Basic Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
                  <h3 className="font-semibold text-gray-700">Total Storage Required</h3>
                  <p className="text-2xl font-bold text-blue-600">{calculationResult.totalStorageTB.toFixed(2)} TB</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
                  <h3 className="font-semibold text-gray-700">Daily Storage per Camera</h3>
                  <p className="text-2xl font-bold text-blue-600">{calculationResult.dailyStoragePerCameraGB.toFixed(2)} GB</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
                  <h3 className="font-semibold text-gray-700">Total Bitrate</h3>
                  <p className="text-2xl font-bold text-blue-600">{calculationResult.totalBitrateMbps.toFixed(2)} Mbps</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-xl border border-blue-100/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
                  <h3 className="font-semibold text-gray-700">Bitrate per Camera</h3>
                  <p className="text-2xl font-bold text-blue-600">{calculationResult.bitratePerCamera.toFixed(2)} Mbps</p>
                </div>
              </div>

              {/* Enhanced Storage Output Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Requirements Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200/60 bg-white/60 backdrop-blur-sm rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
                        <th className="border-b border-gray-200/60 px-4 py-3 text-left font-semibold text-gray-700">Metric</th>
                        <th className="border-b border-gray-200/60 px-4 py-3 text-left font-semibold text-gray-700">Value</th>
                        <th className="border-b border-gray-200/60 px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white/40 hover:bg-white/60 transition-colors">
                        <td className="border-b border-gray-200/40 px-4 py-2 font-medium text-gray-700">Usable Storage (TB)</td>
                        <td className="border-b border-gray-200/40 px-4 py-2 font-semibold text-blue-600">
                          {raidInfo ? raidInfo.usableCapacityTB.toFixed(2) : calculationResult.totalStorageTB.toFixed(2)}
                        </td>
                        <td className="border-b border-gray-200/40 px-4 py-2 text-sm text-gray-600">
                          Total space available after RAID overhead
                        </td>
                      </tr>
                      <tr className="bg-white/40 hover:bg-white/60 transition-colors">
                        <td className="border-b border-gray-200/40 px-4 py-2 font-medium text-gray-700">Raw Capacity Needed (TB)</td>
                        <td className="border-b border-gray-200/40 px-4 py-2 font-semibold text-gray-900">
                          {raidInfo ? raidInfo.rawCapacityTB.toFixed(2) : (calculationResult.totalStorageTB * 1.5).toFixed(2)}
                        </td>
                        <td className="border-b border-gray-200/40 px-4 py-2 text-sm text-gray-600">
                          Total disk capacity required before redundancy
                        </td>
                      </tr>
                      <tr className="bg-white/40 hover:bg-white/60 transition-colors">
                        <td className="border-b border-gray-200/40 px-4 py-2 font-medium text-gray-700">RAID Overhead</td>
                        <td className="border-b border-gray-200/40 px-4 py-2 font-semibold text-red-600">
                          {raidInfo ? `${raidInfo.overheadPercent.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="border-b border-gray-200/40 px-4 py-2 text-sm text-gray-600">
                          {raidInfo ? `Automatically calculated for ${formData.raidType}` : 'No RAID configured'}
                        </td>
                      </tr>
                      <tr className="bg-white/40 hover:bg-white/60 transition-colors">
                        <td className="border-b border-gray-200/40 px-4 py-2 font-medium text-gray-700">Retention Days</td>
                        <td className="border-b border-gray-200/40 px-4 py-2 font-semibold text-gray-900">{formData.retentionDays}</td>
                        <td className="border-b border-gray-200/40 px-4 py-2 text-sm text-gray-600">
                          Duration for which recordings are stored
                        </td>
                      </tr>
                      <tr className="bg-white/40 hover:bg-white/60 transition-colors">
                        <td className="px-4 py-2 font-medium text-gray-700">Average Motion % (Adjusted)</td>
                        <td className="px-4 py-2 font-semibold text-gray-900">
                          {(calculationResult.adjustedMotionPercent || formData.activityPercent).toFixed(1)}%
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          After applying pre/post detection intervals
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RAID/ZFS Protection Selection (Only shown after calculation) */}
              {calculationResult && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RAID/ZFS Protection Type
                    </label>
                    <select
                      value={formData.raidType || ''}
                      onChange={(e) => handleInputChange('raidType', e.target.value as any || undefined)}
                      className="w-full p-3 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-white/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white/90 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
                    >
                      <option value="">Select RAID Type...</option>
                      <option value="RAID-1">RAID-1 (Recommended for OS/VMS boot drives, 50% overhead)</option>
                      <option value="RAID-5">RAID-5 (Single-disk redundancy, ~33% overhead)</option>
                      <option value="RAID-6">RAID-6 (Dual-disk redundancy, ~50% overhead)</option>
                      <option value="RAID-Z1">RAID-Z1 (OpenZFS single parity, ~33% overhead)</option>
                      <option value="RAID-Z2">RAID-Z2 (OpenZFS dual parity, ~50% overhead)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select RAID protection to calculate usable capacity
                    </p>
                  </div>

                  {/* RAID Capacity Display */}
                  {raidInfo && formData.raidType && (
                    <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/60 shadow-[0_2px_8px_rgba(59,130,246,0.08)]">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">RAID Capacity Calculation</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Raw Capacity:</span>
                          <span className="font-semibold">{raidInfo.rawCapacityTB.toFixed(2)} TB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Usable Capacity:</span>
                          <span className="font-semibold text-blue-600">{raidInfo.usableCapacityTB.toFixed(2)} TB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">RAID Overhead:</span>
                          <span className="font-semibold text-red-700">{raidInfo.overheadPercent.toFixed(1)}% ({raidInfo.overheadTB.toFixed(2)} TB)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </>
          )}

          {/* AI System Configuration Section */}
          {calculationResult && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI System Configuration</h3>
              
              {/* Get AI Recommendations Button */}
              {!serverRecommendations && (
                <div className="space-y-4">
                  <button
                    onClick={handleGetSystemRecommendations}
                    disabled={isGettingSystemRecommendations || !formData.cameras}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-300/50 disabled:opacity-60 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isGettingSystemRecommendations ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Getting AI Recommendations...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        Get AI System Recommendations
                      </>
                    )}
                  </button>
                  
                  {systemRecommendationError && (
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 mb-1">Unable to Get AI Recommendations</h4>
                          <p className="text-sm text-red-700 mb-3">{systemRecommendationError}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleGetSystemRecommendations}
                              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_16px_rgba(220,38,38,0.4)] transition-all"
                            >
                              Try Again
                            </button>
                            <a
                              href="https://wa.me/97377992203?text=I'm having trouble getting AI system recommendations on the storage calculator. Can you help?"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)] transition-all"
                            >
                              Contact Support via WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 text-center">
                    Click to get AI-powered system configuration recommendations based on your storage requirements
                  </p>
                </div>
              )}

              {/* Display AI Recommendations */}
              {serverRecommendations && (
                <div className="bg-gradient-to-r from-blue-50/80 to-blue-100/60 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-blue-600" />
                      AI Recommended Configuration
                    </h4>
                    <button
                      onClick={() => {
                        setServerRecommendations(null);
                        handleInputChange('numberOfServers', undefined);
                        handleInputChange('hddPerServer', undefined);
                        handleInputChange('driveCapacityTB', undefined);
                        handleInputChange('serverModel', undefined);
                        handleInputChange('raidType', undefined);
                        setRaidInfo(null);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                      <p className="text-sm text-gray-600 mb-1">Number of Servers</p>
                      <p className="text-xl font-bold text-gray-900">{serverRecommendations.numberOfServers}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                      <p className="text-sm text-gray-600 mb-1">Drives per Server</p>
                      <p className="text-xl font-bold text-gray-900">{serverRecommendations.drivesPerServer}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                      <p className="text-sm text-gray-600 mb-1">Drive Type</p>
                      <p className="text-lg font-bold text-gray-900">{serverRecommendations.driveType}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                      <p className="text-sm text-gray-600 mb-1">Network</p>
                      <p className="text-lg font-bold text-gray-900">{serverRecommendations.network}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                      <p className="text-sm text-gray-600 mb-1">CPU</p>
                      <p className="text-sm font-bold text-gray-900">{serverRecommendations.cpu}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                      <p className="text-sm text-gray-600 mb-1">Memory</p>
                      <p className="text-sm font-bold text-gray-900">{serverRecommendations.memory}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">OS/Filesystem</p>
                      <p className="text-sm font-bold text-gray-900">{serverRecommendations.osFilesystem}</p>
                    </div>
                  </div>
                  
                  {serverRecommendations.rationale && serverRecommendations.rationale.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Why These Recommendations:</p>
                      <ul className="space-y-1">
                        {serverRecommendations.rationale.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Export Buttons - Moved below AI System Configuration */}
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
                        calculationResult,
                        serverRecommendations: serverRecommendations || undefined,
                        raidInfo: raidInfo || undefined
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
                        calculationResult,
                        serverRecommendations: serverRecommendations || undefined,
                        raidInfo: raidInfo || undefined
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
                        calculationResult,
                        serverRecommendations: serverRecommendations || undefined,
                        raidInfo: raidInfo || undefined
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

          {aiRecommendations && (
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-blue-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Recommendation</h3>
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200/60">
                <h4 className="font-bold text-lg text-blue-600 mb-2">
                  {aiRecommendations.recommendation?.product_name}
                </h4>
                <p className="text-gray-700 mb-4">
                  {aiRecommendations.recommendation?.why_recommended}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Model:</span> {aiRecommendations.recommendation?.product_model}
                  </div>
                  <div>
                    <span className="font-semibold">Channels:</span> {aiRecommendations.recommendation?.channel_capacity}
                  </div>
                  <div>
                    <span className="font-semibold">Storage:</span> {aiRecommendations.recommendation?.storage_capacity_tb} TB
                  </div>
                  <div>
                    <span className="font-semibold">CPU:</span> {aiRecommendations.recommendation?.cpu}
                  </div>
                </div>
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
