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

**다크는 ≥720px 에서만 갈린다.** 이 절의 다크 서술(「다크는 씬 루트에 데스크톱 규칙이 없어
`--app-page-bg`가 남고 카드는 `#313640`이라 원래부터 다르다」)은 데스크톱 폭에서만 맞다. 씬
루트가 다크 데스크톱 규칙을 두지 않아 `--app-page-bg`(`#171b22`)가 남는 것은 ≥720px 이고,
**719px 이하로 내려가면 다크도 페이지 배경이 카드 면색으로 이동해 라이트와 똑같이 같은 색이
된다.**

| 앱 셸 · 다크 | 페이지 바닥 | 카드 면 | 관계 |
| --- | --- | --- | --- |
| ≥720px | `--app-page-bg` = `#171b22` | `--palette-gray-800` = `#313640` | 다르다 |
| ≤719px | `--palette-gray-800` = `#313640` | `#313640` | **같다** |

근거: `appHomeSceneStyles.ts:910` · `myPageSceneStyles.ts:569` · `NodeCanvasHomeScene.tsx:106`
— 세 씬이 같은 규칙을 쓴다. 카드 면 `globals.css:1427-1429`, 팔레트 `globals.css:36`.

**그래서 ≤719px 에서 경계가 사라지는 것은 반경·그림자 때문만이 아니다.** 배경이 카드 면색으로
함께 이동하므로 **면 색으로도 카드를 찾을 수 없다.** 다크 모바일 프레임을 데스크톱
페이지색(`#171b22`)으로 칠하면 카드(`#313640`)와의 이음매가 그대로 드러나 — 이 절이 말한
「카드가 페이지에 완전히 녹는다」와 **반대 결과**가 나온다.

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

## 5. 라이트 정의에 부정 게이트가 붙어 있다

**라이트 값이 `html[data-theme="light"]` 블록에 있다고 가정하면 틀린다.** 프레임 계열의 라이트
정의는 `html[data-theme="light"]:not(:has([data-landing-walkthrough-dark])), [data-landing-walkthrough-light]`
라는 **부정 게이트가 붙은 별도 규칙**이 소유한다(`globals.css:592-593`). 문서 안에
`data-landing-walkthrough-dark` 요소가 **하나라도** 있으면 문서 전체가 라이트여도 이 블록이
통째로 꺼지고 `:root` 다크 값(`globals.css:63-68` — 링 검정 50% · 좌우 80% · 흰 림 50%)으로
되돌아간다.

오염 범위는 토큰 하나가 아니다. 같은 셀렉터가 `@custom-variant light` 정의에도 들어 있어
(`tailwind.css:252`) **모든 `light:` 유틸리티가 함께 꺼진다** — 툴바·줌 컨트롤·노드 카드의
라이트 값이 전부 다크로 측정된다.

| 축 | 라이트 셀렉터 | 게이트 | 근거 |
| --- | --- | --- | --- |
| 프레임 토큰 — `--glass-dropdown-frame` · `--dropdown-surface-bg` | `html[data-theme="light"]:not(:has(…)), [data-landing-walkthrough-light]` | **있다** | `globals.css:592-593` |
| 모든 `light:` 유틸리티 | 같은 셀렉터 | **있다** | `tailwind.css:252` |
| 패널 면의 라이트 분기 | `html[data-theme=light] &` | **없다** | `GlassConfirmModal.tsx:55` |

**두 축의 폭이 달라서 한쪽만 뒤집힌다.** 게이트가 풀린 라이트 문서에서 패널 면은 라이트
(`--palette-gray-100`)로 가고 프레임은 다크에 남는다 — **밝은 면 위에 다크 링**이라는, 어느
테마에도 없는 조합이 나온다. 3번이 다루는 「한 계단 밀림」은 두 면이 함께 이동하는 전면
이동이지만, 여기서는 한 축만 움직이는 **부분 반전**이다.

같은 프레임 토큰을 되읽어 함께 뒤집히는 표면: 드롭다운·팝오버
(`globals.css:560`·`608`·`739`·`784`·`828` — `--node-meta-dropdown-shadow`가 다섯 스코프에서
같은 합성을 다시 선언한다), 앱 카드(`globals.css:1372`·`1404`), 결제 완료 메인 패널
(`billing-success/page.tsx:54`).

