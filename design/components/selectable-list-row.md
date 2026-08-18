---
id: selectable-list-row
status: experimental
authority: normative
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
| Figma         | `partial`      | component set 3 variant(State). parity 게이트가 Marker·Text·Title·Meta·Media·Trailing을 자손으로 대조하며 raw fill 0이다. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                                              |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                                           |

## When to use

- **하나를 고르는** 목록의 행 — 클립 리뷰, 소스 선택, 버전 목록. 고른 것의 상세가 옆이나 아래에 뜬다.
- 행 전체가 클릭 대상이고, 그 안에 다른 버튼이 없을 때.

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
5. **Marker** — 선택된 행의 선행 표식.

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
| Default | 면 없음, 전경 `color-foreground-secondary` |
| Hover | 면 `color-action-ghost-hover`, 전경 `color-foreground-primary` |
| Selected | 면 `color-background-inset` **+ 3px 선행 표식** `color-action-primary`, 전경 `color-foreground-primary` |
| Disabled | 전경 `color-foreground-disabled`, hover가 면을 칠하지 않는다 |
| Focus | 행이 공유 링을 받는다 |

**선택된 행에서도 보조 문구는 `color-foreground-secondary`로 남는다.** 둘 다 primary가 되면
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
- **선택을 면 하나로 전달하지 않는다.** 아래 Implementation의 실측을 보라.
- 썸네일은 장식이므로 `alt=""`가 기본이다. 썸네일에만 있는 정보가 있으면 제목이 그것을 말해야 한다.
- forced-colors에서 면과 표식이 모두 시스템 색으로 치환되므로 테두리로 선택을 다시 세운다.
- 행이 버튼이므로 Enter와 Space가 모두 실행한다. 네이티브의 동작이다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 안쪽 여백 | 8px | `space-control-sm` |
| 슬롯 간격 | 8px | `space-control-sm` |
| 반경 | 10px | `radius-overlay-item` |
| 글자 묶음 간격 | 4px | `space-stack-xs` |
| 선택 표식 | 3px | 리터럴 |
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

**선택 면 하나에 기대면 다크에서 사라진다.** Sidebar Nav Item은 `aria-current` +
`color-background-inset`만으로 선택을 표현하는데, 그것이 성립하는 이유는 **사이드바가 캔버스 위에
있기 때문**이다. 다크에서 `background-inset`은 `surface`·`menu`·`overlay`와 **같은 색**이고,
목록은 표면 위에도 놓인다.

실측(2026-08-18, 표면 위):

| 테마 | 표면 | 선택 면 | 구분되는가 |
| --- | --- | --- | --- |
| light | `#fafafa` | `#eaebee` | 예 |
| dark | `#313644` | `#313644` | **아니오** |

그래서 3px 선행 표식을 함께 그린다. 색 하나로 상태를 전달하지 않는 것은 그 자체로도 맞다.
테스트가 두 테마에서 표식의 존재와 색을 각각 확인한다.

## Known deviations

- **`Sidebar Nav Item`에 같은 위험이 남아 있다.** 그 컴포넌트는 면만으로 선택을 표현하며, 앱 셸
  사이드바가 캔버스 위에 있는 동안에만 성립한다. 표면 위에 놓이는 배치가 생기면 선택이 사라진다.
- **여럿 고르기를 다루지 않는다.** 제품 3벌 중 1벌(에디터 소스 목록)이 그 형태이고 그것은
  Checkbox가 소유한다.
- **`listbox`가 아니다.** 방향키 roving과 typeahead가 없다. 목록이 길어져 Tab이 부담이 되면
  `listbox` 계약을 갖는 별도 컴포넌트가 필요하다.
- **제품의 반응형 전환을 옮기지 않았다.** 하이라이트의 행은 900px 이하에서 220px 세로 카드로
  바뀌는데, 그것은 행이 아니라 **다른 컴포넌트로의 전환**이라 패턴이 소유할 문제다.
- **선택 표식 3px에 토큰이 없다.** 소비처가 하나뿐이라 승격하지 않았다.
- **Figma의 State는 코드에 없는 축이다.** 코드에서 `selected`는 boolean prop이고 `disabled`는
  `<button>`의 네이티브 속성인데, Figma에는 boolean 상태의 시각 표현이 없어 variant로 둔다.
  parity 계약이 그 사유와 함께 `figmaOnlyProperties`로 선언한다.

## Acceptance tests

1. 안쪽 여백·슬롯 간격·반경·글자 묶음 간격·제목/보조 타이포가 `components.measured.json`과 같다.
2. Default·Hover·Selected·Disabled의 면과 전경이 states 표와 같다.
3. **표면 위에서 light·dark 두 테마 모두 선택 표식이 있고 폭과 색이 계약과 같다.**
4. 선택하지 않은 행에는 표식이 없다.
5. 선택을 `aria-current="true"`가 소유하고 목록에 하나만 있다.
6. 행이 `<button type="button">`이고 보조 문구를 눌러도 클릭이 **한 번만** 실행된다.
7. 긴 제목이 말줄임으로 줄고 한 줄에 남는다.
8. 선택된 행에서도 보조 문구가 제목과 다른 색이다.
9. `disabled`면 클릭이 실행되지 않고 hover가 면을 칠하지 않는다.
10. 포커스 링이 **키보드에서만** 나타나고 두께가 `border-width-ring`이다.
11. Tab이 다음 행으로 이동한다.
12. 자동 접근성 검사에 위반이 없다.
