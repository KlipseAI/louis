---
id: segmented-code-input
status: experimental
authority: normative
summary: 쿠폰 코드처럼 한 글자씩 칸을 나눠 받는 입력 묶음입니다.
---

# Segmented Code Input

한 칸에 한 글자씩 받는 입력 묶음. 실물 쿠폰의 코드를 손으로 옮겨 적는 자리라, 어디까지
입력했는지 눈에 보이고 한 글자마다 다음 칸으로 넘어간다.

**정본은 제품이다.** `components/ui/SegmentedCodeInput.tsx` 가 구현이고 LOUIS 는 그것을 CSS 레시피
`packages/css/src/component/segmented-code-input.css`(2026-10-14)로 옮겼다 — `packages/react/src` 에는
디렉터리가 없다. 소비처는 `components/scenes/SubscriptionScene.tsx` 의 쿠폰 등록 모달 **한 자리**다.

**컴포넌트는 칸이 아니라 묶음이다.** 칸은 정본에서 이름 없는 `input` 이고 export 되지
않는다 — 파일이 내보내는 것은 묶음 하나뿐이다. 설계가 걸린 곳도 묶음이다: 칸이
`flex-1 min-w-0 max-w-14` 라 컨테이너에 맞춰 **줄어들고**, 정본 주석이 그 이유를 적어 뒀다 —
12칸을 고정폭으로 두면 좁은 모달(360px)에서 가로로 넘친다. 칸 하나를 컴포넌트로 뽑으면 그
줄어듦도, 칸 사이 2, 네 칸마다 오는 구분자도 아무도 소유하지 않는다. 그래서 Figma 도
**프레임 폭 386 하나만 고정했다** — 386 은 칸이 최대폭 28 에 닿는 폭이고,
12 × 28 + 2 × 12 + 13 × 2 = 386 으로 딱 떨어진다. **Figma 의 칸이 채움인지 고정인지는
확인되지 않는다** — 되읽기가 sizing mode 를 담지 않는다(Known deviations 3).

**칸 수와 묶음 크기는 이 컴포넌트의 값이 아니다.** 12 와 4 는 `length` · `groupSize` prop 으로
들어오고, 그 값은 `app/lib/payments/coupon-code.ts` 의 `COUPON_CODE_LENGTH`(12) ·
`COUPON_CODE_GROUP_SIZE`(4) 다. Figma 의 12칸 · 구분자 2 는 **그 한 소비처의 표본**이지
컴포넌트의 계약이 아니다.

## Availability

| Surface       | 상태           | 근거                                                                                                                                                                                                                                              |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web           | `not-ready`    | 제품 구현이 정본이고 소비처는 쿠폰 등록 모달 한 자리다. LOUIS 에는 CSS 레시피 `segmented-code-input.css` 가 있고(2026-10-14) React export 는 없다. 시험은 기하 되재기(`segmented-code-input-geometry.browser.test.tsx`)뿐이고 acceptance test 는 0건이다. 제품 쪽에도 이 컴포넌트를 겨냥한 테스트가 없다 |
| Figma         | `partial`      | `SegmentedCodeInput` 3 variant(`State`). parity 게이트가 대조하는 것은 속성 축 하나 · `Cell 1` stroke(1 · `INSIDE`) · effect 없음 · raw fill·stroke 0 · 스타일 없는 텍스트 0 이고, 기하도 대조한다 — `figma/components.measured.json` 의 `segmented-code-input`(제품 칸 클래스를 실브라우저에서 잰 값)과 트랙 높이(= 칸 높이 36) · 칸 28 × 36 · 칸 반경 8 · 글자와 하이픈의 크기 16 · 높이 24 를 맞댄다. 반대 방향도 걸려 있다 — `segmented-code-input-geometry.browser.test.tsx` 가 LOUIS 레시피의 계산값을 같은 기록과 맞댄다(2026-10-14) |
| Documentation | `done`         | 이 문서                                                                                                                                                                                                                                            |
| Maturity      | `experimental` | 되읽기 · 문서 · CSS 레시피 · 기하 되재기가 섰다. React 표면과 acceptance test 가 남았다                                                                                                                                                            |

## When to use

