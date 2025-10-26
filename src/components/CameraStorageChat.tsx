'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isRestricted?: boolean;
}

interface CameraStorageChatProps {
  sessionId?: string;
  className?: string;
}

export default function CameraStorageChat({ 
  sessionId = 'chat-session-' + Date.now(),
  className = ''
}: CameraStorageChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I\'m your specialized AI assistant for camera storage and surveillance system optimization. I can help you with storage calculations, bitrate calculations, VMS optimization, and surveillance hardware recommendations. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Client-side topic validation
  const validateTopic = (input: string): boolean => {
    const allowedTopics = [
      'storage', 'camera', 'cameras', 'bitrate', 'frame', 'recording', 'vms', 
      'optimization', 'surveillance', 'video', 'compression', 'retention', 
      'fps', 'resolution', 'codec', 'h264', 'h265', 'mjpeg', 'quality',
      'capacity', 'hardware', 'nvr', 'server', 'raid', 'ssd', 'hdd',
      'network', 'bandwidth', 'analytics', 'ai', 'recommendation'
    ];

    const inputLower = input.toLowerCase();
    return allowedTopics.some(topic => inputLower.includes(topic));
  };

  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const trimmedInput = userInput.trim();
    
    // Client-side validation
    if (!validateTopic(trimmedInput)) {
      const restrictedMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'I can only assist with camera storage and surveillance system optimization topics. Please ask about storage requirements, bitrate calculations, or VMS optimization.',
        timestamp: new Date(),
        isRestricted: true
      };
      
      setMessages(prev => [...prev, {
        id: (Date.now() - 1).toString(),
        sender: 'user',
        text: trimmedInput,
        timestamp: new Date()
      }, restrictedMessage]);
      
      setUserInput('');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);
    setError(null);

    try {
      console.log('📤 Sending request to Gemini API:', { prompt: trimmedInput, sessionId });
      
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: trimmedInput,
          sessionId,
          pageUrl: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
        }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.response,
        timestamp: new Date(),
        isRestricted: data.isRestricted
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response from AI');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: 'Hello! I\'m your specialized AI assistant for camera storage and surveillance system optimization. I can help you with storage calculations, bitrate calculations, VMS optimization, and surveillance hardware recommendations. What would you like to know?',
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  return (
    <div className={`chat-console bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Camera Storage AI Assistant</h3>
          </div>
          <button
            onClick={clearChat}
            className="text-blue-100 hover:text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
          >
            Clear Chat
          </button>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          Specialized in surveillance storage optimization and VMS recommendations
        </p>
      </div>

      {/* Chat Messages */}
      <div className="chat-window h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isRestricted
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
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
        
        {loading && (
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
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about camera storage, bitrate calculations, or VMS optimization..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !userInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        {/* Topic hints */}
        <div className="mt-2 text-xs text-gray-500">
          <p>💡 Try asking about: storage calculations, bitrate optimization, VMS recommendations, or surveillance hardware</p>
        </div>
      </div>
    </div>
  );
}
