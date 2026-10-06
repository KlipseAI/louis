---
id: inline-loading-label
status: experimental
authority: normative
summary: 버튼 라벨 옆에서 스피너 자리를 열고 닫아 작업이 도는 중임을 보입니다.
---

# Inline Loading Label

버튼이나 행 안의 **라벨 한 줄**과, 그 오른쪽에서 열리고 닫히는 **스피너 자리**. 작업이 시작되면
문구가 바뀌고 옆자리가 열린다.

**정본은 제품이다.** `InlineLoadingLabel.tsx` 가 구현이고 LOUIS 에는 표면이 없다 —
`packages/css/src/component` 에 레시피가 없고 `packages/react/src` 에도 디렉터리가 없다. 소비처는
**13개 파일 · 20개 호출부**다(로그인 · 회원가입 · 가입 메일 확인 · 비밀번호 재설정 두 화면 · 계정
복구 · AWS 가입이 각 1, 설정 6, 구독 2, 아카이브의 플랫폼 섹션 2, 프로젝트 생성 모달 1, YouTube
노드 1, Instagram 노드 1).

**이 컴포넌트는 로딩 표현 규범의 집행 장치다.** 제품 저장소의 `docs/design/loading-states.md` 는
진행 중을 「말줄임표가 아니라 스피너」로 보이라고 정한다. 규범을 저작에만 맡기면 문구에 박힌
`...` 가 그대로 화면에 나가므로, 이 컴포넌트가 두 가지를 동시에 한다 — 스피너를 붙이고, 로딩
문구의 꼬리 말줄임표를 런타임에 떼어낸다. [Loading](../patterns/loading.md) 의 선택 기준 표에서
「버튼·짧은 인라인 액션」 칸이 이 자리다.

**스피너를 소유하지 않는다.** 도는 링은 [Spinner](./spinner.md) 의 것이고 이 컴포넌트는 그것이
들어앉는 **자리**만 갖는다. 제품은 React 표면이 아니라 LOUIS 의 CSS 레시피(`.louis-spinner` ·
`.louis-spinner__ring`)를 직접 소비하며, 제품 게이트 하나가 그 소비를 클래스 문자열로 고정하고
있다(`check-tailwind-theme.mjs` 의 LOUIS 소비 계약).

**타이포도 색도 갖지 않는다.** 글꼴·크기·색은 전부 감싸는 컨트롤에서 물려받고, 링은
`currentColor` 를 탄다. 그래서 이 컴포넌트에는 상호작용 상태 축이 없다 — 축은 크기와 로딩 여부
둘뿐이다.

## Availability

| Surface       | 상태           | 근거                                                                                                                                                                        |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web           | `not-ready`    | 제품 구현이 정본이고 소비처가 13개 파일 · 20개 호출부다. **LOUIS 표면은 0** — CSS 레시피도 React export 도 없고 acceptance test 도 0건이다. 다만 링만은 LOUIS 레시피를 그대로 소비한다 |
| Figma         | `partial`      | `InlineLoadingLabel` 4 variant(`Size` × `Loading`) + `Label`·`LoadingLabel` TEXT. parity 게이트가 대조하는 것은 속성 축 넷 · raw fill·stroke 0 · 스타일 없는 텍스트 0 · stroke 없음 · effect 없음 · set 설명 유무 · 프레임 밖 넘침 0 · 광학 중앙 이탈 0 이고, 기하도 대조한다 — `figma/components.measured.json` 의 `inline-loading-label`(제품 클래스를 실브라우저에서 잰 값)과 슬롯 지름 16 · 12 · 라벨과 슬롯 사이 6 · 4(닫힘 0) · 안쪽 여백 0 · 반경 0 을 맞댄다. 남은 것은 반대 방향이다 — 코드가 그 실측을 여전히 만드는지 되재는 브라우저 테스트가 LOUIS 레시피가 없어 없다 |
| Documentation | `done`         | 이 문서                                                                                                                                                                     |
| Maturity      | `experimental` | 되읽기와 문서가 방금 처음 섰다. 기하 실측이 붙고 증거 락이 현재 판을 가리키면 승격한다                                                                                      |

## When to use

