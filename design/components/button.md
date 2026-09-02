---
id: button
status: experimental
authority: normative
summary: 사용자가 바로 실행할 수 있는 액션을 표현합니다.
---

# Button

사용자가 즉시 실행할 수 있는 명확한 액션을 표현한다. 제품별 버튼 스타일을 만들기 전에 공용
Button 계약으로 해결할 수 있는지 먼저 확인한다.

## Availability

| Surface       | 상태           | 근거                                                      |
| ------------- | -------------- | --------------------------------------------------------- |
| Web           | `partial`      | public export와 acceptance test 11건; 아래 남은 증거 참조 |
| Figma         | `done`      | component set(Variant·Size·State·Icon). 계약이 모든 property 를 pin 하고 기하·슬롯·stroke·effect 를 대조한다. 기하는 양방향이다 — `component-geometry.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                   |
| Maturity      | `experimental` | 제품 소비 증거와 visual regression이 아직 없음            |

## API

```tsx
import { Button } from "@klipse-design/react";

<Button variant="primary">새 프로젝트 만들기</Button>
<Button variant="secondary">취소</Button>
<Button variant="danger">삭제</Button>
```

소비자는 `@klipse-design/css`를 **세 줄로** 불러온다. 순서가 계약이다 —
자세한 이유와 Tailwind 사용 시의 순서는
[`packages/css/README.md`](../../packages/css/README.md)가 소유한다.

```ts
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
```

**`tokens.css`를 빼면 오류 없이 색·간격·반경이 전부 무효값이 된다.** `styles.css`에는 `--louis-*`
정의가 없고 `var(--louis-*)` 참조만 있으며, 생성물끼리 `@import`하지 않는다.

링크 이동이 목적이면 클릭으로 navigation을 흉내 내지 말고 **링크로 렌더한다**(아래).

## 링크로 렌더하기

**버튼처럼 보이지만 하는 일이 이동이면 `<a>` 여야 한다.** 우클릭·새 탭·주소 복사·미리보기가
살아 있어야 하고, 보조 기술도 「버튼」이 아니라 「링크」로 읽어야 한다. `<a>` 안에 `<button>`
을 넣는 것은 유효하지 않은 HTML 이므로 그 길은 없다.

React `Button` 은 `<button>` 만 그린다. 그래서 이 경우에는 **클래스 레시피를 앵커에 직접
입힌다** — 레시피가 요소를 가리지 않으므로 모양은 한 글자도 다르지 않다.

```html
<a href="/" class="louis-button louis-focus-ring" data-variant="secondary" data-size="md">
  <span class="louis-button__label">홈으로 이동</span>
