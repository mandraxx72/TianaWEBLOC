
export const WORDPRESS_CONFIG = {
  // URL base da API REST do WordPress
  baseUrl: import.meta.env.VITE_WORDPRESS_URL || 'https://seu-site-wordpress.com/wp-json/wp/v2',
  
  // Configurações de timeout
  timeout: 10000,
  
  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
  },
  
  // Configurações de cache (em minutos)
  cache: {
    posts: 5,
    pages: 15,
    rooms: 10,
  },
  
  // Configurações de paginação
  pagination: {
    defaultPerPage: 10,
    maxPerPage: 100,
  },
};

// Função para construir URLs da API
export const buildApiUrl = (endpoint: string, params?: Record<string, any>) => {
  const url = new URL(`${WORDPRESS_CONFIG.baseUrl}/${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  return url.toString();
};

// Status do WordPress (para fallback)
export const getWordPressStatus = () => {
  return Boolean(import.meta.env.VITE_WORDPRESS_URL);
};