- **한 코드를 손으로 옮겨 적는 자리.** 종이·화면에 `XXXX-XXXX-XXXX` 로 찍힌 것을 보고 치는
  상황이다. 칸이 나뉘어 있으면 어디까지 쳤는지 눈으로 세지 않아도 된다.
- 쓰지 않는 자리:
  - **이름이 닮았을 뿐 관계가 없는 것** — [Segmented Control](./segmented-control.md) ·
    [Segmented Control Item](./segmented-control-item.md) 은 **고르는** 컨트롤이다. 이쪽은
    입력이고, 두 컴포넌트 사이에 공유하는 기하도 토큰도 없다.
  - **보통의 한 줄 입력** — [Text Field](./text-field.md) 다. 라벨 · 슬롯 · 도움말을 갖고
    높이가 `layout/control-height-*` 계단에 있다. 코드를 굳이 칸으로 쪼갤 이유가 없으면
    그쪽이다.
  - **코드를 여러 개 한꺼번에 붙여넣는 자리** — 운영자 화면의 쿠폰 일괄 등록은 textarea 에
    `parseCouponCodeList` 를 물린다. 줄바꿈·쉼표·탭 어느 것으로 구분해도 받아야 하므로 칸이
    성립하지 않는다.
  - **오류 문구** — 이 컴포넌트는 오류를 그리지 않는다. 형제로 놓인 `<p role="alert">` 가
    진다. [Form Message](./form-message.md) 가 덮어야 할 자리인데 **아직 덮지 못한다**
    (Known deviations 11).

## Anatomy

1. **Track** — 가로 한 줄. 높이 36, 안쪽 여백 0, 항목 간격 2. 폭은 컨테이너를 채운다.
2. **Cell** — 칸 하나. 최대 28 × 36, radius 8, stroke 1(안쪽). 12개.
3. **Char** — 칸 안의 글자 한 자. `body-md-medium`(451 이상 16 / 150% = 24, 450 이하 14 / 21), 가운데 정렬, 대문자 표기.
4. **Separator** — 12 × 24 자리에 놓인 하이픈. 네 칸마다 하나, **마지막 칸 뒤에는 없다.**
   12칸 · 묶음 4 에서 2개다.
5. **Dash** — 그 안의 `-` 글자. 크기 16.

구분자의 하이픈은 장식이 아니라 **인쇄물 표기와 같은 자리**다 — `formatCouponCode` 가
`XXXX-XXXX-XXXX` 를 만들고 쿠폰 인쇄 페이지가 실제로 그 형태로 찍는다. 손에 든 종이와 화면의
끊는 자리가 같아야 눈이 따라간다.

## Properties

정본은 제품 컴포넌트의 prop 이다. **Figma 축은 그중 `disabled` 하나에만 대응한다** — 나머지
일곱은 값이거나 콜백이라 변형으로 그릴 것이 없다.

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `value` | 문자열 | 없음 | 정규화된 코드. `length` 보다 짧아도 되고 남는 칸은 빈칸으로 보인다 |
| `onChange` | 콜백 | 없음 | 정규화를 마친 문자열을 돌려준다 |
| `normalize` | 함수 | 없음 | 입력을 저장 형태로 바꾼다. **주입받는다** — 화면과 서버가 같은 규칙을 쓰게 하려는 것이다 |
| `length` | 수 | 없음 | 칸 수. 소비처는 `COUPON_CODE_LENGTH`(12)를 넘긴다 |
| `groupSize` | 수 | 없음 | 몇 칸마다 구분자를 넣을지. 소비처는 `COUPON_CODE_GROUP_SIZE`(4)를 넘긴다 |
| `disabled` | boolean | `false` | 열두 칸 전부에 네이티브 `disabled` 를 건다 |
| `ariaLabel` | 문구 | 없음 | 묶음의 이름. **필수다** — 아래 Accessibility |
| `onComplete` | 콜백 | 없음 | 마지막 칸까지 찼을 때. **자동 제출이 아니다.** 소비처는 넘기지 않는다 |

| Figma | 타입 | 코드 대응 |
| --- | --- | --- |
| `State` | VARIANT `Default` · `Focus` · `Disabled` | `Focus` 는 CSS 상태, `Disabled` 는 `disabled` prop |

## Variants, sizes, and states

크기 축이 없다. 칸 28 × 36 하나다.

