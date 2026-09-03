---
id: decision-label-placement-is-an-axis
status: experimental
authority: normative
---

# DS-D-0049 라벨의 자리는 TextField 의 축이다 — 플로팅 라벨 필드를 따로 세우지 않는다

- Status: accepted (rollout 완료 2026-09-03)
- Date: 2026-09-03
- Owners: design system maintainer
- Affects: `component-text-field`, `governance-figma-component-authoring`,
  `decision-product-surface-denominator`, `decision-dialog-tone-axis`

## Context

제품 표면 원장의 `needed` 다섯이 한 문장을 공유한다 — 「auth-two-panel 패턴은 셸까지만
계약한다. 그 슬롯을 채우는 실제 폼 벌 — **플로팅 라벨이 뜨는 입력 상자** — 은 51개 어디에도
없다. LOUIS TextField 와도 다른 벌이다.」 `/login`(high) · `/signup`(high) · `/recover` ·
`/reset-password` · `/reset-password/new`(medium 셋)다.

**그래서 먼저 쟀다.** 앵커 `ae8fd627` 에서 일곱 벌을 읽었다 — 위 다섯에 `/aws/signup` 과
`myPageSceneStyles`(설정의 인증 모달)를 더한 것이다.

### 실측 — 기하는 일곱 벌이 글자 그대로 같다

| 값 | 일곱 벌 | 근거 |
| --- | --- | --- |
| 상자 세로/가로 여백 | 12 / 16 | `py-6 px-8` (`--spacing: 2px`) |
| 상자 반경 | 12 | `rounded-12` · `12px 12px 0 0` |
| 값의 위 여백 | 8 | `mt-4` |
| 라벨 좌측 | 16 | `left-8` |
| 떠오른 라벨 | `top: 12` · `line-height: 1` · caption-12 | `FLOATING_LABEL_FLOATED` |
| 쉬는 라벨 | `top: 50%` · `translateY(-50%)` · body-16 | `FLOATING_LABEL_REST(ING)` |
| 굵기 · 전이 · 변형 원점 | medium · `all 180ms ease` · `left top` | `FLOATING_LABEL` |
| placeholder | 투명 | `placeholder:text-transparent` |

**갈리는 것은 색 셋뿐이고, 그중 다섯이 한 값에 모인다.**

| 자리 | 포커스 테두리·링 | 쉬는 라벨 색 |
| --- | --- | --- |
| `/login` · `/signup` · `/recover` · `/reset-password` · `/reset-password/new` | 40% | 40% |
| `myPageSceneStyles`(설정 모달) | **24%** | **32%** |
| `/aws/signup` | `--aws-navy-input-focus` | `palette-gray-600` |

정본은 다섯이 모인 값이다. `/aws/signup` 은 색이 갈린 것이 아니라 **브랜드 스킨**이고, 원장이
이미 그것을 별건으로 적어 두었다(「이 브랜드 변형을 변형 축으로 넣을지 별도 화면으로 둘지
정해야 한다」). 설정 모달의 24%/32% 는 소수파 하나이며 `text-field.md` 가 그 사실을 갖는다.

### 판정의 갈림길 — 축인가 새 컴포넌트인가

[DS-D-0041](DS-D-0041-dialog-tone-axis.md)이 같은 갈림길에서 쓴 시험을 그대로 적용한다.

**1. 제품이 이미 어떻게 모델링했는가.** 여기서는 답이 반쪽이다 — 제품에 공용 구현이 없어
일곱 벌이 각자 복제본이고, 「플로팅과 쌓임이 한 컴포넌트의 두 모드」라는 증거가
`confirmVariant` 같은 형태로 존재하지 않는다. **다만 그 반대의 증거는 있다** — 제품의
`/admin` 여덟 화면이 정본의 `louis-text-field__label`(쌓인 라벨)을 **그대로 쓴다.** 두 형태가
같은 제품 안에서 동시에 살아 있고, 한 필드가 둘을 오가지는 않는다.