</a>
```

세 가지를 지킨다.

- `data-variant` · `data-size` 는 **속성이 상태를 표현한다**(DS-D-0004). 클래스로 갈지 않는다.
- 라벨은 `__label` 슬롯에 넣는다. 맨 텍스트로 두면 아이콘이 붙는 순간 정렬 축이 달라진다.
- `.louis-button` 이 `text-decoration: none` 을 이미 갖고 있다 — 호출부가 밑줄을 따로 지우지
  않는다. 지우고 있다면 그건 이 레시피를 안 쓰고 있다는 뜻이다.

이 문단이 생기기 전까지 제품은 같은 마크업을 자리마다 손으로 베끼고 있었고
(`billing-success` 두 액션 · 오류 화면의 「홈으로 이동」), 아래 「Product divergences」가 그것을
**이탈로** 기록하고 있었다. 이탈이 아니라 **적어 두지 않은 계약**이었다.

## Anatomy

1. Root — 네이티브 `<button>`, 또는 이동이 목적일 때 같은 레시피를 입은 `<a>`
2. Left icon — 선택 사항, 장식이면 보조 기술에서 숨김
3. Label — 결과를 설명하는 텍스트
4. Right icon — 선택 사항, 장식이면 보조 기술에서 숨김
5. Progress indicator — loading일 때 label 의미와 함께 제공

## Properties

| Prop         | 값                                        | 기본값    | 설명                                            |
| ------------ | ----------------------------------------- | --------- | ----------------------------------------------- |

> **아이콘은 불리언이 아니라 `Icon` 축이다.** 아이콘이 붙은 쪽 padding이 2px 줄기 때문이다
> (`button.css`: lg 16→14, md 12→10). Figma 불리언은 가시성만 바꾸고 padding은 못 바꾼다 —
> 불리언으로 두면 표현할 수 없는 상태가 생긴다. 그래서 Variant×Size×State×Icon = 6×3×5×4 = 360이다.
> **이 360은 오늘의 Figma 값이다**(2026-09-01 실측, component set `672:552`). `sm`을 연
> [DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)와 `danger-secondary`가
> 둘 다 Figma에 들어와 코드와 축이 같아졌다.
| `variant`    | `primary`, `secondary`, `ghost`, `danger`, `danger-secondary` | `primary` | 강조와 의미                     |
| `size`       | `lg`, `md`, `sm`                          | `md`      | 시각 크기; hit area 계약은 별도 유지            |
| `loading`    | boolean                                   | `false`   | 중복 실행 차단, `aria-busy`, progress indicator |
| `leftIcon`   | ReactNode                                 | —         | 라벨 앞 보조 아이콘                             |
| `rightIcon`  | ReactNode                                 | —         | 라벨 뒤 보조 아이콘                             |
| native props | ButtonHTMLAttributes                      | —         | `disabled`, `aria-*`, event                     |

`type` 기본값은 `button`이다. 폼 제출은 호출부가 `type="submit"`을 명시한다.

## Hierarchy와 variants

| Variant     | 용도                | 원칙                                               |
| ----------- | ------------------- | -------------------------------------------------- |
| `primary`   | 핵심 진행·생성 액션 | 한 영역의 최우선 액션에 사용                       |
| `secondary` | 취소·대안           | primary를 보조                                     |
| `ghost`     | 툴바·저강조 액션    | 면이 없어도 발견 가능한 위치에서 사용              |
| `danger`    | 삭제·초기화         | 결과를 구체적으로 설명하고 필요하면 확인 단계 제공 |
| `danger-secondary` | 확인 모달·목록 행의 파괴 액션 | 취소·편집과 나란히 서는 자리. solid `danger`와 같은 화면에 함께 두지 않는다 |

강조 수준을 색만으로 결정하지 않고, 같은 영역에 경쟁하는 primary를 여러 개 두지 않는다.

## States

상태 이름의 뜻은 [Interaction states](../foundations/interaction-states.md)가 소유한다.
Button은 토글이 아니므로 `pressed`(`aria-pressed`)를 갖지 않는다 — 누르는 중은 `active`다.

| 상태          | 계약                                                   |
| ------------- | ------------------------------------------------------ |
| Enabled       | 라벨만으로 결과를 예측할 수 있음                       |
| Hover         | hover에서만 기능을 드러내지 않음                       |
| Active        | 누르고 있는 동안의 feedback. reduced-motion에서 scale 이동 제거 |
| Disabled      | 실행되지 않으며 이유가 필요하면 인접 설명 제공         |
| Focus-visible | 배경과 테마에 관계없이 2px 이상 명확한 indicator       |
| Loading       | label 의미 유지, 중복 실행 차단, `aria-busy=true`      |

### 제품 실측 — hover 면과 active scale

**면이 없는 두 variant는 hover에서 면을 얻고, 그 알파가 서로 다르다**(배포본 실측).
`ghost`가 `secondary`보다 라이트에서 3%p, 다크에서 2%p 진하다 — `secondary`는 이미 테두리로
경계를 갖고 있어 면이 덜 필요하고, `ghost`는 **hover 면이 유일한 경계**라 더 진해야 한다.

| variant | 라이트 hover 면 | 다크 hover 면 |
| --- | --- | --- |
| `secondary` | `rgb(23 27 34 / 5%)` | `rgb(250 250 250 / 8%)` |
| `ghost` | `rgb(23 27 34 / 8%)` | `rgb(250 250 250 / 10%)` |

**두 기준색은 잉크와 페이퍼로 갈린다.** 라이트는 잉크(`--palette-gray-900-rgb` = `23 27 34`)를
얹고 다크는 페이퍼(`--palette-gray-000-rgb` = `250 250 250`)를 얹는다 — 같은 토큰의 테마 분기가
아니라 **서로 다른 원 팔레트를 직접 읽는** 구조다.

`primary`는 면을 얻지 않고 `filter: brightness(1.06)`으로 밝아지며, `danger`는 `opacity: 0.85`다.

**`active` scale이 variant마다 다르다.** 제품은 `ghost`만 `scale(0.97)`이고 나머지 셋은
`scale(0.98)`이다. 상호배타 삼항으로 갈라 한 요소에 둘을 얹지 않는다.
**DS는 전 variant `0.98`로 통일했고 이것은 기록된 편차다** — `ghost`만 다르게 두면 press 깊이가
variant 축이 되는데, 그 축을 세울 근거가 하나뿐이다.

근거: `Button.tsx@a3ed8e03:82-83`(scale 상수) · `:105`·`:110`(secondary) · `:116`·`:120`(ghost) ·
`globals.css:46`·`:57`(기준색).

**알파 표기법이 계약이다.** 제품은 `rgb(var(--x-rgb) / 5%)` 임의값을 쓰고 Tailwind의 `/5` 단축을
쓰지 않는다 — 단축은 `color-mix()`로 컴파일돼 **결과 색이 달라진다.** 파일 주석이 그 이유를 적어
두었다.

**남은 판정.** `ghost` 라이트 8%는 [App Shell Parts](app-shell-parts.md)가 이미
`color-accent-ghost-hover`의 잉크 8%로 적어 둔 값과 같다. `secondary`의 5%에 대응하는
`color-accent-secondary-hover` 토큰은 **아직 없다** — 추가 여부가 판정 대상이고 그때까지는 위
실측값을 정본으로 둔다.

## Size

컨트롤 높이 사다리는 세 칸이다 — `lg`(40) · `md`(32) · `sm`(24). 값과 쓰임새는
[DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)과
[DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)가 소유하고, Button은
그 사다리를 따라가는 다섯 컴포넌트 중 하나다.

| Size | 높이 | 쓰는 곳 |
| --- | ---: | --- |
| `lg` | 40 | 화면의 주인공이 되는 제출 CTA — 로그인·회원가입 |
| `md` | 32 | 그 밖의 전부. 기본값이다 |
| `sm` | 24 | 편집 표면의 도구 줄 — 캔버스·타임라인·에셋 패널처럼 한 줄에 컨트롤이 여럿 서고, 화면의 주인공이 컨트롤이 아니라 편집 대상인 자리 |

**`sm`을 폼·대화상자·본문 흐름에 쓰지 않는다.** 그 자리에서 24는 누르기 어렵고 `md`가 이미
맞다. 도구 줄이 24를 감당하는 것은 사용자가 그 줄을 **보면서** 쓰기 때문이지 24가 일반적으로
충분해서가 아니다.

`sm`은 사다리에서 유일하게 **곡률과 타이포가 갈라지는 칸**이다 — radius 8, caption 12/18.
둘 다 디자인 실측이며 근거는 아래 Specification에 있다.

## Content

- 결과를 예측할 수 있는 짧은 동사형 라벨을 쓴다: `저장`, `업로드`, `삭제`.
- `확인`, `다음`처럼 맥락 없이는 결과를 알 수 없는 라벨은 구체화한다.
- 진행 문구 끝에 ellipsis를 붙이지 않는다.
- 번역과 200% 확대에서 잘리면 버튼 폭 또는 action layout을 바꾼다.

## Accessibility

- 아이콘 전용 버튼은 accessible name을 제공한다.
- disabled처럼 보이지만 동작하는 요소를 만들지 않는다.
- loading 중 현재 focus를 제거하지 않는다.
- 주요 액션 hit area는 44×44 CSS px 이상을 목표로 한다.
- **`sm`(24)은 44px 최소 타깃에 시각 크기로 미달한다 — `.louis-hit-target`이 이를 덮는다.**
  Button은 크기와 무관하게 항상 그 클래스를 달고(`button.tsx`), 그 `::after`가
  `max(100%, layout-control-hit-target-minimum)`으로 타깃을 44까지 넓힌다. 시각 크기와 hit
  area의 분리는 사다리 전체의 계약이지만 이 칸에서 그 차이가 가장 커서, 타깃이 시각 상자
  위아래로 **10px씩** 튀어나온다(`lg`는 2px, `md`는 6px). 도구 줄에서 `sm` 버튼을 세로로 쌓을
  때 간격을 20px 아래로 두면 인접 타깃이 겹친다 — Dialog가 액션 사이를 `space-control-sm`으로
  벌려 둔 것과 같은 형태의 함정이다. **이것은 해결된 문제가 아니라 호출부가 지켜야 하는 조건이다.**
- `aria-disabled`를 사용하면 click과 keyboard activation을 모두 명시적으로 차단한다.

## Acceptance tests

- pointer click, Enter, Space가 각각 정확히 한 번 실행된다.
- disabled와 loading에서 모든 activation 경로가 차단된다.
- loading 시작·완료 시 accessible name과 focus가 예측 가능하다.
- light/dark/high contrast에서 focus-visible이 보인다.
- KO/EN/JA 긴 라벨, 200% zoom, 320px container에서 핵심 텍스트가 사라지지 않는다.
- reduced-motion에서 active/loading 의미가 유지된다.
- **아이콘 유무로 높이가 달라지지 않는다.** 세 크기 모두에서 `leftIcon`/`rightIcon`을 준 버튼과
  주지 않은 버튼의 높이가 같다.
- **`sm`에서 시각 높이가 24이고 hit target은 44 이상이다.**
- **타이포가 갈라지는 칸은 `sm` 하나다** — `lg`·`md`는 14/21, `sm`은 12/18.
- 구조값이 [`figma/components.measured.json`](../../figma/components.measured.json)과 일치한다.

## Implementation

- Web source: `packages/react/src/button/button.tsx`
- CSS recipe: `packages/css/src/component/button.css`
- Public import: `import { Button } from "@klipse-design/react"`
- Tests: `packages/react/test/button.browser.test.tsx` (실브라우저 11건)
- Figma component: library draft의 `Button` set (40 variant, publish 전)

### 코드 prop ↔ Figma property

| 코드 | Figma | 비고 |
| --- | --- | --- |
| `variant` | `Variant` (primary/secondary/ghost/danger/danger-secondary/inverse) | 옵션 집합을 parity 게이트가 `ButtonVariant`와 대조한다. 여섯으로 일치한다 |
| `size` | `Size` (lg/md/sm) | `ButtonSize`와 대조한다. 셋으로 일치한다 |
| `loading` | `State=Loading` | boolean prop이 Figma에서는 state variant다 |
| `disabled` | `State=Disabled` | 같은 이유 |
| — | `State=Hover`, `State=Active` | 코드에서는 CSS 상태다. Figma에 CSS 상태가 없어 variant로 둔다 |
| `children` | Label 텍스트 | |

Figma component의 모든 fill·stroke는 변수에, 모든 텍스트는 text style에 바인딩된다(raw 값 0).
focus-visible 링은 브라우저가 그리므로 Figma variant로 두지 않는다.

활성화는 네이티브 `<button>`에 맡긴다. pointer click, Enter, Space가 각각 정확히 한 번 실행되는 것은
브라우저가 보장하며, keydown으로 클릭을 흉내 내면 중복 실행이 된다.

`loading`은 네이티브 `disabled`를 쓰지 않는다. 네이티브 disabled는 현재 focus를 제거하는데 규범이
이를 금지하기 때문이다. 대신 `aria-disabled`로 표시하고 activation을 명시적으로 막는다. 검증은 두
층으로 한다 — 실제 포인터는 actionability에서 차단되고, 프로그램적 click과 keyboard는 컴포넌트가
막는다.

## Specification

구조값은 [`figma/components.measured.json`](../../figma/components.measured.json)이 정본이고 실제
브라우저 측정으로 고정된다. 코드가 이 값을 만드는지는
`packages/react/test/component-geometry.browser.test.tsx`가, Figma가 이 값과 같은지는 parity
게이트가 매 실행 검증한다.

| 항목        | lg                                  | md                                  | sm                                  |
| ----------- | ----------------------------------- | ----------------------------------- | ----------------------------------- |
| 높이        | `layout-control-height-lg` 40px     | `layout-control-height-md` 32px     | `layout-control-height-sm` 24px     |
| 최소 폭     | `layout-control-minimum-width-md` 48px | `layout-control-minimum-width-md` 48px | `layout-control-minimum-width-md` 48px |
| padding     | 0 / `space-control-lg` 16px         | 0 / `space-control-md` 12px         | 0 / `space-control-sm` 8px          |
| padding (아이콘 쪽) | 14px                        | 10px                                | 6px                                 |
| gap         | `space-control-xs` 4px              | `space-control-xs` 4px              | `space-control-xs` 4px              |
| 헤어라인 (secondary만, inset) | `border-width-hairline` 0.5px | `border-width-hairline` 0.5px | `border-width-hairline` 0.5px |
| radius      | `radius-control` 12px               | `radius-control` 12px               | **`radius-control-sm` 8px**         |
| 타이포      | `body-sm-medium` 14px / 21px        | `body-sm-medium` 14px / 21px        | **`caption-medium` 12px / 18px**    |
| spinner     | 18px (`1em` + border 2)             | 18px (`1em` + border 2)             | 16px (`1em` + border 2)             |
| 아이콘 슬롯 | `icon-size-sm` 16px                 | `icon-size-sm` 16px                 | `icon-size-sm` 16px                 |

**열 이름은 [DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)과
[DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)의 사다리다 —
`lg`(40) · `md`(32) · `sm`(24).** 2026-08-30까지 이 표는 DS-D-0027 이전 이름(`md` 40 · `sm` 32)을
달고 있어서, 같은 문서 안에서 `md`가 40과 32 두 값을 뜻했다. 이름을 옮기면서 세 행이 정본
([`figma/components.measured.json`](../../figma/components.measured.json))과 어긋나 있던 것도 함께
맞췄다 — 최소 폭은 **세 크기 모두** 48이고(`button.css`의 세 칸 모두 `min-inline-size`를 준다),
gap과 아이콘 슬롯도 세 크기가 같은 값이다(`column-gap`은 셋 다 `space-control-xs`, 슬롯은 셋 다
`icon-size-sm` 16 — 버튼이 32 단일이던 시절의 결정이 `lg`에도 그대로 남아 있다).

### `sm` 열의 값은 어디서 왔나

**높이 24만 [DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)가 준다.**
나머지는 근거를 값마다 남긴다. 실측 출처는 Figma `OlYKERKOkgbxBEEoXGZW2c` Page 14 프레임
`1087:2383`(비디오에디터)의 「가져오기」 버튼 `1087:2429`이며, 그 자리가 이 문서에서 `sm` Button에
해당하는 유일한 자리다.

| 값 | 근거 | 상세 |
| --- | --- | --- |
| padding 8 | **실측 + 비례가 일치** | `1087:2429`의 padding-inline이 8이다. 사다리 비례(lg 16 → md 12 → sm 8, 높이가 8 내려갈 때 여백이 4 내려간다)로도 같은 값이 나온다 |
| radius 8 | **실측** | `1087:2429`의 `cornerRadius`가 8이다. `lg`·`md`의 `radius-control` 12를 24 높이에 그대로 쓰면 곡률이 높이의 절반이라 알약으로 읽힌다. 8은 `radius-control-sm`으로 이미 있는 이름이다 — tooltip·slider·project-card가 쓴다 |
| 타이포 12/18 | **실측** | `1087:2429`의 텍스트가 Pretendard Medium 12 / 150%다. `caption-medium`과 크기·굵기·행 높이가 일치한다. 14/21을 24에 넣으면 위아래 여유가 1.5px씩뿐이고 12/18이면 3px씩 남는다 |
| padding (아이콘 쪽) 6 | **기존 규칙** | 보정폭은 칸마다 비례하지 않고 상수 2px이다(`lg` 16→14, `md` 12→10). 8 − 2 = 6으로 2px 격자 위에 남는다 |
| 최소 폭 48 | **기존 사다리** | 칸별 최소 폭이라는 축은 이 시스템에 없다 — `lg`·`md`가 같은 `control-minimum-width-md`를 읽는다(DS-D-0032). 실측한 「가져오기」가 58이라 이 바닥에 닿지도 않는다 |
| gap 4 | **기존 사다리** | **재지 않았다.** 디자인의 그 자리에 아이콘이 없어 잴 것이 없었다. 사다리가 gap을 나눈 적이 없어 `lg`·`md` 공통값을 잇는다 |
| 아이콘 슬롯 16 | **기존 사다리** | **재지 않았다.** 같은 이유다. 16은 라벨 행 높이 18보다 작아 아이콘이 붙어도 높이가 24에서 자라지 않는다 |
| spinner 16 | **파생** | `1em` + `border-width-ring` 2 × 2. 폰트 크기를 따라가므로 12 → 16이 자동으로 나온다. CSS에 새 규칙이 없다 |

**타이포의 letter-spacing만 실측과 갈린다.** 디자인 파일은 −2%(−0.24px)를 쓰고 LOUIS의
`caption-medium`은 −1%(−0.12px)다. 이것은 `sm` 축의 문제가 아니라 그 Figma 파일 전체가 −2%를
쓰는 것이며, `lg`·`md`가 읽는 `body-sm-medium`도 같은 −1% 규칙 위에 있다. **스케일을 따르고
실측을 채택하지 않았다** — 한 칸만 자간 규칙을 벗어나면 그 규칙이 규칙이 아니게 된다.

**base에는 stroke가 없다.** 위 헤어라인 행은 `secondary` variant에만 적용된다 — `border-width-hairline`
0.5px 두께의 `color-stroke-hairline` 색을 CSS `border`가 아니라 inset box-shadow로 그린다
([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)).

**이 값들은 제품 배포 코드에서 채택한 것이다.** 근거와 채택/편차 판정은
[`migration/product.measured.json`](../../migration/product.measured.json)에 있고 게이트가 매 실행
확인한다.

두 가지가 제품과 다르고 사유가 그 파일에 적혀 있다.

- **높이가 `height`가 아니라 `min-block-size`다.** 일반 라벨에서는 제품과 정확히 같은 40/32가
  나오고, KO/EN/JA 긴 라벨이나 200% 확대에서는 잘리는 대신 자란다. 제품은 `nowrap`이라 그 경우
  라벨이 넘친다.
- **타이포가 `lg`·`md` 사이에서는 size 축이 아니다.** 제품과 같이 둘 다 14px/21px를 쓴다.
  이전 DS는 작은 쪽에서 caption 12px로 줄여 제품과 달랐다. **`sm`은 예외이며 12px/18px다** —
  제품에 대응하는 자리가 없고(제품에 24 컨트롤이 없다) 디자인이 12를 재서 준다. 「size가 글자
  크기를 바꾸지 않는다」는 제품에서 채택한 두 칸 사이의 사실이지, 사다리 전체의 규칙이 아니다.

아이콘이 붙은 쪽은 padding을 2px 줄인다(`lg` 16→14, `md` 12→10, `sm` 8→6). 아이콘의 자체 시각
여백 때문에 텍스트-only 대비 그 쪽이 넓어 보이는 것을 보정하는 것이며 `lg`·`md`는 제품과 같다.
2026-08-30까지 이 문장은 DS-D-0027 이전 이름으로 `md 16→14, sm 12→10`이라 적혀 있었다 — `sm`이
실재하는 값을 갖게 된 지금 그 이름은 **있는 크기를 틀린 값으로** 가리킨다.

## Known deviations

> **제품 좌표에 `@a3ed8e03` 이 붙은 항목은 과거 배포본을 가리킨다.** 제품 `components/ui/Button.tsx`
> 는 그 뒤 LOUIS 를 채택했다 — 배포본 `df414c24` 에서 그 파일은 **69줄**이고 `.louis-button` ·
> `.louis-focus-ring` 과 `data-variant` / `data-size` / `data-left-icon` / `data-right-icon` 만 건다.
> 아래에 「제품 실측」으로 적힌 값 중 그 파일이 소유하던 것(글래스 3겹 · variant 별 disabled 알파 ·
> 원 팔레트 라벨색)은 **지금 제품에 없다.** 좌표를 지우지 않고 커밋에 묶어 두는 것은, 그 값이
> 실재했다는 것과 무엇이 없어졌는지를 함께 남기기 위해서다. 값이 사라진 것과 처음부터 없었던 것은
> 다른 사실이다.

- **`danger` variant가 tonal이다.** solid danger를 표현할 `color-accent-danger*` 토큰이 아직 없어
  `color-bg-danger`·`color-fg-danger`로 대체했다. `DS-P3-014` 단위 9가 토큰을 추가하면 갱신한다.
  Button은 foreground와 background를 **쌍으로** 쓰므로 대비가 성립한다. 같은 토큰을 텍스트 색으로만
  쓰면 중립 표면에서 무너지는데, 그 실측은 [Menu / Popover](menu-popover.md)의 Known deviations에 있다.
- **고정 높이가 없다.** 높이를 padding과 line-height로 결정하고 44px 타깃은 `louis-hit-target`이
  보장한다. 제품과 픽셀 단위로 맞추려면 control height 토큰이 필요하다(DS-P3-014).
- **네 variant 전부 WCAG AA에 미달한다 — owner 가 받아들인 값이다.** owner 가 제품의 공용
  Button 을 정본으로 채택했고, 그 제품 Button 이 네 variant 모두 4.5 에 못 미친다. axe 실측값이다.
  2026-08-27 에 랜딩 전 요소를 다시 재면서 `primary` 의 수를 특정했다 — 흰 글자(`#fafafa`)가
  브랜드 블루(`#0088ff`) 위에서 **3.37:1** 이다. 14px medium 이라 본문 기준 4.5 가 적용되고,
  큰 글자 기준 3:1 은 넘는다. 4.5 를 넘기려면 브랜드 블루를 **`#0072d6`**(명도 −16%)까지
  내려야 한다.
  **owner 판단: 브랜드색을 유지하고 이 편차를 받아들인다.** 다시 제안하지 않는다 — 접근성
  감사에서 지적되면 그때 브랜드와 함께 다시 본다.

  | variant | 전경 | 배경 | 대비 |
  | --- | --- | --- | --- |
  | `primary` | `#fafafa` | `#0088ff` | **3.37** |
  | `secondary` | `#777d89` | 흰 배경 | **4.13** |
  | `ghost` | `#777d89` | 흰 배경 | **4.13** |
  | `danger` | `#fafafa` | `#ff4b59` | **3.14** |
  | `danger-secondary` | `#ff4b59` | red 12% 알파 | **2.54 ~ 3.27** (`bg-raised` 다크에서 **1.93**) |

  `danger-secondary`의 미달은 위 셋과 성격이 다르다 — **고를 수 있었는데 고른 것이다.**
  2026-09-01에 `bg-danger`+`fg-danger-on-surface`(라이트 5.32 · 다크 5.31, 통과)로 먼저 세웠고,
  소유자가 제품 어드민이 쓰던 레드 알파 디자인(`ADMIN_BUTTON_DANGER_SOFT`)으로 뒤집었다.
  올리려면 라벨을 `fg-danger-on-surface`로 되돌리는 것이 그 축이다. 실효값은 면마다 다르다 —
  다이얼로그 면 라이트 2.73 · 다크 3.27, 어드민 카드 바닥 라이트 2.54, `bg-raised` 다크 1.93.

  Figma의 `danger-secondary` 60칸은 `danger` 60칸을 복제해 만들었다(2026-09-01). Disabled는
  복제 그대로 `bg-inset`·`fg-disabled`다 — CSS와 같다. **Hover는 Figma가 Default와 같은 칸이다.**
  CSS의 hover(면 한 단 진하게)를 Figma가 모델링하지 않기 때문인데, `danger`의 `opacity: 0.85`도
  전부터 같아서 새로 생긴 어긋남이 아니다. `figma/snapshot.json`의 Button 항목(variantCount 300)은
  이 변경 전 되읽기라 낡았다 — snapshot은 손으로 고치지 않는 evidence이므로 다음 전수 캡처에서
  갱신한다.

  이 미달은 제품이 이미 갖고 있는 것이고 DS가 그것을 그대로 재현한다. 해소하려면 면을 어둡게
  하거나(primary는 `blue.700` 6.12, secondary는 `neutral.700` 6.35) 라벨을 18.66px bold 이상으로
  키워야 하며 둘 다 브랜드 판정 대상이다. 같은 사유가 token source의 `contrastPairs[].note`,
  axe 테스트의 허용 목록, `migration/product.measured.json`에 있다.