- **컨트롤이 스스로 시작한 작업이 도는 동안.** 제출 버튼, 저장 버튼, 노드의 분석 버튼 — 20 곳이
  전부 그 자리다.
- 쓰지 않는 자리:
  - **독립된 영역의 로딩** — [Spinner](./spinner.md) 를 짧은 문구와 함께 놓는다. 그쪽은 `label`
    을 받으면 스스로 `role="status"` 로 알린다. 이 컴포넌트는 알리지 않는다(아래 Accessibility).
  - **진행률을 아는 작업** — [Progress](./progress.md) 다. 도는 링은 남은 정도에 대해 아무것도
    말하지 않는다.
  - **구조가 정해진 콘텐츠의 첫 로드** — [Skeleton](./skeleton.md) 이다.
  - **버튼 자체의 로딩 축** — LOUIS [Button](./button.md) 의 `State=Loading` 은 버튼이 자기 라벨
    `1em` 에 링을 더해 만드는 별개 표시다. **제품 Button 에는 `loading` prop 도 스피너 요소도
    없다** — 제품에서 버튼의 로딩은 버튼이 아니라 그 안의 이 라벨이 갖는다. 둘을 같이 쓰면
    스피너가 둘이 된다.

## Anatomy

1. **Root** — `<span>`. 가로 inline-flex, 가운데 정렬. 면도 여백도 반경도 없다 — 되읽기의
   padding 넷과 `cornerRadius` 가 전부 0 이다.
2. **Label** — 글자 한 줄. `flex-none` 이라 줄지도 줄바꿈하지도 않는다.
3. **Slot** — 링을 담는 상자. **높이는 크기 축만 정하고, 폭은 로딩 여부가 열고 닫되 열린
   값은 크기 축이 정한다**(md 16 · sm 12). `overflow: hidden`.
4. **Spinner** — [Spinner](./spinner.md) 의 링. 지름이 슬롯과 같다(md 16 · sm 12).

**슬롯은 닫혀 있어도 사라지지 않는다.** 제품은 링을 항상 그려 두고 폭 0 으로 접는다 — 그래야
폭·여백·불투명도·scale 이 전이될 수 있다. 회전만 `paused` 로 세워 둔다. Figma 는 반대로 닫힌
변형에서 레이어를 **숨긴다**(Known deviations 1).

## Properties

정본은 제품 컴포넌트의 prop 이다. 넷뿐이고 그중 둘이 문구다.

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `loading` | boolean | 없음 | 슬롯을 열고 문구를 바꾼다. **필수다** |
| `idleLabel` | ReactNode | 없음 | 평소 문구. **문자열이 아닐 수 있다** — 아이콘을 낀 조립도 받는다 |
| `loadingLabel` | string | 없음 | 로딩 문구. **문자열이어야 한다** — 꼬리 말줄임표를 떼어내기 때문이다 |
| `size` | `md` \| `sm` | `md` | 슬롯 지름과 왼쪽 여백만 바꾼다. 라벨은 건드리지 않는다 |

Figma 의 축은 이것과 이렇게 대응한다.

| Figma | 타입 | 코드 대응 |
| --- | --- | --- |
| `Label` | TEXT | `idleLabel`. 코드에서 `ReactNode` 라 문자열 슬롯으로 완전히 대응하지는 않는다 |
| `LoadingLabel` | TEXT | `loadingLabel`. **Figma 에는 꼬리 말줄임표 제거가 없다**(Known deviations 2) |
| `Size` | VARIANT `md` · `sm` | `size` |
| `Loading` | VARIANT `false` · `true` | `loading` |

**대조할 코드 선언이 없다.** LOUIS 에 이 컴포넌트의 타입이 없으므로 네 축 전부가 parity 계약에서
`figmaAhead` 의 Figma 전용 property 로 선언된다 — 옵션이 코드 union 과 맞는지는 아무도 보지
않는다.

## Variants, sizes, and states

| 축 | 값 | 무엇이 바뀌나 |
| --- | --- | --- |
| `Size` | `md` · `sm` | 슬롯 지름(16 · 12)과 왼쪽 여백(6 · 4). **라벨은 그대로다** |
| `Loading` | `false` · `true` | 문구 교체와 슬롯 개폐. 아래 States |

