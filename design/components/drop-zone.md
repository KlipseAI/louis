---
id: drop-zone
status: experimental
authority: normative
summary: 파일을 받는 큰 눌림 면입니다. 누르면 파일 선택 창이 열리고, 끌어다 놓아도 받습니다.
---

# Drop Zone

파일을 받는 큰 눌림 면이다. 누르면 파일 선택 창이 열리고, 파일을 끌어다 놓아도 받는다.

**제품에 공용 구현이 없다(제품 앵커 `2c6bdacf`).** 하이라이트 두 화면 — 허브(`HighlightScene.tsx`)와 프로젝트 상세의
업로드 대기(`HighlightProjectScene.tsx`) — 가 `highlightSceneStyles.ts` 의 `uploadDropZone` 지역 레시피를 쓴다. 그 면은
이름과 달리 **끌어다 놓기를 받지 않는다** — 누르면 숨긴 `input[type=file]` 을 여는 `<button>` 이다. 그리고
`:focus-visible` 에서 outline 을 지운다. 이 컴포넌트는 그 레시피의 기하(패딩 · 간격 ·
반경 · 글리프 · 글자 크기)를 옮기고, 끌어다 놓기를 계약으로 더한다. 포커스 링은 그리지 않는다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)). [gap registry](../../migration/figma-gap-registry.md)의
「영상 업로드 드롭존」 · 「업로드 드롭존 버튼」 두 줄이 이 자리다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 10건이 두 motion context에서 각각 돈다. 제품은 아직 이 컴포넌트를 쓰지 않는다 — 지역 레시피다(Known deviations) |
| Figma         | `done`         | component set(State 4 — Focus 는 전역 링이 소유해 Button 처럼 variant 로 두지 않는다). 계약이 모든 property 를 pin 하고 Graphic · Prompt · Caption 을 자손으로 대조한다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다 |

## When to use

- 화면의 **주된 일이 파일을 올리는 것**일 때 — 업로드 대기 화면, 가져오기 첫 단계.
- 끌어다 놓기가 자연스러운 큰 파일(영상 · 이미지 묶음).

쓰지 않는 자리.

- 폼 안의 한 칸으로 파일을 붙일 때. 그것은 파일 필드(버튼 + 파일 이름)다 — 큰 면이 폼의 흐름을 끊는다.
- 편집기 타임라인 · 캔버스처럼 **작업 표면 전체**가 놓는 자리일 때. 그 자리는 표면이 끌어다 놓기를 받고 이 면을 따로
  두지 않는다.

## API

```tsx
<DropZone
  graphic={<UploadGlyph />}
  prompt="긴 영상을 올리세요."
  caption="올린 원본 영상은 30일 동안 보관합니다."
  accept="video/*"
  onFiles={(files) => upload(files[0])}
/>
```

## Anatomy

1. **Root** — `<button type="button">`. 면 · 패딩 · 상태를 소유하고, 안의 글자가 접근성 이름이 된다.
2. **Graphic** — 선택. 56px. 장식이라 `aria-hidden` 이다.
3. **Prompt** — 무엇을 올리는지 한 문장.
4. **Caption** — 선택. 올리기 전에 알아야 할 조건.
5. **Input** — 숨긴 `input[type=file]`. 루트의 형제로 렌더하고 탭 순서 · 접근성 트리에서 빠진다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `prompt` | ReactNode | 필수 | 무엇을 올리는지. 면의 접근성 이름이 된다 |
| `caption` | ReactNode | 없음 | 보존 기간 · 용량 · 형식 같은 조건 |
| `graphic` | ReactNode | 없음 | 56px 글리프 |
| `accept` | string | 없음 | 선택 창이 거를 형식 — `input` 의 `accept` 그대로 |
| `multiple` | boolean | `false` | 여러 파일을 받는가. 아니면 놓은 파일 가운데 첫 것만 준다 |
| `onFiles` | `(files: readonly File[]) => void` | 필수 | 선택 창과 끌어다 놓기가 **같은 콜백**으로 온다 |
| `disabled` | boolean | `false` | 누름도 놓기도 받지 않는다 |

**끌어다 놓은 파일은 `accept` 로 거르지 않는다.** 브라우저가 `accept` 를 선택 창에서만 적용하기 때문이다. 형식 검사는
받은 쪽이 한 곳에서 한다 — 두 경로가 같은 콜백으로 오는 이유가 그것이다.

## States

| state | 표현 |
| --- | --- |
| Default | 면 `color-accent-secondary`, 안내 `color-fg-primary`, 보조 `color-fg-tertiary` |
| Hover | 면 `color-accent-secondary-hover` |
| Focus | **그리지 않는다**(DS-D-0074). 강제 색에서만 `base.css` 의 `Highlight` 링 |
| DragOver | 면 `color-accent-secondary-hover` + 안쪽 링 `color-stroke-focus`(`border-width-ring` 두께의 안쪽 그림자) |
| Disabled | 면 `color-bg-inset`, 글자 `color-fg-disabled`, 커서 `not-allowed` |

DragOver 의 링은 테두리가 아니라 **안쪽 그림자**다 — 테두리를 그리면 두께만큼 상자가 커져 끌어다 놓는 순간 화면이 흔들린다.

## Interaction and responsive behavior

