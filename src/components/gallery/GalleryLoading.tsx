
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface GalleryLoadingProps {
  viewMode: 'grid' | 'masonry';
  count?: number;
}

export const GalleryLoading = ({ viewMode, count = 12 }: GalleryLoadingProps) => {
  const gridClass = viewMode === 'masonry' 
    ? "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={`overflow-hidden ${viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''}`}>
          <CardContent className="p-0">
            <div className={`relative ${viewMode === 'masonry' ? 'aspect-auto' : 'aspect-[4/3]'}`}>
              <Skeleton className="w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"
                    style={{
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                </div>
              </Skeleton>
              
              {/* Category badge skeleton */}
              <Skeleton className="absolute top-3 left-3 w-16 h-6 rounded-full" />
            </div>
            
            {/* Masonry info skeleton */}
            {viewMode === 'masonry' && (
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
