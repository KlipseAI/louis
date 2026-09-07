---
id: alert
status: experimental
authority: normative
summary: 화면 안에 남아 사라지지 않는 인라인 상태 배너입니다.
---

# Alert

폼이나 섹션 안에 남아 그 자리의 상태를 설명한다. 사라지지 않는다.

정본은 결제 체크아웃의 오류 배너(`CHECKOUT_ERROR`)다 — 가로 패딩 18 · 반경 20 · `#ff4b59` 12%
면 + 24% 테두리 · body-14. 그 사양을 톤 축으로 일반화해 채택했다.

**LOUIS 안에 붉은 배너 사양이 한 벌 더 있다.** [Status Result](../patterns/status-result.md)의 결과
처리 오류 배너는 면 8% · 테두리 16% · 반경 12 · 가로 16 이고 **이 레시피를 쓰지 않는다** — 아래
「제품 소비처」 다섯 자리에 그 화면이 없다. 두 벌은 서로 다른 자리의 서로 다른 값이며 통일 대상이
아니다. 어느 쪽 값을 건드리든 다른 쪽 문서를 함께 본다(2026-08-30 상호 참조 추가 — 그전에는 두
문서 어디에도 서로를 가리키는 줄이 없어 어느 쪽이 정본인지 문서만으로 알 수 없었다).

**2026-09-06 에 레이아웃 축(`data-layout`)이 섰다.** 그전에는 축이 `data-tone` 하나뿐이라 상자
하나만 그릴 수 있었고, 제품의 알림 두 계열이 그 밖에 남아 각자 클래스를 적고 있었다 —
대시보드의 무테 한 줄 안내(`InsufficientNotice`, JSX 12자리 / 4파일 / 2라우트)와 루트 레이아웃에
얹히는 전폭 띠(`PastDueBanner`, `app/layout.tsx` 한 곳에 붙어 46라우트에 얹힌다). 두 계열은 톤이
아니라 **놓이는 자리**가 다르다. 같은 작업에서 `figma/components.measured.json` 에 `alert` 칸을
처음 세웠고(그전에는 측정 31종 밖이었다), Figma 에 `Layout` · `Dismissible` 두 축을 세웠으며,
`packages/react/test/alert.browser.test.tsx` 가 코드 쪽 값을 되잰다.

**세 가지가 이 컴포넌트의 오늘을 결정한다.**

- 제품 소비처는 **다섯 자리**이고 **전부 기본 톤(danger)** 을 쓴다. `data-tone` 을 쓰는 자리는
  **0**이고, 아이콘·제목 슬롯을 쓰는 자리도 **0**이다. 톤 축과 슬롯 축은 아직 제품에서 한 번도
  검증되지 않았다.
- 세로 패딩이 정본과 다르다. 정본은 16px 인데 레시피는 `space-control-md`(12px)를 쓰고, 소비처
  다섯 중 둘이 그것을 `py-8` 로 되돌린다.
- ~~**아이콘 슬롯의 광학 정렬이 실제로는 동작하지 않는다.**~~ **해소됨(2026-08-27)** — 식을
  글자 크기로 닫아 2.5px 이 실제로 걸린다. 아래 Known deviations 2.

## Availability

| Surface       | 상태           | 근거                                                                                                 |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| Web           | `partial`      | CSS 레시피 `.louis-alert` 가 있고 제품 소비처 5자리가 그것을 쓴다. **React 표면은 없다** — `packages/react/src/` 에 `alert` 디렉터리가 없고 public export 도 없다. storybook 스토리 0건, acceptance test 0건 |
| Figma         | `done`         | Alert — variant 축 Layout(block·inline·banner) × Tone(danger·info·success·warning) **12 변형**. 속성: HasIcon·HasTitle·Dismissible BOOLEAN, Title·Body TEXT, Glyph INSTANCE_SWAP. parity 게이트가 매 실행 대조하는 것은 stroke(1px · `INSIDE`, block 만) · effects 없음 · 속성 축(선언되지 않은 property 0) · raw fill·stroke 바인딩 0, 그리고 **2026-09-06 부터 기하**다 — 세 레이아웃의 패딩·간격·반경·layoutMode 와 Icon 슬롯 폭이 `figma/components.measured.json` 의 `alert` 칸과 대조된다. 그 칸을 코드가 여전히 만드는지는 `packages/react/test/alert.browser.test.tsx` 가 되잰다. 두 방향이 다 걸리므로 [DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md) 의 (a)(b)(c) 가 선다 |
| Documentation | `done`         | 이 문서                                                                                              |
| Maturity      | `experimental` | 규범이 구현보다 늦게 섰다 — CSS 가 먼저 있었고 이 문서가 그것을 처음 대조한다                        |

## When to use

- 폼 제출이 **실패**했고 그 오류가 폼 안에 남아야 할 때 — 결제 승인 거절, 문의 전송 실패.
- 섹션이나 목록 위에 **상태를 설명**하고 사용자가 읽을 때까지 남아야 할 때 — 조회 실패, 관리자
  전용 초안 미리보기.
- 사용자가 조치할 때까지 **사라지면 안 되는** 안내.

쓰지 않는 자리.

- **떠서 스스로 사라지는 알림.** 그것은 [Toast](toast.md)이며 다른 컴포넌트다. Alert 에는
  elevation 도 진입 모션도 자동 해제도 없다.
- **필드 하나에 붙는 한 줄 메시지.** 그것은 [FormMessage](form-message.md)이며 아직 LOUIS
  레시피가 없다. 제품의 `type-caption-12-regular` 인라인 오류(설정·구독 화면의 결제 오류, 쿠폰
  오류)가 그 무리이고 이 컴포넌트가 아니다.
- **필드 자신의 오류 표현.** [Text Field](text-field.md)가 자기 invalid 상태를 갖는다.
- **진행을 막고 답을 받아야 할 때.** 그것은 [Dialog](dialog.md)다.
- **화면에 보여 줄 내용이 없을 때.** 그것은 [Empty State](empty-state.md)다.
- **홍보·전환 유도 배너.** 그것은 [Banner Carousel](banner-carousel.md)이다.

## API

CSS 레시피만 있다. 마크업은 소비처가 쓴다.