- 누르거나 Enter · Space 로 파일 선택 창이 열린다. **끌어다 놓기만으로는 키보드 사용자가 닿지 못하므로 면은 늘 버튼이다.**
- 끌어다 놓는 동안 `data-drag-over="true"` 다. 파일이 아닌 것(글자 · 링크)을 끌면 상태가 바뀌지 않는다.
- 자식 요소를 지날 때 `dragenter` · `dragleave` 가 짝으로 쏟아진다 — 깊이를 세어 마지막으로 나갈 때만 상태를 푼다.
  그렇지 않으면 안내 글자 위를 지나는 순간 면이 깜빡인다.
- 폭은 부모를 채운다(`inline-size: 100%`). 높이는 내용과 패딩이 정한다.

## Content

- 안내는 **무엇을** 올리는지 말한다 — "파일을 끌어다 놓거나 누르세요" 같은 조작 설명은 쓰지 않는다. 면이 버튼이라는 것은
  모양이 이미 말한다.
- 보조 문구는 올리기 **전에** 알아야 할 것만 쓴다. 올린 뒤의 안내는 다음 화면의 몫이다.

## Accessibility

- 루트가 `<button>` 이라 포커스 · 누름 · 이름을 기본으로 갖는다. 이름은 안내 + 보조 문구다.
- 숨긴 입력은 `hidden` · `tabIndex=-1` · `aria-hidden` 이다 — 두 번 읽히거나 탭이 두 번 멈추지 않는다.
- 글리프는 장식이다.
- 포커스 링은 그리지 않는다(DS-D-0074). 끌어다 놓기의 안쪽 링은 포커스가 아니라 「여기에 놓인다」이므로 남는다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 세로 패딩 | 56px | 리터럴 — 소비처가 하나뿐이라 한 줄에 격리했다 |
| 가로 패딩 | 16px | `space-layout-gutter` |
| 간격 | 12px | `space-stack-md` |
| 반경 | 12px | `radius-card` |
| 테두리 | 0 | — |
| 글리프 | 56px | 리터럴 — 아이콘 계단에 56 이 없다 |
| 안내 | 16 / 24 | `typography-body-md-regular` |
| 보조 | 12 / 18 | `typography-caption-regular` · 최대 폭 `36ch` |

수는 [`components.measured.json`](../../figma/components.measured.json)의 `drop-zone` 이 갖는다.

## Effects

DragOver 의 안쪽 링 하나뿐이다. 그림자 · 흐림은 없다.

## Implementation

- 면 색은 LOUIS 의 **눌림 면 역할**(`accent-secondary` · `-hover`)이다 — Button secondary · 메뉴 항목과 같은 가족이라
  같은 화면에서 한 벌로 읽힌다.
- 파일 입력을 같은 파일로 다시 골라도 `change` 가 오도록 받은 뒤 값을 비운다.

## Known deviations

- **제품은 이 컴포넌트를 쓰지 않는다 — 지역 레시피다.** 그래서 화면 보드의 두 업로드 면은 인스턴스가 아니라 bespoke 로
  판정된다(`scripts/lib/figma-component-substitution.mjs` 의 제외 목록 `drop-zone-upload`). 제품이 이 컴포넌트로 옮기면
  보드가 인스턴스가 된다.
- **면 색이 제품과 다르다.** 제품은 라이트에서 `palette-gray-100`(#DCDEE1) · 호버 `palette-gray-150`(#CED0D4)을 직접 쓴다.
  LOUIS 에는 그 값과 같은 일반 역할 토큰이 없어 눌림 면 역할을 골랐다(라이트 잉크 8% · 12%). 안내 글자도 제품은
  `palette-gray-800`(#2B2F36)이고 LOUIS 는 `color-fg-primary` 다. 보조 문구 색(`fg-tertiary`)은 같다.
- **제품 면은 끌어다 놓기를 받지 않고 포커스가 보이지 않는다.** 이 컴포넌트는 둘 다 한다 — 제품의 결함을 옮기지 않았다.
- **제품의 썸네일 미리보기 변형(`uploadDropZoneWithThumb`)과 허브 하단 고정 카드의 2열 배치는 옮기지 않았다.** 둘 다 올린
  **뒤**의 화면(미리보기)이거나 한 화면의 배치라, 면의 계약이 아니다.

## Acceptance tests

1. 패딩 · 간격 · 반경 · 테두리 · 글리프 · 글자 크기가 `components.measured.json` 과 같다.
2. Default · Hover 의 면과 글자 색이 States 표와 같다.
3. 누르면 숨긴 파일 입력의 선택 창이 열린다.
4. 선택 창에서 고른 파일이 `onFiles` 로 온다.
5. 끌어다 놓은 파일이 `onFiles` 로 오고, 끄는 동안만 `data-drag-over="true"` 이며 자식을 지나도 깜빡이지 않는다.
6. `multiple` 이 아니면 첫 파일만, 이면 모두 준다.
7. `disabled` 면 누름 · 놓기를 받지 않고 Disabled 의 면 · 글자로 보인다.
8. 키보드 포커스가 링으로 보인다.
9. 글리프는 `aria-hidden` 이고 안내가 이름이 된다.
10. 조합 모두 자동 접근성 검사에 위반이 없다.
