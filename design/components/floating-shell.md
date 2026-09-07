---
id: floating-shell
status: experimental
authority: normative
summary: 캔버스 위에 뜨는 크롬의 재료 한 벌과 그 재료로 선 알약 트리거.
---

# Floating Shell · Pill Trigger

캔버스 **위에** 뜨는 크롬의 재료다. 면은 반투명하고, 뒤가 흐려지며, 경계는 테두리가 아니라
안쪽 헤어라인 한 겹이 만든다. 그 재료로 두 가지가 선다 — 조각을 담는 **셸**과, 눌러 패널을 여는
**트리거**.

**이 문서가 소유하는 것은 재료와 액자다.** 셸 안에 무엇이 서는지, 트리거가 무엇을 여는지는
호출부가 정한다. 열리는 패널은 [Menu Popover](menu-popover.md)가 이미 소유하므로 여기서 다시
만들지 않는다.

## 왜 한 문서인가

셸과 트리거는 축이 다른 두 component set 이지만 **재료가 하나**다 — 면(`color-bg-menu` 72%) ·
배경 흐림 4 · `--louis-hairline-inset` · 반경 16. 그 넷이 갈리면 캔버스 위에서 두 조각이 서로
다른 유리로 보인다. 두 문서로 나누면 그 불변식을 아무 데도 적을 수 없다.

## 되풀이는 넷이다 — 계획서의 「6 파일」은 grep 이 센 수다

표면 계획서는 이 항목의 근거로 6 파일을 적었다. 앵커 `5a67d692` 에서 **세 값이 한 요소에
함께 걸린 자리**를 다시 세면 넷이다.

| 자리 | 상수 | 무엇 |
| --- | --- | --- |
| `node-canvas-v2/components/Toolbar.tsx` | `TOOLBAR_WRAP` | 캔버스 하단 툴바 |
| `node-canvas-v2/index.tsx` | `TOOLBAR_WRAP` | 위 상수를 **파일 안에 다시 적은 사본**. 툴바와 도움말 알약 두 곳에 걸린다 |
| `node-canvas-v2/components/CanvasZoomControl.tsx` | `ZOOM_LABEL_BUTTON` | 우측 하단 배율 트리거 |

계획서가 함께 센 `NodeCanvasHomeScene` 과 `VideoEditScene` 의 두 자리는 이 셸이 아니라 **이미
`.louis-toast` 를 무는 토스트**다. `gray-800/72%` 라는 문자열만 같다. `CommandPalette` 의 패널도
같은 재료를 쓰지만 560px 모달이고 `--louis-elevation-menu` 를 한 겹 더 얹는다 — 알약이 아니라
[Dialog](dialog.md) 쪽 문법이라 이 세트에 담지 않았다.

**「같은 값을 쓴다」와 「같은 부품이다」는 다르다.** 이 표가 그 구분이다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `not-ready`    | LOUIS recipe 가 없다. 제품 `Toolbar.tsx` · `index.tsx` 의 `TOOLBAR_WRAP` 과 `CanvasZoomControl.tsx` 의 `ZOOM_LABEL_BUTTON` 이 정본이다 |
| Figma         | `partial`      | FloatingShell(단일 · 축 없음) · PillTrigger 3 variant(State). 흐림 4 가 변수에 묶이지 않고 구분선·배지가 빠져 있다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 계획서가 제안한 네 축 중 하나도 열지 않았고 그 이유가 전부 실측이다 |

## Anatomy

**FloatingShell** — 가로 오토레이아웃 한 줄.

| 축 | 값 | 출처 |
| --- | --- | --- |
| 안쪽 여백 | `4` 네 변 | `p-2` (`--spacing` 2px) |
| 조각 사이 | `4` | `gap-2` |
| 반경 | `16` | `rounded-16` = `--louis-radius-overlay` |
| 높이 | `40` | 선언 없음 — `4 + 32 + 4` 의 파생값 |
| 조각 | `32` 정사각 · 반경 `12` | `w-16 h-16` · `rounded-[var(--button-radius)]` |
| 테두리 | 없음 | `[border:none]` |

**PillTrigger** — 문구와 캐럿 한 줄.

| 축 | 값 | 출처 |
| --- | --- | --- |
| 높이 | `36` **고정** | `h-18` |
| 좌우 여백 | `12` | `px-6` |
| 위아래 여백 | `0` | `py-0` — 높이가 직접 고정돼 라벨 행간이 알약을 늘리지 않는다 |
| 사이 간격 | `4` | `gap-2` |
| 반경 | `16` | 셸과 같다 |
| 라벨 | 14 · 행간 1 | `type-body-14-medium` + `[line-height:1]!` |
| 캐럿 | `10` · 불투명도 `0.7` | `ToolbarChevronDown` 기본 `size = 10` · `opacity-[0.7]` |

