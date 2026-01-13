
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation } from "lucide-react";

interface MapProps {
  className?: string;
}

const Map: React.FC<MapProps> = ({ className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(true);

  // Coordenadas da Casa Tiana em Mindelo, São Vicente, Cabo Verde
  const casaTianaCoords: [number, number] = [-24.8864, 16.8868];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: casaTianaCoords,
      zoom: 14,
      pitch: 45,
    });

    // Adicionar controles de navegação
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Adicionar controle de fullscreen
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Criar marcador customizado para Casa Tiana
    const marker = new mapboxgl.Marker({
      color: '#8B4513', // Cor terracota
      scale: 1.2
    })
    .setLngLat(casaTianaCoords)
    .addTo(map.current);

    // Criar popup informativo
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: true
    })
    .setLngLat(casaTianaCoords)
    .setHTML(`
      <div class="p-3 text-center">
        <h3 class="font-bold text-lg mb-2">Casa Tiana</h3>
        <p class="text-sm text-gray-600 mb-3">
          Alto São Nicolau<br>
          Mindelo - S.Vicente<br>
          Cabo Verde
        </p>
        <button 
          onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${casaTianaCoords[1]},${casaTianaCoords[0]}', '_blank')"
          class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
        >
          Como Chegar
        </button>
      </div>
    `);

    // Adicionar popup ao marcador
    marker.setPopup(popup);

    // Animar para a localização após carregar
    map.current.on('load', () => {
      map.current?.flyTo({
        center: casaTianaCoords,
        zoom: 15,
        pitch: 60,
        duration: 2000,
        essential: true
      });
    });
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
      initializeMap(mapboxToken);
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${casaTianaCoords[1]},${casaTianaCoords[0]}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setShowTokenInput(false);
      initializeMap(savedToken);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  if (showTokenInput) {
    return (
      <div className={`aspect-[16/10] bg-gradient-to-br from-nature-green/20 to-primary/20 flex items-center justify-center p-6 rounded-lg ${className}`}>
        <div className="text-center max-w-md">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Configurar Mapa Interativo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para exibir o mapa interativo, você precisa de uma chave pública do Mapbox.
          </p>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Cole sua chave pública do Mapbox aqui"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              Ativar Mapa
            </Button>
            <p className="text-xs text-muted-foreground">
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Obter chave gratuita no Mapbox →
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-[16/10] rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Overlay com informações */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium">Casa Tiana</p>
            <p className="text-xs text-muted-foreground">Mindelo, São Vicente</p>
          </div>
        </div>
      </div>

      {/* Botão de direções */}
      <div className="absolute bottom-4 right-4">
        <Button 
          size="sm" 
          onClick={handleDirections}
          className="bg-white/90 text-primary hover:bg-white border shadow-lg"
          variant="outline"
        >
          <Navigation className="h-4 w-4 mr-1" />
          Direções
        </Button>
      </div>
    </div>
  );
};

export default Map;
