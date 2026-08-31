---
id: foundation-color-theme
status: experimental
authority: normative
---

# Color & Theme

Color & Theme은 색 값을 나열하는 문서가 아니라, 같은 의미가 light/dark 환경에서 예측 가능한 역할로
해석되게 하는 계약이다. P2 source와 platform projection은 로컬 release-candidate다. Package public
release, 제품 adoption과 published Figma library는 아직 `not-ready`다.

## Source and artifacts

| 구분           | 계약 경로                                     | 현재 상태               |
| -------------- | --------------------------------------------- | ----------------------- |
| DTCG source    | `packages/tokens/src/klipse.tokens.json`      | local release-candidate |
| Validator      | `scripts/lib/token-model.mjs`                 | local release-candidate |
| CSS            | `packages/tokens/generated/tokens.css`        | done projection         |
| JavaScript     | `packages/tokens/generated/index.js`          | done projection         |
| TypeScript     | `packages/tokens/generated/index.d.ts`        | done projection         |
| Resolved JSON  | `packages/tokens/generated/tokens.json`       | done projection         |
| Figma proposal | `packages/tokens/generated/figma.tokens.json` | done, not published     |
| Manifest       | `packages/tokens/generated/manifest.json`     | done projection         |
| Diff baseline  | `packages/tokens/baseline/manifest.json`      | local release-candidate |

Raw color와 semantic color는 단일 DTCG source 안의 논리적 계층이다. 모든 artifact는 projection이며 직접
수정하지 않는다.

## Token model

1. **Primitive**는 팔레트 값과 투명도처럼 의미 없는 재료를 소유한다.
2. **Semantic**은 background, foreground, border, accent, feedback, focus 같은 사용 목적을 소유한다.
3. P3의 component token은 semantic token만 참조하며 primitive를 직접 참조하지 않는다.

제품 코드는 semantic color만 소비한다. primitive 이름을 화면 의미로 사용하거나 기존 CSS 변수 이름을
새 정본으로 승격하지 않는다.

### 예외 — 면이 테마를 따르지 않으면 그 위 전경도 따르지 않는다

면 색이 mode와 무관하게 고정된 자리(브랜드 면, 사진, 항상 어두운 오버레이, 리터럴 hex 배경)에서는 그
서브트리의 전경색·테두리도 **두 mode에서 같은 값**이어야 한다. 판정 기준은 하나다 — 면이 semantic
token이 아니라 리터럴·이미지·mode 불변 값으로 칠해졌으면 그 위 전경도 mode 불변이다.

표현 방식은 primitive 직접 소비가 **아니다.** CSS 게이트가 그 경로를 막는다. banner-carousel이 이미 쓰는
방식대로 **light/dark에 같은 primitive를 alias한 semantic token**을 세운다 — 값이 우연히 같은 것이 아니라
같아야 한다는 계약이다. 다만 기존 `color-media-*` 계열은 이름이 사진에 묶여 있어 사진이 아닌 고정 면
(브랜드 블루)을 덮지 못한다. **이 계열의 일반화, 또는 `color-on-fixed-surface-*` 신설이 현재 결손이다.**

| 이름 | light | dark |
| --- | --- | --- |
| `--gray-000` (semantic) | `#000000` | `#fafafa` |
| `--palette-gray-000` (primitive) | `#fafafa` | `#fafafa` |

제품 정본 — auth 브랜드 패널의 면은 `bg-accent-primary`에 `/footer-logo-bg.svg`를 얹고 테마 분기가 없다
(`AuthStatusCard.tsx:27-30` · `login/page.tsx:43-47` · `app/signup/page.tsx:37-40`). 그 위 슬로건 전경은
`text-fg-inverse`, 즉 두 mode 모두 `#fafafa`다(`AuthStatusCard.tsx:41` · `login/page.tsx:63` ·
`app/signup/page.tsx:51`). 같은 부류로 노드 캔버스 카드 외곽선도 semantic이 아니라 `--palette-gray-600-rgb` /
`--palette-gray-000-rgb`을 쓴다(`components/scenes/create/node-canvas-v2/index.tsx:352-353`).

