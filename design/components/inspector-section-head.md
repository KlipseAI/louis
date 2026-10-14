---
id: inspector-section-head
status: experimental
authority: normative
summary: 인스펙터 절의 머리 한 줄이며 제목과 값 힌트·조작을 두 덩어리로 세웁니다.
---

# Inspector Section Head

인스펙터 절의 **머리 한 줄**. 제목이 왼쪽, 값 힌트와 조작 아이콘이 오른쪽 묶음에 선다.
[Inspector Row](inspector-row.md)와 한 문법이며 절은 이 머리 하나와 행 여럿으로 이뤄진다.

**존재 이유가 통일이다.** 정본에서는 인스펙터 넷과 효과 절이 각자 머리를 적고 있었고
효과 절만 제목이 한 단계 크고 밑줄이 있어 혼자 달라 보였다. 한 벌로 모아 **선택 대상이
바뀌어도 절 머리가 같게** 만든다. 그래서 밑줄이 없는 것이 계약이다.

## Availability

| Surface       | 상태           | 근거                                                    |
| ------------- | -------------- | ------------------------------------------------------- |
| Web           | `partial`      | `packages/css/src/component/inspector-row.css` (React 표면 없음) |
| Figma         | `done`      | component set `InspectorSectionHead` (2 variant) — 2026-10-14 되재기 시험 `inspector-row-geometry.browser.test.tsx` 로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서                                                 |
| Maturity      | `experimental` | 소비처가 붙고 절 사이 구분선 계약이 서면 beta           |

## When to use

- 속성 패널의 한 절을 열 때. 절마다 하나이며 절 안에 둘을 두지 않는다.
- 오른쪽 조작은 **그 절에 실제로 있는 것만** 받는다. 디자인에 그려졌다는 이유로 없는
  기능을 만들지 않는다.

쓰지 않는 자리:

- 화면 제목 — 그것은 페이지 머리이지 절 머리가 아니다.
- 접히는 절의 손잡이 — 이 머리는 펼침 상태를 갖지 않는다.

## Anatomy

1. **Head** — 가로 한 줄. 아래 여백 4 · 사이 간격 12.
2. **Title** — 남는 자리를 먹고 한 줄로 잘린다.
3. **Tail** — 오른쪽 묶음. 안쪽 사이 간격 8.
4. **Meta** — 값 힌트(개수 · 현재 값).
5. **Action** (`Action=Icon`) — 24 정사각 · 반경 8. 안에 16 글리프.

## Properties

| Property      | 값             | 기본값 | 설명                              |
| ------------- | -------------- | ------ | --------------------------------- |
| `Action`      | None \| Icon   | `None` | 오른쪽 조작의 유무. 구조 축이다.  |
| `Title`       | 텍스트         | `변형` | 절 제목                           |
| `Meta`        | 텍스트         | `3개`  | 제목 오른쪽의 값 힌트             |
| `ActionGlyph` | 아이콘 교체    | `plus` | 조작 글리프. 절마다 다르다        |

`Action`이 불리언이 아닌 이유: 불리언은 가시성만 꺼서 24 폭이 그대로 남고, Figma의 불리언은
component set 단위라 한 변형에서 끄면 다른 변형에서도 사라진다.

## Variants, sizes, and states

크기 축이 없다. 머리는 한 줄이며 제목·힌트가 모두 `typography-caption-medium` 계열의
12를 쓴다 — 절 제목이 본문보다 커지면 절이 화면 제목처럼 읽힌다.

## States

머리 자체는 대화형이 아니다. 조작 아이콘만 hover(면이 `color-accent-ghost-hover`로 켜진다)와
disabled(글자가 `color-fg-disabled`로 죽고 면은 그대로)를 갖는다. **Figma에 그 두 칸을 세우지
않았다** — 상태를 열면 `Action` 축과 곱해지고, hover는 면 하나가 켜지는 것이라 정지 화면에서
읽을 것이 없다. 상태의 뜻은 [interaction-states](../foundations/interaction-states.md)가
소유한다.

## Interaction and responsive behavior

- 제목이 길면 한 줄에서 말줄임으로 잘린다. 오른쪽 묶음은 잘리지 않는다.
- 글리프는 16이고 누르는 면은 24다. **디자인의 16은 글리프 크기이지 히트 영역이 아니다** —
  정본 주석이 그 구분을 적고 있다.
- 절 사이의 구분선은 이 머리가 아니라 카드가 갖는다. 첫 절 위에는 선이 없다.

## Content

