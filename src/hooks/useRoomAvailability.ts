import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { eachDayOfInterval, parseISO, isSameDay, addMonths, startOfToday, endOfMonth } from "date-fns";

interface OccupiedDateRange {
  check_in: string;
  check_out: string;
  room_type: string;
}

interface RoomAvailability {
  roomType: string;
  availableDays: number;
  totalDays: number;
  percentAvailable: number;
  occupiedDatesInRange: Date[];
}

export const useRoomAvailability = (roomTypes: string[]) => {
  const [occupiedByRoom, setOccupiedByRoom] = useState<Record<string, Date[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOccupiedDates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_occupied_dates", {
          p_room_type: null,
        });

        if (error) {
          console.error("Error fetching occupied dates:", error);
          return;
        }

        // Group dates by room type
        const grouped: Record<string, Date[]> = {};
        
        roomTypes.forEach(rt => {
          grouped[rt] = [];
        });

        (data as OccupiedDateRange[])?.forEach((reservation) => {
          const interval = eachDayOfInterval({
            start: parseISO(reservation.check_in),
            end: parseISO(reservation.check_out),
          });
          
          if (grouped[reservation.room_type]) {
            grouped[reservation.room_type].push(...interval);
          }
        });

        setOccupiedByRoom(grouped);
      } catch (error) {
        console.error("Error processing occupied dates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (roomTypes.length > 0) {
      fetchAllOccupiedDates();
    }
  }, [roomTypes.join(",")]);

  const availability = useMemo<RoomAvailability[]>(() => {
    const today = startOfToday();
    const nextMonth = addMonths(today, 1);
    const endOfNextMonth = endOfMonth(nextMonth);
    
    // Days from today to end of next month
    const allDays = eachDayOfInterval({ start: today, end: endOfNextMonth });
    const totalDays = allDays.length;

    return roomTypes.map(roomType => {
      const occupiedDates = occupiedByRoom[roomType] || [];
      
      // Get unique occupied dates within the range
      const occupiedDatesInRange = allDays.filter(day => 
        occupiedDates.some(occupied => isSameDay(day, occupied))
      );
      
      const availableDays = totalDays - occupiedDatesInRange.length;
      const percentAvailable = Math.round((availableDays / totalDays) * 100);

      return {
        roomType,
        availableDays,
        totalDays,
        percentAvailable,
        occupiedDatesInRange,
      };
    });
  }, [occupiedByRoom, roomTypes]);

  return { availability, loading };
};
