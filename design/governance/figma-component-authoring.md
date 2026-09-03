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

2026-08-26 에 그 조항이 실제로 걸렸다. 랜딩에서 세운 컴포넌트 여섯이 표에 없는 축을 필요로 해
문서 여섯이 전부 「소유자 판정 필요」로 멈췄다. 아래 표와 규칙이 그 판정이고, 무엇이 걸렸는지는
「이 개정의 근거 — 여섯 사례」에 남긴다.

| 축 | 허용값 | 무엇을 담나 |
| --- | --- | --- |
| `Size` | `sm` · `md` · `lg` · (지역 예외는 **쓰임새 이름**) | 밀도. **`compact`/`medium`/`large`는 폐기** — 같은 뜻을 두 어휘로 부르면 두 벌이 된다. 사다리에 없는 한 컴포넌트의 값은 아래 「사다리 밖 값은 쓰임새로 부른다」 |
| `Variant` | `primary` · `secondary` · `ghost` · `danger` · `inverse` | **강조 단계만.** 부품 이름을 넣지 않는다 |
| `Tone` | `neutral` · `info` · `success` · `warning` · `danger` | **의미 톤만.** 밝기(`bright`/`dark`)는 톤이 아니다 — 테마면 모드로(§4), 한 테마 안에서 자리마다 갈리면 `Surface` 로 뺀다 |
| `State` | `Default` · `Hover` · `Active` · `Focus` · `Disabled` | **상호작용 상태만.** `Active` 는 `:active`(누르는 중)다 — `Pressed`(aria-pressed)와 다르며 Button 에는 후자가 없다. 이 뜻은 `design/foundations/interaction-states.md` 가 소유한다 |
| `Mode` | `determinate` · `indeterminate` | **작동 방식.** 같은 컴포넌트가 서로 다른 원리로 도는 것. 진행률을 아는 막대와 모르는 막대는 상태가 아니라 다른 기계다 |
| `Direction` | `prev` · `next` | **방향.** 기하는 그대로고 글리프의 향만 바뀐다. 값은 **트랙의 진행 방향**이지 화살표가 가리키는 쪽(`left`/`right`)이 아니다 — 세로 트랙이 생겨도 이름이 산다 |
| `Surface` | `light` · `dark` | **아래 깔린 면의 밝기.** 테마가 아니다 — 경계는 「`Surface` 는 테마가 아니다」가 정한다. 값은 잉크가 아니라 **면**을 가리킨다: `light` = 밝은 면 위 = 어두운 잉크 |
| `LabelBehavior` | `stacked` · `floating` | **라벨이 어디 사는가.** `stacked` 은 라벨이 컨트롤 **위**의 형제이고 움직이지 않는다. `floating` 은 라벨이 컨트롤 **안**에서 placeholder 노릇을 하다가 값이나 포커스가 오면 떠오른다. 조건 축이 아니다 — 「지금 떠 있는가」는 `State` 가 담고(`Placeholder` 가 쉼), 이 축은 **디자이너가 고르는** 것이라 `Size` 와 같은 종류다 |
| `Orientation` | `vertical` · `horizontal` | **긴 축이 어디로 놓이나.** `Direction` 과 다르다 — `Direction` 은 기하가 그대로고 향만 바뀌지만 여기서는 **기하가 90° 전치된다**(4×60 ↔ 60×4). 축이 바뀌면 커서와 전환 프로퍼티도 함께 바뀐다 |
| 조건 축 (`Expanded` 등) | `false` · `true` | BOOLEAN 으로 그릴 수 없는 조건 하나. 축 이름은 아래 명부에 있는 것만 쓴다 |

### 사다리 밖 값은 쓰임새로 부른다

`Size` 의 정본 값은 `sm`·`md`·`lg` 사다리다. 그런데 **한 컴포넌트에서만 실재하고 사다리에
없는 밀도**가 나온다 — SegmentedControl 의 `xs`(인스펙터 28)와 `settings`(설정 화면 36)가
그것이다. 그런 값의 이름 규칙을 여기 못박는다.

**규칙: 사다리 밖 값은 밀도 어휘로 부르지 않고 쓰임새로 부른다.**

`compact`/`medium`/`large` 폐기와 **같은 근거이고 반대 방향이 아니다.** 저 셋이 폐기된 이유는
사다리와 **같은 뜻**을 다른 어휘로 불러 두 벌이 되기 때문이다. 사다리 밖 값은 사다리와 같은
뜻이 아니다 — 그러므로 사다리 어휘를 빌리면 안 되고, 빌리는 순간 **순서를 거짓말한다.**

SegmentedControl 이 그 값을 이미 치르고 있다. `xs`(28)가 `sm`(24)보다 커서 같은 축 안에서
이름이 순서를 뒤집는다. 여기에 36 을 사다리 어휘로 하나 더 얹으면 40·36·32·28·24 다섯 값에
`lg`·?·`md`·`xs`·`sm` 이 붙어 거짓이 둘이 된다. **쓰임새 이름은 순서를 아무것도 주장하지
않으므로 그 셈에 들어가지 않는다** — `settings` 가 `lg` 보다 큰지 작은지를 이름이 말하지 않고,
말하지 않는 것은 틀릴 수도 없다.

