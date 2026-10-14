---
id: plan-tier-card
status: experimental
authority: normative
summary: 요금제 하나의 가격 · 크레딧 · 기능을 카드 한 장에 담고, 덱으로 나란히 비교합니다.
---

# Plan Tier Card

요금제 하나를 세로 카드 한 장에 담는다 — 이름 · (할인 전 원가) · 가격 · 크레딧 · 포함 · 기능 목록 · (메모 · 예약 안내) · 고르기 버튼
(`.louis-plan-tier-card`, [DS-D-0091](../governance/decisions/DS-D-0091-plan-tier-card.md)). 여러 장을 덱(`.louis-plan-tier-deck`)에 나란히 놓고 눈이
좌우로 오가며 비교한다. 줄의 자리가 카드마다 같아야 비교가 된다 — 할인 카드가 하나라도 있으면 원가 없는 카드도 그 줄을 비워 둔다.
하나를 고르는 폼은 [Choice Card](choice-card.md) 다. 플랜마다 모든 기능을 한 표로 펼치는 비교표는 따로 승격한다(`plan-comparison`).

제품 정본은 두 사본이다 — 공개 가격(`components/landing/sections/PricingSection.tsx:100-228` 의 상수)과 로그인 뒤 플랜 선택
(`app/mypage/upgrade/UpgradePlanPageClient.tsx:211-327` 의 상수, `app/mypage/upgrade/UpgradePlanPageClient.tsx:737-900` 의 마크업, 통합 판 `54b62a8aa`).
두 화면이 같은 카드를 각자 상수로 들고 있었고 이미 갈렸다.

```html
<div class="louis-plan-tier-deck"><!-- 제품: ≤559 에서 --louis-plan-tier-deck-columns: 1 -->
  <article class="louis-plan-tier-card" aria-labelledby="tier-plus" data-current="true">
    <div class="louis-plan-tier-card__head">
      <h3 class="louis-plan-tier-card__name" id="tier-plus">Plus</h3>
      <p class="louis-plan-tier-card__description">…</p>            <!-- 있으면 -->
    </div>
    <span class="louis-plan-tier-card__price-original"><span class="louis-visually-hidden">정가 </span>39,900원</span> <!-- 할인 중일 때 -->
    <!-- 할인 없는 카드인데 덱에 할인 카드가 있으면:
         <span class="louis-plan-tier-card__price-original" data-placeholder="true" aria-hidden="true">&nbsp;</span>
         1열 덱에서는 두지 않는다 -->
    <div class="louis-plan-tier-card__price">
      <strong class="louis-plan-tier-card__amount">29,900원</strong>
      <span class="louis-plan-tier-card__period">매월</span>          <!-- 있으면 -->
    </div>
    <div class="louis-plan-tier-card__credits">
      <strong class="louis-plan-tier-card__credits-amount">16,500</strong>
      <span>크레딧 지급</span>
    </div>
    <p class="louis-plan-tier-card__includes">Lite의 모든 기능 포함</p>
    <ul class="louis-plan-tier-card__features">
      <li class="louis-plan-tier-card__feature">
        <span class="louis-plan-tier-card__feature-icon" aria-hidden="true"><svg class="louis-icon">…check-circle…</svg></span>
        <!-- 상세 있음: <Tooltip content="캔버스 + 하이라이트 합산 기준입니다." side="bottom" align="start"> 가 감싼다 -->
        <button type="button" class="louis-bare-button louis-plan-tier-card__feature-term">프로젝트 최대 12개</button>
        <!-- 상세 없음: <span>프로젝트 최대 12개</span> -->
      </li>
    </ul>
    <p class="louis-plan-tier-card__note">…</p>                      <!-- 있으면 -->
    <div class="louis-plan-tier-card__notice">                       <!-- 예약이 있으면 -->
      <span class="louis-plan-tier-card__notice-label">다운그레이드 예약됨</span>
      <button class="louis-button louis-plan-tier-card__notice-action" data-variant="ghost" data-size="md" type="button">예약 취소</button>
    </div>
    <button class="louis-button louis-plan-tier-card__cta" data-variant="inverse" data-size="md" type="button" disabled>현재 플랜</button>
  </article>
</div>
```

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/plan-tier-card.css` · 실브라우저 시험 `plan-tier-card.browser.test.tsx`. React 표면은 없다 — CTA 는 `Button`, 상세는 `Tooltip` 을 그대로 쓰고 소비처가 클래스와 마크업 계약을 문다(DS-D-0091) |
| Figma         | `done`      | 2026-10-14 — `PlanTierCard` 세트(Selected `false` · `true` — 코드 `data-current` × Layout `base` · `compact` = 4, TEXT `Name` · `Price` · `Credits` · `CreditUnit`, BOOLEAN `Description` · `OriginalPrice` · `Period` · `Includes` · `Note` · `Notice`(기본 끔)), 기능 한 줄 `PlanTierCardFeature`(Interactive `false` · `true` — 점선 밑줄, TEXT `Text`), 예약 안내 `PlanTierCardNotice`(TEXT `Label`, BOOLEAN `Action`). base 260 · compact 320 은 표본 폭이다. 기능 줄은 시드 데이터 인스턴스 여섯, CTA · 안내 버튼은 Button 인스턴스, 체크는 `check-circle` 0.75 배. CSS margin 은 줄 프레임의 패딩으로, 바닥 묶음은 Top/Bottom space-between 으로 그렸다. 479 이하 금액 28 · 원가 빈 줄 · 덱 · 상세 Tooltip 은 그리지 않는다. 기록 `plan-tier-card` · `-feature` · `-notice` 와 parity 기하 계약, 실브라우저 되재기(`plan-tier-card-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## When to use

