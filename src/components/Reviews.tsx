import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import WordPressReviews from "@/components/wordpress/WordPressReviews";

const Reviews = () => {
  const { t, language } = useLanguage();

  const reviewsPt = [
    {
      id: 1,
      title: { rendered: "Maria Silva" },
      content: { rendered: "Uma experiência incrível! A Casa Tiana superou todas as expectativas. O atendimento é excepcional e a conexão com a natureza é única. Voltaremos com certeza!" },
      date: "2023-12-01",
      acf: {
        reviewer_name: "Maria Silva",
        reviewer_location: "São Paulo, SP",
        rating: 5,
        review_date: "2023-12-01"
      }
    },
    {
      id: 2,
      title: { rendered: "João Santos" },
      content: { rendered: "Local perfeito para descansar e se reconectar. Os quartos são lindos, o café da manhã delicioso e a família anfitriã nos fez sentir em casa. Recomendo muito!" },
      date: "2023-11-01",
      acf: {
        reviewer_name: "João Santos",
        reviewer_location: "Rio de Janeiro, RJ",
        rating: 5,
        review_date: "2023-11-01"
      }
    },
    {
      id: 3,
      title: { rendered: "Ana Costa" },
      content: { rendered: "Três dias de pura tranquilidade. A piscina com vista para a serra é um espetáculo! Ideal para quem busca paz e contato com a natureza." },
      date: "2023-10-01",
      acf: {
        reviewer_name: "Ana Costa",
        reviewer_location: "Belo Horizonte, MG",
        rating: 5,
        review_date: "2023-10-01"
      }
    },
    {
      id: 4,
      title: { rendered: "Carlos Oliveira" },
      content: { rendered: "Viagem em família perfeita! As crianças adoraram a propriedade e nós adultos relaxamos como há muito tempo não fazíamos. Lugar mágico!" },
      date: "2023-09-01",
      acf: {
        reviewer_name: "Carlos Oliveira",
        reviewer_location: "Brasília, DF",
        rating: 5,
        review_date: "2023-09-01"
      }
    },
    {
      id: 5,
      title: { rendered: "Fernanda Lima" },
      content: { rendered: "A Casa Tiana é um verdadeiro refúgio. Cada detalhe foi pensado com carinho. A hospitalidade da família é algo que marca para sempre. Voltaremos!" },
      date: "2023-08-01",
      acf: {
        reviewer_name: "Fernanda Lima",
        reviewer_location: "Campinas, SP",
        rating: 5,
        review_date: "2023-08-01"
      }
    },
    {
      id: 6,
      title: { rendered: "Roberto Pereira" },
      content: { rendered: "Lua de mel inesquecível! O romantismo do lugar, combinado com o carinho dos anfitriões, tornou nossa estadia perfeita. Muito obrigado por tudo!" },
      date: "2023-07-01",
      acf: {
        reviewer_name: "Roberto Pereira",
        reviewer_location: "Salvador, BA",
        rating: 5,
        review_date: "2023-07-01"
      }
    }
  ];

  const reviewsEn = [
    {
      id: 1,
      title: { rendered: "Maria Silva" },
      content: { rendered: "An incredible experience! Casa Tiana exceeded all expectations. The service is exceptional and the connection with nature is unique. We will definitely return!" },
      date: "2023-12-01",
      acf: {
        reviewer_name: "Maria Silva",
        reviewer_location: "São Paulo, SP",
        rating: 5,
        review_date: "2023-12-01"
      }
    },
    {
      id: 2,
      title: { rendered: "João Santos" },
      content: { rendered: "Perfect place to rest and reconnect. The rooms are beautiful, the breakfast delicious and the host family made us feel at home. Highly recommend!" },
      date: "2023-11-01",
      acf: {
        reviewer_name: "João Santos",
        reviewer_location: "Rio de Janeiro, RJ",
        rating: 5,
        review_date: "2023-11-01"
      }
    },
    {
      id: 3,
      title: { rendered: "Ana Costa" },
      content: { rendered: "Three days of pure tranquility. The pool with mountain views is spectacular! Ideal for those seeking peace and contact with nature." },
      date: "2023-10-01",
      acf: {
        reviewer_name: "Ana Costa",
        reviewer_location: "Belo Horizonte, MG",
        rating: 5,
        review_date: "2023-10-01"
      }
    },
    {
      id: 4,
      title: { rendered: "Carlos Oliveira" },
      content: { rendered: "Perfect family trip! The children loved the property and we adults relaxed like we hadn't in a long time. Magical place!" },
      date: "2023-09-01",
      acf: {
        reviewer_name: "Carlos Oliveira",
        reviewer_location: "Brasília, DF",
        rating: 5,
        review_date: "2023-09-01"
      }
    },
    {
      id: 5,
      title: { rendered: "Fernanda Lima" },
      content: { rendered: "Casa Tiana is a true refuge. Every detail was thought with care. The family's hospitality is something that stays with you forever. We'll be back!" },
      date: "2023-08-01",
      acf: {
        reviewer_name: "Fernanda Lima",
        reviewer_location: "Campinas, SP",
        rating: 5,
        review_date: "2023-08-01"
      }
    },
    {
      id: 6,
      title: { rendered: "Roberto Pereira" },
      content: { rendered: "Unforgettable honeymoon! The romanticism of the place, combined with the hosts' care, made our stay perfect. Thank you so much for everything!" },
      date: "2023-07-01",
      acf: {
        reviewer_name: "Roberto Pereira",
        reviewer_location: "Salvador, BA",
        rating: 5,
        review_date: "2023-07-01"
      }
    }
  ];

  const reviewsFr = [
    {
      id: 1,
      title: { rendered: "Maria Silva" },
      content: { rendered: "Une expérience incroyable ! Casa Tiana a dépassé toutes les attentes. Le service est exceptionnel et la connexion avec la nature est unique. Nous reviendrons certainement !" },
      date: "2023-12-01",
      acf: {
        reviewer_name: "Maria Silva",
        reviewer_location: "São Paulo, SP",
        rating: 5,
        review_date: "2023-12-01"
      }
    },
    {
      id: 2,
      title: { rendered: "João Santos" },
      content: { rendered: "Endroit parfait pour se reposer et se reconnecter. Les chambres sont magnifiques, le petit-déjeuner délicieux et la famille hôte nous a fait sentir chez nous. Je recommande vivement !" },
      date: "2023-11-01",
      acf: {
        reviewer_name: "João Santos",
        reviewer_location: "Rio de Janeiro, RJ",
        rating: 5,
        review_date: "2023-11-01"
      }
    },
    {
      id: 3,
      title: { rendered: "Ana Costa" },
      content: { rendered: "Trois jours de pure tranquillité. La piscine avec vue sur la montagne est spectaculaire ! Idéal pour ceux qui recherchent la paix et le contact avec la nature." },
      date: "2023-10-01",
      acf: {
        reviewer_name: "Ana Costa",
        reviewer_location: "Belo Horizonte, MG",
        rating: 5,
        review_date: "2023-10-01"
      }
    },
    {
      id: 4,
      title: { rendered: "Carlos Oliveira" },
      content: { rendered: "Voyage en famille parfait ! Les enfants ont adoré la propriété et nous, les adultes, nous nous sommes détendus comme nous ne l'avions pas fait depuis longtemps. Un lieu magique !" },
      date: "2023-09-01",
      acf: {
        reviewer_name: "Carlos Oliveira",
        reviewer_location: "Brasília, DF",
        rating: 5,
        review_date: "2023-09-01"
      }
    },
    {
      id: 5,
      title: { rendered: "Fernanda Lima" },
      content: { rendered: "Casa Tiana est un vrai refuge. Chaque détail a été pensé avec soin. L'hospitalité de la famille est quelque chose qui reste gravé pour toujours. Nous reviendrons !" },
      date: "2023-08-01",
      acf: {
        reviewer_name: "Fernanda Lima",
        reviewer_location: "Campinas, SP",
        rating: 5,
        review_date: "2023-08-01"
      }
    },
    {
      id: 6,
      title: { rendered: "Roberto Pereira" },
      content: { rendered: "Lune de miel inoubliable ! Le romantisme de l'endroit, combiné à l'attention des hôtes, a rendu notre séjour parfait. Merci beaucoup pour tout !" },
      date: "2023-07-01",
      acf: {
        reviewer_name: "Roberto Pereira",
        reviewer_location: "Salvador, BA",
        rating: 5,
        review_date: "2023-07-01"
      }
    }
  ];

  const reviews = language === 'pt' ? reviewsPt : language === 'en' ? reviewsEn : reviewsFr;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
      />
    ));
  };

  return (
    <section id="avaliacoes" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent mb-6 font-playfair">
              {t('reviews.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('reviews.subtitle')}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">4.9</div>
                <div className="flex justify-center mb-2">
                  {renderStars(5)}
                </div>
                <p className="text-muted-foreground">{t('reviews.rating')}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">150+</div>
                <p className="text-muted-foreground">{t('reviews.positive')}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-muted-foreground">{t('reviews.recommend')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Grid - WordPress Integration */}
          <WordPressReviews fallbackReviews={reviews} />

          {/* CTA */}
          <div className="text-center mt-16">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4 font-playfair text-primary">
                  {t('reviews.cta.title')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('reviews.cta.subtitle')}
                </p>
                <div className="text-sm text-muted-foreground">
                  ⭐ {t('events.tripAdvisor')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
