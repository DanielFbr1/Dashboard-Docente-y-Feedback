-- Asegurar que los perfiles son visibles para todos (para que el profe vea a los alumnos)
DROP POLICY IF EXISTS "Lectura Perfiles Publica" ON public.profiles;
CREATE POLICY "Lectura Perfiles Publica" ON public.profiles
FOR SELECT
USING (true);

-- Indice para mejorar la busqueda por codigo ordenado
CREATE INDEX IF NOT EXISTS idx_profiles_codigo_sala ON public.profiles(codigo_sala);
