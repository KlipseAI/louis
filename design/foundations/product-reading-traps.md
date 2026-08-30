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

**기준은 `KlipseAI/klipse-web` 의 `design` 계열이다** —
[product-evidence.lock.json](../../migration/product-evidence.lock.json)의 `productRef`·
`productCommit` 이 정본이고 아래 줄 번호는 그 커밋에서 확인했다. **`origin/main` 이 아니다**
(4번 항목) — 거기에는 폐지된 글래스 섀도우가 남아 있어 값도 좌표도 달라진다.

## 1. 다른 클래스를 덮는 규칙이 실제 기본값이다

Tailwind는 소스 스캔으로 CSS를 내보낸다. 그래서 **어떤 배리언트의 클래스 목록에 적힌 규칙은 그
배리언트가 화면에 붙었는지와 무관하게 항상 존재한다.** 그 규칙이 자기 자신이 아니라 형제를
겨누면 베이스 정의는 사문이 되고 **덮인 값이 실제 기본값**이 된다. 선택자가 길어 명시도도 높다.

배포본의 사이드바 업그레이드 버튼이 그 형태다.

| 무엇 | 값 | 근거 |
| --- | --- | --- |
| 베이스 정의 — 화면에 안 나온다 | `background: rgb(var(--accent-green-500-rgb) / 16%)` · `color: var(--accent-green-700)` | `Gnb.tsx:1938-1939` |
| light 실제 | `background: var(--palette-gray-900)` · `color: var(--palette-gray-100)` | `Gnb.tsx:1953-1954` |
| light hover | `background: var(--palette-gray-800)` | `Gnb.tsx:1956` |
| dark 실제 | `background: var(--palette-gray-100)` · `color: var(--palette-gray-900)` | `Gnb.tsx:1958-1959` |
| dark hover | `background: var(--palette-gray-200)` | `Gnb.tsx:1961` |

덮는 쪽은 `sidebarUpgradeButtonActive`(`Gnb.tsx:1951`)이고, 그 목록의 규칙들이
`html[data-theme=*] .gnb-sidebarUpgradeButton:not(&)` — **자기 자신이 아니라 비활성 형제**를
겨눈다. **정의는 민트색(`accent-green` 계열이 이 색이다)인데 배포 화면은 검정/흰색이다.** 정의만 읽고
옮기면 존재한 적 없는 민트 버튼을 그린다.

같은 형태가 GNB 메뉴 링크에도 있다 — `menuLinkActive`가
`.gnb-menu:not(.gnb-menuSidebar) .gnb-menuLink:not(&)`로 비활성 링크의 색을 덮는다
(`Gnb.tsx:554-556`).

**대응.** 이 패턴은 `:not(&)`로 검색된다. 값을 정하기 전에 대상 클래스로 그 검색을 한 번 돌리고,
걸리면 베이스가 아니라 덮는 쪽을 값으로 삼는다. 렌더를 재면 애초에 걸리지 않는다.

**값으로 grep하지 마라 — 같은 파일에 글자까지 같은 쌍둥이가 있다.** 위 베이스 두 줄
(`Gnb.tsx:1938-1939`)은 `mobileMenuUpgradeButton`의 `Gnb.tsx:990-991`과 **바이트 동일**이라 값
검색의 첫 히트가 엉뚱한 블록에 걸린다. 두 블록은 의미도 다르다 — 모바일 쪽에는 `:not(&)`로 덮는
형제가 없어(`.gnb-mobileMenuUpgradeButton`은 파일에 한 번만 나온다) 그 민트가 **실제로 렌더된다**.
위 표가 말하는 「존재한 적 없는 민트 버튼」은 사이드바 쪽 하나뿐이다. 값이 아니라 **키 이름으로**
블록을 먼저 고정하고 좌표를 딴다.

## 2. 토큰 이름이 종류를 뜻하지 않는다

`shadow`나 `frame`이 이름에 있다고 드롭섀도우가 아니다. **종류는 이름이 아니라 해결된 값의
레이어별 blur·spread·inset에서 판정한다.**

