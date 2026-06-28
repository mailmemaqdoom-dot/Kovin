# Kovin Platform Audit — Issue Report

Date: 2026-06-28. Triggered by a live bug report: clicking "Find What
Fits You" and "Tell us what's going on in your life" on
`kovin.pages.dev` produced `ERR_FAILED`.

## 1. The bug, root cause, and fix

**Symptom.** Internal navigation from `index.html` to `selector.html`
or `lifemode.html` failed with `ERR_FAILED` in the browser, while
`curl` against the same URLs always returned 200.

**Root cause.** Cloudflare Pages 308-redirects every `*.html` URL to its
clean-URL equivalent (`lifemode.html` → `/lifemode`). This is Cloudflare's
default static-site behavior, not a misconfiguration — no `_redirects`
or `_headers` file exists in this repo overriding it. `sw.js`'s
navigation handler called `fetch(req)` and passed the resulting
`Response` straight to `respondWith()`. Once `fetch()` follows that
redirect, `response.redirected` is `true` — and Chrome **hard-rejects**
`respondWith()` being given a redirected `Response` for a
navigation-mode `FetchEvent`. That rejection is what surfaces to the
user as `ERR_FAILED`.

This is why it looked the way it did:
- **Not specific to one link.** It hit *every* internal `.html` link,
  because every one of them gets the same Cloudflare redirect.
- **`curl` always looked fine.** `curl` doesn't run a service worker;
  the bug only exists inside the browser's fetch-interception layer.
- **A hard refresh didn't fix it.** Hard refresh clears the HTTP cache,
  not an already-registered, already-controlling service worker.
- **It had been silently latent since the original PWA build** — it
  only manifests once a service worker is actually installed *and*
  controlling a tab, which depends on each visitor's own browsing
  history with the site.

**Fix.** When `res.redirected` is true, rebuild a plain `Response` from
the same body/status/headers before returning it — the `redirected`
flag is only ever set by the fetch algorithm itself, never by the
`Response` constructor, so this clears it without altering the content
delivered. Shipped in commit `742981f`, cache bumped to `kovin-v9`.

**Verified live, end-to-end, with the actual failure condition
reproduced:** registered the service worker, confirmed it reached
`activated` and took control of the tab (`navigator.serviceWorker
.controller` set — the exact precondition for the bug), then clicked
the real "Find What Fits You" and life-mode links. Both now land on the
correct page with zero console errors. Confirmed the fix is live on
`kovin.pages.dev` via `curl` (response now contains `kovin-v9` and
`res.redirected`).

## 2. A second, related bug found and fixed earlier in this session

`sw.js`'s install step used `cache.addAll(APP_SHELL)`, which is atomic —
if any single one of the ~26 precached files had a momentary hiccup, the
*entire* install would reject, leaving the browser stuck on whichever
service worker it had before and never picking up new deploys. Fixed by
caching each file independently (`cache.add()` + `.catch()` per URL),
so one bad entry can no longer block the rest. Shipped in commit
`af3eff6`.

## 3. Full routing & asset audit (Phase 1/4/11)

Performed via static analysis (grep across all 14 pages for every
internal `href`, every `window.location.href` assignment, every
referenced local asset) plus a live crawl of all 14 pages checking for
console errors with the (now-fixed) service worker active.

- **Internal page links** (`href="*.html"`): all resolve to real files.
  No dead links found.
- **JS-driven navigation** (`window.location.href = ...`): two found
  (`lifemode.html` → `index.html`, `selector.html` →
  `index.html#cart`) — both valid.
- **Local asset references** (icons, `Photos/*.png`, shared `.js`
  files): every path checked against disk — all present.
- **`manifest.json`**: every icon path and every shortcut target page
  exists.
- **`sw.js`'s `APP_SHELL`**: every one of its ~26 entries corresponds
  to a real file.
- **Live console check, all 14 pages, service worker active**: zero
  console errors on every single page.

**No additional broken routes, missing assets, or dead links were
found.**

## 4. Deployment audit (Phase 3)

- `git status`: working tree clean, nothing uncommitted.
- `master` and `main` branches: identical, both fully pushed, both
  matching their respective `origin` refs.
- No `_redirects` or `_headers` file exists — Cloudflare's clean-URL
  redirect is its unmodified default, which the service worker fix now
  correctly accommodates rather than fights.
- Production (`kovin.pages.dev`) confirmed serving the latest commit
  for every page, the new `kovin-interactions.js`, and the fixed
  `sw.js` (`kovin-v9`).

## 5. Interaction engine, motion, performance (Phases 5–9)

These were addressed in the immediately preceding turn — see
[INTERACTION_AUDIT.md](INTERACTION_AUDIT.md) for the full phase-by-phase
breakdown (centralized motion engine, spring-physics drag release,
shared-element product image transition, adaptive nav, swipe-back,
touch feedback, GPU-only transforms). That work was verified live and
deployed before this routing bug was reported, and is unaffected by
the fixes in this report — this report's fixes are purely at the
service-worker/navigation layer, with zero changes to design, layout,
colors, typography, or business logic in this pass, per this turn's
explicit constraints.

## 6. Remaining risks

- **No `_redirects`/`_headers` file exists to make the clean-URL
  behavior explicit.** It currently works because the service worker
  now tolerates it, not because it's been pinned down in deployment
  config. If Cloudflare's default behavior ever changes, or if a
  non-service-worker code path is added that makes the same
  `fetch().then(respondWith)` mistake, this class of bug could
  resurface elsewhere. Recommendation: if this matters enough to make
  bulletproof, a small follow-up could add an explicit `_redirects`
  file pinning the exact redirect rules Cloudflare currently applies
  implicitly — but that's a deployment-config decision, not something
  to change silently.
- **Users who visited before this fix may still be carrying the
  broken, already-registered service worker** until it next checks for
  an update (browsers check periodically, not instantly). Anyone still
  affected can force it by clearing site data once (DevTools →
  Application → Clear site data) or visiting in a private window.
- Everything else audited in this pass (routes, assets, manifest,
  console health, deployment parity) came back clean — no further
  known issues at this time.
