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
    'ASK-WS-i9': 'ASK-WS-i9.webp',
    'ASK-WS-X16': 'ASK-WS-X16.webp',
    'WS-CAD-PRO': 'ASK-WS-i9.webp', // Using available image as placeholder
    'WS-NPU-RT': 'ASK-WS-X16.webp' // Using available image as placeholder
  };
  
  const filename = imageMap[model] || `${model}.webp`;
  return `/images/Work_Stations/${filename}`;
};

// Workstation Product specifications data structure
interface WorkstationSpecs {
  system: {
    processor: string;
    processorCores: string;
    processorBaseFreq: string;
    processorMaxFreq: string;
    chipset: string;
    memory: string;
    memoryType: string;
    memorySlots: string;
    maxMemory: string;
  };
  graphics: {
    gpu: string;
    gpuMemory: string;
    gpuType: string;
    videoOutputs: string;
    maxDisplays: string;
    displayPorts: string[];
  };
  storage: {
    primaryStorage: string;
    primaryStorageType: string;
    secondaryStorage: string;
    secondaryStorageType: string;
    storageSlots: string;
    expansionSlots: string;
  };
  connectivity: {
    network: string;
    wireless: string;
    usbPorts: string;
    usbTypes: string[];
    audioPorts: string;
    otherPorts: string[];
  };
  operatingSystem: {
    osOptions: string[];
    preInstalled: string;
    virtualization: string;
    compatibility: string;
  };
  physical: {
    dimensions: string;
    weight: string;
    formFactor: string;
    material: string;
    color: string;
  };
  power: {
    powerSupply: string;
    powerConsumption: string;
    voltage: string;
    efficiency: string;
  };
  compliance: {
    certifications: string[];
    standards: string[];
    warranty: string;
  };
}

interface WorkstationProductData {
  id: number;
  name: string;
  model: string;
  tagline: string;
  description: string;
  specs: WorkstationSpecs;
}

