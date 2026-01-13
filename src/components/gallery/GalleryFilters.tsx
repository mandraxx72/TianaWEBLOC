
import { useState } from "react";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GalleryFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'masonry';
  onViewModeChange: (mode: 'grid' | 'masonry') => void;
  totalImages: number;
}

export const GalleryFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalImages
}: GalleryFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search and main controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar nas imagens..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
          
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'masonry' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('masonry')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced filters (collapsible) */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-background/50 backdrop-blur-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigas</SelectItem>
                  <SelectItem value="title">Título (A-Z)</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 hover:shadow-md ${
              selectedCategory === category 
                ? "bg-primary text-white hover:bg-primary/90 shadow-lg" 
                : "hover:bg-primary hover:text-white"
            }`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Results counter */}
      <div className="text-sm text-muted-foreground">
        Mostrando {totalImages} {totalImages === 1 ? 'imagem' : 'imagens'}
        {selectedCategory !== "Todos" && ` em "${selectedCategory}"`}
        {searchTerm && ` para "${searchTerm}"`}
      </div>
    </div>
  );
};
