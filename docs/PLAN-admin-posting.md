# Plan: web page for publishing posts (`/blog/admin`)

Status (2026-10-26): **code done and deployed** — `worker/index.ts`, `src/pages/admin.astro`,
`worker/worker.test.mjs` (`npm run test:worker`, 27 checks). Remaining: the dashboard setup in
item 4 (Access app + secrets), then the live test in item 5. Until the secrets exist the API
fails closed with "Access is not configured on the Worker."

Note: local `wrangler dev` does not pass variables named like *TOKEN*/*AUTH* to the Worker when run
by an AI agent, so test the API with `npm run test:worker` instead.

## Goal

A private page on the blog where SHK Chan pastes a Markdown article, fills in title / description /
category / keywords, clicks Publish, and the post goes live. No local git needed.

## Decisions (confirmed by user)

- Auth: **Cloudflare Access** (Zero Trust, free), allow only the user's email. No home-made password system.
- Deploy: the Worker **auto-deploys on push to GitHub** (Workers Builds), so committing the `.md` is enough.
- Storage: the post is saved as a normal file `src/content/posts/<slug>.md` in the GitHub repo,
  using the existing frontmatter contract (`src/content/config.ts`, `src/content/posts/_template.md`).
  The admin page is just another way to write that file.

## Flow

```
Browser /blog/admin  ──(Access login)──▶  POST /blog/api/posts  (Worker)
                                              │ validate + build .md
                                              ▼
                                  GitHub Contents API: PUT src/content/posts/<slug>.md
                                              ▼
                                  push triggers Workers Build → site live in ~1–2 min
```

## Work items

1. **Worker script** (the Worker currently serves static assets only)
   - Add `worker/index.ts`; in `wrangler.jsonc` set `"main": "worker/index.ts"` and
     `assets: { "directory": "./dist", "binding": "ASSETS", "run_worker_first": ["/blog/api/*"] }`.
     Check the installed wrangler (4.150.0) supports `run_worker_first` as an array; otherwise route
     inside the Worker and fall through to `env.ASSETS.fetch(request)`.
   - Everything not under `/blog/api/` → `env.ASSETS.fetch(request)` (must keep current behavior).
2. **API: `POST /blog/api/posts`**
   - Verify the `Cf-Access-Jwt-Assertion` header (JWT, RS256) against
     `https://<ACCESS_TEAM_DOMAIN>/cdn-cgi/access/certs`, check `aud == ACCESS_AUD` and the email.
     Defense in depth in case the Access app path is misconfigured. Reject otherwise (401).
   - Body JSON: `title, description, date, category, tags[], body, slug?, draft?`.
   - Validate same rules as the zod schema; slug `^[a-z0-9]+(-[a-z0-9]+)*$` (default: slugify title).
   - Refuse to overwrite an existing slug unless `overwrite: true` (GET the file first; PUT needs its `sha`).
   - Build frontmatter with every string JSON-quoted (safe YAML), tags as JSON array.
   - `PUT https://api.github.com/repos/SHKChan/shkchan/contents/src/content/posts/<slug>.md`
     with base64(UTF-8) content, message `Post: <title>`,
     committer `{ name: "SHK Chan", email: "<GitHub noreply address>" }` — **never the real name/email**
     (privacy rule, see memory `profile-readme-content`).
   - Return `{ url: "/blog/posts/<slug>", commit: <html_url> }`.
   - Optional `GET /blog/api/meta`: existing categories/tags for autocomplete — simpler: emit
     `/blog/meta.json` at build time from `getPosts()` and read it statically.
3. **Admin page** `src/pages/admin.astro` (static, `<meta name="robots" content="noindex">`, not linked in nav)
   - Fields: title, description, date (default today), category (input + datalist of existing),
     keywords (comma separated → chips), slug (auto from title, editable), draft checkbox,
     big Markdown textarea for pasting.
   - Live preview optional (v2). Publish button → fetch POST, show success with post link
     ("live in ~1–2 minutes") or the validation error.
   - Same pixel theme (`global.css`).
4. **Secrets / config** (user does these in the dashboard; give exact click paths)
   - GitHub fine-grained token: only repo `SHKChan/shkchan`, permission *Contents: Read and write*.
     Store as Worker secret `GITHUB_TOKEN` (dashboard → Worker `blog` → Settings → Variables and Secrets,
     or `npx wrangler secret put GITHUB_TOKEN`).
   - Vars: `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ALLOWED_EMAIL`.
   - Cloudflare Zero Trust → Access → Applications → Add self-hosted app:
     domain `www.vibe-game.com`, paths `blog/admin*` and `blog/api/*`, policy Allow → Emails → user's email.
     Copy the Application Audience (AUD) tag into `ACCESS_AUD`.
5. **Test**
   - Local: `astro build` + `wrangler dev`, call the API with a mocked JWT check disabled via a dev-only var.
   - Live: open `/blog/admin` in a private window → Access login shown; publish a `draft: true` test post,
     confirm the commit appears and the build succeeds, then delete it.

## Out of scope for v1

Image upload, editing/deleting existing posts from the page, scheduled publishing.
