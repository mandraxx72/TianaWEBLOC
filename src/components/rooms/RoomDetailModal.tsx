import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Users, X, CreditCard, Clock, Loader2, AlertCircle } from "lucide-react";
import { format, differenceInDays, addDays, isSameDay, eachDayOfInterval, isWithinInterval } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBooking } from "@/contexts/BookingContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getAmenityIcon } from "./roomUtils";
import { RoomId } from "./roomsData";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePayment } from "@/hooks/usePayment";
import { PaymentMethodsLogos } from "@/components/ui/PaymentMethodsLogos";
import { useOccupiedDates } from "@/hooks/useOccupiedDates";
import { SEOHead } from "@/components/seo/SEOHead";

interface RoomImage {
  src: string;
  alt: string;
}

interface RoomData {
  id: RoomId;
  name: string;
  capacity: string;
  capacityValue?: number;
  price: string;
  priceValue?: number;
  period: string;
  amenities: string[];
  description: string;
  highlight?: string;
  size?: string;
  images?: RoomImage[];
}

interface RoomDetailModalProps {
  room: RoomData | null;
  isOpen: boolean;
  onClose: () => void;
}

const RoomDetailModal = ({ room, isOpen, onClose }: RoomDetailModalProps) => {
  const { t, language } = useLanguage();
  const { checkIn, checkOut, guests, setCheckIn, setCheckOut, setGuests } = useBooking();
  const { formatAmountWithSecondary } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initiatePayment, isProcessing } = usePayment();

  // Fetch occupied dates for this specific room
  const { occupiedDates, loading: loadingDates } = useOccupiedDates(room?.id);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // Check if a date is occupied
  const isDateOccupied = (date: Date) => {
    return occupiedDates.some(occupiedDate => isSameDay(date, occupiedDate));
  };

  // Check if selected date range has conflicts
  const hasDateConflict = useMemo(() => {
    if (!checkIn || !checkOut) return false;

    try {
      const selectedDates = eachDayOfInterval({ start: checkIn, end: checkOut });
      return selectedDates.some(date => isDateOccupied(date));
    } catch {
      return false;
    }
  }, [checkIn, checkOut, occupiedDates]);

  if (!room) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = room.priceValue ? room.priceValue * nights : 0;
  const dateLocale = language === 'pt' ? pt : undefined;

  const handleSubmitReservation = async () => {
    if (!user) {
      toast.error(t('booking.loginRequired'));
      navigate('/auth');
      return;
    }

    if (!checkIn || !checkOut || nights <= 0) {
      toast.error(t('booking.errorSelectDates') || 'Selecione as datas');
      return;
    }

    if (!guestName || !guestEmail || !guestPhone) {
      toast.error(t('booking.errorFillFields') || 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const reservationNumber = `CT${Date.now().toString().slice(-8)}`;

      const { data: insertedData, error } = await supabase.from('reservations').insert({
        user_id: user.id,
        room_type: room.id,
        room_name: room.name,
        room_price: room.priceValue || 0,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        nights,
        guests,
        total_price: totalPrice,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        special_requests: specialRequests || null,
        reservation_number: reservationNumber,
        status: 'pending',
        payment_status: 'pending'
      }).select().single();

      if (error) throw error;

      setReservationId(insertedData.id);
      setShowPaymentOptions(true);
      toast.success(t('booking.reservationCreated') || 'Reserva criada! Escolha como deseja pagar.');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(t('booking.reservationErrorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!reservationId) return;

    // Open payment window IMMEDIATELY to avoid popup blocker
    const paymentWindow = window.open("", "_blank");
    if (!paymentWindow) {
      toast.error("Por favor, permita popups para continuar com o pagamento.");
      return;
    }

    // Show loading state in payment window
    paymentWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Processando Pagamento...</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .loader { text-align: center; }
            .spinner { width: 50px; height: 50px; border: 4px solid #e5e5e5; border-top-color: #B78B4B; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            p { color: #666; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <p>A preparar pagamento seguro...</p>
          </div>
        </body>
      </html>
    `);
    paymentWindow.document.close();

    const result = await initiatePayment({
      reservationId,
      amount: totalPrice,
      customerEmail: guestEmail,
      customerPhone: guestPhone,
      customerName: guestName,
      billAddrCity: "Mindelo",
      billAddrLine1: "",
      billAddrPostCode: ""
    });

    if (result.success && result.formHtml) {
      paymentWindow.document.open();
      paymentWindow.document.write(result.formHtml);
      paymentWindow.document.close();
      toast.success("Janela de pagamento aberta. Complete o pagamento para confirmar a reserva.");
      onClose();
    } else {
      paymentWindow.close();
    }
  };

  const handlePayLater = async () => {
    if (!reservationId) return;

    try {
      // Fetch reservation data
      const { data: reservation, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

      if (fetchError || !reservation) {
        console.error('Error fetching reservation:', fetchError);
        toast.error('Erro ao processar reserva');
        return;
      }

      // Send pending payment email
      const { error: emailError } = await supabase.functions.invoke('send-pending-payment-email', {
        body: {
          reservationId: reservation.id,
          reservationNumber: reservation.reservation_number,
          guestName: reservation.guest_name,
          guestEmail: reservation.guest_email,
          roomName: reservation.room_name,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          guests: reservation.guests,
          nights: reservation.nights,
          totalPrice: reservation.total_price,
          specialRequests: reservation.special_requests
        }
      });

      if (emailError) {
        console.error('Error sending pending payment email:', emailError);
        // Still proceed even if email fails
      } else {
        console.log('Pending payment email sent successfully');
      }

      toast.success(t('booking.reservationConfirmed') || 'Reserva confirmada! Verifique o seu email para completar o pagamento.');
      onClose();
      navigate('/my-reservations');
    } catch (error) {
      console.error('Error in handlePayLater:', error);
      toast.success(t('booking.reservationConfirmed') || 'Reserva confirmada! Pode pagar mais tarde.');
      onClose();
      navigate('/my-reservations');
    }
  };

  // SEO data for room
  const roomSeoDescription = language === 'pt'
    ? `Reserve o ${room.name} na Casa Tiana em Mindelo. ${room.description.slice(0, 120)}...`
    : language === 'fr'
      ? `Réservez ${room.name} à Casa Tiana à Mindelo. ${room.description.slice(0, 120)}...`
      : `Book ${room.name} at Casa Tiana in Mindelo. ${room.description.slice(0, 120)}...`;

  const roomImage = room.images && room.images.length > 0
    ? room.images[0].src
    : '/lovable-uploads/81e31ffa-97ad-4ef8-a66b-16b6fb8cbfa6.png';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Dynamic SEO when modal is open */}
      {isOpen && (
        <SEOHead
          title={room.name}
          description={roomSeoDescription}
          image={roomImage}
          type="product"
          keywords={['quarto', 'room', 'Casa Tiana', 'Mindelo', room.name, 'reserva', 'booking']}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'HotelRoom',
            name: room.name,
            description: room.description,
            image: roomImage,
            occupancy: {
              '@type': 'QuantitativeValue',
              value: room.capacityValue || 2,
            },
            ...(room.priceValue && {
              priceRange: `€${room.priceValue}`,
              offers: {
                '@type': 'Offer',
                price: room.priceValue,
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
              },
            }),
            amenityFeature: room.amenities.map(amenity => ({
              '@type': 'LocationFeatureSpecification',
              name: amenity,
              value: true,
            })),
            containedInPlace: {
              '@type': 'LodgingBusiness',
              name: 'Casa Tiana',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Rua de Lisboa 28',
                addressLocality: 'Mindelo',
                addressRegion: 'São Vicente',
                addressCountry: 'CV',
              },
            },
          }}
        />
      )}
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-background/80 p-2 hover:bg-background transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Image Carousel */}
          <div className="relative bg-muted">
            {room.images && room.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {room.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[4/3] lg:aspect-square">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-accent to-primary/20 flex items-center justify-center">
                <span className="text-6xl">🛏️</span>
              </div>
            )}
          </div>

          {/* Right: Room Details & Booking Form */}
          <div className="p-6 lg:p-8 space-y-6">
            <DialogHeader className="text-left p-0">
              <div className="flex items-start justify-between">
                <div>
                  {room.highlight && (
                    <Badge className="mb-2 bg-primary text-primary-foreground">
                      {room.highlight}
                    </Badge>
                  )}
                  <DialogTitle className="text-2xl font-playfair">{room.name}</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              {room.priceValue ? (
                <>
                  <span className="text-3xl font-bold text-primary">
                    {formatAmountWithSecondary(room.priceValue).primary}
                  </span>
                  <span className="text-muted-foreground">/{room.period}</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-primary">{room.price}</span>
                  <span className="text-muted-foreground">/{room.period}</span>
                </>
              )}
            </div>

            {/* Size & Capacity */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              {room.size && <span>📐 {room.size}</span>}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {room.capacity}
              </span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {room.description}
            </p>

            {/* Amenities */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">{t('rooms.amenities')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <div className="border-t pt-6 space-y-4">
              <h4 className="font-medium text-foreground">{t('booking.title')}</h4>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('booking.checkIn')}</label>
                  <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left",
                          !checkIn && "text-muted-foreground",
                          hasDateConflict && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {checkIn ? format(checkIn, "dd/MM/yyyy") : "Selecione"}
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
                        disabled={(date) => date < today || isDateOccupied(date)}
                        modifiers={{
                          occupied: occupiedDates
                        }}
                        modifiersStyles={{
                          occupied: {
                            backgroundColor: 'hsl(var(--destructive) / 0.1)',
                            color: 'hsl(var(--destructive))',
                            textDecoration: 'line-through'
                          }
                        }}
                        initialFocus
                        locale={dateLocale}
                        className="pointer-events-auto"
                      />
                      {loadingDates && (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                          A verificar disponibilidade...
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('booking.checkOut')}</label>
                  <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left",
                          !checkOut && "text-muted-foreground",
                          hasDateConflict && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {checkOut ? format(checkOut, "dd/MM/yyyy") : "Selecione"}
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
                        disabled={(date) => date <= (checkIn || today) || isDateOccupied(date)}
                        modifiers={{
                          occupied: occupiedDates
                        }}
                        modifiersStyles={{
                          occupied: {
                            backgroundColor: 'hsl(var(--destructive) / 0.1)',
                            color: 'hsl(var(--destructive))',
                            textDecoration: 'line-through'
                          }
                        }}
                        initialFocus
                        locale={dateLocale}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('booking.guests')}</label>
                <Select value={guests.toString()} onValueChange={(val) => setGuests(parseInt(val))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
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

              {/* Guest Info */}
              <div className="space-y-3">
                <Input
                  placeholder={t('booking.fullNamePlaceholder')}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="h-9"
                />
                <Input
                  type="email"
                  placeholder={t('booking.emailPlaceholder')}
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="h-9"
                />
                <Input
                  type="tel"
                  placeholder={t('booking.phonePlaceholder')}
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="h-9"
                />
                <Textarea
                  placeholder={t('booking.specialRequestsPlaceholder')}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </div>

              {/* Date Conflict Warning */}
              {hasDateConflict && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{t('booking.dateConflict') || 'As datas selecionadas incluem dias indisponíveis. Por favor, escolha outras datas.'}</span>
                </div>
              )}

              {/* Total */}
              {nights > 0 && totalPrice > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{nights} {nights === 1 ? t('booking.night') : t('booking.nights')}</span>
                    <span>{formatAmountWithSecondary(totalPrice).primary}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>{t('booking.total')}</span>
                    <span className="text-primary">{formatAmountWithSecondary(totalPrice).primary}</span>
                  </div>
                </div>
              )}

              {/* Submit Button or Payment Options */}
              {!showPaymentOptions ? (
                <>
                  <Button
                    onClick={handleSubmitReservation}
                    disabled={isSubmitting || !checkIn || !checkOut || nights <= 0 || hasDateConflict}
                    className="w-full bg-gradient-to-r from-gold-start to-gold-end hover:opacity-95 shadow-md border-none text-white"
                  >
                    {isSubmitting ? t('booking.processing') : t('booking.confirm')}
                  </Button>

                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      {t('booking.loginRequired')} <button onClick={() => navigate('/auth')} className="text-primary underline">{t('auth.login')}</button>
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-foreground text-center">
                    {t('booking.choosePayment') || 'Escolha como deseja pagar'}
                  </h4>

                  <PaymentMethodsLogos size="sm" />

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handlePayNow}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-gold-start to-gold-end hover:opacity-95 shadow-md border-none text-white"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {t('booking.payNow') || 'Pagar Agora'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePayLater}
                      disabled={isProcessing}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {t('booking.payLater') || 'Pagar Depois'}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    {t('booking.paymentSecure') || 'Pagamento seguro processado por SISP'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailModal;
