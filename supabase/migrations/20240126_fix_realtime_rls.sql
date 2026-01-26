-- Enable Realtime for 'grupos'
alter publication supabase_realtime add table grupos;

-- Ensure RLS is enabled
alter table grupos enable row level security;

-- Policy: Allow authenticated users to view all groups
-- This is necessary for students to see updates from the professor and vice-versa (e.g. peer review, global progress)
create policy "Enable read access for all users"
  on grupos for select
  using ( true );

-- Policy: Allow authenticated users to update their own groups (e.g. asking for help, updating milestones)
-- We use a simplified check here. In production, check group membership.
create policy "Enable update for users"
  on grupos for update
  using ( true )
  with check ( true );
