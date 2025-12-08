'use client';

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { DO_ASSET_BASE_URL } from "@/lib/constants";

export default function StrakVMS() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-sky-50/50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={`${DO_ASSET_BASE_URL}/images/Stark-VMS/hero-img.webp`}
            alt="STRAK VMS"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 mb-8" style={{ aspectRatio: '32/9' }}>
              <Image
                src={`${DO_ASSET_BASE_URL}/images/Stark-VMS/hero-img.webp`}
                alt="STRAK VMS Interface"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1280px"
              />
            </div>
            {/* Primary Introduction Text - Below Hero Banner */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight text-left">
              STRAK VMS: Video Surveillance Powerhouse
            </h1>
            <p className="text-xl lg:text-2xl text-slate-200 leading-relaxed text-left w-full">
              STRAK is the video surveillance software solution designed to handle any camera project, from basic setups to cutting-edge AI implementations. Supporting a staggering 99% of camera models and running seamlessly across all popular operating systems.
            </p>
          </div>
        </div>
      </section>

      {/* Full-Width Two-Column Feature Banner (4:1 Aspect Ratio) */}
      <section className="w-full my-12 md:my-16 px-0">
        <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-gradient-to-br from-slate-50 to-white" style={{ aspectRatio: '4/1', minHeight: '200px' }}>
          <div className="absolute inset-0 flex">
            {/* Left Column - Text (Left-aligned) */}
            <div className="w-1/2 flex items-center px-8 md:px-16 lg:px-24">
              <div className="max-w-2xl">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 mb-4 text-left">
                  Simple Interface, Powerful Functionality
                </h2>
                <p className="text-lg lg:text-xl text-slate-600 leading-relaxed text-left">
                  STRAK doesn't sacrifice power for simplicity. Our user-friendly interface makes navigating the software a breeze, while our comprehensive turnkey settings allow for quick and efficient system configuration.
                </p>
              </div>
            </div>
            
            {/* Right Column - Image */}
            <div className="w-1/2 relative">
              <Image
                src={`${DO_ASSET_BASE_URL}/images/Stark-VMS/sotfware.webp`}
                alt="STRAK VMS Interface"
                fill
                className="object-cover"
                loading="lazy"
                sizes="50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Powerhouse Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 via-sky-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Unlock the Power of AI
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Advanced AI-powered features that transform your surveillance system into an intelligent security solution
              </p>
            </div>

            {/* AI Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Facial Recognition */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Facial Recognition
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Recognises Mask, Age, Gender & Emotions
                    </p>
                  </div>
                </div>
              </div>

              {/* Visitor Counting */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Visitor Counting
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Advanced Crowd & Loitering detection system
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Detection */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Vehicle Detection
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Precise identification of vehicles along with number plate data
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Crossing Detection */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Line Crossing Detection
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Intelligent boundary monitoring with real-time alerts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Features List */}
      <section className="pt-8 pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Comprehensive Feature Set
              </h2>
              <p className="text-xl text-slate-600">
                Everything you need for complete surveillance management
              </p>
            </div>

            {/* Features Grid - Three Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                'Medical mask and safety gear detection',
                'Abandoned and missing object detection',
                'Security Cameras system health monitoring',
                'Line crossing detection',
                'Visitor and passenger counting',
                'PTZ tracking and tours',
                'Heatmaps',
                'Interactive floor plans',
                'Smart record distribution across disk',
                'Access control and automation',
                'Cash register integration',
                'Smart home integration'
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-slate-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Surveillance?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Experience the power of STRAK VMS and see why it's the choice for professional surveillance operations worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg"
              >
                Get Started
              </Link>
              <a
                href="https://api.whatsapp.com/send/?phone=%2B97377992203&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 py-12 backdrop-blur">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
          <div>
            <div className="relative h-8 w-36 mb-4">
              <Image 
                src={`${DO_ASSET_BASE_URL}/images/company_logo/aeroskop_logo.webp`} 
                alt="Aeroskop" 
                fill 
                className="object-contain" 
              />
            </div>
            <p className="text-sm text-slate-600 max-w-xs">
              Aeroskop manufactures high‑performance security products for reliable, scalable surveillance.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-3">Products</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/security-cameras" className="hover:text-slate-900">Security Cameras</a></li>
              <li><a href="/nvr" className="hover:text-slate-900">NVR</a></li>
              <li><a href="/poeswitches" className="hover:text-slate-900">PoE Switches</a></li>
              <li><a href="/rhinoservers" className="hover:text-slate-900">Rhino Servers</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-3">Company</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/about" className="hover:text-slate-900">About</a></li>
              <li><a href="/contact" className="hover:text-slate-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 mb-3">Get in touch</div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="tel:+97377992203" className="hover:text-slate-900">Tel: +973 77992203</a></li>
              <li><a href="mailto:info@aeroskop.com" className="hover:text-slate-900">info@aeroskop.com</a></li>
              <li>Umm Al Hassam, Kingdom of Bahrain</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 border-t border-slate-200 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Aeroskop. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
