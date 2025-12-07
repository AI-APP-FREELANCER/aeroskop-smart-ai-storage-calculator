'use client';

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import ProductBanner from "@/components/ProductBanner";
import { generateProductSpecPDF } from "@/lib/pdfGenerator";
import { DO_ASSET_BASE_URL } from "@/lib/constants";

// Helper function to get image path based on product model
const getImagePath = (model: string): string => {
  const imageMap: { [key: string]: string } = {
    'AF-64128': 'AF-64128.webp',
    'AF-3264': 'AF-3264.webp',
    'AF-1632': 'AF-1632.webp'
  };
  
  const filename = imageMap[model] || `${model}.webp`;
  return `${DO_ASSET_BASE_URL}/NVR/${filename}`;
};

// NVR Product specifications data structure
interface NVRSpecs {
  system: {
    channels: string;
    resolution: string;
    frameRate: string;
    processor: string;
    memory: string;
    operatingSystem: string;
    videoInput: string;
    videoOutput: string;
  };
  storage: {
    driveBays: string;
    maxStorage: string;
    raidSupport: string[];
    storageInterface: string;
    recordingModes: string[];
    playback: string;
  };
  network: {
    networkInterface: string;
    poePorts: string;
    poeStandard: string;
    protocols: string[];
    compression: string[];
    streaming: string;
    remoteAccess: string;
  };
  physical: {
    dimensions: string;
    weight: string;
    material: string;
    formFactor: string;
    mounting: string;
  };
  power: {
    powerConsumption: string;
    voltage: string;
    powerConnector: string;
    powerSupply: string;
  };
  features: {
    analytics: string[];
    detection: string[];
    management: string[];
    integration: string[];
  };
  compliance: {
    certifications: string[];
    standards: string[];
    warranty: string;
  };
}

interface NVRProductData {
  id: number;
  name: string;
  model: string;
  tagline: string;
  description: string;
  specs: NVRSpecs;
}

