// Room data configuration - centralized room information

// Room string IDs that match database room_type values
export const ROOM_IDS = {
  DUNAS: "dunas",
  BAIA_TRANQUILA: "baia-tranquila", 
  TERRACO_SOL: "terraco-sol",
  MORABEZA: "morabeza"
} as const;

export type RoomId = typeof ROOM_IDS[keyof typeof ROOM_IDS];

export const deluxeRoomImages = [
  {
    src: "/lovable-uploads/quarto-dunas-principal.jpg",
    alt: "Quarto Dunas - Cama de casal com quadro de pôr do sol na praia",
  },
  {
    src: "/lovable-uploads/3923ba14-3b24-49b6-9784-d89fbe609032.png",
    alt: "Quarto Dunas - Cama de casal com quadro de pôr do sol",
  },
  {
    src: "/lovable-uploads/81e31ffa-97ad-4ef8-a66b-16b6fb8cbfa6.png",
    alt: "Quarto Dunas - Cama de casal com luz natural e cortina",
  },
];

export const balconyRoomImages = [
  {
    src: "/lovable-uploads/suite-baia-tranquila-quarto-1.jpg",
    alt: "Suite Baía Tranquila - Vista geral do quarto com cama de casal"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-quarto-2.jpg",
    alt: "Suite Baía Tranquila - Quarto com decoração elegante"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-quarto-3.jpg",
    alt: "Suite Baía Tranquila - Ambiente acolhedor do quarto"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-tv-netflix.jpg",
    alt: "Suite Baía Tranquila - TV com Netflix"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-varanda.jpg",
    alt: "Suite Baía Tranquila - Varanda privativa"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-closet.jpg",
    alt: "Suite Baía Tranquila - Closet espaçoso"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-banheiro-banheira.jpg",
    alt: "Suite Baía Tranquila - Casa de banho com banheira"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-chuveiro.jpg",
    alt: "Suite Baía Tranquila - Chuveiro moderno"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-banheiro-lavatorio.jpg",
    alt: "Suite Baía Tranquila - Lavatório da casa de banho"
  },
  {
    src: "/lovable-uploads/suite-baia-tranquila-wc.jpg",
    alt: "Suite Baía Tranquila - WC completo"
  }
];

export const seaViewRoomImages = [
  {
    src: "/lovable-uploads/a24ad7bf-896f-421e-8ce7-a36069657ee8.png",
    alt: "Quarto Duplo Deluxe com Vista Mar - Cama de casal com parede amarela e luminária",
  },
  {
    src: "/lovable-uploads/e21a2054-8cb7-4a4a-9ade-f2f085bedb34.png",
    alt: "Quarto Duplo Deluxe com Vista Mar - Sala com TV, frigobar e poltronas",
  },
  {
    src: "/lovable-uploads/e665e98a-5a1d-468f-b3a2-26f4f387fad5.png",
    alt: "Quarto Duplo Deluxe com Vista Mar - Cama de casal com colcha estampada sob luz natural",
  },
  {
    src: "/lovable-uploads/1b812ac5-1985-4fb8-a255-4a2a907eef3b.png",
    alt: "Quarto Duplo Deluxe com Vista Mar - Vista do quarto com ventilador e porta aberta",
  },
  {
    src: "/lovable-uploads/70dd0635-0b3c-40ea-8807-dc7d0e474c7a.png",
    alt: "Quarto Duplo Deluxe com Vista Mar - Sala ampla com poltrona e claraboia",
  },
];

export const largeRoomImages = [
  {
    src: "/lovable-uploads/83091bee-19a2-46cd-8ea6-e5576cf8a075.png",
    alt: "Quarto Duplo Amplo - Cama de casal com almofadas decorativas",
  },
  {
    src: "/lovable-uploads/564dc7bf-a379-494d-91fc-358ea4c7aa6f.png",
    alt: "Quarto Duplo Amplo - Vista geral com TV e móveis modernos",
  },
  {
    src: "/lovable-uploads/ec32f8f0-187e-42ac-a99e-c988e1ced902.png",
    alt: "Quarto Duplo Amplo - Cama ampla com iluminação aconchegante",
  },
  {
    src: "/lovable-uploads/2b0a214a-bd5f-4ed8-9c21-a640ef7cef68.png",
    alt: "Quarto Duplo Amplo - Vista panorâmica do quarto com cortinas",
  },
  {
    src: "/lovable-uploads/316509af-1445-4ed3-bc72-5a03916b2c55.png",
    alt: "Quarto Duplo Amplo - Ambiente completo com TV e mesa lateral",
  },
];

// Room interface for booking operations
export interface BookingRoom {
  id: RoomId;
  name: string;
  price: string;
  priceValue: number;
  capacity: string;
  capacityValue: number;
}

