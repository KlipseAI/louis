---
id: dialog
status: experimental
authority: normative
summary: 결정을 받거나 짧은 작업을 마칠 때 맥락 위에 띄우는 창입니다.
---

# Dialog / Modal

현재 맥락 위에서 사용자의 결정을 받거나 짧은 작업을 완료할 때 쓰는 차단형 overlay다. 이 문서는
과거 여러 Modal 구현의 평균이 아니라 이 저장소가 따라야 할 **규범 계약**이다. 특히 독립
비디오 편집 프로젝트는 Dialog가 아니라 page-owned Workspace다.

## Availability

| Surface       | 상태           | 근거                                           |
| ------------- | -------------- | ---------------------------------------------- |
| Web           | `partial`      | `Dialog` compound public export, 실브라우저 회귀 15건 |
| Figma         | `done`      | component set(`Size` × `Tone` × `Layout`, 시트 손잡이 `Layout=grabber` 2026-10-08). `fullscreen` 은 표면이 뷰포트 자체라 고정 폭 variant 로 그릴 수 없어 **사유와 함께 Figma 축에서 뺐고**, 반대로 `sheet` 는 Figma 에만 있다 — 둘 다 계약이 선언한다. 기하는 양방향이다 — `surface-geometry.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                        |
| Maturity      | `experimental` | 시각 회귀와 수동 screen-reader 검토가 아직 없음 |

## When to use

- 사용자가 현재 작업을 계속하기 전에 확인·취소 중 하나를 선택해야 할 때
- 삭제, 덮어쓰기, 결제처럼 결과가 크고 별도 확인이 필요할 때
- 현재 페이지 맥락을 유지한 채 완료할 수 있는 짧고 유한한 폼을 제공할 때
- 캔버스의 한 노드에서 임시로 영상 편집기를 열고, 닫으면 원래 캔버스로 돌아갈 때

다음에는 사용하지 않는다.

- 지속적으로 사용하는 편집기, 대시보드, 프로젝트 상세는 페이지 또는 Workspace로 만든다.
- 트리거 주변의 짧은 선택은 [Menu / Popover](menu-popover.md)를 사용한다.
- 진행 상황 알림만 필요하면 Toast/Status를 사용한다.
- 내용이 여러 단계이거나 URL·새로고침·뒤로가기를 독립적으로 가져야 하면 route를 사용한다.
- 화면이 좁다는 이유만으로 Workspace를 `aria-modal` Dialog로 바꾸지 않는다.

## Surface classifier

겉모양이 전체 화면이라고 같은 컴포넌트가 아니다. 아래 질문 중 하나라도 Workspace 쪽이면 Dialog API에
`portalContainer`를 넣어 의미를 바꾸지 말고 별도 셸을 사용한다.

| 질문/계약              | Modal Dialog                         | Docked / Route Workspace                               |
| ---------------------- | ------------------------------------ | ------------------------------------------------------ |
| 사용자 맥락            | 원래 화면 위의 임시 작업             | URL이 소유하는 주 작업                                 |
| Mount owner            | 앱 전용 modal overlay root           | AppShell이 할당한 main/workspace host                  |
| Position               | viewport 기준 fixed inset            | host 기준 flow/grid 또는 absolute inset                |
| Backdrop               | 있음                                 | 없음                                                   |
| Background interaction | inert + pointer 차단                 | sidebar/header 등 허용된 shell chrome은 계속 사용 가능 |
| ARIA                   | `role="dialog"`, `aria-modal="true"` | `main`/`region`; `aria-modal` 없음                     |
| Focus                  | 초기 포커스 + trap + 호출 요소 복귀  | 문서의 정상적인 focus 순서                             |
| Escape                 | dismissible이면 닫고 원래 맥락 복귀  | 페이지 자체를 닫지 않음; 하위 overlay만 닫음           |
| Body scroll            | 잠금                                 | AppShell/Workspace가 자체 scroll owner를 정함          |
| App sidebar relation   | Dialog가 위에서 차단                 | shell grid가 공간을 할당하며 서로 겹치지 않음          |
| 완료/뒤로가기          | `onOpenChange(false, reason)`        | route navigation·dirty guard                           |

## Variants

| Variant           | 용도                                      | 기본 초기 포커스                     |
| ----------------- | ----------------------------------------- | ------------------------------------ |
| `confirm`         | 되돌릴 수 있는 일반 확인                  | primary 또는 가장 안전한 명시적 액션 |
| `danger-confirm`  | 삭제·초기화 등 파괴적 결과                | 취소/가장 안전한 액션                |
| `task`            | 짧은 폼·설정                              | 첫 유효 필드                         |
| `media-workbench` | 현재 화면 위에서 임시로 여는 큰 편집 작업 | dialog surface(이름이 먼저 읽힌다)   |
| `sheet`           | 작은 화면에서 변환된 modal task           | 닫기 또는 첫 필드                    |

### Tone — 확인 대화상자는 별 컴포넌트가 아니다

`tone`은 확인 액션의 **의미 톤**이고 값은 `neutral`·`danger` 둘뿐이다([DS-D-0041](../governance/decisions/DS-D-0041-dialog-tone-axis.md)).
variant가 기본값을 정한다 — `danger-confirm`만 `danger`이고 나머지 넷은 `neutral`이다.

**톤이 소유하는 선언은 하나다.** `DialogConfirm`이 그리는 Button의 `variant`. 표면 색·아이콘·
배치·초기 포커스는 갈리지 않는다 — 그것들은 `variant`와 `size`가 소유한다. 제품 실측이 근거다:
앵커 `ae8fd627`의 `ConfirmModal.tsx:135`가 `variant={confirmVariant}`를, `node-canvas-v2/
components/GlassConfirmModal.tsx`가 `variant={confirmVariant === "danger" ? "danger" : "primary"}`를
확인 버튼에 그대로 넘기고 **그 밖에 갈리는 선언이 없다.**

**ConfirmDialog를 따로 세우지 않는다.** 제품이 한 벌로 쓰는 것을 Figma가 둘로 세우면 projection이
원본보다 갈라진다([DS-D-0025](../governance/decisions/DS-D-0025-figma-as-projection.md)). 셸이
문자 그대로 같은 레시피라, 값이 갈리는 날 어느 쪽이 정본인지 판정할 자가 없다.

**이름이 `confirmVariant`가 아닌 이유.** 이 축은 Figma에 `Tone`으로 서고
[figma-component-authoring §2](../governance/figma-component-authoring.md)의 닫힌 어휘가 `Tone`의
값을 `neutral`·`info`·`success`·`warning`·`danger`로 못박는다. `primary`는 그 표에서 `Variant`
(강조 단계)의 낱말이다. 그리고 `verify-figma-parity`는 variant 축의 옵션 집합을 **코드 union과
글자 그대로** 대조하므로, 코드가 `"primary"`를 쓰면 Figma도 `Tone=primary`가 되어 어휘가 무너진다.
`ToastTone = "neutral" | "danger"`가 같은 자리의 선례다.

**`info`·`success`·`warning`은 열지 않는다.** 제품이 쓰는 확인 톤이 둘이다 — 쓰지 않는 계단은
사다리가 아니다([DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md) ·
[DS-D-0030](../governance/decisions/DS-D-0030-no-duplicate-role-tokens.md)).

**Figma에서는 `Tone=danger`를 `compact` 칸에만 그린다.** 제품의 확인 모달 두 벌이 둘 다
`data-size="compact"`라 나머지 칸에는 근거가 없다. 그래서 세트는 4×2=8이 아니라 **5 변형**이다.
축을 여는 것과 조합을 채우는 것은 별개다.

**접근성 역할(`role="alertdialog"`)은 이 축이 정하지 않는다.** 그것은 보조기술 통보의 문제이고
색·톤과 무관하다 — 빨간 버튼이 있는지 없는지가 `alertdialog`인지를 함의하지 않는다. 제품의 현재
마크업은 확인 모달에서도 `role="dialog"`다. 필요해지면 prop으로 연다.

`docked`, `standalone`, `route`는 Dialog variant가 아니다. 공유해야 하는 것은 editor body이며, modal wrapper와
workspace wrapper는 분리한다.

**variant 전환은 소비자가 한다.** Dialog는 뷰포트 폭을 보고 `task`를 `sheet`로, `medium`을 `fullscreen`으로
자동 전환하지 않는다. 폭에 따라 dismiss 정책과 초기 포커스가 바뀌면 같은 컴포넌트가 화면 크기에 따라 다른
계약을 갖게 되고, 그것은 Surface classifier가 금지한 "화면이 좁다는 이유로 의미를 바꾸는 것"의 축소판이다.
`sheet`와 `fullscreen`은 소비자가 자신의 breakpoint 정책으로 선택한다.

`media-workbench`의 초기 포커스가 dialog surface인 이유는, surface가 포커스를 가지면 스크린리더가
`aria-labelledby`가 가리키는 제목을 먼저 읽고 다음 Tab이 내용으로 들어가기 때문이다. 비어 있는 편집
캔버스에서 임의의 첫 컨트롤을 고르는 것보다 신뢰 가능한 경로다.

## Anatomy

1. **Overlay root** — modal stack과 portal owner를 연결한다.
2. **Backdrop** — 배경을 시각적으로 낮추고 pointer interaction을 차단한다.
3. **Positioner** — viewport, safe area, 작은 화면 배치를 담당한다.
4. **Dialog surface** — role, accessible name/description, focus scope를 소유한다.
5. **Header** — 제목과 선택적 닫기 액션. 제목은 하나만 둔다.
6. **Body** — 설명, 폼, 오류, 스크롤 콘텐츠.
7. **Footer** — 안전한 취소와 primary/danger action.
8. **Nested overlay host** — Select, Popover, Tooltip을 같은 modal branch에 연결한다.
9. **Grabber** — `sheet` 전용 선택 부품. surface 위 가장자리의 닫기 띠이며 손잡이 막대를 그린다. 아래 「Sheet 손잡이」.

**Body는 슬롯이다.** 배포본 확인 모달 셸은 설명 `<p>`와 액션 행 **사이**에 children을 그대로
끼운다(`GlassConfirmModal.tsx:193`). 소비처가 넣는 것은 설명 아래·액션 위에 앉고, 설명과 액션
사이의 간격은 children이 있는 순간 children의 마진이 결정한다 — 셸은 그 간격을 소유하지 않는다.
**셸에 고정 간격이 있다고 가정하고 Figma에 그리면 내용이 든 벌에서 어긋난다.**

크레딧 확인 모달이 그 슬롯의 실사용례다. 값을 지어내지 않도록 실측을 적어 둔다
(`CreditConfirmModal.tsx:23-48`).

| 축 | 값 |
| --- | --- |
| 내역 박스 | `flex-direction: column` · gap 8px · margin `4px 0 16px` · padding `12px 14px` · radius 12px |
| 내역 박스 면 | `rgb(var(--gray-000-rgb) / 6%)` + `background-clip: border-box`. 테두리 없음 |
| 행 | `flex` · `align-items: center` · `justify-content: space-between` · gap 12px |
| 행 라벨 | body-14-regular · 전경 60% |
| 행 값 | body-14-semibold · 전경 100% |
| 구분선 | `border-top: 1px solid rgb(var(--gray-000-rgb) / 12%)` · 나머지 세 변 `none` · margin `2px 0` |
| 행 순서 | 보유 → 사용(`-cost`) → 구분선 → 잔여 |
| 잔여 | `max(0, 보유 − 사용)`. 보유를 모르면 `-` |
| 뒤따르는 스킵 체크박스 줄 | margin `16px 0 20px` |

구분선의 세 변이 `none`인 것은 장식이 아니다. `<hr>`은 UA 기본으로 사방 1px inset 테두리를 갖기
때문에 위 한 변만 세우고 나머지를 지우지 않으면 **박스 안에 얇은 사각형이 하나 더 생긴다.**

**내역 박스의 면은 고른 색이 아니라 전경색을 6%로 깐 것이다.** `--gray-000`은 테마마다 뒤집히므로
라이트에서는 검정 6%, 다크에서는 흰색 6%다. Figma에 한 색을 고정하면 한쪽 테마가 통째로 틀린다.

## Properties

목표 public API는 Dialog의 의미를 바꾸지 않는다. Workspace host를 받는 `portalContainer`는 이 API에
포함하지 않는다. `mode`, `modal`, `layer`, `zIndex`, `role`도 포함하지 않는다 — 그 중 하나라도 열면
Dialog가 Workspace로 변장하는 통로가 된다.

| Property          | 값/형태                                      | 기본값       | 설명                                                      |
| ----------------- | -------------------------------------------- | ------------ | --------------------------------------------------------- |
| `open`             | `boolean`                                    | 필수         | controlled state. uncontrolled 모드는 없다                |
| `onOpenChange`     | `(open, reason) => void`                     | 필수         | **`open === false`일 때만 호출된다.** `confirm`, `cancel`, `escape`, `backdrop`, `programmatic` |
| `variant`          | 위 variant                                   | `task`       | 레이아웃·초기 포커스·dismiss 정책                         |
| 제목               | 하위 컴포넌트                                | 필수         | `aria-labelledby` 대상. id는 인스턴스별로 발급된다        |
| 설명               | 하위 컴포넌트                                | 권장         | `aria-describedby` 대상. 렌더될 때만 연결된다             |
| `initialFocus`     | ref, `surface`, `safe-action`, `first-field` | variant 기반 | 열림 포커스                                               |
| `returnFocus`      | ref 또는 호출 요소 자동 캡처                 | 자동         | 닫힘 포커스                                               |
| `dismissible`      | `boolean`                                    | `true`       | Escape/닫기 버튼 허용                                     |
| `closeOnBackdrop`  | `boolean`                                    | variant 기반 | danger·busy 상태에서는 보통 false                         |
| `busy`             | `boolean`                                    | `false`      | 중복 실행·dismiss 차단, `aria-busy`                       |
| `tone`             | `neutral`, `danger`                          | variant 기반 | 확인 액션의 의미 톤. `neutral`은 Button `primary`로 내려간다 |
| `size`             | `compact`, `medium`, `large`, `fullscreen`   | variant 기반 | content 요구에 따른 크기. 레시피에는 쓰임새 값 `compare`(880, 아래 「넓은 판」)가 더 있다 — React union 에는 아직 없다 |
| `data-dividers` (레시피 속성) | `true`                       | 없음         | 머리 아래 · 발 위 헤어라인. 아래 「구분선」. React prop 은 아직 없다 |
| `onDismissBlocked` | `(reason) => void`                           | 없음         | **추가** 훅. 기본 안내는 Dialog가 스스로 제공한다         |

제목과 설명은 prop이 아니라 하위 컴포넌트가 소유한다. 제목은 호출부가 heading level을 정해야 페이지
outline이 깨지지 않고, 설명은 선택이라 prop으로 받으면 존재 여부를 알 수 없어 렌더되지 않았을 때
`aria-describedby`가 없는 id를 가리킨다. dangling reference는 화면상 아무 이상이 없는 접근성 회귀다.

버튼 라벨, loading, disabled, 오류는 명시적인 props/slots로 제공한다. 전역 keydown listener로 confirm을
추론하지 않는다.

`closeOnBackdrop`은 `dismissible`에 종속된다. 실효값은 `closeOnBackdrop && dismissible && !busy`다.
종속시키지 않으면 "Escape로는 못 닫는데 backdrop으로는 닫히는" 상태가 만들어지고, 그것은 States의
Busy 계약과 어긋난다.

dismiss가 차단될 때 Dialog는 **스스로** polite live region에 안내를 낸다. 안내가 선택이면 소비자가
아무것도 넘기지 않았을 때 차단이 완전히 무음이 되고, 사용자는 Escape가 고장난 것으로 인지한다.
`onDismissBlocked`는 소비자가 자기 문구로 덮거나 추가 처리를 하기 위한 훅이지 안내의 유일한 출처가 아니다.

## States

| 상태    | 계약                                                                           |
| ------- | ------------------------------------------------------------------------------ |
| Closed  | DOM 없음 또는 완전히 inert; 배경 상호작용 정상                                 |
| Opening | root mount → 배경 inert/scroll lock → 위치 확정 → initial focus → enter motion |
| Open    | top modal만 active; focus trap과 nested overlay branch 유지                    |
| Busy    | 중복 confirm과 accidental dismiss 차단; 상태 문구와 spinner, `aria-busy` 제공  |
| Error   | Dialog 유지; 오류를 관련 필드/요약에 연결하고 첫 오류로 이동할 수 있음         |
| Closing | 즉시 action과 focusable child를 inert 처리; exit 후 unmount와 focus return     |

Error의 "첫 오류로 이동"은 소비자가 소유한다. Dialog는 그 이동이 **가능하도록** body만을 scroll owner로
두어 `scrollIntoView`가 Dialog 밖 문서를 움직이지 않게 한다.

Busy는 `aria-busy`를 dialog surface에 붙인다. confirm action은 네이티브 `disabled`가 아니라
`aria-disabled`로 막는다 — 네이티브 disabled는 현재 포커스를 제거하고, busy 중 포커스가 body로 떨어지면
trap이 무의미해진다. 취소는 busy 중에도 기본 활성으로 남는다. Error가 복구 경로를 요구하기 때문이다.

닫힘 타이머는 가장 긴 exit duration과 같은 token에서 계산한다. 카드가 사라진 뒤 투명 root가 pointer를
가로채거나, root가 먼저 사라져 focus return이 실패하면 안 된다.

## Interaction

### Open and focus

1. 열기 직전 `document.activeElement` 또는 명시적 Trigger를 저장한다.
2. Modal root를 최상위 stack에 등록하고 뒤 앱 root를 inert 처리한다.
3. body/scroll owner를 잠그되 기존 inline style을 보존한다.
4. Surface가 배치된 뒤 variant에 맞는 initial focus를 보낸다.
5. 닫힐 때 Trigger가 남아 있으면 복귀하고, 없으면 논리적인 다음 owner로 보낸다.

Tab과 Shift+Tab은 최상위 Dialog 내부에서 순환한다. nested Popover에 포커스가 있으면 같은 modal branch로
취급한다. 아래 Dialog나 페이지로 포커스가 빠지지 않는다.

### Keyboard

- `Escape`: top modal만 닫는다. `dismissible=false` 또는 `busy=true`이면 닫지 않고 필요한 안내를 제공한다.
- `Enter`: 폼의 네이티브 submit 또는 현재 focus된 버튼만 실행한다. document capture 단계에서 전역
  confirm으로 바꾸지 않는다.
- `danger-confirm`: Enter를 누르는 것만으로 danger action을 실행하지 않는다. 사용자가 danger button에
  명시적으로 focus하고 활성화해야 한다.
- IME 조합, textarea 줄바꿈, Select/Listbox key event를 상위 Dialog가 가로채지 않는다.
- 중첩 Dialog가 불가피하면 topmost 하나만 Escape/Tab scope를 소유한다.

### Pointer

- Backdrop dismiss는 `event.target === event.currentTarget` 또는 overlay branch 외부인지 확인한 뒤 실행한다.
  구현은 backdrop을 dialog surface의 **형제 요소**로 두고 그 요소 자신에 핸들러를 붙인다. surface에서
  시작해 backdrop에서 끝난 드래그의 click target은 두 요소의 공통 조상이므로 backdrop 핸들러에 도달할 수
  없다 — 우발적 dismiss가 선언이 아니라 구조로 사라진다.
- backdrop의 `mousedown` 기본 동작을 취소한다. 취소하지 않으면 backdrop 클릭이 `tabindex="-1"`인 overlay
  root로 포커스를 옮겨, 닫지 않기로 한 경우에도 포커스가 dialog surface 밖으로 조용히 빠져나간다.
- Surface와 nested portaled overlay의 pointerdown/click은 backdrop dismiss로 처리하지 않는다.
- danger-confirm과 데이터 입력 task는 기본적으로 backdrop click을 취소와 동일시하지 않는다. 데이터
  손실 가능성이 있으면 dirty guard를 제공한다.
- closing 상태의 root는 action을 다시 받지 않는다. 다만 exit가 끝날 때까지 배경 클릭이 accidental
  action으로 통과하지 않도록 정책을 일관되게 유지한다.

### Sheet 손잡이(grabber)

`data-variant="sheet"` 의 surface 첫 자식으로 둘 수 있는 선택 부품이다. 작은 화면에서 아래에서 올라온 시트를
엄지로 내리는 제스처를 위한 것이며, 두 제품 시트(캔버스 모바일 시트 · 에디터 시트)가 같은 부품을 쓴다.
출처: 2026-10-07, 제품 캔버스 모바일 작업 브랜치(`feat/canvas-mobile-ux` 의 `CanvasMobileSheet.tsx` ·
`vemClass.ts:1566-1596` · `MobileSheetGrabber.tsx`).

```html
<div class="louis-dialog__surface" role="dialog" aria-label="…">
  <button type="button" class="louis-dialog__grabber" aria-label="시트 닫기">
    <span class="louis-dialog__grabber-bar"></span>
  </button>
  <!-- header · body · footer -->