**이 두 축은 2026-08-24 배포본에서 이미 위 결손을 메웠다.** 예전에는 면이 `bg-[#0093ff]` 리터럴이고
전경이 `text-palette-gray-000` primitive 별칭이었으며, 이 문단도 「브랜드 면 색 `#0093ff` 자체는 토큰화
대상이 아니다 — 리터럴로 남긴다」고 적고 있었다. 지금은 둘 다 **light/dark 두 mode가 같은 값인 semantic**
이다 — `--louis-color-accent-primary`는 양쪽 `#0088ff`, `--louis-color-fg-inverse`는 양쪽 `#fafafa`다.
`#0093ff`는 배포본 코드에 더는 없고 `/node-canvas.svg` 같은 자산 안에만 남아 있다. 다만 `color-media-*`
계열의 일반화는 여전히 결손이다 — 코브랜드 면(`/aws/signup`의 `#ff9900`)은 아직 리터럴이다
(`aws/signup/page.tsx:89`).

**규칙은 「항상 고정을 써라」가 아니다.** 같은 카드 안에서 축이 갈린다 — 면이 테마를 따르는 폼 패널의
제목은 시맨틱 `text-fg-primary`가 맞다(`AuthStatusCard.tsx:78`). 면이 고정이면 전경도 고정, 면이 테마를
따르면 전경도 따른다.

**이걸 모르면 틀린다.** 슬로건 색을 이름만 보고 `--gray-000`에 매핑하면 라이트 테마에서 파란 면 위 글자가
검정으로 뒤집혀 읽히지 않는다. 반대로 폼 제목을 고정값으로 옮기면 라이트에서 흰 글자가 흰 면에 깔린다.

### 예외 — 블러 표면의 tint 알파는 램프 단계가 아니다

흐린 표면(`backdrop-filter`)에 얹는 아주 옅은 흰색·검정은 **색 램프에서 고른 값이 아니다.** 그
층이 하는 일은 색을 나르는 것이 아니라 **흐림 위에 아주 옅은 기울기를 주는 것**이고, 알파 램프의
가장 고운 단(4%)보다 아래에서 논다.

판정 근거는 두 매체가 다르다는 사실이다.

- **CSS 는 fill 이 없어도 블러가 렌더된다.** 랜딩 GNB 의 점진 블러가 그 증거다 — `blur(12px)` 에
  하강 마스크만 걸고 **배경색이 아예 없다**(`landing/navigation/Gnb.tsx` 의 `HEADER_BLUR`).
- **Figma 는 fill 이 없으면 배경 블러를 아예 그리지 않는다.** 그래서 순수하게 블러를 지탱하려고
  생긴 알파 0 fill 이 파일에 남는다. 되읽기는 그것을 **이미 원시 색으로 세지 않는다**
  (`build-figma-snapshot.mjs` 머리말: 「완전히 투명한 fill 은 색이 아니다」).

그 예외를 **알파 0 뿐 아니라 tint 알파까지** 넓힌다. 정본은 MediaCard 의 정보 바다 — 흰색 1% 를
점진 블러 층에 얹고, 1% 는 알파 램프(4 · 8 · 12 …)에 자리가 없다. 램프에 `01` 을 만들면 한 자리를
위해 계단이 촘촘해지고 「그럼 02 도, 03 도」가 열린다. 제품을 4% 로 올리면 바탕 밝기에 따라
255 중 1.7~6.2 만큼 밝아진다 — 보이지는 않지만 **디자이너가 고른 값이 아닌 값**이 된다.

**경계를 좁게 둔다.** 이 예외가 덮는 것은 **흐린 표면에 얹은 흰색·검정 tint 의 알파 하나**뿐이다.
색상(흰·검 이외), 블러 반경, 그 위에 놓이는 전경색은 전과 같이 토큰이어야 한다.

**결손 — 블러 반경에는 이 예외가 적용되지 않는데 정의가 모자란다.** 블러 토큰은 숫자 계단이 아니라
의미 이름이다(`surface` 10 · `panel` 12 · `glass` 16 · `toast` 16). 제품이 실제로 쓰는 반경은 전에
여덟 가지였고 그중 **여섯(2 · 4 · 8 · 14 · 18 · 20, 합계 11곳)이 이름을 갖지 못했다.**

**20 은 2026-08-27 에 목록에서 빠졌다.** 유일한 소비처가 MediaCard 의 정보 바 하나였는데, 그 띠가
ProjectCard 의 제목 띠와 같은 점진 블러로 합쳐지면서 반경이 `surface`(10) 로 내려왔다. `blur/20`
토큰을 세우지 않고 값이 사라진 것이므로 이름 없는 반경은 **일곱 가지 중 다섯(2 · 4 · 8 · 14 · 18,
합계 10곳)** 이 된다. 나머지 다섯은 그대로 남아 있고, 다섯을 한 번에 보고 의미 이름을 붙이는 것이
여전히 맞는 순서다.

