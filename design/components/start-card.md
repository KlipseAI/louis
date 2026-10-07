---
id: start-card
status: experimental
authority: normative
summary: 빈 캔버스에서 첫 노드를 만드는 생성 카드입니다. 미디어가 면을 채우고 위쪽 점진 블러 위에 이름이 얹힙니다.
---

# Start Card

빈 캔버스에서 **첫 노드를 만드는 생성 카드**(「이미지 생성」 · 「비디오 생성」)다. 미디어가 카드 면을 채우고,
위쪽에 점진 블러 띠가 걸리고, 그 위에 이름 한 줄이 얹힌다. `<button>` 이고 호버에서 안의 미디어가 움직인다.

**별도 부품으로 세웠다 — 소유자 결정(2026-10-07).** [Media Card](./media-card.md) 의 변형으로 접지 않았다.
근거는 셋이다. ① Media Card 는 `<article>` 이고 **상태가 없는 표시용**인데 이 카드는 `<button>` 이고 호버 ·
키보드 상태를 갖는다. ② Media Card 는 정사각 + **아래** 정보 띠인데 이 카드는 320/403 + **위쪽** 이름이라 기하가
다르다. ③ 변형 축이 하나도 겹치지 않아 `position` 축을 열면 한 컴포넌트가 두 가지 다른 역할을 prop 으로 숨긴다.
재료만 공유한다 — `base.css` 의 `--louis-progressive-blur` · `--louis-progressive-blur-mask-block-start`.

**LOUIS 는 상자를 소유하고 안은 제품 콘텐츠다.** 비율 · 반경 · 면 · 헤어라인 · 위쪽 블러 띠 · 이름 자리 · 슬롯의
호버 박자는 이 레시피가 갖는다. 슬롯 안의 미디어 — 스틸 격자의 흐름, 영상 재생, 프레임 띠와 진행선 — 는 제품이
칠하고 움직인다. 이 문서는 그 안을 규정하지 않는다.

출처는 2026-10-07 제품 `chore/landing-dead-walkthrough` 의 `CanvasEmptyState.tsx` 다(`CARD`
`CanvasEmptyState.tsx@d564ed435:138` · `CARD_BLUR` `CanvasEmptyState.tsx@d564ed435:188` · `CARD_LABEL`
`CanvasEmptyState.tsx@d564ed435:198`, 도입 커밋 `a31f808c5`). 작업 브랜치 좌표라 `<파일>@<커밋>:<줄>` 형식으로만 적는다.

## Availability

| Surface | 상태 | 근거 |
| --- | --- | --- |
| Web | `not-ready` | CSS recipe 만 있다(`packages/css/src/component/start-card.css` — `.louis-start-card`). React 표면 · 실브라우저 acceptance test · 제품 소비 증거 없음 |
| Figma | `not-ready` | **Figma 변형은 아직 없다.** component set 도 되읽기 계약도 없다 |
| Documentation | `partial` | 이 문서. 제품이 이 클래스를 물고 acceptance test 가 서면 `done` |
| Maturity | `experimental` | 레시피와 문서가 처음 선다. 승격 조건은 되재기(Acceptance tests)가 서고 제품이 이 클래스를 무는 것이다 |

## When to use

- **빈 캔버스에서 첫 노드를 만드는 큰 카드 한두 장.** 카드 하나가 노드 종류 하나를 뜻하고, 누르면 그 종류의 노드를
  추가한다. 안의 미디어가 «이 종류가 무엇을 만드는지»를 보여 준다.
- 쓰지 않는 자리:
  - **상태 없는 미디어 표시** — 눌리지 않는 사진 카드는 [Media Card](./media-card.md) 다.
  - **프로젝트 목록의 카드** — [Project Card](./project-card.md) 다.
  - **선택지를 고르는 카드** — [Choice Card](./choice-card.md) 다. 이 카드는 선택 상태가 없다.

## Anatomy

