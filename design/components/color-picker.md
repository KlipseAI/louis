---
id: color-picker
status: experimental
authority: normative
summary: 색 하나를 채도 · 밝기 면, 색조 · 불투명도 띠, 헥스 입력, 페이지 색 격자로 고릅니다. 면은 Popover 가 갖습니다.
---

# Color Picker

색 하나를 고르는 판이다(`.louis-color-picker`, [DS-D-0097](../governance/decisions/DS-D-0097-color-picker.md) · [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
[Menu / Popover](menu-popover.md) 의 면 안에 들어가는 **내용**이고, 여는 칩은 [Color Swatch](color-swatch.md) 다. 칩 옆에서 헥스만 고치면 되는 자리는 이 판이 아니라
Color Swatch + Text Field 다. 미리 정한 색조 중 하나를 고르는 섹션 노드 팔레트는 [Canvas Section](canvas-section.md) 의 짝 블록이다(DS-D-0093 판정 11).

제품 정본은 영상 편집기 인스펙터의 색 팝오버 `components/scenes/create/node-canvas-v2/nodes/ColorPopover.tsx:243-404`(통합 판 `54b62a8aa`)다.
호출부는 `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:15399` 하나, 트리거는 인스펙터 줄의 16 칩
(`components/scenes/create/node-canvas-v2/nodes/videoEditParts/OverlayInspector.tsx:659` · `:728` · `:755`)이다.

**있는 부품을 그대로 받는다.** 면은 `.louis-popover`(안쪽 6, LOUIS overlay 의 composite popover 로 띄운다), 닫기는 [Icon Button](icon-button.md) sm ghost +
`icon/x`, 스포이드 글리프는 `icon/eyedropper`. 이 부품이 소유하는 것은 2차원 면 · 띠 둘 · 입력 줄 · 색 격자다. Slider 의 변형이 아니다 — 띠가 색 공간이고
손잡이 칠이 「지금 색」이다.

```html
<!-- 트리거(인스펙터 줄) — color-swatch sm 칩이 판을 연다 -->
<span class="louis-color-swatch" data-size="sm">
  <button type="button" class="louis-color-swatch__chip" aria-label="글자 색"
          aria-haspopup="dialog" aria-expanded="true" aria-controls="cp-1"
          style="--louis-color-swatch-value: rgba(215, 38, 30, 0.6)"></button>
  D7261E 60%
</span>

<!-- 판 — 면은 louis-popover -->
<div class="louis-popover" id="cp-1" role="dialog" aria-label="글자 색" tabindex="-1" data-louis-state="open">
  <div class="louis-color-picker"
       style="--louis-color-picker-hue: rgb(255, 17, 0); --louis-color-picker-color: rgb(215, 38, 30);
              --louis-color-picker-saturation: 0.86; --louis-color-picker-brightness: 0.84; --louis-color-picker-alpha: 0.6">
    <div class="louis-color-picker__head">
      <button type="button" class="louis-icon-button" data-size="sm" data-variant="ghost" aria-label="닫기">
        <svg class="louis-icon-button__glyph" aria-hidden="true"><!-- icon/x --></svg>
      </button>
    </div>
    <div class="louis-color-picker__area" role="slider" tabindex="0" aria-label="채도와 밝기"
         aria-roledescription="2차원 슬라이더" aria-valuemin="0" aria-valuemax="100" aria-valuenow="86"
         aria-valuetext="채도 86%, 밝기 84%">
      <span class="louis-color-picker__area-thumb" aria-hidden="true"></span>
    </div>
    <div class="louis-color-picker__channels">
      <input type="range" class="louis-color-picker__channel" data-channel="hue"
             min="0" max="360" step="1" value="4" aria-label="색조" aria-valuetext="4°">
      <input type="range" class="louis-color-picker__channel" data-channel="alpha"
             min="0" max="100" step="1" value="60" aria-label="불투명도" aria-valuetext="60%">
    </div>
    <div class="louis-color-picker__fields">
      <button type="button" class="louis-color-picker__tool" aria-label="화면에서 색 집기">
        <svg aria-hidden="true"><!-- icon/eyedropper --></svg>
      </button>
      <label class="louis-color-picker__field" data-field="hex">
        <input class="louis-color-picker__input" value="D7261E" maxlength="6"
               aria-label="헥스" spellcheck="false" autocomplete="off">
      </label>
      <label class="louis-color-picker__field" data-field="alpha">
        <input class="louis-color-picker__input" type="number" min="0" max="100" value="60" aria-label="불투명도 퍼센트">
        <span class="louis-color-picker__suffix" aria-hidden="true">%</span>
      </label>
    </div>
    <p class="louis-color-picker__label" id="cp-1-page">이 페이지에서</p>
    <div class="louis-color-picker__swatches" role="group" aria-labelledby="cp-1-page">
      <button type="button" class="louis-color-picker__option" aria-label="FFFFFF"
              style="--louis-color-picker-option-value: #ffffff"></button>
      <button type="button" class="louis-color-picker__option" aria-label="D7261E 60%" aria-pressed="true"
              style="--louis-color-picker-option-value: rgba(215, 38, 30, 0.6)"></button>
    </div>
  </div>
</div>
```

인라인 `style` 의 `rgb()` · `rgba()` · `#ffffff` 는 **사용자 데이터**라 레시피의 원시 색 규칙 대상이 아니다.
계산값: 판 256(면 268 = 판 + 안쪽 6 × 2) · 칸 사이 12, 면 256 × 220, 띠 요소 14 · 띠 12 · 사이 8, 입력 줄 28, 격자 28 칸 여섯 열(칸 사이 17.6).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/color-picker.css` · 실브라우저 시험 `color-picker.browser.test.tsx`. React 표면은 없다 — 끌기 · 2차원 면 키보드 · 색 변환 · 열고 닫기는 소비처가 클래스와 마크업 계약을 문다(DS-D-0097) |
| Figma         | `done`      | 2026-10-14 — 칸 `ColorPickerOption` 세트(Selected `false` · `true` — 코드 `aria-pressed`, 값 아래 체크무늬 · 고른 칸 링은 펼침 그림자 두 겹)와 판 `ColorPicker`(BOOLEAN `Eyedropper` · `Swatches`, TEXT `Label` · `Hex` · `Alpha`, 면 그라디언트 · 색조 띠 정지점이 `color/spectrum-*` 에 묶인다, 색 값은 시드 FF0000 60%), 예시 보드 하나(인스펙터 팝오버 268 × 426 — 면 `bg-menu` · 안쪽 6). 닫기는 `IconButton` ghost sm + `icon/x`, 스포이드는 `icon/eyedropper` 인스턴스다. 기록 `color-picker` · `color-picker-option` 과 parity 기하 계약, 실브라우저 되재기(`color-picker-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## When to use

- 임의의 색 하나(불투명도 포함)를 고를 때 — 글자 색 · 테두리 색 · 배경처럼 값이 연속인 자리. 트리거 칩 하나에 판 하나.
- 이름 있는 몇 가지 색조 중 하나를 고르는 자리는 이 판이 아니다 — 섹션 노드면 [Canvas Section](canvas-section.md) 팔레트, 일반 고르기면 [Segmented Control](segmented-control.md) ·
  라디오다.
- 헥스만 바로 고치면 되는 표 칸 · 필드는 [Color Swatch](color-swatch.md) + Text Field 다.

## Anatomy

1. 머리(`__head`) — 닫기(Icon Button sm ghost) 하나, 오른쪽.
2. 면(`__area`) — 폭 채움 × 220 · 반경 10(`radius-overlay-item`). 가로 채도 · 세로 밝기, 바탕은 지금 색조, 위에 흰 → 투명(가로) · 검정 → 투명(세로) 두 겹.
3. 표식(`__area-thumb`) — 14 원 · 흰 고리 2 · 바깥 검정 56% 헤어라인 + 그림자. 칠은 지금 색. 자리는 물리 좌표(`left` · `top`)라 RTL 에서도 뒤집지 않는다.
4. 띠(`__channels` > `__channel`) — 색조 · 불투명도 네이티브 range, 띠 12 알약 · 손잡이 14 · 사이 8. 정지점을 손잡이 반지름 7 만큼 안으로 당긴다.
5. 입력 줄(`__fields`) — 스포이드(`__tool`, 28 원 · 글리프 16) · 헥스(`__field[data-field="hex"]`, 남는 폭) · 불투명도(`__field[data-field="alpha"]`, 64 · `__suffix` `%`).
   높이 28(`layout-inspector-control-height`) 알약 · 사이 6 · 면 잉크 4%.
6. 라벨(`__label`) · 격자(`__swatches` > `__option`) — caption medium `fg-tertiary`, 28 칸 여섯 열 양 끝 정렬 · 줄 사이 6, 칸은 반경 4 · 경계 `stroke-strong` · 값 아래 체크무늬.

## Properties

| 이름 | 종류 | 기본값 | 뜻 |
| --- | --- | --- | --- |
| `--louis-color-picker-hue` | 색 | `color-spectrum-red` | 지금 색조의 순색(채도 1 · 밝기 1) — 면 바탕 · 색조 손잡이 |
| `--louis-color-picker-color` | 색 | `color-spectrum-white` | 지금 색(불투명) — 표식 · 알파 띠 끝 |
| `--louis-color-picker-saturation` · `-brightness` | 수 0~1 | `0` · `1` | 표식 자리 |
| `--louis-color-picker-alpha` | 수 0~1 | `1` | 불투명도 손잡이 칠 |
| `--louis-color-picker-option-value` | 색 | `transparent` | 칸 칠(칸마다 인라인) |
| `__channel` `data-channel` | `hue` · `alpha` | — | 띠 종류 |
| `__field` `data-field` | `hex` · `alpha` | — | 입력 종류 |
| `__option` `aria-pressed` | `true` | — | 지금 값과 같은 칸 — 면색 틈 1 + 주색 링 2 |

색조 · 알파 띠의 손잡이 자리는 변수가 아니다 — range 의 `value` 가 정한다.

### 값은 소비처가 준다

색 변환(HSV · 헥스 · 알파 합성)과 포인터 끌기는 레시피가 할 수 없다. 레시피는 그 결과를 변수로 받아 그린다. 소비처가 갖는 행동:

1. 열고 닫기 · 자리 — LOUIS overlay 의 composite popover(트리거 왼쪽 12, 넘치면 오른쪽, 위 정렬). 바깥 누름 · Esc 닫기 · 트리거 복귀는 overlay 가 진다. 대화 안에서 열면
   같은 overlay branch 에 등록한다 — 숫자 z-index 를 쓰지 않는다.
2. 면 끌기 — `pointerdown` 에서 `setPointerCapture`, 좌표를 면 상자로 나눠 채도 · 밝기를 셈한다. 키보드는 Accessibility 표.
3. 헥스 — 대문자 6자리, Enter · blur 에 확정, 틀리면 직전 값으로 되돌린다.
4. 스포이드 — `window.EyeDropper` 가 있는 브라우저에서만 그린다. 취소는 조용히 무시.
5. 「이 페이지에서」 — 중복 제거 · 최대 24. 칸을 누르면 그 색 · 알파를 그대로 넣는다.

### 트리거 — Color Swatch 의 변형

판을 여는 칩은 [Color Swatch](color-swatch.md) `data-size="sm"` 의 `<button>` 칩이다 — 아래 체크무늬, 호버 테두리 `fg-tertiary`, 누름 0.96.
`aria-haspopup="dialog"` · `aria-expanded` · `aria-controls` 와 무엇의 색인지 말하는 이름을 단다.

## States

| 상태 | 무엇이 보이나 |
| --- | --- |
| 입력 칸 입력 중 | 면 4 → 8%(두 테마) |
| 스포이드 hover | 면 4 → 8% · 잉크 secondary → primary(호버 기기만) |
| 칸 hover | 1.08 배(호버 기기만) |
| 지금 값 칸 | 면색 틈 1 + 주색 링 2(`aria-pressed="true"`), 캔버스 범위면 틈이 `canvas-menu-surface` |
| 줄인 모션 | 전환 0 · 칸 확대 없음 |
| 강제 색 | 데이터 색(면 · 띠 · 칸)은 그대로, 면 · 칸 경계 CanvasText 실선, 지금 값 칸 Highlight 링, 입력 칸 · 스포이드 currentColor 테두리 |

## Content

- 격자 라벨은 출처를 말한다(「이 페이지에서」). 칸은 최대 24, 중복 없음.
- 칸 이름은 헥스 라벨(「D7261E 60%」)이다. CSS 문자열(「rgba(239, 68, 68, 0.16)」)을 이름으로 쓰지 않는다.
- 판의 이름은 무엇의 색인지 말한다(「글자 색」 · 「테두리 색」 · 「배경」).
- 스포이드는 지원 브라우저에서만 보인다 — 없는 자리를 비워 두지 않는다(헥스가 넓어진다).

## Accessibility

- 면은 Menu / Popover 의 composite-popover 계약 — 비모달 `dialog` · 이름 필수 · 초기 포커스 면(`tabindex="-1"`) · 자연 Tab 순서 · Esc 와 바깥 누름으로 닫고 트리거로 복귀.
- 트리거는 `aria-haspopup="dialog"` · `aria-expanded` · `aria-controls`.
- 포커스 링은 그리지 않는다(DS-D-0074). 입력 칸은 면 8% 로, 강제 색에서는 칸의 Highlight 링으로 말한다.
- 칸 경계 `stroke-strong` 은 어떤 값에서도 놓인 면 대비 3:1 을 넘는다. 라벨 · `%` 는 `fg-tertiary`(4.5:1 이상).

| 자리 | 계약 |
| --- | --- |
| 2차원 면 | `role="slider"` · `tabindex="0"` · 이름 · `aria-roledescription` · `aria-valuetext`(채도 · 밝기 둘 다). ←/→ 채도 ±1% · ↑/↓ 밝기 ±1% · Shift 와 함께 ±10% · Home/End 채도 0/100 · PageUp/PageDown 밝기 ±10%. 표식은 `aria-hidden` |
| 띠 | `<input type="range">` · `data-channel="hue"`(0~360) · `"alpha"`(0~100) · 이름 · `aria-valuetext`. 방향키 · Home/End · PageUp/Down 은 브라우저 것 |
| 스포이드 | `<button>` · 이름 |
| 헥스 · 불투명도 | `<input>` · 이름. `%` 는 `aria-hidden`(이름이 퍼센트를 말한다) |
| 격자 | `role="group"` + 라벨 연결, 칸은 누르면 적용하는 `<button>`, 지금 값 칸에 `aria-pressed="true"` |

## Acceptance tests

`packages/react/test/color-picker.browser.test.tsx` 가 클래스 마크업을 `.louis-popover` 안에서 실브라우저로 렌더해 잰다.

1. 치수 — 판 256 · 면 256 × 220 · 반경 10 · 띠 요소 14 · 띠 12 · 입력 28 · 스포이드 28 · 알파 칸 64 · 칸 28 · 사이 12 / 8 / 6, 면 바깥 폭 268.
2. 표식 — saturation 0.25 · brightness 0.75 에서 표식 중심이 면 (25%, 25%).
3. 색 공간 — 면의 네 모서리가 흰 · 지금 색조 · 검정 · 검정(캡처 픽셀), 색조 띠는 손잡이 중심 자리의 색이 그 값의 색조다(`in srgb`).
4. 대비는 실제로 잰다(`fixtures/contrast.ts`, 두 테마) — 라벨 · `%` ≥ 4.5, 칸 경계 ≥ 3, 표식 헤어라인 흰 바닥 ≥ 3.
5. 지금 값 칸 링 — 틈의 색이 면(`bg-menu`, 캔버스 범위면 `canvas-menu-surface`)과 같다.
6. 격자 — 여섯 열 양 끝 정렬(첫 칸 왼 끝 = 판 왼 끝, 여섯째 칸 오른 끝 = 판 오른 끝).
7. 줄인 모션 · 강제 색 — 칸 `transition-duration` 0, `forced-color-adjust` 가 면 · 띠 · 칸에서 `none`. 호버 규칙은 모두 `@media (hover: hover)` 안.
8. z-index — 레시피의 어떤 요소도 z-index 를 선언하지 않는다.
9. Color Swatch 트리거 — sm `<button>` 칩 16 · 반경 4, 반투명 값 아래 체크무늬가 비친다, 누름 0.96.

## Known deviations

제품 대비 바뀌는 것(DS-D-0097 판정 4 · 5 · 7 · 8 · 9 · 11):

1. 면이 내용 폭을 채운다 — 제품 220 정사각이 왼쪽에 붙어 오른쪽 36 이 비었다.
2. 띠의 손잡이는 네이티브라 중심이 7 ~ 폭−7 을 간다(제품은 0 ~ 폭). 띠 정지점을 같은 만큼 당겨 색과 자리는 맞지만 양 끝의 7 이 단색이다.
3. 흰 겹이 `color-spectrum-white`(FFFFFF)다 — 제품 `palette-gray-000`(FAFAFA)은 채도 0 · 밝기 1 을 헥스 칸과 다른 색으로 그렸다.
4. 체크무늬가 테마 잉크 16% 와 투명이다 — 제품 다크 두 톤 차 1.08 은 무늬가 거의 안 보였다. 격자 칸에도 깐다(제품은 없었다).
5. 라벨 · `%` 가 `fg-tertiary`, 칸 경계가 `stroke-strong`, 표식 헤어라인이 56% 다(대비 미달 고쳐 올림).
6. 칸 호버가 1.08 배(제품 위로 1), 격자가 양 끝 정렬(제품 칸 사이 15.67 → 17.6).
7. 닫기 글리프 12 → 16(Icon Button sm), 스포이드 글리프 15 → 16 · 인라인 SVG → `icon/eyedropper`.
8. 열림 모션은 overlay 의 popover 토큰을 따른다 — 제품 260ms 불투명도(`popoverOpen`)와 다르다.
9. 2차원 면의 키보드는 소비처가 짠다(레시피는 계약만).

## 제품에서 발견한 것

1. **키보드로 조작할 수 없다.** 면 · 색조 · 알파가 `role="slider"` + `tabIndex={0}` 인데 키 처리가 없다(`ColorPopover.tsx:641-712`). 포커스는 가는데 값이 안 바뀐다.
   면은 `aria-valuenow` 가 밝기 하나뿐이다(`ColorPopover.tsx:647`).
2. **대화에 이름이 없고 열어도 포커스가 옮지 않는다**(`ColorPopover.tsx:626`). 트리거에 `aria-haspopup` · `aria-expanded` 가 없다(`ColorPopover.tsx:75-87`).
3. **라이트 덮개가 상태를 이긴다** — 호버 테두리 · 입력 포커스 면이 라이트에서 서지 않는다(파일 머리 주석이 스스로 적었다, `ColorPopover.tsx:13-21`).
4. **대비 미달** — 「이 페이지에서」 라벨 3.19 · 3.37(`ColorPopover.tsx:382`), `%` 입력 면 위 2.93 · 3.14(`ColorPopover.tsx:375`), 칸 경계 1.88 · 1.31
   (`ColorPopover.tsx:402-403`), 표식 헤어라인 흰 바닥 2.23(`ColorPopover.tsx:297`).
5. 면이 220 정사각이라 256 폭 띠 · 입력과 오른쪽 끝이 36 어긋난다(`ColorPopover.tsx:423`). 격자 칸이 1fr 열 안에서 왼쪽에 붙는다(`ColorPopover.tsx:389`).
6. 표식이 면 가장자리에서 잘린다(`overflow-hidden`, `ColorPopover.tsx:280`). 흰 겹이 `#fafafa` 라 채도 0 · 밝기 1 이 FFFFFF 가 아니다(`ColorPopover.tsx:286`).
7. 색 칸 이름이 CSS 문자열이다(`ColorPopover.tsx:783`).
8. 숫자 z-index `z-[10300]`(`ColorPopover.tsx:252`), 창 전역 캡처 리스너로 바깥 누름 · Esc 를 잡는다(`ColorPopover.tsx:511-534`).
9. 칸 · 스포이드 호버에 `(hover: hover)` 가드가 없다(`ColorPopover.tsx:395` · `:330`).