| 토큰 | 실제 종류 | 근거 |
| --- | --- | --- |
| `--louis-hairline-inset` | **드롭섀도우가 아니다.** blur가 `0`인 0.5px `inset` **선**이다 | [base.css:21-22](../../packages/css/src/base.css) |
| `--louis-elevation-menu` | 드롭섀도우 (`0px 8px 15px 0px color(srgb 0 0 0 / 0.04)`) | [tokens.css:439](../../packages/tokens/generated/tokens.css) |
| `--node-meta-dropdown-shadow` | **한 이름에 두 종류** — 위 둘의 합이다 | `globals.css:525-526` |

헤어라인을 보통의 드롭섀도우로 읽고 blur를 주면 선이 번져 사라진다. blur `0` · 두께 `0.5px`이라
**테두리를 그리는 그림자**다. 바깥이 아니라 **안쪽(`inset`)** 으로 그린다 — 바깥 spread 링
(`0_0_0_0.5px`)은 제품 게이트가 legacy 로 잡는다(제품 `check-tailwind-theme.mjs`의
`legacyHairlinePatterns`).

**`--dropdown-*` 계열 7개는 제품에 없다 — 현재형으로 인용하지 마라.** `--dropdown-frame` ·
`--dropdown-frame-on-dark` · `--dropdown-ambient-shadow` · `--dropdown-surface-bg` ·
`--dropdown-radius` · `--dropdown-padding` · `--dropdown-item-radius` 일곱은 P#1이 걷어냈고
(마지막 선언은 `globals.css@2b59479f:63-87`, `-on-dark`만 그보다 앞선 `globals.css@5ffc4431:61`),
지금 소비처는 LOUIS 정본을 직접 읽는다. 이름이 남아 있는 것은 `--node-meta-dropdown-shadow`
하나뿐이다.

| 있었던 이름 | 지금 그 역할 |
| --- | --- |
| `--dropdown-frame` | `var(--louis-hairline-inset)` |
| `--dropdown-frame-on-dark` | **없다.** 헤어라인 색이 테마를 따라가면서 역할이 사라졌다 |
| `--dropdown-ambient-shadow` | `var(--louis-elevation-menu)` |
| `--dropdown-surface-bg` | `var(--louis-color-bg-menu)` |
| `--dropdown-radius` | `var(--louis-radius-overlay)` |
| `--dropdown-item-radius` | `var(--louis-radius-overlay-item)` |
| `--dropdown-padding` | `var(--louis-space-overlay-inset)` |

근거는 제품 주석이 직접 적는다(`globals.css:59-62`) — 다만 그 주석이 열거하는 것은 **일곱 중
여섯**이다(프레임 · 앰비언트 · 라운드 · 항목 라운드 · 표면 · 패딩). `--dropdown-frame-on-dark`가
**없다**는 근거는 그 주석이 아니라 `5103ffeb`(소비처 셋을 헤어라인 recipe로 이관)와 제품 게이트의
legacy 목록(`check-tailwind-theme.mjs:239`)이다.

`--dropdown-frame-on-dark`가 따로 있었던 이유는 이름으로는 안 보였다 — 잉크가
흰색(`palette-gray-000` 16%)이라 라이트 카드 위에 쓰면 흰 테두리가 떴다. 앱 테마와 무관하게 **늘
어두운 표면** 위의 칩에만 썼고 소비처는 셋뿐이었다(`VideoPlayer` · `CanvasOnboardingHints` ·
`CreativeMediaClient`). `5103ffeb`가 셋을 모두 헤어라인 recipe로 옮겼다.

**옛 이름을 되살리지 마라.** 이 자리에는 `--glass-dropdown-frame`(5겹)과 `--glass-bevel-*` 계열이
있었고 제품이 그것을 **걷어냈다**. `origin/main`에는 아직 남아 있으므로 그쪽을 읽으면 폐지된 개념이
문서로 되살아난다 — 아래 「정본은 `design` 브랜치다」를 먼저 읽는다. `--dropdown-*`도 마찬가지다:
그 이름을 다시 선언하면 게이트가 잡지 못하는 두 번째 정본이 생긴다.

