-- Broadcast INSERTs on deal threads to subscribed clients (RLS still applies).
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'thread_messages'
  ) then
    alter publication supabase_realtime add table public.thread_messages;
  end if;
end $$;
