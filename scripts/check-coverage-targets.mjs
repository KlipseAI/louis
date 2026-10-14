#!/usr/bin/env node
// **목표가 선언된 지표를 한 자리에서 인쇄하고, 아무도 잠그지 않던 것들을 잠근다.**
//
// 왜 있나: 소유자가 2026-09-02 에 「모든 지표를 100% 로」를 선언했다. 그때 지표들은
// 흩어져 있었고 방향이 없었다 — `needed` 161 은 게이트가 「늘어도 실패하지 않는다」로
// 인쇄하고, `manifest partial` 22 는 verify-figma-done 이 세지만 목표가 없으며,
// **죽은 토큰은 아무 게이트도 세지 않았다.** 목표 없는 수는 대시보드가 아니라 소음이다.
//
// ── 왜 `report-` 가 아니라 `check-` 인가 ──────────────────────────────────
// 브리프는 `report-coverage-targets` 라는 이름을 제안했지만, 이 저장소의 이름 관례에서
// `report-` 는 없고 `check-`/`verify-` 뿐이며 **그 둘은 실패한다.** 그리고 실패하지 않는
// 리포트는 아무도 안 본다 — hosted CI 가 46회 연속 빨갛도록 아무도 못 본 사고가 이 저장소의
// 출발점이다(verify-gate-split 머리말). 이름이 「보고서」라고 말하면 다음 사람은 이 파일을
// 읽지 않고 지나갈 것이므로, 이름과 동작을 맞춘다.
//
// ── 무엇을 잠그고 무엇을 잠그지 않는가 ────────────────────────────────────
// **이미 임자가 있는 수는 여기서 다시 잠그지 않는다.** 표면 대응은
// `check-figma-surface-coverage` 가, 보드 인스턴스·대체가능은 `check-figma-board-composition`
// 이 이미 양방향으로 잠근다. 같은 수에 래칫을 둘 걸면 baseline 이 두 곳에 살고 반드시
// 어긋난다. 여기서는 그 수들을 **목표·방향과 함께 인쇄하고 임자를 이름으로 가리킨다.**
//
// 대신 **임자가 없던 넷을 잠근다** — `needed` · `unclear` · manifest `done` · 죽은 토큰.
//
// ── `needed` 에 래칫을 걸 수 있는가 (브리프의 질문) ───────────────────────
// 「새 제품 표면이 생겨 늘었다」와 「세우기를 미뤄 늘었다」를 **구분할 수 없다.** 표면 총수가
// 함께 올랐는지를 보면 첫 경우는 가려지지만, 총수가 그대로인 채 `needed` 가 오르는 경우가
// 남는다: `scoped → needed`(「범위 밖이라 했는데 사실 그려야 한다」)는 **발견**이고,
// `figma → needed`(「그렸다고 했는데 아니었다」)는 후퇴다. 두 이동은 같은 +1 로 보인다.
//
// 그런데 **후퇴 쪽은 이미 다른 그물에 걸린다** — `figma → needed` 는 `mapped` 를 떨어뜨리고
// MAPPED_BASELINE 이 그것을 실패시킨다. 그래서 상승을 실패로 만들면 잡히는 것은 발견뿐이고,
// 발견을 벌하면 다음 사람은 열어 보지 않는 쪽을 고른다. **상승은 자유로 둔다.**
//
// 대신 **하락을 잠근다.** `needed` 가 줄 수 있는 길은 셋이다 — Figma 에 세웠다(mapped 상승,
// 이득이므로 잠근다) · 판단 대기로 미뤘다(`unclear` 상승, 미룬 것은 기록돼야 한다) ·
// **범위 밖으로 옮겼다**(`scoped` 상승, 이것이 유일한 부정 경로다). 셋 다 baseline 을 손으로
// 내리게 만들어 「무엇이 어디로 갔는가」를 적게 한다.
//
// 그 셋 중 마지막을 위해 **`scoped` 에 천장을 건다**: 범위 밖 바구니는 표면 총수가 늘어난
// 만큼만 커질 수 있다. 총수가 그대로인데 `scoped` 가 오르면 무언가를 그 안으로 옮긴 것이고,
// 그 바구니가 이 원장에서 **것들이 사라지는 자리**이므로 매번 손으로 적게 만든다.
// (소유자 지시: 「`scoped` 211 — 분모 밖 — 사유가 지킨다」. 사유가 지키려면 들어가는 것이
// 보여야 한다.)
//
// ── 죽은 토큰: 양방향, 목표 0 ─────────────────────────────────────────────
// 여기에는 「발견」이 없다. 선언된 토큰 전수는 기계가 결정적으로 열거하므로, 수가 오르는
// 길은 둘뿐이다 — 아무도 안 쓰는 토큰을 새로 만들었거나(DS-D-0029: 이름은 참이어야 한다),
// 마지막 소비자를 지웠거나. 둘 다 들어야 할 소식이다. 목표는 **지워서 0** 이지, 제품에
// 억지로 쓰게 해서 0 이 아니다.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readAnchor } from "./lib/product-anchor.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(resolve(repoRoot, relative), "utf8");
const readJson = (relative) => JSON.parse(read(relative));

const SURFACES = "migration/product.surfaces.json";
const BOARD = "migration/figma-board-composition.json";
const TOKEN_USAGE = "migration/louis-token-usage.json";
const MANIFEST = "design/manifest.json";
const TOKENS_CSS = "packages/css/generated/tokens.css";
// **소비자가 아니다 — 대조군이다.** 같은 토큰 원천에서 생성되므로 토큰이 존재한다는
// 이유만으로 참조한다. 이것을 소비로 세면 죽은 토큰이 얼마나 «내려가는지»를 함께 인쇄해,
// 정의를 느슨하게 푸는 것만으로 수가 좋아지는 폭을 읽는 사람이 보게 한다.
const THEME_CSS = "packages/css/generated/theme.css";
const AUTHORED_CSS = ["packages/css/src", "packages/react/src"];
// **단위를 되짚는 곳.** CSS 선언 이름 하나가 토큰 하나가 아니다 — 원천이 `-rgb` 채널과
// 합성 하위 속성(`-duration`·`-delay`·`-timing-function`, `-font-size` …)을 함께 발행한다.
// 이름을 이 파일의 `id` 로 되짚어야 「지울 수 있는 것」을 셀 수 있다(DS-D-0047).
const TOKEN_SOURCE = "packages/tokens/src/klipse.tokens.json";

