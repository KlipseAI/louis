#!/usr/bin/env node
// **측정 앵커가 하나인지 재는 게이트.**
//
// 왜 있나: 2026-09-01 전수 감사에서 이 저장소의 제품 생성물 24개가 **네 시점의 제품**을
// 동시에 기준 삼고 있었다(원장 `anchor-scatter-five-commits`). `ae8fd627` 19핀 ·
// `a3ed8e03` 4핀 · `a89fc0d5` 1 · `7e9c3b69` 1 · `086f4a62` 1. 그중 가장 나쁜 것은
// `figma/product-pricing-page.plan.json` 이었다 — 326커밋 낡은 제품의 가격 페이지를 그려
// 놓고 초록이었는데, 그 사이 제품에서 가격표가 실제로 두 번 바뀌었다(제품 `dde15c7c` ·
// `fc265a02`). 낡음 자체보다 나쁜 것은 낡았다는 사실을 재는 자가 없다는 것이다.
//
// 정본은 `migration/product-evidence.lock.json` 의 `productCommit` 이다. 근거는
// scripts/lib/product-anchor.mjs 머리말에 적었다 — 코드가 앵커를 읽는 자리 세 갈래가 전부
// 그 파일을 읽고, 생성물의 핀 36개는 아무도 읽지 않는 기록이다.
//
// **이 게이트는 제품 저장소를 열지 않는다.** 그래서 `verify:ci` 에 들어가고 hosted CI 에서
// 실제로 돈다 — 이 저장소의 제품 게이트 25개는 러너에 제품이 없어 한 번도 돌지 않았다
// (scripts/verify-gate-split.mjs 머리말). 핀끼리의 일치는 저장소 없이 판정된다.
//
// **여기서 잡지 못하는 것**: 「lock 자신이 제품보다 낡았다」. 그것은 제품 저장소를 읽어야
// 알 수 있어 `verify-product-evidence`(verify:product 레인)가 잰다 — 앵커 이후 제품에 새로
// 생긴 `.tsx`/`.css` 를 세는 래칫이 그 일을 한다. 두 게이트는 같은 앵커의 앞뒤다.
import { collectPins, readAnchor, samePin } from "./lib/product-anchor.mjs";

// ── 역사 기록으로 선언된 핀 ────────────────────────────────────────────────
// 앵커를 따라오지 **않는 것이 맞는** 핀만 여기 적는다. 판정 기준은 하나다 —
// 「그 파일을 다시 만들 수 있는가」. 다시 만들 수 없으면 그것은 생성물이 아니라 그 시점의
// 기록이고, 앵커가 움직였다고 값을 바꾸면 기록이 거짓이 된다.
//
// 값을 함께 적는 이유: 이름만 면제하면 그 파일 안의 핀이 아무 값으로나 바뀌어도 조용하다.
// 값까지 적어 두면 면제는 「이 값에 대한 면제」가 된다.
const DECLARED_HISTORICAL_PINS = [
  {
    file: "migration/product-has-refutation.json",
    path: "/commit",
    value: "a89fc0d518a150d8941d72c97b6881df952810ff",
    reason:
      "2026-08-20 세션의 반증 285축을 옮겨 적은 일회성 기록이다. 파일 자신이 " +
      "「원본 캐시는 재생성할 수 없으므로 이 파일에는 생성 스크립트가 없다」고 적는다. " +
      "verify-refutation-quotes 가 이 커밋에서 인용문을 다시 읽어 대조하므로, 값을 옮기면 " +
      "인용 285건이 통째로 검증 불가가 된다.",
  },
  {
    file: "migration/consolidation-choices.json",
    path: "/productCommit",
    value: "7e9c3b6946a71431479aef69d16baac5c53128b2",
    reason:
      "제품의 경쟁 정의 중 무엇을 정본으로 삼을지 **사람이 고른 결과**다. 파일 자신이 " +
      "「선택은 사람만 한다」고 규칙으로 적는다. 그때 눈으로 본 후보들이 그 커밋의 것이므로 " +
      "커밋을 옮기면 무엇을 보고 골랐는지가 사라진다. 다시 고를 때 사람이 함께 옮긴다.",
  },
];

