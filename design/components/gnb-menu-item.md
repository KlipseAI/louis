---
id: gnb-menu-item
status: experimental
authority: normative
summary: 랜딩 상단 내비게이션의 가운데 메뉴를 이루는 알약형 항목 하나입니다.
---

# GNB Menu Item

랜딩 GNB 가운데 메뉴의 항목 하나. 인페이지 앵커 · 라우트 링크 · 드롭다운 트리거 · 「공개 예정」
넷이 **같은 알약**을 쓴다.

**정본은 제품이다.** `landing/navigation/Gnb.tsx` 의 `menuLinkClass()` 가 구현이고 LOUIS 에는
표면이 없다 — `packages/css/src/component` 에 레시피가 없고 `packages/react/src` 에도 디렉터리가
없다. 앱 셸 사이드바의 항목과는 다른 컴포넌트다(아래 When to use).

**상태를 색이 아니라 불투명도로 만든다.** 여덟 변형의 기하가 완전히 같고, 면도 테두리도 밑줄도
없다 — 바뀌는 것은 잉크 한 색의 불투명도뿐이다(1.00 · 0.90 · 0.80 · 0.70 · 0.65 · 0.40). 되읽기의
기하 값이 전부 **단일값**(28 · 72 · 12 · 999 · 21)인 것이 그 증거다. 기하 키가 `base` 하나인
것은 증거가 아니다 — 그 키는 발행 스크립트(`scripts/figma-readback-emit.mjs`)의 채취 명세에 손으로
적힌 선언이고, 기하가 갈렸더라도 키는 그대로 `base` 다.

**그 조형이 접근성 결함 하나를 숨겼다.** 색만 훑으면 두 톤 모두 팔레트 양 끝(`#171b22` ·
`#fafafa`)이라 통과처럼 보인다. 조상까지의 요소 불투명도를 글자 알파에 곱해 재야 밝은 면 위
기본 상태가 AA 미달이라는 것이 드러나고, 제품은 그래서 시안 값 0.50 을 **0.65** 로 올렸다.
**Figma 는 아직 0.50 을 그리고 있다**(Known deviations 1).

**톤은 테마가 아니라 「내 밑에 깔린 면」이다.** `html[data-theme]` 이 아니라 GNB 아래에 지금
무엇이 깔려 있는지가 잉크를 정한다 — 라이트 테마의 랜딩 안에도 어두운 사진 밴드가 있고
(`data-nav-tone="dark"`), 랜딩 밖의 밝은 페이지는 테마와 무관하게 고정한다(`lightSurface`).
그래서 제품은 테마를 따라 뒤집히는 시맨틱 `gray-*` 램프가 아니라 **고정 팔레트**
`palette-gray-*` 를 쓴다. 시맨틱을 쓰면 라이트에서 `gray-900` 이 면 색이 되어 글자가 바닥과
같아진다 — 제품 주석에 실제로 그렇게 사라졌던 기록이 남아 있다.

## Availability

| Surface       | 상태           | 근거                                                                                                                                                                                                     |
| ------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web           | `not-ready`    | 제품 구현이 정본이고 소비처는 랜딩 GNB 한 자리(같은 파일 안 네 갈래)다. **LOUIS 표면은 0** — CSS 레시피도 React export 도 없고 acceptance test 도 0건이다                                                |
| Figma         | `partial`      | `GnbMenuItem` 8 variant(`Surface` × `State`) + `Label` TEXT. parity 게이트가 대조하는 것은 속성 축 셋 · raw fill·stroke 0 · 스타일 없는 텍스트 0 · stroke 없음 · effect 없음 · set 설명 유무 · 프레임 밖 넘침 0 · 광학 중앙 이탈 0 이다. **기하도 불투명도도 대조하지 않는다** — `figma/components.measured.json` 에 항목이 없고 되읽기가 opacity 를 담지 않는다 |
| Documentation | `done`         | 이 문서                                                                                                                                                                                                  |
| Maturity      | `experimental` | 되읽기와 문서가 방금 처음 섰다. Figma 의 0.50 을 0.65 로 고치고 LOUIS recipe 가 서면 승격한다                                                                                                            |

