import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const NewsletterSection = () => {
  const { t } = useLanguage();

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4 font-playfair text-primary">
          {t('blog.newsletter.title')}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {t('blog.newsletter.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder={t('blog.newsletter.placeholder')}
            className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button className="bg-primary hover:bg-primary/90">
            {t('blog.newsletter.button')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {t('blog.newsletter.disclaimer')}
        </p>
      </CardContent>
    </Card>
  );
};

export default NewsletterSection;