| 축 | 값 | 무엇이 바뀌나 |
| --- | --- | --- |
| `State` | `Default` · `Focus` · `Disabled` | 칸의 면·테두리와 요소 불투명도. 기하는 그대로 |

**축이 아닌 것 넷을 여기에 적는다.** 축을 늘리자는 제안이 반복해서 들어오는 자리다.

- **「입력됨 / 빈칸」이 축이 아니다.** 채워진 칸과 빈 칸을 가르는 규칙이 **CSS 에 없다** —
  정본의 칸 클래스에 있는 상태 선택자는 `[&:focus]` 와 `[&:disabled]` 둘뿐이고,
  `:placeholder-shown` 도 `data-filled` 도 없다. 채워진 칸이 달라 보이는 것은 글자가 있기
  때문이지 면이 바뀌기 때문이 아니다.
- **오류가 축이 아니다.** 이 컴포넌트에는 오류 prop 이 없다. 쿠폰 코드가 틀렸을 때 붉게
  변하는 것은 칸이 아니라 **형제로 놓인 `p role="alert"`** 이고, 그것은
  [Form Message](./form-message.md) 가 덮어야 할 자리다 — 다만 제품에 FormMessage 컴포넌트는
  아직 없고 그 `<p>` 는 인라인 마크업이다(Known deviations 11). 같은 판단이 LOUIS TextField
  에도 서 있다 — 오류를 테두리로 그리지 않고 메시지 + `aria-invalid` + `role="alert"` 로
  만든다.
- **Hover 가 없다.** 정본에 `:hover` 선언이 하나도 없다.
  [Carousel Arrow](./carousel-arrow.md) · [GNB Menu Item](./gnb-menu-item.md) 과 정반대다 —
  그 둘은 `State` 축에 Hover 가 있고 Focus 가 없다.
- **길이·묶음 크기가 축이 아니다.** `length` · `groupSize` 는 수 prop 이라 변형으로 열 수
  없다. Figma 는 12 · 4 한 벌만 그렸고, 그것이 지금 유일한 소비처의 값이다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| Default | 면 잉크 4%, 테두리 잉크 12%, 글자 잉크 88% |
| Focus | 테두리가 `primary-400` 72% 로, 면이 잉크 8% 로 바뀐다. **`outline` 은 꺼져 있다** |
| Disabled | 칸의 요소 불투명도 0.40. 색은 그대로다 |
| Hover | **없다.** 위 Variants |
| Error | **없다.** 형제 메시지가 진다 |

- **Focus 는 칸 하나의 상태인데 축은 묶음에 있다.** 제품에서 `:focus` 는 언제나 열두 칸 중
  하나에만 선다. Figma 의 `State=Focus` 변형이 몇 칸을 포커스로 그렸는지는 **되읽기로 확인할
  수 없다** — 파트별 fill 분해를 주지 않고 세 변형의 `boundFills` 가 26 으로 같다(Known
  deviations 4).
- **Disabled 가 구분자를 건드리지 않는다.** 불투명도 0.40 은 `input` 의 `:disabled` 에 걸려
  있고, 구분자는 `<span>` 이라 `disabled` 가 없다. 비활성 묶음에서 **하이픈만 원래 밝기(잉크
  28%)로 남는다.**
- 전환은 `border-color 120ms ease, background 120ms ease` 다. 기하는 움직이지 않는다.

## Interaction and responsive behavior

- **칸이 컨테이너에 맞춰 줄어든다.** `flex-1 min-w-0 max-w-14` 다 — 28 은 상한이지 고정값이
  아니다. 트랙은 `w-full` 이라 부모 폭을 그대로 받는다.
- **유일한 소비처에서 칸은 28 에 닿지 않는다.** 모달 카드가
  `min(360px, calc(100vw - 40px))` 에 안쪽 16 이라 트랙에 오는 폭이 328 이고, 구분자 둘과 간격
  열셋을 빼면 칸 하나가 약 23.17 이다. Figma 의 386 은 **상한을 고정하려고 고른 표본 폭**이고
  제품 화면에서 실제로 나타나는 폭이 아니다. (구분자 폭 12 를 그대로 놓고 계산한 값이다 —
  Known deviations 3.)
