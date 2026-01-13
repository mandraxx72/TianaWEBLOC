import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, ChevronDown, ChevronUp } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useBooking } from "@/contexts/BookingContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeroBookingFormProps {
  onCheckAvailability: () => void;
}

const HeroBookingForm = ({ onCheckAvailability }: HeroBookingFormProps) => {
  const { checkIn, checkOut, guests, setCheckIn, setCheckOut, setGuests } = useBooking();
  const { t, language } = useLanguage();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  const handleCheckAvailability = () => {
    if (checkIn && checkOut && nights > 0) {
      onCheckAvailability();
    }
  };

  const dateLocale = language === 'pt' ? pt : undefined;

  // Mobile collapsed view - just a CTA button
  const MobileCollapsedView = () => (
    <div className="md:hidden">
      <Button 
        onClick={() => setIsExpanded(true)}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-lg"
      >
        <CalendarIcon className="mr-2 h-5 w-5" />
        {t('hero.checkAvailability') || 'Verificar Disponibilidade'}
        <ChevronDown className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );

  // Mobile expanded view - full form
  const MobileExpandedView = () => (
    <div className="md:hidden bg-card/95 backdrop-blur-md rounded-xl shadow-2xl p-4 w-full max-w-lg mx-auto animate-fade-in">
      {/* Collapse button */}
      <button 
        onClick={() => setIsExpanded(false)}
        className="w-full flex items-center justify-center text-muted-foreground mb-4 py-1"
      >
        <ChevronUp className="h-5 w-5 mr-1" />
        <span className="text-sm">{t('booking.collapse') || 'Minimizar'}</span>
      </button>

      <div className="space-y-3">
        {/* Check-in */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {t('booking.checkIn')}
          </label>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "dd/MM/yyyy") : t('booking.selectCheckIn')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  setCheckIn(date);
                  if (date && (!checkOut || checkOut <= date)) {
                    setCheckOut(addDays(date, 1));
                  }
                  setCheckInOpen(false);
                }}
                disabled={(date) => date < today}
                initialFocus
                locale={dateLocale}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {t('booking.checkOut')}
          </label>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "dd/MM/yyyy") : t('booking.selectCheckOut')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(date) => {
                  setCheckOut(date);
                  setCheckOutOpen(false);
                }}
                disabled={(date) => date <= (checkIn || today)}
                initialFocus
                locale={dateLocale}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {t('booking.guests')}
          </label>
          <Select value={guests.toString()} onValueChange={(val) => setGuests(parseInt(val))}>
            <SelectTrigger className="h-11">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? t('booking.person') : t('booking.people')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nights display */}
        {nights > 0 && (
          <div className="text-center text-sm text-muted-foreground py-1">
            {nights} {nights === 1 ? t('booking.night') : t('booking.nights')}
          </div>
        )}

        {/* Button */}
        <Button 
          onClick={handleCheckAvailability}
          disabled={!checkIn || !checkOut || nights <= 0}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {t('hero.checkAvailability') || 'Verificar Disponibilidade'}
        </Button>
      </div>
    </div>
  );

  // Desktop view - original layout
  const DesktopView = () => (
    <div className="hidden md:block bg-card/95 backdrop-blur-md rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-4 gap-4 items-end">
        {/* Check-in */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('booking.checkIn')}
          </label>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "dd/MM/yyyy") : t('booking.selectCheckIn')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  setCheckIn(date);
                  if (date && (!checkOut || checkOut <= date)) {
                    setCheckOut(addDays(date, 1));
                  }
                  setCheckInOpen(false);
                }}
                disabled={(date) => date < today}
                initialFocus
                locale={dateLocale}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('booking.checkOut')}
          </label>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "dd/MM/yyyy") : t('booking.selectCheckOut')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(date) => {
                  setCheckOut(date);
                  setCheckOutOpen(false);
                }}
                disabled={(date) => date <= (checkIn || today)}
                initialFocus
                locale={dateLocale}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('booking.guests')}
          </label>
          <Select value={guests.toString()} onValueChange={(val) => setGuests(parseInt(val))}>
            <SelectTrigger className="h-12">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? t('booking.person') : t('booking.people')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Button */}
        <Button 
          onClick={handleCheckAvailability}
          disabled={!checkIn || !checkOut || nights <= 0}
          className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {t('hero.checkAvailability') || 'Verificar Disponibilidade'}
        </Button>
      </div>

      {/* Nights display */}
      {nights > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {nights} {nights === 1 ? t('booking.night') : t('booking.nights')}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: Show collapsed or expanded view */}
      {isExpanded ? <MobileExpandedView /> : <MobileCollapsedView />}
      
      {/* Desktop: Always show full form */}
      <DesktopView />
    </>
  );
};

export default HeroBookingForm;