## When to use

- 랜딩 상단 내비게이션의 가운데 메뉴. **이 자리 하나가 전부다.**
- 쓰지 않는 자리:
  - **앱 셸 사이드바의 내비 항목** — [App Shell Parts](./app-shell-parts.md) 의
    `SidebarNavItem` 이다. 그쪽은 세로로 쌓이고 선택 상태를 **면**으로 만든다.
  - **화면 안의 탭 줄** — [Tabs](./tabs.md) 의 `TabItem` 이다. 선택을 인디케이터로 표시하고
    `role="tab"` 계약을 갖는다. GNB 항목은 그냥 링크다.
  - **드롭다운 안의 항목** — [Menu / Popover](./menu-popover.md) 다. 이 컴포넌트는 그 드롭다운을
    **여는 트리거**까지만이고 패널 안쪽은 갖지 않는다.
  - **720px 미만의 모바일 메뉴 행** — 다른 조형이다. 풀스크린 메뉴의 행은 `body-20-medium` 에
    선택 상태를 면으로 그린다. 719px 이하에서 이 컴포넌트는 메뉴째로 사라진다.

## Anatomy

1. **Pill** — 알약 하나. 높이 28 고정, 좌우 안쪽 12, 반경 999. **면이 없다**(`bg-transparent`).
2. **Label** — 그 안의 글자 한 줄. `body-14-medium`, 줄 높이 150%(21).

끝이다. 아이콘도 캐럿도 점도 없다 — 「리소스」 드롭다운 트리거조차 캐럿을 달지 않는다.

항목 사이 간격은 **16** 이고, 그 값은 메뉴 `<ul>` 이 갖는다(`gap-8`) — 이 컴포넌트 밖이다.

## Properties

**대조할 컴포넌트가 없다.** 제품은 이것을 컴포넌트가 아니라 **클래스 조립 함수**로 갖고 있고
(`menuLinkClass(isActive, navBlack)`), 항목은 그 결과를 받는 네 가지 요소로 각각 렌더된다 —
`<a>`(앵커) · `<Link>`(라우트) · `<button>`(드롭다운 트리거) · `<span>`(공개 예정). 그래서
parity 계약도 `figmaAhead` 로 그 사실을 적어 둔다.

| 인자 · 조립 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `isActive` | boolean | 없음 | Selected 로 만든다. 라우트 일치 · 섹션 감지 · 드롭다운 열림 셋 중 하나가 참이면 켠다 |
| `navBlack` | boolean | 없음 | 밑에 깔린 면이 **밝은가**. 잉크와 불투명도 두 벌을 동시에 가른다 |
| `MENU_LINK_COMING_SOON` 덧붙임 | — | 없음 | Disabled. 불투명도 0.40 을 `!` 로 고정하고 커서를 `not-allowed` 로 바꾼다 — `!` 는 불투명도에만 붙는다 |
| 라벨 | 문구 | 없음 | 유일한 내용이다. 전부 i18n 에서 온다 |

Figma 의 축은 이것과 이렇게 대응한다.

| Figma | 타입 | 코드 대응 |
| --- | --- | --- |
| `Label` | TEXT | 요소의 children |
| `Surface` | VARIANT `light` · `dark` | `navBlack`. **이름이 뒤집혀 있다** — 아래 주의 |
| `State` | VARIANT `Default` · `Hover` · `Selected` · `Disabled` | `Hover` 는 CSS 상태, `Selected` 는 `isActive`, `Disabled` 는 덧붙임 클래스 |

**이름이 가리키는 대상이 두 곳에서 다르다.** Figma 의 `Surface` 는 **면**을 부르고(밝은 면 ·
어두운 면), 제품 상수는 **잉크**를 부른다(`MENU_LINK_TONE_LIGHT` = 밝은 잉크). 그래서 대응이
교차한다 — `Surface=light` ↔ `TONE_BLACK`(검은 잉크), `Surface=dark` ↔ `TONE_LIGHT`(흰 잉크).
한쪽만 보고 옮기면 두 톤이 통째로 바뀐다.

