-- Fresh installs must not retain the known key seeded by historical migrations.
-- Uses the same guarded, atomic rotation as operators; no key enters source.
SELECT public.rotate_oauth_encryption_key();
