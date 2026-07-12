# Faculty AI Build Challenge Website

A self-contained static website for the NUS Computing Faculty Retreat Hackathon and its 90-minute Faculty AI Build Challenge.

## Files

- `index.html` — page content and structure
- `styles.css` — visual design and responsive layout
- `event-config.js` — live project data source, fallback settings and optional external data links
- `projects.csv` — fallback project gallery data
- `script.js` — timer, filters, copy buttons and project gallery loading

## Customise before the event

The project gallery loads live submissions from this Google Sheet whenever the page is refreshed:

`https://docs.google.com/spreadsheets/d/1o2BFaUQBgFapPPMOn08PBQrrISIDZhGhlYDQ0uUPr8Q/edit?usp=sharing`

Keep the Sheet shared so anyone with the link can view it. The gallery currently maps these Google Form columns:

- `Choose Your Team`
- `Project Title:`
- `One line project description`
- `Project URL`
- `Project Image`

If the Google Sheet is unavailable or has no project rows yet, the site falls back to `projects.csv`. Each fallback row supports:

- `Team`
- `Title`
- `Project URL`
- `Image URL`
- `Description`

The fallback gallery intentionally uses the same dummy image, placeholder titles and placeholder description. If a row has no image, the site uses the default placeholder image configured in `event-config.js`.

You may also update:

- event title and retreat name
- project ideas
- judging percentages
- prize description
- tool list
- schedule timings

## Run locally

Double-click `index.html`, or run a local server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish

This site can be deployed directly to:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- any ordinary web server

No build step or backend is required.
