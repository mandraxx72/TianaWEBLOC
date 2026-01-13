
import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <section id="blog" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando posts do blog...</p>
        </div>
      </div>
    </section>
  );
};

export default LoadingState;
