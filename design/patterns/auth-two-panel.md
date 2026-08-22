---
id: auth-two-panel
status: experimental
authority: normative
---

# Auth Two Panel

로그인 전 인증 화면의 껍데기다. **좌 브랜드 패널 + 우 폼 패널**의 2열이고, 720px 미만에서
브랜드 패널이 통째로 사라져 폼만 1열 가운데에 남는다.

**전환점은 720px 하나뿐이다.** 그 밖의 분기는 슬로건 타입 스케일(1200px) 하나다.

값은 배포본 인용이며 아직 DS 토큰이 아니다. 간격 환산 기준은 제품의 `--spacing: 2px`다 —
`p-10`은 40px이 아니라 **20px**이다.

## 소비처 — 공용 하나와 복제 셋

**8개 화면이 이 껍데기를 쓰는데 경로가 둘이다.** 이 사실이 이 패턴의 첫 규칙이다.

| 경로 | 화면 |
| --- | --- |
| 공용 `AuthStatusCard` 사용 (5) | `/reset-password` · `/reset-password/new` · `/signup/check-email` · `/signup/expired` · `/signup/verified` |
| **같은 셸을 자기가 복제** (3) | `/login` · `/signup` · `/aws/signup` |

**복제 셋은 공용 컴포넌트를 쓰지 않고 같은 상수를 자기 파일에 다시 적는다.** 값이 지금은 같지만
한쪽만 고치면 갈린다. Figma로 옮길 때 **하나의 컴포넌트로 그리고**, 복제가 있다는 사실을
알려진 부채로 남긴다.

## Anatomy

| 부품 | 역할 |
| --- | --- |
| Page root | `100svh` 그리드. 720px에서 1열 ↔ 2열이 갈린다 |
| Brand panel | 좌측. 파란 면 + 배경 SVG + 상단 심볼 · 하단 슬로건 |
| Form panel | 우측. **좁은 폭에서는 `display: contents`로 사라진다** |
| Form card | 실제 폼. 최대 400px |
| Eyebrow | 폼 위의 알약 라벨 |
| Logo link | **좁은 폭 전용.** 720px 이상에서 숨는다 |

## Layout contract

### Page root

| 축 | ~719px | ≥720px |
| --- | --- | --- |
| 높이 | `min-height: 100svh` | 같음 |
| 배치 | `grid` · `place-items: center` | `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)` · `place-items: stretch` |
| 패딩 | `20px` | `20px` |
| 열 간격 | — | `20px` |
| 면 | `--gray-900` | 같음 |

**`minmax(0, 1fr)`을 `1fr`로 바꾸면 안 된다.** 최소 크기를 0으로 눌러야 긴 슬로건이 열을 밀지
않는다.

### Brand panel (좌)

| 축 | 값 |
| --- | --- |
| ~719px | `display: none` — **DOM에 남지만 그려지지 않는다** |
| ≥720px | `flex column` · `align-items: flex-start` · `justify-content: space-between` |
| 패딩 · 곡률 | `20px` · `12px` |
| 면 | **`#0093ff` 리터럴** — 테마 분기가 없다 |
| 배경 이미지 | `/footer-logo-bg.svg` · `background-size: 100% 100%` · `no-repeat` · `center` |
| 클리핑 | `overflow: hidden` · `min-width: 0` |

**면 색이 시맨틱 토큰이 아니라 리터럴이다.** 라이트/다크 어느 쪽에서도 같은 파랑이다 —
브랜드 면이므로 램프를 따라가지 않는다.

`background-size: 100% 100%`이라 **배경 SVG가 비율을 유지하지 않고 늘어난다.** 열 비율이 바뀌면
그림도 함께 왜곡된다 — 의도된 동작이다.

내용은 둘뿐이다.

| | 값 |
| --- | --- |
| 상단 심볼 | `display: none` → ≥720px `block` · `line-height: 0` |
| 하단 슬로건 | `max-width: 18ch` · 색 `--palette-gray-000` · `margin: 0` |
| 슬로건 (≥1200px) | 타입이 `heading-48`로 **승급**한다 (size · line-height · letter-spacing 셋 다) |

### Form panel (우)

| 축 | ~719px | ≥720px |
| --- | --- | --- |
| 표시 | **`display: contents`** | `grid` · `place-items: center` |
| 패딩 | — | `clamp(32px, 6svh, 72px) 32px` |
| 스크롤 | — | `overflow-y: auto` |

**`display: contents`가 좁은 폭에서 래퍼를 지운다.** 그래야 폼 카드가 페이지 그리드의
`place-items: center`를 **직접** 받는다. 래퍼를 남기고 안에서 가운데 정렬하면 카드가 세로로
가운데 오지 않는다.

### Form card