```html
<div class="louis-alert" role="alert">
  <span class="louis-alert__icon" aria-hidden="true"><!-- 16px 글리프 --></span>
  <div class="louis-alert__content">
    <p class="louis-alert__title">결제에 실패했습니다</p>
    카드사 승인이 거절됐습니다. 다른 카드로 다시 시도해 주세요.
  </div>
</div>

<div class="louis-alert" data-tone="info" role="status">
  <div class="louis-alert__content">미리보기 — 이 템플릿은 아직 발행되지 않았습니다.</div>
</div>
```

**React 컴포넌트가 없다.** `packages/react/src/` 의 25개 디렉터리에 `alert` 가 없고 `index.ts`
에도 export 가 없다. 그래서 위 마크업 계약 — 특히 `__content` 로 감싸는 것과 `role` 을 직접
붙이는 것 — 을 지키는 책임이 전부 소비처에 있고, 지키지 않아도 잡아 주는 것이 없다.

## Anatomy

1. **Root** — `.louis-alert`. 면·테두리·반경·패딩·본문 타이포·줄바꿈 규칙을 소유한다.
   `data-tone` 이 여기 붙는다.
2. **Icon** — `.louis-alert__icon`. 선택. 16px 정사각 슬롯이며 글리프는 소비처가 넣는다.
   `flex: none` 이라 줄어들지 않는다.
3. **Content** — `.louis-alert__content`. 본문을 담는다.
4. **Title** — `.louis-alert__title`. 선택. `__content` 안에 온다. 본문과 크기가 같고 중량만
   500 으로 오른다. **크기는 레이아웃을 따라간다** — `inline` 에서는 본문이 caption 12 로
   내려가므로 제목도 caption 12(중량 500)로 내려간다. 그러지 않으면 한 줄 안내 위에 더 큰
   제목이 서는 역전이 생긴다.
5. **Dismiss** — `.louis-alert__dismiss`. 선택. **버튼을 DS 가 그리지 않고 자리만 준다** —
   소비처가 `.louis-icon-button` 을 넣는다. 알림이 자기 안에 버튼을 그리면 크기·톤 축이 둘로
   갈리고(IconButton 이 이미 소유한다) 접근성 라벨까지 DS 가 정하게 되는데, 닫는 대상의 이름은
   화면의 사정이다. block·inline 에서는 흐름에 남아 오른쪽 끝으로 밀리고(`margin-inline-start:
   auto`), banner 에서는 절대 위치로 오른쪽 끝 12px 에 고정된다 — 흐름에 남으면 가운데 정렬된
   문구를 밀어내기 때문이다.

**`__content` 가 선택이 아닌 이유.** 루트가 `display: flex` 의 row 다. 제목과 본문을 슬롯 없이
루트 바로 아래에 두면 **가로로 나란히 선다.**

그런데 오늘 제품에서 그 문제를 실제로 겪는 자리는 **하나뿐**이다 — 결제창 패널만 `<strong>` 과
`<p>` 둘을 슬롯 안에 넣는다. 나머지 넷은 자식이 하나인데 **둘(업그레이드 페이지 · 템플릿
미리보기)은 슬롯을 쓰고 둘(JobMonitor · InquiryClient)은 생략한다.** 즉 생략과 사용을 가르는
규칙이 오늘 서 있지 않다 — 자식 수가 아니라 그때그때 갈렸다. 계약상 `__content` 는 필수이고
(슬롯이 `flex: 1 1 auto` · `min-inline-size: 0` 을 소유한다), 생략한 두 자리는 짧은 한 줄
문구라 보이는 차이가 없을 뿐이다. 정리 방향은 생략을 허용하는 규칙을 세우는 것이 아니라 넷을
슬롯으로 맞추는 쪽이다.

## Properties

| 속성 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `data-layout` | `block` \| `inline` \| `banner` | 없음 = block | 놓이는 자리. 기하와 면을 함께 바꾼다 |
| `data-tone` | `info` \| `success` \| `warning` | 없음 = danger | 의미 축. 루트에 붙는다 |
| `role` | `alert` \| `status` \| 없음 | **소비처가 정한다** | 긴급도. DS 가 정하지 않는다 |

슬롯은 `__icon` · `__content` · `__title` · `__dismiss` 넷이고 전부 클래스다.

**`data-layout="block"` 은 CSS 에 실제로 선택자가 있다.** 속성이 없을 때와 같은 값이지만
`.louis-alert:not([data-layout])` 과 한 규칙을 이룬다 — 이름을 적어 두지 않으면 「써도 되지만
계약에 없는 값」이 되고, 그것이 아래 `danger` 톤이 빠진 함정이다(Known deviations 3). 같은
함정을 두 번 파지 않는다.

**기본이 danger 인 이유.** CSS 주석이 "제품의 인라인 배너가 거의 전부 오류이기 때문"이라고 적어
두었고 실측이 그것을 뒷받침한다 — 소비처 다섯 중 넷이 오류 배너이고 하나만 정보 배너다.

**그 대가로 `danger` 라는 값이 계약에 없다.** CSS 에 `[data-tone="danger"]` 선택자가 없다. 써도
기본 선언이 그대로 적용돼 결과는 맞지만 계약에 없는 값이고, 톤을 변수로 계산하는 호출부는
`tone === "danger" ? undefined : tone` 같은 특례를 써야 한다.

**`role` 을 DS 가 정하지 않는 이유.** role 을 정하면 긴급도까지 DS 가 가져간다. 같은 오류
배너라도 사용자의 동작 직후 나타나면 `alert`(assertive), 목록 갱신 중 조용히 나타나면
`status`(polite)다. 그것은 화면의 사정이다. [Toast](toast.md)가 반대로 두 region 의 role 을
DS 가 소유하는 것은, toast 가 스스로 뜨고 사라져 소비처가 라이브 리전의 수명을 관리할 수 없기
때문이다.

## Hierarchy와 variants

축이 둘이다 — `data-layout`(놓이는 자리)과 `data-tone`(의미).

### 레이아웃 축

