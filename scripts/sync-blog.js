#!/usr/bin/env node
/**
 * Pull published posts from local WordPress and write them into this
 * static site so GitHub Pages can serve them.
 *
 *   1. Start Local WP (site must be Running)
 *   2. Publish posts in wp-admin (categories: article / newsletter)
 *   3. npm run sync-blog
 *   4. Commit and push
 *
 * Env: WP_URL (default http://forgelab.local)
 */

const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const { Readable } = require('stream');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'posts.json');
const IMAGES_DIR = path.join(ROOT, 'assets', 'blog');
const BLOG_DIR = path.join(ROOT, 'blog');

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] == null) process.env[key] = val;
  });
}

loadDotEnv();

const WP_URL = (process.env.WP_URL || 'http://forgelab.local').replace(/\/+$/, '');

function fail(message, extra) {
  console.error('\n❌  ' + message);
  if (extra) console.error(extra);
  console.error('\nMake sure Local is open and the site is Running.');
  console.error('Then set WP_URL if it is not http://forgelab.local:\n');
  console.error('  WP_URL=http://YOUR-SITE.local npm run sync-blog\n');
  process.exit(1);
}

async function wpFetch(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'ForgeLab-sync-blog' },
  });
  if (!res.ok) {
    throw new Error(res.status + ' ' + res.statusText + ' — ' + url);
  }
  return res;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeContent(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
}

function classifyCategory(terms) {
  const slugs = (terms || []).map((t) => String(t.slug || '').toLowerCase());
  const names = (terms || []).map((t) => String(t.name || '').toLowerCase());
  if (slugs.includes('newsletter') || names.some((n) => n.includes('newsletter'))) {
    return 'newsletter';
  }
  return 'article';
}

function extFromUrl(url, fallback) {
  try {
    const clean = new URL(url).pathname;
    const ext = path.extname(clean).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'].includes(ext)) return ext;
  } catch (_) {}
  return fallback || '.jpg';
}

function collectMediaUrls(html, featuredUrl) {
  const urls = new Set();
  if (featuredUrl) urls.add(featuredUrl);
  const re = /(?:src|href)=["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html || ''))) {
    const url = match[1];
    if (!url) continue;
    if (url.startsWith(WP_URL) || /\/wp-content\/uploads\//i.test(url)) {
      urls.add(url);
    }
  }
  return [...urls];
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': 'ForgeLab-sync-blog' } });
  if (!res.ok) throw new Error('image ' + res.status + ' ' + url);
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(destPath));
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function logoFilterSvg() {
  return `  <svg style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">
    <defs>
      <filter id="logo-adapt" color-interpolation-filters="sRGB" x="-50%" y="-50%" width="200%" height="200%">
        <feColorMatrix type="luminanceToAlpha" in="SourceGraphic" result="lum"/>
        <feComponentTransfer in="lum" result="thresh">
          <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 1 1 1"/>
        </feComponentTransfer>
        <feComposite in="thresh" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="whitemask"/>
        <feColorMatrix in="SourceGraphic" type="matrix"
          values="0 0 0 0 0.102
                  0 0 0 0 0.125
                  0 0 0 0 0.173
                  0 0 0 1 0" result="dark"/>
        <feComposite in="dark" in2="whitemask" operator="in" result="dark-text"/>
        <feComposite in="SourceGraphic" in2="whitemask" operator="out" result="color-text"/>
        <feMerge>
          <feMergeNode in="color-text"/>
          <feMergeNode in="dark-text"/>
        </feMerge>
      </filter>
    </defs>
  </svg>`;
}

function chromeNav(root) {
  const home = root + 'index.html';
  const blog = root === '../' ? 'index.html' : '../';
  return `  <div class="scroll-progress" aria-hidden="true"></div>
  <nav class="nav scrolled">
    <a class="logo" href="${home}">
      <img src="${root}assets/forge-logo.png" alt="ForgeLab" class="nav-logo" />
    </a>
    <ul class="nav-links">
      <li><a href="${home}#about" onclick="closeNav()">About</a></li>
      <li><a href="${home}#services" onclick="closeNav()">Services</a></li>
      <li><a href="${home}#projects" onclick="closeNav()">Projects</a></li>
      <li><a href="${blog}" class="active" onclick="closeNav()">Blog</a></li>
      <li><a href="${home}#contact" onclick="closeNav()">Contact</a></li>
    </ul>
    <a class="btn-cta" href="${home}#contact">Get in touch</a>
    <div class="theme-toggle-wrapper">
      <button class="theme-toggle" type="button" aria-label="Toggle dark/light mode" onclick="toggleTheme()">
        <svg class="icon-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </button>
    </div>
    <button class="hamburger" aria-label="Toggle menu" aria-expanded="false" onclick="toggleNav()">☰</button>
  </nav>`;
}