- 키 조작은 아래 Accessibility 에 모아 적는다.
- **붙여넣기는 어느 칸에서 해도 된다.** 붙여넣은 문자열이 전체 길이 이상이면 **처음부터**
  채우고, 짧으면 그 칸부터 채우되 **그 뒤에 있던 글자는 지운다** — 정본이
  `value.slice(0, start) + pasted` 를 커밋하고 꼬리를 다시 붙이지 않기 때문이다. 같은 자리에
  타이핑할 때는 꼬리가 남으므로 **두 경로의 거동이 다르다.** 어느 쪽이든 `normalize` 를 먼저
  통과하므로 하이픈과 공백이 섞인 `ABCD-EFGH-JKMN` 을 그대로 붙여도 들어간다.
- **한 칸에 여러 글자가 들어오는 경우를 감당한다.** 모바일 자동완성처럼 한 번에 여러 자가
  떨어지면 그 자리부터 이어 붙이고 **붙은 글자 수만큼 뒤로** 초점을 옮긴다(채워진 길이를 넘지
  않는다). 끝으로 가는 것은 붙여넣기 쪽이다.
- 칸에 초점이 서면 그 칸의 글자를 **선택**한다(`select()`). 채워진 칸을 눌러 바로 덮어쓸 수
  있다.
- **자동 제출이 없다.** `onComplete` 를 소비처가 넘기지 않고, 등록 버튼은 `value` 의 길이가
  `COUPON_CODE_LENGTH` 일 때 열린다.
- **첫 칸에 자동으로 초점이 서지 않는다.** 모달이 열려도 사용자가 직접 눌러야 한다.
- 자판은 `inputMode="text"` 다. 코드 알파벳이 Crockford Base32(숫자 + 글자)라 숫자 자판을
  띄우면 안 된다. `autoCapitalize="characters"` · `autoComplete="off"` · `spellCheck={false}`
  가 함께 붙는다.
- 모션 축소 계약이 필요 없다 — 움직이는 것이 색 둘(120ms)뿐이다.

## Content

- **이 컴포넌트에 보이는 문구는 하이픈 하나뿐이다.** 나머지는 사용자가 친 글자다. 제목 ·
  설명 · 버튼 · 오류는 전부 모달이 소유한다.
- **글자가 사용자가 친 것과 다를 수 있다.** 주입된 `normalize` 가 인쇄물에서 흔한 오독을
  교정한다 — `O` → `0`, `I` · `L` → `1`, 소문자는 대문자로. `O` 를 쳤는데 `0` 이 보이는 것이
  정상이고, **화면 어디에도 그 규칙을 설명하는 문구가 없다**(결손).
- 하이픈은 `aria-hidden` 이라 읽히지 않고, 붙여넣기에서도 `normalize` 가 지운다.
- 묶음 이름(`ariaLabel`)은 소비처가 넘긴다. 지금은 모달 제목을 그대로 쓴다.

| | KO | EN | JA |
| --- | --- | --- | --- |
| 묶음 이름 | `쿠폰 코드 등록` | `Redeem a coupon` | 오버라이드 없음 — EN 이 그대로 나온다 |
| 칸 이름 | `쿠폰 코드 등록 1번째 글자` | `Redeem a coupon 1번째 글자` | 같음 |
| 구분자 | `-` | `-` | `-` |

**칸 이름의 「번째 글자」가 i18n 밖에 있다.** 정본이 그 꼬리를 한국어 문자열로 박아 뒀다 —
로케일과 무관하게 한국어가 붙는다(Known deviations 6). JA 는 쿠폰 문구 전체에 오버라이드가
없어 영문이 나온다.

## Accessibility

- 묶음은 `role="group"` + `aria-label` 이다. 칸은 각각 네이티브 `<input>` 이고 자기
  `aria-label` 을 갖는다 — `<label>` 요소는 없다.
- **칸 열둘이 각각 탭 정지점이다.** 로빙 탭인덱스가 아니라서 Tab 으로 묶음을 지나려면 열두
  번 눌러야 한다. WAI-ARIA 의 composite widget 패턴을 쓰지 않는다 — **소유자 판정 필요**
  (Known deviations 5).
