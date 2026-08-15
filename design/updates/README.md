---
id: updates-overview
status: beta
authority: normative
---

# Updates

디자이너와 개발자가 알아야 할 사용자 영향 변경과 migration을 최신순으로 기록한다.

## 2026-08-16 — Project Card와 카드 반경 정정

### `radius-card`가 20px에서 16px로 내려간다 — breaking

제품의 프로젝트 카드는 **정의 4벌이 전부 16px**인데 DS의 `radius-card`는 20px이었고, 그 20px의 유일한
소비처는 Dialog compact였다. 이름이 카드를 가리키면서 카드가 아닌 것에만 쓰이고 있었다.

[DS-D-0014](../governance/decisions/DS-D-0014-card-radius.md)로 바로잡았다.

- `radius-card` = 16px. Project Card가 쓴다
- `radius-card-lg` = 20px 신설. Dialog compact가 같은 변경 단위에서 이쪽을 가리킨다
- **화면은 바뀌지 않는다.** Dialog compact는 여전히 20px이다

breaking이므로 [DS-GOV-001 절차](../governance/releases.md)를 따랐다 — 결정을 먼저 쓰고, `diff-tokens`로 분류를
확인하고(additive 1 · value 1, 의도하지 않은 breaking 0), baseline을 갱신하고 재검증했다.

### Project Card

카탈로그 우선순위 6번이다. 제품의 홈과 허브가 각자 만든 정의 4벌의 기하가 서로 같아, 값은 DS가 정한
것이 아니라 **제품 정본을 옮긴 것**이다. 규범은 [project-card.md](../components/project-card.md).

- `@klipse-design/react`에 8종 export. root가 네이티브 `<a>`/`<button>`이다 — 제품 네 벌은 전부
  `<article>` + `onClick`이라 키보드로 열 수 없다
- `space-card-text-gap`(4px) 신설. 제품의 `--project-card-overlay-stack-gap`에 대응한다
- Figma `Content` 섹션에 component 하나. parity 게이트는 아직 이 component를 덮지 않는다

### 프로그레시브 블러의 첫 소비처가 생겼다

API와 게이트만 있고 쓰는 곳이 없던 프로그레시브 블러가 여기서 쓰인다. 제품이 이미 쓰고 있었다 —
카드 제목 띠의 `backdrop-filter: blur(10px)` + 위로 사라지는 mask가 그것이다.

불투명 스크림과 다르다. 스크림은 썸네일의 색을 지우고, 흐림은 색을 남기면서 글자 뒤의 고주파 성분만
없앤다. 정지점은 `figma/components.measured.json`이 갖고 코드와 Figma가 같은 원천을 본다.

**Figma의 표현에 한계가 하나 있다.** CSS mask는 정지점 다섯 개로 비선형 곡선을 그리는데 Figma의
`PROGRESSIVE`는 두 지점 사이의 선형 램프다. 중간 구간에서 0.8/0.4 대신 0.67/0.33이 된다.

### 표면 컴포넌트 넷이 게이트 없이 있었다

Dialog·Tooltip·Toast·Menu는 `components.measured.json`에 값이 있는데 **코드 쪽 대조가 없었다.**
parity 게이트는 Figma가 measured와 같은지만 보므로, 그동안 "Figma와 measured는 서로 맞고 둘 다 코드와
틀린" 상태로 통과할 수 있었다. 실제로 `radius-card`를 내렸을 때 Dialog compact가 20px을 유지하는지
확인해 주는 테스트가 하나도 없었다.

`surface-geometry.browser.test.tsx`를 세워 넷과 Project Card를 덮는다. 세우는 과정에서 두 가지를
실측으로 찾았다 — Dialog 폭이 여는 애니메이션의 `scale`을 타고 정확히 98%로 읽히는 것(`offsetWidth`로
바꿨다), 그리고 오버레이 띠가 `content-box`라 여백만큼 두꺼워지던 것(`box-sizing`을 명시했다).

## 2026-08-15 — Tailwind 4 interop과 글래스 섀도우 제거

### 배포 환경이 Tailwind 4다

DS는 Tailwind 의존성이 **0개**였고 [DS-D-0004](../governance/decisions/DS-D-0004-css-authoring.md)가
"소비 제품은 Tailwind 사용 여부를 고정할 수 없다"를 근거로 authored plain CSS를 택해 둔 상태였다.
그 전제가 틀렸다 — 제품은 `tailwindcss ^4.3.3`을 쓴다.

더 중요한 것은 제품이 이미 `@theme inline` 블록을 **생성기로** 만들고 있었다는 점이다. 그 생성기의
입력이 제품의 `globals.css`라서, **제품 CSS가 토큰의 정본**이었다. DS가 토큰을 바꿔도 제품 유틸리티는
따라오지 않고, 제품이 색을 바꾸면 DS와 조용히 갈라진다. 205축 중 143축이 그렇게 갈라져 있었다.

[DS-D-0013](../governance/decisions/DS-D-0013-tailwind-interop.md)로 결정했다 — **토큰만** Tailwind 4
`@theme inline` 레이어로 발행하고 컴포넌트 CSS는 authored plain CSS로 남긴다.

- `@klipse-design/css/theme.css` 신설. 유틸리티 토큰 93개 + 변수 전용 16개
- 값이 리터럴이 아니라 `var(--kds-*)`를 가리킨다. `@theme`가 아니라 **`@theme inline`**인 이유가
  이것이다 — semantic 색이 런타임에 바뀌므로 inline이 아니면 빌드 시점 값이 구워져 테마 전환을
  따라가지 않는다
- Tailwind에 대응 namespace가 없는 범주(`layer`, `border-width`, `motion`)도 변수로 내보낸다
- **매핑되지 않은 토큰 접두사를 만나면 생성이 실패한다.** 새 범주가 생겼는데 매핑을 빠뜨리면
  유틸리티가 조용히 안 나오고 아무도 모른다. canary가 그 검출력을 증명한다

컴포넌트까지 유틸리티로 내보내지 않은 이유는 셋이다. 소비하는 쪽이 Tailwind를 반드시 갖춰야 하고,
같은 클래스가 소비자 설정에 따라 다른 결과를 내며(제품은 `--spacing: 2px` 격자라 `p-4`가 8px이다),
cascade layer가 주는 override 계약이 사라진다. 제품 자신이 그 함정을 주석으로 적어 두었다 —
레이어 안의 유틸리티는 레이어 밖 모듈 CSS에 **특이도와 무관하게 진다**.

### 글래스 섀도우 개념을 없앴다

owner 결정이다. 버튼에는 이너섀도우를 쓰지 않고, 이너섀도우는 노드 사이드 버튼에만 남긴다.

- Button의 글래스 베벨 2겹과 `::before` 광택 오버레이를 제거했다. Figma에서 Gloss 사각형 6개와
  effect style 둘을 지웠다
- 토큰 4개를 제거했다 — `shadow`/`elevation`의 `control-bevel`, `control-gloss`
- Toast 그림자에서도 베벨 inset 2겹을 뺐다. drop 1겹 + 배경 흐림만 남는다

제품 값을 채택했던 두 축을 **철회**해 사유를 적은 편차로 바꿨다. 제품과 다르게 가는 결정이므로
`migration/product.measured.json`에 그 사실이 남는다.

### 모든 헤어라인이 0.5px다

`border-width` 토큰을 세웠다(hairline 0.5 / ring 2). Button·IconButton·Tooltip·Dialog·Menu 구분선의
테두리가 전부 hairline이며 Figma 스트로크 27개도 `0.5|INSIDE`다. spinner 링(2)과 글리프(1.5)는
테두리가 아니라 그대로다.

**브라우저는 DPR 1에서 0.5px의 사용값을 1px로 올린다.** `getComputedStyle`이 언제나 1px을 돌려주므로
기하 테스트가 계산값이 아니라 선언 토큰을 보도록 고쳤다. 레티나에서는 진짜 half-pixel로 그려진다.

### 스트로크와 effect를 역할별로 잰다

두께를 **집합**으로만 보면 버튼 테두리가 2px이 돼도 spinner의 2와 구분되지 않았다. `strokeAlign`은
아예 보지 않았다 — 같은 두께라도 `CENTER`가 되면 시각 박스가 달라진다. effect는 개수만 세서
`INNER_SHADOW`가 `DROP_SHADOW`로 바뀌어도 통과했다.

역할별로 두께·정렬·effect 종류·순서를 대조하고, blur는 radius가 변수에 묶였는지까지 본다.
변조 canary가 20종에서 25종이 됐다.

그 과정에서 effect 종류 canary가 **무력화돼 있던 것**도 찾았다. `INNER_SHADOW`를 찾아 바꾸는
방식이라 그 종류가 없는 컴포넌트에서는 no-op이었고, Button의 effect가 비면서 대상이 Tooltip으로
넘어가 조용히 통과하고 있었다.

## 2026-08-15 — 제품과의 격차 143건을 전부 판정했다

`product-parity` 게이트가 **초록이 됐다.** 205축 실측에서 나온 격차 143건이 전부 판정됐다는 뜻이다.

| | 건수 |
| --- | --- |
| 제품 값 채택 | **45** (그중 7건은 기계 대조) |
| 사유를 적은 의도적 편차 | **46** |
| 제품에 공용 정본이 없음 | **52** |

`gap` 0건. 이제 제품과의 차이는 전부 **기록된 결정**이다.

### Tooltip — 표면이 정반대였다

제품 tooltip은 **페이지와 반전된 면**이다. 라이트에서 어두운 면에 밝은 글자, 다크에서 그 반대.
DS는 `background-inset`을 써서 페이지와 같은 극성이었다. 정확히 반대로 만들어져 있었다.

Toast가 먼저 세운 `color-background-inverse`/`color-foreground-on-inverse`가 제품 tooltip 면과
**값이 정확히 같았다.** 토큰은 이미 있었고 tooltip이 다른 것을 쓰고 있었을 뿐이다.

**모션이 아예 걸리지 않고 있었다.** `animation-duration`과 `animation-timing-function`만 있고
`animation-name`이 없었다. 값만 적어 두고 실제로 도는지 확인하지 않은 것이다. 제품의 140ms /
`cubic-bezier(0.23, 1, 0.32, 1)` / scale 0.97을 채택하며 함께 고쳤다.

그 밖에 max-width 320, 1px 테두리, 테마별 그림자, 열림 지연 300ms를 채택했다. 22축 전부 판정.

### Menu / Popover — 면·간격·알파를 다 채택했다

제품의 공용 정본은 컴포넌트가 아니라 `--dropdown-*` 토큰이다. 패널 padding 6, 항목 사이 2,
항목 내부 6, 최소 폭 160, 라이트 면 neutral-100을 채택했다. 이전 DS는 padding이 action-menu 4 /
composite 8로 갈려 있었고 항목 사이 gap이 없어 **행이 붙어 있었다.**

- **테두리를 없앴다.** 제품처럼 헤어라인을 `box-shadow` 스프레드 0.5px로 그린다. 레이아웃 박스를
  늘리지 않으면서 1px보다 얇은 선이 된다.
- **hover를 알파 오버레이로 바꿨다.** 이전 DS는 불투명 `background-inset`이라 배경이 다른 자리에서
  면이 튀었다.
- **`danger` 전경을 `#ff4b59`로 바꿨다.** 이전 `status-danger-foreground`가 중립 표면 위에서 대비가
  무너지는 것은 규범이 이미 인정하던 결함이고, 제품 값 채택이 그것을 해소한다.

항목 높이 44px과 focus ring은 제품을 따르지 않았다. 제품은 37px에 focus ring이 없고 둘 다 WCAG
계약이다. 34축 전부 판정.

