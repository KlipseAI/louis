---
id: decision-focus-ring-removed
status: experimental
authority: normative
---

# DS-D-0074 포커스 링을 그리지 않는다 — 강제 색에서만 `Highlight`

- Status: accepted (코드 · 토큰 · 문서 2026-10-06)
- Date: 2026-10-06
- Owners: design system maintainer (소유자 결정)
- Affects: `foundation-interaction-states`, `foundation-inclusive-design`, `button`, `icon-button`,
  `dialog`, `menu-popover`, `text-field`, `checkbox`, `slider`, `segmented-control`,
  `selectable-list-row`, `project-card`, `banner-carousel`, `app-shell-parts`, `drop-zone`, `switch`,
  `tabs`, `pattern-document`, `elevation-focus-ring`, `shadow-focus-ring`

## Context

키보드 포커스는 파란 링 하나로 그려졌다. `base.css` 의 `.louis-focus-ring:focus-visible` 이
`outline: border-width-ring(2) solid color-stroke-focus` 에 틈 2px 를 두었고, 그 링을 컴포넌트 열한
곳(text-field 상자 · slider · checkbox · segmented 칸 · selectable-list-row · project-card 프레임 · 더보기 ·
이름 변경 · banner 화살표와 점 · 사이드바 CTA · 건너뛰기 링크)과 document 패턴의 링크가 같은 값으로 다시
적었다. React 컴포넌트 일곱(Button · IconButton · DialogClose · Menu 항목 · Sub 트리거 · SidebarNavItem ·
DropZone)은 opt-in 클래스 `louis-focus-ring` 을 붙였다.

제품과 문서 사이트도 각자 링을 그렸다. 문서 사이트의 검색 막대 「문서 검색 ⌘K」가 파란 링과 2px 틈으로
포커스를 받은 화면이 이 결정의 계기였다.

소유자가 2026-10-06 시안 셋을 보고 골랐다 — 지금의 파란 링과 틈, A 무채색 링, **B 링 없음**.
**B 를 택했다.**

## Decision

**키보드 포커스는 평상 렌더링에서 링도 번짐도 그리지 않는다. 강제 색(Windows 고대비)에서만 시스템 색
`Highlight` 링을 세운다.** 디자인 시스템 · 제품 · 문서 사이트가 같은 규칙을 갖는다.

1. **한 규칙이 소유한다.** `packages/css/src/base.css`:

   ```css
   :where([class^="louis-"], [class*=" louis-"]):focus-visible { outline: none; }
   @media (forced-colors: active) {
     :where([class^="louis-"], [class*=" louis-"]):focus-visible {
       outline: var(--louis-border-width-ring) solid Highlight;
       outline-offset: 2px;
     }
   }
   ```

   `outline: none` 이 브라우저 기본 링까지 지우므로 키보드 포커스가 Chrome 의 파랑 · 검정 링으로
   돌아가지 않는다. 선택자는 LOUIS 클래스를 단 요소만 잡는다 — 전역 선택자는 reset 밖에서 금지다
   ([DS-D-0004](DS-D-0004-css-authoring.md)). `:where()` 로 특이도를 `:focus-visible` 하나에 묶어
   컴포넌트와 소비자가 언제나 이긴다.
2. **opt-in `reset.css` 가 같은 내용을 전역으로 갖는다** — `:where(:focus-visible)`. LOUIS 클래스가
   없는 요소(문서 패턴의 각주 `<a>` 같은 맨 마크업)의 브라우저 기본 링은 reset 을 택한 소비자에서 지워진다.
3. **컴포넌트의 링 규칙을 지운다.** 덮어쓰지 않고 지운다. 열한 컴포넌트와 document 패턴의 평상 링,
   그리고 base 규칙과 같은 내용이던 컴포넌트별 강제 색 블록을 지웠다.
   강제 색에서 링을 **다른 요소가 그려야 하는** 넷만 자기 파일의 강제 색 블록에 같은 링을 적는다 —
   text-field(포커스는 `<input>` 이 받고 링은 상자가 그린다) · segmented-control(radio 가 숨어 있어 칸이
   그린다) · project-card(투명한 액션 층이 프레임의 overflow 에 잘려 프레임이 그린다) ·
   selectable-list-row(강제 색의 선택 테두리 (0,2,0) 가 base 의 링 (0,1,0) 을 이긴다).
4. **`.louis-focus-ring` 클래스를 없앤다.** 한 규칙이 그 opt-in 을 흡수했다. React 컴포넌트 일곱이
   붙이던 클래스를 뗐고 문서의 마크업 예시에서도 지웠다. 클래스를 남긴 소비처는 이름 없는 클래스를
   하나 갖게 될 뿐이고 그 결과(링 없음)가 이 결정이 원하는 것이다 — 그래서 migration window 없이
   없앤다([Deprecations](../deprecations.md)).
