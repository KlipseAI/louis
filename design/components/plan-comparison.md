---
id: plan-comparison
status: experimental
authority: normative
summary: 요금제마다 한 열을 세워, 각 플랜이 무엇을 주는지 묶음별로 나란히 보여 줍니다.
---

# Plan Comparison

요금제 비교표. **열이 플랜이다** — 각 열이 머리(플랜 이름) 아래에 묶음별 기능 목록을 자기완결로 담는다(`.louis-plan-comparison`,
[DS-D-0092](../governance/decisions/DS-D-0092-plan-comparison.md)). 한 플랜만 내려 읽어도 그 플랜이 무엇을 주는지 끝까지 읽히고, 옆 열과는 같은 높이의
같은 줄이 맞서 비교된다. 행 × 열 데이터 표가 필요하면 [Table](table.md) 이다. 요금제 한 단을 카드 한 장으로 보이는 것은 [Plan Tier Card](plan-tier-card.md) 다.

제품 정본은 하나다 — `components/landing/sections/PricingSection.tsx:214-409` 의 `PlanComparisonTable`(통합 판 `54b62a8aa`)이 공개 가격
(`components/landing/sections/PricingSection.tsx:573`)과 로그인 뒤 플랜 선택(`app/mypage/upgrade/UpgradePlanPageClient.tsx:781`) 두 자리에 선다.

```html
<section class="louis-plan-comparison" aria-labelledby="pc-title">
  <h3 class="louis-plan-comparison__title" id="pc-title">플랜 비교</h3>
  <div class="louis-plan-comparison__scroll">
    <div class="louis-plan-comparison__grid" style="--louis-plan-comparison-columns: 5">
      <div class="louis-plan-comparison__column" role="group" aria-labelledby="pc-plan-trial">
        <div class="louis-plan-comparison__head" id="pc-plan-trial">Trial</div>
        <div class="louis-plan-comparison__body">
          <div class="louis-plan-comparison__group">
            <p class="louis-plan-comparison__group-name" id="pc-trial-video">AI 영상 생성</p>
            <ul class="louis-plan-comparison__list" aria-labelledby="pc-trial-video">
              <li class="louis-plan-comparison__item">
                <span class="louis-plan-comparison__feature">Veo Lite</span>
                <span class="louis-plan-comparison__value" data-value="included">
                  <!-- React: <IconCheck size="sm" className="louis-plan-comparison__mark" label="포함" /> -->
                  <svg class="louis-icon louis-plan-comparison__mark" data-louis-icon="check" data-size="sm" role="img" aria-label="포함" viewBox="0 0 24 24">…</svg>
                </span>
              </li>
              <li class="louis-plan-comparison__item">
                <span class="louis-plan-comparison__feature">Veo Fast / Standard</span>
                <span class="louis-plan-comparison__value" data-value="excluded">
                  <span class="louis-plan-comparison__mark" role="img" aria-label="미포함">–</span>
                </span>
              </li>
              <li class="louis-plan-comparison__item">
                <span class="louis-plan-comparison__feature">최대 해상도</span>
                <span class="louis-plan-comparison__value" data-value="text">720p</span>
              </li>
            </ul>
          </div>
          <!-- 묶음이 더 있다 -->
        </div>
      </div>
      <!-- 플랜마다 한 열 -->
    </div>
  </div>
</section>
```

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/plan-comparison.css` · 실브라우저 시험 `plan-comparison.browser.test.tsx`. React 표면은 없다 — 행동이 없는 정적 조형이라 소비처가 클래스와 마크업 계약을 문다(DS-D-0092) |
| Figma         | `done`      | 2026-10-14 — `PlanComparison` 세트(Size `md` · `sm` — sm 은 767 이하, TEXT `Title`)와 한 열 `PlanComparisonColumn`(Size, TEXT `Plan`, BOOLEAN `Divider` — 열 사이 1px, 첫 열은 끈다), 항목 한 줄 `PlanComparisonItem`(Layout `included` · `excluded` · `text` — 코드 `data-value` 철자 × Size = 6, TEXT `Feature` · `Value`). 다섯 열(Trial · Lite · Plus · Pro · Ultra) · 묶음 하나 · 항목 셋은 시드 데이터다. 체크는 아이콘 `icon/check` 인스턴스 2/3 배(획 1.0), 대시는 16 칸 프레임. 머리 아래 선 · 격자 바깥 선은 INSIDE 획이고 패딩에 테두리를 접었다(§10). 가로 스크롤 칸은 그리지 않는다. 기록 `plan-comparison` · `-column` · `-item` 과 parity 기하 계약, 실브라우저 되재기(`plan-comparison-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## When to use

