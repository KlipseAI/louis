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
| Web           | `partial`      | CSS recipe(`packages/css/src/component/floating-shell.css`)가 섰다. React 표면은 없고 제품은 아직 물지 않았다 — `Toolbar.tsx` · `index.tsx` 의 `TOOLBAR_WRAP` 과 `CanvasZoomControl.tsx` 의 `ZOOM_LABEL_BUTTON` 이 여전히 그리고 있다 |
| Figma         | `partial`      | FloatingShell 2 variant(`Size` = `md` · `lg`, `lg` 가 compact) · PillTrigger 3 variant(State). 흐림 4 가 변수에 묶이지 않고 구분선·배지가 빠져 있다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 계획서가 제안한 네 축 중 하나도 열지 않았고 그 이유가 전부 실측이다 |

`partial` 이지 `done` 이 아닌 이유는 둘이다. **소비처가 아직 없다** — 앵커의 네 자리가 그대로
자기 값을 그리고 있고, 제품이 이 클래스를 무는 것은 다음 회차다. 그리고 **흐림 4 가 여전히
이름을 갖지 못한다**(Known deviations 1). 상태를 올리려고 그 둘 중 하나를 없는 셈 치지 않는다.

## 레시피 — 무엇을 소유하고 무엇을 소유하지 않나

`packages/css/src/component/floating-shell.css` 한 파일에 두 조형이 함께 산다. **파일이 하나인
이유는 문서가 하나인 이유와 같다** — 재료가 하나이기 때문이고, 두 파일로 나누면 그 불변식을
적을 자리가 없다.

| 클래스 | 무엇 |
| --- | --- |
| `.louis-floating-shell` | 조각을 담는 셸. 여백 4 · 간격 4 · 반경 16 · 재료 한 벌 |
| `.louis-floating-shell__item` | 조각이 서는 **자리**. 겉 크기 32 와 곡률 12 만 갖는다 |
| `.louis-floating-shell[data-size="compact"]` | 휴대폰 폭의 하단 바. 자리가 **40** 이 된다(여백 · 간격 · 재료 · 곡률은 그대로). 아래 「compact」 |
| `.louis-pill-trigger` | 알약 트리거. 높이 36 · 좌우 12 · 간격 4 · 반경 16 · 재료 한 벌 |
| `.louis-pill-trigger__caret` | 방향 표시 10 · 불투명도 0.7. 열림에서 180° 뒤집힌다 |

**소유하지 않는 것 셋.**

- **층(z-index).** 어디에 어떻게 뜨는지는 호출부가 정한다 — 앵커의 세 자리도 겹침 순서를
  감싸는 래퍼가 갖는다. 여기서 층을 정하면 호출부가 이미 세운 순서를 레시피가 조용히 이긴다.
- **그림자.** 경계는 안쪽 헤어라인 **한 겹**이 전부다(계약의 `borderWidth: 0`, DS-D-0023).
  `--louis-elevation-menu` 를 한 겹 더 얹는 것은 `CommandPalette` 의 560 모달이고 그것은
  [Dialog](dialog.md) 쪽 문법이다.
- **조각.** `__item` 이 갖는 것은 자리의 겉 크기와 곡률뿐이다. 호버 틴트가 갈리는 툴바 버튼의
  레시피는 아직 없다(Known deviations 4).

**재료는 두 규칙에 각각 적힌다.** 트리거가 셸의 자손이 아니라서다 — 배율 트리거는 캔버스 우측
하단에 홀로 서므로 상속으로 한 벌을 물려줄 수 없다. 값이 두 번 적히는 대신 갈리지 않는 것을
기계가 지킨다: `verify-recipe-record` 가 두 선언을 각각 기록과 대조하고, 브라우저 시험이 렌더한
둘의 유리(면 · 흐림 · 반경 · 헤어라인)가 **같은지**를 실브라우저에서 잰다.

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

**compact**(`data-size="compact"`) — 위 표에서 **조각만 바뀐다.**