- 요금제 · 구독 단계를 가격과 함께 나란히 비교할 때. 공개 가격 화면과 로그인 뒤 플랜 선택이 같은 카드를 쓴다.
- 쓰지 않는 경우 — 크레딧 팩처럼 가격 한 줄뿐인 상자(기능 목록이 없다)는 이 카드가 아니다. 하나를 골라 제출하는 폼이면 Choice Card 다.

## Anatomy

| 부분 | 값 |
| --- | --- |
| 덱 `.louis-plan-tier-deck` | 격자 5열(1199 이하 2열) · 사이 4(`space-control-xs`) · 늘임. 열 수 `--louis-plan-tier-deck-columns` |
| 틀 `.louis-plan-tier-card` | `<article>`. 세로 흐름 · `bg-raised` 면 · 헤어라인(`hairline-inset`) · 반경 12(`radius-card`) · 안쪽 16(719 이하 12) · 최소 높이 560(719 이하 없음) · 잉크 `fg-primary` |
| 머리 `__head` | 세로 · 사이 16. 이름 `__name` body-lg medium 20, 설명 `__description` body-md regular 16 · `fg-tertiary` |
| 원가 `__price-original` | 위 10 · body-lg medium 20 · 취소선 · `plan-tier-card-price-original`. 빈 줄 `[data-placeholder="true"]` 은 같은 높이로 숨는다 |
| 가격 `__price` | 아래 맞춤 · 사이 8 · 위 10(원가 뒤 0). 금액 `__amount` heading-md semibold 36(479 이하 28), 기간 `__period` body-md regular 16 · `fg-tertiary` · 아래 4 |
| 크레딧 `__credits` | 위 4 · 아래 24 · 사이 8 · body-lg medium 20 · `fg-secondary`. 수 `__credits-amount` 는 `<strong>` 이지만 줄의 굵기 |
| 포함 `__includes` | 위 12 · body-sm medium 14 · `fg-secondary` |
| 기능 목록 `__features` | 위 8 · 아래 18 · 줄 사이 4. 줄 `__feature` — 격자 `18px 1fr` · 사이 8 · body-sm regular 14 · `fg-secondary` |
| 체크 `__feature-icon` | 18 × 18 · 첫 줄 가운데(위 `(1lh − 18) ÷ 2`) · `plan-tier-card-feature-icon` · `aria-hidden`. 글리프는 소비처의 `check-circle` |
| 상세 트리거 `__feature-term` | `<button class="louis-bare-button …">` · 줄과 같은 글자 · 점선 밑줄(`stroke-underline`, 간격 `space-underline-gap`) · 도움 커서 |
| 메모 `__note` | 위 24 · caption regular 12 · `fg-tertiary` |
| 예약 안내 `__notice` | 위아래 8 · 좌우 12 · 사이 8 · 반경 8(`radius-control-sm`) · 선 1 잉크 12% · 면 잉크 4%. 글 `__notice-label` caption medium 12 · `fg-tertiary`, 버튼 `__notice-action`(Button ghost md) 한 줄 |
| CTA `__cta` | Button inverse md · 폭 100% |

