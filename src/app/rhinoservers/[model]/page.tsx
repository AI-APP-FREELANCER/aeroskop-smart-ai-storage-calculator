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
    'ASK-SR212': 'ASK-SR212.webp',
    'ASK-SR224': 'ASK-SR224.webp'
  };
  
  const filename = imageMap[model] || `${model}.webp`;
  return `${DO_ASSET_BASE_URL}/images/Rhino-storage-server/${filename}`;
};

// Rhino Storage Server Product specifications data structure
interface RhinoStorageSpecs {
  system: {
    processor: string;
    memory: string;
    operatingSystem: string;
    ioThroughput: string;
    cache: string;
    expansionSlots: string;
  };
  storage: {
    driveBays: string;
    maxCapacity: string;
    driveInterface: string;
    driveFormFactor: string;
    hotSwap: string;
    driveTypes: string[];
  };
  raid: {
    raidLevels: string[];
    raidController: string;
    raidCache: string;
    dataProtection: string[];
    rebuildTime: string;
  };
  network: {
    networkInterface: string;
    networkPorts: string;
    protocols: string[];
    management: string;
    remoteAccess: string;
  };
  physical: {
    dimensions: string;
    weight: string;
    formFactor: string;
    mounting: string;
    material: string;
    cooling: string;
  };
  power: {
    powerConsumption: string;
    voltage: string;
    powerSupply: string;
    powerEfficiency: string;
    redundantPSU: string;
  };
  management: {
    managementInterface: string;
    features: string[];
    monitoring: string[];
    alerts: string[];
  };
  compliance: {
    certifications: string[];
    standards: string[];
    warranty: string;
  };
}

interface RhinoStorageProductData {
  id: number;
  name: string;
  model: string;
  tagline: string;
  description: string;
  specs: RhinoStorageSpecs;
}

