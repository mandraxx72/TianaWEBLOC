import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Plus, Eye, RefreshCw } from "lucide-react";
import { ROOM_IDS } from "@/components/rooms/roomsData";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
  isSameDay,
  startOfToday,
  isBefore
} from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Reservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  room_type: string;
  room_name: string;
  check_in: string;
  check_out: string;
  status: string;
  nights?: number;
  total_price?: number;
  special_requests?: string;
}

interface ExternalBlockedDate {
  id: string;
  room_type: string;
  start_date: string;
  end_date: string;
  source: string;
  external_id: string | null;
}

interface RoomOccupancyCalendarProps {
  reservations: Reservation[];
  onCreateReservation?: (roomId: string, date: Date) => void;
}

// Room names mapping
const ROOM_NAMES: Record<string, string> = {
  [ROOM_IDS.DUNAS]: "Dunas",
  [ROOM_IDS.BAIA_TRANQUILA]: "Baía Tranquila",
  [ROOM_IDS.TERRACO_SOL]: "Terraço Sol",
  [ROOM_IDS.MORABEZA]: "Morabeza",
};

const ROOM_SHORT_NAMES: Record<string, string> = {
  [ROOM_IDS.DUNAS]: "DUN",
  [ROOM_IDS.BAIA_TRANQUILA]: "BTQ",
  [ROOM_IDS.TERRACO_SOL]: "TSL",
  [ROOM_IDS.MORABEZA]: "MRB",
};

type DayStatus = "available" | "occupied" | "checkout" | "checkin" | "external";

interface ExternalBlockInfo {
  source: string;
  startDate: string;
  endDate: string;
}

interface SelectedCell {
  roomId: string;
  date: Date;
  status: DayStatus;
  reservation?: Reservation;
  externalBlock?: ExternalBlockInfo;
}

