-- Remove the overly permissive policy that allows any authenticated user to read all reservations
DROP POLICY IF EXISTS "Require authentication for reservations access" ON public.reservations;