- 요금제 · 구독 단계마다 무엇이 포함되는지 기능 단위로 펼쳐 비교할 때. 공개 가격 화면과 로그인 뒤 플랜 선택이 같은 표를 쓴다.
- 쓰지 않는 경우 — 행마다 다른 기록을 담는 데이터 표(정렬 · 숫자 열)는 Table 이다. 플랜 하나를 가격과 함께 고르게 하는 것은 Plan Tier Card 다.

## Anatomy

| 부분 | 값 |
| --- | --- |
| 루트 `.louis-plan-comparison` | 면을 칠하지 않는다. 열 수 `--louis-plan-comparison-columns`(기본 4) |
| 제목 `__title` | 표 위 가운데 한 줄 · heading-md semibold 36 · `fg-primary` · 아래 32 |
| 스크롤 `__scroll` | 격자가 최소 폭보다 좁은 자리에서 가로로 구른다 |
| 격자 `__grid` | 열 수만큼 같은 폭 · 최소 760(767 이하 640) · 바깥 1px `gray-000-alpha-12` · 반경 16 · 모서리 자름 |
| 열 `__column` | 세로 흐름 · 열 사이 1px `gray-000-alpha-08`(첫 열 없음, 쓰기 방향을 따른다) · `role="group"` |
| 머리 `__head` | 18 · 20 · 16(767 이하 14 · 14 · 12) · body-md semibold 16 · `fg-primary` · 아래 1px `gray-000-alpha-08` → 높이 59(51) |
| 본문 `__body` | 위 4 · 아래 12 |
| 묶음 `__group` | 위아래 8 |
| 묶음 이름 `__group-name` | 10 · 안쪽 · 4 · caption medium 12 · `fg-secondary` → 높이 32 |
| 항목 `__item` | 7 · 안쪽 · 기능 이름 \| 값 양 끝 · 사이 12 → 한 줄 높이 35 |
| 기능 이름 `__feature` | body-sm regular 14 · `fg-secondary` · 좁으면 접힌다(말줄임 없음) |
| 값 `__value` | 줄지 않고 끝 정렬. 표시 칸 `__mark` 16 × 16 |

칸 좌우 안쪽(묶음 이름 · 항목)은 20(767 이하 14)이다.

## Variants

| 축 | 값 | 무엇이 바뀌나 |
| --- | --- | --- |
| 값 `data-value` | `included` · `excluded` · `text` | 체크(16, `stroke-strong`, 아이콘 `check`) · 대시 「–」(16, `fg-secondary`) · 짧은 글(caption semibold 12, `fg-primary`) |
| 화면 폭 | `≤767px` | 최소 폭 760 → 640, 칸 안쪽 20 → 14, 머리 18 · 20 · 16 → 14 · 14 · 12 |

## Properties

React 를 만들지 않는다 — 이 마크업 계약이 공개 계약이다.

| 속성 · 요소 | 값 | 기본 | 누가 단다 |
| --- | --- | --- | --- |
| 루트 · `__grid` 의 `--louis-plan-comparison-columns` | 정수 ≥ 1 | 4 | 소비처 — 플랜 수 |
| `__value` 의 `data-value` | `included` · `excluded` · `text` | — | 소비처 — 그 플랜의 그 기능 값 |
| `__mark`(체크) | 아이콘 `check`(`IconCheck size="sm"` — 16, `label` 이 `role="img"` · `aria-label` 을 단다) | — | 소비처 |
| `__mark`(대시) | `<span role="img" aria-label>` 안 글자 「–」 | — | 소비처 |
| 열 `role="group"` · `aria-labelledby`, 목록 `aria-labelledby` | 머리 · 묶음 이름의 id | — | 소비처 |
| 바깥 여백 · 페이지 폭 · `content-visibility` | 화면의 값 | 없음 | 소비처(DS-D-0092 판정 8) |

## States

| 상태 | 모양 |
| --- | --- |
| 기본 | 위의 값 |
| 격자보다 좁은 자리 | `__scroll` 이 가로로 구른다 |
| 767 이하 | 좁은 판(최소 폭 640 · 안쪽 14 · 머리 14 · 14 · 12) |
| 강제 색 | 선이 `border` 라 그대로 `CanvasText`, 체크는 `currentColor` |

호버 · 고름 · 펼침이 없다 — 읽기 전용 비교다. 그래서 `@media (hover: hover)` 블록도 없다.

## Content

- 기능 이름은 열마다 되풀이된다 — 같은 줄의 같은 기능이 옆 열과 맞선다. 묶음 · 항목의 순서는 모든 열이 같아야 한다.
- 텍스트 값은 짧게(「720p」 · 「10분」 · 「3」) — 칸이 줄지 않으므로 긴 값은 기능 이름을 접는다.
- 「미포함」은 빈칸이 아니라 대시다 — 빈칸은 「모른다」로 읽힌다.

