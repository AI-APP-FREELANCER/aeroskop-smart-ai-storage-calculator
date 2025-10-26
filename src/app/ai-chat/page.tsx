'use client';

import { useState, useEffect } from 'react';
import CameraStorageChat from '@/components/CameraStorageChat';
import Header from '@/components/Header';

export default function AIChatPage() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate a unique session ID for this chat session
    const newSessionId = 'chat-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Storage Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get expert recommendations for your surveillance storage needs. 
              Ask about bitrate calculations, storage optimization, and VMS configurations.
            </p>
          </div>

          {/* Chat Interface */}
          <CameraStorageChat 
            sessionId={sessionId}
            className="shadow-2xl"
          />

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Storage Calculations
              </h3>
              <p className="text-gray-600 text-sm">
                Get accurate storage requirements based on camera count, resolution, 
                frame rate, and retention periods.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                VMS Optimization
              </h3>
              <p className="text-gray-600 text-sm">
                Learn about video management system optimization, 
                compression settings, and performance tuning.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hardware Recommendations
              </h3>
              <p className="text-gray-600 text-sm">
                Receive expert advice on NVRs, storage servers, 
                and network infrastructure for surveillance systems.
              </p>
            </div>
          </div>

          {/* Example Questions */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Example Questions You Can Ask:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-blue-800 font-medium">Storage Planning:</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• "How much storage do I need for 50 cameras at 4K resolution?"</li>
                  <li>• "What's the difference between H.264 and H.265 compression?"</li>
                  <li>• "How do I calculate bitrate for 30fps recording?"</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-blue-800 font-medium">System Optimization:</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• "What RAID configuration is best for video storage?"</li>
                  <li>• "How can I optimize network bandwidth for surveillance?"</li>
                  <li>• "What are the benefits of AI-powered analytics?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