## Theme modes

- `light`와 `dark`를 필수 mode로 둔다.
- theme-dependent semantic token은 두 mode 모두에서 명시적으로 resolve되어야 한다.
- 누락된 dark 값을 light 값으로 암묵 fallback하지 않는다.
- CSS는 기본 theme와 `[data-theme="dark"]` override의 semantic custom property를 결정론적으로 생성한다.
- 생성 CSS는 light/dark selector에 대응하는 `color-scheme`을 선언한다. 소비 제품이 해당 selector를
  document에 적용하고 browser chrome·SSR 초기 mode와 동기화하는 동작은 P3/P5에서 검증한다.
- SSR과 첫 paint에서 사용할 theme 결정은 소비 제품이 소유하지만, 생성 CSS는 theme 전환 중 이름이나
  cascade 순서를 바꾸지 않는다.
- forced-colors/high-contrast 환경은 별도 색 mode로 가장하지 않고 system color와 focus visibility
  대체 규칙을 문서화한다.

### 소비 스코프가 mode를 다시 적용하는 자리

DS-D-0010은 `[data-page-root]` 같은 DOM 상태 스코프를 토큰 축이 아니라고 못 박고 해결 책임을 소비 계층에
넘겼다. 제품은 그 재적용을 **요소 자신의 선언**으로 한다 — 여기가 그 값이다.

**이 절의 앞선 판은 뒤집혔다.** 그때 `[data-page-root]`는 `--gray-000`부터 `--gray-1000`까지 11개와
대응 `-rgb` 11개를 전부 팔레트 원시값으로 못 박아, 라이트 테마를 켠 사용자에게도 랜딩이 항상 검정
배경·흰 글자였다. 그 위에서 랜딩 홈만 다시 밝은 램프로 뒤집고 그 안의 몇몇 섹션이 또 되돌리는
**세 겹**이 쌓여 있었다. 배포본 `df414c24`는 세 겹을 다 걷어냈다 — 그 사유가 제품 소스 주석에 그대로
적혀 있다(`globals.css:1534-1541`). **랜딩은 이제 테마를 따른다.**

- 랜딩·마케팅 트리 루트 `[data-page-root]`가 지금 세우는 것은 **면 계열 여섯**뿐이고, 값은 전부 LOUIS의
  `landing-*` 시맨틱에서 온다 — `--page-bg`·`--panel`·`--panel-strong`·`--line`·`--text-soft`·
  `--text-muted`가 각각 `var(--louis-color-landing-*)`이다(`globals.css:1543-1548`). 회색 램프는 손대지
  않으므로 `html[data-theme]`가 세운 값이 그대로 흐른다.
- **알파를 여기서 다시 계산하지 않는 것이 규칙이다.** `landing-*`는 테마별 값이 이미 정의돼 있고
  (light `#f1f1f3` / dark `#000000` 등), 소비 스코프가 알파를 다시 쓰면 정본이 둘이 된다. 이것이 랜딩
  섹션들이 `bg-gray-900` 대신 `var(--panel-strong)`을 쓰는 이유이기도 하다.
- 블록은 **`@layer components` 안**에 있다(`globals.css:1176`이 그 레이어를 연다). 파일 끝에 있는 것은
  마케팅 훅을 한곳에 모으려는 조직상의 선택이고 **캐스케이드 승패에 의존하지 않는다** — 사유가
  `globals.css:1529-1531`에 있다. 앞선 판이 「`@layer` 밖에 두어 상속을 이긴다」고 적었던 것은 그때의
  구조였고 지금은 아니다.
- 요소 자신은 `background: var(--page-bg); color: var(--gray-000)`을 갖는다(`globals.css:1552-1553`).
  `background`가 단축인 채로 남아 있는 것도 계약이다 — 가격 페이지가 「이 단축이 `background-clip` 등
  롱핸드를 초기화한다」를 근거로 삼고 있다.