| layout | 면 | 테두리 | 반경 | 패딩(세로/가로) | 간격 | 본문 | 정렬 |
| --- | --- | --- | ---: | --- | ---: | --- | --- |
| `block`(기본) | 톤 알파 틴트 | 1px 톤 색 | 20 | 12 / 18 | 8 | body-sm 14 | `flex-start` |
| `inline` | 없음 | 없음 | 0 | 10 / 0 | 8 | caption 12 | `center` |
| `banner` | **불투명 톤 컨테이너** | 없음 | 0 | 10 / 16 | 16 | body-sm 14 | `center` · 가운데 정렬 |

**`inline` 은 톤을 갖지 않는다.** 면도 테두리도 없어 남는 신호가 글자 색 하나뿐인데, 그것만으로
뜻을 전하면 이 컴포넌트가 스스로 세운 계약(면 색만으로 뜻을 전달하지 않는다 · WCAG 1.4.1)이
무테에서 깨진다. 그래서 인라인의 글자는 언제나 `color-fg-secondary` 이고 뜻은 아이콘과 문장이
전한다 — 제품의 유일한 담지자(`InsufficientNotice`)도 정확히 그렇게 그려져 있다: 회색 글자 +
느낌표 원 글리프 + "데이터가 부족합니다" 문장. 네 톤이 같은 값이라는 사실은 계약의
`states.inline` 이 네 칸을 접지 않고 다 적어 고정한다.

**`banner` 의 면은 알파 틴트가 아니다.** 12% 틴트는 카드 면 위에 얹히는 상자에서 성립하는
값이고, 전폭 띠는 페이지 바닥 위에 직접 놓여 그 면이 거의 보이지 않는다. 그래서 `color-bg-{tone}`
· `color-fg-{tone}` — 톤 컨테이너를 위해 이미 서 있는 토큰 — 을 쓴다. 새 토큰을 만들지 않았고,
그 두 쌍은 token source 의 `contrastPairs` 에 이미 들어 있어 **네 레이아웃 중 글자 대비를 재는
게이트가 실제로 도는 유일한 자리**가 된다.

**`banner` 는 위치를 갖지 않는다.** `position: fixed` · `top` · 쌓임 순서는 띠가 **어디에
붙는가**이지 어떻게 그려지는가가 아니다. 소비처가 자기 레이아웃에서 준다 — 제품 담지자가
`zIndex: 9999` 로 GNB·모달 위를 덮고 있어, 그 순서를 LOUIS 의 `layer-*` 계단으로 옮기는 것은
실측이 먼저다(Known deviations 14).

### 톤 축

톤은 면·테두리·글자 **세 값을 함께** 바꾼다.

| tone | 면 (light) | 테두리 (light) | 글자 (light) | 면 (dark) | 테두리 (dark) | 글자 (dark) | 글자 대비 light / dark |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| danger (기본) | `#ff4b59` 12% | `#ff4b59` 24% | `#b72431` | `#ff4b59` 12% | `#ff4b59` 24% | `#ffe5e8` | 5.27 / 9.06 |
| `info` | `#f0f7ff` | `#a3d5ff` | `#005fb3` | `#003461` | `#005fb3` | `#d6ebff` | 5.92 / 10.33 |
| `success` | `#e5fff7` | `#00c68e` | `#008f67` | `#004c39` | `#008f67` | `#e5fff7` | **3.90** / 9.55 |
| `warning` | `#fff5d6` | `#ffb200` | `#b87600` | `#4c3300` | `#b87600` | `#fff5d6` | **3.43** / 10.83 |

토큰 이름은 톤마다 `color-alert-{tone}-surface` · `-stroke` · `-foreground` 셋이다. 굵은 두
수치는 WCAG AA(4.5) 미달이며 Known deviations 4가 그것이다. danger 의 대비는 면이 알파라
페이지 면에 따라 달라진다 — 위 값은 `color-bg-surface` 위에서 합성해 잰 것이다.

**danger 만 알파 면이고 나머지 셋은 불투명하다.** 알파는 제품 정본에서 온 값이고, 나머지 셋은
DS 가 골랐다. 그래서 danger 배너만 뒤 표면이 비쳐 보인다.

**크기 축은 여전히 없다.** 배너는 컨트롤이 아니라 흐름 안의 블록이라 나란히 서는 것과 높이를
맞출 이유가 없다. 높이는 내용이 정한다. 그래서 계약(`figma/components.measured.json`)의
`sizes` 키도 크기가 아니라 **레이아웃**이다 — `block`·`inline`·`banner` 셋이고, Figma 되읽기가
같은 키를 쓴다.

**solid/outline 같은 강조 축도 없다.** 톤이 이미 면과 테두리를 함께 정하고, 한 화면에 배너가
둘 이상 서는 자리가 제품에 없다.

## States

상태 축이 **없다.** hover·focus·active·pressed·disabled 선언이 0이다 — 배너는 대화형이 아니다.

사라지는 상태도 없다. 그것이 [Toast](toast.md)와 갈리는 지점이다: toast 는 수명을 갖고 alert 는
갖지 않는다. 배너를 언제 렌더하고 언제 지울지는 전적으로 소비처의 조건부 렌더링이다.

배너 **안에** 링크나 버튼을 넣으면 그 요소가 자기 컴포넌트의 상태를 갖는다. 루트는 관여하지
않는다.

## Interaction and responsive behavior

- 폭은 컨테이너가 정한다 — `inline-size: 100%` 다. 내용 크기로 자라지 않는다.
- 높이는 내용이 정한다. 배지와 반대로 **줄바꿈으로 늘어난다** — 배너는 문장을 담는 것이 일이라
  한 줄로 자르면 뜻이 사라진다.
- 아이콘은 `flex: none`, 본문은 `min-inline-size: 0` 이다. 긴 URL 이나 오류 코드가 배너를 넓혀
  레이아웃을 밀지 않는다.
- 한국어 어절을 보존한다(`word-break: keep-all`). 끊을 수 없는 긴 영문 토큰만
  `overflow-wrap: break-word` 로 끊는다.
- 44px hit target 규범의 대상이 **아니다.** 그것은 누를 수 있는 것의 계약이다.
- **모션이 없다.** 진입 애니메이션이 필요하면 소비처가 얹는다(제품 두 자리가 280ms keyframe 을
  붙였다). `prefers-reduced-motion` 처리도 그쪽 몫이 된다.

