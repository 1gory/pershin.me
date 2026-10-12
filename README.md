# ipershin.me

Personal site of Igor Pershin: a homepage with projects, landing and privacy
pages for the Chrome extensions, and the Too Far Gone game page with its devlog.

- Plain static HTML/CSS/JS, no build step. English pages at `/<slug>/`,
  Russian ones at `/ru/<slug>/`. Project cards are rendered from `projects.json`.
- Every push to `main` deploys via `.github/workflows/deploy.yml` (rsync over SSH
  to `/var/www/pershin.me`, with `--delete`).
- `ops/update-stats.py` runs hourly on the server and writes `stats.json`
  (Chrome Web Store users and ratings) into the web root. It is not part of the
  deploy and is copied to `/opt/ipershin-stats/` by hand.
