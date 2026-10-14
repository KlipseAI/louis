---
id: gallery-panel
status: experimental
authority: normative
summary: 열린 모달 안을 덮어 예시 그림을 세 열 격자로 보여 줍니다.
---

# Gallery Panel

열린 모달의 내용 상자 **안을 덮어** 예시 그림을 보여 준다. 머리(제목 · 닫기)와 본문(안내 한 줄 · 세 열 2:3 격자) 두 칸이다. 두 번째 대화상자가 아니다 — 모달
위에 포털을 하나 더 띄우면 바깥 클릭 닫기가 서로 물리므로, 모달이 이미 가진 상자 안에서 덮는다([DS-D-0104](../governance/decisions/DS-D-0104-gallery-panel.md)).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS 레시피 `.louis-gallery-panel` 만 있다(`packages/css/src/component/gallery-panel.css`). React 표면은 없다 |
| Figma         | `done`         | `GalleryPanel`(400 폭 표본). 계약 · 기하 · 되재기 시험이 선다 — 2026-10-15 되재기 `gallery-panel.browser.test.tsx` 로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품 이미지 편집 모달이 이 레시피를 물면 승격 후보 |

## When to use

- 편집 모달 안에서 **참고용 그림 여러 장**을 잠깐 보여 주고 같은 자리로 돌아올 때(스티커 예시).
- 쓰지 말아야 할 때: 그림 하나를 고르는 자리. 그것은 [Asset Tile](asset-tile.md) 격자다.
- 쓰지 말아야 할 때: 그림 한 장을 크게 보는 자리. 그것은 [Lightbox](lightbox.md) 다.
- 쓰지 말아야 할 때: 모달이 아닌 화면에서. 덮을 내용 상자가 없으면 [Dialog](dialog.md) 를 연다.

## Anatomy

1. **Panel** — `.louis-gallery-panel`. 모달 내용 상자의 마지막 자식, `absolute inset 0` · 세로 흐름 · 면 `bg-overlay`.
2. **Head** — `__head`. 제목(`__title`)과 닫기(`__close`, 28 원 · 글리프 16)가 양 끝. 아래 헤어라인.
3. **Body** — `__body`. 남는 높이를 채우고 넘치면 세로 스크롤. 안내(`__hint`) 한 줄 + 격자(`__grid`).
4. **Cell** — `__cell`. 2:3 세로 그림 칸, 반경 8 · 경계 1. 그림은 `object-fit: cover`.

## Properties

속성이 없다. 칸 수 · 그림은 소비처 데이터다. 패널 크기는 덮는 모달 상자가 정한다.

| 클래스 | 뜻 |
| --- | --- |
| `.louis-gallery-panel` | 덮개 |
| `__head` · `__title` · `__close` | 머리 · 제목 · 닫기 |
| `__body` · `__hint` · `__grid` · `__cell` | 본문 · 안내 · 세 열 격자 · 그림 칸 |

## Variants, sizes, and states

변형 · 크기 축이 없다. Figma 는 400 폭 표본 한 장이다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 기본 | 닫기 잉크 `fg-secondary`, 면 없음 |
| 닫기 위(`@media (hover: hover)`) | 닫기 면 `accent-ghost-hover` · 잉크 `fg-primary` |
| 닫기 포커스 | 정본 포커스 링(base.css) — 이 레시피가 덮지 않는다 |
| 그림 전 | 칸 우물 `accent-secondary` 가 보인다 |

칸은 누를 수 없다 — 호버 · 선택 상태가 없다.

## Interaction and responsive behavior

- Escape 는 **패널만** 닫는다. 소비처가 keydown 을 캡처 단계에서 받아 전파를 멈춘다 — 그러지 않으면 편집 모달까지 함께 닫힌다(제품 `ExampleGallery.tsx:57-67`).
- 패널 위 포인터 내림이 모달 바깥 판정으로 새지 않게 소비처가 `pointerdown` 전파를 멈춘다(제품 `:73`).
- 격자는 세 열 고정이다. 좁은 모달에서는 칸이 함께 준다(`minmax(0, 1fr)`).
- 본문만 스크롤한다. 머리는 남는다.

## Content

- 제목은 한 줄 — 넘치면 말줄임. 예: 「예시 보기」 · 「Examples」 · 「例を見る」.
- 안내는 한 문장. 예: 「예시 그림을 참고해 스티커를 붙여 보세요.」
- 칸 그림의 대체 텍스트는 「예시 1」처럼 순번을 담는다(제품 `examplesImageAlt(index + 1)`).

## Accessibility

