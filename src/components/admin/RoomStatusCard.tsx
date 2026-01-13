import { User, Check, Wrench, Sparkles, MoreVertical, Calendar, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export type RoomStatus = "occupied" | "available" | "maintenance" | "cleaning";

interface RoomStatusCardProps {
  roomId: string;
  roomName: string;
  status: RoomStatus;
  guestName?: string;
  checkOut?: string;
  onStatusChange: (roomId: string, status: RoomStatus) => void;
  onViewReservation?: (roomId: string) => void;
  onViewUpcoming?: (roomId: string) => void;
}

const statusConfig: Record<RoomStatus, { 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  badgeClass: string;
  bgClass: string;
}> = {
  occupied: {
    label: "Ocupado",
    icon: User,
    badgeClass: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    bgClass: "border-l-orange-500",
  },
  available: {
    label: "Disponível",
    icon: Check,
    badgeClass: "bg-green-500/20 text-green-600 border-green-500/30",
    bgClass: "border-l-green-500",
  },
  maintenance: {
    label: "Manutenção",
    icon: Wrench,
    badgeClass: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    bgClass: "border-l-yellow-500",
  },
  cleaning: {
    label: "A Limpar",
    icon: Sparkles,
    badgeClass: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    bgClass: "border-l-blue-500",
  },
};

export function RoomStatusCard({
  roomId,
  roomName,
  status,
  guestName,
  checkOut,
  onStatusChange,
  onViewReservation,
  onViewUpcoming,
}: RoomStatusCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className={`relative border-l-4 ${config.bgClass} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{roomName}</h3>
            
            <Badge variant="outline" className={config.badgeClass}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>

            {status === "occupied" && guestName && (
              <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{guestName}</span>
                </div>
                {checkOut && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Check-out: {format(new Date(checkOut), "dd MMM", { locale: pt })}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              {status === "occupied" && onViewReservation && (
                <>
                  <DropdownMenuItem onClick={() => onViewReservation(roomId)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver reserva actual
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {onViewUpcoming && (
                <DropdownMenuItem onClick={() => onViewUpcoming(roomId)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver próximas reservas
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {status !== "available" && (
                <DropdownMenuItem onClick={() => onStatusChange(roomId, "available")}>
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como Disponível
                </DropdownMenuItem>
              )}
              
              {status !== "maintenance" && status !== "occupied" && (
                <DropdownMenuItem onClick={() => onStatusChange(roomId, "maintenance")}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Marcar como Manutenção
                </DropdownMenuItem>
              )}
              
              {status !== "cleaning" && status !== "occupied" && (
                <DropdownMenuItem onClick={() => onStatusChange(roomId, "cleaning")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Marcar como A Limpar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
