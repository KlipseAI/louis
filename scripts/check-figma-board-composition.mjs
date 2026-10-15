#!/usr/bin/env node
// **화면 보드가 손으로 그린 도형으로 되돌아가는 것을 막는 래칫.**
//
// 왜 있나: `check-figma-app-screens` 는 런너 36개가 생성물과 byte-for-byte 같은지를 본다 —
// 보드가 «있는가»는 잠그지만 보드가 «무엇으로 만들어졌는가»는 한 글자도 보지 않는다.
// 그래서 인스턴스를 도형으로 바꿔치기해도, 새 화면을 전부 도형으로 그려 넣어도 초록이었다.
// 2026-09-02 실측: 인스턴스 43 · 원시 도형 933(95.6%). 「보드가 라우트 43/46 에 있다」는
// 커버리지가 아니라 «그림이 43장 있다»는 뜻이었고, 그 사실을 아무 게이트도 말해 주지 않았다.
//
// 이 게이트는 `migration/figma-board-composition.json` 을 읽는다. 그 원장을 뽑는 열거기와
// 짝이다 — 열거기(`--check`)는 「원장이 draw.js 의 현재 내용과 같은가」를, 이 게이트는
// 「원장의 모든 줄이 분류돼 있고 대체 가능이 늘지 않았는가」를 본다. 같은 원장의 앞뒤다.
//
// ── 왜 verify:ci 인가 ─────────────────────────────────────────────────────
// 원장의 재료(`figma/*.draw.js` · `figma/readback.json`)가 전부 이 저장소 안에 있다.
// 제품 저장소를 보지 않으므로 러너에서 실제로 돈다 — `verify-gate-split` 5번이 그 자립성을
// 문자열로 확인한다.
//
// ── 래칫의 방향 (판정마다 다르다) ─────────────────────────────────────────
//
//   replaceable   **양방향.** 목표는 0 이고 2026-09-02 에 0 이 되었다. 늘면 손으로 그린 것이
//                 늘어난 것이고, 줄면 이득을 잠그라고 요구한다.
//   bespoke       **하락만 잠근다.** 상승은 발견이다(아직 안 본 자리를 열어 보고 「제품이 여기서
//                 정본을 물지 않는다」를 적은 결과다). 하락은 둘 중 하나인데 둘 다 손으로 적혀야
//                 한다 — 제품이 정본을 물기 시작해 인스턴스가 되었거나(이득), 판정을 느슨하게
//                 풀어 다른 칸으로 흘려보냈거나. `check-figma-surface-coverage` 의 `needed` 와
//                 같은 모양이다.
//   unclassified  **양방향, 목표 0.** 규칙이 못 본 모양이 새로 생기면 그것부터 판정해야 한다.
//   instance      **바닥.** 떨어질 수 없다. 오르면 baseline 을 올려 이득을 잠근다.
//   candidates    **바닥.** 후보(instance+replaceable+bespoke+blocked+missing)를 구조로 재분류해서
//                 분모를 줄이는 길을 막는 그물이다. 이것이 없으면 「대체 가능이 줄었다」를
//                 판정 규칙을 느슨하게 푸는 것만으로 만들어 낼 수 있다.
//   blocked·missing  **세기만 한다.** 늘어난 것은 후퇴가 아니라 발견이다 — 아직 안 본 모양을
//                 열어 보고 「이건 컴포넌트여야 한다」를 적은 결과이고, 그것을 실패로 만들면
//                 다음 사람은 열어 보지 않는 쪽을 고른다(`check-figma-surface-coverage` 의
//                 `needed` 와 같은 판단이다).
//
// ── `bespoke` 에 `scoped` 같은 천장이 필요한가 (판정: 필요 없다) ──────────
//
// 부정 경로는 하나다 — **`replaceable` 을 `bespoke` 로 옮겨 목표의 분모를 좁히는 것.** 인스턴스
// 비율의 분모가 `instance + replaceable` 이므로, 대체 가능을 다른 칸으로 흘리면 그림은 한 장도
// 안 바뀐 채 비율이 오른다. `check-coverage-targets` 의 `scoped` 천장이 막는 것과 같은 모양이다.
//
// 그런데 그 문은 **이미 두 겹으로 잠겨 있다.** ① `REPLACEABLE_BASELINE` 은 양방향이라 어떤
// 하락도 실패하고, 손으로 baseline 을 내리면서 「어디로 갔는지」를 적게 만든다. ② 그 baseline 이
// 지금 0 이므로 옮길 것이 애초에 없다 — 옮기려면 먼저 replaceable 을 올려야 하고 그 순간
// ①에 걸린다. 같은 문에 자물쇠를 하나 더 다는 대신, **하락을 잠그는 쪽**을 골랐다.
//
// 잠기지 않는 이동이 하나 남는다: `missing ↔ bespoke`. 둘 다 목표의 분모 밖이고 둘 다 상승이
// 자유라 서로 오갈 수 있다. 이것을 열어 두는 이유는 두 칸이 **같은 성격**이기 때문이다 —
// 어느 쪽도 「지금 Figma 에서 할 일」이 아니고, 둘 다 다른 축(LOUIS 를 세운다 / 제품이 정본을
// 문다)의 질문으로 넘어간다. 다만 그 이동은 `bespoke` 하락 잠금과 `INSTANCE_FLOOR` 어느 쪽에도
// 안 걸리므로, 여기 적어 다음 사람이 알고 하게 한다.
//
// ── 왜 비율을 둘 인쇄하는가 ───────────────────────────────────────────────
// 목표(인스턴스 비율 100%)의 분모는 **인스턴스 + 대체 가능**이다. 구조를 분모에 넣으면
// 컴포넌트가 될 생각이 없는 프레임을 못 된 것으로 세어 비율이 영원히 낮게 나온다.
// 그런데 그 수만 찍으면 blocked·missing 을 분모 밖에 두어 예쁘게 만들 수 있으므로,
// **후보 전체 대비**를 대조군으로 나란히 찍는다. 하나만 찍으면 둘 중 어느 쪽으로든 속인다.
//
// ── 두 원장을 합치지 못하게 한다 ──────────────────────────────────────────
// `migration/product.surfaces.json` 의 `needed` 161 과 이 원장의 `missing` 은 **다른 축**이다.
// 하나는 제품 소스(`apps/web/…#컴포넌트`), 하나는 보드 도형(`route@문맥#인덱스 체인`)이고
// draw payload 에는 제품 소스 경로가 한 글자도 없어 조인할 키가 아예 없다. 두 식별자 공간이
// 겹치지 않는 것을 여기서 확인한다 — 언젠가 누가 둘을 한 수로 합치면 같은 것을 두 번 세거나
// (합집합) 절반을 잃는다(교집합).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));

const LEDGER = "migration/figma-board-composition.json";
const SURFACES = "migration/product.surfaces.json";
const READBACK = "figma/readback.json";
const PLAN = "figma/app-screens.plan.json";

