-- Public read access on review_platforms for the anonymous review-flow UI.
-- Exposes connected platform metadata (e.g. Google review URL) on /r/[slug].
-- INSERT/UPDATE/DELETE for platforms are added in 007 for authenticated org members.

create policy "Allow public read access"
on "public"."review_platforms"
as permissive
for select
to public
using (true);
