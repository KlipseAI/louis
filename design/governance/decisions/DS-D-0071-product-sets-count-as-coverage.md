---
id: decision-product-sets-count-as-coverage
status: experimental
authority: normative
---

# DS-D-0071 제품 컴포넌트 세트도 표면 대응으로 센다 — LOUIS 대응과 나눠 찍는 조건으로

- Status: accepted (소유자 결정, 2026-09-26 대화)
- Date: 2026-09-26
- Owners: repository owner, design system maintainer
- Affects: `decision-product-surface-denominator`, `decision-pattern-boards-count-as-coverage`, `governance-figma-sync`

## Context

소유자가 물었다 — 「피그마에 디자인은 대체 언제 완성시킬건데」. 표면 원장([DS-D-0037](DS-D-0037-product-surface-denominator.md))의
`needed` 는 202 였고(부품 104 · 화면 64 · 한 자리 33 · 판단 대기 1), 절반(102)이 캔버스 편집기 한 곳이다. 그때까지는 한 표면마다
LOUIS 컴포넌트를 코드 · 테스트 · Figma · parity 로 한 벌씩 세웠다(2026-09-26 의 Avatar `lg` · DropZone). 하루 세 건 속도라
202 는 몇 달이다.

소유자 결정: **「Figma 먼저, 생성기로 묶어서」.** 제품 전용 부품은 LOUIS 컴포넌트가 아니라 **Figma 제품 컴포넌트**(`Product/…`)로
세우고, LOUIS 코드 구현은 제품이 그 정본을 실제로 쓰게 될 때 따라간다.

그런데 원장의 `figma` 칸은 되읽기의 `components`(LOUIS) 와 `templates`(패턴 보드, DS-D-0039) 이름만 받는다. 제품 세트는 이미
스물다섯 벌이 라이브에 있는데(`Product/Public Footer` · `Product/Pricing Plan Card` · `Product/Pricing Notice` …) 셀 어휘가 없어,
그 표면들이 「그려야 한다」에 영구히 앉아 있다. DS-D-0039 가 패턴 보드에 대해 적은 것과 같은 오염이다.

## Decision

1. **제품 세트를 셋째 어휘로 인정한다.** 원장의 `figma` 칸에 `Product/…` 세트 이름을 적을 수 있다. 어휘의 정본은 제품 세트
   생성기의 계획(`figma/product-*.plan.json`)이 선언한 세트 이름이다 — 그 계획은 제품 측정에서 생성되고, 세트 러너로 라이브에
   적용되며, `check-figma-product-*` 게이트가 계획과 러너를 잠근다.
2. **세 대응을 한 수로 합치지 않는다.** `check-figma-surface-coverage` 는 합계와 함께 LOUIS 컴포넌트 · 패턴 · 제품 세트 대응을 **따로**
   찍고, 셋 모두에 같은 래칫(정확히 일치)을 건다. 합계만 잠그면 LOUIS 대응을 제품 세트 대응으로 바꿔치기해도 수가 유지된다.
3. **제품 세트 대응은 「LOUIS 에 있다」가 아니다.** 목표 A(제품이 LOUIS 를 소비한다)의 진척으로 세지 않는다. 그 표면이 LOUIS
   컴포넌트가 되면 `figma` 칸을 LOUIS 이름으로 옮긴다 — 그때 제품 세트 대응은 하나 줄고 LOUIS 대응이 하나 는다.
4. **판정은 표면 하나 = 세트 하나일 때만 한다.** 세트가 그 표면을 통째로 그릴 때만 적는다. 표면의 일부만 그리는 세트(예: 화면 안의
   카드 한 장)는 그 화면을 대응으로 만들지 않는다.

## Consequences

- 원장의 `needed` 가 제품 세트가 이미 있는 표면만큼 바로 준다. 그 뒤로는 생성기로 세트를 묶어 세울 때마다 준다.
- LOUIS 컴포넌트 수(`manifest` 의 `figma: done`)와 표면 커버리지는 다른 축이 된다 — 표면 커버리지가 올라도 LOUIS 가 넓어진 것은 아니다.
  인쇄를 셋으로 가르는 이유다.
- 되돌리기: 제품 세트 어휘를 걷으면 그 판정들이 `needed` 로 돌아온다(원장의 판정 칸이 남아 있으므로 손실 없이 되돌릴 수 있다).