</div>
```

| 축 | 값 |
| --- | --- |
| 띠 | 절대 배치 · 위 가장자리 · 폭 전체 · 높이 32px(`--louis-dialog-grabber-block-size`). 토큰이 없어 리터럴이다 |
| 막대 | 36 × 4px · `radius-pill` · `color-stroke-hairline` |
| 누르는 영역 | 띠 전체(폭 × 32px). 44px 보다 낮지만, 더 넓히면 바로 아래 헤더의 첫 탭을 먹는다 — 제품이 16px 에서 32px 로 올린 것이 그 균형이다 |
| 아래 내용 | 손잡이가 있는 surface 만 위 패딩을 띠 높이만큼 둔다(`:has(> .louis-dialog__grabber)`). 없으면 영향 없다 |
| 쓸기 | `touch-action: none` — 띠에서 시작한 세로 제스처를 스크롤이 가져가지 않는다 |

**동작 계약 — 탭과 아래로 쓸기로 닫힌다(40px).** 이 동작은 **CSS 가 아니라 소비자(또는 React)의 몫**이다.
`dialog.css` 는 모양과 누르는 영역만 소유하고, 아래 규칙은 소비자가 핸들러로 구현한다. 제품 `MobileSheetGrabber` 가
기준 구현이다.

- 아래로 **40px**(`SWIPE_CLOSE_PX`) 이상 끌면 즉시 닫는다. 손가락 떨림(≈10px)보다 크고 한 번 쓸기(≈80px)보다 짧은 값이다.
- 40px 미만으로 눌렀다 떼면 탭이며 닫는다. 위로 40px 이상 끌었다 놓은 것은 탭이 아니다 — 닫지 않는다.
- 한 제스처에 `onClose` 는 **한 번**만 부른다. 포인터 캡처로 손가락이 띠 밖으로 나가도 이동을 계속 받는다.
- 탭은 `click` 이 아니라 pointerup 에서 닫는다(쓸어서 닫힌 뒤 따라오는 click 의 중복 호출을 피한다). `click` 은 키보드
  (Enter · Space, `detail === 0`)만 받는다. 보조 버튼 · 두 번째 손가락은 무시한다.
- 띠는 `<button type="button">` 이고 `aria-label` 이 필수다(예: 「시트 닫기」). 닫기 사유는 `cancel` 과 같다.

**현재 구현 범위.** CSS 는 `dialog.css` 에 있다. React `Dialog` 에는 손잡이 part 가 **아직 없다** — 새 public export
(`api-surface.json`) 와 쓸기 제스처 계약이 함께 들어가야 해서 이 변경에서 넣지 않았다. 소비자는 위 마크업과 제스처 규칙을
직접 구현한다.

**Figma 는 `Size=sheet, Layout=grabber` 변형이다(2026-10-08).** `Layout` = `base` · `grabber` 축이 섰고 grabber 는 sheet 하나에만
있다(손잡이는 시트 전용 부품이다 — set 이 희소하다). 띠(`Grabber`)는 위 가장자리에 절대 배치된 폭 × 32 칸이고 그 가운데에
막대(`Bar`, 36 × 4, 곡률 `radius/pill`, 채움 `color/stroke-hairline`)가 선다. 띠가 흐름에 끼지 않으므로 표면의 위 패딩이
띠 32 + 안쪽 여백 24 + 헤어라인 0.5 = 56.5 이고, 닫기도 같은 32 만큼 내려간다 — CSS 의 `:has(> .louis-dialog__grabber)` 가
surface 위 패딩을 두는 것과 같은 결과다. BOOLEAN 이 아니라 축인 이유는 프레임이 자기 위 패딩을 다시 쓰기 때문이다
([Figma 컴포넌트 작성 규범](../governance/figma-component-authoring.md) §2 시험 2). parity 계약은
`components.measured.json` 의 `dialog.sizes["sheet/grabber"]`(띠 높이 · 막대 치수 · 위 패딩)와 대조한다. 탭 · 쓸기 동작은
Figma 에 그리지 않는다 — 위 동작 계약이 소유한다.

**Figma 닫기 글리프는 `icon/x` 다(2026-10-08).** 여섯 변형의 `Close`(IconButton ghost · md) 인스턴스가 IconButton 기본 글리프 `icon/plus` 를 그대로 물고 있어 「+」로 보였다 — `Glyph` 스왑을 `icon/x` 로 바꿨다. 되읽기는 인스턴스 안으로 들어가지 않아 이 어긋남을 parity 가 잡지 못한다.

## Modal and Workspace separation

Dialog는 modal behavior만 소유한다. route가 주 작업을 소유하면
[Editor Workspace](../patterns/editor-workspace.md)를 사용하고 App Shell geometry는
[App Shell](../patterns/app-shell.md)에 맡긴다.

- 하나의 core를 공유할 수 있지만 Dialog wrapper와 route Workspace wrapper는 별도 public type이다.
- portal target 유무, ref timing, z-index로 mode를 추론하지 않는다.
- route Workspace에는 backdrop, `aria-modal`, focus trap, outside-close를 적용하지 않는다.
- Workspace에서 연 confirm Dialog는 global modal root를 사용하고 topmost modal behavior를 따른다.

## Portal and layer rules

- 모든 Modal Dialog는 앱의 하나인 modal overlay root로 portal한다. feature tree 안의 임의 div는 허용하지
  않는다.
- raw z-index 대신 `layer-popover < layer-modal < layer-critical` 의미 토큰과 stack manager를 사용한다.
- 새 Dialog가 열리면 이전 Dialog는 stack에 남더라도 inert다. Escape, focus trap, backdrop은 topmost만
  처리한다.
- Dialog에서 연 Popover/Tooltip은 같은 modal branch에 등록한다. 별도 body portal이라는 이유로 Dialog를
  닫거나 inert 처리되지 않는다.
- toast가 modal보다 위에 필요한지 아래에 필요한지는 feedback policy로 정하고, 숫자를 높여 우연히
  해결하지 않는다.
- viewport safe area와 virtual keyboard를 고려한다. `100vh`보다 visual viewport/`100dvh`와 safe-area
  padding을 우선한다.

## 넓은 판 — `data-size="compare"`

두 열을 견주는 대화다 — 프롬프트 후보 비교(통합 판 `54b62a8aa` `PromptVariantCompareModal.tsx:34-38`). 폭 880 은 `large`
720 밖이라 새 값이 필요하다. surface 가 `min(…, 100%)` 로 받으므로 좁은 화면에서는 뷰포트를 따라 줄어든다.

**이름이 `xlarge` 가 아니다.** `compact`·`medium`·`large` 는
[figma-component-authoring §2](../governance/figma-component-authoring.md)가 Figma 축 어휘에서 **폐기한 밀도 형용사**다 —
사다리 `sm`·`md`·`lg` 와 같은 뜻을 두 어휘로 부르면 두 벌이 된다. `xlarge` 는 그 폐기된 계열을 한 칸 늘리는 이름이라
같은 절의 「사다리 밖 값은 쓰임새로 부른다」 규칙(조건 3 — 값이나 밀도 형용사가 아니라 장소나 쓰임새)에 걸린다. 그래서
쓰임새 이름 `compare` 로 연다. 기존 세 값의 이름은 이 회차에서 바꾸지 않는다.

**반경은 기본의 유도값 20 이다**(버튼 `radius-control` 12 + 발 여백 `space-control-sm` 8). 제품의 `rounded-24` 는 접는다 —
`compact` 가 24 를 무른 2026-09-03 판정과 같은 근거다.

**발이 없는 대화.** 비교 모달은 액션 행이 없다. 본문이 surface 의 마지막 자식이면 카드 아래 여백을 본문이 진다
(`padding-block-end: var(--louis-dialog-surface-inset)`, 제품 `PromptVariantCompareModal.tsx:41-44`). 기본 본문 아래 8 은
발이 뒤따른다는 전제의 값이라, 발이 없으면 카드 바닥이 8 로 붙기 때문이다. 크기와 무관한 일반 규칙이다.

본문의 두 열은 [Prompt Variant](prompt-variant.md) `data-layout="column"` 과 `.louis-prompt-variant-grid` 다.

Figma 는 `Size` 축에 `compare` 를 더한다(쓰임새 값이라 사다리 순서를 주장하지 않는다).

## 구분선 — `data-dividers="true"`

본문이 스크롤하는 큰 작업 면(크롭)에서 머리 · 발이 본문과 갈려 보이게 한다. 머리 아래 · 발 위에 한 면 헤어라인
(`hairline-inset-block-end` · `-block-start`, [DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md))이 서고,
테두리가 아니라 안쪽 그림자라 머리 · 발의 높이가 그대로다. 제품은 크롭 모달 셋 중 둘이 1px 12% 선을 갖는다
(통합 판 `54b62a8aa` `ImageCropModal.tsx:42` · `:68`, 캔버스 `nodes/CropModal.tsx:72` · `:190`) — 클립 크롭은 전용 덮개라
셈하지 않는다. 선 값은 공용 헤어라인으로 접는다.

**선이 서면 발 위 24 가 8 이 된다.** 24 는 「본문과 액션 사이」를 여백으로 가르는 값인데, 선이 이미 가르므로 여백까지
넓게 둘 이유가 없다. 강제 색에서는 안쪽 그림자가 사라지므로 `CanvasText` 실선으로 되살린다.

**Figma 에서는 BOOLEAN 이 될 수 없다.** 선만 켜고 끄면 레이어 가시성이지만, 발 위 여백이 24 → 8 로 함께 바뀌어 프레임이
자기 패딩을 다시 쓴다(BOOLEAN 시험 2). 그래서 조건 축 `Dividers`(`false` · `true`)로 내야 하고, 그 이름은
[figma-component-authoring §2](../governance/figma-component-authoring.md)의 조건 축 표에 먼저 올라야 한다. Figma 작업은 그 회차다.

## Responsive behavior

- compact confirm: `min(360px, viewport - 40px)` 기준. 320px에서도 좌우 여백을 유지한다.
- task dialog: 최대폭을 두되 body만 스크롤하고 제목과 footer action은 접근 가능하게 유지한다.
- action은 충분한 폭에서는 한 행, 긴 KO/EN/JA 또는 200% 확대에서는 세로 스택으로 전환한다.
- 큰 media workbench는 작은 화면에서 fullscreen modal이 될 수 있지만 여전히 원래 화면 위의 임시 맥락이면
  Dialog 계약을 유지한다.
- route Workspace는 fullscreen으로 보여도 Dialog 모션, backdrop, focus trap을 적용하지 않는다.

## Content

- 제목은 결정을 구체적으로 설명한다: `프로젝트를 삭제할까요?`, `변경사항을 저장하고 나갈까요?`.
- 설명은 결과와 복구 가능 여부를 말한다. 제목을 반복하지 않는다.
- 버튼은 결과를 나타낸다: `취소` / `삭제`, `계속 편집` / `저장하고 나가기`.
- danger action에 `확인` 같은 모호한 라벨을 쓰지 않는다.
- async action은 `저장 중`, `삭제 중`처럼 상태를 표시하되 말줄임표를 쓰지 않는다.
- 오류 후 Dialog를 닫지 말고 사용자가 복구할 방법을 제공한다.

### 배포본 확인 모달의 문안 타이포

제품은 제목·설명·액션 라벨을 **한 크기(16px)에 굵기로만** 갈라 놓았다. DS의 위계와 다르므로
Figma에서 제품 화면을 그릴 때는 아래를 쓴다.

| 층 | 클래스 | 크기/굵기/행간/자간 | 색 |
| --- | --- | --- | --- |
| 제목 `<h3>` | `type-body-16-semibold` | 16 / 600 / 1.5 / -0.01em | `--gray-000` (시맨틱 — 라이트 `#000000`, 다크 `#fafafa`) |
| 설명 `<p>` | `type-body-16-regular` | 16 / 400 / 1.5 / -0.01em | `rgb(var(--gray-000-rgb) / 60%)` |
| 액션 라벨 | `type-body-16-medium` | 16 / 500 / 1.5 / -0.01em | 버튼 variant가 소유 |
| 부속(내역 행·체크박스 라벨) | `type-body-14-*` | 14 / 400·600 / 1.5 / -0.01em | 라벨 60% · 값 100% |