// Workstation Product specifications database
const workstationProductDatabase: { [key: string]: WorkstationProductData } = {
  'ASK-WS-i9': {
    id: 1,
    name: 'Workstation',
    model: 'ASK-WS-i9',
    tagline: 'High-Performance Intel i9 Workstation',
    description: 'High-performance workstation optimized for multi-monitor security monitoring and VMS operations. The ASK-WS-i9 features Intel Core i9 processor, dedicated graphics, and extensive memory capacity. Designed for control room environments requiring reliable, high-throughput video processing and real-time surveillance management.',
    specs: {
      system: {
        processor: 'Intel Core i9-13900K or equivalent',
        processorCores: '24 cores (8 Performance + 16 Efficiency)',
        processorBaseFreq: '3.0 GHz',
        processorMaxFreq: '5.8 GHz (Turbo Boost)',
        chipset: 'Intel Z790 or equivalent',
        memory: '32GB DDR5 (expandable)',
        memoryType: 'DDR5-5600',
        memorySlots: '4× DIMM slots',
        maxMemory: '128GB DDR5'
      },
      graphics: {
        gpu: 'NVIDIA RTX 4060 or equivalent',
        gpuMemory: '8GB GDDR6',
        gpuType: 'Dedicated discrete GPU',
        videoOutputs: '4× DisplayPort 1.4a + 1× HDMI 2.1',
        maxDisplays: 'Up to 5 simultaneous displays',
        displayPorts: ['4× DisplayPort 1.4a', '1× HDMI 2.1']
      },
      storage: {
        primaryStorage: '1TB NVMe SSD',
        primaryStorageType: 'M.2 NVMe PCIe 4.0',
        secondaryStorage: '2TB SATA HDD',
        secondaryStorageType: '3.5" SATA III',
        storageSlots: '2× M.2 NVMe slots, 2× SATA ports',
        expansionSlots: '2× PCIe 4.0 x16, 1× PCIe 4.0 x4'
      },
      connectivity: {
        network: 'Gigabit Ethernet (RJ45)',
        wireless: 'Wi-Fi 6E (802.11ax) + Bluetooth 5.3',
        usbPorts: '10× USB ports',
        usbTypes: ['4× USB 3.2 Gen 2 (Type-A)', '2× USB 3.2 Gen 2 (Type-C)', '4× USB 2.0 (Type-A)'],
        audioPorts: '3× Audio jacks (Line-in, Line-out, Mic-in)',
        otherPorts: ['1× PS/2 (Keyboard/Mouse)', '1× Serial port (optional)']
      },
      operatingSystem: {
        osOptions: ['Windows 11 Pro', 'Windows 10 Pro', 'Linux (Ubuntu/Debian)'],
        preInstalled: 'Windows 11 Pro (or customer choice)',
        virtualization: 'VMware, VirtualBox, Hyper-V support',
        compatibility: 'VMS software compatible (Milestone, Genetec, etc.)'
      },
      physical: {
        dimensions: '450 × 200 × 450mm',
        weight: '12 kg',
        formFactor: 'Mid-tower desktop',
        material: 'Steel chassis with aluminum front panel',
        color: 'Black'
      },
      power: {
        powerSupply: '650W 80 Plus Gold',
        powerConsumption: 'Max 500W under load',
        voltage: '100-240V AC, 50/60Hz',
        efficiency: '80 Plus Gold certified'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['ENERGY STAR', 'EPEAT'],
        warranty: '3 Years'
      }
    }
  },
  'ASK-WS-X16': {
    id: 2,
    name: 'Workstation',
    model: 'ASK-WS-X16',
    tagline: 'Professional X16 Multi-Display Workstation',
    description: 'Professional multi-display workstation designed for high-density video editing and playback in control room environments. The ASK-WS-X16 features powerful graphics processing, extensive video output capabilities, and high-performance storage. Perfect for surveillance operations requiring simultaneous monitoring of multiple camera feeds and advanced video analytics.',
    specs: {
      system: {
        processor: 'Intel Core i7-13700K or equivalent',
        processorCores: '16 cores (8 Performance + 8 Efficiency)',
        processorBaseFreq: '3.4 GHz',
        processorMaxFreq: '5.4 GHz (Turbo Boost)',
        chipset: 'Intel Z790 or equivalent',
        memory: '64GB DDR5 (expandable)',
        memoryType: 'DDR5-5600',
        memorySlots: '4× DIMM slots',
        maxMemory: '128GB DDR5'
      },
      graphics: {
        gpu: 'NVIDIA RTX 4070 or equivalent',
        gpuMemory: '12GB GDDR6X',
        gpuType: 'Dedicated discrete GPU',
        videoOutputs: '6× DisplayPort 1.4a + 2× HDMI 2.1',
        maxDisplays: 'Up to 8 simultaneous displays',
        displayPorts: ['6× DisplayPort 1.4a', '2× HDMI 2.1']
      },
      storage: {
        primaryStorage: '2TB NVMe SSD',
        primaryStorageType: 'M.2 NVMe PCIe 4.0',
        secondaryStorage: '4TB SATA HDD',
        secondaryStorageType: '3.5" SATA III',
        storageSlots: '2× M.2 NVMe slots, 4× SATA ports',
        expansionSlots: '2× PCIe 4.0 x16, 2× PCIe 4.0 x4'
      },
      connectivity: {
        network: 'Dual Gigabit Ethernet (RJ45)',
        wireless: 'Wi-Fi 6E (802.11ax) + Bluetooth 5.3',
        usbPorts: '12× USB ports',
        usbTypes: ['6× USB 3.2 Gen 2 (Type-A)', '4× USB 3.2 Gen 2 (Type-C)', '2× USB 2.0 (Type-A)'],
        audioPorts: '5× Audio jacks (Line-in, Line-out, Mic-in, Headphone, SPDIF)',
        otherPorts: ['1× PS/2 (Keyboard/Mouse)', '1× Serial port', '1× Parallel port (optional)']
      },
      operatingSystem: {
        osOptions: ['Windows 11 Pro', 'Windows 10 Pro', 'Linux (Ubuntu/Debian)'],
        preInstalled: 'Windows 11 Pro (or customer choice)',
        virtualization: 'VMware, VirtualBox, Hyper-V support',
        compatibility: 'VMS software compatible, Multi-display management'
      },
      physical: {
        dimensions: '500 × 220 × 500mm',
        weight: '15 kg',
        formFactor: 'Full-tower desktop',
        material: 'Steel chassis with aluminum front panel',
        color: 'Black/Silver'
      },
      power: {
        powerSupply: '850W 80 Plus Gold',
        powerConsumption: 'Max 700W under load',
        voltage: '100-240V AC, 50/60Hz',
        efficiency: '80 Plus Gold certified'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['ENERGY STAR', 'EPEAT'],
        warranty: '3 Years'
      }
    }
  },
  'WS-CAD-PRO': {
    id: 3,
    name: 'Workstation',
    model: 'WS-CAD-PRO',
    tagline: 'CAD/Design Professional Workstation',
    description: 'Powerful graphics processing workstation designed for design and visualization workloads. The WS-CAD-PRO features professional-grade GPU, high-capacity memory, and fast storage. Ideal for CAD applications, 3D modeling, and design visualization in surveillance system planning and architectural integration.',
    specs: {
      system: {
        processor: 'Intel Xeon W-1370P or equivalent',
        processorCores: '8 cores / 16 threads',
        processorBaseFreq: '3.6 GHz',
        processorMaxFreq: '5.2 GHz (Turbo Boost)',
        chipset: 'Intel W580 or equivalent',
        memory: '64GB DDR4 ECC',
        memoryType: 'DDR4-3200 ECC',
        memorySlots: '4× DIMM slots',
        maxMemory: '128GB DDR4 ECC'
      },
      graphics: {
        gpu: 'NVIDIA RTX A4000 or equivalent',
        gpuMemory: '16GB GDDR6',
        gpuType: 'Professional workstation GPU',
        videoOutputs: '4× DisplayPort 1.4a',
        maxDisplays: 'Up to 4 simultaneous displays',
        displayPorts: ['4× DisplayPort 1.4a']
      },
      storage: {
        primaryStorage: '2TB NVMe SSD',
        primaryStorageType: 'M.2 NVMe PCIe 4.0',
        secondaryStorage: '4TB SATA SSD',
        secondaryStorageType: '2.5" SATA III',
        storageSlots: '2× M.2 NVMe slots, 4× SATA ports',
        expansionSlots: '2× PCIe 4.0 x16, 2× PCIe 4.0 x4'
      },
      connectivity: {
        network: 'Gigabit Ethernet (RJ45)',
        wireless: 'Wi-Fi 6 (802.11ax) + Bluetooth 5.2',
        usbPorts: '10× USB ports',
        usbTypes: ['4× USB 3.2 Gen 2 (Type-A)', '2× USB 3.2 Gen 2 (Type-C)', '4× USB 2.0 (Type-A)'],
        audioPorts: '3× Audio jacks (Line-in, Line-out, Mic-in)',
        otherPorts: ['1× PS/2 (Keyboard/Mouse)']
      },
      operatingSystem: {
        osOptions: ['Windows 11 Pro', 'Windows 10 Pro', 'Linux (Ubuntu/Debian)'],
        preInstalled: 'Windows 11 Pro (or customer choice)',
        virtualization: 'VMware, VirtualBox, Hyper-V support',
        compatibility: 'CAD software compatible (AutoCAD, SolidWorks, etc.)'
      },
      physical: {
        dimensions: '450 × 200 × 450mm',
        weight: '13 kg',
        formFactor: 'Mid-tower desktop',
        material: 'Steel chassis with aluminum front panel',
        color: 'Black'
      },
      power: {
        powerSupply: '750W 80 Plus Gold',
        powerConsumption: 'Max 600W under load',
        voltage: '100-240V AC, 50/60Hz',
        efficiency: '80 Plus Gold certified'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['ENERGY STAR', 'EPEAT'],
        warranty: '3 Years'
      }
    }
  },
  'WS-NPU-RT': {
    id: 4,
    name: 'Workstation',
    model: 'WS-NPU-RT',
    tagline: 'AI/ML Processing Workstation',
    description: 'Neural processing unit optimized workstation for real-time AI analytics. The WS-NPU-RT features advanced AI acceleration, high-performance computing, and extensive memory capacity. Designed for surveillance applications requiring real-time object detection, facial recognition, and intelligent video analytics processing.',
    specs: {
      system: {
        processor: 'Intel Core i9-13900K or equivalent',
        processorCores: '24 cores (8 Performance + 16 Efficiency)',
        processorBaseFreq: '3.0 GHz',
        processorMaxFreq: '5.8 GHz (Turbo Boost)',
        chipset: 'Intel Z790 or equivalent',
        memory: '128GB DDR5',
        memoryType: 'DDR5-5600',
        memorySlots: '4× DIMM slots',
        maxMemory: '128GB DDR5'
      },
      graphics: {
        gpu: 'NVIDIA RTX 4090 or equivalent',
        gpuMemory: '24GB GDDR6X',
        gpuType: 'High-performance AI/ML GPU',
        videoOutputs: '3× DisplayPort 1.4a + 1× HDMI 2.1',
        maxDisplays: 'Up to 4 simultaneous displays',
        displayPorts: ['3× DisplayPort 1.4a', '1× HDMI 2.1']
      },
      storage: {
        primaryStorage: '2TB NVMe SSD',
        primaryStorageType: 'M.2 NVMe PCIe 4.0',
        secondaryStorage: '4TB NVMe SSD',
        secondaryStorageType: 'M.2 NVMe PCIe 4.0',
        storageSlots: '4× M.2 NVMe slots, 2× SATA ports',
        expansionSlots: '2× PCIe 4.0 x16, 2× PCIe 4.0 x4'
      },
      connectivity: {
        network: 'Dual Gigabit Ethernet (RJ45)',
        wireless: 'Wi-Fi 6E (802.11ax) + Bluetooth 5.3',
        usbPorts: '12× USB ports',
        usbTypes: ['6× USB 3.2 Gen 2 (Type-A)', '4× USB 3.2 Gen 2 (Type-C)', '2× USB 2.0 (Type-A)'],
        audioPorts: '3× Audio jacks (Line-in, Line-out, Mic-in)',
        otherPorts: ['1× PS/2 (Keyboard/Mouse)']
      },
      operatingSystem: {
        osOptions: ['Windows 11 Pro', 'Windows 10 Pro', 'Linux (Ubuntu/Debian)'],
        preInstalled: 'Windows 11 Pro (or customer choice)',
        virtualization: 'VMware, VirtualBox, Hyper-V support',
        compatibility: 'AI/ML frameworks (TensorFlow, PyTorch, CUDA)'
      },
      physical: {
        dimensions: '500 × 220 × 500mm',
        weight: '18 kg',
        formFactor: 'Full-tower desktop',
        material: 'Steel chassis with aluminum front panel',
        color: 'Black'
      },
      power: {
        powerSupply: '1000W 80 Plus Platinum',
        powerConsumption: 'Max 850W under load',
        voltage: '100-240V AC, 50/60Hz',
        efficiency: '80 Plus Platinum certified'
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['ENERGY STAR', 'EPEAT'],
        warranty: '3 Years'
      }
    }
  }
};