두 축은 직교하고 4 = 2 × 2 가 전부 존재한다. **`variantCount` 4 는 조합 예산 안이다.**

**상호작용 상태 축이 없다.** hover · focus · active · disabled 는 전부 감싸는 버튼이 받는다 —
이 컴포넌트는 `<span>` 이라 포인터도 키보드도 받지 않는다. `State` 축을 만들면 Figma 가 없는 것을
있는 것처럼 보여 준다.

**`Size` 가 타이포를 바꾸지 않는 것이 맞다.** 되읽기의 네 변형 모두 라벨이 14 / 150% 이고, 제품도
슬롯 클래스만 갈아 끼운다. LOUIS Button 이 「타이포는 size 축이 아니다」로 서 있는 것과 같은
결정이다.

## States

값은 제품 소스에서 끌어왔다. 슬롯의 **네 프로퍼티가 함께 움직인다.**

| 축 | 닫힘 (`Loading=false`) | 열림 md | 열림 sm |
| --- | ---: | ---: | ---: |
| 슬롯 폭 | 0 | 16 | 12 |
| 슬롯 왼쪽 여백 | 0 | 6 | 4 |
| 슬롯 불투명도 | 0 | 1 | 1 |
| 슬롯 scale | 0.85 | 1 | 1 |
| 슬롯 높이 | md 16 · sm 12 | 같음 | 같음 |
| 회전 | `paused` | `running` | `running` |
| 라벨 | `idleLabel` | 꼬리 말줄임표를 뗀 `loadingLabel` | 같음 |

- **폭만 키우면 안 된다.** 폭과 왼쪽 여백을 함께 0 에서 키워야 문구가 처음부터 밀려 앉지 않는다.
  불투명도만 바꾸면 자리가 처음부터 비어 있어 아무것도 움직이지 않는다.
- **전환은 두 짝이 서로 다르다.** 폭·왼쪽 여백이 `200ms cubic-bezier(0.22, 1, 0.36, 1)`,
  불투명도·transform 이 `180ms ease` 다. 네 축을 한 곡선으로 묶으면 자리가 열리는 속도와 링이
  떠오르는 속도가 같아져 「밀려 들어온다」는 인상이 사라진다.
- **라벨 교체에는 전환이 없다.** 문구는 즉시 바뀐다(아래 Interaction).
- **닫힘 값과 열림 값이 상호배타 분기로 갈라져 있다.** 원본 모듈 CSS 에서는 열림 클래스가 소스
  순서로 이겼는데, 유틸리티는 정렬이 순서를 대신 정하므로 그대로 옮기면 승패가 뒤집힌다. 그래서
  네 프로퍼티를 한쪽만 내보내는 삼항으로 적었다 — 제품 소스 주석이 그 이유를 갖고 있다.

## Interaction and responsive behavior

- **버튼 폭이 두 번 움직인다.** 문구 교체는 즉시고 슬롯은 200ms 다. Figma 되읽기가 그 점프를
  수치로 보여 준다 — 라벨 폭이 25 에서 40 으로 갈아 끼워지고, 그 위에 6 + 16(md) 또는 4 + 12(sm)
  가 더해진다. **평소 폭을 미리 잡아 두는 장치가 없다.**
- **긴 문구를 이 컴포넌트가 처리하지 않는다.** 라벨이 `flex-none` 이라 줄바꿈도 축소도 말줄임도
  하지 않는다. 좁은 폭에서 무엇이 일어나는지는 감싸는 버튼이 정하며, **이 저장소에서 실측하지
  않았다**(결손).
- **`prefers-reduced-motion` 에서 슬롯 전이는 그대로 돈다.** 축소 선언이 제품에도 LOUIS 에도
  없다. 사라지는 것은 회전뿐이다 — LOUIS 레시피가 지속을 0ms 로, 반복을 1회로 바꾼다
  (Known deviations 8).
- 좁은 화면 거동이 따로 없다. 이 컴포넌트는 폭을 스스로 정하지 않는다.
- 포인터·키보드 계약이 없다. 감싸는 버튼이 전부 소유한다.

## Content

