import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LightboxImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Update index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Reset state when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          break;
        case "ArrowRight":
          setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          break;
        case "+":
        case "=":
          setZoom((prev) => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoom((prev) => Math.max(prev - 0.25, 0.5));
          break;
        case "0":
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          setRotation(0);
          break;
        case "r":
        case "R":
          setRotation((prev) => (prev + 90) % 360);
          break;
      }
    },
    [isOpen, images.length, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, handleKeyDown]);

  // Mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const navigatePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const navigateNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header with controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3 text-white">
          <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.5))}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>

          <span className="text-white text-sm min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
          >
            <RotateCw className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => {
              setZoom(1);
              setRotation(0);
              setPosition({ x: 0, y: 0 });
            }}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 ml-2"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12 pointer-events-auto"
            onClick={navigatePrev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12 pointer-events-auto"
            onClick={navigateNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Image container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden p-8"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className={`relative ${zoom > 1 ? "cursor-grab" : "cursor-default"} ${isDragging ? "cursor-grabbing" : ""}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-[92vw] max-h-[90vh] object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Image info */}
      {(currentImage.title || currentImage.description) && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white pointer-events-auto">
          {currentImage.title && (
            <h3 className="text-lg font-semibold font-playfair mb-1">
              {currentImage.title}
            </h3>
          )}
          {currentImage.description && (
            <p className="text-sm opacity-90">{currentImage.description}</p>
          )}
          <div className="mt-2 text-xs opacity-60">
            ← → navegar • + / - zoom • R rotacionar • ESC fechar
          </div>
        </div>
      )}

      {/* Thumbnail strip for multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-auto max-w-[80vw] overflow-x-auto px-4 py-2 bg-black/50 rounded-lg">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-50 hover:opacity-75"
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
