---
id: decision-chat-panel
status: experimental
authority: normative
---

# DS-D-0094 접힌 알약이 대화 창으로 자라는 떠 있는 대화 셸을 새 부품 `chat-panel` 로 — Dialog · Floating Shell 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `chat-panel`, `button`, `inline-loading-label`, `slider`, `icon-button`, `loading-word`, `dialog`, `floating-shell`, `motion`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `chat-panel` 이 있다. 하이라이트 판의 「AI 클립 수정」
(`components/scenes/highlight/ClipRefinementWidget.tsx`, 통합 판 `54b62a8aa`)은 화면 구석에 접힌 알약으로 쉬다가 누르면 **같은 요소 그대로** 대화 창으로
자란다 — 알약 단추가 창의 머리가 되고 그 아래 기록 · 제안 · 입력 줄이 열린다. 제품 상수 서른넷(`components/scenes/highlightSceneStyles.ts:445-1082`)과
keyframe 넷(`app/keyframes.css:911-958`)으로 그려진다. 그려지는 자리는 판 무대 하나이고(`components/scenes/highlight/HighlightStudioBoard.tsx:1514`),
부르는 곳은 실제 장면과 개발 미리보기 둘이다.

LOUIS 에 대응이 없다. 떠 있는 부품 넷 — [Dialog](../../components/dialog.md)(가운데 모달 · 스크림 · 포커스 가둠) · [Floating Shell](../../components/floating-shell.md)
(반투명 유리 재료, 모양이 자라지 않는다) · [Menu Popover](../../components/menu-popover.md)(트리거와 떨어진 목록) · [Toast](../../components/toast.md)(한 줄 알림) —
어느 것도 **알약 ↔ 창 모핑 · 대화 기록 · 두 화자의 말풍선 · 입력 독**을 갖지 않는다.

이 위젯은 테마와 무관하게 늘 어둡다 — 면이 고정 `palette-gray-900` 이고 안의 잉크도 고정 `palette-gray-*` 다. 제품 값에 결함이 셋 있다 — 입력칸 placeholder 가
입력 줄 위 4.09, 잠김 버튼이 위젯 갈래가 없어 라이트 테마에서 어두운 창 위에 라이트 잉크를 칠한다(글 3.74 · 점선이 면과 같은 색), 투명도 슬라이더는 다크
스코프가 없어 LOUIS Slider 의 토큰 셋을 덮어 썼다.

알약 ↔ 창은 폭 · 높이 상한 · 안쪽 · 반경 · 그림자를 함께 옮긴다. motion 토큰 모델([Motion](../../foundations/motion.md))의 어떤 lifecycle 도 그 속성들을 허용하지
않는다 — `layout-change`([DS-D-0019](DS-D-0019-layout-change-motion.md))는 `inline-size` · `block-size` · `background-color` 셋뿐이다.

## Decision

1. **새 부품 `chat-panel` 한 벌**(`.louis-chat-panel` · `__header` · `__trigger` · `__trigger-icon` · `__title` · `__controls` · `__opacity` · `__close` · `__body` ·
   `__log` · `__bubble` · `__text` · `__diff` · `__media` · `__actions` · `__dock` · `__suggestions` · `__suggestion` · `__composer` · `__input` · `__gate`).
   축은 루트 `data-state="closed|open|closing"` 과 말풍선 `data-from="user|assistant"` · `aria-busy` 다.
2. **안의 조작은 있는 부품을 그대로 앉힌다** — 보내기 · 적용 · 취소 [Button](../../components/button.md), 스피너 라벨
   [Inline Loading Label](../../components/inline-loading-label.md), 투명도 [Slider](../../components/slider.md), 닫기 [Icon Button](../../components/icon-button.md) `ghost`,
   생각 중 [Loading Word](../../components/loading-word.md).
3. **늘 어두운 면은 토큰이 아니라 스코프다.** 소비처가 루트에 `data-theme="dark"` 를 단다. 레시피는 일반 시맨틱만 쓴다 —
   [DS-D-0068](DS-D-0068-hairline-recipe-per-theme-scope.md) 이 연 중첩 스코프에서 제품 고정값 열일곱 자리 가운데 열이 다크 시맨틱과 바이트 같다.
4. **새 토큰 하나 — 모션 `motion-chat-panel-morph`**(440ms · `cubic-bezier(0.32, 0.72, 0, 1)` = `menu-enter` 곡선, 원시 `transition-chat-panel-morph`).
   색 토큰은 0 이다.
