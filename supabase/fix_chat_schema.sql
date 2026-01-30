-- Add 'remitente' column to store the sender's name directly
ALTER TABLE public.mensajes_chat 
ADD COLUMN IF NOT EXISTS remitente text;

-- Drop the existing check constraint on 'tipo' to allow 'alumno' and 'profesor'
ALTER TABLE public.mensajes_chat DROP CONSTRAINT IF EXISTS mensajes_chat_tipo_check;

-- Add a new, more inclusive check constraint (or just leave it open, but let's be safe)
ALTER TABLE public.mensajes_chat 
ADD CONSTRAINT mensajes_chat_tipo_check 
CHECK (tipo IN ('user', 'assistant', 'system', 'alumno', 'profesor'));