1. **Card** — `<button type="button" class="louis-start-card">`. 면 · 헤어라인 · 반경을 갖는다.
2. **Media** — `<span class="louis-start-card__media" aria-hidden="true">`. 카드를 채우는 슬롯. 안은 제품 콘텐츠다.
3. **Blur** — `<span class="louis-start-card__blur" aria-hidden="true">`. 위쪽 점진 블러 띠. 내용이 없다.
4. **Label** — `<span class="louis-start-card__label">`. 이름 한 줄. 카드의 접근성 이름이다.

**마크업은 이 순서다.** 숫자 z-index 를 쓰지 않으므로 칠하는 순서가 트리 순서다 — 미디어 → 블러 → 이름. 헤어라인은 `::after`
가 맨 위에서 칠한다(미디어가 카드 `box-shadow` 를 덮기 때문이다).

## Properties

prop 이 없다. 클래스 넷, 데이터 속성 하나, 공개 사용자 정의 속성 둘이다.

| 이름 | 종류 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `.louis-start-card` | 클래스 | — | 카드 상자 |
| `.louis-start-card__media` · `__blur` · `__label` | 클래스 | — | 슬롯 · 블러 띠 · 이름 |
| `data-media-motion="zoom"` | 속성(`__media`) | 없음 | 호버에서 슬롯이 `scale(1.04)` 로 확대된다(제품 영상). 없으면 슬롯은 움직이지 않는다 |
| `--louis-start-card-drift-duration` | 공개 사용자 정의 속성 | `1600ms` | 호버 이동의 시간. 슬롯 안의 콘텐츠가 자기 움직임에 읽는다. reduced-motion 에서 `motion-reduced` 로 바뀐다 |
| `--louis-start-card-drift-easing` | 공개 사용자 정의 속성 | `motion-overlay-enter` 의 timing function | 호버 이동의 곡선(제품: 앱 표준 패널 곡선) |

## States

| 상태 | 표현 |
| --- | --- |
| 쉼 | 면 + 미디어의 쉬는 장면 + 위쪽 블러 + 이름 |
| 호버 | `@media (hover: hover)` 안에서만. 슬롯 안의 콘텐츠가 움직인다(`data-media-motion="zoom"` 이면 슬롯이 확대된다). 카드 면 · 이름은 바뀌지 않는다 |
| 포커스 | **평상 렌더링에서 그리지 않는다**([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md) — 포커스 표현은 `base.css` 의 한 규칙이 소유한다). forced-colors 에서만 `Highlight` 링 |
| 눌림 · 비활성 | 정의하지 않는다 — 제품에 없다 |
| reduced-motion | 호버 전환이 `motion-reduced`(0ms)다 — 호버에서 그 자리로 바로 간다. 영상 재생은 제품이 막는다 |
| forced-colors | 면 `Canvas` · 글자 `CanvasText` · 헤어라인은 시스템 색 실선 테두리 |

## Interaction and responsive behavior

- **호버 가드.** 모든 호버 규칙은 `@media (hover: hover)` 안에 있다([DS-D-0077](../governance/decisions/DS-D-0077-hover-only-on-hover-devices.md)). 호버가 없는 기기(터치)에서는
  쉬는 장면 그대로다. 슬롯 안의 제품 콘텐츠가 호버 움직임을 달 때도 **자기 규칙을 같은 가드 안에 둔다.**
- **반경이 조상 폭을 따라간다.** 기본은 `radius-overlay`(16)이고 **조상 컨테이너가 600px 이상이면** `radius-card-lg`(20)다. 제품의
  `@min-[600px]:rounded-card-lg` 는 이름 없는 컨테이너 질의이고 자기 자신은 자기 컨테이너가 아니라서 가장 가까운 조상
  (빈 캔버스의 띠 상자)을 잰다. 카드의 폭이 아니다.
- **카드는 자기 폭의 컨테이너다**(`inline-size`). 블러 띠 높이와 이름 크기가 카드 폭에서 잰다 — 폭은 칸이 정한다.
- 폭이 정해진 칸 안에서 `inline-size: 100%` 로 채우고 높이는 비율(320/403)이 정한다.

## Content

