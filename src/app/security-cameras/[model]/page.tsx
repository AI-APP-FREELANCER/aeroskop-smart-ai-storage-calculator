'use client';

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import ProductBanner from "@/components/ProductBanner";
import { generateProductSpecPDF } from "@/lib/pdfGenerator";

// Helper function to get image path based on product model
const getImagePath = (model: string): string => {
  const imageMap: { [key: string]: string } = {
    'ASK-5D-IR': 'ASK-5D-IR.webp',
    'ASK-6DVF-IR': 'ASK-6DVF-IR.webp',
    'ASK-8DVF-IR': 'ASK-8DVF-IR.webp',
    'ASK-8D-IR': 'ASK-8D-IR.webp',
    'ASK-8B-VF-IR': 'ASK-8B-VF-IR.webp',
    'ASK-5B-IR': 'ASK-5B-IR.webp',
    'ASK-PAN-165': 'ASK-PAN-165.webp',
    'ASK-290B-IR': 'ASK-290B-IR-8MP-180.webp',
    'ASK-5036SD-IR': 'ASK-5036SD-IR-IR-PTZ.webp'
  };
  
  const filename = imageMap[model] || `${model}.webp`;
  return `/images/Camera/${filename}`;
};

// Product specifications data structure
interface ProductSpecs {
  video: {
    resolution: string;
    frameRate: string;
    sensor: string;
    lens: string;
    wdr: string;
    dayNight: string;
    minIllumination: string;
    irRange: string;
    fieldOfView: string;
  };
  network: {
    protocols: string[];
    compression: string[];
    streaming: string[];
    onvif: string;
    rtsp: string;
    http: string;
  };
  physical: {
    dimensions: string;
    weight: string;
    weatherRating: string;
    vandalResistance: string;
    material: string;
  };
  power: {
    powerConsumption: string;
    poe: string;
    voltage: string;
    powerConnector: string;
  };
  storage: {
    storageSupport: string[];
    recordingModes: string[];
    maxStorage: string;
  };
  ai: {
    features: string[];
    detection: string[];
    analytics: string[];
  };
  environmental: {
    operatingTemp: string;
    humidity: string;
    altitude: string;
  };
  compliance: {
    certifications: string[];
    standards: string[];
  };
}

interface ProductData {
  id: number;
  name: string;
  model: string;
  tagline: string;
  specs: ProductSpecs;
}