// ── baseline ──────────────────────────────────────────────────────────────
// 2026-09-03 실측(앵커 `ae8fd627` → `5a67d692` 재고정 직후). **새 위반을 받아들이려고 이 수를
// 움직이지 마라** — 이 저장소의 규칙이다. 각 수의 방향은 아래 래칫 절이 소유한다.
//
// 이번에 내린 넷은 전부 **재고정이 드러낸 이득**이지 정의를 푼 결과가 아니다.
//   needed 161 → 158  랜딩 캐러셀 셋이 제품에서 사라졌다(FeatureCarousel#BrandGlyph ·
//                     ModelCarousel#BrandGlyph · TemplateGrid#Logo). Figma 에 세운 것이
//                     아니라 세울 자리가 없어진 것이므로 이득의 종류가 다르다 — 그래서
//                     여기 적는다.
//   scoped 211 → 210  같은 삭제(FeatureCarousel#FeatureCarousel).
//   총수 400 → 434    새 앵커에서 표면 38개가 «처음» 보였다. 27개는 옛 앵커에 파일조차
//                     없던 자리다 — `--diff-filter=A` 로 생긴 것은 lock 에 이름이 없어
//                     구조상 영원히 안 보였다(원장 `lock-anchor-hides-143-files`).
//                     전부 `unclear`(소유자 판단 대기)로 들어갔다. unclear 9 → 47 은
//                     상승이므로 UNCLEAR_BASELINE 은 그대로 둔다 — 미룬 것을 baseline 에
//                     새겨 넣으면 그것이 새 바닥이 된다.
//   죽은 토큰 98 → 95 앵커가 못 보던 제품 소비처가 드러났다. `color-bg-raised` 가 그
//                     대표였고 아래 ANCHOR_BLIND_TOKENS 가 비게 된 이유다.
// 158 → 179. 상승은 발견이라 게이트가 실패시키지 않지만, **baseline 을 158 에 두면 그
// 사이 21칸이 눈먼 구간이 된다** — needed 가 179 에서 160 으로 떨어져도 아무 래칫도 물지
// 않는다. UNCLEAR 를 9 → 47 로 올린 것과 똑같은 이유이고, verify-gates 의 canary
// (`coverage targets needed fell without locking`)가 그것을 강제한다: 그 canary 는
// counts.needed 를 1 내리고 실패를 기다리는데, baseline 이 낡으면 canary 자신이 눈이 먼다.
// 181 → 179 (2026-09-06). 둘 다 **Figma 에 세웠다** — Button 흡수 둘이다.
//   legal/LegalDocumentBackButton  → Button(ghost · Icon=left · LeftIconGlyph=icon/caret-left)
//   templates/CopyPromptButton     → Button(Label + LeftIconGlyph 슬롯 교체. 성공은 축이 아니다)
// 어느 것도 새 축을 열지 않았다. 두 자리 다 이미 서 있던 Figma 칸을 **처음 알아본** 것이고,
// 그 판정의 근거는 원장의 두 `reason` 이 갖는다.
// 2026-09-06: 179 → 176. 셋 다 **Figma 에 세웠다** — `CanvasConnectHint` 는 Toast 의
// `Layout=callout`, `CanvasFirstNodeHint` 는 Tooltip 의 `Layout=coachmark`,
// `LanguageSelector` 는 새 `MenuTrigger` 다. 판단 대기로 미룬 것도, 범위 밖으로 옮긴 것도 없다.
// 2026-09-10: 176 → 175. **Figma 에 세운 것이 아니라 제품에서 사라졌다** —
// `videoEditParts/inspectorPrimitives.tsx#InspectorPill` 이 앵커를 5a67d692 에서 옮기는
// 사이에 없어졌다(앵커 재고정 e3242aa 가 그 사실을 먼저 적었다). 세 갈래 중 어느 것도
// 아니므로 네 번째를 적는다: **소비처가 없어졌다.** 그 자리가 돌아오면 이 수도 돌아와야 한다.
// 2026-09-11: 175 → 202. **27칸이 늘어져 있었다.** 원장의 needed 는 175 → 197(`be3c422`)
// → 202(`7f41d5a`, 앵커 38a7d5a4) 로 올랐는데 이 기준선은 175 에 멈춰 있었다. 상승은
// 발견이라 에러가 안 나지만, 그만큼 **하락 그물이 헐거워진다** — 202 에서 176 까지 조용히
// 되돌아가도 이 검사는 아무 말도 하지 않았고, 그래서 `coverage targets needed fell without
// locking` 카나리아가 물지 못했다(checker 가 주입을 통과시켰다). 상승도 그때그때 잠근다.
// 2026-09-26: 202 → **163.** 서른아홉이 두 곳으로 갔다 — **Figma 에 세웠다 29**(제품 세트가 셋째 대응 어휘가 됐다,
// DS-D-0071: 글리프 생성기 세트 넷의 인라인 글리프 27 · `Product/Footer` · `Product/Pricing Notice`), **범위 밖으로 옮겼다 10**
// (그릴 것이 없다 — 앵커 2c6bdacf 에서 참조 0 인 죽은 수출 아홉(`node-canvas/primitives.tsx` 의 Eyebrow 아이콘 일곱 ·
// `ToolIcon` · `SelectionChrome`)과 마크업 0 인 서버 껍데기 `mypage/upgrade/page.tsx#UpgradePlanPage` — 화면은
// `UpgradePlanPageClient` 가 그리므로 같은 화면을 두 칸으로 세던 결함이었다). 원장 커밋 21947b0 · b9c0b35.
// 2026-10-07: 163 → 159 — **Figma 에 세웠다 4**: PageHeader · AdminSectionHeader · CustomDropdown · PlanComparisonTable 이 보드 생성기
// PARTS 의 제품 세트(Product/Page Header · Admin Section Header · Select Dropdown · Plan Comparison Table)가 됐다(Updates (199)).
// 2026-10-08 밤: 159 → **172.** 앵커 76b6cf15 · 54b62a8a 두 이동의 발견을 함께 조인다(아침 이동은 이 수를 옮기지 않았다) — 지금 원장
// (54b62a8a)의 needed 172(부품 60 · 화면 93 · 한자리 18 · 판단 대기 1). 저녁 판정 59종 중 needed 는 하이라이트 스튜디오 판 · 트랙,
// 앰배서더 화면 · 지원서, 덱 화면군 · 머리 막대 등이다.
// 2026-10-13: 172 → 149 — DS-D-0084 승격 조사가 「이미 LOUIS 에 있다」로 가른 23 을 LOUIS 대응(figma)으로 옮겼다
// (check-figma-surface-coverage 의 MAPPED_BASELINE 주석). Figma 에 새로 세운 것이 아니라 대응을 바로잡은 몫이다.
// 2026-10-14: 149 → 121 — DS-D-0084 의 새 부품(DS-D-0086 ~ 0097 과 작은 부품 아홉 · 변형)이 Figma 세트로 서며 그 출처 28 을 대응(figma)으로
// 옮겼다(check-figma-surface-coverage 의 MAPPED_BASELINE 주석). 이번 것은 Figma 에 새로 세운 몫이다.
// 같은 날 뒤: 121 → 116 — 기존 부품 변형의 출처 다섯(check-figma-surface-coverage 의 MAPPED_BASELINE 주석).
// 같은 날 뒤: 116 → 113 — DS-D-0098 로 닫은 첫 화면 셋.
// 같은 날 뒤: 113 → 112 — PricingSection 화면.
// 같은 날 뒤: 112 → 107 — 노드캔버스 노드 카드 다섯이 제품 세트가 됐다(check-figma-surface-coverage 의 MAPPED_PRODUCT_BASELINE 주석).
// 같은 날 뒤: 107 → 105 — 홈 · 하이라이트 스튜디오 판 화면.
// 같은 날 뒤: 105 → 102 — 단체 구매 실패 · 편집기 작업 화면 · 캔버스 스테이지 프레임.
// 2026-10-15: 102 → 95 — 캔버스 · 편집기 표면 여섯 대응 + ActionButton 범위 밖(죽은 코드, DS-D-0106).
// 같은 날 뒤: 95 → 94 — DeletableEdge.
// 같은 날 뒤: 94 → 92 — 모델 상세 화면 · 버전 행.
const NEEDED_BASELINE = 92; // 하락만 잠근다(상승은 발견) — 오르면 그 자리에서 다시 조인다
// 9 → 47 → 5. 47 로 올렸던 것은 미룬 것을 받아들여서가 아니라 래칫이 물게 하려는 것이었다
// (재고정으로 드러난 38개가 판단 대기로 들어왔다). 2026-09-03 에 그 47 을 네 도메인이
// 나눠 판정해 43 이 내려갔고 — figma 6 · scoped 15 · needed 22 — 5 만 남았다.
// **내리는 방향은 이득 잠금이므로 필수다.** 남은 5 는 소유자 판정 대기다: 고정 다크 스코프를
// 분모에 남길 것인가(CreativeMediaClient) 한 건과, 이번 배정에서 어느 도메인에도 걸리지
// 않아 아무도 열어 보지 않은 네 자리(HomePageClient#LandingContent ·
// nodeToolbarGlyphs#ToolbarIconVideoFrame · node-canvas/primitives#SelectionChrome ·
// PhotoGrid#ImageStrip). 방향과 목표는 그대로다(↓ · 0).
// 2026-10-09: 1 → 2 — 새 앵커 54b62a8a 재판정(ed650b2b)에서 판단 대기 하나가 더 들어왔다. 기준선이 지금 수와 같아야 하락 canary 가 문다
// (verify-gates 「coverage targets unclear fell without locking」).
// 2026-10-15: 2 → 0 — HandleTile(DS-D-0108) · CreativeMediaClient(DS-D-0109)를 결정문의 초안 기본값으로 닫았다. 소유자 확인 대기 —
// 뒤집히면 이 수를 되돌린다.
const UNCLEAR_BASELINE = 0; // 하락만 잠근다(소유자만 줄일 수 있다)
// 210 → 225. 표면 총수는 434 그대로이므로 이 상승은 천장이 허락한 것이 아니라 **판정이
// 만든 것이다** — unclear 15 건이 「그릴 것이 없다」로 내려갔다(부모의 조각 · 순수 배치
// 래퍼 · defs · 사용자 콘텐츠 슬롯). 그 15 건은 needed 에서 옮겨 온 것이 아니라 판단 대기에서
// 온 것이라, `needed` 를 범위 밖으로 밀어 진척을 꾸미는 canary ② 의 경로와 다르다.
// 225 → 227. 총수가 그대로인데 오른 것이므로 **판정이 만든 이동**이다. 둘 다 판단 대기에서
// 왔고 이미 내려진 결정을 적용한 것이지 새로 고른 것이 아니다 —
//   nodeToolbarGlyphs#ToolbarIconVideoFrame : 인라인 SVG 글리프라 아이콘 축(DS-D-0038).
//     이 원장에 같은 사유의 scoped 가 이미 77건 있다.
//   PhotoGrid#ImageStrip : 부모 PhotoSection(needed)과 자식 구성이 같고 배치만 다르다(DS-D-0040).
// 셋째 SelectionChrome 은 반대 방향으로 갔다(unclear → needed) — 그룹 형태가 어느 노드에도
// 속하지 않아 부모의 상태 축으로는 놓을 자리가 없기 때문이고, 그래서 NEEDED_BASELINE 이 +1 이다.
// 2026-09-10: 227 → 239. **총수가 아니라 판정이 움직였다** — 사유 없던 표면 35 를 판정하며
// 열둘이 범위 밖으로 갔다. 전부 `mobileActionGlyphs.tsx` 의 인라인 글리프이고, 사유는 한 형태다:
// path 좌표를 펴서 DS·Icons 42종과 대조했더니 같은 그림이 이미 있다(GlyphAudio↔music-notes-simple ·
// GlyphBack↔caret-left · GlyphDuplicate↔copy · GlyphImage↔image · GlyphDelete↔trash-simple ·
// GlyphHide↔eye-slash · GlyphPlus↔plus · GlyphText↔text 등). 아이콘 축에 정본이 서 있으므로
// 컴포넌트 축에 또 세울 일이 아니다 — ChevronGlyph·CloseGlyph 판례와 같은 자리다.
// 나머지 스물둘은 needed 로 갔고(사전에 없는 그림 열다섯 · 화면 넷 · 한자리 하나 · 부품 둘),
// 하나는 figma(AdminSelect → SelectTrigger)다.
// 2026-09-11: 239 → 238. **분모가 넓어진 것이 아니라 표면 하나가 사라졌다** — 게이트 메시지가
// 추측하는 사유와 다르므로 그대로 베끼지 마라. 빠진 것은
// `apps/web/components/navigation/Gnb.tsx#NavPlusGlyph`(scoped) 하나이고, 제품 `658ece13`
// 「사이드바에서 + 버튼을 걷고 베타 딱지를 라벨 옆으로 옮긴다」가 그 컴포넌트를 삭제했다.
// 같은 회차에 needed 다섯이 새로 섰다 — `CropModal#ImageEditModal` ·
// `imageEditParts/ExampleGallery` · `StickerCanvas` · `StickerPalette` · `ui/SegmentedThumb`
// (앵커 사이 이미지 편집·스티커 기능). 수가 정확히 맞는다: total 468 + 5 - 1 = 472 ·
// needed 197 + 5 = 202 · scoped 239 - 1 = 238.
// **원장은 `7f41d5a`(앵커 38a7d5a4 이동)가 이미 갱신했고 이 기준선만 안 따라왔다** —
// 그래서 이 게이트는 그 커밋 이후로 계속 빨갰다.
// 2026-09-26: 238 → 248 — 위 NEEDED_BASELINE 문단의 「범위 밖으로 옮겼다 10」이다(표면 총수 472 그대로). 열 칸 모두 사유에
// 앵커 grep 근거를 적었고, 제품이 그 수출을 다시 쓰면 needed 로 되돌린다.
// 2026-10-08 밤: 248 → **324** — 표면 총수 기준점을 612 로 옮기며(아래) 지금 scoped 로 맞춘다. 두 앵커 이동(76b6cf15 · 54b62a8a)의
// 새 표면 판정(라우트 진입점 · 레이아웃 · 부모에 딸린 조각 · 시각 없는 호스트)이 쌓인 수다.
// 2026-10-15: 324 → 325 — 캔버스 원형 FAB(ActionButton)는 앵커에서 import · JSX 렌더 지점이 0 인 죽은 코드라 범위 밖으로 옮겼다(DS-D-0106).
const SCOPED_BASELINE = 325; // 표면 총수가 오른 만큼만 오를 수 있다
// 2026-09-10: 434 → 468. 앵커가 5a67d692 → f19cc41c 로 옮기며 제품 표면이 34종 늘었다
// (쿠폰·선물하기 화면 등). **기준점을 옮기지 않으면 그만큼 범위 밖 허용치가 벌어진 채로
// 남아 그물이 무뎌진다** — 실제로 `needed reclassified as out of scope` 카나리아가 그래서
// 물지 못했다. 범위 밖은 227 그대로이므로 허용치를 지금 총수에 다시 맞춘다.
// 2026-09-11: 468 → 472. **위 주석이 예고한 일이 그대로 재발했다.** 앵커가
// f19cc41c → 38a7d5a4 로 옮기며 표면 총수가 468 → 472 로 올랐는데(신규 5 · 소멸 1) 기준점이
// 안 따라와, `allowedScoped = 238 + (472 - 468) = 242` 로 **범위 밖 허용치에 4칸이 벌어졌다.**
// 실제 scoped 는 238 이므로 카나리아가 표면 하나를 needed → scoped 로 옮겨도 239 ≤ 242 여서
// 통과했다 — `needed reclassified as out of scope` 가 또 물지 못한 이유다.
// **앵커를 옮길 때는 이 기준점도 같은 커밋에서 옮긴다.** 두 회차 연속 잊었다.
// 2026-10-08 밤: 472 → **612.** 앵커가 a4125565 → 76b6cf15 → 54b62a8a 로 옮기며 표면이 555 → 612 로 늘었는데 기준점이 472 에 머물러
// 범위 밖 허용치가 140칸 벌어져 있었다(위 주석이 두 번 경고한 그 재발). 이번 이동의 신규 62 · 소멸 5.
const SURFACE_TOTAL_BASELINE = 612; // 위 천장의 기준점
// 17 → 18 (2026-09-06): `alert` 가 partial 에서 done 으로 올라갔다. 레이아웃 축(block·inline·
// banner)을 열며 계약에 `alert` 칸을 처음 세우고 geometry 를 붙였고,
// packages/react/test/alert.browser.test.tsx 가 코드 쪽을 되재므로 DS-D-0035 의 (a)(b)(c) 가
// 전부 선다 — verify-figma-done 이 「조건은 서는데 partial 로 남은 항목: alert」로 먼저 지목했다.
// 24 → 23 (2026-09-14): `progress` 가 done 에서 partial 로 내려갔다. **Figma 에 세운 것도, 판단
// 대기로 미룬 것도 아니다 — Figma 가 기록을 못 따라온 것이다.** 제품 앵커 6f6282c1 에서 프로필
// 버튼이 36 → 32 로 줄어 `progress-ring.sizes.base` 가 size 32 · contentSize 24 로 옮겨졌는데,
// 라이브 ProgressRing 마스터는 Track 36 · Content 28 그대로라 verify-figma-parity 가 여섯 축에서
// 실패한다. Figma 쓰기는 소유자 승인 단계라 앵커 이동 안에서 하지 않았다. 마스터를 옮기고
// 되읽기를 다시 떠 parity 가 초록이 되면 progress 를 done 으로 되올리고 이 바닥도 24 로 되올린다.
// 2026-09-26: 23 → 24 — DropZone 신설(Figma 세트 · 되읽기 · 계약 · 되재기 테스트, DS-D-0035).
// 2026-10-14: 24 → 42 — DS-D-0084 로 선 새 부품 열여덟(작은 것 일곱 · 큰 것 열하나)이 세트 · 계약 · 실측 · 되재기를 다 갖춰 done(Updates (264)).
// 같은 날 뒤: 42 → 49 — 되재기 시험이 없어 partial 이던 일곱(banner-carousel · start-card · record-card · text-link · bare-button ·
// inspector-row · inspector-section-head)에 실브라우저 되재기를 붙였다(Updates (269)). banner-carousel 은 그 시험이 찾은 border-box 결손을 고쳤다.
// 같은 날 뒤: 49 → 57 — 계약 범위를 넓히거나(progress bipolar · media-slot fill · color-swatch Hover · Active) 기하 계약을 새로 세운(switch · keycap ·
// node-chip · pane-divider · loading-word) 여덟(Updates (270)).
// 같은 날 뒤: 57 → 67 — tabs · table · video-player · timeline · coverflow · node-shell · floating-shell · app-shell-parts 와, 소유자가 「코드가 정본」으로
// 판정해 Figma xs 칸을 코드에 맞춘 segmented-control · segmented-control-item(Updates (271)).
// 같은 날 뒤: 67 → 72 — LOUIS 에 잴 코드가 없던 다섯(breadcrumb · form-message · carousel-arrow · gnb-menu-item · inline-loading-label)에 CSS 레시피 ·
// 기하 계약 · 되재기를 세웠다(Updates (273)).
// 같은 날 뒤: 72 → 74 — news-card · segmented-code-input 에 CSS 레시피 · 되재기(Updates (274)).
// 2026-10-15: 74 → 77 — 새 부품 canvas-dots · gallery-panel · drill-picker 가 되재기와 함께 섰다(DS-D-0102 · 0104 · 0105).
// 같은 날 뒤: 77 → 82 — 남은 partial 다섯을 닫았다. node-chrome-button(호버 틴트 모드 쌍 시맨틱 셋) · node-side-handle(Channel 6 × State
// Default · Disabled) · step-tile · media-card(CSS 레시피 · 되재기, DS-D-0099) · canvas-edge(레시피 · 삭제 버튼 CanvasEdgeDelete, DS-D-0100 —
// DS-D-0061 재판정). 컴포넌트 82 가 전부 done 이다(Updates (276)).
// 같은 날 뒤: 82 → 84 — 새 부품 table-drawer · node-handle-tile 이 되재기와 함께 섰다(DS-D-0107 · 0108, Updates (277)).
const MANIFEST_DONE_FLOOR = 84; // 바닥. 오르면 올려 이득을 잠근다
// 2026-09-10: 74 → 73. 제품이 무는 LOUIS 이름이 176 → 213 으로 늘며(40c4e427 의 핀 상향으로
// alert·danger·accent-secondary 계열을 물기 시작했다) 죽어 있던 이름 하나가 살아났다.
// 이득 방향이라 잠근다.
// 2026-10-08: 72 → 71. 직전 HEAD(974ea48c)의 실측은 73 이었다 — 2026-10-07 에 세운 `color-canvas-chip-surface` ·
// `-hover` 둘이 소비자 없이 들어와 기준선보다 하나 많은 채 빨갰다. DS-D-0082 로 `node-chip.css` 가 캔버스 범위에서
// 그 둘을 처음 물어 71 이 됐다. 같은 회차에 세운 `canvas-menu-surface` · `node-card-stroke` 는 레시피가 바로 읽어
// 죽은 채로 들어오지 않았다. 이득 방향이라 잠근다.
// 2026-10-12: 71 → 61. DS-D-0083 — `node-side-handle` 이 audio · youtube · instagram 채널을 물면서 그 채널의
// 손잡이 면 · 글리프 · 비활성 시맨틱이 처음 소비자를 얻었다. 같은 회차에 세운 사진 위 배지 · 띠 잉크 · 제목 칩 ·
// 입력판 면 토큰은 레시피가 바로 읽어 죽은 채로 들어오지 않았다. 이득 방향이라 잠근다.
// 2026-10-13: 59 → 58. DS-D-0084 작은 새 부품 — `color-swatch` 의 칩 경계가 `color-stroke-strong` 을 LOUIS CSS 에서 처음 문다
// (제품 `stroke-control` 은 흰 값 · 검정 값 칩의 경계가 3:1 미만이라 고쳐 올렸다). 같은 회차에 세운 시맨틱 셋(`asset-tile-well` ·
// `notice-pill-dot` · `canvas-guide`)은 레시피가 바로 읽어 죽은 채로 들어오지 않았다. 이득 방향이라 잠근다.
// 2026-10-14 밤: 58 → 57. DS-D-0099 · DS-D-0100 — 새 시맨틱(노드 크롬 호버 셋 · landing-text-strong · canvas-edge 여덟)을 레시피가
// 바로 읽으며 그동안 아무 저작 CSS 도 풀지 않던 원시 하나가 별칭 사슬로 살아났다. 새 원시 셋(red-600-alpha 56 · 80 · 88)은 시맨틱이
// 바로 물어 죽은 채로 들어오지 않았다. 이득 방향이라 잠근다.
const DEAD_TOKEN_BASELINE = 57; // 양방향, 목표 0. 단위는 **원천 토큰**이다 — DS-D-0047
// 95 → 94 (stat-tile · chart-card 가 서면서). 이득 방향이라 잠근다.
// 2026-09-21: 73 → 72. Document 패턴(DS-D-0067)의 바닥이 화면 가장자리와 시트 사이를
// `layout-app-shell-outer-gap` 으로 띄우면서 LOUIS CSS 가 그 토큰을 처음 문다. 이득 방향이라 잠근다.

