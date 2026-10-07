---
id: loading
status: beta
authority: normative
---

# Loading

로딩 UI는 사용자가 **무엇을 기다리는지, 얼마나 진행됐는지, 실패하면 무엇을 할 수 있는지** 이해하게
해야 한다. 모든 진행 상태를 spinner 하나로 처리하지 않는다.

## 선택 기준

| 상황                                 | 기본 표현                            | 이유                                           |
| ------------------------------------ | ------------------------------------ | ---------------------------------------------- |
| 글자로 진행을 말하는 자리 — 블록 로딩, 진행 문구로 갈아 끼우는 버튼 | `LoadingWord` (글자 쉬머) | 스피너 없이 글자가 곧 상태. 문구형 로딩의 정본 |
| 스피너가 이미 붙은 기존 버튼·인라인 액션 | `InlineLoadingLabel`              | 액션이 시작됐고 중복 입력이 막혔음을 바로 전달 |
| 작은 독립 영역, 완료 시간을 모름     | `LoadingSpinner` + 짧은 문구         | 레이아웃을 예측할 필요가 없음                  |
| 구조가 정해진 카드·목록의 첫 로드    | Skeleton                             | 나타날 콘텐츠 구조를 미리 전달                 |
| 업로드·다운로드·렌더처럼 진행률을 앎 | Determinate progress                 | 남은 정도를 설명할 수 있음                     |
| 장시간 백그라운드 작업               | 지속 상태 + 진행/취소/다른 작업 허용 | 사용자를 화면에 묶어 두지 않음                 |
| 진행률을 **모르는 장시간 생성**       | 생성 중 셸 (아이콘 breathe 루프)      | 미디어 생성처럼 수십 초가 걸리고 자리 모양도 진행률도 모르는 곳 |

**글자만 있던 자리에 스피너를 새로 붙이지 않는다.** 문구로 진행을 말하는 자리는 글자 쉬머가 정본이다 —
아래 「문구형 로딩은 글자 쉬머」. 이미 `InlineLoadingLabel`(스피너)이 붙은 버튼은 그대로 두고 일괄로
뜯어 고치지 않는다. 구조를 아는 자리는 Skeleton, 독립된 작은 영역은 Spinner 가 여전히 맞다 — 글자 쉬머는
그 둘을 대신하지 않고 **글자가 이미 상태를 말하는 자리**만 가져간다.

## 문구형 로딩은 글자 쉬머

> 출처: 2026-10-07, 제품 하이라이트 새 화면 작업 브랜치(`feat/highlight-new-screen`). 제품은
> `LoadingWord` 를 **문구형 로딩의 정본**으로 선언하고 블록 로딩과 버튼 진행 상태를 스피너에서 이쪽으로
> 옮겼다. 부품은 [Loading Word](../components/loading-word.md) 이고 `.louis-loading-word` 레시피가 서 있다.
> **Figma 는 아직 없다.**

**규칙.**

1. **글자로 진행을 말하는 자리는 글자 자체를 쉬머로 흘린다.** 스피너를 더하지 않는다. 화면 · 패널 ·
   표 본문의 블록 로딩이 그렇고, 진행 중에 라벨을 진행 문구로 갈아 끼우는 버튼도 그렇다.
2. **진행 문구에 말줄임표를 쓰지 않는다.** 흐르는 글자가 이미 「진행 중」을 말한다. 위 「문구」 절의 규칙과
   같은 말이다. 글자 쉬머 쪽에는 꼬리 말줄임표를 대신 떼어 주는 방어가 없어 **문구를 넘기는 쪽이 지킨다.**
3. **영역이 상태를 알리고 글자는 읽힌다.** 블록 로딩은 영역이 `role="status"` · `aria-live="polite"` 와
   문맥 이름을 갖는다. 글자 쉬머는 **자리표시가 아니라 읽히는 텍스트**라 Skeleton 의 `aria-hidden` 을
   적용하지 않는다.