## Variants, sizes, and states

크기 축이 없다. 높이 28 하나다.

| 축 | 값 | 무엇이 바뀌나 |
| --- | --- | --- |
| `Surface` | `light` · `dark` | 잉크 색 하나와 불투명도 두 값(Default · Hover). 기하는 그대로 |
| `State` | `Default` · `Hover` · `Selected` · `Disabled` | 불투명도와 커서. 아래 States |

두 축은 직교하고 8 = 2 × 4 가 전부 존재한다. **`variantCount` 8 은 조합 예산(40) 안이다.**

## States

불투명도 표가 이 컴포넌트의 전부다. 값은 제품 소스에서 끌어왔다.

| 상태 | 밝은 면 (`Surface=light`, 검은 잉크) | 어두운 면 (`Surface=dark`, 흰 잉크) |
| --- | --- | --- |
| Default | **0.65** | 0.70 |
| Hover | 0.80 | 0.90 |
| Selected | 1.00 | 1.00 |
| Disabled | 0.40 · `cursor: not-allowed` | 0.40 · `cursor: not-allowed` |
| Focus | **없다.** 아래 Accessibility | 같음 |
| Active(누르는 중) | **없다.** 제품에 `:active` 선언이 없다 | 같음 |

- **Selected 는 톤을 타지 않는다.** 두 면 모두 1.00 이다 — 활성이면 톤 분기에 도달하지 않는
  **상호배타 삼항**이라 불투명도 클래스가 하나만 나가기 때문이다. 소스 순서로 이기는 것이
  아니다: Tailwind 는 소스 순서가 아니라 자체 정렬로 승자를 정하므로, 그래서 `!` 대신 삼항을 썼다.
- **Disabled 가 hover 를 이긴다.** 0.40 에만 `!` 가 붙어 있어, 마우스를 얹어도 0.80/0.90 이
  적용되지 않는다. 「갈 곳이 없다」가 커서와 불투명도로 동시에 드러난다.
- **두 톤의 Default 값이 다른 것이 맞다.** 같은 불투명도라도 검은 잉크가 훨씬 빨리 무너진다 —
  0.70 은 어두운 면에서 문제가 없지만 밝은 면에서는 AA 를 넘지 못한다(Accessibility).

전환은 `color 320ms ease, opacity 200ms ease` 다. 기하는 움직이지 않는다.

## Interaction and responsive behavior

- **hover 가 `@media (hover: hover)` 로 감싸이지 않는다.** 제품이 Tailwind 의 `hover:` 대신
  `[&:hover]:` 임의 변형을 쓰기 때문이다(모듈 CSS 의 `:hover` 를 계산값 그대로 옮기려는
  의도적 선택이었다). 터치 기기에서 탭 후 hover 불투명도가 남을 수 있다 — 결손으로 적어 둔다.
- **719px 이하에서 메뉴가 통째로 사라진다.** 항목 하나가 숨는 것이 아니라 `<ul>` 이
  `display: none` 이 되고, 같은 목적지가 풀스크린 모바일 메뉴로 옮겨 간다. 이 컴포넌트에는
  좁은 화면 거동이 없다.
- 폭은 라벨이 정한다(`inline-flex`). 로케일이 바뀌면 항목 폭도 메뉴 전체 폭도 달라진다.
- 항목은 그리드 가운데 칸에 놓이고 좌우 두 칸(로고 · CTA)이 남는 폭을 나눈다.
- 인페이지 앵커 항목은 클릭 시 `activeSection` 을 갱신해 스스로 Selected 가 된다. 라우트 항목은
  경로로 판정하고, 드롭다운 트리거는 열림 여부로도 Selected 가 된다.
- 모션 축소 계약이 필요 없다 — 움직이는 것이 색과 불투명도뿐이다.

## Content

