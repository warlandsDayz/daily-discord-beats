ALTER TABLE public.radio_frequencies ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'farmeur';
ALTER TABLE public.radio_frequencies DROP CONSTRAINT IF EXISTS radio_frequencies_kind_check;
ALTER TABLE public.radio_frequencies ADD CONSTRAINT radio_frequencies_kind_check CHECK (kind IN ('farmeur','bandit'));
CREATE INDEX IF NOT EXISTS radio_frequencies_kind_created_idx ON public.radio_frequencies (kind, created_at DESC);