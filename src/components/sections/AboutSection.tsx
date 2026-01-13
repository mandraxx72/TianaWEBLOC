import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Award, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import nossaHistoriaImg from "@/assets/nossa-historia.jpg";

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  story?: {
    title: string;
    paragraphs: string[];
  };
  values?: Array<{
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    color: string;
  }>;
}

const AboutSection = ({ title, subtitle, story, values }: AboutSectionProps) => {
  const { t } = useLanguage();

  const defaultValues = [
    {
      icon: Leaf,
      title: t("about.sustainability"),
      description: t("about.sustainability.desc"),
      color: "bg-nature-green/20 text-nature-green",
    },
    {
      icon: Heart,
      title: t("about.hospitality"),
      description: t("about.hospitality.desc"),
      color: "bg-primary/20 text-primary",
    },
    {
      icon: Users,
      title: t("about.community"),
      description: t("about.community.desc"),
      color: "bg-primary/20 text-primary",
    },
  ];

  const sectionValues = values || defaultValues;

  return (
    <section id="sobre" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent mb-6 font-playfair">
              {title || t("about.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{subtitle || t("about.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Story Content */}
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent font-playfair text-center">
                {story?.title || t("about.story.title")}
              </h3>
              {story?.paragraphs ? (
                story.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-lg text-muted-foreground leading-relaxed text-justify">
                    {paragraph}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-lg text-muted-foreground leading-relaxed text-justify">{t("about.story.main")}</p>
                </>
              )}
            </div>

            {/* Video Nossa História */}
            <div className="relative animate-fade-in">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={nossaHistoriaImg}
                      alt="Casa Tiana - Nossa História"
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-xl font-semibold font-playfair">{t("about.hosts")}</p>
                      <p className="text-sm opacity-90">{t("about.hosts.subtitle")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="absolute -bottom-4 -right-4 bg-primary text-white p-4 rounded-full">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sectionValues.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                >
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 ${value.color.split(" ")[0]} rounded-full flex items-center justify-center mx-auto mb-6`}
                    >
                      <IconComponent className={`h-8 w-8 ${value.color.split(" ")[1]}`} />
                    </div>
                    <h4 className="text-xl font-semibold mb-4 font-playfair">{value.title}</h4>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
