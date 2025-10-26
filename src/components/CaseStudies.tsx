'use client';

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  description: string;
  image: string;
  solution: string;
  results: string[];
  cameras: number;
  product: string;
  location: string;
}

interface CaseStudiesProps {
  caseStudies?: CaseStudy[];
  title?: string;
  subtitle?: string;
}

const defaultCaseStudies: CaseStudy[] = [
  {
    id: 'retail-deployment',
    title: 'Retail Chain Implements AI-Powered Storage Solution',
    company: 'TechMart Retail',
    industry: 'Retail',
    description: 'Large retail chain deployed AeroStor Nova-360 for 200+ camera surveillance system across multiple locations.',
    image: '/images/case-studies/retail-deployment.jpg',
    solution: 'AeroStor Nova-360 Software-Defined Storage',
    results: [
      '40% reduction in storage costs',
      '99.9% system uptime achieved',
      'Scalable to 500+ cameras',
      'Centralized management across 15 locations'
    ],
    cameras: 200,
    product: 'AeroStor Nova-360',
    location: 'United States'
  },
  {
    id: 'manufacturing-facility',
    title: 'Manufacturing Facility Upgrades to Enterprise Storage',
    company: 'Global Manufacturing Co.',
    industry: 'Manufacturing',
    description: 'Heavy manufacturing facility implemented Rhino ASK-SR224 for high-capacity storage and industrial-grade reliability.',
    image: '/images/case-studies/manufacturing-facility.jpg',
    solution: 'Aeroskop Rhino ASK-SR224 (4U Storage Server)',
    results: [
      '480TB raw storage capacity',
      'Zero downtime in 12 months',
      'Hot-swappable drive support',
      'IPMI remote management'
    ],
    cameras: 100,
    product: 'Rhino ASK-SR224',
    location: 'Germany'
  },
  {
    id: 'office-complex',
    title: 'Corporate Office Complex Deploys All-in-One NVR',
    company: 'MetroCorp Enterprises',
    industry: 'Corporate',
    description: 'Modern office complex implemented AeroFlex AF-64128 for comprehensive surveillance and workstation integration.',
    image: '/images/case-studies/office-complex.jpg',
    solution: 'AeroFlex AF-64128 NVR (Enterprise Solution)',
    results: [
      '128 camera capacity',
      'Integrated VMS and workstation',
      'Video wall support',
      'Redundant power supply'
    ],
    cameras: 50,
    product: 'AeroFlex AF-64128',
    location: 'United Kingdom'
  }
];

export default function CaseStudies({ 
  caseStudies = defaultCaseStudies, 
  title = "Featured Case Studies",
  subtitle = "Real-world deployments and success stories"
}: CaseStudiesProps) {
  return (
    <section className="py-20 bg-gray-50">
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

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {caseStudies.map((caseStudy) => (
            <div
              key={caseStudy.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              {/* Case Study Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Case Study Image</p>
                  </div>
                </div>
              </div>

              {/* Case Study Content */}
              <div className="p-6">
                {/* Industry Badge */}
                <div className="mb-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {caseStudy.industry}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {caseStudy.title}
                </h3>

                {/* Company and Location */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <span className="font-semibold">{caseStudy.company}</span>
                  <span className="mx-2">•</span>
                  <span>{caseStudy.location}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {caseStudy.description}
                </p>

                {/* Solution */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Solution:</h4>
                  <p className="text-sm text-blue-600 font-medium">{caseStudy.solution}</p>
                </div>

                {/* Key Results */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Results:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {caseStudy.results.slice(0, 3).map((result, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Camera Count */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{caseStudy.cameras} cameras deployed</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {caseStudy.product}
                  </span>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
                  Read Full Case Study
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Case Studies CTA */}
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
            View All Case Studies
          </button>
        </div>
      </div>
    </section>
  );
}