- **로딩 문구는 끝에 점을 붙이지 않는다.** `docs/design/loading-states.md` 3항이 그 규칙이고,
  이 컴포넌트가 그것을 런타임에 강제한다 — `...`(마침표 셋)와 `…`(U+2026) 를 둘 다, 앞뒤 공백까지
  함께, **문구 끝에서만** 걷어낸다. 문장 중간의 말줄임표는 뜻을 가질 수 있어 건드리지 않는다.
- **그 방어가 지금도 일하고 있다.** 제품 i18n 에는 말줄임표가 박힌 자리가 여럿 남아 있다 —
  `가입 중...` · `Saving...` · `保存中...`. **이 컴포넌트를 거치는 자리라 화면에는 나가지
  않지만 정본 문구는 여전히 규칙과 어긋나 있다.** 방어를 빼면 그 자리들이 한꺼번에 드러난다.
- **평소 문구는 손대지 않는다.** `idleLabel` 은 `ReactNode` 라 애초에 문자열이 아닐 수 있고,
  거기에는 말줄임표가 대신할 회전도 없다.
- 문구는 「무엇이 도는가」를 말한다. `로딩` 이 아니라 `저장 중` · `분석 중`.

| | KO | EN | JA |
| --- | --- | --- | --- |
| 로그인 · 평소 | `로그인` | `Log in` | `ログイン` |
| 로그인 · 로딩 | `로그인 중` | `Logging in` | `ログイン中` |
| 가입 · 로딩 | `가입 중...` | `Signing up...` | `登録中...` |
| 저장 · 로딩 | `저장 중...` | `Saving...` | `保存中...` |
| 분석 · 로딩 | `분석 중` | `Analyzing` | `分析中` |

가입과 저장 **두 행**은 세 언어 모두 말줄임표가 붙은 채로 i18n 에 들어 있고 화면에서 잘려
나간다. 로그인과 분석 줄이 규칙을 지킨 모습이다.

문구 결손이 둘 있다. 하나는 계정 삭제의 로딩 문구가 한국어 자리에 영어 `Deleting...` 로 들어
있는 것이다 — 번역 누락이며 이 컴포넌트가 고칠 수 있는 것이 아니다.

다른 하나는 **방어가 닿지 않는 자리**다. 쿠폰 등록의 `coupon.submitting`(`등록 중…`)은 이
컴포넌트를 쓰지 않는다 — `SubscriptionScene.tsx` 의 쿠폰 등록 버튼이 문자열을 `<Button>` 안에
직접 넣는다. 그래서 U+2026 이 깎이지 않고 **그대로 화면에 나간다.** 규칙 위반이지만 이
컴포넌트가 막을 수 있는 것이 아니다 — 그 버튼을 이 컴포넌트로 옮기든지, 문구에서 말줄임표를
빼든지 둘 중 하나여야 한다.

## Accessibility

- **슬롯이 `aria-hidden="true"` 다.** 링은 보조기술에 존재하지 않는다. [Spinner](./spinner.md) 의
  「`label` 이 없으면 숨는다」와 같은 계약이다.
- **이 컴포넌트는 상태를 전달하지 않는다.** 정본에 `role` 도 `aria-live` 도 `aria-busy` 도
  없다 — 세 개의 `<span>`(Root · Label · Slot)과 그 안의 링 둘이 전부이고, Slot 부터가
  `aria-hidden` 이라 보조기술에는 Root 와 Label 만 남는다. 없는 것을 있다고 적지 않기 위해
  그대로 적는다.
- 진행을 알리는 일은 **감싸는 컨트롤**이 한다. 네이티브 `disabled` 와 바뀐 문구 둘이다.
- **`aria-busy` 를 붙인 호출부는 20 중 셋뿐이다** — 프로젝트 생성 모달 · YouTube 노드 ·
  Instagram 노드. 나머지 열일곱은 `disabled` 만 건다.
- **바뀐 문구는 live region 안에 있지 않다.** 문구 교체가 스크린리더에 자동으로 읽힌다는 보장이
  없고, 눌린 버튼이 곧바로 `disabled` 가 되므로 포커스와 알림 거동은 브라우저에 달려 있다 —
  **이 저장소에서 실측하지 않았다**(결손).
