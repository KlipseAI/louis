---
id: selectable-list-row
status: experimental
authority: normative
summary: 목록에서 하나를 골라 오른쪽 내용을 바꿉니다.
---

# Selectable List Row

master-detail의 좌측 열에서 하나를 고른다.

제품 실측은 **3벌**이고 [gap registry](../../migration/figma-gap-registry.md)의 수치가 **처음으로
맞았다**(하이라이트 2 · 에디터 1). 셋이 합의하는 것은 골격이다 — 가로 flex 행, 선행 슬롯, 글자
묶음, 커서 포인터, hover 면, **전환 140ms ease.** 갈라지는 것은 선택을 무엇이 소유하느냐다.

## Availability

| Surface       | 상태           | 근거                                                                                 |
| ------------- | -------------- | ------------------------------------------------------------------------------------ |
| Web           | `partial`      | public export와 실브라우저 acceptance test 12건이 두 motion context에서 각각 돈다; visual regression, Figma component와 제품 소비 증거 없음 |
| Figma         | `done`      | component set(State). 계약이 모든 property 를 pin 하고 Text·Title·Meta·Media·Trailing 을 자손으로 대조하며 raw fill 0 이다. 선행 표식(Marker)은 2026-09-22 에 걷었다([DS-D-0070](../governance/decisions/DS-D-0070-list-row-selection-is-the-surface.md)). 기하는 양방향이다 — `selectable-list-row.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                                              |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                                           |

## When to use

- **하나를 고르는** 목록의 행 — 클립 리뷰, 소스 선택, 버전 목록. 고른 것의 상세가 옆이나 아래에 뜬다.
- 행 전체가 클릭 대상이고, 그 안에 다른 버튼이 없을 때.
- **목록은 올라온 면 위에 둔다** — `color-bg-surface`, `color-bg-raised`, `color-bg-menu`,
  `color-bg-overlay` 가운데 하나. 선택은 면(`color-bg-inset`)이 갖는데, 다크에서 그 값이 캔버스와 같아
  캔버스 바로 위에서는 선택 면이 바닥에 녹는다(아래 Implementation).

쓰지 않는 자리.

- **여럿을 고르는 목록.** 그때 선택은 행이 아니라 [Checkbox](checkbox.md)가 갖는다. 행을 버튼으로
  만들면서 안에 체크박스를 넣으면 **컨트롤이 중첩된다.** 제품의 에디터 소스 목록이 그 형태이고,
  그것은 이 컴포넌트가 아니라 Checkbox + 행 레이아웃이다.
- 메뉴 항목. 그것은 [Menu / Popover](menu-popover.md)이며 열렸다 닫히는 표면 안에 있다.
- 앱 셸 사이드바. 그것은 [Sidebar Nav Item](app-shell-parts.md)이며 목적지로 이동한다.
- 카드 격자. 그것은 [Project Card](project-card.md)다.
- 행 안에 버튼이 여럿 필요할 때. 행을 버튼으로 만들 수 없으므로 다른 구조가 필요하다.

## API

```tsx
{clips.map((clip, index) => (
  <SelectableListRow
    key={clip.id}
    selected={index === activeIndex}
    media={<img src={clip.thumbnail} alt="" width={96} height={54} />}
    title={clip.name}
    meta={`${clip.start} · ${clip.duration}초`}
    trailing={<span>{index + 1}</span>}
    onClick={() => setActiveIndex(index)}
  />
))}
```

## Anatomy

1. **Row** — `<button type="button">`. **행 전체가 컨트롤이다.**
2. **Media** — 선행 슬롯. 썸네일이 들어가고 크기는 호출부가 정한다.
3. **Text** — 제목과 보조 문구를 세로로 담는다.
4. **Trailing** — 후행 슬롯. 시간·개수 같은 짧은 값.

선행 표식(왼쪽 3px 막대)은 없다. 2026-09-22 에 걷었다([DS-D-0070](../governance/decisions/DS-D-0070-list-row-selection-is-the-surface.md)).

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `selected` | boolean | `false` | 선택 여부. `aria-current="true"`가 된다 |
| `title` | ReactNode | **필수** | 제목 줄. 한 줄로 잘린다 |
| `meta` | ReactNode | 없음 | 제목 아래 보조 문구. 한 줄로 잘린다 |
| `media` | ReactNode | 없음 | 선행 슬롯 |
| `trailing` | ReactNode | 없음 | 후행 슬롯. **버튼을 넣지 않는다** |
| `disabled` | boolean | `false` | 비활성 |

나머지는 `<button>`의 네이티브 속성을 그대로 받는다. `title`은 HTML 전역 속성과 이름이 겹치므로
행의 제목 쪽 뜻으로 덮어썼다.

**크기 축이 없다.** 행의 높이는 내용이 정한다 — 썸네일이 96px이면 96px 줄이고 글자만 있으면
글자 줄이다. 제품 3벌도 고정 높이를 갖지 않는다.

## States

| state | 표현 |
| --- | --- |
| Default | 면 없음, 전경 `color-fg-secondary` |
| Hover | 면 `color-accent-ghost-hover`, 전경 `color-fg-primary` |
| Selected | 면 `color-bg-inset`, 전경 `color-fg-primary`. 선행 표식은 없다 |
| Disabled | 전경 `color-fg-disabled`, hover가 면을 칠하지 않는다 |
| Focus | **그리지 않는다**(DS-D-0074). 강제 색에서만 `Highlight` 링 |

**선택된 행에서도 보조 문구는 `color-fg-secondary`로 남는다.** 둘 다 primary가 되면
제목과 보조의 위계가 사라진다.

## Interaction and responsive behavior

- 제목·보조 문구·후행 슬롯 어디를 눌러도 행이 받는다. 행 자체가 버튼이기 때문이다.
- 목록을 **Tab이 훑는다.** 방향키 roving을 흉내 내지 않는다 — 그것은 `listbox`의 계약이고
  이 컴포넌트는 버튼 목록이다. `listbox`가 필요하면 별도 컴포넌트다.
- 제목과 보조 문구는 **줄바꿈이 아니라 말줄임**으로 줄어든다. 행 높이가 항목마다 달라지면
  목록이 튄다.
- 폭은 호출부가 정한다. 행은 `inline-size: 100%`다.

## Content

- 제목은 그 항목을 **구별하는 것**이다. 순번이 아니라 이름이다.
- 보조 문구에는 시각·길이처럼 **비교에 쓰는 값**을 둔다. 설명 문장을 넣지 않는다 — 잘린다.
- 후행 슬롯은 한두 글자다. 그보다 길면 보조 문구로 내린다.

## Accessibility

- **선택을 `aria-current`가 소유한다.** [Sidebar Nav Item](app-shell-parts.md)과 같은 판정이다 —
  시각 전용 속성을 두면 화면에는 선택으로 보이는데 보조기술에는 아무것도 전달되지 않는다.
- 선택은 면과 전경으로 보이고, 보조기술에는 `aria-current`가 전한다. 면이 놓이는 바닥과 갈려야 하므로
  목록을 올라온 면 위에 둔다(When to use). 두 테마에서 그것을 테스트가 확인한다.
- 썸네일은 장식이므로 `alt=""`가 기본이다. 썸네일에만 있는 정보가 있으면 제목이 그것을 말해야 한다.
- forced-colors에서 면이 시스템 색으로 치환되므로 테두리로 선택을 다시 세운다.
- 행이 버튼이므로 Enter와 Space가 모두 실행한다. 네이티브의 동작이다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 안쪽 여백 | 8px | `space-control-sm` |
| 슬롯 간격 | 8px | `space-control-sm` |
| 반경 | 10px | `radius-overlay-item` |
| 글자 묶음 간격 | 4px | `space-stack-xs` |
| 제목 타이포 | 14/1.5 | `typography-body-sm-medium` |
| 보조 타이포 | 12/1.5 | `typography-caption-regular` |
| 미디어 반경 | 8px | `radius-control-sm` |

**기하는 제품 값을 그대로 옮기지 않았다.** 제품의 gap 10px과 반경 14px에 맞는 semantic 토큰이
없고, 새 토큰은 token source를 바꿔 Figma 재적용이 따라온다. 대신 **DS에 이미 있는 선택 가능한
행**인 Sidebar Nav Item의 값(`space-control-sm` · `radius-overlay-item` · `body-sm-medium`)을
따랐다 — 같은 성질의 두 컴포넌트가 다른 기하를 갖지 않게 하는 것이 더 중요하다.

## Effects

없다. 그림자도 흐림도 쓰지 않는다.

## Implementation

**선택은 면이 갖는다.** Sidebar Nav Item과 같은 방식이다 — `aria-current` + `color-bg-inset`.

**예전에는 3px 선행 표식을 함께 그렸다.** 2026-08-18 실측에서 다크의 `background-inset`이 표면과 같은
색(`#313644`)이라 표면 위 목록에서 선택 면이 사라졌기 때문이다. 2026-09-22 에 걷었다
([DS-D-0070](../governance/decisions/DS-D-0070-list-row-selection-is-the-surface.md)). 이유는 셋이다.

