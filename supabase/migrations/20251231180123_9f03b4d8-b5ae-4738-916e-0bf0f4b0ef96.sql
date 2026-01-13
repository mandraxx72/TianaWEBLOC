-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert payment logs" ON public.payment_logs;

-- Create a new restrictive policy that only allows service role to insert
-- Edge functions using supabase admin client (service_role) bypass RLS entirely,
-- so we create a policy that blocks all regular users from inserting
CREATE POLICY "Only service role can insert payment logs" 
ON public.payment_logs 
FOR INSERT 
TO authenticated, anon
WITH CHECK (false);

-- Note: Service role bypasses RLS, so edge functions will still be able to insert.
-- This policy explicitly blocks authenticated and anonymous users from inserting.