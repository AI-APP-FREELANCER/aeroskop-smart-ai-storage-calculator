'use client';

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import FloatingAICalculator from "@/components/FloatingAICalculator";
import HeroBanner from "@/components/HeroBanner";
import { useState } from "react";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState(false);

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
        setUserData(user);
        console.log('User registered successfully:', user);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-sky-50/50 to-white">
      <Header />
      {/* Video Hero Banner */}
      <section className="relative pt-24 min-h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/videos/banner1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Buttons at bottom with thin margin */}
        <div className="absolute bottom-4 left-8 z-10">
          <div className="flex flex-wrap gap-4">
                <a
                  href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Get Consultation
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Product Range</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Professional surveillance solutions engineered for reliability, 
              performance, and exceptional value.
            </p>
          </div>
              
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                {[
                  {
                    title: "Security Cameras",
                    description: "Professional dome, bullet and panoramic cameras for comprehensive surveillance coverage.",
                    href: "/security-cameras",
                    img: "https://ext.same-assets.com/2174986154/1009581275.webp",
                    features: ["4K Resolution", "AI Analytics", "Weather Resistant"],
                  },
                  { 
                    title: "Aeroflex NVR", 
                    description: "Reliable network video recorders with advanced AI processing and seamless integration.",
                    href: "/nvr", 
                    img: "https://ext.same-assets.com/2174986154/2604941144.webp",
                    features: ["AI Processing", "Multi-Channel", "Remote Access"],
                  },
                  { 
                    title: "PoE Switches", 
                    description: "High-performance Power over Ethernet switches with intelligent power management.",
                    href: "/poeswitches", 
                    img: "https://ext.same-assets.com/2174986154/2189941613.webp",
                    features: ["PoE+ Support", "Gigabit Speed", "Auto-Detection"],
                  },
                ].map((product, index) => (
                  <Link
                    key={product.href}
                    href={product.href}
                    className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200 block cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                      <Image 
                        src={product.img} 
                        alt={product.title} 
                        fill 
                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                          {product.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                          {product.description}
                        </p>
                      </div>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
        </div>

        {/* Interstitial Hero Banner - Full Width (Random Selection) */}
        <HeroBanner />

        <div className="container">
              {/* Second Group of Product Cards */}
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8 mt-8">
                {[
                  { 
                    title: "Rhino Storage Servers", 
                    description: "Scalable storage solutions built for demanding surveillance workloads and long-term retention.",
                    href: "/rhinoservers", 
                    img: "https://ext.same-assets.com/2174986154/303750571.webp",
                    features: ["High Capacity", "RAID Support", "Hot-Swap"],
                  },
                  { 
                    title: "Core Switches", 
                    description: "Enterprise-grade core switching with 10G uplinks for high-bandwidth surveillance networks.",
                    href: "/core-switches", 
                    img: "https://ext.same-assets.com/2174986154/3786522156.webp",
                    features: ["10G Uplinks", "Layer 3", "Redundancy"],
                  },
                  { 
                    title: "Workstations", 
                    description: "Powerful systems optimized for VMS, control rooms, and AI-powered surveillance analytics.",
                    href: "/workstations", 
                    img: "https://ext.same-assets.com/2174986154/1190281012.webp",
                    features: ["High Performance", "Multi-Display", "AI Ready"],
                  },
                  { 
                    title: "Strak VMS", 
                    description: "End-to-end video management software platform with advanced analytics and AI integration.",
                    href: "/strak-vms", 
                    img: "https://ext.same-assets.com/2174986154/2801051794.svg",
                    features: ["AI Analytics", "Cloud Integration", "Real-time Monitoring"],
                  },
                ].map((product, index) => (
                  <Link
                    key={product.href}
                    href={product.href}
                    className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200 block cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                      <Image 
                        src={product.img} 
                        alt={product.title} 
                        fill 
                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                          {product.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                          {product.description}
                        </p>
                      </div>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose Aeroskop?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Advanced surveillance solutions with intelligent AI-powered recommendations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">AI-Powered Intelligence</h3>
              <p className="text-slate-600">Smart storage recommendations based on your specific surveillance needs and requirements.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">High Performance</h3>
              <p className="text-slate-600">Enterprise-grade hardware designed for demanding surveillance environments and 24/7 operation.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Reliable & Secure</h3>
              <p className="text-slate-600">Built with enterprise security standards and proven reliability for mission-critical applications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature quick links (4-up) */}
      <section className="border-y border-slate-200/70 bg-white/70 py-10 backdrop-blur">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            {
              title: "5-Year Warranty",
              desc:
                "Long-term protection with our 5-year warranty for peace of mind.",
              icon: "https://ext.same-assets.com/2174986154/3286716446.svg",
            },
            {
              title: "No Return Warranty",
              desc:
                "Instant replacement, keep your old hardware—no questions asked.",
              icon: "https://ext.same-assets.com/2174986154/1948832421.svg",
            },
            {
              title: "Smart & Affordable",
              desc:
                "Premium surveillance at a price that makes sense.",
              icon: "https://ext.same-assets.com/2174986154/547085407.svg",
            },
            {
              title: "Exceptional Service",
              desc:
                "End‑to‑end assistance for installation and upgrades.",
              icon: "https://ext.same-assets.com/2174986154/4181628537.svg",
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="relative h-10 w-10 shrink-0 rounded-lg bg-sky-50 ring-1 ring-sky-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.icon} alt="" className="p-2" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {f.title}
                </div>
                <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Footer simplified in Aeroskop style */}
      <footer className="bg-white/80 py-12 backdrop-blur">
        <div className="container grid gap-8 md:grid-cols-4">
          <div>
            <div className="relative h-8 w-36">
              <Image src="https://ext.same-assets.com/2174986154/2796273073.svg" alt="Aeroskop" fill className="object-contain" />
            </div>
            <p className="mt-4 text-sm text-slate-600 max-w-xs">
              Aeroskop manufactures high‑performance security products for
              reliable, scalable surveillance.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Products</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="/security-cameras" className="hover:text-slate-900">Security Cameras</a></li>
              <li><a href="/nvr" className="hover:text-slate-900">NVR</a></li>
              <li><a href="/poeswitches" className="hover:text-slate-900">PoE Switches</a></li>
              <li><a href="/rhinoservers" className="hover:text-slate-900">Rhino Servers</a></li>
              <li><a href="/core-switches" className="hover:text-slate-900">Core Switches</a></li>
              <li><a href="/workstations" className="hover:text-slate-900">Workstations</a></li>
              <li><a href="/strak-vms" className="hover:text-slate-900">Strak VMS</a></li>
              <li>
                {!showAdminPassword ? (
                  <button
                    onClick={() => setShowAdminPassword(true)}
                    className="hover:text-slate-900 text-left"
                  >
                    Admin
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setAdminPasswordError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (adminPassword === 'Aeroskop-Admin-Key') {
                            window.location.href = '/admin';
                          } else {
                            setAdminPasswordError(true);
                            setAdminPassword('');
                          }
                        } else if (e.key === 'Escape') {
                          setShowAdminPassword(false);
                          setAdminPassword('');
                          setAdminPasswordError(false);
                        }
                      }}
                      placeholder="Enter admin password"
                      className="px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    {adminPasswordError && (
                      <p className="text-xs text-red-600">Incorrect password. Press Escape to cancel.</p>
                    )}
                    <button
                      onClick={() => {
                        setShowAdminPassword(false);
                        setAdminPassword('');
                        setAdminPasswordError(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="/about" className="hover:text-slate-900">About</a></li>
              <li><a href="/contact" className="hover:text-slate-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Get in touch</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="tel:+97377992203" className="hover:text-slate-900">Tel: +973 77992203</a></li>
              <li><a href="mailto:info@aeroskop.com" className="hover:text-slate-900">info@aeroskop.com</a></li>
              <li>Umm Al Hassam, Kingdom of Bahrain</li>
              <li>ul. Hoża 86 lok. 410, 00-682 Warszawa</li>
            </ul>
          </div>
        </div>
        <div className="container mt-8 border-t border-slate-200 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Aeroskop. All rights reserved.
        </div>
      </footer>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSubmit={handleUserSubmit}
      />

      {/* Floating AI Calculator Button */}
      <FloatingAICalculator />

    </main>
  );
}
