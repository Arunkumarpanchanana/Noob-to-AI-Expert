# Noob to AI Expert — Complete AI Course

A complete, self-contained AI course that takes you from zero AI knowledge to production-grade AI engineering across **20 sessions** in 3 tracks. Hosted on GitHub Pages with no backend, no build tools, and no dependencies beyond a browser.

**Live site:** [your-username.github.io/noob-to-ai-expert](https://your-username.github.io/noob-to-ai-expert)

---

## Course Structure

| Track | Sessions | Duration | Topics |
|---|---|---|---|
| **Beginner** | 1–5 | ~5 hrs | What is AI, prompt engineering, Python basics, data, first app |
| **Intermediate** | 6–12 | ~8 hrs | ML theory, neural networks, LLMs, embeddings, RAG, deployment |
| **Expert** | 13–20 | ~12 hrs | Agents, evaluation, fine-tuning, responsible AI, multimodal, production |

Every session includes:
- **Learn tab** — concept explanations with working code examples
- **Lab tab** — hands-on project with Google Colab link
- **Quiz tab** — 5 graded questions with explanations (70% to pass)

Progress is tracked in `localStorage` — no account required.

---

## Local Development

The site uses `fetch()` to load shared nav/footer components. This requires an HTTP server — opening `index.html` directly via `file://` won't work.

```bash
# Clone the repo
git clone https://github.com/your-username/noob-to-ai-expert.git
cd noob-to-ai-expert

# Start a local server (Python 3)
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

No npm, no webpack, no build step. Every dependency loads from CDN.

---

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to: **Branch: main**, folder: **/ (root)**
4. Click Save — your site is live in ~60 seconds

The `.nojekyll` file in the root prevents GitHub Pages from running Jekyll, which would break asset paths.

---

## File Structure

```
├── index.html                    # Homepage
├── 404.html                      # Custom 404 page
├── .nojekyll                     # Prevents Jekyll on GitHub Pages
├── assets/
│   ├── css/
│   │   ├── main.css              # Global styles, nav, footer
│   │   ├── session.css           # Session page layout, callouts
│   │   └── quiz.css              # Quiz engine styles
│   └── js/
│       ├── main.js               # Nav/footer injection, mobile menu
│       ├── progress.js           # localStorage progress tracking
│       ├── quiz.js               # Data-driven quiz engine
│       ├── lab.js                # Copy buttons, reveal blocks
│       └── session.js            # Sidebar, TOC, prev/next nav
├── components/
│   ├── nav.html                  # Shared navigation
│   └── footer.html               # Shared footer
├── data/
│   └── sessions.json             # Master session metadata
├── sections/
│   ├── beginner.html
│   ├── intermediate.html
│   └── expert.html
├── sessions/
│   ├── beginner/                 # Sessions 01–05
│   ├── intermediate/             # Sessions 06–12
│   └── expert/                   # Sessions 13–20
└── notebooks/                    # Jupyter notebooks for Colab labs
    └── session-XX-lab.ipynb (×20)
```

---

## Technology Stack

All via CDN — zero npm, zero build step:

| Library | Purpose |
|---|---|
| Google Fonts (Inter + JetBrains Mono) | Typography |
| Font Awesome 6 Free | Icons |
| Prism.js | Syntax highlighting for Python/JS code blocks |
| Chart.js | Homepage progress doughnut chart |

Custom vanilla JS handles: tab switching, quiz engine, sidebar generation, TOC, progress tracking, and copy buttons.

---

## Adding a New Session

1. Copy an existing session HTML (e.g., `sessions/intermediate/11-rag.html`)
2. Update `window.SESSION_META` at the bottom: `id`, `slug`, `section`, `nextPath`, `quizData`
3. Update the Learn/Lab/Quiz tab content
4. Add the session to `data/sessions.json`
5. Update the prev/next links in the adjacent sessions

---

## Progress Tracking

Progress is stored in `localStorage` under the key `noob2ai_progress`:

```javascript
{
  version: 1,
  sessions: {
    "1": { viewed: true, labStarted: true, quizPassed: true, quizScore: 90 },
    "5": { viewed: true, labStarted: false, quizPassed: false }
  }
}
```

Reset progress: open browser console and run `Progress.reset()`.

---

## Quiz System

Each session's quiz is defined in `window.SESSION_META.quizData`. Supported question types:

- `mcq` — single correct answer (radio buttons)
- `multi` — multiple correct answers (checkboxes)
- `truefalse` — true/false buttons

Pass threshold: **70%**. On pass: confetti animation + session marked complete in `localStorage`.

---

## Labs

Labs use three tiers:

- **Browser-runnable** (Sessions 1, 2, 4): Inline JS exercise or prompt sandbox
- **Google Colab** (Sessions 3, 5–20): Click "Open in Colab" to run notebooks with GPU support
- **Reveal blocks**: All sessions have expandable "What does this output?" sections

---

## License

MIT — use this course for any purpose. If you build on it, a link back is appreciated.
