---
id: toast
status: experimental
authority: normative
summary: 방금 한 일의 결과를 짧게 알리고 스스로 사라집니다.
---

# Toast

사용자가 방금 한 일의 결과를 **짧게 알리고 스스로 사라진다.** 확인을 요구하지 않고, 흐름을 끊지
않으며, 놓쳐도 되는 정보만 담는다. 놓치면 안 되는 것은 toast가 아니다.

## Availability

| Surface       | 상태           | 근거                                                      |
| ------------- | -------------- | --------------------------------------------------------- |
| Web           | `partial`      | public export와 acceptance test; visual regression과 제품 소비 증거 없음 |
| Figma         | `done`      | component set(Tone). 계약이 모든 property 를 pin 한다. 기하는 양방향이다 — `surface-geometry.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                   |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                |

## When to use

- 되돌릴 수 있는 작업의 완료 — "저장했습니다", "복사했습니다".
- 배경에서 끝난 작업의 결과 — "내보내기가 끝났습니다".

쓰지 않는 경우.

- **확인이나 선택이 필요하면** [Dialog](dialog.md)다. toast는 스스로 사라지므로 답을 받을 수 없다.
- **사용자가 반드시 읽어야 하면** 화면에 남는 자리를 준다. toast는 놓쳐도 되는 것만 담는다.
- **폼 입력 오류**는 해당 필드 옆에 둔다. 화면 반대편에서 사라지는 알림으로는 어디를 고쳐야 할지
  알 수 없다.
- **진행률**은 toast가 아니다. 자동으로 사라지면 진행이 끝난 것처럼 읽힌다.

## API

```tsx
import { ToastProvider, useToast } from "@klipse-design/react";

function App() {
  return (
    <ToastProvider>
      <Editor />
    </ToastProvider>
  );
}

