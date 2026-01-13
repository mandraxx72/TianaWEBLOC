import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, MapPin, Calendar, Thermometer, Sun } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    uv: number;
  };
  forecast?: {
    forecastday: ForecastDay[];
  };
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        console.log('Fetching weather data...');
        const { data, error } = await supabase.functions.invoke('weather');
        
        if (error) {
          throw new Error(error.message);
        }
        
        console.log('Weather data received:', data);
        setWeather(data as WeatherData);
      } catch (err) {
        console.error('Weather fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const formatDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    }
    
    return date.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '');
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/10 p-6 backdrop-blur-sm border border-border/50 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Cloud className="h-8 w-8 animate-pulse text-primary/60" />
          <span className="text-muted-foreground font-opensans">A carregar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-6 backdrop-blur-sm border border-border/50">
        <div className="text-center">
          <Cloud className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground font-opensans">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const forecastDays = weather.forecast?.forecastday?.slice(1, 5) || [];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-6 backdrop-blur-sm border border-border/50 shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Location */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground/80 font-opensans">
            {weather.location.name}
          </span>
        </div>

        {/* Main weather display */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-5xl font-bold text-foreground font-playfair tracking-tight">
              {Math.round(weather.current.temp_c)}°
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-opensans capitalize">
              {weather.current.condition.text}
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
            <img 
              src={`https:${weather.current.condition.icon}`} 
              alt={weather.current.condition.text}
              className="relative w-20 h-20 drop-shadow-lg"
            />
          </div>
        </div>
        
        {/* Weather details */}
        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Thermometer className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-opensans">Sensação</p>
              <p className="text-sm font-semibold text-foreground">{Math.round(weather.current.feelslike_c)}°</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Sun className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-opensans">Índice UV</p>
              <p className="text-sm font-semibold text-foreground">{weather.current.uv}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Droplets className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-opensans">Humidade</p>
              <p className="text-sm font-semibold text-foreground">{weather.current.humidity}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wind className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-opensans">Vento</p>
              <p className="text-sm font-semibold text-foreground">{Math.round(weather.current.wind_kph)} km/h</p>
            </div>
          </div>
        </div>

        {/* Forecast section */}
        {forecastDays.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground font-opensans uppercase tracking-wide">
                Previsão
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {forecastDays.map((day) => (
                <div 
                  key={day.date}
                  className="flex flex-col items-center p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs font-medium text-foreground/70 font-opensans capitalize">
                    {formatDayName(day.date)}
                  </span>
                  <img 
                    src={`https:${day.day.condition.icon}`} 
                    alt={day.day.condition.text}
                    className="w-10 h-10 my-1"
                  />
                  <div className="flex items-center gap-1 text-xs font-opensans">
                    <span className="font-semibold text-foreground">{Math.round(day.day.maxtemp_c)}°</span>
                    <span className="text-muted-foreground">{Math.round(day.day.mintemp_c)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;