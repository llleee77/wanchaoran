# AGENTS.md

## Repo shape
- Static site: plain HTML/CSS/JS (no build system, no dependencies)
- Entry points:
  - Root `index.html` auto-redirects to `my-page/index.html` (styled landing/redirect)
  - Main directory: `my-page/` contains all exercises and its own `index.html` (course index)
- Assets: `my-page/img/`, `my-page/cdn/`, fonts in `my-page/` (`iconfont.*` files) are used directly by pages

## Working in this repo
- Open files directly in browser - no server/build/test commands needed
- When adding new exercises, add the page under `my-page/` and link it from `my-page/index.html` (follow existing card pattern)
- Styles are split: some pages have inline styles, others use shared CSS like `style.css`, `layout004.css`, `svg004.css`, `html_basic.css`, etc. Reuse existing CSS patterns when editing nearby pages
- Chinese UI text; maintain existing naming/style conventions

## Gotchas
- There are duplicate/variant filenames (e.g. `CSS3004.HTML` vs typical lowercase) - preserve exact casing when linking
- Root and `my-page/` both have `index.html` with different designs; root is just a redirect
- `wcr_prompt.md` tracks historical prompts/models - don't modify unless explicitly asked
- `skills/` exists but appears unrelated to running these pages
