---
id: section-shell
status: experimental
authority: normative
summary: 랜딩 · 마케팅 섹션 하나의 세로 리듬과 좌우 인셋, 1400 콘텐츠 폭을 정합니다.
---

# Section Shell

랜딩 · 마케팅 섹션 하나의 껍데기다 — 세로 리듬 · 좌우 인셋 · 가운데 1400 콘텐츠 폭(`.louis-section-shell`,
[DS-D-0111](../governance/decisions/DS-D-0111-section-shell.md)). 면 · 선 · 반경 · 글자가 없는 레이아웃 부품이다.
제품 정본은 `components/landing/system/SectionShell.tsx` 의 `SECTION` · `CONTENT_WIDTH` 와 `components/landing/system/sectionInline.ts` 의 `INLINE`
(통합 판 `54b62a8aa`)이고, 랜딩 여덟 섹션이 그것을 밟는다. 페이지 전체(GNB · 푸터 · 면)는 [landing-shell](../patterns/landing-shell.md) 패턴이고,
섹션의 머리는 [Section Header](section-header.md) `display` 다.

```html
<!-- 기본 — 인셋 + 가운데 1400 -->
<section class="louis-section-shell" id="faq">
  <div class="louis-section-shell__content">…</div>
</section>

<!-- bleed — 트랙이 화면 끝까지, 머리만 인셋 안 1400 -->
<section class="louis-section-shell" data-bleed="true">
  <div class="louis-section-shell__inset">
    <div class="louis-section-shell__content">…머리…</div>
  </div>
  <div class="carousel-track">…</div>
</section>
```

| 뷰포트 | 세로 여백 | 좌우 인셋 |
| --- | --- | --- |
| ≥960 | 120 `layout-section-block` | 20 `layout-section-inline` |
| ≤959 | 88 `layout-section-block-md` | 20 |
| ≤719 | 88 | 16 `layout-section-inline-md` |
| ≤640 | 60 `layout-section-block-sm` | 16 |
| ≤355 | 60 | 12 `layout-section-inline-sm` |

콘텐츠 `__content` 는 폭 100% · 최대 1400(`layout-section-content-max`) · 가운데. `data-bleed="true"` 면 껍데기의 좌우 인셋이 0 이 되고, 안쪽 상자가
`__inset` 으로 같은 계단을 건다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/section-shell.css` 와 토큰 일곱. React 표면은 없다 — 소비처가 클래스를 물면 된다 |
| Figma         | `done`        | 2026-10-15 — `SectionShell` — Viewport(≥960 · ≤959 · ≤719 · ≤640 · ≤355) × Bleed(false · true). 패딩 · 최대 폭이 `layout/section-*` 변수에 묶였다. 기하 계약 · 실측 기록 · 브라우저 되재기가 섰다(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `data-bleed` | 없음 · `true` | 트랙이 화면 끝까지 흐른다 — 껍데기가 좌우 인셋 · 폭 제한을 걸지 않는다 |
| `__content` | — | 가운데 1400 콘텐츠 상자 |
| `__inset` | — | bleed 섹션 안에서 껍데기 대신 같은 좌우 인셋을 거는 상자 |

## States

상호작용 상태가 없다. 뷰포트 다섯 칸이 위 표대로 바뀐다.

## Content

- 섹션 하나에 껍데기 하나. 섹션끼리 여백을 더하지 않는다 — 두 섹션 사이는 120 + 120 이다(제품 그대로).
- 사진 밴드처럼 배경이 화면 끝까지 가는 섹션은 bleed 가 아니라 배경을 섹션 면에 깔고 기본 껍데기를 쓴다.

## Accessibility

- 껍데기는 `<section>` 이다. 이름이 필요하면 머리(Section Header)의 제목을 `aria-labelledby` 로 잇는다.
- 앵커 이동의 여백(`scroll-margin`)은 GNB 높이를 아는 소비처가 준다(제품 `scroll-mt-60`).
- 대비를 갖지 않는다 — 면 · 글자가 없다.

## Acceptance tests

`packages/react/test/section-shell.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 다섯 뷰포트에서 세로 · 좌우 여백을, 1600 폭에서
콘텐츠 1400 가운데를, bleed 의 좌우 0 · 폭 제한 없음 · `__inset` 의 인셋을 잰다. `packages/react/test/section-shell-geometry.browser.test.tsx` 가
기록 `section-shell` 의 열 칸을 레시피의 계산값으로 되잰다.

## Known deviations

1. **경계 640 · 355 는 LOUIS compact 경계(719)와 다르다** — 랜딩 전 섹션이 같은 경계를 밟아야 줄이 맞아 제품 그대로 두었다(DS-D-0111 판정 3).

## 제품에서 발견한 것

- 제품 `INLINE` 의 마지막 단 `[@media(max-width:355px)]:px-6!` 은 Tailwind 가 max-width 미디어를 오름차순으로 내는 순서를 `!` 로 이긴다.
  레시피는 지역 변수 하나를 경계 순서대로 덮어써 그 다툼이 없다.
