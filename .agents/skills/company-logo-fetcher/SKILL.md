---
name: company-logo-fetcher
description: Use whenever the project needs a company/brand logo — for partner lists, "integrations", "as seen on", client showcases, favicons, or any UI element referencing an external company. Fetches high-quality logos via Google's favicon service instead of manually sourcing, downloading, or hardcoding logo image files.
---

# Company Logo Fetcher

When code needs to display a logo for any external company/brand, construct the logo URL using Google's favicon service instead of searching for or downloading a separate image asset:

```
https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://<company-domain>&size=256
```

## Rules

1. Replace `<company-domain>` with the company's root domain (e.g. `stripe.com`, `github.com`, `zyene.com`). No need to know or guess an exact CDN/logo path — this works for virtually any domain.
2. Always set `size=256` (max practical size from this endpoint) for the highest resolution icon available, instead of the default low-res `size=64`. Actual returned size depends on what the site's favicon offers, but requesting a larger size avoids unnecessary downscaling.
3. Use this as the `src` for `<img>` tags, background-image CSS, or wherever a logo/icon reference is needed in React/React Native/HTML components.
4. Do not fabricate or manually download logo files from other sources (Clearbit, Brandfetch, manual Google Images, etc.) unless this endpoint fails or explicitly can't render.
5. If the fetched icon looks broken, missing, or is only a generic globe icon, note that to the user rather than silently substituting a different logo source.

## Example

```html
<img src="https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://stripe.com&size=256" alt="Stripe logo" />
```