- 키 동작은 정본에 이만큼 있다. **읽어서 확인한 목록이고, 없는 것은 없다고 적는다.**

  | 키 | 동작 |
  | --- | --- |
  | 붙여넣기 | 기본 동작을 막고 직접 처리한다. 전체 길이 이상이면 첫 칸부터, 짧으면 그 칸부터 채우고 **뒤 칸은 비운다** |
  | Backspace | 기본 동작을 막는다. **빈 칸에서 누르면 앞 칸의 글자를 지우고 그리로 옮긴다** — 칸을 오가며 지우는 수고가 없다 |
  | ArrowLeft · ArrowRight | 앞뒤 칸으로 옮긴다. 범위를 벗어나면 양 끝에 머문다 |
  | Home · End · Delete · ArrowUp · ArrowDown | **없다**(결손) |

- **오류가 칸에 연결돼 있지 않다.** 형제 `p role="alert"` 는 뜰 때 한 번 읽히지만, 칸에
  `aria-invalid` 도 `aria-describedby` 도 없어 **다시 초점을 맞춰도 무엇이 틀렸는지 들리지
  않는다.** SC 3.3.1 을 여는 결손이다.
- **포커스 표시가 대비 요건을 넘지 못한다.** `outline` 을 끄고 1px 테두리 색만 바꾸는데,
  쿠폰 모달의 카드 면 위에서 이 문서가 sRGB 합성 후 상대휘도로 재면 이렇다.

  | | 칸 안쪽 대비 | 카드 대비 |
  | --- | --- | --- |
  | 다크 | **2.58:1** | 3.28:1 |
  | 라이트 | **1.65:1** | 1.97:1 |

  SC 1.4.11 은 포커스 표시에 인접색 대비 3:1 을 요구한다. 라이트에서는 어느 쪽으로 재도
  미달이고, `outline-none` 이라 물러설 기본 링도 없다. 색을 `color/stroke-focus` 로 바꿔
  불투명도를 1 로 올려도 라이트는 2.61:1 이라 여전히 미달이다 — **테두리 색만으로는 이 조형이
  요건을 넘지 못한다.** LOUIS TextField 가 색이 아니라 **박스 바깥의 2px `outline`** 을 쓰는
  이유가 이것이다(그때 인접색은 칸 안쪽이 아니라 카드가 된다).
- **타깃 크기가 간격 예외로만 성립한다.** 소비처에서 칸은 약 23.17 × 36 이라 SC 2.5.8
  (24 × 24)에 폭이 미달이고, 이웃 칸의 중심 간격 약 25.17 이 24 를 넘어 간격 예외로 통과한다 —
  여유가 1.2 남짓이다. 모달이 `calc(100vw - 40px)` 로 좁아지는 **뷰포트 386px 아래에서는 그
  예외도 깨진다.** 320px 기기가 그 범위 안이다.
- **비활성 대비는 면제 대상이 맞다.** 불투명도 0.40 에서 글자 대 면이 다크 2.74:1 ·
  라이트 2.36:1 인데, 칸이 네이티브 `disabled` 인 진짜 비활성 컨트롤이라 SC 1.4.3 의 면제가
  성립한다. (같은 값이라도 [GNB Menu Item](./gnb-menu-item.md) 의 `<span>` 은 **면제 성립
  여부가 열려 있다** — 요소가 컨트롤이 아니라 판정이 미정이다. 그 문서 Known deviations 5.)
- 글자 대비는 넉넉하다 — 잉크 88% 가 칸 면 위에서 다크 8.41:1 · 라이트 13.88:1 이다.
  구분자 잉크 28% 는 다크 2.33:1 · 라이트 1.98:1 이지만 `aria-hidden` 인 장식이다.
- **칸에 폭 하한이 없다**(`min-w-0`). 400% 확대나 아주 좁은 기기에서 칸이 글자보다 좁아질 수
  있고, 그 지점의 거동은 실측되지 않았다(결손).
- 모션 없음 — `prefers-reduced-motion` 계약이 필요 없다.
- 위 대비 값은 전부 **이 문서가 계산한 것**이다. 면은 모달 카드
  (`palette-gray-800` / 라이트 `palette-gray-100`), 잉크는 테마를 따라 뒤집히는 `gray-000` 을
  놓고 합성했다. 브라우저 실측이 아니다.

## Specification

