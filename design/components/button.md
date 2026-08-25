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
| Figma         | `partial`      | library draft의 component set 40 variant와 parity 대조 통과; publish 전 |
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

링크 이동이 목적이면 클릭으로 navigation을 흉내 내지 말고 Link primitive를 사용한다.

## Anatomy

1. Root — 네이티브 `<button>`과 hit area
2. Left icon — 선택 사항, 장식이면 보조 기술에서 숨김
3. Label — 결과를 설명하는 텍스트
4. Right icon — 선택 사항, 장식이면 보조 기술에서 숨김
5. Progress indicator — loading일 때 label 의미와 함께 제공

## Properties

| Prop         | 값                                        | 기본값    | 설명                                            |
| ------------ | ----------------------------------------- | --------- | ----------------------------------------------- |
| `variant`    | `primary`, `secondary`, `ghost`, `danger` | `primary` | 강조와 의미                                     |
| `size`       | `md`, `sm`                                | `md`      | 시각 크기; hit area 계약은 별도 유지            |
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

근거: `Button.tsx:82-83`(scale 상수) · `:105`·`:110`(secondary) · `:116`·`:120`(ghost) ·
`globals.css:40`·`:51`(기준색).

**알파 표기법이 계약이다.** 제품은 `rgb(var(--x-rgb) / 5%)` 임의값을 쓰고 Tailwind의 `/5` 단축을
쓰지 않는다 — 단축은 `color-mix()`로 컴파일돼 **결과 색이 달라진다.** 파일 주석이 그 이유를 적어
두었다.

**남은 판정.** `ghost` 라이트 8%는 [App Shell Parts](app-shell-parts.md)가 이미
`color-accent-ghost-hover`의 잉크 8%로 적어 둔 값과 같다. `secondary`의 5%에 대응하는
`color-accent-secondary-hover` 토큰은 **아직 없다** — 추가 여부가 판정 대상이고 그때까지는 위
실측값을 정본으로 둔다.

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
- `aria-disabled`를 사용하면 click과 keyboard activation을 모두 명시적으로 차단한다.

## Acceptance tests

- pointer click, Enter, Space가 각각 정확히 한 번 실행된다.
- disabled와 loading에서 모든 activation 경로가 차단된다.
- loading 시작·완료 시 accessible name과 focus가 예측 가능하다.
- light/dark/high contrast에서 focus-visible이 보인다.
- KO/EN/JA 긴 라벨, 200% zoom, 320px container에서 핵심 텍스트가 사라지지 않는다.
- reduced-motion에서 active/loading 의미가 유지된다.
- **아이콘 유무로 높이가 달라지지 않는다.** md·sm 모두에서 `leftIcon`/`rightIcon`을 준 버튼과
  주지 않은 버튼의 높이가 같다.
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
| `variant` | `Variant` (primary/secondary/ghost/danger) | 옵션 집합을 parity 게이트가 `ButtonVariant`와 대조한다 |
| `size` | `Size` (md/sm) | `ButtonSize`와 대조한다 |
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

| 항목        | md                                  | sm                                  |
| ----------- | ----------------------------------- | ----------------------------------- |
| 높이        | `layout-control-height-md` 40px     | `layout-control-height-sm` 32px     |
| 최소 폭     | 없음                                | `layout-control-minimum-width-sm` 48px |
| padding     | 0 / `space-control-lg` 16px         | 0 / `space-control-md` 12px         |
| gap         | `space-control-sm` 8px              | `space-control-xs` 4px              |
| 헤어라인 (secondary만, inset) | `border-width-hairline` 0.5px | `border-width-hairline` 0.5px |
| radius      | `radius-control` 12px               | `radius-control` 12px               |
| 타이포      | `body-sm-medium` 14px / 21px        | `body-sm-medium` 14px / 21px        |
| spinner     | 18px (`1em` + border 2)             | 18px (`1em` + border 2)             |
| 아이콘 슬롯 | `icon-size-md` 20px                 | `icon-size-sm` 16px                 |

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
- **타이포가 size 축이 아니다.** 제품과 같이 md·sm 모두 14px/21px를 쓴다. 이전 DS는 sm에서
  caption 12px로 줄여 제품과 달랐다.