**여는 조건 셋.** 하나라도 없으면 열지 않는다.

1. **제품 자리가 있다.** 실측 출처를 컴포넌트 문서와 `figma/components.measured.json` 이
   좌표까지 갖는다. 「나중에 쓸 것 같다」는 재고이지 값이 아니다(DS-D-0030).
2. **사다리로 표현되지 않는다.** 사다리 칸으로 대신할 수 있으면 그 칸을 쓴다. 제품 픽셀과
   사다리 중 어느 쪽이 정본인지는 **저장소가 고를 수 없다** — 소유자 판정이다.
3. **이름이 장소나 쓰임새다.** `settings`·`inspector` 처럼. 값(`36`)이나 밀도 형용사
   (`compact`)는 안 된다 — 앞은 값이 바뀌면 거짓이 되고 뒤는 사다리와 두 벌이 된다.

**`settings` 는 2026-09-03 에 이 규칙으로 열렸다**
([DS-D-0048](decisions/DS-D-0048-thirty-six-is-not-a-control-height.md) 의 정정 절). 소유자가
「제품의 36 이 정본」이라고 판정해 조건 2 가 풀렸고, 1 은 `myPageSceneStyles.ts` 의
`settingsToggle*` 세 벌이, 3 은 이름 자신이 채운다.

**`xs` 는 이 규칙을 아직 어긴다.** 밀도 어휘로 불리는 사다리 밖 값이므로 이름을 옮기는 것이
맞지만, 소유자가 「나중에」로 미뤘다. 규칙을 지금 적어 두는 이유가 그것이다 — 미룬 것과 몰랐던
것을 다음 사람이 구별할 수 있어야 한다.

### BOOLEAN 은 레이어 가시성만 바꾼다

Figma 의 `BOOLEAN` 프로퍼티가 할 수 있는 일은 **하나**다 — 지정한 레이어를 보이거나 감춘다.
불투명도도, 색도, 프레임 크기도, 회전도, 프로토타입 전이도 BOOLEAN 으로는 건드릴 수 없다.

§3 이 「있고 없고는 BOOLEAN」이라고만 적어 둔 탓에 그 한계가 규칙 어디에도 없었고, 그래서
「BOOLEAN 으로 빼라」는 지시가 **그릴 수 없는 것을 빼라는 지시**가 된 자리가 여럿 남았다.

**네 시험.** 하나라도 걸리면 BOOLEAN 이 아니다.

1. **스타일** — 켜고 끌 때 **계속 보이는** 레이어의 색·불투명도·타이포·변형(회전·이동)이 달라지는가.
2. **기하** — **프레임 자신의** 고정 크기·padding·gap·정렬·반지름이 달라지는가.
   자식이 감춰져 오토레이아웃 프레임이 줄어드는 것은 여기 해당하지 않는다 — 그것이 BOOLEAN 의
   정상 결과다. 걸리는 것은 프레임이 **자기 값을 다시 쓰는** 경우다.
3. **전이** — 두 조건 사이에 프로토타입 반응이나 Smart Animate 를 걸어야 하는가.
   반응은 변형 사이에만 걸 수 있다.
4. **문구** — 값 자체가 내용(`New` · `Top`)인가.

1·2·3 에 걸리면 **VARIANT 축**이다. **4 는 방향이 반대다** — 걸리면 축을 여는 게 아니라
축을 **없애고** 내용을 `TEXT` 슬롯으로 내린다(§3). 값에 문구가 들어간 축은 라이브러리가 카피를
소유하게 만들고, 문구가 늘 때마다 변형이 늘어난다.

넷을 다 통과하면 BOOLEAN 이고, §3 대로 `INSTANCE_SWAP`·`TEXT` 와 짝으로 낸다.

### 조건 축은 `false` · `true` 로 쓴다

BOOLEAN 이 못 그리는 조건은 **그 조건 이름을 그대로 쓰는 2값 VARIANT 축**으로 낸다.
`Checked: false|true` 처럼 값은 `false`/`true` 고, 뜻은 축 이름이 갖는다. 새 형태가 아니다 —
Switch 의 `Checked` 와 SidebarNavItem 의 `Collapsed` 가 이미 그렇게 서 있고, 이 표가 그것을
인정하지 않고 있었을 뿐이다.

**현재 열려 있는 조건 축 이름은 일곱이다.**

| 조건 축 | 어디에 | 왜 BOOLEAN 이 아닌가 |
| --- | --- | --- |
| `Checked` | Checkbox · Switch | 면과 글리프가 바뀐다(시험 1). Checkbox 는 `indeterminate` 를 더한 3값이다 |
| `Selected` | 선택 가능한 행·항목 | 면·글자색·불투명도가 바뀐다(시험 1) |
| `Invalid` | 입력 | stroke 색이 바뀐다(시험 1) |
| `Expanded` | 여닫이 | 아이콘이 남은 채로 돌고 여닫이에 전이가 걸린다(시험 1·3) |
| `Featured` | 목록 안의 대표 항목 | 프레임 고정 크기가 바뀐다(시험 2) |
| `Collapsed` | 접히는 내비 | 라벨이 사라지고 프레임 폭이 다시 쓰인다(시험 1·2) |
| `Loading` | 작업이 도는 동안 자리를 여는 라벨 | 프레임이 자기 `itemSpacing` 을 다시 쓰고 두 조건 사이에 전이가 걸린다(시험 2·3) |