- **reduce 대체 계약이 열일곱 곳에서 성립하지 않는다.** [Spinner](./spinner.md) 는 「회전이 멈춰도
  `role="status"` 와 `aria-busy` 가 의미를 유지한다」를 loop 의 reduce 대체로 세웠는데, 이 자리는
  회전이 멈추면 **아무것도 남지 않는** 호출부가 열일곱이다. `aria-busy` 를 소비처 계약으로
  올릴지, 이 컴포넌트가 직접 걸지는 **소유자 판정**이다.
- 타깃 크기와 포커스 표시는 감싸는 버튼이 소유한다 — 이 컴포넌트에는 둘 다 없다.
- 확대에서 라벨이 줄지 않는다. 잘림이 아니라 넘침이 된다.

## Specification

| Part/state | 값 | 토큰·근거 |
| --- | --- | --- |
| Root | inline-flex · 가운데 정렬 · `min-width: 0` · `max-width: 100%` | 면·여백·반경 없음. 되읽기의 padding 넷과 `cornerRadius` 가 0 |
| Label | 한 줄. 축소·줄바꿈·말줄임 없음 | `flex-none`. 글꼴·크기·색은 감싸는 컨트롤에서 물려받는다 |
| 라벨 타이포(Figma) | 14 / 150% | `typography/body-sm`. **Figma 가 고정한 값이고 제품은 소유하지 않는다**(Known deviations 4) |
| 슬롯 높이 | md 16 · sm 12 | 로딩 여부와 무관하다 |
| 슬롯 폭 | 0 → md 16 · sm 12 | 2px 그리드 유틸리티 |
| 슬롯 왼쪽 여백 | 0 → md 6 · sm 4 | Figma 는 같은 값을 프레임 `itemSpacing` 으로 갖는다 |
| 슬롯 불투명도 | 0 → 1 | — |
| 슬롯 scale | 0.85 → 1 | — |
| 슬롯 넘침 | `overflow: hidden` | 폭 0 으로 접히는 동안 링이 삐져나오지 않게 잡는다 |
| 전환 (폭 · 왼쪽 여백) | 200ms `cubic-bezier(0.22, 1, 0.36, 1)` | — |
| 전환 (불투명도 · transform) | 180ms `ease` | 두 짝을 다르게 둔 이유는 States |
| 스피너 | md 지름 16 · 링 2 / sm 지름 12 · 링 1 | `.louis-spinner` — [Spinner](./spinner.md) 의 Specification |
| 회전 | 700ms 등속 | `motion-spin`(`--louis-motion-spin-duration` · `cubic-bezier(0, 0, 1, 1)`) |
| 회전 정지 | 닫힘에서 `animation-play-state: paused` | 보이지 않는 애니메이션이 프레임을 먹지 않게 한다 |
| reduced-motion | 회전만 사라진다(0ms · 1회) | LOUIS 레시피가 소유한다. 슬롯 전이는 그대로다 |
| 로딩 문구 | 꼬리 `...` · `…` 와 그 앞뒤 공백 제거 | `stripTrailingEllipsis` |
| 간격 토큰 | **없다** | 6 · 4 와 값이 같은 토큰은 있으나(`space-overlay-item-content-gap` 6 · `space-control-xs` 4) 뜻이 다른 자리의 것이다. **승격 조건은 적혀 있지 않다** — `design/foundations/spacing-radius.md` 가 「두 개 이상의 사용처」를 조건으로 두는 것은 Radius model 의 radius literal 이고, Spacing model 에는 대응하는 줄이 없다 |

## Known deviations

1. **Figma 는 닫힌 변형에서 슬롯 레이어를 숨긴다.** 제품은 폭 0 + `overflow: hidden` 인데 Figma 는
   프레임을 0 폭으로 만들 수 없어서다. 그래서 되읽기의 `md/false` · `sm/false` 에 `slots` 가 비어
   있고 `parts` 에도 `Slot` 이 없다 — 발행 스크립트가 숨긴 레이어의 **자손**을 넘침·슬롯·자손 치수
   집계에서 빼기 때문이다(그 예외 처리가 붙은 계기가 바로 이 컴포넌트의 닫힌 변형이다).
   **결과: 닫힘 폭 0 을 어떤 게이트도 대조하지 않는다.** 대조되는 것은 열림뿐이다. 두 매체가 같은
   화면을 서로 다른 방식으로 그리는 것이며 어느 쪽도 틀리지 않았다 — **적어 두지 않으면 다음
   사람이 「Figma 에 슬롯이 빠졌다」고 읽는다.**
