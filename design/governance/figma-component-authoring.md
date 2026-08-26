---
id: governance-figma-component-authoring
status: experimental
authority: normative
---

# Figma 컴포넌트 작성 규범

Figma 컴포넌트를 만들거나 고칠 때 지키는 규칙. 기준선은 이미 만들어진 26개가 실측으로 보여 준
수준이고(2026-08-26 `figma/readback.json` 되읽기), 이 문서는 그 수준을 규칙으로 굳히고
**어휘가 무너진 곳을 바로잡는다.**

정본은 저장소다([DS-D-0025](decisions/DS-D-0025-figma-as-projection.md)). 여기 적힌 것은
그 정본을 Figma 컴포넌트로 투영하는 방법이다. 컬렉션 구조는
[DS-D-0007](decisions/DS-D-0007-figma-library-structure.md)이 소유한다.

## 1. 원시값 0 — 타협 없음

되읽기가 내는 세 수가 **전부 0**이어야 한다.

| 지표 | 뜻 | 현재 |
| --- | --- | ---: |
| `rawFills` | 변수에 안 묶인 채움 | 0 ✅ |
| `rawStrokes` | 변수에 안 묶인 선 | 0 ✅ |
| `textUnstyled` | 텍스트 스타일 없는 텍스트 노드 | **3** ❌ |

색·선은 변수, 타이포는 text style, 그림자는 effect style에 묶는다. 값을 손으로 적으면 정본이
바뀌어도 Figma가 따라오지 않는다 — projection 이라는 전제가 그 순간 깨진다.

`textUnstyled: 3`은 갚아야 할 빚이다. 새 컴포넌트에서는 0을 지킨다.

## 2. 축 어휘는 닫혀 있다

축 이름은 PascalCase. **아래 표에 없는 축을 새로 만들려면 이 문서를 먼저 고친다.**

| 축 | 허용값 | 무엇을 담나 |
| --- | --- | --- |
| `Size` | `sm` · `md` · `lg` | 밀도. **`compact`/`medium`/`large`는 폐기** — 같은 뜻을 두 어휘로 부르면 두 벌이 된다 |
| `Variant` | `primary` · `secondary` · `ghost` · `danger` · `inverse` | **강조 단계만.** 부품 이름을 넣지 않는다 |
| `Tone` | `neutral` · `info` · `success` · `warning` · `danger` | **의미 톤만.** 밝기(`bright`/`dark`)는 톤이 아니다 — 모드나 별도 축으로 뺀다 |
| `State` | `Default` · `Hover` · `Active` · `Focus` · `Disabled` | **상호작용 상태만.** `Active` 는 `:active`(누르는 중)다 — `Pressed`(aria-pressed)와 다르며 Button 에는 후자가 없다. 이 뜻은 `design/foundations/interaction-states.md` 가 소유한다 |

### State 에 넣지 않는 것

지금 `State` 축에 16개 값이 뭉쳐 있다 — 상호작용 상태에 의미 상태·톤·진행 모드가 섞였다.
섞으면 조합이 곱해지고, 「Checked 이면서 Hover」 같은 실재하는 조합을 표현할 수 없게 된다.

| 지금 State 에 있는 것 | 옮길 곳 |
| --- | --- |
| `Checked` · `Indeterminate` | `Checked` BOOLEAN 또는 3값 축 |
| `Selected` · `Current` | `Selected` BOOLEAN |
| `Invalid` | `Invalid` BOOLEAN |
| `Loading` | `Loading` BOOLEAN |
| `Danger` · `DangerHover` | `Variant=danger` × `State=Hover` |
| `Pressed` | Button 에는 없다 — `:active` 는 `Active` 다 |
| `determinate` · `indeterminate` | `Mode` 축 |

### 해부 구조는 variant 가 아니다

Slider 의 `thumb`/`track` 이 `Variant` 축에 들어가 있다. 부품은 variant 가 아니라 **부품**이다 —
한 컴포넌트 안의 레이어이거나 별도 컴포넌트다. variant 로 두면 「thumb 이면서 primary」 같은
무의미한 조합이 생긴다.

## 3. 슬롯은 컴포넌트 프로퍼티로

variant 로 만들지 않는다. 슬롯을 variant 축에 넣으면 조합이 2배씩 늘어난다.