4. **reduced-motion 에서 흐르지 않고 글자는 읽히는 잉크로 남는다.** 흐름이 사라지는 것이지 문구가
   사라지는 것이 아니다.

**버튼의 진행 상태.**

| 순서 | 한다 | 이유 |
| --- | --- | --- |
| 1 | 라벨을 진행 문구로 갈아 끼우고 그 문구를 글자 쉬머로 감싼다 (「클립 추출」 → 「클립 추출 중」) | 무엇이 시작됐는지가 글자로 전해진다. 스피너를 더하지 않는다 |
| 2 | 네이티브 `disabled` 가 아니라 **`aria-disabled`** 를 건다 | 눌린 버튼이 `disabled` 가 되면 브라우저가 초점을 버린다. 키보드 사용자가 자리를 잃지 않게 한다 |
| 3 | activation 을 **명시적으로 막는다** (진행 중에는 핸들러를 빼거나 첫 줄에서 돌려보낸다) | `aria-disabled` 는 막아 주지 않는다 — 문구만 바꾸고 핸들러를 살려 두면 또 눌린다 |

위 「생명주기」의 Start 에 있는 `aria-busy` 와는 다른 줄이다. `aria-busy` 는 영역이 소유하고, 이 버튼의
`aria-disabled` 는 눌린 컨트롤이 초점을 유지하는 방법이다. 제품 안에서 확인 창의 확인 버튼은 아직 네이티브
`disabled` 를 두고 문구만 흘리는 갈래가 남아 있다 — [Loading Word](../components/loading-word.md) 의
Known deviations.

**값은 컴포넌트가 소유한다.** 그라디언트 · 주기 · reduced-motion 의 단색 잉크는 이 문서가 아니라
[Loading Word](../components/loading-word.md) 의 Specification 이 정본이다. 아래 「시머 텍스트 — 관측
기준선」은 그 값을 세우기 전의 제품 관측이며 두 판정(흐름 값 · reduced-motion)은 그쪽에서 내려졌다.

## 생성 중 셸 — 제품 실측

**미디어 생성은 위 여섯 중 어디에도 안 맞는다.** 수십 초가 걸리는데 진행률을 모르고, 나타날
콘텐츠의 구조도 모른다 — Skeleton도 Determinate도 쓸 수 없다. 제품은 **매체 아이콘 하나를
호흡시키는** 일곱 번째 표현을 쓴다.

| 축 | 값 |
| --- | --- |
| 아이콘 박스 | `64px` |
| 아이콘 색 | 매체별 accent — Image `--accent-green-500`(`ImageNode.tsx:332`) · Video `--primary-500`(`VideoNode.tsx:240`) · Text `--accent-yellow-500`(`TextNode.tsx:321`) · Edit `--accent-violet-500`(`EditNode.tsx:375`) |
| 셸 | `flex column` · 가운데 정렬 · `gap: 4px` · `width/height: 100%` · `min-height: 120px` |
| 셸 기타 | `overflow: hidden` · `pointer-events: none` |
| 캡션 | 아이콘 **다음에 오는 i18n 단계 라벨** — `type-body-14-medium` · 매체 accent(Image 는 다크 `--accent-green-100` / 라이트 `--accent-green-700`, `ImageNode.tsx:351-352`) |
| 시맨틱 | **`role="status"` · `aria-live="polite"`** |

**읽히는 것은 캡션이다.** 셸이 `role="status"`·`aria-live="polite"` 를 갖는데 그 안에서 텍스트를
가진 자식은 캡션 하나뿐이다 — 아이콘은 `aria-hidden` 이다(`ImageNode.tsx:731-749`). 시맨틱만 계약하고
캡션을 계약하지 않으면 **읽어 줄 문장이 없는 live region** 이 된다. Image 셸은 아이콘과 캡션 둘이
전부이고, Edit 셸은 같은 두 자식에 진행 채움과 `role="progressbar"` 가 더 붙는다
(`EditNode.tsx:568-593`).

모션은 **2단이고 이어 붙는다.**

