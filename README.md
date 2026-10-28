# Clip Player

Static web app for decoding lessons: paste a YouTube video or Short, optionally trim it, share the link.
Students get the clip with big ⏪ 2s / 2s ⏩ buttons (or ← / →, Space, R).

All state lives in the URL: `#/watch?v=VIDEO_ID&start=30&end=75&ar=v` (`start`/`end` in seconds, `ar=v` = vertical).

```sh
npm install
npm run dev      # local dev server
npm test         # unit tests
npm run lint     # eslint + prettier
npm run build    # static site in dist/
```

## Deploy

- **GitHub Pages:** Settings → Pages → Source: "GitHub Actions". Pushing to `main` runs `.github/workflows/deploy.yml`.
- **Netlify:** build command `npm run build`, publish directory `dist`.

Uses a relative `base` and `HashRouter`, so no rewrite rules are needed on any host.
