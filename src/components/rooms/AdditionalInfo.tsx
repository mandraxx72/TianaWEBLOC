import { Card, CardContent } from "@/components/ui/card";

const AdditionalInfo = () => {
  return (
    <div className="mt-16 text-center">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-8">
          <h3 className="text-2xl font-semibold mb-4 font-playfair text-primary">
            Incluso em Todas as Acomodações
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>☕</span>
              <span>Café da manhã</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🅿️</span>
              <span>Estacionamento</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🏊</span>
              <span>Piscina</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🌿</span>
              <span>Acesso aos jardins</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdditionalInfo;