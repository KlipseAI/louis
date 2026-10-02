---
id: decision-coachmark-surface-is-opaque
status: experimental
authority: normative
---

# DS-D-0073 코치마크의 면과 꼬리는 한 불투명 재료다 — `bg-inverse-translucent` → `bg-inverse`

- Status: accepted (소유자 판정 2026-10-01, 제품 첫 사용 안내 2라운드의 시안 3)
- Date: 2026-10-02
- Owners: repository owner, design system maintainer
- Affects: `tooltip`, `governance-figma-sync`, `decision-three-in-one-change`

## Context

[Tooltip](../../components/tooltip.md) 의 `coachmark` layout 은 면을 `color-bg-inverse-translucent`(72%)로 칠했고,
꼬리(`::before`, 변 10 정사각형을 45° 돌린 것)도 같은 반투명 바탕을 따로 칠했다. 제품 첫 사용 안내의 이미지 완성
코치마크 시안을 본 소유자 판정(2026-10-01): 「코치마크가 박스랑 꼬리가 별개여서 저렇게 투명도 먹혀서 따로따로인것처럼
보이는 현상 해결해.」

원인은 두 겹 칠이다. 꼬리 안쪽 절반은 면과 겹치므로 그 자리가 72% 두 번으로 진해진다. 면의 강조색 테두리는 꼬리 밑을
그대로 지나가 비친다. 흐림이 없으니 반투명은 뒤의 그림을 글자 밑으로 끌어들이기만 했다(390 폭에서 코치마크가 이미지
위로 뒤집힐 때 특히 그렇다). 수정 전 계산값은 네 방향, 두 테마 모두 면과 꼬리가 같은 반투명 값이었다.

| 테마 | 면, 꼬리 (수정 전) |
| --- | --- |
| light | `color(srgb 0.090196 0.105882 0.133333 / 0.72)` |
| dark | `color(srgb 0.980392 0.980392 0.980392 / 0.72)` |

캡처는 제품 저장소 `.omc/handoffs/onboarding-guide/checks/louis-coachmark/before-*.png` 에 있다(LOUIS 생성 CSS 만으로
네 방향 두 테마를 그린 탐침).

반투명은 제품에서 온 값이다. 제품이 이 layout 을 물기 전의 원본(제품 `12147e88`)은 면과 꼬리를 같은 72% 로 칠했고,
면에만 흐림을 얹었다.

| 자리 | 원문(제품 `12147e88`) |
| --- | --- |
| 면 | `  "bg-[rgb(var(--gray-900-rgb)/72%)] [backdrop-filter:blur(var(--louis-blur-panel))] text-gray-000",` |
| 꼬리 | `  "before:bg-[rgb(var(--gray-900-rgb)/72%)] before:[transform:rotate(45deg)]",` |

명령은 `git -C <제품 저장소> grep -n "gray-900-rgb)/72%" 12147e88` 이다. 결과 열여섯 줄 중
`CanvasOnboardingHints.tsx` 의 두 줄이 위 표다. 그 파일은 제품 근거 잠금(`migration/product-evidence.lock.json`) 밖이라
여기서 좌표로 인용하지 않는다 — 잠금은 앵커 재고정 때 다시 뽑는다. LOUIS 는 그 반투명을 받으면서 흐림은 받지 않았다(layout 축이 자기 effect 를 가질 수 없다, Tooltip 규범의
「제품과 갈리는 값」).

## Decision

`coachmark` 의 면과 꼬리를 **같은 불투명 `color-bg-inverse`** 로 칠한다. base tooltip 과 같은 재료다.

위치 지정된 `::before` 는 부모의 배경과 테두리 위에 그려진다. 꼬리가 불투명하면 안쪽 절반이 면의 테두리를 덮고, 꼬리의
바깥 두 변의 테두리가 면의 테두리와 이어져 한 덩어리의 외곽선이 된다. 두 겹 칠도 사라진다 — 위에 놓인 것이 아래를
완전히 가린다.

둘 중 하나만 바뀌어도 이음새가 돌아오므로 브라우저 테스트가 네 방향(`data-side` top, right, bottom, left), 두 테마에서
면이 `color-bg-inverse` 이고 알파가 1 이며 꼬리가 면과 같은 값이고 꼬리의 테두리 변이 면의 테두리와 같은 색인지를 잰다
(`packages/react/test/surface-states.browser.test.tsx`). 측정 기록 `figma/components.measured.json` 에
`tooltip.states.coachmark` 를 더해 같은 파일의 states 대조가 실제 컴포넌트에서도 면을 잰다.

## Alternatives

| 대안 | 버린 이유 |
| --- | --- |
| 반투명을 두고 꼬리의 안쪽 절반을 `clip-path` 로 잘라 겹침을 없앤다 | 겹침은 사라지지만 면의 테두리가 꼬리 뿌리를 그대로 가로지른다. 테두리에 구멍을 내려면 면에 `mask` 를 걸어야 하고, 그 구멍의 자리는 `data-side` 마다 달라 규칙이 넷 더 생긴다. 흐림이 없는 반투명이 글자 가독성을 떨어뜨리는 문제는 그대로 남는다 |
| 면과 꼬리를 SVG 하나(또는 `border-image`)로 그린다 | 한 도형이라 이음새는 없지만 반경 12, 강조색 테두리, 네 방향을 도형 생성으로 옮겨야 한다. CSS 레시피 하나로 소비되는 지금 구조(제품이 클래스만 문다)를 깬다 |
| 반투명 면에 제품처럼 흐림을 얹는다 | 꼬리는 따로 칠하는 도형이라 같은 흐림을 받지 못한다. 면은 흐리고 꼬리는 맑아 오히려 더 갈라져 보인다. layout 축이 자기 effect 를 갖지 못하는 parity 계약도 그대로다 |
| 알파만 올린다(88% 등) | 두 겹 칠과 비치는 테두리가 약해질 뿐 사라지지 않는다 |