| Part/state | 값 | 토큰·근거 |
| --- | --- | --- |
| 트랙 | 높이 36, 안쪽 여백 0, 간격 2 | `flex w-full items-center gap-1`(2px 그리드). **간격 2 에 대응하는 일반 토큰이 없다** — 값이 같은 `space-overlay-item-gap`([Menu Popover](./menu-popover.md)) · `space-progress-ring-gap`([Progress](./progress.md)) 은 다른 컴포넌트의 이름이다 |
| 트랙 폭 | 컨테이너를 채운다 | `w-full`. Figma 의 386 은 칸이 상한에 닿는 표본 폭이다 |
| 칸 | 최대 28 × 36, radius 8 | `flex-1 min-w-0 max-w-14 h-18 rounded-8`. **높이 36 에 대응 토큰이 없다** — `layout/control-height-md`(32) 와 `-lg`(40) 사이가 비어 있다 |
| 칸 테두리 | 1, 안쪽 | `border-width-default` · `1 \| INSIDE`. **헤어라인이 아니다** — 이 저장소의 기본 경계는 0.5 inset 그림자다(Known deviations 2) |
| 칸 면 | 잉크 4% | `color/gray/000-alpha/04` |
| 칸 테두리 색 | 잉크 12% | `color/gray/000-alpha/12` |
| 글자 | `body-md-medium` 16 / 150%(24) — 450 이하 14 / 21, 가운데, 대문자 | `typography/body-md-medium` · `type-body-16-medium` + `text-center uppercase` |
| 글자색 | 잉크 88% | `color/gray/000-alpha/88` |
| Focus 테두리 | `primary-400` 72% | Figma 는 `color/accent-primary` @72% 에 묶었다 — Known deviations 1 |
| Focus 면 | 잉크 8% | `color/gray/000-alpha/08` |
| Focus outline | **없다** | `outline-none`. 표시가 테두리 색 하나뿐이다 |
| Disabled | 요소 불투명도 0.40 | `[&:disabled]:opacity-40`. 칸에만 걸린다 — 구분자는 그대로다 |
| 구분자 | 12 × 24, 좌우 안쪽 2 | `shrink-0 px-1`. **폭 12 는 Figma 값**이고 제품에서는 하이픈 글자 폭이 정한다 |
| 구분자 색 | 잉크 28% | `color/gray/000-alpha/28`. `select-none` · `aria-hidden` |
| 전환 | `border-color 120ms ease, background 120ms ease` | 색만. 기하는 움직이지 않는다 |
| 칸 수 · 묶음 | 12 · 4 | 컴포넌트 값이 아니다 — `COUPON_CODE_LENGTH` · `COUPON_CODE_GROUP_SIZE` 가 소유한다 |

## Known deviations

1. **포커스 색이 셋 다 서로 다르다.** 제품은 `--primary-400`(`#38a4ff`) 72% 를 쓰고 그 값은
   **두 테마가 같다** — `globals.css` 의 `:root` 에서 한 번 정의되고 테마 블록이 덮지 않는다.
   LOUIS 의 `color/stroke-focus` 는 라이트 `#0088ff` · 다크 `#38a4ff` 로 **모드마다 갈리므로**
   거기 묶으면 제품에 없는 모드 분기가 Figma 에 생긴다. 그래서 모드 불변인
   `color/accent-primary` @72% 에 묶었는데, 그 토큰의 값은 `#0088ff` 라 **제품 색과 같지
   않다.** 값이 정확히 `#38a4ff` 이면서 모드 불변인 토큰은 `color/accent-primary-hover` 하나뿐이고
   이름이 hover 다 — **이 자리에 맞는 이름을 가진 토큰이 LOUIS 에 없다.** 바인딩 검사는
   「묶였는가」만 보므로 이 어긋남을 잡지 못한다. **소유자 판정 필요**: 제품을
   `stroke-focus` 로 옮겨 모드 분기를 받아들이는가, LOUIS 에 모드 불변 포커스 토큰을 세우는가.
   어느 쪽이든 Accessibility 의 대비 미달이 먼저 풀려야 한다 — 두 후보 다 라이트에서 3:1 을
   넘지 못한다.
