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
    'ASK-808GP1G1SFP': 'ASK808GP1G1SFP.webp',
    'ASK-816GP2G': 'ASK816GP2G.webp',
    'ASK-824GP1G1SFP': 'ASK824GP1G1SFP.webp'
  };
  
  const filename = imageMap[model] || `${model}.webp`;
  return `${DO_ASSET_BASE_URL}/images/POE_Switch/${filename}`;
};

// POE Switch Product specifications data structure
interface POESwitchSpecs {
  ports: {
    totalPorts: string;
    poePorts: string;
    uplinkPorts: string;
    sfpPorts: string;
    portSpeed: string;
    autoNegotiation: string;
  };
  poe: {
    poeStandard: string;
    poeBudget: string;
    poePerPort: string;
    poeDetection: string;
    poePriority: string;
    powerManagement: string;
  };
  performance: {
    switchingCapacity: string;
    forwardingRate: string;
    macAddressTable: string;
    jumboFrames: string;
    latency: string;
    packetBuffer: string;
  };
  network: {
    layer: string;
    vlanSupport: string;
    qos: string;
    spanningTree: string;
    linkAggregation: string;
    multicast: string;
    management: string;
  };
  physical: {
    dimensions: string;
    weight: string;
    material: string;
    formFactor: string;
    mounting: string;
    ledIndicators: string;
  };
  power: {
    powerConsumption: string;
    voltage: string;
    powerConnector: string;
    powerSupply: string;
    powerEfficiency: string;
  };
  management: {
    managementInterface: string;
    protocols: string[];
    features: string[];
    security: string[];
  };
  compliance: {
    certifications: string[];
    standards: string[];
    warranty: string;
  };
}

interface POESwitchProductData {
  id: number;
  name: string;
  model: string;
  tagline: string;
  description: string;
  specs: POESwitchSpecs;
}