근거는 `GlassConfirmModal.tsx:173`(제목 — `text-body-20 font-semibold`)과 `:176`(설명)이다.
**제목 타이포는 `5a67d692` 재고정에서 `text-body-16` → `text-body-20` 으로 올라갔다** — 위 표의 제목 행은 재감사 대상이다.
**나머지는 제품이 더는 갖고 있지 않다.** 배포본 `df414c24` 의 이 셸은 `.louis-dialog__*` 와 LOUIS
`Button` 만 그리고, 색·제목→설명 간격(8px)·부속 타이포는 전부
[dialog.css](../../packages/css/src/component/dialog.css) 가 소유한다 — 옛 좌표(`a3ed8e03` 의 `:286`
· `:290` · `:300` · `:308` · `:79` · `:84`)가 가리키던 선언이 채택과 함께 사라졌다. 위 표는 이제
**제품 실측이 아니라 DS 계약**이고, 제품이 그것을 소비한다.

**뷰포트 450px 이하에서 위 표의 16px이 전부 14px로 내려간다.** 제품이 `--type-body-16-size`를
`--type-body-14-size`로 재정의하기 때문이다(`globals.css:804-808`). `line-height`와
`letter-spacing`은 따라 내려가지 않는다. 결과는 모바일 폭에서 **제목·설명·액션 라벨·부속이 전부
14px**이 되어 위계가 굵기에만 남는 것이다. 450은 [Responsive Layout](../foundations/responsive-layout.md)의
다섯 단계에 없는 별도 경계다 — **다섯 단계만 보고 그리면 이 층이 통째로 빠진다.**

