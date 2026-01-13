import axios from 'axios';
import { WORDPRESS_CONFIG, buildApiUrl } from '@/config/wordpress';
import { 
  WordPressPost, 
  WordPressPage, 
  WordPressRoom, 
  WordPressQueryParams, 
  WordPressReview, 
  WordPressGalleryItem, 
  WordPressEvent 
} from '@/types/wordpress';

// Criar instância do axios com configurações padrão
const api = axios.create({
  timeout: WORDPRESS_CONFIG.timeout,
  headers: WORDPRESS_CONFIG.headers,
});

export class WordPressAPI {
  // Buscar posts do blog
  static async getPosts(params?: WordPressQueryParams): Promise<WordPressPost[]> {
    try {
      const url = buildApiUrl('posts', {
        ...params,
        _embed: true, // Incluir dados relacionados (autor, imagem destacada, etc.)
      });
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar posts do WordPress:', error);
      throw error;
    }
  }

  // Buscar um post específico por slug
  static async getPost(slug: string): Promise<WordPressPost | null> {
    try {
      const url = buildApiUrl('posts', {
        slug,
        _embed: true,
      });
      
      const response = await api.get(url);
      const posts = response.data;
      
      return posts.length > 0 ? posts[0] : null;
    } catch (error) {
      console.error(`Erro ao buscar post '${slug}':`, error);
      throw error;
    }
  }

  // Buscar uma página por slug
  static async getPage(slug: string): Promise<WordPressPage | null> {
    try {
      const url = buildApiUrl('pages', {
        slug,
        _embed: true,
      });
      
      const response = await api.get(url);
      const pages = response.data;
      
      return pages.length > 0 ? pages[0] : null;
    } catch (error) {
      console.error(`Erro ao buscar página '${slug}':`, error);
      throw error;
    }
  }

  // Buscar quartos (custom post type)
  static async getRooms(): Promise<WordPressRoom[]> {
    try {
      const url = buildApiUrl('rooms', {
        _embed: true,
        per_page: 50,
      });
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar quartos do WordPress:', error);
      throw error;
    }
  }

  // Buscar categorias
  static async getCategories() {
    try {
      const url = buildApiUrl('categories', {
        per_page: 100,
      });
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  // Buscar tags
  static async getTags() {
    try {
      const url = buildApiUrl('tags', {
        per_page: 100,
      });
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      throw error;
    }
  }

  // Verificar conectividade com WordPress
  static async checkConnection(): Promise<boolean> {
    try {
      const url = buildApiUrl('posts', { per_page: 1 });
      await api.get(url);
      return true;
    } catch (error) {
      console.warn('WordPress não conectado:', error);
      return false;
    }
  }

  // Buscar reviews (custom post type)
  static async getReviews(): Promise<WordPressReview[]> {
    try {
      const url = buildApiUrl('reviews', {
        _embed: true,
        per_page: 50,
        status: 'publish',
      });
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar reviews do WordPress:', error);
      throw error;
    }
  }

  // Buscar itens da galeria (custom post type)
  static async getGalleryItems(): Promise<WordPressGalleryItem[]> {
    try {
      const url = buildApiUrl('gallery', {
        _embed: true,
        per_page: 100,
        status: 'publish',
      });
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar galeria do WordPress:', error);
      throw error;
    }
  }

  // Buscar eventos (custom post type)
  static async getEvents(): Promise<WordPressEvent[]> {
    try {
      const url = buildApiUrl('events', {
        _embed: true,
        per_page: 50,
        status: 'publish',
      });
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eventos do WordPress:', error);
      throw error;
    }
  }
}
