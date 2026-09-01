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
      "2026-08-30 에 기준선을 a7d045e3 로 옮겼다고 적고, lock 은 ae8fd627 을 고정한다. " +
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

failures.push(...compare(anchor.commit, pins, DECLARED_HISTORICAL_PINS));

// 선언이 늘지 않았는지. 이것만은 compare 밖에 둔다 — 변조 canary 가 선언 목록을 흔들기 때문에
// 안에 두면 canary 가 자기 자신을 실패로 만든다.
if (MAX_DECLARED > DECLARED_RATCHET) {
  failures.push(
    "역사 기록으로 선언된 핀이 " + DECLARED_RATCHET + "개에서 " + MAX_DECLARED + "개로 늘었습니다. " +
      "이 목록은 줄어들기만 합니다 — 앵커를 따라오지 않을 이유가 새로 생겼다면 그것은 소유자 판정입니다.",
  );
}

// ── 변조 canary ────────────────────────────────────────────────────────────
// 판정 기준은 「변조가 baseline 에 없던 실패를 새로 만드는가」다. 지금 이 게이트는 실제로
// 빨간 상태이므로(어긋난 핀 4파일), 이미 있는 실패에 canary 가 가려지지 않게 그 차이를 본다.
const baseline = new Set(failures);
const TAMPERS = [
  {
    label: "앵커가 움직인 것 — 따라오지 않은 핀이 새로 드러나야 한다",
    run: () => compare("0".repeat(40), pins, DECLARED_HISTORICAL_PINS),
  },
  {
    label: "생성물의 핀이 아무 값으로나 바뀐 것",
    run: () =>
      compare(
        anchor.commit,
        [...pins, { file: "figma/tampered.plan.json", path: "/productCommit", key: "productCommit", value: "f".repeat(40) }],
        DECLARED_HISTORICAL_PINS,
      ),
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
      ),
  },
  {
    label: "면제만 남고 그 핀이 사라진 것 — 죽은 선언이 남는다",
    run: () =>
      compare(
        anchor.commit,
        pins.filter((pin) => pin.file !== DECLARED_HISTORICAL_PINS[1].file),
        DECLARED_HISTORICAL_PINS,
      ),
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
console.log(
  "[product-anchor] OK (생성물 핀 " + pins.length + "개가 앵커 " + anchor.commit.slice(0, 8) +
    " 하나로 모여 있음, 역사 기록 선언 " + MAX_DECLARED + "개, 변조 canary " + TAMPERS.length + "종)",
);

function compare(canon, allPins, declared) {
  const found = [];
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
    found.push(
      "앵커를 따라오지 않은 핀 " + list.length + "개: " + file + " (" +
        list.map((pin) => pin.path + " = " + pin.value.slice(0, 8)).join(", ") +
        " ≠ 앵커 " + String(canon).slice(0, 8) + "). " +
        (HOW_TO_REALIGN.get(file) ??
          "생성물이라면 다시 만들고, 기록이라면 이 게이트의 DECLARED_HISTORICAL_PINS 에 사유와 함께 적으세요."),
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

  return found;
}
