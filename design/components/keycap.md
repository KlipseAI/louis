---
id: keycap
status: experimental
authority: normative
---

# Keycap

키보드 단축키 한 칸. 명령 팔레트·캔버스 도움말·메뉴의 단축키 표기에 쓴다.

| 항목 | 값 |
| --- | --- |
| Figma | `done` — component set 발행됨. 2026-10-14 되읽기가 아래 값(22×22 · 좌우 4 · 반경 10 · 그림자 없음)과 같다 — 2026-10-14 기하 계약 · 실측 · 되재기로 done(DS-D-0035) |
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
| 가로 여백 | 6 (`px-3`) | 5 (`px-[5px]`) | **4 (`space-control-xs`)** — 한 글자 키가 정사각으로 남는 값 |
| 반경 | `radius-overlay-item` (10) | `rounded-6` (6) | **`radius-overlay-item` 10** |
| 면 | `bg-inset` | `gray-000` 8% + 같은 색 1px 안쪽 선 | **`color-bg-inset`**, 선 없음 |
| 글자색 | `fg-secondary` | `gray-000` 56% | **`color-fg-secondary`** |
| 글자 | caption-12-medium | 12 · 글자 키만 medium + 자간 0.02em | **`typography-caption-medium`** 전부 |
| 글리프 | — | 12×12 (`[&_svg]:w-6 h-6`) | 12×12 |

근거: `chore/landing-dead-walkthrough:…/CanvasHelpPanel.tsx@b3c56ed1a:164`(`KBD`), `origin/dev:…/CommandPalette.tsx@54b62a8a:285`(`KEY`).

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
| Figma | `partial` | component set 은 발행돼 있으나 20×20 · 안쪽 그림자 기준이라 이 문서의 값과 어긋난다. 2026-10-14 되읽기는 22×22 · 좌우 4 · 반경 10 · 그림자 없음으로 이 레시피와 같고, 계약의 geometry 가 기록 `keycap` 과 맞댄다(`recipe-parts-geometry.browser.test.tsx` 가 되잰다) |
| Documentation | `partial` | 이 문서 |
| Maturity | `experimental` | |

## Anatomy

1. **Root** — `<kbd class="louis-keycap">`. 키 하나. 조합(`⌘ K`)은 키캡을 나란히 놓아 만들고 묶는 요소는 소비자가 소유한다.
2. **Label** — 글자(`Esc` · `K`) 또는 12×12 글리프(`svg`). 한 덩어리라 줄이 바뀌지 않는다(`white-space: nowrap`).

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 칸 | 최소 22 × 22 | — (토큰 계단 밖) |
| 가로 여백 | 4px (`space-control-xs`) | 한 글자 키는 22×22 정사각, 여러 글자부터 가로로 늘어난다 |
| 세로 여백 | 0 | — (칸 높이 22 고정, 가운데 정렬) |
| 반경 | 10px | `radius-overlay-item` |
| 면 | inset | `color-bg-inset` |
| 글자색 | secondary | `color-fg-secondary` |
| 타이포 | 12 medium | `typography-caption-medium` |
| 글리프 | 12 × 12 | — |
| 테두리 | 없음 | — (forced-colors 에서만 1px `currentColor`) |

칸 크기 22 는 토큰 계단에 없어 리터럴이다. **가로 여백은 4(`space-control-xs`)다(2026-10-07).** 처음에는 도움말 값 6 을
그대로 받았는데, 그러면 12px 글리프 하나가 12 + 6 + 6 = 24 로 최소 22 를 넘어 **24×22 — 정사각이 아닌 칸**이 됐다(Figma 에서
드러났고 브라우저도 같다). 제품 두 소비처도 같은 산수로 한 글자 키가 22 를 살짝 넘는다. 여백 4 면 한 글자는 20 이라 최소 22 안에
들어가 늘 정사각이고, `Esc` 같은 여러 글자부터 가로로 늘어난다.

**반경 10 은 거의 알약이다**(22 의 절반 11). 도움말의 값이고 `radius-overlay-item` 토큰이 이미 그 자리를 소유한다.

## 제품이 이관할 때 달라지는 것

- **명령 팔레트(`KEY`)**: 칸 20 → 22, 가로 5 → 4, 반경 6 → 10, 면 `gray-000` 8% + 안쪽 선 → `bg-inset`(선 없음),
  글자색 56% → `fg-secondary`, 글자 키의 자간 0.02em 제거. **면이 불투명해지고 한 겹 줄어든다** — 이관 때 팔레트 캡처로 본다.
  [Command Palette](command-palette.md) 의 발이 이 레시피를 문다(DS-D-0095).
- **캔버스 도움말(`KBD`)**: 가로 여백 6 → 4 — 한 글자 키가 정사각이 된다. 나머지 값은 같고 클래스 문자열이 `.louis-keycap` 으로 바뀐다.

## 다음

- [x] LOUIS CSS recipe 작성 (2026-10-07)
- [ ] React 표면 (`Keycap`) — 필요한지 먼저 판정한다. `<kbd class="louis-keycap">` 한 줄이라 CSS 로 충분할 수 있다
- [ ] 제품을 그 recipe 로 이관 (팔레트 `KEY` · 도움말 `KBD`)
- [x] Figma component set 이 22×22 · 안쪽 그림자 없음이다 — 2026-10-14 되읽기로 확인(면 색 바인딩 이름은 되읽기가 담지 않는다)
- [x] parity 계약(`scripts/verify-figma-parity.mjs`) 의 keycap 칸을 geometry 와 함께 갱신 (2026-10-14 — `Kind` 축 두 칸, effects 없음)

## 출처

- 2026-10-07 — CSS recipe 신설. 두 소비처(`CanvasHelpPanel.tsx@b3c56ed1a:164` · `CommandPalette.tsx@54b62a8a:285`)의 치수·면을 하나로 정했다.
- 2026-08-26 — 제품 전수 인벤토리에서 미커버 패턴으로 확인.
