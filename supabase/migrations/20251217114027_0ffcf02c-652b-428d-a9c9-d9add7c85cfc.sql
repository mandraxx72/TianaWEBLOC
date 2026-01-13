-- Add UPDATE policy for reservations
CREATE POLICY "Guests can update their own reservations"
ON public.reservations
FOR UPDATE
USING (guest_email = (auth.jwt() ->> 'email'::text));

-- Add DELETE policy for reservations
CREATE POLICY "Guests can delete their own reservations"
ON public.reservations
FOR DELETE
USING (guest_email = (auth.jwt() ->> 'email'::text));