2. **경계가 헤어라인이 아니라 진짜 1px 테두리다.** 이 저장소의 기본은 DS-D-0023 이후
   `inset 0 0 0 0.5px` 그림자이고 LOUIS TextField 도 그 방식이다. 이 컴포넌트만 실제 `border`
   를 쓰고, 그래서 되읽기에 `strokeWeight: 1` 과 `Cell 1: 1|INSIDE` 가 **있는 것이 정상이다.**
   **왜 border 1 인지는 어디에도 적혀 있지 않다** — 정본의 주석은 칸이 줄어드는 이유
   (좁은 모달에서 넘친다)만 갖고 있고, 제품 커밋 메시지에도 결정 기록에도 두께에 대한 언급이
   없다. **소유자 확인 필요.**
3. **구분자 폭의 정본이 두 곳에서 다르다.** Figma 는 12 로 고정했고 제품에서는 좌우 안쪽 2 에
   하이픈 글자 폭이 더해진 값이다 — 글꼴이 바뀌면 따라 움직인다. 되읽기에 sizing mode 가 없어
   Figma 의 12 가 FIXED 인지 HUG 인지도 알 수 없다. 이 문서의 「칸 약 23.17」 계산도 12 를
   그대로 놓은 것이라 **실측으로 바뀔 수 있다.**
4. **`State=Focus` 가 몇 칸을 포커스로 그렸는지 확인할 수 없다.** 제품에서 `:focus` 는 열두
   칸 중 하나에만 선다. 되읽기의 `boundFills` 78 은 변형당 26 으로 완전히 설명되지만
   (칸 12 + 글자 12 + 하이픈 2), **어느 칸이 어떤 색에 묶였는지는 담지 않는다.**
   `boundStrokes` 36 = 칸 12 × 3 변형, `textStyled` 42 = (글자 12 + 하이픈 2) × 3 도 같다.
   **소유자 확인 필요.**
5. **탭 정지점이 열둘이다.** 코드 한 개를 넣는 자리에 탭 정지점 열둘은 키보드 사용자에게
   묶음을 통과하기 어렵게 만든다. 로빙 탭인덱스(묶음 전체가 하나의 정지점이고 화살표로 칸을
   오가는 방식)로 바꾸는 것이 표준 패턴이지만, 붙여넣기·자동 이동 거동과 함께 다시 설계해야
   한다. **소유자 판정 필요.**
6. **칸 이름의 꼬리가 i18n 밖에 있다.** `aria-label` 이 `${ariaLabel} N번째 글자` 로 조립되고
   「번째 글자」가 한국어 리터럴이다. 영어·일본어 로케일에서 스크린리더가 두 언어를 섞어
   읽는다. 게이트가 잡지 못한다 — 이 저장소에는 제품의 하드코딩 문구를 보는 검사가 없다.
7. **기하는 일부만 대조된다.** `figma/components.measured.json` 의
   `segmented-code-input` 이 제품 칸 클래스(`BOX`)를 실브라우저에서 잰 칸 28 × 36 · 반경 8 ·
   글자 16 / 24 를 갖고, parity 게이트가 Figma 를 그것과 맞댄다. 28 은 트랙이 넉넉할 때의 값(상한)이고
   24 는 451 이상의 값이다. 코드가 그 실측을 여전히 만드는지는
   `segmented-code-input-geometry.browser.test.tsx` 가 LOUIS 레시피로 되잰다(2026-10-14). **간격 2 와 묶음 폭 386 은 대조하지 않는다** — 2 는 소비처 래퍼의 인라인 className
   (`gap-1`)이라 상수로 꺼낼 자리가 없고, 386 은 칸이 상한 28 에 닿는 폭에서 나온 산술이다.
8. **글자 굵기가 대조되지 않는다.** 되읽기의 `parts` 는 `fontSize` 와 높이만 담고 텍스트
   스타일 **이름**을 담지 않는다. `typography/body-md` 세 굵기가 모두 16 / 150% / −0.16 이라
   지금 게이트로는 regular · medium · semibold 를 가려낼 수 없다 —
   [GNB Menu Item](./gnb-menu-item.md) 과 같은 결손이다.