- **아이콘 슬롯 크기를 Button이 소유한다.** [Iconography](../foundations/iconography.md)는 글리프
  크기를 아이콘이 소유한다고 하지만, 슬롯에 크기를 두지 않으면 호출부가 넘긴 아이콘 크기가 그대로
  버튼 높이가 된다. sm에 기본(20px) 아이콘을 넣으면 높이가 28이 아니라 **30**이 됐고, 같은 줄의
  버튼들이 아이콘 유무로 어긋났다. 높이가 호출부에 따라 달라지는 것은 컨트롤이 아니므로 슬롯을
  md 20 / sm 16으로 고정하고 글리프를 슬롯에 맞춘다. 컨테이너 크기는 컨트롤이 소유한다는 같은
  문서의 규칙과는 어긋나지 않는다.

- **앞의 대비표는 앱 셸 밖의 값이다.** 사이드바가 있는 화면의 라이트에서 `secondary`·`ghost`의 라벨색은
  `#777d89`가 아니라 **`#9aa0ab`**다. 제품 Button이 시맨틱을 거치지 않고 `text-palette-gray-600` 원
  팔레트를 직접 읽고(`Button.tsx@a3ed8e03:104`·`:115`), `gnb-wrapperSidebar`가 `html[data-theme=light] body:has(&)`로
  그 이름을 `#9aa0ab`로 덮는다(`Gnb.tsx:2041`, rgb 미러 `:2048` = `154 160 171`; 전역 정의는
  `globals.css:39`). 셀렉터가 `body:has(&)`라 **버튼이 사이드바 안에 있든 밖에 있든 화면 전체에 걸린다.**
  재매핑 범위는 라벨까지다 — 테두리 `1px solid rgb(23 27 34 / 12%)`와 hover 면은 `--palette-gray-900-rgb`를
  읽는데 그 이름은 재매핑 대상이 아니라 전역과 같다. 앱 셸 실면 위 계산 대비는 카드 `#f8f8f9` 위 ≈2.5,
  페이지 바닥 `#eeeef1` 위 ≈2.3으로 **표의 4.13보다 더 낮다.** 앱 셸 화면의 대비를 4.13으로 읽으면 틀린다.
  램프 자체는 [App Shell Parts](app-shell-parts.md)의 Known deviations가 소유하고, DS는 이 런타임 스코프를
  토큰 축으로 표현하지 않는다.
