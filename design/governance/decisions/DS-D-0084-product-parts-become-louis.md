---
id: decision-product-parts-become-louis
status: experimental
authority: normative
---

# DS-D-0084 제품에 보이는 부품은 LOUIS 부품으로 올린다 — 첫 건 노드 생성 버튼

- Status: accepted (소유자 지시, 2026-10-12 저녁)
- Date: 2026-10-13
- Owners: repository owner, design system maintainer
- Affects: `node-shell`, `decision-deck-feedback-triage`, `governance-figma-screen-assembly`

## Context

2026-10-12 저녁 소유자가 Figma 의 노드 생성 버튼이 제품과 다르다고 짚었다. 고치고 보니 그 버튼은 **Figma 보드(제품 측정 재현)에만
있고 LOUIS 에는 없었다** — `node-shell` 은 버튼이 서는 자리(`__generate`)만 갖고, 문서는 「생성 버튼은 제품 콘텐츠다」라고 적고 있었다.
덱 키트처럼 LOUIS 부품만으로 화면을 짓는 쪽은 이 버튼을 쓸 수 없다.

그 보고에 소유자가 「제품의 모든걸 LOUIS 부품으로 올려야 맞지」, 「제품에 보이는 부품들을 LOUIS 부품으로 하는 게 맞지? LOUIS 에 더한다는
의미」라고 했다.

지금까지의 기본값은 그 반대였다.

- 2026-09-26 결정(Figma 먼저 · 생성기로 묶어서): 제품 전용 부품은 Figma 제품 컴포넌트(`Product/…`)로 세우고, LOUIS 코드는 제품이 그
  정본을 실제로 쓰게 될 때 따라간다.
- [DS-D-0083](DS-D-0083-deck-feedback-triage.md) 은 22건 가운데 일곱을 (다) 「화면 고유로 둔다」로 판정했다.
- 저장소 규칙(CLAUDE.md) 「제품 전용 화면 코드와 과거 UI 부채를 공용 규범으로 복사하지 않는다」.

## Decision

1. **제품에 보이는 부품은 LOUIS 부품으로 올리는 것이 기본이다.** 「LOUIS 에 더한다」는 레시피(`louis-…` 클래스) · 필요한 시맨틱 토큰 ·
   문서 · Figma 디자인 시스템 부품을 갖춘다는 뜻이다. Figma 보드의 측정 재현은 등록이 아니다.
2. **예외는 부품이 될 수 없는 것뿐이다** — 데이터에서 좌표를 내는 차트 경로처럼 화면이 계산하는 것. 예외는 사유를 문서에 적는다.
3. **화면 코드를 복사하는 것이 아니다.** 같은 조형을 여러 화면이 쓰면 한 부품으로 추상화하고, 대비 미달 같은 부채는 고쳐서 올린다.
   CLAUDE.md 의 규칙은 이 뜻으로 고쳐 쓴다.
4. **DS-D-0083 의 (다) 일곱은 다시 판정한다** — 2b 하이라이트 트랙 · 무대 아래 막대, 2c AI 프롬프트 후보 카드, 2d-2 소스 썸네일 줄,
   2d-3 「편집」 버튼, 2d-4 채널 줄 · 예약 버튼, 2f 차트 점 바닥(곡선 경로는 예외로 남는다), 3c 업로드 무대. 각각 (가)로 옮겨 순서대로 올린다.
5. **진행은 묶어서 한다.** 표면 원장(`migration/product.surfaces.json`)의 「필요」 목록에서 뽑아 생성기로 묶는다 — 한 건씩 손으로 하지 않는다.

### 첫 건 — 노드 생성 버튼(`.louis-node-shell__generate-button`)

제품 정본 `NodePromptGenerateButton`(노드 다섯 · Creative Media). Button 의 변형이 아니라 node-shell 하위 부품이다 — 소유자가 고른 안이고,
primary 의 빛(위아래 1px, DS-D-0066)과 모양이 다르며 라벨 대신 별과 후행 슬롯을 갖기 때문이다.

| 부분 | 값 | 근거 |
| --- | --- | --- |
| 면 | 가로 그라디언트 `node-generate-surface-edge`(blue-450) → `-center`(blue-500) → edge | 제품 `--node-prompt-generate-gradient` |
| 안쪽 빛 | `::before` 에 `inset 0 0 8px 0` `node-generate-foreground` + `mix-blend-mode: overlay` | 제품 `OVERLAY_STROKE` |
| 상자 | 높이 · 최소 폭 32, 좌우 8, 반경 `radius-control` | 제품 `h-16 min-w-16 px-4` · `--button-radius` |
| 별 | 14 × 14, `node-generate-foreground` | Phosphor Sparkle fill `size={14}` |
| 후행 슬롯 | body-sm-regular, `node-generate-trailing`(blue-100), 숫자 고정폭 | 제품 `TRAILING` |
| 상태 | hover `brightness(1.06)`(호버 기기만), 누름 `scale 0.95`, 비활성 `opacity 0.35` | 제품 `CHROME` · `PROMPT_SUBMIT_FAB_DIMMED` |

**그라디언트는 토큰 형식을 새로 만들지 않는다.** 끝 색과 가운데 색을 시맨틱 둘로 세우고 레시피가 `linear-gradient` 로 조합한다 — 제품이
「gradient 토큰 타입이 없어서」 승격을 미뤘던 자리가 이것으로 풀린다.

## Consequences

- 새 시맨틱 넷(`node-generate-surface-edge` · `-surface-center` · `-foreground` · `-trailing`, 두 mode 같은 값). Figma 변수는 다음 동기화.
- Figma DS 부품(`NodeGenerateButton`)과 브라우저 시험은 다음 작업이다 — 그 전까지 `figma` 상태는 node-shell 의 기존 값 그대로.
- 제품 (나): `NodePromptGenerateButton` 이 이 클래스를 물면 `CHROME` · `OVERLAY_STROKE` · `TRAILING` 상수와 소비처의 `opacity-[0.35]` 덮어쓰기를 지운다.
  같은 빛을 `::before/::after` 로 복사한 BgmNode · EditNode · ImageNode · InstagramNode 의 다른 버튼은 각자 부품으로 올릴 때 이 빛을 공유한다.

## Rollback

생성 버튼 규칙과 시맨틱 넷을 지우면 이전과 같다(쓰는 소비처가 아직 없다). 방침(1~5)은 소유자 지시라 되돌리지 않는다.
