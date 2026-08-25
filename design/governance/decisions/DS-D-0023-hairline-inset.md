---
id: decision-hairline-inset
status: experimental
authority: normative
---

# DS-D-0023 일반 0.5px stroke는 CSS border가 아니라 inset 헤어라인이다

- Status: proposed
- Date: 2026-08-24
- Owners: repository owner, design system maintainer
- Affects: `color-stroke-hairline`(신규 semantic), `color-static-black-alpha-10`(신규 primitive),
  `shadow-menu-light/dark`, `packages/css/src/base.css`, 컴포넌트 CSS 10종(app-shell · button ·
  icon-button · checkbox · dialog · menu-popover · project-card · segmented-control · text-field ·
  tooltip), 브라우저 테스트 5종, Figma parity(segmented-control · menu panel), 인계서 (2b) 컨트롤
  테두리 정본

## Context

제품 저장소는 `5103ffeb`에서 제각각이던 0.5px stroke를 하나의 recipe로 통일했다 — CSS `border`나
바깥 spread shadow가 아니라 `inset 0 0 0 0.5px <헤어라인 색>` 한 겹이다. 색은 라이트에서 black 10%,
다크에서 Klipse palette white(`#fafafa`) 10%다. 제품 Chromium 계산값을 실측했다.

| 테마 | 계산된 헤어라인 색 |
| --- | --- |
| light | `rgba(0, 0, 0, 0.1)` |
| dark | `rgba(250, 250, 250, 0.1)` |

KDS source는 그때까지 컴포넌트마다 다른 방식이었다 — Button/IconButton/Checkbox/Dialog/TextField/
Tooltip/ProjectCard는 CSS `border`, SegmentedControl은 바깥 spread box-shadow, Menu 패널은
`shadow-menu-*` 토큰에 묶인 **바깥 0.5px 프레임**을 썼고, border 색도 `color-stroke-control` ·
`-default` · `-strong` · `-subtle` · `-tooltip`로 갈렸다. 이 상태로 두면 KDS를 직접 보는 다음 구현자가
낡은 방식을 다시 쓴다.

이 결정은 인계서의 **열려 있던 (2b) 컨트롤 테두리 정본** 판정을 함께 닫는다. 선택하지 않은 체크박스는
테두리가 어포던스의 전부라 WCAG 2.2 SC 1.4.11(비텍스트 대비 3:1)이 그 선에 걸리는데, 상자 면 대비
실측이 `control` 1.27/1.63 · `default` 1.38/2.93 · `strong` 2.52/4.61(라이트/다크)로 **세 토큰 중 어느
것도 라이트에서 3:1을 넘지 못했다.** "셋 중 하나가 틀렸다"가 아니라 셋 다 그 자리에는 모자란다는 것이
답이었고, 새 값이 필요해 owner 판정으로 남아 있었다.

## Decision

**일반 0.5px stroke의 Web 표현은 단일 semantic 색을 참조하는 inset box-shadow recipe다.**

