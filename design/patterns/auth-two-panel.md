---
id: auth-two-panel
status: experimental
authority: normative
---

# Auth Two Panel

로그인 전 인증 화면의 껍데기다. **좌 브랜드 패널 + 우 폼 패널**의 2열이고, 720px 미만에서
브랜드 패널이 통째로 사라져 폼만 1열 가운데에 남는다.

**전환점은 720px 하나뿐이다.** 그 밖의 분기는 슬로건 타입 스케일(1200px) 하나다.

값은 배포본 인용이다. **색과 곡률 축은 이미 LOUIS 시맨틱으로 서 있고**(브랜드 면 · 슬로건 전경 ·
eyebrow 네 축), 남은 기하 축은 아직 DS 토큰이 아니다. 간격 환산 기준은 제품의 `--spacing: 2px`다 —
`p-10`은 40px이 아니라 **20px**이다.

## 소비처 — 공용 하나와 복제 셋

**8개 화면이 이 껍데기를 쓰는데 경로가 둘이다.** 이 사실이 이 패턴의 첫 규칙이다.

| 경로 | 화면 |
| --- | --- |
| 공용 `AuthStatusCard` 사용 (5) | `/reset-password` · `/reset-password/new` · `/signup/check-email` · `/signup/expired` · `/signup/verified` |
| **같은 셸을 자기가 복제** (3) | `/login` · `/signup` · `/aws/signup` |

**복제 셋은 공용 컴포넌트를 쓰지 않고 같은 상수를 자기 파일에 다시 적는다.** 그리고 **이미
갈렸다** — 좁은 폭 페이지 패딩(공용 20px / 복제 16px), 카드 세로 간격(`/login`만 28px), 로고
아래 여백과 높이, 제목 `letter-spacing`이 경로에 따라 다르다. 아래 표는 그 갈림을 축마다
적는다. Figma로 옮길 때는 **하나의 컴포넌트로 그리고**, 복제가 있다는 사실과 갈린 축을
알려진 부채로 남긴다.

## Anatomy

| 부품 | 역할 |
| --- | --- |
| Page root | `100svh` 그리드. 720px에서 1열 ↔ 2열이 갈린다 |
| Brand panel | 좌측. 파란 면 + 배경 SVG + 상단 심볼 · 하단 슬로건 |
| Form panel | 우측. **좁은 폭에서는 `display: contents`로 사라진다** |
| Form card | 실제 폼. 최대 400px |
| Eyebrow | 폼 위의 알약 라벨 |
| Form header | 제목 + 설명 한 덩어리. 내부 간격 `8px`(`gap-4`) · 설명 `max-width: 340px` · `fg-secondary` · body-16. 공용은 항상 보이고 `/login` · `/signup`은 ≤719px에서 숨는다 |
| Form children | 폼 본문 래퍼. **카드 간격과 별개 축이다** — 공용 `10px`(`gap-5`) · `/login` · `/signup` `14px`(`gap-7`) |
| Logo link | **좁은 폭 전용.** 720px 이상에서 숨는다 |

## Layout contract

### Page root

| 축 | ~719px | ≥720px |
| --- | --- | --- |
| 높이 | `min-height: 100svh` | 같음 |
| 배치 | `grid` · `place-items: center` | `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)` · `place-items: stretch` |
| 패딩 | `20px` — 복제 셋(`/login` · `/signup` · `/aws/signup`)만 `16px` | `20px` |
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
| 면 | `--louis-color-accent-primary` (`bg-accent-primary`) = `#0088ff` — light · dark 같은 값이라 테마 분기가 없다 |
| 배경 이미지 | `/footer-logo-bg.svg` · `background-size: 100% 100%` · `no-repeat` · `center` |
| 클리핑 | `overflow: hidden` · `min-width: 0` |

**면 색은 리터럴이었지만 2026-08-24 배포본에서 시맨틱으로 옮겨 갔다.** 예전에는
`bg-[#0093ff]`였고 이 문서도 그렇게 적었는데, 지금은 `bg-accent-primary`다
(`AuthStatusCard.tsx:27` · `login/page.tsx:43` · `app/signup/page.tsx:37`).
`--louis-color-accent-primary`는 light · dark 두 mode가 같은 `#0088ff`라 **테마 분기가 없다는
성질은 그대로다** — 브랜드 면이므로 램프를 따라가지 않는다. `#0093ff`는 배포본 코드에 더는
없고 `/node-canvas.svg` 같은 자산 파일 안에만 남아 있다.

`/aws/signup`만 이 축이 갈린다 — 코브랜드 주황 `#ff9900` 리터럴에 자기 배경 사진을 얹는다
(`aws/signup/page.tsx:89`).

`background-size: 100% 100%`이라 **배경 SVG가 비율을 유지하지 않고 늘어난다.** 열 비율이 바뀌면
그림도 함께 왜곡된다 — 의도된 동작이다.