// ── 앵커가 못 보는 소비자 ─────────────────────────────────────────────────
// **낡은 앵커 때문에 죽어 «보이는» 토큰.** 원장(`migration/louis-token-usage.json`)은 제품
// 워킹트리가 아니라 **앵커에서** 읽는다(measure-louis-token-usage 머리말: 「워킹트리에서
// 읽으면 같은 명령이 어제와 다른 값을 낸다」). 그래서 앵커 이후에 제품이 새로 쓰기 시작한
// 이름은 원장에 없고, 이 게이트에는 **마지막 소비자를 지운 것과 똑같이 보인다.**
//
// 두 경우를 수 하나로는 가를 수 없으므로 **이름과 근거로 가른다.** 여기 적히는 것은
// 「지금 제품이 실제로 `var()` 로 푸는데 앵커가 그 커밋보다 이르다」뿐이고, 근거는 제품
// 파일 경로다. 근거가 틀리면 다음 사람이 그 경로를 열어 바로 반증할 수 있다 —
// DEAD_TOKEN_BASELINE 을 98 → 99 로 올리는 것과 다른 점이 정확히 그것이다. 수를 올리면
// 무엇이 늘었는지가 영원히 사라지고, 그 자리에 진짜 죽은 토큰이 들어와도 조용하다.
//
// **verify-product-anchor 의 `KNOWN_STALE` 과 같은 성격이다** — 영구 면제가 아니라
// 재고정으로 0 이 되어야 하는 한시적 부채이고, 한 방향 래칫이다(늘면 실패, 줄면 내리라고
// 요구한다). 목표는 이 표가 비는 것이며, 비는 길은 하나다 — 제품 앵커 재고정.
// **비어 있는 것이 맞다(2026-09-03).** 여기에는 `color-bg-raised` 한 줄이 앉아 있었다 —
// 제품이 여섯 자리에서 실제로 그것을 푸는데 원장이 `ae8fd627` 에서 읽혀 죽은 것처럼 보였다.
// 앵커를 `5a67d692` 로 옮기자 그 소비처가 보였고, 위 anchorBlindStale 검사가 「이제 죽어
// 보이지 않는다」로 그 줄을 지우라고 요구했다. 낙후를 면제로 적어 두면 그 면제는 낙후가
// 사라진 뒤에도 남아 다음 것을 조용히 통과시킨다 — 그래서 비운다.
//
// 다시 채워야 한다면 그것은 앵커가 또 낡았다는 뜻이고, 답은 여기 한 줄을 더하는 것이 아니라
// `pnpm run build-product-evidence` 로 앵커를 옮기는 것이다.
const ANCHOR_BLIND_TOKENS = new Map([]);
const ANCHOR_BLIND_RATCHET = 0;