**2. 무엇이 실제로 갈리는가.** 정본 대비 갈리는 선언은 다섯이다 — 높이·내부 배치 · 1px 12%
테두리 · 4% 알파 면 · inset 링 · 값 타이포 16. **그중 플로팅 라벨이 만든 것은 첫째 하나뿐이다.**
나머지 넷은 인증 계열이 정본과 갈리는 **기존의, 이미 기록된** 스킨 차이이고, 이 컴포넌트의
값은 애초에 제품을 옮긴 것이 아니라 DS 가 정한다 — `text-field.css` 머리말이 그렇게 적는다
(「제품에 공용 구현이 없다. 정의 약 40벌이 다섯 계열로 갈리며 계열 사이에 합의가 없다」).
그러므로 **이 축이 지는 것은 라벨 자신의 기하 하나**이고, 나머지는 이 결정의 범위가 아니다.

**3. 갈라 세우면 무엇을 잃는가.** 반경·좌우 여백·슬롯 간격·헤어라인·면·상태 표·접두/접미
슬롯·메시지가 전부 같으므로, 두 번째 컴포넌트는 그 기하 계약을 통째로 복제한다. DS-D-0041 이
`ConfirmDialog` 를 기각한 사유와 글자 그대로 같은 자리이며([DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md)이
토큰 축에서 금한 모양이다), 51 계약이 52 가 된다.

## Decision

1. **플로팅 라벨 필드를 새 컴포넌트로 세우지 않는다.** 라벨의 자리는 TextField 의 한 축이다.
2. **`LabelBehavior` 축을 연다. 값은 `stacked` · `floating` 둘이다.**
3. **`floating` 은 `lg` 에만 그린다.** 조합을 전수로 채우지 않는다.
4. **「떠 있는가 앉아 있는가」에는 새 축을 만들지 않는다 — `State` 가 이미 그 계약이다.**

### 4 를 먼저 적는다 — 이것이 축을 하나로 줄였다

떠오른 라벨과 쉬는 라벨은 **두 상태**이지 두 축이 아니다. 코드에서 그것을 정하는 것은 값의
유무와 포커스이고(`:not(:placeholder-shown)` · `:focus`), Figma 에는 그 두 조건을 담을 자리가
**이미 있다** — `State` 의 `Placeholder` 가 「값이 비어 있는 쉼 상태」이고 나머지 넷이 값이 든
상태다. 그 사유는 이 컴포넌트의 계약에 낱말 그대로 적혀 있었다.

그래서 `Floating: false|true` 같은 조건 축을 열지 않았다. 열었다면 그 축과 `State` 가 같은
사실을 두 번 말하고, 「Placeholder 이면서 Floating=false」 같은 뜻 없는 칸이 생긴다.

### 왜 `LabelBehavior` 인가 — 두 대안을 기각한 이유

`figma-component-authoring.md` §2 의 축 어휘는 닫혀 있고, 새 이름을 열려면 그 문서를 먼저
고쳐야 한다. 고치기 전에 있는 이름으로 되는지 확인했다.

- **`Mode` 를 늘린다**(`determinate`·`indeterminate` 옆에 `stacked`·`floating`). 뜻은 맞는다 —
  §2 의 `Mode` 는 「같은 컴포넌트가 서로 다른 원리로 도는 것」이고 쌓인 라벨과 떠오르는 라벨이
  정확히 그렇다. **버리는 이유는 값이다.** `Variant`·`Tone` 의 값 목록은 한 어휘의 단계들이라
  컴포넌트가 그 부분집합을 고르는데, `Mode` 에 이 둘을 더하면 **서로 겹치지 않는 두 쌍**이 한
  이름 아래 놓인다. Progress 의 `Mode` 와 TextField 의 `Mode` 가 공유하는 값이 하나도 없다 —
  같은 이름에 두 뜻이고, [DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md)이 토큰 축에서 금한
  모양이 축 이름에서 재현된다.
