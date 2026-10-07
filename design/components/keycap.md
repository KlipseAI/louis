---
id: keycap
status: experimental
authority: normative
---

# Keycap

키보드 단축키 한 칸. 명령 팔레트·캔버스 도움말·메뉴의 단축키 표기에 쓴다.

| 항목 | 값 |
| --- | --- |
| Figma | `partial` — component set 발행됨. **아래 값(22×22)으로 아직 따라오지 않았다** |
| 코드 | CSS recipe `.louis-keycap` ([`keycap.css`](../../packages/css/src/component/keycap.css), 2026-10-07). React 표면은 없다 |

## 왜 있는가

제품 전수 인벤토리(2026-08-26)에서 **재사용되는 시각 패턴인데 디자인 시스템에 없던 것**으로
확인됐다. 적대적 검증을 통과했다 — 인용된 정의와 호출부가 실재하고, 기존 26 종 중 어느 것도
이것을 덮지 않는다.

## 두 소비처가 갈라져 있었다

제품에 키캡이 **두 벌** 있고 값이 달랐다. 제품 Tailwind 간격 격자는 `--spacing: 2px` 라 `11` = 22px,
`10` = 20px 이다.

| 항목 | 캔버스 도움말 `KBD` | 명령 팔레트 `KEY` | LOUIS |
| --- | --- | --- | --- |
| 칸 | 최소 22×22 (`min-w-11 h-11`) | 최소 20×20 (`min-w-10 h-10`) | **최소 22×22** |
| 가로 여백 | 6 (`px-3`) | 5 (`px-[5px]`) | **6** |
| 반경 | `radius-overlay-item` (10) | `rounded-6` (6) | **`radius-overlay-item` 10** |
| 면 | `bg-inset` | `gray-000` 8% + 같은 색 1px 안쪽 선 | **`color-bg-inset`**, 선 없음 |
| 글자색 | `fg-secondary` | `gray-000` 56% | **`color-fg-secondary`** |
| 글자 | caption-12-medium | 12 · 글자 키만 medium + 자간 0.02em | **`typography-caption-medium`** 전부 |
| 글리프 | — | 12×12 (`[&_svg]:w-6 h-6`) | 12×12 |

근거: `chore/landing-dead-walkthrough:…/CanvasHelpPanel.tsx@b3c56ed1a:164`(`KBD`), `origin/dev:…/CommandPalette.tsx:285`(`KEY`).

**도움말 쪽으로 닫은 이유.**

- 도움말은 이미 `--louis-*` 토큰으로 적혀 있다. 팔레트는 팔레트색 알파(`gray-000` 8%)와 라이트 테마 덮어쓰기
  두 줄을 직접 들고 있어 토큰으로 옮길 대응이 없다. `bg-inset` 은 테마를 따라 뒤집히므로 덮어쓰기가 필요 없다.
- 팔레트의 안쪽 1px 선은 8% 면 위의 8% 선이라 면을 한 번 더 칠한 것에 가깝다. inset 면은 overlay·카드·패널
  어느 표면 위에서도 읽히므로 선을 두지 않는다.
- 팔레트는 글리프 키와 글자 키(Esc)의 시각 무게를 맞추려고 글자 키에만 굵기와 자간을 줬다(`KEY_TEXT`).
  전부 medium 이면 그 갈래가 필요 없다 — Figma 의 `Kind`(glyph · text) 축도 코드에서는 필요 없다.

## Availability

| Surface | 상태 | 근거 |
| --- | --- | --- |
| Web | `not-ready` | CSS recipe 만 있다. React 표면·실브라우저 테스트·제품 소비 증거 없음 |
| Figma | `partial` | component set 은 발행돼 있으나 20×20 · 안쪽 그림자 기준이라 이 문서의 값과 어긋난다. 계약에 geometry 가 없어 두 쪽이 만나지 않는다. **Figma 는 아직 이 레시피로 고치지 않았다** |
| Documentation | `partial` | 이 문서 |
| Maturity | `experimental` | |

## Anatomy

1. **Root** — `<kbd class="louis-keycap">`. 키 하나. 조합(`⌘ K`)은 키캡을 나란히 놓아 만들고 묶는 요소는 소비자가 소유한다.
2. **Label** — 글자(`Esc` · `K`) 또는 12×12 글리프(`svg`). 한 덩어리라 줄이 바뀌지 않는다(`white-space: nowrap`).

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 칸 | 최소 22 × 22 | — (토큰 계단 밖) |
| 가로 여백 | 6px | — |
| 세로 여백 | 0 | — (칸 높이 22 고정, 가운데 정렬) |
| 반경 | 10px | `radius-overlay-item` |
| 면 | inset | `color-bg-inset` |
| 글자색 | secondary | `color-fg-secondary` |
| 타이포 | 12 medium | `typography-caption-medium` |
| 글리프 | 12 × 12 | — |
| 테두리 | 없음 | — (forced-colors 에서만 1px `currentColor`) |

칸 크기 22와 가로 여백 6 은 토큰 계단에 없다. 6 은 `space-overlay-inset` 과 같은 값이지만 그것은 오버레이 안쪽
여백의 뜻이라, 키캡이 빌려 쓰면 오버레이 여백을 바꿀 때 키캡이 따라 움직인다 — 리터럴로 둔 사유다.

**반경 10 은 거의 알약이다**(22 의 절반 11). 도움말의 값이고 `radius-overlay-item` 토큰이 이미 그 자리를 소유한다.

## 제품이 이관할 때 달라지는 것

- **명령 팔레트(`KEY`)**: 칸 20 → 22, 가로 5 → 6, 반경 6 → 10, 면 `gray-000` 8% + 안쪽 선 → `bg-inset`(선 없음),
  글자색 56% → `fg-secondary`, 글자 키의 자간 0.02em 제거. **면이 불투명해지고 한 겹 줄어든다** — 이관 때 팔레트 캡처로 본다.
- **캔버스 도움말(`KBD`)**: 값이 같다. 클래스 문자열만 `.louis-keycap` 으로 바뀐다.

## 다음

- [x] LOUIS CSS recipe 작성 (2026-10-07)
- [ ] React 표면 (`Keycap`) — 필요한지 먼저 판정한다. `<kbd class="louis-keycap">` 한 줄이라 CSS 로 충분할 수 있다
- [ ] 제품을 그 recipe 로 이관 (팔레트 `KEY` · 도움말 `KBD`)
- [ ] Figma component set 을 22×22 · `bg-inset` · 안쪽 그림자 없음으로 고친다 — **아직 안 했다**
- [ ] parity 계약(`scripts/verify-figma-parity.mjs`) 의 keycap 칸을 geometry 와 함께 갱신 (`Kind` 축 · 안쪽 그림자 계약 포함)

## 출처

- 2026-10-07 — CSS recipe 신설. 두 소비처(`CanvasHelpPanel.tsx@b3c56ed1a:164` · `CommandPalette.tsx:285`)의 치수·면을 하나로 정했다.
- 2026-08-26 — 제품 전수 인벤토리에서 미커버 패턴으로 확인.
