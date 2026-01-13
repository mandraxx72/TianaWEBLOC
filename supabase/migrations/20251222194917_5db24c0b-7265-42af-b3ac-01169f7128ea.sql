-- Add user_id column to reservations table for stronger authentication
ALTER TABLE public.reservations 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);

-- Drop existing email-based policies
DROP POLICY IF EXISTS "Guests can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Guests can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Guests can delete their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can create reservations with their email" ON public.reservations;

-- Create new policies using user_id for stronger security
CREATE POLICY "Users can view their own reservations"
ON public.reservations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations"
ON public.reservations
FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reservations"
ON public.reservations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations"
ON public.reservations
FOR DELETE
USING (auth.uid() = user_id);