- **조건 축 `Floating: false|true`.** 형태는 §2 가 이미 인정한 것이다(`Checked`·`Collapsed`).
  **버리는 이유는 둘이다.** 하나, 조건 축의 값들(`Checked`·`Selected`·`Expanded`·`Loading`)은
  전부 **그 순간 참인지 거짓인지**를 말하는데 라벨의 자리는 순간이 아니라 **디자이너가 고르는
  것**이다 — `Size` 와 같은 종류이지 `Hover` 와 같은 종류가 아니다. 둘, `Floating` 은 이 파일
  안에서 이미 다른 뜻으로 쓰인다 — 원장의 「캔버스 하단 플로팅 툴바」가 `needed` 항목이다.
  축 이름은 다른 컴포넌트 옆에 놓고 읽어도 살아남아야 한다.

`LabelBehavior` 는 **무엇이 갈리는지를 이름이 갖는다.** 합성어이지만 이 세트에 `HasLabel` ·
`HasMessage` 가 이미 서 있어 낯선 형태가 아니다.

### 왜 `lg` 뿐인가

[DS-D-0027](DS-D-0027-control-size-ladder.md)이 `lg`(40)의 쓰임을 **「화면의 주인공이 되는 제출
CTA — 로그인·회원가입」**으로 못 박았다. 플로팅 라벨이 사는 곳이 바로 그 화면이고, 제품의 어느
자리도 md·sm 플로팅을 쓰지 않는다. 재지 않은 두 칸을 그리는 것은 값을 지어내는 일이다.

선례가 바로 옆에 있다 — DS-D-0041 의 `Tone=danger` 가 `compact` 에만 섰고, 그 문서가
「축을 여는 것과 조합을 채우는 것은 별개다」를 Linear 실측과 함께 적어 두었다. 변형은
15 → **20** 이 된다(전수 30 이 아니다).

### 높이를 선언하지 않는다

`53 = space-control-md 12 + space-control-sm 8 + body-sm 행 높이 21 + space-control-md 12`.
네 항이 전부 토큰이고 CSS 는 높이를 쓰지 않는다 — 여백과 값이 만든다. 제품의 같은 구성이
58 인 것은 값 타이포가 body-16(행 24)이기 때문이며, **그 5px 은 이 축이 만든 어긋남이 아니라**
이미 기록된 계열 차이다.

### 떠오른 라벨의 시작점이 12 가 아니라 8 인 이유

제품은 `line-height: 1` + `top: 12` 로 라벨 글자를 12..24 에 앉힌다. **여기서는 행간을 리터럴
1 로 덮을 수 없다.** Figma text style 은 all-or-nothing 이라 행간 하나만 덮어도 style 연결이
끊기고, 그 자리를 메우는 `textStyleExempt` 는 **변형마다 하나씩**을 세므로(`parts.length ×
variants`) 스무 변형 중 다섯만 면제할 방법이 없다. 그래서 caption 의 행간 토큰(1.5 → 18px)을
그대로 쓰고 시작점을 8 로 당겨 **글자를 제품과 같은 자리에 놓는다** — `8 + (18−12)/2 = 11`
부터 23 까지이고 제품의 12..24 와 1px 안이다. 값의 글자는 23.5 부터라 닿지 않는다.

두 값 다 토큰이고 리터럴이 남지 않는다. Figma 쪽은 `typography/caption-medium`(12/150%/Medium)
한 style 이 셋을 함께 준다.

## Alternatives

- **`FloatingLabelTextField` 를 따로 세운다.** 인증 폼의 계약을 한 곳에 고정할 수 있다.
  대가가 위 §3 그대로다 — 같은 기하 계약이 두 벌이 되고, 값이 갈리는 날 어느 쪽이 정본인지
  판정할 자가 없다.