// Get rooms data for booking (simplified version with numeric prices)
export const getBookingRooms = (t: (key: string) => string): BookingRoom[] => [
  {
    id: ROOM_IDS.DUNAS,
    name: t('rooms.1.name'),
    price: "6.000 CVE",
    priceValue: 6000,
    capacity: `2 ${t('rooms.capacity.people')}`,
    capacityValue: 2
  },
  {
    id: ROOM_IDS.BAIA_TRANQUILA,
    name: t('rooms.2.name'),
    price: "6.900 CVE",
    priceValue: 6900,
    capacity: `2 ${t('rooms.capacity.people')}`,
    capacityValue: 2
  },
  {
    id: ROOM_IDS.TERRACO_SOL,
    name: t('rooms.3.name'),
    price: "6.900 CVE",
    priceValue: 6900,
    capacity: `4 ${t('rooms.capacity.people')}`,
    capacityValue: 4
  },
  {
    id: ROOM_IDS.MORABEZA,
    name: t('rooms.4.name'),
    price: "6.900 CVE",
    priceValue: 6900,
    capacity: `2 ${t('rooms.capacity.people')}`,
    capacityValue: 2
  }
];

// Get all room IDs as array
export const getAllRoomIds = (): RoomId[] => Object.values(ROOM_IDS);

export const getRoomsData = (t: (key: string) => string) => [
  {
    id: ROOM_IDS.DUNAS,
    name: t('rooms.1.name'),
    capacity: `2 ${t('rooms.capacity.people')}`,
    capacityValue: 2,
    price: "6.000 CVE",
    priceValue: 6000,
    period: t('rooms.period'),
    size: "18m²",
    amenities: [
      t('rooms.amenity.wifi'),
      t('rooms.amenity.tv'),
      t('rooms.amenity.minibar'),
      t('rooms.amenity.privateBathroom'),
      t('rooms.amenity.airConditioning')
    ],
    description: t('rooms.1.description'),
    shortDescription: t('rooms.1.description').substring(0, 120) + '...',
    highlight: t('rooms.highlight.popular'),
    hasCarousel: true,
    images: deluxeRoomImages
  },
  {
    id: ROOM_IDS.BAIA_TRANQUILA,
    name: t('rooms.2.name'),
    capacity: `2 ${t('rooms.capacity.people')}`,
    capacityValue: 2,
    price: "6.900 CVE",
    priceValue: 6900,
    period: t('rooms.period'),
    size: "25m²",
    amenities: [
      t('rooms.amenity.wifi'),
      t('rooms.amenity.tv'),
      t('rooms.amenity.minibar'),
      t('rooms.amenity.bathtub'),
      t('rooms.amenity.balcony'),
      t('rooms.amenity.airConditioning')
    ],
    description: t('rooms.2.description'),
    shortDescription: t('rooms.2.description').substring(0, 120) + '...',
    highlight: t('rooms.highlight.premium'),
    hasCarousel: true,
    images: balconyRoomImages
  },
  {
    id: ROOM_IDS.TERRACO_SOL,
    name: t('rooms.3.name'),
    capacity: `4 ${t('rooms.capacity.people')}`,
    capacityValue: 4,
    price: "6.900 CVE",
    priceValue: 6900,
    period: t('rooms.period'),
    size: "35m²",
    amenities: [
      t('rooms.amenity.wifi'),
      t('rooms.amenity.tv'),
      t('rooms.amenity.minibar'),
      t('rooms.amenity.bathroom'),
      t('rooms.amenity.seaView'),
      t('rooms.amenity.airConditioning')
    ],
    description: t('rooms.3.description'),
    shortDescription: t('rooms.3.description').substring(0, 120) + '...',
    highlight: t('rooms.highlight.seaView'),
    hasCarousel: true,
    images: seaViewRoomImages
  },
  {
    id: ROOM_IDS.MORABEZA,
    name: t('rooms.4.name'),
    capacity: `2 ${t('rooms.capacity.people')}`,
    capacityValue: 2,
    price: "6.900 CVE",
    priceValue: 6900,
    period: t('rooms.period'),
    size: "22m²",
    amenities: [
      t('rooms.amenity.wifi'),
      t('rooms.amenity.tv'),
      t('rooms.amenity.minibar'),
      t('rooms.amenity.privateBathroom'),
      t('rooms.amenity.extraArea'),
      t('rooms.amenity.airConditioning')
    ],
    description: t('rooms.4.description'),
    shortDescription: t('rooms.4.description').substring(0, 120) + '...',
    highlight: t('rooms.highlight.moreSpace'),
    hasCarousel: true,
    images: largeRoomImages
  }
];