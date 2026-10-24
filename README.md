# Epochs Lab 🔬

Epochs Lab turns a plain-English machine-learning request into a trained, evaluated model through seven specialist agents run in sequence by an Orchestrator, with human approval checkpoints for dataset selection and preprocessing plans.

> **Project Team:** Alyan Kabir, Qazi Awais, Talha Bin Shahid  
> **Institution:** NUML Islamabad  
> **Supervisor:** Dr. Sehrish Amjad

---

## 📁 Project Directory Structure

```text
epochs-lab/
├── docs/                                 # Project specifications and phase documentation
│   ├── 01-landing-page.md
│   ├── 02-dashboard.md
│   ├── 03-project-pipeline.md
│   └── 04-phase-2-delivery.md
├── frontend/                             # Frontend application (React 19 + Vite + Tailwind CSS)
│   ├── public/                           # Static public assets (SVGs, favicon)
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/                   # Modular UI components by domain
│   │   │   ├── common/                   # Shared UI primitives (Buttons, Logo, TiltCard, BorderBeam, Popover, ThemeToggle)
│   │   │   │   ├── ActionPopover.jsx
│   │   │   │   ├── BorderBeam.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Logo.jsx
│   │   │   │   ├── ThemeToggle.jsx
│   │   │   │   └── TiltCard.jsx
│   │   │   ├── dashboard/                # Dashboard widgets & modals
│   │   │   │   ├── DeleteProjectDialog.jsx
│   │   │   │   ├── LightRadialPipeline.jsx
│   │   │   │   └── NewProjectModal.jsx
│   │   │   ├── landing/                  # Landing page pipeline components
│   │   │   │   ├── AgentCard.jsx
│   │   │   │   ├── AgentPreview.jsx
│   │   │   │   └── AgentShape.jsx
│   │   │   └── pipeline/                 # Pipeline live-run components
│   │   │       └── HubScene.jsx
│   │   ├── context/                      # React context state (store.jsx)
│   │   │   └── store.jsx
│   │   ├── data/                         # Mock data, constants, agent profiles
│   │   │   └── data.js
│   │   ├── models/                       # Business logic & pipeline state machines
│   │   │   ├── pipelineModel.js
│   │   │   └── projectModel.js
│   │   ├── pages/                        # Route pages
│   │   │   ├── AppShell.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Datasets.jsx
│   │   │   ├── Keys.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Pipeline.jsx
│   │   │   └── Settings.jsx
│   │   ├── styles/                       # Global CSS & Tailwind v4 theme
│   │   │   └── index.css
│   │   ├── utils/                        # Utilities & deterministic math helpers
│   │   │   ├── dialogFocus.js
│   │   │   └── heroGraph.js
│   │   ├── AppRoutes.jsx                 # App routing configuration
│   │   └── main.jsx                      # React DOM entry point
│   ├── tests/
│   │   ├── e2e/                          # Playwright end-to-end tests
│   │   │   ├── dashboard.spec.js
│   │   │   ├── landing.spec.js
│   │   │   └── pipeline.spec.js
│   │   └── unit/                         # Unit tests (Node.js test runner)
│   │       ├── pipelineModel.test.js
│   │       └── projectModel.test.js
│   ├── .oxlintrc.json                    # Linter configuration
│   ├── index.html                        # HTML template
│   ├── package.json                      # Frontend dependencies & scripts
│   ├── playwright.config.js              # Playwright configuration
│   └── vite.config.js                    # Vite bundler & Tailwind configuration
├── .gitignore                            # Workspace gitignore rules
├── package.json                          # Root package.json with npm workspace scripts
└── README.md                             # Project overview & documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+ recommended)

### Installation
From the root directory:
```bash
npm install
```

---

## 🛠 Available Scripts

You can run scripts either from the **root directory** or from within the **`frontend/`** directory.

### From Root Directory:
- **`npm run dev`**: Starts the Vite development server.
- **`npm run build`**: Builds the production bundle.
- **`npm test`**: Runs the unit test suite (`pipelineModel`, `projectModel`).
- **`npm run lint`**: Runs oxlint on frontend code.
- **`npm run test:e2e`**: Runs Playwright end-to-end test suite.
- **`npm run preview`**: Previews the production build locally.

### From `frontend/` Directory:
```bash
cd frontend
npm run dev
npm run build
npm test
npm run lint
```

---

## 🤖 Seven Specialist Agents Pipeline

1. **Prompt Analysis**: Turns user request into a structured problem specification.
2. **Dataset Search**: Discovers candidate datasets on Kaggle & HuggingFace *(Human Checkpoint 1)*.
3. **Data Profiling**: Inspects shape, data types, missing values, and class balance.
4. **Preprocessing**: Plans and executes cleaning, encoding, and train/test splits *(Human Checkpoint 2)*.
5. **Model Training**: Evaluates suitable architectures (e.g. Gradient Boosting, Random Forest) and trains models.
6. **Evaluation**: Evaluates metrics against criteria; triggers self-repair and tuning if needed.
7. **Report**: Generates an exportable Jupyter notebook, metrics summary, and pipeline artifacts.
