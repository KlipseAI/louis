---
id: component-parity
status: experimental
authority: reference
---

# 제품 ↔ DS 컴포넌트 실측 대조

DS 구현이 **제품 배포 코드와 실제로 얼마나 다른가**를 축별로 잰 비규범 기록이다. 규범이 아니며
DS가 무엇을 채택할지는 각 컴포넌트 규범과 owner 판정이 정한다.

## 무효 범위 (2026-08-30)

**아래 205축은 2026-08-15 기준선을 잰 것이고, 그 뒤 제품이 LOUIS를 채택했다.**
현재 근거 기준선은 `migration/product-evidence.lock.json`의 `74a7303b`이며, 거기서 `louis-`를
**소비하는** 제품 파일이 **138개**다 — `apps/web` 안에서 `louis-`가 grep되는 파일은 144개지만
그중 6개(게이트 스크립트 `check-louis-literals`·`check-rendering`·`check-tailwind-theme`·
`check-typography`, `louis-literal-baseline.json`, `apps/web/package.json`)는 이름을 언급할 뿐
클래스를 소비하지 않는다(저장소 전체 grep은 150개). 아래 여섯 절이 공유하던 전제 —「제품에
공용 구현이 없고 화면마다 벌이 갈린다」— 가 절마다 **다른 정도로** 무너졌다. 좌표가 밀린 것이
아니라 **판정이 뒤집힌 축이 둘 있다**(Button·Icon Button의 포커스).

**아래 좌표의 줄번호는 어느 한 커밋 기준이 아니다.** 205축은 옛 원격
`sniperfactory-official/klipse`의 `louis` 브랜치를 잰 것이고(아래 「기준선 정정」 절), 2026-08-15에
klipse-web에서 다시 대조할 때 **내용만 맞추고 줄번호는 옮기지 않았다.** `product.measured.json`이
`086f4a62`로 고정하는 것은 그 재대조 시점이지 이 문서 좌표의 출처가 아니다. 두 저장소에서 내용이
같았던 `.tsx`·`.module.css` 좌표는 `086f4a62`에서 그대로 열리지만(`Button.tsx`·`HomePageClient.tsx`·
`HighlightCreateModal.tsx`·`hl/page.module.css` 확인) **`globals.css` 좌표는 열리지 않는다** —
`--button-*` 6개는 문서의 80-87이 아니라 88-95(**−8**), `.app-tooltip-chrome`은 1497-1508이 아니라
1479-1490(**+18**)이라 한 파일 안에서 밀림의 방향까지 갈린다. 그러니 `globals.css` 줄번호는
**내용으로 찾아라.** 아래에서 `@086f4a62:` 를 단 좌표만이 그 커밋에서 실제로 열리는 것이고,
그것들은 제품에서 사라진 대상의 과거형 표기다.

**대신 볼 것.** 현재형 대조는 [`migration/product.measured.json`](product.measured.json)이 맡는다 —
187축을 `scripts/verify-product-parity.mjs` 게이트 아래에서 유지하며, 축마다 status가 없거나
`gap`이면 실패한다. 이 문서는 그 게이트가 **왜 필요했는지**의 기록으로 남긴다.

**여전히 유효한 것**: 「왜 이 문서가 생겼나」·「측정 방법」·「한계」 세 절. 방법(조사자 하나가
주장하고 다른 조사자가 반증)과 이 문서가 드러낸 사실(게이트 없이 DS가 제품과 벌어졌다)은
기준선이 움직여도 바뀌지 않는다. 다만 「왜 이 문서가 생겼나」의 **「DS ↔ 제품을 재는 게이트는
하나도 없다」는 집필 시점의 상태다** — 그 구멍은 이 문서가 낳은 `verify-product-parity`가 막았고,
「한계」가 필요하다고 적은 게이트가 바로 그것이다.

**절 단위 판정** — 제품 `74a7303b`에서 확인했다.

| 절 | 무엇이 무효인가 | 아직 서 있는 것 |
| --- | --- | --- |
| **Button** | **이 절이 인쇄하는 축 행 35개의 제품 열이 전부 무효**(집계표의 「측정 축 44」가 아니라 「확인된 격차 35」가 실제 행 수다). 근거 열은 **26행이 `Button.tsx`, 5행이 `globals.css`의 `--button-*`**이고 **나머지 4행은 둘 다 아니다** — 배경 danger(`--accent-red-500`) · 전경 secondary(`--palette-gray-600`) · font-family(`--type-font-family`) · focus-visible. 앞의 셋이 가리키는 토큰은 `74a7303b`에도 살아 있으므로(각각 globals.css:219 · :39 · :281), 그 네 행이 무효인 이유는 「이제 LOUIS가 버튼의 색·타입·포커스를 소유한다」는 별개 근거지 근거 파일이 사라져서가 아니다. 공용 `Button.tsx`는 루트 `<button>`에 `.louis-button` + `.louis-focus-ring`만 붙이고(내부 span에는 `.louis-button__icon`·`.louis-button__label`을 낸다) — 축들이 대조하던 Tailwind 상수(`ROOT`·`SIZE_MD`·`PRIMARY` 등)가 그 파일에 없다. variant는 4에서 **5**로 늘었고(`inverse` 추가) size 축은 `md`/`sm`에서 `lg`/`md`로 바뀌었다. `globals.css`의 `--button-height-sm`·`--button-padding-inline-sm`·`--button-min-width-sm`·`--button-padding-inline`은 삭제됐고 `--button-radius`(:64)·`--button-height`(:68)만 남았는데 **후자를 버튼이 읽지 않는다**(globals.css:65-67 주석이 그렇게 적는다). 9벌 중 `(highlight-standalone)` 벌은 라우트 그룹째 사라졌다(제품에 `.module.css` 0개). **focus-visible 축은 판정 역전** — 전역 규칙이 `button:focus:not(:focus-visible)`(globals.css:981)로 좁혀져 `:focus-visible`을 살려 두고, 공용 Button이 `.louis-focus-ring`을 직접 붙인다 | 9벌 목록 중 ad-hoc 다섯(appHomeSceneStyles · highlightSceneStyles · myPageSceneStyles · ComposerBar · NodePromptGenerateButton)은 파일이 그대로 있다 — 다만 축의 「DS」 열이 그것들을 재지 않았다 |
| **Icon Button** | 전제 「제품에 공용 아이콘 버튼 프리미티브가 없다」가 무효 — `components/ui/IconButton.tsx`가 새로 생겼고 `.louis-icon-button` + `.louis-focus-ring`을 붙인다(086f4a62에는 없던 파일이다). **focus ring 축의 `product-missing` 판정 역전** | ad-hoc 20벌 조사 자체. 기준으로 삼은 `gnb-iconButton`은 그대로 있다(줄만 191→196으로 밀렸다) |
| **Menu / Popover** | 전제 「제품에서 공용인 것은 CSS 변수 6개가 전부다」가 무효 — `--dropdown-ambient-shadow`·`--dropdown-radius`·`--dropdown-padding`·`--dropdown-item-radius`·`--dropdown-surface-bg`·`--glass-dropdown-frame` 여섯이 `globals.css`에서 **전부 사라졌다.** P#1에서 별칭을 폐기하고 LOUIS 오버레이 토큰을 직접 소비한다. **34축의 「rows의 기준」이던 `appHomeSceneStyles.ts`도 넘어갔다** — `archiveDropdown`이 `.louis-popover`를, `archiveDropdownItem`이 `.louis-menu__item`을 통째로 문다(제품 주석: 「표면(면·라운드·그림자·패딩·항목 간격)은 LOUIS 정본 `.louis-popover`가 소유한다」·「항목은 `.louis-menu__item`이 소유(패딩·라운드·색·hover·font)」). 그래서 「패널 padding 6px」·「패널 gap 2px」·「패널 그림자」·「패널 배경」·「패널 border」·「항목 radius 10px」처럼 **표면에 닿는 축의 제품 열은 지금 무효**다 | 표면 밖 값은 그대로다 — min-width 160(`--louis-popover-preferred-inline-size:160px`)·`z-index:1100`·`top:calc(100% + 8px)`·130ms 닫힘 전이. 벌이 여럿으로 갈려 있다는 조사도 서 있다. 다만 **ad-hoc 목록은 「대부분」이 아니라 거의 전부가 넘어갔다** — 19벌 목록의 제품 파일 중 `HighlightCreateModal.tsx`는 `74a7303b`에 아예 없고(98c421ea에서 삭제), 나머지는 전부 `louis-menu`/`louis-popover`를 문다 |
| **Dialog** | 축들의 기준이던 `GlassConfirmModal.tsx`가 `.louis-overlay-panel` + `.louis-dialog`를 채택했다(:152) — 표면·반경·배경·그림자·스크림 축의 제품 열이 무효다. **`padding` 축도 무효**다: 제품 열이 적은 「header/body/footer 분리 없음」이 깨져 지금은 `.louis-dialog__header`/`__heading`/`__title`/`__description`/`__body`/`__footer`를 쓴다(:168-182). (22축 표에 「헤더」라는 축은 없다 — 헤더에 닿는 서술은 `padding` 축 한 문장뿐이다.) | **`닫기 버튼` 축은 무효가 아니다** — 그 축의 요지 「확인 모달 계열(GlassConfirmModal·ConfirmModal·CreateProjectModal)에는 닫기 버튼이 아예 없다」는 `74a7303b`에서도 참이다(GlassConfirmModal에 `louis-dialog__close` 0건). 이 축에서 어긋난 것은 근거 좌표와 값이다 — `PricingModal.tsx:52`는 지금 헤더 상수 줄이고 `PRICING_MODAL_CLOSE_BUTTON`은 :58부터이며, 색이 `rgb(gray-000/60%)`가 아니라 **56%**다(`w-10 h-10`=20×20와 `rounded-4`는 문서대로). 14벌이 같은 셸을 파일마다 복제한다는 조사도 서 있다(단 `HighlightCreateModal.tsx`는 삭제됐다). Escape 핸들러 부재는 GlassConfirmModal에서 지금도 확인된다(`escape` 문자열 0건) |
| **Tooltip** | shared로 적은 `.app-tooltip-chrome`이 **없어졌다**(`apps/web` 전체 0건). 옮겨간 곳은 `ChromeTooltip.tsx` 하나가 아니다 — `.louis-tooltip`을 무는 제품 파일이 **6개**다(`ChromeTooltip.tsx` · `create/ComposerBar.tsx` · `app/mypage/upgrade/page.tsx` · `scenes/analytics/shared.tsx` · `scenes/analytics/useAnalyticsBarTooltip.tsx` · `scenes/archive/YoutubeVideoAnalyticsView.tsx`). 14벌 목록의 `HomePageClient.tsx (TIER_FEATURE_TIP)`은 옮겨간 게 아니라 **없어졌다** — 파일은 남았으나 109줄로 줄었고 `tooltip`/`TIP` 문자열이 0건이다 | ad-hoc 조사 중 `inspectorPrimitives.tsx`(Radix) · `myPageSceneStyles.ts` · `VideoEditModal.tsx` · `SubscriptionScene.tsx` · `VideoPlayer.tsx`는 그대로다. `[data-tooltip]::after` 전역 SSOT도 살아 있고 지금 **globals.css:1403**이다(문서가 적은 1511은 `086f4a62`에서도 열리지 않는다 — 위 좌표 경고 참조). **`--app-tooltip-*`가 전부 LOUIS 별칭인 것은 아니다** — space/radius/motion은 직행 별칭이고(:333-334 · :339 · :342-346), 타이포 4개는 제품 `--type-caption-12-*`/`--type-weight-*`를 한 번 거치지만(그중 LOUIS에 닿는 것은 `-size`뿐), 색·그림자(:672-676 다크 · :716-720 라이트)는 `--palette-gray-*` 위에 제품이 직접 쓴 조합이고 `--app-tooltip-shadow: 0 12px 24px …`는 어떤 LOUIS elevation 토큰의 별칭도 아니다. 그래서 이 절의 그림자·극성 축은 지금도 서 있다 |
| **Toast** | 「공용 Toast 컴포넌트 없음」이 무효 — **여섯 자리**가 `.louis-toast`를 조합한다: `appHomeSceneStyles.ts:886` · `highlightSceneStyles.ts:2070` · `NodeCanvasHomeScene.tsx:543` · `CreateScene.tsx:181` · `VideoEditScene.tsx:430` · `EditorProjectWorkspace.tsx:219`. **그중 `appHomeSceneStyles.ts`가 14축 전체의 「rows의 기준」이고 `highlightSceneStyles.ts`가 2번째 벌**이라, 무효 범위가 전제 하나가 아니라 축의 기준 자체에 닿는다. LOUIS로 넘어간 것은 패딩(12/20)·반경(16)·글자색(fg-on-inverse) 셋이고, 제품이 남긴 것은 위치·스택(z-index 1300)·등장 애니메이션·면 색(gray-800/200 72%)·그림자·`backdrop-filter` 10px·`max-inline-size:none`이다(`CreateScene`은 `inline-flex`·`gap-6`도 남겼다) | **「ad-hoc 9벌 조사」는 서 있지 않다** — 9벌 중 6벌이 위 여섯이다. 남은 것은 `myPageSceneStyles.ts` · `inquiry/InquiryClient.tsx` · `/admin` 인라인 배너 7벌뿐이고(셋 다 `louis-toast` 0건), `/admin` 벌이 같은 이름의 다른 물건이라는 지적이 온전히 남는다 |

「집계」표의 **제품 구현 벌 수** 열도 같은 이유로 낡았다. **다시 세지 않았다** — 205축 값을 손으로
재측정하는 것은 이 배너의 일이 아니다. 그 일은 `product.measured.json`의 187축이 게이트 아래에서
한다.

## 왜 이 문서가 생겼나

DS의 게이트는 전부 **DS 내부 일관성**만 본다 — 코드 ↔ Figma, 토큰 ↔ 생성물. **DS ↔ 제품을 재는
게이트는 하나도 없다.** 그래서 DS가 제품과 다른 값을 갖게 돼도 모든 게이트가 초록이다.

실제로 그렇게 됐다. owner가 Figma의 Button을 보고 "프라이머리 컬러가 왜 저래, 왤케 어둡냐,
실제 배포에서 진짜 저 컬러를 쓰냐"고 물어서야 드러났다. 그 하나를 고치고 나서 **나머지도 다
재봤다.**

## 집계

| 컴포넌트 | 측정 축 | 확인된 격차 | 반증으로 철회 | 제품 구현 벌 수 |
| --- | --- | --- | --- | --- |
| Button | 44 | **35** | 3 | 9 |
| Icon Button | 25 | **16** | 4 | 20 |
| Menu / Popover | 41 | **34** | 1 | 19 |
| Dialog | 29 | **22** | 6 | 14 |
| Tooltip | 35 | **22** | 1 | 14 |
| Toast | 31 | **14** | 8 | 9 |
| **합계** | **205** | **143** | **23** | — |

철회 건은 다른 조사자가 제품 소스를 다시 열어 반증한 것이다. 주장한 값이 변수를 끝까지 따라가지
않았거나, `same`을 `different`로 잘못 분류했거나, DS 값을 잘못 읽은 경우다.

`match` 값의 뜻: `different`는 양쪽 다 있는데 값이 다르다, `ds-missing`은 제품에 있고 DS에 없다,
`product-missing`은 DS에 있고 제품에 없다.


## Button

제품 구현 **9벌**.

