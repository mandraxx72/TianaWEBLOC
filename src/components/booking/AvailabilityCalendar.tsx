import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useOccupiedDates } from "@/hooks/useOccupiedDates";

interface AvailabilityCalendarProps {
  selectedDate?: Date;
  onSelect: (date: Date | undefined) => void;
  roomType?: string;
  minDate?: Date;
  label?: string;
  placeholder?: string;
}

export const AvailabilityCalendar = ({
  selectedDate,
  onSelect,
  roomType,
  minDate = new Date(),
  label,
  placeholder = "Selecione uma data",
}: AvailabilityCalendarProps) => {
  const [open, setOpen] = useState(false);
  const { occupiedDates, loading } = useOccupiedDates(roomType);

  const isDateOccupied = (date: Date) => {
    return occupiedDates.some((occupiedDate) => isSameDay(date, occupiedDate));
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return true;
    }
    // Disable dates before minDate
    if (minDate && date < minDate) {
      return true;
    }
    // Disable occupied dates
    return isDateOccupied(date);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium">
          <CalendarIcon className="inline h-4 w-4 mr-2" />
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP", { locale: pt })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onSelect(date);
              setOpen(false);
            }}
            disabled={isDateDisabled}
            initialFocus
            locale={pt}
            className="pointer-events-auto"
            modifiers={{
              occupied: occupiedDates,
            }}
            modifiersStyles={{
              occupied: {
                backgroundColor: "hsl(var(--destructive) / 0.2)",
                color: "hsl(var(--destructive))",
                textDecoration: "line-through",
              },
            }}
          />
          <div className="p-3 border-t text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/20" />
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>Selecionado</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
