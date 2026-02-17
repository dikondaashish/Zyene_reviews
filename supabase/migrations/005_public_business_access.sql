-- Allow public read access to businesses table
-- This is required for the public review flow pages (e.g. /r/[slug]) to work for anonymous users.

create policy "Allow public read access"
on "public"."businesses"
as permissive
for select
to public
using (true);
