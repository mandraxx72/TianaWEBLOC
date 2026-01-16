import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import HeroBookingForm from "@/components/booking/HeroBookingForm";

interface HeroSectionProps {
  onBookingClick: () => void;
  onCheckAvailability?: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

const HeroSection = ({
  onBookingClick,
  onCheckAvailability,
  title = "Casa Tiana",
  subtitle = "Sua casa de charme na Madeira. Experiência única em meio à natureza exuberante.",
  buttonText,
}: HeroSectionProps) => {
  const [isMuted, setIsMuted] = useState(true);

  const handleCheckAvailability = () => {
    if (onCheckAvailability) {
      onCheckAvailability();
    } else {
      // Scroll to rooms section
      const roomsSection = document.getElementById('quartos');
      if (roomsSection) {
        roomsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/lovable-uploads/sao-vicente-island-cape-verde.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>

        {/* Dark Gradient Overlay for better text readability */}


        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center z-10">
          <div className="animate-fade-in space-y-6 max-w-4xl">
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight drop-shadow-lg">
              {title}
            </h1>
            <p className="font-opensans text-lg md:text-xl lg:text-2xl font-light tracking-wide max-w-2xl mx-auto drop-shadow-md text-white/90">
              {subtitle}
            </p>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onBookingClick}
                className="px-8 py-4 bg-gradient-to-r from-gold-start to-gold-end hover:opacity-95 text-white rounded-full font-medium text-lg transition-all transform hover:scale-105 shadow-glow border-none"
              >
                {buttonText || "Reservar Agora"}
              </button>
              <button
                onClick={handleCheckAvailability}
                className="px-8 py-4 bg-transparent hover:bg-white/10 text-white rounded-full font-medium text-lg transition-all border-2 border-white/80 backdrop-blur-sm"
              >
                Ver Quartos
              </button>
            </div>
          </div>
        </div>

        {/* Audio Control Button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-8 right-8 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20"
          aria-label={isMuted ? "Ativar som" : "Desativar som"}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce cursor-pointer" onClick={handleCheckAvailability}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white w-8 h-8 opacity-80"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
