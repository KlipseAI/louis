---
id: record-card
status: experimental
authority: normative
summary: 어드민 기록 하나를 머리 한 줄로 접고 눌러서 라벨/값 상세를 펼치는 카드입니다.
---

# Record Card

기록 하나(지원서 · 문의 · 청약철회)를 **머리 두 줄로 접어 보이고**, 눌러서 상세를 같은 자리에서 펼친다. 머리는 상태
배지 · 이름 · 유형과 이메일 · 채널 · 시각을 싣고, 펼치면 위 헤어라인 아래에 **라벨/값 격자**와 행동 줄이 선다.

**정본은 제품 어드민이다(2026-10-07, 제품 작업 브랜치 `feat/ambassador-links` @7273a964e).** 같은 형태가 세 파일에
복제돼 있고 `INQUIRY_CARD_HEADER` · `CHEVRON` · `DETAIL_GRID` 이름까지 같다 — 지원서 검토 파일이 주석으로
「그 형태는 청약철회 · 문의 관리와 같다」고 스스로 적는다. LOUIS 레시피는 `packages/css/src/component/record-card.css`
이다. React 표면은 없고 소비처가 클래스를 직접 쓴다([Alert](./alert.md) · [Table](./table.md) 과 같은 형태).

## Availability

| Surface       | 상태           | 근거                                                                                                    |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| Web           | `not-ready`    | `packages/css/src/component/record-card.css` 레시피는 있다. 제품 세 파일은 아직 자기 상수로 그린다 — 소비 증거도 브라우저 시험도 없어 `partial` 로 올리지 않는다 |
| Figma         | `done`      | component set `RecordCard`(DS · Components 「5 · 내용」, 2026-10-08, 8 변형). 되읽기 등재 + parity 계약(축 · 효과 · 기하 두 칸)이 있다. 기하 기록이 브라우저 실측이 아니라 레시피 선언이고(verify-recipe-record 가 맞댄다) React 표면이 없어 되재는 브라우저 시험이 없으므로 DS-D-0035 (c) 를 채우지 못해 `done` 이 아니다 — 2026-10-14 되재기 시험 `record-card-geometry.browser.test.tsx` 로 done(DS-D-0035) |
| Documentation | `partial`      | 이 문서 — States · Content · Acceptance tests 절이 아직 없다 |
| Maturity      | `experimental` | 레시피가 정본을 옮겨 적은 단계다. 소비처가 이 클래스를 물면 승격을 다시 판정한다                          |

## When to use

- 기록이 **많고 대부분 접혀 있어도 되는** 어드민 목록 — 머리 두 줄로 훑고, 필요한 것만 펼쳐 처리한다.
- 쓰지 않는 자리:
  - **칸을 비교해야 하는 목록** — [Table](./table.md) 이다. 이 카드는 칸끼리 세로로 비교하지 않는다.
  - **질문과 답 하나로 접히는 목록** — [FAQ Row](./faq-row.md) 다(랜딩용 알약).
  - **긴 해설을 접는 본문** — 지표 화면의 해설 접기(`ProductMetricsDashboard.tsx@b57cd1f95:77` @07640ee76)가 같은 머리와
    상세를 `<details><summary>` 로 다시 짠다. 머리 클래스가 `<summary>` 도 받는 이유다. 소비처 둘 다 이 문서의 계열로
    본다(머리 · 헤어라인 · 셰브런 회전이 같다). 다만 해설 접기는 카드 면을 `rounded-12` 로 두는 등 조금 달라
    소비 판정은 그쪽 소유자가 한다.

**소비처 수.** 기록 카드 3(지원서 검토 `AmbassadorApplications.tsx@2ceec4ed3:69-157` · 문의 관리 `InquiryManagement.tsx@b57cd1f95:66-180` ·
청약철회 `RefundManagement.tsx@b57cd1f95:62-150`) + 해설 접기 1(`ProductMetricsDashboard.tsx@b57cd1f95:77-107`). 작업 목록
`JobMonitor.tsx:93`(`JOB_ROW`)도 `aria-expanded` 행이지만 격자 한 줄 행이라 이 카드가 아니다.

## API