- `apps/web/components/ui/Button.tsx` — shared — 유일한 공용 Button 프리미티브. variant 4 / size 2. Tailwind arbitrary utility 문자열 상수(ROOT:44, SIZE_MD:56, SIZE_SM:62, PRIMARY:91, SECONDARY:105, GHOST:116, DANGER:126). 호출부는 17개 파일 32곳뿐
- `apps/web/app/globals.css:80-87` — style-object(토큰) — :root(14행)의 --button-radius/-padding-inline/-height/-height-sm/-padding-inline-sm/-min-width-sm. 공용 Button과 32×32 아이콘 액션 버튼이 공유하는 유일한 치수 SSOT
- `apps/web/components/scenes/appHomeSceneStyles.ts` — style-object(ad-hoc) — archiveMoreButton:167(32×32/r12), bannerArrowButton:409(28×28/r999), floatingCreateButton:715. archive/home 화면 전용, 공용 Button 미사용
- `apps/web/components/scenes/highlightSceneStyles.ts` — style-object(ad-hoc) — backButton:9(36×36/r999/border 0.1px), downloadAllButton:644(pad 6/12, r8), historyMoreButton:916, viewToggleButton:2450(30×28/r8), viewToggleButtonActive:2471
- `apps/web/components/scenes/myPageSceneStyles.ts` — style-object(ad-hoc) — dangerButton:323(min-h 32/pad 0 16/r12), planTabOutlineButton:747, planTabPrimaryButton:796(min-h 32/pad 0 12/r12), settingsAvatarApplyButton:830, settingsRowButton:964, settingsRowDangerButton:995, withdrawalButton:1377
- `apps/web/components/scenes/VideoEditScene.tsx` — ad-hoc — HISTORY_MORE_BUTTON:301(w-16 h-16=32×32, r var(--button-radius)), HISTORY_DROPDOWN_ITEM:365. editor(비디오 편집) 목록 화면 전용 상수
- `apps/web/components/scenes/create/ComposerBar.tsx` — ad-hoc — 한 파일에 BUTTON 상수 11벌. VIEW_MODE_BUTTON_BASE:77(h-15=30px/px-6=12px/r999), ASSET_FOOTER_BUTTON:138(h-16=32px/px-6/r999), DURATION_TRIGGER:148(h-16/px-4=8px/r999), COMPOSER_SEGMENT_BUTTON_BASE:256(h-16/r999)
- `apps/web/components/scenes/create/node-canvas-v2/components/NodePromptGenerateButton.tsx` — ad-hoc(준공용) — CHROME:21 / ROOT:35(min-w-16 h-16 px-4 = 32h/8pad, r var(--button-radius)). 공용 Button primary의 그라디언트·이너섀도우가 이 버튼을 베낀 것(SSOT 역전). active는 0.95로 공용 Button(0.98)과 다름
- `apps/web/app/(highlight-standalone)/hl/page.module.css@086f4a62:55` — **제품에서 사라졌다**(라우트 그룹째 삭제, `74a7303b`에 `.module.css` 0개). style-object(라우트 오버라이드)로 --node-prompt-generate-gradient: #FFDD00 을 두어, 이 라우트에서만 공용 Button primary가 노란 단색이 됐었다

격차 35건.

| 축 | 제품 | DS | 분류 | 근거 |
| --- | --- | --- | --- | --- |
| 높이 md | 40px (고정. --button-height) | 39px (고정 높이 없음. padding-block 8+8 + border 1+1 + line-height 21의 합. button.css:34-42) | `different` | `apps/web/app/globals.css:82` |
| 높이 sm | 32px (고정. --button-height-sm) | 28px (padding-block 4+4 + border 1+1 + line-height 18. button.css:44-52) | `different` | `apps/web/app/globals.css:85` |
| 높이 결정 방식 | h-\[40px\]/h-\[32px\] 고정 + py-0. 라벨이 커지거나 200% 확대해도 박스가 늘어나지 않는다 | 고정 높이 없음. padding+line-height 합으로 결정 (button.css:4-5 주석에 명시) | `different` | `apps/web/components/ui/Button.tsx:57` |
| 최소 폭 sm | 48px (--button-min-width-sm) | min-width: 0 (최소 폭 계약 없음. button.css:24) | `different` | `apps/web/app/globals.css:87` |
| padding-inline md | 16px (--button-padding-inline) | 12px (--louis-space-control-md, tokens.css:77) | `different` | `apps/web/app/globals.css:81` |
| padding-inline sm | 12px (--button-padding-inline-sm) | 8px (--louis-space-control-sm, tokens.css:78) | `different` | `apps/web/app/globals.css:86` |
| padding-block | 0px (py-0, md·sm 공통) | md 8px / sm 4px (button.css:35,45) | `different` | `apps/web/components/ui/Button.tsx:58` |
| padding 광학 보정 | 아이콘이 붙은 쪽만 2px 축소 — md 16→14px, sm 12→10px | 없음 (아이콘 유무로 padding이 변하지 않는다) | `ds-missing` | `apps/web/components/ui/Button.tsx:73` |
| gap sm | 4px (gap-2 × --spacing:2px) | 8px (md·sm 동일. button.css:13) | `different` | `apps/web/components/ui/Button.tsx:66` |
| border 두께 | secondary만 1px solid, primary·ghost·danger는 border:none (박스 크기 계산에서 2px가 빠진다) | 전 variant 1px solid transparent — 색만 바뀌고 박스는 항상 같다 (button.css:14) | `different` | `apps/web/components/ui/Button.tsx:81` |
| border 색 secondary | rgb(23 27 34 / 12%) = #171B22 12% (다크: rgb(250 250 250 / 16%)) | #D5D7DD (--louis-color-stroke-default, 불투명. tokens.css:15) | `different` | `apps/web/components/ui/Button.tsx:80` |
| 배경 secondary | transparent | #FAFAFA (--louis-color-bg-surface, tokens.css:14) — 면이 있다 | `different` | `apps/web/components/ui/Button.tsx:106` |
| 배경 danger | #ff4b59 단색 (--accent-red-500) — solid | #FFE5E8 (--louis-color-bg-danger, tokens.css:26) — tonal | `different` | `apps/web/app/globals.css:226` |
| 전경 secondary | #777d89 (--palette-gray-600). 다크는 rgb(250 250 250 / 72%) | #171B22 (--louis-color-fg-primary, tokens.css:22) | `different` | `apps/web/app/globals.css:33` |
| 전경 ghost | #777d89 (--palette-gray-600) — secondary와 동일 | #575D68 (--louis-color-fg-secondary, tokens.css:23) — secondary와 다른 단계 | `different` | `apps/web/components/ui/Button.tsx:118` |
| 전경 danger | #fafafa (--palette-gray-000) | #541119 (--louis-color-fg-danger, tokens.css:27) | `different` | `apps/web/components/ui/Button.tsx:128` |
| hover secondary | background: rgb(23 27 34 / 5%) 오버레이 (다크 rgb(250 250 250 / 8%)) | background → #EAEBEE (--louis-color-bg-inset, tokens.css:10) 불투명 | `different` | `apps/web/components/ui/Button.tsx:108` |
| hover ghost | background: rgb(23 27 34 / 8%) (다크 rgb(250 250 250 / 10%)) | background → #EAEBEE — secondary와 같은 값 (button.css:83-86) | `different` | `apps/web/components/ui/Button.tsx:119` |
| hover danger | opacity: 0.85 | hover 규칙 없음 — danger는 base 배경을 유지한다 (button.css:79-86에 danger 없음) | `different` | `apps/web/components/ui/Button.tsx:130` |
| active/pressed 크기 | transform: scale(0.98) (ghost만 0.97) | scale: 0.98 — 전 variant 동일 (button.css:93-95) | `different` | `apps/web/components/ui/Button.tsx:85` |
| disabled 표현 | opacity만 — primary 0.35 / secondary 0.45 / ghost 0.5 / danger 0.4. 색·배경·테두리는 그대로 | 전경 → #9AA0AB, primary·danger 배경 → #EAEBEE, secondary border → #E3E4E8 (button.css:108-122) | `different` | `apps/web/components/ui/Button.tsx:102` |
| 그림자 | primary·danger에 글래스 베벨 2겹 — inset 0 1px 1px rgb(250 250 250 / 25%), inset 0 -1px 1px rgb(250 250 250 / 25%) | 없음 (button.css에 box-shadow 선언 0건) | `ds-missing` | `apps/web/components/ui/Button.tsx:94` |
| 오버레이 레이어(primary ::before) | ::before inset:0, box-shadow: inset 0 0 8px 0 rgb(250 250 250 / 100%), mix-blend-mode: overlay | 없음 — pseudo element 레이어 자체가 없다 | `ds-missing` | `apps/web/components/ui/Button.tsx:96` |
| 타이포 sm | 14px / 500 / 1.5 / -0.14px — md와 동일. size가 타이포를 바꾸지 않는다 | 12px / 500 / 1.5(=18px) / -0.12px (--louis-typography-caption-medium-*, tokens.css:128-131) | `different` | `apps/web/components/ui/Button.tsx:185` |
| font-family | var(--font-pretendard) 단일 (JA 로케일에서만 --font-pretendard-jp 선행). \[font-family:inherit\]로 상속 | "Pretendard Variable", "Pretendard", "Inter", "Noto Sans KR", "Noto Sans JP", system-ui, sans-serif (tokens.css:112) | `different` | `apps/web/app/globals.css:333` |
| 줄바꿈/오버플로 | white-space: nowrap — 긴 라벨이 잘리거나 넘친다 (랜딩 셸에서는 전역 text-wrap:balance가 이겨 뒤집힌다) | overflow-wrap: break-word + text-align: center + min-width: 0 — 넘칠 때만 끊고 줄바꿈 (button.css:24-26) | `different` | `apps/web/components/ui/Button.tsx:49` |
| 애니메이션 대상/시간/이징 | background-color 140ms ease, border-color 140ms ease, opacity 140ms ease, filter 140ms ease, transform 120ms ease (색 전환 포함) | opacity, transform만 120ms cubic-bezier(0.4, 0, 1, 1). 색 전환은 두지 않는다 (button.css:27-30, tokens.css:65-66) | `different` | `apps/web/components/ui/Button.tsx:51` |
| reduced-motion | 처리 없음 — Button.tsx 전체에 prefers-reduced-motion 선언 0건. 140/120ms transition과 scale이 그대로 실행 | transition-duration 0ms + active scale 1 (button.css:97-105), spinner iteration 1회 (button.css:170-176) | `product-missing` | `apps/web/components/ui/Button.tsx:51` |
| focus-visible | outline: none — 전역이 button:focus-visible의 outline을 명시적으로 제거한다. 버튼에 포커스 표시가 없다 | outline: 2px solid #0088FF, outline-offset: 2px (.louis-focus-ring, base.css:22-25 + tokens.css:16) | `different` | `apps/web/app/globals.css:1013` |
| hit target (최소 터치 영역) | 없음 — 실측 박스가 전부. md 40×라벨폭, sm 32×48. 44px 미달 | ::after로 max(100%, 44px) 정사각 보장 (.louis-hit-target, base.css:36-48 + tokens.css:52) | `product-missing` | `apps/web/components/ui/Button.tsx:57` |
| 아이콘 슬롯 크기 | 없음 — span에 inline-flex items-center만. 호출부가 넘긴 아이콘 크기가 그대로 들어온다 | md 20px / sm 16px 고정 슬롯 + flex:none, 글리프를 100%로 슬롯에 맞춤 (button.css:138-157) | `product-missing` | `apps/web/components/ui/Button.tsx:155` |
| loading / progress indicator | 없음 — loading prop도 spinner 요소도 ButtonProps(157-166)에 존재하지 않는다 | data-loading=true + .louis-button__spinner (1em 정사각, border 2px currentColor, radius 999px, 1s linear infinite), label opacity 0.6, aria-busy (button.css:125-127,159-182) | `product-missing` | `apps/web/components/ui/Button.tsx:157` |
| z-index / 레이어 | 루트 relative + \[transform:translateZ(0)\] 로 stacking context 생성, ::before는 z-index 없이 inset:0 (primary 한정). 라벨 span에는 z-index 없어 ::before가 mix-blend-overlay로 라벨 위에 얹힌다 | position: relative만, z-index 선언 없음. 오버레이 레이어가 없으므로 stacking 경쟁도 없다 (button.css:9) | `different` | `apps/web/components/ui/Button.tsx:99` |
| forced-colors (고대비) | 처리 없음 — Button.tsx에 forced-colors 선언 0건 | border-color: currentColor로 경계만 남기고 시스템 색에 양보 (button.css:185-189) | `product-missing` | `apps/web/components/ui/Button.tsx:44` |
| 상태 표현 메커니즘 | className 문자열 조합 (VARIANT_CLASS 맵 + 삼항). 상태는 CSS 의사클래스, 변형은 클래스 문자열 | data-variant / data-size / data-loading 속성만으로 표현 (button.tsx:56-59, DS-D-0004) | `different` | `apps/web/components/ui/Button.tsx:184` |

비고.

