# abdurrahim-islam.site

Personal portfolio site — plain HTML/CSS/JS, no build step. Four pages:

- `index.html` — home
- `homelab.html` — homelab &amp; projects (animated architecture diagram + lab list)
- `university.html` — education
- `career.html` — experience &amp; certifications

Résumé lives at `assets/resume.pdf` — swap the file (same name) to update it everywhere it's embedded/linked.

## Deploy on GitHub Pages (auto-updates on every push)

1. Create a new GitHub repo and push this folder as its contents:
   ```bash
   git init
   git add .
   git commit -m "initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
   (The included workflow at `.github/workflows/deploy.yml` handles the rest.)
3. Every future `git push` to `main` automatically rebuilds and redeploys the live site — no manual step.

Your site will be live at `https://<your-username>.github.io/<repo-name>/`.
If you want a custom domain, add a `CNAME` file with the domain name at the repo root and point your DNS at GitHub Pages (see GitHub's "Managing a custom domain" docs).

## Updating content later

- **Add a lab / project**: copy a `.lab-card` block in `homelab.html`.
- **Add a job or degree**: copy an `.entry` block in `career.html` / `university.html`.
- **Change colors/fonts**: edit the `:root` variables at the top of `assets/css/style.css`.
- **Resume**: replace `assets/resume.pdf`.

No server, database, or build tooling — just static files, so any push updates the live site within a minute or two.
