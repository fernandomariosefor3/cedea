import Navbar from "@/pages/home/components/Navbar";
import HeroSection from "@/pages/home/components/HeroSection";
import HowItWorksSection from "@/pages/home/components/HowItWorksSection";
import AboutSection from "@/pages/home/components/AboutSection";
import ServicesSection from "@/pages/home/components/ServicesSection";
import PortfolioSection from "@/pages/home/components/PortfolioSection";
import PricingSection from "@/pages/home/components/PricingSection";
import TestimonialsSection from "@/pages/home/components/TestimonialsSection";
import FAQSection from "@/pages/home/components/FAQSection";
import ContactSection from "@/pages/home/components/ContactSection";
import Footer from "@/pages/home/components/Footer";
import SeoJsonLd from "@/pages/home/components/SeoJsonLd";

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <SeoJsonLd />
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
