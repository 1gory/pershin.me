# Too Far Gone — devlog workflow

This file is **not deployed** (rsync excludes every `README.md`). It's the playbook
for keeping the public devlog at `/too-far-gone/devlog/` up to date.

## The convention

**After a work session that changed the game, write one short public devlog entry —
what was added/changed, and when.** Keep it reader-facing (not a changelog dump):
plain language, the *why* behind decisions, atmosphere over implementation detail,
**no story spoilers**. The technical, blow-by-blow journal stays in the game repo's
`DEVLOG.md` (`~/Sites/player-ready-one/too-far-gone/DEVLOG.md`); the website entry is
the distilled, human version of it.

One entry per session is fine even if short. Newest entry first everywhere.

## Adding an entry — checklist

1. **Create** `too-far-gone/devlog/<slug>/index.html` from the skeleton below.
   Pick a short, descriptive `<slug>` (kebab-case, no dates in the URL).
2. **Fill** the per-entry bits marked `⟨…⟩`: title, description, OG image (reuse a
   `/too-far-gone/shots/tfg-*.jpg`), `datePublished`, the `Devlog #N · <Month Year>`
   label, the prose, and the prev/next links.
3. **Link it** in two places, as the new newest entry (top of the list):
   - `too-far-gone/index.html` → the `.devlog-list`
   - `too-far-gone/devlog/index.html` → the `.devlog-list`
   Update the previous newest entry's **"next"** link to point at the new one.
4. **Sitemap**: add `<loc>https://ipershin.me/too-far-gone/devlog/<slug>/</loc>` to
   `sitemap.xml` (priority 0.6, changefreq monthly).
5. **Screenshots** (if the look changed): re-run the shot tool in the game repo
   (`godot --path . --script res://tools/site_shots.gd`), re-export the JPGs into
   `too-far-gone/shots/`, done.
6. **Commit & push** to `main` (deploy is automatic). Plain commit message, no
   Co-Authored-By trailer (see the repo's `.claude/CLAUDE.md`).

## Entry skeleton

Copy an existing entry (e.g. `small-moments/index.html`) — it already has the right
`<head>` (theme vars, Bootstrap, fonts, Metrika, JSON-LD) and the comments mount.
Only these parts change per entry:

```html
<title>⟨Entry title⟩ — Too Far Gone Devlog #⟨N⟩</title>
<meta name="description" content="⟨1–2 sentence summary⟩">
<link rel="canonical" href="https://ipershin.me/too-far-gone/devlog/⟨slug⟩/">
<meta property="og:title" content="⟨Entry title⟩ — Too Far Gone Devlog #⟨N⟩">
<meta property="og:description" content="⟨short summary⟩">
<meta property="og:url" content="https://ipershin.me/too-far-gone/devlog/⟨slug⟩/">
<meta property="og:image" content="https://ipershin.me/too-far-gone/shots/⟨tfg-x.jpg⟩">
<!-- JSON-LD BlogPosting: headline, datePublished, image, mainEntityOfPage, url -->

<article class="prose">
  <h1>⟨Entry title⟩</h1>
  <p class="meta">Devlog #⟨N⟩ · ⟨Month Year⟩ · <a href="/too-far-gone/">Too Far Gone</a></p>
  <p class="lead">⟨One-paragraph hook⟩</p>
  <h2>⟨Section⟩</h2>
  <p>⟨…⟩</p>
  <figure>
    <img src="/too-far-gone/shots/⟨tfg-x.jpg⟩" alt="⟨alt⟩" loading="lazy" width="1440" height="810">
    <figcaption>⟨caption⟩</figcaption>
  </figure>
</article>

<div id="comments"></div>

<nav class="entry-nav" aria-label="Devlog navigation">
  <a class="prev" href="⟨previous entry or /too-far-gone/⟩">← ⟨prev label⟩</a>
  <a class="next" href="⟨next entry or /too-far-gone/⟩">⟨next label⟩ →</a>
</nav>
```

Reusable styles already exist in `/landing.css`: `.prose`, `.lead`, `figure`,
`.entry-nav`, `.devlog-list`, `#comments`. Don't add per-page CSS — extend
`landing.css` if something new is genuinely needed, and bump its `?v=` query.
