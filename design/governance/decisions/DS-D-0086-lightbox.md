---
id: decision-lightbox
status: experimental
authority: normative
---

# DS-D-0086 그림 크게 보기를 새 부품 `lightbox` 로 — Dialog 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-13)
- Date: 2026-10-13
- Owners: repository owner, design system maintainer
- Affects: `lightbox`, `dialog`, `media-slot`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `lightbox` 가 있다. 제품 두 화면이 그림
크게 보기를 각자 들고 있고 값이 이미 갈렸다 — 만들기 화면(`components/scenes/create/ImageLightbox.tsx`)은 스크림 72% · 층 1400 · 창 반경 16 ·
닫기가 창 안, 크리에이티브 미디어(`components/creative-media/CreativeMediaClient.tsx:1039-1060`)는 원시 검정 88% · 층 100 · 그림 반경 12 · 닫기가
화면 구석이다(통합 판 `54b62a8aa`).

첫 사본은 부채가 다섯이다.

1. 스크림 · 액션이 테마 램프 `--gray-1000-rgb` 를 물어 **라이트에서 흰색 72%** 로 뒤집힌다 — 흰 그림과 스크림의 경계가 1.00 이다.
2. `top · left · width · height` 를 280ms 전이한다 — [motion](../../foundations/motion.md) 의 modal 레시피가 허용하는 것은 `opacity · translate · scale` 셋이다.
3. 숫자 z-index(`z-[1400]`, 둘째 사본 `z-[100]`).
4. 모달 의미가 없다 — 역할 · 이름 · Esc · 초기 포커스 · 가둠 · 복귀가 모두 없어 키보드 사용자는 닫을 방법이 없다. 둘째 사본은 `role` 만 있다.
5. 닫힘 타이머 `setTimeout(280)`(`useCreateSceneUi.ts:109`)이 CSS 280ms 와 따로 산다.

## Decision

1. **새 컴포넌트 `lightbox`(CSS 레시피 · 문서 · Figma).** Dialog 의 변형으로 두지 않는다. Dialog 의 다섯 variant 는 모두 면(`__surface` — 제목 ·
   본문 · 푸터, 반경 20, 헤어라인) 위의 과업이고 열림 모션도 면의 `translate 8 · scale 0.98` 이다. 라이트박스에는 면이 없고, 창 크기가 그림
   비율에서 나오며, 열림이 썸네일 자리에서 자란다. `dialog[data-variant="viewer"]` 로 접으면 면 · 모션 · 폭 상한을 되돌리는 규칙이 Dialog
   안에 생긴다. 같은 것은 **모달 행동**뿐이고 문서가 [Dialog](../../components/dialog.md) 의 modal 계약을 가리킨다.
2. **사진 위라 media 색, 두 테마 같다.** 스크림 `media-scrim-dark` 88%, 액션 면 56% → 호버 80%, 잉크 `media-foreground-dark`. 새 토큰은 없다 —
   알파는 레시피의 `color-mix` 가 만든다(Media Slot 선례).
3. **열림은 FLIP(`translate` · `scale`), 시간은 modal 토큰(320 · 200).** 창은 최종 자리에 놓고 시작 자리(썸네일)를 변수로 되돌려 둔다.
   시작 자리와 그림 비율은 데이터라 소비처가 변수 넷(`--louis-lightbox-ratio` · `-from-x` · `-from-y` · `-from-scale`)으로 주고, 최종 크기
   (`min(640, 90vw, 80dvh × 비율)`)는 레시피가 갖는다.
4. **액션 버튼은 하위 부품 `.louis-lightbox__action`.** IconButton 에 `glass` 를 열지 않는다 — Figma 작성 규범 §2 의 `Variant` 는 강조 단계
   어휘이고, 그림 위 버튼은 media 잉크라 테마 버튼 계열에 들어가면 안 된다.
5. **React 표면은 만들지 않는다.** LOUIS overlay 로 띄울 수 있게 `.louis-overlay-panel.louis-lightbox` 되돌림 블록을 레시피에 둔다.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/lightbox.md`, 작업 폴더)이 남긴 판정 열을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 부품의 자리 | 새 컴포넌트 `lightbox` | `dialog[data-variant="viewer"]` · 제품 화면 고유 |
| 2 | 스크림 | 두 테마 `media-scrim-dark` 88% | 72% · `dim-modal`(테마를 따른다) · 제품대로 테마 램프 |
| 3 | 열림 모션 | FLIP `translate` · `scale` + modal 토큰(320 · 200) | 제품대로 레이아웃 속성 280 · 새 모션 토큰 `lightbox`(280) |
| 4 | 최종 크기의 주인 | 레시피 — `min(640, 90vw, 80dvh × 비율)`, 소비처는 비율만 | 소비처가 목표 상자 넷을 준다 |
| 5 | 액션 버튼의 자리 | 하위 부품 `__action` | `icon-button[data-variant="glass"]` · Media Slot 지우기를 키운 판 |
| 6 | 액션 작은 값 | 글리프 18 → 20(`icon-size-md`) · 전환 180 → 160ms · 36 · 안쪽 10 은 출처 주석 리터럴 · 라이트도 어두운 면 | 전부 제품 값 |
| 7 | 둘째 사본 접기 | 같은 부품 그대로 — 닫기는 창 안 액션, 반경 16 | `data-layout="corner"` 로 닫기를 화면 구석에 |
| 8 | 접근성 계약 | Dialog 모달 계약 전부를 문서 계약으로, 제품 (나)에서 고친다 | 제품 행동을 기록만 |
| 9 | 삭제 액션 | 허용하되 되돌리기 · 확인은 소비처가 붙인다. 제품 동작은 이번에 바꾸지 않는다 | 라이트박스에서 삭제를 뺀다 · 레시피에 확인 단계 |
| 10 | React 표면 · overlay 호환 | CSS + 마크업 계약만, overlay 되돌림 블록은 지금 둔다 | 되돌림도 React 회차로 · 지금 React `Lightbox` |

### 경계와 하지 않는 것

- 그림 하나 보기다. 무엇을 편집하는 큰 창은 Dialog `media-workbench`, 작은 썸네일 칸은 [Media Slot](../../components/media-slot.md)이다.
- 하지 않는다: 갤러리(이전 · 다음 · 쓸기), 확대 · 이동 · 두 손가락 줌, 캡션 · 메타, 다운로드, 영상, 썸네일 `cover` 잘림을 흉내 내는 clip 전이,
  스크림 흐림(`filter` 는 modal 허용 속성이 아니다), 삭제 확인(소비처 몫).

## Consequences

- 제품 (나) 두 파일이 바뀐다 — 라이트에서 스크림 · 액션이 어두워지고, 열림이 320 · 닫힘이 200 이 되고, 둘째 사본의 닫기가 창 안으로
  들어간다(보이는 변화). 목표 상자 셈(`useCreateSceneUi.ts:66-75`)은 비율 하나로 줄고, 닫힘 타이머는 루트의 계산된 `transition-duration` 을 읽는다.
- Figma 에 `LightboxAction`(State Default · Hover)과 `Lightbox` 단일 컴포넌트가 선다. 새 변수는 없다.

## Rollback

`lightbox.css` · 문서 · manifest 항목 · Figma 둘 · 기록 · parity 계약을 지우면 끝난다. 토큰을 더하지 않아 생성 토큰과 기준선이 움직이지 않는다.
