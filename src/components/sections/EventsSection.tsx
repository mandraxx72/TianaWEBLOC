
import WordPressEvents from "@/components/wordpress/WordPressEvents";
import { useLanguage } from "@/contexts/LanguageContext";

interface EventsSectionProps {
  onBookingClick: (eventId?: number) => void;
}

const EventsSection = ({ onBookingClick }: EventsSectionProps) => {
  const { t } = useLanguage();

  // Eventos de fallback caso WordPress não esteja disponível
  const fallbackEvents = [
    {
      id: 1,
      title: { rendered: "Trilha da Cachoeira" },
      content: { rendered: "Caminhada guiada até a cachoeira mais famosa da região. Uma experiência única em meio à natureza exuberante." },
      date: "2024-01-15",
      acf: {
        event_date: "2024-01-20",
        event_time: "08:00",
        event_location: "Casa Tiana",
        event_price: 45,
        difficulty_level: "medium" as const,
        duration: "4 horas",
        max_participants: 12,
        included: ["Guia especializado", "Lanche", "Água", "Seguro"],
        booking_required: true
      }
    },
    {
      id: 2,
      title: { rendered: "Observação de Aves" },
      content: { rendered: "Atividade matinal para observação da rica avifauna local. Ideal para amantes da natureza e fotografia." },
      date: "2024-01-15",
      acf: {
        event_date: "2024-01-22",
        event_time: "06:30",
        event_location: "Trilha dos Pássaros",
        event_price: 30,
        difficulty_level: "easy" as const,
        duration: "3 horas",
        max_participants: 8,
        included: ["Binóculos", "Guia ornitólogo", "Café da manhã"],
        booking_required: true
      }
    },
    {
      id: 3,
      title: { rendered: "Piquenique Romântico" },
      content: { rendered: "Experiência especial para casais com cesta de piquenique em local reservado com vista panorâmica." },
      date: "2024-01-15",
      acf: {
        event_date: "2024-01-25",
        event_time: "17:00",
        event_location: "Mirante do Pôr do Sol",
        event_price: 120,
        difficulty_level: "easy" as const,
        duration: "2 horas",
        max_participants: 2,
        included: ["Cesta de piquenique", "Bebidas", "Decoração especial", "Fotografia"],
        booking_required: true
      }
    }
  ];

  return (
    <section id="eventos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent mb-6 font-playfair">
              {t('events.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('events.subtitle')}
            </p>
          </div>

          {/* Events Grid */}
          <WordPressEvents
            fallbackEvents={fallbackEvents}
            onBookingClick={(eventId) => onBookingClick(eventId)}
          />
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
