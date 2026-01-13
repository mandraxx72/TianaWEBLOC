-- Add explicit SELECT policy for external_calendars to restrict access to admins only
CREATE POLICY "Only admins can view external calendars" 
ON public.external_calendars 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));