이 일곱 밖의 조건 이름을 쓰려면 이 표를 먼저 늘린다. `Current` 는 `Selected` 의 두 번째
어휘이므로 **쓰지 않는다** — 같은 뜻에 이름이 둘이면 두 벌이 된다.

**`LabelBehavior` 는 2026-09-03 에 열렸다** ([DS-D-0049](decisions/DS-D-0049-label-placement-is-an-axis.md)).
근거는 제품 인증 일곱 벌의 실측이다 — 기하가 일곱 벌 모두 같고 정본과 갈리는 것은 라벨의 자리
하나다. **조건 축(`Floating: false|true`)으로 열지 않은 이유를 함께 적는다.** 조건 축의 값들
(`Checked` · `Selected` · `Expanded` · `Loading`)은 전부 **그 순간 참인지**를 말하는데 라벨의
자리는 순간이 아니라 고르는 것이고, `Floating` 이라는 이름은 이 파일 안에서 이미 다른 뜻으로
쓰인다(원장의 「캔버스 하단 플로팅 툴바」). **`Mode` 를 늘리지 않은 이유도 적는다** — 뜻은
맞지만 `determinate`·`indeterminate` 와 겹치지 않는 두 번째 쌍이 한 이름 아래 놓여, 같은 이름에
두 뜻이 된다.

**`Loading` 은 2026-08-27 에 열렸다.** 근거는 InlineLoadingLabel 실측이다 — 네 변형의 되읽기에서
프레임 `itemSpacing` 이 닫힘 0, 열림 md 6 · sm 4 로 **프레임 자신이 자기 값을 다시 쓴다**(시험 2).
자식이 감춰져 오토레이아웃이 줄어드는 정상 결과와 다르다. 여기에 제품이 폭·왼쪽 여백·불투명도·
scale 넷을 200ms · 180ms 로 전이시키므로 닫힘과 열림 사이에 Smart Animate 가 필요하고(시험 3),
두 조건에서 **보이는 텍스트 프로퍼티가 서로 다르다**(`Label` ↔ `LoadingLabel`) — BOOLEAN 에는
반대 가시성을 묶을 부정이 없다.

**이름이 열렸다는 것이 「`Loading` 은 늘 축」이라는 뜻은 아니다.** 이 표는 **어휘**를 여는 것이고,
축이냐 BOOLEAN 이냐는 컴포넌트마다 네 시험이 정한다. 라벨을 감추고 스피너를 보이기만 하고
프레임이 자기 값을 다시 쓰지 않으면 그 자리는 여전히 BOOLEAN 이다 — **Button 은 2026-09-01 에
그 판정을 받았고 조건 축이 아니라 `State` 값으로 남았다**(아래 「이 개정이 남긴 결손」 3).

### 조건을 `State` 값으로 접어도 되는 때

조건 축과 `State` 를 둘 다 두면 셀이 곱해진다. 곱할 것이 없으면 접는다.

**시험:** 그 조건이 켜진 채로 `Hover` · `Focus` · `Active` · `Disabled` 가 **시각적으로
달라지는가.**

- 하나라도 달라진다 → **독립 조건 축.** 두 축은 직교한다.
- 하나도 달라지지 않는다(조건이 상호작용을 흡수한다) → **`State` 의 값으로 둔다.** 그 사실을
  컴포넌트 문서 Variants 절에 적는다. 적지 않으면 다음 사람이 「조합이 빠졌다」고 읽는다.

**접을 수 없는 것을 접고 값을 융합하지 마라.** SegmentedControlItem 의 `SelectedDisabled` 가
그 결과다 — 두 축의 곱을 한 값에 욱여넣은 것이라 인스턴스에서 둘을 따로 돌릴 수 없다.
융합값이 필요해졌다는 것 자체가 **축이 둘이라는 증거**다.

### `Surface` 는 테마가 아니다

§4 는 라이트/다크를 모드로만 두라고 한다. `Surface` 는 그 규칙의 예외가 아니라 **다른 문제**다.

- **테마** — 문서 전체가 한 번에 뒤집힌다. 컴포넌트는 한 벌이고 시맨틱 램프가 따라 뒤집는다.
- **`Surface`** — **같은 테마 안에서** 한 화면에 밝은 면과 어두운 면이 같이 있고, 컴포넌트가
  그중 어디에 앉느냐로 색이 갈린다.

