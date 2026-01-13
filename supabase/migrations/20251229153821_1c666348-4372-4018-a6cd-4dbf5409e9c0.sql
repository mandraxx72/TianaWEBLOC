-- Add payment fields to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sisp_transaction_id text;

-- Add constraint for payment_status values
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_payment_status_check 
CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded'));

-- Create payment_logs table for audit trail
CREATE TABLE public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payment_reference text,
  amount integer,
  currency text DEFAULT 'CVE',
  sisp_response jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on payment_logs
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_logs
CREATE POLICY "Admins and staff can view all payment logs"
ON public.payment_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Users can view their own payment logs"
ON public.payment_logs
FOR SELECT
USING (
  reservation_id IN (
    SELECT id FROM public.reservations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert payment logs"
ON public.payment_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_payment_logs_reservation_id ON public.payment_logs(reservation_id);
CREATE INDEX idx_reservations_payment_reference ON public.reservations(payment_reference);
CREATE INDEX idx_reservations_payment_status ON public.reservations(payment_status);