1. **신규 semantic `color-stroke-hairline`.** light → `{primitive.color.black-alpha.10}`,
   dark → `{primitive.color.paper-alpha.10}`. 실측값이 순수 black 10%(`rgba(0,0,0,0.1)`)이므로
   `ink-alpha.10`(#171b22, `rgba(23,27,34,0.1)`)이 아니라 순수 black이 필요했고, black-alpha 계열에
   없던 `.10` 단계를 primitive로 추가했다(`color-static-black-alpha-10`). 기존
   `color-stroke-control/default/strong/subtle/tooltip`은 다른 의미를 가지므로 그대로 두고, 장식용
   헤어라인 role을 별도로 세운다.

2. **단일 CSS recipe.** `packages/css/src/base.css`가 `:root`에 한 번 선언한다.
   - `--kds-hairline-inset` — 사방 stroke
   - `--kds-hairline-inset-block-start` / `--kds-hairline-inset-block-end` — 한 면 divider
   두께는 `border-width-hairline`(0.5px), 색은 `color-stroke-hairline`을 참조한다. 컴포넌트마다 shadow
   문자열을 복사하지 않는다.

3. **컴포넌트는 recipe를 소비한다.** base `border`를 지우고 secondary Button/IconButton, TextField 박스,
   Checkbox 상자, ProjectCard, SegmentedControl 트랙, Dialog surface, Tooltip, Menu 패널이 inset을 쓴다.
   elevation이 있는 표면은 `box-shadow: var(--kds-elevation-*), var(--kds-hairline-inset)`처럼 ambient/drop
   shadow 뒤에 조합한다. AppTopBar divider와 Menu separator는 방향성 변형을 쓴다.

4. **Menu elevation과 헤어라인 책임을 분리한다.** `shadow-menu-light/dark`는 이제 ambient drop shadow만
   소유하고, `.kds-popover`가 공용 inset 헤어라인을 마지막에 조합한다. 두 겹 frame이 생기지 않는다.

5. **(2b) 컨트롤 테두리 = 장식용 헤어라인.** 선택하지 않은 Checkbox, 기본/invalid/disabled TextField,
   secondary Button·IconButton은 모두 generic 10% 헤어라인을 쓴다. 상태는 stroke 색이 아니라 면 ·
   메시지 · `aria-invalid` · `role="alert"` · focus ring이 전달한다. 이는 제품 owner가 `5103ffeb`에서 이미
   배포한 계약을 정본으로 승격하는 것이다.

6. **forced-colors.** box-shadow는 강제 색 모드에서 사라지므로 각 컴포넌트가 `border-width-default`
   (1px) 시스템 색 실선/outline으로 경계를 되살린다. 컨트롤은 `currentColor`, divider는 `CanvasText`다.
   SegmentedControl 선택 outline, SelectableListRow outline, ProjectCard focus outline처럼 선택/focus 의미를
   전달하는 outline은 장식 헤어라인과 구분해 그대로 둔다.

7. **Figma representation.** 실측 두께 토큰은 0.5로 유지한다. `border`로 그리던 표면(Button ·
   IconButton · Checkbox · Dialog · TextField · Tooltip · ProjectCard)은 시각적으로 같은 0.5px INSIDE
   stroke로 계속 투영한다. CSS가 바깥 표현에서 inset으로 옮겨간 두 곳만 갱신한다 — SegmentedControl은
   OUTSIDE stroke → INNER_SHADOW, Menu 패널의 두 번째 그림자 layer는 바깥 프레임 → INNER_SHADOW다.

## 무엇을 하지 않기로 했나

- **`ink-alpha.10`을 라이트 헤어라인으로 쓰지 않는다.** 인계서 초안이 제안했지만 그것은 `#171b22`
  10%(`rgba(23,27,34,0.1)`)로 실측된 순수 black과 다르다. "측정하지 않은 값을 그리지 않는다"에 따라
  실측값을 정본으로 삼았다.
- **상태 stroke를 명시적 예외로 남기지 않는다(대안 2).** decorative frame만 통일하고 Checkbox 어포던스
  테두리와 TextField invalid danger 테두리를 예외로 유지하는 길이 있었다. 그러나 제품 `5103ffeb`이 이미
  둘 다 10%로 배포했으므로, 예외를 택하면 제품 override를 함께 되돌려야 두 저장소가 갈리지 않는다.
  byte-parity가 목표이므로 통일(대안 1)을 택하고 접근성 편차를 아래에 기록한다.
- **inset을 DTCG shadow 토큰으로 만들지 않는다.** 현재 shadow schema는 `inset`을 온전히 지원하지
  않는다(DS-D-0010의 inset shadow schema gap). 그래서 헤어라인 recipe는 CSS foundation custom property로
  두고, Menu 토큰은 ambient-only(valid outer shadow)로 남긴다.

## Consequences

- 제품 `5103ffeb`과 같은 계산 스타일을 KDS source가 직접 낸다. 제품은 새 KDS SHA를 소비한 뒤 로컬
  `kds.override`를 지울 수 있다.
- **Checkbox 대비가 더 낮아진다.** 선택하지 않은 상자가 라이트에서 black 10%(≈1.1:1)로, 이전 `strong`
  2.52보다 낮다. 이미 SC 1.4.11 미달이던 known deviation을 더 깊게 만드는 것이며, 제품이 배포한 계약과
  일치시키기 위한 것이다. checkbox.md Known deviations에 수치와 함께 남겼다. axe는 텍스트만 보므로 이
  축을 재지 않는다.
- **TextField invalid는 stroke 색 축을 잃는다.** danger는 메시지(`color-fg-danger`) +
  `aria-invalid` + `role="alert"`가 계속 전달한다. 색 하나로만 알리지 않는 규범은 유지된다.
- **ProjectCard 헤어라인은 inset이라 full-bleed 썸네일이 가장자리를 덮을 수 있다.** 제품 `5103ffeb`과
  같은 결과다. 이전 border는 `overflow: hidden`과 만나 썸네일 위에 그려졌다.
- **Menu separator가 오히려 또렷해진다.** 제품 override는 높이 없는 separator에 방향성 inset만 얹어
  선이 그려지지 않았는데, KDS source는 `block-size: border-width-hairline`을 함께 주어 선이 실제로 렌더된다.
- 제품 evidence lock은 여전히 `a3ed8e0`(제품이 1px border를 쓰던 시점)을 가리킨다. 그 커밋 대비 DS의
  0.5 deviation 기록은 그대로 유효하다. 제품 evidence를 `5103ffeb`로 재기준하는 것은 별도 후속이며, 그때
  여러 `deviates` 기록이 `same`으로 바뀌어 제거된다.

## Rollback

토큰(`color-stroke-hairline` · `color-static-black-alpha-10` · `shadow-menu-*`의 프레임 layer 복원), base.css
recipe, 컴포넌트 CSS 10종, 브라우저 테스트, 규범, Figma parity를 함께 되돌린다. 접근성 규범이 통일
헤어라인 대신 어포던스별 stroke(대안 2)를 요구한다고 판정되면, 이 저장소만 되돌리지 말고 제품
`kds.override`의 Checkbox·TextField 정규화도 함께 되돌려 두 저장소가 다시 갈리지 않게 한다.