- **한 단어짜리 명사다.** 문장도 동사구도 넣지 않는다. 폭이 라벨을 따라가므로 길어지면 메뉴
  전체가 밀린다 — 일본어 「ショーケース」·「ドキュメント」·「お問い合わせ」 셋이 전각 6자로 현재
  가장 길다(글자 수 기준이며 폭을 실측하지는 않았다).
- 「공개 예정」은 **라벨이 아니라 툴팁**이다. 항목의 글자는 목적지 이름 그대로 두고, 갈 곳이
  없다는 사실은 불투명도 0.40 과 `title` 이 말한다.
- 문구 키가 이름과 어긋난 자리가 하나 있다 — 드롭다운 트리거의 키는 `community` 인데 문구는
  「리소스」다. 문구를 고치러 올 사람이 키를 찾기 어렵다(결손).

| | KO | EN | JA |
| --- | --- | --- | --- |
| 앵커 | `쇼케이스` | `Showcase` | `ショーケース` |
| 라우트 | `가격` | `Pricing` | `料金` |
| 라우트 | `문의` | `Contact` | `お問い合わせ` |
| 드롭다운 트리거 | `리소스` | `Resources` | `リソース` |
| 공개 예정 | `문서` | `Docs` | `ドキュメント` |
| 공개 예정 툴팁 | `공개 예정` | `Coming soon` | `近日公開` |

「문의」의 영문이 `Inquiry` 가 아니라 `Contact` 인 것처럼, 라벨은 키 이름의 직역이 아니라 그
자리에서 읽히는 말이다.

## Accessibility

- 네 갈래가 각각 네이티브 요소다 — `<a>` · `<Link>`(앵커로 렌더) · `<button type="button">` ·
  `<span>`. 앞의 셋은 키보드 조작이 그대로 동작한다.
- **Selected 를 `aria-current` 가 실어 나른다.** 라우트 항목은 `page`, 인페이지 앵커는
  `location` 이다. 색이 아니라 이름에 상태가 실린다.
- 드롭다운 트리거는 `aria-haspopup` 과 `aria-expanded` 를 갖는다. 다만 **커뮤니티 경로에
  있으면서 닫혀 있을 때** 시각적으로는 Selected 인데 `aria-current` 가 없다 — 그 상태를 읽을
  방법이 없다(Known deviations 6).
- **대비.** 밝은 면은 `palette-gray-900`(`#171b22`) 잉크에 랜딩 바닥 `#f1f1f3` 조합이다.
  요소 불투명도를 글자 알파에 곱해 sRGB 에서 합성한 뒤 상대휘도로 재면 Default 0.65 가
  **5.11:1** 로 AA(4.5)를 넘는다. 0.50 이었을 때는 **3.23:1** 로 미달이었고, 이 문서가 같은 식으로
  다시 재도 3.23:1 이다(제품 주석 기록값과 일치). 어두운 면은 흰 잉크 0.70 에 다크 테마 랜딩 바닥
  `#000000` 조합이라 **9.57:1** 이어서 손대지 않았다(제품 주석 기록값) — 어두운 사진 밴드 위에서는
  검정 70% 스크림 아래 사진에 따라 달라진다.
- **비활성 컨트롤 면제가 성립하지 않는다.** SC 1.4.3 은 비활성 컨트롤을 면제하는데, GNB 항목은
  누를 수 있는 내비게이션 링크라 그 대상이 아니다. 0.50 을 「비활성처럼 흐린 상태」로 읽고
  넘어가면 안 되는 이유가 이것이다.
- **Disabled 항목의 대비는 판정이 열려 있다.** 0.40 은 밝은 면에서 약 2.5:1 이다(이 문서가
  같은 식으로 계산했다). 그런데 그 요소는 `<span>` 이고 role 이 없어 보조기술에는 「비활성
  컨트롤」이 아니라 **본문 글자**로 읽힌다 — 면제가 성립하는지 자체가 불명확하다.
  **소유자 판정 필요**(Known deviations 5).
