import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { SimpleImageModal } from "@/components/ui/simple-image-modal";

interface RoomImage {
  src: string;
  alt: string;
}

interface RoomCarouselProps {
  images: RoomImage[];
  roomName?: string;
  roomDescription?: string;
}

const RoomCarousel = ({ images, roomName, roomDescription }: RoomCarouselProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const openModal = (index: number) => {
    setModalIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <Carousel className="w-full h-full group">
        <CarouselContent>
          {images.map((image, imgIndex) => (
            <CarouselItem key={imgIndex}>
              <div 
                className="relative aspect-[4/3] cursor-pointer"
                onClick={() => openModal(imgIndex)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Fullscreen hint overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 rounded-full p-3">
                    <Expand className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious 
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronLeft className="h-4 w-4" />
        </CarouselPrevious>
        <CarouselNext 
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronRight className="h-4 w-4" />
        </CarouselNext>
      </Carousel>

      <SimpleImageModal
        images={images}
        currentIndex={modalIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onIndexChange={setModalIndex}
        roomName={roomName}
        roomDescription={roomDescription}
      />
    </>
  );
};

export default RoomCarousel;
