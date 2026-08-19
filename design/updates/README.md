---
id: updates-overview
status: beta
authority: normative
---

# Updates

디자이너와 개발자가 알아야 할 사용자 영향 변경과 migration을 최신순으로 기록한다.

## 2026-08-18 (48) — App Shell composition이 섰습니다 — 미등록 14건이 함께 닫힙니다

전수 검증이 84건을 주제로 묶으니 **앱 셸이 14건으로 가장 컸습니다.** 그런데 그 14건은 서로 다른
부품이 아니라 **같은 것이 화면마다 다른 이름으로 잡힌 것**이었습니다 — `app-shell-composition` ·
`app-shell-page-frame` · `main-card-chrome-surface` · `in-card-header-slot` ·
`top-chrome-portal-slot` 등. 여덟 화면이 각자 *"셸 조립이 없다"*를 보고한 것입니다.

**패턴 하나가 서면 14건이 함께 닫힙니다.** 그래서 이것부터 했습니다.

### 규범이 이미 답을 갖고 있었습니다

`app-shell.md`의 layout contract를 그대로 옮겼습니다.

| 계약 | 구현 |
| --- | --- |
| 자리 예약 | 레일이 `absolute`여도 본문이 **같은 상태 원천**으로 `padding-inline-start`를 잡는다 |
| 전환 | offset과 폭이 `motion-shell-collapse` 하나를 쓴다 |
| scroll root | 하나. 셸은 `overflow: hidden` |
| 상단 크롬 | scroll root **안에** sticky, 본문과 같은 좌우 inset 원천 |
| compact | 예약 0 · drawer · scrim · 뒤 콘텐츠 `inert` |
| 건너뛰기 링크 | anatomy의 첫 항목 |

**offset과 폭을 따로 지연시키지 않는 이유**를 코드 주석에 적었습니다 — 하나만 늦으면 전환 중에
겹치는 프레임이 생깁니다. 규범이 *"따로 지연시키지 않는다"*고 적어 둔 것이 그 뜻입니다.

**`page`와 `workspace`를 한 composition에 둡니다.** 가르면 `<main>`과 시각 panel의 소유권이
variant마다 달라지고, 그것이 규범이 금지하는 것입니다.

### 테스트가 compact를 드러냈습니다

"접히면 본문이 넓어진다"가 실패했습니다 — 양쪽 1200이었습니다. **테스트 뷰포트가 720px 미만이라
compact 분기로 갔고, 거기서는 예약이 0이라 접힘이 무의미**했습니다.

테스트를 문맥에 따라 갈랐습니다. compact에서는 예약이 0인 것이 계약이고, regular에서는 280 →
collapsed로 줄어드는 것이 계약입니다. **둘 다 지금 확인됩니다.**

### 남긴 것

`app-shell` 패턴이 `web: not-ready` → **`partial`**입니다. 남은 것도 적었습니다 — **focus trap
자체와 scroll lock은 아직 없습니다.** 뒤를 `inert`로 죽이는 것과 초점을 가두는 것은 다른 일이고,
규범의 blocker 문장을 그렇게 고쳤습니다.

테스트 710 → **726**.

## 2026-08-18 (47) — 사이드바 부품 둘을 세웁니다

홈 템플릿을 내리게 만든 원인 넷 중 둘입니다 — **브랜드 행**과 **하단 업그레이드 CTA**.
`app-shell-parts`에 붙였습니다. 사이드바는 부품 모음이 아니라 하나의 조립이기 때문입니다.

### 접힘은 폭입니다

워드마크와 라벨의 `max-inline-size`가 0으로 줄어들며 잘립니다. 폭이 상태이므로 `layout-change`
lifecycle이고, 값은 **`motion-shell-collapse`(320ms)**입니다.

**캐러셀 점의 `motion-layout-change`는 220ms입니다.** 곡선은 `cubic-bezier(0.4, 0, 0.2, 1)`로
같고 지속만 다릅니다 — 제품 실측이 그렇고, 하나로 뭉치면 둘 중 하나가 틀린 값을 씁니다. 등록부에
미리 적어 둔 판정을 그대로 적용했습니다.

### 접혀도 글자를 지우지 않습니다

`max-inline-size: 0`으로 보이지만 않게 합니다. **DOM에서 지우면 버튼의 접근 가능한 이름이 사라져
스크린 리더가 "버튼"만 읽습니다.** 테스트가 그것을 확인합니다.

### CTA는 바닥에 붙습니다

`margin-block-start: auto`가 자리를 만들어 **내비 항목이 몇 개든** 바닥에 남습니다.

테스트에서 `getComputedStyle`이 `auto`를 실제 밀려난 픽셀(360px)로 풀어 처음에 실패했습니다.
선언이 아니라 **결과**를 재도록 고쳤습니다 — CTA 아래 모서리가 셸 바닥에 닿는지 봅니다.

테스트 700 → **710**. Figma 변수 232 → **233**.

### 남은 사이드바 조건

복합 내비 행은 `SidebarNavItem`의 `trailing` prop이 이미 덮습니다. **프로필 사용량 링**은 아직
없고, Avatar가 링을 흡수하지 않기로 한 판정과 얽혀 있어 별도 부품입니다.

## 2026-08-18 (46) — major 7건을 닫습니다

blocker 7건에 이어 major 7건입니다. 실무 감사가 확정한 14건이 전부 닫혔습니다.

### 아이콘을 찾을 채널이 없었습니다

검색 키워드가 `manifest.json`에 있는데 **`dist`에 들어가지 않아 npm으로 나가지 않았습니다.**
소비 개발자가 아이콘 이름을 모르면 찾을 방법이 없었습니다.

생성된 `index.tsx`에 상수로 넣으려다 게이트가 막았습니다 — **`DS-D-0008` 결정 8이 생성물 최상위에
함수 아닌 문장을 금지**하고 그것이 tree-shaking을 지킵니다. 옳은 규칙이라 JSON을 `dist`로 복사해
`./icons/manifest.json` 서브패스로 내보냈습니다. 서브패스 16 → **17**.

`src/`를 배포에 넣으려던 첫 시도도 게이트가 막았습니다.

### focus 링이 자리를 절반으로 알려줬습니다

CSS는 `outline: 2px` + `outline-offset: 2px`이라 **박스와 링 사이에 2px 간격**이 있고 링 바깥
모서리는 박스 + 4입니다. Figma는 324×44(박스 + 2)였습니다 — offset을 0으로 알려주고 있었습니다.
**328×48**로 고쳤습니다.

### 코드에 있는데 Figma에 없던 축 둘

`TextField`의 `prefix`/`suffix` — 검색 필드와 지우기 버튼을 그릴 수 없었습니다.
`Badge`의 `icon`/`dot` — 상태 점이 붙은 배지를 그릴 수 없었습니다.

넷 다 Boolean으로 켜고 `INSTANCE_SWAP`으로 글리프를 고르는 형태입니다. 코드 prop과 짝지어
계약에 넣었습니다.

### fill 글리프의 색

`dots-three-vertical`(fill 3 · stroke 0)과 `info`(stroke 2 · fill 1)는 소비처가 stroke만
override하면 색이 안 바뀝니다. 전수로 재보니 **실제로 어긋난 인스턴스는 0건**이었습니다 —
잠재 위험이지 현재 결함은 아니었습니다.

**그래도 게이트에 넣었습니다.** stroke와 fill이 다른 색 변수를 가리키면 실패합니다.

### 문서 둘

`develop/README.md`가 react 패키지를 *"P3 planned, private, no exports"*로 적고 있었습니다 —
실제는 컴포넌트 20종 · 공개 심볼 58 · 타입 95입니다. 그리고 `packages/react/README.md`에 아이콘을
키워드로 찾는 법과 CSS 세 줄을 넣었습니다.

## 2026-08-18 (45) — 마지막 blocker: Dialog로 확인 대화상자를 못 만들었습니다

Figma의 Dialog 세트에 **Footer도 버튼도 없었습니다.** 제목과 설명만 있어서, 디자이너가 삭제 확인
같은 가장 흔한 대화상자를 그리려면 세트 밖에서 버튼을 따로 붙여야 했습니다.

코드에는 `DialogFooter`와 `DialogActions`가 처음부터 있었습니다. **Figma만 빠져 있었습니다.**

### 세 variant 전부에 넣었습니다

코드의 `dialog.css` 값 그대로입니다 — Footer는 `padding-block-start`가 `space-control-sm`(8),
Actions는 오른쪽 정렬에 같은 gap. **취소가 먼저, 확인이 나중**이고 라벨도 채웠습니다.

### 계약

`footerPaddingTop` · `actionsGap` · `actionCount`를 measured에 두고 parity가 대조합니다. Footer를
지워 보니 실패합니다.

여기서 게이트가 이미 한 가지를 잡고 있었다는 것도 확인했습니다 — 부품을 넣자마자
*"계약에 없는 자손이 있습니다 — Footer"*로 막았습니다. **선언하지 않은 부품을 몰래 넣는 길은
원래 막혀 있었고, 없는 부품을 안 넣는 길만 열려 있었습니다.**

### blocker 7건이 전부 닫혔습니다

| 결함 | 어떻게 닫혔나 |
| --- | --- |
| 오버레이 SSR 예외 | context를 서버에서도 만든다. `verify-consumer`가 4경우를 실제 렌더 |
| CSS import 안내 누락 | 세 문서 수정 + 안내 완결성 게이트 |
| Foundations 색 문서가 없는 이름 | 변수 목록에서 생성 + `compareFoundations` |
| 아이콘 획이 크기를 안 따름 | 146개를 `rescale`로 재배치 + 크기별 획 게이트 |
| EmptyState 64px 슬롯 | 위와 같은 원인이라 함께 닫힘 |
| 캐러셀 빈 컨트롤 | 아이콘 넣고 `controlGlyphCount` 계약 |
| Dialog Footer 없음 | 이 항목 |

**일곱 중 여섯이 게이트를 새로 만들어서 닫혔습니다.** 고친 것보다 **다시 생기지 못하게 한 것**이
많습니다.

## 2026-08-18 (44) — 아이콘 획이 크기를 안 따라가고 있었습니다

같은 아이콘이 20px 자리에서 **Figma 1.5 · 코드 1.25**로 그려지고 있었습니다.

코드는 SVG `viewBox`라 획이 크기를 따라 함께 줄어듭니다 — `1.5 × size / 24`. Phosphor와 Lucide도
같습니다. Figma는 **어떻게 줄이느냐**에 따라 갈립니다.

| 방법 | 20px에서의 stroke |
| --- | --- |
| 크기 조절 핸들 (`resize`) | **1.5** |
| Scale 도구 (`rescale`) | **1.25** |
| 코드 | **1.25** |

`constraints: SCALE`을 걸어도 `resize` 결과는 안 바뀝니다. 이것도 재봤습니다.

**파일의 아이콘 인스턴스 146개가 전부 `resize`로 놓여 있었습니다.**

### 제 첫 판정이 틀렸습니다

처음에는 *"크기 variant를 만들지 말고 두는 자리를 24로 고정한다"*고 썼습니다. 그런데 재보니
146개가 **전부 24가 아니었고**, 그건 실수가 아니라 컴포넌트가 의도적으로 16·20에 놓는 것이었습니다.
버튼의 아이콘이 20인 것은 옳습니다.

`rescale`을 실측하고 나서야 답이 나왔습니다 — **크기 variant도, 24 고정도 아니고, 놓는 방법이
문제였습니다.**

### 146개를 다시 놓았습니다

전부 24로 되돌린 뒤 `rescale(target / 24)`로 다시 넣었습니다. 지금 파일의 실제 값입니다.

| 크기 | 획 | 코드 기대값 |
| ---: | ---: | ---: |
| 16 | **1.0** | 1.0 |
| 20 | **1.25** | 1.25 |
| 64 | **4.0** | 4.0 |

64px는 EmptyState의 그래픽 슬롯입니다 — **그 blocker도 함께 닫혔습니다.**

### 게이트

`compareIconInstances`가 크기별 획을 `1.5 × size / 24`와 대조하고, 허용 크기(`icon-size-*` 토큰
16·20·24·64) 밖이면 실패합니다. 탐지력 확인 — 20px를 1.5로 바꾸니 실패, 18px를 넣으니 실패.

**DS-D-0021**에 판정과 되돌리는 법을 적었습니다.

## 2026-08-18 (43) — Foundations 색 문서가 없는 이름을 적고 있었습니다

오늘 `color-status-*` 8개와 `action-primary-pressed`를 rename했는데, **Foundations의 Color 절은
옛 이름을 그대로 적고 있었습니다.** 그리고 새로 선 `media-*` 9종은 아예 빠져 있었습니다.

문서가 파일에 없는 이름을 적어 두면 **그건 낡은 게 아니라 거짓말입니다.** 디자이너가 그 이름으로
변수를 찾으면 아무것도 안 나옵니다.

### 손으로 고치지 않았습니다

Color 절을 **살아 있는 변수 목록에서 다시 생성**했습니다. semantic 색 50개를 이름순으로 훑으며
Light·Dark 스와치를 만들고 라벨을 붙입니다. 다음에 이름이 바뀌면 다시 생성하면 되고, 손으로
적은 문자열이 없으니 갈라질 자리가 없습니다.

절 안에 그 사실도 적어 뒀습니다 — *"이 절은 파일의 변수 목록에서 만들어집니다. 손으로 고치지
않습니다."*

### 게이트에 넣었습니다

`compareFoundations`가 둘을 봅니다.

1. **캔버스에 적힌 이름이 파일에 실재하는가** — 없는 이름이 있으면 실패
2. **네 절(Color · Typography · Spacing & Radius · Elevation)이 다 있는가** — Foundations가 통째로
   비어 있던 적이 있어(2026-08-18 항목 22) 절 존재도 함께 봅니다

탐지력을 확인했습니다 — 낡은 이름을 심으니 실패하고, 절을 지우니 실패합니다.

**이것이 "문서가 낡았다"를 게이트가 보는 첫 경로입니다.** 그전까지 parity는 변수·style·component의
값만 봤고, 그것을 설명하는 문서는 아무도 안 봤습니다.

## 2026-08-18 (42) — blocker 셋을 더 닫습니다

### CSS import 안내가 토큰을 빠뜨렸습니다

`button.md`가 컴포넌트 문서 중 유일하게 import를 안내하는데 **`tokens.css`를 빠뜨렸습니다.**
그대로 따르면 색·간격·반경이 전부 무효값이 되고 **오류는 나지 않습니다** — `styles.css`에는
semantic 토큰 정의가 없고 `var(--kds-*)` 참조만 있으며 생성물끼리 `@import`하지 않습니다.

`DS-D-0004`는 한술 더 떠 *"소비자 부담은 `layers.css` import 한 줄이다"*라고 적어 두어 누락을
굳혔습니다. 세 곳(button.md · css/README.md · DS-D-0004)을 고쳤습니다.

**게이트로 잠갔습니다** — `styles.css` import를 안내하는 문서가 `tokens.css`를 함께 적지 않으면
`verify-consumer`가 실패합니다. 안내에서 빼 보니 exit 1.

### 캐러셀 컨트롤이 빈 프레임이었습니다

제가 만든 것입니다. 4 variant × 3 부품 = **12개가 빈 프레임**이었고, 눈으로만 보이고 게이트는
못 봤습니다.

화살표는 카탈로그의 `caret-left`/`caret-right`를 넣었습니다. **정지/재생 글리프는 카탈로그에
없어서 비슷한 것으로 때우지 않고** 파이프라인에 정식으로 추가했습니다 — `icon/pause` ·
`icon/play`, provenance `original`(출처를 대조할 수 없는 상태에서 upstream이라 적으면 그것이
추정 출처가 되고, `DS-D-0008` 결정 3이 그것을 빌드 실패로 둡니다).

아이콘 29 → **31**. 검색 키워드도 한국어·영어로 넣었습니다.

`play`가 `pause`와 **같은 세로 범위(4.5~19.5)**를 차지하게 그린 이유는, 두 상태를 오갈 때 글리프
높이가 변하면 버튼이 흔들리기 때문입니다.

### 빈 슬롯을 계약에 넣었습니다

`controlGlyphCount`를 measured에 두고 parity가 세 부품의 자식 수를 대조합니다. **빈 프레임이
다시 생기면 실패합니다.**

## 2026-08-18 (41) — 오버레이가 서버 렌더에서 던지고 있었습니다

실무 관점 전수 감사(5개 관점 · 35 에이전트)를 돌렸습니다. **확정 14건 중 blocker 7건**이고
**13건이 신규**입니다. 가장 심각한 것부터 고칩니다.

### Next.js 페이지가 500이 됩니다

`Dialog` · `ActionMenu` · `Tooltip` · `CompositePopover`가 **서버 렌더에서 예외를 던졌습니다.**
그리고 **열려 있든 닫혀 있든 상관없었습니다** — 삭제 확인 모달을 `open={false}`로 미리 심어 둔
App Router 페이지는 모달을 한 번도 열지 않아도 프리렌더가 죽습니다.

`DS-D-0002`가 소비 제품을 Next.js App Router 하나로 못 박았으니 피할 방법도 없습니다.

### 원인은 구현 내부 모순이었습니다

`OverlayProvider`가 서버에서 `services`를 `null`로 두고 그 값이 그대로 context로 흘렀습니다.
`useOverlayContext`는 `null`을 **"Provider 밖"으로 오판**해 던집니다.

그런데 같은 파일 77행 주석이 원래 의도를 적어 뒀습니다 — *"서버에서는 만들지 않는다. hosts가
null이면 portal은 아무것도 렌더하지 않는다."* **hosts가 null인 것으로 이미 충분했고**, context까지
null로 만들 이유가 없었습니다.

서버에서도 값을 만들되 Escape 리스너의 host만 아무것도 하지 않는 것으로 줍니다. `scrollLock`과
`inert`는 만들 때 DOM을 건드리지 않고 그 메서드는 effect 안에서만 불립니다.

### 게이트가 심볼만 보고 있었습니다

`verify-consumer`의 SSR 검사는 **Button만 렌더하고** Dialog·ActionMenu는 `typeof === "function"`만
확인했습니다. 그래서 이 결함이 게이트 12단계 초록인 채로 살아 있었습니다.

이제 네 경우를 실제로 렌더합니다 — Tooltip · Dialog(열림) · Dialog(닫힘) · ActionMenu(닫힘).
**반대 방향도 계약이라 함께 넣었습니다**: Provider 밖에서는 던져야 합니다. 안 던지면 host를
컴포넌트가 고르게 됩니다.

**탐지력을 확인했습니다** — 고친 것을 되돌리니 exit 1로 잡힙니다.

### 남은 blocker 6건

CSS import 순서 안내가 `tokens.css`를 빠뜨림 · Foundations 색 문서가 없는 변수 이름 9개를 적음 ·
아이콘 획 두께가 크기를 안 따라감 · EmptyState 64px 슬롯에 20px로 그려짐 · BannerCarousel 화살표가
빈 프레임 · Dialog에 Footer와 버튼이 없음. 순서대로 고칩니다.

## 2026-08-18 (40) — 컴포넌트 16개 중 11개가 텍스트를 못 바꿨습니다

owner 요구: **"실무적으로 안 되어있는 부분들 모두 해결해라."**

아이콘 슬롯을 고치고 나서 같은 방식으로 텍스트를 쟀습니다. **16개 중 11개가 하드코딩이었습니다.**

| 열려 있던 것 | 박혀 있던 것 |
| --- | --- |
| Button · Menu/Item · Dialog · Tooltip · Toast | ProjectCard · SelectableListRow · TextField · SegmentedControl · EmptyState · BannerCarousel · Badge · SidebarNavItem · AppTopBar · Checkbox · Slider |

디자이너가 인스턴스를 놓고 글자를 바꾸려면 **레이어를 열어 하나씩 고쳐야 했습니다.** 실무에서는
그렇게 쓰지 않습니다 — 인스턴스 속성 패널에서 바꿀 수 없으면 그 컴포넌트는 안 쓰이거나 detach됩니다.

### 21개 속성을 열었습니다

`ProjectCard.Eyebrow/Title/Meta` · `TextField.Label/Value/Message` ·
`SegmentedControl.Label1/2/3` · `SelectableListRow.Title/Meta/Trailing` 등입니다.

**모든 variant의 같은 자리 텍스트를 한 속성에 묶었습니다.** 하나라도 빠지면 variant를 바꿀 때
입력한 글자가 기본값으로 되돌아갑니다 — TextField는 8 variant, Badge는 5 variant입니다.

### readback이 이 축을 통째로 안 보고 있었습니다

더 나쁜 발견입니다. `figma/readback.json`의 `properties`에 **TEXT 속성이 하나도 기록돼 있지
않았습니다.** Button은 원래 `Label`이 있었는데도요.

그래서 parity가 *"선언되지 않은 property"*를 검사하고 있었지만, **애초에 읽지 않는 축이라 아무것도
못 잡았습니다.** 게이트가 초록인 채로 11개가 하드코딩이었던 이유입니다.

### 계약을 넓혔습니다

`figmaOnlyProperties`가 VARIANT 옵션만 받고 있어서 TEXT·INSTANCE_SWAP 슬롯을 선언할 자리가
없었습니다. 옵션이 없는 축은 **type만 대조**하도록 넓혔습니다.

그리고 텍스트 슬롯 26개를 전부 코드 prop과 짝지어 선언했습니다. `children`으로 받는 것(타입
선언에 항목으로 안 나타납니다)과 합성 컴포넌트의 하위 부품 children은 Figma 전용으로 갈랐습니다.

**탐지력을 확인했습니다** — `ProjectCard.Title`을 지우니 exit 1.

## 2026-08-18 (39) — 아이콘이 박혀 있던 것을 게이트가 잡게 합니다

owner 질문: **"아이콘도 이렇게 다 따로따로 컴포넌트화 하는 방식이 실무적인 방식이야?"**

개별 컴포넌트는 맞습니다 — Phosphor · Lucide · Material 전부 그렇고, Figma의 `INSTANCE_SWAP`이
개별 컴포넌트를 요구합니다. 한 세트에 variant로 몰면 아이콘 하나 바꿀 때마다 축이 29개가 됩니다.

**문제는 그 다음이었습니다.** 아이콘을 *받는* 쪽을 재보니 둘이 슬롯 없이 박혀 있었습니다.

| 컴포넌트 | 슬롯 | 박힌 아이콘 |
| --- | --- | --- |
| Button | `LeftIconGlyph` · `RightIconGlyph` | OK |
| IconButton | `Glyph` | OK |
| **SidebarNavItem** | **없음** | `icon/house` |
| **EmptyState** | **없음** | `icon/folder` |

**이것이 사이드바 네 행이 전부 house였던 직접적인 원인입니다.** 라벨은 바꿀 수 있는데 아이콘은
바꿀 수 없는 구조였고, 그래서 제가 "아이콘이 없다"고 판단했습니다 — 실제로는 `icon/graph`가
카탈로그에 있는데도요.

### 고친 것

두 컴포넌트에 `Glyph` 슬롯을 열고 variant 6개 + 1개의 아이콘 인스턴스를 전부 그 속성에
묶었습니다. 하나라도 빠지면 variant를 바꿀 때 아이콘이 기본값으로 되돌아갑니다.

### 되돌아가지 못하게

`iconSlots` 계약을 parity에 넣었습니다. **아이콘을 품는 컴포넌트가 교체 슬롯을 잃으면
실패합니다.** 탐지력을 확인했습니다 — 슬롯을 지우니 exit 1.

이 계약이 오늘 이전에 있었다면 홈 템플릿을 그렇게 만들지 않았을 것입니다.

### 여전히 없는 아이콘

제품 사이드바의 실제 지도(`Gnb.tsx`)를 읽으니 이렇습니다.

| 내비 | 아이콘 | 카탈로그 |
| --- | --- | --- |
| 홈 | `House` | 있음 |
| 노드 캔버스 | `Graph` | **있음** |
| 비디오 에디터 | `MagicWand` | 이관 보류 |
| 하이라이트 | `highlight_symbol` | 브랜드 심볼 — 아이콘 축이 아님 |
| 분석 | `youtube` · `InstagramLogo` | **서드파티 상표** |

**넷이 각각 다른 판정을 요구합니다** — 기술 처분(−45° 회전 rect) · 브랜드 자산 축 신설 · 상표
정책. 뭉뚱그려 그리면 `DS-D-0008`의 provenance 규칙을 우회하는 것이 됩니다.

## 2026-08-18 (38) — 만들 재료가 없어서 홈 템플릿을 내립니다

owner 지적: **"이 좌측 사이드바가 맞다고 생각하냐? 아이콘도 다 똑같고 앱 로고도 없는데?
유튜브 분석도 없고, 최하단 업그레이드 버튼도 없고."**

전부 맞습니다. 그리고 변명할 자리가 없는 이유는 — **제가 그 목록을 이미 갖고 있었습니다.**

오늘 돌린 배포본 분해 감사가 확정한 공용 미등록 7종 중 **넷이 정확히 사이드바 부품**입니다:
`sidebar-brand-wordmark`(앱 로고) · `sidebar-footer-cta`(하단 업그레이드) ·
`sidebar-compound-nav-row` · `avatar-progress-ring`(프로필 사용량 링).

**저는 이것을 읽고 보고까지 해놓고, 없는 것처럼 템플릿을 만들었습니다.**

### 진짜 원인 — 카탈로그가 화면이 아니라 인구조사로 만들어졌습니다

"제품에 버튼이 몇 벌 있나" 세서 합의하는 축만 남기는 방식이라, 결과물은 제품 사용의 **평균**이지
제품 화면이 아닙니다.

그래서 `app-shell-parts`가 준 것은 `SidebarNavItem` + `AppTopBar` **둘뿐**입니다. 실제 사이드바는
브랜드 헤더 · 내비 · 분석 eyebrow · 분석 항목 2 · 접기 버튼 · 하단 업그레이드 · 프로필 트리거입니다.
제품 코드에도 `sidebarBrandCrop` · `analyticsEyebrow` · `analyticsItems` · `GnbWordmarkLogo` ·
`GnbProfileAvatar`가 그대로 있습니다.

그리고 그것들을 **배치하는 규칙인 `app-shell` 패턴이 `web: not-ready` · `figma: not-ready`입니다.**

**재료도 조립 규칙도 없는데 두 부품으로 흉내를 냈습니다.** 옳은 판단은 *"앱 셸 패턴이 없으니 홈
템플릿은 아직 못 만든다"*고 말하는 것이었습니다.

아이콘도 같습니다. 카탈로그 29개에 노드캔버스·비디오에디터·하이라이트 아이콘이 없습니다.
`magic-wand`는 등록부에 *"−45° 회전 rect라 transform 없이 표현 안 됨, 이관 보류"*로 적혀 있는데
그것을 읽고도 house 아이콘 넷을 놓았습니다.

### 내렸습니다

Figma에서 템플릿을 지우고 **왜 비어 있는지를 페이지에 남겼습니다.** 아무 설명 없이 비면 다음
사람이 "아직 안 만들었다"로 읽는데, 사실은 **만들 재료가 없다**는 판정입니다.

`templates.measured.json`의 계약도 함께 내렸습니다(`$suspendedTemplates`). **만들 수 없는 것에
초록 계약이 붙어 있으면 그게 거짓말입니다.**

### 순서

1. 사이드바 부품 4종과 아이콘
2. `app-shell` 패턴을 `not-ready`에서 꺼낸다
3. 앱 홈 재조립
4. 허브 3종

그리고 템플릿 계약에 **"부품이 카탈로그에 있는가"**를 넣어야 합니다. 오늘 넣은 `requiredParts`는
*Figma에 그 이름이 있는가*만 봐서, 없는 부품을 house 아이콘으로 대신하는 것을 막지 못합니다.

## 2026-08-18 (37) — 템플릿이 제품과 뭐가 다른지 게이트가 봅니다

owner 지적: **"배포환경과 뭐가 다른지 너가 스스로 다 깨우쳐야 된다."**

오늘 지적받은 것들의 공통점이 하나입니다 — **전부 게이트가 안 보는 자리였습니다.** Foundations가
비어 있던 것도, 컴포넌트가 섹션 밖에 흩어져 있던 것도, 템플릿이 커버리지 도표였던 것도,
루트가 일반 프레임이었던 것도, 라벨이 자리표시자인 것도 그렇습니다.

그래서 라벨을 손으로 또 채우는 대신 **계약을 넓혔습니다.**

### 계약이 숫자만 보고 있었습니다

`templates.measured.json`은 폭·여백·반경 같은 수치만 대조했습니다. 그래서 **부품이 빠져도, 라벨이
전부 "보관함"이어도 초록**이었습니다.

네 가지를 더했습니다.

| 계약 | 값 | 왜 |
| --- | --- | --- |
| `requiredParts` | 7종 | 부품이 빠지면 화면이 아니라 **화면 흉내**다 |
| `navLabelsDistinct` | 4 | 같은 라벨이 반복되면 템플릿이 아니라 자리표시자다 |
| `cardTitlesDistinct` | 8 | 제목이 같으면 그리드가 아니라 벽지로 읽힌다 |
| `placeholderLabelsAllowed` | 0 | "배너 제목" · "Label"이 남아 있으면 조립이 끝나지 않은 것이다 |

근거는 전부 제품 `AppHomeScene`의 렌더 트리입니다 — scene → main → 배너 section(CTA 포함) →
archiveSection(헤더 + 그리드), 그리고 `floatingCreateDock`.

**탐지력을 확인했습니다.** 부품 하나를 빼니 실패하고, 카드 제목을 하나로 되돌리니 실패했습니다.

### 함께 고친 것

**루트를 auto-layout으로 바꿨습니다.** 일반 프레임이라 폭을 줄여도 안쪽이 따라오지 않았습니다.
사이드바 FIXED 280, 본문 FILL입니다.

빠져 있던 부품을 채웠습니다 — 배너 CTA · 섹션 헤더(eyebrow + "새 프로젝트") · 우하단 플로팅 생성
버튼. 인스턴스 18 → **21**.

### 아직 다른 것

