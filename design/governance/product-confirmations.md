---
id: governance-product-confirmations
status: experimental
authority: normative
---

# 제품 확인 대기 목록

**이 저장소가 단독으로 정할 수 없는 것들**을 한 곳에 모은다. 각 항목은 실측 근거와 「무엇을 정해야
하는가」를 함께 갖는다. 흩어져 있으면 제품 쪽에서 무엇을 봐야 하는지 보이지 않는다.

기준은 `KlipseAI/klipse-web` 의 **`design` 계열**이며 정확한 커밋은
[product-evidence.lock.json](../../migration/product-evidence.lock.json)의 `productCommit` 이
소유한다. **`origin/main` 이 아니다** — 폐지된 글래스 섀도우가 거기에만 남아 있어 그것으로
재실측하면 죽은 값을 올리게 된다. 제품이 앞서 나가면 같은 락 파일을 보는
`verify-product-evidence` 가 잡는다.

## 1 — 노드 비활성 핸들의 라이트 표현: 필터 연산을 DS 가 값으로 옮길 것인가

> **질문을 바꿨다(2026-09-13).** 이 절은 「라이트 페이지에서 비활성 면이 `{ramp}-900`(거의 검정)이
> 된다 → 라이트 값이 정해져야 채널 disabled 12종이 올라간다」고 적고 있었다. 앵커 `6fbdac16` 에서
> 결론(화면이 거의 검정)도 조건(12종이 대기 중)도 맞지 않는다. 토큰 값 서술만 그대로 맞다.

**토큰 값은 그 말대로다.** 제품의 라이트 오버라이드는 여전히 `--node-handle-bg-{channel}` 만
200 으로 바꾸고(`globals.css:626-627` 등) disabled 계열은 다크 값(`{ramp}-900` · `-700`)을 그대로
둔다(`globals.css:575-588`).

**그러나 제품 화면은 그 값을 라이트에서 칠하지 않는다.** 소비처가 라이트에서 disabled 토큰 대신
활성 토큰에 필터를 건다 — `light:[filter:brightness(0.78)_saturate(0.95)]!` 와
`light:[background:var(--node-handle-bg-{channel})]!` 가 한 묶음이다(`NodeSideButtons.tsx:182-214` ·
`VideoNode.tsx:317-350` · `EditNode.tsx:203-230`). 제품 토큰 주석이 같은 말을 한다 — 「비활성(라이트)은
소비자 유틸리티에서 필터+채널 토큰 유지」(`globals.css:502`). 그래서 **라이트에서 거의 검정인 비활성
핸들은 제품에 없다.**

**그리고 채널 disabled 12종은 이미 LOUIS 원천에 있다** — `color-node-handle-{bg,icon}-disabled-{channel}`
(`8de65bb`, 2026-08-26), 두 모드 값이 같다. LOUIS 레시피는 두 테마 모두 그것을 읽으므로 라이트에서
제품과 갈린다. 그 편차는 [Node Side Handle](../components/node-side-handle.md) Known deviations 1이
갖는다.

**정해야 할 것(소유자).** 필터는 연산이라 옮길 토큰 값이 없다. 셋 중 하나다.

1. 지금처럼 두 테마가 같은 disabled 토큰을 읽고 편차로 남긴다.
2. 필터가 만든 색을 재서 라이트 disabled 값을 따로 세운다 — 토큰 값 변경이라 breaking 이고 Figma
   변수도 함께 바뀐다.
3. 레시피가 라이트에서 활성 토큰에 같은 필터를 건다 — 값이 아니라 연산을 옮긴다.

**같이 정할 것.** `color-node-{audio,edit,image,instagram,text,youtube}-{icon,surface}` 12개가 두 모드
모두 `color-node-handle-icon-*` · `color-node-handle-bg-*` 와 같은 primitive 를 가리키고 소비처가 없다
([DS-D-0030](decisions/DS-D-0030-no-duplicate-role-tokens.md) 상황). 지우는 것은 removal breaking 이고
Figma 변수 삭제가 따라오므로 이 저장소는 **지우지 않았다.** 지울지는 소유자 판정이다.
[DS-D-0010](decisions/DS-D-0010-token-coverage.md) Open question 3이 이 두 질문을 가리킨다.

