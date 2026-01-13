
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

interface PostCardProps {
  post: Post;
  index: number;
  getCategoryColor: (category: string) => string;
}

const PostCard = ({ post, index, getCategoryColor }: PostCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-0">
        {/* Post Image */}
        <div className="aspect-[16/10] relative overflow-hidden">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="bg-gradient-to-br from-accent to-primary/20 flex items-center justify-center h-full">
              <div className="text-center text-earth-brown">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm font-medium">Blog Post</p>
              </div>
            </div>
          )}

          {/* Category Badge */}
          <Badge className={`absolute top-4 left-4 ${getCategoryColor(post.category)}`}>
            {post.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-3 font-playfair text-primary group-hover:text-gold-end transition-colors">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3" />
              <span>{post.date}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{post.readTime} de leitura</span>
            <Button
              variant="ghost"
              size="sm"
              className="group/btn"
              onClick={() => post.link ? navigate(post.link) : undefined}
            >
              Ler mais
              <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
