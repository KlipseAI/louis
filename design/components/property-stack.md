---
id: property-stack
status: experimental
authority: normative
summary: 편집 패널에서 라벨이 컨트롤 위에 쌓이는 속성 칸들을 요소마다 묶습니다.
---

# Property Stack

편집 패널의 세로 속성 묶음이다 — 묶음 라벨, 요소마다 이름 · 라벨 위 칸 줄 · (슬라이더 줄)(`.louis-property-stack`,
[DS-D-0114](../governance/decisions/DS-D-0114-property-stack.md)). 제품 정본은 하이라이트 숏츠 편집 모달의 자막 색 패널
`app/highlight/[projectId]/shorts/[shortId]/CaptionColorPanel.tsx`(통합 판 `54b62a8aa`)다. 칸은 [Color Swatch](color-swatch.md) `data-layout="stack"`,
슬라이더는 [Slider](slider.md) md 다. 라벨이 컨트롤 왼쪽에 서는 28 한 줄은 [Inspector Row](inspector-row.md) 다.

```html
<div class="louis-property-stack">
  <p class="louis-property-stack__label">자막 색상</p>
  <div class="louis-property-stack__group" role="group" aria-labelledby="g-title">
    <span class="louis-property-stack__group-label" id="g-title">제목</span>
    <div class="louis-property-stack__fields">
      <label class="louis-color-swatch" data-layout="stack">…글자…</label>
      <label class="louis-color-swatch" data-layout="stack">…배경…</label>
      <div class="louis-color-swatch" data-layout="stack">…테두리(빈 칸)…</div>
      <div class="louis-color-swatch" data-layout="stack">…외곽선(빈 칸)…</div>
    </div>
    <div class="louis-property-stack__slider-row">
      <span class="louis-property-stack__slider-label" id="g-pad">여백</span>
      <span class="louis-slider" data-size="md">
        <input class="louis-slider__control" type="range" min="0" max="48" step="2" value="12" aria-labelledby="g-pad">
      </span>
      <span class="louis-property-stack__slider-value">12</span>
    </div>
  </div>
</div>
```

| 부분 | 값 |
| --- | --- |
| 묶음 | 세로 · 사이 12(`space-stack-md`) · 안쪽 위 8 · 좌우 12 · 아래 4 |
| 묶음 라벨 | caption medium · `fg-tertiary` |
| 요소 | 세로 · 사이 4(`space-stack-xs`) — 이름 caption `fg-primary` |
| 칸 줄 | 줄바꿈 · 사이 12. 칸은 Color Swatch stack(열 44 · 라벨 위 칩 32) |
| 슬라이더 줄 | 가운데 맞춤 · 사이 8 — 라벨 caption `fg-tertiary` 최소 28, Slider md, 값 caption `fg-primary` 최소 16 · 오른쪽 · 고정폭 숫자 |

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/property-stack.css`. React 표면은 없다 — 소비처가 클래스를 물면 된다 |
| Figma         | `done`        | 2026-10-15 — `PropertyStack`(요소 셋) · `PropertyStackGroup`(BOOLEAN Slider, TEXT Label). 칸은 ColorSwatch(Layout=stack) 인스턴스, 슬라이더는 Slider md 인스턴스. 기하 계약 · 실측 기록 · 브라우저 되재기가 섰다(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| `__label` | — | 묶음 이름 |
| `__group` | `role="group"` | 요소 하나 — 이름이 그룹의 접근 이름 |
| `__fields` | — | Color Swatch stack 칸들 |
| `__slider-row` | 있음 · 없음 | 배경이 켜졌을 때만 서는 값 줄 |

## States

칸 · 슬라이더의 상태는 각 부품이 갖는다(Color Swatch 의 채움 · 빈 칸 · 호버, Slider 의 쉼 · 비활성). 묶음은 요소가 있을 때만 선다 — 요소가 하나도
없으면 소비처가 묶음을 그리지 않는다.

## Content

- 묶음 라벨은 무엇을 고치는지(「자막 색상」), 요소 이름은 화면의 요소 이름(「제목」).
- 칸 라벨은 두 글자 안팎(「글자 · 배경 · 테두리 · 외곽선」) — 열 44 안에 한 줄로 든다.

## Accessibility

- 요소는 `role="group"` 에 이름을 단다. 칸 · 슬라이더의 이름은 각 부품이 갖는다(슬라이더는 `aria-labelledby` 로 줄 라벨을 문다).
- 대비(실브라우저 실측, 편집 패널 면 `bg-inset` 위): 묶음 라벨 · 슬라이더 라벨 라이트 5.68 · 다크 5.75, 요소 이름 · 값 라이트 14.61 · 다크 18.12.

## Acceptance tests

`packages/react/test/property-stack.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 안쪽 8 / 12 / 4 · 묶음 사이 12 · 요소 안 4,
칸 줄 사이 12 · 줄바꿈, 슬라이더 줄 사이 8 · 라벨 28 이상 · 값 16 이상 · 슬라이더가 남은 폭을 채움, 두 테마에서 라벨 · 이름 · 값 대비 4.5:1 이상.
`packages/react/test/property-stack-geometry.browser.test.tsx` 가 기록 `property-stack` · `property-stack-group` 을 되잰다.

## Known deviations

1. **묶음 사이 10 → 12, 슬라이더 줄 위 2 를 없앴다**(DS-D-0114 판정 2 · 3).

## 제품에서 발견한 것

- 칸 함수 `Swatch` 가 화면 파일 안에 있어 어드민 자막 템플릿 모달의 칩과 따로 갈렸다 — Color Swatch 가 둘을 한 레시피로 묶는다.