**DS는 이 램프를 옮기지 않는다.** 같은 이름의 토큰 값을 뷰포트에 따라 바꾸면 컴포넌트의 의미가
화면 크기를 타게 되고, 그것은 Variants가 금지한 "폭을 보고 계약을 바꾸는 것"과 같은 실수다.
필요하면 fixed style과 분리한 별도 responsive typography recipe로 만든다.

## Footer

확인 대화상자는 **Footer와 액션 둘**로 성립한다. Footer는 `padding-block-start`가
`space-control-sm`이고 Actions는 오른쪽 정렬에 같은 gap이다. **취소가 먼저, 확인이 나중**이다.

Figma 세트에 이것이 없어서 디자이너가 확인 대화상자를 만들 수 없었다(2026-08-18 실무 감사).
지금은 세 Size variant 전부에 있고 parity가 `footerPaddingTop` · `actionsGap` · `actionCount`를
대조한다.

**제품의 액션 행은 오른쪽 정렬이 아니다.** 배포본 확인 모달은 액션 행에 `justify-*`를 두지 않고
버튼 둘에 각각 `flex: 1`을 줘 **1:1로 균등 분할**한다. 취소·확인·danger 셋이 같은 기반 클래스를
공유하므로 세 벌 전부 같은 폭이다(`GlassConfirmModal.tsx:92` · `:94`). 360px 카드에서 각 버튼은
(360 − 16 − 8) ÷ 2 ≈ 168px이다 — 카드 패딩이 좌우 16이어도 액션 행이 `-8px`로 되밀어 실효
인셋이 8+8이기 때문이다. 버튼 곡률은 카드 24에서 인셋 8을 뺀 16이라 카드와 동심이다(`:95`).