// 면제는 늘지 않는다. 이 저장소의 baseline 규칙과 같은 래칫이다 — 줄어드는 것만 허용한다.
// 늘려야 한다고 판단했다면 그것은 코드 변경이 아니라 소유자 판정이다.
const MAX_DECLARED = DECLARED_HISTORICAL_PINS.length;
const DECLARED_RATCHET = 2;

// 앵커가 낙후된 동안 어긋나 있는 핀. **위 DECLARED_HISTORICAL_PINS 와 다른 것이다.**
// 저것은 「영원히 앵커를 따라오지 않는 것이 맞는」 기록이고, 이것은 「지금 낙후돼 있고
// 재고정으로 0 이 되어야 하는」 부채다. 둘을 한 목록에 섞으면 한시적 부채가 영구 면제로
// 굳는다 — 이 저장소가 baseline 을 따로 두는 이유가 정확히 그것이다.
//
// **왜 baseline 을 두는가.** 이 게이트를 빨간 채로 verify:ci 에 두면 CI 가 상시 빨개진다.
// 이 저장소는 그 실패를 이미 겪었다 — 제품 저장소를 읽는 게이트들이 러너에 그 저장소가
// 없어 2026-08-18~08-22 에 46회 연속 빨갰고, 그동안 아무도 그 빨강을 읽지 않았다.
// 상시 빨강은 게이트가 죽는 방식이지 사실을 말하는 방식이 아니다. 그래서 「지금 어긋난
// 것」을 얼려 두고 **늘어나는 것만** 잡는다. 낙후 사실 자체는 사라지지 않는다 — 아래
// 진단이 매 실행마다 몇 개가 남았는지와 그것을 어떻게 0 으로 만드는지를 인쇄한다.
//
// **한 방향 래칫이다.** 개수가 늘면 실패하고, 줄면 이 표를 내리라고 요구한다.
// css-modules baseline 과 같은 성격이며, 목표는 이 표가 비는 것이다.
//
// **2026-09-03 정정.** 이 표는 「앵커 재고정으로 0 이 된다」고 적고 있었는데, 그날 실제로
// 재고정을 했고(`ae8fd627` → `5a67d692`) **넷 다 그대로 남았다.** 남은 이유가 넷 다 다르고,
// 넷 다 lock 을 옮기는 것과 무관하다 —
//   product.scenes.json          측정기가 NOT_MEASURED 다(liveOnly 표본 0). 앵커와 무관하다.
//   product-pricing-page.plan    위의 그림자다. 장면 증거가 서야 열린다.
//   product.variable-modes.json  제품을 브라우저에 올려 문맥별 해결값을 뽑아야 한다.
//   product.measured.json        손으로 쓴 파일이고, 핀을 옮기기 전에 파일 안의 모순을
//                                사람이 판정해야 한다(아래 HOW_TO_REALIGN).
// 진단이 「재고정하면 된다」고 말하는 동안은 다음 사람이 lock 만 다시 박고 넘어간다.
const KNOWN_STALE = new Map([
  ["figma/product-pricing-page.plan.json", 1],
  ["migration/product.measured.json", 1],
  ["migration/product.scenes.json", 3],
  ["migration/product.variable-modes.json", 2],
]);