| 축 | ~719px | ≥720px |
| --- | --- | --- |
| 폭 | `min(100%, 400px)` | 같음 |
| 배치 | `grid` · `justify-items: center` · `text-align: center` | 같음 |
| 세로 간격 | `8px` (`gap-4`) | **`28px`** (`gap-14`) |

**세로 간격이 세 배 반이 된다.** 좁은 폭의 촘촘한 리듬을 넓은 폭에 그대로 쓰면 폼이 뭉쳐 보인다.

`gap-14`는 `--spacing: 2px` 격자라 **28px**이다. 24px로 읽으면 카드 안 모든 행이 4px씩 당겨진다 —
하단 링크가 `[@media(min-width:720px)]:mt-[-12px]`로 음수 마진을 쓰는 이유가 이 28px이고,
그 주석도 「데스크톱에선 카드 gap(28px)이 커서」라고 적는다(`login/page.tsx:81-82`·`:249-252`).

### Eyebrow

| 축 | 값 |
| --- | --- |
| 배치 | `inline-flex` · 가운데 정렬 |
| 최소 높이 | `30px` |
| 곡률 | **`9999px`** (999px이 아니다) |
| 테두리 | `1px solid rgb(var(--gray-000-rgb) / 10%)` |
| 면 | `rgb(var(--gray-000-rgb) / 4%)` |
| 패딩 | `0 12px` |
| 글자 | `rgb(var(--gray-000-rgb) / 58%)` |

곡률이 `9999px`인 것은 원본 그대로다. 알약이므로 실효는 `999px`과 같지만 **값을 바꾸지 않는다** —
이 저장소는 제품 값을 그대로 옮긴다.

### Logo link

**좁은 폭 전용이다.** `≥720px`에서 숨는다 — 넓은 폭에서는 좌 패널의 브랜드 심볼이 그 역할을 한다.
아래 여백 `16px`, `transition: opacity 180ms ease-in-out`, hover `0.84`.

**hover에 `@media (hover: hover)` 가드가 없다** — 터치 기기에서도 발동한다. 원본 모듈 CSS의
맨 `:hover`를 보존한 결과다.

## 아직 토큰이 없는 축

| 축 | 값 |
| --- | --- |
| 브랜드 면 | `#0093ff` — 리터럴로 남긴다. 토큰화 대상이 아니다 |
| 폼 패널 패딩 | `clamp(32px, 6svh, 72px) 32px` |
| eyebrow 곡률 | `9999px` |
| 슬로건 폭 | `18ch` — 문자 단위이고 px로 환산하지 않는다 |
| 카드 최대 폭 | `400px` |

`6svh`와 `18ch`는 **뷰포트·글자 단위**라 px 토큰으로 승격되지 않는다. Figma로 옮길 때는 대표
해를 하나 골라 적고 단위를 함께 남긴다.

## Responsive matrix

| 폭 | 브랜드 패널 | 폼 패널 | 로고 링크 | 카드 간격 |
| --- | --- | --- | --- | --- |
| ~719px | 없음 | `display: contents` | 보임 | 8px |
| 720~1199px | 보임 | 2열 우측 | 숨김 | 28px |
| ≥1200px | 슬로건 `heading-48` | 같음 | 숨김 | 28px |

## Accessibility

- 브랜드 패널은 `display: none`이라 **좁은 폭에서 접근성 트리에서도 사라진다.** 정보를 담지
  않으므로 의도된 동작이다.
- 로고 링크는 좁은 폭에서만 나타나고 넓은 폭에서는 브랜드 심볼이 대신한다 — **둘 중 하나는
  항상 있다.**
- 폼 카드가 `text-align: center`다. 긴 오류 문구도 가운데 정렬된다.

## Acceptance tests

1. 720px 경계에서 1열 ↔ 2열이 갈린다. 그 밖의 폭 분기는 슬로건 타입(1200px)뿐이다.
2. 좁은 폭에서 폼 패널이 `display: contents`이고 카드가 페이지 그리드에서 직접 가운데 온다.
3. 브랜드 면이 테마와 무관하게 `#0093ff`다.
4. 카드 세로 간격이 8px → 28px로 바뀐다.
5. 로고 링크와 브랜드 심볼이 동시에 보이지 않고, 동시에 사라지지도 않는다.
6. 슬로건이 1200px에서 `heading-48`로 승급한다.

## Pre-implementation blockers

- **복제 셋을 공용으로 합칠 것인가.** `/login` · `/signup` · `/aws/signup`이 같은 상수를 자기
  파일에 다시 적는다. 합치는 것은 제품 변경이라 여기서 정하지 않는다.
- **`#0093ff`를 브랜드 토큰으로 세울 것인가.** 현재 리터럴이고 다른 곳에서도 쓰인다.

## 승격 조건

- 위 두 blocker가 닫힌다.
- 카드 폭 · 간격 · eyebrow가 semantic token으로 선다.
- 그 전까지 이 문서의 값은 **제품 인용**이며 DS 계약이 아니다.