// NVR Product specifications database
const nvrProductDatabase: { [key: string]: NVRProductData } = {
  'AF-64128': {
    id: 1,
    name: 'Aeroflex NVR',
    model: 'AF-64128',
    tagline: 'High-performance NVR',
    description: 'Enterprise-grade Network Video Recorder designed for large-scale surveillance deployments. The AF-64128 supports up to 128 channels with simultaneous 4K recording, advanced AI analytics, and extensive storage capacity. Built for mission-critical applications requiring high reliability and performance.',
    specs: {
      system: {
        channels: '64-128 channels',
        resolution: 'Up to 4K (3840×2160) per channel',
        frameRate: '30 FPS per channel at full resolution',
        processor: 'Intel Core i7 or equivalent',
        memory: '32GB DDR4',
        operatingSystem: 'Linux-based embedded OS',
        videoInput: 'IP camera input',
        videoOutput: 'HDMI, VGA, Network'
      },
      storage: {
        driveBays: '8× 3.5" SATA drive bays',
        maxStorage: 'Up to 64TB (8× 8TB drives)',
        raidSupport: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6', 'RAID 10'],
        storageInterface: 'SATA III (6 Gbps)',
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule', 'Event-triggered'],
        playback: 'Multi-channel simultaneous playback'
      },
      network: {
        networkInterface: '2× Gigabit Ethernet ports',
        poePorts: '64 PoE+ ports (802.3at)',
        poeStandard: 'IEEE 802.3at (PoE+)',
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP', 'ONVIF', 'RTSP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: 'Dual stream per channel',
        remoteAccess: 'Web browser, Mobile app, Client software'
      },
      physical: {
        dimensions: '440 × 430 × 88mm (1U rack mount)',
        weight: '8.5 kg (without drives)',
        material: 'Steel chassis',
        formFactor: '1U rack mountable',
        mounting: '19" standard rack'
      },
      power: {
        powerConsumption: 'Max 300W',
        voltage: '100-240V AC, 50/60Hz',
        powerConnector: 'Standard AC power cord',
        powerSupply: 'Internal redundant PSU (optional)'
      },
      features: {
        analytics: ['Smart Search', 'Facial Recognition', 'License Plate Recognition', 'People Counting'],
        detection: ['Motion Detection', 'Intrusion Detection', 'Line Crossing', 'Object Detection'],
        management: ['Centralized Management', 'User Management', 'Event Management', 'Log Management'],
        integration: ['ONVIF Profile S/T', 'Third-party camera support', 'API integration', 'Cloud connectivity']
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['ONVIF', 'IP66 (optional)'],
        warranty: '3 Years'
      }
    }
  },
  'AF-3264': {
    id: 2,
    name: 'Aeroflex NVR',
    model: 'AF-3264',
    tagline: 'Compact yet Powerful NVR',
    description: 'Space-efficient Network Video Recorder offering professional surveillance capabilities in a compact form factor. The AF-3264 supports up to 64 channels with 4K recording, integrated PoE ports, and advanced features. Perfect for medium-scale deployments where space is at a premium.',
    specs: {
      system: {
        channels: '32-64 channels',
        resolution: 'Up to 4K (3840×2160) per channel',
        frameRate: '30 FPS per channel at full resolution',
        processor: 'Intel Core i5 or equivalent',
        memory: '16GB DDR4',
        operatingSystem: 'Linux-based embedded OS',
        videoInput: 'IP camera input',
        videoOutput: 'HDMI, VGA, Network'
      },
      storage: {
        driveBays: '4× 3.5" SATA drive bays',
        maxStorage: 'Up to 32TB (4× 8TB drives)',
        raidSupport: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 10'],
        storageInterface: 'SATA III (6 Gbps)',
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule', 'Event-triggered'],
        playback: 'Multi-channel simultaneous playback'
      },
      network: {
        networkInterface: '2× Gigabit Ethernet ports',
        poePorts: '32 PoE+ ports (802.3at)',
        poeStandard: 'IEEE 802.3at (PoE+)',
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP', 'ONVIF', 'RTSP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: 'Dual stream per channel',
        remoteAccess: 'Web browser, Mobile app, Client software'
      },
      physical: {
        dimensions: '440 × 300 × 44mm (1U rack mount)',
        weight: '5.2 kg (without drives)',
        material: 'Steel chassis',
        formFactor: '1U rack mountable',
        mounting: '19" standard rack'
      },
      power: {
        powerConsumption: 'Max 200W',
        voltage: '100-240V AC, 50/60Hz',
        powerConnector: 'Standard AC power cord',
        powerSupply: 'Internal PSU'
      },
      features: {
        analytics: ['Smart Search', 'Facial Recognition', 'People Counting', 'Heat Mapping'],
        detection: ['Motion Detection', 'Intrusion Detection', 'Line Crossing', 'Object Detection'],
        management: ['Centralized Management', 'User Management', 'Event Management'],
        integration: ['ONVIF Profile S/T', 'Third-party camera support', 'API integration']
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['ONVIF'],
        warranty: '3 Years'
      }
    }
  },
  'AF-1632': {
    id: 3,
    name: 'Aeroflex NVR',
    model: 'AF-1632',
    tagline: '32 Channel NVR-POE',
    description: 'Integrated Network Video Recorder with built-in PoE support for streamlined installation and management. The AF-1632 combines 32-channel recording capability with PoE ports, eliminating the need for separate PoE switches. Ideal for small to medium businesses requiring an all-in-one surveillance solution.',
    specs: {
      system: {
        channels: '16-32 channels',
        resolution: 'Up to 4K (3840×2160) per channel',
        frameRate: '30 FPS per channel at full resolution',
        processor: 'Intel Core i3 or equivalent',
        memory: '8GB DDR4',
        operatingSystem: 'Linux-based embedded OS',
        videoInput: 'IP camera input',
        videoOutput: 'HDMI, VGA, Network'
      },
      storage: {
        driveBays: '2× 3.5" SATA drive bays',
        maxStorage: 'Up to 16TB (2× 8TB drives)',
        raidSupport: ['RAID 0', 'RAID 1'],
        storageInterface: 'SATA III (6 Gbps)',
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule', 'Event-triggered'],
        playback: 'Multi-channel simultaneous playback'
      },
      network: {
        networkInterface: '1× Gigabit Ethernet port',
        poePorts: '16 PoE+ ports (802.3at)',
        poeStandard: 'IEEE 802.3at (PoE+)',
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP', 'ONVIF', 'RTSP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: 'Dual stream per channel',
        remoteAccess: 'Web browser, Mobile app, Client software'
      },
      physical: {
        dimensions: '440 × 300 × 44mm (1U rack mount)',
        weight: '4.8 kg (without drives)',
        material: 'Steel chassis',
        formFactor: '1U rack mountable',
        mounting: '19" standard rack'
      },
      power: {
        powerConsumption: 'Max 150W',
        voltage: '100-240V AC, 50/60Hz',
        powerConnector: 'Standard AC power cord',
        powerSupply: 'Internal PSU'
      },
      features: {
        analytics: ['Smart Search', 'Motion Detection', 'People Counting'],
        detection: ['Motion Detection', 'Intrusion Detection', 'Line Crossing'],
        management: ['Centralized Management', 'User Management'],
        integration: ['ONVIF Profile S/T', 'Third-party camera support']
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['ONVIF'],
        warranty: '3 Years'
      }
    }
  }
};

