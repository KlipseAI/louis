---
id: decision-command-palette
status: experimental
authority: normative
---

# DS-D-0095 입력 하나로 앱의 행동을 찾아 실행하는 모달을 새 부품 `command-palette` 로 — Dialog 의 변형이 아니다, Menu 항목에 한 줄 변형

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `command-palette`, `menu-popover`, `dialog`, `floating-shell`, `keycap`, `icon-button`, `icon`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `command-palette` 가 있다. 제품의 전역 검색 · 실행 모달
(`components/navigation/CommandPalette.tsx`, 955줄, 통합 판 `54b62a8aa`)은 사이드바 「검색」 버튼과 ⌘K 로 열리고(`components/navigation/Gnb.tsx:2828-2838`),
화면 위쪽(14vh)에 560 폭 유리 패널로 선다. 반경 · 그림자 · 헤어라인 · 메뉴 면 같은 LOUIS 토큰 일부를 물지만 행 · 그룹 제목 · 키캡 · 닫기를 자기 상수
서른여 개로 다시 그린다.

제품 값에 결함이 다섯 있다 — 보조 글자(그룹 제목 · 설명 · 현재값 · 안내 · 키 안내)가 잉크 40 · 48% 라 라이트에서 2.40 ~ 2.96, 키캡 글자 3.60, 위험 행
`accent-red-500` 이 라이트 2.55 로 미달한다. 숫자 z-index 가 셋(`13000` · `1` · `2`)이고, 닫힘 타이머 220ms 가 패널 전이 300ms 보다 짧아 퇴장 끝이 잘린다.
모달 · 목록 의미가 없다 — 이름 없는 `role="dialog"`, 이름 없는 입력, 행이 전부 `<button>` 이라 Tab 이 행을 돈 뒤 뒤 페이지로 나가고, 방향키 하이라이트를
보조기술이 모른다.

LOUIS 에 대응이 없다. [Dialog](../../components/dialog.md)는 제목 · 설명 · 액션 행의 **과업 면**이고 가운데에 서며 불투명 `bg-overlay` · `elevation-modal`
이다. [Menu / Popover](../../components/menu-popover.md)는 트리거 옆의 비모달 면이고, [Select](../../components/select.md)의 검색 목록은 트리거에 붙는 값 목록이다.
[Floating Shell](../../components/floating-shell.md) 문서는 이미 「`CommandPalette` 의 560 모달은 이 세트에 담지 않았다」고 적었다.

## Decision

1. **새 부품 `command-palette` 한 벌**(`.louis-command-palette` · `__scrim` · `__panel` · `__search` · `__search-icon` · `__input` · `__body` · `__list` ·
   `__group` · `__empty` · `__chevron` · `__flyout` · `__footer` · `__hint`). 부품이 소유하는 것은 **셸과 자리**다 — 셸(딤 · 유리 면 · 위쪽 정렬 배치), 검색줄,
   목록 자리, 플라이아웃 자리, 키 안내 발.
2. **그 안에 서는 조각은 기존 부품의 조합이다** — 행 `.louis-menu__item`, 그룹 제목 `.louis-menu__group-label`, 닫기 `.louis-icon-button` sm ghost,
   키 [Keycap](../../components/keycap.md), 플라이아웃 면 `.louis-popover`, 글리프 `.louis-icon`. 같은 값을 레시피에 다시 적지 않는다.
3. **Menu 항목에 한 줄 변형 `data-layout="inline"`.** 이름 옆에 설명이 같은 줄로 서고 넘치면 설명부터 말줄임이 걸린다. 설명 잉크는 `fg-secondary` 다
   (두 줄 항목의 `fg-tertiary` 는 하이라이트 면 위 4.28). Figma `Menu` 세트의 `Layout=inline`, [§2](../figma-component-authoring.md) 쓰임새 이름에 `inline`.
4. **면은 `bg-menu` 88% + 흐림 4(두 테마), 딤 `dim-modal`, 겹 `layer-critical`, 위험 행 `fg-danger-on-surface`.** 새 토큰 0 — 유리 알파는 레시피의
   `color-mix` 가 만든다(floating-shell 선례).