9. **스냅샷은 이 문서보다 뒤에 갱신됐다.** 문서를 쓸 때 `figma/snapshot.json` 에
   `SegmentedCodeInput` 이 없어 계약이 「component set 이 snapshot 에 없습니다」로 실패했다.
   되읽기를 병합하고 `node scripts/build-figma-snapshot.mjs` 를 다시 돌려 해소했다 — 스냅샷은
   손으로 쓰는 파일이 아니라 되읽기의 projection 이므로 **되읽기가 먼저 갱신돼야** 이 절차가
   성립한다.
10. **자동 테스트가 양쪽 다 없다.** LOUIS 에 acceptance test 가 0건이고, 제품에도 이
    컴포넌트를 겨냥한 테스트가 없다. 제품의 `coupon-service.test.ts` 는 `formatCouponCode` ·
    `normalizeCouponCode` 를 시험하지 이 입력창을 시험하지 않는다 — 붙여넣기와 Backspace 거동은
    아무도 자동으로 확인하지 않는다.
11. **오류를 지는 형제 `<p>` 가 FormMessage 가 아니다.** 제품에 FormMessage 컴포넌트는
    존재하지 않는다. 쿠폰 모달의 오류는 인라인 `<p role="alert">` 에
    `type-caption-12-regular` + `accent-red-400` 88% 이고, [Form Message](./form-message.md) 가
    정본으로 지목하는 로그인 화면(`app/login/page.tsx` 의 `ERROR_TEXT`)은
    `type-caption-12-regular` + `accent-red-500` 에 좌여백 2 이며 `role` 이 없다 — 색 단계도
    여백도 `role` 도 다르다. form-message.md 는 Specification 이 없는 스텁이라 **어느 쪽이
    정본인지 판정할 근거 자체가 없다.** **소유자 판정 필요.**

## Acceptance tests

1. 칸 높이가 36 이고 radius 8 이다. 칸 폭은 트랙을 칸 수로 나눈 몫(`flex-1`)과 상한 28(`max-w-14`) 중
   작은 쪽이다 — 트랙이 넉넉하면 28 이다(`segmented-code-input.sizes.<State>.cellWidth`).
2. 트랙 높이가 36, 항목 간격이 2, 안쪽 여백이 0 이며 `layoutMode` 가 `HORIZONTAL` 이다.
3. 프레임 폭 386 이 칸 상한과 맞아떨어진다 — 12 × 28 + 2 × 12 + 13 × 2 = 386.
4. 칸에 stroke 가 있고 `1 | INSIDE` 다. **헤어라인 effect 가 아니다** — 되읽기의 `effects` 가
   비어 있다.
5. 구분자가 2개다 — 네 칸마다 하나이고 **마지막 칸 뒤에는 없다.**
6. 451 이상에서 글자와 하이픈의 크기가 16 이고 글자 높이가 24 다(`segmented-code-input.sizes.<State>.charHeight`).
   450 이하에서는 14 / 21 로 내려간다. **굵기(medium)는 확인되지 않는다**
   (Known deviations 8).
7. 세 변형의 기하가 모두 같다 — 되읽기의 각 기하 값이 단일값이다(28 · 36 · 8 · 386 · 2).
8. Figma 되읽기에서 raw fill · raw stroke · 스타일 없는 텍스트가 각각 0 이고, set 에 설명이
   있다.
9. `boundFills` 78 · `boundStrokes` 36 · `textStyled` 42 가 각각 26 · 12 · 14 의 3배로 남김
   없이 설명된다.
10. 제품에서 칸 클래스의 상태 선택자가 `:focus` 와 `:disabled` **둘뿐**이다 — 채워짐 규칙도
    오류 규칙도 `:hover` 도 없다.
11. 제품에서 빈 칸에 Backspace 를 누르면 앞 칸의 글자가 지워지고 초점이 그리로 옮겨 간다.
12. 제품에서 마지막 칸에 `ABCD-EFGH-JKMN` 을 붙여넣으면 첫 칸부터 열두 칸이 채워진다.
13. 제품에서 비활성일 때 칸만 흐려지고 구분자는 밝기가 그대로다.

## Migration and changelog

새로 선 컴포넌트다. 이전 API 가 없다. LOUIS recipe(`segmented-code-input.css`)가 섰으므로 이 문서의 Specification 이 그 값의
정본이 된다. 사용자 영향 변경은 [Updates](../updates/README.md) 에 적는다.
