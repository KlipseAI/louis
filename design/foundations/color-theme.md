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

### 알파 사다리의 바탕은 둘이다 — 팔레트 끝과 순검정

검정 쪽 알파 원시값은 바탕이 다른 두 벌이다. 계단은 둘 다 [DS-D-0026](../governance/decisions/DS-D-0026-alpha-scale.md)
의 16단이다.

| 원시 | 바탕 | 누가 읽나 |
| --- | --- | --- |
| `static-black-alpha/*` | `palette-gray-900` `#171b22` | LOUIS 가 소유하고 제품도 `var(--louis-color-*)` 로 읽는 시맨틱 — `stroke-hairline` · `dim-modal` · `accent-secondary` 등 |
| `static-pure-black-alpha/*` | `static/black` `#000000` | 제품이 직접 쓰는 잉크 알파를 비추는 시맨틱 — `color/gray/000-alpha/*` · `scrollbar/thumb(-hover)` 의 라이트 |

제품의 투명 잉크 `rgb(var(--gray-000-rgb) / N%)` 는 라이트에서 순검정, 다크에서 `palette-gray-000`(`#fafafa`) 바탕이다
(통합 판 `54b62a8aa` `globals.css:815` · `:726`). 그래서 그것을 비추는 `color/gray/000-alpha/*` 는 라이트가
`static-pure-black-alpha`, 다크가 `static-white-alpha`(`#fafafa` 바탕)다 — 이름이 「`gray/000` 의 N%」이고 값도 그렇다.
**새 시맨틱이 제품의 잉크 알파를 비춘다면 `color/gray/000-alpha/*` 를 읽고, LOUIS 가 정하는 면 · 선이면 `static-black-alpha`
계열 시맨틱을 읽는다**([DS-D-0082](../governance/decisions/DS-D-0082-canvas-semantics-and-product-ink-alpha.md)).

### 예외 — 면이 테마를 따르지 않으면 그 위 전경도 따르지 않는다

면 색이 mode와 무관하게 고정된 자리(브랜드 면, 사진, 항상 어두운 오버레이, 리터럴 hex 배경)에서는 그
서브트리의 전경색·테두리도 **두 mode에서 같은 값**이어야 한다. 판정 기준은 하나다 — 면이 semantic
token이 아니라 리터럴·이미지·mode 불변 값으로 칠해졌으면 그 위 전경도 mode 불변이다.

표현 방식은 primitive 직접 소비가 **아니다.** CSS 게이트가 그 경로를 막는다. banner-carousel이 이미 쓰는
방식대로 **light/dark에 같은 primitive를 alias한 semantic token**을 세운다 — 값이 우연히 같은 것이 아니라
같아야 한다는 계약이다. 다만 기존 `color-media-*` 계열은 이름이 사진에 묶여 있어 사진이 아닌 고정 면
(브랜드 블루)을 덮지 못한다. **이 계열의 일반화, 또는 `color-on-fixed-surface-*` 신설이 현재 결손이다.**

**2026-10-07 보강 — 사진 위 보조 글자 둘과 무대 면.** 사진 · 영상 위 글자는 `color-media-foreground-dark`
하나뿐이어서 제품이 보조 글자를 `color-mix` 와 팔레트 리터럴로 제각각 적었다(랜딩 `MediaCard` · `photoBand.ts` 72%,
`FinalCtaScene` · `CompositionShowcase` 88%, 모델 배너 86% · 60%, 소식 날짜 `palette-gray-300`). 두 칸만 연다.

| 이름 | light | dark | 근거 |
| --- | --- | --- | --- |
| `color-media-foreground-dark-soft` | `static-white-alpha/72` | `static-white-alpha/72` | 72% 가 가장 많이 쓰인다 — `MediaCard` 부제와 `BAND_INK_SOFT`(앰배서더 · 모델 쇼케이스의 여섯 역할)가 같은 값이다 |
| `color-media-foreground-dark-muted` | `static-white-alpha/64` | `static-white-alpha/64` | 모델 배너의 사양 줄 60% 와 소식 날짜(`palette-gray-300` `#a5a8ad`)를 한 칸으로 받는다. 알파 사다리에 60 이 없고(`…56 · 64 · 72…`) 4 점 차이는 구분되지 않아 새 primitive 를 더하지 않고 `64` 로 올렸다 |

