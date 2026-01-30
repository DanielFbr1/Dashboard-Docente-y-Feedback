-- 1. Añadir columna codigo_sala a profiles (faltaba, por eso no se encontraban alumnos)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS codigo_sala text;

-- 2. Asegurar que RLS permite leer profiles (para que el ModalCrearGrupo encuentre alumnos)
DROP POLICY IF EXISTS "Lectura Perfiles Publica" ON public.profiles;
CREATE POLICY "Lectura Perfiles Publica" ON public.profiles
FOR SELECT
USING (true);

-- 3. Actualizar Trigger para guardar codigo_sala al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, rol, full_name, codigo_sala)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'rol', 'alumno'),
    COALESCE(new.raw_user_meta_data ->> 'nombre', new.raw_user_meta_data ->> 'full_name', 'Usuario'),
    COALESCE(new.raw_user_meta_data ->> 'codigo_sala', null) -- Guardamos el codigo si viene
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    rol = excluded.rol,
    full_name = excluded.full_name,
    codigo_sala = excluded.codigo_sala, -- Actualizar si cambia
    email = excluded.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-asociar Trigger (por seguridad)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
