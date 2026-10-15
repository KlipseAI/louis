---
id: progress
status: experimental
authority: normative
---

# Progress

일이 얼마나 진행됐는지 말한다. 값이 있으면 `ProgressBar`, 아바타처럼 감쌀 것이 있으면
`ProgressRing`이다.

접근성 계약은 [DS-D-0022](../governance/decisions/DS-D-0022-determinate-progress-a11y.md)가
소유한다. **값이 DOM에 있고 보조기술이 읽는다**가 이 컴포넌트의 요지다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | --- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 8건이 두 motion context에서 각각 돈다; visual regression과 제품 소비 증거 없음 |
| Figma         | `done`      | component set 둘 — ProgressBar(State) · ProgressRing. Figma 는 conic 각도의 런타임 값을 표현하지 못해 한 지점만 그린다. 기하는 양방향이다 — `progress.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. **2026-09-14 `done` 에서 내렸다** — 제품 앵커 `6f6282c1` 이 프로필 아바타(링의 기준 내용)를 줄여 기록의 지름 · 내용(`figma/components.measured.json` 의 `progress-ring.sizes.base` `size` · `contentSize`)이 따라 옮겨졌는데, 라이브 `ProgressRing` 마스터(`figma/readback.json` 의 `components.ProgressRing.geometry.base`)는 옛 아바타 기준 그대로라 `verify-figma-parity` 가 실패한다. 마스터를 옮기고 되읽기를 다시 뜨면 되올린다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md), 아래 Known deviations) — 2026-10-14 기하 계약 · 실측 · 되재기로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다 |

```tsx
<ProgressBar aria-label="영상 업로드" value={42} />
<ProgressBar aria-label="분석 중" indeterminate />

<ProgressRing aria-label="이번 달 사용량" value={68} valueText="1,200 크레딧 중 816 사용">
  <Avatar size="sm" src={user.avatarUrl} name={user.name} />
</ProgressRing>
```

## 언제 쓰나

- **끝이 보이는 일**에 `ProgressBar`를 쓴다. 업로드·렌더링·내보내기처럼 퍼센트가 뜻을 갖는 일이다.
- **끝을 모르는 일**은 `indeterminate`다. 값을 0으로 두지 않는다 — "0% 완료"와 "모른다"는 다른 말이다.
- **한도 대비 사용량**은 `ProgressRing`이다. 남은 크레딧처럼 신원 표식(아바타) 옆에서 읽히는 값이다.

## 언제 쓰지 않나

- 회전만 하는 대기 표시. 그것은 `Spinner`이며 값이 없다.
- 자리 표시. 그것은 `Skeleton`이다. 진행률은 "얼마나 됐나"이고 스켈레톤은 "무엇이 올 것인가"다.
- 단계 표시(1/3 → 2/3). 단계는 목록이지 연속값이 아니다. 그것을 진행바로 그리면 2단계에서 66%로
  읽히는데 실제로는 아직 2단계를 시작하지도 않았을 수 있다.

## Anatomy

| 부품 | 역할 |
| --- | --- |
| 트랙 | **값을 갖는다.** `role="progressbar"`와 `aria-value*`가 여기 붙는다 |
| 채움 | 장식이다. `aria-hidden`이며 폭만 바뀐다 |
| 링 | 트랙과 채움을 conic-gradient 한 층으로 그린다. 가운데는 mask로 뚫는다 |
| 링 가운데 글리프 | 양방향 링(`data-mode="bipolar"`)에서만. `__label` — 링이 감싼 아이콘 · 글자 |

**채움에 role을 걸지 않는다.** 폭이 0일 때 요소가 사라지는 구현에서 이름째 사라진다.

## Properties

아래는 프레임워크에 종속되지 않는 public contract다. 구현체 이름은 달라도 의미를 바꾸지 않는다.

| 컴포넌트 | prop | 타입 | 기본 | 뜻 |
| --- | --- | --- | --- | --- |
| 둘 다 | `value` | number | `0` | 0~100. 벗어나면 조인다 |
| 둘 다 | `indeterminate` | boolean | `false` | 끝을 모르는 상태 |
| 둘 다 | `valueText` | string | 없음 | 숫자만으로 뜻이 서지 않을 때 |
| `ProgressRing` | `children` | ReactNode | — | 링이 감쌀 것. 보통 Avatar |

**양방향 값 링은 CSS 레시피에만 있다** — React prop 이 없다. 소비처가 data 속성과 `--louis-progress-value` 를 준다.

| data 속성 | 값 | 뜻 |
| --- | --- | --- |
| `data-mode` | `bipolar` | 양방향 값 링 — 아래 「양방향 값 링」 |
| `data-direction` | `next` \| `prev` | 양(시계) · 음(반시계). 없으면 `next` |
| `data-active` | `true` | 고른 항목 — 바탕이 짙어지고 1.1 배 |

이름은 소비처가 준다(`aria-label` 또는 `aria-labelledby`). "진행률"은 무엇의 진행률인지 말하지
않으므로 컴포넌트가 만들 수 없다. 이름이 없으면 개발 중에 경고한다.

## 양방향 값 링 — `data-mode="bipolar"`

아이콘을 감싼 호가 **중립에서 얼마나 · 어느 쪽으로** 벗어났는지 보인다(비디오 편집기 조절 줄,
`components/scenes/create/node-canvas-v2/nodes/videoEditParts/ColorValueRing.tsx`, 소비처 `ClipColorControls.tsx:223`).
12시에서 시작해 양은 시계, 음은 반시계로 최대 150° — 아래 60° 를 비워 시작점이 보인다. 32 고정 상자 안에 글리프가 앉고,
고른 항목은 바탕 링이 짙어지며 1.1 배가 된다.

```html
<button type="button" aria-pressed="true" aria-label="노출 +0.4">
  <span class="louis-progress-ring" data-mode="bipolar" data-direction="next" data-active="true"
        style="--louis-progress-value:27" aria-hidden="true">
    <span class="louis-progress-ring__label">…글리프…</span>
  </span>
