---
id: tabs
status: experimental
authority: normative
summary: 같은 화면 안에서 보이는 뷰를 바꿉니다.
---

# Tabs

같은 화면 안에서 보이는 뷰를 바꾼다.

제품 정본은 analytics 대시보드의 `DASHBOARD_TAB*`이다. 배포본에서 이 「면 없는 텍스트 탭」
레시피가 **일곱 벌** 나온다. 그중 기하까지 같은 것이 넷이고, 좌우 인셋만 뺀 변종이 셋이다.

| 무리 | 벌 | 자리 |
| --- | ---: | --- |
| 높이 28 · 좌우 12 · pill | 4 | `YoutubeAnalyticsScene.tsx:959-967` · `InstagramAnalyticsScene.tsx:409-417` · 아카이브 영상 분석 뷰(`YoutubeVideoAnalyticsView.tsx`) · 랜딩 데모 스냅숏(`StaticAnalyticsDemo.tsx`) |
| 높이 28 · 인셋 0 | 3 | `InquiryClient.tsx:211-227`(폼 카테고리 칩) · 캔버스 가이드 모달(`NodeCanvasGuideModal.tsx`) · 영상 모델 필터 칩(`VideoModelMenu.tsx`) |

**YouTube와 Instagram 두 벌은 빈 줄 하나를 빼면 바이트 단위로 같다.** 아카이브 뷰는 `rounded-full`
대신 `rounded-[999px]`로 적었을 뿐 계산값이 같다.

일곱 벌 **전부**가 합의하는 축은 넷이다 — 높이 28 · 투명한 면 · 테두리 0 · 투명도 48/90/100 을
`200ms ease`로 전환. 그 사양을 그대로 채택했다. 제품 외형 수렴 결정이다.

**segmented-control과 다른 컴포넌트다.** [Segmented Control](segmented-control.md)은 값을 고르는
입력이고(트랙 위에 선택 면이 얹히며 폼 값처럼 다뤄진다), Tabs는 화면을 전환하는 내비게이션이다.
그래서 선택 표시가 **면이 아니라 전경 대비**이고 트랙 배경이 없다. 제품도 그렇게 그리고 있다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | CSS 레시피 `packages/css/src/component/tabs.css`. **React 표면이 없다** — `packages/react/src/`에 `tabs` 디렉터리가 없고 public export도 acceptance test도 없다. 제품 `design` 브랜치 4파일이 이 클래스를 소비한다 |
| Figma         | `partial`      | TabItem(State 4개) · Tabs(조립 COMPONENT). 둘 다 parity 계약(`scripts/verify-figma-parity.mjs`)에 등재돼 있고 게이트가 돈다 — **다만 기하 대조가 없다**. 아래 Known deviations |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 규범이 구현보다 뒤에 선다. React 표면과 parity 기하 대조가 서야 승격한다 |

## When to use

- **같은 화면 안에서 보이는 패널을 바꿀 때** — 대시보드의 개요/영상/시청자, 모달 안의 안내 단계.
- 선택지가 **둘에서 대여섯**이고 라벨이 짧으며 전부 한 줄에 보일 때.
- 이동이 **주소를 바꾸지 않을 때.** 주소가 바뀌면 그것은 탭이 아니라 링크 내비게이션이다.

쓰지 않는 자리.

- **값을 고를 때.** 그것은 [Segmented Control](segmented-control.md)이다. 폼 필드처럼 제출되고
  트랙 위 선택 면으로 현재 값을 말한다.
- **켜고 끌 때.** 그것은 Switch다.
- **목적지로 이동할 때.** 그것은 링크이며 `role="tab"`을 붙이면 스크린 리더가 "탭 3 중 2"라고
  읽고서 화면 전체가 바뀐다.
- **캐러셀 점.** 제품에 `role="tablist"`를 쓴 점 표시가 있는데(앱 홈 배너 · 템플릿 결과 캐러셀)
  이 컴포넌트가 아니다. 라벨이 없고 위치를 나타낸다.

## API

React 컴포넌트가 없다. **CSS 레시피와 마크업 계약만 있다.**