| 단계 | 값 |
| --- | --- |
| 등장 | `media-icon-grow-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both` — `scale(0.8)` + `opacity 0` → `scale(1)` + `opacity 1` |
| 호흡 | `media-icon-breathe 1000ms cubic-bezier(0.34, 1.56, 0.64, 1) 320ms infinite` — `0%·100% scale(1)` / `50% scale(1.14)` |

**딜레이 320ms가 등장 길이와 같고, 호흡의 `0%`가 등장의 종료값과 같다.** 그래서 이어질 때 튀지
않는다. **두 값을 따로 정하면 반드시 튄다.**

`prefers-reduced-motion`에서 `animation: none`이라 **두 단계가 함께 사라지고 `scale(1)`에서
멈춘다.** 아이콘은 그대로 보인다.

### Motion 계약과 어긋나는 두 가지

**[Motion](../foundations/motion.md)의 loop 계약이 이 표현을 담지 못한다.**

1. 허용 property에 `transform`/`scale`이 없다 — 현재 셋(`opacity` · `rotate` ·
   `background-position`)뿐이다.
2. loop recipe 둘(등속 회전 · standard 시머) 어느 쪽도 **overshoot 곡선**
   (`cubic-bezier(0.34, 1.56, 0.64, 1)`)이 아니다. 이 곡선은 1을 넘었다 돌아온다.

**판정이 필요하다.** loop에 `transform` 축과 overshoot recipe를 추가할지, 이 표현을 제품 전용으로
둘지. 정하지 않으면 화면을 조립할 때마다 곡선을 지어내게 된다.

근거: `nodes/ImageNode.tsx:328-334` · `keyframes.css:410`·`:422`.

## 시간과 피드백

- 매우 짧은 응답은 불필요한 깜빡임을 만들지 않도록 표시를 지연할 수 있다. 공통 threshold는 P2 motion
  결정 전까지 package에 하드코딩하지 않는다.
- 4초를 넘길 가능성이 있으면 `처리 중` 같은 구체적 상태 문구를 함께 제공한다.
- 10초 이상이면 현재 단계, 실패 가능성, 재시도 또는 취소 방법을 제공한다.
- 1분 이상이면 백그라운드 처리와 화면 이탈 후 재확인 경로를 우선 검토한다.

## 생명주기

1. **Start** — 입력을 수락하고 중복 실행을 차단한다. 해당 컨트롤에 `aria-busy`를 제공한다.
2. **Progress** — 작업 대상과 상태를 유지한다. 진행률을 알면 determinate UI를 쓴다.
3. **Success** — 결과가 화면 자체로 분명하면 별도 성공 Toast를 중복해서 띄우지 않는다.
4. **Failure** — 원인, 영향, 다음 행동을 해당 영역 가까이에 제공한다. 재시도 가능 여부를 명시한다.
5. **Cancel** — 취소가 가능한 긴 작업은 진행 상태 안에서 직접 취소할 수 있게 한다.

## 문구

- `생성 중`, `업로드 중`, `Analyzing`처럼 상태를 구체적으로 쓴다.
- 진행 문구 끝의 `...`/`…`는 사용하지 않는다.
- `Loading` 같은 범용 접근성 라벨 대신 화면의 i18n 문구를 제공한다.
- 실패 문구는 `오류가 발생했습니다`로 끝내지 않고 사용자가 할 수 있는 다음 행동을 포함한다.

## Accessibility

- 독립 Spinner는 `role="status"`, `aria-live="polite"`, `aria-busy="true"`와 문맥별 이름을 가진다.
- 인접 텍스트가 상태를 설명하면 Spinner는 `decorative`로 두고 부모가 접근 가능한 이름을 소유한다.
- Skeleton은 장식으로 숨기고, 실제 로딩 영역이 `aria-busy`를 소유한다.
- `prefers-reduced-motion: reduce`에서는 회전·shimmer를 정적 상태로 바꾸되 로딩 의미는 텍스트로
  유지한다.
- 로딩 중 기존 콘텐츠를 제거해 포커스가 예기치 않게 사라지지 않게 한다.

