---
id: decision-plan-tier-card
status: experimental
authority: normative
---

# DS-D-0091 요금제 한 단을 세로 카드 한 장에 담는 새 부품 `plan-tier-card` — Choice Card · Stat Tile · Record Card 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `plan-tier-card`, `button`, `tooltip`, `choice-card`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `plan-tier-card` 가 있다. 같은 티어 카드가 공개 가격
(`components/landing/sections/PricingSection.tsx:100-228`)과 로그인 뒤 플랜 선택(`app/mypage/upgrade/UpgradePlanPageClient.tsx:211-327`, 통합 판
`54b62a8aa`)에 상수 벌(`TIER_CARD` · `TIER_HEAD` · `TIER_ORIGINAL_PRICE` · `TIER_PRICE_ROW` · `TIER_CREDITS_ROW` · `TIER_INCLUDES` · `TIER_FEATURE_LIST` ·
`TIER_NOTE`)로 두 번 있고 이미 갈렸다 — 메모 잉크, 상세 툴팁(업그레이드만), 현재 표시 · 예약 안내(업그레이드만). 제품 스스로 두 화면이
「다른 제품처럼 읽힌다」를 걱정한다(`app/mypage/upgrade/UpgradePlanPageClient.tsx:869-872`).

LOUIS 에 요금제 카드가 없다. [Choice Card](../../components/choice-card.md) 는 고르기 컨트롤(역할 radio · checkbox)이고,
[Stat Tile](../../components/stat-tile.md) 은 지표 네 줄, [Record Card](../../components/record-card.md) 는 접히는 어드민 기록이다 — 가격 줄 · 기능 목록 ·
바닥에 붙는 CTA 를 가진 것이 없다.

대비 미달이 둘 있다. 할인 전 원가 `red-500` 이 라이트 카드 위 3.28(body-lg medium 20 은 큰 글자가 아니다), 현재 플랜 테두리 `blue-200` 40% 가
라이트 1.19 · 다크 2.86(그래픽 3:1 미달)이다.

## Decision

1. **새 부품 `plan-tier-card` 한 벌**(`.louis-plan-tier-card` · `__head` · `__name` · `__description` · `__price-original` · `__price` · `__amount` · `__period` ·
   `__credits` · `__credits-amount` · `__includes` · `__features` · `__feature` · `__feature-icon` · `__feature-term` · `__note` · `__notice` · `__notice-label` ·
   `__notice-action` · `__cta`). 축은 루트 `data-current` 하나다.
2. **같은 파일의 짝 블록 `.louis-plan-tier-deck`** — 5열 · 1199 이하 2열 · 사이 4 · 늘임. 열 수는 지역 변수 `--louis-plan-tier-deck-columns` 이고 1열 경계
   (제품 ≤559)는 소비처가 이 변수로 덮는다.
3. **예약 안내 상자는 하위 부품 `__notice`** 다 — [Alert](../../components/alert.md) 에는 중립 톤이 없고(info · success · warning · danger), 이 상자는 카드
   안에서만 쓰인다.
4. **CTA 와 안내 버튼은 [Button](../../components/button.md) 그대로**(CTA `inverse` · `md`, 안내 `ghost` · `md`) — 레시피는 폭 · 줄바꿈 · 위 여백만 준다.
   **기능 상세는 [Tooltip](../../components/tooltip.md) 그대로** — 레시피는 트리거 글자(`<button>`)의 모양 하나만 갖는다.
5. **바닥 묶음** — 메모 · 안내 · CTA 중 기능 목록 바로 다음 하나만 남은 높이를 먹고(`margin-block-start: auto`) 나머지는 8 씩 띈다.
6. **고쳐 올리는 값 셋**(DS-D-0084 3항) — 원가는 새 시맨틱 `color-plan-tier-card-price-original`(라이트 `red-700` · 다크 `red-500`), 현재 플랜은
   `accent-primary` 2px 안쪽 링, 갈린 메모 잉크 두 벌은 `fg-tertiary` 하나. 잉크는 fg 계단 셋으로 접는다.