아이콘이 붙은 쪽은 padding을 2px 줄인다(md 16→14, sm 12→10). 아이콘의 자체 시각 여백 때문에
텍스트-only 대비 그 쪽이 넓어 보이는 것을 보정하는 것이며 제품과 같다.

## Known deviations

- **`danger` variant가 tonal이다.** solid danger를 표현할 `color-accent-danger*` 토큰이 아직 없어
  `color-bg-danger`·`color-fg-danger`로 대체했다. `DS-P3-014` 단위 9가 토큰을 추가하면 갱신한다.
  Button은 foreground와 background를 **쌍으로** 쓰므로 대비가 성립한다. 같은 토큰을 텍스트 색으로만
  쓰면 중립 표면에서 무너지는데, 그 실측은 [Menu / Popover](menu-popover.md)의 Known deviations에 있다.
- **고정 높이가 없다.** 높이를 padding과 line-height로 결정하고 44px 타깃은 `louis-hit-target`이
  보장한다. 제품과 픽셀 단위로 맞추려면 control height 토큰이 필요하다(DS-P3-014).
- **네 variant 전부 WCAG AA에 미달한다.** owner가 제품의 공용 Button을 정본으로 채택했고,
  그 제품 Button이 네 variant 모두 4.5에 못 미친다. axe 실측값이다.

  | variant | 전경 | 배경 | 대비 |
  | --- | --- | --- | --- |
  | `primary` | `#fafafa` | `#0088ff` | **3.37** |
  | `secondary` | `#777d89` | 흰 배경 | **4.13** |
  | `ghost` | `#777d89` | 흰 배경 | **4.13** |
  | `danger` | `#fafafa` | `#ff4b59` | **3.14** |

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
  팔레트를 직접 읽고(`Button.tsx:104`·`:115`), `gnb-wrapperSidebar`가 `html[data-theme=light] body:has(&)`로
  그 이름을 `#9aa0ab`로 덮는다(`Gnb.tsx:1978`, rgb 미러 `:1985` = `154 160 171`; 전역 정의는
  `globals.css:33`). 셀렉터가 `body:has(&)`라 **버튼이 사이드바 안에 있든 밖에 있든 화면 전체에 걸린다.**
  재매핑 범위는 라벨까지다 — 테두리 `1px solid rgb(23 27 34 / 12%)`와 hover 면은 `--palette-gray-900-rgb`를
  읽는데 그 이름은 재매핑 대상이 아니라 전역과 같다. 앱 셸 실면 위 계산 대비는 카드 `#f8f8f9` 위 ≈2.5,
  페이지 바닥 `#eeeef1` 위 ≈2.3으로 **표의 4.13보다 더 낮다.** 앱 셸 화면의 대비를 4.13으로 읽으면 틀린다.
  램프 자체는 [App Shell Parts](app-shell-parts.md)의 Known deviations가 소유하고, DS는 이 런타임 스코프를
  토큰 축으로 표현하지 않는다.
