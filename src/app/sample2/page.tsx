'use client';

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductShowcase from "@/components/ProductShowcase";
import FeaturedArticles from "@/components/FeaturedArticles";
import CaseStudies from "@/components/CaseStudies";
import LearningSection from "@/components/LearningSection";
import Footer from "@/components/Footer";
import QuickLinksMenu from "@/components/QuickLinksMenu";

export default function Sample2Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section with banner2.mp4 */}
      <HeroSection
        videoSrc="/videos/banner2.mp4"
        title=""
        subtitle=""
        ctaText=""
        ctaLink=""
      />

      {/* Featured Products */}
      <ProductShowcase
        title="Featured Products"
        subtitle="Professional surveillance storage solutions for every scale"
      />

      {/* Featured Articles */}
      <FeaturedArticles
        title="Featured Articles"
        subtitle="Stay updated with the latest insights and technical guides"
      />

      {/* Case Studies */}
      <CaseStudies
        title="Featured Case Studies"
        subtitle="Real-world deployments and success stories"
      />

      {/* Learning Center */}
      <LearningSection
        title="Aeroskop Learning Center"
        subtitle="Master surveillance storage with our comprehensive training platform"
      />

      {/* Footer */}
      <Footer />

      <QuickLinksMenu showCalculator={false} />

    </div>
  );
}