| 용도 | 타입 | 이름 관례 |
| --- | --- | --- |
| 있고 없고 | `BOOLEAN` | `Icon` · `Dot` · `Prefix` · `Suffix` · `LeftIcon` · `RightIcon` |
| 아이콘 교체 | `INSTANCE_SWAP` | `Glyph` · `IconGlyph` · `PrefixGlyph` · `{Position}Glyph` |
| 문구 | `TEXT` | `Label` · `Title` · `Description` · `Message` · `Meta` |

BOOLEAN 과 INSTANCE_SWAP 은 짝으로 낸다 — `Icon`(있고 없고) + `IconGlyph`(무엇을).

## 4. 라이트/다크는 모드로만

컴포넌트를 두 벌 만들지 않는다. `Klipse Semantic Color` 의 `Light`/`Dark` 모드에 묶으면 한 벌로
양쪽이 나온다. 다크 전용 컴포넌트가 생겼다면 그건 토큰이 부족하다는 신호다.

## 5. 조합 예산

`variantCount` 는 축의 곱이다. Button 은 4 × 2 × 5 = 40 으로 현재 최대다.

**40을 넘기려면 축을 하나 슬롯으로 내릴 수 있는지 먼저 검토한다.** 넘겨야 한다면 컴포넌트
description 에 이유를 적는다. 조합이 늘면 유지 비용이 곱으로 늘고, 실제로 쓰이지 않는 조합이
정본인 척 남는다.

## 6. 설명은 필수

26/26 이 description 을 갖고 있다. 이 비율을 100% 로 유지한다. 설명에는 셋을 적는다.

1. 무엇인가 — 한 줄
2. 언제 쓰나 / 언제 쓰지 않나 (혼동하기 쉬운 이웃 컴포넌트를 지목한다)
3. 제품 정본 — 어느 화면·상수에서 왔는지

## 7. component set 프레임은 변형을 다 보여야 한다

**변형이 잘리면 안 된다.** 이건 미관이 아니라 기능이다 — 디자이너는 asset 패널이 아니라 이
캔버스에서 「어떤 변형이 있는지」를 본다. 잘린 변형은 없는 것과 같다.

- set 프레임에 오토레이아웃(`layoutMode`)을 준다. `NONE` 이면 변형이 겹치거나 프레임 밖으로 나간다.
- 변형이 많으면 `layoutWrap = 'WRAP'`.
- **감싸는 축은 HUG 로 둔다** (`counterAxisSizingMode = 'AUTO'`). 여기를 `FIXED` 로 두면
  줄바꿈된 변형이 프레임 아래로 넘쳐 잘린다.
- `resize(w, h)` 로 **높이를 직접 지정하지 마라.** 폭만 정하고 높이는 HUG 에 맡긴다.

2026-08-26 에 Button 을 `resize(1400, set.height)` 로 만들어 50개 중 일부가 잘렸고 소유자가
직접 고쳤다. 같은 실수를 IconButton(2824×32 에 50개) · Menu · SidebarNavItem 에서도 냈다.

### 캔버스에서 겹치지 않게 놓는다

**좌표를 미리 정하지 마라.** 컴포넌트 높이는 만들어 보기 전에는 모른다 — 미리 정한 y 간격에
Dialog(790) · BannerCarousel(840) 같은 큰 것이 들어가면 다음 것을 덮는다. 2026-08-26 에
그렇게 배치해 소유자가 「컴포넌트끼리 겹쳐서 보기 힘들다」고 지적했다.

배치는 **전부 만든 뒤 실측 크기로 한 번에** 한다.

1. 페이지의 component set 을 모아 실제 `width`/`height` 를 읽는다.
2. 한 열로 쌓거나(단순·안전) 폭에 맞춰 채운다.
3. 간격은 **가장 큰 것 기준**으로 넉넉히 준다. 겹치면 간격이 부족한 것이다.
4. 놓은 뒤 **겹침을 실제로 검사한다** — 두 사각형의 교집합이 있으면 실패다.
   눈으로 확인했다고 넘기지 마라.

## 8. 오토레이아웃과 크기

- 컨테이너는 오토레이아웃으로 만든다. 절대 좌표로 자식을 놓지 않는다.
- HUG/FILL 은 CSS 를 따른다 — `inline-size: 100%` → FILL, 선언 없음 → HUG.
- **CSS 에 없는 고정 폭을 지어내지 않는다.** 근거가 없으면 비워 두고
  `figma/components.measured.json` 의 `$whyNotTextWidth` 방침을 따른다.