2. **꼬리 말줄임표 제거가 Figma 에 없다.** 제품은 `LoadingLabel` 을 화면에 넣기 직전에 깎지만
   Figma 는 적은 그대로 그린다. **같은 i18n 값을 두 매체에 넣으면 화면이 달라진다** —
   `가입 중...` 은 제품에서 `가입 중` 이고 Figma 에서는 `가입 중...` 이다. Figma 쪽에 이 규칙을
   표현할 자리가 없으므로, `LoadingLabel` 슬롯의 예시 문구를 **이미 깎인 형태**로 적어 두는 것이
   현재 할 수 있는 전부다.
3. **`Loading` 축 이름을 조건 축 명부에 올렸다.** 문서를 쓸 때
   `design/governance/figma-component-authoring.md` §2 가 여는 조건 축은 여섯(`Checked` ·
   `Selected` · `Invalid` · `Expanded` · `Featured` · `Collapsed`)이었고 `Loading` 은 거기 없었다.
   판정 근거는 이 컴포넌트의 되읽기다 — 네 시험 중 2·3 에 걸린다: 프레임이 자기 `itemSpacing` 을
   0 ↔ 6·4 로 다시 쓰고(2), 닫힘과 열림 사이에 Smart Animate 를 걸어야 한다(3). 시험에 적히지
   않은 한계도 하나 있다 — 두 조건에서 **보이는 텍스트 프로퍼티가 서로 다르다**
   (`Label` ↔ `LoadingLabel`). BOOLEAN 으로 그리려면 두 텍스트 레이어를 반대 가시성으로 묶어야
   하는데 Figma 에 그 부정이 없다. 명부는 여섯에서 일곱이 됐다. **이름이 열린 것을 「`Loading` 은
   늘 축」으로 읽지 마라** — 축이냐 BOOLEAN 이냐는 컴포넌트마다 네 시험이 정하고, LOUIS
   [Button](./button.md) 의 `Loading` 은 아직 그 판정을 받지 않았다(§2 「이 개정이 남긴 결손」 3).
4. **타이포를 Figma 가 고정하고 제품은 소유하지 않는다.** 제품 컴포넌트에는 글꼴·크기·색 선언이
   하나도 없고 전부 감싸는 컨트롤에서 물려받는다. Figma 는 무언가는 그려야 하므로 네 변형 모두
   14 / 150% 로 고정했다. 확인한 소비처에서는 값이 맞는다 — LOUIS Button 이 lg·md 모두 14 이고,
   아카이브의 자체 버튼도 `type-body-14-medium` 이다. **맞는 것은 우연이 아니라 현재 상태일
   뿐이며, 12 나 16 짜리 컨트롤 안에 놓이는 순간 Figma 만 어긋난다.**
5. **기하는 한 방향으로만 대조된다.** `figma/components.measured.json` 의 `inline-loading-label` 이
   제품 클래스를 실브라우저에서 잰 16 · 12 · 6 · 4 를 갖고, parity 게이트가 Figma 를 그것과
   맞댄다 — 6 · 4 는 제품에서 슬롯의 `margin-left` 이고 Figma 에서는 `itemSpacing` 이다. 코드가 그
   실측을 여전히 만드는지 되재는 브라우저 테스트는 LOUIS 레시피가 없어 없다. **scale 0.85 와 닫힘
   폭 0 은 대조하지 않는다** — 0.85 는 기하가 아니라 transform 이고, 닫힘 변형은 되읽기에 슬롯
   레이어가 없다.
6. **증거 락이 이 파일의 옛 판을 가리킨다.** `migration/product-evidence.lock.json` 이 고정한 blob
   은 링을 **자체 유틸리티 묶음**으로 그리던 판이고, 지금 제품은 LOUIS `.louis-spinner` 레시피를
   소비한다. 그래서 [Spinner](./spinner.md) 의 「인라인 로딩 슬롯」 표가 인용하는 좌표와 회전
   구현(자체 keyframe)이 현재 소스와 다르다. **슬롯 기하 네 값은 두 판이 같다** — 달라진 것은 링을
   누가 그리는가다. 락을 현재 판으로 올리고 그 표를 함께 고치는 것이 승격 조건 하나다.
