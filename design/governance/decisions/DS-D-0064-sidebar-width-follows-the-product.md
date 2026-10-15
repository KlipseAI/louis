---
id: decision-sidebar-width-follows-the-product
status: experimental
authority: normative
---

# DS-D-0064 레일 폭의 정본은 제품이다 — `layout-app-shell-sidebar-width` 를 240 으로 옮긴다

- Status: accepted (토큰 · 생성물 · 문서 · 테스트 2026-09-16)
- Date: 2026-09-16
- Owners: design system maintainer
- Affects: `pattern-app-shell`, `component-app-shell-parts`, `decision-app-shell-geometry`,
  `decision-ring-and-compact-inset-follow-the-product`

## Context

제품이 2026-09-14(`bc3e6fa3`)에 사이드바 펼침 폭을 280 에서 240 으로 내렸다. 근거는 제품
주석에 있다 — 「240 은 소유자 지정(2026-09-14, 280 → 240). 캔버스 레이어 패널 폭(240)과 같다」
(제품 `globals.css:185-188`, 앵커 `2c6bdacf`).

2026-09-15 앵커 이동에서 **제품 실측 기록은 옮겼고 토큰은 옮기지 않았다.**
`figma/templates.measured.json` 의 `app-shell.railWidth` · `compactDrawerWidth` ·
`home.sidebarWidth` 는 240 이 됐는데 토큰 `layout-app-shell-sidebar-width` 만 옛 값에
멈춰 있었다. 그
이유는 시간이 없어서가 아니라 **이 토큰을 옮기는 것이 웹 소비처의 레일을 실제로 좁히는 계약
변경**이기 때문이다(Updates (138) 「남은 것」 첫 줄, [App Shell](../../patterns/app-shell.md) 표).

그래서 이 저장소는 한 값을 두 곳에서 다르게 말하고 있었다 — 기록은 제품의 240, 토큰은 옛 값.
`.louis-app-shell__rail` 이 그 옛 값으로 그려지고 제품은 240 으로 그려지는데, 둘이 다르다고
말하는 게이트가 없었다.

소유자가 2026-09-16 에 「제품 정본 원칙」으로 240 을 지정했다.

## Decision

**`layout-app-shell-sidebar-width` 를 `{primitive.spacing.280}` 에서 `{primitive.spacing.240}`
으로 옮긴다.** 함께 움직이는 것과 움직이지 않는 것을 명시한다.

**함께 움직인다(생성기가 옮긴다 — 손으로 적지 않는다)**

- `packages/css/generated/tokens.css` 의 `--louis-layout-app-shell-sidebar-width: 240px`
  및 그것을 무는 `.louis-app-shell__rail { inline-size }` ·
  `.louis-app-shell__main { padding-inline-start }`.
- [App Shell](../../patterns/app-shell.md) 「해결된 치수」 표의 생성 구간.
- `packages/react/test/app-shell.browser.test.tsx` 의 예약 폭 단언. **수를 240 으로 바꾸지
  않는다** — 280 이 낡은 원인이 「토큰의 사본을 테스트에 적었다」이므로, 같은 실수를 240 으로
  반복하는 대신 토큰을 읽어 offset 과 맞댄다. 그 단언이 소유하는 계약은 값이 아니라
  **「본문 offset 과 레일 폭이 한 변수를 읽는다」** 이고, 값은 토큰 게이트와 생성 표가 소유한다.

**움직이지 않는다**

- `layout-app-shell-sidebar-collapsed` 56. 접힘 폭은 레일 폭에서 파생되지 않는다
  (`2 × 레일 패딩 + 메뉴 히트 폭`).
- `layout-app-shell-content-reserve` 120. 이름 함정은 [DS-D-0018](DS-D-0018-app-shell-geometry.md)
  이 소유한다 — 이 값은 레일 폭이 아니라 `min(240px, calc(100vw - 120px))` 의 **빼는 값**이고
  제품도 240 으로 내리며 이 120 을 건드리지 않았다.