```html
<nav class="louis-tabs" role="tablist" aria-label="분석 보기">
  <button class="louis-tabs__tab" type="button"
          role="tab" id="tab-overview" aria-controls="panel-overview"
          aria-selected="true" tabindex="0">개요</button>
  <button class="louis-tabs__tab" type="button"
          role="tab" id="tab-videos" aria-controls="panel-videos"
          aria-selected="false" tabindex="-1">영상</button>
</nav>

<div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">…</div>
```

**포커스 링은 그리지 않는다**([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)).
`base.css`의 한 규칙이 링을 지우고 강제 색에서만 `Highlight` 링을 세운다 — 호출부가 붙일 클래스가 없다.

## Anatomy

1. **List** — `.louis-tabs`. `role="tablist"`를 받는다. 가로 배치와 탭 사이 간격만 소유한다.
   면·테두리·반경이 없다.
2. **Tab** — `.louis-tabs__tab`. `<button role="tab">`이다. 높이·좌우 인셋·반경·타이포·투명도·
   커서를 소유한다.
3. **Panel** — 이 레시피 **밖**이다. 소비처가 소유한다.

**List가 트랙을 갖지 않는 이유.** 트랙은 「이 안의 하나가 값이다」라는 신호다. 탭은 값이 아니라
화면을 바꾸므로 그 신호가 필요 없고, 있으면 Segmented Control과 구별되지 않는다.

## Properties

React prop이 없으므로 **계약면은 DOM 속성이다.** 레시피가 실제로 읽는 것은 셋뿐이다.

| 속성 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `aria-selected` | `"true"` \| `"false"` | 없음 | 선택된 탭. `"true"`가 투명도를 1로 올린다 |
| `disabled` | boolean 속성 | 없음 | 비활성. 투명도 0.32 · `cursor: not-allowed` |
| `aria-disabled` | `"true"` | 없음 | `disabled`와 **같은 선언**을 받는다 |

`aria-selected` 없이 클래스만 붙이면 **선택 상태가 그려지지 않는다.** 지속 상태를 ARIA 속성이
소유하는 것은 [Interaction states](../foundations/interaction-states.md)의 계약이며, 그래서
보조기술에 노출되지 않은 선택은 화면에도 나타날 수 없다.

크기·variant·톤 prop이 없다. 아래 「일부러 하지 않은 것」.

## Hierarchy와 variants

**variant 축이 없다.** 밑줄 탭·박스 탭·알약 탭 같은 갈래를 두지 않았다. 제품 일곱 벌이 전부
같은 표현(면 없는 텍스트 + 투명도)이며, 실재하지 않는 갈래를 축으로 만들면 Figma에 그릴 수 없는
option이 생긴다.

**크기 축도 없다.** 높이가 28 하나다. 이 값은 [DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)의
컨트롤 사다리(`lg` 40 · `md` 32)를 **따르지 않는다** — 탭은 나란히 서는 컨트롤이 아니라 내비게이션
줄이고, 제품 일곱 벌이 전부 28이다. 그래서 `control-height-*`가 아니라 자기 토큰
`layout-tab-height`를 갖는다. 사다리를 따라 32로 올리면 제품 네 소비처의 줄 높이가 함께 밀린다.

## States

| state | 표현 |
| --- | --- |
| Default | 투명도 `0.48` · `cursor: pointer` |
| Hover | 투명도 `0.9`. **선택된 탭과 비활성 탭에는 걸리지 않는다** |
| Selected | 투명도 `1` |
| Disabled | 투명도 `0.32` · `cursor: not-allowed` |
| Focus | **그리지 않는다**(DS-D-0074). 강제 색에서만 `Highlight` 링 |

**선택을 면이 아니라 전경 대비로 말한다.** 면을 칠하면 Segmented Control과 같은 표현이 되고,
같은 화면에 둘이 함께 서는 대시보드 상단에서 어느 쪽이 값이고 어느 쪽이 화면 전환인지 읽히지
않는다.