이름은 기존 규칙(`-bright` · `-dark` = 어느 쪽 글자인가)에 단계 접미사를 붙였다. **`-bright` 쪽 soft · muted 는 열지 않았다** —
쓰는 자리가 없다. 값은 `media-foreground-dark`(`palette-gray-000` `#fafafa`)의 알파가 아니라 `static-white-alpha`(`#ffffff`)
라 5/255 쯤 밝지만, `media-control-foreground`(`static-white-alpha/88`)가 이미 같은 방식이다.

**2026-10-12 보강 — 사진 위 배지와 밝은 쪽 soft**([DS-D-0083](../governance/decisions/DS-D-0083-deck-feedback-triage.md)).
위에서 「쓰는 자리가 없다」던 `-bright` 쪽 soft 를 프로젝트 카드 띠(`data-ink="on-bright"`)가 연다. 사진 위 상태 배지
(`badge[data-surface="media"]`)의 면과 글자 여섯 칸도 같은 원칙(두 mode 같은 값)으로 세운다.

| 이름 | light | dark | 근거 |
| --- | --- | --- | --- |
| `color-media-foreground-bright-soft` | `static-black-alpha/72` | `static-black-alpha/72` | `-dark-soft` 의 짝. `static-black-alpha` 바탕이 `palette-gray-900` 이라 `media-foreground-bright` 의 72% 다 |
| `color-media-badge-surface` | `palette-gray-800` | `palette-gray-800` | 하이라이트 아카이브 카드 상태 칩 면 |
| `color-media-badge-foreground` | `palette-gray-200` | `palette-gray-200` | 중립 글자 |
| `color-media-badge-foreground-success` · `-warning` · `-danger` · `-info` | `green-400` · `yellow-400` · `red-400` · `blue-400` | 같음 | 면 위 7.40 · 8.33 · 5.00 · 5.07 |

**88% · 86% 는 모으지 않았다.** `FinalCtaScene` · `CompositionShowcase` 88%(소유자가 시안을 보고 고른 값)와 모델 배너 86% 는
72 에서 16 · 14 점 떨어져 눈에 띄게 밝다 — soft 로 모으면 값이 바뀐다. 헤드라인 바로 아래 한 줄 설명 자리라, 세 번째 칸(`-lede`)을
열지, 기존 `media-control-foreground`(88%)로 보낼지, soft 로 내릴지는 **판정 필요**다.

**검은 무대 면은 `color-media-stage-surface`(두 mode 모두 `static.black`)다.** 하이라이트 화면의 영상 무대와 판 목록 썸네일 바탕
(`highlightSceneStyles.ts` — 제품 커밋 `6fdb1eb2b` 가 `#000` 을 `palette-gray-1000` 으로 바꿨다)이 쓰고, 영상이 `contain` 으로
서는 자리의 검은 여백이다. `media-scrim-dark` 는 값이 같지만 사진 위에 깔려 글자를 받치는 **스크림**이라 이름이 참이 아니다
([DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md)). 무대 위 나머지는 새로 만들지 않았다 — 글리프 88% 는
`media-control-foreground`, 보조 글자는 위 soft · muted, 컨트롤 면은 `media-control-surface`(28%)와 겹친다. 겹치지 않는 제품 값
둘은 열지 않고 남겼다: 무대 전체를 덮는 «파일 선택» 버튼의 호버 4%(`static-white-alpha/04` 가 이미 있다)와 «크게 보기» 원형 버튼
면 56%(`media-control-surface` 28% 의 두 배 — 흐림 없이 영상 위에 직접 뜨는 자리라 더 진하다). 후자를 `media-control-surface`
변형으로 올릴지, 무대의 빈 상태 보조 글자 56% 를 muted(64%)로 모을지는 **판정 필요**다. Figma 변수는 아직 없다.

| 이름 | light | dark |
| --- | --- | --- |
| `--gray-000` (semantic) | `#000000` | `#fafafa` |
| `--palette-gray-000` (primitive) | `#fafafa` | `#fafafa` |

