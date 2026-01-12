import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/seo/SEOHead";

const BlogPost = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const contentPt = {
    intro: "**Mindelo**, com seu charme atlântico e alma cultural vibrante, é muito mais do que música e arquitetura colonial. Escondida entre montanhas vulcânicas e baías deslumbrantes, a cidade oferece um convite irresistível aos amantes do **ecoturismo** e das **trilhas ao ar livre**. Para quem busca conexão com a natureza, paisagens arrebatadoras e um toque de aventura, Mindelo é o ponto de partida ideal para explorar o lado mais selvagem e autêntico de São Vicente.",
    callToAction: "Se você é apaixonado por caminhadas, prepare a mochila: aqui estão **5 trilhas imperdíveis** para quem deseja descobrir o coração natural da ilha!"
  };

  const contentEn = {
    intro: "**Mindelo**, with its Atlantic charm and vibrant cultural soul, is much more than music and colonial architecture. Hidden between volcanic mountains and stunning bays, the city offers an irresistible invitation to lovers of **ecotourism** and **outdoor trails**. For those seeking connection with nature, breathtaking landscapes and a touch of adventure, Mindelo is the ideal starting point to explore the wildest and most authentic side of São Vicente.",
    callToAction: "If you're passionate about hiking, pack your backpack: here are **5 unmissable trails** for those who want to discover the natural heart of the island!"
  };

  const content = language === 'pt' ? contentPt : contentEn;

  const blogSEO = {
    title: language === 'pt'
      ? '5 Trilhas Imperdíveis em Mindelo para Amantes de Ecoturismo'
      : '5 Unmissable Trails in Mindelo for Ecotourism Lovers',
    description: language === 'pt'
      ? 'Descubra as melhores trilhas de Mindelo, São Vicente. Guia completo com Monte Verde, Baía das Gatas, São Pedro e mais. Dicas, níveis de dificuldade e pontos de interesse.'
      : 'Discover the best trails in Mindelo, São Vicente. Complete guide with Monte Verde, Baía das Gatas, São Pedro and more. Tips, difficulty levels and points of interest.',
    keywords: language === 'pt'
      ? ['trilhas mindelo', 'ecoturismo cabo verde', 'monte verde são vicente', 'baía das gatas', 'hiking cape verde']
      : ['mindelo trails', 'cape verde ecotourism', 'monte verde são vicente', 'baía das gatas', 'hiking cape verde'],
  };

  return (
    <>
      <SEOHead
        title={blogSEO.title}
        description={blogSEO.description}
        keywords={blogSEO.keywords}
        type="article"
        image="/lovable-uploads/9b937bdc-ae6f-4472-92dc-24587cc47546.png"
        publishedTime="2023-12-15T10:00:00Z"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: blogSEO.title,
          description: blogSEO.description,
          image: 'https://casatiana.cv/lovable-uploads/9b937bdc-ae6f-4472-92dc-24587cc47546.png',
          datePublished: '2023-12-15T10:00:00Z',
          author: {
            '@type': 'Organization',
            name: 'Casa Tiana',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Casa Tiana',
            logo: {
              '@type': 'ImageObject',
              url: 'https://casatiana.cv/lovable-uploads/81e31ffa-97ad-4ef8-a66b-16b6fb8cbfa6.png',
            },
          },
        }}
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary/10 py-8">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('blog.back')}
            </Button>

            <div className="max-w-4xl mx-auto">
              <Badge className="bg-blue-100 text-blue-800 mb-4">
                {t('blog.category')}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-playfair">
                {blogSEO.title}
              </h1>

              <div className="flex items-center space-x-6 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{t('blog.author')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{language === 'pt' ? '15 Dez 2023' : '15 Dec 2023'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('blog.reading')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              {/* Hero Image */}
              <div className="aspect-[16/9] rounded-lg overflow-hidden mb-8">
                <img
                  src="/blog/trilhas-mindelo.jpg"
                  alt={language === 'pt' ? 'Vista aérea de formação rochosa vulcânica em Cabo Verde com farol' : 'Aerial view of volcanic rock formation in Cape Verde with lighthouse'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-lg leading-relaxed space-y-6">
                <p dangerouslySetInnerHTML={{ __html: content.intro.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

                <p dangerouslySetInnerHTML={{ __html: content.callToAction.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

                <hr className="my-8" />

                {/* Trilha 1 */}
                <Card className="my-8">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 font-playfair">
                      {language === 'pt' ? '1. Trilha Monte Verde' : '1. Monte Verde Trail'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p><strong>📍 {language === 'pt' ? 'Localização' : 'Location'}:</strong> {language === 'pt' ? 'Zona rural a leste de Mindelo' : 'Rural area east of Mindelo'}</p>
                        <p><strong>🎯 {language === 'pt' ? 'Nível' : 'Level'}:</strong> {language === 'pt' ? 'Moderado' : 'Moderate'}</p>
                      </div>
                      <div>
                        <p><strong>📏 {language === 'pt' ? 'Distância' : 'Distance'}:</strong> 6 km ({language === 'pt' ? 'ida e volta' : 'round trip'})</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold mb-2">🗺 {language === 'pt' ? 'Pontos de interesse' : 'Points of interest'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Vista panorâmica de toda a ilha' : 'Panoramic view of the entire island'}</li>
                        <li>{language === 'pt' ? 'Vegetação endêmica e jardins ecológicos' : 'Endemic vegetation and ecological gardens'}</li>
                        <li>{language === 'pt' ? 'Miradouro com vista para o Oceano Atlântico' : 'Viewpoint overlooking the Atlantic Ocean'}</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">🔍 {language === 'pt' ? 'Dicas' : 'Tips'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Melhor horário: início da manhã para evitar o calor e aproveitar o céu limpo' : 'Best time: early morning to avoid heat and enjoy clear skies'}</li>
                        <li>{language === 'pt' ? 'Leve: água, protetor solar e casaco leve (o vento no topo pode ser forte)' : 'Bring: water, sunscreen and light jacket (wind at the top can be strong)'}</li>
                        <li>{language === 'pt' ? 'Guia: não é obrigatório, mas recomendado para quem deseja conhecer mais sobre a flora local' : 'Guide: not mandatory, but recommended for those who want to learn more about local flora'}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Trilha 2 */}
                <Card className="my-8">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 font-playfair">
                      {language === 'pt' ? '2. Trilha Ribeira de Calhau – Praia Grande' : '2. Ribeira de Calhau – Praia Grande Trail'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p><strong>📍 {language === 'pt' ? 'Localização' : 'Location'}:</strong> {language === 'pt' ? 'Saindo da vila de Ribeira de Calhau' : 'Leaving the village of Ribeira de Calhau'}</p>
                        <p><strong>🎯 {language === 'pt' ? 'Nível' : 'Level'}:</strong> {language === 'pt' ? 'Fácil a moderado' : 'Easy to moderate'}</p>
                      </div>
                      <div>
                        <p><strong>📏 {language === 'pt' ? 'Distância' : 'Distance'}:</strong> 4,5 km ({language === 'pt' ? 'somente ida' : 'one way'})</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold mb-2">🗺 {language === 'pt' ? 'Pontos de interesse' : 'Points of interest'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Desfiladeiros rochosos' : 'Rocky gorges'}</li>
                        <li>{language === 'pt' ? 'Formação de dunas e falésias costeiras' : 'Formation of dunes and coastal cliffs'}</li>
                        <li>{language === 'pt' ? 'Praia selvagem de areia branca' : 'Wild white sand beach'}</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">🔍 {language === 'pt' ? 'Dicas' : 'Tips'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Ideal para um passeio ao final da tarde, com pôr do sol espetacular' : 'Ideal for an afternoon stroll, with spectacular sunset'}</li>
                        <li>{language === 'pt' ? 'Use calçado com boa aderência para áreas arenosas e rochosas' : 'Wear shoes with good grip for sandy and rocky areas'}</li>
                        <li>{language === 'pt' ? 'Transporte de volta pode ser combinado com taxistas locais' : 'Return transport can be arranged with local taxi drivers'}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Trilha 3 */}
                <Card className="my-8">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 font-playfair">
                      {language === 'pt' ? '3. Trilha Salamansa – Baía das Gatas' : '3. Salamansa – Baía das Gatas Trail'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p><strong>📍 {language === 'pt' ? 'Localização' : 'Location'}:</strong> {language === 'pt' ? 'Litoral norte de Mindelo' : 'North coast of Mindelo'}</p>
                        <p><strong>🎯 {language === 'pt' ? 'Nível' : 'Level'}:</strong> {language === 'pt' ? 'Fácil' : 'Easy'}</p>
                      </div>
                      <div>
                        <p><strong>📏 {language === 'pt' ? 'Distância' : 'Distance'}:</strong> 5 km</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold mb-2">🗺 {language === 'pt' ? 'Pontos de interesse' : 'Points of interest'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Caminho costeiro com vista para o mar turquesa' : 'Coastal path overlooking the turquoise sea'}</li>
                        <li>{language === 'pt' ? 'Pequenas enseadas e piscinas naturais' : 'Small coves and natural pools'}</li>
                        <li>{language === 'pt' ? 'Cultura local nas vilas pesqueiras' : 'Local culture in fishing villages'}</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">🔍 {language === 'pt' ? 'Dicas' : 'Tips'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Trilha ideal para iniciantes ou famílias' : 'Ideal trail for beginners or families'}</li>
                        <li>{language === 'pt' ? 'Leve roupa de banho – há trechos ótimos para um mergulho' : 'Bring swimwear – there are great stretches for a swim'}</li>
                        <li>{language === 'pt' ? 'A caminhada pode terminar com um almoço à beira-mar em Baía das Gatas' : 'The walk can end with a seaside lunch in Baía das Gatas'}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Trilha 4 */}
                <Card className="my-8">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 font-playfair">
                      {language === 'pt' ? '4. Trilha de São Pedro ao Farol Dona Amélia' : '4. Trail from São Pedro to Dona Amélia Lighthouse'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p><strong>📍 {language === 'pt' ? 'Localização' : 'Location'}:</strong> {language === 'pt' ? 'Vila de São Pedro' : 'Village of São Pedro'}</p>
                        <p><strong>🎯 {language === 'pt' ? 'Nível' : 'Level'}:</strong> {language === 'pt' ? 'Moderado com trechos íngremes' : 'Moderate with steep sections'}</p>
                      </div>
                      <div>
                        <p><strong>📏 {language === 'pt' ? 'Distância' : 'Distance'}:</strong> 7 km ({language === 'pt' ? 'ida e volta' : 'round trip'})</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold mb-2">🗺 {language === 'pt' ? 'Pontos de interesse' : 'Points of interest'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Paisagem marinha dramática' : 'Dramatic seascape'}</li>
                        <li>{language === 'pt' ? 'Antigo farol com vista cinematográfica' : 'Old lighthouse with cinematic view'}</li>
                        <li>{language === 'pt' ? 'Possível avistamento de aves marinhas' : 'Possible sighting of seabirds'}</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">🔍 {language === 'pt' ? 'Dicas' : 'Tips'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Evite dias de muito vento – há trechos expostos' : 'Avoid very windy days – there are exposed stretches'}</li>
                        <li>{language === 'pt' ? 'Sapatos firmes e mochila leve são essenciais' : 'Sturdy shoes and a light backpack are essential'}</li>
                        <li>{language === 'pt' ? 'Leve lanche e aproveite para fazer um piquenique no farol' : 'Bring a snack and take the opportunity to have a picnic at the lighthouse'}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Trilha 5 */}
                <Card className="my-8">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 font-playfair">
                      {language === 'pt' ? '5. Trilha Madeiral – Cova Júlia' : '5. Madeiral – Cova Júlia Trail'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p><strong>📍 {language === 'pt' ? 'Localização' : 'Location'}:</strong> {language === 'pt' ? 'Interior montanhoso da ilha' : 'Mountainous interior of the island'}</p>
                        <p><strong>🎯 {language === 'pt' ? 'Nível' : 'Level'}:</strong> {language === 'pt' ? 'Avançado' : 'Advanced'}</p>
                      </div>
                      <div>
                        <p><strong>📏 {language === 'pt' ? 'Distância' : 'Distance'}:</strong> 10 km ({language === 'pt' ? 'ida e volta' : 'round trip'})</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold mb-2">🗺 {language === 'pt' ? 'Pontos de interesse' : 'Points of interest'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'Trilha rural tradicional com cultivo agrícola' : 'Traditional rural trail with agricultural cultivation'}</li>
                        <li>{language === 'pt' ? 'Contato com comunidades locais' : 'Contact with local communities'}</li>
                        <li>{language === 'pt' ? 'Belas paisagens de vales e montanhas' : 'Beautiful landscapes of valleys and mountains'}</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">🔍 {language === 'pt' ? 'Dicas' : 'Tips'}:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>{language === 'pt' ? 'É altamente recomendável ir com guia local, devido à complexidade do trajeto' : 'It is highly recommended to go with a local guide, due to the complexity of the route'}</li>
                        <li>{language === 'pt' ? 'Ideal para quem já tem experiência em trilhas longas' : 'Ideal for those who already have experience in long trails'}</li>
                        <li>{language === 'pt' ? 'Comece cedo e leve bastante água' : 'Start early and bring plenty of water'}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <hr className="my-8" />

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 font-playfair text-green-800">
                      🌿 {language === 'pt' ? 'Explore com Consciência' : 'Explore Consciously'}
                    </h2>

                    <p className="mb-4">
                      {language === 'pt'
                        ? 'As trilhas de Mindelo são uma porta de entrada para uma Cabo Verde vibrante, rica em natureza e cultura. Ao explorar essas paisagens únicas, lembre-se de respeitar o meio ambiente: leve seu lixo de volta, evite pisar fora das trilhas e interaja com as comunidades locais com empatia.'
                        : 'Mindelo trails are a gateway to a vibrant Cape Verde, rich in nature and culture. When exploring these unique landscapes, remember to respect the environment: take your trash back, avoid stepping off the trails and interact with local communities with empathy.'
                      }
                    </p>

                    <p className="mb-4">
                      {language === 'pt'
                        ? 'Mindelo te espera de braços abertos — e com trilhas que vão deixar memórias para a vida toda.'
                        : 'Mindelo awaits you with open arms — and with trails that will leave memories for a lifetime.'
                      }
                    </p>

                    <p className="font-semibold text-green-800">
                      <strong>
                        {language === 'pt'
                          ? 'Prepare-se, respire fundo e descubra São Vicente com os pés na terra e o coração na natureza.'
                          : 'Get ready, take a deep breath and discover São Vicente with your feet on the ground and your heart in nature.'
                        }
                      </strong>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
