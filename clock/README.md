# ChronoQuest

ChronoQuest — Master your time. A progressive web app (PWA) with Clock, Alarms (voice input), Stopwatch, Timer and gamified focus points.

## Features
- Real-time digital clock (12/24, fuzzy time, manual time mode)
- Multi alarms (max 10) with daily/once options and voice input (Web Speech API)
- Stopwatch with lap support and gamified points
- Timer with focus mode (earn points), pause/reset
- Background picker and Dark/Light theme
- Sounds for alarm, ding, reward
- PWA installable (manifest + service worker)
- Points and alarms persisted to `localStorage`
- Donation & About pages (developer info hardcoded)

## How to run locally
1. Clone or download the repo.
2. Serve the folder with a static server (recommended) or open `index.html` in modern browsers.
   - Quick static server with Node (optional):
     ```bash
     npx http-server -c-1
     ```
   - Or use VS Code Live Server extension.

## Deploy to GitHub Pages
1. Push the repo to GitHub.
2. In your GitHub repo → Settings → Pages, set branch `main` (or `gh-pages`) and `/ (root)` as folder.
3. Wait a minute — your app will be available at `https://<your-username>.github.io/<repo-name>/`.

> Make sure to add `icons/icon-192.png` and `icons/icon-512.png` in the repo before publishing (used by `manifest.json`).

## Notes & testing
- Voice alarms work best in Chrome (desktop & Android).
- Service worker caches the app for offline use; to update assets bump the cache name in `sw.js`.
- `localStorage` stores alarms and points — clearing browser data removes progress.

## Credits
Built by **Omosehin Ifeyemi** — Built to Grow.

Contact: omosehinifeyemi@gmail.com
Bank (FCMB): 1798477019 (Ifeyemi Olumide Omosehin)

---

If you'd like, I can:
- Create icon PNGs for you and add them to the repo.
- Walk you step-by-step through pushing to GitHub and enabling GitHub Pages (with exactly what to click and copy/paste).
- Help you compose a short, professional description and screenshots for a Play Store future upload.