// Rhino Storage Server Product specifications database
const rhinoStorageProductDatabase: { [key: string]: RhinoStorageProductData } = {
  'ASK-SR212': {
    id: 1,
    name: 'Rhino Storage Server',
    model: 'ASK-SR212',
    tagline: '2U High-Capacity Storage Server',
    description: 'Optimized 2U storage server designed for high-throughput video storage applications. The ASK-SR212 delivers enterprise-grade reliability with advanced RAID protection, hot-swap drive bays, and high I/O performance. Perfect for medium to large surveillance deployments requiring scalable storage capacity and data protection.',
    specs: {
      system: {
        processor: 'Intel Xeon Silver or equivalent',
        memory: '32GB DDR4 ECC (expandable to 256GB)',
        operatingSystem: 'Linux-based storage OS (ZFS/RAID)',
        ioThroughput: 'Up to 2,000 MB/s sequential read/write',
        cache: 'Up to 1GB RAID controller cache',
        expansionSlots: '2× PCIe 3.0 expansion slots'
      },
      storage: {
        driveBays: '12× 3.5" hot-swap drive bays',
        maxCapacity: 'Up to 240TB (12× 20TB drives)',
        driveInterface: 'SATA III (6 Gbps) / SAS 12 Gbps',
        driveFormFactor: '3.5" SATA/SAS',
        hotSwap: 'Yes, all drive bays',
        driveTypes: ['SATA HDD', 'SAS HDD', 'SATA SSD (optional)']
      },
      raid: {
        raidLevels: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6', 'RAID 10', 'RAID 50', 'RAID 60'],
        raidController: 'Hardware RAID controller with battery backup',
        raidCache: 'Up to 1GB with battery backup unit (BBU)',
        dataProtection: ['Hot-spare support', 'Online capacity expansion', 'RAID migration', 'Background rebuild'],
        rebuildTime: 'Automatic rebuild with hot-spare drives'
      },
      network: {
        networkInterface: '2× Gigabit Ethernet ports (10GbE optional)',
        networkPorts: '2× 1GbE (RJ45), optional 10GbE SFP+',
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SFTP', 'NFS', 'CIFS/SMB', 'iSCSI'],
        management: 'Web-based management interface, SNMP',
        remoteAccess: 'Web GUI, SSH, SNMP, API'
      },
      physical: {
        dimensions: '440 × 88 × 700mm (2U rack mount)',
        weight: '18 kg (without drives)',
        formFactor: '2U rack mountable',
        mounting: '19" standard rack',
        material: 'Steel chassis',
        cooling: '4× hot-swap fans with temperature monitoring'
      },
      power: {
        powerConsumption: 'Max 400W (with full drive load)',
        voltage: '100-240V AC, 50/60Hz',
        powerSupply: 'Single 500W PSU (redundant optional)',
        powerEfficiency: '80 Plus Gold certified',
        redundantPSU: 'Optional redundant PSU'
      },
      management: {
        managementInterface: 'Web GUI, CLI, SNMP',
        features: ['Drive health monitoring', 'Temperature monitoring', 'Fan speed control', 'Power management', 'Event logging', 'Email alerts'],
        monitoring: ['Real-time status', 'Performance metrics', 'Capacity utilization', 'Health status'],
        alerts: ['Email notifications', 'SNMP traps', 'System logs', 'LED indicators']
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['UL', 'IEC'],
        warranty: '3 Years'
      }
    }
  },
  'ASK-SR224': {
    id: 2,
    name: 'Rhino Storage Server',
    model: 'ASK-SR224',
    tagline: '4U Enterprise Storage Server',
    description: 'Enterprise-scale 4U storage server built for maximum capacity and performance. The ASK-SR224 features extensive drive bays, advanced RAID protection, and enterprise-grade components. Designed for large-scale surveillance deployments requiring massive storage capacity, high availability, and advanced data protection features.',
    specs: {
      system: {
        processor: 'Dual Intel Xeon Silver or equivalent',
        memory: '64GB DDR4 ECC (expandable to 512GB)',
        operatingSystem: 'Linux-based storage OS (ZFS/RAID)',
        ioThroughput: 'Up to 4,000 MB/s sequential read/write',
        cache: 'Up to 2GB RAID controller cache',
        expansionSlots: '4× PCIe 3.0 expansion slots'
      },
      storage: {
        driveBays: '24× 3.5" hot-swap drive bays',
        maxCapacity: 'Up to 480TB (24× 20TB drives)',
        driveInterface: 'SATA III (6 Gbps) / SAS 12 Gbps',
        driveFormFactor: '3.5" SATA/SAS',
        hotSwap: 'Yes, all drive bays',
        driveTypes: ['SATA HDD', 'SAS HDD', 'SATA SSD (optional)', 'NVMe (optional)']
      },
      raid: {
        raidLevels: ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6', 'RAID 10', 'RAID 50', 'RAID 60', 'RAID 5EE'],
        raidController: 'Dual hardware RAID controllers with battery backup',
        raidCache: 'Up to 2GB with battery backup unit (BBU)',
        dataProtection: ['Hot-spare support', 'Online capacity expansion', 'RAID migration', 'Background rebuild', 'Dual controller failover'],
        rebuildTime: 'Automatic rebuild with hot-spare drives, accelerated rebuild'
      },
      network: {
        networkInterface: '4× Gigabit Ethernet ports (10GbE/25GbE optional)',
        networkPorts: '4× 1GbE (RJ45), optional 10GbE/25GbE SFP+',
        protocols: ['TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SFTP', 'NFS', 'CIFS/SMB', 'iSCSI', 'FC (optional)'],
        management: 'Web-based management interface, SNMP, IPMI',
        remoteAccess: 'Web GUI, SSH, SNMP, API, IPMI'
      },
      physical: {
        dimensions: '440 × 176 × 700mm (4U rack mount)',
        weight: '35 kg (without drives)',
        formFactor: '4U rack mountable',
        mounting: '19" standard rack',
        material: 'Steel chassis',
        cooling: '6× hot-swap fans with temperature monitoring and speed control'
      },
      power: {
        powerConsumption: 'Max 800W (with full drive load)',
        voltage: '100-240V AC, 50/60Hz',
        powerSupply: 'Dual 800W redundant PSU',
        powerEfficiency: '80 Plus Platinum certified',
        redundantPSU: 'Dual redundant PSU (hot-swappable)'
      },
      management: {
        managementInterface: 'Web GUI, CLI, SNMP, IPMI',
        features: ['Drive health monitoring', 'Temperature monitoring', 'Fan speed control', 'Power management', 'Event logging', 'Email alerts', 'Remote KVM', 'BMC management'],
        monitoring: ['Real-time status', 'Performance metrics', 'Capacity utilization', 'Health status', 'Predictive failure analysis'],
        alerts: ['Email notifications', 'SNMP traps', 'System logs', 'LED indicators', 'BMC alerts']
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['UL', 'IEC'],
        warranty: '3 Years'
      }
    }
  }
};

