ALTER TABLE public.radio_frequencies
  ADD COLUMN IF NOT EXISTS discord_message_id text,
  ADD COLUMN IF NOT EXISTS discord_channel_id text;