## 2 — `180ms`가 어느 모션인가

> **이 절은 사용 횟수를 옮겨 적지 않는다(2026-09-13).** 수는 아래 §3 생성 표의 `duration` 행과
> 「모션 길이」 표가 낸다. 이 산문은 마커 바깥이라 재생성이 닿지 않아, 옮겨 적은 수는 재측정마다
> 어긋난다 — 2026-08-29 에 한 번 어긋났고, 2026-09-13 에는 산문이 「173회 · 43파일 · 53단 중
> 60.4%」인데 같은 문서의 표는 162회 · 42파일 · 71단 · 59.9% 였다. 그래서 수를 걷고 표를 가리킨다.

**증상.** 배포본에서 **가장 많이 쓰이는 모션 길이 180ms에 대응하는 DS 모션이 없다** — §3 생성 표의
`duration` 행이 그것을 최다값이자 결손 최다로 낸다. DS의 duration·motion이 덮는 비율도 같은 행에 있다.

**첫 실측 입력이 나왔다(2026-08-21).** 확인 모달의 액션 버튼이 `transform` · `filter` ·
`opacity` 전환을 **셋 다 180ms ease**로 썼다(`GlassConfirmModal.tsx@a3ed8e03:96`).

> **그 근거는 기준선에서 사라졌다.** `98c421ea` 가 그 버튼을 LOUIS `<Button>` 으로 갈아
> 끼웠고, 지금 기준선(`df414c24`)의 그 파일에는 `180ms` 가 한 번도 나오지 않는다. 판정을
> **살아 있는 자리로 옮긴다** — 아카이브 프로젝트 카드가 `transform` · `filter` · `box-shadow`
> 를 셋 다 180ms ease 로 쓰고(`NodeCanvasHomeScene.tsx:271`), 같은 요소의 `:active` 가
> `scale(0.975)` 와 그림자 교체다(:274-275). **결론은 그대로이고 근거만 바뀌었다.**

그 자리에서 움직이는 것은 **누름(`scale(0.975)`)과 밝기·그림자 변화** — 즉 **컨트롤 피드백**이다.

**진입·퇴장이 아니다.** 그쪽은 220 · 260 · 320ms를 쓴다. 180ms가 「나타나고 사라지는 길이」가
아니라 「눌리고 밝아지는 길이」라면 이름은 `motion-control-*` 계열이어야 한다.
자세한 값은 [interaction-states](../foundations/interaction-states.md)의 제품 실측 절에 있다.

**아직 한 자리의 관측이다.** 생성 표가 세는 180ms 사용처 중 하나이므로 이것만으로 역할을 확정하지
않는다.

**정해야 할 것.** 180ms가 어떤 동작에 붙는가. 길이만 보고 `motion-*` 이름을 붙이면 근거 없는
토큰이 되므로, **무엇이 움직이는지**를 알아야 역할이 정해진다. 같은 이유로 `150ms`와
`280ms`도 미정이다(둘 다 생성 표의 「모션 길이」 결손 상위에 있다).

## 3 — 제품의 자유값 축을 접을 것인가

[product.drift.json](../../migration/product.drift.json)이 매 `verify`마다 다섯 축을 잰다.

<!-- GENERATED:product-drift START -->
배포본 `2c6bdacf` 기준. **이 표는 생성물이다** — `scripts/measure-product-drift.mjs`가 매 `verify`마다 다시 잰다.