**이 함정만 이 문서의 우산 규칙에 걸리지 않는다.** 렌더된 값을 재도 소용이 없다 — 워크스루
데모가 켜진 문서에서는 **렌더된 값 자체가 다크로 나오기** 때문이다.

**대응.** 라이트를 재기 전에 `document.querySelector('[data-landing-walkthrough-dark]')`가
`null`인지 확인한다. null이 아니면 그 스냅샷에서 잰 라이트 값은 전부 버린다. 이 문자열은 여러
파일에 흩어져 있지만 **속성을 실제로 다는 곳은 한 곳**이다 — `StaticCreateDemo.tsx:541`
(`data-landing-walkthrough-dark={darkWalkthrough ? "" : undefined}`). 나머지 히트는 주석과
Tailwind 임의 변형 셀렉터 문자열이다. 짝인 `-light`는 같은 파일 `:540`과
`NodeMockupCard.tsx:528`.

**제품 주석을 근거로 삼지 않는다.** `WalkthroughGenerateCursor.tsx:24`는 그 속성을 다는 곳이
`GettingStartedPanel`이라고 적어 두었지만 실제 대입처는 `StaticCreateDemo.tsx:541`이다. 주석이
낡았고, 그 주석을 믿으면 게이트가 풀리는 조건을 잘못 짚는다.

## 6. portal은 스코프를 반만 벗어난다

`document.body`로 portal된 표면은 **DOM 스코프(클래스·부모 변수)에서는 벗어나지만 `html`에
정의된 테마 변수는 계속 상속받는다.** 그래서 **표면색과 프레임이 서로 다른 테마를 따를 수
있다.** 버그가 아니라 의도다 — 맞춰서 고치지 않는다.

랜딩 커뮤니티 드롭다운이 그 형태다. 패널은 `createPortal(…, document.body)`로
`[data-page-root]` 밖에 놓인다(`landing/navigation/Gnb.tsx:782`·`867`). **1번이 인용하는
`Gnb.tsx`와는 다른 파일이다** — 이쪽은 랜딩 GNB다.

- **표면은 클래스가 소유한다.** `[background:var(--dropdown-surface-bg)]` 위에
  `html[data-theme=dark] &`가 `rgb(241 241 243)`으로 **라이트를 못박는다**
  (`landing/navigation/Gnb.tsx:189-196`, 다크 오버라이드는 `:195`).
- **프레임은 `html`에서 상속된다.** `--glass-dropdown-frame`의 다크 값은 `html[data-theme]`이
  아니라 **`:root` 기본값**(`globals.css:63-68`)이고, 라이트만 5번의 좁은 게이트가 덮는다
  (`globals.css:592-599`). 이 토큰의 정의는 문서 전체에 그 둘뿐이다.

**결과.** 다크 테마에서 이 드롭다운은 `#f1f1f3` 밝은 면 위에 **다크용 프레임**(링 50% ·
좌우 80% · 흰 림 50%)을 얹는다. 랜딩은 항상 밝은 브랜드 페이지라 표면을 라이트로 고정하는데
프레임은 앱 테마를 따라가기 때문이다.

| 토큰 | 다크 (`:root`) | 라이트 (좁은 게이트) | 근거 |
| --- | --- | --- | --- |
| `--dropdown-surface-bg` | `rgb(var(--palette-gray-800-rgb))` | `rgb(var(--palette-gray-100-rgb))` | `globals.css:101` · `globals.css:600` |
| `--glass-dropdown-frame` | 링 .5 · 좌우 .8 · 흰 림 .5 | 링 .15 · 좌우 .25 · 흰 림 1 | `globals.css:63-68` · `globals.css:594-599` |
| `--dropdown-ambient-shadow` | `0px 8px 15px 0px rgba(0,0,0,0.04)` | 같다 — 테마 무관 | `globals.css:81` |
| `--dropdown-radius` · `--dropdown-padding` · `--dropdown-item-radius` | 16px · 6px · 10px | 같다 — 테마 무관 | `globals.css:84-86` |

**판정 절차.** portal된 표면을 그릴 때는 (a) 클래스가 직접 칠하는 값과 (b) `html`에서
상속되는 변수를 **따로** 해석한다. 둘이 다른 테마를 가리키는 것이 정상일 수 있다. 표면
하나가 한 테마를 통째로 따른다고 가정하면 프레임이 통째로 틀린다.

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
