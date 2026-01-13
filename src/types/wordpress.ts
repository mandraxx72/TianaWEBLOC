// Tipos base do WordPress
export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _links: Record<string, any>;
  _embedded?: {
    author?: WordPressUser[];
    'wp:featuredmedia'?: WordPressMedia[];
    'wp:term'?: WordPressTerm[][];
  };
}

export interface WordPressPage {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

export interface WordPressUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    '24': string;
    '48': string;
    '96': string;
  };
  meta: Record<string, any>;
  _links: Record<string, any>;
}

export interface WordPressMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta: Record<string, any>;
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: 'image' | 'video' | 'audio' | 'file';
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: Record<string, {
      file: string;
      width: number;
      height: number;
      mime_type: string;
      source_url: string;
    }>;
  };
  post: number;
  source_url: string;
  _links: Record<string, any>;
}

export interface WordPressTerm {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'category' | 'post_tag' | 'nav_menu' | string;
  parent: number;
  meta: Record<string, any>;
  _links: Record<string, any>;
}

// Tipos customizados para a aplicação
export interface WordPressRoom {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_media: number;
  acf?: {
    price?: number;
    capacity?: number;
    amenities?: string[];
    gallery?: number[];
  };
  _embedded?: {
    'wp:featuredmedia'?: WordPressMedia[];
  };
}

// Tipos customizados para Reviews
export interface WordPressReview {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  slug: string;
  status: 'publish' | 'draft';
  acf?: {
    reviewer_name?: string;
    reviewer_location?: string;
    rating?: number;
    review_date?: string;
    reviewer_avatar?: string;
    platform?: string;
  };
  _links: Record<string, any>;
}

// Tipos customizados para Gallery
export interface WordPressGalleryItem {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  slug: string;
  status: 'publish' | 'draft';
  featured_media: number;
  acf?: {
    gallery_images?: number[];
    category?: string;
    location?: string;
    photographer?: string;
    description?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: WordPressMedia[];
  };
  _links: Record<string, any>;
}

// Tipos customizados para Events
export interface WordPressEvent {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  slug: string;
  status: 'publish' | 'draft';
  featured_media: number;
  acf?: {
    event_date?: string;
    event_time?: string;
    event_location?: string;
    event_price?: number;
    max_participants?: number;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    duration?: string;
    included?: string[];
    requirements?: string[];
    booking_required?: boolean;
  };
  _embedded?: {
    'wp:featuredmedia'?: WordPressMedia[];
  };
  _links: Record<string, any>;
}

// Parâmetros para queries
export interface WordPressQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  author?: number;
  author_exclude?: number[];
  before?: string;
  after?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'author' | 'date' | 'id' | 'include' | 'modified' | 'parent' | 'relevance' | 'slug' | 'include_slugs' | 'title';
  slug?: string;
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  categories?: number;
  categories_exclude?: number[];
  tags?: number;
  tags_exclude?: number[];
  sticky?: boolean;
  _embed?: boolean;
}