배너 이미지, 카드 썸네일, 카드 더보기 버튼, 사이드바 아이콘 4종이 제품과 다릅니다. **이것들도
계약에 넣어야 합니다** — 지금은 제가 눈으로 세고 있고, 그게 오늘 반복된 실패의 원인입니다.

## 2026-08-18 (36) — SEED과 대조했더니 우리 이름의 결함 둘이 나왔습니다

owner 요청으로 seed-design.io 전 영역(색·타이포·레이아웃·tier 구조·컴포넌트)을 읽고 우리 토큰과
축별로 대조했습니다. **판정은 "SEED 이름을 가져오지 않는다"입니다.**

근거가 셋입니다.

1. `execution-handoff.md`가 *"SEED의 token 이름·값"*을 복제 대상에서 제외한 **normative 문장**을
   이미 갖고 있습니다. 가져오려면 그것을 뒤집는 Decision이 먼저입니다.
2. **SEED에는 `hover` 토큰이 0개입니다.** 모바일 앱 우선 시스템이라 hover 축이 없습니다. 데스크톱
   웹인 우리는 7개를 쓰고, SEED 어휘로는 표현할 방법이 없습니다.
3. SEED의 적응형 팔레트(primitive `gray-00`이 테마에 따라 흰↔검으로 뒤집힘)는 `DS-D-0010 §2`가
   *"반전을 primitive로 옮기면 mode 축이 두 벌이 된다"*고 적고 **이미 기각한 설계**입니다.

즉 SEED과 다른 축의 상당수는 실수가 아니라 **기록된 결정**이었습니다.

### 그런데 대조 과정에서 우리 결함 둘이 드러났습니다

**① `color-action-primary-pressed`가 옛 혼동을 들고 있었습니다.**

`interaction-states.md`는 `active`=`:active`(누르는 중, 일시적), `pressed`=`aria-pressed="true"`
(토글 켜짐, 지속)로 고정하고 **"절대 섞지 않는다"**고 못 박았습니다. 그 문서 자체가 과거 이
혼동을 기록하려고 쓰였습니다.

그런데 이 토큰은 `button.css`와 `icon-button.css`에서 **`:active`로 소비됩니다.** 컴포넌트 층은
고쳤는데 **토큰 이름만 옛 이름으로 남아 있었습니다.** `color-action-primary-active`로 바꿨습니다.

**SEED은 이것을 잡아 주지 못합니다** — SEED에 `active` 축이 없어 SEED도 `pressed`라 부릅니다.
우리 규범이 SEED보다 정밀한 자리입니다.

**② 축 순서가 세 갈래였습니다.**

| 형태 | 개수 |
| --- | ---: |
| 속성이 앞 (`color-background-canvas`) | **24** |
| 속성이 뒤 (`color-status-danger-background`) | 8 |
| role 우선, 그룹 안에서도 흔들림 | 18 |

SEED은 `$color.{property}.{role}` 하나로 예외가 없고, **이 축은 SEED이 낫습니다.** 다만 처방은
"SEED 이름을 쓴다"가 아니라 **"우리 다수파로 통일한다"**입니다.

`color-status-*` 8개를 속성 앞으로 옮겼습니다 — `color-background-danger` ·
`color-foreground-danger` 식입니다. `color-border-danger`가 이미 그 형태라 나란히 섭니다.

### 왜 지금인가

**공개 release도 published 라이브러리도 없어 외부 소비자가 0입니다.** 지금이 가장 싼 시점입니다.
`DS-P3-014`가 토큰을 174 → 약 340개로 확장 중이라, 확장 전에 규칙을 고정해 두는 편이 사후
rename보다 훨씬 쌉니다.

### 같은 변경 단위에서 움직인 것

토큰 원천 · 생성물 6종 · 저작 CSS 5개 · Figma 변수 9개 · readback · snapshot · measured 계약 ·
규범 문서 4개 · baseline 재고정. **테스트가 두 번 막았습니다** — badge와 surface-states가
`components.measured.json`의 states 표를 읽는데 거기 옛 이름이 남아 있었습니다.

`design/updates/README.md`의 과거 항목은 **바꾸지 않았습니다.** 그때 그 이름이었던 것이 사실이고,
기록을 고치면 그 사실이 사라집니다.

## 2026-08-18 (35) — Templates에 진짜 화면이 섰습니다

owner 지적: **SEED 문서가 "Figma 라이브러리는 모든 토큰, 아이콘, 컴포넌트, 화면 템플릿을
포함한다"고 적어 뒀는데, 우리 Templates에는 화면이 없었습니다.**

있던 것은 `Home — /archive (coverage)`라는 **커버리지 도표**였습니다. 무엇이 DS로 덮이고 무엇이
안 덮이는지 진단하려고 만든 것이지, 디자이너가 복제해서 화면을 시작할 템플릿이 아니었습니다.

그 상태로 publish를 권한 것은 **판단 착오였습니다.** SEED이 정의한 네 축 중 하나가 통째로 비어
있는 라이브러리를 내보낼 뻔했습니다.

### 앱 홈을 DS 컴포넌트로 조립했습니다

1440×900. 사이드바 4행 · 상단 바 · 배너 · 프로젝트 카드 8장, **인스턴스 18개**입니다.

**여기서 새로 그린 도형은 하나도 없습니다.** 전부 Components 페이지의 인스턴스입니다 — 템플릿에서
직접 그리면 그 순간 컴포넌트와 갈라지고, 다음 사람이 어느 쪽이 정본인지 알 수 없게 됩니다.

라벨도 제품 그대로입니다. 사이드바는 홈 · 노드 캔버스 · 비디오 에디터 · 하이라이트 순이고,
카드 제목 8개가 서로 다릅니다 — 같은 제목이 반복되면 그리드가 아니라 벽지로 읽힙니다.

### 게이트가 두 값을 잡았습니다

제가 여백을 DS 스케일로 골랐는데 parity가 제품 실측과 다르다고 막았습니다.

| 축 | 제가 쓴 값 | 제품 실측 |
| --- | --- | --- |
| 사이드바 좌우 여백 | 8 | **12** |
| 그리드 섹션 상단 여백 | 24 | **40** |

12는 `spacing/control-md`가 정확히 같아 변수로 걸었습니다. **40은 DS spacing에 없습니다** —
gap registry가 이미 기록한 격차이고, 토큰이 설 때까지 raw 값으로 두고 그 사실을 코드 주석에
남겼습니다.

이 두 값은 제가 눈으로는 못 잡았을 것들입니다. **화면을 실제로 조립하니 게이트가 잡아 줬습니다.**

## 2026-08-18 (34) — Figma 문서를 SEED의 상세 페이지처럼 다시 씁니다

owner 지적: **"지금 너가 작성한 말투는 좀 딱딱해."** 맞습니다. `seed-design.io`의 컴포넌트 상세
페이지를 다시 보고 두 가지를 고쳤습니다.

### 순서

SEED은 **이름 → 한 줄 소개 → Props → 미리보기** 순입니다. Figma도 같게 맞췄습니다. 전에는
이름과 설명뿐이라 어떤 축이 있는지 보려면 세트를 클릭해야 했는데, 이제 `Tone: neutral · danger`
같은 줄이 캔버스에 함께 놓입니다. Figma에서는 variant 속성이 곧 Props입니다.

### 말투

SEED의 개요는 존댓말 한 문장입니다 — *"명확한 액션을 쉽게 수행할 수 있도록 돕는 기본 인터랙션
컴포넌트입니다."* 저희 규범 문서는 "~한다"체인데 그건 **규범 문체라 그대로 둡니다.** 대신 사람이
보는 표면에 쓸 문장을 따로 두었습니다.

각 컴포넌트 문서의 frontmatter에 `summary`를 넣고, `build-figma-summaries.mjs`가 그것을
우선합니다. 없으면 예전처럼 본문 첫 문장으로 물러납니다. **어느 쪽이든 문서가 원천이고 생성기가
문장을 짓지 않습니다** — `pnpm check`가 어긋남을 그대로 잡습니다.

| 전 | 후 |
| --- | --- |
| 방금 한 일의 결과를 짧게 알리고 스스로 사라진다. | 방금 한 일의 결과를 짧게 알리고 스스로 사라집니다. |
| 아직 오지 않은 내용의 자리를 지킨다. | 아직 오지 않은 내용의 자리를 지킵니다. |

### 배치

라벨이 세 줄로 커지면서 Spinner 라벨이 Toast 미리보기를 덮었습니다. 컴포넌트 사이 간격을 240으로
넓히고, 예시 프레임은 카탈로그 뒤로 내렸습니다. 겹침을 실측해 **0건**입니다.

## 2026-08-18 (33) — 자동으로 움직이는 것은 멈출 수 있어야 한다

앞 항목이 남긴 결함을 닫는다. 캐러셀의 자동 넘김이 멈추지 않아 **WCAG 2.2.2가 미해소**였다.

### owner 판정이 필요하지 않았다

`"배포환경이랑 아주 똑같아야해"`와 접근성이 부딪히는 첫 지점이라 owner에게 올리려 했는데,
**이 저장소의 규칙이 이미 답을 갖고 있었다** — CLAUDE.md의 *"제품 전용 화면 코드와 **과거 UI
부채를** 이 저장소의 공용 규범으로 복사하지 않는다."*

접근성 결함은 부채다. 옮기지 않는다.

### 멈추는 경우 셋

1. **정지 버튼.** 상태는 버튼이 소유하며 `aria-pressed`로 말한다.
2. 포인터가 위에 있거나 **초점이 안에 있으면** 멈춘다. 읽는 중에 글자가 바뀌지 않게 한다.
3. `prefers-reduced-motion: reduce`이면 **아예 돌지 않는다.** 느리게 도는 것은 답이 아니다.

**2번을 `aria-pressed`에 반영하지 않았다.** hover는 의도가 아니라 부수효과이고, 그것으로 상태를
흔들면 스크린 리더가 커서 움직임마다 상태를 읽는다. 시각적 일시정지와 선언된 정지는 다른 것이다.

### 제품보다 36px 넓어졌다

컨트롤 폭이 126 → **162**다(28 버튼 + 8 간격). **의도적으로 다른 값**이며 measured의 `$pause`,
규범의 Known deviations, manifest note 세 곳에 이유를 적었다. 나중에 누가 "제품과 다르다"고
보고했을 때 **답이 이미 문서에 있어야 한다.**

Figma set의 네 variant에도 같은 부품을 넣어 parity가 그 폭을 대조한다. 코드에만 넣고 Figma를
비워 두면 다음 사람이 그것을 버그로 읽는다.

### `autoAdvanceMs={0}`이면 정지 버튼을 그리지 않는다

멈출 것이 없는 버튼은 거짓말이다. 슬라이드가 하나일 때 화살표를 그리지 않는 것과 같은 이유다.

테스트 696 → **700**.

## 2026-08-18 (32) — BannerCarousel의 Figma set이 섰다

component 19 → **20**. `figma: not-ready` → `partial`. **이제 parity가 이 컴포넌트를 지킨다** —
그 전까지는 코드만 있고 Figma 쪽 계약이 비어 있었다.

### variant 축 둘

`Tone`(bright · dark) × `Bleed`(boxed · full) 4벌이다. 둘 다 코드의 타입 선언과 대조된다 —
`BannerTone`과 `BannerCarouselBleed`. 후자는 이 계약을 위해 export를 새로 열었다. 인라인
union으로 두면 Figma variant가 무엇과 맞는지 게이트가 확인할 수 없다.

**Tone이 variant인 이유**는 톤이 색을 바꾸기 때문이고, **Bleed가 variant인 이유**는 반경을 바꾸기
때문이다. 기하 키를 `Bleed` 값으로 잡았다 — Size 축이 없고 반경을 바꾸는 유일한 축이라 그 값이
곧 키다.

### 점의 활성과 비활성을 둘 다 잰다

같은 부품의 두 값이면 합성 키를 쓰겠지만, **활성과 비활성은 서로 다른 자리에 동시에 존재한다.**
그래서 `DotActive`(20×7)와 `DotRest1`(7×7)로 이름을 갈라 둘 다 대조한다. 폭이 상태라는 계약이
Figma 쪽에서도 기계로 지켜진다.

### 960×240은 정본이 아니다

measured에 `$note`로 박아 뒀다. 높이는 소비처가 정하고 **허브 4종이 서로 다르다.** Figma의 예시
크기가 정본인 척하지 않도록 적어 둔 것이며, 규범과 component set description에도 같은 문장이 있다.

### 테두리도 그림자도 없는 것이 계약이다

배너의 경계는 **사진 자체**이고 컨트롤은 면과 흐림으로만 떠 있다. 여기에 테두리가 생기면 사진
위에 선이 그어진다. `strokes: {}` · `effects: {}`로 못 박아, 누가 나중에 얹으면 parity가 잡는다.

raw fill 0 · raw stroke 0 · 텍스트 스타일 8개 전부 바인딩.

## 2026-08-18 (31) — BannerCarousel이 섰다

허브 4종을 동시에 막던 컴포넌트다. 배포본 실측을 CSS · React · 테스트 · 규범으로 옮겼다.
component 20 → **21**, 테스트 688 → **696**.

### 계약 셋

**톤은 테마가 아니다.** `tone="bright"`는 사진이 밝다는 뜻이고, 그래서 글자가 **어두워진다**.
샘플링은 소비처가 갖는다 — 흡수하면 DS가 이미지 로딩과 CORS를 떠안는다.

**높이는 소비처가 정한다.** 슬라이드가 전부 absolute라 높이를 안 주면 0으로 접히고
`overflow: hidden`이 컨트롤을 잘라 클릭조차 되지 않는다. 기본값을 넣지 않은 이유는 허브 4종의
배너 높이가 서로 달라 **실측된 단일 정본이 없기 때문**이다. 임의의 값은 정본인 척한다.

**슬라이드가 하나면 컨트롤을 그리지 않는다.** 넘길 곳이 없는 화살표와 점은 거짓말이다.

### 폭이 상태이고, 폭만으로는 부족하다

점의 활성 폭 20px가 "지금 몇 번째인가"를 말한다(DS-D-0019). 그런데 **폭은 보조기술이 읽지
않는다.** 그래서 `aria-selected`가 함께 상태를 갖는다 — 시각과 의미가 각자 자기 축으로 말하며
어느 한쪽만으로는 계약이 성립하지 않는다.

### 테스트가 나를 세 번 세웠다

1. **`render`가 비동기 커밋이다.** `await` 없이 질의하니 컨테이너가 비어 있었다. 이 저장소의
   기존 테스트는 전부 `await render(...)`인데 내가 빠뜨렸다.
2. **화살표 클릭이 15초 타임아웃**으로 죽었다. 높이 0 + `overflow: hidden`이라 컨트롤이 잘려
   있었다. 컴포넌트 결함이 아니라 **계약을 테스트가 안 지킨 것**이었고, 그 사실을 규범에 적었다.
3. **`userEvent` import 경로를 지어냈다.** `@vitest/browser/context`가 아니라 `vitest/browser`다.
   typecheck가 잡았다.

### 남긴 결함 하나

**자동 넘김이 포커스나 hover에서 멈추지 않는다.** 제품도 멈추지 않는다. 제품 값을 그대로 옮긴
상태라 **WCAG 2.2.2가 해소되지 않았다.** 감추지 않고 Known deviations에 적었고 manifest note에도
남겼다. 다음 변경 단위에서 정지 수단을 판정한다.

### 남은 것

Figma component set. `figma: not-ready`이며 그것이 서야 parity가 이 컴포넌트를 지킨다.

## 2026-08-18 (30) — Tailwind 다리를 실제로 건너 본다

owner 질문: **"디자인시스템은 테일윈드가 아니야?"** 아니다 — DS는 Tailwind에 의존하지 않고
`.kds-*` plain CSS로 저작한다(DS-D-0004). 다만 토큰을 `@theme inline`으로 **발행**한다(DS-D-0013).
쓰는 건 plain CSS, 주는 건 Tailwind 테마다.

그 다리를 아직 아무도 건너지 않았다는 것이 문제였다. 건너 봤다.

### 내가 틀렸던 것

앞 항목에서 **"제품의 `--spacing: 2px` 격자와 DS 스케일이 부딪혀 모든 간격이 두 배로 틀어질 수
있다"**고 적었다. 재보니 **아니다.** DS `theme.css`의 변수 183개와 제품 `tailwind.css`의 144개를
이름으로 대조하니 **겹치는 것이 0개**다. DS는 `--spacing-<이름>`을 쓰고 제품의 곱수는 `--spacing`이라
서로 건드리지 않는다.

### 진짜 위험은 순서였다

제품은 `@theme`에서 네 namespace를 통째로 지운다 — `--color-*` · `--radius-*` · `--text-*` ·
`--font-*`. **DS도 그 네 namespace를 쓴다.**

제품이 실제로 쓰는 Tailwind 4.3.3으로 두 순서를 컴파일했다.

| 유틸리티 | DS → 제품 | 제품 → DS |
| --- | --- | --- |
| `bg-action-primary` | **생성 안 됨** | 생성됨 |
| `text-foreground-primary` | **생성 안 됨** | 생성됨 |
| `rounded-card` · `rounded-control` | **생성 안 됨** | 생성됨 |
| `p-3` · `gap-3` (대조군) | 생성됨 | 생성됨 |

**빌드는 성공한다.** 오류 없이 `bg-action-primary`가 아무것도 하지 않는 클래스가 된다. 대조군이
양쪽에서 살아 있으니 빌드 실패가 아니라 정확히 reset 범위의 문제다. **가장 나쁜 실패 모양이다.**

### 계약으로 못 박았다 — DS-D-0020

`@klipse-design/css/theme.css`는 제품의 Tailwind 진입 CSS **뒤에** 온다. 문서의 권고가 아니라
`scripts/verify-tailwind-interop.mjs`가 매 `pnpm verify`에서 검사하는 계약이다.

**Tailwind는 제품 저장소의 것을 쓴다.** DS는 Tailwind에 의존하지 않고, interop을 재는 데는 제품이
실제로 쓰는 버전이 정본이다. 새 의존성이 0이다.

canary가 두 방향이다. 반대 순서에서 **전부 살아남아도 실패**하고(계약이 사라진 것이므로 다시
판정해야 한다) **일부만 사라져도 실패**한다(제품의 reset 범위가 바뀐 것이다).

### 게이트가 또 한 번 나를 막았다

DS-D-0020 초안이 제품의 Tailwind 진입 CSS 경로를 줄 번호까지 직접 인용했더니 빌드가 거부했다 —
**규범 문서는 제품 저장소 전용 경로를 참조할 수 없다.** 옳은 규칙이라 위치 근거를 비규범
`migration/klipse-web-adoption.md`로 옮겼다.

`pnpm verify`가 12단계가 됐다.

## 2026-08-18 (29) — 캐러셀 CSS가 섰다

배포본 `TabBannerCarousel.tsx` 실측을 CSS로 옮겼다. component 21 → **22**.

### 이름 하나를 더 세웠다

콘텐츠 좌우 인셋 20px에 맞는 이름이 `space-toast-inline`뿐이었다. 값은 같지만 **빌리지 않았다** —
이 저장소는 컴포넌트 이름 토큰을 금지하는데 토스트 이름을 배너가 쓰면 그 규칙이 무의미해진다.
`space-media-inset`을 세웠다. 변수 231 → **232**.

### 게이트가 두 번 막았고 둘 다 옳았다

1. **raw color 리터럴** — progressive blur의 mask가 `rgb(0 0 0 / 92%)` 다섯 스톱이었다. mask는
   색이 아니라 **알파만** 쓰므로 `currentcolor`를 섞어 같은 결과를 낸다. 어떤 색을 넣어도 결과가
   같고 규칙은 그대로 지킨다.
2. **없는 토큰** — `border-width-focus-ring`을 지어냈다. 실제 이름은 `border-width-ring`이고
   Slider가 이미 그것을 쓰고 있다.

### 숫자 z-index를 쓰지 않았다

제품은 `z-1`·`z-2`·`z-3`을 쓴다. DS는 **DOM 순서가 곧 칠 순서**다 — 슬라이드 뒤에 컨트롤을 두면
같은 결과가 나온다. Dialog와 ProjectCard가 이미 같은 방식이다.

### reduced motion에서 흐림도 지운다

레이아웃 재계산이 가장 비싸므로 점의 폭 전환을 제일 먼저 끈다. progressive blur도 함께 지운다 —
제품이 `motion-reduce`에서 지우는 것과 맞췄고, 흐림 자체가 합성 부담이다.

### 남은 것

React · 브라우저 테스트 · 규범 문서 · Figma component set · manifest. CSS만으로는 아직
소비처가 없다.

## 2026-08-18 (28) — 사진 위의 색에 이름을 준다

캐러셀 CSS를 쓰려다 멈춘 자리를 푼다. 제품의 배너 부품은 **고정 `--palette-gray-*`를 쓰고**
주석이 이유를 적어 뒀다 — *"사이트 테마와 무관하게 항상 같은 모습이어야 하므로."*
**배너의 면은 사진이지 테마 표면이 아니다.**

DS의 semantic 색 41개는 전부 테마를 따라 뒤집힌다. 그리고 CSS 게이트가 primitive 직접 소비를
막는다. 그래서 정직하게 쓸 방법이 없었다.

### 값은 이미 DS 안에 있었다

