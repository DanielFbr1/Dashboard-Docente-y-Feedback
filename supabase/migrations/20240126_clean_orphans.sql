-- Clean up orphan resources (those without usuario_id)
-- These are the files uploaded before the authentication fix
delete from public.recursos
where usuario_id is null;