export default function RhinoStorageProductDetailPage() {
  const params = useParams();
  const model = params?.model as string;
  const product = rhinoStorageProductDatabase[model];

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
              href="/rhinoservers"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Rhino Storage Server
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
            <Link href="/rhinoservers" className="hover:text-blue-600">Rhino Storage Server</Link>
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
                          <td className="py-3 px-4 font-semibold text-slate-700">Memory</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.memory}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Operating System</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.operatingSystem}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">I/O Throughput</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.ioThroughput}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Cache</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.cache}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Expansion Slots</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.system.expansionSlots}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'storage',
                label: 'Storage & Capacity',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Drive Bays</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.driveBays}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Max Capacity</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.maxCapacity}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Drive Interface</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.driveInterface}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Drive Form Factor</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.driveFormFactor}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Hot Swap</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.storage.hotSwap}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Drive Types</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="flex flex-wrap gap-2">
                              {product.specs.storage.driveTypes.map((type, index) => (
                                <li key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                  {type}
                                </li>
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
                id: 'raid',
                label: 'RAID & Data Protection',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">RAID Levels</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="flex flex-wrap gap-2">
                              {product.specs.raid.raidLevels.map((level, index) => (
                                <li key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                  {level}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">RAID Controller</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.raid.raidController}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">RAID Cache</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.raid.raidCache}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Data Protection</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="list-disc list-inside space-y-1">
                              {product.specs.raid.dataProtection.map((feature, index) => (
                                <li key={index} className="text-slate-600">{feature}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Rebuild Time</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.raid.rebuildTime}</td>
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
                          <td className="py-3 px-4 font-semibold text-slate-700">Network Ports</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.networkPorts}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Protocols</td>
                          <td className="py-3 px-4 text-slate-600">
                            <ul className="flex flex-wrap gap-2">
                              {product.specs.network.protocols.map((protocol, index) => (
                                <li key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                                  {protocol}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Management</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.management}</td>
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
                          <td className="py-3 px-4 font-semibold text-slate-700">Form Factor</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.formFactor}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Mounting</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.mounting}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Material</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.material}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Cooling</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.cooling}</td>
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
                          <td className="py-3 px-4 font-semibold text-slate-700">Power Supply</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.powerSupply}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Power Efficiency</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.powerEfficiency}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Redundant PSU</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.redundantPSU}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'management',
                label: 'Management & Features',
                content: (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Management Interface</h4>
                      <p className="text-slate-600 mb-4">{product.specs.management.managementInterface}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Management Features</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.specs.management.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-600">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Monitoring</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.specs.management.monitoring.map((monitor, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-600">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>{monitor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Alerts</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.specs.management.alerts.map((alert, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-600">
                            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span>{alert}</span>
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
            href="/rhinoservers"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Rhino Storage Server
          </Link>
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