- 이름은 짧은 명사구 한 줄 — 「이미지 생성」 · 「비디오 생성」. 말줄임 처리를 하지 않는다 — 호출부가 칸 폭 안에 들어가는 문구를 낸다.
- 슬롯 안 미디어는 **장식**이다(`aria-hidden="true"`). 이름이 카드의 정체를 이미 말한다.

## Accessibility

- 카드는 `<button type="button">` 이다. 접근성 이름은 이름 한 줄(`__label`)이다.
- 미디어 · 블러 띠는 `aria-hidden="true"` 이고 포인터를 받지 않는 장식이다.
- **이름의 대비는 측정하지 않았다.** 이름은 `media-foreground-dark`(#fafafa)를 위쪽 점진 블러 위에 놓고 바탕은 미디어다. 미디어마다
  다르므로 SC 1.4.3 을 이 레시피만으로 판정할 수 없다 — 결손으로 적어 둔다(Media Card 의 대비와 같은 사정). 블러가 편차를 줄이는
  장치다.
- **호버로만 드러나는 정보가 없다.** 호버는 미디어를 움직일 뿐이고 이름 · 역할은 쉴 때도 다 있다. 터치에서도 같은 정보가 보인다.
- 포커스 링은 평상 렌더링에서 그리지 않는다(DS-D-0074). forced-colors 에서만 `Highlight` 링이 선다.
- reduced-motion 에서 호버 전환이 사라진다. 영상은 제품이 재생하지 않는다.

## Specification

| 항목 | 값 | 토큰 · 근거 |
| --- | --- | --- |
| 비율 | 320 / 403 | 제품 값. 토큰 없음 |
| 폭 | 100% | 칸이 정한다 |
| 반경 | 16, 조상 컨테이너 600 이상에서 20 | `radius-overlay` · `radius-card-lg` |
| 면 | static black | `color-media-stage-surface`. 제품은 `palette-gray-950`(#0d1118)이었다 — Known deviations 1 |
| 헤어라인 | inset | `hairline-inset`, `::after`(미디어 위) |
| 블러 띠 | 위 가장자리 · 높이 카드 폭의 26% · 흐림 `blur-surface`(10) · 마스크 위→아래로 걷힘 | `--louis-progressive-blur` · `--louis-progressive-blur-mask-block-start`. 띠에 바탕색 · 틴트 · 베일을 깔지 않는다 |
| 이름 위치 | 왼쪽 위 | |
| 이름 여백 | 카드 폭 240 이상 18 · 미만 14 | 제품 리터럴(`p-9` · `p-7`, 격자 2px). 토큰 계단 최대 `space-control-lg`(16) 에 없다 |
| 이름 글자 | 240 이상 body-md-semibold(16) · 미만 body-sm-semibold(14) | `typography/body-md-semibold` · `typography/body-sm-semibold` |
| 이름 색 | `media-foreground-dark` | 테마를 따르지 않는다 |
| 호버 이동 | 1600ms · 앱 표준 패널 곡선 | 시간은 motion 토큰에 없는 제품 리터럴, 곡선은 `motion-overlay-enter` |
| 영상 확대 | `scale(1.04)` | 제품 `VIDEO_MEDIA`, `CanvasEmptyState.tsx@d564ed435:170` |

## Implementation

- Web source: `packages/css/src/component/start-card.css` — `.louis-start-card` · `__media` · `__blur` · `__label`. React 표면 없음.
- Public import: 없음. 소비처가 클래스를 직접 쓴다.
- Figma component: 없다. **Figma 변형은 아직 없다.**
- 제품 정본: `CanvasEmptyState.tsx@d564ed435:138`(`CARD`) · `CanvasEmptyState.tsx@d564ed435:188`(`CARD_BLUR`) ·
  `CanvasEmptyState.tsx@d564ed435:198`(`CARD_LABEL`) · `CanvasEmptyState.tsx@d564ed435:255`(`StartCard` — 영상 재생을
  마우스 포인터에서만 시작하고 떠나면 첫 장면으로 되돌리는 것은 제품 코드다).
- Tests/visual evidence: **없다.** 아래 Acceptance tests 는 선 뒤에 붙일 목록이다.

**슬롯 안은 제품 콘텐츠다.** 이미지 카드의 기울어진 세 줄 스틸 격자, 비디오 카드의 장면 · 프레임 띠 · 진행선과 그 흐름은 LOUIS 가
소유하지 않는다. 소유자가 운영 DB 의 큐레이션 생성물로 정한 소재(스틸 아홉 장 · 4초 클립)도 제품 몫이다. 레시피는 그것이 놓일
슬롯과 호버 박자(`--louis-start-card-drift-*`)만 낸다.

## Known deviations

1. **면이 제품의 `palette-gray-950` 이 아니라 `color-media-stage-surface`(검정)다.** 소유자 결정(2026-10-07)으로 토큰이 생겨 그것을
   쓴다. 제품은 `#0d1118`(청회색을 띤 검정)이었고 이 면은 미디어가 올라오기 전, 또는 미디어가 비는 틈에만 보인다. 값 차이는 육안으로
   작다.
2. **`color-media-foreground-dark-soft`(72%)를 쓰지 않았다.** 이 카드의 글자는 이름 하나이고 그것은 불투명한 `media-foreground-dark`
   다. 보조 글자가 생기면 그 토큰을 쓴다.
3. **호버 이동 시간 1600ms 가 motion 토큰에 없다.** 제품 리터럴을 공개 사용자 정의 속성 하나로 격리했다. 곡선은 토큰이다.
4. **이름 여백 14 · 18 이 토큰 계단에 없다.** 제품 격자(`p-7` · `p-9`)의 값을 리터럴로 옮겼다.
5. **슬롯 안 콘텐츠의 호버 움직임은 레시피 밖이다.** 확대(`data-media-motion="zoom"`)만 레시피가 갖고, 이미지 카드의 줄마다 엇갈려 흐르는
   이동과 영상 띠 · 진행선은 제품 CSS 가 `.louis-start-card:hover` 를 읽어 단다.
6. **Figma 변형은 아직 없다.**

## Acceptance tests

아직 없다. 서면 다음을 되잰다.

1. 카드가 320/403 비율이고 폭을 채운다. 조상 컨테이너 600 미만에서 반경 16, 이상에서 20 이다.
2. 면이 두 테마에서 같은 검정이다(`color-media-stage-surface`).
3. 블러 띠가 위 가장자리에 붙고 높이가 카드 폭의 26% 이며 아래로 걷힌다. 바탕색 · 틴트가 없다.
4. 이름이 왼쪽 위에 서고 카드 폭 240 기준으로 여백 · 글자 크기가 갈린다. 블러가 이름 글자를 흐리지 않는다(iOS 포함).
5. 헤어라인이 미디어 **위**에 그려진다.
6. **호버 규칙이 전부 `@media (hover: hover)` 안에 있다** — 호버가 없는 기기에서 `data-media-motion="zoom"` 슬롯이 확대되지 않는다.
7. `data-media-motion="zoom"` 슬롯이 호버에서 1.04 로 확대된다. reduced-motion 에서 전환 시간이 0 이다.
8. forced-colors 에서 헤어라인이 테두리로 서고 포커스 시 `Highlight` 링이 선다. 평상 렌더링에는 포커스 링이 없다.
9. 키보드 Enter · Space 로 눌린다. 접근성 이름이 이름 한 줄이다.
10. 자동 접근성 검사에 위반이 없다.

## Migration and changelog

새로 선 컴포넌트다. 이전 LOUIS API 가 없다. 제품의 `CanvasEmptyState.tsx` `CARD` · `CARD_BLUR` · `CARD_LABEL` 임의값 유틸리티는 이 클래스를
무는 날 정리 대상이 된다. 사용자 영향 변경은 [Updates](../updates/README.md) 에 적는다.

## 다음

- [x] LOUIS CSS recipe 작성 (2026-10-07)
- [ ] 실브라우저 acceptance test
- [ ] 제품을 그 recipe 로 이관(`CanvasEmptyState.tsx` 의 카드 둘)
- [ ] Figma component set
