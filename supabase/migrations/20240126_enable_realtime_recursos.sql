-- Add 'recursos' table to the realtime publication
-- This allows INSERT/UPDATE/DELETE events to be broadcast to clients
alter publication supabase_realtime add table public.recursos;