**hover가 선택된 탭을 비껴가는 이유.** 선택은 1이고 hover는 0.9다. 선택된 탭에 hover가 걸리면
**얹었을 때 오히려 흐려진다.** 제품도 같은 판단을 했고 `:not(.활성):hover`로 갈라 두었다.
레시피는 그것을 `:where(:not([aria-selected="true"]):not(:disabled)):hover`로 옮겼다 —
`:where()`가 두 부정의 특이도를 0으로 눌러 규칙이 맨 `.louis-tabs__tab:hover`와 같은 (0,2,0)에
머문다. 호출부가 이길 수 있는 것은 이 특이도 때문이 아니라 레이어 순서 때문이다 — 아래
Implementation.

`active`·`pressed`·`busy` 상태가 없다. 탭은 토글이 아니고 누르는 동안의 피드백을 제품이 갖고 있지
않다.

## Interaction and responsive behavior

- 탭은 `flex: none`이다. **줄지 않는다** — 라벨이 잘리면 어느 화면으로 가는지 읽을 수 없다.
- 그래서 좁아지면 **넘친다.** 레시피는 넘침을 처리하지 않는다. `.louis-tabs`의
  `min-inline-size: 0`은 이 줄이 flex 부모 안에서 자기 내용 크기 아래로 줄 수 있게 열어 둔 것이며,
  실제 처리(줄바꿈·가로 스크롤)는 호출부가 정한다. 분석 계열 세 파일은 480px 이하에서
  `flex-wrap`하고 문의 폼은 상시 wrap한다.
- 탭 사이 간격은 4px이지만 **제품 어느 소비처도 이 값을 쓰지 않는다.** 아래 Known deviations.
- 전환은 `opacity` 하나다. 폭·위치가 움직이지 않으므로 레이아웃 재계산이 없다.
- `prefers-reduced-motion: reduce`에서 전환 시간이 0ms가 된다. 상태 자체는 남는다.

## Content

- 라벨은 **한 단어 또는 짧은 명사구**다. "개요"이지 "전체 성과 개요 보기"가 아니다.
- **패널의 내용을 부른다.** 동사가 아니라 명사다. "내보내기"는 탭이 아니라 버튼이다.
- 라벨 길이를 서로 비슷하게 맞춘다. 탭이 줄지 않으므로 하나만 길면 그 탭이 줄을 지배한다.
- 개수를 라벨에 붙이지 않는다("영상 128"). 값이 바뀔 때마다 줄의 폭이 변해 옆 탭이 움직인다.
- 탭이 **하나뿐이면 그리지 않는다.** 고를 것이 없는 탭 줄은 제목의 자리를 잘못 쓴 것이다.

## Accessibility

- **`role="tablist"` > `role="tab"` + `aria-selected` 마크업을 전제한다.** 이 셋이 없으면 레시피의
  선택 규칙이 아무것도 그리지 않는다.
- **패널 연결(`aria-controls`/`id`)과 좌우 키보드 이동은 소비처가 소유한다.** DS가 포커스 관리를
  대신 가져가면 두 벌의 roving tabindex가 생긴다 — 소비처의 것과 DS의 것이 어긋나는 순간 어느
  쪽이 옳은지 판정할 근거가 없다.
- **투명도만으로 선택을 전달하지 않는다.** 색·명도는 `aria-selected`를 그리는 결과일 뿐이고,
  상태를 나르는 것은 속성이다. 그래서 속성 없이 선택된 것처럼 보이게 만들 수 없다.
- **forced-colors에서 투명도가 죽는다.** 강제 색 모드는 전경을 시스템 색으로 치환하므로 0.48과
  1이 같은 색이 된다. 레시피가 그 모드에서 투명도를 전부 1로 올리고, 선택된 탭에만 밑줄을 그어
  상태를 되살린다.
