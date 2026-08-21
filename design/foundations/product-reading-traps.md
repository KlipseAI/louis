---
id: foundation-product-reading-traps
status: experimental
authority: normative
---

# 제품을 읽을 때 틀리는 자리

제품에서 값을 가져올 때 **선언을 읽으면 틀리고 렌더를 재야 맞는** 자리들이다. 넷 다 게이트가
초록인 채로 틀릴 수 있는 형태이고, Figma 재조립과 DS 값 결정 양쪽에서 실제로 사고가 났다.

**규칙은 하나다 — 선언이 아니라 렌더된 값을 값으로 삼는다.** 지금까지 이 관찰들은 겪은 컴포넌트
문서 안에만 있었고, 그래서 다른 컴포넌트를 그리는 사람에게는 닿지 않았다. **이 문서가 일반
규칙으로 소유한다.** 컴포넌트나 화면을 그리기 전에 읽는다.

**기준은 `KlipseAI/klipse-web`의 `origin/main`이다** —
[product-evidence.lock.json](../../migration/product-evidence.lock.json)의 `productRef`가 그것이고,
아래 줄 번호는 전부 그 ref에서 확인했다. 다른 브랜치를 읽으면 좌표도 값도 달라진다(4번 항목).

## 1. 다른 클래스를 덮는 규칙이 실제 기본값이다

Tailwind는 소스 스캔으로 CSS를 내보낸다. 그래서 **어떤 배리언트의 클래스 목록에 적힌 규칙은 그
배리언트가 화면에 붙었는지와 무관하게 항상 존재한다.** 그 규칙이 자기 자신이 아니라 형제를
겨누면 베이스 정의는 사문이 되고 **덮인 값이 실제 기본값**이 된다. 선택자가 길어 명시도도 높다.

배포본의 사이드바 업그레이드 버튼이 그 형태다.

| 무엇 | 값 | 근거 |
| --- | --- | --- |
| 베이스 정의 — 화면에 안 나온다 | `background: rgb(var(--accent-mint-500-rgb) / 16%)` · `color: var(--accent-mint-700)` | `Gnb.tsx:909-910` |
| light 실제 | `background: var(--palette-gray-900)` · `color: var(--palette-gray-100)` | `Gnb.tsx:1888-1889` |
| light hover | `background: var(--palette-gray-800)` | `Gnb.tsx:1891` |
| dark 실제 | `background: var(--palette-gray-100)` · `color: var(--palette-gray-900)` | `Gnb.tsx:1893-1894` |
| dark hover | `background: var(--palette-gray-200)` | `Gnb.tsx:1896` |

덮는 쪽은 `sidebarUpgradeButtonActive`(`Gnb.tsx:1886`)이고, 그 목록의 규칙들이
`html[data-theme=*] .gnb-sidebarUpgradeButton:not(&)` — **자기 자신이 아니라 비활성 형제**를
겨눈다. **정의는 민트인데 배포 화면은 검정/흰색이다.** 정의만 읽고 옮기면 존재한 적 없는 민트
버튼을 그린다.

같은 형태가 GNB 메뉴 링크에도 있다 — `menuLinkActive`가
`.gnb-menu:not(.gnb-menuSidebar) .gnb-menuLink:not(&)`로 비활성 링크의 색을 덮는다
(`Gnb.tsx:511-513`).

**대응.** 이 패턴은 `:not(&)`로 검색된다. 값을 정하기 전에 대상 클래스로 그 검색을 한 번 돌리고,
걸리면 베이스가 아니라 덮는 쪽을 값으로 삼는다. 렌더를 재면 애초에 걸리지 않는다.

## 2. 토큰 이름이 종류를 뜻하지 않는다

`shadow`나 `frame`이 이름에 있다고 드롭섀도우가 아니다. **종류는 이름이 아니라 해결된 값의
레이어별 blur·spread·inset에서 판정한다.**

| 토큰 | 실제 종류 | 근거 |
| --- | --- | --- |
| `--glass-dropdown-frame` | **드롭섀도우가 아니다.** 5겹이고 그중 셋은 blur 0의 링·좌우 림, 둘은 `inset` 안쪽 베벨이다 | `globals.css:63-68` |
| `--dropdown-ambient-shadow` | 드롭섀도우 (`0px 8px 15px 0px rgba(0,0,0,0.04)`) | `globals.css:81` |
| `--node-meta-dropdown-shadow` | **한 이름에 두 종류** — 위 둘의 합이다 | `globals.css:559-560` |

`--glass-dropdown-frame`을 드롭섀도우 한 겹으로 읽으면 면이 뜨고 안쪽 베벨이 통째로 빠진다.
이름에 `frame`이 있지만 바깥 테두리만 있는 것도 아니다.

`--glass-dropdown-frame-on-dark`(`globals.css:72`)가 따로 있는 이유도 이름으로는 안 보인다 —
원본이 라이트에서 흰 림 24%→100%로 뒤집혀, 테마와 무관하게 늘 어두운 표면에는 쓸 수 없기
때문이다. 코드 주석이 그 이유를 갖고 있다(`globals.css:69-71`).

**이름은 브랜치마다 다를 수 있다.** 미배포 `origin/design`에는 이 토큰이 `--dropdown-frame`으로
개명돼 있고 `--glass-bevel-*`도 없다. **`origin/main`에 그 이름이 실재하는지 먼저 확인한다.**