**판정은 제품이 어떤 토큰을 쓰는지로 한다.** 그 자리의 색을 **시맨틱 램프**(`gray-*`)로 받으면
모드다 — 테마가 뒤집힐 때 램프가 같이 뒤집혀 한 벌로 양쪽이 나온다. **고정 팔레트**(`palette-*`)로
받으면 `Surface` 축이다 — 제품이 고정값을 쓴다는 것은 그 자리의 밝기가 테마와 무관하게 정해진다는
뜻이고, 모드로는 그릴 수 없다.

랜딩 GNB 가 그 경우다. `landing/navigation/Gnb.tsx` 의 메뉴 링크 톤은 `palette-gray-000` 과
`palette-gray-900` 두 고정값이고, 소스 주석이 이유까지 적어 두었다 — 시맨틱 램프로 받으면
라이트에서 `gray-900` 이 면 색이 되어 글자가 바닥과 같아지고, 실제로 햄버거와 상단 CTA 가
보이지 않았다. 어느 톤을 쓸지는 **페이지가** 정한다(`navBlackActive`). 테마가 아니다.

**축을 여는 조건:** 한 테마 안에서 **두 밝기가 실제로 같이 나타나야** 한다. 사진 위에만 앉는
MediaCard 는 고정 토큰(`media-foreground-dark`)을 쓰지만 갈래가 하나라 축이 없다.

### State 에 넣지 않는 것

지금 `State` 축에 16개 값이 뭉쳐 있다 — 상호작용 상태에 의미 상태·톤·진행 모드가 섞였다.
섞으면 조합이 곱해지고, 「Checked 이면서 Hover」 같은 실재하는 조합을 표현할 수 없게 된다.

**아래 표의 「옮길 곳」은 2026-08-26 에 고쳐졌다.** 앞선 판은 넷을 `BOOLEAN` 으로 보냈는데,
그중 어느 것도 BOOLEAN 으로 그릴 수 없다 — 전부 면·색·불투명도를 바꾸므로 시험 1 에 걸린다.
가시성만 바뀌는 것은 이 목록에 하나도 없었다.

| 지금 State 에 있는 것 | 옮길 곳 |
| --- | --- |
| `Checked` · `Indeterminate` | `Checked` **조건 축**(Checkbox 는 `false`·`true`·`indeterminate` 3값). BOOLEAN 불가 — 면과 글리프가 바뀐다 |
| `Selected` · `Current` | `Selected`. **접기 시험**을 먼저 적용한다 — 상호작용이 흡수되면 `State` 값으로 남기고, 아니면 조건 축. `Current` 어휘는 폐기 |
| `Invalid` | `Invalid` **조건 축**. BOOLEAN 불가 — stroke 색이 바뀐다. Focus 와 동시에 서므로 접히지 않는다 |
| `Loading` | 라벨을 감추고 스피너를 보이는 것뿐이면 BOOLEAN 이 맞다. gap 이 다시 쓰이면 `Loading` **조건 축**이다 — 2026-08-27 InlineLoadingLabel 실측으로 그 이름이 명부에 올랐다. Button 은 지금 `State` 값으로 갖고 있고 **그 상태에서 padding·gap 이 그대로인지 대조하지 않았다** — 결손 |
| `Danger` · `DangerHover` | `Variant=danger` × `State=Hover` |
| `Pressed` | Button 에는 없다 — `:active` 는 `Active` 다 |
| `determinate` · `indeterminate` | `Mode` 축. 소문자 값이 PascalCase 축에 섞여 있는 것도 함께 고친다 |

### 해부 구조는 variant 가 아니다

Slider 의 `thumb`/`track` 이 `Variant` 축에 들어가 있다. 부품은 variant 가 아니라 **부품**이다 —
한 컴포넌트 안의 레이어이거나 별도 컴포넌트다. variant 로 두면 「thumb 이면서 primary」 같은
무의미한 조합이 생긴다.

### 이 개정의 근거 — 여섯 사례

규칙만 적고 사례를 빼면 다음 사람이 같은 자리에서 같은 판단을 한다. 이 개정을 부른 여섯이다.
값은 `figma/readback.json` 되읽기와 제품 소스에서 읽었다.