## 3. 두 면이 같은 색일 때 경계는 색이 아니다

**라이트에서 페이지 바닥과 앱 카드 면은 같은 색이다.**

| 테마 | 페이지 바닥 | 카드 면 | 관계 |
| --- | --- | --- | --- |
| light | `--app-page-bg` → `--gray-900` → `--palette-gray-100` = `#f1f1f3` | `--palette-gray-100` = `#f1f1f3` | **같다** |
| dark | `--app-page-bg` → `--gray-900` → `--palette-gray-900` = `#171b22` | `--palette-gray-800` = `#313640` | 다르다 |

근거: 라이트 `globals.css:709`·`692`, 다크 `globals.css:667`·`650`, 팔레트 `globals.css:30`·`42`·`43`,
카드 면 `globals.css:1345-1351`.

라이트에서 카드의 경계는 색이 아니라 **`box-shadow: var(--louis-hairline-inset)`와
`border-radius: 16px`**로만 난다(`globals.css:1319-1324`). 면 색으로 카드를 찾으면 **카드가 통째로
빠진다.** 그 선은 0.5px `color(srgb 0 0 0 / 0.08)` 한 겹이라 더 잘 놓친다. (이 자리를 잡고 있던
`--dropdown-frame`은 지금 제품에 없다 — 2절을 보라.)

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
  그것은 카드 안 상단 바와 모바일 드로어가 읽는다(`Gnb.tsx:468`·`2068`). 사이드바는 반대로 이
  변수를 라이트에서 **다시 정의하는** 쪽이다(`Gnb.tsx:2050`).

  다크는 씬 루트에 데스크톱 규칙이 없어 `--app-page-bg`(`#171b22`)가 남고 카드는 `#313640`이라
  원래부터 다르다.

  **그래서 앱 셸 화면에서는 면 색으로 카드를 찾을 수 있고, 랜딩에서는 못 찾는다.** 반대로
  **앱 셸에 랜딩의 「같은 색」 규칙을 적용하면 페이지 바닥이 한 계단 밝게 나온다.**
- **719px 이하에서는 경계가 아예 없다.** `border-radius: 0` · `box-shadow: none`이 되어
  (`globals.css:1384-1390`) 카드가 페이지에 완전히 녹는다. 좁은 폭 화면에 카드 테두리를 그리면
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
— 세 씬이 같은 규칙을 쓴다. 카드 면 `globals.css:1349-1351`, 팔레트 `globals.css:42`.

**그래서 ≤719px 에서 경계가 사라지는 것은 반경·그림자 때문만이 아니다.** 배경이 카드 면색으로
함께 이동하므로 **면 색으로도 카드를 찾을 수 없다.** 다크 모바일 프레임을 데스크톱
페이지색(`#171b22`)으로 칠하면 카드(`#313640`)와의 이음매가 그대로 드러나 — 이 절이 말한
「카드가 페이지에 완전히 녹는다」와 **반대 결과**가 나온다.

## 4. 어느 브랜치를 읽고 있는지가 값을 바꾼다

**정본은 `design` 브랜치다. `origin/main`이 아니다** (2026-08-21 확정). 저장소 기본 브랜치도
`main`이 아니라 **`dev`**다(`origin/HEAD -> origin/dev`). 셋 중 아무거나 읽으면 같은 파일이 다른
내용이고, 줄 번호와 토큰 이름이 함께 어긋난다.

실측(2026-08-21): `design`(`a3ed8e03`)과 `origin/main`(`e52dab79`)은 21 앞 / 18 뒤이고 웹 앱 트리에서
**87개 파일**이 다르다. `globals.css`는 1669줄 대 1721줄, 토큰 540개 대 544개이며 그 차이의 본체가
**글래스 섀도우 폐지**다 — `--glass-dropdown-frame`(5겹) · `--glass-bevel-*` · `--glass-inner-shadow-rgb`가
`design`에는 없고 0.5px 한 겹이 그 자리를 받는다. (그때 그 자리를 받은 이름이 `--dropdown-frame`이었다.
그 이름조차 지금은 없고 `var(--louis-hairline-inset)`이다 — 2절을 보라.) `origin/main`은 그 폐지 이전이라
**읽으면 죽은 개념을 문서로 되살린다.**