| 축 | 제품 | DS가 덮는 비율 | 최다값 | 결손 최다 |
| --- | ---: | ---: | --- | --- |
| alpha | 42단 2420회 | 46.3% | `8%` 322회 | `100%` 275회 / 35파일 |
| radius | 19단 191회 | 60.7% | `12px` 31회 | `7px` 20회 / 1파일 |
| border-width | 4단 115회 | 93% | `1px` 85회 | `1.5px` 7회 / 4파일 |
| spacing | 44단 866회 | 81.2% | `8px` 204회 | `5px` 32회 / 25파일 |
| duration | 71단 1035회 | 59.9% | `180ms` 162회 **토큰 없음** | `180ms` 162회 / 42파일 |

**투명도 % (`alpha`) — 토큰 없는 값 상위**

| 값 | 사용 | 파일 |
| --- | ---: | ---: |
| `100%` | 275 | 35 |
| `88%` | 231 | 81 |
| `56%` | 152 | 74 |
| `48%` | 143 | 65 |
| `72%` | 105 | 53 |
| `96%` | 85 | 28 |
| `32%` | 78 | 39 |
| `28%` | 71 | 36 |

**모서리 반경 (`radius`) — 토큰 없는 값 상위**

| 값 | 사용 | 파일 |
| --- | ---: | ---: |
| `7px` | 20 | 1 |
| `3px` | 14 | 6 |
| `5px` | 13 | 10 |
| `1px` | 12 | 1 |
| `14px` | 6 | 2 |
| `1.5px` | 4 | 2 |
| `18px` | 3 | 2 |
| `28px` | 2 | 2 |

**테두리 두께 (`border-width`) — 토큰 없는 값 상위**

| 값 | 사용 | 파일 |
| --- | ---: | ---: |
| `1.5px` | 7 | 4 |
| `4px` | 1 | 1 |

**간격 (`spacing`) — 토큰 없는 값 상위**

| 값 | 사용 | 파일 |
| --- | ---: | ---: |
| `5px` | 32 | 25 |
| `3px` | 31 | 15 |
| `1px` | 25 | 15 |
| `7px` | 18 | 10 |
| `9px` | 15 | 8 |
| `160px` | 7 | 4 |
| `11px` | 6 | 5 |
| `112px` | 5 | 5 |

**모션 길이 (`duration`) — 토큰 없는 값 상위**

| 값 | 사용 | 파일 |
| --- | ---: | ---: |
| `180ms` | 162 | 42 |
| `280ms` | 31 | 13 |
| `150ms` | 17 | 10 |
| `100ms` | 17 | 8 |
| `80ms` | 17 | 11 |
| `240ms` | 14 | 7 |
| `600ms` | 12 | 8 |
| `500ms` | 11 | 2 |
<!-- GENERATED:product-drift END -->

**수치 정정(2026-08-21).** 이 절의 표는 원래 손으로 적었고 **두 칸이 틀렸다** — radius 결손을
`45회`, border-width `1.5px`를 `6회`라고 적었지만 그날 계기가 낸 값은 **73회**와 **10회**였다.
원인은 그때 쓴 일회성 `git grep`이 **`.ts` 파일을 대상에서 빼먹었고** 라인 기반이라 한 줄에
여러 번 나오는 경우를 한 번으로 셌기 때문이다. 계기는 처음부터 맞게 세고 있었다.

또 표를 손으로 줄이면서 **순위 중간을 건너뛰었다** — 결손을 「홀수」로 묶었는데 radius의
`14px`·`18px`, spacing의 `112px`·`160px`는 홀수가 아니면서 결손이었고, 그날 표에서 `112px`는
`11px`보다 많이 쓰이고 있었다.

> **이 문단의 숫자는 2026-08-21 측정값이다.** 오류의 형태를 보여 주려고 그날 값을 인용한 것이고
> 현재값이 아니다 — 위 생성 표가 현재값의 정본이다(기준선 a7d045e3 재측정에서 1.5px 10 → 8,
> 18px 5 → 3, 112px 9 → 5, 160px 7 → 5, 11px 8 → 7 로 움직였고 `112px > 11px` 도 뒤집혔다).
> 서술을 현재형으로 두면 재측정마다 거짓이 되므로 시점을 박아 둔다.