## Content

- **무슨 일이 일어났는지와 다음에 무엇을 할지를 함께 쓴다.** "결제에 실패했습니다"에서 끝내지
  않고 왜 실패했고 무엇을 하면 되는지를 잇는다. 배너가 남아 있는 이유가 그것이다.
- 제목은 **한 줄의 명사구 또는 짧은 문장**이고 본문이 설명을 맡는다. 제목 없이 본문만 두는 것도
  정상 형태이며 제품 **다섯 자리 전부**가 그렇다 — `__title` 을 쓰는 소비처가 0이다.
- **색이 유일한 신호가 되지 않게 문장이 상태를 말해야 한다.** 초록 배너에 "저장했습니다"라고
  쓰는 것이지 초록만으로 성공을 뜻하게 하지 않는다. 색각 이상에서 tone 은 전달되지 않는다.
- 같은 상태를 화면마다 다르게 부르지 않는다.
- 배너 문구는 사용자에게 보이는 문장이므로 하드코딩하지 않고 메시지 시스템을 통해 KO/EN 두 벌로
  들어간다.

## Accessibility

- **컴포넌트가 `role` 을 붙이지 않는다.** 소비처가 `role="alert"`(즉시 알림) 또는
  `role="status"`(비긴급)를 준다. 정적으로 렌더돼 바뀌지 않는 배너는 **role 을 붙이지 않는
  것이 맞다** — 라이브 리전이 알릴 변화가 없기 때문이다. 제품의 템플릿 미리보기 배너가 그
  경우이고 실제로 role 없이 렌더된다.
- **면 색만으로 뜻을 전달하지 않는다**(WCAG 1.4.1). 아이콘 슬롯이나 제목, 그리고 무엇보다 문장이
  의미를 함께 전달해야 한다. 슬롯은 선택이므로 이 계약은 **문장이 지켜야 하는 계약**이다.
- **forced-colors 에서 테두리를 다시 세운다.** 면 색이 시스템 색으로 강제 치환되면 네 톤이 같은
  면이 되어 구분이 사라진다. 그래서 경계를 `currentColor` 1px 실선으로 남긴다. 아이콘과 제목이
  거기서 의미를 계속 전달한다.
- **글자 대비가 light 에서 두 톤 미달이다** — success 3.90 · warning 3.43. 수치는 위 tone 표에
  있고 사유와 해소 경로는 Known deviations 4에 있다. dark 는 네 톤 모두 9.06 이상이다.
- **이 대비를 재는 게이트가 없다.** token source 의 `contrastPairs` 14쌍 어디에도
  `color-alert-*` 가 없다.
- 포커스 계약이 없다 — 루트가 포커스를 받지 않는다. 배너 안에 놓인 대화형 요소가 자기 링을
  갖는다.
- 배너의 등장·소멸을 알리는 것은 소비처의 라이브 리전이다. 루트는 그 리전 자체가 될 수도 있고
  (role 을 붙이면) 리전 안의 내용일 수도 있다. 둘 중 무엇인지는 소비처가 정한다.

## Specification

**세 레이아웃이 갈리는 축.** 값은 실제 Chromium 실측이고
`figma/components.measured.json` 의 `alert.sizes` 가 정본이다.

| 축 | `block` | `inline` | `banner` | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 세로 패딩 | 12px | 10px | 10px | `space-control-md` / `layout-alert-compact-inset` |
| 가로 패딩 | 18px | 0 | 16px | `layout-alert-inset` / — / `space-layout-gutter` |
| 슬롯 간격 | 8px | 8px | 16px | `space-control-sm` / `space-layout-gutter` |
| 테두리 | 1px | 0 | 0 | `border-width-default` + `color-alert-{tone}-stroke` |
| 반경 | 20px | 0 | 0 | `radius-alert` |
| 본문 타이포 | 14/21 · 400 | 12/18 · 400 | 14/21 · 400 | `typography-body-sm-regular` / `typography-caption-regular` |
| 제목 타이포 | 14/21 · 500 | 12/18 · 500 | 14/21 · 500 | `typography-body-sm-medium` / `typography-caption-medium` |
| 아이콘 광학 보정 | 2.5px | 0 | 0 | `calc((body-sm-font-size*-line-height − icon-size-sm) / 2)` |
| 한 줄 높이 | 47px | 38px | 41px | (패딩 두 번) + (테두리 두 번) + 행 높이 |
| 닫기 위치 | 흐름 끝 | 흐름 끝 | 오른쪽 12px 고정 | `space-control-md` |

**세 레이아웃이 공유하는 축.**

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 글꼴 패밀리 | Pretendard 스택 | `typography-{scale}-font-family` |
| 아이콘 한 변 | 16px | `icon-size-sm` |
| 폭 | 100% | 리터럴 `inline-size` |
| 본문 최소 폭 | 0 | 리터럴 `min-inline-size` |
| 바깥 여백 | 0 | 리터럴 `margin` |
| elevation | 없음 | — |

**세로 10px 이 전용 토큰인 이유.** 제품 두 담지자에서 같이 온 값이다 —
`InsufficientNotice` 의 `py-5` 와 `PastDueBanner` 의 `padding: 10px 16px` 이 둘 다 10 이다.
LOUIS 간격 계단은 4·8·12·16 이라 10 이 없어 `layout-alert-compact-inset` 을 세웠고, 이는 가로
18(`layout-alert-inset`)과 같은 사정이다. 12 로 접으면 소비처가 되돌려야 하고, **되돌림이
필요한 축은 채택이 아니다**(Known deviations 1 의 기준).

**가로 18px 이 전용 토큰인 이유.** 제품 정본에서 온 값인데 기존 계단에 없다 — `space-control-*`
는 4·8·12·16 이고 18이 없다. 그래서 `layout-alert-inset` 이 이 컴포넌트를 위해 섰다. 같은
논리를 세로 패딩에는 적용하지 않았고 그것이 Known deviations 1이다.

