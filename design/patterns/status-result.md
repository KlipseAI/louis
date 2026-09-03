---
id: status-result
status: experimental
authority: normative
---

# Status Result

결제·구독의 **결과 화면**이 공유하는 콘텐츠 컬럼이다 — 성공 · 실패 · 처리 중 · 결제수단 변경
결과 등 일곱 화면이 같은 뼈대를 쓴다.

**셸이 아니다.** 이 화면들은 [App Shell](app-shell.md)의 메인 카드 안에 들어간다. 이 문서가
소유하는 것은 **그 카드 안의 컬럼**이다.

값은 배포본 인용이며 아직 DS 토큰이 아니다. 간격 환산 기준은 제품의 `--spacing: 2px`다 —
`h-20`은 80px이 아니라 **40px**이다.

## Anatomy

| 부품 | 역할 |
| --- | --- |
| Column | `min(520px, 100%)` 가운데 컬럼. **세로 리듬이 하나뿐이다** |
| Title | `heading-36` medium |
| Description | `body-16` · 전경 56% |
| Alert | 결제 결과 처리 중 잡힌 오류를 알리는 붉은 배너. **제목·설명 다음, Meta list 앞**이다 |
| Meta list | `dt`/`dd` 행 목록. 900px에서 세로로 접힌다 |
| Actions | **전폭 버튼**이 세로로 쌓인다 |

## Layout contract

| 축 | 값 |
| --- | --- |
| 폭 | `min(520px, 100%)` |
| 정렬 | `align-self: center` |
| 배치 | `flex column` |
| 세로 간격 | **`24px` 하나뿐** — 부품마다 다른 간격을 두지 않는다 |
| 면 · 테두리 · 곡률 · 패딩 | **없다.** 컬럼은 투명하다 |

**컬럼 자체는 아무것도 그리지 않는다.** 면과 곡률은 바깥 메인 카드가 갖는다. 컬럼에 카드를 또
그리면 배포본에 없는 이중 면이 된다.

### 상단 오프셋이 상태에 따라 갈린다

| 상태 | 오프셋 |
| --- | --- |
| 기본 | `margin-top: clamp(56px, 10vh, 120px)` |
| 기본 (≤900px) | `56px` 고정 |
| **처리 중** | `margin-top: 0` · `flex: 1 1 auto` · `justify-content: center` |

**처리 중에는 위에서 밀지 않고 카드 안에서 세로 중앙에 온다.** 두 상태는 상호배타이며 같은
화면이 로딩에서 결과로 넘어갈 때 컬럼이 위로 올라붙는다.

## Specification

### Title · Description

| | 값 |
| --- | --- |
| 제목 | `heading-36` size · line-height · `--type-weight-medium` · 전경 `--gray-000` |
| 제목 줄바꿈 | `break-keep` + `overflow-wrap: break-word` |
| 설명 | `body-16` · 전경 `rgb(var(--gray-000-rgb) / 56%)` |
| 설명 줄바꿈 | `white-space: pre-line` — **문구의 줄바꿈이 그대로 살아난다** |

설명이 `pre-line`이므로 **문구에 든 개행이 렌더에 나타난다.** 문구를 한 줄로 합치면 화면이 달라진다.

### Alert (결과 처리 오류)

| 축 | 값 |
| --- | --- |
| 패딩 | `12px 16px` |
| 곡률 | `12px` |
| 면 | `rgb(var(--accent-red-500-rgb) / 8%)` |
| 테두리 | `1px solid rgb(var(--accent-red-500-rgb) / 16%)` |
| 글자 | `--accent-red-500` · `body-14` |

**노드 인라인 오류 배너와 비율이 다르다.** 그쪽은 면 10% / 테두리 20% / 두께 0.5px이고 여기는
**면 8% / 테두리 16% / 두께 1px**이다. 두 자리를 한 값으로 통일하지 않는다.

**「실패 전용」이 아니었다(2026-08-30 정정).** 이 배너가 실재하는 자리는 **성공 라우트 하나**다 —
정기결제 성공 화면이 결제는 통과했는데 구독 반영에서 오류가 잡혔을 때 그 사유를 이 배너로 띄운다
(`billing-success/page.tsx:437`, 상수 선언은 같은 파일 :108). 반대로 업그레이드 실패 · 정기결제
실패 · 결제수단 변경 실패 세 화면에는 **배너가 없고** code · message · orderId 를 아래 Meta list
행으로 보여 준다. 「실패 화면 전용」으로 읽으면 실패 화면에 없는 부품을 그리게 된다.

