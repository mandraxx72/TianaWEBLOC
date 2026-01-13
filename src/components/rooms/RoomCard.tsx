import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Users, Maximize2 } from "lucide-react";
import { RoomId } from "./roomsData";

interface RoomImage {
  src: string;
  alt: string;
}

interface RoomData {
  id: RoomId;
  name: string;
  capacity: string;
  capacityValue?: number;
  price: string;
  priceValue?: number;
  period: string;
  size?: string;
  amenities: string[];
  description: string;
  shortDescription?: string;
  highlight?: string;
  hasCarousel: boolean;
  images?: RoomImage[];
}

interface RoomCardProps {
  room: RoomData;
  index: number;
  onDetailsClick: () => void;
}

const RoomCard = ({ room, index, onDetailsClick }: RoomCardProps) => {
  const { t } = useLanguage();
  const { formatAmountWithSecondary } = useCurrency();

  // Get the first image or use a placeholder
  const mainImage = room.images && room.images.length > 0 ? room.images[0] : null;

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in bg-card cursor-pointer group"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onDetailsClick}
    >
      <CardContent className="p-0">
        {/* Room Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage.src}
              alt={mainImage.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent to-primary/20 flex items-center justify-center">
              <span className="text-5xl">🛏️</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Highlight Badge */}
          {room.highlight && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground z-10">
              {room.highlight}
            </Badge>
          )}
        </div>

        {/* Room Details */}
        <div className="p-5 space-y-3">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-muted-foreground">{t('rooms.fromPrice') || 'a partir de'}</span>
            {room.priceValue ? (
              <span className="text-xl font-bold text-primary">
                {formatAmountWithSecondary(room.priceValue).primary}
              </span>
            ) : (
              <span className="text-xl font-bold text-primary">{room.price}</span>
            )}
            <span className="text-sm text-muted-foreground">/{room.period}</span>
          </div>

          {/* Name */}
          <h3 className="text-lg font-semibold font-playfair line-clamp-1">{room.name}</h3>

          {/* Size & Capacity */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {room.size && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-4 w-4" />
                {room.size}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {room.capacity}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {room.shortDescription || room.description.substring(0, 100) + '...'}
          </p>

          {/* Button */}
          <Button
            variant="outline"
            className="w-full mt-2 border-primary/50 text-primary group-hover:border-none group-hover:bg-gradient-to-r group-hover:from-gold-start group-hover:to-gold-end group-hover:text-white transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              onDetailsClick();
            }}
          >
            {t('rooms.moreDetails') || 'Mais Detalhes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