제품 정본 — auth 브랜드 패널은 통합 판 `76b6cf15` 에서 인증 일곱 화면이 한 벌로 나눠 쓰는 `AuthBrandPanel`
로 모였다(라우트 그룹 `(auth-brand)` 의 레이아웃이 갖는다). 면은 배경 영상과 고정 스크림
(`media-scrim-dark` 40%)이 덮고, `bg-accent-primary` 는 영상이 오기 전이나 재생이 막혔을 때의 바닥으로
남아 테마 분기가 없다(`AuthBrandPanel.tsx:31` · 영상과 스크림 `:40-51`). 예전에 얹던 `/footer-logo-bg.svg` 는
걷혔다. 그 위 슬로건 전경은 `text-fg-inverse` 에서 `media-foreground-dark` 로 옮겨 갔다 — 영상 위라
테마를 따라 뒤집히는 잉크를 쓰면 안 되는 자리이고, 두 mode 모두 `#fafafa`다(`AuthBrandPanel.tsx:77`).
같은 부류로 캔버스 카드 외곽선도 semantic이 아니라 `--palette-gray-600-rgb` /
`--palette-gray-000-rgb`을 쓴다(`components/scenes/create/node-canvas-v2/index.tsx:372-373`).

**이 두 축은 2026-08-24 배포본에서 이미 위 결손을 메웠다.** 예전에는 면이 `bg-[#0093ff]` 리터럴이고
전경이 `text-palette-gray-000` primitive 별칭이었으며, 이 문단도 「브랜드 면 색 `#0093ff` 자체는 토큰화
대상이 아니다 — 리터럴로 남긴다」고 적고 있었다. 지금은 둘 다 **light/dark 두 mode가 같은 값인 semantic**
이다 — `--louis-color-accent-primary`는 양쪽 `#0088ff`, 전경은 `--louis-color-fg-inverse`(양쪽 `#fafafa`)를
거쳐 통합 판에서는 `--louis-color-media-foreground-dark`(양쪽 `#fafafa`)다.
`#0093ff`는 배포본 코드에 더는 없고 `/node-canvas.svg` 같은 자산 안에만 남아 있다. 다만 `color-media-*`
계열의 일반화는 여전히 결손이다 — 코브랜드 면(`/aws/signup`의 `#ff9900`)은 아직 리터럴이다
(`aws/signup/page.tsx:89`).

**규칙은 「항상 고정을 써라」가 아니다.** 같은 카드 안에서 축이 갈린다 — 면이 테마를 따르는 폼 패널의
제목은 시맨틱 `text-fg-primary`가 맞다(`AuthStatusCard.tsx:49`). 면이 고정이면 전경도 고정, 면이 테마를
따르면 전경도 따른다.

**이걸 모르면 틀린다.** 슬로건 색을 이름만 보고 `--gray-000`에 매핑하면 라이트 테마에서 파란 면 위 글자가
검정으로 뒤집혀 읽히지 않는다. 반대로 폼 제목을 고정값으로 옮기면 라이트에서 흰 글자가 흰 면에 깔린다.

### 예외 — 블러 표면의 tint 알파는 램프 단계가 아니다

흐린 표면(`backdrop-filter`)에 얹는 아주 옅은 흰색·검정은 **색 램프에서 고른 값이 아니다.** 그
층이 하는 일은 색을 나르는 것이 아니라 **흐림 위에 아주 옅은 기울기를 주는 것**이고, 알파 램프의
가장 고운 단(4%)보다 아래에서 논다.

판정 근거는 두 매체가 다르다는 사실이다.

