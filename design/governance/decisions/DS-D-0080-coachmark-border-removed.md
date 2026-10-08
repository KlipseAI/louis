---
id: decision-coachmark-border-removed
status: experimental
authority: normative
---

# DS-D-0080 코치마크의 강조색 테두리를 걷는다 — 폭 1px 은 투명으로 남긴다

- Status: accepted (소유자 판정 2026-10-08)
- Date: 2026-10-08
- Owners: repository owner, design system maintainer
- Affects: `tooltip`, `governance-figma-sync`, `decision-three-in-one-change`

## Context

[Tooltip](../../components/tooltip.md) 의 `coachmark` layout 은 면과 꼬리(`::before`) 두 변에 1px 강조색 테두리
(`accent-primary` 56%)를 둘렀다. 규범은 그 테두리를 「여기를 보라」를 말하는 경계로 적었다. 제품 첫 사용 안내의
코치마크를 본 소유자 판정(2026-10-08): 「테두리 파랑 그거 빼라」.

수정 전 면 테두리의 계산값은 light 에서 `color(srgb 0 0.533333 1 / 0.56)` 이었다(아래 되돌림 확인에서 잰 값). 꼬리의
두 변도 같은 선언이었다. `accent-primary` 는 모드를 타지 않아 dark 도 같은 색이다.

제품은 LOUIS 핀을 올리기 전까지 같은 자리를 클래스로 덮었다. 면과 `::before` 의 `border-color` 를 `transparent` 로,
강제 색에서는 `currentColor` 로 되돌린다. 제품 커밋 `93da9e7d1`(`feat/canvas-help-redesign` 브랜치)의 `CanvasOnboardingHints.tsx` 이고, 명령은
`git -C <제품 저장소> show 93da9e7d1` 이다. 그 파일은 제품 근거 잠금(`migration/product-evidence.lock.json`) 밖이라 여기서 좌표로 인용하지 않는다.

## Decision

`coachmark` 의 면과 꼬리의 테두리 **색을 투명으로** 바꾼다. **폭 1px 은 남긴다.**

- 폭을 걷으면 상자가 64 → 62, 320 은 그대로지만 내용 폭이 2px 늘고, 꼬리의 자리가 1px 옮겨 간다. 제품의 임시 덮기가
  색만 바꾸고 폭을 남겼으므로, 폭을 남겨야 핀 상향이 화면을 1px 도 움직이지 않는다.
- 면과 꼬리의 배경은 `border-box` 까지 칠해지므로 투명한 1px 띠에는 같은 `color-bg-inverse` 가 보인다. 상자 크기와
  모서리는 그대로이고 경계선만 사라진다.
- 강제 색(`forced-colors: active`)에서는 면과 꼬리의 테두리를 `currentColor` 로 되살린다. 면이 시스템 색으로
  치환되면 경계 없는 상자는 바탕과 구분되지 않는다. 꼬리의 방향 규칙(`data-side`)이 특이도가 더 높아 그 선택자도
  강제 색 블록에 함께 적는다.
- 대상을 가리키는 일은 꼬리가 맡는다. 헤어라인(`hairline-inset`)으로 바꾸지 않는다. 걷은 경계를 다른 이름으로
  되살리는 것이 된다.

브라우저 테스트(`packages/react/test/surface-states.browser.test.tsx`)가 네 방향, 두 테마에서 면의 네 변과 꼬리의 두
변이 투명이고 폭이 1px 인지, 강제 색에서 currentColor 로 되살아나는지를 잰다. 측정 기록
`figma/components.measured.json` 의 `tooltip.states.coachmark.Default` 에 `border: null`(투명)을 적어 states 대조도
테두리를 잰다.

## Alternatives

| 대안 | 버린 이유 |
| --- | --- |
| 테두리를 통째로 지운다(`border: 0`) | 상자가 2px 줄고 꼬리가 1px 옮겨 간다. 제품의 임시 덮기와 기하가 갈려 핀 상향이 화면을 움직인다. 꼬리의 `::before` 위치 계산(표면 밖 6)도 다시 맞춰야 한다 |
| generic 헤어라인으로 바꾼다 | 소유자가 걷으라고 한 경계를 다른 이름으로 되살린다. 판정은 경계를 두지 않는 것이다 |
| 강조색 알파만 낮춘다 | 파랑이 옅어질 뿐 남는다 |

## Consequences

- **경계선이 사라진다.** 라이트에서는 어두운 면이 밝은 바닥 위에 서고, 다크에서는 밝은 면이 어두운 바닥 위에 서서
  면의 명도 차이와 그림자(`elevation-tooltip`)가 경계를 맡는다.
- **기하는 그대로다.** 높이 64, 폭 320, 꼬리 자리는 변하지 않는다. `components.measured.json` 의
  `tooltip.sizes.coachmark.borderWidth` 는 1 로 남고 그 사유만 「폭만 남은 투명 테두리」로 고쳤다.