export default function WorkstationProductDetailPage() {
  const params = useParams();
  const model = params?.model as string;
  const product = workstationProductDatabase[model];

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
              href="/workstations"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Workstations
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
            <Link href="/workstations" className="hover:text-blue-600">Workstations</Link>
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
      <section className="py-16 bg-white">
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
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Processor</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.processor}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Processor Cores</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.processorCores}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Base Frequency</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.processorBaseFreq}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Max Frequency</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.processorMaxFreq}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Chipset</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.chipset}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Memory</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.memory}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Memory Type</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.memoryType}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Memory Slots</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.memorySlots}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Max Memory</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.maxMemory}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'graphics',
                label: 'Display & Graphics',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">GPU</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.graphics.gpu}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">GPU Memory</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.graphics.gpuMemory}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">GPU Type</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.graphics.gpuType}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Video Outputs</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.graphics.videoOutputs}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Max Displays</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.graphics.maxDisplays}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Display Ports</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="list-disc list-inside space-y-1">
                              {product.specs.graphics.displayPorts.map((port, index) => (
                                <li key={index} className="text-slate-600">{port}</li>
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
                id: 'storage',
                label: 'Storage & Memory',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Primary Storage</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.primaryStorage}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Primary Storage Type</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.primaryStorageType}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Secondary Storage</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.secondaryStorage}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Secondary Storage Type</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.secondaryStorageType}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Storage Slots</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.storageSlots}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Expansion Slots</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.expansionSlots}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'connectivity',
                label: 'Connectivity & I/O',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Network</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.connectivity.network}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Wireless</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.connectivity.wireless}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">USB Ports</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.connectivity.usbPorts}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">USB Types</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="list-disc list-inside space-y-1">
                              {product.specs.connectivity.usbTypes.map((type, index) => (
                                <li key={index} className="text-slate-600">{type}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Audio Ports</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.connectivity.audioPorts}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Other Ports</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="list-disc list-inside space-y-1">
                              {product.specs.connectivity.otherPorts.map((port, index) => (
                                <li key={index} className="text-slate-600">{port}</li>
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
                id: 'os',
                label: 'Operating System & Software',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">OS Options</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="flex flex-wrap gap-2">
                              {product.specs.operatingSystem.osOptions.map((os, index) => (
                                <li key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                  {os}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Pre-Installed</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.operatingSystem.preInstalled}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Virtualization</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.operatingSystem.virtualization}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Compatibility</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.operatingSystem.compatibility}</td>
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
                          <td className="py-3 px-4 font-semibold text-slate-700">Form Factor</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.formFactor}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Material</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.material}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Color</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.color}</td>
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
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Power Supply</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.powerSupply}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Power Consumption</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.powerConsumption}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Voltage</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.voltage}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Efficiency</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.efficiency}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'compliance',
                label: 'Compliance & Warranty',
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
            href="/workstations"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Workstations
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

