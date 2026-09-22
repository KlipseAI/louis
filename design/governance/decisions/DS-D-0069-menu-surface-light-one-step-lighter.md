---
id: decision-menu-surface-light-one-step-lighter
status: experimental
authority: normative
---

# DS-D-0069 메뉴 면(`color-bg-menu`) 라이트를 사다리 한 칸 밝게 — `palette-gray-050` → `palette-gray-025`

- Status: accepted (LOUIS 2026-09-22, 제품은 핀 상향 PR 로 받는다)
- Date: 2026-09-22
- Owners: design system maintainer
- Affects: `component-menu-popover`, `floating-shell`, `decision-dead-token-unit-and-denominator`,
  `decision-three-in-one-change`

## Context

소유자 요청(2026-09-22): 「프로필 팝오버나 모델 변경 등 모든 드롭다운의 라이트 모드 색 바탕을 한 톤 밝게」.

제품 드롭다운의 면은 제품 CSS 가 아니라 LOUIS 가 정한다. 제품 `globals.css` 는 「dropdown/menu/popover
surface 는 LOUIS 정본을 직접 소비한다」고 적고, 2026-09-22 전수(제품 `origin/dev` `a499aa89`, LOUIS 핀
`9a8ab418`)에서 드롭다운은 두 길로 이 토큰을 받는다.

| 길 | 소비처 |
| --- | --- |
| `.louis-popover` 레시피(`menu-popover.css` — `background: var(--louis-color-bg-menu)`) | CustomDropdown(언어 · 정렬 · 모델 · 관리자 선택 · 편집기 드롭다운), 언어 선택, 새로 만들기 메뉴, 분석 계정 메뉴, 편집기 · 하이라이트 기록 메뉴, 캔버스 우클릭 · 노드 더보기 · 확대 메뉴, 노드 메타 드롭다운(이미지 · 영상 모델 · BGM · TTS · 편집 · 글 · 유튜브) |
| 제품이 같은 토큰을 직접 선언(`[background:var(--louis-color-bg-menu)]`) | 앱 셸 프로필 팝오버 · 프로젝트 드롭다운(`Gnb.tsx:1362` · `:1520`) |