## Accessibility

- 열은 `role="group"` + `aria-labelledby`(머리), 목록은 `aria-labelledby`(묶음 이름). 읽기 도구는 플랜 → 묶음 → 항목 순으로 읽는다.
- 체크 · 대시는 `role="img"` + 접근 이름(「포함」 · 「미포함」) — 색이 아니라 모양과 이름이 뜻을 전한다.
- `<table>` 이 아니다 — 행 · 열 머리 관계가 없는 피벗이라 표 의미를 주면 거짓말이 된다.
- 표가 넘치면 `__scroll` 이 구른다. 최신 브라우저는 넘치는 스크롤러를 키보드 포커스 대상으로 만든다 — 레시피는 `tabindex` 를 강제하지 않는다.
- 대비(실브라우저 실측, 바닥 `bg-surface` 라이트 · 다크): 제목 · 머리 · 텍스트 값 16.54 · 16.54, 기능 · 묶음 이름 · 대시 9.23 · 7.24,
  체크(그래픽) 4.43 · 3.74. 랜딩 바닥(다크 #000)에서는 더 높다.

## Acceptance tests

`packages/react/test/plan-comparison.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다.

1. 격자 — 열 수 변수만큼 같은 폭 · 최소 760 · 바깥 1px · 반경 16 · 모서리 자름 · 면 없음.
2. 열 — 첫 열 선 없음, 둘째부터 1px.
3. 머리 높이 59 · 묶음 이름 32 · 한 줄 항목 35 · 본문 위 4 아래 12 · 묶음 위아래 8 · 표시 칸 16 × 16.
4. 값 셋 — 체크 `stroke-strong` · 대시 `fg-secondary` 16 · 텍스트 caption semibold `fg-primary`.
5. 좁은 판 — 767 에서 최소 640 · 안쪽 14 · 머리 51, 768 에서 760 · 20 · 59.
6. 좁은 자리에서 `__scroll` 이 구른다.
7. 호버 규칙이 없다.
8. 대비는 실제로 잰다 — 글자 4.5 이상, 체크 3 이상, 두 테마.

`packages/react/test/plan-comparison-geometry.browser.test.tsx` 는 기록 `figma/components.measured.json` 의 `plan-comparison` 두 칸(Size) · `plan-comparison-column` 두 칸 · `plan-comparison-item` 여섯 칸(Layout × Size)을 코드가 만드는지 되잰다.

## Known deviations

1. **바깥 · 열 선 대비 1.14~1.42** — 열을 가르는 것은 머리 글자 · 열마다 되풀이되는 묶음 이름 · 격자 정렬이고 선은 장식 겹이다(1.4.11 의
   「식별에 필요한 그래픽」이 아니다). 제품 값(알파 잉크)을 같은 무게로 옮겼다.
2. **좁은 판 경계 767**(제품 768) — LOUIS 에 있는 경계를 쓴다. 정확히 768px 에서만 갈린다(DS-D-0092 판정 4).
3. **자간** — 제품은 body 의 −0.16px 을 상속하고 LOUIS 글자 토큰은 크기마다 −0.01em 이다(0.02~0.04px).
4. **반경 16 은 사다리 밖 리터럴**이다(DS-D-0092 판정 3).
5. **체크 획이 얇아진다** — 제품 인라인 글리프는 획 2/24(16px 에서 1.33px), 아이콘 세트 `check` 는 1.5/24(1.0px). 대비는 3:1 위다.
6. **다크 머리 · 텍스트 값 잉크** — 제품 `gray-100`(#dcdee1)이 역할 잉크 `fg-primary`(#fafafa)로 한 칸 밝아진다(DS-D-0092 판정 5).

## 제품에서 발견한 것

- `/mypage/upgrade` 의 다크 대비 미달(옛 `--gray-900` · `--gray-700` 잉크)은 앵커 `54b62a8a` 에서 이미 풀렸다(`app/mypage/upgrade/UpgradePlanPageClient.tsx:227-234`).
- 체크(`gray-500`)가 대시(`gray-300`)보다 흐리다 — 「포함」이 더 조용하다. 제품 주석이 의도로 적었다(대시가 다크에서 읽히게 올린 결과,
  `components/landing/sections/PricingSection.tsx@54b62a8a:394-397`).
- 열 · 묶음에 그룹 의미가 없다(맨 `div` · `ul`) — 레시피 마크업 계약이 더한다.
- `[-webkit-overflow-scrolling:touch]` 는 낡은 속성이라 옮기지 않았다(`components/landing/sections/PricingSection.tsx@54b62a8a:333`).
