---
id: drill-picker
status: experimental
authority: normative
summary: 폴더를 열고 그 안의 항목을 여럿 골라 가져오는 Finder 식 피커입니다.
---

# Drill Picker

폴더(프로젝트)를 하나 열고 그 안의 항목(영상)을 여럿 골라 한 번에 가져온다. 두 단계다 — 폴더 목록에서 하나를 누르면 같은 자리가 그 폴더의 항목 목록으로
바뀌고, 머리의 뒤로로 돌아온다. 메뉴 면 · 패널 서브뷰 **안에 놓이는 본문**이고 면을 갖지 않는다([DS-D-0105](../governance/decisions/DS-D-0105-drill-picker.md)).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS 레시피 `.louis-drill-picker` 만 있다(`packages/css/src/component/drill-picker.css`). React 표면은 없다 |
| Figma         | `partial`      | 고르기 행 `DrillPickerRow`(State × Checked) + 항목 단계 합성 `DrillPicker`. 계약 · 기하 · 되재기 시험이 선다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품 영상 편집기가 이 레시피를 물면 승격 후보 |

## When to use

- 묶음(프로젝트 · 폴더) 안의 항목을 **여럿** 골라 가져올 때.
- 쓰지 말아야 할 때: 하나만 고르는 목록. 그것은 [Selectable List Row](selectable-list-row.md) 다.
- 쓰지 말아야 할 때: 묶음이 없는 평평한 목록. 첫 단계가 필요 없다 — 체크박스 목록만 둔다.

## Anatomy

1. **Picker** — `.louis-drill-picker`. 세로 · 간격 6. 남는 높이를 채운다.
2. **Head** — `__head`(최소 28) · `__back`(28 · 반경 8 · 글리프 16) · `__title`(폴더 이름, 한 줄 말줄임). 항목 단계에만 선다.
3. **List** — `__list`. 위 헤어라인 · 위 여백 6 · 행 간격 2 · 넘치면 스크롤.
   - 폴더 단계의 행: `.louis-selectable-list-row[data-layout="link"]`(폴더 글리프 · 이름 · 체브론).
   - 항목 단계의 행: `__check-row` — `<label>` 하나가 `.louis-checkbox__control` · `__thumb`(92 · 16:9) · `__meta` 를 품는다.
     `__meta` 안에 종류 배지(`.louis-badge` info) + `__label`, 또는 `__label-row`(아이콘 16 + `__label`).
4. **Message** — `__message`. 실패 · 빈 목록 한 줄(`fg-danger-on-surface`).
5. **Footer** — `__footer`. 위 헤어라인 · 여백 10 · 4 · 4, 안에 `.louis-button` primary lg(폭 100%).

## Properties

| 클래스 · 속성 | 값 | 뜻 |
| --- | --- | --- |
| `__check-row` 안 `input:checked` | 체크박스 상태 | 행 면은 바뀌지 않는다 — 선택은 체크박스가 말한다 |
| `.louis-button[disabled]` | 고른 것 0 | 가져오기 버튼이 꺼진다 |

## Variants, sizes, and states

크기 축이 없다. 단계(폴더 · 항목)는 축이 아니라 **담기는 것**이다 — 같은 상자 안에 다른 행이 선다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 고르기 행 기본 | 면 없음, 잉크 `fg-secondary` |
| 고르기 행 위(`@media (hover: hover)`) | 면 `accent-ghost-hover`, 잉크 `fg-primary` |
| 고르기 행 체크 | 체크박스만 바뀐다(`accent-primary` 면 · 표식) |
| 뒤로 위 | 면 `accent-secondary-hover`, 잉크 `fg-primary` |
| 불러오는 중 | 목록 자리에 `.louis-skeleton` 행 자리표시(체크 · 썸네일 · 두 줄) |
| 실패 · 빈 목록 | `__message` 한 줄 |
| 고른 것 0 | 가져오기 버튼 `disabled` |

## Interaction and responsive behavior

- 폴더 행을 누르면 같은 상자가 항목 단계로 바뀌고 고른 것은 비워진다. 뒤로는 폴더 단계로 돌아간다.
- 고르기 행 어디를 눌러도 체크박스가 토글된다(`<label>`).
- 이름은 감긴다(`overflow-wrap: anywhere`). 폴더 이름(머리)은 한 줄 말줄임.
- 목록만 스크롤하고 머리 · 발은 남는다.

## Content

- 머리 제목은 연 폴더의 이름. 뒤로의 `aria-label` 은 「프로젝트 목록으로」 · 「Back to projects」.
- 종류 배지는 짧은 명사(「편집본」 · 「생성」). 노드에서 온 영상은 배지 대신 영상 아이콘을 둔다.
- 가져오기 버튼은 「선택한 영상 가져오기」처럼 동작 + 대상.

## Accessibility

- 고르기 행의 체크박스는 이름을 갖는다(`aria-label` 또는 `<label>` 안 글). 행 안에 다른 버튼을 두지 않는다.
- 뒤로는 `<button>` · `aria-label` 을 갖는다. 28 은 2.5.8 AA 를 넘는다.
- 단계가 바뀌면 포커스를 새 목록의 첫 행(또는 머리 제목)으로 옮긴다.
- 대비: 행 잉크 `fg-secondary` · 호버 `fg-primary` · 배지 · 실패 글이 두 테마의 메뉴 면 위에서 4.5:1 을 넘는다(시험 2). 제품 실패 글(라이트 1.91)을 고쳐 올렸다.

