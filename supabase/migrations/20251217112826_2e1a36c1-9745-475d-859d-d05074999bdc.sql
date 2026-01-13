-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view reservations by email" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;

-- Create secure SELECT policy: guests can only see their own reservations
CREATE POLICY "Guests can view their own reservations"
ON public.reservations
FOR SELECT
USING (
  guest_email = (auth.jwt()->>'email')
);

-- Create secure INSERT policy: only authenticated users can create reservations
-- and they must use their own email
CREATE POLICY "Authenticated users can create reservations with their email"
ON public.reservations
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND guest_email = (auth.jwt()->>'email')
);