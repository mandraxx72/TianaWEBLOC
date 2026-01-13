import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, CreditCard, Check, Loader2, LogIn, Tag, X, CalendarCheck, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { Badge } from "@/components/ui/badge";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getBookingRooms } from "@/components/rooms/roomsData";
import { usePayment } from "@/hooks/usePayment";
import { PaymentMethodsLogos } from "@/components/ui/PaymentMethodsLogos";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { formatAmount, formatAmountWithSecondary } = useCurrency();
  const navigate = useNavigate();
  const { initiatePayment, openPaymentWindow, isProcessing: isPaymentProcessing } = usePayment();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationNumber, setReservationNumber] = useState("");
  const [reservationId, setReservationId] = useState("");
  const [bookingData, setBookingData] = useState<{
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: number;
    roomType: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests: string;
    promoCode: string;
    billAddrCity: string;
    billAddrLine1: string;
    billAddrPostCode: string;
  }>({
    checkIn: undefined,
    checkOut: undefined,
    guests: 2,
    roomType: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
    promoCode: "",
    billAddrCity: "Mindelo",
    billAddrLine1: "",
    billAddrPostCode: ""
  });

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [appliedPromotion, setAppliedPromotion] = useState<{
    id: string;
    code: string;
    name: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    discountAmount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");

  const rooms = useMemo(() => getBookingRooms(t), [t]);

  const roomTypes = useMemo(() => rooms.map(r => r.id), [rooms]);
  const { availability, loading: availabilityLoading } = useRoomAvailability(roomTypes);

  const getAvailabilityForRoom = (roomId: string) => {
    return availability.find(a => a.roomType === roomId);
  };

  const getAvailabilityColor = (percent: number) => {
    if (percent >= 70) return "text-green-600 bg-green-50 border-green-200";
    if (percent >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  // Pre-fill email when user is authenticated
  useEffect(() => {
    if (user?.email && !bookingData.guestEmail) {
      setBookingData(prev => ({
        ...prev,
        guestEmail: user.email || "",
        guestName: user.user_metadata?.full_name || prev.guestName
      }));
    }
  }, [user]);

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const diffTime = Math.abs(bookingData.checkOut.getTime() - bookingData.checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  const getSubtotal = () => {
    const selectedRoom = rooms.find(room => room.id === bookingData.roomType);
    if (selectedRoom) {
      return selectedRoom.priceValue * calculateNights();
    }
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = getSubtotal();
    if (appliedPromotion) {
      return subtotal - appliedPromotion.discountAmount;
    }
    return subtotal;
  };

  const validatePromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    
    setValidatingPromo(true);
    setPromoError("");
    
    try {
      const { data: promotion, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("code", promoCodeInput.toUpperCase())
        .eq("is_active", true)
        .gte("valid_until", format(new Date(), "yyyy-MM-dd"))
        .lte("valid_from", format(new Date(), "yyyy-MM-dd"))
        .maybeSingle();

      if (error) throw error;

      if (!promotion) {
        setPromoError("Código promocional inválido ou expirado");
        return;
      }

      // Check min nights
      const nights = calculateNights();
      if (promotion.min_nights && nights < promotion.min_nights) {
        setPromoError(`Mínimo de ${promotion.min_nights} noites para esta promoção`);
        return;
      }

      // Check max uses
      if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
        setPromoError("Esta promoção atingiu o limite de utilizações");
        return;
      }

      // Check room type eligibility
      if (promotion.room_types && promotion.room_types.length > 0) {
        if (!promotion.room_types.includes(bookingData.roomType)) {
          setPromoError("Este código não é válido para o quarto selecionado");
          return;
        }
      }

      // Calculate discount
      const subtotal = getSubtotal();
      let discountAmount = 0;
      
      if (promotion.discount_type === "percentage") {
        discountAmount = Math.round(subtotal * (promotion.discount_value / 100));
      } else {
        discountAmount = Math.min(promotion.discount_value, subtotal);
      }

      // Check min total
      if (promotion.min_total && subtotal < promotion.min_total) {
        setPromoError(`Valor mínimo de ${promotion.min_total.toLocaleString()} CVE para esta promoção`);
        return;
      }

      setAppliedPromotion({
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        discountAmount,
      });
      
      toast({
        title: "Código aplicado!",
        description: `Desconto de ${promotion.discount_type === "percentage" ? `${promotion.discount_value}%` : `${promotion.discount_value.toLocaleString()} CVE`}`,
      });
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError("Erro ao validar código promocional");
    } finally {
      setValidatingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromotion(null);
    setPromoCodeInput("");
    setPromoError("");
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const generateReservationNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CT-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const selectedRoom = rooms.find(room => room.id === bookingData.roomType);
    if (!selectedRoom) {
      toast({
        title: t('booking.errorTitle'),
        description: t('booking.errorSelectRoom'),
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const newReservationNumber = generateReservationNumber();
    const nights = calculateNights();
    const totalPrice = calculateTotal();

    try {
      // Save reservation to database with pending payment status
      const { data: insertedReservation, error } = await supabase
        .from('reservations')
        .insert({
          reservation_number: newReservationNumber,
          check_in: format(bookingData.checkIn!, "yyyy-MM-dd"),
          check_out: format(bookingData.checkOut!, "yyyy-MM-dd"),
          guests: bookingData.guests,
          room_type: bookingData.roomType,
          room_name: selectedRoom.name,
          room_price: selectedRoom.priceValue,
          total_price: totalPrice,
          nights: nights,
          guest_name: bookingData.guestName,
          guest_email: bookingData.guestEmail,
          guest_phone: bookingData.guestPhone,
          special_requests: bookingData.specialRequests || null,
          status: 'pending',
          payment_status: 'pending',
          user_id: user?.id,
          promotion_id: appliedPromotion?.id || null,
          promotion_code: appliedPromotion?.code || null,
          discount_amount: appliedPromotion?.discountAmount || 0
        })
        .select('id')
        .single();

      if (error) throw error;

      // Update promotion usage count if applied
      if (appliedPromotion) {
        const { data: currentPromo } = await supabase
          .from('promotions')
          .select('current_uses')
          .eq('id', appliedPromotion.id)
          .single();
        
        if (currentPromo) {
          await supabase
            .from('promotions')
            .update({ current_uses: (currentPromo.current_uses || 0) + 1 })
            .eq('id', appliedPromotion.id);
        }
      }

      setReservationNumber(newReservationNumber);
      setReservationId(insertedReservation.id);
      setStep(4); // Go to payment step
      
      toast({
        title: "Reserva Criada",
        description: "Prossiga para o pagamento para confirmar a sua reserva.",
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: t('booking.reservationError'),
        description: t('booking.reservationErrorMessage'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    const selectedRoom = rooms.find(room => room.id === bookingData.roomType);
    if (!selectedRoom || !reservationId) return;

    // IMPORTANT: Open blank window IMMEDIATELY before any async operation
    // This prevents popup blockers from blocking the payment window
    const paymentWindow = window.open("", "_blank");
    
    if (!paymentWindow) {
      // Popup was blocked
      toast({
        title: "Popup Bloqueado",
        description: "Por favor, permita popups para este site e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    // Show loading state in the new window
    paymentWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>A carregar pagamento...</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .loader { text-align: center; }
            .spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top-color: #333; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
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

    const result = await initiatePayment({
      reservationId,
      amount: calculateTotal(),
      customerEmail: bookingData.guestEmail,
      customerPhone: bookingData.guestPhone,
      customerName: bookingData.guestName,
      billAddrCity: bookingData.billAddrCity,
      billAddrLine1: bookingData.billAddrLine1,
      billAddrPostCode: bookingData.billAddrPostCode
    });

    if (result.success && result.formHtml) {
      // Write the SISP form to the already-opened window
      paymentWindow.document.open();
      paymentWindow.document.write(result.formHtml);
      paymentWindow.document.close();
      
      toast({
        title: "Janela de Pagamento Aberta",
        description: "Complete o pagamento na nova janela. Será redirecionado após a conclusão.",
      });
      handleClose();
    } else {
      // Close the window on error
      paymentWindow.close();
    }
  };

  const handlePayLater = async () => {
    // Send email notification for pending payment
    try {
      await supabase.functions.invoke('send-reservation-email', {
        body: {
          reservationNumber,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          roomName: rooms.find(r => r.id === bookingData.roomType)?.name,
          checkIn: format(bookingData.checkIn!, "yyyy-MM-dd"),
          checkOut: format(bookingData.checkOut!, "yyyy-MM-dd"),
          guests: bookingData.guests,
          nights: calculateNights(),
          totalPrice: calculateTotal(),
          specialRequests: bookingData.specialRequests || undefined,
          paymentPending: true
        }
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    setStep(5); // Confirmation step
    toast({
      title: "Reserva Registada",
      description: "Pode efetuar o pagamento mais tarde através das suas reservas.",
    });
  };

  const resetModal = () => {
    setStep(1);
    setReservationNumber("");
    setReservationId("");
    setAppliedPromotion(null);
    setPromoCodeInput("");
    setPromoError("");
    setBookingData({
      checkIn: undefined,
      checkOut: undefined,
      guests: 2,
      roomType: "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      specialRequests: "",
      promoCode: "",
      billAddrCity: "Mindelo",
      billAddrLine1: "",
      billAddrPostCode: ""
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  const getLocale = () => {
    if (language === 'en') return 'en-US';
    if (language === 'fr') return 'fr-FR';
    return 'pt-BR';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="booking-modal" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="booking-modal-title" className="text-2xl font-playfair text-primary">
            {step === 4 ? t('booking.confirmed') : t('booking.title')}
          </DialogTitle>
        </DialogHeader>

        <>
          {/* Progress Bar */}
            {step <= 4 && (
              <div className="flex items-center justify-center space-x-4 mb-8">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= stepNumber 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div className={`w-12 h-1 mx-1 ${
                        step > stepNumber ? "bg-primary" : "bg-muted"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            )}

        {/* Step 1: Room Selection First */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">{t('booking.step2Title')}</h3>
            
            <div className="space-y-4">
              {rooms.map((room) => {
                const roomAvailability = getAvailabilityForRoom(room.id);
                return (
                  <Card 
                    key={room.id}
                    data-testid={`room-${room.id}`}
                    className={`cursor-pointer transition-all duration-200 ${
                      bookingData.roomType === room.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setBookingData({...bookingData, roomType: room.id})}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{room.name}</h4>
                          <p className="text-muted-foreground text-sm">{room.capacity}</p>
                          {/* Availability indicator with tooltip */}
                          {roomAvailability && !availabilityLoading && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full text-xs font-medium border cursor-help ${getAvailabilityColor(roomAvailability.percentAvailable)}`}>
                                    <CalendarCheck className="h-3 w-3" />
                                    <span>{roomAvailability.availableDays} dias disponíveis</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs">
                                  <div className="space-y-2">
                                    <p className="font-semibold text-sm">Datas ocupadas:</p>
                                    {roomAvailability.occupiedDatesInRange.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                        {roomAvailability.occupiedDatesInRange.slice(0, 10).map((date, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs">
                                            {format(date, "dd/MM", { locale: ptBR })}
                                          </Badge>
                                        ))}
                                        {roomAvailability.occupiedDatesInRange.length > 10 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{roomAvailability.occupiedDatesInRange.length - 10} mais
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">Todas as datas disponíveis!</p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {availabilityLoading && (
                            <div className="mt-2">
                              <div className="h-5 w-28 bg-muted animate-pulse rounded-full" />
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{formatAmountWithSecondary(room.priceValue).primary}</p>
                          <p className="text-xs text-muted-foreground">{formatAmountWithSecondary(room.priceValue).secondary}</p>
                          <p className="text-sm text-muted-foreground">{t('booking.perNight')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button 
                data-testid="next-step-button"
                onClick={handleNext}
                disabled={!bookingData.roomType}
                className="bg-primary hover:bg-primary/90"
              >
                {t('booking.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Dates and Guests - Now with room selected */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">{t('booking.step1Title')}</h3>
            
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mb-4">
              <p className="text-sm text-muted-foreground">{t('booking.selectedRoom') || 'Quarto selecionado'}:</p>
              <p className="font-semibold text-primary">
                {rooms.find(r => r.id === bookingData.roomType)?.name}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-testid="checkin-calendar">
                <AvailabilityCalendar
                  selectedDate={bookingData.checkIn}
                  onSelect={(date) => setBookingData({...bookingData, checkIn: date})}
                  label={t('booking.checkIn')}
                  placeholder={t('booking.selectCheckIn')}
                  roomType={bookingData.roomType}
                />
              </div>
              <div data-testid="checkout-calendar">
                <AvailabilityCalendar
                  selectedDate={bookingData.checkOut}
                  onSelect={(date) => setBookingData({...bookingData, checkOut: date})}
                  label={t('booking.checkOut')}
                  placeholder={t('booking.selectCheckOut')}
                  minDate={bookingData.checkIn ? new Date(bookingData.checkIn.getTime() + 86400000) : new Date()}
                  roomType={bookingData.roomType}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="inline h-4 w-4 mr-2" />
                {t('booking.guests')}
              </label>
              <select 
                className="w-full px-3 py-2 border border-input rounded-md"
                value={bookingData.guests}
                onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? t('booking.person') : t('booking.people')}</option>
                ))}
              </select>
            </div>

            {bookingData.checkIn && bookingData.checkOut && (
              <Card className="bg-accent/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{t('booking.summary')}</h4>
                  <div className="space-y-1 text-sm">
                    <p data-testid="nights-count">{t('booking.period')}: {calculateNights()} {calculateNights() === 1 ? t('booking.night') : t('booking.nights')}</p>
                    <p>{t('booking.guests')}: {bookingData.guests} {bookingData.guests === 1 ? t('booking.person') : t('booking.people')}</p>
                    <p data-testid="subtotal-amount" className="font-semibold text-lg text-primary">{t('booking.total')}: {formatAmount(calculateTotal())}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button data-testid="back-step-button" variant="outline" onClick={handleBack}>
                {t('booking.back')}
              </Button>
              <Button 
                data-testid="next-step-button"
                onClick={handleNext}
                disabled={!bookingData.checkIn || !bookingData.checkOut}
                className="bg-primary hover:bg-primary/90"
              >
                {t('booking.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Guest Information */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">{t('booking.step3Title')}</h3>
            
            {/* Auth Required Banner - only show if not authenticated */}
            {!authLoading && !user && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t('booking.loginToContinue')}</p>
                    <p className="text-sm text-muted-foreground">{t('booking.loginToContinueDescription')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => { handleClose(); navigate("/auth?mode=login"); }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('booking.loginButton')}
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => { handleClose(); navigate("/auth?mode=signup"); }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {t('booking.createAccount')}
                  </Button>
                </div>
              </div>
            )}
            
            <div className={`space-y-4 ${!user ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block text-sm font-medium mb-2">{t('booking.fullName')}</label>
                <Input 
                  data-testid="guest-name-input"
                  type="text" 
                  placeholder={t('booking.fullNamePlaceholder')}
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                  disabled={!user}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('booking.email')}</label>
                <Input 
                  data-testid="guest-email-input"
                  type="email" 
                  placeholder={t('booking.emailPlaceholder')}
                  value={bookingData.guestEmail}
                  onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
                  disabled={!user}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('booking.phone')}</label>
                <Input 
                  data-testid="guest-phone-input"
                  type="tel" 
                  placeholder={t('booking.phonePlaceholder')}
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
                  disabled={!user}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('booking.specialRequests')}</label>
                <textarea 
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                  placeholder={t('booking.specialRequestsPlaceholder')}
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                  disabled={!user}
                />
              </div>

              {/* Billing Address - Optional for better 3DS validation */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3 text-muted-foreground">
                  Morada de Facturação (opcional - melhora aprovação do pagamento)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Morada</label>
                    <Input 
                      type="text" 
                      placeholder="Ex: Rua da Praia, 123"
                      value={bookingData.billAddrLine1}
                      onChange={(e) => setBookingData({...bookingData, billAddrLine1: e.target.value})}
                      disabled={!user}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cidade</label>
                    <Input 
                      type="text" 
                      placeholder="Mindelo"
                      value={bookingData.billAddrCity}
                      onChange={(e) => setBookingData({...bookingData, billAddrCity: e.target.value})}
                      disabled={!user}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Código Postal</label>
                    <Input 
                      type="text" 
                      placeholder="0000"
                      value={bookingData.billAddrPostCode}
                      onChange={(e) => setBookingData({...bookingData, billAddrPostCode: e.target.value})}
                      disabled={!user}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Tag className="inline h-4 w-4 mr-2" />
                  Código Promocional (opcional)
                </label>
                {appliedPromotion ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <Badge variant="default" className="bg-green-600">
                      {appliedPromotion.code}
                    </Badge>
                    <span className="flex-1 text-sm text-green-700">
                      {appliedPromotion.discount_type === "percentage" 
                        ? `-${appliedPromotion.discount_value}%` 
                        : `-${appliedPromotion.discount_value.toLocaleString()} CVE`}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={removePromoCode}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ex: VERAO2024"
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoError("");
                      }}
                      className="flex-1 uppercase"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={validatePromoCode}
                      disabled={!promoCodeInput.trim() || validatingPromo}
                    >
                      {validatingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Aplicar"
                      )}
                    </Button>
                  </div>
                )}
                {promoError && (
                  <p className="text-sm text-destructive mt-1">{promoError}</p>
                )}
              </div>
            </div>

            {/* Final Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">{t('booking.finalSummary')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('booking.room')}:</span>
                    <span>{rooms.find(r => r.id === bookingData.roomType)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('booking.checkIn')}:</span>
                    <span>{bookingData.checkIn?.toLocaleDateString(getLocale())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('booking.checkOut')}:</span>
                    <span>{bookingData.checkOut?.toLocaleDateString(getLocale())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('booking.guests')}:</span>
                    <span>{bookingData.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatAmount(getSubtotal())}</span>
                  </div>
                  {appliedPromotion && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({appliedPromotion.code}):</span>
                      <span>-{formatAmount(appliedPromotion.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg text-primary pt-2 border-t">
                    <span>{t('booking.total')}:</span>
                    <div className="text-right">
                      <div>{formatAmountWithSecondary(calculateTotal()).primary}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {formatAmountWithSecondary(calculateTotal()).secondary}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                {t('booking.back')}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('booking.processing')}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t('booking.confirm')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pagamento</h3>
              <p className="text-muted-foreground text-sm">
                A sua reserva foi registada. Escolha como pretende pagar.
              </p>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reserva:</span>
                    <span className="font-mono font-semibold">{reservationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quarto:</span>
                    <span>{rooms.find(r => r.id === bookingData.roomType)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Datas:</span>
                    <span>{bookingData.checkIn?.toLocaleDateString(getLocale())} - {bookingData.checkOut?.toLocaleDateString(getLocale())}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg text-primary pt-2 border-t">
                    <span>Total a Pagar:</span>
                    <div className="text-right">
                      <div>{formatAmountWithSecondary(calculateTotal()).primary}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {formatAmountWithSecondary(calculateTotal()).secondary}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handlePayment}
                disabled={isPaymentProcessing}
                className="bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pagar Agora com Cartão
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handlePayLater}
                disabled={isPaymentProcessing}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Pagar Mais Tarde
              </Button>
            </div>

            <PaymentMethodsLogos size="sm" className="mt-2" />
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-green-600 mb-2">{t('booking.confirmationTitle')}</h3>
              <p className="text-muted-foreground">
                {t('booking.confirmationMessage')}
              </p>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{t('booking.reservationNumber')}: {reservationNumber}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('booking.keepNumber')}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• {t('booking.confirmationSentTo')}: {bookingData.guestEmail}</p>
              <p>• {t('booking.checkIn')}: {bookingData.checkIn?.toLocaleDateString(getLocale())} {t('booking.checkInAfter')}</p>
              <p>• {t('booking.checkOut')}: {bookingData.checkOut?.toLocaleDateString(getLocale())} {t('booking.checkOutBefore')}</p>
            </div>

            <Button onClick={() => navigate('/minhas-reservas')} className="mt-4">
              Ver Minhas Reservas
            </Button>
          </div>
        )}
        </>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
