# EPOCHSLAB: PROJECT PIPELINE PAGE REDESIGN (unify with the one spec, remove duplication)

Fixes the audit from the three pipeline screenshots. Reconciles this screen with `PROMPT_FOR_AB_ARENA_FULL_SITE_ONE_FILE_REACT_TS.md` / `FIXES_HERO_RESPONSIVE_DASHBOARD_NOTEBOOK.md`. **This file is the single source of truth for the project page.** Delete the radial dial, the separate chat panel, and the empty terminal; they are replaced below.

## 1. Rename to the real seven agents (fix the mismatch first)
Landing page says 7 agents. This screen currently shows 6 differently-named nodes (Data, Cleaning, Model, Training, Results, Export). Replace with the canonical seven, same names and order everywhere in the product:
1. Prompt Analysis 2. Dataset Search 3. Data Profiling 4. Preprocessing 5. Model Training 6. Evaluation 7. Report
Two approval gates: Gate A after Dataset Search, Gate B after Preprocessing's plan. (Current screen's "Cleaning" ≈ Preprocessing, "Model" ≈ part of Model Training, "Results" ≈ Evaluation, "Export" ≈ Report — remap 6 nodes to 7 using this spec, don't keep both naming sets.)

## 2. One state, said once (kills the 4x repetition)
Today "waiting on you to approve a dataset" appears in the circle node, the badge, the approval card, AND the selected-agent panel. New rule: **each status lives in exactly one place.**
- **Pipeline rail tile** → status dot + short word only ("Needs you"). No sentence.
- **Top bar status chip** → one global chip for the whole project ("Needs your approval"), not per-stage text.
- **Approval card in the notebook thread** → the only place with the full sentence and the decision UI. This is the single source of truth for "what do I need to do."
- Delete the separate "Selected agent" summary panel's `Status:` line entirely — it's redundant with the above. Keep `Output:` and `Gate:` only if useful as a one-time description when a stage is first selected, not persistent on every view.

## 3. Replace the radial dial with the linear pipeline rail
Delete the circular diagram (6 scattered nodes, 1 dashed connector, "0/6" dial). Replace with the horizontal rail from the earlier spec:
- One row, 7 stage tiles connected left→right by a line, 2 diamond gate nodes inline after stage 2 and inside stage 4, dashed loop-back arc from Evaluation back to Model Training (hidden until a failure happens).
- Each tile: icon, name, one-word status (Pending / Running / Needs you / Done / Failed), and — only once done — a short result ("3 candidates", "10,000 rows"). No restated sentences.
- Selecting a tile scrolls the thread below to that stage and highlights it; running stage auto-follows unless the user scrolled up.
- Replaces: the "0/6 stages complete" counter (put a small "2/7" as a label on the rail itself, not a giant center dial), the 6 scattered nodes, the single broken dashed line.
- Responsive: becomes a horizontally scrollable strip with snap under 900px, icon-only under 640px.

## 4. Collapse three panels into one notebook thread (kills the 3x duplication)
Today: Event log (text list) + Python terminal (empty placeholder) + Run conversation (chat bubbles) = three UI patterns narrating the same run. Replace all three with **one scrollable notebook thread**, the single column described in the earlier full-site spec:
- Cell types in order, per stage: heading cell (icon/name/status) → code cell (execution counter `[ ]`/`[*]`/`[n]`, syntax-highlighted, collapsible) → output (streamed lines, tables, small charts — this is where the "Python terminal" content actually belongs, inline with the code that produced it, not a separate empty box) → review cell (for Gate A / Gate B) → error cell (on failure).
- The user's original prompt becomes the FIRST cell in the thread ("Customer churn. Predict whether a bank customer will leave...") — not duplicated again elsewhere.
- Orchestrator routing lines ("I read your goal. This is a classification task...") become short system notes between cells, same thread, not a separate chat panel.
- Delete "Run conversation" as a standalone panel and delete the empty "Python terminal — Waiting for output" placeholder box entirely; it shows nothing until a cell runs, so don't reserve permanent space for it.

