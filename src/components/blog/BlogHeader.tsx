import { useLanguage } from "@/contexts/LanguageContext";

interface BlogHeaderProps {
  error?: Error | null;
}

const BlogHeader = ({ error }: BlogHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="text-center mb-16 animate-fade-in">
      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent mb-6 font-playfair">
        {t('blog.title')}
      </h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {t('blog.subtitle')}
      </p>
      {error && (
        <p className="text-sm text-yellow-600 mt-2">
          {t('blog.connectingWP')}
        </p>
      )}
    </div>
  );
};

export default BlogHeader;
