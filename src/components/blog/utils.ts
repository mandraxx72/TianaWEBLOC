
export const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    "Turismo": "bg-blue-100 text-blue-800",
    "Eventos": "bg-purple-100 text-purple-800",
    "Gastronomia": "bg-orange-100 text-orange-800",
    "Natureza": "bg-green-100 text-green-800",
    "Sustentabilidade": "bg-emerald-100 text-emerald-800",
    "Roteiros": "bg-pink-100 text-pink-800",
    "Geral": "bg-gray-100 text-gray-800"
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};