**반경 20px 은 사정이 다르다.** 이 값은 기존 계단에 이미 있다 — `radius-card-lg` 가 20px 이고
`radius-alert` 와 **같은 primitive**(`primitive.radius.20`)를 가리킨다(`radius-control` 과
`radius-card` 는 둘 다 12px 로 같은 값이다). 즉 `radius-alert` 는 값이 없어서 세운 토큰이 아니라
이름만 갈라 세운 토큰이고, Known deviations 6(면 토큰 셋이 기존 토큰과 값이 같다)과 같은 종류의
중복이다. Known deviations 13에 적었다.

**글꼴 패밀리도 축이다.** 레시피가 `font-family` 를 직접 선언하고 그 값은 리터럴 Pretendard
스택이다. 제품 두 자리(JobMonitor · InquiryClient)가 `--type-font-family` 로 되돌리는 것이 이
축이다 — next/font 변수가 로케일마다 우선 순위를 바꾸기 때문이다.

**리터럴로 남은 자리와 사유.**

- `inline-size: 100%` · `min-inline-size: 0` · `margin: 0` 은 **치수 축이 아니라 구조 규약**이다.
  폭은 소비처의 컨테이너가 정하고, `min-inline-size: 0` 은 flex 자식이 내용보다 좁아질 수 있게
  하는 값이며, `margin: 0` 은 `<p>` 로 와도 브라우저 기본 여백을 지우기 위한 리셋이다 — LOUIS
  reset 은 opt-in 이라 소비자가 켜지 않을 수 있다. 토큰화하면 값이 아니라 규약이 흔들린다.
- `display: flex` · `align-items: flex-start` · `box-sizing: border-box` ·
  `overflow-wrap: break-word` · `word-break: keep-all` 도 같은 이유로 리터럴이다. 조판 규칙에는
  대응하는 토큰 축이 없다.
- 아이콘 광학 보정만은 리터럴이 **의도가 아니라 사고**다. 토큰으로 계산하려다 단위가 맞지 않아
  선언이 통째로 죽었다.

## Effects

**없다.** `box-shadow` 가 `none` 이고 그림자도 elevation 도 전환도 없다. 배너는 흐름 안의
블록이라 떠 있지 않다 — 떠 있는 것은 Toast 와 Dialog 다.

**헤어라인 inset([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md))을 쓰지 않고
진짜 `border` 1px 을 쓴다.** 이유가 둘이다. 헤어라인은 generic 한 색(`color-stroke-hairline` =
라이트 static-black 8% · 다크 static-white 8%)이라 톤마다 다른 테두리 색을 낼 수 없고, 배너는
컨트롤이 아니라 블록이라 border-box 가 안쪽으로 줄어도 맞춰야 할 고정 높이가 없다. Segmented
Control 이 inset box-shadow 를 택한 이유(세그먼트 높이를 정확히 32로 남기기 위해)가 여기서는
성립하지 않는다.

(DS-D-0023 본문과 `packages/css/src/base.css` 주석은 헤어라인을 아직 10% 로 적는다. 토큰의
현재 값은 8% 이고 다크는 paper 가 아니라 static-white 다 — 그 두 곳이 낡았다.)

## Implementation

- Web source: `packages/css/src/component/alert.css`.
- Public import: LOUIS 컴포넌트 레이어(`styles.layer.css`). 제품은 이것만 소비한다.
- **React 표면 없음 · storybook 스토리 없음.** 그러나 2026-09-06 부터
  `packages/react/test/alert.browser.test.tsx` 가 돈다 — 클래스 마크업을 실제 Chromium 에
  렌더해 세 레이아웃의 패딩·간격·테두리·반경·타이포·한 줄 높이·아이콘 슬롯과, 레이아웃 × 톤
  12조합이 무는 토큰을 계약과 대조한다(32 시험). 아래 Acceptance tests 절의 여러 항목이 그날
  「미래의 계약」에서 **도는 검증**으로 옮겨 갔다.
- Figma: component set 이 `figma/snapshot.json` 에 서 있고 `scripts/verify-figma-parity.mjs` 가
  stroke·effects·속성 축·바인딩·**기하**를 대조한다. 기하 계약은 2026-09-06 에 붙었다 — 그전에는
  `geometry` 키가 없어 `compareComponentGeometry()` 가 즉시 빠져나갔고 패딩 12/18 · 간격 8 ·
  반경 20 을 아무도 코드와 맞춰 보지 않았다. 대조할 `.d.ts` 는 여전히 없으므로 declaration 은
  읽지 않는다 — 정본이 CSS 파일이라는 사실이 계약의 `figmaAhead` 에 적혀 있다.

### 제품 소비처

`.louis-alert` 를 쓰는 자리는 **5개 파일 · 5자리**다. 줄 번호는 제품 `design` 브랜치
`e255d425` 기준이다.

| 자리 | 상수 | 줄 | 톤 | 호출부가 되돌린 것 |
| --- | --- | ---: | --- | --- |
| `app/mypage/upgrade/page.tsx` | `CHECKOUT_ERROR` | 169 | 기본 | 세로 패딩 16 · 전경 · 바깥 여백(아래 24) |
| `app/mypage/upgrade/TossPaymentWindowPanel.tsx` | `CHECKOUT_ERROR` | 70 | 기본 | 세로 패딩 16 · 전경 · 바깥 여백(아래 24) |
| `app/admin/JobMonitor.tsx` | `TOAST` | 144 | 기본 | 반경 999 · 가로 20 · 전경 · 중량 500 · 패밀리 · 바깥 여백(아래 16) |
| `app/inquiry/InquiryClient.tsx` | `TOAST` | 197 | 기본 | 반경 999 · 가로 20 · 성공 톤의 면·테두리 · 전경 · 중량 500 · 패밀리 · 바깥 여백(아래 16) |
| `app/templates/[slug]/page.tsx` | `PREVIEW_BANNER_CLASS` | 67 | 기본 | 반경 12 · 가로 16 · 면·테두리·전경 · 중량 500 · 바깥 여백(아래 24) · 폭 상한 860 |

`__content` 슬롯을 쓰는 자리는 셋(업그레이드 페이지 · 결제창 패널 · 템플릿 미리보기)이고,
`__icon` 과 `__title` 을 쓰는 자리는 **없다.** 슬롯을 생략한 둘은 자식이 하나라 오늘 결과가
같을 뿐이고 규칙이 아니다(Anatomy 참조).