| 컴포넌트 · 축 | 무엇이 걸렸나 | 판정 |
| --- | --- | --- |
| MediaCard `Badge` (`New`·`Top`·`none`) | 값이 **내용**이다(시험 4). 배지를 감춰도 카드는 316 × 316 고정이라 나머지가 하나도 안 바뀐다 — 시험 1·2·3 은 통과한다 | **축 폐기.** `Badge` BOOLEAN + `BadgeLabel` TEXT. 변형 3 → 1. `New`/`Top` 은 컴포넌트 문서 Content 절이 소유한다. **Figma 재작업 필요** |
| CarouselArrow `Direction` (`prev`·`next`) | 여섯 변형의 기하가 전부 같고 캐럿 향만 다르다. 축을 없애고 글리프를 `INSTANCE_SWAP` 으로 내리는 길이 있으나, **두 캐럿이 아이콘 라이브러리에 없다**(인라인 벡터다) — 스왑 후보를 채울 대상이 없어 인스턴스에서 고를 수가 없다 | **`Direction` 축을 연다.** 값은 `prev`·`next` 둘뿐이다 |
| FaqRow `Expanded` (`false`·`true`) | 프레임이 66 → 132 로 자라는 것은 오토레이아웃의 정상 결과라 그것만으론 BOOLEAN 이어도 된다. 걸리는 것은 둘이다 — `+` 가 **계속 보이는 채로** 45° 돌고(시험 1), 여닫이에 전이를 걸어야 한다(시험 3). 제품도 `transform: rotate(45deg)` 과 높이 애니메이션 둘 다 갖는다(`FAQ.tsx`) | **조건 축.** `ON_CLICK` 반응을 두 변형 사이에 건다 |
| NewsCard `Featured` (`false`·`true`) | **프레임 자신의 고정 크기**가 347 × 160 → 698 × 324 다(시험 2). 제품에서는 `image` 가 있으면 피처드다(`NewsCarousel.tsx`) — 슬롯 하나의 유무가 컨테이너 기하를 바꾸는, Button 의 `Icon` 과 같은 사례다 | **조건 축.** 헤드라인 줄 수(2줄 → 1줄)도 같이 갈린다 |
| GnbMenuItem `Surface` (`light`·`dark`) | 밝기라서 `Tone` 이 아니고, 테마라서 모드인 것도 아니다 — 제품이 이 자리에 **고정 팔레트**를 쓴다 | **`Surface` 축을 연다.** 값은 면을 가리킨다(위 「`Surface` 는 테마가 아니다」) |
| GnbMenuItem `State=Selected` | 불투명도 0.70 / 0.65 → **1.00** 이다(시험 1). BOOLEAN 으로는 못 그린다. 접기 시험: 제품에서 활성 링크는 hover 로 아무것도 바뀌지 않고(hover 투명도는 비활성 쪽에만 있다), 갈 곳 없는 항목과 활성은 같이 서지 않는다 — 곱할 것이 없다 | **`State` 의 값으로 그대로 둔다.** 고칠 것은 변형이 아니라 「BOOLEAN 으로 빼라」던 지시 쪽이었다 |

**같은 결함이 기존 컴포넌트에도 있다.** 여섯은 그것을 드러낸 것이지 새로 만든 것이 아니다.

- Switch 는 `Checked: false|true` 로 **이미** 조건 축을 쓰고 있었다. 표가 인정하지 않았을 뿐이다.
- Checkbox 는 같은 개념을 `State`(`Default`·`Checked`·`Indeterminate`·`Disabled`) 안에 두었다.
  두 컴포넌트가 같은 것을 다른 형태로 갖는다.
- SegmentedControlItem 의 `SelectedDisabled` 는 접기 시험을 통과하지 못한 축을 접은 자국이다.
- SidebarNavItem 은 `Collapsed` 조건 축을 옳게 갖고 있으면서 `State` 에는 `Current` 를 갖는다.

넷 다 이번 개정 범위 밖이다. 고칠 때 이 절의 시험을 그대로 적용한다.

### 2026-08-29 개정의 근거 — PaneDivider `Orientation`

[PaneDivider](../components/pane-divider.md) 를 세우면서 표에 없는 축이 또 필요해졌다. 축 어휘가
닫혀 있으므로 규칙대로 문서를 먼저 고친다.

| 컴포넌트 · 축 | 무엇이 걸렸나 | 판정 |
| --- | --- | --- |
| PaneDivider `Orientation` (`vertical`·`horizontal`) | **네 시험 중 둘이 걸린다.** 시험 2(기하) — 프레임 자신의 고정 크기가 4×60 ↔ 60×4 로 전치된다. 시험 1(스타일) — 그립이 계속 보이는 채로 길이가 자라는 축이 `height` ↔ `width` 로 갈리고 커서도 `ew-resize` ↔ `ns-resize` 다. BOOLEAN 으로는 어느 쪽도 못 그린다 | **`Orientation` 축을 연다.** 값은 `vertical`·`horizontal` 둘뿐이다 |

**`Direction` 으로 접지 않은 이유를 적어 둔다.** 이름이 둘 다 「방향」이라 다음 사람이 합치려 들
자리다. `Direction`(`prev`·`next`)은 CarouselArrow 판정문이 못박았듯 **기하가 전부 같고 글리프
향만 바뀌는** 축이다. 여기서는 기하가 90° 전치된다 — 같은 이름에 두 뜻을 담으면 어느 쪽이든
설명이 틀린다. `Axis` 도 후보였으나 Figma 의 축(variant property) 자체를 가리키는 말과 겹쳐
문장이 「Axis 축」이 된다.

**compact 는 축이 아니다.** 좁은 화면에서 가로 구분자는 트랙이 4 → 8 로 두꺼워지고 그립이
60 → 48 로 줄지만, 그것은 뷰포트가 정하는 것이지 인스턴스가 고르는 것이 아니다. Figma 에서
고를 수 있게 만들면 **화면 폭과 무관하게 compact 를 켠 인스턴스**가 생긴다. 모드도 아니다 —
§4 가 모드를 라이트/다크에만 준다. 되읽기에 담기지 않는 축으로 남기고 규범 문서가 값을 소유한다.

