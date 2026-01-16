
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import Gallery from "@/components/Gallery";
import Rooms from "@/components/Rooms";
import Reviews from "@/components/Reviews";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import EventsSection from "@/components/sections/EventsSection";
import BookingModal from "@/components/BookingModal";

import { siteContent } from "@/components/content/ContentManager";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/seo/SEOHead";
import { useSEO } from "@/hooks/useSEO";


const Index = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { t } = useLanguage();
  const { getPageSEO } = useSEO();
  const seo = getPageSEO('home');

  const handleBookingClick = (eventId?: number) => {
    console.log('Booking click for event:', eventId);
    setIsBookingModalOpen(true);
  };

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
      />
      <Layout
        onBookingClick={() => handleBookingClick()}
        headerProps={{
          siteName: siteContent.siteName
        }}
        footerProps={{
          siteName: siteContent.siteName,
          contactInfo: siteContent.contact,
          socialLinks: siteContent.social
        }}
      >
        <HeroSection
          onBookingClick={() => handleBookingClick()}
          title={siteContent.hero.title}
          subtitle={t('hero.subtitle')}
        />
        <AboutSection />
        <Rooms onBookingClick={() => handleBookingClick()} />
        <Gallery />


        <EventsSection onBookingClick={handleBookingClick} />
        <Reviews />
        <Blog />
        <Contact />


      </Layout>
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
};

export default Index;