5. **토큰.** 아직 참조되는 것은 둔다.
   - `border-width-ring` — 강제 색 링의 두께이고 Spinner · Progress · Node Shell 도 쓴다.
   - `color-stroke-focus` — 포커스 링에서는 빠졌지만 Drop Zone 의 끌어다 놓는 중 안쪽 테두리가 쓴다.
     그것은 포커스가 아니라 「여기에 놓인다」라서 이 결정의 대상이 아니다.
   - `elevation-focus-ring` · `shadow-focus-ring` — 원래 소비처가 0 이었다. `$deprecated` 로 표시한다.
     대체는 없다. Figma effect style `elevation/focus-ring` 으로도 발행돼 있어 제거는 breaking 이고,
     [Deprecations](../deprecations.md) 의 절차대로 한 migration window 뒤 제품 참조 0 을 확인하고 한다.
6. **링이 아닌 것은 대상이 아니다.** 입력 테두리 색 · 면과 글자의 상태 색 · 떠오른 라벨의 색 · 메뉴의
   `[data-highlighted]` 면 · 끌어다 놓기 / 놓을 자리 / 선택의 테두리는 그대로다.

## Alternatives

- **지금의 파란 링을 둔다.** 기각. 소유자가 시안을 보고 고르지 않았다.
- **A 무채색 링.** 기각. 같은 비교에서 B 가 선택됐다.
- **컴포넌트마다 `outline: none` 을 적는다.** 기각. 마흔 곳에 흩어지면 하나를 빠뜨려도 게이트가
  잡지 못하고, 브라우저 기본 링이 그 자리로 돌아온다. 한 규칙이 소유하면 빠뜨릴 자리가 없다.
- **강제 색에서도 링을 지운다.** 기각. 그 모드에서는 면 색과 그림자가 시스템 색으로 치환돼 포커스를
  말할 다른 단서가 없다. 평상 렌더링에는 영향이 없다.

## Consequences

- **WCAG 2.2 의 2.4.7 Focus Visible(AA)은 링으로 충족되지 않는다.** 포커스와 함께 면이나 글자가
  바뀌는 자리(메뉴 항목 · 입력)는 그 변화가 남고, 버튼 · 링크 · 체크박스 · 슬라이더처럼 포커스만
  받는 자리는 평상 렌더링에서 키보드 위치가 보이지 않는다. 소유자가 이 편차를 알고 정한 예외이며
  [Inclusive design](../../foundations/inclusive-design.md) 이 그것을 적는다.
- 브라우저 테스트가 뒤집혔다 — 「키보드에서만 링이 선다」가 「키보드에도 링이 없다, 강제 색에서만 선다」로.
  강제 색은 CDP `Emulation.setEmulatedMedia` 로 실제 미디어 쿼리를 켜서 잰다.
- `figma/components.measured.json` 의 TextField 프레임 폭 328(링 4px 여백)과 결합 칸의 `ringOffset` −3 은
  강제 색 링의 자리로 남는다. Figma 의 TextField 변형도 328 폭을 그대로 갖는다.
- 제품은 LOUIS 핀이 이 커밋에 닿기 전까지 LOUIS 가 그리는 링(text-field 상자 · checkbox 등)을 그대로
  보인다. 제품이 자기 손으로 그리던 링은 제품 저장소의 같은 결정 커밋이 지운다.

## Rollout and verification

1. CSS · React · 토큰 · 문서를 같은 변경 단위로 옮기고 생성물은 `pnpm build` 로만 만든다.
2. `pnpm check` · `pnpm verify` · `pnpm test` 가 초록이어야 한다. 브라우저 테스트가 light · dark 의
   `outline-style: none` 과 강제 색의 `Highlight` 링을 잰다.
3. **Figma(2026-10-06 적용).** 링을 바깥 stroke 로 그리던 Focus 변형 열아홉을 걷었다 — TextField 7 ·
   Slider 6 · SegmentedControlItem 4 · SidebarCta 2. 그 변형을 쓰는 인스턴스는 파일 전체 열세 페이지에서 0 이었다.
   채취 명세(`figma-readback-emit.mjs`)와 parity 계약에서 FocusRing · Focus 옵션 · 두께 2 를 빼고, 네 세트를
   emitter 로 다시 떠 병합한 뒤 `verify-figma-parity` 가 초록이다. SegmentedCodeInput 의 Focus 는 링이 아니라
   제품의 테두리 색과 면이라 그대로 둔다. effect style `elevation/focus-ring` 은 토큰과 함께 deprecated 로 남는다
   (Deprecations 의 제거 조건을 따른다).

## Rollback

`base.css` · `reset.css` 의 두 블록을 지우고 이 커밋의 컴포넌트 · React · 테스트 변경을 되돌리면 링이
돌아온다. 토큰의 `$deprecated` 두 줄을 지우고 `pnpm build` 를 다시 돈다.