### 토큰 모델이 두 군데 넓어졌다

- **테마별 elevation.** `semantic.light/dark`에 elevation 축을 열었다. 기존 elevation은 global이라
  테마마다 그림자 색이 다른 것을 표현할 수 없었다. tooltip과 menu가 첫 소비자다.
- **Figma style에는 mode가 없다.** 그래서 테마별 elevation은 Light를 정본으로 삼고 다크 값은 CSS만
  갖는다. parity 계약이 그 사실을 명시적으로 담는다 — 이전에는 mode가 여럿일 때 어느 것을 쓰는지가
  우연에 달려 있었고 실제로 다크가 뽑혀 나왔다.

alpha primitive 13개, semantic 색 11개, spacing 3개, motion 4개, elevation 2개가 늘었다. Figma에도
같은 변수 186개와 style 23개가 서 있다.

## 2026-08-15 — primary를 제품 브랜드 블루로 되돌리고, 그 대가를 기록한다

Owner가 Figma의 Button을 보고 물었다 — "프라이머리 컬러가 왜 저래, 왤케 어둡냐. 내 실제 배포환경에서
진짜 저 컬러를 쓰고 있다고?" 세어 보니 아니었다.

| 단계 | 제품 사용 횟수 | 흰 글자 대비 |
| --- | --- | --- |
| `--primary-400` #38a4ff | 28 | 2.54 |
| `--primary-500` #0088ff | **30** | 3.37 |
| `--primary-700` #005fb3 | **2** | 6.12 |

DS는 사용 횟수 2회짜리 `blue.700`을 action 색으로 쓰고 있었다. **왜 그렇게 됐는지는 명확하다 —
대비 게이트다.** 제품 브랜드 블루로는 4.5를 넘길 수 없어서, 통과하는 가장 가까운 값까지 어두워진
것이다. 그런데 그 판단이 어디에도 Decision으로 기록돼 있지 않았다. `migration/token-mapping.md`에
"시각값이 다르다" 한 줄뿐이었다. **브랜드 색이 접근성 게이트 때문에 조용히 바뀐 상태였다.**

### 결정

Owner가 `blue.500`을 정본으로 택했다. 반단계(450/550 같은 것)는 쓰지 않는다.

- `color-action-primary` → `blue.500`
- `color-action-primary-hover` → `blue.400`. 제품이 hover에서 **밝아진다**(`filter: brightness(1.06)`).
  기존 DS는 어두워졌다 — 방향이 반대였다.
- `color-action-primary-pressed` → `blue.600`. hover가 밝아지므로 눌림은 어두워져 둘을 가른다.

제품의 3-stop 그라디언트는 채택하지 않는다. 그것은 노드 생성 FAB과 공유하는 면이고
(`--node-prompt-generate-gradient`), 버튼이 FAB의 면을 물려받은 구조다. DS는 flat으로 간다.

### 대가를 숨기지 않는다

`primary` 버튼은 이제 **WCAG 2.2 AA 미달**이다(3.37 < 4.5). 이 미달은 제품이 이미 갖고 있던 것이고
DS가 그것을 그대로 재현한다. 세 곳에 같은 사유를 남겼다.

- token source의 `contrastPairs[].note`
- [Button](../components/button.md)의 Known deviations
- axe 테스트의 허용 위반 목록

그리고 **기준을 낮추는 일이 다시는 조용히 일어나지 않도록** 게이트를 고쳤다.

- `minimum`이 4.5 미만인 contrast pair는 **`note`가 필수**다(20자 이상).
- 완화하지 않았는데 `note`를 붙이는 것도 막는다. 사유가 실제 완화와만 짝지어야 "note가 있으니
  괜찮다"는 오독이 안 생긴다.
- canary 2종이 매 실행에서 이 두 방향의 검출력을 증명한다.

axe 테스트도 지우지 않고 **알려진 위반만 고정**했다. `primary: ["color-contrast"]` 하나뿐이고,
새 위반이 생기면 여전히 실패한다. 테스트를 지웠다면 그 variant의 나머지 검출력까지 사라졌을 것이다.

### 토글이 hover에 지워지고 있었다

Icon Button을 Figma로 옮기려고 CSS 특정성을 실제로 계산하다가 찾았다. `[aria-pressed="true"]`는
(0,2,0)이고 `:hover[data-variant="primary"]`는 (0,3,0)이다. **켜진 토글에 포인터를 얹으면 배경이
variant 색으로 되돌아가고 글자만 pressed 색으로 남는다.** 실측으로 확인했다 — bg가 #38a4ff,
fg가 foreground-primary.

지속 상태를 일시적 상태가 덮는 것이고 [Interaction states](../foundations/interaction-states.md)가
금지하는 것이다. hover/active 규칙에서 pressed를 제외해 고치고 acceptance test로 고정했다.

### Icon Button이 Figma에 섰다

40 variant(Variant 4 × Size 2 × State 5). 한 변 40/32가 기하 계약으로 묶여 있고, `State`는
`Default/Hover/Active/Pressed/Disabled`다 — Icon Button이 `active`와 `pressed`를 **둘 다** 갖는
첫 컴포넌트다.

**글리프 색 문제를 한 번 잘못 판단했다가 고쳤다.** 처음에는 "Figma에 currentColor가 없고 instance
내부를 플러그인 API로 못 바꾼다"고 결론내고 Known deviation으로 적으려 했다. 실제로는 **숨겨진
instance라서** 내용이 로드되지 않았던 것이고, 보이는 instance는 내부 vector에 접근된다. 글리프
stroke를 variant마다 올바른 전경 토큰에 다시 묶었다(IconButton 40 + Button 80 = 120개).

### manifest가 Figma 이름을 갖는다

`name`은 사람이 읽는 표시 이름이라 `Dialog / Confirm Modal` 같은 값이 들어 있다. Figma에서 슬래시는
**폴더 구분자**라 component set 이름이 쪼개진다. `figmaName`을 별도 필드로 두고 schema가 대문자
시작 PascalCase만 허용한다.

### Baseline 갱신 (DS-GOV-001)

분류별 diff는 breaking 4종 — `value`/`rawValue`/`aliasTarget` 각 6건(토큰 3개 × 모드 2개)과
`contrastPairs` 1건이다. `removal`은 0이고 의도하지 않은 항목은 없다. 공개 release와 published
library가 없어 baseline 복사로 처리했다.

## 2026-08-15 — Figma의 Button이 코드와 2px 어긋나 있었다

사용자가 "피그마에 만들어둔 버튼은 뭐냐"고 물어 열어 봤고, **틀려 있었다.**

| | Figma | 코드 실측 | 차이 |
| --- | --- | --- | --- |
| md Default | 59×**37** | 59.875×**39** | 높이 −2 |
| sm Default | 46×**26** | 47.031×**28** | 높이 −2 |
| md Loading | **79**×37 | **85.875**×39 | 폭 −6.9 |
| sm Loading | **66**×26 | **71.031**×28 | 폭 −5.0 |

### 왜 2px인가

`button.css`의 `border: 1px solid transparent`를 빼고 padding과 line-height만으로 프레임을 잡았다.
위아래 1px씩이 통째로 빠졌다. 올바른 매핑은 **Figma padding = CSS padding + border, stroke는
INSIDE**다. 그러면 프레임 높이가 CSS와 같아지고 1px 테두리는 padding 안에 앉는다.

### 왜 아무도 못 잡았나

parity 게이트가 **variant 이름과 "paint가 변수에 바인딩됐는가"만** 봤다. 치수도 구조도 코드와
대조하지 않았다. 프로젝트 카드 때와 같은 구멍이다 — 게이트가 없는 곳에서 그럴듯한 것을 만들었다.

그래서 양방향 계약을 세웠다.

- [`figma/components.measured.json`](../../figma/components.measured.json) — 실브라우저로 잰
  구조값. 총 폭은 넣지 않는다. 라벨 폭은 폰트 렌더링에 달려 있어 브라우저와 Figma가 원래 다르고,
  그 차이를 실패로 읽으면 게이트를 끄게 된다.
- `packages/react/test/component-geometry.browser.test.tsx` — **코드가 여전히 그 값을 만드는지.**
- parity 게이트 — **Figma가 그 값과 같은지.** 변조 canary 6종을 붙였다(높이, padding, 슬롯 크기,
  variant 간 분기, 코드 prop 대응 property 삭제, description 삭제).

한 방향만 걸면 "Figma와 measured는 서로 맞고 둘 다 코드와 틀린" 상태로 통과한다.

### 여기서 찾은 코드 결함

`.kds-button__icon`에 크기가 없어 **호출부가 넘긴 아이콘 크기가 그대로 버튼 높이가 됐다.** sm
버튼에 기본(20px) 아이콘을 넣으면 높이가 28이 아니라 **30**이 되고, 같은 줄의 버튼들이 아이콘
유무로 어긋난다. 높이가 호출부에 따라 달라지는 것은 컨트롤이 아니므로 슬롯을 md 20 / sm 16으로
Button이 소유하게 하고 글리프를 슬롯에 맞췄다. Iconography의 "글리프 크기는 아이콘이 소유한다"에
대한 의도적 예외이며 사유는 Button 규범의 Known deviations에 있다.

이것도 새 기하 테스트가 잡았다. 규범에 없던 `## Specification` 절도 함께 세웠다 — 없어서 아이콘
크기가 규정되지 않았고 기본값이 새어 들어왔다.

### 상태 어휘가 충돌하고 있었다

Figma의 `State=Pressed`는 `:active`(누르는 중)인데 Icon Button 규범의 `pressed`는
`aria-pressed`(토글 켜짐)였다. 같은 단어가 두 컴포넌트에서 다른 것을 가리켰고, 그대로 두면 남은
다섯 component set에 전부 번진다.

[Interaction states](../foundations/interaction-states.md)를 세워 정본으로 삼았다. 규칙은 하나다 —
**이름을 웹 플랫폼에서 가져온다.** `:active`가 있는 쪽이 `active`, `aria-pressed`가 있는 쪽이
`pressed`다. 그러면 "이 이름이 무슨 뜻인가"를 이 저장소가 아니라 플랫폼 명세가 답한다. Button의
Figma option을 `Active`로 고쳤다.

### Figma Button을 다시 만들었다

40 variant를 지우고 다시 지었다(Templates의 Button instance는 0개라 안전했다). 달라진 것.

- 프레임 높이가 md 39 / sm 28로 코드와 같다.
- `State`가 `Default, Hover, Active, Disabled, Loading`이다.
- **아이콘 슬롯이 생겼다.** 코드에 `leftIcon`/`rightIcon`이 있는데 Figma에는 없었다.
  `LeftIcon`/`RightIcon` boolean과 `LeftIconGlyph`/`RightIconGlyph` instance swap을 붙였고, 슬롯
  크기는 md 20 / sm 16이며 켜도 높이가 변하지 않는 것을 확인했다.
- description에 기하 매핑과 **표현하지 못하는 것**을 적었다: `:active`의 scale 0.98(프레임 크기를
  바꾸면 기하 계약이 깨진다), danger의 hover 면 변화(CSS에 없다 — `color-action-danger*` 대기).

`INSTANCE_SWAP` property의 기본값은 component key가 아니라 **node id**를 받는다. key를 주면
`Property value is incompatible with component property type`으로 거부한다. 세 형태를 실제로
시도해 확인했다.

## 2026-08-15 — 인계서를 실제 상태에 맞춘다

**규범이 아니라 사실 정정이다.** [인계서](../governance/execution-handoff.md)의 다음 포인터가
2026-08-14 이후 갱신되지 않아, 그 사이 커밋 다섯 개가 만든 상태를 담지 못했다. 큐가 정본인데 정본이
실제와 어긋나 있었다.