`flex-wrap`이 없어 **긴 라벨에서도, 200% 확대에서도 세로로 접히지 않는다.** DS는 반대로 접는다
(Known deviations의 세로 전환 임계값 항목). 순서는 양쪽 다 취소 먼저·확인 나중으로 같다.

**Figma에서 제품 화면을 그릴 때 버튼을 글자 폭(hug)으로 두면 틀린다.** 두 칸 균등이 제품의
배치이고, 라벨 길이가 달라도 폭은 움직이지 않는다.

## Accessibility

- Surface는 `role="dialog"`와 `aria-modal="true"`를 사용한다. `alertdialog`는 이번 구현 범위가 **아니다.**
  `role`을 prop으로 여는 순간 Workspace 오용 통로가 열리며, 짧은 경고를 위한 별도 recipe가 필요해지면
  그때 독립 컴포넌트로 만든다.
- 보이는 제목을 `aria-labelledby`, 설명을 `aria-describedby`로 연결한다. id는 인스턴스마다 고유하다.
  설명이 렌더되지 않았으면 `aria-describedby`를 **붙이지 않는다.**
- 열림 초기 포커스, focus trap, 닫힘 focus return은 선택 사항이 아니다.
- modal 뒤 앱 root는 pointer뿐 아니라 보조 기술·키보드 접근도 막아야 한다.
- icon-only close에는 locale-aware accessible name이 있다. 포커스 링은 그리지 않는다
  ([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)) — 강제 색의 링만 `base.css`가 그린다.