**다섯 자리 전부가 전경색을 되돌리는데, 되돌린 값이 셋으로 갈린다.**

- 둘(업그레이드 페이지 · 결제창 패널)은 앱 라우트가 강제한 다크 면 위라 `text-accent-red-100`
  (`#ffe5e8`)으로 옅게 간다.
- 둘(JobMonitor · InquiryClient)은 제품 빨강 `text-accent-red-500`(`#ff4b59`)을 유지한다.
- 하나(템플릿 미리보기)는 빨강 계열이 아니라 `text-gray-000` 이다.

즉 레시피의 라이트 전경(`#b72431`)이 그대로 쓰인 자리는 **없고**, 대체값도 하나로 모이지
않는다. 톤의 전경 축이 제품에서 한 번도 그대로 쓰이지 않았다는 뜻이다.

**바깥 여백은 다섯 자리 전부가 되돌린다 — 가장 많이 되돌려진 축이다.** 레시피는 `margin: 0` 을
소유하고 소비처는 아래 여백만 다시 붙인다(24 · 24 · 16 · 16 · 24). 이 축은 그래도 열지 않는다:
`margin: 0` 은 치수가 아니라 `<p>` 로 와도 브라우저 기본 여백을 지우는 리셋이고, 붙는 값이
화면마다 갈려 토큰이 될 수 없다. Known deviations 1의 "되돌림이 필요한 축은 채택이 아니다"는
레시피가 **값을 주장한** 축에 대한 기준이고, 리셋은 값을 주장하지 않는다. `inline-size: 100%`
도 같다 — 템플릿 미리보기가 `max-w-[860px]` 로 상한을 씌우지만 그것은 본문 폭 정렬이라 컨테이너
쪽 사정이다.

**세 자리가 중량을 500 으로 올린다.** 레시피 본문은 `body-sm-regular`(400)인데 제품 배너는
medium 이다. 제품의 `type-*` 클래스는 base 레이어라 LOUIS 컴포넌트 레이어에 지므로 유틸리티로
되찾아야 한다.

## Known deviations

1. **세로 패딩이 정본과 4px 다르다.** 정본은 16px 인데 레시피는 `space-control-md`(12px)를
   쓴다. 가로 18과 반경 20에는 전용 토큰을 세워 정본 값을 지켰으면서(반경 쪽은 같은 값의
   토큰이 이미 있었다 — 13번) 세로만 기존 계단으로 접었고, 그 결과 배너 높이가 정본보다 8px 낮다. 소비처 다섯 중 둘이 `py-8` 로 되돌린다 —
   **되돌림이 필요한 축은 채택이 아니다.** 해소하려면 `layout-alert-inset` 과 짝이 되는 세로
   토큰을 세우거나, 12px 을 정본으로 확정하고 제품 두 자리를 옮겨야 한다. 둘 중 어느 쪽인지는
   아직 정하지 않았다.

2. ~~**아이콘 슬롯의 광학 정렬이 동작하지 않는다.**~~ **해소됨(2026-08-27).**
   `calc((line-height − icon-size) / 2)` 로 첫 줄 가운데에 맞추려 했는데
   `--louis-typography-body-sm-regular-line-height` 가 **단위 없는 `1.5`** 였다. `1.5 − 16px` 은
   타입이 맞지 않아 선언 전체가 computed-value time 에 무효가 되고, `margin-block-start` 는
   초깃값 **0** 으로 떨어졌다. Chromium 실측이 `0px` 이었고(의도값은 (21 − 16) / 2 = 2.5px),
   같은 실측에서 **앞에 둔 유효한 fallback 선언까지 함께 무효화된다**는 것도 확인했다.
   적어 둔 두 해소 경로 중 **앞쪽**을 택했다 — 글자 크기 토큰을 곱해 식을 길이로 닫는다:
   `calc((typography-body-sm-regular-font-size*-line-height − icon-size-sm) / 2)`
   = (14px × 1.5 − 16px) / 2 = **2.5px**. 뒤쪽(타이포 토큰에 px 행간 축을 세우는 것)은 token
   source 변경이라 Figma 변수까지 따라와야 하므로 택하지 않았다. 같은 탐침을 다시 돌려 옛 식
   `0px` · 새 식 `2.5px` 을 확인했고, 새 식은 앞에 둔 `4px` fallback 도 삼키지 않는다.

3. **`data-tone` 을 쓰는 제품 소비처가 0이다.** 다섯 자리 전부 기본 danger 를 쓴다. info 가
   필요한 한 자리(템플릿 미리보기)조차 `data-tone="info"` 대신 면·테두리·전경 셋을 호출부에서
   직접 준다 — 면만 primary-500 **12%** 틴트이고 테두리는 primary-500 **32%**, 전경은 틴트가
   아니라 `text-gray-000` 이다. 정본 info 는 불투명 라이트블루라 그 화면의 표면과 맞지 않는다.
   톤 축 넷 중 셋이 **한 번도 렌더된 적이 없다.**

4. **light 에서 success 3.90 · warning 3.43 으로 WCAG AA(4.5)에 미달한다.** 원인은 전경이
   `{tone}.700` 이라는 것이다. DS 에 이미 있는 `color-fg-{tone}`(= `{tone}.900`)를 쓰면 같은 면
   위에서 success 9.55 · warning 10.83 · info 11.69 가 된다. dark 는 전경이 `{tone}.100` 이라
   같은 문제가 없다. **700 단계를 고른 근거가 CSS 에도 token source 에도 적혀 있지 않다** —
   확인되지 않았다.

5. **`contrastPairs` 에 `color-alert-*` 쌍이 하나도 없다.** 선언된 14쌍 중 넷이
   `color-fg-{tone}` / `color-bg-{tone}` 인데 alert 는 그 토큰을 쓰지 않으므로 게이트를 비켜
   간다. 4의 수치는 아무도 재고 있지 않다.

