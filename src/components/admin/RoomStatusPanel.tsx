import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble } from "lucide-react";
import { RoomStatusCard, RoomStatus } from "./RoomStatusCard";
import { RoomOccupancyCalendar } from "./RoomOccupancyCalendar";
import { AdminCreateReservationModal } from "./AdminCreateReservationModal";
import { ROOM_IDS } from "@/components/rooms/roomsData";
import { isWithinInterval, parseISO, startOfToday, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Reservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email: string;
  room_type: string;
  room_name: string;
  check_in: string;
  check_out: string;
  status: string;
}

interface ExternalBlockedDate {
  id: string;
  room_type: string;
  start_date: string;
  end_date: string;
  source: string;
  external_id: string | null;
}

interface RoomStatusPanelProps {
  reservations: Reservation[];
  onReservationsChanged?: () => void;
}

// Room names mapping
const ROOM_NAMES: Record<string, string> = {
  [ROOM_IDS.DUNAS]: "Dunas",
  [ROOM_IDS.BAIA_TRANQUILA]: "Baía Tranquila",
  [ROOM_IDS.TERRACO_SOL]: "Terraço Sol",
  [ROOM_IDS.MORABEZA]: "Morabeza",
};

export function RoomStatusPanel({ reservations, onReservationsChanged }: RoomStatusPanelProps) {
  // Local state for manual status overrides (maintenance/cleaning)
  const [manualStatus, setManualStatus] = useState<Record<string, RoomStatus>>({});
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<"current" | "upcoming" | null>(null);

  // State for create reservation modal
  const [createReservationOpen, setCreateReservationOpen] = useState(false);
  const [prefillRoomId, setPrefillRoomId] = useState<string | undefined>();
  const [prefillDate, setPrefillDate] = useState<Date | undefined>();

  // State for external blocked dates (Booking.com, etc.)
  const [externalBlockedDates, setExternalBlockedDates] = useState<ExternalBlockedDate[]>([]);

  const today = startOfToday();

  // Fetch external blocked dates on mount
  useEffect(() => {
    const fetchExternalBlockedDates = async () => {
      const todayStr = format(today, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('external_blocked_dates')
        .select('*')
        .gte('end_date', todayStr); // Only get events that end today or later

      if (!error && data) {
        setExternalBlockedDates(data);
      }
    };

    fetchExternalBlockedDates();
  }, [today]);

  // Calculate room statuses based on reservations AND external blocked dates
  const roomStatuses = useMemo(() => {
    const rooms = Object.values(ROOM_IDS);

    return rooms.map(roomId => {
      // Check if there's a manual override
      if (manualStatus[roomId]) {
        return {
          roomId,
          status: manualStatus[roomId],
          currentReservation: null,
          externalSource: null,
        };
      }

      // Find active internal reservation for this room
      const activeReservation = reservations.find(r =>
        r.room_type === roomId &&
        (r.status === "confirmed" || r.status === "pending") &&
        isWithinInterval(today, {
          start: parseISO(r.check_in),
          end: parseISO(r.check_out),
        })
      );

      if (activeReservation) {
        return {
          roomId,
          status: "occupied" as RoomStatus,
          currentReservation: activeReservation,
          externalSource: null,
        };
      }

      // Check for external blocked dates (Booking.com, etc.)
      // Note: In iCal format, DTEND is exclusive (event ends BEFORE that date)
      const externalBlock = externalBlockedDates.find(ebd => {
        if (ebd.room_type !== roomId) return false;
        const startDate = parseISO(ebd.start_date);
        const endDate = parseISO(ebd.end_date);
        // Block from start_date up to (but NOT including) end_date
        return isSameDay(today, startDate) ||
          (isWithinInterval(today, { start: startDate, end: endDate }) && !isSameDay(today, endDate));
      });

      if (externalBlock) {
        return {
          roomId,
          status: "occupied" as RoomStatus,
          currentReservation: null,
          externalSource: externalBlock.source,
        };
      }

      return {
        roomId,
        status: "available" as RoomStatus,
        currentReservation: null,
        externalSource: null,
      };
    });
  }, [reservations, manualStatus, today, externalBlockedDates]);

  // Handle status change
  const handleStatusChange = (roomId: string, newStatus: RoomStatus) => {
    if (newStatus === "available") {
      // Remove manual override, let automatic detection work
      setManualStatus(prev => {
        const updated = { ...prev };
        delete updated[roomId];
        return updated;
      });
    } else {
      setManualStatus(prev => ({ ...prev, [roomId]: newStatus }));
    }
  };

  // Get upcoming reservations for a room
  const getUpcomingReservations = (roomId: string) => {
    return reservations
      .filter(r =>
        r.room_type === roomId &&
        (r.status === "confirmed" || r.status === "pending") &&
        parseISO(r.check_in) > today
      )
      .sort((a, b) => parseISO(a.check_in).getTime() - parseISO(b.check_in).getTime())
      .slice(0, 5);
  };

  // Get current reservation for a room
  const getCurrentReservation = (roomId: string) => {
    return roomStatuses.find(r => r.roomId === roomId)?.currentReservation;
  };

  const handleViewReservation = (roomId: string) => {
    setSelectedRoom(roomId);
    setDialogType("current");
  };

  const handleViewUpcoming = (roomId: string) => {
    setSelectedRoom(roomId);
    setDialogType("upcoming");
  };

  const closeDialog = () => {
    setSelectedRoom(null);
    setDialogType(null);
  };

  // Handle create reservation from calendar click
  const handleCreateReservation = (roomId: string, date: Date) => {
    setPrefillRoomId(roomId);
    setPrefillDate(date);
    setCreateReservationOpen(true);
  };

  const handleReservationCreated = () => {
    setCreateReservationOpen(false);
    setPrefillRoomId(undefined);
    setPrefillDate(undefined);
    onReservationsChanged?.();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            Estado dos Quartos
          </CardTitle>
          <CardDescription>
            Visualize e gerencie o estado actual de cada quarto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roomStatuses.map(({ roomId, status, currentReservation, externalSource }) => (
              <RoomStatusCard
                key={roomId}
                roomId={roomId}
                roomName={ROOM_NAMES[roomId]}
                status={status}
                guestName={currentReservation?.guest_name || (externalSource ? `Reserva ${externalSource}` : undefined)}
                checkOut={currentReservation?.check_out}
                onStatusChange={handleStatusChange}
                onViewReservation={status === "occupied" && currentReservation ? handleViewReservation : undefined}
                onViewUpcoming={handleViewUpcoming}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <RoomOccupancyCalendar
        reservations={reservations}
        onCreateReservation={handleCreateReservation}
      />

      {/* Admin Create Reservation Modal */}
      <AdminCreateReservationModal
        isOpen={createReservationOpen}
        onClose={() => setCreateReservationOpen(false)}
        onSuccess={handleReservationCreated}
        prefillRoomId={prefillRoomId}
        prefillDate={prefillDate}
      />

      {/* Dialog for Current Reservation */}
      <Dialog open={dialogType === "current" && selectedRoom !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reserva Actual - {selectedRoom && ROOM_NAMES[selectedRoom]}</DialogTitle>
          </DialogHeader>
          {selectedRoom && (() => {
            const reservation = getCurrentReservation(selectedRoom);
            if (!reservation) return <p className="text-muted-foreground">Sem reserva activa</p>;

            return (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Número da Reserva</span>
                  <p className="font-medium">{reservation.reservation_number}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Hóspede</span>
                  <p className="font-medium">{reservation.guest_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{reservation.guest_email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Check-in</span>
                    <p className="font-medium">{format(parseISO(reservation.check_in), "dd/MM/yyyy", { locale: pt })}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Check-out</span>
                    <p className="font-medium">{format(parseISO(reservation.check_out), "dd/MM/yyyy", { locale: pt })}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog for Upcoming Reservations */}
      <Dialog open={dialogType === "upcoming" && selectedRoom !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Próximas Reservas - {selectedRoom && ROOM_NAMES[selectedRoom]}</DialogTitle>
          </DialogHeader>
          {selectedRoom && (() => {
            const upcoming = getUpcomingReservations(selectedRoom);
            if (upcoming.length === 0) {
              return <p className="text-muted-foreground">Sem reservas futuras</p>;
            }

            return (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hóspede</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.guest_name}</TableCell>
                      <TableCell>{format(parseISO(r.check_in), "dd/MM/yyyy", { locale: pt })}</TableCell>
                      <TableCell>{format(parseISO(r.check_out), "dd/MM/yyyy", { locale: pt })}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "confirmed" ? "default" : "secondary"}>
                          {r.status === "confirmed" ? "Confirmada" : "Pendente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
