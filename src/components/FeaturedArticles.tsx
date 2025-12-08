'use client';

import { DO_ASSET_BASE_URL } from '@/lib/constants';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
}

interface FeaturedArticlesProps {
  articles?: Article[];
  title?: string;
  subtitle?: string;
}

const defaultArticles: Article[] = [
  {
    id: 'storage-optimization-tips',
    title: '5 Essential Storage Optimization Tips for Surveillance Systems',
    excerpt: 'Learn how to maximize your surveillance storage efficiency with these proven optimization techniques and best practices.',
    image: `${DO_ASSET_BASE_URL}/images/articles/storage-optimization.webp`,
    date: '2024-01-15',
    category: 'Technical Guide',
    readTime: '5 min read',
    author: 'Aeroskop Team'
  },
  {
    id: 'ai-recommendations-benefits',
    title: 'How AI-Powered Storage Recommendations Save You Money',
    excerpt: 'Discover how intelligent storage recommendations can reduce costs by up to 40% while improving system performance.',
    image: `${DO_ASSET_BASE_URL}/images/articles/ai-benefits.webp`,
    date: '2024-01-10',
    category: 'AI Technology',
    readTime: '7 min read',
    author: 'Dr. Sarah Chen'
  },
  {
    id: 'enterprise-deployment-guide',
    title: 'Enterprise Surveillance Storage: A Complete Deployment Guide',
    excerpt: 'Everything you need to know about deploying large-scale surveillance storage solutions for enterprise environments.',
    image: `${DO_ASSET_BASE_URL}/images/articles/enterprise-guide.webp`,
    date: '2024-01-05',
    category: 'Enterprise',
    readTime: '12 min read',
    author: 'Michael Rodriguez'
  },
  {
    id: 'product-comparison-2024',
    title: 'Aeroskop Storage Solutions: Complete Product Comparison 2024',
    excerpt: 'Compare all Aeroskop storage solutions side-by-side to find the perfect fit for your surveillance requirements.',
    image: `${DO_ASSET_BASE_URL}/images/articles/product-comparison.webp`,
    date: '2024-01-01',
    category: 'Product Review',
    readTime: '8 min read',
    author: 'Aeroskop Team'
  }
];

export default function FeaturedArticles({ 
  articles = defaultArticles, 
  title = "Featured Articles",
  subtitle = "Stay updated with the latest insights and technical guides"
}: FeaturedArticlesProps) {
  return (
    <section className="py-20 bg-white">
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

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
            >
              {/* Article Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium">Article Image</p>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                {/* Category and Date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(article.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Author and Read Time */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>By {article.author}</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Articles CTA */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
}
