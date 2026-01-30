-- 1. Ensure ALL columns exist (User error shows 'email' was missing!)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nombre text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rol text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS codigo_sala text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text; -- Keep for compatibility if used elsewhere

-- 2. Drop the trigger to rebuild
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create Robust Trigger (handles both 'nombre' and 'full_name')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_nombre text;
  v_rol text;
  v_codigo text;
BEGIN
  -- Extract values
  v_nombre := COALESCE(
    new.raw_user_meta_data->>'nombre', 
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  v_rol := COALESCE(new.raw_user_meta_data->>'rol', 'alumno');
  v_codigo := new.raw_user_meta_data->>'codigo_sala';

  -- Insert
  INSERT INTO public.profiles (id, email, nombre, rol, codigo_sala)
  VALUES (
    new.id,
    new.email, -- This column must exist now!
    v_nombre,
    v_rol,
    v_codigo
  )
  ON CONFLICT (id) DO UPDATE
  SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    email = EXCLUDED.email,
    codigo_sala = COALESCE(EXCLUDED.codigo_sala, public.profiles.codigo_sala);

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Trigger Failed: %', SQLERRM;
    RETURN new;
END;
$$;

-- 4. Reattach Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Backfill any missing profiles again
INSERT INTO public.profiles (id, email, nombre, rol)
SELECT id, email, split_part(email, '@', 1), 'alumno'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;
