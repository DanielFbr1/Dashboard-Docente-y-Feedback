-- TABLA RECURSOS
create table if not exists public.recursos (
  id uuid default uuid_generate_v4() primary key,
  grupo_id bigint references public.grupos(id) on delete set null,
  grupo_nombre text,
  departamento text,
  tipo text check (tipo in ('texto', 'video', 'audio', 'imagen')),
  titulo text not null,
  descripcion text,
  url text,       -- URL del archivo en Storage
  contenido text, -- Contenido si es texto
  usuario_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para Recursos
alter table public.recursos enable row level security;

-- Política: Todos pueden leer todo (ver recursos de otros grupos es la idea del repositorio)
create policy "Public read access" on public.recursos for all using (true);

-- Política: Insertar solo autenticados (se podría refinar para solo insertar en tu grupo, pero simplificado por ahora)
create policy "Authenticated insert" on public.recursos for insert with check (auth.role() = 'authenticated');

-- STORAGE BUCKET 'recursos'
-- Nota: Esto usualmente se hace desde la UI, pero si usas el cliente de migración o SQL Editor:
insert into storage.buckets (id, name, public)
values ('recursos', 'recursos', true)
on conflict (id) do nothing;

-- STORAGE POLICIES
-- Permitir lectura pública
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'recursos' );

-- Permitir subir a autenticados
create policy "Authenticated Upload"
on storage.objects for insert
with check ( bucket_id = 'recursos' and auth.role() = 'authenticated' );
