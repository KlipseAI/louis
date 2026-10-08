#!/usr/bin/env node
// **제품 표면이 Figma 에 대응물을 갖는지 세는 래칫.**
//
// 왜 있나: `verify-figma-parity` 는 계약 51 ↔ Figma 51 을 **양방향으로 잠근 닫힌 집합**이다.
// 두 방향 모두 계약 안에서만 돈다 — 계약에 선언되지 않은 제품 표면은 아무리 많이 빠져
// 있어도 초록이 나온다. 그래서 「Figma 가 제품을 얼마나 덮는가」는 지금까지 **손으로 세어**
// `design/governance/figma-sync.md` 에 적혀 있었고, 그 문서는 스스로 「커버리지 열거기가
// 아직 없다」고 자인한다. 손으로 센 원장은 반드시 낡는다.
//
// 이 게이트는 `figma/product-coverage.json` 이 CSS property 축에서 이미 하는 일을 표면
// 축에서 한다 — **제품이 선언한 것을 기계가 열거하고, 분류되지 않은 것을 나열한다. 사유
// 없이 넘기는 길은 없다.**
//
// ── 왜 verify:ci 인가 ─────────────────────────────────────────────────────
// 열거기는 제품 저장소를 읽으므로 로컬 전용이다(`verify-product-surfaces`, verify:product).
// **이 게이트는 그 생성물과 Figma 되읽기만 읽는다** — 저장소 밖을 보지 않으므로 러너에서
// 실제로 돈다. `verify-gate-split` 5번이 그 자립성을 문자열로 확인한다.
// 두 게이트는 같은 원장의 앞뒤다: 열거기는 「목록이 앵커와 같은가」를, 이 게이트는
// 「목록의 모든 줄이 분류돼 있는가」를 잰다.
//
// ── 왜 판정이 넷인가 (2026-09-01 확장) ────────────────────────────────────
// 처음 이 게이트는 축이 둘이었다 — `figma` 이름이 있으면 대응, `reason` 이 있으면 범위 밖.
// 그 모델에는 **「Figma 에 세워야 하는데 아직 없다」를 적을 자리가 없다.** 그것을 `reason`
// 에 적는 순간 미등록이 사유로 둔갑해 「범위 밖」으로 세어지고, 커버리지가 **올라간 것처럼**
// 보인다. 이 저장소가 손으로 센 원장에서 이미 한 번 당한 실패의 재판이다.
//
// 그래서 `verdict` 축을 열고 넷으로 가른다.
//
//   figma    그 Figma 컴포넌트 「인」 표면. `figma` 에 이름을 적고 되읽기로 검증한다.
//   scoped   범위 밖. 그릴 것이 없거나 다른 축(보드·아이콘·상태)이 소유한다.
//   needed   Figma 에 세워야 하는데 아직 없다. **이것이 「무엇을 그려야 하는가」의 답이다.**
//   unclear  소유자 판단 대기. 규칙 질문이 풀려야 판정이 정해진다.
//
// ── 래칫의 방향 (판정마다 다르다) ─────────────────────────────────────────
// `unclassified` 는 **정확히 일치**해야 한다. 늘면 아무도 안 본 표면이 새로 생긴 것이고,
// 줄면 분류가 진행된 것이니 baseline 을 내리라고 요구한다. 이 저장소의 lint baseline 과
// 같은 양방향 래칫이며, 목표는 이 수가 0 이 되는 것이다(2026-09-01 에 0 이 됐다).
// `mapped` 도 정확히 일치해야 한다 — 떨어지면 커버리지가 후퇴한 것이고, 오르면 올려라.
// `total` 은 바닥만 지킨다. 표면을 통째로 지워서 분모를 줄이는 길을 막는 두 번째 그물이다.
//
// ── 왜 「대응」이 한 수가 아닌가 (2026-09-01, DS-D-0039) ──────────────────
// `figma` 에 적을 수 있는 이름은 되읽기의 `components` 51 **와** `templates` 9 둘 다다 —
// 패턴 보드 대응도 대응으로 센다. 세지 않으면 `Gnb`(앱 셸 5,639줄)처럼 **이미 그려져 있는데
// 셈할 어휘가 없는** 표면이 「그려야 한다」 목록에 영구히 앉아 그 목록을 틀린 항목으로
// 오염시킨다. 읽는 사람을 틀리게 만드는 판정은 판정이 아니다.
//
// **그런데 두 대응은 무게가 다르다.** 컴포넌트 대응은 `verify-figma-parity` 가 계약 ↔ Figma 를
// 양방향으로 잠그고 DS-D-0035 의 (a)(b)(c) 를 통과하면 `done` 까지 가지만, 패턴은 여덟 전부
// `figma: partial` 이라 지금 구조상 `done` 에 닿지 못한다. 패턴이 계약하는 것은
// `requiredParts` — 부품 **이름의 목록**이라 집어다 쓸 인스턴스가 없고(재사용이 없다),
// 패턴 하나를 여러 표면이 가리킬 수 있어(n:1) 대응 수는 오르는데 그려진 것은 하나도 늘지
// 않는다.
//
// 그래서 **한 수로 합치지 않는다.** 합계에 래칫을 걸고, **컴포넌트 대응 수에도 같은 래칫을
// 건다** — 합계만 잠그면 컴포넌트 대응을 패턴 대응으로 바꿔치기해도 수가 유지되어 후퇴가
// 보이지 않는다. 인쇄도 갈라서, 한 수만 읽고도 「패턴으로 퉁쳤다」를 놓치지 않게 한다.
//
// **`needed` 는 늘어도 실패시키지 않는다.** 늘어난 것은 후퇴가 아니라 발견이다 — 아직
// 안 본 표면을 열어 보고 「이건 그려야 한다」를 적은 결과이고, 그것을 실패로 만들면 다음
// 사람은 열어 보지 않는 쪽을 고른다. 줄어드는 방향이 목표이므로 수만 인쇄한다.
// `unclear` 도 같다 — 소유자 한 사람만이 줄일 수 있는 수를 게이트가 잠그면 소용이 없다.
//
// ── 왜 비율을 둘 인쇄하는가 ───────────────────────────────────────────────
// 「Figma 가 제품을 얼마나 덮는가」의 분모에 **범위 밖까지 넣으면 영원히 낮은 수가 나온다** —
// 그릴 생각이 없는 표면을 못 그린 것으로 세기 때문이다. 그래서 `scoped` 를 뺀
// **대상 대비**(figma + needed + unclear + unclassified)가 실제로 움직여야 할 수이고,
// **전체 대비**는 분모를 좁혀서 수를 예쁘게 만드는 길을 막는 대조군으로 함께 찍는다.
//
// **한 번에 전부 덮으려 하지 않았다.** 이 저장소가 실패한 방식이 그것이다 — 227건을 1차
// 판정하고 64건만 반증해 상한이 불명확한 수를 남겼다. 여기서는 입자도 규칙과 열거기와
// 래칫만 세우고, 초기 baseline 은 실측값으로 얼렸다. 다음 사람이 할 일은
// `needed` 를 줄이는 것 하나뿐이다.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));

