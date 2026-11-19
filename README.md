# Rep Roster

A phone-friendly planner for a fixed four-day strength program: two Lower days, two Upper days and three Rest days. You tap today's day type and the app shows that session. The lifts never change, so the only thing you track is the weight.

- No accounts, no server, no AI, no secret keys.
- Works offline after it has loaded once.
- Everything is saved on the phone only (browser storage).

## What it does (version 1)

- **Three big buttons:** Lower, Upper, Rest.
- **Session view:** every block in order, showing sets × reps and notes.
- **Lower-day swaps:** Block 3 (Bulgarian split squats ↔ cable step-ups) and Block 4 (cable kickbacks ↔ hip abduction machine). A swap stays for the rest of the day and goes back to the default the next day.
- **Rest-day toggle:** Option A (mobility only, the default) or Option B (adds knee tucks 4×15 and a 20-minute incline walk or stair stepper). It resets to A the next day.
- **Done checkboxes:** saved between uses, cleared automatically on a new day.
- **Log this:** on the weighted lifts (weight in lb + reps), including both halves of the superset. Knee tucks log reps only. Shows your last 3 entries. Each swap option keeps its own history. The full history is kept for the version 2 chart.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | The look |
| `app.js` | The sessions, checkboxes, toggles and logging |
| `manifest.webmanifest` | App name and icon, so the phone can install it |
| `sw.js` | Offline support (keeps a copy of the app on the phone) |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | App icons |

**When you change any file,** change `rep-roster-v1` at the top of `sw.js` to `rep-roster-v2` (then v3, and so on). Otherwise the phone keeps showing the old saved copy.

## Installing on iPhone

The files must be served from an **https** address (for example GitHub Pages). Then:

1. Open the address in **Safari**.
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Open Rep Roster from its new icon. It runs in its own window with no Safari bar.

Notes:
- Data saved in the home-screen app is separate from data in a Safari tab. Always use the icon.
- Deleting the app from the home screen deletes its saved logs. A backup button is planned for version 2.

## Version 2 (not built yet)

- Export and import a backup.
- Edit or delete a log entry.
- A progress chart with two tabs: (1) weight and reps over time on the weighted lifts; (2) time spent on the stair stepper.
- An "Other" option on each block for typing and logging an alternative exercise.
- Log minutes on the stair stepper or incline walk (Upper days and Rest day Option B).

No schedule, calendar or cycle tracker. The three buttons are enough.