// ── fixture 축 ────────────────────────────────────────────────────────────
// **이 저장소는 지금 제품을 두 방법으로 잰다. 재고정이 그 둘을 갈라 놓았다.**
//
// 2026-09-03 에 앵커를 `ae8fd627` → `5a67d692` 로 옮겼다(제품 `origin/design`). 옮길 수 있었던
// 것은 **git 트리만 읽는** 원장들이다 — 근거 lock · 인용 620건 · alpha · drift · nav-labels ·
// render · 표면 · LOUIS 토큰 사용. 제품 저장소만 있으면 다시 뜬다.
//
// 따라오지 못한 것은 **측정 fixture 를 거치는** 원장들이다. `product.auth-fixture.json` 과
// `product.sidebar-states.json` 은 「lock 커밋에 고정된 clean 클론 + standalone 빌드 +
// Playwright」를 요구하고(`KLIPSE_PRODUCT_FIXTURE_ROOT`), 그 fixture 는 `KLIPSE_PRODUCT_FIXTURE_ROOT` 가 가리키는 clean 클론에
// `ae8fd627` 로 서 있다. 그 위에 `build-figma-app-screens` 가 계획을 얹고, 보드 원장과 화면
// 계획 여덟이 그 계획을 읽는다. 그래서 이 열넷은 **한 매듭**이며, 앵커만 옮기면 생성기들이
// 「어제의 제품 상자로 오늘의 보드를 판정한다」로 스스로 멈춘다 — 그렇게 멈추는 것이 맞다.
//
// **KNOWN_STALE 과 섞지 않는 이유.** 저것은 「앵커 재고정으로 0 이 되는」 부채다. 이 열넷은
// 재고정으로 0 이 되지 않는다 — fixture 를 새 커밋에 다시 세워야 0 이 된다. 고치는 방법이
// 다른 것을 한 목록에 넣으면 진단이 거짓말을 한다.
//
// **여기 없는 것과 갈라야 한다.** 처음 이 표를 세울 때 `figma/inventory-plan.json` ·
// `figma/product-highlight-hub.plan.json` · `migration/product.variants.json` 도 함께 넣었는데,
// 그 셋의 생성기는 fixture 가 아니라 **lock 을 읽는다**. 낡아 보인 것은 아직 다시 만들지
// 않아서였을 뿐이고, 실제로 다시 만드니 세 파일 다 새 앵커로 따라왔다(그 과정에서 제품이
// 배너 화살표를 지우고 어드민 토스트를 `AdminAlert` 로, 크레딧 내역을 표로 바꾼 것이
// 드러났다). **「낡아 보인다」와 「따라올 수 없다」는 다르다** — 생성기가 무엇을 읽는지
// 확인하지 않고 이 표에 넣으면 옮길 수 있는 것을 영구 면제로 굳힌다.
//
// **개수가 아니라 값으로 잠근다.** 파일당 개수만 세면 그 안의 핀이 아무 값으로나 바뀌어도
// 조용하다. 그래서 fixture 커밋을 여기 적고, 그 값과 다른 핀은 개수와 무관하게 실패시킨다.
const FIXTURE_COMMIT = "ae8fd6278481a5e86cd324ba86a1d44fe978b788";
const FIXTURE_AXIS = new Map([
  ["figma/app-screens.plan.json", 1],
  ["figma/product-app-shell.plan.json", 1],
  ["figma/product-checkout-status.plan.json", 1],
  ["figma/product-components.plan.json", 1],
  ["figma/product-payment-scenes.plan.json", 1],
  ["figma/product-sidebar-states.plan.json", 1],
  ["figma/product-upgrade-scene.plan.json", 1],
  ["migration/figma-board-composition.json", 1],
  ["migration/product.auth-fixture.json", 2],
  ["migration/product.rendered-components.json", 2],
  ["migration/product.sidebar-states.json", 1],
]);
// 한 방향 래칫. fixture 를 새 앵커에 세우면 이 표는 통째로 사라진다.
const FIXTURE_AXIS_RATCHET = 13;

// 어긋난 핀을 어떻게 되돌리는지. 생성물마다 만드는 명령이 다르므로 진단이 직접 말하게 한다.
const HOW_TO_REALIGN = new Map([
  [
    "migration/product.scenes.json",
    "`pnpm run measure-product-scenes` 로 다시 잰다. 다만 그 측정기는 지금 NOT_MEASURED 다 — " +
      "liveOnly 표본이 0개라 route 축까지 함께 멈춰 있다(원장 `scenes-gate-measures-nothing`).",
  ],
  [
    "migration/product.variable-modes.json",
    "build-figma-variable-source 측정기로 다시 뜬다. 제품을 브라우저에 올려 문맥별 해결값을 뽑는다.",
  ],
  [
    "figma/product-pricing-page.plan.json",
    "`pnpm run build-figma-product-pricing-page` 로 다시 만든다. 그 생성기는 이미 " +
      "장면 증거의 커밋을 lock 과 대조하고 멈춘다 — 즉 이 핀은 앞선 어긋남의 그림자다.",
  ],
  [
    "migration/product.measured.json",
    "이 파일은 손으로 쓴다. 핀을 앵커에 맞추기 전에 **파일 안의 모순부터 판정해야 한다** — " +
      "`productCommit` 은 086f4a62(2026-08-14)인데 같은 파일의 `$reanchoredNote` 는 " +
      "2026-08-30 에 기준선을 a7d045e3 로 옮겼다고 적고, lock 은 이제 5a67d692 를 고정한다. " +
      "세 값이 서로 다르다. 인용 187건이 실제로 어느 커밋에서 지켜지고 있는지는 " +
      "verify-product-evidence 가 lock 기준으로 재고 있으므로, 핀도 그쪽으로 모으는 것이 " +
      "일관되지만 그것은 소유자 판정이다.",
  ],
]);