const LEDGER = "migration/product.surfaces.json";
const READBACK = "figma/readback.json";

// 2026-09-03 실측. 표면 434종 중 figma 25 · scoped 225 · needed 179 · unclear 5 · 미분류 0.
// (2026-09-01 에는 400종 중 figma 19 · scoped 211 · needed 161 · unclear 9 였다.)
// 미분류를 새 위반으로 늘리려고 이 수를 올리지 마라 — 이 저장소의 baseline 규칙이다.
const UNCLASSIFIED_BASELINE = 0;
// 대응 합계. 컴포넌트 22 + 패턴 3(app-shell ← Gnb · auth-two-panel ← AuthStatusCard ·
// landing-shell ← landing/navigation/Gnb).
//
// 16번째 컴포넌트 대응은 `create/ConfirmModal`이다. DS-D-0041 이 Dialog 에 `Tone` 축을 열어
// 그 표면을 `unclear` 에서 내렸다 — 셸은 이미 `.louis-dialog` 정본이었고 막고 있던 것이
// 파괴적 확인의 축 하나였다.
//
// 17~22 번째는 2026-09-03 의 unclear 47 판정에서 나왔다. 여섯 전부 **마크업이 LOUIS 레시피를
// 직접 무는** 자리라 DS-D-0037 의 선례 그대로 대응이다 — 어드민의 얇은 어댑터 넷
// (`AdminAlert` ← Alert · `AdminBadge` ← Badge · `AdminState` ← EmptyState ·
// `AdminSegmented` ← SegmentedControl), 랜딩 캐러셀의 화살표 한 짝
// (`CarouselArrowButton` ← CarouselArrow), 인스펙터 절 머리의 아이콘 버튼
// (`InspectorSectionAction` ← IconButton).
//
// **대응 이름은 표면과 1:1 이 아니다.** `CarouselArrow` 는 이제 두 표면이 가리킨다 —
// 이미 대응이던 `#CarouselArrows`(버튼 «둘을 놓는 행»)와 새로 판정한
// `#CarouselArrowButton`(버튼 «한 짝», Figma 컴포넌트가 실제로 그것인 쪽)이다. 이 게이트는
// 이름의 유일성을 요구하지 않는다 — 세는 단위가 제품 표면이지 Figma 이름이 아니기 때문이다.
// 둘 중 어느 키가 정본 대응인지는 소유자 판정 대기 목록에 올렸다.
// 2026-09-06 겹침 계열 두 벌로 셋이 더 붙었다 — `CanvasConnectHint`→Toast(Layout=callout),
// `CanvasFirstNodeHint`→Tooltip(Layout=coachmark), `LanguageSelector`→MenuTrigger.
// 2026-09-10: 30 → 31 · 27 → 28. **이득이다.** `app/admin/AdminSection.tsx#AdminSelect` 가
// `.louis-select-trigger` 를 그대로 무는 것이 실측으로 확인돼 Figma SelectTrigger 로 이었다.
// 사유 없는 표면 35 를 판정하며 드러난 한 건이다(나머지 34 는 scoped 12 · needed 22).
// 2026-09-26: 31 → 33 — 제품 세트 대응 둘(DS-D-0071): Footer ← Product/Public Footer · PricingNotice ← Product/Pricing Notice.
// 2026-09-26: 33 → 59 — 글리프 생성기(build-figma-product-glyphs)의 제품 세트 넷이 인라인 <svg> 표면 26 을 통째로 그린다
// (Save Cloud 3 · Theme 3 · Glyph 5 · Mobile Action 15). 같은 날 「그릴 것이 없는」 칸 10(마크업 0 인 서버 껍데기 1 · 참조 0 인
// 죽은 수출 9)을 needed 에서 scoped 로 옮겼다 — 대응 수와는 무관하고 needed 200 → 164 의 일부다.
// 같은 날 뒤: 59 → 60 — 생성기가 useId 그라디언트를 옮기게 되어 PlanSparkleGlyph 가 Product/Glyph 의 variant 가 됐다.
// 2026-10-06: 60 → 59 — **의도한 후퇴(소유자 지시).** 옛 /pricing DOM 캡처 생성기의 부품 세트를 걷으며 Footer ← Product/Public Footer
// 대응이 사라졌다. Footer 는 needed(primitive)로 돌아갔고, 측정 원장에서 생성기로 다시 세울 자리다.
// 2026-10-07: 59 → 60 — 그 자리를 측정 원장에서 다시 세웠다. Footer ← Product/Landing Footer(보드 생성기 PARTS, 공개 원장 랜딩 서브트리).
// 같은 날 뒤: 60 → 64 — 편집기 밖 부품 조사의 바로 세울 수 있는 자리 넷: PageHeader · AdminSectionHeader · CustomDropdown · PlanComparisonTable.
// 2026-10-08: 64 → 82 · 컴포넌트 28 → 47 — 앵커를 작업 브랜치 통합 판으로 옮기며(DS-D-0079) 새로 생긴 표면 112종을 판정했고
// (figma 22 — auth-two-panel 이 덮는 인증 레이아웃 · 브랜드 패널 등), 같은 날 LOUIS 세트 열셋(Choice · Record Card · Text Link · Bare
// Button · Start Card · LoadingWord · 노드 입력판 등)이 섰다.
const MAPPED_BASELINE = 82;
// **합계와 따로 잠근다.** 컴포넌트 대응을 패턴 대응으로 바꿔치기하면 합계는 그대로인데
// 재사용할 인스턴스가 사라진다 — 이 수가 그 후퇴를 잡는 유일한 그물이다.
const MAPPED_COMPONENT_BASELINE = 47;
// **제품 세트 대응(DS-D-0071).** 「Figma 먼저 · 생성기로 묶어서」(소유자 결정 2026-09-26) — 제품 전용 부품은 LOUIS 컴포넌트가
// 아니라 Figma 제품 세트(`Product/…`)로 선다. LOUIS 대응 · 패턴 대응과 합치지 않고 따로 잠근다. 합계만 잠그면 LOUIS 대응을
// 제품 세트 대응으로 바꿔치기해도 수가 유지된다.
// 2026-09-26: 2 → 28 — 글리프 세트 넷이 표면 26 을 그린다(위 MAPPED_BASELINE 주석).
// 같은 날 뒤: 28 → 29 — PlanSparkleGlyph(위 MAPPED_BASELINE 주석).
// 2026-10-06: 29 → 28 — 위 MAPPED_BASELINE 과 같은 사유(Product/Public Footer 은퇴).
// 2026-10-07: 28 → 29 — Product/Landing Footer(위 MAPPED_BASELINE 주석). 같은 날 뒤 29 → 33(위 주석의 넷).
// 2026-10-08: 33 → 30 — **제품이 바뀐 몫(후퇴 아님).** 통합 판(DS-D-0079)에서 표면 셋이 사라졌다: 랜딩 Footer(공용 타임라인 푸터로
// 바뀜 — Product/Landing Footer 는 새 푸터를 다시 재서 세울 자리) · 요금 PricingNotice(공지 알약을 걷음) · 가이드 패널 PipelineArrow(도움말 개편으로 패널째 삭제).
const MAPPED_PRODUCT_BASELINE = 30;
const TOTAL_FLOOR = 400;
// 2026-09-09 실측. `needed` 176 을 앞 회차 판정에서 되살려 키 단위로 심었다 —
// 부품 87 · 화면 59 · 한자리 29 · 판단 대기 1. 앞 회차는 181 을 판정했고 그 사이 다섯이
// `figma` 로 닫혀(CanvasConnectHint · CanvasFirstNodeHint · LegalDocumentBackButton ·
// CopyPromptButton · LanguageSelector) 176 이 됐다. 앞 회차가 미판정으로 남긴 InstagramNode
// 하나는 앵커 소스를 읽어 primitive 로 판정했다(NODE_TYPES 아홉 칸의 아홉 번째).
// **이 회차는 종류만 심고 분모는 건드리지 않았다** — 176 은 176 이고 대응도 30 그대로다.
const KINDLESS_BASELINE = 0;

