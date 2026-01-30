-- ¡LIMPIEZA DE FANTASMAS! 👻
-- Cuando borras usuarios del panel de Auth, sus perfiles 'publicos' se quedan huérfanos.
-- Si intentas registrarte con el mismo email, da error porque el perfil viejo sigue ahí.

-- 1. Borrar perfiles que no tienen usuario real
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. Asegurarnos de que la tabla profiles tenga la restricción correcta (opcional, pero sano)
-- Si hubiese duplicados de email, esto fallaría, pero el DELETE de arriba debería haberlos limpiado.
-- (No ejecutamos ALTER ahora para no complicar, el DELETE es la clave)

-- Ver cuantos quedaron (debería ser 0 o solo los que sí existen en Auth)
SELECT count(*) as perfiles_activos FROM public.profiles;
