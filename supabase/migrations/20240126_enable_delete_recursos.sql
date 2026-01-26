-- Drop previous policies to avoid conflicts if re-running
drop policy if exists "Authenticated delete own resources" on public.recursos;
drop policy if exists "Authenticated delete own files" on storage.objects;

-- Allow users to delete their own resources (Cast IDs to text to avoid uuid=text errors)
create policy "Authenticated delete own resources"
on public.recursos for delete
using ( auth.uid()::text = usuario_id::text );

-- Allow users to delete files from storage (bucket 'recursos')
create policy "Authenticated delete own files"
on storage.objects for delete
using ( bucket_id = 'recursos' and auth.uid()::text = owner_id::text );