- **CSS 는 fill 이 없어도 블러가 렌더된다.** 랜딩 GNB 의 점진 블러가 그 증거다 — `blur(12px)` 에
  하강 마스크만 걸고 **배경색이 아예 없다**(`landing/navigation/Gnb.tsx` 의 `HEADER_BLUR`). 메가 시트가 열린 동안만 56% 틴트를
  깐다 — 그 예외는 [Landing Shell](../patterns/landing-shell.md) 의 Mega sheet 가 갖는다.
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
- theme-dependent 토큰을 `var()`로 묶어 발행하는 recipe(`--louis-hairline-inset` 등)는 색 토큰과 같은
  `[data-theme]` 스코프마다 다시 선언한다. custom property 값의 `var()`는 선언한 요소에서 풀리고 자손은
  풀린 값을 상속하므로, `:root`에만 두면 중첩된 테마 스코프가 바깥 테마의 값을 물려받는다
  ([DS-D-0068](../governance/decisions/DS-D-0068-hairline-recipe-per-theme-scope.md)).

### 소비 스코프가 mode를 다시 적용하는 자리

DS-D-0010은 `[data-page-root]` 같은 DOM 상태 스코프를 토큰 축이 아니라고 못 박고 해결 책임을 소비 계층에
넘겼다. 제품은 그 재적용을 **요소 자신의 선언**으로 한다 — 여기가 그 값이다.

**이 절의 앞선 판은 뒤집혔다.** 그때 `[data-page-root]`는 `--gray-000`부터 `--gray-1000`까지 11개와
대응 `-rgb` 11개를 전부 팔레트 원시값으로 못 박아, 라이트 테마를 켠 사용자에게도 랜딩이 항상 검정
배경·흰 글자였다. 그 위에서 랜딩 홈만 다시 밝은 램프로 뒤집고 그 안의 몇몇 섹션이 또 되돌리는
**세 겹**이 쌓여 있었다. 배포본 `df414c24`는 세 겹을 다 걷어냈다 — 그 사유가 제품 소스 주석에 그대로
적혀 있다(`globals.css:1633-1640`). **랜딩은 이제 테마를 따른다.**

**예외 — 테마와 무관하게 라이트로 고정한 페이지가 있다**(소유자 2026-10-02: 랜딩 홈 · 앰배서더). 그 페이지는 제 루트에
`data-theme="light"` 를 달고(LOUIS 토큰은 중첩된 `[data-theme]` 스코프가 통한다) 제품 `--gray-*` 램프는 따로
`data-landing-walkthrough-light` 가 라이트로 되돌린다 — **고정은 두 겹이다.** 그런데 실제로 바닥을 칠하는 것은 그 루트가 아니라
`body` 와 앱 셸 래퍼라 스코프 밖이다. 그래서 제품은 `body:has([data-page-root][data-theme="light"])` 가 `--page-bg` ·
`--app-page-bg` 를 **`--palette-gray-000`**(라이트 `landing-page-bg` 와 같은 값 `#fafafa`, 리터럴을 새로 적지 않는다)으로 고정한다
(`globals.css:2139`). 위 `body:has([data-page-root])` 와 같은 `components` 레이어 안에서 특이도가 `(0,2,1)` 대 `(0,1,1)` 이라 **순서와 상관없이** 이긴다.

- **「랜딩은 테마를 따른다」는 `data-theme` 를 고정하지 않은 랜딩 페이지(문의 · 가격 · 블로그 · 템플릿)에 한한다.** 고정 페이지는
  다크 사용자에게도 라이트다 — 랜딩·가격을 「다크 전용」으로 그리면 틀린다는 아래 경고의 반대편이 이 예외다.
- **고정 페이지 안에서도 두 군데는 사용자의 테마를 읽는다.** body 포털인 메가 시트와 모바일 메뉴 패널은 페이지 루트 밖에 있어
  `html[data-theme]` 를 따른다. 그래서 헤더 톤을 둘로 나눠 고른다 — 평소에는 GNB 밑의 면(`darkSurface`), 메뉴나 시트가 열리면 그
  패널의 테마([Landing Shell](../patterns/landing-shell.md) 의 Tone inversion · `pageTheme`). 모바일 패널은 루트의
  `data-menu-theme="light"`(고정) / `"follow"`(테마를 따름)로 이 분기를 받는다.
- **푸터는 이 예외와 별개로 늘 다크다.** 테마도 페이지 고정도 따르지 않는 고정 팔레트다(Landing Shell 의 Footer).
- 이 한 줄이 고정 페이지를 만드는 **유일한 body 쪽 장치**다. 새 페이지가 테마를 고정하려면 루트의 두 속성과 이 `:has` 규칙이 같이 서야
  한다 — 루트만 고정하면 바닥을 칠하는 `body` 가 사용자 테마의 랜딩 바닥을 그대로 칠해(다크면 `#000000`) 라이트 페이지 밑에 어두운 바닥이 드러난다.