- 제목은 명사 한 낱말이 기본이다(`변형` · `효과` · `오디오`).
- 힌트는 세는 말이나 현재 값이며 문장이 아니다(`3개` · `1080p`).
- KO `효과 / 3개` · EN `Effects / 3` · JA `エフェクト / 3件`.
- 조작 아이콘에는 보이는 라벨이 없으므로 접근 이름을 반드시 준다.

## Accessibility

- 제목은 절의 이름이다. 소비처가 표제 요소로 그리고 절 몸통을 `aria-labelledby`로 잇는다 —
  시각적 근접만으로는 절의 경계가 전달되지 않는다.
- 조작 아이콘은 `aria-label`을 갖는다. 누름 상태가 있으면 `aria-pressed`, 메뉴를 열면
  `aria-haspopup`과 `aria-expanded`를 함께 준다.
- 24 타깃은 44 규범 아래다. 포인터 전용 편집 표면의 예외이며, 손가락 폭에서는 절 머리가
  아니라 행이 44로 자란다.
- 글리프는 장식이므로 `aria-hidden`이다.

## Specification

| Part/state  | Token or recipe                                     | 구현 근거                                 |
| ----------- | --------------------------------------------------- | ----------------------------------------- |
| Head 아래   | `space-control-xs`                                  | `.louis-inspector-section-head`           |
| Head 사이   | `space-control-md`                                  | `.louis-inspector-section-head`           |
| Title       | `typography-caption-medium` · `color-fg-primary`    | `.louis-inspector-section-head__title`    |
| Tail 사이   | `space-control-sm`                                  | `.louis-inspector-section-head__tail`     |
| Meta        | `typography-caption-regular` · `color-fg-tertiary`  | `.louis-inspector-section-head__meta`     |
| Action      | `layout-control-height-sm` · `radius-control-sm`    | `.louis-inspector-section-head__action`   |
| Action hover| `color-accent-ghost-hover`                          | `.louis-inspector-section-head__action`   |
| Glyph       | `icon-size-sm`                                      | `.louis-inspector-section-head__glyph`    |

값의 출처는 `figma/components.measured.json`의 `inspector-row.head`가 `$` 사유로 하나씩
인용한다.

## Implementation

- Web source: `packages/css/src/component/inspector-row.css`
- Public import: CSS 레시피 전용 — React 표면이 없다.
- Figma component: `InspectorSectionHead` (page `DS · Components`)
- Tests/visual evidence: `scripts/verify-figma-parity.mjs`의 `inspector-section-head` 계약이
  Figma 기하를 `figma/components.measured.json`과 대조한다. 브라우저 되재기는 아직 없다.

## Known deviations

1. **감싸는 세로 묶음을 옮기지 않았다.** 정본은 머리를 세로 묶음(사이 간격 8) 안에 넣는데
   그 묶음의 자식이 언제나 하나라 8이 아무 것도 벌리지 않는다. 그리지 않는 값을 레시피와
   Figma에 옮기면 다음 사람이 그것을 계약으로 착각한다. 힌트 문단이 머리 아래로 내려오는
   배치가 실제로 생기면 그때 연다.
2. **힌트가 없는 머리를 Figma에 그리지 않았다.** 없음을 축으로 열면 `Action`과 곱해져 넷이
   되고, 힌트가 빠져도 오른쪽 묶음의 기하는 바뀌지 않는다(묶음이 내용폭이라 폭만 준다).
   그 폭은 이 계약이 대조하지 않는다.
3. **조작 아이콘의 상태 두 칸이 Figma에 없다.** 위 States가 사유를 갖는다.
4. **접근 이름은 Figma가 표현하지 못한다.** 아이콘만 있는 조작의 이름은 소비처가 주며,
   이 문서의 Accessibility가 그 요구를 소유한다.

## Acceptance tests

- Figma `InspectorSectionHead`의 두 변형이 한 키(`head`)로 되읽혀 기하 배열이 전부 길이 1이다.
- `Action=None` 변형에 `Action` 노드가 **없다**(숨긴 것이 아니다) — 되읽기의 `Action` 배열이
  길이 1이면 한 변형에만 있다는 뜻이다.
- `ActionGlyph`가 아이콘 교체 슬롯으로 열려 있다. 박혀 있으면 화면을 조립할 때 절마다 같은
  글리프가 된다.
- stroke와 effect가 하나도 없다 — 밑줄을 되살리면 「계약에 없는 것」으로 잡힌다.

## Migration and changelog

새 컴포넌트다. 대체하는 API가 없다. [Updates](../updates/README.md)를 본다.