- **아무것도 하지 않고 다섯을 `needed` 로 둔다.** 정직해 보이지만 정보를 잃는다 — 없는 것은
  화면이 아니라 축 하나이고, 나머지(반경·여백·슬롯·메시지·상태)는 이미 서 있다.
- **제품의 인증 스킨(1px 12% 테두리 · 4% 면 · inset 링 · 본문 16)까지 이 축에 싣는다.**
  제품 화면과 픽셀이 맞는다. 버리는 이유는 이 컴포넌트의 값이 제품을 옮긴 것이 아니라는
  기존 판정이다 — 스킨을 축에 실으면 한 컴포넌트가 두 디자인을 갖게 되고, 다섯 계열 중
  하나에만 정본 자격을 주는 판정을 이 저장소가 몰래 내리는 일이 된다.

## Consequences

- TextField 의 변형이 15 → 20. 조합 예산에 걸리지 않는다.
- 되읽기의 기하 키가 `{Size}` 에서 **`{Size}/{LabelBehavior}`** 복합이 된다
  (`lg/stacked` · `md/stacked` · `sm/stacked` · `lg/floating`). `InlineLoadingLabel` 의
  `{Size}/{Loading}` 이 같은 형태의 선례다.
- 코드 타입 `TextFieldLabelBehavior` 가 공개 API 에 늘어난다. `variantProperties` 로 등재하므로
  게이트가 옵션 집합을 **글자 그대로** 대조한다 — `figmaOnlyProperties` 로 빼지 않았다.
  DS-D-0041 Consequences 가 그 우회를 「코드에 대응이 없는 축」의 자리로 못 박은 그대로다.
- **원장을 옮기지 않는다.** 다섯 항목의 사유는 플로팅 라벨 상자 **말고도** 비밀번호 표시
  토글·지우기 버튼·결합 입력(위/아래 곡률 + 1px 겹침)을 함께 든다. 슬롯 둘은 `prefix`/`suffix`
  가 이미 갖지만 결합 입력은 아직 없다. 이 축 하나로 다섯이 닫히지 않으므로 판정은 `needed`
  로 남는다 — 남은 것은 아래 「이 결정이 닫지 않은 것」이 적는다.

## Rollout and verification

**2026-09-03 에 세 곳이 함께 들어갔다**(DS-D-0028).

1. **LOUIS** — `text-field.css` 에 `[data-label-behavior="floating"]` 블록, `text-field.tsx` 에
   `labelBehavior` prop 과 `TextFieldLabelBehavior` 타입. 라벨이 박스 **안**으로, input **뒤**로
   간다(`~` 가 앞선 형제를 보지 못한다). 떠오름은 CSS 가 판정하고(`:focus` ·
   `:not(:placeholder-shown)`) 색은 포커스만 따른다 — 제품 일곱 벌이 두 조건을 갈라 둔 그대로다.
   `:placeholder-shown` 이 걸리도록 컴포넌트가 placeholder 를 공백으로 채우고 CSS 가 투명으로 둔다.
2. **Figma** — 기존 15 변형에 `LabelBehavior=stacked` 를 붙이고 `lg` 다섯 상태에
   `LabelBehavior=floating` 을 세웠다(15 → 20). 되읽기를 다시 떠 `binding` 이 `rawFills` 0 ·
   `rawStrokes` 0 · `textUnstyled` 0 이고 `overflowingParts` 가 비었다.
3. **계약** — `variantProperties.LabelBehavior: "TextFieldLabelBehavior"`, 기하 키 복합화,
   `Label.fontSize` 를 두 값의 **집합**으로 대조.

브라우저 테스트 일곱이 새 축의 **계산 스타일**을 잰다. `data-label-behavior` 속성만 보면
「속성은 붙었는데 라벨은 그대로인」 경우를 통과시키므로, 높이를 네 항의 합으로 재고 stacked
필드를 나란히 세워 반경·여백·간격·헤어라인·면이 **같은지**를 대조한다.