- busy, error, status는 [Loading Pattern](../patterns/loading.md)과 live region 계약을 따른다. Dialog는
  인스턴스마다 polite live region을 하나 소유하고 dismiss 차단 안내를 그곳에 쓴다.
- 320px, 200% 확대, light/dark, reduced-motion, KO/EN/JA를 검증한다.

## 액션은 글자보다 가장자리에 가깝다

배포본의 모달 두 벌이 액션 행에 `margin: -8px`을 걸어 카드의 16 여백 **밖으로** 8만큼 되밀어
낸다. 결과는 좌우·아래가 8이고 제목과 설명은 16에 남는다. 그 위 간격도 8이 아니라 24다.

DS는 음수 마진 대신 footer의 여백을 직접 적어 같은 결과를 만든다 — 음수 마진은 부모의 여백을
아는 값이라 부모가 바뀌면 조용히 어긋난다.

**16으로 두고 있었고 그 축을 보는 테스트가 없었다.** 인벤토리를 그리다 owner가 알아봤고,
제품 표본 실측(`migration/product.variants.json`)이 값을 확정했다.

## Specification

| Part/state      | 목표 token/recipe                                    | 검증                              |
| --------------- | ---------------------------------------------------- | --------------------------------- |
| Compact width   | `min(360px, 100vw - 40px)`                           | 320px viewport와 200% zoom        |
| Task max width  | content tier token                                   | 긴 폼과 locale별 문구             |
| Surface radius  | compact 24px, large `radius-overlay` 16px            | compact/regular visual regression |
| Surface padding | compact 16px, content tier에 따라 증가               | scroll 가능한 content/action 분리 |
| Backdrop        | `surface-scrim-modal` = neutral 50% reference        | light/dark 대비                   |
| Action height   | 44px 이상                                            | pointer/touch target              |
| Action gap      | 8px                                                  | 200% zoom reflow                  |
| Action inset    | 8px — 글자보다 가장자리에 가깝다                      | surface-geometry 실측             |
| Action 위 간격  | 24px · 구분선이 서면 8px                             | surface-geometry 실측             |
| Compare width   | `min(880px, 100%)` · 반경 20(유도값)                 | 두 열 비교 모달                   |
| 발 없는 본문    | 아래 여백 `--louis-dialog-surface-inset`              | 본문이 마지막 자식일 때           |
| 구분선          | `hairline-inset-block-end` · `-block-start`          | 강제 색 `CanvasText` 실선         |
| Elevation       | `elevation-modal`                                    | overlay hierarchy                 |
| Layer           | `layer-modal`, 숫자 리터럴 금지                      | nested overlay stack              |
| Enter motion    | `motion-modal-enter`: opacity + translate/scale      | reduced-motion 대체               |
| Exit motion     | `motion-modal-exit`, unmount lifecycle과 같은 source | animation completion              |
| Reduced motion  | 비필수 transform/filter 제거, 즉시 또는 짧은 opacity | motion preference                 |

## Implementation

- Web source: `packages/react/src/dialog/**`
- CSS recipe: `packages/css/src/component/dialog.css`
- Public import: `import { Dialog, OverlayProvider } from "@klipse-design/react"`
- Tests: `packages/react/test/dialog.browser.test.tsx` (실브라우저 15건, 두 motion context에서 각각)
- Storybook: `apps/storybook/stories/dialog.stories.tsx`

소비자는 앱 root에 `OverlayProvider`를 한 번 둔다. Menu와 같은 Provider이며 Dialog가 두 번째 소비자다.

### 계층 분담

| 계약 | 소유 |
| --- | --- |
| modal 격리 3축, 중첩 형제 격리, scroll lock refcount, Escape 단계별 닫힘, presence, focus 복원 시점, branch lineage, 인스턴스 id | overlay primitive (DS-P3-005) |
| variant → 정책 해석, backdrop 판정, confirm/cancel 어휘, 호출 요소 캡처, aria 배선, 차단 안내 | 이 recipe |
| scrim·surface·header/body/footer의 시각 표현과 responsive geometry | `dialog.css` |

Dialog는 anchored가 아니라 Menu의 `AnchoredRoot`를 재사용하지 않는다. 그것은 `mode: "non-modal"`,
`layer: "popover"`, `anchored: true`를 하드코딩하고 positioner로 children을 감싸며 Trigger를 전제한다.
전부 옵션화하면 남는 것은 `useOverlay`의 얇은 래퍼이고 두 recipe 중 어느 쪽도 그 조합의 절반을 쓰지 않는다.

**backdrop은 dialog surface의 형제이며 같은 portal subtree 안에 있다.** 별도 portal로 렌더하면 modal
host의 두 번째 직속 자식이 되고, primitive의 중첩 격리가 자기 자신의 backdrop에 inert를 걸어 클릭이
조용히 죽는다.

