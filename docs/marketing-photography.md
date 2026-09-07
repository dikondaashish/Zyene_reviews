# Marketing photography

The restaurant, café, and home-services replacements are photographs sourced from Pexels on September 7, 2026. They illustrate everyday business settings; the people pictured are not identified as Zyene customers, team members, or testimonial authors.

| Local asset | Photographer | Original photograph |
| --- | --- | --- |
| `public/marketing/home/cafe-service.webp` | Mizuno K | [A Smiling Woman Serving a Customer](https://www.pexels.com/photo/a-smiling-woman-serving-a-customer-13736419/) |
| `public/marketing/home/cafe-conversation.webp` | Mike Jones | [Man and Woman Standing at the Counter](https://www.pexels.com/photo/man-and-woman-standing-at-the-counter-9050571/) |
| `public/images/industries/restaurant-guests.webp` | ELEVATE | [Group of People Sitting on Dining Table](https://www.pexels.com/photo/group-of-people-sitting-on-dining-table-1267321/) |
| `public/images/industries/window-installation.webp` | Ksenia Chernaya | [Handyman Installing Window Frame with Drill in House](https://www.pexels.com/photo/handyman-installing-window-frame-with-drill-in-house-5691544/) |

## License and treatment

All four source pages identify the photographs as free to use under the [Pexels license](https://www.pexels.com/license/), which permits website and marketing use and modification. It does not permit implying endorsement by the people or brands pictured. These photographs are used as contextual imagery; testimonial author portraits remain initials.

The photos are stored locally and converted to WebP without generative editing or retouching. Original colors and composition are retained; CSS object positioning adapts the visible crop to each layout. New filenames prevent the previous generated images from remaining in image-optimization caches. Next Image supplies responsive sizes and lazy loading. Only above-the-fold images receive priority.

The shared industry image mapping covers the homepage, industry menu, industry directory, landing heroes, and supporting stories. Café replacements also cover feature, resource, tools, and How It Works imagery. Existing composite case-study labelling remains intact.

## Verification

Typecheck, file-size checks, and ESLint passed. All 1,171 tests in 153 files passed in the synchronized clean preview workspace. The full test run caught an earlier change to the illustrative-workflow note; its expected wording was restored. The source SEO audit completed with only the existing intentionally empty alternative text on navigation thumbnails.

Browser inspection covered the desktop café hero, second café story, restaurant and home-services gallery cards, the restaurant landing hero, and the home-services landing photo at 390px. The checked pages had no horizontal overflow, and the replacement images loaded successfully. No deployment or new production build was run for this photography update.
