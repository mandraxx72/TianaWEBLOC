-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Guests can view their own reservations" ON public.reservations;

-- Create new SELECT policy that requires authentication
CREATE POLICY "Guests can view their own reservations"
ON public.reservations
FOR SELECT
USING (auth.uid() IS NOT NULL AND guest_email = (auth.jwt() ->> 'email'::text));