7. **`data-glow` 축은 없다.** B1 제안에 있던 랜딩 Lite 의 안쪽 파란 광은 소유자 요청으로 10-07 에 걷혔다(`components/landing/sections/PricingSection.tsx:133`).
8. **React 표면은 만들지 않는다.** 마크업 계약을 문서가 소유한다. 새 의존성 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/plan-tier-card.md`, 작업 폴더)이 남긴 판정 여덟을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 원가 색(제품 라이트 3.28) | 새 시맨틱 `plan-tier-card-price-original` — 라이트 `red-700`(6.34) · 다크 `red-500`(5.26). 원가는 위험이 아니라 「깎인 값」이라 위험 이름을 빌리지 않는다(`canvas-guide` 선례) | `fg-danger-on-surface`(값 같음, 토큰 0) · `fg-tertiary` 취소선(빨강을 잃는다) · 제품 `red-500` + Known deviation |
| 2 | 현재 플랜 표시(제품 1.19 · 2.86) | `accent-primary` 2px 안쪽 링(3.52 · 4.90) — `choice-card` 카드형 「고름」과 같은 말 | 제품 `blue-200` 40% + Known deviation |
| 3 | 잉크 접기 | 제목 · 가격 `fg-primary`, 크레딧 · 포함 · 기능 `fg-secondary`, 설명 · 기간 · 메모 · 안내 `fg-tertiary` | `gray-200` 을 지키는 새 시맨틱 + 알파 잉크 그대로 |
| 4 | 체크 아이콘(라이트 2.22) | `green-500` 그대로(장식, `aria-hidden`) + 새 시맨틱 `plan-tier-card-feature-icon` | 라이트 `green-700`(4.10) · `fg-secondary`(토큰 0, 초록을 잃는다) |
| 5 | 기능 상세 전달 | 글자를 `<button>` 트리거로 + LOUIS `Tooltip` + 점선 밑줄 | 트리거만(밑줄 없음) · 제품처럼 호버만 |
| 6 | 덱의 소유 | 같은 파일의 짝 블록 — 5열 · 1199 이하 2열, 1열은 소비처가 변수로 | 레시피가 559 경계까지(새 breakpoint) · 덱은 소비처 |
| 7 | 최소 높이 경계 788 | 719 로 접는다(새 경계 없음) | 788 을 레시피에(새 경계) |
| 8 | 바닥 묶음 간격 | 기능 목록 다음 하나만 auto, 나머지 8 | 제품처럼 메모 · CTA 둘 다 auto |

### 경계와 하지 않는 것

- 부품이 소유한다 — 면 · 반경 · 헤어라인 · 안쪽 여백 · 최소 높이 · 세로 흐름, 각 줄의 글자 · 잉크 · 간격, 원가 취소선과 원가 없는 카드의 빈 줄 자리,
  기능 줄 격자(아이콘 18 + 8 + 글)와 아이콘 첫 줄 가운데 맞춤, 상세 트리거의 모양, 바닥 묶음 규칙, 현재 플랜 링, 덱의 5열 · 2열.
- 화면이 소유한다 — 어떤 티어가 현재 · 예약인지(결제 상태 판정), 원가 빈 줄을 둘지(`hasDiscountedTier`), 아이콘 글리프 · 상세 문장, 상세 열기 · 위치
  (Tooltip), CTA 라벨 · 잠금, 1열 덱의 경계(≤559).
- 하지 않는 것 — `data-glow`(걷힌 광), 새 breakpoint(788 · 559), 카드 호버 움직임(제품에 없다, 잔재만 있다), subgrid 줄 맞추기(카드 구조가 고정이
  아니라 빈 줄 방식을 둔다), 크레딧 팩 상자(`components/landing/sections/PricingSection.tsx:276-286`, 기능 목록이 없는 다른 상자), 비교표
  (`plan-comparison`, 따로 승격), React 표면.

## Consequences

- 새 토큰 둘(원시 0) — `color-plan-tier-card-price-original` · `color-plan-tier-card-feature-icon`, `contrastPairs` 한 줄(원가 · `bg-raised` 위 4.5).
- 제품 (나): 두 벌 상수를 `louis-plan-tier-card*` · `louis-plan-tier-deck` 으로, `TIER_FEATURE_ICON` 수출을 지운다. ≤559 덱은
  `--louis-plan-tier-deck-columns: 1` 한 줄. `TIER_CARD_CURRENT` → `data-current="true"`. 손으로 짠 호버 상세를 Tooltip + `__feature-term` 버튼으로,
  예약 안내 두 벌을 `__notice` 하나로, 소비처 `mt-auto` 둘을 지운다. 보이는 변화 — 현재 링이 옅은 파랑에서 주색, 라이트 원가가 진한 빨강,
  제목 · 가격이 `fg-primary`(라이트 조금 진하게 · 다크 흰색 쪽), 공개 가격의 메모 잉크가 `fg-tertiary`, 바닥 묶음이 기능 목록 아래로 한꺼번에 내려간다.
- Figma 에 `PlanTierCard`(Selected × Layout) · `PlanTierCardFeature`(Interactive) 세트와 `PlanTierCardNotice` 가 서고, 변수 `plan-tier-card/price-original` ·
  `plan-tier-card/feature-icon` 이 선다.

## Rollback

`plan-tier-card.css` · 문서 · manifest 세 자리 · 토큰 둘 · `contrastPairs` 한 줄 · Figma 세트 · 변수 · 기록 · parity 계약을 지운다. 제품은 아직 이 클래스를
물지 않으므로 영향이 없다.
