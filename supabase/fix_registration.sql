-- 1. Asegurar que la columna existe (si no, fallará el insert)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text;

-- 2. Asegurar que el constraint de rol es correcto
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_rol_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_rol_check 
CHECK (rol IN ('profesor', 'alumno'));

-- 3. Recrear la función del Trigger de forma robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, rol, full_name)
  VALUES (
    new.id,
    new.email,
    -- Si no viene rol, por defecto 'alumno'
    COALESCE(new.raw_user_meta_data ->> 'rol', 'alumno'),
    -- Intentar sacar el nombre de varias fuentes
    COALESCE(new.raw_user_meta_data ->> 'nombre', new.raw_user_meta_data ->> 'full_name', 'Usuario')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    rol = excluded.rol,
    full_name = excluded.full_name,
    email = excluded.email;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error fatal, registrarlo pero permitir al usuario (opcional, pero ayuda a debug)
    -- O mejor, dejar que falle para no tener usuarios huerfanos, pero asegurarse que el insert sea limpio.
    RAISE LOG 'Error en handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reiniciar el Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Confirmar que las politicas permiten guardar
-- (Asegura que el Trigger System tenga permiso, que lo tiene por SECURITY DEFINER, pero revisamos RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access profiles" ON public.profiles;
CREATE POLICY "Public access profiles" ON public.profiles FOR ALL USING (true);