**바닥 묶음.** 메모 · 안내 · CTA 중 기능 목록 바로 다음 하나만 위 여백 auto 로 남은 높이를 먹고, 나머지는 8 씩 띈다(DS-D-0091 판정 8).

## Properties

React 를 만들지 않는다 — 이 마크업 계약이 공개 계약이다.

| 속성 · 요소 | 값 | 기본 | 누가 단다 |
| --- | --- | --- | --- |
| 루트 `data-current` | `true` | 없음 | 소비처 — 지금 쓰는 플랜. 2px 주색 링. CTA 라벨도 「현재 플랜」으로 함께 말한다 |
| `__price-original` | 있음 · `data-placeholder="true"`(+ `aria-hidden`) · 없음 | 없음 | 소비처 — 할인 중 · 덱의 줄 맞춤용 빈 줄 · 덱에 할인 없음 |
| `__feature-term` | `<button>` + Tooltip · `<span>` | `<span>` | 소비처 — 상세가 있는 기능 · 없는 기능 |
| `__description` · `__period` · `__includes` · `__note` · `__notice` 요소 | 생략 가능 | — | 소비처 |
| 덱 `--louis-plan-tier-deck-columns` | 정수 ≥ 1 | 5(1199 이하 2) | 소비처(1열로 접을 때만) |

## States

| 상태 | 모양 |
| --- | --- |
| 기본 | 헤어라인 |
| 현재(`data-current="true"`) | 2px `accent-primary` 안쪽 링, CTA 잠김(소비처) |
| 예약 있음 | `__notice` 가 바닥 묶음에 선다, CTA 잠김(소비처) |
| 트리거 포커스 · 호버 | Tooltip 이 열린다. 포커스 링은 그리지 않는다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)) |
| 1199 이하 | 덱 2열 |
| 719 이하 | 안쪽 12 · 최소 높이 없음(제품 788 경계를 719 로 접었다, DS-D-0091 판정 7) |
| 479 이하 | 금액 28(크기만) |
| 강제 색 | 헤어라인 대신 1px `CanvasText`, 현재는 2px `Highlight` |

카드에는 호버가 없다 — 누르는 것은 CTA 다. 그래서 `@media (hover: hover)` 블록도 없다.

## Content

- 가격 · 원가 · 크레딧은 같은 통화 표기를 쓴다. 「무료」도 가격 칸에 둔다.
- 기능 한 줄은 한 사실. 상세는 한두 문장 — 길면 비교표로.
- 예약 안내는 「무엇이 언제 바뀌는지」를 말하고, 버튼은 되돌리는 동사다.

## Accessibility

- 카드는 `<article>` + `aria-labelledby`(이름). 덱 안 카드의 제목 단계는 화면의 섹션 제목 아래 하나다.
- 현재 플랜은 링만으로 말하지 않는다 — CTA 라벨이 「현재 플랜」이다(1.4.1).
- 상세는 키보드로 열린다 — 트리거가 `<button>` 이고 Tooltip 이 `aria-describedby` · Escape 를 소유한다. 상세는 보조 정보다.
- 원가 빈 줄은 `aria-hidden`. 체크 아이콘은 `aria-hidden`.
- 원가는 취소선만으로 말하지 않는다 — 소비처가 원가 앞에 `<span class="louis-visually-hidden">정가</span>` 같은 이름을 둔다.
- 대비(실브라우저 실측, 면 `bg-raised`, 라이트 · 다크): 이름 · 금액 17.27 · 16.54, 원가 6.34 · 5.26, 크레딧 · 포함 · 기능 · 트리거 9.63 · 7.24,
  설명 · 기간 · 메모 6.72 · 5.25, 예약 안내 글(4% 면 위) 6.15 · 4.74, 현재 링(그래픽) 3.52 · 4.90.

