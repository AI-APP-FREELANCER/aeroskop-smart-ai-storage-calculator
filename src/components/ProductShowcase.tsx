'use client';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  specs: string[];
  features: string[];
  bestFor: string;
}

interface ProductShowcaseProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

const defaultProducts: Product[] = [
  {
    id: 'aero-flex-1632',
    name: 'AeroFlex AF-1632 NVR',
    category: 'All-in-One Solution',
    description: 'Compact NVR solution for small to medium businesses with expandable storage and professional graphics.',
    image: '/images/products/aeroflex-1632.jpg',
    specs: ['16-32 Channels', 'Intel Core i5', '16GB RAM', '9x HDD Bays'],
    features: ['VMS + Recording', 'Workstation + Video Wall', 'NVIDIA T 400 4GB'],
    bestFor: 'Small to medium businesses, 16-32 cameras'
  },
  {
    id: 'aero-flex-3264',
    name: 'AeroFlex AF-3264 NVR',
    category: 'Mid-Range Solution',
    description: 'Powerful NVR for medium to large businesses with enhanced processing and storage capabilities.',
    image: '/images/products/aeroflex-3264.jpg',
    specs: ['32-64 Channels', 'Intel Core i7', '32GB RAM', '9x HDD Bays'],
    features: ['VMS + Recording', 'Workstation + Video Wall', 'NVIDIA RTX 1000 4GB'],
    bestFor: 'Medium to large businesses, 32-64 cameras'
  },
  {
    id: 'aero-flex-64128',
    name: 'AeroFlex AF-64128 NVR',
    category: 'Enterprise Solution',
    description: 'Enterprise-grade NVR with maximum performance and redundancy for large-scale deployments.',
    image: '/images/products/aeroflex-64128.jpg',
    specs: ['64-128 Channels', 'Intel Core i9', '64GB RAM', '9x HDD Bays'],
    features: ['VMS + Recording', 'Workstation + Video Wall', 'NVIDIA RTX A2000 12GB'],
    bestFor: 'Large enterprises, 64-128 cameras'
  },
  {
    id: 'rhino-sr212',
    name: 'Aeroskop Rhino ASK-SR212',
    category: '2U Storage Server',
    description: 'High-capacity storage server with enterprise-grade reliability and hot-swappable drives.',
    image: '/images/products/rhino-sr212.jpg',
    specs: ['12x HDD Bays', '240TB Raw Capacity', 'Dual Xeon Silver', '64GB DDR5 ECC'],
    features: ['Hot-swappable Drives', 'IPMI Management', 'Dual Redundant PSU'],
    bestFor: 'High-capacity storage, 250-350 cameras'
  },
  {
    id: 'rhino-sr224',
    name: 'Aeroskop Rhino ASK-SR224',
    category: '4U Storage Server',
    description: 'Enterprise storage server with maximum capacity and advanced redundancy features.',
    image: '/images/products/rhino-sr224.jpg',
    specs: ['24x HDD Bays', '480TB Raw Capacity', 'Dual Xeon Silver', '128GB DDR5 ECC'],
    features: ['Hot-swappable Drives', 'IPMI Management', 'Dual Redundant PSU'],
    bestFor: 'Enterprise storage, 350-400 cameras'
  },
  {
    id: 'aerostor-nova-360',
    name: 'AeroStor Nova-360',
    category: 'Software-Defined Storage',
    description: 'Scalable software-defined storage with unlimited capacity and self-healing capabilities.',
    image: '/images/products/aerostor-nova-360.jpg',
    specs: ['Unlimited Storage', 'Ceph-powered SDS', 'High Availability', 'Fault Tolerance'],
    features: ['Distributed Clustering', 'Self-healing', 'Erasure Coding', 'No Licensing Fees'],
    bestFor: 'Large-scale deployments, cloud-like storage'
  }
];

export default function ProductShowcase({ 
  products = defaultProducts, 
  title = "Featured Products",
  subtitle = "Professional surveillance storage solutions for every scale"
}: ProductShowcaseProps) {
  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Product Image</p>
                  </div>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Key Specs */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Specifications:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.specs.slice(0, 3).map((spec, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-3 h-3 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best For */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Best for:</span> {product.bestFor}
                  </p>
                </div>


              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
