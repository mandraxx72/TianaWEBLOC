import { WordPressPost, WordPressMedia, WordPressTerm, WordPressReview, WordPressGalleryItem, WordPressEvent } from '@/types/wordpress';

// Helper para remover HTML das strings
export const stripHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Helper para formatar data do WordPress
export const formatWordPressDate = (dateString: string, locale: string = 'pt-BR'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper para obter imagem destacada
export const getFeaturedImage = (post: WordPressPost): string | null => {
  if (post._embedded?.['wp:featuredmedia']?.[0]) {
    const media = post._embedded['wp:featuredmedia'][0] as WordPressMedia;
    return media.source_url;
  }
  return null;
};

// Helper para obter nome do autor
export const getAuthorName = (post: WordPressPost): string => {
  if (post._embedded?.author?.[0]) {
    return post._embedded.author[0].name;
  }
  return 'Casa Tiana';
};

// Helper para obter categorias do post
export const getPostCategories = (post: WordPressPost): string[] => {
  if (post._embedded?.['wp:term']?.[0]) {
    const categories = post._embedded['wp:term'][0] as WordPressTerm[];
    return categories
      .filter(term => term.taxonomy === 'category')
      .map(term => term.name);
  }
  return [];
};

// Helper para obter tags do post
export const getPostTags = (post: WordPressPost): string[] => {
  if (post._embedded?.['wp:term']?.[1]) {
    const tags = post._embedded['wp:term'][1] as WordPressTerm[];
    return tags
      .filter(term => term.taxonomy === 'post_tag')
      .map(term => term.name);
  }
  return [];
};

// Helper para obter excerpt limpo
export const getExcerpt = (post: WordPressPost): string => {
  if (post.excerpt?.rendered) {
    return stripHtml(post.excerpt.rendered);
  }
  
  // Fallback: criar excerpt do conteúdo
  const content = stripHtml(post.content?.rendered || '');
  return content.length > 150 
    ? content.substring(0, 150) + '...'
    : content;
};

// Helper para calcular tempo de leitura estimado
export const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = stripHtml(content).split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min`;
};

// Helper para verificar se um post está publicado
export const isPostPublished = (post: WordPressPost): boolean => {
  return post.status === 'publish' && new Date(post.date) <= new Date();
};

// Helper para obter URL do post
export const getPostUrl = (post: WordPressPost): string => {
  return `/blog/${post.slug}`;
};

// Helper para redimensionar imagem do WordPress
export const getResizedImage = (media: WordPressMedia, size: string = 'medium'): string => {
  if (media.media_details?.sizes?.[size]) {
    return media.media_details.sizes[size].source_url;
  }
  return media.source_url;
};

// Helper para validar URL de imagem
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  return imageExtensions.test(url);
};

// Helper para fallback de imagem
export const getImageWithFallback = (primaryUrl?: string, fallbackUrl?: string): string => {
  if (primaryUrl && isValidImageUrl(primaryUrl)) {
    return primaryUrl;
  }
  
  if (fallbackUrl && isValidImageUrl(fallbackUrl)) {
    return fallbackUrl;
  }
  
  return '/placeholder.svg';
};

// Helpers para Reviews
export const getReviewerName = (review: WordPressReview): string => {
  return review.acf?.reviewer_name || stripHtml(review.title.rendered);
};

export const getReviewRating = (review: WordPressReview): number => {
  return review.acf?.rating || 5;
};

export const getReviewerLocation = (review: WordPressReview): string => {
  return review.acf?.reviewer_location || '';
};

export const getReviewDate = (review: WordPressReview): string => {
  const reviewDate = review.acf?.review_date || review.date;
  return formatWordPressDate(reviewDate);
};

// Helpers para Gallery
export const getGalleryCategory = (item: WordPressGalleryItem): string => {
  return item.acf?.category || 'Geral';
};

export const getGalleryImages = (item: WordPressGalleryItem): string[] => {
  const images: string[] = [];
  
  // Imagem destacada
  if (item._embedded?.['wp:featuredmedia']?.[0]) {
    images.push(item._embedded['wp:featuredmedia'][0].source_url);
  }
  
  // Imagens da galeria ACF (IDs que precisariam ser resolvidos)
  // Em uma implementação real, você precisaria fazer requests adicionais para buscar as imagens
  
  return images;
};

// Helpers para Events
export const getEventDate = (event: WordPressEvent): string => {
  return event.acf?.event_date ? formatWordPressDate(event.acf.event_date) : formatWordPressDate(event.date);
};

export const getEventTime = (event: WordPressEvent): string => {
  return event.acf?.event_time || '';
};

export const getEventLocation = (event: WordPressEvent): string => {
  return event.acf?.event_location || '';
};

export const getEventPrice = (event: WordPressEvent): number => {
  return event.acf?.event_price || 0;
};

export const getDifficultyLevel = (event: WordPressEvent): string => {
  const level = event.acf?.difficulty_level || 'easy';
  const levelMap = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil'
  };
  return levelMap[level];
};

export const getEventDuration = (event: WordPressEvent): string => {
  return event.acf?.duration || '';
};
