# ChronoQuest 🎮

> A productivity-focused Progressive Web App for managing time, building focus, and tracking progress.

**Live Demo:** https://ifeyemidavid.github.io/ChronoQuest/

## Overview

ChronoQuest is a browser-based productivity application designed to help users manage their time and build consistent focus habits.

The application combines everyday time-management tools with lightweight gamification and productivity tracking. It is installable as a Progressive Web App and stores user data locally in the browser.

## Features

* **Clock**

  * 12-hour and 24-hour formats
  * Seconds display
  * Fuzzy time display
  * Manual time mode

* **Alarms**

  * Create up to 10 alarms
  * One-time and daily alarms
  * Voice-based alarm input
  * Custom alarm sound support

* **Stopwatch**

  * Start, pause, stop, and reset
  * Lap tracking
  * Productivity points

* **Focus Timer**

  * Custom minutes and seconds
  * Pomodoro preset — 25 minutes
  * Deep Focus preset — 50 minutes
  * Short Break preset — 5 minutes
  * Focus mode with points

* **Productivity Tracking**

  * Focus session tracking
  * Total focus minutes
  * Points earned
  * Daily productivity goals
  * Productivity dashboard

* **Personalization**

  * Dark and light themes
  * Custom background
  * Responsive interface

* **Progressive Web App**

  * Installable on supported devices
  * Service worker support
  * Web app manifest
  * Local data persistence

## Technologies

* HTML5
* CSS3
* JavaScript
* Web APIs
* LocalStorage
* Service Workers
* Web App Manifest
* Web Speech API

## Project Structure

```text
ChronoQuest/
├── index.html        # Application structure and UI
├── index.css         # Styling and responsive layout
├── index.js          # Application logic and functionality
├── manifest.json     # PWA configuration
├── sw.js             # Service worker
├── .gitignore
├── LICENSE
└── README.md
```

## How to Run Locally

1. Clone the repository:

```bash
git clone https://github.com/ifeyemidavid/ChronoQuest.git
```

2. Open the project in VS Code.

3. Run `index.html` with a local development server such as VS Code Live Server.

4. Open the provided local URL in your browser.

## Data & Privacy

ChronoQuest stores application data locally in the user's browser using `localStorage`.

No backend database or user account is required to use the core features.

## What I Learned

Building ChronoQuest helped me strengthen my understanding of:

* JavaScript DOM manipulation
* Event-driven programming
* Browser APIs
* LocalStorage
* Timers and asynchronous behavior
* Progressive Web Apps
* Service workers
* Responsive web design
* Git and GitHub workflows
* Building and iterating on a complete web application

## Future Improvements

Potential future improvements include:

* More detailed productivity analytics
* Weekly and monthly statistics
* Improved alarm sound persistence
* More customization options
* Additional productivity modes
* Improved accessibility
* More advanced PWA capabilities

## License

This project is licensed under the MIT License.

## Author

**Omosehin Ifeyemi**

Software Engineering student and developer focused on building practical software products and continuously improving through hands-on projects.

**GitHub:** https://github.com/ifeyemidavid