// 이 게이트가 «빌려 쓰는» 수의 임자들. 하나라도 verify:ci 사슬에서 빠지면 여기 인쇄되는
// 수가 아무에게도 잠기지 않은 채 대시보드에만 남는다 — 그것이 가장 조용한 실패다.
const OWNING_GATES = [
  ["check-figma-surface-coverage", "표면 대응·사유없음·표면 총수"],
  ["check-figma-board-composition", "보드 인스턴스·대체가능·bespoke·후보 수"],
  ["verify-figma-done", "manifest figma:done 의 (a)(b)(c)"],
];

const errors = [];

// ── 0. 빌린 수의 임자가 실제로 도는가 ─────────────────────────────────────
const scripts = readJson("package.json").scripts;
const expand = (name, seen = new Set()) => {
  if (seen.has(name) || scripts[name] === undefined) return [];
  seen.add(name);
  const refs = [...scripts[name].matchAll(/pnpm run ([\w:-]+)/g)].map((m) => m[1]);
  return refs.length === 0 ? [name] : refs.flatMap((r) => expand(r, seen));
};
const ciSteps = new Set(expand("verify:ci"));
for (const [gate, owns] of OWNING_GATES) {
  if (!ciSteps.has(gate)) {
    errors.push(
      "이 게이트가 인쇄하는 수의 임자 `" + gate + "`(" + owns + ")가 verify:ci 사슬에 " +
        "없습니다. 임자가 빠지면 아래 표는 아무도 잠그지 않는 수를 보여 주는 장식이 됩니다.",
    );
  }
}