## Acceptance tests

`packages/react/test/plan-tier-card.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다.

1. 틀 — 안쪽 16 · 반경 12 · 최소 높이 560 · `bg-raised` 면 · 헤어라인 · `fg-primary`.
2. `data-current` — 2px `accent-primary` 안쪽 링.
3. 줄 — 머리 사이 16 · 원가 위 10 · 원가 뒤 가격 위 0 · 가격 사이 8 · 크레딧 위 4 아래 24 · 포함 위 12 · 목록 위 8 아래 18 · 줄 사이 4 · 금액 36.
4. 원가 빈 줄 — 보이지 않고 같은 높이이며, 할인 카드와 가격 줄 윗변이 같다.
5. 체크 아이콘 18 × 18 · 가운데가 기능 첫 줄 가운데와 ±0.5 안.
6. 상세 트리거 — 줄과 같은 글자 · 점선 밑줄 · 도움 커서.
7. 바닥 묶음 — 기능 목록 바로 다음 하나만 위 여백 auto, 나머지 8. CTA 폭 = 카드 안쪽 폭, 바닥에 선다. 같은 줄 카드 높이가 같다.
8. 예약 안내 — 위아래 8 · 좌우 12 · 사이 8 · 반경 8 · 선 1 · 버튼 한 줄.
9. 덱 — 1200 이상 5열 · 1199 이하 2열 · 사이 4, 변수로 1열.
10. 좁은 화면 — 720 에서 안쪽 16 · 최소 560, 719 에서 12 · 없음, 479 에서 금액 28.
11. 호버 규칙이 없다.
12. 대비는 실제로 잰다 — 원가 · 모든 글자 4.5 이상, 현재 링 3 이상, 두 테마.

`packages/react/test/plan-tier-card-geometry.browser.test.tsx` 는 기록 `figma/components.measured.json` 의 `plan-tier-card` 네 칸(Selected × Layout) · `plan-tier-card-feature` 두 칸 · `plan-tier-card-notice` 를 코드가 만드는지 되잰다.

## Known deviations

1. **체크 아이콘이 라이트 2.22 다** — 모든 기능 줄에 같은 모양으로 붙는 목록 표식이라 정보를 싣지 않는다(`aria-hidden`, 1.4.11 대상이 아니다, DS-D-0091 판정 4).
   예약 안내 상자의 12% 선도 같은 판단이다 — 상자의 뜻은 글자와 버튼이 말한다.
2. **상세는 터치에서 열리지 않는다**(Tooltip 의 계약) — 같은 내용이 비교표에 있다.
3. **최소 높이 경계 788 이 719 로 접혔다** — 720~788 에서만 차이(2열 카드에 최소 560)가 난다.
4. **고쳐 올린 값**(DS-D-0084 3항) — 원가 라이트 `red-500` → `red-700`, 현재 표시 `blue-200` 40% → `accent-primary` 2px, 메모 잉크 두 벌 → `fg-tertiary`,
   제목 · 가격 `gray-200` → `fg-primary`.

## 제품에서 발견한 것

- 두 사본이 갈렸다 — 메모 잉크(`app/mypage/upgrade/UpgradePlanPageClient.tsx:315` `gray-300` 88% 대 `components/landing/sections/PricingSection.tsx:228` `gray-000` 56%),
  상세 툴팁(업그레이드만), 현재 표시 · 예약 안내(업그레이드만).
- 상세 면이 카드 `overflow-hidden` 안의 `absolute` 이고 폭 260 이라, 덱 1300 기준 카드 안쪽 폭 약 225 를 넘어 오른쪽이 약 19px 잘린다(계산).
  숫자 `z-10` 도 쓰고, 호버로만 열린다(`app/mypage/upgrade/UpgradePlanPageClient.tsx:299-312`).
- 메모와 CTA 가 둘 다 `mt-auto` 라 빈 높이를 반씩 나누고, 가장 긴 카드에서는 예약 안내와 CTA 가 0 으로 붙는다.
- `motion-reduce:[transform:none]` 셋은 죽은 선언이다 — 카드에 transform 이 없다(`components/landing/sections/PricingSection.tsx:122-124`).