- 패널은 `role="dialog"` · `aria-modal="true"` 와 제목을 가리키는 이름을 갖는다(소비처). 열릴 때 포커스를 닫기로 옮기고 닫히면 「예시 보기」 트리거로 돌린다.
- 닫기는 `aria-label`(「예시 닫기」)을 갖는 `<button>` 이다. 28 은 2.5.8 AA(24)를 넘는다.
- 대비: 제목 `fg-primary`, 닫기 `fg-secondary`, 안내 `fg-tertiary` 가 두 테마의 `bg-overlay` 위에서 4.5:1 을 넘는다(시험 2). 제품의 44% 잉크(라이트 2.63 · 다크 3.80)를
  고쳐 올렸다.

## Specification

| Part/state | Token or recipe | 구현 근거 |
| --- | --- | --- |
| 면 | `color-bg-overlay` | 제품 gray-800 / gray-100 고정(`ExampleGallery.tsx:10-15`) → 모달 면과 한 겹(DS-D-0104 판정 2) |
| 머리 여백 | 10 · 12 · 8(위 · 양옆 · 아래) | 제품 `pt-5 px-6 pb-4`(`:17-21`) |
| 머리 아래 선 | `border-width-default` · `color-stroke-subtle` | 제품 1px 12%(`:20`) |
| 제목 | `body-sm-medium` · `fg-primary` | 제품 `type-body-14-medium`(`:23`) |
| 닫기 | 28 원 · 글리프 16 · `fg-secondary` → 호버 `fg-primary` + `accent-ghost-hover` | 제품 `w-14 h-14 rounded-[50%]` · 44% → 88%(`:25-32`) |
| 본문 | 여백 12 · 간격 8 | 제품 `p-6 gap-4`(`:34`) |
| 안내 | `caption-regular` · `fg-tertiary` | 제품 caption · 44%(`:36-39`) |
| 격자 | 세 열 · 간격 8 | 제품 `grid-cols-3 gap-4`(`:41`) |
| 칸 | 2:3 · `radius-control-sm` · `border-width-default` `stroke-subtle` · 우물 `accent-secondary` | 제품 `aspect-[2/3] rounded-8` · 경계 10% · 면 gray-600 40%(`:43-47`) |

## Implementation

- Web source: packages/css/src/component/gallery-panel.css
- Public import: `@klipse-design/css` (레시피 클래스). React 표면 없음
- Figma component: `GalleryPanel` — DS · Components 의 「R1 · 캔버스 · 편집기 부품 (2026-10-15)」 섹션
- Tests/visual evidence: packages/react/test/gallery-panel.browser.test.tsx 가 figma/components.measured.json 의 gallery-panel 을 되잰다

### Usage

```html
<div class="louis-dialog__body" style="position: relative">
  <!-- … 편집 모달 내용 … -->
  <div class="louis-gallery-panel" role="dialog" aria-modal="true" aria-labelledby="examples-title">
    <div class="louis-gallery-panel__head">
      <span class="louis-gallery-panel__title" id="examples-title">예시 보기</span>
      <button type="button" class="louis-gallery-panel__close" aria-label="예시 닫기"><svg>…</svg></button>
    </div>
    <div class="louis-gallery-panel__body">
      <span class="louis-gallery-panel__hint">예시 그림을 참고해 스티커를 붙여 보세요.</span>
      <div class="louis-gallery-panel__grid">
        <div class="louis-gallery-panel__cell"><img alt="예시 1" /></div>
      </div>
    </div>
  </div>
</div>
```

## Acceptance tests

1. 머리 여백 10 · 12 · 8 · 간격 8, 아래 선 1, 제목 14, 닫기 28 원 · 글리프 16, 본문 여백 12 · 간격 8, 안내 12, 격자 간격 8 · 세 열, 칸 반경 8 · 2:3 이
   `figma/components.measured.json` 의 `gallery-panel.panel` 과 같다.
2. 두 테마에서 면이 `bg-overlay` 이고 제목 · 닫기 · 안내가 그 면 위 4.5:1 을 넘는다.
3. 패널이 모달 상자를 덮는다(상자와 같은 사각형) — 숫자 z-index 없이.
4. Figma 되읽기에서 `GalleryPanel` 의 `rawFills` · `rawStrokes` 가 0 이다(parity 게이트).

1~3 은 `packages/react/test/gallery-panel.browser.test.tsx` 가 실브라우저에서 잰다.

## Known deviations

1. **제품이 아직 이 레시피를 물지 않는다.** 대응은 제품이 클래스를 바꿔 물 때 선다.
2. **칸 우물이 제품보다 옅다.** 제품 gray-600 40% 대신 잉크 8%(`accent-secondary`) — 그림이 오기 전의 빈 칸이라 면 위 한 단이면 된다(DS-D-0104).
3. **진입 애니메이션(`menuPopIn` 130ms)을 옮기지 않았다.** 움직임 토큰 회차에 Dialog 진입과 함께 정한다.

## Migration and changelog

2026-10-15 — 새 부품([DS-D-0104](../governance/decisions/DS-D-0104-gallery-panel.md)).