| 토큰 | 앱 light | 앱 dark | `[data-page-root]` 안 |
| --- | --- | --- | --- |
| `--gray-000` | `#000000` | `#fafafa` | **테마를 따른다 — 재정의 없음** |
| `--gray-900` | `#f1f1f3` | `#171b22` | **테마를 따른다 — 재정의 없음** |
| `--panel-strong` | — | — | `var(--louis-color-landing-panel-strong)` (light `rgb(0 0 0/8%)` · dark `rgb(255 255 255/8%)`) |

**램프를 건드리는 예외는 이제 없다.** 2026-08-31 까지 `[data-page-root] #pricing-faq` 가
`--gray-000`·`--gray-000-rgb`·`--text-soft` 를 검정 램프로 복구하고 있었는데 — 가격 페이지가
배경만 `bg-palette-gray-100!` 로 밝게 고정하던 시절의 반창고였다 — 그 고정이 사라지면서
근거가 죽었고, **바닥이 다크에서 검정을 따르는 지금은 오히려 해로웠다**(잉크를 검정으로
못 박으면 검은 바닥에 묻힌다). 제품에서 둘 다 걷었다.

그 반창고는 **반쪽만 들고 있었다는 점도 함께 기록해 둔다.** `@theme inline` 이 `--gray-000`
을 빌드 시점에 접어 넣어 `.text-gray-000` 은 `var(--louis-color-gray-000)` 로 컴파일되므로,
이런 핀은 `bg-*`·`text-*` 유틸리티에 **닿지 않고** 임의값으로 직접 적은 자리에만 걸린다.
실측(다크 `/pricing`): 제목 1.08:1 · 질문 1.07:1 로 그대로 사라졌고 핀이 닿은 `+` 아이콘만
3.92:1 로 살아 있었다. **램프를 래퍼에서 못 박아 고치려는 시도는 이 이유로 성립하지 않는다.**

색이 아닌 예외로 `[data-page-root] [data-reveal]` 이 진입 애니메이션을 무력화하는 규칙은
그대로 있다(`globals.css:1597-1601`).

**이걸 모르면 틀린다 — 방향이 반대다.** 랜딩·가격 화면을 **다크 전용**으로 그리면 틀린다. Figma 시안이
다크 렌더일 뿐이고 제품은 두 테마를 다 그린다. 라이트에서 무너지는 자리는 램프 인덱스를 대칭으로
뒤집어서는 성립하지 않는 역할들이며(면·선·보조 글자), 그것을 `landing-*`가 소유한다.

## Alias and naming rules

- alias는 같은 type만 가리키며 cycle과 dangling reference를 허용하지 않는다.
- semantic token이 primitive로 resolve되는 방향만 허용하고 primitive가 semantic token을 참조하지 않는다.
- source ID는 CSS, JavaScript, TypeScript와 Figma 이름이 바뀌어도 추적 가능한 안정 식별자다.
- 플랫폼 이름 변환 충돌은 build error다.
- alpha가 있는 색은 실제 배경과 함께 contrast pair를 선언한다.

## 노드 생성 중 placeholder의 매체별 accent

노드가 생성 중일 때 카드 안 아이콘과 캡션은 매체별 accent 램프를 쓴다. 아이콘은 500 셰이드로 두 mode
공통이고 캡션만 mode로 갈린다 — 밝은 100 셰이드는 라이트의 밝은 카드 면에서 대비가 무너지므로 700으로
낮춘다.

| 매체 | 아이콘 (두 mode 공통) | 캡션 dark | 캡션 light | 근거 |
| --- | --- | --- | --- | --- |
| Image | `--accent-mint-500` `#00c68e` | `#e5fff7` | `#008f67` | `ImageNode.tsx:326` · `ImageNode.tsx:345-346` |
| Video | `--accent-sky-500` `#0ea5e9` | `#e0f5ff` | `#0369a1` | `VideoNode.tsx:240` · `VideoNode.tsx:261-262` |
| Text | `--accent-yellow-500` `#ffb200` | `#fff5d6` | `#b87600` | `TextNode.tsx:332` · `TextNode.tsx:346-347` |
| Edit | `--accent-violet-500` `#6055ff` | `#ebe8ff` | `#3528b8` | `EditNode.tsx:400` · `EditNode.tsx:416-417` |

- **캡션은 색을 두 곳에 같은 값으로 선언한다.** `color`와 `--caption-tone` 둘 다다. 쉬머가
  `background-clip: text` + `-webkit-text-fill-color: transparent`로 그려져 `color`가 무효화되므로
  (`ImageNode.tsx:349-351`), `color`만 고치면 화면이 바뀌지 않는다. 감속 모션 분기는
  `-webkit-text-fill-color`를 `--caption-tone`에서 되돌린다(`ImageNode.tsx:353`). 네 노드가 같은 패턴이다.