## Known deviations

- **compact surface radius가 24px이 아니라 20px이다.** 24px 토큰이 소스에 없다. 값 자체는
  `radius-card-lg`(20px)로 자기 이름을 갖는다 — [DS-D-0014](../governance/decisions/DS-D-0014-card-radius.md)
  전까지는 `radius-card`를 빌려 썼고, 제품의 프로젝트 카드가 4벌 전부 16px이라 그 이름이 16으로
  내려갔다. "compact가 large보다 둥글다"는 서열은 유지된다.
- **`compare` 와 `data-dividers` 에 React 표면이 없다.** React `DialogSize` union(`compact` · `medium` · `large` ·
  `fullscreen`)에 `compare` 를 올리는 것은 다음 회차라, 그때까지 소비처는 `data-size` · `data-dividers` 를 직접 건다. Figma 는
  2026-10-13 에 섰다 — `Size=compare` 와 조건 축 `Dividers`(`large` 에만 `true`, 머리 묶음 아래 · 발 위 헤어라인, 발 위 8). 제품 반경 24 와 선 12% 는 LOUIS 유도값 20 · 공용 헤어라인으로 접었다.
- **최대폭과 viewport 여백이 토큰이 아니라 리터럴이다.** content tier 토큰과 20px spacing 토큰이 없다.
  Specification의 `viewport - 40px`을 맞추려면 20px이 필요해 값을 지키고 리터럴을 한 줄에 격리했다.
- **surface padding이 `space-layout-*`에서 온다.** `space-surface-*` tier가 없다. `space-control-*`는
  컨트롤 **내부** 스케일이라 표면 여백에 쓰지 않는다.
- **`surface-scrim-modal` 대신 `color-dim-modal`을 쓰고 값이 50%가 아니라 56%(light)/72%(dark)다.**
  Specification 표가 대는 이름의 토큰이 없고 실제 값은 두 테마에서 다르다. **다크의 바탕은 바닥색
  `palette-gray-950`이다** — 알파 원시의 바탕(`palette-gray-900`)이 다크 카드 면과 같은 값이라, 그대로 두면
  카드 위에서는 아무것도 어두워지지 않고 바닥 위에서는 오히려 밝아졌다
  ([DS-D-0072](../governance/decisions/DS-D-0072-dim-modal-dark-is-the-floor.md)).
- **surface 경계는 border가 아니라 inset 헤어라인이다.** Specification 표에는 없지만 dark에서
  `elevation-modal` 그림자만으로 표면 경계가 서지 않아, modal elevation 뒤에 조합한 inset
  box-shadow(`--louis-hairline-inset`)를 한 겹 더 쓴다([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)).
  Menu 패널과 같은 판단이다.

  **이제 제품과 같은 계약이고, 구성도 같아졌다.** 배포본 확인 모달은 `border` 선언도 자기
  `box-shadow` 선언도 없고 `.louis-dialog__surface`를 그대로 소비한다
  (`GlassConfirmModal.tsx:164`, 루트는 `:152`). 경계는 그 recipe의
  `box-shadow: var(--louis-elevation-modal), var(--louis-hairline-inset)`
  ([dialog.css:85](../../packages/css/src/component/dialog.css))에서 온다 — 앰비언트와 헤어라인을
  함께 갖는다.

  **이전 판은 여기가 갈린다고 적었다. 그 판정은 더 이상 유효하지 않다.** 근거였던
  `box-shadow: var(--dropdown-frame)` 한 겹은 `GlassConfirmModal.tsx@3c9a1a44:57`에 있었고,
  「`--dropdown-ambient-shadow`를 붙이지 않아 드롭 섀도우가 한 겹도 없다」는 그 줄을 읽은 판정이었다.
  **두 토큰은 지금 제품에 없고** 그 자리를 LOUIS 정본이 받는다 —
  [읽기 함정](../foundations/product-reading-traps.md) 2번의 `--dropdown-*` 대응표를 보라.
- **제품 모달의 면도 LOUIS 정본이 소유한다.** `.louis-dialog__surface`의
  `background: var(--louis-color-bg-overlay)`이고, 라이트 `color(srgb 0.980392 0.980392 0.980392 / 1)` ·
  다크 `color(srgb 0.192157 0.211765 0.25098 / 1)`이다
  ([tokens.css:292](../../packages/tokens/generated/tokens.css) · `731`). 이전 판이 적었던
  「palette 직접 참조 두 벌을 손으로 갈라 적는다」(`GlassConfirmModal.tsx@3c9a1a44:54-55`)는 그때의
  구성이고, 지금 제품 파일에는 그 두 줄이 없다.
- **Anatomy 3번 Positioner가 별도 DOM 노드가 아니다.** Dialog는 anchored가 아니라 positioner를 쓰지
  않는다. 그 역할은 overlay root가 grid 정렬과 padding으로 직접 소유한다.
- **dialog surface가 자손 `position: fixed`의 containing block이다.** enter transform과
  `container-type: inline-size`가 둘 다 그 효과를 낸다. Dialog 안에서 여는 Popover는 non-modal host로
  portal되어 surface의 자손이 아니므로 영향받지 않는다.
- **virtual keyboard가 열렸을 때 surface가 중앙에 남는다.** `100dvh`는 브라우저 chrome은 따라가지만
  소프트 키보드는 따라가지 않는다. visual viewport 추종은 CSS만으로 불가능하며 별도 결정이 필요하다.
- **`env(safe-area-inset-*)`와 `100dvh`의 실효를 자동 검증하지 못한다.** 브라우저 harness의 iframe에서
  `env()`는 0이고 `dvh === lvh === svh`다. 선언의 존재만 고정한다.
- **action의 세로 전환 임계값이 콘텐츠가 아니라 컨테이너 폭이다.** 긴 라벨은 `flex-wrap`이 받고
  좁은 폭·200% 확대는 surface의 container query가 받는다. 두 경로가 하나로 통합되지 않는다.
- **`alertdialog`를 지원하지 않는다.** Accessibility가 "검토한다"고만 쓴 것을 이번 구현은 "하지 않는다"로
  확정했다. `role`을 prop으로 여는 것이 Workspace 오용의 최단 경로다.
- **exit 동안 배경 격리가 먼저 풀린다.** focus 복원 대상이 inert면 `focus()`가 무효가 되므로 격리 해제가
  복원보다 앞선다. 그 결과 exit 모션(200ms) 동안 배경이 다시 조작 가능해진다. scroll lock은 그대로 유지해
  화면이 튀지 않는다.

## 승격 조건

Web `done`과 `stable`에는 다음이 남아 있다.

- visual regression fixture (hosted CI 확보 후, DS-D-0005 2단계)
- 수동 keyboard·screen-reader review 기록
- SSR render와 hydration 검증
- `env(safe-area-inset-*)`와 `100dvh`의 실기 확인
- virtual keyboard 추종 정책 확정
- `sheet`·`fullscreen`·`media-workbench`의 responsive 실측
- ~~published Figma component와 parity report (DS-F-006-dialog)~~ **해소** — Figma는 `done`이다
  ([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md))
- 위 Known deviations 중 토큰 부재 4건의 해소 (DS-P3-014)