5. **열림은 여는 버튼 자리에서 translate + 두 축 scale**, 시간은 `motion-modal-enter/exit` 토큰, 루트는 페이드하지 않는다(조상의 opacity 가 패널의 배경 흐림
   기준을 바꾼다). 시작 자리 넷과 플라이아웃 위치 하나는 소비처가 주는 변수 다섯이다. 수명은 overlay 의 `data-louis-state` 어휘다.
6. **접근성은 combobox + listbox + `aria-activedescendant` + Dialog 모달 계약(가둠 · inert · Esc · 복귀 · 스크롤 잠금) + 결과 수 `role="status"`** 를 문서
   계약으로 두고 제품 (나)에서 고친다.
7. **아이콘 세트에 phosphor `arrow-down` 을 더한다** — 발의 ↓ 키(제품은 ↑ 를 돌려 그렸다, `components/navigation/CommandPalette.tsx:905-920`).
8. **React 표면은 만들지 않는다.** 마크업 계약을 문서가 소유한다. use-overlay 로 띄울 수 있게 `.louis-overlay-panel.louis-command-palette` 되돌림을 레시피에 둔다.
   새 의존성 · 패키지 구조 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/command-palette.md`, 작업 폴더)이 남긴 판정 열하나를 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 부품의 자리 | 새 컴포넌트 `command-palette` — 셸 · 자리만 소유, 조각은 기존 부품 조합 | `dialog[data-variant="command"]`(면 · 정렬 · 그림자 · 반경을 되돌리는 규칙과 검색줄 · 목록 · 발을 Dialog 에 들인다) · `popover[data-kind="command"]`(비모달 · 앵커 면) · 제품 화면 고유(DS-D-0084 위반) |
| 2 | 패널 면 | 두 테마 `bg-menu` 88% + 흐림 4. 보통 바닥 전부 통과, 유리 느낌을 남긴다. 다크 면이 pg-800 → pg-900 한 칸 어두워진다 | 제품대로 72%(다크 면에 새 시맨틱 1 — 라이트에서 위험 4.16 · `fg-tertiary` 4.40 미달) · 불투명 `bg-menu` |
| 3 | 딤 | `dim-modal`(라이트 pg-900 56% · 다크 pg-950 72%) — 모달 딤 하나, 토큰 증가 없음 | 제품 검정 24% / 40% — 새 시맨틱 `color-dim-command` |
| 4 | 겹 | `layer-critical`(13000) — Foundation 표가 이미 이 자리를 critical 로 적었다(`elevation-layer.md`) | `layer-modal`(10200) |
| 5 | 행 | Menu 항목 그대로 + 새 변형 `data-layout="inline"`(37 · 좌우 12 · 간격 6 · regular · 설명 같은 줄 `fg-secondary`). 행 5px 커짐 · 이름 medium → regular | 팔레트 전용 행(제품 32 · 10 · 10 · medium) · Menu 두 줄 항목(57) |
| 6 | 위험 행 잉크 | 팔레트 안에서 `fg-danger-on-surface`(범위 규칙) — Menu 의 같은 결함이 같은 답으로 정해지면 이 범위 규칙을 지운다 | Menu 그대로 `accent-danger`(유리 위 라이트 2.59) |
| 7 | 열림 모션 | 버튼 자리에서 translate + 두 축 scale(제품 그대로), modal 토큰 320 · 200 | 균일 scale(lightbox 처럼) · 버튼 무관 Dialog 등장(8px · 0.98) |
| 8 | 플라이아웃 | `.louis-popover` 면(불투명 `bg-menu` · 반경 16 · 안쪽 6) + `__flyout` 자리, `role="listbox"` · 지금 값 `aria-selected` · overlay-enter 200ms. 모서리 12 → 16, 지금 값 표시가 생긴다 | 제품대로 96% · 반경 12 · `role="menu"` · 130ms |
| 9 | 라벨 hover 마퀴 | 넣지 않는다 — 말줄임만 | 레시피에 hover 마퀴(새 keyframe · loop 수명 · 측정 JS) |
| 10 | 접근성 계약 | combobox + listbox + activedescendant · Dialog 모달 계약 · 결과 수 status 를 문서 계약으로, 제품 (나)에서 고친다 | 제품 행동을 기록만 |
| 11 | 작은 값 접기 | 검색줄 14 · 12 → 12 · 12, 좌 18 · 우 14 · 간격 10 → 6 · 발 10 → 8, 좌우 14 → 18 · 그룹 사이 10 → 8 · 행 글리프 불투명도 0.72 제거 · 1px 8% 선 → 헤어라인 · 키캡 20 → 22 · 높이 70vh → 70dvh · ↓ 글리프는 세트의 `arrow-down`. 이름 없는 값(560 · 14vh · 180 · 28 · 12)만 출처 주석 리터럴 | 전부 제품 값 |

### 경계와 하지 않는 것

- 부품이 소유한다 — 루트 배치(위 14vh · 좌우 아래 16, 720 미만 8vh · 12), 딤, 패널(560 · ≤ min(70dvh, 520) · 반경 16 · 유리 88% · 흐림 4 ·
  `elevation-menu` + 헤어라인), 검색줄(48 · 좌 18 · 우 14 · 사이 6 · 아래 헤어라인), 본문 · 목록(안쪽 6 · 그룹 사이 4 · 행 사이 2), 셰브론 12, 결과 없음(위아래 28),
  플라이아웃 자리(오른쪽 6 · 폭 180), 발(38 · 좌우 18 · 묶음 16 · 키 사이 4 · 위 헤어라인)과 수명 · 줄인 모션 · 강제 색.
- 소비처가 소유한다 — 행 데이터 · 거르기 · 실행, 하이라이트 이동(한 행 · 끝에서 돈다), 시작 자리 측정(변형 무관 레이아웃 값), 플라이아웃 위치 자르기,
  닫힘 타이머(루트의 계산된 `transition-duration`), ⌘K 등록, 포커스 가둠 · 복귀, 스크롤 잠금, 한글 조합 중 Enter 무시.
- 하지 않는 것 — 검색 알고리즘(흐린 일치 · 점수 · 최근 항목), 두 단계 넘는 하위 목록, 라벨 hover 마퀴, 행 안 단축키 표기, 미리보기 창, 터치 기기에서 발 감추기,
  스크롤 막대 모양, React 컴포넌트.

## Consequences

- 새 토큰 0. Menu 에 `data-layout="inline"` 한 변형이 더해진다 — Menu 를 쓰는 다른 화면은 그 속성을 달지 않는 한 그대로다.
- 아이콘 세트에 `arrow-down`(phosphor). Figma DS · Icons 에 `icon/arrow-down`.
- 제품 (나): `CommandPalette.tsx` 의 상수를 `louis-command-palette*` · `louis-menu__*` · `louis-keycap` · `louis-icon-button` · `louis-popover` 로,
  `--cmd-tx/ty/sx/sy` → `--louis-command-palette-from-*`, `EXIT_MS` → 계산된 전이 시간, `wheel` · `touchmove` 가로채기 → `data-louis-scroll-locked` · 배경 inert,
  행 `<button>` → `role="option"` + `data-highlighted`, 플라이아웃 `role="menu"` → `role="listbox"`, 키 처리에 `isComposing` 가드.
  보이는 변화 — 행 32 → 37 · 이름 regular, 라이트 보조 글자 · 위험 행이 짙어짐, 다크 면 한 칸 어두움, 딤이 짙어짐, 열림 320 · 200, 플라이아웃 모서리 16 · 지금 값 표시.
- Figma — `CommandPalette` · `CommandPaletteEmpty` 컴포넌트와 `Menu` `Layout=inline` 일곱 변형, `icon/arrow-down`, 예시 보드 둘이 섰다(figma `partial` — 제품 렌더 대조 전).

## Rollback

`command-palette.css` · 문서 · manifest 세 자리 · Figma 두 컴포넌트 · 기록 · parity 계약을 지우고, `menu-popover.css` 의 inline 블록과 Figma `Layout=inline` 일곱 변형 ·
§2 한 단어를 되돌린다. 토큰을 더하지 않아 생성물 · 기준선이 움직이지 않는다(아이콘 `arrow-down` 은 남겨도 해가 없다). 제품은 아직 이 클래스를 물지 않으므로 화면 변화가 없다.