```html
<!-- 지원서 검토 — 면 카드 -->
<div class="louis-record-card" data-surface="raised">
  <button type="button" class="louis-record-card__head" aria-expanded="true" aria-controls="detail-1">
    <span class="louis-record-card__top">
      <span class="louis-record-card__meta">
        <span class="louis-badge" data-tone="warning">접수</span>
        <span class="louis-record-card__title">홍길동</span>
        <span class="louis-record-card__note">크리에이터 협업</span>
      </span>
      <svg class="louis-record-card__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span class="louis-record-card__sub">
      <span class="louis-record-card__sub-item">gil@example.com</span>
      <span class="louis-record-card__sub-item">Instagram</span>
      <span class="louis-record-card__sub-item" data-align="end">10.07 14:20</span>
    </span>
  </button>
  <div class="louis-record-card__detail" id="detail-1">
    <dl class="louis-record-card__grid">
      <dt class="louis-record-card__label">접수 시각</dt>
      <dd class="louis-record-card__value">2026-10-07 14:20</dd>
      <dt class="louis-record-card__label">계정</dt>
      <dd class="louis-record-card__value" data-tone="muted">3f9c…</dd>
    </dl>
    <div class="louis-record-card__actions">…버튼…</div>
  </div>
</div>

<!-- 문의 · 청약철회 — 줄(기본). 목록의 첫 줄만 위에도 선이 선다 -->
<div class="louis-record-card">…</div>
```

머리는 `<details><summary class="louis-record-card__head">` 도 받는다 — 셰브런 회전이 `[aria-expanded="true"]` 와
`details[open] >` 둘을 읽는다.

**`aria-expanded` 를 갱신하는 것은 소비처의 책임이다.** 회전의 출처가 그 속성이라 빼면 회전도 함께 죽는다 — 시각과
보조기술이 갈리지 않게 하는 배선이다([FAQ Row](./faq-row.md) 와 같다). 펼친 상세는 `aria-controls` 로 가리킨다.

## Anatomy

1. **Card** — 면 없는 줄 또는 올린 면 카드. `overflow: hidden`.
2. **Head** — 카드 전체 폭의 `<button>`(또는 `<summary>`). 두 줄 + 오른쪽 셰브런.
   1. **Top** — 배지 · **Title**(body-sm-semibold, 말줄임) · **Note**(caption, 줄지 않음) | **Chevron**.
   2. **Sub** — 칸마다 따로 서는 caption 줄. 좁은 폭에서 줄을 접는다. 숫자 · 시각 칸은 `data-align="end"`.
3. **Detail**(펼쳤을 때만) — 위 헤어라인으로 머리와 갈린다.
   1. **Grid** — `dl` 의 라벨/값 짝.
   2. **Actions** — 오른쪽 정렬, 내용 크기 버튼.

## Properties

| 이름 | 값 | 붙는 자리 | 뜻 |
| --- | --- | --- | --- |
| `.louis-record-card` | — | 카드 루트 | 기본은 줄(아래 헤어라인) |
| `data-surface` | `raised` | 카드 루트 | 올린 면 + 헤어라인 + 반경 16. 지원서 검토 |
| `data-align` | `end` | `__sub-item` | 줄지 않고 tabular-nums. 시각 · 건수 |
| `data-tone` | `muted` | `__value` | 보조 값(계정 식별자 · 결제 키). 잉크 한 단 아래 |

## Specification