## 36 은 컨트롤 높이가 아니다

트리거의 36 을 보고 `Size` 축을 열고 싶어지는 자리다. **열지 않는다.**
[DS-D-0048](../governance/decisions/DS-D-0048-thirty-six-is-not-a-control-height.md) 이 36 을
컨트롤 높이 사다리에 들이지 않기로 판정했고, 그 판정은 여기서도 그대로다. 여기서 36 은 사다리의
한 칸이 아니라 **이 한 조형의 값**이며, 두 번째 밀도가 없으므로 이름을 줄 축 자체가 없다.

같은 결정이 「사다리 밖 값은 쓰임새로 부른다」를 함께 정했지만 그 규칙은 **칸이 둘 이상일 때**의
것이다. 칸이 하나뿐인 축은 축이 아니다.

## Properties

**FloatingShell** — 축도 프로퍼티도 없다. `MenuPanel` · `MenuSeparator` 와 같은 단일 컴포넌트다.

**PillTrigger**

| 이름 | 종류 | 뜻 |
| --- | --- | --- |
| `Label` | 슬롯 (TEXT) | 배율 문구. 코드에서 계산돼 들어오는 값이라 축이 아니다 |
| `State` | 축 (3) | `Default` · `Hover` · `Open` |

## 축을 열지 않은 것 넷

| 축 | 계획서의 제안 | 열지 않은 이유 |
| --- | --- | --- |
| `Orientation` | `Horizontal` · `Vertical` | 앵커 전수에서 이 재료로 선 셸이 **전부 가로**다. 없는 자리를 위한 축은 재고이지 값이 아니다([DS-D-0030](../governance/decisions/DS-D-0030-no-duplicate-role-tokens.md)) |
| `Divider` | `None` · `Gradient` | 구분선은 실재한다(폭 1 · 높이 22 · 좌우 여백 2). 그런데 그 면이 **다섯 정지점 세로 그라디언트**이고 양 끝 두 정지점이 알파 0 이다 — 그 색을 담을 변수가 파일에 없어 지금 그리면 되읽기가 `rawFills` 로 센다. 저작 규범 §1 의 「원시값 0 — 타협 없음」을 깨지 않으려고 미룬다 |
| `Caret` | 불리언 | 앵커의 유일한 소비처가 캐럿을 **언제나** 그린다. 캐럿 없는 자리가 없다 |
| `Badge` | `None` · `Dot` | 점 배지(6×6 · `primary-500` · 버튼 우상단 6/6)는 셸 **안의 32 툴바 버튼**에 붙지 이 트리거에 붙지 않는다. 그 버튼은 아직 컴포넌트가 아니다 |

넷 다 「깜빡했다」가 아니다. 앞의 셋은 **없는 것**이고 넷째는 **다른 부품의 것**이다.

## States

| 상태 | 무엇이 바뀌나 | Figma |
| --- | --- | --- |
| 기본 | 면 72% | 있다 |
| 호버 | 면 88% — 색이 아니라 **같은 면의 알파**가 오른다 | 있다(paint opacity) |
| 열림 | 캐럿이 180° 뒤집힌다. 면·잉크는 그대로 | 있다(위를 가리키는 갈매기) |
| 비활성 | 제품에 선언이 **없다** | 없는 것이 옳다 |

되읽기의 필드는 면의 알파도 캐럿의 향도 담지 않는다. 세 변형의 **기하가 같다**는 사실만 담기고,
그것은 `NodeChromeButton` 의 `Default`/`Hover` 가 이미 서 있는 자리다.

## Content

셸은 글자를 갖지 않는다. 트리거의 글자는 배율 한 조각뿐이고 그 값은 계산된 수치다 — 라이브러리가
카피를 소유하지 않도록 축이 아니라 TEXT 슬롯으로 내렸다.

## Accessibility

- 트리거는 `aria-haspopup="menu"` 와 `aria-expanded` 를 갖는다. `Open` 변형이 그리는 것이 그
  `aria-expanded="true"` 다.
- 캐럿은 `aria-hidden` 이다. 방향은 장식이고 「열려 있다」는 사실은 `aria-expanded` 가 나른다.
- 셸 안의 조각은 각자 접근 이름을 갖는다. 셸 자신은 이름을 갖지 않는다 — 액자이지 컨트롤이 아니다.
- **면이 반투명이라 대비가 뒤에 무엇이 있느냐로 흔들린다.** 캔버스는 사용자가 올린 매체를 담으므로
  최악의 경우를 가정해야 한다. 흐림 4 가 그 완화이고, 그래서 흐림은 장식이 아니라 계약이다.

