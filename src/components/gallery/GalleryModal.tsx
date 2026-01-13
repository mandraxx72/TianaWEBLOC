
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGalleryCategory, stripHtml, getFeaturedImage } from "@/utils/wordpressHelpers";

interface GalleryModalProps {
  selectedImage: number | null;
  galleryItems: any[];
  filteredImages: any[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const GalleryModal = ({ 
  selectedImage, 
  galleryItems, 
  filteredImages, 
  onClose, 
  onNavigate 
}: GalleryModalProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const selectedImageData = galleryItems.find(img => img.id === selectedImage);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!selectedImage) return;
    
    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        onNavigate('prev');
        break;
      case 'ArrowRight':
        onNavigate('next');
        break;
      case '+':
      case '=':
        setZoom(prev => Math.min(prev + 0.25, 3));
        break;
      case '-':
        setZoom(prev => Math.max(prev - 0.25, 0.5));
        break;
      case '0':
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
        break;
      case 'r':
        setRotation(prev => (prev + 90) % 360);
        break;
    }
  }, [selectedImage, onClose, onNavigate]);

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [selectedImage, handleKeyDown]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, [selectedImage]);

  if (!selectedImage || !selectedImageData) return null;

  const featuredImage = getFeaturedImage(selectedImageData);
  const title = stripHtml(selectedImageData.title.rendered);
  const description = stripHtml(selectedImageData.content.rendered);
  const category = getGalleryCategory(selectedImageData);

  const currentIndex = filteredImages.findIndex(img => img.id === selectedImage);
  const totalImages = filteredImages.length;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      {/* Header with controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm">
            {currentIndex + 1} / {totalImages}
          </span>
          <Badge variant="secondary">{category}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setRotation(prev => (prev + 90) % 360)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
        onClick={() => onNavigate('prev')}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
        onClick={() => onNavigate('next')}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div 
          className="relative cursor-move"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {featuredImage ? (
            <img
              src={featuredImage}
              alt={title}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              draggable={false}
            />
          ) : (
            <div className="w-96 h-96 bg-gradient-to-br from-warm-beige to-accent flex items-center justify-center text-earth-brown">
              <div className="text-center">
                <div className="text-8xl mb-4">📸</div>
                <p className="text-2xl font-medium">{title}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image info */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-xl font-semibold font-playfair mb-2">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
        <div className="mt-2 text-xs opacity-70">
          Use as setas para navegar • + / - para zoom • R para rotacionar • ESC para fechar
        </div>
      </div>
    </div>
  );
};