## Implementation status

Web과 Figma 구현은 아직 `not-ready`다. 기존 제품의 spinner, inline loading, skeleton/shimmer 근거는
[`KP-LOADING-001`](../../migration/product-baseline.md)에 비규범 기준선으로 보존한다.

## Pre-implementation blockers

- 공용 Spinner, Skeleton과 Button loading API가 없다.
- live region과 `aria-busy` 조합 test가 없다.
- reduced-motion recipe와 progress semantics가 package로 배포되지 않는다.
- Figma loading state 가 template 축으로 대조되지 않는다 — 패턴의 대조 상대인
  `figma/templates.measured.json` 은 고정 커밋의 제품 실측이라 「지금 코드가 그 값을 만든다」가
  서지 않는다. **게시 여부는 이 결손과 무관하다**
  ([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)).

## Acceptance tests

- 승인된 delay threshold 안의 짧은 작업에서 불필요한 flash가 없고, 지연 후에는 무엇을 기다리는지
  이름이 보인다.
- loading 중 중복 activation이 차단되며 기존 focus가 제거되지 않는다.
- indeterminate와 determinate 상태가 screen reader에 중복 없이 전달된다.
- 실패 시 loading UI가 사라지고 오류, retry 또는 cancel 경로가 제공된다.
- Skeleton은 접근성 트리에서 숨고 실제 영역이 `aria-busy`를 소유한다.
- reduced-motion에서 회전·shimmer를 제거해도 텍스트로 상태를 이해할 수 있다.
- 200% zoom과 KO/EN/JA 긴 문구에서 상태와 핵심 action이 잘리지 않는다.

## 구현 (2026-08-18)

**새 CSS가 없다.** 이 패턴은 컴포넌트가 아니라 **경계**다 — 무엇을 언제 쓰는가와 누가 로딩을
알리는가를 정한다. 부품은 [Spinner](../components/spinner.md)와
[Skeleton](../components/skeleton.md)이 이미 소유한다.

### 무엇을 쓰는가

| 자리 | 쓰는 것 | 왜 |
| --- | --- | --- |
| 올 내용의 **모양을 아는** 곳 | Skeleton | 목록 행·카드 격자·프로필 머리. 도착했을 때 화면이 튀지 않는다 |
| 모양을 **모르는** 곳 | Spinner | 버튼 안, 짧은 동작. 틀린 자리표시는 없는 것보다 나쁘다 |
| 진행률을 **아는** 곳 | 아직 없다 | determinate progress는 카탈로그에 없다. 접근성 계약이 선행이다 |

### 누가 로딩을 알리는가

**영역이 알린다. 자리표시는 장식이다.**

```tsx
<section aria-busy={loading} aria-label="프로젝트 목록">
  {loading ? <Skeleton … /> : <ProjectList … />}
</section>
```

Spinner와 Skeleton은 스스로 읽히지 않는다. 스켈레톤이 여덟 개 놓인 자리에서 각각이 읽히면
같은 말이 여덟 번 들린다. **한 영역이 한 번 말한다.**

끝나면 `aria-busy`가 내려가고 자리표시가 사라진다. 자리표시를 남긴 채 내용을 덧그리지 않는다.

### reduced-motion

Spinner와 Skeleton 모두 반복이 **1회로 끝난다**(DS-D-0016 — loop는 짧아지는 것이 아니라
사라진다). 로딩 중이라는 뜻은 `aria-busy`와 면이 유지하며 움직임이 그 뜻을 만드는 것이 아니다.

### 시머 텍스트 — 관측 기준선

> **2026-10-07 갱신.** 아래는 작업 브랜치가 글자 쉬머를 `LoadingWord` 로 합치기 **전의** 관측이다. 같은
> 변경 단위에서 [Loading Word](../components/loading-word.md) 가 섰고 두 판정이 내려졌다 — 흐름은
> **`motion-shimmer` 주기(1.6s)에 `linear`**(제품 2.2s 와의 편차는 소유자 판정 대기), reduced-motion 은
> **그라디언트를 걷고 단색 잉크**. 수치의 정본은 그쪽 Specification 이고 이 절은 근거로 남긴다.

