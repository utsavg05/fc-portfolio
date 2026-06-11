# 3D Football Portfolio

A football/soccer-themed developer portfolio with Three.js animations, stadium scene, and a player kick animation on page load.

## Preview

Open `index.html` in any modern browser — no build tools or npm required.

## How to Use

1. Clone or download this repo
2. Open `index.html` in your browser
3. Customize the content (see below)

## Customization

### Personal Info

In `index.html`, update these sections:

- **Name** — Search for `UTSAV` and `GUPTA` in the hero section and replace with your name
- **Title** — Change `Full Stack Developer` to your role
- **Email** — Replace `utsav@gmail.com` with your email (appears in the CTA and footer)
- **Nav logo** — Change `UTSAV FC` to your brand name

### Commentary / Bio

In `script.js`, find the `msg` variable around line 280:

```js
const msg = "Hi, I am Utsav Gupta. I am a Full Stack Developer with 2 years of experience...";
```

Replace with your own intro text.

### About Text

In `script.js`, find the `aStr` variable around line 300:

```js
const aStr = "With 2 years of hands-on experience...";
```

Replace with your bio.

### Experience / Transfer History

In `index.html`, find the `.timeline` section and update the timeline items with your roles, companies, descriptions, and tech tags.

### Skills

In `index.html`, find the `.skills-grid` section. Each `.skill-card` has:

- `skill-rating` — FIFA-style rating number (e.g. 94)
- `skill-pos` — Position label (e.g. Striker, Midfielder)
- `skill-name` — Skill category name
- `skill-desc` — Short description
- `skill-bars` — SPD/ACC/PWR/VIS stat values

### Projects

In `index.html`, find the `.projects-grid` section. Each `.project-card` has:

- Project image (replace the `src` URL with your screenshot)
- `project-match-badge` — Badge text (Goal, Assist, MVP)
- `project-tag` — Tech stack tags
- `project-name` — Project title
- `project-desc` — Short description
- `project-link` — Link to live project or repo

### Stats / Scoreboard

In `index.html`, update the `data-count` values and labels in the `.stats-section`:

```html
<div class="stat-number" data-count="2">0</div>
<div class="stat-label">Seasons Played</div>
```

### Social Links

In the footer, update the social links (`GH`, `LI`, `X`, `IG`) with your actual profile URLs.

## File Structure

```
3d-portfolio/
├── index.html   — HTML structure
├── style.css    — All styles
├── script.js    — Three.js scene, animations, UI logic
└── README.md    — This file
```

## Tech Stack

- [Three.js](https://threejs.org/) r128 (via CDN) — 3D scene rendering
- [GSAP](https://gsap.com/) 3.12 + ScrollTrigger (via CDN) — Animations
- Google Fonts — Oswald, Inter, Orbitron, Material Symbols
- No build tools, no npm, no frameworks — just open and go

## License

Free to use and modify for personal portfolios.
