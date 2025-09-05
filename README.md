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

## Notes & testing
- Voice alarms work best in Chrome (desktop & Android).
- Service worker caches the app for offline use; to update assets bump the cache name in `sw.js`.
- `localStorage` stores alarms and points — clearing browser data removes progress.

## Credits
Built by **Omosehin Ifeyemi** — Built to Grow.

Contact: omosehinifeyemi@gmail.com