내용은 둘뿐이다.

| | 값 |
| --- | --- |
| 상단 심볼 | `display: none` → ≥720px `block` · `line-height: 0` |
| 하단 슬로건 | `max-width: 18ch` · 색 `--louis-color-fg-inverse` (`text-fg-inverse`) · `margin: 0` |
| 슬로건 (≥1200px) | 타입이 `heading-48`로 **승급**한다 (size · line-height · letter-spacing 셋 다) |

슬로건 색도 리터럴 팔레트에서 역할 이름으로 옮겨 갔다 — 예전 `text-palette-gray-000`이 지금은
`text-fg-inverse`다(`AuthStatusCard.tsx:41` · `login/page.tsx:63`). 두 토큰의 해석값은 light ·
dark 모두 `#fafafa`로 같으므로 **렌더는 변하지 않는다.** 이름만 제품과 어긋나 있었다.
`/aws/signup`은 여전히 `text-palette-gray-000`이다(`aws/signup/page.tsx:101`).

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
| 세로 간격 | `8px` (`gap-4`) | **`24px`** (`gap-12`) — `/login`만 `28px`(`gap-14`) |
| 제목 | `type-heading-28-medium` | 같음 |

**세로 간격이 세 배가 된다.** 좁은 폭의 촘촘한 리듬을 넓은 폭에 그대로 쓰면 폼이 뭉쳐 보인다.

`--spacing: 2px` 격자라 `gap-12`는 **24px**이다. 8화면 중 7이 24px이고
(`AuthStatusCard.tsx:55` · `app/signup/page.tsx:65` · `aws/signup/page.tsx:120`),
`/login` 하나만 `gap-14` = **28px**이다(`login/page.tsx:81`).

**하단 링크의 음수 마진은 그 28px 전용이다.** `/login`이
`[@media(min-width:720px)]:mt-[-12px]`로 폼과 하단 링크를 당기는 것은 자기 카드 간격이 28px이기
때문이고, 주석도 「데스크톱에선 카드 gap(28px)이 커서」라고 적는다
(`login/page.tsx:201-206`). 24px인 나머지 일곱에는 그 보정이 없다 — **공용 규칙으로 옮기면
안 된다.**

제목 타입은 8화면이 전부 같다(`AuthStatusCard.tsx:134` · `login/page.tsx:363` ·
`app/signup/page.tsx:392` · `aws/signup/page.tsx:452`). 다만 **복제 셋만** 제목에
`letter-spacing: 0`을 덧대 스케일의 자간을 지운다(`login/page.tsx:95` ·
`app/signup/page.tsx:78` · `aws/signup/page.tsx:134`) — 공용 `AuthStatusCard`는 덧대지 않는다.
복제 부채이지 이 패턴의 계약이 아니다.

### Eyebrow

| 축 | 값 |
| --- | --- |
| 배치 | `inline-flex` · 가운데 정렬 |
| 최소 높이 | `30px` |
| 곡률 | `999px` — `--louis-radius-pill` (`rounded-pill`) |
| 테두리 | `1px solid` `--louis-color-stroke-subtle` |
| 면 | `--louis-color-bg-surface` |
| 패딩 | `0 12px` |
| 글자 | `--louis-color-fg-tertiary` |

**이 네 축은 이미 LOUIS로 수렴했다.** 예전 값은 알파 리터럴이었다 — 테두리
`rgb(var(--gray-000-rgb) / 10%)` · 면 `/ 4%` · 글자 `/ 58%`, 곡률 `9999px`. 지금 제품은
`rounded-pill` · `border-stroke-subtle` · `bg-bg-surface` · `text-fg-tertiary`를 쓴다
(`AuthStatusCard.tsx:70-72`). `rounded-pill`은 `--radius-pill` → `--louis-radius-pill`이고 값은
`999px`이라, 「원본이 `9999px`이므로 바꾸지 않는다」는 옛 단서는 **더 볼 필요가 없다.**

**LOUIS `.louis-badge`는 채택하지 않는다.** 정본 배지는 면으로 상태를 전달하는 채워진 형태
(반경 8 · 상하 4 좌우 8 · `bg-inset` · `fg-secondary` · caption 400)이고, 이 eyebrow는 면 없이
테두리로만 서는 알약 라벨이다 — 여덟 축이 전부 갈려 껍데기를 쓰면 정본 값을 하나도 남기지
못한다(`AuthStatusCard.tsx:63-73`).

### Logo link

**좁은 폭 전용이다.** `≥720px`에서 숨는다 — 넓은 폭에서는 좌 패널의 브랜드 심볼이 그 역할을 한다.