1. **제품은 표식을 한 번도 보이지 않았다.** 이 레시피를 입은 하이라이트 클립 목록은 `before:hidden`
   으로 표식을 껐고(제품 앵커 `6fbdac16` 의 `highlightSceneStyles.ts` 162줄), 레이어 패널은 면 하나로
   선택을 그리며, 프로젝트 영상 팝오버는 `aria-current` 를 켜지 않는다.
2. **소유자가 왼쪽 막대를 거부했다** — 흔한 생성형 화면의 표식으로 읽힌다.
3. **옛 근거가 더는 성립하지 않는다.** 다크 사다리가 바뀌어 지금 `bg-inset` 은 `bg-canvas` 와 같은
   값이고, 올라온 면들과는 갈린다.

실측(2026-09-22, `packages/css/generated/tokens.css`):

| 테마 | 선택 면 `bg-inset` | `bg-surface` | `bg-raised` | `bg-menu` | `bg-overlay` | `bg-canvas` |
| --- | --- | --- | --- | --- | --- | --- |
| light | `#ebecee` | `#fafafa` | `#ffffff` | `#f2f3f5` | `#fafafa` | `#f2f3f5` |
| dark | `#0d1118` | `#171b22` | `#171b22` | `#171b22` | `#171b22` | **`#0d1118`** |

