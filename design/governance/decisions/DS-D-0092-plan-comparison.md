---
id: decision-plan-comparison
status: experimental
authority: normative
---

# DS-D-0092 요금제마다 한 열을 세우는 비교표를 새 부품 `plan-comparison` 으로 — Table 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `plan-comparison`, `table`, `plan-tier-card`, `icon`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」 첫 줄이 `plan-comparison` 이다. 요금제 비교표는
`components/landing/sections/PricingSection.tsx:322-504` 의 `PlanComparisonTable` 하나가 공개 가격(`/pricing`, `components/landing/sections/PricingSection.tsx:703`)과
로그인 뒤 플랜 선택(`/mypage/upgrade`, `app/mypage/upgrade/UpgradePlanPageClient.tsx:907`, 통합 판 `54b62a8aa`) 두 자리에 선다. 정의는 하나고 상수
열넷(`COMPARISON_TITLE` ~ `COMPARISON_COL_VALUE_TEXT`)이 Tailwind 임의 값으로 모양을 쥐고 있다. LOUIS 에는 대응이 없고, Figma 에는 측정 재현인
제품 세트 `Product/Plan Comparison Table`(DS-D-0071)만 있다.

이 표는 **열이 플랜인 완전 피벗**이다 — 각 열이 머리(플랜 이름) 아래 묶음별 체크리스트를 자기완결로 담는다(제품 주석
`components/landing/sections/PricingSection.tsx:426`). [Table](../../components/table.md) 은 `<table>` 행 × 열 격자(헤더 행 면 · 행 구분선 · 숫자 우측)라
이 조형을 담지 못한다. 담게 하려면 피벗을 뒤집어야 하는데, 그것은 부품을 올리는 일이 아니라 화면을 바꾸는 일이다(DS-D-0084 3항은
「조형을 올린다」이지 「다시 디자인한다」가 아니다). Record Card · Choice Card · Inspector Row 도 열 격자 + 머리 + 묶음 + 값 표시를 함께 갖지 않는다.

대비 부채는 없다. 옛 메모의 다크 대비 미달(`--gray-900` · `--gray-700` 잉크)은 앵커 이전 코드이고, 지금 제품은 잉크를 역할대로 쓴다
(`app/mypage/upgrade/UpgradePlanPageClient.tsx:329-336` 주석). 글자는 네 바닥(랜딩 · 메인 카드 × 라이트 · 다크)에서 전부 4.5 이상, 체크는 3:1 이상이다.

## Decision

1. **새 부품 `plan-comparison` 한 벌**(`.louis-plan-comparison` · `__title` · `__scroll` · `__grid` · `__column` · `__head` · `__body` · `__group` ·
   `__group-name` · `__list` · `__item` · `__feature` · `__value` · `__mark`). 값 표시는 `__value[data-value]` 셋 — `included`(체크) · `excluded`(대시 「–」) ·
   `text`(짧은 값).
2. **열 수는 데이터다** — 지역 변수 `--louis-plan-comparison-columns`(정수 ≥ 1, 기본 4). 소비처가 플랜 수를 준다.
3. **좁은 판은 767 이하 한 단계** — 최소 폭 760 → 640, 칸 안쪽 20 → 14, 머리 18 · 20 · 16 → 14 · 14 · 12. 제품 경계 768 을 LOUIS 에 있는 767 로 접는다.
4. **체크 글리프는 아이콘 세트의 새 글리프 `check`** 다(제품 경로 `M5 12.5L10 17.5L19 7` 을 세트 관례 획 1.5 로, 출처 `original`). 레시피는 그 자리 ·
   크기(16) · 색(`stroke-strong`)만 갖는다 — CSS 패키지는 아이콘 자산을 쓰지 않는다(DS-D-0008).
