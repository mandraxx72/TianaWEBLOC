import { useState, useMemo, useEffect } from "react";
import { format, addDays } from "date-fns";
import { pt } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, User, Mail, Phone, Users, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ROOM_IDS, getBookingRooms } from "@/components/rooms/roomsData";

interface AdminCreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefillRoomId?: string;
  prefillDate?: Date;
}

// Room names mapping
const ROOM_NAMES: Record<string, string> = {
  [ROOM_IDS.DUNAS]: "Dunas",
  [ROOM_IDS.BAIA_TRANQUILA]: "Baía Tranquila",
  [ROOM_IDS.TERRACO_SOL]: "Terraço Sol",
  [ROOM_IDS.MORABEZA]: "Morabeza",
};

// Simple translation function for room data
const t = (key: string) => {
  const translations: Record<string, string> = {
    'rooms.1.name': 'Quarto Dunas',
    'rooms.2.name': 'Suite Baía Tranquila',
    'rooms.3.name': 'Quarto Terraço Sol',
    'rooms.4.name': 'Quarto Morabeza',
    'rooms.capacity.people': 'pessoas',
  };
  return translations[key] || key;
};

export function AdminCreateReservationModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  prefillRoomId,
  prefillDate 
}: AdminCreateReservationModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const rooms = useMemo(() => getBookingRooms(t), []);
  
  const [formData, setFormData] = useState({
    roomType: prefillRoomId || "",
    checkIn: prefillDate || undefined as Date | undefined,
    checkOut: prefillDate ? addDays(prefillDate, 1) : undefined as Date | undefined,
    guests: 2,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  });

  // Reset form when modal opens with new prefill data
  useEffect(() => {
    if (isOpen) {
      setFormData({
        roomType: prefillRoomId || "",
        checkIn: prefillDate || undefined,
        checkOut: prefillDate ? addDays(prefillDate, 1) : undefined,
        guests: 2,
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        specialRequests: "",
      });
    }
  }, [isOpen, prefillRoomId, prefillDate]);

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const diffTime = Math.abs(formData.checkOut.getTime() - formData.checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const selectedRoom = rooms.find(room => room.id === formData.roomType);
    if (selectedRoom) {
      return selectedRoom.priceValue * calculateNights();
    }
    return 0;
  };

  const generateReservationNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CT-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomType || !formData.checkIn || !formData.checkOut || 
        !formData.guestName || !formData.guestEmail) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const selectedRoom = rooms.find(room => room.id === formData.roomType);
    if (!selectedRoom) {
      toast({
        title: "Erro",
        description: "Quarto inválido selecionado.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const nights = calculateNights();
    const totalPrice = calculateTotal();
    const reservationNumber = generateReservationNumber();

    try {
      const { error } = await supabase
        .from('reservations')
        .insert({
          reservation_number: reservationNumber,
          check_in: format(formData.checkIn, "yyyy-MM-dd"),
          check_out: format(formData.checkOut, "yyyy-MM-dd"),
          guests: formData.guests,
          room_type: formData.roomType,
          room_name: selectedRoom.name,
          room_price: selectedRoom.priceValue,
          total_price: totalPrice,
          nights: nights,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          special_requests: formData.specialRequests || null,
          status: 'confirmed',
          payment_status: 'pending',
          payment_method: 'admin_created',
        });

      if (error) throw error;

      toast({
        title: "Reserva criada",
        description: `Reserva ${reservationNumber} criada com sucesso.`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a reserva.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoom = rooms.find(room => room.id === formData.roomType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            Nova Reserva
          </DialogTitle>
          <DialogDescription>
            Criar uma nova reserva manualmente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="roomType">Quarto *</Label>
            <Select
              value={formData.roomType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, roomType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar quarto" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ROOM_IDS).map(roomId => (
                  <SelectItem key={roomId} value={roomId}>
                    {ROOM_NAMES[roomId]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkIn ? (
                      format(formData.checkIn, "dd/MM/yyyy", { locale: pt })
                    ) : (
                      "Selecionar"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.checkIn}
                    onSelect={(date) => {
                      setFormData(prev => ({
                        ...prev,
                        checkIn: date,
                        checkOut: date && (!prev.checkOut || prev.checkOut <= date) 
                          ? addDays(date, 1) 
                          : prev.checkOut,
                      }));
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-out *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkOut ? (
                      format(formData.checkOut, "dd/MM/yyyy", { locale: pt })
                    ) : (
                      "Selecionar"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.checkOut}
                    onSelect={(date) => setFormData(prev => ({ ...prev, checkOut: date }))}
                    disabled={(date) => 
                      !formData.checkIn || date <= formData.checkIn
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Hóspedes
            </Label>
            <Select
              value={formData.guests.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, guests: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "hóspede" : "hóspedes"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guest Info */}
          <div className="space-y-4 pt-2 border-t">
            <h4 className="font-medium text-sm text-muted-foreground">Dados do Hóspede</h4>
            
            <div className="space-y-2">
              <Label htmlFor="guestName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                placeholder="Nome do hóspede"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="guestEmail"
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="guestPhone"
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                placeholder="+238 000 0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Pedidos Especiais</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Observações ou pedidos especiais..."
                rows={3}
              />
            </div>
          </div>

          {/* Summary */}
          {selectedRoom && formData.checkIn && formData.checkOut && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Resumo</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quarto:</span>
                  <span>{ROOM_NAMES[formData.roomType]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Noites:</span>
                  <span>{calculateNights()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preço/noite:</span>
                  <span>{selectedRoom.priceValue.toLocaleString()} CVE</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t">
                  <span>Total:</span>
                  <span>{calculateTotal().toLocaleString()} CVE</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A criar...
                </>
              ) : (
                "Criar Reserva"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
