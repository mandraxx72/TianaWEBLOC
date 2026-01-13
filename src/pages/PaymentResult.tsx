import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Home, FileText, RefreshCw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PaymentMethodsLogos } from "@/components/ui/PaymentMethodsLogos";

interface ReservationDetails {
  reservation_number: string;
  room_name: string;
  check_in: string;
  check_out: string;
  total_price: number;
  payment_status: string;
}

const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLING_TIME = 120000; // 2 minutes

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { formatAmountWithSecondary } = useCurrency();
  const status = searchParams.get("status");
  const paymentRef = searchParams.get("ref");
  const reservationId = searchParams.get("reservation");
  
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPolling, setIsPolling] = useState(false);
  const [pollStartTime, setPollStartTime] = useState<number | null>(null);

  const fetchReservation = useCallback(async () => {
    let data: ReservationDetails | null = null;
    
    if (reservationId) {
      // Clean the reservationId - remove any query parameters that might have been appended
      const cleanReservationId = reservationId.split('?')[0];
      
      const { data: resData, error } = await supabase
        .from("reservations")
        .select("reservation_number, room_name, check_in, check_out, total_price, payment_status")
        .eq("id", cleanReservationId)
        .maybeSingle();
      
      if (!error && resData) {
        data = resData;
      }
    } else if (paymentRef) {
      const { data: resData, error } = await supabase
        .from("reservations")
        .select("reservation_number, room_name, check_in, check_out, total_price, payment_status")
        .eq("payment_reference", paymentRef)
        .maybeSingle();
      
      if (!error && resData) {
        data = resData;
      }
    }
    
    return data;
  }, [reservationId, paymentRef]);

  // Initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      const data = await fetchReservation();
      if (data) {
        setReservation(data);
        // Update status based on actual payment_status from DB
        if (data.payment_status === 'paid') {
          setCurrentStatus('success');
        } else if (data.payment_status === 'failed') {
          setCurrentStatus('failed');
        }
      }
      setLoading(false);
      
      // Start polling if status is processing
      if (status === 'processing') {
        setIsPolling(true);
        setPollStartTime(Date.now());
      }
    };

    initialFetch();
  }, [fetchReservation, status]);

  // Polling effect for processing status
  useEffect(() => {
    if (!isPolling || !pollStartTime) return;
    
    const pollInterval = setInterval(async () => {
      // Check if we've exceeded max polling time
      if (Date.now() - pollStartTime > MAX_POLLING_TIME) {
        setIsPolling(false);
        console.log("[PaymentResult] Polling timeout - stopping after 2 minutes");
        return;
      }
      
      const data = await fetchReservation();
      if (data) {
        setReservation(data);
        
        // Check if payment status has been updated
        if (data.payment_status === 'paid') {
          setCurrentStatus('success');
          setIsPolling(false);
          console.log("[PaymentResult] Payment confirmed via polling");
        } else if (data.payment_status === 'failed') {
          setCurrentStatus('failed');
          setIsPolling(false);
          console.log("[PaymentResult] Payment failed via polling");
        }
      }
    }, POLLING_INTERVAL);
    
    return () => clearInterval(pollInterval);
  }, [isPolling, pollStartTime, fetchReservation]);

  const handleManualRefresh = async () => {
    setLoading(true);
    const data = await fetchReservation();
    if (data) {
      setReservation(data);
      if (data.payment_status === 'paid') {
        setCurrentStatus('success');
      } else if (data.payment_status === 'failed') {
        setCurrentStatus('failed');
      }
    }
    setLoading(false);
  };

  const getStatusConfig = () => {
    switch (currentStatus) {
      case "success":
      case "paid":
        return {
          icon: CheckCircle2,
          iconColor: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: language === "en" ? "Payment Successful!" : language === "fr" ? "Paiement Réussi !" : "Pagamento Confirmado!",
          message: language === "en" 
            ? "Your reservation has been confirmed. A confirmation email has been sent."
            : language === "fr"
            ? "Votre réservation a été confirmée. Un email de confirmation a été envoyé."
            : "A sua reserva foi confirmada. Um email de confirmação foi enviado.",
        };
      case "declined":
      case "failed":
        return {
          icon: XCircle,
          iconColor: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: language === "en" ? "Payment Declined" : language === "fr" ? "Paiement Refusé" : "Pagamento Recusado",
          message: language === "en"
            ? "Your payment was not processed. Please try again or use a different payment method."
            : language === "fr"
            ? "Votre paiement n'a pas été traité. Veuillez réessayer ou utiliser un autre mode de paiement."
            : "O seu pagamento não foi processado. Por favor, tente novamente ou use outro método de pagamento.",
        };
      case "cancelled":
        return {
          icon: AlertCircle,
          iconColor: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          title: language === "en" ? "Payment Cancelled" : language === "fr" ? "Paiement Annulé" : "Pagamento Cancelado",
          message: language === "en"
            ? "You cancelled the payment. Your reservation is pending payment."
            : language === "fr"
            ? "Vous avez annulé le paiement. Votre réservation est en attente de paiement."
            : "Você cancelou o pagamento. A sua reserva está pendente de pagamento.",
        };
      case "processing":
        return {
          icon: Loader2,
          iconColor: "text-primary animate-spin",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: language === "en" ? "Processing Payment..." : language === "fr" ? "Traitement du Paiement..." : "A Processar Pagamento...",
          message: language === "en"
            ? "Please wait while we confirm your payment. This page will update automatically."
            : language === "fr"
            ? "Veuillez patienter pendant que nous confirmons votre paiement. Cette page se mettra à jour automatiquement."
            : "Por favor aguarde enquanto confirmamos o seu pagamento. Esta página atualiza automaticamente.",
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-border",
          title: language === "en" ? "Checking Status..." : language === "fr" ? "Vérification du Statut..." : "A Verificar Estado...",
          message: language === "en"
            ? "We are checking your payment status."
            : language === "fr"
            ? "Nous vérifions le statut de votre paiement."
            : "Estamos a verificar o estado do seu pagamento.",
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  if (loading && !reservation) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-24 px-4">
        <div className="max-w-lg mx-auto">
          <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
            <CardHeader className="text-center pb-2">
              <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <StatusIcon className={`h-12 w-12 ${config.iconColor}`} />
              </div>
              <CardTitle className="text-2xl font-display">{config.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">
                {config.message}
              </p>

              {/* Show polling indicator when processing */}
              {currentStatus === "processing" && isPolling && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>
                    {language === "en" ? "Checking payment status..." : language === "fr" ? "Vérification du statut..." : "A verificar estado..."}
                  </span>
                </div>
              )}

              {reservation && (
                <div className="bg-background/80 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">
                    {language === "en" ? "Reservation Details" : language === "fr" ? "Détails de la Réservation" : "Detalhes da Reserva"}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === "en" ? "Number" : language === "fr" ? "Numéro" : "Número"}:
                      </span>
                      <span className="font-mono font-semibold">{reservation.reservation_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === "en" ? "Room" : language === "fr" ? "Chambre" : "Quarto"}:
                      </span>
                      <span>{reservation.room_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span>{new Date(reservation.check_in).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span>{new Date(reservation.check_out).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === "en" ? "Status" : language === "fr" ? "Statut" : "Estado"}:
                      </span>
                      <span className={`font-medium ${
                        reservation.payment_status === 'paid' ? 'text-green-600' : 
                        reservation.payment_status === 'failed' ? 'text-red-600' : 
                        'text-amber-600'
                      }`}>
                        {reservation.payment_status === 'paid' 
                          ? (language === "en" ? "Paid" : language === "fr" ? "Payé" : "Pago")
                          : reservation.payment_status === 'failed'
                          ? (language === "en" ? "Failed" : language === "fr" ? "Échoué" : "Falhado")
                          : (language === "en" ? "Pending" : language === "fr" ? "En attente" : "Pendente")
                        }
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total:</span>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {formatAmountWithSecondary(reservation.total_price).primary}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatAmountWithSecondary(reservation.total_price).secondary}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentRef && (
                <p className="text-xs text-center text-muted-foreground">
                  {language === "en" ? "Reference" : language === "fr" ? "Référence" : "Referência"}: {paymentRef}
                </p>
              )}

              <PaymentMethodsLogos size="sm" className="py-2" />

              <div className="flex flex-col gap-3 pt-4">
                {/* Show manual refresh button when processing */}
                {currentStatus === "processing" && (
                  <Button 
                    variant="outline" 
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="w-full"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {language === "en" ? "Refresh Status" : language === "fr" ? "Actualiser le Statut" : "Atualizar Estado"}
                  </Button>
                )}
                <Button asChild className="w-full">
                  <Link to="/minhas-reservas">
                    <FileText className="mr-2 h-4 w-4" />
                    {language === "en" ? "View My Reservations" : language === "fr" ? "Voir Mes Réservations" : "Ver Minhas Reservas"}
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    {language === "en" ? "Back to Home" : language === "fr" ? "Retour à l'Accueil" : "Voltar ao Início"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;