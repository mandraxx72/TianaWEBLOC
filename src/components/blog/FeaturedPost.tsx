
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  featured: boolean;
  link: string;
  image?: string;
}

interface FeaturedPostProps {
  post: Post;
  getCategoryColor: (category: string) => string;
}

const FeaturedPost = ({ post, getCategoryColor }: FeaturedPostProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-12 overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fade-in">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Featured Image */}
          <div className="aspect-[16/10] lg:aspect-auto relative overflow-hidden">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-nature-green/20 to-primary/20 flex items-center justify-center h-full">
                <div className="text-center text-earth-brown">
                  <div className="text-6xl mb-4">🏔️</div>
                  <p className="text-lg font-medium">Post em Destaque</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <Badge className={`w-fit mb-4 ${getCategoryColor(post.category)}`}>
              {post.category}
            </Badge>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 font-playfair text-sunset-orange">
              {post.title}
            </h3>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              {post.excerpt}
            </p>
            
            {/* Meta Info */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <span>{post.readTime} de leitura</span>
            </div>

            <Button 
              className="w-fit group"
              onClick={() => post.link ? navigate(post.link) : undefined}
            >
              Ler Artigo Completo
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedPost;