정적 자산(`public/**`)은 두 브랜치가 동일하므로 로고·아이콘은 어느 쪽에서 뽑아도 같다.

**대응.** 제품 파일을 읽을 때 작업 트리를 읽지 말고 `git show design:<path>`로 읽는다.
읽은 뒤에는 `git rev-parse design:<path>`의 blob 해시를
[product-evidence.lock.json](../../migration/product-evidence.lock.json)과 대조한다. 어긋나면 그
파일을 인용하는 축을 다시 재고 lock을 갱신한다 — `verify-product-evidence`가 같은 일을 한다.

## 5. 라이트 정의에 부정 게이트가 붙어 있다

**라이트 값이 `html[data-theme="light"]` 블록에 있다고 가정하면 틀린다.** 노드 크롬 계열의 라이트
정의는 `html[data-theme="light"]:not(:has([data-landing-walkthrough-dark])), [data-landing-walkthrough-light]`
라는 **부정 게이트가 붙은 별도 규칙**이 소유한다(`globals.css:557-558`). 문서 안에
`data-landing-walkthrough-dark` 요소가 **하나라도** 있으면 문서 전체가 라이트여도 이 블록이
통째로 꺼지고 `:root` 값(`globals.css:548` — 노드 크롬 버튼 면 `palette-gray-600`)으로 되돌아간다.

오염 범위는 토큰 하나가 아니다. 같은 셀렉터가 `@custom-variant light` 정의에도 들어 있어
(`tailwind.css:263`) **모든 `light:` 유틸리티가 함께 꺼진다** — 툴바·줌 컨트롤·노드 카드의
라이트 값이 전부 다크로 측정된다.

| 축 | 라이트 셀렉터 | 게이트 | 근거 |
| --- | --- | --- | --- |
| 노드 크롬 버튼 면 — `--node-chrome-btn-bg` · `-hover` | `html[data-theme="light"]:not(:has(…)), [data-landing-walkthrough-light]` | **있다** | `globals.css:567-573` |
| 모든 `light:` 유틸리티 | 같은 셀렉터 | **있다** | `tailwind.css:263` |
| 페이지 바닥 · `--gray-*` 반전 | `html[data-theme="light"]` | **없다** | `globals.css:679`(→`692`·`709`) |

**두 축의 폭이 달라서 한쪽만 뒤집힌다.** 게이트가 풀린 라이트 문서에서도 페이지 바닥은 라이트
(`--app-page-bg` → `--gray-900` → `--palette-gray-100`)로 간다 — 그 매핑을 소유하는
`html[data-theme="light"]` 블록에는 부정 게이트가 없기 때문이다. 반면 부정 게이트가 소유한 축은
`:root` 값(`--node-chrome-btn-bg: var(--palette-gray-600)`, `globals.css:548`)으로 되돌아가 다크에
남는다. 어느 테마에도 없는 조합이 나온다. 3번이 다루는 「한 계단 밀림」은 두 면이 함께 이동하는
전면 이동이지만, 여기서는 한 축만 움직이는 **부분 반전**이다.

**이 자리의 예였던 확인 모달의 패널 면은 제품에서 사라졌다(2026-08-30 정정).** 라이트 분기
`[html[data-theme=light]_&]:bg-[rgb(var(--palette-gray-100-rgb)/100%)]`
(`GlassConfirmModal.tsx@3c9a1a44:55`)는 `1285e9b7`의 LOUIS 셸 채택과 함께 지워졌고, 지금 그 모달의
면은 `louis-overlay-panel louis-dialog`가 소유한다(`GlassConfirmModal.tsx:152`) — 라이트 분기 자체가
없다. 컴포넌트 쪽에 같은 모양이 남아 있는 자리는 `AdminClient.tsx:117`이고, 그 파일 주석
(`AdminClient.tsx:24-25`)이 「킬스위치가 아니라 평범한 `html[data-theme=light] .foo` 후손 셀렉터」라고
직접 적는다. 다만 admin은 워크스루 데모가 없는 화면이라 부분 반전이 실제로 일어나는 자리는 아니다.