export default function NVRProductDetailPage() {
  const params = useParams();
  const model = params?.model as string;
  const product = nvrProductDatabase[model];

  // Error handling for invalid model
  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-sky-50/50 to-white">
        <Header />
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Product Not Found</h1>
            <p className="text-xl text-slate-600 mb-8">
              The product model "{model}" could not be found.
            </p>
            <Link
              href="/nvr"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Aeroflex NVR
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-sky-50/50 to-white">
      <Header />
      
      {/* Product-Specific Banner (Top) */}
      <ProductBanner productId={product.model} imagePath={getImagePath(product.model)} caption={`${product.name} ${product.model}: ${product.tagline}`} />
      
      {/* Breadcrumb Navigation */}
      <section className="pt-12 pb-4 bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/nvr" className="hover:text-blue-600">Aeroflex NVR</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{product.model}</span>
          </nav>
        </div>
      </section>

      {/* Header Section (Product Info Only - Image Removed) */}
      <section className="pb-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl text-slate-600 font-medium mb-4">
              {product.model}
            </p>
            <p className="text-lg text-slate-700 mb-4">
              {product.tagline}
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </section>

      {/* Technical Specifications Section */}
      <section className="pt-8 pb-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Technical Specifications</h2>
            <button
              onClick={() => {
                generateProductSpecPDF(product.name, product.model, product.tagline, product.specs);
              }}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Specs
            </button>
          </div>
          
          <Tabs
            tabs={[
              {
                id: 'system',
                label: 'System & Performance',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Channels</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.channels}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Resolution</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.resolution}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Frame Rate</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.frameRate}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Processor</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.processor}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Memory</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.memory}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Operating System</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.operatingSystem}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Video Input</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.videoInput}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Video Output</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.videoOutput}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'storage',
                label: 'Storage & Recording',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Drive Bays</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.driveBays}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Max Storage</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.maxStorage}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">RAID Support</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="flex flex-wrap gap-2">
                              {product.specs.storage.raidSupport.map((raid, index) => (
                                <li key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                  {raid}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Storage Interface</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.storageInterface}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Recording Modes</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="list-disc list-inside space-y-1">
                              {product.specs.storage.recordingModes.map((mode, index) => (
                                <li key={index} className="text-slate-600">{mode}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Playback</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.playback}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'network',
                label: 'Network & Connectivity',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Network Interface</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.networkInterface}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">PoE Ports</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.poePorts}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">PoE Standard</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.poeStandard}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Protocols</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="flex flex-wrap gap-2">
                              {product.specs.network.protocols.map((protocol, index) => (
                                <li key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                  {protocol}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Compression</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="flex flex-wrap gap-2">
                              {product.specs.network.compression.map((comp, index) => (
                                <li key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                                  {comp}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Streaming</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.streaming}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Remote Access</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.remoteAccess}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'physical',
                label: 'Physical Specifications',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Dimensions</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.dimensions}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Weight</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.weight}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Material</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.material}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Form Factor</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.formFactor}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Mounting</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.mounting}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'power',
                label: 'Power & Environmental',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Power Consumption</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.powerConsumption}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Voltage</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.voltage}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Power Connector</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.powerConnector}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Power Supply</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.powerSupply}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'features',
                label: 'Features & Analytics',
                content: (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Analytics</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.specs.features.analytics.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-600">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Detection Capabilities</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.specs.features.detection.map((detection, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-600">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{detection}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Management</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.specs.features.management.map((management, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-600">
                            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span>{management}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Integration</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.specs.features.integration.map((integration, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-600">
                            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>{integration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              },
              {
                id: 'compliance',
                label: 'Compliance',
                content: (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2">Certifications</h4>
                      <ul className="flex flex-wrap gap-2">
                        {product.specs.compliance.certifications.map((cert, index) => (
                          <li key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2">Standards</h4>
                      <ul className="flex flex-wrap gap-2">
                        {product.specs.compliance.standards.map((standard, index) => (
                          <li key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {standard}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <table className="w-full mt-4">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Warranty</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.compliance.warranty}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              }
            ]}
            defaultTab="system"
          />
        </div>
      </section>

      {/* Back to Products Button */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/nvr"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Aeroflex NVR
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 py-12 backdrop-blur">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
          <div>
            <div className="relative h-8 w-36 mb-4">
              <Image 
                src={`${DO_ASSET_BASE_URL}/company_logo/aeroskop_logo.webp`} 
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