- **제품 `primary`의 글래스 3겹을 재현하지 않는다.** owner 결정이다 — 이 디자인 시스템에 글래스 섀도우
  개념을 두지 않고, 면도 3-stop 그라디언트 대신 flat으로 간다. 제품의 실제 구성은 아래 세 겹이다.

  | 겹 | 제품 값 | 근거 |
  | --- | --- | --- |
  | 면 | `linear-gradient(90deg, var(--primary-450) 0%, var(--primary-500) 50%, var(--primary-450) 100%)` | `Button.tsx@a3ed8e03:89` · `globals.css:481-486` |
  | 베벨 페어 (요소 자신의 `box-shadow`) | `inset 0 1px 1px rgb(250 250 250 / 25%), inset 0 -1px 1px rgb(250 250 250 / 25%)` | `Button.tsx@a3ed8e03:91` · `globals.css:26`·`:46` |
  | 글로우 (별도 `::before`) | `inset 0 0 8px 0 rgb(250 250 250 / 100%)` + `mix-blend-mode: overlay` + `pointer-events: none` | `Button.tsx@a3ed8e03:93-96` |

  **글로우를 베벨과 같은 `box-shadow` 목록에 합치면 틀린다.** 합치는 순간 `mix-blend-mode`를 걸
  자리가 없어 흰 테가 그대로 뜬다 — 글로우가 별도 `::before`인 이유가 이것이다. 두 레이어 모두
  `transform: translateZ(0)`으로 합성 승격되고(`Button.tsx@a3ed8e03:92`·`:96`), 같은 베벨 페어가 `danger`에도
  있다(`Button.tsx@a3ed8e03:126`). 제거 결정과 그때 함께 지운 토큰(`shadow`/`elevation`의 `control-bevel`·
  `control-gloss`)은 [`updates/README.md`](../updates/README.md)가, 같은 결정의 컴포넌트 쪽 기록은
  [Toast](toast.md)가 소유한다. **이 표는 Figma 재조립용 제품 실측이지 DS 계약이 아니다.**
