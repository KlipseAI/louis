---
id: auth-two-panel
status: experimental
authority: normative
---

# Auth Two Panel

로그인 전 인증 화면의 껍데기다. **좌 브랜드 패널 + 우 폼 패널**의 2열이고, 720px 미만에서
브랜드 패널이 통째로 사라져 폼만 1열 가운데에 남는다.

**전환점은 720px 하나뿐이다.** 그 밖의 폭 변화는 슬로건 글자 크기 계단뿐이고, 그 계단은 이 패턴이
아니라 슬로건의 타입 클래스(`type-heading-48-semibold`)가 갖는다.

값은 제품 인용이다(측정 앵커 — 작업 브랜치 통합 판 `76b6cf15`). **색과 곡률 축은 이미 LOUIS 시맨틱으로 서 있고**(브랜드 면 · 슬로건 전경 ·
eyebrow 네 축), 남은 기하 축은 아직 DS 토큰이 아니다. 간격 환산 기준은 제품의 `--spacing: 2px`다 —
`p-10`은 40px이 아니라 **20px**이다.

## 소비처 — 그룹 레이아웃 하나, 폼 셋, 바깥 복제 하나

**8개 화면이 이 껍데기를 쓴다.** 통합 판 `76b6cf15` 에서 그중 일곱이 라우트 그룹 `(auth-brand)`
안으로 모여 **페이지 그리드와 브랜드 패널을 그룹 레이아웃 한 벌로 나눠 쓴다**
(`(auth-brand)/layout.tsx:21-28` 의 `PAGE` · `AuthBrandPanel.tsx:80-101`). 그 화면들을 오가도 패널이 다시
만들어지지 않아 배경 영상이 처음부터 다시 돌지 않는다. 갈림은 이제 폼 쪽에 남는다.

| 경로 | 화면 |
| --- | --- |
| 그룹 레이아웃 + 공용 `AuthStatusCard` (5) | `/reset-password` · `/reset-password/new` · `/signup/check-email` · `/signup/expired` · `/signup/verified` |
| 그룹 레이아웃 + **폼을 자기 파일에 적음** (2) | `/login` · `/signup` |
| **셸 전체를 자기가 복제** (1) — 그룹 밖 | `/aws/signup` |

**폼을 자기가 적는 둘과 복제 하나는 공용 컴포넌트를 쓰지 않고 같은 상수를 자기 파일에 다시
적는다.** 그리고 **이미 갈렸다** — 카드 세로 간격(`/login`만 28px), 로고 아래 여백과 높이, 제목
`letter-spacing`이 경로에 따라 다르다. 아래 표는 그 갈림을 축마다 적는다. 좁은 폭 페이지 패딩의
갈림(공용 20px / 복제 16px)은 그룹 레이아웃으로 모이며 **16px 하나로 닫혔다**(`/aws/signup` 도
16px). Figma로 옮길 때는 **하나의 컴포넌트로 그리고**, 남은 복제와 갈린 축을 알려진 부채로 남긴다.

## Anatomy

| 부품 | 역할 |
| --- | --- |
| Page root | `100svh` 그리드. 720px에서 1열 ↔ 2열이 갈린다 |
| Brand panel | 좌측. 배경 영상 + 어두운 스크림(바닥은 파란 면) + 상단 심볼 · 하단 슬로건 |
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
| 패딩 | `16px` | `20px` |
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
| 면 | 배경 영상(`object-cover`, 패널 꽉 채움) + 스크림 `--louis-color-media-scrim-dark` 40% |
| 바닥 면 | `--louis-color-accent-primary` (`bg-accent-primary`) = `#0088ff` — 영상이 오기 전 · 재생이 막혔을 때 보인다. light · dark 같은 값이라 테마 분기가 없다 |
| 배경 이미지 | 없다 — `/footer-logo-bg.svg` 는 영상과 겹쳐 걷혔다 |
| 클리핑 | `overflow: hidden` · `min-width: 0` |

**면 색은 리터럴이었지만 2026-08-24 배포본에서 시맨틱으로 옮겨 갔다.** 예전에는
`bg-[#0093ff]`였고 이 문서도 그렇게 적었는데, 지금은 `bg-accent-primary`다
(`AuthBrandPanel.tsx:31` — 일곱 화면이 이 한 줄을 나눠 쓴다). 통합 판에서는 그 면을 배경 영상과
스크림이 덮고 파란 면은 바닥으로만 남는다(`AuthBrandPanel.tsx:40-51` · `:87-88`).
`--louis-color-accent-primary`는 light · dark 두 mode가 같은 `#0088ff`라 **테마 분기가 없다는
성질은 그대로다** — 브랜드 면이므로 램프를 따라가지 않는다. `#0093ff`는 배포본 코드에 더는
없고 `/node-canvas.svg` 같은 자산 파일 안에만 남아 있다.

