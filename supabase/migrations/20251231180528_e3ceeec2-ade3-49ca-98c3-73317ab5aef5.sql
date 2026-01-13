-- Add user_id column to payment_logs for direct ownership validation
ALTER TABLE public.payment_logs 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Backfill existing payment_logs with user_id from reservations
UPDATE public.payment_logs pl
SET user_id = r.user_id
FROM public.reservations r
WHERE pl.reservation_id = r.id
  AND pl.user_id IS NULL;

-- Drop the old policy that relies on subquery to reservations
DROP POLICY IF EXISTS "Users can view their own payment logs" ON public.payment_logs;

-- Create a stronger policy with direct user_id validation
CREATE POLICY "Users can view their own payment logs" 
ON public.payment_logs 
FOR SELECT 
USING (auth.uid() = user_id);