- Tts/Bgm(audio) 노드에는 이 생성 중 아이콘·캡션 accent가 없다. audio는 영역 차오름으로 진행을 표시한다.

**토큰 결손 두 건.** LOUIS에 `color-sky-*` 램프가 없다 — `color-blue-500`(`#0088ff`)은 제품 sky-500
`#0ea5e9`와 다른 색이므로 Video를 blue로 매핑하면 틀린다. 그리고
`color-node-video-icon`·`color-node-video-surface`가 없다 — video는 `color-node-video-accent` 하나뿐이고
나머지 매체는 icon·surface·accent 세 벌을 갖는다. Video 노드를 그리려면 sky 램프를 먼저 세운다.

## Accessibility

- 일반 텍스트 foreground/background pair는 4.5:1 이상을 목표로 한다.
- 큰 텍스트와 의미 있는 비텍스트 그래픽·control boundary는 3:1 이상을 목표로 한다.
- success, warning, danger, selected 상태는 색 외의 텍스트·아이콘·형태 신호를 함께 제공한다.
- contrast 검사는 임의의 모든 색 조합이 아니라 source에 선언한 허용 pair를 대상으로 한다.

### 인라인 danger 알림 — 알파 쌍과 색 외 신호 결손

제품의 인라인 오류 박스는 danger 색 하나를 **알파 두 칸으로** 쓴다. 면 8%, 테두리 16%로 정확히 1:2다.
두 알파 모두 DS-D-0010이 정규화한 10단 알파 사다리 위 칸이므로 새 값이 아니다.

| 부위 | 제품 값 | LOUIS 소유자 |
| --- | --- | --- |
| 면 | `rgb(var(--accent-red-500-rgb) / 8%)` | 없음 — `color-bg-danger`는 불투명 틴트다 |
| 테두리 | `1px solid rgb(var(--accent-red-500-rgb) / 16%)` | 없음 — `color-stroke-danger`는 불투명 `#ff4b59`다 |
| 전경 | `var(--accent-red-500)` `#ff4b59` | `color-accent-danger` |

기하는 반경 12px · 패딩 12px 16px · 타이포 body-14(14px / 1.5) · `margin: 0`이고 세로 간격은 부모 컬럼이
준다(`billing-success/page.tsx:108-113`). 한 화면에 같은 상수로 두 박스가 연달아 설 수 있다
(`billing-success/page.tsx:432-438`).

**이걸 모르면 틀리는 것 둘.** 첫째, 면을 `color-bg-danger`로 매핑하면 안 된다 — 그 토큰은 light
`#ffe5e8` · dark `#541119`로 뒤집히는 불투명 값이고, 제품 값은 뒤 배경이 비치는 red-500 8% 알파다.
둘째, 이 알림에는 아이콘도 접두 문구도 없다 — 색이 유일한 신호다. 위 「색 외의 텍스트·아이콘·형태 신호」
규칙을 정면으로 어기므로, 소유자 컴포넌트를 세울 때 함께 고친다.

## Acceptance tests

이 절은 P2 local RC에서 자동화한 source·생성물 검사다. 실제 component의 forced-colors, 상태별 비색상
신호와 화면 대비는 P3/P5 소비 구현 게이트이며 아직 `not-ready`다.

- schema가 알 수 없는 field, 잘못된 color type과 중복 ID를 거부한다.
- alias graph가 cycle, dangling reference와 type mismatch를 거부한다.
- 모든 semantic color가 light/dark에서 하나의 값으로 resolve된다.
- 선언된 contrast pair가 각 mode에서 기준을 통과한다.
- CSS의 semantic mode/output과 JS·JSON·Figma proposal·manifest의 primitive/semantic color graph가 같은
  normalized model과 일치한다. 생성 CSS의 light/dark `color-scheme` selector도 검사한다.
- alias target, description/deprecation과 source provenance는 JS·JSON·Figma proposal·manifest에서 source와
  일치한다.
- 같은 process에서 동일 source를 두 번 render한 결과가 byte-for-byte 동일하다.
- Figma proposal 생성만으로 manifest의 Figma 상태를 `partial` 또는 `done`으로 올리지 않는다.