- **disabled를 요소 전체 opacity가 아니라 색 교체로 표현한다.** 제품은 variant마다 다른 불투명도 하나로
  끝낸다 — `primary` 0.35(`Button.tsx@a3ed8e03:99`) · `secondary` 0.45(`:107`) · `ghost` 0.5(`:118`) ·
  `danger` 0.4(`:129`). 색·배경·테두리를 다시 선언하지 않고 커서만 ROOT 공통으로
  `disabled:cursor-not-allowed`다(`:46`). DS는 대신 전경을 `#9AA0AB`로, `primary`·`danger` 배경을
  `#EAEBEE`로, `secondary` 테두리를 `#E3E4E8`로 바꾼다. **제품 값을 그대로 옮기면 `primary`의 흰
  라벨이 사실상 보이지 않는다** — 제품은 `#fafafa` 라벨에 0.35를 그대로 곱한다. 판정은
  [`migration/product.measured.json`](../../migration/product.measured.json)의 「disabled 표현」 축에
  accepted-deviation으로 있다.
- **노드 캔버스 중립 버튼의 면 색이 LOUIS에 없다.** 제품은 노드 카드에 붙는 보조 버튼용으로 별도 SSOT
  토큰군 `--node-chrome-btn-*`를 둔다(`globals.css:528-554`, 라이트 덮어쓰기 `:567-573`).

  | 토큰 | 값 | LOUIS `md` 대비 |
  | --- | --- | --- |
  | `--node-chrome-btn-h` | `32px` (`globals.css:542`) | 같다 (`layout-control-height-md`) |
  | `--node-chrome-btn-padding-x` | `10px` (`:543`) | 텍스트-only `md` 12px와 다르고 **아이콘 동반 `md` 10px와 같다**. 제품은 아이콘 유무와 무관하게 10 고정 |
  | `--node-chrome-btn-radius` | `12px` (`:544`) | **같은 값이 아니라 그 토큰 자체다** — `var(--louis-radius-control)` |
  | `--node-chrome-btn-gap` | `4px` (`:547`) | **같은 값이 아니라 그 토큰 자체다** — `var(--louis-space-control-xs)` |
  | `--node-chrome-btn-bg` | 다크 `#777d89` (`:548`) / 라이트 `#f1f1f3` (`:568`) | **대응 토큰 없음** |
  | ~~`--node-chrome-btn-border`~~ | **제품에 없다.** 테두리 토큰은 폐지됐고 알약은 `[box-shadow:var(--louis-hairline-inset)]`을 직접 얹는다(`ImageNode.tsx:641`) | 이제 LOUIS 정본을 그대로 쓴다 |
  | `--node-chrome-btn-bg-hover` | 다크 `color-mix(in srgb, var(--palette-gray-000) 8%, var(--node-chrome-btn-bg))` (`:550-554`) / 라이트 `--palette-gray-1000` 5% (`:569-573`) | **없음** |

  대상은 메타 툴바 알약(모델·길이·볼륨·비율), 메타 아이콘 버튼, 카드 헤더 액션(다운로드·삭제), 업로드
  노드 툴바 버튼이다(`globals.css:530-532`). 프라이머리 그라디언트 버튼(생성 FAB·`processButton`·
  `uploadPillButton`)과 세그먼트 컨트롤은 비대상이고 각자 고유 크롬을 갖는다(`:533-534`).
  **토큰군 전부를 쓰는 소비처는 없다**(`:536-537`) — 헤더 액션은 치수만 쓰고 면은 투명 + hover
  틴트이며(`NodeHeaderActions.tsx:36-37`), 아이콘 전용 버튼은 정사각이라 `-padding-x`를 쓰지 않는다.
  면과 헤어라인을 전부 쓰는 대표 소비처는 메타 툴바 알약이다(`ImageNode.tsx:638-652`). 치수 축은 LOUIS
  `md`로 그대로 재현되지만 **면 색 두 쌍이 없어 노드 카드 내부 버튼을 LOUIS만으로 칠할 수 없다.**
