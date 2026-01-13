import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { WordPressAPI } from '@/services/wordpressApi';
import { WordPressPost, WordPressPage, WordPressRoom, WordPressReview, WordPressGalleryItem, WordPressEvent } from '@/types/wordpress';

// Hook para buscar posts do blog
export const useWordPressPosts = (params?: {
  page?: number;
  per_page?: number;
  categories?: number;
  search?: string;
}): UseQueryResult<WordPressPost[], Error> => {
  return useQuery({
    queryKey: ['wordpress-posts', params],
    queryFn: () => WordPressAPI.getPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

// Hook para buscar um post específico
export const useWordPressPost = (slug: string): UseQueryResult<WordPressPost | null, Error> => {
  return useQuery({
    queryKey: ['wordpress-post', slug],
    queryFn: () => WordPressAPI.getPost(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });
};

// Hook para buscar uma página
export const useWordPressPage = (slug: string): UseQueryResult<WordPressPage | null, Error> => {
  return useQuery({
    queryKey: ['wordpress-page', slug],
    queryFn: () => WordPressAPI.getPage(slug),
    enabled: !!slug,
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 2,
  });
};

// Hook para buscar quartos
export const useWordPressRooms = (): UseQueryResult<WordPressRoom[], Error> => {
  return useQuery({
    queryKey: ['wordpress-rooms'],
    queryFn: () => WordPressAPI.getRooms(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });
};

// Hook para buscar reviews
export const useWordPressReviews = (): UseQueryResult<WordPressReview[], Error> => {
  return useQuery({
    queryKey: ['wordpress-reviews'],
    queryFn: () => WordPressAPI.getReviews(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });
};

// Hook para buscar galeria
export const useWordPressGallery = (): UseQueryResult<WordPressGalleryItem[], Error> => {
  return useQuery({
    queryKey: ['wordpress-gallery'],
    queryFn: () => WordPressAPI.getGalleryItems(),
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 2,
  });
};

// Hook para buscar eventos
export const useWordPressEvents = (): UseQueryResult<WordPressEvent[], Error> => {
  return useQuery({
    queryKey: ['wordpress-events'],
    queryFn: () => WordPressAPI.getEvents(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });
};