// 판정 어휘. 여기 없는 낱말은 판정이 아니라 오타이고, 오타는 조용히 `unclassified` 밖으로
// 새어 나가 아무 래칫에도 잡히지 않는다.
const VERDICTS = new Set(["figma", "scoped", "needed", "unclear"]);
// `needed` 의 우선순위. 「무엇을 먼저 그리는가」가 이 목록의 유일한 쓸모라, 판정만 있고
// 순서가 없으면 목록은 400줄짜리 벽이 된다.
const WEIGHTS = new Set(["high", "medium", "low"]);
// `needed` «안»의 종류. 왜 축을 하나 더 여는가: `needed` 176 은 「Figma 에 세워야 한다」를
// 한 통에 담아 **Figma 컴포넌트가 될 수 없는 것까지 같은 분모에 넣는다** — 1427줄짜리 화면
// 한 장과 재사용 12곳짜리 부품이 같은 1 로 세어진다. 그 분모로 계산한 「대상 대비 14.5%」는
// 무엇의 비율인지 말하지 못하고, DS-D-0044 의 「모든 지표 100%」도 화면이 분모에 있는 한
// 정의상 도달 불가다.
//
// **그런데 종류는 분모를 옮기지 않는다.** `kind` 는 needed 안의 축이고, 이 게이트가 그것을
// 기계로 강제한다 — kind 는 `needed` 에만 붙는다. `scoped` 에 붙일 수 있으면 「화면이라
// 범위 밖」이 한 줄로 가능해지고, 그것이 바로 이 저장소가 이미 한 번 당한 «미등록이 사유로
// 둔갑하는» 자리다. 분모를 옮기는 조건과, 그 조건을 기계로 재려다 실패한 실측은 원장의
// `$kindRule` 이 갖는다(요약: 후보였던 「그 화면 보드의 replaceable 이 0」은 36 보드 전부에서
// 0 이라 공허하고, 보드 원장의 $verdictRule 이 스스로 needed 의 하류라고 적었으므로 순환이며,
// /archive 보드는 「No projects yet」11 노드라 화면이 아니라 빈 상태를 그린다).
const KINDS = new Set(["primitive", "screen", "oneoff", "unclear"]);

