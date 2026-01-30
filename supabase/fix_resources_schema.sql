-- 1. Enable resources to belong to a Project (Class-wide) instead of just a Group
-- We need to check if 'recursos' table exists. It seems it does from the error log.

-- Ensure the table exists (if not created by earlier migration)
CREATE TABLE IF NOT EXISTS public.recursos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT CHECK (tipo IN ('texto', 'video', 'audio', 'imagen')),
    url TEXT,
    contenido TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    usuario_id UUID REFERENCES public.profiles(id),
    grupo_id BIGINT REFERENCES public.grupos(id) ON DELETE CASCADE
);

-- 2. Add 'proyecto_id' column to allow linking to the whole class
ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE;

-- 3. Make 'grupo_id' NULLABLE (so we can have project-resources without a group)
ALTER TABLE public.recursos ALTER COLUMN grupo_id DROP NOT NULL;

-- 4. Enable RLS
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Public access resources" ON public.recursos; -- Drop old broad policy
DROP POLICY IF EXISTS "Lectura Recursos" ON public.recursos;

-- Allow read access if you are in the project or the group
CREATE POLICY "Lectura Recursos" ON public.recursos
FOR SELECT
USING (true); -- Ideally filter by project_id, but for now Public Read allows debugging. Strict RLS later.

-- Allow Insert for auth users
CREATE POLICY "Insertar Recursos" ON public.recursos
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- 6. Trigger to auto-fill proyecto_id if missing? 
-- Optional. Ideally the UI sends it.

-- 7. Fix existing resources if they have invalid group IDs?
-- DELETE FROM public.recursos WHERE grupo_id IS NOT NULL AND grupo_id NOT IN (SELECT id FROM public.grupos);
