
import WordPressGallery from "@/components/wordpress/WordPressGallery";
import { useLanguage } from "@/contexts/LanguageContext";

const Gallery = () => {
  const { t } = useLanguage();

  // Imagens de fallback caso WordPress não esteja disponível
  const fallbackImages = [
    { id: 1, category: "Quartos", title: { rendered: "Suíte Master" }, content: { rendered: "Vista panorâmica da serra" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/844be717-4815-46b9-9be6-9415cc0f7dfd.png" }] } },
    { id: 2, category: "Áreas Comuns", title: { rendered: "Sala de Estar" }, content: { rendered: "Ambiente aconchegante para relaxar" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/31ce1cae-20a1-4ac7-bfbc-b453afc61da6.png" }] } },
    { id: 3, category: "Natureza", title: { rendered: "Jardim dos Sonhos" }, content: { rendered: "Paisagismo exclusivo" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/3022bc70-997a-4d77-86b5-c9d065f06034.png" }] } },
    { id: 4, category: "Quartos", title: { rendered: "Quarto Standard" }, content: { rendered: "Conforto e simplicidade" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/84cc191e-80fc-4faa-8d64-ab7986489090.png" }] } },
    { id: 5, category: "Áreas Comuns", title: { rendered: "Piscina Natural" }, content: { rendered: "Refrescante vista da montanha" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/0586b764-1de7-491f-95c9-686af0feb321.png" }] } },
    { id: 6, category: "Natureza", title: { rendered: "Trilha da Cachoeira" }, content: { rendered: "Aventura a poucos metros" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/cb050287-93ec-4003-a568-54506f54d04a.png" }] } },
    { id: 7, category: "Áreas Comuns", title: { rendered: "Café da Manhã" }, content: { rendered: "Produtos locais frescos" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/87db8850-29fb-49b4-819b-d9a2977a6eb8.png" }] } },
    { id: 8, category: "Natureza", title: { rendered: "Pôr do Sol" }, content: { rendered: "Espetáculo diário garantido" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/6cc384da-f16c-41c9-b46e-00f376b26be8.png" }] } },
    { id: 9, category: "Quartos", title: { rendered: "Quarto Família" }, content: { rendered: "Espaço ideal para todos" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/93b2bee8-41a8-4213-829c-62bd98279824.png" }] } },

    // Novas fotos dos quartos adicionadas
    { id: 110, category: "Quartos", title: { rendered: "Quarto Deluxe" }, content: { rendered: "Quarto espaçoso com vista para o jardim" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/844be717-4815-46b9-9be6-9415cc0f7dfd.png" }] } },
    { id: 111, category: "Quartos", title: { rendered: "Suite Premium" }, content: { rendered: "Elegância e conforto com acabamentos em madeira" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/31ce1cae-20a1-4ac7-bfbc-b453afc61da6.png" }] } },
    { id: 112, category: "Quartos", title: { rendered: "Quarto Superior" }, content: { rendered: "Design moderno com toques naturais" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/84cc191e-80fc-4faa-8d64-ab7986489090.png" }] } },
    { id: 113, category: "Quartos", title: { rendered: "Suite Comfort" }, content: { rendered: "Ambiente acolhedor com toalhas macias" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/93b2bee8-41a8-4213-829c-62bd98279824.png" }] } },
    { id: 114, category: "Quartos", title: { rendered: "Quarto Premium" }, content: { rendered: "Iluminação ambiente e decoração artística" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/9999f74c-af42-4a66-a193-3ee9bfc72f8f.png" }] } },
    { id: 115, category: "Quartos", title: { rendered: "Suite Elegante" }, content: { rendered: "Design sofisticado com arte local" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/2c4d2c4d-6184-41fe-b50b-f97d0060524a.png" }] } },
    { id: 116, category: "Quartos", title: { rendered: "Quarto Vista Mar" }, content: { rendered: "Relaxamento com vista deslumbrante" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/38197166-bcb3-4fe6-aeca-1ee72f6bfaf0.png" }] } },
    { id: 117, category: "Quartos", title: { rendered: "Suite Executiva" }, content: { rendered: "Espaço amplo com varanda privativa" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/cb58420e-8b24-49c5-af4f-bdde3a18176a.png" }] } },
    { id: 118, category: "Quartos", title: { rendered: "Quarto Twin" }, content: { rendered: "Conforto e praticidade com TV" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/ff448a05-57af-4271-870a-14d68e7515d8.png" }] } },
    { id: 119, category: "Quartos", title: { rendered: "Suite Master" }, content: { rendered: "O ápice do luxo e conforto" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/d7b553b1-09c5-4ed2-b928-1eac76697288.png" }] } },

    { id: 100, category: "Paisagens", title: { rendered: "Cânion dourado" }, content: { rendered: "Formação rochosa impressionante com pessoa na entrada" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/3022bc70-997a-4d77-86b5-c9d065f06034.png" }] } },
    { id: 101, category: "Paisagens", title: { rendered: "Vista aérea da ilha" }, content: { rendered: "Foto aérea mostrando toda a extensão da ilha e o mar" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/0586b764-1de7-491f-95c9-686af0feb321.png" }] } },
    { id: 102, category: "Paisagens", title: { rendered: "Farol e penhasco" }, content: { rendered: "Farol em rochedo à beira-mar" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/cb050287-93ec-4003-a568-54506f54d04a.png" }] } },
    { id: 103, category: "Paisagens", title: { rendered: "Ponta do farol" }, content: { rendered: "Vista ampla do penhasco e do farol" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/87db8850-29fb-49b4-819b-d9a2977a6eb8.png" }] } },
    { id: 104, category: "Paisagens", title: { rendered: "Montanhas e farol" }, content: { rendered: "As montanhas ao fundo destacam o farol na ponta" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/6cc384da-f16c-41c9-b46e-00f376b26be8.png" }] } },
    { id: 105, category: "Paisagens", title: { rendered: "Penhasco e farol" }, content: { rendered: "Penhasco íngreme cercando o farol e o mar" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/d256b879-7fe1-4a02-bb20-ad527ce565c1.png" }] } },
    { id: 106, category: "Paisagens", title: { rendered: "Topo do farol" }, content: { rendered: "Vista aérea do topo do farol e oceano ao fundo" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/e1c943ee-2840-4f4a-9db7-c094927b3b7f.png" }] } },
    { id: 107, category: "Paisagens", title: { rendered: "Serra sinuosa" }, content: { rendered: "Estrada recortando montanhas ao lado do mar" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/44555ad7-3481-467a-932e-092d676d2afa.png" }] } },
    { id: 108, category: "Paisagens", title: { rendered: "Vista aérea da ilha II" }, content: { rendered: "Outra perspectiva da ilha rodeada pelo oceano" }, _embedded: { 'wp:featuredmedia': [{ source_url: "/lovable-uploads/38d6f247-6664-4418-804e-be59a79fa99c.png" }] } },
  ];

  return (
    <section id="galeria" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent mb-6 font-playfair">
              {t('gallery.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('gallery.subtitle')}
            </p>
          </div>

          {/* WordPress Gallery Component */}
          <WordPressGallery fallbackImages={fallbackImages} />
        </div>
      </div>
    </section>
  );
};

export default Gallery;