// 사유의 최소 길이. `verify-product-parity` 의 MINIMUM_REASON 과 같은 값이다 —
// 「없음」·「해당 없음」 같은 한 낱말이 사유로 통과하면 분류는 형식만 남는다.
const MINIMUM_REASON = 20;

const BINDINGS = new Set(["default", "named", "local"]);

const errors = [];
const ledger = readJson(LEDGER);
const readback = readJson(READBACK);

// Figma 어휘. 컴포넌트 51 + 패턴 보드 9. 여기에 없는 이름을 적는 것은 「있다고 적었지만
// 파일에 없다」는 뜻이고, 그것이 원장을 낡게 만드는 방식 그 자체다.
//
// **두 사전을 합치지 않고 따로 든다.** 합집합 하나로 만들면 대응이 어느 쪽에서 왔는지가
// 그 자리에서 사라지고, 그러면 컴포넌트 대응과 패턴 대응을 갈라 셀 수 없다(DS-D-0039).
// 사람이 새로 적을 필드는 없다 — 그 정보는 이미 되읽기가 갖고 있다.
const componentVocabulary = new Set(Object.keys(readback.components ?? {}));
const patternVocabulary = new Set(Object.keys(readback.templates ?? {}));
// 셋째 어휘 — 제품 세트(DS-D-0071). 정본은 제품 세트 생성기의 계획이 선언한 세트 이름이다. 그 계획은 제품 측정에서 생성되고
// 세트 러너로 라이브에 적용되며 `check-figma-product-*` 가 계획과 러너를 잠근다. 되읽기(`DS · Components`)에는 없다 —
// 제품 세트는 `90 · 자산` 에 산다.
const productVocabulary = new Set();
for (const file of readdirSync(resolve(repoRoot, "figma")).filter((name) => /^product-.+\.plan\.json$/.test(name))) {
  const walk = (value, key) => {
    if (typeof value === "string") {
      if (/(^s|S)etName$/.test(key ?? "") && value.startsWith("Product/")) productVocabulary.add(value);
      return;
    }
    if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, k);
  };
  walk(readJson("figma/" + file));
}
if (productVocabulary.size === 0) {
  errors.push("figma/product-*.plan.json 에서 제품 세트 이름을 하나도 읽지 못했습니다(DS-D-0071).");
}
if (componentVocabulary.size === 0) {
  errors.push(READBACK + " 에서 Figma 컴포넌트 이름을 하나도 읽지 못했습니다.");
}
if (patternVocabulary.size === 0) {
  errors.push(READBACK + " 에서 Figma 패턴 보드(templates) 이름을 하나도 읽지 못했습니다.");
}
// 두 사전에 같은 이름이 있으면 그 대응이 어느 쪽인지 기계가 정할 수 없고, 갈라 센 두 수가
// 조용히 어긋난다. 지금은 겹치지 않으므로(PascalCase ↔ kebab-case) 겹치는 날 멈춘다.
for (const name of componentVocabulary) {
  if (patternVocabulary.has(name)) {
    errors.push(
      READBACK + ": `" + name + "` 이 components 와 templates 양쪽에 있습니다. " +
        "대응을 컴포넌트/패턴으로 가를 수 없으므로 한쪽 이름을 바꾸세요.",
    );
  }
}

