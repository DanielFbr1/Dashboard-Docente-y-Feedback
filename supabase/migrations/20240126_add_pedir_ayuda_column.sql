-- Add pedir_ayuda column if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'grupos' and column_name = 'pedir_ayuda') then
        alter table grupos add column pedir_ayuda boolean default false;
    end if;
end $$;
