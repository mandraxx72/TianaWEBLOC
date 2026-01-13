import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SimpleImageModalProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  roomName?: string;
  roomDescription?: string;
}

export const SimpleImageModal = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  roomName,
  roomDescription,
}: SimpleImageModalProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle animated close
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      onClose();
    }, 200);
  }, [onClose]);

  // Handle open animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [isOpen]);

  const goNext = useCallback(() => {
    onIndexChange((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  const goPrev = useCallback(() => {
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  // Mouse drag handlers for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset zoom, position and rotation when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
        case "0":
          handleReset();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose, goNext, goPrev, handleZoomIn, handleZoomOut, handleRotate, handleReset]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible && !isClosing 
          ? 'bg-black/90 opacity-100' 
          : 'bg-black/0 opacity-0'
      }`}
      onClick={handleClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header with controls */}
      <div className={`absolute top-4 left-4 right-4 z-10 flex justify-between items-center transition-all duration-200 ${
        isVisible && !isClosing 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-4'
      }`}>
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm">
            {currentIndex + 1} / {images.length}
          </span>
          {roomName && (
            <Badge variant="secondary">{roomName}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              handleRotate();
            }}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 transition-all duration-200 ${
              isVisible && !isClosing 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-4'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 transition-all duration-200 ${
              isVisible && !isClosing 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-4'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Image container */}
      <div 
        className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-200 ${
          isVisible && !isClosing 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`relative ${zoom > 1 ? 'cursor-move' : 'cursor-default'}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          onMouseDown={handleMouseDown}
        >
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* Image info */}
      <div 
        className={`absolute bottom-4 left-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white transition-all duration-200 ${
          isVisible && !isClosing 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {roomName && (
          <h3 className="text-xl font-semibold font-playfair mb-2">{roomName}</h3>
        )}
        {roomDescription && (
          <p className="text-sm opacity-90 mb-2">{roomDescription}</p>
        )}
        <div className="text-xs opacity-70">
          Use as setas para navegar • + / - para zoom • R para rotacionar • 0 para reset • ESC para fechar
        </div>
      </div>
    </div>
  );
};