</button>
```

| 속성 | 값 |
| --- | --- |
| `--louis-progress-value` | 크기 0~100(= 0~150°). 범위가 항목마다 비대칭이라(감마 0.5~2, 중립 1) 비율로 바꾸는 계산은 소비처의 것이다 |
| `data-direction` | `next`(양 · `inspector-adjust-accent`) · `prev`(음 · `fg-primary`) |
| `data-active` | `true` 면 바탕 `gray-000-alpha-40` · 1.1 배 |
| 상자 | 32(`layout-control-height-md`) 고정 · 링은 2(`space-progress-ring-gap`) 안쪽 · 두께 2(`border-width-ring`) · 바탕 `gray-000-alpha-20` |
| 호버 | 링을 담은 버튼을 가리키면 1.1 배(호버 기기만) |

값을 전하는 것은 링이 아니라 그 항목의 이름 · 값 글자다 — 링은 장식(`aria-hidden`)이고, 담는 버튼이 `aria-pressed` 와 이름을 갖는다.
그래서 이 판은 위 「트랙이 `role="progressbar"`를 갖는다」 계약 밖이다.

## States

| 상태 | 무엇이 달라지나 |
| --- | --- |
| determinate | 채움 폭이 값이다. `aria-valuenow`가 같은 수를 갖는다 |
| indeterminate | 채움이 폭을 갖지 않고 면 그라디언트가 흐른다. `aria-valuenow`가 **없다** |
| reduced-motion | indeterminate의 흐름이 1회로 멈춘다. role과 이름은 남는다 |

hover·focus·disabled 상태가 없다. **진행률은 누를 수 없는 것이다** — 상호작용이 필요하면 그것은
슬라이더이지 진행률이 아니다. 양방향 값 링의 호버 · 고름(`data-active`)은 링 자신이 아니라 **링을 담은 버튼**의 상태를 비춘 것이다.

## Accessibility

- **트랙이 `role="progressbar"`를 갖는다.**
- determinate는 `aria-valuenow` · `aria-valuemin` · `aria-valuemax`를 전부 적는다. 기본값이 있지만
  생략하면 보조기술마다 다르게 읽는다.
- indeterminate는 `aria-valuenow`를 **넣지 않는다.**
- 색이 유일한 채널이 아니다. 값이 DOM에 있다.
- `prefers-reduced-motion`에서 indeterminate의 loop이 멈춘다. 멈춘 뒤에도 role과 이름이 남으므로
  "작업 중"이라는 뜻은 유지된다([DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md)).

## Content

**이름은 무엇의 진행률인지 말한다.** "진행률", "로딩", "처리 중"은 이름이 아니다 — 화면에 진행률이
둘 이상 있을 때 스크린 리더 사용자가 어느 것인지 구분하지 못한다. "영상 업로드", "자막 생성"처럼
일의 이름을 준다.

**퍼센트를 글자로 함께 보이려면 소비처가 그린다.** 컴포넌트가 숫자를 그리면 자리와 서체가 화면마다
달라야 할 때 빠져나갈 길이 없다. 값은 이미 `aria-valuenow`에 있으므로 시각 표시는 선택이다.

**`valueText`는 숫자를 대신하는 것이지 덧붙이는 것이 아니다.** "68%"와 "1,200 중 816"을 함께 읽어
주면 같은 말을 두 번 하는 것이 된다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 바 높이 | 6px | `layout-progress-bar-height` |
| 바 최대 폭 | 320px | `layout-progress-bar-max-inline-size` |
| 바 반경 | 알약 | `radius-pill` |
| 바 트랙 | — | `color-progress-track` |
| 바 채움 | — | `color-progress-fill` |
| 링 지름 | 내용 + (링 간격 + 링 두께) × 2 — **계산값이라 수로 적지 않는다.** 기준 내용과 지름은 기록 `progress-ring.sizes.base` 의 `contentSize` · `size` 가 갖는다 | padding으로 만든다 |
| 링 두께 | 2px | `border-width-ring` |
| 링 간격 | 2px | `space-progress-ring-gap` |
| 링 트랙 · 채움 | — | `color-progress-ring-track` · `color-progress-ring-fill` |

**제품에는 정본이 없었다.** 진행바 정의 셋이 두께·색·전환이 다 다르고, 합의하는 축은 높이 6 ·
반경 · 최대 폭 셋뿐이다. 그 셋만 옮기고 색은 DS가 골랐다. 링은 다르다 — 제품 정본이 하나뿐이라
(`profileTrigger`) 두께·간격·지름 식·색을 그대로 옮겼다.

**기준 내용은 제품 프로필 아바타다.** 제품 프로필 트리거의 한 변은 아바타 + (링 간격 + 링 두께) × 2 로
계산되고(`Gnb.tsx:1477`), 선언은 아바타 · 간격 · 두께 셋이다 — `--profile-avatar-size`를 `profileTrigger` 한 곳이
24px로 갖는다(`Gnb.tsx:1471`, ≤480px 재고정도 24px `:1507`). 기록은 그 아바타를 `contentSize` 로, 식을 푼 지름을
`size` 로 두고 이 문서는 지름을 수로 적지 않는다. 제품 앵커 `6f6282c1`(2026-09-14 소유자 요청)이 모든 페이지의
프로필 버튼을 캔버스 에디터 헤더와 같은 크기로 맞추기 전에는 기본 아바타가 28이었고 ProjectHeader 슬롯만 24로 덮어
썼다. 그래서 DS에서 그 모습을 내려면 [Avatar](avatar.md)의 `sm`(24)을 감싼다 — 기본 `md`(28)를 감싸면 지름도 두
칸의 차이만큼 커진다.

**링 지름을 계산하지 않는다.** 제품은 `avatar + (gap + width) × 2`를 직접 적는데, 그러면 아바타
크기를 두 곳에 적게 된다. DS는 `padding`으로 같은 값을 만들어 내용이 커지면 지름이 따라온다.

## Motion

| 무엇 | lifecycle | 값 |
| --- | --- | --- |
| 채움 폭 · 링 각도 | layout-change | `motion-layout-change` (220ms) |
| indeterminate | loop | `motion-shimmer` (1600ms) |
| 양방향 링 확대(`scale`) | control-hover | `motion-control-hover` |

**indeterminate가 폭을 옮기지 않는다.** loop이 허용하는 property는 opacity·rotate·background-position
셋이고([DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md)) transform은 그 밖이다.
면 그라디언트를 흘려 같은 뜻을 만든다 — Skeleton과 같은 기법이라 층을 하나 덜 만든다.

## Known deviations

- **전환 지속이 제품과 다르다.** 제품은 300ms ease(진행바)와 320ms(크레딧 바)를 쓰고 DS는
  컨트롤 계단의 220ms를 쓴다. 제품 셋이 서로 다르므로 옮겨 올 값이 없다.
- **바 반경을 리터럴 3px로 적지 않는다.** 제품은 3px을 적는데 높이가 6이라 브라우저가 그리는
  곡률은 알약과 같다. 리터럴 3은 높이를 바꾸는 날 따라오지 않는다.
- **`<progress>` 요소를 쓰지 않는다.** 브라우저마다 그리는 방식이 달라 트랙·채움을 토큰으로 물릴
  수 없다. 제품에도 0곳이다.
- **링에 indeterminate 표현이 없다.** 값 없는 링은 회전하는 호가 되어야 하는데, 그것은 Spinner와
  구분되지 않는다. 필요해지면 Spinner를 쓴다.
- **Figma의 채움 비율은 마스터 폭에서만 맞는다.** Figma 마스터는 비율을 `Fill` 자식의 **고정
  폭**으로 표현한다 — 트랙 320에 `determinate` 채움 192(60%)·`indeterminate` 128이고
  (`figma/readback.json`의 `components.ProgressBar.geometry.base.parts.Fill`), 자식의 크기는
  인스턴스에서 따라 늘지 않는다. **그래서 트랙 폭이 320이 아닌 자리에 인스턴스를 놓으면 채움
  비율이 반드시 어긋난다.** 오늘의 규약은 「인스턴스는 폭 320에서만 쓴다」이며, 그 제약을 풀려면
  `value`를 컴포넌트 프로퍼티로 세워 채움을 값에서 계산해야 한다. CSS 쪽에는 이 문제가 없다 —
  채움이 `inline-size: %`라 트랙을 따라간다.
- **Figma `ProgressRing` 마스터가 기준 지름을 따라오지 않았다(2026-09-14).** 기록(`progress-ring.sizes.base`
  의 `size` · `contentSize`)은 아바타 24 기준으로 옮겼는데 라이브 마스터의 Track · Content 는 아바타 28 기준 그대로다
  (`figma/readback.json` 의 `components.ProgressRing.geometry.base`). Figma 쓰기는 소유자 승인이 필요해 앵커
  이동에서 하지 않았고, 그래서 위 Availability 의 Figma 가 `partial` 이다. 닫는 길은 마스터의 Track · Content 를
  기록 값으로 옮기고 `figma-readback-emit --components --only ProgressRing` 과 `build-figma-snapshot` 으로 되읽기를
  다시 뜨는 것이다 — `verify-figma-parity` 가 초록이 되면 `done` 으로 되올린다. **같은 원인이 AppTopBar 에도
  번진다** — 그 계약은 후행 슬롯 높이를 이 기록의 `progress-ring.sizes.base.size` 에서 읽고(슬롯은 링을
  hug 한다, [Figma 화면 조립 규칙](../governance/figma-screen-assembly.md) 28번), 라이브 표본(`components.AppTopBar.geometry.topBar.parts.Trailing`)은
  아직 옛 링 크기다. 마스터를 옮길 때 AppTopBar 의 되읽기도 함께 다시 뜬다.

- **양방향 링의 호 끝이 둥글지 않고 바탕 · 호 두께가 같다.** 제품은 SVG 호에 둥근 마개 · 바탕 1.2 / 호 1.6 이고(`ColorValueRing.tsx@54b62a8a:60-83`),
  레시피는 conic 한 겹이라 마개가 각지고 두 겹이 `border-width-ring` 한 두께다(소유자 판정 9, 2026-10-13 기본값). 고른 바탕 38% 는 40% 칸으로 접는다.
- **양(+) 호가 라이트에서 제품보다 짙다(DS-D-0084 §3)** — yellow-500 1.73:1 → `inspector-adjust-accent` yellow-700 3.57:1. 다크는 제품 값 그대로다.
- **양방향 링의 `scale` 전이가 `motion-control-hover` 의 선언 property 밖이다.** `node-chrome-button` · `icon-button` 과 같은 방식이고, 전이는
  keyframe 게이트가 보지 않는다(소유자 판정 10).
- **양방향 링에 React 표면(타입 있는 prop)이 아직 없다.** 실브라우저 시험은 2026-10-14 에 섰다 — `progress.browser.test.tsx` 가
  `data-mode` 를 rest 로 넘겨 기록 `progress-ring.sizes.bipolar`(상자 32 · 패딩 0 · 링 안쪽 2)를 잰다. Figma 는 2026-10-13 에 섰다 — `ProgressRing` 이 세트가 되어 `Mode`(`determinate` ·
  `bipolar`) · `Direction`(`next` · `prev`) · `Selected` · TEXT `Glyph` 를 갖는다. Figma 가 희소 세트를 받지 않아 determinate 칸에도
  `Direction=next, Selected=false` 가 붙는다. 고른 링의 1.1배 확대는 CSS `scale` 이라 변형 기하로 옮기지 않았다.

## Acceptance tests

1. 트랙이 `role="progressbar"`를 갖고 채움은 `aria-hidden`이며 role이 없다.
2. determinate가 `aria-valuenow`·`aria-valuemin`·`aria-valuemax`를 전부 갖는다.
3. indeterminate가 `aria-valuenow`를 **갖지 않는다.**
4. 범위를 벗어난 값이 0~100으로 조여지고, 화면의 채움 폭과 `aria-valuenow`가 같은 값을 말한다.
5. `valueText`가 `aria-valuetext`로 나간다.
6. 이름이 없으면 개발 중에 경고한다.
7. 바의 높이·최대 폭·반경이 계약과 같다.
8. 링의 지름이 내용에서 나온다 — 기록의 `contentSize` 내용에서 지름이 `contentSize + gap-plus-width × 2` 이고,
   그 값이 기록의 `size` 와 같다.
9. 면과 채움 색이 states 표의 토큰과 같다. 링은 conic-gradient 안에 두 색이 모두 들어간다.