무엇이 틀려 있었나.

- `DS-P3-013`(아이콘)이 "여전히 0개"라고 적혀 있었다. 실제로는 글리프 26개가 React·Figma 양쪽에
  서 있고 게이트가 positive 6 + canary 20종이다. `done`으로 고쳤다.
- Icon Button·Tooltip·Toast가 큐 어디에도 없었다. 셋 다 Web `partial`이고 docs `done`이다.
  `DS-P3-009`에 gap registry 순위표로 넣었다.
- `DS-F-007-home`이 수행됐다는 기록이 없었다. gap 72건과 그 판정을 항목에 적었다.
- `DS-F-006`은 Button만 있고 나머지가 열려 있다는 사실이 드러나지 않았다.

**앞질러 간 의존성을 감추지 않고 적었다.** `DS-P3-009`는 문서상 `DS-P3-008`(RC 패키징) 의존이지만
Icon Button·Tooltip·Toast를 그보다 먼저 구현했다. RC는 "무엇을 먼저 만들 것인가"의 입력이 아니고,
DS-P3-009a 인벤토리와 Home 재조립이 그 근거를 실측으로 냈기 때문이다. 완료 조건은 약화하지 않았다.
Icon Button이 원래 목록(Input, Select, Tooltip, Toast, Empty State)에 없던 항목이라는 것도 함께 적었다.

계획 밖에서 들어온 토큰도 기록했다. `icon-size-*`, `layout-control-height-*`, `radius-control-sm`,
`color-background-inverse`/`color-foreground-on-inverse`는 `DS-P3-014`의 10개 단위 바깥에서
component가 요구해 들어왔다. 각각 규범·Figma 변수·snapshot까지 같은 변경 단위에서 반영했으므로
누락은 없으나 단위 6·7의 잔여 범위는 다시 세어야 한다.

### 다음 포인터

`DS-F-006`의 나머지 component set 다섯이다. Web에 여섯이 서 있는데 Figma에는 Button 하나뿐이고,
목표 B는 Figma component로만 재조립하는 것이므로 **코드와 Figma의 격차가 지금 목표 B의 단일
병목**이다. 순서는 gap registry를 따른다.

## 2026-08-15 — Toast

gap registry 3순위다. 세 화면 실측에서 **20개 파일이 toast를 쓰는데 공용 컴포넌트가 없었고**, 같은
정의가 `appHomeSceneStyles.ts`와 `highlightSceneStyles.ts`에 최소 2벌 중복돼 있었다.

### Added

- [Toast](../components/toast.md) 규범과 `ToastProvider` / `useToast` public export
- `packages/css/src/component/toast.css`
- `--kds-color-background-inverse`와 `--kds-color-foreground-on-inverse`. Toast가 첫 소비자이며
  contrast pair로 등록해 두 모드 모두 게이트가 잰다(light 11.61, dark 13.59). Figma 변수로도
  함께 만들었다.
- Storybook `Components/Toast` story 5종

### 기존 `color-foreground-inverse`를 쓸 수 없었던 이유

이름이 비슷해 헷갈리기 쉽다. `color-foreground-inverse`는 **두 모드 모두 `neutral-0`**이다 —
`action-primary` 같은 진한 표면 위 텍스트를 위한 것이다. Toast의 표면은 다크에서 오히려 **밝아지는**
반전 표면이므로 그 위에 흰 글자를 얹으면 읽히지 않는다. 그래서 모드에 따라 뒤집히는 쌍을 새로 만들었다.

### Baseline 갱신 (DS-GOV-001)

`contrastPairs` 배열 변경은 diff 정책상 **무조건 breaking**이다 — 배열 전체를 한 단위로 비교하므로
추가와 제거를 구분하지 않는다. 이번 변경의 분류별 diff는 additive 10건, breaking은 `contrastPairs`
1건뿐이며 그 내용은 `color-background-inverse` / `color-foreground-on-inverse` 쌍 **추가 1, 제거 0**이다.

정책을 느슨하게 고치지 않고 [Releases](../governance/releases.md)의 DS-GOV-001 절차를 따랐다.
분류를 "추가는 non-breaking"으로 바꾸면 게이트가 앞으로 **보증 철회를 놓칠 위험**이 생기고, 그것이
이 게이트의 존재 이유다. 공개 package release와 published Figma library가 아직 없어 소비자가 없으므로
baseline 복사로 처리했다.

### 계약

- **놓쳐도 되는 것만 담는다.** 확인이나 선택이 필요하면 Dialog이고, 반드시 읽어야 하면 화면에
  자리를 준다. 폼 오류는 해당 필드 옆이다 — 화면 반대편에서 사라지는 알림으로는 어디를 고칠지 모른다.
- **`message`는 `ReactNode`가 아니라 string이다.** live region은 텍스트를 읽는다. 요소를 넣으면
  보조 기술이 읽는 내용과 화면에 보이는 것이 갈린다.
- **live region 둘을 처음부터 렌더한다.** 보조 기술은 region이 존재한 뒤의 변화만 감지하므로,
  toast가 생길 때 region을 함께 만들면 **첫 메시지가 읽히지 않는다.** polite와 assertive를 별도
  region에 두는 것도 같은 이유다 — 한 region의 `aria-live`를 바꾸면 그 시점의 변경이 유실된다.
- **닫기 버튼을 두지 않는다.** 대신 포인터·focus로 타이머가 멈춘다. 닫기 버튼은 focus 순서에
  끼어들고, 사라지는 대상에 focus를 두면 focus가 소실된다.
- **멈췄다 풀리면 남은 시간부터 흐른다.** 처음부터 다시 세면 읽으려고 얹어 둔 것이 벌이 된다.
- **대기 중인 toast는 자기 차례가 와야 시계가 시작된다.** 상한 3개를 넘긴 것이 보이지 않는 동안
  소멸하면, 사용자는 뜬 적 없는 알림을 놓친 것이 된다.

### overlay primitive를 쓰지 않는다

Menu·Dialog·Tooltip과 달리 toast는 anchor가 없고 focus를 가져가지 않으며 바깥 클릭과 무관하다 —
positioner·focus scope·dismissable layer 중 해당하는 것이 하나도 없다. 붙이면 없는 문제를 위해
배경을 잠그게 되므로 Provider가 자기 viewport를 소유한다. 대신 viewport가 **비어 있을 때 포인터를
가로채지 않는다**는 점을 테스트로 고정했다. 화면 하단을 덮는 투명한 판이 되면 그 아래 컨트롤이
눌리지 않는다.

### Known deviations

제품과 셋이 다르다. 제품의 `backdrop-filter: blur(10px)`은 DS에 backdrop blur effect가 없어 불투명
반전 표면으로 대체했다. 제품의 **단일 슬롯 교체**(새 메시지가 이전 것을 지움)는 자동 소멸과 겹치면
읽기 전에 사라지므로 스택으로 바꿨다. **퇴장 전환은 넣지 않았다** — `animationend`로 걸면 그 이벤트가
오지 않는 경우 사라지지 않고 남는다. 전환보다 반드시 사라지는 것이 우선이다. 실행 취소 액션과 Figma
component set은 남아 있다.

## 2026-08-15 — Tooltip

gap registry 2순위다. 세 화면 실측에서 **22개 파일이 tooltip을 쓰는데 공용 컴포넌트가 없었다** —
제품 자신의 Button(17개 파일)보다 넓게 쓰인다.

### Added

- [Tooltip](../components/tooltip.md) 규범과 `Tooltip` public export
- `packages/css/src/component/tooltip.css`
- `--kds-radius-control-sm`(8px). gap registry가 지적한 **"가장 많이 쓰이는 radius에 semantic 이름이
  없다"**의 해소이며 Tooltip이 첫 소비자다. Figma 변수로도 함께 만들었다.
- Storybook `Components/Tooltip` story 5종

### 계약

- **이름이 아니라 설명이다.** 표면은 `role="tooltip"`이고 trigger는 `aria-describedby`로 가리킨다.
  `aria-labelledby`가 아니다. trigger는 자기 이름을 스스로 가져야 하며, tooltip이 이름의 유일한
  출처가 되면 포인터 없는 사용자에게 이름이 없다.
- **열 때만 지연하고 닫을 때는 즉시**다. 포인터가 떠났는데 설명이 남으면 어느 컨트롤의 설명인지
  알 수 없다. 키보드 focus는 지연 없이 연다 — 지연은 지나가는 포인터를 거르기 위한 것이고 focus는
  의도된 이동이다.
- **표면이 포인터 이벤트를 받지 않는다.** 받으면 표면 위로 포인터가 옮겨갔을 때 trigger가 이탈로
  판정돼 깜빡인다. 깜빡임의 원인이 표면 자신이 되는 구조다.
- **터치에는 열리지 않는다.** hover가 없고 길게 누르기는 컨텍스트 메뉴와 충돌한다.
- **trigger를 감싸지 않는다.** `cloneElement`로 속성만 붙인다. 래퍼를 두면 호출부의 flex/grid
  계산이 조용히 달라진다. 이것도 테스트로 고정했다.
- **anchor 간격을 자체 숫자로 갖지 않는다.** overlay 표면 CSS가 소유하고 Provider가 1회 측정한
  값을 쓴다. 처음 구현에서 이 값을 넘기지 않아 **간격이 0으로 붙어 있었고**, 브라우저 실측으로
  잡아 고친 뒤 테스트로 고정했다.

### primitive 소비자가 셋이 됐다

overlay primitive에서 **위치 계산과 portal만** 쓴다. focus scope·inert·scroll lock·dismissable
layer는 쓰지 않는다 — tooltip은 focus를 가져가지 않고 바깥 클릭을 삼키지도 않으므로, 붙이면 없는
문제를 위해 배경을 잠그게 된다. DS-D-0011의 소비자가 Menu·Dialog에 이어 셋이 된다.

### Known deviations

그룹 지연 건너뛰기(인접 trigger로 옮길 때 지연 생략), arrow, Figma component set이 없다. 열림
모션은 제품의 140ms 대신 DS `overlay-enter` 200ms를 썼다 — 제품 값을 들이려면 motion 토큰 추가가
선행이다.

## 2026-08-15 — Icon Button

gap registry 1순위를 구현했다. 세 화면 실측에서 raw `<button>` 108개 중 다수가 아이콘 전용이었고,
제품에는 이것을 담당하는 공용 컴포넌트가 없다.

### 왜 Button의 prop이 아닌가

**실측이 정했다.** `Button`을 아이콘 전용으로 렌더하면 md 54×38, sm 46×30으로 **정사각이 되지
않는다** — 빈 라벨과의 `gap` 8px과 좌우 padding이 남는다.

기하보다 결정적인 것은 접근성 계약이다. Button은 이름이 children에서 오므로 `label`을 필수로 만들
수 없지만, 아이콘 전용 버튼은 라벨이 없으면 **이름이 아예 없는 버튼**이 된다. "children이 비었을
때만 필수"는 타입으로 표현할 수 없다. `IconButton`은 `label`을 필수 prop으로 강제한다.

그 실측을 **테스트로 고정했다.** Button의 기하가 바뀌면 그 테스트가 실패하고, 그때 이 결정의
근거를 다시 판정해야 한다.

### Added

- [Icon Button](../components/icon-button.md) 규범과 `IconButton` public export
- `packages/css/src/component/icon-button.css`
- 컨트롤 높이 토큰 — `--kds-layout-control-height-md`(40) · `--kds-layout-control-height-sm`(32).
  gap registry가 지적한 "컨트롤 높이 토큰 없음"의 첫 해소이며, Figma 변수로도 함께 만들었다.
