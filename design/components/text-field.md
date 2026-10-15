---
id: input
status: experimental
authority: normative
summary: 한 줄 텍스트를 입력받습니다.
---

# Text Field

한 줄 텍스트를 입력받는다. 여러 줄 판(`data-multiline="true"`)은 본문에 첨부 썸네일 줄과 툴바가 붙는 입력이다(아래 「여러 줄 판」).

**제품에 공용 구현이 없다.** 텍스트 입력 정의가 약 40벌이고 다섯 계열로 갈리며 계열 사이에 합의가
없다 — 인증 floating-label 9벌, 테두리 박스 5벌, 테두리 없는 채운 면 9벌, 투명 인라인 rename 8벌,
캔버스 프롬프트 5벌. 그래서 이 컴포넌트의 값은 제품 정본을 옮긴 것이 **아니라 DS가 정한
것**이고, 어디서 갈라지는지는 [`product.measured.json`](../../migration/product.measured.json)이
사유와 함께 갖는다.

## Availability

| Surface       | 상태           | 근거                                                        |
| ------------- | -------------- | ------------------------------------------------------------ |
| Web           | `partial`      | public export와 실브라우저 acceptance test 8건; visual regression과 제품 소비 증거 없음 |
| Figma         | `done`      | component set(Size·State·LabelBehavior·Join, 22 variant — 2026-10-06 Focus 일곱을 걷었다, DS-D-0074). 계약이 모든 property 를 pin 하고 Box·Label·Value·Message 를 자손으로 대조한다. 기하는 양방향이다 — `text-field.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                      |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                   |

## When to use

- 자유 형식의 짧은 텍스트를 한 줄로 받을 때 — 이름, 이메일, 검색어, URL.
- `size="sm"`(24)은 **편집 표면의 도구 줄에서만** 쓴다 — 캔버스·타임라인·에셋 패널처럼 한 줄에
  컨트롤이 여럿 서고 화면의 주인공이 필드가 아니라 편집 대상인 자리
  ([DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)).

쓰지 않는 자리.

- 첨부도 툴바도 없는 맨 여러 줄 입력. 여러 줄 판은 **첨부 · 툴바가 붙는 본문**(문의 본문)의 계약이고, 맨 Textarea 의
  정본은 아직 없다(Known deviations).
- 정해진 목록에서 고르는 것. 그것은 Select다.
- 체크박스·라디오·파일. 각자 다른 컴포넌트다.
- **폼·대화상자·본문 흐름의 `sm`.** 그 자리에서 24는 누르기 어렵고 `md`가 이미 맞다. 도구 줄이
  24를 감당하는 것은 사용자가 그 줄을 **보면서** 쓰기 때문이지 24가 일반적으로 충분해서가 아니다.

## API

```tsx
<TextField
  label="프로젝트 이름"
  placeholder="예: 여름 여행"
  description="공백 없이 입력합니다"
  suffix={<IconButton size="sm" label="지우기" onClick={clear}><IconX /></IconButton>}
/>

