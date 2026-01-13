
import { useState, useMemo } from "react";
import { useWordPressGallery } from "@/hooks/useWordPress";
import { getGalleryCategory, stripHtml } from "@/utils/wordpressHelpers";
import { GalleryFilters } from "@/components/gallery/GalleryFilters";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryModal } from "@/components/gallery/GalleryModal";
import { GalleryLoading } from "@/components/gallery/GalleryLoading";

interface WordPressGalleryProps {
  fallbackImages?: any[];
}

const WordPressGallery = ({ fallbackImages = [] }: WordPressGalleryProps) => {
  const { data: wordpressGallery, isLoading, error } = useWordPressGallery();
  
  // State
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');

  const galleryItems = wordpressGallery || fallbackImages;

  // Extract unique categories
  const categories = useMemo(() => 
    ["Todos", ...Array.from(new Set(galleryItems.map(item => getGalleryCategory(item))))],
    [galleryItems]
  );

  // Filter and sort images
  const filteredAndSortedImages = useMemo(() => {
    let filtered = galleryItems;

    // Apply category filter
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(item => getGalleryCategory(item) === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const title = stripHtml(item.title.rendered).toLowerCase();
        const content = stripHtml(item.content.rendered).toLowerCase();
        const category = getGalleryCategory(item).toLowerCase();
        return title.includes(searchLower) || 
               content.includes(searchLower) || 
               category.includes(searchLower);
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.id - b.id;
        case 'title':
          return stripHtml(a.title.rendered).localeCompare(stripHtml(b.title.rendered));
        case 'category':
          return getGalleryCategory(a).localeCompare(getGalleryCategory(b));
        case 'newest':
        default:
          return b.id - a.id;
      }
    });

    return sorted;
  }, [galleryItems, selectedCategory, searchTerm, sortBy]);

  // Modal navigation
  const openModal = (imageId: number) => {
    setSelectedImage(imageId);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    const currentIndex = filteredAndSortedImages.findIndex(img => img.id === selectedImage);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredAndSortedImages.length - 1;
    } else {
      newIndex = currentIndex < filteredAndSortedImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(filteredAndSortedImages[newIndex].id);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Filter skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-10 w-80 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        
        <GalleryLoading viewMode={viewMode} />
      </div>
    );
  }

  if (error) {
    console.warn('Erro ao carregar galeria do WordPress, usando fallback:', error);
  }

  return (
    <>
      {/* Filters */}
      <GalleryFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalImages={filteredAndSortedImages.length}
      />

      {/* Gallery Grid */}
      {filteredAndSortedImages.length > 0 ? (
        <GalleryGrid
          images={filteredAndSortedImages}
          onImageClick={openModal}
          viewMode={viewMode}
        />
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Nenhuma imagem encontrada</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      )}

      {/* Modal */}
      <GalleryModal
        selectedImage={selectedImage}
        galleryItems={galleryItems}
        filteredImages={filteredAndSortedImages}
        onClose={closeModal}
        onNavigate={navigateImage}
      />
    </>
  );
};

export default WordPressGallery;
