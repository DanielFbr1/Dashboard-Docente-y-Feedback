-- Add configuracion column to grupos table if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'grupos' and column_name = 'configuracion') then
        alter table public.grupos 
        add column configuracion jsonb default '{"voz_activada": true, "microfono_activado": true}'::jsonb;
    end if;
end $$;
