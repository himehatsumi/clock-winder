# The Last Clockwinder

**[Play it here](https://himehatsumi.github.io/clock-winder/)** — works desktop
and mobile, nothing to install. (One-time setup note for the repo owner is at the
bottom of this file if the link isn't live yet.)

The Great Clock nears midnight. As its final keeper, wind it back with a
rhythm-game skillcheck, manage Heat and Precision, rewind time when things
get too hot, and spend salvaged Components on Workshop upgrades — for as
long as you can keep the hands from striking twelve.

A ground-up rebuild of a small vanilla-JS idle/incremental game as a
TypeScript + React application, with a redesigned interface, an animated
clockwork background, particle/sound feedback, and a permanent
meta-progression layer.

## Playing

Open the [play link](https://himehatsumi.github.io/clock-winder/) in any modern
browser — desktop or phone. The intro screen's "Begin" button walks first-time
players through the mechanics one at a time; a **?** button in the top bar
reopens the same instructions at any point during a run.

- **Initiate Winding** to start a skillcheck; press again when the marker is
  inside the zone. Landing the narrow gold band is a Great Success.
- On desktop, hold **Space** or **right-click** to rewind. On a touch device,
  hold the on-screen **Rewind** button instead — it costs Rewind Energy but
  cools the mechanism and buys you time.
- Tap/click loose gears near the clock face for bonus Components.
- Spend Components in the Workshop for permanent-for-the-run upgrades.
- When the clock strikes midnight, your score converts into **Temporal
  Cores** — a permanent currency spent on the Temporal Legacy upgrades that
  carry into every future run.

Add `?debug=1` to the URL for a small debug panel (max resources, force an
event, add heat).

## Tech stack

- [Vite](https://vite.dev) + React 19 + TypeScript, strict mode.
- The simulation lives in a framework-agnostic `GameEngine` class
  (`src/engine`) that runs its own `requestAnimationFrame` loop and exposes
  state to React via `useSyncExternalStore`. High-frequency visuals (clock
  hands, the skillcheck needle) subscribe to a separate per-frame channel
  and update the DOM directly through refs, bypassing React re-renders.
- No UI framework beyond React itself — plain CSS with custom-property
  design tokens (`src/styles`).
- Procedural sound effects via the Web Audio API (`src/engine/audio.ts`) —
  no audio assets to ship.
- Progress (an in-progress run, and permanent Temporal Legacy/achievement
  data) is saved to `localStorage` and restored automatically.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and produce a production build
npm run lint      # oxlint
```

## Project layout

```
src/engine/   simulation, upgrades, events, achievements, legacy, save, audio
src/ui/       React components and hooks
src/styles/   design tokens, base styles, component styles
```

## Deployment

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub
Pages on every push. If the play link above isn't live yet, it needs a
one-time toggle: **Settings → Pages → Build and deployment → Source →
GitHub Actions**. After that the workflow deploys automatically and the
site is live at `https://<owner>.github.io/clock-winder/`.
