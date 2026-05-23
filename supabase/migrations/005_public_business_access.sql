-- Public read access on businesses for anonymous review-flow pages (/r/[slug]).
-- Lets unauthenticated clients load business name, slug, and review-page settings.
-- Pair with 006 for review_platforms; write access remains restricted to members.

create policy "Allow public read access"
on "public"."businesses"
as permissive
for select
to public
using (true);