## Specification

| Part/state | Token or recipe | 구현 근거 |
| --- | --- | --- |
| 루트 간격 | `space-overlay-item-content-gap`(6) | 제품 `DROPDOWN_BODY gap-3`(`VideoEditProjectPicker.tsx:21`) |
| 머리 | 최소 28 · 간격 6 | 제품 `min-h-14` · `DRILL_NAV gap-3`(`:29` · `:31`) |
| 뒤로 | 28 · `radius-control-sm` · 면 `accent-secondary` → 호버 `accent-secondary-hover` | 제품 `w-14 h-14 rounded-8` · 8% → 12%(`:33-46`) |
| 제목 | `body-sm-semibold` · `fg-primary` | 제품 `type-body-14-semibold` · 88%(`:50-54`) |
| 목록 | 위 선 `border-width-default` `stroke-subtle` · 위 여백 6 · 행 간격 2 | 제품 `border-t` 8% · `pt-3`(`:101-107`) |
| 고르기 행 | 여백 8 · 6 · 간격 10 · `radius-control-sm` · `body-sm-regular` | 제품 `py-4 px-3 gap-5 rounded-8`(`:127-138`) |
| 썸네일 | 92 · 16:9 · `radius-control-sm` · 경계 1 `stroke-subtle` · 우물 `accent-secondary` | 제품 `w-46 aspect-[16/9] rounded-8`(`:150-154`) |
| 글 묶음 | 간격 4 · 아이콘 줄 간격 8 · 아이콘 16 · 내림 2 | 제품 `gap-2` · `gap-4` · `mt-1`(`:158-162`) |
| 종류 배지 | `.louis-badge` info | 제품 primary 16% 면(`:164`) |
| 실패 글 | `caption-regular` · `fg-danger-on-surface` | 제품 rgb(251 146 150) 96%(`:80`) |
| 발 | 위 선 · 여백 10 · 4 · 4 · `.louis-button` primary lg | 제품 `pt-5 px-2 pb-2` · primary 32% 버튼(`:109-125`) |

## Implementation

- Web source: packages/css/src/component/drill-picker.css
- Public import: `@klipse-design/css` (레시피 클래스). React 표면 없음
- Figma component: `DrillPicker` · `DrillPickerRow` — DS · Components 의 「R1 · 캔버스 · 편집기 부품 (2026-10-15)」 섹션
- Tests/visual evidence: packages/react/test/drill-picker.browser.test.tsx 가 figma/components.measured.json 의 drill-picker 를 되잰다

### Usage

```html
<div class="louis-drill-picker">
  <div class="louis-drill-picker__head">
    <button type="button" class="louis-drill-picker__back" aria-label="프로젝트 목록으로"><svg>…</svg></button>
    <span class="louis-drill-picker__title">여름 캠페인</span>
  </div>
  <ul class="louis-drill-picker__list">
    <li>
      <label class="louis-drill-picker__check-row">
        <input type="checkbox" class="louis-checkbox__control" />
        <span class="louis-drill-picker__thumb"><img alt="" /></span>
        <span class="louis-drill-picker__meta">
          <span class="louis-badge" data-tone="info">편집본</span>
          <span class="louis-drill-picker__label">오프닝 컷 2</span>
        </span>
      </label>
    </li>
  </ul>
  <div class="louis-drill-picker__footer">
    <button type="button" class="louis-button" data-variant="primary" data-size="lg">선택한 영상 가져오기</button>
  </div>
</div>
```

## Acceptance tests

1. 루트 간격 6, 머리 최소 28 · 간격 6, 뒤로 28 · 반경 8 · 글리프 16, 제목 14, 목록 위 선 1 · 위 여백 6 · 행 간격 2, 발 여백 10 · 4 · 4 가
   `figma/components.measured.json` 의 `drill-picker.picker` 와 같다.
2. 고르기 행 여백 8 · 6 · 간격 10 · 반경 8, 썸네일 92 · 반경 8 · 16:9, 글 묶음 간격 4, 아이콘 줄 간격 8, 이름 14 가 `drill-picker.row` 와 같다. 행은 `<label>` 이고
   행을 누르면 체크박스가 토글된다.
3. 두 테마의 메뉴 면 위에서 행 잉크 · 호버 잉크 · 배지 · 실패 글이 4.5:1 을 넘는다.
4. Figma 되읽기에서 `DrillPicker` · `DrillPickerRow` 의 `rawFills` · `rawStrokes` 가 0 이다(parity 게이트).

1~3 은 `packages/react/test/drill-picker.browser.test.tsx` 가 실브라우저에서 잰다.

## Known deviations

1. **제품이 아직 이 레시피를 물지 않는다.** 대응은 제품이 클래스를 바꿔 물 때 선다.
2. **폴더 목록의 위 여백이 2 → 6 이다.** 두 단계를 한 값으로 접었다(DS-D-0105 판정 3).
3. **가져오기 버튼이 41 → 40 이다.** `.louis-button` lg 를 받았다(판정 4).
4. **드릴 슬라이드 300ms 를 옮기지 않았다**(판정 6).
5. **Figma 고르기 행의 썸네일이 52 높이다.** CSS 는 92 × 9 / 16 = 51.75 를 계산한다 — 기록은 폭만 계약한다.

## Migration and changelog

2026-10-15 — 새 부품([DS-D-0105](../governance/decisions/DS-D-0105-drill-picker.md)).
