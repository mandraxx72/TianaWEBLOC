
import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { getGalleryCategory, stripHtml, getFeaturedImage } from "@/utils/wordpressHelpers";

interface GalleryGridProps {
  images: any[];
  onImageClick: (imageId: number) => void;
  viewMode: 'grid' | 'masonry';
}

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage = ({ src, alt, className }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const observerCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    
    observer.observe(node);
    
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={observerCallback} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      )}
      
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
};

export const GalleryGrid = ({ images, onImageClick, viewMode }: GalleryGridProps) => {
  const gridClass = viewMode === 'masonry' 
    ? "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  return (
    <div className={gridClass}>
      {images.map((item, index) => {
        const featuredImage = getFeaturedImage(item);
        const title = stripHtml(item.title.rendered);
        const description = stripHtml(item.content.rendered);
        const category = getGalleryCategory(item);

        return (
          <Card 
            key={item.id}
            className={`group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in ${
              viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''
            }`}
            style={{ 
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'both'
            }}
            onClick={() => onImageClick(item.id)}
          >
            <CardContent className="p-0 relative">
              <div className={`relative bg-gradient-to-br from-warm-beige to-accent flex items-center justify-center overflow-hidden ${
                viewMode === 'masonry' ? 'aspect-auto' : 'aspect-[4/3]'
              }`}>
                {featuredImage ? (
                  <LazyImage
                    src={featuredImage}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center text-earth-brown p-8">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-sm font-medium">{title}</p>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <Eye className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-lg mb-1">{title}</p>
                    <p className="text-sm opacity-90 line-clamp-2">{description}</p>
                  </div>
                </div>

                {/* Category Badge */}
                <Badge className="absolute top-3 left-3 bg-primary/90 text-white shadow-lg">
                  {category}
                </Badge>

                {/* View indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Image info for masonry view */}
              {viewMode === 'masonry' && (
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