### 이 개정이 남긴 결손

규칙은 섰지만 **대조되지 않은 것**이 넷 있었다. 지어내지 않고 여기 적어 둔다.
**3 은 2026-09-01 에 닫혔다** — 항목을 지우지 않고 판정을 이어 붙인다.

1. **`Surface` 값의 방향이 확인되지 않았다.** 위에서 `light` 를 「밝은 면 위」로 못박았지만,
   GnbMenuItem 의 두 변형 중 어느 쪽이 어느 색에 묶여 있는지는 되읽기로 알 수 없다 —
   `figma/readback.json` 은 변형별 색 바인딩을 내지 않고 컴포넌트 단위 집계(`boundFills`)만 낸다.
   **소유자 확인 필요**: 지금 Figma 가 반대로 묶여 있으면 값 이름을 맞바꿔야 한다(Figma 재작업).
2. **MediaCard `Badge` 축 폐기는 Figma 재작업을 요구한다.** 이 문서는 판정만 내렸고 파일은
   손대지 않았다. `Badge` VARIANT 3값을 지우고 `Badge` BOOLEAN + `BadgeLabel` TEXT 로 다시
   세우는 작업, 그리고 그 컴포넌트를 쓰는 인스턴스의 재바인딩이 남는다.
3. ~~**Button `Loading` 이 가시성만 바꾸는지 대조하지 않았다.**~~ 라벨을 감추고 스피너를 보이는
   것뿐이면 BOOLEAN 이 맞지만, 그 상태에서 padding·gap 이 다시 쓰이는지 확인하지 않았다.
   같은 날 InlineLoadingLabel 이 `Loading` 을 조건 축 명부에 올렸지만 그것은 **그 컴포넌트의
   실측**(프레임 `itemSpacing` 0 ↔ 6·4)에서 나온 판정이고, Button 의 되읽기에는 `State=Loading`
   의 padding·gap 이 담겨 있지 않았다. 이름이 열린 것을 Button 판정으로 읽지 마라.

   **2026-09-01 판정 — `State` 값으로 유지한다. 조건 축이 아니다.** 근거 둘.

   - **접기 시험을 통과한다.** `button.tsx` 가 loading 에 `aria-disabled="true"` 를 붙이고,
     `button.css` 의 hover·active 규칙이 전부 `:where(:not([aria-disabled="true"]):not(:disabled))`
     로 막혀 있다. loading 이 켜진 채로 `Hover`·`Active` 가 시각적으로 달라지지 않는다 —
     조건이 상호작용을 흡수한다.
   - **시험 2(기하)에 걸리지 않는다.** `[data-loading="true"]` 가 바꾸는 선언은 라벨
     `opacity: 0.6` **하나뿐**이다(`button.css` 의 `[data-loading="true"]` 규칙). 프레임이 자기 padding·gap 을 다시 쓰지
     않는다. `column-gap` 은 lg·md·sm 세 칸 모두 `space-control-xs`(4) 단일이다.

   **시험에 걸린 것처럼 보이게 만든 것은 Figma 였다.** 라이브 300칸을 전수로 읽으니 `itemSpacing`
   6 이 정확히 40 칸 — `State=Loading` × `Size∈{lg, md}` × variant 5 × icon 4 — 에 있었고, 코드에
   근거가 없는 값이었다(4 도 8 도 아니다). 같은 날 40 칸을 4 로 옮기고 되읽기를 맞췄다.
   **되읽기에 `State=Loading` 의 padding·gap 이 담겨 있지 않다는 위 문장은 여전히 참이다** —
   snapshot 은 size 별 집계라 칸을 보존하지 않는다. 이번 판정은 되읽기가 아니라 **라이브 전수
   순회**로 냈다. 다음에 같은 종류의 결손을 닫을 때도 집계로는 닫히지 않는다.
4. **`Mode` 축의 값 명부가 ProgressBar 하나에서 나왔다.** 두 번째 소비처가 생기기 전까지
   `determinate`·`indeterminate` 밖의 값은 근거가 없다. 그리고 Switch 는 `Disabled` 를 조건
   축으로 갖고 `State` 축이 아예 없다 — 상호작용 상태는 `State` 가 소유하므로 어긋나지만,
   여섯 사례에 걸리지 않아 이번에 판정하지 않았다.

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

**예외처럼 보이는 것 하나.** 한 테마 안에서 밝은 면과 어두운 면이 같이 있고 컴포넌트가 그중
어디에 앉느냐로 색이 갈리는 자리는 테마 문제가 아니라 `Surface` 축이다. 판정은 §2 의
「`Surface` 는 테마가 아니다」가 소유한다.

## 5. 조합 예산

`variantCount` 는 축의 곱이다.

**예산을 넘기려면 축을 하나 슬롯으로 내릴 수 있는지 먼저 검토한다.** 넘겨야 한다면 컴포넌트
description 에 이유를 적는다. 조합이 늘면 유지 비용이 곱으로 늘고, 실제로 쓰이지 않는 조합이
정본인 척 남는다.