**그래서 이 표를 생성물로 바꿨다.** 다시는 손으로 세지 않는다.

**셋 다 「스케일이 아니라 그때그때 넣은 값」의 자국이다.** 최다 사용값조차 전체의 한 자릿수 %를
차지하는 축(alpha)은 설계된 스케일이 아니다.

**정해야 할 것.** 접을 것인가. alpha는 매핑표와 확인 대상 79자리가
[alpha-consolidation.json](../../migration/alpha-consolidation.json)에 준비돼 있다. radius와
spacing의 홀수 계단은 **전부 이웃과 1px 차**라 화면에서 구분되지 않으므로 확인할 자리가 없다.
접는 것은 제품 저장소 변경이므로 이 저장소가 하지 않는다.

## 4 — ~~`--palette-gray-200-rgb` 미러가 hex와 어긋난다~~ 대상이 사라졌다

> **해소 — 확인할 대상이 없다(2026-09-13).** 앵커 `6fbdac16` 에서 제품은 hex 와 미러를 둘 다 LOUIS
> 토큰의 별칭으로 선언한다 — `--palette-gray-200: var(--louis-color-palette-gray-200);`
> (`globals.css:49`) · `--palette-gray-200-rgb: var(--louis-color-palette-gray-200-rgb);`
> (`globals.css:66`). 두 경로가 같은 원천을 읽으므로 G 238/239 가 갈릴 자리가 없고, 앱 셸이
> `body:has(...)` 로 램프를 `#eeeef1` 에 재매핑하던 규칙도 걷혔다(`Gnb.tsx:1391-1396` 주석).
> 아래는 2026-08-21 의 기록이다. 제품에 미러를 고쳐 달라고 요청하지 마라.

**증상.** 앱 셸 램프에서 **같은 색이 소비 경로에 따라 다르게 렌더된다.**

    var(--palette-gray-200)                 → #eeeef1 = 238 238 241
    rgb(var(--palette-gray-200-rgb) / n%)   → 238 239 241        ← G 채널 1 차이

`palette-gray-100`·`150`·`300`은 모두 일치하고 **`200` 하나만** 어긋난다.

**정해야 할 것.** 미러를 `238 238 241`로 고칠 것인가. DS는 hex를 정본으로 삼아 **238**을 쓰기로
했으므로([실행 인계서](execution-handoff.md)의 DS-P3-014 절) 제품이 미러를 맞추면 정합이 선다.

## 5 — ~~기존 알파 토큰 9개가 사다리와 어긋난다~~ DS 쪽은 해소됐다

> **해소(2026-09-13 표시).** [DS-D-0026](decisions/DS-D-0026-alpha-scale.md)(accepted, 2026-08-26)이
> 알파를 **16단 — 32까지 4씩, 그 위 8씩**으로 다시 정하고 LOUIS 알파 패밀리를 그 계단으로 옮겼다.
> 아래 아홉 이름(`ink-alpha-*` · `paper-alpha-*` · `black-alpha-*`)은 원천에 더 이상 없고, 지금
> `static-black-alpha` · `static-white-alpha` 는 같은 16단이며 `red-alpha` 는 참조되는 8 · 12 · 24만
> 갖는다. 아래 예로 든 `color-fg-menu-item` 은 88%, `color-dim-modal` 은 light 56% · dark 72% 로
> 전부 계단 위다. **남은 것은 제품 쪽 접기이고 그것은 §3 의 alpha 행이 갖는다.** 아래는 2026-08-21
> 의 기록이다.

`ink-alpha-5` · `paper-alpha-14` · `paper-alpha-45` · `paper-alpha-72` · `paper-alpha-86` ·
`ink-alpha-86` · `black-alpha-28` · `black-alpha-56` · `black-alpha-72`.

