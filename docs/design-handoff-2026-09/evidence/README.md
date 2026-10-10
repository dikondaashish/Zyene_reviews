# Historical screenshot evidence

The September 2026 desktop/mobile screenshots were removed from the current
checkout during the October cleanup. The planning briefs, manifests, browser
inventory and wireframes remain in the parent directory; their acceptance
criteria are proposals, not proof of completion.

Recover an original image from baseline commit `7d45ba755ebccde5c6c10b274761645bff9d82be` with:

```bash
git show 7d45ba755ebccde5c6c10b274761645bff9d82be:docs/design-handoff-2026-09/evidence/about-desktop.png > /tmp/about-desktop.png
```

Use the corresponding filename for other screenshots. Capture fresh evidence
for any new implementation; these historical pictures do not certify it.
