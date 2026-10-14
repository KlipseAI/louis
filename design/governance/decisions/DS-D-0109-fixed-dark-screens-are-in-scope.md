---
id: decision-fixed-dark-screens-are-in-scope
status: experimental
authority: normative
---

# DS-D-0109 테마 계약 밖 「고정 다크」 화면도 디자인 시스템이 소유한다 — 다크는 하위 트리에 고정되고, 부스 화면은 화면 보드로 닫는다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `button`, `icon-button`, `tabs`, `badge`, `spinner`, `decision-product-parts-become-louis`, `decision-screen-surface-closes-on-filled-board`

## Context

원장의 `components/creative-media/CreativeMediaClient.tsx#CreativeMediaClient` 가 `unclear` 로 남아 있었다(통합 판 `54b62a8aa`). 행사 부스의 무회원 이미지 생성
체험 화면이다 — QR 로 들어오는 모바일 3단계(고르기 → 확인 → 결과), `getActiveEvent()` 가 없으면 닫힘 화면(`app/creative-media/page.tsx:8` · `:21-22`). 원장이
남긴 소유자 질문은 하나였다: **`html[data-theme]` 를 따르지 않는 고정 다크 스코프를 분모에 남길 것인가.** 근거는 파일 머리 주석이다 — 「룩은 테마와 무관하게
고정 다크다. 공용 Button 의 secondary/ghost 는 html[data-theme] 를 따라가서 여기선 못 쓰고, 고정 토큰 버튼을 별도로 둔다」(`CreativeMediaClient.tsx:26-28`).
같은 파일의 조각 여덟(Shell · BoothHeader · BoothMenu · 닫힘 · 글리프 셋)은 이미 부모에 딸린 `scoped` 다.

**그 전제가 LOUIS 에서는 거짓이다.** LOUIS 의 다크 토큰 블록은 `:root` 가 아니라 속성 선택자 `[data-theme="dark"]` 에 걸려 있다
(`packages/css/generated/tokens.css` 의 `[data-theme="dark"] {` 블록) — 그래서 문서가 라이트여도 **화면 상자 하나에 `data-theme="dark"` 를 걸면** 그 아래
`.louis-button` secondary · ghost, `.louis-badge`, 바닥 면이 문서 전체 다크와 같은 값을 계산한다. 이 회차의 실브라우저 시험
`packages/react/test/fixed-dark-scope.browser.test.tsx` 가 그것을 맞댄다(대조군 포함). Figma 도 같다 — 프레임에 `Klipse Semantic Color` 의 Dark 모드를 명시해
고정한다(§4 「라이트/다크는 모드로만」 안의 일이다).

## Decision

1. **고정 다크 화면은 범위 안이다.** 「테마를 안 타서 못 세운다」는 범위 밖의 사유가 아니다 — 화면 상자에 `data-theme="dark"`(코드) · 명시 Dark 모드(Figma)를 걸고
   LOUIS 부품을 그대로 쓴다. 같은 성격의 화면(행사 · 설치물 · 영상 위 고정 면)이 앞으로 나와도 이 결정으로 풀린다.
2. **부스 화면은 화면이다(`kind: screen`).** 1140 줄 · 라우트 하나 · 소비처 하나 — 부품이 아니라 보드로 그린다. 원장 판정은 `unclear` → **`needed` · `screen`**
   을 권한다(조정자가 적는다). 닫는 길은 [DS-D-0098](DS-D-0098-screen-surface-closes-on-filled-board.md)의 화면 보드(`screen:/creative-media`, Dark 고정 · 늘림 통과)다.
   보드는 활성 행사가 있는 fixture 에서 제품 렌더를 떠야 해서 이 회차에서 세우지 않았다.
3. **화면 안의 고정 토큰 조각은 부품으로 수렴한다** — 보드를 세울 때의 대응표(제품 값은 단위 2px):

   | 제품 조각 | 값 | LOUIS 대응(다크 고정 아래) |
   | --- | --- | --- |
   | `BTN_SECONDARY`(`:41-48`) | 높이 40 · 반경 12 · 16% 테두리 · 4% 면 | Button `secondary` `lg`(40 · 반경 12) |
   | `TAB_*`(`:51-59`) | 글자 탭 · 활성만 밝게 · 간격 24 | Tabs `default` 의 TabItem |
   | `IMAGE_SAVE_BUTTON`(`:64-70`) | 32 · 반경 12 · 매체 위 흐림 면 | IconButton `lg`(32 · 반경 12) — 매체 위 면은 Video Player 칩과 같은 자리 |
   | `VIEW_RESULT_CTA`(`:78-84`) | 높이 32 · 흰 면 · 어두운 글자 · 헤어라인 | Button `inverse` `md` |
   | 생성 버튼 · 로딩(`:938` · `:956`) | 이미 `Button` · `LoadingSpinner` | 그대로 |
   | `NOTICE_BOX`(`:88-89`) | 8% 면 · 반경 12 · 가운데 글 | 보드 조립(새 부품 아님 — 면 위 글 한 줄) |

4. 새 토큰 · 새 부품 · 의존성 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 고정 다크 화면을 디자인 시스템이 소유하는가 | 소유한다 — 하위 트리 다크 고정이 이미 된다(시험) | 범위 밖(`scoped`) — 「테마를 안 타서」가 범위 밖으로 둔갑한다(원장 경고) |
| 2 | 부스 화면의 원장 판정 | `needed` · `screen`(보드로 닫는다) | 행사 설치물이라 `scoped` |
| 3 | 화면 안 고정 버튼 | LOUIS Button · IconButton · Tabs 로 수렴 | 고정 다크 전용 버튼 변형 신설 |
| 4 | 운영 콘솔 · 진입점 | 지금 판정(`scoped`) 그대로 — 내부 전용 · 2일짜리 운영 도구(`app/creative-media-admin/page.tsx:6-8`) | 함께 범위 안으로 |

## Consequences

- 원장의 `CreativeMediaClient` 는 `unclear` 를 벗는다. 이 회차에서 Figma 대응(`figma:`)으로 닫히지는 않는다 — 화면 보드가 서야 닫힌다.
- 제품 쪽 일: 부스 화면 루트에 `data-theme="dark"` 를 걸고 고정 토큰 버튼을 LOUIS Button · IconButton · Tabs 로 바꾼다(제품 저장소 몫).

## Rollback

원장 판정을 `unclear` 로 되돌리고 `fixed-dark-scope.browser.test.tsx` 를 지운다. 레시피 · 토큰은 바뀌지 않았다.