**지금 고치지 않는다.** 제품이 아직 그 값을 쓰고 있어서 지금 접으면 DS가 제품과 갈린다 — 실측
게이트가 막으려는 바로 그 상태다. **3번이 정해지면 제품과 함께 접는다.** semantic 바인딩 12건이
걸려 있고 그중 `color-fg-menu-item`(86%→80%)과 `color-dim-modal`이 눈에 띈다.

## 6 — 루트 폰트 크기 12px가 의도인가

**증상.** `html { font-size: var(--type-caption-12-size) }` = **12px**이고, `1rem = 12px`다
(`globals.css:918-919`, 변수 `:322`). 브라우저로 4개 문맥 전부 확인했다.

그런데 [legacy-design-system](../../migration/legacy-design-system.md)은 이 변경을 **실수로
기록**하고 「타입 스케일 토큰으로 바꾸지 말 것 — 폰트 크기만 바꾸고 rem 값은 하나도 조정하지
않았다」고 경고를 남겼다. 그러면서 「2026-08-08에 10px로 되돌렸다」고 적었는데 **그런 커밋은
어느 저장소에도 없다.** 이 줄의 변경은 `0f47a2cb`(10px)와 `9f2326a8`(2026-07-31, 토큰) 둘뿐이다.

**왜 12가 됐는지는 커밋 본문에 있다.** `9f2326a8`은 스스로 이렇게 적었다 —
「**스케일 밖 raw px 를 토큰으로 정규화 (76곳). 13·11·10·9 → `--type-caption-12-size`**」.
`html { font-size: 10px }`의 `10px`이 **그 일괄 치환에 걸려든 것**이다. 바로 윗줄 주석이
「환산 기준이지 타입 값이 아니다」라고 적어 두었지만 기계적 치환은 주석을 읽지 않는다.
**의도된 결정이 아니라 76곳 사이에 섞여 들어간 한 줄이다.**

**10px로 되돌리는 것이 답은 아니다.** 10px 트릭의 존재 이유는 rem 산수 편의 하나인데
(`1.6rem = 16px`), 이 제품은 그 산수를 쓸 일이 없게 이미 설계돼 있다.

| 근거 | 값 |
| --- | --- |
| 제품의 `rem` 사용 | **3곳** (그중 실제 효과 있는 것 1곳) |
| Tailwind spacing | `--spacing: 2px` — rem이 아니라 **px로 재정의** |
| Tailwind radius | `--radius-*: initial` 후 px 재정의 |

Tailwind v4 기본은 rem 기반인데 이 제품은 「실측 결과 2px 격자다」라며 **의도적으로 px로
갈아치웠다**. 그래서 루트 폰트 크기는 `rem` 3곳 말고는 아무 데도 닿지 않는다.

또 **`10px`와 `12px`는 둘 다 절대값이라 접근성 측면에서 같다** — 사용자의 브라우저 기본 글자
크기를 무시한다. 게다가 `body`가 `font-size: var(--type-body-16-size)`로 16px을 절대값으로
못박아, 루트를 무엇으로 하든 글자는 사용자 설정을 따르지 않는다.

**정해야 할 것.** 셋 중 하나다.

1. **선언을 지운다(권장).** 살아 있는 `rem` 하나(`Gnb.tsx:2005` `max-width:4.5rem`)를 px로 바꾸면
   환산 기준이라는 것을 아무도 기억할 필요가 없어진다. **오늘 문서 여섯 곳이 틀린 이유가 정확히
   「기억해야 하는 숫자」였기 때문이다.** 그 자리는 상위 상한에 먼저 걸려 발화하지도 않는다.
2. **`62.5%`로 바꾼다.** 산수는 `1rem = 10px` 그대로이면서 상대값이라 사용자 설정에 비례한다.
   이 제품의 `landing` 쪽이 이미 이 방식이다.
3. **12px를 의도로 확정한다.** 그러면 문서의 「토큰으로 바꾸지 말 것」 경고를 지운다.