- 높이 28px은 WCAG 2.5.8 target size minimum(24×24)을 넘는다. 폭은 라벨 + 좌우 24px이다.
- **미선택 탭의 대비가 SC 1.4.3에 미달한다.** 실측을 Known deviations에 적었다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 탭 높이 | 28px | `layout-tab-height` |
| 좌우 인셋 | 12px | `space-control-md` |
| 세로 인셋 | 0 | 리터럴 |
| 반경 | 999px | `radius-pill` |
| 커서 | `pointer` · 비활성 `not-allowed` | 리터럴 |
| 탭 사이 간격 | 4px | `space-control-xs` |
| 타이포 | 16/1.5 · 500 · −0.16px | `typography-body-md-medium` |
| 전경 | light `#171B22` · dark `#FAFAFA` | `color-fg-primary` |
| 면 | `transparent` | 리터럴 |
| 테두리 | 0 | 리터럴 |
| Default 투명도 | 0.48 | 리터럴 |
| Hover 투명도 | 0.9 | 리터럴 |
| Selected 투명도 | 1 | 리터럴 |
| Disabled 투명도 | 0.32 | 리터럴 |
| 전환 | 200ms · `cubic-bezier(0.25, 0.1, 0.25, 1)` | `motion-tab-select` |
| reduced-motion 전환 | 0ms | `motion-reduced` |
| forced-colors 밑줄 두께 | 1px | `border-width-default` |
| forced-colors 밑줄 간격 | 4px | 리터럴 |

**높이 28이 자기 토큰을 갖는 이유.** `layout-tab-height`는 `primitive.spacing.28`을 가리킨다.
컨트롤 사다리(40·32)에 28이 없고, 제품 일곱 벌이 전부 28이다. 사다리에 28을 끼워 넣으면 Button과
TextField가 쓰지 않는 계단이 생긴다 — [DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)이
`sm`(24)을 거부한 것과 같은 이유다.

**좌우 12px이 `space-control-md`에 정확히 맞는다.** 제품의 `px-6`은 이 저장소의 `--spacing: 2px`
격자에서 12px이고, 그 값이 기존 토큰과 같아 새 토큰이 필요하지 않았다.

**전환 200ms가 자기 모션 토큰을 갖는 이유.** 제품 일곱 벌이 전부 `200ms ease`다. `ease`의 계산값이
`cubic-bezier(0.25, 0.1, 0.25, 1)`이라 그대로 primitive로 옮겼다. 기존 `content-fade`(300ms)를
빌려 쓰면 탭 전환이 눈에 띄게 느려진다 — 이름이 맞지 않는 모션 토큰을 재사용하지 않는 것은
Segmented Control이 `layout-change`에서 한 판단과 같다. `motion-tab-select`는 토큰 소스의
`reducedMotionPairs`에 `motion-reduced`와 짝지어 있고 `motionProperties`가 허용 property를
`opacity` 하나로 못박아 둔다.

### 리터럴인 자리와 그 이유

- **세로 인셋 0.** 높이를 `layout-tab-height`가 고정하고 내용은 `align-items: center`가 세운다.
  0은 간격 계단의 한 칸이 아니라 「간격 없음」이다.
- **커서 `pointer`.** LOUIS에 커서 축의 토큰이 없다. 명시하는 이유는 `<button>`의 UA 기본 커서가
  `default`여서, 선언하지 않으면 탭 줄이 누를 수 있는 자리로 읽히지 않기 때문이다.
- **면 `transparent` · 테두리 0.** 색이 아니라 「면이 없음」이다. 투명을 가리키는 색 토큰을 두면
  칠할 수 있는 자리로 읽히고, 소비처가 거기에 색을 넣는다.
- **투명도 네 값.** LOUIS에 opacity 축의 토큰이 **하나도 없다.** `packages/css/src/component/`의
  다른 레시피도 전부 리터럴이다 — button 0.85 두 곳 · button 0.6 · switch 0.45 ·
  banner-carousel 0.85 · menu-popover 0.6. 서로 다른 값이 셋뿐인데도 축이 서지 않았다. 여기만
  토큰을 만들면 이 네 값이 한 계단에 서지 않는다.
  [DS-D-0026](../governance/decisions/DS-D-0026-alpha-scale.md)의 16단은 **색 알파**의 계단이지
  요소 투명도의 계단이 아니다. 0.48과 0.32는 그 계단 위에 있고 0.9는 없다(88·96 사이).