<TextField label="이름" invalid description="이미 쓰는 이름입니다" />
```

## Anatomy

1. **Stack** — 라벨·박스·메시지를 세로로 담는다.
2. **Label** — 시각 라벨. `htmlFor`로 입력에 연결된다. **`labelBehavior="floating"`에서는 이
   노드가 Stack이 아니라 Box 안으로, 그리고 Control 뒤로 옮겨 간다** — 떠오름 규칙이
   `input ~ label`이고 `~`는 앞선 형제를 보지 못한다. 시각 위치는 절대배치가 정하므로 순서가
   화면을 바꾸지 않고, `htmlFor` 연결도 순서와 무관하다.
3. **Box** — **시각적 필드.** 높이·여백·헤어라인(inset)·반경·배경을 소유하고 강제 색의 포커스 링을 받는다.
4. **Prefix / Suffix** — 박스 안의 슬롯. 아이콘과 버튼이 들어간다.
5. **Control** — 실제 `<input>`. 박스가 시각을 소유하므로 여기는 비어 있다.
6. **Message** — 도움말 또는 오류. 한 자리를 나눠 쓴다.
7. **Attachments** — 여러 줄 판에서만. Box 안 Control 아래의 첨부 썸네일 줄(`__attachments`). [Media Slot](media-slot.md) 줄
   (`.louis-media-slot-strip[data-layout="wrap"]`)을 같은 요소에 얹고 칸은 `attachment` 72 다.
8. **Toolbar** — 여러 줄 판에서만. Box 맨 아래 줄(`__toolbar`) — 첨부 버튼과 **Counter**(`__counter`, 첨부 개수 `n / 5`)가 양 끝에 선다.

**시각적 필드가 `<input>`이 아닌 이유.** 접두 아이콘과 접미 버튼을 필드 *안에* 두려면 `<input>`
하나로는 안 된다. 제품의 가장 큰 계열(인증 9벌)도 같은 구조를 쓴다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `label` | ReactNode | 없음 | 시각 라벨. 없으면 `aria-label`이 필수다 |
| `size` | `lg` \| `md` \| `sm` | `lg` | 시각 크기. `lg`·`md`는 글자 크기가 같고 `sm`만 내려간다 |
| `labelBehavior` | `stacked` \| `floating` | `stacked` | 라벨이 어디 사는가. `floating`은 `lg`에서만 그려진다 ([DS-D-0049](../governance/decisions/DS-D-0049-label-placement-is-an-axis.md)) |
| `join` | `none` \| `start` \| `middle` \| `end` | `none` | 위/아래 이웃과 이어 붙는 자리 ([DS-D-0052](../governance/decisions/DS-D-0052-joined-fields-are-an-axis.md)) |
| `description` | ReactNode | 없음 | 필드 아래 한 줄. `invalid`면 오류 문구가 된다 |
| `invalid` | boolean | `false` | 오류 상태 |
| `prefix` / `suffix` | ReactNode | 없음 | 박스 안의 슬롯 |
| `type` | `text` \| `email` \| `password` \| `search` \| `tel` \| `url` | `text` | 텍스트 입력만 다룬다 |

나머지는 `<input>`의 네이티브 속성을 그대로 받는다.

**여러 줄 판은 CSS 레시피에만 있다** — React prop 이 없다. 소비처가 클래스와 data 속성을 붙인다.

| data 속성 | 값 | 붙는 곳 | 뜻 |
| --- | --- | --- | --- |
| `data-multiline` | `true` | 뿌리 | 여러 줄 판 — 본문(textarea) · 첨부 줄 · 툴바가 상자 안에서 위에서 아래로 선다 |
| `data-drag-over` | `true` \| `false` | `__box` | 파일을 끌어 상자 위에 올린 동안 `true`. 놓기는 상자 전체가 받는다 |

## Hierarchy와 variants

**강조 축이 없다.** 필드는 강조 단계를 갖지 않는다 — 한 폼 안에서 어떤 필드가 다른 필드보다
"주요"하다는 표현은 시각이 아니라 순서와 라벨이 맡는다.

**크기 말고 있는 축은 셋이다 — `LabelBehavior` · `Join` · `Layout`(여러 줄 판).** 셋째는 아래 「여러 줄 판」이 갖는다.

첫째는 `LabelBehavior`([DS-D-0049](../governance/decisions/DS-D-0049-label-placement-is-an-axis.md)).
`stacked`(기본)에서 라벨은 박스 위의 형제이고 움직이지 않는다 — 제품의 `/admin` 여덟 화면이 이
형태다. `floating`에서 라벨은 박스 안에서 placeholder 노릇을 하다가 값이 들어오거나 포커스가
오면 떠오른다 — 제품의 인증 일곱 벌이 이 형태다.

**「떠 있는가 앉아 있는가」는 축이 아니라 상태다.** 그것을 정하는 것은 값의 유무와 포커스이고
CSS가 판정한다(`:not(:placeholder-shown)` · `:focus`). Figma에서는 `State`가 그 자리를 갖는다 —
`Placeholder`가 쉼이고 나머지 넷이 떠오른 상태다.

둘째는 `Join` 이다([DS-D-0052](../governance/decisions/DS-D-0052-joined-fields-are-an-axis.md)).
`none`(기본)에서 필드는 홀로 서고, `start`·`middle`·`end`에서는 위/아래 이웃과 **한 덩어리로**
읽힌다 — 제품의 인증 다섯 화면이 상자 둘을 그렇게 이어 붙인다. 이 축이 바꾸는 것은 **맞닿는
변 하나**다: 그쪽 곡률이 펴지고, 이음매가 두 겹으로 그려지지 않게 1px 겹치며, 강제 색의 포커스
링이 이웃에 가려지지 않도록 상자 안으로 들어간다. 높이·여백·면·헤어라인·타이포는 하나도 다시 쓰지
않는다.

**`Join` 은 `lg/floating` 에만 계약이 있다.** CSS 는 세 칸 어디에도 쓸 수 있지만 계약과 Figma 는
`lg/floating` 만 갖는다 — 제품이 이어 붙이는 자리가 인증 화면뿐이고, 그것이 `lg` 의 floating
필드이기 때문이다. `md`·`sm` 이나 `stacked` 의 결합은 잰 자리가 없다. 특히 `stacked` 에서는
칸마다 박스 위에 라벨이 서므로 「이어 붙는다」는 말 자체가 성립하지 않는다.

**`floating`은 `lg`에만 있다.** [DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)이
`lg`의 쓰임을 「화면의 주인공이 되는 제출 CTA — 로그인·회원가입」으로 못 박았고 플로팅 라벨이
사는 곳이 바로 그 화면이다. md·sm 플로팅은 제품에 잰 자리가 없다 — 그리면 값을 지어내는 일이
된다. 그래서 변형은 전수 30이 아니라 20이다.

## 여러 줄 판 — `data-multiline="true"`

본문(textarea)에 첨부 썸네일 줄과 툴바가 붙는 입력이다(문의 본문, `app/inquiry/InquiryClient.tsx@54b62a8a:183-198 · :625-720`).
상자는 한 줄 판과 같은 면 · 반경 · 헤어라인이고, 안에서 위에서 아래로 본문 → 첨부 줄 → 툴바가 선다. 파일을 끌어다 놓으면
**상자 전체**가 받는다.

**Drop Zone 의 변형이 아니다.** [Drop Zone](drop-zone.md) 은 페이지 면 위의 큰 눌림 면이고, 이 입력은 라벨 · 오류 · 헤어라인을 가진
TextField 상자 안에 본문 · 첨부 · 툴바가 든 것이다. Drop Zone 으로 세우면 그것들을 다시 그려야 한다. 그래서 TextField 의 판으로 세우고
드래그 표현만 Drop Zone 의 말(안쪽 링)을 빌린다.

```html
<div class="louis-text-field" data-multiline="true">
  <label class="louis-text-field__label" for="body">내용</label>
  <div class="louis-text-field__box" data-drag-over="false">
    <textarea id="body" class="louis-text-field__control" rows="8"></textarea>
    <div class="louis-text-field__attachments louis-media-slot-strip" data-layout="wrap">
      <div class="louis-media-slot" data-size="attachment">
        <img class="louis-media-slot__media" src="…" alt="screenshot.png">
        <button type="button" class="louis-media-slot__remove" aria-label="첨부 지우기: screenshot.png">…x…</button>
      </div>
    </div>
    <div class="louis-text-field__toolbar">
      <button type="button" class="louis-node-chip">…그림 첨부…</button>
      <span class="louis-text-field__counter" aria-live="polite">1 / 5</span>
    </div>
  </div>