- **의도라면** 문서의 경고를 지운다. 파급은 `Gnb.tsx:2005` 한 곳뿐이고(접힘 사이드바 라벨
  `max-width:4.5rem` = 54px) 그 자리는 상위 상한에 먼저 걸려 발화하지도 않는다.
- **회귀라면** 되돌릴 때 `4.5rem` 두 자리를 함께 봐야 한다 — 경고가 지적한 것이 정확히 그것이다.

**제품만 답할 수 있는 이유.** 루트 폰트 크기는 접근성 설정(브라우저 기본 글자 크기)과 얽혀 있고,
`rem`을 앞으로 쓸 것인지에 대한 방침이 있어야 정해진다. 현재 제품은 `rem`을 **3곳**에서만 쓴다.

## 7 — 형태 B 상단 페이드가 어디서도 켜지지 않는다

**증상.** 앱 셸 형태 B(카드가 별도 패널 div)의 패널은 `::before`로 **상단 72px 페이드**를 그리도록
선언돼 있는데, 높이가 `calc(72px * min(1, var(--header-progress, 0) * 1000))`이다.
**배포본에서 이 값이 0을 벗어나는 화면이 없다.**

**왜.** `useMainChromeHeaderScrollProgress`가 `--header-progress`를 두 곳에 쓴다 —
`headerSlot`과 `wrapper.closest("main")`. 그런데 형태 B에서 페이드를 가진 패널 div는
**`<main>`의 부모**다(`VideoEditScene.tsx:710-711` 구조). CSS 커스텀 프로퍼티는 **위로 상속되지
않으므로** 패널의 `::before`는 언제나 폴백 `0`을 읽는다.

게다가 페이드를 선언한 3파일(`myPageSceneStyles.ts` · `VideoEditScene.tsx` · `InquiryClient.tsx`)
중 **훅을 호출하는 것은 하나도 없다.** 훅 호출처는 `AppHomeScene`(형태 A) ·
`NodeCanvasHomeScene`(형태 A) · `HighlightScene` 셋뿐이다.

**같은 훅의 다른 변수는 정상이다.** `--mainchrome-divider-progress`는 `headerSlot`에 쓰이고
경계선이 그 슬롯 안에서 읽으므로 동작한다.

**정해야 할 것.** 상단 페이드가 의도된 기능인가.

- **의도라면** 훅이 패널까지 변수를 올려 주거나(예: `closest` 대상을 패널로), 페이드를 `<main>`
  쪽으로 옮겨야 한다. 지금은 선언만 있고 그려지지 않는다.
- **폐기라면** 세 파일의 상단 그라디언트와 `HEADER_COLLAPSE_SCROLL_PX`를 함께 지운다. 상수의
  JSDoc이 「워드마크 축소 등 헤더 collapse」라고 말하는데 **그런 소비처도 배포본에 없다.**

**DS 쪽 조치는 이미 했다.** [app-shell-parts](../components/app-shell-parts.md)에 「상단 페이드를
켜진 상태로 그리지 마라」를 적었다. 제품이 고치면 그 주의를 지운다.

## 8 — 분석 대시보드에 감소-모션 분기가 없다

**증상.** `components/scenes/analytics/shared.tsx` 전체에 `motion-reduce`가 **0건**인데 애니메이션
선언은 **5개**이고 그중 **셋이 무한 반복**이다.

| 선언 | 종류 |
| --- | --- |
| `dashboardSkeletonPulse 1.6s … infinite` | 무한 |
| `dashboardSkeletonFade 2s … infinite` | 무한 |
| `dashboardAreaBreathe 3.6s … infinite` | 무한 — **아래 참조** |
| `dashboardAreaReveal 720ms … both` | 1회 |
| `dashboardLineReveal 900ms … forwards` | 1회 |