- **forced-colors 밑줄 간격 4px.** CSS가 리터럴로 두었고 사유 주석이 없다. `space-control-xs`가
  같은 4px이지만 그것은 컨트롤 간격 축이고 이것은 텍스트 장식 오프셋이다. 두 축을 잇는 근거가
  코드에 없으므로 여기서 만들지 않는다.

## Effects

없다. 그림자·테두리·헤어라인·필터가 전부 0이다. 탭 줄은 자기 면을 갖지 않으므로 놓인 표면과
분리될 필요가 없다.

## Implementation

- Web source: `packages/css/src/component/tabs.css`
- Public import: **없다.** 소비처가 `styles.layer.css`를 통해 클래스를 받는다
- React source: **없다**
- Figma: TabItem · Tabs
- Tests: **없다.** 하네스는 있다 — 아래 「일부러 하지 않은 것」

- **호출부가 투명도를 덮어쓸 수 있는 것은 특이도가 아니라 레이어 순서 덕이다.** 선택 규칙
  `.louis-tabs__tab[aria-selected="true"]`는 클래스+속성이라 (0,2,0)이고, `:where()`를 쓰는
  hover 규칙도 부정이 0으로 눌려 (0,2,0)이다. 덮어쓰는 Tailwind `opacity-100`·`hover:opacity-100`
  역시 (0,2,0)이라 특이도로는 승부가 나지 않는다 — `utilities` 레이어가 LOUIS component 레이어
  **뒤에** 온다는 것만이 승패를 가른다. 실제로 문의 폼의 카테고리 칩이 `opacity-100`으로 선택을
  표현한다 — `role="tab"`을 붙이는 것이 시맨틱상 틀린 자리라서다.
- `box-sizing: border-box`를 스스로 선언한다. reset은 opt-in이라 소비자가 켜지 않을 수 있고,
  그러면 높이가 28 + 인셋이 된다.
- `white-space: nowrap`이 라벨의 줄바꿈을 막는다. 탭이 두 줄이 되면 줄 전체의 높이가 흔들린다.

## 일부러 하지 않은 것

- **슬라이딩 인디케이터.** 밑줄이나 알약이 선택된 탭으로 미끄러지는 표현을 두지 않았다. 제품 일곱
  벌 어디에도 없다. 그리려면 폭이 상태인 전환이 필요한데 그 lifecycle을 여는
  [DS-D-0019](../governance/decisions/DS-D-0019-layout-change-motion.md)는 아직 `proposed`다.
- **패널 컴포넌트.** `role="tabpanel"`과 탭↔패널 연결을 레시피가 갖지 않는다. 패널은 화면마다
  구조가 다르고, DS가 껍데기를 쥐면 소비처가 그 안에 자기 레이아웃을 다시 만든다.
- **키보드 좌우 이동과 roving tabindex.** 위 Accessibility의 이유. 소유자가 하나여야 한다.
- **오버플로 전략.** 가로 스크롤도 「더 보기」 메뉴도 두지 않았다. 제품은 줄바꿈을 택했는데 그
  판단은 상단 줄의 높이가 변해도 되는 화면에서만 옳다.
- **아이콘·배지 슬롯.** 제품의 탭 라벨은 전부 글자만이다. 슬롯을 열면 크기 계약을 함께 정해야
  하고, 쓰지 않는 계약은 Figma에서 빈 자리로 남는다.
- **줄의 정렬·간격 축.** `justify-content`를 정하지 않는다. 분석 계열 세 파일이 `justify-start`에
  `gap-0`, 문의 폼이 `gap-9`(18px)로 서로 다르고 그 차이는 컴포넌트가 아니라 배치의 몫이다.
- **acceptance test를 쓰지 않은 것 — 막힌 것이 아니라 미룬 것이다.** 아래 Acceptance tests 17개
  항목은 오늘 그대로 쓸 수 있다. `packages/css/test/base.browser.test.ts`가 React 없이 원시 HTML을
  마운트해 계산값과 접근성 트리를 재는 **CSS 전용** 하네스이고(`.louis-visually-hidden`·
  옛 `.louis-focus-ring` 검증이 그렇게 서 있었다), Tabs에 React 표면이 없는 것은 이 하네스에
  걸림돌이 아니다. 미룬 이유는 그 하네스가 아직 base CSS만 대상으로 서 있고 컴포넌트 검증은
  전부 `packages/react/test/`의 React 테스트에 몰려 있어, Tabs가 CSS 하네스로 레시피를 재는 첫
  벌이 되기 때문이다 — 그 벌을 여는 변경 단위에서 함께 쓴다. 위 Implementation의
  「Tests: 없다」를 React 표면 부재의 결과로 읽으면 안 된다.

