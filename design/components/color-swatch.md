---
id: color-swatch
status: experimental
authority: normative
summary: 색 값 하나를 칩으로 보이고, 누르면 고르게 합니다.
---

# Color Swatch

색 값 하나의 칩이다(`.louis-color-swatch`, [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
누르면 브라우저 색 고르개가 열리고(`<input type="color">`), 읽기 전용이면 값만 보인다.
값 옆에 헥스를 적어 고치게 하려면 [Text Field](text-field.md) md 를 칩 옆에 끼운다.
팔레트에서 미리 정한 색 중 하나를 고르는 것은 이 부품이 아니다 — 그것은 고르기 컨트롤이다.
sm `<button>` 칩은 [Color Picker](color-picker.md) 판을 여는 트리거다(DS-D-0097).

제품 정본은 두 화면의 사본 셋이다(통합 판 `54b62a8aa`) — 어드민 자막 템플릿 모달의 필드 옆 32 칩(`CaptionTemplateManagement.tsx:333-353`)과
표 칸 16 칩(`CaptionTemplateManagement.tsx:971-975`), 하이라이트 숏츠 편집 모달 자막 색 패널의 라벨 위 30 칩 · 빈 칸 · 지우기
(`app/highlight/[projectId]/shorts/[shortId]/CaptionColorPanel.tsx`, `Swatch` 함수 171~223줄).

```html
<!-- 필드 옆 칩 + 헥스 -->
<div class="louis-color-swatch">
  <input type="color" class="louis-color-swatch__chip" value="#ffffff" aria-label="배경">
  <div class="louis-text-field" data-size="md">
    <div class="louis-text-field__box">
      <input class="louis-text-field__control" value="#FFFFFF" aria-label="배경 헥스">
    </div>
  </div>
</div>

<!-- 표 칸 읽기 전용 -->
<span class="louis-color-swatch" data-size="sm">
  <span class="louis-color-swatch__chip" style="--louis-color-swatch-value: #000000"></span>
  #000000
</span>

<!-- 라벨 위 칩 · 지우기 / 빈 칸 -->
<label class="louis-color-swatch" data-layout="stack">
  <span class="louis-color-swatch__label">배경</span>
  <span class="louis-color-swatch__frame">
    <input type="color" class="louis-color-swatch__chip" value="#000000">
    <button type="button" class="louis-color-swatch__clear" aria-label="배경 색 지우기"><svg aria-hidden="true">…x…</svg></button>
  </span>
</label>
<div class="louis-color-swatch" data-layout="stack">
  <span class="louis-color-swatch__label">테두리</span>
  <button type="button" class="louis-color-swatch__chip" data-empty="true" aria-label="테두리 색 더하기"><svg aria-hidden="true">…plus…</svg></button>
</div>
```

| 부분 | 값 |
| --- | --- |
| 칩 md(기본) | 32 × 32 · 반경 8(`radius-control-sm`) · 테두리 1 `stroke-strong` · 안쪽 0. 브라우저 견본 틀(안쪽 여백 · 회색 선)을 걷는다 |
| 칩 sm | 16 × 16 · 반경 4 — 읽기 전용(`<span>`) 또는 Color Picker 를 여는 `<button>`(`aria-haspopup="dialog"` · `aria-expanded`). 칠은 `--louis-color-swatch-value` |
| 체크무늬 | 칩 칠 아래 8 칸 타일(잉크 16% · 투명) — 알파가 있는 값이 비친다. 불투명 값은 덮어서 보이지 않는다 |
| 한 줄 | 칩 ↔ 헥스 필드 · 값 글자 사이 6. 헥스 필드는 Text Field md(32)라 칩과 높이가 같다 |
| stack | 라벨 위 칩 · 사이 4 · 최소 폭 44. 라벨 caption regular `fg-tertiary` |
| 빈 칸 | 점선 · 투명 면 · `icon/plus` 16 `fg-tertiary` |
| 지우기 | 16 원 · 칩 모서리 밖 6 · 면 `fg-primary` · 글리프 `icon/x` 10 `bg-surface`. 누르는 자리 24 |

**경계는 값과 무관하게 3:1 을 넘는다.** 흰 값은 라이트 면에서, 검정 값은 다크 면에서 경계만 남는다 — 그래서 테두리가 `stroke-strong` 이다.
**칠은 데이터다.** 칩 칠에 토큰을 걸지 않는다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/color-swatch.css`. React 표면은 없다 — 소비처가 클래스를 물면 된다 |
| Figma         | `done`      | 2026-10-13 — `ColorSwatch` — Layout(row · stack) × Size(md · sm) × Content(filled · empty) × State(Default · Hover · Active — 2026-10-14) 열세 칸, BOOLEAN Clear, TEXT Label · Value. filled 칩 안에 체크무늬 바탕(반투명 값이 비친다)이 있고 Active 의 0.96 축소는 그리지 않는다. 칩 칠은 사용자 색이라 예시 색을 변수에 묶었다(시드). row 는 Figma TextField 의 위아래 4 때문에 높이 40(CSS 32). 기하 계약 · 기록은 열세 칸 전부를 건다(2026-10-14 — 상태 칸은 칸 기하가 Default 와 같다), 실브라우저 시험은 `small-parts-geometry.browser.test.tsx` — 2026-10-14 기하 계약 · 실측 · 되재기로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| 루트 `data-size` | 없음 · `md`(기본 32) · `sm`(16, 읽기 전용 또는 판 트리거) | 칩 크기 |
| 루트 `data-layout` | 없음(한 줄) · `stack`(라벨 위) | 배치 |
| 칩 `data-empty` | `true` | 점선 + 더하기. 누르면 소비처가 기본 색을 넣는다 |
| `--louis-color-swatch-value` | 색 | 읽기 전용 칩의 칠 |
| `__frame` · `__clear` | — | 지우기가 있을 때만 칩과 지우기를 묶는다 |

## States

| 상태 | 그림 |
| --- | --- |
| 값 있음 | 칩 전체가 값으로 칠해지고 `stroke-strong` 선이 두른다 |
| 빈 칸 | 점선 · 가운데 더하기 |
| 지우기 있음 | 칩 오른쪽 위 모서리에 16 원이 걸친다 |
| 반투명 값 | 칩 아래 체크무늬가 비친다 |
| hover(누르는 칩) | 테두리 `stroke-strong` → `fg-tertiary`(호버 기기만) |
| active(`<button>` 칩) | 0.96 배. 줄인 모션에서는 전환 0 |

## Content

- 라벨은 무엇의 색인지다(「글자」 · 「배경」 · 「테두리」). 값은 칩과 헥스 필드가 말한다.
- 읽기 전용 칩 옆 글자는 값 그대로(`#000000`)다.

## Accessibility

- 칩의 접근 이름은 무엇의 색인지다(「배경」). 값은 브라우저가 읽는다. stack 이면 `<label>` 로 라벨과 칩을 묶는다.
- 빈 칸의 이름은 「배경 색 더하기」, 지우기의 이름은 「배경 색 지우기」다 — 제품의 「배경 ✕」 같은 기호 이름은 쓰지 않는다.
- 지우기를 누르면 초점을 빈 칸(같은 자리)으로 옮긴다 — 지우기 단추가 사라지면서 초점이 문서 밖으로 빠지지 않게. 이 일은 소비처 몫이다.
- 지우기 누르는 자리는 24 — WCAG 2.5.8 AA 최소다. 44 는 칩의 오른쪽 위 사분면을 덮어 칩을 누르려던 손이 값을 지운다.
- 대비(실브라우저 실측, `bg-surface` 위): 칩 경계 · 빈 칸 점선 라이트 4.43 · 다크 3.74, 라벨 6.44 · 5.25, 지우기 글리프 16.54 · 16.54.

## Acceptance tests

`packages/react/test/color-swatch.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — md 칩 32 · 반경 8 · 테두리 1 · 안쪽 0 과
헥스 필드 높이 · 사이 6, sm 16 · 반경 4 · 소비처 칠, stack 의 라벨 아래 4 · 최소 폭 44, 지우기 16 원 · 모서리 밖 6 · 누르는 자리 24
(원 밖 3px 은 받고 5px 은 받지 않는다), 빈 칸 점선 · 더하기 16, 두 테마의 칩 경계 3:1 · 라벨 · 지우기 글리프 4.5:1.
판 트리거(sm `<button>` 칩의 체크무늬 · 호버 테두리 · 누름 0.96)는 `color-picker.browser.test.tsx` 가 잰다.

## Known deviations

1. **크기 · 반경 · 경계를 하나로 모았다.** 제품 패널 30 · 반경 6 · `fg-tertiary` 선, 어드민 32 · 반경 8 · `stroke-control` 안쪽 그림자를
   md 32 · 8 · `stroke-strong` 테두리 하나로. 어드민 칩 테두리가 진해지는 보이는 변화다(DS-D-0084 「작은 새 부품」 판단 5).
2. **경계 대비를 고쳤다.** 제품 `stroke-control` 은 `bg-surface` 위 라이트 1.27 · 다크 1.63 이라 흰 값 · 검정 값 칩이 사라진다
   (`CaptionTemplateManagement.tsx:85`). `stroke-default` 도 3:1 미만이라 `stroke-strong` 이다.
3. **지우기 15 원을 16 + 히트 24 로**, 글자 「×」 11px 을 SVG 글리프 10 으로 바꿨다. AAA 44 는 칩을 덮어서 쓰지 않는다.
4. **stack 사이 3 을 4 로**, 더하기 14 를 아이콘 사다리 16 으로 접었다.

## 제품에서 발견한 것

- 세 사본이 크기(32 · 30 · 16) · 반경(8 · 6 · 4) · 경계(안쪽 그림자 `stroke-control` · 테두리 `fg-tertiary`)에서 이미 갈렸다.
- 두 화면 모두 `::-webkit-color-swatch-wrapper` · `::-webkit-color-swatch` 를 걷지 않았다 — Chromium 기본 안쪽 여백과 회색 견본 선이 칩 안에 남는다.
- 패널 지우기의 접근 이름이 「배경 ✕」다(`Swatch` 함수의 `aria-label`).
- 어드민 쪽 고침은 어드민 작업 브랜치가 끝난 뒤에 한다(DS-D-0084 「작은 새 부품」 판단 7).