6. **면 토큰 셋이 이미 있는 토큰과 값이 같다.** `color-alert-info-surface` 는 `color-bg-info` 와
   같은 `blue.050`(dark 는 `blue.900`)이고 success·warning 도 각각 `color-bg-success` ·
   `color-bg-warning` 과 같다. 실제로 새로운 값은 danger 면(알파 12%)뿐이고 그것이 제품에서 온
   값이다. 나머지 셋은 별도 토큰을 세울 근거가 **값에 없다** — 이름만 갈라져 있다.

7. **아이콘·제목 슬롯을 쓰는 소비처가 0이다.** "색만으로 뜻을 전달하지 않는다"는 계약이 슬롯을
   선택으로 두고 문장에 기대는데, 오늘 그 문장이 톤을 말하는지 검증하는 것이 없다.

8. ~~**닫기와 액션 슬롯이 없다.**~~ **절반 해소됨(2026-09-06).** 닫기 슬롯
   (`.louis-alert__dismiss`)이 섰다 — 제품에 그 요구가 실재한다는 것이 확인됐기 때문이다:
   `PastDueBanner` 가 `useState` 로 자기를 지우는 X 버튼을 갖는다(46라우트에 얹히는 그 띠다).
   **액션 슬롯은 여전히 없다.** 같은 띠가 문구 옆에 `/mypage` 로 가는 밑줄 링크를 두는데,
   그것을 슬롯으로 열려면 링크의 색·중량·밑줄 계약을 알림이 소유해야 하고 그 정본이 아직
   없다(제품은 `fontWeight: 600` + `textDecoration: underline` 을 인라인 style 로 준다).
   그 축은 열지 않았고, 소비처가 `__content` 안에 넣는다.

9. **같은 계열인데 덮지 못한 자리가 다섯 벌 더 있다.** 노드 캔버스의 다섯 노드 파일이
   `PROMPT_ERROR_BANNER` 라는 같은 이름의 배너를 **각자 정의**하며 클래스 문자열이 다섯 벌 모두
   같다(`BgmNode.tsx` · `EditNode.tsx` · `ImageNode.tsx` · `TtsNode.tsx` · `VideoNode.tsx`).
   값이 이 레시피와 다르다 — 간격 8은 같지만 패딩 8/8 · 반경 12 · 면 `accent-red-500` 8% ·
   테두리 대신 `--louis-hairline-inset` · 최소 높이 28이다. 이관하려면 패딩·반경 축을 열고
   테두리 대 헤어라인 판정을 다시 해야 하므로 이 변경 단위 밖이다.

10. **아이콘 슬롯의 크기가 `block` 에서만 Figma 와 CSS 에서 다르다.** Figma 의 Icon 부품은
    block 네 변형에서 **16×21** 이고 CSS 는 **16×16** 이다. 같은 목표(글리프를 첫 줄 가운데에
    세우는 것)를 두 표면이 다른 방법으로 노렸다 — Figma 는 아이콘 프레임을 줄 높이만큼 늘려
    세로 가운데 정렬로 얻었고, CSS 는 16 정사각에 위쪽 여백 2.5px 을 준다. 2번이 해소돼
    **글리프가 서는 자리는 두 표면이 같지만 부품 크기 자체는 계속 다르다.**
    **2026-09-06 에 범위가 좁아졌다** — `inline`·`banner` 는 행을 가운데 정렬하므로 두 표면 모두
    16×16 이고, 어긋나는 것은 block 뿐이다. 그래서 기하 계약은 Icon 의 `width` 만 대조하고
    `height` 는 대조하지 않는다(그 사실이 `verify-figma-parity.mjs` 의 alert 계약 주석에 있다).

11. **같은 내용에서 Figma 상자가 CSS 보다 2px 낮다.** Figma 의 stroke 는 `INSIDE` 정렬이라
    1px 테두리가 상자 안쪽에 그려지는데, CSS 는 `box-sizing: border-box` 에 높이가 auto 라
    테두리가 바깥으로 더해진다. 두 줄짜리 배너가 Figma 66px · CSS 68px 이다.
    **「계약에 geometry 키 자체가 없다」는 부분은 2026-09-06 에 해소됐다** — 세 레이아웃의
    패딩·간격·반경·layoutMode 와 Icon 슬롯 폭이 이제 매 실행 대조된다. 남은 것은 높이다:
    계약은 **높이와 폭을 여전히 보지 않는다.** Figma 표본은 제목과 본문을 둘 다 켠 두 줄짜리이고
    계약의 `height` 는 한 줄 높이라 **같은 것을 재지 않는 두 수**이기 때문이고, 폭은 컨테이너가
    정한다(`inline-size: 100%`). 위의 2px 은 그래서 여전히 아무도 재지 않는다.

12. **문서가 인용하는 소비처 넷이 evidence lock 에 없다.** (2026-09-06 에 담지자 둘이 더
    늘었다 — `analytics/shared.tsx` 의 `InsufficientNotice` 와 `components/PastDueBanner.tsx` 도
    같은 이유로 락에 없다.) 업그레이드 페이지 · 결제창 패널 ·
    JobMonitor · 템플릿 상세 넷은 `migration/product-evidence.lock.json` 에 없어, 제품이 그
    자리를 바꿔도 게이트가 알려 주지 않는다. 그래서 위 표는 좌표를 `<파일>:<줄>` 인용 형태로
    적지 않았다 — citation 게이트가 락에 없는 파일의 인용을 실패로 만들기 때문이다.
    `node ./scripts/build-product-evidence.mjs` 로 락을 넓히는 것이 해소 경로다.

13. **`radius-alert` 가 이미 있는 토큰과 값도 primitive 도 같다.** `radius-card-lg` 가 20px 이고
    둘 다 `primitive.radius.20` 을 가리킨다. 6번(면 토큰 셋이 기존 토큰과 값이 같다)과 같은
    종류의 중복이며, 새 값이 없는데 이름만 갈라진 자리다. 가로 인셋 18(`layout-alert-inset`)은
    사정이 다르다 — 그 값은 계단에 없어 전용 토큰이 필요했다. 해소하려면 `radius-card-lg` 를
    직접 쓰거나, 배너 반경이 카드 반경과 독립으로 움직여야 하는 이유를 적어 두어야 한다. 오늘
    그 이유는 **적혀 있지 않다.**

