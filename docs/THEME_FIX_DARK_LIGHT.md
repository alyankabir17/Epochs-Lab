# EPOCHSLAB: FIX DARK THEME + GLOBAL LIGHT/DARK TOGGLE (React + TypeScript + Tailwind v4)

## 1. What is wrong (from your two screenshots)
- Dark mode uses a navy/purple palette instead of neutral near-black (your reference: bg #0A0A0A, sidebar #111, cards #171717, borders #262626, muted text #A3A3A3).
- Mixed tokens: the "Your projects" cards stay WHITE in dark mode (hardcoded `bg-white`), so gray text on white and faint stage labels are unreadable.
- Secondary buttons ("Review Gate", "Live Kernel") are dark gray with dim purple text; status badges are dark purple with low contrast; stat cards and icon tiles are purple-tinted.
- The toggle only works in the dashboard because the theme state lives in the dashboard layout. Fix: one provider at the app root and one toggle component used in the landing navbar and the app top bar.
(Tailwind v4 is assumed from your install log. For v3: set `darkMode: 'class'` and map the colors in `tailwind.config` to `var(--token)`; the CSS variables below stay the same.)

## 2. Step 1: no-flash script (`index.html`, inside `<head>`, before the app script)
```html
<script>
(function(){try{var t=localStorage.getItem('epochslab-theme')||'system';
var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();
</script>
```

## 3. Step 2: tokens (`src/index.css`, replace your old color variables)
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background:#F6F7FB; --foreground:#172033;
  --card:#FFFFFF; --card-foreground:#172033;
  --popover:#FFFFFF; --popover-foreground:#172033;
  --muted:#EEF1F7; --muted-foreground:#5B6478;
  --border:#E3E7F0; --input:#E3E7F0; --ring:#7C3AED;
  --sidebar:#F1F3FA; --sidebar-foreground:#172033; --sidebar-accent:#FFFFFF;
  --brand:#6D28D9; --brand-foreground:#FFFFFF; --brand-text:#6D28D9; --brand-soft:#EDE9FE;
  --success:#0F6B49; --success-soft:#DCF5EA;
  --warning:#7A5200; --warning-soft:#FFF1CC;
  --danger:#B42318;  --danger-soft:#FDE4E4;
  --info:#1D4ED8;    --info-soft:#E1ECFF;
  --code-bg:#F8F9FC; --code-fg:#172033; --tok-kw:#6D28D9; --tok-str:#0F6B49; --tok-num:#9A4A00; --tok-com:#6B7280; --tok-fn:#1D4ED8;
}
.dark, .force-dark {
  --background:#0A0A0A; --foreground:#FAFAFA;
  --card:#171717; --card-foreground:#FAFAFA;
  --popover:#171717; --popover-foreground:#FAFAFA;
  --muted:#262626; --muted-foreground:#A3A3A3;
  --border:#262626; --input:#2E2E2E; --ring:#A78BFA;
  --sidebar:#111111; --sidebar-foreground:#FAFAFA; --sidebar-accent:#1F1F1F;
  --brand:#7C3AED; --brand-foreground:#FFFFFF; --brand-text:#A78BFA; --brand-soft:rgba(124,58,237,.16);
  --success:#4ADE80; --success-soft:rgba(74,222,128,.12);
  --warning:#FBBF24; --warning-soft:rgba(251,191,36,.12);
  --danger:#F87171;  --danger-soft:rgba(248,113,113,.12);
  --info:#60A5FA;    --info-soft:rgba(96,165,250,.12);
  --code-bg:#0F0F0F; --code-fg:#E5E5E5; --tok-kw:#C4B5FD; --tok-str:#86EFAC; --tok-num:#FCD34D; --tok-com:#737373; --tok-fn:#93C5FD;
}
@theme inline {
  --color-background:var(--background); --color-foreground:var(--foreground);
  --color-card:var(--card); --color-card-foreground:var(--card-foreground);
  --color-popover:var(--popover); --color-popover-foreground:var(--popover-foreground);
  --color-muted:var(--muted); --color-muted-foreground:var(--muted-foreground);
  --color-border:var(--border); --color-input:var(--input); --color-ring:var(--ring);
  --color-sidebar:var(--sidebar); --color-sidebar-foreground:var(--sidebar-foreground); --color-sidebar-accent:var(--sidebar-accent);
  --color-brand:var(--brand); --color-brand-foreground:var(--brand-foreground); --color-brand-text:var(--brand-text); --color-brand-soft:var(--brand-soft);
  --color-success:var(--success); --color-success-soft:var(--success-soft);
  --color-warning:var(--warning); --color-warning-soft:var(--warning-soft);
  --color-danger:var(--danger);   --color-danger-soft:var(--danger-soft);
  --color-info:var(--info);       --color-info-soft:var(--info-soft);
}
body { background:var(--background); color:var(--foreground); }
*:focus-visible { outline:2px solid var(--ring); outline-offset:2px; }