5. **다섯째 motion lifecycle `morph`.** 허용 속성은 `inline-size` · `max-inline-size` · `max-block-size` · `padding` · `border-radius` · `box-shadow` · `opacity` ·
   `translate` · `scale` 이다(`scripts/lib/token-model.mjs`). 한 요소가 다른 모양으로 자라는 셸만 쓴다. `layout-change` 를 넓히지 않는 이유 — 넓히면 그 lifecycle 의
   세 항목(크기가 상태인 컨트롤)의 검출력이 함께 풀린다. 줄인 모션 짝은 `motion-reduced` 다.
6. **고쳐 올리는 값**(DS-D-0084 3항) — placeholder `fg-secondary`(4.09 → 5.63), 잠김 단추는 다크 스코프의 `fg-tertiary` · `gray-000-alpha-16`(라이트 결함 3.74 → 5.25),
   슬라이더 토큰 덮기 셋 제거.
7. **React 표면은 만들지 않는다.** 마크업 계약을 문서가 소유한다. 새 의존성 · 패키지 구조 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/chat-panel.md`, 작업 폴더)이 남긴 판정 열다섯을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 새 부품인가 | 새 부품 `chat-panel` — dialog 는 가운데 · 스크림 · 가둠이 뼈대이고, floating-shell 은 반투명 유리 재료가 불변식이다. 둘 다 모양이 자라지 않는다 | `dialog` 변형(`data-size="panel"` · 비모달) · `floating-shell` 변형 |
| 2 | 늘 어두운 면 | 마크업 계약 `data-theme="dark"` 루트 — 일반 시맨틱만, 새 색 0. 안의 LOUIS 부품이 덮어쓰기 없이 맞는다 | 고정 토큰 `chat-panel-*` 일고여덟(media-* 꼴) · 테마를 따른다(라이트에서 밝은 창) |
| 3 | 사용자 말풍선 글 3.37 | Button primary 수용 편차를 따른다 — 기록만(`button.md` 「다시 제안하지 않는다」, segment-track 선례). 여러 줄 본문이라 넓혀 읽은 것을 Known deviation 으로 남긴다 | 새 토큰 `color-chat-panel-bubble-user` = `blue-620`(5.00) · `blue-700`(6.12) |
| 4 | 입력 줄 면 | 창 면 위 `gray-000-alpha-08` 불투명 합성(#292d33 — 제품 #2b2f36 과 ΔRGB 2~3), 새 토큰 0 | `node-composer-surface` 를 빌린다 · 새 토큰 `color-chat-panel-composer-surface` |
| 5 | 여닫는 모션 | 새 모션 레시피 `motion-chat-panel-morph` + lifecycle `morph`(결정 4 · 5). 제품의 스프링 곡선은 접는다 — 넘침은 keyframe 72% 칸이 그린다 | 모핑 없이 `modal-enter/exit` 의 opacity + scale(알약이 사라지고 창이 뜬다) · 레시피는 끝 상태만, 모션은 소비처 |
| 6 | 투명도 슬라이더 색 | LOUIS Slider 그대로(다크 스코프 — 채움 · 썸 파랑, 레일 `stroke-default`). 보이는 변화 | 제품처럼 중립(채움 · 썸 gray-100) — 레시피가 슬라이더 토큰을 덮는다 |
| 7 | 닫기 단추 | `louis-icon-button[data-variant="ghost"]` + `__close`(쉴 때 면 8% · 호버 12%). 글리프가 흰 80% → `fg-secondary`(5.81) | icon-button ghost 그대로(쉴 때 면 없음) · 레시피 고유 단추 |
| 8 | 기록의 의미 | `__log` 에 `role="log"` — 새 말풍선 낭독 | 제품 그대로(맨 `div`) |
| 9 | Esc 로 닫기 | 더한다 — 초점이 창 안에 있을 때만, 닫은 뒤 초점은 알약으로 | 제품 그대로(닫기 단추만) |
| 10 | 차이 상자 글 | `fg-secondary`(4.53) — 기준을 넘고 위계를 지킨다. 시험이 잰다 | `fg-primary`(10.35) · 새 토큰(gray-200) |
| 11 | 잠김 단추 | 레시피 `__gate`(점선 · 반경 10) — 점선은 「아직 열리지 않은 자리」 | `button[data-variant="secondary"]` 꽉 찬 폭(보이는 변화) |
| 12 | 그림자 | 닫힘 `elevation-toast` · 열림 바깥 1px 8% + `elevation-modal` | 새 elevation 토큰 둘(제품 값) |
| 13 | 자리 | 소비처 몫 — 레시피는 크기 변수 셋만(floating-shell 선례) | `data-placement="viewport\|stage"` 를 레시피가 갖는다 |
| 14 | 제품 죽은 갈래 | 제품 (나)로 지운다(비대화 · 라이트 말풍선 · `hideHeader` · `maxRefines` · `remainingRefines`) | 레시피에 비대화 판(`data-layout="inline"`)을 함께 세운다 |
| 15 | 반짝 글리프 | 제품 글리프를 아이콘 세트에 `sparkle-generate` 로 더한다 — node-shell 생성 버튼과 같은 표식. 채움 + 획 2 섞임이 [DS-D-0085](DS-D-0085-filled-glyphs-and-monochrome-brand.md) 채움 글리프 규칙에 맞는지는 아이콘 회차에서 보고 그때 세트에 올린다(DS-D-0084 「부품이 아니다 — 아이콘 세트로」의 sparkle 1). 그때까지 소비처가 인라인으로 넣는다 | 세트의 `sparkle-fill`(광선 넷 없음) · 소비처 인라인으로 둔다 |

### 경계와 하지 않는 것

- 부품이 소유한다 — 셸 세 상태(알약 40 · 반경 12 ↔ 창 360 × 560 · 안 8 · 반경 22), 빛(안쪽 8 → 24)과 고리(안쪽 1px 16%), 머리(안 0 16 → 8, 높이 40 → 48) ·
  조작 묶음(폭 0 → 104), 본문(닫힘 크기 0), 기록(위 10 · 좌우 14 · 사이 8), 말풍선(8 · 12 · 반경 12 · 최대 85%) · 차이 상자 · 미디어 틀 · 결정 줄, 독(위 10 · 사이 10) ·
  제안(간격 20 · 사이 선) · 입력 줄(48 · 반경 14) · 잠김(43 · 반경 10), 모핑 · 튐 · 올라옴 모션과 줄인 모션.
- 소비처가 소유한다 — 자리(화면 구석 `fixed` · 무대 구석 · 폰 판의 `--studio-refine-top` 식), 겹 순서(`--louis-layer-popover`), 전체 투명도(0.35 ~ 1, 사용자 설정),
  열림 상태와 초점 옮기기, 닫힘 타이머(같은 토큰의 duration 을 읽는다), 기록 끝으로 굴리기, Enter 보내기(IME 조합 제외), 미디어 틀 안의 미리보기 플레이어,
  알약 폭 재기, 반짝 · 닫기 글리프.
- 하지 않는 것 — React 컴포넌트, 모달 가둠 · 스크림, 메시지 데이터 모델, 스트리밍 글자, 첨부, 여러 줄 입력, 밝은 창 판의 계약 시험(레시피는 테마를 모르므로
  `data-theme` 를 빼면 밝아지지만 시험하지 않는다), 제품 비대화 갈래.

## Consequences

- 새 토큰 하나 — `motion-chat-panel-morph`(원시 `transition-chat-panel-morph`), `motionProperties` · `reducedMotionPairs` 한 줄씩. 토큰 모델에 lifecycle `morph` 가
  더해진다 — [Motion](../../foundations/motion.md) Token model 의 lifecycle 목록이 바뀐다.
- 제품 (나): 위젯 상수 → `louis-chat-panel` + `data-state`(`open` · `closing` 클래스 둘을 속성 하나로) + `data-theme="dark"`, `--refinement-panel-*` →
  `--louis-chat-panel-*`, `--refine-pill-w` → `--louis-chat-panel-pill-inline-size`, `z-index: 1300` → `--louis-layer-popover`, 닫힘 타이머 440 → 토큰 계산값,
  슬라이더 덮기 셋 · `--button-height` · keyframe 넷 · 죽은 갈래 삭제, 생각 중 쉬머 → Loading Word, 기록에 `role="log"`, Esc 로 닫기.
  보이는 변화 — 차이 상자 글 한 칸 어둡게(6.12 → 4.53), 닫기 글리프 한 칸 어둡게, 슬라이더가 LOUIS 파랑, 그림자 가볍게, 제안 지연 간격, 스프링 곡선 접음.
- Figma 세트 다섯(`ChatPanel` · `ChatBubble` · `ChatDock` · `ChatSuggestion` · `ChatGate`)이 설 자리를 문서 Availability 가 적는다. 변수 `motion/chat-panel-morph`.

## Rollback

`chat-panel.css` · 문서 · manifest 세 자리 · 모션 토큰 · lifecycle `morph` · Figma 세트와 변수 · 기록 · parity 계약을 지운다. 토큰 기준선은
`packages/tokens/baseline/manifest.json` 에서 돌아간다. 제품은 아직 이 클래스를 물지 않으므로 화면 변화가 없다.