## 5. One communication surface, not two
Today: "Comment for the agent" (inside the approval card) + a separate chat input ("Copilot unlocks when run finishes") = two text boxes for talking to the system.
- Keep ONE: the approval card's "Comment for the agent" field, used only when the user clicks **Send back** (attaches the comment as feedback and re-runs that stage). This matches "Request changes" from the earlier spec.
- Remove the bottom chat input entirely. If a general chat-with-the-run feature is wanted later, that's a separate, deliberate feature — not a half-disabled input sitting on every screen with a greyed-out placeholder.

## 6. Approval card (the one place that matters) — keep, clean up
- Title: stage name + "Needs you" (not "X needs you" repeated from elsewhere).
- 2–3 ranked candidates as selectable cards (name, source, rows/cols, match label) — keep this, it's good.
- "Upload my own CSV" as a 3rd option — keep.
- Primary action **Use this dataset** = the one loud button on the whole screen (green, raised). **Send back** = secondary/outline, opens the comment field only when clicked (don't show an always-visible empty textarea otherwise — keep the card compact until the user wants to leave a comment).
- Remove the purple corner blob/decoration on the card — adds visual noise with no meaning.

## 7. Top bar, cleaned
- Project name, task-type badge, status chip (one place, see §2).
- **Move "Azure OpenAI" model-provider dropdown into Settings.** It's an implementation detail, not something needed on the main working screen for every project. (Exception: keep it here only if you're deliberately marketing "bring your own model" as a user-facing feature — then label it clearly, e.g. "Model provider:", don't leave it as an unlabeled dropdown.)
- Keep: Upload CSV (secondary), Export (secondary, enabled when complete).
- **Restart** must NOT be styled as the same bold primary as a real decision button — it's destructive and rare. Make it a ghost/outline button with a confirm dialog, not solid purple competing with "Use this dataset."
- History icon gets a visible label or at least a tooltip ("Version history").

## 8. Tabs under the thread (keep, rename for clarity)
Notebook (default) · Artifacts · Dataset · Compare — fine as-is, matches Results/Files pattern from the earlier spec. "1 cells" → "1 cell".

## 9. Visual hierarchy (one loud action per screen)
Only ONE primary/filled-purple button visible at a time: the current approval's main action ("Use this dataset"). Everything else (Upload CSV, Restart, Send back, tabs) is outline/ghost/text-level. This alone will remove most of the "AI generated, everything is equally loud" feeling.

## 10. Logo bug still present (confirm fixed)
Image 3 (dark theme) still shows the logo rendering mangled/boxed. Re-check the earlier logo fix was actually applied to this page too — it's a shared component, so if it's broken here it likely regressed or was never applied app-wide, not just on the marketing navbar.

---

## New layout (top to bottom, one column of content + one side column)
```
Top bar: ← All projects · Project name · task badge · status chip         [Upload CSV] [Export] [Restart ▾] [History]
Pipeline rail: 7 tiles + 2 gates + loop-back arc, "2/7" label, horizontal scroll on small screens
─────────────────────────────────────────────────────────────────────────
Notebook thread (single column, max 760px)   |   (no separate right column —
  - prompt cell                              |    approval card and logs now
  - stage 1 cells (heading/code/output)      |    live INSIDE the thread,
  - stage 2 cells ... approval cell (Gate A) |    appearing as the next cell
  - stage 3 cells ...                        |    when that stage is reached)
  - ...                                      |
Tabs: Notebook · Artifacts · Dataset · Compare
```
Collapsing the right column into the thread removes an entire duplicate panel (Live Logs & Approvals) that was restating the rail and the approval card. If you want logs visible at all times for power users, use the bottom **Logs dock** pattern from the earlier spec (collapsible, filterable, separate from the narrative thread) instead of a permanent half-empty sidebar.

## Acceptance checklist
- [ ] Same 7 agent names/order as the landing page, everywhere
- [ ] "Waiting for you / Needs you" appears in exactly one place at a time (rail tile = 1 word, approval cell = full sentence)
- [ ] Radial dial deleted; linear rail with gates and loop-back arc in place
- [ ] Event log + Python terminal + Run conversation collapsed into one notebook thread; no permanently-empty terminal box
- [ ] One communication field (comment-on-send-back), not two
- [ ] Only one filled-primary button visible at a time; Restart is destructive-styled with confirm
- [ ] Model provider dropdown moved to Settings (or clearly labeled if kept)
- [ ] Logo renders correctly on this page in both themes