- **포커스 표시를 아무도 소유하지 않는다.** 제품 클래스에 `:focus-visible` 선언이 하나도 없고
  Figma 에도 `Focus` variant 가 없다. 지금 보이는 것은 브라우저 기본 링이며, 두 면 위에서
  대비가 보장되지 않는다 — **SC 2.4.7 결손**이고 LOUIS recipe 를 세울 때 가장 먼저 채워야 할
  칸이다.
- 타깃 높이 28 은 SC 2.5.8(24 × 24) 은 넘고 SC 2.5.5(44 × 44) 에는 미달한다. 항목 사이 간격
  16 이 오조작을 줄이는 유일한 장치다.
- 모션 없음 — `prefers-reduced-motion` 계약이 필요 없다.

## Specification

| Part/state | 값 | 토큰·근거 |
| --- | --- | --- |
| 알약 | 높이 28 · 좌우 안쪽 12 · 위아래 0 | `h-14` · `px-6` · `py-0`(2px 그리드) |
| 반경 | 999 | `rounded-[999px]` — `radius/full` |
| 면 | **없다** | `bg-transparent`. 여덟 상태 전부 |
| 테두리 · 그림자 | **없다** | 되읽기의 `strokeWeight` 가 비어 있고 `effects` 도 비어 있다 |
| 폭 | 라벨이 정한다 | `inline-flex`. 되읽기의 72 는 라벨 48 + 12 + 12 인 한 사례다 |
| 라벨 | body-14-medium, 줄 높이 150%(21) | `typography/body-sm-medium` · `type-body-14-medium`. **되읽기로 확인되는 것은 크기 14 · 줄 높이 150% 까지다** — 스타일 이름을 담지 않아 굵기는 대조되지 않는다(Known deviations 10) |
| 세로 정렬 | 21 을 28 안에서 가운데 | `items-center`. **안쪽 여백이 아니다** — paddingBlock 은 0 이고 남는 3.5 는 정렬의 결과다 |
| 글꼴 · feature | 타입 스케일 그대로 | `--type-font-family` · `--type-feature-settings` |
| 잉크 (밝은 면) | `#171b22` | `color/palette-gray/900`. **시맨틱 램프가 아니다** |
| 잉크 (어두운 면) | `#fafafa` | `color/palette-gray/000`. 같음 |
| Default | 0.65 (밝은 면) · 0.70 (어두운 면) | — |
| Hover | 0.80 (밝은 면) · 0.90 (어두운 면) | — |
| Selected | 1.00 (두 면 공통) | — |
| Disabled | 0.40 · `cursor: not-allowed` | 불투명도에만 `!` 가 붙는다 — 그래서 hover 가 이기지 못한다 |
| 전환 | `color 320ms ease, opacity 200ms ease` | — |
| 항목 간격 | 16 | 메뉴 `<ul>` 이 갖는다(`gap-8`) — 이 컴포넌트 밖이다 |
| 표시 한계 | 719px 이하에서 메뉴째 숨김 | 같은 래퍼가 갖는다 — 이 컴포넌트 밖이다 |

## Known deviations

1. **Figma 가 아직 0.50 을 그리고 있다.** 제품은 밝은 면 위 `State=Default` 를 **0.65** 로
   올렸다 — 0.50 에서는 `palette-gray-900` 이 랜딩 바닥과 AA 미달이었고, 누를 수 있는 링크라
   비활성 면제 대상이 아니기 때문이다(Accessibility). 어두운 면 0.70 은 그대로다.
   **결손: Figma `Surface=light` · `State=Default` 의 불투명도를 0.65 로 고쳐야 한다.**
   더 나쁜 것은 **어떤 게이트도 이 어긋남을 잡지 못한다**는 사실이다 — 되읽기가 opacity 를
   담지 않아 parity 계약에 적을 자리가 없다. 되읽기에 불투명도 축을 더하는 것이 이 컴포넌트의
   승격 조건이다.
