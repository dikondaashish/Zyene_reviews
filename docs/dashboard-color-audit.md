# App dashboard palette

The user requested OptiMonk's dashboard colors across the Zyene app, with existing layouts and both light and dark modes retained.

## Reference audit

Measured computed styles in the signed-in Chrome session on September 28, 2026:

- https://app.optimonk.com/273634/dashboard
- https://app.optimonk.com/273634/campaigns
- https://app.optimonk.com/273634/analytics (including the date filter menu)

| Role | Measured color |
| --- | --- |
| Page canvas | `#f9fafb` |
| Panels, sidebar, popovers | `#ffffff` |
| Headings | `#23262a` |
| Body text | `#272727` |
| Secondary labels | `#505763` |
| Muted icons and metadata | `#8f97a4` |
| Muted neutral token | `#6c757d` |
| Disabled text | `#b9bec6` |
| Primary action | `#ed5a29` |
| Selected navigation background | `#feefea` |
| Dark orange selected text | `#ba3a10` |
| Neutral control background | `#f1f2f4` |
| Muted panel background | `#f7f7f8` |
| Dividers | `#e3e5e8` / `#e5e7eb` |
| Input borders | `#d5d8dd` |
| Success token | `#28a745` |
| Danger token | `#dc3545` |
| Warning token | `#ffc107` |
| Info token | `#17a2b8` |

The last four values were read from OptiMonk's document-level CSS variables; the account did not expose populated charts or every status state. Main charts use orange. White text on the reference orange does not reach WCAG AA for small text; the palette preserves the requested reference pairing. Small orange links use the measured darker orange, and body metadata uses the reference's darker gray token for better contrast.

## Application

`src/app/dashboard-colors.css` defines the app overrides. The root selector detects a dashboard or onboarding marker, so body-mounted dialogs, tooltips, mobile navigation, and notifications inherit the same tokens. Marketing, auth, and public review routes keep their existing palette. Customer branding and platform logos are independent from app chrome.

Dark mode is a Zyene adaptation, not an observed OptiMonk theme: charcoal backgrounds, neutral gray borders, orange actions, peach selections, and lighter text/status colors. Existing typography, spacing, component shapes, and workflows stay intact.

Dashboard panels with literal forest green, blue, beige, or salmon colors now use shared surface/action/status tokens. Printable QR artifacts and customer branding previews retain their output colors.

### Requested exceptions

Smart Insights and Your Customer Portal retain their original colors at the user's request. Smart Insights uses its original warm light/dark neutrals and orange accents. The portal keeps its forest-green surface, blue NFC banner, white text, and coral QR action. Their loading states and QR/examples dialogs use the original local tokens; the rest of the app continues using the OptiMonk palette.

### Sidebar reference

The sidebar follows the reference's 76px compact rail, 72px logo area, 20px outline icons, 54px navigation rows, 4px row gaps, 12px selection corners, and Funnel Sans labels at 10px/16px with weight 500. Neutral navigation uses the measured `#8f97a4`; the selected item uses primary orange on peach. Zyene retains its own logo, routes, and access rules.

An added toggle expands the rail to 240px with 14px labels. The existing sidebar cookie now restores that preference on reload, and viewport changes no longer force it open. Compact settings open in a keyboard-accessible flyout; expanded/mobile settings use an inline disclosure. The mobile drawer closes after selecting a destination. The font is scoped to the sidebar and its settings flyout.