**Form card의 첫 자식이다**(`AuthStatusCard.tsx:118-125` · `login/page.tsx:353-359`). 그래서 아래
여백이 카드 세로 간격과 **합산된다** — 공용은 `mb-8`(16px) + 좁은 폭 카드 간격 8px = 실효
**24px**이다(`AuthStatusCard.tsx:59`). `/login` · `/signup`은 `mb-12`(24px)이라 실효 32px이다
(`login/page.tsx:85` · `app/signup/page.tsx:69`). `/aws/signup`에는 로고 링크가 아예 없다 —
파트너십 행이 그 자리를 쓴다.

로고 높이도 갈린다 — 공용과 `/signup`은 `56`(`AuthStatusCard.tsx:122-123` ·
`app/signup/page.tsx:386-387`), `/login`만 `72`다(`login/page.tsx:216`).

`transition: opacity 180ms ease-in-out`, hover `0.84`는 공용 값이다(`AuthStatusCard.tsx:59`).
`/signup`은 `180ms ease` · hover `0.8`이고(`app/signup/page.tsx:69`) `/login`은 전이도 hover도
두지 않는다(`login/page.tsx:85`).

**hover에 `@media (hover: hover)` 가드가 없다** — 터치 기기에서도 발동한다. 원본 모듈 CSS의
맨 `:hover`를 보존한 결과다.

## 아직 토큰이 없는 축

| 축 | 값 |
| --- | --- |
| 폼 패널 패딩 | `clamp(32px, 6svh, 72px) 32px` |
| 슬로건 폭 | `18ch` — 문자 단위이고 px로 환산하지 않는다 |
| 카드 최대 폭 | `400px` |

`6svh`와 `18ch`는 **뷰포트·글자 단위**라 px 토큰으로 승격되지 않는다. Figma로 옮길 때는 대표
해를 하나 골라 적고 단위를 함께 남긴다.

**이 표에서 두 축이 빠졌다. 지워진 것이 아니라 닫혔다.**

| 닫힌 축 | 옛 값 | 지금 |
| --- | --- | --- |
| 브랜드 면 | `#0093ff` 리터럴 | `--louis-color-accent-primary` (2026-08-24 배포본) |
| eyebrow 곡률 | `9999px` | `--louis-radius-pill` = `999px` (`rounded-pill`) |

## Responsive matrix

| 폭 | 브랜드 패널 | 폼 패널 | 로고 링크 | 카드 간격 |
| --- | --- | --- | --- | --- |
| ~719px | 없음 | `display: contents` | 보임 | 8px |
| 720~1199px | 보임 | 2열 우측 | 숨김 | 24px (`/login` 28px) |
| ≥1200px | 슬로건 `heading-48` | 같음 | 숨김 | 24px (`/login` 28px) |

## Accessibility

- 브랜드 패널은 `display: none`이라 **좁은 폭에서 접근성 트리에서도 사라진다.** 정보를 담지
  않으므로 의도된 동작이다.
- 로고 링크는 좁은 폭에서만 나타나고 넓은 폭에서는 브랜드 심볼이 대신한다 — **둘 중 하나는
  항상 있다.**
- 폼 카드가 `text-align: center`다. 긴 오류 문구도 가운데 정렬된다.

## Acceptance tests

1. 720px 경계에서 1열 ↔ 2열이 갈린다. 그 밖의 폭 분기는 슬로건 타입(1200px)뿐이다.
2. 좁은 폭에서 폼 패널이 `display: contents`이고 카드가 페이지 그리드에서 직접 가운데 온다.
3. 브랜드 면이 테마와 무관하게 `--louis-color-accent-primary`(`#0088ff`)다 — `/aws/signup`만
   코브랜드 주황으로 갈린다.
4. 카드 세로 간격이 8px → 24px로 바뀐다. `/login`만 28px이고, 그 화면에서만 하단 링크에 음수
   마진이 따라온다.
5. 로고 링크와 브랜드 심볼이 동시에 보이지 않고, 동시에 사라지지도 않는다.
6. 슬로건이 1200px에서 `heading-48`로 승급한다.

## Pre-implementation blockers

- **복제 셋을 공용으로 합칠 것인가.** `/login` · `/signup` · `/aws/signup`이 같은 상수를 자기
  파일에 다시 적는다. 합치는 것은 제품 변경이라 여기서 정하지 않는다.
- ~~**`#0093ff`를 브랜드 토큰으로 세울 것인가.**~~ **제품이 닫았다(2026-08-24).** 브랜드 면이
  `bg-accent-primary`로 옮겨 가 `--louis-color-accent-primary`를 소비한다
  (`AuthStatusCard.tsx:27`). 여기서 결정할 것이 남아 있지 않다.

## 승격 조건

- 위 두 blocker가 닫힌다 — 브랜드 면은 닫혔고 **복제 셋 통합만 남았다.**
- 카드 폭 · 간격이 semantic token으로 선다. **eyebrow는 닫혔다** — 색 세 축과 곡률이
  `stroke-subtle` · `bg-surface` · `fg-tertiary` · `radius-pill`로 이미 서 있다.
- 그 전까지 이 문서의 값은 **제품 인용**이며 DS 계약이 아니다.
