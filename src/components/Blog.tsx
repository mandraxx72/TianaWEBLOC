
import { useWordPressPosts } from "@/hooks/useWordPress";
import { useLanguage } from "@/contexts/LanguageContext";
import { stripHtml, formatWordPressDate, getFeaturedImage, getAuthorName, getPostCategories, getExcerpt } from "@/utils/wordpressHelpers";
import BlogHeader from "./blog/BlogHeader";
import LoadingState from "./blog/LoadingState";
import FeaturedPost from "./blog/FeaturedPost";
import PostCard from "./blog/PostCard";
import NewsletterSection from "./blog/NewsletterSection";
import { fallbackPosts } from "./blog/fallbackPosts";
import { getCategoryColor } from "./blog/utils";
import { ProcessedWordPressPost, FallbackPost } from "./blog/types";

const Blog = () => {
  const { language } = useLanguage();
  
  // Buscar posts do WordPress
  const { data: wordPressPosts, isLoading, error } = useWordPressPosts({
    per_page: 6,
  });

  // Usar posts do WordPress se disponíveis, senão usar fallback
  const posts: (ProcessedWordPressPost | FallbackPost)[] = wordPressPosts && wordPressPosts.length > 0 
    ? wordPressPosts.map((post, index): ProcessedWordPressPost => ({
        id: post.id,
        title: stripHtml(post.title.rendered),
        excerpt: getExcerpt(post),
        author: getAuthorName(post),
        date: formatWordPressDate(post.date, language === 'pt' ? 'pt-BR' : 'en-US'),
        category: getPostCategories(post)[0] || 'Geral',
        readTime: '5 min', // Calcular baseado no conteúdo se necessário
        featured: index === 0, // Primeiro post como destaque
        link: `/blog/${post.slug}`,
        image: getFeaturedImage(post) || undefined,
        wpPost: post
      }))
    : fallbackPosts;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error('Erro ao carregar posts:', error);
  }

  return (
    <section id="blog" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <BlogHeader error={error} />

          {/* Featured Post */}
          {posts.filter(post => post.featured).map((post) => (
            <FeaturedPost 
              key={post.id} 
              post={post} 
              getCategoryColor={getCategoryColor} 
            />
          ))}

          {/* Regular Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.filter(post => !post.featured).map((post, index) => (
              <PostCard 
                key={post.id}
                post={post}
                index={index}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>

          <NewsletterSection />
        </div>
      </div>
    </section>
  );
};

export default Blog;
