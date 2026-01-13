
// Tipo para posts locais (fallback)
export interface FallbackPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  featured: boolean;
  link: string;
  image?: string;
}

// Tipo para posts do WordPress processados
export interface ProcessedWordPressPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  featured: boolean;
  link: string;
  image?: string;
  wpPost?: any;
}