- **제품의 결과 화면 액션은 전폭 앵커다.** 결제 결과 화면의 두 액션(`billing-success/page.tsx:136-146`
  primary · `:148-158` secondary)은 높이 32px · padding `0 12px` · radius 12px까지 `md`와 같고
  **세 축이 다르다.**

  | 축 | LOUIS `md` | 제품 결과 화면 액션 |
  | --- | --- | --- |
  | 폭 | 내용 폭 (고정 폭 없음) | `width: 100%` (`:137`·`:149`) |
  | 타이포 | `body-sm-medium` 14px / 21px | 14px **regular** — `--type-body-14-size` + `--type-weight-regular` 400 (`:139`·`:151`; 토큰 정의 `globals.css:318`·`:284`) |
  | 렌더 요소 | 네이티브 `<button>` | `next/link`의 `<a>` + `text-decoration: none !important` |

  **높이와 padding은 다른 축이 아니다.** 2026-08-30까지 이 자리는 「높이 40px … 네 축이 다르다」와
  padding 행 `0 / 20px`을 적고 있었는데, 배포본은 `h-16 py-0 px-6`(`--spacing: 2px` 기준 32px ·
  0 12px)이라 `button-height-md` 32 · `button-padding-inline-md` 12와 같은 값이다. 20px은 LOUIS
  어디에도 없는 값이었다.

  **이 화면 라벨의 굵기는 [Status Result](../patterns/status-result.md) 패턴이 소유한다** — 그
  문서의 「버튼 글자 `body-14` · `--type-weight-regular`」 행이 정본이고, 위 표의 `body-sm-medium`은
  **컴포넌트 기본값**이다. 결과 화면은 컴포넌트를 쓰지 않으므로 둘은 충돌이 아니라 서로 다른 소유
  범위다. Figma의 결과 화면 보드는 패턴 쪽(regular)을 따른다.

  **컨테이너의 gap은 가로가 아니라 세로 간격이다.** 컨테이너는 `display:flex; flex-wrap:wrap;
  gap:10px; margin-top:8px`이지만(`:134`) 자식이 전폭이라 **wrap 컨테이너 안에서도 절대 나란히 서지
  않고 각자 한 줄을 차지한다.** 10px은 row-gap으로만 읽힌다. Figma에서 가로 2열 `md` 버튼으로 그리면
  구현과 완전히 다르다. DOM 순서는 secondary(뒤로) → primary(진행)다(`:500-518`). 상태
  값(`:141-146`·`:153-158`)은 전환 `background-color 140ms ease, transform 120ms ease, opacity 140ms ease`
  공통에, primary는 면 `--gray-000` → hover 90% → active 82% · 글자 `--gray-900`, secondary는 면 페이퍼
  8% → hover 14% → active 18% · 글자 `--gray-000`이고 둘 다 active에서 `scale(0.98)`이다. `!important`가
  필요한 이유는 레이어 **밖** 전역 `a { color: inherit; text-decoration: none }`가 `@layer utilities`를
  무조건 이기기 때문이다(`globals.css:988-991`).
