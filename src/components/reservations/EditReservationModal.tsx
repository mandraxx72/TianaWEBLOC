import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  special_requests: string | null;
  promotion_code?: string | null;
  discount_amount?: number | null;
}

interface EditReservationModalProps {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const editSchema = z.object({
  check_in: z.date({ required_error: "Data de check-in é obrigatória" }),
  check_out: z.date({ required_error: "Data de check-out é obrigatória" }),
  guests: z.number().min(1, "Mínimo 1 hóspede").max(10, "Máximo 10 hóspedes"),
  special_requests: z.string().max(500, "Máximo 500 caracteres").optional(),
}).refine(data => data.check_out > data.check_in, {
  message: "Check-out deve ser após check-in",
  path: ["check_out"],
});

type EditFormData = z.infer<typeof editSchema>;

const EditReservationModal = ({
  reservation,
  open,
  onOpenChange,
  onSuccess,
}: EditReservationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      check_in: reservation ? new Date(reservation.check_in) : new Date(),
      check_out: reservation ? new Date(reservation.check_out) : new Date(),
      guests: reservation?.guests || 1,
      special_requests: reservation?.special_requests || "",
    },
  });

  // Reset form when reservation changes
  if (reservation && form.getValues("guests") !== reservation.guests) {
    form.reset({
      check_in: new Date(reservation.check_in),
      check_out: new Date(reservation.check_out),
      guests: reservation.guests,
      special_requests: reservation.special_requests || "",
    });
  }

  const watchCheckIn = form.watch("check_in");
  const watchCheckOut = form.watch("check_out");

  const calculateNights = () => {
    if (watchCheckIn && watchCheckOut) {
      return Math.max(0, differenceInDays(watchCheckOut, watchCheckIn));
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * (reservation?.room_price || 0);
  };

  const onSubmit = async (data: EditFormData) => {
    if (!reservation) return;
    
    setIsSubmitting(true);
    try {
      const nights = differenceInDays(data.check_out, data.check_in);
      const totalPrice = nights * reservation.room_price;

      const { error } = await supabase
        .from("reservations")
        .update({
          check_in: format(data.check_in, "yyyy-MM-dd"),
          check_out: format(data.check_out, "yyyy-MM-dd"),
          guests: data.guests,
          nights,
          total_price: totalPrice,
          special_requests: data.special_requests || null,
        })
        .eq("id", reservation.id);

      if (error) throw error;

      toast.success("Reserva atualizada com sucesso");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error("Erro ao atualizar reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Reserva</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {reservation.room_name} • Reserva #{reservation.reservation_number}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="check_in"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-in</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: pt })
                            ) : (
                              <span>Selecionar</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="check_out"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: pt })
                            ) : (
                              <span>Selecionar</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date <= watchCheckIn}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Hóspedes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="special_requests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedidos Especiais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Algum pedido especial?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Noites</span>
                <span>{calculateNights()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Preço por noite</span>
                <span>€{reservation.room_price}</span>
              </div>
              {reservation.promotion_code && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto ({reservation.promotion_code})</span>
                  <span>-€{reservation.discount_amount || 0}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Novo Total</span>
                <span className="text-primary">€{calculateTotal() - (reservation.discount_amount || 0)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReservationModal;