function Editor() {
  const { toast } = useToast();
  return <Button onClick={() => toast("저장했습니다")}>저장</Button>;
}
```

`toast(message)` 또는 `toast({ message, tone, duration })`. 반환값은 그 toast를 지우는 함수다.

## Anatomy

1. Viewport — 화면 하단 중앙에 고정된 live region. 항상 DOM에 있고 비어 있을 수 있다
2. Toast — 메시지 하나
3. Message — 한 줄 텍스트

`callout` layout에서는 2·3 사이에 두 조각이 더 선다.

4. Content — 제목/본문 덩어리(세로, 간격 2)
5. Action — 후행 액션 하나. **Button이 아니다**(아래 Specification의 사유)

## Properties

`useToast().toast(input)`의 입력.

| 필드       | 값                     | 기본값    | 설명                                        |
| ---------- | ---------------------- | --------- | ------------------------------------------- |
| `message`  | string                 | **필수**  | 한 줄. 문자열만 받는다                      |
| `tone`     | `neutral`, `danger`    | `neutral` | `danger`는 assertive로 알린다               |
| `duration` | number (ms)            | `4000`    | 자동 소멸까지. `0`이면 자동으로 사라지지 않는다 |
| `title`    | string                 | 없음      | 있으면 `message`가 본문이 되고 layout이 `callout`이 된다 |
| `action`   | `{ label, onAction, dismissOnAction? }` | 없음 | 후행 액션 하나. 누르면 기본으로 toast를 닫는다 |
| `layout`   | `base`, `callout`      | 유추      | 비우면 `title`·`action`의 유무가 정한다. Figma의 `Layout` 축과 1:1로 맞추기 위해 명시도 열어 둔다 |

`message`가 `ReactNode`가 아니라 **string인 이유**: live region은 텍스트를 읽는다. 요소를 넣으면
보조 기술이 읽는 내용과 화면에 보이는 것이 갈린다. 링크나 버튼이 필요하면 toast가 아니다.

## Hierarchy와 variants

`tone` 둘뿐이다. `neutral`은 결과 보고이고 `danger`는 실패 보고다. 성공을 따로 두지 않는다 —
toast가 떴다는 사실 자체가 이미 "그 일이 일어났다"이므로 색으로 한 번 더 말할 필요가 없다.

**`layout` 축이 하나 더 있다(2026-09-06).** `base`는 한 줄 메시지, `callout`은 제목/본문 두 줄과
액션 슬롯이다. 크기 사다리가 아니라 **표면에 담기는 것**이 달라지는 축이다 — 그래서 이름이
`size`가 아니라 `layout`이다.

제품 정본은 캔버스의 온보딩 힌트 두 벌이다. `CanvasConnectHint`와 `CanvasNextStepHint`가
한 `CALLOUT` 상수를 공유하고 문구만 다르며, 표면 원장이 뒤엣것을 그 사실로 `scoped` 처리해 두었다.

**표면·그림자·흐림은 두 layout이 같다.** 세 값 모두 제품과 갈리는데(제품은 고정
`palette-gray-900` 64% · `blur(4px)` · `elevation-menu`), 제품 자신의 주석이 그 표면을
「토스트처럼 반전 테마 — 라이트에선 어둡게, 다크에선 밝게」라고 적어 놓고 **고정 팔레트**를 쓰고
있다. 코드와 주석이 갈리는 자리이지 DS가 두 표면을 가질 이유가 아니다. layout이 바꾸는 것은
기하와 슬롯뿐이다.

## States

| 상태     | 표현                                       | 비고                                     |
| -------- | ------------------------------------------ | ---------------------------------------- |
| entering | CSS `animation` (마운트 시 1회)            | 아래에서 올라오며 나타난다. 상태 속성을 두지 않는다 — 마운트가 곧 신호다 |
| visible  | 상태 속성 없음                             | 타이머가 돈다                            |
| paused   | `data-louis-paused="true"`                   | 포인터가 얹혀 있거나 안에 focus가 있다   |

- **포인터가 얹히거나 안에 focus가 들어오면 타이머가 멈춘다.** 읽는 중에 사라지면 알림이 아니다.
  떠나면 남은 시간부터 다시 흐른다 — 처음부터 다시 세지 않는다.

## Interaction and responsive behavior

- 화면 **하단 중앙**에 쌓인다. 최신이 아래다 — 시선이 마지막으로 머문 곳에 가장 새 소식이 온다.
- **동시에 최대 3개**를 보여준다. 초과분은 대기했다가 자리가 나면 들어온다.
- **modal 위에 뜬다.** `layer-critical`을 쓴다. dialog 안에서 일어난 일의 결과가 dialog 뒤로
  숨으면 안 된다.
- 포인터를 받는다 — 읽는 동안 멈추려면 얹을 수 있어야 하기 때문이다. 이 점이 [Tooltip](tooltip.md)과
  정반대다.

## Content

- 한 문장, 마침표 없음. "저장했습니다" — "저장이 완료되었습니다."가 아니다.
- **결과를 말하고 방법을 말하지 않는다.** "3개 항목을 지웠습니다"이지 "삭제 API 호출 성공"이 아니다.
- 실패는 무엇이 안 됐는지 말한다. "저장하지 못했습니다"이지 "오류가 발생했습니다"가 아니다.

## Accessibility

- Viewport는 항상 DOM에 있는 live region이다. **나중에 만들면 읽히지 않는다** — 보조 기술은
  region이 존재한 뒤의 변화만 감지한다.
- `neutral`은 `role="status"`(polite), `danger`는 `role="alert"`(assertive)로 알린다. 두 tone은
  **서로 다른 region**에 들어간다. 한 region의 `aria-live`를 바꾸면 그 시점의 변경이 유실된다.
- toast는 focus를 가져가지 않는다. 사용자가 하던 일을 끊지 않는다.
- `duration: 0`이 아닌 한 자동으로 사라지므로 **닫기 버튼을 두지 않는다.** 대신 포인터·focus로
  멈춘다. 닫기 버튼은 focus 순서에 끼어들고, 사라지는 대상에 focus를 두면 focus가 소실된다.
- **예외 — 사라지지 않는 callout 은 닫기를 갖는다(2026-10-07, 소유자).** 할 일이 끝날 때까지 떠 있는 안내(`duration: 0` 의
  `data-layout="callout"`)는 사용자가 치울 길이 필요하다. 행동 단추와 닫기를 `.louis-toast__actions` 로 묶고 닫기는
  `.louis-toast__close`(누르는 칸 28 · 쉬는 불투명도 72%)다. 닫기에는 `aria-label`(「안내 닫기」)을 준다. 제품 캔버스 도움말
  작업 브랜치의 화면 밖 안내 · 영상 입력 안내가 근거다. Figma 의 callout 두 변형에도 `Actions`(행동 단추 + 28 칸 `Close`, `icon/x` 14)를 세웠다(2026-10-07). 닫기를 켜고 끄는 속성은 없어 늘 보인다.

- **두 `role` 모두 제품에 선례가 있다.** `danger`의 assertive는 에디터 오류 토스트가 `role="alert"
  aria-live="assertive"`로 띄우고(`EditorProjectWorkspace.tsx:1115-1116`), `neutral`의 polite는 모달
  안내 토스트가 `role="status"`로 띄운다(`VideoEditModal.tsx:15021`). **live region을 가진 제품 토스트
  표면은 이 둘뿐이고**, 나머지 글래스 토스트 계열은 보조 기술에 **아무것도 알리지 않는다.** 그쪽을
  기준으로 삼으면 이 절의 `role` 규정이 근거 없는 발명처럼 읽히지만, 제품은 두 role을 이미 쓰고 있다.

## Specification

| 항목        | 값                                                       |
| ----------- | -------------------------------------------------------- |
| 위치        | 하단 중앙 고정, 아래 여백 `space-layout-section` 24px     |
| 스택 간격   | `space-control-sm` 8px                                   |
| 동시 표시   | 3                                                        |
| 타이포      | `typography-body-sm-regular` (14px)                      |
| padding     | `space-control-md` 12px / `space-toast-inline` 20px      |
| radius      | `radius-overlay` 16px                                    |
| 배경        | `color-bg-inverse-translucent` — **70% 반투명**   |
| 배경 흐림   | `backdrop-filter: blur(--louis-blur-toast)` 16px · `saturate(1.3)` |
| 전경        | `color-fg-on-inverse`                            |
| danger 배경 | `color-bg-danger`                         |
| danger 전경 | `color-fg-danger`                         |
| 그림자      | `elevation-toast` — drop 1겹                             |
| layer       | `layer-critical`                                         |
| 최대 폭     | 420px                                                    |
| 자동 소멸   | 4000ms                                                   |

### `layout = callout`

| 항목            | 값                                                      |
| --------------- | ------------------------------------------------------- |
| 높이            | padding 12+12 + 내용 — 내용이 정한다. 제목과 본문이 한 줄씩일 때 65(내용 41, `toast.sizes.callout.height`) |
| 폭              | 내용에 맞춘다(제품 `w-fit`). 상한은 아래 최대 폭 |
| padding         | `space-control-md` 12 / **좌 `space-control-lg` 16 · 우 `space-control-md` 12** |
| gap             | `space-control-lg` 16 (본문 덩어리 ↔ 액션)              |
| 제목            | `typography-body-sm-medium` (14/21)                     |
| 본문            | `typography-caption-regular` (12/18) · 불투명도 72%      |
| 제목/본문 간격  | `space-overlay-item-gap` 2                              |
| 액션 높이       | 26 (선언하지 않는다 — caption 18 + `space-control-xs` 4+4) |
| 액션 padding    | 4 / `space-control-md` 12                               |
| 액션 radius     | `radius-control-sm` 8                                    |
| 액션 면         | 전경색 12% · hover 24%                                   |
| 최대 폭         | `min(720px, 가용 폭)`                                    |

**좌우 padding이 갈리는 이유.** 액션이 자기 padding을 갖고 있어 오른쪽을 4 줄여야 시각 여백이
좌우로 같아 보인다. 광학 보정이며 실수가 아니다.

**액션이 `Button`이 아닌 이유.** 제품은 높이 28을 리터럴로 박아 두었는데 28은 컨트롤 사다리
(40·32·24, [DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md) ·
[DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md))에 없고, 이 저장소의 28
셋(`layout-tab-height` · `layout-settings-segment-height` · `layout-inspector-control-height`)은
전부 다른 것을 이름 짓는다. 네 번째 28 토큰을 세우면 Figma 변수까지 함께 열어야 하는데 그럴
사유가 없어 **높이를 선언하지 않고 내용에서 나오게 뒀다** — 26이 그 결과다. 제품이 물 때 2px
줄어드는 것이 이 선택의 값이다.

**`base`는 `display: flex`가 아니었다.** 한 줄 텍스트 하나뿐이라 아무도 눈치채지 못했고, 이 축을
열자마자 본문과 액션이 세로로 쌓였다(실측 높이 91, 계약 65). 배치는 `callout` 규칙이 소유한다.

`color-bg-inverse`와 `color-fg-on-inverse`는 이 컴포넌트가 첫 소비자다. 기존
`color-fg-inverse`는 두 모드 모두 `neutral-0`이라 **다크에서 밝아지는 반전 표면 위에서는
쓸 수 없다** — 그 토큰은 `action-primary` 위 텍스트를 위한 것이다.

## Effects

Figma에서 이 컴포넌트가 갖는 effect를 종류와 순서까지 고정한다. parity 게이트가 매 실행 대조하며,
`INNER_SHADOW`가 `DROP_SHADOW`로 바뀌거나 blur radius가 변수에서 풀려 숫자로 박히면 실패한다.

| 순서 | 종류 | 값 |
| --- | --- | --- |
| 1 | `DROP_SHADOW` | y 8 · blur 20 · spread 0 · 검정 16% |
| 2 | `BACKGROUND_BLUR` | radius가 `blur/toast`(16) 변수에 묶인다 |

글래스 베벨 inset 2겹은 owner 결정으로 제거했다 — 이 디자인 시스템에 글래스 섀도우 개념을 두지
않는다.

**`layout` 축은 effect를 바꾸지 않는다.** Figma component set의 effect는 변형이 아니라 역할
(`self`) 하나가 갖는 값이고, parity 계약이 그것을 문자열 하나로 잡는다. layout이 자기 그림자나
흐림을 가지려면 컴포넌트를 둘로 쪼개야 하는데 둘은 같은 표면이다.

## Implementation

- `packages/react/src/toast/toast.tsx`
- `packages/css/src/component/toast.css`
- overlay primitive를 쓰지 않는다. toast는 anchor가 없고 focus를 가져가지 않으며 바깥 클릭과
  무관하다 — positioner·dismissable layer·focus scope 중 어느 것도 해당하지 않는다. Provider가
  자기 viewport를 만든다.

## Known deviations

| 항목 | 상태 | 사유 |
| --- | --- | --- |
| Figma component set | 없음 | DS-F-006 대상 |
| 동시 표시 3개 | 임의값 | 자동 소멸 4초 안에 읽을 수 있는 수를 근거로 정했으나 실측이 아니다 |
| 실행 취소 액션 | 없음 | "되돌리기"를 담으려면 toast가 상호작용 대상이 되고 focus 정책이 통째로 달라진다. 별도 판정이 필요하다 |
| 제품의 backdrop blur | **채택** | 반투명 70% 표면과 `blur(16px) saturate(130%)`를 그대로 쓴다. 불투명 면으로 대체하면 뒤 콘텐츠가 사라져 toast가 떠 있는 물체가 아니라 판이 된다. **10px 이 아니다** — 배포본의 앱 홈과 캔버스 홈이 인라인 style 로 16 을 얹어 클래스 선언을 이기며 화면에 보이는 것은 그쪽이다(`packages/css/src/component/toast.css:36-39` 주석). Figma에서도 `BACKGROUND_BLUR`로 서 있고 radius를 `blur/toast` 변수에 문다 |
| 제품의 단일 슬롯 교체 | 미채택 | 제품은 새 메시지가 이전 것을 지운다. 자동 소멸과 겹치면 읽기 전에 사라지므로 스택으로 바꿨다 |
| 퇴장 전환 | 없음 | 진입만 애니메이션한다. 퇴장을 `animationend`로 걸면 그 이벤트가 오지 않는 경우(요소가 화면 밖, 애니메이션 미적용) 사라지지 않고 남는 실패 모드가 생긴다. 전환보다 **반드시 사라지는 것**이 우선이다 |

| 제품의 에디터 오류 토스트 | 미채택 | 제품에는 이 문서가 규정한 표면 말고 **에디터 오류 전용 토스트가 하나 더** 있다 — 하단 고정 `bottom 32px` · z-index **1400** · padding `11px 20px` · radius **999px**(알약) · 최대 폭 `min(92vw, 440px)` · 가운데 정렬 · 배경 `gray-900` **82%** + `blur(12px)` · 그림자 `0 10px 28px` 검정 30%, 타이포는 소비처가 붙이는 **14px medium**(`EditorProjectWorkspace.tsx:156-164`, 소비처 `:1108`). 이 문서의 radius 16px · 70% 반투명 · blur 16px · 420px · 14px regular과 **전부 어긋난다.** 알약 모양 토스트를 제품 표준으로 착각하면 틀린다 — 이쪽이 한 곳짜리 예외다 |
| 제품의 `pointer-events: none` | 미채택 | 에디터 오류 토스트는 포인터를 아예 받지 않는다(`EditorProjectWorkspace.tsx:162`). 그러면 얹어서 타이머를 멈출 수 없고, **닫기 버튼을 두지 않는 근거가 통째로 무너진다** — States와 Accessibility가 「포인터·focus로 멈춘다」에 기대고 있기 때문이다. Figma에서 이 표면을 그대로 베끼면 hover 정지 계약이 조용히 사라진다. 이 문서는 포인터를 받는 쪽을 택한다 |
| reduced-motion 대체 | 미규정 | 에디터 오류 토스트만 `prefers-reduced-motion: reduce`에서 `animate-none!`을 걸고(`EditorProjectWorkspace.tsx:163`), 진입·퇴장은 240ms `ease`다(`:159-160`). **저장소에서 reduced-motion을 처리하는 토스트 표면은 이 하나뿐이다** — 모달 `editorToast`(220ms)에도, 글래스 토스트 계열(280ms)에도 감소 모션 규칙이 없다. 이 문서는 진입 애니메이션의 reduced-motion 대체를 아직 적지 않았다 — 나머지 제품 토스트를 근거로 삼으면 대체 없는 채로 굳는다 |
| 실측 하네스 커버리지 | 구멍 | 실측 변형 목록의 `editorToast`(`vemClass.ts:901-915`)는 radius 999 · blur **8px** · 그림자 없음 · z-index **10100** · padding `12px 20px` · 배경 `gray-900` **72%**로, 위 에디터 오류 토스트와 **다른 세 번째 표면**이다(이 문서는 70%라고 적고 있었는데 `ae8fd627`·`5a67d692` 두 앵커에서 모두 72% 다 — 좌표도 `:672-686` 로 엉뚱한 상수를 가리키고 있었다. 둘 다 재고정에서 바로잡았고, 「배경만 이 문서와 같다」는 문장은 그래서 성립하지 않는다). 게다가 하네스는 이 항목을 `uses: 0`으로 적었지만 제품은 실제로 `VideoEditModal.tsx:15021`에서 `role="status"`로 렌더한다 — **집계가 소비처를 놓쳤다.** 에디터 오류 토스트는 더해서 아예 없다: 하네스에 `EditorProjectWorkspace.tsx` 항목이 **0개**다. 제품 토스트를 2종으로 세면 틀린다 — 최소 3종이고, 값이 가장 크게 벌어진 하나가 통째로 집계 밖이다 |

## Acceptance tests

1. `toast()`를 부르면 메시지가 나타난다.
2. `duration`이 지나면 스스로 사라진다.
3. `duration: 0`이면 사라지지 않는다.
4. 반환된 함수를 부르면 사라진다.
5. 포인터를 얹으면 타이머가 멈추고, 떠나면 다시 흐른다.
6. 동시 표시가 3개를 넘지 않고 초과분은 자리가 나면 들어온다.
7. `neutral`은 `role="status"`, `danger`는 `role="alert"` region에 들어간다.
8. 두 region이 toast 없이도 처음부터 DOM에 있다.
9. toast가 focus를 가져가지 않는다.
10. 최신 toast가 목록의 마지막에 온다.
11. Provider 없이 `useToast`를 쓰면 명확한 오류를 던진다.

## Migration and changelog

- 2026-08-15 — 첫 공개. 세 화면 실측에서 20개 파일이 toast를 쓰는데 공용 컴포넌트가 없었고,
  같은 정의가 최소 2벌 중복돼 있었다.