// Product specifications database
const productDatabase: { [key: string]: ProductData } = {
  'ASK-5D-IR': {
    id: 1,
    name: 'Dome Camera',
    model: 'ASK-5D-IR',
    tagline: '4K Ultra-Low Light Surveillance',
    specs: {
      video: {
        resolution: '5MP (2560×1920)',
        frameRate: '30 FPS at Full Resolution',
        sensor: '1/2.7" CMOS',
        lens: '2.8mm Fixed Lens',
        wdr: '120dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.01 Lux (Color), 0.001 Lux (B&W)',
        irRange: '30 meters',
        fieldOfView: '90°'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Dual Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: 'Ø120 × 75mm',
        weight: '450g',
        weatherRating: 'IP66',
        vandalResistance: 'IK10',
        material: 'Metal Housing'
      },
      power: {
        powerConsumption: 'Max 12W',
        poe: 'PoE+ (802.3at)',
        voltage: '12V DC ±10%',
        powerConnector: 'PoE or DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule'],
        maxStorage: '256GB MicroSD'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection'],
        analytics: ['Smart Search', 'Face Detection', 'People Counting']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IP66', 'IK10', 'ONVIF']
      }
    }
  },
  'ASK-6DVF-IR': {
    id: 2,
    name: 'Dome Camera',
    model: 'ASK-6DVF-IR',
    tagline: '6MP Motorized Lens with AI Detection',
    specs: {
      video: {
        resolution: '6MP (3072×2048)',
        frameRate: '25 FPS at Full Resolution',
        sensor: '1/1.8" CMOS',
        lens: '2.8-12mm Motorized Varifocal Lens',
        wdr: '140dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.005 Lux (Color), 0.0005 Lux (B&W)',
        irRange: '30 meters',
        fieldOfView: '90° - 30° (Adjustable)'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP', 'UPnP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Triple Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T, S',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: 'Ø130 × 85mm',
        weight: '520g',
        weatherRating: 'IP66, IK10',
        vandalResistance: 'IK10',
        material: 'Metal Housing with Lightning Protection'
      },
      power: {
        powerConsumption: 'Max 15W',
        poe: 'PoE+ (802.3at)',
        voltage: '12V DC ±10%',
        powerConnector: 'PoE or DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage', 'NVMe Support'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule', 'Alarm'],
        maxStorage: '256GB MicroSD + Edge Storage'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection', 'Face Detection'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection', 'Loitering'],
        analytics: ['Smart Search', 'People Counting', 'Heat Map', 'Behavior Analysis']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS', 'IP66'],
        standards: ['IP66', 'IK10', 'ONVIF 17.06']
      }
    }
  },
  'ASK-8DVF-IR': {
    id: 3,
    name: 'Dome Camera',
    model: 'ASK-8DVF-IR',
    tagline: '8MP 4K Precision Focus Camera',
    specs: {
      video: {
        resolution: '8MP 4K (3840×2160)',
        frameRate: '20 FPS at Full Resolution',
        sensor: '1/1.2" CMOS',
        lens: '2.8-12mm Motorized Varifocal Lens',
        wdr: '140dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.01 Lux (Color), 0.001 Lux (B&W)',
        irRange: '30 meters',
        fieldOfView: '90° - 30° (Adjustable)'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP', 'UPnP', 'P2P'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Dual Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: 'Ø130 × 85mm',
        weight: '550g',
        weatherRating: 'IP66, IK10',
        vandalResistance: 'IK10',
        material: 'Metal Housing with Lightning Protection'
      },
      power: {
        powerConsumption: 'Max 18W',
        poe: 'PoE+ (802.3at)',
        voltage: '12V DC ±10%',
        powerConnector: 'PoE or DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule'],
        maxStorage: '256GB MicroSD'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection'],
        analytics: ['Smart Search', 'Face Detection']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IP66', 'IK10', 'ONVIF']
      }
    }
  },
  'ASK-8D-IR': {
    id: 4,
    name: 'Dome Camera',
    model: 'ASK-8D-IR',
    tagline: 'AI-Powered 4K Ultra HD Streaming',
    specs: {
      video: {
        resolution: '8MP 4K (3840×2160)',
        frameRate: '20 FPS at Full Resolution',
        sensor: '1/1.2" CMOS',
        lens: '2.8mm Fixed Lens',
        wdr: '120dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.01 Lux (Color), 0.001 Lux (B&W)',
        irRange: '30 meters',
        fieldOfView: '90°'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Dual Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: 'Ø120 × 75mm',
        weight: '480g',
        weatherRating: 'IP66',
        vandalResistance: 'IK10',
        material: 'Metal Housing'
      },
      power: {
        powerConsumption: 'Max 15W',
        poe: 'PoE+ (802.3at)',
        voltage: '12V DC ±10%',
        powerConnector: 'PoE or DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule'],
        maxStorage: '256GB MicroSD'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection', 'Face Detection'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection'],
        analytics: ['Smart Search', 'People Counting', 'Behavior Analysis']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IP66', 'IK10', 'ONVIF']
      }
    }
  },
  'ASK-8B-VF-IR': {
    id: 5,
    name: 'Bullet Camera',
    model: 'ASK-8B-VF-IR',
    tagline: 'Versatile Motorized Varifocal Lens',
    specs: {
      video: {
        resolution: '8MP 4K (3840×2160)',
        frameRate: '20 FPS at Full Resolution',
        sensor: '1/1.2" CMOS',
        lens: '2.8-12mm Motorized Varifocal Lens',
        wdr: '120dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.01 Lux (Color), 0.001 Lux (B&W)',
        irRange: '30 meters',
        fieldOfView: '90° - 30° (Adjustable)'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Dual Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: '220 × 95 × 95mm',
        weight: '650g',
        weatherRating: 'IP66',
        vandalResistance: 'IK10',
        material: 'Metal Housing'
      },
      power: {
        powerConsumption: 'Max 18W',
        poe: 'PoE+ (802.3at)',
        voltage: '12V DC ±10%',
        powerConnector: 'PoE or DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule'],
        maxStorage: '256GB MicroSD'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection'],
        analytics: ['Smart Search', 'Face Detection']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IP66', 'IK10', 'ONVIF']
      }
    }
  },
  'ASK-5B-IR': {
    id: 6,
    name: 'Bullet Camera',
    model: 'ASK-5B-IR',
    tagline: 'Smart IR Technology Day/Night Vision',
    specs: {
      video: {
        resolution: '5MP (2560×1920)',
        frameRate: '30 FPS at Full Resolution',
        sensor: '1/2.7" CMOS',
        lens: '2.8mm Fixed Lens',
        wdr: '120dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.01 Lux (Color), 0.001 Lux (B&W)',
        irRange: '30 meters',
        fieldOfView: '90°'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Dual Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: '200 × 90 × 90mm',
        weight: '580g',
        weatherRating: 'IP66',
        vandalResistance: 'IK10',
        material: 'Metal Housing'
      },
      power: {
        powerConsumption: 'Max 12W',
        poe: 'PoE+ (802.3at)',
        voltage: '12V DC ±10%',
        powerConnector: 'PoE or DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule'],
        maxStorage: '256GB MicroSD'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection'],
        analytics: ['Smart Search', 'Face Detection']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IP66', 'IK10', 'ONVIF']
      }
    }
  },
  'ASK-PAN-165': {
    id: 7,
    name: 'Panoramic Camera',
    model: 'ASK-PAN-165',
    tagline: '165° Wide-Angle Panoramic View',
    specs: {
      video: {
        resolution: '8MP (3840×2160)',
        frameRate: '20 FPS at Full Resolution',
        sensor: '1/1.2" CMOS',
        lens: '1.7mm, 165° Fixed Lens',
        wdr: '120dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.01 Lux (Color), 0.001 Lux (B&W)',
        irRange: '30 meters',
        fieldOfView: '165°'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Dual Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: 'Ø120 × 75mm',
        weight: '450g',
        weatherRating: 'IP66',
        vandalResistance: 'IK10',
        material: 'Metal Housing'
      },
      power: {
        powerConsumption: 'Max 12W',
        poe: 'PoE+ (802.3at)',
        voltage: '12V DC ±10%',
        powerConnector: 'PoE or DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule'],
        maxStorage: '256GB MicroSD'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection'],
        analytics: ['Smart Search', 'Face Detection']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IP66', 'IK10', 'ONVIF']
      }
    }
  },
  'ASK-290B-IR': {
    id: 8,
    name: '8MP 180° Day/Night Camera',
    model: 'ASK-290B-IR',
    tagline: 'Dual Lens Comprehensive Coverage',
    specs: {
      video: {
        resolution: '4MP + 4MP (4096×1944)',
        frameRate: '20 FPS at Full Resolution',
        sensor: 'Dual 1/2.7" CMOS',
        lens: '(90° + 90°) Fixed Lens',
        wdr: '120dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.01 Lux (Color), 0.001 Lux (B&W)',
        irRange: '30 meters',
        fieldOfView: '180° (90° + 90°)'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Dual Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: '250 × 95 × 95mm',
        weight: '750g',
        weatherRating: 'IP66, IK10',
        vandalResistance: 'IK10',
        material: 'Metal Housing'
      },
      power: {
        powerConsumption: 'Max 20W',
        poe: 'PoE+ (802.3at)',
        voltage: '12V DC ±10%',
        powerConnector: 'PoE or DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule'],
        maxStorage: '256GB MicroSD'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection'],
        analytics: ['Smart Search', 'Face Detection']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IP66', 'IK10', 'ONVIF']
      }
    }
  },
  'ASK-5036SD-IR': {
    id: 9,
    name: 'IR PTZ Dome Camera',
    model: 'ASK-5036SD-IR',
    tagline: '36x Optical Zoom High-Speed PTZ',
    specs: {
      video: {
        resolution: '5MP (2560×1920)',
        frameRate: '30 FPS at Full Resolution',
        sensor: '1/2.7" CMOS',
        lens: '4.5mm-162mm, 36x Optical Zoom, AF',
        wdr: '120dB',
        dayNight: 'Auto ICR',
        minIllumination: '0.01 Lux (Color), 0.001 Lux (B&W)',
        irRange: '150 meters',
        fieldOfView: '60° - 2.2° (Adjustable)'
      },
      network: {
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SMTP'],
        compression: ['H.265', 'H.264', 'MJPEG'],
        streaming: ['Dual Stream', 'Multi-Stream'],
        onvif: 'ONVIF Profile T',
        rtsp: 'RTSP 1.0',
        http: 'HTTP/HTTPS'
      },
      physical: {
        dimensions: 'Ø200 × 280mm',
        weight: '2.5kg',
        weatherRating: 'IP66, IK10',
        vandalResistance: 'IK10',
        material: 'Metal Housing'
      },
      power: {
        powerConsumption: 'Max 25W',
        poe: 'PoE+ (802.3at)',
        voltage: '24V AC or 12V DC',
        powerConnector: 'PoE or AC/DC Jack'
      },
      storage: {
        storageSupport: ['MicroSD (up to 256GB)', 'Edge Storage'],
        recordingModes: ['Continuous', 'Motion Detection', 'Schedule', 'Preset'],
        maxStorage: '256GB MicroSD'
      },
      ai: {
        features: ['Motion Detection', 'Human Detection', 'Vehicle Detection', 'Auto Tracking'],
        detection: ['Intrusion Detection', 'Line Crossing', 'Object Detection', 'Target Tracking'],
        analytics: ['Smart Search', 'Face Detection', 'Auto Tracking']
      },
      environmental: {
        operatingTemp: '-40°C to +60°C',
        humidity: '10% to 90% (non-condensing)',
        altitude: 'Up to 4000m'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IP66', 'IK10', 'ONVIF']
      }
    }
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const model = params?.model as string;
  const product = productDatabase[model];

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
              href="/security-cameras"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Security Cameras
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
      <ProductBanner productId={product.model} />
      
      {/* Breadcrumb Navigation */}
      <section className="pt-12 pb-4 bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/security-cameras" className="hover:text-blue-600">Security Cameras</Link>
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
            <p className="text-lg text-slate-700">
              {product.tagline}
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
                id: 'video',
                label: 'Video & Image',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Resolution</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.resolution}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Frame Rate</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.frameRate}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Sensor</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.sensor}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Lens</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.lens}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">WDR</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.wdr}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Day/Night</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.dayNight}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Min Illumination</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.minIllumination}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">IR Range</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.irRange}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Field of View</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.video.fieldOfView}</td>
                    </tr>
                  </tbody>
                </table>
                  </div>
                )
              },
              {
                id: 'network',
                label: 'Network',
                content: (
                  <div className="space-y-4">
                    <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Protocols</h4>
                  <ul className="flex flex-wrap gap-2">
                    {product.specs.network.protocols.map((protocol, index) => (
                      <li key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {protocol}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Compression</h4>
                  <ul className="flex flex-wrap gap-2">
                    {product.specs.network.compression.map((comp, index) => (
                      <li key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                        {comp}
                      </li>
                    ))}
                  </ul>
                </div>
                <table className="w-full mt-4">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">ONVIF</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.network.onvif}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">RTSP</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.network.rtsp}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">HTTP</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.network.http}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Streaming</td>
                      <td className="py-3 px-4 text-slate-600">
                        <ul className="list-disc list-inside space-y-1">
                          {product.specs.network.streaming.map((stream, index) => (
                            <li key={index} className="text-slate-600">{stream}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
                  </div>
                )
              },
              {
                id: 'physical',
                label: 'Physical',
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
                    <td className="py-3 px-4 font-semibold text-slate-700">Weather Rating</td>
                    <td className="py-3 px-4 text-slate-600">{product.specs.physical.weatherRating}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700">Vandal Resistance</td>
                    <td className="py-3 px-4 text-slate-600">{product.specs.physical.vandalResistance}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700">Material</td>
                    <td className="py-3 px-4 text-slate-600">{product.specs.physical.material}</td>
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
                      <td className="py-3 px-4 font-semibold text-slate-700">PoE</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.power.poe}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Voltage</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.power.voltage}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Power Connector</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.power.powerConnector}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full mt-4">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Operating Temperature</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.environmental.operatingTemp}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Humidity</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.environmental.humidity}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700">Altitude</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.environmental.altitude}</td>
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
                    <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Storage Support</h4>
                  <ul className="space-y-2">
                    {product.specs.storage.storageSupport.map((storage, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{storage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Recording Modes</h4>
                  <ul className="space-y-2">
                    {product.specs.storage.recordingModes.map((mode, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{mode}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <table className="w-full mt-4">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Max Storage</td>
                      <td className="py-3 px-4 text-slate-600">{product.specs.storage.maxStorage}</td>
                    </tr>
                  </tbody>
                </table>
                  </div>
                )
              },
              {
                id: 'ai',
                label: 'AI & Analytics',
                content: (
                  <div className="space-y-6">
                    <div>
                  <h4 className="font-semibold text-slate-700 mb-3">AI Features</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.specs.ai.features.map((feature, index) => (
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
                    {product.specs.ai.detection.map((detection, index) => (
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
                  <h4 className="font-semibold text-slate-700 mb-3">Analytics</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.specs.ai.analytics.map((analytic, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600">
                        <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>{analytic}</span>
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
                  </div>
                )
              }
            ]}
            defaultTab="video"
          />
        </div>
      </section>

      {/* Back to Products Button */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/security-cameras"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Security Cameras
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 py-12 backdrop-blur">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
          <div>
            <div className="relative h-8 w-36 mb-4">
              <Image 
                src="/images/company_logo/aeroskop_logo.png" 
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

