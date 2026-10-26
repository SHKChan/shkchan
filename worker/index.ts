// Cloudflare Worker for www.vibe-game.com/blog*.
// Static files are served by the assets binding; only /blog/api/* runs this code
// (see run_worker_first in wrangler.jsonc).
//
// POST /blog/api/posts  -> validate a post and commit it as src/content/posts/<slug>.md.
//                          The push triggers Workers Builds, so the post goes live on its own.
// GET  /blog/api/whoami -> the signed-in Access email (lets the admin page check login).
//
// /blog/admin* and /blog/api/* must sit behind a Cloudflare Access application. This code also
// verifies the Access JWT itself, so a misconfigured Access path still can't publish.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  // secrets
  GITHUB_TOKEN: string;
  ACCESS_TEAM_DOMAIN: string; // e.g. "myteam.cloudflareaccess.com"
  ACCESS_AUD: string; // Access application AUD tag
  ALLOWED_EMAIL: string;
  // vars
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  COMMITTER_NAME: string;
  COMMITTER_EMAIL: string;
  DEV_SKIP_AUTH?: string; // local `wrangler dev` only; ignored unless the host is localhost
}

const POSTS_DIR = 'src/content/posts';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/blog/api/')) return env.ASSETS.fetch(request);

    try {
      const email = await authenticate(request, env);

      if (url.pathname === '/blog/api/whoami' && request.method === 'GET') {
        return json({ email });
      }
      if (url.pathname === '/blog/api/posts' && request.method === 'POST') {
        if (!sameOrigin(request)) throw new HttpError(403, 'Cross-origin request refused.');
        if (!request.headers.get('content-type')?.includes('application/json')) {
          throw new HttpError(415, 'Expected application/json.');
        }
        return json(await publish(await request.json(), env));
      }
      throw new HttpError(404, 'Not found.');
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: 'Unexpected server error.' }, 500);
    }
  },
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return origin === null || origin === new URL(request.url).origin;
}

// ---------------------------------------------------------------- auth

interface Jwk { kid: string; kty: string; n: string; e: string; alg?: string }
let certCache: { keys: Jwk[]; expires: number } | null = null;

async function authenticate(request: Request, env: Env): Promise<string> {
  const host = new URL(request.url).hostname;
  if (env.DEV_SKIP_AUTH === '1' && (host === 'localhost' || host === '127.0.0.1')) return 'dev@localhost';

  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ALLOWED_EMAIL) {
    throw new HttpError(500, 'Access is not configured on the Worker.');
  }
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) throw new HttpError(401, 'Not signed in.');

  const [h, p, s] = token.split('.');
  if (!h || !p || !s) throw new HttpError(401, 'Malformed token.');
  let header: any, payload: any;
  try {
    header = JSON.parse(b64urlDecodeText(h));
    payload = JSON.parse(b64urlDecodeText(p));
  } catch {
    throw new HttpError(401, 'Malformed token.');
  }

  const keys = await accessKeys(env.ACCESS_TEAM_DOMAIN);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk || header.alg !== 'RS256') throw new HttpError(401, 'Unknown signing key.');
  const key = await crypto.subtle.importKey(
    'jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'],
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key, b64urlDecode(s), new TextEncoder().encode(`${h}.${p}`),
  );
  if (!valid) throw new HttpError(401, 'Bad token signature.');

  const now = Math.floor(Date.now() / 1000);
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (typeof payload.exp !== 'number' || payload.exp < now) throw new HttpError(401, 'Session expired.');
  if (!aud.includes(env.ACCESS_AUD)) throw new HttpError(401, 'Wrong audience.');
  if (payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) throw new HttpError(401, 'Wrong issuer.');
  if (String(payload.email ?? '').toLowerCase() !== env.ALLOWED_EMAIL.toLowerCase()) {
    throw new HttpError(403, 'This account may not publish.');
  }
  return payload.email;
}

async function accessKeys(team: string): Promise<Jwk[]> {
  if (certCache && certCache.expires > Date.now()) return certCache.keys;
  const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new HttpError(502, 'Could not load Access certificates.');
  const { keys } = (await res.json()) as { keys: Jwk[] };
  certCache = { keys, expires: Date.now() + 60 * 60 * 1000 };
  return keys;
}