- **인증 화면 버튼은 대부분 넘어왔다 — 남은 것은 상태 카드의 secondary 하나다.** 이 항목은 원래
  「어떤 인증 화면도 공용 Button을 import 하지 않는다」였는데 **그 명제가 뒤집혔다.** 배포본
  `df414c24` 에서 로그인 제출 CTA 는 LOUIS `Button` 이고(`login/page.tsx:542-554`,
  `variant="inverse" size="lg"`), 비밀번호 재설정의 상태 카드 primary 도 그렇다
  (`reset-password/page.tsx:220`). 그래서 그 둘의 라벨은 이제 LOUIS 의 `body-sm-medium` 14/21 이고,
  아래에 적힌 48px 고정·16px 라벨은 **채택 전 값**이다
  (`login/page.tsx@a3ed8e03:206-211` · `:594-596`).

  남은 어긋남은 하나다 — 상태 카드의 **secondary** 는 `/login` 으로 가는 `<Link>` 라 버튼 요소가
  아니고, 아직 손으로 짠 알약이다: 전폭 **48px 최소**(`min-h-24`) · 패딩 `0 18px` · `rounded-12` ·
  라벨 `type-body-16-medium` **16px**(`reset-password/page.tsx:61-66` 정의 · `:245` 적용).
  **고정과 최소를 같은 것으로 읽으면 틀린다** — 넘어간 두 자리는 고정 48 이었고 이 자리는 최소다.

  **아래 피드백 어휘는 채택 전(`a3ed8e03`) 값이다.** 넘어간 두 자리의 hover·press·disabled 는 이제
  LOUIS `.louis-button` 이 소유하고, 남은 secondary 만 여기 적힌 대로다.
  **이 버튼들의 피드백 어휘는 filter와 scale이 전부다.** 제출 버튼은 hover
  `saturate(125%) brightness(125%)` · press `saturate(150%) brightness(150%)` + `scale(0.98)`이고
  (`login/page.tsx:213-218`), 상태 카드 primary는 hover `saturate(118%) brightness(110%)` ·
  press `scale(0.99)`다(`reset-password/page.tsx:63-64`). **비활성이 호버와 누름을 이긴다** — 이 둘은
  disabled에서 `opacity: .5` · `cursor: not-allowed`이고 filter와 transform을 `none`으로
  되돌린다(`login/page.tsx:220-223` · `reset-password/page.tsx:65-66`). 상태 카드 secondary만 이 분기가
  아예 없다 — 면 페이퍼 8% → hover 12%가 전부이고 항상 `/login`으로 가는 `<Link>`라 disabled 상태를
  갖지 않는다. 대신 `text-gray-000!` · `no-underline!`가 필요하다 — 앞 항목의 레이어 밖 전역 `a` 규칙
  때문이다.

