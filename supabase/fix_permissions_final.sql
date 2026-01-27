-- ASEGURAR PERMISOS DE EDICIÓN PARA EL PROFESOR
-- Copia y pega esto en Supabase SQL Editor para arreglar los botones

-- 1. Habilitar seguridad (por si acaso)
alter table public.grupos enable row level security;

-- 2. Eliminar política antigua (para evitar conflictos)
drop policy if exists "Public access" on public.grupos;

-- 3. Crear política MAESTRA (Permite ver y EDITAR todo)
create policy "Public access" on public.grupos
for all
using (true)
with check (true);

-- 4. Asegurar que la columna existe (Refuerzo)
alter table public.grupos 
add column if not exists configuracion jsonb default '{"voz_activada": true, "microfono_activado": true}'::jsonb;
