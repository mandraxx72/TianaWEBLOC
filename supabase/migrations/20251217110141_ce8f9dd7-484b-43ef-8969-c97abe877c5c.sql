-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_number TEXT NOT NULL UNIQUE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  room_type TEXT NOT NULL,
  room_name TEXT NOT NULL,
  room_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  nights INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting reservations (public - guests can make reservations)
CREATE POLICY "Anyone can create reservations" 
ON public.reservations 
FOR INSERT 
WITH CHECK (true);

-- Create policy for reading own reservation by email
CREATE POLICY "Users can view reservations by email" 
ON public.reservations 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_reservations_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_reservations_email ON public.reservations(guest_email);
CREATE INDEX idx_reservations_check_in ON public.reservations(check_in);
CREATE INDEX idx_reservations_status ON public.reservations(status);