// 규칙이 파일 안에 남아 있는지. 입자도 규칙이 사라지면 이 수들은 다시 의미를 잃는다 —
// 원장 §5 가 지적한 「분모가 확정되지 않았다」로 되돌아간다.
if (typeof ledger.$granularityRule !== "string" || ledger.$granularityRule.length < 40) {
  errors.push(LEDGER + " 에 입자도 규칙($granularityRule)이 없습니다. 규칙 없는 수는 비율이 아닙니다.");
}
// 판정 축의 「왜」도 같은 이유로 파일 안에 있어야 한다. 넷으로 가른 근거가 사라지면
// 다음 사람은 `needed` 를 다시 `scoped` 에 섞고, 미등록이 사유로 둔갑하는 자리로 돌아간다.
if (typeof ledger.$verdictRule !== "string" || ledger.$verdictRule.length < 40) {
  errors.push(
    LEDGER + " 에 판정 규칙($verdictRule)이 없습니다. 넷으로 가른 근거가 파일 안에 없으면 " +
      "`needed` 는 다시 `scoped` 에 섞입니다.",
  );
}

// 상태 축 규칙도 같은 이유로 파일 안에 있어야 한다(DS-D-0040). 「한 컴포넌트의 여러 시각
// 상태는 표면 1개」는 규칙 없이 적으면 판정이 아니라 느낌이다 — 이 저장소는 그 한 줄만 두고
// `scoped` 27건을 그 미결에 매달아 둔 적이 있다. 규칙이 사라지면 다음 사람은 합성 스켈레톤을
// 다시 부모의 Loading 축으로 접거나, 반대로 상태마다 컴포넌트를 세워 같은 카드를 셋으로 가른다.
if (typeof ledger.$stateRule !== "string" || ledger.$stateRule.length < 40) {
  errors.push(
    LEDGER + " 에 상태 축 규칙($stateRule)이 없습니다. 「골격이 다르면 별 표면」의 시험이 " +
      "파일 안에 없으면 상태 판정은 사람마다 달라집니다.",
  );
}

// 종류 축의 「왜」도 같은 이유로 파일 안에 있어야 한다. 여기에는 **분모를 옮기지 «않는»
// 근거**가 실려 있다 — 사라지면 다음 사람은 screen 59 를 분모에서 빼고 커버리지가 올랐다고
// 적는다. 일 하나 없이 14.5% 가 25.6% 가 되는 길이고, 이 저장소는 그 종류의 상승을 후퇴라고
// 부른다.
if (typeof ledger.$kindRule !== "string" || ledger.$kindRule.length < 40) {
  errors.push(
    LEDGER + " 에 종류 규칙($kindRule)이 없습니다. 분모를 옮기지 «않는» 근거가 파일 안에 " +
      "없으면 다음 사람은 screen 을 분모에서 빼고 그것을 진척이라고 적습니다.",
  );
}

const surfaces = ledger.surfaces ?? {};
const ids = Object.keys(surfaces);
if (ids.length === 0) errors.push(LEDGER + " 에 표면이 하나도 없습니다.");

let mapped = 0;
let mappedComponent = 0;
let mappedPattern = 0;
let mappedProduct = 0;
let scoped = 0;
let needed = 0;
let unclear = 0;
let unclassified = 0;
const unclassifiedIds = [];
const neededByWeight = { high: 0, medium: 0, low: 0 };
const neededByKind = { primitive: 0, screen: 0, oneoff: 0, unclear: 0 };
let kindless = 0;
const kindlessIds = [];