const anchor = readAnchor();
const pins = collectPins();
const failures = [];

if (typeof anchor.commit !== "string" || !/^[0-9a-f]{40}$/.test(anchor.commit)) {
  failures.push(
    "정본 앵커를 읽지 못했습니다: " + anchor.source + " 의 productCommit 이 40자 커밋이 아닙니다.",
  );
}

const FIXTURE = { commit: FIXTURE_COMMIT, files: FIXTURE_AXIS };
const primary = compare(anchor.commit, pins, DECLARED_HISTORICAL_PINS, KNOWN_STALE, FIXTURE);
failures.push(...primary.found);

// 선언이 늘지 않았는지. 이것만은 compare 밖에 둔다 — 변조 canary 가 선언 목록을 흔들기 때문에
// 안에 두면 canary 가 자기 자신을 실패로 만든다.
if (MAX_DECLARED > DECLARED_RATCHET) {
  failures.push(
    "역사 기록으로 선언된 핀이 " + DECLARED_RATCHET + "개에서 " + MAX_DECLARED + "개로 늘었습니다. " +
      "이 목록은 줄어들기만 합니다 — 앵커를 따라오지 않을 이유가 새로 생겼다면 그것은 소유자 판정입니다.",
  );
}

// 낙후가 줄었으면 표를 내리라고 요구한다. 줄어든 자리를 비워 두면 그 자리에 다음 낙후가
// 조용히 들어온다 — baseline 을 쓰는 저장소가 전부 겪는 실패다.
for (const [file, allowed] of KNOWN_STALE) {
  const hit = primary.known.find((entry) => entry.file === file);
  const now = hit?.count ?? 0;
  if (now < allowed) {
    failures.push(
      "알려진 낙후가 " + allowed + "개에서 " + now + "개로 줄었습니다: " + file + ". " +
        "KNOWN_STALE 의 그 줄을 " + (now === 0 ? "지우세요" : now + " 로 내리세요") +
        " — 줄어든 자리를 비워 두면 다음 낙후가 조용히 그 자리에 들어옵니다.",
    );
  }
}

for (const [file, allowed] of FIXTURE_AXIS) {
  const hit = primary.onFixtureAxis.find((entry) => entry.file === file);
  const now = hit?.count ?? 0;
  if (now < allowed) {
    failures.push(
      "fixture 축 핀이 " + allowed + "개에서 " + now + "개로 줄었습니다: " + file + ". " +
        "FIXTURE_AXIS 의 그 줄을 " + (now === 0 ? "지우세요" : now + " 로 내리세요") +
        " — 줄어든 자리를 비워 두면 다음 낙후가 조용히 그 자리에 들어옵니다.",
    );
  }
}
const fixtureTotal = primary.onFixtureAxis.reduce((sum, entry) => sum + entry.count, 0);
if (fixtureTotal > FIXTURE_AXIS_RATCHET) {
  failures.push(
    "fixture 축 핀이 " + FIXTURE_AXIS_RATCHET + "개에서 " + fixtureTotal + "개로 늘었습니다. " +
      "이 표는 줄어들기만 합니다 — fixture 를 새 앵커에 세우면 통째로 사라집니다.",
  );
}

