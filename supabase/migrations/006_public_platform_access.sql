-- Allow public read access to review_platforms
-- Required to fetch the Google Review URL on the public review page.

create policy "Allow public read access"
on "public"."review_platforms"
as permissive
for select
to public
using (true);