**프레임은 이제 이 게이트를 타지 않는다 — 이 절이 프레임을 예로 들고 있었다.** 그때 예였던
`--dropdown-frame` · `--dropdown-surface-bg`는 제품에 없고(2절), 후속인 `--louis-hairline-inset`의
색은 LOUIS가 `[data-theme="light"]` / `[data-theme="dark"]`에서 부정 게이트 **없이** 선언한다
([tokens.css:424](../../packages/tokens/generated/tokens.css) · `863`). `--node-meta-dropdown-shadow`도
다섯 스코프(`globals.css:525`·`565`·`713`·`757`·`800`)가 전부 **같은 합성**
(`var(--louis-elevation-menu), var(--louis-hairline-inset)`)이라 스코프가 바뀌어도 값이 움직이지
않는다. 앱 카드(`globals.css:1324`·`1341`)도 같다. **부분 반전을 프레임에서 찾으면 없다.**

**이 함정만 이 문서의 우산 규칙에 걸리지 않는다.** 렌더된 값을 재도 소용이 없다 — 워크스루
데모가 켜진 문서에서는 **렌더된 값 자체가 다크로 나오기** 때문이다.

**대응.** 라이트를 재기 전에 `document.querySelector('[data-landing-walkthrough-dark]')`가
`null`인지 확인한다. null이 아니면 그 스냅샷에서 잰 라이트 값은 전부 버린다. 이 문자열은 여러
파일에 흩어져 있지만 **속성을 실제로 다는 곳은 한 곳**이다 — `StaticCreateDemo.tsx:541`
(`data-landing-walkthrough-dark={darkWalkthrough ? "" : undefined}`). 나머지 히트는 주석과
Tailwind 임의 변형 셀렉터 문자열이다. 짝인 `-light`는 같은 파일 `:540` **하나뿐이다** — `NodeMockupCard.tsx` 는 랜딩 개편(`8802565e`)에서
지워졌고 배포본 `df414c24` 에 없다.

**제품 주석을 근거로 삼지 않는다.** `WalkthroughGenerateCursor.tsx:24`는 그 속성을 다는 곳이
`GettingStartedPanel`이라고 적어 두었지만 실제 대입처는 `StaticCreateDemo.tsx:541`이다. 주석이
낡았고, 그 주석을 믿으면 게이트가 풀리는 조건을 잘못 짚는다.

## 6. portal은 스코프를 반만 벗어난다

`document.body`로 portal된 표면은 **DOM 스코프(클래스·부모 변수)에서는 벗어나지만 `html`에
정의된 테마 변수는 계속 상속받는다.** 그래서 **표면색과 프레임이 서로 다른 테마를 따를 수
있다.** 버그가 아니라 의도다 — 맞춰서 고치지 않는다.

랜딩 커뮤니티 드롭다운이 그 형태다. 패널은 `createPortal(…, document.body)`로
`[data-page-root]` 밖에 놓인다(`landing/navigation/Gnb.tsx:849`·`868`). **1번이 인용하는
`Gnb.tsx`와는 다른 파일이다** — 이쪽은 랜딩 GNB다.

- **표면은 클래스가 소유한다.** LOUIS 정본 `.louis-popover`(면 `--louis-color-bg-menu`) 위에
  `html[data-theme=dark] &`가 `var(--palette-gray-100)`으로 **라이트를 못박는다**
  (`landing/navigation/Gnb.tsx:259-265`, 다크 핀은 `:264`). 이 핀이 붙어 있던 자리의 옛 이름은
  `--dropdown-surface-bg`였다(`landing/navigation/Gnb.tsx@2b59479f:193`).