## Known deviations

- **미선택 탭의 대비가 라이트에서 SC 1.4.3(4.5:1)에 미달한다.** `color-fg-primary`를 0.48로 깐
  실측 대비다 — light `bg-surface` 3.11 · light `bg-canvas` 3.06 · dark `bg-surface` 4.51 ·
  dark `bg-canvas` 4.73. **넷 중 둘이 넘는다 — 다크 두 칸이다.**
  **다크가 넘게 된 것은 2026-09-09 에 다크 면 사다리를 한 칸씩 내린 결과다** — `bg-surface`(dark)가
  `palette-gray-800` → `850` 으로 어두워지면서 3.99 였던 칸이 4.51 이 됐다(`bg-canvas`(dark)는
  `palette-gray-900` 으로 돌아와 4.73 그대로다). **대비를 올리려고 값을 바꾼 것이 아니라 면
  이동의 결과로 따라온 것이다.** 미선택 탭은 장식이 아니라 누를 수 있는 컨트롤의
  라벨이므로 면제 대상이 아니다. 그런데도 제품 값을 채택한 이유는 하나다 — 이것을 고치면 선택과
  미선택의 대비 차이가 좁아져 **어느 탭이 현재 화면인지 읽히지 않는다.** 투명도 하나로 선택을
  말하는 설계 자체를 바꿔야 하는 문제이며, 그 결정은 이 변경 단위 밖이다. 수용하고 여기 적는다.
- **토큰 게이트가 이 수치를 계산하지 않는다.** 토큰 소스의 `contrastPairs`는 전부 토큰 대
  토큰이고, **요소 투명도를 얹은 뒤의 색을 보는 쌍이 하나도 없다.** 위 실측은 손으로 잰 것이다.
  이 결손은 이 컴포넌트가 만든 것이 아니라 드러낸 것이다.
- ~~**포커스 표시가 레시피에 없다.**~~ **해소됐다**(DS-D-0074) — 포커스 링을 그리지 않는 것이
  계약이고, 강제 색의 링은 `base.css`의 한 규칙이 `.louis-tabs__tab`에도 건다. 붙일 주체가 필요 없다.
- **탭 사이 간격 4px을 아무도 쓰지 않는다.** 분석 계열 세 파일이 `gap-0`으로, 문의 폼이 `gap-9`(18px)로
  덮는다. 채택한 것은 이 값이 합의된 값이어서가 아니라 **줄에 간격 선언이 아예 없으면 소비처가
  전부 자기 값을 써야 하기 때문**이다. 4는 컨트롤 간격 계단의 가장 작은 칸이며, 다음 소비처가
  나올 때 이 값을 다시 연다.
- **disabled 표현이 다른 컴포넌트와 다르다.** Button은 `color-fg-disabled` 토큰으로, Switch는
  투명도 0.45로, Tabs는 0.32로 비활성을 말한다. 세 벌이 한 계단에 서 있지 않다. Tabs가 색 토큰을
  쓰지 못하는 이유는 구조적이다 — 이 컴포넌트는 투명도가 상태 축이므로 색을 바꾸면 두 장치가
  같은 자리에서 다툰다. 값 0.32는 기본 0.48보다 흐려 「기본보다 더 꺼져 있음」이 읽히도록 고른
  것이고, 제품에는 **비활성 탭이 한 벌도 없다** — DS가 더한 상태다.
- **제품 소비처의 실제 타이포가 레시피와 다르다.** 레시피는 16 고정인데 제품 토큰은 450px 이하에서
  14로 줄어든다. 그래서 네 소비처가 전부 `text-body-16`을 유틸리티로 덧붙여 이긴다.
  반응형 타이포를 컴포넌트가 갖지 않는 한 이 덧칠은 사라지지 않는다.