**순서가 계약이다.** 배너는 **제목·설명 다음 · Meta list 앞**에 온다. 컬럼 맨 위가 아니다 —
사용자가 어느 화면인지 먼저 읽고 그다음에 사유를 읽는다. 순서를 적어 두지 않으면 배너를 맨 위에
그려도 문서로는 틀렸다고 말할 수 없다.

**LOUIS 안에 붉은 배너 사양이 두 벌이다.** [Alert](../components/alert.md)의 정본은 체크아웃 오류
배너(면 12% · 테두리 24% · 반경 20 · 가로 18)이고, 위 표는 그것과 값이 다른 별개의 배너다(면 8% ·
테두리 16% · 반경 12 · 가로 16). **이 화면의 배너는 `.louis-alert` 레시피를 쓰지 않는다** — Alert
문서가 열거하는 제품 소비처 다섯 자리에 결과 화면이 없다. 두 벌은 서로 다른 자리의 서로 다른
값이며 통일 대상이 아니다. 한쪽을 고칠 때 다른 쪽을 함께 본다.

### Meta list

| 축 | ~900px | ≥901px |
| --- | --- | --- |
| 행 배치 | `flex column` | `flex` · `justify-content: space-between` · `align-items: center` |
| 행 간격 | — | `16px` |
| 행 패딩 | `12px 0` | 같음 |
| 행 구분선 | `1px solid rgb(var(--gray-000-rgb) / 8%)` — **마지막 행은 없다** | 같음 |
| `dd` 정렬 | `text-align: left` | `text-align: right` |

**행 간격 16px 은 그림으로 재현되지 않는다.** 행이 `justify-content: space-between`이라 이 gap 은
**최소 간격**으로만 작동하는데, Figma 는 `primaryAxisAlignItems`가 `SPACE_BETWEEN`이면
`itemSpacing`을 무시한다 — 값은 저장되지만 렌더에 나타나지 않는다. 이 저장소의 실측도 같은 이유로
SPACE_BETWEEN 컨테이너의 간격을 0으로 센다([Figma 화면 조립](../governance/figma-screen-assembly.md)의
오탐 표). 그러니 이 축은 **CSS 가 정본이고 Figma 는 대조 대상이 아니다.**

| | `dt` (키) | `dd` (값) |
| --- | --- | --- |
| 크기 | `body-14` = 14px | `body-14` = 14px |
| 굵기 | regular | regular |
| 전경 | `rgb(var(--gray-000-rgb) / 48%)` | `--gray-000` |
| line-height 토큰 | `--type-body-16-line-height` | `--type-body-14-line-height` |
| **렌더 행간** | **21px** | **21px** |

**행간 토큰의 이름은 다르지만 렌더 결과는 같다.** 두 토큰 모두 값이 무단위 `1.5`이고 글자 크기가
둘 다 14px이므로 `14 × 1.5 = 21px`로 동일하다. **「키가 값보다 높은 행 박스를 갖는다」고 읽으면
틀린다** — 이름 차이는 실효가 없는 저작 흔적이다.

**둘 다 굵기를 선언하지 않는다.** 배포본이 `dt`·`dd` 어디에도 `font-weight`를 얹지 않아 둘 다
`body`의 `--type-weight-regular`를 그대로 받는다. `dt`를 medium 으로 그리면 배포본과 다르다 —
키와 값의 대비를 만드는 것은 굵기가 아니라 **전경 알파**(48% ↔ 100%)다.

무단위 line-height는 **자기 요소의 글자 크기에 곱해진다.** 토큰 이름의 숫자(16)가 아니라 그
요소의 크기(14)가 기준이다.

### Actions

| 축 | 값 |
| --- | --- |
| 배치 | `flex` · `flex-wrap` · `gap: 10px` · `margin-top: 8px` |
| 버튼 폭 | **`width: 100%`** |
| 버튼 높이 | `32px` |
| 버튼 패딩 | `0 12px` |
| 버튼 곡률 | `12px` |
| 버튼 글자 | `body-14` · `--type-weight-regular` |
| 버튼 전환 | `background-color 140ms ease, transform 120ms ease, opacity 140ms ease` |

**버튼 높이·패딩이 낡아 있었다(2026-08-30 정정 — `40px` · `0 20px`).** 배포본은 결과 화면 전부
`h-16 py-0 px-6`이고, 이 문서 첫머리의 환산 기준(`--spacing: 2px`)으로 **32px · `0 12px`**이다
(`billing-success/page.tsx:141`·149, 업그레이드 실패 화면도 같은 상수 모양이다). 두 값은 LOUIS 의
`button-height-md`(32px) · `button-padding-inline-md`(12px)와 같고, `0 20px`은 LOUIS 어디에도 없는
값이었다. 40px 은 사다리에서 사라진 값이 아니라 `lg` 칸이며
([DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)), 이 화면이 쓰는 칸이 아니다.