**이 문단은 2026-09-01 까지 「Button 은 4 × 2 × 5 = 40 으로 현재 최대다」라고 적고 있었다.**
그날 라이브 실측은 **300**(5 × 3 × 5 × 4)이었다 — 7.5 배이고, 규범이 요구한 description 사유도
그때까지 비어 있었다. 예산 문장이 축이 열리는 것을 따라가지 못하면 상한이 아니라 **낡은 기록**이
된다.

**그리고 하루 만에 그 300 도 낡았다.** 2026-09-02 에 `Variant` 에 `danger-secondary` 가 열리면서
Button 은 **360**(6 × 3 × 5 × 4)이 됐다([DS-D-0045](decisions/DS-D-0045-danger-secondary-variant.md)).
아래 표는 그래서 **수와 함께 세는 명령**을 적는다 — 수는 다시 낡지만 명령은 낡지 않는다.

```sh
node -e "const d=require('./figma/readback.json');
const e=Object.entries(d.components).map(([k,v])=>[k,v.variantCount??0]).sort((a,b)=>b[1]-a[1]);
const t=e.reduce((a,[,n])=>a+n,0), ns=e.map(([,n])=>n).sort((a,b)=>a-b);
const x=e.filter(([k])=>k!=='Button');
console.log('set',e.length,'변형',t,'중앙값',ns[Math.floor(ns.length/2)],
            'Button 제외 평균',(x.reduce((a,[,n])=>a+n,0)/x.length).toFixed(1));
console.log(e.slice(0,4));"
```

라이브 분포(2026-09-02 기준 51 set · 620 변형 — 위 명령의 출력이다):

| | 값 |
| --- | --- |
| 중앙값 | 3 |
| Button 제외 평균 | 5.2 |
| 1위 Button | 360 (전체의 58%) |
| 2위 IconButton | 60 |
| 3위 Slider · SegmentedControlItem | 18 |

**Button 은 이상치다.** 다만 줄일 수 있는 것은 값이 아니라 **교차**다 — 2026-09-01 감사에서
`Icon` 을 BOOLEAN 으로 내리는 안, `both` 를 지우는 안, `State` 축을 스펙시멘 보드로 옮기는 안이
전부 반박됐다(각각 Figma 에 음수 margin 이 없다 · `both` 가 유일 기하다 · 이 파일의 칸을 만드는
생성기가 저장소에 없다). 사유는 Button 의 Figma description 이 소유한다.

**`danger-secondary` 는 그 예산 안에서 축을 «연» 사례이지 교차를 늘린 사례가 아니다.** 값 하나가
늘어 60칸이 붙었고, 그 60칸은 기하를 하나도 새로 만들지 않는다 — `danger` 와 60 조합 전부에서
기하 차이가 0 이다. 예산이 막아야 하는 것은 「쓰이지 않는 조합이 정본인 척 남는 것」인데, 이 축은
소유자가 직접 그려 둔 스펙이라 그 위험이 없다. 대신 이 문단이 그은 선은 그대로다 — 다음에 축을
하나 더 열면 곱이 다시 60씩 늘어난다.

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

### 예외 — 축이 셋을 넘는 set 은 격자로 놓는다 (2026-09-01, Button)

**위 규칙의 목적은 「변형이 잘리면 안 된다」이지 오토레이아웃 자체가 아니다.** 축이 넷인 Button
에서는 `WRAP` 이 그 목적을 이루지 못한다 — 칸 폭이 라벨을 따라 48~95 로 제각각이라 줄마다 다른
개수가 들어가고, **열이 축과 어긋나 어떤 조합인지 읽을 수 없다.** 실제로 그 상태의 Button 은
97열 × 38행에 간격이 72·1·6·2·10·4·8·28 로 흩어진 벽이었고, 소유자가 「방대해서 뭐가 뭔지
모르겠다」고 지적했다.

그래서 Button 은 `layoutMode = 'NONE'` 에 **좌표 격자**로 놓는다. 읽는 순서가 축의 순서다.

- 세로 블록 = `Size` (lg · md · sm), 블록 간격 96
- 블록 안 행 = `Variant` (5), 행 pitch 64, 칸은 행 안에서 세로 가운데
- 열 = `State` 5 묶음 × 그 안 `Icon` 4 (none · left · right · both), 열 pitch 143, 묶음 간격 40
- 축 이름은 set 밖의 잠긴 그룹 「Button · 축 안내」가 갖는다 — component set 은 COMPONENT 만 담는다

**예외를 쓰면 수치로 증명한다.** 눈으로 보지 말고 넷을 재서 남긴다.

1. 칸끼리 교집합 0 (300칸 전수 쌍 검사)
2. 프레임 밖으로 나간 칸 0
3. 열 pitch − 가장 넓은 칸 ≥ 40 (라벨이 자라도 이웃을 안 침범할 여유)
4. 프레임 여백 — 오른쪽·아래 모두 > 0