라이트 값은 `palette-gray-050`(#ebecee, L\* 93.36)이다. 회색 사다리에서 한 칸 위는 `palette-gray-025`
(#f2f3f5, L\* 95.81)이고 그 위가 `palette-gray-000`(#fafafa)이다. 이 토큰은 전에도 소유자 재보정으로 한 칸
올라온 적이 있다 — `palette-gray-100` → `050`([DS-D-0047](DS-D-0047-dead-token-unit-and-denominator.md) 의 기록).

**이 토큰은 드롭다운만의 재료가 아니다.** 캔버스 하단 툴바(`.louis-floating-shell`, 면 72% · 88%)와 확대
알약(`.louis-pill-trigger`)이 같은 이름에 묶여 있고, `verify-recipe-record` 가 그 이름을 계약으로 지킨다
([Floating Shell](../../components/floating-shell.md) 「재료가 하나다」). 제품도 드롭다운이 아닌 자리 몇 곳에서
이 토큰을 빌려 쓴다(아래 Consequences).

## Decision

라이트 `color-bg-menu` 를 `{primitive.color.palette-gray.025}` 로 옮긴다. 다크는 그대로
`{primitive.color.palette-gray.900}` 이다. 소유자는 두 갈래 중 **재료째 한 칸**을 골랐다 — 드롭다운 · 툴바 ·
알약이 한 재료라는 계약을 유지하고, 모두 함께 밝아진다.

## Alternatives

| 대안 | 버린 이유 |
| --- | --- |
| 드롭다운 전용 면 토큰을 새로 세운다 | 한 재료 계약이 갈라지고, 새 토큰 · Figma 변수 · 제품 소비처 수정(직접 선언 둘 포함)이 더 든다. 소유자가 고르지 않았다 |
| 두 칸 밝게(`palette-gray-000` #fafafa) | 요청은 한 톤이다. 그 값은 `bg-surface` · `bg-overlay` 와 같아 메인 카드 위 드롭다운이 면으로는 갈리지 않는다 |
| 제품에서만 덮는다 | 제품은 드롭다운 면을 LOUIS 정본에서 직접 받도록 옮겼다. 덮으면 그 이관을 되돌린다 |

## Consequences

- **라이트 메뉴 면이 `bg-canvas`(palette-gray-025)와 같은 값이 된다.** 캔버스 색 위에 뜬 드롭다운은 면이 아니라
  `elevation-menu` 그림자와 헤어라인으로 갈린다. 제품 `globals.css` 가 이미 「계단은 면이 아니라 헤어라인과
  그림자가 만든다」고 적은 형태다. 메인 카드(`bg-surface` #fafafa) 위에서는 여전히 한 칸 어둡다.
- **danger 항목 글자 대비가 라이트에서 2.77 → 2.95 로 오른다.** 여전히 AA 에 못 미친다 —
  [Menu / Popover](../../components/menu-popover.md) 의 소유자 판정 거리는 그대로다.
- **제품에서 빌려 쓰는 자리**(2026-09-22 전수, 제품 `origin/dev` `a499aa89`):

  | 자리 | 무엇 | 바뀌는 것 |
  | --- | --- | --- |
  | `VideoEditScene.tsx:332` · `highlightSceneStyles.ts:568` | 더보기 버튼 hover 면 | 아래 면이 pg-050 이라 hover 가 그보다 한 칸 밝게 보인다 — 여전히 보인다 |
  | 대시보드 성과 탭의 로딩 스켈레톤 | 토글 트랙 | 카드 면(`bg-canvas`)과 같아져 헤어라인만 남는다 |
  | `nc/index.tsx:488` · 하단 툴바 · 확대 알약 | 미니맵 · 플로팅 셸 · 알약 | 캔버스 pg-100 위라 대비가 커진다 |
  | `inspectorPrimitives.tsx:38` | 편집기 지표 행 | 판 면(`bg-inset` pg-050)과 같아 안 보이던 행이 한 칸 밝게 보인다 |
  | 메뉴 안 선택 행(pg-100 · pg-200) | 면 위의 채움 | 대비가 커진다 |
  | 프로필 크레딧 카드(pg-100) | 면 위의 채움 | 소유자가 한 칸 따라 올리라고 했다(2026-09-22) — 제품 PR 에서 라이트 pg-050. 면과의 한 칸 간격이 그대로다 |

- **토큰을 쓰지 않는 드롭다운은 따라오지 않는다** — 클립 자르기 비율 메뉴(`bg-palette-gray-100`) · 명령
  팔레트(`pg-100` 72% · 96%). 소유자는 두 곳을 같은 면으로 맞추라고 했다 — 제품 PR 이 라이트 면을 `bg-menu`
  (명령 팔레트는 같은 72% · 96% 섞음)로 옮기고 다크는 그대로 둔다. 보관함 메뉴는 이미
  `palette-gray-000` 이라 그대로 둔다.
- **제품은 핀을 올릴 때 받는다.** 제품 웹 앱의 `package.json` 이 `@klipse-design/css` 를 LOUIS 커밋 해시로
  고정한다. 핀을 올리면 그 사이 LOUIS 변경(DS-D-0066 primary 버튼 빛 · DS-D-0067 문서 패턴 · DS-D-0068
  헤어라인)도 함께 들어간다.

## 세 곳 ([DS-D-0028](DS-D-0028-three-in-one-change.md))

| 자리 | 바꾼 것 |
| --- | --- |
| 코드 | `packages/tokens/src/klipse.tokens.json` 의 라이트 `bg-menu` 한 줄, 생성물(`tokens.css` · `figma.tokens.json` 등)과 `figma/apply-variables.7.js` 는 생성기로 |
| Figma | LOUIS 변수 `color/bg-menu`(`VariableID:341:4443`)의 Light 별칭 `palette-gray/050` → `palette-gray/025`. `build-figma-variables --only color-bg-menu` 조각을 그대로 보냈다(보낸 code sha256 `967ba0b8…` = 조각 파일, 갱신 1 · 생성 0 · 별칭 누락 0). 되읽기(`--variables --only color/bg-menu`)를 `readback.json` 에 병합하고 `snapshot.json` 을 다시 만들었다 |
| 문서 | 이 결정, [Menu / Popover](../../components/menu-popover.md) 표면 값 · 명세 · danger 대비, [Floating Shell](../../components/floating-shell.md) 라이트 면 이력, [Updates](../../updates/README.md) (153) |

## Rollout and verification

- 적용 전 라이브 `color/bg-menu` 는 스냅숏과 같았다(Light `palette-gray/050` · Dark `palette-gray/900`, 읽기 전용 탐침).
- 적용 뒤 되읽기: Light `palette-gray/025` · Dark `palette-gray/900`, 누락 0.
- 제품 확인: 제품 dev 서버(로그인 우회)의 라이트 프로필 팝오버 면이 `lab(93.36 …)` → `lab(95.81 …)` 가 되는 것을
  화면으로 봤다(브라우저에서 토큰만 덮은 비교 캡처 — 파일 변경 없음).

## Rollback

토큰 한 줄을 `palette-gray.050` 으로 되돌리고 생성물을 다시 만든다. Figma 는 같은 `--only color-bg-menu` 조각을
다시 만들어 보내고(Light 별칭이 `palette-gray/050` 으로 돌아간다) 되읽기를 병합한 뒤 스냅숏을 다시 만든다.
제품은 핀을 되돌린다.