for (const id of ids) {
  const surface = surfaces[id];
  const at = LEDGER + "#" + id;

  if (typeof surface.file !== "string" || !surface.file.startsWith("apps/web/")) {
    errors.push(at + ": file 이 제품 트리 경로가 아닙니다.");
    continue;
  }
  // 식별자와 file 이 어긋나면 목록에 없는 자리를 분류한 것이 된다.
  if (!id.startsWith(surface.file + "#") || id.slice(surface.file.length + 1).length === 0) {
    errors.push(at + ": 식별자가 `<파일>#<컴포넌트>` 모양이 아니거나 file 과 어긋납니다.");
    continue;
  }
  if (!BINDINGS.has(surface.binding)) {
    errors.push(at + ": binding 이 default/named/local 이 아닙니다: " + String(surface.binding));
  }
  if (!Array.isArray(surface.louis) || surface.louis.some((c) => !/^louis-/.test(String(c)))) {
    errors.push(at + ": louis 는 `louis-` 로 시작하는 클래스 이름의 배열이어야 합니다.");
  }

  const hasFigma = surface.figma !== null && surface.figma !== undefined;
  const reason = typeof surface.reason === "string" ? surface.reason.trim() : "";
  const verdict = surface.verdict ?? null;
  const weight = surface.weight ?? null;

  // 판정이 비어 있다 = 아무도 안 본 표면. 이 자리가 `unclassified` 이고, 여기에만
  // 양방향 래칫이 걸린다. `figma`·`reason` 만 남아 있고 판정이 없는 줄은 옛 스키마의
  // 잔존물이므로 통과시키지 않는다 — 조용히 세어지지 않는 자리가 생기기 때문이다.
  if (verdict === null) {
    if (hasFigma || reason.length > 0) {
      errors.push(
        at + ": verdict 없이 figma/reason 만 적혀 있습니다. 판정을 " +
          [...VERDICTS].join("/") + " 중 하나로 적으세요.",
      );
    }
    unclassified += 1;
    unclassifiedIds.push(id);
    continue;
  }

  if (!VERDICTS.has(verdict)) {
    errors.push(
      at + ": verdict 가 판정 어휘 밖입니다: " + String(verdict) + ". " +
        [...VERDICTS].join("/") + " 중 하나여야 합니다 — 어휘 밖의 낱말은 어느 래칫에도 잡히지 않습니다.",
    );
    continue;
  }

  // 판정이 무엇이든 근거를 적는다. 「없음」 한 낱말이 통과하면 분류는 형식만 남는다.
  if (reason.length < MINIMUM_REASON) {
    errors.push(
      verdict === "figma"
        ? at + ": Figma 대응을 선언하려면 reason 에 " + MINIMUM_REASON +
            "자 이상의 근거가 필요합니다(어느 파일이 그 대응을 고정하는가)."
        : at + ": " + verdict + " 로 두려면 reason 에 " + MINIMUM_REASON +
            "자 이상의 사유가 필요합니다.",
    );
  }

  // `weight` 는 needed 에만 붙는다. 다른 판정에 붙어 있으면 목록을 정렬할 때 조용히
  // 섞여 들어와 「무엇을 먼저 그리는가」를 흐린다.
  if (verdict === "needed") {
    if (!WEIGHTS.has(weight)) {
      errors.push(
        at + ": needed 에는 weight 가 " + [...WEIGHTS].join("/") + " 중 하나로 필요합니다: " +
          String(weight) + ". 순서 없는 필요 목록은 그리는 순서를 정해 주지 못합니다.",
      );
    } else {
      neededByWeight[weight] += 1;
    }
  } else if (weight !== null) {
    errors.push(at + ": weight 는 needed 판정에만 붙습니다(현재 " + verdict + ").");
  }

  // `kind` 는 needed 에만 붙는다. 다른 판정에 붙을 수 있으면 「화면이라 범위 밖」이 한 줄로
  // 가능해지고, 종류가 분모를 옮기는 문이 된다.
  const kind = surface.kind ?? null;
  const kindReason = typeof surface.kindReason === "string" ? surface.kindReason.trim() : "";
  if (verdict === "needed") {
    if (kind === null) {
      kindless += 1;
      kindlessIds.push(id);
      if (kindReason.length > 0) {
        errors.push(at + ": kind 없이 kindReason 만 적혀 있습니다: " + [...KINDS].join("/"));
      }
    } else if (!KINDS.has(kind)) {
      errors.push(
        at + ": kind 가 종류 어휘 밖입니다: " + String(kind) + ". " + [...KINDS].join("/") +
          " 중 하나여야 합니다 — 어휘 밖의 낱말은 어느 칸에도 세어지지 않습니다.",
      );
    } else {
      neededByKind[kind] += 1;
      if (kindReason.length < MINIMUM_REASON) {
        errors.push(
          at + ": kind 를 " + kind + " 로 두려면 kindReason 에 " + MINIMUM_REASON +
            "자 이상의 근거가 필요합니다(무엇이 되풀이되는가 · 소비처가 몇인가).",
        );
      }
    }
  } else if (kind !== null || kindReason.length > 0) {
    errors.push(
      at + ": kind 는 needed 판정에만 붙습니다(현재 " + verdict + "). 종류는 needed 안의 " +
        "축이지 needed 밖으로 나가는 문이 아닙니다.",
    );
  }

  if (verdict === "figma") {
    const name = typeof surface.figma === "string" ? surface.figma : null;
    const isComponent = name !== null && componentVocabulary.has(name);
    const isPattern = name !== null && patternVocabulary.has(name);
    const isProduct = name !== null && productVocabulary.has(name);
    if (!isComponent && !isPattern && !isProduct) {
      errors.push(
        at + ": figma 이름이 " + READBACK + " 의 components · templates 에도, 제품 세트 계획(figma/product-*.plan.json)에도 없습니다: " +
          String(surface.figma) + ". 어디에도 없는 이름은 「Figma 에 있다」의 근거가 되지 못합니다.",
      );
    } else if (isComponent) {
      mappedComponent += 1;
    } else if (isPattern) {
      mappedPattern += 1;
    } else {
      mappedProduct += 1;
    }
    mapped += 1;
    continue;
  }

  // figma 가 아닌 판정에 이름이 남아 있으면 커버리지가 두 번 세어진다.
  if (hasFigma) {
    errors.push(at + ": " + verdict + " 판정에 figma 이름이 남아 있습니다: " + String(surface.figma));
  }

  if (verdict === "scoped") scoped += 1;
  else if (verdict === "needed") needed += 1;
  else unclear += 1;
}

// 요약이 스스로를 속이지 못하게. 파일 안의 counts 는 다시 센 값과 같아야 한다.
const counts = ledger.counts ?? {};
const recounted = { total: ids.length, mapped, scoped, needed, unclear, unclassified };
for (const key of ["total", "mapped", "scoped", "needed", "unclear", "unclassified"]) {
  if (counts[key] !== recounted[key]) {
    errors.push(
      LEDGER + " 의 counts." + key + " (" + String(counts[key]) + ") 가 다시 센 값 " +
        recounted[key] + " 와 다릅니다. `pnpm run measure-product-surfaces` 로 다시 뽑으세요.",
    );
  }
}

// 종류 분포도 같은 자리에서 다시 센다. `counts` 와 «따로» 든 수라 따로 검산하지 않으면
// 조용히 어긋난다.
const ledgerKinds = ledger.neededKinds ?? {};
const recountedKinds = { ...neededByKind, kindless };
for (const key of ["primitive", "screen", "oneoff", "unclear", "kindless"]) {
  if (ledgerKinds[key] !== recountedKinds[key]) {
    errors.push(
      LEDGER + " 의 neededKinds." + key + " (" + String(ledgerKinds[key]) + ") 가 다시 센 값 " +
        recountedKinds[key] + " 와 다릅니다. `pnpm run measure-product-surfaces` 로 다시 뽑으세요.",
    );
  }
}