14. **띠의 쌓임 순서를 LOUIS 가 소유하지 않는다.** 제품 담지자(`PastDueBanner`)는
    `position: fixed` · `top: 0` · `zIndex: 9999` 를 인라인 style 로 주고, 그 값은 LOUIS 의
    `layer-*` 계단 밖이다. `banner` 레이아웃은 그리는 법만 갖고 붙는 자리는 갖지 않는다 —
    그것이 **결손이 아니라 판정**인 이유는 9999 가 GNB·모달·토스트 위를 덮는 순서를 이미 만들고
    있어서, 그 순서를 계단으로 옮기면 겹침이 바뀔 수 있기 때문이다. **옮기기 전에 쌓임 순서를
    실측해야 한다.** 오늘 그 실측은 없다.

15. **`inline` 의 부모 문맥 면 세 종 중 하나만 축이 됐다.** 제품 `InsufficientNotice` 는
    `surface` prop 으로 `plain` · `innerPanel` · `donutCard` 셋을 갖는다. 이 레이아웃이 담은
    것은 `plain` 뿐이다.
    · `plain` 의 `border-top` 은 알림의 테두리가 아니라 **위 목록과 가르는 구분선**이라 부모가
      소유한다 — 그래서 무테로 담았다.
    · `innerPanel` 과 `donutCard` 는 서로 **패딩 12/14 · 반경 10 · `--louis-hairline-inset` ·
      안쪽 면이 전부 같고**, 갈리는 것은 `border-top` 의 유무와 `flex: 1` 둘뿐이다. 그 둘은
      목록·카드 쪽 사정이지 알림의 축이 아니다. 그러므로 **면 셋이 아니라 「면 있는 인라인」
      한 축**이 후보인데, 그 값(패딩 12/14 · 반경 10 · 헤어라인)은 인사이트 카드의 안쪽 패널이
      이미 소유하는 값과 같다. **알림이 그것을 다시 소유하면 같은 값을 두 곳이 갖는다.**
      그래서 카드 쪽 정본이 서기 전에는 열지 않는다. 오늘 제품 12자리 중 이 축이 필요한 것은
      셋(`PerformanceTab` 둘 · `AudienceTab` 하나)이다.

## Acceptance tests

**2026-09-06 부터 절반이 실제로 돈다.** `packages/react/test/alert.browser.test.tsx` 가 32
시험으로 아래 1·2·3·8·9·10·(4 의 절반) 과 세 레이아웃의 패딩·간격·테두리·반경·타이포·한 줄
높이·닫기 위치를 잰다. 나머지(6·7·11·12·13·14·15)는 여전히 **미래의 계약**이다 — 무엇이 돌고
무엇이 안 도는지를 이 절이 구분해 적는다.

아래 항목은 별도 표시가 없으면 `block` 을 말한다. 세 레이아웃의 값은 Specification 표에 있고,
그 표의 모든 칸을 위 테스트가 계약(`figma/components.measured.json` 의 `alert.sizes`)과 대조한다.

16. **(도는 검증)** `data-layout` 셋이 각자 계약의 패딩·간격·테두리·반경·글자 크기·행간·한 줄
    높이·아이콘 한 변·아이콘 광학 보정을 만든다.
17. **(도는 검증)** 레이아웃 × 톤 12 조합이 계약이 지목한 토큰을 문다 — `block` 은
    `color-alert-{tone}-*` 셋, `banner` 는 `color-bg-{tone}`·`color-fg-{tone}`, `inline` 은
    네 톤 모두 면 없음 + `color-fg-secondary`. **네 톤이 같다는 것이 인라인의 계약이므로**
    한 톤이 조용히 갈리면 이 시험이 잡는다.
18. **(도는 검증)** `banner` 의 닫기가 절대 위치이고 오른쪽 끝에서 12px 떨어지며, **닫기를
    넣어도 본문이 같은 자리에 선다** — 흐름에 남으면 가운데 정렬된 문구를 밀어낸다. 두 벌
    (닫기 있음·없음)을 나란히 렌더해 비교해야만 참·거짓이 갈리는 명제라 그렇게 잰다.

1. 세로 패딩 12 · 가로 패딩 18 · 슬롯 간격 8 · 테두리 1px solid · 반경 20 이 Specification 표와
   같다.
2. 본문이 14px / 21px / 400 / letter-spacing −0.14px 이고, `__title` 이 같은 크기·행간에 중량만
   500 이다.
3. 아이콘도 제목도 없는 한 줄 배너의 높이가 **47px** 이다.
4. 네 톤의 면·테두리·글자가 tone 표와 같고, **네 톤이 light·dark 두 테마 모두에서 서로 다른
   색을 만든다.**
5. `data-tone` 을 주지 않은 배너의 면·테두리·글자가 danger 와 바이트 단위로 같다.
6. `box-shadow` 가 `none` 이고 `transition`·`animation` 선언이 0이다.
7. `margin` 이 0이고 폭이 컨테이너 폭과 같다.
8. `__icon` 이 16×16 이고 `flex: none` 이라 좁은 폭에서도 줄어들지 않으며, 색이 루트의
   `currentColor` 를 따라간다.
9. `__icon` 의 계산된 `margin-block-start` 가 **2.5px** 이라 16px 아이콘이 21px 첫 줄의 광학
   가운데에 선다.
10. `__content` 가 `flex: 1 1 auto` · `min-inline-size: 0` 이라, 끊을 수 없는 긴 문자열을 넣어도
    배너 폭이 컨테이너를 넘지 않는다.
11. `word-break: keep-all` 이라 한국어 문장이 어절 중간에서 끊기지 않고, `overflow-wrap:
    break-word` 라 긴 영문 토큰은 끊긴다.
12. `forced-colors: active` 에서 테두리가 `currentColor` 1px 실선으로 남는다.
13. 루트 DOM 에 `role` 속성이 없다 — 컴포넌트가 붙이지 않는다.
14. hover·focus·active·disabled 선언이 0이고 `cursor` 가 기본값이며 루트가 포커스를 받지 않는다.
15. 네 톤의 글자 대 면 대비를 light·dark 에서 재고 tone 표의 수치와 같다. light 의 success ·
    warning 이 4.5 미달인 것은 **알려진 결함이며 이 검증이 그것을 드러내는 자리**다.
