-- Create a function to get occupied dates without exposing personal reservation data
CREATE OR REPLACE FUNCTION public.get_occupied_dates(p_room_type text DEFAULT NULL)
RETURNS TABLE (
  check_in date,
  check_out date,
  room_type text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.check_in, r.check_out, r.room_type
  FROM public.reservations r
  WHERE r.status IN ('confirmed', 'pending')
    AND r.check_out >= CURRENT_DATE
    AND (p_room_type IS NULL OR r.room_type = p_room_type);
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_occupied_dates(text) TO anon, authenticated;