- 정의가 몇 벌인가 — 공용 Button은 1벌이고 호출부는 17개 파일 32곳뿐이다. 반대로 raw <button> 엘리먼트는 apps/web 안에 626개(119개 파일)이고, 버튼 크롬을 손으로 정의한 스타일 상수는 tsx의 `const *BUTTON* = \[` 180벌(73개 파일) + scene 스타일 객체의 *Button 키 16벌 = 약 196벌이다. 즉 제품의 버튼 계약은 사실상 공용 컴포넌트가 아니라 화면별 정의가 소유하고 있다. 이 자체가 가장 큰 gap이다.
- rows는 가장 널리 쓰이는 공용 Button.tsx(variant=primary, size=md)를 기준으로 적었다. 아래는 벌 사이 차이다.
- 치수가 벌마다 다르다 — 높이: 40px(공용 md), 32px(공용 sm / appHomeSceneStyles.ts:170-171 archiveMoreButton / VideoEditScene.tsx:302 HISTORY_MORE_BUTTON / myPageSceneStyles.ts:327 min-height / ComposerBar.tsx:139 ASSET_FOOTER_BUTTON h-16 / NodePromptGenerateButton.tsx:35 h-16), 36px(highlightSceneStyles.ts:17-18 backButton), 30px(ComposerBar.tsx:78 VIEW_MODE_BUTTON_BASE h-15), 28px(appHomeSceneStyles.ts:411-412 bannerArrowButton / highlightSceneStyles.ts:2457-2458 viewToggleButton). DS는 39/28 두 값뿐이고, 그 중 어느 것과도 일치하는 제품 값이 없다.
- radius가 벌마다 다르다 — 12px(공용 Button, appHomeSceneStyles.ts:173, VideoEditScene.tsx:303, myPageSceneStyles.ts:329, NodePromptGenerateButton.tsx:22 — 모두 --button-radius 공유), 999px(appHomeSceneStyles.ts:415, highlightSceneStyles.ts:20, ComposerBar.tsx:78/139/149/257 — 하드코딩), 8px(highlightSceneStyles.ts:650 downloadAllButton, highlightSceneStyles.ts:2459 viewToggleButton). --button-radius를 쓰는 벌만 DS 12px와 우연히 같다.
- padding-inline이 벌마다 다르다 — 16px(공용 md), 12px(공용 sm / ComposerBar.tsx:78 px-6 / ComposerBar.tsx:139 px-6 / myPageSceneStyles.ts:751), 8px(ComposerBar.tsx:149 px-4 / NodePromptGenerateButton.tsx:35 px-4 — 이 8px만 DS sm과 일치), 6px+12px(highlightSceneStyles.ts:649 downloadAllButton), 0(아이콘 정사각 버튼 전부).
- active scale이 벌마다 다르다 — 0.98(공용 primary/secondary/danger, myPageSceneStyles.ts:336), 0.97(공용 ghost, appHomeSceneStyles.ts:184, VideoEditScene.tsx:310, ComposerBar.tsx:143), 0.95(NodePromptGenerateButton.tsx:29), 0.94(appHomeSceneStyles.ts:424 bannerArrowButton). DS는 0.98 하나뿐이다.
- SSOT가 역전돼 있다 — 공용 Button의 primary 배경·이너섀도우·hover brightness(1.06)는 노드 캔버스 FAB(NodePromptGenerateButton.tsx:21-32)를 베낀 것이고, Button.tsx:87-90 주석이 이를 명시한다. 즉 제품의 primary 시각 계약을 소유하는 것은 공용 Button이 아니라 에디터의 특정 버튼이다.
- 라우트 단위 오버라이드가 존재한다 — apps/web/app/(highlight-standalone)/hl/page.module.css:55가 --node-prompt-generate-gradient를 #FFDD00 단색으로 덮어, 같은 <Button variant="primary">가 이 라우트에서만 노란 단색이 된다. 같은 파일의 :global(\[class*="Button_primary"\]) 훅 때문에 Button.tsx가 스타일 아닌 더미 클래스 PRIMARY_HOOK을 유지하고 있었으나, 배포본이 ada1b939에서 그 상수를 지웠다(hl-* 라우트가 삭제 예정이라 함께 사라졌다). 표본에서도 뺐고 값 변화는 없었다. DS에는 라우트별 variant 오버라이드 개념이 없다.
- 접근성 계약이 두 곳에서 깨진다 — (1) globals.css:1013-1022가 button의 :focus-visible outline을 전역으로 제거해 DS의 'light/dark/high contrast에서 focus-visible이 보인다' acceptance test가 제품에서는 성립할 수 없다. (2) 44×44 hit target 보장이 없어 sm(32×48)과 아이콘 버튼(28×28~36×36) 전부 미달이다.
- DS의 핵심 known deviation(아이콘 슬롯을 버튼이 소유해 아이콘 유무로 높이가 변하지 않게 한다)이 제품에는 반영돼 있지 않다. 제품은 대신 고정 높이로 문제를 덮고, 아이콘 쪽 padding만 2px 줄이는 광학 보정(Button.tsx:73-76)을 따로 넣었다 — DS에는 없는 축이다.
- 제품 색 스케일과 DS 토큰이 한 단계씩 어긋난다 — DS --louis-color-accent-primary #005FB3는 제품 --primary-700(globals.css:153)과 같은 값이고, DS --louis-color-stroke-focus #0088FF는 제품 --primary-500(globals.css:151)과 같은 값이다. 두 시스템이 같은 팔레트를 쓰되 액션 색으로 고른 단계가 다르다.
- danger의 방향이 정반대다 — DS는 토큰 부재로 tonal(#FFE5E8 배경/#541119 전경)을 known deviation으로 기록했고, 제품은 solid(#ff4b59 배경/#fafafa 전경)다. DS-P3-014 단위 9가 color-accent-danger*를 추가하면 제품 쪽이 정답에 가깝다.
- 제품 Button은 loading을 아예 모른다. 로딩 표현이 필요한 화면은 별도 컴포넌트(apps/web/components/ui/LoadingSpinner.tsx, InlineLoadingLabel.tsx)나 NodePromptGenerateButton.tsx:57-63의 자체 SPINNER(w-8 h-8 = 16px, border-2)로 각각 해결하고 있다. DS 스피너(1em, border 2px)와 크기 기준이 다르다.
- 이 조사에서 제품 저장소에는 아무것도 쓰지 않았고 git 상태를 바꾸는 명령도 실행하지 않았다. 모든 값은 읽기 전용 Read/grep/sed로 확인했고 CSS 변수는 :root(globals.css:14) 정의까지 따라가 최종 px/hex로 환산했다. Tailwind 임의값은 --spacing: 2px(apps/web/app/tailwind.css:164) 격자로 환산했다(gap-4=8px, gap-2=4px, h-16=32px, h-15=30px, px-6=12px, px-4=8px, w-8=16px).

## Icon Button

제품 구현 **20벌**.

- `apps/web/components/navigation/Gnb.tsx:191-262 (gnbStyles.iconButton, class "gnb-iconButton")` — style-object (Tailwind arbitrary-value 배열). 제품에서 유일하게 'iconButton'으로 명명된 것이자 전역 크롬이라 사실상의 기준 구현. rows는 이것을 기준으로 적었다
- `apps/web/components/navigation/Gnb.tsx:350-375 (gnbStyles.mainChromeSidebarToggle)` — ad-hoc style-object
- `apps/web/components/navigation/Gnb.tsx:1297-1312 (gnbStyles.profilePopoverClose)` — ad-hoc style-object
- `apps/web/components/navigation/Gnb.tsx:1483-1500 (gnbStyles.projectGuideButton)` — ad-hoc style-object (iconButton과 합성해서 씀)
- `apps/web/components/navigation/Gnb.tsx:1628-1645 (gnbStyles.projectSaveButton)` — ad-hoc style-object (iconButton과 합성해서 씀)
- `apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:2585-2608 (previewControlsBtn)` — ad-hoc style-object
- `apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:2680-2714 (previewDockZoomStepBtn)` — ad-hoc style-object
- `apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:4189-4220 (timelineDockToolbarBtn)` — ad-hoc style-object
- `apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:1048-1065 (headerCloseXBtn)` — ad-hoc style-object
- `apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:284-300 (alignButton), :405-420 (assetRailBtn), :596-610 (audioTrackMuteBtn), :1806-1820 (overlayDeleteBtn), :3701-3715 (shortcutCloseBtn), :4349-4365 (timelineVisibilityBtn)` — ad-hoc style-object (같은 파일 안에서만 6벌 더)
- `apps/web/components/scenes/highlightSceneStyles.ts:9-38 (backButton)` — ad-hoc style-object (36×36, radius 999px)
- `apps/web/components/scenes/highlightSceneStyles.ts:261-281 (clipModalClose)` — ad-hoc style-object
- `apps/web/components/scenes/highlightSceneStyles.ts:916-935 (historyMoreButton)` — ad-hoc style-object
- `apps/web/components/scenes/highlightSceneStyles.ts:1481-1512 (refinementExpandShellClose)` — ad-hoc style-object (gnb-iconButton과 값이 거의 같은 복제본)
- `apps/web/components/scenes/highlightSceneStyles.ts:1787-1806 (refinementPanelClose)` — ad-hoc style-object (28×28, radius 999px)
- `apps/web/components/scenes/appHomeSceneStyles.ts:167-186 (archiveMoreButton)` — ad-hoc style-object
- `apps/web/components/scenes/appHomeSceneStyles.ts:409-425 (bannerArrowButton)` — ad-hoc style-object (28×28)
- `apps/web/components/scenes/myPageSceneStyles.ts:214-232 (creditHistoryPageBtn)` — ad-hoc style-object (32×32, radius 8px, border 1px)
- `apps/web/components/scenes/create/NodeCanvasGuideModal.tsx:99-109 (GUIDE_MODAL_CLOSE_BUTTON)` — ad-hoc Tailwind 문자열 상수. 주석에 "iconButton 등과 동일한 시각 언어"라고 적고 손으로 다시 만들었다
- `packages/ui/src/` — shared 없음 — button.tsx, card.tsx, code.tsx 세 개뿐이고 icon-button은 존재하지 않는다

격차 16건.

| 축 | 제품 | DS | 분류 | 근거 |
| --- | --- | --- | --- | --- |
| 크기(한 변) | 32×32px 고정. width/min-width/max-width/height/min-height/max-height 6개 + flex:0 0 32px로 못박음 | md 40×40px, sm 32×32px (inline-size/block-size = --louis-layout-control-height-md 40px / -sm 32px) | `different` | `apps/web/components/navigation/Gnb.tsx:198` |
| size 스케일(단계 수) | 단계 없음. 32 하나만 존재하고, 다른 크기가 필요하면 새 style-object를 만든다 (28/32/36/40이 화면마다 흩어져 있다) | md/sm 2단. data-size="sm"으로 전환 | `product-missing` | `apps/web/components/navigation/Gnb.tsx:191` |
| border (두께·색) | border: 0. 두께도 색도 없다 | 1px solid transparent가 기본. secondary만 border-color를 --louis-color-stroke-default (light #D5D7DD / dark #777D89)로 채운다. disabled secondary는 --louis-color-stroke-subtle (light #E3E4E8 / dark #575D68) | `different` | `apps/web/components/navigation/Gnb.tsx:206` |
| 전경(글리프 색) | dark: rgb(250 250 250 / 82%), light: rgb(0 0 0 / 82%). 알파로 위계를 만든다 | ghost는 --louis-color-fg-secondary (light #575D68 / dark #D5D7DD). 불투명 토큰 색이고 알파를 쓰지 않는다. primary는 --louis-color-fg-inverse #FAFAFA | `different` | `apps/web/components/navigation/Gnb.tsx:211` |
| pressed (토글 켜짐) | gnb-iconButton 자체에는 축이 없다. 켜짐이 필요한 자리는 호출부에서 별도 클래스(gnb-projectGuideButtonActive)를 문자열로 덧붙여 만든다 — active(누르는 중)와 pressed(켜짐)가 컴포넌트 계약으로 분리돼 있지 않다 | \[aria-pressed="true"\] → background --louis-color-bg-inset (light #EAEBEE), color --louis-color-fg-primary (light #171B22 / dark #FAFAFA). active와 명시적으로 다른 축 | `product-missing` | `apps/web/components/navigation/Gnb.tsx:4360` |
| disabled | opacity: 0.56, cursor: default. 전경/배경 토큰은 그대로 두고 요소 전체를 반투명하게 만든다 | opacity를 쓰지 않는다. cursor: not-allowed, color → --louis-color-fg-disabled (light #9AA0AB / dark #777D89). primary/danger는 background → --louis-color-bg-inset #EAEBEE, secondary는 border-color → --louis-color-stroke-subtle #E3E4E8 | `different` | `apps/web/components/navigation/Gnb.tsx:220` |
| 그림자 | inset 0 1px 1px rgb(250 250 250 / 25%), inset 0 -1px 1px rgb(250 250 250 / 25%). glass bevel — --glass-bevel-offset 1px, --glass-bevel-blur 1px, --glass-inner-shadow-rgb = --palette-gray-000-rgb = 250 250 250 (테마 불변) | 없음. box-shadow 선언 자체가 없다 | `different` | `apps/web/components/navigation/Gnb.tsx:213` |
| backdrop-filter | blur(10px) | 없음 | `ds-missing` | `apps/web/components/navigation/Gnb.tsx:214` |
| 글리프 크기 | 컨테이너가 소유하지 않는다. 호출부 SVG의 width/height 하드코딩이 최종값이고 **16px과 20px이 섞인다** — 뒤로가기 16×16, 프로젝트 옵션 20×20. projectHeaderActionsShell 문맥에서만 `& > svg`로 20px을 강제한다(Gnb.tsx:241-242) | 20px 고정. .louis-icon-button__glyph의 inline-size/block-size = --louis-icon-size-md 20px. md/sm 두 크기에서 동일 | `different` | `apps/web/components/navigation/Gnb.tsx:4126` |
| 애니메이션 (시간·이징·대상) | transform 180ms ease, filter 180ms ease. filter를 전이 대상으로 쓴다 | opacity, transform만 120ms cubic-bezier(0.4, 0, 1, 1) (--louis-motion-overlay-exit-duration / -timing-function). motion.md가 허용 property를 opacity·transform으로 못박아 색·filter 전이를 금지한다 | `different` | `apps/web/components/navigation/Gnb.tsx:216` |
| prefers-reduced-motion | gnb-iconButton 정의(191-262)에 분기가 없다. 같은 파일 다른 요소에는 19곳 있지만 이 버튼은 감속 없이 180ms transform·filter를 그대로 실행한다 | @media (prefers-reduced-motion: reduce)에서 transition-duration → --louis-motion-reduced-duration 0ms, active의 scale → 1 | `product-missing` | `apps/web/components/navigation/Gnb.tsx:216` |
| focus ring | **없다.** 레이어 밖 전역 `button:focus, button:focus-visible, button:active { outline: none }`이 모든 버튼의 아웃라인을 끄고, gnb-iconButton은 대체 표현을 두지 않는다. 키보드 초점이 시각적으로 사라진다 | .louis-focus-ring:focus-visible → outline 2px solid --louis-color-stroke-focus (light #0088FF / dark #38A4FF), outline-offset 2px. forced-colors에서는 Highlight로 교체 | `product-missing` | `apps/web/app/globals.css:1022` |
| hit area (터치 타깃) | 확장 없음. 시각 박스 32×32가 곧 타깃이다. 제품 전체에 hit-target/hit-area 확장 유틸이 존재하지 않는다 | 44×44 보장. .louis-hit-target::after가 max(100%, --louis-layout-control-hit-target-minimum 44px)로 시각 박스와 무관하게 타깃만 넓힌다 | `product-missing` | `apps/web/components/navigation/Gnb.tsx:198` |
| variant 축 | 없다. variant 개념이 없고 자리마다 다른 style-object를 만든다 (투명/10% 면/12% 면/14% 면/50% 면이 화면별로 흩어져 있다) | primary / secondary / ghost / danger 4축, 기본 ghost. data-variant 속성 하나로 전환 | `product-missing` | `apps/web/components/navigation/Gnb.tsx:191` |
| 반응형 크기 전환 | gnb-iconButton은 없음(32 고정). 다만 같은 역할의 에디터 버튼들은 ≤719px에서 40×40으로 커지고 radius가 12 또는 14로 갈린다 — timelineDockToolbarBtn은 14px, previewControlsBtn은 12px | 없음. "뷰포트로 크기를 자동 전환하지 않는다"가 명시적 규범이고 radius는 12px 고정 | `different` | `apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:4218` |
| 상태 표현 메커니즘 | CSS 클래스 문자열 합성. 상태를 클래스 이름으로 붙였다 뗀다 (`${iconButton} ${projectGuideButton}${isNodeGuideOpen ? ` ${projectGuideButtonActive}` : ""}`) | data-* 속성으로만 표현 (data-variant, data-size, aria-pressed, aria-disabled). DS-D-0004 | `different` | `apps/web/components/navigation/Gnb.tsx:4360` |

비고.

- **제품에 공용 icon-button 컴포넌트가 없다는 사실 자체가 이 대조의 가장 큰 발견이다.** packages/ui/src에는 button.tsx, card.tsx, code.tsx 세 개뿐이고 icon-button은 없다. 아이콘 전용 정사각 버튼은 화면마다 Tailwind arbitrary-value 배열로 손으로 다시 만들어졌고, 위 productImplementations에 20벌 이상이 열거돼 있다 (VideoEditModal.tsx 한 파일 안에만 10벌).
- **한 변 길이가 벌마다 다르다.** 32×32(gnb-iconButton, profilePopoverClose, clipModalClose, historyMoreButton, archiveMoreButton, creditHistoryPageBtn, previewControlsBtn, timelineDockToolbarBtn, refinementExpandShellClose), 36×36(highlightSceneStyles.ts:17 backButton), 28×28(highlightSceneStyles.ts:1789 refinementPanelClose, appHomeSceneStyles.ts:411 bannerArrowButton, VideoEditModal.tsx:2692 previewDockZoomStepBtn). DS의 md 40px에 해당하는 데스크톱 크기는 제품 어디에도 없다 — 제품의 40×40은 모바일 확대분으로만 등장한다(VideoEditModal.tsx:4212, :2605).
- **radius도 벌마다 갈린다.** var(--button-radius)=12px(Gnb.tsx:207, VideoEditModal.tsx:2594·4203, highlightSceneStyles.ts:268), 8px(myPageSceneStyles.ts:222), 6px(VideoEditModal.tsx:2696), 999px 완전 원형(highlightSceneStyles.ts:22 backButton, :1792 refinementPanelClose). DS는 12px 하나뿐이다. icon-button.md의 Known deviations가 적은 "제품 32×32 radius 12 ↔ 모바일 40×40 radius 14"는 VideoEditModal.tsx:4195/4218의 timelineDockToolbarBtn 한 벌만 맞고, 같은 파일 previewControlsBtn(:2590/:2607)은 32→40에서 radius를 12로 유지한다. 즉 제품 안에서도 모바일 radius가 12와 14로 서로 어긋나 있으므로, DS 문서의 deviation 문장은 "제품이 ≤719px에서 radius를 14로 바꾼다"가 아니라 "제품이 벌마다 12/14로 갈린다"로 고쳐야 정확하다.
- **hover 표현 방식이 근본적으로 다르다.** 제품 주류는 `filter: saturate(125%) brightness(125%)`로 요소 전체(글리프 포함)를 밝히고, DS는 면 색 토큰만 교체한다. 제품 안에서도 두 방식이 섞여 있다 — filter 계열(Gnb.tsx:217, profilePopoverClose Gnb.tsx:1308, refinementExpandShellClose highlightSceneStyles.ts:1506, headerCloseXBtn VideoEditModal.tsx:1062)과 배경 교체 계열(mainChromeSidebarToggle Gnb.tsx:369, previewControlsBtn VideoEditModal.tsx:2600, timelineDockToolbarBtn VideoEditModal.tsx:4210). ProjectHeader.tsx:92의 주석은 filter 방식이 "호버 해제 시 filter 보간 깜빡임"을 일으켜 일부러 껐다고 적고 있다 — 제품 스스로 이 표현이 문제라고 기록한 셈이다.
- **focus ring 부재는 접근성 회귀다.** globals.css:1013-1022의 `button:focus, button:focus-visible, button:active { outline: none }`은 @layer 밖에 있어 레이어 안의 모든 규칙을 이긴다. 아이콘 버튼 대부분은 대체 focus 표현이 없다. 예외는 VideoEditModal.tsx:2703의 previewDockZoomStepBtn 하나뿐이고, 그마저 `!`(important)로 전역 리셋을 억지로 이겨야 했다. DS는 .louis-focus-ring을 컴포넌트가 직접 붙여 해결한다(icon-button.tsx:53).
- **hit target 44px 계약이 제품에 전혀 없다.** 제품 전체 grep에서 hit-target/hit-area/터치 타깃 확장 코드를 하나도 찾지 못했다. 32×32와 28×28 버튼은 시각 크기가 곧 타깃이며, WCAG 2.2 AA의 24px는 넘지만 DS가 내부 기준으로 삼은 44px에는 못 미친다. VideoEditModal이 모바일에서 40×40으로 키우는 것이 제품의 유일한 완화책이고 그것도 44에 못 미친다.
- **DS 쪽 결함도 하나 있다.** .louis-icon-button은 `inline-size: 40px`과 `border: 1px solid transparent`(icon-button.css:15-17)를 함께 쓰는데 box-sizing을 선언하지 않는다. reset.css는 첫 줄에 "opt-in reset — 기본 배포에 포함되지 않는다"고 적혀 있으므로(reset.css:1-5), 소비자가 reset을 import하지 않으면 content-box가 적용되어 border box가 **42×42**가 된다. icon-button.md의 Specification과 Acceptance test 1("md가 40×40")이 reset 없이도 성립하려면 icon-button.css가 box-sizing: border-box를 직접 소유해야 한다. 제품은 이 문제를 요소마다 box-sizing:border-box를 명시해서 피하고 있다(Gnb.tsx:204).
- **pressed/active 축 분리가 제품에 없다.** DS는 aria-pressed(토글 켜짐)와 :active(누르는 중)를 다른 시각으로 나눈다. 제품 gnb-iconButton은 :active만 갖고, 토글 켜짐은 호출부에서 클래스 문자열을 덧붙여 만든다(Gnb.tsx:4360). 스크린리더에 상태가 노출되는지는 aria-pressed 속성 유무로 갈리는데 gnb-iconButton 호출부에는 aria-pressed가 없고 aria-expanded만 일부 쓰인다(Gnb.tsx:5109).
- **색 시스템의 팔레트는 이미 같다.** 제품 --palette-gray-000 #fafafa, -200 #e3e4e8, -300 #d5d7dd, -500 #9aa0ab, -700 #575d68, -900 #171b22(globals.css:20-51)는 DS tokens.css의 foreground/border 토큰 최종값과 일치한다. 다른 것은 팔레트가 아니라 **그 팔레트를 알파로 쓰느냐 불투명 시맨틱 토큰으로 쓰느냐**다. 제품은 rgb(var(--gray-000-rgb) / 82%)처럼 알파로 위계를 만들고, DS는 --louis-color-fg-secondary 같은 불투명 토큰을 쓴다. 이것이 adoption에서 가장 손이 많이 갈 지점이다.
- **제품의 --gray-000 계열은 테마별로 의미가 뒤집힌다.** html\[data-theme=dark\]에서 --gray-000 = --palette-gray-000(#fafafa), html\[data-theme=light\]에서 --gray-000 = --palette-gray-1000(#000)이다(globals.css:652, 706). 즉 --gray-000은 '가장 밝은 회색'이 아니라 사실상 '전경색' 역할을 하는 반전 축이다. 값을 옮길 때 이름만 보고 매핑하면 라이트 테마에서 색이 뒤집힌다.
- **모든 값은 배포된 제품 소스에서 읽었고 별도 CSS 파일이 아니라 .ts/.tsx 안의 Tailwind arbitrary-value 문자열이 최종 계약이다.** 유일한 CSS Module들((highlight-standalone)/**/page.module.css)에는 아이콘 전용 정사각 버튼이 없다 — hl/\[projectId\]/page.module.css의 .retryBtn/.backBtn은 라벨 버튼이다.
- gap 축과 타이포 축은 양쪽 모두 선언이 없어 same으로 적었지만, 제품 일부 벌은 타이포를 명시한다 — myPageSceneStyles.ts:227이 font-size: var(--type-body-14-size)(=14px, globals.css:362)를 `!`로 강제한다. 그 벌은 아이콘 대신 텍스트 화살표를 넣기 때문이며, DS의 "children은 아이콘 하나다. 텍스트를 넣지 않는다" 규범과 어긋난다.

## Menu / Popover

제품 구현 **19벌**.

- `packages/ui/src` — 공용 컴포넌트 없음 — button.tsx, card.tsx, code.tsx 3개뿐. menu/popover/dropdown 공용 구현이 제품 저장소에 존재하지 않는다
- `apps/web/app/globals.css:73,76,77,78,93,65` — shared (토큰만) — --dropdown-ambient-shadow / --dropdown-radius / --dropdown-padding / --dropdown-item-radius / --dropdown-surface-bg / --glass-dropdown-frame. 제품에서 '공용'인 것은 이 CSS 변수 6개가 전부다
- `apps/web/components/scenes/appHomeSceneStyles.ts:57-122` — style-object (archiveDropdown / archiveDropdownItem / archiveDropdownItemDanger / archiveDropdownOpen) — 카드 '더보기' 액션 메뉴. rows의 기준
- `apps/web/components/scenes/highlightSceneStyles.ts:815-870` — style-object (historyDropdown / historyDropdownItem / historyDropdownItemDanger) — 위와 값까지 동일한 2번째 벌
- `apps/web/components/scenes/VideoEditScene.tsx:316-360` — ad-hoc (HISTORY_DROPDOWN_BASE / _CLOSED / _OPEN / _ITEM_BASE / _ITEM_TONE_*) — 3번째 벌
- `apps/web/components/scenes/NodeCanvasHomeScene.tsx:393-440` — ad-hoc (ARCHIVE_DROPDOWN_* ) — 4번째 벌
- `apps/web/components/scenes/highlightSceneStyles.ts:1997-2014` — style-object — highlight 서브메뉴 표면(5번째 벌, left: calc(100% + padding) 배치)
- `apps/web/components/scenes/highlightSceneStyles.ts:2131-2136` — style-object — highlight 6번째 드롭다운 표면
- `apps/web/components/scenes/HomeCreateNewMenu.tsx:34-56` — ad-hoc 컴포넌트 — 홈 '새로 만들기' action-menu. role=menu/menuitem, aria-haspopup 있음
- `apps/web/components/navigation/Gnb.tsx:1264-1361, 1033-1112` — style-object — 프로필 composite popover(profilePopover / profilePopoverOpen / profilePopoverEmbedded / profileMenuItem / profileMenuDivider / profileMenuItemDanger)
- `apps/web/components/navigation/Gnb.tsx:1130-1167` — style-object — 프로필 안 언어 nested overlay(profileMenuLanguageMenu / Option), z-index 1200
- `apps/web/components/landing/navigation/Gnb.tsx:189-211` — ad-hoc (PANEL_INNER / PRODUCT_ITEM) — 랜딩 제품 드롭다운. 폭 220px 고정, 다크에서도 라이트 표면 강제
- `apps/web/components/landing/system/LanguageSelector.tsx:109-160` — ad-hoc (MENU / OPTION) — body portal 언어 listbox 팝오버
- `apps/web/components/scenes/create/node-canvas-v2/nodes/NodeSideButtons.tsx:250-289` — ad-hoc — --menu-pad:4px 계열. 공용 --dropdown-padding(6px)·--dropdown-item-radius(10px)를 쓰지 않는다
- `apps/web/components/scenes/create/node-canvas-v2/nodes/TextNode.tsx:179-191` — ad-hoc — 위와 같은 --menu-pad:4px 계열
- `apps/web/components/scenes/create/node-canvas-v2/nodes/ColorPopover.tsx:252-256` — ad-hoc — nested color picker 팝오버
- `apps/web/components/scenes/create/node-canvas-v2/nodes/YoutubeNode.tsx:503-504` — ad-hoc — 노드 메뉴 표면
- `apps/web/components/scenes/HighlightCreateModal.tsx@086f4a62:34` — **제품에서 사라졌다**(98c421ea에서 파일째 삭제). ad-hoc — --dropdown-radius/surface-bg 를 모달 표면에 전용했었다
- `apps/web/components/scenes/create/CustomDropdown.tsx:53,114` — ad-hoc — --dropdown-surface-bg/item-radius만 부분 차용한 listbox

격차 34건.

| 축 | 제품 | DS | 분류 | 근거 |
| --- | --- | --- | --- | --- |
| 패널 최소 폭 | 160px | min(max(200px, anchor 폭), 사용 가능 폭) — action-menu 기준 200px | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:62` |
| 패널 폭 상한 / 뷰포트 대응 | 선언 없음 (max-width 없음) | max-width: var(--louis-overlay-available-width, 100vw) | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:57-84` |
| 패널 최대 높이 / 내부 스크롤 | 선언 없음. overflow 선언도 없고 overscroll-behavior:none만 있다 | max-height: var(--louis-overlay-available-height, 100vh); overflow: auto; overscroll-behavior: contain | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:71` |
| 패널 padding (inset) | 6px — var(--dropdown-padding) | 4px (action-menu, --louis-space-control-xs) / 8px (composite-popover, --louis-space-control-sm) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:66 → apps/web/app/globals.css:77` |
| 패널 gap (항목 사이) | 2px | 0 (action-menu는 gap 미선언, 행이 붙는다) / 8px (composite-popover) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:65` |
| 패널 border (두께·색) | border: none. 헤어라인은 box-shadow 스프레드로 그린다 — 0 0 0 0.5px #575d68 (dark) / 0 0 0 0.5px #d5d7dd (light) | border: 1px solid var(--louis-color-stroke-subtle) → light #E3E4E8 / dark #575D68 (실제 border, 레이아웃 차지) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:67,70 → apps/web/app/globals.css:65,586,34,30` |
| 패널 배경 | dark #313640 (rgb(49 54 64), 불투명) / light #f1f1f3 (rgb(241 241 243), 불투명) | dark #313640 / light #FAFAFA — var(--louis-color-bg-overlay) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:69 → apps/web/app/globals.css:93,587,50,42` |
| 패널 그림자 (elevation) | 0px 8px 15px 0px rgba(0,0,0,0.04) + 0 0 0 0.5px 헤어라인 | 0px 8px 24px -4px rgba(0,0,0,0.14) — var(--louis-elevation-popover) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:70 → apps/web/app/globals.css:73` |
| 충돌 여백 (collision padding) | 선언 없음. flip/shift 로직 자체가 없다 | 8px — --louis-overlay-collision-padding, positioner가 읽어 flip/shift | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:57-84` |
| z-index / 레이어 | 1100 (숫자 리터럴). 프로필 nested 언어 메뉴는 1200, HomeCreateNewMenu는 40, LanguageSelector는 2000 | 200 — .louis-layer-popover { z-index: var(--louis-layer-popover) }, 리터럴 금지 | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:73` |
| 포털 / 스태킹 컨텍스트 | 포털 없음. 카드 subtree 안 position:absolute | overlay root로 portal + layer 토큰 (positioner.tsx, use-overlay.tsx가 louis-overlay-panel + louis-layer-* 부여) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:59` |
| 항목 높이 | 37px (계산값: padding-block 8+8 + line-height 21px). min-height 선언 없음 | min-block-size: 44px — var(--louis-layout-control-hit-target-minimum) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:92 → apps/web/app/globals.css:1175,1176,362,363` |
| 항목 gap | 6px | 8px — var(--louis-space-control-sm) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:90` |
| 항목 전경 (기본) | dark rgb(250 250 250 / 86%) / light rgb(23 27 34 / 86%) — 알파 86% | dark #FAFAFA / light #171B22 — 알파 100% (color: inherit ← 패널의 --louis-color-fg-primary) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:96,102 → apps/web/app/globals.css:664,40,51` |
| 항목 hover 배경 | dark rgb(250 250 250 / 10%) / light rgb(23 27 34 / 6%) — 반투명 오버레이 | var(--louis-color-bg-inset) → light #EAEBEE / dark #313640 — 불투명 면 | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:101,103` |
| 항목 키보드 하이라이트 (roving) | 선언 없음. hover만 있고 방향키 하이라이트 개념이 없다 | \[data-highlighted="true"\]가 hover와 같은 표현을 공유 | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:86-105` |
| 항목 active / pressed | 카드 메뉴에는 선언 없음. 프로필 팝오버만 background: rgb(250 250 250 / 12%) (dark) / rgb(0 0 0 / 10%) (light) | 선언 없음 (DS도 active 표현이 없다) | `different` | `apps/web/components/navigation/Gnb.tsx:1057,1058,1285,1292` |
| 항목 disabled | 선언 없음. cursor·색 변화 없음 | cursor: not-allowed + color light #9AA0AB / dark #777D89 (--louis-color-fg-disabled). :disabled와 \[aria-disabled="true"\] 둘 다 | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:86-105` |
| 항목 focus-visible ring | 선언 없음 (카드 메뉴·프로필 메뉴 항목 모두) | .louis-focus-ring — outline 2px solid light #0088FF / dark #38A4FF, outline-offset 2px | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:86-105` |
| danger 항목 전경 | #ff4b59 (양 테마 동일) — var(--accent-red-500) | light #541119 / dark #FFE5E8 — var(--louis-color-fg-danger). 문서가 인정한 대비 결함(light 1.21, dark 1.14) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:109 → apps/web/app/globals.css:226` |
| danger 항목 hover 배경 | dark rgb(255 75 89 / 12%) / light rgb(255 75 89 / 10%) | var(--louis-color-bg-danger) → light #FFE5E8 / dark #541119 (불투명 면) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:110,111 → apps/web/app/globals.css:235` |
| 구분선 (separator) | 카드 메뉴에는 없음. 프로필 팝오버만 height 1px, margin 4px 10px, background dark #575d68 / light #e3e4e8 | border-block-start 1px solid var(--louis-color-stroke-subtle) (dark #575D68 / light #E3E4E8), margin-block 4px, margin-inline 0 | `different` | `apps/web/components/navigation/Gnb.tsx:1033,1034,1035,1036,1037,1286,1293` |
| group label | 선언 없음 | .louis-menu__group-label — padding 4px 12px, 12px/500/1.5/-0.12px, color foreground-secondary (light #575D68 / dark #D5D7DD) | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:57-122` |
| 항목 아이콘 크기 | 카드 메뉴에는 아이콘 없음. HomeCreateNewMenu 20×20 마스크(opacity 0.92), 프로필 항목 20×20(opacity 0.7) | .louis-menu__item-icon — 크기 미지정, flex:none으로 내용 크기를 따른다 | `different` | `apps/web/components/scenes/HomeCreateNewMenu.tsx:60` |
| 단축키/보조 텍스트 (trailing) | 선언 없음 | .louis-menu__item-trailing — 12px/400/1.5, color foreground-secondary, disabled 시 inherit | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:86-105` |
| busy(진행 중) 항목 | 선언 없음 | .louis-menu__spinner 1em 원형 + \[aria-busy="true"\] 라벨 opacity 0.6 | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:86-105` |
| 열림 애니메이션 (시간·이징) | transform 260ms cubic-bezier(0.32,0.72,0,1). 단축 교체로 opacity 전이는 제거된다(즉시 불투명) | opacity + scale, 200ms cubic-bezier(0.32,0.72,0,1) — --louis-motion-overlay-enter-* | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:119` |
| 닫힘 애니메이션 (시간·이징) | opacity 130ms ease-in, transform 130ms ease-in | opacity 120ms cubic-bezier(0.4,0,1,1) — --louis-motion-overlay-exit-* | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:78` |
| enter scale 값 | scale(0.92) → scale(1) | scale 0.96 → 1 | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:76,118` |
| transform-origin (확장 원점) | top right 하드코딩 (배치가 flip돼도 원점이 안 따라간다) | var(--louis-overlay-transform-origin) — anchor·placement에서 계산 | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:77` |
| reduced-motion | transform: none + transition: opacity 120ms ease (여전히 120ms 페이드) | transition-duration 0ms(--louis-motion-reduced-duration) + opening scale 1. exit 타이머도 같은 선언을 읽어 함께 0 | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:82,83,120,121` |
| 닫힘 상태의 DOM/히트테스트 | opacity 0 + pointer-events: none로 상시 마운트. inert/hidden 없어 자손이 Tab 순서에 남는다 | presence primitive가 closing 뒤 unmount, 위치 확정 전 비가시·비 hit-test | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:74,75` |
| forced-colors (고대비) | 선언 없음 | border-color currentColor, hover/highlight를 Highlight/HighlightText로, disabled를 GrayText로, danger 선택자 재선언까지 | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:57-122` |
| 장식 pseudo-element pointer 차단 | 선언 없음 (프로필 배지 ::after만 개별적으로 pointer-events:none) | .louis-popover/.louis-menu__item/.louis-menu__group-label의 ::before/::after 전부 pointer-events: none | `product-missing` | `apps/web/components/navigation/Gnb.tsx:1076` |

비고.

- 가장 큰 발견: 제품에 menu/popover 공용 컴포넌트가 없다. /Users/sejunki/klipse/packages/ui/src 에는 button.tsx, card.tsx, code.tsx 3개뿐이고 메뉴는 화면마다 손으로 만들어져 있다. 위 productImplementations에 17개 정의를 전부 적었다.
- 제품에서 실제로 '공용'인 것은 컴포넌트가 아니라 CSS 변수 6개다 — globals.css:73(ambient-shadow), :76(radius 16px), :77(padding 6px), :78(item-radius 10px), :93/:587(surface-bg), :65/:586(hairline frame). 이 6개는 모든 벌이 공유하므로 radius/padding/item-radius/배경/그림자 축은 벌 사이에 차이가 없다. 반대로 토큰이 없는 축(폭, 항목 높이, 항목 gap, 앵커 간격, 모션, z-index, 전경색)은 벌마다 값이 갈린다.
- rows의 기준으로 잡은 카드 '더보기' 액션 메뉴는 4벌이 값까지 동일하다: appHomeSceneStyles.ts:57, highlightSceneStyles.ts:815, VideoEditScene.tsx:316, NodeCanvasHomeScene.tsx:393. VideoEditScene/NodeCanvasHomeScene은 Tailwind 유틸(py-4 px-6 gap-3)로 적혀 있지만 tailwind.css:164의 --spacing:2px 때문에 계산값이 8px/12px/6px로 같다.
- HomeCreateNewMenu(홈 '새로 만들기')는 같은 계열이면서 값이 다르다: 앵커 간격 6px(HomeCreateNewMenu.tsx:35, 카드 메뉴는 8px), min-width 200px(:36), 항목 height 40px 고정(:46), 항목 padding 0 10px·gap 10px(:46), z-index 40(:35, 카드 메뉴는 1100), 항목 굵기 500(type-body-14-medium, :148 → globals.css:1181-1186, 카드 메뉴는 400), hover가 dark rgb(250 250 250 / 10%) / light rgb(0 0 0 / 6%)로 light만 palette 대신 순수 검정(:54,:55). 열림 모션도 transition이 아니라 keyframes animate-\[createMenuPopIn 130ms cubic-bezier(0.16,1,0.3,1)\] (:42)로 완전히 다르다.
- 프로필 composite popover(navigation/Gnb.tsx:1264-1361)는 DS의 composite-popover 기준폭 240px과 폭만 일치한다(:1269). 나머지는 다르다 — overflow:hidden(:1270)이라 내용이 넘치면 잘리고(DS는 overflow:auto + max-height), 패널 gap 0(:1343, DS는 8px), 항목 height 40px·padding 0 10px·gap 10px(:1044,1046,1047), 그리고 열림/닫힘 duration이 비대칭이다(opacity 200ms + transform 260ms 열림 :1358, 130ms 닫힘 :1280). 기본 배치는 앵커 기반이 아니라 position:fixed top 12px right 12px(:1266,1267,1268)이고, embedded variant일 때만 top: calc(100% + 8px)(:1349)로 앵커를 따른다.
- node-canvas 계열 2벌만 패널 padding이 4px이다 — NodeSideButtons.tsx:253, TextNode.tsx:180의 \[--menu-pad:4px\]. 이 두 벌은 공용 --dropdown-item-radius(10px)도 쓰지 않고 calc(var(--dropdown-radius) - var(--menu-pad)) = 12px로 따로 계산한다(NodeSideButtons.tsx:289, TextNode.tsx:191). 같은 저장소 안에서 항목 radius가 10px과 12px 두 종류로 갈린다.
- LanguageSelector(landing/system/LanguageSelector.tsx)는 min-width 140px(:113), 항목 높이 34px(h-17, :147), padding 0 10px(:149)로 또 다른 3번째 치수 체계다. 랜딩 Gnb 제품 드롭다운(landing/navigation/Gnb.tsx:190)은 폭 220px 고정에 항목 padding 8px(p-4, :202)·gap 14px(gap-7, :202)이고, 다크 테마에서도 라이트 표면 rgb(241 241 243)을 강제한다(:195).
- DS 쪽 결함도 하나 실측됐다: tokens.css:165의 --louis-color-bg-inset와 :167의 --louis-color-bg-overlay가 다크에서 동일 값 color(srgb 0.192157 0.211765 0.25098) = #313640이다. 즉 DS 다크에서 항목 hover 배경이 패널 배경과 같은 색이라 하이라이트가 보이지 않는다. 제품은 알파 오버레이(10%)를 써서 이 문제가 없다 — 이 축은 제품 방식이 더 안전하다.
- danger 톤도 제품이 낫다. 제품은 #ff4b59 단색을 양 테마에 쓰고(globals.css:226) 배경은 그 색의 10~12% 알파라 전경/배경이 항상 분리된다. DS는 status-danger-foreground/background 쌍이 테마 간에 서로 뒤바뀌어(tokens.css:26,27,181,182) 문서가 인정한 대비 1.21(light)/1.14(dark) 결함이 남아 있다.
- 히트 타깃: 제품 어느 벌에도 min-height 44px가 없다. 카드 메뉴 37px(계산값), 프로필·생성 메뉴 40px, LanguageSelector 34px. DS는 행 자체를 44px로 만든다(menu-popover.css:94). 320px/200% 확대 대응(min-inline-size를 available-width로 clamp), flip/shift, 내부 스크롤도 제품에는 전부 없다.
- 접근성 표현이 통째로 빠져 있다: focus-visible ring(카드 메뉴·프로필 메뉴 항목 모두 없음), disabled 상태, forced-colors 블록, roving 하이라이트, 선택 표시, group label, trailing 텍스트가 제품 어느 벌에도 없다. role=menu/menuitem을 붙인 곳은 HomeCreateNewMenu.tsx:142,147과 landing/navigation/Gnb.tsx:790,830,847 정도이고 카드 '더보기' 메뉴에는 role도 없다.
- 닫힌 패널을 opacity 0 + pointer-events:none으로 상시 마운트하는 방식(appHomeSceneStyles.ts:74,75)은 menu-popover.md:104-105가 명시적으로 금지한 패턴이다 — 안의 버튼이 Tab 순서와 accessibility tree에 그대로 남는다. 4벌 전부 이 방식이다.
- 측정에 쓴 변수 해소 경로: --dropdown-padding=6px(globals.css:77), --dropdown-radius=16px(:76), --dropdown-item-radius=10px(:78), --dropdown-surface-bg=rgb(49 54 64)/rgb(241 241 243)(:93,:587 → :50,:42), --glass-dropdown-frame=0 0 0 0.5px #575d68 / #d5d7dd(:65,:586 → :34,:30), --dropdown-ambient-shadow=0px 8px 15px 0px rgba(0,0,0,0.04)(:73), --gray-000-rgb=250 250 250(dark, :664→:40) / 0 0 0(light, :718→:52), --accent-red-500=#ff4b59(:226), --ease-out-strong=cubic-bezier(0.32,0.72,0,1)(:17), type-body-14-*=14px/1.5/-0.01em, weight 400\|500(:1174-1186,:362-364,:336,:337), Tailwind --spacing=2px(apps/web/app/tailwind.css:164).

## Dialog

제품 구현 **14벌**.

- `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx` — ad-hoc (준-공용 confirm 셸. PlanGateModal·NodeDeleteConfirmModal·CreditConfirmModal이 감싸 재사용. rows의 기준)
- `apps/web/components/scenes/create/ConfirmModal.tsx` — ad-hoc (같은 시각 계약의 별도 벌. portal·role·aria 전무)
- `apps/web/components/projects/CreateProjectModal.tsx` — ad-hoc (같은 셸 상수를 각 파일에 복제)
- `apps/web/components/signup/SignupLegalModal.tsx` — ad-hoc (같은 셸 + 720px 폭 변형)
- `apps/web/components/scenes/create/node-canvas-v2/components/PromptVariantCompareModal.tsx` — ad-hoc (같은 셸 복제)
- `apps/web/components/scenes/create/PricingModal.tsx` — ad-hoc (720px 카드 + 헤더/닫기 버튼)
- `apps/web/components/scenes/create/ImageCropModal.tsx` — ad-hoc (radius 10px 벌)
- `apps/web/components/scenes/create/node-canvas-v2/nodes/CropModal.tsx` — ad-hoc (radius 16px, 2px border 벌)
- `apps/web/components/scenes/HighlightCreateModal.tsx@086f4a62` — **제품에서 사라졌다**(98c421ea에서 파일째 삭제). ad-hoc (--dropdown-radius/--dropdown-surface-bg 토큰 벌, 스크림 색 계열이 다름)
- `apps/web/components/youtube/YoutubeUploadModal.tsx` — ad-hoc (스크림 55% + blur 8px 벌)
- `apps/web/components/scenes/create/NodeCanvasGuideModal.tsx` — ad-hoc (fullscreen 벌, radius 0)
- `apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx` — style-object (vem.* 클래스 상수 객체. DS가 Workspace로 분리하라고 규정한 docked editor를 modal shell로 구현)
- `apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/ClipCropModal.tsx` — ad-hoc (absolute inset-0 + z-80, 뷰포트가 아닌 부모 기준)
- `apps/web/components/scenes/create/node-canvas-v2/NodeCanvasAnalysisModal.tsx` — ad-hoc (rounded-\[inherit\] 스크림)

격차 22건.

| 축 | 제품 | DS | 분류 | 근거 |
| --- | --- | --- | --- | --- |
| z-index / 레이어 | 10200 (숫자 리터럴). 벌마다 다름: 9999(CropModal·VideoEditModal·PricingModal·NodeCanvasGuideModal), 1300(YoutubeUploadModal), 1200(ConfirmModal), 1010(ImageCropModal), 200(HighlightCreateModal), 80(ClipCropModal) | 300 = var(--louis-layer-modal). .louis-layer-modal 클래스로만 부여하고 숫자 리터럴을 금지 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:38` |
| 크기 — 카드 폭 | min(360px, 100vw − 40px). 좌우 20px gutter가 폭 계산식 안에 들어 있음. 높이 상한 없음(내용 구동) | min(480px, 100%) 기본(task/medium), compact 360px, large 720px, fullscreen 100%. gutter는 root padding이 소유. 높이 상한 min(100%, 100dvh − 40px) | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:52` |
| padding — 표면 내부 | 카드 단일 padding 16px (p-8 × --spacing:2px). header/body/footer 분리 없음. 액션 행은 −8px 네거티브 마진으로 카드 밖으로 확장 | surface-inset 24px(기본) / 16px(compact). header 24/24/8px, body inline 24px·block 8px, footer 24/8/24px. 네거티브 마진 없음 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:52` |
| radius — 표면 | 24px (rounded-24). 다른 벌: 16px(CropModal·HighlightCreateModal --dropdown-radius), 10px(ImageCropModal), 24px(VideoEditModal docked), 0(NodeCanvasGuideModal fullscreen) | 16px = var(--louis-radius-overlay) 기본, compact 20px = var(--louis-radius-card), fullscreen 0 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:52` |
| border — 표면 (두께·색) | border 선언 없음. 대신 spread-only box-shadow 헤어라인 var(--glass-dropdown-frame) = 0 0 0 0.5px #575d68 (다크) / 0 0 0 0.5px #d5d7dd (라이트) | 1px solid var(--louis-color-stroke-subtle) = #E3E4E8 (light) / #575D68 (dark). forced-colors에서 currentColor | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:57` |
| 배경 — 표면 | rgb(49 54 64 / 100%) = #313640 (기본·다크). 라이트 rgb(241 241 243) = #F1F1F3. palette 직접 참조라 테마 시맨틱 토큰을 우회 | var(--louis-color-bg-overlay) = #FAFAFA (light) / #313640 (dark) | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:54` |
| scrim — 색·알파 | rgb(23 27 34 / 50%) (palette-gray-900 @50%). 라이트/다크 분기 없음. 0% → 50% background 전이. 다른 벌: rgb(0 0 0 / 55%)·라이트 32%(HighlightCreateModal), 55% + blur 8px(YoutubeUploadModal), 40%/62% + blur 2px(ClipCropModal), 50% + blur 16px saturate 130%(ConfirmModal) | var(--louis-color-dim-modal) = rgb(0 0 0 / 56%) (light) / rgb(0 0 0 / 72%) (dark). blur 없음. 알파 고정, opacity는 root가 페이드 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:49` |
| 그림자 — elevation | var(--glass-dropdown-frame) = 0 0 0 0.5px #575d68 (다크) / 0 0 0 0.5px #d5d7dd (라이트). 드롭 섀도우 없음(헤어라인 한 겹뿐) | var(--louis-elevation-modal) = 0px 16px 48px -8px rgb(0 0 0 / 22%) + 별도 1px border | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:57` |
| 전경 — 제목 색 | var(--gray-000) = #fafafa (다크) / #000000 (라이트) | var(--louis-color-fg-primary) = #171B22 (light) / #FAFAFA (dark) | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:79` |
| 전경 — 설명 색 | rgb(250 250 250 / 60%) (다크) / rgb(0 0 0 / 60%) (라이트). 알파 합성 | var(--louis-color-fg-secondary) = #575D68 (light) / #D5D7DD (dark). 불투명 색 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:84` |
| 타이포 — 제목 (크기/굵기/행간/자간) | 16px / 600 / 1.5 / -0.01em (= -0.16px @16px), Pretendard. h3 + .type-body-16-semibold | 36px / 500 / 1.35 / -0.72px, Pretendard Variable (typography-heading-md-medium) | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:286` |
| 타이포 — 설명 (크기/굵기/행간/자간) | 16px / 400 / 1.5 / -0.01em (= -0.16px), Pretendard. line-height는 !로 재선언 | 14px / 400 / 1.5 / -0.14px (typography-body-sm-regular) | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:290` |
| 닫기 버튼 — 한 변·radius·색 | 확인 모달 계열(GlassConfirmModal·ConfirmModal·CreateProjectModal)에는 닫기 버튼이 아예 없다. 있는 벌: 20×20px radius 4px color rgb(gray-000/60%) (PricingModal, ImageCropModal), 28×28px radius 50% color rgb(gray-000/44%) (CropModal), 28×28px radius 12px color #d5d7dd (HighlightCreateModal) | 16×16px (var(--louis-space-control-lg)), padding 0, border 0, radius 12px = var(--louis-radius-control), background transparent, color foreground-secondary, .louis-focus-ring 부착 | `different` | `apps/web/components/scenes/create/PricingModal.tsx:52` |
| 애니메이션 — enter (시간·이징) | 카드 transform 320ms cubic-bezier(0.22,1,0.36,1) + opacity 220ms ease + filter 320ms ease. 시작값 translate3d(0,16px,0) scale(0.96) saturate(88%) blur(1px) → translate3d(0,0,0) scale(1) saturate(100%) blur(0). scrim background 260ms cubic-bezier(0.22,1,0.36,1) | root opacity 0→1, 320ms, cubic-bezier(0.32,0.72,0,1). surface translate 0 8px→0 0, scale 0.98→1, duration/timing을 inherit로 받아 root와 동일 선언. 세 property(opacity·translate·scale)가 한 곡선 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:63` |
| 애니메이션 — exit (시간·이징·unmount) | exit용 별도 이징 없이 같은 transition을 되쓰고, unmount는 JS 상수 CLOSE_MS = 280ms 하드코딩. ConfirmModal은 카드 140ms cubic-bezier(0.7,0,0.84,0) + overlay 220ms cubic-bezier(0.32,0.72,0,1), unmount는 transitionend | 200ms cubic-bezier(0.4,0,1,1). unmount timer가 root의 computed transition-duration을 읽으므로 시각 전이와 timer가 같은 선언 하나에서 나온다 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:32` |
| reduced motion | motion-reduce:\[transition:none\] 두 곳. 단 CLOSE_MS 280ms는 그대로라 unmount가 280ms 지연된다. ConfirmModal에는 reduced-motion 분기 자체가 없다 | duration 0ms = var(--louis-motion-reduced-duration), timing cubic-bezier(0.2,0,0,1), 비필수 transform(translate/scale) 제거. timer도 같은 선언을 읽어 함께 0ms | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:64` |
| safe-area / viewport gutter | root padding = env(safe-area-inset-top/right/bottom/left) 4변. 최소 gutter 없음(safe-area가 0이면 0). 20px gutter는 카드 폭 계산식 안에만 존재 | root padding = max(20px, env(safe-area-inset-*)) 4변. fullscreen에서는 root padding 0이고 header/footer가 safe-area를 진다 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:39` |
| backdrop-filter (블러) | GlassConfirmModal은 카드에 backdrop-filter:none을 명시. ConfirmModal은 overlay blur(16px) saturate(130%) + 카드 blur(18px) saturate(130%). YoutubeUploadModal blur(8px), ClipCropModal blur(2px) | backdrop-filter를 쓰지 않는다 | `ds-missing` | `apps/web/components/scenes/create/ConfirmModal.tsx:152` |
| 스크롤 소유자 (body만 스크롤) | 카드에 overflow/max-height 선언이 없다 — 내용이 길면 카드가 뷰포트를 넘어간다. ConfirmModal도 동일. 720px 벌(SignupLegalModal·PricingModal)만 max-h + overflow-hidden + 내부 스크롤 | root overflow:hidden, surface overflow:hidden + grid-template-rows auto minmax(0,1fr) auto, body만 overflow:auto + overscroll-behavior:contain + scroll-padding-block 8px | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:52` |
| 좁은 폭 액션 세로 전환 (200% 확대) | 없음. flex gap-4 한 행 고정, flex-wrap 없음, 각 버튼 flex-1 균등 분할 | flex-wrap:wrap + @container (max-width: 320px) → flex-direction:column, align-items:stretch. surface가 container-type:inline-size | `product-missing` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:89` |
| 구조 — role / aria / portal | GlassConfirmModal: 카드에 role=dialog + aria-modal=true + aria-labelledby, document.body로 portal. ConfirmModal: role·aria-modal·aria-labelledby 전무, portal도 없이 제자리 렌더 | surface에 role=dialog + aria-modal=true + aria-labelledby + (설명이 렌더될 때만) aria-describedby + aria-busy + tabIndex -1. backdrop은 surface의 형제이며 같은 portal subtree | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:280` |
| dismiss — backdrop / Escape / Enter | root 전체에 onClick=onCancel을 걸고 카드가 stopPropagation으로 막는 구조(target 검사 없음, mousedown preventDefault 없음). Escape 핸들러 없음. document capture 단계 전역 Enter keydown → onConfirm, danger variant에도 그대로 적용 | backdrop 자신에 핸들러 + event.target===currentTarget 검사 + mousedown preventDefault. Escape는 topmost 하나만. 전역 Enter confirm 금지, danger-confirm은 명시적 포커스+활성화 필요 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/GlassConfirmModal.tsx:226` |

비고.

- 제품에 공용 Dialog 컴포넌트가 없다. packages/ui에는 button/card/code만 있고 dialog는 없으며, radix의 react-dialog도 의존성에 없다(@radix-ui/react-slider, react-tooltip만 있음). 14벌의 모달이 각 파일에 셸 상수를 복제해 놓았고, GlassConfirmModal.tsx:14-16 주석 자체가 "공유 CSS 파일은 나머지 소비자가 계속 쓴다"고 적지만 그 CSS 모듈(components/projects/CreateProjectModal.module.css)은 이미 존재하지 않는다 — 주석이 가리키는 SSOT가 사라진 상태다. 이 사실 자체가 가장 큰 gap이다.
- 벌 사이 차이 1 — 스크림: 대다수(GlassConfirmModal:49, CreateProjectModal, PromptVariantCompareModal:58, PricingModal:30, ImageCropModal:24, NodeCanvasGuideModal:25, VideoEditModal:1579)가 rgb(23 27 34 / 50%)로 통일돼 있으나, HighlightCreateModal:27-28은 rgb(0 0 0 / 55%)에 라이트에서 32%로 낮추고, YoutubeUploadModal:33-35는 55% + blur(8px), ClipCropModal:54-55는 40%/다크 62% + blur(2px), ConfirmModal:152-153은 50%에 blur(16px) saturate(130%)를 얹는다. 색 계열(gray-900 vs 순검정), 알파(32~62%), 블러 유무가 모두 갈린다.
- 벌 사이 차이 2 — radius: 24px(GlassConfirmModal:52, ConfirmModal:32, CreateProjectModal:66, SignupLegalModal:71, PricingModal:38, VideoEditModal:1537), 16px(CropModal:39, HighlightCreateModal:34 = --dropdown-radius), 10px(ImageCropModal:31), 0(NodeCanvasGuideModal:39). DS는 16/20/0 세 값만 쓴다.
- 벌 사이 차이 3 — 표면 경계: GlassConfirmModal:57은 border 없이 0.5px spread 그림자, ImageCropModal:31은 1px solid rgb(gray-000/12%), CropModal:41은 2px solid rgb(gray-000/12%), VideoEditModal:1538은 border:none. 같은 시각 역할에 세 가지 다른 수단을 쓴다.
- 벌 사이 차이 4 — z-index: 10200 / 9999 / 1300 / 1200 / 1010 / 200 / 80 일곱 값. GlassConfirmModal.tsx:36과 CreateProjectModal.tsx:49 주석이 "VideoEditModal·CropModal 등 z-index:9999 포털 위에 오도록 10200"이라고 적어, 숫자를 올려 stacking을 해결한 흔적이 코드에 명시돼 있다. DS는 이것을 명시적으로 금지한다(layer-popover < layer-modal < layer-critical + stack manager).
- ConfirmModal.tsx(15곳 참조)는 role="dialog", aria-modal, aria-labelledby, createPortal이 모두 없다. 제자리 렌더라 부모 stacking context에 갇히며, 스크린리더에 dialog로 노출되지 않는다. 반면 같은 시각 계약의 GlassConfirmModal은 셋 다 갖췄다 — 두 벌이 접근성 계약에서 갈린다.
- GlassConfirmModal.tsx:224-247의 document capture 단계 전역 Enter → onConfirm은 DS dialog.md Interaction/Keyboard가 명시적으로 금지한 패턴이다("전역 keydown listener로 confirm을 추론하지 않는다", "danger-confirm은 Enter를 누르는 것만으로 danger action을 실행하지 않는다"). NodeDeleteConfirmModal이 이 컴포넌트를 danger로 감싸 쓰므로 삭제가 전역 Enter로 실행될 수 있다.
- 제품 확인 모달 어디에도 Escape 핸들러가 없다(ConfirmModal·GlassConfirmModal·CreateProjectModal 전부 'escape'/'Escape' 문자열 0건). focus trap, scroll lock, focus 복원, inert 처리도 없다. DS는 이 넷을 overlay primitive가 소유하는 필수 계약으로 규정한다.
- VideoEditModal.tsx:1521-1567의 vem.modal은 width min(96vw,1920px) / height min(92vh,1200px) / margin 16px / padding 8px / radius 24px에 modalRootDocked(:1716-1740)로 position:absolute·z-index:0 분기를 갖는다. 즉 같은 컴포넌트가 modal 셸과 docked workspace를 겸한다 — DS dialog.md의 Surface classifier와 KP-EDITOR-001이 지목한 바로 그 구조이며, 시각 축 대조보다 이 소유권 문제가 선행 gap이다.
- 제품의 카드 배경은 palette-gray-800/100을 직접 참조하고(GlassConfirmModal:54-55) html\[data-theme=light\] 후손 선택자로 뒤집는 반면, 전경은 시맨틱 --gray-000(다크 #fafafa / 라이트 #000000)을 쓴다. 표면과 전경이 서로 다른 토큰 층을 참조해 테마 전환 시 대비가 한 곳에서 검증되지 않는다. DS는 background-overlay / foreground-primary 한 층으로 묶는다.
- 제품 Tailwind 스페이싱 기준은 --spacing: 2px (apps/web/app/tailwind.css:164). p-8=16px, gap-4=8px, mt-12=24px, h-22=44px, w-14=28px, p-10=20px, p-12=24px로 환산했다. radius 유틸(--radius-24 등, tailwind.css:170-180)만 px 직접값이다.
- DS 쪽 미해결: dialog.css에는 hover, active, 액션 버튼 높이/radius 선언이 전혀 없다(Button recipe가 소유). 따라서 '제품이 hover/active를 갖고 DS가 없다'는 표의 ds-missing은 dialog.css 범위 한정이며, 축 자체가 다른 recipe로 위임됐을 가능성이 있다. Button 대조 결과와 합쳐 판정해야 한다.
- DS 제목 타이포가 36px/500(heading-md-medium)인 것은 packages/tokens/generated/tokens.css:148의 실제 값이다. 제품 제목은 16px/600으로 20px 작다. 두 값 중 어느 쪽이 의도인지는 이 대조만으로 판정할 수 없으나, compact 카드 폭이 360px인 상태에서 36px 제목은 KO 두 어절도 두 줄이 되므로 DS 쪽 토큰 선택을 재확인할 필요가 있다.

## Tooltip

제품 구현 **14벌**.

- `apps/web/app/globals.css:1497-1508 (.app-tooltip-chrome)` — shared (global CSS class SSOT — surface + typography). 6 call sites compose it: ChromeTooltip.tsx:85, ComposerBar.tsx:60, HomePageClient.tsx@086f4a62:1039(현재 없음), mypage/upgrade/page.tsx:623, analytics/shared.tsx:445, analytics/useAnalyticsBarTooltip.tsx:25, archive/YoutubeVideoAnalyticsView.tsx:880
- `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:93-309` — shared React component (behavior/portal/placement/delay). 13 files import it. Surface delegated to .app-tooltip-chrome. No arrow.
- `apps/web/app/globals.css:1511-1549 ([data-tooltip]:not([data-tooltip=""])::after)` — shared global pseudo-element SSOT (node side handles). 6 files consume it; each supplies only the offset.
- `apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/inspectorPrimitives.tsx:131-166, 396-412` — ad-hoc (Radix @radix-ui/react-tooltip). Re-declares the surface from --app-tooltip-* with `!`. Only implementation with an arrow (10x5).
- `apps/web/components/scenes/myPageSceneStyles.ts:696-723 (planTabExpiringCreditsTip)` — ad-hoc style-object — ignores every --app-tooltip-* var. Own radius 10px, own padding 8px/10px, own bg/border/shadow, own 170ms ease motion.
- `apps/web/components/scenes/analytics/useAnalyticsBarTooltip.tsx:24-57` — ad-hoc portal hook — composes .app-tooltip-chrome but adds own min-height 32px, gap 10px, z-1200, own close delay 90ms / exit 150ms.
- `apps/web/components/scenes/analytics/shared.tsx:71-78` — ad-hoc chart tooltip — composes .app-tooltip-chrome, own z-2 and translate(-50%,-140%) motion vars.
- `apps/web/components/scenes/archive/YoutubeVideoAnalyticsView.tsx:454-462, 880` — ad-hoc chart tooltip — near-duplicate of analytics/shared.tsx:71.
- `apps/web/app/HomePageClient.tsx@086f4a62:521-529 (TIER_FEATURE_TIP)` — **제품에서 사라졌다**(`74a7303b`의 이 파일은 109줄이고 `TIER_FEATURE_TIP`·`tooltip` 0건). ad-hoc style-object로 .app-tooltip-chrome 을 조합하고 own width 260px, own z-10, 6px offset 을 얹었었다.
- `apps/web/app/mypage/upgrade/page.tsx:267-272 (TIER_FEATURE_TIP)` — ad-hoc style-object — near-verbatim duplicate of HomePageClient.tsx@086f4a62:521 (only the w-\[260px\] line placement differs).
- `apps/web/components/scenes/create/ComposerBar.tsx:59-69 (SHOT_MODE_TOOLTIP)` — ad-hoc CSS-hover tooltip — composes .app-tooltip-chrome, 6px offset, zero open delay.
- `apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:909-940` — ad-hoc — borrows --app-tooltip-padding/radius/type but overrides bg to accent-red-500 96%, own z-10002, own CSS-triangle arrow.
- `apps/web/components/scenes/SubscriptionScene.tsx:754-757` — ad-hoc — role="tooltip" span pointing at myPageSceneStyles.ts:696.
- `apps/web/components/ui/VideoPlayer.tsx:878` — ad-hoc — native browser tooltip via title="". No styling, no DS contract at all.

격차 22건.

| 축 | 제품 | DS | 분류 | 근거 |
| --- | --- | --- | --- | --- |
| 크기 — max-width | min(320px, calc(100vw - 20px)) | 288px (max-inline-size) | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:36` |
| border — 두께 | 1px solid | 없음 (border 선언 자체가 없다 = 0) | `different` | `apps/web/app/globals.css:1498` |
| border — 색 (dark theme) | rgba(23, 27, 34, 0.12) — rgb(--palette-gray-900-rgb 23 27 34 / 12%) | 해당 없음 (border 없음) | `ds-missing` | `apps/web/app/globals.css:1498 → 698 → 51` |
| 배경 (light theme) | #313640 (--palette-gray-800) — 어두운 면. 페이지와 반전 | #EAEBEE (--louis-color-bg-inset, srgb 0.917647 0.921569 0.933333) — 밝은 면. 페이지와 같은 극성 | `different` | `apps/web/app/globals.css:1500 → 751 → 36` |
| 배경 (dark theme) | #E3E4E8 (--palette-gray-200) — 밝은 면. 페이지와 반전 | #313640 (--louis-color-bg-inset, srgb 0.192157 0.211765 0.250980) — 어두운 면. 페이지와 같은 극성 | `different` | `apps/web/app/globals.css:1500 → 695 → 28` |
| 전경 (light theme) | #FAFAFA (--palette-gray-000) | #171B22 (--louis-color-fg-primary, srgb 0.090196 0.105882 0.133333) | `different` | `apps/web/app/globals.css:1502 → 752 → 20` |
| 전경 (dark theme) | #171B22 (--palette-gray-900) | #FAFAFA (--louis-color-fg-primary, srgb 0.980392 0.980392 0.980392) | `different` | `apps/web/app/globals.css:1502 → 696 → 37` |
| 그림자 (light theme) | 0 12px 24px rgba(119, 125, 137, 0.12) — rgb(--palette-gray-600-rgb / 12%). spread 없음, y=12, blur=24 | 0px 8px 24px -4px rgba(0, 0, 0, 0.14) — y=8, blur=24, spread=-4. 테마 불변 | `different` | `apps/web/app/globals.css:1501 → 755 → 48` |
| 그림자 (dark theme) | 0 12px 24px rgba(23, 27, 34, 0.12) — rgb(--palette-gray-900-rgb / 12%) | 0px 8px 24px -4px rgba(0, 0, 0, 0.14) — 라이트와 동일 (--louis-elevation-popover는 dark 스코프에서 재정의되지 않는다) | `different` | `apps/web/app/globals.css:1501 → 699 → 51` |
| 타이포 — font-family | 선언 없음 — body의 Pretendard를 상속. ja 로케일이면 Pretendard JP로 갈린다 | "Pretendard Variable", "Pretendard", "Inter", "Noto Sans KR", "Noto Sans JP", system-ui, sans-serif — 표면에 명시 | `different` | `apps/web/app/globals.css:1497-1508 (font-family 선언 부재), 391-397` |
| 애니메이션 — 열림 시간·이징 | 140ms cubic-bezier(0.23, 1, 0.32, 1). opacity 0→1 + scale 0.97→1 | 200ms cubic-bezier(0.32, 0.72, 0, 1) (--louis-motion-overlay-enter-*) | `different` | `apps/web/app/globals.css:383,385; apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:62-66` |
| 애니메이션 — 닫힘 시간·이징 | 120ms cubic-bezier(0.19, 1, 0.22, 1) — 별도의 exit 커브를 갖는다. 언마운트 fallback 180ms | 없음 — 닫힘은 즉시(모션 없음). \[data-louis-state="opening"\]에만 애니메이션이 걸린다 | `different` | `apps/web/app/globals.css:384,386; apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:55-59,227` |
| 애니메이션 — scale 시작값 | 0.97 (--app-tooltip-motion-scale-rest), transform-origin = 트리거 쪽 모서리(origin-bottom/right/left) | 없음 — tooltip.css에 keyframe/변형 선언이 없다. duration·timing만 지정하고 실제 animation-name이 없어 현재 상태로는 모션이 발생하지 않는다 | `different` | `apps/web/app/globals.css:382; apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:56,71-73` |
| 애니메이션 — prefers-reduced-motion | enter/exit 1ms, scale-rest 1 (모션 사실상 제거) | animation-duration 0ms (--louis-motion-reduced-duration) | `different` | `apps/web/app/globals.css:1577-1583` |
| z-index / 레이어 | 10400 (ChromeTooltip 포털 앵커). 구현마다 갈린다 — 10300(radix), 10002(VideoEditModal), 1200(analytics bar), 100(node handle ::after), 10(TIER_FEATURE_TIP), 2(chart) | 200 (--louis-layer-popover), positioner에 1회 선언 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:35` |
| 열림 지연 | 300ms. 단, 직전에 다른 tooltip이 떠 있었으면 0ms(그룹 skip), 그룹 해제 대기 600ms. focus는 지연 없이 즉시 | 280ms (openDelay 기본값). 그룹 skip 없음. focus는 지연 없이 즉시 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:140,157,285` |
| 닫힘 지연 | 즉시 상태 전환 후 120ms 페이드아웃. 표면이 최대 180ms 더 DOM에 남는다 | 즉시. 페이드아웃 없음 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:220-227` |
| anchor 간격 | top 5px / left·right 8px — 방향마다 값이 다르다. 다른 구현은 또 다르다: 9px(node handle), 6px(radix sideOffset, ComposerBar, TIER_FEATURE_TIP), 10px(myPage) | 8px 전 방향 동일 (--louis-overlay-offset, Menu·Dialog와 공유) | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:17,18` |
| collision padding | 명시적 collision padding 없음. max-width의 calc(100vw - 20px)로 좌우 20px 여유를 간접 확보. 방향 뒤집기(flip) 없음 — placement가 고정 | 8px (--louis-overlay-collision-padding). 공간이 없으면 방향이 뒤집힌다 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:36,265-270` |
| arrow | 가장 널리 쓰이는 ChromeTooltip에는 없음. Radix 구현만 10x5 삼각형(fill: --app-tooltip-bg, stroke 없음 → 1px border와 이가 맞지 않는다). VideoEditModal은 별도 CSS 삼각형 | 없음 (Known deviations에 미판정으로 기록됨) | `different` | `apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/inspectorPrimitives.tsx:405-409, 131-134` |
| 줄바꿈 / overflow | whitespace-normal + overflow-wrap:break-word + word-break:normal (ChromeTooltip). 단, node handle ::after는 white-space:nowrap로 줄바꿈 자체를 금지 | overflow-wrap: break-word. nowrap 분기 없음 | `different` | `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:87; apps/web/app/globals.css:1515` |
| role / aria (구조 계약) | 없음 — ChromeTooltip은 role="tooltip"도 aria-describedby도 붙이지 않는다. 표면은 순수 시각 요소다 | 표면에 role="tooltip", trigger에 aria-describedby | `product-missing` | `apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:293-303` |

비고.

- 인계서의 전제('공용 컴포넌트가 없고 22개 파일이 각자 만든다')는 절반만 맞다. 제품에는 실제로 공용 자산이 셋 있다 — (1) React 컴포넌트 ChromeTooltip.tsx (13개 파일이 import), (2) 전역 CSS 클래스 .app-tooltip-chrome (globals.css:1497, 7개 호출부), (3) 전역 의사요소 \[data-tooltip\]::after (globals.css:1511, 6개 파일). 흩어진 것은 '표면'이 아니라 '동작·위치·레이어'다. 이 구분이 gap 판정을 바꾼다.
- 가장 큰 시각 차이는 극성이다. 제품 tooltip은 페이지와 반전된 면을 쓴다 — light 테마에서 어두운 면(#313640) + 흰 글자(#FAFAFA), dark 테마에서 밝은 면(#E3E4E8) + 검은 글자(#171B22) (globals.css:695-696, 751-752). DS tooltip은 페이지와 같은 극성이다 — light에서 밝은 면(#EAEBEE) + 검은 글자, dark에서 어두운 면(#313640) + 흰 글자 (tokens.css:10,22,165,177). 즉 light 테마에서 두 구현의 배경/전경이 정확히 서로 뒤집혀 있다. 우연히 제품의 light 면(#313640)과 DS의 dark 면(#313640)이 같은 값이다.
- padding 4px/8px, radius 8px, 타이포 12px/400/1.5/-0.12px 는 네 축 모두 정확히 일치한다. DS 문서가 '제품 실측에서 8px이 가장 많이 쓰이는 radius'라고 적은 것이 확인된다.
- border 1px는 DS에 통째로 없다. 제품은 반전된 면 위에 반투명 1px 테두리(light rgba(250,250,250,.14) / dark rgba(23,27,34,.12))로 면 경계를 만드는데, DS는 elevation만으로 경계를 만든다. Radix 구현의 arrow는 fill만 있고 stroke가 없어 제품 안에서도 arrow와 본체 테두리가 이어지지 않는다 (inspectorPrimitives.tsx:131-134).
- DS tooltip.css:31-34는 animation-duration과 animation-timing-function만 선언하고 animation-name이 없다. keyframe이 지정되지 않아 현재 CSS만으로는 열림 모션이 실제로 재생되지 않는다. 제품은 반대로 enter/exit 커브를 나누고 scale 0.97 기준점을 트리거 쪽 모서리에 두는 완성된 모션을 갖는다.
- 닫힘 계약이 반대다. DS 규범은 '닫힘은 지연 없이 즉시'(tooltip.md:78)인데 제품은 120ms exit 커브 + 최대 180ms 언마운트 유예를 둔다. 제품의 표면은 pointer-events:none이라 깜빡임 문제는 없지만, 포인터가 떠난 뒤에도 설명이 잠시 남는다.
- z-index가 제품 안에서 여섯 갈래로 갈린다: 10400 / 10300 / 10002 / 1200 / 100 / 10 / 2. 같은 화면에서 어느 tooltip이 위인지 값만 보고는 알 수 없다. DS는 --louis-layer-popover 200 하나다. 이 축은 제품 내부 부채이지 DS와의 단순 값 차이가 아니다.
- anchor 간격도 제품 안에서 갈린다: ChromeTooltip은 방향에 따라 5px(top)/8px(side)로 다르고, node handle 9px, Radix sideOffset 6px, ComposerBar·TIER_FEATURE_TIP 6px, myPage 10px. DS는 8px 하나이며 Menu·Dialog와 공유한다.
- 제품에서 DS 규범을 완전히 벗어난 벌이 둘 있다. (1) myPageSceneStyles.ts:696 — --app-tooltip-* 변수를 하나도 쓰지 않고 radius 10px, padding 8px 10px, max-width min(280px, 100vw-48px), 자체 그림자 0 10px 28px rgba(0,0,0,.26), 자체 170ms ease 모션을 갖는다. (2) VideoPlayer.tsx:878 — 아예 native title 속성이라 어떤 시각 계약도 적용되지 않는다(OS 기본 tooltip).
- TIER_FEATURE_TIP은 HomePageClient.tsx:521과 mypage/upgrade/page.tsx:267에 거의 동일한 내용으로 두 벌 복사돼 있다. 두 벌의 유일한 차이는 w-\[260px\]이 별도 줄인지 아닌지뿐이다. 마찬가지로 chart tooltip은 analytics/shared.tsx:71과 archive/YoutubeVideoAnalyticsView.tsx:454에 두 벌이다.
- 제품 ChromeTooltip에는 role="tooltip"도 aria-describedby도 없다. 접근성 계약은 DS에만 있고 제품에는 존재하지 않는다 — 이건 값 차이가 아니라 계약 부재다. 다만 그림에 그려지는 시각 축은 아니므로 시각 대조표에서는 '구조 계약' 행 하나로만 남겼다.
- 제품에는 DS에 없는 축이 하나 더 있다: 그룹 지연 skip. 직전 600ms 안에 다른 tooltip이 떠 있었으면 300ms 지연을 건너뛰고 모션도 duration-0으로 죽인다(ChromeTooltip.tsx:47-52,133-141,154-157). DS는 이를 Known deviations에 '없음'으로 이미 기록했다.
- max-width는 제품 안에서도 네 값이다: 320px(ChromeTooltip), 288px(Radix), 280px(myPage), 260px(TIER_FEATURE_TIP). DS 288px은 그중 Radix 구현과만 일치한다.
- 측정 근거 파일: DS는 /Users/sejunki/klipse-design-system/packages/css/src/component/tooltip.css, /Users/sejunki/klipse-design-system/packages/tokens/generated/tokens.css, /Users/sejunki/klipse-design-system/packages/css/src/component/overlay.css:33-34, /Users/sejunki/klipse-design-system/packages/react/src/tooltip/tooltip.tsx:52. 제품 spacing 스케일은 /Users/sejunki/klipse/apps/web/app/tailwind.css:164 (--spacing: 2px) — min-h-16=32px, gap-5=10px, gap-1=2px로 환산했다.

## Toast

제품 구현 **9벌**.

- `apps/web/components/scenes/appHomeSceneStyles.ts:936-962 (toast / toastClosing / toastText)` — ad-hoc (style-object, 화면 전용). 공용 Toast 컴포넌트 없음
- `apps/web/components/scenes/highlightSceneStyles.ts:2213-2239 (toast / toastClosing / toastText)` — ad-hoc (style-object). appHome과 선언 내용 동일, keyframe 이름만 highlightToastIn/Out
- `apps/web/components/scenes/NodeCanvasHomeScene.tsx:491-507 (TOAST_BASE / TOAST_OPEN / TOAST_CLOSING / TOAST_TEXT)` — ad-hoc (모듈 상수, Tailwind 유틸). appHome과 최종 계산값 동일
- `apps/web/components/scenes/myPageSceneStyles.ts:1285-1303 (toast / toastClosing)` — ad-hoc (style-object). 별개 디자인 — pill radius, 비반전 표면, blur/shadow 없음
- `apps/web/components/scenes/CreateScene.tsx:169-199 (TOAST / TOAST_TEXT / TOAST_ACTION)` — ad-hoc (모듈 상수). 홈 계열과 같은 면이지만 inline-flex + gap 12px + 액션 버튼 슬롯 추가
- `apps/web/components/scenes/VideoEditScene.tsx:437-455 (TOAST_BASE / TOAST_OPEN / TOAST_CLOSING / TOAST_TEXT)` — ad-hoc (모듈 상수). CreateScene 계열 + toastText에 max-w:min(90vw,420px)
- `apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx:159,241 (ERROR_TOAST_IN / TOAST_IN)` — ad-hoc (모듈 상수). 같은 화면 안에서 toast가 2종(일반/에러)으로 또 갈린다
- `apps/web/app/inquiry/InquiryClient.tsx:190 (TOAST_IN)` — ad-hoc (모듈 상수). 별도 inquiryToastIn keyframe
- `apps/web/app/admin/AdminClient.tsx:153, BlogManagement.tsx:42, JobMonitor.tsx:143, RefundManagement.tsx:84, InquiryManagement.tsx:73, TemplateManagement.tsx:44, ProductMetricsDashboard.tsx:138` — ad-hoc ×7 (모듈 상수). fixed overlay가 아니라 mb-8 인라인 배너 형태 — 같은 이름의 다른 물건

격차 14건.

| 축 | 제품 | DS | 분류 | 근거 |
| --- | --- | --- | --- | --- |
| 위치 (고정 지점) | position:fixed; bottom:32px; left:50%; transform:translateX(-50%) — 하단 중앙, 아래 여백 32px. 요소 자신이 중앙 정렬을 transform으로 만든다 | position:fixed; inset-block-end:24px(--louis-space-layout-section); inset-inline:0; flex column + align-items:center — viewport가 중앙 정렬을 담당 | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:938-941` |
| 크기 (단일 행 높이, 계산값) | 48px = padding 12+12 + line-height 24px(16px×1.5). 명시 높이 없음 | 45px = padding 12+12 + line-height 21px(14px×1.5). 명시 높이 없음 | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:943` |
| 크기 (최대 폭) | 없음. max-width 미선언 + toastText가 white-space:nowrap → 긴 메시지는 뷰포트를 좌우로 넘친다 | max-inline-size:420px + overflow-wrap:break-word | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:936-950` |
| gap (스택 간격) | 해당 없음. 스택이 없다 — showToast가 setToast(message)로 이전 toast를 즉시 덮는 단일 슬롯 | 8px (--louis-space-control-sm), viewport flex column gap | `different` | `apps/web/components/scenes/AppHomeScene.tsx:538-543` |
| 동시 표시 개수 | 1. 새 메시지가 이전 메시지를 지운다 | 3 (TOAST_VISIBLE_LIMIT). 초과분은 대기 | `different` | `apps/web/components/scenes/AppHomeScene.tsx:538-543` |
| tone 변형 (danger) | 없음. 외형이 하나뿐이라 성공과 실패가 같은 면으로 나온다 | \[data-tone="danger"\] — 라이트 배경 #ffe5e8 / 전경 #541119, 다크 배경 #541119 / 전경 #ffe5e8 | `product-missing` | `apps/web/components/scenes/appHomeSceneStyles.ts:936-962` |
| hover | 없음. hover 스타일도 포인터 핸들러도 없다 → 읽는 중에도 타이머가 계속 돈다 | 시각 변화 없음. 대신 pointer-events:auto + data-louis-paused="true"로 자동 소멸 타이머를 멈추고, 떠나면 남은 시간부터 재개 | `different` | `apps/web/components/scenes/AppHomeScene.tsx:1417-1430` |
| 타이포 — 크기 | 16px (type-body-16-regular → --type-body-16-size: 16px). ≤450px 뷰포트에서는 14px로 내려간다 | 14px (--louis-typography-body-sm-regular-font-size). 브레이크포인트 변동 없음 | `different` | `apps/web/components/scenes/AppHomeScene.tsx:1426 → apps/web/app/globals.css:1154,358,849` |
| 타이포 — letter-spacing | -0.01em = -0.16px (16px 기준) | -0.14px (14px 기준 -0.01em, px로 고정 출력) | `different` | `apps/web/app/globals.css:1156,360` |
| 애니메이션 — 진입 | appHomeToastIn 280ms ease. opacity 0→1, transform translateX(-50%) translateY(10px)→translateY(0) | louis-toast-enter 200ms cubic-bezier(0.32, 0.72, 0, 1). opacity 0→1, translate 0 8px→0 0 | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:947 → apps/web/app/keyframes.css:510-519` |
| 애니메이션 — 퇴장 | appHomeToastOut 280ms ease forwards. opacity 1→0, translateY 0→10px. JS가 280ms 뒤 언마운트 | 없음. 진입만 애니메이션한다 (animationend 미발생 시 남는 실패 모드를 피하려는 의도적 결정) | `different` | `apps/web/components/scenes/appHomeSceneStyles.ts:952-955 → apps/web/app/keyframes.css:522-531` |
| 애니메이션 — reduced motion | 없음. globals.css의 prefers-reduced-motion 블록은 tooltip 변수 3개만 다루고 toast는 그대로 280ms 슬라이드한다 | @media (prefers-reduced-motion: reduce)에서 animation-duration: 0ms (--louis-motion-reduced-duration) | `product-missing` | `apps/web/app/globals.css:1577-1583` |
| viewport / pointer-events | viewport 없음. toast div 자체가 fixed이고 toast가 없으면 DOM에서 사라진다. pointer-events 미선언(auto) | 항상 렌더되는 .louis-toast-viewport(pointer-events:none) + .louis-toast만 pointer-events:auto | `different` | `apps/web/components/scenes/AppHomeScene.tsx:1417-1418` |
| live region / role | 없음. role·aria-live 없는 평범한 div > span. 보조 기술에 알려지지 않는다 | role="status"(neutral) / role="alert"(danger) 두 region이 toast 없이도 처음부터 DOM에 존재 | `product-missing` | `apps/web/components/scenes/AppHomeScene.tsx:1418-1428` |

비고.

- 제품에 공용 Toast 컴포넌트가 없다는 사실 자체가 최대 발견이다. 확인된 것만 화면·모듈 단위 정의가 9곳(파일 기준 15개 이상)이고, 어느 것도 서로를 import하지 않는다. 자동 소멸 시간·퇴장 지연(280ms)·keyframe 본문까지 각 화면이 자기 복사본을 들고 있다.
- rows의 기준은 appHomeSceneStyles.ts:936-962다. highlightSceneStyles.ts:2213-2239와 NodeCanvasHomeScene.tsx:491-507은 이것과 최종 계산값이 완전히 동일하다 — 다른 것은 클래스 접두사(tw-ah/tw-hs)와 keyframe 이름(appHomeToastIn / highlightToastIn)뿐이고, keyframes.css:510-531·1084-1105에서 두 keyframe 본문도 바이트 단위로 같다. 즉 같은 것이 3벌이다.
- 벌 사이 실제 차이 ①: backdrop-filter. appHomeSceneStyles와 NodeCanvasHomeScene의 toast는 인라인 style={floatingCtaBlurStyle}(AppHomeScene.tsx:55-58, NodeCanvasHomeScene.tsx:509-512)을 받아 blur(16px) saturate(130%)가 클래스의 blur(10px)를 이긴다. HighlightScene.tsx:1558-1564의 toast div에는 그 인라인이 없어 blur(10px)로 남는다. 같은 CSS를 쓰는 두 화면의 유리 강도가 다르다.
- 벌 사이 실제 차이 ②: myPageSceneStyles.ts:1285-1303은 아예 다른 물건이다. padding 12px 24px(:1291), border-radius 999px(:1292), 배경 rgb(var(--gray-900-rgb)/1) → 다크 #171b22 · 라이트 #f1f1f3 불투명(:1293, globals.css:673→37 / :727→42), border 1px solid rgb(var(--gray-000-rgb)/10%)(:1294), 전경 rgb(var(--gray-000-rgb)/92%)(:1295), z-index 2000(:1296). backdrop-filter도 box-shadow도 없다. 결정적으로 이 toast는 테마 반전을 하지 않는다 — 홈 계열은 라이트에서 어두운 면인데 마이페이지는 라이트에서 밝은 면이다. 같은 앱 안에서 toast의 명암이 화면마다 뒤집힌다.
- 벌 사이 실제 차이 ③: CreateScene.tsx:169-176과 VideoEditScene.tsx:437-445는 홈 계열과 같은 면이지만 inline-flex items-center gap-6(=12px)이 붙어 액션 버튼을 담는다. CreateScene은 액션이 있으면 표시 시간을 8000ms로, 없으면 3000ms로 가른다(useCreateSceneUi.ts:38-46). DS는 액션 슬롯을 의도적으로 두지 않았고(known deviations의 '실행 취소 액션'), 이 벌은 DS 규범과 정면으로 충돌하는 유일한 구현이다.
- 벌 사이 실제 차이 ④: VideoEditScene.tsx:453의 TOAST_TEXT에만 max-w-\[min(90vw,420px)\]가 있다. 420px라는 숫자가 제품 한 곳에만 살아 있고 DS의 max-inline-size:420px와 우연히 일치한다. 홈·하이라이트·마이페이지 계열에는 폭 상한이 전혀 없다.
- Tailwind 유틸 계열(NodeCanvasHomeScene, CreateScene, VideoEditScene)의 bottom-16 / py-6 / px-10 / rounded-16은 tailwind.css:164의 --spacing: 2px 격자와 tailwind.css:177의 --radius-16: 16px를 거쳐 각각 32px / 12px / 20px / 16px로 계산된다. style-object 계열의 리터럴 값과 동일하다.
- 라이트 모드 그림자가 흰색이다. 0 8px 20px rgb(var(--gray-1000-rgb)/16%)에서 --gray-1000-rgb는 globals.css:728에서 라이트일 때 --palette-gray-000-rgb(250 250 250)로 램프가 통째로 반전된다. 즉 라이트에서 toast의 드롭 섀도가 rgb(250 250 250 / 16%)이라 밝은 배경 위에서 사실상 보이지 않는다. 그림자가 있다고 읽히는 것은 inset 베벨 2겹뿐이다. Gnb.tsx:1970-2000의 앱 셸 램프 재매핑은 --gray-1000-rgb를 건드리지 않으므로 앱 셸 안에서도 값이 같다.
- /hl 스탠드얼론 라우트에서는 toast 면 색이 또 뒤집힌다. page.tsx:57이 HighlightScene을 .wrapper로 감싸고 page.module.css:16,28이 --palette-gray-200-rgb를 10 10 10, --palette-gray-800-rgb를 245 245 245로 재정의한다. 이 두 변수는 toast 클래스에서 직접 참조되므로 toast 요소에서 다시 해석되어, /hl의 라이트 toast는 #f5f5f5 70%(밝은 면), 다크 toast는 #0a0a0a 70%(어두운 면)가 된다 — 다른 라우트와 정확히 반대다. 반면 --gray-1000-rgb는 html에서 이미 계산된 뒤 상속되므로 이 재정의의 영향을 받지 않는다.
- 제품 toast는 hover/focus로 멈추지 않는다. showToast(AppHomeScene.tsx:538-552, HighlightScene.tsx:783-797, NodeCanvasHomeScene.tsx:921-935)는 setTimeout만 걸고 포인터 이벤트를 보지 않는다. 3000ms는 DS의 4000ms보다 짧은데 정지 수단까지 없으므로, 긴 메시지(예: renamed(projectName))는 읽기 전에 사라질 수 있다. DS 규범이 자동 소멸을 4000ms로 올리고 pause를 넣은 이유가 여기서 나온다.
- 제품 toast는 접근성 계약이 없다. 세 화면 모두 role도 aria-live도 없는 div > span이라 스크린 리더에 아무것도 알려지지 않는다. DS는 role="status"/role="alert" 두 region을 상시 DOM에 둔다. 이 축은 시각 대조가 아니라 기능 결손이다.
- 같은 화면 안에서도 toast가 갈리는 사례가 있다. EditorProjectWorkspace.tsx는 :159의 ERROR_TOAST_IN(createToastIn 240ms)과 :241의 TOAST_IN(createToastIn 280ms)을 따로 들고 있어 일반 toast와 에러 toast의 진입 속도가 40ms 다르다.
- admin 7개 파일(AdminClient.tsx:153, BlogManagement.tsx:42, JobMonitor.tsx:143, RefundManagement.tsx:84, InquiryManagement.tsx:73, TemplateManagement.tsx:44, ProductMetricsDashboard.tsx:138)의 'toast'는 fixed overlay가 아니라 mb-8 인라인 배너다. 이름만 toast이고 DS의 toast 정의(하단 중앙 고정, 자동 소멸)와 무관하므로 대조 대상에서 제외했다. DS 규범 관점에서는 alert/banner로 재분류돼야 할 것들이다.
- keyframes.css:5의 주석이 제품 스스로 상태를 기록해 두었다 — toastIn이라는 이름이 저장소에 7곳 서로 다른 본문으로 존재해 전부 네임스페이스를 붙여야 했다. 이 파일이 중복의 실측 근거다.
- 축 요약: 완전 일치는 radius(16px), border(없음), 전경 색 2종(#fafafa/#171b22), 폰트 굵기(400), 행간(1.5), active/disabled(없음) 뿐이다. padding·최대폭·배경 불투명도·blur·그림자·글자 크기·줄바꿈·진입 이징·퇴장·자동 소멸·z-index·스택·tone·hover pause·live region은 모두 다르거나 제품에 없다.

## 기준선 정정 (2026-08-15)

이 문서의 205축 측정은 `sniperfactory-official/klipse`의 `louis` 브랜치를 대상으로 했다. 실제
최신 제품은 **`KlipseAI/klipse-web`의 `design` 브랜치**다 — 조직도 저장소도 다르고 열흘 오래된
것을 재고 있었다.

다시 대조했다. 근거 파일 13개가 양쪽에 모두 있고 11개는 내용이 같다. `ui/Button.tsx`는 완전히
동일하다. `globals.css`는 인용한 35개 선언 중 34개가 그대로 옮겨갔고, `--glass-dropdown-frame`
하나만 값이 바뀌었다(단순 헤어라인 → 5겹 글래스 프레임). 그 축은
[`migration/product.measured.json`](product.measured.json)에서 다시 판정했다.

**측정 결과 자체는 유효하고 기준선 표기가 틀려 있었다.** 아래 표의 경로는 두 저장소에서 같다.

## 측정 방법

- 컴포넌트마다 조사자 하나가 제품과 DS를 축별로 대조하고, **다른 조사자가 그 주장을 반증**했다.
  반증에 실패한 것만 위 표에 남는다.
- 제품 값은 CSS 변수를 끝까지 따라간 **최종 계산값**이며 파일·줄번호 근거가 붙는다.
- 제품 저장소는 읽기 전용으로만 접근했다.

## 한계

- 이 문서는 **한 시점의 손 측정**이다. 게이트가 아니므로 다음 커밋부터 다시 벌어진다.
- 자동화하려면 제품 실측값을 근거 파일로 고정하고 DS와 대조하는 게이트가 필요하다.
  `figma/components.measured.json`이 코드↔Figma에 대해 하는 일을 제품↔DS에 대해서도 해야 한다.