// ── 래칫 ──────────────────────────────────────────────────────────────────
if (unclassified > UNCLASSIFIED_BASELINE) {
  errors.push(
    "사유 없는 표면이 " + (unclassified - UNCLASSIFIED_BASELINE) + "개 늘었습니다 " +
      "(" + UNCLASSIFIED_BASELINE + " → " + unclassified + "). " +
      "대응하는 Figma 컴포넌트 이름을 figma 에 적거나, 왜 대응물이 없어도 되는지를 reason 에 " +
      MINIMUM_REASON + "자 이상으로 적으세요. 사유 없이 넘기는 길은 없습니다.\n      새로 생긴 자리: " +
      unclassifiedIds.slice(-5).join(", "),
  );
} else if (unclassified < UNCLASSIFIED_BASELINE) {
  errors.push(
    "사유 없는 표면이 " + (UNCLASSIFIED_BASELINE - unclassified) + "개 줄었습니다 " +
      "(" + UNCLASSIFIED_BASELINE + " → " + unclassified + "). 이득을 잠그세요 — " +
      "이 파일의 UNCLASSIFIED_BASELINE 을 " + unclassified + " 로 내립니다. " +
      "내리지 않으면 그 자리는 다음에 조용히 되돌아옵니다.",
  );
}

// 종류 없는 `needed` 에 **양방향** 래칫을 건다 — `unclassified` 와 같은 모양이다. 늘면
// 아무도 종류를 안 본 자리가 새로 생긴 것이고, 줄면 판정이 진행된 것이니 잠그라고 요구한다.
// needed 자체의 상승은 발견이라 자유지만, 종류 없이 늘어나는 것은 발견이 아니라 미룸이다.
if (kindless > KINDLESS_BASELINE) {
  errors.push(
    "종류 없는 필요 표면이 " + (kindless - KINDLESS_BASELINE) + "개 늘었습니다 " +
      "(" + KINDLESS_BASELINE + " → " + kindless + "). `kind` 를 " + [...KINDS].join("/") +
      " 중 하나로 적고 `kindReason` 에 근거를 붙이세요 — 종류 없는 needed 는 " +
      "「무엇을 세우는가」에 답하지 못합니다.\n      새로 생긴 자리: " +
      kindlessIds.slice(-5).join(", "),
  );
} else if (kindless < KINDLESS_BASELINE) {
  errors.push(
    "종류 없는 필요 표면이 " + (KINDLESS_BASELINE - kindless) + "개 줄었습니다 " +
      "(" + KINDLESS_BASELINE + " → " + kindless + "). 이득을 잠그세요 — 이 파일의 " +
      "KINDLESS_BASELINE 을 " + kindless + " 로 내립니다.",
  );
}

if (mapped < MAPPED_BASELINE) {
  errors.push(
    "Figma 대응이 선언된 표면이 " + (MAPPED_BASELINE - mapped) + "개 줄었습니다 " +
      "(" + MAPPED_BASELINE + " → " + mapped + "). 커버리지는 떨어질 수 없습니다.",
  );
} else if (mapped > MAPPED_BASELINE) {
  errors.push(
    "Figma 대응이 " + (mapped - MAPPED_BASELINE) + "개 늘었습니다 " +
      "(" + MAPPED_BASELINE + " → " + mapped + "). 이 파일의 MAPPED_BASELINE 을 " + mapped +
      " 로 올려 이득을 잠그세요.",
  );
}

// 합계와 «따로» 잠근다. 대응 하나를 컴포넌트에서 패턴으로 옮기면 합계는 움직이지 않지만
// 집어다 쓸 인스턴스가 사라진다 — 그 교환이 조용히 지나가는 것을 막는 자리다.
if (mappedComponent < MAPPED_COMPONENT_BASELINE) {
  errors.push(
    "컴포넌트 대응이 " + (MAPPED_COMPONENT_BASELINE - mappedComponent) + "개 줄었습니다 " +
      "(" + MAPPED_COMPONENT_BASELINE + " → " + mappedComponent + "). 패턴 대응이 대신 늘어 " +
      "합계가 유지되더라도 후퇴입니다 — 패턴 보드에는 집어다 쓸 인스턴스가 없습니다(DS-D-0039).",
  );
} else if (mappedComponent > MAPPED_COMPONENT_BASELINE) {
  errors.push(
    "컴포넌트 대응이 " + (mappedComponent - MAPPED_COMPONENT_BASELINE) + "개 늘었습니다 " +
      "(" + MAPPED_COMPONENT_BASELINE + " → " + mappedComponent + "). 이 파일의 " +
      "MAPPED_COMPONENT_BASELINE 을 " + mappedComponent + " 로 올려 이득을 잠그세요.",
  );
}