위 「선택 기준」은 시머 텍스트를 관측 패턴으로 언급했다. 그 관측의 실제 값이 아래다. **규범이
아니라 기준선이다** — 규범으로 올리려면 아래 두 판정(흐름 값 · reduced-motion 잔상)을 먼저 내려야
했고, 위 갱신이 그 판정이다.

**제품은 본문이 완전히 같은 스윕 keyframe을 네 벌, 이름만 바꿔 쓴다.**

| keyframe | 좌표 | 소비처 |
| --- | --- | --- |
| `archiveLoadingSweep` | `keyframes.css:497-500` | `NodeCanvasHomeScene.tsx:160` · `VideoEditScene.tsx:166` · `EditorProjectWorkspace.tsx:151` · `appHomeSceneStyles.ts:154` |
| `archiveLoadingMoreShimmer` | `keyframes.css:503-506` | `NodeCanvasHomeScene.tsx:225` (더 불러오기) |
| `projectLoadingSweep` | `keyframes.css:661-664` | `components/scenes/CreateScene.tsx:141` |
| `statusLoadingSweep` | `keyframes.css:772-779` | `mypage/upgrade/billing-success/page.tsx:95` · `mypage/upgrade/billing-change-success/page.tsx:93` · `mypage/topup/success/page.tsx:95` |

네 벌의 본문은 `from { background-position: 0% 50% }` → `to { background-position: -100% 50% }` 로
같다. **네 이름을 네 개의 다른 흐름으로 보고 Figma에 각각 만들면 틀린다. 하나다.**

**레시피.** 목록 첫 로딩(`components/scenes/NodeCanvasHomeScene.tsx:151-162`) 기준이며 나머지
소비처가 같은 값을 복제한다.

| 축 | 값 | 근거 |
| --- | --- | --- |
| 컨테이너 최소 높이 | **480px** | `NodeCanvasHomeScene.tsx:154` |
| 컨테이너 패딩 | **80px 0** (`py-40 px-0`, `--spacing: 2px`) | 같은 줄 |
| 컨테이너 정렬 | `flex items-center justify-center` | 같은 줄 |
| 라벨 타이포 | **`type-heading-28-medium`** | `NodeCanvasHomeScene.tsx:1322` |
| 라벨 표시 | `inline-block` · `color: transparent` | `NodeCanvasHomeScene.tsx:157` |
| 배경 크기 · 시작 위치 | `200% 100%` · `0% 50%` | `NodeCanvasHomeScene.tsx:157` |
| 클립 | `background-clip: text` + `-webkit-background-clip: text` | `NodeCanvasHomeScene.tsx:158` |
| 흐름 | **`2.2s` · `linear` · `infinite`** | `NodeCanvasHomeScene.tsx:160` |

그라디언트는 9정지점이고 **전부 한 색의 알파 변주다** — 면 색을 고르지 않는다는 Skeleton의 판정과
같은 자리다(`NodeCanvasHomeScene.tsx:156`).

```
linear-gradient(90deg,
  rgb(var(--gray-000-rgb)/20%) 0%,   rgb(var(--gray-000-rgb)/28%) 12%,
  rgb(var(--gray-000-rgb)/88%) 24%,  rgb(var(--gray-000-rgb)/34%) 36%,
  rgb(var(--gray-000-rgb)/20%) 50%,  rgb(var(--gray-000-rgb)/28%) 62%,
  rgb(var(--gray-000-rgb)/88%) 74%,  rgb(var(--gray-000-rgb)/34%) 86%,
  rgb(var(--gray-000-rgb)/20%) 100%)
```

88% 봉우리가 두 번 있는 대칭 파형이고 `background-size: 200% 100%` 와 맞물린다. **2.2s를 봉우리
한 번의 쓸림으로 읽으면 틀린다.**

