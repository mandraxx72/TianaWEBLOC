import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { pt, enUS, fr } from "date-fns/locale";
import { Calendar, Users, MapPin, Trash2, Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import EditReservationModal from "@/components/reservations/EditReservationModal";
import SEOHead from "@/components/seo/SEOHead";
import { useSEO } from "@/hooks/useSEO";

interface Reservation {
  id: string;
  reservation_number: string;
  check_in: string;
  check_out: string;
  guests: number;
  room_name: string;
  room_type: string;
  room_price: number;
  total_price: number;
  nights: number;
  status: string;
  payment_status: string | null;
  special_requests: string | null;
  created_at: string;
}

const MyReservations = () => {
  const { user, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const { formatAmountWithSecondary } = useCurrency();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { initiatePayment, isProcessing } = usePayment();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [payingReservationId, setPayingReservationId] = useState<string | null>(null);

  const dateLocale = language === 'fr' ? fr : language === 'en' ? enUS : pt;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  // Handle payment link from email (?pay=reservationId)
  useEffect(() => {
    const payReservationId = searchParams.get('pay');
    if (payReservationId && reservations.length > 0 && !payingReservationId) {
      const reservation = reservations.find(r => r.id === payReservationId);
      if (reservation && reservation.payment_status === 'pending') {
        handlePayFromEmail(reservation);
      }
      // Clear the query param to prevent re-triggering
      setSearchParams({});
    }
  }, [searchParams, reservations, payingReservationId]);

  const handlePayFromEmail = async (reservation: Reservation) => {
    setPayingReservationId(reservation.id);

    // Fetch full guest details
    const { data: fullReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservation.id)
      .single();

    if (fetchError || !fullReservation) {
      console.error('Error fetching reservation for payment:', fetchError);
      toast.error('Erro ao carregar dados da reserva');
      setPayingReservationId(null);
      return;
    }

    // Open payment window IMMEDIATELY to avoid popup blocker
    const paymentWindow = window.open("", "_blank");
    if (!paymentWindow) {
      toast.error("Por favor, permita popups para continuar com o pagamento.");
      setPayingReservationId(null);
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
      reservationId: reservation.id,
      amount: fullReservation.total_price,
      customerEmail: fullReservation.guest_email,
      customerPhone: fullReservation.guest_phone,
      customerName: fullReservation.guest_name,
      billAddrCity: "Mindelo",
      billAddrLine1: "",
      billAddrPostCode: ""
    });

    if (result.success && result.formHtml) {
      paymentWindow.document.open();
      paymentWindow.document.write(result.formHtml);
      paymentWindow.document.close();
      toast.success("Janela de pagamento aberta. Complete o pagamento para confirmar a reserva.");
    } else {
      paymentWindow.close();
    }

    setPayingReservationId(null);
  };

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("check_in", { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error(t('reservations.error') || "Error loading reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setReservations(prev => prev.filter(r => r.id !== id));
      toast.success(t('reservations.cancelled') || "Reservation cancelled");
    } catch (error) {
      console.error("Error canceling reservation:", error);
      toast.error(t('reservations.cancelError') || "Error cancelling reservation");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      confirmed: { label: t('reservations.status.confirmed'), variant: "default" },
      pending: { label: t('reservations.status.pending'), variant: "secondary" },
      cancelled: { label: t('reservations.status.cancelled'), variant: "destructive" },
    };
    const { label, variant } = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPaymentBadge = (paymentStatus: string | null) => {
    if (!paymentStatus) return null;
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: "Pago", className: "bg-green-100 text-green-700 border-green-200" },
      pending: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200" },
      processing: { label: "Processando", className: "bg-blue-100 text-blue-700 border-blue-200" },
      failed: { label: "Falhou", className: "bg-red-100 text-red-700 border-red-200" },
    };
    const config = statusMap[paymentStatus] || { label: paymentStatus, className: "" };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const { getPageSEO } = useSEO();
  const seo = getPageSEO('reservations');

  if (authLoading || loading) {
    return (
      <>
        <SEOHead title={seo.title} description={seo.description} keywords={seo.keywords} noindex />
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        noindex
      />
      <Layout>
        <div className="min-h-screen bg-background py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-display font-bold text-foreground mb-8">
              {t('reservations.title')}
            </h1>

            {reservations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    {t('reservations.empty')}
                  </p>
                  <Button onClick={() => navigate("/#quartos")}>
                    {t('reservations.viewRooms')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <Card key={reservation.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">
                          {reservation.room_name}
                        </CardTitle>
                        <div className="flex gap-2">
                          {getPaymentBadge(reservation.payment_status)}
                          {getStatusBadge(reservation.status)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('reservations.number')} #{reservation.reservation_number}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>
                            {format(new Date(reservation.check_in), "dd MMM", { locale: dateLocale })} -{" "}
                            {format(new Date(reservation.check_out), "dd MMM yyyy", { locale: dateLocale })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{reservation.guests} {t('reservations.guests')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{reservation.nights} {t('booking.nights')}</span>
                        </div>
                      </div>

                      {reservation.special_requests && (
                        <p className="text-sm text-muted-foreground mb-4">
                          <strong>{t('booking.specialRequests')}:</strong> {reservation.special_requests}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-sm text-muted-foreground">{t('reservations.total')}:</span>
                          <span className="ml-2 text-lg font-semibold text-primary">
                            {formatAmountWithSecondary(reservation.total_price).primary}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({formatAmountWithSecondary(reservation.total_price).secondary})
                          </span>
                        </div>

                        {reservation.status === "confirmed" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingReservation(reservation)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              {t('reservations.edit')}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingId === reservation.id}
                                >
                                  {deletingId === reservation.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t('reservations.cancel')}
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('reservations.cancel')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === 'en' ? 'Are you sure you want to cancel this reservation? This action cannot be undone.' :
                                      language === 'fr' ? 'Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.' :
                                        'Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === 'en' ? 'Back' : language === 'fr' ? 'Retour' : 'Voltar'}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelReservation(reservation.id)}
                                  >
                                    {language === 'en' ? 'Confirm Cancellation' : language === 'fr' ? 'Confirmer l\'Annulation' : 'Confirmar Cancelamento'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <EditReservationModal
          reservation={editingReservation}
          open={!!editingReservation}
          onOpenChange={(open) => !open && setEditingReservation(null)}
          onSuccess={fetchReservations}
        />
      </Layout>
    </>
  );
};

export default MyReservations;
