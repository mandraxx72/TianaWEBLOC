import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle
} from "lucide-react";
import { useWordPressEvents } from "@/hooks/useWordPress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getEventDate,
  getEventTime,
  getEventLocation,
  getEventPrice,
  getDifficultyLevel,
  getEventDuration,
  stripHtml,
  getFeaturedImage
} from "@/utils/wordpressHelpers";

interface WordPressEventsProps {
  fallbackEvents?: any[];
  onBookingClick?: (eventId: number) => void;
}

const WordPressEvents = ({ fallbackEvents = [], onBookingClick }: WordPressEventsProps) => {
  const { data: wordpressEvents, isLoading, error } = useWordPressEvents();
  const { t, language } = useLanguage();

  const events = wordpressEvents || fallbackEvents;

  const getDifficultyColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel === 'fácil' || lowerLevel === 'easy' || lowerLevel === 'facile') {
      return 'bg-green-100 text-green-800';
    }
    if (lowerLevel === 'médio' || lowerLevel === 'medium' || lowerLevel === 'moyen') {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (lowerLevel === 'difícil' || lowerLevel === 'hard' || lowerLevel === 'difficile') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getTranslatedDifficulty = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel === 'fácil' || lowerLevel === 'easy' || lowerLevel === 'facile') {
      return t('events.difficulty.easy');
    }
    if (lowerLevel === 'médio' || lowerLevel === 'medium' || lowerLevel === 'moyen') {
      return t('events.difficulty.medium');
    }
    if (lowerLevel === 'difícil' || lowerLevel === 'hard' || lowerLevel === 'difficile') {
      return t('events.difficulty.hard');
    }
    return level;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-[16/10] bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.warn('Error loading WordPress events, using fallback:', error);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event, index) => {
        const featuredImage = getFeaturedImage(event);
        const title = stripHtml(event.title.rendered);
        const description = stripHtml(event.content.rendered);
        const eventDate = getEventDate(event);
        const eventTime = getEventTime(event);
        const location = getEventLocation(event);
        const price = getEventPrice(event);
        const difficulty = getDifficultyLevel(event);
        const duration = getEventDuration(event);
        const maxParticipants = event.acf?.max_participants;
        const included = event.acf?.included || [];

        return (
          <Card
            key={event.id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-0">
              {/* Event Image */}
              <div className="aspect-[16/10] bg-gradient-to-br from-nature-green/20 to-primary/20 relative overflow-hidden">
                {featuredImage ? (
                  <img
                    src={featuredImage}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-4 w-fit">
                        <Calendar className="h-12 w-12 text-earth-brown" strokeWidth={1.5} />
                      </div>
                      <p className="text-lg font-medium text-earth-brown">{title}</p>
                    </div>
                  </div>
                )}

                {/* Difficulty Badge */}
                <Badge className={`absolute top-4 left-4 ${getDifficultyColor(difficulty)}`}>
                  {getTranslatedDifficulty(difficulty)}
                </Badge>

                {/* Price Badge */}
                {price > 0 && (
                  <Badge className="absolute top-4 right-4 bg-primary text-white">
                    €{price}
                  </Badge>
                )}
              </div>

              {/* Event Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 font-playfair">{title}</h3>

                <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>

                {/* Event Info */}
                <div className="space-y-3 mb-6">
                  {eventDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="p-1.5 rounded-md bg-blue-500/10 mr-2">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.5} />
                      </div>
                      <span>{eventDate}</span>
                      {eventTime && <span className="ml-2">{t('events.at')} {eventTime}</span>}
                    </div>
                  )}

                  {duration && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="p-1.5 rounded-md bg-amber-500/10 mr-2">
                        <Clock className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.5} />
                      </div>
                      <span>{duration}</span>
                    </div>
                  )}

                  {location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="p-1.5 rounded-md bg-emerald-500/10 mr-2">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.5} />
                      </div>
                      <span>{location}</span>
                    </div>
                  )}

                  {maxParticipants && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="p-1.5 rounded-md bg-violet-500/10 mr-2">
                        <Users className="h-3.5 w-3.5 text-violet-600" strokeWidth={1.5} />
                      </div>
                      <span>{t('events.maxParticipants').replace('{0}', maxParticipants)}</span>
                    </div>
                  )}
                </div>

                {/* Included Items */}
                {included.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2">{t('events.includes')}</h4>
                    <div className="space-y-1">
                      {included.slice(0, 3).map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center text-sm text-muted-foreground">
                          <div className="p-1 rounded-full bg-green-500/10 mr-2">
                            <CheckCircle className="h-3 w-3 text-green-600" strokeWidth={2.5} />
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                      {included.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          {t('events.moreItems').replace('{0}', String(included.length - 3))}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full bg-gradient-to-r from-gold-start to-gold-end hover:opacity-95 shadow-md border-none text-white"
                  onClick={() => onBookingClick?.(event.id)}
                >
                  {price > 0 ? t('events.bookFor').replace('{0}', String(price)) : t('events.bookNow')}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WordPressEvents;