- `app-shell-min-width` 960. 제품 주석이 명시한다 — 「사이드바가 240 으로 줄어도 하한은 LOUIS
  값을 그대로 둔다(본문이 40 넓어질 뿐 겹치지 않는다)」(`globals.css:184` · `:189`).
- `layout-app-shell-sidebar-padding` 12. [DS-D-0063](DS-D-0063-ring-and-compact-inset-follow-the-product.md).

## Alternatives

- **토큰을 280 으로 두고 제품을 정본에서 제외한다.** 기각. 이 저장소의 원칙은 「제품이
  실제로 무는 값이 정본」이고([DS-D-0043](DS-D-0043-canonical-site-is-what-the-product-bites.md)),
  같은 앵커 이동에서 기록은 이미 240 으로 옮겼다. 토큰만 남기면 한 시스템이 한 값을 두 개
  갖는다.
- **레일 폭을 반응형 토큰으로 판다.** 기각. 제품의 `min(240px, calc(100vw - 120px))` 에서
  데스크톱 하한이 960 이라 240 은 **상수**다. 갈라지지 않는 축에 모드를 열 이유가 없다.
- **테스트의 280 을 240 으로만 고친다.** 기각. 그 수가 낡은 이유를 고치지 않고 다음 이동에
  또 낡을 자리를 남긴다.

## Consequences

- **`verify-figma-parity` 의 채움 칸 셋이 빨개진다.** 채움 칸 기대값은 「레일 폭 토큰 −
  2 × 레일 패딩 토큰」이므로 280 − 24 = 256 이던 것이 240 − 24 = **216** 이 되고, Figma 표본은
  아직 256 이다. `SidebarBrand false.width` · `SidebarCta false.width` ·
  `SidebarNavRow width` 세 줄이다. **이것이 Figma 표본을 옮길 자리이고, 빨간 것이 정상이다** —
  이 변경의 목적 자체가 「말해 주는 게이트가 없다」를 없애는 것이다.
- DS 웹 소비처의 레일이 40 좁아진다. 레일 안 부품은 전부 `inline-size: 100%` 라 스스로
  폭을 선언하지 않으므로 따라 좁아진다. 본문은 40 넓어진다.
- `migration/unverified-value-map.json` · `migration/product-has-refutation.json` 의 산문에
  남은 「280 − 2 × 12 = 256」 계산은 **그 시점 기록**이다. 두 파일은 고정 커밋 기준의 조사
  로그이고 게이트는 제품 인용만 다시 연다(`verify-refutation-quotes` 는 제품 저장소만 읽는다).
  이 변경에서 손대지 않는다.

## Rollout and verification

1. 토큰 정본 한 줄을 옮기고 생성물은 `pnpm build` 로만 만든다(생성 구간을 손으로 고치지 않는다).
2. [App Shell](../../patterns/app-shell.md) 의 「지배하는 자리」 행에서 「토큰은 아직 280 이다」를
   지우고 이 결정을 가리킨다. Updates (138) 「남은 것」 첫 줄도 같은 단위에서 닫는다.
3. `pnpm run check-design-docs`(생성 표) · `pnpm run verify-token-gates` · `pnpm run check-css` ·
   `pnpm run check-tokens` · 브라우저 테스트가 초록이어야 한다.
4. `verify-figma-parity` 의 채움 칸 셋은 **빨갛다.** 줄 수와 사유를 Updates 에 적는다. 초록은
   Figma 세트 단계(표본 216 · variant id 보존 · detach 금지) 뒤에 온다.

## Rollback

토큰 한 줄을 `{primitive.spacing.280}` 으로 되돌리고 `pnpm build` 를 다시 돌린다. 테스트는
토큰을 읽으므로 되돌림에 따라오고, 손으로 적은 수가 없어 잔여가 남지 않는다.
