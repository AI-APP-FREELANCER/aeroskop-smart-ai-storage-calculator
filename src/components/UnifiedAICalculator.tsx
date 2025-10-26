'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, MessageSquare, Send, Bot, User, AlertCircle, X } from 'lucide-react';
import { calculateAccurateStorage } from '@/lib/storageCalculations';
import { AIRecommendationResponse, CalculatorForm } from '@/lib/types';

interface UnifiedAICalculatorProps {
  className?: string;
}

export default function UnifiedAICalculator({ className = '' }: UnifiedAICalculatorProps) {
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
    recordingMode: 'continuous'
  });

  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationResponse | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Chat states
  const [messages, setMessages] = useState<Array<{id: string, sender: 'user' | 'ai', text: string, timestamp: Date}>>([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [sessionId] = useState('unified-session-' + Date.now());

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

  const handleCalculate = async () => {
    if (!formData.cameras || Number(formData.cameras) <= 0) {
      alert('Please enter a valid number of cameras');
      return;
    }

    setIsCalculating(true);
    setCalculationResult(null);
    setAiRecommendations(null);

    try {
      // Calculate storage requirements
      const storageCalc = calculateAccurateStorage({
        cameras: Number(formData.cameras),
        resolution: formData.resolution,
        fps: formData.fps,
        codec: formData.codec,
        quality: formData.quality,
        recordingHoursPerDay: formData.recordingHoursPerDay,
        activityPercent: formData.activityPercent,
        retentionDays: formData.retentionDays
      });

      setCalculationResult(storageCalc);

      // Get AI recommendations
      const response = await fetch('/api/ai-storage-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameras: Number(formData.cameras),
          resolution: formData.resolution,
          fps: formData.fps,
          codec: formData.codec,
          quality: formData.quality,
          activity_percent: formData.activityPercent,
          recording_hours_per_day: formData.recordingHoursPerDay,
          retention_days: formData.retentionDays,
          recording_mode: formData.recordingMode
        })
      });

      if (response.ok) {
        const recommendations = await response.json();
        setAiRecommendations(recommendations);
        
        // Add AI summary to chat
        const aiSummary = `I've analyzed your requirements for ${formData.cameras} cameras at ${formData.resolution} resolution. Based on your parameters, I recommend the ${recommendations.recommendation?.product_name || 'Aeroskop solution'}. Would you like to discuss the recommendations or have any questions about the storage requirements?`;
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: aiSummary,
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      console.error('Calculation error:', error);
      alert('Failed to calculate storage requirements. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const sendChatMessage = async () => {
    if (!userInput.trim() || chatLoading) return;

    const trimmedInput = userInput.trim();
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: trimmedInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmedInput,
          sessionId,
          pageUrl: '/ai-chat'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai' as const,
        text: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err: any) {
      console.error('Chat error:', err);
      setChatError(err.message || 'Failed to get response from AI');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai' as const,
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Storage Calculator & Assistant
        </h1>
        <p className="text-xl text-gray-600">
          Calculate your storage needs and get personalized AI recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Calculator Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <select
                value={formData.fps}
                onChange={(e) => handleInputChange('fps', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={15}>15 FPS</option>
                <option value={30}>30 FPS</option>
                <option value={60}>60 FPS</option>
              </select>
            </div>

            {/* Codec */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compression Codec
              </label>
              <select
                value={formData.codec}
                onChange={(e) => handleInputChange('codec', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="H.265">H.265 (HEVC)</option>
                <option value="H.264">H.264 (AVC)</option>
                <option value="H.264+">H.264+ (Smart Codec)</option>
                <option value="MJPEG">MJPEG</option>
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Quality
              </label>
              <select
                value={formData.quality}
                onChange={(e) => handleInputChange('quality', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
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

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={isCalculating || !formData.cameras}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate Storage Needs
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Chat Interface */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 min-h-96 max-h-96 overflow-y-auto mb-4 space-y-4">
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
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
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
                <div className="bg-gray-100 rounded-lg px-4 py-2">
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
          <div className="border-t border-gray-200 pt-4">
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
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !userInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {chatLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {(calculationResult || aiRecommendations) && (
        <div id="results-section" className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Storage Analysis Results</h2>
          
          {calculationResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Total Storage Required</h3>
                <p className="text-2xl font-bold text-blue-600">{calculationResult.totalStorageTB.toFixed(2)} TB</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Daily Storage per Camera</h3>
                <p className="text-2xl font-bold text-green-600">{calculationResult.dailyStoragePerCameraGB.toFixed(2)} GB</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">Total Bitrate</h3>
                <p className="text-2xl font-bold text-purple-600">{calculationResult.totalBitrateMbps.toFixed(2)} Mbps</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900">Bitrate per Camera</h3>
                <p className="text-2xl font-bold text-orange-600">{calculationResult.bitratePerCamera.toFixed(2)} Mbps</p>
              </div>
            </div>
          )}

          {aiRecommendations && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Recommendation</h3>
              <div className="bg-white p-4 rounded-lg border">
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
        </div>
      )}
    </div>
  );
}
