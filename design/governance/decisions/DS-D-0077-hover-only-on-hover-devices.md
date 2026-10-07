---
id: decision-hover-only-on-hover-devices
status: experimental
authority: normative
---

# DS-D-0077 호버는 호버가 있는 기기에서만 켠다 — `@media (hover: hover)`

- Status: accepted (CSS · 문서 2026-10-07)
- Date: 2026-10-07
- Owners: design system maintainer (소유자 결정)
- Affects: `foundation-interaction-states`, `button`, `icon-button`, `menu-popover`, `select`, `tabs`, `tooltip`,
  `toast`, `table`, `drop-zone`, `choice-card`, `segmented-control`, `selectable-list-row`, `inspector-row`,
  `node-chip`, `node-chrome-button`, `node-side-handle`, `pane-divider`, `floating-shell`, `app-shell-parts`,
  `pattern-document`

## Context

LOUIS 컴포넌트의 `:hover` 는 대부분 맨 선택자였다. 주석도 그렇게 적고 있었다 — `floating-shell.css` 는 「`@media (hover: hover)`
가드를 두지 않는다 — 앵커가 `[&:hover]:` 로 적어 그 가드가 없다」, `menu-popover.css` 는 「제품 주석대로 가드는 두지 않는다 —
원본에 없다」, `toast.css` 도 같았다. 가드가 없는 것은 **제품이 그렇게 적었기 때문**이었다.

그 근거가 바뀌었다. 제품 `feat/canvas-mobile-ux` 가 `3b74f57d2`(2026-09-15)에서 캔버스 크롬의 `[&:hover]:` 를
`[@media(hover:hover)]:[&:hover]:` 로 바꿨다. 모바일 브라우저는 탭한 요소에 `:hover` 를 다음 탭까지 남긴다(sticky hover) —
하단 바 · 헤더 · 레이어 시트 행을 탭하면 호버 틴트가 켜진 채 남았고, 제품의 렌더 감사가 이를 major 로 적었다
(`Toolbar.tsx` · `ProjectHeader.tsx` · `NodeLayersPanel.tsx`). `:active` 는 손을 떼면 풀리므로 두르지 않았다. LOUIS 는 이미
`project-card` · `text-link` · `faq-row` · `record-card` · `banner-carousel` · 사이드바 CTA 에서 같은 가드를 갖고 있었고, 나머지는
같은 결함을 그대로 갖고 있었다.

## Decision

**호버 규칙은 `@media (hover: hover)` 안에 둔다.** `packages/css/src/**` 의 `:hover` 를 쓰는 규칙 전부가 대상이다.

1. **감싸기만 한다.** 선택자 · 선언 · 특이도 · 소스 순서를 바꾸지 않는다. 미디어 쿼리는 특이도를 더하지 않고, 규칙의 자리도
   그대로라 「선택이 호버를 이긴다」 같은 소스 순서 의존이 유지된다. 비활성의 `:disabled:hover` 도 같은 이유로 함께 감싼다.
2. **`:focus-visible` 과 `[data-highlighted]` 는 밖에 남긴다.** 키보드와 방향키 이동은 호버 기기 여부와 무관하다. `a:hover,
   a:focus-visible` · `:hover, [data-highlighted="true"]` 처럼 묶여 있던 선택자는 둘로 나눠 `:hover` 쪽만 가드 안에 둔다 —
   선언은 같고 소스에서 이웃한다.
3. **강제 색(`forced-colors`) 블록과 `prefers-reduced-motion` 블록 안의 호버도 같다.** 그 블록 안에 `@media (hover: hover)` 를
   한 겹 더 둔다. 평상 호버가 가드 안으로 들어갔는데 강제 색 덮어쓰기만 밖에 있으면 터치에서 시스템 색 면이 남는다. 가드 안과
   밖의 규칙은 같은 특이도이므로 강제 색 덮어쓰기가 평상 규칙을 이기는 관계도 유지된다.
4. **`:active` 는 대상이 아니다.** 손을 떼면 풀리고, 터치에서도 눌림은 보여야 한다.
5. **새 규칙도 같다.** 새 컴포넌트의 `:hover` 는 처음부터 가드 안에 적는다.

## Alternatives

- **맨 `:hover` 를 두고 제품과 같은 결함을 감수한다.** 기각. 제품이 같은 결함을 고쳤고 소유자가 가드를 고르지 않을 이유가 없다.
- **`@custom-media` 나 전처리로 한 곳에서 소유한다.** 기각. 이 저장소의 CSS 는 전처리 없는 저작 CSS 이고 가드는 한 줄이다. 별칭을
  만들면 읽는 쪽이 별칭 정의를 따라가야 한다.
- **호버 기기와 터치 기기에 다른 상태를 그린다(`@media (hover: none)` 에 별도 표현).** 기각. 터치에는 「누를 수 있다」를 알리는
  호버 단계가 없을 뿐이고, 눌림은 `:active` 가 이미 맡는다. 호버가 없는 기기에서 항상 보여야 하는 것(project-card 더보기)은
  호버 전용 기능을 드러내는 문제라 컴포넌트가 따로 푼다.

## Consequences

- 터치만 있는 기기에서 탭한 뒤 호버 색 · 불투명도 · 길이 변화가 남지 않는다. 마우스와 호버가 되는 터치패드 기기는 달라지지 않는다.
- 브라우저 시험은 데스크톱 Chromium 이라 `hover: hover` 가 참이다 — 기존 호버 시험은 그대로 통과해야 한다. 가드가 새로 빠뜨린
  호버가 있으면 그 시험이 먼저 깨진다.
- **터치 실기기(iOS Safari · Android Chrome)에서 탭 뒤 호버 색이 남지 않는지는 이번 변경에서 확인하지 못했다.** 제품이 핀을 이
  판으로 올릴 때 화면별로 확인한다.
- 하이브리드 기기(터치 노트북)는 주 입력이 마우스이면 `hover: hover` 가 참이다. 이 결정은 주 입력 기준을 따른다.
- 제품이 `[&:hover]:` 를 아직 쓰는 화면(작업 브랜치 밖)은 LOUIS 와 어긋난다 — 제품 쪽 정리는 이 저장소의 일이 아니다.
