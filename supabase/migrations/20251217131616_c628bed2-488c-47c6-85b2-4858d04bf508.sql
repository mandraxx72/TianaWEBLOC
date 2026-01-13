-- Add a default permissive policy that requires authentication
-- This ensures unauthenticated users cannot access any reservation data

-- First, create a permissive policy that requires authentication for SELECT
CREATE POLICY "Require authentication for reservations access"
ON public.reservations
FOR SELECT
TO authenticated
USING (true);

-- Drop the existing restrictive SELECT policies and recreate as permissive with proper checks
DROP POLICY IF EXISTS "Guests can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Staff can view all reservations" ON public.reservations;

-- Recreate as permissive policies with authentication requirement built-in
CREATE POLICY "Guests can view their own reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (guest_email = (auth.jwt() ->> 'email'::text));

CREATE POLICY "Staff can view all reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));