// ── 변조 canary ────────────────────────────────────────────────────────────
// 판정 기준은 「변조가 baseline 에 없던 실패를 새로 만드는가」다. 지금 이 게이트는 실제로
// 빨간 상태이므로(어긋난 핀 4파일), 이미 있는 실패에 canary 가 가려지지 않게 그 차이를 본다.
const baseline = new Set(failures);
const TAMPERS = [
  {
    label: "앵커가 움직인 것 — 따라오지 않은 핀이 새로 드러나야 한다",
    run: () => compare("0".repeat(40), pins, DECLARED_HISTORICAL_PINS, KNOWN_STALE, FIXTURE).found,
  },
  {
    label: "생성물의 핀이 아무 값으로나 바뀐 것",
    run: () =>
      compare(
        anchor.commit,
        [...pins, { file: "figma/tampered.plan.json", path: "/productCommit", key: "productCommit", value: "f".repeat(40) }],
        DECLARED_HISTORICAL_PINS,
        KNOWN_STALE,
        FIXTURE,
      ).found,
  },
  {
    label: "면제된 기록의 값이 바뀐 것 — 이름 면제가 아니라 값 면제여야 한다",
    run: () =>
      compare(
        anchor.commit,
        pins.map((pin) =>
          pin.file === DECLARED_HISTORICAL_PINS[0].file ? { ...pin, value: "e".repeat(40) } : pin,
        ),
        DECLARED_HISTORICAL_PINS,
        KNOWN_STALE,
        FIXTURE,
      ).found,
  },
  {
    label: "fixture 축 파일의 핀이 다른 커밋으로 바뀐 것 — 이름 면제가 아니라 값 면제여야 한다",
    run: () =>
      compare(
        anchor.commit,
        pins.map((pin) =>
          FIXTURE_AXIS.has(pin.file) && samePin(pin.value, FIXTURE_COMMIT)
            ? { ...pin, value: "d".repeat(40) }
            : pin,
        ),
        DECLARED_HISTORICAL_PINS,
        KNOWN_STALE,
        FIXTURE,
      ).found,
  },
  {
    label: "면제만 남고 그 핀이 사라진 것 — 죽은 선언이 남는다",
    run: () =>
      compare(
        anchor.commit,
        pins.filter((pin) => pin.file !== DECLARED_HISTORICAL_PINS[1].file),
        DECLARED_HISTORICAL_PINS,
        KNOWN_STALE,
        FIXTURE,
      ).found,
  },
];

for (const tamper of TAMPERS) {
  const introduced = tamper.run().filter((item) => !baseline.has(item));
  if (introduced.length === 0) {
    failures.push(
      baseline.size === 0
        ? "canary 가 변조를 잡지 못했습니다: " + tamper.label
        : "canary 의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: " + tamper.label,
    );
  }
}

for (const failure of failures) console.error("[product-anchor] " + failure);
if (failures.length > 0) {
  console.error(
    "[product-anchor] 정본 앵커는 " + anchor.source + " 의 " + String(anchor.commit).slice(0, 8) +
      " 입니다. **지금 앵커를 옮겨 이 게이트를 초록으로 만들지 마세요** — 앵커 재고정은 " +
      "제품 워킹트리가 깨끗할 때 lock 갱신과 한 커밋으로 하는 별건입니다.",
  );
  process.exit(1);
}
const staleTotal = primary.known.reduce((sum, entry) => sum + entry.count, 0);
if (fixtureTotal > 0) {
  // **초록이 「이 저장소가 한 제품을 잰다」로 읽히면 안 된다.** 지금은 둘을 잰다.
  console.log(
    "[product-anchor] fixture 축 " + fixtureTotal + "개가 " + FIXTURE_COMMIT.slice(0, 8) +
      " 에 남아 있습니다(" + primary.onFixtureAxis.map((e) => e.file + " " + e.count).join(" · ") +
      "). 이것들은 앵커 재고정으로 움직이지 않습니다 — `KLIPSE_PRODUCT_FIXTURE_ROOT` 의 clean 클론을 " +
      anchor.commit.slice(0, 8) + " 로 다시 세우고(clean 체크아웃 + standalone 빌드) " +
      "`KLIPSE_PRODUCT_FIXTURE_ROOT=... pnpm run measure-product-auth-fixture` 부터 다시 도세요.",
  );
}
if (staleTotal > 0) {
  // **초록이 「낙후가 없다」로 읽히면 안 된다.** 얼려 둔 것은 사실을 없앤 것이 아니라
  // 늘어나는 것만 잡기로 한 것이므로, 남은 수와 0 으로 만드는 방법을 매 실행 인쇄한다.
  console.log(
    "[product-anchor] 알려진 낙후 " + staleTotal + "개가 남아 있습니다(" +
      primary.known.map((entry) => entry.file + " " + entry.count).join(" · ") +
      "). **lock 을 다시 박는 것으로는 0 이 되지 않습니다** — 2026-09-03 재고정에서 넷 다 " +
      "그대로 남았고, 남은 이유가 넷 다 다릅니다. 파일별 되돌리는 법은 위 진단이 이름으로 " +
      "지목할 때 함께 인쇄됩니다(KNOWN_STALE 머리말도 같은 것을 적습니다).",
  );
}
console.log(
  "[product-anchor] OK (생성물 핀 " + pins.length + "개, 앵커 " + anchor.commit.slice(0, 8) +
    ", 역사 기록 선언 " + MAX_DECLARED + "개, 알려진 낙후 " + staleTotal + "개, 변조 canary " +
    TAMPERS.length + "종)",
);