2. **`Surface` 축은 판정을 받아 축 표에 열렸다 — 값의 방향만 확인이 남았다.**
   `design/governance/figma-component-authoring.md` §2 개정이 `Surface` 를 축 어휘에 넣고
   §4(라이트/다크는 모드로만)와의 경계를 **판정 규칙**으로 못박았다: 제품이 그 자리를 시맨틱
   램프(`gray-*`)로 받으면 모드, 고정 팔레트(`palette-*`)로 받으면 `Surface` 축이다. 이 메뉴
   링크는 `palette-gray-000` / `palette-gray-900` 고정값이고 톤을 테마가 아니라 페이지가
   정하므로 후자다. 축을 여는 추가 조건(한 테마 안에서 두 밝기가 실제로 같이 나타날 것)도
   충족한다 — 라이트 테마의 랜딩 안에 어두운 사진 밴드가 있다. 값은 잉크가 아니라 **면**을
   가리킨다(`light` = 밝은 면 위 = 어두운 잉크). **남은 것은 Figma 확인이다** — 두 변형 중
   어느 쪽이 어느 색에 묶여 있는지 되읽기가 내지 않아(변형별 색 바인딩 없음) 이 저장소에서는
   확인할 수 없다. 반대로 묶여 있으면 값 이름을 맞바꿔야 한다.
3. **`State=Selected` 는 그대로 두기로 판정됐다(해소).**
   `design/governance/figma-component-authoring.md` §2 개정이 「Selected 는 BOOLEAN 으로 빼라」던
   앞선 지시 쪽을 오류로 정정했다 — 불투명도 0.70 / 0.65 → **1.00** 이라 BOOLEAN 으로는 그릴 수
   없다(시험 1). 그리고 같은 절이 세운 **접기 시험**을 적용하면 이 자리는 접는 쪽이 맞다:
   제품에서 활성 링크는 hover 로 아무것도 바뀌지 않고(hover 불투명도는 비활성 쪽에만 있다),
   갈 곳 없는 항목과 활성은 같이 서지 않는다 — 곱할 조합이 없다. 변형 8 을 유지한다.
4. **되읽기 `boundFills` 12 중 넷이 설명되지 않는다.** 변형 8 개의 라벨 fill 여덟을 빼면 넷이
   남는다(비교: CarouselArrow 는 6 변형 · 8 fill 이고 그 둘이 hover 겹이다). **제품은 여덟
   상태 전부 `bg-transparent` 라 어떤 상태에도 면이 없다.** 되읽기가 파트별 분해를 주지 않아
   그 넷이 무엇인지는 확정할 수 없다. Figma 에 Hover · Selected 용 알약 면이 그려져 있다면
   제품과 다른 조형이다 — **소유자 확인 필요.**
5. **Disabled 가 요소로는 아무것도 아니다.** 제품은 `<span aria-disabled="true">` 에 `title`
   을 달았는데, role 없는 `<span>` 에 붙은 `aria-disabled` 는 보조기술이 해석하지 않고 `title`
   도 상호작용 요소가 아니면 안정적으로 읽히지 않는다. 결과적으로 스크린리더에는 **평범한
   본문 글자 한 덩어리**로 들린다. 대비 면제 판정이 열려 있는 것도 같은 이유다
   (Accessibility). **소유자 판정 필요**: `<a aria-disabled>` + `role="link"` 로 올리는가,
   항목 자체를 메뉴에서 빼는가.
6. **드롭다운 트리거의 Selected 를 읽을 방법이 없다.** 커뮤니티 경로(`/templates` ·
   `/blog`)에 있으면 트리거가 1.00 으로 그려지는데 `aria-current` 가 붙지 않는다. 열려 있을
   때는 `aria-expanded` 가 덮지만 닫힌 채 활성인 상태는 시각 정보뿐이다.
7. **hover 가 `@media (hover: hover)` 밖이다.** 임의 변형 `[&:hover]:` 를 쓰기 때문이고,
   그것은 모듈 CSS 의 계산값을 그대로 옮기려는 의도적 선택이었다. 터치 기기에서 탭 후 hover
   불투명도가 남을 수 있다. Figma 의 `State=Hover` 는 그 조건을 표현하지 않는다.
