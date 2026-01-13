import { Wifi, Coffee, Tv, Bath, User, Users, Snowflake, Mountain, Maximize } from "lucide-react";

export const getAmenityIcon = (amenity: string): JSX.Element => {
  const lowerAmenity = amenity.toLowerCase();
  
  // Wi-Fi (same in all languages)
  if (lowerAmenity === "wi-fi") return <Wifi className="h-4 w-4" />;
  
  // TV (same in all languages)
  if (lowerAmenity === "tv") return <Tv className="h-4 w-4" />;
  
  // Minibar / Frigobar
  if (["frigobar", "minibar"].includes(lowerAmenity)) return <Coffee className="h-4 w-4" />;
  
  // Bathroom related (PT/EN/FR)
  if ([
    "banheiro privativo", "private bathroom", "salle de bain privée",
    "banheira", "bathtub", "baignoire",
    "1 banheiro", "1 bathroom", "1 salle de bain"
  ].includes(lowerAmenity)) {
    return <Bath className="h-4 w-4" />;
  }
  
  // Air conditioning (PT/EN/FR)
  if (lowerAmenity.includes("ar condicionado") || 
      lowerAmenity.includes("air conditioning") || 
      lowerAmenity.includes("climatisation")) {
    return <Snowflake className="h-4 w-4" />;
  }
  
  // Balcony / View (PT/EN/FR)
  if (["varanda", "balcony", "balcon", "vista mar", "sea view", "vue mer"].includes(lowerAmenity)) {
    return <Mountain className="h-4 w-4" />;
  }
  
  // Extra area (PT/EN/FR)
  if (["área extra", "extra area", "espace supplémentaire"].includes(lowerAmenity)) {
    return <Maximize className="h-4 w-4" />;
  }
  
  return <Coffee className="h-4 w-4" />;
};

export const getCapacityIcon = (capacity: string): JSX.Element => {
  return capacity.includes("2") ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />;
};