## Extraction baseline

Klipse product의 여러 modal은 focus, Escape, scroll lock과 layer 정책이 달랐고 route editor를 Modal API로
도킹했다. “독립 에디터와 좌측 sidebar가 겹침”은 허용 배치가 아니라 ownership 회귀다. 비규범 근거는
[`KP-DIALOG-001`](../../migration/product-baseline.md)과
[`KP-EDITOR-001`](../../migration/product-baseline.md)에 보존한다.

## Overlay behavior layer

modal 격리·scroll lock·focus 복원·중첩 stack은 `packages/react/src/overlay/`의 내부 primitive가
구현한다. Dialog recipe는 그 위에 얹히며 순서를 다시 쓰지 않는다. 경계는
[DS-D-0011](../governance/decisions/DS-D-0011-overlay-primitive-boundary.md)이 소유한다.

| 계약 | 구현 | 회귀 테스트 |
| --- | --- | --- |
| 배경을 pointer·keyboard·a11y tree 세 축에서 차단 | `overlay/inert-controller.ts` | `overlay-stacking.browser.test.tsx` |
| Dialog 안 Popover는 inert 면제 | 같은 파일의 포함 관계 판정 | `overlay-stacking.browser.test.tsx` |
| 중첩 Dialog는 topmost만 조작 가능 | modal host 내부 형제 격리 | `overlay-stacking.browser.test.tsx` |
| scroll lock refcount와 인라인 style 복원 | `overlay/scroll-lock.ts` | `overlay-stacking.browser.test.tsx` |
| Escape는 최상위 한 단계만, 잠기면 아래로 넘기지 않음 | `overlay/overlay-store.ts` | `overlay-keyboard`, `overlay-store.node` |
| unmount 전에 focus를 돌려준다 | `overlay/presence.ts` + `overlay/focus-region.tsx` | `overlay-keyboard.browser.test.tsx` |
| 고유 title/description/panel id | `overlay/ids.ts` | `overlay-keyboard.browser.test.tsx` |

reduced-motion에서는 exit duration이 0으로 붕괴하되 **전이 순서는 동일하다**. timer가 시각
transition과 같은 CSS 선언을 읽으므로 두 값이 어긋날 수 없다(DS-D-0011 결정 3).

## Pre-implementation blockers

- ~~공용 focus scope, inert, scroll lock, modal stack과 overlay branch가 없다.~~ **해소(DS-P3-005).**
- ~~semantic layer token의 Dialog 소비~~ **해소(DS-P3-005).** unique title/description ID는
  `overlay/ids.ts`가 발급하지만 Dialog recipe가 아직 그것을 aria 속성에 묶지 않았다.
- ~~close motion과 unmount lifecycle 연결~~ **해소(DS-P3-005).**
- ~~unique title/description ID를 aria 속성에 묶지 않았다.~~ **해소(DS-P3-007).**
- ~~Dialog와 route Workspace를 type/API 수준에서 분리한 구현이 없다.~~ **해소(DS-P3-007).**
  `portalContainer`·`mode`·`layer`·`role`이 API에 없다.
- ~~Dialog의 public export가 없다.~~ **해소(DS-P3-007).**
- responsive geometry는 구현됐으나 Figma parity test가 없다(DS-F-006-dialog).

## Migration

1. ~~focus scope, inert, scroll lock, stack, overlay branch를 가진 headless `Dialog` primitive를 만든다.~~
   **해소(DS-P3-005).**
2. 단일 `Dialog` compound와 `variant` prop으로 confirm·task·media-workbench를 표현한다. 세 개의 별도
   recipe를 만들지 않는다 — 셋의 차이는 초기 포커스 기본값, dismiss 기본값, 크기 tier 세 값뿐이고,
   그 값을 세 컴포넌트에 흩으면 규범이 한 곳에서 읽히지 않는다. 필요하면 소비자가 자기 앱에서
   `variant`를 고정한 얇은 래퍼를 만든다.
3. 단순 confirm 소비처를 먼저 이관하고 danger action의 전역 Enter confirm을 금지한다.
4. form/legal/media modal을 공용 primitive로 옮겨 Escape·focus·scroll 정책을 맞춘다.
5. 영상 편집 UI를 `VideoEditorWorkspaceCore`, `VideoEditorDialog`, `VideoEditorRouteWorkspace`로 분리한다.
6. AppShell grid가 sidebar와 main rect를 유일하게 계산하도록 하고 raw offset/z-index를 제거한다.
7. Figma variant와 interaction/visual/a11y 테스트를 연결한 뒤 기존 Modal adapter를 폐기한다.

breaking API와 사용자 동작 변경은 decision과 [Updates](../updates/README.md)에 기록한다.

## Migration acceptance tests

### Dialog behavior

- pointer와 keyboard 각각으로 열었을 때 variant별 initial focus가 맞다.
- Tab/Shift+Tab이 top Dialog와 그 nested overlay branch 안에서만 순환한다.
- Escape는 top dismissible Dialog만 닫고 Trigger로 포커스를 돌린다.
- modal 동안 뒤 앱의 button/link/canvas가 pointer, keyboard, accessibility tree에서 상호작용되지 않는다.
- body/scroll owner가 잠기고 닫힌 뒤 기존 scroll 위치와 inline style이 복원된다.
- backdrop, Surface, nested portaled Popover 클릭이 각각 올바른 dismiss 결과를 만든다.
- busy 중 중복 confirm과 accidental dismiss가 차단되고 상태가 읽힌다.
- danger-confirm은 focus되지 않은 상태의 전역 Enter로 실행되지 않는다.
- 두 Dialog를 쌓아도 topmost 하나만 Escape, focus trap, confirm을 처리한다.

### Modal editor versus route workspace

- 캔버스에서 여는 영상 편집기는 viewport modal overlay에 있고 backdrop, dialog semantics, focus trap을 가진다.
- route editor는 page main rect 안에 있고 backdrop, `aria-modal`, modal focus trap이 없다.
- desktop sidebar expanded/collapsed 각 상태와 전환 중 `sidebarRect.right <= workspaceRect.left`를 만족한다.
- Workspace가 viewport 기준 `fixed left:0`이 아니며, shell이 할당한 host를 100% 채운다.
- top chrome action portal은 editor body의 layout rect를 바꾸거나 sidebar 위 hit area를 만들지 않는다.
- 719px 경계 전후에서 mobile drawer는 닫혀 있을 때 hit area가 없고, 열리면 backdrop과 닫기 동작이 있다.
- Workspace 안의 ConfirmDialog는 앱 modal root에 떠서 editor와 shell을 모두 차단한다.
- 브라우저 뒤로가기와 dirty guard가 modal close와 혼동되지 않는다.

### Visual and accessibility

- 320px, 200% 확대, KO/EN/JA 긴 문구, light/dark, reduced-motion에서 내용과 action이 잘리지 않는다.
- focus-visible, 이름·설명 연결, 중복 id, axe smoke를 검증한다.
- sidebar/workspace와 modal stack의 bounding-box·hit-test 회귀를 브라우저 테스트로 고정한다.

이 테스트와 Figma variant가 연결되고 알려진 편차가 닫히기 전에는 `stable`로 승격하지 않는다.