| 부분 | 값 | 토큰 / 근거 |
| --- | --- | --- |
| 머리 여백 | 14 / 20 | **리터럴** — 간격 계단(4·8·12·16) 밖. 제품 `px-10 py-7`(격자 2px), 세 파일 동일 |
| 머리 두 줄 간격 | 8 | `space-control-sm` |
| 위 줄 간격 | 12 | `space-control-md` |
| 배지 · 이름 · 유형 간격 | 10 | **리터럴** — 제품 `gap-5`. chart-card 헤더가 같은 값을 같은 사유로 둔다 |
| 아래 줄 간격 | 열 12 · 행 4 | `space-control-md` · `space-control-xs` |
| 이름 | body-sm-semibold · `fg-primary` | `typography-body-sm-semibold` |
| 유형 | caption-regular · `fg-secondary` | 제품 흰색 56% |
| 아래 줄 칸 | caption-regular · `fg-tertiary` | 제품 흰색 40% · 28% — **한 단으로 합쳤다** |
| 머리 hover | `accent-ghost-hover`(`@media (hover: hover)`) | 제품 흰색 8% |
| 셰브런 | 16 · `fg-tertiary` · 펼치면 180° · `motion-control-hover` | 제품 24% · 200ms |
| 상세 여백 | 위 12 · 옆 20 · 아래 16 · 안쪽 간격 12 | `space-control-md` · `space-control-lg` · 옆 20 은 리터럴 |
| 상세 구분선 | 0.5px inset | `hairline-inset-block-start` |
| 격자 | 열 12 · 행 8, `auto 1fr` | 600px 이하 한 열(제품 `[@media(max-width:600px)]`) |
| 라벨 | caption-medium · `fg-tertiary` | 제품 `text-gray-500` |
| 값 | body-sm-regular · `fg-primary` | 줄바꿈 보존 · 긴 값은 끊는다 |
| 행동 줄 | 오른쪽 정렬 · 간격 8 · 위 4 | 제품 `pt-2` |
| 면 카드 | `bg-raised` + `hairline-inset` + 반경 16 | `radius-overlay` · 제품 `ADMIN_SURFACE` |

## Figma

DS · Components 「5 · 내용」 구획의 component set `RecordCard`(2026-10-08, FaqRow · VideoPlayer 아래). 카드 하나가 변형 하나이고
목록(카드 사이 간격 · 첫 줄의 위 헤어라인)은 component 가 아니다 — 화면에서 오토레이아웃으로 놓는다.

| 축 | 값 | 코드 |
| --- | --- | --- |
| `Layout` | `base` · `raised` | `data-surface`. 없음 = 면 없는 줄(`base`), `raised` = 올린 면 카드. 루트의 면 · 반경 · 헤어라인이 갈린다 |
| `Expanded` | `false` · `true` | 머리의 `aria-expanded`(또는 `details[open]`). 셰브런이 180° 돌고 Detail 이 선다 |
| `State` | `Default` · `Hover` | 머리만 `accent-ghost-hover` 면. Focus 는 그리지 않는다(DS-D-0074) |
| `Title` · `Note` | 텍스트 | 이름 · 유형 |

여덟 칸(2 × 2 × 2)이 모두 선다 — 펼친 카드의 머리에도 호버 면이 서므로 `Expanded` 와 `State` 를 곱했다. 머리의 배지는
[Badge](./badge.md) `Tone=warning` 인스턴스, 셰브런은 라이브러리 `icon/caret-down` 인스턴스(16, 획 1.5, `fg-tertiary`), 행동 줄은
[Button](./button.md) `secondary` · `primary` `sm` 인스턴스다. 라벨/값 격자는 Figma 격자 오토레이아웃(열 `HUG` · `FLEX` = CSS
`auto 1fr`)이다.

헤어라인 셋(줄의 아래 · 면 카드의 사방 · 상세의 위)은 CSS 와 같이 inner shadow 한 겹씩이다. **Figma 는 채움이 없는 프레임에 inner
shadow 를 그리지 않아** 줄(`base`)의 루트와 Detail 에 불투명도 0 의 운반 fill 을 두었다 — 색을 나르지 않으므로 되읽기가 세지
않는다. 기하 계약은 `figma/components.measured.json` 의 `record-card` 두 칸(`base` · `raised`)이 고정하고, 그 기록은 레시피
선언에서 왔다 — `verify-recipe-record` 가 레시피 ↔ 기록을 맞댄다.

## Accessibility

- **머리가 `<button>` 이다** — 키보드로 펼치고 `aria-expanded` 가 상태를 읽힌다. 제품이 문의 관리를 `<div onClick>` 에서
  옮겨 온 판정이다. 머리 안에 또 다른 버튼을 두지 않는다(버튼 안의 버튼).