| 축 | 값 | 출처 |
| --- | --- | --- |
| 조각 | `40` 정사각 · 반경 `12` | `--louis-layout-control-height-lg` · 곡률은 기본과 같다 |
| 높이 | `48` | 선언 없음 — `4 + 40 + 4` 의 파생값 |
| 누르는 영역 | `44` | 조각에 `.louis-hit-target`(compact 에서만) |

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

## compact — 캔버스 하단 바

2026-10-07, 제품 `feat/canvas-mobile-ux` `Toolbar.tsx:203` · `index.tsx`(TOOLBAR_ROW) @3923caf7. 앱 셸이
compact 로 들어가는 **`≤719px`**(`responsive-layout` 의 경계)에서 캔버스 하단 툴바가 이 셸의 40 조각판으로
바뀐다. 셸의 재료는 하나도 갈리지 않는다.

**무엇이 갈리는가 — 조각 크기 하나다.** 32 조각이 40(`--louis-layout-control-height-lg`)이 되고 곡률 12
는 같다. 속성은 `data-size="compact"` 한 값이고 속성이 없으면 지금과 같은 32 다. 칸이 둘이지만 축으로
열지 않았다 — 둘이 갈리는 것이 크기뿐이고 둘째 값이 한 자리(하단 바)에만 서는 재고라서다(DS-D-0048 의
논리와 같다).

**속성을 미디어 쿼리로 자동 판정하지 않는다.** 하단 바는 크기만이 아니라 **구성**이 바뀐다 — 데스크톱의
여덟 버튼이 레이어 · 툴 전환 · 추가 · 되돌리기 네 칸으로 접히고(노드 추가 여섯 칸은 「추가」 시트 한 칸으로
모이며, 전체 보기는 두지 않는다 — 소유자 결정 2026-09-15), 그 구성은 캔버스가 JS 로 가른다. 레시피가
크기만 따로 바꾸면 구성은 데스크톱인데 조각만 커지는 중간 상태가 생긴다.

**누르는 영역 44 는 조각이 아니라 `.louis-hit-target` 이 갖는다.** 보이는 크기 40 에 누르는 영역 44 를
더하면 이웃 사이 간격 4 가 넓힌 영역(좌우 2씩)을 그대로 받아 **맞닿기만 하고 겹치지 않는다.**
데스크톱 32 조각에 44 를 주면 이웃과 겹쳐 눌리는 쪽이 바뀌므로 compact 에만 붙인다.

**높이는 여전히 선언이 아니라 파생값이다.** 기본 `4 + 32 + 4 = 40`, compact `4 + 40 + 4 = 48`. 제품의
`canvasChromeInsets.ts@b3c56ed1a:15`(@ad81d1b5e)가 그 파생값을 「LOUIS `.louis-floating-shell` 이 선언하지 않는
파생값이다」라고 적고 `4×2 + 32` 를 직접 계산해 빈 캔버스 안내 · 도움말 패널 · 콜아웃의 위치가 모두
거기에 기댄다. **발행할지는 판정 필요**로 남긴다 — Known deviations 9.

**위치는 호출부의 것이다.** 가운데 정렬 · `bottom: max(12px, env(safe-area-inset-bottom))` ·
가장 위 층(상단 블러와 레이어 패널 위)은 이 레시피가 아니라 캔버스의 `TOOLBAR_ROW` 가 갖는다. 앱이
`viewport-fit=cover` 를 켜지 않아 환경 값은 보통 0 이고 12 가 남는다. 거친 포인터의
`touch-action: pan-x pan-y`(핀치로 페이지가 커져 시트 좌표가 어긋난 Android 인앱 WebView 결함의 해법)도
같은 행이 갖는다 — 셸이 아니라 행의 선언이다. 구성과 시트의 배치는
[Editor Workspace](../patterns/editor-workspace.md)의 「캔버스 하단 바」가 적는다.

