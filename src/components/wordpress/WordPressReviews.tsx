
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { useWordPressReviews } from "@/hooks/useWordPress";
import { 
  getReviewerName, 
  getReviewRating, 
  getReviewerLocation, 
  getReviewDate,
  stripHtml 
} from "@/utils/wordpressHelpers";

interface WordPressReviewsProps {
  fallbackReviews?: any[];
  maxReviews?: number;
}

const WordPressReviews = ({ fallbackReviews = [], maxReviews = 6 }: WordPressReviewsProps) => {
  const { data: wordpressReviews, isLoading, error } = useWordPressReviews();

  const reviews = wordpressReviews || fallbackReviews;
  const displayReviews = reviews.slice(0, maxReviews);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.warn('Erro ao carregar reviews do WordPress, usando fallback:', error);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayReviews.map((review, index) => {
        const reviewerName = getReviewerName(review);
        const rating = getReviewRating(review);
        const location = getReviewerLocation(review);
        const date = getReviewDate(review);
        const content = stripHtml(review.content?.rendered || '');

        return (
          <Card 
            key={review.id || index}
            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <Quote className="h-8 w-8 text-primary/30 mb-4" />

              <p className="text-muted-foreground mb-6 leading-relaxed italic">
                "{content}"
              </p>

              <div className="flex items-center space-x-1 mb-4">
                {renderStars(rating)}
              </div>

              <div className="flex items-center space-x-3">
                <Avatar className="bg-primary text-white">
                  <AvatarFallback className="bg-primary text-white font-semibold">
                    {getInitials(reviewerName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground">{reviewerName}</h4>
                  {location && <p className="text-sm text-muted-foreground">{location}</p>}
                  <p className="text-xs text-muted-foreground">{date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WordPressReviews;