5. **그룹 의미를 더한다** — 열은 `role="group"` + `aria-labelledby`(머리), 목록은 `aria-labelledby`(묶음 이름). 체크 · 대시는 `role="img"` + 접근 이름.
6. **React 표면은 만들지 않는다.** 행동이 없는 정적 조형이고 데이터 → 마크업 매핑은 소비처 몫이다. 마크업 계약을 문서가 소유한다. 새 의존성 · 새 토큰 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/plan-comparison.md`, 작업 폴더)이 남긴 판정 열을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 새 부품인가 | 새 부품 `plan-comparison` — 피벗을 뒤집는 것은 화면 변경이다 | `table` 의 변형(기능 행 × 플랜 열, 묶음은 `th scope="rowgroup"`) |
| 2 | 체크 글리프 | 아이콘 세트에 `check` 를 더하고(획 1.5 — 16px 에서 1.33 → 1.0px) 소비처가 `__mark` 에 넣는다 | 레시피 `::before` 회전 테두리(`checkbox.css` 꼴, 모양이 다르다) · 세트 관례를 깨고 획 2 |
| 3 | 격자 반경 | 리터럴 16(제품 값) | `radius-card` 12 로 티어 카드와 맞춤(보이는 변화) · `radius-overlay` 16(값은 같고 이름이 틀리다) |
| 4 | 좁은 판 경계 | 레시피 `@media (max-width: 767px)` — 있는 경계 | 제품 그대로 768(새 경계) · 소비처 `data-layout="compact"` · 컨테이너 질의 |
| 5 | 머리 · 텍스트 값 잉크 | `fg-primary`(다크 #dcdee1 → #fafafa, 한 칸 밝아진다) | `color-gray-100` 적응 회색(제품과 같은 값) |
| 6 | Figma 값 축 이름 | `Layout`(`included` · `excluded` · `text`) — figma-component-authoring §2 `Layout` 줄의 「CSS 속성값 철자」 예외에 한 줄 | 새 축 `Value` · BOOLEAN 셋 |
| 7 | 그룹 의미 | 열 `role="group"` + `aria-labelledby`, 목록 `aria-labelledby` 를 계약에 | 제품 그대로(맨 `div` · `ul`) |
| 8 | `content-visibility` | 소비처 몫 | 레시피 루트에 `content-visibility: auto` + 추정 높이 변수 |
| 9 | 옛 메모 「업그레이드 비교표 대비 미달은 제품 결함」 | 앵커 `54b62a8a` 에서 풀렸다고 고친다 | 그대로 |
| 10 | 있는 Figma 제품 세트 | DS 세트가 섰으므로 `Product/Plan Comparison Table` 은 `PlanComparison` 인스턴스로 다시 짓는다 — 같은 조형이 두 벌로 갈리지 않게 | 제품 세트 은퇴 · 둘 다 둔다 |

판정 10 의 제품 세트 재조립은 이 변경 단위에 넣지 않는다 — 제품 세트는 측정 재현(DS-D-0071)이라 제품이 이 클래스를 물기 전에는 측정이
바뀌지 않는다. 원장(`migration/product.surfaces.json` `…#PlanComparisonTable`)의 판정도 그때 함께 옮긴다.

### 경계와 하지 않는 것

- 부품이 소유한다 — 제목 · 가로 스크롤 · 격자 틀(바깥 선 · 반경 · 자름) · 열(사이 선) · 머리(아래 선) · 본문 · 묶음 · 묶음 이름 · 항목 · 값 표시 셋의
  글자 · 잉크 · 간격, 표시 칸 16, 최소 폭, 좁은 판.
- 화면이 소유한다 — 플랜 · 묶음 · 기능 데이터와 열 수, 바깥 여백 · 페이지 폭(`max-w-[1300px]`), `content-visibility` 와 추정 높이, 체크 글리프 인스턴스,
  접근 이름의 문구(「포함」 · 「미포함」).
- 하지 않는 것 — `<table>` 의미(행 · 열 머리 관계가 없는 피벗이라 거짓말이 된다), 열 강조(추천 · 현재 플랜 — 제품 비교표에 없다, `plan-tier-card` 의 일),
  정렬 · 펼침 · 고정 머리, 플랜 카드와의 반경 통일, React 표면.

## Consequences

- 새 토큰 0. 새 아이콘 하나 — `check`(`original`, Figma `icon/check`).
- 제품 (나): 상수 열넷을 `louis-plan-comparison*` 클래스로, `--comparison-cols` → `--louis-plan-comparison-columns`. `COMPARISON_WRAP` 은 소비처 몫으로
  남는다. 열 · 목록에 `role="group"` · `aria-labelledby`(id 둘), 인라인 체크 SVG → 아이콘 `check`. 보이는 변화 — 다크에서 머리 · 텍스트 값 잉크가
  한 칸 밝아지고(#dcdee1 → #fafafa), 768px 정각 폭 하나에서 좁은 판이 갈리며, 체크 획이 16px 에서 1.33 → 1.0px 로 얇아진다.
- Figma 에 `PlanComparisonItem`(Layout × Size) · `PlanComparisonColumn`(Size) · `PlanComparison`(Size) 세트와 아이콘 `icon/check` 가 선다.

## Rollback

`plan-comparison.css` · 문서 · manifest 세 자리 · Figma 세트 셋 · 기록 · parity 계약을 지운다. 제품은 아직 이 클래스를 물지 않으므로 영향이 없다.
토큰을 더하지 않았으므로 토큰 기준선은 그대로다. 아이콘 `check` 는 다른 소비처가 붙기 전이면 함께 지운다(아이콘 이름은 공개 계약이라 붙은 뒤에는 breaking).
