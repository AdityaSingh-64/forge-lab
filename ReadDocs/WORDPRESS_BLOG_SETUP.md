# Free WordPress blog for ForgeLab

Write articles and newsletters in local WordPress (free). A sync command copies them into this static site. GitHub Pages then serves them at `theforgelab.in/blog`.

You do **not** need a WordPress.com paid plan.

## One-time setup

1. Install [Local](https://localwp.com) (free Mac app).
2. Create a site named `forgelab`. Leave it **Running**.
3. Open WP Admin (`http://forgelab.local/wp-admin`).
4. **Posts → Categories** — add `article` and `newsletter`.
5. **Settings → Permalinks** — choose **Post name** → Save.
6. Publish a test post.
7. In this repo:

```bash
# if Local shows a different URL, copy it here
cp .env.example .env
# edit .env so WP_URL matches Local (often http://forgelab.local)

npm run sync-blog
npm start
```

Open `http://localhost:5500/blog/`.

## Every time you publish

1. Local site **Running**
2. Write / publish in wp-admin
3. `npm run sync-blog`
4. Commit `data/posts.json`, `blog/`, and `assets/blog/`
5. Push — live site updates

## Undo this work

Blog lives on branch `feature/wordpress-blog`. To go back to the site as it was:

```bash
git switch aditya
```

That restore point is commit `95331f5`.

## Optional: Docker instead of Local

```bash
docker compose up -d
# finish WordPress setup at http://localhost:8080
WP_URL=http://localhost:8080 npm run sync-blog
```
