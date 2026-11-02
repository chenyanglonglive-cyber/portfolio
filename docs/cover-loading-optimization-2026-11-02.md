# Cover Loading Optimization

## Changes

- Public `/uploads/cover_*.(jpg|jpeg|png|webp)` files are served by Nginx from `/var/www/strapi/public`, with a 30-day cache lifetime. Other uploads retain their existing routing.
- Cover access timing is logged to `/var/log/nginx/cover-access.log`; `upstream_time=-` confirms static delivery.
- Work cards show a loading state and allow retry after image errors.
- The works page preloads the first four covers and declares sizes matching its one/two/three/four-column grid.
- Next.js image configuration includes a 480px candidate and a one-day minimum cache TTL.
- Public hash-named covers use `/cover-media/` via a restricted external rewrite with a 30-day CDN cache, bypassing the observed image optimizer fallback. These covers retain their uploaded resolution; other images still use Next.js optimization and responsive sizing.

## Deployment

Production project: `portfolio` (`prj_UFLOyKGPGPOZ1vcePPBwvXh2YSuV`). The root workspace Vercel link points to a different project; do not deploy using that link.

Frontend release reuses the production deployment's source file hashes and replaces only `WorkCard.tsx`, `WorksFilterGrid.tsx`, and `next.config.ts`.

## Nginx Recovery

The installation script is `scripts/optimize-cover-nginx.py`. It backs up the Strapi site config before installation and rolls back automatically if validation or reload fails.

Installed backup: `/etc/nginx/sites-available/strapi.backup-20261102T022145Z`.

To revert: restore that file to `/etc/nginx/sites-available/strapi`, remove `/etc/nginx/conf.d/cover-timing.conf`, run `nginx -t`, then reload Nginx. No Strapi restart or server build is needed.

Cache policy assumes cover filenames change when image contents change. Existing cached fallback responses may persist until their edge/browser cache refreshes.

## Validation

- TypeScript check passed.
- Nginx configuration test passed; public cover response includes `X-Cover-Cache: nginx-static` and `Cache-Control: max-age=2592000`.
- A resume PDF remains on its original route.
- Targeted ESLint finds a pre-existing `react-hooks/set-state-in-effect` violation in WorkCard's duration synchronization effect.
- Production deployment `dpl_4FKf3f6fVZx97MrH3n4c3LnZNEYF` is READY and assigned to both public domains.
- The dedicated cover proxy returned 200 in 4.75s on MISS and 1.09s on HIT for the sampled 108KB cover; cache lifetime is 30 days. This is one sample, not a guarantee for every network or cache region.
- In-app browser reconnection failed during final verification; HTTP responses and rendered HTML were checked instead.

## Follow-up In-App Browser Test

The follow-up connected to the user's existing works tab successfully. Reload returned after 2247ms; at the observation 9124ms after reload, all 12 initially mounted covers were complete and no browser errors were recorded. These are automation wall-clock observations, not Navigation Timing or individual resource timings (the browser's read-only evaluation scope does not expose Performance APIs).

Video detail opened and playback was confirmed (`paused=false`, `readyState=3`, `currentTime>0`). Video/image category and AI tag filtering worked; the video duration updated from its placeholder to the actual duration. A later observation again showed all 12 video covers complete.

Independent transport samples during this browser test:

| Segment | Measurement |
| --- | --- |
| ECS-local Strapi videos API (one item) | 200, 21ms total |
| Cover proxy, warmed sample | 200, cache HIT, 731ms TTFB, 1494ms total |
| Video first 256KiB | 206, 2225ms TTFB, 7471ms total |
| Public works request, one attempt | connection timeout at 20s |
| Nginx cold cover transfers | sampled request times 42.481s and 60.004s |

Functional checks passed for the sampled flows. Performance acceptance did not pass because cold media transfers and public connectivity remain intermittent. No further production deployment was triggered by this follow-up: the user's instruction makes a new release conditional on passing testing. Vercel confirms the existing production deployment `dpl_4FKf3f6fVZx97MrH3n4c3LnZNEYF` is READY on both public domains.

Screenshot: `output/playwright/works-browser-check.png`.

## Release Authorization

After reviewing the follow-up test results, the user explicitly requested deployment of this version and a Git push with update records. The remaining cold-origin performance issue is documented above and is not represented as resolved.