## 36 은 컨트롤 높이가 아니다

트리거의 36 을 보고 `Size` 축을 열고 싶어지는 자리다. **열지 않는다.**
[DS-D-0048](../governance/decisions/DS-D-0048-thirty-six-is-not-a-control-height.md) 이 36 을
컨트롤 높이 사다리에 들이지 않기로 판정했고, 그 판정은 여기서도 그대로다. 여기서 36 은 사다리의
한 칸이 아니라 **이 한 조형의 값**이며, 두 번째 밀도가 없으므로 이름을 줄 축 자체가 없다.

같은 결정이 「사다리 밖 값은 쓰임새로 부른다」를 함께 정했지만 그 규칙은 **칸이 둘 이상일 때**의
것이다. 칸이 하나뿐인 축은 축이 아니다.

## Properties

**FloatingShell**

| 이름 | 종류 | 뜻 |
| --- | --- | --- |
| `Size` | 축 (2) | `md` = 속성 없음(조각 32, 높이 40) · `lg` = `data-size="compact"`(조각 40, 높이 48) |

코드는 칸이 하나뿐인 값이라 축이 아니라 **속성 하나**로 열었다(위 「compact」). Figma 에는 속성 선택자가
없어 변형으로 둔다(2026-10-08). 값 이름이 `compact` 가 아닌 것은 그 말이 `Size` 축 어휘에서 폐기됐기
때문이다([저작 규범 §2](../governance/figma-component-authoring.md)) — 조각이 컨트롤 사다리의
`layout-control-height-md` · `-lg` 를 그대로 읽으므로 사다리 이름이 곧 값이다. `lg` 변형의 조각 인스턴스는 폭 ·
높이가 변수 `layout/control-height-lg` 에 묶였고, 여백 · 간격 · 반경 · 재료 · 조각 곡률 12 는 두 변형이 같다.
누르는 영역 44(`.louis-hit-target`)는 CSS 의 것이라 그리지 않는다. 되읽기 키는 `shell`(md) · `compact`(lg)다.

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
| 기본 | 면 72% | 변형은 있으나 **칠 불투명도가 1 이다**(Known deviations 10) |
| 호버 | 면 88% — 색이 아니라 **같은 면의 알파**가 오른다 | 변형은 있으나 **칠 불투명도가 1 이다**(Known deviations 10) |
| 열림 | 캐럿이 180° 뒤집힌다. 면·잉크는 그대로 | 있다(위를 가리키는 갈매기) |
| 비활성 | 제품에 선언이 **없다** | 없는 것이 옳다 |

되읽기의 필드는 면의 알파도 캐럿의 향도 담지 않는다. 세 변형의 **기하가 같다**는 사실만 담기고,
그것은 `NodeChromeButton` 의 `Default`/`Hover` 가 이미 서 있는 자리다.

## 캔버스 안의 면

캔버스 안에서는 면 색이 `color-bg-menu` 가 아니라 **`color-canvas-menu-surface`** 다(라이트 흰색 · 다크
`palette-gray-900`, [DS-D-0082](../governance/decisions/DS-D-0082-canvas-semantics-and-product-ink-alpha.md)).
라이트에서 노드 카드가 `palette-gray-000` 으로 올라와 앱 메뉴 면(`palette-gray-025`)보다 밝아졌고, 카드 위에 뜨는
크롬은 카드보다 한 칸 밝아야 한다. 제품은 캔버스 셸이 `bg-menu` 를 흰색으로 덮는다(통합 판 `54b62a8aa`
`node-canvas-v2/canvasMenuSurface.ts:14-15` · `index.tsx:492`). 이 재료는 캔버스 밖(덱 화면의 언어 전환)에도 서므로
기본 면은 그대로 두고 범위 안에서만 갈아 읽는다.