- Storybook `Components/Icon Button` story 5종. `WhyNotButton`은 두 컴포넌트를 나란히 두어
  정사각 차이를 눈으로 보게 한다.

### 계약

- **크기를 padding이 아니라 한 변의 길이로 정한다.** Button은 고정 높이가 없어 라벨·번역·확대에
  따라 자라지만, Icon Button은 정사각이 계약이므로 높이를 직접 소유한다.
- **히트 영역은 시각 크기와 분리된다.** 컴포넌트가 `.kds-hit-target`을 직접 붙여, sm이 32×32로
  보여도 실제 히트는 44×44다. 호출부가 감쌀 필요가 없다.
- **`pressed`는 토글에만.** 주지 않으면 `aria-pressed` 속성 자체가 붙지 않는다 — `false`를 늘
  붙이면 토글이 아닌 버튼이 보조 기술에 토글로 노출된다. 실브라우저에서 확인했다: Matrix story의
  11개 중 토글 2개에만 속성이 있고 나머지 9개는 `null`이다.
- **`pressed`와 `active`는 다른 축이다.** `active`는 누르고 있는 동안, `pressed`는 토글의 켜짐
  상태다. 같은 시각으로 표현하면 눌린 것인지 켜진 것인지 구분되지 않는다.
- 글리프는 두 size에서 모두 20px이다. 아이콘은 컨테이너와 독립이다(Iconography Size model).

### Known deviations

`loading` 상태가 없다 — 아이콘 자리에 무엇을 넣을지, Button의 loading과 같은 축인지 미정이다.
Figma component set도 아직 없다(DS-F-006 대상).

## 2026-08-15 — 세 화면 gap 합산과 카탈로그 순서

Highlight(허브·상세)와 Editor(허브·워크스페이스)를 추가로 실측해 Home과 합산했다. gap은 Home 72 ·
Highlight 130 · Editor 144다. 산출물은
[figma-gap-registry.md](../../migration/figma-gap-registry.md)다.

### 이 실측의 결론 하나

**제품에는 공용 컴포넌트 층이 사실상 없다.** 제품의 공용 UI 디렉터리는 파일 10개이고 그중 시각
컴포넌트는 넷뿐이다 — Button · VideoPlayer · InlineLoadingLabel · LoadingSpinner. 나머지는 브랜드
마크와 훅이다. 경로와 줄번호는 [gap registry](../../migration/figma-gap-registry.md)가 소유한다. 그래서 Klipse Design은 제품을 따라잡는 것이 아니라 **제품에 없던 층을 처음 만드는**
것이다. 실측이 찾은 중복 정의(ProjectCard 3벌, Menu 서피스 3벌, Spinner 5종, PaneDivider 6선언)는
전부 그 부재의 비용이다.

### 가장 강한 단일 신호 — 버튼 공용 사용률 6%

네 파일의 버튼을 직접 셌다. raw `<button>` **108개** vs 공용 `<Button>` **8개**. 제품에 Button이
있는데도 94%가 손으로 만들어진다. Button 하나로는 덮이지 않는다는 뜻이고, 빠진 축은 아이콘 전용
버튼·크기 단계·loading 상태다.

### 순서가 바뀌었다

Home만 봤을 때의 1순위는 ProjectCard였으나, 세 화면을 합치니 **IconButton · Tooltip · Toast**가
앞선다. Tooltip은 22개 파일, Toast는 20개 파일에 나타나는데 **제품 자신의 Button(17개 파일)보다
넓게 쓰이면서 공용 컴포넌트가 없다.** 한 화면만 보고 순서를 정했으면 틀렸을 자리다.

### 토큰 — 세 화면이 함께 요구하는 것

- **`radius-8`에 semantic 이름이 없다.** 에디터에서 가장 많이 쓰이는 radius다(직접 센 분포:
  8이 28회로 최다, 12가 20회, 999·6이 각 11회). Klipse semantic radius 5종에 8이 없다.
- **범주형 색 팔레트가 없다.** 에디터는 클립을 소스별로 색 구분한다(sky 63 · pink 19 · red 16 ·
  mint 13 · amber 12 · yellow 2). Klipse에는 status 4종뿐이다.
- **컨트롤 높이 토큰이 없다.** 에디터에 22/28/30/32/36/40/44/48 여덟 단계가 돈다.

### 실측 방법에서 배운 것

검증 단계에서 10건이 `confirmed=false`로 나왔는데, 읽어 보니 **전부 "gap 자체는 실재한다"고
확인하면서 세부 수치가 달라 false가 된 것**이었다. 판정 기준을 "하나라도 틀리면 false"로 준 탓에
"gap이 없다"와 "숫자가 틀리다"가 뭉개졌다. 그대로 읽었으면 IconButton·Slider·ProjectCard를 통째로
버릴 뻔했다. **그래서 이 registry의 수치는 직접 다시 센 값만 썼다.**

## 2026-08-15 — Home 재조립 검증과 gap registry

DS-F-007의 첫 화면. 앱 홈(`/archive`)을 Klipse Design 자산만으로 Figma에서 재조립해 **무엇이
없는지**를 측정했다. 산출물은 [figma-gap-registry.md](../../migration/figma-gap-registry.md)와
Templates 페이지의 coverage 프레임이다.

### 판정 — Home은 아직 gap 없이 재조립되지 않는다

제품 화면을 축 4개로 실측해 **321건을 측정하고 gap 72건**을 찾았다. Figma에 있는 것은 Button
component set 하나와 아이콘 26개뿐이라, 화면이 요구하는 ProjectCard · SidebarNavItem ·
AppTopBar · Menu · EmptyState · Avatar · Badge · BannerCarousel이 전부 없다.

그래서 이 단계의 재조립은 **픽셀 재현이 아니라 coverage 측정**이다. Templates의 프레임은
자홍색 파선으로 raw 영역을 드러내며, 그 파선이 화면 대부분을 차지한다는 사실 자체가 판정이다.

```
DS 자산에서 온 instance   7
gap 영역                  8
변수에 바인딩된 paint     46   (raw 7은 gap 표시선 자체)
```

### 토큰 — 이름만 보고 집으면 화면이 달라지는 것 둘

- **`radius-card` 20px ↔ 제품 카드 16px.** 프로젝트 카드·썸네일·배너·메인 카드·토스트가 전부
  16px인데 DS의 `radius-card`는 20px이고, 16px과 맞는 것은 `radius-overlay`다. 게다가
  `radius-card`의 유일한 소비처는 dialog의 sheet variant다 — **"카드"라는 이름의 토큰을 정작
  카드가 쓰지 않는다.**
- **`layout-project-card-minimum` 240px에 소비처가 없다.** DS는 `minmax(240px, 1fr)` auto-fill을
  전제하지만 제품은 minmax를 아예 쓰지 않고 브레이크포인트로 **열 수를 고정**한다
  (2 / 3@720 / 4@1200 / 5@1800). `packages/css` 어디서도 참조되지 않으며 규범 문서에서만 언급된다 —
  **존재하지 않는 알고리즘을 기술하는 토큰이다.**

둘 다 판정이 필요하다. DS를 제품에 맞출지, 제품 migration을 기록할지는 owner의 결정이다.

### 그 밖에 확인된 divergence

- 라이트 팔레트가 앱 셸 스코프(`body:has(.gnb-wrapperSidebar)`)에서 통째로 재정의된다. 캔버스가
  `#eeeef1`, 표면이 `#f8f8f9`로 DS의 `#f1f1f3` / `#fafafa`와 다르다. **다크는 정확히 일치한다.**
- 카드 테두리가 border가 아니라 spread-only 0.5px box-shadow다. DS `elevation/*` 4종은 전부 blur가
  있어 재현할 수 없다.
- `magic-wand`는 사이드바 "비디오 에디터"의 실사용 아이콘인데 −45° 회전 때문에 이관을 보류했다.
  이 화면이 실사용처이므로 처분 판단이 필요하다.

### 제품 부채로 분류한 것

DS가 고칠 문제가 아니라 adoption 노트로 넘긴다. 삭제 모달의 액션이 공용 Button을 쓰지 않고,
primary 버튼이 3-stop 그라디언트이며, z-index 체계가 DS layer 토큰과 다르고, 렌더되지 않는 죽은
스타일이 남아 있다. `--app-gnb-main-card-padding-block-start: 20px`은 선언만 있고 아무도 읽지
않으므로 **문서만 보고 20px을 넣으면 틀린다.**

## 2026-08-14 — Iconography 규범과 아이콘 파이프라인

### Added

- [Iconography](../foundations/iconography.md) foundation과
  [DS-D-0008](../governance/decisions/DS-D-0008-icon-source.md) — 아이콘 정본 구조 결정
- 크기 토큰 `--kds-icon-size-{sm,md,lg}` = 16 / 20 / 24px, `packages/css/src/component/icon.css`
- `scripts/build-icons.mjs`와 `scripts/verify-icon-gates.mjs`(변조 canary 11종)
- 정본 글리프 **26개** — Phosphor 21 · Iconoir 3 · Lucide 2
- `packages/react/THIRD-PARTY-NOTICES.md` — upstream 라이선스 원문을 생성으로 동봉한다

### 이관 방식과 그 근거

**정본은 제품 사본이 아니라 upstream 원본에서 만들었다.** 제품 자산은 Figma를 거치며 arc가 cubic으로
평탄화되고 색이 하드코딩돼, 정본으로 삼으면 "왜 좌표가 upstream과 다른가"를 영원히 설명해야 한다.

Phosphor는 256 격자 stroke 16이고 Klipse는 24 격자 stroke 1.5다. `24/256 = 3/32`이고 분모가 2⁵이라
모든 결과가 **유한소수이자 IEEE754에 정확히 표현되는 값**이다 — 0~256 정수 전 구간을 대조해 오차 0을
확인했다. 획 비율도 `16/256`과 `1.5/24`가 똑같이 `1/16`이라, 좌표와 같은 인자로 곱한 획이 계약값에
정확히 떨어진다.

**변환 결과를 픽셀로 검증했다.** upstream과 정본을 같은 뷰포트에 256px로 그려 대조한 결과 27개 중
24개가 완전 일치, 1개가 0.002%(안티에일리어싱)였다. 나머지 2개는 Lucide의 `copy`/`copy-check`로,
잉크비가 정확히 `1.5/2 = 0.75`다 — 계약에 맞춘 두께 변경 외에 달라진 것이 없다는 뜻이다.

### Wave B 판정 — 제품 자산과 대조

Phosphor 이름을 가졌으나 출처가 미확정이던 7개를 제품 자산과 픽셀 대조했다.

| 결과 | 글리프 | 근거 |
| --- | --- | --- |
| Wave A로 승격 | `arrow-up` `download-simple` `trash-simple` | 제품 자산과 **픽셀 완전 일치**. 출처 Phosphor 확정 |
| Wave B 유지 | `lightbulb`(22.5%) `caret-double-right`(19.3%) | 잉크량은 같으나 배치가 다르다 — 같은 글리프가 아니다 |
| Wave B 유지 | `align-left-simple` `align-right-simple`(14.9%) | 잉크비 0.512. 제품 쪽이 채움 도형이다 |

### 이번 범위에서 제외

- **`magic-wand`.** 지팡이 몸통이 −45° 회전한 둥근 사각형이라 `transform` 없이는 표현되지 않는다.
  회전을 path로 굽는 것은 좌표를 옮기는 것이 아니라 **새로 그리는 것**이라 이관이 아니다. 계약에
  `transform`을 여는 것과 다시 그리는 것 중 무엇을 택할지는 별도 판단으로 남긴다.