## 9. 작업 순서 — 부품 먼저, 조립은 그다음

화면부터 그리지 않는다. **제품의 디자인 요소를 먼저 컴포넌트로 만들고, 그 인스턴스로 화면을
조립한다.** 화면을 먼저 그리면 같은 버튼이 화면 수만큼 복제되고, 그때 가서 컴포넌트로 묶으려면
전부 다시 만져야 한다.

순서: 원시 토큰 → 컴포넌트(Button·IconButton·TextField…) → 조합 컴포넌트 → 화면 조립.

## 10. 계약의 정본은 게이트다

이 문서는 **원칙**을 적고, 컴포넌트별 **계약**은 `scripts/verify-figma-parity.mjs` 의
`COMPONENT_CONTRACTS` 가 소유한다. 거기에 컴포넌트마다 이렇게 선언돼 있다.

- `variantProperties` — Figma variant 축 ↔ 코드 타입 alias(예: `Variant: "ButtonVariant"`).
  **옵션 집합을 코드에서 읽어 대조하므로 Figma 에 값을 늘리려면 코드 타입을 먼저 늘려야 한다.**
- `figmaOnlyProperties` — Figma 에만 있는 property 와 **그 사유**. 사유 없이는 통과하지 않는다.
- `propProperties` — 코드 prop 존재 여부로 대응하는 슬롯(ReactNode 는 옵션 대조가 불가능하다).
- `geometry.fields` — 되읽기 필드 ↔ 기대값. **`Figma padding = CSS padding + border`** 이고
  stroke 는 INSIDE 다. 이걸 접지 않으면 프레임이 border 두께의 두 배만큼 작아진다.
- `strokes` · `extraStrokeWeights` — 허용되는 stroke 두께 집합.

**만들기 전에 그 컴포넌트의 계약을 읽어라.** 이 문서만 보고 만들면 어긋난다 — 2026-08-26 에
Button 을 규범만 보고 세웠다가 State 어휘(Active↔Pressed)와 슬롯 4개가 계약과 달라 게이트가
잡았다.

## 11. 검증

컴포넌트를 만들거나 고친 뒤 `pnpm run verify-figma-parity` 를 돌린다. 되읽기(`figma:fetch`)로
`readback.json` 을 갱신하고 snapshot 을 재생성해야 그 게이트가 새 컴포넌트를 본다.

**게이트가 green 이라고 이 문서를 지켰다는 뜻은 아니다** — parity 는 값이 코드와 같은지만 보고,
축 어휘와 슬롯 설계는 보지 않는다. 그 둘은 리뷰로 지킨다.

## 불리언으로 두면 표현할 수 없는 것이 있다

옵션 슬롯은 **BOOLEAN + INSTANCE_SWAP** 이 기본이다(베리언트로 쪼개면 곱셈이 된다). 단, 그 슬롯이
**컨테이너의 기하를 바꾸면 불리언으로는 표현할 수 없다** — 불리언은 자식의 가시성만 바꾸고
프레임의 padding·gap 은 못 바꾼다.

Button 이 그 경우였다. 코드는 아이콘이 붙은 쪽 padding 을 2px 줄이는데(`button.css:78-91`),
Figma 는 불리언으로 두어 그 상태를 **그릴 방법이 없었다.** `Icon: none|left|right|both` 축으로
쪼개 5×2×5×4 = 200 이 됐다. 200 이 부담스러워도, 표현 못 하는 것보다는 낫다.

**판단 기준:** 슬롯을 켰을 때 컨테이너의 padding·gap·height 중 하나라도 달라지면 → variant 축.
자식만 나타났다 사라지면 → BOOLEAN.

## border 가 없는데 padding 에 border 를 더하지 마라

「Figma padding = CSS padding + border(INSIDE stroke)」는 **border 가 실재할 때만** 맞다.
Button 은 `border: 0` 이고 헤어라인은 레이아웃을 건드리지 않는 inset box-shadow 다(DS-D-0023).
그런데 계약이 무조건 더하고 있어서 디자이너 눈에 `14.5 / 16.5 / 0.5` 가 보였다 — CSS 어디에도
없는 수다. 컴포넌트마다 border 가 실재하는지 확인하고 계약을 따로 쓴다.