// POE Switch Product specifications database
const poeSwitchProductDatabase: { [key: string]: POESwitchProductData } = {
  'ASK-808GP1G1SFP': {
    id: 1,
    name: 'POE Switches',
    model: 'ASK-808GP1G1SFP',
    tagline: '8-Port Gigabit PoE+ Switch with SFP',
    description: 'Compact unmanaged PoE+ switch designed for small to medium surveillance deployments. The ASK-808GP1G1SFP features 8 Gigabit PoE+ ports with auto-detection and power management, plus an SFP fiber uplink port for extended network reach. Ideal for small office and retail environments requiring reliable power delivery to IP cameras.',
    specs: {
      ports: {
        totalPorts: '9 ports (8× PoE+ + 1× SFP)',
        poePorts: '8× Gigabit PoE+ ports',
        uplinkPorts: '1× Gigabit SFP uplink',
        sfpPorts: '1× SFP slot',
        portSpeed: '10/100/1000 Mbps (auto-negotiation)',
        autoNegotiation: 'Auto MDI/MDIX'
      },
      poe: {
        poeStandard: 'IEEE 802.3at (PoE+)',
        poeBudget: '120W total PoE budget',
        poePerPort: 'Up to 30W per port',
        poeDetection: 'Auto detection and classification',
        poePriority: 'Port priority for power allocation',
        powerManagement: 'Intelligent power management'
      },
      performance: {
        switchingCapacity: '18 Gbps',
        forwardingRate: '13.4 Mpps',
        macAddressTable: '8K entries',
        jumboFrames: 'Up to 9KB',
        latency: '< 5μs (store and forward)',
        packetBuffer: '1.5 MB'
      },
      network: {
        layer: 'Layer 2 (Unmanaged)',
        vlanSupport: 'Basic VLAN support',
        qos: '4 priority queues',
        spanningTree: 'STP/RSTP support',
        linkAggregation: 'Static LAG support',
        multicast: 'IGMP Snooping v1/v2/v3',
        management: 'Web-based management (optional)'
      },
      physical: {
        dimensions: '280 × 180 × 44mm',
        weight: '1.2 kg',
        material: 'Steel chassis',
        formFactor: 'Desktop/rack mountable',
        mounting: 'Wall mount or 19" rack (optional)',
        ledIndicators: 'Power, PoE status, Link/Activity per port'
      },
      power: {
        powerConsumption: 'Max 150W (with full PoE load)',
        voltage: '100-240V AC, 50/60Hz',
        powerConnector: 'Standard AC power cord',
        powerSupply: 'Internal PSU',
        powerEfficiency: '80 Plus certified'
      },
      management: {
        managementInterface: 'Web GUI (optional), SNMP',
        protocols: ['SNMP v1/v2c', 'HTTP', 'HTTPS', 'Telnet'],
        features: ['Port status monitoring', 'PoE power monitoring', 'Firmware upgrade', 'Configuration backup'],
        security: ['Port-based access control', 'MAC address filtering', '802.1X support']
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IEEE 802.3at', 'IEEE 802.3u', 'IEEE 802.3ab'],
        warranty: '3 Years'
      }
    }
  },
  'ASK-816GP2G': {
    id: 2,
    name: 'POE Switches',
    model: 'ASK-816GP2G',
    tagline: '16-Port Gigabit PoE+ Switch',
    description: 'Mid-range managed PoE+ switch offering advanced features for professional surveillance networks. The ASK-816GP2G provides 16 Gigabit PoE+ ports with comprehensive Layer 2 management, VLAN support, QoS, and advanced security features. Perfect for medium-scale deployments requiring network segmentation and traffic prioritization.',
    specs: {
      ports: {
        totalPorts: '18 ports (16× PoE+ + 2× Gigabit uplink)',
        poePorts: '16× Gigabit PoE+ ports',
        uplinkPorts: '2× Gigabit Ethernet uplink',
        sfpPorts: 'N/A',
        portSpeed: '10/100/1000 Mbps (auto-negotiation)',
        autoNegotiation: 'Auto MDI/MDIX'
      },
      poe: {
        poeStandard: 'IEEE 802.3at (PoE+)',
        poeBudget: '240W total PoE budget',
        poePerPort: 'Up to 30W per port',
        poeDetection: 'Auto detection and classification',
        poePriority: 'Configurable port priority',
        powerManagement: 'Advanced power management with scheduling'
      },
      performance: {
        switchingCapacity: '36 Gbps',
        forwardingRate: '26.8 Mpps',
        macAddressTable: '16K entries',
        jumboFrames: 'Up to 9KB',
        latency: '< 5μs (store and forward)',
        packetBuffer: '2 MB'
      },
      network: {
        layer: 'Layer 2 (Managed)',
        vlanSupport: 'IEEE 802.1Q VLAN (4K VLANs)',
        qos: '8 priority queues, 802.1p/DSCP',
        spanningTree: 'STP/RSTP/MSTP',
        linkAggregation: 'Static and LACP (8 groups, 8 ports each)',
        multicast: 'IGMP Snooping v1/v2/v3, MLD Snooping',
        management: 'Web GUI, CLI, SNMP'
      },
      physical: {
        dimensions: '440 × 260 × 44mm',
        weight: '2.1 kg',
        material: 'Steel chassis',
        formFactor: '1U rack mountable',
        mounting: '19" standard rack',
        ledIndicators: 'System, PoE status, Link/Activity/Speed per port'
      },
      power: {
        powerConsumption: 'Max 280W (with full PoE load)',
        voltage: '100-240V AC, 50/60Hz',
        powerConnector: 'Standard AC power cord',
        powerSupply: 'Internal PSU',
        powerEfficiency: '80 Plus Bronze certified'
      },
      management: {
        managementInterface: 'Web GUI, CLI (Telnet/SSH), SNMP',
        protocols: ['SNMP v1/v2c/v3', 'HTTP', 'HTTPS', 'Telnet', 'SSH'],
        features: ['Port mirroring', 'Port-based rate limiting', 'Storm control', 'DHCP Snooping', 'ARP protection', 'Firmware upgrade', 'Configuration backup/restore'],
        security: ['802.1X port authentication', 'MAC address filtering', 'Port security', 'Access control lists', 'IP-MAC-Port binding']
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IEEE 802.3at', 'IEEE 802.3u', 'IEEE 802.3ab', 'IEEE 802.1Q', 'IEEE 802.1p'],
        warranty: '3 Years'
      }
    }
  },
  'ASK-824GP1G1SFP': {
    id: 3,
    name: 'POE Switches',
    model: 'ASK-824GP1G1SFP',
    tagline: '24-Port Gigabit PoE+ Switch with SFP',
    description: 'Enterprise-grade managed PoE+ switch designed for large-scale surveillance deployments. The ASK-824GP1G1SFP features 24 Gigabit PoE+ ports with comprehensive Layer 2/3 management, advanced security, and fiber uplink capability. Built for mission-critical networks requiring high reliability, scalability, and advanced network control.',
    specs: {
      ports: {
        totalPorts: '26 ports (24× PoE+ + 2× Gigabit + 1× SFP)',
        poePorts: '24× Gigabit PoE+ ports',
        uplinkPorts: '2× Gigabit Ethernet uplink',
        sfpPorts: '1× SFP slot',
        portSpeed: '10/100/1000 Mbps (auto-negotiation)',
        autoNegotiation: 'Auto MDI/MDIX'
      },
      poe: {
        poeStandard: 'IEEE 802.3at (PoE+)',
        poeBudget: '370W total PoE budget',
        poePerPort: 'Up to 30W per port',
        poeDetection: 'Auto detection and classification',
        poePriority: 'Configurable port priority with scheduling',
        powerManagement: 'Advanced power management with real-time monitoring'
      },
      performance: {
        switchingCapacity: '52 Gbps',
        forwardingRate: '38.7 Mpps',
        macAddressTable: '32K entries',
        jumboFrames: 'Up to 9KB',
        latency: '< 5μs (store and forward)',
        packetBuffer: '4 MB'
      },
      network: {
        layer: 'Layer 2+ (Managed with Layer 3 features)',
        vlanSupport: 'IEEE 802.1Q VLAN (4K VLANs), Private VLAN',
        qos: '8 priority queues, 802.1p/DSCP/ToS, WRR/SP',
        spanningTree: 'STP/RSTP/MSTP, BPDU protection',
        linkAggregation: 'Static and LACP (8 groups, 8 ports each)',
        multicast: 'IGMP Snooping v1/v2/v3, MLD Snooping, PIM-SM',
        management: 'Web GUI, CLI, SNMP, RMON'
      },
      physical: {
        dimensions: '440 × 300 × 44mm',
        weight: '3.2 kg',
        material: 'Steel chassis',
        formFactor: '1U rack mountable',
        mounting: '19" standard rack',
        ledIndicators: 'System, PoE status, Link/Activity/Speed per port, SFP status'
      },
      power: {
        powerConsumption: 'Max 450W (with full PoE load)',
        voltage: '100-240V AC, 50/60Hz',
        powerConnector: 'Standard AC power cord',
        powerSupply: 'Internal PSU (redundant optional)',
        powerEfficiency: '80 Plus Silver certified'
      },
      management: {
        managementInterface: 'Web GUI, CLI (Telnet/SSH), SNMP, RMON',
        protocols: ['SNMP v1/v2c/v3', 'HTTP', 'HTTPS', 'Telnet', 'SSH', 'RMON'],
        features: ['Port mirroring (4 groups)', 'Port-based rate limiting', 'Storm control', 'DHCP Snooping', 'DHCP Relay', 'ARP protection', 'Static routing', 'RIP v1/v2', 'OSPF', 'Firmware upgrade', 'Configuration backup/restore', 'Event logging'],
        security: ['802.1X port authentication', 'MAC address filtering', 'Port security', 'Access control lists (ACL)', 'IP-MAC-Port binding', 'DoS protection', 'IP source guard']
      },
      compliance: {
        certifications: ['CE', 'FCC', 'RoHS'],
        standards: ['IEEE 802.3at', 'IEEE 802.3u', 'IEEE 802.3ab', 'IEEE 802.1Q', 'IEEE 802.1p', 'IEEE 802.1X'],
        warranty: '3 Years'
      }
    }
  }
};