- **제품 `primary`의 글래스 3겹을 재현하지 않는다.** owner 결정이다 — 이 디자인 시스템에 글래스 섀도우
  개념을 두지 않고, 면도 3-stop 그라디언트 대신 flat으로 간다. 제품의 실제 구성은 아래 세 겹이다.

  | 겹 | 제품 값 | 근거 |
  | --- | --- | --- |
  | 면 | `linear-gradient(90deg, var(--primary-450) 0%, var(--primary-500) 50%, var(--primary-450) 100%)` | `Button.tsx:89` · `globals.css:513-518` |
  | 베벨 페어 (요소 자신의 `box-shadow`) | `inset 0 1px 1px rgb(250 250 250 / 25%), inset 0 -1px 1px rgb(250 250 250 / 25%)` | `Button.tsx:91` · `globals.css:55-58`·`:53`·`:40` |
  | 글로우 (별도 `::before`) | `inset 0 0 8px 0 rgb(250 250 250 / 100%)` + `mix-blend-mode: overlay` + `pointer-events: none` | `Button.tsx:93-96` |

  **글로우를 베벨과 같은 `box-shadow` 목록에 합치면 틀린다.** 합치는 순간 `mix-blend-mode`를 걸
  자리가 없어 흰 테가 그대로 뜬다 — 글로우가 별도 `::before`인 이유가 이것이다. 두 레이어 모두
  `transform: translateZ(0)`으로 합성 승격되고(`Button.tsx:92`·`:96`), 같은 베벨 페어가 `danger`에도
  있다(`Button.tsx:126`). 제거 결정과 그때 함께 지운 토큰(`shadow`/`elevation`의 `control-bevel`·
  `control-gloss`)은 [`updates/README.md`](../updates/README.md)가, 같은 결정의 컴포넌트 쪽 기록은
  [Toast](toast.md)가 소유한다. **이 표는 Figma 재조립용 제품 실측이지 DS 계약이 아니다.**
- **disabled를 요소 전체 opacity가 아니라 색 교체로 표현한다.** 제품은 variant마다 다른 불투명도 하나로
  끝낸다 — `primary` 0.35(`Button.tsx:99`) · `secondary` 0.45(`:107`) · `ghost` 0.5(`:118`) ·
  `danger` 0.4(`:129`). 색·배경·테두리를 다시 선언하지 않고 커서만 ROOT 공통으로
  `disabled:cursor-not-allowed`다(`:46`). DS는 대신 전경을 `#9AA0AB`로, `primary`·`danger` 배경을
  `#EAEBEE`로, `secondary` 테두리를 `#E3E4E8`로 바꾼다. **제품 값을 그대로 옮기면 `primary`의 흰
  라벨이 사실상 보이지 않는다** — 제품은 `#fafafa` 라벨에 0.35를 그대로 곱한다. 판정은
  [`migration/product.measured.json`](../../migration/product.measured.json)의 「disabled 표현」 축에
  accepted-deviation으로 있다.
- **노드 캔버스 중립 버튼의 면 색이 LOUIS에 없다.** 제품은 노드 카드에 붙는 보조 버튼용으로 별도 SSOT
  토큰군 `--node-chrome-btn-*`를 둔다(`globals.css:562-589`).

  | 토큰 | 값 | LOUIS `sm` 대비 |
  | --- | --- | --- |
  | `--node-chrome-btn-h` | `32px` (`globals.css:576`) | 같다 (`layout-control-height-sm`) |
  | `--node-chrome-btn-padding-x` | `10px` (`:577`) | 텍스트-only `sm` 12px와 다르고 **아이콘 동반 `sm` 10px와 같다**. 제품은 아이콘 유무와 무관하게 10 고정 |
  | `--node-chrome-btn-radius` | `12px` (`:578`) | 같다 (`radius-control`) |
  | `--node-chrome-btn-gap` | `4px` (`:581`) | 같다 (`space-control-xs`) |
  | `--node-chrome-btn-bg` | 다크 `#777d89` (`:582`) / 라이트 `#f1f1f3` (`:611`) | **대응 토큰 없음** |
  | `--node-chrome-btn-border` | `0.5px solid` — 다크 `#575d68` (`:583`) / 라이트 `#eaebee` (`:612`) | 두께는 같고(`border-width-hairline`) **색은 없음** |
  | `--node-chrome-btn-bg-hover` | 다크 `color-mix(in srgb, var(--palette-gray-000) 8%, var(--node-chrome-btn-bg))` (`:585-589`) / 라이트 `--palette-gray-1000` 5% (`:613-617`) | **없음** |

  대상은 메타 툴바 알약(모델·길이·볼륨·비율), 메타 아이콘 버튼, 카드 헤더 액션(다운로드·삭제), 업로드
  노드 툴바 버튼이다(`globals.css:564-566`). 프라이머리 그라디언트 버튼(생성 FAB·`processButton`·
  `uploadPillButton`)과 세그먼트 컨트롤은 비대상이고 각자 고유 크롬을 갖는다(`:567-568`).
  **토큰군 전부를 쓰는 소비처는 없다**(`:570-571`) — 헤더 액션은 치수만 쓰고 면은 투명 + hover
  틴트이며(`NodeHeaderActions.tsx:36-37`), 아이콘 전용 버튼은 정사각이라 `-padding-x`를 쓰지 않는다.
  면과 테두리를 전부 쓰는 대표 소비처는 메타 툴바 알약이다(`ImageNode.tsx:646-653`). 치수 축은 LOUIS
  `sm`으로 그대로 재현되지만 **면 색 두 쌍이 없어 노드 카드 내부 버튼을 LOUIS만으로 칠할 수 없다.**