function chromeFooter(root) {
  const home = root + 'index.html';
  const blog = root === '../' ? 'index.html' : '../';
  return `  <footer class="footer">
    <div class="footer-inner">
      <a class="footer-brand" href="${home}">
        <img src="${root}assets/forge-logo.png" alt="ForgeLab" class="footer-logo" />
      </a>
      <ul class="footer-links">
        <li><a href="${home}#about">About</a></li>
        <li><a href="${home}#services">Services</a></li>
        <li><a href="${home}#projects">Projects</a></li>
        <li><a href="${blog}">Blog</a></li>
        <li><a href="${home}#contact">Contact</a></li>
      </ul>
    </div>
    <p class="footer-copy">© 2026 <span class="brand-forge">Forge</span><span class="brand-lab">Lab</span></p>
  </footer>
  <button class="back-to-top" id="backToTop" type="button" aria-label="Back to top">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m0 0l-6 6m6-6l6 6"/></svg>
  </button>`;
}


function pageShell({ title, description, root, extraCss, extraJs, bodyClass, content }) {
  const css = extraCss ? `\n  <link rel="stylesheet" href="${extraCss}" />` : '';
  const js = extraJs ? `\n  <script src="${extraJs}"></script>` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <link rel="icon" href="${root}assets/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="${root}assets/favicon-32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="${root}assets/apple-touch-icon.png" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <script>
    (function(){
      var t = localStorage.getItem('theme');
      if(!t) t = window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
  <link rel="stylesheet" href="${root}styles.css?v=35" />${css}
</head>
<body class="${bodyClass || ''}">
${logoFilterSvg()}
${chromeNav(root)}
${content}
${chromeFooter(root)}
  <script src="${root}script.js?v=29"></script>${js}
</body>
</html>
`;
}

function renderPostPage(post) {
  const root = '../../';
  const image = post.image
    ? `<img class="blog-hero-image" src="${root}${post.image}" alt="${escapeHtml(post.title)}" />`
    : '';
  const label = post.category === 'newsletter' ? 'Newsletter' : 'Article';
  return pageShell({
    title: post.title + ' — ForgeLab',
    description: post.excerpt || post.title,
    root,
    extraCss: root + 'blog.css?v=1',
    bodyClass: 'page-blog page-blog-post',
    content: `  <main class="blog-main">
    <article class="section blog-post">
      <div class="container blog-post-header" data-reveal>
        <p class="eyebrow">ForgeLab / ${label}</p>
        <p class="blog-post-meta">${escapeHtml(post.dateLabel)} · ${label}</p>
        <h1>${escapeHtml(post.title)}</h1>
        ${image}
      </div>
      <div class="container blog-prose" data-reveal>
        ${post.content}
      </div>
      <div class="container blog-post-nav">
        <a class="btn ghost" href="../">← All posts</a>
      </div>
    </article>
  </main>`,
  });
}

function renderListingPage() {
  return pageShell({
    title: 'Blog — ForgeLab',
    description: 'Articles and newsletters from the ForgeLab studio.',
    root: '../',
    extraCss: '../blog.css?v=1',
    extraJs: '../blog.js?v=1',
    bodyClass: 'page-blog',
    content: `  <main class="blog-main">
    <section class="section blog-listing">
      <div class="container">
        <div class="section-intro" data-reveal-group>
          <p class="eyebrow stagger-child">From the lab</p>
          <h2 class="stagger-child">Articles &amp; newsletters.</h2>
          <p class="blog-lead stagger-child">Notes on shipping products, design, and growing digital businesses — written in WordPress, published here.</p>
        </div>
        <div class="blog-filters" role="tablist" aria-label="Filter posts">
          <button type="button" class="blog-filter is-active" data-filter="all">All</button>
          <button type="button" class="blog-filter" data-filter="article">Articles</button>
          <button type="button" class="blog-filter" data-filter="newsletter">Newsletters</button>
        </div>
        <div id="blog-grid" class="blog-grid" data-reveal-group></div>
        <p id="blog-empty" class="blog-empty" hidden>No posts in this category yet.</p>
        <p id="blog-setup" class="blog-empty">Our first insights are coming soon.</p>
        <form class="contact-form blog-subscribe" id="newsletterForm" action="https://formsubmit.co/team@theforgelab.in" method="POST">
          <h3>Get new issues</h3>
          <p>Drop your email and we will send new articles and newsletters. Free — no WordPress plan required.</p>
          <input type="hidden" name="_subject" value="ForgeLab newsletter signup">
          <input type="hidden" name="_captcha" value="false">
          <input type="hidden" name="_template" value="box">
          <input type="text" name="_honey" style="display:none">
          <input type="email" name="email" placeholder="you@company.com" required />
          <button class="btn" type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  </main>`,
  });
}


async function main() {
  console.log('\nForgeLab blog sync');
  console.log('WordPress: ' + WP_URL + '\n');

  let payload;
  try {
    const url = WP_URL + '/wp-json/wp/v2/posts?_embed=1&per_page=100&status=publish';
    const res = await wpFetch(url);
    payload = await res.json();
  } catch (err) {
    fail('Could not reach WordPress at ' + WP_URL, String(err && err.message ? err.message : err));
  }

  if (!Array.isArray(payload)) {
    fail('WordPress did not return a post list. Check the REST API in the browser:', WP_URL + '/wp-json/wp/v2/posts');
  }

  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });

  const existingSlugs = new Set();
  if (fs.existsSync(BLOG_DIR)) {
    fs.readdirSync(BLOG_DIR, { withFileTypes: true }).forEach((entry) => {
      if (entry.isDirectory()) existingSlugs.add(entry.name);
    });
  }

  const posts = [];
  const usedImageNames = new Set();

  for (const raw of payload) {
    const slug = String(raw.slug || '').trim();
    if (!slug) continue;

    const title = stripHtml(raw.title && raw.title.rendered);
    const contentHtml = sanitizeContent(raw.content && raw.content.rendered);
    const excerpt = stripHtml(raw.excerpt && raw.excerpt.rendered);
    const terms = (((raw._embedded || {})['wp:term'] || [])[0]) || [];
    const media = ((raw._embedded || {})['wp:featuredmedia'] || [])[0] || null;
    const featuredUrl = media && (media.source_url || (media.media_details && media.media_details.sizes && media.media_details.sizes.large && media.media_details.sizes.large.source_url));

    const urlMap = {};
    const mediaUrls = collectMediaUrls(contentHtml, featuredUrl || '');
    for (const mediaUrl of mediaUrls) {
      const ext = extFromUrl(mediaUrl, '.jpg');
      const hash = Buffer.from(mediaUrl).toString('base64url').slice(0, 10);
      const filename = slug + '-' + hash + ext;
      usedImageNames.add(filename);
      const dest = path.join(IMAGES_DIR, filename);
      try {
        if (!fs.existsSync(dest)) {
          process.stdout.write('  ↓  ' + filename + '\n');
          await downloadImage(mediaUrl, dest);
        }
        urlMap[mediaUrl] = 'assets/blog/' + filename;
      } catch (err) {
        console.warn('  ⚠  skipped image ' + mediaUrl + ' (' + err.message + ')');
      }
    }

    let content = contentHtml;
    Object.keys(urlMap).forEach((remote) => {
      const local = '../../' + urlMap[remote];
      content = content.split(remote).join(local);
    });

    const image = featuredUrl && urlMap[featuredUrl] ? urlMap[featuredUrl] : null;
    const post = {
      id: raw.id,
      slug,
      title: title || slug,
      date: raw.date,
      dateLabel: formatDate(raw.date),
      category: classifyCategory(terms),
      excerpt,
      image,
      url: 'blog/' + slug + '/',
    };
    posts.push(post);

    const postDir = path.join(BLOG_DIR, slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), renderPostPage({ ...post, content }));
    existingSlugs.delete(slug);
    console.log('  ✓  ' + post.category + '  ' + slug);
  }

  existingSlugs.forEach((slug) => {
    fs.rmSync(path.join(BLOG_DIR, slug), { recursive: true, force: true });
    console.log('  –  removed stale ' + slug);
  });

  if (fs.existsSync(IMAGES_DIR)) {
    fs.readdirSync(IMAGES_DIR).forEach((name) => {
      if (name === '.gitkeep') return;
      if (!usedImageNames.has(name)) {
        fs.rmSync(path.join(IMAGES_DIR, name), { force: true });
      }
    });
  }

  const data = {
    generatedAt: new Date().toISOString(),
    source: WP_URL,
    posts: posts.map(({ content, ...rest }) => rest),
  };
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n');
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), renderListingPage());

  console.log('\nSynced ' + posts.length + ' post' + (posts.length === 1 ? '' : 's') + '.');
  console.log('Preview: npm start  →  http://localhost:5500/blog/\n');
}

main().catch((err) => fail('Sync failed', err && err.stack ? err.stack : String(err)));