- **프레임은 `html`에서 상속된다.** 지금은 `var(--louis-hairline-inset)`이고, 색
  `--louis-color-stroke-hairline`이 LOUIS의 `[data-theme="light"]` / `[data-theme="dark"]`에서
  갈린다([tokens.css:424](../../packages/tokens/generated/tokens.css) · `863`).

**결과.** 이 드롭다운은 표면이 다크에서 라이트로 못박히는데 **프레임은 상속된 다크를 따른다** —
밝은 면 위에 다크(흰색 8%) 헤어라인이 얹힌다. 제품 주석 자신이 이 핀을 「근거가 남아 있지 않다」고
적고 별건으로 남겨 두었다(`landing/navigation/Gnb.tsx:250-258`).

**이전 판은 여기서 「프레임은 갈리지 않는다 — 테마 무관」이라고 적었다. 지금은 갈린다.** 그 판정은
`--dropdown-frame`이 라이트/다크에 바이트 동일하게 선언되던 때의 것이고, 그 토큰은 제품에 없다.
헤어라인 정본이 LOUIS로 옮겨가면서 색이 테마를 따라가게 됐다(2절).

| 축 | 다크 | 라이트 | 근거 |
| --- | --- | --- | --- |
| 패널 면 | `--palette-gray-100`으로 **못박힘**(핀) | `--louis-color-bg-menu` | `landing/navigation/Gnb.tsx:264` |
| 프레임 | `color(srgb 1 1 1 / 0.08)` | `color(srgb 0 0 0 / 0.08)` | [tokens.css:863](../../packages/tokens/generated/tokens.css) · `424` |
| 라운드 · 패딩 | `--louis-radius-overlay` 16px · `--louis-space-overlay-inset` 6px | 같다 — 테마 무관 | [tokens.css:573](../../packages/tokens/generated/tokens.css) · `585` |
| 항목 라운드 | `--louis-radius-overlay-item` 10px | 같다 — 테마 무관 | [tokens.css:574](../../packages/tokens/generated/tokens.css) |

**판정 절차.** portal된 표면을 그릴 때는 (a) 클래스가 직접 칠하는 값과 (b) `html`에서
상속되는 변수를 **따로** 해석한다. 둘이 다른 테마를 가리키는 것이 정상일 수 있다. 표면
하나가 한 테마를 통째로 따른다고 가정하면 프레임이 통째로 틀린다.

## 7. 아이콘 파일은 렌더되는 그림이 아니다

정적 자산의 아이콘 SVG를 열어 그 도형과 그 색을 그대로 옮기면 **모양도 색도 두께도** 틀린다.
세 층이 각각 파일을 덮는다.

**(a) 도형이 대체돼 있을 수 있다.** 노드 캔버스는 일부 공개 SVG를 인라인 React 글리프로 갈아탔다.
`components/scenes/create/node-canvas-v2/lib/nodeToolbarGlyphs.tsx`의 `ToolbarIconTrashSimple`은
lucide `trash-2`(viewBox 24 · 뚜껑 + 손잡이 + 안쪽 세로 두 줄)이고, 공개 자산의 `TrashSimple.svg`
(viewBox 32 · 안쪽 줄 없음)를 **대체한다**고 주석에 명시돼 있다. `ToolbarIconDownload`도 같은 방식으로
lucide `download`(열린 트레이)가 각진 트레이를 대체한다. 같은 디렉터리의 `icons/*Icon.tsx`는 도형이
공개 자산과 같고 stroke만 `currentColor`로 바꾼 것이라 구분해야 한다.

**(b) 색은 파일의 `fill`/`stroke`가 아니다.** 실제로 화면에 나오는 색은 네 가지 기제 중 하나가 정한다.

