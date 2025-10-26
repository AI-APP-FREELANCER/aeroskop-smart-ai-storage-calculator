'use client';

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductShowcase from "@/components/ProductShowcase";
import FeaturedArticles from "@/components/FeaturedArticles";
import CaseStudies from "@/components/CaseStudies";
import LearningSection from "@/components/LearningSection";
import Footer from "@/components/Footer";
import QuickLinksMenu from "@/components/QuickLinksMenu";

export default function Sample3Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section with banner4.mp4 */}
      <HeroSection
        videoSrc="/videos/banner4.mp4"
        title=""
        subtitle=""
        ctaText=""
        ctaLink=""
      />

      {/* Featured Products */}
      <ProductShowcase
        title="Enterprise Solutions"
        subtitle="High-performance storage infrastructure for large-scale deployments"
      />

      {/* Featured Articles */}
      <FeaturedArticles
        title="Technical Insights"
        subtitle="Expert analysis and best practices for enterprise storage"
      />

      {/* Case Studies */}
      <CaseStudies
        title="Enterprise Deployments"
        subtitle="Large-scale implementations and success stories"
      />

      {/* Learning Center */}
      <LearningSection
        title="Enterprise Training Center"
        subtitle="Advanced training for enterprise storage professionals"
      />

      {/* Footer */}
      <Footer />

      <QuickLinksMenu showCalculator={false} />

    </div>
  );
}