- **범위**: `data-louis-scope="canvas"` 를 단 조상, 또는 그 속성을 단 셸 · 트리거 자신(`body` 로 포털되는 조각).
- **바뀌는 것은 색 하나다.** 알파 72% · 호버 88% 는 지역 변수 `--louis-floating-shell-surface-alpha` 가 그대로 나른다.
  라이트 합성값은 `#ffffffb8`(72%) · `#ffffffe0`(88%)이고, 보드의 묶이지 않던 칠 `ffffffb8` 이 이것이다.
- **Figma**: 셸 · 알약의 캔버스 판은 아직 없다 — 칠을 `color/canvas-menu-surface` 에 묶고 불투명도 0.72 · 호버 0.88 로
  세우는 것이 다음 Figma 회차의 일이다.

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
파일도 하나다). React 표면이 없으므로 **클래스 마크업을 직접 렌더해** 잰다 — `alert` ·
`switch` · `node-chip` · `inspector-row` 가 같은 형태다.

1. 두 표의 토큰 이름이 라이트·다크 양쪽에 **실재한다**(오타·개명을 잡는다).
2. 면과 잉크가 **테마를 타는 세만틱**이다. 고정 팔레트 토큰을 잘못 적으면 걸린다.
3. 레시피가 기록의 **기하**를 만든다 — 여백 · 간격 · 반경 · 조각 32/12 · 트리거 36/12/4/16 ·
   라벨 14 와 행간 1 · 캐럿 10 과 불투명도 0.7. **높이 40 과 폭 112 는 선언이 아니라 파생값이라
   이 시험에서만 재진다**(`4 + 32 + 4` 와 `4 + 32×3 + 4×2 + 4`).
4. 프레임이 공용 헤어라인 recipe(`--louis-hairline-inset`)가 칠하는 그 색·그 알파다(DS-D-0023).
5. 호버가 **색이 아니라 같은 면의 알파**를 올린다 — 실제 포인터를 얹어 재고, 면 rgb 는 그대로에
   알파만 `sizes` 의 `surfaceAlpha` 대로 0.72 → 0.88 로 갈린다.
6. 셸과 트리거가 **같은 유리**다 — 면 · 흐림 · 반경 · 헤어라인 넷이 서로 같고, 흐림이 기록의
   4 다. 이 넷이 두 조형을 한 문서에 둔 이유이므로 그 불변식을 직접 잰다.
7. 열림이 바꾸는 것은 **캐럿의 향뿐**이다 — 면 · 잉크 · 프레임은 그대로이고 회전 행렬이
   반 바퀴다.

**전이가 도는 동안은 재지 않는다.** 호버를 얹거나 테마를 뒤집은 직후의 계산 스타일은 계약값이
아니라 계약값으로 가는 중인 보간값(Chromium 은 `oklab(…)` 으로 발행한다)이다. 첫 판이 그것을
재고 빨개졌고, `document.getAnimations()` 의 `finished` 를 기다리는 것으로 고쳤다.

`verify-recipe-record` 가 반대 방향을 잰다 — **레시피의 선언 ↔ 기록의 값** 49 건이고, 그중
23 건이 이 두 벌이다. 흐림 4 는 `backdrop-filter: blur(…)` 로는 수로 풀리지 않아 지역 변수
`--louis-floating-shell-blur` 로 한 번 발행하고 그 선언을 기록의 `blurRadius` 와 맞춘다 —
이름 없는 값이 게이트 밖에 남지 않게 하는 방법이다.

**아직 재지 못하는 것**: 구분선과 점 배지. 둘 다 이 세트에 없는 것이고(아래 「축을 열지 않은 것
넷」) 없는 것을 잴 수는 없다. 열지 않은 네 축의 사유는 `figma/components.measured.json` 의
`$whyNoOrientationAxis` · `$whyNoDividerAxis` · `$whyNoCaretAxis` · `$whyNoBadgeAxis` 가 갖는다.

## Known deviations