**색 축은 자리마다 하나만 다르다.** 첫 로딩 시머는 다크 표면을 전제로 `--gray-000-rgb` 하나만 쓴다.
「더 불러오기」 시머만 라이트에서 `--palette-gray-900-rgb` 를 쓰고 `html[data-theme=dark]` 에서
`--palette-gray-000-rgb` 로 갈아끼운다(`NodeCanvasHomeScene.tsx:221`, `NodeCanvasHomeScene.tsx:223`).
둘을 한 색으로 합치면 라이트 테마에서 더 불러오기 문구가 배경에 묻힌다.

**reduced-motion에서 그라디언트가 남는다.** 제품은 애니메이션만 끄고 그라디언트는 그대로 둔다 —
`NodeCanvasHomeScene.tsx:161` 와 `VideoEditScene.tsx:167` 은 미디어 쿼리로, 결제 상태 화면은
`motion-reduce:animate-none` 으로 같은 결과를 낸다(`mypage/upgrade/billing-success/page.tsx:95`).
글자가 계속 `color: transparent` 이므로 정지한 그라디언트가 글자를 그린다. 위 「reduced-motion」의
**1회로 끝난다**와 다르다 — 시머 텍스트는 1회를 돌지 않고 **0프레임에서 멈추고**, 그 자리에서 글자가
20%~88% 알파로 얼룩진 채 남는다. 규범화할 때 이 얼룩을 허용할지 균일 알파로 떨어뜨릴지 판정이
필요하다.

**자리표시가 읽힌다.** `<section aria-live="polite">` 안의 `<span role="status" aria-label={…}>`
구조다(`NodeCanvasHomeScene.tsx:1320-1324`). 영역 구조는 위 「누가 로딩을 알리는가」와 같지만
**자리표시가 `aria-hidden` 이 아니라 읽히는 텍스트**라는 점이 Skeleton과 다르다. 시머 텍스트에
「자리표시는 장식이다」를 그대로 적용하면 로딩 문구가 통째로 사라진다. 결제 상태 화면은 더 나아가
**로딩 동안 제목·설명·오류·메타·액션을 렌더하지 않고 이 단어 하나만 남긴다**
(`mypage/upgrade/billing-success/page.tsx:423-431`) — 카드 안의 장식이 아니라 화면 전체의 상태다.

**흐름 값이 정본과 다르다.**

| 출처 | 주기 | easing |
| --- | ---: | --- |
| `motion-shimmer` — [motion](../foundations/motion.md) | 1.6s | `easing-standard`(가감속) |
| 제품의 시머 텍스트 아홉 곳 | 2.2s | `linear`(등속) |

[DS-D-0017](../governance/decisions/DS-D-0017-keyframe-contract.md)이 loop에 `background-position` 을
허용하므로 **기법 자체는 게이트를 통과한다. 걸리는 것은 값이다.** motion은 「자리표시의 쓸림에는
가감속이 맞으며 제품도 그렇게 쓴다」고 적지만 그것은 **면** 자리표시의 인구조사이고, **텍스트 시머는
아홉 곳이 전부 등속이다.** 1.6s·가감속으로 끌어오든 2.2s·등속을 정본으로 세우든 하나를 골라야 한다.
고르지 않으면 같은 화면에서 [Skeleton](../components/skeleton.md)과 시머 텍스트가 서로 다른 속도로
돈다.

### Acceptance tests

1. 자리표시는 전부 `aria-hidden`이고 영역이 `aria-busy`를 갖는다.
2. 끝나면 `aria-busy`가 내려가고 자리표시가 사라진다.
3. 모양을 아는 자리와 모르는 자리가 서로 다른 것을 쓴다.
4. reduced-motion에서 Spinner·Skeleton 모두 반복이 1회다.
5. 합성에 접근성 위반이 없다.

### 남은 것

determinate progress. 인계서 (1c)가 "접근성 계약부터 정해야 한다"로 남겨 두었고 제품 전체에
`role="progressbar"`가 1곳뿐이다. 그것이 서기 전까지 이 패턴은 두 갈래만 소유한다.