- `x-circle`은 제품이 Fill 변종을 썼으나 정본은 regular를 채택했다. 세트가 1.5 획으로 통일돼야
  시각 언어가 갈리지 않는다. 외형이 바뀌므로 owner 확인이 필요하다.

### Changed — 규범

- **provenance 없는 글리프는 채택되지 않는다.** `origin`이 `original`이 아니면 프로젝트·아이콘
  이름·라이선스·라이선스 파일·출처 URL·취득일을 전부 갖춰야 하고, 빈 값과 `"unknown"`은 빌드
  실패다. 추정 출처를 사실로 승격시키는 경로를 규범에서 없앤다.
- **upstream 글리프는 고지문과 함께만 배포한다.** MIT와 ISC가 공통으로 요구하는 "copies에 고지를
  포함한다"를 사람의 기억이 아니라 생성기가 이행한다. 고지문 없이 배포하는 경로는 존재하지 않는다.
- **정본은 정규화된 형태로만 커밋한다** — viewBox `0 0 24 24`, `stroke-width` 1.5 하나, 색은
  `currentColor`와 `fill="none"`만, `id`/`clip-path` 금지. 좌표 스케일 변환은 이관 시 한 번만 한다.
- 아이콘의 기본값은 **장식**이다. `label`을 주지 않으면 `aria-hidden="true"`가 된다. 아이콘 전용
  버튼의 이름은 버튼이 소유하므로 아이콘에 `label`을 주지 않는다.
- **서브패스 `@klipse-design/react/icons`를 열었다.** Wave A 전체가 게이트를 통과한 뒤였고,
  `verify-gates`의 react 계약과 브라우저 테스트가 모두 공개 경로를 쓴다. 제거는 breaking이므로
  글리프 이름과 심볼은 이제 공개 계약이다. `files`에 `THIRD-PARTY-NOTICES.md`가 포함돼, 패키지를
  받는 쪽이 라이선스 원문을 함께 받는다.
- Storybook에 `Foundations/Iconography` story 4종을 추가했다 — Overview·Sizes·InheritsColor·
  InButton. **실루엣 정확성은 게이트가 판정하지 못한다**고 규범이 선언한 그 공백을 메우는 자리다.

### 외형이 바뀌는 것 — owner 확인이 필요하다

| 글리프 | 무엇이 바뀌나 | 왜 |
| --- | --- | --- |
| `eye-slash` | 채운 동공 → **감은 눈** | 제품의 `eyeslash.svg`에는 **빗금이 없다.** `eye`와 같은 눈꺼풀 호에 동공만 채운 것이고, 채운 동공은 "숨김"이 아니라 오히려 "더 보임"으로 읽힌다. 제품 호출부 17곳 |
| `x-circle` | Fill 변종 → regular | 세트가 1.5 획으로 통일돼야 시각 언어가 갈리지 않는다 |
| `text` | 획 2 → 1.5 | 24 격자 계약. 잉크량 0.75 |

### 적대적 감사가 찾은 파서 결함

파이프라인을 세운 직후 **통과시켜서는 안 될 입력**으로 게이트를 공격했고, 위음성이 나왔다.

- **작은따옴표로 쓴 요소가 조용히 사라졌다.** `<path id='x' stroke='#ff0000' stroke-width='9'/>`가
  게이트를 통과하면서 **동시에 생성물에서 빠졌다.** 파서가 큰따옴표 형태만 인식했고, 못 읽은 것을
  거부가 아니라 무시로 처리했기 때문이다. 계약 위반이 통과하는 것도 나쁘지만, 파이프라인이
  디자이너가 그린 것을 말없이 바꾸는 쪽이 더 나쁘다.
- 고침은 두 갈래다. XML에서 두 따옴표는 동등하므로 **둘 다 받고**, 그와 별개로 **본 태그 수와
  처리한 태그 수가 일치하는지** 검사한다. 앞으로 어떤 문법 변종이 나와도 "못 봤다"가 "통과"가
  되지 않는다.
- 같이 막은 것들: root `<svg>`에 표현 속성 주입, `"Unknown"` 대소문자 우회, `modifications` 누락,
  provenance 문자열로 고지문 절 구조 위조, `"https://"` 한 줄짜리 sourceUrl, 이름이 다른 두
  글리프가 같은 심볼로 방출(`x-2`와 `x2`), 같은 그림을 두 이름으로 두어 고지 의무 가리기.
- canary가 11종에서 **20종**이 됐다. 게이트와 모델이 각자 들고 있던 필수 필드 목록도 하나로 합쳤다 —
  두 벌이면 한쪽에 필드를 더할 때 다른 쪽이 조용히 뒤처진다.

### 게이트 강화 둘 — 아이콘과 무관하게 적용된다

- **`verify-figma-parity`의 변조 canary가 실패 상태에서도 돈다.** 이전에는 `failures.length === 0`일
  때만 돌아서, parity가 깨진 동안 검출력 증명 7종이 통째로 멈췄다. 게이트가 가장 못 미더운 시점에
  게이트의 보증이 사라지는 순서였다. 판정을 "변조가 baseline에 없던 실패를 새로 만드는가"로 바꿨다.
- **`build-css`가 존재하지 않는 토큰 참조를 잡는다.** CSS는 정의되지 않은 커스텀 속성을 오류로
  만들지 않고 그 선언만 무효로 만들어서, 오타가 "그 규칙을 안 썼을 때"와 구분되지 않았다.

### Figma — `icon/*` component 26개

draft 라이브러리 파일에 정본에서 생성한 component 26개를 만들었다. `icon/{kebab}` 개별
component이고 **크기 variant를 두지 않는다** — 두면 코드의 `IconSize`와 Figma variant가 두 정본이
되어 4px 격자를 누가 소유하는지 모호해진다.

- 전부 24×24, stroke 두께 1.5, cap ROUND. **raw stroke 0 / raw fill 0**으로 DS-F-006의 "raw 값 0"을
  만족한다. Figma에는 `currentColor`가 없어 전부 `color/foreground-primary`에 바인딩했다.
- `createNodeFromSvg`가 프레임에 **흰색 fill을 붙인다.** 그대로 두면 raw 값이 하나 생기므로
  생성 직후 지운다. 실측으로 확인한 동작이다.
- parity가 **요소 분해 보존**을 대조한다 — 코드 `elementCount` ↔ Figma `vectors`. 26개 전부
  일치했다. 좌표까지 대조하지 않는 이유는 Figma vector 왕복 손실을 아직 실측하지 않았기
  때문이고, 도형이 병합되거나 사라지는 사고는 좌표를 보지 않아도 이것으로 드러난다.
- parity canary가 7종에서 **11종**이 됐다(아이콘 제거·frame 변조·raw paint·요소 수). canary 수는
  이제 tamper 배열에서 파생돼 목록과 어긋날 수 없다.
- `figma-sync.md`에 되읽기 규칙 둘을 추가했다. **페이지를 명시적으로 전환한 뒤 세지 않으면
  component가 조용히 0개로 나온다** — 실제로 겪은 사고이고, 덤프가 "없음"과 "안 봄"을 구분하지
  못하는 형태다.

publish는 여전히 `not-ready`다. publish API가 존재하지 않으므로 owner가 Figma UI에서 수동으로
해야 하며, 그 전에는 어떤 상태도 올리지 않는다.

### Added — Figma snapshot 재생성 경로

`.prettierignore`는 snapshot이 "dump가 쓰는 것"이라고 선언했지만 그 dump가 없었다.
`figma/readback.json`(Plugin API 되읽기 원본)과 `scripts/build-figma-snapshot.mjs`(projection과 drift
검사)로 나누고 재생성 절차를 스크립트 헤더에 담았다. `pnpm verify`가 둘의 일치를 강제한다.

### Known deviations

- 글리프의 **실루엣 정확성은 게이트가 판정할 수 없다.** 정규화·해시·이름·고지는 기계가 잡지만
  "이 그림이 맞는가"는 사람의 시각 review다.
- Wave B 14개는 좌표 대조로 upstream을 특정하지 못했다. 재작도하거나 채택하지 않는다.

## 2026-08-14 — Dialog 공개

### Added

- `Dialog` compound — `DialogSurface`, `DialogHeader`, `DialogTitle`, `DialogDescription`,
  `DialogBody`, `DialogFooter`, `DialogActions`, `DialogClose`, `DialogCancel`, `DialogConfirm`
- `useDialogClose()` — 소비자가 자기 footer를 직접 그릴 때의 confirm/cancel 발행 통로
- `packages/css/src/component/dialog.css`

### Changed — 규범

- `Migration` 2번이 바뀌었다. `ConfirmDialog`/`TaskDialog`/`MediaWorkbenchDialog` 세 recipe 대신
  **단일 `Dialog` + `variant`** 다. 셋의 차이는 초기 포커스·dismiss 기본값·크기 tier 세 값뿐이고,
  그것을 세 컴포넌트에 흩으면 규범이 한 곳에서 읽히지 않는다.
- **variant 자동 전환을 하지 않는다.** 뷰포트 폭으로 `task`를 `sheet`로 바꾸면 dismiss 정책과 초기
  포커스가 화면 크기에 따라 달라진다 — Surface classifier가 금지한 것의 축소판이다.
- `media-workbench`의 초기 포커스가 "heading 또는 첫 핵심 컨트롤"에서 **dialog surface**로 바뀌었다.
  surface가 포커스를 가지면 스크린리더가 이름을 먼저 읽고 다음 Tab이 내용으로 들어간다.
- `closeOnBackdrop`이 `dismissible`에 종속된다. 실효값은 `closeOnBackdrop && dismissible && !busy`다.
- **dismiss 차단 안내가 Dialog의 의무가 됐다.** `onDismissBlocked`는 추가 훅이지 안내의 유일한 출처가
  아니다. 선택으로 두면 소비자가 아무것도 넘기지 않았을 때 차단이 완전히 무음이 되고, 사용자는
  Escape가 고장난 것으로 인지한다.
- `alertdialog`를 지원하지 않기로 확정했다. `role`을 prop으로 여는 것이 Workspace 오용의 최단 경로다.
- 제목과 설명이 prop이 아니라 하위 컴포넌트다. 설명을 prop으로 받으면 렌더되지 않았을 때
  `aria-describedby`가 없는 id를 가리킨다 — 화면상 아무 이상이 없는 접근성 회귀다.

### 구현이 드러낸 primitive 결함 둘

- **modal의 focus 복원이 배경이 inert인 상태에서 일어나 body로 떨어졌다.** inert 요소는 `focus()`를
  조용히 무시한다. 격리 해제를 복원보다 앞으로 옮겼다. non-modal에는 격리가 없어 Menu에서는 드러나지
  않던 경로다.
- **focus trap이 복원된 포커스를 다시 끌어왔다.** 하부 유틸의 trap 해제는 passive effect인데 복원은
  layout effect라, 그 시점에 리스너가 아직 살아 있다. 닫히는 subtree를 **복원 전에** inert로 만들어
  되끌기 대상을 없앴다.
- **scroll lock의 위치 복원이 기본 경로에서 no-op이었다.** owner가 `document.body`인데 표준 모드에서
  뷰포트 스크롤 위치는 `document.scrollingElement`에 있어 `body.scrollTop`은 항상 0이다.

### Current impact

`@klipse-design/react`를 쓰는 앱은 `OverlayProvider`가 이미 있으면 추가 작업이 없다. Dialog는
controlled 전용이며 `open`과 `onOpenChange`가 필수다.

## 2026-08-14 — 컴포넌트 워크샵

### Added