1. **흐림 4 가 이름을 갖지 못한다.** LOUIS 흐림 사다리는 10 · 12 · 16 이고 4 가 없다. Figma 는
   그 반경을 변수에 묶지 못하고 값으로 둔다. 이름을 주려면 토큰을 새로 세우고 재생성해야 하며
   Figma 변수까지 함께 열어야 한다 — 그것은 이 변경 단위 밖이다. **레시피도 리터럴로 두되
   게이트 밖에 두지는 않았다**: 값을 지역 변수 `--louis-floating-shell-blur` 로 한 번 발행하고
   `verify-recipe-record` 가 그 선언을 기록의 `blurRadius` 와 대조한다. 이름이 없는 것과 아무도
   보지 않는 것은 다르다.
2. **라이트 면 색이 앵커와 현재 제품에서 다르다.** 앵커 `5a67d692` 는 `palette-gray 100` 72%,
   앵커 뒤 커밋 `54150126`(「라이트 캔버스를 pg-100, 노드 카드를 pg-050, 알약을 pg-050 으로」)이
   그것을 `palette-gray 050` 으로 옮겼다. Figma 는 **현재 값**에 물렸다 — 면을 값이 아니라
   `color-bg-menu` 이름으로 묶었다. 그 뒤 다크는 `palette-gray 900` 으로 내려왔고, 라이트는 2026-09-22
   [DS-D-0069](../governance/decisions/DS-D-0069-menu-surface-light-one-step-lighter.md) 로 한 칸 밝아져 `palette-gray 025` 다 — 셸 · 알약은 이름에 묶여 있어
   함께 따라왔다. 앵커 값에 물리면 세운 그 날 이미 낡는다.
3. **캐럿이 같은 벡터가 아니다.** Figma 는 라이브러리의 `icon/caret-down` 인스턴스를 10 으로
   줄여 쓰고, 제품은 10 뷰박스에 획 1.5 로 직접 그린 갈매기를 쓴다. 방향과 크기는 같고 획의
   출처가 다르다.
4. **셸 안의 조각이 정본이 아니다.** Figma 의 `Item 1~3` 은 `NodeChromeButton` 인스턴스인데 그것은
   자리 표시다. 제품 툴바 버튼은 호버 틴트가 갈리는 다른 레시피이고 아직 컴포넌트가 없다 —
   계약이 담는 것은 그 자리의 **겉 크기 32 와 곡률 12** 뿐이다.
5. **`transform: translateZ(0)` 를 Figma 가 담지 못한다.** 제품은 세 자리 모두에 그것을 함께
   적는다. 합성 레이어로 올려 배경 흐림이 안정적으로 걸리게 하는 선언이고, iOS 의 중첩 스크롤에서
   같은 레이어의 글자가 흐려지는 결함을 막는 자리이기도 하다. 정지 화면에는 나타나지 않는 값이라
   Figma 변형이 담을 축이 아니다 — **그래서 레시피가 그것을 갖는다.** 제품이 이 클래스를 물면
   자동으로 따라가고, 그것이 정지 화면에 없는 값을 보존하는 유일한 방법이다.
6. **호버 전이의 지속시간이 앵커와 다르다.** 앵커는 `color 0.12s ease, background 0.12s ease`
   이고 레시피는 컨트롤 호버 역할의 토큰(`--louis-motion-control-hover-duration` 160ms)을 읽는다.
   `.louis-menu-trigger` 가 같은 자리에서 같은 판정을 했다 — 역할에 이름이 있으면 그 이름을
   쓰고, 갈리는 것은 지속시간 하나다. **캐럿의 회전은 갈리지 않는다**: 앵커가 `160ms ease` 이고
   그 토큰의 timing 이 `cubic-bezier(0.25, 0.1, 0.25, 1)` = `ease` 라 두 값이 같다.
