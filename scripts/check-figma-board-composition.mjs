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
const BESPOKE_BASELINE = 3; // 하락만 잠근다(상승은 발견) — 오르면 이 수를 새 수로 올린다
const UNCLASSIFIED_BASELINE = 0;
// 2026-09-10: 76 → 84. **이득이다.** `buttonVariantOf` 가 secondary 를 「투명」으로 알아보고
// 있었는데, 제품이 그 variant 에 8% 잉크 면을 준 뒤(5566ecd) 그 면이 테마를 따라 갈려서
// 라이트 화면의 secondary 버튼이 한 자리도 인스턴스가 되지 못했다. 원장에 라이트 벌
// (`button-secondary-light`)을 세우고 실측 두 면으로 판정하게 고쳤고, 면도 헤어라인도 없는
// `ghost` 도 같은 이유로 자리를 잃고 있어 함께 열었다. 대체가능 22 → 0.
// 2026-09-14: 84 → **101.** **이득이다.** 본문 블록 21개(결과 8 · 체크아웃 6 · 요금제 카드 5 · 보이는 조각 2)가 인스턴스가
// 됐고, 요금제 카드 안의 `Button` inverse 인스턴스 4 가 카드 인스턴스 안으로 들어가 세어지지 않는다: 84 + 21 − 4.
const INSTANCE_FLOOR = 101;
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
const CANDIDATE_FLOOR = 128;
const BOARD_FLOOR = 36;
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
  "archive.desktop": ["Product/Desktop App Top Bar · Content=Home, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Home"],
  "archive.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "highlight--projectId-__phase-analyzing.desktop": ["Product/Desktop App Top Bar · Content=Highlight, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Highlight"],
  "highlight--projectId-__phase-analyzing.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=True, Divider=On"],
  "highlight--projectId-__phase-extracting.desktop": ["Product/Desktop App Top Bar · Content=Highlight, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Highlight"],
  "highlight--projectId-__phase-extracting.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=True, Divider=On"],
  "highlight--projectId-__phase-failed.desktop": ["Product/Desktop App Top Bar · Content=Highlight, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Highlight"],
  "highlight--projectId-__phase-failed.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=True, Divider=On"],
  "highlight--projectId-__phase-loading.desktop": ["Product/Desktop App Top Bar · Content=Highlight, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Highlight"],
  "highlight--projectId-__phase-loading.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=True, Divider=On"],
  "highlight--projectId-__phase-upload.desktop": ["Product/Desktop App Top Bar · Content=Highlight, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Highlight"],
  "highlight--projectId-__phase-upload.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=True, Divider=On"],
  "highlight--projectId-__phase-uploading.desktop": ["Product/Desktop App Top Bar · Content=Highlight, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Highlight"],
  "highlight--projectId-__phase-uploading.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Trail, Back=True, Divider=On"],
  "mypage-topup-fail.desktop": ["Product/Desktop App Top Bar · Content=MyPage, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
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
  "mypage-upgrade-fail.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade-fail.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=False, Divider=On"],
  "mypage-upgrade.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Trail, Back=True, Divider=On", "Product/Gnb Desktop Shell · Current=Upgrade"],
  "mypage-upgrade.mobile": ["Product/Mobile App Top Bar · Width=Inset, Breadcrumb=Trail, Back=True, Divider=On"],
  "settings.desktop": ["Product/Desktop App Top Bar · Content=Settings, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "settings.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
  "subscription.desktop": ["Product/Desktop App Top Bar · Content=Subscription, Breadcrumb=Single, Back=False, Divider=On", "Product/Gnb Desktop Shell · Current=Default"],
  "subscription.mobile": ["Product/Mobile App Top Bar · Width=Full, Breadcrumb=Single, Back=False, Divider=On"],
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
    "쓰이지 않는 상수를 재는 SegmentedControl/settings 4(2026-09-15 bespoke 에서 옮겼다). " +
    "`/mypage/upgrade` 의 disabled 요금제 CTA 는 2026-09-14 부터 요금제 카드 인스턴스 안이라 세지 않는다). " +
    "아이콘 정체 여섯은 서명을 이어 닫혔고 bespoke 4 · 미보유 2 로 갈렸다) · " +
    "제품bespoke " + recounted.bespoke + " 는 늘어도 실패하지 않는다 — 발견이지 후퇴가 아니다. " +
    "bespoke 는 «줄 때» 잠근다(BESPOKE_BASELINE).",
);
