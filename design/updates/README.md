---
id: updates-overview
status: beta
authority: normative
---

# Updates

> **⚠ 이 문서의 과거 항목 중 글래스 섀도우 서술은 더 이상 유효하지 않다.**
> 제품이 `--glass-dropdown-frame`(5겹) · `--glass-bevel-*` · `--glass-inner-shadow-rgb`를 **걷어냈다**.
>
> **그 뒤를 받았던 `--dropdown-*` 계열 일곱도 지금은 제품에 없다.** `--dropdown-frame` ·
> `--dropdown-frame-on-dark` · `--dropdown-ambient-shadow` · `--dropdown-surface-bg` ·
> `--dropdown-radius` · `--dropdown-padding` · `--dropdown-item-radius`를 P#1이 걷어냈고, 지금은
> 제품이 LOUIS 정본(`--louis-hairline-inset` · `--louis-elevation-menu` · `--louis-color-bg-menu` ·
> `--louis-radius-overlay` / `-item` · `--louis-space-overlay-inset`)을 직접 소비한다.
> 헤어라인 색은 **라이트/다크로 갈린다** — 아래 항목 중 「라이트/다크 값이 같다」고 적은 것들은
> `--dropdown-frame` 시절의 기록이다.
> [Elevation & Layer](../foundations/elevation-layer.md) 「프레임 — 글래스는 폐지됐다」와
> [읽기 함정](../foundations/product-reading-traps.md) 2절의 대응표가 정본이다.
>
> 아래 항목들은 **그 시점의 기록**이므로 고치지 않고 남긴다. 현재 값의 근거로 인용하지 마라 —
> **토큰 이름도 마찬가지다.** 정본 브랜치도 `origin/main`에서 **`design`**으로 바뀌었다
> ([읽기 함정](../foundations/product-reading-traps.md) 참조).

디자이너와 개발자가 알아야 할 사용자 영향 변경과 migration을 최신순으로 기록한다.

## 2026-09-14 (131) — 제품 앵커 6f6282c1 — 프로필 버튼 32px 과 그만큼 낮아진 상단 바를 따라간다

제품 앵커를 `6fbdac16` 에서 `6f6282c1` 로 옮긴다. 그 사이의 제품 커밋 하나가 **모든 페이지의 프로필
버튼을 캔버스 에디터 헤더와 같은 크기로 줄였다**(소유자 요청) — 아바타 28 → 24, 링을 두른 버튼
36 → 32. 그 버튼이 앱 상단 바에서 가장 큰 자식이라 바도 함께 낮아졌고 — 바는 높이를 선언하지 않고
패딩 8 + 가장 큰 자식 + 패딩 8 + 헤어라인으로 계산된다 — **소유자가 낮아진 바를 새 기준으로 받아들였다
(2026-09-14).** 계산된 높이는 수로 적지 않는다(소유자 지적, 아래 「상단 바 사슬」 절). 앵커 이동 스크립트는
`measure-product-components` 에서 「제품이 렌더한 값은 32인데 DS는 36입니다
(progress-ring.sizes.base.size)」로 멈췄다. 이 항목은 앵커 이동의 단계마다 절을 더한다 — 상단 바 높이가
번지는 자리(앱 셸 계약 · Figma 셸 매처 · DS-D-0048)는 긴 재측정 뒤의 절이 적는다.

### ProgressRing 의 기준 지름을 32 로 옮긴다

**제품 선언**(명령 `git -C "$KLIPSE_PRODUCT_REPO" show "6f6282c1:$(node -p 'require("./migration/citation-aliases.json").aliases["Gnb.tsx"]')" | nl -ba` — 앱 셸 `Gnb.tsx`):

- 1470행: `    "[--profile-avatar-size:24px]",`
- 1474행: `    "[--profile-ring-gap:2px]",`
- 1475행: `    "[--profile-ring-width:2px]",`
- 1476행: `    "[--profile-ring-size:calc(_var(--profile-avatar-size)_+_(var(--profile-ring-gap)_+_var(--profile-ring-width))_*_2_)]",`
- 1507행: `    "[@media(max-width:480px)]:[--profile-avatar-size:24px]!",`

같은 커밋이 `scenes/create/ProjectHeader.tsx` 의 `PROFILE_SLOT`(336–338행)에서
`[&_[class*=profileTrigger]]:[--profile-avatar-size:24px]!` 줄을 걷었다 — 크기를 두 곳이 쥐지 않게 한 것이다.
**링 두께 2 · 간격 2 는 그대로다.** 바뀐 것은 아바타 한 값이고 버튼은 식대로 `24 + (2 + 2) × 2 = 32` 다.

**무엇이 바뀌나:**

| 자리 | 전 | 후 |
| --- | --- | --- |
| `figma/components.measured.json` `progress-ring.sizes.base.size` | 36 | **32** |
| 같은 자리 `contentSize` | 28 | **24** |
| `progress.browser.test.tsx` 의 링 내용 | 리터럴 28px | 기록의 `contentSize` 를 읽는다 — 지름이 `contentSize + gap-plus-width × 2` 인지도 본다 |
| Storybook `Components/Progress` Ring 내용 | 28 | 24 |
| 표본 `progress-ring/projectHeaderSlot` | 「슬롯 훅이 아바타를 줄인다」 | 슬롯이 크기를 덮지 않는다 — 두 표본(`gnbTopBar` · `projectHeaderSlot`)이 이제 같은 32 · 24 를 잰다. `jsx` 좌표도 `6f6282c1` 로 옮겼다 |
| 앱 셸 생성기 `build-figma-product-app-shell.mjs` 의 프로필 가드 | 버튼 · 링 36 · 아바타 28, 인용 줄 1467–1501 | 32 · 24, 인용 줄 1470–1504(아바타 줄은 `24px`) — 인증 fixture 를 새 앵커로 다시 잰 뒤에야 돈다 |

**웹 소비처의 렌더는 바뀌지 않는다.** `.louis-progress-ring` 은 지름을 계산하지 않고 padding(두께 + 간격)으로
내용에서 얻는다 — 토큰도 CSS 도 React 도 그대로다. 바뀐 것은 **기준 모습**이다. 제품 프로필 버튼과 같은
32 를 내려면 `Avatar` 의 `size="sm"`(24)을 감싼다. 기본 `md`(28)를 감싸면 예전 36 이 나온다.

**Avatar 의 크기 칸은 그대로다(md 28 · sm 24).** 두 칸은 제품 `--profile-avatar-size` 가 두 값이던 때
옮겼는데, 이제 프로필 트리거에 남은 것은 sm 뿐이다. 기본을 sm 으로 옮기면 크기를 적지 않은 모든
소비처가 줄어드는 breaking 이라 앵커 이동에서 하지 않았고, 그 사실을 [Avatar](../components/avatar.md)
Known deviations 에 적었다. 문서 [Progress](../components/progress.md) · [Avatar](../components/avatar.md) ·
`migration/figma-gap-registry.md` 의 프로필 트리거 크기 서술(28px 기본 · ProjectHeader 24px 덮어쓰기)을
새 사실로 고쳤다.

**재측정.** `measure-product-components` 가 어긋난 축 2 → 0 으로 초록이 됐고
(`product.rendered-components.json`), `measure-product-variants` 가 두 링 표본을 32 · 24 로 다시 쟀다
(`product.variants.json`).

**Figma 마스터는 아직 36 이다 — 그래서 Progress 의 Figma 상태를 `done` 에서 `partial` 로 내린다.**
라이브 `ProgressRing`(Track 36 · Content 28, `figma/readback.json` 의
`components.ProgressRing.geometry.base`)이 새 기록(32 · 24)과 어긋나 `verify-figma-parity` 가
ProgressRing 의 width · height · Track · Content 여섯 축으로 빨갛다. DS-D-0035 의 `done` 은 그 parity 가
서 있다는 주장이므로 지금 `done` 으로 두면 거짓이다. Figma 쓰기는 소유자 승인이 필요한 단계라 이 앵커
이동 안에서 하지 않았고, 상태를 사실에 맞춰 내렸다:

| 자리 | 전 | 후 |
| --- | --- | --- |
| `design/manifest.json` `progress.figma` | `done` | **`partial`** — note 에 사유와 되올리는 조건 |
| [Progress](../components/progress.md) Availability Figma 행 | `done` | **`partial`** — Known deviations 에 마스터 낙후 한 줄 |
| `scripts/check-coverage-targets.mjs` `MANIFEST_DONE_FLOOR` | 24 | **23** — 강등이 어디서 왔는지 주석으로 적었다 |

**상태를 내려도 `verify-figma-parity` 는 초록이 되지 않는다.** 그 게이트는 manifest 상태가 아니라
기록과 되읽기를 대조하므로, 이 변경은 거짓 `done` 을 걷을 뿐 빨간 게이트를 끄지 않는다 — 그리고 그
게이트는 `verify:ci` 갈래에 있다. **라이브 마스터를 옮기기 전에는 앵커 이동을 푸시하지 않는다** — 작업
브랜치에 커밋은 하되, 그 커밋들만으로는 `verify:ci` 가 초록이 아니다.
닫는 길은 하나다: 승인을 받아 `ProgressRing` 마스터를 Track 32 · Content 24 로 옮기고,
`figma-readback-emit --components --only ProgressRing` 과 `build-figma-snapshot` 으로 되읽기를 다시 뜬 뒤
`verify-figma-parity` 가 초록이면 `progress.figma` 를 `done` 으로, `MANIFEST_DONE_FLOOR` 를 24 로
되올린다. ProgressBar 는 이 어긋남과 무관하다.

### 상단 바 사슬 — 계산된 높이를 숫자로 굳힌 자리를 걷는다

**뿌리.** 제품 바(`mainChromeTopBar` + `mainChromeTopBarInPanel`)는 높이를 선언하지 않는다 — `Gnb.tsx:460`
`[min-block-size:0]` 과 `Gnb.tsx:483` `[padding:8px_var(--mainchrome-pad-x)]` 뿐이라 높이는 가장 큰 자식이
정한다. 그런데 그 **계산 결과**가 Figma 세트의 FIXED 높이 · 치환 매처의 `=== 53` · 생성기 가드와 파생
리터럴(편집기 본문 · 하이라이트 허브 뷰포트 · 업로드 좌표)로 흩어져 있었고, 절반은 리터럴끼리 비교해
초록인 채 틀렸다(크기 굳힘 감사 묶음 1). 이번 앵커가 그 사슬을 한꺼번에 낡게 했다.

**무엇이 바뀌나:**

| 자리 | 전 | 후 |
| --- | --- | --- |
| Figma `Product/Mobile App Top Bar` variant | `layoutMode NONE` 절대배치, nav FIXED 폭 + clip | 가로 Auto Layout · 높이 HUG · 폭은 세트 기본값만 FIXED(소비처 FILL) · 앞머리 HUG · 프로필 선언 크기 · nav FILL, 마지막 글자 FILL + 끝 말줄임 |
| Figma `Product/Desktop App Top Bar` variant | 세로 FIXED 바 + FIXED 행(`flow/header-row`) + 1px 프레임 | 모바일과 같은 가로 행 하나. 아래 선은 `Klipse Semantic/border-width/hairline` 획을 레이아웃에 포함. 옛 두 프레임은 **지우지 않고** 비워 `retired/` 로 숨긴다 |
| 앱 셸 러너의 기존 variant | — | 앞머리 · breadcrumb · 프로필은 **같은 노드를 옮긴다**(노드 id 보존 → 인스턴스 TEXT 속성 값 · override 유지). 적용 뒤 `layoutContract` 를 스스로 대조해 어긋나면 던진다 |
| 앱 셸 생성기 가드 | 프로필 32 · 24, 컨트롤 32, 글리프 20 리터럴 | 제품 선언(`--profile-ring-size` calc · 토글 `[width:32px]` · 토글 svg)에서 푼 값. 바 높이 · 폭 · 앞머리 폭이 제품 식으로 닫히는지 대조 |
| 치환 매처 `figma-component-substitution.mjs` | `Math.round(rect.height) === 53` + nav 자손 | 구조 — nav 를 직접 자식으로 두고 앞 형제가 버튼을, 뒤 형제가 버튼을 품는 흐름 노드. 옛 앵커 fixture 에서 36보드 applied 목록이 커밋된 계획과 전부 같다 |
| `build-figma-product-sidebar-states` | 바 52 · 본문 1832×996 · 미리보기 1259 · 위 칸 656, 좌 16 / 우 8 / 위 0 식(감사 G1) | 셸 인셋은 측정(`--app-gnb-main-inline-padding`, 원장에 새로 실음) 사방, 격자 트랙은 선언 기본값만, 1fr 칸은 FILL. 편집 화면이 이제 풀화면(`variant="create"`)이라는 사실을 근거와 함께 계획에 남겼다 |
| `build-figma-product-highlight-hub` | main 1628 · 뷰포트 1003 · y 53 · 업로드 y 908 · 좌우 인셋 16/16 | main 카드 · 인셋 좌 16 / 우 `-end`(원장 측정) · 열 수 · 여백 · 업로드 400×140 · bottom 20(인용). 렌더러는 격자 폭 · 카드 한 변 · 뷰포트를 라이브 프레임에서 계산 |
| `build-figma-product-upgrade-scene` | `topBar.height !== 53` · `content.y !== 53` | 앱 셸 계획의 같은 바와 같은 상자인지, 본문이 바 바로 아래인지 |
| 앱 화면 보드(`figma-tree-spec` · 렌더러) | 세로 flex 의 `flex-wrap` 을 WRAP 으로 실어 러너가 멈출 자리(`/subscription` 모바일) | wrap 은 HORIZONTAL 에만. 표현하지 못한 자리는 `stats.verticalWrap` |
| 문서 | `app-shell-parts.md` 「실효 높이 52px」 · 후행 슬롯 36 · portal 52 = 8+36+8, DS-D-0018 「52px(8+36+8)」, `icon-button.md` 36 행 | 산식(패딩 8 + 가장 큰 자식 + 패딩 8 + 헤어라인)과 선언 좌표. 측정값은 `figma/product-app-shell.plan.json` 이 갖는다. DS-D-0048 에 앵커 이동 절 |

**재발 방지.**

- `scripts/check-derived-size-literals.mjs`(verify:ci) — Figma 생성기(`build-figma-*.mjs`) · 라이브러리
  (`lib/figma-*.mjs`) · **렌더러 템플릿(`scripts/templates/`)** · `figma-screens-live-check.mjs` 에서 선언 인용이
  붙지 않은 크기 리터럴을 파일별로 센다. 꼴은 다섯이다 — 크기 식과 수의 비교(`===` · `!==` · 부등호, 멤버와
  `bodyWidth` 같은 크기 이름 식별자 둘 다), 크기 이름 리터럴 대입(`const headerHeight = 52`), 객체 리터럴의
  `width|height|x|y: <수>`, `resize` · `fixed` 류 호출의 수 인자, `Math.abs(…)` 안의 크기 오프셋. 선언 줄
  (`// 선언: <경로>:<줄>`)은 세지 않는다. 기준선보다 늘어도, **줄어도** 실패한다(고친 만큼 내려 잠근다).
  **첫 판은 이 사슬을 잡지 못했다.** 비교 한 꼴(`rect.height !== 53`)만, 생성기 · 라이브러리에서만 셌기
  때문에, 그 규칙을 이 묶음의 수정 전 트리(`3e56bec`)에 돌리면 `headerHeight = 52` · `bodyWidth !== 1832` ·
  `mainCardWidth = 1628` · `viewport: { height: 1003, y: 53 }` 이 있던 생성기가 0 이었고, `fixed(leading, 68, 36)`
  이 있던 렌더러는 범위 밖이었다(규칙을 그대로 대 봐도 0). 지금 규칙은 같은 트리에서 그 줄들을 모두 센다. `verify-gates` 의 canary 는 꼴마다
  하나씩 오염을 넣고 꼴 이름과 그 줄을 기대 진단으로 물며(템플릿 오염 하나로 범위도), 기준선을 내리지 않는
  방향도 문다.
  기준선의 수는 「파생값」이 아니라 **「인용 없는 크기 리터럴」**이다. 결제 · 업그레이드 · 요금제 장면의 뷰포트 ·
  카드 가드(묶음 2 · 3 · 5)에 더해, 보드 캔버스 배치값(섹션 · 문서 프레임 · 세트 크기), 앱 셸 생성기의 Figma
  글리프 실측표, 사이드바 상태 렌더러의 접힌 레일 조각이 들어 있다. 파일별 내역은 게이트의 `BASELINE` 주석이
  갖는다. **여전히 하한이다** — 크기 이름이 아닌 이름(`rows.upper !== 656`), 간접 비교, 계산식 인자
  (`resize(40 + i * 560, …)`), 노드 위치 대입(`node.x = 868`), 줄을 넘는 식은 세지 못한다.
- `figma-screens-live-check --emit --sets` 가 상단 바 두 세트의 variant 마다 Auto Layout 축(layoutMode ·
  축 sizing · 헤어라인 레이아웃 포함)을 뜨고, `--check` 가 앱 셸 계획의 `layoutContract` 와 대조한다.

**재생성.** `scripts/regen-figma-at-anchor.sh --figma-only` 가 끝까지 초록이었다(낡은 생성물 핀 0).
36보드의 셸 치환 목록 · 인스턴스 84 · bespoke 25 · 후보 182 가 그대로라 보드 구성 기준선은 옮기지 않았다.

**라이브 적용은 하지 않았다.** 순서: 앱 셸 세트 러너 → `figma-screens-live-check --consumers <전> <후>` →
sidebar-states · highlight-hub · upgrade-scene 러너 → 보드 러너. 앱 셸 러너를 적용하면 **바를 인스턴스로 쓰는
모든 소비처의 높이가 식을 따라 낮아진다** — `--consumers` 가 그 크기 변화를 찍으므로 받아들인 소비처를
`--expect-change` 로 댄다. sidebar-states 러너는 옛 컬렉션(`1 · Palette` · `2 · Semantic`)을 찾아 라이브에서
돌지 않는 상태 그대로다.

## 2026-09-13 (130) — 앱 셸 상단 바에 조합 넷과 라벨 속성을 더하고, 화면 보드를 라이브와 대조하는 도구를 세운다

**Figma 계획만 바뀌었다. 라이브 Figma 에는 아직 쓰지 않았다** — 적용 순서와 승인은
[인계서](../governance/handoff-2026-08-23-figma-product-pages.md) 「다음 순서」 1번이 소유한다. 웹 패키지·토큰은
바뀌지 않는다.

**앱 셸 러너(`figma/product-app-shell.draw.js`)가 라이브 변수 체계로 옮겨 갔다.** 은퇴한 `1 · Palette` ·
`2 · Semantic` 대신 `Klipse Semantic Color`(Light) · `Klipse Primitive` 에 묶는다. 상단 바 면은 측정
(light fixture 의 `#fafafa`)과 값이 같은 `color/bg-surface` 다. 라이브 세트가 물고 있던 `palette-gray/800`
(#2b2f36)은 옛 다크 캡처의 값이라, 러너를 적용하면 **마스터의 상단 바 색이 바뀐다**. 면을 인스턴스에서 덮어쓰지
않은 소비처(화면 보드 generated · 결제 장면 컴포넌트)는 그 색을 받는다. 면을 덮어쓴 소비처(허브 보드 일곱 ·
legacy)에 번지는지는 적용해 보기 전까지 확인되지 않았다 — 아래 소비처 항목.

**상단 바 세트 조합:**

| 세트 | 더한 조합 | 출처 route |
| --- | --- | --- |
| `Product/Mobile App Top Bar` | `Width=Full, Breadcrumb=Trail, Back=True, Divider=On` | `/highlight/[projectId]?__phase=*` |
| `Product/Desktop App Top Bar` | `Content=Subscription, Breadcrumb=Single, Back=False, Divider=On` | `/subscription` |
| `Product/Desktop App Top Bar` | `Content=Highlight, Breadcrumb=Trail, Back=True, Divider=On` | `/highlight/[projectId]?__phase=*` |
| `Product/Desktop App Top Bar` | `Content=Home, Breadcrumb=Single, Back=False, Divider=On` | `/archive` |

`Divider=Off` 조합 둘은 제품 출처가 없지만(제품이 헤어라인을 늘 켠다) 라이브 인스턴스가 참조해 **지우지
않고 보존**한다 — 참조처는 legacy 둘과 허브 보드의 보이는 바 넷이다. 치환은 보존 조합을 쓰지 않는다.

**breadcrumb 는 TEXT 속성이다 — breaking.** 두 세트가 `Label`(Single) · `Parent`·`Current`(Trail)를 연다.
세트 단위 속성은 기본값이 하나라, 앱 셸 러너를 적용하면 **덮어쓰지 않은 모든 인스턴스가 기본 라벨을
보인다**(모바일 `Settings` · `Analytics / YouTube analytics`, 데스크톱 `Home` · …). 러너는 마스터 크기도
맞춘다(데스크톱 1628→1632, 모바일 Inset 370→390).

**그 세트의 소비처(2026-09-13 라이브 전수 — `figma-screens-live-check --emit --consumers`):**

| 소비처 | Mobile | Desktop | 누가 다시 채우나 |
| --- | --- | --- | --- |
| 화면 보드 generated 트리 | 11 | 10 | 보드 러너 — 새 계획이 측정 글자로 채운다 |
| 결제 장면 컴포넌트 안 | 7 | 7 | payment-scenes · checkout-status · upgrade-scene — 컬렉션 이전 뒤 다시 적용 |
| **손으로 조립한 허브 보드(보인다)** | 3 | 4 | **없음** — `/highlight` · `/videoeditor` · `/canvas` 두 뷰포트와 `/analytics/instagram` 데스크톱 |
| 숨긴 legacy 그룹 | 4 | 8 | 없음(숨김) |

허브 일곱은 루트 면과 글자 색을, 그중 여섯은 글자 내용도 인스턴스에서 덮어써 두었다. 마스터 변경이 이
override 를 어떻게 다루는지는 미확인이라, 적용 순서에 **적용 전 소비처 기준선과 적용 뒤 대조**가 들어갔고
허브 일곱의 처리는 소유자 결정으로 올라갔다(인계서 「다음 순서」 1번).

**앱 화면 계획(`figma/app-screens.*`):**

- 36 보드 모두 셸을 갖는다 — 상단 바를 새로 얻은 보드 13(highlight 12 · `/subscription` 데스크톱).
  `/archive` 데스크톱 바는 `Divider=On` 이다.
- 사이드바 활성 항목을 제품 `<Gnb currentPath>` 로 고쳤다 — highlight 여섯은 `Current=Highlight`,
  `/mypage/upgrade/billing-success` · `billing-fail` · `fail` 데스크톱은 `Current=Upgrade`(옛 계획은 둘 다 Default).
- 치환의 셸 variant 목록은 손 사본이 아니라 앱 셸·컴포넌트 plan 에서 읽는다. 사이드바 서명 가드가
  활성 항목이 측정과 어긋나면 생성을 멈춘다.
- `/mypage/upgrade` 데스크톱의 요금제 카드는 인스턴스가 아니다 — 라이브 `Product/Upgrade Plan Card` 세트는
  옛 넷(Trial · Basic · Pro · Max)이고 제품은 다섯이다. 세트를 다시 짓기 전까지 이 보드는 첫 적용에서 뺀다.
- archive 의 `Start a new project` 버튼이 사라진다 — 제품이 홈 배너 CTA 를 걷었다(`AppHomeScene.tsx:232`).
- 보드 원장 기준선: bespoke · 후보 바닥이 내려갔다(바 안 부품이 인스턴스로 들어갔다). 수와 사유는
  `scripts/check-figma-board-composition.mjs` 머리말이 소유한다. 대상이 사라진 canary 둘(②″ · ⑩)을 새 원장에서
  성립하게 다시 짰다.

**새 도구 `pnpm figma-screens-live-check`.** 라이브 화면 보드가 계획을 적용한 결과인지 대조한다 — generated
서브트리 「유형:이름」 해시, 인스턴스(세트·variant·TEXT 값), legacy 그룹, 세트·variant·TEXT 속성 존재.
읽기 전용 `use_figma` 로 돌리고 CI 에는 넣지 않는다. **계획 보드 전부를 탐침해야 통과한다** — 결과 파일을
빠뜨리면 빠진 보드를 대고 실패하고, 범위를 줄이는 것은 `--only` · `--allow-partial` · `--sets-only` 명시
플래그뿐이며, 적용에서 뺀 보드는 `--expect-differ <frameId>` 로 받는다. `--consumers` 모드는 상단 바 세트의
generated 밖 소비처를 기준선으로 뜨고 적용 뒤와 대조한다(보이는 변화가 있으면 실패, 받아들인 변화는
`--expect-change`). 쓰는 법은 [Figma Sync](../governance/figma-sync.md)
「화면 보드 라이브 대조」, 규칙은 [Figma 화면 조립 규칙](../governance/figma-screen-assembly.md) 27번이다.
2026-09-13 첫 실행: 라이브 36 보드 중 34 가 `9f8483a` 계획과 같고(archive 둘은 h1 글자만 다르다), 새 계획과는
0 이 같다 — 차이 목록이 곧 적용 결과다.

**랜딩 `/` 전용 측정 축은 짓지 않는다.** 소비자가 0 이다. 라이브 `/` 보드 `359:2032` · `359:2986` 은 제품
`8802565e` 개편 전 랜딩을 그린다. 판정과 다시 여는 조건은 인계서 「다음 순서」 4번.

## 2026-09-13 (129) — Web 아키텍처 Decision 6종의 모순을 걷고 owner 확인을 요청한다 (DS-P3-001)

DS-P3-001 은 2026-08-14 부터 「Decision 6종을 다 썼고 owner 확인만 남았다」로 `in-progress` 였다.
그런데 완료 근거인 「Decision·구현·manifest/status 가 서로 모순되지 않는다」가 성립하지 않았다.
owner 에게 묻기 전에 저장소가 스스로 고칠 것부터 고쳤다.

### Fixed — leaf 7개에 `"use client"` 가 없었다

[DS-D-0002](../governance/decisions/DS-D-0002-web-support-scope.md) 는 「leaf 모듈에 `"use client"`」를
정했지만 지키는 기계가 없었고, 그 사이 클라이언트 전용 코드를 쓰는 leaf 일곱이 지시문 없이
들어왔다. 모듈마다 무엇 때문에 클라이언트 전용인지 소스에서 확인했다.

| 모듈 | 클라이언트 전용인 이유 |
| --- | --- |
| `app-shell/app-shell.tsx` | `useEffect` · `useRef` (drawer Escape 를 `document` 에 건다) |
| `banner-carousel/banner-carousel.tsx` | `useState` · `useEffect` · `useRef` · 인라인 `onClick`·`ref` |
| `button/button.tsx` | 인라인 `onClick` 화살표 — 서버에서 직렬화할 수 없다 |
| `checkbox/checkbox.tsx` | `useEffect` · `useRef` · 인라인 `ref`·`onChange` |
| `project-card/project-card.tsx` | 모듈 최상위 `createContext` · `useContext` |
| `segmented-control/segmented-control.tsx` | 모듈 최상위 `createContext` · `useContext` · 인라인 `onChange` |
| `slider/slider.tsx` | `useState` · 인라인 `onChange` |

`text-field.tsx` 는 `useId` 만 쓰고 `app-shell-parts.tsx` 는 받은 핸들러를 넘기기만 해서 서버에서도
안전하다 — 붙이지 않았다. 판정 기준은 설치된 React 가 `react-server` 조건에서 **내보내지 않는** API
목록이다(`useId`·`useCallback`·`useMemo` 는 내보내고 `useState`·`createContext` 는 내보내지 않는다).

**소비자에게 달라지는 것.** Server Component 에서 `@klipse-design/react` 루트를 import 해도
`project-card.js` 가 서버 층에서 평가되지 않는다(전에는 거기서 `createContext` 가 없어 깨질 형태였다).
API·마크업·스타일은 바뀌지 않는다. 제품은 아직 이 패키지를 의존하지 않는다 — 잠복 위험을 채택 전에
걷은 것이다.

**다시 못 만들게 한다.** `scripts/check-react-client-boundary.mjs` (`pnpm check-react-client-boundary`,
`verify:ci`)가 세 가지를 본다 — 클라이언트 전용 코드(react-server 에 없는 API import · JSX 인라인 함수 ·
모듈이 만든 함수를 `on*`/`ref` 로 넘김)를 가진 모듈의 첫 문장이 `"use client"` 인가, 배럴과 패키지 루트에
지시문이 **없는가**, `dist` 가 지시문을 보존하는가. 마지막은 `check-react-dist` 가 재빌드와 비교해서
빌드 도구가 지시문을 걷는 도구로 바뀌면 함께 초록이 되는 자리다. 판정 경로마다 카나리아가
`verify-gates` 에 있다. 실제 RSC 번들러로 서버 층을 평가하는 검사는 아직 없다(DS-D-0002 Rollout 4).

### Fixed — 글리프 슬롯의 `svg` 가 소비자 클래스를 이겼다

[DS-D-0004](../governance/decisions/DS-D-0004-css-authoring.md) 저작 규칙은 「요소 선택자 금지 · 내부
특이도 0」이다. `.louis-menu-trigger__icon svg` · `.louis-select-trigger__icon svg` ·
`.louis-select-trigger__caret svg` 가 그것을 어겨 (0,1,1)이었고, 언레이어드 `styles.css` 뒤에 둔 소비자
클래스 하나가 **순서와 무관하게 졌다**(브라우저 실측: 7px 을 줬는데 20 · 20 · 12px). 세 곳을
`:where(svg)` 로 감쌌다.

| 소비자 | 달라지는 것 |
| --- | --- |
| `styles.css`(언레이어드) | 슬롯 안 글리프에 준 클래스 하나가 이제 이긴다(뒤에 올 때) |
| `styles.layer.css`(제품 경로) | 소비자 규칙이 `louis.component` 가 아닌 레이어에 있으면 없다 — 레이어가 특이도보다 먼저 가른다 |
| 클래스를 주지 않은 글리프 | 없다 — 여전히 슬롯을 채운다. `.louis-icon` 이 붙어도 같다 |

`packages/css/test/slot-glyph-specificity.browser.test.ts` 가 두 방향을 고정한다. `table.css` 의 요소
선택자 사슬은 고치지 않았다 — 표 마크업 계약과 행 규칙 우열을 따로 판정해야 한다(DS-D-0004 구현 대조).

### Changed — Decision 본문과 인계서·manifest 를 구현에 맞췄다

결정 자체는 하나도 바꾸지 않았다. 본문이 사실과 다르거나 서로 어긋나던 자리를 고치고, 각 Decision 에
대조 절을 붙였다. Status 는 여섯 모두 `proposed` 그대로다.

| Decision | 고친 것 |
| --- | --- |
| DS-D-0002 | Rollout 1 의 「TypeScript 7.0.2」→ 저장소가 고정한 `~5.9.3`(lockfile 5.9.3). 「pnpm `auto-install-peers` 기본값 `false` 라 React 19 가 아닌 소비자는 설치에서 막힌다」→ **틀렸다**: pnpm 공식 문서 기본값은 `true`, 실측(pnpm 10.30.2)에서 범위 밖 peer 는 경고 · exit 0 이고 `strict-peer-dependencies=true` 에서만 exit 1. `./icons` 서브패스로 발동한 tsdown 재검토 → `tsc` 유지(파일 단위 방출이 leaf `"use client"` 를 보존) |
| DS-D-0003 | 「미확인」에 남아 있던 nested Escape·scroll lock 을 확인됨으로(`overlay-stacking.browser.test.tsx` 138·153·239·260·279행). 「런타임 의존성 4개」는 직접 의존성 수이고 설치하면 `@radix-ui`·`@floating-ui` 20개라고 적었다 |
| DS-D-0004 | DS-D-0013(Tailwind 4)·DS-D-0020(theme.css 순서)이 바꾼 전제, 패키지 표의 `theme.css`, 실제 속성 이름(`data-louis-state` · `data-louis-overlay-mode`), **`tokens.css` 는 레이어 없는 `:root` 이고 `layer(louis.tokens)` 로 감싸는 것은 소비자의 CSS `@import` 문**이라는 계약(`packages/css/README.md` 「최소 import」에 예시를 더했다 — JS `import` 는 `layer()` 를 쓸 수 없다). 발동한 재검토 조건 판정 — 아래 표. **고치지 않고 기록만 한 모순** — 저작 규칙은 「소비자는 `layers.css` 를 **최초로** import」인데, 소비 제품은 자기 층 `theme, base, components` 를 먼저 선언하고 Tailwind theme 를 부른 뒤 `layers.css` 를 부른다. 그래서 LOUIS 층이 제품 `base` 층의 전역 reset 을 이긴다(Chromium: 제품 순서에서 Button `padding-inline-start` 12px, `layers.css` 를 맨 앞에 두면 0px). 사실은 `migration/klipse-web-adoption.md` 「층 순서」 행. 2026-09-14 owner 판정으로 규칙 문장을 고쳤다(아래 owner 표) |
| DS-D-0005 | 「axe-core 버전 고정」은 lockfile 고정이다(specifier `^4.13.0` → 4.13.0, CI `--frozen-lockfile`). hosted CI 로 발동한 2단계를 미룬 사유 — 발동 직후 46회 연속 빨강을 푸는 데 러너를 썼고 2026-08-22 부터 결제로 멈췄다. baseline 은 CI 에서만 만든다는 조건이라 로컬로 대신할 수 없다. SSR/hydration Rollout 은 절반(문자열 렌더만) |
| DS-D-0006 | accepted 된 DS-D-0036 과의 관계 절 — git 채널에서는 **sha 고정이 `fixed` 와 peer 범위의 설치 단계 역할을 대신**하고, changesets · `engines.node` 좁히기 · peer semver 복귀는 「첫 레지스트리 게시」로 이연 |
| DS-D-0009 | 결정과 구현 상태를 나눴다 — 바이너리 미동봉만 지켜지고 번호 붙은 결정 1~5 는 미구현. 후속은 DS-P3-014 소관 |

DS-D-0004 의 발동한 재검토 조건을 `pnpm build` 산출물로 쟀다.

| 조건 | 실측 | 판정(owner 확인 대기) |
| --- | --- | --- |
| 컴포넌트 25종 초과 → 생성기 재검토 | manifest `components` 51 · 저작 CSS 39 + pattern 1 | 발동. 생성기는 들이지 않는다 — 이득이 플랫폼 팬아웃인데 그 조건은 발동하지 않았다 |
| gzip 40KB 초과 **그리고** 미사용 규칙 절반 초과 | `styles.css` gzip -9 119,269B · **주석을 걷으면 16,972B**. 미사용 규칙 비율은 미실측 | 배포물 그대로면 초과, 규칙만이면 미달. AND 의 뒤 조건이 미실측이라 컴포넌트별 import 를 강제하지 않는다. 기준을 어느 쪽으로 볼지는 owner 판정 |

인계서 DS-P3-001 절은 spike 를 「남은 선행 조건」으로 적고 있었다. Decision 본문대로 **S1 완료 · S2 는
fallback 이 필요할 때만(비핵심) · S3 완료**로 고쳤다. manifest `webPackages` 의 evidence 에 박혀 있던
수(「recipe 8종」「아이콘 29개」「서브패스 16개」 등)는 걷고, 수를 내는 정본 파일과 명령을 가리키게 했다.

### owner 확인 요청 — Decision 6종의 `accepted` 전환

**repository owner 에게 요청한다.** 아래 여섯을 각각 `accepted` 로 전환해도 되는지 확인해 달라. 결정마다
하나씩 답하면 되고, 조건부 수락(「이 줄을 고친 뒤」)도 받는다. **확인 근거가 생기기 전까지 본문 Status 는
`proposed` 로 둔다** — 저장소가 스스로 `accepted` 를 쓰지 않는다([플레이북](../governance/execution-playbook.md)
「Decision 작성 규칙」). 이 요청의 기록으로 DS-P3-001 은 `done` 이 됐다.

| Decision | 수락하면 떠안는 것 | 되돌리기 조건 |
| --- | --- | --- |
| [DS-D-0002](../governance/decisions/DS-D-0002-web-support-scope.md) Web 지원 범위 | React 19 단일 major · ESM 전용 · leaf `"use client"` · `tsc`. peer 범위는 설치를 **막지 않고 경고만** 한다는 사실(pnpm 10 실측)과, 선언한 Firefox·Safari 하한이 테스트로 뒷받침되지 않고 RSC·hydration 검증이 아직 없다는 사실을 함께 받는다 | 두 번째 소비자가 React 18 을 요구하면 matrix CI 와 함께 범위를 넓힌다(넓히는 쪽은 minor). 번들 빌드가 필요해지면 client boundary 게이트를 먼저 통과시킨 뒤 전환한다 |
| [DS-D-0003](../governance/decisions/DS-D-0003-behavior-dependency.md) behavior dependency | Radix 하부 유틸 4종(설치 시 `@radix-ui`·`@floating-ui` 20개)과 그 유지보수 위험, Menu 선택 순서·Dialog mode·Escape·scroll lock 테스트를 우리가 소유하는 비용. fallback(React Aria 저수준 훅)의 RSC 호환(S2)은 확인하지 않은 채다 | 하부 유틸 유지보수가 끊기면 fallback 으로 옮긴다(public API 불변). 완제품 Menu·Dialog 로 돌아가는 것은 이 결정을 supersede 하는 ADR 이 필요하다 |
| [DS-D-0004](../governance/decisions/DS-D-0004-css-authoring.md) CSS 저작 방식 | authored plain CSS 두 벌 배포, `layer(louis.tokens)` import 계약, 요소 선택자 금지를 게이트 없이 리뷰로 지키는 상태(`table.css` 는 아직 위반). 발동한 재검토 조건 판정(생성기 불도입 · 컴포넌트별 import 미강제)도 함께 수락하는 것이다 — **gzip 40KB 를 주석 포함으로 볼지 제외로 볼지 정해 달라.** 그리고 **저작 규칙 「소비자는 `layers.css` 를 root layout 최상단에서 최초로 import」를 어떻게 볼지 정해 달라** — 소비 제품은 자기 층을 먼저 선언한 뒤 `layers.css` 를 불러 LOUIS 층이 제품 전역 reset 을 이기게 둔다. 이것을 규칙 위반(제품이 고칠 것)으로 볼지, 문장을 「LOUIS 층 가운데 최초로 — 소비자 층과의 상대 순서는 소비자가 정한다」로 고칠지다. **→ 2026-09-14 owner 판정: 문장을 고친다.** DS-D-0004 저작 규칙과 `packages/css/README.md` 「배포 파일」 표를 같은 뜻으로 고쳤다 | 두 벌에서 한 벌로 줄이는 것은 minor. 멀티 브랜드·iOS/Android 요구가 생기면 recipe 소스 분리를 다시 연다 |
| [DS-D-0005](../governance/decisions/DS-D-0005-test-stack.md) test stack | 실브라우저(Chromium) 러너와 jsdom·happy-dom 배제. **hosted CI 가 결제로 멈춘 동안 2단계(시각 회귀 · 다중 브라우저)가 무기한 미뤄지는 상태**를 받는 것이다 | jsdom 으로 후퇴하면 매트릭스의 실브라우저 전용 7항목을 미검증으로 재분류하고 해당 컴포넌트 Web 상태를 `partial` 이하로 내린다(본문 Rollback) |
| [DS-D-0006](../governance/decisions/DS-D-0006-versioning-peer-contract.md) versioning·peer | 레지스트리 채널용 결정(changesets `fixed` · required peer)을 **첫 레지스트리 게시까지 이연된 채로** 수락하는 것이다. 그때까지 호환 보증은 DS-D-0036 의 같은-sha 고정이 진다 | 게시가 시작되거나 저장소 밖 소비자가 둘이 되면 이연 항목을 연다. `fixed` 제거·independent 전환은 설정 한 줄로 무손실 |
| [DS-D-0009](../governance/decisions/DS-D-0009-font-distribution.md) font distribution | 바이너리 미동봉은 지켜지고 있지만 **번호 붙은 결정 1~5 는 미구현**이다. 수락하면 `--louis-font-family-sans` 를 한 번 내보낸 뒤 이름을 바꾸지 못하고(breaking), 폴백 스택 교정이 토큰 값 변경으로 baseline 절차를 탈 수 있음을 받는다. 구현은 DS-P3-014 가 한다 | 폴백 스택 교정과 변수 간접화는 생성기 재실행으로 되돌아간다. 폰트 동봉으로 가는 것은 supersede ADR 이 필요하다 |

**Current impact.** 사용자에게 달라진 계약은 위 두 Fixed 절(leaf 7개의 `"use client"` — 정적 판정이고 RSC 번들러
실측은 없다 · 글리프 슬롯 override)과 CSS README 의 `layer(louis.tokens)` 안내뿐이다. Decision 은 여섯 모두
`proposed`, package·Web·Figma·제품 adoption 상태는 바뀌지 않았다.

## 2026-09-13 (128) — 컴포넌트가 실제로 짝지어 쓰는 글자·면 12쌍을 대비 게이트에 올리고, DS-P3-014 의 낡은 전제를 걷는다

첫 변경 단위는 DS-P3-014 단위 6이다. **대비 게이트는 누군가 적어 둔 쌍만 잰다.** `contrastPairs` 는 14쌍이었고 그중 컴포넌트가 실제로
같은 자리에 칠하는 조합은 일부뿐이었다 — [Alert](../components/alert.md) Known deviations 5가
「`color-alert-*` 쌍이 하나도 없어 4의 수치를 아무도 재지 않는다」고 적어 둔 그 결손이다. 쌍이
없으면 면이나 글자 값이 4.5 아래로 내려가도 `build-tokens` 는 초록이다.

### 무엇을 세었나

LOUIS 저작 CSS(`packages/css/src/**/*.css`)를 postcss 로 읽어 **한 규칙 안에서** `color:` 와
`background:`/`background-color:` 가 둘 다 `var(--louis-color-*)` 를 직접 읽는 조합을 뽑았다.
`color-mix()` 로 섞은 값은 그 토큰의 색이 아니므로 뺐다. 이미 쌍에 있는 것을 빼면 **17쌍**이
남는다. 대비는 `token-model.mjs` 의 `contrastRatio` 와 같은 식으로 generated manifest 의
`resolvedValue` 에서 잰다.

| 전경 | 면 | light | dark | 규칙 |
| --- | --- | ---: | ---: | --- |
| `color-alert-info-foreground` | `color-alert-info-surface` | 5.92 | 10.33 | `.louis-alert[data-tone="info"]` |
| `color-fg-on-accent-inverse` | `color-accent-inverse` | 20.12 | 20.12 | `.louis-button[data-variant="inverse"]` |
| `color-fg-primary` | `color-bg-inset` | 14.61 | 18.12 | 사이드바 현재 항목 · 눌린 IconButton · InspectorRow · SelectTrigger · 목록 현재 행 |
| `color-fg-primary` | `color-bg-raised` | 17.27 | 16.54 | `.louis-inspector-row__number` |
| `color-fg-primary` | `color-bg-overlay` | 16.54 | 16.54 | `.louis-dialog__surface` |
| `color-fg-primary` | `color-node-chip-surface` | 14.61 | 6.44 | `.louis-node-chip` |
| `color-fg-secondary` | `color-bg-inset` | 8.15 | 7.93 | `.louis-badge` |
| `color-fg-secondary` | `color-table-header-surface` | 7.15 | 7.24 | `.louis-table > thead > tr > th` |
| `color-fg-tertiary` | `color-bg-inset` | 5.68 | 5.75 | `.louis-avatar` |
| `color-fg-upgrade` | `color-bg-upgrade` | 14.61 | 12.81 | `.louis-sidebar-cta__button` |
| `color-fg-upgrade-hover` | `color-bg-upgrade-hover` | 11.37 | 9.77 | 같은 버튼의 `:hover` |
| `color-fg-upgrade-current` | `color-bg-upgrade-current` | 17.77 | 16.54 | 같은 버튼의 `[aria-current="page"]` |

위 12쌍을 `minimum 4.5`, note 없이 더했다. 두 모드 모두 4.5 를 넘는 불투명 쌍이다.

### 넣지 않은 다섯과 그 이유

- **비활성 핸들 세 쌍**(`color-node-handle-icon-disabled-{image,text,edit}` /
  `-bg-disabled-*`, 1.77 · 2.45 · 3.16). 비활성 컨트롤은 WCAG 1.4.3 의 대비 요구에서 면제된다.
  게이트에 올리면 통과시킬 기준도 사유도 없는 쌍이 된다.
- **Alert success · warning**(light 3.90 · 3.43, dark 9.55 · 10.83). light 에서 4.5 에 못 미친다.
  `minimum` 을 낮추고 note 를 달면 올릴 수는 있지만, Alert Known deviations 4가 「700 단계를 고른
  근거가 확인되지 않았다」고 적고 있어 잠그는 순간 수용으로 읽힌다. **전경을 `color-fg-{tone}` 으로
  옮길지, 사유를 적고 수용할지는 소유자 판정으로 남긴다.**

### 알파가 섞인 여덟은 미충족 규범이다

[Color & Theme](../foundations/color-theme.md) 은 「alpha가 있는 색은 실제 배경과 함께 contrast
pair를 선언한다」고 규정한다. 그런데 게이트는 불투명 sRGB 만 재고, 알파가 섞인 쌍을 선언하면
`contrast 검사는 opaque sRGB color만 지원합니다` 로 빌드를 거절한다. **그래서 아래 여덟은 게이트
밖에 있는 것이 아니라 규범이 요구하는 선언을 할 수 없는 상태다** — 메뉴 표면 글자 · secondary 버튼 ·
Alert 기본 톤 · Toast 가 여기 든다.
`fg-menu-item`/`bg-menu` · `accent-secondary-foreground`/`accent-secondary` ·
`alert-danger-foreground`/`alert-danger-surface` · `fg-on-inverse`/`bg-inverse-translucent` ·
`fg-primary`/`accent-ghost-hover` · `fg-primary`/`accent-secondary-selected`(dark 만 알파) ·
`media-control-foreground`/`media-control-surface` · `accent-danger`/`accent-danger-secondary`.

이 결손과 Alert success · warning 판정이 남아 **인계서 DS-P3-014 단위 6 은 `partial` 이다**(14 → 26쌍).
합성 배경을 받는 게이트의 착수 조건은 인계서 단위 6 절이 갖고, Color & Theme 의 그 규칙 옆에도
미충족을 적었다.

### 목표 수 「19」는 근거가 없다

인계서 단위 표가 「contrastPairs 7 → 19」라고 적어 두었지만 그 19쌍의 목록은 저장소 어디에도 없다
(`git grep` 이 그 표 한 줄만 낸다). 수를 맞추려고 쌍을 고르면 근거 없는 쌍이 된다. 그래서 표를
실측 결과로 바꾸고 목표 수를 지웠다.

### 의도적 breaking

[Releases](../governance/releases.md) 절차대로 이 항목을 먼저 쓰고 `node scripts/diff-tokens.mjs`
로 분류를 확인했다 — **`contrastPairs: 1` 하나이고 나머지 분류는 전부 0이다.** 기존 14쌍은 순서와
값이 그대로이고 뒤에 12쌍이 붙었을 뿐이다. 그 뒤 `packages/tokens/generated/manifest.json` 을
`packages/tokens/baseline/manifest.json` 으로 복사했다. `contrastPairs` 는 이름이 유지돼도 항상
breaking 으로 분류되는 공용 root metadata 다.

### Migration

- **토큰 값은 하나도 바뀌지 않았다.** `tokens.css` · 생성 CSS · `index.d.ts` 는 바이트가 같다.
  바뀐 것은 `manifest.json` · `tokens.json` · `index.js` · `figma.tokens.json` 의
  `contrastPairs` 배열 길이다. 그 배열을 읽는 소비자는 항목이 늘어난다.
- **앞으로 위 표의 토큰 값을 옮기는 변경은 그 쌍이 두 모드 모두 4.5 를 지켜야 `build-tokens` 가
  통과한다.** 예컨대 `color-node-chip-surface` 를 다크에서 한 칸 밝히면(pg-500 은 4.43) 빨간불이다.
- 제품이 소비하는 `@klipse-design/css` 출력이 그대로이므로 제품 핀을 올릴 이유가 없다.
- **Figma 에는 쓰지 않았다.** 변수·style 은 그대로이고(`verify-figma-variables` 가 적용 코드
  불변을 확인한다), `figma/snapshot.json` 은 provenance 의 두 해시(`tokenSourceSha256` ·
  `proposalSha256`)만 `build-figma-snapshot` 으로 다시 냈다. readback 은 바뀌지 않았다.

### 이어서 — DS-P3-014 의 낡은 전제를 문서에서 걷는다 (토큰 불변)

같은 날 두 번째 변경 단위다. **토큰·CSS·Figma 는 하나도 바뀌지 않는다.** 인계서와 결정 문서가
적어 둔 전제 여럿을 제품 앵커 `6fbdac16` 이 이미 뒤집었는데 문서가 그대로여서, 그것을 읽고
움직이면 없는 일을 하게 되는 자리들이다.

| 자리 | 적혀 있던 것 | 지금 사실 | 남은 것 |
| --- | --- | --- | --- |
| 단위 4 · DS-D-0010 OQ3 · product-confirmations §1 | disabled 12종은 라이트 값이 정해질 때까지 올리지 않는다. 라이트에서 비활성 핸들이 거의 검정이다 | 12종은 `8de65bb`(2026-08-26)로 원천에 있다. 제품은 라이트에서 disabled 토큰이 아니라 활성 토큰에 `brightness(0.78) saturate(0.95)` 를 건다 | **소유자:** 필터 연산을 DS 가 값으로 표현할 것인가 · 중복 이름 12개(`color-node-{channel}-{icon,surface}`)를 지울 것인가 |
| 단위 9 · color-theme 매체별 accent · Menu · Button | sky 램프를 먼저 세운다. Menu danger 는 `fg-danger` 를 글자색으로만 써 1.21/1.14. Button danger 는 tonal, 고정 높이 토큰 없음 | sky 는 LOUIS `80791e9` · 제품 `fec3c3b3` 에서 blue 로 접혔다. Menu danger 는 제품 값 `accent-danger`, Button danger 는 solid, 높이는 `layout-control-height-*` | **소유자:** `color-fg-danger-on-surface` 가 소비처 0이다 — Menu danger(light 2.77)를 그리로 옮길지, 토큰을 걷을지. editor 범주색은 남았다 |
| 단위 10 · DS-D-0010 OQ2 · product-confirmations §4 | 앱 셸 램프 G 238/239, 제품이 미러를 고쳐야 한다 | 제품이 hex 와 미러를 둘 다 LOUIS 별칭으로 바꿨다 | 없다 — 대상이 사라졌다 |
| 단위 2 · DS-D-0010 원칙 4 · product-confirmations §5 | 알파 10단 / 14단, 알파 토큰 9개가 사다리 밖 | DS-D-0026 의 16단이 정본이고 LOUIS 알파 패밀리가 전부 그 위다 | 제품 쪽 접기(§3) |
| product-confirmations §2 산문 | 180ms 173회 · 43파일 · 53단 중 60.4% | 같은 문서 생성 표는 162회 · 42파일 · 71단 · 59.9% | 산문에서 수를 걷고 생성 표를 가리키게 했다 — 다시 어긋날 자리가 없다 |
| 단위 7 | `partial` | DS 몫인 `border-width-default` 는 원천·Figma 양쪽에 섰다 | `done`. 남은 결손은 제품 접기 대상(§3) |
| 단위 11(새 행) | 표에 없었다 | DS-D-0009 결정 1~4(`--louis-font-family-sans` 방출 · 폴백 스택 교정 · JA 분리 · `local()` 폴백 face)가 넷 다 미구현 | 착수 조건과 breaking 여부를 인계서 단위 11 절에 적었다 |

**고친 문서.** `design/governance/execution-handoff.md`(DS-P3-014 단위 표와 단위 2·4·9·10·11 절,
DS-P3-004 Known deviations 줄) · `DS-D-0010`(원칙 4 · Open questions 2·3 · Rollout 6 표시) ·
`product-confirmations.md`(§1 · §2 · §4 · §5) · `foundations/color-theme.md`(매체별 accent 표를
앵커로 다시 재고 sky 결손 문단을 걷었다) · `components/menu-popover.md` · `components/button.md`
(Known deviations). DS-D-0010 의 `Status` 는 그대로 `proposed` 다.

**지운 것은 없다.** 중복 이름 12개와 `color-fg-danger-on-surface` 는 소유자 판정 전까지 원천과
Figma 에 그대로 둔다 — 둘 다 removal breaking 이고 Figma 변수 삭제가 따라온다.


## 2026-09-11 (127) — pg-850 칸을 비우고, 그 위에 서 있던 여섯을 pg-900 으로 내린다

소유자 지정이다. 회색 램프에서 **850 만 반 칸**이었다 — 600 다음이 700 이고 800 다음이 900 인데
그 사이에만 칸이 하나 더 있었다. 다크 사다리가 2026-09-09·09-11 두 번에 걸쳐 내려오면서 850 은
「카드 면」에서 「카드 위 한 칸」으로 뜻이 두 번 바뀌었고, 반 칸짜리 칸이 남아 있는 한 다음에도
같은 일이 생긴다. 칸 자체를 없앤다.

| 토큰(다크) | before | after |
| --- | --- | --- |
| `color-bg-raised` | pg-850 | **pg-900** |
| `color-bg-menu` | pg-850 | **pg-900** |
| `color-bg-overlay` | pg-850 | **pg-900** |
| `color-bg-upgrade-current` | pg-850 | **pg-900** |
| `color-table-header-surface` | pg-850 | **pg-900** |
| `color-table-row-hover` | pg-850 | **pg-900** |

프리미티브 `color-palette-gray-850`(`#21252d`)은 **삭제**했다. 이제 다크 회색 램프는
700 · 800 · 900 · 950 넷이다.

**다크에서 `bg-raised` 와 `bg-surface` 가 같은 값이 된다.** 면 하나로 계단을 만들던 자리는
이제 헤어라인과 그림자가 만든다 — `.louis-popover` 가 이미 그 형태다(`bg-menu` + `elevation-menu`
+ `hairline-inset`). 값이 같아진 것이 아니라 **분리 장치를 면에서 선·광으로 옮긴 것**이다.
다만 `table-header-surface` 와 `table-row-hover` 는 그 둘을 갖고 있지 않아, 다크에서 표가
`bg-surface` 위에 얹히면 머리 띠와 행 호버가 호스트와 같은 값이 된다. 면이 아니라
흰색 알파로 옮기는 것이 맞고, 그것은 별건이다.

**Figma 는 같은 변경 단위에서 맞췄다.** 이 파일은 09-09·09-11 의 사다리 이동이 반영된 적이
없어 `color/palette-gray/950` 이 아예 없었다 — 만들고, 다크 별칭 열하나(`app/page-bg` ·
`bg-canvas` · `bg-inset` · `bg-menu` · `bg-overlay` · `bg-raised` · `bg-surface` ·
`bg-upgrade-current` · `landing/panel-strong` · `table-header-surface` · `table-row-hover`)를
사다리에 다시 물리고, `color/palette-gray/850` 을 지웠다. `check-figma-snapshot` ·
`verify-figma-parity` 둘 다 이 작업 **전에 이미 빨간불**이었고 여기서 함께 풀렸다.
`packages/tokens/baseline/manifest.json` 도 같은 변경 단위에서 갱신했다 — 의도 밖 항목은 없다
(additive 1 = pg-950 · removal 1 = pg-850 · 나머지는 다크 별칭 열하나).

## 2026-09-09 (126) — 랜딩 바닥을 pg-000 으로 올리고 면을 사다리 칸에 세운다

소유자 지정이다 — 라이트 바닥 pg-050 → **pg-000**, 그 위 면은 「라이트에서 한 톤 어둡게,
다크에서 한 톤 밝게」.

**면이 알파였다.** `landing-panel-strong` 은 라이트 검정 8% · 다크 흰색 8% 였다. 알파는
「깔린 것이 무엇이든 그 위에서 한 칸」이라 바닥이 움직이면 결과가 따라 움직인다 — 실제로
바닥을 pg-000 으로 올리는 순간 면의 밝기도 같이 밀려 올라간다. 두 값이 서로를 붙잡지 않도록
불투명 칸으로 세운다: 라이트 **pg-050**, 다크 **pg-900**. 다크 랜딩 바닥은 순수 검정이라
pg-900(L\* 9.59)이 실제로 한 칸 위다.

| 토큰 | before | after |
| --- | --- | --- |
| `landing-page-bg` (light) | `palette-gray.050` | `palette-gray.000` |
| `landing-panel-strong` (light) | `static-black-alpha.08` | `palette-gray.050` |
| `landing-panel-strong` (dark) | `static-white-alpha.08` | `palette-gray.900` |

`landing-panel`(4%)은 **그대로 둔다.** 이름과 달리 면이 아니라 호버 잉크다 — 푸터 링크 호버와
캐러셀 화살표 호버, 둘 다 「밑에 무엇이 있든 그 위를 한 겹 어둡게」가 목적이라 알파가 맞는
형태다.

### 소비처 하나가 면이 아니었다

`landing-panel-strong` 을 읽던 여섯 중 다섯(OverviewSection · NewsCarousel · StepTiles · FAQ ·
Footer)은 랜딩 바닥 위의 면이라 함께 움직이는 것이 맞다. 나머지 하나인 **캐러셀 화살표 알약**
은 면이 아니라 컨트롤이고, 랜딩뿐 아니라 **앱 홈에서도 쓰인다** — 그쪽 바닥은 랜딩과 다르므로
랜딩 바닥을 기준으로 잡은 값을 따라가면 앱에서 관계가 어긋난다(앱 홈 라이트 바닥 L\* 95.8 대
pg-050 의 93.4 로, 차이가 절반으로 줄어든다).

제품에서 그 알약을 `accent-secondary`(잉크 8%)로 옮겼다. **이전 값과 같은 8% 라 보이는 변화는
없고**, 호버도 `accent-secondary-hover`(12%)가 한 줄로 받아 8% 면에 4% 를 그라디언트로 덧대
12% 를 만들던 우회가 사라진다.

### 의도적 breaking

[Releases](../governance/releases.md) 절차대로 이 항목을 먼저 쓰고, `node scripts/diff-tokens.mjs`
로 breaking 이 `color-landing-page-bg`(light) · `color-landing-panel-strong`(light·dark) 셋뿐인지
확인한 뒤 `packages/tokens/baseline/manifest.json` 을 같은 변경 단위에서 갱신했다.

## 2026-09-09 (125) — 회색 램프의 색상각을 gray-900 에 맞춘다
제품 다크 화면의 넓은 면(gray-800)이 「보라 핑크 쪽으로 보인다」는 소유자 지적에서 출발했다.
기분 탓이 아니었다.

**결함은 색상각이 램프 안에서 떠돌던 것이다.** 채도는 이미 규칙을 따르고 있었다 —
OKLCh 로 재면 `C = 0.0177·(1−L)^0.65` 를 RMS 오차 0.0006 으로 만족한다. 밝기도 균등하다.
그런데 색상각만 기준이 없어 **258.3° ~ 275.0°** 사이를 오갔다. 램프는 색상각 하나를 붙잡고
밝기와 채도만 움직여야 한다.

하필 소유자가 본 조합이 그 편차가 가장 잘 드러나는 자리였다. 넓은 면 gray-800 이 269.2°,
바로 옆 띠 gray-900 이 261.6° — **채도가 0.0150 으로 같은데 색상각만 7.6° 달랐다.** 나란히
두면 800 이 900 대비 보라로 튄다. 단독으로 보면 덜 느껴지고 옆에 기준이 있을 때 걸린다.

**기준은 gray-900 의 색상각(261.62°)이다.** 다크 앱 바닥이라 가장 넓게 가장 자주 보이는
면이고, 그 면을 움직이지 않는 쪽이 변경의 파급이 작다. gray-000 은 완전 중성(C≈0)이라
색상각이 정의되지 않으므로 그대로 둔다 — 종이흰색 앵커다.

**밝기와 채도는 건드리지 않았다.** 밝기 이동은 최대 0.0014 OKL, 채도는 최대 0.0012 다.
대비는 변하지 않는다.

### 8비트 격자가 보정을 삼킨다

목표 색상각으로 계산한 실수값을 그냥 반올림하면 대부분이 목표에 앉지 못한다. 이 램프의
채도는 0.003~0.015 라 `a`/`b` 오프셋이 1/255 보다 작아서, 그 색상각을 담을 칸이 sRGB 8비트에
아예 없는 경우가 생긴다. 실제로 단순 반올림에서는 gray-100 이 271.4° 에 그대로 남았다.

그래서 각 단계마다 정수 격자 ±3 을 전수 탐색해, 밝기 이탈 0.0015 OKL 이내 · 채도 이탈
0.0012 이내라는 제약 아래 색상각 오차가 최소인 삼중항을 골랐다.

| step | before | 색상각 | after | 색상각 |
| --- | --- | --- | --- | --- |
| gray-100 | `#dddee1` | 271.4° | `#dcdee1` | 258.3° |
| gray-150 | `#cfd0d4` | 275.0° | `#ced0d4` | 264.5° |
| gray-600 | `#595c63` | 267.3° | `#585c63` | 261.8° |
| gray-700 | `#42454c` | 267.2° | `#41454c` | 261.7° |
| gray-800 | `#2c2f37` | 269.2° | `#2b2f36` | 261.7° |

gray-`gray-850` 은 이 작업과 나란히 상류에서 새로 생긴 칸인데 269.1° 로 같은 편차를 갖고 있었다
— 800·900 사이에 끼어 있어 그대로 두면 바로 그 자리에서 문제가 재발한다. `#22252d` →
`#21252d`, 264.2° 로 함께 맞췄다.

050 · 200 · 300 · 400 · 500 은 바꾸지 않았다. 이미 8비트에서 고를 수 있는 최선이라
어느 이웃 칸도 색상각을 기준에 더 가깝게 만들지 못한다.

**남는 편차는 밝은 쪽에 있다.** 최대 3.3°(gray-200 의 258.3°)로, 채도가 0.005 안팎이라
보이지 않는다. 보이는 구간인 600~900 은 편차 0.2° 다. 램프 전체로는 16.7° → 3.3° 다.

### 의도적 breaking

[Releases](../governance/releases.md) 절차대로 이 항목을 먼저 쓰고, `node scripts/diff-tokens.mjs`
로 breaking 이 `color-palette-gray-{100,150,600,700,800}` 다섯뿐인지 확인한 뒤
`packages/tokens/baseline/manifest.json` 을 같은 변경 단위에서 갱신했다. 의도 밖 항목은 없다.
파생 46건은 이 다섯을 참조하는 별칭이라 함께 움직인 것이다.

## 2026-09-09 (124) — 떠 있는 크롬에 그리는 코드를 준다 (FloatingShell · PillTrigger)

123 이 세운 것은 계약과 Figma 였고 **그리는 코드는 없었다.** 그 상태에서 제품이 클래스를 붙이면
아무 일도 일어나지 않는다 — 실제로 제품 채택 회차가 이 셋에 기대는 절차를 하지 못하고 건너뛰었다.
이 회차가 그 빈자리를 채운다: `packages/css/src/component/floating-shell.css` 한 파일에
`.louis-floating-shell` · `.louis-floating-shell__item` · `.louis-pill-trigger` ·
`.louis-pill-trigger__caret` 이 함께 산다.

**파일이 하나인 이유는 문서가 하나인 이유와 같다.** 재료가 하나다 — 면 72%(`color-bg-menu`) ·
배경 흐림 4 · `--louis-hairline-inset` · 반경 16. 두 파일로 나누면 그 불변식을 적을 자리가 없다.

**레시피가 소유하지 않는 것 셋을 명시했다.** z-index(어디에 뜨는지는 호출부가 갖는다 — 앵커의
세 자리도 겹침 순서를 감싸는 래퍼가 갖고, 여기서 층을 정하면 이미 세운 순서를 레시피가 조용히
이긴다) · 그림자(경계는 헤어라인 **한 겹**이 전부다. `--louis-elevation-menu` 를 더 얹는 것은
`CommandPalette` 의 560 모달이고 그것은 Dialog 문법이다) · 조각의 내용(자리의 겉 크기 32 와
곡률 12 만 갖는다).

**재료가 두 규칙에 각각 적힌다.** 트리거가 셸의 자손이 아니라서다 — 배율 트리거는 캔버스 우측
하단에 홀로 서므로 상속으로 한 벌을 물려줄 수 없다. 값이 두 번 적히는 대신 갈리지 않는 것을
기계가 지킨다: `verify-recipe-record` 가 두 선언을 각각 기록과 대조하고(레시피↔기록 대조가
26 → 49 건으로 늘었고 그중 23 건이 이 두 벌이다), 브라우저 시험이 렌더한 둘의 유리 — 면 · 흐림 ·
반경 · 헤어라인 — 가 **같은지**를 실브라우저에서 잰다.

**이름 없는 값을 게이트 밖에 두지 않았다.** 흐림 4 는 LOUIS 흐림 사다리(10 · 12 · 16)에 없어
토큰이 될 수 없고 `backdrop-filter: blur(…)` 로는 게이트가 수로 풀지 못한다. 값을 지역 변수
`--louis-floating-shell-blur` 로 한 번 발행하고 그 선언을 기록의 `blurRadius` 와 맞췄다.
이름이 없는 것과 아무도 보지 않는 것은 다르다.

**`translateZ(0)` 가 이제 레시피의 것이다.** 정지 화면에 나타나지 않아 Figma 가 담지 못하는
값이고, 앵커의 세 자리가 각자 적고 있었다. 레시피가 가지면 제품이 클래스를 무는 순간 따라간다 —
정지 화면에 없는 값을 보존하는 유일한 방법이다.

**브라우저 시험이 재는 것이 바뀌었다.** 이전 판은 그리는 코드가 없어 「표가 부르는 이름이
토큰층에 실재하는가」만 잴 수 있었고, 여백·간격·높이·흐림 4 · 캐럿의 향은 문서가 「아직 재지
못하는 것」으로 남겨 두고 있었다. 이제 다섯이 전부 측정 대상이다. **높이 40 과 폭 112 는 선언이
아니라 파생값이라 이 시험에서만 재진다**(`4 + 32 + 4` 와 `4 + 32×3 + 4×2 + 4`).

**전이가 도는 동안은 재지 않는다.** 호버를 얹거나 테마를 뒤집은 직후의 계산 스타일은 계약값이
아니라 계약값으로 가는 중인 보간값(Chromium 은 `oklab(…)` 으로 발행한다)이다. 첫 판이 그것을
재고 빨개졌고, `document.getAnimations()` 의 `finished` 를 기다리는 것으로 고쳤다.

갈리는 것 하나 — **호버 전이가 앵커의 0.12s 가 아니라 컨트롤 호버 역할 토큰(160ms)을 읽는다.**
`.louis-menu-trigger` 가 같은 자리에서 같은 판정을 했다. 캐럿 회전은 갈리지 않는다: 앵커가
`160ms ease` 이고 그 토큰의 timing 이 `cubic-bezier(0.25, 0.1, 0.25, 1)` = `ease` 라 같은 값이다.

`web` 은 `not-ready` → **`partial`** 이다. `done` 이 아닌 이유 둘: React 표면이 없고(소비처가
제품 캔버스 네 자리뿐이라 감쌀 근거가 아직 없다 — `Alert` · `Switch` · `NodeChip` ·
`InspectorRow` 와 같은 형태), 제품이 아직 이 클래스를 물지 않았다. 상태를 올리려고 그 둘 중
하나를 없는 셈 치지 않았다.

## 2026-09-07 (123) — 캔버스 위에 뜨는 크롬의 재료를 세운다 (FloatingShell · PillTrigger)

캔버스·홈·영상편집·커맨드팔레트 네 화면이 같은 유리를 쓰는데 정본이 없었다. 면 72% · 배경 흐림
4 · `--louis-hairline-inset` · 반경 16 이 한 묶음이고, 앵커에서 그 넷이 한 요소에 함께 걸린
자리는 네 곳이다 — `Toolbar.tsx` 와 `node-canvas-v2/index.tsx` 의 `TOOLBAR_WRAP`(뒤엣것은 앞엣것을
파일 안에 다시 적은 사본이고 툴바와 도움말 알약 두 곳에 걸린다), 그리고 `CanvasZoomControl.tsx` 의
`ZOOM_LABEL_BUTTON`.

**계획서의 「6 파일」은 문자열이 센 수였다.** `gray-800/72%` 로 훑으면 `NodeCanvasHomeScene` 과
`VideoEditScene` 이 함께 걸리는데 그 둘은 이 셸이 아니라 **이미 `.louis-toast` 를 무는 토스트**다.
`CommandPalette` 의 패널도 같은 재료를 쓰지만 560px 모달이고 `--louis-elevation-menu` 를 한 겹 더
얹는다 — 알약이 아니라 Dialog 쪽 문법이라 세트에 담지 않았다. **「같은 값을 쓴다」와 「같은
부품이다」는 다르다.**

**새 색을 하나도 세우지 않았다.** 면의 라이트/다크 쌍이 `color-bg-menu`(라이트 palette-gray 050 ·
다크 palette-gray 800)와 바이트로 같다. 다만 그 일치는 **앵커가 아니라 지금 제품과의 일치**다 —
앵커 `5a67d692` 의 라이트 값은 palette-gray 100 이고, 앵커 뒤 커밋 `54150126`(「라이트 캔버스를
pg-100, 노드 카드를 pg-050, 알약을 pg-050 으로」)이 그것을 050 으로 옮기면서 이 사다리에
올라탔다. Figma 는 현재 값에 물렸다 — 앵커 값에 물리면 세운 그 날 이미 낡는다. 알파는 토큰이
아니라 paint opacity 다(Toast 와 같은 형태): 72 와 88 을 담을 면 변수를 새로 만들지 않기 위해서다.

**계획서가 제안한 네 축을 하나도 열지 않았고, 넷 다 실측이 막았다.** `Orientation` — 이 재료로 선
셸이 앵커 전수에서 전부 가로다(DS-D-0030). `Divider` — 구분선은 실재하지만 면이 다섯 정지점
그라디언트이고 양 끝 정지점의 알파가 0 이라 담을 색 변수가 없다. 지금 그리면 되읽기가 `rawFills`
로 세고 저작 규범 §1 의 「원시값 0 — 타협 없음」이 깨진다. `Caret` — 캐럿 없는 자리가 없다.
`Badge` — 점 배지는 셸 **안의** 32 툴바 버튼에 붙지 트리거에 붙지 않는다.

**36 에 `Size` 축을 열지 않았다.** [DS-D-0048](../governance/decisions/DS-D-0048-thirty-six-is-not-a-control-height.md)
이 36 을 컨트롤 높이 사다리에 들이지 않기로 판정한 그 값이다. 같은 결정이 「사다리 밖 값은
쓰임새로 부른다」를 함께 정했지만 그 규칙은 칸이 둘 이상일 때의 것이고, 여기는 칸이 하나다 —
칸이 하나뿐인 축은 축이 아니다.

**Figma 가 담지 못하는 것 둘을 적어 두었다.** 흐림 4 는 LOUIS 흐림 사다리(10 · 12 · 16)에 없어
변수에 묶이지 못하고 값으로 앉는다. `transform: translateZ(0)` 는 세 자리 모두에 함께 적혀 있는데
정지 화면에 나타나지 않는 값이라 변형이 담을 축이 아니다 — 합성 레이어로 올려 배경 흐림이
안정적으로 걸리게 하고 iOS 중첩 스크롤에서 글자가 흐려지는 결함을 막는 선언이므로, 제품이 이
레시피를 물 때 **반드시 함께** 가야 한다.

LOUIS CSS recipe 는 아직 없다 — 두 컴포넌트 다 `figmaAhead` 이고 제품이 정본이다.

## 2026-09-07 (122) — 대시보드 카드를 두 벌로 세운다 (StatTile · ChartCard)

지표 타일과 지표 차트 카드에 DS 이름이 하나도 없었다. **Figma 52종에 차트 축이 전무했고**,
제품에는 같은 그림이 네 벌(`OverviewTab` 인라인 2 · `PerformanceTab` 1 ·
`YoutubeVideoAnalyticsView` 1) 있다.

**계획서의 「두 구현 중 정본을 정하라」는 실측에서 「둘은 다른 조형이다」가 됐다.** 어드민
`AdminStatTile` 은 면 하나 위에 네 줄이고 애널리틱스 KPI 카드는 바깥 프레임 + 안쪽 면이다.
한 컴포넌트의 두 크기가 아니라 액자가 있고 없고가 조형을 가르므로 둘로 세웠다. 실제로 다투던
값은 **증감 알약의 좌우 여백 하나뿐**이고(어드민 8 · 애널리틱스 6) 6 이 정본이다 — 알약이
그려지는 자리가 애널리틱스 9곳·4파일·2라우트, 어드민은 한 파일이다(DS-D-0043).

**액자가 두 겹인 이유가 반경 산술이었다.** `radius-overlay` 16 − `space-overlay-inset` 6 =
`radius-overlay-item` 10. 제품 정본이 그 동심 정렬을 주석으로 적어 두었고 값 셋이 오버레이
계단과 정확히 같아 **새 토큰을 하나도 세우지 않았다.** 면 두 칸도 마찬가지다 —
`--dashboard-card-bg` · `--dashboard-inner-panel-bg` 가 `color-bg-canvas` · `color-bg-overlay` 와
바이트 단위로 같다.

**`/admin` 에 눈이 하나 생긴다.** `AdminStatTile` 의 소비처 14 자리가 전부 `/admin` 이고 제품의
대비·타이포·표면 게이트는 그 경로를 하나도 재지 않는다. 이 조형의 값은 지금까지 어떤 기계도
본 적이 없었고, 이제 브라우저 시험과 parity 두 방향이 잰다. **다만 그 눈은 아직 LOUIS 쪽만
본다** — 제품이 이 클래스를 물기 전까지 `/admin` 화면 자체는 여전히 재지 않는다.

**없는 칸을 그리지 않았다.** 계획서가 요구한 `StatTile` 의 `State=Loading` 은 만들지 않았다 —
어드민은 로딩을 타일이 아니라 블록 하나로 그린다. `ChartCard` 도 3×3 아홉 칸 중 제품에 그림이
있는 여섯 칸만 세웠다(`spark`/`insufficient` 는 곡선을 아예 그리지 않는 것이 정본이다).
데이터 부족 안내는 새로 그리지 않고 `Alert / Layout=inline` 인스턴스를 슬롯에 놓았다 —
그 조형은 다른 벌의 칸이다.

**게이트 한 곳을 고쳤다(복구다).** `verify-figma-parity` 의 자손 필드 규칙에 `enum` 이 없어
「자손의 방향이 축에서 갈린다」를 계약으로 적을 수 없었다. 같은 파일 주석이
「규칙은 root 의 fields 와 같다」고 적고 있었고, `set` 이 DS-D-0049 에서 정확히 같은 이유로
따라온 선례가 있다.

남는 빚 넷은 문서 Known deviations 가 소유한다 — 합성 ramp 에 semibold heading 칸이 없고,
8% 붉은 면과 success 강조 잉크에 semantic 이름이 없으며, 라벨·힌트의 잉크 두 단이 한 단으로
접혔고, 안쪽 면 여백이 두 축에서 갈린다(제품 정본이 갈려 있다).

## 2026-09-07 (121) — 캔버스 노드의 겉을 세 벌로 세운다 (NodeShell · NodeChromeButton · NodeSideHandle)

노드 캔버스는 제품에서 가장 크게 되풀이되는 시각 단위인데 DS 에 이름이 하나도 없었다. 아홉
노드 파일이 `NODE_WRAP` · `NODE_HEADER_ABOVE` · `NODE_TITLE_WRAP` 이라는 **같은 이름의 상수**로
같은 값을 각자 선언하고, 공유되는 것은 클래스가 아니라 토큰과 이름뿐이다. 카드 테두리만
캔버스 셸이 후손 선택자 하나로 아홉을 한꺼번에 칠한다 — 그 한 줄이 「셸이 있어야 한다」를
제품 스스로 인정한 자리다.

**계획서의 「타입 축 9」는 실측에서 일곱이 됐다.** 제품이 선언하는 축은 타입이 아니라
액센트(`data-node-accent`)이고 값이 일곱이다. `tts` 와 `bgm` 은 둘 다 `audio` 를 쓰고,
`youtube` 와 `instagram` 은 같은 red-500 을 가리켜 선택 테두리까지 같다. 아홉 번째인 `section`
은 카드가 아니라 프레임이라(반경 16 · 카드 면 없음 · 제목 바가 프레임 바깥) 셸의 계약이 한 줄도
참이 아니어서 세트에 넣지 않았다. **미선택 일곱의 값이 전부 같다는 것도 실측이다** — 카드
자신은 타입을 드러내지 않는다.

**원장의 문장 하나가 틀렸다는 것도 드러났다.** 사이드 채널 버튼을 「채널 톤 여섯」이라 적었는데
소스의 `type SideTone` 은 `image` · `text` · `edit` 셋이다.

### Added

- **NodeShell** — 카드 위 헤더 한 줄과 400px 카드. Accent(7) × Selected(2) = 14 variant.
  본문과 사이드 레일은 슬롯이라 담지 않는다.
- **NodeChromeButton** — 헤더의 32px 아이콘 버튼 쌍. Tone(2) × State(3) = 6 variant.
- **NodeSideHandle** — 좌우 레일의 28px 채널 버튼. Channel(3) = 3 variant.

셋 다 Figma·계약·규범 문서가 같은 작업에서 섰고 되읽기를 다시 떠 스냅샷과 parity 를 통과시켰다.
바인딩은 세 벌 모두 `rawFills 0 · rawStrokes 0 · textUnstyled 0` 이다.

### 담지 못한 것과 그 이유

**전부 「아직 안 했다」가 아니라 「지금은 담을 수 없다」이다.** 공통 원인이 하나다 — 제품이
라이트와 다크에서 **서로 다른 토큰**을 쓰는데 Figma 변수는 모드 쌍이 하나뿐이라서, 새 세만틱
변수 없이는 그 값을 담을 자리가 없다.

- 노드 카드의 면·테두리·제목 잉크 셋이 라이트에서 갈린다. 사다리 토큰(`color/bg-surface` ·
  `color/stroke-default` · `color/fg-secondary`)에 물리고 라이트 값을 결손으로 적었다.
  그 과정에서 사실 하나가 드러났다 — **제품 라이트에서 카드 바닥이 캔버스 바닥과 같은 값이라
  카드를 만드는 것은 면이 아니라 흰 테두리다.** 사다리에 그 조형이 없다.
- 사이드 버튼의 비활성은 다크가 채널 900, 라이트가 활성 토큰에 밝기 필터다. 한 변수에 담기지
  않아 State 축을 열지 않았다. 호버·프레스도 색이 아니라 `filter` 라 같은 이유로 열지 않았고,
  메뉴 열림은 소스가 `filter: none` 만 더해 **기본과 시각이 같다**.
- 헤더 버튼의 호버 틴트는 라이트가 정확히 맞고 다크만 4%p 얕다(제품 12% · LOUIS 8%).
- **타입 글리프 넷이 아이콘 세트에 없다** — `video-camera` · `youtube` · `instagram` ·
  `magic-wand`. 변형별 기본값을 채우면 넷이 거짓 글리프를 갖게 되므로 슬롯 기본값을 하나만
  두었다.

### Changed

- `verify-figma-parity.mjs` 의 변조 canary 셋을 굳혔다. 높이·좌우 여백을 담지 않는 계약이 목록
  맨 앞에 오면 canary 가 진단 대신 스택트레이스를 냈고, stroke canary 는 고정값 `2` 를 쓰는
  바람에 테두리가 마침 2 인 계약에서 변조가 no-op 이 됐다. 앞의 둘은 건너뛰게 하고 뒤는 실제
  값에서 2 를 더하게 했다 — **검출력을 낮춘 것이 아니라 셋 다 올렸다.**

## 2026-09-07 (120) — 섹션 헤더 정본을 세운다 (SectionHeader)

어드민 11 화면의 머리는 `app/admin/AdminSection.tsx` 의 `AdminSectionHeader` 하나가 소유하고
**11 파일 17 자리**가 그것을 쓴다(page 11 · section 5 · label 1). 같은 조형이 어드민 밖에도
있다 — `components/ui/PageHeader` 가 앱 허브 넷에서 같은 제목 36 SemiBold + 설명 16 Medium 을
그린다. 되풀이가 `/admin` 안에 갇혀 있지 않다는 것이 이 벌을 여는 근거다.

**`/admin` 은 제품의 대비·타이포·표면 게이트가 하나도 재지 않는 영역이다.** 이 컴포넌트가
서면서 그 자리에 처음 기계 눈이 생긴다 — 다만 제품이 물게 한 뒤에도 **회귀는 사람이 봐야
한다**. 초록이 근거가 되지 않는 유일한 영역이라는 사실은 문서와 계약이 함께 적는다.

### Added

- `packages/css/src/component/section-header.css` — `.louis-section-header`
  (`data-level = page | section | label`) + `__text` · `__title` · `__description` · `__meta` ·
  `__actions`. React 표면은 없다(alert · switch · tabs 와 같다).
- Figma component set `SectionHeader` — `Level` 3변형. `Title` · `Description` · `Meta` TEXT 와
  `HasDescription` · `HasMeta` · `HasActions` BOOLEAN.
- `figma/components.measured.json#section-header` — `page` · `section` · `label` 세 칸.
- `packages/react/test/section-header.browser.test.tsx` — 실브라우저 acceptance 16건.
- `design/components/section-header.md`.

### Changed

- **`typography-heading-md-semibold` 토큰이 열렸다.** LOUIS heading 계열에는 `medium` 세
  칸(28·36·48)만 있었고 semibold 가 하나도 없어 화면 제목 36/600 을 그릴 역할이 없었다.
  제품 스케일에는 `type-heading-36-semibold` 가 실재하므로 **새 역할을 지어낸 것이 아니라
  빠져 있던 칸을 채운 것**이다. 컴포넌트가 size 와 weight 를 따로 조합하지 않은 이유는
  [typography.md](../foundations/typography.md) 가 그것을 금지하기 때문이다.
  Figma text style `typography/heading-md-semibold` 도 같은 작업에서 세웠다
  (`font-size/heading-md` · `font-weight/semibold` 변수에 묶인다).
- **축 어휘에 `Level` 이 열렸다**([figma-component-authoring.md](../governance/figma-component-authoring.md) §2).
  `Size` 가 아닌 이유를 함께 적었다 — 값이 밀도가 아니고 셋의 관계가 순서가 아니라 포함이며,
  아래 여백을 `page` 만 지고 `label` 에는 설명·메타·액션 자리가 아예 없다.

### 옮기지 않은 것

- **719px 접힘을 Figma 에 그리지 않았다.** media query 가 없어 접힌 모습은 변형이 되어야
  하는데, 셋을 여섯으로 늘리면 그중 셋이 방향 말고 같은 값을 반복한다. 접힘은 값이 아니라
  규칙으로 계약의 `$foldRule` 이 갖고, 브라우저 시험이 719px iframe 에서 되잰다 —
  **한쪽만 있는 근거라서 그 시험이 유일한 눈이다.**
- **다크의 알파 잉크(`gray-000/56%` · `/40%`)를 옮기지 않았다.** `empty-state` 의 `canvas`
  제목과 같은 판단이다. 옮기지 않은 것은 색이 아니라 «알파로 색을 만드는 방식»이고,
  대비를 이유로 값을 바꾼 것이 아니다.

### 실측으로 갈린 것 하나

`components/ui/PageHeader` 주석이 자기 값을 「`page` 와 같다」고 주장한다. 대조했더니 제목·설명·
간격은 두 벌이 바이트 단위로 같고 **아래 여백만 갈렸다** — PageHeader 32, 어드민 page 12.
어긋난 것이 아니라 분담이 다르다: 어드민 쪽은 감싸는 스택의 `gap-10`(20)이 나머지를 내
20 + 12 = 32 이고, 제품이 그 셈을 `BlogManagement.tsx:50-52` 와
`TemplateManagement.tsx:1009-1012` 에 각각 적어 두었다. 레시피는 어드민 쪽(12)을 골랐다.

### 제품

이 회차는 제품을 건드리지 않았다(소유자가 그 트리에서 작업 중이다). 물게 하는 diff 는
회차 산출물에 있다.

## 2026-09-07 (119) — 인스펙터의 «행 문법» 을 한 벌로 세운다 (InspectorRow · InspectorSectionHead)

영상 편집기 우측 속성 패널의 인스펙터 다섯 보드(`ClipInspector` · `OverlayInspector` ·
`AudioClipInspector` · `CompositionInspector` · `EditorSettingsPanel`)는 **부품의 배치일 뿐**이고
실제로 값을 갖는 것은 절 머리와 라벨-값 행 둘이다. 그 둘을 세우고, 알약 · 숫자 칸 · 색 점은
독립 부품이 아니라 값 자리의 형태라서 행의 `Value` 축으로 접었다. **다섯을 따로 세우면 문법이
아니라 부품 다섯이 된다.**

### Added

- `packages/css/src/component/inspector-row.css` — `.louis-inspector-row`(값 형태 넷) ·
  `.louis-inspector-section-head`(제목 · 값 힌트 · 조작). React 표면은 없다.
- Figma component set 둘 — `InspectorRow`(4 variant) · `InspectorSectionHead`(2 variant).
- 규범 [Inspector Row](../components/inspector-row.md) ·
  [Inspector Section Head](../components/inspector-section-head.md).
- `figma/components.measured.json` 의 `inspector-row`(키 `row` · `head`). 모든 값이 앵커의 줄을
  `$` 사유로 인용한다.
- `scripts/verify-recipe-record.mjs` (`pnpm run verify-recipe-record`, `verify:ci` 단계) —
  **기록이 자기 자신의 근거가 되지 않게** 레시피 선언 → 토큰 → 기록의 반대 방향을 잰다.
  재는 것은 표(`RECIPES`)가 소유하며 지금 열려 있는 것은 `inspector-row` 한 벌이다.

### Changed

- **행이 곧 박스인 쪽만 채택했다.** 정본은 한때 행을 투명하게 두고 값에만 140 박스를 씌웠고,
  스스로 그 배치를 정정하며 박스를 행으로 옮겼다. 옛 배치의 라벨 38% 고정폭은 채택하지 않았다.
- **면을 팔레트 칸이 아니라 사다리로 옮겼다.** 다크는 `color-bg-inset` · `color-bg-raised` ·
  `color-bg-canvas` 와 정확히 같고 라이트만 갈린다. 레시피는 **관계**를 고정한다 — 행은 한 칸
  들어가고 그 안의 컨트롤은 한 칸 나오며 알약은 바닥까지 내려간다.
  <br>**〔2026-09-09 정정〕** 다크 등식은 그 뒤 깨졌다 — `3a2ca71` 과 이날의 다크 면 사다리
  이동이 `bg-inset`(dark)을 `palette-gray-800` → `900`, `bg-raised`(dark)를 `700` → `800` 으로
  내렸다. 정본은 그대로라 이제 다크도 갈린다. **관계를 고정한다는 판정은 유효하다**(넷이 함께
  내려갔다). 현재 상태는 [Inspector Row](../components/inspector-row.md) Known deviations 1 이
  갖는다.
- 절 머리의 조작이 `layout-control-height-sm` 을 읽는다. 정본이 그 칸이 없던 때 로컬로 세웠다고
  적어 두었고 DS-D-0032 가 그 칸을 열었다.

### 열지 않은 축과 그 사유

- **숫자 칸의 상태 축.** 시각 선언을 갖는 것은 hover 하나뿐이다. 드래그는 문서 전체의 커서를
  바꿀 뿐이고, 편집(`:focus`)의 링이 패널 안에서 살아남는지는 **소스로 판정할 수 없다** —
  같은 특이도의 두 선언이 경쟁해 승자가 유틸리티 정렬 순서에 달렸다. 값이 같은 변형을 나열하면
  죽은 축이 된다.
- **알약의 tone 축.** 정본에 넷이 선언돼 있으나 셋의 선언이 글자까지 같아 죽어 있다.
- **감싸는 세로 묶음.** 정본이 절 머리를 사이 간격 8 의 세로 묶음에 넣지만 자식이 언제나 하나라
  그 8 이 아무 것도 벌리지 않는다.

### 소유자 판정으로 남긴 것

1. 라이트 면 — 정본의 라이트가 사다리 위에 없다. 움직여야 할 쪽이 정본인지 결정해야 한다.
2. 알약의 진짜 1px 테두리 — DS-D-0023 의 0.5 inset 헤어라인과 어긋난다.
   `SegmentedCodeInput` 과 한 묶음으로 판정한다.
3. 알약을 `Badge` 로 흡수할지 — 죽은 tone 축, `Badge` 의 `borderWidth: 0` 규칙, 이미 배포된
   set 의 격자가 두 배가 되는 것 셋이 걸린다.
4. 자막 색 패널의 행 — 라벨이 컨트롤 위에 쌓이고 컨트롤이 30 색 견본이라 28 한 줄이 표현하지
   못한다. 세로 행 형태와 `Value=Swatch` 칸을 함께 열어야 한다.

### Migration

새 레시피이고 제품은 아직 물지 않는다. 소비처가 클래스를 바꿔 무는 것은 별도 변경이다.

## 2026-09-07 (118) — 값 목록을 여는 트리거를 세운다 (SelectTrigger)

`select` 는 2026-08-18 에 **`not-planned`** 였다 — 「고르기는 Menu 가 소유한다」. 그 판정은
네이티브 `<select>` 엘리먼트를 셌고(14벌 / 5파일 · 전부 `/admin` 계열), 배포 화면에는 0벌이라
결론지었다. 앵커(`5a67d692`)에서 다시 세니 제품이 값을 고르는 방식은 그것이 아니었다 —
`components/scenes/create/CustomDropdown.tsx` 가 **JSX 아홉 자리 / 여덟 파일**에 서 있고
`Gnb` 가 물기 때문에 사실상 전 라우트에 뜬다. 아홉 자리의 높이는 다섯 종(24 · 28 · 32 · 36 ·
내용), 곡률은 넷(8 · 10 · 12 · 알약)이었다.

[DS-D-0053](../governance/decisions/DS-D-0053-select-is-not-a-menu.md)이 그 판정을 뒤집는다.

### Added

- Figma `SelectTrigger` component set 8 variant(`Size` = `md`·`sm` × `State` =
  `Default`·`Hover`·`Open`·`Disabled`) + `Value` TEXT. `DS · Components` 페이지.
- LOUIS 레시피 `.louis-select-trigger` — 면 있는 상자 · 선행 글리프 슬롯 · 남는 폭을 먹는 값 ·
  열림에서 180° 도는 캐럿. 같은 파일에 패널 안 배치 셋(`.louis-select-search` ·
  `.louis-select-list` · `.louis-select-empty`)을 함께 둔다. React 표면은 없다(Alert · Switch 와
  같은 형태).
- 계약 `figma/components.measured.json` 의 `select`, `verify-figma-parity` 의 계약,
  `figma-readback-emit` 의 채취 명세, 그리고 실측을 코드가 여전히 만드는지 재는 브라우저 테스트.
- 결정 `DS-D-0053` 과 컴포넌트 문서.
- 축 어휘 표에 `State = Open`. `MenuTrigger` 가 2026-09-06 부터 이미 쓰고 있었는데 표에 없었다 —
  이번에 그 빚을 함께 갚는다.

### Changed

- **크기 축을 둘만 연다.** 24 와 32 는 [DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)
  의 사다리 칸이고 각각 제품 실측 자리를 갖는다. 28 은 사다리 밖이고 그 값의 주인이 따로 있다
  (인스펙터 **행**의 높이와 `SubscriptionScene` 의 `min-height`).
- **sm 의 좌우 여백이 비대칭이다**(8 · 6). 제품 프리뷰 줌 칩의 실측이고, 끝 쪽에 서는 캐럿이
  글자보다 광학적으로 가벼워 같은 여백이면 오른쪽이 넓어 보인다. md 는 제품 두 자리가 대칭이라
  대칭이다 — 비례로 끌어오지 않았다.
- **캐럿은 크기 축을 따라 줄지 않는다**(둘 다 12). 아이콘 사다리(16 · 20 · 24)에 없는 값이라
  그 사다리를 쓰지 않고 `--louis-select-caret-size` 가 이름을 갖는다.
- **트리거가 면을 갖는다.** `MenuTrigger` 는 투명인데 여기는 `bg-inset` + 헤어라인이다 —
  값 목록은 「지금 무엇이 골라져 있는가」를 늘 보여야 하므로 눌러야 나타나는 컨트롤이 아니다.
  hover 도 그래서 ghost 8% 가 아니라 secondary 12% 다.

### Not done — 그리고 왜

- **패널 · 항목 · 선택 표시 · 검색 필드를 새로 세우지 않았다.** 네 자리 모두 이미 서 있다 —
  패널은 `MenuPanel`, 항목과 `aria-selected` 는 `Menu`, 검색 필드는 `TextField`(그 컴포넌트의
  `HasLabel` 축 사유가 「라벨 없는 필드가 실재한다 — 검색창이 그것이다」다). 앵커의
  `CustomDropdown` 도 이미 `louis-popover` 와 `louis-menu__item` 을 물고 있다.
- **결과 없음 행은 Figma 에 없다.** 새로 고정할 치수가 하나도 없다 — 항목 행과 같은 여백·
  같은 곡률에 잉크만 보조색이라, set 을 세우면 같은 수를 두 곳이 갖게 된다.
- **제품 채택은 하지 않았다.** 원장의 `CustomDropdown` 항은 `needed` 로 남는다 — 그 판정은
  「제품이 무엇을 무는가」이고 제품은 아직 이 트리거를 물지 않았다. 커버리지가 오르는 것은
  채택하는 회차다.
- **placeholder 상태를 열지 않았다.** 제품 아홉 자리 전부 값이 항상 있다(`options[0]` 로
  떨어진다). 없는 상태를 축으로 세우지 않는다.

## 2026-09-07 (117) — 크롭 창과 선택 상자를 한 벌로 세운다 (TransformFrame)

제품에 같은 조형이 **넷** 있었고 셋이 서로 다른 규범이었다(앵커 `5a67d692`). 노드 캔버스
크롭 모달과 이미지 크롭 모달은 `react-image-crop` 의 기본 크롬(12px 정사각 손잡이 · 행진하는
개미 테두리)을 그대로 쓰고, 비디오 편집기의 클립 크롭은 1.5px 테두리에 24px ㄱ자 브래킷과
알약 손잡이를, 프리뷰 오버레이의 선택 상자는 2px 링에 10px 정사각을 쓴다. Figma 51종에
**변형 핸들이라는 부류 자체가 없었다.** 다섯째가 생기기 전에 하나로 모은다.

### Added

- Figma `TransformFrame` component set. 축은 `Handles` 하나(`corners` ·
  `corners-and-edges`)이고 삼분할 안내선은 `Grid` BOOLEAN 이다. `DS · Components` 페이지.
- LOUIS 레시피 `.louis-transform-frame` — 프레임 · 삼분할 안내선 · 여덟 자리 손잡이.
  React 표면은 없다(Alert · Switch 와 같은 형태).
- 계약 `figma/components.measured.json` 의 `transform-frame`, `verify-figma-parity` 의 계약,
  `figma-readback-emit` 의 채취 명세, 그리고 실측을 코드가 여전히 만드는지 재는 브라우저 테스트.
- 결정 `DS-D-0060` 과 컴포넌트 문서.

### Changed

- **손잡이 위치를 축으로 열지 않았다.** 여덟 자리는 좌표이고 넷 또는 여덟이 동시에 선다.
  갈리는 것은 「어느 벌을 내놓는가」 하나다.
- **비율 잠금을 별도 축으로 열지 않았다.** 제품 두 구현이 이미 「잠기면 변 손잡이를 없앤다」를
  갖고 있어 두 축을 다 열면 실현되지 않는 칸이 둘 생긴다.
- **삼분할 안내선 색이 한 단 진해졌다** — 흰색 24% 에서 `color-media-indicator-rest`(28%)로.
  24% 짜리 매체 위 표식 토큰이 없고, 만들면 배너 인디케이터가 쓰는 값 옆에 두 번째 같은
  뜻의 값이 생긴다. 대비를 이유로 한 변경이 아니다.

### Not done — 그리고 왜

- **제품 채택은 하지 않았다.** 원장의 네 표면은 `needed` 로 남는다 — 값의 출처는 제품이지만
  대응은 제품이 클래스를 바꿔 물 때 선다.
- **모서리 ㄱ자 브래킷은 버렸다.** Figma 에서 변마다 다른 두께를 주면 되읽기가 두께를 아무
  값도 담지 못하고(계약 밖의 값이 된다), 브래킷은 뒤에 매체가 있을 때만 읽혀 선택 상자에서
  성립하지 않는다.
- **작업 영역이 있는 모달(Dialog `workbench` size)은 서지 않았다.** 세 크롭 모달의 폭이
  720 · 760 · 720, 곡률이 16 · 16 · 10, 높이 상한이 900 · 560 · 60vh 로 수렴하지 않는다.
  하나를 고르면 그것은 실측이 아니라 지어낸 값이다. 이 프레임은 모달 없이도 선다.
- **바깥을 덮는 스크림은 컴포넌트에 넣지 않았다.** 무한히 번지는 층이라 Figma 프레임 안에
  담을 도형이 없고, 선택 상자에는 그 층이 아예 없다. 소비처가 켜는 선언 하나로만 준다.

## 2026-09-07 (116) — 캔버스 연결선의 채널 톤을 Figma 에 세운다 (CanvasEdge)

노드 캔버스의 연결선은 손으로 **일곱 벌** 복제돼 있었고, 그중 워크스루 오버레이 네 벌은 이미
정본과 세 자리에서 갈려 있었다 — 쉬머 주기(1.85초 대 1.45초), 번짐 색(톤과 무관하게 노랑 하나),
image 하이라이트(또 다른 리터럴). 「V2EdgeLayers 와 동일」이라 적은 주석이 동일함을 지켜 주지
않는다는 증거다. 정본을 세운다.

### Added

- Figma `CanvasEdge` component set. `Tone` 일곱(`default` + 채널 여섯) × `State` 둘
  (`Default` · `Hover`) = 14 변형. `DS · Components` 페이지.
- 계약 `figma/components.measured.json` 의 `canvas-edge` — 획 두께 · 히트 영역 · hover 잉크 ·
  쉬머 주기와 불투명도 · 시편 치수, 그리고 톤 일곱의 실선·쉬머 토큰.
- `verify-figma-parity` 의 `canvas-edge` 계약과 `figma-readback-emit` 의 채취 명세.
- 문서 `design/components/canvas-edge.md`.

### Changed

- 실선 색의 **정본을 채널 토큰으로 정했다.** 제품 `V2EdgeLayers` 는 accent 램프를 직접 읽고 같은
  채널의 핸들 원반은 채널 토큰을 읽는다 — 두 곳이 지금은 같은 값으로 끝나지만 참조가 갈려 있어
  한쪽만 움직이면 조용히 어긋난다. `edgeTone.ts` 가 지키려는 불변식(원반 색 = 전선 색)을 토큰이
  대신 지키게 한다.
- 쉬머 하이라이트의 **정본을 채널 램프의 200 칸으로 정했다.** 여섯 톤 중 edit·audio 두 톤은 제품
  리터럴이 이미 그 칸과 바이트로 같고 셋만 램프 밖이다. 규칙이 이미 두 번 맞은 자리라 새 색을
  셋 만들지 않는다.

### Not done — 그리고 왜

- **흐르는 쉬머와 번짐은 Figma 에 없다.** 쉬머는 무한 반복 애니메이션이라 그리지 못하고
  (Skeleton 스윕과 같은 한계), 번짐은 반경이 톤마다 달라 되읽기의 effect 역할(자손 이름 하나에
  값 하나)이 담을 자리가 없다 — 한 값으로 적으면 일곱 톤 중 여섯을 거짓으로 고정한다.
- **바닥의 점 격자는 컴포넌트가 아니다.** 간격 24 · 점 2 이고 색은 `color-node-canvas-dot` 이
  이미 갖는다. 패턴 채움이라 component set 으로 세우지 않는다. 다만 **그 변수의 라이트 값이 제품과
  다르다** — 변수는 검정 잉크를 쓰고 제품은 회색 잉크를 쓴다. 다크 값은 일치한다. 어느 쪽이
  옳은지는 소유자 판정이라 이 회차가 정하지 않았다.
- **정렬 스냅 가이드는 이름이 없다.** 제품이 램프 밖 리터럴 하나로 그리고 자체 glow 필터를 건다.
  이름을 세우려면 새 프리미티브가 필요하고 그것은 토큰 파이프라인과 Figma 변수 컬렉션을 함께
  움직이는 별건이다. 이 회차는 그 사실만 적는다.
- **엣지 삭제 버튼**은 흡수할지 별 부품으로 세울지 아직 판정하지 않았다.

## 2026-09-06 (115) — TextField 에 결합(Join) 축을 연다 (none · start · middle · end)

`text-field.md` 의 Known deviations 가 **자기가 못 담는 것을 스스로 지목해 두고 있었다** —
「결합 입력이 없다 … 이 축은 그것을 담지 않으므로 표면 원장의 다섯은 그대로 `needed` 다.」
그 줄을 닫는다([DS-D-0052](../governance/decisions/DS-D-0052-joined-fields-are-an-axis.md)).

### Added

- `TextFieldJoin`(`none` · `start` · `middle` · `end`)과 `join` prop. 기본값은 `none` 이고
  그때는 `data-join` 이 아예 붙지 않는다.
- Figma `TextField` 에 `Join` 변형 축과 아홉 변형(`lg/floating` × 세 결합 × Default·Focus·Placeholder).
  20 → 29 변형.
- 계약 `input.sizes` 에 `lg/floating/start` · `/middle` · `/end` 세 칸.

### Changed

- 계약이 Box 의 곡률을 `cornerRadius` 하나가 아니라 **왼쪽 두 모서리**(`radius`·`radiusBottom`)로
  본다. 결합 칸은 네 모서리가 갈려 Figma 의 `cornerRadius` 가 `mixed` 로 떨어지고, 그러면 그 칸의
  곡률이 아무것과도 대조되지 않는다. 기존 네 칸에도 `radiusBottom` 이 생겼다(값은 `radius` 와 같다).
- 되읽기 채취 명세에 `key.omit` 이 생겼다 — 그 축이 그 값일 때 키에 칸을 만들지 않는다.
  덕분에 결합하지 않은 네 키(`lg/stacked` 등)가 **개명되지 않았다.**

### Migration

제품은 아직 물지 않는다. 인증 다섯 화면이 각자 들고 있는 결합 상수를 이 축으로 옮기는 절차는
별도 문서가 갖는다. 옮기기 전에 **소유자가 판정할 것이 하나 있다** — 인증 계열이 정본과 갈리는
스킨 넷(1px 12% 테두리 · 4% 알파 면 · inset 링 · 값 타이포 16)을 정본으로 수렴시킬지 스킨 축으로
열지. 결합 축은 그 판정과 무관하게 선다.

### 알아 둘 것 — 겹침은 토큰 값이 아니다

`border-width-hairline` 은 0.5px 인데 겹침은 **1px** 이다. 브라우저가 inset 그림자의 사용값을
1px 로 올리기 때문이고, 실측으로 0.5px 겹침은 **겹치지 않은 것과 픽셀이 같다.** 이름이 맞아
보인다고 토큰을 그대로 쓰면 축은 서지만 아무것도 고치지 못한 채 초록이 된다.

## 2026-09-06 (114) — 빈 상태에 layout 축을 연다 (base · compact · canvas)

`EmptyState` 는 **면·테두리·반경이 0** 인 텍스트 블록 하나였다. 그 사양의 근거는 「제품 정의 9벌이
유일하게 합의한 것」이었고, 계약 `$note` 가 그 문장을 그대로 갖고 있었다. **그 합의는 집계 «안»에서만
참이다** — 집계 밖에 정의가 둘 더 있고 둘 다 base 로는 그릴 수 없다.

### 축을 연 근거 — 합의 밖의 두 정의

| 자리 | 제품 정의 | base 로 못 그리는 이유 |
| --- | --- | --- |
| 대시보드 섹션 | `AnalyticsStatePanel`(`components/scenes/analytics/shared.tsx:123-128`) | 면 + 1px 테두리 + 반경 12 + **좌측 정렬**. 「면을 갖지 않는다」의 유일한 반례다 |
| 빈 캔버스 | `CanvasEmptyState`(`.../node-canvas-v2/components/CanvasEmptyState.tsx:24-38`) | 그래픽 없이 제목 28 한 줄과 버튼 둘. 여백·간격·제목 계층이 전부 다르다 |

앞의 것은 이 컴포넌트의 **단일 최다 소비처**다 — 앵커 `5a67d692` 전수로 JSX 호출 15곳 / 6파일 /
2라우트(`/analytics/instagram` · `/analytics/youtube`)다.

### Added

- `EmptyState` 에 `layout?: "base" | "compact" | "canvas"`(기본 `base`)와 공개 타입
  `EmptyStateLayout`. DOM 에는 `data-layout` 이 **기본값에서도** 붙는다 — 값이 있을 때만 붙이면
  「기본값이라 없다」와 「prop 을 못 받았다」가 구분되지 않는다.
- `packages/css/src/component/empty-state.css` 에 `[data-layout="compact"]` · `[data-layout="canvas"]`.
- 계약 `figma/components.measured.json#empty-state.sizes` 에 `compact` · `canvas` 두 칸. `align` 은
  세 칸 모두에 새로 생겼다 — 정렬이 이 축에서 가장 눈에 띄는 값인데 어느 게이트도 재지 않고 있었다.
- Figma `EmptyState` 가 단일 component 에서 **`Layout` 축 3변형의 component set** 이 됐다.
  되읽기 채취 명세에 `counterAxisAlignItems` 와 `strokes:["self"]` 를 더해 정렬과 compact 의
  테두리가 게이트에 걸리게 했다.

### Changed

- `sizes` 가 한 칸에서 세 칸이 됐고, 계약이 `sizeKey: "base"` 에서 `sizeKeys: ["base","compact","canvas"]`
  로 넓어졌다. 좁혀 두면 새 두 칸은 Figma 가 무슨 값을 그리든 초록이다(`verify-figma-done` 의
  「대조 범위 밖」이 그 상태를 잡는다).
- Figma padding 은 `CSS padding + borderWidth` 로 계약한다. base·canvas 는 테두리가 0 이라 합이
  항등이고 compact 만 20 + 1 = 21 이다.

### 옮기지 않은 것

- **`tone="error"`.** 제품의 오류 분기가 더하는 클래스 문자열이 빈 문자열이고(`shared.tsx:130-132`),
  원본 CSS 의 오류 색은 특이도 싸움에서 져 배포본에서도 그려지지 않는다. 그리지 않는 것을 축으로
  세우면 시안이 배포본과 어긋난다.
- **`Graphic`·`Actions` 를 variant 축으로 여는 것.** 자리의 유무는 이미 `HasGraphic`·`HasDescription`·
  `HasAction` 불리언이 담고 있고, 액션 «개수»는 소비처의 것이라 코드 쪽에 되잴 근거가 없다.
  한 방향만 걸리는 값은 계약에 넣지 않는다.
- **캔버스 제목의 잉크.** 제품은 `rgb(gray-000 / 72%)` 이고 LOUIS 는 `color-fg-primary` 다. 알파
  잉크는 표면 사다리와 같은 이유로 옮기지 않았다 — 대비를 이유로 값을 바꾼 것이 아니다.

### Migration

기존 호출부는 바뀌지 않는다. `layout` 의 기본값이 `base` 이고 그 칸의 값은 한 자리도 움직이지
않았다. 제품 채택 절차는 [Product Adoption](../governance/migration.md) 을 따른다.

## 2026-09-03 (113) — 이름변경 상자를 밑줄형으로 통일한다 (DS-D-0051)

바로 앞 항목(112)이 **열어 둔 채로** 닫은 둘을 소유자 판정으로 함께 닫았다. 두 벌을 나란히
놓고 물었고 답은 「**밑줄형으로 통일**」이었다.

### 축을 열지 않고 기본값을 바꿨다

`.louis-project-card-rename` 의 계약이 `border: 0` 에서 `border-block-end: 1px` 로 간다.
`Chrome: bare | underline` 축을 여는 길도 있었지만, 통일이면 `bare` 를 고르는 소비처가 하나도
남지 않는다 — **옵션이 하나뿐인 축은 축이 아니라 재고다**(DS-D-0030). 축으로 열었으면 변형이
3 → 6 이 되고 그 절반이 아무도 안 그리는 그림이 됐다.

### 반경 8 을 없앴다

정본이 쓰던 `radius-control-sm`(8)은 **제품 네 벌 중 어느 벌도 쓰지 않는 값**이었다(2 · 2 ·
0 · 0). 밑줄이 정본이 된 지금은 그냥 안 쓰이는 값이 아니라 **틀린 값**이다 — 반경을 주면 밑줄
끝이 말려 올라간다. 그 문장은 하이라이트 허브가 정본을 얹지 않은 사유로 제품 주석에 낱말
그대로 있었다.

### 토큰 둘을 새로 열었다

밑줄 색은 라이트 `palette-gray-400`(139 142 147) · 다크 `palette-gray-500`(114 117 123)이고,
LOUIS 의 stroke 토큰 중 이 쌍에 맞는 것이 **없다** — `stroke-default` 는 둘 다 다르고
`stroke-strong` 은 다크만 우연히 같다. 값이 같다는 이유로 이름을 빌리지 않는다(DS-D-0030).

- `color-stroke-underline` — 라이트 `palette-gray/400` · 다크 `palette-gray/500`.
  역할은 **경계가 아니라 표식**이다. 담는 것이 없으므로 물러설 이유가 없고, 「여기에 글을 쓸 수
  있다」를 말하는 유일한 표시라서 보여야 한다 — 그래서 라이트에서 `stroke-default` 보다 두 칸
  진하다.
- `space-underline-gap` — 2px. 글자와 선 사이의 내림획 여유이며 제품 두 벌의 `padding: 0 0 2px`
  다.

`pnpm check-token-diff` 판정은 **additive 3 · breaking 0** 이다.

### 초점 링은 남기고 두께를 올렸다

소유자가 고른 것은 **시각**이지 키보드가 아니다. 제품의 밑줄 두 벌에 초점 표시가 없는 것은
호출부가 상자를 띄우자마자 `focus()` 를 넘겨 두 상태가 항상 같이 오기 때문이고, 그 우연이 없는
소비처에서는 둘이 구별되지 않는다. 두께는 `border-width-hairline`(0.5)에서
`border-width-ring`(2)로 올렸다 — 0.5px 링은 밑줄과 나란히 놓인 또 하나의 가는 선이 되어 초점
여부가 「선이 하나인가 둘인가」로 읽힌다.

### Figma 의 밑줄은 stroke 가 아니다

한 변에만 stroke 를 두면 `node.strokeWeight` 가 `figma.mixed` 가 되고, 되읽기 emitter 가
`typeof === "number"` 인 노드만 담는다. 그러면 **선이 그려져 있어도 스냅숏에 아무 값도 남지
않아 어느 게이트도 보지 못한다.** 높이 1 의 `Underline` 부품(면)으로 그렸고, 그래서 root 의
헤어라인 계약도 그대로다.

되읽기 실측: `strokeWeight` `[0.5]` · `strokes.self` `["0.5|INSIDE"]` · `rawFills` 0 ·
`rawStrokes` 0 · `overflowingParts` 비었고 `childOrder` `["Media","Action","Adornment"]` 그대로.
띠 높이 107.7 · 세 줄 폭 327 · 여백 16 · 간격 4 도 **바뀌지 않았다** — 상자가 3px(여백 2 +
선 1) 높아졌는데도 그렇다. 띠가 `min-block-size: 30%` 의 하한이 이기는 구간(내용 93 < 띠
107.7)이라 3px 를 하한 안에서 흡수한다. `boundFills` 만 15 → 16 으로 는다(밑줄 하나).

### 제품은 아직 옮기지 않았다

네 벌을 밑줄로 모으는 것은 제품 저장소의 작업이라 여기서 하지 않았다. 앱 홈·노드캔버스 홈은
정본을 이미 얹고 있어 덮어쓰기를 걷어내면 끝이고, 하이라이트·비디오 에디터 허브는 직접 그린
선언을 정본 채택으로 바꾸는 일이라 크기가 다르다. 절차는 DS-D-0051 의 Rollout 에 있다.

## 2026-09-03 (112) — ProjectCard 에 `Renaming` 상태를 세운다 (DS-D-0050)

카드에서 **제목 자리를 그대로 이름 변경 상자로 바꾸는** 상태를 Figma 에 세웠다. 이름은
`ProjectCardRename` 으로 CSS·React 에 **이미 있었고**, 없던 것은 Figma 쪽이다 — 자손 여덟에
그 자리가 없었고 계약도 `moreSize`·`moreRadius` 만 갖고 rename 은 갖지 않았다. 세 곳 동시가
이 부품에서만 지켜지지 않은 채 게이트가 초록이었다.

**먼저 쟀다.** 앵커 `ae8fd627` 에서 히스토리 카드 네 벌을 전부 읽었고, 작업 목록이 든 네 축 중
**셋은 이미 열려 있었으며 하나는 전제가 틀렸다.**

- **9:16 은 이 카드가 아니다.** 네 벌이 전수 `aspectRatio: "1 / 1"` 이고 정본 기본값과 같다.
  9:16 은 애널리틱스의 인기 콘텐츠 목록과 `ContentTable` 영상 셀에 있다.
- **제목 오버레이와 더보기는 이미 셋 다에 있다.** 네 벌 중 셋이 정본을 그대로 문다
  (`louis-project-card` · `-overlay` · `-more`). 넷째(비디오 에디터 허브)만 프레임부터 자체
  구현인데 반경은 `rounded-12` 로 정본과 **같다** — 값이 갈린 것이 아니라 채택이 안 된 것이다.
- **남은 하나가 이름 변경이었다.**

### 축이 아니라 상태다

이름을 바꾸는 동안 달라지는 것은 제목 한 줄이 `<span>` 에서 `<input>` 으로 바뀌는 것 하나뿐이고,
띠 높이(107.7) · 세 줄 폭(327) · 여백 16 · 간격 4 · 헤어라인 · 클릭 타깃이 전부 그대로다.
그래서 `State` 축에 `Renaming` 을 더했다(변형 2 → 3). `Hover` 가 그 축에 사는 사유와 같다 —
Figma 에는 CSS 상태가 없다.

`Rename` 은 **크롬이 없다.** 테두리도 면도 두지 않았고 계약이 대조하는 값은 반경 8 하나다.
초점 링을 그리지 않은 이유는 `strokeWeight` 집합이 `[0.5]` 에서 `[0.5, 1]` 로 늘어 헤어라인
계약이 깨지기 때문이다.

### 밑줄 크롬은 열지 않았다 — 색 판정이 하나 걸린다

제품 네 벌의 이름 변경 상자가 **2 대 2 로 갈린다.** 앱 홈·노드캔버스 홈은 정본을 얹고 반경만
2 로 덮고, 하이라이트 허브·비디오 에디터 허브는 정본을 **얹지 않고** 밑줄
(`border-bottom: 1px`)에 반경 0 이다. 밑줄 색이 라이트 `palette-gray-400` · 다크 `gray-500`
인데 LOUIS stroke 토큰 중 이 쌍과 맞는 것이 없다 — 새 semantic 토큰은 Figma 변수까지 함께
움직이고, 무엇보다 **어느 쌍이 정본인지를 이 저장소가 고를 수 없다.**

같은 이유로 **정본 반경 8 도 그대로 둔다.** 네 벌이 2·2·0·0 이라 소비처가 하나도 없지만,
옮기려면 2 냐 0 이냐를 먼저 정해야 한다.

### 이 작업이 드러낸 것

- **`clone()` 이 TEXT 의 component property reference 를 조용히 버린다.** 복제한 변형의
  세 텍스트가 참조를 잃었고 **어느 게이트도 잡지 못한다** — 되읽기는 set 의 정의만 담고
  노드별 참조는 담지 않는다. 손으로 되돌렸다.
- **Figma 의 `Adornment` 가 두 뜻을 겸하고 자리도 틀렸다.** 이름은 모서리 슬롯인데 치수는
  더보기 버튼(32)이고, 세 변형 모두 프레임 좌상단 `(0, 0)` 에 앉아 있다. CSS 는 오른쪽 위
  8px 이다. 계약이 `width`·`height` 만 보므로 초록이다. 범위 밖이라 고치지 않았다.

### 원장은 옮기지 않는다

닫힌다고 적힌 네 항목은 카드가 아니라 **화면**이고, 사유가 배너 캐러셀 · 그리드 레이아웃 ·
섹션 eyebrow · 빈 상태 · 확인 모달 · 토스트 · 업로드 카드 · 테마 드롭다운을 함께 든다.
「카드가 닫히면 남는 것은 그리드 여백과 빈 상태뿐」이라던 작업 목록의 문장은 실측과 다르다.

## 2026-09-03 (111) — TextField 에 `LabelBehavior` 축을 연다 — 플로팅 라벨 (DS-D-0049)

제품 인증 화면의 **플로팅 라벨 입력 상자**를 세웠다. 표면 원장의 `needed` 다섯이 「그 슬롯을
채우는 실제 폼 벌은 51개 어디에도 없다」로 같은 문장을 공유하던 자리다.

**먼저 쟀다.** 앵커 `ae8fd627` 에서 일곱 벌을 읽었고(`/login` · `/signup` · `/recover` ·
`/reset-password` · `/reset-password/new` · `/aws/signup` · 설정의 인증 모달) **기하가 일곱 벌
모두 글자 그대로 같았다** — 여백 12/16 · 반경 12 · 값의 위 여백 8 · 라벨 좌측 16 · 떠오른 라벨
`top: 12` · 쉬는 라벨은 세로 중앙. 갈리는 것은 색 셋뿐이고 다섯이 한 값(40%/40%)에 모인다.

정본과 갈리는 선언은 다섯인데(높이·내부 배치 · 테두리 · 면 · 링 · 값 타이포) **플로팅 라벨이
만든 것은 첫째 하나뿐이다.** 그래서 새 컴포넌트가 아니라 축이다 — 반경·좌우 여백·슬롯 간격·
헤어라인·면을 하나도 다시 쓰지 않으며 브라우저 테스트가 그것을 `stacked` 와의 계산값 비교로
잰다. 판정 기준은 [DS-D-0041](../governance/decisions/DS-D-0041-dialog-tone-axis.md) 이 Dialog 의
`Tone` 에서 쓴 것을 그대로 적용했다.

### Migration

**깨지는 것이 없다.** `labelBehavior` 의 기본값이 `stacked` 이고 그것이 지금까지의 동작이다.

```diff
+ <TextField label="이메일" type="email" labelBehavior="floating" />
```

`floating` 에서는 `label` 이 사실상 필수다 — 라벨이 placeholder 의 자리를 대신하므로 없으면
필드에 보이는 이름이 하나도 남지 않는다. placeholder 는 컴포넌트가 알아서 채우고 숨긴다.

### 축 어휘가 하나 늘었다

`figma-component-authoring` §2 의 닫힌 표에 `LabelBehavior`(`stacked`·`floating`)를 더했다.
`Mode` 를 늘리지 않은 이유와 조건 축 `Floating: false|true` 로 열지 않은 이유를 그 자리에
함께 적었다 — 전자는 `determinate`·`indeterminate` 와 겹치지 않는 두 번째 쌍이 한 이름 아래
놓이기 때문이고, 후자는 라벨의 자리가 「그 순간 참인지」가 아니라 **고르는 것**이기 때문이다.

**「떠 있는가 앉아 있는가」에는 축을 만들지 않았다.** `State` 가 이미 그 계약이다 —
`Placeholder` 가 쉼이고 나머지 넷이 떠오른 상태다. 그 덕에 변형이 15 → **20** 으로 그쳤다
(`floating` 은 `lg` 에만 있다 — 제품이 그 자리에서 `lg` 만 쓴다).

### 되읽기 키가 복합이 됐다

`{Size}` 에서 `{Size}/{LabelBehavior}` 로 바뀌었다(`lg/stacked` · `md/stacked` · `sm/stacked` ·
`lg/floating`). `InlineLoadingLabel` 의 `{Size}/{Loading}` 이 같은 형태의 선례다. 한 size 안에서
두 라벨 동작이 서로 다른 기하를 갖기 때문이고, 그 전에는 담을 자리가 없었다.

### 이 작업이 드러낸 「초록인데 재고 있지 않던」 자리 넷

이 변경이 부른 것이 아니라 이 변경이 지나가며 걸린 것이다.

1. **`boxWidth` 320 이 어디서도 대조되지 않고 있었다** — 계약의 `parts` 에 `Box` 키가 둘이라
   먼저 쓴 쪽이 조용히 버려졌다.
2. **`frameWidth` 328 도 마찬가지** — 「focus 링 4px 이 잘리지 않게」라는 사유까지 실측에 있는데
   계약의 `fields` 가 비어 있었다.
3. **`parts` 의 규칙이 「root 와 같다」는 주석과 달랐다** — `set` 이 root 에만 있었다.
4. **Figma 의 `Placeholder` 값 색이 코드와 달랐다** — Figma `fg-tertiary` / CSS `fg-secondary`.
   `states` 표가 그 상태를 담지 않아 게이트 시야 밖이었다.

넷 다 같은 변경에서 닫았다. 그리고 `text-field.md` 의 「Figma 에 `sm` variant 가 없다」도 이미
해소된 낡은 문장이었다 — `icon-button.md` 에서 2026-09-02 에 같은 형태를 고치며 「다른 컴포넌트
문서에도 있는지는 훑지 않았다」고 남긴 그 자리다.

### 닫히지 않은 것

**원장 다섯은 그대로 `needed` 다.** 남은 부품은 **결합 입력**이다 — 상자 둘을 위/아래로 이어
붙이고 포커스가 `z-index` 를 올려 이웃의 테두리 위로 올라오는 형태이며 일곱 벌 중 넷이 쓴다.
비밀번호 표시 토글과 지우기 버튼은 `prefix`/`suffix` 슬롯이 이미 받는다. 제품 채택도 별건이다 —
인증 계열의 스킨 넷을 어느 쪽으로 수렴시킬지는 제품 픽셀을 움직일 수 있는 사람의 몫이다.

## 2026-09-01 (110) — Dialog 의 `confirmVariant` 를 `tone` 으로 바꾼다 (breaking)

**확인 대화상자는 Dialog 의 한 톤이다. `ConfirmDialog` 를 따로 세우지 않는다**
([DS-D-0041](../governance/decisions/DS-D-0041-dialog-tone-axis.md)).

| 자리 | 이전 | 지금 |
| --- | --- | --- |
| `DialogProps` | `confirmVariant?: "primary" \| "danger"` | **`tone?: "neutral" \| "danger"`** |
| 타입 이름 | `DialogConfirmVariant` | **`DialogTone`** |
| `DialogVariantPolicy` | `confirmVariant` | **`tone`** |
| Figma `Dialog` | `Size` · `HasClose` · `Title` · `Description` | **`Tone` 축 추가**(변형 4 → 5) |

### Migration

```diff
- <Dialog open confirmVariant="danger" … >
+ <Dialog open tone="danger" … >
```

`primary` → `neutral` 로만 읽으면 된다. `danger` 는 그대로다. **화면은 하나도 바뀌지 않는다** —
`neutral` 은 확인 버튼의 `variant="primary"` 로 내려간다.

`variant` 로 기본값이 정해지는 것도 그대로다. `danger-confirm` 만 `danger` 이고 나머지 넷은
`neutral` 이다. 대부분의 소비처는 prop 을 넘기지 않으므로 고칠 것이 없다.

### 왜 이름을 바꿨나

축이 Figma 에 `Tone` 으로 서는데,
[figma-component-authoring §2](../governance/figma-component-authoring.md) 의 닫힌 어휘가 `Tone` 의
값을 `neutral`·`info`·`success`·`warning`·`danger` 로 못박는다. `primary` 는 그 표에서
`Variant`(강조 단계)의 낱말이다. 그리고 `verify-figma-parity` 는 variant 축의 옵션 집합을 **코드
union 과 글자 그대로** 대조하므로, 코드가 `"primary"` 를 들고 있으면 Figma 도 `Tone=primary` 가
되어 어휘가 무너진다. `ToastTone = "neutral" | "danger"` 가 같은 자리의 선례다.

`Tone` 에 `info`·`success`·`warning` 은 열지 않았고, Figma 에서 `Tone=danger` 는 **compact 칸에만**
그린다 — 제품의 확인 모달 두 벌이 둘 다 `data-size="compact"` 라 나머지 칸에는 근거가 없다.

### 같은 작업에서 함께 고친 Figma 결함 둘

되읽기를 다시 뜨자 낡은 캡처가 가리고 있던 것이 드러났다. 둘 다 이 변경 전부터 있던 것이다.

- **닫기 버튼이 카드 밖에 있었다.** 다섯 변형 모두 `Close` 가 좌하단(프레임 아래로 24px)에
  놓여 있었다. `.louis-dialog__header` 가 두는 자리인 **우상단 inset** 으로 옮겼다.
- **sheet 의 위쪽 곡률이 24 였다.** 정책이 sheet 의 size 를 medium 으로 주므로 코드 값은
  `radius-overlay` 16 이다. Figma 를 16 으로 맞췄고, 아래 두 모서리 0 은 그대로다.

`figma/components.measured.json` 에 `sheet` 칸과 `radiusBottom` 이 없어서 그 곡률이 **아무것과도
대조되지 않고 있었다.** 되읽기 채취 명세와 계약을 `cornerRadius` 에서 `topLeftRadius` ·
`bottomLeftRadius` 로 옮겨 그 구멍을 닫았다.

## 2026-08-31 (109) — 카드 격자 간격을 4px 에서 6px 로 되튜닝한다

제품의 카드 격자가 랜딩과 어긋나 있었다. 랜딩의 세 캐러셀은 이미 6px(`gap-3`, `--spacing: 2px`)
인데 앱의 프로젝트 격자 네 곳은 4px 였다. 같은 「카드가 나란히 놓인 줄」이 화면에 따라 다른
간격으로 보이던 것이므로, **넓은 쪽인 6px 로 모은다.**

새 토큰을 만들지 않았다. 이 관계에는 이미 이름이 있다 — `layout-project-grid-gap` 이고, 값만
`{primitive.spacing.4}` → `{primitive.spacing.6}` 으로 옮겼다. 소비처가 없어서 값이 놀고 있던
토큰에 제품을 붙이는 변경이기도 하다.

| 자리 | 이전 | 지금 |
| --- | --- | --- |
| `layout-project-grid-gap` | 4px | **6px** |
| 앱 프로젝트 격자 4곳 | `gap-2` 리터럴 | `gap-layout-project-grid-gap` (토큰) |
| 랜딩 최신 소식 트랙 | `gap-2` + 열 347px | `gap-3` + 열 346px |
| 크리에이터 미디어 카드 격자 2곳 | `gap-2` | `gap-3` |

**토큰을 쓰는 자리와 `gap-3` 을 쓰는 자리를 갈랐다.** 프로젝트 격자 네 곳(archive home ·
NodeCanvas hub · Video Editor history · Highlight history)만 토큰을 소비한다 — 이 넷이
[Project Grid](../patterns/project-grid.md) 의 compatibility profile 이 말하는 그 격자이고,
capacity 산술이 이 토큰을 참조하기 때문이다. 랜딩과 이벤트 페이지의 카드 줄은 같은 6px 이지만
프로젝트 격자가 아니므로 primitive 스케일(`gap-3`)로 적는다. 값이 같다고 이름을 빌려 쓰면
다음에 프로젝트 격자만 되튜닝할 때 관계없는 화면이 함께 움직인다.

랜딩 최신 소식 트랙은 열 폭도 같이 움직였다. 열 폭이 `(1400 − gap×3) ÷ 4` 로 잡혀 있어서다 —
gap 이 4일 때 347px 였고 6이면 345.5px 라 격자에 떨어지지 않는다. **346px 로 올림했다.** 4열 합이
1402px 로 콘텐츠 폭보다 2px 넓지만 트랙이 `w-max` 로 가로 스크롤하는 자리라 잘리는 것이 없고,
오히려 347 이 홀수라 2px 격자 밖이던 것이 346 으로 격자에 올라온다. 스냅 간격도 351 → 352 다.

capacity 산술의 숫자가 함께 바뀌었다(한 열 244 → 246px, `floor((W + 4) / 244)` →
`floor((W + 6) / 246)`). **결론은 그대로다** — `auto-fill` 환산과 profile 이 엇갈리는 구간
(720px·1800px)이 gap 을 올려도 같은 답을 낸다. gap 은 그 blocker 의 원인이 아니었다.

[Releases](../governance/releases.md) 「의도적 breaking과 baseline 갱신」 절차대로 이 항목을 먼저
쓰고, `node scripts/diff-tokens.mjs` 로 breaking 이 `layout-project-grid-gap` 하나뿐인지 확인한 뒤
`packages/tokens/baseline/manifest.json` 을 같은 변경 단위에서 갱신했다. 같은 diff 에
`layout-control-height-sm` 이 additive 로 하나 남아 있었는데, 이번 변경 이전부터 baseline 이
따라오지 못하고 있던 것이라 함께 흡수했다.

## 2026-08-31 (108) — 배너 캐러셀을 가운데 정렬로 되튜닝한다

제품 아카이브 배너가 Figma page 14 시안으로 바뀌었고([klipse-web `design`](https://github.com/KlipseAI/klipse-web)
76e289f7 · 5832587b · 0dfb144e), 그 픽셀로 LOUIS 정본을 따라 세운다
([DS-D-0028](../governance/decisions/DS-D-0028-three-in-one-change.md) 「세 곳 동시 반영」).

| 자리 | 이전 | 지금 |
| --- | --- | --- |
| 본문 | 왼쪽 540px 상자, 좌측 정렬 | 배너 가운데, `text-align: center` |
| 배경 | 좌→우 스크림(78 → 46 → 0) + 사진 | 사진 한 겹 |
| progressive blur | 좌→우 한 방향, 5스톱 | 위·아래 20% 밴드 두 겹, 곡선은 base.css 정본 |
| 컨트롤 | 우하단 글래스 알약 + 화살표 | 하단 가운데 인디케이터 (알약은 `controls="pill"`) |
| 인디케이터 | 7px 점, 활성 폭 20px | 30×2 막대, 활성만 밝다 |

### 스크림이 사라진 이유와 그 대가

좌→우 스크림은 **왼쪽에 놓인 글자의 대비 장치**였다. 글자가 가운데로 오면서 그것은 대비가 아니라
사진을 한쪽만 어둡게 만드는 일이 됐다.

대신 글자 대비를 `tone` 하나가 책임진다. **그 책임은 얇아질 수 있다** — 제품 실측에서
`hero-main-bg.webp` 슬라이드의 설명 글자 대비가 중앙값 2.49:1까지 내려갔다(WCAG AA 4.5:1 미달).
사진을 고르는 쪽이 그것을 책임지며, 필요하면 소비처가 가운데에 자기 스크림을 얹는다. DS는 한쪽
방향으로만 걷히는 스크림을 다시 들이지 않는다.

### 밴드가 둘인데 층은 하나다 — 새 토큰

`::before`와 `::after`로 밴드를 하나씩 두면 `::after`가 콘텐츠 **뒤**에 와서 제목 위에 칠해진다.
예전 스크림이 정확히 그 이유로 `::after`를 떠났었다. 숫자 z-index를 새로 들이지 않고 그 상태를
막는 방법으로, 마스크를 두 겹 쌓고 `mask-size`로 각각 20% 높이로 잘라 위·아래에 붙였다.

위 밴드의 곡선을 위해 **`--louis-progressive-blur-mask-block-start`** 를 base.css에 낸다.
접미사 없는 `--louis-progressive-blur-mask`(`to top`)의 거울상이며 정지점이 한 글자도 다르지 않다 —
두 밴드가 대칭이라는 말이 곧 이 값이 같다는 뜻이다. 그전에는 이 방향의 곡선이 이름을 갖지 못해
`-header`(다른 감쇠)를 빌리거나 정지점을 손으로 베끼는 수밖에 없었다.

### 폭이 상태였던 것이 밝기로 — DS-D-0033

[DS-D-0033](../governance/decisions/DS-D-0033-brightness-is-state.md)가
[DS-D-0019](../governance/decisions/DS-D-0019-layout-change-motion.md)의 배너 적용분을 뒤집는다.
7 → 20px로 늘어나는 칸은 옆 칸을 민다. 컨트롤이 우하단 알약 안에 있을 때는 오른쪽 변이 고정돼
그 밀림이 보이지 않았지만, 하단 **가운데**로 오면서 밀림이 곧 좌우 흔들림이 됐다 — 5.5초마다
가운데축이 움직인다. 폭을 고정하고 밝기로 말해 그것을 없앤다.

`layout-change` lifecycle 자체는 유효하다. 배너 인디케이터가 그 목록에서 빠질 뿐이다.

### 토큰 값 하나가 움직인다

| 토큰 | 이전 | 지금 |
| --- | --- | --- |
| `color-media-indicator-rest` | `static-white-alpha.48` | `static-white-alpha.28` |

시안은 30%인데 알파 사다리에 30이 없다. 가장 가까운 칸이 28이고, 2px 막대에서 2pp 차이는 보이지
않는다 — 한 소비처를 위해 사다리 칸을 늘리는 것이
[DS-D-0026](../governance/decisions/DS-D-0026-alpha-scale.md)을 무의미하게 만든다.

이 토큰의 소비처는 배너 인디케이터 하나뿐이라 다른 화면에 영향이 없다.

**Migration.** `color-media-indicator-rest`를 직접 읽는 코드는 값이 48% → 28%로 내려간 것만
반영하면 된다. 이름·타입·모드 구성은 그대로이므로 참조를 고칠 자리는 없다. 토큰 diff 분류는
`rawValue` · `value` · `aliasTarget` 각 2건(light · dark)이며 그 외는 0이고,
[releases.md](../governance/releases.md) 「의도적 breaking과 baseline 갱신」 절차대로
`packages/tokens/baseline/manifest.json`을 같은 변경 단위에서 갱신했다.

### API 변경

`BannerCarousel`에 `controls?: "indicator" | "pill"`이 생긴다. 기본은 `indicator`이고, 화살표는
`pill`에서만 그린다. **정지 버튼은 배치와 무관하게 그린다** — 배치는 장식이고 자동으로 움직이는
것을 멈출 수 있어야 하는 것(WCAG 2.2.2)은 계약이다.

## 2026-08-30 (107) — 제품 화면 이식 파이프라인을 정본으로 들인다

작업이 2026-08-23 에 두 갈래로 갈렸다. 정본은 DS 컴포넌트와 Decision 을 쌓았고, 갈래
(`figma-product-pages`)는 **제품 화면을 Figma 로 그리는 파이프라인 전체**를 만들었다 — 측정 →
FILL/HUG/FIXED/ABSOLUTE 판정 → Auto Layout 계층 → 플러그인 런너(`scripts/build-figma-app-screens.mjs`),
`scripts/build-figma-product-*.mjs` 8종, `scripts/measure-product-auth-fixture.mjs` ·
`scripts/measure-product-sidebar-states.mjs`, `scripts/lib/figma-tree-spec.mjs`, 그리고 그것을 지키는
게이트 10종이다.

**정본에는 제품 화면 보드(Figma 페이지 01~05, 라우트 46개)를 지키는 게이트가 하나도 없었다.**
보드는 Figma 에 서 있는데 저장소가 그것을 검증하지 못하는 상태였고, 갈래에만 있던 게이트는 정본
CI 에서 한 번도 돌지 않았다. 이 저장소의 목적이 「LOUIS 저장소만으로 제품과 똑같이 구현할 수
있는지 확인하는 것」이므로 그 파이프라인은 정본에 있어야 한다. 저장소 규칙도 feature 브랜치를
두지 않는다. 그래서 갈래를 접고 `main` 하나로 되돌린다.

아래 세 소절은 갈래에 기록돼 있던 항목을 **날짜·수치·Figma 노드 id 를 그대로 둔 채** 옮긴 것이다.
갈래가 쓰던 번호 (100)·(101)·(102) 는 정본의 같은 번호와 내용이 달라 충돌하므로 번호를 떼고
날짜로만 둔다. 정본의 (100)~(106) 은 그대로다.

### 2026-08-24 — `/pricing` 전체 페이지를 883개 제품 측정 노드에서 컴포넌트로 조립한다

고정 제품 커밋 `a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4`의 `/pricing`을 light/en-US에서
desktop 1920×1080과 mobile 402×874로 렌더했다. 기존 상위 경계 측정에 그치지 않고 각 문맥의
`main[data-page-root]` 하위 883개 노드에 geometry, computed style, asset URL, SVG path와 직접 텍스트의
실제 브라우저 줄 조각을 기록한다. 모바일 가격의 `35,900`/`KRW`, `per`/`month`와 비교표의 줄바꿈을
Figma 글꼴 엔진에 추측시키지 않는다.

#### Figma 산출물

- section `443:6508` — `P · product/Pricing · measured full-page components and scenes`
- full-page set `443:9424`: desktop `443:7960`(1920×4615.296875), mobile `443:8657`(402×5097.90625)
- component set: Public Global Navigation 2, Public Footer 2, Pricing Plan Card 8,
  Pricing Credit Pack 6, Pricing FAQ Item 14, Pricing Compare Column 8 variants
- 각 full-page scene은 navigation 1 + plan 4 + credit 3 + compare 4 + FAQ 7 + footer 1 =
  20개 instance로 조립한다. 화면 내부에 마스터 복제본을 두지 않는다.

첫 스크린샷에서 Figma 자연 글자 폭 때문에 가격·표 라벨이 다시 감기는 문제와 CheckCircle 축소 표시를
검사했다. 텍스트는 임의 여유값이 아니라 측정된 부모 행/셀의 가용 폭과 `Range.x`를 사용한다.
CheckCircle은 18×18 개별 screenshot에서 원형 stroke와 check가 확인됐으며 SVG clip 정의의 surface paint는
유지하고 보이는 두 stroke만 `accent/mint/500`에 묶는다. scene paint 감사 결과 visible solid 2,192개 중
2,184개가 변수 바인딩이고, 허용된 4개는 두 scene의 footer brand-blue 고정 자산이며 그 밖의 unbound는 0이다.

재현 코드는 연결기 50KB 한도를 넘지 않도록 shell, plan desktop/mobile, credit, FAQ,
comparison desktop/mobile 각 2조각, scenes로 분할 생성한다. `check-figma-product-pricing-page`를
`verify:product`의 제품 의존 게이트에 연결한다. 이 구현은 product-only 추출 후보이며 공통 값을 곧바로
규범 디자인 시스템 토큰으로 승격하지 않는다.

### 2026-08-24 — Upgrade를 desktop/mobile 제품 렌더와 맞추고 숨은 profile 링까지 측정한다

고정 제품 커밋 `a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4`의 `/mypage/upgrade`를
desktop 1920×1080과 mobile 402×874에서 다시 대조했다. Figma에는 desktop Trial/Basic/Pro/Max
카드와 전체 scene, mobile viewport에 실제로 교차하는 Trial/Basic 카드 slice와 clipped scene을 만들었다.
mobile viewport 밖의 Pro/Max/action은 측정 생성물에 없으므로 그리지 않았다.

#### 제품 대조에서 잡은 두 누락

- Trial current-plan 카드의 CSS `2px solid rgba(185,225,247,.42)` / `outline-offset:-2px`를 fixture가
  기록하도록 outline 계산축을 추가했다. Figma에는 같은 시각 결과인 2px INSIDE stroke로 옮겼다.
  정확히 일치하는 로컬 변수가 없어 근사 토큰을 만들지 않고 product-only 측정 paint로 남겼다.
- 프로필 버튼의 `::after` 사용량 링은 DOM tree에 나타나지 않아 기존 상단 바에서 빠져 있었다.
  전용 pseudo-element probe가 36×36, avatar 28×28, ring width/gap 2px, fixture progress 0%,
  track `rgba(0,0,0,.20)`를 기록한다. 기존 `palette/gray-400`과 `gray/000 · a20`에 묶어 mobile/desktop
  Top Bar 12개 변형을 재조정했다.

#### Figma와 게이트

- Upgrade desktop scene `417:2461`, mobile scene `422:2696`, mobile visible-slice set `422:2567`.
- scene paint 감사: 706 visible = 699 variable-bound + Klipse brand fixed 1 + measured Trial outline 6.
- Top Bar paint 감사: 98/98 variable-bound. 최종 readback에서 Pretendard 이탈 0, mobile 금지 콘텐츠 0,
  두 scene의 viewport clip이 각각 1920×1080과 402×874로 확인됐다.
- auth fixture, app-shell, product component/payment candidate hash와 Upgrade 생성물을 함께 갱신했다.

Package/Web의 공개 상태와 제품 adoption은 바뀌지 않는다. 이 산출물은 제품과 Figma 사이의 product-only
근거이며, 반복 계약을 normative design-system component/token으로 승격하는 일은 별도 검토를 거친다.

### 2026-08-23 — 화면을 먼저 제품과 맞춘다: `/`·`/privacy`·`/terms` 6프레임

디자인 시스템을 먼저 추상화하지 않았다. 제품 화면을 Figma에서 재현한 뒤 겹치는 부품을 추리는
순서로 첫 수직 단면을 닫았다. 제품 저장소는 수정하지 않았고, 기준은 고정 커밋
`a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4`의 clean production build다.

#### Figma에 들어간 것

- `/` 영문·라이트: desktop `359:2032`(1920×10527.140625), mobile `359:2986`(402×9033).
- `/privacy`: desktop `350:17450`(1920×10557), mobile `350:18523`(402×12015).
- `/terms`: desktop `350:19606`(1920×8896), mobile `350:20517`(402×11461).
- hero의 흰 박스는 제품 원본 `klipse-wordmark-text-dark.svg` 벡터로 교체했다. desktop/mobile
  표시 크기는 720×285.125 · 201×79.59375다.
- `VideoEditorLandingCapture`는 component set `332:187`로 묶고 desktop/mobile main variant를
  랜딩에 instance로 넣었다. 화면 안 복제본을 남기지 않는다.
- desktop NodeCanvas는 최초 418px skeleton을 정본으로 삼지 않았다. 섹션을 실제로 스크롤해
  hydration이 끝난 1880×756 상태를 캡처하고, 그 결과로 뒤의 8개 상위 section과 footer 경계를
  다시 맞췄다.

작업용 원본 캡처 6개는 검증 후 삭제했다. 페이지에는 정본 프레임과 component instance만 남는다.

#### 측정 생성물도 함께 바뀐다

`scripts/measure-product-scenes.mjs`가 이제 합성 장면뿐 아니라 `/`·`/privacy`·`/terms`를
1920×1080·402×874 light/en-US에서 직접 잰다. `/`는 상위 section 8개, hero wordmark,
hydrated NodeCanvas article, footer를 기록하고 법적 문서는 PAGE/INNER/뒤로가기/로고/h1을 기록한다.
결과는 생성물 `migration/product.scenes.json.pages`에 들어가며 `verify-product-scenes`가 drift를
byte-for-byte 막는다. hero SVG 원본 해시와 `Hero.tsx:54`의 exact source quote도 같은 생성물에
들어간다.

#### 상태를 올리지 않는 이유

이 단면은 끝났지만 제품 전 화면은 아니다. `/pricing`과 나머지 라우트, StaticHighlightDemo의
Figma component 조립, 겹치는 부품 전수 추출, 화면 전체 되읽기 대조가 남아 있다. 그러므로
Landing Shell은 `figma: not-ready`를 유지한다. 이번 변경은 “완료 선언”이 아니라 앞으로 모든
화면에 반복할 검증 가능한 작업 단위를 만든 것이다.

## 2026-08-30 (106) — Figma 에만 서 있던 `CompositePopover` 를 되읽기·계약으로 닫는다

바로 아래 (105) 가 Figma 에 표면을 세우고 문서·manifest·요약까지 붙였는데 **`figma/readback.json`
재캡처와 parity 계약을 빠뜨렸다.** 그러면 게이트는 초록인 채로 어긋난다 — parity 는 되읽기를
정본으로 읽으므로, 되읽기에 없는 컴포넌트는 검증 대상이 아니다. 이 저장소가
[DS-D-0028](../governance/decisions/DS-D-0028-three-in-one-change.md) 로 경계하는 「거짓 초록」의 실제
사례이고, 그것을 잡은 것은 `figma-live-check` 다:

```
[figma-live] Figma 에만 있습니다: CompositePopover (variant 1) — 되읽기를 다시 뜨고 계약·문서를 붙이세요.
```

### Added

- **되읽기** — `scripts/figma-readback-emit.mjs` 의 `CAPTURE` 에 항목을 적고 `--components
  --only CompositePopover` 로 떠서 `--merge` 했다(component 50 → 51). 실측값은 240×148 ·
  padding 8 · itemSpacing 8 · radius 16 · VERTICAL 이고 effect 는 MenuPanel 과 **같다**
  (`DROP_SHADOW:8:15:0 + INNER_SHADOW:0:0:0.5`). 바인딩은 fill 6 · text 2 가 전부 묶여 있다.
- **실측 계약** — `figma/components.measured.json` 의 `menu-popover.sizes` 에
  `composite-popover` 키. inset 8 · gap 8 · radius 16 · 기준폭 240.
- **반대 방향** — `surface-geometry.browser.test.tsx` 가 그 값을 실브라우저에서 잰다. measured 만
  더하면 「Figma 와 measured 는 서로 맞고 둘 다 코드와 틀린」 상태가 통과한다.
- **parity 계약** — `verify-figma-parity.mjs` 에 `CompositePopover` 항목.

### 이번에 드러난 것

- **Figma 의 `minWidth` 는 `null` 이다.** 240 은 고정폭 프레임으로 그려져 `width` 에 있다. 그래서
  채취 명세는 `minWidth` 를 담지 않고(빈 배열을 담으면 parity 가 「값이 없습니다」로 읽는다) 계약이
  Figma `width` 를 CSS 하한(`--louis-popover-preferred-inline-size`)과 대조한다. MenuPanel 은
  `minWidth` 가 160 으로 들어가 있어 그쪽을 본다 — 같은 표면인데 축이 갈리는 자리다.
- **채취 절차를 MenuPanel 로 대조했다.** 새 명세로 MenuPanel 을 다시 떠 기존 되읽기 블록과 맞춰
  보니 **값은 전부 같고** 빈 `parts: {}` 키의 유무만 달랐다. 되읽기 101개 기하 블록 중 10개가 그
  키를 생략하고 2개가 빈 객체로 갖고 있다 — emitter 머리말이 적어 둔 「되읽기가 한 절차로
  만들어지지 않았다」의 또 한 사례이며, parity 는 `parts ?? {}` 로 읽어 둘을 구분하지 않는다.

### Changed

- `menu-popover.md` 의 Availability `Figma` 행이 「패널 component는 남음」이라고 적고 있었다.
  `MenuPanel` 은 그 전부터 서 있었고 이제 `CompositePopover` 까지 계약이 붙었으므로 고쳤다.
  상태 판정 `partial` 은 그대로다 — 서브메뉴·체크 상태와 publish 가 남아 있다.

## 2026-08-30 (105) — 오버레이가 셸 램프를 상속해 구분선을 잃던 것을 고치고, composite-popover 표면을 세운다

**앱 셸 화면에서만 프로필 팝오버의 구분선이 사라지고 있었다.** 패널은 `document.body` 로 포털되고
앱 셸 라이트 램프(`html[data-theme=light] body:has(.gnb-wrapperSidebar)`)가 바로 그 `body` 에 얹힌다.
램프는 고정 팔레트 `--palette-gray-100…600` 을 재매핑하므로 팔레트를 읽는 구분선이 그것을 상속했다.
그런데 **패널 표면은 이미 램프 밖으로 나가 있었다** — LOUIS 채택으로 `color-bg-menu` 를 소비하는데
그 토큰은 생성 CSS 에서 리터럴이라 팔레트 별칭을 밟지 않는다. 표면만 옮기고 선은 두고 온
**반쪽 이관**이다. 빌드된 제품 CSS 를 Chromium 에 얹어 두 문맥을 실측했다.

| 라이트 문맥 | 면 | 선 | 차 |
| --- | --- | --- | ---: |
| 사이드바 있음 | `#f1f1f3` | `#eeeef1` | **3/255 — 사라진다** |
| 사이드바 없음 | `#f1f1f3` | `#e3e4e8` | 14/255 |

고친 방향은 [DS-D-0010](../governance/decisions/DS-D-0010-token-coverage.md) §3 이 이미 정해 두었다 —
`body:has(...)` 같은 런타임 조건으로 갈리는 값은 새 mode 를 만들지 않고 **소비 계층이 해결한다.**
제품 별칭 대신 LOUIS 프리미티브를 직접 부르게 했다. 다크는 램프가 라이트 전용이라 한 픽셀도 움직이지
않았고, 고친 뒤 라이트는 사이드바 유무와 무관하게 14/255 다(실측).

**`composite-popover` 표면이 Figma 에 섰다.** 이 작업을 막고 있던 것은 「라이트 표면이 두 값으로
갈리므로 한 값으로 그린 Figma 표면은 반드시 틀린다」는 문단이었는데, 그 판단은 패널이
`--dropdown-surface-bg` 를 소비하던 때의 것이고 그 변수는 제품에 더 이상 없다. 갈림은 표면이 아니라
구분선에 남아 있었고, 위에서 닫혔다. `CompositePopover` 는 MenuPanel 과 두 값이 갈린다 —
inset 8(MenuPanel 6) · 행 간격 8(MenuPanel 2). 이유는 hit-target 이며 근거는 컴포넌트 설명에 있다.

**[DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md) 의 헤어라인 10% 서술을 주석했다.**
[DS-D-0026](../governance/decisions/DS-D-0026-alpha-scale.md) 이 알파를 16단으로 축약하면서 10 단계가
사다리에서 빠졌고 `color-stroke-hairline` 은 `.08` 로 옮겨졌다. 오늘 발행되는 값은 8% 다 —
기록이 가리키던 primitive 는 존재하지 않는다. 참조할 값은 토큰이지 그 문단이 아니다.

## 2026-08-29 (104) — 적응형 램프를 테마 분기 안에서 다시 선언하지 않는다 (DS-D-0031)

의미 회색 램프는 테마에 따라 뒤집힌다 — `gray/000` 이 잉크(라이트 검정·다크 흰색),
`gray/900` 이 표면이다. 숫자가 고정 밝기처럼 **보이는** 탓에 「라이트에서는 어두운 잉크가
필요하니 900」이라는 오해가 제품 한 파일에 14군데 쌓였고, 전환 칩 아이콘과 전환 메뉴 안내문이
배경과 **완전히 같은 색**(대비 1.00)이 되어 라이트 모드에서 보이지 않았다 —
[DS-D-0031](../governance/decisions/DS-D-0031-no-theme-branch-on-adaptive-ramp.md).

### Unchanged

- **토큰·Figma 변수는 하나도 바뀌지 않는다.** `figma/readback.json` 확인 결과 `color/gray/000`
  의 Dark → `palette-gray/000`, Light → `static/black` 매핑이 이미 옳다. 극성은 정확히 들어가
  있었고 잘못은 그것을 읽는 제품 분기에만 있었다. 제품은 `c42b885a` 로 고쳤다.

### Pending

- `color/gray/000-alpha/*` 16단의 **다크 끝이 `gray/000` 과 어긋난다** — `gray/000` 은 250 인데
  사다리는 `static-white-alpha/*`(255)를 가리킨다. 이 사다리를 쓰면 이번 버그가 표현
  불가능해지지만(`gray/900-alpha/*` 가 없으므로), 이름이 값과 다른 상태로는 제품이 채택하지
  않는다. 되튜닝이 먼저다.

## 2026-08-29 (103) — 같은 역할을 두 이름으로 말하던 토큰 9개를 걷어낸다 (DS-D-0030)

`8de65bb` 가 제품 티어 값을 들여오면서 이미 시스템에 있던 역할 토큰과 겹치는 것을 걸러내지
못했다. 제품이 레거시 토큰 문서를 폐지하는 작업에서 **미러가 아니라 역할 토큰을 집으면서** 어느
쪽이 정본인지 실증됐다 — [DS-D-0030](../governance/decisions/DS-D-0030-no-duplicate-role-tokens.md).

### Removed

- **`app/*` 여섯**: `gnb-main-inline-padding`(→ `layout-app-shell-content-inset`) ·
  `gnb-sidebar-padding-x`(→ `layout-app-shell-sidebar-padding`) ·
  `tooltip-padding-block`(→ `space-control-xs`) · `tooltip-padding-inline`(→ `space-control-sm`) ·
  `tooltip-radius`(→ `radius-control-sm`) ·
  `tooltip-font-size`(→ `typography-caption-regular-font-size`).
  앞의 둘은 `migration/token-mapping.md` 확정 표와 DS-D-0018 이 이미 정본을 지목했고, 뒤의
  넷은 `.louis-tooltip` 레시피가 읽는 손잡이다.
- **`dropdown/*` 그룹 전체**: `radius`(→ `radius-overlay`) · `item-radius`(→ `radius-overlay-item`) ·
  `padding`(→ `space-overlay-inset`). `.louis-menu` 가 셋 다 정본을 읽는다. 빈 그룹을 남기지
  않으려고 노드째 지웠다. **`color/dropdown/*` 넷은 색이고 무관하다.**

### Current impact

값이 바뀌는 토큰이 없다 — 전부 alias 였고 정본이 같은 primitive 를 가리킨다. 렌더가 달라지는
화면은 없고, 제품은 이미 정본을 소비하므로 핀을 올려도 바뀌지 않는다.

소비처가 0 이던 나머지 33개는 **남겼다.** `type-line-height-percent/*` 는 DS-D-0029 가 Figma
PERCENT 축으로 의도해 만든 것이고, `button/*` 은 DS-D-0029 가 막 개명한 블록이며, `node/*` 는
LOUIS 에 캔버스 컴포넌트가 아직 없어 소비처가 생길 자리가 없다. 「지금 아무도 안 읽는다」는
「앞으로도 아닐 것이다」와 다르다.

## 2026-08-27 (102) — 이름이 값과 다른 토큰을 걷어낸다 (DS-D-0029)

감사가 이름과 값이 어긋난 토큰 네 무리를 찾았다. 넷 다 소비처 0 이라 오늘 깨지는 화면이 없고,
그래서 처음 집는 사람이 깨뜨린다 — [DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md).

### Changed

- **행간**: semantic 축 `type-line-height/*` → `type-line-height-percent/*`(9개). 값은 percent
  (150·135·120)이며 Figma 가 `lineHeightPercent` 로 보관하기 때문이다. CSS 는 이제
  `--louis-type-line-height-percent-body-14: 150` 을 발행한다. 참조 0 이던 비율 primitive 3종
  (`line-height/tight`·`heading`·`body`)은 삭제. 규약은 [Typography](../foundations/typography.md)
  「행간의 단위」가 소유한다. proposal 의 scope 도 `LINE_HEIGHT` 로 세웠다.
- **Button**: `button-height`→`height-lg` · `height-sm`→`height-md` · `min-width-sm`→`min-width-md`
  · `padding-inline`→`padding-inline-lg` · `padding-inline-sm`→`padding-inline-md`.
  [DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)이 alias 만 옮기고 이름을
  두어 접미사 없는 `button-height` 가 40 인데 기본값은 32 였다.
- **삭제 7개**: `footer-safe-bottom`(제품은 `env(safe-area-inset-bottom)` 이고 spacing primitive 로
  모델링하는 것을 규범이 금지한다) · 이름이 거짓인 알파 6개(`gray-800-alpha-48/72` ·
  `gray-900-alpha-08/12` · `gray-300-alpha-88` · `gray-500-alpha-88`).

### Current impact

- **resolved value 가 바뀐 토큰은 0 이다.** 렌더가 달라지는 화면이 없다.
- `check-token-diff` 는 removal 30 · additive 14 · description 3 으로 breaking 이며 baseline 을
  승인해 잠갔다(선례 `3bee005`).
- Figma 변수 24개를 같은 작업에서 옮겼다(이름 14 · 삭제 10 · scope 3). 라이브 516 → 506.
  `figma/readback.json` 재캡처와 `build-figma-snapshot` 을 같은 작업에서 돌렸고,
  라이브 506행과 되읽기를 행 지문으로 대조해 어긋남이 **기존 float 정밀도 2행뿐**임을 확인했다.
- 소비처가 없던 토큰만 건드렸으므로 **제품 저장소는 바뀌지 않는다.**

## 2026-08-25 (101) — 색 토큰을 SEED/Toss식 scale·semantic로 재구성한다 (DS-D-0024)

색 시스템이 과복잡했다 — primitive 14계열(알파 5계열 포함), semantic 81역할, light/dark 3중
메커니즘. SEED(scale→semantic, static-black/white-alpha)를 기준으로 단순화했다 —
[DS-D-0024](../governance/decisions/DS-D-0024-color-architecture.md).

### Changed (Phase 1 — LOUIS 토큰 기반)

- primitive `neutral` → `gray`. 알파 5계열 → 2(+danger): `ink-alpha`+`black-alpha` →
  `static-black-alpha`(순수 #000), `paper-alpha`+`inverse-alpha` → `static-white-alpha`(순수 #fff),
  `red-alpha` 유지. hue(`blue/red/green/amber`)와 노드 accent(`mint/yellow/violet/pink`) 유지.
- semantic 접두사: `background-`→`bg-` · `foreground-`→`fg-` · `border-`→`stroke-` · `action-`→`accent-` ·
  `scrim-`→`dim-`. `node-*`·`media-*`·`progress-*`는 네임스페이스 유지. 값·의미 보존.
- 컴포넌트 CSS·테스트·규범·measured 참조를 새 이름으로 일괄 갱신. DS-D-0023 헤어라인 토큰도
  `color-stroke-hairline` / `static-black-alpha.10`로 갱신.

### Current impact

- 오버레이/호버/헤어라인 색이 순수 흑/백 알파로 미세하게 바뀐다(#171b22/#fafafa 틴트 제거, 의도).
- LOUIS `pnpm check` + `pnpm test`(776) 통과. `verify`(figma-parity·product-parity)와 Figma 라이브
  컬렉션은 아직 이전 이름 — 후속 Phase에서 재정합.

### Migration (남은 Phase)

- **P2 (제품)**: `--louis-color-*` 소비처 183파일 rename + `globals.css`의 `palette-gray↔gray` 반전
  제거(LOUIS 세만틱 직접 소비) + 게이트 9종.
- **P3 (Figma)**: `Klipse Primitive`/`Semantic`/`Semantic Color` 3컬렉션 재구성 + parity 재정합
  (라이브 공유 파일, 수동 편집 + publish).

## 2026-08-24 (100) — 일반 0.5px stroke를 border에서 inset 헤어라인으로 통일한다 (DS-D-0023)

제품 저장소가 `5103ffeb`에서 제각각이던 0.5px stroke를 하나의 recipe로 통일했다 — CSS `border`나
바깥 spread shadow가 아니라 `inset 0 0 0 0.5px <헤어라인 색>` 한 겹이다. LOUIS source는 그때까지
컴포넌트마다 CSS `border`, 바깥 spread shadow, 서로 다른 border color를 써서 LOUIS를 직접 보는 다음
구현자가 낡은 방식을 다시 쓸 수 있었다. 그 임시 계약을 제품 `@layer louis.override`가 덮어 성립시키고
있었는데, 이제 LOUIS가 정본으로 소유한다 —
[DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md).

### Added

- primitive `color-static-black-alpha-10`(순수 black 10%). 제품 실측 헤어라인이 라이트에서 `rgba(0, 0, 0, 0.1)`
  이고 `ink-alpha.10`(#171b22)이 아니므로 순수 black 단계가 필요했다.
- semantic `color-stroke-hairline` — light `black-alpha.10` · dark `paper-alpha.10`.
- CSS foundation recipe `--louis-hairline-inset` / `-block-start` / `-block-end`
  (`packages/css/src/base.css`, `:root` 한 곳).

### Changed

- 컴포넌트 CSS 10종이 base border·바깥 ring을 지우고 inset 헤어라인을 쓴다 — Button·IconButton은
  secondary만, Checkbox 상자·TextField 박스·Dialog surface·Tooltip·ProjectCard·SegmentedControl 트랙·
  Menu 패널은 표면, AppTopBar divider·Menu separator는 방향성 inset.
- `shadow-menu-light/dark`가 바깥 0.5px 프레임 layer를 잃고 ambient drop shadow만 소유한다. 헤어라인은
  `.louis-popover`가 뒤에 조합한다 — ambient와 프레임 책임이 분리돼 두 겹 frame이 없다.
- Figma parity: SegmentedControl은 OUTSIDE stroke → INNER_SHADOW, Menu 패널의 둘째 그림자 layer는
  DROP_SHADOW → INNER_SHADOW. 나머지 bordered 표면은 시각이 같은 INSIDE stroke를 유지하고 borderWidth
  토큰은 0.5로 남는다.
- Tooltip 높이가 28 → 26. 0.5px border가 DPR 1에서 1px씩 올라 높이에 더해지던 것이 사라졌다.
- 인계서 (2b) 컨트롤 테두리 정본을 DS-D-0023이 닫았다 — Button/IconButton/TextField/Checkbox가 같은
  generic 10% 헤어라인을 쓴다.

### Current impact

- **Checkbox 대비가 더 낮아진다.** 선택하지 않은 상자가 라이트에서 black 10%(≈1.1)로, 이전 `strong`
  2.52보다 낮다. 이미 SC 1.4.11 미달이던 known deviation을 더 깊게 만드는 것이며 제품 배포 계약과
  일치시키기 위한 것이다 — checkbox.md Known deviations와 DS-D-0023에 기록했다.
- TextField invalid는 stroke 색 축을 잃고 메시지 + `aria-invalid` + `role="alert"`가 오류를 전달한다.
- ProjectCard 헤어라인이 inset이라 full-bleed 썸네일이 가장자리를 덮을 수 있다(제품 5103ffeb과 동일).
- forced-colors에서는 각 컴포넌트가 `border-width-default`(1px) 시스템 색 실선/outline으로 경계를
  되살린다.

### Migration

- 패키지 소비자는 새 LOUIS 커밋을 소비한 뒤 제품 로컬 `louis.override` 헤어라인 블록과 `--app-hairline-*`
  정본을 지우고 `--louis-hairline-inset`을 직접 쓴다. 컴포넌트 계산값이 같은지 확인한 뒤에만 제거한다.
  LOUIS 헤어라인 색은 `color(srgb 0 0 0 / 0.1)`로 직렬화되므로 제품 `check-rendering`의 `rgba(...)` 단언을
  그 표기로 갱신해야 한다.
- Figma는 재생성한 `figma/apply-variables.*.js` · `figma/apply-styles.js`를 "Klipse Design System —
  Library"에 적용하고 되읽어(`figma:fetch`) `figma/snapshot.json`을 갱신해야 parity가 초록이 된다.
  적용 전까지 `verify-figma-parity` · `check-figma-snapshot`은 새 변수 2개와 바뀐 effect를 반영하지 못한다.

## 2026-08-23 (99) — StaticHighlightDemo를 추정값이 아니라 고정 빌드에서 잰다

랜딩의 합성 장면은 클래스 문자열 하나만 정적 하네스에 올리면 재현되지 않는다. 이미지 intrinsic
ratio, 뷰포트 높이, 중첩 컴포넌트, 축소 캔버스가 함께 최종 지오메트리를 만든다. 그동안 §10.2는
소스 선언을 읽어 치수를 적으면서 같은 파일 끝에는 「그 px 값은 확인하지 않았다」는 주석도 남겨
두었다. 문서가 자신을 반박하고 있었다.

### 고정 빌드 렌더를 계약으로 만든다

- `figma/product-specimens.json`의 `liveOnly` 표본은 태그·부모자식·표본 텍스트만 선언한다.
- `scripts/measure-product-scenes.mjs`는 고정 커밋의 clean standalone build를 직접 띄운다. checkout
  HEAD, 두 빌드 영수증, BUILD_ID, 장면 구성 sourcemap이 모두 같은 커밋인지 먼저 확인한다.
- `migration/product.scenes.json`은 1920×1080·402×874 두 문맥, 선언 노드 32개, 계산 스타일 85축,
  자산 해시와 라이브 SVG geometry를 기록한다. 생성물이므로 손으로 고치지 않는다.
- `verify-product-scenes`는 `verify:product`에 배선됐다. 제품/빌드가 없거나 dirty·커밋 불일치·생성물
  drift면 exit 1이며, `SKIPPED`+exit 0은 허용하지 않는다.

게이트에는 세 회귀가 함께 들어갔다. 새 측정 단계를 `verify:product`에서 빼는 변조, 측정기가
소유하지 않는 `liveOnly` 표본을 추가하는 변조, 제품/빌드가 없는 직접 호출을 각각 실패시킨다.
별도 테스트 파일을 더 만들지 않은 이유는 이 세 canary가 실제 배선·소유권·실패 의미를 직접
검증하기 때문이다.

### 상태는 올리지 않는다

측정 입력이 생긴 것과 Figma 구현이 끝난 것은 다르다. StaticHighlightDemo 컴포넌트 조립과 되읽기
대조는 진행 중이므로 manifest의 Landing Shell은 `figma: not-ready`를 유지한다. 수치 근거와 제품
선언의 exact command·verbatim line·line number는 [§10.2](../../migration/product-screens/10.2.md)에
기록했다.

### Migration

패키지 소비자 변경은 없다. 측정 기록을 갱신할 때는 고정 커밋의 clean production build를 준비하고
`KLIPSE_PRODUCT_BUILD_ROOT=<path> pnpm run measure-product-scenes`를 실행한다. Figma 조립자는 생성물에
없는 수치·색·자산을 보충해 그리지 않는다.

## 2026-08-22 (98) — 측정 기준선이 **원격에 없는 커밋**이었다. 한 맥에만 있던 것 둘을 옮긴다

계정 이전을 앞두고 「저장소를 따라오지 않는 것」을 다시 셌다. (97)이 넷을 셌는데 **둘이
더 있었다.** 둘 다 이 맥이 사라지면 복구할 방법이 없는 것이다.

### ① 기준선 커밋이 원격 어디에도 없었다

`migration/product-evidence.lock.json` 이 고정한 `a3ed8e03` 을 제품 저장소에서 찾으니 이랬다.

```
$ cd ~/klipse-web && git branch -a --contains a3ed8e03
* design                                   # 로컬 브랜치 하나뿐. 원격 0개
$ git rev-list --left-right --count origin/design...design
0	1                                        # design = origin/design + 1커밋, 그 1커밋이 기준선이다
```

원저자가 2026-08-21에 만든 제품 커밋이고 푸시되지 않았다. 그 커밋이 바꾼 1파일
(`highlightSceneStyles.ts`)은 **근거 락 83건 안에 있다.**

다른 맥에서 제품을 clone 하면 `git show a3ed8e03:<path>` 가 전부 실패한다 — 근거 대조가
통째로 불가능해지고 `verify:product` 게이트가 죽는다. **그런데 hosted CI 도 `pnpm clean-room`
도 제품 저장소를 읽지 않으므로 이 결함에 대해서는 영원히 초록이다.** 사람이 눈치챌 자리가
없다.

### ② 기준선을 박는 자리에서 막는다

`scripts/build-product-evidence.mjs` 가 `git rev-parse` 직후 도달성을 본다. 원격 어느
브랜치에도 없는 커밋이면 락을 쓰지 않고 exit 1 한다.

```
$ node scripts/build-product-evidence.mjs
[product-evidence] 원격에 없는 커밋을 기준선으로 박을 수 없습니다: a3ed8e03 (design)
[product-evidence] 먼저 push 하거나, KLIPSE_PRODUCT_REF=origin/<branch> 로 원격 커밋을 기준선으로 쓰세요.
```

**게이트가 아니라 생성기에 넣었다.** 락은 사람이 의도적으로 옮기는 것이고, 옮기는 순간이
유일하게 이 조건을 아는 자리다. 게이트로 만들면 이미 박힌 뒤에 알린다.

### ③ 재기준선했고, 영향이 정확히 한 커밋으로 추적된다

`KLIPSE_PRODUCT_REF=origin/design` 으로 기준선을 `a89fc0d5` 로 내렸다. 제품을 읽는 생성물
여덟을 다시 돌렸고 바뀐 값은 **넷뿐**이며 전부 그 커밋의 diff 로 설명된다.

| 파일 | 바뀐 것 | 왜 |
| --- | --- | --- |
| `product.drift.json` | spacing 8 `194→196` · 12 `103→102` · 2 `74→73` | 그 커밋이 `uploadCardCompact` 의 `gap:8px`→`column-gap:12px`+`row-gap:2px`, `padding:0_12px`→`0_16px` 로 바꿨다 |
| `product.variants.json` | `viewToggleButton` 좌표 `2473→2460` | 같은 파일에 13줄이 더해져 있었다 |
| 나머지 여섯 | 커밋 스탬프 두 줄 | 값은 한 바이트도 안 바뀌었다 |

`product.alpha.json` 은 스톱 73단·토큰 알파 3318회·리터럴 281회가 **그대로**였다. 스탬프만
어긋나 게이트가 빨갰다 — 값이 아니라 「무엇을 기준으로 잰 값인가」를 세는 게이트다.

덤으로 `migration/product-screens/10.11.md:190` 의 글리프 서술(`컴팩트 안 28×28`)이 다시
맞는 값이 됐다. 그 산문은 `a89fc0d5` 기준으로 쓰였고 기준선만 앞서 나가 있었다.

### ④ 락이 **이미 낡아 있었다** — 근거 83건 중 하나는 아무도 인용하지 않는다

재기준선하니 근거가 83 → 82로 줄었다. 커밋 때문인 줄 알고 확인하니 아니었다.

```
a3ed8e03 인용: 82   a89fc0d5 인용: 82
a3ed8e03 에만: []   a89fc0d5 에만: []
```

인용 집합은 두 커밋에서 **완전히 같다.** 락이 마지막으로 재생성된 것은 `75018bf` 이고 그
뒤로 문서 커밋이 10개 들어왔다 — 그 사이에 `mypage/upgrade/checkout/page.tsx` 를 인용하던
산문이 바뀌었고 락만 그대로였다.

**락이 인용 집합과 어긋나도 잡는 게이트가 없다.** `verify-product-evidence` 는 기록된 blob 이
배포본과 같은지만 본다 — 아무도 인용하지 않는 항목이 남아 있어도, 새로 인용된 파일이 빠져
있어도 통과한다. 후자가 더 위험하다(지키지 않는 근거가 지켜지는 것처럼 보인다). **다음 작업이다.**

### ⑤ (A2) 반증 285축이 세션 캐시에만 있었다

08-19 인계서가 「에이전트 106명 중 98명이 결과를 냈고 저널에 남아 있다」고 적은 그것이다.
실제 위치는 `~/.claude/projects/…/wf_af8ccc6c-5d1/journal.jsonl`(34MB) — **git 저장소 밖
홈 디렉터리이고, 그것도 다른 세션 디렉터리다.** 저장소에는 사본이 0건이었다.

285축(확인 246 · 기각 39)을 `migration/product-has-refutation.json` 으로 옮겼다. 그리고
2026-08-20부터 배선되지 않은 채 있던 `scripts/verify-refutation-quotes.mjs` 를
`verify:product` 에 넣었다. **받을 그릇은 있었고 데이터는 저장소 밖에 있었으며 둘이 만난 적이
없었다.**

기계가 인용을 다시 열자 이렇게 갈렸다.

| 판정 | 수 | 조치 |
| --- | ---: | --- |
| 인용이 그 줄에 그대로 | 70 | 그대로 |
| 인용은 실재하나 좌표가 낡음 | 161 | 기계가 찾은 줄로 좌표만 정정. **인용문은 손대지 않았다** |
| 인용을 파일 어디에서도 못 찾음 | **15** | **기각으로 되돌렸다.** 사유를 축마다 기록 |

확인 246 → **231**이 됐다. 15건은 `dialog`·`project-card`·`segmented-control` 의 테두리와
`icon-button`·`slider` 의 `VideoEditModal` 인용인데, 인용문이 기준선에 존재하지 않는다.
**인용을 못 찾은 확인은 약한 확인이 아니라 기각이다**(`AGENTS.md`). 이 15축은 (A3)에서
브라우저가 다시 판정할 대상으로 남는다.

> 이 파일에는 생성 스크립트가 없다. 입력이 사라지는 세션 캐시라 재생성이 불가능한
> **일회성 구조**이며, 그 사실을 파일 안에 적어 두었다. 그래서 더더욱 게이트가 필요하다 —
> 되돌릴 수 없는 데이터일수록 기계가 지켜야 한다.

### Current impact

- 게이트가 **26 → 27**개다(CI 13 · 로컬 14). `verify-refutation-quotes` 가 늘었다.
- 기준선은 `origin/design` `a89fc0d5` 다. `productRef` 가 로컬 브랜치 이름이 아니라 **원격
  ref** 라 다른 맥에서 그대로 해결된다.
- `pnpm verify` 는 여전히 제품 저장소를 요구한다. 없으면 첫 게이트에서 exit 1 이다.

### Migration

- 기준선을 옮길 때는 `KLIPSE_PRODUCT_REF=origin/<branch>` 를 쓴다. 로컬 브랜치를 주면 이제
  거부당한다.
- `scripts/build-product-evidence.mjs` 에는 `--check` 가 없다. 시험 실행이 곧 덮어쓰기이므로
  되돌릴 준비를 하고 돌린다.
- 제품 워킹트리의 미커밋 변경은 측정에 들어오지 않는다(측정은 `git show <commit>:<path>` 로
  읽는다). 다만 **커밋되는 순간 근거 대조가 빨개진다** — 아래 열린 항목 참조.

### ⑥ 그리고 푸시가 기준선을 다시 움직였다 (같은 날 이어서)

위 재기준선 뒤에 owner 가 `design` 을 푸시했다. 그러자 **`origin/design` 이 `a89fc0d5` 에서
`a3ed8e03` 로 옮겨갔고**, 락이 고정한 blob 은 `a89fc0d5` 기준이라 게이트가 즉시 빨개졌다.

```
[product-evidence] 근거 파일이 배포본에서 바뀌었습니다: …/highlightSceneStyles.ts
                   (고정 e2c7934c ≠ 현재 cfb59320)
```

**게이트가 틀린 것이 아니라 제 일을 한 것이다.** `verify-product-evidence` 는 락의
`productRef`(움직이는 ref)를 읽어 「제품이 기준선을 앞질렀다」를 알린다 — `productCommit`
(고정 커밋)을 읽는 측정 스크립트와 역할이 나뉘어 있고, 그 분리를 세운 것이
[`scripts/lib/product-ref.mjs`](../../scripts/lib/product-ref.mjs) 다.

기준선을 `a3ed8e03` 으로 올리고 여덟을 다시 돌렸다. 이제 도달성 가드도 통과한다 — 그 커밋이
원격에 있기 때문이다. **애초에 아래로 내린 이유가 「원격에 없다」였고, 푸시가 그 이유를
없앴다.** 락은 `origin/design` `a3ed8e03` · 근거 **82**건이다(④의 낡은 항목 하나는 계속 빠진 채다).

배운 것 하나. **움직이는 ref 를 가리키는 락은 푸시하는 순간 낡는다.** 재기준선과 푸시를 같은
세션에서 할 때는 **푸시를 먼저 하고 기준선을 잡아야** 한 번으로 끝난다. 이번에는 순서가 반대여서
두 번 쟀다.

> 남은 낡음: `migration/product-screens/10.11.md` 가 컴팩트 업로드 카드를 `a89fc0d5` 시점으로
> 서술한다(글리프 `28×28`, 레이아웃 `flex`, `gap:8px`). `a3ed8e03` 에서 그것은 `40×40` · `grid` ·
> `column-gap:12px`/`row-gap:2px` 다. 이 절 전체를 재실측해야 하며 그 파일만의 문제가 아니다 —
> 별도 작업이다.

## 2026-08-22 (97) — 인계서가 틀렸다. **「조용한 초록」이라고 썼는데 실제로는 빨간 크래시였다**

계정 이전 인계서를 쓰고, 그 안의 사실 주장을 실제로 실행해 검증했다. **넷이 틀렸다.**

### ① 「제품 저장소가 없으면 조용히 초록」은 거짓이다

인계서·스킬·실행 인계서에 이렇게 썼다.

> 제품 저장소가 없으면 게이트 13개가 `SKIPPED` 를 찍고 **exit 0** 한다. 실패가 아니라 조용한
> 통과라서, 검증하지 않은 것을 검증했다고 착각한다.

돌려 보니 아니다.

```
$ KLIPSE_PRODUCT_REPO=/private/tmp/no-such-repo-zzz pnpm verify
exit=1 · SKIPPED 0줄
```

제품을 읽는 게이트 13개 중 **6개는 `fatal: cannot change to …` 로 죽고**(verify-gates ·
verify-citations · verify-product-alpha · verify-alpha-consolidation · verify-product-drift ·
verify-app-nav-labels), 7개만 `SKIPPED`+exit 0 이다. 그런데 죽는 6개가 `verify:product` 의
**앞쪽**에 있어서, 전체를 돌리면 첫 게이트에서 멈추고 SKIP 은 한 줄도 안 나온다.

**(95)에서 「조용한 exit 0 은 빨간 것보다 나쁘다」를 쓰면서, 그 서술을 확인하지 않고 다른
문서로 복사해 옮긴 것이 원인이다.** 7개에 대해 참인 문장을 13개에 대해 참인 것처럼 옮겼다.

피해가 큰 자리는 스킬이다. 새 작업자가 「조용한 초록」을 경계하다가 실제로는 빨간 크래시를
만나면, 스킬이 틀렸다고 판단하고 그 절 전체를 안 믿게 된다.

### ② 연속 실패는 9회가 아니라 **46회**다

`gh run list --limit 200` 으로 다시 셌다. 마지막 초록은 2026-08-18T03:56 이고, 그 뒤
08-18T04:12 부터 08-22T06:55 까지 **46회 연속** 실패다. (93)~(96)에 적은 8·9 는 최근 목록
몇 개만 보고 센 값이다. 스크립트 주석·워크플로 주석·인계서를 46 으로 고쳤다. Updates 의 과거
항목은 그 시점의 기록이므로 고치지 않고, 인계서에 「그 수는 틀렸다」를 명시했다.

### ③ 처음 30분에 브라우저 바이너리 설치가 빠졌다

```
$ PLAYWRIGHT_BROWSERS_PATH=<빈 경로> pnpm run verify-test-harness
exit=1 · Executable doesn't exist at …/chrome-headless-shell
```

브라우저 바이너리는 lockfile에 없다. 워크플로는 이미 별도 단계로 받고 있었고(`ci.yml:34-39`,
2026-08-18의 첫 hosted CI 실패가 정확히 이것이었다) 그 교훈이 인계서로 옮겨오지 않았다.
`pnpm exec playwright install --with-deps chromium` 을 인계서와 스킬에 넣었다.

### ④ README 의 「의존성 설치 없이도 실행된다」가 낡았다

P3부터 devDependencies가 생겼다. 새 clone에서 `pnpm install` 없이 `pnpm build` 를 돌리면
`tsc: command not found` 로 죽는다. 시작하기 블록을 실제로 도는 순서로 고쳤다.

### 이 검증이 말해 주는 것

문서에 쓴 값은 **문서를 다시 읽어서는 확인되지 않는다.** 넷 다 문장으로는 그럴듯했고, 넷 다
명령 한 줄로 반증됐다. 인계서처럼 「다음 사람이 그대로 따를」 문서일수록 문장이 아니라
실행으로 검증해야 한다.

### Migration

`pnpm verify` 가 exit 1 이면 제품 저장소부터 의심한다. `SKIPPED` 를 눈으로 보려면 개별
게이트(`verify-product-render` 등 7개)를 직접 돌려야 한다 — `verify:product` 전체는 첫
게이트에서 죽어 거기까지 가지 않는다.

## 2026-08-22 (96) — 주석을 고치다 `- name:` 을 지웠다. **작업이 하나도 돌지 않았다**

(95)를 푸시했더니 CI가 `failure` 인데 실패 로그가 없었다.

```
$ gh api repos/KlipseAI/louis/actions/runs/32560848011/jobs
{"total_count":0,"jobs":[]}
```

작업이 **0개**다. 워크플로 단계 주석을 13/13으로 고치면서 `- name:` 줄을 같이 지웠고,
`run:` 만 남아 목록 항목이 아니게 됐다. GitHub은 워크플로를 통째로 거부한다.

```yaml
      # scripts/verify-gate-split.mjs 가 지킨다.
        run: pnpm verify:ci          # ← `- name:` 이 없다
```

**빨간 것보다 나쁘다.** 빨간 실행에는 로그가 있어 무엇이 틀렸는지 보인다. 거부된
워크플로에는 그것조차 없고, 목록에는 그냥 `failure` 로 찍힌다 — 게이트가 실패한 것과
구별되지 않는다.

### 게이트는 통과했다

`verify-gate-split` 은 그때 초록이었다. 워크플로에 대해 보던 것이 이것뿐이었기 때문이다.

```js
if (!workflow.includes("pnpm verify:ci")) { … }   // 글자가 있는가
```

파싱되는가는 안 봤다. (95)에서 「조용한 exit 0 은 빨간 것보다 나쁘다」를 적어 놓고,
같은 푸시에서 그보다 더 조용한 실패를 만들었다.

### 조치

전체 YAML 파서를 들이지 않고 이 사고를 잡는 최소 구조 검사를 넣었다 — 단계 하나에는
`run:` 이나 `uses:` 가 하나씩이므로, 고아가 생기면 개수가 어긋난다.

```
단계 9개인데 `run:`/`uses:` 는 10개입니다. `- name:` 없이 남은 `run:` 이 있으면
GitHub 은 워크플로를 통째로 거부하고 **작업이 하나도 돌지 않습니다**(실패 로그도 없습니다).
```

카나리아도 붙였다(27번째): `- name: Enable pnpm` 을 지워 놓고 잡는지 본다. 제품을 타지
않으므로 CI에서도 돈다.

### Migration

없다. 워크플로 파일을 손으로 고칠 때 `pnpm verify` 가 구조까지 본다는 것만 알면 된다.

## 2026-08-22 (95) — 초록이던 CI는 게이트 20개가 아니라 **13개**를 돌고 있었다

(94)에서 CI를 초록으로 만들고 「11단계 전량 통과」라고 적었다. 그 다음 러너와 노트북의
나머지 차이 축을 훑다가, 내가 (93)에서 내린 판정이 **반대로 틀렸다**는 것이 나왔다.

### 오탐이라고 지운 7건이 오탐이 아니었다

(93)에서 정적 표지 검사(`klipse-web`·`KLIPSE_PRODUCT_REPO`)가 오탐 7건을 낸다고 보고
그 검사를 지웠다. 근거는 「돌려 보니 통과하더라」였다. **종료코드만 봤다.**

그 7개는 이렇게 생겼다.

```js
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
if (!existsSync(resolve(productRoot, ".git"))) {
  console.log("[tailwind-interop] SKIPPED (제품 저장소 없음: " + productRoot + ").");
  process.exit(0);          // ← 여기
}
```

제품 저장소가 없으면 **스스로를 끄고 exit 0** 한다. 종료코드로 판정하는 실측은 이것을
「자립한다」로 셀 수밖에 없다. 원리상 못 잡는다.

러너 로그가 확정한다. 초록이던 실행(32558504349)에 이 일곱 줄이 그대로 찍혀 있다.

```
[product-evidence] SKIPPED (제품 저장소 없음: /Users/sejunki/klipse-web). 근거 파일 83개…
[product-render] SKIPPED (/Users/sejunki/klipse-web). 렌더 실측은 로컬에서 확인해야…
[product-components] SKIPPED (/Users/sejunki/klipse-web).
[product-variants] SKIPPED (/Users/sejunki/klipse-web). 인벤토리는 로컬에서 만든다.
[specimen-context] SKIPPED (제품 저장소 없음: /Users/sejunki/klipse-web).
[figma-inventory] SKIPPED (제품 저장소 없음: /Users/sejunki/klipse-web).
[tailwind-interop] SKIPPED (제품 저장소 없음: /Users/sejunki/klipse-web). 불러오기 순서…
```

**초록 CI는 게이트 20개가 아니라 13개를 돌고 있었다.** 근거 lock 83개 blob 해시 대조,
플랜 배지 문맥 검사, Figma 인벤토리 드리프트, Tailwind reset 상호운용 — 전부 러너에서
0회 실행이다.

### 정적 표지가 동작과 정확히 일치했다

전수 대조했다. 표지를 가진 7개 = 러너에서 `SKIPPED` 를 찍던 7개. 표지가 없는 13개 =
실제로 검증을 수행하던 13개. **오탐 0 · 미탐 0.** 내 grep은 처음부터 맞았고, 그것을
뒤집은 「실측」이 틀렸다.

| | (93)의 판정 | 실제 |
| --- | --- | --- |
| 정적 표지 grep | 오탐 7건이라 폐기 | **정확** — 표지 = 자기비활성 |
| 종료코드 실측 | 「18 자립」 | 자기비활성 7개를 자립으로 오집계 |

### 조용한 exit 0 은 빨간 것보다 나쁘다

빨간 게이트는 누군가 본다. `SKIPPED` 후 exit 0 은 초록에 섞여서 **아무도 안 본다.**
(93)에서 `verify-gates --no-product`의 건너뛴 카나리아를 이름으로 찍게 만든 이유가
정확히 이것인데, 같은 저장소의 다른 게이트 7개가 이미 그러고 있는 것을 확인하지 않았다.

### 조치

- **7개를 `verify:product`로 옮겼다.** `verify:ci` 13단계는 이제 전부 실제로 검증을
  수행한다. `verify:product` 는 6 → 13단계.
- **정적 표지 검사를 복원했다.** 동작과 일치함을 확인했으므로 이번엔 근거가 있다.
  자기 자신은 검사 대상에서 뺀다(표지 문자열을 검사어로 들고 있다).
- **`--empirical` 이 SKIP 출력을 실패로 센다.** 종료코드만 보던 판정을 고쳤다.
- **카나리아를 하나 더 붙였다**(26번째). `verify:ci` 소속 스크립트에 제품 경로 표지를
  심어 놓고 배분 게이트가 잡는지 본다. 이 카나리아는 제품을 타지 않으므로 CI에서도 돈다.
- 워크플로 주석 · `README.md` · `design/README.md` · `CLAUDE.md` · `AGENTS.md` 의
  숫자를 전부 13/13으로 고쳤다.

### Migration

`pnpm verify:ci` 가 20 → 13단계로 줄었다. **줄어든 것이 아니라, 원래 안 돌던 7개가
안 돈다고 이제 말할 뿐이다.** 검증 범위는 그대로다. 로컬 `pnpm verify` 26단계도 그대로다.

## 2026-08-22 (94) — 첫 결손을 고치니 두 번째가 나왔다. **짐작을 그만두고 러너를 재현했다**

(93)에서 제품 저장소를 갈라내고 푸시했더니 CI가 **9회째** 빨갰다. 이번엔 다른 곳이다.

```
Error: esbuild 없음
    at scripts/verify-consumer.mjs:149:11
```

원인은 이 주석이었다.

```js
// esbuild는 vitest가 이미 가져온 의존성이다. 새로 넣지 않고 워크스페이스의 bin을 쓴다.
```

**pnpm은 전이 의존성의 bin을 루트 `.bin`으로 호이스트하지 않는다.** 내 노트북에서 통과한
이유는 8/18 설치 때 남은 **낡은 심볼릭 링크** 때문이었다 — `node_modules/.bin/esbuild`는
있는데 `node_modules/esbuild` 패키지는 애초에 없었다. 의존성 한 줄을 아끼는 대신 재현성을
잃은 거래였고, clean checkout에서만 드러났다. esbuild를 명시적 devDependency로 넣었다
(0.28.2 — vite가 이미 해석하던 그 버전이라 버전은 하나 그대로다).

### 이게 (93)의 결함을 드러냈다

(93)에서 나는 「실측했다」고 적었다. **실측한 것은 축 하나뿐이었다** — `KLIPSE_PRODUCT_REPO`만
없는 척했지, 낡은 `node_modules`도 그대로였고 커밋 안 된 파일도 그대로였다. 환경 차이는 축이
여럿인데 한 축만 끄고 「자립을 증명했다」고 쓴 것이다.

그 방식의 대가는 명확하다. **결손을 하나 막을 때마다 러너를 한 바퀴 돌려야 다음 결손이
드러난다.** 이미 두 번 그랬다.

### `pnpm clean-room`

`scripts/verify-clean-room.mjs`를 넣었다. 짐작 대신 환경을 재현한다.

| 러너의 조건 | 재현 방법 |
| --- | --- |
| 추적된 파일만 있다 | 커밋된 HEAD만 `git clone` |
| `node_modules`가 없다 | `pnpm install --frozen-lockfile`로 새로 설치 |
| 제품 저장소가 없다 | `KLIPSE_PRODUCT_REPO`를 없는 경로로 못 박는다 (기본값이 이 노트북에는 실재한다) |
| 단계 순서 | `.github/workflows/ci.yml` 그대로 |

`--with-test`를 주면 브라우저 바이너리 설치와 실브라우저 회귀까지 포함해 **워크플로 7단계
전량**을 돈다.

**이것도 완전하지 않다.** 여기는 darwin/arm64, 러너는 ubuntu/x64다. 대소문자 구분
파일시스템 · GNU/BSD 도구 차이 · UTC/KST는 여전히 안 잡힌다. 그건 러너만이 증명한다.
스크립트 헤더에 이 한계를 적었고, `verify-gate-split --empirical`의 주석에도 「이 모드는
약하다, 푸시 전엔 clean-room을 써라」를 박았다.

### 결과

`pnpm clean-room --with-test` 7단계 통과 → 푸시 → **CI 11단계 전량 초록.** 8/19 이후 첫 초록이다.
러너 로그에 건너뛴 카나리아 3개가 이름으로 찍히는 것도 확인했다.

```
[verify] --no-product: 제품 저장소가 필요한 카나리아 3개를 건너뜁니다. …
[verify] passed: 4 positive checks, 22 failure canaries (+ 건너뛴 3개는 위에 열거), …
```

### Migration

푸시 전 절차가 하나 늘었다: `pnpm clean-room`. 로컬 `pnpm verify`가 초록이어도 그것은
「이 노트북에서 통과한다」는 뜻이지 「러너에서 통과한다」는 뜻이 아니다.

## 2026-08-22 (93) — hosted CI가 8회 연속 빨갰다. 원인은 게이트가 아니라 **게이트가 도는 곳**이었다

2026-08-19 푸시부터 GitHub Actions가 **여덟 번 연속 실패**했다. 실패 단계는 늘 같았다.

```
Error: Command failed: git -C /Users/sejunki/klipse-web ls-tree -r --name-only a3ed8e03…
    at git (scripts/verify-citations.mjs:27:3)
```

러너에는 제품 저장소가 없다. 내 노트북에는 있다. **로컬 초록과 CI 초록이 서로 다른 것을
증명하고 있었는데**, 여덟 번을 지나도록 아무도 그 차이를 보지 않았다. 이게 진짜 결함이다 —
게이트를 가진 이유는 사람이 안 보는 것을 기계가 보게 하려는 것인데, 기계가 보내는 신호를
사람이 다시 안 봤다.

### 자립 여부는 grep으로 못 가린다

먼저 `klipse-web`·`KLIPSE_PRODUCT_REPO`·`product-ref` 문자열로 24개 게이트를 갈랐다. 11 자립 /
13 제품필요가 나왔다. **틀렸다.** 각 게이트를 `KLIPSE_PRODUCT_REPO=/nonexistent-product-repo`로
실제로 돌려 보니 **18 자립 / 6 제품필요**다. 양방향으로 다 틀렸다.

| 정적 판정 | 실제 | 왜 |
| --- | --- | --- |
| `verify-tailwind-interop` 등 7개 = 제품필요 | **자립** | `--check` 경로는 커밋된 측정 JSON만 읽는다. 제품 경로를 상수로 선언만 하고 안 연다 |
| `verify-gates` = 자립 | **제품필요** | 표지 문자열이 하나도 없다. 카나리아가 `verify-citations.mjs`를 자식 프로세스로 부른다 |

**교훈: 자립성은 선언이 아니라 관측 대상이다.** 돌려 보지 않고 판정한 것이 이 사고의 2차 원인이다.

### 배분

`pnpm verify`를 `verify:ci`(20단계)와 `verify:product`(6단계)로 갈랐다. `verify`는 이제 정확히
둘의 합이다.

- **CI에서 도는 20단계** — 제품 저장소 없이 전부 통과함을 실측했다.
- **여기서만 도는 6단계** — `verify-gates`, `verify-citations`, `verify-product-alpha`,
  `verify-alpha-consolidation`, `verify-product-drift`, `verify-app-nav-labels`.

`verify-gates`는 통째로 빼지 않았다. 카나리아 25개 중 제품을 타는 건 인용 좌표 3개뿐이라,
`--no-product` 플래그가 **그 셋만** 건너뛰고 나머지 22개는 CI에서도 돈다. 그래서 로컬
`pnpm verify`에서는 `verify-gates`가 두 번 돈다(CI 경로 한 번, 전량 한 번) — 알고 한 선택이다.
건너뛰기 로직 자체가 회귀할 수 있는 자리라 두 경로를 다 밟는다.

**건너뛴 것은 이름으로 찍는다.** 요약이 24 → 21로 조용히 줄면 그건 「전량 통과」로 읽히고,
그 오독이 게이트를 무력화한다. 그래서 이렇게 나온다.

```
[verify] --no-product: 제품 저장소가 필요한 카나리아 3개를 건너뜁니다.
[verify]   - citation line out of range (scripts/verify-citations.mjs)
[verify]   - citation alias target missing (scripts/verify-citations.mjs)
[verify]   - cited file not locked (scripts/verify-citations.mjs)
[verify] passed: 4 positive checks, 22 failure canaries (+ 건너뛴 3개는 위에 열거), …
```

### 배분 자체를 지키는 게이트

`scripts/verify-gate-split.mjs`가 `verify:ci` 1단계로 붙었다. 지키는 것은 넷이다.

1. `verify`는 정확히 `verify:ci && verify:product`다 — 여기에 단계를 직접 붙이면 분류를 우회한다.
2. 두 갈래는 겹치지 않는다.
3. CI 워크플로가 `pnpm verify`가 아니라 `pnpm verify:ci`를 돈다 — 갈라 놓고 옛 이름을 계속
   부르면 아무것도 달라지지 않는다.
4. 제품이 필요한 6개가 `verify:product`에서 빠지지 않았다 — CI에서 안 도는 것이 여기서도
   빠지면 **아무 데서도 안 돈다**.

**정적 표지 검사는 넣지 않았다.** 위에서 그게 양방향으로 틀린다는 걸 확인했기 때문이다.
판정이 필요하면 `--empirical`로 실제로 돌린다. 상시 증명은 hosted CI 자신이다 — 러너에
제품 저장소가 없으므로, 자립하지 않는 단계가 `verify:ci`에 들어오면 그 푸시가 빨갛게 된다.

배분 게이트 자신에게도 카나리아를 붙였다(25번째). 워크플로를 다시 `pnpm verify`로 되돌려
놓고 게이트가 잡는지 본다 — 2026-08-19의 사고가 정확히 그 상태였다. 이 카나리아는 제품을
타지 않으므로 CI에서도 돈다.

### CI 초록은 전량 통과가 아니다

근거 좌표가 제품 코드와 맞는지는 **CI에서 증명되지 않는다.** 워크플로 주석, `README.md`,
`design/README.md`, `CLAUDE.md`에 이 한계를 박았다. 푸시 전 로컬 `pnpm verify`가 여전히 필요하다.

`CLAUDE.md`의 「원격 저장소나 hosted CI가 아직 없다」는 줄도 고쳤다 — 2026-08-18부터 있었다.
그 줄이 낡은 채로 남아 있어서 CI가 있다는 사실 자체를 잘못 판단한 적이 있다.

### Migration

`pnpm verify`는 그대로 전량이다. CI 환경이나 제품 저장소가 없는 곳에서는 `pnpm verify:ci`를
쓴다. 게이트를 새로 추가할 때는 `verify:ci`나 `verify:product` 중 한쪽에 넣는다 —
`verify`에 직접 붙이면 1번 규칙에 걸린다.

## 2026-08-21 (92) — §10.1을 Figma에 실제로 조립했다. 문서만으로 안 되는 곳이 넷 나왔다

오늘 만든 문서·정오표가 정말 화면을 그리게 해 주는지 **실전으로 검증했다.** 대상은 §10.1
홈/아카이브(`/archive`) 다크 데스크톱 1440×900 — 새 Figma 파일에 셸·사이드바·상단 바·배너·목록
헤더·카드 4장을 전부 조립했다.

**대부분은 문서만으로 그려졌다.** 면 관계(바닥 #171b22 / 카드 #313640 / 우물 #171b22), 셸 기하
(사이드바 280 · safe-top 12 · 카드 패딩 0 16), 세로 리듬(배너 360 → 40 → 헤더 → 8 → 그리드),
카드 5겹 프레임, 업그레이드 알약이 민트가 아니라 반전 솔리드라는 것 — 전부 문서가 맞았다.

### 조립자가 제품 코드를 열어야 했던 넷

| # | 결손 | 조치 |
| --- | --- | --- |
| ① | **상단 바를 40으로 그리면 12px 어긋난다.** 토큰 40은 DS 계약이고, 제품 in-panel 바는 패딩 8 + 프로필 링 36 = **실효 52**다. 나도 처음에 48로 잘못 그렸다(가장 큰 자식이 토글 32가 아니라 링 36이라는 걸 놓쳤다) | Specification에 각주 — 「제품 화면은 52, 새 DS 컴포넌트는 40」 |
| ② | **아이콘–라벨 간격 10px**이 규범에 없다 | Specification에 행 추가 |
| ③ | **브랜드 행 → 목록 시작 32px**(`rail-below-chrome-gap`)이 규범에 없다 | 행 추가 |
| ④ | **활성 인디케이터의 면색·반경**(라이트 시프트 후 `#e4e5e9` · 다크 `#313640` · 10px)이 규범에 없다 — States가 구조만 말한다 | 행 추가 |

**넷 다 `migration/`에는 있었다.** (85)에서 확인한 그 패턴 그대로다 — 관측은 있는데 규범이 없어서
조립자가 제품 코드를 열게 된다.

### Figma로 안 되는 것 (예상대로)

- 카드 오버레이의 **마스크된 backdrop blur** — 레이어 이름에 「재현 불가」로 남겼다.
- 배너 히어로 이미지·아이콘·로고 — 제품 자산이라 **플레이스홀더로 명시**했다
  (`placeholder: /images/hero/hero-main-bg.webp @68% center` 식으로 원본 경로를 이름에 박았다).

### 이 검증이 말해 주는 것

문서의 값은 맞다 — 오늘 재검·정정한 것들이 실제로 화면을 만들었다. 남은 결손은 「값이
틀렸다」가 아니라 **「규범 층에 아직 안 올라온 값」**이고, 그것은 조립을 해 봐야 드러난다.
**다음 화면을 조립할 때마다 같은 방식으로 되먹인다.**

### Migration

없다. 조립 검증과 규범 보강 4건이다.

## 2026-08-21 (91) — `migration/`에만 있던 관측을 승격했다. **오류·404 화면이 처음으로 문서를 갖는다**

(85)의 판정에서 「이미 LOUIS에 있음」으로 뒤집힌 25건 중 **셋은 `migration/`에만** 있었다.
`migration/`은 제품 관측이고 규범이 아니므로, Figma 세션이 `design/`만 읽으면 없는 것과 같다.
셋을 확인해 둘을 승격하고 하나는 승격하지 않았다.

### 승격하지 않은 하나

`transform-origin: top right` · `scale(0.92)`는 **의도적 편차**다. LOUIS는 anchor에서 원점을
계산하고, 제품의 하드코딩은 「배치가 flip돼도 원점이 안 따라간다」로 **결함으로 기록**돼 있다.
승격하면 결정을 뒤집는 일이다.

### [Route Boundary](../patterns/route-boundary.md) — 셋 중 하나는 디자인 시스템을 쓸 수 없다

**`design/` 전체에 `404`·`not-found`·「라우트 경계」가 0건이었다.** 모든 제품이 갖는 화면인데
규범이 없었다.

| 화면 | 디자인 시스템 |
| --- | --- |
| 404 | **쓴다** |
| 오류 | **쓴다** — 404와 같은 뼈대를 **복제**한다 |
| 최후 경계 | **못 쓴다** |

**최후 경계는 루트 레이아웃이 실패한 뒤에 뜬다.** 전역 CSS도 i18n도 로드되지 않았으므로 토큰을
참조할 수 없고, 실제로 인라인 스타일에 `#0a0a0a`·`#ededed`를 박고 **한국어로 고정**돼 있다.

**이 값들을 토큰으로 「고치면」 그 화면이 막으려던 실패에 함께 휩쓸린다.**
**디자인 시스템이 닿지 않는 자리가 있다는 사실 자체가 계약이다.**

다만 해결값은 어긋나 있다 — 폭 `420px` 대 `440px`, 제목 `24px` 대 `heading-36`, 설명 `15px`은
스케일 밖이다. **시스템을 못 쓰는 것과 값을 다르게 두는 것은 별개**이므로 인라인이라도 값은
맞출 수 있다. 판정 대상으로 적었다.

### [Skeleton](../components/skeleton.md) — 차트 스켈레톤

이 컴포넌트의 Anatomy는 단일 프리미티브인데 제품 대시보드는 **차트 모양을 미리 보여 주는**
스켈레톤을 갖는다. **파형이 그림이 아니라 `clip-path` 다각형**이다 — 이미지로 옮기면 색이
테마를 안 따라간다. 프리미티브(1.6s)와 차트 영역(2s)의 리듬도 다르다.

### 제품 결함 둘을 확인 항목으로 올렸다

**분석 대시보드 파일 전체에 `motion-reduce`가 0건**인데 애니메이션이 5개이고 셋이 무한 반복이다.
같은 제품의 다른 자리는 감소-모션 분기를 갖는다 — **이 파일만 빠져 있다.**

그리고 **`dashboardAreaBreathe`는 `@keyframes` 정의가 없어 재생되지 않는다.** 같은 파일의 다른
넷은 전부 정의가 있다. **선언은 있고 움직임은 없다** — CSS는 없는 이름을 조용히 무시한다.
어느 쪽으로 정하든 **Figma에는 지금 이 움직임을 그리면 안 된다.**

### 지금

**89 문서 · 21 컴포넌트 · 8 패턴** · 규범 소스 79 · 제품 인용 **496건**.

### Migration

없다. 승격과 결함 기록이다.

## 2026-08-21 (90) — 게이트가 **에이전트의 무단 상태 격상 둘**을 잡았다

문서 이관을 마무리하며 게이트를 돌렸더니 내가 하지 않은 변경 둘이 나왔다.

| 자리 | 원래 | 바뀐 값 |
| --- | --- | --- |
| [button](../components/button.md) Availability의 Web | `partial` | **`done`** |
| `manifest.json`의 button maturity | `experimental` | **`beta`** |

**둘 다 상태를 올리는 방향이고, 근거는 하나도 붙지 않았다.** 이관 초안을 만든 에이전트가
문서를 쓰면서 함께 올린 것으로 보인다. 되돌렸고, manifest 전체를 대조해 **추가 외에 수정·삭제가
없음**을 확인했다.

이 저장소가 처음부터 막으려던 것이 정확히 이것이다 — 「빈 scaffold가 초록으로 보이는 것」.
**상태는 증거로만 올린다.** Availability 표와 manifest가 서로를 대조하기 때문에 한쪽만 올리면
잡히고, 둘 다 올려도 근거 없이는 사람이 봐야 한다.

### 내가 만든 잔재도 셋 있었다

`pnpm verify`를 중간에 죽였더니 카나리아가 복원되지 못했다.

- `design/content/README.md`에 「Temporary broken link」 한 줄
- `manifest.json`에 `llms-unexpected` 문서 항목
- `packages/tokens/test/__harness-canary.browser.test.ts` 파일

셋 다 게이트가 다음 실행에서 잡아 냈지만, **카나리아가 남으면 그 게이트 자체가 못 돈다.**
verify를 중간에 죽이지 않는 편이 낫고, 죽였으면 다음 실행 전에 잔재를 확인해야 한다.

### 새 패턴을 Progress Board에 세웠다

(87)에서 만든 패턴 셋이 `manifest.documents`에는 있는데 **`manifest.patterns`에 없어서**
카탈로그가 계속 「Patterns 4」로 세고 있었다. 문서는 빌드에 잡히는데 보드에는 안 나오는 상태였다.

셋을 등록하고 frontmatter `id`를 접두어 없는 이름으로 맞췄다(패턴 문서의 규칙이다).
이제 **88 문서 · 21 컴포넌트 · 7 패턴**이다.

`status-result`에 `Acceptance tests` 앞의 `Accessibility` 절이 없어 게이트가 잡았다 — 채웠다.

### Migration

없다. 되돌림과 등록이다.

## 2026-08-21 (89) — 결손 80건을 전부 닫았다

(86)에서 49블록, (87)에서 패턴 셋을 넣었고 남은 것을 마저 처리했다. **실제 결손 80건이 전부
문서에 들어갔거나 등록부에 값이 붙었다.**

### 마지막 여섯

| 결손 | 자리 |
| --- | --- |
| Button hover 면 · active scale | [button](../components/button.md) States 아래 실측 절 |
| 선택 액센트가 채널별 축이다 | [DS-D-0010](../governance/decisions/DS-D-0010-token-coverage.md) |
| 노드 카드 외곽선 SSOT | [editor-workspace](../patterns/editor-workspace.md) |
| 노드 반경 · 면에 SSOT 없음 | 같은 절 |
| 생성 중 셸 (아이콘 breathe) | [loading](../patterns/loading.md) |
| 툴바 · 인라인 오류 배너 | [gap registry](../../migration/figma-gap-registry.md)에 실측값 |

### 이번 묶음에서 나온 것

**선택 액센트는 채널이 일곱이고 `edit`이 빠져 있었다.** 이식번들 표가 여섯만 적었는데 배포본에는
`edit → --accent-violet-500` (`#6055ff`)이 있다. **선택 강조를 한 색으로 옮기면 일곱 중 여섯이
틀린다.** 일곱 규칙이 전부 테마 셀렉터 **밖**이라 양 테마가 같다.

**노드 카드에서 선과 면의 소유자가 갈린다.** 외곽선은 캔버스 셸이 후손 셀렉터로 한 곳에서 주는데
(SSOT), **면은 여덟 노드가 각자 복제한다.** 게다가 선은 팔레트를 읽고 면은 다크에서 시맨틱,
라이트에서 팔레트를 읽는다 — 셋을 한 규칙으로 통일하면 어느 한 테마가 틀린다.

반경도 관계식이다 — 외곽 `24px`, 안쪽 `22px`로 **border 2px를 뺀 값**이다. 따로 정하면 border
안쪽 콘텐츠가 모서리에서 어긋난다.

**Button의 hover 면 알파가 variant마다 다르다.** `ghost`가 `secondary`보다 라이트에서 3%p, 다크에서
2%p 진하다 — `secondary`는 테두리로 경계를 갖고 있어 면이 덜 필요하고 `ghost`는 **hover 면이
유일한 경계**라 더 진해야 한다. 그리고 라이트는 잉크를, 다크는 페이퍼를 얹는다 — **같은 토큰의
테마 분기가 아니라 서로 다른 원 팔레트를 직접 읽는다.**

**미디어 생성은 기존 다섯 표현 어디에도 안 맞는다.** 수십 초가 걸리는데 진행률도 콘텐츠 구조도
모른다. 제품은 아이콘 하나를 호흡시키는데, **등장 320ms와 호흡 딜레이 320ms가 같고 호흡의 `0%`가
등장의 종료값과 같아** 이어질 때 튀지 않는다. 두 값을 따로 정하면 반드시 튄다.

그런데 **Motion 계약이 이 표현을 담지 못한다** — loop 허용 property에 `transform`이 없고, recipe
둘 중 overshoot 곡선이 없다. 판정 대상으로 적었다.

### 지금 상태

| | |
| --- | ---: |
| 문서 | **88** (규범 소스 78) |
| 제품 인용 | **494건** · 락 **83파일** |
| `verify` | **24단계** · 카나리아 **24종** |

### 남은 것

- **컴포넌트 문서 신설 판정** — 툴바 · 인라인 오류 배너. 값은 등록부에 있고, 문서를 세우는 것은
  「LOUIS가 만든다」는 로드맵 결정이다.
- **제품 확인 7건** — 루트 폰트 크기 · 죽은 상단 페이드 · 180ms의 역할 등.
- **`migration/`에만 있는 관측의 승격** — 판정에서 3건이 그 상태였다.

### Migration

없다. 문서 이관의 마지막 묶음이다.

## 2026-08-21 (88) — 플레이크의 원인은 **남은 마우스 포인터**였다. 고침을 두 번 틀렸다

(83)에서 「원인을 못 찾았으므로 고쳤다고 적지 않는다」고 했다. 찾았고, **고치는 데 세 판이
걸렸다.** 두 번의 실패가 각각 무엇을 가르쳤는지 적는다.

### 원인 — 토큰 값이 정확히 일치한다

40회 반복에서 2건이 실패했고 **둘 다 「기대한 색 대신 hover 색」**이었다. 추측이 아니다.

| 실패 | 기대 | 실제 |
| --- | --- | --- |
| sidebar CTA | `--louis-color-bg-upgrade` `#171b22` | `--louis-color-bg-upgrade-hover` **`#313640`** |
| segmented | Default = `color-fg-secondary` `#575d68` | Hover = `color-fg-primary` **`#171b22`** |

`userEvent.hover()`는 **진짜 마우스를 움직인다.** 얹은 채로 테스트가 끝나면 다음 테스트에서 같은
좌표에 렌더된 요소가 `:hover`를 받는다. 값이 「그럴듯한 다른 색」이라 원인이 안 보인다.

### 첫 판 — 매 테스트 뒤에 치우기. suite가 멈췄다

**`afterEach` 시점에는 그 테스트의 fixture가 아직 DOM에 있다.** playwright의 hover는 대상이
실제로 이벤트를 받을 때까지 기다리는데, 남은 오버레이가 덮고 있으면 그 대기가 끝나지 않는다.

**로그가 66초 동안 늘지 않는 것을 보고 알았다.** 「느린 것」과 「멈춘 것」은 CPU와 로그 증가로
갈린다 — 그 둘을 구분하지 않으면 계속 기다리게 된다.

### 두 번째 판 — 실패한 테스트 뒤에만 치우기. 여전히 났다

정리가 빠진 자리를 세니 hover가 있는 8개 파일 중 **둘뿐**이었다(`tooltip` 5:2 · `icon-button` 1:0).
네 자리를 고치고, 남은 「단언이 실패해 자기 정리에 도달하지 못한 경우」만 `afterEach`가 막게 했다.

**같은 두 실패가 그대로 났다.** 두 가지를 놓쳤기 때문이다.

1. **남기는 것은 `hover`만이 아니다.** `click`도 마우스를 그 자리에 두고, 「언클릭」은 없다.
2. **vitest는 파일을 병렬로 돌리며 같은 마우스를 공유한다.** 그래서 어떤 파일이 자기 안에서
   아무것도 안 눌러도 **다른 파일이 남긴 포인터** 위에 자기 요소가 렌더될 수 있다.

실제로 실패한 `states 표가 코드와 같다`는 그 파일의 **두 번째** 테스트이고, 클릭하는 테스트들은
전부 그 **뒤**에 있다. 파일 안에서는 설명이 안 된다.

### 세 번째 판 — 읽기 **전에** 치운다

```ts
beforeEach(async () => {
  try { await userEvent.unhover(document.body); } catch {}
});
```

`beforeEach` 시점에는 **아직 아무것도 렌더되지 않았다.** 그래서 `html > body`가 비어 있고
대기가 걸리지 않는다 — 첫 판이 멈춘 이유가 사라진다. 그리고 포인터를 누가 어디에 남겼든
상관없어진다 — **출처를 쫓지 않고 시작점을 고정한다.**

`unhover`는 vitest가 내부적으로 `html > body`를 hover하는 것이라 대상 요소를 따로 만들 필요도 없다.

### 결과

| | 값 |
| --- | --- |
| suite 시간 | **14.43초** (첫 판은 멈췄다) |
| 테스트 | 78파일 · **756 전부 통과** |
| **40회 반복** | **통과 40 · 실패 0** |

**같은 조건에서 재기 전에는 「고쳤다」고 적지 않았다.** 고침 전 40회에 2건이었고 첫 두 판에서도
같은 실패가 났으므로, 40회 무실패가 나오기 전까지는 세 번째 판도 가설이었다.

곁들여 `tooltip` 3곳 · `icon-button` 1곳의 빠진 `unhover`도 채웠다. 근본 고침은 아니지만
**테스트가 자기 뒤를 치우는 것이 맞다.**

### 배운 것

**「뒤에서 치운다」보다 「앞에서 시작점을 맞춘다」가 강하다.** 뒤에서 치우는 것은 남기는 경로를
전부 알아야 하고(hover · click · drag · …), 앞에서 맞추는 것은 **하나면 된다.**

### Migration

없다. 테스트 setup 훅과 정리 4곳이다.

## 2026-08-21 (87) — 셸 패턴 셋을 세웠다. 랜딩·인증·결과 화면이 처음으로 문서를 갖는다

(86)에서 「`landing-shell` · `auth-two-panel` · `status-result`는 아직 안 만들었다」고 적었다.
셋을 세웠다. **LOUIS에 로그인 전 화면의 규범이 하나도 없었다** — 제품의 절반이다.

| 문서 | 덮는 화면 |
| --- | --- |
| [Landing Shell](../patterns/landing-shell.md) | 홈 · 가격 · 탐색 · 블로그 · 문서 · 템플릿 · 법적고지 |
| [Auth Two Panel](../patterns/auth-two-panel.md) | 로그인 · 회원가입 · 비밀번호 재설정 · 이메일 인증 등 **8화면** |
| [Status Result](../patterns/status-result.md) | 결제·구독 결과 **7화면** |

**컴포넌트 문서는 만들지 않았다.** `design/components/`에 문서를 만드는 것은 「LOUIS가 이것을
만든다」는 **로드맵 결정**이라 문서 작업으로 처리할 일이 아니다. 셸·화면 패턴은
[app-shell](../patterns/app-shell.md)이 「제품 현실 + 선언된 결손」 형태의 선례를 이미 만들어
두었으므로 `patterns/`가 맞다.

### 세 문서 각각에서 나온 것

**Landing Shell — 앱 셸과 정반대 모델이다.** 앱 셸은 레일이 자리를 예약하고 본문이 밀리지만,
랜딩 헤더는 **자리를 예약하지 않고 콘텐츠 위에 뜬다.** 점유 높이 48px이 본문에서 예약되지
않으므로 첫 섹션은 헤더 **밑을 지나간다.** 가독성은 전적으로 **120px 고정 blur plate**가 만들고
헤더 자신은 투명하다 — 헤더에 반투명 면을 깔면 배포본과 다르다.

톤 반전은 **다섯이 한 덩어리로** 뒤집힌다(레일 전경 · 로고 자산 · 메뉴 링크 · 상단 CTA ·
햄버거). 판정은 `IntersectionObserver`가 **뷰포트 상단 3~4% 띠**로만 한다.

**Auth Two Panel — 「8화면이 공유한다」가 부정확했다.** 실측하니 **5개는 공용 `AuthStatusCard`를
쓰고 3개(`/login` · `/signup` · `/aws/signup`)는 같은 셸을 자기 파일에 복제**한다. 값이 지금은
같지만 한쪽만 고치면 갈린다. 그 사실을 문서에 남겼다.

**Status Result — 셸이 아니라 카드 안의 컬럼이다.** 그리고 정정이 하나 나왔다.

### 무단위 행간 토큰이 같은 결과를 낸다

결손 지적이 「메타 목록의 `dt`와 `dd`는 크기가 같고 **행간이 다르다** — 키가 값보다 살짝 높은
행 박스를 갖는다」고 했다. **틀렸다.**

| | `dt` | `dd` |
| --- | --- | --- |
| line-height 토큰 | `--type-body-16-line-height` | `--type-body-14-line-height` |
| 토큰 값 | `1.5` | `1.5` |
| 글자 크기 | 14px | 14px |
| **렌더 행간** | **21px** | **21px** |

**두 토큰 모두 무단위 `1.5`다.** 무단위 line-height는 토큰 이름의 숫자가 아니라 **그 요소의
글자 크기**에 곱해지므로 둘 다 `14 × 1.5 = 21px`이다. 이름 차이는 실효가 없는 저작 흔적이다.

**토큰 이름을 값으로 읽으면 틀린다** — 오늘 나온 함정 중 가장 조용한 종류다.

### 딸려 나온 정정 둘

**Checkbox — 「두 번째 소비처도 없다」가 틀렸다.** 14px 변형은 두 모듈이 **한 정의를 공유한다** —
`CreditConfirmModal.tsx`가 상수를 `export`하고 `NodeDeleteConfirmModal.tsx`가 `import`한다. 값이
우연히 같은 것이 아니다. 좌표도 틀렸다(`globals.css:990` → **`:1013`**). 「크기 축을 세우지
않는다」는 판단은 유지하되 **그 판단의 전제였던 사실이 틀렸다는 것**을 남겼다.

두 벌의 `accent-color` 성격도 갈린다 — 공용 정본은 팔레트라 테마에서 고정이고, 14px 변형은
시맨틱이라 **반전된다.** 한쪽으로 통일하면 한 테마에서 체크 표시가 묻힌다.

**확인 항목 2(「180ms가 어느 모션인가」)에 첫 실측 입력이 들어갔다.** 확인 모달 액션이
`transform`·`filter`·`opacity`를 **셋 다 180ms ease**로 쓴다. 그 자리에서 움직이는 것은 hover
밝기와 active 눌림 — **컨트롤 피드백이지 진입·퇴장이 아니다**(그쪽은 220·260·320ms).
값은 [interaction-states](../foundations/interaction-states.md)의 제품 실측 절에 넣었다.
다만 **240회 중 한 자리**이므로 이것만으로 역할을 확정하지 않는다.

같은 절에 셀렉터 함정도 적었다 — 호버가 `[&:hover:not(:disabled)]:`로 저작돼
**`@media (hover: hover)` 가드가 없다.** 터치에서도 발동한다.

### Migration

없다. 패턴 문서 3종 추가다. `verify` 24단계 · 카나리아 24종 그대로다.

## 2026-08-21 (86) — 검증된 결손 80건을 문서로 옮겼다. 1,455줄

(85)에서 판정한 실제 결손 80건 중 **49개 블록을 18개 문서에 넣었다.** 이관은 「번들 문장을
복사」가 아니라 **배포본에서 다시 잰 값을 LOUIS 문체로 다시 쓰는 것**이었다.

| | |
| --- | ---: |
| 삽입 블록 | 49 |
| 늘어난 줄 | **1,455** |
| 고친 문서 | 18 |
| 새 문서 | 1 ([Scroll Surface](../foundations/scroll-surface.md)) |

가장 많이 늘어난 곳은 [app-shell](../patterns/app-shell.md) 132줄 ·
[menu-popover](../components/menu-popover.md) 122줄 ·
[color-theme](../foundations/color-theme.md) 100줄 ·
[product-reading-traps](../foundations/product-reading-traps.md) 94줄 ·
[button](../components/button.md) 90줄이다.

### 앵커로 넣고 게이트로 확인했다

초안이 문서를 직접 고치게 하지 않았다. **「문서에 실재하는 유일한 한 줄」과 넣을 마크다운**을
내놓게 하고, 적용은 기계가 했다. 앵커가 없거나 여럿이면 넣지 않고 보고하도록 만들었는데
**48건 모두 유일하게 맞았다.**

넣은 뒤 값을 표본으로 직접 확인했다 — 네 건 전부 배포본과 정확히 일치했다.

| 확인한 것 | 결과 |
| --- | --- |
| `--node-side-*` 일곱 토큰의 값과 줄 | 전부 일치 |
| `INSTAGRAM_ANALYTICS_HIDDEN = true`와 소비처 셋 | 일치 |
| 워드마크 96px = `round(28 × 291 / 85)` | 95.859 → 96, 일치 |
| `--app-gnb-sidebar-logo-cube-px` = `calc(28px × 72 / 85)` | 23.7176, 일치 |

### 인용 게이트가 즉시 값을 했다

이관으로 제품 인용이 **68건 → 472건**으로 늘었다. `verify-citations`가 그 자리에서
**23건을 잡았다.**

- `page.tsx`는 제품에 **49개**다. 초안이 `login/page.tsx`처럼 앞을 줄여 인용했는데 해석기가
  부분 경로를 못 다뤄 파일명으로 넓히고 있었다 — **해석기를 고쳤다**(부분 경로 우선).
- 그래도 `signup/page.tsx`는 둘이다(`app/signup` · `aws/signup`). 문맥이 인증 화면이므로
  문서 쪽을 `app/signup/page.tsx`로 좁혔다.
- 새로 인용된 파일들이 락 밖이었다. 락이 **40개 → 82개**로 넓어졌다.

**게이트가 없었으면 「49개 중 어느 것인지 모르는 인용」 9건이 그대로 들어갔다.**

### 넣지 않은 것

- **컴포넌트 문서 신설은 하지 않았다.** `design/components/`에 문서를 만드는 것은 「LOUIS가 이것을
  만든다」는 **로드맵 결정**이다. 하단 캔버스 툴바와 노드 인라인 오류 배너의 실측값은
  [gap registry](../../migration/figma-gap-registry.md)에 값을 붙여 두었다 — 「없다」만 적혀
  있으면 Figma 작업자가 그릴 수 없기 때문이다.
- **`node-canvas.md`는 만들지 않았다.** 초안이 나왔지만 내용이
  [editor-workspace](../patterns/editor-workspace.md)에 들어간 것과 거의 같았고, 그쪽이 outset을
  **더 정확하게** 적고 있었다(5개 노드가 선언 / 그중 셋만 마케팅 오버라이드). 초안에만 있던
  **TS 미러**(같은 숫자가 CSS 밖에 두 벌 더 있다)만 뽑아 합쳤다.

### 남은 것

`landing-shell`(4 BLOCKING) · `auth-two-panel`(8화면 공유) · `status-result`(결제 결과 7종)는
**셸·화면 패턴이라 `patterns/`가 맞지만 아직 안 만들었다.** 값은 판정 결과에 있다.

### Migration

없다. 문서 이관이다.

## 2026-08-21 (85) — 「LOUIS에 없다」 141건을 판정했다. 실제 결손은 80건이고, 25건은 이미 있었다

(80)·(82)의 감사가 「LOUIS에 이 사실이 없어서 화면을 못 그린다」고 지목한 141건을 **제품과 LOUIS
양쪽에서** 다시 봤다. 세 가지를 따로 물었다 — 사실이 맞는가 · LOUIS에 정말 없는가 · 그리는 데
필요한가.

| 판정 | 건수 |
| --- | ---: |
| **실제 결손** | **80** (이 중 BLOCKING **61**) |
| 이미 LOUIS에 있음 | **25** |
| 사실이 틀리거나 부분적으로 틀림 | **40** |

### 지목한 쪽이 LOUIS의 구조를 몰랐다

25건이 「이미 있음」으로 뒤집힌 이유가 거의 같다 — **감사자가 `design/`만 보고 「없다」고
결론냈다.** LOUIS는 제품 관측을 `migration/`에 소유한다.

예를 들어 「노드 캔버스 하단 ComposerBar의 반응형 폭이 LOUIS에 없다」는 지목은,
`migration/legacy-design-system.md` §6.6이 **요청한 각주를 문자 그대로 갖고 있었다.**
「프로필 팝오버 로컬 변수 5행」도 같은 파일에 다크/라이트/근거줄까지 **더 정확하게** 있었다.

`design/`은 규범이고 `migration/`은 제품 관측이다. **둘을 함께 보지 않으면 LOUIS를 과소평가한다.**

### 결손이 아니라 「이미 내린 결정」인 것

둘은 메우면 안 된다. **`accepted-deviation`을 뒤집는 일**이기 때문이다.

- **팝오버 열림 260ms / scale 0.92.** LOUIS는 `overlay-enter` 200ms · scale 0.96을 Menu·Dialog·
  Popover가 공유한다. `product.measured.json`에 사유가 적혀 있다 — 「표면마다 열림 속도가
  다르면 같은 제스처가 다른 반응을 준다」.
- **`transform-origin: top right` 하드코딩.** 제품은 배치가 flip돼도 원점이 안 따라간다.
  LOUIS는 anchor에서 계산한다. 제품 쪽을 **결함으로 기록**해 둔 자리다.

**「제품이 이렇게 한다」가 곧 「LOUIS가 이렇게 해야 한다」는 아니다.**

### 딸려 나온 수치 정정 40건

결손을 검증하다 원래 주장의 수치가 틀린 것이 40건 나왔다. 몇 개만.

| 주장 | 실제 |
| --- | --- |
| `rounded-16` = 32px | **16px** (`--radius-*: initial` 후 재정의) |
| 레이어 패널 `z-index: 1002` | **1000** (1002는 캔버스 온보딩 힌트) |
| `--node-card-width`를 캔버스 셸이 선언 | 셸이 선언하는 것은 **셋뿐**이고 이건 아니다 |
| `[3000, 6000, 12000, 24000]`은 전환 시각 | **단계별 지속 시간**이며 누적된다 |
| 16px blur는 1곳 | **2곳** |
| 노드 외곽선이 semantic `gray-600` | **palette 원시값** |

### 남은 일

80건을 각 문서로 옮기는 것이 남았다. 대상은 27개 문서이고 상위 다섯이
`app-shell-parts`(10) · `app-shell`(9) · `button`(8) · `menu-popover`(6) ·
`product-reading-traps`(4)다.

### Migration

없다. 판정 기록이다.

## 2026-08-21 (84) — 인용 좌표를 게이트가 지킨다. 락이 산문 인용을 안 보고 있었다

(80)에서 이식번들의 인용 좌표 **124건이 낡았다**고 적었다 — 사실은 맞는데 제품이 움직여 줄이
밀렸다. **LOUIS도 같은 구멍을 갖고 있었다.**

### 구멍

`product-evidence.lock.json`은 blob 해시를 고정해 제품 변경을 잡는다. 그런데 그 락이
`product.measured.json`이 인용한 파일만 봤고, **design 문서가 본문에서 인용한 제품 파일은
아무도 지키지 않았다.** 제품이 그 파일을 바꾸면 문서의 좌표가 조용히 낡는다.

실측: LOUIS 문서의 제품 인용 **68건 · 파일 16개**. 그중 **7개가 락 밖**이었다.

### 그리고 인용이 모호했다

`Gnb.tsx`는 배포본에 **둘**이다 — 앱 셸용(5,570줄)과 랜딩용(1,010줄). LOUIS가 짧은 이름으로
**17번** 인용하고 있었다. 오늘 랜딩 쪽을 열고 「그 파일이 없다」고 판단한 적이 실제로 있다.

17건을 **내용으로 대조**했다 — `:191` `iconButton: [` · `:427` `[background:var(--app-page-bg)]` ·
`:511` `menuLinkActive: [` · `:909` mint 16% 베이스 · `:1886~2016`(랜딩은 1,010줄이라 존재 불가).
**전부 앱 셸 Gnb다.** 추정이 아니라 확인이다.

### 조치

**새 게이트 `verify-citations`** — 세 가지를 실패로 만든다.

| 실패 | 뜻 |
| --- | --- |
| 모호 | 제품에 같은 이름 파일이 여럿인데 경로 없이 인용했다 |
| 부재 | 파일이 배포본에 없거나, 인용한 줄이 파일 길이를 넘는다 |
| 비고정 | 그 파일이 evidence lock에 없다 — 제품이 바꿔도 아무도 모른다 |

`build-product-evidence.mjs`가 이제 **산문 인용도 락에 넣는다.** 근거 파일 34개 → **40개**.

별칭은 [citation-aliases.json](../../migration/citation-aliases.json)에 둔다. 규범 문서는
제품 저장소 전용 경로를 본문에 쓸 수 없으므로(저장소 경계 규칙) 대응을 문서 밖에 두어야 한다.
**별칭이 썩는 것도 실패다** — 가리키는 파일이 사라지거나, 이름이 더는 모호하지 않아 별칭이
필요 없어지면 게이트가 알려 준다.

카나리아 3종을 붙여 셋 다 실제로 잡히는 것을 증명했다. `verify` 23 → **24단계**,
카나리아 21 → **24종**.

### 남은 한계

**줄 번호가 「맞는 줄을 가리키는지」는 아직 못 본다.** 파일이 안 바뀌면 통과한다. 그래도
오늘의 실패 방식(제품이 움직여 줄이 밀림)은 이제 **락이 먼저 잡는다** — 락이 깨지면 인용을
다시 확인하게 된다. 문장과 줄 내용을 대조하는 것은 별도 단위로 둔다.

### Migration

없다. 게이트 1종과 락 범위 확대다.

## 2026-08-21 (83) — 브라우저 테스트 플레이크: 원인 하나를 고쳤고 하나는 아직 못 잡았다

`verify-test-harness`가 이따금 초록이 아니었다. 40회 반복해 **3건을 포착**했는데 그중 **2건은
내 탓**이었다 — 배경 루프와 `pnpm verify`를 동시에 돌려 카나리아 파일이 겹쳤다. 진짜는 2종이다.

### 고친 것 — `optimizeDeps.include`가 통째로 안 걸리고 있었다

`vitest.config.ts`의 주석이 이미 이 위험을 적어 두었다 — 「Vite가 새 의존성을 발견하면 페이지를
리로드하고, 그 리로드가 진행 중이던 테스트를 통째로 실패시킨다」. 그걸 막으려고 4개를
`optimizeDeps.include`에 넣어 두었는데, **그 이름들이 저장소 루트에서 해석되지 않았다.**

```
Failed to resolve dependency: @radix-ui/react-portal, present in client 'optimizeDeps.include'
```

pnpm 배치라 `packages/react`에서만 해석된다. optimizer는 루트에서 돌므로 **사전 번들링이 통째로
걸리지 않았고, 막으려던 리로드가 그대로 일어나고 있었다.** 부모를 앞에 적는 문법으로 고쳤다 —
`"@klipse-design/react > @radix-ui/react-portal"`. 경고가 사라졌다.

**로그 한 줄이라 아무도 읽지 않았다. 그래서 게이트로 만들었다** —
`verify-test-harness`가 이제 `Failed to resolve dependency`를 실패로 잡는다.

### 아직 못 잡은 것 — 조회가 다른 테스트의 요소를 집는다

고친 뒤에도 40회에 2건이 남았다. 둘의 모습이 같다.

| 테스트 | 기대 | 실제 |
| --- | --- | --- |
| sidebar CTA 기본 색 | 기본 CTA 색 | **`aria-current` CTA 색** |
| segmented 기본 전경 | 기본 세그먼트 색 | **선택된 세그먼트 색** |

**둘 다 「엉뚱한 요소를 읽었다」이고, 값이 그럴듯한 다른 색이라 단언이 조용히 어긋난다.**
`[data-louis-fixture]` 조회가 앞 테스트의 fixture를 집는 것으로 보인다.

**고치려다 되돌렸다.** `afterEach`에서 fixture를 걷어 봤더니 **84개 테스트가 깨졌다** — 한 번
렌더하고 여러 `test()`에서 조회하는 파일들이 있다. 그 접근은 틀렸다.

**남긴 것 하나.** 테마 복원이 `afterEach`가 아니라 **본문 마지막 줄**에 있었다. 단언이 중간에
실패하면 그 줄에 도달하지 못해 테마가 남고 **첫 실패가 둘째·셋째를 만든다.** setup 파일의
`afterEach`로 옮겨 그 연쇄를 끊었다. 이것은 근본 원인이 아니라 **증폭 경로**를 막은 것이다.

### 아직 「고쳤다」고 말하지 않는다

`optimizeDeps` 쪽은 증거가 확실하다(경고가 있었고 사라졌고 게이트가 지킨다). **요소 조회 쪽은
원인을 못 찾았다.** 남은 빈도를 다시 재야 하고, 진짜 고침은 `render()`가 돌려주는 컨테이너에서
조회하도록 바꾸는 것으로 보이는데 11개 파일에 걸쳐 있어 별도 단위로 둔다.

이 저장소에 이미 같은 성격의 기록이 있다 — [menu-popover](../components/menu-popover.md)의
「전체 suite 36회 중 1회 깨졌다 … 추측으로 고치지 않는다」. 그 판단을 여기서도 따른다.

### Migration

없다. 테스트 설정 수정과 게이트 1종 추가다.

## 2026-08-21 (82) — 빠졌던 §6.13을 감사했다. 그리고 결손 지적 하나를 내가 기각했다

(80)에서 「§6.13이 감사되지 않았다」고 적었으니 그 절만 따로 돌렸다. 「앱 페이지 셸 — 사이드바
우측 메인 영역」 229줄이고, 로그인 후 화면 대부분이 이 셸을 공유하므로 화면 조립에 직결된다.

**주장 94건 — 유효 77 · 좌표만 낡음 1 · 틀림 16.**

### 번들이 틀린 것 중 무거운 것

| 문서 | 제품 |
| --- | --- |
| 프로바이더 7개는 DOM을 만들지 않는다 | `GenerationProvider`가 **항상** `<style>` 노드를 낸다. `precedence` prop이 없어 React 19가 `<head>`로 올리지 않는다 |
| `--app-shell-vh`는 `globals.css`가 소유 | **globals.css에 정의가 없다.** `AppHomeScene.tsx:246`이 런타임에 `documentElement`에 주입한다 |
| 헤더 슬롯과 스크롤 뷰포트는 형제 | 슬롯은 뷰포트의 **자손**이다. 같은 절 2695행이 「슬롯이 스크롤 콘텐츠의 직계여야 sticky가 먹는다」고 적어 **스스로를 반박한다** |
| 형태 B는 상단 72px 페이드를 켠다 | `--header-progress`가 패널까지 닿지 않는다(훅이 `<main>`에만 쓰는데 패널은 그 **부모**다). **실제로 켜지는 화면이 0개다** |
| `--header-progress`는 워드마크 축소용 | 소비처는 형태 B 상단 페이드 **하나뿐**이다. 워드마크를 줄이는 규칙이 배포본에 없다 |
| 형태 B 씬은 `components/scenes/` 7개 | 라우트 폴더 안에 3곳 더 있다 — **LOUIS `app-shell.md`는 이 3곳을 이미 담고 있다. 번들이 뒤처졌다** |

마지막 행이 중요하다. **이관이 한 방향이 아니다.**

### 결손 지적 하나를 기각했다가 **내가 틀렸다** — `head -4`가 증거를 잘랐다

감사가 낸 결손 중 가장 무거운 것은 이것이었다 — 「앱 셸 라이트에서 페이지 바닥(`#eeeef1`)과
카드 면(`#f8f8f9`)이 **다르다.** 함정 문서 §3이 「같은 색」이라 적은 것은 앱 셸에서 틀리다」.

**나는 이것을 기각했다. 그리고 그 기각이 틀렸다.**

기각의 근거는 「`appHomeSceneStyles.ts:201`은 페이지 바닥이 아니라 카드 안 프리뷰 요소다」였다.
201행이 프리뷰인 것은 맞다. 그런데 **같은 파일 900행이 씬 루트(`scene` 상수)이고 거기도
`--palette-gray-200`을 칠한다.** 내가 그것을 못 본 이유는 확인할 때 쓴 명령이
`grep … | head -4`였기 때문이다 — **900행이 잘려 나갔고, 나는 잘린 출력으로 결론을 냈다.**

오늘 하루 종일 「잘못 좁힌 명령으로 만든 수치는 틀린다」를 고쳐 왔는데 같은 실수를 했다.

**실제 값** (`appHomeSceneStyles.ts:900`·`909`, `NodeCanvasHomeScene.tsx:105-107` — 두 씬이 같다):

| 앱 셸 · 라이트 | 페이지 바닥 | 카드 면 | 관계 |
| --- | --- | --- | --- |
| ≥720px | `--palette-gray-200` = `#eeeef1` | `--palette-gray-100` = `#f8f8f9` | **다르다** |
| ≤719px | `--palette-gray-100` = `#f8f8f9` | `#f8f8f9` | 같다 |

**`--app-page-bg`는 데스크톱 페이지 바닥을 칠하지 않는다.** 씬 루트가 자기 배경을 직접 칠하고,
`--app-page-bg`는 사이드바와 모바일 드로어가 읽는다. 내 기각 논리(「둘 다 같은 토큰을 읽으니
다를 수 없다」)는 **씬 루트가 그 토큰을 안 쓴다는 것을 몰라서** 성립하지 않았다.

[읽기 함정](../foundations/product-reading-traps.md) §3의 파생 규칙을 정정했다. 이제 앱 셸에서는
**면 색으로 카드를 찾을 수 있고**, 반대로 랜딩의 「같은 색」 규칙을 앱 셸에 적용하면 페이지
바닥이 한 계단 밝게 나온다.

### 확인한 것을 LOUIS에 넣었다

**메인 카드 표면.** `app-shell.md:154`가 「카드 표면은 제품이 소유하며 아직 DS 계약이 없다」고
스스로 선언해 두었는데, **「계약이 없다」가 「값을 모른다」는 뜻은 아니다.** 실측표를 넣었다 —
반경 16px · 프레임 5겹 · 면(라이트 `gray-100` / 다크 `gray-800`) · 하단 페이드 `::before` z-10 ·
베벨 링 `::after` z-11 · `overflow: hidden`. Figma가 지어내지 않게 하는 것이 목적이다.

**헤더 스크롤 계약.** `app-shell-parts.md`가 「rAF로 매 프레임 값을 쓰므로 컴포넌트가 소유할 수
없다」까지만 적고 값이 없었다. 두 변수의 식과 폴백을 넣었다 —
`--mainchrome-divider-progress` = `scrollTop <= 0 ? 0 : min(1, scrollTop / 12)`,
`--header-progress` = `clamp(0, scrollTop / 120, 1)`.

### 제품 결함 하나 — 상단 페이드가 죽어 있다

형태 B 패널이 상단 72px 페이드를 선언하는데 **켜지는 화면이 0개다.** 훅이
`--header-progress`를 `<main>`에 쓰는데 페이드는 **그 부모인 패널**의 `::before`에 있다.
커스텀 프로퍼티는 위로 상속되지 않는다. 게다가 페이드를 선언한 3파일 중 훅을 부르는 것이
**하나도 없다.**

같은 훅의 `--mainchrome-divider-progress`는 `headerSlot`에 쓰이고 경계선이 그 안에서 읽으므로
정상이다. 상수 이름이 말하는 「워드마크 축소」 소비처도 배포본에 없다.

[확인 항목 7](../governance/product-confirmations.md)로 올렸고, DS 쪽에는 「상단 페이드를 켜진
상태로 그리지 마라」를 적었다.

### 같은 목록에서 맞은 것은 반영했다

모바일 드로어는 지적이 맞았다. compact 드로어가 `--app-page-bg`를 깔았다가 **라이트에서만**
`--palette-gray-200`으로 덮인다 — 앱 셸 라이트 기준 `#eeeef1` 대 페이지 `#f8f8f9`다.
[app-shell](../patterns/app-shell.md)의 「아직 토큰이 없는 축」에 폭·패딩·면(라이트/다크)·전환
**6행**을 넣고, 「페이지 배경색으로 드로어를 그리면 한 단계 밝게 나온다」를 적었다.

### 방법

**결손 지적을 그대로 옮기지 않는다.** 18건 중 2건을 확인했는데 하나는 틀렸고 하나는 맞았다.
확인하지 않은 16건은 아직 반영하지 않는다 — 확인한 것만 문서에 들어간다.

### Migration

없다. app-shell 패턴에 실측 6행 추가다.

## 2026-08-21 (81) — 손으로 센 제품 인구조사 13건 중 **10건이 틀렸다**

(77)에서 「일회성 `git grep`으로 만든 수치는 못 믿는다」고 적었으니, 문서에 남은 **제품 인구조사
수치를 전부 뽑아 배포본에서 독립 재현**시켰다. 계기가 뒷받침하지 않는 손계수 13건이었다.

**일치 3 · 불일치 10.**

### 맞은 것 셋

`role="progressbar"` 1곳 / `<progress>` 0곳 · 앱 셸 소비처 25곳 · `CustomDropdown` 계열 9파일.

### 틀린 것 열

| 주장 | 적었던 값 | 실제 |
| --- | --- | --- |
| `--project-card-overlay-line-height` 사용처 | 15곳 | **14곳** (정의 1곳을 사용처로 셌다) |
| `<select>` 사용 | 3파일 | **5파일** (전부 admin·운영 화면) |
| Checkbox | 21벌 · 14파일 | **22벌 · 15파일** |
| SegmentedControl | 8파일 | **10파일** (벌 수 11은 맞다) |
| `role="tablist"` | 14곳 | **15곳** |
| toast 사용 | 156회 | **172회** (86+86) |
| `eye-slash` | 17곳 | **12곳** (비밀번호 필드 12개와 1:1) |
| 회전 keyframe 이름 | 18개 | **14개** |
| 회전 정의 | 22벌 | **선언 18건** — 두 범주가 뒤바뀌어 있었다 |
| 700ms | 10회 | **11회** (우세라는 결론은 맞다) |

### 「틀렸다」가 아니라 「낡았다」인 것 하나

[DS-D-0010](../governance/decisions/DS-D-0010-token-coverage.md)이 「배포 화면의 heading은 전량
medium 500이다(**semibold·regular 사용 0회**)」라고 적었다. 지금은 semibold가 5곳 쓰인다.

**그런데 문서가 쓰일 때는 맞았다.** DS-D-0010은 2026-08-15이고, 그 5곳을 가져온
`creative-media`(부스 체험)는 **나흘 뒤인 2026-08-19**에 들어왔다. `regular 0회`는 지금도 맞다.

**제품이 문서 밑에서 움직인 것이지 문서가 잘못 센 것이 아니다.** 그래서 수치를 덮어쓰지 않고
낡음을 표시한다.

### 검증자도 두 번 틀렸다

- **회전 모션.** 검증자가 「700ms가 아니라 1600ms가 우세하다」고 했는데, **모집단을 잘못 잡았다** —
  문서는 「**회전** 정의」라고 범위를 적었는데 검증자는 무한 반복 애니메이션 전체(77건)를 셌다.
  회전만 세면 18건 중 700ms가 11회로 우세다. 문서가 맞았다.
- **heading 굵기.** 검증자가 `<hN>` 요소의 굵기를 셌는데, 문서의 주장은 **heading 타입 클래스**에
  관한 것이었다. 클래스로 세야 「`.type-heading-28-semibold`가 정의만 되고 안 쓰인다」는 문장을
  검증할 수 있다.

**반증 결과를 그대로 받지 않고 매번 직접 다시 잰 것이 이 둘을 잡았다.** 오늘 세 번째다.

### 정리

**손으로 센 수치는 10/13이 틀렸고, 계기가 낸 수치는 지금까지 하나도 안 틀렸다.**

### Migration

없다. 문서 8곳의 수치 정정이다.

## 2026-08-21 (80) — §6 감사를 다시 판정했다. 내 반증 프롬프트가 모호해서 판정이 뒤집혀 있었다

(78)에서 §6 감사 결과를 보고했는데, **그 결과의 분류를 그대로 쓸 수 없었다.**

### 무엇이 잘못됐나

반증자에게 준 항목(`target`)에 **문서의 주장**과 **지적 내용**이 함께 들어 있었고, 프롬프트는
「이 주장을 깨라」였다. 반증자들이 **지적이 아니라 문서 주장을 깼다.** 그래서 `refuted: true`가
어떤 자리에서는 「지적이 틀렸다」, 다른 자리에서는 「문서가 틀렸다」를 뜻하게 됐다.

**드러난 방식:** 같은 사실(`--glass-dropdown-frame`이 5겹이라는 것)이 `survived`와 `killed`
**양쪽에** 있었다. 한 사실이 통과이면서 동시에 반증될 수는 없다.

### 다시 판정한 결과

75건에 **모호하지 않은 질문 하나**만 물었다 — 「배포본을 직접 봤을 때 문서가 맞나, 지적이 맞나」.

| 재판정 | 건수 |
| --- | ---: |
| **문서가 틀렸다**(지적이 맞다) | **65** |
| 좌표만 낡았다 | 7 |
| 문서가 맞았다(진짜 반증) | **2** |
| 확인 불가 | 1 |

**원래 「반증됨」으로 분류된 75건 중 진짜 반증은 2건뿐이었다.** 그대로 받았으면 확인된 오류
65건을 기각할 뻔했다.

### 정정된 §6 그림

| | 값 |
| --- | ---: |
| 검증한 주장 | **611** (16절) |
| 문서가 틀린 것 | **86** (통과 21 + 재판정 65) — 이 중 심각도 high **16** |
| 좌표만 낡은 것 | 117 + 7 |
| 감사 안 된 절 | **§6.13** — 17절 중 16절만 돌았다 |

절별 집계의 합(631)이 총계(611)를 넘는다 — 범주가 배타적이지 않다. 표에 있는 그대로 적는다.

### 이게 뜻하는 것

**이식번들은 LOUIS보다 구체적이지만 더 정확하지는 않다.** 화면을 그리려면 둘 다 필요하다 —
구체성이 있어야 숫자가 나오고, 정확성이 있어야 **맞는** 숫자가 나온다. 이관은 번들의 구체성을
가져오되 **값은 배포본에서 다시 재는** 방식이어야 한다. 좌표는 아예 가져오지 않는다.

### 방법론 교훈

**반증자에게 무엇을 반증할지 한 문장으로 명확히 줘야 한다.** 「이 주장을 깨라」에서 「이 주장」이
둘을 가리키면 결과 전체가 못 쓰게 된다. 판정 결과가 서로 모순되는지(같은 사실이 양쪽에 있는지)를
**받은 즉시 확인하는 것**이 이번에 그것을 잡았다.

### Migration

없다. 앞선 감사 결과의 재판정이다.

## 2026-08-21 (79) — `1rem`은 10px가 아니라 **12px**다. 여섯 문서가 틀렸다

§6 감사 중 반증자 하나가 「루트 폰트 크기가 10px가 아니라 12px」이라고 했다. **그 반증자가 맞았다.**

### 배포본 실제

```
globals.css:374   --type-caption-12-size: 12px;
globals.css:942   html {
globals.css:943     font-size: var(--type-caption-12-size);
```

`html`의 `font-size` 선언은 **저 하나뿐**이고 `--type-caption-12-size`도 **재정의가 없다.**
브라우저로 4개 문맥 전부 확인했다 — `root=12px · 1rem=12px · 4.5rem=54px`.

### 문서가 일어나지 않은 되돌림을 적었다

[legacy-design-system](../../migration/legacy-design-system.md)은 이렇게 적고 있었다 —
토큰으로 바뀐 것은 실수였고 「**2026-08-08에 10px로 되돌렸다**」.

**그런 커밋이 어느 저장소에도 없다.** 이 줄의 이력은 두 줄뿐이다.

| 커밋 | 날짜 | 변화 |
| --- | --- | --- |
| `0f47a2cb` | — | `font-size: 10px` |
| `9f2326a8` | **2026-07-31** | → `var(--type-caption-12-size)` |

`klipse-web`과 구 `klipse` **양쪽 다 같다.** 되돌림은 없었고 **2026-07-31 이래 12px다.**

### 파급 — 한 곳

제품에서 `rem`을 쓰는 곳은 **3곳뿐**이다.

| 자리 | 영향 |
| --- | --- |
| `Gnb.tsx:1918` 접힘 사이드바 라벨 `max-width:4.5rem` | **45px → 54px** |
| `StaticCreateDemo.tsx:151` `min-height:4.5rem` | 같은 요소의 `[min-height:3lh]!`가 이겨 **영향 없음** |
| `@media (min-width: 48rem)` | 미디어쿼리의 `rem`은 초기값 16px 기준이라 **768px 그대로** |

문서 **여섯 곳**을 고쳤다 — `legacy-design-system.md` 2곳 · `token-mapping.md` ·
`figma-transfer/RESUME.md` · `figma-transfer/NEXT-SESSION.md` · `product-screens/10.7.md`.
`10.7.md`는 「이 상한에 먼저 걸려 발화하지 않는다」는 **결론이 그대로**이고 수치만 틀렸다.

### 조치

`measure-product-render.mjs`가 브라우저에 4.5rem 탐침을 넣어 **환산 기준을 매번 잰다.**
문맥마다 갈리면 실패한다. 게이트 줄에 `**1rem = 12px** (4.5rem = 54px)`가 찍힌다.

### 제품 확인 필요

원래 의도가 10px였다면 이건 **제품 회귀**다. 문서가 「타입 스케일 토큰으로 바꾸지 말 것」이라고
경고까지 남겼는데 제품은 그 상태다. 판단은 제품 팀이 한다 —
[product-confirmations](../governance/product-confirmations.md)에 올렸다.

### Migration

없다. 수치 정정과 계기 추가다.

## 2026-08-21 (78) — §6 감사가 LOUIS의 실제 오류를 찾았다: `/archive`의 라벨은 「보관함」이 아니다

이식번들 `patterns.txt` §6의 화면 조립 층을 배포본 실측으로 검증했다(에이전트 112개 · 주장 611건).
결과는 아래 (79)에 정리하고, 여기서는 **LOUIS를 직접 고쳐야 하는 것 하나**를 닫는다.

### 증상

[app-shell-parts](../components/app-shell-parts.md)가 `/archive` 화면을 **네 곳에서 「보관함」**
이라고 적고 있었다 — API 예시 2곳, Content 규칙 1곳, 사이드바 CTA 설명 1곳.

**배포본의 라벨은 「홈」/"Home"이다**(`appNav.archive`). 경로 이름에서 유추한 이름이었다.

이게 나쁜 이유는 그 문서가 **「라벨은 화면의 이름이다」를 규범으로 적어 두었기** 때문이다. 규칙은
맞는데 예시가 틀렸으므로, 규칙을 따를수록 배포본에 없는 이름이 굳는다.

### 조치 — 라벨을 생성물로 만들었다

네 곳을 고치는 것만으로는 같은 일이 또 난다. 라벨은 문서가 소유할 값이 아니라 **제품이 소유한
값**이므로 계기를 세웠다.

`scripts/measure-app-nav-labels.mjs`가 배포본에서 뽑고, 표는 생성 영역이며, 손으로 고치면
카나리아가 잡는다. `verify` 22단계 → **23단계**, 카나리아 20종 → **21종**.

**이 계기를 쓰면서 나도 같은 실수를 했다.** 처음 판에서 경로 대응을 손으로 적었는데,
`analytics`를 `/analytics`라고 적은 것이 틀렸다 — 실제는 `/analytics/youtube`와
`/analytics/instagram` **둘**이고, `explore`는 앱 내비에 **아예 없다**(`exploreComingSoon`만 쓴다).

제품이 `Gnb.tsx:2399`의 `appNavItemLabels`로 **경로 대응을 직접 선언하고 있었다.** 그것을 읽도록
고쳤다. 상수로 적힌 경로(`NODE_CANVAS_HUB_PATH`)는 `lib/app-paths.ts`에서 해결한다.

**오늘 세 번째로 같은 교훈이다 — 유추하지 말고 제품이 선언한 것을 읽어라.**

### 곁가지

- 「경로로 유추 가능」열을 계기가 함께 낸다. 6개 중 **3개가 유추 불가**다.
- 사이드바 바닥 자리는 「홈」과 「업그레이드」가 나눠 쓴다 — 이 구조 주장은 원래 맞았다.
- 생성기가 「홈와」를 출력했다. 한국어 조사는 받침을 봐야 골라진다. 받침 판정을 넣었다.

### Migration

없다. 문서의 라벨 4곳 정정과 계기 추가다.

## 2026-08-21 (77) — 손으로 센 표를 전수 재검했고, 계기가 표를 직접 만들게 했다

(76)에서 「일회성 `git grep`으로 만든 수치가 틀렸다」는 걸 확인했으니, **같은 방식으로 만든 표가
더 있는지** 문서를 뒤졌다. 있었다.

### `product-confirmations.md` §3에서 오류 둘 더

| | 적었던 값 | 실제 |
| --- | --- | --- |
| radius 결손 홀수 | 45회 | **73회** |
| border-width `1.5px` | 6회 | **10회** |

(76)에서 정정한 두 수치가 **이 문서에는 옛 값 그대로 남아 있었다.** 한 곳만 고치고 끝낸 셈이다.

### 표가 순위 중간을 건너뛰었다

수치가 맞아도 **표를 손으로 줄이면서 결손을 「홀수」로 묶은 것**이 사실을 가렸다.

- radius: `14px`(6회)·`18px`(5회)도 토큰이 없다. 홀수가 아니라 안 보였다.
- spacing: `112px`(9회)·`160px`(7회)도 결손이고, `112px`는 표에 넣은 `11px`(8회)보다 **많이 쓰인다.**
- duration: 표가 `320ms` 다음 `150ms`로 뛰는데 사이에 `200ms`(79회)·`220ms`(74회)가 있다.
  결손은 아니지만 **표가 상위 7개처럼 보이는데 아니다.**

### 조치 — 표를 생성물로 바꿨다

수치를 고치는 것만으로는 같은 일이 또 난다. 계기가 표를 직접 만들게 했다.

1. `measure-product-drift.mjs`에 **`topUsed`** 추가 — 덮인 값까지 내놓아야 표 전체를 생성할 수 있다.
2. `build-design-docs.mjs`에 `renderProductDrift()` 추가, `product-confirmations.md`의 §3을
   `GENERATED:product-drift` 영역으로 교체.
3. **변조 카나리아 등록** — 표의 숫자를 손으로 고치면 `verify`가 잡는다. 카나리아 19종 → **20종**.

이 조치가 곧바로 값을 했다. 아래 락 갱신에서 표의 커밋 표기가 낡은 것을 게이트가 먼저 잡았다.

### 제품이 6커밋 앞으로 나갔다 — `ada1b939` → `a9ead58b`

`verify-product-evidence`가 근거 파일 3개의 blob 불일치를 잡았다(`TtsNode` · `VideoEditModal` ·
`VideoNode`). **락이 정확히 이걸 잡으라고 있는 장치다.**

내용을 보니 전부 i18n 문자열 추출이었다(하드코딩 한글 → 메시지 키). 눈으로 본 것을 기계로
확인했다 — 세 파일의 `className`/`style` 집합 해시가 **양쪽에서 동일**하다. 디자인 값 변경 0건.

락을 갱신하고 계기 7종을 전부 다시 쟀다. **측정값은 하나도 안 움직였다** — alpha 73단 3,532회,
drift 5축 분포까지 동일, 브라우저 계측 3종도 커밋 표기 외 무변경. `pnpm verify` 22단계 초록.

### Migration

없다. 수치 정정과 표 생성물화, 그리고 배포본 기준점 이동이다.

## 2026-08-21 (76) — 오늘 주장 12건을 독립 반증했고, 제 수치 둘이 틀렸습니다

오늘 커밋에 적은 실측 수치 12건을 **별도 에이전트가 배포본에서 독립 재현**하게 했습니다. 요약
파일을 읽는 것은 금지하고 원본에서만 세게 했습니다.

**CONFIRMED 7 · REFUTED 5.**

### 제가 틀린 것 둘 — 원인이 같습니다

| 주장 | 적었던 값 | 실제 |
| --- | --- | --- |
| border-width 1px | 111회 | **142회** (총 203회) |
| radius 홀수 5단 | 45회 / 전체 320 | **73회 / 전체 587** |

**둘 다 일회성 `git grep`으로 셌고, 그 명령이 `.ts` 파일을 대상에서 빼먹었습니다.** 게다가
`git grep`은 라인 기반이라 한 줄에 여러 번 나오는 경우를 한 번으로 셉니다.

**`measure-product-drift.mjs`는 파일 전체를 스캔하므로 처음부터 맞게 세고 있었습니다** —
border-width 203회, radius 587회. **계기가 맞고 제 산문이 틀렸습니다.** 두 문서를 정정했습니다.

정정하면서 하나 더 나왔습니다 — radius 결손은 홀수만이 아닙니다. `14px`(6회)·`18px`(5회)은 1px
차가 아니라 **따로 봐야 하는 계단**입니다. 낮게 세다 보니 이것도 안 보였습니다.

### 반증자가 틀린 것 둘

알파 관련 두 건은 **반증자 쪽이 틀렸습니다.** 그들의 패턴이
`rgb(var(--x) / 8%)`(공백)만 잡고 **Tailwind 임의값 `rgb(var(--x)_/_8%)`(밑줄)을 통째로
놓쳤습니다** — 1,054건, 전체의 30%입니다.

직접 재현해 확인했습니다: 공백형 2,478 + Tailwind형 1,054 = **3,532회 · 73단**, 상위 순서도
`100%(419) · 10%(239) · 8%(215) · 25%(208)`로 기록과 일치합니다.

**반증 결과를 그대로 받았으면 맞는 수치를 틀리게 고칠 뻔했습니다.** 이 저장소의 기록에도 같은
사고가 남아 있습니다 — 「게이트 오탐을 믿고 맞는 값을 틀리게 바꿨다」
([Figma 이관 기록](../../migration/figma-transfer/RESUME.md)).

### 나머지

`primitive-188`은 그 시점에는 맞았고 지금 189입니다 — 이후 `border-width/default`를 세웠기
때문입니다. 커밋 기록은 시점의 사실이므로 고치지 않습니다.

CONFIRMED된 7건: `gray-200` G 채널 1 차이 · `globals.css` 바이트 동일(sha256 일치) ·
`--surface-*` 부재 · `180ms` 240회/55파일 · 노드 라이트 재정의 6개뿐 ·
danger 대비 6.08/4.51/1.21 · 램프 67단 전량 참조.

### Migration

없습니다. 수치 정정과 반증 기록입니다.

## 2026-08-21 (75) — 제품이 확인해야 할 것을 한 문서로 모았습니다

토큰 단위를 돌면서 나온 「이 저장소가 단독으로 정할 수 없는 것」이 결정 문서·인계서·플레이북에
흩어져 있었습니다. **흩어져 있으면 제품 쪽에서 무엇을 봐야 하는지 보이지 않습니다.**

[제품 확인 대기 목록](../governance/product-confirmations.md)에 다섯 항목을 근거와 함께 모았습니다.

| # | 무엇 | 왜 막혀 있나 |
| --- | --- | --- |
| 1 | 노드 비활성 핸들의 라이트 값 | 다크를 상속해 **밝은 페이지에 거의 검정 면**이 된다 |
| 2 | `180ms`가 어느 모션인가 | 최다(240회·55파일)인데 무엇이 움직이는지를 알아야 이름이 정해진다 |
| 3 | 제품의 자유값 축을 접을 것인가 | 다섯 축 실측이 매 `verify`마다 갱신된다 |
| 4 | `--palette-gray-200-rgb` 미러 | 같은 색이 소비 경로에 따라 다르게 렌더된다 |
| 5 | 기존 알파 9개 | 3번이 정해지면 제품과 **함께** 접는다 |

각 항목에 **무엇을 정해야 하는가**를 한 줄로 적었습니다. 「확인이 필요하다」로 끝나면 다음 사람이
같은 조사를 다시 합니다.

`governance` 섹션이라 `llms/guidelines.txt`로 나갑니다 — AI 클라이언트도 무엇이 미정인지 압니다.
**미정인 것을 모르면 지어냅니다.**

### Migration

없습니다. 기록만 모았습니다.

## 2026-08-21 (74) — 단위 10. blocked가 풀렸고, 계기가 다섯 번째 축을 잡았습니다

### blocked 해제

`blocked` 사유였던 제품 확인 2건이 (69)와 (73)의 근거로 닫혔습니다.

- 미커밋 `--surface-*` 9개는 **어느 저장소에도 없었습니다** → surface 보강은 대상이 존재하지
  않으므로 미채택으로 닫습니다
- 앱 셸 램프는 `palette-gray-200`의 G를 **238**로 확정했습니다

### spacing도 같은 자국입니다

제품 **43단 1,023회** 중 DS의 23단이 **76.1%**를 덮습니다.

| 결손 | 3px | 5px | 7px | 1px | 9px | 11px | 합 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 사용 | 62 | 42 | 32 | 27 | 26 | 8 | **197** |

**radius와 똑같이 짝수 스케일 사이의 홀수입니다.** DS의 짝수 계단이 이미 촘촘하므로 **승격이
아니라 축소 대상**이고, 접는 것은 제품 변경이라 여기서 하지 않았습니다. `112px`(9회)·`160px`(7회)
같은 큰 값은 레이아웃 상수로 보여 별도 판단이 필요합니다.

### 계기가 값을 했습니다

(72)에서 세운 `measure-product-drift.mjs`에 spacing을 축으로 추가하자 **바로 잡혔습니다.**

```
alpha         73단 / 46.1% ★
radius        24단 / 83.5%
border-width   8단 / 92.1%
spacing       43단 / 76.1%      ← 다섯 번째
duration      58단 / 56.9% ★
```

알파·radius·border-width·duration은 **한 축씩 따로** 발견했습니다. spacing은 계기가 잡았습니다.
축을 하나 더하는 데 정규식 세 줄이면 됐고, 그것이 계기를 세운 이유입니다.

### Migration

없습니다. 기록과 계기의 축이 하나 늘었습니다.

## 2026-08-21 (73) — 단위 9·6. 중립 표면 위의 danger 텍스트가 생겼습니다

### 없던 것

`color-fg-danger`는 `color-bg-danger`와 **쌍으로** 쓰도록 만들어졌고 두 테마에서
값이 서로 뒤바뀝니다. 그래서 **텍스트 색으로만 쓰면 본문색과 구분되지 않습니다** — light 1.21 ·
dark 1.14. Button은 쌍으로 써서 성립하지만 Menu의 danger item이 이 공백을 그대로 밟고 있었습니다.

### 계산해서 골랐습니다

| 테마 | 후보 | 표면 대비 | 메뉴 대비 | 본문색과 차 |
| --- | --- | ---: | ---: | ---: |
| light | *현재 red-900* | 13.68 | 12.65 | **1.21** |
| light | **red-700** | **6.08** | **5.62** | **2.72** |
| dark | *현재 red-100* | 10.17 | — | 1.14 |
| dark | **red-400** | **4.51** | **4.51** | **2.57** |

`red-600`(light 4.15)과 `red-500`(dark 3.70)은 4.5에 미달하고, `red-800`(light)은 대비는 높지만
본문색과의 차가 1.77로 「빨강」으로 읽히지 않습니다. **두 표면 모두 4.5를 넘으면서 본문색과도
구분되는 것은 red-700 / red-400뿐**입니다.

`color-fg-danger-on-surface`를 세웠고 **contrastPairs 두 쌍을 함께 올렸습니다**
(`background-surface`·`background-menu`, 각 4.5). 게이트가 매번 실제 WCAG 계산으로 확인합니다.

### 게이트가 규칙을 하나 가르쳐 줬습니다

처음에 두 쌍에 근거를 `note`로 달았더니 스키마가 거부했습니다 — **`note`는 `minimum`이 4.5 미만인
예외에만 허용되고, 그때는 필수**입니다. 좋은 규칙입니다. 통과하는 쌍에 설명을 달기 시작하면
미달 쌍의 `note`가 가진 무게가 사라집니다. 근거는 이 문서에 남깁니다.

### baseline을 갱신했습니다

`contrastPairs` 변경은 breaking으로 분류되므로 [Releases](../governance/releases.md)의
「의도적 breaking과 baseline 갱신」 절차를 따랐습니다.

```
additive 144 · removal 0 · type 0 · value 0 · aliasTarget 0 · mode 0
contrastPairs 1   ← 의도한 항목
```

**의도하지 않은 breaking이 섞이지 않았습니다.** 기존 12쌍은 손대지 않았고 2쌍이 순증했습니다.

### Migration

`color-fg-danger-on-surface`가 순증했습니다. 기존 `color-fg-danger`는 그대로이며
**쌍으로 쓰는 자리에서는 계속 그것을 씁니다.** 중립 표면 위 텍스트에만 새 토큰을 씁니다.

## 2026-08-21 (72) — 단위 8. 축마다 찾는 대신 전 축을 재는 계기를 세웠습니다

### layer는 차 있습니다

primitive 5 · semantic 5가 이미 있고 `layerOrder`(`content → sticky → popover → modal → critical`)도
서 있습니다. 제품의 z-index는 `9999`·`1400`·`1200`이 섞인 상태지만 **그것을 가져오지 않는 것이
계약**입니다([App Shell](../patterns/app-shell.md)의 Overlay contract). 배열 변경이 필요 없습니다.

### motion에는 구멍이 있습니다

배포본의 `ms` 값을 세니 **58단 1,342회**이고 DS가 덮는 것은 **56.9%**입니다.

| ms | 사용 | 파일 | DS |
| ---: | ---: | ---: | --- |
| **180** | **240** | 55 | **없습니다** |
| 120 | 144 | 51 | `duration-fast` |
| 140 | 139 | 44 | `motion-tooltip-enter` |
| 160 | 109 | 36 | `motion-control-hover` |
| 150 | 68 | 18 | **없습니다** |
| 280 | 44 | 22 | **없습니다** |

**180ms가 240회로 최다인데 어떤 DS 모션도 그 길이를 쓰지 않습니다.** 55개 파일에 퍼져 있어 한
자리의 예외가 아닙니다. 다만 **그것이 어느 역할인지는 무엇이 움직이는지를 봐야 정해집니다** —
길이만 보고 이름을 붙이면 그것이야말로 근거 없는 토큰이 됩니다. 제품 확인이 필요합니다.

### 네 번 같은 자국을 따로따로 찾았습니다

| 축 | 발견 시점 | 자국 |
| --- | --- | --- |
| 알파 | (60) | 73단, 최다값 10%에 토큰 없음 |
| radius | (71) | 홀수 5단 45회 |
| border-width | (71) | 최다값 1px에 토큰 없음 |
| duration | 여기 | 58단, 최다값 180ms에 토큰 없음 |

**넷 다 「값을 직접 쓸 수 있는 축」이고 넷 다 따로 발견됐습니다.** 이 방식으로는 다섯 번째를
놓칩니다.

`scripts/measure-product-drift.mjs`가 네 축을 **한 번에** 재고 `verify-product-drift`가 게이트로
섰습니다(`pnpm verify` 21 → **22단계**).

```
alpha         73단 / 46.1% ★
radius        24단 / 83.5%
border-width   8단 / 92.1%
duration      58단 / 56.9% ★     ★ = 최다 사용값에 토큰이 없음
```

**`topHasToken`이 false면 그 자체로 결함입니다** — 가장 흔한 값을 토큰으로 쓸 수 없다는 뜻이니까요.
`border-width`가 92%인 것은 (71)에서 1px을 세운 결과입니다. 재기 전에는 최다값이 비어 있었습니다.

이 계기는 **고치지 않습니다. 재고 드러냅니다.** 접는 것은 제품 변경이라 사람이 정합니다.

### Migration

없습니다. 계기와 게이트만 늘었습니다.

## 2026-08-21 (71) — 단위 7. 「16개」가 아니라 1개였고, 세 번째 드리프트를 찾았습니다

실측해 보니 세 축의 상태가 서로 달랐습니다. **344 변수.**

### elevation — 결손이 없습니다

semantic 8종(`focus-ring`·`modal`·`popover`·`surface`·`toast`·`menu`·`tooltip`·`upgrade`)과
primitive 11종이 이미 있고, 제품의 그림자 토큰이 그 안에 다 듭니다. 추가할 것이 없습니다.

### border-width — 최다 사용값에 토큰이 없었습니다

| 실사용 | 횟수 | LOUIS |
| --- | ---: | --- |
| **1px** | **142** | **없었습니다** |
| 2px | 25 | `ring` |
| 0.5px | 20 | `hairline` |
| 1.5px | 10 | 없음 |

`border-width-default`(1px)를 primitive·semantic 양쪽에 세웠습니다. `1.5px`(10회)은 `hairline`과
`default` 사이의 드리프트로 보여 올리지 않았습니다.

> **수치 정정.** 처음에 `111 · 18 · 12 · 6`이라고 적었는데 틀렸습니다. 그때 쓴 일회성 `git grep`이
> **`.ts` 파일을 빼먹었고** 라인 기반이라 한 줄에 여러 번 나오는 경우도 놓쳤습니다.
> `measure-product-drift.mjs`는 파일 전체를 스캔하므로 **처음부터 203회로 맞게 세고 있었습니다** —
> 계기가 맞고 산문이 틀렸습니다. 결론(1px이 최다이고 토큰이 없었다)은 그대로입니다.

### radius — 알파와 같은 드리프트입니다

LOUIS의 짝수 스케일(0·2·4·6·8·10·12·16·20·24·full)이 실사용 **587회 중 83.5%**를 덮고 나머지 **약
97회**가 결손입니다.

| 결손 | 7px | 3px | 5px | 1px | 9px | 14px | 18px | 1.5px |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 사용 | 21 | 18 | 15 | 12 | 7 | 6 | 5 | 4 |

**홀수 다섯(1·3·5·7·9)이 73회**로 대부분이고 전부 이웃과 1px 차입니다. 반경에서 1px은 구분되지
않으므로 접는 것이 안전하고 확인할 자리가 없습니다. 다만 **`14px`·`18px`은 1px 차가 아니라 따로
봐야 합니다.** 접는 것은 제품 변경이라 여기서 하지 않았습니다.

> **수치 정정.** 처음에 「홀수 5단 45회 / 전체 320회」라고 적었는데 틀렸습니다. border-width와
> **같은 원인**입니다 — 일회성 `git grep`이 `.ts`를 빼먹고 라인 기반이라 놓쳤습니다.
> 계기는 처음부터 587회로 맞게 세고 있었습니다.

### 같은 자국이 세 축에서 나왔습니다

| 축 | 필요한 스케일 | 실제 |
| --- | --- | --- |
| 알파 | 14단 | **73단** |
| radius | 짝수 11단 | 짝수 + **홀수 5단 45회** |
| border-width | 3단 | 3단 + 1.5·3·4·10px 산발 |

**값을 직접 쓸 수 있는 축마다 같은 방식으로 번져 있습니다.** 알파만의 문제가 아니었습니다.
토큰으로 막지 않으면 축이 늘 때마다 반복됩니다.

### Migration

`border-width-default`가 순증했습니다. 기존 토큰은 그대로입니다.

## 2026-08-21 (70) — 단위 4. 노드 채널 색이 semantic이 됐고, 라이트 결함을 찾았습니다

노드 캔버스의 채널 색을 semantic으로 승격했습니다. **342 변수.**

| 축 | 종수 | 값 |
| --- | ---: | --- |
| `color-node-{ch}-surface` | 6 | 다크 `{ramp}-800` · 라이트 `{ramp}-200` |
| `color-node-{ch}-icon` | 6 | 두 테마 `{ramp}-500` |
| `color-node-{ch}-accent` | 7 | 선택 테두리. video 포함 |

채널 → 램프는 배포본에서 읽은 그대로입니다 — video `blue` · image `mint` · text `yellow` ·
youtube·instagram `red` · audio `pink` · edit `violet`.

### 미결 질문 3을 실측했고, 결과가 나쁩니다

「채널 disabled의 light 값이 없다」가 무슨 뜻인지 재봤습니다. 라이트 오버라이드가 재정의하는 것은
**`--node-handle-bg-{channel}` 하나뿐**이고 나머지 넷은 **다크 값을 그대로 물려받습니다.**

| 축 | 다크 | 라이트 | 판정 |
| --- | --- | --- | --- |
| `handle-bg` | `{ramp}-800` | `{ramp}-200` | 재정의됨 |
| `handle-icon` | `{ramp}-500` | 상속 | 면이 200이라 대비가 성립합니다 |
| **`handle-bg-disabled`** | `{ramp}-900` | **상속** | **라이트 페이지에 거의 검정 면** |
| `handle-icon-disabled` | `{ramp}-700` | 상속 | 그 면 위라서 보이기는 합니다 |

**라이트에서 활성 핸들은 연한 면(200)인데 비활성만 거의 검정(900)이 됩니다.** 비활성이 활성보다
훨씬 눈에 띄는 상태이며 의도로 보기 어렵습니다.

**그래서 절반만 올렸습니다.** 두 테마에 값이 정의된 19종만 승격하고 disabled 12종은 남겼습니다 —
**상속된 값을 정본으로 굳히면 이 결함이 DS 계약이 됩니다.** 제품이 라이트 값을 정하면 올립니다.

### 계층 오염을 기록합니다

`node-*`는 도메인 전용인데 tier가 `primitive`/`semantic` 2단뿐이라 semantic에 들어갑니다.
[DS-D-0010 §3](../governance/decisions/DS-D-0010-token-coverage.md)이 이미 정한 대로이고,
component tier 도입은 컴포넌트 패키지 착수 시 재검토합니다.

### Migration

`@klipse-design/tokens`에 semantic 19종이 순증했습니다. 기존 토큰은 그대로입니다.

## 2026-08-21 (69) — 단위 2와 단위 3이 닫혔습니다. 변수 323개

`DS-P3-014`의 알파 축과 채널 팔레트를 세웠습니다. **258 → 323 변수.**

| 단위 | 추가 | 내역 |
| --- | ---: | --- |
| 2 — 알파 축 | 26 | `ink` 9 · `paper` 10 · `red` 7 |
| 3 — 채널 팔레트 | 39 | mint 8 · yellow 9 · pink 9 · violet 9 · red 4 |

```
[figma-parity] parity OK (변수 323개, collection 3개, style 23개, component 26개,
               미표현 53개 제외, 변조 canary 34종)
```

### (68)에서 정정한 경로가 맞았습니다

「Figma 이전을 끝내야 한다」가 아니라 **parity 원천에 새 토큰이 있으면 된다**는 것이었습니다.

1. 이전 라이브러리(parity 원천)에 65개 적용 — 별칭 누락 0
2. readback의 **Primitive 구간만** 재덤프(188행) — style·component·icon은 손대지 않았습니다
3. `build-figma-snapshot` → 변수 323개
4. parity OK

전면 재덤프였다면 component·icon까지 다시 떠야 했고 실패 위험이 컸습니다. **바뀐 것만 다시 뜨는
것이 맞았습니다.**

### 값의 출처

알파 26개는 `inkLadder` 교차표의 실사용 계단이고, 채널 39개는 **배포본 `globals.css`의 리터럴
hex를 그대로** 가져왔습니다. 지어낸 값이 없습니다. 겹치는 11개가 제품과 일치한다는 것은 (65)에서
확인했습니다.

### 도중에 걸린 것

readback 병합 스크립트에 필터를 빠뜨려 `easing-*`(cubicBezier — Figma 변수로 표현되지 않는 것)에서
죽었습니다. 적용 생성기와 같은 필터(`representation === "variable"`)를 넣어 해결했고, **변수가
아닌 항목 53개가 정확히 제외**됐습니다. 스크립트가 조용히 넘어가지 않고 죽은 것이 다행입니다 —
넘어갔으면 readback에 존재하지 않는 변수가 들어갔을 것입니다.

### 기존 알파 9개는 여전히 그대로입니다

사다리와 어긋나지만 제품이 아직 86%·72%를 쓰고 있어 지금 접으면 DS가 제품과 갈립니다.
**제품이 접힐 때 함께 접습니다.**

### Migration

`@klipse-design/tokens`에 primitive 65개가 순증했습니다. 기존 토큰의 값·이름은 그대로이므로
소비처 변경이 필요 없습니다.

## 2026-08-21 (68) — (66)의 진단이 틀렸습니다. 벽이 훨씬 얕습니다

(66)에서 「Figma 이전을 끝내야 토큰 단위 8개가 열린다」고 적었습니다. **틀렸습니다.**

`verify-figma-parity`가 보는 것은 `figma/snapshot.json`이고, 그것은 `figma/readback.json`의
투영이며, readback은 **이전 라이브러리**를 가리킵니다. 그러니 필요한 것은 둘뿐입니다.

1. **이전 라이브러리에 새 토큰을 적용한다** — `figma/apply-variables.*.js`가 이미 그 경로입니다.
2. **readback의 변수 구간만 다시 뜬다** — style·component·icon은 그 파일에서 바뀌지 않았으므로
   전면 재덤프가 필요 없습니다. 절차는 `build-figma-snapshot.mjs` 헤더 (1)에 코드까지 있습니다.

**component·icon 이전은 별개 트랙이고 기다릴 이유가 없습니다.**

### component는 스냅샷으로 재구성할 수 없습니다

새 파일로 component를 옮기려고 스냅샷을 열었더니 담긴 것이 이렇습니다.

```
variantCount · property 이름/종류 · 바인딩 개수 · 기하 요약(높이·여백 배열)
```

**노드 트리가 없습니다.** 검증용 투영이지 빌드 사양이 아닙니다. 변수와 style은 token proposal에서
파생되지만 **component의 원천은 Figma 파일 자체**입니다.

그래서 새 파일에 component를 세우는 것은 기계적 이전이 아니라 저작 작업입니다
(`figma-generate-library` 계열). 토큰 단위와 묶으면 안 되고, 묶었던 것이 (66)의 오진이었습니다.

### 지금 상태

| | 이전 라이브러리 | 새 파일 |
| --- | --- | --- |
| 변수 258 | ✓ (parity 원천) | ✓ |
| style 23 | ✓ | ✓ |
| component 26 · icon 31 · template 1 | ✓ | 아직 |

토큰 단위를 열려면 **이전 라이브러리에 쓰는 판단**이 필요합니다 — 이전 중인 파일에 값을 더하는
것이라 사람이 정할 일입니다. 새 파일로 parity 원천을 옮기려면 component·icon 저작이 선행됩니다.

### Migration

없습니다. 잘못된 진단을 고쳤습니다.

## 2026-08-21 (67) — style 23개를 새 라이브러리로 옮겼습니다

`scripts/build-figma-styles.mjs` → `figma/apply-styles.js`. 변수와 같은 방식입니다 — 생성기가
token proposal에서 뽑고, 게이트(`verify-figma-styles`)가 드리프트를 잡습니다.
`pnpm verify` 20 → **21단계**.

| 종류 | 수 | 결과 |
| --- | ---: | --- |
| text style | 15 | created 15 · **변수 바인딩 누락 0** |
| effect style | 8 | created 8 |

text style은 `fontSize`·`fontWeight`를 변수에 바인딩합니다. 이름은 `typography-{size}-{weight}`에서
갈라 냅니다 — 마지막 조각이 weight, 나머지가 size입니다(DS-D-0010 §2의 명명 규칙 그대로).

### effect style에는 모드가 없습니다

DTCG shadow는 테마별로 값이 갈리는데 **Figma effect style은 단일 값**입니다. 그래서 **Light를
명시적으로 골랐습니다.**

고르지 않고 첫 모드를 쓰면 Dark가 잡혀 `elevation/menu`의 헤어라인이 `neutral-700`(어두움)으로
들어갑니다 — **라이트 화면에 검은 테두리가 생깁니다.** 스냅샷이 `neutral-300`을 담고 있어
대조에서 드러났습니다.

**다크 그림자는 Figma가 표현하지 못합니다.** 재현 불가로 남깁니다.

### 돌리기 전에 대조했습니다

스냅샷과 **값 140건을 전수 대조해 불일치 0**을 확인한 뒤 적용했습니다. 변수 때와 같은 규율이고,
그 대조가 여기서도 Light/Dark 판단이 맞았는지를 증명했습니다.

되읽기도 통과했습니다 — 15 + 8, 바인딩 누락 0, `elevation/upgrade`의 `INNER_SHADOW`와
`DROP_SHADOW` 구분도 정확합니다.

### 남은 것

**component 26 · icon 31 · template 1.** 그것까지 옮겨야 `readback.json`을 새 파일에서 뜰 수 있고,
그래야 (66)에서 확인한 **토큰 단위 8개가 한꺼번에 열립니다.**

### Migration

없습니다. 생성기와 게이트가 늘었고 token source·package는 그대로입니다.

## 2026-08-21 (66) — 토큰 단위 8개가 전부 같은 곳에 막혀 있습니다

단위 2(알파 26개)와 단위 3(램프 39개)을 각각 **실제로 넣어 보고** 확인했습니다. 토큰을 더하는
단위는 예외 없이 같은 곳에서 멈춥니다.

```
verify-token-gates   OK      토큰 자체는 문제 없습니다
check-token-diff     OK      additive 라 breaking 도 아닙니다
verify-figma-parity  FAIL    변수가 snapshot에 없습니다: …
```

`DS-P3-014`의 10개 단위 중 1(결정)과 5(타이포 재편)는 끝났고 **남은 8개는 전부 토큰을 더하는
단위**입니다. 그래서 8개가 모두 같은 선행 조건에 걸립니다.

**선행 조건은 Figma 라이브러리 이전을 끝내는 것입니다.** 새 파일에 변수 258개는 들어갔지만
style 23 · component 26 · icon 31 · template이 남아 `readback.json`을 새 파일에서 뜰 수 없습니다.
그래서 snapshot이 이전 파일에 묶여 있고, 이전 파일에는 새 토큰이 없습니다.

**순서가 정해졌습니다 — Figma 이전을 먼저 끝냅니다.** 그러면 단위 2·3·4·6·7·8·9·10이 한꺼번에
열립니다. 개별 단위를 하나씩 뚫으려 하면 매번 같은 벽을 만납니다.

### 단위 2 실측 — 26개가 맞습니다

없는 계단을 실사용 근거로 세니 **정확히 26개**입니다. ADR이 추정한 「알파 축 26개」와 일치합니다.

| 램프 | 추가 | 계단 |
| --- | ---: | --- |
| `ink-alpha` | 9 | 4 · 16 · 25 · 30 · 40 · 50 · 60 · 70 · 80 |
| `paper-alpha` | 10 | 4 · 6 · 12 · 25 · 30 · 40 · 50 · 60 · 70 · 80 |
| `red-alpha` | 7 | 6 · 8 · 16 · 20 · 25 · 60 · 80 |

실제로 넣고 `build-tokens`를 돌려 토큰 게이트가 통과하는 것을 확인한 뒤 되돌렸습니다.
**코드는 준비됐고 Figma 이전만 남았습니다.**

`ink`와 `paper`가 14단을 전부 쓴다는 것도 실측으로 확인됐습니다((65)의 교차표). 원칙 6의
「램프는 완결성을 우선한다」를 이 두 램프에 적용하는 근거가 추정이 아니라 데이터입니다.

### 기존 9개는 지금 건드리지 않습니다

기존 알파 primitive 23개 중 9개가 사다리와 어긋납니다. 그러나 **제품이 아직 86%·72%를 쓰고
있어서 지금 접으면 DS가 제품과 갈립니다** — 실측 게이트가 막으려는 바로 그 상태입니다.
**제품이 접힐 때 함께 접습니다.** 그래서 단위 2는 순증으로 남습니다.

### Migration

없습니다. 기록만 갱신했고 token source는 되돌렸습니다.

## 2026-08-21 (65) — 알파 73단은 설계가 아니라 흘러내린 자국이었습니다

(60)에서 제안된 사다리가 실사용과 어긋난다는 것까지 봤습니다. 더 파고들었더니 **문제가 사다리가
아니라 73단 자체**였습니다.

### 증거

- **최다 사용값(10%)조차 전체의 9%**입니다. 상위 14단을 합쳐도 64%입니다.
  설계된 스케일이면 상위 5~6단이 80~90%를 덮습니다.
- 0~86% 사이가 **1~2%p 간격으로 빈틈없이** 차 있어 군집이 갈리지 않습니다. 계단 사이에 빈
  구간이 있어야 스케일인데, 없습니다.
- `1%` · `1.5%` · `2.5%` · `3.5%` · `13%` · `17%` · `31%` · `69%` · `75%` — **각각 한두 곳에서만**
  쓰입니다.

**값이 그때그때 눈대중으로 들어간 자국입니다.**

### 사다리를 다시 정했습니다

```
4 · 6 · 8 · 10 · 12 · 16 · 20 · 25 · 30 · 40 · 50 · 60 · 70 · 80
```

저역 2단위 · 중역 4~5단위 · 고역 10단위입니다. **규칙적인 사다리를 고르지 않았습니다** — 알파는
절대 차이가 아니라 **상대 차이**로 보이기 때문입니다. 5%p가 8%에서는 25%지만 55%에서는 9%입니다.

| 사다리 | 단수 | 상대 15% 이상 이동 |
| --- | ---: | ---: |
| 균등 `5·10·15·20·25·30·40·50·60·70·80` | 11 | 654회 (24%) |
| 제안됐던 `4·8·12·16·24·32·48·56·64·72` | 10 | 683회 (25%) |
| **채택 `4·6·8·10·12·16·20·25·30·40·50·60·70·80`** | 14 | **79회 (3%)** |

「외우기 쉬운 사다리라야 다시 흘러내리지 않는다」고 볼 수도 있습니다. 그러나 **토큰의 요점은
목록에서 고르는 것**이지 숫자를 외워 타이핑하는 것이 아닙니다. 값을 직접 쓰지 못하게 막으면
규칙성 없이도 드리프트는 막힙니다. 그러면 규칙성이 아니라 **충실도**로 고르는 것이 맞습니다.

### 제품을 접는 것이 나머지 절반입니다

접지 않으면 DS만 14단이고 제품은 계속 73단입니다.
[`migration/alpha-consolidation.json`](../../migration/alpha-consolidation.json)에 매핑표와
**사람이 봐야 할 자리**를 냈고 `verify-alpha-consolidation`이 게이트로 섰습니다
(`pnpm verify` 19 → **20단계**).

**1,054회가 이동하고 그중 확인이 필요한 것은 79자리(3%)뿐입니다.**

| 확인 대상 | 자리 | 성격 |
| --- | ---: | --- |
| `5% → 4%` · `3% → 4%` | 76 | 1%p 병합. 그 농도에서는 화면에 보이지 않습니다 |
| `1%` · `1.5%` · `2.5% → 4%` | 3 | **각각 딱 한 곳에서만 쓰인 값.** 의도가 아니라 사고입니다 |

접으면 안 되는 값을 찾으면 스크립트의 `KEEP`에 넣고 다시 생성합니다 — 73개 중에 진짜 의도가
있는 값이 섞여 있을 수 있고, 구분 없이 일괄로 밀면 그것도 부서집니다.

### Migration

없습니다. 제품 변경은 아직 하지 않았고 매핑표와 게이트만 섰습니다.

## 2026-08-21 (64) — 새 라이브러리 파일에 변수 258개를 적용했습니다

`SEJUNKI` 팀에 새 라이브러리 파일(`OlYKERKOkgbxBEEoXGZW2c`)을 만들고 (62)에서 생성한
`figma/apply-variables.*.js`로 변수를 적용했습니다. **쓰는 코드를 생성물로 만든 첫 실사용입니다.**

| 컬렉션 | 변수 | 모드 |
| --- | ---: | --- |
| Klipse Primitive | 123 | Base |
| Klipse Semantic | 75 | Global |
| Klipse Semantic Color | 60 | Light · Dark |
| | **258** | 별칭 105건 해결 |

되읽어 확인했습니다 — `color/action-danger → color/red/500`,
`layout/app-shell-sidebar-width → spacing/280`,
`motion/shell-collapse → 320ms cubic-bezier(0.4, 0, 0.2, 1) delay 0ms`,
그리고 **`font-family/sans`가 빈 문자열이 아닌 전체 스택**입니다. (62)에서 잡았던 배열 처리
버그가 실제로 막혔다는 뜻입니다.

### 적용 중에 결함 하나를 더 잡았습니다

첫 실행에서 이미 넣은 24개 중 **FLOAT 5개만 `unchanged`이고 색 19개가 `updated`로** 나왔습니다.
Figma는 색을 전정밀도로 저장하는데 생성 값은 6자리 반올림이라 **엄격 비교가 매번 다르게** 나온
것입니다. 그대로 두면 idempotent 실행이 항상 `updated`로 보고돼 무엇이 실제로 바뀌었는지 알 수
없습니다. 비교를 엡실론(1e-5)으로 바꿨고, 이후 조각은 전부 `updated 0`으로 나옵니다.

(62)에서 「지금 실행하면 아무것도 바꾸지 않는다」고 적었는데 **보고 기준으로는 그렇지 않았습니다.**
값은 같게 유지됐지만 매번 다시 썼습니다. 지금은 보고도 정확합니다.

### 아직 옮기지 않은 것

**style 23 · component 26 · icon 31 · template**입니다. 그것들을 옮기기 전에 `readback.json`을
새 파일에서 다시 뜨면 snapshot이 그만큼 비어 parity가 하드 실패합니다. **그래서
`readback.json`·`snapshot.json`은 이전 파일을 계속 가리킵니다.** 이전이 끝나야 운영 파일을
바꿉니다.

각 자산도 변수와 같은 방식이 필요합니다 — 생성기와 적용 코드를 만들고, 돌리기 전에 스냅샷과
전수 대조합니다.

### Migration

없습니다. 저장소는 문서와 생성기만 바뀌었고 token source·package는 그대로입니다.

## 2026-08-21 (63) — 앱 셸 램프 값을 확정했습니다. 단위 10의 대기 사유가 없어졌습니다

앱 셸 라이트 램프의 `palette-gray-200`이 hex `#eeeef1`(238 238 241)과 rgb 미러 `238 239 241`로
**G 채널만 어긋나** 값이 미확정이었습니다. **`G = 238`, hex를 정본으로 확정합니다.**

1. **주 소비 경로가 hex입니다.** `var(--palette-gray-200)`은 불투명 면색이고 `-rgb` 미러는 알파
   합성 보조입니다. 램프 단계의 대표값은 면색 쪽입니다.
2. **이웃과 맞습니다.** 앱 셸 램프의 `palette-gray-100`(248 248 249)과 `palette-gray-150`
   (241 241 243)이 둘 다 R=G입니다. 238 238이 그 패턴이고 238 239는 아닙니다.
3. **반대로 골라도 잃는 것이 없습니다.** 차이가 G 채널 1/255이고 알파 합성에서만 나타나며 색차가
   감지 한계 아래입니다.

**제품 쪽 결함은 남습니다** — 미러가 `238 239 241`인 채로 있어 같은 색이 소비 경로에 따라 다르게
렌더됩니다. 제품이 미러를 `238 238 241`로 고치는 것이 정합이고, 그전까지 DS는 238을 씁니다.

이것으로 `DS-P3-014` 단위 10의 **제품 확인 2건이 모두 닫혔습니다**((59)에서 하나, 여기서 하나).
앱 셸 램프 토큰을 추가할 수 있고 목표 B의 앱 셸 라이트 화면 제외도 해제할 수 있습니다.
`DS-D-0010`의 Open questions에 남은 것은 3(채널 disabled의 light 값)뿐입니다.

런타임 DOM 조건(`body:has(...)`)이 light/dark 축으로 표현되지 않는 것은 그대로지만, 그건 원칙 3이
「DOM 상태 스코프는 토큰 축이 아니다」로 이미 정해 둔 사안입니다.

### Migration

없습니다. 결정 기록만 갱신했습니다.

## 2026-08-21 (62) — Figma 변수를 쓰는 경로가 코드가 됐습니다

지금까지 이 저장소는 **읽는 경로만** 기록돼 있었습니다. `build-figma-snapshot.mjs`가 되읽기 절차를
헤더에 적어 뒀지만, 변수를 **쓰는** 코드는 매번 대화에서 즉석으로 만들어졌습니다. 무엇을 적용했는지가
남지 않았고, 단위마다 같은 코드를 다시 쓰게 돼 있었습니다.

`scripts/build-figma-variables.mjs`가 token proposal에서 `figma/apply-variables.js`를 생성합니다.
`figma/inventory-draw.*.js`가 그리는 코드를 생성물로 만든 것과 같은 이유입니다 —
**「손으로 쓰지 않는 경로가 실제로 존재해야 한다」를 쓰기 쪽에도 적용합니다.**

### 돌리기 전에 증명했습니다

생성된 코드를 현재 라이브러리 스냅샷과 전수 대조했습니다.

| 대조 | 결과 |
| --- | --- |
| 변수 이름 | 생성 258 · 스냅샷 258 · **양쪽 차집합 0** |
| 값 (색·수치·문자열·별칭) | **318건 전수 일치, 불일치 0** |

**즉 지금 실행하면 아무것도 바꾸지 않습니다.** idempotent가 주장이 아니라 확인된 사실입니다.
이름으로 찾아 없을 때만 만들므로 변수 ID가 유지되고 기존 바인딩이 끊기지 않습니다.

만드는 과정에서 두 가지를 놓쳤다가 대조로 잡았습니다 — `motion-*` 23개가 `variable-documentation`
표현이라 필터에서 빠졌던 것(전환 복합값을 `320ms cubic-bezier(...) delay 0ms` 문자열로 굳혀 해결),
그리고 `font-family-*`가 배열이라 빈 문자열이 됐던 것입니다.

`verify-figma-variables`가 게이트로 섰습니다 — `pnpm verify` 18 → **19단계**.

### Migration

없습니다. 생성기와 게이트만 늘었고 Figma에는 아직 아무것도 적용하지 않았습니다.

## 2026-08-21 (61) — 채널 램프는 코드가 준비됐고 Figma 쓰기에 막혔습니다

`DS-P3-014` 단위 3(채널 팔레트 40개)을 실측하고 실제로 넣어 봤습니다.

### 실측

제품 accent 램프 **11종 · 정의 67단 · 참조되는 단계 67단**. 미참조 단계가 **0개**라
원칙 6의 「일부 단계가 미참조여도 허용한다」를 적용할 일이 없습니다.

| 램프 | 제품 | LOUIS | 추가 |
| --- | ---: | ---: | ---: |
| mint | 9 | 1 | 8 |
| yellow | 9 | 0 | 9 |
| pink | 9 | 0 | 9 |
| violet | 9 | 0 | 9 |
| red | 9 | 5 | 4 |
| | | | **39** |

**겹치는 11개 토큰의 값이 제품과 전부 일치합니다**(불일치 0). 기존 램프가 제품에서 온 것이 맞다는
확인이고, 추가분도 같은 원천에서 그대로 옵니다. 값이 리터럴 hex라 **정규화 판단이 없습니다** —
단위 2와 성격이 다릅니다.

### 넣어 봤고, Figma에서 막혔습니다

`primitive.color`에 39개를 넣고 `build-tokens`를 돌렸습니다. `verify-token-gates`와
`check-token-diff`(additive)는 **통과**합니다. 막히는 곳은 Figma parity입니다 —
새 변수가 라이브러리에 없으니 게이트가 정확히 그걸 말합니다.

레포를 빨간불로 두지 않으려고 **되돌렸습니다.** 완료에 필요한 것은 라이브러리 파일에 변수 39개
적용 → `readback.json` 재생성 → `build-figma-snapshot`이며, 첫 단계가 사람의 Figma 파일에 대한
쓰기입니다.

### 그리고 「적용 스크립트」가 없습니다

실행 인계서가 「적용 스크립트는 idempotent하며」라고 적고 있지만 `scripts/`에 Figma 쓰기 스크립트가
**존재하지 않습니다.** 지금까지 MCP로 매번 즉석 코드를 실행해 온 것입니다.

**재현 절차가 없다는 뜻입니다.** `build-figma-snapshot.mjs`가 되읽기 절차를 헤더에 적어 둔 것과
대비됩니다 — 읽는 경로는 기록돼 있는데 쓰는 경로는 대화에만 있었습니다. 단위 3 전에 적용 경로를
스크립트로 세우는 편이 낫습니다. 그러지 않으면 같은 코드를 매 단위마다 다시 쓰게 되고 무엇을
썼는지가 남지 않습니다.

### Migration

없습니다. 기록만 갱신했고 token source는 되돌렸습니다.

## 2026-08-21 (60) — 알파 사다리를 세기 전에, 실사용을 셌습니다

`DS-P3-014` 단위 2(알파 축 26개)를 실행하려다 멈췄습니다. **제안된 사다리가 실사용 최다값을
빠뜨립니다.**

### 빈도 데이터가 없었습니다

[DS-D-0010](../governance/decisions/DS-D-0010-token-coverage.md) 원칙 1은 「정의가 아니라 실사용을
승격한다. **승격 근거에는 사용 화면과 빈도를 남긴다**」입니다. 그런데 그 빈도가 저장소에
없었습니다 — 사다리 10단이 어디서 나왔는지 확인할 방법이 없었습니다.

배포본에서 세어 [`migration/product.alpha.json`](../../migration/product.alpha.json)에 넣었습니다.
생성기는 `scripts/measure-product-alpha.mjs`이고 **`verify-product-alpha`가 게이트로 섰습니다**
(`pnpm verify` 17 → 18단계).

**스톱 73단**이 나왔습니다 — 결정 문서의 「제품의 73개 변형」이 현재 배포본에서 그대로
재현됩니다. 토큰 알파 3,532회, rgba 리터럴 296회.

### 그런데 사다리가 어긋납니다

| 실사용 | 횟수 | 제안 사다리에 | 사다리의 이웃 |
| --- | ---: | --- | --- |
| **10%** | **239** | **없음** | 최다 사용인데 이웃도 없습니다 |
| 8% | 215 | 있음 | |
| **25%** | **208** | **없음** | 24% — 실사용 36회 |
| 12% | 203 | 있음 | |
| 6% | 123 | 없음 | 4%(57) · 8%(215) |
| 20% | 110 | 없음 | 16%(68) · 24%(36) |
| **50%** | **74** | **없음** | 48% — 실사용 30회 |

**가장 많이 쓰이는 10%가 사다리에 없고, 25%(208회) 자리에 24%(36회)가, 50%(74회) 자리에
48%(30회)가 들어가 있습니다.** 이대로 정규화하면 최다 사용값들이 반올림됩니다.

「88% 이상은 불투명 잉크로 흡수한다」는 관측은 성립합니다 — 88% 이상이 800회로 전체의 23%입니다.
88% 미만의 진짜 알파는 2,732회이며 64단에 흩어져 있습니다.

**단위 2는 사다리를 다시 정한 뒤 실행합니다.** 실측 없이 정한 사다리를 토큰으로 굳히면
`radius-card`·`elevation-focus-ring`·`sidebar-minimum`과 같은 종류의 부채가 됩니다 — 이름은 그럴듯한데
제품에 근거가 없는 값입니다.

### Migration

없습니다. 게이트 하나와 근거 파일 하나가 늘었고 token source는 그대로입니다.

## 2026-08-21 (59) — 막혀 있던 토큰 확장 blocker 둘 중 하나가 풀렸습니다

`DS-P3-014`(token coverage 확장) 단위 10이 **제품 저장소 확인 2건**에 막혀 있었습니다. 보존 작업
중에 둘 다 실측했고 **하나는 해소, 하나는 질문 하나로 좁혔습니다.**

### 1 — 해소됐습니다. 역이관할 대상이 없습니다

미커밋 `--surface-*`/`--border-*` 9개를 「제품이 역이관하는 방향」으로 두고 있었는데,
**배포본에 그 9개가 존재하지 않습니다.** 구 제품 저장소의 추적되지 않는 작업 트리에만 있었고,
그것도 이관 번들 자신의 패치가 만든 것입니다 — 커밋 HEAD에 0건, 작업 트리에 2곳입니다.

어느 저장소에도 커밋된 적이 없으므로 역이관이 성립하지 않습니다. **미채택으로 닫고 사유를
남깁니다.** 제품에 존재한 적 없는 값입니다.

같은 대조에서 하나 더 나왔습니다 — 구 저장소의 `globals.css` HEAD가 배포본 `origin/main`과
**바이트 단위로 동일**합니다(토큰 358개 대 358개, diff 0줄). **두 저장소가 갈렸다는 전제 자체가
성립하지 않습니다.**

### 2 — 「값 미확정」이 한 단계 한 채널로 좁혀졌습니다

앱 셸 라이트 램프의 값이 미확정이라 재조립 검증에서 제외하고 있었습니다. 네 단계를 전부 재보니
어긋나는 곳은 하나뿐입니다.

| 램프 단계 | 앱 셸 hex | rgb mirror | 판정 |
| --- | --- | --- | --- |
| `palette-gray-100` | `#f8f8f9` → 248 248 249 | `248 248 249` | 일치 |
| `palette-gray-150` | `#f1f1f3` → 241 241 243 | `241 241 243` | 일치 |
| **`palette-gray-200`** | **`#eeeef1` → 238 238 241** | **`238 239 241`** | **G 채널 1 차이** |
| `palette-gray-300` | `#e4e5e9` → 228 229 233 | `228 229 233` | 일치 |

**같은 색이 소비 경로에 따라 다르게 렌더됩니다** — `var(--palette-gray-200)`은 238 238 241,
`rgb(var(--palette-gray-200-rgb) / n%)`은 238 239 241입니다.

램프의 다른 단계에서 규칙을 추론할 수 없습니다(150은 R=G, 300은 R≠G라 양쪽 선례가 있습니다).
**남은 질문은 하나입니다 — 앱 셸 `palette-gray-200`의 G는 238인가 239인가.** 답이 정해지면
단위 10이 열립니다. 그전까지 앱 셸 라이트 화면 제외는 유지합니다.

### Migration

없습니다. 인계서와 플레이북의 blocker 기록만 갱신했습니다.

## 2026-08-21 (58) — 이관 번들을 전량 보존했습니다

라우트별 화면 사양 46개, 22,522줄이 제품 저장소의 **추적되지 않는 작업 트리에만** 있었습니다.
커밋된 적이 없고 사본도 없어서 그 저장소를 정리하면 사라지는 상태였습니다.
[`migration/product-screens/`](../../migration/product-screens/README.md)로 옮겼습니다.

### `design/`이 아니라 `migration/`인 이유

**범위** — 라우트별 화면 사양은 제품 scene이고 규범 카탈로그는 배포 가능한 component 계약을
소유합니다. 섞으면 `llms/*`가 라우트 산문으로 덮입니다.

**권위** — 이 문서들은 코드를 읽어서 쓴 것이고 **브라우저 실측을 거치지 않았습니다.** 원본
작업 기록이 스스로 「computed style·스크린샷 비교는 한 번도 안 했다」고 적어 두었습니다.
`migration/product.*.json` 계열과 같은 무게로 읽으면 안 됩니다. **값이 어긋나면 실측이 이깁니다.**

`design/`으로 올라가는 경로는 **절 단위 증류**입니다 — 값을 실측 하네스로 다시 재고, 규범 문서에
계약으로 적고, 게이트를 붙입니다. (56)의 App Shell 「해결된 치수」가 그렇게 올라간 첫 사례입니다.

### 배포본에 대조했습니다

인용 좌표를 `origin/main`에 일괄 대조했습니다 — **범위 내 3,417 · 범위 밖 59 · 미해결 743.**
**98%가 아직 유효합니다.**

범위 밖 59건은 `10.10`(29) · `10.11`(17) · `10.2`(11) · `10.5`(1) · `10.4`(1)에 몰려 있어,
그 다섯 문서의 좌표는 그대로 믿지 말라고 적었습니다. 이 대조는 좌표가 **존재하는지**만 보며
그 줄이 문서가 말하는 내용인지는 보지 않습니다.

문서화 수준도 실었습니다 — 원본의 「문서만 보고 재구현」 9라운드 결과로 레벨 3이 30개,
레벨 2가 16개입니다. **`§10.10 비디오 에디터`는 9라운드 내내 한 번도 통과하지 못했습니다.**

### 화면 사양 말고도 사본이 없던 것들

같은 이유로 셋을 더 옮겼습니다. 전부 **다른 사본이 없던** 문서입니다.

| 어디로 | 무엇 | 왜 |
| --- | --- | --- |
| [`migration/figma-transfer/`](../../migration/figma-transfer/README.md) | Figma 왕복 기록 22차 · 사양 작성 쪽 중단 기록 · 인계문 | **그리는 쪽이 실제로 막힌 자리**의 기록입니다. 재측정으로는 나오지 않습니다 — 무엇을 재야 하는지 모르니 안 재는 것입니다 |
| [`migration/deck/`](../../migration/deck/README.md) | 1920×1080 장표 판형·여백·마스터 7개 | 서비스 소개서 93장 실측으로 확정된 값입니다. 제품 UI가 아니므로 component 계약과 섞지 않습니다 |
| [`migration/legacy-design-system.md`](../../migration/legacy-design-system.md) | 단일 파일 디자인 문서 4,331줄 | `design/`의 분해된 규범 문서가 이것을 대체합니다 |

`FIGMA-FEEDBACK.md`의 첫 회차 기록이 특히 값집니다 — **「문서가 틀린 것과 없는 것을 구분해서
보고한다. 없는 것보다 틀린 것이 훨씬 나쁘다 — 없으면 코드를 보거나 묻지만, 틀리면 확신을 갖고
잘못 그린다.」** 이 저장소의 불확실 값 명부가 말하는 것과 같습니다.

옮기면서 legacy 문서의 내부 링크 16개를 새 위치에 맞게 고쳤습니다. 게이트가 깨진 링크로
잡아 주었습니다.

### Migration

없습니다. 근거 문서만 늘었고 package API·토큰·CSS·규범 문서는 그대로입니다.

## 2026-08-21 (57) — 셸 형태 A / B를 미결정으로 기록했습니다

제품에 앱 카드를 거는 방식이 **둘**이고 어느 쪽이 정본인지 정해지지 않았습니다.
[App Shell](../patterns/app-shell.md)에 그 사실만 적었고 **한쪽을 고르지 않았습니다.**

| | 형태 A | 형태 B |
| --- | --- | --- |
| 크롬 클래스 | `appMainCardChrome` | `appMainCardChromeSurface` |
| 카드가 걸리는 요소 | `<main>` 자신 | `<main>` 바깥 패널 div |
| 접힘 전환 대상 | `margin-left` **와** `width` | `margin-left` **만** |

곡선은 양쪽 다 `320ms cubic-bezier(0.4, 0, 0.2, 1)`로 같습니다 — 갈리는 것은 곡선이 아니라
**무엇이 움직이는가**입니다.

**소비처 수가 비슷해서 한쪽만 그리면 나머지 절반이 시스템 밖이 됩니다.** A가 직접 5곳, B가
직접 5곳에 모듈 경유 5곳입니다. 그리고 그 「모듈 경유 5곳」이 함정입니다 — `ExploreScene` ·
`HighlightScene` · `HighlightProjectScene` · `SettingsScene` · `SubscriptionScene`이
카드는 `myPageSceneStyles`에서, 나머지 부품은 `appHomeSceneStyles`에서 가져옵니다.
**import 목록만 보면 계열이 판정되지 않습니다.**

`AppShell`의 `variant`(`page` · `workspace`)는 **다른 축**이라는 것도 적었습니다. `variant`는
스크롤 소유를 가르고 A/B는 카드가 걸리는 요소를 가릅니다. 같은 것으로 읽고 매핑하면 한쪽
계열이 조용히 사라집니다.

옮기는 쪽은 그리려는 화면이 어느 계열인지 표에서 확인하고, 표에 없으면 「판정 불가」로
보고합니다. 결정이 서면 그 절을 결정 기록으로 바꿉니다.

### Migration

없습니다. 문서만 바뀌었습니다.

## 2026-08-21 (56) — App Shell 패턴이 해결된 치수를 갖습니다

### 값은 있었는데 문서에 닿지 않았습니다

`layout-app-shell-*` 여덟과 `motion-shell-collapse`는 P2에서 이미 섰습니다. 그런데
[App Shell](../patterns/app-shell.md)에는 **px 수치가 0개**였고, 그래서 `llms/patterns.txt`에도
0개였습니다. 그 파일이 AI 클라이언트가 화면을 조립할 때 읽는 것입니다.

**계약을 관계로 쓰는 것과, 옮기는 사람에게 값을 안 주는 것은 다른 일입니다.** 코드 소비자는
변수를 참조하면 되지만 Figma는 변수를 바인딩할 수 없습니다. 값이 없으면 눈대중으로 재거나
지어내고, 그것을 잡아 주는 장치는 없습니다.

`design/patterns/app-shell.md` 200줄 · px 0개 → **257줄 · px 22개**.

### 표는 생성됩니다

`packages/tokens/generated/tokens.json`에서 뽑아 `<!-- GENERATED:app-shell-geometry -->` 구역에
씁니다. 손으로 적지 않으므로 토큰이 바뀌면 따라오고, 어긋나면 `check-design-docs`가 실패합니다.
`design/README.md`·`patterns/README.md`의 진행판과 같은 장치입니다.

값의 **의미**는 생성하지 않습니다 — 토큰에 description이 없어서, 각 값이 지배하는 자리는
산문 표로 따로 적고 제품 근거를 함께 답니다.

### 없는 것을 없다고 적었습니다

Figma로 옮길 때 LOUIS가 값을 주지 못하는 축 다섯을 표로 명시했습니다 — `--app-gnb-safe-top` ·
`--app-gnb-main-inline-padding-end` · `--app-gnb-rail-padding-bottom` · `--app-shell-min-width` ·
compact 레일 폭. **지어내지 말고 제품을 인용하라**고 적었고 데스크톱/≤719px 값과 근거 줄을
함께 실었습니다.

**`outer-gap`이 왜 부분 대응인지도 적었습니다.** 제품에 12px 관계가 상·우·하 셋 있는데
compact에서 상단만 유지되고 우측은 16, 하단은 0으로 갈라집니다. 하나의 토큰으로 셋을 덮을 수
없다는 [DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md)의 「부분」 판정이
그 뜻입니다.

카드 표면(반경 · 글래스 링 · 하단 페이드 20px)은 제품의 레이어 밖 전역 클래스가 소유하며
아직 DS 계약이 없다는 것도 적었습니다.

### Migration

없습니다. 문서와 생성기만 바뀌었고 package API·토큰·CSS는 그대로입니다.

## 2026-08-21 (55) — 제품을 읽을 때 틀리는 자리를 규범으로 올렸습니다

### 새로 안 것이 아니라, 읽는 자리로 옮긴 것입니다

아래 셋은 이미 겪은 것입니다. ①은 (54)에서 탐침을 고치며 찾았고, ③의 램프 재매핑도 같은 날
들어왔습니다. 문제는 **그 기록이 겪은 컴포넌트 문서와 이 변경기록 안에만 있었다**는 것입니다.
다른 컴포넌트를 그리는 사람은 그것을 읽을 자리가 없었습니다.

[제품을 읽을 때 틀리는 자리](../foundations/product-reading-traps.md)가 이제 일반 규칙으로
소유합니다. `foundations` 섹션이라 `llms/foundations.txt`로 나가며, AI 클라이언트가 가장 먼저
읽는 파일입니다.

**규칙은 하나입니다 — 선언이 아니라 렌더된 값을 값으로 삼습니다.**

| 항목 | 무엇이 틀리나 |
| --- | --- |
| ① 다른 클래스를 덮는 규칙이 실제 기본값 | Tailwind가 소스 스캔으로 내보내므로 배리언트 상수의 `:not(&)` 규칙이 **항상 존재**합니다. 업그레이드 버튼의 정의는 mint인데 배포 화면은 검정/흰색입니다 |
| ② 토큰 이름이 종류를 뜻하지 않음 | `--glass-dropdown-frame`은 드롭섀도우가 아닙니다. **5겹이고 그중 둘이 `inset` 베벨**입니다. 한 겹으로 읽으면 안쪽 베벨이 통째로 빠집니다 |
| ③ 두 면이 같은 색일 때 경계는 색이 아님 | 라이트에서 페이지 바닥과 앱 카드 면이 **둘 다 `#f1f1f3`**입니다. 면 색으로 카드를 찾으면 카드가 통째로 빠집니다 |
| ④ 어느 브랜치를 읽는지가 값을 바꿈 | **새로 찾았습니다.** 아래 참조 |

### ④ — 이 문서를 쓰다가 제가 빠진 함정입니다

제품 저장소의 로컬 체크아웃이 `origin/main`이라는 보장이 없습니다. 기능 브랜치에 있으면 같은
파일이 다른 내용이고, **줄 번호와 토큰 이름이 함께 어긋납니다.**

실측: `globals.css`가 `origin/main`과 `origin/design`에서 토큰 **358개 대 354개**로 다르고,
`--glass-dropdown-frame`·`--glass-bevel-*`의 존재 여부가 갈립니다. `Gnb.tsx`는 인용 좌표가
8~10줄씩 밀립니다.

작업 트리를 읽지 말고 `git show origin/main:<path>`로 읽습니다. 읽은 뒤 blob 해시를
[product-evidence.lock.json](../../migration/product-evidence.lock.json)과 대조합니다 —
`verify-product-evidence`가 같은 일을 합니다.

### 재대조에서 정정된 것

옮기기 전에 네 항목을 전부 `origin/main`에 다시 댔고, 두 가지가 틀린 채 들어올 뻔했습니다.

- **`--surface-page` 등 역할 토큰 9개는 배포본에 없습니다.** 어느 제품 저장소에도 커밋된 적이
  없는 값이었습니다. ③의 면 사다리에서 해당 행을 뺐습니다.
- **`--glass-dropdown-frame`은 "헤어라인 링"이 아닙니다.** 5겹 중 셋이 blur 0의 링·좌우 림,
  둘이 `inset` 베벨입니다. 원본 기록보다 정확해졌습니다.

### Figma로 그대로 옮길 수 없는 것

[Figma Sync Governance](../governance/figma-sync.md)에 절을 추가했습니다. `backdrop-filter`
**65개 파일** · 그라디언트 마스크 **23개 파일** · 테마를 따라가지 않는 `--dropdown-ambient-shadow` ·
`@layer` 밖 규칙의 우선순위. **근사치를 지어내지 말고 `재현 불가`로 표시합니다.**

### Migration

없습니다. 문서와 카탈로그만 바뀌었고 package API·토큰·CSS는 그대로입니다.

## 2026-08-19 (54) — 진행률이 섰습니다. 그리고 대조가 세 번 더 깊어졌습니다

### Progress — 제품에 없던 계약을 DS가 정했습니다

`ProgressBar`와 `ProgressRing`이 섰습니다. 오래 막혀 있던 이유는 **제품에 옮겨 올 접근성 계약이
없었기** 때문입니다 — 배포본 전체에 `role="progressbar"`가 1곳, `<progress>`가 0곳입니다.
없는 것을 기다리면 영원히 막히므로 DS가 정했습니다([DS-D-0022](../governance/decisions/DS-D-0022-determinate-progress-a11y.md)).

- **값을 갖는 것은 트랙이고 채움은 장식입니다.** 채움에 `role`을 걸면 폭이 0일 때 이름째 사라집니다.
- **indeterminate는 `aria-valuenow`를 넣지 않습니다.** 0은 "0% 완료"로 읽히고, 그것은 "얼마나
  걸릴지 모른다"와 다른 말입니다.
- **이름은 소비처가 줍니다.** "진행률"은 무엇의 진행률인지 말하지 않습니다. 없으면 개발 중에
  경고합니다.
- **indeterminate가 폭을 옮기지 않습니다.** loop이 허용하는 property는 opacity·rotate·
  background-position 셋이라(DS-D-0016) 면 그라디언트를 흘립니다 — Skeleton과 같은 기법입니다.

기하는 제품 셋이 합의하는 축만 옮겼습니다(높이 6 · 알약 · 최대 폭 320). 색은 셋이 다 달라 DS가
골랐습니다. 링은 다릅니다 — 제품 정본이 하나뿐이라 두께 2 · 간격 2 · 색을 그대로 옮겼고,
**지름을 계산하는 대신 padding으로 만들어** 내용이 커지면 따라옵니다.

### 대조가 세 번 더 깊어졌습니다

앞선 대조가 놓치던 것 셋을 찾았습니다. 셋 다 **게이트는 초록인데 값은 틀린** 종류입니다.

**① 탐침이 쓴 클래스만 컴파일하고 있었습니다.** 제품에는 형제 상수에 선언되어 이 요소를 겨누는
규칙이 있습니다 — 업그레이드 버튼이 그렇습니다. 그 상수를 컴파일하지 않으니 규칙이 스타일시트에
없었고, 제품에 존재하지 않는 mint를 재고 있었습니다. 실제 배포본은 **반전 solid pill**입니다.

**② hover 값은 아예 못 재고 있었습니다.** 이제 스타일시트에서 이 요소를 겨누는 `:hover` 규칙을
모아 특이도·소스 순서대로 얹고 계산값을 읽습니다.

**③ 사이드바가 화면에 있다는 사실 자체가 색을 바꿉니다.** 배포본이 `body:has()`로 라이트 팔레트를
한 단계 밝게 재매핑합니다. 그 표식이 없어 CTA의 라이트 전경을 한 단계 어둡게 재고 있었습니다.

### 그래서 달라진 것

| 컴포넌트 | 무엇이 | 어떻게 |
| --- | --- | --- |
| `SidebarCta` | 색 | mint 16% → **반전 solid pill**(테마 반전) |
| `SidebarCta` | `current` | **새 prop.** `aria-current="page"`가 선택을 소유합니다 |
| `SidebarCta` | 접힘 라벨 | 폭 0으로 지우던 것 → **54px 말줄임 · 12px** |
| `SidebarCta` | 그림자 | 없던 것 → `elevation-upgrade` |
| `SidebarBrand` | 행 높이 · 마크 | 24 → **40**, 마크 레일 28 신설 |
| `SidebarNavItem` | 좌우 여백 | 8 → **4** (레일 12 + 행 4 = 본문 16) |
| `AppTopBar` | 제목 · 선행 간격 | 14 → **16**, 8 → **4** |
| `EmptyState` | 액션 간격 | 8 → **12** |
| `ProjectCard` | 오버레이 모서리 | 없던 것 → 아래 두 모서리를 직접 깎습니다 |
| `ProjectCard` | 진입 이동량 | 8px → **18px** |
| `BannerCarousel` | 높이 · 스크림 | 240 → **360**, 스크림이 **글자 위에 칠해지던 것**을 고쳤습니다 |

마지막 것이 가장 컸습니다. 스크림이 `::after`이고 콘텐츠와 둘 다 positioned·z-index 없음이라
트리 순서대로 칠해져 **제목과 설명 위에 덮였습니다.** 규범 문서는 "결과는 같다"고 단언하고
있었는데 같지 않았습니다.

### Migration

- `SidebarCta`에 `current`가 생겼습니다. 기본값 `false`라 기존 호출부는 그대로 둡니다.
- `SidebarCta`의 접힘 라벨이 더 이상 사라지지 않습니다. 접힌 레일 폭을 계산하는 호출부는
  라벨이 최대 54px을 차지한다는 것을 감안하세요.
- `BannerCarousel`의 사진은 이제 `--louis-banner-image`로 들어갑니다. `backgroundImage`를 직접
  인라인으로 넣던 호출부가 있다면 스크림 레이어를 덮게 되므로 바꿔야 합니다.
- mint 토큰이 사라졌다가 링의 색으로 다시 섰습니다. `color-bg-upgrade` 계열을 직접 읽던
  호출부는 값이 바뀐 것을 확인하세요.

## 2026-08-18 (53) — 눈에 보이는 것을 재기 시작합니다

owner가 스크린샷으로 셋을 짚었습니다. 셋 다 **기하 계약은 통과하는데 눈에는 틀린** 것이었습니다.

### ① 체크가 왼쪽으로 쏠려 있었습니다

체크 표식은 **−45° 회전한 5×9 사각형**입니다. 그 상자를 20px 박스 가운데 두면 회전 때문에 실제
차지 영역이 **4.9px 왼쪽, 1.5px 위**로 갑니다. 상자는 가운데인데 눈에는 쏠려 보입니다.

레이아웃 상자가 아니라 **회전을 반영한 실제 차지 영역**으로 다시 맞췄습니다.
`absoluteRenderBounds`가 회전한 획 전용 도형에서 `null`이라, 그 경우 `absoluteBoundingBox`로
대체합니다.

### ② variant가 딱 붙어 한 덩어리로 읽혔습니다

`SidebarCta`의 접힘·펼침 두 variant가 간격 없이 나란히 있어 **"플러스가 둘 달린 버튼"**처럼
보였습니다. `combineAsVariants`가 전부 (0,0)에 쌓는데 벌려 놓지 않았습니다.

19개 세트를 축 개수에 맞춰 격자로 다시 폈습니다.

### ③ 배너 컨트롤이 회색 덩어리로 보였습니다

컨트롤은 **사진 위에 뜨는 것**입니다. 미리보기에 사진이 없으니 흰 글리프가 밝은 면 위에 놓여
보이지 않았습니다 — 컴포넌트가 아니라 **놓인 자리가 거짓**이었습니다. 톤별 사진 자리를 깔았습니다.

같은 김에 화살표 글리프도 렌더 경계로 다시 맞췄습니다. caret은 도형이 자기 viewBox 안에서
치우쳐 있어 0.5px 어긋나 있었습니다.

### 게이트 둘

- `compareOverflow` — 보이는 자손이 프레임 밖으로 나가는지
- `compareOpticalCentering` — 정사각 슬롯 안 표식이 **눈으로** 중앙인지

둘 다 탐지력을 확인했습니다.

**그전까지 게이트는 숫자만 봤습니다.** 폭·높이·반경이 맞으면 통과였고, 그래서 체크가 쏠려 있어도
variant가 붙어 있어도 초록이었습니다.

## 2026-08-18 (52) — 제품을 렌더해서 잽니다 — 소스 읽기를 처음으로 벗어납니다

owner 질문: **"지금 피그마에 해놓은 것들이 정말 내 배포환경의 디자인이라고? 100% 확신할 수 있어?"**

**아니요.** 그리고 왜 아닌지가 숫자로 나옵니다.

| 상태 | 축 |
| --- | ---: |
| `adopted` + 포인터 — **기계가 매번 대조** | **12** |
| `adopted` (포인터 없음) — 사람이 "같다"고 적음 | 37 |
| `accepted-deviation` — 의도적으로 다름 | 77 |
| `no-canon` — 제품에 정본 없음 | 61 |

그리고 대조 범위가 **컴포넌트 12/20**입니다. ProjectCard · Badge · EmptyState · Spinner ·
Skeleton · BannerCarousel · app-shell-parts는 제품 대조 축이 **아예 없었습니다.**

결정적으로 `screen-inventory.md`가 스스로 적어 뒀습니다 — *"브라우저 실측 렌더를 하지 않았다."*
**제품 화면을 띄워 픽셀을 잰 적이 한 번도 없었습니다.**

### 제품을 렌더했습니다

제품 서버는 띄우지 않습니다(`.env.local`이 실제 서비스에 붙습니다). 대신 **제품의 클래스
문자열을 제품 자신의 Tailwind로 컴파일**하고, 제품 CSS와 함께 빈 문서에 올려 브라우저가 계산한
값을 읽습니다. 클래스는 제품 소스에서 그대로 옮기고 출처를 각 탐침에 적습니다.

### 결과 — Button과 ProjectCard는 정확히 맞았습니다

| 축 | 제품(렌더) | DS | Figma |
| --- | --- | --- | --- |
| Button md 높이·패딩·반경·gap | 40 · 16 · 12 · 8 | 같음 | 같음 |
| Button sm | 32 · 12 · 12 · 4 · min 48 | 같음 | 같음 |
| ProjectCard 반경 | 16 | 16 | 16 |
| 카드 오버레이 padding · 비율 | 16 · 30% | 16 · 0.3 | 같음 |
| 프로젝트 그리드 gap · 열 | 12 · 4 | 12 · 4 | 같음 |

**처음으로 렌더해서 확인한 결과이고, 맞았습니다.**

### 게이트

`verify-product-components`가 10축을 **브라우저가 잰 제품 값과 DS 값** 사이에서 대조합니다.
사람이 옮겨 적은 값이 실제와 다르면 실패합니다 — DS의 padding을 18로 바꿔 보니
*"제품이 렌더한 값은 16인데 DS는 18입니다"*로 잡힙니다.

`pnpm verify`가 **13단계**가 됐습니다.

### 남은 것을 분명히 합니다

이 게이트가 덮는 것은 **10축**입니다. 187축 중 나머지는 여전히 소스 읽기이고, `no-canon` 61축은
제품에 정본이 아예 없어 대조할 대상이 없습니다. **탐침을 늘리는 만큼만 확신이 늘어납니다.**

## 2026-08-18 (51) — 이미 만들어 둔 컴포넌트를 전수로 재고 고칩니다

owner 지적: **"피그마에 이미 만들어둔 컴포넌트들도 존나 병신같아."** 눈으로 세지 않고 전수로
쟀습니다 — 세트마다 자손이 프레임 밖으로 나가는지, variant가 서로 구별되는지.

### 제 첫 측정이 오탐이었습니다

*"Button 40 variant 전부 넘침"*이 나와 auto-layout으로 바꾸려 했는데, **Button은 원래 멀쩡했습니다.**
이미 auto-layout이고 아이콘을 켜면 68 → 96으로 늘어납니다. 제 검사가 **숨은 자식의 낡은 좌표**를
세고 있었습니다.

*"Button 34개가 구별 안 됨"*도 절반이 오탐이었습니다. `primary/Disabled`와 `danger/Disabled`가
같은 그림인 것은 **코드가 그렇게 정해 뒀기 때문**입니다 — `button.css`가 두 variant의 disabled를
`:where([data-variant="primary"], [data-variant="danger"])`로 명시적으로 묶습니다. Figma가 코드를
정확히 따르고 있었습니다.

**보이는 자손만 세고 코드와 대조하니 진짜 결함은 셋이었습니다.**

### ① Tooltip의 Side 축이 아무것도 안 바꿨습니다

네 variant 모두 자손이 `Label` 하나뿐 — **화살표가 아예 없었습니다.** 계약에도
*"표면 시각은 네 방향이 같다"*고 적혀 있었는데, 그러면 **그 축은 거짓말입니다.** 방향마다 다른
삼각형을 말풍선 바깥에 붙였습니다.

### ② TextField의 focus 링이 잘려 있었습니다

링은 박스 바깥 4px(outline 2 + offset 2)에 있는데 프레임이 320이라 **양쪽 4px씩 잘렸습니다** —
디자이너에게 offset이 0으로 보였습니다.

프레임에 좌우 여백 4를 주고 328로 넓혔습니다. **링을 안으로 당기지 않은 이유**는 그러면 offset이
거짓이 되기 때문입니다 — 대신 내용을 좁혔습니다.

세로 auto-layout이라 Box가 폭을 채워서, 처음 두 번의 시도(프레임만 넓히기, 자손 경계로 다시 잡기)가
모두 실패했습니다. 여백으로 푸는 것이 답이었습니다.

### ③ 캐러셀 컨트롤이 프레임 밖에 있었습니다

절대 좌표로 놓았는데 계산이 어긋나 있었습니다.

### 게이트: 넘치는 자손

`compareOverflow`가 보이는 자손이 프레임 밖으로 나가는지 봅니다. 화살표처럼 **일부러 밖에 붙는
것**은 `outsideParts`로 선언합니다 — 선언 없이 나가면 실패합니다. 탐지력을 확인했습니다.

## 2026-08-18 (50) — Figma가 코드에 뒤처져 있었습니다

owner 지적: **"피그마쪽은 아주 처참하네."** 맞습니다. 최근 커밋 여러 개가 **코드만** 이었고
Figma는 그대로였습니다.

재보니 코드 공개 심볼 63 대 Figma component set 20이었습니다. 대부분은 합성 부품(`DialogTitle` ·
`ProjectCardMedia` 등)이라 세트가 없는 것이 맞지만, **진짜 빚이 다섯** 있었습니다 —
`SidebarBrand` · `SidebarCta` · `Skeleton` · App Shell 패턴 · ProjectCard의 더보기.

### 다섯을 전부 세웠습니다

| 만든 것 | 내용 |
| --- | --- |
| `SidebarBrand` | Collapsed 2 variant. 접히면 워드마크가 없어진다 |
| `SidebarCta` | Collapsed 2 variant. 아이콘 + 라벨 |
| `Skeleton` | Shape 3(text · block · circle) |
| **Patterns 페이지**(신설) | App Shell 골격 — 레일 · 상단 크롬 · scroll root에 이름표 |
| ProjectCard의 `More` | 32×32, media 색 |

파일 구조가 **Cover → Foundations → Components → Patterns → Templates** 다섯 페이지가 됐습니다.
패턴이 Figma에 처음 나타납니다.

### 게이트가 이미 반쪽을 막고 있었습니다

세트를 만들자마자 *"계약에 없는 component set이 있습니다"*로 세 번 막혔습니다. **Figma에만 있고
계약이 없는 길은 원래 막혀 있었습니다.** 반대 방향 — 코드에만 있고 Figma가 없는 것 — 은 막혀
있지 않았고, 그것이 이번에 벌어진 이유입니다.

### 계약을 두 군데 넓혔습니다

**`optional` 자손** — 사이드바가 접히면 워드마크와 라벨이 없어집니다. variant마다 자손이 다른 것이
계약이므로 선언할 자리를 만들었습니다. 다만 **선언만 해 두고 근거 값이 남아 있으면 실패**합니다 —
"있어야 하는데 빠진 것"과 구분되지 않기 때문입니다. 값을 남겨 보니 잡힙니다.

**`sizeKeys`** — Skeleton의 `base`는 색 계약(알파)만 갖고 기하가 없습니다. Figma는 흐름을 못 그려
정지 shape 세 벌만 있고요. 기하를 대조할 키를 따로 선언하게 했습니다.

Figma component 20 → **23**. 변수 235.

## 2026-08-18 (49) — ProjectCard 상호작용 축 — 미등록 14건이 또 닫힙니다

앱 셸에 이어 두 번째로 큰 묶음입니다. hover 더보기 · 인라인 이름 변경 · 진입 stagger · 우클릭
메뉴 · hover 베벨이 **ProjectCard 하나의 상호작용 축**이었습니다.

### 셋으로 닫힙니다

| 부품 | 배포본 실측 |
| --- | --- |
| 진입 stagger | `560ms cubic-bezier(0.23, 1, 0.32, 1)` · 항목당 **36ms** |
| `ProjectCardMore` | 32×32 · `media-control-*` 색 · 위 8 오른쪽 8 |
| `ProjectCardRename` | 크롬 없음 · 초점 표시만 |

### 진입 순서를 카드가 갖지 않습니다

카드는 **자기 순서를 알 방법이 없고**, 알아도 그리드가 다시 정렬되면 틀립니다. 그리고 스크롤로
더 불러온 카드에 0부터 다시 주면 **이미 있던 카드가 함께 튑니다.** 그래서 `enterIndex`를 소비처가
줍니다 — 안 주면 애니메이션하지 않습니다.

### 더보기 버튼이 media 색인 이유

**면이 사진입니다.** 테마 색이면 밝은 썸네일 위에서 흰 버튼이 사라집니다. 오늘 캐러셀을 위해 세운
`color-media-control-*`이 여기서 두 번째 소비처를 얻었습니다.

### `:focus-visible`이 아니라 `:focus-within`입니다

처음에 `:focus-visible`로 드러내게 했더니 **Tab으로 초점을 줘도 안 보였습니다.** 브라우저
heuristic에 따라 갈리는데, 숨은 컨트롤에서 그것은 **닿을 수 없다는 뜻**입니다. 카드 안 어디든
초점이 들어오면 드러나게 바꿨고, 초점 링 자체는 `:focus-visible`이 소유합니다.

**reduced-motion에서는 항상 보입니다.** 움직임을 줄여 달라고 한 사람에게 hover로만 드러나는
컨트롤은 찾기 어렵습니다.

### 테스트가 전환을 드러냈습니다

초점 직후 `opacity`를 읽으니 0이었습니다 — **160ms 전환 중의 값**이었습니다. `expect.poll`로
끝날 때까지 기다리도록 고쳤습니다.

### 저작 게이트가 `calc`를 막았습니다

`calc(var(...) * 36ms)`의 공백이 **전역 선택자 패턴(`\s*\s`)**에 걸렸습니다. CSS는 공백 없이도
같게 읽으므로 `)*36ms`로 붙이고 이유를 주석에 남겼습니다.

테스트 726 → **738**. Figma 변수 233 → **235**.

## 2026-08-18 (48) — App Shell composition이 섰습니다 — 미등록 14건이 함께 닫힙니다

전수 검증이 84건을 주제로 묶으니 **앱 셸이 14건으로 가장 컸습니다.** 그런데 그 14건은 서로 다른
부품이 아니라 **같은 것이 화면마다 다른 이름으로 잡힌 것**이었습니다 — `app-shell-composition` ·
`app-shell-page-frame` · `main-card-chrome-surface` · `in-card-header-slot` ·
`top-chrome-portal-slot` 등. 여덟 화면이 각자 *"셸 조립이 없다"*를 보고한 것입니다.

**패턴 하나가 서면 14건이 함께 닫힙니다.** 그래서 이것부터 했습니다.

### 규범이 이미 답을 갖고 있었습니다

`app-shell.md`의 layout contract를 그대로 옮겼습니다.

| 계약 | 구현 |
| --- | --- |
| 자리 예약 | 레일이 `absolute`여도 본문이 **같은 상태 원천**으로 `padding-inline-start`를 잡는다 |
| 전환 | offset과 폭이 `motion-shell-collapse` 하나를 쓴다 |
| scroll root | 하나. 셸은 `overflow: hidden` |
| 상단 크롬 | scroll root **안에** sticky, 본문과 같은 좌우 inset 원천 |
| compact | 예약 0 · drawer · scrim · 뒤 콘텐츠 `inert` |
| 건너뛰기 링크 | anatomy의 첫 항목 |

**offset과 폭을 따로 지연시키지 않는 이유**를 코드 주석에 적었습니다 — 하나만 늦으면 전환 중에
겹치는 프레임이 생깁니다. 규범이 *"따로 지연시키지 않는다"*고 적어 둔 것이 그 뜻입니다.

**`page`와 `workspace`를 한 composition에 둡니다.** 가르면 `<main>`과 시각 panel의 소유권이
variant마다 달라지고, 그것이 규범이 금지하는 것입니다.

### 테스트가 compact를 드러냈습니다

"접히면 본문이 넓어진다"가 실패했습니다 — 양쪽 1200이었습니다. **테스트 뷰포트가 720px 미만이라
compact 분기로 갔고, 거기서는 예약이 0이라 접힘이 무의미**했습니다.

테스트를 문맥에 따라 갈랐습니다. compact에서는 예약이 0인 것이 계약이고, regular에서는 280 →
collapsed로 줄어드는 것이 계약입니다. **둘 다 지금 확인됩니다.**

### 남긴 것

`app-shell` 패턴이 `web: not-ready` → **`partial`**입니다. 남은 것도 적었습니다 — **focus trap
자체와 scroll lock은 아직 없습니다.** 뒤를 `inert`로 죽이는 것과 초점을 가두는 것은 다른 일이고,
규범의 blocker 문장을 그렇게 고쳤습니다.

테스트 710 → **726**.

## 2026-08-18 (47) — 사이드바 부품 둘을 세웁니다

홈 템플릿을 내리게 만든 원인 넷 중 둘입니다 — **브랜드 행**과 **하단 업그레이드 CTA**.
`app-shell-parts`에 붙였습니다. 사이드바는 부품 모음이 아니라 하나의 조립이기 때문입니다.

### 접힘은 폭입니다

워드마크와 라벨의 `max-inline-size`가 0으로 줄어들며 잘립니다. 폭이 상태이므로 `layout-change`
lifecycle이고, 값은 **`motion-shell-collapse`(320ms)**입니다.

**캐러셀 점의 `motion-layout-change`는 220ms입니다.** 곡선은 `cubic-bezier(0.4, 0, 0.2, 1)`로
같고 지속만 다릅니다 — 제품 실측이 그렇고, 하나로 뭉치면 둘 중 하나가 틀린 값을 씁니다. 등록부에
미리 적어 둔 판정을 그대로 적용했습니다.

### 접혀도 글자를 지우지 않습니다

`max-inline-size: 0`으로 보이지만 않게 합니다. **DOM에서 지우면 버튼의 접근 가능한 이름이 사라져
스크린 리더가 "버튼"만 읽습니다.** 테스트가 그것을 확인합니다.

### CTA는 바닥에 붙습니다

`margin-block-start: auto`가 자리를 만들어 **내비 항목이 몇 개든** 바닥에 남습니다.

테스트에서 `getComputedStyle`이 `auto`를 실제 밀려난 픽셀(360px)로 풀어 처음에 실패했습니다.
선언이 아니라 **결과**를 재도록 고쳤습니다 — CTA 아래 모서리가 셸 바닥에 닿는지 봅니다.

테스트 700 → **710**. Figma 변수 232 → **233**.

### 남은 사이드바 조건

복합 내비 행은 `SidebarNavItem`의 `trailing` prop이 이미 덮습니다. **프로필 사용량 링**은 아직
없고, Avatar가 링을 흡수하지 않기로 한 판정과 얽혀 있어 별도 부품입니다.

## 2026-08-18 (46) — major 7건을 닫습니다

blocker 7건에 이어 major 7건입니다. 실무 감사가 확정한 14건이 전부 닫혔습니다.

### 아이콘을 찾을 채널이 없었습니다

검색 키워드가 `manifest.json`에 있는데 **`dist`에 들어가지 않아 npm으로 나가지 않았습니다.**
소비 개발자가 아이콘 이름을 모르면 찾을 방법이 없었습니다.

생성된 `index.tsx`에 상수로 넣으려다 게이트가 막았습니다 — **`DS-D-0008` 결정 8이 생성물 최상위에
함수 아닌 문장을 금지**하고 그것이 tree-shaking을 지킵니다. 옳은 규칙이라 JSON을 `dist`로 복사해
`./icons/manifest.json` 서브패스로 내보냈습니다. 서브패스 16 → **17**.

`src/`를 배포에 넣으려던 첫 시도도 게이트가 막았습니다.

### focus 링이 자리를 절반으로 알려줬습니다

CSS는 `outline: 2px` + `outline-offset: 2px`이라 **박스와 링 사이에 2px 간격**이 있고 링 바깥
모서리는 박스 + 4입니다. Figma는 324×44(박스 + 2)였습니다 — offset을 0으로 알려주고 있었습니다.
**328×48**로 고쳤습니다.

### 코드에 있는데 Figma에 없던 축 둘

`TextField`의 `prefix`/`suffix` — 검색 필드와 지우기 버튼을 그릴 수 없었습니다.
`Badge`의 `icon`/`dot` — 상태 점이 붙은 배지를 그릴 수 없었습니다.

넷 다 Boolean으로 켜고 `INSTANCE_SWAP`으로 글리프를 고르는 형태입니다. 코드 prop과 짝지어
계약에 넣었습니다.

### fill 글리프의 색

`dots-three-vertical`(fill 3 · stroke 0)과 `info`(stroke 2 · fill 1)는 소비처가 stroke만
override하면 색이 안 바뀝니다. 전수로 재보니 **실제로 어긋난 인스턴스는 0건**이었습니다 —
잠재 위험이지 현재 결함은 아니었습니다.

**그래도 게이트에 넣었습니다.** stroke와 fill이 다른 색 변수를 가리키면 실패합니다.

### 문서 둘

`develop/README.md`가 react 패키지를 *"P3 planned, private, no exports"*로 적고 있었습니다 —
실제는 컴포넌트 20종 · 공개 심볼 58 · 타입 95입니다. 그리고 `packages/react/README.md`에 아이콘을
키워드로 찾는 법과 CSS 세 줄을 넣었습니다.

## 2026-08-18 (45) — 마지막 blocker: Dialog로 확인 대화상자를 못 만들었습니다

Figma의 Dialog 세트에 **Footer도 버튼도 없었습니다.** 제목과 설명만 있어서, 디자이너가 삭제 확인
같은 가장 흔한 대화상자를 그리려면 세트 밖에서 버튼을 따로 붙여야 했습니다.

코드에는 `DialogFooter`와 `DialogActions`가 처음부터 있었습니다. **Figma만 빠져 있었습니다.**

### 세 variant 전부에 넣었습니다

코드의 `dialog.css` 값 그대로입니다 — Footer는 `padding-block-start`가 `space-control-sm`(8),
Actions는 오른쪽 정렬에 같은 gap. **취소가 먼저, 확인이 나중**이고 라벨도 채웠습니다.

### 계약

`footerPaddingTop` · `actionsGap` · `actionCount`를 measured에 두고 parity가 대조합니다. Footer를
지워 보니 실패합니다.

여기서 게이트가 이미 한 가지를 잡고 있었다는 것도 확인했습니다 — 부품을 넣자마자
*"계약에 없는 자손이 있습니다 — Footer"*로 막았습니다. **선언하지 않은 부품을 몰래 넣는 길은
원래 막혀 있었고, 없는 부품을 안 넣는 길만 열려 있었습니다.**

### blocker 7건이 전부 닫혔습니다

| 결함 | 어떻게 닫혔나 |
| --- | --- |
| 오버레이 SSR 예외 | context를 서버에서도 만든다. `verify-consumer`가 4경우를 실제 렌더 |
| CSS import 안내 누락 | 세 문서 수정 + 안내 완결성 게이트 |
| Foundations 색 문서가 없는 이름 | 변수 목록에서 생성 + `compareFoundations` |
| 아이콘 획이 크기를 안 따름 | 146개를 `rescale`로 재배치 + 크기별 획 게이트 |
| EmptyState 64px 슬롯 | 위와 같은 원인이라 함께 닫힘 |
| 캐러셀 빈 컨트롤 | 아이콘 넣고 `controlGlyphCount` 계약 |
| Dialog Footer 없음 | 이 항목 |

**일곱 중 여섯이 게이트를 새로 만들어서 닫혔습니다.** 고친 것보다 **다시 생기지 못하게 한 것**이
많습니다.

## 2026-08-18 (44) — 아이콘 획이 크기를 안 따라가고 있었습니다

같은 아이콘이 20px 자리에서 **Figma 1.5 · 코드 1.25**로 그려지고 있었습니다.

코드는 SVG `viewBox`라 획이 크기를 따라 함께 줄어듭니다 — `1.5 × size / 24`. Phosphor와 Lucide도
같습니다. Figma는 **어떻게 줄이느냐**에 따라 갈립니다.

| 방법 | 20px에서의 stroke |
| --- | --- |
| 크기 조절 핸들 (`resize`) | **1.5** |
| Scale 도구 (`rescale`) | **1.25** |
| 코드 | **1.25** |

`constraints: SCALE`을 걸어도 `resize` 결과는 안 바뀝니다. 이것도 재봤습니다.

**파일의 아이콘 인스턴스 146개가 전부 `resize`로 놓여 있었습니다.**

### 제 첫 판정이 틀렸습니다

처음에는 *"크기 variant를 만들지 말고 두는 자리를 24로 고정한다"*고 썼습니다. 그런데 재보니
146개가 **전부 24가 아니었고**, 그건 실수가 아니라 컴포넌트가 의도적으로 16·20에 놓는 것이었습니다.
버튼의 아이콘이 20인 것은 옳습니다.

`rescale`을 실측하고 나서야 답이 나왔습니다 — **크기 variant도, 24 고정도 아니고, 놓는 방법이
문제였습니다.**

### 146개를 다시 놓았습니다

전부 24로 되돌린 뒤 `rescale(target / 24)`로 다시 넣었습니다. 지금 파일의 실제 값입니다.

| 크기 | 획 | 코드 기대값 |
| ---: | ---: | ---: |
| 16 | **1.0** | 1.0 |
| 20 | **1.25** | 1.25 |
| 64 | **4.0** | 4.0 |

64px는 EmptyState의 그래픽 슬롯입니다 — **그 blocker도 함께 닫혔습니다.**

### 게이트

`compareIconInstances`가 크기별 획을 `1.5 × size / 24`와 대조하고, 허용 크기(`icon-size-*` 토큰
16·20·24·64) 밖이면 실패합니다. 탐지력 확인 — 20px를 1.5로 바꾸니 실패, 18px를 넣으니 실패.

**DS-D-0021**에 판정과 되돌리는 법을 적었습니다.

## 2026-08-18 (43) — Foundations 색 문서가 없는 이름을 적고 있었습니다

오늘 `color-status-*` 8개와 `action-primary-pressed`를 rename했는데, **Foundations의 Color 절은
옛 이름을 그대로 적고 있었습니다.** 그리고 새로 선 `media-*` 9종은 아예 빠져 있었습니다.

문서가 파일에 없는 이름을 적어 두면 **그건 낡은 게 아니라 거짓말입니다.** 디자이너가 그 이름으로
변수를 찾으면 아무것도 안 나옵니다.

### 손으로 고치지 않았습니다

Color 절을 **살아 있는 변수 목록에서 다시 생성**했습니다. semantic 색 50개를 이름순으로 훑으며
Light·Dark 스와치를 만들고 라벨을 붙입니다. 다음에 이름이 바뀌면 다시 생성하면 되고, 손으로
적은 문자열이 없으니 갈라질 자리가 없습니다.

절 안에 그 사실도 적어 뒀습니다 — *"이 절은 파일의 변수 목록에서 만들어집니다. 손으로 고치지
않습니다."*

### 게이트에 넣었습니다

`compareFoundations`가 둘을 봅니다.

1. **캔버스에 적힌 이름이 파일에 실재하는가** — 없는 이름이 있으면 실패
2. **네 절(Color · Typography · Spacing & Radius · Elevation)이 다 있는가** — Foundations가 통째로
   비어 있던 적이 있어(2026-08-18 항목 22) 절 존재도 함께 봅니다

탐지력을 확인했습니다 — 낡은 이름을 심으니 실패하고, 절을 지우니 실패합니다.

**이것이 "문서가 낡았다"를 게이트가 보는 첫 경로입니다.** 그전까지 parity는 변수·style·component의
값만 봤고, 그것을 설명하는 문서는 아무도 안 봤습니다.

## 2026-08-18 (42) — blocker 셋을 더 닫습니다

### CSS import 안내가 토큰을 빠뜨렸습니다

`button.md`가 컴포넌트 문서 중 유일하게 import를 안내하는데 **`tokens.css`를 빠뜨렸습니다.**
그대로 따르면 색·간격·반경이 전부 무효값이 되고 **오류는 나지 않습니다** — `styles.css`에는
semantic 토큰 정의가 없고 `var(--louis-*)` 참조만 있으며 생성물끼리 `@import`하지 않습니다.

`DS-D-0004`는 한술 더 떠 *"소비자 부담은 `layers.css` import 한 줄이다"*라고 적어 두어 누락을
굳혔습니다. 세 곳(button.md · css/README.md · DS-D-0004)을 고쳤습니다.

**게이트로 잠갔습니다** — `styles.css` import를 안내하는 문서가 `tokens.css`를 함께 적지 않으면
`verify-consumer`가 실패합니다. 안내에서 빼 보니 exit 1.

### 캐러셀 컨트롤이 빈 프레임이었습니다

제가 만든 것입니다. 4 variant × 3 부품 = **12개가 빈 프레임**이었고, 눈으로만 보이고 게이트는
못 봤습니다.

화살표는 카탈로그의 `caret-left`/`caret-right`를 넣었습니다. **정지/재생 글리프는 카탈로그에
없어서 비슷한 것으로 때우지 않고** 파이프라인에 정식으로 추가했습니다 — `icon/pause` ·
`icon/play`, provenance `original`(출처를 대조할 수 없는 상태에서 upstream이라 적으면 그것이
추정 출처가 되고, `DS-D-0008` 결정 3이 그것을 빌드 실패로 둡니다).

아이콘 29 → **31**. 검색 키워드도 한국어·영어로 넣었습니다.

`play`가 `pause`와 **같은 세로 범위(4.5~19.5)**를 차지하게 그린 이유는, 두 상태를 오갈 때 글리프
높이가 변하면 버튼이 흔들리기 때문입니다.

### 빈 슬롯을 계약에 넣었습니다

`controlGlyphCount`를 measured에 두고 parity가 세 부품의 자식 수를 대조합니다. **빈 프레임이
다시 생기면 실패합니다.**

## 2026-08-18 (41) — 오버레이가 서버 렌더에서 던지고 있었습니다

실무 관점 전수 감사(5개 관점 · 35 에이전트)를 돌렸습니다. **확정 14건 중 blocker 7건**이고
**13건이 신규**입니다. 가장 심각한 것부터 고칩니다.

### Next.js 페이지가 500이 됩니다

`Dialog` · `ActionMenu` · `Tooltip` · `CompositePopover`가 **서버 렌더에서 예외를 던졌습니다.**
그리고 **열려 있든 닫혀 있든 상관없었습니다** — 삭제 확인 모달을 `open={false}`로 미리 심어 둔
App Router 페이지는 모달을 한 번도 열지 않아도 프리렌더가 죽습니다.

`DS-D-0002`가 소비 제품을 Next.js App Router 하나로 못 박았으니 피할 방법도 없습니다.

### 원인은 구현 내부 모순이었습니다

`OverlayProvider`가 서버에서 `services`를 `null`로 두고 그 값이 그대로 context로 흘렀습니다.
`useOverlayContext`는 `null`을 **"Provider 밖"으로 오판**해 던집니다.

그런데 같은 파일 77행 주석이 원래 의도를 적어 뒀습니다 — *"서버에서는 만들지 않는다. hosts가
null이면 portal은 아무것도 렌더하지 않는다."* **hosts가 null인 것으로 이미 충분했고**, context까지
null로 만들 이유가 없었습니다.

서버에서도 값을 만들되 Escape 리스너의 host만 아무것도 하지 않는 것으로 줍니다. `scrollLock`과
`inert`는 만들 때 DOM을 건드리지 않고 그 메서드는 effect 안에서만 불립니다.

### 게이트가 심볼만 보고 있었습니다

`verify-consumer`의 SSR 검사는 **Button만 렌더하고** Dialog·ActionMenu는 `typeof === "function"`만
확인했습니다. 그래서 이 결함이 게이트 12단계 초록인 채로 살아 있었습니다.

이제 네 경우를 실제로 렌더합니다 — Tooltip · Dialog(열림) · Dialog(닫힘) · ActionMenu(닫힘).
**반대 방향도 계약이라 함께 넣었습니다**: Provider 밖에서는 던져야 합니다. 안 던지면 host를
컴포넌트가 고르게 됩니다.

**탐지력을 확인했습니다** — 고친 것을 되돌리니 exit 1로 잡힙니다.

### 남은 blocker 6건

CSS import 순서 안내가 `tokens.css`를 빠뜨림 · Foundations 색 문서가 없는 변수 이름 9개를 적음 ·
아이콘 획 두께가 크기를 안 따라감 · EmptyState 64px 슬롯에 20px로 그려짐 · BannerCarousel 화살표가
빈 프레임 · Dialog에 Footer와 버튼이 없음. 순서대로 고칩니다.

## 2026-08-18 (40) — 컴포넌트 16개 중 11개가 텍스트를 못 바꿨습니다

owner 요구: **"실무적으로 안 되어있는 부분들 모두 해결해라."**

아이콘 슬롯을 고치고 나서 같은 방식으로 텍스트를 쟀습니다. **16개 중 11개가 하드코딩이었습니다.**

| 열려 있던 것 | 박혀 있던 것 |
| --- | --- |
| Button · Menu/Item · Dialog · Tooltip · Toast | ProjectCard · SelectableListRow · TextField · SegmentedControl · EmptyState · BannerCarousel · Badge · SidebarNavItem · AppTopBar · Checkbox · Slider |

디자이너가 인스턴스를 놓고 글자를 바꾸려면 **레이어를 열어 하나씩 고쳐야 했습니다.** 실무에서는
그렇게 쓰지 않습니다 — 인스턴스 속성 패널에서 바꿀 수 없으면 그 컴포넌트는 안 쓰이거나 detach됩니다.

### 21개 속성을 열었습니다

`ProjectCard.Eyebrow/Title/Meta` · `TextField.Label/Value/Message` ·
`SegmentedControl.Label1/2/3` · `SelectableListRow.Title/Meta/Trailing` 등입니다.

**모든 variant의 같은 자리 텍스트를 한 속성에 묶었습니다.** 하나라도 빠지면 variant를 바꿀 때
입력한 글자가 기본값으로 되돌아갑니다 — TextField는 8 variant, Badge는 5 variant입니다.

### readback이 이 축을 통째로 안 보고 있었습니다

더 나쁜 발견입니다. `figma/readback.json`의 `properties`에 **TEXT 속성이 하나도 기록돼 있지
않았습니다.** Button은 원래 `Label`이 있었는데도요.

그래서 parity가 *"선언되지 않은 property"*를 검사하고 있었지만, **애초에 읽지 않는 축이라 아무것도
못 잡았습니다.** 게이트가 초록인 채로 11개가 하드코딩이었던 이유입니다.

### 계약을 넓혔습니다

`figmaOnlyProperties`가 VARIANT 옵션만 받고 있어서 TEXT·INSTANCE_SWAP 슬롯을 선언할 자리가
없었습니다. 옵션이 없는 축은 **type만 대조**하도록 넓혔습니다.

그리고 텍스트 슬롯 26개를 전부 코드 prop과 짝지어 선언했습니다. `children`으로 받는 것(타입
선언에 항목으로 안 나타납니다)과 합성 컴포넌트의 하위 부품 children은 Figma 전용으로 갈랐습니다.

**탐지력을 확인했습니다** — `ProjectCard.Title`을 지우니 exit 1.

## 2026-08-18 (39) — 아이콘이 박혀 있던 것을 게이트가 잡게 합니다

owner 질문: **"아이콘도 이렇게 다 따로따로 컴포넌트화 하는 방식이 실무적인 방식이야?"**

개별 컴포넌트는 맞습니다 — Phosphor · Lucide · Material 전부 그렇고, Figma의 `INSTANCE_SWAP`이
개별 컴포넌트를 요구합니다. 한 세트에 variant로 몰면 아이콘 하나 바꿀 때마다 축이 29개가 됩니다.

**문제는 그 다음이었습니다.** 아이콘을 *받는* 쪽을 재보니 둘이 슬롯 없이 박혀 있었습니다.

| 컴포넌트 | 슬롯 | 박힌 아이콘 |
| --- | --- | --- |
| Button | `LeftIconGlyph` · `RightIconGlyph` | OK |
| IconButton | `Glyph` | OK |
| **SidebarNavItem** | **없음** | `icon/house` |
| **EmptyState** | **없음** | `icon/folder` |

**이것이 사이드바 네 행이 전부 house였던 직접적인 원인입니다.** 라벨은 바꿀 수 있는데 아이콘은
바꿀 수 없는 구조였고, 그래서 제가 "아이콘이 없다"고 판단했습니다 — 실제로는 `icon/graph`가
카탈로그에 있는데도요.

### 고친 것

두 컴포넌트에 `Glyph` 슬롯을 열고 variant 6개 + 1개의 아이콘 인스턴스를 전부 그 속성에
묶었습니다. 하나라도 빠지면 variant를 바꿀 때 아이콘이 기본값으로 되돌아갑니다.

### 되돌아가지 못하게

`iconSlots` 계약을 parity에 넣었습니다. **아이콘을 품는 컴포넌트가 교체 슬롯을 잃으면
실패합니다.** 탐지력을 확인했습니다 — 슬롯을 지우니 exit 1.

이 계약이 오늘 이전에 있었다면 홈 템플릿을 그렇게 만들지 않았을 것입니다.

### 여전히 없는 아이콘

제품 사이드바의 실제 지도(`Gnb.tsx`)를 읽으니 이렇습니다.

| 내비 | 아이콘 | 카탈로그 |
| --- | --- | --- |
| 홈 | `House` | 있음 |
| 노드 캔버스 | `Graph` | **있음** |
| 비디오 에디터 | `MagicWand` | 이관 보류 |
| 하이라이트 | `highlight_symbol` | 브랜드 심볼 — 아이콘 축이 아님 |
| 분석 | `youtube` · `InstagramLogo` | **서드파티 상표** |

**넷이 각각 다른 판정을 요구합니다** — 기술 처분(−45° 회전 rect) · 브랜드 자산 축 신설 · 상표
정책. 뭉뚱그려 그리면 `DS-D-0008`의 provenance 규칙을 우회하는 것이 됩니다.

## 2026-08-18 (38) — 만들 재료가 없어서 홈 템플릿을 내립니다

owner 지적: **"이 좌측 사이드바가 맞다고 생각하냐? 아이콘도 다 똑같고 앱 로고도 없는데?
유튜브 분석도 없고, 최하단 업그레이드 버튼도 없고."**

전부 맞습니다. 그리고 변명할 자리가 없는 이유는 — **제가 그 목록을 이미 갖고 있었습니다.**

오늘 돌린 배포본 분해 감사가 확정한 공용 미등록 7종 중 **넷이 정확히 사이드바 부품**입니다:
`sidebar-brand-wordmark`(앱 로고) · `sidebar-footer-cta`(하단 업그레이드) ·
`sidebar-compound-nav-row` · `avatar-progress-ring`(프로필 사용량 링).

**저는 이것을 읽고 보고까지 해놓고, 없는 것처럼 템플릿을 만들었습니다.**

### 진짜 원인 — 카탈로그가 화면이 아니라 인구조사로 만들어졌습니다

"제품에 버튼이 몇 벌 있나" 세서 합의하는 축만 남기는 방식이라, 결과물은 제품 사용의 **평균**이지
제품 화면이 아닙니다.

그래서 `app-shell-parts`가 준 것은 `SidebarNavItem` + `AppTopBar` **둘뿐**입니다. 실제 사이드바는
브랜드 헤더 · 내비 · 분석 eyebrow · 분석 항목 2 · 접기 버튼 · 하단 업그레이드 · 프로필 트리거입니다.
제품 코드에도 `sidebarBrandCrop` · `analyticsEyebrow` · `analyticsItems` · `GnbWordmarkLogo` ·
`GnbProfileAvatar`가 그대로 있습니다.

그리고 그것들을 **배치하는 규칙인 `app-shell` 패턴이 `web: not-ready` · `figma: not-ready`입니다.**

**재료도 조립 규칙도 없는데 두 부품으로 흉내를 냈습니다.** 옳은 판단은 *"앱 셸 패턴이 없으니 홈
템플릿은 아직 못 만든다"*고 말하는 것이었습니다.

아이콘도 같습니다. 카탈로그 29개에 노드캔버스·비디오에디터·하이라이트 아이콘이 없습니다.
`magic-wand`는 등록부에 *"−45° 회전 rect라 transform 없이 표현 안 됨, 이관 보류"*로 적혀 있는데
그것을 읽고도 house 아이콘 넷을 놓았습니다.

### 내렸습니다

Figma에서 템플릿을 지우고 **왜 비어 있는지를 페이지에 남겼습니다.** 아무 설명 없이 비면 다음
사람이 "아직 안 만들었다"로 읽는데, 사실은 **만들 재료가 없다**는 판정입니다.

`templates.measured.json`의 계약도 함께 내렸습니다(`$suspendedTemplates`). **만들 수 없는 것에
초록 계약이 붙어 있으면 그게 거짓말입니다.**

### 순서

1. 사이드바 부품 4종과 아이콘
2. `app-shell` 패턴을 `not-ready`에서 꺼낸다
3. 앱 홈 재조립
4. 허브 3종

그리고 템플릿 계약에 **"부품이 카탈로그에 있는가"**를 넣어야 합니다. 오늘 넣은 `requiredParts`는
*Figma에 그 이름이 있는가*만 봐서, 없는 부품을 house 아이콘으로 대신하는 것을 막지 못합니다.

## 2026-08-18 (37) — 템플릿이 제품과 뭐가 다른지 게이트가 봅니다

owner 지적: **"배포환경과 뭐가 다른지 너가 스스로 다 깨우쳐야 된다."**

오늘 지적받은 것들의 공통점이 하나입니다 — **전부 게이트가 안 보는 자리였습니다.** Foundations가
비어 있던 것도, 컴포넌트가 섹션 밖에 흩어져 있던 것도, 템플릿이 커버리지 도표였던 것도,
루트가 일반 프레임이었던 것도, 라벨이 자리표시자인 것도 그렇습니다.

그래서 라벨을 손으로 또 채우는 대신 **계약을 넓혔습니다.**

### 계약이 숫자만 보고 있었습니다

`templates.measured.json`은 폭·여백·반경 같은 수치만 대조했습니다. 그래서 **부품이 빠져도, 라벨이
전부 "보관함"이어도 초록**이었습니다.

네 가지를 더했습니다.

| 계약 | 값 | 왜 |
| --- | --- | --- |
| `requiredParts` | 7종 | 부품이 빠지면 화면이 아니라 **화면 흉내**다 |
| `navLabelsDistinct` | 4 | 같은 라벨이 반복되면 템플릿이 아니라 자리표시자다 |
| `cardTitlesDistinct` | 8 | 제목이 같으면 그리드가 아니라 벽지로 읽힌다 |
| `placeholderLabelsAllowed` | 0 | "배너 제목" · "Label"이 남아 있으면 조립이 끝나지 않은 것이다 |

근거는 전부 제품 `AppHomeScene`의 렌더 트리입니다 — scene → main → 배너 section(CTA 포함) →
archiveSection(헤더 + 그리드), 그리고 `floatingCreateDock`.

**탐지력을 확인했습니다.** 부품 하나를 빼니 실패하고, 카드 제목을 하나로 되돌리니 실패했습니다.

### 함께 고친 것

**루트를 auto-layout으로 바꿨습니다.** 일반 프레임이라 폭을 줄여도 안쪽이 따라오지 않았습니다.
사이드바 FIXED 280, 본문 FILL입니다.

빠져 있던 부품을 채웠습니다 — 배너 CTA · 섹션 헤더(eyebrow + "새 프로젝트") · 우하단 플로팅 생성
버튼. 인스턴스 18 → **21**.

### 아직 다른 것

배너 이미지, 카드 썸네일, 카드 더보기 버튼, 사이드바 아이콘 4종이 제품과 다릅니다. **이것들도
계약에 넣어야 합니다** — 지금은 제가 눈으로 세고 있고, 그게 오늘 반복된 실패의 원인입니다.

## 2026-08-18 (36) — SEED과 대조했더니 우리 이름의 결함 둘이 나왔습니다

owner 요청으로 seed-design.io 전 영역(색·타이포·레이아웃·tier 구조·컴포넌트)을 읽고 우리 토큰과
축별로 대조했습니다. **판정은 "SEED 이름을 가져오지 않는다"입니다.**

근거가 셋입니다.

1. `execution-handoff.md`가 *"SEED의 token 이름·값"*을 복제 대상에서 제외한 **normative 문장**을
   이미 갖고 있습니다. 가져오려면 그것을 뒤집는 Decision이 먼저입니다.
2. **SEED에는 `hover` 토큰이 0개입니다.** 모바일 앱 우선 시스템이라 hover 축이 없습니다. 데스크톱
   웹인 우리는 7개를 쓰고, SEED 어휘로는 표현할 방법이 없습니다.
3. SEED의 적응형 팔레트(primitive `gray-00`이 테마에 따라 흰↔검으로 뒤집힘)는 `DS-D-0010 §2`가
   *"반전을 primitive로 옮기면 mode 축이 두 벌이 된다"*고 적고 **이미 기각한 설계**입니다.

즉 SEED과 다른 축의 상당수는 실수가 아니라 **기록된 결정**이었습니다.

### 그런데 대조 과정에서 우리 결함 둘이 드러났습니다

**① `color-accent-primary-pressed`가 옛 혼동을 들고 있었습니다.**

`interaction-states.md`는 `active`=`:active`(누르는 중, 일시적), `pressed`=`aria-pressed="true"`
(토글 켜짐, 지속)로 고정하고 **"절대 섞지 않는다"**고 못 박았습니다. 그 문서 자체가 과거 이
혼동을 기록하려고 쓰였습니다.

그런데 이 토큰은 `button.css`와 `icon-button.css`에서 **`:active`로 소비됩니다.** 컴포넌트 층은
고쳤는데 **토큰 이름만 옛 이름으로 남아 있었습니다.** `color-accent-primary-active`로 바꿨습니다.

**SEED은 이것을 잡아 주지 못합니다** — SEED에 `active` 축이 없어 SEED도 `pressed`라 부릅니다.
우리 규범이 SEED보다 정밀한 자리입니다.

**② 축 순서가 세 갈래였습니다.**

| 형태 | 개수 |
| --- | ---: |
| 속성이 앞 (`color-bg-canvas`) | **24** |
| 속성이 뒤 (`color-status-danger-background`) | 8 |
| role 우선, 그룹 안에서도 흔들림 | 18 |

SEED은 `$color.{property}.{role}` 하나로 예외가 없고, **이 축은 SEED이 낫습니다.** 다만 처방은
"SEED 이름을 쓴다"가 아니라 **"우리 다수파로 통일한다"**입니다.

`color-status-*` 8개를 속성 앞으로 옮겼습니다 — `color-bg-danger` ·
`color-fg-danger` 식입니다. `color-stroke-danger`가 이미 그 형태라 나란히 섭니다.

### 왜 지금인가

**공개 release도 published 라이브러리도 없어 외부 소비자가 0입니다.** 지금이 가장 싼 시점입니다.
`DS-P3-014`가 토큰을 174 → 약 340개로 확장 중이라, 확장 전에 규칙을 고정해 두는 편이 사후
rename보다 훨씬 쌉니다.

### 같은 변경 단위에서 움직인 것

토큰 원천 · 생성물 6종 · 저작 CSS 5개 · Figma 변수 9개 · readback · snapshot · measured 계약 ·
규범 문서 4개 · baseline 재고정. **테스트가 두 번 막았습니다** — badge와 surface-states가
`components.measured.json`의 states 표를 읽는데 거기 옛 이름이 남아 있었습니다.

`design/updates/README.md`의 과거 항목은 **바꾸지 않았습니다.** 그때 그 이름이었던 것이 사실이고,
기록을 고치면 그 사실이 사라집니다.

## 2026-08-18 (35) — Templates에 진짜 화면이 섰습니다

owner 지적: **SEED 문서가 "Figma 라이브러리는 모든 토큰, 아이콘, 컴포넌트, 화면 템플릿을
포함한다"고 적어 뒀는데, 우리 Templates에는 화면이 없었습니다.**

있던 것은 `Home — /archive (coverage)`라는 **커버리지 도표**였습니다. 무엇이 DS로 덮이고 무엇이
안 덮이는지 진단하려고 만든 것이지, 디자이너가 복제해서 화면을 시작할 템플릿이 아니었습니다.

그 상태로 publish를 권한 것은 **판단 착오였습니다.** SEED이 정의한 네 축 중 하나가 통째로 비어
있는 라이브러리를 내보낼 뻔했습니다.

### 앱 홈을 DS 컴포넌트로 조립했습니다

1440×900. 사이드바 4행 · 상단 바 · 배너 · 프로젝트 카드 8장, **인스턴스 18개**입니다.

**여기서 새로 그린 도형은 하나도 없습니다.** 전부 Components 페이지의 인스턴스입니다 — 템플릿에서
직접 그리면 그 순간 컴포넌트와 갈라지고, 다음 사람이 어느 쪽이 정본인지 알 수 없게 됩니다.

라벨도 제품 그대로입니다. 사이드바는 홈 · 노드 캔버스 · 비디오 에디터 · 하이라이트 순이고,
카드 제목 8개가 서로 다릅니다 — 같은 제목이 반복되면 그리드가 아니라 벽지로 읽힙니다.

### 게이트가 두 값을 잡았습니다

제가 여백을 DS 스케일로 골랐는데 parity가 제품 실측과 다르다고 막았습니다.

| 축 | 제가 쓴 값 | 제품 실측 |
| --- | --- | --- |
| 사이드바 좌우 여백 | 8 | **12** |
| 그리드 섹션 상단 여백 | 24 | **40** |

12는 `spacing/control-md`가 정확히 같아 변수로 걸었습니다. **40은 DS spacing에 없습니다** —
gap registry가 이미 기록한 격차이고, 토큰이 설 때까지 raw 값으로 두고 그 사실을 코드 주석에
남겼습니다.

이 두 값은 제가 눈으로는 못 잡았을 것들입니다. **화면을 실제로 조립하니 게이트가 잡아 줬습니다.**

## 2026-08-18 (34) — Figma 문서를 SEED의 상세 페이지처럼 다시 씁니다

owner 지적: **"지금 너가 작성한 말투는 좀 딱딱해."** 맞습니다. `seed-design.io`의 컴포넌트 상세
페이지를 다시 보고 두 가지를 고쳤습니다.

### 순서

SEED은 **이름 → 한 줄 소개 → Props → 미리보기** 순입니다. Figma도 같게 맞췄습니다. 전에는
이름과 설명뿐이라 어떤 축이 있는지 보려면 세트를 클릭해야 했는데, 이제 `Tone: neutral · danger`
같은 줄이 캔버스에 함께 놓입니다. Figma에서는 variant 속성이 곧 Props입니다.

### 말투

SEED의 개요는 존댓말 한 문장입니다 — *"명확한 액션을 쉽게 수행할 수 있도록 돕는 기본 인터랙션
컴포넌트입니다."* 저희 규범 문서는 "~한다"체인데 그건 **규범 문체라 그대로 둡니다.** 대신 사람이
보는 표면에 쓸 문장을 따로 두었습니다.

각 컴포넌트 문서의 frontmatter에 `summary`를 넣고, `build-figma-summaries.mjs`가 그것을
우선합니다. 없으면 예전처럼 본문 첫 문장으로 물러납니다. **어느 쪽이든 문서가 원천이고 생성기가
문장을 짓지 않습니다** — `pnpm check`가 어긋남을 그대로 잡습니다.

| 전 | 후 |
| --- | --- |
| 방금 한 일의 결과를 짧게 알리고 스스로 사라진다. | 방금 한 일의 결과를 짧게 알리고 스스로 사라집니다. |
| 아직 오지 않은 내용의 자리를 지킨다. | 아직 오지 않은 내용의 자리를 지킵니다. |

### 배치

라벨이 세 줄로 커지면서 Spinner 라벨이 Toast 미리보기를 덮었습니다. 컴포넌트 사이 간격을 240으로
넓히고, 예시 프레임은 카탈로그 뒤로 내렸습니다. 겹침을 실측해 **0건**입니다.

## 2026-08-18 (33) — 자동으로 움직이는 것은 멈출 수 있어야 한다

앞 항목이 남긴 결함을 닫는다. 캐러셀의 자동 넘김이 멈추지 않아 **WCAG 2.2.2가 미해소**였다.

### owner 판정이 필요하지 않았다

`"배포환경이랑 아주 똑같아야해"`와 접근성이 부딪히는 첫 지점이라 owner에게 올리려 했는데,
**이 저장소의 규칙이 이미 답을 갖고 있었다** — CLAUDE.md의 *"제품 전용 화면 코드와 **과거 UI
부채를** 이 저장소의 공용 규범으로 복사하지 않는다."*

접근성 결함은 부채다. 옮기지 않는다.

### 멈추는 경우 셋

1. **정지 버튼.** 상태는 버튼이 소유하며 `aria-pressed`로 말한다.
2. 포인터가 위에 있거나 **초점이 안에 있으면** 멈춘다. 읽는 중에 글자가 바뀌지 않게 한다.
3. `prefers-reduced-motion: reduce`이면 **아예 돌지 않는다.** 느리게 도는 것은 답이 아니다.

**2번을 `aria-pressed`에 반영하지 않았다.** hover는 의도가 아니라 부수효과이고, 그것으로 상태를
흔들면 스크린 리더가 커서 움직임마다 상태를 읽는다. 시각적 일시정지와 선언된 정지는 다른 것이다.

### 제품보다 36px 넓어졌다

컨트롤 폭이 126 → **162**다(28 버튼 + 8 간격). **의도적으로 다른 값**이며 measured의 `$pause`,
규범의 Known deviations, manifest note 세 곳에 이유를 적었다. 나중에 누가 "제품과 다르다"고
보고했을 때 **답이 이미 문서에 있어야 한다.**

Figma set의 네 variant에도 같은 부품을 넣어 parity가 그 폭을 대조한다. 코드에만 넣고 Figma를
비워 두면 다음 사람이 그것을 버그로 읽는다.

### `autoAdvanceMs={0}`이면 정지 버튼을 그리지 않는다

멈출 것이 없는 버튼은 거짓말이다. 슬라이드가 하나일 때 화살표를 그리지 않는 것과 같은 이유다.

테스트 696 → **700**.

## 2026-08-18 (32) — BannerCarousel의 Figma set이 섰다

component 19 → **20**. `figma: not-ready` → `partial`. **이제 parity가 이 컴포넌트를 지킨다** —
그 전까지는 코드만 있고 Figma 쪽 계약이 비어 있었다.

### variant 축 둘

`Tone`(bright · dark) × `Bleed`(boxed · full) 4벌이다. 둘 다 코드의 타입 선언과 대조된다 —
`BannerTone`과 `BannerCarouselBleed`. 후자는 이 계약을 위해 export를 새로 열었다. 인라인
union으로 두면 Figma variant가 무엇과 맞는지 게이트가 확인할 수 없다.

**Tone이 variant인 이유**는 톤이 색을 바꾸기 때문이고, **Bleed가 variant인 이유**는 반경을 바꾸기
때문이다. 기하 키를 `Bleed` 값으로 잡았다 — Size 축이 없고 반경을 바꾸는 유일한 축이라 그 값이
곧 키다.

### 점의 활성과 비활성을 둘 다 잰다

같은 부품의 두 값이면 합성 키를 쓰겠지만, **활성과 비활성은 서로 다른 자리에 동시에 존재한다.**
그래서 `DotActive`(20×7)와 `DotRest1`(7×7)로 이름을 갈라 둘 다 대조한다. 폭이 상태라는 계약이
Figma 쪽에서도 기계로 지켜진다.

### 960×240은 정본이 아니다

measured에 `$note`로 박아 뒀다. 높이는 소비처가 정하고 **허브 4종이 서로 다르다.** Figma의 예시
크기가 정본인 척하지 않도록 적어 둔 것이며, 규범과 component set description에도 같은 문장이 있다.

### 테두리도 그림자도 없는 것이 계약이다

배너의 경계는 **사진 자체**이고 컨트롤은 면과 흐림으로만 떠 있다. 여기에 테두리가 생기면 사진
위에 선이 그어진다. `strokes: {}` · `effects: {}`로 못 박아, 누가 나중에 얹으면 parity가 잡는다.

raw fill 0 · raw stroke 0 · 텍스트 스타일 8개 전부 바인딩.

## 2026-08-18 (31) — BannerCarousel이 섰다

허브 4종을 동시에 막던 컴포넌트다. 배포본 실측을 CSS · React · 테스트 · 규범으로 옮겼다.
component 20 → **21**, 테스트 688 → **696**.

### 계약 셋

**톤은 테마가 아니다.** `tone="bright"`는 사진이 밝다는 뜻이고, 그래서 글자가 **어두워진다**.
샘플링은 소비처가 갖는다 — 흡수하면 DS가 이미지 로딩과 CORS를 떠안는다.

**높이는 소비처가 정한다.** 슬라이드가 전부 absolute라 높이를 안 주면 0으로 접히고
`overflow: hidden`이 컨트롤을 잘라 클릭조차 되지 않는다. 기본값을 넣지 않은 이유는 허브 4종의
배너 높이가 서로 달라 **실측된 단일 정본이 없기 때문**이다. 임의의 값은 정본인 척한다.

**슬라이드가 하나면 컨트롤을 그리지 않는다.** 넘길 곳이 없는 화살표와 점은 거짓말이다.

### 폭이 상태이고, 폭만으로는 부족하다

점의 활성 폭 20px가 "지금 몇 번째인가"를 말한다(DS-D-0019). 그런데 **폭은 보조기술이 읽지
않는다.** 그래서 `aria-selected`가 함께 상태를 갖는다 — 시각과 의미가 각자 자기 축으로 말하며
어느 한쪽만으로는 계약이 성립하지 않는다.

### 테스트가 나를 세 번 세웠다

1. **`render`가 비동기 커밋이다.** `await` 없이 질의하니 컨테이너가 비어 있었다. 이 저장소의
   기존 테스트는 전부 `await render(...)`인데 내가 빠뜨렸다.
2. **화살표 클릭이 15초 타임아웃**으로 죽었다. 높이 0 + `overflow: hidden`이라 컨트롤이 잘려
   있었다. 컴포넌트 결함이 아니라 **계약을 테스트가 안 지킨 것**이었고, 그 사실을 규범에 적었다.
3. **`userEvent` import 경로를 지어냈다.** `@vitest/browser/context`가 아니라 `vitest/browser`다.
   typecheck가 잡았다.

### 남긴 결함 하나

**자동 넘김이 포커스나 hover에서 멈추지 않는다.** 제품도 멈추지 않는다. 제품 값을 그대로 옮긴
상태라 **WCAG 2.2.2가 해소되지 않았다.** 감추지 않고 Known deviations에 적었고 manifest note에도
남겼다. 다음 변경 단위에서 정지 수단을 판정한다.

### 남은 것

Figma component set. `figma: not-ready`이며 그것이 서야 parity가 이 컴포넌트를 지킨다.

## 2026-08-18 (30) — Tailwind 다리를 실제로 건너 본다

owner 질문: **"디자인시스템은 테일윈드가 아니야?"** 아니다 — DS는 Tailwind에 의존하지 않고
`.louis-*` plain CSS로 저작한다(DS-D-0004). 다만 토큰을 `@theme inline`으로 **발행**한다(DS-D-0013).
쓰는 건 plain CSS, 주는 건 Tailwind 테마다.

그 다리를 아직 아무도 건너지 않았다는 것이 문제였다. 건너 봤다.

### 내가 틀렸던 것

앞 항목에서 **"제품의 `--spacing: 2px` 격자와 DS 스케일이 부딪혀 모든 간격이 두 배로 틀어질 수
있다"**고 적었다. 재보니 **아니다.** DS `theme.css`의 변수 183개와 제품 `tailwind.css`의 144개를
이름으로 대조하니 **겹치는 것이 0개**다. DS는 `--spacing-<이름>`을 쓰고 제품의 곱수는 `--spacing`이라
서로 건드리지 않는다.

### 진짜 위험은 순서였다

제품은 `@theme`에서 네 namespace를 통째로 지운다 — `--color-*` · `--radius-*` · `--text-*` ·
`--font-*`. **DS도 그 네 namespace를 쓴다.**

제품이 실제로 쓰는 Tailwind 4.3.3으로 두 순서를 컴파일했다.

| 유틸리티 | DS → 제품 | 제품 → DS |
| --- | --- | --- |
| `bg-action-primary` | **생성 안 됨** | 생성됨 |
| `text-foreground-primary` | **생성 안 됨** | 생성됨 |
| `rounded-card` · `rounded-control` | **생성 안 됨** | 생성됨 |
| `p-3` · `gap-3` (대조군) | 생성됨 | 생성됨 |

**빌드는 성공한다.** 오류 없이 `bg-action-primary`가 아무것도 하지 않는 클래스가 된다. 대조군이
양쪽에서 살아 있으니 빌드 실패가 아니라 정확히 reset 범위의 문제다. **가장 나쁜 실패 모양이다.**

### 계약으로 못 박았다 — DS-D-0020

`@klipse-design/css/theme.css`는 제품의 Tailwind 진입 CSS **뒤에** 온다. 문서의 권고가 아니라
`scripts/verify-tailwind-interop.mjs`가 매 `pnpm verify`에서 검사하는 계약이다.

**Tailwind는 제품 저장소의 것을 쓴다.** DS는 Tailwind에 의존하지 않고, interop을 재는 데는 제품이
실제로 쓰는 버전이 정본이다. 새 의존성이 0이다.

canary가 두 방향이다. 반대 순서에서 **전부 살아남아도 실패**하고(계약이 사라진 것이므로 다시
판정해야 한다) **일부만 사라져도 실패**한다(제품의 reset 범위가 바뀐 것이다).

### 게이트가 또 한 번 나를 막았다

DS-D-0020 초안이 제품의 Tailwind 진입 CSS 경로를 줄 번호까지 직접 인용했더니 빌드가 거부했다 —
**규범 문서는 제품 저장소 전용 경로를 참조할 수 없다.** 옳은 규칙이라 위치 근거를 비규범
`migration/klipse-web-adoption.md`로 옮겼다.

`pnpm verify`가 12단계가 됐다.

## 2026-08-18 (29) — 캐러셀 CSS가 섰다

배포본 `TabBannerCarousel.tsx` 실측을 CSS로 옮겼다. component 21 → **22**.

### 이름 하나를 더 세웠다

콘텐츠 좌우 인셋 20px에 맞는 이름이 `space-toast-inline`뿐이었다. 값은 같지만 **빌리지 않았다** —
이 저장소는 컴포넌트 이름 토큰을 금지하는데 토스트 이름을 배너가 쓰면 그 규칙이 무의미해진다.
`space-media-inset`을 세웠다. 변수 231 → **232**.

### 게이트가 두 번 막았고 둘 다 옳았다

1. **raw color 리터럴** — progressive blur의 mask가 `rgb(0 0 0 / 92%)` 다섯 스톱이었다. mask는
   색이 아니라 **알파만** 쓰므로 `currentcolor`를 섞어 같은 결과를 낸다. 어떤 색을 넣어도 결과가
   같고 규칙은 그대로 지킨다.
2. **없는 토큰** — `border-width-focus-ring`을 지어냈다. 실제 이름은 `border-width-ring`이고
   Slider가 이미 그것을 쓰고 있다.

### 숫자 z-index를 쓰지 않았다

제품은 `z-1`·`z-2`·`z-3`을 쓴다. DS는 **DOM 순서가 곧 칠 순서**다 — 슬라이드 뒤에 컨트롤을 두면
같은 결과가 나온다. Dialog와 ProjectCard가 이미 같은 방식이다.

### reduced motion에서 흐림도 지운다

레이아웃 재계산이 가장 비싸므로 점의 폭 전환을 제일 먼저 끈다. progressive blur도 함께 지운다 —
제품이 `motion-reduce`에서 지우는 것과 맞췄고, 흐림 자체가 합성 부담이다.

### 남은 것

React · 브라우저 테스트 · 규범 문서 · Figma component set · manifest. CSS만으로는 아직
소비처가 없다.

## 2026-08-18 (28) — 사진 위의 색에 이름을 준다

캐러셀 CSS를 쓰려다 멈춘 자리를 푼다. 제품의 배너 부품은 **고정 `--palette-gray-*`를 쓰고**
주석이 이유를 적어 뒀다 — *"사이트 테마와 무관하게 항상 같은 모습이어야 하므로."*
**배너의 면은 사진이지 테마 표면이 아니다.**

DS의 semantic 색 41개는 전부 테마를 따라 뒤집힌다. 그리고 CSS 게이트가 primitive 직접 소비를
막는다. 그래서 정직하게 쓸 방법이 없었다.

### 값은 이미 DS 안에 있었다

제품의 `--palette-gray-000`(#fafafa) · `900`(#171b22) · `1000`(#000000)은 각각 DS의
`neutral.0` · `neutral.900` · `neutral.1000`과 **정확히 같다.** 없던 것은 이름이지 값이 아니다.
알파 셋(`black-alpha.28` · `paper-alpha.45` · `paper-alpha.88`)만 더했다.

### light와 dark에 같은 값을 넣는다

| 토큰 | 별칭 |
| --- | --- |
| `color-media-foreground-bright` | `neutral.900` |
| `color-media-foreground-dark` | `neutral.0` |
| `color-media-scrim-bright` | `neutral.0` |
| `color-media-scrim-dark` | `neutral.1000` |
| `color-media-control-surface` | `black-alpha.28` |
| `color-media-control-foreground` | `paper-alpha.88` |
| `color-media-control-hover` | `paper-alpha.14` |
| `color-media-indicator-rest` | `paper-alpha.45` |
| `color-media-indicator-active` | `neutral.0` |

두 모드에 같은 primitive를 건다. **값이 우연히 같은 것이 아니라 같아야 한다는 계약**이며,
모델을 벗어나지 않으면서 "테마 무관"을 표현하는 유일한 방법이다. 누가 한쪽 모드만 바꾸면
`theme-mode-completeness` canary가 아니라 **의도가 깨진 것**이므로, 규범 문서에 그 사실을 적는다.

`bright`/`dark`가 테마 이름이 아니라 **이미지 톤** 이름인 것에 주의한다 — 밝은 사진 위에서는
글자가 어두워야 하므로 `media-foreground-bright`가 `neutral.900`이다.

Figma에도 primitive 3 · semantic 9를 만들고 readback을 갱신했다. 변수 219 → **231**.

## 2026-08-18 (27) — 배포본에서 8화면을 다시 분해한다

`screen-inventory.md`는 `sniperfactory-official/klipse`의 `louis`(2026-08-04, dirty 트리)를 읽고
만든 것이고, 그 문서 스스로 **"브라우저 실측 렌더를 하지 않았다"**고 적어 두었다. 그 수(72·130·144,
그리고 내가 인용한 41)는 전부 그 위에 얹혀 있었다.

배포본 `origin/main` 7e9c3b69에서 8화면을 다시 분해했다.

| 단계 | 수 |
| --- | ---: |
| 분해된 구성요소 | **393** |
| 조립 불가로 1차 판정 | **227** |
| **반증 검증을 실제로 거친 것** | **64** |
| 반증으로 뒤집힌 것 | 8 |
| 확정 미등록 | 56 |
| 중복 제거 후 고유 종류 | **49** |

### 상한을 명시한다

반증 단계에 **화면당 8건**의 상한을 걸었다(8×8=64). 227건 중 **163건은 아무도 반증을 시도하지
않았다.** 49는 *"검증을 거친 64건에서 나온 고유 종류"*이지 전체 gap의 크기가 아니다. 검증된 것
중 **12.5%가 뒤집혔으므로** 나머지에도 비슷한 비율의 오판이 있다고 봐야 한다.

상한을 걸었다는 사실을 적지 않으면 이 표는 **"다 셌다"로 읽힌다.** 그것이 이 저장소가 오늘
"카탈로그가 닫혔다"로 이미 한 번 겪은 일이다.

### 결과의 모양

공용 후보는 **7종뿐**이다 — 사이드바 부품 셋, 진행률 링 아바타, **배너 캐러셀**, 배너 컨트롤,
determinate 진행바. 나머지 **42종은 한 화면 전용**이다.

이 비율이 판정을 바꾼다. 미등록이 많다는 것과 **DS가 만들어야 할 것이 많다**는 것은 다르다.
이 저장소의 규칙은 *제품 전용 화면 코드를 공용 규범으로 복사하지 않는다*이므로, 42종은 각각
DS가 소유할지 제품이 소유할지 판정 대상이지 자동으로 카탈로그 작업이 아니다.

캐러셀이 공용 7종 안에 두 번 들어가 있다(본체와 컨트롤). 지금 짓고 있는 것이 맞다.

## 2026-08-18 (26) — 캐러셀을 막던 넷 중 셋이 무너졌다

`figma-gap-registry.md`는 BannerCarousel을 **"선행 조건 넷이 충족되지 않았다"**로 막아 뒀다.
배포본(`origin/main` 7e9c3b69)의 `TabBannerCarousel.tsx`를 직접 재니 셋이 무너졌다.

| 막는다던 것 | 배포본 실측 |
| --- | --- |
| stagger 지연 축이 DS에 없다 | **0 · 40 · 80 · 150ms**. opacity 300ms `ease`, transform 360ms `cubic-bezier(.22,1,.36,1)` |
| 점 폭 전환 토큰이 없다 | **`width 220ms cubic-bezier(.4,0,.2,1)`** + 배경 160ms. 7px → `w-10` × `--spacing:2px` = **20px** |
| 톤이 런타임 샘플링이라 DS가 소유할 수 없다 | 제품은 톤을 **CSS 변수 두 개**(`--banner-text-rgb`·`--banner-scrim-rgb`)로만 넘긴다. DS 계약은 `tone: "bright" \| "dark"` prop이고 샘플링은 제품이 갖는다 |
| progressive blur를 표현할 방법이 없다 | **CSS로는 정확히 표현된다** — `blur(22px) saturate(125%)` + 5스톱 `mask-image`, `motion-reduce`에서 둘 다 제거. Figma 근사 문제만 남는다 |

**미결이 아니라 값이었다.** 재보지 않고 "막혔다"를 세 번 반복한 것이 스켈레톤 면 색과 같은
실수다.

### 새 lifecycle — DS-D-0019

점의 폭 전환은 기존 lifecycle 어디에도 못 들어갔다. `enter`/`exit`은 `opacity`·`transform` 계열,
`loop`은 `opacity`·`rotate`·`background-position`뿐이고 **레이아웃을 다시 계산시키는 property가
어디에도 없다.**

그래서 `layout-change`를 열었다. 허용은 `inline-size`·`block-size`·`background-color` 셋이다.
`scale`로 알약을 늘리면 **두께와 반경까지 함께 늘어나** 7px 알약이 20px 자리에서 찌그러진다 —
제품도 `width`를 쓴다. 그 폭이 곧 "여기가 지금 몇 번째인가"이고, 점에는 라벨이 없어 폭 말고
현재 위치를 말하는 것이 없다.

`block-size`는 **소비처가 없다.** 이 저장소의 규칙대로 다음 재검토에서 소비처가 생기지 않으면
뺀다고 Decision에 적어 뒀다.

### 토큰 9종 · 양방향 계약이 작동했다

`crossfade-enter` · `zoom-settle` · `content-fade` · `content-rise` · `stagger-1/2/3` ·
`layout-change` · `control-hover`. **컴포넌트 이름을 붙이지 않았다** — 역할 이름이다.

토큰을 넣자 세 게이트가 차례로 막았고 전부 정당한 요구였다.

1. `motionProperties` — "이 모션이 무엇을 애니메이션하는가"를 선언하라(DS-D-0017)
2. `reducedMotionPairs` — reduced-motion 짝을 두어라
3. **`verify-figma-parity` — Figma에 없는 변수는 통과시키지 않는다**

셋째가 핵심이다. **토큰만 코드에 넣고 Figma를 비워 두는 길이 막혀 있다.** Figma Semantic
collection에 9개를 만들고 readback을 갱신했다. 변수 210 → **219**.

baseline은 playbook의 "의도적 breaking" 절차대로 갱신했다 — Decision을 먼저 쓰고, diff를
분류별로 확인하고, 그다음 복사했다.

### 다섯째 막는 것이 나왔다 — 손이 멈춰서

CSS를 실제로 쓰려니 멈췄다. 제품의 배너 부품은 **고정 `--palette-gray-*`를 쓴다.** 제품 주석이
이유를 적어 뒀다 — *"사이트 테마와 무관하게 항상 같은 모습이어야 하므로 테마에 따라 뒤바뀌는
`--gray-*` semantic 토큰 대신"*. 배너의 면은 **사진**이지 테마 표면이 아니다.

DS의 semantic 색 41개는 **전부 테마를 따라 뒤집힌다.** 그리고 CSS 게이트가 primitive 직접 소비를
막는다. 지금 상태로는 이 컴포넌트의 색을 정직하게 쓸 수 없다.

**앞의 넷은 문서를 읽어 적은 것이고 이것은 손이 멈춰서 나왔다.** 실측 명세를 gap registry에
전부 적어 두었으므로 다음 단위는 색 토큰부터 시작한다.

### 아직 컴포넌트가 없다

**이 커밋의 토큰 9종은 소비처가 0이다.** 이 저장소가 이미 지적한 상태(delay 토큰 8종이 전부
0ms에 소비처 0)와 같은 모양이며, 다음 변경 단위에서 BannerCarousel이 전부 소비한다. 그때까지
이것은 **끝난 일이 아니라 절반**이다.

## 2026-08-18 (25) — 줄을 읽는 대신 브라우저가 풀게 한다

`product.measured.json`의 187축은 제품 소스의 **줄**을 인용한다. `globals.css:82`를 읽고
"40px"이라 적는 식이다. **줄 읽기는 cascade와 media query를 모른다.** 이 저장소는 이미 그
함정을 밟은 적이 있다 — 제품의 `.app-native-checkbox`가 cascade layer 밖이라 소비처가 이길 수
없었고, 그래서 21벌 중 2벌만 그 "정본"을 썼다.

owner 요구가 **"배포환경이랑 아주 똑같아야해"**이므로, 줄 읽기로는 부족하다.

### 제품 서버는 띄우지 않는다

`.env.local`이 있어 실제 서비스에 붙을 수 있고 그건 이 저장소가 할 일이 아니다. 대신 배포본의
**정적 stylesheet만** `git show`로 읽어 빈 문서에 올리고 실브라우저가 `:root`를 풀게 한다.
제품의 런타임·DB·자격 증명에 닿지 않는다.

### 문맥 4벌로 잰다

다크·데스크톱 / 라이트·데스크톱 / 다크·모바일(375) / 다크·reduced-motion. 하나라도 빼면 "한
값"으로 보이는 것이 사실은 여럿이다.

**인용된 변수 33개 중 6개가 문맥에 따라 갈렸다:**

| 변수 | 갈리는 축 |
| --- | --- |
| `--gray-000` · `--gray-000-rgb` | 테마 (`#fafafa` ↔ `#000000`) |
| `--app-tooltip-bg` | 테마 (`#e3e4e8` ↔ `#313640`) — 툴팁은 반전된다 |
| `--glass-dropdown-frame` | 테마 (5겹 그림자의 알파가 전부 다르다) |
| `--type-body-16-size` | 뷰포트 (≤450px에서 16 → **14**) |
| `--app-tooltip-motion-scale-rest` | reduced-motion (0.97 → **1**) |

### 결과: 기록이 맞았다

여섯 갈래 전부 문서가 이미 옳게 적어 뒀다. 다크/라이트 분기도, ≤450px에서 14px로 내려가는 것도
그대로였다. **줄 읽기가 이번엔 틀리지 않았다는 것을 브라우저가 확인해 줬다** — 그리고 이제 그
확인이 매 `pnpm verify`에서 자동으로 돈다.

### 게이트가 잡은 것

첫 판에서 세 건이 실패했는데 셋 다 **내 추출 규칙이 순진해서**였다. `4px (gap-2 × --spacing:2px)`는
`--spacing` 값이 아니고 `calc(var(--button-radius) - 2px)`는 파생식이다. 변수가 **값을 직접 담는
형태**일 때만 대조하도록 좁혔다.

하나는 남겨 뒀다 — `--profile-avatar-size`는 `:root`에 없다. 특정 스코프가 소유한다는 뜻이고,
실패가 아니라 **"이 변수를 제품 전역 정본으로 인용하면 안 된다"는 신호**라 그렇게 출력한다.

### 곧바로 잡힌 결함 — 스타일시트를 덜 실었다

첫 판은 `globals.css`와 `keyframes.css`만 올렸다. 그런데 제품은 `app/layout.tsx`에서
**`tailwind.css`를 먼저** 싣고 그 안에서 `keyframes.css`를 `@import`한 뒤 `globals.css`가 온다.
그리고 `--spacing: 2px`는 `tailwind.css`의 **`@theme inline`** 블록 안에 있다.

브라우저는 `@theme`을 모른다. 그래서 그 값이 통째로 사라져 **없는 것처럼 보였고**, 제품이 4px이
아니라 **2px 격자**를 쓴다는 사실이 게이트에서 지워져 있었다. Tailwind v4가 `@theme`의 선언을
`:root`로 내보내므로 같게 번역해 싣도록 고쳤다. 지금은 `--spacing`이 `2px`로 풀린다.

이것이 곧 `w-10`이 40px이 아니라 **20px**이라는 뜻이고, 캐러셀 점의 활성 폭 판정이 여기에 걸려
있었다.

### 함께 선 것: 근거 파일 잠금

`product-evidence.lock.json`이 인용 파일 34개의 blob 해시를 배포본 커밋과 함께 담고
`verify-product-evidence`가 대조한다. 제품 파일이 바뀌면 실패하고, 제품 저장소가 없는 hosted
CI에서는 **건너뛰되 건너뛰었다고 출력한다.**

`pnpm verify`가 이제 11단계다.

## 2026-08-18 (24) — 실측의 기준을 배포본에 못 박는다

owner 요구: **"배포환경이랑 아주 똑같아야해."** 그 말이 성립하려면 먼저 *배포환경이 무엇인지*
확정돼야 한다. 확인해 보니 제품 저장소가 로컬에 **둘** 있었다.

| 경로 | 원격 | 브랜치 | 시점 |
| --- | --- | --- | --- |
| `/Users/sejunki/klipse` | `sniperfactory-official/klipse` | `louis` | 2026-08-04, dirty 29건 |
| `/Users/sejunki/klipse-web` | `KlipseAI/klipse-web` | `design` | 2026-08-18, clean |

root commit이 같아 **같은 코드베이스인데 원격이 다르다.** 그리고 배포 브랜치는 둘 다 아니다 —
`KlipseAI/klipse-web`의 **`origin/main` 7e9c3b69**("Merge pull request #50 from KlipseAI/dev")다.
`origin/HEAD`는 `dev`를 가리키고 `design`은 `main`과 15/6으로 갈라져 있으며, 그 차이에
**`globals.css`(16+/69−)가 들어 있다** — 토큰이 사는 파일이다.

### 결과: 기존 실측은 유효했다

`migration/product.measured.json`이 인용한 제품 파일 **34개**를 현 기준선(`design` 086f4a62)과
배포본(`main` 7e9c3b69)에서 blob 해시로 비교했다. **34개 전부 같았다.** 즉 187축은 배포 환경에
대해 그대로 유효하다.

### 그런데 손으로 확인하고 끝내면 다음 주에 또 모른다

그래서 고정했다. `migration/product-evidence.lock.json`이 인용 파일 34개의 blob 해시를 배포본
커밋과 함께 담고, `scripts/verify-product-evidence.mjs`가 `pnpm verify`에서 대조한다.

- 제품 파일이 배포본에서 바뀌면 **실패한다** — "해당 축을 다시 재고 lock을 갱신하라"고 말한다
- 제품 저장소가 없는 hosted CI에서는 **건너뛰되 건너뛰었다고 출력한다.** 조용한 통과는 통과가 아니다
- 변조 canary 2종(내용이 바뀐 것 · 파일이 사라진 것). 판정 기준은 *"변조가 baseline에 없던 실패를
  새로 만드는가"*다 — 이미 실패가 있을 때 canary가 가려지지 않게 한다

**이것이 이 저장소에서 처음으로 "제품이 움직였다"를 잡는 게이트다.** 그전까지 모든 게이트는 DS
내부 일관성(코드↔Figma, 토큰↔생성물)만 봤고, 제품이 바뀌면 **전부 초록인 채로 실측이 낡았다.**

### "카탈로그가 닫혔다"를 정정한다

인계서의 그 문장은 gap registry의 **합산 우선순위 15종**이 소진됐다는 뜻인데, 읽으면 "세 화면을
그릴 수 있다"로 들린다. 실제로 그 오해가 일어났다. 같은 문서군의 gap registry는 정반대를 적어
두고 있다 — *"현재 셋 다 미달이고, 가장 먼 것은 에디터다."*

정확한 층위는 셋이다: **규범·구현·Figma 전부 없는 것**(타임라인 · 파형 · 인스펙터 · 캔버스 노드 ·
미니맵 · 툴바 · 드롭존 · 캐러셀 등), **규범만 있는 것**(`editor-workspace` · `app-shell`),
**Figma만 없는 것**(Skeleton 하나).

## 2026-08-18 (23) — Components 페이지를 정리하고 목적문을 생성물로 만든다

Cover와 Foundations를 세운 뒤 Components 페이지를 열어 보니 두 가지가 더 있었다.

### 새 컴포넌트 6개가 섹션 밖에 흩어져 있었다

TextField · SegmentedControl · Checkbox · Slider · SelectableListRow · Avatar. 만들 때 계약(변수
바인딩 · 기하 · variant)은 맞췄지만 **어디에 두는지는 아무도 검사하지 않아** 페이지 바닥에 그대로
남아 있었다. Forms 섹션을 만들어 입력 계열을 모으고 나머지 둘은 Content로 넣었다.

섹션 순서는 **읽는 순서**를 따른다 — Actions(누르는 것) → Forms(값을 넣는 것) → Content(내용) →
Overlays(위에 뜨는 것) → Feedback(알리는 것) → Shell(껍데기) → Icons(글리프).

### 세트를 클릭해야만 설명이 보였다

이제 세트마다 **이름과 목적문 한 줄이 캔버스에 보인다.** 그런데 그 문장을 손으로 옮기면 규범
문서가 바뀌어도 Figma가 따라오지 않는다. 그래서 옮기지 않고 **뽑는다**:

`scripts/build-figma-summaries.mjs`가 각 규범 문서의 H1 다음 첫 문단 첫 문장을 모아
`figma/component-summaries.json`을 생성하고 `pnpm check`가 어긋남을 실패로 만든다. 이름 해석은
`build-figma-snapshot.mjs`와 같은 규칙(`figmaNames ?? figmaName`)이라 Menu처럼 Figma에서 둘로
나뉘는 문서도 함께 실린다. 탐지력은 손으로 확인했다 — badge의 첫 문장을 한 글자 바꾸니 `--check`가
**exit 1**로 떨어졌고 되돌리니 통과했다.

옛 description은 `klipse component id: input`으로 시작해서, 그대로 실었더니 라벨에 **기계 ID가
찍혔다.** 그것이 이 생성물을 만든 직접적인 계기다.

### 실측으로 드러난 것 셋

| 증상 | 원인 |
| --- | --- |
| Forms 섹션의 글자가 안 보였다 | Figma 기본 채움이 짙은 회색(0.267)인데 나머지 6개는 흰색이었다 |
| 흰 면이 내용 밖에서 끊겼다 | **섹션은 자식을 붙여도 스스로 커지지 않는다** |
| 이 페이지만 배경이 순검정 | 다른 세 페이지는 밝은 회색이었다 |

셋 다 **형제에서 값을 읽어** 맞췄다. 짐작한 값을 넣지 않았다.

## 2026-08-18 (22) — Figma 파일에 Cover와 Foundations를 세운다

owner 지적: **"지금 피그마에 있는것도 그지같던데."** 재보니 사실이었다.

### Foundations 페이지가 통째로 비어 있었다

최상위 노드 **0개**. 변수 210개와 style 22개가 파일에 있는데 **보이는 것이 하나도 없었다** —
색 스와치도, 타입 견본도, 간격 눈금도 없었다. Cover 페이지도 없어 파일을 열면 뭐가 뭔지 알 수
없었다.

### 왜 이렇게 됐나 — 게이트가 검사하는 것만 잘돼 있었다

parity 게이트는 raw 값 0 · 변수 바인딩 · 기하 일치를 본다. 그건 변조 canary 34종으로 지켜진다.
그런데 **"사람이 열었을 때 쓸 수 있는가"는 아무도 검사하지 않는다.** 그래서 그 부분만 통째로
비어 있었다.

오늘 반복된 교훈과 같다 — **게이트는 시킨 것만 본다.** 계약을 맞추는 데 집중하느라 파일을
열어본 사람의 눈으로 보지 않았다.

### 세운 것

| 페이지 | 내용 |
| --- | --- |
| **Cover**(신설, 맨 앞) | 파일이 무엇이고 어디를 보는지. 정본이 저장소라는 것과 publish 전이라는 사실 |
| **Foundations** | Color · Typography · Spacing & Radius · Elevation 네 절 |

**색은 Light·Dark를 한 화면에 나란히 놓았다.** `setExplicitVariableModeForCollection`으로 두 열이
각자 모드를 고정하므로 같은 변수가 두 테마에서 어떻게 보이는지 **동시에** 보인다. 다크 열에서
`background-inset`·`menu`·`overlay`·`surface`가 같아 보이는 것이 **눈으로 바로 확인된다** —
그동안 말로만 설명하던 충돌이다.

간격·반경은 **막대 길이와 모서리가 변수 값 그대로**다. 숫자를 적지 않은 이유는 적은 숫자와 그린
것이 갈라질 수 있기 때문이다. 타이포는 실제 text style을 적용했고 그림자는 effect style을 얹었다 —
**전부 바인딩이라 값이 바뀌면 문서가 따라온다.**

### 남은 것

Components 페이지의 정리(세트별 설명과 사용 예시)와 Templates. 그리고 publish는 여전히 owner의
손에 있다.

## 2026-08-18 (21) — Loading 패턴 · 새 CSS가 하나도 없다

`DS-P3-010`의 두 번째 패턴. Skeleton이 서면서 선행이 풀렸다. pattern의 Web 상태가 `partial`이다.

### 컴포넌트가 아니라 경계다

**새 CSS를 하나도 만들지 않았다.** 부품은 Spinner와 Skeleton이 이미 소유하고, 이 패턴이 정하는
것은 둘이다 — **무엇을 언제 쓰는가**와 **누가 로딩을 알리는가**.

| 자리 | 쓰는 것 |
| --- | --- |
| 올 내용의 **모양을 아는** 곳 | Skeleton — 도착했을 때 화면이 튀지 않는다 |
| 모양을 **모르는** 곳 | Spinner — 틀린 자리표시는 없는 것보다 나쁘다 |
| 진행률을 **아는** 곳 | 아직 없다 |

### 영역이 알리고 자리표시는 장식이다

```tsx
<section aria-busy={loading} aria-label="프로젝트 목록">
  {loading ? <Skeleton … /> : <ProjectList … />}
</section>
```

**스켈레톤이 여덟 개 놓인 자리에서 각각이 읽히면 같은 말이 여덟 번 들린다.** 한 영역이 한 번
말한다. Spinner와 Skeleton은 스스로 읽히지 않으며 그 판정은 각 컴포넌트가 이미 갖고 있다 —
이 패턴은 그 둘이 **합쳐졌을 때**의 계약을 고정한다.

실브라우저 5건이 그 합성을 잰다 — 자리표시가 전부 `aria-hidden`인지, 끝나면 `aria-busy`가
내려가고 자리표시가 사라지는지, reduced-motion에서 둘 다 반복이 1회인지.

### delay 토큰을 다시 세어 보니 8종이 아니라 11종이었다

인계서 (1a)가 `motion-*-delay` "8종"이라고 적어 두었는데 실제로는 **11종**이다. 전부 0ms이고
CSS 소비처가 0인 것은 맞다 — 결론은 같지만 수가 틀렸다. **gap registry에서 아홉 번 그랬듯
인계서의 수치도 다시 센다.**

### 남은 것

`App Shell`이 `DS-P3-010`의 마지막이다. determinate progress는 접근성 계약이 선행이라 이 패턴은
두 갈래만 소유한다.

## 2026-08-18 (20) — Skeleton · (1c)는 답이 아니라 틀린 질문이었다

`import { Skeleton } from "@klipse-design/react"`. **owner 판정 대기로 두었던 (1c)가 판정 없이
풀렸다** — 제품을 직접 재보니 물어야 할 질문이 달랐다.

### 제품은 면 색을 고르지 않는다

```
면:        rgb(var(--gray-000-rgb) / 8%)
하이라이트: linear-gradient(90deg, /0%, /9%, /0%)
```

`--gray-000`은 **전경색**이고 테마마다 뒤집힌다(라이트 `palette-gray-1000` · 다크
`palette-gray-000`). 즉 제품은 **테마별 면을 고른 적이 없다.** 전경색을 낮은 알파로 깔면
어느 배경 위에서도 성립하기 때문이다.

인계서 (1c)는 이렇게 적혀 있었다 — "면 색이 문제다. `background-inset`은 다크에서
surface·menu·overlay와 넷이 동일하고 `background-raised`는 라이트에서 셋이 동일하다."

**그 문장은 "스켈레톤에 solid 면 토큰이 필요하다"를 전제한다.** 실측이 그 전제를 부정한다.
고를 면이 없으므로 죽을 조합도 없다. owner가 정할 것이 아니라 값 하나였다.

DS에는 이미 같은 판단이 둘 있었다 — Spinner의 트랙(`currentcolor 22%`)과 ProjectCard의 스크림.
후자의 주석은 **"색 토큰이 아니라 `color-mix`로 불투명도를 직접 적는다"**고 이미 적어 두었다.

### 왜 대기했었나

**인계서에 적힌 판정 문장을 직접 재보지 않고 그대로 옮겼다.** 이번 세션에서 gap registry의 수치는
아홉 번 다시 셌으면서 인계서의 판정은 같은 의심을 하지 않았다. 같은 실수이고, 규범 문서라고
해서 실측을 면제받지 않는다.

### 흐름은 `background-position`이다

loop lifecycle의 허용 property는 `opacity`·`rotate`·`background-position` 셋이고(DS-D-0016),
제품의 우세 기법도 면 그라디언트 이동이라 둘이 같은 곳을 가리킨다 — **층을 하나 덜 만든다.**
reduced-motion에서 흐름은 짧아지는 것이 아니라 사라지고, 테스트가 두 motion context를 갈라서 잰다.

### 공개 API 표면 baseline 갱신 (additive)

심볼 `Skeleton`, 타입 `SkeletonProps`·`SkeletonShape`가 늘었다. **두 커밋 전에 세운 게이트가
이 변경을 잡아 baseline과 이 항목을 함께 요구했다** — 설계대로 동작했다.

## 2026-08-18 (19) — Project Grid · `layout-project-card-minimum`이 소비처를 얻었다

`DS-P3-010`의 세 패턴 중 하나가 섰다. 공용 recipe `.louis-project-grid` 하나이고 pattern의 Web
상태가 `not-ready` → `partial`이다.

### viewport가 아니라 container다

```css
grid-template-columns: repeat(auto-fill, minmax(min(카드최소, 100%), 1fr));
```

`auto-fill`은 **grid 자신의 content box**로 열 수를 계산한다. 사이드바가 접혀 유효 폭이 늘면 같은
viewport에서 열이 늘고, 좁은 패널 안에 놓이면 준다 — **media query로는 그 둘을 구분할 수 없다.**

테스트가 그것을 그대로 잰다: **viewport를 바꾸지 않고 container 폭만** 바꿔 1·2·3·4·5열을
확인한다. media query 구현이었다면 전부 같은 열 수가 나와 실패한다. 규범의 compatibility
profile(2 / 3@720 / 4@1200 / 5@1800)은 `floor((W + gap) / (최소 + gap))`으로 환산해 대조하며,
숫자를 손으로 적지 않고 토큰에서 유도한다.

### 1열 fallback이 공짜로 따라온다

`min(최소, 100%)`가 없으면 container가 카드 최소 폭보다 좁을 때 track이 container를 넘어
**가로 스크롤이 생긴다.** 규범이 못 박은 자리이고 테스트가 `scrollWidth ≤ clientWidth`로 잡는다.

### T-5가 해소됐다

gap registry가 `layout-project-card-minimum`을 **"소비처 0 · 존재하지 않는 알고리즘을 기술하는
토큰"**으로 분류하고 owner 판정 대기로 두었다. 그 추측이 맞았다 — **이 토큰은 카드가 아니라
그리드의 것이었고**, Project Grid가 서면서 첫 CSS 소비처가 생겼다.

인계서 (1a)의 `color-stroke-strong`과 같은 종류다. **"소비처가 0"은 폐기 사유가 아니라 아직
그것을 쓸 것이 서지 않았다는 뜻일 수 있다.** 이름이 뜻과 맞는지를 먼저 본다.

### 패턴 recipe의 자리가 생겼다

`packages/css/src/pattern/`을 신설하고 빌드가 `component/` 다음에 그것을 모은다. 이 저장소에서
pattern은 component와 **다른 권위 계층**(`design/patterns/*`가 별도 정본)이라 recipe도 그 구분을
따른다.

### 남은 둘

`Loading`은 Skeleton에 막혀 있다((1c) 면 색 판정). `App Shell`은 rail·drawer·scroll root·safe
area가 남아 있고 compact 드로어의 layer 자리도 사다리에 없다.

## 2026-08-18 (18) — release dry-run과 공개 API 표면이 게이트가 됐다

`verify-consumer`가 넷에서 **여섯**으로 늘었다. `DS-P3-008`의 남은 완료 근거 둘이다.

### release dry-run — publish하지 않고 담길 것만 본다

`npm pack --dry-run`으로 세 패키지의 배포 파일 목록을 읽어 계약과 대조한다. **`files` 필드가
틀리면 dist가 빠진 채 올라가거나 source·test가 함께 올라가는데, 둘 다 publish 뒤에야 드러난다.**

담겨야 하는 것(`dist/index.js`·`.d.ts`·생성 CSS·고지문)과 담기면 안 되는 것(`src/`·`test/`·
`tsconfig`·`baseline/`)을 양쪽으로 본다.

### 공개 API 표면 baseline

`packages/react/api-surface.json`에 **심볼 56 · 타입 89**를 고정하고 `dist/index.d.ts`와 매 실행
대조한다. 심볼이 사라지면 **breaking**, 새로 생기면 **additive**로 각각 다른 문구로 실패한다.

**검출력을 실측으로 증명했다** — baseline에서 `Avatar`를 빼면 additive로 잡히고, 없는 심볼을
넣으면 breaking으로 잡힌다. 토큰 baseline과 같은 규율이라, **이 파일을 갱신하는 변경 단위에는
Updates의 migration note가 함께 있어야 한다.**

### DS-P3-008에 남은 것

changesets 도입 · `private: true` 해제 · 버전 정책. **셋 다 `DS-D-0006`이 `proposed`인 동안에는
하지 않는다** — 플레이북이 "의존성 도입은 Decision으로 승인된 뒤"로 정해 두었고, `private`를
푸는 것은 실수로 publish될 수 있는 문을 여는 일이라 릴리스 흐름보다 먼저 오면 안 된다.

## 2026-08-18 (17) — DS-P3-008 소비자 게이트 · 테스트는 self-reference였다

`pnpm verify`에 `verify-consumer`가 붙었다. **패키지가 저장소 밖에서 실제로 소비되는가**를 처음
확인한다.

### 지금까지의 게이트는 전부 저장소 안을 봤다

생성물 drift · 토큰 graph · CSS 저작 규칙 · Figma parity · 실브라우저 650건. 그 전부가 초록이어도
"소비자가 `import { Button } from "@klipse-design/react"`를 쓸 수 있는가"는 한 번도 확인된 적이
없었다.

**테스트가 그 질문에 답하지 못한 이유가 있다.** 테스트 파일이 `packages/react/test/` 안에 있어서
`@klipse-design/react`가 **package self-reference**로 해석된다. export map을 보긴 하지만
"바깥에서 설치해 쓴다"와는 다르다 — 실제로 워크스페이스 패키지는 **루트에 링크조차 돼 있지
않았고**, 루트에서 resolve하면 셋 다 실패했다.

루트를 실제 소비자로 만들었다(`workspace:*` 세 줄).

### 확인하는 것 넷

1. **선언된 서브패스 16개**(react 3 · css 7 · tokens 6)가 전부 resolve된다
2. **Node에서 SSR 렌더된다** — import·렌더 시점에 브라우저 API를 만지면 여기서 죽는다
3. 타입 선언이 `.d.ts`로 함께 나온다
4. **tree-shaking이 실제로 동작한다** — Button만 쓴 번들 1KB, Dialog까지 쓴 번들 2KB

4번에는 **canary가 붙는다.** "Dialog 문자열이 없다"만 보면 탐지가 죽어도 통과하므로, Dialog를
실제로 쓰는 번들에는 그 문자열이 **있어야** 한다는 반대 방향을 함께 증명한다.

### 스크립트가 두 번 틀렸고 둘 다 기록해 둔다

- **임시 디렉터리를 저장소 밖에 만들었다.** Node가 위로 올라가며 `node_modules`를 찾지 못해
  아무것도 resolve되지 않았다 — 소비자 관점을 재현하려던 것이 오히려 아무것도 재현하지 못했다
- **`require.resolve`로 쟀다.** 이 패키지들은 DS-D-0002에 따라 **ESM 전용**이라 `require` 조건이
  없고, CJS로 재면 "No exports main defined"가 나온다. **패키지 결함이 아니라 재는 쪽이 틀린
  것이다.** `import.meta.resolve`로 바꿨다

## 2026-08-18 (16) — Avatar가 Figma에 섰다

`DS-F-006-avatar`. component set 18 → **19개**.

**폴백을 path가 아니라 원 둘로 그렸다.** Figma의 `vectorPaths`가 SVG arc(`a`) 명령을 받지 않아
코드의 글리프 path를 그대로 넣을 수 없었다. 변환해서 넣는 대신 머리·어깨 두 원으로 같은 그림을
만들었다 — 좌표가 크기의 비율로 남아 **두 크기가 같은 그림**이 되고, 변환 과정에서 모양이 조용히
달라질 여지가 없다.

**계약이 stroke·effect 0을 요구한다.** 코드 쪽 테스트가 테두리·그림자·`::after` 층이 0인지
확인하는 것과 짝이다. 링을 소유하지 않는다는 판정을 **양쪽에서 기계가 지킨다.**

## 2026-08-18 (15) — Avatar · Home의 구멍이 하나 남았다

`import { Avatar } from "@klipse-design/react"`. 카탈로그 component 17 → **18개**.

### 제품에 공용 구현이 "부분만" 있었다

`UserCircleDefaultAvatar.tsx`가 **기본 아바타 SVG 하나**(28×28 · `currentColor` · `aria-hidden`)만
소유하고, 아바타 본체 — 이미지/폴백 분기와 크기 — 는 셸 파일 `Gnb.tsx`에 인라인이다. 크기는
`--profile-avatar-size`가 28 기본이고 ProjectHeader 슬롯에서 24로 덮인다. **그 두 값을 그대로
옮겼다.**

### 링을 소유하지 않는다

제품은 프로필 트리거에 진행률 링을 겹치지만(`--profile-ring-width/gap: 2px`, `-progress`)
**아바타는 신원 표식이고 링은 사용량이다.**

흡수하지 않은 이유 셋 — 목록·댓글·멘션의 모든 아바타가 쓰지 않을 progress API를 갖게 되고,
링을 아바타 밖에서 쓸 수 없게 되며, 무엇보다 **(1c)의 미결 판정(determinate 진행률의 접근성
계약, 제품 전체에 `role="progressbar"`가 1곳뿐)이 이 컴포넌트의 API로 새어 들어온다.**

**테스트가 테두리·그림자·`::after` 층이 전부 0인지 확인한다** — 나중에 누가 링을 여기에 넣으면
게이트가 잡는다.

### 크기가 control 계단을 따르지 않는다

24·28은 Button·Text Field의 40/32와 맞지 않는다. **아바타는 컨트롤이 아니라 표식**이라 나란히
서도 줄이 어긋나지 않는다 — 계단을 따를 이유가 없었다. Slider·SegmentedControl에서 계단을 따른
것과 반대 판정이고, 기준은 "컨트롤인가"다.

### 이름을 root가 소유한다

`name`이 있으면 root가 `role="img"` + `aria-label`을 갖고 **안의 `<img>`는 `alt=""`다** — 둘 다
이름을 가지면 같은 이름이 두 번 읽힌다. `name`이 없으면 root가 `aria-hidden`이다. 목록 행이나
댓글 머리처럼 **옆에 이름이 이미 적혀 있는 자리에서는 생략이 옳다.**

### 남은 것

Home의 구멍은 이제 **`BannerCarousel` 하나**다. caret 3종이 이미 섰으므로 선행 조건이 없다.
Figma component set(`DS-F-006-avatar`)도 남았다.

## 2026-08-18 (14) — hosted CI가 처음 초록이 됐다

[run 32094705359](https://github.com/KlipseAI/louis/actions/runs/32094705359) — clean checkout에서
install → 브라우저 설치 → build → check → verify → `--require-tracked` → **실브라우저 632건**이
전부 통과했다. `DS-GOV-000`의 네 조건 중 **원격 연결과 hosted CI 둘이 done**이 됐다.

### 초록에 이르기까지 네 번 실패했고 넷 다 로컬에서 안 보이던 것이다

1. **브라우저 바이너리 설치 단계가 없었다** — 로컬 캐시 때문에 로컬에서만 통과
2. **632건이 CI에서 한 번도 돈 적이 없었다** — `verify`는 러너의 실패 전파만 증명한다
3. **앞 테스트의 포인터가 남아 행이 `:hover`였다** — 받은 값 `#171b22 / 0.08`이
   `color-accent-ghost-hover`였다. `surface-states`가 이미 적어 둔 함정을 이 파일이 안 따랐다
4. **틀린 진단 하나** — 3번을 "범위 한정 누락"이라 단정했다가 CI가 반증했다

### 방법 하나가 섰다

원인을 모를 때 **단언을 고치지 않고 진단을 실어 CI 한 사이클을 돌린다.** 3번이 그렇게 한 번에
풀렸다 — `theme: null`·`prefersDark: false`·`fixtureCount: 1`이 두 가설을 지웠고 alpha 0.08이
답을 가리켰다. 기대값은 끝까지 바꾸지 않았다.

**로컬 초록은 이 종류를 증명하지 못한다.**

## 2026-08-18 (13) — 원격이 생겼고 첫 hosted CI가 실패했다

owner가 `KlipseAI/louis`(private)를 만들고 `bf62eba`까지 push했다. **첫 hosted CI 실행이
실패했다** — 그리고 그 실패가 옳았다.

### 브라우저 바이너리 설치 단계가 없었다

```
browserType.launch: Executable doesn't exist at .../chrome-headless-shell
```

브라우저는 lockfile에 없는데 [DS-D-0005](../governance/decisions/DS-D-0005-test-stack.md)가
실브라우저 러너를 1단계에 뒀으므로 `pnpm verify`의 test-harness가 실제로 Chromium을 띄운다.
로컬에는 2026-08-14에 승인받아 받아 둔 캐시가 있어 **로컬에서만 통과하고 clean checkout에서만
실패하는** 상태였다.

`pnpm exec playwright install --with-deps chromium` 단계를 넣었다.

### 실브라우저 회귀 전량을 CI에 붙였다

`verify`의 test-harness는 **러너가 실패를 전파하는지만 증명하고 suite 자체를 돌리지 않는다.**
그래서 컴포넌트 acceptance test 632건이 hosted CI에서 한 번도 돈 적이 없었다. `pnpm test`
단계를 추가했다 — 로컬에서 두 번 관측된 간헐 실패도 이 단계가 반복 실행으로 드러낼 자리다.

### DS-GOV-000이 `partial`이 됐다

넷 중 **원격 연결이 done**이고, hosted CI는 **초록으로 통과한 실행이 아직 없어 미충족**이다.
owner 승인과 registry/docs/Figma publish 권한은 그대로다. 상태를 미리 올리지 않는다.

### klipse-web 채택의 길이 하나 열렸다

[채택 계획](../../migration/klipse-web-adoption.md)이 "git dependency는 **불가 — DS 저장소에
원격이 0개다**"라고 적어 두었는데 그 전제가 바뀌었다. 다만 private 저장소를 의존성으로 쓰려면
klipse-web 빌드 환경에 읽기 권한(deploy key 또는 토큰)이 필요하고 그것은 owner가 정할 일이다.
registry publish는 여전히 `DS-GOV-000`이다.

### 이것이 hosted CI의 값이다

로컬 게이트는 스무 번 초록이었고 clean checkout이 **한 번에** 잡았다.

## 2026-08-18 (12) — caret 3종 · 배너 캐러셀의 선행 조건이 풀렸다

글리프 26 → **29개**, Figma 아이콘 component도 29개.
`import { IconCaretLeft, IconCaretRight, IconCaretDown } from "@klipse-design/react/icons"`.

### 저장소에서 직접 그렸다

출처를 `upstream`으로 적으려면 상류 좌표를 대조해야 하는데 그럴 수 없었다. **대조하지 않고
upstream이라 적으면 그것이 추정 출처이고, DS-D-0008 결정 3이 추정 출처를 빌드 실패로 둔다.**
그래서 `origin: "original"`로 두고 직접 그렸다 — 24 격자 위 45° 갈매기꼴 한 겹, stroke 1.5,
round cap/join으로 세트의 다른 글리프와 같은 선 언어를 쓴다. 꼭짓점을 중심(12)에서 좌우 3 ·
상하 7.5로 두어 세 방향이 회전 대칭이다.

`origin`은 `original`과 `upstream` 둘뿐이고 둘 다 정직한 선택지다. 모르는 것을 아는 척하는
칸이 없다는 것이 이 provenance 계약의 값이다.

### 왜 지금인가

[gap registry](../../migration/figma-gap-registry.md)의 재계수가 Home의 남은 구멍을 **Avatar와
BannerCarousel 둘**로 좁혔는데, 배너 캐러셀은 화살표 없이 세울 수 없다. 이 셋이 그 선행 조건이다.

## 2026-08-18 (11) — DS-F-007 카탈로그 재계수 · Home의 구멍이 둘 남았다

`DS-F-006`이 닫혀 Figma component가 1개 → **18개**가 됐으므로 Home이 요구하는 자산을 다시 셌다.

**8종 중 6종이 섰다.** Button · ProjectCard · SidebarNavItem·AppTopBar · Menu · EmptyState · Badge.
남은 둘은 **Avatar**와 **BannerCarousel·HomeBannerSlide**다 — 아바타는 셸 파일에 인라인이고
기본 아바타 SVG만 분리돼 있으며, 배너 캐러셀은 **허브 3곳이 공유**한다. 연체 배너도 카탈로그에
없는 banner/alert 계열이다.

**배너 캐러셀에는 아이콘이 먼저 필요하다** — `caret-left`·`caret-right`·`caret-down` 셋이 여전히
미보유이고 아이콘은 26개 그대로다.

### 화면 gap의 수는 갱신하지 않았다

72·130·144는 화면을 축 단위로 실측한 값이고, 그 수를 바꾸려면 **Figma에서 Home을 실제로 다시
조립해야 한다.** 아직 하지 않았으므로 카탈로그 gap(8종 → 2종)만 갱신했다. 둘을 섞어 쓰지 않는다.

## 2026-08-18 (10) — `select`를 `not-planned`로 정한다 · 카탈로그 상태가 전부 확정됐다

manifest의 마지막 `not-ready` 항목을 닫았다. **고르기는 Menu가 소유한다.**

### 실측이 판정을 내렸다

네이티브 `<select>`가 **12벌**인데 **전부 `/admin` 아래**다 — `AdminClient` 1 ·
`CaptionTemplateManagement` 9 · `ProductMetricsDashboard` 2. 배포 화면(Home·Highlight·Editor)에는
**0벌**이고, 제품은 트리거 + 메뉴 패널로 고른다(11파일). DS에는 이미 `ActionMenu`와
`CompositePopover`가 있어 그 자리를 덮는다.

gap registry 우선순위 1~15 어디에도 `select`가 들지 않은 이유가 이것이었다. **관리자 도구는 이
저장소의 소비 surface가 아니다.**

수요가 생기면 Decision으로 이 판정을 뒤집고 다시 연다 — `not-planned`는 "안 만든다"가 아니라
"계획에 없다는 것이 결정됐다"는 뜻이다.

### `color-stroke-strong`이 폐기 후보에서 빠졌다

인계서 (1a)가 "소비처 0이고 이름이 가리키는 것이 그 이름을 안 쓴다"고 분류한 넷 중 하나였는데,
Checkbox가 첫 소비처가 되면서 이름이 뜻과 맞게 됐다 — 경계가 반드시 보여야 하는 자리다.
넷 → **셋**.

### 카탈로그 상태가 전부 확정됐다

manifest component 17개 중 16개가 `partial`이고 하나가 `not-planned`다. **`not-ready`가 0개다** —
"아직 모르겠다"로 남은 항목이 없다.

## 2026-08-18 (9) — Slider가 Figma에 섰다 · DS-F-006이 닫혔다

`DS-F-006-slider` 완료. component set 17개 → **18개**이고 **네 컴포넌트가 전부 Figma에 섰다.**

### 복합 키를 쓰는 유일한 컴포넌트다

`{size}/{variant}` 네 그룹(`md/thumb`·`md/track`·`sm/thumb`·`sm/track`)이다. Variant 축이 레일
두께 4↔28과 썸 16↔2×14를 바꾸므로 size 하나로 묶으면 두 값이 한 배열에 섞여 **어느 쪽이 어느
변형의 것인지 사라진다.**

되읽기가 그 키로 묶어 주고 measured가 같은 키를 쓰자 **비교 코드를 한 줄도 바꾸지 않고**
대조가 성립했다. 키를 아무도 해석하지 않기 때문이다.

### 변조 canary가 그 검출력을 증명한다

`tamperCompositeKeyGeometry`는 `md/track`의 레일 높이를 `md/thumb`의 값으로 바꿔 넣는다. 복합
키가 없었다면 그 변조는 "배열에 4가 하나 더 있다" 정도로 묻힌다. canary 33종 → **34종**.

### 부품이 갈리면 이름으로, 값이 갈리면 복합 키로

Checkbox는 표시가 `Check`(5×9)와 `Dash`(10×2)로 **다른 부품**이라 이름을 나눴고, Slider는
레일과 썸이 **같은 부품의 다른 값**이라 복합 키를 썼다. 둘을 가르는 기준이 이번에 섰다.

### DS-F-006이 닫혔다

Figma component set 18개, 변수 210개, style 22개. 카탈로그 15항목 중 Web·Figma 모두 `partial`이
14개이고 `select`만 `not-ready`다. 남은 Figma 작업은 `DS-F-007` 화면 재조립 gap 재계수와
`DS-F-008` 수동 publish다 — 후자는 owner가 Figma UI에서 직접 하며 자동화하지 않는다.

## 2026-08-18 (8) — Checkbox가 Figma에 섰다

`DS-F-006-checkbox` 완료. component set 16개 → **17개**.

**체크 표시를 CSS와 같은 구조로 그렸다** — 5×9 사각형의 오른쪽·아래 변만 남기고 45° 회전이다.
Figma의 회전은 `width`/`height`를 바꾸지 않으므로 계약값 5×9가 그대로 남는다. 벡터 패스로 그리면
모양은 같아도 계약이 코드와 다른 수를 갖게 된다.

**표시를 `Check`와 `Dash` 두 이름으로 나눴다.** 하나로 두면 5×9와 10×2가 한 배열에 섞여
"variant마다 다릅니다"로 걸린다. 둘은 서로 다른 부품이고 각각 한 variant에만 있다 — 이것이
variant마다 기하가 다른 부품을 기존 모델 안에서 다루는 방법이다.

## 2026-08-18 (7) — SelectableListRow가 Figma에 섰다

`DS-F-006-selectable-list-row` 완료. Figma component set 15개 → **16개**.

**선택 표식이 계약이 됐다.** parity 게이트가 `Marker`의 폭 3px을 대조하므로, 누군가 "면이 있으니
표식은 없어도 된다"고 지우면 게이트가 잡는다 — 다크에서 `background-inset`이 `surface`와 같은
색이라 표면 위 목록에서 선택이 통째로 사라지는 자리다.

`State`(Default·Selected·Disabled)는 **코드에 없는 축**이다. 코드에서 `selected`는 boolean prop이고
`disabled`는 `<button>`의 네이티브 속성인데 Figma에는 boolean 상태의 시각 표현이 없다. Button이
Hover/Active를 variant로 두는 것과 같은 처리이며 `figmaOnlyProperties`가 사유와 함께 선언한다.

**빌드에서 잡은 결함 하나.** `figma.createAutoLayout`이 만든 프레임에 **기본 흰 면이 남아** 선택된
행(회색) 위에서 글자 묶음이 흰 상자로 드러났다. 스크린샷으로 보고 지웠다 — 되읽기의 `rawFills`는
0이었으므로 게이트로는 잡히지 않는 종류다(변수에 묶이지 않은 것이 아니라 **있으면 안 되는 면**이
있었다).

## 2026-08-18 (6) — SegmentedControl이 Figma에 섰다

`DS-F-006-segmented-control` 완료. Figma component set 14개 → **15개**이고 `segmented-control`의
Figma 상태가 `not-ready` → `partial`이다.

### 선택/비선택을 variant 축으로 나누지 않았다

한 variant 안의 두 자손(`Segment` · `Segment-Selected`)으로 두었다. **색만 다르고 기하가 같아서**
축을 나누면 같은 것을 두 번 세게 된다. parity 게이트가 둘의 기하를 각각 대조하므로 한쪽만
어긋나도 걸린다.

이 판정 덕분에 SegmentedControl은 게이트 확장(복합 키)을 기다리지 않아도 됐다 — 앞선 조사에서
"막힘"으로 적었던 것을 정정한 결과다.

### 헤어라인은 OUTSIDE stroke다

CSS는 spread-only box-shadow로 그린다. Figma에서 **레이아웃을 건드리지 않는 등가물이 OUTSIDE
stroke**다. INSIDE로 바꾸면 안쪽 콘텐츠 박스가 줄어 세그먼트 높이가 32에서 31이 되고, 그 순간
게이트가 실패한다 — 계약에 `align: "OUTSIDE"`로 못 박았다.

### 게이트가 잡은 것 둘

빌드가 아니라 **등록 과정에서** 걸렸다.

- **stroke 되읽기 형식.** `{ self: { weight, align } }`로 덤프했는데 정본 형식은
  `{ self: ["0.5|OUTSIDE"] }` 문자열 배열이다. 형식이 어긋나자 "stroke 역할 self이 Figma에
  없습니다"로 걸렸다
- **`borderWidth` 키 이름이 규약이다.** 보이는 테두리 두께를 `trackBorderWidth`로 적었더니
  게이트의 허용 stroke 집합이 **비어서** 0.5가 통째로 거부됐다 — `verify-figma-parity`가
  `spec.borderWidth`로 그 값을 읽는다. measured와 테스트를 함께 옮겼다

### 남은 것

Figma component set 셋 — Slider(복합 키 canary와 같은 단위) · Checkbox · SelectableListRow.

## 2026-08-18 (5) — Selectable List Row · 카탈로그 15/15

카탈로그 15순위이자 **마지막 항목**이다.
`import { SelectableListRow } from "@klipse-design/react"`가 동작한다.

### 등록부의 수치가 처음으로 맞았다

"하이라이트 2 · 에디터 1" — 실측도 3벌이다. 앞의 여덟 번은 매번 틀렸고(ProjectCard 3→4,
EmptyState 7→9, TextField 16→약 40, Badge 두 축이 죽어 있었고, Spinner 5→22, 셸 31→두 컴포넌트
합산, Slider 9→37, SegmentedControl 3파일→8파일) 이번이 처음이다.

셋이 합의하는 것은 골격이다 — 가로 flex 행, 선행 슬롯, 글자 묶음, hover 면, **전환 140ms ease.**
갈라지는 것은 선택을 무엇이 소유하느냐다. 하이라이트 2벌은 **행의 면**이, 에디터 1벌은 행 안의
**체크박스**가 갖는다. 후자는 이 컴포넌트가 아니다 — 행을 버튼으로 만들면서 체크박스를 넣으면
컨트롤이 중첩된다. 경계를 규범에 적었다.

### 선택 면 하나에 기대면 다크에서 사라진다

DS에는 이미 선택 가능한 행이 있다 — `SidebarNavItem`이 `aria-current` + `background-inset`으로
선택을 표현한다. **그것이 성립하는 이유는 사이드바가 캔버스 위에 있기 때문이다.**

표면 위에 놓고 실측했다.

| 테마 | 표면 | 선택 면 | 구분되는가 |
| --- | --- | --- | --- |
| light | `#fafafa` | `#eaebee` | 예 |
| dark | `#313644` | `#313644` | **아니오** |

워크샵에서 눈으로 확인했다 — 다크·표면 위에서 선택된 행이 나머지와 **완전히 같아 보이고 파란
3px 선행 표식만 남는다.** 표식이 없었으면 선택이 보이지 않을 자리다. 색 하나로 상태를 전달하지
않는 것은 그 자체로도 맞다.

**같은 위험이 `SidebarNavItem`에 남아 있다.** 앱 셸 사이드바가 캔버스 위에 있는 동안에만
성립하며, 표면 위에 놓이는 배치가 생기면 선택이 사라진다. 규범의 Known deviations에 적었다.

### 기하를 제품에서 옮기지 않았다

제품의 gap 10px과 반경 14px에 맞는 semantic 토큰이 없고, 새 토큰은 token source를 바꿔 Figma
재적용이 따라온다. 대신 **DS에 이미 있는 선택 가능한 행**인 SidebarNavItem의 값을 따랐다 —
같은 성질의 두 컴포넌트가 다른 기하를 갖지 않게 하는 것이 더 중요하다.

### `listbox`가 아니다

목록을 방향키가 아니라 **Tab이 훑는다.** roving focus를 흉내 내지 않는다 — 그것은 `listbox`의
계약이고 이 컴포넌트는 버튼 목록이다. 목록이 길어져 Tab이 부담이 되면 그때 `listbox` 계약을
갖는 별도 컴포넌트가 필요하다.

### 카탈로그가 닫혔다

gap registry의 15순위가 전부 섰다. manifest component 18개 중 `select`만 `not-ready`이며 그것은
계획에 없는 유일한 항목이다(인계서 1d). 남은 것은 Figma component set 넷과 owner 판정들이다.

## 2026-08-18 (4) — Checkbox

카탈로그 14순위. `import { Checkbox } from "@klipse-design/react"`가 동작한다.

### 정본이 있는데 21벌 중 2벌만 쓴다

등록부는 "4 파일"이라고 적었고 실제는 **21벌 · 14파일 · 5레시피**다. 앞의 셋과 다른 점이 있다 —
**제품에 공용 정본이 있다.** `globals.css:990`의 `.app-native-checkbox`(20×20 · `accent-color`).

그런데 소비처가 둘뿐이고, **이유를 제품이 스스로 적어 두었다.**

> 전역 `app-native-checkbox`는 **레이어 밖**(globals.css)이라 `@layer utilities` 안의 유틸리티를
> 무조건 이긴다. 그래서 그 클래스를 계속 달아두면 여기서 주는 accent 색이 통째로 죽는다.
> — `VideoEditProjectPicker.tsx:140`

그래서 그 파일은 클래스를 떼고 선언을 통째로 베꼈고, accent 색이 **라이트는 sky-500 · 다크는
near-white**로 갈렸다. 결정이 아니라 캐스케이드 사고다. **레이어 밖 전역 선언은 정본으로
기능하지 못한다** — 이 저장소의 컴포넌트 CSS는 전부 `@layer` 안에 있어 같은 함정이 없다.

크기 20px은 채택했고 `accent-color`는 채택하지 않았다. 그것은 면 색 하나만 주고 체크 표시의
굵기·반경·포커스 링·**부분 선택 막대**를 전부 브라우저가 정한다. 제품 signup 계열 6벌이 이미
직접 그리는 것도 같은 이유다.

### 테두리 대비가 SC 1.4.11에 미달하고, 토큰 셋 중 어느 것도 넘지 못한다

선택하지 않은 체크박스는 **테두리가 어포던스의 전부**라 WCAG 2.2 SC 1.4.11(비텍스트 대비 3:1)이
그 선에 걸린다. 상자 면 대비를 실측했다.

| 토큰 | light | dark |
| --- | ---: | ---: |
| `color-stroke-control` | 1.27 | 1.63 |
| `color-stroke-default` | 1.38 | 2.93 |
| **`color-stroke-strong`** | **2.52** | **4.61** |

**셋 다 라이트에서 3:1을 넘지 못한다.** 가장 가까운 `border-strong`을 골랐고 라이트의 2.52는
남는다 — 해소하려면 새 값이 필요하므로 owner 판정이다. 이 실측이 인계서 (2b)의 입력이다.
선택된 상태의 면은 3.12/4.90으로 통과한다.

**`color-stroke-strong`의 첫 소비처가 여기다.** 인계서 (1a)가 "소비처 0이고 이름이 가리키는 것이
그 이름을 안 쓴다"고 분류한 넷 중 하나인데, 경계가 반드시 보여야 하는 자리가 생겨 이름이 뜻과
맞게 됐다. **그 토큰의 폐기 판정을 다시 해야 한다.**

axe의 `color-contrast`는 텍스트만 보므로 위 수치는 손으로 계산했다. 게이트가 재지 않는다.

### 부분 선택은 선택이 아니다

제품에서 `indeterminate`를 쓰는 곳은 **21벌 중 1벌**이고 표시를 브라우저에 맡긴다. DS는 10×2px
가로 막대를 직접 그리고, `checked`와 동시에 참이면 **막대가 이기게** 고정했다 — 두 규칙이 소스
순서로 갈리므로 CSS가 승패를 명시한다. `aria-checked="mixed"`를 함께 주는 이유는 DOM 프로퍼티만
으로는 보조기술이 "일부"를 읽지 못하는 경우가 있기 때문이다.

`indeterminate`는 콘텐츠 속성이 없어 JSX로 넘어가지 않는다. 매 렌더 뒤에 ref로 맞춘다.

### 남은 것

Figma component set 없음(`DS-F-006-checkbox`), 크기 축 없음(두 번째 소비처 전까지), Switch 없음.

## 2026-08-18 (3) — Segmented Control

카탈로그 13순위. [규범](../components/segmented-control.md)과 구현, 실브라우저 acceptance test
14건이 같은 변경 단위에 있다.
`import { SegmentedControl, SegmentedControlItem } from "@klipse-design/react"`가 동작한다.

### 등록부의 "3 파일"은 틀렸고, 이번에는 정본이 **둘**이었다

세그먼트 컨트롤만 **11벌 · 6레시피 · 8파일**이다. Slider와 다른 점이 하나 있다 — 제품에 공용
구현이 **둘** 있다. 그런데 **서로 아무것도 공유하지 않는다.**

| 레시피 | 벌 | 썸 위치 계산 | 선택 전달 |
| --- | ---: | --- | --- |
| A `SegmentedToggle` 컴포넌트 | 3 | JS `offsetWidth`/`offsetLeft−4` | `aria-pressed` |
| B `useSegmentedControlThumb` 훅 | 3 | JS `getBoundingClientRect` + ResizeObserver | **없음 — 색만** |
| B2 StaticAnalyticsDemo 손수 복제 | 1 | JS, 자체 ref | 없음 |
| C BgmNode `MODE_SEGMENT` | 1 | **CSS만** | `role=tab` |
| D ComposerBar `COMPOSER_SEGMENT` | 1 | **CSS만** | — |
| E ComposerBar 알약 그룹 | 2 | 썸 없음 | — |

트랙 padding 4↔3, 트랙 반경 12↔8, 썸 반경 8↔6, easing 셋, 비활성 글자 42%↔58%↔55%↔48%가
전부 다르다. A의 파일 주석은 스스로 SSOT라고 적어 두었는데 소비처는 3벌뿐이고, B는 훅만
공유하고 **스타일은 복붙이다** — Youtube와 Instagram의 5상수가 바이트 단위로 같다.

**정본을 A로 잡았다.** 재사용을 의도해 만든 유일한 컴포넌트이고, 트랙 반경 12 · padding 4 ·
세그먼트 반경 8 · 헤어라인 기법까지 그대로 채택했다. 기계 대조가 3축 붙어 있다.

### 대시보드 탭 다섯 자리는 이 컴포넌트가 아니다

`role="tablist"` 14곳 중 **5곳은 패널을 바꾸는 탭**이고 3곳은 카루셀 점이다. 세그먼트 컨트롤은
값을 고르고 자리를 옮기지 않는다. 갈라 두지 않으면 Tabs를 만들 때 같은 것을 두 번 만든다.

### 네이티브 radio 그룹이다

제품은 선택을 셋으로 다르게 전달한다 — `aria-pressed`, **아무것도 없음**(4벌, 색으로만),
`role="tab"`. 패널을 바꾸지 않고 값을 고르는 것은 radiogroup이므로 네이티브 radio를 쓴다. 방향키
roving, 끝에서 되돌기, "3 중 1" 그룹 안내, 폼 제출, forced-colors가 전부 브라우저의 것이 된다.

`<fieldset>` + 숨긴 `<legend>`인 이유는 legend가 그룹에 이름을 붙이는 유일한 네이티브 경로이기
때문이다. **제품 A는 `<span aria-label>`을 쓰는데 role 없는 span의 `aria-label`은 보조기술이
무시한다** — 이름이 있다고 적혀 있지만 실제로는 없다.

포커스 표시는 **여섯 레시피 어디에도 선언이 없다.** 옮기지 않았다.

### 면 두 색이 한 테마에서 죽지 않는 유일한 짝이다

인계서 (1a)·(1c)가 경고한 축의 실사례를 찾았다.

- **다크에서 `background-inset`·`surface`·`menu`·`overlay` 넷이 같은 색**(#313644)
- **라이트에서 `raised`·`overlay`·`surface` 셋이 같다**(#fafafa)

트랙과 선택 면으로 쓸 수 있는 조합은 `inset` ↔ `raised` 하나뿐이고 나머지는 한 테마에서 선택이
통째로 사라진다. 선언은 정상이라 다른 어떤 게이트도 잡지 못하므로 **두 테마를 각각 재는
테스트를 넣었다.**

트랙에 헤어라인을 두는 이유도 같다 — 다크에서 `inset`이 `surface`와 같아, 표면 위에 놓인 트랙이
테두리 없이는 보이지 않는다. 제품 A가 같은 기법(spread-only box-shadow)을 쓰고 있어 채택했다.

### 워크샵이 잡은 결함 둘

헤드리스 테스트는 둘 다 통과한다 — 선언도 토큰도 정상이기 때문이다.

- **좁은 컨테이너를 뚫었다.** `inline-flex`는 내용 크기로 자라므로 240px 상자 안에서 트랙이
  364px이 됐다. `max-inline-size: 100%`로 막았다
- **여유가 있는데 라벨이 잘렸다.** 세그먼트를 `flex: 1 1 0`으로 두면 기준 크기가 0이라 "시스템"이
  "시…"가 된다(라벨 32px, 필요 36px). `1 1 auto`로 바꿨다. 제품 A·B도 내용 크기다

### 새 토큰이 0개다

트랙 40/32 · padding 4 · 반경 12 · 세그먼트 반경 8 · 여백 12/8이 전부 기존 토큰이다. **세그먼트
반경은 바깥 반경에서 padding을 뺀 값**이라 12 − 4 = 8로 정확히 맞았다.

트랙 헤어라인은 `border`가 아니라 spread-only box-shadow다. border를 쓰면 border-box 안쪽이
줄어 세그먼트 높이가 DPR에 따라 달라진다.

### 남은 것 — 선택 면이 움직이지 않는다

제품 여섯 중 넷이 220~240ms 슬라이딩 썸을 갖고 **그것이 이 컴포넌트에서 가장 널리 합의된
축인데 옮기지 못했다.** [Motion](../foundations/motion.md)이 semantic recipe로 `layout-change`를
**이름만 예약해 두고 실제 토큰이 없으며**, lifecycle도 `enter`·`exit`·`loop` 셋뿐이다. 넷째
lifecycle을 세우는 것은 DS-D-0016이 `loop`에 한 것과 같은 크기의 변경이고, token source가 바뀌면
Figma 변수·style을 다시 적용해야 하므로 이 변경 단위 밖이다.

이름이 맞지 않는 기존 motion 토큰(`overlay-enter` 등)을 빌려 쓰지 않았다 — `radius-card`와 같은
함정이 된다.

그 밖에 남은 것: Figma component set 없음(`DS-F-006-segmented-control`), Tabs 없음, 아이콘 슬롯
크기 계약 없음, RTL 방향키 미검증.

## 2026-08-18 (2) — Slider

카탈로그 12순위다. [규범](../components/slider.md)과 구현, 실브라우저 acceptance test 16건이 같은
변경 단위에 있다. `import { Slider } from "@klipse-design/react"`가 동작한다.

### 등록부의 "에디터 Slider.Root 9"는 네 배 틀렸다

전수로 세니 **37벌 · 일곱 레시피 · 여섯 파일**이다. 등록부는 Radix를 덜 셌고 **네이티브
`input[type=range]` 15벌을 통째로 빠뜨렸다.** ProjectCard "3벌"이 4벌, EmptyState "7벌"이 9벌,
TextField "16"이 약 40벌이었던 것과 같은 종류다.

| 레시피 | 벌 | 트랙 | 썸 | 포커스 표시 |
| --- | ---: | --- | --- | --- |
| `overlayRadix*` 인스펙터 | 17 | 20/28px | **0 — 지움** | `outline:none!` |
| `timelineZoomRadix*` | 1 | 2/4px | 14px | 있음 |
| `CROP_SLIDER_*` | 2 | 4px | 16px | 있음 |
| `DURATION_SLIDER_*` | 2 | 4px | 12px | `outline:none` |
| `RANGE_SLIDER`(Tts·Bgm) | 6 | 4px | 12px | `outline:none` |
| `refinement…Slider` | 1 | 4px | 10px | 선언 없음 |
| 맨 `input` + `accentColor` | 8 | 기본 | 기본 | 브라우저 기본 |

**합의하는 축이 하나도 없다.** ProjectCard(네 벌 기하 동일)의 정반대이고 TextField와 같은
"정본 0"이다. 값은 DS가 정했고 판정은
[`product.measured.json`](../../migration/product.measured.json)의 8축에 있다.

### 포커스 표시를 지운 것이 37벌 중 25벌(68%)이다

세 레시피가 `outline: none`을 직접 선언하고 그것이 사용의 다수다. **옮기지 않았다.** 사용의
다수라는 사실이 그것을 정본으로 만들지 않는다 — Text Field와 앱 셸 사이드바에서도 같은 판정을
했다.

### 제품이 지운 썸을 되살리되 모양은 바꾸지 않았다

인스펙터 17벌은 썸을 `width:0; opacity:0; pointer-events:none`으로 지우고 채움 오른쪽 끝에
**2×14px 표식을 `::after` 장식으로 따로 그린다.** 그 표식이 바로 손잡이가 있어야 할 자리다.
`track` 변형은 같은 크기의 표식을 **실제 썸으로** 그린다 — 시각은 그대로이고 포커스와 방향키만
살아난다. 회귀 테스트가 그 넷(`width:0`·`height:0`·`opacity`·`pointer-events`) 중 하나라도
다시 들어오면 실패한다.

### 새 토큰이 0개다

레일 4px, 썸 16/12px, 막대 28/20px, 표식 2×14px은 전부 리터럴이다. 소비처가 이 컴포넌트
하나뿐이라 [Spacing & Radius](../foundations/spacing-radius.md)의 "두 개 이상의 사용처"를 아직
만족하지 않는다 — Spinner의 16/12px과 같은 판정이다. **토큰 source가 바뀌지 않아 baseline
재고정도 Figma 변수 재적용도 필요 없다.**

썸에 그림자를 쓰지 않는다. 제품의 썸 그림자 셋이 값이 다 다르고(`0 1.5px 3px/24%`,
`0 2px 8px/22%`, `0 1px 2px/30%`) DS elevation 넷 중 맞는 것이 없어, 채택하려면 새 elevation
토큰이 필요했다. `border-width-ring` 두께의 표면색 링으로 분리한다.

### 게이트가 볼 수 없는 자리를 찾았다

**Chromium은 `getComputedStyle(input, "::-webkit-slider-runnable-track")`에 섀도우
pseudo-element가 아니라 호스트 input의 값을 돌려준다** — 실측하니 320×40, 배경 투명, 반경 0이
나왔다. 레일·채움·썸의 **렌더 결과를 계산값으로 잴 수 없다.**

그래서 states 표를 두지 않았고, 기하는 CSSOM의 **선언**을 대조한다 — Button의 `borderWidth`가
계산값 대신 선언 토큰을 보는 것과 같은 이유다. 선언과 실제 그림이 갈라지는 경로는 열려 있으며
이것은 visual regression(2단계 harness)이 닫아야 한다. 규범의 Known deviations에 적었다.

### 워크샵이 잡은 결함 하나

`track` 표식에 `color-fg-on-inverse`를 썼는데 그 토큰은 테마마다 뒤집힌다
(#fafafa ↔ #171b22). 채움은 두 테마 모두 같은 파랑이라 **다크에서 표식만 검게 변했다.**
헤드리스 테스트는 이것을 보지 못한다 — 선언은 정상이고 토큰도 실재한다. 눈으로 보고 찾았고
(DS-D-0012), `color-accent-primary`의 문서화된 대비 짝인 `color-fg-inverse`로 고쳤다.

### 남은 것

- **Figma component set이 없다.** `figma: not-ready`이며 `DS-F-006-slider`가 소유한다
- **Firefox 경로가 미검증이다.** `::-moz-range-*` 규칙을 나란히 적었으나 harness가 Chromium 단독이다
- **컨트롤 높이 40px이 `hit-target-minimum` 44px에 미달한다.** range input은 `::before`/`::after`가
  트랙·썸에 배정돼 `.louis-hit-target`을 쓸 수 없다. Text Field도 같은 40px이다
- **범위(두 손잡이) 선택이 없다.** 제품에 0벌이다

## 2026-08-18 — Sidebar Nav Item · App Top Bar

카탈로그 11순위다. 셸의 **레이아웃 계약은 [app-shell 패턴](../patterns/app-shell.md)이 이미
소유하고 있어** 여기서 지은 것은 그 안에 놓이는 부품 둘이다.

### 등록부의 "Gnb import 31곳"은 두 컴포넌트 합산이었다

앱 셸 `Gnb.tsx` **25파일** + 랜딩 `Gnb.tsx` 7파일이고 한 파일이 둘 다 import한다. 앱 셸만 세면
25(파일) 또는 29(인스턴스)다.

### 제품의 사이드바 항목에는 포커스 표시가 없다

`globals.css`의 `button:focus, button:focus-visible { outline: none }`이 `@layer base` 블록
**밖**에 있어 `@layer utilities` 안의 Tailwind 임의 유틸리티를 **특이도와 무관하게** 이긴다.
항목이 선언한 링 세 줄이 전부 사문이고, 앱 셸 소비처 25곳이 모두 `<button>` 분기를 타므로
**키보드 사용자가 지금 어디에 있는지 알 수 없다.** 옮기지 않았고 테스트가 링이 실제로 그려지는지
확인한다.

### 옮기지 않은 것 둘 더

- **목적지가 있으면 링크다.** 제품은 소비처 25곳이 전부 `onNavigate`를 넘겨 `<button>` 분기를
  타는데, 그 결과 새 탭·링크 복사·미들클릭이 죽는다
- **접혀도 라벨이 DOM에 남는다.** 지우면 접기/펴기마다 접근성 이름이 사라졌다 나타나고,
  스크린 리더 사용자에게는 접힘이 보이지 않는 상태 변화가 된다

### 선택은 `aria-current`가 소유한다

시각 전용 속성을 따로 두면 화면에는 선택으로 보이는데 보조기술에는 아무것도 전달되지 않는 상태를
만들 수 있다. 제품이 쓰는 두 메커니즘(형제 인디케이터 / 항목 직접) 중 **항목이 직접** 갖는 쪽을
골랐다 — 인디케이터를 형제로 두면 항목 하나를 다른 곳에 옮겨 놓을 수 없다.

### 토큰 — 이름이 틀린 것 하나를 고쳤다

[DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md).

`layout-app-shell-sidebar-minimum`(120px)의 이름은 "사이드바 최소"인데 제품에서 120이 나오는
유일한 자리는 `min(280px, calc(100vw - 120px))`의 **빼는 값**, 즉 **본문에 남기는 최소 공간**이다.
실제 사이드바 폭은 280 · 56 · 0 셋인데 어느 것도 120이 아니었다.

- `sidebar-minimum` → **`content-reserve`**. 값은 그대로
- **`sidebar-width` 280** · **`sidebar-collapsed` 56** · **`top-bar-height` 40** 신설
- **`.louis-layer-sticky` 유틸리티** 추가 — 토큰은 있는데 쓸 클래스가 없어 숫자를 쓰게 되어 있었다

상단 바 높이가 40인 근거는 제품에 52/36/40 셋이 있고 `globals.css`의 주석이 **정렬을 40 전제로
계산**하기 때문이다. `layout-control-height-md`가 같은 40이지만 쓰지 않는다 — 버튼 높이를 바꾸는
날 상단 바가 같이 움직이면 안 된다.

## 2026-08-17 (4) — keyframe이 무엇을 애니메이션하는지 게이트가 본다

Skeleton을 짓기 전에 실측을 했더니 **제가 두 커밋 전에 만든 문제**가 나왔다.
[DS-D-0017](../governance/decisions/DS-D-0017-keyframe-contract.md).

### 규범은 있는데 게이트가 없었다

motion.md는 "선언되지 않은 property를 component가 임의로 animation하지 않는다"를 규범으로 두었다.
**그것을 검사하는 것이 없었다.** 검증되는 것은 토큰 선언의 모양뿐이고 저작 CSS의 `@keyframes`
본문은 아무도 읽지 않았다.

그래서 **이미 둘이 어긋나 있었다** — Toast는 선언이 `transform`인데 `translate`를, Tooltip은
`scale`을 애니메이션했다. 둘 다 `transform`의 **개별 속성**이며 CSS에서 별개 property다.
새 게이트를 세우자 **첫 실행에서 그 둘을 잡았다.**

### `motion-loop`는 이름이 너무 넓었다

[DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md)이 700ms·linear를 **회전 22벌만 보고**
정했고 그 문서가 스스로 그렇게 적었다. 자리표시 19벌을 재 보면 다르다.

| 축 | 회전 | 자리표시 |
| --- | --- | --- |
| 주기 | 700ms (22벌 중 10) | **1.6s** (19벌 중 12). 700ms는 **하나도 없다** |
| easing | `linear` (22/22) | 가감속 14 · 등속 5 |

motion.md의 "easing은 등속이다"도 근거가 "가감속이 붙으면 회전이 맥박처럼 뛴다"였다 —
**회전에만 성립하는 논거**를 loop 전체로 일반화한 것이다.

- `motion-loop` → **`motion-spin`**(700ms · 등속). 회전 전용임을 이름이 말한다
- **`motion-shimmer`**(1.6s · `easing-standard`) 신설. 자리표시용
- 등속 규칙을 회전에 한정했다

`motion-shimmer`의 easing이 제품의 `cubic-bezier(0.4, 0, 0.2, 1)`이 아닌 이유는 제품의 자리표시
easing이 9/5/5로 갈려 **정본이 없기** 때문이다. 근사한 곡선을 새로 세우기보다 이미 있는 표준
곡선을 쓴다.

### 허용 property를 실제에 맞췄다

- enter/exit — `opacity`·`transform`에 개별 속성 `translate`·`scale`·`rotate`를 더했다
- loop — `background-position`을 더했다. 합성 축이 아니라 DS-D-0016의 "transform 축을 통째로
  잡지 않는다"는 논거에 걸리지 않는다. `transform` shorthand는 **여전히 거부**되며 카나리아가
  그것을 확인한다

### 카나리아 3종

저작 규칙 카나리아가 9종에서 12종이 됐다 — 선언되지 않은 property, motion 토큰에 연결되지 않은
keyframe, loop에서의 `transform` 거부.

### 왜 Skeleton보다 이것이 먼저인가

제품 자리표시의 우세 기법은 `background-position` 이동(19벌 중 12)이다. 그대로 지었으면
**게이트는 전부 초록인 채로 규범을 위반**했을 것이다 — Badge의 죽은 축이 게이트를 통과했던 것과
같은 구조다.

## 2026-08-17 (3) — Spinner

카탈로그 10순위다. 직전에 세운 loop lifecycle이 이것을 위한 선행 작업이었다.

### 이번에는 정본이 뚜렷하다

제품의 로딩 표현은 약 62벌이지만, 공용 `LoadingSpinner`가 있고 그 recipe가 **700ms · linear**로
방금 세운 `motion-loop`와 정확히 같다. 링 구조도 그대로 옮겼다.

**링이 둘이다** — 네 변이 칠해진 흐린 트랙과 위쪽 한 조각만 칠해진 진행. 트랙이 없으면 회전하는
조각이 어디를 도는지 보이지 않아 "무언가 깜빡인다"로 읽힌다. 이전 DS의 spinner는 트랙 없이 위쪽
테두리만 비웠고, 그것은 제품과 다른 표현이었으며 편차로 선언된 적도 없었다.

### keyframe 중복을 합쳤다

제품이 회전 keyframe 이름 18개에 본문 1종을 가진 것과 **같은 중복이 이 저장소에도 둘 있었다** —
`louis-button-spin`과 `louis-menu-spin`. `base.css`의 공용 `louis-spin` 하나로 합쳤다. 같은 것을 두 번
적으면 한쪽만 고쳐지는 날이 온다.

### 라벨에 기본값을 두지 않는다

`label`이 있으면 `role="status"`로 알리고 없으면 `aria-hidden`으로 숨는다. 기본 문자열을 두지 않는
이유는 제품에 `aria-label="Loading"`이 하드코딩된 자리가 있기 때문이다 — DS가 기본값을 배포하면
그 하드코딩을 시스템 전체로 퍼뜨리는 셈이 된다.

### 제품에서 옮기지 않은 것

제품의 공용 `LoadingSpinner`에는 `prefers-reduced-motion` 처리가 **없다.** 비공용 정의 중 일부는
갖고 있다. 공용을 그대로 승격하면 그 결함이 시스템 전체로 퍼지므로 여기서는 넣었다.

### Figma의 표현 한계 둘

- CSS는 두 겹의 `border`인데 Figma에는 "테두리 한 변만 칠하기"가 없다. stroke로 그렸더니
  `innerRadius: 0`인 파이 조각의 외곽선(중심으로 가는 반지름 두 줄)이 함께 그려졌다 — 실측으로
  확인하고 fill + `innerRadius`의 arc 밴드로 바꿨다
- Figma는 `currentColor`를 표현하지 못한다. 문서용으로 `foreground-primary`를 쓴다

### 아직 없는 것

determinate 진행률, 스켈레톤(15벌), 텍스트 쉬머(11벌)는 별도 컴포넌트다. 진행률 쪽은 제품의 2벌이
두께·색·전환이 셋 다 다르고 `role="progressbar"`가 저장소 전체에 1곳, `<progress>`가 0곳이다.

## 2026-08-17 (2) — 무한 반복 motion에 lifecycle을 준다

Spinner를 세우기 전에 규범이 먼저 필요했다.
[DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md).

### 이미 있는 회전 둘이 게이트 밖에 있었다

`motion.md`의 Token model이 소유 목적을 enter/exit/layout-change로 한정해 두어, Button과 Menu의
spinner가 **어떤 게이트에도 잡히지 않았다.**

- `animation: ... 1s linear infinite` — duration과 easing이 리터럴이라 토큰을 바꿔도 따라오지 않았다
- keyframe이 `rotate`를 애니메이션하는데 `rotate`는 허용 property가 아니었다
- reduced-motion에서 실제로 멈추는지 확인하는 테스트가 없었다

### `loop`를 세 번째 lifecycle로 세웠다

- `motionProperties` 항목에 선택적 `lifecycle` 필드 — `enter` | `exit` | **`loop`**.
  생략하면 enter/exit로 본다(기존 9개 항목이 그대로 통과한다)
- 허용 property가 lifecycle마다 다르다. loop는 `rotate`·`opacity`이고 `transform`이 아니다 —
  개별 속성 `rotate`는 `scale`·`translate`와 합성되므로 회전 하나 때문에 transform 축을 통째로
  잡지 않는다
- **loop는 `reducedMotionPairs`의 대상이 아니다.** reduced에서 loop는 짧아지는 것이 아니라
  사라지며, `0ms`짜리 애니메이션을 무한 반복하는 것은 성립하지 않는다. 대체는 duration 토큰이
  아니라 component의 `animation-iteration-count: 1`과 `aria-busy`가 소유한다

### `motion-loop` = 700ms · linear

700ms는 제품의 우세값이다(회전 22벌 중 10벌). `linear`는 제품 22벌이 **전수 일치하는 유일한
축**이다 — 가감속이 붙으면 회전이 맥박처럼 뛰어 "진행 중"이 아니라 "잘못됨"으로 읽힌다.

Button과 Menu의 spinner가 1s에서 700ms로 바뀐다. 제품과 일치한다.

### 면제가 넓지 않다는 것을 카나리아가 증명한다

카나리아 3종을 붙였다(39 → 42). 그중 하나는 loop 항목에서 `lifecycle`만 떼는데, 그 순간
`reducedMotionPairs에 transition이 누락되었습니다: motion-loop`로 실패한다 — 면제가 `lifecycle`에
정확히 걸려 있고 그것을 빼면 다시 강제된다는 뜻이다.

브라우저 테스트 3건이 두 motion context에서 각각 돈다. 회전이 토큰에서 오는지, reduced에서
멈추는지, 멈추더라도 `aria`가 진행을 남기는지를 본다.

## 2026-08-17 — Badge, 그리고 죽은 축 둘

카탈로그 9순위다. 제품에 배지 계열 정의가 **65벌**이고 공용 구현은 0이다.

### 등록부의 "톤 4 + 상태 5"가 둘 다 틀렸다

- "톤 4"는 `InspectorPill`의 tone prop 네 갈래를 센 것인데 **네 톤 클래스의 선언이 바이트 단위로
  같다.** prop은 있는데 색이 하나다
- "상태 5"는 하이라이트 히스토리 카드만 맞다. 그것을 복제한 비디오 에디터는 3개뿐이고, 앱 홈의
  4변형은 **네 색이 전부 `var(--gray-400)`로 같다**

두 곳 다 **축이 있다고 적혀 있는데 실제로는 죽어 있었다.** 그래서 이 컴포넌트의 테스트에서 가장
중요한 단언은 "다섯 tone이 실제로 서로 다른 색을 만든다"이다 — 값이 갈리는지를 직접 본다.

### 새 토큰이 하나도 필요 없었다

상태 배지의 대표(`highlightSceneStyles.ts:760`)의 여백 4/8px과 반경 8px이 `space-control-xs`·
`space-control-sm`·`radius-control-sm`에 정확히 맞는다. 색은 `color-status-*` 네 쌍이 이미 있고
`contrastPairs`에 `minimum 4.5`로 걸려 있다(실측 9.09~11.98).

아이콘은 `1em`이다. [iconography.md](../foundations/iconography.md)가 12px을 "4px 격자 밖"이라며
거부해 두었는데, 글자를 따라가게 하면 그 판정을 다시 열지 않아도 된다.

### 제품에서 옮기지 않은 것

제품의 상태 배지는 다섯 상태의 **면이 전부 `gray-800`으로 같고 글자색만 갈린다.** light/dark 값도
같아 밝은 테마에서 어두운 배지가 뜬다. 여기서는 면과 글자를 짝지었다 — 색각 이상에서 글자색 하나에
기대지 않고, 두 값이 게이트에 대비 쌍으로 묶인다.

### 드러난 결손 하나

**`contrastPairs`에 면 대 면 축이 아예 없다.** 선언된 12쌍은 전부 글자 대 면이다. 배지 면과 페이지
면의 실측 대비는 1.02~1.23:1로 `color-theme.md`가 비텍스트 그래픽에 요구하는 3:1에 못 미치는데,
게이트가 그것을 계산하지 않는다. 배지는 의미를 라벨(11:1)이 나르므로 수용하고 적었다.

### Spinner는 착수 전 선행 작업이 있다

10순위를 함께 실측했더니 등록부의 "레시피 5종 · Skeleton 0종"도 틀렸다 — 회전 스피너 **22벌**,
스켈레톤 **15벌**, 진행률 5벌, 텍스트 쉬머 11벌로 약 62벌이다. 회전 키프레임 이름은 18개인데
본문은 전부 `to { transform: rotate(360deg) }` 한 종류다.

**바로 짓지 않는다.** [motion.md](../foundations/motion.md)가 무한 반복을 다루지 않는다 —
소유 목적을 enter/exit/layout-change로 한정해 두었다. 게다가 토큰 모델이 semantic transition
토큰에 reduced-motion 짝을 강제하는데 `0ms + infinite`는 의미가 성립하지 않고, 허용 property가
`opacity`·`transform` 둘뿐인데 기존 스피너는 `rotate`를 애니메이션한다. 규범 확장이 먼저다.

## 2026-08-16 (4) — Empty State와 `space-stack-*` 계열

### 제품 9벌이 합의하는 축이 하나뿐이다

카탈로그 8순위다. 등록부는 7벌로 적고 있었고 실제는 **9벌**이다(에디터가 3이 아니라 5 —
`VideoEditModal` 한 파일 안에 세 벌이 있다). 그중 하나는 조건상 도달할 수 없는 죽은 분기다.

아홉 벌은 세로 여백도(80/64), 블록 간격도(12/16), 제목 계층도, CTA 유무도 갈린다. **딱 하나
9/9가 합의한다 — 자기 배경도 테두리도 반경도 갖지 않는다.** 상자가 아니라 부모 표면 위에 얹히는
텍스트 블록이다. 그 합의를 옮겼고 테스트가 그것을 가장 강하게 고정한다.

나머지는 두 홈이 동의한 값을 골랐다 — 근거가 가장 두껍다.

### 오류 상태를 다루지 않는다

제품의 프로젝트 피커는 "목록이 비었다"와 "불러오지 못했다"를 같은 빨간 표현으로 합쳐 두었다.
그 둘은 사용자가 취할 행동이 다르다 — 없으면 만들면 되고 실패했으면 다시 시도해야 한다.

`aria-live`도 붙이지 않는다. 빈 상태는 목록이 로드된 **결과**이고 로딩을 알리는 것은 이미 다른
요소의 일이다. 여기에 live region을 두면 화면을 옮길 때마다 다시 읽힌다. 대신 제목이 heading이라
랜드마크 탐색으로 닿고, 그 단계는 호출부가 정한다.

### `space-stack-*` 계열 — breaking

[DS-D-0015](../governance/decisions/DS-D-0015-stack-spacing.md).

Project Card를 세울 때 오버레이 줄 간격(4px)을 부를 이름이 없어 `space-card-text-gap`을 만들었다.
**컴포넌트 이름이 토큰에 들어간 유일한 자리**였고, Empty State가 같은 문제를 다시 만들었다 —
블록 간격 12px에 쓸 이름이 없다. 여기서 `space-empty-state-gap`을 또 만들면 컴포넌트마다 자기
간격 토큰을 갖는 길이 열린다.

- `space-stack-xs` 4px — `space-card-text-gap`을 대체한다
- `space-stack-md` 12px — Empty State의 블록 간격
- 뜻은 **표면 안에서 세로로 쌓이는 블록 사이**다. `space-control-*`(컨트롤 안쪽)도
  `space-layout-*`(레이아웃 여백)도 아니다
- `sm`·`lg`는 필요할 때 추가한다. 소비처 없는 단계를 미리 만들지 않는다

컴포넌트 이름이 들어간 토큰이 0이 됐다.

### `icon-size-xl` 64px

`iconography.md`의 미채택 표가 "64는 **빈 상태 컴포넌트가 생길 때** 사유와 함께 추가한다"고 자리를
예약해 두었고, 그 컴포넌트가 지금 섰다. additive다.

### 게이트가 잡은 것

Figma component를 세우고 parity를 돌리니 **계약에 없는 자손 `Action`**이 걸렸고, 선언하는 과정에서
실제 차이가 드러났다 — CSS는 액션에 `margin-block-start: 4px`를 더해 앞 요소와 16px 떨어지는데
Figma는 12px이었다. Figma auto-layout에 자식별 간격이 없어 같은 4px을 Action 프레임의 위쪽
padding으로 만들었다.

## 2026-08-16 (3) — Text Field

카탈로그 7순위다. **제품에 공용 구현이 없다** — 텍스트 입력 정의가 약 40벌이고 다섯 계열로 갈리며
계열 사이에 합의가 없다. 등록부는 "에디터 16 · 하이라이트 3"으로 적고 있었다.

| 계열 | 벌 | 시각적 필드가 무엇인가 |
| --- | ---: | --- |
| 인증 floating-label | 9 | **감싸는 `div`.** `<input>`은 투명하다 |
| 테두리 보이는 박스 | 5 | `<input>` 자신 |
| 테두리 없는 채운 면 | 9 | `<input>` 자신(배경만) |
| 투명 인라인 rename | 8 | 없음 |
| 노드 캔버스 프롬프트 | 5 | `<textarea>` 자신 |

정본이 없으므로 값은 DS가 정했고, 어디서 갈라지는지는 `product.measured.json`이 사유와 함께 갖는다.

### 시각적 필드는 `<input>`이 아니라 감싸는 박스다

제품의 가장 큰 계열이 그 구조를 쓰고, 이유가 있다 — 접두 아이콘과 접미 버튼을 필드 **안에** 두려면
`<input>` 하나로는 안 된다. 포커스 링도 박스가 `:focus-within`으로 받는다. `<input>`에 걸면 링이
글자 주위에만 뜨고 슬롯이 밖에 남는다.

박스는 `<label>`이 아니라 `<div>`다. `<label>`로 두면 슬롯 안의 버튼을 눌러도 입력이 포커스를
가져가 버튼이 동작하지 않는다.

### 제품에서 옮기지 않은 것

- **포커스 표현.** 제품은 계열마다 다르고 일부는 `[&:focus-visible]:[outline:none]`으로 **의도적으로
  없앴다**(`NodeLayersPanel.tsx:178` 주석이 "요청대로 색 제거"라고 적어 두었다). 키보드 사용자가
  지금 어디에 있는지 모르는 상태를 규범으로 옮기지 않는다. 공유 링 하나로 통일했다
- **라벨 부재.** 대부분의 필드에 시각 라벨이 없고 placeholder가 그 역할을 대신한다. placeholder는
  입력을 시작하면 사라지므로 라벨이 될 수 없다. 라벨을 필수로 요구한다
- **placeholder 색.** 제품의 알파 placeholder는 light에서 4.5:1에 미달한다. `foreground-tertiary`도
  3.96:1로 미달해 `foreground-secondary`를 쓰고, 값과의 구분은 색 단계가 아니라 primary/secondary
  위계가 맡는다
- **색만으로 알리는 오류.** `aria-invalid`와 `aria-describedby`로 연결된 문구가 함께 뜨고 그 문구는
  `role="alert"`이다. 도움말은 alert가 아니다 — 화면을 여는 것만으로 스크린 리더가 시끄러우면 안 된다

### 토큰 하나

`color-stroke-danger` = red.500. 테두리 역할의 danger 토큰이 없어서 IconButton도 solid danger를
포기하고 tonal로 우회한 적이 있다. red.500만 light 3.14 · dark 3.70으로 양쪽에서 비텍스트 경계
3:1을 넘는다. 순수 additive이며 breaking이 아니다.

`caret-color`는 **선언하지 않는다.** 브라우저 기본이 `currentColor`라 값 텍스트를 자동으로 따라간다.
전용 토큰을 만들면 값과 캐럿이 따로 놀 수 있다.

### 드러난 불일치 하나

TextField는 `color-stroke-control`을 쓰는데 IconButton은 같은 자리에 `color-stroke-default`를 쓴다.
값도 다르다(전자는 반투명, 후자는 불투명). **컨트롤 테두리의 정본이 저장소 안에서 아직 정해지지
않았다.** 이 컴포넌트가 만든 문제가 아니라 드러낸 문제다.

## 2026-08-16 (2) — Project Card 구조 정정과 parity 게이트 확장

### 프레임을 링크로 만들면 안 됐다

처음 구현은 카드 root 자체가 `<a>`/`<button>`이었다. 그러면 슬롯의 더보기 버튼이 `<a>` 안의 대화형
자손이 되어 **HTML이 무효**가 되고 보조기술에서 동작이 정의되지 않는다. 규범 문서가 바로 그 사용을
예시로 들고 있었다.

프레임을 `div`로 되돌리고 클릭 타깃(`ProjectCardAction`)을 카드 전체에 늘려 깐 형제로 두었다.
자식 순서가 계약이다 — **Media → Action → Adornment**. 슬롯이 앞에 오면 클릭 타깃이 위에 깔려
슬롯 안의 컨트롤이 눌리지 않는다. 테스트는 DOM 순서가 아니라 **실제 hit test**로 확인한다.

클릭 타깃의 이름은 `ProjectCardTitle`에서 온다. id는 컴포넌트가 인스턴스마다 발급한다.

### 오버레이 띠가 자라지 않고 있었다

문서·measured·인계 근거가 모두 "내용이 크면 띠가 자란다"고 적어 두었는데 실제로는 아니었다.
`block-size: 30%`는 절대 위치 박스의 확정 크기라 내용이 커져도 자라지 않고 **글자가 띠 위로
넘친다** — 최소 트랙 240px에서 띠 71.4px에 내용 92.8px이라 eyebrow가 흐림이 0인 구간에 놓였다.

`block-size: fit-content; min-block-size: 30%`로 바꿔 30%를 하한으로 만들었다. 측정 폭 360에서는
30%가 이기고 240에서는 내용이 이긴다. 테스트가 두 지점을 모두 고정한다.

### 누름 전환이 네 컴포넌트에서 죽어 있었다

`transition-property: opacity, transform`이라고 적고 `scale`을 움직이고 있었다. **`scale`은
`transform`과 별개 property**라 이 선언은 아무것도 전이하지 않는다 — 계산값을 읽으면
`"opacity, transform"`인데 실제로 움직이는 것은 `scale`뿐이다.

Button·IconButton·overlay·ProjectCard 넷을 `opacity, scale`로 고쳤다. Dialog는 처음부터
`translate, scale`로 적고 있었다. 고치자마자 Menu 패널과 항목의 크기가 여는 애니메이션의 `scale`을
타고 96%로 읽히기 시작해, 그 테스트들도 변환에 영향받지 않는 레이아웃 값으로 바꿨다.

### parity 게이트가 자손을 본다

지금까지 component 계약은 **root 노드만** 대조했다. Project Card는 계약값이 전부 자손인
`Title overlay`에 있어서 root만 보면 여백·간격·흐림이 하나도 검증되지 않는다.

- `geometry.parts`로 자손의 field를 root와 **같은 규칙**으로 대조한다(문자열=measured 키, 배열=합,
  객체=literal). 새 어휘를 만들지 않았다
- 자손의 높이가 다른 자손에 대한 비율로 정의되는 경우(`heightRatioOf`)
- `childOrder` — 크기는 다 맞는데 못 쓰는 상태는 값 비교로 잡히지 않는다
- 프로그레시브 흐림의 램프 끝점을 **measured의 mask 정지점에서 유도한다.** 계약에 옮겨 적으면
  정본이 둘이 되어 CSS를 고쳐도 옛 값을 계속 통과시킨다
- Figma는 숫자를 float32로 저장해 120%가 120.00000476837158로 돌아온다. 자손 비교에 1e-4 허용치를
  두되, canary가 그 허용치가 검출력을 낮추지 않음을 증명한다

**text style 면제를 하나 도입했다.** Figma text style은 all-or-nothing이라 줄 간격만 덮어도 style
연결이 끊긴다(실측 확인). 카드 오버레이는 120%가 필요하고 그 줄 간격을 가진 style이 토큰 소스에
없다. 면제하되 **검사를 빼지 않는다** — 그 자리는 `fontSize`와 `lineHeightPercent`를 직접
대조하도록 게이트가 강제한다. 바인딩 검사는 "값이 토큰에서 온다"의 대리 지표이고 값 대조는 그
자체다.

canary는 26종에서 **33종**으로 늘었다.

### Toast는 게이트가 없었다

앞선 변경에서 만든 `surface-geometry.browser.test.tsx`의 머리말이 Dialog·Tooltip·Toast·Menu를
덮는다고 적어 두었는데 **Toast 테스트가 없었다.** 채웠다. Dialog의 padding·gap도 함께 넣었다.

### states 표 17건도 아무도 읽지 않았다

같은 함정이 색 축에 그대로 있었다. `components.measured.json`의 states 표 중 코드가 읽는 것은
Button과 IconButton뿐이고, Tooltip·Toast·Menu·Dialog·ProjectCard의 17건은 Figma 쪽에서만
대조되고 있었다. `component-states.browser.test.tsx`의 "빠짐없이 덮는다" 가드조차 기대 목록에 두
컴포넌트만 하드코딩돼 있었다.

`surface-states.browser.test.tsx`가 다섯을 덮고, **measured에 states가 있는데 테스트가 없는
컴포넌트가 생기면 실패하는 가드**를 함께 둔다 — 목록을 손으로 유지하는 대신 measured에서 읽는다.

## 2026-08-16 — Project Card와 카드 반경 정정

### `radius-card`가 20px에서 16px로 내려간다 — breaking

제품의 프로젝트 카드는 **정의 4벌이 전부 16px**인데 DS의 `radius-card`는 20px이었고, 그 20px의 유일한
소비처는 Dialog compact였다. 이름이 카드를 가리키면서 카드가 아닌 것에만 쓰이고 있었다.

[DS-D-0014](../governance/decisions/DS-D-0014-card-radius.md)로 바로잡았다.

- `radius-card` = 16px. Project Card가 쓴다
- `radius-card-lg` = 20px 신설. Dialog compact가 같은 변경 단위에서 이쪽을 가리킨다
- **화면은 바뀌지 않는다.** Dialog compact는 여전히 20px이다

breaking이므로 [DS-GOV-001 절차](../governance/releases.md)를 따랐다 — 결정을 먼저 쓰고, `diff-tokens`로 분류를
확인하고(additive 1 · value 1, 의도하지 않은 breaking 0), baseline을 갱신하고 재검증했다.

### Project Card

카탈로그 우선순위 6번이다. 제품의 홈과 허브가 각자 만든 정의 4벌의 기하가 서로 같아, 값은 DS가 정한
것이 아니라 **제품 정본을 옮긴 것**이다. 규범은 [project-card.md](../components/project-card.md).

- `@klipse-design/react`에 8종 export. root가 네이티브 `<a>`/`<button>`이다 — 제품 네 벌은 전부
  `<article>` + `onClick`이라 키보드로 열 수 없다
- `space-card-text-gap`(4px) 신설. 제품의 `--project-card-overlay-stack-gap`에 대응한다
- Figma `Content` 섹션에 component 하나. parity 게이트는 아직 이 component를 덮지 않는다

### 프로그레시브 블러의 첫 소비처가 생겼다

API와 게이트만 있고 쓰는 곳이 없던 프로그레시브 블러가 여기서 쓰인다. 제품이 이미 쓰고 있었다 —
카드 제목 띠의 `backdrop-filter: blur(10px)` + 위로 사라지는 mask가 그것이다.

불투명 스크림과 다르다. 스크림은 썸네일의 색을 지우고, 흐림은 색을 남기면서 글자 뒤의 고주파 성분만
없앤다. 정지점은 `figma/components.measured.json`이 갖고 코드와 Figma가 같은 원천을 본다.

**Figma의 표현에 한계가 하나 있다.** CSS mask는 정지점 다섯 개로 비선형 곡선을 그리는데 Figma의
`PROGRESSIVE`는 두 지점 사이의 선형 램프다. 중간 구간에서 0.8/0.4 대신 0.67/0.33이 된다.

### 표면 컴포넌트 넷이 게이트 없이 있었다

Dialog·Tooltip·Toast·Menu는 `components.measured.json`에 값이 있는데 **코드 쪽 대조가 없었다.**
parity 게이트는 Figma가 measured와 같은지만 보므로, 그동안 "Figma와 measured는 서로 맞고 둘 다 코드와
틀린" 상태로 통과할 수 있었다. 실제로 `radius-card`를 내렸을 때 Dialog compact가 20px을 유지하는지
확인해 주는 테스트가 하나도 없었다.

`surface-geometry.browser.test.tsx`를 세워 넷과 Project Card를 덮는다. 세우는 과정에서 두 가지를
실측으로 찾았다 — Dialog 폭이 여는 애니메이션의 `scale`을 타고 정확히 98%로 읽히는 것(`offsetWidth`로
바꿨다), 그리고 오버레이 띠가 `content-box`라 여백만큼 두꺼워지던 것(`box-sizing`을 명시했다).

## 2026-08-15 — Tailwind 4 interop과 글래스 섀도우 제거

### 배포 환경이 Tailwind 4다

DS는 Tailwind 의존성이 **0개**였고 [DS-D-0004](../governance/decisions/DS-D-0004-css-authoring.md)가
"소비 제품은 Tailwind 사용 여부를 고정할 수 없다"를 근거로 authored plain CSS를 택해 둔 상태였다.
그 전제가 틀렸다 — 제품은 `tailwindcss ^4.3.3`을 쓴다.

더 중요한 것은 제품이 이미 `@theme inline` 블록을 **생성기로** 만들고 있었다는 점이다. 그 생성기의
입력이 제품의 `globals.css`라서, **제품 CSS가 토큰의 정본**이었다. DS가 토큰을 바꿔도 제품 유틸리티는
따라오지 않고, 제품이 색을 바꾸면 DS와 조용히 갈라진다. 205축 중 143축이 그렇게 갈라져 있었다.

[DS-D-0013](../governance/decisions/DS-D-0013-tailwind-interop.md)로 결정했다 — **토큰만** Tailwind 4
`@theme inline` 레이어로 발행하고 컴포넌트 CSS는 authored plain CSS로 남긴다.

- `@klipse-design/css/theme.css` 신설. 유틸리티 토큰 93개 + 변수 전용 16개
- 값이 리터럴이 아니라 `var(--louis-*)`를 가리킨다. `@theme`가 아니라 **`@theme inline`**인 이유가
  이것이다 — semantic 색이 런타임에 바뀌므로 inline이 아니면 빌드 시점 값이 구워져 테마 전환을
  따라가지 않는다
- Tailwind에 대응 namespace가 없는 범주(`layer`, `border-width`, `motion`)도 변수로 내보낸다
- **매핑되지 않은 토큰 접두사를 만나면 생성이 실패한다.** 새 범주가 생겼는데 매핑을 빠뜨리면
  유틸리티가 조용히 안 나오고 아무도 모른다. canary가 그 검출력을 증명한다

컴포넌트까지 유틸리티로 내보내지 않은 이유는 셋이다. 소비하는 쪽이 Tailwind를 반드시 갖춰야 하고,
같은 클래스가 소비자 설정에 따라 다른 결과를 내며(제품은 `--spacing: 2px` 격자라 `p-4`가 8px이다),
cascade layer가 주는 override 계약이 사라진다. 제품 자신이 그 함정을 주석으로 적어 두었다 —
레이어 안의 유틸리티는 레이어 밖 모듈 CSS에 **특이도와 무관하게 진다**.

### 글래스 섀도우 개념을 없앴다

owner 결정이다. 버튼에는 이너섀도우를 쓰지 않고, 이너섀도우는 노드 사이드 버튼에만 남긴다.

- Button의 글래스 베벨 2겹과 `::before` 광택 오버레이를 제거했다. Figma에서 Gloss 사각형 6개와
  effect style 둘을 지웠다
- 토큰 4개를 제거했다 — `shadow`/`elevation`의 `control-bevel`, `control-gloss`
- Toast 그림자에서도 베벨 inset 2겹을 뺐다. drop 1겹 + 배경 흐림만 남는다

제품 값을 채택했던 두 축을 **철회**해 사유를 적은 편차로 바꿨다. 제품과 다르게 가는 결정이므로
`migration/product.measured.json`에 그 사실이 남는다.

### 모든 헤어라인이 0.5px다

`border-width` 토큰을 세웠다(hairline 0.5 / ring 2). Button·IconButton·Tooltip·Dialog·Menu 구분선의
테두리가 전부 hairline이며 Figma 스트로크 27개도 `0.5|INSIDE`다. spinner 링(2)과 글리프(1.5)는
테두리가 아니라 그대로다.

**브라우저는 DPR 1에서 0.5px의 사용값을 1px로 올린다.** `getComputedStyle`이 언제나 1px을 돌려주므로
기하 테스트가 계산값이 아니라 선언 토큰을 보도록 고쳤다. 레티나에서는 진짜 half-pixel로 그려진다.

### 스트로크와 effect를 역할별로 잰다

두께를 **집합**으로만 보면 버튼 테두리가 2px이 돼도 spinner의 2와 구분되지 않았다. `strokeAlign`은
아예 보지 않았다 — 같은 두께라도 `CENTER`가 되면 시각 박스가 달라진다. effect는 개수만 세서
`INNER_SHADOW`가 `DROP_SHADOW`로 바뀌어도 통과했다.

역할별로 두께·정렬·effect 종류·순서를 대조하고, blur는 radius가 변수에 묶였는지까지 본다.
변조 canary가 20종에서 25종이 됐다.

그 과정에서 effect 종류 canary가 **무력화돼 있던 것**도 찾았다. `INNER_SHADOW`를 찾아 바꾸는
방식이라 그 종류가 없는 컴포넌트에서는 no-op이었고, Button의 effect가 비면서 대상이 Tooltip으로
넘어가 조용히 통과하고 있었다.

## 2026-08-15 — 제품과의 격차 143건을 전부 판정했다

`product-parity` 게이트가 **초록이 됐다.** 205축 실측에서 나온 격차 143건이 전부 판정됐다는 뜻이다.

| | 건수 |
| --- | --- |
| 제품 값 채택 | **45** (그중 7건은 기계 대조) |
| 사유를 적은 의도적 편차 | **46** |
| 제품에 공용 정본이 없음 | **52** |

`gap` 0건. 이제 제품과의 차이는 전부 **기록된 결정**이다.

### Tooltip — 표면이 정반대였다

제품 tooltip은 **페이지와 반전된 면**이다. 라이트에서 어두운 면에 밝은 글자, 다크에서 그 반대.
DS는 `background-inset`을 써서 페이지와 같은 극성이었다. 정확히 반대로 만들어져 있었다.

Toast가 먼저 세운 `color-bg-inverse`/`color-fg-on-inverse`가 제품 tooltip 면과
**값이 정확히 같았다.** 토큰은 이미 있었고 tooltip이 다른 것을 쓰고 있었을 뿐이다.

**모션이 아예 걸리지 않고 있었다.** `animation-duration`과 `animation-timing-function`만 있고
`animation-name`이 없었다. 값만 적어 두고 실제로 도는지 확인하지 않은 것이다. 제품의 140ms /
`cubic-bezier(0.23, 1, 0.32, 1)` / scale 0.97을 채택하며 함께 고쳤다.

그 밖에 max-width 320, 1px 테두리, 테마별 그림자, 열림 지연 300ms를 채택했다. 22축 전부 판정.

### Menu / Popover — 면·간격·알파를 다 채택했다

제품의 공용 정본은 컴포넌트가 아니라 `--dropdown-*` 토큰이다. 패널 padding 6, 항목 사이 2,
항목 내부 6, 최소 폭 160, 라이트 면 neutral-100을 채택했다. 이전 DS는 padding이 action-menu 4 /
composite 8로 갈려 있었고 항목 사이 gap이 없어 **행이 붙어 있었다.**

- **테두리를 없앴다.** 제품처럼 헤어라인을 `box-shadow` 스프레드 0.5px로 그린다. 레이아웃 박스를
  늘리지 않으면서 1px보다 얇은 선이 된다.
- **hover를 알파 오버레이로 바꿨다.** 이전 DS는 불투명 `background-inset`이라 배경이 다른 자리에서
  면이 튀었다.
- **`danger` 전경을 `#ff4b59`로 바꿨다.** 이전 `status-danger-foreground`가 중립 표면 위에서 대비가
  무너지는 것은 규범이 이미 인정하던 결함이고, 제품 값 채택이 그것을 해소한다.

항목 높이 44px과 focus ring은 제품을 따르지 않았다. 제품은 37px에 focus ring이 없고 둘 다 WCAG
계약이다. 34축 전부 판정.

### 토큰 모델이 두 군데 넓어졌다

- **테마별 elevation.** `semantic.light/dark`에 elevation 축을 열었다. 기존 elevation은 global이라
  테마마다 그림자 색이 다른 것을 표현할 수 없었다. tooltip과 menu가 첫 소비자다.
- **Figma style에는 mode가 없다.** 그래서 테마별 elevation은 Light를 정본으로 삼고 다크 값은 CSS만
  갖는다. parity 계약이 그 사실을 명시적으로 담는다 — 이전에는 mode가 여럿일 때 어느 것을 쓰는지가
  우연에 달려 있었고 실제로 다크가 뽑혀 나왔다.

alpha primitive 13개, semantic 색 11개, spacing 3개, motion 4개, elevation 2개가 늘었다. Figma에도
같은 변수 186개와 style 23개가 서 있다.

## 2026-08-15 — primary를 제품 브랜드 블루로 되돌리고, 그 대가를 기록한다

Owner가 Figma의 Button을 보고 물었다 — "프라이머리 컬러가 왜 저래, 왤케 어둡냐. 내 실제 배포환경에서
진짜 저 컬러를 쓰고 있다고?" 세어 보니 아니었다.

| 단계 | 제품 사용 횟수 | 흰 글자 대비 |
| --- | --- | --- |
| `--primary-400` #38a4ff | 28 | 2.54 |
| `--primary-500` #0088ff | **30** | 3.37 |
| `--primary-700` #005fb3 | **2** | 6.12 |

DS는 사용 횟수 2회짜리 `blue.700`을 action 색으로 쓰고 있었다. **왜 그렇게 됐는지는 명확하다 —
대비 게이트다.** 제품 브랜드 블루로는 4.5를 넘길 수 없어서, 통과하는 가장 가까운 값까지 어두워진
것이다. 그런데 그 판단이 어디에도 Decision으로 기록돼 있지 않았다. `migration/token-mapping.md`에
"시각값이 다르다" 한 줄뿐이었다. **브랜드 색이 접근성 게이트 때문에 조용히 바뀐 상태였다.**

### 결정

Owner가 `blue.500`을 정본으로 택했다. 반단계(450/550 같은 것)는 쓰지 않는다.

- `color-accent-primary` → `blue.500`
- `color-accent-primary-hover` → `blue.400`. 제품이 hover에서 **밝아진다**(`filter: brightness(1.06)`).
  기존 DS는 어두워졌다 — 방향이 반대였다.
- `color-accent-primary-pressed` → `blue.600`. hover가 밝아지므로 눌림은 어두워져 둘을 가른다.

제품의 3-stop 그라디언트는 채택하지 않는다. 그것은 노드 생성 FAB과 공유하는 면이고
(`--node-prompt-generate-gradient`), 버튼이 FAB의 면을 물려받은 구조다. DS는 flat으로 간다.

### 대가를 숨기지 않는다

`primary` 버튼은 이제 **WCAG 2.2 AA 미달**이다(3.37 < 4.5). 이 미달은 제품이 이미 갖고 있던 것이고
DS가 그것을 그대로 재현한다. 세 곳에 같은 사유를 남겼다.

- token source의 `contrastPairs[].note`
- [Button](../components/button.md)의 Known deviations
- axe 테스트의 허용 위반 목록

그리고 **기준을 낮추는 일이 다시는 조용히 일어나지 않도록** 게이트를 고쳤다.

- `minimum`이 4.5 미만인 contrast pair는 **`note`가 필수**다(20자 이상).
- 완화하지 않았는데 `note`를 붙이는 것도 막는다. 사유가 실제 완화와만 짝지어야 "note가 있으니
  괜찮다"는 오독이 안 생긴다.
- canary 2종이 매 실행에서 이 두 방향의 검출력을 증명한다.

axe 테스트도 지우지 않고 **알려진 위반만 고정**했다. `primary: ["color-contrast"]` 하나뿐이고,
새 위반이 생기면 여전히 실패한다. 테스트를 지웠다면 그 variant의 나머지 검출력까지 사라졌을 것이다.

### 토글이 hover에 지워지고 있었다

Icon Button을 Figma로 옮기려고 CSS 특정성을 실제로 계산하다가 찾았다. `[aria-pressed="true"]`는
(0,2,0)이고 `:hover[data-variant="primary"]`는 (0,3,0)이다. **켜진 토글에 포인터를 얹으면 배경이
variant 색으로 되돌아가고 글자만 pressed 색으로 남는다.** 실측으로 확인했다 — bg가 #38a4ff,
fg가 foreground-primary.

지속 상태를 일시적 상태가 덮는 것이고 [Interaction states](../foundations/interaction-states.md)가
금지하는 것이다. hover/active 규칙에서 pressed를 제외해 고치고 acceptance test로 고정했다.

### Icon Button이 Figma에 섰다

40 variant(Variant 4 × Size 2 × State 5). 한 변 40/32가 기하 계약으로 묶여 있고, `State`는
`Default/Hover/Active/Pressed/Disabled`다 — Icon Button이 `active`와 `pressed`를 **둘 다** 갖는
첫 컴포넌트다.

**글리프 색 문제를 한 번 잘못 판단했다가 고쳤다.** 처음에는 "Figma에 currentColor가 없고 instance
내부를 플러그인 API로 못 바꾼다"고 결론내고 Known deviation으로 적으려 했다. 실제로는 **숨겨진
instance라서** 내용이 로드되지 않았던 것이고, 보이는 instance는 내부 vector에 접근된다. 글리프
stroke를 variant마다 올바른 전경 토큰에 다시 묶었다(IconButton 40 + Button 80 = 120개).

### manifest가 Figma 이름을 갖는다

`name`은 사람이 읽는 표시 이름이라 `Dialog / Confirm Modal` 같은 값이 들어 있다. Figma에서 슬래시는
**폴더 구분자**라 component set 이름이 쪼개진다. `figmaName`을 별도 필드로 두고 schema가 대문자
시작 PascalCase만 허용한다.

### Baseline 갱신 (DS-GOV-001)

분류별 diff는 breaking 4종 — `value`/`rawValue`/`aliasTarget` 각 6건(토큰 3개 × 모드 2개)과
`contrastPairs` 1건이다. `removal`은 0이고 의도하지 않은 항목은 없다. 공개 release와 published
library가 없어 baseline 복사로 처리했다.

## 2026-08-15 — Figma의 Button이 코드와 2px 어긋나 있었다

사용자가 "피그마에 만들어둔 버튼은 뭐냐"고 물어 열어 봤고, **틀려 있었다.**

| | Figma | 코드 실측 | 차이 |
| --- | --- | --- | --- |
| md Default | 59×**37** | 59.875×**39** | 높이 −2 |
| sm Default | 46×**26** | 47.031×**28** | 높이 −2 |
| md Loading | **79**×37 | **85.875**×39 | 폭 −6.9 |
| sm Loading | **66**×26 | **71.031**×28 | 폭 −5.0 |

### 왜 2px인가

`button.css`의 `border: 1px solid transparent`를 빼고 padding과 line-height만으로 프레임을 잡았다.
위아래 1px씩이 통째로 빠졌다. 올바른 매핑은 **Figma padding = CSS padding + border, stroke는
INSIDE**다. 그러면 프레임 높이가 CSS와 같아지고 1px 테두리는 padding 안에 앉는다.

### 왜 아무도 못 잡았나

parity 게이트가 **variant 이름과 "paint가 변수에 바인딩됐는가"만** 봤다. 치수도 구조도 코드와
대조하지 않았다. 프로젝트 카드 때와 같은 구멍이다 — 게이트가 없는 곳에서 그럴듯한 것을 만들었다.

그래서 양방향 계약을 세웠다.

- [`figma/components.measured.json`](../../figma/components.measured.json) — 실브라우저로 잰
  구조값. 총 폭은 넣지 않는다. 라벨 폭은 폰트 렌더링에 달려 있어 브라우저와 Figma가 원래 다르고,
  그 차이를 실패로 읽으면 게이트를 끄게 된다.
- `packages/react/test/component-geometry.browser.test.tsx` — **코드가 여전히 그 값을 만드는지.**
- parity 게이트 — **Figma가 그 값과 같은지.** 변조 canary 6종을 붙였다(높이, padding, 슬롯 크기,
  variant 간 분기, 코드 prop 대응 property 삭제, description 삭제).

한 방향만 걸면 "Figma와 measured는 서로 맞고 둘 다 코드와 틀린" 상태로 통과한다.

### 여기서 찾은 코드 결함

`.louis-button__icon`에 크기가 없어 **호출부가 넘긴 아이콘 크기가 그대로 버튼 높이가 됐다.** sm
버튼에 기본(20px) 아이콘을 넣으면 높이가 28이 아니라 **30**이 되고, 같은 줄의 버튼들이 아이콘
유무로 어긋난다. 높이가 호출부에 따라 달라지는 것은 컨트롤이 아니므로 슬롯을 md 20 / sm 16으로
Button이 소유하게 하고 글리프를 슬롯에 맞췄다. Iconography의 "글리프 크기는 아이콘이 소유한다"에
대한 의도적 예외이며 사유는 Button 규범의 Known deviations에 있다.

이것도 새 기하 테스트가 잡았다. 규범에 없던 `## Specification` 절도 함께 세웠다 — 없어서 아이콘
크기가 규정되지 않았고 기본값이 새어 들어왔다.

### 상태 어휘가 충돌하고 있었다

Figma의 `State=Pressed`는 `:active`(누르는 중)인데 Icon Button 규범의 `pressed`는
`aria-pressed`(토글 켜짐)였다. 같은 단어가 두 컴포넌트에서 다른 것을 가리켰고, 그대로 두면 남은
다섯 component set에 전부 번진다.

[Interaction states](../foundations/interaction-states.md)를 세워 정본으로 삼았다. 규칙은 하나다 —
**이름을 웹 플랫폼에서 가져온다.** `:active`가 있는 쪽이 `active`, `aria-pressed`가 있는 쪽이
`pressed`다. 그러면 "이 이름이 무슨 뜻인가"를 이 저장소가 아니라 플랫폼 명세가 답한다. Button의
Figma option을 `Active`로 고쳤다.

### Figma Button을 다시 만들었다

40 variant를 지우고 다시 지었다(Templates의 Button instance는 0개라 안전했다). 달라진 것.

- 프레임 높이가 md 39 / sm 28로 코드와 같다.
- `State`가 `Default, Hover, Active, Disabled, Loading`이다.
- **아이콘 슬롯이 생겼다.** 코드에 `leftIcon`/`rightIcon`이 있는데 Figma에는 없었다.
  `LeftIcon`/`RightIcon` boolean과 `LeftIconGlyph`/`RightIconGlyph` instance swap을 붙였고, 슬롯
  크기는 md 20 / sm 16이며 켜도 높이가 변하지 않는 것을 확인했다.
- description에 기하 매핑과 **표현하지 못하는 것**을 적었다: `:active`의 scale 0.98(프레임 크기를
  바꾸면 기하 계약이 깨진다), danger의 hover 면 변화(CSS에 없다 — `color-accent-danger*` 대기).

`INSTANCE_SWAP` property의 기본값은 component key가 아니라 **node id**를 받는다. key를 주면
`Property value is incompatible with component property type`으로 거부한다. 세 형태를 실제로
시도해 확인했다.

## 2026-08-15 — 인계서를 실제 상태에 맞춘다

**규범이 아니라 사실 정정이다.** [인계서](../governance/execution-handoff.md)의 다음 포인터가
2026-08-14 이후 갱신되지 않아, 그 사이 커밋 다섯 개가 만든 상태를 담지 못했다. 큐가 정본인데 정본이
실제와 어긋나 있었다.

무엇이 틀려 있었나.

- `DS-P3-013`(아이콘)이 "여전히 0개"라고 적혀 있었다. 실제로는 글리프 26개가 React·Figma 양쪽에
  서 있고 게이트가 positive 6 + canary 20종이다. `done`으로 고쳤다.
- Icon Button·Tooltip·Toast가 큐 어디에도 없었다. 셋 다 Web `partial`이고 docs `done`이다.
  `DS-P3-009`에 gap registry 순위표로 넣었다.
- `DS-F-007-home`이 수행됐다는 기록이 없었다. gap 72건과 그 판정을 항목에 적었다.
- `DS-F-006`은 Button만 있고 나머지가 열려 있다는 사실이 드러나지 않았다.

**앞질러 간 의존성을 감추지 않고 적었다.** `DS-P3-009`는 문서상 `DS-P3-008`(RC 패키징) 의존이지만
Icon Button·Tooltip·Toast를 그보다 먼저 구현했다. RC는 "무엇을 먼저 만들 것인가"의 입력이 아니고,
DS-P3-009a 인벤토리와 Home 재조립이 그 근거를 실측으로 냈기 때문이다. 완료 조건은 약화하지 않았다.
Icon Button이 원래 목록(Input, Select, Tooltip, Toast, Empty State)에 없던 항목이라는 것도 함께 적었다.

계획 밖에서 들어온 토큰도 기록했다. `icon-size-*`, `layout-control-height-*`, `radius-control-sm`,
`color-bg-inverse`/`color-fg-on-inverse`는 `DS-P3-014`의 10개 단위 바깥에서
component가 요구해 들어왔다. 각각 규범·Figma 변수·snapshot까지 같은 변경 단위에서 반영했으므로
누락은 없으나 단위 6·7의 잔여 범위는 다시 세어야 한다.

### 다음 포인터

`DS-F-006`의 나머지 component set 다섯이다. Web에 여섯이 서 있는데 Figma에는 Button 하나뿐이고,
목표 B는 Figma component로만 재조립하는 것이므로 **코드와 Figma의 격차가 지금 목표 B의 단일
병목**이다. 순서는 gap registry를 따른다.

## 2026-08-15 — Toast

gap registry 3순위다. 세 화면 실측에서 **20개 파일이 toast를 쓰는데 공용 컴포넌트가 없었고**, 같은
정의가 `appHomeSceneStyles.ts`와 `highlightSceneStyles.ts`에 최소 2벌 중복돼 있었다.

### Added

- [Toast](../components/toast.md) 규범과 `ToastProvider` / `useToast` public export
- `packages/css/src/component/toast.css`
- `--louis-color-bg-inverse`와 `--louis-color-fg-on-inverse`. Toast가 첫 소비자이며
  contrast pair로 등록해 두 모드 모두 게이트가 잰다(light 11.61, dark 13.59). Figma 변수로도
  함께 만들었다.
- Storybook `Components/Toast` story 5종

### 기존 `color-fg-inverse`를 쓸 수 없었던 이유

이름이 비슷해 헷갈리기 쉽다. `color-fg-inverse`는 **두 모드 모두 `neutral-0`**이다 —
`action-primary` 같은 진한 표면 위 텍스트를 위한 것이다. Toast의 표면은 다크에서 오히려 **밝아지는**
반전 표면이므로 그 위에 흰 글자를 얹으면 읽히지 않는다. 그래서 모드에 따라 뒤집히는 쌍을 새로 만들었다.

### Baseline 갱신 (DS-GOV-001)

`contrastPairs` 배열 변경은 diff 정책상 **무조건 breaking**이다 — 배열 전체를 한 단위로 비교하므로
추가와 제거를 구분하지 않는다. 이번 변경의 분류별 diff는 additive 10건, breaking은 `contrastPairs`
1건뿐이며 그 내용은 `color-bg-inverse` / `color-fg-on-inverse` 쌍 **추가 1, 제거 0**이다.

정책을 느슨하게 고치지 않고 [Releases](../governance/releases.md)의 DS-GOV-001 절차를 따랐다.
분류를 "추가는 non-breaking"으로 바꾸면 게이트가 앞으로 **보증 철회를 놓칠 위험**이 생기고, 그것이
이 게이트의 존재 이유다. 공개 package release와 published Figma library가 아직 없어 소비자가 없으므로
baseline 복사로 처리했다.

### 계약

- **놓쳐도 되는 것만 담는다.** 확인이나 선택이 필요하면 Dialog이고, 반드시 읽어야 하면 화면에
  자리를 준다. 폼 오류는 해당 필드 옆이다 — 화면 반대편에서 사라지는 알림으로는 어디를 고칠지 모른다.
- **`message`는 `ReactNode`가 아니라 string이다.** live region은 텍스트를 읽는다. 요소를 넣으면
  보조 기술이 읽는 내용과 화면에 보이는 것이 갈린다.
- **live region 둘을 처음부터 렌더한다.** 보조 기술은 region이 존재한 뒤의 변화만 감지하므로,
  toast가 생길 때 region을 함께 만들면 **첫 메시지가 읽히지 않는다.** polite와 assertive를 별도
  region에 두는 것도 같은 이유다 — 한 region의 `aria-live`를 바꾸면 그 시점의 변경이 유실된다.
- **닫기 버튼을 두지 않는다.** 대신 포인터·focus로 타이머가 멈춘다. 닫기 버튼은 focus 순서에
  끼어들고, 사라지는 대상에 focus를 두면 focus가 소실된다.
- **멈췄다 풀리면 남은 시간부터 흐른다.** 처음부터 다시 세면 읽으려고 얹어 둔 것이 벌이 된다.
- **대기 중인 toast는 자기 차례가 와야 시계가 시작된다.** 상한 3개를 넘긴 것이 보이지 않는 동안
  소멸하면, 사용자는 뜬 적 없는 알림을 놓친 것이 된다.

### overlay primitive를 쓰지 않는다

Menu·Dialog·Tooltip과 달리 toast는 anchor가 없고 focus를 가져가지 않으며 바깥 클릭과 무관하다 —
positioner·focus scope·dismissable layer 중 해당하는 것이 하나도 없다. 붙이면 없는 문제를 위해
배경을 잠그게 되므로 Provider가 자기 viewport를 소유한다. 대신 viewport가 **비어 있을 때 포인터를
가로채지 않는다**는 점을 테스트로 고정했다. 화면 하단을 덮는 투명한 판이 되면 그 아래 컨트롤이
눌리지 않는다.

### Known deviations

제품과 셋이 다르다. 제품의 `backdrop-filter: blur(10px)`은 DS에 backdrop blur effect가 없어 불투명
반전 표면으로 대체했다. 제품의 **단일 슬롯 교체**(새 메시지가 이전 것을 지움)는 자동 소멸과 겹치면
읽기 전에 사라지므로 스택으로 바꿨다. **퇴장 전환은 넣지 않았다** — `animationend`로 걸면 그 이벤트가
오지 않는 경우 사라지지 않고 남는다. 전환보다 반드시 사라지는 것이 우선이다. 실행 취소 액션과 Figma
component set은 남아 있다.

## 2026-08-15 — Tooltip

gap registry 2순위다. 세 화면 실측에서 **22개 파일이 tooltip을 쓰는데 공용 컴포넌트가 없었다** —
제품 자신의 Button(17개 파일)보다 넓게 쓰인다.

### Added

- [Tooltip](../components/tooltip.md) 규범과 `Tooltip` public export
- `packages/css/src/component/tooltip.css`
- `--louis-radius-control-sm`(8px). gap registry가 지적한 **"가장 많이 쓰이는 radius에 semantic 이름이
  없다"**의 해소이며 Tooltip이 첫 소비자다. Figma 변수로도 함께 만들었다.
- Storybook `Components/Tooltip` story 5종

### 계약

- **이름이 아니라 설명이다.** 표면은 `role="tooltip"`이고 trigger는 `aria-describedby`로 가리킨다.
  `aria-labelledby`가 아니다. trigger는 자기 이름을 스스로 가져야 하며, tooltip이 이름의 유일한
  출처가 되면 포인터 없는 사용자에게 이름이 없다.
- **열 때만 지연하고 닫을 때는 즉시**다. 포인터가 떠났는데 설명이 남으면 어느 컨트롤의 설명인지
  알 수 없다. 키보드 focus는 지연 없이 연다 — 지연은 지나가는 포인터를 거르기 위한 것이고 focus는
  의도된 이동이다.
- **표면이 포인터 이벤트를 받지 않는다.** 받으면 표면 위로 포인터가 옮겨갔을 때 trigger가 이탈로
  판정돼 깜빡인다. 깜빡임의 원인이 표면 자신이 되는 구조다.
- **터치에는 열리지 않는다.** hover가 없고 길게 누르기는 컨텍스트 메뉴와 충돌한다.
- **trigger를 감싸지 않는다.** `cloneElement`로 속성만 붙인다. 래퍼를 두면 호출부의 flex/grid
  계산이 조용히 달라진다. 이것도 테스트로 고정했다.
- **anchor 간격을 자체 숫자로 갖지 않는다.** overlay 표면 CSS가 소유하고 Provider가 1회 측정한
  값을 쓴다. 처음 구현에서 이 값을 넘기지 않아 **간격이 0으로 붙어 있었고**, 브라우저 실측으로
  잡아 고친 뒤 테스트로 고정했다.

### primitive 소비자가 셋이 됐다

overlay primitive에서 **위치 계산과 portal만** 쓴다. focus scope·inert·scroll lock·dismissable
layer는 쓰지 않는다 — tooltip은 focus를 가져가지 않고 바깥 클릭을 삼키지도 않으므로, 붙이면 없는
문제를 위해 배경을 잠그게 된다. DS-D-0011의 소비자가 Menu·Dialog에 이어 셋이 된다.

### Known deviations

그룹 지연 건너뛰기(인접 trigger로 옮길 때 지연 생략), arrow, Figma component set이 없다. 열림
모션은 제품의 140ms 대신 DS `overlay-enter` 200ms를 썼다 — 제품 값을 들이려면 motion 토큰 추가가
선행이다.

## 2026-08-15 — Icon Button

gap registry 1순위를 구현했다. 세 화면 실측에서 raw `<button>` 108개 중 다수가 아이콘 전용이었고,
제품에는 이것을 담당하는 공용 컴포넌트가 없다.

### 왜 Button의 prop이 아닌가

**실측이 정했다.** `Button`을 아이콘 전용으로 렌더하면 md 54×38, sm 46×30으로 **정사각이 되지
않는다** — 빈 라벨과의 `gap` 8px과 좌우 padding이 남는다.

기하보다 결정적인 것은 접근성 계약이다. Button은 이름이 children에서 오므로 `label`을 필수로 만들
수 없지만, 아이콘 전용 버튼은 라벨이 없으면 **이름이 아예 없는 버튼**이 된다. "children이 비었을
때만 필수"는 타입으로 표현할 수 없다. `IconButton`은 `label`을 필수 prop으로 강제한다.

그 실측을 **테스트로 고정했다.** Button의 기하가 바뀌면 그 테스트가 실패하고, 그때 이 결정의
근거를 다시 판정해야 한다.

### Added

- [Icon Button](../components/icon-button.md) 규범과 `IconButton` public export
- `packages/css/src/component/icon-button.css`
- 컨트롤 높이 토큰 — `--louis-layout-control-height-md`(40) · `--louis-layout-control-height-sm`(32).
  gap registry가 지적한 "컨트롤 높이 토큰 없음"의 첫 해소이며, Figma 변수로도 함께 만들었다.
- Storybook `Components/Icon Button` story 5종. `WhyNotButton`은 두 컴포넌트를 나란히 두어
  정사각 차이를 눈으로 보게 한다.

### 계약

- **크기를 padding이 아니라 한 변의 길이로 정한다.** Button은 고정 높이가 없어 라벨·번역·확대에
  따라 자라지만, Icon Button은 정사각이 계약이므로 높이를 직접 소유한다.
- **히트 영역은 시각 크기와 분리된다.** 컴포넌트가 `.louis-hit-target`을 직접 붙여, sm이 32×32로
  보여도 실제 히트는 44×44다. 호출부가 감쌀 필요가 없다.
- **`pressed`는 토글에만.** 주지 않으면 `aria-pressed` 속성 자체가 붙지 않는다 — `false`를 늘
  붙이면 토글이 아닌 버튼이 보조 기술에 토글로 노출된다. 실브라우저에서 확인했다: Matrix story의
  11개 중 토글 2개에만 속성이 있고 나머지 9개는 `null`이다.
- **`pressed`와 `active`는 다른 축이다.** `active`는 누르고 있는 동안, `pressed`는 토글의 켜짐
  상태다. 같은 시각으로 표현하면 눌린 것인지 켜진 것인지 구분되지 않는다.
- 글리프는 두 size에서 모두 20px이다. 아이콘은 컨테이너와 독립이다(Iconography Size model).

### Known deviations

`loading` 상태가 없다 — 아이콘 자리에 무엇을 넣을지, Button의 loading과 같은 축인지 미정이다.
Figma component set도 아직 없다(DS-F-006 대상).

## 2026-08-15 — 세 화면 gap 합산과 카탈로그 순서

Highlight(허브·상세)와 Editor(허브·워크스페이스)를 추가로 실측해 Home과 합산했다. gap은 Home 72 ·
Highlight 130 · Editor 144다. 산출물은
[figma-gap-registry.md](../../migration/figma-gap-registry.md)다.

### 이 실측의 결론 하나

**제품에는 공용 컴포넌트 층이 사실상 없다.** 제품의 공용 UI 디렉터리는 파일 10개이고 그중 시각
컴포넌트는 넷뿐이다 — Button · VideoPlayer · InlineLoadingLabel · LoadingSpinner. 나머지는 브랜드
마크와 훅이다. 경로와 줄번호는 [gap registry](../../migration/figma-gap-registry.md)가 소유한다. 그래서 Klipse Design은 제품을 따라잡는 것이 아니라 **제품에 없던 층을 처음 만드는**
것이다. 실측이 찾은 중복 정의(ProjectCard 3벌, Menu 서피스 3벌, Spinner 5종, PaneDivider 6선언)는
전부 그 부재의 비용이다.

### 가장 강한 단일 신호 — 버튼 공용 사용률 6%

네 파일의 버튼을 직접 셌다. raw `<button>` **108개** vs 공용 `<Button>` **8개**. 제품에 Button이
있는데도 94%가 손으로 만들어진다. Button 하나로는 덮이지 않는다는 뜻이고, 빠진 축은 아이콘 전용
버튼·크기 단계·loading 상태다.

### 순서가 바뀌었다

Home만 봤을 때의 1순위는 ProjectCard였으나, 세 화면을 합치니 **IconButton · Tooltip · Toast**가
앞선다. Tooltip은 22개 파일, Toast는 20개 파일에 나타나는데 **제품 자신의 Button(17개 파일)보다
넓게 쓰이면서 공용 컴포넌트가 없다.** 한 화면만 보고 순서를 정했으면 틀렸을 자리다.

### 토큰 — 세 화면이 함께 요구하는 것

- **`radius-8`에 semantic 이름이 없다.** 에디터에서 가장 많이 쓰이는 radius다(직접 센 분포:
  8이 28회로 최다, 12가 20회, 999·6이 각 11회). Klipse semantic radius 5종에 8이 없다.
- **범주형 색 팔레트가 없다.** 에디터는 클립을 소스별로 색 구분한다(sky 63 · pink 19 · red 16 ·
  mint 13 · amber 12 · yellow 2). Klipse에는 status 4종뿐이다.
- **컨트롤 높이 토큰이 없다.** 에디터에 22/28/30/32/36/40/44/48 여덟 단계가 돈다.

### 실측 방법에서 배운 것

검증 단계에서 10건이 `confirmed=false`로 나왔는데, 읽어 보니 **전부 "gap 자체는 실재한다"고
확인하면서 세부 수치가 달라 false가 된 것**이었다. 판정 기준을 "하나라도 틀리면 false"로 준 탓에
"gap이 없다"와 "숫자가 틀리다"가 뭉개졌다. 그대로 읽었으면 IconButton·Slider·ProjectCard를 통째로
버릴 뻔했다. **그래서 이 registry의 수치는 직접 다시 센 값만 썼다.**

## 2026-08-15 — Home 재조립 검증과 gap registry

DS-F-007의 첫 화면. 앱 홈(`/archive`)을 Klipse Design 자산만으로 Figma에서 재조립해 **무엇이
없는지**를 측정했다. 산출물은 [figma-gap-registry.md](../../migration/figma-gap-registry.md)와
Templates 페이지의 coverage 프레임이다.

### 판정 — Home은 아직 gap 없이 재조립되지 않는다

제품 화면을 축 4개로 실측해 **321건을 측정하고 gap 72건**을 찾았다. Figma에 있는 것은 Button
component set 하나와 아이콘 26개뿐이라, 화면이 요구하는 ProjectCard · SidebarNavItem ·
AppTopBar · Menu · EmptyState · Avatar · Badge · BannerCarousel이 전부 없다.

그래서 이 단계의 재조립은 **픽셀 재현이 아니라 coverage 측정**이다. Templates의 프레임은
자홍색 파선으로 raw 영역을 드러내며, 그 파선이 화면 대부분을 차지한다는 사실 자체가 판정이다.

```
DS 자산에서 온 instance   7
gap 영역                  8
변수에 바인딩된 paint     46   (raw 7은 gap 표시선 자체)
```

### 토큰 — 이름만 보고 집으면 화면이 달라지는 것 둘

- **`radius-card` 20px ↔ 제품 카드 16px.** 프로젝트 카드·썸네일·배너·메인 카드·토스트가 전부
  16px인데 DS의 `radius-card`는 20px이고, 16px과 맞는 것은 `radius-overlay`다. 게다가
  `radius-card`의 유일한 소비처는 dialog의 sheet variant다 — **"카드"라는 이름의 토큰을 정작
  카드가 쓰지 않는다.**
- **`layout-project-card-minimum` 240px에 소비처가 없다.** DS는 `minmax(240px, 1fr)` auto-fill을
  전제하지만 제품은 minmax를 아예 쓰지 않고 브레이크포인트로 **열 수를 고정**한다
  (2 / 3@720 / 4@1200 / 5@1800). `packages/css` 어디서도 참조되지 않으며 규범 문서에서만 언급된다 —
  **존재하지 않는 알고리즘을 기술하는 토큰이다.**

둘 다 판정이 필요하다. DS를 제품에 맞출지, 제품 migration을 기록할지는 owner의 결정이다.

### 그 밖에 확인된 divergence

- 라이트 팔레트가 앱 셸 스코프(`body:has(.gnb-wrapperSidebar)`)에서 통째로 재정의된다. 캔버스가
  `#eeeef1`, 표면이 `#f8f8f9`로 DS의 `#f1f1f3` / `#fafafa`와 다르다. **다크는 정확히 일치한다.**
- 카드 테두리가 border가 아니라 spread-only 0.5px box-shadow다. DS `elevation/*` 4종은 전부 blur가
  있어 재현할 수 없다.
- `magic-wand`는 사이드바 "비디오 에디터"의 실사용 아이콘인데 −45° 회전 때문에 이관을 보류했다.
  이 화면이 실사용처이므로 처분 판단이 필요하다.

### 제품 부채로 분류한 것

DS가 고칠 문제가 아니라 adoption 노트로 넘긴다. 삭제 모달의 액션이 공용 Button을 쓰지 않고,
primary 버튼이 3-stop 그라디언트이며, z-index 체계가 DS layer 토큰과 다르고, 렌더되지 않는 죽은
스타일이 남아 있다. `--app-gnb-main-card-padding-block-start: 20px`은 선언만 있고 아무도 읽지
않으므로 **문서만 보고 20px을 넣으면 틀린다.**

## 2026-08-14 — Iconography 규범과 아이콘 파이프라인

### Added

- [Iconography](../foundations/iconography.md) foundation과
  [DS-D-0008](../governance/decisions/DS-D-0008-icon-source.md) — 아이콘 정본 구조 결정
- 크기 토큰 `--louis-icon-size-{sm,md,lg}` = 16 / 20 / 24px, `packages/css/src/component/icon.css`
- `scripts/build-icons.mjs`와 `scripts/verify-icon-gates.mjs`(변조 canary 11종)
- 정본 글리프 **26개** — Phosphor 21 · Iconoir 3 · Lucide 2
- `packages/react/THIRD-PARTY-NOTICES.md` — upstream 라이선스 원문을 생성으로 동봉한다

### 이관 방식과 그 근거

**정본은 제품 사본이 아니라 upstream 원본에서 만들었다.** 제품 자산은 Figma를 거치며 arc가 cubic으로
평탄화되고 색이 하드코딩돼, 정본으로 삼으면 "왜 좌표가 upstream과 다른가"를 영원히 설명해야 한다.

Phosphor는 256 격자 stroke 16이고 Klipse는 24 격자 stroke 1.5다. `24/256 = 3/32`이고 분모가 2⁵이라
모든 결과가 **유한소수이자 IEEE754에 정확히 표현되는 값**이다 — 0~256 정수 전 구간을 대조해 오차 0을
확인했다. 획 비율도 `16/256`과 `1.5/24`가 똑같이 `1/16`이라, 좌표와 같은 인자로 곱한 획이 계약값에
정확히 떨어진다.

**변환 결과를 픽셀로 검증했다.** upstream과 정본을 같은 뷰포트에 256px로 그려 대조한 결과 27개 중
24개가 완전 일치, 1개가 0.002%(안티에일리어싱)였다. 나머지 2개는 Lucide의 `copy`/`copy-check`로,
잉크비가 정확히 `1.5/2 = 0.75`다 — 계약에 맞춘 두께 변경 외에 달라진 것이 없다는 뜻이다.

### Wave B 판정 — 제품 자산과 대조

Phosphor 이름을 가졌으나 출처가 미확정이던 7개를 제품 자산과 픽셀 대조했다.

| 결과 | 글리프 | 근거 |
| --- | --- | --- |
| Wave A로 승격 | `arrow-up` `download-simple` `trash-simple` | 제품 자산과 **픽셀 완전 일치**. 출처 Phosphor 확정 |
| Wave B 유지 | `lightbulb`(22.5%) `caret-double-right`(19.3%) | 잉크량은 같으나 배치가 다르다 — 같은 글리프가 아니다 |
| Wave B 유지 | `align-left-simple` `align-right-simple`(14.9%) | 잉크비 0.512. 제품 쪽이 채움 도형이다 |

### 이번 범위에서 제외

- **`magic-wand`.** 지팡이 몸통이 −45° 회전한 둥근 사각형이라 `transform` 없이는 표현되지 않는다.
  회전을 path로 굽는 것은 좌표를 옮기는 것이 아니라 **새로 그리는 것**이라 이관이 아니다. 계약에
  `transform`을 여는 것과 다시 그리는 것 중 무엇을 택할지는 별도 판단으로 남긴다.
- `x-circle`은 제품이 Fill 변종을 썼으나 정본은 regular를 채택했다. 세트가 1.5 획으로 통일돼야
  시각 언어가 갈리지 않는다. 외형이 바뀌므로 owner 확인이 필요하다.

### Changed — 규범

- **provenance 없는 글리프는 채택되지 않는다.** `origin`이 `original`이 아니면 프로젝트·아이콘
  이름·라이선스·라이선스 파일·출처 URL·취득일을 전부 갖춰야 하고, 빈 값과 `"unknown"`은 빌드
  실패다. 추정 출처를 사실로 승격시키는 경로를 규범에서 없앤다.
- **upstream 글리프는 고지문과 함께만 배포한다.** MIT와 ISC가 공통으로 요구하는 "copies에 고지를
  포함한다"를 사람의 기억이 아니라 생성기가 이행한다. 고지문 없이 배포하는 경로는 존재하지 않는다.
- **정본은 정규화된 형태로만 커밋한다** — viewBox `0 0 24 24`, `stroke-width` 1.5 하나, 색은
  `currentColor`와 `fill="none"`만, `id`/`clip-path` 금지. 좌표 스케일 변환은 이관 시 한 번만 한다.
- 아이콘의 기본값은 **장식**이다. `label`을 주지 않으면 `aria-hidden="true"`가 된다. 아이콘 전용
  버튼의 이름은 버튼이 소유하므로 아이콘에 `label`을 주지 않는다.
- **서브패스 `@klipse-design/react/icons`를 열었다.** Wave A 전체가 게이트를 통과한 뒤였고,
  `verify-gates`의 react 계약과 브라우저 테스트가 모두 공개 경로를 쓴다. 제거는 breaking이므로
  글리프 이름과 심볼은 이제 공개 계약이다. `files`에 `THIRD-PARTY-NOTICES.md`가 포함돼, 패키지를
  받는 쪽이 라이선스 원문을 함께 받는다.
- Storybook에 `Foundations/Iconography` story 4종을 추가했다 — Overview·Sizes·InheritsColor·
  InButton. **실루엣 정확성은 게이트가 판정하지 못한다**고 규범이 선언한 그 공백을 메우는 자리다.

### 외형이 바뀌는 것 — owner 확인이 필요하다

| 글리프 | 무엇이 바뀌나 | 왜 |
| --- | --- | --- |
| `eye-slash` | 채운 동공 → **감은 눈** | 제품의 `eyeslash.svg`에는 **빗금이 없다.** `eye`와 같은 눈꺼풀 호에 동공만 채운 것이고, 채운 동공은 "숨김"이 아니라 오히려 "더 보임"으로 읽힌다. 제품 호출부 17곳 |
| `x-circle` | Fill 변종 → regular | 세트가 1.5 획으로 통일돼야 시각 언어가 갈리지 않는다 |
| `text` | 획 2 → 1.5 | 24 격자 계약. 잉크량 0.75 |

### 적대적 감사가 찾은 파서 결함

파이프라인을 세운 직후 **통과시켜서는 안 될 입력**으로 게이트를 공격했고, 위음성이 나왔다.

- **작은따옴표로 쓴 요소가 조용히 사라졌다.** `<path id='x' stroke='#ff0000' stroke-width='9'/>`가
  게이트를 통과하면서 **동시에 생성물에서 빠졌다.** 파서가 큰따옴표 형태만 인식했고, 못 읽은 것을
  거부가 아니라 무시로 처리했기 때문이다. 계약 위반이 통과하는 것도 나쁘지만, 파이프라인이
  디자이너가 그린 것을 말없이 바꾸는 쪽이 더 나쁘다.
- 고침은 두 갈래다. XML에서 두 따옴표는 동등하므로 **둘 다 받고**, 그와 별개로 **본 태그 수와
  처리한 태그 수가 일치하는지** 검사한다. 앞으로 어떤 문법 변종이 나와도 "못 봤다"가 "통과"가
  되지 않는다.
- 같이 막은 것들: root `<svg>`에 표현 속성 주입, `"Unknown"` 대소문자 우회, `modifications` 누락,
  provenance 문자열로 고지문 절 구조 위조, `"https://"` 한 줄짜리 sourceUrl, 이름이 다른 두
  글리프가 같은 심볼로 방출(`x-2`와 `x2`), 같은 그림을 두 이름으로 두어 고지 의무 가리기.
- canary가 11종에서 **20종**이 됐다. 게이트와 모델이 각자 들고 있던 필수 필드 목록도 하나로 합쳤다 —
  두 벌이면 한쪽에 필드를 더할 때 다른 쪽이 조용히 뒤처진다.

### 게이트 강화 둘 — 아이콘과 무관하게 적용된다

- **`verify-figma-parity`의 변조 canary가 실패 상태에서도 돈다.** 이전에는 `failures.length === 0`일
  때만 돌아서, parity가 깨진 동안 검출력 증명 7종이 통째로 멈췄다. 게이트가 가장 못 미더운 시점에
  게이트의 보증이 사라지는 순서였다. 판정을 "변조가 baseline에 없던 실패를 새로 만드는가"로 바꿨다.
- **`build-css`가 존재하지 않는 토큰 참조를 잡는다.** CSS는 정의되지 않은 커스텀 속성을 오류로
  만들지 않고 그 선언만 무효로 만들어서, 오타가 "그 규칙을 안 썼을 때"와 구분되지 않았다.

### Figma — `icon/*` component 26개

draft 라이브러리 파일에 정본에서 생성한 component 26개를 만들었다. `icon/{kebab}` 개별
component이고 **크기 variant를 두지 않는다** — 두면 코드의 `IconSize`와 Figma variant가 두 정본이
되어 4px 격자를 누가 소유하는지 모호해진다.

- 전부 24×24, stroke 두께 1.5, cap ROUND. **raw stroke 0 / raw fill 0**으로 DS-F-006의 "raw 값 0"을
  만족한다. Figma에는 `currentColor`가 없어 전부 `color/foreground-primary`에 바인딩했다.
- `createNodeFromSvg`가 프레임에 **흰색 fill을 붙인다.** 그대로 두면 raw 값이 하나 생기므로
  생성 직후 지운다. 실측으로 확인한 동작이다.
- parity가 **요소 분해 보존**을 대조한다 — 코드 `elementCount` ↔ Figma `vectors`. 26개 전부
  일치했다. 좌표까지 대조하지 않는 이유는 Figma vector 왕복 손실을 아직 실측하지 않았기
  때문이고, 도형이 병합되거나 사라지는 사고는 좌표를 보지 않아도 이것으로 드러난다.
- parity canary가 7종에서 **11종**이 됐다(아이콘 제거·frame 변조·raw paint·요소 수). canary 수는
  이제 tamper 배열에서 파생돼 목록과 어긋날 수 없다.
- `figma-sync.md`에 되읽기 규칙 둘을 추가했다. **페이지를 명시적으로 전환한 뒤 세지 않으면
  component가 조용히 0개로 나온다** — 실제로 겪은 사고이고, 덤프가 "없음"과 "안 봄"을 구분하지
  못하는 형태다.

publish는 여전히 `not-ready`다. publish API가 존재하지 않으므로 owner가 Figma UI에서 수동으로
해야 하며, 그 전에는 어떤 상태도 올리지 않는다.

### Added — Figma snapshot 재생성 경로

`.prettierignore`는 snapshot이 "dump가 쓰는 것"이라고 선언했지만 그 dump가 없었다.
`figma/readback.json`(Plugin API 되읽기 원본)과 `scripts/build-figma-snapshot.mjs`(projection과 drift
검사)로 나누고 재생성 절차를 스크립트 헤더에 담았다. `pnpm verify`가 둘의 일치를 강제한다.

### Known deviations

- 글리프의 **실루엣 정확성은 게이트가 판정할 수 없다.** 정규화·해시·이름·고지는 기계가 잡지만
  "이 그림이 맞는가"는 사람의 시각 review다.
- Wave B 14개는 좌표 대조로 upstream을 특정하지 못했다. 재작도하거나 채택하지 않는다.

## 2026-08-14 — Dialog 공개

### Added

- `Dialog` compound — `DialogSurface`, `DialogHeader`, `DialogTitle`, `DialogDescription`,
  `DialogBody`, `DialogFooter`, `DialogActions`, `DialogClose`, `DialogCancel`, `DialogConfirm`
- `useDialogClose()` — 소비자가 자기 footer를 직접 그릴 때의 confirm/cancel 발행 통로
- `packages/css/src/component/dialog.css`

### Changed — 규범

- `Migration` 2번이 바뀌었다. `ConfirmDialog`/`TaskDialog`/`MediaWorkbenchDialog` 세 recipe 대신
  **단일 `Dialog` + `variant`** 다. 셋의 차이는 초기 포커스·dismiss 기본값·크기 tier 세 값뿐이고,
  그것을 세 컴포넌트에 흩으면 규범이 한 곳에서 읽히지 않는다.
- **variant 자동 전환을 하지 않는다.** 뷰포트 폭으로 `task`를 `sheet`로 바꾸면 dismiss 정책과 초기
  포커스가 화면 크기에 따라 달라진다 — Surface classifier가 금지한 것의 축소판이다.
- `media-workbench`의 초기 포커스가 "heading 또는 첫 핵심 컨트롤"에서 **dialog surface**로 바뀌었다.
  surface가 포커스를 가지면 스크린리더가 이름을 먼저 읽고 다음 Tab이 내용으로 들어간다.
- `closeOnBackdrop`이 `dismissible`에 종속된다. 실효값은 `closeOnBackdrop && dismissible && !busy`다.
- **dismiss 차단 안내가 Dialog의 의무가 됐다.** `onDismissBlocked`는 추가 훅이지 안내의 유일한 출처가
  아니다. 선택으로 두면 소비자가 아무것도 넘기지 않았을 때 차단이 완전히 무음이 되고, 사용자는
  Escape가 고장난 것으로 인지한다.
- `alertdialog`를 지원하지 않기로 확정했다. `role`을 prop으로 여는 것이 Workspace 오용의 최단 경로다.
- 제목과 설명이 prop이 아니라 하위 컴포넌트다. 설명을 prop으로 받으면 렌더되지 않았을 때
  `aria-describedby`가 없는 id를 가리킨다 — 화면상 아무 이상이 없는 접근성 회귀다.

### 구현이 드러낸 primitive 결함 둘

- **modal의 focus 복원이 배경이 inert인 상태에서 일어나 body로 떨어졌다.** inert 요소는 `focus()`를
  조용히 무시한다. 격리 해제를 복원보다 앞으로 옮겼다. non-modal에는 격리가 없어 Menu에서는 드러나지
  않던 경로다.
- **focus trap이 복원된 포커스를 다시 끌어왔다.** 하부 유틸의 trap 해제는 passive effect인데 복원은
  layout effect라, 그 시점에 리스너가 아직 살아 있다. 닫히는 subtree를 **복원 전에** inert로 만들어
  되끌기 대상을 없앴다.
- **scroll lock의 위치 복원이 기본 경로에서 no-op이었다.** owner가 `document.body`인데 표준 모드에서
  뷰포트 스크롤 위치는 `document.scrollingElement`에 있어 `body.scrollTop`은 항상 0이다.

### Current impact

`@klipse-design/react`를 쓰는 앱은 `OverlayProvider`가 이미 있으면 추가 작업이 없다. Dialog는
controlled 전용이며 `open`과 `onOpenChange`가 필수다.

## 2026-08-14 — 컴포넌트 워크샵

### Added

- `apps/storybook` — Storybook 10. `pnpm --filter @klipse-design/storybook dev`
- Button·ActionMenu·CompositePopover 스토리와 light/dark 테마 툴바

### Changed

- **Button 라벨이 좁은 폭에서 글자 단위로 쪼개지던 것을 고쳤다.** `overflow-wrap`을 `anywhere`에서
  `break-word`로 바꿨다. `anywhere`는 min-content 폭까지 낮추므로 flex 컨테이너 안에서 버튼이 한 글자
  폭까지 줄어든다(실측 74px → 38px). 시각 변경이지만 API는 그대로다.

### 워크샵이 이것을 위해 있다

셋 다 기존 테스트가 통과하던 상태였다 — 계산값 단언은 "잘리지 않았다"와 "토큰을 쓰고 있다"를 볼 뿐
"어떻게 보이는지"를 보지 않는다.

- Button 라벨 쪼개짐 (고침)
- Menu Trigger의 기본값이 스타일 없는 네이티브 버튼 (`asChild`가 의도된 경로임을 문서화)
- danger item의 톤이 일반 item과 구분되지 않음 — 대비 light 1.21 / dark 1.14 (DS-P3-014 단위 9로 이관)

### 이것은 시각 회귀가 아니다

스냅샷 baseline을 만들지도 커밋하지도 않고 어떤 게이트도 렌더 결과를 검사하지 않는다.
컴포넌트 승격 조건의 visual regression 항목은 그대로 남아 있다.

### Current impact

소비자에게 달라지는 것은 Button의 줄바꿈 동작 하나뿐이다.

## 2026-08-14 — Menu / Popover 공개

### Added

- `ActionMenu`, `ActionMenuTrigger`, `ActionMenuContent`, `ActionMenuItem`, `ActionMenuLinkItem`,
  `ActionMenuGroup`, `ActionMenuSeparator`, `ActionMenuSub`(+`SubTrigger`/`SubContent`)
- `CompositePopover`, `CompositePopoverTrigger`, `CompositePopoverContent`, `CompositePopoverTitle`
- `OverlayProvider` — **앱 root에 한 번 두어야 하는 공개 진입점**
- `useOverlayBranch()` — React 트리 밖에서 만든 nested overlay를 같은 branch로 등록한다
- `packages/css/src/component/menu-popover.css`

### 소비자가 해야 하는 것

`OverlayProvider`를 앱 root에 한 번 렌더한다. 없으면 Menu가 던진다.

```tsx
<OverlayProvider>
  <App />
</OverlayProvider>
```

host와 scroll owner를 앱이 한 번만 해석하게 하는 것이 계약이다. 컴포넌트가 host를 고르면 인스턴스마다
stacking과 inert 경계가 달라진다.

### Changed

- `menu-popover.md`의 Properties 표가 바뀌었다. `kind`는 prop이 아니라 **컴포넌트 정체성**이고,
  `open`은 조건부 필수(+`defaultOpen`)이며, `offset`·`collisionPadding`·`branchId`는 prop이 아니다.
- `onOpenChange`의 reason 어휘에 **`programmatic`** 이 추가됐다. 소비자가 `open`을 직접 내려 닫는
  경로가 실제로 소비자에게 도달하는데 기존 5종이 그것을 덮지 못했다.
- `disabledItems`가 생겼다. disabled 표기를 한 menu 안에서 섞지 않게 **menu 단위**로 고른다.
- 새 `## Focus` 절이 variant별 초기 focus와 reason별 return focus를 소유한다.
- `menu-popover`의 Web 상태가 `not-ready` → `partial`.

### 구현에서 규범이 강제한 것

- **프로필 패널에 `role="menu"`를 붙일 수 없다.** 컴포넌트를 둘로 나눠 타입과 런타임에서 모두 막는다.
- **`Enter`/`Space`에 keydown 핸들러를 붙이지 않는다.** 브라우저가 이미 click을 합성하므로 더하면 두 번
  실행된다. `<a href>`만 예외다 — `<a>`의 Space는 click을 합성하지 않고 페이지를 스크롤한다.
- **키보드 리스너를 native로 붙인다.** React 이벤트는 React 트리로 전파되는데 submenu의 Content는
  부모의 React 서브트리 안이라, React 핸들러를 쓰면 submenu의 방향키가 부모까지 실행해 focus가 튀고
  그 focusout이 submenu를 닫는다. 두 panel은 DOM에서 형제라 native에는 그 문제가 없다.
- **item에 `.louis-hit-target`을 쓰지 않는다.** 44px `::after`가 항목 중앙에 겹쳐 놓여, 간격 없이 쌓이는
  행에서 인접 항목의 hit 영역을 2px씩 가로챈다. "삭제"가 "설정" 아래에 있으면 그대로 사고다.

### Known deviations

한국어 typeahead가 동작하지 않는다(IME 켜진 비편집 요소의 keydown이 완성 음절을 주지 않는다).
RTL에서 `ArrowRight`/`ArrowLeft`가 반전되지 않는다. 바깥 클릭도 최상위 branch 하나만 닫으므로
submenu가 열려 있으면 두 번 눌러야 전체가 닫힌다. 전체 목록은 `menu-popover.md`의 Known deviations에 있다.

### Current impact

`@klipse-design/react`를 이미 쓰는 앱은 `OverlayProvider`를 추가하기 전까지 Menu를 쓸 수 없다.
Button만 쓰는 앱에는 영향이 없다.

## 2026-08-14 — Overlay behavior layer

### Added

- `packages/react/src/overlay/` — Menu와 Dialog가 공유할 순서·정책 계층. portal host 해석, presence
  FSM, branch registry, layer stack, dismiss 정책, focus 정책, inert, scroll lock, activation guard,
  id 발급, anchor 배치를 각각 독립 모듈로 분리했다.
- `packages/css/src/component/overlay.css` — 하부 positioning 유틸의 변수를 `--louis-overlay-*`로
  재발행하는 **단일 seam**. 유틸을 교체하면 이 블록 5줄만 바뀐다.
- `base.css`에 두 규칙 — `[data-louis-state="opening"]`(비가시·비 hit-test)와
  `[data-louis-scroll-locked="true"]`.
- fixture 2종과 실브라우저 회귀 45건, node 단위 14건.

### 이 계층이 필요한 이유

하부 유틸의 layer stack은 **등록 순서**로 최상위를 정한다. React는 effect를 자식 → 부모 순으로
돌리므로 부모와 자식 overlay가 같은 commit에 열리면 **부모가 최상위**가 된다 — DOM 중첩과 정반대다.
`overlay-store.node.test.ts`가 같은 입력에서 두 규칙이 갈리는 것을 고정한다.

### Changed

- **소비자에게 달라지는 것은 없다.** `@klipse-design/react`의 public 표면은 그대로 `Button`
  하나이며 `exports`와 패키지 게이트도 변하지 않았다. overlay는 recipe의 구현 세부다.
- `@klipse-design/css`의 `styles.css`에 overlay recipe가 추가됐다. `.louis-overlay-panel`을 쓰지 않는
  앱에는 영향이 없다.
- `menu-popover.md`와 `dialog.md`의 pre-implementation blocker 중 primitive 부재 항목이 해소됐다.
  두 컴포넌트의 `Web` 상태는 **`not-ready` 그대로다** — primitive는 카탈로그 컴포넌트가 아니다.

### 구현에서 규범이 강제한 것

- 바깥 `pointerdown`은 아무것도 닫지 않는다. dismiss는 후속 `click`에서 commit되고 그 click은 배경에
  도달하기 전에 소비된다. pointerdown에서 닫으면 착지점이 사라져 선택이 0회가 되는데, 그것이 규범이
  차단급으로 지정한 "열리지만 선택되지 않음"이다.
- 닫힐 때 focus는 root가 **아직 DOM에 있는 동안** 동기로 돌아간다. 하부 유틸의 복원은 비동기라
  대상이 사라진 뒤에 실행될 수 있다.
- exit 시간과 unmount 시점이 같은 CSS 선언에서 온다. reduced-motion에서 둘 다 0이 되며 **순서는
  동일하다**.

### Known deviations

- iOS Safari의 `overflow: hidden` scroll lock은 headless Chromium으로 검증할 수 없어 미확인이다.
- non-modal에서 Tab으로 이탈해 닫힐 때 reason은 `outside`다. 새 어휘를 만들지 않은 이유는
  [DS-D-0011](../governance/decisions/DS-D-0011-overlay-primitive-boundary.md)에 있다.

### Current impact

`@klipse-design/react`를 쓰는 앱이 지금 해야 할 일은 없다. Menu(DS-P3-006)와 Dialog(DS-P3-007)가
공개되면 그때 `OverlayProvider`를 root layout에 한 번 두게 된다 — host와 scroll owner를 앱이 한 번만
해석하도록 강제하는 것이 계약이기 때문이다.

## 2026-08-14 — Figma Button component와 코드↔디자인 parity

### Added

- Figma 라이브러리에 `Button` component set 40 variant (Variant 4 × Size 2 × State 5). fill 72와
  stroke 18이 전부 변수 바인딩이고 텍스트 40개가 전부 text style이다 — **raw 값 0**.
- parity 게이트가 **Figma variant 옵션을 코드 타입 선언과 대조**한다. `Variant`는 `ButtonVariant`와,
  `Size`는 `ButtonSize`와 집합이 같아야 한다. Figma에만 있는 `State`는 사유와 함께 계약에 선언돼야
  통과하고, 선언되지 않은 property가 생기면 실패한다.
- 변조 canary가 7종으로 늘었다 — 값·alias·collection·**mode 순서**·style·**component variant 옵션**·
  **component raw 값**.

### Fixed

**Figma가 Dark를 기본 모드로 쓰고 있었다.** mode를 알파벳 정렬한 탓인데, token source는
`themes: ["light", "dark"]`로 light를 먼저 선언하고 CSS도 `:root`가 light다. 라이브러리를 열면
기본 표시가 다크로 나오는 상태였다.

생성기가 source가 선언한 theme 순서를 따르도록 고치고 `defaultMode`를 proposal에 명시했다. parity
게이트는 이제 mode 순서를 정렬하지 않고 **그대로 비교**하며 기본 모드도 검증한다. token graph는
바뀌지 않아(projection만 변경) baseline 갱신은 필요 없었다.

이 결함은 component를 만든 뒤 **스크린샷을 눈으로 확인하다** 발견했다. 값 대조만으로는 드러나지
않는 종류였다.

### Changed

- Button의 Figma 상태를 `partial`로 올렸다. `done`은 publish(DS-F-008) 이후다.
- token consumer fixture가 mode 순서를 source의 `themes`에서 도출해 비교하고 기본 모드를 검증한다.

### Current impact

Figma 라이브러리는 여전히 publish되지 않았다. Button 외 component는 아직 없고, 나머지 7종은 각자
코드 구현이 생긴 뒤에 만든다.

## 2026-08-14 — 첫 컴포넌트: Button

### Added

`@klipse-design/react`가 처음으로 public export를 갖는다.

```tsx
import { Button } from "@klipse-design/react";

<Button variant="primary">새 프로젝트 만들기</Button>
```

- `packages/react/src/button/button.tsx` — `tsc` + `isolatedDeclarations`로 빌드된다.
- `packages/css/src/component/button.css` — 상태는 `data-*`, 값은 semantic 토큰만.
- 실브라우저 acceptance test 11건이 [Button 규범](../components/button.md)의 Acceptance tests를
  그대로 검증한다.

### 구현에서 규범이 강제한 두 가지

- **활성화를 네이티브 `<button>`에 맡긴다.** pointer click·Enter·Space가 각각 정확히 한 번
  실행되는 것은 브라우저가 보장한다. keydown으로 클릭을 흉내 내면 중복 실행이 된다.
- **`loading`은 네이티브 `disabled`를 쓰지 않는다.** 네이티브 disabled는 현재 focus를 제거하는데
  규범이 이를 금지한다. `aria-disabled`로 표시하고 activation을 명시적으로 막으며, 실제 포인터는
  actionability가, 프로그램적 click과 keyboard는 컴포넌트가 막는 두 층으로 검증한다.

### Changed

- Button의 Web 상태를 `partial`로 올렸다. 근거는 public export와 acceptance test 11건이며,
  `done`에는 visual regression·수동 screen-reader review·SSR·Figma component·제품 사용처가 남는다.
- `pnpm build`에 `build:react`가 연결됐다.
- Availability canary를 하드코딩 문자열에서 정규식으로 바꿔 상태가 바뀌어도 동작하게 했다.

### Known deviations

- `danger` variant가 tonal이다. solid를 표현할 `color-accent-danger*` 토큰이 없다.
- 고정 높이 토큰이 없어 높이를 padding과 line-height로 결정하고 44px 타깃은 `louis-hit-target`이
  보장한다.

둘 다 DS-P3-014가 해소한다.

### Current impact

Figma는 여전히 publish되지 않았고 Button의 Figma 상태도 `not-ready`다. 제품 adoption은 바뀌지
않았다. 다음은 overlay behavior layer이며, Button의 코드 구현이 생겼으므로 Figma component
작업(DS-F-006-button)도 열렸다.

## 2026-08-14 — CSS foundation package

### Added

`@klipse-design/css`가 처음으로 실제 public surface를 갖는다. 저작 원본
`packages/css/src`에서 `scripts/build-css.mjs`가 배포 CSS를 생성한다.

| 서브패스 | 내용 |
| --- | --- |
| `./layers.css` | `@layer` 순서 선언만. root layout 최상단에서 가장 먼저 import |
| `./tokens.css` | 토큰 CSS 재export |
| `./styles.css` | base + 컴포넌트, 언레이어드 |
| `./styles.layer.css` | 같은 내용, layer 래핑 |
| `./reset.css` | opt-in reset, `:where()` 기반 |

두 벌 배포는 Tailwind 소비자가 유틸리티로 라이브러리 스타일을 이길 수 있게 하기 위한 것이다.
`styles.css`와 `styles.layer.css`를 동시에 import하지 않는다.

base 유틸리티는 `louis-visually-hidden`, `louis-focus-ring`, `louis-hit-target`, `louis-layer-*`,
그리고 `[data-louis-state]`의 closing/closed 계약이다.

### 게이트

`scripts/verify-css-gates.mjs`가 저작 규칙 위반을 실제로 잡는지 canary 6종으로 증명한다 —
`!important`, 숫자 z-index, raw color 리터럴, primitive 직접 소비, reset 밖 전역 선택자,
그리고 생성물 drift. `pnpm verify`에 연결됐다.

브라우저 테스트 6건이 계산값과 실제 상호작용을 확인한다. 특히 focus-visible이 **키보드 포커스에서만**
나타나고 포인터 클릭에서는 나타나지 않는 것까지 검증한다 — 문자열 검사로는 불가능한 항목이다.

### Changed

- `pnpm build`에 `build:css`, `pnpm check`에 `check:css`, `pnpm verify`에 `verify-css-gates`가
  연결됐다.
- manifest의 `webPackages`에서 css의 `web`을 `partial`로 올렸다. 근거는 5개 서브패스, canary 6종,
  브라우저 테스트 6건이며 **컴포넌트 CSS는 아직 없다**.

### Current impact

React 패키지는 여전히 소스가 없고 `not-ready`다. 컴포넌트 recipe는 DS-P3-004부터 각 컴포넌트와 함께
붙는다. Figma와 제품 adoption 상태는 바뀌지 않았다.

## 2026-08-14 — 테스트 harness 구축과 게이트 전환

### Added

- **Vitest 실브라우저 harness** — project 3개(`node`, `browser`, `browser-reduced-motion`).
  reduced-motion은 provider 수준 옵션이라 instance가 아니라 project로 나눈다.
- **TypeScript 설정 3단** — `tsconfig.base.json`(공통 strictness) / `tsconfig.build.json`
  (declaration + `isolatedDeclarations`) / `tsconfig.json`(typecheck). `pnpm typecheck`가
  `pnpm check`에 연결됐다.
- `scripts/verify-test-harness.mjs` — 각 project에 의도적 실패 테스트를 심어 러너가 실패를
  전파하는지 증명하고, 제거 후 실제 suite가 통과하는지 확인한다. `pnpm verify`에 연결됐다.
- **첫 실테스트 20건.** 토큰 CSS가 브라우저에서 theme 계약대로 계산되는지(기존 게이트는 CSS 문자열만
  검사한다), 소비자 관점의 token 공개 계약, 그리고 실행 환경이 실제 브라우저인지 검증한다.
- scaffold 게이트 canary 2종 — 선언 밖 exports, CSS 노출 패키지의 `sideEffects` 누락 (canary 17 → 19).

### Changed

- manifest schema에 `webPackages`를 추가해 CSS/React 패키지 상태와 evidence를 표현한다.
  `tokenPackage.figmaLibrary`·`packageRelease`의 고정값도 status enum + evidence 요구로 완화했다.
- `packages/tokens`에 `sideEffects: ["*.css"]`와 `./package.json` export를 명시했다.
- CI에 `pnpm install --frozen-lockfile`, `pnpm build`, tracked 검사를 추가했다. 의존성 0 전제가 여기서
  끝난다.
- 저장소에 devDependencies가 생겼다 — TypeScript, Vitest, Playwright, `axe-core`.

### spike 실측 결과 (저장소 밖)

- **S1 — 하부 유틸 조합이 Menu 규범을 충족한다.** item 클릭 시 select가 정확히 한 번, 바깥 클릭은
  dismiss만, **중첩 portal item도 정확히 한 번 선택**, closing layer가 pointer를 놓으면 아래 control이
  클릭됨. 그리고 규범 위반 상태를 일부러 만들면 실제로 실패한다(검출력 확인). 완제품 라이브러리가
  실패한다고 보고된 중첩 portal 선택이 하부 유틸에서는 통과한다.
- **S3 — `tsc`의 `isolatedDeclarations` emit이 정상 동작**하고, `inert`가 실행 브라우저에 구현돼
  있다. 이전 major로의 fallback은 필요 없다.

### 왜 jsdom을 쓰지 않는지 기계적으로 강제한다

`packages/tokens/test/environment.browser.test.ts`가 레이아웃 계산, hit test,
`HTMLDialogElement`의 modal/non-modal 구분, `inert`를 확인한다. jsdom이나 happy-dom으로 후퇴하면 이
테스트가 실패하므로, DS-D-0005의 "조용한 다운그레이드 금지" 규칙이 문서가 아니라 게이트로
강제된다.

### Current impact

CSS·React 패키지는 여전히 소스가 없고 상태는 `not-ready`다. Web과 Figma 상태, 제품 adoption은 바뀌지
않았다. 다음 작업은 DS-P3-003(CSS foundation package)이다.

## 2026-08-14 — Web 아키텍처 Decision 6종

### Added

코드 트랙(P3)의 선행 결정을 모두 `proposed`로 기록했다. 파일·의존성 변경은 아직 없다.

| Decision | 결정 |
| --- | --- |
| `DS-D-0002` Web 지원 범위 | React 19 단일 major · ESM 전용 · leaf `"use client"` · `baseline widely available` · `tsc` + `isolatedDeclarations` |
| `DS-D-0003` behavior dependency | 하부 유틸만 채택하고 **Menu의 선택 순서와 Dialog의 mode·Escape·scroll lock은 Klipse가 소유**. 완제품 미채택 |
| `DS-D-0004` CSS 저작 방식 | authored plain CSS + cascade layer 두 벌 · 상태는 `data-*` · 런타임 스타일 라이브러리 0 · reset opt-in |
| `DS-D-0005` test stack | 실브라우저 러너를 1단계에 둔다. **jsdom·happy-dom 배제** |
| `DS-D-0006` versioning | changesets `fixed`로 css·react 동반 버저닝 · css를 required peer로 강제 |
| `DS-D-0009` font distribution | 폰트 미동봉 · 교체 지점을 변수 하나로 단일화 · 폴백 스택 교정 |

### Why

두 결정은 **조사에서 나온 반증**에 근거한다.

- **완제품 overlay 라이브러리를 채택하지 않는 이유:** 후보 라이브러리에 "중첩 메뉴 item이 선택
  콜백을 발화하지 않음", "collision으로 뒤집힌 submenu가 click 착지 전에 닫힘", "Dialog가 오픈 직후
  첫 프레임에 pointer 이벤트를 막음"이 **미해결 이슈로 존재**한다. 셋 다 이 저장소의 규범이 명시적
  금지 계약으로 적은 실패다. 그래서 순서와 정책 계층을 우리가 소유한다.
- **jsdom·happy-dom을 배제하는 이유:** jsdom의 `HTMLDialogElement`는 사실상 빈 클래스라
  `showModal()`이 없고, happy-dom은 `showModal()`과 `show()`가 완전히 동일하다. 즉 **modal과
  non-modal을 구분하는 테스트가 구현이 실제로 둘을 구분하든 안 하든 통과**한다. 초록 테스트가 규범
  위반을 은폐하는 것은 이 저장소가 금지하는 fake completion과 같은 결과다.

### 발견한 결함

`--louis-font-family-sans` primitive가 CSS로 방출되지 않고, 동일한 폰트 스택 리터럴이
`--louis-typography-*-font-family`에 **15번 중복 인라인**된다. 소비자가 폰트를 교체하려면 15개를 전부
덮어야 한다. 또한 폴백 스택의 `Inter`·`Noto Sans KR`·`Noto Sans JP`는 시스템 설치 폰트가 아니라
no-op이어서 **실제 OS 한글 폰트가 스택에 하나도 없다**. DS-D-0009가 두 결함의 해소 방향을 정했고
구현은 DS-P3-003과 DS-P3-014가 수행한다.

### Current impact

package와 Web 상태는 바뀌지 않는다. Decision은 전부 `proposed`이며 owner 확인 대기다. spike 3건(하부
유틸 실측, Server Component 경계, 브라우저 하한과 declaration emit)이 남아 있고, 브라우저 테스트
바이너리 다운로드 승인이 DS-P3-002의 선행 조건으로 추가됐다.

## 2026-08-14 — 타이포 스케일을 배포 실사용에 맞춰 재편

### Added

- `DS-D-0010` Token coverage 확장 원칙 (`proposed`) — 정의가 아니라 실사용을 승격, 반전 램프
  미승격, DOM 상태 스코프는 mode 축이 아님, 알파 10단 정규화, 제품 부채 미승격, 팔레트 완결성 우선
- `typography-*` semantic 15종과 대응 `type-style-*` primitive 15종 — body 계열 4 size × 3 weight,
  heading 계열 3 size × medium
- Figma text style 15종(구 6종 제거) — fontSize·fontWeight를 변수에 30건 바인딩

### Changed

- **Breaking (token):** 타이포 composite가 6종에서 15종으로 재편됐다. 다음 ID가 제거되고 대체된다.

  | 제거된 ID | 대체 ID | 값 변화 |
  | --- | --- | --- |
  | `typography-caption` | `typography-caption-regular` | 없음 |
  | `typography-body-sm` | `typography-body-sm-regular` | 없음 |
  | `typography-body-md` | `typography-body-md-regular` | 없음 |
  | `typography-label-md` | `typography-body-sm-medium` | 없음 (14px/500이었다) |
  | `typography-title-sm` | `typography-heading-sm-medium` | **weight 600 → 500** |
  | `typography-title-md` | `typography-heading-md-medium` | **weight 600 → 500** |

  `type-style-*` primitive 6종도 같은 규칙으로 대체됐다. additive 30 · removal 12이며 그 외 분류의
  변경은 없다. 공개 release와 published library가 없어 DS-GOV-001 절차로 baseline을 갱신했다.
- [token mapping](../../migration/token-mapping.md)의 타이포 행을 실사용 기준으로 정정했다.

### Why

[화면 인벤토리](../../migration/screen-inventory.md) 기반 실측에서 배포 화면의 heading이 **전량
medium(500)** 이고 semibold·regular 사용이 0회임이 확인됐다. 기존 `typography-title-sm/md`는
weight 600이라 이 토큰으로 화면을 재조립하면 제목 굵기가 틀렸다. 제품에 `.type-heading-28-semibold`
클래스가 정의만 되어 있었고 이전 매핑이 그 죽은 변형을 정본으로 골랐던 것이 원인이다.

### Current impact

Figma 라이브러리는 여전히 publish되지 않았고 Figma 상태는 `not-ready`다. 토큰 커버리지 확장의 나머지
단위(알파 축, 채널 색, contrastPairs 등 약 140개)는 아직 반영되지 않았으며, 앱 셸 라이트 램프와
제품의 미커밋 변수 사다리는 제품 저장소 확인이 필요해 보류 상태다.

## 2026-08-14 — Figma 라이브러리 변수 구축과 parity 게이트

### Added

- `DS-D-0007` Figma library structure Decision (`proposed`) — collection 3분리, 표현 형태 3분류,
  이름 변환, composite→style 정책, publish 전 단일 파일 구조
- 라이브러리 파일에 collection 3개와 **변수 146개** 적용: `Klipse Primitive` 92(Base),
  `Klipse Semantic` 28(Global), `Klipse Semantic Color` 26(Light·Dark)
- text style 6종(`typography/*`)과 effect style 4종(`elevation/*`) — semantic tier 이름으로만
  생성하고 fontSize·fontWeight를 primitive 변수에 바인딩 (DS-F-005)
- `figma/snapshot.json` — Figma에서 읽어온 evidence와 provenance
- `scripts/verify-figma-parity.mjs` — credential 없이 snapshot ↔ proposal을 대조하는 게이트.
  고유 토큰 174개를 변수 146 · style 10 · 미표현 18로 전수 대조하고, 값·alias·collection·style
  변조 canary 4종을 매 실행에서 자체 검증하며 `pnpm verify`에 연결됨
- [`migration/screen-inventory.md`](../../migration/screen-inventory.md) — 배포 화면 인벤토리와
  카탈로그 gap (DS-P3-009a)
- [Releases](../governance/releases.md)의 "의도적 breaking과 baseline 갱신" 절 (DS-GOV-001)

### Changed

- **Breaking (token):** `figmaCollection`이 `"Klipse Design"`에서 `"Klipse"`로 바뀌었다. 여기서
  `Klipse Primitive` / `Klipse Semantic` / `Klipse Semantic Color` 세 collection 이름이 도출된다.
  공개 registry 소비자와 published library가 없어 DS-GOV-001 절차로 baseline을 갱신했다.
- **Breaking (public types):** `figma.tokens.json`의 최상위 구조가 `modes`에서 `collections`로
  바뀌었고, 토큰마다 `representation`·`figmaName`·`scopes`·`hiddenFromPublishing`이 추가됐다.
- `manifest.schema.json`의 `tokenPackage.figmaLibrary`·`packageRelease`가 고정값에서
  status enum으로 완화됐고, `not-ready`가 아니면 evidence 필드를 요구한다.
- 세션 종료 검증에 Figma parity 게이트가 포함된다.

### Current impact

Figma 라이브러리는 **publish되지 않았고** manifest의 Figma 상태는 모두 `not-ready`를 유지한다.
Foundations(변수 146 + style 10)는 만들어졌지만 component는 아직 없고, component는 대응하는 코드
구현(P3)이 있어야 만든다. 제품 adoption과 package release도 바뀌지 않았다.

알려진 편차: primitive 변수가 `hiddenFromPublishing`인 상태에서 style이 이를 바인딩한다. publish
후 소비자 해석 여부는 DS-F-008 체크리스트에서 확인한다.

## 2026-08-14 — Figma 운영 전제 확정과 제품 실측 기록

### Added

- 디자인 시스템 전용 Figma 라이브러리 파일과 Foundations / Components / Templates 3-페이지 구조
- [Figma Sync Governance](../governance/figma-sync.md)의 운영 파일 표, 실측 capability, MCP 쓰기 정책
- 제품 미러 Figma 파일 관측 근거 `KP-FIGMA-001`
  ([제품 baseline](../../migration/product-baseline.md))
- `DS-P3-014` Token coverage 확장 — 제품이 실제 쓰는 색·타이포 범위가 현재 token source보다 넓다는
  실측에 따른 후속 작업

### Changed

- `DS-F-000`을 `done`으로 올렸다. 다음 포인터는 `DS-F-001`, `DS-P3-001`, `DS-GOV-001`,
  `DS-P3-009a`다.
- 제품 저장소 위치와 기준 commit(`/Users/sejunki/klipse`, branch `louis`, `0d188651`)을 baseline에
  기록했다.
- 환경 blocker 해소: Node 22 LTS와 pnpm 10.30.2 설치로 표준 검증 명령이 실행된다.

### Current impact

Package, Web, Figma와 제품 adoption 상태는 바뀌지 않는다. 라이브러리 파일에는 아직 변수도
component도 없으며, 파일이 생겼다는 사실만으로 어떤 상태도 올리지 않는다. 제품 미러 파일은 이
저장소의 정본이 아니라 읽기 전용 reference다.

## 2026-08-14 — 실행 플레이북과 Figma 트랙 큐 재설계

### Added

- 작업별 상세 절차, 완성 최종 판정표, 환경 게이트와 Figma 실행 경계를 소유하는
  [실행 플레이북](../governance/execution-playbook.md)
- DS-P3-011을 해체한 Figma 트랙 DS-F-000~008: 운영 전제 실측 → 구조 Decision(단일 collection 4-mode
  구조는 Figma 모델과 충돌하고, publish 전에는 파일 간 변수·component 소비가 불가능해 단일 파일
  3-페이지 구조가 강제) → multi-collection proposal → variables/styles 구축 → snapshot parity
  gate → component library → 배포 화면 재조립 검증 → 수동 publish 운영
- 신규 작업: DS-GOV-001(baseline 갱신 규범), DS-P3-002a(게이트 전환), DS-P3-009a(배포 화면
  인벤토리), DS-P3-013(아이콘 트랙)
- Web `partial` 승격용 최소 증거 세트와 `done`/`stable`용 전체 세트를 분리한 증거 2단 모델

### Changed

- Figma 트랙을 React 구현 의존에서 분리해 코드 트랙과 병렬화. DS-P3-012 public release는 published
  Figma library 대신 parity report 존재만 요구
- Editor Workspace generic fixture를 DS-P3-010에서 DS-P5-005 실제 adoption 검증으로 이동
- Figma 실행 경계를 명문화: MCP(Plugin API)가 유일한 자동화 경로, Variables REST API는 Enterprise
  전용으로 불가, library publish는 전 요금제에서 사람 수동, 쓰기는 사용자 지정 draft 파일에만
- 독립 적대 검토 2회의 발견을 반영: Figma 쓰기 실측을 파일 지정 이후로 재배열, 제품 저장소 경로
  사용자 확인 의무화, Decision 승인 주체(proposed/owner 확인) 확정, 문서 수 canary의 하드코딩을
  정규식으로 교체, schema `const` 고정 완화의 소유 작업 지정

### Current impact

Package, Web, Figma와 제품 adoption 상태는 바뀌지 않는다. `ready` 작업은 DS-P3-001, DS-F-000,
DS-GOV-001, DS-P3-009a 네 개이며, Figma 쓰기 작업은 사용자의 draft 파일 key 지정 전까지 `blocked`다.

## 2026-08-13 — Claude Code P3–P5 실행 인계 추가

### Added

- Claude Code가 자동으로 읽는 비규범 루트 `CLAUDE.md` 진입점
- SEED Design의 운영 원칙을 Klipse 규모에 맞춘 P3–P5 실행 순서, 상태 승격 조건과 component 완료 정의
- P3 core local RC, catalog coverage와 P3 complete를 분리한 작업 큐
- 권한이 필요한 remote/hosted CI/publish gate와 독립적인 로컬 작업을 분리하는 자율 실행 규칙

### Current impact

Package, Web, Figma 또는 제품 adoption 상태는 바뀌지 않는다. 다음 실행 포인터는 `DS-P3-001` Web
architecture Decision과 status model이며, 실제 구현과 검증 근거가 생기기 전에는 모든 기존
`not-ready` 상태를 유지한다.

## 2026-08-13 — P2 token source inversion 로컬 RC 구현

### Added

- Color/Theme, Typography, Spacing/Radius, Elevation/Layer, Motion 규범과 acceptance criteria
- DTCG 2025.10-compatible 단일 정본 `packages/tokens/src/klipse.tokens.json`
- 외부 패키지 없이 Node 표준 라이브러리만 사용하는 repository-supported DTCG subset validator
  `scripts/lib/token-model.mjs`
- semantic CSS projection, primitive/semantic JS·JSON·Figma proposal·manifest와 token ID/type/mode/alias/value
  shape를 선언하는 TypeScript projection
- token diff 비교점 `packages/tokens/baseline/manifest.json`
- alias graph, mode completeness, contrast, primitive/semantic metadata projection, CSS theme/selector,
  JS/TypeScript token graph, same-process deterministic render와 token diff 완료 게이트
- 여섯 token artifact atomic batch 교체/rollback과 package self-reference consumer fixture
- lifecycle별 motion property와 container 기반 Project Grid ordered compatibility profile shape 검증

### Changed

- P2 상태를 local `release-candidate`, maturity를 `experimental`로 유지
- token CSS의 source/generator는 `@klipse-design/tokens`가 소유하고 P3 `@klipse-design/css`는 이를
  소비·재export하도록 package 경계를 명확히 함
- P2 Figma 범위를 reviewable proposal까지로 제한하고 published variables/components는 P3로 유지

### Current impact

구조화 source, generated artifact와 private export map은 로컬 RC로 구현됐다. Package public release와
제품 adoption은 `not-ready`이며, Figma proposal 생성은 published library나 Figma 상태 승격의 근거가
아니다. Browser UI, glyph, 접근성, layout과 interaction acceptance도 P3/P5 소비 구현 전까지
`not-ready`다.

## 2026-08-11 — 독립 디자인 시스템 저장소 시작

### Added

- 제품 저장소와 분리된 Klipse Design 모노레포 구조
- strict manifest/schema, generated progress board와 AI 문서
- token, CSS, React package의 정직한 private scaffold
- catalog/LLM drift와 오류 주입 canary를 검증하는 CI gate

### Changed

- Web/Figma 구현 상태를 이 저장소의 실제 상태인 `not-ready`로 초기화
- 제품 route audit과 324건의 과거 debt를 normative catalog에서 분리
- DS release PR과 제품 integration PR을 상호 링크하는 운영 모델로 전환

### Migration

제품 구현은 즉시 바뀌지 않는다. P2 token source와 P3 package가 release된 뒤
[Product Adoption](../governance/migration.md) 절차로 단계적으로 전환한다.