같은 제품의 다른 자리(노드 생성 중 셸 · 프리미티브 스켈레톤)는 `motion-reduce` 분기를 갖는다 —
**이 파일만 빠져 있다.**

**정해야 할 것.** 의도인가 누락인가. 누락이면 무한 셋에 감소-모션 분기를 붙인다.
DS 쪽 정본은 [Motion](../foundations/motion.md)의 감소-모션 계약이고, LOUIS는 이 자리를
**결함으로 기록**해 두었다([skeleton](../components/skeleton.md)).

## 9 — `dashboardAreaBreathe`는 재생되지 않는다

**증상.** `shared.tsx:52`가 `dashboardAreaBreathe 3.6s ease-in-out infinite 900ms`를 선언하는데
**`@keyframes dashboardAreaBreathe` 정의가 배포본에 없다.** 같은 파일의 다른 넷은 전부 정의가 있다.

    dashboardSkeletonPulse   @keyframes 정의 1
    dashboardSkeletonFade    @keyframes 정의 1
    dashboardAreaBreathe     @keyframes 정의 0   ← 이것
    dashboardAreaReveal      @keyframes 정의 1
    dashboardLineReveal      @keyframes 정의 1

**선언은 있고 움직임은 없다.** CSS는 없는 이름을 조용히 무시한다.

**정해야 할 것.** keyframe을 세울 것인가 선언을 지울 것인가.

- **세운다면** 차트 영역이 계속 호흡하게 되므로 위 항목(감소-모션)과 함께 봐야 한다.
- **지운다면** 지금 화면은 그대로다 — 사문을 없애는 것뿐이다.

**어느 쪽이든 Figma에는 지금 이 움직임을 그리면 안 된다.** 배포본에 없는 움직임이다.


## 10 — 업로드 화면의 Topic 칩이 패딩 · 간격 0 이라 글자끼리 붙는다

**증상.** `/highlight/[projectId]?__phase=upload` 의 주제 칩 여섯(`Live Commerce` · `Education` ·
`Gaming` · `Sports` · `Vlog` · `Interview`)이 서로 닿아 「EducationGaming」처럼 읽힌다. 화면 보드에서
먼저 보였고(Updates (156)), 보드가 틀린 것이 아니라 제품이 그렇게 그린다.

**실측(원장, 앵커 `2c6bdacf`).** `migration/product.auth-fixture.json` 의
`screens["desktop-1920x1080"]["/highlight/[projectId]?__phase=upload"]` 트리에서

    button "Live Commerce"  rect 81.97 × 18   declared padding "0" · margin "0"
    (부모 행)               rect 283.17 × 24  declared padding "0" · margin "0"

칩 폭이 글자 폭과 같고 행에 간격 선언이 없다. 여섯 칩의 폭 합이 행 폭과 같아 사이가 0 이다.
모바일(402)도 같다.

**정해야 할 것(제품).** 칩 사이 간격과 칩 안 좌우 패딩을 세울 것인가. 세운다면 값은 DS 간격
계단(`space-control-*`)에서 고른다 — 선택 칩의 면(`#efefef`)은 이미 있으므로 패딩만 서면 알약으로
읽힌다.

**그때까지 Figma 는 이 화면을 제품대로 둔다.** 보드에서 간격을 지어내면 제품에 없는 사실을 정본으로
굳힌다([Updates](../updates/README.md) (156) 「남은 것」 1 과 같은 판정이다).

## 11 — 업그레이드 화면 데스크톱의 요금 카드에서 가격이 두 줄로 꺾인다

**증상.** `/mypage/upgrade` 데스크톱(1920)의 유료 요금 카드 넷에서 가격이 「12,900 / KRW」처럼 두 줄로, 옆의 「per
month」도 「per / month」로 꺾인다. 화면 보드에서 먼저 보였고([Updates](../updates/README.md) (161)), 보드가 틀린 것이
아니라 제품이 그렇게 그린다.