// ── 1. 세 원장이 같은 앵커를 보는가 ───────────────────────────────────────
// 각 게이트는 자기 원장만 본다 — 원장들이 **서로 다른 제품 커밋**을 재고 있어도 전부 초록이다.
// 한 표에 나란히 찍는 순간 그것이 결함이 되므로 여기서 잠근다.
//
// **기준은 원장끼리의 합의가 아니라 lock 이다.** 그전까지 이 절은 `anchors[0]`(표면 원장)을
// 기준으로 나머지를 재고 있었는데, 그러면 셋이 **똑같이 낡아도** 초록이다 — 정본이 무엇인지를
// 표 안에서만 정했기 때문이다. 정본 앵커는 `migration/product-evidence.lock.json` 하나이고
// (scripts/lib/product-anchor.mjs 머리말), 그것을 읽어 재면 「셋이 사이좋게 과거를 잰다」가
// 실패가 된다.
//
// ── 재고정이 갈라 놓은 축 ─────────────────────────────────────────────────
// 2026-09-03 재고정에서 앵커를 `ae8fd627` → `5a67d692` 로 옮겼고 **전부가 따라오지는 못했다.**
// 갈린 기준은 취향이 아니라 **측정 방법**이다.
//   · git 트리만 읽는 원장(표면·토큰 사용·alpha·drift·nav-labels·render)은 제품 저장소만
//     있으면 다시 뜬다. 전부 옮겼다.
//   · 보드 축은 `figma/app-screens.plan.json` 을 읽고, 그 계획은 `product.auth-fixture.json`
//     이 서야 만들어진다 — clean 클론 + standalone 빌드 + Playwright 다. 그 fixture 는
//     `KLIPSE_PRODUCT_FIXTURE_ROOT` 의 clean 클론에 `ae8fd627` 로 고정돼 있고, 세우는 것은 별건이다.
// 그래서 「전부 같아야 한다」를 「**갈린 것은 이름과 커밋으로 선언돼 있어야 한다**」로 바꾼다.
// 선언은 줄어들기만 하는 래칫이고(늘리는 것은 소유자 판정), 낙후는 아래 표에 함께 인쇄된다 —
// 초록이 「원장들이 같은 제품을 잰다」로 읽히면 안 되기 때문이다.
// **2026-09-05: 그 선언이 비었다.** 보드 축을 막고 있던 두 벽이 차례로 열렸다 —
// `product.auth-fixture.json` 은 하네스 결함(두 패스 사이 DOM 이 갈리던 캡처)을 고쳐 5a67d692
// 에서 다시 섰고, `product.rendered-components.json` 은 기다리던 DS 대조 판정을 끝내고 같은
// 앵커로 다시 떴다. 두 원장의 커밋이 같아지자 `build-figma-app-screens.mjs:51` 이 계획을 냈고
// 보드 원장도 5a67d692 를 잰다. 목록이 비었으므로 래칫도 0 으로 내린다 — 1 로 두면 다음 낙후가
// 사유 없이 한 칸 들어올 자리가 남는다.
const DECLARED_LAGGING_LEDGERS = new Map([]);
const LAGGING_RATCHET = 0;

const surfaces = readJson(SURFACES);
const board = readJson(BOARD);
const tokenUsage = readJson(TOKEN_USAGE);
const anchor = readAnchor().commit;
const anchors = [
  [SURFACES, surfaces.productCommit],
  [BOARD, board.productCommit],
  [TOKEN_USAGE, tokenUsage.productCommit],
];
const lagging = [];
for (const [where, commit] of anchors) {
  const declared = DECLARED_LAGGING_LEDGERS.get(where);
  if (commit === anchor) {
    // 선언이 남아 있는데 실제로는 따라왔다 → 죽은 선언이다. 지우게 만든다.
    if (declared) {
      errors.push(
        where + " 는 이제 정본 앵커 " + anchor.slice(0, 8) + " 를 잽니다. " +
          "DECLARED_LAGGING_LEDGERS 의 그 줄을 지우세요 — 죽은 선언은 다음 낙후를 조용히 " +
          "통과시킵니다.",
      );
    }
    continue;
  }
  if (declared && declared.commit === commit) {
    lagging.push([where, commit, declared.reason]);
    continue;
  }
  errors.push(
    where + " 의 productCommit(" + String(commit).slice(0, 8) + ")이 정본 앵커 " +
      anchor.slice(0, 8) + "(migration/product-evidence.lock.json)와 다릅니다" +
      (declared ? " — 선언된 값은 " + declared.commit.slice(0, 8) + " 입니다" : "") +
      ". 서로 다른 앵커의 수를 한 표에 나란히 찍으면 그 표는 어느 제품도 설명하지 않습니다. " +
      "다시 뜨거나, 뜰 수 없는 이유를 DECLARED_LAGGING_LEDGERS 에 커밋과 함께 적으세요.",
  );
}
if (DECLARED_LAGGING_LEDGERS.size > LAGGING_RATCHET) {
  errors.push(
    "낙후로 선언된 원장이 " + LAGGING_RATCHET + "개에서 " + DECLARED_LAGGING_LEDGERS.size +
      "개로 늘었습니다. 이 목록은 줄어들기만 합니다.",
  );
}

// ── 2. 죽은 토큰 ──────────────────────────────────────────────────────────
// **원장은 제품 쪽 절반만 나른다.** LOUIS 쪽은 CI 에서 볼 수 있으므로 매번 다시 계산한다.
const tokensCss = read(TOKENS_CSS);
const declared = new Map();
for (const m of tokensCss.matchAll(/^\s*(--louis-[a-z0-9-]+)\s*:\s*([^;]*);/gm)) {
  declared.set(m[1], m[2]);
}
if (declared.size === 0) {
  errors.push(TOKENS_CSS + " 에서 토큰 선언을 하나도 읽지 못했습니다. 셀 것이 없으면 통과가 아닙니다.");
}