/* component recipes (plain CSS, theme-safe) */
.btn-primary{background:var(--brand);color:var(--brand-foreground);border-radius:10px;padding:.5rem 1rem;font-weight:500;transition:transform .12s,filter .15s}
.btn-primary:hover{filter:brightness(1.1)} .btn-primary:active{transform:scale(.97)}
.btn-secondary{background:var(--card);color:var(--foreground);border:1px solid var(--border);border-radius:10px;padding:.5rem 1rem;font-weight:500;transition:transform .12s,background .15s}
.btn-secondary:hover{background:var(--muted)} .btn-secondary:active{transform:scale(.97)}
.chip{display:inline-flex;align-items:center;gap:.375rem;border-radius:999px;padding:.125rem .625rem;font-size:.75rem;font-weight:500}
.chip-running{background:var(--info-soft);color:var(--info)} .chip-waiting{background:var(--warning-soft);color:var(--warning)}
.chip-done{background:var(--success-soft);color:var(--success)} .chip-failed{background:var(--danger-soft);color:var(--danger)}
.chip-brand{background:var(--brand-soft);color:var(--brand-text)} .chip-muted{background:var(--muted);color:var(--muted-foreground)}
.surface{background:var(--card);color:var(--card-foreground);border:1px solid var(--border);border-radius:14px}
.glass{background:color-mix(in srgb,var(--card) 72%,transparent);backdrop-filter:blur(14px);border:1px solid var(--border)}
.code{background:var(--code-bg);color:var(--code-fg)}
```

## 4. Step 3: provider and toggle
`src/theme/ThemeProvider.tsx`
```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";
const KEY = "epochslab-theme";
interface Ctx { theme: Theme; resolved: Resolved; setTheme: (t: Theme) => void; toggle: () => void }
const ThemeCtx = createContext<Ctx | null>(null);

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
const read = (): Theme => {
  try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" || v === "system" ? v : "system"; }
  catch { return "system"; }
};
const resolve = (t: Theme): Resolved => (t === "system" ? (prefersDark() ? "dark" : "light") : t);
const apply = (r: Resolved) => {
  const el = document.documentElement;
  el.classList.toggle("dark", r === "dark");
  el.style.colorScheme = r;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(read);
  const [resolved, setResolved] = useState<Resolved>(() => resolve(read()));

  const setTheme = useCallback((t: Theme) => {
    try { localStorage.setItem(KEY, t); } catch { /* storage unavailable */ }
    setThemeState(t);
  }, []);

  useEffect(() => {
    const r = resolve(theme);
    setResolved(r); apply(r);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { const n: Resolved = mq.matches ? "dark" : "light"; setResolved(n); apply(n); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setThemeState(read()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(() => setTheme(resolved === "dark" ? "light" : "dark"), [resolved, setTheme]);
  const value = useMemo(() => ({ theme, resolved, setTheme, toggle }), [theme, resolved, setTheme, toggle]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
```
`src/theme/ThemeToggle.tsx`
```tsx
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition active:scale-95 hover:bg-muted ${className}`}
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
```
`src/main.tsx`: wrap the whole app (above any router and above the dashboard layout):
```tsx
<ThemeProvider><App /></ThemeProvider>
```
Delete the old local theme state, hook or `useState` in the dashboard layout.

## 5. Step 4: put the toggle on every page
- Landing navbar (desktop right side and inside the mobile menu): `<ThemeToggle />`.
- App top bar: replace the existing sun icon button with `<ThemeToggle />`.
- Any page without a header (login, 404, onboarding): `<ThemeToggle className="fixed right-4 top-4 z-50" />`.
- The landing hero and the pipeline timeline are always dark navy by design: add `className="force-dark bg-background text-foreground"` to those sections so they look identical in both themes (the `.force-dark` block in the CSS gives them dark tokens).

## 6. Step 5: migrate hardcoded colors (this is what actually fixes the unreadable text)
Find offenders:
```bash
grep -rnE "(bg|text|border|ring|from|to|via)-(white|black|slate|gray|zinc|neutral|stone|indigo|violet|purple|blue)(-[0-9]{2,3})?|\[#[0-9a-fA-F]{3,8}\]|#[0-9a-fA-F]{6}" src --include=*.tsx --include=*.ts --include=*.css | grep -v "src/index.css"
```
Replace with tokens:
| Old | New |
|---|---|
| `bg-white`, white cards | `bg-card text-card-foreground` |
| page background (`bg-slate-50`, `#F6F7FB`, navy) | `bg-background` |
| sidebar background | `bg-sidebar text-sidebar-foreground` |
| `text-slate-900`, `#172033` | `text-foreground` |
| `text-slate-500/600`, faint labels | `text-muted-foreground` |
| `border-slate-200`, `border-white/10` | `border-border` |
| `bg-slate-100`, hover/track backgrounds, progress track | `bg-muted` |
| purple buttons / purple text | `.btn-primary` / `text-brand-text` |
| purple tinted tiles and badges | `bg-brand-soft text-brand-text` |
| status badges (running, waiting, done, failed) | `.chip-running`, `.chip-waiting`, `.chip-done`, `.chip-failed` |
| secondary buttons ("Review Gate", "Live Kernel", "Export") | `.btn-secondary` |
| shadows in dark mode | `border border-border` (drop heavy shadows) |
| SVG chart strokes and fills | `stroke="var(--brand-text)"`, `fill="var(--muted)"`, `currentColor` |
| code and log blocks | `.code` plus `var(--tok-kw)`, `--tok-str`, `--tok-num`, `--tok-com`, `--tok-fn` for syntax colors |
Do not use `dark:` variants for these (the tokens already switch). Use `dark:` only for rare one-off tweaks.

Fixes for your screenshot specifically: project rows to `.surface`; row titles `text-foreground`, descriptions `text-muted-foreground`, stage label ("Preprocessing") `text-muted-foreground` (not lower contrast); progress track `bg-muted` with fill `bg-warning` / `bg-brand` / `bg-success`; stat cards `.surface` with an icon in `bg-brand-soft text-brand-text`; "Waiting for approval / In progress / Completed" to `.chip-waiting / .chip-running / .chip-done`; "Review Gate / Live Kernel / Export Report" to `.btn-secondary`; the active "Overview" nav pill `bg-brand text-brand-foreground`; sidebar `bg-sidebar`; recent-activity icon tiles `bg-muted text-muted-foreground`.

## 7. Verify (5 minutes)
- Toggle on every route (landing, hero, pipeline timeline, pricing, FAQ, app home, project page, logs dock, dialogs, menus, toasts). Reload: the theme persists, no flash of the wrong theme.
- Run the grep again: it should only list intentional hits.
- DevTools > Rendering: emulate `prefers-color-scheme` and confirm "system" works.
- Contrast: every text at least 4.5:1 (Lighthouse accessibility or the DevTools contrast picker). The token values above were chosen to pass.