- **제품의 결과 화면 액션은 전폭 앵커다.** 결제 결과 화면의 두 액션(`billing-success/page.tsx:136-146`
  primary · `:148-158` secondary)은 높이 40px과 radius 12px까지 `md`와 같고 네 축이 다르다.

  | 축 | LOUIS `md` | 제품 결과 화면 액션 |
  | --- | --- | --- |
  | 폭 | 내용 폭 (고정 폭 없음) | `width: 100%` (`:137`·`:149`) |
  | padding | `0 / space-control-lg` 16px | `0 / 20px` (`:137`·`:149`) |
  | 타이포 | `body-sm-medium` 14px / 21px | 14px **regular** — `--type-body-14-size` + `--type-weight-regular` 400 (`:139`·`:151`; 토큰 정의 `globals.css:370`·`:344`) |
  | 렌더 요소 | 네이티브 `<button>` | `next/link`의 `<a>` + `text-decoration: none !important` |

  **컨테이너의 gap은 가로가 아니라 세로 간격이다.** 컨테이너는 `display:flex; flex-wrap:wrap;
  gap:10px; margin-top:8px`이지만(`:134`) 자식이 전폭이라 **wrap 컨테이너 안에서도 절대 나란히 서지
  않고 각자 한 줄을 차지한다.** 10px은 row-gap으로만 읽힌다. Figma에서 가로 2열 `md` 버튼으로 그리면
  구현과 완전히 다르다. DOM 순서는 secondary(뒤로) → primary(진행)다(`:500-518`). 상태
  값(`:141-146`·`:153-158`)은 전환 `background-color 140ms ease, transform 120ms ease, opacity 140ms ease`
  공통에, primary는 면 `--gray-000` → hover 90% → active 82% · 글자 `--gray-900`, secondary는 면 페이퍼
  8% → hover 14% → active 18% · 글자 `--gray-000`이고 둘 다 active에서 `scale(0.98)`이다. `!important`가
  필요한 이유는 레이어 **밖** 전역 `a { color: inherit; text-decoration: none }`가 `@layer utilities`를
  무조건 이기기 때문이다(`globals.css:1007-1010`).
- **인증 화면 버튼은 컨트롤 계단(40/32px) 밖이고 공용 Button을 쓰지 않는다.** 어떤 인증 화면도
  `components/ui/Button.tsx`를 import 하지 않는다. 로컬 제출 버튼은 전폭 **48px 고정**(`h-24`) ·
  `rounded-12` · 면 `--gray-000` / 글자 `--gray-1000`(반전 잉크)이고(`login/page.tsx:206-211`), 상태 카드
  버튼은 전폭 **48px 최소**(`min-h-24`) · 패딩 `0 18px` · `rounded-12`다. **고정과 최소를 같은 것으로
  읽으면 틀린다.** 라벨은 두 곳 모두 `type-body-16-medium` **16px**으로 LOUIS의 `body-sm-medium`
  14px/21px와 다르다(`login/page.tsx:594-596` · `reset-password/page.tsx:252-256`; 상태 카드 정의
  `reset-password/page.tsx:59-67` primary · `:71-76` secondary).

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