</div>
```

| 부분 | 값 |
| --- | --- |
| 상자 | 세로 · 여백 0(여백은 칸마다 갖는다 — 툴바의 위 선이 상자 가장자리까지 닿아야 한다) |
| 본문 | 최소 200 · 사방 16(`space-control-lg`) · 세로 늘림 |
| 첨부 줄 | 간격 12 · 좌우 16 · 아래 12 · 칸 [Media Slot](media-slot.md) `attachment` 72 |
| 툴바 | 사방 12 · 사이 8 · 위 헤어라인(`--louis-hairline-inset-block-start`) · 개수 caption `fg-secondary` 고정폭 숫자 |
| 끄는 중 | `data-drag-over="true"` — 안쪽 2px(`border-width-ring`) `stroke-focus` 링이 헤어라인을 대신한다 |

첨부 버튼은 이미 LOUIS 부품인 [Node Chip](node-chip.md) 이다. 개수는 `aria-live="polite"` 로 바뀔 때 읽힌다. 첨부 지우기 버튼의
`aria-label` 에 무엇을 지우는지 적는다. 끄는 중 링과 invalid 링이 겹치면 끄는 중이 이긴다 — 놓는 동안에는 「여기에 놓인다」가
먼저 읽혀야 한다.

## States

| state | 표현 |
| --- | --- |
| Default | generic 헤어라인(inset, `color-stroke-hairline`) |
| Hover | **바뀌지 않는다** |
| Focus | **그리지 않는다**(DS-D-0074). 강제 색에서만 박스가 `:focus-within`으로 `Highlight` 링을 받는다 |
| Invalid | 상자에 **ring 두께(2px)의 `fg-danger-on-surface` 링**이 헤어라인을 대신한다([DS-D-0075](../governance/decisions/DS-D-0075-text-field-invalid-ring.md), 2026-10-07). 오류 문구 + `aria-invalid` + `role="alert"` 도 함께 간다. `data-invalid` 는 있으면 오류이고 `"false"` 만 예외다 |
| Disabled | generic 헤어라인 유지, 전경 `color-fg-disabled`이 상태를 전달한다 |
| DragOver | 여러 줄 판에서만. `__box[data-drag-over="true"]` — 안쪽 2px `stroke-focus` 링이 헤어라인을 대신한다([Drop Zone](drop-zone.md) 과 같은 말). Invalid 와 겹치면 이것이 이긴다 |

**결합한 필드의 Focus 는 링의 «자리»가 다르다.** 링은 밖이 아니라 상자 **안**에 선다 —
맞닿는 변의 바깥은 이웃의 자리이고, 이웃이 DOM 에서 뒤에 와 나중에 칠해지므로 바깥 링은
그쪽에서 통째로 덮인다. 두께·색·모양은 그대로다. 사유와 실측은 아래 「결합의 값은 어디서
왔나」에 있다.

**hover에서 아무것도 바꾸지 않는다.** 필드의 어포던스는 보이는 테두리와 텍스트 커서가 맡는다.
제품의 필드들도 대부분 hover 상태를 갖지 않는다.

**Focus는 states 표에 없다.** 포커스 링은 그리지 않는다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)).
강제 색의 링은 outline이라 면·전경·테두리 세 값으로 표현되지 않는다 — 브라우저 테스트가 따로 대조한다.

## Interaction and responsive behavior

- 박스 어디를 눌러도 텍스트 커서가 나온다(`cursor: text`). 슬롯 안의 버튼은 자기 커서를 갖는다.
- 높이는 `min-block-size`다. 200% 확대나 긴 값에서 잘리는 대신 자란다.
- 폭은 호출부가 정한다. 필드가 스스로 폭을 갖지 않는 이유는 폼의 격자가 그것을 소유하기 때문이다.
  `sm`도 마찬가지다 — 최소 폭 계약을 열지 않았다.
- `sm`은 값이 12로 내려가므로 같은 값이 `md`보다 좁게 그려진다. 도구 줄에서 필드 폭을 고정할 때
  `md`에서 잰 폭을 그대로 쓰면 남는다.

## Content

- **Label**은 무엇을 넣는지를 말한다. "이름"이지 "이름을 입력하세요"가 아니다.
- **Placeholder**는 예시다. 라벨을 대신하지 않는다 — 입력을 시작하면 사라지기 때문이다.
- **Description**은 제약이나 형식을 말한다. `invalid`일 때는 **무엇이 틀렸고 어떻게 고치는지**를
  말한다. "잘못된 입력"이 아니라 "이미 쓰는 이름입니다".
- 도움말과 오류가 같은 자리를 쓴다. 둘이 동시에 뜨면 어느 것을 읽어야 하는지 모른다.

## Accessibility

- **라벨이 필수다.** 시각 라벨이 없으면 `aria-label`을 준다. 제품의 대부분의 필드는 시각 라벨이
  없고 placeholder가 그 역할을 대신하는데, 그 구조는 옮기지 않았다.
- id는 컴포넌트가 인스턴스마다 발급한다. 호출부가 만들면 같은 화면에 필드가 여럿일 때 겹친다.
- **오류를 색만으로 알리지 않는다.** `aria-invalid`와 `aria-describedby`로 연결된 문구가 함께 뜨고,
  그 문구는 `role="alert"`이라 뜨는 즉시 읽힌다. 도움말은 alert가 아니다 — 화면을 여는 것만으로
  스크린 리더가 시끄러워지면 안 된다.
- 포커스 링은 그리지 않는다(DS-D-0074). 강제 색의 링은 박스가 받는다 — `<input>`에 걸면 링이 글자 주위에만 뜨고 슬롯이 밖에 남는다.
- **`sm`(24)은 44px 최소 타겟에 미달하며, 이 컴포넌트는 그것을 메울 수 없다.** `Button`·
  `IconButton`은 `.louis-hit-target`이 시각 크기를 그대로 두고 타깃만 넓히는데, 그 유틸은
  `::after` 절대배치 오버레이라 필드 위를 덮어 캐럿 배치와 드래그 선택을 가로챈다. 그래서 이
  컴포넌트는 세 칸 어디에도 그 유틸을 쓰지 않는다. WCAG 2.2 AA의 24×24는 만족하고 44px(AAA)는
  만족하지 않는다 — **알려진 편차이며 해결이 아니다.** DS-D-0032가 「`sm`은 `.louis-hit-target`을
  반드시 함께 붙인다」고 적은 계약을 이 컴포넌트만 지키지 못한다.
- placeholder는 `color-fg-secondary`다. `foreground-tertiary`는 light에서 배경 대비
  **3.96:1**로 4.5:1에 미달한다.

## Specification

| 축 | lg | md | sm | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 높이 | 40px | 32px | 24px | `layout-control-height-lg` / `-md` / `-sm` |
| 좌우 여백 | 16px | 12px | 8px | `space-control-lg` / `-md` / `-sm` |
| 슬롯 간격 | 8px | 8px | 8px | `space-control-sm` |
| stack 간격 | 4px | 4px | 4px | `space-control-xs` |
| 반경 | 12px | 12px | 8px | `radius-control` / `radius-control-sm` |
| 헤어라인 (inset) | 0.5px | 0.5px | 0.5px | `border-width-hairline` + `color-stroke-hairline` |
| 값 타이포 | 14/1.5 | 14/1.5 | 12/1.5 | `typography-body-sm-regular` / `typography-caption-regular` |
| 라벨 타이포 | 14/1.5 | 14/1.5 | 14/1.5 | `typography-body-sm-medium` |
| 메시지 타이포 | 12 | 12 | 12 | `typography-caption-regular` |

기하가 Button과 같은 계단인 이유는 하나다 — 같은 화면에 나란히 서는 컨트롤이 서로 다른 높이를
갖지 않게 하려는 것이다. 제품은 30·34·44·48px이 섞여 있다.

### `floating`의 값은 어디서 왔나

**여기서는 제품이 정본이다** — 이 컴포넌트의 다른 값과 반대다. 앵커 `ae8fd627`에서 일곱 벌을
쟀고 **기하가 일곱 벌 모두 글자 그대로 같았다.** 다섯 계열이 합의하지 못한 컴포넌트에서 한
계열이 스스로 합의한 유일한 자리다.

| 축 | `lg/floating` | 어디서 | 제품 일곱 벌 |
| --- | ---: | --- | --- |
| 높이 | 53px | **선언하지 않는다** — 아래 합 | 58 (값 타이포가 body-16이라 행이 24) |
| 위·아래 여백 | 12px | `space-control-md` | 12 (`py-6`) |
| 라벨 행 | 8px | `space-control-sm`, control의 `margin-block-start` | 8 (`mt-4`) |
| 값 행 | 21px | body-sm 행 높이 | 24 (body-16) |
| 좌우 여백 | 16px | `space-control-lg` — `lg/stacked`와 같다 | 16 (`px-8`) |
| 반경 | 12px | `radius-control` — `lg/stacked`와 같다 | 12 |
| 라벨 좌측 | 16px | `space-control-lg` — 박스 좌우 여백과 같다 | 16 (`left-8`) |
| 쉬는 라벨 | 세로 중앙 · 14/1.5 | `typography-body-sm-medium` | 세로 중앙 · 16/1.5 |
| 떠오른 라벨 | `top: 8` · 12/1.5 | `space-control-sm` + `typography-caption-*` | `top: 12` · 12/**1** |

**높이는 네 항의 합이다** — 12 + 8 + 21 + 12 = 53. CSS는 높이를 쓰지 않고 여백과 값이 만든다.
`min-block-size`(`layout-control-height-lg` 40)는 그대로 물려받지만 53이 이미 넘어 바닥으로만
남는다. 제품의 58과의 5px 차이는 **값 타이포**에서 나오며 이 축이 만든 어긋남이 아니다.

**떠오른 라벨의 시작점만 제품과 다르다 — 옮긴 것은 자리가 아니라 글자의 자리다.** 제품은
`line-height: 1` + `top: 12`로 글자를 12..24에 앉힌다. 여기서는 행간을 리터럴 1로 덮을 수 없다:
Figma text style은 all-or-nothing이라 행간 하나만 덮어도 style 연결이 끊기고, 그 자리를 메우는
`textStyleExempt`는 **변형마다 하나씩**을 세므로 스무 변형 중 다섯만 면제할 방법이 없다. 그래서
caption의 행간 토큰(1.5 → 18px)을 그대로 쓰고 시작점을 8로 당겨 글자를 같은 자리에 놓는다 —
`8 + (18−12)/2 = 11`부터 23까지이고 제품의 12..24와 1px 안이다. 값의 글자는
`20 + (21−14)/2 = 23.5`부터라 닿지 않는다. 두 값 다 토큰이고 리터럴이 남지 않는다.

**슬롯은 라벨 행이 아니라 값 행에 선다**(`align-items: flex-end`). 위쪽 8은 라벨의 자리이므로
가운데 정렬이면 control의 `margin-block-start`가 중앙 계산에 먹혀 그 행이 사라진다.

**색은 포커스만 따른다 — 떠오름과 다른 조건이다.** 값이 들어와 라벨이 떠 있어도 포커스가 없으면
`color-fg-secondary`로 남고, 포커스에서만 `color-fg-primary`가 된다. 제품 일곱 벌이 전부 두
조건을 갈라 두었다(`focused || value`가 자리를, `focused`가 색을 정한다).

**`floating`의 라벨은 label이 아니라 placeholder의 색 역할을 받는다.** `stacked`의 라벨은
`color-fg-primary`인데 여기서는 `color-fg-secondary`다 — 쉴 때 그 자리가 placeholder의 자리이기
때문이다. placeholder 자신은 투명이다(라벨이 그 일을 한다).

### 결합의 값은 어디서 왔나

**여기서도 제품이 정본이다.** 인증 다섯 화면이 상자 둘을 위/아래로 이어 붙인다 —
`/login` · `/signup` · `/recover` · `/reset-password/new` · `/aws/signup`. 셋은 상수 문자열까지
같다(`rounded-t-12 mb-[-1px]` / `rounded-b-12`). 나머지 둘은 같은 값을 임의 프로퍼티로 적었다
(`[border-radius:12px_12px_0_0]`). 여섯 번째 인증 화면 `/reset-password` 는 필드가 하나뿐이라
결합하지 않는다 — 표면 원장의 다섯 중 하나가 이 축을 **쓰지 않는다**는 사실을 여기 적어 둔다.

| 축 | `start` | `middle` | `end` | 어디서 |
| --- | ---: | ---: | ---: | --- |
| 위 반경 | 12 | 0 | 0 | `radius-control` — 제품의 `rounded-t-12` |
| 아래 반경 | 0 | 0 | 12 | `radius-control` — 제품의 `rounded-b-12` |
| 겹침 | −1 | −1 | 0 | 아래 「겹침은 0.5가 아니라 1이다」 |
| 포커스 링 offset(강제 색) | −3 | −3 | −3 | 겹침 1 + `border-width-ring` 2 |

**`middle` 은 제품에 없다 — 그러나 지어낸 값도 없다.** 인증 다섯은 전부 상자 둘이라 가운데 칸이
생기지 않는다. 이 칸의 네 값은 첫 칸과 끝 칸에서 **자유도 없이** 따라 나온다: 맞닿는 변의
곡률은 0 이고(둘 다 그렇다), 겹침은 아래 칸이 있으므로 첫 칸과 같으며, 링의 자리는 무리 안에서
칸마다 달라지면 안 된다. `md`·`sm` 의 floating 을 열지 않은 판정([DS-D-0049](../governance/decisions/DS-D-0049-label-placement-is-an-axis.md))과
다른 이유가 그것이다 — 거기서는 여백·타이포에 **정할 것이 남아 있었고** 여기서는 남지 않는다.

#### 겹침은 0.5가 아니라 1이다

토큰 `border-width-hairline` 은 0.5px 인데 겹침은 1px 이다. 두 값이 다른 이유는 **그려지는
두께가 1px 이기 때문**이다 — 브라우저가 inset 그림자의 사용값을 1px 로 올리고, 그 사실은
`--louis-hairline-inset` 의 머리말이 이미 적고 있다. 겹침은 선언된 두께가 아니라 그려지는
두께와 같아야 위 상자의 아래 헤어라인이 아래 상자의 면에 온전히 덮인다.

Chromium 실측(DPR 1·2·3, 라이트, 이 컴포넌트의 면·헤어라인 그대로):

| 겹침 | 이음매 | 판정 |
| ---: | --- | --- |
| 0 | 홀로 선 모서리의 **두 배** | 두 헤어라인이 나란히 선다 |
| 0.5px | 0 과 **픽셀이 같다** | 토큰 값을 그대로 쓰면 아무 일도 일어나지 않는다 |
| 1px | 홀로 선 모서리와 **같다** | 채택 |

제품이 `mb-[-1px]` 로 같은 숫자를 쓰는 것은 우연이 아니다 — 제품의 경계는 1px `border` 라
두께가 처음부터 1 이었다.

#### 포커스 링이 안으로 들어간 이유

평상 렌더링에는 포커스 링이 없다(DS-D-0074). 아래는 강제 색에서 서는 링의 자리다.

이웃은 DOM 에서 뒤에 오므로 나중에 칠해진다. 밖으로 서는 링(`outline-offset: 2`)은 맞닿는
변에서 이웃의 면에 덮인다 — 실측으로 **위 상자의 아래쪽 링이 0px 남는다.** 반대로 아래 상자의
위쪽 링은 온전히 남는다. 같은 축의 두 칸이 서로 다르게 보이는 상태다.

제품은 포커스에서 `z-index` 를 1 → 2 로 올려 이것을 피한다. **이 저장소는 그 길을 쓸 수 없다** —
숫자 `z-index` 는 저작 게이트가 금지하고(`build-css.mjs`), [Elevation & Layer](../foundations/elevation-layer.md)
의 사다리에는 로컬 stacking 칸이 없다. 이름 없는 숫자를 하나 들이는 대신 링을 **안으로** 넣으면
다툼 자체가 사라진다.

값은 겹침(1) + 링 두께(`border-width-ring` 2) = 3 이다. 실측으로 −3 에서 위·아래 상자 모두 2px 이
전부 남고, −2 에서는 1px 만 남는다. Figma 는 이것을 Box 를 각 변 1px 씩 줄인 사각형 +
`INSIDE` 2px stroke 으로 그린다.

### `sm`의 값은 어디서 왔나

세 칸 중 `sm`만 **높이 말고도 갈리는 축이 둘 있다.** 어느 값이 실측이고 어느 값이 비례인지
축마다 적는다 — 둘 다 아닌 값은 정하지 않았다.

| 축 | 값 | 근거 |
| --- | ---: | --- |
| 높이 | 24 | [DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)가 정했다 |
| 좌우 여백 | 8 | **둘 다.** 사다리 비례(16 → 12 → 8)이자 디자인 실측이다 — 글자를 담은 24 자리 넷이 전부 좌우 8이었다 |
| 슬롯 간격 · stack 간격 | 8 · 4 | 비례. `lg`·`md`가 같으므로 `sm`도 같다. 인접 슬롯을 가진 실측 자리도 8이다 |
| 반경 | 8 | **실측.** 비례로는 12인데 24 높이에서 12는 높이의 절반이라 필드가 알약이 된다 |
| 값 타이포 | 12/1.5 | **실측.** 비례로는 14인데 잰 24 높이 컨트롤이 전부 12/150%였다 |
| 라벨 타이포 | 14/1.5 | 비례. 라벨은 박스 밖이라 24에 걸리지 않고, 24 위에 선 시각 라벨을 재지 못했다 |
| 최소 폭 · 아이콘 슬롯 | — | **열지 않는다.** 이 컴포넌트는 어느 칸에서도 두 계약을 갖지 않는다 |

실측한 자리는 Figma `OlYKERKOkgbxBEEoXGZW2c` page 14의 프레임 `1087:2383`(비디오 에디터)이고,
노드 번호는 [`components.measured.json`](../../figma/components.measured.json)의 `input.sizes.sm`이
갖는다. **그 화면에 TextField로 확정된 24 높이 자리는 없다** — 가장 가까운 것이 인스펙터
불투명도의 40×24 값 박스이고, DS-D-0032가 센 여섯 자리(가져오기 · 필터 탭 · 줌 칩 · 레인 토글)에
그것은 들어 있지 않다. 그래서 이 표의 실측 둘은 **그 여섯 자리와 그 값 박스가 공통으로 쓰는
값**이지, 이 컴포넌트가 그 화면에서 실제로 서는 자리를 잰 것이 아니다.

실제로 잰 것은 넷이다 — 가져오기 버튼 · 필터 탭 하나 · 줌 칩 · 값 박스. 여섯 중 나머지 둘은
아이콘만 든 정사각(레인 토글 24×24, 좌우 여백 0)이라 여백·타이포 판정에 쓸 수 없다.

반경만 그 넷이 갈린다. 앞의 셋은 8이고 값 박스만 6이다. **8을 골랐다** — 6에는 semantic
이름이 없고(원시 `radius-6`뿐이다), 같은 줄에 나란히 서는 형제 컨트롤들과 갈리며, `IconButton`도
`sm`에서 `radius-control-sm`을 고른다. 한 컴포넌트만 6으로 두면 도구 줄에서 필드의 모서리만
다른 곡률이 된다.

**`radius-control-sm`이라는 이름은 지금 두 뜻을 갖는다.** 이 토큰이 생긴 이유는 SegmentedControl의
중첩 반경(바깥 12에서 패딩 4를 뺀 8)이었고 크기 사다리와 무관했다. 오늘부터 `IconButton`과 이
컴포넌트가 그것을 「`sm` 칸의 컨트롤 반경」으로 읽는다. 값이 같아 지금은 부딪히지 않지만 두 뜻
중 하나가 움직이면 갈린다 — DS-D-0032가 SegmentedControl의 `xs`(28)를 두고 적은 것과 같은
형태의 미결이며, 이 문서는 그 사실만 적고 열지 않는다.

## Effects

없다. 그림자도 흐림도 쓰지 않는다.

## Implementation

- `caret-color`를 **선언하지 않는다.** 브라우저 기본이 `currentColor`이고 값 텍스트가
  `foreground-primary`이므로 자동으로 따라간다. 전용 토큰을 만들면 값과 캐럿이 따로 놀 수 있다.
- placeholder에 `opacity: 1`을 명시한다. Firefox가 기본으로 낮추는데, 대비를 계산해 놓고 브라우저가
  다시 흐리게 만들면 의미가 없다.
- 박스는 `<label>`이 아니라 `<div>`다. `<label>`로 두면 슬롯 안의 버튼을 눌러도 입력이 포커스를
  가져가 버튼이 동작하지 않는다.

## Known deviations

- **제품과 거의 모든 축이 다르다.** 정본이 없으므로 "다르다"가 결함이 아니다. 각 축의 판정은
  [`product.measured.json`](../../migration/product.measured.json)의 `text-field`에 있다.
- **Figma 에 Focus 변형이 없다(2026-10-06).** 포커스 링을 그리지 않으므로(DS-D-0074) Focus 는
  Default 와 같고, 링을 바깥 stroke 로 그리던 일곱 변형을 걷었다. 프레임 폭 328(박스 320 + 좌우 4)은
  그대로 둔다 — 강제 색 링의 자리이고, 줄이면 형제 칸 격자와 계약 `frameWidth` 가 함께 움직인다.
- **맨 Textarea 가 없다.** 여러 줄 판(`data-multiline`)은 첨부 · 툴바가 붙는 문의 본문 하나를 옮긴 것이다(DS-D-0084).
  제품의 다른 여러 줄 입력(캔버스 프롬프트 계열 최소 5벌)은 같은 박스 구조로 확장할 수 있으나 이번 범위가 아니다.
- **여러 줄 판의 끄는 중 표현이 제품과 다르다.** 제품은 바깥 2px outline 2 띄움(`app/inquiry/InquiryClient.tsx@54b62a8a:186-187`)이고
  레시피는 Drop Zone 과 같은 안쪽 링이다 — 바깥 outline 은 이웃 칸 위로 넘쳐 그려지고, 같은 「여기에 놓인다」를 두 모양으로 말하게 된다.
  첨부 지우기도 제품 28 원 · 칸 밖 6 · inverse 면(:192-193)에서 Media Slot 의 22 원 · 안쪽 5 · 미디어 스크림으로 접힌다
  (DS-D-0084 소유자 판정 8, 2026-10-13 기본값).
- **여러 줄 판에 React 표면이 아직 없다.** Figma 는 2026-10-13 에 섰다 — `Layout`(`base` · `multiline`, `Size=lg` 에만) ·
  BOOLEAN `HasAttachments` · `HasToolbar` · `State=DragOver`(multiline 에만). 기록 `input.lg/stacked/multiline` 은 실브라우저 시험
  (`packages/react/test/text-field.browser.test.tsx`)이 문서 마크업 조립(본문 · 첨부 한 칸 · 툴바)으로 잰다.
- **여러 줄 본문은 border-box 다(2026-10-13 고침).** 실브라우저 시험이 본문 `.louis-text-field__control` 이 content-box 로 서서
  `min-block-size: 200px` 에 여백 16 × 2 가 더해진 232 를 만드는 것을 찾았다(상자 372 대 Figma 340). 제품 `min-h-[200px]`
  (`app/inquiry/InquiryClient.tsx@54b62a8a:185`)는 Tailwind preflight 의 border-box 아래 값이고 레시피는 전역 reset 을 기대하지 않으므로
  ([DS-D-0004](../governance/decisions/DS-D-0004-css-authoring.md)) 여러 줄 본문에 `box-sizing: border-box` 를 선언해 340 으로 맞췄다.
- **`sm`에서 라벨(14)이 값(12)보다 크다.** 값은 실측으로 내려갔고 라벨은 재지 못해 비례대로
  남았다. 도구 줄의 `sm` 필드는 보통 시각 라벨 없이 `aria-label`로 서므로 지금은 부딪히지
  않는다. 라벨을 가진 `sm` 필드가 실제로 생기면 **그때 재서** 정한다 — 여기서 유도하면 재지 않은
  값을 하나 지어내는 것이 된다.
- **`sm`의 반경 8은 이 컴포넌트를 잰 값이 아니다.** 디자인의 24 자리 여섯은 8이고 가장 가까운
  값 박스만 6이다. 판정 근거는 위 「`sm`의 값은 어디서 왔나」에 있다.
- ~~**Figma에 `sm` variant가 없다.**~~ **해소됐다.** Figma의 `Size`는
  `["md","lg","sm"]` 셋이고 `verify-figma-parity`는 초록이다. 이 문장은 결손이 메워진 뒤에도
  남아 있었고 **어느 게이트도 잡지 않았다** — 문서의 낡은 주장은 게이트의 시야 밖이다.
  2026-09-03에 되읽기와 parity 두 증거로 고쳤다(icon-button.md의 「Figma에 sm이 없다」가
  2026-09-02에 같은 형태로 고쳐졌고, 그때 「다른 컴포넌트 문서에도 있는지는 훑지 않았다」고
  남긴 그 자리다).
- **`floating`의 색 셋은 제품 다수파를 따랐고, 소수파 둘이 남는다.** 포커스 테두리·링과 쉬는
  라벨의 색이 일곱 벌 중 다섯에서 40%/40%인데, 설정의 인증 모달만 **24%/32%**이고
  `/aws/signup`은 브랜드 팔레트(`--aws-navy-input-focus` · `palette-gray-600`)를 쓴다. 다수파를
  정본으로 삼았고 두 소수파는 이 축에 담지 않는다 — 후자는 표면 원장이 이미 「브랜드 변형을
  변형 축으로 넣을지 별도 화면으로 둘지」를 열어 둔 별건이다.
- **`floating`이 제품 인증 화면과 픽셀로 맞지는 않는다.** 정본과 그 계열이 갈리는 선언은 다섯인데
  (높이·내부 배치 · 1px 12% 테두리 · 4% 알파 면 · inset 링 · 값 타이포 16) **이 축이 담는 것은
  첫째 하나뿐이다.** 나머지 넷은 인증 계열이 정본과 갈리는 기존의 스킨 차이이고, 이 컴포넌트의
  값이 제품을 옮긴 것이 아니라 DS가 정한다는 위 머리말 그대로다.
- ~~**결합 입력이 없다.**~~ **해소됐다** — `Join` 축이 2026-09-06에 섰다
  ([DS-D-0052](../governance/decisions/DS-D-0052-joined-fields-are-an-axis.md)). 곡률과 겹침은
  제품 다섯 벌 그대로다. **`z-index` 만 따르지 않는다** — 제품은 포커스에서 1 → 2로 올려 이웃의
  테두리 위로 올라오는데, 이 저장소는 숫자 `z-index`를 금지하고 사다리에 로컬 stacking 칸이
  없다. 대신 링을 상자 안으로 넣어 같은 결과를 얻는다(위 「포커스 링이 안으로 들어간 이유」).
  **남는 편차는 링의 자리 하나다** — 강제 색의 링에서 두께·색·모양은 같고, 결합하지 않은 필드의
  링은 그대로 밖에 선다. 평상 렌더링에는 링이 없다(DS-D-0074).
- **결합은 계약을 `lg/floating` 에만 갖는다.** CSS 는 `data-join` 을 세 크기 어디에도 걸 수 있고
  막지 않는다. 막지 않는 이유는 `floating` 과 같다 — 잰 자리가 없어서 값을 정하지 않았을 뿐이고,
  타입으로 조합을 제한하면 이 타입을 확장하는 바깥 코드가 깨진다. 계약이 되는 조합은 이 문서와
  `figma/components.measured.json` 의 세 칸이다.
- **결합한 필드에 `description` 을 두면 결합이 끊긴다.** 메시지는 박스 아래 stack 에 서므로 두
  상자 사이에 문구가 끼어든다. 타입이 막지 않으며(둘 다 선택 prop 이다) 무리 전체의 문구는
  무리 아래 한 자리에 두는 것이 이 축의 전제다. Figma 변형이 Message 를 들고 있는 것은 그 칸이
  `lg/floating` 의 자손 구성을 그대로 물려받기 때문이지 권장이 아니다.
- **Figma 는 겹침과 링의 자리를 대조하지 못한다.** 오토레이아웃에 음수 마진이 없고 CSS 의
  `outline` 에 해당하는 것도 없다. 그래서 되읽기가 무는 것은 곡률 둘뿐이고, 겹침과
  `outline-offset` 은 `text-field.browser.test.tsx` 가 계약값과 대조한다 — 두 값의 유일한
  게이트다.
- **`floating`에서 `label`은 사실상 필수인데 타입이 강제하지 않는다.** 라벨이 placeholder의
  자리를 대신하므로 없으면 필드에 보이는 이름이 하나도 남지 않는다. `TextFieldProps`가
  인터페이스여서 판별 유니온으로 바꾸면 이 타입을 확장하는 바깥 코드가 깨진다 — 계약은 이
  문서와 브라우저 테스트가 갖는다.
- **컨트롤 테두리 정본은 이제 닫혔다.** 이전엔 `color-stroke-control`을 썼는데 IconButton은 같은
  자리에 `color-stroke-default`를 써서 저장소 안 정본이 정해지지 않은 채였다. [DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)이
  모든 일반 0.5px stroke를 단일 `color-stroke-hairline` generic 헤어라인으로 통일해 (2b)를 닫았다 —
  Button·IconButton·TextField가 이제 같은 색·두께를 쓴다.

## Acceptance tests

1. lg/md/sm의 높이·좌우 여백·슬롯 간격·반경·테두리·타이포가 `components.measured.json`과 같다.
2. Default·Invalid·Disabled의 면·전경·테두리가 states 표와 같다.
3. 평상 렌더링에는 포커스 링이 없고, 강제 색의 링을 **박스**가 받으며, 입력 자신은 링을 그리지 않고, 접미 슬롯이 박스 안에 있다.
4. placeholder가 `foreground-secondary`이고 값과 다르며 `opacity: 1`이다.
5. 라벨의 `for`가 입력을 가리키고, 라벨을 누르면 입력에 포커스가 간다.
6. 필드가 둘 있을 때 두 입력의 id가 다르다.
7. `invalid`면 `aria-invalid="true"`, `aria-describedby`가 메시지를 가리키고, 메시지가
   `role="alert"`이며 문구가 실제로 있다.
8. `invalid`가 아니면 메시지가 `role="alert"`이 **아니다.**
9. 사다리가 이름 순서대로 내려간다 — lg 40 > md 32 > sm 24. 이름이 순서를 거짓말하는 상태를
   막는다(DS-D-0027이 고친 문제가 정확히 그것이었다).
10. `floating`의 높이가 네 항의 합과 같다 — 12 + 8 + 21 + 12 = 53. 네 항을 각각 재고 합도 잰다.
11. `floating`이 `stacked`의 반경·좌우 여백·슬롯 간격·헤어라인·면을 **하나도 다시 쓰지 않는다.**
    둘을 나란히 세워 계산값을 대조한다 — 이 축이 축인 근거가 그것이다.
12. 라벨이 값과 포커스에 따라 떠오르고 **색은 포커스만 따른다.** 값이 든 채 포커스를 잃으면
    자리는 떠 있고 색은 secondary로 돌아온다.
13. 떠오른 라벨의 **글자 띠**가 값의 글자 띠와 닿지 않는다. 상자끼리 재면 반-행간 때문에 거짓
    실패가 난다.
14. `stacked`에서 라벨이 박스 밖의 형제로 남고 흐름에 있다(`position: static`).
15. `floating`이 placeholder를 스스로 채우고(`" "`) 숨기며, `stacked`은 손대지 않는다.
16. `floating`의 라벨도 `htmlFor`로 입력에 이어져 있다 — DOM에서 input **뒤**로 옮겨 갔다.
17. `sm`의 반경이 높이의 절반보다 작다 — 필드가 알약이 되지 않는다. 토큰 이름만 읽으면 둘 다
    「control 반경」이라 계산값을 봐야 보인다.
18. `start`·`middle`·`end`의 **위/아래 반경을 따로** 잰다. 한쪽만 재면 이어 붙는 변이 반대쪽인
    회귀를 통과시킨다. 좌우가 대칭인 것도 함께 확인한다 — 계약이 왼쪽 두 모서리만 보는 근거다.
19. 겹침이 계약값과 같고, **필드 뿌리**가 그것을 갖는다. 박스에 걸면 stack의 간격과 메시지가
    사이에 남는다.
20. 강제 색에서 결합한 필드의 포커스 링이 상자 **안**에 서고(`outline-offset` = 계약값), 두께와 색은 결합하지
    않은 필드와 같다. 링 값은 그 상자가 포커스를 쥐고 있는 동안에만 읽는다 — 잃은 상자의
    `outline-width`는 초기값 `medium`(3px)으로 돌아온다.
21. 결합이 `lg/floating`의 나머지 값을 **하나도 다시 쓰지 않는다.** 높이·여백·슬롯 간격·헤어라인·
    면을 나란히 세워 대조한다 — 이 축이 축인 근거가 그것이다.
22. 결합하지 않은 필드에 `data-join`이 **붙지 않고** 겹치지도 않는다. 기본값이 `none`이라는
    사실 자체가 계약이다 — 속성이 붙어 버리면 폼 전체가 조용히 1px씩 위로 붙는다.
