# Klipse product extraction baseline

- Captured: 2026-08-11; product location and commit recorded 2026-08-14
- Authority: reference, non-normative
- Product repository: `klipse-web` at `/Users/sejunki/klipse-web`
  (`KlipseAI/klipse-web`, user-confirmed 2026-08-15 — **AWS 전환을 마친 최신 저장소**)
- Product branch: `design`
- Product commit: 여기에 적지 않는다 — 기준 커밋의 정본은
  [`migration/product-evidence.lock.json`](product-evidence.lock.json)의 `productCommit`이다.
  (이 기준선을 처음 기록한 2026-08-14 시점의 커밋은 `086f4a62` 였다 — 기록이지 현재 기준이 아니다.)

**2026-08-15 정정.** 그 전까지 이 문서는 `sniperfactory-official/klipse`의 `louis` 브랜치
(`0d188651`, 2026-08-04)를 가리키고 있었다. 저장소도 조직도 다르고 열흘 오래된 것이었다.
205축 실측과 143건 판정은 그 저장소를 대상으로 했다.

다시 대조한 결과는 이렇다. 근거 파일 13개가 **양쪽에 모두 존재**하고 11개는 내용이 같다.
`ui/Button.tsx`는 완전히 동일하다. `globals.css`는 인용한 35개 선언 중 34개가 그대로 옮겨갔고,
`--glass-dropdown-frame` 하나만 값이 바뀌어 해당 축을 다시 판정했다. 즉 측정 결과 자체는
유효하지만 **기준선 표기가 틀려 있었다.**

이 사고의 교훈은 문서에 남긴다 — 제품 저장소 경로는 사용자 확인을 받았다는 사실만으로 계속
유효하지 않다. 조직이 바뀌거나 저장소가 갈라지면 같은 이름의 다른 저장소를 재게 된다.
- Original 2026-08-11 extraction commit: not recorded because the source design files were
  intentionally untracked. Later inventories use the commit above.
- Design-system target: this repository

## Product design-truth surfaces

제품 저장소 밖에도 제품 실측 근거가 있다. 이 표의 항목은 정본이 아니라 reference evidence다.

| Surface | 위치 | 내용 |
| --- | --- | --- |
| 제품 CSS 정본 | `apps/web/app/globals.css` (제품 저장소) | 타이포 스케일, 색·간격 custom property. 제품의 `check-typography` 게이트가 강제 |
| 제품 미러 Figma 파일 | Figma `CNORJOONt4z0a4Bl22Kjuu` "Klipse 3.0" | 아래 참조 |

## Evidence index

| ID               | Product-repository evidence                                   | Used by                      |
| ---------------- | ------------------------------------------------------------- | ---------------------------- |
| `KP-LAYOUT-001`  | global App Shell tokens and navigation implementation         | Responsive Layout, App Shell |
| `KP-GRID-001`    | Home, Video Editor, Highlight history 2/3/4/5-column behavior | Project Grid                 |
| `KP-EDITOR-001`  | route editor, docked editor and global navigation composition | Editor Workspace, Dialog     |
| `KP-OVERLAY-001` | profile menu, create menu, custom dropdown implementations    | Menu / Popover               |
| `KP-DIALOG-001`  | confirm, project, signup and editor modal implementations     | Dialog                       |
| `KP-LOADING-001` | spinner, inline loading and page skeleton implementations     | Loading                      |
| `KP-FIGMA-001`   | product-mirroring Figma file "Klipse 3.0" surveyed 2026-08-14 | Figma track, catalog gap     |

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

### KP-FIGMA-001

2026-08-14에 Figma 파일 `CNORJOONt4z0a4Bl22Kjuu`("Klipse 3.0")를 읽기 전용으로 조사했다. 이 파일은
제품 코드를 정본으로 선언하고 그것을 미러링한 결과물이며, **이 저장소의 정본이 아니다.** 카탈로그
gap 판정과 화면 재조립 목표의 reference evidence로만 쓴다.

관측 사실:

- 변수 211개 / 4 collection — `Primitives`(108, 1 mode), `Dimensions`(37, 1 mode),
  `Semantic`(39, Light·Dark), `Localization`(27, KOR·ENG·JPN).
- 텍스트 스타일 27개. 설명이 모두 `SSOT: apps/web/app/globals.css`와 `--type-*` custom property를
  가리킨다. 스케일은 heading 48/36/28 · body 20/16/14 · caption 12 × Regular/Medium/SemiBold이며
  display 64는 장표 전용, body 28은 legacy로 표시돼 있다.
- 컴포넌트 95개(component set 36 + 단독 59). 섹션 구성은 App Shell, Video Editor, Node Canvas,
  Primitives, Data Display, Commerce, Auth, Marketing & Docs.
- 화면 프레임 70개가 `/`, `/pricing`, `/templates`, `/blog`, `/docs`, `/login`, `/signup`,
  `/settings`, `/mypage/*`, `/nodecanvas`, `/videoeditor`, `/highlight`, `/analytics/youtube` 등
  ~35개 route를 light/dark로 덮는다.
- **화면 프레임의 component instance는 0개다.** 화면이 라이브러리로 조립된 것이 아니라 그려져 있다.

이 저장소의 계약에 주는 입력:

- 제품이 실제로 쓰는 색 계열(mint, pink, sky, violet, amber, yellow, green 등)과 타이포 스케일이
  현재 `packages/tokens/src/klipse.tokens.json`의 범위보다 넓다. 배포 화면 재조립(목표 B)을 하려면
  token source의 coverage 확장이 선행돼야 하며, 그 범위 판정은 화면 인벤토리와 함께 수행한다.
- 카탈로그 8 component 밖의 재사용 단위(Table, Badge, Avatar, Spinner, Skeleton, Switch, Tab,
  Pagination, StatTile 등)가 제품에 실재한다. DS-P3-009 우선순위의 근거다.
- 이 파일에는 쓰지 않는다. 디자인 시스템 라이브러리는 별도 파일이 소유한다
  ([Figma Sync Governance](../design/governance/figma-sync.md)의 운영 파일 절).

## Extraction decisions

- Product CSS-derived `design/tokens.yaml` was not promoted to token source.
- Product Web/Figma completion statuses were reset to `not-ready`.
- Acceptance contracts were retained; file/line evidence was moved out of normative docs.
- Product defects remain product debt until a new DS package implementation is adopted and verified.

Because the source design files were not committed, this baseline cannot claim byte-identical provenance.
The first tracked commit of this repository becomes the portable P1 baseline.