### 테스트 둘이 실측으로 고쳐졌다 — 처음 판은 틀렸다

- **전이 중간값을 도착점으로 읽었다.** 클릭 직후 라벨의 `font-size` 가 13.99 였다. 220ms 짜리
  전이가 도는 중이었고, 그 수를 기대값으로 굳혔다면 「12 가 아니어도 통과하는」 테스트가 됐다.
- **상자끼리 겹침을 쟀다.** 라벨 아래 24 · control 위 20.5 로 「겹쳤다」가 나왔는데, control 의
  행 상자는 글자 위아래로 반-행간 3.5 를 품는다. 재야 하는 것은 상자가 아니라 **글자 띠**다.

### 이 작업이 드러낸 것 — 이 결정이 부른 것이 아니다

넷 다 「초록인데 재고 있지 않은」 자리이고, 고치지 않으면 이 결정이 그 위에 얹힌다.

1. **`boxWidth` 가 어디서도 대조되지 않고 있었다.** 계약의 `parts` 객체에 `Box` 키가 **둘**이라
   먼저 쓴 `{ width: "boxWidth" }` 가 조용히 버려졌다. measured 는 세 칸 모두 320 을 `$boxWidth`
   사유와 함께 갖는다. 한 키로 합쳐 되살렸다.
2. **`frameWidth` 328 도 마찬가지였다.** measured 가 「focus 링 4px 이 잘리지 않게 프레임을
   넓힌다」는 사유까지 갖는데 계약의 `fields` 가 비어 있었다 — 링을 안으로 당기는 회귀가 조용히
   통과했을 자리다. `width: "frameWidth"` 를 넣었다.
3. **`parts` 의 규칙이 「root 와 같다」는 주석과 달랐다.** `set`(한 축이 이 필드를 바꾼다)이
   root 에만 있었고 `parts` 는 따라오지 않아, 이 결정이 필요로 하는 계약을 적으면 「근거 값이
   없습니다」로 떨어졌다. 주석이 참이 되도록 `parts` 에 같은 규칙을 넣었다.
4. **Figma 의 `Placeholder` 값 색이 코드와 달랐다.** Figma 는 `fg-tertiary`, CSS 는
   `fg-secondary` 다 — `text-field.css` 가 그 선택의 사유까지 적어 두었는데
   ([DS-D-0025](DS-D-0025-figma-as-projection.md) 대로 코드가 정본이다) Figma 가 따라오지 않았고,
   `states` 표가 `Default`·`Invalid`·`Disabled` 만 담아 게이트 시야 밖이었다. 네 변형을 코드에
   맞췄다.

### 이 결정이 닫지 않은 것

- **원장 다섯은 그대로 `needed` 다.** 남은 부품은 **결합 입력**이다 — 위/아래 곡률이 갈리고
  `margin-bottom: -1px` 로 테두리를 겹치며 포커스가 `z-index` 를 1 → 2 로 올려 이웃의 테두리
  위로 올라온다. 일곱 벌 중 넷이 그 형태이고 컴포넌트로 서 있지 않다. 비밀번호 표시 토글과
  지우기 버튼은 `prefix`/`suffix` 슬롯이 이미 받는다.
- **`/aws/signup` 의 브랜드 스킨.** 원장이 「변형 축으로 넣을지 별도 화면으로 둘지」를 열어 둔
  그대로이고, 이 결정은 정하지 않는다.
- **제품 채택은 별건이다.** 이 축은 LOUIS 와 Figma 에만 섰다. 제품의 일곱 벌을 이 축으로
  옮기는 것은 인증 계열의 스킨 넷(테두리·면·링·본문 16)을 어느 쪽으로 수렴시킬지의 판정을
  함께 요구하고, 그것은 제품 픽셀을 움직일 수 있는 사람의 몫이다.