- `apps/storybook` — Storybook 10. `pnpm --filter @klipse-design/storybook dev`
- Button·ActionMenu·CompositePopover 스토리와 light/dark 테마 툴바

### Changed

- **Button 라벨이 좁은 폭에서 글자 단위로 쪼개지던 것을 고쳤다.** `overflow-wrap`을 `anywhere`에서
  `break-word`로 바꿨다. `anywhere`는 min-content 폭까지 낮추므로 flex 컨테이너 안에서 버튼이 한 글자
  폭까지 줄어든다(실측 74px → 38px). 시각 변경이지만 API는 그대로다.

### 워크샵이 이것을 위해 있다

셋 다 기존 테스트가 통과하던 상태였다 — 계산값 단언은 "잘리지 않았다"와 "토큰을 쓰고 있다"를 볼 뿐
"어떻게 보이는지"를 보지 않는다.

- Button 라벨 쪼개짐 (고침)
- Menu Trigger의 기본값이 스타일 없는 네이티브 버튼 (`asChild`가 의도된 경로임을 문서화)
- danger item의 톤이 일반 item과 구분되지 않음 — 대비 light 1.21 / dark 1.14 (DS-P3-014 단위 9로 이관)

### 이것은 시각 회귀가 아니다

스냅샷 baseline을 만들지도 커밋하지도 않고 어떤 게이트도 렌더 결과를 검사하지 않는다.
컴포넌트 승격 조건의 visual regression 항목은 그대로 남아 있다.

### Current impact

소비자에게 달라지는 것은 Button의 줄바꿈 동작 하나뿐이다.

## 2026-08-14 — Menu / Popover 공개

### Added

- `ActionMenu`, `ActionMenuTrigger`, `ActionMenuContent`, `ActionMenuItem`, `ActionMenuLinkItem`,
  `ActionMenuGroup`, `ActionMenuSeparator`, `ActionMenuSub`(+`SubTrigger`/`SubContent`)
- `CompositePopover`, `CompositePopoverTrigger`, `CompositePopoverContent`, `CompositePopoverTitle`
- `OverlayProvider` — **앱 root에 한 번 두어야 하는 공개 진입점**
- `useOverlayBranch()` — React 트리 밖에서 만든 nested overlay를 같은 branch로 등록한다
- `packages/css/src/component/menu-popover.css`

### 소비자가 해야 하는 것

`OverlayProvider`를 앱 root에 한 번 렌더한다. 없으면 Menu가 던진다.

```tsx
<OverlayProvider>
  <App />
</OverlayProvider>
```

host와 scroll owner를 앱이 한 번만 해석하게 하는 것이 계약이다. 컴포넌트가 host를 고르면 인스턴스마다
stacking과 inert 경계가 달라진다.

### Changed

- `menu-popover.md`의 Properties 표가 바뀌었다. `kind`는 prop이 아니라 **컴포넌트 정체성**이고,
  `open`은 조건부 필수(+`defaultOpen`)이며, `offset`·`collisionPadding`·`branchId`는 prop이 아니다.
- `onOpenChange`의 reason 어휘에 **`programmatic`** 이 추가됐다. 소비자가 `open`을 직접 내려 닫는
  경로가 실제로 소비자에게 도달하는데 기존 5종이 그것을 덮지 못했다.
- `disabledItems`가 생겼다. disabled 표기를 한 menu 안에서 섞지 않게 **menu 단위**로 고른다.
- 새 `## Focus` 절이 variant별 초기 focus와 reason별 return focus를 소유한다.
- `menu-popover`의 Web 상태가 `not-ready` → `partial`.

### 구현에서 규범이 강제한 것

- **프로필 패널에 `role="menu"`를 붙일 수 없다.** 컴포넌트를 둘로 나눠 타입과 런타임에서 모두 막는다.
- **`Enter`/`Space`에 keydown 핸들러를 붙이지 않는다.** 브라우저가 이미 click을 합성하므로 더하면 두 번
  실행된다. `<a href>`만 예외다 — `<a>`의 Space는 click을 합성하지 않고 페이지를 스크롤한다.
- **키보드 리스너를 native로 붙인다.** React 이벤트는 React 트리로 전파되는데 submenu의 Content는
  부모의 React 서브트리 안이라, React 핸들러를 쓰면 submenu의 방향키가 부모까지 실행해 focus가 튀고
  그 focusout이 submenu를 닫는다. 두 panel은 DOM에서 형제라 native에는 그 문제가 없다.
- **item에 `.kds-hit-target`을 쓰지 않는다.** 44px `::after`가 항목 중앙에 겹쳐 놓여, 간격 없이 쌓이는
  행에서 인접 항목의 hit 영역을 2px씩 가로챈다. "삭제"가 "설정" 아래에 있으면 그대로 사고다.

### Known deviations

한국어 typeahead가 동작하지 않는다(IME 켜진 비편집 요소의 keydown이 완성 음절을 주지 않는다).
RTL에서 `ArrowRight`/`ArrowLeft`가 반전되지 않는다. 바깥 클릭도 최상위 branch 하나만 닫으므로
submenu가 열려 있으면 두 번 눌러야 전체가 닫힌다. 전체 목록은 `menu-popover.md`의 Known deviations에 있다.

### Current impact

`@klipse-design/react`를 이미 쓰는 앱은 `OverlayProvider`를 추가하기 전까지 Menu를 쓸 수 없다.
Button만 쓰는 앱에는 영향이 없다.

## 2026-08-14 — Overlay behavior layer

### Added

- `packages/react/src/overlay/` — Menu와 Dialog가 공유할 순서·정책 계층. portal host 해석, presence
  FSM, branch registry, layer stack, dismiss 정책, focus 정책, inert, scroll lock, activation guard,
  id 발급, anchor 배치를 각각 독립 모듈로 분리했다.
- `packages/css/src/component/overlay.css` — 하부 positioning 유틸의 변수를 `--kds-overlay-*`로
  재발행하는 **단일 seam**. 유틸을 교체하면 이 블록 5줄만 바뀐다.
- `base.css`에 두 규칙 — `[data-kds-state="opening"]`(비가시·비 hit-test)와
  `[data-kds-scroll-locked="true"]`.
- fixture 2종과 실브라우저 회귀 45건, node 단위 14건.

### 이 계층이 필요한 이유

하부 유틸의 layer stack은 **등록 순서**로 최상위를 정한다. React는 effect를 자식 → 부모 순으로
돌리므로 부모와 자식 overlay가 같은 commit에 열리면 **부모가 최상위**가 된다 — DOM 중첩과 정반대다.
`overlay-store.node.test.ts`가 같은 입력에서 두 규칙이 갈리는 것을 고정한다.

### Changed

- **소비자에게 달라지는 것은 없다.** `@klipse-design/react`의 public 표면은 그대로 `Button`
  하나이며 `exports`와 패키지 게이트도 변하지 않았다. overlay는 recipe의 구현 세부다.
- `@klipse-design/css`의 `styles.css`에 overlay recipe가 추가됐다. `.kds-overlay-panel`을 쓰지 않는
  앱에는 영향이 없다.
- `menu-popover.md`와 `dialog.md`의 pre-implementation blocker 중 primitive 부재 항목이 해소됐다.
  두 컴포넌트의 `Web` 상태는 **`not-ready` 그대로다** — primitive는 카탈로그 컴포넌트가 아니다.

### 구현에서 규범이 강제한 것

- 바깥 `pointerdown`은 아무것도 닫지 않는다. dismiss는 후속 `click`에서 commit되고 그 click은 배경에
  도달하기 전에 소비된다. pointerdown에서 닫으면 착지점이 사라져 선택이 0회가 되는데, 그것이 규범이
  차단급으로 지정한 "열리지만 선택되지 않음"이다.
- 닫힐 때 focus는 root가 **아직 DOM에 있는 동안** 동기로 돌아간다. 하부 유틸의 복원은 비동기라
  대상이 사라진 뒤에 실행될 수 있다.
- exit 시간과 unmount 시점이 같은 CSS 선언에서 온다. reduced-motion에서 둘 다 0이 되며 **순서는
  동일하다**.

### Known deviations

- iOS Safari의 `overflow: hidden` scroll lock은 headless Chromium으로 검증할 수 없어 미확인이다.
- non-modal에서 Tab으로 이탈해 닫힐 때 reason은 `outside`다. 새 어휘를 만들지 않은 이유는
  [DS-D-0011](../governance/decisions/DS-D-0011-overlay-primitive-boundary.md)에 있다.

### Current impact

`@klipse-design/react`를 쓰는 앱이 지금 해야 할 일은 없다. Menu(DS-P3-006)와 Dialog(DS-P3-007)가
공개되면 그때 `OverlayProvider`를 root layout에 한 번 두게 된다 — host와 scroll owner를 앱이 한 번만
해석하도록 강제하는 것이 계약이기 때문이다.

## 2026-08-14 — Figma Button component와 코드↔디자인 parity

### Added

- Figma 라이브러리에 `Button` component set 40 variant (Variant 4 × Size 2 × State 5). fill 72와
  stroke 18이 전부 변수 바인딩이고 텍스트 40개가 전부 text style이다 — **raw 값 0**.
- parity 게이트가 **Figma variant 옵션을 코드 타입 선언과 대조**한다. `Variant`는 `ButtonVariant`와,
  `Size`는 `ButtonSize`와 집합이 같아야 한다. Figma에만 있는 `State`는 사유와 함께 계약에 선언돼야
  통과하고, 선언되지 않은 property가 생기면 실패한다.
- 변조 canary가 7종으로 늘었다 — 값·alias·collection·**mode 순서**·style·**component variant 옵션**·
  **component raw 값**.

### Fixed

**Figma가 Dark를 기본 모드로 쓰고 있었다.** mode를 알파벳 정렬한 탓인데, token source는
`themes: ["light", "dark"]`로 light를 먼저 선언하고 CSS도 `:root`가 light다. 라이브러리를 열면
기본 표시가 다크로 나오는 상태였다.

생성기가 source가 선언한 theme 순서를 따르도록 고치고 `defaultMode`를 proposal에 명시했다. parity
게이트는 이제 mode 순서를 정렬하지 않고 **그대로 비교**하며 기본 모드도 검증한다. token graph는
바뀌지 않아(projection만 변경) baseline 갱신은 필요 없었다.

이 결함은 component를 만든 뒤 **스크린샷을 눈으로 확인하다** 발견했다. 값 대조만으로는 드러나지
않는 종류였다.

### Changed

- Button의 Figma 상태를 `partial`로 올렸다. `done`은 publish(DS-F-008) 이후다.
- token consumer fixture가 mode 순서를 source의 `themes`에서 도출해 비교하고 기본 모드를 검증한다.

### Current impact

Figma 라이브러리는 여전히 publish되지 않았다. Button 외 component는 아직 없고, 나머지 7종은 각자
코드 구현이 생긴 뒤에 만든다.

## 2026-08-14 — 첫 컴포넌트: Button

### Added

`@klipse-design/react`가 처음으로 public export를 갖는다.

```tsx
import { Button } from "@klipse-design/react";

<Button variant="primary">새 프로젝트 만들기</Button>
```

- `packages/react/src/button/button.tsx` — `tsc` + `isolatedDeclarations`로 빌드된다.
- `packages/css/src/component/button.css` — 상태는 `data-*`, 값은 semantic 토큰만.
- 실브라우저 acceptance test 11건이 [Button 규범](../components/button.md)의 Acceptance tests를
  그대로 검증한다.

### 구현에서 규범이 강제한 두 가지

- **활성화를 네이티브 `<button>`에 맡긴다.** pointer click·Enter·Space가 각각 정확히 한 번
  실행되는 것은 브라우저가 보장한다. keydown으로 클릭을 흉내 내면 중복 실행이 된다.
