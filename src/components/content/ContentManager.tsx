
interface SiteContent {
  siteName: string;
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    images?: Array<{
      src: string;
      alt: string;
    }>;
  };
  about: {
    title: string;
    subtitle: string;
    story: {
      title: string;
      paragraphs: string[];
    };
  };
  contact: {
    address: string[];
    phone: string[];
    email: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    tripadvisor?: string;
  };
}

// This would be populated from WordPress custom fields or theme customizer
export const siteContent: SiteContent = {
  siteName: "Casa Tiana",
  hero: {
    title: "Casa Tiana",
    subtitle: "Uma experiência de hospedagem autêntica e acolhedora, onde a tradição cabo-verdiana encontra o conforto moderno.",
    buttonText: "Reservar Agora"
  },
  about: {
    title: "Sobre a Casa Tiana",
    subtitle: "Descubra nossa história e paixão pela hospitalidade autêntica",
    story: {
      title: "Nossa História",
      paragraphs: [
        "Fundada com amor e dedicação, a Casa Tiana nasceu do sonho de criar um refúgio especial na Serra da Mantiqueira.",
        "Nossa família trabalha incansavelmente para proporcionar experiências únicas e memoráveis para cada hóspede.",
        "Cada detalhe foi pensado para harmonizar conforto moderno com o charme natural da região."
      ]
    }
  },
  contact: {
    address: ["Alto São Nicolau", "Mindelo - S.Vicente"],
    phone: ["5937127"],
    email: "casatiana@gmail.com"
  },
  social: {
    instagram: "https://instagram.com/casatiana",
    facebook: "https://facebook.com/casatiana",
    tripadvisor: "https://tripadvisor.com/casatiana"
  }
};

// Helper functions for WordPress integration
export const getContent = (key: string, defaultValue: any = '') => {
  // In WordPress, this would fetch from wp_options or custom fields
  // For now, return from our static content
  const keys = key.split('.');
  let value = siteContent as any;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || defaultValue;
};

export const updateContent = (key: string, value: any) => {
  // In WordPress, this would update wp_options or custom fields
  console.log(`Updating ${key} with value:`, value);
};