- 랜딩·마케팅 트리 루트 `[data-page-root]`가 지금 세우는 것은 **면 계열 여섯**뿐이고, 값은 전부 LOUIS의
  `landing-*` 시맨틱에서 온다 — `--page-bg`·`--panel`·`--panel-strong`·`--line`·`--text-soft`·
  `--text-muted`가 각각 `var(--louis-color-landing-*)`이다(`globals.css:1642-1647`). 회색 램프는 손대지
  않으므로 `html[data-theme]`가 세운 값이 그대로 흐른다.
- **알파를 여기서 다시 계산하지 않는 것이 규칙이다.** `landing-*`는 테마별 값이 이미 정의돼 있고
  (light `#fafafa` / dark `#000000` 등 — 라이트는 `#f1f1f3` 이던 것이 팔레트 갱신으로 옮겨 갔다), 소비 스코프가 알파를 다시 쓰면 정본이 둘이 된다. 이것이 랜딩
  섹션들이 `bg-gray-900` 대신 `var(--panel-strong)`을 쓰는 이유이기도 하다.
- 블록은 **`@layer components` 안**에 있다(`globals.css:1190`이 그 레이어를 연다). 파일 끝에 있는 것은
  마케팅 훅을 한곳에 모으려는 조직상의 선택이고 **캐스케이드 승패에 의존하지 않는다** — 사유가
  `globals.css:1628-1630`에 있다. 앞선 판이 「`@layer` 밖에 두어 상속을 이긴다」고 적었던 것은 그때의
  구조였고 지금은 아니다.
- 요소 자신은 `background: var(--page-bg); color: var(--gray-000)`을 갖는다(`globals.css:1651-1652`).
  `background`가 단축인 채로 남아 있는 것도 계약이다 — 가격 페이지가 「이 단축이 `background-clip` 등
  롱핸드를 초기화한다」를 근거로 삼고 있다.

| 토큰 | 앱 light | 앱 dark | `[data-page-root]` 안 |
| --- | --- | --- | --- |
| `--gray-000` | `#000000` | `#fafafa` | **테마를 따른다 — 재정의 없음** |
| `--gray-900` | `#dcdee1` | `#171b22` | **테마를 따른다 — 재정의 없음** |
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
그대로 있다(`globals.css:1696-1700`).

**이걸 모르면 틀린다 — 방향이 반대다.** 랜딩·가격 화면을 **다크 전용**으로 그리면 틀린다. Figma 시안이
다크 렌더일 뿐이고 제품은 두 테마를 다 그린다. 라이트에서 무너지는 자리는 램프 인덱스를 대칭으로
뒤집어서는 성립하지 않는 역할들이며(면·선·보조 글자), 그것을 `landing-*`가 소유한다.

## Alias and naming rules

- alias는 같은 type만 가리키며 cycle과 dangling reference를 허용하지 않는다.
- semantic token이 primitive로 resolve되는 방향만 허용하고 primitive가 semantic token을 참조하지 않는다.
- source ID는 CSS, JavaScript, TypeScript와 Figma 이름이 바뀌어도 추적 가능한 안정 식별자다.
- 플랫폼 이름 변환 충돌은 build error다.
- alpha가 있는 색은 실제 배경과 함께 contrast pair를 선언한다.
  **이 규칙은 아직 충족되지 않는다(2026-09-13 확인).** 대비 게이트(`scripts/lib/token-model.mjs` 의
  `contrastRatio`)는 불투명 sRGB 만 재고, 알파가 섞인 쌍을 선언하면 빌드를 거절한다. 그래서
  컴포넌트가 실제로 짝지어 쓰는 알파 조합 — 메뉴 표면 글자 · secondary 버튼 · Alert 기본 톤 ·
  Toast 등 여덟 — 이 어느 쌍으로도 재어지지 않는다. 합성 배경을 받는 수단을 세우는 일은
  [인계서](../governance/execution-handoff.md) DS-P3-014 단위 6 의 남은 작업이다.

