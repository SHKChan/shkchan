// Run with `npm run test:worker` (bundles worker/index.ts, then runs these checks with GitHub and Access mocked).
import worker from '../.wrangler/test/worker.mjs';
import { webcrypto as wc } from 'node:crypto';

const results = [];
const check = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'} ${name} ${cond ? '' : extra}`);

// ---- Access keys + JWT signer
const TEAM = 'shk.cloudflareaccess.com', AUD = 'aud-tag-123', EMAIL = 'owner@example.com';
const kp = await wc.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const pub = await wc.subtle.exportKey('jwk', kp.publicKey);
const b64u = (buf) => Buffer.from(buf).toString('base64url');
async function jwt(payload, kid = 'k1') {
  const h = b64u(JSON.stringify({ alg: 'RS256', kid })), p = b64u(JSON.stringify(payload));
  const sig = await wc.subtle.sign('RSASSA-PKCS1-v1_5', kp.privateKey, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64u(sig)}`;
}
const now = Math.floor(Date.now() / 1000);
const good = { aud: [AUD], email: EMAIL, exp: now + 600, iss: `https://${TEAM}` };

// ---- fake GitHub + certs
const gh = { files: new Map(), puts: [] };
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (url === `https://${TEAM}/cdn-cgi/access/certs`) return Response.json({ keys: [{ ...pub, kid: 'k1' }] });
  const m = url.match(/^https:\/\/api\.github\.com\/repos\/SHKChan\/shkchan\/contents\/(.+?)(\?.*)?$/);
  if (m) {
    if (init.headers.authorization !== 'Bearer ghp_test') return Response.json({ message: 'Bad credentials' }, { status: 401 });
    const path = m[1];
    if (!init.method || init.method === 'GET') return gh.files.has(path) ? Response.json({ sha: 'sha-old' }) : Response.json({}, { status: 404 });
    const body = JSON.parse(init.body);
    gh.puts.push({ path, body });
    gh.files.set(path, body);
    return Response.json({ commit: { html_url: 'https://github.com/SHKChan/shkchan/commit/abc' } }, { status: 201 });
  }
  throw new Error('unexpected fetch ' + url);
};

const env = {
  ASSETS: { fetch: async () => new Response('static', { status: 200 }) },
  GITHUB_TOKEN: 'ghp_test', ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ALLOWED_EMAIL: EMAIL,
  GITHUB_REPO: 'SHKChan/shkchan', GITHUB_BRANCH: 'main', COMMITTER_NAME: 'SHK Chan',
  COMMITTER_EMAIL: '42442323+SHKChan@users.noreply.github.com',
};
const ORIGIN = 'https://www.vibe-game.com';
async function call(path, { method = 'GET', body, token, origin = ORIGIN, e = env, ct = 'application/json' } = {}) {
  const headers = {};
  if (token) headers['cf-access-jwt-assertion'] = token;
  if (body !== undefined) headers['content-type'] = ct;
  if (origin) headers.origin = origin;
  const res = await worker.fetch(new Request(ORIGIN + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }), e);
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}
const post = { title: 'Tricky "quotes": yes', description: 'Line with: colon & #hash', category: 'Computer Vision', date: '2026-10-26', tags: ['C++', 'OpenCV', 'C++'], slug: 'tricky-post', body: '## Hi\r\n\r\nBody with unicode: café ✓' };
const T = await jwt(good);
const P = (body, extra = {}) => call('/blog/api/posts', { method: 'POST', token: T, body, ...extra });

let r;
r = await call('/blog/'); check('static passthrough', r.status === 200 && r.data === 'static');
r = await call('/blog/api/whoami'); check('no token -> 401', r.status === 401, JSON.stringify(r));
r = await call('/blog/api/whoami', { token: 'zz.yy.xx' }); check('malformed -> 401', r.status === 401, JSON.stringify(r));
r = await call('/blog/api/whoami', { token: T }); check('whoami ok', r.status === 200 && r.data.email === EMAIL, JSON.stringify(r));
r = await call('/blog/api/whoami', { token: await jwt({ ...good, exp: now - 5 }) }); check('expired -> 401', r.status === 401, JSON.stringify(r));
r = await call('/blog/api/whoami', { token: await jwt({ ...good, aud: ['other'] }) }); check('wrong aud -> 401', r.status === 401);
r = await call('/blog/api/whoami', { token: await jwt({ ...good, iss: 'https://evil' }) }); check('wrong iss -> 401', r.status === 401);
r = await call('/blog/api/whoami', { token: await jwt({ ...good, email: 'x@y.z' }) }); check('wrong email -> 403', r.status === 403);
r = await call('/blog/api/whoami', { token: await jwt(good, 'nokey') }); check('unknown kid -> 401', r.status === 401);
const parts = T.split('.');
const forged = `${parts[0]}.${b64u(JSON.stringify({ ...good, exp: now + 99999 }))}.${parts[2]}`;
r = await call('/blog/api/whoami', { token: forged }); check('tampered payload -> 401', r.status === 401, JSON.stringify(r));
r = await call('/blog/api/whoami', { token: T, e: { ...env, ACCESS_AUD: '' } }); check('unconfigured -> 500', r.status === 500);
r = await call('/blog/api/whoami', { e: { ...env, DEV_SKIP_AUTH: '1' } }); check('dev skip ignored off localhost', r.status === 401);

r = await P(post, { origin: 'https://evil.example' }); check('cross-origin -> 403', r.status === 403);
r = await P(post, { ct: 'text/plain' }); check('non-json -> 415', r.status === 415);
r = await P({ title: 'x' }); check('missing fields -> 400', r.status === 400, JSON.stringify(r));
r = await P({ ...post, slug: 'Bad Slug' }); check('bad slug -> 400', r.status === 400);
r = await P({ ...post, title: 'a\nb' }); check('multiline title -> 400', r.status === 400);
r = await P({ ...post, date: '2026-13-45' }); check('bad date -> 400', r.status === 400, JSON.stringify(r));
r = await P({ ...post, body: '---\ntitle: x\n---\nbody' }); check('pasted frontmatter -> 400', r.status === 400);

r = await P({ ...post, dryRun: true });
check('dry run', r.status === 200 && !!r.data.markdown && gh.puts.length === 0, JSON.stringify(r));
const md = r.data.markdown;

r = await P(post); check('publish -> 200', r.status === 200 && r.data.url === '/blog/posts/tricky-post', JSON.stringify(r));
const put = gh.puts[0];
check('commit path', put?.path === 'src/content/posts/tricky-post.md');
check('committer is SHK Chan noreply', put?.body.committer.name === 'SHK Chan' && put.body.author.email.endsWith('@users.noreply.github.com'));
check('content utf-8 round trip', Buffer.from(put.body.content, 'base64').toString('utf8') === md);
r = await P(post); check('duplicate -> 409', r.status === 409);
r = await P({ ...post, overwrite: true });
check('overwrite sends sha', r.status === 200 && gh.puts[1].body.sha === 'sha-old' && gh.puts[1].body.message.startsWith('Update'));
r = await P({ ...post, slug: 'other' }, { e: { ...env, GITHUB_TOKEN: 'wrong' } });
check('github auth failure -> 502', r.status === 502 && /401/.test(r.data.error), JSON.stringify(r));

console.log(results.join('\n'));
const failed = results.filter((line) => line.startsWith('FAIL')).length;
console.log(failed ? `${failed} failed` : `All ${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