**실측(원장, 앵커 `2c6bdacf`).** `migration/product.auth-fixture.json` 의
`screens["desktop-1920x1080"]["/mypage/upgrade"]` 트리에서

    카드 격자          rect 1300 × 608.19   grid-template-columns repeat(5, minmax(0px, 1fr)) · gap 4
    카드 article       rect 256.8 × 608.19  padding 16 → 내용 폭 224.8
    가격 행            rect 224.8 × 97.19   inline-flex · items-end · gap 8
    strong "12,900 KRW" rect 159 × 97.19    heading-36 · 줄 높이 48.6 → 두 줄
    span "per month"    rect 57.8 × 52      body-16 · 줄 높이 24 + 아래 패딩 4 → 두 줄

격자가 요금제 다섯(Trial + 유료 넷)을 한 줄에 놓아 카드 내용 폭이 224.8 이다. 한 줄로 서려면 가격 약 200 + 간격 8 +
「per month」 약 64 = 272 가 필요하다. 행이 `inline-flex` 라 두 글자가 줄어들며 각자 감긴다. 모바일(402)은 한 열이라
같은 행이 169 폭에서 역시 두 줄이다(가격 28px).

**정해야 할 것(제품).** 가격을 한 줄로 지킬 것인가. 지킨다면 셋 중 하나다 — 가격 `white-space: nowrap` 에 「per
month」를 가격 아래로 내리기, 데스크톱 격자를 넓은 화면에서만 다섯 열로 두기, 가격 크기를 카드 폭에 맞춰 줄이기.

**그때까지 Figma 는 이 화면을 제품대로 둔다.** 보드는 제품 폭(카드 256.8)에서 같은 자리가 같게 꺾인다.

## 12 — 분석 화면의 「Connect Google Account」 버튼이 LOUIS Button 이 아니다

**증상.** `/analytics/youtube` · `/analytics/instagram` 의 미연동 안내에 있는 연결 버튼이 검정 알약(높이 40 · 반경 999)이다.
LOUIS Button 에는 알약 모양이 없어(반경 12) 화면 보드 구성 원장이 이 두 자리를 「LOUIS 에 없다(미보유)」로 센다
([Updates](../updates/README.md) (163)).

**실측(원장, 앵커 `2c6bdacf`).** `migration/product.auth-fixture.json` 의 두 화면 데스크톱 트리에서

    button "Connect Google Account"  rect 196.64 × 40  declared height calc(40px) · gap calc(6px)
                                     font 14 / 500 · 면 gray-000(검정) · 글자 gray-1000

레시피는 제품 지역 상수다 — `YoutubeAnalyticsScene.tsx:1116` 과 `InstagramAnalyticsScene.tsx:520` 의 `CONNECT_NOTICE_BTN`
(`inline-flex items-center gap-3 h-20 px-10 [border:0] rounded-full bg-gray-000 … text-gray-1000`)이 **두 벌**로 똑같이 적혀 있고,
`.louis-button` 을 물지 않는다. hover 는 `filter: brightness(90%)`, 누름은 `scale(0.98)` 로 LOUIS Button 의 상태 표현과도 다르다.

**정해야 할 것(제품).** 이 버튼을 LOUIS Button(`primary` · `lg`, 반경 12)으로 옮길 것인가, 알약을 제품의 의도로 남길 것인가.
옮기면 두 벌의 상수가 사라지고 보드는 Button 인스턴스가 된다. 남긴다면 알약이 이 두 화면만의 것인지, 다른 CTA 로도
퍼질 모양인지를 정해야 한다 — 퍼질 모양이면 그때 LOUIS Button 에 모양 축을 여는 것을 검토한다.

**그때까지 LOUIS 는 모양 축을 열지 않는다.** 제품이 정본을 물지 않는 자리에 맞춰 DS API 를 넓히면, 지역 레시피 하나가
공용 계약이 된다([DS-D-0043](decisions/DS-D-0043-canonical-site-is-what-the-product-bites.md)).