- **Figma 는 stroke 없이 같은 자리를 갖는다.** 코치마크 네 변형은 안쪽 여백이 이미 13(12 + 테두리 1)이었으므로
  stroke 만 걷으면 상자가 그대로다. parity 계약의 `strokes.self` 는 `[0.5, 1]` 에서 base 헤어라인 `0.5` 하나로 좁혔다.
  1 을 남겨 두면 걷은 테두리가 Figma 에 되살아나도 게이트가 초록이다. 여백 13 의 1 은 geometry 의
  「패딩 + borderWidth」가 계속 대조한다.
- **제품은 핀을 올릴 때 받는다.** 임시 덮기 넷을 그때 지운다. 소비처는 `CanvasOnboardingHints.tsx` 의 첫 노드 안내와
  다음 단계 안내이며 둘 다 클래스만 문다.

## 세 곳 ([DS-D-0028](DS-D-0028-three-in-one-change.md))

| 자리 | 바꾼 것 |
| --- | --- |
| 코드 | `packages/css/src/component/tooltip.css` 의 coachmark 면과 `::before` 꼬리(기본과 `data-side` 세 방향)의 테두리 색을 `transparent` 로, 강제 색 블록에 `data-side` 선택자를 더했다. 생성 CSS 둘은 `build:css` 로. 브라우저 테스트 셋(states 표의 coachmark 테두리, 네 방향 두 테마의 투명 테두리와 폭, 강제 색)과 측정 기록의 `states.coachmark.Default.border` |
| Figma | `Tooltip` 세트(`674:12041`)의 coachmark 네 변형(`1352:16005`, `1352:16010`, `1352:16015`, `1352:16020`)과 각 `Tail`(`1352:16025`~`16028`)의 stroke 를 걷었다. 두께 값과 안쪽 여백 13 은 그대로다. 세트 설명문의 「강조색 1px 테두리」 문장을 고쳤다. `--components --only Tooltip` 으로 다시 떠 `--merge` 하고 `snapshot.json` 을 다시 만들었다 |
| 문서 | 이 결정, [Tooltip](../../components/tooltip.md) Hierarchy와 variants, Specification, 제품과 갈리는 값, Known deviations, Acceptance tests, changelog, [Updates](../../updates/README.md) (220) |

## Rollout and verification

- 수정 뒤 계산값: 네 방향, 두 테마 모두 면의 네 변과 꼬리의 두 변이 `rgba(0, 0, 0, 0)` 이고 폭이 `1px` 이다. 강제 색을
  흉내 내면(CDP `Emulation.setEmulatedMedia`) 면과 꼬리 변이 각자의 `color` 와 같은 불투명 색이다.
- 지키는 테스트가 실제로 거는지: 생성 CSS 의 면 테두리만 강조색으로 되돌리면 states 표와 네 방향 테스트가 두 motion
  context 모두에서 실패한다. `top` 꼬리의 두 변 폭만 0 으로 걷어도 두 motion context 모두에서 실패한다.
- 강제 색 테스트의 한계: Chromium 은 강제 색 블록이 없어도 투명 테두리를 시스템 색으로 그린다(블록을 지우고 돌려
  확인했다). 그래서 그 테스트는 블록이 아니라 「강제 색에서 경계가 보인다」는 결과를 지킨다.
- Figma 되읽기: `binding.boundStrokes` 12 → 4(base 네 변형의 헤어라인만 남는다), `strokes.self` 가 `0.5|INSIDE`
  하나, `geometry.coachmark.strokeWeight` 가 빈 목록이다. coachmark 의 높이 64, 폭 320, 여백 13, 꼬리 10 은 그대로다.
  bottom 변형 확대 캡처에서 경계선 없이 면과 꼬리가 한 덩어리다.
- **되읽기의 base 기하는 이 변경 밖이라 옛 값으로 두었다.** 같은 채취에서 base 네 변형이 폭 61, 여백 4/8 로
  돌아왔다(되읽기는 62, 4.5/8.5). 라이브 Figma 가 다른 작업(아직 `main` 에 없는 Tooltip base 여백 정정과 parity 의
  `{ bySize }` 규칙)을 먼저 받은 결과라, 그 계약 변경 없이 값만 들이면 parity 가 base 에서 실패한다. 그 다섯 줄은
  그 작업의 커밋이 되읽기를 다시 뜰 때 들어온다. 이 결정이 바꾼 stroke 축의 값만 병합했다.

## Rollback

`tooltip.css` 의 면과 꼬리 네 규칙의 `transparent` 를 `color-mix(in srgb, var(--louis-color-accent-primary) 56%, transparent)`
로 되돌리고, 테스트의 투명 단언과 `states.coachmark.Default.border` 를 지운다. Figma 는 여덟 노드에 stroke 를 다시
얹는다(면은 네 변 1px INSIDE, 꼬리는 바깥 두 변 1px). parity 계약의 `strokes.self` 를 `[0.5, 1]` 과 사유로 되돌린다.