같은 이유로 **헤어라인은 stroke 가 아니라 INNER_SHADOW 로 그린다.** CSS 가
`inset 0 0 0 0.5px var(--louis-color-stroke-hairline)` 이면 Figma 도 spread 0.5 의 inner shadow 여야
한다. stroke 로 두면 기법도 다르고, 실제로 토큰도 엉뚱한 것(`stroke-control`)에 물려 있었다.

## INSTANCE_SWAP 은 노드 id 를 받는다 — 그리고 후보를 채워야 쓸 수 있다

- `setProperties` 로 글리프를 바꿀 때 **컴포넌트 key 가 아니라 노드 id** 를 넘긴다.
  key 를 넘기면 `Property value is incompatible with component property type` 이 난다.
- **`addComponentProperty` 의 기본값도 같다** — `INSTANCE_SWAP` 축을 만들 때 넘기는 기본값이
  노드 id 여야 하고 key 를 넘기면 같은 오류가 난다(2026-08-26 Alert 작성 중 확인, 두 형태를
  나란히 시도해 대조했다). 스크립트는 원자적이라 이 한 줄에서 전체가 되돌려진다.
- `preferredValues` 가 비어 있으면 **인스턴스에서 아이콘을 고를 수가 없다.** 스왑 목록이 안 뜬다.
  `editComponentProperty(key, { preferredValues })` 로 아이콘 컴포넌트를 채운다. 이때는 반대로
  `{type:"COMPONENT", key}` 형태의 **key** 를 쓴다. 둘이 다르다는 것을 기억할 것.

## 상호작용은 **그것을 받는 요소**가 소유한다 — 그리고 거기 프로토타입을 건다

hover·focus·selected 를 **컨테이너의 variant** 로 두면 두 가지가 동시에 깨진다.

1. **어느 자식이 그 상태인지 고를 수 없다.** SegmentedControl 에 `State=Hover` 를 두었더니
   세 세그먼트 중 하나를 임의로 골라 칠해야 했다 — 「옵션2 hover」라는, 뜻이 없는 변형이 생겼다.
   실제로는 포인터가 얹힌 세그먼트가 받는다.
2. **프로토타입을 걸 수 없다.** Figma 의 `ON_HOVER` · `ON_CLICK` 반응은 그 상호작용을 받는
   노드에 걸어야 동작한다. 컨테이너에 걸면 어디에 얹어도 같은 변형으로 넘어간다.

그래서 **상호작용 단위를 자기 컴포넌트로 뽑고**, 컨테이너는 그 인스턴스를 조립한다.

    SegmentedControlItem   Size × State(Default·Hover·Selected·Focus·Disabled·SelectedDisabled)
                           ← 여기에 setReactionsAsync 로 ON_HOVER → Hover, ON_CLICK → Selected
    SegmentedControl       Size × Disabled  (그룹 축만 남는다)

**판단 기준:** 그 상태가 컨테이너 전체에 걸리는가, 자식 하나에 걸리는가. 자식 하나면 그 자식이
컴포넌트다. 그룹 전체를 끄는 `disabled` 처럼 진짜 컨테이너 축인 것만 컨테이너에 남긴다.

### 상태의 시각 표현은 CSS 를 그대로 옮긴다 — 지어내지 않는다

세그먼트 hover 는 **글자색만** 바꾼다(`segmented-control.css:122-127`). 면까지 바꾸면 선택된
것과 얹은 것이 같은 표현이 되어 어느 쪽이 현재 값인지 순간 읽히지 않는다 — CSS 주석이 그렇게
적어 두었는데도 처음엔 면을 칠했다. 상태를 만들기 전에 그 상태의 CSS 규칙을 먼저 읽는다.

### 포커스 링은 `outline` 이고 `outline-offset` 이 있다

`base.css:50-54` 는 `outline: 2px solid stroke-focus; outline-offset: 2px` 다. Figma 에는
outline-offset 이 없으므로 **요소보다 각 변 2px 큰 사각형에 2px OUTSIDE stroke** 를 둔다.
반지름도 따라간다 — 요소 반지름 + 2. 요소에 바로 stroke 를 걸면 딱 붙은 각진 상자가 되고,
그건 브라우저가 그리는 것과 다르다.