function b64urlDecode(value: string): Uint8Array {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
const b64urlDecodeText = (value: string) => new TextDecoder().decode(b64urlDecode(value));

function b64encodeUtf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

// ---------------------------------------------------------------- publish

interface PostInput {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  body: string;
  slug: string;
  draft: boolean;
  overwrite: boolean;
  dryRun: boolean;
}

function line(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, `${field} is required.`);
  const v = value.trim();
  if (v.length > max) throw new HttpError(400, `${field} is longer than ${max} characters.`);
  if (/[\r\n]/.test(v)) throw new HttpError(400, `${field} must be a single line.`);
  return v;
}

function validate(raw: any): PostInput {
  if (!raw || typeof raw !== 'object') throw new HttpError(400, 'Invalid request body.');
  const title = line(raw.title, 'Title', 200);
  const description = line(raw.description, 'Description', 300);
  const category = line(raw.category, 'Category', 50);

  const date = line(raw.date, 'Date', 10);
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) throw new HttpError(400, 'Date must be YYYY-MM-DD.');

  const rawTags = raw.tags ?? [];
  if (!Array.isArray(rawTags) || rawTags.length > 20) throw new HttpError(400, 'Keywords must be a list of at most 20.');
  const tags = [...new Set(rawTags.map((t: unknown) => line(t, 'Keyword', 40)))];

  if (typeof raw.body !== 'string' || !raw.body.trim()) throw new HttpError(400, 'Article body is required.');
  const body = raw.body.replace(/\r\n/g, '\n').trim();
  if (body.length > 400_000) throw new HttpError(400, 'Article body is too large.');
  if (/^---\s*$/m.test(body.split('\n')[0] ?? '')) {
    throw new HttpError(400, 'Paste the article without its own frontmatter (the --- block).');
  }

  const slug = line(raw.slug, 'URL slug', 80);
  if (!SLUG_RE.test(slug)) throw new HttpError(400, 'URL slug may only use a-z, 0-9 and single dashes.');

  return {
    title, description, date, category, tags, body, slug,
    draft: raw.draft === true, overwrite: raw.overwrite === true, dryRun: raw.dryRun === true,
  };
}

function toMarkdown(post: PostInput): string {
  const q = (s: string) => JSON.stringify(s); // JSON strings are valid double-quoted YAML
  const lines = [
    '---',
    `title: ${q(post.title)}`,
    `description: ${q(post.description)}`,
    `date: ${post.date}`,
    `category: ${q(post.category)}`,
    `tags: [${post.tags.map(q).join(', ')}]`,
  ];
  if (post.draft) lines.push('draft: true');
  lines.push('---', '', post.body, '');
  return lines.join('\n');
}

async function github(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'shk-blog-admin',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
    },
  });
}

async function publish(raw: unknown, env: Env) {
  const post = validate(raw);
  const markdown = toMarkdown(post);
  if (post.dryRun) return { ok: true, dryRun: true, markdown };

  if (!env.GITHUB_TOKEN) throw new HttpError(500, 'GITHUB_TOKEN is not configured on the Worker.');
  const path = `${POSTS_DIR}/${post.slug}.md`;

  const existing = await github(env, `contents/${path}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`);
  let sha: string | undefined;
  if (existing.ok) {
    if (!post.overwrite) throw new HttpError(409, `A post at /blog/posts/${post.slug} already exists.`);
    sha = ((await existing.json()) as { sha: string }).sha;
  } else if (existing.status !== 404) {
    throw new HttpError(502, `GitHub lookup failed (${existing.status}).`);
  }

  const who = { name: env.COMMITTER_NAME, email: env.COMMITTER_EMAIL };
  const res = await github(env, `contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `${sha ? 'Update' : 'Post'}: ${post.title}`,
      content: b64encodeUtf8(markdown),
      branch: env.GITHUB_BRANCH,
      committer: who,
      author: who,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const detail = ((await res.json().catch(() => ({}))) as { message?: string }).message ?? '';
    throw new HttpError(502, `GitHub commit failed (${res.status}) ${detail}`.trim());
  }
  const data = (await res.json()) as { commit: { html_url: string } };
  return { ok: true, url: `/blog/posts/${post.slug}`, commit: data.commit.html_url, draft: post.draft };
}
