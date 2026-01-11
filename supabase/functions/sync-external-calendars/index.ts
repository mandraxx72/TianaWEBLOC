import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  uid: string;
  startDate: string;
  endDate: string;
  summary?: string;
}

// Parse iCal format to extract events
function parseICalEvents(icalData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icalData.split(/\r?\n/);

  let currentEvent: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (trimmedLine === 'END:VEVENT' && currentEvent) {
      if (currentEvent.uid && currentEvent.startDate && currentEvent.endDate) {
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      // Handle UID
      if (trimmedLine.startsWith('UID:')) {
        currentEvent.uid = trimmedLine.substring(4);
      }
      // Handle DTSTART (various formats)
      else if (trimmedLine.startsWith('DTSTART')) {
        const dateMatch = trimmedLine.match(/(\d{8})/);
        if (dateMatch) {
          const dateStr = dateMatch[1];
          currentEvent.startDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
        }
      }
      // Handle DTEND (various formats)
      else if (trimmedLine.startsWith('DTEND')) {
        const dateMatch = trimmedLine.match(/(\d{8})/);
        if (dateMatch) {
          const dateStr = dateMatch[1];
          currentEvent.endDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
        }
      }
      // Handle SUMMARY
      else if (trimmedLine.startsWith('SUMMARY:')) {
        currentEvent.summary = trimmedLine.substring(8);
      }
    }
  }

  return events;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[sync-external-calendars] Starting sync process...');

    // Fetch all external calendars
    const { data: calendars, error: calendarError } = await supabase
      .from('external_calendars')
      .select('*');

    if (calendarError) {
      console.error('[sync-external-calendars] Error fetching calendars:', calendarError);
      throw new Error(`Failed to fetch calendars: ${calendarError.message}`);
    }

    if (!calendars || calendars.length === 0) {
      console.log('[sync-external-calendars] No external calendars configured');
      return new Response(
        JSON.stringify({ message: 'No external calendars to sync', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sync-external-calendars] Found ${calendars.length} calendar(s) to sync`);

    let totalEvents = 0;
    const results: { calendarId: string; roomType: string; events: number; error?: string }[] = [];

    for (const calendar of calendars) {
      try {
        console.log(`[sync-external-calendars] Syncing calendar for room: ${calendar.room_type}, source: ${calendar.source}`);

        // Fetch iCal data
        const response = await fetch(calendar.calendar_url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const icalData = await response.text();
        console.log(`[sync-external-calendars] Fetched iCal data (${icalData.length} chars)`);

        // Parse events
        const events = parseICalEvents(icalData);
        console.log(`[sync-external-calendars] Parsed ${events.length} events`);

        // Delete old events for this calendar
        const { error: deleteError } = await supabase
          .from('external_blocked_dates')
          .delete()
          .eq('calendar_id', calendar.id);

        if (deleteError) {
          console.error('[sync-external-calendars] Error deleting old events:', deleteError);
        }

        // Insert new events (only future or current events, not past)
        if (events.length > 0) {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

          // Filter out past events - only keep events where end_date >= today
          const futureEvents = events.filter(event => event.endDate >= today);

          console.log(`[sync-external-calendars] Filtered to ${futureEvents.length} current/future events (excluded ${events.length - futureEvents.length} past events)`);

          if (futureEvents.length > 0) {
            const blockedDates = futureEvents.map(event => ({
              room_type: calendar.room_type,
              start_date: event.startDate,
              end_date: event.endDate,
              source: calendar.source,
              external_id: event.uid,
              calendar_id: calendar.id,
            }));

            const { error: insertError } = await supabase
              .from('external_blocked_dates')
              .insert(blockedDates);

            if (insertError) {
              throw new Error(`Failed to insert blocked dates: ${insertError.message}`);
            }

            totalEvents += futureEvents.length;
          }
        }

        // Update last_synced_at
        await supabase
          .from('external_calendars')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', calendar.id);

        results.push({
          calendarId: calendar.id,
          roomType: calendar.room_type,
          events: events.length,
        });

      } catch (error) {
        console.error(`[sync-external-calendars] Error syncing calendar ${calendar.id}:`, error);
        results.push({
          calendarId: calendar.id,
          roomType: calendar.room_type,
          events: 0,
          error: error.message,
        });
      }
    }

    console.log(`[sync-external-calendars] Sync complete. Total events: ${totalEvents}`);

    return new Response(
      JSON.stringify({
        message: 'Sync completed',
        synced: totalEvents,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sync-external-calendars] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