// 제품 세트 대응도 따로 잠근다(DS-D-0071). 표면이 LOUIS 컴포넌트가 되어 `figma` 칸이 LOUIS 이름으로 옮겨 가면 여기서 하나
// 줄고 컴포넌트 대응이 하나 는다 — 그 교환은 두 수를 함께 옮기는 것으로 드러난다.
if (mappedProduct < MAPPED_PRODUCT_BASELINE) {
  errors.push(
    "제품 세트 대응이 " + (MAPPED_PRODUCT_BASELINE - mappedProduct) + "개 줄었습니다 " +
      "(" + MAPPED_PRODUCT_BASELINE + " → " + mappedProduct + "). LOUIS 컴포넌트로 옮겨 간 것이면 컴포넌트 대응 기준과 함께 " +
      "이 파일의 MAPPED_PRODUCT_BASELINE 을 내리고, 아니면 후퇴입니다.",
  );
} else if (mappedProduct > MAPPED_PRODUCT_BASELINE) {
  errors.push(
    "제품 세트 대응이 " + (mappedProduct - MAPPED_PRODUCT_BASELINE) + "개 늘었습니다 " +
      "(" + MAPPED_PRODUCT_BASELINE + " → " + mappedProduct + "). 이 파일의 MAPPED_PRODUCT_BASELINE 을 " + mappedProduct +
      " 로 올려 이득을 잠그세요.",
  );
}

if (ids.length < TOTAL_FLOOR) {
  errors.push(
    "표면 총수가 바닥 아래로 내려갔습니다 (" + TOTAL_FLOOR + " → " + ids.length + "). " +
      "분모를 지워서 커버리지를 올리는 길을 막는 그물입니다. 앵커가 움직여 실제로 줄었다면 " +
      "TOTAL_FLOOR 를 함께 내리고, 무엇이 사라졌는지 적으세요.",
  );
}

if (errors.length > 0) {
  console.error("Figma 표면 커버리지 게이트 실패:");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

// 두 비율. **대상 대비가 움직여야 할 수이고, 전체 대비는 분모를 좁혀 수를 예쁘게 만드는
// 길을 막는 대조군이다.** 하나만 찍으면 둘 중 어느 쪽으로든 속일 수 있다.
const target = ids.length - scoped;
const percentAll = ((mapped / ids.length) * 100).toFixed(1);
const percentTarget = target > 0 ? ((mapped / target) * 100).toFixed(1) : "0.0";
const percentComponentAll = ((mappedComponent / ids.length) * 100).toFixed(1);
const percentComponentTarget =
  target > 0 ? ((mappedComponent / target) * 100).toFixed(1) : "0.0";
console.log(
  "Figma 표면 커버리지: 표면 " + ids.length + "종 · 대응 " + mapped +
    " = 컴포넌트 " + mappedComponent + " + 패턴 " + mappedPattern + " + 제품 세트 " + mappedProduct +
    " (전체 대비 " + percentAll + "% · 대상 대비 " + percentTarget + "% / 대상 " + target + ") · " +
    "범위 밖 " + scoped + " · 필요 " + needed +
    "(high " + neededByWeight.high + " · medium " + neededByWeight.medium +
    " · low " + neededByWeight.low + ") · 판단 대기 " + unclear +
    " · 사유 없음 " + unclassified + ".",
);
// 패턴 대응을 뺀 수를 나란히 찍는다. 첫 줄만 읽어도 대응 합계 안에 패턴이 몇인지는 보이지만,
// **비율까지 갈라 두지 않으면** 「대상 대비 N%」 한 수만 인용돼 컴포넌트 커버리지로 읽힌다 —
// 이 저장소가 손으로 센 원장에서 당한 실패가 정확히 그 모양이다.
console.log(
  "  컴포넌트 대응만 세면 " + mappedComponent +
    " (전체 대비 " + percentComponentAll + "% · 대상 대비 " + percentComponentTarget + "%). " +
    "패턴 " + mappedPattern + "건은 보드 대응이라 「Figma 에 있다」까지이고 " +
    "「컴포넌트로 서 있다」가 아니다 — 부품에 key 가 없어 집어다 쓸 인스턴스가 없다(DS-D-0039).",
);
console.log(
  "  필요 " + needed + " 의 종류: 부품 " + neededByKind.primitive + " · 화면 " +
    neededByKind.screen + " · 한자리 " + neededByKind.oneoff + " · 판단 대기 " +
    neededByKind.unclear + " · 종류 없음 " + kindless + ". " +
    "**이 축은 분모를 옮기지 않는다** — 화면 " + neededByKind.screen + " 을 빼면 대상은 " +
    (target - neededByKind.screen) + " 이 되어 같은 대응 " + mapped + " 이 " +
    (target - neededByKind.screen > 0
      ? ((mapped / (target - neededByKind.screen)) * 100).toFixed(1)
      : "0.0") +
    "% 로 «보이지만», 그리는 일은 한 자리도 늘지 않는다. 그 문을 여는 조건과 그것을 기계로 " +
    "재려다 실패한 실측은 " + LEDGER + " 의 $kindRule 이 갖는다.",
);
console.log(
  "  필요 " + needed + "건은 늘어도 실패하지 않는다 — 발견이지 후퇴가 아니다. 줄이는 것이 목표다. " +
    "판단 대기 " + unclear + "건은 소유자만 줄일 수 있다. " +
    "입자도 규칙은 " + LEDGER + " 의 $granularityRule, 판정 규칙은 $verdictRule, " +
    "상태 축 규칙은 $stateRule 이 소유한다.",
);
