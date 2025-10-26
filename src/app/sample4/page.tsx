'use client';

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductShowcase from "@/components/ProductShowcase";
import FeaturedArticles from "@/components/FeaturedArticles";
import CaseStudies from "@/components/CaseStudies";
import LearningSection from "@/components/LearningSection";
import Footer from "@/components/Footer";
import QuickLinksMenu from "@/components/QuickLinksMenu";

export default function Sample4Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section with banner3.mp4 */}
      <HeroSection
        videoSrc="/videos/banner3.mp4"
        title=""
        subtitle=""
        ctaText=""
        ctaLink=""
      />

      {/* Featured Products */}
      <ProductShowcase
        title="AI-Powered Solutions"
        subtitle="Intelligent storage recommendations powered by advanced AI technology"
      />

      {/* Featured Articles */}
      <FeaturedArticles
        title="AI & Technology"
        subtitle="Latest insights on AI-powered storage optimization and intelligent recommendations"
      />

      {/* Case Studies */}
      <CaseStudies
        title="AI Success Stories"
        subtitle="Real-world implementations of AI-powered storage solutions"
      />

      {/* Learning Center */}
      <LearningSection
        title="AI Learning Center"
        subtitle="Master AI-powered storage optimization with our comprehensive training"
      />

      {/* Footer */}
      <Footer />

      <QuickLinksMenu showCalculator={false} />

    </div>
  );
}