제품의 `--palette-gray-000`(#fafafa) · `900`(#171b22) · `1000`(#000000)은 각각 DS의
`neutral.0` · `neutral.900` · `neutral.1000`과 **정확히 같다.** 없던 것은 이름이지 값이 아니다.
알파 셋(`black-alpha.28` · `paper-alpha.45` · `paper-alpha.88`)만 더했다.

### light와 dark에 같은 값을 넣는다

| 토큰 | 별칭 |
| --- | --- |
| `color-media-foreground-bright` | `neutral.900` |
| `color-media-foreground-dark` | `neutral.0` |
| `color-media-scrim-bright` | `neutral.0` |
| `color-media-scrim-dark` | `neutral.1000` |
| `color-media-control-surface` | `black-alpha.28` |
| `color-media-control-foreground` | `paper-alpha.88` |
| `color-media-control-hover` | `paper-alpha.14` |
| `color-media-indicator-rest` | `paper-alpha.45` |
| `color-media-indicator-active` | `neutral.0` |

두 모드에 같은 primitive를 건다. **값이 우연히 같은 것이 아니라 같아야 한다는 계약**이며,
모델을 벗어나지 않으면서 "테마 무관"을 표현하는 유일한 방법이다. 누가 한쪽 모드만 바꾸면
`theme-mode-completeness` canary가 아니라 **의도가 깨진 것**이므로, 규범 문서에 그 사실을 적는다.

`bright`/`dark`가 테마 이름이 아니라 **이미지 톤** 이름인 것에 주의한다 — 밝은 사진 위에서는
글자가 어두워야 하므로 `media-foreground-bright`가 `neutral.900`이다.

Figma에도 primitive 3 · semantic 9를 만들고 readback을 갱신했다. 변수 219 → **231**.

## 2026-08-18 (27) — 배포본에서 8화면을 다시 분해한다

`screen-inventory.md`는 `sniperfactory-official/klipse`의 `louis`(2026-08-04, dirty 트리)를 읽고
만든 것이고, 그 문서 스스로 **"브라우저 실측 렌더를 하지 않았다"**고 적어 두었다. 그 수(72·130·144,
그리고 내가 인용한 41)는 전부 그 위에 얹혀 있었다.

배포본 `origin/main` 7e9c3b69에서 8화면을 다시 분해했다.

| 단계 | 수 |
| --- | ---: |
| 분해된 구성요소 | **393** |
| 조립 불가로 1차 판정 | **227** |
| **반증 검증을 실제로 거친 것** | **64** |
| 반증으로 뒤집힌 것 | 8 |
| 확정 미등록 | 56 |
| 중복 제거 후 고유 종류 | **49** |

### 상한을 명시한다

반증 단계에 **화면당 8건**의 상한을 걸었다(8×8=64). 227건 중 **163건은 아무도 반증을 시도하지
않았다.** 49는 *"검증을 거친 64건에서 나온 고유 종류"*이지 전체 gap의 크기가 아니다. 검증된 것
중 **12.5%가 뒤집혔으므로** 나머지에도 비슷한 비율의 오판이 있다고 봐야 한다.

상한을 걸었다는 사실을 적지 않으면 이 표는 **"다 셌다"로 읽힌다.** 그것이 이 저장소가 오늘
"카탈로그가 닫혔다"로 이미 한 번 겪은 일이다.

### 결과의 모양

공용 후보는 **7종뿐**이다 — 사이드바 부품 셋, 진행률 링 아바타, **배너 캐러셀**, 배너 컨트롤,
determinate 진행바. 나머지 **42종은 한 화면 전용**이다.

이 비율이 판정을 바꾼다. 미등록이 많다는 것과 **DS가 만들어야 할 것이 많다**는 것은 다르다.
이 저장소의 규칙은 *제품 전용 화면 코드를 공용 규범으로 복사하지 않는다*이므로, 42종은 각각
DS가 소유할지 제품이 소유할지 판정 대상이지 자동으로 카탈로그 작업이 아니다.

캐러셀이 공용 7종 안에 두 번 들어가 있다(본체와 컨트롤). 지금 짓고 있는 것이 맞다.

## 2026-08-18 (26) — 캐러셀을 막던 넷 중 셋이 무너졌다

`figma-gap-registry.md`는 BannerCarousel을 **"선행 조건 넷이 충족되지 않았다"**로 막아 뒀다.
배포본(`origin/main` 7e9c3b69)의 `TabBannerCarousel.tsx`를 직접 재니 셋이 무너졌다.

| 막는다던 것 | 배포본 실측 |
| --- | --- |
| stagger 지연 축이 DS에 없다 | **0 · 40 · 80 · 150ms**. opacity 300ms `ease`, transform 360ms `cubic-bezier(.22,1,.36,1)` |
| 점 폭 전환 토큰이 없다 | **`width 220ms cubic-bezier(.4,0,.2,1)`** + 배경 160ms. 7px → `w-10` × `--spacing:2px` = **20px** |
| 톤이 런타임 샘플링이라 DS가 소유할 수 없다 | 제품은 톤을 **CSS 변수 두 개**(`--banner-text-rgb`·`--banner-scrim-rgb`)로만 넘긴다. DS 계약은 `tone: "bright" \| "dark"` prop이고 샘플링은 제품이 갖는다 |
| progressive blur를 표현할 방법이 없다 | **CSS로는 정확히 표현된다** — `blur(22px) saturate(125%)` + 5스톱 `mask-image`, `motion-reduce`에서 둘 다 제거. Figma 근사 문제만 남는다 |

**미결이 아니라 값이었다.** 재보지 않고 "막혔다"를 세 번 반복한 것이 스켈레톤 면 색과 같은
실수다.

### 새 lifecycle — DS-D-0019

점의 폭 전환은 기존 lifecycle 어디에도 못 들어갔다. `enter`/`exit`은 `opacity`·`transform` 계열,
`loop`은 `opacity`·`rotate`·`background-position`뿐이고 **레이아웃을 다시 계산시키는 property가
어디에도 없다.**

그래서 `layout-change`를 열었다. 허용은 `inline-size`·`block-size`·`background-color` 셋이다.
`scale`로 알약을 늘리면 **두께와 반경까지 함께 늘어나** 7px 알약이 20px 자리에서 찌그러진다 —
제품도 `width`를 쓴다. 그 폭이 곧 "여기가 지금 몇 번째인가"이고, 점에는 라벨이 없어 폭 말고
현재 위치를 말하는 것이 없다.

`block-size`는 **소비처가 없다.** 이 저장소의 규칙대로 다음 재검토에서 소비처가 생기지 않으면
뺀다고 Decision에 적어 뒀다.

### 토큰 9종 · 양방향 계약이 작동했다

`crossfade-enter` · `zoom-settle` · `content-fade` · `content-rise` · `stagger-1/2/3` ·
`layout-change` · `control-hover`. **컴포넌트 이름을 붙이지 않았다** — 역할 이름이다.

토큰을 넣자 세 게이트가 차례로 막았고 전부 정당한 요구였다.

1. `motionProperties` — "이 모션이 무엇을 애니메이션하는가"를 선언하라(DS-D-0017)
2. `reducedMotionPairs` — reduced-motion 짝을 두어라
3. **`verify-figma-parity` — Figma에 없는 변수는 통과시키지 않는다**

셋째가 핵심이다. **토큰만 코드에 넣고 Figma를 비워 두는 길이 막혀 있다.** Figma Semantic
collection에 9개를 만들고 readback을 갱신했다. 변수 210 → **219**.

baseline은 playbook의 "의도적 breaking" 절차대로 갱신했다 — Decision을 먼저 쓰고, diff를
분류별로 확인하고, 그다음 복사했다.

### 다섯째 막는 것이 나왔다 — 손이 멈춰서

CSS를 실제로 쓰려니 멈췄다. 제품의 배너 부품은 **고정 `--palette-gray-*`를 쓴다.** 제품 주석이
이유를 적어 뒀다 — *"사이트 테마와 무관하게 항상 같은 모습이어야 하므로 테마에 따라 뒤바뀌는
`--gray-*` semantic 토큰 대신"*. 배너의 면은 **사진**이지 테마 표면이 아니다.

DS의 semantic 색 41개는 **전부 테마를 따라 뒤집힌다.** 그리고 CSS 게이트가 primitive 직접 소비를
막는다. 지금 상태로는 이 컴포넌트의 색을 정직하게 쓸 수 없다.

**앞의 넷은 문서를 읽어 적은 것이고 이것은 손이 멈춰서 나왔다.** 실측 명세를 gap registry에
전부 적어 두었으므로 다음 단위는 색 토큰부터 시작한다.

### 아직 컴포넌트가 없다

**이 커밋의 토큰 9종은 소비처가 0이다.** 이 저장소가 이미 지적한 상태(delay 토큰 8종이 전부
0ms에 소비처 0)와 같은 모양이며, 다음 변경 단위에서 BannerCarousel이 전부 소비한다. 그때까지
이것은 **끝난 일이 아니라 절반**이다.

## 2026-08-18 (25) — 줄을 읽는 대신 브라우저가 풀게 한다

`product.measured.json`의 187축은 제품 소스의 **줄**을 인용한다. `globals.css:82`를 읽고
"40px"이라 적는 식이다. **줄 읽기는 cascade와 media query를 모른다.** 이 저장소는 이미 그
함정을 밟은 적이 있다 — 제품의 `.app-native-checkbox`가 cascade layer 밖이라 소비처가 이길 수
없었고, 그래서 21벌 중 2벌만 그 "정본"을 썼다.

owner 요구가 **"배포환경이랑 아주 똑같아야해"**이므로, 줄 읽기로는 부족하다.

### 제품 서버는 띄우지 않는다

`.env.local`이 있어 실제 서비스에 붙을 수 있고 그건 이 저장소가 할 일이 아니다. 대신 배포본의
**정적 stylesheet만** `git show`로 읽어 빈 문서에 올리고 실브라우저가 `:root`를 풀게 한다.
제품의 런타임·DB·자격 증명에 닿지 않는다.

### 문맥 4벌로 잰다

다크·데스크톱 / 라이트·데스크톱 / 다크·모바일(375) / 다크·reduced-motion. 하나라도 빼면 "한
값"으로 보이는 것이 사실은 여럿이다.

**인용된 변수 33개 중 6개가 문맥에 따라 갈렸다:**

| 변수 | 갈리는 축 |
| --- | --- |
| `--gray-000` · `--gray-000-rgb` | 테마 (`#fafafa` ↔ `#000000`) |
| `--app-tooltip-bg` | 테마 (`#e3e4e8` ↔ `#313640`) — 툴팁은 반전된다 |
| `--glass-dropdown-frame` | 테마 (5겹 그림자의 알파가 전부 다르다) |
| `--type-body-16-size` | 뷰포트 (≤450px에서 16 → **14**) |
| `--app-tooltip-motion-scale-rest` | reduced-motion (0.97 → **1**) |

### 결과: 기록이 맞았다

여섯 갈래 전부 문서가 이미 옳게 적어 뒀다. 다크/라이트 분기도, ≤450px에서 14px로 내려가는 것도
그대로였다. **줄 읽기가 이번엔 틀리지 않았다는 것을 브라우저가 확인해 줬다** — 그리고 이제 그
확인이 매 `pnpm verify`에서 자동으로 돈다.

### 게이트가 잡은 것

첫 판에서 세 건이 실패했는데 셋 다 **내 추출 규칙이 순진해서**였다. `4px (gap-2 × --spacing:2px)`는
`--spacing` 값이 아니고 `calc(var(--button-radius) - 2px)`는 파생식이다. 변수가 **값을 직접 담는
형태**일 때만 대조하도록 좁혔다.

하나는 남겨 뒀다 — `--profile-avatar-size`는 `:root`에 없다. 특정 스코프가 소유한다는 뜻이고,
실패가 아니라 **"이 변수를 제품 전역 정본으로 인용하면 안 된다"는 신호**라 그렇게 출력한다.

### 곧바로 잡힌 결함 — 스타일시트를 덜 실었다

첫 판은 `globals.css`와 `keyframes.css`만 올렸다. 그런데 제품은 `app/layout.tsx`에서
**`tailwind.css`를 먼저** 싣고 그 안에서 `keyframes.css`를 `@import`한 뒤 `globals.css`가 온다.
그리고 `--spacing: 2px`는 `tailwind.css`의 **`@theme inline`** 블록 안에 있다.

브라우저는 `@theme`을 모른다. 그래서 그 값이 통째로 사라져 **없는 것처럼 보였고**, 제품이 4px이
아니라 **2px 격자**를 쓴다는 사실이 게이트에서 지워져 있었다. Tailwind v4가 `@theme`의 선언을
`:root`로 내보내므로 같게 번역해 싣도록 고쳤다. 지금은 `--spacing`이 `2px`로 풀린다.

이것이 곧 `w-10`이 40px이 아니라 **20px**이라는 뜻이고, 캐러셀 점의 활성 폭 판정이 여기에 걸려
있었다.

### 함께 선 것: 근거 파일 잠금

`product-evidence.lock.json`이 인용 파일 34개의 blob 해시를 배포본 커밋과 함께 담고
`verify-product-evidence`가 대조한다. 제품 파일이 바뀌면 실패하고, 제품 저장소가 없는 hosted
CI에서는 **건너뛰되 건너뛰었다고 출력한다.**

`pnpm verify`가 이제 11단계다.

## 2026-08-18 (24) — 실측의 기준을 배포본에 못 박는다

owner 요구: **"배포환경이랑 아주 똑같아야해."** 그 말이 성립하려면 먼저 *배포환경이 무엇인지*
확정돼야 한다. 확인해 보니 제품 저장소가 로컬에 **둘** 있었다.

| 경로 | 원격 | 브랜치 | 시점 |
| --- | --- | --- | --- |
| `/Users/sejunki/klipse` | `sniperfactory-official/klipse` | `louis` | 2026-08-04, dirty 29건 |
| `/Users/sejunki/klipse-web` | `KlipseAI/klipse-web` | `design` | 2026-08-18, clean |

root commit이 같아 **같은 코드베이스인데 원격이 다르다.** 그리고 배포 브랜치는 둘 다 아니다 —
`KlipseAI/klipse-web`의 **`origin/main` 7e9c3b69**("Merge pull request #50 from KlipseAI/dev")다.
`origin/HEAD`는 `dev`를 가리키고 `design`은 `main`과 15/6으로 갈라져 있으며, 그 차이에
**`globals.css`(16+/69−)가 들어 있다** — 토큰이 사는 파일이다.

### 결과: 기존 실측은 유효했다

`migration/product.measured.json`이 인용한 제품 파일 **34개**를 현 기준선(`design` 086f4a62)과
배포본(`main` 7e9c3b69)에서 blob 해시로 비교했다. **34개 전부 같았다.** 즉 187축은 배포 환경에
대해 그대로 유효하다.

### 그런데 손으로 확인하고 끝내면 다음 주에 또 모른다

그래서 고정했다. `migration/product-evidence.lock.json`이 인용 파일 34개의 blob 해시를 배포본
커밋과 함께 담고, `scripts/verify-product-evidence.mjs`가 `pnpm verify`에서 대조한다.

- 제품 파일이 배포본에서 바뀌면 **실패한다** — "해당 축을 다시 재고 lock을 갱신하라"고 말한다
- 제품 저장소가 없는 hosted CI에서는 **건너뛰되 건너뛰었다고 출력한다.** 조용한 통과는 통과가 아니다
- 변조 canary 2종(내용이 바뀐 것 · 파일이 사라진 것). 판정 기준은 *"변조가 baseline에 없던 실패를
  새로 만드는가"*다 — 이미 실패가 있을 때 canary가 가려지지 않게 한다

**이것이 이 저장소에서 처음으로 "제품이 움직였다"를 잡는 게이트다.** 그전까지 모든 게이트는 DS
내부 일관성(코드↔Figma, 토큰↔생성물)만 봤고, 제품이 바뀌면 **전부 초록인 채로 실측이 낡았다.**

### "카탈로그가 닫혔다"를 정정한다

인계서의 그 문장은 gap registry의 **합산 우선순위 15종**이 소진됐다는 뜻인데, 읽으면 "세 화면을
그릴 수 있다"로 들린다. 실제로 그 오해가 일어났다. 같은 문서군의 gap registry는 정반대를 적어
두고 있다 — *"현재 셋 다 미달이고, 가장 먼 것은 에디터다."*

정확한 층위는 셋이다: **규범·구현·Figma 전부 없는 것**(타임라인 · 파형 · 인스펙터 · 캔버스 노드 ·
미니맵 · 툴바 · 드롭존 · 캐러셀 등), **규범만 있는 것**(`editor-workspace` · `app-shell`),
**Figma만 없는 것**(Skeleton 하나).

## 2026-08-18 (23) — Components 페이지를 정리하고 목적문을 생성물로 만든다

Cover와 Foundations를 세운 뒤 Components 페이지를 열어 보니 두 가지가 더 있었다.

### 새 컴포넌트 6개가 섹션 밖에 흩어져 있었다

TextField · SegmentedControl · Checkbox · Slider · SelectableListRow · Avatar. 만들 때 계약(변수
바인딩 · 기하 · variant)은 맞췄지만 **어디에 두는지는 아무도 검사하지 않아** 페이지 바닥에 그대로
남아 있었다. Forms 섹션을 만들어 입력 계열을 모으고 나머지 둘은 Content로 넣었다.

섹션 순서는 **읽는 순서**를 따른다 — Actions(누르는 것) → Forms(값을 넣는 것) → Content(내용) →
Overlays(위에 뜨는 것) → Feedback(알리는 것) → Shell(껍데기) → Icons(글리프).

### 세트를 클릭해야만 설명이 보였다

이제 세트마다 **이름과 목적문 한 줄이 캔버스에 보인다.** 그런데 그 문장을 손으로 옮기면 규범
문서가 바뀌어도 Figma가 따라오지 않는다. 그래서 옮기지 않고 **뽑는다**:

`scripts/build-figma-summaries.mjs`가 각 규범 문서의 H1 다음 첫 문단 첫 문장을 모아
`figma/component-summaries.json`을 생성하고 `pnpm check`가 어긋남을 실패로 만든다. 이름 해석은
`build-figma-snapshot.mjs`와 같은 규칙(`figmaNames ?? figmaName`)이라 Menu처럼 Figma에서 둘로
나뉘는 문서도 함께 실린다. 탐지력은 손으로 확인했다 — badge의 첫 문장을 한 글자 바꾸니 `--check`가
**exit 1**로 떨어졌고 되돌리니 통과했다.

옛 description은 `klipse component id: input`으로 시작해서, 그대로 실었더니 라벨에 **기계 ID가
찍혔다.** 그것이 이 생성물을 만든 직접적인 계기다.

### 실측으로 드러난 것 셋

| 증상 | 원인 |
| --- | --- |
| Forms 섹션의 글자가 안 보였다 | Figma 기본 채움이 짙은 회색(0.267)인데 나머지 6개는 흰색이었다 |
| 흰 면이 내용 밖에서 끊겼다 | **섹션은 자식을 붙여도 스스로 커지지 않는다** |
| 이 페이지만 배경이 순검정 | 다른 세 페이지는 밝은 회색이었다 |

셋 다 **형제에서 값을 읽어** 맞췄다. 짐작한 값을 넣지 않았다.

## 2026-08-18 (22) — Figma 파일에 Cover와 Foundations를 세운다

owner 지적: **"지금 피그마에 있는것도 그지같던데."** 재보니 사실이었다.

### Foundations 페이지가 통째로 비어 있었다

최상위 노드 **0개**. 변수 210개와 style 22개가 파일에 있는데 **보이는 것이 하나도 없었다** —
색 스와치도, 타입 견본도, 간격 눈금도 없었다. Cover 페이지도 없어 파일을 열면 뭐가 뭔지 알 수
없었다.

### 왜 이렇게 됐나 — 게이트가 검사하는 것만 잘돼 있었다

parity 게이트는 raw 값 0 · 변수 바인딩 · 기하 일치를 본다. 그건 변조 canary 34종으로 지켜진다.
그런데 **"사람이 열었을 때 쓸 수 있는가"는 아무도 검사하지 않는다.** 그래서 그 부분만 통째로
비어 있었다.

오늘 반복된 교훈과 같다 — **게이트는 시킨 것만 본다.** 계약을 맞추는 데 집중하느라 파일을
열어본 사람의 눈으로 보지 않았다.

### 세운 것

| 페이지 | 내용 |
| --- | --- |
| **Cover**(신설, 맨 앞) | 파일이 무엇이고 어디를 보는지. 정본이 저장소라는 것과 publish 전이라는 사실 |
| **Foundations** | Color · Typography · Spacing & Radius · Elevation 네 절 |

**색은 Light·Dark를 한 화면에 나란히 놓았다.** `setExplicitVariableModeForCollection`으로 두 열이
각자 모드를 고정하므로 같은 변수가 두 테마에서 어떻게 보이는지 **동시에** 보인다. 다크 열에서
`background-inset`·`menu`·`overlay`·`surface`가 같아 보이는 것이 **눈으로 바로 확인된다** —
그동안 말로만 설명하던 충돌이다.

간격·반경은 **막대 길이와 모서리가 변수 값 그대로**다. 숫자를 적지 않은 이유는 적은 숫자와 그린
것이 갈라질 수 있기 때문이다. 타이포는 실제 text style을 적용했고 그림자는 effect style을 얹었다 —
**전부 바인딩이라 값이 바뀌면 문서가 따라온다.**

### 남은 것

Components 페이지의 정리(세트별 설명과 사용 예시)와 Templates. 그리고 publish는 여전히 owner의
손에 있다.

## 2026-08-18 (21) — Loading 패턴 · 새 CSS가 하나도 없다

`DS-P3-010`의 두 번째 패턴. Skeleton이 서면서 선행이 풀렸다. pattern의 Web 상태가 `partial`이다.

### 컴포넌트가 아니라 경계다

**새 CSS를 하나도 만들지 않았다.** 부품은 Spinner와 Skeleton이 이미 소유하고, 이 패턴이 정하는
것은 둘이다 — **무엇을 언제 쓰는가**와 **누가 로딩을 알리는가**.

| 자리 | 쓰는 것 |
| --- | --- |
| 올 내용의 **모양을 아는** 곳 | Skeleton — 도착했을 때 화면이 튀지 않는다 |
| 모양을 **모르는** 곳 | Spinner — 틀린 자리표시는 없는 것보다 나쁘다 |
| 진행률을 **아는** 곳 | 아직 없다 |

### 영역이 알리고 자리표시는 장식이다

```tsx
<section aria-busy={loading} aria-label="프로젝트 목록">
  {loading ? <Skeleton … /> : <ProjectList … />}
</section>
```

**스켈레톤이 여덟 개 놓인 자리에서 각각이 읽히면 같은 말이 여덟 번 들린다.** 한 영역이 한 번
말한다. Spinner와 Skeleton은 스스로 읽히지 않으며 그 판정은 각 컴포넌트가 이미 갖고 있다 —
이 패턴은 그 둘이 **합쳐졌을 때**의 계약을 고정한다.

실브라우저 5건이 그 합성을 잰다 — 자리표시가 전부 `aria-hidden`인지, 끝나면 `aria-busy`가
내려가고 자리표시가 사라지는지, reduced-motion에서 둘 다 반복이 1회인지.

### delay 토큰을 다시 세어 보니 8종이 아니라 11종이었다

인계서 (1a)가 `motion-*-delay` "8종"이라고 적어 두었는데 실제로는 **11종**이다. 전부 0ms이고
CSS 소비처가 0인 것은 맞다 — 결론은 같지만 수가 틀렸다. **gap registry에서 아홉 번 그랬듯
인계서의 수치도 다시 센다.**

### 남은 것

`App Shell`이 `DS-P3-010`의 마지막이다. determinate progress는 접근성 계약이 선행이라 이 패턴은
두 갈래만 소유한다.

## 2026-08-18 (20) — Skeleton · (1c)는 답이 아니라 틀린 질문이었다

`import { Skeleton } from "@klipse-design/react"`. **owner 판정 대기로 두었던 (1c)가 판정 없이
풀렸다** — 제품을 직접 재보니 물어야 할 질문이 달랐다.

### 제품은 면 색을 고르지 않는다

```
면:        rgb(var(--gray-000-rgb) / 8%)
하이라이트: linear-gradient(90deg, /0%, /9%, /0%)
```

`--gray-000`은 **전경색**이고 테마마다 뒤집힌다(라이트 `palette-gray-1000` · 다크
`palette-gray-000`). 즉 제품은 **테마별 면을 고른 적이 없다.** 전경색을 낮은 알파로 깔면
어느 배경 위에서도 성립하기 때문이다.

인계서 (1c)는 이렇게 적혀 있었다 — "면 색이 문제다. `background-inset`은 다크에서
surface·menu·overlay와 넷이 동일하고 `background-raised`는 라이트에서 셋이 동일하다."

**그 문장은 "스켈레톤에 solid 면 토큰이 필요하다"를 전제한다.** 실측이 그 전제를 부정한다.
고를 면이 없으므로 죽을 조합도 없다. owner가 정할 것이 아니라 값 하나였다.

DS에는 이미 같은 판단이 둘 있었다 — Spinner의 트랙(`currentcolor 22%`)과 ProjectCard의 스크림.
후자의 주석은 **"색 토큰이 아니라 `color-mix`로 불투명도를 직접 적는다"**고 이미 적어 두었다.

### 왜 대기했었나

**인계서에 적힌 판정 문장을 직접 재보지 않고 그대로 옮겼다.** 이번 세션에서 gap registry의 수치는
아홉 번 다시 셌으면서 인계서의 판정은 같은 의심을 하지 않았다. 같은 실수이고, 규범 문서라고
해서 실측을 면제받지 않는다.

### 흐름은 `background-position`이다

loop lifecycle의 허용 property는 `opacity`·`rotate`·`background-position` 셋이고(DS-D-0016),
제품의 우세 기법도 면 그라디언트 이동이라 둘이 같은 곳을 가리킨다 — **층을 하나 덜 만든다.**
reduced-motion에서 흐름은 짧아지는 것이 아니라 사라지고, 테스트가 두 motion context를 갈라서 잰다.

### 공개 API 표면 baseline 갱신 (additive)

심볼 `Skeleton`, 타입 `SkeletonProps`·`SkeletonShape`가 늘었다. **두 커밋 전에 세운 게이트가
이 변경을 잡아 baseline과 이 항목을 함께 요구했다** — 설계대로 동작했다.

## 2026-08-18 (19) — Project Grid · `layout-project-card-minimum`이 소비처를 얻었다

`DS-P3-010`의 세 패턴 중 하나가 섰다. 공용 recipe `.kds-project-grid` 하나이고 pattern의 Web
상태가 `not-ready` → `partial`이다.

### viewport가 아니라 container다

```css
grid-template-columns: repeat(auto-fill, minmax(min(카드최소, 100%), 1fr));
```

`auto-fill`은 **grid 자신의 content box**로 열 수를 계산한다. 사이드바가 접혀 유효 폭이 늘면 같은
viewport에서 열이 늘고, 좁은 패널 안에 놓이면 준다 — **media query로는 그 둘을 구분할 수 없다.**

테스트가 그것을 그대로 잰다: **viewport를 바꾸지 않고 container 폭만** 바꿔 1·2·3·4·5열을
확인한다. media query 구현이었다면 전부 같은 열 수가 나와 실패한다. 규범의 compatibility
profile(2 / 3@720 / 4@1200 / 5@1800)은 `floor((W + gap) / (최소 + gap))`으로 환산해 대조하며,
숫자를 손으로 적지 않고 토큰에서 유도한다.

### 1열 fallback이 공짜로 따라온다

`min(최소, 100%)`가 없으면 container가 카드 최소 폭보다 좁을 때 track이 container를 넘어
**가로 스크롤이 생긴다.** 규범이 못 박은 자리이고 테스트가 `scrollWidth ≤ clientWidth`로 잡는다.

### T-5가 해소됐다

gap registry가 `layout-project-card-minimum`을 **"소비처 0 · 존재하지 않는 알고리즘을 기술하는
토큰"**으로 분류하고 owner 판정 대기로 두었다. 그 추측이 맞았다 — **이 토큰은 카드가 아니라
그리드의 것이었고**, Project Grid가 서면서 첫 CSS 소비처가 생겼다.

인계서 (1a)의 `color-border-strong`과 같은 종류다. **"소비처가 0"은 폐기 사유가 아니라 아직
그것을 쓸 것이 서지 않았다는 뜻일 수 있다.** 이름이 뜻과 맞는지를 먼저 본다.

### 패턴 recipe의 자리가 생겼다

`packages/css/src/pattern/`을 신설하고 빌드가 `component/` 다음에 그것을 모은다. 이 저장소에서
pattern은 component와 **다른 권위 계층**(`design/patterns/*`가 별도 정본)이라 recipe도 그 구분을
따른다.

### 남은 둘

`Loading`은 Skeleton에 막혀 있다((1c) 면 색 판정). `App Shell`은 rail·drawer·scroll root·safe
area가 남아 있고 compact 드로어의 layer 자리도 사다리에 없다.

## 2026-08-18 (18) — release dry-run과 공개 API 표면이 게이트가 됐다

`verify-consumer`가 넷에서 **여섯**으로 늘었다. `DS-P3-008`의 남은 완료 근거 둘이다.

### release dry-run — publish하지 않고 담길 것만 본다

`npm pack --dry-run`으로 세 패키지의 배포 파일 목록을 읽어 계약과 대조한다. **`files` 필드가
틀리면 dist가 빠진 채 올라가거나 source·test가 함께 올라가는데, 둘 다 publish 뒤에야 드러난다.**

담겨야 하는 것(`dist/index.js`·`.d.ts`·생성 CSS·고지문)과 담기면 안 되는 것(`src/`·`test/`·
`tsconfig`·`baseline/`)을 양쪽으로 본다.

### 공개 API 표면 baseline

`packages/react/api-surface.json`에 **심볼 56 · 타입 89**를 고정하고 `dist/index.d.ts`와 매 실행
대조한다. 심볼이 사라지면 **breaking**, 새로 생기면 **additive**로 각각 다른 문구로 실패한다.

**검출력을 실측으로 증명했다** — baseline에서 `Avatar`를 빼면 additive로 잡히고, 없는 심볼을
넣으면 breaking으로 잡힌다. 토큰 baseline과 같은 규율이라, **이 파일을 갱신하는 변경 단위에는
Updates의 migration note가 함께 있어야 한다.**

### DS-P3-008에 남은 것

changesets 도입 · `private: true` 해제 · 버전 정책. **셋 다 `DS-D-0006`이 `proposed`인 동안에는
하지 않는다** — 플레이북이 "의존성 도입은 Decision으로 승인된 뒤"로 정해 두었고, `private`를
푸는 것은 실수로 publish될 수 있는 문을 여는 일이라 릴리스 흐름보다 먼저 오면 안 된다.

## 2026-08-18 (17) — DS-P3-008 소비자 게이트 · 테스트는 self-reference였다

`pnpm verify`에 `verify-consumer`가 붙었다. **패키지가 저장소 밖에서 실제로 소비되는가**를 처음
확인한다.

### 지금까지의 게이트는 전부 저장소 안을 봤다

생성물 drift · 토큰 graph · CSS 저작 규칙 · Figma parity · 실브라우저 650건. 그 전부가 초록이어도
"소비자가 `import { Button } from "@klipse-design/react"`를 쓸 수 있는가"는 한 번도 확인된 적이
없었다.

**테스트가 그 질문에 답하지 못한 이유가 있다.** 테스트 파일이 `packages/react/test/` 안에 있어서
`@klipse-design/react`가 **package self-reference**로 해석된다. export map을 보긴 하지만
"바깥에서 설치해 쓴다"와는 다르다 — 실제로 워크스페이스 패키지는 **루트에 링크조차 돼 있지
않았고**, 루트에서 resolve하면 셋 다 실패했다.

루트를 실제 소비자로 만들었다(`workspace:*` 세 줄).

### 확인하는 것 넷

1. **선언된 서브패스 16개**(react 3 · css 7 · tokens 6)가 전부 resolve된다
2. **Node에서 SSR 렌더된다** — import·렌더 시점에 브라우저 API를 만지면 여기서 죽는다
3. 타입 선언이 `.d.ts`로 함께 나온다
4. **tree-shaking이 실제로 동작한다** — Button만 쓴 번들 1KB, Dialog까지 쓴 번들 2KB

4번에는 **canary가 붙는다.** "Dialog 문자열이 없다"만 보면 탐지가 죽어도 통과하므로, Dialog를
실제로 쓰는 번들에는 그 문자열이 **있어야** 한다는 반대 방향을 함께 증명한다.

### 스크립트가 두 번 틀렸고 둘 다 기록해 둔다

- **임시 디렉터리를 저장소 밖에 만들었다.** Node가 위로 올라가며 `node_modules`를 찾지 못해
  아무것도 resolve되지 않았다 — 소비자 관점을 재현하려던 것이 오히려 아무것도 재현하지 못했다
- **`require.resolve`로 쟀다.** 이 패키지들은 DS-D-0002에 따라 **ESM 전용**이라 `require` 조건이
  없고, CJS로 재면 "No exports main defined"가 나온다. **패키지 결함이 아니라 재는 쪽이 틀린
  것이다.** `import.meta.resolve`로 바꿨다

## 2026-08-18 (16) — Avatar가 Figma에 섰다

`DS-F-006-avatar`. component set 18 → **19개**.

**폴백을 path가 아니라 원 둘로 그렸다.** Figma의 `vectorPaths`가 SVG arc(`a`) 명령을 받지 않아
코드의 글리프 path를 그대로 넣을 수 없었다. 변환해서 넣는 대신 머리·어깨 두 원으로 같은 그림을
만들었다 — 좌표가 크기의 비율로 남아 **두 크기가 같은 그림**이 되고, 변환 과정에서 모양이 조용히
달라질 여지가 없다.

**계약이 stroke·effect 0을 요구한다.** 코드 쪽 테스트가 테두리·그림자·`::after` 층이 0인지
확인하는 것과 짝이다. 링을 소유하지 않는다는 판정을 **양쪽에서 기계가 지킨다.**

## 2026-08-18 (15) — Avatar · Home의 구멍이 하나 남았다

`import { Avatar } from "@klipse-design/react"`. 카탈로그 component 17 → **18개**.

### 제품에 공용 구현이 "부분만" 있었다

`UserCircleDefaultAvatar.tsx`가 **기본 아바타 SVG 하나**(28×28 · `currentColor` · `aria-hidden`)만
소유하고, 아바타 본체 — 이미지/폴백 분기와 크기 — 는 셸 파일 `Gnb.tsx`에 인라인이다. 크기는
`--profile-avatar-size`가 28 기본이고 ProjectHeader 슬롯에서 24로 덮인다. **그 두 값을 그대로
옮겼다.**

### 링을 소유하지 않는다

제품은 프로필 트리거에 진행률 링을 겹치지만(`--profile-ring-width/gap: 2px`, `-progress`)
**아바타는 신원 표식이고 링은 사용량이다.**

흡수하지 않은 이유 셋 — 목록·댓글·멘션의 모든 아바타가 쓰지 않을 progress API를 갖게 되고,
링을 아바타 밖에서 쓸 수 없게 되며, 무엇보다 **(1c)의 미결 판정(determinate 진행률의 접근성
계약, 제품 전체에 `role="progressbar"`가 1곳뿐)이 이 컴포넌트의 API로 새어 들어온다.**

**테스트가 테두리·그림자·`::after` 층이 전부 0인지 확인한다** — 나중에 누가 링을 여기에 넣으면
게이트가 잡는다.

### 크기가 control 계단을 따르지 않는다

24·28은 Button·Text Field의 40/32와 맞지 않는다. **아바타는 컨트롤이 아니라 표식**이라 나란히
서도 줄이 어긋나지 않는다 — 계단을 따를 이유가 없었다. Slider·SegmentedControl에서 계단을 따른
것과 반대 판정이고, 기준은 "컨트롤인가"다.

### 이름을 root가 소유한다

`name`이 있으면 root가 `role="img"` + `aria-label`을 갖고 **안의 `<img>`는 `alt=""`다** — 둘 다
이름을 가지면 같은 이름이 두 번 읽힌다. `name`이 없으면 root가 `aria-hidden`이다. 목록 행이나
댓글 머리처럼 **옆에 이름이 이미 적혀 있는 자리에서는 생략이 옳다.**

### 남은 것

Home의 구멍은 이제 **`BannerCarousel` 하나**다. caret 3종이 이미 섰으므로 선행 조건이 없다.
Figma component set(`DS-F-006-avatar`)도 남았다.

## 2026-08-18 (14) — hosted CI가 처음 초록이 됐다

[run 32094705359](https://github.com/KlipseAI/louis/actions/runs/32094705359) — clean checkout에서
install → 브라우저 설치 → build → check → verify → `--require-tracked` → **실브라우저 632건**이
전부 통과했다. `DS-GOV-000`의 네 조건 중 **원격 연결과 hosted CI 둘이 done**이 됐다.

### 초록에 이르기까지 네 번 실패했고 넷 다 로컬에서 안 보이던 것이다

1. **브라우저 바이너리 설치 단계가 없었다** — 로컬 캐시 때문에 로컬에서만 통과
2. **632건이 CI에서 한 번도 돈 적이 없었다** — `verify`는 러너의 실패 전파만 증명한다
3. **앞 테스트의 포인터가 남아 행이 `:hover`였다** — 받은 값 `#171b22 / 0.08`이
   `color-action-ghost-hover`였다. `surface-states`가 이미 적어 둔 함정을 이 파일이 안 따랐다
4. **틀린 진단 하나** — 3번을 "범위 한정 누락"이라 단정했다가 CI가 반증했다

### 방법 하나가 섰다

원인을 모를 때 **단언을 고치지 않고 진단을 실어 CI 한 사이클을 돌린다.** 3번이 그렇게 한 번에
풀렸다 — `theme: null`·`prefersDark: false`·`fixtureCount: 1`이 두 가설을 지웠고 alpha 0.08이
답을 가리켰다. 기대값은 끝까지 바꾸지 않았다.

**로컬 초록은 이 종류를 증명하지 못한다.**

## 2026-08-18 (13) — 원격이 생겼고 첫 hosted CI가 실패했다

owner가 `KlipseAI/louis`(private)를 만들고 `bf62eba`까지 push했다. **첫 hosted CI 실행이
실패했다** — 그리고 그 실패가 옳았다.

### 브라우저 바이너리 설치 단계가 없었다

```
browserType.launch: Executable doesn't exist at .../chrome-headless-shell
```

브라우저는 lockfile에 없는데 [DS-D-0005](../governance/decisions/DS-D-0005-test-stack.md)가
실브라우저 러너를 1단계에 뒀으므로 `pnpm verify`의 test-harness가 실제로 Chromium을 띄운다.
로컬에는 2026-08-14에 승인받아 받아 둔 캐시가 있어 **로컬에서만 통과하고 clean checkout에서만
실패하는** 상태였다.

`pnpm exec playwright install --with-deps chromium` 단계를 넣었다.

### 실브라우저 회귀 전량을 CI에 붙였다

`verify`의 test-harness는 **러너가 실패를 전파하는지만 증명하고 suite 자체를 돌리지 않는다.**
그래서 컴포넌트 acceptance test 632건이 hosted CI에서 한 번도 돈 적이 없었다. `pnpm test`
단계를 추가했다 — 로컬에서 두 번 관측된 간헐 실패도 이 단계가 반복 실행으로 드러낼 자리다.

### DS-GOV-000이 `partial`이 됐다

넷 중 **원격 연결이 done**이고, hosted CI는 **초록으로 통과한 실행이 아직 없어 미충족**이다.
owner 승인과 registry/docs/Figma publish 권한은 그대로다. 상태를 미리 올리지 않는다.

### klipse-web 채택의 길이 하나 열렸다

[채택 계획](../../migration/klipse-web-adoption.md)이 "git dependency는 **불가 — DS 저장소에
원격이 0개다**"라고 적어 두었는데 그 전제가 바뀌었다. 다만 private 저장소를 의존성으로 쓰려면
klipse-web 빌드 환경에 읽기 권한(deploy key 또는 토큰)이 필요하고 그것은 owner가 정할 일이다.
registry publish는 여전히 `DS-GOV-000`이다.

### 이것이 hosted CI의 값이다

로컬 게이트는 스무 번 초록이었고 clean checkout이 **한 번에** 잡았다.

## 2026-08-18 (12) — caret 3종 · 배너 캐러셀의 선행 조건이 풀렸다

글리프 26 → **29개**, Figma 아이콘 component도 29개.
`import { IconCaretLeft, IconCaretRight, IconCaretDown } from "@klipse-design/react/icons"`.

### 저장소에서 직접 그렸다

출처를 `upstream`으로 적으려면 상류 좌표를 대조해야 하는데 그럴 수 없었다. **대조하지 않고
upstream이라 적으면 그것이 추정 출처이고, DS-D-0008 결정 3이 추정 출처를 빌드 실패로 둔다.**
그래서 `origin: "original"`로 두고 직접 그렸다 — 24 격자 위 45° 갈매기꼴 한 겹, stroke 1.5,
round cap/join으로 세트의 다른 글리프와 같은 선 언어를 쓴다. 꼭짓점을 중심(12)에서 좌우 3 ·
상하 7.5로 두어 세 방향이 회전 대칭이다.

`origin`은 `original`과 `upstream` 둘뿐이고 둘 다 정직한 선택지다. 모르는 것을 아는 척하는
칸이 없다는 것이 이 provenance 계약의 값이다.

### 왜 지금인가

[gap registry](../../migration/figma-gap-registry.md)의 재계수가 Home의 남은 구멍을 **Avatar와
BannerCarousel 둘**로 좁혔는데, 배너 캐러셀은 화살표 없이 세울 수 없다. 이 셋이 그 선행 조건이다.

## 2026-08-18 (11) — DS-F-007 카탈로그 재계수 · Home의 구멍이 둘 남았다

`DS-F-006`이 닫혀 Figma component가 1개 → **18개**가 됐으므로 Home이 요구하는 자산을 다시 셌다.

**8종 중 6종이 섰다.** Button · ProjectCard · SidebarNavItem·AppTopBar · Menu · EmptyState · Badge.
남은 둘은 **Avatar**와 **BannerCarousel·HomeBannerSlide**다 — 아바타는 셸 파일에 인라인이고
기본 아바타 SVG만 분리돼 있으며, 배너 캐러셀은 **허브 3곳이 공유**한다. 연체 배너도 카탈로그에
없는 banner/alert 계열이다.

**배너 캐러셀에는 아이콘이 먼저 필요하다** — `caret-left`·`caret-right`·`caret-down` 셋이 여전히
미보유이고 아이콘은 26개 그대로다.

### 화면 gap의 수는 갱신하지 않았다

72·130·144는 화면을 축 단위로 실측한 값이고, 그 수를 바꾸려면 **Figma에서 Home을 실제로 다시
조립해야 한다.** 아직 하지 않았으므로 카탈로그 gap(8종 → 2종)만 갱신했다. 둘을 섞어 쓰지 않는다.

## 2026-08-18 (10) — `select`를 `not-planned`로 정한다 · 카탈로그 상태가 전부 확정됐다

manifest의 마지막 `not-ready` 항목을 닫았다. **고르기는 Menu가 소유한다.**

### 실측이 판정을 내렸다

네이티브 `<select>`가 **12벌**인데 **전부 `/admin` 아래**다 — `AdminClient` 1 ·
`CaptionTemplateManagement` 9 · `ProductMetricsDashboard` 2. 배포 화면(Home·Highlight·Editor)에는
**0벌**이고, 제품은 트리거 + 메뉴 패널로 고른다(11파일). DS에는 이미 `ActionMenu`와
`CompositePopover`가 있어 그 자리를 덮는다.

gap registry 우선순위 1~15 어디에도 `select`가 들지 않은 이유가 이것이었다. **관리자 도구는 이
저장소의 소비 surface가 아니다.**

수요가 생기면 Decision으로 이 판정을 뒤집고 다시 연다 — `not-planned`는 "안 만든다"가 아니라
"계획에 없다는 것이 결정됐다"는 뜻이다.

### `color-border-strong`이 폐기 후보에서 빠졌다

인계서 (1a)가 "소비처 0이고 이름이 가리키는 것이 그 이름을 안 쓴다"고 분류한 넷 중 하나였는데,
Checkbox가 첫 소비처가 되면서 이름이 뜻과 맞게 됐다 — 경계가 반드시 보여야 하는 자리다.
넷 → **셋**.

### 카탈로그 상태가 전부 확정됐다

manifest component 17개 중 16개가 `partial`이고 하나가 `not-planned`다. **`not-ready`가 0개다** —
"아직 모르겠다"로 남은 항목이 없다.

## 2026-08-18 (9) — Slider가 Figma에 섰다 · DS-F-006이 닫혔다

`DS-F-006-slider` 완료. component set 17개 → **18개**이고 **네 컴포넌트가 전부 Figma에 섰다.**

### 복합 키를 쓰는 유일한 컴포넌트다

`{size}/{variant}` 네 그룹(`md/thumb`·`md/track`·`sm/thumb`·`sm/track`)이다. Variant 축이 레일
두께 4↔28과 썸 16↔2×14를 바꾸므로 size 하나로 묶으면 두 값이 한 배열에 섞여 **어느 쪽이 어느
변형의 것인지 사라진다.**

되읽기가 그 키로 묶어 주고 measured가 같은 키를 쓰자 **비교 코드를 한 줄도 바꾸지 않고**
대조가 성립했다. 키를 아무도 해석하지 않기 때문이다.

### 변조 canary가 그 검출력을 증명한다

`tamperCompositeKeyGeometry`는 `md/track`의 레일 높이를 `md/thumb`의 값으로 바꿔 넣는다. 복합
키가 없었다면 그 변조는 "배열에 4가 하나 더 있다" 정도로 묻힌다. canary 33종 → **34종**.

### 부품이 갈리면 이름으로, 값이 갈리면 복합 키로

Checkbox는 표시가 `Check`(5×9)와 `Dash`(10×2)로 **다른 부품**이라 이름을 나눴고, Slider는
레일과 썸이 **같은 부품의 다른 값**이라 복합 키를 썼다. 둘을 가르는 기준이 이번에 섰다.

### DS-F-006이 닫혔다

Figma component set 18개, 변수 210개, style 22개. 카탈로그 15항목 중 Web·Figma 모두 `partial`이
14개이고 `select`만 `not-ready`다. 남은 Figma 작업은 `DS-F-007` 화면 재조립 gap 재계수와
`DS-F-008` 수동 publish다 — 후자는 owner가 Figma UI에서 직접 하며 자동화하지 않는다.

## 2026-08-18 (8) — Checkbox가 Figma에 섰다

`DS-F-006-checkbox` 완료. component set 16개 → **17개**.

**체크 표시를 CSS와 같은 구조로 그렸다** — 5×9 사각형의 오른쪽·아래 변만 남기고 45° 회전이다.
Figma의 회전은 `width`/`height`를 바꾸지 않으므로 계약값 5×9가 그대로 남는다. 벡터 패스로 그리면
모양은 같아도 계약이 코드와 다른 수를 갖게 된다.

**표시를 `Check`와 `Dash` 두 이름으로 나눴다.** 하나로 두면 5×9와 10×2가 한 배열에 섞여
"variant마다 다릅니다"로 걸린다. 둘은 서로 다른 부품이고 각각 한 variant에만 있다 — 이것이
variant마다 기하가 다른 부품을 기존 모델 안에서 다루는 방법이다.

## 2026-08-18 (7) — SelectableListRow가 Figma에 섰다

`DS-F-006-selectable-list-row` 완료. Figma component set 15개 → **16개**.

**선택 표식이 계약이 됐다.** parity 게이트가 `Marker`의 폭 3px을 대조하므로, 누군가 "면이 있으니
표식은 없어도 된다"고 지우면 게이트가 잡는다 — 다크에서 `background-inset`이 `surface`와 같은
색이라 표면 위 목록에서 선택이 통째로 사라지는 자리다.

`State`(Default·Selected·Disabled)는 **코드에 없는 축**이다. 코드에서 `selected`는 boolean prop이고
`disabled`는 `<button>`의 네이티브 속성인데 Figma에는 boolean 상태의 시각 표현이 없다. Button이
Hover/Active를 variant로 두는 것과 같은 처리이며 `figmaOnlyProperties`가 사유와 함께 선언한다.

**빌드에서 잡은 결함 하나.** `figma.createAutoLayout`이 만든 프레임에 **기본 흰 면이 남아** 선택된
행(회색) 위에서 글자 묶음이 흰 상자로 드러났다. 스크린샷으로 보고 지웠다 — 되읽기의 `rawFills`는
0이었으므로 게이트로는 잡히지 않는 종류다(변수에 묶이지 않은 것이 아니라 **있으면 안 되는 면**이
있었다).

## 2026-08-18 (6) — SegmentedControl이 Figma에 섰다

`DS-F-006-segmented-control` 완료. Figma component set 14개 → **15개**이고 `segmented-control`의
Figma 상태가 `not-ready` → `partial`이다.

### 선택/비선택을 variant 축으로 나누지 않았다

한 variant 안의 두 자손(`Segment` · `Segment-Selected`)으로 두었다. **색만 다르고 기하가 같아서**
축을 나누면 같은 것을 두 번 세게 된다. parity 게이트가 둘의 기하를 각각 대조하므로 한쪽만
어긋나도 걸린다.

이 판정 덕분에 SegmentedControl은 게이트 확장(복합 키)을 기다리지 않아도 됐다 — 앞선 조사에서
"막힘"으로 적었던 것을 정정한 결과다.

### 헤어라인은 OUTSIDE stroke다

CSS는 spread-only box-shadow로 그린다. Figma에서 **레이아웃을 건드리지 않는 등가물이 OUTSIDE
stroke**다. INSIDE로 바꾸면 안쪽 콘텐츠 박스가 줄어 세그먼트 높이가 32에서 31이 되고, 그 순간
게이트가 실패한다 — 계약에 `align: "OUTSIDE"`로 못 박았다.

### 게이트가 잡은 것 둘

빌드가 아니라 **등록 과정에서** 걸렸다.

- **stroke 되읽기 형식.** `{ self: { weight, align } }`로 덤프했는데 정본 형식은
  `{ self: ["0.5|OUTSIDE"] }` 문자열 배열이다. 형식이 어긋나자 "stroke 역할 self이 Figma에
  없습니다"로 걸렸다
- **`borderWidth` 키 이름이 규약이다.** 보이는 테두리 두께를 `trackBorderWidth`로 적었더니
  게이트의 허용 stroke 집합이 **비어서** 0.5가 통째로 거부됐다 — `verify-figma-parity`가
  `spec.borderWidth`로 그 값을 읽는다. measured와 테스트를 함께 옮겼다

### 남은 것

Figma component set 셋 — Slider(복합 키 canary와 같은 단위) · Checkbox · SelectableListRow.

## 2026-08-18 (5) — Selectable List Row · 카탈로그 15/15

카탈로그 15순위이자 **마지막 항목**이다.
`import { SelectableListRow } from "@klipse-design/react"`가 동작한다.

### 등록부의 수치가 처음으로 맞았다

"하이라이트 2 · 에디터 1" — 실측도 3벌이다. 앞의 여덟 번은 매번 틀렸고(ProjectCard 3→4,
EmptyState 7→9, TextField 16→약 40, Badge 두 축이 죽어 있었고, Spinner 5→22, 셸 31→두 컴포넌트
합산, Slider 9→37, SegmentedControl 3파일→8파일) 이번이 처음이다.

셋이 합의하는 것은 골격이다 — 가로 flex 행, 선행 슬롯, 글자 묶음, hover 면, **전환 140ms ease.**
갈라지는 것은 선택을 무엇이 소유하느냐다. 하이라이트 2벌은 **행의 면**이, 에디터 1벌은 행 안의
**체크박스**가 갖는다. 후자는 이 컴포넌트가 아니다 — 행을 버튼으로 만들면서 체크박스를 넣으면
컨트롤이 중첩된다. 경계를 규범에 적었다.

### 선택 면 하나에 기대면 다크에서 사라진다

DS에는 이미 선택 가능한 행이 있다 — `SidebarNavItem`이 `aria-current` + `background-inset`으로
선택을 표현한다. **그것이 성립하는 이유는 사이드바가 캔버스 위에 있기 때문이다.**

표면 위에 놓고 실측했다.

| 테마 | 표면 | 선택 면 | 구분되는가 |
| --- | --- | --- | --- |
| light | `#fafafa` | `#eaebee` | 예 |
| dark | `#313644` | `#313644` | **아니오** |

워크샵에서 눈으로 확인했다 — 다크·표면 위에서 선택된 행이 나머지와 **완전히 같아 보이고 파란
3px 선행 표식만 남는다.** 표식이 없었으면 선택이 보이지 않을 자리다. 색 하나로 상태를 전달하지
않는 것은 그 자체로도 맞다.

**같은 위험이 `SidebarNavItem`에 남아 있다.** 앱 셸 사이드바가 캔버스 위에 있는 동안에만
성립하며, 표면 위에 놓이는 배치가 생기면 선택이 사라진다. 규범의 Known deviations에 적었다.

### 기하를 제품에서 옮기지 않았다

제품의 gap 10px과 반경 14px에 맞는 semantic 토큰이 없고, 새 토큰은 token source를 바꿔 Figma
재적용이 따라온다. 대신 **DS에 이미 있는 선택 가능한 행**인 SidebarNavItem의 값을 따랐다 —
같은 성질의 두 컴포넌트가 다른 기하를 갖지 않게 하는 것이 더 중요하다.

### `listbox`가 아니다

목록을 방향키가 아니라 **Tab이 훑는다.** roving focus를 흉내 내지 않는다 — 그것은 `listbox`의
계약이고 이 컴포넌트는 버튼 목록이다. 목록이 길어져 Tab이 부담이 되면 그때 `listbox` 계약을
갖는 별도 컴포넌트가 필요하다.

### 카탈로그가 닫혔다

gap registry의 15순위가 전부 섰다. manifest component 18개 중 `select`만 `not-ready`이며 그것은
계획에 없는 유일한 항목이다(인계서 1d). 남은 것은 Figma component set 넷과 owner 판정들이다.

## 2026-08-18 (4) — Checkbox

카탈로그 14순위. `import { Checkbox } from "@klipse-design/react"`가 동작한다.

### 정본이 있는데 21벌 중 2벌만 쓴다

등록부는 "4 파일"이라고 적었고 실제는 **21벌 · 14파일 · 5레시피**다. 앞의 셋과 다른 점이 있다 —
**제품에 공용 정본이 있다.** `globals.css:990`의 `.app-native-checkbox`(20×20 · `accent-color`).

그런데 소비처가 둘뿐이고, **이유를 제품이 스스로 적어 두었다.**

> 전역 `app-native-checkbox`는 **레이어 밖**(globals.css)이라 `@layer utilities` 안의 유틸리티를
> 무조건 이긴다. 그래서 그 클래스를 계속 달아두면 여기서 주는 accent 색이 통째로 죽는다.
> — `VideoEditProjectPicker.tsx:140`

그래서 그 파일은 클래스를 떼고 선언을 통째로 베꼈고, accent 색이 **라이트는 sky-500 · 다크는
near-white**로 갈렸다. 결정이 아니라 캐스케이드 사고다. **레이어 밖 전역 선언은 정본으로
기능하지 못한다** — 이 저장소의 컴포넌트 CSS는 전부 `@layer` 안에 있어 같은 함정이 없다.

크기 20px은 채택했고 `accent-color`는 채택하지 않았다. 그것은 면 색 하나만 주고 체크 표시의
굵기·반경·포커스 링·**부분 선택 막대**를 전부 브라우저가 정한다. 제품 signup 계열 6벌이 이미
직접 그리는 것도 같은 이유다.

### 테두리 대비가 SC 1.4.11에 미달하고, 토큰 셋 중 어느 것도 넘지 못한다

선택하지 않은 체크박스는 **테두리가 어포던스의 전부**라 WCAG 2.2 SC 1.4.11(비텍스트 대비 3:1)이
그 선에 걸린다. 상자 면 대비를 실측했다.

| 토큰 | light | dark |
| --- | ---: | ---: |
| `color-border-control` | 1.27 | 1.63 |
| `color-border-default` | 1.38 | 2.93 |
| **`color-border-strong`** | **2.52** | **4.61** |

**셋 다 라이트에서 3:1을 넘지 못한다.** 가장 가까운 `border-strong`을 골랐고 라이트의 2.52는
남는다 — 해소하려면 새 값이 필요하므로 owner 판정이다. 이 실측이 인계서 (2b)의 입력이다.
선택된 상태의 면은 3.12/4.90으로 통과한다.

**`color-border-strong`의 첫 소비처가 여기다.** 인계서 (1a)가 "소비처 0이고 이름이 가리키는 것이
그 이름을 안 쓴다"고 분류한 넷 중 하나인데, 경계가 반드시 보여야 하는 자리가 생겨 이름이 뜻과
맞게 됐다. **그 토큰의 폐기 판정을 다시 해야 한다.**

axe의 `color-contrast`는 텍스트만 보므로 위 수치는 손으로 계산했다. 게이트가 재지 않는다.

### 부분 선택은 선택이 아니다

제품에서 `indeterminate`를 쓰는 곳은 **21벌 중 1벌**이고 표시를 브라우저에 맡긴다. DS는 10×2px
가로 막대를 직접 그리고, `checked`와 동시에 참이면 **막대가 이기게** 고정했다 — 두 규칙이 소스
순서로 갈리므로 CSS가 승패를 명시한다. `aria-checked="mixed"`를 함께 주는 이유는 DOM 프로퍼티만
으로는 보조기술이 "일부"를 읽지 못하는 경우가 있기 때문이다.

`indeterminate`는 콘텐츠 속성이 없어 JSX로 넘어가지 않는다. 매 렌더 뒤에 ref로 맞춘다.

### 남은 것

Figma component set 없음(`DS-F-006-checkbox`), 크기 축 없음(두 번째 소비처 전까지), Switch 없음.

## 2026-08-18 (3) — Segmented Control

카탈로그 13순위. [규범](../components/segmented-control.md)과 구현, 실브라우저 acceptance test
14건이 같은 변경 단위에 있다.
`import { SegmentedControl, SegmentedControlItem } from "@klipse-design/react"`가 동작한다.

### 등록부의 "3 파일"은 틀렸고, 이번에는 정본이 **둘**이었다

세그먼트 컨트롤만 **11벌 · 6레시피 · 8파일**이다. Slider와 다른 점이 하나 있다 — 제품에 공용
구현이 **둘** 있다. 그런데 **서로 아무것도 공유하지 않는다.**

| 레시피 | 벌 | 썸 위치 계산 | 선택 전달 |
| --- | ---: | --- | --- |
| A `SegmentedToggle` 컴포넌트 | 3 | JS `offsetWidth`/`offsetLeft−4` | `aria-pressed` |
| B `useSegmentedControlThumb` 훅 | 3 | JS `getBoundingClientRect` + ResizeObserver | **없음 — 색만** |
| B2 StaticAnalyticsDemo 손수 복제 | 1 | JS, 자체 ref | 없음 |
| C BgmNode `MODE_SEGMENT` | 1 | **CSS만** | `role=tab` |
| D ComposerBar `COMPOSER_SEGMENT` | 1 | **CSS만** | — |
| E ComposerBar 알약 그룹 | 2 | 썸 없음 | — |

트랙 padding 4↔3, 트랙 반경 12↔8, 썸 반경 8↔6, easing 셋, 비활성 글자 42%↔58%↔55%↔48%가
전부 다르다. A의 파일 주석은 스스로 SSOT라고 적어 두었는데 소비처는 3벌뿐이고, B는 훅만
공유하고 **스타일은 복붙이다** — Youtube와 Instagram의 5상수가 바이트 단위로 같다.

**정본을 A로 잡았다.** 재사용을 의도해 만든 유일한 컴포넌트이고, 트랙 반경 12 · padding 4 ·
세그먼트 반경 8 · 헤어라인 기법까지 그대로 채택했다. 기계 대조가 3축 붙어 있다.

### 대시보드 탭 다섯 자리는 이 컴포넌트가 아니다

`role="tablist"` 14곳 중 **5곳은 패널을 바꾸는 탭**이고 3곳은 카루셀 점이다. 세그먼트 컨트롤은
값을 고르고 자리를 옮기지 않는다. 갈라 두지 않으면 Tabs를 만들 때 같은 것을 두 번 만든다.

### 네이티브 radio 그룹이다

제품은 선택을 셋으로 다르게 전달한다 — `aria-pressed`, **아무것도 없음**(4벌, 색으로만),
`role="tab"`. 패널을 바꾸지 않고 값을 고르는 것은 radiogroup이므로 네이티브 radio를 쓴다. 방향키
roving, 끝에서 되돌기, "3 중 1" 그룹 안내, 폼 제출, forced-colors가 전부 브라우저의 것이 된다.

`<fieldset>` + 숨긴 `<legend>`인 이유는 legend가 그룹에 이름을 붙이는 유일한 네이티브 경로이기
때문이다. **제품 A는 `<span aria-label>`을 쓰는데 role 없는 span의 `aria-label`은 보조기술이
무시한다** — 이름이 있다고 적혀 있지만 실제로는 없다.

포커스 표시는 **여섯 레시피 어디에도 선언이 없다.** 옮기지 않았다.

### 면 두 색이 한 테마에서 죽지 않는 유일한 짝이다

인계서 (1a)·(1c)가 경고한 축의 실사례를 찾았다.

- **다크에서 `background-inset`·`surface`·`menu`·`overlay` 넷이 같은 색**(#313644)
- **라이트에서 `raised`·`overlay`·`surface` 셋이 같다**(#fafafa)

트랙과 선택 면으로 쓸 수 있는 조합은 `inset` ↔ `raised` 하나뿐이고 나머지는 한 테마에서 선택이
통째로 사라진다. 선언은 정상이라 다른 어떤 게이트도 잡지 못하므로 **두 테마를 각각 재는
테스트를 넣었다.**

트랙에 헤어라인을 두는 이유도 같다 — 다크에서 `inset`이 `surface`와 같아, 표면 위에 놓인 트랙이
테두리 없이는 보이지 않는다. 제품 A가 같은 기법(spread-only box-shadow)을 쓰고 있어 채택했다.

### 워크샵이 잡은 결함 둘

헤드리스 테스트는 둘 다 통과한다 — 선언도 토큰도 정상이기 때문이다.

- **좁은 컨테이너를 뚫었다.** `inline-flex`는 내용 크기로 자라므로 240px 상자 안에서 트랙이
  364px이 됐다. `max-inline-size: 100%`로 막았다
- **여유가 있는데 라벨이 잘렸다.** 세그먼트를 `flex: 1 1 0`으로 두면 기준 크기가 0이라 "시스템"이
  "시…"가 된다(라벨 32px, 필요 36px). `1 1 auto`로 바꿨다. 제품 A·B도 내용 크기다

### 새 토큰이 0개다

트랙 40/32 · padding 4 · 반경 12 · 세그먼트 반경 8 · 여백 12/8이 전부 기존 토큰이다. **세그먼트
반경은 바깥 반경에서 padding을 뺀 값**이라 12 − 4 = 8로 정확히 맞았다.

트랙 헤어라인은 `border`가 아니라 spread-only box-shadow다. border를 쓰면 border-box 안쪽이
줄어 세그먼트 높이가 DPR에 따라 달라진다.

### 남은 것 — 선택 면이 움직이지 않는다

제품 여섯 중 넷이 220~240ms 슬라이딩 썸을 갖고 **그것이 이 컴포넌트에서 가장 널리 합의된
축인데 옮기지 못했다.** [Motion](../foundations/motion.md)이 semantic recipe로 `layout-change`를
**이름만 예약해 두고 실제 토큰이 없으며**, lifecycle도 `enter`·`exit`·`loop` 셋뿐이다. 넷째
lifecycle을 세우는 것은 DS-D-0016이 `loop`에 한 것과 같은 크기의 변경이고, token source가 바뀌면
Figma 변수·style을 다시 적용해야 하므로 이 변경 단위 밖이다.

이름이 맞지 않는 기존 motion 토큰(`overlay-enter` 등)을 빌려 쓰지 않았다 — `radius-card`와 같은
함정이 된다.

그 밖에 남은 것: Figma component set 없음(`DS-F-006-segmented-control`), Tabs 없음, 아이콘 슬롯
크기 계약 없음, RTL 방향키 미검증.

## 2026-08-18 (2) — Slider

카탈로그 12순위다. [규범](../components/slider.md)과 구현, 실브라우저 acceptance test 16건이 같은
변경 단위에 있다. `import { Slider } from "@klipse-design/react"`가 동작한다.

### 등록부의 "에디터 Slider.Root 9"는 네 배 틀렸다

전수로 세니 **37벌 · 일곱 레시피 · 여섯 파일**이다. 등록부는 Radix를 덜 셌고 **네이티브
`input[type=range]` 15벌을 통째로 빠뜨렸다.** ProjectCard "3벌"이 4벌, EmptyState "7벌"이 9벌,
TextField "16"이 약 40벌이었던 것과 같은 종류다.

| 레시피 | 벌 | 트랙 | 썸 | 포커스 표시 |
| --- | ---: | --- | --- | --- |
| `overlayRadix*` 인스펙터 | 17 | 20/28px | **0 — 지움** | `outline:none!` |
| `timelineZoomRadix*` | 1 | 2/4px | 14px | 있음 |
| `CROP_SLIDER_*` | 2 | 4px | 16px | 있음 |
| `DURATION_SLIDER_*` | 2 | 4px | 12px | `outline:none` |
| `RANGE_SLIDER`(Tts·Bgm) | 6 | 4px | 12px | `outline:none` |
| `refinement…Slider` | 1 | 4px | 10px | 선언 없음 |
| 맨 `input` + `accentColor` | 8 | 기본 | 기본 | 브라우저 기본 |

**합의하는 축이 하나도 없다.** ProjectCard(네 벌 기하 동일)의 정반대이고 TextField와 같은
"정본 0"이다. 값은 DS가 정했고 판정은
[`product.measured.json`](../../migration/product.measured.json)의 8축에 있다.

### 포커스 표시를 지운 것이 37벌 중 25벌(68%)이다

세 레시피가 `outline: none`을 직접 선언하고 그것이 사용의 다수다. **옮기지 않았다.** 사용의
다수라는 사실이 그것을 정본으로 만들지 않는다 — Text Field와 앱 셸 사이드바에서도 같은 판정을
했다.

### 제품이 지운 썸을 되살리되 모양은 바꾸지 않았다

인스펙터 17벌은 썸을 `width:0; opacity:0; pointer-events:none`으로 지우고 채움 오른쪽 끝에
**2×14px 표식을 `::after` 장식으로 따로 그린다.** 그 표식이 바로 손잡이가 있어야 할 자리다.
`track` 변형은 같은 크기의 표식을 **실제 썸으로** 그린다 — 시각은 그대로이고 포커스와 방향키만
살아난다. 회귀 테스트가 그 넷(`width:0`·`height:0`·`opacity`·`pointer-events`) 중 하나라도
다시 들어오면 실패한다.

### 새 토큰이 0개다

레일 4px, 썸 16/12px, 막대 28/20px, 표식 2×14px은 전부 리터럴이다. 소비처가 이 컴포넌트
하나뿐이라 [Spacing & Radius](../foundations/spacing-radius.md)의 "두 개 이상의 사용처"를 아직
만족하지 않는다 — Spinner의 16/12px과 같은 판정이다. **토큰 source가 바뀌지 않아 baseline
재고정도 Figma 변수 재적용도 필요 없다.**

썸에 그림자를 쓰지 않는다. 제품의 썸 그림자 셋이 값이 다 다르고(`0 1.5px 3px/24%`,
`0 2px 8px/22%`, `0 1px 2px/30%`) DS elevation 넷 중 맞는 것이 없어, 채택하려면 새 elevation
토큰이 필요했다. `border-width-ring` 두께의 표면색 링으로 분리한다.

### 게이트가 볼 수 없는 자리를 찾았다

**Chromium은 `getComputedStyle(input, "::-webkit-slider-runnable-track")`에 섀도우
pseudo-element가 아니라 호스트 input의 값을 돌려준다** — 실측하니 320×40, 배경 투명, 반경 0이
나왔다. 레일·채움·썸의 **렌더 결과를 계산값으로 잴 수 없다.**

그래서 states 표를 두지 않았고, 기하는 CSSOM의 **선언**을 대조한다 — Button의 `borderWidth`가
계산값 대신 선언 토큰을 보는 것과 같은 이유다. 선언과 실제 그림이 갈라지는 경로는 열려 있으며
이것은 visual regression(2단계 harness)이 닫아야 한다. 규범의 Known deviations에 적었다.

### 워크샵이 잡은 결함 하나

`track` 표식에 `color-foreground-on-inverse`를 썼는데 그 토큰은 테마마다 뒤집힌다
(#fafafa ↔ #171b22). 채움은 두 테마 모두 같은 파랑이라 **다크에서 표식만 검게 변했다.**
헤드리스 테스트는 이것을 보지 못한다 — 선언은 정상이고 토큰도 실재한다. 눈으로 보고 찾았고
(DS-D-0012), `color-action-primary`의 문서화된 대비 짝인 `color-foreground-inverse`로 고쳤다.

### 남은 것

- **Figma component set이 없다.** `figma: not-ready`이며 `DS-F-006-slider`가 소유한다
- **Firefox 경로가 미검증이다.** `::-moz-range-*` 규칙을 나란히 적었으나 harness가 Chromium 단독이다
- **컨트롤 높이 40px이 `hit-target-minimum` 44px에 미달한다.** range input은 `::before`/`::after`가
  트랙·썸에 배정돼 `.kds-hit-target`을 쓸 수 없다. Text Field도 같은 40px이다
- **범위(두 손잡이) 선택이 없다.** 제품에 0벌이다

## 2026-08-18 — Sidebar Nav Item · App Top Bar

카탈로그 11순위다. 셸의 **레이아웃 계약은 [app-shell 패턴](../patterns/app-shell.md)이 이미
소유하고 있어** 여기서 지은 것은 그 안에 놓이는 부품 둘이다.

### 등록부의 "Gnb import 31곳"은 두 컴포넌트 합산이었다

앱 셸 `Gnb.tsx` **25파일** + 랜딩 `Gnb.tsx` 7파일이고 한 파일이 둘 다 import한다. 앱 셸만 세면
25(파일) 또는 29(인스턴스)다.

### 제품의 사이드바 항목에는 포커스 표시가 없다

`globals.css`의 `button:focus, button:focus-visible { outline: none }`이 `@layer base` 블록
**밖**에 있어 `@layer utilities` 안의 Tailwind 임의 유틸리티를 **특이도와 무관하게** 이긴다.
항목이 선언한 링 세 줄이 전부 사문이고, 앱 셸 소비처 25곳이 모두 `<button>` 분기를 타므로
**키보드 사용자가 지금 어디에 있는지 알 수 없다.** 옮기지 않았고 테스트가 링이 실제로 그려지는지
확인한다.

### 옮기지 않은 것 둘 더

- **목적지가 있으면 링크다.** 제품은 소비처 25곳이 전부 `onNavigate`를 넘겨 `<button>` 분기를
  타는데, 그 결과 새 탭·링크 복사·미들클릭이 죽는다
- **접혀도 라벨이 DOM에 남는다.** 지우면 접기/펴기마다 접근성 이름이 사라졌다 나타나고,
  스크린 리더 사용자에게는 접힘이 보이지 않는 상태 변화가 된다

### 선택은 `aria-current`가 소유한다

시각 전용 속성을 따로 두면 화면에는 선택으로 보이는데 보조기술에는 아무것도 전달되지 않는 상태를
만들 수 있다. 제품이 쓰는 두 메커니즘(형제 인디케이터 / 항목 직접) 중 **항목이 직접** 갖는 쪽을
골랐다 — 인디케이터를 형제로 두면 항목 하나를 다른 곳에 옮겨 놓을 수 없다.

### 토큰 — 이름이 틀린 것 하나를 고쳤다

[DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md).

`layout-app-shell-sidebar-minimum`(120px)의 이름은 "사이드바 최소"인데 제품에서 120이 나오는
유일한 자리는 `min(280px, calc(100vw - 120px))`의 **빼는 값**, 즉 **본문에 남기는 최소 공간**이다.
실제 사이드바 폭은 280 · 56 · 0 셋인데 어느 것도 120이 아니었다.

- `sidebar-minimum` → **`content-reserve`**. 값은 그대로
- **`sidebar-width` 280** · **`sidebar-collapsed` 56** · **`top-bar-height` 40** 신설
- **`.kds-layer-sticky` 유틸리티** 추가 — 토큰은 있는데 쓸 클래스가 없어 숫자를 쓰게 되어 있었다

상단 바 높이가 40인 근거는 제품에 52/36/40 셋이 있고 `globals.css`의 주석이 **정렬을 40 전제로
계산**하기 때문이다. `layout-control-height-md`가 같은 40이지만 쓰지 않는다 — 버튼 높이를 바꾸는
날 상단 바가 같이 움직이면 안 된다.

## 2026-08-17 (4) — keyframe이 무엇을 애니메이션하는지 게이트가 본다

Skeleton을 짓기 전에 실측을 했더니 **제가 두 커밋 전에 만든 문제**가 나왔다.
[DS-D-0017](../governance/decisions/DS-D-0017-keyframe-contract.md).

### 규범은 있는데 게이트가 없었다

motion.md는 "선언되지 않은 property를 component가 임의로 animation하지 않는다"를 규범으로 두었다.
**그것을 검사하는 것이 없었다.** 검증되는 것은 토큰 선언의 모양뿐이고 저작 CSS의 `@keyframes`
본문은 아무도 읽지 않았다.

그래서 **이미 둘이 어긋나 있었다** — Toast는 선언이 `transform`인데 `translate`를, Tooltip은
`scale`을 애니메이션했다. 둘 다 `transform`의 **개별 속성**이며 CSS에서 별개 property다.
새 게이트를 세우자 **첫 실행에서 그 둘을 잡았다.**

### `motion-loop`는 이름이 너무 넓었다

[DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md)이 700ms·linear를 **회전 22벌만 보고**
정했고 그 문서가 스스로 그렇게 적었다. 자리표시 19벌을 재 보면 다르다.

| 축 | 회전 | 자리표시 |
| --- | --- | --- |
| 주기 | 700ms (22벌 중 10) | **1.6s** (19벌 중 12). 700ms는 **하나도 없다** |
| easing | `linear` (22/22) | 가감속 14 · 등속 5 |

motion.md의 "easing은 등속이다"도 근거가 "가감속이 붙으면 회전이 맥박처럼 뛴다"였다 —
**회전에만 성립하는 논거**를 loop 전체로 일반화한 것이다.

- `motion-loop` → **`motion-spin`**(700ms · 등속). 회전 전용임을 이름이 말한다
- **`motion-shimmer`**(1.6s · `easing-standard`) 신설. 자리표시용
- 등속 규칙을 회전에 한정했다

`motion-shimmer`의 easing이 제품의 `cubic-bezier(0.4, 0, 0.2, 1)`이 아닌 이유는 제품의 자리표시
easing이 9/5/5로 갈려 **정본이 없기** 때문이다. 근사한 곡선을 새로 세우기보다 이미 있는 표준
곡선을 쓴다.

### 허용 property를 실제에 맞췄다

- enter/exit — `opacity`·`transform`에 개별 속성 `translate`·`scale`·`rotate`를 더했다
- loop — `background-position`을 더했다. 합성 축이 아니라 DS-D-0016의 "transform 축을 통째로
  잡지 않는다"는 논거에 걸리지 않는다. `transform` shorthand는 **여전히 거부**되며 카나리아가
  그것을 확인한다

### 카나리아 3종

저작 규칙 카나리아가 9종에서 12종이 됐다 — 선언되지 않은 property, motion 토큰에 연결되지 않은
keyframe, loop에서의 `transform` 거부.

### 왜 Skeleton보다 이것이 먼저인가

제품 자리표시의 우세 기법은 `background-position` 이동(19벌 중 12)이다. 그대로 지었으면
**게이트는 전부 초록인 채로 규범을 위반**했을 것이다 — Badge의 죽은 축이 게이트를 통과했던 것과
같은 구조다.

## 2026-08-17 (3) — Spinner

카탈로그 10순위다. 직전에 세운 loop lifecycle이 이것을 위한 선행 작업이었다.

### 이번에는 정본이 뚜렷하다

제품의 로딩 표현은 약 62벌이지만, 공용 `LoadingSpinner`가 있고 그 recipe가 **700ms · linear**로
방금 세운 `motion-loop`와 정확히 같다. 링 구조도 그대로 옮겼다.

**링이 둘이다** — 네 변이 칠해진 흐린 트랙과 위쪽 한 조각만 칠해진 진행. 트랙이 없으면 회전하는
조각이 어디를 도는지 보이지 않아 "무언가 깜빡인다"로 읽힌다. 이전 DS의 spinner는 트랙 없이 위쪽
테두리만 비웠고, 그것은 제품과 다른 표현이었으며 편차로 선언된 적도 없었다.

### keyframe 중복을 합쳤다

제품이 회전 keyframe 이름 18개에 본문 1종을 가진 것과 **같은 중복이 이 저장소에도 둘 있었다** —
`kds-button-spin`과 `kds-menu-spin`. `base.css`의 공용 `kds-spin` 하나로 합쳤다. 같은 것을 두 번
적으면 한쪽만 고쳐지는 날이 온다.

### 라벨에 기본값을 두지 않는다

`label`이 있으면 `role="status"`로 알리고 없으면 `aria-hidden`으로 숨는다. 기본 문자열을 두지 않는
이유는 제품에 `aria-label="Loading"`이 하드코딩된 자리가 있기 때문이다 — DS가 기본값을 배포하면
그 하드코딩을 시스템 전체로 퍼뜨리는 셈이 된다.

### 제품에서 옮기지 않은 것

제품의 공용 `LoadingSpinner`에는 `prefers-reduced-motion` 처리가 **없다.** 비공용 정의 중 일부는
갖고 있다. 공용을 그대로 승격하면 그 결함이 시스템 전체로 퍼지므로 여기서는 넣었다.

### Figma의 표현 한계 둘

- CSS는 두 겹의 `border`인데 Figma에는 "테두리 한 변만 칠하기"가 없다. stroke로 그렸더니
  `innerRadius: 0`인 파이 조각의 외곽선(중심으로 가는 반지름 두 줄)이 함께 그려졌다 — 실측으로
  확인하고 fill + `innerRadius`의 arc 밴드로 바꿨다
- Figma는 `currentColor`를 표현하지 못한다. 문서용으로 `foreground-primary`를 쓴다

### 아직 없는 것

determinate 진행률, 스켈레톤(15벌), 텍스트 쉬머(11벌)는 별도 컴포넌트다. 진행률 쪽은 제품의 2벌이
두께·색·전환이 셋 다 다르고 `role="progressbar"`가 저장소 전체에 1곳, `<progress>`가 0곳이다.

## 2026-08-17 (2) — 무한 반복 motion에 lifecycle을 준다

Spinner를 세우기 전에 규범이 먼저 필요했다.
[DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md).

### 이미 있는 회전 둘이 게이트 밖에 있었다

`motion.md`의 Token model이 소유 목적을 enter/exit/layout-change로 한정해 두어, Button과 Menu의
spinner가 **어떤 게이트에도 잡히지 않았다.**

- `animation: ... 1s linear infinite` — duration과 easing이 리터럴이라 토큰을 바꿔도 따라오지 않았다
- keyframe이 `rotate`를 애니메이션하는데 `rotate`는 허용 property가 아니었다
- reduced-motion에서 실제로 멈추는지 확인하는 테스트가 없었다

### `loop`를 세 번째 lifecycle로 세웠다

- `motionProperties` 항목에 선택적 `lifecycle` 필드 — `enter` | `exit` | **`loop`**.
  생략하면 enter/exit로 본다(기존 9개 항목이 그대로 통과한다)
- 허용 property가 lifecycle마다 다르다. loop는 `rotate`·`opacity`이고 `transform`이 아니다 —
  개별 속성 `rotate`는 `scale`·`translate`와 합성되므로 회전 하나 때문에 transform 축을 통째로
  잡지 않는다
- **loop는 `reducedMotionPairs`의 대상이 아니다.** reduced에서 loop는 짧아지는 것이 아니라
  사라지며, `0ms`짜리 애니메이션을 무한 반복하는 것은 성립하지 않는다. 대체는 duration 토큰이
  아니라 component의 `animation-iteration-count: 1`과 `aria-busy`가 소유한다

### `motion-loop` = 700ms · linear

700ms는 제품의 우세값이다(회전 22벌 중 10벌). `linear`는 제품 22벌이 **전수 일치하는 유일한
축**이다 — 가감속이 붙으면 회전이 맥박처럼 뛰어 "진행 중"이 아니라 "잘못됨"으로 읽힌다.

Button과 Menu의 spinner가 1s에서 700ms로 바뀐다. 제품과 일치한다.

### 면제가 넓지 않다는 것을 카나리아가 증명한다

카나리아 3종을 붙였다(39 → 42). 그중 하나는 loop 항목에서 `lifecycle`만 떼는데, 그 순간
`reducedMotionPairs에 transition이 누락되었습니다: motion-loop`로 실패한다 — 면제가 `lifecycle`에
정확히 걸려 있고 그것을 빼면 다시 강제된다는 뜻이다.

브라우저 테스트 3건이 두 motion context에서 각각 돈다. 회전이 토큰에서 오는지, reduced에서
멈추는지, 멈추더라도 `aria`가 진행을 남기는지를 본다.

## 2026-08-17 — Badge, 그리고 죽은 축 둘

카탈로그 9순위다. 제품에 배지 계열 정의가 **65벌**이고 공용 구현은 0이다.

### 등록부의 "톤 4 + 상태 5"가 둘 다 틀렸다

- "톤 4"는 `InspectorPill`의 tone prop 네 갈래를 센 것인데 **네 톤 클래스의 선언이 바이트 단위로
  같다.** prop은 있는데 색이 하나다
- "상태 5"는 하이라이트 히스토리 카드만 맞다. 그것을 복제한 비디오 에디터는 3개뿐이고, 앱 홈의
  4변형은 **네 색이 전부 `var(--gray-400)`로 같다**

두 곳 다 **축이 있다고 적혀 있는데 실제로는 죽어 있었다.** 그래서 이 컴포넌트의 테스트에서 가장
중요한 단언은 "다섯 tone이 실제로 서로 다른 색을 만든다"이다 — 값이 갈리는지를 직접 본다.

### 새 토큰이 하나도 필요 없었다

상태 배지의 대표(`highlightSceneStyles.ts:760`)의 여백 4/8px과 반경 8px이 `space-control-xs`·
`space-control-sm`·`radius-control-sm`에 정확히 맞는다. 색은 `color-status-*` 네 쌍이 이미 있고
`contrastPairs`에 `minimum 4.5`로 걸려 있다(실측 9.09~11.98).

아이콘은 `1em`이다. [iconography.md](../foundations/iconography.md)가 12px을 "4px 격자 밖"이라며
거부해 두었는데, 글자를 따라가게 하면 그 판정을 다시 열지 않아도 된다.

### 제품에서 옮기지 않은 것

제품의 상태 배지는 다섯 상태의 **면이 전부 `gray-800`으로 같고 글자색만 갈린다.** light/dark 값도
같아 밝은 테마에서 어두운 배지가 뜬다. 여기서는 면과 글자를 짝지었다 — 색각 이상에서 글자색 하나에
기대지 않고, 두 값이 게이트에 대비 쌍으로 묶인다.

### 드러난 결손 하나

**`contrastPairs`에 면 대 면 축이 아예 없다.** 선언된 12쌍은 전부 글자 대 면이다. 배지 면과 페이지
면의 실측 대비는 1.02~1.23:1로 `color-theme.md`가 비텍스트 그래픽에 요구하는 3:1에 못 미치는데,
게이트가 그것을 계산하지 않는다. 배지는 의미를 라벨(11:1)이 나르므로 수용하고 적었다.

### Spinner는 착수 전 선행 작업이 있다

10순위를 함께 실측했더니 등록부의 "레시피 5종 · Skeleton 0종"도 틀렸다 — 회전 스피너 **22벌**,
스켈레톤 **15벌**, 진행률 5벌, 텍스트 쉬머 11벌로 약 62벌이다. 회전 키프레임 이름은 18개인데
본문은 전부 `to { transform: rotate(360deg) }` 한 종류다.

**바로 짓지 않는다.** [motion.md](../foundations/motion.md)가 무한 반복을 다루지 않는다 —
소유 목적을 enter/exit/layout-change로 한정해 두었다. 게다가 토큰 모델이 semantic transition
토큰에 reduced-motion 짝을 강제하는데 `0ms + infinite`는 의미가 성립하지 않고, 허용 property가
`opacity`·`transform` 둘뿐인데 기존 스피너는 `rotate`를 애니메이션한다. 규범 확장이 먼저다.

## 2026-08-16 (4) — Empty State와 `space-stack-*` 계열

### 제품 9벌이 합의하는 축이 하나뿐이다

카탈로그 8순위다. 등록부는 7벌로 적고 있었고 실제는 **9벌**이다(에디터가 3이 아니라 5 —
`VideoEditModal` 한 파일 안에 세 벌이 있다). 그중 하나는 조건상 도달할 수 없는 죽은 분기다.

아홉 벌은 세로 여백도(80/64), 블록 간격도(12/16), 제목 계층도, CTA 유무도 갈린다. **딱 하나
9/9가 합의한다 — 자기 배경도 테두리도 반경도 갖지 않는다.** 상자가 아니라 부모 표면 위에 얹히는
텍스트 블록이다. 그 합의를 옮겼고 테스트가 그것을 가장 강하게 고정한다.

나머지는 두 홈이 동의한 값을 골랐다 — 근거가 가장 두껍다.

### 오류 상태를 다루지 않는다

제품의 프로젝트 피커는 "목록이 비었다"와 "불러오지 못했다"를 같은 빨간 표현으로 합쳐 두었다.
그 둘은 사용자가 취할 행동이 다르다 — 없으면 만들면 되고 실패했으면 다시 시도해야 한다.

`aria-live`도 붙이지 않는다. 빈 상태는 목록이 로드된 **결과**이고 로딩을 알리는 것은 이미 다른
요소의 일이다. 여기에 live region을 두면 화면을 옮길 때마다 다시 읽힌다. 대신 제목이 heading이라
랜드마크 탐색으로 닿고, 그 단계는 호출부가 정한다.

### `space-stack-*` 계열 — breaking

[DS-D-0015](../governance/decisions/DS-D-0015-stack-spacing.md).

Project Card를 세울 때 오버레이 줄 간격(4px)을 부를 이름이 없어 `space-card-text-gap`을 만들었다.
**컴포넌트 이름이 토큰에 들어간 유일한 자리**였고, Empty State가 같은 문제를 다시 만들었다 —
블록 간격 12px에 쓸 이름이 없다. 여기서 `space-empty-state-gap`을 또 만들면 컴포넌트마다 자기
간격 토큰을 갖는 길이 열린다.

- `space-stack-xs` 4px — `space-card-text-gap`을 대체한다
- `space-stack-md` 12px — Empty State의 블록 간격
- 뜻은 **표면 안에서 세로로 쌓이는 블록 사이**다. `space-control-*`(컨트롤 안쪽)도
  `space-layout-*`(레이아웃 여백)도 아니다
- `sm`·`lg`는 필요할 때 추가한다. 소비처 없는 단계를 미리 만들지 않는다

컴포넌트 이름이 들어간 토큰이 0이 됐다.

### `icon-size-xl` 64px

`iconography.md`의 미채택 표가 "64는 **빈 상태 컴포넌트가 생길 때** 사유와 함께 추가한다"고 자리를
예약해 두었고, 그 컴포넌트가 지금 섰다. additive다.

### 게이트가 잡은 것

Figma component를 세우고 parity를 돌리니 **계약에 없는 자손 `Action`**이 걸렸고, 선언하는 과정에서
실제 차이가 드러났다 — CSS는 액션에 `margin-block-start: 4px`를 더해 앞 요소와 16px 떨어지는데
Figma는 12px이었다. Figma auto-layout에 자식별 간격이 없어 같은 4px을 Action 프레임의 위쪽
padding으로 만들었다.

## 2026-08-16 (3) — Text Field

카탈로그 7순위다. **제품에 공용 구현이 없다** — 텍스트 입력 정의가 약 40벌이고 다섯 계열로 갈리며
계열 사이에 합의가 없다. 등록부는 "에디터 16 · 하이라이트 3"으로 적고 있었다.

| 계열 | 벌 | 시각적 필드가 무엇인가 |
| --- | ---: | --- |
| 인증 floating-label | 9 | **감싸는 `div`.** `<input>`은 투명하다 |
| 테두리 보이는 박스 | 5 | `<input>` 자신 |
| 테두리 없는 채운 면 | 9 | `<input>` 자신(배경만) |
| 투명 인라인 rename | 8 | 없음 |
| 노드 캔버스 프롬프트 | 5 | `<textarea>` 자신 |

정본이 없으므로 값은 DS가 정했고, 어디서 갈라지는지는 `product.measured.json`이 사유와 함께 갖는다.

### 시각적 필드는 `<input>`이 아니라 감싸는 박스다

제품의 가장 큰 계열이 그 구조를 쓰고, 이유가 있다 — 접두 아이콘과 접미 버튼을 필드 **안에** 두려면
`<input>` 하나로는 안 된다. 포커스 링도 박스가 `:focus-within`으로 받는다. `<input>`에 걸면 링이
글자 주위에만 뜨고 슬롯이 밖에 남는다.

박스는 `<label>`이 아니라 `<div>`다. `<label>`로 두면 슬롯 안의 버튼을 눌러도 입력이 포커스를
가져가 버튼이 동작하지 않는다.

### 제품에서 옮기지 않은 것

- **포커스 표현.** 제품은 계열마다 다르고 일부는 `[&:focus-visible]:[outline:none]`으로 **의도적으로
  없앴다**(`NodeLayersPanel.tsx:178` 주석이 "요청대로 색 제거"라고 적어 두었다). 키보드 사용자가
  지금 어디에 있는지 모르는 상태를 규범으로 옮기지 않는다. 공유 링 하나로 통일했다
- **라벨 부재.** 대부분의 필드에 시각 라벨이 없고 placeholder가 그 역할을 대신한다. placeholder는
  입력을 시작하면 사라지므로 라벨이 될 수 없다. 라벨을 필수로 요구한다
- **placeholder 색.** 제품의 알파 placeholder는 light에서 4.5:1에 미달한다. `foreground-tertiary`도
  3.96:1로 미달해 `foreground-secondary`를 쓰고, 값과의 구분은 색 단계가 아니라 primary/secondary
  위계가 맡는다
- **색만으로 알리는 오류.** `aria-invalid`와 `aria-describedby`로 연결된 문구가 함께 뜨고 그 문구는
  `role="alert"`이다. 도움말은 alert가 아니다 — 화면을 여는 것만으로 스크린 리더가 시끄러우면 안 된다

### 토큰 하나

`color-border-danger` = red.500. 테두리 역할의 danger 토큰이 없어서 IconButton도 solid danger를
포기하고 tonal로 우회한 적이 있다. red.500만 light 3.14 · dark 3.70으로 양쪽에서 비텍스트 경계
3:1을 넘는다. 순수 additive이며 breaking이 아니다.

`caret-color`는 **선언하지 않는다.** 브라우저 기본이 `currentColor`라 값 텍스트를 자동으로 따라간다.
전용 토큰을 만들면 값과 캐럿이 따로 놀 수 있다.

### 드러난 불일치 하나

TextField는 `color-border-control`을 쓰는데 IconButton은 같은 자리에 `color-border-default`를 쓴다.
값도 다르다(전자는 반투명, 후자는 불투명). **컨트롤 테두리의 정본이 저장소 안에서 아직 정해지지
않았다.** 이 컴포넌트가 만든 문제가 아니라 드러낸 문제다.

## 2026-08-16 (2) — Project Card 구조 정정과 parity 게이트 확장

### 프레임을 링크로 만들면 안 됐다

처음 구현은 카드 root 자체가 `<a>`/`<button>`이었다. 그러면 슬롯의 더보기 버튼이 `<a>` 안의 대화형
자손이 되어 **HTML이 무효**가 되고 보조기술에서 동작이 정의되지 않는다. 규범 문서가 바로 그 사용을
예시로 들고 있었다.

프레임을 `div`로 되돌리고 클릭 타깃(`ProjectCardAction`)을 카드 전체에 늘려 깐 형제로 두었다.
자식 순서가 계약이다 — **Media → Action → Adornment**. 슬롯이 앞에 오면 클릭 타깃이 위에 깔려
슬롯 안의 컨트롤이 눌리지 않는다. 테스트는 DOM 순서가 아니라 **실제 hit test**로 확인한다.

클릭 타깃의 이름은 `ProjectCardTitle`에서 온다. id는 컴포넌트가 인스턴스마다 발급한다.

### 오버레이 띠가 자라지 않고 있었다

문서·measured·인계 근거가 모두 "내용이 크면 띠가 자란다"고 적어 두었는데 실제로는 아니었다.
`block-size: 30%`는 절대 위치 박스의 확정 크기라 내용이 커져도 자라지 않고 **글자가 띠 위로
넘친다** — 최소 트랙 240px에서 띠 71.4px에 내용 92.8px이라 eyebrow가 흐림이 0인 구간에 놓였다.

`block-size: fit-content; min-block-size: 30%`로 바꿔 30%를 하한으로 만들었다. 측정 폭 360에서는
30%가 이기고 240에서는 내용이 이긴다. 테스트가 두 지점을 모두 고정한다.

### 누름 전환이 네 컴포넌트에서 죽어 있었다

`transition-property: opacity, transform`이라고 적고 `scale`을 움직이고 있었다. **`scale`은
`transform`과 별개 property**라 이 선언은 아무것도 전이하지 않는다 — 계산값을 읽으면
`"opacity, transform"`인데 실제로 움직이는 것은 `scale`뿐이다.

Button·IconButton·overlay·ProjectCard 넷을 `opacity, scale`로 고쳤다. Dialog는 처음부터
`translate, scale`로 적고 있었다. 고치자마자 Menu 패널과 항목의 크기가 여는 애니메이션의 `scale`을
타고 96%로 읽히기 시작해, 그 테스트들도 변환에 영향받지 않는 레이아웃 값으로 바꿨다.

### parity 게이트가 자손을 본다

지금까지 component 계약은 **root 노드만** 대조했다. Project Card는 계약값이 전부 자손인
`Title overlay`에 있어서 root만 보면 여백·간격·흐림이 하나도 검증되지 않는다.

- `geometry.parts`로 자손의 field를 root와 **같은 규칙**으로 대조한다(문자열=measured 키, 배열=합,
  객체=literal). 새 어휘를 만들지 않았다
- 자손의 높이가 다른 자손에 대한 비율로 정의되는 경우(`heightRatioOf`)
- `childOrder` — 크기는 다 맞는데 못 쓰는 상태는 값 비교로 잡히지 않는다
- 프로그레시브 흐림의 램프 끝점을 **measured의 mask 정지점에서 유도한다.** 계약에 옮겨 적으면
  정본이 둘이 되어 CSS를 고쳐도 옛 값을 계속 통과시킨다
- Figma는 숫자를 float32로 저장해 120%가 120.00000476837158로 돌아온다. 자손 비교에 1e-4 허용치를
  두되, canary가 그 허용치가 검출력을 낮추지 않음을 증명한다

**text style 면제를 하나 도입했다.** Figma text style은 all-or-nothing이라 줄 간격만 덮어도 style
연결이 끊긴다(실측 확인). 카드 오버레이는 120%가 필요하고 그 줄 간격을 가진 style이 토큰 소스에
없다. 면제하되 **검사를 빼지 않는다** — 그 자리는 `fontSize`와 `lineHeightPercent`를 직접
대조하도록 게이트가 강제한다. 바인딩 검사는 "값이 토큰에서 온다"의 대리 지표이고 값 대조는 그
자체다.

canary는 26종에서 **33종**으로 늘었다.

### Toast는 게이트가 없었다

앞선 변경에서 만든 `surface-geometry.browser.test.tsx`의 머리말이 Dialog·Tooltip·Toast·Menu를
덮는다고 적어 두었는데 **Toast 테스트가 없었다.** 채웠다. Dialog의 padding·gap도 함께 넣었다.

### states 표 17건도 아무도 읽지 않았다

같은 함정이 색 축에 그대로 있었다. `components.measured.json`의 states 표 중 코드가 읽는 것은
Button과 IconButton뿐이고, Tooltip·Toast·Menu·Dialog·ProjectCard의 17건은 Figma 쪽에서만
대조되고 있었다. `component-states.browser.test.tsx`의 "빠짐없이 덮는다" 가드조차 기대 목록에 두
컴포넌트만 하드코딩돼 있었다.

`surface-states.browser.test.tsx`가 다섯을 덮고, **measured에 states가 있는데 테스트가 없는
컴포넌트가 생기면 실패하는 가드**를 함께 둔다 — 목록을 손으로 유지하는 대신 measured에서 읽는다.

## 2026-08-16 — Project Card와 카드 반경 정정

### `radius-card`가 20px에서 16px로 내려간다 — breaking

제품의 프로젝트 카드는 **정의 4벌이 전부 16px**인데 DS의 `radius-card`는 20px이었고, 그 20px의 유일한
소비처는 Dialog compact였다. 이름이 카드를 가리키면서 카드가 아닌 것에만 쓰이고 있었다.

[DS-D-0014](../governance/decisions/DS-D-0014-card-radius.md)로 바로잡았다.

- `radius-card` = 16px. Project Card가 쓴다
- `radius-card-lg` = 20px 신설. Dialog compact가 같은 변경 단위에서 이쪽을 가리킨다
- **화면은 바뀌지 않는다.** Dialog compact는 여전히 20px이다

breaking이므로 [DS-GOV-001 절차](../governance/releases.md)를 따랐다 — 결정을 먼저 쓰고, `diff-tokens`로 분류를
확인하고(additive 1 · value 1, 의도하지 않은 breaking 0), baseline을 갱신하고 재검증했다.

### Project Card

카탈로그 우선순위 6번이다. 제품의 홈과 허브가 각자 만든 정의 4벌의 기하가 서로 같아, 값은 DS가 정한
것이 아니라 **제품 정본을 옮긴 것**이다. 규범은 [project-card.md](../components/project-card.md).

- `@klipse-design/react`에 8종 export. root가 네이티브 `<a>`/`<button>`이다 — 제품 네 벌은 전부
  `<article>` + `onClick`이라 키보드로 열 수 없다
- `space-card-text-gap`(4px) 신설. 제품의 `--project-card-overlay-stack-gap`에 대응한다
- Figma `Content` 섹션에 component 하나. parity 게이트는 아직 이 component를 덮지 않는다

### 프로그레시브 블러의 첫 소비처가 생겼다

API와 게이트만 있고 쓰는 곳이 없던 프로그레시브 블러가 여기서 쓰인다. 제품이 이미 쓰고 있었다 —
카드 제목 띠의 `backdrop-filter: blur(10px)` + 위로 사라지는 mask가 그것이다.

불투명 스크림과 다르다. 스크림은 썸네일의 색을 지우고, 흐림은 색을 남기면서 글자 뒤의 고주파 성분만
없앤다. 정지점은 `figma/components.measured.json`이 갖고 코드와 Figma가 같은 원천을 본다.

**Figma의 표현에 한계가 하나 있다.** CSS mask는 정지점 다섯 개로 비선형 곡선을 그리는데 Figma의
`PROGRESSIVE`는 두 지점 사이의 선형 램프다. 중간 구간에서 0.8/0.4 대신 0.67/0.33이 된다.

### 표면 컴포넌트 넷이 게이트 없이 있었다

Dialog·Tooltip·Toast·Menu는 `components.measured.json`에 값이 있는데 **코드 쪽 대조가 없었다.**
parity 게이트는 Figma가 measured와 같은지만 보므로, 그동안 "Figma와 measured는 서로 맞고 둘 다 코드와
틀린" 상태로 통과할 수 있었다. 실제로 `radius-card`를 내렸을 때 Dialog compact가 20px을 유지하는지
확인해 주는 테스트가 하나도 없었다.

`surface-geometry.browser.test.tsx`를 세워 넷과 Project Card를 덮는다. 세우는 과정에서 두 가지를
실측으로 찾았다 — Dialog 폭이 여는 애니메이션의 `scale`을 타고 정확히 98%로 읽히는 것(`offsetWidth`로
바꿨다), 그리고 오버레이 띠가 `content-box`라 여백만큼 두꺼워지던 것(`box-sizing`을 명시했다).

## 2026-08-15 — Tailwind 4 interop과 글래스 섀도우 제거

### 배포 환경이 Tailwind 4다

DS는 Tailwind 의존성이 **0개**였고 [DS-D-0004](../governance/decisions/DS-D-0004-css-authoring.md)가
"소비 제품은 Tailwind 사용 여부를 고정할 수 없다"를 근거로 authored plain CSS를 택해 둔 상태였다.
그 전제가 틀렸다 — 제품은 `tailwindcss ^4.3.3`을 쓴다.

더 중요한 것은 제품이 이미 `@theme inline` 블록을 **생성기로** 만들고 있었다는 점이다. 그 생성기의
입력이 제품의 `globals.css`라서, **제품 CSS가 토큰의 정본**이었다. DS가 토큰을 바꿔도 제품 유틸리티는
따라오지 않고, 제품이 색을 바꾸면 DS와 조용히 갈라진다. 205축 중 143축이 그렇게 갈라져 있었다.

[DS-D-0013](../governance/decisions/DS-D-0013-tailwind-interop.md)로 결정했다 — **토큰만** Tailwind 4
`@theme inline` 레이어로 발행하고 컴포넌트 CSS는 authored plain CSS로 남긴다.

- `@klipse-design/css/theme.css` 신설. 유틸리티 토큰 93개 + 변수 전용 16개
- 값이 리터럴이 아니라 `var(--kds-*)`를 가리킨다. `@theme`가 아니라 **`@theme inline`**인 이유가
  이것이다 — semantic 색이 런타임에 바뀌므로 inline이 아니면 빌드 시점 값이 구워져 테마 전환을
  따라가지 않는다
- Tailwind에 대응 namespace가 없는 범주(`layer`, `border-width`, `motion`)도 변수로 내보낸다
- **매핑되지 않은 토큰 접두사를 만나면 생성이 실패한다.** 새 범주가 생겼는데 매핑을 빠뜨리면
  유틸리티가 조용히 안 나오고 아무도 모른다. canary가 그 검출력을 증명한다

컴포넌트까지 유틸리티로 내보내지 않은 이유는 셋이다. 소비하는 쪽이 Tailwind를 반드시 갖춰야 하고,
같은 클래스가 소비자 설정에 따라 다른 결과를 내며(제품은 `--spacing: 2px` 격자라 `p-4`가 8px이다),
cascade layer가 주는 override 계약이 사라진다. 제품 자신이 그 함정을 주석으로 적어 두었다 —
레이어 안의 유틸리티는 레이어 밖 모듈 CSS에 **특이도와 무관하게 진다**.

### 글래스 섀도우 개념을 없앴다

owner 결정이다. 버튼에는 이너섀도우를 쓰지 않고, 이너섀도우는 노드 사이드 버튼에만 남긴다.

- Button의 글래스 베벨 2겹과 `::before` 광택 오버레이를 제거했다. Figma에서 Gloss 사각형 6개와
  effect style 둘을 지웠다
- 토큰 4개를 제거했다 — `shadow`/`elevation`의 `control-bevel`, `control-gloss`
- Toast 그림자에서도 베벨 inset 2겹을 뺐다. drop 1겹 + 배경 흐림만 남는다

제품 값을 채택했던 두 축을 **철회**해 사유를 적은 편차로 바꿨다. 제품과 다르게 가는 결정이므로
`migration/product.measured.json`에 그 사실이 남는다.

### 모든 헤어라인이 0.5px다

`border-width` 토큰을 세웠다(hairline 0.5 / ring 2). Button·IconButton·Tooltip·Dialog·Menu 구분선의
테두리가 전부 hairline이며 Figma 스트로크 27개도 `0.5|INSIDE`다. spinner 링(2)과 글리프(1.5)는
테두리가 아니라 그대로다.

**브라우저는 DPR 1에서 0.5px의 사용값을 1px로 올린다.** `getComputedStyle`이 언제나 1px을 돌려주므로
기하 테스트가 계산값이 아니라 선언 토큰을 보도록 고쳤다. 레티나에서는 진짜 half-pixel로 그려진다.

### 스트로크와 effect를 역할별로 잰다

두께를 **집합**으로만 보면 버튼 테두리가 2px이 돼도 spinner의 2와 구분되지 않았다. `strokeAlign`은
아예 보지 않았다 — 같은 두께라도 `CENTER`가 되면 시각 박스가 달라진다. effect는 개수만 세서
`INNER_SHADOW`가 `DROP_SHADOW`로 바뀌어도 통과했다.

역할별로 두께·정렬·effect 종류·순서를 대조하고, blur는 radius가 변수에 묶였는지까지 본다.
변조 canary가 20종에서 25종이 됐다.

그 과정에서 effect 종류 canary가 **무력화돼 있던 것**도 찾았다. `INNER_SHADOW`를 찾아 바꾸는
방식이라 그 종류가 없는 컴포넌트에서는 no-op이었고, Button의 effect가 비면서 대상이 Tooltip으로
넘어가 조용히 통과하고 있었다.

## 2026-08-15 — 제품과의 격차 143건을 전부 판정했다

`product-parity` 게이트가 **초록이 됐다.** 205축 실측에서 나온 격차 143건이 전부 판정됐다는 뜻이다.

| | 건수 |
| --- | --- |
| 제품 값 채택 | **45** (그중 7건은 기계 대조) |
| 사유를 적은 의도적 편차 | **46** |
| 제품에 공용 정본이 없음 | **52** |

`gap` 0건. 이제 제품과의 차이는 전부 **기록된 결정**이다.

### Tooltip — 표면이 정반대였다

제품 tooltip은 **페이지와 반전된 면**이다. 라이트에서 어두운 면에 밝은 글자, 다크에서 그 반대.
DS는 `background-inset`을 써서 페이지와 같은 극성이었다. 정확히 반대로 만들어져 있었다.

Toast가 먼저 세운 `color-background-inverse`/`color-foreground-on-inverse`가 제품 tooltip 면과
**값이 정확히 같았다.** 토큰은 이미 있었고 tooltip이 다른 것을 쓰고 있었을 뿐이다.

**모션이 아예 걸리지 않고 있었다.** `animation-duration`과 `animation-timing-function`만 있고
`animation-name`이 없었다. 값만 적어 두고 실제로 도는지 확인하지 않은 것이다. 제품의 140ms /
`cubic-bezier(0.23, 1, 0.32, 1)` / scale 0.97을 채택하며 함께 고쳤다.

그 밖에 max-width 320, 1px 테두리, 테마별 그림자, 열림 지연 300ms를 채택했다. 22축 전부 판정.

### Menu / Popover — 면·간격·알파를 다 채택했다

제품의 공용 정본은 컴포넌트가 아니라 `--dropdown-*` 토큰이다. 패널 padding 6, 항목 사이 2,
항목 내부 6, 최소 폭 160, 라이트 면 neutral-100을 채택했다. 이전 DS는 padding이 action-menu 4 /
composite 8로 갈려 있었고 항목 사이 gap이 없어 **행이 붙어 있었다.**

- **테두리를 없앴다.** 제품처럼 헤어라인을 `box-shadow` 스프레드 0.5px로 그린다. 레이아웃 박스를
  늘리지 않으면서 1px보다 얇은 선이 된다.
- **hover를 알파 오버레이로 바꿨다.** 이전 DS는 불투명 `background-inset`이라 배경이 다른 자리에서
  면이 튀었다.
- **`danger` 전경을 `#ff4b59`로 바꿨다.** 이전 `status-danger-foreground`가 중립 표면 위에서 대비가
  무너지는 것은 규범이 이미 인정하던 결함이고, 제품 값 채택이 그것을 해소한다.

항목 높이 44px과 focus ring은 제품을 따르지 않았다. 제품은 37px에 focus ring이 없고 둘 다 WCAG
계약이다. 34축 전부 판정.

### 토큰 모델이 두 군데 넓어졌다

- **테마별 elevation.** `semantic.light/dark`에 elevation 축을 열었다. 기존 elevation은 global이라
  테마마다 그림자 색이 다른 것을 표현할 수 없었다. tooltip과 menu가 첫 소비자다.
- **Figma style에는 mode가 없다.** 그래서 테마별 elevation은 Light를 정본으로 삼고 다크 값은 CSS만
  갖는다. parity 계약이 그 사실을 명시적으로 담는다 — 이전에는 mode가 여럿일 때 어느 것을 쓰는지가
  우연에 달려 있었고 실제로 다크가 뽑혀 나왔다.

alpha primitive 13개, semantic 색 11개, spacing 3개, motion 4개, elevation 2개가 늘었다. Figma에도
같은 변수 186개와 style 23개가 서 있다.

## 2026-08-15 — primary를 제품 브랜드 블루로 되돌리고, 그 대가를 기록한다

Owner가 Figma의 Button을 보고 물었다 — "프라이머리 컬러가 왜 저래, 왤케 어둡냐. 내 실제 배포환경에서
진짜 저 컬러를 쓰고 있다고?" 세어 보니 아니었다.

| 단계 | 제품 사용 횟수 | 흰 글자 대비 |
| --- | --- | --- |
| `--primary-400` #38a4ff | 28 | 2.54 |
| `--primary-500` #0088ff | **30** | 3.37 |
| `--primary-700` #005fb3 | **2** | 6.12 |

DS는 사용 횟수 2회짜리 `blue.700`을 action 색으로 쓰고 있었다. **왜 그렇게 됐는지는 명확하다 —
대비 게이트다.** 제품 브랜드 블루로는 4.5를 넘길 수 없어서, 통과하는 가장 가까운 값까지 어두워진
것이다. 그런데 그 판단이 어디에도 Decision으로 기록돼 있지 않았다. `migration/token-mapping.md`에
"시각값이 다르다" 한 줄뿐이었다. **브랜드 색이 접근성 게이트 때문에 조용히 바뀐 상태였다.**

### 결정

Owner가 `blue.500`을 정본으로 택했다. 반단계(450/550 같은 것)는 쓰지 않는다.

- `color-action-primary` → `blue.500`
- `color-action-primary-hover` → `blue.400`. 제품이 hover에서 **밝아진다**(`filter: brightness(1.06)`).
  기존 DS는 어두워졌다 — 방향이 반대였다.
- `color-action-primary-pressed` → `blue.600`. hover가 밝아지므로 눌림은 어두워져 둘을 가른다.

제품의 3-stop 그라디언트는 채택하지 않는다. 그것은 노드 생성 FAB과 공유하는 면이고
(`--node-prompt-generate-gradient`), 버튼이 FAB의 면을 물려받은 구조다. DS는 flat으로 간다.

### 대가를 숨기지 않는다

`primary` 버튼은 이제 **WCAG 2.2 AA 미달**이다(3.37 < 4.5). 이 미달은 제품이 이미 갖고 있던 것이고
DS가 그것을 그대로 재현한다. 세 곳에 같은 사유를 남겼다.

- token source의 `contrastPairs[].note`
- [Button](../components/button.md)의 Known deviations
- axe 테스트의 허용 위반 목록

그리고 **기준을 낮추는 일이 다시는 조용히 일어나지 않도록** 게이트를 고쳤다.

- `minimum`이 4.5 미만인 contrast pair는 **`note`가 필수**다(20자 이상).
- 완화하지 않았는데 `note`를 붙이는 것도 막는다. 사유가 실제 완화와만 짝지어야 "note가 있으니
  괜찮다"는 오독이 안 생긴다.
- canary 2종이 매 실행에서 이 두 방향의 검출력을 증명한다.

axe 테스트도 지우지 않고 **알려진 위반만 고정**했다. `primary: ["color-contrast"]` 하나뿐이고,
새 위반이 생기면 여전히 실패한다. 테스트를 지웠다면 그 variant의 나머지 검출력까지 사라졌을 것이다.

### 토글이 hover에 지워지고 있었다

Icon Button을 Figma로 옮기려고 CSS 특정성을 실제로 계산하다가 찾았다. `[aria-pressed="true"]`는
(0,2,0)이고 `:hover[data-variant="primary"]`는 (0,3,0)이다. **켜진 토글에 포인터를 얹으면 배경이
variant 색으로 되돌아가고 글자만 pressed 색으로 남는다.** 실측으로 확인했다 — bg가 #38a4ff,
fg가 foreground-primary.

지속 상태를 일시적 상태가 덮는 것이고 [Interaction states](../foundations/interaction-states.md)가
금지하는 것이다. hover/active 규칙에서 pressed를 제외해 고치고 acceptance test로 고정했다.

### Icon Button이 Figma에 섰다

40 variant(Variant 4 × Size 2 × State 5). 한 변 40/32가 기하 계약으로 묶여 있고, `State`는
`Default/Hover/Active/Pressed/Disabled`다 — Icon Button이 `active`와 `pressed`를 **둘 다** 갖는
첫 컴포넌트다.

**글리프 색 문제를 한 번 잘못 판단했다가 고쳤다.** 처음에는 "Figma에 currentColor가 없고 instance
내부를 플러그인 API로 못 바꾼다"고 결론내고 Known deviation으로 적으려 했다. 실제로는 **숨겨진
instance라서** 내용이 로드되지 않았던 것이고, 보이는 instance는 내부 vector에 접근된다. 글리프
stroke를 variant마다 올바른 전경 토큰에 다시 묶었다(IconButton 40 + Button 80 = 120개).

### manifest가 Figma 이름을 갖는다

`name`은 사람이 읽는 표시 이름이라 `Dialog / Confirm Modal` 같은 값이 들어 있다. Figma에서 슬래시는
**폴더 구분자**라 component set 이름이 쪼개진다. `figmaName`을 별도 필드로 두고 schema가 대문자
시작 PascalCase만 허용한다.

### Baseline 갱신 (DS-GOV-001)

분류별 diff는 breaking 4종 — `value`/`rawValue`/`aliasTarget` 각 6건(토큰 3개 × 모드 2개)과
`contrastPairs` 1건이다. `removal`은 0이고 의도하지 않은 항목은 없다. 공개 release와 published
library가 없어 baseline 복사로 처리했다.

## 2026-08-15 — Figma의 Button이 코드와 2px 어긋나 있었다

사용자가 "피그마에 만들어둔 버튼은 뭐냐"고 물어 열어 봤고, **틀려 있었다.**

| | Figma | 코드 실측 | 차이 |
| --- | --- | --- | --- |
| md Default | 59×**37** | 59.875×**39** | 높이 −2 |
| sm Default | 46×**26** | 47.031×**28** | 높이 −2 |
| md Loading | **79**×37 | **85.875**×39 | 폭 −6.9 |
| sm Loading | **66**×26 | **71.031**×28 | 폭 −5.0 |

### 왜 2px인가

`button.css`의 `border: 1px solid transparent`를 빼고 padding과 line-height만으로 프레임을 잡았다.
위아래 1px씩이 통째로 빠졌다. 올바른 매핑은 **Figma padding = CSS padding + border, stroke는
INSIDE**다. 그러면 프레임 높이가 CSS와 같아지고 1px 테두리는 padding 안에 앉는다.

### 왜 아무도 못 잡았나

parity 게이트가 **variant 이름과 "paint가 변수에 바인딩됐는가"만** 봤다. 치수도 구조도 코드와
대조하지 않았다. 프로젝트 카드 때와 같은 구멍이다 — 게이트가 없는 곳에서 그럴듯한 것을 만들었다.

그래서 양방향 계약을 세웠다.

- [`figma/components.measured.json`](../../figma/components.measured.json) — 실브라우저로 잰
  구조값. 총 폭은 넣지 않는다. 라벨 폭은 폰트 렌더링에 달려 있어 브라우저와 Figma가 원래 다르고,
  그 차이를 실패로 읽으면 게이트를 끄게 된다.
- `packages/react/test/component-geometry.browser.test.tsx` — **코드가 여전히 그 값을 만드는지.**
- parity 게이트 — **Figma가 그 값과 같은지.** 변조 canary 6종을 붙였다(높이, padding, 슬롯 크기,
  variant 간 분기, 코드 prop 대응 property 삭제, description 삭제).

한 방향만 걸면 "Figma와 measured는 서로 맞고 둘 다 코드와 틀린" 상태로 통과한다.

### 여기서 찾은 코드 결함

`.kds-button__icon`에 크기가 없어 **호출부가 넘긴 아이콘 크기가 그대로 버튼 높이가 됐다.** sm
버튼에 기본(20px) 아이콘을 넣으면 높이가 28이 아니라 **30**이 되고, 같은 줄의 버튼들이 아이콘
유무로 어긋난다. 높이가 호출부에 따라 달라지는 것은 컨트롤이 아니므로 슬롯을 md 20 / sm 16으로
Button이 소유하게 하고 글리프를 슬롯에 맞췄다. Iconography의 "글리프 크기는 아이콘이 소유한다"에
대한 의도적 예외이며 사유는 Button 규범의 Known deviations에 있다.

이것도 새 기하 테스트가 잡았다. 규범에 없던 `## Specification` 절도 함께 세웠다 — 없어서 아이콘
크기가 규정되지 않았고 기본값이 새어 들어왔다.

### 상태 어휘가 충돌하고 있었다

Figma의 `State=Pressed`는 `:active`(누르는 중)인데 Icon Button 규범의 `pressed`는
`aria-pressed`(토글 켜짐)였다. 같은 단어가 두 컴포넌트에서 다른 것을 가리켰고, 그대로 두면 남은
다섯 component set에 전부 번진다.

[Interaction states](../foundations/interaction-states.md)를 세워 정본으로 삼았다. 규칙은 하나다 —
**이름을 웹 플랫폼에서 가져온다.** `:active`가 있는 쪽이 `active`, `aria-pressed`가 있는 쪽이
`pressed`다. 그러면 "이 이름이 무슨 뜻인가"를 이 저장소가 아니라 플랫폼 명세가 답한다. Button의
Figma option을 `Active`로 고쳤다.

### Figma Button을 다시 만들었다

40 variant를 지우고 다시 지었다(Templates의 Button instance는 0개라 안전했다). 달라진 것.

- 프레임 높이가 md 39 / sm 28로 코드와 같다.
- `State`가 `Default, Hover, Active, Disabled, Loading`이다.
- **아이콘 슬롯이 생겼다.** 코드에 `leftIcon`/`rightIcon`이 있는데 Figma에는 없었다.
  `LeftIcon`/`RightIcon` boolean과 `LeftIconGlyph`/`RightIconGlyph` instance swap을 붙였고, 슬롯
  크기는 md 20 / sm 16이며 켜도 높이가 변하지 않는 것을 확인했다.
- description에 기하 매핑과 **표현하지 못하는 것**을 적었다: `:active`의 scale 0.98(프레임 크기를
  바꾸면 기하 계약이 깨진다), danger의 hover 면 변화(CSS에 없다 — `color-action-danger*` 대기).

`INSTANCE_SWAP` property의 기본값은 component key가 아니라 **node id**를 받는다. key를 주면
`Property value is incompatible with component property type`으로 거부한다. 세 형태를 실제로
시도해 확인했다.

## 2026-08-15 — 인계서를 실제 상태에 맞춘다

**규범이 아니라 사실 정정이다.** [인계서](../governance/execution-handoff.md)의 다음 포인터가
2026-08-14 이후 갱신되지 않아, 그 사이 커밋 다섯 개가 만든 상태를 담지 못했다. 큐가 정본인데 정본이
실제와 어긋나 있었다.

무엇이 틀려 있었나.

- `DS-P3-013`(아이콘)이 "여전히 0개"라고 적혀 있었다. 실제로는 글리프 26개가 React·Figma 양쪽에
  서 있고 게이트가 positive 6 + canary 20종이다. `done`으로 고쳤다.
- Icon Button·Tooltip·Toast가 큐 어디에도 없었다. 셋 다 Web `partial`이고 docs `done`이다.
  `DS-P3-009`에 gap registry 순위표로 넣었다.
- `DS-F-007-home`이 수행됐다는 기록이 없었다. gap 72건과 그 판정을 항목에 적었다.
- `DS-F-006`은 Button만 있고 나머지가 열려 있다는 사실이 드러나지 않았다.

**앞질러 간 의존성을 감추지 않고 적었다.** `DS-P3-009`는 문서상 `DS-P3-008`(RC 패키징) 의존이지만
Icon Button·Tooltip·Toast를 그보다 먼저 구현했다. RC는 "무엇을 먼저 만들 것인가"의 입력이 아니고,
DS-P3-009a 인벤토리와 Home 재조립이 그 근거를 실측으로 냈기 때문이다. 완료 조건은 약화하지 않았다.
Icon Button이 원래 목록(Input, Select, Tooltip, Toast, Empty State)에 없던 항목이라는 것도 함께 적었다.

계획 밖에서 들어온 토큰도 기록했다. `icon-size-*`, `layout-control-height-*`, `radius-control-sm`,
`color-background-inverse`/`color-foreground-on-inverse`는 `DS-P3-014`의 10개 단위 바깥에서
component가 요구해 들어왔다. 각각 규범·Figma 변수·snapshot까지 같은 변경 단위에서 반영했으므로
누락은 없으나 단위 6·7의 잔여 범위는 다시 세어야 한다.

### 다음 포인터

`DS-F-006`의 나머지 component set 다섯이다. Web에 여섯이 서 있는데 Figma에는 Button 하나뿐이고,
목표 B는 Figma component로만 재조립하는 것이므로 **코드와 Figma의 격차가 지금 목표 B의 단일
병목**이다. 순서는 gap registry를 따른다.

## 2026-08-15 — Toast

gap registry 3순위다. 세 화면 실측에서 **20개 파일이 toast를 쓰는데 공용 컴포넌트가 없었고**, 같은
정의가 `appHomeSceneStyles.ts`와 `highlightSceneStyles.ts`에 최소 2벌 중복돼 있었다.

### Added

- [Toast](../components/toast.md) 규범과 `ToastProvider` / `useToast` public export
- `packages/css/src/component/toast.css`
- `--kds-color-background-inverse`와 `--kds-color-foreground-on-inverse`. Toast가 첫 소비자이며
  contrast pair로 등록해 두 모드 모두 게이트가 잰다(light 11.61, dark 13.59). Figma 변수로도
  함께 만들었다.
- Storybook `Components/Toast` story 5종

### 기존 `color-foreground-inverse`를 쓸 수 없었던 이유

이름이 비슷해 헷갈리기 쉽다. `color-foreground-inverse`는 **두 모드 모두 `neutral-0`**이다 —
`action-primary` 같은 진한 표면 위 텍스트를 위한 것이다. Toast의 표면은 다크에서 오히려 **밝아지는**
반전 표면이므로 그 위에 흰 글자를 얹으면 읽히지 않는다. 그래서 모드에 따라 뒤집히는 쌍을 새로 만들었다.

### Baseline 갱신 (DS-GOV-001)

`contrastPairs` 배열 변경은 diff 정책상 **무조건 breaking**이다 — 배열 전체를 한 단위로 비교하므로
추가와 제거를 구분하지 않는다. 이번 변경의 분류별 diff는 additive 10건, breaking은 `contrastPairs`
1건뿐이며 그 내용은 `color-background-inverse` / `color-foreground-on-inverse` 쌍 **추가 1, 제거 0**이다.

정책을 느슨하게 고치지 않고 [Releases](../governance/releases.md)의 DS-GOV-001 절차를 따랐다.
분류를 "추가는 non-breaking"으로 바꾸면 게이트가 앞으로 **보증 철회를 놓칠 위험**이 생기고, 그것이
이 게이트의 존재 이유다. 공개 package release와 published Figma library가 아직 없어 소비자가 없으므로
baseline 복사로 처리했다.

### 계약

- **놓쳐도 되는 것만 담는다.** 확인이나 선택이 필요하면 Dialog이고, 반드시 읽어야 하면 화면에
  자리를 준다. 폼 오류는 해당 필드 옆이다 — 화면 반대편에서 사라지는 알림으로는 어디를 고칠지 모른다.
- **`message`는 `ReactNode`가 아니라 string이다.** live region은 텍스트를 읽는다. 요소를 넣으면
  보조 기술이 읽는 내용과 화면에 보이는 것이 갈린다.
- **live region 둘을 처음부터 렌더한다.** 보조 기술은 region이 존재한 뒤의 변화만 감지하므로,
  toast가 생길 때 region을 함께 만들면 **첫 메시지가 읽히지 않는다.** polite와 assertive를 별도
  region에 두는 것도 같은 이유다 — 한 region의 `aria-live`를 바꾸면 그 시점의 변경이 유실된다.
- **닫기 버튼을 두지 않는다.** 대신 포인터·focus로 타이머가 멈춘다. 닫기 버튼은 focus 순서에
  끼어들고, 사라지는 대상에 focus를 두면 focus가 소실된다.
- **멈췄다 풀리면 남은 시간부터 흐른다.** 처음부터 다시 세면 읽으려고 얹어 둔 것이 벌이 된다.
- **대기 중인 toast는 자기 차례가 와야 시계가 시작된다.** 상한 3개를 넘긴 것이 보이지 않는 동안
  소멸하면, 사용자는 뜬 적 없는 알림을 놓친 것이 된다.

### overlay primitive를 쓰지 않는다

Menu·Dialog·Tooltip과 달리 toast는 anchor가 없고 focus를 가져가지 않으며 바깥 클릭과 무관하다 —
positioner·focus scope·dismissable layer 중 해당하는 것이 하나도 없다. 붙이면 없는 문제를 위해
배경을 잠그게 되므로 Provider가 자기 viewport를 소유한다. 대신 viewport가 **비어 있을 때 포인터를
가로채지 않는다**는 점을 테스트로 고정했다. 화면 하단을 덮는 투명한 판이 되면 그 아래 컨트롤이
눌리지 않는다.

### Known deviations

제품과 셋이 다르다. 제품의 `backdrop-filter: blur(10px)`은 DS에 backdrop blur effect가 없어 불투명
반전 표면으로 대체했다. 제품의 **단일 슬롯 교체**(새 메시지가 이전 것을 지움)는 자동 소멸과 겹치면
읽기 전에 사라지므로 스택으로 바꿨다. **퇴장 전환은 넣지 않았다** — `animationend`로 걸면 그 이벤트가
오지 않는 경우 사라지지 않고 남는다. 전환보다 반드시 사라지는 것이 우선이다. 실행 취소 액션과 Figma
component set은 남아 있다.

## 2026-08-15 — Tooltip

gap registry 2순위다. 세 화면 실측에서 **22개 파일이 tooltip을 쓰는데 공용 컴포넌트가 없었다** —
제품 자신의 Button(17개 파일)보다 넓게 쓰인다.

### Added

- [Tooltip](../components/tooltip.md) 규범과 `Tooltip` public export
- `packages/css/src/component/tooltip.css`
- `--kds-radius-control-sm`(8px). gap registry가 지적한 **"가장 많이 쓰이는 radius에 semantic 이름이
  없다"**의 해소이며 Tooltip이 첫 소비자다. Figma 변수로도 함께 만들었다.
- Storybook `Components/Tooltip` story 5종

### 계약

- **이름이 아니라 설명이다.** 표면은 `role="tooltip"`이고 trigger는 `aria-describedby`로 가리킨다.
  `aria-labelledby`가 아니다. trigger는 자기 이름을 스스로 가져야 하며, tooltip이 이름의 유일한
  출처가 되면 포인터 없는 사용자에게 이름이 없다.
- **열 때만 지연하고 닫을 때는 즉시**다. 포인터가 떠났는데 설명이 남으면 어느 컨트롤의 설명인지
  알 수 없다. 키보드 focus는 지연 없이 연다 — 지연은 지나가는 포인터를 거르기 위한 것이고 focus는
  의도된 이동이다.
- **표면이 포인터 이벤트를 받지 않는다.** 받으면 표면 위로 포인터가 옮겨갔을 때 trigger가 이탈로
  판정돼 깜빡인다. 깜빡임의 원인이 표면 자신이 되는 구조다.
- **터치에는 열리지 않는다.** hover가 없고 길게 누르기는 컨텍스트 메뉴와 충돌한다.
- **trigger를 감싸지 않는다.** `cloneElement`로 속성만 붙인다. 래퍼를 두면 호출부의 flex/grid
  계산이 조용히 달라진다. 이것도 테스트로 고정했다.
- **anchor 간격을 자체 숫자로 갖지 않는다.** overlay 표면 CSS가 소유하고 Provider가 1회 측정한
  값을 쓴다. 처음 구현에서 이 값을 넘기지 않아 **간격이 0으로 붙어 있었고**, 브라우저 실측으로
  잡아 고친 뒤 테스트로 고정했다.

### primitive 소비자가 셋이 됐다

overlay primitive에서 **위치 계산과 portal만** 쓴다. focus scope·inert·scroll lock·dismissable
layer는 쓰지 않는다 — tooltip은 focus를 가져가지 않고 바깥 클릭을 삼키지도 않으므로, 붙이면 없는
문제를 위해 배경을 잠그게 된다. DS-D-0011의 소비자가 Menu·Dialog에 이어 셋이 된다.

### Known deviations

그룹 지연 건너뛰기(인접 trigger로 옮길 때 지연 생략), arrow, Figma component set이 없다. 열림
모션은 제품의 140ms 대신 DS `overlay-enter` 200ms를 썼다 — 제품 값을 들이려면 motion 토큰 추가가
선행이다.

## 2026-08-15 — Icon Button

gap registry 1순위를 구현했다. 세 화면 실측에서 raw `<button>` 108개 중 다수가 아이콘 전용이었고,
제품에는 이것을 담당하는 공용 컴포넌트가 없다.

### 왜 Button의 prop이 아닌가

**실측이 정했다.** `Button`을 아이콘 전용으로 렌더하면 md 54×38, sm 46×30으로 **정사각이 되지
않는다** — 빈 라벨과의 `gap` 8px과 좌우 padding이 남는다.

기하보다 결정적인 것은 접근성 계약이다. Button은 이름이 children에서 오므로 `label`을 필수로 만들
수 없지만, 아이콘 전용 버튼은 라벨이 없으면 **이름이 아예 없는 버튼**이 된다. "children이 비었을
때만 필수"는 타입으로 표현할 수 없다. `IconButton`은 `label`을 필수 prop으로 강제한다.

그 실측을 **테스트로 고정했다.** Button의 기하가 바뀌면 그 테스트가 실패하고, 그때 이 결정의
근거를 다시 판정해야 한다.

### Added

- [Icon Button](../components/icon-button.md) 규범과 `IconButton` public export
- `packages/css/src/component/icon-button.css`
- 컨트롤 높이 토큰 — `--kds-layout-control-height-md`(40) · `--kds-layout-control-height-sm`(32).
  gap registry가 지적한 "컨트롤 높이 토큰 없음"의 첫 해소이며, Figma 변수로도 함께 만들었다.
- Storybook `Components/Icon Button` story 5종. `WhyNotButton`은 두 컴포넌트를 나란히 두어
  정사각 차이를 눈으로 보게 한다.

### 계약

- **크기를 padding이 아니라 한 변의 길이로 정한다.** Button은 고정 높이가 없어 라벨·번역·확대에
  따라 자라지만, Icon Button은 정사각이 계약이므로 높이를 직접 소유한다.
- **히트 영역은 시각 크기와 분리된다.** 컴포넌트가 `.kds-hit-target`을 직접 붙여, sm이 32×32로
  보여도 실제 히트는 44×44다. 호출부가 감쌀 필요가 없다.
- **`pressed`는 토글에만.** 주지 않으면 `aria-pressed` 속성 자체가 붙지 않는다 — `false`를 늘
  붙이면 토글이 아닌 버튼이 보조 기술에 토글로 노출된다. 실브라우저에서 확인했다: Matrix story의
  11개 중 토글 2개에만 속성이 있고 나머지 9개는 `null`이다.
- **`pressed`와 `active`는 다른 축이다.** `active`는 누르고 있는 동안, `pressed`는 토글의 켜짐
  상태다. 같은 시각으로 표현하면 눌린 것인지 켜진 것인지 구분되지 않는다.
- 글리프는 두 size에서 모두 20px이다. 아이콘은 컨테이너와 독립이다(Iconography Size model).

### Known deviations

`loading` 상태가 없다 — 아이콘 자리에 무엇을 넣을지, Button의 loading과 같은 축인지 미정이다.
Figma component set도 아직 없다(DS-F-006 대상).

## 2026-08-15 — 세 화면 gap 합산과 카탈로그 순서

Highlight(허브·상세)와 Editor(허브·워크스페이스)를 추가로 실측해 Home과 합산했다. gap은 Home 72 ·
Highlight 130 · Editor 144다. 산출물은
[figma-gap-registry.md](../../migration/figma-gap-registry.md)다.

### 이 실측의 결론 하나

**제품에는 공용 컴포넌트 층이 사실상 없다.** 제품의 공용 UI 디렉터리는 파일 10개이고 그중 시각
컴포넌트는 넷뿐이다 — Button · VideoPlayer · InlineLoadingLabel · LoadingSpinner. 나머지는 브랜드
마크와 훅이다. 경로와 줄번호는 [gap registry](../../migration/figma-gap-registry.md)가 소유한다. 그래서 Klipse Design은 제품을 따라잡는 것이 아니라 **제품에 없던 층을 처음 만드는**
것이다. 실측이 찾은 중복 정의(ProjectCard 3벌, Menu 서피스 3벌, Spinner 5종, PaneDivider 6선언)는
전부 그 부재의 비용이다.

### 가장 강한 단일 신호 — 버튼 공용 사용률 6%

네 파일의 버튼을 직접 셌다. raw `<button>` **108개** vs 공용 `<Button>` **8개**. 제품에 Button이
있는데도 94%가 손으로 만들어진다. Button 하나로는 덮이지 않는다는 뜻이고, 빠진 축은 아이콘 전용
버튼·크기 단계·loading 상태다.

### 순서가 바뀌었다

Home만 봤을 때의 1순위는 ProjectCard였으나, 세 화면을 합치니 **IconButton · Tooltip · Toast**가
앞선다. Tooltip은 22개 파일, Toast는 20개 파일에 나타나는데 **제품 자신의 Button(17개 파일)보다
넓게 쓰이면서 공용 컴포넌트가 없다.** 한 화면만 보고 순서를 정했으면 틀렸을 자리다.

### 토큰 — 세 화면이 함께 요구하는 것

- **`radius-8`에 semantic 이름이 없다.** 에디터에서 가장 많이 쓰이는 radius다(직접 센 분포:
  8이 28회로 최다, 12가 20회, 999·6이 각 11회). Klipse semantic radius 5종에 8이 없다.
- **범주형 색 팔레트가 없다.** 에디터는 클립을 소스별로 색 구분한다(sky 63 · pink 19 · red 16 ·
  mint 13 · amber 12 · yellow 2). Klipse에는 status 4종뿐이다.
- **컨트롤 높이 토큰이 없다.** 에디터에 22/28/30/32/36/40/44/48 여덟 단계가 돈다.

### 실측 방법에서 배운 것

검증 단계에서 10건이 `confirmed=false`로 나왔는데, 읽어 보니 **전부 "gap 자체는 실재한다"고
확인하면서 세부 수치가 달라 false가 된 것**이었다. 판정 기준을 "하나라도 틀리면 false"로 준 탓에
"gap이 없다"와 "숫자가 틀리다"가 뭉개졌다. 그대로 읽었으면 IconButton·Slider·ProjectCard를 통째로
버릴 뻔했다. **그래서 이 registry의 수치는 직접 다시 센 값만 썼다.**

## 2026-08-15 — Home 재조립 검증과 gap registry

DS-F-007의 첫 화면. 앱 홈(`/archive`)을 Klipse Design 자산만으로 Figma에서 재조립해 **무엇이
없는지**를 측정했다. 산출물은 [figma-gap-registry.md](../../migration/figma-gap-registry.md)와
Templates 페이지의 coverage 프레임이다.

### 판정 — Home은 아직 gap 없이 재조립되지 않는다

제품 화면을 축 4개로 실측해 **321건을 측정하고 gap 72건**을 찾았다. Figma에 있는 것은 Button
component set 하나와 아이콘 26개뿐이라, 화면이 요구하는 ProjectCard · SidebarNavItem ·
AppTopBar · Menu · EmptyState · Avatar · Badge · BannerCarousel이 전부 없다.

그래서 이 단계의 재조립은 **픽셀 재현이 아니라 coverage 측정**이다. Templates의 프레임은
자홍색 파선으로 raw 영역을 드러내며, 그 파선이 화면 대부분을 차지한다는 사실 자체가 판정이다.

```
DS 자산에서 온 instance   7
gap 영역                  8
변수에 바인딩된 paint     46   (raw 7은 gap 표시선 자체)
```

### 토큰 — 이름만 보고 집으면 화면이 달라지는 것 둘

- **`radius-card` 20px ↔ 제품 카드 16px.** 프로젝트 카드·썸네일·배너·메인 카드·토스트가 전부
  16px인데 DS의 `radius-card`는 20px이고, 16px과 맞는 것은 `radius-overlay`다. 게다가
  `radius-card`의 유일한 소비처는 dialog의 sheet variant다 — **"카드"라는 이름의 토큰을 정작
  카드가 쓰지 않는다.**
- **`layout-project-card-minimum` 240px에 소비처가 없다.** DS는 `minmax(240px, 1fr)` auto-fill을
  전제하지만 제품은 minmax를 아예 쓰지 않고 브레이크포인트로 **열 수를 고정**한다
  (2 / 3@720 / 4@1200 / 5@1800). `packages/css` 어디서도 참조되지 않으며 규범 문서에서만 언급된다 —
  **존재하지 않는 알고리즘을 기술하는 토큰이다.**

둘 다 판정이 필요하다. DS를 제품에 맞출지, 제품 migration을 기록할지는 owner의 결정이다.

### 그 밖에 확인된 divergence

- 라이트 팔레트가 앱 셸 스코프(`body:has(.gnb-wrapperSidebar)`)에서 통째로 재정의된다. 캔버스가
  `#eeeef1`, 표면이 `#f8f8f9`로 DS의 `#f1f1f3` / `#fafafa`와 다르다. **다크는 정확히 일치한다.**
- 카드 테두리가 border가 아니라 spread-only 0.5px box-shadow다. DS `elevation/*` 4종은 전부 blur가
  있어 재현할 수 없다.
- `magic-wand`는 사이드바 "비디오 에디터"의 실사용 아이콘인데 −45° 회전 때문에 이관을 보류했다.
  이 화면이 실사용처이므로 처분 판단이 필요하다.

### 제품 부채로 분류한 것

DS가 고칠 문제가 아니라 adoption 노트로 넘긴다. 삭제 모달의 액션이 공용 Button을 쓰지 않고,
primary 버튼이 3-stop 그라디언트이며, z-index 체계가 DS layer 토큰과 다르고, 렌더되지 않는 죽은
스타일이 남아 있다. `--app-gnb-main-card-padding-block-start: 20px`은 선언만 있고 아무도 읽지
않으므로 **문서만 보고 20px을 넣으면 틀린다.**

## 2026-08-14 — Iconography 규범과 아이콘 파이프라인

### Added

- [Iconography](../foundations/iconography.md) foundation과
  [DS-D-0008](../governance/decisions/DS-D-0008-icon-source.md) — 아이콘 정본 구조 결정
- 크기 토큰 `--kds-icon-size-{sm,md,lg}` = 16 / 20 / 24px, `packages/css/src/component/icon.css`
- `scripts/build-icons.mjs`와 `scripts/verify-icon-gates.mjs`(변조 canary 11종)
- 정본 글리프 **26개** — Phosphor 21 · Iconoir 3 · Lucide 2
- `packages/react/THIRD-PARTY-NOTICES.md` — upstream 라이선스 원문을 생성으로 동봉한다

### 이관 방식과 그 근거

**정본은 제품 사본이 아니라 upstream 원본에서 만들었다.** 제품 자산은 Figma를 거치며 arc가 cubic으로
평탄화되고 색이 하드코딩돼, 정본으로 삼으면 "왜 좌표가 upstream과 다른가"를 영원히 설명해야 한다.

Phosphor는 256 격자 stroke 16이고 Klipse는 24 격자 stroke 1.5다. `24/256 = 3/32`이고 분모가 2⁵이라
모든 결과가 **유한소수이자 IEEE754에 정확히 표현되는 값**이다 — 0~256 정수 전 구간을 대조해 오차 0을
확인했다. 획 비율도 `16/256`과 `1.5/24`가 똑같이 `1/16`이라, 좌표와 같은 인자로 곱한 획이 계약값에
정확히 떨어진다.

**변환 결과를 픽셀로 검증했다.** upstream과 정본을 같은 뷰포트에 256px로 그려 대조한 결과 27개 중
24개가 완전 일치, 1개가 0.002%(안티에일리어싱)였다. 나머지 2개는 Lucide의 `copy`/`copy-check`로,
잉크비가 정확히 `1.5/2 = 0.75`다 — 계약에 맞춘 두께 변경 외에 달라진 것이 없다는 뜻이다.

### Wave B 판정 — 제품 자산과 대조

Phosphor 이름을 가졌으나 출처가 미확정이던 7개를 제품 자산과 픽셀 대조했다.

| 결과 | 글리프 | 근거 |
| --- | --- | --- |
| Wave A로 승격 | `arrow-up` `download-simple` `trash-simple` | 제품 자산과 **픽셀 완전 일치**. 출처 Phosphor 확정 |
| Wave B 유지 | `lightbulb`(22.5%) `caret-double-right`(19.3%) | 잉크량은 같으나 배치가 다르다 — 같은 글리프가 아니다 |
| Wave B 유지 | `align-left-simple` `align-right-simple`(14.9%) | 잉크비 0.512. 제품 쪽이 채움 도형이다 |

### 이번 범위에서 제외

- **`magic-wand`.** 지팡이 몸통이 −45° 회전한 둥근 사각형이라 `transform` 없이는 표현되지 않는다.
  회전을 path로 굽는 것은 좌표를 옮기는 것이 아니라 **새로 그리는 것**이라 이관이 아니다. 계약에
  `transform`을 여는 것과 다시 그리는 것 중 무엇을 택할지는 별도 판단으로 남긴다.
- `x-circle`은 제품이 Fill 변종을 썼으나 정본은 regular를 채택했다. 세트가 1.5 획으로 통일돼야
  시각 언어가 갈리지 않는다. 외형이 바뀌므로 owner 확인이 필요하다.

### Changed — 규범

- **provenance 없는 글리프는 채택되지 않는다.** `origin`이 `original`이 아니면 프로젝트·아이콘
  이름·라이선스·라이선스 파일·출처 URL·취득일을 전부 갖춰야 하고, 빈 값과 `"unknown"`은 빌드
  실패다. 추정 출처를 사실로 승격시키는 경로를 규범에서 없앤다.
- **upstream 글리프는 고지문과 함께만 배포한다.** MIT와 ISC가 공통으로 요구하는 "copies에 고지를
  포함한다"를 사람의 기억이 아니라 생성기가 이행한다. 고지문 없이 배포하는 경로는 존재하지 않는다.
- **정본은 정규화된 형태로만 커밋한다** — viewBox `0 0 24 24`, `stroke-width` 1.5 하나, 색은
  `currentColor`와 `fill="none"`만, `id`/`clip-path` 금지. 좌표 스케일 변환은 이관 시 한 번만 한다.
- 아이콘의 기본값은 **장식**이다. `label`을 주지 않으면 `aria-hidden="true"`가 된다. 아이콘 전용
  버튼의 이름은 버튼이 소유하므로 아이콘에 `label`을 주지 않는다.
- **서브패스 `@klipse-design/react/icons`를 열었다.** Wave A 전체가 게이트를 통과한 뒤였고,
  `verify-gates`의 react 계약과 브라우저 테스트가 모두 공개 경로를 쓴다. 제거는 breaking이므로
  글리프 이름과 심볼은 이제 공개 계약이다. `files`에 `THIRD-PARTY-NOTICES.md`가 포함돼, 패키지를
  받는 쪽이 라이선스 원문을 함께 받는다.
- Storybook에 `Foundations/Iconography` story 4종을 추가했다 — Overview·Sizes·InheritsColor·
  InButton. **실루엣 정확성은 게이트가 판정하지 못한다**고 규범이 선언한 그 공백을 메우는 자리다.

### 외형이 바뀌는 것 — owner 확인이 필요하다

| 글리프 | 무엇이 바뀌나 | 왜 |
| --- | --- | --- |
| `eye-slash` | 채운 동공 → **감은 눈** | 제품의 `eyeslash.svg`에는 **빗금이 없다.** `eye`와 같은 눈꺼풀 호에 동공만 채운 것이고, 채운 동공은 "숨김"이 아니라 오히려 "더 보임"으로 읽힌다. 제품 호출부 17곳 |
| `x-circle` | Fill 변종 → regular | 세트가 1.5 획으로 통일돼야 시각 언어가 갈리지 않는다 |
| `text` | 획 2 → 1.5 | 24 격자 계약. 잉크량 0.75 |

### 적대적 감사가 찾은 파서 결함

파이프라인을 세운 직후 **통과시켜서는 안 될 입력**으로 게이트를 공격했고, 위음성이 나왔다.

- **작은따옴표로 쓴 요소가 조용히 사라졌다.** `<path id='x' stroke='#ff0000' stroke-width='9'/>`가
  게이트를 통과하면서 **동시에 생성물에서 빠졌다.** 파서가 큰따옴표 형태만 인식했고, 못 읽은 것을
  거부가 아니라 무시로 처리했기 때문이다. 계약 위반이 통과하는 것도 나쁘지만, 파이프라인이
  디자이너가 그린 것을 말없이 바꾸는 쪽이 더 나쁘다.
- 고침은 두 갈래다. XML에서 두 따옴표는 동등하므로 **둘 다 받고**, 그와 별개로 **본 태그 수와
  처리한 태그 수가 일치하는지** 검사한다. 앞으로 어떤 문법 변종이 나와도 "못 봤다"가 "통과"가
  되지 않는다.
- 같이 막은 것들: root `<svg>`에 표현 속성 주입, `"Unknown"` 대소문자 우회, `modifications` 누락,
  provenance 문자열로 고지문 절 구조 위조, `"https://"` 한 줄짜리 sourceUrl, 이름이 다른 두
  글리프가 같은 심볼로 방출(`x-2`와 `x2`), 같은 그림을 두 이름으로 두어 고지 의무 가리기.
- canary가 11종에서 **20종**이 됐다. 게이트와 모델이 각자 들고 있던 필수 필드 목록도 하나로 합쳤다 —
  두 벌이면 한쪽에 필드를 더할 때 다른 쪽이 조용히 뒤처진다.

### 게이트 강화 둘 — 아이콘과 무관하게 적용된다

- **`verify-figma-parity`의 변조 canary가 실패 상태에서도 돈다.** 이전에는 `failures.length === 0`일
  때만 돌아서, parity가 깨진 동안 검출력 증명 7종이 통째로 멈췄다. 게이트가 가장 못 미더운 시점에
  게이트의 보증이 사라지는 순서였다. 판정을 "변조가 baseline에 없던 실패를 새로 만드는가"로 바꿨다.
- **`build-css`가 존재하지 않는 토큰 참조를 잡는다.** CSS는 정의되지 않은 커스텀 속성을 오류로
  만들지 않고 그 선언만 무효로 만들어서, 오타가 "그 규칙을 안 썼을 때"와 구분되지 않았다.

### Figma — `icon/*` component 26개

draft 라이브러리 파일에 정본에서 생성한 component 26개를 만들었다. `icon/{kebab}` 개별
component이고 **크기 variant를 두지 않는다** — 두면 코드의 `IconSize`와 Figma variant가 두 정본이
되어 4px 격자를 누가 소유하는지 모호해진다.

- 전부 24×24, stroke 두께 1.5, cap ROUND. **raw stroke 0 / raw fill 0**으로 DS-F-006의 "raw 값 0"을
  만족한다. Figma에는 `currentColor`가 없어 전부 `color/foreground-primary`에 바인딩했다.
- `createNodeFromSvg`가 프레임에 **흰색 fill을 붙인다.** 그대로 두면 raw 값이 하나 생기므로
  생성 직후 지운다. 실측으로 확인한 동작이다.
- parity가 **요소 분해 보존**을 대조한다 — 코드 `elementCount` ↔ Figma `vectors`. 26개 전부
  일치했다. 좌표까지 대조하지 않는 이유는 Figma vector 왕복 손실을 아직 실측하지 않았기
  때문이고, 도형이 병합되거나 사라지는 사고는 좌표를 보지 않아도 이것으로 드러난다.
- parity canary가 7종에서 **11종**이 됐다(아이콘 제거·frame 변조·raw paint·요소 수). canary 수는
  이제 tamper 배열에서 파생돼 목록과 어긋날 수 없다.
- `figma-sync.md`에 되읽기 규칙 둘을 추가했다. **페이지를 명시적으로 전환한 뒤 세지 않으면
  component가 조용히 0개로 나온다** — 실제로 겪은 사고이고, 덤프가 "없음"과 "안 봄"을 구분하지
  못하는 형태다.

publish는 여전히 `not-ready`다. publish API가 존재하지 않으므로 owner가 Figma UI에서 수동으로
해야 하며, 그 전에는 어떤 상태도 올리지 않는다.

### Added — Figma snapshot 재생성 경로

`.prettierignore`는 snapshot이 "dump가 쓰는 것"이라고 선언했지만 그 dump가 없었다.
`figma/readback.json`(Plugin API 되읽기 원본)과 `scripts/build-figma-snapshot.mjs`(projection과 drift
검사)로 나누고 재생성 절차를 스크립트 헤더에 담았다. `pnpm verify`가 둘의 일치를 강제한다.

### Known deviations

- 글리프의 **실루엣 정확성은 게이트가 판정할 수 없다.** 정규화·해시·이름·고지는 기계가 잡지만
  "이 그림이 맞는가"는 사람의 시각 review다.
- Wave B 14개는 좌표 대조로 upstream을 특정하지 못했다. 재작도하거나 채택하지 않는다.

## 2026-08-14 — Dialog 공개

### Added

- `Dialog` compound — `DialogSurface`, `DialogHeader`, `DialogTitle`, `DialogDescription`,
  `DialogBody`, `DialogFooter`, `DialogActions`, `DialogClose`, `DialogCancel`, `DialogConfirm`
- `useDialogClose()` — 소비자가 자기 footer를 직접 그릴 때의 confirm/cancel 발행 통로
- `packages/css/src/component/dialog.css`

### Changed — 규범

- `Migration` 2번이 바뀌었다. `ConfirmDialog`/`TaskDialog`/`MediaWorkbenchDialog` 세 recipe 대신
  **단일 `Dialog` + `variant`** 다. 셋의 차이는 초기 포커스·dismiss 기본값·크기 tier 세 값뿐이고,
  그것을 세 컴포넌트에 흩으면 규범이 한 곳에서 읽히지 않는다.
- **variant 자동 전환을 하지 않는다.** 뷰포트 폭으로 `task`를 `sheet`로 바꾸면 dismiss 정책과 초기
  포커스가 화면 크기에 따라 달라진다 — Surface classifier가 금지한 것의 축소판이다.
- `media-workbench`의 초기 포커스가 "heading 또는 첫 핵심 컨트롤"에서 **dialog surface**로 바뀌었다.
  surface가 포커스를 가지면 스크린리더가 이름을 먼저 읽고 다음 Tab이 내용으로 들어간다.
- `closeOnBackdrop`이 `dismissible`에 종속된다. 실효값은 `closeOnBackdrop && dismissible && !busy`다.
- **dismiss 차단 안내가 Dialog의 의무가 됐다.** `onDismissBlocked`는 추가 훅이지 안내의 유일한 출처가
  아니다. 선택으로 두면 소비자가 아무것도 넘기지 않았을 때 차단이 완전히 무음이 되고, 사용자는
  Escape가 고장난 것으로 인지한다.
- `alertdialog`를 지원하지 않기로 확정했다. `role`을 prop으로 여는 것이 Workspace 오용의 최단 경로다.
- 제목과 설명이 prop이 아니라 하위 컴포넌트다. 설명을 prop으로 받으면 렌더되지 않았을 때
  `aria-describedby`가 없는 id를 가리킨다 — 화면상 아무 이상이 없는 접근성 회귀다.

### 구현이 드러낸 primitive 결함 둘

- **modal의 focus 복원이 배경이 inert인 상태에서 일어나 body로 떨어졌다.** inert 요소는 `focus()`를
  조용히 무시한다. 격리 해제를 복원보다 앞으로 옮겼다. non-modal에는 격리가 없어 Menu에서는 드러나지
  않던 경로다.
- **focus trap이 복원된 포커스를 다시 끌어왔다.** 하부 유틸의 trap 해제는 passive effect인데 복원은
  layout effect라, 그 시점에 리스너가 아직 살아 있다. 닫히는 subtree를 **복원 전에** inert로 만들어
  되끌기 대상을 없앴다.
- **scroll lock의 위치 복원이 기본 경로에서 no-op이었다.** owner가 `document.body`인데 표준 모드에서
  뷰포트 스크롤 위치는 `document.scrollingElement`에 있어 `body.scrollTop`은 항상 0이다.

### Current impact

`@klipse-design/react`를 쓰는 앱은 `OverlayProvider`가 이미 있으면 추가 작업이 없다. Dialog는
controlled 전용이며 `open`과 `onOpenChange`가 필수다.

## 2026-08-14 — 컴포넌트 워크샵

### Added

- `apps/storybook` — Storybook 10. `pnpm --filter @klipse-design/storybook dev`
- Button·ActionMenu·CompositePopover 스토리와 light/dark 테마 툴바

### Changed

- **Button 라벨이 좁은 폭에서 글자 단위로 쪼개지던 것을 고쳤다.** `overflow-wrap`을 `anywhere`에서
  `break-word`로 바꿨다. `anywhere`는 min-content 폭까지 낮추므로 flex 컨테이너 안에서 버튼이 한 글자
  폭까지 줄어든다(실측 74px → 38px). 시각 변경이지만 API는 그대로다.

### 워크샵이 이것을 위해 있다

셋 다 기존 테스트가 통과하던 상태였다 — 계산값 단언은 "잘리지 않았다"와 "토큰을 쓰고 있다"를 볼 뿐
"어떻게 보이는지"를 보지 않는다.

- Button 라벨 쪼개짐 (고침)
- Menu Trigger의 기본값이 스타일 없는 네이티브 버튼 (`asChild`가 의도된 경로임을 문서화)
- danger item의 톤이 일반 item과 구분되지 않음 — 대비 light 1.21 / dark 1.14 (DS-P3-014 단위 9로 이관)

### 이것은 시각 회귀가 아니다

스냅샷 baseline을 만들지도 커밋하지도 않고 어떤 게이트도 렌더 결과를 검사하지 않는다.
컴포넌트 승격 조건의 visual regression 항목은 그대로 남아 있다.

### Current impact

소비자에게 달라지는 것은 Button의 줄바꿈 동작 하나뿐이다.

## 2026-08-14 — Menu / Popover 공개

### Added

- `ActionMenu`, `ActionMenuTrigger`, `ActionMenuContent`, `ActionMenuItem`, `ActionMenuLinkItem`,
  `ActionMenuGroup`, `ActionMenuSeparator`, `ActionMenuSub`(+`SubTrigger`/`SubContent`)
- `CompositePopover`, `CompositePopoverTrigger`, `CompositePopoverContent`, `CompositePopoverTitle`
- `OverlayProvider` — **앱 root에 한 번 두어야 하는 공개 진입점**
- `useOverlayBranch()` — React 트리 밖에서 만든 nested overlay를 같은 branch로 등록한다
- `packages/css/src/component/menu-popover.css`

### 소비자가 해야 하는 것

`OverlayProvider`를 앱 root에 한 번 렌더한다. 없으면 Menu가 던진다.

```tsx
<OverlayProvider>
  <App />
</OverlayProvider>
```

host와 scroll owner를 앱이 한 번만 해석하게 하는 것이 계약이다. 컴포넌트가 host를 고르면 인스턴스마다
stacking과 inert 경계가 달라진다.

### Changed

- `menu-popover.md`의 Properties 표가 바뀌었다. `kind`는 prop이 아니라 **컴포넌트 정체성**이고,
  `open`은 조건부 필수(+`defaultOpen`)이며, `offset`·`collisionPadding`·`branchId`는 prop이 아니다.
- `onOpenChange`의 reason 어휘에 **`programmatic`** 이 추가됐다. 소비자가 `open`을 직접 내려 닫는
  경로가 실제로 소비자에게 도달하는데 기존 5종이 그것을 덮지 못했다.
- `disabledItems`가 생겼다. disabled 표기를 한 menu 안에서 섞지 않게 **menu 단위**로 고른다.
- 새 `## Focus` 절이 variant별 초기 focus와 reason별 return focus를 소유한다.
- `menu-popover`의 Web 상태가 `not-ready` → `partial`.

### 구현에서 규범이 강제한 것

- **프로필 패널에 `role="menu"`를 붙일 수 없다.** 컴포넌트를 둘로 나눠 타입과 런타임에서 모두 막는다.
- **`Enter`/`Space`에 keydown 핸들러를 붙이지 않는다.** 브라우저가 이미 click을 합성하므로 더하면 두 번
  실행된다. `<a href>`만 예외다 — `<a>`의 Space는 click을 합성하지 않고 페이지를 스크롤한다.
- **키보드 리스너를 native로 붙인다.** React 이벤트는 React 트리로 전파되는데 submenu의 Content는
  부모의 React 서브트리 안이라, React 핸들러를 쓰면 submenu의 방향키가 부모까지 실행해 focus가 튀고
  그 focusout이 submenu를 닫는다. 두 panel은 DOM에서 형제라 native에는 그 문제가 없다.
- **item에 `.kds-hit-target`을 쓰지 않는다.** 44px `::after`가 항목 중앙에 겹쳐 놓여, 간격 없이 쌓이는
  행에서 인접 항목의 hit 영역을 2px씩 가로챈다. "삭제"가 "설정" 아래에 있으면 그대로 사고다.

### Known deviations

한국어 typeahead가 동작하지 않는다(IME 켜진 비편집 요소의 keydown이 완성 음절을 주지 않는다).
RTL에서 `ArrowRight`/`ArrowLeft`가 반전되지 않는다. 바깥 클릭도 최상위 branch 하나만 닫으므로
submenu가 열려 있으면 두 번 눌러야 전체가 닫힌다. 전체 목록은 `menu-popover.md`의 Known deviations에 있다.

### Current impact

`@klipse-design/react`를 이미 쓰는 앱은 `OverlayProvider`를 추가하기 전까지 Menu를 쓸 수 없다.
Button만 쓰는 앱에는 영향이 없다.

## 2026-08-14 — Overlay behavior layer

### Added

- `packages/react/src/overlay/` — Menu와 Dialog가 공유할 순서·정책 계층. portal host 해석, presence
  FSM, branch registry, layer stack, dismiss 정책, focus 정책, inert, scroll lock, activation guard,
  id 발급, anchor 배치를 각각 독립 모듈로 분리했다.
- `packages/css/src/component/overlay.css` — 하부 positioning 유틸의 변수를 `--kds-overlay-*`로
  재발행하는 **단일 seam**. 유틸을 교체하면 이 블록 5줄만 바뀐다.
- `base.css`에 두 규칙 — `[data-kds-state="opening"]`(비가시·비 hit-test)와
  `[data-kds-scroll-locked="true"]`.
- fixture 2종과 실브라우저 회귀 45건, node 단위 14건.

### 이 계층이 필요한 이유

하부 유틸의 layer stack은 **등록 순서**로 최상위를 정한다. React는 effect를 자식 → 부모 순으로
돌리므로 부모와 자식 overlay가 같은 commit에 열리면 **부모가 최상위**가 된다 — DOM 중첩과 정반대다.
`overlay-store.node.test.ts`가 같은 입력에서 두 규칙이 갈리는 것을 고정한다.

### Changed

- **소비자에게 달라지는 것은 없다.** `@klipse-design/react`의 public 표면은 그대로 `Button`
  하나이며 `exports`와 패키지 게이트도 변하지 않았다. overlay는 recipe의 구현 세부다.
- `@klipse-design/css`의 `styles.css`에 overlay recipe가 추가됐다. `.kds-overlay-panel`을 쓰지 않는
  앱에는 영향이 없다.
- `menu-popover.md`와 `dialog.md`의 pre-implementation blocker 중 primitive 부재 항목이 해소됐다.
  두 컴포넌트의 `Web` 상태는 **`not-ready` 그대로다** — primitive는 카탈로그 컴포넌트가 아니다.

### 구현에서 규범이 강제한 것

- 바깥 `pointerdown`은 아무것도 닫지 않는다. dismiss는 후속 `click`에서 commit되고 그 click은 배경에
  도달하기 전에 소비된다. pointerdown에서 닫으면 착지점이 사라져 선택이 0회가 되는데, 그것이 규범이
  차단급으로 지정한 "열리지만 선택되지 않음"이다.
- 닫힐 때 focus는 root가 **아직 DOM에 있는 동안** 동기로 돌아간다. 하부 유틸의 복원은 비동기라
  대상이 사라진 뒤에 실행될 수 있다.
- exit 시간과 unmount 시점이 같은 CSS 선언에서 온다. reduced-motion에서 둘 다 0이 되며 **순서는
  동일하다**.

### Known deviations

- iOS Safari의 `overflow: hidden` scroll lock은 headless Chromium으로 검증할 수 없어 미확인이다.
- non-modal에서 Tab으로 이탈해 닫힐 때 reason은 `outside`다. 새 어휘를 만들지 않은 이유는
  [DS-D-0011](../governance/decisions/DS-D-0011-overlay-primitive-boundary.md)에 있다.

### Current impact

`@klipse-design/react`를 쓰는 앱이 지금 해야 할 일은 없다. Menu(DS-P3-006)와 Dialog(DS-P3-007)가
공개되면 그때 `OverlayProvider`를 root layout에 한 번 두게 된다 — host와 scroll owner를 앱이 한 번만
해석하도록 강제하는 것이 계약이기 때문이다.

## 2026-08-14 — Figma Button component와 코드↔디자인 parity

### Added

- Figma 라이브러리에 `Button` component set 40 variant (Variant 4 × Size 2 × State 5). fill 72와
  stroke 18이 전부 변수 바인딩이고 텍스트 40개가 전부 text style이다 — **raw 값 0**.
- parity 게이트가 **Figma variant 옵션을 코드 타입 선언과 대조**한다. `Variant`는 `ButtonVariant`와,
  `Size`는 `ButtonSize`와 집합이 같아야 한다. Figma에만 있는 `State`는 사유와 함께 계약에 선언돼야
  통과하고, 선언되지 않은 property가 생기면 실패한다.
- 변조 canary가 7종으로 늘었다 — 값·alias·collection·**mode 순서**·style·**component variant 옵션**·
  **component raw 값**.

### Fixed

**Figma가 Dark를 기본 모드로 쓰고 있었다.** mode를 알파벳 정렬한 탓인데, token source는
`themes: ["light", "dark"]`로 light를 먼저 선언하고 CSS도 `:root`가 light다. 라이브러리를 열면
기본 표시가 다크로 나오는 상태였다.

생성기가 source가 선언한 theme 순서를 따르도록 고치고 `defaultMode`를 proposal에 명시했다. parity
게이트는 이제 mode 순서를 정렬하지 않고 **그대로 비교**하며 기본 모드도 검증한다. token graph는
바뀌지 않아(projection만 변경) baseline 갱신은 필요 없었다.

이 결함은 component를 만든 뒤 **스크린샷을 눈으로 확인하다** 발견했다. 값 대조만으로는 드러나지
않는 종류였다.

### Changed

- Button의 Figma 상태를 `partial`로 올렸다. `done`은 publish(DS-F-008) 이후다.
- token consumer fixture가 mode 순서를 source의 `themes`에서 도출해 비교하고 기본 모드를 검증한다.

### Current impact

Figma 라이브러리는 여전히 publish되지 않았다. Button 외 component는 아직 없고, 나머지 7종은 각자
코드 구현이 생긴 뒤에 만든다.

## 2026-08-14 — 첫 컴포넌트: Button

### Added

`@klipse-design/react`가 처음으로 public export를 갖는다.

```tsx
import { Button } from "@klipse-design/react";

<Button variant="primary">새 프로젝트 만들기</Button>
```

- `packages/react/src/button/button.tsx` — `tsc` + `isolatedDeclarations`로 빌드된다.
- `packages/css/src/component/button.css` — 상태는 `data-*`, 값은 semantic 토큰만.
- 실브라우저 acceptance test 11건이 [Button 규범](../components/button.md)의 Acceptance tests를
  그대로 검증한다.

### 구현에서 규범이 강제한 두 가지

- **활성화를 네이티브 `<button>`에 맡긴다.** pointer click·Enter·Space가 각각 정확히 한 번
  실행되는 것은 브라우저가 보장한다. keydown으로 클릭을 흉내 내면 중복 실행이 된다.
- **`loading`은 네이티브 `disabled`를 쓰지 않는다.** 네이티브 disabled는 현재 focus를 제거하는데
  규범이 이를 금지한다. `aria-disabled`로 표시하고 activation을 명시적으로 막으며, 실제 포인터는
  actionability가, 프로그램적 click과 keyboard는 컴포넌트가 막는 두 층으로 검증한다.

### Changed

- Button의 Web 상태를 `partial`로 올렸다. 근거는 public export와 acceptance test 11건이며,
  `done`에는 visual regression·수동 screen-reader review·SSR·Figma component·제품 사용처가 남는다.
- `pnpm build`에 `build:react`가 연결됐다.
- Availability canary를 하드코딩 문자열에서 정규식으로 바꿔 상태가 바뀌어도 동작하게 했다.

### Known deviations

- `danger` variant가 tonal이다. solid를 표현할 `color-action-danger*` 토큰이 없다.
- 고정 높이 토큰이 없어 높이를 padding과 line-height로 결정하고 44px 타깃은 `kds-hit-target`이
  보장한다.

둘 다 DS-P3-014가 해소한다.

### Current impact

Figma는 여전히 publish되지 않았고 Button의 Figma 상태도 `not-ready`다. 제품 adoption은 바뀌지
않았다. 다음은 overlay behavior layer이며, Button의 코드 구현이 생겼으므로 Figma component
작업(DS-F-006-button)도 열렸다.

## 2026-08-14 — CSS foundation package

### Added

`@klipse-design/css`가 처음으로 실제 public surface를 갖는다. 저작 원본
`packages/css/src`에서 `scripts/build-css.mjs`가 배포 CSS를 생성한다.

| 서브패스 | 내용 |
| --- | --- |
| `./layers.css` | `@layer` 순서 선언만. root layout 최상단에서 가장 먼저 import |
| `./tokens.css` | 토큰 CSS 재export |
| `./styles.css` | base + 컴포넌트, 언레이어드 |
| `./styles.layer.css` | 같은 내용, layer 래핑 |
| `./reset.css` | opt-in reset, `:where()` 기반 |

두 벌 배포는 Tailwind 소비자가 유틸리티로 라이브러리 스타일을 이길 수 있게 하기 위한 것이다.
`styles.css`와 `styles.layer.css`를 동시에 import하지 않는다.

base 유틸리티는 `kds-visually-hidden`, `kds-focus-ring`, `kds-hit-target`, `kds-layer-*`,
그리고 `[data-kds-state]`의 closing/closed 계약이다.

### 게이트

`scripts/verify-css-gates.mjs`가 저작 규칙 위반을 실제로 잡는지 canary 6종으로 증명한다 —
`!important`, 숫자 z-index, raw color 리터럴, primitive 직접 소비, reset 밖 전역 선택자,
그리고 생성물 drift. `pnpm verify`에 연결됐다.

브라우저 테스트 6건이 계산값과 실제 상호작용을 확인한다. 특히 focus-visible이 **키보드 포커스에서만**
나타나고 포인터 클릭에서는 나타나지 않는 것까지 검증한다 — 문자열 검사로는 불가능한 항목이다.

### Changed

- `pnpm build`에 `build:css`, `pnpm check`에 `check:css`, `pnpm verify`에 `verify-css-gates`가
  연결됐다.
- manifest의 `webPackages`에서 css의 `web`을 `partial`로 올렸다. 근거는 5개 서브패스, canary 6종,
  브라우저 테스트 6건이며 **컴포넌트 CSS는 아직 없다**.

### Current impact

React 패키지는 여전히 소스가 없고 `not-ready`다. 컴포넌트 recipe는 DS-P3-004부터 각 컴포넌트와 함께
붙는다. Figma와 제품 adoption 상태는 바뀌지 않았다.

## 2026-08-14 — 테스트 harness 구축과 게이트 전환

### Added

- **Vitest 실브라우저 harness** — project 3개(`node`, `browser`, `browser-reduced-motion`).
  reduced-motion은 provider 수준 옵션이라 instance가 아니라 project로 나눈다.
- **TypeScript 설정 3단** — `tsconfig.base.json`(공통 strictness) / `tsconfig.build.json`
  (declaration + `isolatedDeclarations`) / `tsconfig.json`(typecheck). `pnpm typecheck`가
  `pnpm check`에 연결됐다.
- `scripts/verify-test-harness.mjs` — 각 project에 의도적 실패 테스트를 심어 러너가 실패를
  전파하는지 증명하고, 제거 후 실제 suite가 통과하는지 확인한다. `pnpm verify`에 연결됐다.
- **첫 실테스트 20건.** 토큰 CSS가 브라우저에서 theme 계약대로 계산되는지(기존 게이트는 CSS 문자열만
  검사한다), 소비자 관점의 token 공개 계약, 그리고 실행 환경이 실제 브라우저인지 검증한다.
- scaffold 게이트 canary 2종 — 선언 밖 exports, CSS 노출 패키지의 `sideEffects` 누락 (canary 17 → 19).

### Changed

- manifest schema에 `webPackages`를 추가해 CSS/React 패키지 상태와 evidence를 표현한다.
  `tokenPackage.figmaLibrary`·`packageRelease`의 고정값도 status enum + evidence 요구로 완화했다.
- `packages/tokens`에 `sideEffects: ["*.css"]`와 `./package.json` export를 명시했다.
- CI에 `pnpm install --frozen-lockfile`, `pnpm build`, tracked 검사를 추가했다. 의존성 0 전제가 여기서
  끝난다.
- 저장소에 devDependencies가 생겼다 — TypeScript, Vitest, Playwright, `axe-core`.

### spike 실측 결과 (저장소 밖)

- **S1 — 하부 유틸 조합이 Menu 규범을 충족한다.** item 클릭 시 select가 정확히 한 번, 바깥 클릭은
  dismiss만, **중첩 portal item도 정확히 한 번 선택**, closing layer가 pointer를 놓으면 아래 control이
  클릭됨. 그리고 규범 위반 상태를 일부러 만들면 실제로 실패한다(검출력 확인). 완제품 라이브러리가
  실패한다고 보고된 중첩 portal 선택이 하부 유틸에서는 통과한다.
- **S3 — `tsc`의 `isolatedDeclarations` emit이 정상 동작**하고, `inert`가 실행 브라우저에 구현돼
  있다. 이전 major로의 fallback은 필요 없다.

### 왜 jsdom을 쓰지 않는지 기계적으로 강제한다

`packages/tokens/test/environment.browser.test.ts`가 레이아웃 계산, hit test,
`HTMLDialogElement`의 modal/non-modal 구분, `inert`를 확인한다. jsdom이나 happy-dom으로 후퇴하면 이
테스트가 실패하므로, DS-D-0005의 "조용한 다운그레이드 금지" 규칙이 문서가 아니라 게이트로
강제된다.

### Current impact

CSS·React 패키지는 여전히 소스가 없고 상태는 `not-ready`다. Web과 Figma 상태, 제품 adoption은 바뀌지
않았다. 다음 작업은 DS-P3-003(CSS foundation package)이다.

## 2026-08-14 — Web 아키텍처 Decision 6종

### Added

코드 트랙(P3)의 선행 결정을 모두 `proposed`로 기록했다. 파일·의존성 변경은 아직 없다.

| Decision | 결정 |
| --- | --- |
| `DS-D-0002` Web 지원 범위 | React 19 단일 major · ESM 전용 · leaf `"use client"` · `baseline widely available` · `tsc` + `isolatedDeclarations` |
| `DS-D-0003` behavior dependency | 하부 유틸만 채택하고 **Menu의 선택 순서와 Dialog의 mode·Escape·scroll lock은 Klipse가 소유**. 완제품 미채택 |
| `DS-D-0004` CSS 저작 방식 | authored plain CSS + cascade layer 두 벌 · 상태는 `data-*` · 런타임 스타일 라이브러리 0 · reset opt-in |
| `DS-D-0005` test stack | 실브라우저 러너를 1단계에 둔다. **jsdom·happy-dom 배제** |
| `DS-D-0006` versioning | changesets `fixed`로 css·react 동반 버저닝 · css를 required peer로 강제 |
| `DS-D-0009` font distribution | 폰트 미동봉 · 교체 지점을 변수 하나로 단일화 · 폴백 스택 교정 |

### Why

두 결정은 **조사에서 나온 반증**에 근거한다.

- **완제품 overlay 라이브러리를 채택하지 않는 이유:** 후보 라이브러리에 "중첩 메뉴 item이 선택
  콜백을 발화하지 않음", "collision으로 뒤집힌 submenu가 click 착지 전에 닫힘", "Dialog가 오픈 직후
  첫 프레임에 pointer 이벤트를 막음"이 **미해결 이슈로 존재**한다. 셋 다 이 저장소의 규범이 명시적
  금지 계약으로 적은 실패다. 그래서 순서와 정책 계층을 우리가 소유한다.
- **jsdom·happy-dom을 배제하는 이유:** jsdom의 `HTMLDialogElement`는 사실상 빈 클래스라
  `showModal()`이 없고, happy-dom은 `showModal()`과 `show()`가 완전히 동일하다. 즉 **modal과
  non-modal을 구분하는 테스트가 구현이 실제로 둘을 구분하든 안 하든 통과**한다. 초록 테스트가 규범
  위반을 은폐하는 것은 이 저장소가 금지하는 fake completion과 같은 결과다.

### 발견한 결함

`--kds-font-family-sans` primitive가 CSS로 방출되지 않고, 동일한 폰트 스택 리터럴이
`--kds-typography-*-font-family`에 **15번 중복 인라인**된다. 소비자가 폰트를 교체하려면 15개를 전부
덮어야 한다. 또한 폴백 스택의 `Inter`·`Noto Sans KR`·`Noto Sans JP`는 시스템 설치 폰트가 아니라
no-op이어서 **실제 OS 한글 폰트가 스택에 하나도 없다**. DS-D-0009가 두 결함의 해소 방향을 정했고
구현은 DS-P3-003과 DS-P3-014가 수행한다.

### Current impact

package와 Web 상태는 바뀌지 않는다. Decision은 전부 `proposed`이며 owner 확인 대기다. spike 3건(하부
유틸 실측, Server Component 경계, 브라우저 하한과 declaration emit)이 남아 있고, 브라우저 테스트
바이너리 다운로드 승인이 DS-P3-002의 선행 조건으로 추가됐다.

## 2026-08-14 — 타이포 스케일을 배포 실사용에 맞춰 재편

### Added

- `DS-D-0010` Token coverage 확장 원칙 (`proposed`) — 정의가 아니라 실사용을 승격, 반전 램프
  미승격, DOM 상태 스코프는 mode 축이 아님, 알파 10단 정규화, 제품 부채 미승격, 팔레트 완결성 우선
- `typography-*` semantic 15종과 대응 `type-style-*` primitive 15종 — body 계열 4 size × 3 weight,
  heading 계열 3 size × medium
- Figma text style 15종(구 6종 제거) — fontSize·fontWeight를 변수에 30건 바인딩

### Changed

- **Breaking (token):** 타이포 composite가 6종에서 15종으로 재편됐다. 다음 ID가 제거되고 대체된다.

  | 제거된 ID | 대체 ID | 값 변화 |
  | --- | --- | --- |
  | `typography-caption` | `typography-caption-regular` | 없음 |
  | `typography-body-sm` | `typography-body-sm-regular` | 없음 |
  | `typography-body-md` | `typography-body-md-regular` | 없음 |
  | `typography-label-md` | `typography-body-sm-medium` | 없음 (14px/500이었다) |
  | `typography-title-sm` | `typography-heading-sm-medium` | **weight 600 → 500** |
  | `typography-title-md` | `typography-heading-md-medium` | **weight 600 → 500** |

  `type-style-*` primitive 6종도 같은 규칙으로 대체됐다. additive 30 · removal 12이며 그 외 분류의
  변경은 없다. 공개 release와 published library가 없어 DS-GOV-001 절차로 baseline을 갱신했다.
- [token mapping](../../migration/token-mapping.md)의 타이포 행을 실사용 기준으로 정정했다.

### Why

[화면 인벤토리](../../migration/screen-inventory.md) 기반 실측에서 배포 화면의 heading이 **전량
medium(500)** 이고 semibold·regular 사용이 0회임이 확인됐다. 기존 `typography-title-sm/md`는
weight 600이라 이 토큰으로 화면을 재조립하면 제목 굵기가 틀렸다. 제품에 `.type-heading-28-semibold`
클래스가 정의만 되어 있었고 이전 매핑이 그 죽은 변형을 정본으로 골랐던 것이 원인이다.

### Current impact

Figma 라이브러리는 여전히 publish되지 않았고 Figma 상태는 `not-ready`다. 토큰 커버리지 확장의 나머지
단위(알파 축, 채널 색, contrastPairs 등 약 140개)는 아직 반영되지 않았으며, 앱 셸 라이트 램프와
제품의 미커밋 변수 사다리는 제품 저장소 확인이 필요해 보류 상태다.

## 2026-08-14 — Figma 라이브러리 변수 구축과 parity 게이트

### Added

- `DS-D-0007` Figma library structure Decision (`proposed`) — collection 3분리, 표현 형태 3분류,
  이름 변환, composite→style 정책, publish 전 단일 파일 구조
- 라이브러리 파일에 collection 3개와 **변수 146개** 적용: `Klipse Primitive` 92(Base),
  `Klipse Semantic` 28(Global), `Klipse Semantic Color` 26(Light·Dark)
- text style 6종(`typography/*`)과 effect style 4종(`elevation/*`) — semantic tier 이름으로만
  생성하고 fontSize·fontWeight를 primitive 변수에 바인딩 (DS-F-005)
- `figma/snapshot.json` — Figma에서 읽어온 evidence와 provenance
- `scripts/verify-figma-parity.mjs` — credential 없이 snapshot ↔ proposal을 대조하는 게이트.
  고유 토큰 174개를 변수 146 · style 10 · 미표현 18로 전수 대조하고, 값·alias·collection·style
  변조 canary 4종을 매 실행에서 자체 검증하며 `pnpm verify`에 연결됨
- [`migration/screen-inventory.md`](../../migration/screen-inventory.md) — 배포 화면 인벤토리와
  카탈로그 gap (DS-P3-009a)
- [Releases](../governance/releases.md)의 "의도적 breaking과 baseline 갱신" 절 (DS-GOV-001)

### Changed

- **Breaking (token):** `figmaCollection`이 `"Klipse Design"`에서 `"Klipse"`로 바뀌었다. 여기서
  `Klipse Primitive` / `Klipse Semantic` / `Klipse Semantic Color` 세 collection 이름이 도출된다.
  공개 registry 소비자와 published library가 없어 DS-GOV-001 절차로 baseline을 갱신했다.
- **Breaking (public types):** `figma.tokens.json`의 최상위 구조가 `modes`에서 `collections`로
  바뀌었고, 토큰마다 `representation`·`figmaName`·`scopes`·`hiddenFromPublishing`이 추가됐다.
- `manifest.schema.json`의 `tokenPackage.figmaLibrary`·`packageRelease`가 고정값에서
  status enum으로 완화됐고, `not-ready`가 아니면 evidence 필드를 요구한다.
- 세션 종료 검증에 Figma parity 게이트가 포함된다.

### Current impact

Figma 라이브러리는 **publish되지 않았고** manifest의 Figma 상태는 모두 `not-ready`를 유지한다.
Foundations(변수 146 + style 10)는 만들어졌지만 component는 아직 없고, component는 대응하는 코드
구현(P3)이 있어야 만든다. 제품 adoption과 package release도 바뀌지 않았다.

알려진 편차: primitive 변수가 `hiddenFromPublishing`인 상태에서 style이 이를 바인딩한다. publish
후 소비자 해석 여부는 DS-F-008 체크리스트에서 확인한다.

## 2026-08-14 — Figma 운영 전제 확정과 제품 실측 기록

### Added

- 디자인 시스템 전용 Figma 라이브러리 파일과 Foundations / Components / Templates 3-페이지 구조
- [Figma Sync Governance](../governance/figma-sync.md)의 운영 파일 표, 실측 capability, MCP 쓰기 정책
- 제품 미러 Figma 파일 관측 근거 `KP-FIGMA-001`
  ([제품 baseline](../../migration/product-baseline.md))
- `DS-P3-014` Token coverage 확장 — 제품이 실제 쓰는 색·타이포 범위가 현재 token source보다 넓다는
  실측에 따른 후속 작업

### Changed

- `DS-F-000`을 `done`으로 올렸다. 다음 포인터는 `DS-F-001`, `DS-P3-001`, `DS-GOV-001`,
  `DS-P3-009a`다.
- 제품 저장소 위치와 기준 commit(`/Users/sejunki/klipse`, branch `louis`, `0d188651`)을 baseline에
  기록했다.
- 환경 blocker 해소: Node 22 LTS와 pnpm 10.30.2 설치로 표준 검증 명령이 실행된다.

### Current impact

Package, Web, Figma와 제품 adoption 상태는 바뀌지 않는다. 라이브러리 파일에는 아직 변수도
component도 없으며, 파일이 생겼다는 사실만으로 어떤 상태도 올리지 않는다. 제품 미러 파일은 이
저장소의 정본이 아니라 읽기 전용 reference다.

## 2026-08-14 — 실행 플레이북과 Figma 트랙 큐 재설계

### Added

- 작업별 상세 절차, 완성 최종 판정표, 환경 게이트와 Figma 실행 경계를 소유하는
  [실행 플레이북](../governance/execution-playbook.md)
- DS-P3-011을 해체한 Figma 트랙 DS-F-000~008: 운영 전제 실측 → 구조 Decision(단일 collection 4-mode
  구조는 Figma 모델과 충돌하고, publish 전에는 파일 간 변수·component 소비가 불가능해 단일 파일
  3-페이지 구조가 강제) → multi-collection proposal → variables/styles 구축 → snapshot parity
  gate → component library → 배포 화면 재조립 검증 → 수동 publish 운영
- 신규 작업: DS-GOV-001(baseline 갱신 규범), DS-P3-002a(게이트 전환), DS-P3-009a(배포 화면
  인벤토리), DS-P3-013(아이콘 트랙)
- Web `partial` 승격용 최소 증거 세트와 `done`/`stable`용 전체 세트를 분리한 증거 2단 모델

### Changed

- Figma 트랙을 React 구현 의존에서 분리해 코드 트랙과 병렬화. DS-P3-012 public release는 published
  Figma library 대신 parity report 존재만 요구
- Editor Workspace generic fixture를 DS-P3-010에서 DS-P5-005 실제 adoption 검증으로 이동
- Figma 실행 경계를 명문화: MCP(Plugin API)가 유일한 자동화 경로, Variables REST API는 Enterprise
  전용으로 불가, library publish는 전 요금제에서 사람 수동, 쓰기는 사용자 지정 draft 파일에만
- 독립 적대 검토 2회의 발견을 반영: Figma 쓰기 실측을 파일 지정 이후로 재배열, 제품 저장소 경로
  사용자 확인 의무화, Decision 승인 주체(proposed/owner 확인) 확정, 문서 수 canary의 하드코딩을
  정규식으로 교체, schema `const` 고정 완화의 소유 작업 지정

### Current impact

Package, Web, Figma와 제품 adoption 상태는 바뀌지 않는다. `ready` 작업은 DS-P3-001, DS-F-000,
DS-GOV-001, DS-P3-009a 네 개이며, Figma 쓰기 작업은 사용자의 draft 파일 key 지정 전까지 `blocked`다.

## 2026-08-13 — Claude Code P3–P5 실행 인계 추가

### Added

- Claude Code가 자동으로 읽는 비규범 루트 `CLAUDE.md` 진입점
- SEED Design의 운영 원칙을 Klipse 규모에 맞춘 P3–P5 실행 순서, 상태 승격 조건과 component 완료 정의
- P3 core local RC, catalog coverage와 P3 complete를 분리한 작업 큐
- 권한이 필요한 remote/hosted CI/publish gate와 독립적인 로컬 작업을 분리하는 자율 실행 규칙

### Current impact

Package, Web, Figma 또는 제품 adoption 상태는 바뀌지 않는다. 다음 실행 포인터는 `DS-P3-001` Web
architecture Decision과 status model이며, 실제 구현과 검증 근거가 생기기 전에는 모든 기존
`not-ready` 상태를 유지한다.

## 2026-08-13 — P2 token source inversion 로컬 RC 구현

### Added

- Color/Theme, Typography, Spacing/Radius, Elevation/Layer, Motion 규범과 acceptance criteria
- DTCG 2025.10-compatible 단일 정본 `packages/tokens/src/klipse.tokens.json`
- 외부 패키지 없이 Node 표준 라이브러리만 사용하는 repository-supported DTCG subset validator
  `scripts/lib/token-model.mjs`
- semantic CSS projection, primitive/semantic JS·JSON·Figma proposal·manifest와 token ID/type/mode/alias/value
  shape를 선언하는 TypeScript projection
- token diff 비교점 `packages/tokens/baseline/manifest.json`
- alias graph, mode completeness, contrast, primitive/semantic metadata projection, CSS theme/selector,
  JS/TypeScript token graph, same-process deterministic render와 token diff 완료 게이트
- 여섯 token artifact atomic batch 교체/rollback과 package self-reference consumer fixture
- lifecycle별 motion property와 container 기반 Project Grid ordered compatibility profile shape 검증

### Changed

- P2 상태를 local `release-candidate`, maturity를 `experimental`로 유지
- token CSS의 source/generator는 `@klipse-design/tokens`가 소유하고 P3 `@klipse-design/css`는 이를
  소비·재export하도록 package 경계를 명확히 함
- P2 Figma 범위를 reviewable proposal까지로 제한하고 published variables/components는 P3로 유지

### Current impact

구조화 source, generated artifact와 private export map은 로컬 RC로 구현됐다. Package public release와
제품 adoption은 `not-ready`이며, Figma proposal 생성은 published library나 Figma 상태 승격의 근거가
아니다. Browser UI, glyph, 접근성, layout과 interaction acceptance도 P3/P5 소비 구현 전까지
`not-ready`다.

## 2026-08-11 — 독립 디자인 시스템 저장소 시작

### Added

- 제품 저장소와 분리된 Klipse Design 모노레포 구조
- strict manifest/schema, generated progress board와 AI 문서
- token, CSS, React package의 정직한 private scaffold
- catalog/LLM drift와 오류 주입 canary를 검증하는 CI gate

### Changed

- Web/Figma 구현 상태를 이 저장소의 실제 상태인 `not-ready`로 초기화
- 제품 route audit과 324건의 과거 debt를 normative catalog에서 분리
- DS release PR과 제품 integration PR을 상호 링크하는 운영 모델로 전환

### Migration

제품 구현은 즉시 바뀌지 않는다. P2 token source와 P3 package가 release된 뒤
[Product Adoption](../governance/migration.md) 절차로 단계적으로 전환한다.