## 노드 생성 중 placeholder의 매체별 accent

노드가 생성 중일 때 카드 안 아이콘과 캡션은 매체별 accent 램프를 쓴다. 아이콘은 500 셰이드로 두 mode
공통이고 캡션만 mode로 갈린다 — 밝은 100 셰이드는 라이트의 밝은 카드 면에서 대비가 무너지므로 700으로
낮춘다.

| 매체 | 아이콘 (두 mode 공통) | 캡션 dark | 캡션 light | 근거 |
| --- | --- | --- | --- | --- |
| Image | `--accent-green-500` `#00c68e` | `#e5fff7` | `#008f67` | `ImageNode.tsx:327` · `ImageNode.tsx:351-352` |
| Video | `--primary-500` `#0088ff` | `#d6ebff` | `#005fb3` | `VideoNode.tsx:247` · `VideoNode.tsx:267-268` |
| Text | `--accent-yellow-500` `#ffb200` | `#fff5d6` | `#b87600` | `TextNode.tsx:318` · `TextNode.tsx:332-333` |
| Edit | `--accent-violet-500` `#6055ff` | `#ebe8ff` | `#3528b8` | `EditNode.tsx:368` · `EditNode.tsx:385-386` |

제품의 네 램프는 전부 LOUIS 램프의 별칭이다 — `--primary-*` 는 `color-blue-*`, `--accent-green-*` ·
`-yellow-*` · `-violet-*` 는 같은 이름의 LOUIS 램프를 읽는다(`globals.css:200-206` ·
`globals.css:241-247` · `globals.css:260-266` · `globals.css:321-333`). 그래서 위 hex 는 LOUIS
원천 값과 같다. 이 표는 2026-09-13 에 앵커 `6fbdac16` 으로 다시 쟀다 — 그 전 표는 sky 폐지와
mint → green 개명 이전의 이름과 줄을 적고 있었다.

- **캡션은 색을 두 곳에 같은 값으로 선언한다.** `color`와 `--caption-tone` 둘 다다. 쉬머가
  `background-clip: text` + `-webkit-text-fill-color: transparent`로 그려져 `color`가 무효화되므로
  (`ImageNode.tsx:353-357`), `color`만 고치면 화면이 바뀌지 않는다. 감속 모션 분기는
  `-webkit-text-fill-color`를 `--caption-tone`에서 되돌린다(`ImageNode.tsx:359`). 네 노드가 같은 패턴이다.
- Tts/Bgm(audio) 노드에는 이 생성 중 아이콘·캡션 accent가 없다. audio는 영역 차오름으로 진행을 표시한다.

**sky 결손은 사라졌다(2026-09-13 확인).** 이 자리는 「LOUIS 에 `color-sky-*` 램프가 없어 Video 를
blue 로 매핑하면 틀린다 — sky 램프를 먼저 세운다」고 적고 있었다. 2026-08-26 에 LOUIS 와 제품이 같은
작업에서 sky 9단을 blue 로 접었고([figma-sync](../governance/figma-sync.md) 「색 팔레트 — 여섯에서
여섯으로」), 제품의 비디오 플레이스홀더는 이제 `--primary-*`(= LOUIS blue)를 읽는다. **sky 를
세우는 것은 할 일이 아니다.**

**남는 사실 하나.** `color-node-video-icon`·`color-node-video-surface` 는 여전히 없다 — video 는
`color-node-video-accent`(blue.500) 하나뿐이고 나머지 매체는 icon·surface·accent 세 벌을 갖는다.
위 표의 Video 아이콘 값은 `color-node-video-accent` 와 같다. 이 플레이스홀더를 LOUIS 레시피가 그리게
되면 그 레시피가 소비처가 되므로, 두 이름이 필요한지는 그때 판정한다 — 소비처 없이 세우면 죽은 토큰이다.

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
준다(`billing-success/page.tsx:112-117`). 한 화면에 같은 상수로 두 박스가 연달아 설 수 있다
(`billing-success/page.tsx:436-442`).

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