## Acceptance tests

`packages/react/test/floating-shell.browser.test.tsx` 가 두 컴포넌트를 함께 잰다(문서가 하나라
파일도 하나다). **LOUIS recipe 가 없으므로 그리는 코드를 재는 것이 아니다** — 재는 것은 states
표가 부르는 이름이 토큰층에 실재하는가와, 표가 스스로 선언한 규칙이 실브라우저에서 참인가다.

1. 두 표의 토큰 이름이 라이트·다크 양쪽에 **실재한다**(오타·개명을 잡는다).
2. 면과 잉크가 **테마를 타는 세만틱**이다. 고정 팔레트 토큰을 잘못 적으면 걸린다.
3. 프레임이 공용 헤어라인 recipe(`--louis-hairline-inset`)가 칠하는 그 색·그 알파다(DS-D-0023).
4. 호버가 **색이 아니라 같은 면의 알파**를 올린다 — 세 상태의 면 rgb 가 같고 알파만
   `sizes` 의 `surfaceAlpha` 대로 갈린다.
5. 셸과 트리거가 **같은 면**을 문다.

**아직 재지 못하는 것**: 여백·간격·높이·흐림 4 · 캐럿의 향. 넷 다 그리는 코드가 서야 잴 수
있고, 그때까지는 `figma/components.measured.json` 의 `floating-shell` · `pill-trigger` 가 앵커
소스 인용으로 지킨다. 열지 않은 네 축의 사유도 같은 기록의 `$whyNoOrientationAxis` ·
`$whyNoDividerAxis` · `$whyNoCaretAxis` · `$whyNoBadgeAxis` 가 갖는다.

## Known deviations

1. **흐림 4 가 이름을 갖지 못한다.** LOUIS 흐림 사다리는 10 · 12 · 16 이고 4 가 없다. Figma 는
   그 반경을 변수에 묶지 못하고 값으로 둔다. 이름을 주려면 토큰을 새로 세우고 재생성해야 하며
   그것은 이 변경 단위 밖이다.
2. **라이트 면 색이 앵커와 현재 제품에서 다르다.** 앵커 `5a67d692` 는 `palette-gray 100` 72%,
   앵커 뒤 커밋 `54150126`(「라이트 캔버스를 pg-100, 노드 카드를 pg-050, 알약을 pg-050 으로」)이
   그것을 `palette-gray 050` 으로 옮겼다. Figma 는 **현재 값**에 물렸다 — 그 쌍(라이트 050 ·
   다크 800)이 `color-bg-menu` 와 바이트로 같기 때문이다. 앵커 값에 물리면 세운 그 날 이미 낡는다.
3. **캐럿이 같은 벡터가 아니다.** Figma 는 라이브러리의 `icon/caret-down` 인스턴스를 10 으로
   줄여 쓰고, 제품은 10 뷰박스에 획 1.5 로 직접 그린 갈매기를 쓴다. 방향과 크기는 같고 획의
   출처가 다르다.
4. **셸 안의 조각이 정본이 아니다.** Figma 의 `Item 1~3` 은 `NodeChromeButton` 인스턴스인데 그것은
   자리 표시다. 제품 툴바 버튼은 호버 틴트가 갈리는 다른 레시피이고 아직 컴포넌트가 없다 —
   계약이 담는 것은 그 자리의 **겉 크기 32 와 곡률 12** 뿐이다.
5. **`transform: translateZ(0)` 를 Figma 가 담지 못한다.** 제품은 세 자리 모두에 그것을 함께
   적는다. 합성 레이어로 올려 배경 흐림이 안정적으로 걸리게 하는 선언이고, iOS 의 중첩 스크롤에서
   같은 레이어의 글자가 흐려지는 결함을 막는 자리이기도 하다. 정지 화면에는 나타나지 않는 값이라
   Figma 변형이 담을 축이 아니고, 제품이 이 레시피를 물 때 반드시 함께 가야 한다.

## Related

- [Menu Popover](menu-popover.md) — 트리거가 여는 패널. 여기서 다시 만들지 않는다
- [Node Chrome Button](node-chrome-button.md) — 셸 안에 서는 32 정사각의 이웃 문법
- [Toast](toast.md) — 같은 「반투명 + 흐림」 재료를 쓰지만 반전 면이고 층이 다르다
