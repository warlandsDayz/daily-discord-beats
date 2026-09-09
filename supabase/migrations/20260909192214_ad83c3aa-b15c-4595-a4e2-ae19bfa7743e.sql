CREATE TYPE public.app_role AS ENUM ('membre', 'chef');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id text NOT NULL UNIQUE,
  username text NOT NULL,
  global_name text,
  avatar_url text,
  rank text NOT NULL DEFAULT 'Recrue',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE public.radio_frequencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency numeric(4,1) NOT NULL,
  for_date date NOT NULL,
  source text NOT NULL DEFAULT 'cron',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX radio_frequencies_created_at_idx ON public.radio_frequencies (created_at DESC);
GRANT SELECT ON public.radio_frequencies TO authenticated;
GRANT ALL ON public.radio_frequencies TO service_role;
ALTER TABLE public.radio_frequencies ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bot_settings (
  id boolean PRIMARY KEY DEFAULT true,
  guild_id text,
  channel_id text,
  bot_username text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bot_settings_singleton CHECK (id)
);
GRANT SELECT ON public.bot_settings TO authenticated;
GRANT ALL ON public.bot_settings TO service_role;
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.bot_settings (id) VALUES (true);

CREATE TABLE public.bot_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT 'info',
  action text NOT NULL,
  message text,
  actor text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bot_logs_created_at_idx ON public.bot_logs (created_at DESC);
GRANT SELECT ON public.bot_logs TO authenticated;
GRANT ALL ON public.bot_logs TO service_role;
ALTER TABLE public.bot_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membres actifs voient les profils"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.has_role(auth.uid(), 'chef')
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_active)
  );

CREATE POLICY "Les chefs modifient les profils"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'chef'))
  WITH CHECK (public.has_role(auth.uid(), 'chef'));

CREATE POLICY "Chacun voit ses roles, les chefs voient tout"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'chef'));

CREATE POLICY "Membres actifs voient les frequences"
  ON public.radio_frequencies FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_active));

CREATE POLICY "Les chefs voient les reglages du bot"
  ON public.bot_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'chef'));

CREATE POLICY "Les chefs voient le journal du bot"
  ON public.bot_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'chef'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();