## Consequences

- **라이트에서 면이 더 어두워진다.** 반투명일 때 밝은 바닥 위의 합성은 `#171b22` 72% 라 회색에 가까웠고, 이제 base
  tooltip 과 같은 `#2b2f36` 이다. 다크는 `#fafafa` 72% 합성에서 `#c1c3c6` 으로, 차이가 작다.
- **흐림은 계속 없다.** 면이 불투명이라 흐림이 비출 것이 없어 편차가 아니라 해당 없음이 된다.
- **Figma 꼬리의 테두리 변이 틀려 있었다.** 네 변형 모두 꼬리의 테두리가 안쪽 변에 붙어 있었다(Figma 의 회전은 반시계
  방향이라 CSS 의 `rotate: 45deg` 와 변이 갈린다). 반투명일 때는 안쪽 변이 면 안에 비쳐 묻혔고, 불투명이 되자 드러났다.
  바깥 두 변으로 옮겼다(아래 표).
- **Figma 본문 글자의 캐시 색이 검정이었다.** 네 변형의 `Content` 는 `color/fg-on-inverse` 72% 에 묶여 있었지만 저장된
  색이 `#000000` 이라 화면에 어두운 글자로 그려졌다. 같은 변수로 다시 묶어 갱신했다. 값과 바인딩은 그대로다.
- **되읽기 명세는 칠 색을 담지 않는다.** `figma-readback-emit.mjs` 의 `Tooltip` 명세는 기하, 테두리 두께, effect,
  바인딩 개수만 담으므로 이번 변경 뒤에 다시 뜬 `components.Tooltip` 은 이전과 바이트 단위로 같았다. Figma 의 면 색은
  parity 게이트가 아니라 이 결정의 되읽기 기록(아래)이 증거다.
- **제품은 핀을 올릴 때 받는다.** 소비처는 `CanvasOnboardingHints.tsx` 의 첫 노드 안내와 다음 단계 안내 둘이며 둘 다
  클래스만 물기 때문에 코드 변경 없이 바뀐다.

## 세 곳 ([DS-D-0028](DS-D-0028-three-in-one-change.md))

| 자리 | 바꾼 것 |
| --- | --- |
| 코드 | `packages/css/src/component/tooltip.css` 의 coachmark 면과 `::before` 꼬리 배경. 생성 CSS 둘은 `build:css` 로. 브라우저 테스트 둘(states 표의 coachmark, 네 방향 두 테마의 한 재료)과 측정 기록의 `states.coachmark` |
| Figma | `Tooltip` 세트(`674:12041`)의 coachmark 네 변형(`1352:16005`, `1352:16010`, `1352:16015`, `1352:16020`)과 각 `Tail`(`1352:16025`~`16028`)의 칠을 `color/bg-inverse-translucent` 72% → `color/bg-inverse` 100% 로 옮겼다. 꼬리의 테두리 변을 바깥 두 변으로 바로잡았다(top: 아래 두 변, bottom: 위 두 변, right: 왼쪽 두 변, left: 오른쪽 두 변). 본문 글자 칠을 다시 묶었다. `--components --only Tooltip` 으로 다시 떠 `--merge` 하고 `snapshot.json` 을 다시 만들었다 |
| 문서 | 이 결정, [Tooltip](../../components/tooltip.md) Specification, Known deviations, Acceptance tests, changelog, [Updates](../../updates/README.md) (173) |

## Rollout and verification

- 수정 뒤 계산값(같은 탐침): 네 방향 모두 면과 꼬리가 light `color(srgb 0.168627 0.184314 0.211765)`,
  dark `color(srgb 0.756863 0.764706 0.776471)` 로 같고 알파가 없다. 확대 캡처에서 면의 테두리가 꼬리 뿌리에서 끊기고
  꼬리의 바깥 두 변으로 이어진다(`after-*-zoom.png`, `after-zoom-sheet.png`).
- 지키는 테스트가 실제로 거는지: 생성 CSS 의 꼬리만 반투명으로 되돌리면 `light/bottom 꼬리 = 면` 에서 두 motion
  context 모두 실패한다.
- Figma 되읽기: 여덟 노드의 칠이 `color/bg-inverse`, 불투명도 1 이다. 네 변형의 확대 캡처와 Dark 모드 인스턴스 캡처에서
  이음새가 없다(`figma-after-*.png`).

## Rollback

`tooltip.css` 의 두 `background` 를 `var(--louis-color-bg-inverse-translucent)` 로 되돌리고 테스트 둘과 `states.coachmark`
를 지운다. Figma 는 여덟 노드의 칠을 `color/bg-inverse-translucent` 72% 로 되돌린다. 꼬리의 테두리 변과 본문 글자 칠은
되돌리지 않는다 — 둘은 이 결정과 무관하게 틀려 있던 것이다.
