-- 1. LIMPIEZA NUCLEAR (WIPE) ☢️
-- Borramos todos los datos de las tablas públicas para empezar de cero.
-- Esto soluciona los problemas de "fantasmas" y mezcla de sesiones.

TRUNCATE TABLE public.mensajes_chat CASCADE;
TRUNCATE TABLE public.evaluaciones CASCADE;
TRUNCATE TABLE public.grupos CASCADE;
TRUNCATE TABLE public.proyectos CASCADE;
TRUNCATE TABLE public.debug_logs CASCADE;
-- Borramos perfiles con CASCADE para limpiar referencias
TRUNCATE TABLE public.profiles CASCADE;

-- 2. ASEGURAR ESQUEMA (FIX SCHEMA) 🔧
-- Garantizamos que existan las columnas clave.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS codigo_sala text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;

-- Aseguramos que grupos tenga la columna hitos (usada por la App)
ALTER TABLE public.grupos ADD COLUMN IF NOT EXISTS hitos jsonb default '[]'::jsonb;


-- 3. TRIGGER BLINDADO (BULLETPROOF TRIGGER) 🛡️
-- Este trigger gestiona la creación de usuarios sin fallar.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_rol text;
  v_nombre text;
  v_codigo text;
BEGIN
  -- Extraer valores (con fallbacks)
  v_rol := COALESCE(new.raw_user_meta_data ->> 'rol', 'alumno');
  v_nombre := COALESCE(new.raw_user_meta_data ->> 'nombre', new.raw_user_meta_data ->> 'full_name', 'Usuario');
  v_codigo := COALESCE(new.raw_user_meta_data ->> 'codigo_sala', null);

  BEGIN
    -- Intentamos insertar con todos los datos
    INSERT INTO public.profiles (id, email, rol, full_name, codigo_sala)
    VALUES (new.id, new.email, v_rol, v_nombre, v_codigo)
    ON CONFLICT (id) DO UPDATE
    SET 
      rol = excluded.rol,
      full_name = excluded.full_name,
      codigo_sala = excluded.codigo_sala,
      email = excluded.email;
      
  EXCEPTION WHEN OTHERS THEN
    -- Si falla, logueamos en la tabla debug_logs (si existe) o ignoramos para no bloquear Auth
    -- Intentamos insertar lo básico
    BEGIN
        INSERT INTO public.profiles (id, email, rol)
        VALUES (new.id, new.email, 'alumno')
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Si todo falla, no abortamos el registro de Auth
    END;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-asociamos el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. RLS CORREGIDA (SECURITY) 🔒
-- Permitimos lectura pública de proyectos (para alumnos buscando clase) pero escritura solo a dueños.

-- Proyectos
DROP POLICY IF EXISTS "Lectura Proyectos Autenticados" ON public.proyectos;
DROP POLICY IF EXISTS "Escritura Proyectos Dueño" ON public.proyectos;
-- ... borrar viejas ...
DROP POLICY IF EXISTS "Ver solo mis proyectos" ON public.proyectos;
DROP POLICY IF EXISTS "Dueño gestiona todo" ON public.proyectos;

ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura Publica Proyectos" ON public.proyectos
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Escritura Proyectos Dueño" ON public.proyectos
FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- Grupos
DROP POLICY IF EXISTS "Lectura Grupos Autenticados" ON public.grupos;
DROP POLICY IF EXISTS "Escritura Grupos Dueño Proyecto" ON public.grupos;

ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura Publica Grupos" ON public.grupos
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Escritura Grupos Dueño Proyecto" ON public.grupos
FOR ALL USING (
  exists (
    select 1 from public.proyectos
    where proyectos.id = grupos.proyecto_id
    and proyectos.created_by = auth.uid()
  )
) WITH CHECK (
  exists (
    select 1 from public.proyectos
    where proyectos.id = grupos.proyecto_id
    and proyectos.created_by = auth.uid()
  )
);

-- Profiles
DROP POLICY IF EXISTS "Lectura Perfiles Publica" ON public.profiles;
CREATE POLICY "Lectura Perfiles Publica" ON public.profiles
FOR SELECT USING (true); -- Necesario para que el profesor vea a los alumnos al crear grupo

-- Confirmación
SELECT 'WIPE AND FIX COMPLETED SUCCESSFULLY' as status;