- **`loading`은 네이티브 `disabled`를 쓰지 않는다.** 네이티브 disabled는 현재 focus를 제거하는데
  규범이 이를 금지한다. `aria-disabled`로 표시하고 activation을 명시적으로 막으며, 실제 포인터는
  actionability가, 프로그램적 click과 keyboard는 컴포넌트가 막는 두 층으로 검증한다.

### Changed

- Button의 Web 상태를 `partial`로 올렸다. 근거는 public export와 acceptance test 11건이며,
  `done`에는 visual regression·수동 screen-reader review·SSR·Figma component·제품 사용처가 남는다.
- `pnpm build`에 `build:react`가 연결됐다.
- Availability canary를 하드코딩 문자열에서 정규식으로 바꿔 상태가 바뀌어도 동작하게 했다.

### Known deviations

- `danger` variant가 tonal이다. solid를 표현할 `color-action-danger*` 토큰이 없다.
- 고정 높이 토큰이 없어 높이를 padding과 line-height로 결정하고 44px 타깃은 `kds-hit-target`이
  보장한다.

둘 다 DS-P3-014가 해소한다.

### Current impact

Figma는 여전히 publish되지 않았고 Button의 Figma 상태도 `not-ready`다. 제품 adoption은 바뀌지
않았다. 다음은 overlay behavior layer이며, Button의 코드 구현이 생겼으므로 Figma component
작업(DS-F-006-button)도 열렸다.

## 2026-08-14 — CSS foundation package

### Added

`@klipse-design/css`가 처음으로 실제 public surface를 갖는다. 저작 원본
`packages/css/src`에서 `scripts/build-css.mjs`가 배포 CSS를 생성한다.

| 서브패스 | 내용 |
| --- | --- |
| `./layers.css` | `@layer` 순서 선언만. root layout 최상단에서 가장 먼저 import |
| `./tokens.css` | 토큰 CSS 재export |
| `./styles.css` | base + 컴포넌트, 언레이어드 |
| `./styles.layer.css` | 같은 내용, layer 래핑 |
| `./reset.css` | opt-in reset, `:where()` 기반 |

두 벌 배포는 Tailwind 소비자가 유틸리티로 라이브러리 스타일을 이길 수 있게 하기 위한 것이다.
`styles.css`와 `styles.layer.css`를 동시에 import하지 않는다.

base 유틸리티는 `kds-visually-hidden`, `kds-focus-ring`, `kds-hit-target`, `kds-layer-*`,
그리고 `[data-kds-state]`의 closing/closed 계약이다.

### 게이트

`scripts/verify-css-gates.mjs`가 저작 규칙 위반을 실제로 잡는지 canary 6종으로 증명한다 —
`!important`, 숫자 z-index, raw color 리터럴, primitive 직접 소비, reset 밖 전역 선택자,
그리고 생성물 drift. `pnpm verify`에 연결됐다.

브라우저 테스트 6건이 계산값과 실제 상호작용을 확인한다. 특히 focus-visible이 **키보드 포커스에서만**
나타나고 포인터 클릭에서는 나타나지 않는 것까지 검증한다 — 문자열 검사로는 불가능한 항목이다.

### Changed

- `pnpm build`에 `build:css`, `pnpm check`에 `check:css`, `pnpm verify`에 `verify-css-gates`가
  연결됐다.
- manifest의 `webPackages`에서 css의 `web`을 `partial`로 올렸다. 근거는 5개 서브패스, canary 6종,
  브라우저 테스트 6건이며 **컴포넌트 CSS는 아직 없다**.

### Current impact

React 패키지는 여전히 소스가 없고 `not-ready`다. 컴포넌트 recipe는 DS-P3-004부터 각 컴포넌트와 함께
붙는다. Figma와 제품 adoption 상태는 바뀌지 않았다.

## 2026-08-14 — 테스트 harness 구축과 게이트 전환

### Added

- **Vitest 실브라우저 harness** — project 3개(`node`, `browser`, `browser-reduced-motion`).
  reduced-motion은 provider 수준 옵션이라 instance가 아니라 project로 나눈다.
- **TypeScript 설정 3단** — `tsconfig.base.json`(공통 strictness) / `tsconfig.build.json`
  (declaration + `isolatedDeclarations`) / `tsconfig.json`(typecheck). `pnpm typecheck`가
  `pnpm check`에 연결됐다.
- `scripts/verify-test-harness.mjs` — 각 project에 의도적 실패 테스트를 심어 러너가 실패를
  전파하는지 증명하고, 제거 후 실제 suite가 통과하는지 확인한다. `pnpm verify`에 연결됐다.
- **첫 실테스트 20건.** 토큰 CSS가 브라우저에서 theme 계약대로 계산되는지(기존 게이트는 CSS 문자열만
  검사한다), 소비자 관점의 token 공개 계약, 그리고 실행 환경이 실제 브라우저인지 검증한다.
- scaffold 게이트 canary 2종 — 선언 밖 exports, CSS 노출 패키지의 `sideEffects` 누락 (canary 17 → 19).

### Changed

- manifest schema에 `webPackages`를 추가해 CSS/React 패키지 상태와 evidence를 표현한다.
  `tokenPackage.figmaLibrary`·`packageRelease`의 고정값도 status enum + evidence 요구로 완화했다.
- `packages/tokens`에 `sideEffects: ["*.css"]`와 `./package.json` export를 명시했다.
- CI에 `pnpm install --frozen-lockfile`, `pnpm build`, tracked 검사를 추가했다. 의존성 0 전제가 여기서
  끝난다.
- 저장소에 devDependencies가 생겼다 — TypeScript, Vitest, Playwright, `axe-core`.

### spike 실측 결과 (저장소 밖)

- **S1 — 하부 유틸 조합이 Menu 규범을 충족한다.** item 클릭 시 select가 정확히 한 번, 바깥 클릭은
  dismiss만, **중첩 portal item도 정확히 한 번 선택**, closing layer가 pointer를 놓으면 아래 control이
  클릭됨. 그리고 규범 위반 상태를 일부러 만들면 실제로 실패한다(검출력 확인). 완제품 라이브러리가
  실패한다고 보고된 중첩 portal 선택이 하부 유틸에서는 통과한다.
- **S3 — `tsc`의 `isolatedDeclarations` emit이 정상 동작**하고, `inert`가 실행 브라우저에 구현돼
  있다. 이전 major로의 fallback은 필요 없다.

### 왜 jsdom을 쓰지 않는지 기계적으로 강제한다

`packages/tokens/test/environment.browser.test.ts`가 레이아웃 계산, hit test,
`HTMLDialogElement`의 modal/non-modal 구분, `inert`를 확인한다. jsdom이나 happy-dom으로 후퇴하면 이
테스트가 실패하므로, DS-D-0005의 "조용한 다운그레이드 금지" 규칙이 문서가 아니라 게이트로
강제된다.

### Current impact

CSS·React 패키지는 여전히 소스가 없고 상태는 `not-ready`다. Web과 Figma 상태, 제품 adoption은 바뀌지
않았다. 다음 작업은 DS-P3-003(CSS foundation package)이다.

## 2026-08-14 — Web 아키텍처 Decision 6종

### Added

코드 트랙(P3)의 선행 결정을 모두 `proposed`로 기록했다. 파일·의존성 변경은 아직 없다.

| Decision | 결정 |
| --- | --- |
| `DS-D-0002` Web 지원 범위 | React 19 단일 major · ESM 전용 · leaf `"use client"` · `baseline widely available` · `tsc` + `isolatedDeclarations` |
| `DS-D-0003` behavior dependency | 하부 유틸만 채택하고 **Menu의 선택 순서와 Dialog의 mode·Escape·scroll lock은 Klipse가 소유**. 완제품 미채택 |
| `DS-D-0004` CSS 저작 방식 | authored plain CSS + cascade layer 두 벌 · 상태는 `data-*` · 런타임 스타일 라이브러리 0 · reset opt-in |
| `DS-D-0005` test stack | 실브라우저 러너를 1단계에 둔다. **jsdom·happy-dom 배제** |
| `DS-D-0006` versioning | changesets `fixed`로 css·react 동반 버저닝 · css를 required peer로 강제 |
| `DS-D-0009` font distribution | 폰트 미동봉 · 교체 지점을 변수 하나로 단일화 · 폴백 스택 교정 |

### Why

두 결정은 **조사에서 나온 반증**에 근거한다.

- **완제품 overlay 라이브러리를 채택하지 않는 이유:** 후보 라이브러리에 "중첩 메뉴 item이 선택
  콜백을 발화하지 않음", "collision으로 뒤집힌 submenu가 click 착지 전에 닫힘", "Dialog가 오픈 직후
  첫 프레임에 pointer 이벤트를 막음"이 **미해결 이슈로 존재**한다. 셋 다 이 저장소의 규범이 명시적
  금지 계약으로 적은 실패다. 그래서 순서와 정책 계층을 우리가 소유한다.
- **jsdom·happy-dom을 배제하는 이유:** jsdom의 `HTMLDialogElement`는 사실상 빈 클래스라
  `showModal()`이 없고, happy-dom은 `showModal()`과 `show()`가 완전히 동일하다. 즉 **modal과
  non-modal을 구분하는 테스트가 구현이 실제로 둘을 구분하든 안 하든 통과**한다. 초록 테스트가 규범
  위반을 은폐하는 것은 이 저장소가 금지하는 fake completion과 같은 결과다.

### 발견한 결함

`--kds-font-family-sans` primitive가 CSS로 방출되지 않고, 동일한 폰트 스택 리터럴이
`--kds-typography-*-font-family`에 **15번 중복 인라인**된다. 소비자가 폰트를 교체하려면 15개를 전부
덮어야 한다. 또한 폴백 스택의 `Inter`·`Noto Sans KR`·`Noto Sans JP`는 시스템 설치 폰트가 아니라
no-op이어서 **실제 OS 한글 폰트가 스택에 하나도 없다**. DS-D-0009가 두 결함의 해소 방향을 정했고
구현은 DS-P3-003과 DS-P3-014가 수행한다.

### Current impact

package와 Web 상태는 바뀌지 않는다. Decision은 전부 `proposed`이며 owner 확인 대기다. spike 3건(하부
유틸 실측, Server Component 경계, 브라우저 하한과 declaration emit)이 남아 있고, 브라우저 테스트
바이너리 다운로드 승인이 DS-P3-002의 선행 조건으로 추가됐다.

## 2026-08-14 — 타이포 스케일을 배포 실사용에 맞춰 재편

### Added

- `DS-D-0010` Token coverage 확장 원칙 (`proposed`) — 정의가 아니라 실사용을 승격, 반전 램프
  미승격, DOM 상태 스코프는 mode 축이 아님, 알파 10단 정규화, 제품 부채 미승격, 팔레트 완결성 우선
- `typography-*` semantic 15종과 대응 `type-style-*` primitive 15종 — body 계열 4 size × 3 weight,
  heading 계열 3 size × medium
- Figma text style 15종(구 6종 제거) — fontSize·fontWeight를 변수에 30건 바인딩

### Changed