2026-09-01 Button 실측: 겹침 0 · 잘림 0 · pitch 143 − 최대 칸 95 = **48** · 여백 오른쪽 80 ·
아래 52. 이 넷 중 하나라도 무너지면 예외를 쓸 자격이 없는 것이므로 `WRAP` 으로 되돌린다.

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

이 절은 §2 「BOOLEAN 은 레이어 가시성만 바꾼다」의 **시험 2**(프레임 자신의 기하)를 처음 만난
기록이다. 판정 규칙 넷 전체는 그쪽이 소유한다 — 여기만 읽으면 스타일·전이·문구가 걸리는 경우를
놓친다.

옵션 슬롯은 **BOOLEAN + INSTANCE_SWAP** 이 기본이다(베리언트로 쪼개면 곱셈이 된다). 단, 그 슬롯이
**컨테이너의 기하를 바꾸면 불리언으로는 표현할 수 없다** — 불리언은 자식의 가시성만 바꾸고
프레임의 padding·gap 은 못 바꾼다.

Button 이 그 경우였다. 코드는 아이콘이 붙은 쪽 padding 을 2px 줄이는데(`packages/css/src/component/button.css:78-91`),
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

세그먼트 hover 는 **글자색만** 바꾼다(`packages/css/src/component/segmented-control.css:122-127`). 면까지 바꾸면 선택된
것과 얹은 것이 같은 표현이 되어 어느 쪽이 현재 값인지 순간 읽히지 않는다 — CSS 주석이 그렇게
적어 두었는데도 처음엔 면을 칠했다. 상태를 만들기 전에 그 상태의 CSS 규칙을 먼저 읽는다.

### 포커스 링은 `outline` 이고 `outline-offset` 이 있다

`packages/css/src/base.css:50-54` 는 `outline: 2px solid stroke-focus; outline-offset: 2px` 다. Figma 에는
outline-offset 이 없으므로 **요소보다 각 변 2px 큰 사각형에 2px OUTSIDE stroke** 를 둔다.
반지름도 따라간다 — 요소 반지름 + 2. 요소에 바로 stroke 를 걸면 딱 붙은 각진 상자가 되고,
그건 브라우저가 그리는 것과 다르다.

## 기록 — Linear 의 `_` 접두사 관행 (도입하지 않았다)

**여기 적힌 것은 규칙이 아니라 기록이다.** 도입 여부는 소유자가 정한다. 고치지 말고 읽어라.

참고 파일 `IWohxdWtibbqKNKayhhkLN`("Linear Design System (Community)")는 **밖에서 인스턴스로 쓰지
않는 내부 부품을 이름으로 표시한다** — `_Dropdown Options` · `_Search Box` · `_Priority` ·
`_Assignee` · `_Issue Header` · `_Activity Logs` · `_Key`. `Issue Page` section 하나에서 내부 부품
29 · 공개 79 로 갈린다. 수는 2026-09-01 에 그 파일을 `get_metadata` 로 읽어 얻었고, **읽기 전용
참고라 이 저장소의 어떤 게이트도 그것을 재지 않는다.**

**우리에게 없는 것이 그 구분이다.** 원장 `migration/product.surfaces.json` 은 `scoped`(범위 밖)와
`figma`(대응)를 이미 가르지만, 그 구분은 **Figma 이름 안에서는 보이지 않는다.** 파일을 연 사람은
Assets 목록에서 세트를 평평하게 보고, 어느 것이 다른 자리에서 집어다 쓰라고 만든 것이고 어느 것이
한 컨테이너가 조립해 쓰는 자식인지 이름이 말하지 않는다. `SegmentedControlItem` 처럼 컨테이너가
소비하는 자식이 지금도 여럿이다.

**도입하면 걸리는 것 — 이름 규칙 하나가 아니라 게이트 어휘의 확장이다.**

- `scripts/verify-figma-parity.mjs` 는 계약 ↔ Figma 를 **양방향으로 잠근 닫힌 집합**이다.
  이름을 바꾸면 계약의 `figmaName` 을 같은 변경에서 바꿔야 하고, `_` 를 붙인 **새** 내부 부품을
  만들면 「계약에 없는 component set이 있습니다」로 실패한다.
- 그래서 이 관행을 들이려면 계약에 「내부 부품」이라는 종류를 만들거나, 내부 부품을 계약 밖으로
  빼는 규칙이 **함께** 서야 한다. 후자는 위험하다 — 계약 밖은 곧 대조 밖이고, 그 순간 그 부품은
  값이 갈려도 아무도 모른다.
- 되읽기·snapshot·`figma/component-summaries.json`·컴포넌트 문서의 이름이 한 줄로 이어져 있으므로
  개명은 그 줄 전체를 움직인다.

**무엇을 다시 이름 지어야 하는지는 여기서 세지 않는다.** 세는 순간 이 기록이 결정이 된다.
후보를 세우려면 먼저 「밖에서 인스턴스로 소비되는가」를 컴포넌트마다 판정해야 하고, 그 판정의
근거는 이 저장소 안에 이미 있다 — 각 컴포넌트 문서의 「언제 쓰지 않나」와 계약의 조립 관계다.
