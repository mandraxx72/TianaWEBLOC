import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  siteName?: string;
  twitterHandle?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_SEO = {
  siteName: 'Casa Tiana',
  title: 'Casa Tiana - Guesthouse & Hospedagem em Mindelo, São Vicente',
  description: 'Descubra a Casa Tiana, uma guesthouse acolhedora em Mindelo, São Vicente, Cabo Verde. Quartos confortáveis com vista para o mar, pequeno-almoço incluído e localização privilegiada.',
  image: '/og-image.jpg',
  url: 'https://casatiana.cv',
  keywords: ['guesthouse', 'pousada', 'hospedagem', 'Casa Tiana', 'Mindelo', 'São Vicente', 'Cabo Verde', 'turismo', 'hotel', 'alojamento'],
  author: 'Casa Tiana',
  locale: 'pt_PT',
  twitterHandle: '@casatiana',
};

export const SEOHead = ({
  title,
  description = DEFAULT_SEO.description,
  image = DEFAULT_SEO.image,
  url = DEFAULT_SEO.url,
  type = 'website',
  keywords = DEFAULT_SEO.keywords,
  author = DEFAULT_SEO.author,
  publishedTime,
  modifiedTime,
  locale = DEFAULT_SEO.locale,
  siteName = DEFAULT_SEO.siteName,
  twitterHandle = DEFAULT_SEO.twitterHandle,
  noindex = false,
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title 
    ? `${title} | ${siteName}` 
    : DEFAULT_SEO.title;
  
  const absoluteImageUrl = image.startsWith('http') 
    ? image 
    : `${url}${image}`;

  // Schema.org JSON-LD para Hotel/Guesthouse
  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: siteName,
    description: description,
    url: url,
    image: absoluteImageUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua de Lisboa 28',
      addressLocality: 'Mindelo',
      addressRegion: 'São Vicente',
      addressCountry: 'CV',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '16.8892',
      longitude: '-24.9891',
    },
    telephone: '+238 995 41 00',
    email: 'casatiana28@gmail.com',
    priceRange: '€€',
    starRating: {
      '@type': 'Rating',
      ratingValue: '4.5',
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi Gratuito', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Ar Condicionado', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Pequeno-almoço Incluído', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Vista Mar', value: true },
    ],
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={locale.split('_')[0]} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />

      {/* Open Graph - Facebook, WhatsApp, LinkedIn */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${siteName} - Vista do estabelecimento`} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="fr_FR" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={`${siteName} - Vista do estabelecimento`} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#1a365d" />
      <meta name="msapplication-TileColor" content="#1a365d" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="geo.region" content="CV-SV" />
      <meta name="geo.placename" content="Mindelo" />
      <meta name="geo.position" content="16.8892;-24.9891" />
      <meta name="ICBM" content="16.8892, -24.9891" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd || defaultJsonLd)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
