---
id: decision-tailwind-load-order
status: experimental
authority: normative
---

# DS-D-0020 Tailwind theme의 불러오기 순서를 계약으로 못 박는다

- Status: proposed
- Date: 2026-08-18
- Owners: repository owner, token maintainer
- Affects: `packages/css/generated/theme.css`, `@klipse-design/css` README,
  `scripts/verify-tailwind-interop.mjs`, DS-D-0013, klipse-web adoption

## Context

[DS-D-0013](DS-D-0013-tailwind-interop.md)이 토큰을 Tailwind 4 `@theme inline`으로도 발행하기로
했다. 소비 제품(`KlipseAI/klipse-web`)이 Tailwind 4를 쓰기 때문이다.

**그런데 소비 제품은 자기 `@theme`에서 네 namespace를 통째로 지운다** —
`--color-*` · `--radius-*` · `--text-*` · `--font-*`를 각각 `initial`로 되돌린다. Tailwind 기본
팔레트를 버리고 실측값으로 다시 세우기 위한 선언이며, 제품 입장에서는 옳다. 실측 근거와 그
선언의 위치는 비규범 기록인
[`migration/klipse-web-adoption.md`](../../../migration/klipse-web-adoption.md)가 갖는다.

**DS의 `theme.css`도 그 네 namespace를 쓴다.** 그래서 순서가 뒤집히면 제품의 reset이 DS 값을
지운다.

### 실측 (2026-08-18)

제품이 실제로 쓰는 Tailwind 4.3.3으로 두 순서를 컴파일했다.

| 유틸리티 | DS → 제품 | 제품 → DS |
| --- | --- | --- |
| `bg-action-primary` | **생성 안 됨** | 생성됨 |
| `text-foreground-primary` | **생성 안 됨** | 생성됨 |
| `rounded-card` | **생성 안 됨** | 생성됨 |
| `rounded-control` | **생성 안 됨** | 생성됨 |
| `p-3` · `gap-3` (대조군) | 생성됨 | 생성됨 |

**오류가 나지 않는다.** 빌드는 성공하고 `bg-action-primary`가 **아무것도 하지 않는 클래스**가 된다.
대조군이 양쪽에서 살아 있으므로 이것은 빌드 실패가 아니라 정확히 reset 범위의 문제다.

### 2026-08-21 — 강제 지점이 옮겨졌다 (계약은 그대로다)

제품이 채택을 켰다. `design` 브랜치의 진입 CSS가 **자기 `@theme inline` 블록 뒤에서**
`@import "@klipse-design/css/theme.css" layer(theme);` 를 직접 부른다. 즉 순서를 지키는 주체가
**소비자의 불러오기 순서에서 제품 진입 CSS 안의 import 위치로 옮겨졌다.**

이 변화가 게이트를 한 번 속였다. 제품 파일이 스스로 DS를 뒤에서 불러오므로, 실험의
`ds-first` 배치에서도 유틸리티가 되살아났고 내장 canary가 「순서 계약이 더 이상 필요 없다」고
알렸다. **계약이 사라진 것이 아니라 실험이 변수를 격리하지 못하게 된 것이다.**

`scripts/verify-tailwind-interop.mjs`가 이제 제품 진입 CSS에서 그 DS import 한 줄을 걷어낸 뒤
두 순서를 직접 붙인다. 격리를 되찾자 탐침 4종이 반대 순서에서 **전부 사라진다** — 2026-08-18
실측표와 같은 결과다. 계약은 유효하다.

**따라서 이 결정은 폐기되지 않는다.** 다만 검사 대상이 둘로 늘었다.

| 무엇을 지키나 | 어디서 |
| --- | --- |
| 제품 reset이 DS 값을 지우지 않는 순서 | `verify-tailwind-interop.mjs` (격리 실험) |
| 제품 진입 CSS 안에서 DS import가 `@theme inline` **뒤에** 있을 것 | 아직 게이트 없음 — **미결** |

두 번째는 제품 저장소의 파일이라 이 저장소가 직접 막을 수 없다. 위치가 앞으로 옮겨지면
유틸리티가 조용히 사라지고, 그때 이 저장소의 게이트는 여전히 초록이다. 소비처 계약으로 세울지
판정이 필요하다.

## Decision

**`@klipse-design/css/theme.css`는 제품의 Tailwind 진입 CSS **뒤에** 불러야 한다.** 이것을 문서의
권고가 아니라 **계약**으로 두고 게이트로 검사한다.

1. 계약은 `scripts/verify-tailwind-interop.mjs`가 `pnpm verify`에서 확인한다. 탐침 4종이 올바른
   순서에서 생성되고 **반대 순서에서 전부 사라지는 것**을 함께 요구한다.
2. Tailwind는 **제품 저장소의 것을 쓴다.** DS는 Tailwind에 의존하지 않으며(DS-D-0004), interop을
   재는 데는 제품이 실제로 쓰는 버전이 정본이다. 제품 저장소가 없는 hosted CI에서는 건너뛰되
   **건너뛰었다고 출력한다.**
3. 게이트에 canary를 내장한다. **반대 순서에서도 전부 살아남으면 실패한다** — 그 경우 계약이
   사라졌다는 뜻이므로 이 Decision을 다시 판정해야 한다. 일부만 사라져도 실패한다. 제품의 reset
   범위가 바뀐 것이기 때문이다.
4. DS는 `--color-*: initial` 같은 reset을 **발행하지 않는다**(DS-D-0013 6항 유지). 소비하는 쪽의
   선택이며 package가 강요할 것이 아니다.

## Consequences

- 소비 제품의 CSS 진입점에서 import 한 줄의 위치가 **계약**이 된다. 그 줄을 위로 옮기면 색과
  반경이 조용히 사라진다.
- 게이트는 제품 저장소가 로컬에 있을 때만 돈다. hosted CI는 이 계약을 지키지 못하므로, 이
  계약이 깨지는 변경은 **로컬 verify를 돌린 사람만** 잡을 수 있다.
- 제품이 reset 범위를 넓히면(예: `--spacing-*: initial` 추가) 게이트가 부분 생존으로 실패한다.
  그때는 계약을 다시 쓰는 것이 맞다.

## Rollback

게이트를 `pnpm verify`에서 빼고 이 문서를 폐기한다. 되돌리면 순서를 지키는지 아무도 검사하지
않으며, 잘못된 순서는 **빌드 오류 없이** 색과 반경이 사라지는 형태로만 드러난다.
