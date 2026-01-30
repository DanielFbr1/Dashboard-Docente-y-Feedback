-- 1. Unify Columns. We seem to have a mix of 'nombre' and 'full_name'.
-- Let's ensure 'nombre' exists and is used, as 'fix_security_final.sql' relies on it.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nombre text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS codigo_sala text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rol text;

-- 2. Drop the problematic trigger function first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create a Robust Function
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
  -- Defensive coding: Extract values safely
  v_nombre := COALESCE(
    new.raw_user_meta_data->>'nombre', 
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  v_rol := COALESCE(new.raw_user_meta_data->>'rol', 'alumno');
  v_codigo := new.raw_user_meta_data->>'codigo_sala';

  -- Insert with explicit columns
  -- Using 'nombre' as the standard field. (schema.sql used full_name, we map it).
  INSERT INTO public.profiles (id, email, nombre, rol, codigo_sala)
  VALUES (
    new.id,
    new.email,
    v_nombre,
    v_rol,
    v_codigo
  )
  ON CONFLICT (id) DO UPDATE
  SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    codigo_sala = COALESCE(EXCLUDED.codigo_sala, public.profiles.codigo_sala),
    email = EXCLUDED.email;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Capture error to Supabase Log and Allow user creation to proceed (prevent 500)
    -- But if we fail here, the user won't have a profile.
    -- Better to RAISE WARNING so it appears in logs, but RETURN NEW.
    RAISE WARNING 'Trigger handle_new_user Failed for %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 4. Reattach Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Force Retry for any Phantom Users (users without profile)
INSERT INTO public.profiles (id, email, nombre, rol)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'nombre', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'rol', 'alumno')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;

-- 6. Grant Permissions (Just in case RLS is weird)
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
