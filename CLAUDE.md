# Kovin — working notes for Claude Code

Before designing or building anything in this repository, read
[PRINCIPLES.md](PRINCIPLES.md). It is not background reading — it is the
operating system this whole codebase is built against, and every new page or
feature should be checked against its ten principles before it's considered
done.

## Stack

Static multi-page site, no build step, no JS framework. Each top-level
`.html` file is self-contained (own `<style>`, own `<script>`). Shared logic
lives in standalone JS files loaded via `<script src="...">`:

- `kovin-memory.js` — the cross-page decision/event log (`window.KovinMemory`)
- `knowledge-graph.js` — the rule-based recommendation reasoning engine (`window.KovinGraph`)
- `kovin-trust.js` — a read-only aggregation over Memory + Family data (`window.KovinTrust`)

Design tokens (colors, fonts) are duplicated at the top of every page's
`<style>` block rather than centralized — keep new pages consistent with the
existing palette (`--ink`, `--paper`, `--copper`, etc.) and type pairing
(Cormorant Garamond display / Inter body).

## Before shipping a new page

1. Does it pass the ten principles in `PRINCIPLES.md`? In particular: does
   every recommendation explain a trade-off (III), and is every recommendation
   traceable to a stated reason (X)?
2. Syntax-check every inline `<script>` block before committing — extract
   each via regex and run `new Function()` on it. This has caught real
   shipped bugs more than once in this repo's history.
3. Add the new page (and any new shared `.js` file) to `sw.js`'s
   `APP_SHELL` array and bump `CACHE_VERSION`.
4. Link it from `index.html`'s footer so it's discoverable.
5. Verify live via the preview tool, not just by reading the code.
