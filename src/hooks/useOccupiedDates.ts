import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { eachDayOfInterval, parseISO, subDays } from "date-fns";

interface OccupiedDateRange {
  check_in: string;
  check_out: string;
  room_type: string;
}

export const useOccupiedDates = (roomType?: string) => {
  const [occupiedDates, setOccupiedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOccupiedDates = async () => {
      setLoading(true);
      try {
        // Use the database function to get occupied dates without RLS restrictions
        const { data, error } = await supabase.rpc("get_occupied_dates", {
          p_room_type: roomType || null,
        });

        if (error) {
          console.error("Error fetching occupied dates:", error);
          return;
        }

        // Convert date ranges to individual dates
        const allOccupiedDates: Date[] = [];
        (data as OccupiedDateRange[])?.forEach((reservation) => {
          const startDate = parseISO(reservation.check_in);
          const endDate = parseISO(reservation.check_out);

          // Only process valid intervals where check-out is after check-in
          if (startDate < endDate) {
            const interval = eachDayOfInterval({
              start: startDate,
              end: subDays(endDate, 1),
            });
            allOccupiedDates.push(...interval);
          }
        });

        setOccupiedDates(allOccupiedDates);
      } catch (error) {
        console.error("Error processing occupied dates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedDates();
  }, [roomType]);

  return { occupiedDates, loading };
};
