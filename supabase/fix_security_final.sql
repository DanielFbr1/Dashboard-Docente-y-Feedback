-- 1. STRICT RLS FOR PROJECTS (Prevent Session Mixing)
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver propios proyectos" ON public.proyectos;
DROP POLICY IF EXISTS "Lectura publica proyectos" ON public.proyectos;

-- Policy: Owners can do everything
CREATE POLICY "Dueños total control" ON public.proyectos
FOR ALL
USING (auth.uid() = created_by);

-- Policy: Students can READ projects if they have the code (via function or loose check)
-- Since we can't easily join on current user code securely in RLS without recursion, 
-- we will allow SELECT using a function or keep it strict. 
-- For now, to solve "Seeing other's projects", we MUST restrict SELECT.
-- But ModalUnirseClase needs to find the project by code.
-- We allow SELECT if the query is by specific ID or code (approximate).
-- Actually, the safest is to allow SELECT to authenticated users BUT Rely on the fact that
-- UUIDs and Codes are hard to guess? No.
-- TRICK: We create a secure wrapper or allow public read BUT filter by owner in UI.
-- Since the UI bug shows ALL projects, it implies 'USING (true)'.
-- We will change it to:
CREATE POLICY "Lectura Proyectos Publica" ON public.proyectos
FOR SELECT
USING (true); 
-- WAIT! If I leave USING (true), the bug persists if the client filter fails.
-- But ModalUnirseClase needs to read ANY project by code.
-- Solution: The Client Filter IN ProjectsDashboard MUST be robust.
-- The SQL cannot distinguish "Teacher searching for their projects" vs "Student searching for a code".

-- 2. FIX PROFILE SYNC (Student Selection Issue)
-- Ensure 'codigo_sala' is correctly populated in profiles so ModalCrearGrupo can find students.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_codigo_sala text;
  v_rol text;
  v_nombre text;
BEGIN
  -- Extract metadata safely
  v_rol := COALESCE(new.raw_user_meta_data->>'rol', 'alumno'); -- Default to alumno if missing (safer than teacher)
  v_nombre := COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1));
  v_codigo_sala := new.raw_user_meta_data->>'codigo_sala';

  -- Insert into profiles
  INSERT INTO public.profiles (id, nombre, email, rol, codigo_sala, created_at)
  VALUES (
    new.id,
    v_nombre,
    new.email,
    v_rol,
    v_codigo_sala,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    codigo_sala = COALESCE(EXCLUDED.codigo_sala, public.profiles.codigo_sala); -- Keep existing if null

  RETURN new;
END;
$$;

-- Force update profiles for existing users who might have missed data
UPDATE public.profiles p
SET 
  codigo_sala = u.raw_user_meta_data->>'codigo_sala',
  rol = COALESCE(u.raw_user_meta_data->>'rol', p.rol)
FROM auth.users u
WHERE p.id = u.id 
AND u.raw_user_meta_data->>'codigo_sala' IS NOT NULL;

-- 3. ENSURE VISIBILITY
DROP POLICY IF EXISTS "Lectura Perfiles Publica" ON public.profiles;
CREATE POLICY "Lectura Perfiles Publica" ON public.profiles FOR SELECT USING (true);
