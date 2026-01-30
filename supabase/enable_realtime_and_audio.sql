-- 1. Enable Realtime for mensajes_chat table
-- This is often required for the 'postgres_changes' subscription to work
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE mensajes_chat, grupos; -- Add other tables if needed

-- ALTER PUBLICATION supabase_realtime ADD TABLE mensajes_chat; -- Safe alternative if it exists

-- 2. Add audio_url column for voice messages
ALTER TABLE public.mensajes_chat 
ADD COLUMN IF NOT EXISTS audio_url text;

-- 3. Create Storage Bucket for Audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-audio', 'chat-audio', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Public Access to Audio Bucket (Simple policy for demo)
CREATE POLICY "Public Access Audio"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat-audio' );

CREATE POLICY "Authenticated Upload Audio"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'chat-audio' AND auth.role() = 'authenticated' );