남는 제약은 하나다 — **다크에서 캔버스 바로 위에 둔 목록은 선택 면이 바닥과 같아진다.** 그래서 목록을
올라온 면 위에 두라고 When to use 가 적는다. 테스트가 네 면 위에서 두 테마 모두 선택 면이 바닥과
다른지를 확인한다. 사다리가 다시 바뀌어 면이 같아지면 거기서 걸린다.

## Known deviations

- **`Sidebar Nav Item`에 같은 위험이 남아 있다.** 그 컴포넌트는 면만으로 선택을 표현하며, 앱 셸
  사이드바가 캔버스 위에 있는 동안에만 성립한다. 표면 위에 놓이는 배치가 생기면 선택이 사라진다.
- **여럿 고르기를 다루지 않는다.** 제품 3벌 중 1벌(에디터 소스 목록)이 그 형태이고 그것은
  Checkbox가 소유한다.
- **`listbox`가 아니다.** 방향키 roving과 typeahead가 없다. 목록이 길어져 Tab이 부담이 되면
  `listbox` 계약을 갖는 별도 컴포넌트가 필요하다.
- **제품의 반응형 전환을 옮기지 않았다.** 하이라이트의 행은 900px 이하에서 220px 세로 카드로
  바뀌는데, 그것은 행이 아니라 **다른 컴포넌트로의 전환**이라 패턴이 소유할 문제다.
- **다크에서 캔버스 위에 둔 목록은 선택이 보이지 않는다.** 선택 면(`bg-inset`)이 캔버스와 같은 값이다.
  레시피가 막지 않으므로 호출부가 목록을 올라온 면 위에 둔다.
- **Figma의 State는 코드에 없는 축이다.** 코드에서 `selected`는 boolean prop이고 `disabled`는
  `<button>`의 네이티브 속성인데, Figma에는 boolean 상태의 시각 표현이 없어 variant로 둔다.
  parity 계약이 그 사유와 함께 `figmaOnlyProperties`로 선언한다.

## Acceptance tests

1. 안쪽 여백·슬롯 간격·반경·글자 묶음 간격·제목/보조 타이포가 `components.measured.json`과 같다.
2. Default·Hover·Selected·Disabled의 면과 전경이 states 표와 같다.
3. **올라온 면(surface, raised, menu, overlay) 위에서 light와 dark 두 테마 모두 선택 면이 바닥과 다르다.**
4. 선택한 행과 선택하지 않은 행 모두 선행 표식이 없다.
5. 선택을 `aria-current="true"`가 소유하고 목록에 하나만 있다.
6. 행이 `<button type="button">`이고 보조 문구를 눌러도 클릭이 **한 번만** 실행된다.
7. 긴 제목이 말줄임으로 줄고 한 줄에 남는다.
8. 선택된 행에서도 보조 문구가 제목과 다른 색이다.
9. `disabled`면 클릭이 실행되지 않고 hover가 면을 칠하지 않는다.
10. 키보드 포커스에도 링이 없고, 강제 색에서만 — 선택된 행에서도 — 두께 `border-width-ring`의 링이 선다(DS-D-0074).
11. Tab이 다음 행으로 이동한다.
12. 자동 접근성 검사에 위반이 없다.