- **Breaking (token):** 타이포 composite가 6종에서 15종으로 재편됐다. 다음 ID가 제거되고 대체된다.

  | 제거된 ID | 대체 ID | 값 변화 |
  | --- | --- | --- |
  | `typography-caption` | `typography-caption-regular` | 없음 |
  | `typography-body-sm` | `typography-body-sm-regular` | 없음 |
  | `typography-body-md` | `typography-body-md-regular` | 없음 |
  | `typography-label-md` | `typography-body-sm-medium` | 없음 (14px/500이었다) |
  | `typography-title-sm` | `typography-heading-sm-medium` | **weight 600 → 500** |
  | `typography-title-md` | `typography-heading-md-medium` | **weight 600 → 500** |

  `type-style-*` primitive 6종도 같은 규칙으로 대체됐다. additive 30 · removal 12이며 그 외 분류의
  변경은 없다. 공개 release와 published library가 없어 DS-GOV-001 절차로 baseline을 갱신했다.
- [token mapping](../../migration/token-mapping.md)의 타이포 행을 실사용 기준으로 정정했다.

### Why

[화면 인벤토리](../../migration/screen-inventory.md) 기반 실측에서 배포 화면의 heading이 **전량
medium(500)** 이고 semibold·regular 사용이 0회임이 확인됐다. 기존 `typography-title-sm/md`는
weight 600이라 이 토큰으로 화면을 재조립하면 제목 굵기가 틀렸다. 제품에 `.type-heading-28-semibold`
클래스가 정의만 되어 있었고 이전 매핑이 그 죽은 변형을 정본으로 골랐던 것이 원인이다.

### Current impact

Figma 라이브러리는 여전히 publish되지 않았고 Figma 상태는 `not-ready`다. 토큰 커버리지 확장의 나머지
단위(알파 축, 채널 색, contrastPairs 등 약 140개)는 아직 반영되지 않았으며, 앱 셸 라이트 램프와
제품의 미커밋 변수 사다리는 제품 저장소 확인이 필요해 보류 상태다.

## 2026-08-14 — Figma 라이브러리 변수 구축과 parity 게이트

### Added

- `DS-D-0007` Figma library structure Decision (`proposed`) — collection 3분리, 표현 형태 3분류,
  이름 변환, composite→style 정책, publish 전 단일 파일 구조
- 라이브러리 파일에 collection 3개와 **변수 146개** 적용: `Klipse Primitive` 92(Base),
  `Klipse Semantic` 28(Global), `Klipse Semantic Color` 26(Light·Dark)
- text style 6종(`typography/*`)과 effect style 4종(`elevation/*`) — semantic tier 이름으로만
  생성하고 fontSize·fontWeight를 primitive 변수에 바인딩 (DS-F-005)
- `figma/snapshot.json` — Figma에서 읽어온 evidence와 provenance
- `scripts/verify-figma-parity.mjs` — credential 없이 snapshot ↔ proposal을 대조하는 게이트.
  고유 토큰 174개를 변수 146 · style 10 · 미표현 18로 전수 대조하고, 값·alias·collection·style
  변조 canary 4종을 매 실행에서 자체 검증하며 `pnpm verify`에 연결됨
- [`migration/screen-inventory.md`](../../migration/screen-inventory.md) — 배포 화면 인벤토리와
  카탈로그 gap (DS-P3-009a)
- [Releases](../governance/releases.md)의 "의도적 breaking과 baseline 갱신" 절 (DS-GOV-001)

### Changed

- **Breaking (token):** `figmaCollection`이 `"Klipse Design"`에서 `"Klipse"`로 바뀌었다. 여기서
  `Klipse Primitive` / `Klipse Semantic` / `Klipse Semantic Color` 세 collection 이름이 도출된다.
  공개 registry 소비자와 published library가 없어 DS-GOV-001 절차로 baseline을 갱신했다.
- **Breaking (public types):** `figma.tokens.json`의 최상위 구조가 `modes`에서 `collections`로
  바뀌었고, 토큰마다 `representation`·`figmaName`·`scopes`·`hiddenFromPublishing`이 추가됐다.
- `manifest.schema.json`의 `tokenPackage.figmaLibrary`·`packageRelease`가 고정값에서
  status enum으로 완화됐고, `not-ready`가 아니면 evidence 필드를 요구한다.
- 세션 종료 검증에 Figma parity 게이트가 포함된다.

### Current impact

Figma 라이브러리는 **publish되지 않았고** manifest의 Figma 상태는 모두 `not-ready`를 유지한다.
Foundations(변수 146 + style 10)는 만들어졌지만 component는 아직 없고, component는 대응하는 코드
구현(P3)이 있어야 만든다. 제품 adoption과 package release도 바뀌지 않았다.

알려진 편차: primitive 변수가 `hiddenFromPublishing`인 상태에서 style이 이를 바인딩한다. publish
후 소비자 해석 여부는 DS-F-008 체크리스트에서 확인한다.

## 2026-08-14 — Figma 운영 전제 확정과 제품 실측 기록

### Added

- 디자인 시스템 전용 Figma 라이브러리 파일과 Foundations / Components / Templates 3-페이지 구조
- [Figma Sync Governance](../governance/figma-sync.md)의 운영 파일 표, 실측 capability, MCP 쓰기 정책
- 제품 미러 Figma 파일 관측 근거 `KP-FIGMA-001`
  ([제품 baseline](../../migration/product-baseline.md))
- `DS-P3-014` Token coverage 확장 — 제품이 실제 쓰는 색·타이포 범위가 현재 token source보다 넓다는
  실측에 따른 후속 작업

### Changed

- `DS-F-000`을 `done`으로 올렸다. 다음 포인터는 `DS-F-001`, `DS-P3-001`, `DS-GOV-001`,
  `DS-P3-009a`다.
- 제품 저장소 위치와 기준 commit(`/Users/sejunki/klipse`, branch `louis`, `0d188651`)을 baseline에
  기록했다.
- 환경 blocker 해소: Node 22 LTS와 pnpm 10.30.2 설치로 표준 검증 명령이 실행된다.

### Current impact

Package, Web, Figma와 제품 adoption 상태는 바뀌지 않는다. 라이브러리 파일에는 아직 변수도
component도 없으며, 파일이 생겼다는 사실만으로 어떤 상태도 올리지 않는다. 제품 미러 파일은 이
저장소의 정본이 아니라 읽기 전용 reference다.

## 2026-08-14 — 실행 플레이북과 Figma 트랙 큐 재설계

### Added

- 작업별 상세 절차, 완성 최종 판정표, 환경 게이트와 Figma 실행 경계를 소유하는
  [실행 플레이북](../governance/execution-playbook.md)
- DS-P3-011을 해체한 Figma 트랙 DS-F-000~008: 운영 전제 실측 → 구조 Decision(단일 collection 4-mode
  구조는 Figma 모델과 충돌하고, publish 전에는 파일 간 변수·component 소비가 불가능해 단일 파일
  3-페이지 구조가 강제) → multi-collection proposal → variables/styles 구축 → snapshot parity
  gate → component library → 배포 화면 재조립 검증 → 수동 publish 운영
- 신규 작업: DS-GOV-001(baseline 갱신 규범), DS-P3-002a(게이트 전환), DS-P3-009a(배포 화면
  인벤토리), DS-P3-013(아이콘 트랙)
- Web `partial` 승격용 최소 증거 세트와 `done`/`stable`용 전체 세트를 분리한 증거 2단 모델

### Changed

- Figma 트랙을 React 구현 의존에서 분리해 코드 트랙과 병렬화. DS-P3-012 public release는 published
  Figma library 대신 parity report 존재만 요구
- Editor Workspace generic fixture를 DS-P3-010에서 DS-P5-005 실제 adoption 검증으로 이동
- Figma 실행 경계를 명문화: MCP(Plugin API)가 유일한 자동화 경로, Variables REST API는 Enterprise
  전용으로 불가, library publish는 전 요금제에서 사람 수동, 쓰기는 사용자 지정 draft 파일에만
- 독립 적대 검토 2회의 발견을 반영: Figma 쓰기 실측을 파일 지정 이후로 재배열, 제품 저장소 경로
  사용자 확인 의무화, Decision 승인 주체(proposed/owner 확인) 확정, 문서 수 canary의 하드코딩을
  정규식으로 교체, schema `const` 고정 완화의 소유 작업 지정

### Current impact

Package, Web, Figma와 제품 adoption 상태는 바뀌지 않는다. `ready` 작업은 DS-P3-001, DS-F-000,
DS-GOV-001, DS-P3-009a 네 개이며, Figma 쓰기 작업은 사용자의 draft 파일 key 지정 전까지 `blocked`다.

## 2026-08-13 — Claude Code P3–P5 실행 인계 추가

### Added

- Claude Code가 자동으로 읽는 비규범 루트 `CLAUDE.md` 진입점
- SEED Design의 운영 원칙을 Klipse 규모에 맞춘 P3–P5 실행 순서, 상태 승격 조건과 component 완료 정의
- P3 core local RC, catalog coverage와 P3 complete를 분리한 작업 큐
- 권한이 필요한 remote/hosted CI/publish gate와 독립적인 로컬 작업을 분리하는 자율 실행 규칙

### Current impact

Package, Web, Figma 또는 제품 adoption 상태는 바뀌지 않는다. 다음 실행 포인터는 `DS-P3-001` Web
architecture Decision과 status model이며, 실제 구현과 검증 근거가 생기기 전에는 모든 기존
`not-ready` 상태를 유지한다.

## 2026-08-13 — P2 token source inversion 로컬 RC 구현

### Added

- Color/Theme, Typography, Spacing/Radius, Elevation/Layer, Motion 규범과 acceptance criteria
- DTCG 2025.10-compatible 단일 정본 `packages/tokens/src/klipse.tokens.json`
- 외부 패키지 없이 Node 표준 라이브러리만 사용하는 repository-supported DTCG subset validator
  `scripts/lib/token-model.mjs`
- semantic CSS projection, primitive/semantic JS·JSON·Figma proposal·manifest와 token ID/type/mode/alias/value
  shape를 선언하는 TypeScript projection
- token diff 비교점 `packages/tokens/baseline/manifest.json`
- alias graph, mode completeness, contrast, primitive/semantic metadata projection, CSS theme/selector,
  JS/TypeScript token graph, same-process deterministic render와 token diff 완료 게이트
- 여섯 token artifact atomic batch 교체/rollback과 package self-reference consumer fixture
- lifecycle별 motion property와 container 기반 Project Grid ordered compatibility profile shape 검증

### Changed

- P2 상태를 local `release-candidate`, maturity를 `experimental`로 유지
- token CSS의 source/generator는 `@klipse-design/tokens`가 소유하고 P3 `@klipse-design/css`는 이를
  소비·재export하도록 package 경계를 명확히 함
- P2 Figma 범위를 reviewable proposal까지로 제한하고 published variables/components는 P3로 유지

### Current impact

구조화 source, generated artifact와 private export map은 로컬 RC로 구현됐다. Package public release와
제품 adoption은 `not-ready`이며, Figma proposal 생성은 published library나 Figma 상태 승격의 근거가
아니다. Browser UI, glyph, 접근성, layout과 interaction acceptance도 P3/P5 소비 구현 전까지
`not-ready`다.

## 2026-08-11 — 독립 디자인 시스템 저장소 시작

### Added

- 제품 저장소와 분리된 Klipse Design 모노레포 구조
- strict manifest/schema, generated progress board와 AI 문서
- token, CSS, React package의 정직한 private scaffold
- catalog/LLM drift와 오류 주입 canary를 검증하는 CI gate

### Changed

- Web/Figma 구현 상태를 이 저장소의 실제 상태인 `not-ready`로 초기화
- 제품 route audit과 324건의 과거 debt를 normative catalog에서 분리
- DS release PR과 제품 integration PR을 상호 링크하는 운영 모델로 전환

### Migration

제품 구현은 즉시 바뀌지 않는다. P2 token source와 P3 package가 release된 뒤
[Product Adoption](../governance/migration.md) 절차로 단계적으로 전환한다.