- **포커스 링을 그리지 않는다(DS-D-0074).** 제품은 카드 `overflow: hidden` 이 링을 잘라내 `outline-offset: -3px` 처방을
  썼으나 링이 없어진 지금 필요 없다. 고대비(forced-colors)의 링은 base.css 가 소유한다.
- 셰브런은 장식이다(`aria-hidden`). 상태는 `aria-expanded` 가 말한다.
- forced-colors 에서 헤어라인 그림자가 사라지므로 `currentColor` 실선으로 되살린다.

## Known deviations

- **면이 두 가지다(판정 필요).** 문의 · 청약철회는 면 없는 줄이고 지원서 검토만 올린 면 카드다. 감사 원본은 세 곳을
  「같은 형태」로 적었으나 실측은 갈린다 — 같은 커밋에서 공존하고 어느 쪽이 낡았다는 근거가 없어 `data-surface` 로
  둘 다 두었다. 하나로 합칠지는 소유자 몫이다.
- **라이트 머리 hover 가 달라진다.** 제품은 라이트에서 팔레트 칸(`palette-gray-100`)을 평평하게 깔았고 이 레시피는
  잉크 8% 상태 레이어다. 올린 면 위에서는 비슷하나 줄(면 없음) 위에서는 면 값이 갈린다.
- **잉크가 네 단에서 세 단이 됐다.** 제품 흰색 100 · 56 · 40 · 28% 중 40 과 28 이 `fg-tertiary` 하나로 합쳐졌다. 시각이
  이메일과 같은 잉크가 되어 위계가 한 단 줄었다. `fg-disabled` 는 정보를 싣는 글자에 못 쓴다.
- **줄 모양의 아래 헤어라인이 머리 hover 면에 가린다.** 카드 자신의 inset 그림자는 자식 배경 아래에 그려진다 — 머리를
  올렸을 때 0.5px 선이 잠깐 사라진다. 제품은 실제 `border-bottom` 이었다. 레이아웃을 바꾸지 않으려는 DS-D-0023 선택의 대가다.
- **전환이 200ms 에서 160ms 로 내려온다**(셰브런 · hover 배경은 150ms → 160ms).
- **브라우저 시험이 없다.** Figma 기하가 레시피 선언과만 맞대진다.
- **Figma 는 목록 첫 줄의 위 헤어라인을 그리지 않는다.** CSS `:first-child` 가 줄에 위 · 아래 두 겹을 거는데, 목록 위치는
  component 가 알 수 없어 변형으로 두지 않았다 — 화면에서 목록 위에 헤어라인을 놓는다.
- **Figma 셰브런은 소비처 svg 와 같은 벡터가 아니다.** 소비처는 16 뷰박스의 `M4 6l4 4 4-4` 이고 Figma 는 라이브러리
  `icon/caret-down`(24 뷰박스 쐐기)을 16 으로 줄였다. 같은 방향의 갈매기이고 획 두께 1.5 는 같다.
- **Figma 의 라이트 머리 hover 는 레시피와 같은 잉크 8% 다** — 위 「라이트 머리 hover」 편차가 Figma 에도 그대로 실린다.
- **카드 안 입력 · 이미지 썸네일 · 확인 모달**(`InquiryManagement` 의 이미지 격자, 지원서 검토의 `MODAL_CARD`)은 이 카드의
  범위가 아니다. 확인 모달은 [Dialog](./dialog.md) compact 와 380px 치수를 대조할 제품 이행 대상이다.

## 출처

2026-10-07, 제품 `feat/ambassador-links` `app/admin/AmbassadorApplications.tsx@2ceec4ed3:69-157`
· `InquiryManagement.tsx@b57cd1f95:66-180` · `RefundManagement.tsx@b57cd1f95:62-150` @7273a964e,
`codex/actionable-product-metrics` `ProductMetricsDashboard.tsx@e80c86ee7:77-107` @07640ee76.

2026-10-08 — Figma component set `RecordCard`(8 변형)와 parity 계약 · 되읽기 · 기록 `record-card` 두 칸. 레시피의 상세 위 · 아래
여백을 두 선언으로 갈랐다(값은 같다 — `verify-recipe-record` 가 선언 하나를 수 하나로 읽는다).