export function RoomOccupancyCalendar({ reservations, onCreateReservation }: RoomOccupancyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfToday());
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [externalBlockedDates, setExternalBlockedDates] = useState<ExternalBlockedDate[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const rooms = Object.values(ROOM_IDS);
  const today = startOfToday();

  // Fetch external blocked dates
  useEffect(() => {
    fetchExternalBlockedDates();
  }, [currentMonth]);

  const fetchExternalBlockedDates = async () => {
    const todayStr = format(startOfToday(), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('external_blocked_dates')
      .select('*')
      .gte('end_date', todayStr); // Only get events that end today or later

    if (!error && data) {
      setExternalBlockedDates(data);
    }
  };

  // Sync external calendars
  const handleSyncCalendars = async () => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('sync-external-calendars');
      if (!error) {
        await fetchExternalBlockedDates();
      }
    } catch (e) {
      console.error('Error syncing calendars:', e);
    }
    setIsSyncing(false);
  };

  // Get all days in current month
  const monthDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  // Calculate status for each room on each day
  const roomDayStatuses = useMemo(() => {
    const statuses: Record<string, Record<string, { status: DayStatus; reservation?: Reservation; externalBlock?: ExternalBlockInfo }>> = {};

    rooms.forEach(roomId => {
      statuses[roomId] = {};

      monthDays.forEach(day => {
        const dayKey = format(day, "yyyy-MM-dd");

        // Find reservations for this room that include this day
        const matchingReservation = reservations.find(r => {
          if (r.room_type !== roomId) return false;
          if (r.status !== "confirmed" && r.status !== "pending") return false;

          const checkIn = parseISO(r.check_in);
          const checkOut = parseISO(r.check_out);

          return isWithinInterval(day, { start: checkIn, end: checkOut }) ||
            isSameDay(day, checkIn) ||
            isSameDay(day, checkOut);
        });

        if (matchingReservation) {
          const checkIn = parseISO(matchingReservation.check_in);
          const checkOut = parseISO(matchingReservation.check_out);

          if (isSameDay(day, checkIn)) {
            statuses[roomId][dayKey] = { status: "checkin", reservation: matchingReservation };
          } else if (isSameDay(day, checkOut)) {
            statuses[roomId][dayKey] = { status: "checkout", reservation: matchingReservation };
          } else {
            statuses[roomId][dayKey] = { status: "occupied", reservation: matchingReservation };
          }
        } else {
          // Check for external blocked dates (Booking.com, etc.)
          // Note: In iCal format, DTEND is exclusive (event ends BEFORE that date)
          // So we should NOT block the end_date day
          // Also: Don't show past dates as externally blocked
          const isPastDate = isBefore(day, today);

          const externalBlock = !isPastDate ? externalBlockedDates.find(ebd => {
            if (ebd.room_type !== roomId) return false;
            const startDate = parseISO(ebd.start_date);
            const endDate = parseISO(ebd.end_date);
            // Block from start_date up to (but NOT including) end_date
            return isSameDay(day, startDate) ||
              (isWithinInterval(day, { start: startDate, end: endDate }) && !isSameDay(day, endDate));
          }) : null;

          if (externalBlock) {
            statuses[roomId][dayKey] = {
              status: "external",
              externalBlock: {
                source: externalBlock.source,
                startDate: externalBlock.start_date,
                endDate: externalBlock.end_date
              }
            };
          } else {
            statuses[roomId][dayKey] = { status: "available" };
          }
        }
      });
    });

    return statuses;
  }, [rooms, monthDays, reservations, externalBlockedDates]);

  const getStatusColor = (status: DayStatus, isToday: boolean) => {
    const baseClasses = isToday ? "ring-2 ring-primary ring-offset-1" : "";

    switch (status) {
      case "occupied":
        return cn("bg-red-500/80 text-white", baseClasses);
      case "checkin":
        return cn("bg-amber-500/80 text-white", baseClasses);
      case "checkout":
        return cn("bg-blue-500/80 text-white", baseClasses);
      case "external":
        return cn("bg-purple-500/80 text-white", baseClasses);
      case "available":
      default:
        return cn("bg-green-500/20 text-green-700 dark:text-green-400", baseClasses);
    }
  };

  const getStatusLabel = (status: DayStatus) => {
    switch (status) {
      case "occupied": return "Ocupado";
      case "checkin": return "Check-in";
      case "checkout": return "Check-out";
      case "external": return "Booking Externo";
      case "available": return "Disponível";
    }
  };

  const handleCellClick = (roomId: string, day: Date, status: DayStatus, reservation?: Reservation, externalBlock?: ExternalBlockInfo) => {
    setSelectedCell({ roomId, date: day, status, reservation, externalBlock });
  };

  const handleCreateReservation = () => {
    if (selectedCell && onCreateReservation) {
      onCreateReservation(selectedCell.roomId, selectedCell.date);
      setSelectedCell(null);
    }
  };

  const isPastDate = (date: Date) => isBefore(date, today);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário de Ocupação
              </CardTitle>
              <CardDescription>
                Clique numa célula para ver detalhes ou criar reserva
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncCalendars}
                disabled={isSyncing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
                {isSyncing ? "A sincronizar..." : "Sincronizar iCal"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center font-medium capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: pt })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/40" />
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/80" />
              <span>Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/80" />
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/80" />
              <span>Check-out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500/80" />
              <span>Booking Externo</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <TooltipProvider delayDuration={100}>
              <div className="min-w-[800px]">
                {/* Header with days */}
                <div className="grid gap-px" style={{ gridTemplateColumns: `100px repeat(${monthDays.length}, minmax(28px, 1fr))` }}>
                  <div className="p-2 font-medium text-sm bg-muted rounded-tl-lg">Quarto</div>
                  {monthDays.map((day, idx) => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "p-1 text-center text-xs font-medium bg-muted",
                        idx === monthDays.length - 1 && "rounded-tr-lg",
                        isSameDay(day, today) && "bg-primary text-primary-foreground"
                      )}
                    >
                      <div>{format(day, "EEE", { locale: pt }).slice(0, 3)}</div>
                      <div className="font-bold">{format(day, "d")}</div>
                    </div>
                  ))}

                  {/* Room rows */}
                  {rooms.map((roomId, roomIdx) => (
                    <>
                      <div
                        key={`label-${roomId}`}
                        className={cn(
                          "p-2 font-medium text-sm bg-muted/50 flex items-center",
                          roomIdx === rooms.length - 1 && "rounded-bl-lg"
                        )}
                      >
                        <span className="hidden md:inline">{ROOM_NAMES[roomId]}</span>
                        <span className="md:hidden">{ROOM_SHORT_NAMES[roomId]}</span>
                      </div>
                      {monthDays.map((day, dayIdx) => {
                        const dayKey = format(day, "yyyy-MM-dd");
                        const { status, reservation, externalBlock } = roomDayStatuses[roomId][dayKey];
                        const isToday = isSameDay(day, today);

                        return (
                          <Tooltip key={`${roomId}-${dayKey}`}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleCellClick(roomId, day, status, reservation, externalBlock)}
                                className={cn(
                                  "h-10 flex items-center justify-center text-xs transition-all",
                                  "hover:opacity-80 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
                                  getStatusColor(status, isToday),
                                  roomIdx === rooms.length - 1 && dayIdx === monthDays.length - 1 && "rounded-br-lg"
                                )}
                              >
                                {status !== "available" && (
                                  <span className="hidden sm:inline">
                                    {status === "checkin" ? "→" : status === "checkout" ? "←" : status === "external" ? "B" : "●"}
                                  </span>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[200px]">
                              <div className="text-sm">
                                <p className="font-medium">{ROOM_NAMES[roomId]}</p>
                                <p className="text-muted-foreground">
                                  {format(day, "d 'de' MMMM", { locale: pt })}
                                </p>
                                <p className={cn(
                                  "font-medium mt-1",
                                  status === "available" && "text-green-600",
                                  status === "occupied" && "text-red-600",
                                  status === "checkin" && "text-amber-600",
                                  status === "checkout" && "text-blue-600",
                                  status === "external" && "text-purple-600"
                                )}>
                                  {getStatusLabel(status)}
                                </p>
                                {reservation && (
                                  <p className="text-xs mt-1 text-muted-foreground">
                                    {reservation.guest_name}
                                  </p>
                                )}
                                {externalBlock && (
                                  <p className="text-xs mt-1 text-muted-foreground">
                                    Fonte: {externalBlock.source}
                                  </p>
                                )}
                                <p className="text-xs mt-2 text-muted-foreground italic">
                                  Clique para {status === "available" ? "criar reserva" : "ver detalhes"}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Cell Details Dialog */}
      <Dialog open={selectedCell !== null} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCell?.reservation ? (
                <Eye className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              {selectedCell && ROOM_NAMES[selectedCell.roomId]}
            </DialogTitle>
            <DialogDescription>
              {selectedCell && format(selectedCell.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
            </DialogDescription>
          </DialogHeader>

          {selectedCell && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    selectedCell.status === "available" && "bg-green-500/20 text-green-700",
                    selectedCell.status === "occupied" && "bg-red-500/20 text-red-700",
                    selectedCell.status === "checkin" && "bg-amber-500/20 text-amber-700",
                    selectedCell.status === "checkout" && "bg-blue-500/20 text-blue-700",
                    selectedCell.status === "external" && "bg-purple-500/20 text-purple-700"
                  )}
                >
                  {getStatusLabel(selectedCell.status)}
                </Badge>
              </div>

              {/* Reservation Details */}
              {selectedCell.reservation ? (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">Número da Reserva</span>
                    <p className="font-medium">{selectedCell.reservation.reservation_number}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Hóspede</span>
                    <p className="font-medium">{selectedCell.reservation.guest_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email</span>
                    <p className="font-medium">{selectedCell.reservation.guest_email}</p>
                  </div>
                  {selectedCell.reservation.guest_phone && (
                    <div>
                      <span className="text-sm text-muted-foreground">Telefone</span>
                      <p className="font-medium">{selectedCell.reservation.guest_phone}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Check-in</span>
                      <p className="font-medium">
                        {format(parseISO(selectedCell.reservation.check_in), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Check-out</span>
                      <p className="font-medium">
                        {format(parseISO(selectedCell.reservation.check_out), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  {selectedCell.reservation.nights && (
                    <div>
                      <span className="text-sm text-muted-foreground">Noites</span>
                      <p className="font-medium">{selectedCell.reservation.nights}</p>
                    </div>
                  )}
                  {selectedCell.reservation.total_price && (
                    <div>
                      <span className="text-sm text-muted-foreground">Total</span>
                      <p className="font-medium">{selectedCell.reservation.total_price.toLocaleString()} CVE</p>
                    </div>
                  )}
                  {selectedCell.reservation.special_requests && (
                    <div>
                      <span className="text-sm text-muted-foreground">Pedidos Especiais</span>
                      <p className="font-medium text-sm">{selectedCell.reservation.special_requests}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Estado da Reserva</span>
                    <Badge variant={selectedCell.reservation.status === "confirmed" ? "default" : "secondary"} className="ml-2">
                      {selectedCell.reservation.status === "confirmed" ? "Confirmada" :
                        selectedCell.reservation.status === "pending" ? "Pendente" :
                          selectedCell.reservation.status}
                    </Badge>
                  </div>
                </div>
              ) : selectedCell.externalBlock ? (
                <div className="space-y-3 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div>
                    <span className="text-sm text-muted-foreground">Fonte</span>
                    <p className="font-medium capitalize">{selectedCell.externalBlock.source}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Data Início</span>
                      <p className="font-medium">
                        {format(parseISO(selectedCell.externalBlock.startDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Data Fim</span>
                      <p className="font-medium">
                        {format(parseISO(selectedCell.externalBlock.endDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Esta reserva foi importada do calendário iCal do Booking.com ou outra plataforma externa.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {isPastDate(selectedCell.date) ? (
                    <p className="text-sm text-muted-foreground">
                      Não é possível criar reservas para datas passadas.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Este quarto está disponível nesta data. Deseja criar uma nova reserva?
                      </p>
                      {onCreateReservation ? (
                        <Button onClick={handleCreateReservation} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Reserva
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Para criar reservas, utilize o formulário de reservas na página principal.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