export default function POESwitchProductDetailPage() {
  const params = useParams();
  const model = params?.model as string;
  const product = poeSwitchProductDatabase[model];

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
              href="/poeswitches"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to POE Switches
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
            <Link href="/poeswitches" className="hover:text-blue-600">POE Switches</Link>
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
                id: 'ports',
                label: 'Port Configuration',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Total Ports</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.ports.totalPorts}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">PoE Ports</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.ports.poePorts}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Uplink Ports</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.ports.uplinkPorts}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">SFP Ports</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.ports.sfpPorts}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Port Speed</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.ports.portSpeed}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Auto Negotiation</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.ports.autoNegotiation}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'poe',
                label: 'PoE Specifications',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">PoE Standard</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.poe.poeStandard}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">PoE Budget</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.poe.poeBudget}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">PoE per Port</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.poe.poePerPort}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">PoE Detection</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.poe.poeDetection}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">PoE Priority</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.poe.poePriority}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Power Management</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.poe.powerManagement}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'performance',
                label: 'Performance & Switching',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Switching Capacity</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.performance.switchingCapacity}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Forwarding Rate</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.performance.forwardingRate}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">MAC Address Table</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.performance.macAddressTable}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Jumbo Frames</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.performance.jumboFrames}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Latency</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.performance.latency}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Packet Buffer</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.performance.packetBuffer}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'network',
                label: 'Network Features',
                content: (
                  <div className="space-y-4">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">Layer</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.layer}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">VLAN Support</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.vlanSupport}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">QoS</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.qos}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Spanning Tree</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.spanningTree}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Link Aggregation</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.linkAggregation}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Multicast</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.multicast}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Management</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.network.management}</td>
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
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">LED Indicators</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.physical.ledIndicators}</td>
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
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-700">Power Efficiency</td>
                          <td className="py-3 px-4 text-slate-600">{product.specs.power.powerEfficiency}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              },
              {
                id: 'management',
                label: 'Management & Security',
                content: (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Management Interface</h4>
                      <p className="text-slate-600 mb-4">{product.specs.management.managementInterface}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Protocols</h4>
                      <ul className="flex flex-wrap gap-2">
                        {product.specs.management.protocols.map((protocol, index) => (
                          <li key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {protocol}
                          </li>
                        ))}
                      </ul>
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
                      <h4 className="font-semibold text-slate-700 mb-3">Security Features</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.specs.management.security.map((security, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-600">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>{security}</span>
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
            defaultTab="ports"
          />
        </div>
      </section>

      {/* Back to Products Button */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/poeswitches"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to POE Switches
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