function compare(canon, allPins, declared, allowance, fixture) {
  const found = [];
  const known = [];
  const onFixtureAxis = [];
  const used = new Set();
  const byFile = new Map();

  for (const pin of allPins) {
    const exempt = declared.find(
      (entry) => entry.file === pin.file && entry.path === pin.path && entry.value === pin.value,
    );
    if (exempt) {
      used.add(exempt);
      continue;
    }
    if (samePin(pin.value, canon)) continue;
    const list = byFile.get(pin.file) ?? [];
    list.push(pin);
    byFile.set(pin.file, list);
  }

  for (const [file, list] of [...byFile].sort((a, b) => a[0].localeCompare(b[0]))) {
    // fixture 축은 개수가 아니라 **값**으로 잠근다 — 그 커밋이 아닌 핀은 개수와 무관하게 실패다.
    const fixtureAllowed = fixture?.files.get(file) ?? 0;
    if (fixtureAllowed > 0) {
      const offAxis = list.filter((pin) => !samePin(pin.value, fixture.commit));
      if (offAxis.length > 0) {
        found.push(
          "fixture 축으로 선언된 파일에 그 커밋이 아닌 핀 " + offAxis.length + "개: " + file +
            " (" + offAxis.map((pin) => pin.path + " = " + pin.value.slice(0, 8)).join(", ") +
            " ≠ fixture " + fixture.commit.slice(0, 8) + "). 이 파일은 fixture 를 다시 세워야 " +
            "움직입니다 — 손으로 핀만 옮기면 원장이 없는 측정을 가리키게 됩니다.",
        );
      }
      const onAxis = list.length - offAxis.length;
      if (onAxis > fixtureAllowed) {
        found.push(
          "fixture 축 핀이 " + fixtureAllowed + "개에서 " + onAxis + "개로 늘었습니다: " + file +
            ". 새 생성물이 낡은 fixture 를 물었거나 선언이 낡았습니다.",
        );
      } else if (onAxis > 0) {
        onFixtureAxis.push({ file, count: onAxis, allowed: fixtureAllowed });
      }
      continue;
    }
    const allowed = allowance?.get(file) ?? 0;
    const message =
      "앵커를 따라오지 않은 핀 " + list.length + "개: " + file + " (" +
      list.map((pin) => pin.path + " = " + pin.value.slice(0, 8)).join(", ") +
      " ≠ 앵커 " + String(canon).slice(0, 8) + "). " +
      (HOW_TO_REALIGN.get(file) ??
        "생성물이라면 다시 만들고, 기록이라면 이 게이트의 DECLARED_HISTORICAL_PINS 에 사유와 함께 적으세요.");
    if (list.length <= allowed) {
      known.push({ file, count: list.length, allowed, message });
      continue;
    }
    found.push(
      message +
        (allowed > 0
          ? " **알려진 낙후 " + allowed + "개를 넘었습니다(" + list.length + "개).** 새로 어긋난 것이 있습니다."
          : ""),
    );
  }

  for (const entry of declared) {
    if (used.has(entry)) continue;
    found.push(
      "역사 기록으로 선언했는데 그런 핀이 없습니다: " + entry.file + entry.path + " = " +
        entry.value.slice(0, 8) + ". 파일이 바뀌었거나 선언이 낡았습니다 — 죽은 면제는 " +
        "다음에 그 자리에 들어올 어긋남을 조용히 통과시킵니다.",
    );
  }

  return { found, known, onFixtureAxis };
}