7. **React 표면이 없다.** 소비처가 제품 캔버스의 네 자리뿐이고 이 저장소 안에는 하나도 없다 —
   감쌀 근거가 생기기 전에 감싸면 아무도 쓰지 않는 API 가 된다. `Alert` · `Switch` ·
   `NodeChip` · `Inspector Row` 가 같은 형태이고, 브라우저 시험은 클래스 마크업을 직접 렌더해
   잰다. 소비처가 생기고 상태 관리(`aria-expanded` 의 소유)가 필요해지면 그때 연다.
8. **툴바 단추의 「보여 주기」 강조(spotlight)가 정본이 없다 — 판정 필요.** 제품
   `Toolbar.tsx:89`(`chore/landing-dead-walkthrough` @d040dce15)의 `TOOLBAR_BUTTON_SPOTLIGHT` 가
   `[box-shadow:0_0_0_2px_var(--louis-color-accent-primary)]` 로 도움말 「보여 주기」가 짚은 단추(이미지 ·
   영상 둘)에 잠시 강조색 2px 테두리를 두른다. 시간은 캔버스가 정한다. 세 가지가 걸린다. (a) **포커스
   링과 혼동된다** — 같은 2px 강조색 링이라 키보드 포커스와 겹치는 단추에서 둘이 구별되지 않는다
   (DS-D-0074). (b) **토큰 없이 들어왔다** — `box-shadow` 에 리터럴 2 를 적었다. (c) **이 셸의 `__item`
   은 상태가 없는 자리**이고(위 4번) 그 상태를 가진 툴바 버튼의 레시피가 아직 없다. 일시 강조를
   `data-spotlight` 같은 상태로 세울지, 세운다면 포커스 링과 **다른 두께 · 간격**으로 가를지는 소유자
   판정이다. 이번에 레시피는 열지 않았다.
9. **compact 와 높이 파생값.** (a) compact 크기 40 은 **브라우저 시험이 아직 재지 않는다** —
   `floating-shell.browser.test.tsx` 는 기본 32 만 안다. 높이 48 과 누르는 영역 44 도 파생값이라 시험에서만
   재진다. Figma 는 `Size=lg` 변형으로 섰다(2026-10-08 — 조각 40 · 높이 48 을 되읽기가 잰다). (b) 제품은 툴바 높이를 `canvasChromeInsets.ts` 에서 `4×2 + 32` 로 직접
   계산한다. 높이를 토큰(`--louis-layout-floating-shell-height` 40 · compact 48)으로 **발행하면 제품이
   계산을 걷고 읽을 수 있다** — 하지만 소비처(빈 캔버스 · 도움말 패널 · 콜아웃)가 셸의 **자손이 아니라**
   CSS 변수 상속으로는 닿지 않고 TypeScript 상수를 거쳐야 한다. 토큰 생성물과 Figma 변수를 함께 열어야
   해서 이번에 하지 않았다. **판정 필요**: 발행할지, 발행 없이 문서의 파생식(`2 × 4 + 조각`)을 정본으로
   둘지.
10. **Figma 의 면 불투명도가 레시피와 다르다(2026-10-08 감사 확인).** `FloatingShell` `2875:1754` · `PillTrigger`
    `1375:16007` 의 칠이 Default · Hover · Open 모두 불투명도 1 이다. 레시피와 이 문서는 72% · 호버 88% 이다 — 레시피
    쪽이 정본이고(`floating-shell.css` 의 `--louis-floating-shell-surface-alpha` 72% · 호버 88%), Figma 칠 불투명도를
    0.72 · 0.88 로 고치는 것이 남았다. 위 States 표가 전에 「있다」고 적었던 것은 사실과 달랐다.

## Related

- [Menu Popover](menu-popover.md) — 트리거가 여는 패널. 여기서 다시 만들지 않는다
- [Node Chrome Button](node-chrome-button.md) — 셸 안에 서는 32 정사각의 이웃 문법
- [Toast](toast.md) — 같은 「반투명 + 흐림」 재료를 쓰지만 반전 면이고 층이 다르다
- [Editor Workspace](../patterns/editor-workspace.md) — 캔버스 하단 바(compact)와 측면 패널의 배치
