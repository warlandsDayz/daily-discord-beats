CREATE TABLE public.arma_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at timestamptz NOT NULL DEFAULT now(),
  online boolean NOT NULL,
  players integer NOT NULL DEFAULT 0,
  max_players integer NOT NULL DEFAULT 0,
  server_name text,
  map text,
  addr text,
  event text NOT NULL DEFAULT 'poll'
);

GRANT SELECT ON public.arma_status TO anon;
GRANT SELECT ON public.arma_status TO authenticated;
GRANT ALL ON public.arma_status TO service_role;

ALTER TABLE public.arma_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Statut serveur visible par tous"
ON public.arma_status FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX arma_status_checked_at_idx ON public.arma_status (checked_at DESC);