- **문의 화면만 공용 Button의 높이를 덮는다 — 40px이 아니라 44px이다.** `/inquiry`의 제출 버튼은
  `variant="primary"`로 공용 Button을 그대로 쓰면서 `w-full h-[44px]! mt-4`를 얹는다
  (`inquiry/InquiryClient.tsx:337`). **`!`는 장식이 아니다** — 높이를 정하는 `--button-height`가
  `@layer` 안에 있어 유틸리티만으로는 이기지 못하고, 원본 모듈 CSS 시절 이기던 선언을 그대로 고정한
  것이다. 나머지 primary 사양(곡률 12px · 그라디언트 면 · 글래스 베벨 · hover `brightness(1.06)` ·
  active `scale(0.98)` · disabled `opacity .35`)은 전부 공용 그대로다.

  **이 44px을 컨트롤 계단의 새 단으로 읽으면 틀린다.** 계단은 여전히 40/32px이고, 이것은 한 화면이
  높이 축 하나만 덮은 예외다. 같은 폼 안의 이메일 인풋은 `min-h-[44px]`(`:314`)로 **고정이 아니라
  최소**라 두 값이 우연히 같을 뿐 성질이 다르다 — 인증 화면의 48px 고정 대 최소와 같은 함정이다.
  LOUIS는 소비처가 컨트롤 높이를 덮는 경로를 갖고 있지 않다. 이 자리를 옮기려면 높이를 노출하는
  API를 세우거나 예외로 남기는 판정이 필요하다.

## 승격 조건

Web `done`과 `stable`에는 다음이 남아 있다.

- visual regression fixture (hosted CI 확보 후, DS-D-0005 2단계)
- 수동 keyboard·screen-reader review 기록
- SSR render와 hydration 검증
- published Figma component와 parity report (DS-F-006)
- 두 개 이상의 제품 사용처