| 기제 | 쓰이는 곳 | 실제 색 |
| --- | --- | --- |
| `background-color: currentColor` + `mask-image` | 사이드바 내비, 노드 캔버스 툴바 | 둘레의 `color`. 내비는 `opacity .92`(활성 행 1), 툴바는 비활성 `--gray-200` · 활성 `--gray-000` |
| `filter` | 입력칸 글리프 | `brightness(0) invert(1)` + `opacity .6`(어두운 면) / `brightness(0)` + `.42`(밝은 면) |
| 에셋 교체 | 브랜드 로고 | 어두운 면 `klipse-dark.svg`(흰색) / 밝은 면 `klipse-light.svg`(검정). 단 인증 브랜드 패널은 `themeMode="dark"` 고정이라 항상 흰색 |
| `mask` + 팔레트 알파 | 프로젝트 카드 워드마크 | `--palette-gray-000`(어두운 면) / `--palette-gray-1000`(밝은 면)을 **22%**로 |

인라인 SVG의 `fill="currentColor"`도 마찬가지다. 기본 아바타는 `text-palette-gray-400`(밝은 면) /
`dark:text-palette-gray-600`(어두운 면)이라, 파일만 보면 색을 알 수 없다.

**(c) 두께는 크기에 비례하지 않는다.** 노드 캔버스는 `iconScreenStroke.ts`의
`nodeIconStrokeScreenPx(size)`로 **화면 두께를 크기별로 고정**한다 — 14px→**0.88**(비례값 0.875가 아니라
디자인 확정값), 16px→1, 그 밖은 `size / 16`(20px→1.25 = `NODE_CHROME_STROKE_SCREEN_PX`, 32px→2).
user-space 두께는 `screenPx × viewBox / size`로 역산한 값이라, 파일에 적힌 `stroke-width`를 그대로
읽으면 틀린다.

**판정 절차.** 아이콘을 옮길 때는 자산 파일이 아니라 **그 아이콘을 쓰는 컴포넌트**를 먼저 읽는다.
(1) 그 이름의 인라인 글리프가 있는지, (2) 색을 정하는 기제가 무엇인지, (3) 노드 캔버스 안이면
화면 두께가 얼마인지 — 셋을 확인한 뒤에 그린다.

**Figma로 옮길 때.** Figma에서 아이콘 프레임을 `resize()`로 줄이면 **획 두께는 따라 줄지 않는다.**
32 격자에 획 2.4인 글리프를 20px 자리에 놓으면 제품의 실효 1.5px 대신 2.4px이 남는다. `rescale()`을
쓰거나 배치 뒤 `strokeWeight × (표시 크기 / 원본 viewBox)`로 다시 계산한다. 노드 캔버스 안이면
비례식이 아니라 위의 고정 두께표를 쓴다.

## Acceptance tests

- 1과 2는 `measure-product-components.mjs`가 렌더된 값을 재는 축에 대해서는 구조적으로 막힌다 —
  선언이 아니라 계산된 스타일을 읽기 때문이다. **재지 않는 축은 막히지 않는다.** 미검증 축은
  [unverified-values.json](../../figma/unverified-values.json)이 명부로 관리한다.
- 3은 아직 게이트가 없다. 면 대조는 색만 보므로 "같은 색"을 오류로 신고하지 않고 카드 누락도
  잡지 못한다. 재조립 template의 카드 유무는 `verify-figma-parity`의 template 축에 의존한다.
- 4는 `verify-product-evidence`가 blob 해시로 잡는다. 다만 **인용 좌표가 아니라 파일 단위**라,
  같은 파일 안에서 줄이 밀린 것은 잡히지 않는다.
- 7은 게이트가 없다. 아이콘 도형·기제·두께는 모두 컴포넌트 쪽 선언이라 렌더된 값을 재는 축에
  걸리지 않는다. 옮긴 아이콘마다 (표시 크기 · 원본 viewBox · 획) 세 값을 함께 적어 두는 것이
  현재로선 유일한 방어다.
- 새 컴포넌트의 값을 정할 때 이 문서의 항목을 확인했다는 근거는 EXPECT의 제품 대조 행이며,
  문장으로 대신하지 않는다.
