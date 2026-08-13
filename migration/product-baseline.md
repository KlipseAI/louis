# Klipse product extraction baseline

- Captured: 2026-08-11
- Authority: reference, non-normative
- Product repository: `klipse`
- Product commit: not recorded because the source design files were intentionally untracked
- Design-system target: this repository

## Evidence index

| ID               | Product-repository evidence                                   | Used by                      |
| ---------------- | ------------------------------------------------------------- | ---------------------------- |
| `KP-LAYOUT-001`  | global App Shell tokens and navigation implementation         | Responsive Layout, App Shell |
| `KP-GRID-001`    | Home, Video Editor, Highlight history 2/3/4/5-column behavior | Project Grid                 |
| `KP-EDITOR-001`  | route editor, docked editor and global navigation composition | Editor Workspace, Dialog     |
| `KP-OVERLAY-001` | profile menu, create menu, custom dropdown implementations    | Menu / Popover               |
| `KP-DIALOG-001`  | confirm, project, signup and editor modal implementations     | Dialog                       |
| `KP-LOADING-001` | spinner, inline loading and page skeleton implementations     | Loading                      |

## Evidence details

### KP-LAYOUT-001

- Sources: `apps/web/app/globals.css`, `apps/web/components/navigation/Gnb.tsx`
- Sidebar width custom property drove parts of the main offset.
- Authenticated scenes used two outer-shell compositions with different gaps and scroll ownership.
- The 720–959px range depended on a 960px document minimum and horizontal scrolling.
- Profile, menu, toast, modal and editor layers used unrelated numeric z-index values.

### KP-GRID-001

- Sources: Home, Video Editor and Highlight scene/style implementations.
- Home/history grids produced 2/3/4/5 columns at ≤719/720/1200/1800 viewport thresholds.
- Home used the visible column count as the recent-project request limit.
- Some card primary actions used a pointer-only article click.
- Resize could refetch the whole recent row and destabilize card order.

### KP-EDITOR-001

- Sources: route EditorProjectWorkspace, VideoEditModal and global navigation.
- One editor implementation inferred route/docked versus modal behavior from portal host presence.
- Regular docked mode was host-relative; compact mode changed to a viewport-fixed root.
- The compact grid omitted an explicit assets area.
- Local floating UI and global profile/modal layers could compete across body and host portals.

### KP-OVERLAY-001

- Sources: profile popover, create menu and custom dropdown implementations.
- The profile panel remained mounted while closed and mixed composite controls with nested portals.
- The open trigger could receive `pointer-events:none`.
- Parent and nested overlays did not share a common branch registry.
- The observed user regression was “panel opens, menu items cannot be selected.”

### KP-DIALOG-001

- Sources: confirm, project, highlight, legal and editor modal implementations.
- Escape, initial focus, focus trap, return focus, inert and scroll lock differed by consumer.
- Some confirm flows accepted document-level Enter even for destructive actions.
- Close timers and visual exit durations were not consistently sourced together.

### KP-LOADING-001

- Sources: inline loading label, spinner and route-level skeleton/shimmer implementations.
- Spinner and inline label existed, while skeleton/shimmer recipes were duplicated.
- Button loading, live-region and reduced-motion behavior was not owned by one public API.

Exact historical paths, route audits and the 324-item debt registry remain in the product repository:

- `DESIGN_SYSTEM.md`
- `design/pages/10.1.md` through `design/pages/10.12.md`
- `design/audits/debt.json`
- `apps/web/app/globals.css`
- `apps/web/components/navigation/Gnb.tsx`
- Home, Highlight and Video Editor scene implementations

## Extraction decisions

- Product CSS-derived `design/tokens.yaml` was not promoted to token source.
- Product Web/Figma completion statuses were reset to `not-ready`.
- Acceptance contracts were retained; file/line evidence was moved out of normative docs.
- Product defects remain product debt until a new DS package implementation is adopted and verified.

Because the source design files were not committed, this baseline cannot claim byte-identical provenance.
The first tracked commit of this repository becomes the portable P1 baseline.