8. **기하가 게이트에 걸려 있지 않고, 폭의 성격도 확인되지 않았다.**
   `figma/components.measured.json` 에 `gnb-menu-item` 항목이 없어 28 · 12 · 999 · 21 을
   아무도 대조하지 않는다. 위 값들은 제품 소스에서 읽은 것이고 브라우저 실측이 아니다.
   더해서 되읽기에 sizing mode 가 없어 **Figma 의 폭 72 가 HUG 인지 FIXED 인지 알 수 없다** —
   제품은 내용이 폭을 정하므로 FIXED 라면 긴 로케일에서 갈라진다. 실측 probe 를 붙이는 것이
   승격 조건이다.
9. **포커스 상태가 코드에도 Figma 에도 없다.** Accessibility 의 SC 2.4.7 결손과 같은
   항목이다. `State` 축에 `Focus` 를 더하는 것은 코드에 포커스 링이 선 다음이다 — 먼저 그리면
   Figma 가 없는 것을 있는 것처럼 보여 준다.
10. **라벨의 굵기가 대조되지 않는다.** 되읽기의 `parts.Label` 은 width · height · fontSize ·
    lineHeightPercent 만 담고 텍스트 스타일 **이름**을 담지 않으며, `binding.textStyled: 8` 은
    개수일 뿐이다. `typography/body-sm` 세 굵기가 모두 14 / 150% / −0.14 라 지금 게이트로는
    regular · medium · semibold 를 가려낼 수 없다. 스타일 이름 되읽기를 더하는 것이 승격 조건
    하나다(8번의 실측 probe 와 같은 묶음).

## Acceptance tests

1. 알약 높이가 28 이고 좌우 안쪽이 12 이며 반경이 999 다.
2. 여덟 변형의 기하가 모두 같다 — 되읽기의 각 기하 값이 단일값이다(28 · 72 · 12 · 999 · 21).
   기하 키가 `base` 인 것은 채취 명세의 선언이라 증거가 아니다.
3. stroke 도 effect 도 없다 — 되읽기의 `strokes` 와 `effects` 가 비어 있다. **면이 없다는 것은
   여기서 시험되지 않는다** — 되읽기가 파트별 fill 분해를 주지 않아 `boundFills` 12 중 넷이
   설명되지 않은 채 남는다(**판정 불가**, Known deviations 4). 제품 쪽은 여덟 상태 전부
   `bg-transparent` 다.
4. 라벨의 크기가 14 이고 줄 높이가 150%(21) 다 — 되읽기로 확인된다. **굵기(medium)는 확인되지
   않는다** — 되읽기가 스타일 이름을 담지 않는다(Known deviations 10).
5. 잉크가 `color/palette-gray/900` 과 `color/palette-gray/000` 에서만 온다 — 시맨틱 `gray-*`
   램프를 쓰지 않는다.
6. `Surface=light` · `State=Default` 의 불투명도가 **0.65** 다. (지금은 0.50 이라 **실패한다** —
   Known deviations 1.)
7. `Surface=dark` · `State=Default` 가 0.70, Hover 가 각각 0.80 · 0.90, Selected 가 두 면 모두
   1.00, Disabled 가 두 면 모두 0.40 이다.
8. Figma 되읽기에서 raw fill · raw stroke · 스타일 없는 텍스트가 각각 0 이다.
9. 제품에서 라우트 항목이 `aria-current="page"` 를, 인페이지 앵커가 `aria-current="location"`
   을 갖는다.
10. 제품에서 Disabled 항목에 마우스를 얹어도 불투명도가 0.40 에서 움직이지 않는다.

## Migration and changelog

새로 선 컴포넌트다. 이전 API 가 없다. LOUIS recipe 가 서면 이 문서의 Specification 이 그 값의
정본이 된다. 사용자 영향 변경은 [Updates](../updates/README.md) 에 적는다.