const walk = (dir, out = []) => {
  for (const entry of readdirSync(resolve(repoRoot, dir))) {
    const rel = join(dir, entry);
    if (statSync(resolve(repoRoot, rel)).isDirectory()) walk(rel, out);
    else if (/\.(css|ts|tsx)$/.test(rel)) out.push(rel);
  }
  return out;
};
const authored = AUTHORED_CSS.flatMap((dir) => walk(dir)).map((f) => read(f)).join("\n");
const louisRefs = new Set();
for (const m of authored.matchAll(/var\(\s*(--louis-[a-z0-9-]+)/g)) louisRefs.add(m[1]);
// 컴포넌트가 자기 안에서 세우는 손잡이. 토큰 패키지의 이름이 아니므로 선언 사전과 가른다 —
// 제품이 `var()` 로 무는 이름이 둘 중 어디에도 없으면 그것은 **끊어진 참조**다.
const localKnobs = new Set();
for (const m of authored.replace(/var\(\s*--louis-[a-z0-9-]+/g, "").matchAll(/(--louis-[a-z0-9-]+)\s*:/g)) {
  localKnobs.add(m[1]);
}
if (louisRefs.size === 0) {
  errors.push(AUTHORED_CSS.join("·") + " 에서 `var(--louis-*)` 를 하나도 읽지 못했습니다.");
}

const productRefs = new Set(tokenUsage.productRefs ?? []);
if (productRefs.size === 0) {
  errors.push(TOKEN_USAGE + " 에 제품 참조가 하나도 없습니다. `pnpm run measure-louis-token-usage` 로 다시 뽑으세요.");
}

// 별칭 사슬을 따라간다. `A: var(B)` 에서 A 가 살아 있으면 B 도 산다. 이것이 없으면
// 「지워도 된다」가 거짓이 되어, 그 말을 믿고 지운 사람이 살아 있는 값을 부순다.
const live = new Set();
const stack = [...louisRefs, ...productRefs].filter((name) => declared.has(name));
while (stack.length > 0) {
  const name = stack.pop();
  if (live.has(name)) continue;
  live.add(name);
  for (const m of (declared.get(name) ?? "").matchAll(/var\(\s*(--louis-[a-z0-9-]+)/g)) {
    if (declared.has(m[1]) && !live.has(m[1])) stack.push(m[1]);
  }
}
const dead = [...declared.keys()].filter((name) => !live.has(name));
const dangling = [...productRefs].filter((name) => !declared.has(name) && !localKnobs.has(name));

// ── 단위와 분모 (DS-D-0047) ───────────────────────────────────────────────
// 위의 `dead` 는 **CSS 선언 이름**을 센다. 그 수는 지워서 0 이 될 수 없다 — 한 원천 토큰이
// 여러 이름을 발행하고, 그중 하나만 안 풀리는 경우가 실제로 대부분이기 때문이다. 그래서
// 이름을 원천 `id` 로 되짚어 **토큰**을 세고, 지워서 0 이 될 수 없는 셋을 분모에서 뺀다.
// 뺀 것과 남긴 것을 **둘 다 인쇄**하는 것이 이 좁히기가 화장이 아니라는 유일한 증거다.
const tierById = new Map();
{
  const visit = (node) => {
    if (node === null || typeof node !== "object" || Array.isArray(node)) return;
    const ext = node.$extensions?.["com.klipse-design"];
    if (ext?.id) tierById.set(ext.id, ext.tier);
    for (const [key, value] of Object.entries(node)) if (!key.startsWith("$")) visit(value);
  };
  visit(readJson(TOKEN_SOURCE));
}
if (tierById.size === 0) {
  errors.push(TOKEN_SOURCE + " 에서 토큰 id 를 하나도 읽지 못했습니다. 되짚을 사전이 없으면 " +
    "아래 분류는 전부 「원천에 없음」이 되어 수가 거짓으로 «올라갑니다».");
}
// 가장 긴 id 부터 맞춘다 — `color-gray-000` 과 `color-gray-000-alpha-04` 가 둘 다 id 다.
const idsByLength = [...tierById.keys()].sort((a, z) => z.length - a.length);
const idOfName = (cssName) => {
  const base = cssName.replace(/^--louis-/, "");
  for (const id of idsByLength) if (base === id || base.startsWith(id + "-")) return id;
  return null; // 원천에 없는 이름. 손으로 넣었거나 생성기가 새는 것이므로 **분모에 넣는다.**
};
// id → 그 id 가 발행한 선언 이름 전부. 전부 죽어야 그 토큰이 죽은 것이다.
const emittedById = new Map();
for (const name of declared.keys()) {
  const id = idOfName(name);
  if (id === null) continue;
  const bucket = emittedById.get(id) ?? [];
  bucket.push(name);
  emittedById.set(id, bucket);
}
const deadSet = new Set(dead);
// 분모에서 빠지는 셋. **규칙이지 목록이 아니다** — 규칙이라야 다음에 늘어난 것이 조용히
// 빠지지 않는다.
//  ① 사다리의 빈 칸(프리미티브 팔레트 + semantic 적응형 회색 램프 + 타이포 스케일):
//     사다리는 완결된 것이 값이다. 쓰는 칸만 남기면 다음에 그 칸이 필요할 때 이름·값이
//     예전과 같다는 보장이 없다(소유자 판정).
//  ② Figma 전용 축: `type-line-height-percent/*` 는 DS-D-0029 §1 이 **일부러** 만들었고
//     CSS 소비 0 이 설계된 상태다. `var()` 만 보는 정의가 구조적으로 잘못 세는 자리다.
const isLadderRung = (id, tier) =>
  tier === "primitive" || /^color-gray-\d/.test(id) || /^typography-/.test(id);
const isFigmaOnlyAxis = (id) => /^type-line-height-percent-/.test(id);
const deadTokens = []; // 지울 수 있고, 지워야 하는 것
const excluded = { emittedForm: [], ladderRung: [], figmaOnlyAxis: [], anchorBlind: [] };
for (const [id, names] of emittedById) {
  const deadNames = names.filter((name) => deadSet.has(name));
  if (deadNames.length === 0) continue;
  // 발행된 이름 일부만 안 풀린다 → **토큰은 살아 있다.** 그 이름만 지울 방법이 없다.
  if (deadNames.length < names.length) { excluded.emittedForm.push(id); continue; }
  if (isLadderRung(id, tierById.get(id))) { excluded.ladderRung.push(id); continue; }
  if (isFigmaOnlyAxis(id)) { excluded.figmaOnlyAxis.push(id); continue; }
  // 앵커가 못 보는 소비자. **분모에서 빼지 않는다** — 아래에서 따로 인쇄하고 래칫한다.
  if (ANCHOR_BLIND_TOKENS.has(id)) { excluded.anchorBlind.push(id); continue; }
  deadTokens.push(id);
}
// 표에 적힌 이름이 «실제로 죽어 보이지 않게» 되면 — 앵커를 재고정했거나 LOUIS 가 다시
// 쓰기 시작했거나 — 그 줄은 이제 거짓이다. 지우라고 요구한다. 면제가 조용히 남는 것이
// 이 저장소가 baseline 을 따로 두는 이유다.
const anchorBlindStale = [...ANCHOR_BLIND_TOKENS.keys()]
  .filter((id) => !excluded.anchorBlind.includes(id));
// 원천에 id 가 없는 죽은 이름은 토큰 하나로 친다 — 되짚을 근거가 없는 것을 조용히 빼면
// 생성기가 새기 시작해도 수가 그대로다.
const orphanDeadNames = dead.filter((name) => idOfName(name) === null);
const deadTokenCount = deadTokens.length + orphanDeadNames.length;

// 계열별 집계. 「무엇부터 지우는가」를 정하는 데 쓰는 유일한 실마리다. **분모에 남은 것만**
// 센다 — 사다리의 빈 칸을 여기 섞으면 그 표가 다음 사람을 사다리 깎기로 보낸다.
const familyTally = {};
for (const id of [...deadTokens, ...orphanDeadNames]) {
  const family = id.replace(/^--louis-/, "").split("-").slice(0, 3).join("-");
  familyTally[family] = (familyTally[family] ?? 0) + 1;
}
const deadFamilies = Object.entries(familyTally)
  .sort((a, z) => z[1] - a[1])
  .map(([family, count]) => family + "-* " + count)
  .join(" · ");
const TOKENS_USAGE_HINT = TOKEN_USAGE + " 에서 사라진 제품 참조";

// 대조군. `theme.css` 를 소비자로 셌을 때의 죽은 토큰 수를 **같은 코드로** 다시 낸다 —
// 정의를 느슨하게 풀면 수가 얼마나 좋아지는지를 인쇄하려는 것이지, 그 정의를 쓰려는 것이 아니다.
const themeRefs = new Set();
for (const m of read(THEME_CSS).matchAll(/var\(\s*(--louis-[a-z0-9-]+)/g)) {
  if (declared.has(m[1])) themeRefs.add(m[1]);
}
const liveIfThemeCounted = new Set();
const themeStack = [...louisRefs, ...productRefs, ...themeRefs].filter((name) => declared.has(name));
while (themeStack.length > 0) {
  const name = themeStack.pop();
  if (liveIfThemeCounted.has(name)) continue;
  liveIfThemeCounted.add(name);
  for (const m of (declared.get(name) ?? "").matchAll(/var\(\s*(--louis-[a-z0-9-]+)/g)) {
    if (declared.has(m[1]) && !liveIfThemeCounted.has(m[1])) themeStack.push(m[1]);
  }
}
const deadIfThemeCounted = declared.size - liveIfThemeCounted.size;

// ── 3. manifest ───────────────────────────────────────────────────────────
const manifest = readJson(MANIFEST);
const tally = (items) => {
  const out = {};
  for (const item of items) out[String(item.figma)] = (out[String(item.figma)] ?? 0) + 1;
  return out;
};
const componentFigma = tally(manifest.components);
const patternFigma = tally(manifest.patterns);
const done = componentFigma.done ?? 0;
const partial = componentFigma.partial ?? 0;
const notPlanned = componentFigma["not-planned"] ?? 0;
const doneTarget = manifest.components.length - notPlanned;

// ── 4. 수가 실제로 수인가 ─────────────────────────────────────────────────
// 원장의 키가 사라지면 `undefined` 가 조용히 흘러 「0 → 목표 0, 달성」으로 인쇄된다.
const surfaceCounts = surfaces.counts ?? {};
const boardCounts = board.counts ?? {};
const numbers = {
  "표면 total": surfaceCounts.total,
  "표면 mapped": surfaceCounts.mapped,
  "표면 scoped": surfaceCounts.scoped,
  "표면 needed": surfaceCounts.needed,
  "표면 unclear": surfaceCounts.unclear,
  "보드 instance": boardCounts.instance,
  "보드 replaceable": boardCounts.replaceable,
  "보드 bespoke": boardCounts.bespoke,
  "보드 blocked": boardCounts.blocked,
  "보드 missing": boardCounts.missing,
};
for (const [what, value] of Object.entries(numbers)) {
  if (!Number.isFinite(value)) {
    errors.push(
      what + " 를 원장에서 수로 읽지 못했습니다(" + String(value) + "). 키가 사라지면 " +
        "이 표는 「0 → 목표 0, 달성」을 인쇄합니다.",
    );
  }
}

if (errors.length === 0) {
  // ── 래칫 (임자가 없던 넷) ───────────────────────────────────────────────
  const needed = surfaceCounts.needed;
  const unclear = surfaceCounts.unclear;
  const scoped = surfaceCounts.scoped;
  const total = surfaceCounts.total;

  if (needed < NEEDED_BASELINE) {
    errors.push(
      "세워야 할 표면이 " + (NEEDED_BASELINE - needed) + "개 줄었습니다 (" + NEEDED_BASELINE +
        " → " + needed + "). 이득을 잠그세요 — 이 파일의 NEEDED_BASELINE 을 " + needed +
        " 로 내리고, 그것이 어디로 갔는지 적으세요(Figma 에 세웠다 / 판단 대기로 미뤘다 / " +
        "범위 밖으로 옮겼다). 내리지 않으면 그 자리는 다음에 조용히 되돌아옵니다.",
    );
  }
  if (unclear < UNCLEAR_BASELINE) {
    errors.push(
      "판단 대기가 " + (UNCLEAR_BASELINE - unclear) + "개 줄었습니다 (" + UNCLEAR_BASELINE +
        " → " + unclear + "). 소유자만 줄일 수 있는 수이므로 반드시 잠급니다 — " +
        "UNCLEAR_BASELINE 을 " + unclear + " 로 내리세요.",
    );
  }
  // 범위 밖 바구니는 표면 총수가 늘어난 만큼만 커질 수 있다.
  const allowedScoped = SCOPED_BASELINE + Math.max(0, total - SURFACE_TOTAL_BASELINE);
  if (scoped > allowedScoped) {
    errors.push(
      "범위 밖(scoped)이 " + (scoped - allowedScoped) + "개 늘었습니다 (" + SCOPED_BASELINE +
        " → " + scoped + ", 표면 총수는 " + SURFACE_TOTAL_BASELINE + " → " + total + "). " +
        "총수가 늘어난 만큼을 넘는 증가는 새 표면이 아니라 **있던 것을 범위 밖으로 옮긴 것**입니다. " +
        "범위 밖은 이 원장에서 것들이 사라지는 자리이므로, 옮겼다면 SCOPED_BASELINE 을 " + scoped +
        " 로 올리고 무엇을 왜 옮겼는지 적으세요.",
    );
  } else if (scoped < SCOPED_BASELINE) {
    errors.push(
      "범위 밖이 " + (SCOPED_BASELINE - scoped) + "개 줄었습니다 (" + SCOPED_BASELINE + " → " +
        scoped + "). 분모가 넓어진 것이므로 SCOPED_BASELINE 을 " + scoped + " 로 내려 " +
        "그 상태를 새 기준으로 잠그세요.",
    );
  }

  if (done < MANIFEST_DONE_FLOOR) {
    errors.push(
      "manifest 의 figma:done 이 " + (MANIFEST_DONE_FLOOR - done) + "개 줄었습니다 (" +
        MANIFEST_DONE_FLOOR + " → " + done + "). done → partial 강등은 verify-figma-done 이 " +
        "보지 못합니다 — 그 게이트는 done 인 항목만 검사하므로, 강등하면 오히려 조용해집니다.",
    );
  } else if (done > MANIFEST_DONE_FLOOR) {
    errors.push(
      "manifest 의 figma:done 이 " + (done - MANIFEST_DONE_FLOOR) + "개 늘었습니다 (" +
        MANIFEST_DONE_FLOOR + " → " + done + "). MANIFEST_DONE_FLOOR 를 " + done +
        " 로 올려 이득을 잠그세요.",
    );
  }

  // 앵커가 못 보는 소비자 표의 래칫. **수가 아니라 이름으로 잠근다.**
  if (excluded.anchorBlind.length > ANCHOR_BLIND_RATCHET) {
    errors.push(
      "앵커가 못 보는 소비자가 " + (excluded.anchorBlind.length - ANCHOR_BLIND_RATCHET) +
        "개 늘었습니다 (" + ANCHOR_BLIND_RATCHET + " → " + excluded.anchorBlind.length +
        "). 이 표는 한 방향 래칫이라 늘지 않습니다 — 늘려야 한다고 판단했다면 그것은 " +
        "코드 변경이 아니라 소유자 판정입니다.",
    );
  } else if (excluded.anchorBlind.length < ANCHOR_BLIND_RATCHET) {
    errors.push(
      "앵커가 못 보는 소비자가 " + (ANCHOR_BLIND_RATCHET - excluded.anchorBlind.length) +
        "개 줄었습니다 (" + ANCHOR_BLIND_RATCHET + " → " + excluded.anchorBlind.length +
        "). 이득을 잠그세요 — ANCHOR_BLIND_RATCHET 을 " + excluded.anchorBlind.length +
        " 로 내리고, 더는 참이 아닌 줄을 ANCHOR_BLIND_TOKENS 에서 지웁니다.",
    );
  }
  if (anchorBlindStale.length > 0) {
    errors.push(
      "ANCHOR_BLIND_TOKENS 에 적힌 " + anchorBlindStale.join(" · ") + " 이(가) 이제 죽어 보이지 " +
        "않습니다. 앵커를 재고정했거나 LOUIS 가 다시 씁니다 — 어느 쪽이든 그 줄은 거짓이므로 " +
        "표에서 지우고 ANCHOR_BLIND_RATCHET 을 함께 내리세요.",
    );
  }

  if (deadTokenCount > DEAD_TOKEN_BASELINE) {
    // **어느 이름이 «새로» 죽었는지는 말하지 않는다.** baseline 이 수 하나라 그것을 알 수
    // 없고, 「새로 죽은 자리」라며 죽은 목록의 앞 몇 개를 찍으면 그것은 거짓말이다 —
    // 이 저장소가 낡은 수로 데었던 것과 같은 종류의 거짓이다. 대신 «어디를 보라»를 적는다.
    errors.push(
      "죽은 토큰이 " + (deadTokenCount - DEAD_TOKEN_BASELINE) + "개 늘었습니다 (" +
        DEAD_TOKEN_BASELINE + " → " + deadTokenCount + "). 아무도 쓰지 않는 이름을 새로 만들었거나 " +
        "마지막 소비자를 지웠습니다 — DS-D-0029(이름은 참이어야 한다).\n" +
        "      어느 이름인지는 이 게이트가 알지 못한다(baseline 이 수 하나다). " +
        "직전 커밋과 대조할 곳은 셋이다 — " + TOKEN_SOURCE + " 의 새 토큰 · " +
        AUTHORED_CSS.join("·") + " 에서 사라진 `var()` · " + TOKENS_USAGE_HINT + ".\n" +
        "      지금 죽어 있는 " + deadTokenCount + "개의 계열: " + deadFamilies,
    );
  } else if (deadTokenCount < DEAD_TOKEN_BASELINE) {
    errors.push(
      "죽은 토큰이 " + (DEAD_TOKEN_BASELINE - deadTokenCount) + "개 줄었습니다 (" +
        DEAD_TOKEN_BASELINE + " → " + deadTokenCount + "). 이득을 잠그세요 — " +
        "DEAD_TOKEN_BASELINE 을 " + deadTokenCount + " 로 내립니다.",
    );
  }

  if (dangling.length > 0) {
    errors.push(
      "제품이 `var()` 로 무는데 LOUIS 에 그 이름이 없습니다(끊어진 참조 " + dangling.length +
        "): " + dangling.slice(0, 5).join(", ") + ". 토큰 선언에도, 컴포넌트가 세우는 " +
        "손잡이에도 없는 이름은 브라우저에서 조용히 빈 값이 됩니다.",
    );
  }
}

if (errors.length > 0) {
  console.error("커버리지 목표 게이트 실패:");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

// ── 인쇄 ──────────────────────────────────────────────────────────────────
// **수를 산문에 박지 않는다.** 아래 모든 값은 방금 계산했거나 원장에서 읽은 것이고,
// 목표·방향만 이 파일이 소유한다.
const pct = (numerator, denominator) =>
  (denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0.0") + "%";
const surfaceTarget = surfaceCounts.total - surfaceCounts.scoped;
const boardTarget = boardCounts.instance + boardCounts.replaceable;
// **후보 전체.** 목표의 분모(인스턴스+대체가능)만 찍으면 대체가능이 0 이 되는 순간 표가
// 「100%, 달성」을 인쇄한다 — bespoke·미보유·막힘이 그대로 앉아 있는데도. 대조군을 나란히
// 찍는 것이 이 표가 거짓 초록이 되지 않는 유일한 방법이다(보드 게이트가 두 비율을 함께
// 인쇄하는 것과 같은 근거다).
const boardCandidates =
  boardCounts.instance + boardCounts.replaceable + boardCounts.bespoke
  + boardCounts.blocked + boardCounts.missing;

const rows = [
  ["표면 needed (세워야 할 것)", String(surfaceCounts.needed), "0", "↓ 하락만 잠금", "이 게이트"],
  ["표면 unclear (판단 대기)", String(surfaceCounts.unclear), "0", "↓ 하락만 잠금", "이 게이트"],
  ["표면 대응 (대상 대비)", pct(surfaceCounts.mapped, surfaceTarget) + " (" + surfaceCounts.mapped + "/" + surfaceTarget + ")", "100%", "↑ 양방향", "check-figma-surface-coverage"],
  ["표면 scoped (분모 밖)", String(surfaceCounts.scoped), "— 분모 밖", "총수만큼만 상승", "이 게이트"],
  ["보드 인스턴스 (지금 바꿀 수 있는 것 대비)", pct(boardCounts.instance, boardTarget) + " (" + boardCounts.instance + "/" + boardTarget + ")", "100%", "↑ 바닥", "check-figma-board-composition"],
  ["보드 인스턴스 (후보 전체 대비)", pct(boardCounts.instance, boardCandidates) + " (" + boardCounts.instance + "/" + boardCandidates + ")", "100%", "↑ 파생 (분모는 후보 바닥)", "check-figma-board-composition"],
  ["보드 replaceable", String(boardCounts.replaceable), "0", "↓ 양방향", "check-figma-board-composition"],
  ["보드 bespoke (제품이 정본을 안 문다)", String(boardCounts.bespoke), "0", "↓ 하락만 잠금", "check-figma-board-composition"],
  ["manifest 컴포넌트 done", done + "/" + doneTarget, String(doneTarget), "↑ 바닥", "이 게이트 + verify-figma-done"],
  ["manifest 컴포넌트 partial", String(partial), "0", "↓ done 의 나머지", "파생"],
  ["죽은 토큰 (지울 수 있는 것)", String(deadTokenCount) + "/" + emittedById.size, "0", "↓ 양방향", "이 게이트"],
  ["죽은 선언 이름 (대조군)", String(dead.length) + "/" + declared.size, "— 분모 아님", "파생", "파생"],
];
// 한글은 터미널에서 두 칸을 쓴다. 코드 포인트 수로 채우면 표가 어긋나고, 어긋난 표는
// 읽히지 않는다 — 이 게이트의 산출물은 «읽히는» 표 하나다.
const displayWidth = (text) =>
  [...text].reduce(
    (sum, ch) => sum + (/[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(ch) ? 2 : 1),
    0,
  );
const header = ["지표", "현재", "목표", "방향", "래칫 임자"];
const table = [header, ...rows];
const widths = header.map((_, column) => Math.max(...table.map((row) => displayWidth(row[column]))));
const line = (cells) =>
  "  " + cells.map((cell, index) => cell + " ".repeat(widths[index] - displayWidth(cell))).join("  ").trimEnd();

console.log("커버리지 목표 (앵커 " + String(anchor).slice(0, 8) + "):");
for (const [where, commit, reason] of lagging) {
  console.log(
    "  · **" + where + " 는 " + String(commit).slice(0, 8) + " 를 잰다** — 정본 앵커보다 " +
      "낡았고 그렇게 선언돼 있다. 이 줄이 있는 동안 위 표의 «보드» 행은 다른 제품의 수다. " +
      reason,
  );
}
for (const row of table) console.log(line(row));

console.log(
  "  · 죽었다의 정의: `packages/css/generated/tokens.css` 의 선언 " + declared.size +
    " 중, LOUIS 저작 CSS(" + louisRefs.size + "종 참조)와 제품 앵커(" + productRefs.size +
    "종 참조) 어느 쪽도 `var()` 로 풀지 않는 것 — 별칭 사슬을 따라간 뒤. " +
    "`theme.css` 는 소비자로 세지 않는다(같은 원천에서 생성돼 토큰이 있다는 이유만으로 " +
    themeRefs.size + "종을 참조한다 — 세면 죽은 선언 이름이 " + dead.length + " → " +
    deadIfThemeCounted + " 로 «내려간다»). " +
    "제품 쪽 절반은 " + TOKEN_USAGE + " 가 나르고, 나머지는 방금 다시 계산했다.",
);
console.log(
  "  · 위 두 줄이 다른 이유(DS-D-0047): 죽은 «이름» " + dead.length + " 를 원천 토큰으로 되짚으면 " +
    deadTokenCount + " 다. 뺀 셋을 여기 인쇄한다 — 발행 형태만 안 풀린 것 " +
    excluded.emittedForm.length + "(토큰은 살아 있다: `-rgb` 채널이 사는 색 계단과 " +
    "`-delay`/`-duration` 만 안 쓰는 motion 합성. 그 이름만 지울 방법이 없으므로 세면 목표 0 이 " +
    "정의상 도달 불가가 된다) · 사다리의 빈 칸 " + excluded.ladderRung.length +
    "(프리미티브 팔레트 + 적응형 회색 램프 + 타이포 스케일 — 완결된 것이 값이다) · " +
    "Figma 전용 축 " + excluded.figmaOnlyAxis.length + "(`type-line-height-percent/*`, " +
    "DS-D-0029 §1 이 일부러 만들었고 CSS 소비 0 이 설계된 상태다) · " +
    "앵커가 못 보는 소비자 " + excluded.anchorBlind.length +
    (excluded.anchorBlind.length === 0
      ? "(2026-09-03 재고정으로 비었다 — 그전엔 `color-bg-raised` 가 여기 있었다)"
      : "(" + excluded.anchorBlind.join(" · ") + " — 제품이 지금 쓰는데 원장이 그보다 이른 " +
        "앵커에서 읽혀 안 보인다. 재고정하면 0 이 된다)") + ". " +
    "원천에 id 가 없는 죽은 이름 " + orphanDeadNames.length + "종은 «빼지 않고» 세었다.",
);
console.log(
  "  · 100% 가 의미 없는 자리: 범위 밖 " + surfaceCounts.scoped + "건은 분모 밖이다 — " +
    "Provider·훅·레이아웃 래퍼를 Figma 에 그리는 일이 된다. " +
    "패턴 " + (patternFigma.partial ?? 0) + "건의 `partial` 도 목표가 없다 — DS-D-0035 는 " +
    "컴포넌트 축만 정의했고, 패턴의 done 은 정의 자체가 아직 없다(verify-figma-done 이 " +
    "패턴의 done 을 거부한다). 정의를 넓히기 전에는 이 수는 0 이 될 수 없다.",
);
console.log(
  "  · 보드 인스턴스가 두 줄인 이유: 위 줄의 분모는 «지금 바꿀 수 있는 것»(인스턴스+대체가능)이라 " +
    "대체가능이 " + boardCounts.replaceable + " 이면 그 비율은 정의상 100% 다 — 「보드가 " +
    "끝났다」가 아니다. 아직 " + boardCounts.bespoke + " 개가 bespoke(제품이 그 자리에서 정본 " +
    "클래스를 물지 않는다 — DS-D-0043·DS-D-0046), " + boardCounts.missing + " 개가 미보유, " +
    boardCounts.blocked + " 개가 막힘이다. 아래 줄이 그것을 센다.",
);
console.log(
  "  · 보드 bespoke 를 0 으로 만드는 것은 **Figma 축의 일이 아니다.** 그 자리를 Figma 에서만 " +
    "인스턴스로 바꾸면 Figma 가 제품보다 더 「정본」이 되어 두 축이 어긋난다. 열리는 조건은 " +
    "제품이 그 자리에서 정본 클래스를 물기 시작하는 것이고, **그것이 되어야 하는가는 위의 " +
    "표면 needed 가 세는 질문이다** — 이 표에서 두 줄이 만나는 유일한 자리다.",
);
console.log(
  "  · 상승이 자유인 수: 표면 needed·unclear, 보드 bespoke·blocked·missing. 늘어난 것은 발견이지 " +
    "후퇴가 아니고, 발견을 벌하면 다음 사람은 열어 보지 않는 쪽을 고른다. " +
    "후퇴 경로는 각각 다른 그물이 잡는다 — figma→needed 는 MAPPED_BASELINE, " +
    "needed→scoped 는 위의 scoped 천장이, replaceable→bespoke 는 REPLACEABLE_BASELINE 의 " +
    "양방향 래칫이 잡는다(그 baseline 이 0 이라 옮길 것이 애초에 없다).",
);