`/aws/signup`만 이 축이 갈린다 — 코브랜드 주황 `#ff9900` 리터럴에 자기 배경 사진을 얹는다
(`aws/signup/page.tsx:89`).

**배경 영상은 비율을 지키고 넘치는 쪽을 자른다**(`object-cover`, `AuthBrandPanel.tsx:40-44`). 예전
배경 SVG는 `background-size: 100% 100%`라 열 비율을 따라 늘어났는데, 그 왜곡은 SVG와 함께 없어졌다.
영상은 장식이라 소리도 자막도 없고 패널째 `aria-hidden`이다(`AuthBrandPanel.tsx:83`).

내용은 둘뿐이다.

| | 값 |
| --- | --- |
| 상단 심볼 | `display: none` → ≥720px `block` · `position: relative`(영상 위로 올린다) |
| 하단 슬로건 | `type-heading-48-semibold` · `max-width: 18ch` · 색 `--louis-color-media-foreground-dark` · `margin: 0` · `position: relative` |
| 슬로건 크기 | 기본 48px · `≤1023px` 36px · `≤767px` 32px — 타입 클래스의 계단이다. 예전의 1200 승급은 걷혔다 |

슬로건 색도 리터럴 팔레트에서 역할 이름으로 옮겨 갔다 — 예전 `text-palette-gray-000`이
`text-fg-inverse`를 거쳐 통합 판에서는 `media-foreground-dark`다(`AuthBrandPanel.tsx:77`). 패널이
영상 위라 테마를 따라 뒤집히는 잉크를 쓰면 라이트에서 어두워지기 때문이다. 세 토큰의 해석값은
light · dark 모두 `#fafafa`로 같으므로 **렌더는 변하지 않는다.**
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
(`AuthStatusCard.tsx:26` · `(auth-brand)/signup/page.tsx:31` · `aws/signup/page.tsx:120`),
`/login` 하나만 `gap-14` = **28px**이다(`login/page.tsx:34`).

**하단 링크의 음수 마진은 그 28px 전용이다.** `/login`이
`[@media(min-width:720px)]:mt-[-12px]`로 폼과 하단 링크를 당기는 것은 자기 카드 간격이 28px이기
때문이고, 주석도 「데스크톱에선 카드 gap(28px)이 커서」라고 적는다
(`login/page.tsx:154-159`). 24px인 나머지 일곱에는 그 보정이 없다 — **공용 규칙으로 옮기면
안 된다.**

제목 타입은 8화면이 전부 같다(`AuthStatusCard.tsx:89` · `login/page.tsx:302` · `(auth-brand)/signup/page.tsx:344` ·
`aws/signup/page.tsx:451`). 다만 **폼을 자기가 적는 셋만** 제목에 `letter-spacing: 0`을 덧대
스케일의 자간을 지운다(`login/page.tsx:48` · `(auth-brand)/signup/page.tsx:44` · `aws/signup/page.tsx:134`) — 공용
`AuthStatusCard`는 덧대지 않는다.
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
(`AuthStatusCard.tsx:41-43`). `rounded-pill`은 `--radius-pill` → `--louis-radius-pill`이고 값은
`999px`이라, 「원본이 `9999px`이므로 바꾸지 않는다」는 옛 단서는 **더 볼 필요가 없다.**

**LOUIS `.louis-badge`는 채택하지 않는다.** 정본 배지는 면으로 상태를 전달하는 채워진 형태
(반경 8 · 상하 4 좌우 8 · `bg-inset` · `fg-secondary` · caption 400)이고, 이 eyebrow는 면 없이
테두리로만 서는 알약 라벨이다 — 여덟 축이 전부 갈려 껍데기를 쓰면 정본 값을 하나도 남기지
못한다(`AuthStatusCard.tsx:34-44`).

### Logo link

**좁은 폭 전용이다.** `≥720px`에서 숨는다 — 넓은 폭에서는 좌 패널의 브랜드 심볼이 그 역할을 한다.

**Form card의 첫 자식이다**(`AuthStatusCard.tsx:73-80` · `login/page.tsx:292-299`). 그래서 아래
여백이 카드 세로 간격과 **합산된다** — 공용은 `mb-8`(16px) + 좁은 폭 카드 간격 8px = 실효
**24px**이다(`AuthStatusCard.tsx:30`). `/login` · `/signup`은 `mb-12`(24px)이라 실효 32px이다
(`login/page.tsx:38` · `(auth-brand)/signup/page.tsx:35`). `/aws/signup`에는 로고 링크가 아예 없다 —
파트너십 행이 그 자리를 쓴다.

