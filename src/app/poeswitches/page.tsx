import Image from "next/image";
import Header from "@/components/Header";

export default function PoESwitches() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-sky-50/50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                PoE Switches
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                High-performance Power over Ethernet switches with intelligent power management, auto-detection, and gigabit connectivity for professional surveillance networks.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://api.whatsapp.com/send/?phone=%2B97377992203&text&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Enquire Now
                </a>
                <a
                  href="#specifications"
                  className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  View Specifications
                </a>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://ext.same-assets.com/2174986154/2189941613.webp"
                alt="PoE Switches"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Advanced PoE Switch Features</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Professional Power over Ethernet switches designed for surveillance networks with intelligent power management and high-performance connectivity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">PoE+ Support</h3>
              <p className="text-slate-600">IEEE 802.3at PoE+ standard delivering up to 30W per port for high-power devices.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Auto-Detection</h3>
              <p className="text-slate-600">Automatic device detection and power allocation for optimal energy efficiency.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Gigabit Speed</h3>
              <p className="text-slate-600">Full gigabit connectivity for high-bandwidth surveillance data transmission.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Management</h3>
              <p className="text-slate-600">Web-based management interface for remote monitoring and configuration.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Power Protection</h3>
              <p className="text-slate-600">Built-in surge protection and power management for device safety.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">VLAN Support</h3>
              <p className="text-slate-600">Advanced VLAN support for network segmentation and security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Specifications */}
      <section id="specifications" className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Technical Specifications</h2>
            <p className="text-lg text-slate-600">Professional PoE switch specifications for surveillance network infrastructure.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Switch Specifications</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Ports</span>
                  <span className="text-slate-600">8/16/24/48 PoE+ ports</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">PoE Standard</span>
                  <span className="text-slate-600">IEEE 802.3at (PoE+)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Power per Port</span>
                  <span className="text-slate-600">Up to 30W</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Total Power Budget</span>
                  <span className="text-slate-600">240W - 740W</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Uplink Ports</span>
                  <span className="text-slate-600">2-4 SFP/SFP+ ports</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Switching Capacity</span>
                  <span className="text-slate-600">Up to 176 Gbps</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">MAC Address Table</span>
                  <span className="text-slate-600">8K - 16K entries</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Management</span>
                  <span className="text-slate-600">Web, SNMP, CLI</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Power Management Features</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Auto Power Detection</h4>
                    <p className="text-slate-600 text-sm">Automatic detection of connected device power requirements.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Power Scheduling</h4>
                    <p className="text-slate-600 text-sm">Schedule power on/off for connected devices to save energy.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Load Balancing</h4>
                    <p className="text-slate-600 text-sm">Intelligent power distribution across all ports.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Power Monitoring</h4>
                    <p className="text-slate-600 text-sm">Real-time power consumption monitoring and reporting.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Priority Power</h4>
                    <p className="text-slate-600 text-sm">Priority-based power allocation for critical devices.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Fault Protection</h4>
                    <p className="text-slate-600 text-sm">Overcurrent and short-circuit protection for connected devices.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Need Professional PoE Switches?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get high-performance PoE switches with intelligent power management for your surveillance network. Our experts will help you choose the right solution.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://api.whatsapp.com/send/?phone=%2B97377992203&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Get Quote on WhatsApp
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 py-12 backdrop-blur">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
          <div>
            <div className="relative h-8 w-36 mb-4">
              <Image src="https://ext.same-assets.com/2174986154/2796273073.svg" alt="Aeroskop" fill className="object-contain" />
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