- **제품 소비처의 전경색도 레시피와 다르다.** LOUIS `color-fg-primary`는 light에서 `#171B22`이고
  제품은 순검정이다. 네 소비처가 `text-gray-000`으로 덮는다.
- **배포본에는 아직 소비처가 0이다.** 위 네 파일의 채택은 제품 `design` 브랜치에 있고, 인용 좌표를
  고정한 배포본 커밋에는 이관 전 원본이 들어 있다. 이 문서의 `파일:줄` 좌표는 그 **원본**을
  가리킨다.
- **랜딩 데모 스냅숏이 아직 갈래로 남아 있다.** `StaticAnalyticsDemo.tsx`는 `.louis-tabs`를 쓰지
  않고 같은 값을 유틸리티로 복제한다(`opacity-[0.48] [&:hover]:opacity-90`). 가이드 모달과 필터
  칩도 같은 투명도 쌍을 복제한다. **아카이브 뷰는 갈래가 아니다** — 위 네 소비처 중 하나로 이미
  이관돼 `louis-tabs` / `louis-tabs__tab`을 쓴다.
- **parity 계약에 기하가 없다.** 계약 자체는 있다 — `scripts/verify-figma-parity.mjs`에 tabs가
  `TabItem`과 `Tabs` 두 벌로 등재돼 있고 게이트가 실제로 돈다(`parity OK … component 39개`).
  State 4개(Default·Hover·Selected·Disabled)와 속성 축은 그래서 대조된다. **없는 것은 기하다** —
  두 계약 모두 `geometry`를, 따라서 그것이 가리킬 `measuredId`를 갖지 않고
  `figma/components.measured.json`의 23종에도 tabs가 없다. 높이 28 · 좌우 인셋 12 · 반경 999 ·
  줄 간격 4는 Figma와 코드 어느 쪽이 움직여도 게이트가 모른다.

## Acceptance tests

1. `.louis-tabs__tab`의 높이가 28px이고 `layout-tab-height`를 참조한다.
2. `padding-inline`이 12px(`space-control-md`)이고 `padding-block`이 0이다.
3. `border-radius`가 999px(`radius-pill`)이고 `border-width`가 0이며 배경이 투명하다.
4. 폰트 크기·굵기·행간·자간이 `typography-body-md-medium`과 같다(16 · 500 · 1.5 · −0.16px).
5. `.louis-tabs`의 `gap`이 4px(`space-control-xs`)이다.
6. `aria-selected`가 없는 탭의 계산된 `opacity`가 0.48, `aria-selected="true"`인 탭이 1이다.
7. 미선택 탭에 hover하면 0.9가 되고, **선택된 탭에 hover해도 1에서 변하지 않는다.**
8. 기본 탭과 선택된 탭의 `cursor`가 `pointer`다.
9. `disabled` 탭에 hover해도 0.32에서 변하지 않고 `cursor`가 `not-allowed`다.
10. `disabled` 속성과 `aria-disabled="true"`가 같은 계산값을 만든다.
11. `transition-property`가 `opacity` **하나**이고 지속시간이 200ms,
    타이밍이 `cubic-bezier(0.25, 0.1, 0.25, 1)`이다.
12. `prefers-reduced-motion: reduce`에서 `transition-duration`이 0ms가 되고, 여섯째·일곱째 항의
    투명도 값은 그대로다.
13. `forced-colors: active`에서 모든 탭의 `opacity`가 1이고 `aria-selected="true"`인 탭만
    `text-decoration-line: underline`을 갖는다.
14. 탭이 `flex: none`이라 컨테이너가 좁아져도 폭이 줄지 않고 라벨이 잘리지 않는다.
15. 라벨이 길어도 줄바꿈하지 않고 줄의 높이가 28px로 유지된다.
16. `role`·`aria-selected` 없이 클래스만 붙이면 선택 표현이 나타나지 않는다.
17. 레시피에 `:focus-visible` 선언이 없다. 키보드 포커스에 링이 없고 강제 색에서만 `base.css`의
    링이 선다(DS-D-0074).
