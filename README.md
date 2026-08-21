# kysaiki.github.io

Source for [kysaiki.github.io](https://kysaiki.github.io/), the business website for
Kyler Saiki, independent software engineering contractor in Novato, California.

Plain HTML and CSS, no build step. GitHub Pages serves the `main` branch from the
repository root.

## Layout

```
index.html            Home
services/index.html   Services, engagement process, rates and terms
work/index.html       Case studies
about/index.html      Bio, experience, education, skills
contact/index.html    Contact details and business information
404.html              Not-found page
assets/css/site.css   All styles
assets/js/site.js     Mobile navigation toggle (the only script)
assets/img/           Portrait, project art, icons, Open Graph image
robots.txt, sitemap.xml
```

## Running locally

The pages use root-relative links (`/assets/...`), so serve the folder rather than
opening `index.html` directly:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Editing

- Each page carries its own copy of the header and footer. When you change the
  navigation or the footer, change it in all five pages plus `404.html`.
- Update the "Last updated" line in every footer and the `<lastmod>` dates in
  `sitemap.xml` when you change content. Dated snapshots are useful records of what
  the site said and when; after a deploy, save a copy at
  <https://web.archive.org/save/https://kysaiki.github.io/> and keep a dated
  screenshot with your business records.
- Keep the site factual. Nothing here should describe clients, results, or
  credentials that can't be backed up.

## Deploying

```
git add -A
git commit -m "Update site"
git push origin main
```

GitHub Pages publishes within a minute or two.

The previous site (the koi pond portfolio) is archived outside the repo at
`../docs/old-koi-site-2026-05/`.