## 3. 두 면이 같은 색일 때 경계는 색이 아니다

**라이트에서 페이지 바닥과 앱 카드 면은 같은 색이다.**

| 테마 | 페이지 바닥 | 카드 면 | 관계 |
| --- | --- | --- | --- |
| light | `--app-page-bg` → `--gray-900` → `--palette-gray-100` = `#f1f1f3` | `--palette-gray-100` = `#f1f1f3` | **같다** |
| dark | `--app-page-bg` → `--gray-900` → `--palette-gray-900` = `#171b22` | `--palette-gray-800` = `#313640` | 다르다 |

근거: 라이트 `globals.css:717`·`734`, 다크 `globals.css:674`·`691`, 팔레트 `globals.css:24`·`36`·`37`,
카드 면 `globals.css:1391-1396`.

라이트에서 카드의 경계는 색이 아니라 **`box-shadow: var(--glass-dropdown-frame)`와
`border-radius: 16px`**로만 난다(`globals.css:1367-1372`). 면 색으로 카드를 찾으면 **카드가 통째로
빠진다.**

두 파생 규칙이 따라온다.

- **앱 셸에서는 오히려 갈린다 — 이 절이 반대로 적고 있었다(2026-08-21 정정).** 원래 「앱 셸에서도
  여전히 같은 색이다. 페이지 바닥과 카드 면이 같이 밀린다」고 적었는데 **틀렸다.** 앱 셸의 씬
  루트는 `--app-page-bg`를 쓰지 않고 **자기 배경을 직접 칠한다.**

  | 앱 셸 · 라이트 | 페이지 바닥 | 카드 면 | 관계 |
  | --- | --- | --- | --- |
  | ≥720px | `--palette-gray-200` = `#eeeef1` | `--palette-gray-100` = `#f8f8f9` | **다르다 — 한 계단** |
  | ≤719px | `--palette-gray-100` = `#f8f8f9` | `#f8f8f9` | 같다 |

  근거: `appHomeSceneStyles.ts:900`·`909` (상수 `scene`), `NodeCanvasHomeScene.tsx:105-107`.
  두 씬이 같은 규칙을 쓴다. **`--app-page-bg`는 데스크톱 페이지 바닥을 칠하지 않는다** —
  그것은 사이드바와 모바일 드로어가 읽는다(`Gnb.tsx:427`·`2006`).

  다크는 씬 루트에 데스크톱 규칙이 없어 `--app-page-bg`(`#171b22`)가 남고 카드는 `#313640`이라
  원래부터 다르다.

  **그래서 앱 셸 화면에서는 면 색으로 카드를 찾을 수 있고, 랜딩에서는 못 찾는다.** 반대로
  **앱 셸에 랜딩의 「같은 색」 규칙을 적용하면 페이지 바닥이 한 계단 밝게 나온다.**
- **719px 이하에서는 경계가 아예 없다.** `border-radius: 0` · `box-shadow: none`이 되어
  (`globals.css:1462-1468`) 카드가 페이지에 완전히 녹는다. 좁은 폭 화면에 카드 테두리를 그리면
  틀린다.

## 4. 어느 브랜치를 읽고 있는지가 값을 바꾼다

제품 저장소의 체크아웃이 `origin/main`이라는 보장이 없다. 로컬 클론이 기능 브랜치에 있으면
**같은 파일이 다른 내용**이고, 줄 번호와 토큰 이름이 함께 어긋난다.

실측(2026-08-21): `globals.css`가 `origin/main`과 `origin/design`에서 토큰 358개 대
354개로 다르고, `--glass-dropdown-frame`·`--glass-bevel-*`의 존재 여부가 갈린다.
`Gnb.tsx`는 인용 좌표가 8~10줄씩 밀린다.

**대응.** 제품 파일을 읽을 때 작업 트리를 읽지 말고 `git show origin/main:<path>`로 읽는다.
읽은 뒤에는 `git rev-parse origin/main:<path>`의 blob 해시를
[product-evidence.lock.json](../../migration/product-evidence.lock.json)과 대조한다. 어긋나면 그
파일을 인용하는 축을 다시 재고 lock을 갱신한다 — `verify-product-evidence`가 같은 일을 한다.

## Acceptance tests

- 1과 2는 `measure-product-components.mjs`가 렌더된 값을 재는 축에 대해서는 구조적으로 막힌다 —
  선언이 아니라 계산된 스타일을 읽기 때문이다. **재지 않는 축은 막히지 않는다.** 미검증 축은
  [unverified-values.json](../../figma/unverified-values.json)이 명부로 관리한다.
- 3은 아직 게이트가 없다. 면 대조는 색만 보므로 "같은 색"을 오류로 신고하지 않고 카드 누락도
  잡지 못한다. 재조립 template의 카드 유무는 `verify-figma-parity`의 template 축에 의존한다.
- 4는 `verify-product-evidence`가 blob 해시로 잡는다. 다만 **인용 좌표가 아니라 파일 단위**라,
  같은 파일 안에서 줄이 밀린 것은 잡히지 않는다.
- 새 컴포넌트의 값을 정할 때 이 문서의 항목을 확인했다는 근거는 EXPECT의 제품 대조 행이며,
  문장으로 대신하지 않는다.
