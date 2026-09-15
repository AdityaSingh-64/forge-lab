(function () {
  const listingGrid = document.getElementById('blog-grid');
  const homeGrid = document.getElementById('blog-latest-grid');
  if (!listingGrid && !homeGrid) return;

  const isHome = Boolean(homeGrid);
  const postsUrl = isHome ? 'data/posts.json' : '../data/posts.json';
  const prefix = isHome ? '' : '../';

  function cardHtml(post) {
    const label = post.category === 'newsletter' ? 'Newsletter' : 'Article';
    const href = prefix + (post.url || ('blog/' + post.slug + '/'));
    const img = post.image
      ? `<img class="blog-card-thumb" src="${prefix}${post.image}" alt="" decoding="async" />`
      : `<div class="blog-card-thumb-fallback" aria-hidden="true"></div>`;
    const excerpt = post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : '';
    return `<a class="blog-card stagger-child" href="${href}" data-category="${escapeHtml(post.category || 'article')}">
      ${img}
      <div class="blog-card-body">
        <p class="blog-card-meta">${escapeHtml(post.dateLabel || '')} · ${label}</p>
        <h3>${escapeHtml(post.title)}</h3>
        ${excerpt}
        <span class="blog-card-link">Read ${label === 'Newsletter' ? 'issue' : 'article'} →</span>
      </div>
    </a>`;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function reveal(el) {
    if (!el) return;
    requestAnimationFrame(function () { el.classList.add('revealed'); });
  }

  fetch(postsUrl)
    .then(function (res) { return res.ok ? res.json() : { posts: [] }; })
    .then(function (data) {
      const posts = (data && data.posts) || [];
      if (isHome) renderHome(posts);
      else renderListing(posts);
    })
    .catch(function () {
      if (isHome) renderHome([]);
      else renderListing([]);
    });

  function renderHome(posts) {
    const latest = posts.slice(0, 3);
    const empty = document.getElementById('blog-latest-empty');
    if (!latest.length) {
      homeGrid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    homeGrid.innerHTML = latest.map(cardHtml).join('');
    reveal(homeGrid);
  }

  function renderListing(posts) {
    const empty = document.getElementById('blog-empty');
    const setup = document.getElementById('blog-setup');
    const filters = document.querySelectorAll('.blog-filter');
    let current = 'all';

    function paint() {
      const visible = posts.filter(function (p) {
        return current === 'all' || p.category === current;
      });
      listingGrid.innerHTML = visible.map(cardHtml).join('');
      if (setup) setup.hidden = posts.length > 0;
      if (empty) empty.hidden = !(posts.length && !visible.length);
      reveal(listingGrid);
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        current = btn.getAttribute('data-filter') || 'all';
        filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        paint();
      });
    });

    paint();
  }
})();