// 2026-09-02 실측(앵커 ae8fd627 의 보드 36장). 원시 933 중 후보 214 · 구조 667 · 사유 없음 0
// 에서 시작했고, 그때 인스턴스 43 · 대체가능 97 이었다.
//
// **같은 날 생성기가 정본 프리미티브를 인스턴스로 놓기 시작해 35자리가 옮겨 갔다** —
// `.louis-button` 20(secondary 16 · primary 4) · `.louis-avatar` 15. 판정은 기하가 아니라
// 「제품이 그 자리에서 무는 클래스」다(`figma-component-substitution.mjs` 의
// LOUIS_PRIMITIVE_SITES). 그래서 인스턴스 43 → 78, 대체가능 97 → 62 이고 **후보 214 는
// 그대로다** — 판정 규칙을 푼 것이 아니라 같은 후보가 다른 칸으로 옮겨 간 것이기 때문이다.
// (규칙을 풀어 수를 예쁘게 만들면 candidates 가 함께 떨어지고 CANDIDATE_FLOOR 가 잡는다.)
//
// **다섯째 칸을 연 뒤(2026-09-02, DS-D-0046) 62 가 다시 갈렸다.** 원장이 「대체가능 62 가 지금
// 바꿀 수 있는 것이다」로 인쇄하던 것이 거짓이었다 — 그 62 중 60 은 제품이 지역 스타일로 그리는
// 자리라 Figma 에서만 인스턴스로 바꾸면 두 축이 어긋난다(DS-D-0043). 판정을 DS-D-0043 의
// 정본 자리·제외 목록과 조인해 다시 내리니 **replaceable 62 → 0 · bespoke 0 → 60 ·
// blocked 6 → 8** 이고, **후보 214 와 구조 667 은 그대로다** — 판정 규칙을 푼 것이 아니라 같은
// 후보가 다른 칸으로 옮겨 갔기 때문이다. 옮겨 간 62의 내역:
//   · 제외 목록이 이미 사유를 적어 둔 자리 41 — IconButton 27(probe `icon-button` ·
//     `icon-button-card`, 둘 다 제품 지역 스타일) · SegmentedControlItem 12(probe
//     `segmented-segment`) → bespoke, ProgressBar 2(probe `progress-bar-track`) → **blocked**
//     (제품은 `.louis-progress-bar` 를 물지만 측정에 State 축을 고를 정보가 없다).
//   · 정본 자리는 있는데 요소가 다른 자리 20 — `<a>` 로 그린 결제 CTA. `button-md` 의 요소는
//     `<button>` 이다.
//   · 제품 레시피 상자가 어긋난 자리 1 — `/settings` 「Delete account」의 padding-inline 이
//     14 다(`.louis-button[data-size=md]` 는 12). DS-D-0043 이 이미 실측해 적어 둔 자리다.
//
// **아이콘 축이 열리며 여섯 자리가 다시 갈렸다(2026-09-02).** `blocked` 6 은 「LOUIS 아이콘
// 31종이 서 있는데 payload 가 정체를 버려 고를 수 없다」였는데, 정체를 버린 곳은 축약이 아니라
// 트리 변환이었다(`<path>` 를 「스스로 그릴 것이 없는 노드」로 지웠다). 측정에는 `d` 가 그대로
// 있어 지우기 앞에서 서명만 뜨면 됐다. 이름이 붙자 여섯이 갈린다 — **bespoke 60 → 64**
// (배너 캐러셀 화살표 넷: LOUIS `icon/caret-left`·`icon/caret-right` 가 있지만 제품이 그것을
// 물지 않고 24 상자 1.8 획의 인라인 글리프를 그린다. 정본은 24 상자 1.5 획 — DS-D-0021) ·
// **missing 68 → 70**(아바타 대체 글리프 둘: LOUIS 31종에 사람 그림은 `user-sound` 뿐이다) ·
// **blocked 8 → 2**(남은 둘은 ProgressBar 의 State 축이고 그쪽은 진짜로 측정이 잃은 축이다).
// **후보 214 · 구조 667 · 총수 881 은 그대로다** — 또 한 번, 같은 후보가 다른 칸으로 갔다.
//
// **2026-09-03 — `SegmentedControl/settings` 가 서면서 셋이 움직였다.**
// bespoke **64 → 56** · missing **70 → 62** · 후보 **214 → 198** · 총수 **881 → 865**.
// 네 수가 함께 내려간 이유는 하나다 — **matchRules 가 문 자리의 자손은 세지 않는다**
// (`$pruningRule`). 36 높이 묶음 넷이 이제 `SegmentedControl/settings` 로 매치되므로 그 안의
// 세그먼트 버튼들이 분모에서 컴포넌트 안으로 들어갔다.
//
// 사라진 16 이 무엇이었는지 이름으로 적는다. 직전 원장의 `bespokeByComponent` 는
// `{IconButton/md: 27, Button/md: 21, SegmentedControlItem/xs: 12}` 였고 지금은
// `{IconButton/md: 27, Button/md: 21, SegmentedControl/settings: 4}` 다 —
// **`SegmentedControlItem/xs` 열둘이 통째로 없어졌다.** 그 열둘은 `/settings`·`/subscription`
// 토글의 세그먼트였고, `xs` 로 불린 것은 높이 28 이 우연히 같았기 때문이다(좌우 여백은 제품
// 12 · `xs` 8 로 갈렸다). **이름이 틀렸던 자리이고, 규칙에 `settings` 를 «앞에» 둔 이유가
// 그것이다.** 나머지 넷은 missing 이던 트랙 자신이다.
//
// 그러므로 이 하락은 「판정을 느슨하게 풀어 흘려보낸 것」이 아니라 **분모가 옳아진 것**이다.
// 넷은 여전히 bespoke 다 — 제품 `settingsToggleWrap` 이 `.louis-segmented-control` 을 물지
// 않으므로 그 자리가 정본을 무는 날 replaceable 로 올라간다.
//
// **2026-09-04 — 제품 앵커가 ae8fd627 → 5a67d692 로 옮겨 세 수가 함께 움직였다.**
// 총수 865 → 984. 두 사건이고, 둘 다 **판정을 푼 것이 아니라 화면이 달라진 것**이다.
//
//   ① `/archive` 의 배너 캐러셀이 통째로 사라졌다 — instance −2 · bespoke −4.
//      `/api/banners` 는 **두 앵커 모두 500** 이다(fixture 에 DB 가 없다). 달라진 것은 제품이다:
//      ae8fd627 은 슬라이드 3장을 `AppHomeScene.tsx` 에 `as const` 로 박아 두어 API 가 죽어도
//      캐러셀을 그렸고, 5a67d692 는 `tab_banners` 행이 정본이라 응답이 없으면 아무것도 그리지
//      않는다. 사라진 것은 데스크톱·모바일 두 벌의 primary Button 1 + 화살표 2 다.
//      **이 −4 는 이득이 아니다** — 「제품이 정본을 물기 시작했다」가 아니라 「그 자리가 측정
//      화면에서 없어졌다」이고, 배너가 다시 그려지는 날 그대로 돌아온다.
//   ② `/mypage/upgrade` 의 요금제가 4장 → 5장이 됐다(제품 5258d9b2, 코드 정본
//      `trial|lite|plus|pro|ultra`) — instance −4.
//      `CONTENT_COMPONENTS` 의 `Product/Upgrade Plan Card` 넷은 **텍스트 전부 + rect 1px** 로만
//      매치하는데, 카드가 316×560 Trial/Basic/Pro/Max 에서 256.8×608.19 다섯 장으로 바뀌어
//      네 항목이 한꺼번에 죽었다. 카드가 안 물리자 가지치기가 풀려 **그 안의 CTA 다섯이
//      드러난 것**이 대체가능 0 → 5 였다.
//   ③ `/subscription` 의 크레딧 이력 「Sort」 캐럿 하나가 새로 생겼다(제품 9a0b6108) —
//      bespoke +1. 상승은 발견이므로 잠그지 않는다.
//
// 그 다섯 CTA 는 `<Button variant="inverse">` 였고(`UpgradePlanPageClient.tsx`), 원장에 inverse
// 면을 재는 probe 가 없어 생성기가 Variant 축을 못 골라 다섯 자리를 통째로 포기하고 있었다 —
// `buttonVariantOf` 자신의 주석이 「그 자리가 나오면 원장에 probe 를 더하는 것이 먼저다」라고
// 적어 둔 그 자리다. probe 넷(`button-inverse`·`button-inverse-light`·`button-disabled`·
// `button-disabled-light`)을 원장에 더해 **넷이 인스턴스가 되었고**(instance 72 → 76),
// 첫 카드 하나는 `blocked` 로 갔다(2 → 3): `:disabled` 가 primary·danger·danger-secondary·
// inverse 넷을 같은 `bg-inset` 면·`fg-disabled` 글자로 접어 Variant 축이 측정에 남지 않는다.
// ProgressBar 의 State 축과 같은 종류이고, 고칠 곳은 Figma 가 아니라 측정 쪽이다.
//
// 그래서 78 → 76 = −2(배너) −4(죽은 플랜 카드) +4(새 Button 인스턴스) 이고,
// 56 → 53 = −4(배너 화살표) +1(Sort 캐럿) 이다. **둘 다 이득이 아니라 화면의 이동이므로**
// 잠그되, 배너가 돌아오면 두 수도 함께 돌아와야 한다는 것을 여기 적어 둔다.
//
// **새 위반을 받아들이려고 이 수를 올리지 마라** — 이 저장소의 baseline 규칙이다.
const REPLACEABLE_BASELINE = 0;
// 2026-09-10: 53 → 52. **판정을 푼 것이 아니라 화면이 움직였다** — 유일한 bespoke 아이콘이던
// `/subscription` 정렬 드롭다운 꺾쇠가 제품 화면 개편으로 사라졌다(보드의 svg 3 → 2).
// 그 화면이 돌아오면 이 수도 함께 돌아와야 한다.
// 2026-09-11 · 09-13: 52 → 45 → **50.** 45 는 **회귀를 잠근 수였고** 되돌렸다. 이 문단은 두 번
// 틀린 뒤 실측으로 닫은 것이다 — 다음 사람이 같은 길을 되밟지 않게 틀린 두 판단을 함께 적는다.
//
// 원인은 제품이 상단 바를 감싸는 래퍼에 준 여백이다 — `margin-bottom: 0 → var(--app-gnb-main-card-padding-block-start)`(데스크톱 16px · 모바일 6px — 제품 `b6b4e245` · `e95e1fb3`)
// (f19cc41c → 38a7d5a4, DOM 은 그대로). `collapseWrappers` 는 margin 이 있는 래퍼를 접지 않으므로
// (옳다) 스펙에 모바일 390×53 · 데스크톱 1600/1608×53 래퍼가 남았고, 상단 바 매처(`figma-component-substitution.mjs`)가
// 그 래퍼를 바로 착각해 **치환 성공 전에 슬롯을 닫았다.** 그 결과가 둘이었다.
//   · archive · settings · subscription 다섯 보드가 `Product/*App Top Bar` 인스턴스를 **잃었다.**
//     래퍼 기준으로 판정한 조합이 세트에 없어 보류됐고 진짜 바는 시도조차 되지 않았다.
//     그 자리에 바 앞머리의 32×32 버튼이 날노드로 드러나 bespoke 가 +5 였다.
//   · highlight `?__phase=` 여섯 보드의 모바일에 `Width=Inset, Breadcrumb=Trail, Back=True` 가
//     **틀리게** 붙었다. 390 래퍼에서 판정한 조합이 우연히 세트에 있었을 뿐이고, 진짜 바는 402 폭
//     `Full · Trail · Back=True` 로 세트에 없는 조합이다. bespoke -12 는 이득이 아니라 오치환이었다.
// INSTANCE 합계는 84 로 그대로여서 아무 게이트도 울리지 않았다 — 잃은 바 안의 Avatar 가 따로
// 인스턴스로 세어져 상쇄했다.
//
// 틀린 판단 둘. (1) 4ebbe46 은 +5 를 「합계 뒤에 숨은 bespoke 후퇴」로 적었다 — 후퇴는 맞았지만
// bespoke 가 아니라 **instance** 의 후퇴였다. (2) 그 뒤 「+5 는 발견이고 -12 는 이득」으로 정정했다 —
// **둘 다 틀렸다.** 다른 칸이 대가를 치르지 않았다는 근거로 발견이라 했지만, 대가를 치른 것은
// 셸 인스턴스였고 Avatar 가 그것을 가렸다. 합계로만 보면 이 교환은 영원히 보이지 않는다.
//
// 매처를 고쳐(자식 하나가 곧 바인 래퍼는 내려간다) 36 화면 중 34 가 회귀 전 cb1907e 와 같은 상단 바
// 판정으로 돌아왔고, 둘(`/analytics/youtube` desktop·mobile)은 **같은 버그에 가려져 있던 바를
// 새로 얻었다** — 1632×53 래퍼 → 같은 크기의 바이며, 안쪽 바의 자식이 settings 의 바와 같은
// 32×32 · nav · 36×36 이다. 회귀 전 대비 모든 차이가 설명된다: analytics 두 보드 bespoke -1 ·
// missing -1 · structural -8 씩, 래퍼가 프레임으로 남은 18 보드 structural +1 씩(합 +2).
// 이 사고를 다시 조용히 지나가지 않게 아래 `SHELL_INSTANCES_BY_BOARD` 를 세웠다.
//
// 2026-09-13(같은 날 뒤): 50 → **25.** **판정을 푼 것이 아니라 상단 바 13개가 인스턴스가 됐다.**
// 앱 셸 세트에 측정 조합(모바일 `Full · Trail · Back=True`, 데스크톱 `Highlight · Trail · Back=True`·
// `Subscription · Single`)을 더하자 highlight 열두 보드와 `/subscription` 데스크톱의 날노드 바가
// 인스턴스로 치환됐고, `$pruningRule` 에 따라 그 안의 부품은 세지 않는다. 사라진 25 는 전부
// `IconButton/md`(제품 `Gnb.tsx iconButton` 지역 스타일 — 바 앞머리의 토글·뒤로가기 버튼)다:
// highlight 보드마다 2 × 12 + `/subscription` 데스크톱 1. `bespokeByComponent` 에서 `IconButton/md`
// 칸이 통째로 없어졌다(25 → 0). 같은 치환으로 missing 81 → 70(바의 프로필 버튼 — highlight loading
// 두 보드는 이미 구조로 세어져 있어 11), Avatar 인스턴스 13 → 0 · 상단 바 인스턴스 23 → 36 이다.
// 바가 날노드로 되돌아가면 이 수도 함께 돌아와야 한다 — 그때는 아래 SHELL_INSTANCES_BY_BOARD 가 먼저 운다.
//
// 2026-09-14: 25 → **5.** **판정을 푼 것이 아니라 본문 블록 21개가 인스턴스가 됐다.** 치환 매처가 결과 · 체크아웃 본문을
// 크기 손 사본(1px 창)이 아니라 세트 plan 의 글자 서열 + 구조 서명 + 뷰포트로 알아보게 되자(크기 굳힘 감사 묶음 2),
// 결과 · 체크아웃 보드 14장의 본문(`Product/Payment Result Content` 8 · `Product/Checkout Status Content` 6)과
// `/mypage/upgrade` 의 요금제 카드(`Product/Upgrade Plan Card` 5 · `… Visible Slice` 2)가 인스턴스로 치환됐고,
// `$pruningRule` 에 따라 그 안의 부품은 세지 않는다. 사라진 20 은 전부 `Button/md`(제품 `STATUS_BUTTON_*` 지역 레시피 —
// 본문의 링크 버튼)다: topup-fail · topup-success · billing-change-fail · billing-change-success 2씩, billing-fail ·
// billing-success · upgrade/fail 4씩. 본문이 날노드로 되돌아가면 이 수도 함께 돌아와야 한다.
//
// 2026-09-15: 5 → **1.** **판정을 느슨하게 푼 것이 아니라 사유가 사실이 아니었다.** 남아 있던 `SegmentedControl/settings` 넷
// (`/settings` 두 뷰포트의 테마 · 언어 트랙)은 「제품 `settingsToggleWrap` 이 `.louis-segmented-control` 을 물지 않는다」로
// bespoke 였는데, 앵커 6f6282c1 의 `SegmentedToggle.tsx`(:76 · :102 · :137)가 정본 레시피를 문다. 막힌 것은 제품이 아니라
// 레시피 원장 probe 다 — `segmented-track` · `segmented-segment` 가 쓰이지 않는 `myPageSceneStyles.ts` 상수를 잰다. 그래서 생성기의
// `LOUIS_PRIMITIVE_EXCLUSIONS` 판정을 blocked 로 옮겼고(사유 · 인용은 그 목록에), 넷이 막힘 2 → 6 으로 갔다. 남은 bespoke 1 은
// `Button/md`(제품 지역 레시피)다. 원장 probe 가 `SegmentedToggle` 마크업을 재고 정본 자리가 서면 넷은 replaceable 로 간다.
// 2026-09-26: 1 → **3.** **발견이다.** 설정 화면 프로필 사진 칸 둘(데스크톱 · 모바일)이 Avatar `lg`(40)로 대응을 얻었고, 제품이
// 그 자리에서 면과 폴백 글리프 크기를 덮어 bespoke 로 판정됐다(제외 목록 `avatar-settings`). 전에는 LOUIS 에 40 이 없어 missing 이었다.
// 같은 날 뒤: 3 → **5.** **발견이다.** LOUIS DropZone(신설)이 하이라이트 업로드 면 둘(데스크톱 · 모바일)의 대응이 됐고, 제품은 지역
// 레시피(`highlightSceneStyles.ts uploadDropZone`)라 bespoke 다(제외 목록 `drop-zone-upload`). 전에는 LOUIS 에 대응이 없어 missing 이었다.
// 2026-09-26(밤): 5 → 13 — 결제 성공 미리보기 보드의 링크 버튼 8(`a` 요소에 앉은 Button 레시피). 발견이다.
// 2026-09-28: 13 → 15 — **발견이다.** 로그아웃 fixture 보드(인증 화면 열 · 404)의 `/aws/signup` 언어 선택 버튼 지구본 둘(데스크톱 ·
// 모바일). 제품 `GlobeIcon.tsx:19-21` 이 제 원 · 타원을 그려 LOUIS `icon/globe` 를 물지 않는다(글리프 조인표 `globe`).
// 2026-09-30: 15 → **114.** **발견이다.** 공개 페이지 보드(요금 · 약관 · 개인정보 · 문의 · 템플릿 · 블로그 · 크리에이티브 미디어 · 랜딩)가 서며 제품이
// LOUIS 컴포넌트를 물지 않는 자리가 드러났다 — icon/plus 32 · Button/md 28 · icon/globe 14 · IconButton/md 10 순(검사 출력의 bespoke 표).
// 2026-10-08 밤: 114 → **296.** 바닥이 늘어져 있었다(커밋된 원장도 265). 앵커 54b62a8a 의 지금 수로 조인다 — 상위는 IconButton/md 63 · Button/md 49 ·
// icon/plus 33 · Avatar/sm 26(검사 출력의 bespoke 표).
// 2026-10-15: 296 → 302 — **발견이다.** 새 보드 /models · /models/[slug] 데스크톱 · 모바일 넷(2 · 1 · 2 · 1, Button/md 둘 포함). 옛 보드는 그대로.
// 같은 날 뒤: 302 → 310 — **발견이다.** /creative-media 보드가 활성 행사 · 템플릿 넷으로 채워지며 +8(DS-D-0109).
// 2026-10-15 아침 합본: 310 → 676 — **발견이다.** 밤사이 새 보드(분석 연결 상태 열여덟 · 편집기 · 캔버스 패널 상태 · 관리자 사용자 · 랜딩 끈적 장면)가
// 제품이 LOUIS 를 물지 않는 자리를 드러냈다. 지금 수로 조여 하락 canary 가 다시 문다.
// 같은 아침 뒤: 676 → 809 — **발견이다.** 관리자 탭 상태 보드 서른넷.
const BESPOKE_BASELINE = 809; // 하락만 잠근다(상승은 발견) — 오르면 이 수를 새 수로 올린다
const UNCLASSIFIED_BASELINE = 0;
// 2026-09-10: 76 → 84. **이득이다.** `buttonVariantOf` 가 secondary 를 「투명」으로 알아보고
// 있었는데, 제품이 그 variant 에 8% 잉크 면을 준 뒤(5566ecd) 그 면이 테마를 따라 갈려서
// 라이트 화면의 secondary 버튼이 한 자리도 인스턴스가 되지 못했다. 원장에 라이트 벌
// (`button-secondary-light`)을 세우고 실측 두 면으로 판정하게 고쳤고, 면도 헤어라인도 없는
// `ghost` 도 같은 이유로 자리를 잃고 있어 함께 열었다. 대체가능 22 → 0.
// 2026-09-14: 84 → **101.** **이득이다.** 본문 블록 21개(결과 8 · 체크아웃 6 · 요금제 카드 5 · 보이는 조각 2)가 인스턴스가
// 됐고, 요금제 카드 안의 `Button` inverse 인스턴스 4 가 카드 인스턴스 안으로 들어가 세어지지 않는다: 84 + 21 − 4.
// 2026-09-26: 101 → **103.** **이득이다.** `/mypage/upgrade` 데스크톱 · 모바일 헤더의 「진행 중 이벤트 알약」이 제품 컴포넌트
// `Product/Pricing Notice` 인스턴스가 됐다(제품 `PricingNotice`). 안의 초록 점(미보유 2)은 인스턴스 안으로 들어가 세어지지 않는다.
// 2026-09-26(뒤): 103 → **119.** 보드가 늘어서다 — 보드 없던 실제 화면 셋(bulk-success · bulk-fail · coupons)의 보드 여섯이
// 셸 인스턴스 9(데스크톱 셋 × 상단 바 · 사이드바, 모바일 셋 × 상단 바)와 LOUIS Button 인스턴스 7 을 갖는다.
// 같은 날 더 뒤: 119 → **129.** **이득이다.** 제품 부품 세트(보드 생성기 PARTS, DS-D-0071)가 섰다 — `/subscription/coupons` 의
// 요금제 선택 카드 8(넷 × 두 뷰포트)이 `Product/Gift Plan Option`, 수량 스테퍼 2 가 `Product/Quantity Stepper` 인스턴스가 됐다.
// 같은 날 저녁: 129 → **134.** **이득이다.** PARTS 둘째 묶음 — 유튜브 연결 버튼 2(`Product/Analytics Connect Button`), 하이라이트
// 업로드 테마 칩 줄 2(`Product/Highlight Theme Chips`), 쿠폰 결제 동의 상자 1(`Product/Checkout Agreement`).
// 같은 날 밤: 134 → **161.** 보드가 늘고(결제 성공 미리보기 상태 보드 12 — 셸 인스턴스 18) PARTS 셋째 묶음이 섰다 — 결제 상태 알림 2
// (`Product/Billing Status Alert`) · bulk 쿠폰 안내 4(`Product/Bulk Coupon Notice`, 성공 · 발급 실패 미리보기 × 두 뷰포트). 134 + 18 + 6 = 158 에
// 미리보기 보드의 LOUIS Button 인스턴스 3 을 더해 161 이다.
// 같은 날 더 밤: 161 → **206.** **이득이다.** 글자 속성 부품(`Product/Coupon Code Chip`, PARTS 넷째 묶음) — bulk 성공 미리보기의 쿠폰
// 코드 칩 45(데스크톱 30 · 모바일 15)가 인스턴스가 됐다. 칩의 글자는 인스턴스의 TEXT 속성 Code 로 옮겼다.
// 2026-09-28: 206 → **224.** 보드가 늘어서다 — 로그아웃 fixture(`product.anonymous-fixture.json`) 보드 22(인증 화면 열 · `/data-deletion-status`
// · 404, 두 뷰포트)가 LOUIS Button 인스턴스 18 을 갖는다: inverse lg 10(로그인 · 가입 · 재설정 둘 · 복구의 주 버튼), ghost md 4(가입의 약관
// 「View」 둘), primary md 4(`/aws/signup` 가입 · 404 「Back to home」). 셸은 없다 — 인증 화면은 앱 셸 밖이다(아래 셸 표에 넣지 않는다).
// 2026-09-30: 266 → **274.** 보드가 늘어서다 — 랜딩 두 보드의 LOUIS 인스턴스 8.
// 2026-10-08: 274 → **262.** 제품 측정 앵커를 통합 판(76b6cf15, DS-D-0079)으로 옮겨 다시 잰 결과다. 커밋된 원장(HEAD, 302 — 이 바닥이
// 따라가지 못한 판)과 보드 · 세트별로 견주면 −40 이다: 요금제 선물 화면이 리다이렉트만 하는 옛 주소가 되어 `subscription-coupons` 보드
// 둘이 빠졌다(Gift Plan Option 8 · Quantity Stepper 2 · Checkout Agreement 1 · 셸 3 · Button 1, −15). 진행 중 이벤트 알약이 걷혔다
// (Pricing Notice −4). 공용 푸터가 타임라인 푸터로 바뀌고 모바일 variant 를 잠시 뺐으며 공개 `/` 가 오류 경계로 재졌다(Landing Footer −8).
// `/mypage/topup/fail` 본문에 재시도 링크가 붙어 Failure 와 서명이 갈렸다(Payment Result Content −2). 하이라이트 업로드 중 · 분석 · 추출
// 보드 여섯의 Spinner 가 인스턴스가 아니다(−6). 오류 경계로 재진 보드 — 공개 `/` 의 Button −6, `/nodecanvas` 셸 −2, 대신 경계 화면의
// 「Try again」 Button 이 `/nodecanvas` · `/nodecanvas?project=` · `/videoeditor/[projectId]` 에 +6(−2). 쇼츠 결과 셸 −3 · Button +2(−1),
// 하이라이트 완료 Button +2, 어드민 Button −2 · 쿠폰 인쇄 Button +2, `/subscription` Button −3(구독 정보를 못 불러온 오류 상태로 재졌다),
// 결제 진행 데스크톱 「Pay now」 Button −1(대체가능 1 — 남은 빨강). 유튜브 연결 버튼은 부품 −2 · LOUIS Button +2 로 0 이다.
// 오류 경계로 재진 보드의 몫은 아래 「되살림(2026-10-08)」 문단에서 다시 올랐다.
// 같은 날 뒤: 262 → **281.** **이득이다.** 통합 판 원장에서 세운 제품 부품 일곱 세트(보드 생성기 PARTS) — 인증 입력 칸 14
// (`Product/Auth Floating Field` — 로그인 · 가입 · 비밀번호 찾기 · 새 비밀번호, 두 뷰포트), 가입 약관 동의 줄 2(`Product/Signup Legal Agreements`),
// 템플릿 상세 캐러셀 2 · 블로그 글 머리 2 · 문의 첨부 드롭존 2. 22 에서 가입 약관 줄 안으로 들어간 LOUIS Button(ghost md 「View」 둘 × 두
// 뷰포트) 4 를 빼면 +18 이다. 여기에 결제 진행 데스크톱 「Pay now」 가 Button 인스턴스가 됐다(+1, 대체가능 1 → 0) — 제품이 레이아웃 class 로
// 최소 폭만 280 으로 넓혀 매처의 레시피 대조(min-width 48px 문자열)에서 빠지던 것을, min-width 를 바닥으로 읽게 고쳤다
// (figma-component-substitution matchLouisPrimitive). 테마 순환 버튼 · 어드민 워드마크는 글자가 없어 보드에 묶이지 않는다(0).
// 같은 날 더 뒤: 281 → **317.** 보드가 늘어서다 — 셸 상태 레시피 보드 20(`migration/measure-states/shell.json` 의 `board`, 원장
// `migration/product-states/shell.json`): 셸 26(사이드바 10 · 데스크톱 상단 바 6 · 모바일 상단 바 10 — 기준 화면 `/archive` · `/subscription` ·
// `/videoeditor` · `/nodecanvas` 와 같은 조합), 허브 머리(`Product/Page Header`) 4(`/videoeditor seeded*` × 두 뷰포트), `/subscription past-due` 의
// LOUIS Button 6(기준 `/subscription` 과 같은 본문).
// 되살림(2026-10-08): 317 → **326.** 오류 경계(「Something went wrong」)로 재졌던 화면 다섯을 fixture 에 CDN 주소(NEXT_PUBLIC_CDN_BASE_URL)를
// 세워 다시 잰 결과다 — 보드별로 쇼츠 결과 데스크톱 +5(Button 3 · 사이드바 · 상단 바) · 모바일 +4(Button 3 · 상단 바), 공개 `/` 데스크톱 +3
// (Button 2 · Landing Footer) · 모바일 +1(Button), `/nodecanvas` 두 보드 ±0(경계의 「Try again」 Button −1 · 사이드바 또는 상단 바 +1),
// `/nodecanvas?project=` · `/videoeditor/[projectId]` 네 보드 각 −1(「Try again」 Button 이 걷혔고 편집기 화면에는 셸이 없다). 합 +9.
// 같은 날 저녁: 326 → **332.** **이득이다.** 돌아온 세션 화면에서 세운 제품 부품(보드 생성기 PRODUCT_PARTS) — `/nodecanvas?project=` 데스크톱의
// 노드 카드 셋(`Product/Canvas Text Node` · `Canvas Image Node` · `Canvas Video Node`) 3, 프로젝트 머리(`Product/Project Header`) 두 뷰포트 2,
// 편집기 모바일 타임라인(`Product/Mobile Timeline`) 1. 카드 안에는 LOUIS 인스턴스가 없어(머리 버튼은 IconButton 레시피의 bespoke) 빠진 것이 없다.
// 툴바 · 연결 버튼 · 머리 동작 · 복사 · 이미지 줄 · 눈금자는 글자가 없어, 생성 알약 · 제목 · LLM 결과는 카드 인스턴스 안이라 보드에 서지 않는다(0).
// 같은 날 뒤: 332 → **340.** **이득이다.** 트리 변환이 막던 두 자리를 규칙으로 풀어 세트에 넣었다 — 공개 모바일 보드 일곱(랜딩 · 문의 · 요금 ·
// 템플릿 · 블로그 · 블로그 글 · 템플릿 상세)의 타임라인 푸터가 `Product/Landing Footer` 모바일 variant 의 인스턴스가 됐고(+7, 감기는 줄에서
// 혼자 한 줄을 차지한 감긴 주소 칸 — build-figma-app-screens 의 reconcileFigmaSizing), `/nodecanvas?project=` 데스크톱의 줌 비율 트리거가
// `Product/Canvas Zoom Trigger` 의 인스턴스가 됐다(+1, 글자 + 캐럿 단추의 떼어낸 글자 — figma-tree-spec 의 flexRowTextRect).
// 2026-10-08 밤: 340 → **316.** 앵커를 54b62a8a(하이라이트 새 화면 갈래)로 옮긴 결과다 — 하이라이트 상세 `?__phase=` 보드 열둘의 셸 18
// (데스크톱 상단 바 · 사이드바 각 6, 모바일 상단 바 6)과 완료 두 보드의 셸 3이 스튜디오 판(Figma 세트 없음)으로 바뀌어 빠졌고, 업로드 단계의
// 테마 칩 줄(`Product/Highlight Theme Chips`) 2가 제품에서 걷혔다. 쇼츠 결과 두 보드의 상단 바 2는 **후퇴다** — 출처를 옮기려면 Figma 글리프
// 경계가 필요하다(아래 SHELL_INSTANCES_BY_BOARD 의 쇼츠 주석). 나머지 +1 은 새 판 보드 안에서 새로 붙은 LOUIS 인스턴스다.
// 2026-10-14: 316 → **332.** **이득이다.** 새 보드 넷 — `/models` 데스크톱 · 모바일 각 5, `/models/[slug]` 데스크톱 · 모바일 각 3(공개 시드
// fixture). 옛 보드의 instance 는 하나도 바뀌지 않았다. 공개 모바일 일곱의 missing −1 · structural −3 은 닫힌 모바일 메뉴 판(`clip-path:
// inset(0 0 100%)`)을 더는 그리지 않아서다(figma-tree-spec 의 clipPathHidesAll).
// 2026-10-15: 332 → 359. 분석 연결 상태 보드 열여덟(상태 레시피 analytics)이 셸 인스턴스 27(데스크톱 아홉 × 상단 바 · GNB 둘 + 모바일 아홉 × 상단 바)을 새로 얻었다.
// 2026-10-15 새벽: (332 기준으로는 −2) 후퇴가 아니라 그려진 상태가 바뀐 것이다 — auth 원장을 프로필 시드 · 세션 쿠키로 다시 재자
// `/highlight/[projectId]?__phase=loading` 두 보드가 「Couldn't load this project. · Reload」 오류(프로젝트 조회 401)에서 「Loading」
// (조회 200)으로 바뀌어 Reload Button 인스턴스가 보드마다 하나씩 빠졌다. 불러오기 단계의 제품 화면에는 단추가 없다.
// 합본: 359 − 2 = 357.
// 2026-10-15: (+4) **이득이다.** 랜딩 「/」 의 끈적 장면을 제 스크롤 자리에서 재자(조립 규칙 15조의 16) 맨 위 한 자리에서는
// 불투명도 0 이던 장면 층의 버튼이 보드에 섰다 — `Button` +4(크리에이터 장면 「Learn more」 · 「Apply」 등, 두 뷰포트).
// 합본: 357 + 4 = 361.
// 2026-10-15(R2): 332 → **354.** **이득이다.** 패널 상태 레시피 보드 열넷(캔버스 도움말 · 분석 · 이미지 편집 · 카메라 각도, 편집기 클립 색 조정 ·
// 에셋 · 설정 × 두 뷰포트)의 프로젝트 머리 2 · 캔버스 카드 3 · 줌 트리거 1 · 생성 알약 3 · 모바일 타임라인 3 과 LOUIS 인스턴스(버튼 · 탭 등)다.
// 옛 보드의 instance 는 바뀌지 않았다.
// 2026-10-15 아침 합본(P · Q · R1 · R2 의 밤 작업을 합쳐 다시 잼): 383 — 분석 · 패널 상태 · 관리자 · 랜딩 장면 보드가 얻은 인스턴스.
// 같은 아침 뒤: 383 → 448 — 관리자 탭 상태 보드 서른넷(상단 바 · 표 · 단추 인스턴스).
const INSTANCE_FLOOR = 448;
// 2026-09-13: 198 → 218. **20칸이 늘어져 있었다.** 이 검사는 `후보 < 바닥` 만 보므로 후보가 오른
// 만큼 바닥이 따라오지 않으면, 그 수만큼 후보를 구조로 재분류해도 조용히 통과한다(위 87행이
// 막겠다고 한 바로 그 길). 수는 instance 84 + replaceable 0 + bespoke 50 + blocked 3 + missing 81.
// 앵커를 옮겨 후보가 오르면 같은 커밋에서 이 수도 올린다(scripts/regen-figma-at-anchor.sh 머리말).
// 2026-09-13(같은 날 뒤): 218 → **182.** 보드가 준 것이 아니라 상단 바 13개가 인스턴스가 되어 그 안의
// 후보가 가지치기된 것이다(BESPOKE 문단): bespoke −25 · missing −11 · instance ±0(바 +13 · Avatar −13).
// 수는 instance 84 + replaceable 0 + bespoke 25 + blocked 3 + missing 70.
// 2026-09-14: 182 → **130.** 보드가 준 것이 아니라 본문 블록 21개가 인스턴스가 되어 그 안의 후보가 가지치기됐고
// (bespoke −20 · blocked −1 · missing −46 · instance +17), 원장의 「칠해진 마크」 판정이 인스턴스를 내용으로 보게
// 고쳐져(`measure-figma-board-composition.mjs` 의 `paintsNoContent`) highlight loading 두 보드의 메인 카드 면이
// missing → structural 로 제자리를 찾았다(−2). blocked −1 은 `/mypage/upgrade` 의 disabled 요금제 CTA 로, 이제
// `Plan=Trial` 카드 인스턴스 안이다. missing −46 은 요금제 카드의 체크 마크(18×18 `span` mask — 데스크톱 32 · 모바일 12) 44 와 billing-success 본문 알림 2 다.
// 수는 instance 101 + replaceable 0 + bespoke 5 + blocked 2 + missing 22.
// 2026-09-26: 130 → **128.** 보드가 준 것이 아니라 설정 화면 아바타 둘이 bespoke 가 되어 그 안의 폴백 글리프(`user-circle-fill`, b-vector)
// 둘이 가지치기됐다: missing −4(아바타 면 2 · 글리프 2) · bespoke +2. 수는 instance 101 + replaceable 0 + bespoke 3 + blocked 6 + missing 18.
// 같은 날 뒤: 128 그대로 — 알약 둘이 인스턴스(+2)가 되고 그 안의 점 둘(missing −2)이 빠졌다. 이어서 업로드 면 둘이 missing → bespoke
// (DropZone)로 옮겼다. 수는 instance 103 + bespoke 5 + blocked 6 + missing 14.
// 2026-09-26(뒤): 128 → **162.** 보드 여섯이 늘어서다(위 INSTANCE_FLOOR): instance +16 · missing +18. 미보유 18 은 전부
// `/subscription/coupons` 의 제품 전용 컨트롤이다 — 요금제 선택 카드 넷(데스크톱 · 모바일), 수량 스테퍼(− · +), 칠해진 마크,
// 결제 단계 표시. 수는 instance 119 + replaceable 0 + bespoke 5 + blocked 6 + missing 32.
// 같은 날 더 뒤: 162 → **158.** 보드가 준 것이 아니라 부품 인스턴스(+10) 안으로 미보유가 들어갔다(−14) — 요금제 카드 8 과 스테퍼
// 둘의 자리 2 가 인스턴스가 되며, 스테퍼 안의 − · + 버튼 넷(두 뷰포트)이 스테퍼 인스턴스 안이라 따로 세지 않는다. 수는 instance 129 +
// replaceable 0 + bespoke 5 + blocked 6 + missing 18.
// 같은 날 저녁: 158 → **145.** 보드가 준 것이 아니라 미보유 18 이 전부 부품 인스턴스(+5) 안으로 들어갔다 — 연결 버튼 둘은 제 자리가
// 인스턴스가 되고(−2), 테마 칩 12(여섯 × 두 뷰포트)는 칩 줄 인스턴스 안, 결제 동의 상자의 체크박스 1 · 약관 링크 3 은 동의 상자 인스턴스
// 안이라 따로 세지 않는다. 수는 instance 134 + replaceable 0 + bespoke 5 + blocked 6 + missing 0.
// 같은 날 밤: 145 → **225.** 보드가 늘어서다 — 결제 성공 미리보기 상태 보드 12: instance +27 · bespoke +8(`a` 요소에 앉은 Button
// 레시피 — 「Go to My Page」 · 「Back to plans」 · 「Go to archive」, primitive-site-element-mismatch) · missing +45. 미보유 45 는 전부
// bulk 성공 미리보기의 쿠폰 코드 칩(데스크톱 30 · 모바일 15, 칠해진 마크)이다 — 칩마다 글자가 달라 글자 서열 서명으로는 부품이 되지
// 않는다(글자 속성을 가진 부품이 다음 묶음). 수는 instance 161 + replaceable 0 + bespoke 13 + blocked 6 + missing 45.
// 같은 날 더 밤: 225 그대로 — 미보유 45 가 모두 같은 자리에서 인스턴스가 됐다(instance +45 · missing −45). 수는 instance 206 +
// replaceable 0 + bespoke 13 + blocked 6 + missing 0.
// 2026-09-28: 225 → **289.** 보드가 늘어서다 — 로그아웃 fixture 보드 22: instance +18 · bespoke +2(지구본) · blocked +2(`/signup/check-email`
// 「Resend email」 — Button/lg 상자인데 disabled 면이 variant 를 덮는다) · missing +42. 미보유 42 는 전부 인증 화면의 제품 전용 자리다 —
// 「Back to log in」 링크 버튼(높이 48, LOUIS 사다리 밖) 10 · 모바일 로고 링크 9 · 가입 약관 체크 마크(22×22) 8 · `/aws/signup` 약관 「View」 버튼(높이 22 · 반경 12) 4 ·
// 「Forgot password?」 · 「Sign up」 같은 글자 링크 8 · 링크 사이 세로 구분선 2 · 로그인 데스크톱 영상 판의 칠해진 덮개 1.
// 수는 instance 224 + replaceable 0 + bespoke 15 + blocked 8 + missing 42.
// 같은 날 뒤: 289 → **319.** 보드가 준 것도 판정을 푼 것도 아니다 — 생성기가 칠 없는 `<input>` 을 빈 껍데기로 버리던 것을 고쳐(입력칸이
// 패딩 높이로 눌렸다) 인증 화면의 입력 요소 30 이 보드에 섰고, LOUIS 컨트롤 사다리에 맞는 기하가 없어 미보유 +30 이다. 수는 instance 224 +
// replaceable 0 + bespoke 15 + blocked 8 + missing 72.
// 2026-09-30: 319 → **1618.** 보드가 늘어서다 — 공개 페이지 · 랜딩 보드 30(76 → 106). 미보유가 대부분(1216)이고 모두 공개 페이지의
// 제품 전용 자리다. 수는 instance 274 + replaceable 0 + bespoke 114 + blocked 14 + missing 1216.
// 2026-10-02: 1618 → **1616.** 보드가 줄었다 — 가입 보드 둘의 「Already have an account? Log in」에서 글자 링크(`<a>`, 미보유)가
// 섞인 문단 규칙으로 문단 글자의 범위 서식이 됐다(원장이 inlineRuns 를 실어 합칠 수 있게 됐다). 수는 instance 274 + replaceable 0 +
// bespoke 114 + blocked 14 + missing 1214.
// 2026-10-08: 1616 → **1498.** 통합 판 앵커(76b6cf15, DS-D-0079)로 다시 잰 결과 — 커밋된 원장(HEAD, 1882)과 견주면 −384 이고 대부분이
// 오류 경계로 재진 보드다: `/videoeditor/[projectId]` 데스크톱 244 → 2 · 모바일 30 → 2, `/nodecanvas?project=` 88 · 86 → 2 · 2, 공개 `/`
// 70 · 50 → 2 · 2, `/nodecanvas` 5 → 2(합 −559). 반대로 공개 모바일 보드 여섯의 새 타임라인 푸터가 부품 인스턴스가 아니라 날노드로 서며
// 미보유가 늘었다(문의 · 요금 · 템플릿 · 블로그 · 블로그 글 · 템플릿 상세 모바일 각 +26 ~ +27). 오류 경계 화면의 몫은 아래 「되살림」 문단에서 다시 올렸다.
// 수는 instance 262 + replaceable 1 + bespoke 134 + blocked 10 + missing 1091.
// 같은 날 뒤: 1498 → **1474.** 보드가 준 것이 아니라 부품 인스턴스(위 INSTANCE_FLOOR, +19) 안으로 후보가 들어가 가지치기됐다 — instance +19 ·
// replaceable −1(「Pay now」) · bespoke −2 · missing −40. 미보유 −40 은 인증 입력 칸 14 개의 `<input>`(LOUIS 사다리에 맞는 기하가 없던 미보유)
// 14 · 가입 약관 체크 마크(22×22) 4, 나머지 22 와 bespoke 2 는 캐러셀(‹ › 둥근 버튼 · 도트) · 아티클 머리 · 드롭존(textarea · 툴바) 서브트리
// 안의 자리다. 수는 instance 281 + replaceable 0 + bespoke 132 + blocked 10 + missing 1051.
// 같은 날 더 뒤: 1474 → **1933.** 보드가 늘어서다 — 셸 상태 레시피 보드 20: instance +36(위 INSTANCE_FLOOR) · bespoke +76(IconButton 13 ·
// Button 9 · Avatar 4 · 제품 글리프 50 — 커맨드 팔레트 · 홈 카드 · 연체 배너의 인라인 그림, figma-glyph-identity 의 2026-10-08 항목) · missing +347
// (칠해진 마크 213 · 상호작용 128 · 컨트롤 묶음 6 — 팔레트 행 · 시드 카드 그리드 · 컴포지션 카드 · 더보기 메뉴의 제품 전용 자리). 겹침(팔레트 ·
// 연체 배너)을 이 판에서 처음 그린다(생성기 measuredTree). 수는 instance 317 + replaceable 0 + bespoke 208 + blocked 10 + missing 1398.
// 되살림(2026-10-08): 1933 → **2555.** 오류 경계로 재졌던 화면 다섯을 다시 재 정상 화면이 보드에 섰다 — instance +9(위 INSTANCE_FLOOR) ·
// bespoke +111 · missing +502. 보드별로 `/videoeditor/[projectId]` 데스크톱 bespoke +26 · missing +217, 모바일 +6 · +23, `/nodecanvas?project=`
// 데스크톱 +27 · +67, 모바일 +26 · +66, 공개 `/` 데스크톱 +7 · +47, 모바일 +11 · +69, 쇼츠 결과 두 보드 각 +3 · +6, `/nodecanvas` 데스크톱
// +2 · +1. bespoke 는 대부분 편집기 · 노드 캔버스의 인라인 제품 글리프(figma-glyph-identity — 이번에 더한 question-circle-lucide ·
// check-stroke-badge · download-tray-line 포함) · IconButton 레시피이고, missing 은 편집기 타임라인 · 노드 카드 · 랜딩 개요의 제품 전용 자리다.
// 수는 instance 326 + replaceable 0 + bespoke 319 + blocked 10 + missing 1900.
// 같은 날 저녁: 2555 → **2485.** 보드가 준 것이 아니라 부품 인스턴스(위 INSTANCE_FLOOR, +6) 안으로 후보가 들어가 가지치기됐다 — instance +6 ·
// bespoke −25 · missing −51. `/nodecanvas?project=` 데스크톱 노드 카드 셋 안의 인라인 제품 글리프 · IconButton 레시피(머리 동작 · 연결 버튼 ·
// 복사)와 카드의 제품 전용 자리(모델 · 길이 · 비율 칩 · 프롬프트 칸 · 생성 알약), 프로젝트 머리의 뒤로 · 저장, 편집기 모바일 타임라인의
// 필름 줄이 인스턴스 안이라 따로 세지 않는다. 모바일 캔버스 카드(줌 0.19)는 variant 를 세우지 않아 그대로다.
// 수는 instance 332 + replaceable 0 + bespoke 294 + blocked 10 + missing 1849.
// 같은 날 뒤: 2485 → **2318.** 보드가 준 것이 아니라 부품 인스턴스(위 INSTANCE_FLOOR, +8) 안으로 후보가 들어가 가지치기됐다. 커밋된 원장
// (HEAD — instance 332 + bespoke 294 + blocked 10 + missing 1865 = 2501, 이 바닥보다 16 위에 있었다)과 보드별로 견주면 공개 모바일 보드 일곱이
// 각 instance +1 · bespoke −4(푸터 트랙 아이콘 넷 — 인라인 제품 글리프) · missing −23(푸터의 제품 전용 자리 — 눈금 · 링크 트랙 · 사업자 정보 줄),
// `/nodecanvas?project=` 데스크톱이 instance +1 · bespoke −1(캐럿 글리프) · missing −1(반투명 알약)이다 — 합 instance +8 · bespoke −29 ·
// missing −162. 수는 instance 340 + replaceable 0 + bespoke 265 + blocked 10 + missing 1703.
// 2026-10-08 밤: 2318 → **2422.** 앵커 54b62a8a — 셸 인스턴스가 빠진 하이라이트 보드 열넷(위 INSTANCE_FLOOR)의 사이드바 · 상단 바 자리가 아니라
// 스튜디오 판 본문의 새 자리(트랙 · 인스펙터 · 무대 막대 · 느낌표 원 글리프 `alert-circle-studio`)가 후보로 들어왔다.
// 수는 instance 316 + replaceable 0 + bespoke 296 + blocked 12 + missing 1798.
// 2026-10-15(R2): 2422 → **4137.** 그 사이 다른 작업의 보드(모델 라우트 등)로 오른 몫과 패널 상태 레시피 보드 열넷의 새 자리(편집기 인스펙터 ·
// 에셋 · 설정 몸통, 캔버스 도움말 · 분석 · 이미지 편집 · 카메라 각도 모달)를 함께 잠근다. 수는 instance 354 + replaceable 0 + bespoke 566 +
// blocked 37 + missing 3180.
// 2026-10-15 아침 합본: 4137 → 5144(instance 383 + bespoke 676 + blocked 57 + missing 4028).
// 같은 아침 뒤: 5144 → 6225 — 관리자 탭 상태 보드 서른넷.
const CANDIDATE_FLOOR = 6225;
// 2026-09-26(뒤): 36 → 42 — 보드 없던 실제 화면 셋의 보드 여섯(「⚠ 미등록」 섹션, 조립 규칙 20조).
// 같은 날 밤: 42 → 54 — 결제 성공 화면 넷의 `?preview=` 상태 보드 12(라우트 섹션 안, 조립 규칙 23조 「상태 프레임」).
// 2026-09-28: 54 → 76 — 로그아웃 fixture 보드 22(측정 세션 셋째 갈래, 조립 규칙 24조). 손 조립 보드를 대신한다.
// 2026-09-29 ~ 30: 76 → 106 — 공개 fixture 보드(공개 페이지 열넷 · 랜딩, 두 뷰포트).
const BOARD_FLOOR = 106;
const SHELL_COMPONENTS = new Set([
  "Product/Gnb Desktop Shell",
  "Product/Desktop App Top Bar",
  "Product/Mobile App Top Bar",
]);
// **보드마다 어떤 셸 인스턴스를 갖는지 정확히 잠근다(2026-09-13).** 합계 `INSTANCE_FLOOR` 는
// 한 보드에서 상단 바를 잃고 그 안의 Avatar 가 따로 세어지면 같은 수로 남는다 — 위 BESPOKE
// 문단의 회귀가 정확히 그렇게 지나갔다. 셸은 보드의 뼈대라 어느 보드가 무엇을 갖는지가 곧
// 사실이고, 그것이 바뀌는 것은 늘든 줄든 누군가 보고 적어야 하는 일이다. 그래서 양방향이다.
// 키는 `figma/app-screens.<키>.00.draw.js` 다.
//
// **같은 날 뒤이어 바뀐 것(2026-09-13, 앱 셸 세트 확장 뒤 재측정).** 이제 36 보드 모두 셸을 갖는다.
//   · 상단 바를 새로 얻은 보드 13 — highlight `?__phase=` 모바일 여섯은 `Width=Full, Breadcrumb=Trail,
//     Back=True`(앱 셸 세트에 측정 조합으로 더했다), 데스크톱 여섯은 `Content=Highlight, …, Back=True`
//     (치환의 CONTENT_BY_LABEL 에 Highlight 가 없어 「축을 판정하지 못했다」였다), `/subscription`
//     데스크톱은 `Content=Subscription, Breadcrumb=Single`(세트에 없던 조합). 셋 다 앱 셸 plan 의
//     측정 variant 이고, 옳은 바(자식이 앞머리·nav·뒷머리)에 붙었다.
//   · `archive.desktop` 의 바가 `Divider=Off` → `On` — 제품 `useMainChromeHeaderScrollProgress.ts:10-14`
//     가 헤어라인을 늘 켜고 측정 바가 전부 border 1px 인데, 옛 판정은 Home 을 Off 로 박았다.
//   · 사이드바 variant 가 바뀐 보드 9 — highlight 데스크톱 여섯 `Default → Highlight`
//     (`HighlightProjectScene.tsx:2345` `currentPath="/highlight"`), `/mypage/upgrade/billing-success`·
//     `billing-fail`·`fail` 데스크톱 `Default → Upgrade`(각 page 가 `currentPath="/mypage/upgrade"`).
//     둘 다 fixture 의 활성 표시(styleRef)와 맞고, 생성기의 사이드바 서명 가드가 다시 틀리지 않게 잡는다.
const SHELL_INSTANCES_BY_BOARD = {
  "analytics-youtube.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  // 2026-10-15 — 분석 연결 상태 보드(상태 레시피 analytics). 기준 보드와 같은 셸(분석 상단 바 · YouTube GNB)이 래퍼가 아니라 바 자리에 붙었다.
  "analytics-youtube-overview.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-overview.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "analytics-youtube-performance.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-performance.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "analytics-youtube-audience.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-audience.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "analytics-youtube-channel-info.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-channel-info.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "analytics-youtube-insufficient.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-insufficient.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "analytics-youtube-insufficient-performance.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-insufficient-performance.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "analytics-youtube-insufficient-audience.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-insufficient-audience.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "analytics-youtube-loading.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-loading.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "analytics-youtube-fatal.desktop": ["Product/Desktop App Top Bar · Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=YouTube"],
  "analytics-youtube-fatal.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=False, Divider=On"],
  "archive.desktop": ["Product/Desktop App Top Bar · Content=Home, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Home"],
  "archive.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  // 2026-10-08 밤(앵커 54b62a8a): 하이라이트 상세 `?__phase=` 보드 열둘의 셸을 뺐다(데스크톱 상단 바 · 사이드바 각 6, 모바일 상단 바 6). 하이라이트 새
  // 화면 갈래가 그 단계들을 스튜디오 판(`HighlightStudioShell` — Gnb variant=create: 뒤로 단추 · 프로필만, 앱 사이드바 없음)으로 바꿨고, 그
  // 막대의 Figma 세트는 없다(표면 원장 HighlightStudioShell · HighlightStudioBoard 판정). 매처가 놓친 것이 아니라 제품이 다른 셸을 그린다.
  // 2026-09-26(뒤): 보드 없던 실제 화면 셋. 셋 다 `<Gnb currentPath="/subscription">`(figma-component-substitution.mjs 의
  // PRODUCT_CURRENT_PATH 인용) — 사이드바에 Subscription 항목이 없어 Current=Default, 상단 바는 `/subscription` 보드와 같은 조합이다.
  "mypage-upgrade-bulk-fail.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-upgrade-bulk-fail.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-upgrade-bulk-success.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-upgrade-bulk-success.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  // 2026-10-08: `subscription-coupons` 두 보드는 생성 목록에서 빠졌다 — 통합 판(DS-D-0079)에서 `/subscription/coupons` 가 `/subscription?tab=group`
  // 으로 리다이렉트만 하는 옛 주소가 됐다(build-figma-app-screens 의 PRODUCT_SCREENS 주석).
  // 2026-10-08: `mypage-topup-fail.desktop` 상단 바 Content=MyPage → Subscription — 통합 판의 측정 바 글자가 「Subscription」 이다(같은 화면
  // 모바일 바는 그대로).
  "mypage-topup-fail.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-topup-fail.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-topup-success.desktop": ["Product/Desktop App Top Bar · Content=MyPage, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-topup-success.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-upgrade-billing-change-fail.desktop": ["Product/Desktop App Top Bar · Content=MyPage, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-upgrade-billing-change-fail.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-upgrade-billing-change-success.desktop": ["Product/Desktop App Top Bar · Content=MyPage, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-upgrade-billing-change-success.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-upgrade-billing-fail.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade-billing-fail.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=False, Divider=On"],
  "mypage-upgrade-billing-success.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade-billing-success.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=False, Divider=On"],
  // 2026-09-26(저녁): 결제 성공 화면 넷의 `?preview=` 상태 보드 12. 셸은 쿼리 없이 연 같은 라우트 보드와 한 글자도 다르지 않다 —
  // 미리보기는 본문만 목 데이터로 바꾸고 셸(`<Gnb currentPath>` · 상단 바)은 그대로 쓴다(측정기 sourceQuotes 의 page.tsx 인용).
  "mypage-upgrade-billing-success-preview-success.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade-billing-success-preview-success.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=False, Divider=On"],
  "mypage-upgrade-billing-success-preview-partial.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade-billing-success-preview-partial.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=False, Divider=On"],
  "mypage-upgrade-billing-change-success-preview-success.desktop": ["Product/Desktop App Top Bar · Content=MyPage, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-upgrade-billing-change-success-preview-success.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-topup-success-preview-success.desktop": ["Product/Desktop App Top Bar · Content=MyPage, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-topup-success-preview-success.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-upgrade-bulk-success-preview-success.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-upgrade-bulk-success-preview-success.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-upgrade-bulk-success-preview-issue-error.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "mypage-upgrade-bulk-success-preview-issue-error.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-upgrade-fail.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade-fail.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=False, Divider=On"],
  "mypage-upgrade.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=True, Divider=On"],
  "settings.desktop": ["Product/Desktop App Top Bar · Content=Settings, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "settings.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "subscription.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "subscription.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  // 2026-09-30 — 세션 원장 보드(허브 셋 · 결제 진행 · 관리자 모바일): 상단 바 · 사이드바 셸이 측정 서브트리 그대로 붙었다(보드 글자 자리 대조 · 캡처로 확인).
  "admin.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  // 2026-10-15 — 관리자 탭 상태 보드(상태 레시피 admin, 섹션 3521:223). 기준 /admin 모바일과 같은 상단 바가 래퍼가 아니라 바 자리에 붙었다.
  "admin-ambassador-links.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-ambassador.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-banners-landing.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-banners-models.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-banners.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-blog.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-captions.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-coupons.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-inquiries.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-jobs.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-metrics.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-payments.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-refunds.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-roles.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-templates.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-usage.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "admin-users.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "highlight.desktop": ["Product/Gnb Desktop Shell · Current=Highlight"],
  "highlight.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "mypage-upgrade-checkout.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade-checkout.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=True, Divider=On"],
  // 되살림(2026-10-08): `nodecanvas` 두 보드의 셸 — 통합 판 원장에서 세션 `/nodecanvas` 가 오류 경계 화면(「Something went wrong」)으로 재져
  // 잠시 뺐다가, fixture 에 CDN 주소(NEXT_PUBLIC_CDN_BASE_URL)를 세워 다시 재자 사이드바 · 상단 바가 돌아왔다.
  "nodecanvas.desktop": ["Product/Gnb Desktop Shell · Current=Canvas"],
  "nodecanvas.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  // 2026-10-08 밤(앵커 54b62a8a): 하이라이트 완료 두 보드의 셸도 뺐다 — 완료 상태도 스튜디오 판이 그린다(위 `?__phase=` 주석과 같은 사유).
  // 되살림(2026-10-08): 쇼츠 결과 두 보드의 셸 — 오류 경계로 재졌던 동안 셸이 없었다(위 INSTANCE_FLOOR 의 「쇼츠 결과 셸 −3」). 다시 잰 측정 바는
  // 뒤로 가기 단추 · 「Highlight / 자리표시 쇼츠 제목」 nav · 뒷머리의 세 자식이라 하이라이트 완료 보드와 같은 조합이고, 사이드바도 Highlight 다.
  // 2026-10-08 밤(앵커 54b62a8a): 쇼츠 결과의 상단 바 둘(데스크톱 Content=Highlight · 모바일 Full · Trail · 뒤로)을 뺐다. 제품은 같은 바를 그대로
  // 그리지만, 앱 셸 생성기가 그 조합의 출처(하이라이트 상세 `?__phase=`)를 잃었고 쇼츠 결과를 새 출처로 삼으려면 「자리표시 쇼츠 제목」의 Figma
  // 글리프 경계가 필요한데 읽기만으로는 잴 수 없다(build-figma-product-app-shell.mjs 의 variantInputs 주석). 경계를 재면 되살린다 — 후퇴다.
  "highlight--projectId--shorts--shortId-.desktop": ["Product/Gnb Desktop Shell · Current=Highlight"],
  "videoeditor.desktop": ["Product/Gnb Desktop Shell · Current=Composition"],
  "videoeditor.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  // 2026-10-08 — 셸 상태 레시피 보드 20(migration/measure-states/shell.json 의 board). 셸은 기준 화면과 같은 조합이다 — 상태(팔레트 · 연체 배너 ·
  // 시드 목록)는 본문 · 겹침에 서고 사이드바 · 상단 바는 바꾸지 않는다. 사이드바 서명이 기준과 같은 것은 생성기의 사이드바 서명 가드가 본다
  // (`/nodecanvas` 도 되살린 기준과 대조한다 — 위 nodecanvas 주석). 겹침은 앱 뿌리의 마지막 자식이라 셸 치환과 겹치지 않는다.
  "archive-palette.desktop": ["Product/Desktop App Top Bar · Content=Home, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Home"],
  "archive-palette.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "archive-palette-flyout.desktop": ["Product/Desktop App Top Bar · Content=Home, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Home"],
  "archive-palette-flyout.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "archive-palette-query.desktop": ["Product/Desktop App Top Bar · Content=Home, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Home"],
  "archive-palette-query.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "archive-palette-empty.desktop": ["Product/Desktop App Top Bar · Content=Home, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Home"],
  "archive-palette-empty.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "archive-seeded.desktop": ["Product/Desktop App Top Bar · Content=Home, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Home"],
  "archive-seeded.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "subscription-past-due.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "subscription-past-due.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "videoeditor-seeded.desktop": ["Product/Gnb Desktop Shell · Current=Composition"],
  "videoeditor-seeded.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "videoeditor-seeded-more-menu.desktop": ["Product/Gnb Desktop Shell · Current=Composition"],
  "videoeditor-seeded-more-menu.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "nodecanvas-seeded.desktop": ["Product/Gnb Desktop Shell · Current=Canvas"],
  "nodecanvas-seeded.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "nodecanvas-seeded-loading-more.desktop": ["Product/Gnb Desktop Shell · Current=Canvas"],
  "nodecanvas-seeded-loading-more.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
};

// 판정 어휘. 여기 없는 낱말은 판정이 아니라 오타이고, 오타는 어느 래칫에도 잡히지 않는다.
const VERDICTS = new Set([
  "instance", "replaceable", "bespoke", "blocked", "missing", "structural", "unclassified",
]);
// LOUIS 컴포넌트 이름을 적는 판정. 이 셋은 「LOUIS 에 그 컴포넌트가 있다」를 주장하므로 이름이
// 되읽기에 실재해야 한다. `instance` 는 여기 없다 — 그쪽 이름은 `Product/*` 장면 세트라
// 되읽기 어휘가 아니다.
const NAMES_A_LOUIS_COMPONENT = new Set(["replaceable", "bespoke", "blocked"]);
// 후보 조항. 분모를 정하는 것이 이 넷이라, 여기 없는 낱말이 들어오면 분모가 흐려진다.
const CLAUSES = new Set(["a-interactive", "b-vector", "c-painted-mark", "d-control-group"]);
// 사유의 최소 길이. `check-figma-surface-coverage` 의 MINIMUM_REASON 과 같은 값이다 —
// 「없음」 같은 한 낱말이 사유로 통과하면 분류는 형식만 남는다.
const MINIMUM_REASON = 20;
// 규칙 문서가 파일 안에 살아 있어야 한다. 규칙이 사라지면 이 수들은 비율이 아니라 그냥 수다.
const REQUIRED_RULES = [
  ["$candidateRule", "무엇이 컴포넌트 후보인가 — 분모의 정의"],
  ["$verdictRule", "판정을 다섯으로 가른 근거"],
  ["$bespokeRule", "bespoke 를 기계가 판정하는 방법과 그 조인표의 임자"],
  ["$glyphRule", "아이콘 정체를 어디서 뜨고 이름을 누가 소유하는가"],
  ["$primitiveSiteSource", "정본 자리·제외 목록과 레시피 상자를 어디서 읽는가"],
  ["$denominatorRule", "비율의 분모에서 구조를 뺀 근거"],
  ["$pruningRule", "대체 가능 노드의 자손을 세지 않는 근거"],
  ["$overlapRule", "제품 표면 원장과 겹치지 않는 근거"],
  ["$geometrySource", "대응 판정의 기준값을 되읽기에서 읽는 근거"],
];

const errors = [];
const ledger = readJson(LEDGER);
const readback = readJson(READBACK);
const plan = readJson(PLAN);

for (const [key, what] of REQUIRED_RULES) {
  if (typeof ledger[key] !== "string" || ledger[key].length < 40) {
    errors.push(LEDGER + " 에 " + key + " 가 없습니다(" + what + "). 규칙 없는 수는 비율이 아닙니다.");
  }
}

// 원장이 그린 보드와 지금 런너가 그리는 보드가 같은 제품 앵커여야 한다. 어긋나면 원장은
// 어제의 화면을 세고 있는 것이고, 그 수로 오늘을 판정하게 된다.
if (ledger.productCommit !== plan.productCommit) {
  errors.push(
    LEDGER + " 의 productCommit(" + String(ledger.productCommit).slice(0, 8) + ") 이 " +
      PLAN + " 의 " + String(plan.productCommit).slice(0, 8) + " 와 다릅니다. " +
      "`pnpm run measure-figma-board-composition` 로 다시 뽑으세요.",
  );
}

// 대응 규칙이 가리키는 이름은 되읽기에 실재해야 한다. 없는 이름을 적는 것은 「LOUIS 에 있다」를
// 근거 없이 말하는 것이고, 그것이 원장을 낡게 만드는 방식 그 자체다.
const componentVocabulary = new Set(Object.keys(readback.components ?? {}));
if (componentVocabulary.size === 0) {
  errors.push(READBACK + " 에서 Figma 컴포넌트 이름을 하나도 읽지 못했습니다.");
}
// **아이콘 사전은 컴포넌트 사전과 다르다.** DS-D-0038 이 아이콘을 컴포넌트 축 밖으로 갈라
// 두었고 되읽기도 `components` 와 `icons` 를 서로 다른 사전에 담는다. 둘을 합쳐서 보면
// 「LOUIS 에 있다」의 근거가 어느 축의 것인지 알 수 없어진다.
const iconVocabulary = new Set(Object.keys(readback.icons ?? {}));
if (iconVocabulary.size === 0) {
  errors.push(READBACK + " 에서 Figma 아이콘 이름을 하나도 읽지 못했습니다.");
}
const rules = Array.isArray(ledger.matchRules) ? ledger.matchRules : [];
if (rules.length === 0) errors.push(LEDGER + " 에 대응 규칙(matchRules)이 없습니다. 규칙이 없으면 대체 가능은 언제나 0 입니다.");
for (const rule of rules) {
  if (!componentVocabulary.has(rule.component)) {
    errors.push(
      LEDGER + "#matchRules." + String(rule.id) + ": 대응 규칙이 되읽기에 없는 컴포넌트를 " +
        "가리킵니다: " + String(rule.component),
    );
  }
  if (typeof rule.why !== "string" || rule.why.length < MINIMUM_REASON) {
    errors.push(LEDGER + "#matchRules." + String(rule.id) + ": why 가 " + MINIMUM_REASON + "자 미만입니다.");
  }
}

const nodes = ledger.nodes ?? {};
const ids = Object.keys(nodes);
if (ids.length === 0) errors.push(LEDGER + " 에 노드가 하나도 없습니다. 셀 것이 없으면 통과가 아닙니다.");

const recounted = { total: 0, instance: 0, replaceable: 0, bespoke: 0, blocked: 0, missing: 0, structural: 0, unclassified: 0 };
const unclassifiedIds = [];
const byComponent = {};
const bespokeByComponent = {};
const bespokeByIcon = {};

for (const id of ids) {
  const node = nodes[id];
  const at = LEDGER + "#" + id;
  // 식별자는 `<route>@<문맥>#<자식 인덱스 체인>` 이다. 모양이 무너지면 보드 도형 축이
  // 아니게 되고, 제품 표면 축과 겹치는지도 판정할 수 없다.
  if (!/^[^@]+@[^#]+#(root|\d+(\.\d+)*)$/.test(id)) {
    errors.push(at + ": 식별자가 `<route>@<문맥>#<자식 인덱스 체인>` 모양이 아닙니다.");
    continue;
  }
  if (!VERDICTS.has(node.verdict)) {
    errors.push(at + ": verdict 가 판정 어휘 밖입니다: " + String(node.verdict) + ". " +
      "어휘 밖의 낱말은 어느 래칫에도 잡히지 않습니다.");
    continue;
  }
  if (typeof node.reason !== "string" || node.reason.trim().length < MINIMUM_REASON) {
    errors.push(at + ": " + node.verdict + " 로 두려면 reason 에 " + MINIMUM_REASON + "자 이상의 사유가 필요합니다.");
  }
  // 후보 조항은 구조·사유없음을 뺀 판정에만 붙는다. 구조에 조항이 붙으면 분모가 흐려진다.
  const clause = node.candidateClause ?? null;
  if (node.verdict === "structural" || node.verdict === "unclassified") {
    if (clause !== null) errors.push(at + ": " + node.verdict + " 에 candidateClause 가 붙어 있습니다: " + String(clause));
  } else if (node.verdict !== "instance" && !CLAUSES.has(clause)) {
    errors.push(at + ": " + node.verdict + " 에는 후보 조항(candidateClause)이 " + [...CLAUSES].join("/") +
      " 중 하나로 필요합니다: " + String(clause));
  }
  // **이름을 대는 축이 둘이다.** 컴포넌트(`component`, 사전은 되읽기의 `components`)와
  // 아이콘(`icon`, 사전은 `icons`). 둘을 한 칸에 접으면 「LOUIS 에 있다」의 근거가 어느 축의
  // 것인지 사라진다 — DS-D-0038 이 두 축을 갈라 둔 이유가 그것이다. 한 노드가 둘 다 대는 일은
  // 없다: 아이콘 자리는 `b-vector` 조항이고 컴포넌트 자리는 나머지 셋이다.
  const hasComponent = typeof node.component === "string" && node.component.length > 0;
  const hasIcon = typeof node.icon === "string" && node.icon.length > 0;
  if (hasComponent && hasIcon) {
    errors.push(at + ": 한 자리가 컴포넌트(" + node.component + ")와 아이콘(" + node.icon +
      ") 이름을 둘 다 댔습니다. 두 축은 사전이 다릅니다.");
  }
  if (NAMES_A_LOUIS_COMPONENT.has(node.verdict) || node.verdict === "instance") {
    // 이름 없이 통과하는 자리는 하나다 — `blocked` 중 **어느 것인지 모르는 것 자체가 판정의
    // 내용**인 자리. 아이콘 여섯이 여기 있었지만 서명을 이어 닫혔고(2026-09-02), 지금 남은
    // blocked 여섯(ProgressBar 2 · SegmentedControl/settings 4, 2026-09-15)은 이름이 있다. 예외를 지우지 않는 이유는 그 길이 다시 열릴 수
    // 있어서다 — 측정이 축을 잃는 방식은 아이콘 말고도 있다(ProgressBar 의 State 가 그렇다).
    const mayLackName = node.verdict === "blocked" && !hasComponent && !hasIcon;
    if (!mayLackName && !hasComponent && !hasIcon) {
      errors.push(at + ": " + node.verdict + " 인데 어느 컴포넌트·아이콘인지 적혀 있지 않습니다.");
    } else if (NAMES_A_LOUIS_COMPONENT.has(node.verdict) && !mayLackName) {
      if (hasComponent && !componentVocabulary.has(node.component)) {
        errors.push(at + ": 되읽기에 없는 컴포넌트를 대응으로 적었습니다: " + node.component);
      }
      if (hasIcon && !iconVocabulary.has(node.icon)) {
        errors.push(at + ": 되읽기에 없는 아이콘을 대응으로 적었습니다: " + node.icon);
      }
      if (hasComponent) {
        const key = node.component + "/" + String(node.size);
        if (node.verdict === "replaceable") byComponent[key] = (byComponent[key] ?? 0) + 1;
        if (node.verdict === "bespoke") bespokeByComponent[key] = (bespokeByComponent[key] ?? 0) + 1;
      }
      if (hasIcon && node.verdict === "bespoke") bespokeByIcon[node.icon] = (bespokeByIcon[node.icon] ?? 0) + 1;
    }
  }
  // **미보유 아이콘도 이름을 대야 한다 — 다만 «없다»는 이름이다.** LOUIS 대응이 없다는 판정이라
  // `icon` 칸은 비지만, 어느 그림인지(`glyph`)는 반드시 적혀 있어야 한다. 없으면 다음 사람은
  // 「무엇을 세워야 하는가」를 보드를 열어 눈으로 찾아야 한다.
  if (node.candidateClause === "b-vector" && (typeof node.glyph !== "string" || node.glyph.length === 0)) {
    errors.push(at + ": 아이콘 자리인데 어느 글리프인지(glyph) 적혀 있지 않습니다. " +
      "이름은 figma/app-screens.plan.json 의 productGlyphs 가 소유합니다.");
  }
  // **bespoke 는 근거를 가리켜야 한다.** 「제품이 안 문다」는 판정을 사유 문장만으로 두면
  // 다음 사람이 손으로 아무 자리나 이 칸에 넣을 수 있다 — DS-D-0043 의 목록 중 어느 항목이
  // 그렇게 말했는지(`site` 또는 `probe`)가 함께 적혀야 조인이 검증 가능해진다.
  if (node.verdict === "bespoke" && typeof node.site !== "string"
      && typeof node.probe !== "string" && typeof node.glyph !== "string") {
    errors.push(
      at + ": bespoke 인데 근거가 된 정본 자리(site)도 제외 probe(probe)도 아이콘 글리프(glyph)도 " +
        "적혀 있지 않습니다. DS-D-0043 의 목록이나 아이콘 조인표와 조인한 결과라야 이 판정이 " +
        "검증 가능합니다.",
    );
  }
  if (node.verdict === "unclassified") unclassifiedIds.push(id);
  recounted[node.verdict] += 1;
  recounted.total += 1;
}

// 요약이 스스로를 속이지 못하게. 파일 안의 counts 는 다시 센 값과 같아야 한다.
const counts = ledger.counts ?? {};
for (const key of Object.keys(recounted)) {
  if (counts[key] !== recounted[key]) {
    errors.push(
      LEDGER + " 의 counts." + key + " (" + String(counts[key]) + ") 가 다시 센 값 " + recounted[key] +
        " 와 다릅니다. `pnpm run measure-figma-board-composition` 로 다시 뽑으세요.",
    );
  }
}
// 대응 집계도 다시 센다. 여기가 어긋나면 「무엇을 인스턴스로 바꿔야 하는가」의 목록이 틀린다.
// **bespoke 집계도 같이 센다** — 그쪽은 「무엇을 지금 바꾸면 «안» 되는가」의 목록이라, 틀리면
// 다음 사람이 바꾸면 안 되는 자리를 바꾼다.
for (const [field, recount] of [["byComponent", byComponent], ["bespokeByComponent", bespokeByComponent],
  ["bespokeByIcon", bespokeByIcon]]) {
  const stored = ledger[field] ?? {};
  for (const key of new Set([...Object.keys(recount), ...Object.keys(stored)])) {
    if (stored[key] !== recount[key]) {
      errors.push(
        LEDGER + " 의 " + field + "." + key + " (" + String(stored[key]) + ") 가 " +
          "다시 센 값 " + String(recount[key]) + " 와 다릅니다.",
      );
    }
  }
}

// ── 두 원장은 다른 축이다 ─────────────────────────────────────────────────
// 식별자 공간이 겹치면 같은 것을 두 번 세거나 절반을 잃는다. 지금은 모양이 달라 겹칠 수
// 없으므로(보드는 `@` 를 갖고 표면은 `apps/web/` 으로 시작한다) 겹치는 날 멈춘다.
const surfaces = readJson(SURFACES).surfaces ?? {};
const shared = ids.filter((id) => Object.hasOwn(surfaces, id));
if (shared.length > 0) {
  errors.push(
    "보드 원장과 " + SURFACES + " 가 같은 식별자를 씁니다: " + shared.slice(0, 3).join(", ") +
      ". 두 원장은 다른 축(보드 도형 ↔ 제품 소스)이고 조인할 키가 없습니다 — 합치면 " +
      "같은 것을 두 번 세거나 절반을 잃습니다.",
  );
}
const surfaceShaped = ids.filter((id) => id.startsWith("apps/web/"));
if (surfaceShaped.length > 0) {
  errors.push(
    "보드 원장에 제품 소스 모양의 식별자가 들어왔습니다: " + surfaceShaped.slice(0, 3).join(", ") +
      ". 보드 축은 제품 소스 경로를 알지 못합니다(draw payload 에 그 정보가 없습니다).",
  );
}

// ── 래칫 ──────────────────────────────────────────────────────────────────
const candidates =
  recounted.instance + recounted.replaceable + recounted.bespoke + recounted.blocked + recounted.missing;

if (recounted.replaceable > REPLACEABLE_BASELINE) {
  errors.push(
    "대체 가능한 도형이 " + (recounted.replaceable - REPLACEABLE_BASELINE) + "개 늘었습니다 " +
      "(" + REPLACEABLE_BASELINE + " → " + recounted.replaceable + "). LOUIS 에 이미 있는 " +
      "컴포넌트를 손으로 다시 그렸다는 뜻입니다 — 인스턴스로 놓으세요. 목표는 0 입니다.",
  );
} else if (recounted.replaceable < REPLACEABLE_BASELINE) {
  errors.push(
    "대체 가능한 도형이 " + (REPLACEABLE_BASELINE - recounted.replaceable) + "개 줄었습니다 " +
      "(" + REPLACEABLE_BASELINE + " → " + recounted.replaceable + "). 이득을 잠그세요 — " +
      "이 파일의 REPLACEABLE_BASELINE 을 " + recounted.replaceable + " 로 내립니다. " +
      "내리지 않으면 그 자리는 다음에 조용히 되돌아옵니다.",
  );
}

// **하락만 잠근다.** 상승은 발견이다 — 아직 안 본 자리를 열어 보고 「제품이 여기서 정본을
// 물지 않는다」를 적은 결과이고, 그것을 실패로 만들면 다음 사람은 열어 보지 않는 쪽을 고른다.
// 하락은 이득(제품이 정본을 물기 시작해 인스턴스가 되었다)일 수도, 판정을 푼 것일 수도 있으므로
// 손으로 적게 한다.
if (recounted.bespoke < BESPOKE_BASELINE) {
  errors.push(
    "제품이 정본을 물지 않는 자리(bespoke)가 " + (BESPOKE_BASELINE - recounted.bespoke) +
      "개 줄었습니다 (" + BESPOKE_BASELINE + " → " + recounted.bespoke + "). 줄어드는 길은 " +
      "둘입니다 — 제품이 그 자리에서 정본을 물기 시작했거나(이득), 판정을 느슨하게 풀어 다른 " +
      "칸으로 흘려보냈거나. 이 파일의 BESPOKE_BASELINE 을 " + recounted.bespoke +
      " 로 내리고 어느 쪽인지 적으세요.",
  );
}

if (recounted.unclassified > UNCLASSIFIED_BASELINE) {
  errors.push(
    "규칙이 보지 못한 모양이 " + (recounted.unclassified - UNCLASSIFIED_BASELINE) + "개 늘었습니다 " +
      "(" + UNCLASSIFIED_BASELINE + " → " + recounted.unclassified + "). 후보 조항이나 구조 유형을 " +
      "넓혀 판정하세요. 사유 없이 넘기는 길은 없습니다.\n      새로 생긴 자리: " +
      unclassifiedIds.slice(0, 5).join(", "),
  );
} else if (recounted.unclassified < UNCLASSIFIED_BASELINE) {
  errors.push(
    "규칙이 보지 못한 모양이 " + (UNCLASSIFIED_BASELINE - recounted.unclassified) + "개 줄었습니다. " +
      "이 파일의 UNCLASSIFIED_BASELINE 을 " + recounted.unclassified + " 로 내려 이득을 잠그세요.",
  );
}

if (recounted.instance < INSTANCE_FLOOR) {
  errors.push(
    "보드의 인스턴스가 " + (INSTANCE_FLOOR - recounted.instance) + "개 줄었습니다 " +
      "(" + INSTANCE_FLOOR + " → " + recounted.instance + "). 인스턴스를 도형으로 되돌리는 것은 " +
      "후퇴입니다 — `check-figma-app-screens` 는 이 교환을 보지 못합니다.",
  );
} else if (recounted.instance > INSTANCE_FLOOR) {
  errors.push(
    "보드의 인스턴스가 " + (recounted.instance - INSTANCE_FLOOR) + "개 늘었습니다 " +
      "(" + INSTANCE_FLOOR + " → " + recounted.instance + "). 이 파일의 INSTANCE_FLOOR 를 " +
      recounted.instance + " 로 올려 이득을 잠그세요.",
  );
}

// **보드별 셸 인스턴스 래칫** — 머리의 `SHELL_INSTANCES_BY_BOARD` 주석 참조.
{
  const live = {};
  for (const node of Object.values(ledger.nodes ?? {})) {
    if (node?.verdict !== "instance" || !SHELL_COMPONENTS.has(node.component)) continue;
    const key = String(node.board ?? "").replace(/^figma\/app-screens\./, "").replace(/\.00\.draw\.js$/, "");
    (live[key] ??= []).push(node.component + " · " + node.variant);
  }
  for (const board of new Set([...Object.keys(live), ...Object.keys(SHELL_INSTANCES_BY_BOARD)])) {
    const was = [...(SHELL_INSTANCES_BY_BOARD[board] ?? [])].sort();
    const now = [...(live[board] ?? [])].sort();
    const lost = was.filter((item, i) => was.indexOf(item) === i &&
      was.filter((x) => x === item).length > now.filter((x) => x === item).length);
    const gained = now.filter((item, i) => now.indexOf(item) === i &&
      now.filter((x) => x === item).length > was.filter((x) => x === item).length);
    if (lost.length > 0) {
      errors.push(
        board + " 보드가 셸 인스턴스를 잃었습니다: " + lost.join(" / ") + ". 셸이 날노드로 돌아가도 " +
          "INSTANCE 합계는 그 안의 부품이 따로 세어져 그대로일 수 있습니다 — 매처가 이 보드의 바나 " +
          "사이드바를 놓친 이유를 먼저 찾으세요. 제품이 정말 그 셸을 걷었다면 " +
          "SHELL_INSTANCES_BY_BOARD 를 고치고 사유를 적으세요.",
      );
    }
    if (gained.length > 0) {
      errors.push(
        board + " 보드가 셸 인스턴스를 새로 얻었습니다: " + gained.join(" / ") + ". 옳은 바에 붙었는지 " +
          "(래퍼가 아니라 자식이 앞머리·nav·뒷머리인 노드인지) 확인한 뒤 SHELL_INSTANCES_BY_BOARD 에 " +
          "넣고 사유를 적으세요 — 세트에 없는 조합이 우연히 맞아 붙는 오치환도 이 길로 들어옵니다.",
      );
    }
  }
}

// **분모를 지워서 비율을 올리는 길을 막는 그물.** 후보를 구조로 재분류하면 대체 가능도 줄고
// 비율도 오른다 — 그림은 한 장도 안 바뀌었는데.
if (candidates < CANDIDATE_FLOOR) {
  errors.push(
    "컴포넌트 후보가 바닥 아래로 내려갔습니다 (" + CANDIDATE_FLOOR + " → " + candidates + "). " +
      "후보를 구조로 재분류해 분모를 줄이면 비율은 오르지만 보드는 한 장도 바뀌지 않습니다. " +
      "보드가 실제로 줄었다면 CANDIDATE_FLOOR 를 함께 내리고 무엇이 사라졌는지 적으세요.",
  );
}

const boardCount = Array.isArray(ledger.boards) ? ledger.boards.length : 0;
if (boardCount < BOARD_FLOOR) {
  errors.push(
    "보드 수가 바닥 아래로 내려갔습니다 (" + BOARD_FLOOR + " → " + boardCount + "). " +
      "보드를 지워서 수를 예쁘게 만드는 길을 막는 그물입니다.",
  );
}

if (errors.length > 0) {
  console.error("화면 보드 구성 게이트 실패:");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

const target = recounted.instance + recounted.replaceable;
const pct = (numerator, denominator) => (denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0.0");
console.log(
  "화면 보드 구성: 보드 " + boardCount + "장 · 인스턴스 " + recounted.instance +
    " / 대체가능 " + recounted.replaceable + " / 제품bespoke " + recounted.bespoke +
    " / 구조 " + recounted.structural +
    " / 미보유 " + recounted.missing + " / 막힘 " + recounted.blocked +
    " / 사유없음 " + recounted.unclassified +
    " · 인스턴스 비율 " + pct(recounted.instance, target) + "% (목표 100%, 분모 " + target +
    " = 인스턴스+대체가능) · 후보 전체 대비 " + pct(recounted.instance, candidates) +
    "% (분모 " + candidates + ").",
);
// **100% 가 「보드가 끝났다」는 뜻이 아니다.** 목표의 분모는 «지금 바꿀 수 있는 것»이라
// 대체가능이 0 이면 비율은 정의상 100% 가 된다 — 그런데 그 옆에 bespoke·missing·blocked 가
// 그대로 앉아 있다. 이 문장이 없으면 다음 사람은 첫 줄만 읽고 이 축을 닫는다.
if (recounted.replaceable === 0 && recounted.bespoke + recounted.missing + recounted.blocked > 0) {
  console.log(
    "  ※ 인스턴스 비율 100% 는 「보드가 끝났다」가 아니다 — 분모가 «지금 바꿀 수 있는 것»이라 " +
      "대체가능이 0 이면 정의상 100% 다. 남아 있는 것은 후보 전체 대비 " +
      pct(recounted.instance, candidates) + "% 쪽이 센다: 제품bespoke " + recounted.bespoke +
      " · 미보유 " + recounted.missing + " · 막힘 " + recounted.blocked + ".",
  );
}
// **구조는 분모 밖이다** — 그 판단이 이 수 전체를 좌우하므로 이유를 매번 함께 찍는다.
console.log(
  "  구조 " + recounted.structural + "개는 분모에서 뺐다: 칠 없는 auto-layout 프레임 · 자기가 " +
    "감싸는 것을 칠하는 프레임 · TEXT 잎 · 이미지. Figma 의 FRAME·TEXT·IMAGE 가 그것들의 정본이고 " +
    "컴포넌트로 만들면 재사용 계약이 없는 껍데기가 된다(Linear 도 Issue Page 안에 frame 21 개를 " +
    "그대로 둔다). 후보 규칙은 " + LEDGER + " 의 $candidateRule 이 소유한다.",
);
// **여기가 2026-09-02 까지 거짓말을 인쇄하던 자리다.** 「대체가능 62개가 지금 바꿀 수 있는
// 것이다」로 찍었는데 그 62 중 60 은 바꾸면 «안» 되는 자리였다(제품이 지역 스타일로 그린다).
// 그래서 두 줄로 가른다 — 지금 하는 일과, 지금 하면 안 되는 일.
const tally = (counted) =>
  Object.entries(counted).sort((a, z) => z[1] - a[1]).map(([k, v]) => k + " " + v).join(" · ");
console.log(
  "  대체가능 " + recounted.replaceable + "개가 지금 바꿀 수 있는 것이다" +
    (recounted.replaceable === 0 ? " — 지금은 없다." : ": " + tally(byComponent) + "."),
);
console.log(
  "  제품bespoke " + recounted.bespoke + "개는 **지금 바꾸면 안 된다**: " +
    tally({ ...bespokeByComponent, ...bespokeByIcon }) +
    ". LOUIS 에 컴포넌트는 있지만 제품이 그 자리에서 정본 클래스를 물지 않는다(DS-D-0043) — " +
    "Figma 에서만 인스턴스로 바꾸면 Figma 가 제품보다 더 「정본」이 되어 두 축이 어긋난다. " +
    "이 칸은 제품이 정본을 물기 시작하면 열린다. **그것이 되어야 하는가는 이 축의 질문이 " +
    "아니라 표면 원장(migration/product.surfaces.json)의 `needed` 가 세는 질문이다.**",
);
console.log(
  "  미보유 " + recounted.missing + " · 막힘 " + recounted.blocked +
    "(대응은 있는데 측정이 고를 정보를 잃었다 — ProgressBar 의 State 축 2 와, 제품은 정본을 무는데 레시피 원장 probe 가 " +
    "쓰이지 않는 상수를 재는 SegmentedControl/settings 4(2026-09-15 bespoke 에서 옮겼다), 그리고 Button/lg 상자에 disabled 면이 " +
    "variant 를 덮은 `/signup/check-email` 「Resend email」 2(2026-09-28 로그아웃 보드). " +
    "`/mypage/upgrade` 의 disabled 요금제 CTA 는 2026-09-14 부터 요금제 카드 인스턴스 안이라 세지 않는다). " +
    "아이콘 정체 여섯은 서명을 이어 닫혔고 bespoke 4 · 미보유 2 로 갈렸다) · " +
    "제품bespoke " + recounted.bespoke + " 는 늘어도 실패하지 않는다 — 발견이지 후퇴가 아니다. " +
    "bespoke 는 «줄 때» 잠근다(BESPOKE_BASELINE).",
);