**버튼이 전폭이라 `flex-wrap`과 함께 세로로 쌓인다.** 가로로 나란히 놓이지 않는다 — 결과 화면의
액션은 나란한 한 쌍이 아니라 **위아래 목록**이다.

| | primary | secondary |
| --- | --- | --- |
| 면 | `--gray-000` | `rgb(var(--palette-gray-000-rgb) / 8%)` |
| 글자 | `--gray-900` | `--gray-000` |
| hover 면 | `rgb(var(--gray-000-rgb) / 90%)` | `rgb(var(--palette-gray-000-rgb) / 14%)` |
| active 면 | `rgb(var(--gray-000-rgb) / 82%)` | `rgb(var(--palette-gray-000-rgb) / 18%)` |
| active 변형 | `scale(0.98)` | 같음 |

**secondary만 팔레트 잉크를 쓴다.** primary는 시맨틱 `--gray-000`이라 테마에서 뒤집히고
secondary는 `--palette-gray-000`이라 **양쪽 테마에서 흰 잉크로 고정**된다. 한쪽으로 통일하면
한 테마에서 면이 사라진다.

## 아직 토큰이 없는 축

| 축 | 값 |
| --- | --- |
| 컬럼 폭 | `min(520px, 100%)` |
| 상단 오프셋 | `clamp(56px, 10vh, 120px)` (≤900px `56px`) |
| 컬럼 세로 간격 | `24px` |
| 액션 간격 | `10px` |
| 900px 분기 | 이 화면 전용 — 셸의 719px과 **다른 경계다** |

**900px은 셸의 경계가 아니다.** [Responsive & Layout](../foundations/responsive-layout.md)의 승인된
경계에 없는 값이며 이 화면 계열이 자기 용도로 둔 것이다. 셸 경계로 착각하면 다른 화면까지 접힌다.

## Accessibility

- **메타 목록은 `<dl>`/`<dt>`/`<dd>`다.** 키–값 쌍이므로 표가 아니라 정의 목록이며, 900px에서
  세로로 접혀도 쌍의 연결이 유지된다.
- **처리 중 상태가 진행률을 주지 않는다.** 남은 시간을 모르므로 determinate progress를 쓰지 않고,
  상태 문구가 진행 사실을 전한다 — [Loading](loading.md)의 「완료 시간을 모름」 갈래다.
- 설명이 `white-space: pre-line`이라 **문구의 개행이 그대로 읽힌다.** 문장을 개행으로 끊으면
  스크린 리더의 호흡도 함께 끊긴다.
- 액션이 전폭 세로 목록이므로 **탭 순서가 시각 순서와 같다.** 가로 배치에서 생기는 어긋남이 없다.
- 결과 처리 오류의 붉은 배너는 **색만으로 전달하지 않는다** — 문구가 오류 사유를 담는다. 실패
  화면에는 이 배너가 없고 **Meta list 행**이 사유(code · message · orderId)를 담는다.

## Acceptance tests

1. 컬럼이 `520px`을 넘지 않고 가운데 정렬된다. 컬럼 자체에 면·테두리가 없다.
2. 부품 사이 간격이 전부 `24px` 하나다.
3. 처리 중에는 컬럼이 위에서 밀리지 않고 카드 안 세로 중앙에 온다.
4. 메타 행의 마지막 구분선이 없다.
5. `dt`와 `dd`의 렌더 행간이 **같다**(각 21px).
6. 액션 버튼이 전폭이라 세로로 쌓인다.
7. 900px에서 메타 행이 세로로 접히고 `dd`가 좌측 정렬된다.

## Pre-implementation blockers

- **900px 경계를 승인할 것인가.** 셸 경계와 다른 값이라 responsive matrix에 별도 축으로 올릴지
  이 화면 전용 예외로 둘지 정해야 한다.
- **secondary 액션이 팔레트 잉크를 쓰는 것을 계약으로 둘 것인가.** 시맨틱으로 바꾸면 한 테마에서
  면이 사라지므로 값 그대로 옮기되 이유를 남겨야 한다.

## 승격 조건

- 위 두 blocker가 닫힌다.
- 컬럼 폭 · 세로 간격 · 상단 오프셋이 semantic token으로 선다.
- 그 전까지 이 문서의 값은 **제품 인용**이며 DS 계약이 아니다.
