# Epochs Lab 🔬

Epochs Lab is a React prototype for turning a plain-English machine-learning goal into a guided, reviewable workflow. The interface combines dataset discovery, profiling, preprocessing, model training, evaluation, and report generation in one notebook-style project experience.

> **Project team:** Alyan Kabir, Qazi Awais, Talha Bin Shahid
> **Institution:** NUML Islamabad  
> **Supervisor:** Dr. Sehrish Amjad

## What the prototype includes

- Marketing landing page with responsive navigation, theme switching, pricing, feature previews, FAQ, and the seven-agent workflow.
- Workspace dashboard for projects, activity, status filters, dataset access, provider settings, and responsive sidebar navigation.
- Project pipeline page with a linear seven-stage rail and inline notebook thread.
- Two human approval gates:
  - Gate A after **Dataset Search**.
  - Gate B after **Preprocessing**.
- Dataset candidate selection, CSV upload, profiling previews, model comparison, training progress, failure recovery, run history, and downloadable artifacts.
- Light and dark themes using shared semantic design tokens.
- Demo sign-in: any non-empty email and password navigate to the dashboard. No backend authentication is connected.

## Canonical pipeline

The same seven stages are used across the landing page, dashboard, and project page:

1. **Prompt Analysis** — identifies the task and creates an execution plan.
2. **Dataset Search** — discovers and ranks candidate datasets. **Gate A** appears here.
3. **Data Profiling** — inspects rows, columns, missing values, and class balance.
4. **Preprocessing** — proposes and runs the cleaning plan. **Gate B** appears here.
5. **Model Training** — selects a baseline and streams training progress.
6. **Evaluation** — calculates metrics and compares them with the project goal.
7. **Report** — packages the notebook, model, preprocessing artifacts, and results.

## Tech stack

- React 19
- Vite 8
- React Router
- Tailwind CSS v4
- Framer Motion
- React Three Fiber / Three.js for the landing-page visual experience
- Lucide React icons
- Playwright for end-to-end tests
- Node.js test runner for unit tests
- Oxlint

## Project structure

```text
epochs-lab/
├── docs/                              # Product specifications and redesign notes
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                  # Auth shell and form presentation
│   │   │   ├── common/                # Shared buttons, logo, theme, popovers
│   │   │   ├── dashboard/             # Workspace widgets, modals, dataset tools
│   │   │   ├── landing/               # Landing-page cards and previews
│   │   │   ├── pipeline/              # Pipeline rail, notebook, and approvals
│   │   │   └── ui/                    # Reusable UI components
│   │   ├── context/                   # Demo workspace store
│   │   ├── data/                      # Seed data and scripted pipeline events
│   │   ├── models/                    # Project, dataset, and pipeline state logic
│   │   ├── pages/                     # Routed application pages
│   │   ├── routes/                    # Router and route composition
│   │   ├── styles/                    # Global CSS and theme tokens
│   │   ├── theme/                     # Theme context, provider, hook, and settings
│   │   ├── utils/                     # Shared browser utilities
│   │   ├── AppRoutes.jsx
│   │   └── main.jsx
│   ├── tests/
│   │   ├── e2e/                       # Playwright browser tests
│   │   └── unit/                      # Node.js unit tests
│   ├── package.json
│   ├── playwright.config.js
│   └── vite.config.js
├── package.json                       # npm workspace scripts
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 or newer recommended.
- npm 10 or newer recommended.

### Install dependencies

From the repository root:

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local Vite URL shown in the terminal. The application uses a client-side `MemoryRouter`, so the demo flow starts from the landing page.

## Available scripts

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production bundle. |
| `npm run preview` | Preview the production bundle locally. |
| `npm run lint` | Run Oxlint. |
| `npm test` | Run unit tests with Node's test runner. |
| `npm run test:e2e` | Run the Playwright browser suite. |

The same commands are available inside `frontend/` through its local `package.json` scripts.

## Demo workflow

1. Open the landing page.
2. Choose **Start a project** or use **Sign in**.
3. For demo sign-in, enter any non-empty email and password.
4. Open a seeded project or create a new one.
5. Start a run and follow the notebook thread.
6. Approve the dataset at Gate A.
7. Approve the preprocessing plan at Gate B.
8. Review training output, evaluation metrics, and the final Report artifacts.

The current store is session-only. Refreshing the page resets the demo workspace state.

## Verification

The current implementation has been verified with:

```bash
npm run lint
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
```

The automated checks cover authentication, dashboard behavior, dataset flows, landing-page interactions, theme behavior, responsive layouts, navbar states, and the redesigned seven-stage pipeline.

Oxlint currently reports one existing Fast Refresh warning in `frontend/src/context/store.jsx`; it does not fail the lint command.

## Documentation

Project specifications are stored in `docs/`, including the project pipeline redesign specification:

- `docs/PIPELINE_PAGE_REDESIGN_SPEC.md`