7. **슬롯이 `Spinner` 인스턴스인지 되읽기로 확정되지 않는다.** 되읽기는 노드 종류를 담지 않는다.
   정황은 맞는다 — 되읽기가 INSTANCE 내부로 들어가지 않는데 `boundFills` 4 가 변형 4 × 라벨 1 로
   남김없이 설명되고, 슬롯 치수 16 × 16 · 12 × 12 가 Spinner set 의 md · sm 과 같다. 다만 **빈
   프레임이어도 같은 수가 나온다.** 인스턴스 여부 확인은 파일에서 해야 한다.
8. **reduced-motion 에서 슬롯 전이가 그대로 돈다.** 사라지는 것은 회전뿐이고, 폭·여백·불투명도·
   scale 네 축은 축소 선언이 없어 200ms · 180ms 그대로 움직인다. 제품 전역에도 이 자리를 덮는
   선언이 없다. 움직임이 작아 지금까지 문제로 잡히지 않았을 뿐이며 **판정을 받은 적은 없다.**
9. **`aria-busy` 가 소비처마다 다르다.** 20 중 셋만 붙인다. 컴포넌트가 알리지 않기로 한 이상
   그것은 소비처 계약이어야 하는데, 계약으로 적힌 곳이 없어 지금은 습관에 달려 있다
   (Accessibility).
10. **세로 정렬과 정렬 축이 되읽기에 없다.** 열린 md 변형에서 16 짜리 슬롯이 21 높이 안에
    가운데로 앉는데, 발행 스크립트의 채취 명세에 정렬 필드가 없어 그 값이 실려 오지 않는다. 네
    변형의 프레임 높이가 21 로 같다는 것까지가 확인되는 전부다.

## Acceptance tests

1. 변형이 넷이고 축이 `Size`(md · sm) × `Loading`(false · true) 둘이다.
2. `Loading=true` 에서 슬롯이 md 16 × 16 · sm 12 × 12 이고 프레임 `itemSpacing` 이 md 6 · sm 4 다.
3. `Loading=false` 에서 프레임 `itemSpacing` 이 0 이고 되읽기의 `slots` 가 비어 있다 — Figma 가
   슬롯 레이어를 숨긴 결과다. **닫힘 폭 0 은 여기서 시험되지 않는다**(Known deviations 1).
4. 네 변형의 프레임 높이가 모두 21 이고 padding 넷과 `cornerRadius` 가 0 이다.
5. 열림 폭이 라벨 + `itemSpacing` + 슬롯과 맞는다 — md 40 + 6 + 16 = 62, sm 40 + 4 + 12 = 56.
6. `Size` 가 라벨을 건드리지 않는다 — 네 변형 모두 `fontSize` 14 · `lineHeightPercent` 150 이다.
7. Figma 되읽기에서 raw fill · raw stroke · 스타일 없는 텍스트가 각각 0 이고, `boundFills` 4 가
   변형 4 × 라벨 1 로 남김없이 설명된다.
8. stroke 도 effect 도 없다 — 되읽기의 `strokeWeight` 가 비어 있다.
9. 제품에서 로딩 문구의 꼬리 말줄임표가 화면에 나가지 않는다 — `가입 중...` 이 `가입 중` 으로
   그려진다. `...` 와 `…` 를 둘 다 잡는다.
10. 제품에서 슬롯이 `aria-hidden="true"` 이고, 이 컴포넌트가 `role` · `aria-live` · `aria-busy` 를
    갖지 않는다.
11. 제품에서 닫힌 슬롯의 링이 `animation-play-state: paused` 이고 열릴 때 `running` 이 된다.

## Migration and changelog

새로 선 컴포넌트다. 이전 API 가 없다. LOUIS recipe 가 서면 이 문서의 Specification 이 그 값의
정본이 된다. 사용자 영향 변경은 [Updates](../updates/README.md) 에 적는다.
