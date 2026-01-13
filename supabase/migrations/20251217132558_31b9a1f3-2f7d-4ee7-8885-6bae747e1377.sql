-- Create table for external calendar URLs (Booking.com, Airbnb, etc.)
CREATE TABLE public.external_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type TEXT NOT NULL,
  calendar_url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'booking.com',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for blocked dates imported from external calendars
CREATE TABLE public.external_blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  source TEXT NOT NULL,
  external_id TEXT,
  calendar_id UUID REFERENCES public.external_calendars(id) ON DELETE CASCADE,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.external_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage external calendars
CREATE POLICY "Admins can manage external calendars"
ON public.external_calendars
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage external blocked dates
CREATE POLICY "Admins can manage external blocked dates"
ON public.external_blocked_dates
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can read external blocked dates (needed for calendar display)
CREATE POLICY "Anyone can view external blocked dates"
ON public.external_blocked_dates
FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX idx_external_blocked_dates_room_type ON public.external_blocked_dates(room_type);
CREATE INDEX idx_external_blocked_dates_dates ON public.external_blocked_dates(start_date, end_date);
CREATE INDEX idx_external_calendars_room_type ON public.external_calendars(room_type);

-- Add trigger for updated_at on external_calendars
CREATE TRIGGER update_external_calendars_updated_at
BEFORE UPDATE ON public.external_calendars
FOR EACH ROW
EXECUTE FUNCTION public.update_reservations_updated_at();

-- Update get_occupied_dates function to include external blocked dates
CREATE OR REPLACE FUNCTION public.get_occupied_dates(p_room_type text DEFAULT NULL::text)
RETURNS TABLE(check_in date, check_out date, room_type text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Internal reservations
  SELECT r.check_in, r.check_out, r.room_type
  FROM public.reservations r
  WHERE r.status IN ('confirmed', 'pending')
    AND r.check_out >= CURRENT_DATE
    AND (p_room_type IS NULL OR r.room_type = p_room_type)
  
  UNION ALL
  
  -- External blocked dates (from Booking.com, Airbnb, etc.)
  SELECT ebd.start_date as check_in, ebd.end_date as check_out, ebd.room_type
  FROM public.external_blocked_dates ebd
  WHERE ebd.end_date >= CURRENT_DATE
    AND (p_room_type IS NULL OR ebd.room_type = p_room_type);
$function$;