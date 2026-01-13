import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RoomSEO {
  title: string;
  description: string;
  keywords: string[];
  jsonLd: Record<string, unknown>;
}

interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  type?: 'website' | 'article' | 'product';
}

const BASE_URL = 'https://casatiana.cv';

export const useSEO = () => {
  const { language } = useLanguage();

  const pageSEO: Record<string, Record<string, PageSEO>> = useMemo(() => ({
    pt: {
      home: {
        title: 'Guesthouse & Hospedagem em Mindelo',
        description: 'Descubra a Casa Tiana, uma guesthouse acolhedora em Mindelo, São Vicente, Cabo Verde. Quartos confortáveis com vista para o mar, pequeno-almoço incluído.',
        keywords: ['guesthouse mindelo', 'hotel são vicente', 'hospedagem cabo verde', 'casa tiana', 'pousada mindelo'],
      },
      reservations: {
        title: 'Minhas Reservas',
        description: 'Gerencie suas reservas na Casa Tiana. Veja detalhes, datas e status das suas estadias.',
        keywords: ['reservas', 'minhas reservas', 'casa tiana reservas'],
      },
      blog: {
        title: 'Blog - Dicas de Viagem',
        description: 'Descubra as melhores dicas de viagem para Mindelo e São Vicente. Trilhas, praias, restaurantes e muito mais.',
        keywords: ['blog mindelo', 'dicas viagem cabo verde', 'o que fazer são vicente'],
        type: 'article',
      },
      auth: {
        title: 'Entrar ou Registar',
        description: 'Acesse sua conta na Casa Tiana para gerenciar reservas e receber ofertas exclusivas.',
        keywords: ['login', 'registar', 'conta casa tiana'],
      },
    },
    en: {
      home: {
        title: 'Guesthouse & Accommodation in Mindelo',
        description: 'Discover Casa Tiana, a cozy guesthouse in Mindelo, São Vicente, Cape Verde. Comfortable rooms with sea view, breakfast included.',
        keywords: ['mindelo guesthouse', 'são vicente hotel', 'cape verde accommodation', 'casa tiana', 'mindelo lodging'],
      },
      reservations: {
        title: 'My Reservations',
        description: 'Manage your reservations at Casa Tiana. View details, dates and status of your stays.',
        keywords: ['reservations', 'my bookings', 'casa tiana reservations'],
      },
      blog: {
        title: 'Blog - Travel Tips',
        description: 'Discover the best travel tips for Mindelo and São Vicente. Trails, beaches, restaurants and more.',
        keywords: ['mindelo blog', 'cape verde travel tips', 'things to do são vicente'],
        type: 'article',
      },
      auth: {
        title: 'Sign In or Register',
        description: 'Access your Casa Tiana account to manage reservations and receive exclusive offers.',
        keywords: ['login', 'register', 'casa tiana account'],
      },
    },
    fr: {
      home: {
        title: 'Maison d\'hôtes & Hébergement à Mindelo',
        description: 'Découvrez Casa Tiana, une maison d\'hôtes accueillante à Mindelo, São Vicente, Cap-Vert. Chambres confortables avec vue mer, petit-déjeuner inclus.',
        keywords: ['maison hôtes mindelo', 'hôtel são vicente', 'hébergement cap vert', 'casa tiana', 'logement mindelo'],
      },
      reservations: {
        title: 'Mes Réservations',
        description: 'Gérez vos réservations à Casa Tiana. Consultez les détails, dates et statut de vos séjours.',
        keywords: ['réservations', 'mes réservations', 'casa tiana réservations'],
      },
      blog: {
        title: 'Blog - Conseils de Voyage',
        description: 'Découvrez les meilleurs conseils de voyage pour Mindelo et São Vicente. Sentiers, plages, restaurants et plus.',
        keywords: ['blog mindelo', 'conseils voyage cap vert', 'que faire são vicente'],
        type: 'article',
      },
      auth: {
        title: 'Se Connecter ou S\'inscrire',
        description: 'Accédez à votre compte Casa Tiana pour gérer vos réservations et recevoir des offres exclusives.',
        keywords: ['connexion', 'inscription', 'compte casa tiana'],
      },
    },
  }), []);

  const getPageSEO = (page: string): PageSEO => {
    return pageSEO[language]?.[page] || pageSEO.pt[page] || pageSEO.pt.home;
  };

  const getRoomSEO = (roomId: string, roomName: string, price: number, description: string): RoomSEO => {
    const roomDescriptions: Record<string, Record<string, { title: string; desc: string }>> = {
      pt: {
        dunas: { title: 'Quarto Dunas', desc: 'Quarto acolhedor com decoração inspirada nas dunas de São Vicente.' },
        'baia-tranquila': { title: 'Suíte Baía Tranquila', desc: 'Suíte luxuosa com vista panorâmica para a baía de Mindelo.' },
        'brisa-do-mar': { title: 'Quarto Brisa do Mar', desc: 'Quarto refrescante com brisa marinha e varanda privativa.' },
        'sol-poente': { title: 'Quarto Sol Poente', desc: 'Quarto com vista deslumbrante do pôr do sol sobre o oceano.' },
      },
      en: {
        dunas: { title: 'Dunas Room', desc: 'Cozy room with decoration inspired by São Vicente dunes.' },
        'baia-tranquila': { title: 'Tranquil Bay Suite', desc: 'Luxurious suite with panoramic view of Mindelo bay.' },
        'brisa-do-mar': { title: 'Sea Breeze Room', desc: 'Refreshing room with sea breeze and private balcony.' },
        'sol-poente': { title: 'Sunset Room', desc: 'Room with stunning sunset view over the ocean.' },
      },
      fr: {
        dunas: { title: 'Chambre Dunas', desc: 'Chambre accueillante décorée dans l\'esprit des dunes de São Vicente.' },
        'baia-tranquila': { title: 'Suite Baie Tranquille', desc: 'Suite luxueuse avec vue panoramique sur la baie de Mindelo.' },
        'brisa-do-mar': { title: 'Chambre Brise Marine', desc: 'Chambre rafraîchissante avec brise marine et balcon privé.' },
        'sol-poente': { title: 'Chambre Coucher de Soleil', desc: 'Chambre avec vue imprenable sur le coucher de soleil.' },
      },
    };

    const roomInfo = roomDescriptions[language]?.[roomId] || { title: roomName, desc: description };

    return {
      title: roomInfo.title,
      description: roomInfo.desc,
      keywords: [roomInfo.title.toLowerCase(), 'casa tiana', 'mindelo', 'quarto', 'room', 'chambre'],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'HotelRoom',
        name: roomInfo.title,
        description: roomInfo.desc,
        url: `${BASE_URL}/#quartos`,
        image: `/lovable-uploads/81e31ffa-97ad-4ef8-a66b-16b6fb8cbfa6.png`,
        occupancy: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 2,
        },
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Ar Condicionado', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'TV', value: true },
        ],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: price,
          availability: 'https://schema.org/InStock',
        },
        containedInPlace: {
          '@type': 'LodgingBusiness',
          name: 'Casa Tiana',
          url: BASE_URL,
        },
      },
    };
  };

  return {
    getPageSEO,
    getRoomSEO,
    language,
    baseUrl: BASE_URL,
  };
};

export default useSEO;
