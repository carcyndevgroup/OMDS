grant select, insert, update, delete
on public.message_connections,
   public.message_threads,
   public.message_participants,
   public.messages,
   public.message_attachments
to authenticated, service_role;
