-- Drop the existing policy that allows both admin and staff to view payment logs
DROP POLICY IF EXISTS "Admins and staff can view all payment logs" ON public.payment_logs;

-- Create a new policy that only allows admins to view payment logs
CREATE POLICY "Only admins can view all payment logs" 
ON public.payment_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Note: The "Users can view their own payment logs" policy still exists,
-- allowing users to see payment logs for their own reservations.