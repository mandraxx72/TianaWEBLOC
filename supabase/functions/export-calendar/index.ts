import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Room names mapping for display
const ROOM_NAMES: Record<string, string> = {
    "dunas": "Dunas",
    "baia-tranquila": "Baía Tranquila",
    "terraco-sol": "Terraço Sol",
    "morabeza": "Morabeza",
};

// Generate a valid iCal date string (YYYYMMDD)
function formatICalDate(dateStr: string): string {
    return dateStr.replace(/-/g, '');
}

// Generate a unique UID for iCal events
function generateUID(reservationNumber: string, domain: string): string {
    return `${reservationNumber}@${domain}`;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const roomType = url.searchParams.get('room');

        if (!roomType) {
            return new Response(
                'Missing required parameter: room (e.g., ?room=dunas)',
                { status: 400, headers: corsHeaders }
            );
        }

        // Validate room type
        if (!ROOM_NAMES[roomType]) {
            return new Response(
                `Invalid room type: ${roomType}. Valid options: ${Object.keys(ROOM_NAMES).join(', ')}`,
                { status: 400, headers: corsHeaders }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get today's date for filtering past reservations
        const today = new Date().toISOString().split('T')[0];

        // Fetch all confirmed/pending reservations for this room
        const { data: reservations, error } = await supabase
            .from('reservations')
            .select('reservation_number, check_in, check_out, status')
            .eq('room_type', roomType)
            .in('status', ['confirmed', 'pending'])
            .gte('check_out', today)
            .order('check_in', { ascending: true });

        if (error) {
            console.error('[export-calendar] Error fetching reservations:', error);
            throw new Error(`Database error: ${error.message}`);
        }

        // Generate iCal content
        const domain = 'casatiana.com';
        const roomName = ROOM_NAMES[roomType];

        let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Casa Tiana//${roomName}//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Casa Tiana - ${roomName}
X-WR-TIMEZONE:Atlantic/Cape_Verde
`;

        if (reservations && reservations.length > 0) {
            for (const reservation of reservations) {
                const uid = generateUID(reservation.reservation_number, domain);
                const dtstart = formatICalDate(reservation.check_in);
                const dtend = formatICalDate(reservation.check_out);
                const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

                icalContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
SUMMARY:Reservado
DESCRIPTION:Quarto reservado - Casa Tiana
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
`;
            }
        }

        icalContent += `END:VCALENDAR`;

        // Return iCal file
        return new Response(icalContent, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="casa-tiana-${roomType}.ics"`,
            },
        });

    } catch (error) {
        console.error('[export-calendar] Fatal error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