로고 높이도 갈린다 — 공용과 `/signup`은 `56`(`AuthStatusCard.tsx:77-78` ·
`(auth-brand)/signup/page.tsx:339`), `/login`만 `72`다(`login/page.tsx:169`).

`transition: opacity 180ms ease-in-out`, hover `0.84`는 공용 값이다(`AuthStatusCard.tsx:30`).
`/signup`은 `180ms ease` · hover `0.8`이고(`(auth-brand)/signup/page.tsx:35`) `/login`은 전이도 hover도
두지 않는다(`login/page.tsx:38`).

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
| 브랜드 면 | `#0093ff` 리터럴 | `--louis-color-accent-primary` (2026-08-24 배포본) — 통합 판에서는 영상 아래 바닥 |
| eyebrow 곡률 | `9999px` | `--louis-radius-pill` = `999px` (`rounded-pill`) |

## Responsive matrix

| 폭 | 브랜드 패널 | 폼 패널 | 로고 링크 | 카드 간격 |
| --- | --- | --- | --- | --- |
| ~719px | 없음 | `display: contents` | 보임 | 8px |
| 720~1023px | 보임 · 슬로건 32px(~767) / 36px(768~) | 2열 우측 | 숨김 | 24px (`/login` 28px) |
| ≥1024px | 보임 · 슬로건 48px | 같음 | 숨김 | 24px (`/login` 28px) |

## Accessibility

- 브랜드 패널은 `display: none`이라 **좁은 폭에서 접근성 트리에서도 사라진다.** 정보를 담지
  않으므로 의도된 동작이다.
- 로고 링크는 좁은 폭에서만 나타나고 넓은 폭에서는 브랜드 심볼이 대신한다 — **둘 중 하나는
  항상 있다.**
- 폼 카드가 `text-align: center`다. 긴 오류 문구도 가운데 정렬된다.

## Acceptance tests

1. 720px 경계에서 1열 ↔ 2열이 갈린다. 그 밖의 폭 변화는 슬로건 타입 클래스의 크기 계단(1024 · 768)뿐이다.
2. 좁은 폭에서 폼 패널이 `display: contents`이고 카드가 페이지 그리드에서 직접 가운데 온다.
3. 브랜드 패널은 배경 영상 + 스크림이고, 그 바닥 면이 테마와 무관하게
   `--louis-color-accent-primary`(`#0088ff`)다 — `/aws/signup`만 코브랜드 주황으로 갈린다.
4. 카드 세로 간격이 8px → 24px로 바뀐다. `/login`만 28px이고, 그 화면에서만 하단 링크에 음수
   마진이 따라온다.
5. 로고 링크와 브랜드 심볼이 동시에 보이지 않고, 동시에 사라지지도 않는다.
6. 슬로건이 `type-heading-48-semibold` 하나이고 크기는 그 클래스의 계단(48 · 36 · 32)을 따른다 — 1200 승급은 없다.

## Pre-implementation blockers

- **남은 복제를 공용으로 합칠 것인가.** 통합 판에서 페이지 그리드와 브랜드 패널은 `(auth-brand)`
  레이아웃 한 벌로 합쳐졌다. 남은 것은 `/login` · `/signup` 의 폼 패널 · 카드 상수와 그룹 밖
  `/aws/signup` 의 셸 전체다. 합치는 것은 제품 변경이라 여기서 정하지 않는다.
- ~~**`#0093ff`를 브랜드 토큰으로 세울 것인가.**~~ **제품이 닫았다(2026-08-24).** 브랜드 면이
  `bg-accent-primary`로 옮겨 가 `--louis-color-accent-primary`를 소비한다
  (`AuthBrandPanel.tsx:31`). 여기서 결정할 것이 남아 있지 않다.

## 승격 조건

- 위 두 blocker가 닫힌다 — 브랜드 면은 닫혔고 **남은 복제(로그인 · 회원가입 폼, `/aws/signup` 셸) 통합만 남았다.**
- 카드 폭 · 간격이 semantic token으로 선다. **eyebrow는 닫혔다** — 색 세 축과 곡률이
  `stroke-subtle` · `bg-surface` · `fg-tertiary` · `radius-pill`로 이미 서 있다.
- 그 전까지 이 문서의 값은 **제품 인용**이며 DS 계약이 아니다.
