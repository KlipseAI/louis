#!/usr/bin/env node
// DS 기록의 `$` 주석이 **인용한 토큰이 실재하고 값이 맞는지** 확인한다.
//
// 기록의 값은 셋 중 하나로 정당화된다 — ① 제품 렌더와 대조되거나 ② `$키` 주석이 왜 그 값인지
// 적거나 ③ 빚 명부에 있거나. `measure-product-components.mjs`가 그 셋 중 하나임을 강제한다.
// **그런데 ②의 내용이 참인지는 아무도 보지 않았다.** 주석은 산문이라 무엇을 적어도 통과했다.
//
// 2026-08-30 감사에서 그 구멍이 드러났다. `ddc333a`가 컨트롤 계단을 개명하면서(구 md → lg ·
// 구 sm → md) **값은 옮겼는데 사유 문장은 그대로 두었다.** 그 결과:
//
//   input.sizes.lg.$height        "layout-control-height-md 40"   ← 40은 이제 -lg 다
//   icon-button.sizes.md.$height  "layout-control-height-sm 32"   ← 그런 토큰은 없다
//   input.sizes.md.$paddingInline "space-control-sm 12"           ← space-control-sm 은 8 이다
//   avatar.sizes.md.$radius       "radius-full 999"               ← 이름은 radius-pill 이다
//
// 24건이 이런 상태였다. 값이 기계 대조를 받지 않는 축일수록 주석이 유일한 근거인데, 그 근거가
// 존재하지 않는 이름을 가리키고 있었다. **읽는 사람이 확인할 수 없는 근거는 근거가 아니다.**
//
// 두 가지를 실패로 만든다.
//   없는 이름  토큰처럼 생긴 이름을 인용했는데 그런 토큰이 없다. 계단 이름 무리(`-lg`/`-md`)의
//              한 칸을 가리키는 것도 여기 걸린다.
//   틀린 값    `"<토큰> <숫자>"` 꼴로 적었는데 그 토큰의 실제 값이 그 숫자가 아니다.
//   틀린 주장  **산문 한가운데**에서 토큰의 값을 틀리게 말한다. 시작 형태만 보던 때,
//              토큰을 4 로 내려놓고 같은 사유에 "그 토큰은 아직 12" 라고 남긴 채 통과했다.
//
// 산문이 계열 이름만 부르는 것(`typography-body-sm`처럼 실제 토큰들의 접두사)은 통과시킨다 —
// 그건 오기가 아니라 무리를 가리키는 정상적인 말이다.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokensCss = readFileSync(resolve(repoRoot, "packages/tokens/generated/tokens.css"), "utf8");

// 토큰 이름 → 값. 같은 이름이 테마별로 여러 번 나오면 처음 것을 쓴다 — 기하 토큰은 테마를 타지
// 않고, 색은 아래 FAMILIES가 보지 않는다.
const TOKENS = new Map();
for (const match of tokensCss.matchAll(/^\s*--louis-([a-z0-9-]+):\s*(.+);\s*$/gm)) {
  if (!TOKENS.has(match[1])) TOKENS.set(match[1], match[2].trim());
}
if (TOKENS.size === 0) {
  console.error("[record-citations] tokens.css에서 토큰을 한 개도 읽지 못했습니다.");
  process.exit(1);
}

// 볼 계열. 색과 타이포 값은 각자 다른 게이트가 보고, 여기서는 **기하·모션**만 본다 —
// 계단 개명이 실제로 망가뜨린 곳이 거기다.
const FAMILIES = ["layout", "space", "radius", "border-width", "icon-size", "motion", "elevation", "blur"];
const NAME = new RegExp(String.raw`\b((?:${FAMILIES.join("|")})-[a-z0-9-]+)\b`, "g");

// 그 이름이 정말 토큰인가, 아니면 토큰 무리를 부르는 계열 이름인가.
const isFamilyPrefix = (name) => {
  for (const key of TOKENS.keys()) if (key.startsWith(name + "-")) return true;
  return false;
};

/** 스칼라 토큰의 수. **그림자·그라디언트처럼 여러 값이 든 토큰은 null 이다** —
 * `elevation-toast`(`0px 8px 20px … `)를 `parseFloat` 로 읽으면 0 이 되어, 산문이 그 옆에
 * 적은 아무 수와 「다르다」고 거짓 실패를 낸다. 수 하나에 단위가 붙은 형태만 비교한다. */
const numberOf = (value) => {
  if (typeof value !== "string") return null;
  if (!/^-?\d+(?:\.\d+)?(?:px|ms|%|rem|em)?$/.test(value.trim())) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** 한 덩어리의 산문에서 토큰 인용을 검사한다 — 기록의 `$` 주석과 규범 markdown 이 공유한다.
 *
 * **왜 markdown 도 보는가.** 이 게이트는 원래 `figma/components.measured.json` 의 `$` 주석만
 * 봤다. 그런데 2026-08-31 에 DS-D-0032 가 `control-height-sm` 을 24 로 열자, DS-D-0027 의
 * 개명(구 md 40 → lg · 구 sm 32 → md)이 전파되지 않은 **규범 markdown 다섯 줄**이 갑자기
 * 「있는 토큰을 틀린 값으로」 가리키게 됐다. 어제까지는 없는 이름이라 무해했던 문장이다.
 *
 * 그때 어느 게이트도 그것을 잡지 못했다 — 기록은 보는데 규범은 안 봤기 때문이다.
 * 규범이 기록보다 더 많이 읽히는데도 검사가 없었다.
 */
export function auditText(value, where, failures, checked, { requireExists = true, strict = false } = {}) {
  if (requireExists) for (const match of value.matchAll(NAME)) {
    const name = match[1].replace(/[.,)]+$/, "");
    if (!TOKENS.has(name)) {
      if (isFamilyPrefix(name)) continue;
      failures.push(
        where + ': 존재하지 않는 토큰 "' + name + '"을 인용합니다.',
      );
      continue;
    }
    checked.push(where + " → " + name);
  }

  for (const near of value.matchAll(NAME)) {
    const cited = near[1].replace(/[.,)]+$/, "");
    if (!TOKENS.has(cited)) continue;
    const window = value.slice(near.index + near[1].length, near.index + near[1].length + 25);
    // **숫자 안의 소수점에서 끊지 않는다.** 예전 경계는 `0.5px` 를 `0` 으로 잘라
    // 「border-width-hairline 이 0 이라고 말한다」는 거짓 실패를 냈다.
    const bounded = /^(?:[^.,()]|\.(?=\d))*/.exec(window)[0];
    // **산문에서는 「바로 붙은 값」만 주장으로 본다.** 기록의 `$` 주석은 `"<토큰> <값>"`
    // 관례가 있어 창을 넓게 둬도 됐지만, 규범 산문에서는 「`radius-control`은 **32**에서 …」
    // 처럼 토큰 옆 수가 그 토큰의 값이 **아닌** 일이 흔하다(그 32는 버튼 높이다).
    // 조사·연결어가 끼면 주장이 아니라고 본다 — 공백·`=`·`:`·백틱만 사이에 허용한다.
    const claim = strict
      ? /^[\s=:`]{0,4}(-?\d+(?:\.\d+)?)\s*(?:px|ms|%)?/.exec(bounded)
      : /^[^0-9]{0,12}?(-?\d+(?:\.\d+)?)\s*(?:px|ms|%)?/.exec(bounded);
    if (!claim) continue;
    const tokenValue = numberOf(TOKENS.get(cited));
    const claimed = numberOf(claim[1]);
    if (tokenValue === null || claimed === null) continue;
    if (tokenValue !== claimed) {
      failures.push(
        where + ': "' + cited + " … " + claim[1] + '" 라고 말하는데 그 토큰의 값은 ' +
          TOKENS.get(cited) + " 입니다.",
      );
    }
  }
}

export function auditRecord(components) {
  const failures = [];
  const checked = [];

  const walk = (node, path) => {
    if (node === null || typeof node !== "object" || Array.isArray(node)) return;
    for (const [key, value] of Object.entries(node)) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        walk(value, [...path, key]);
        continue;
      }
      if (!key.startsWith("$") || typeof value !== "string") continue;
      const where = [...path, key].join(".");
      const sibling = node[key.slice(1)];

      for (const match of value.matchAll(NAME)) {
        const name = match[1].replace(/[.,)]+$/, "");
        if (!TOKENS.has(name)) {
          if (isFamilyPrefix(name)) continue; // 계열 이름이다 — 오기가 아니다
          failures.push(
            where + ': 존재하지 않는 토큰 "' + name + '"을 인용합니다. ' +
              "사유의 근거가 확인할 수 없는 이름을 가리킵니다.",
          );
          continue;
        }
        checked.push(where + " → " + name);
      }

      // **산문 한가운데의 값 주장도 본다.** 시작 형태만 보던 때, 나는 토큰을 4 로 내려놓고
      // 같은 사유에 "DS 토큰 layout-project-grid-gap 은 **아직 12**" 라고 남겼다 — 한 변경
      // 안에서 값과 산문이 갈렸고 게이트는 통과했다(2026-08-30). 토큰 이름 뒤 25자 안에
      // 처음 나오는 수는 그 토큰에 대한 주장으로 본다. 창을 좁게 두는 것은 "이 토큰을 쓰는
      // 3곳" 같은 무관한 수를 끌어들이지 않기 위해서다.
      for (const near of value.matchAll(NAME)) {
        const cited = near[1].replace(/[.,)]+$/, "");
        if (!TOKENS.has(cited)) continue;
        // **문장·괄호 경계를 넘지 않는다.** `24(radius-overlay-lg). 20을 쓰던 이유가…` 처럼
        // 값이 이름 **앞**에 오는 괄호 인용에서는 뒤의 수가 그 토큰의 값이 아니다. 경계
        // 문자를 만나기 전에 나오는 수만 그 토큰에 대한 주장으로 본다.
        const window = value.slice(near.index + near[1].length, near.index + near[1].length + 25);
        // **숫자 안의 소수점에서 끊지 않는다.** 예전 경계(`[^.,()]*`)는 `0.5px` 를 `0` 으로
        // 잘라 「border-width-hairline 이 0 이라고 말한다」는 거짓 실패를 냈다. 문장을 끝내는
        // 점만 경계로 보고, 뒤에 숫자가 오는 점은 수의 일부로 본다.
        const bounded = /^(?:[^.,()]|\.(?=\d))*/.exec(window)[0];
        // **산문에서는 「바로 붙은 값」만 주장으로 본다.** 기록의 `$` 주석은
        // `"<토큰> <값>"` 관례가 있어 창을 넓게 둬도 됐지만, 규범 산문에서는
        // 「`radius-control`은 **32**에서 …」처럼 토큰 옆 수가 그 토큰의 값이 **아닌** 일이
        // 흔하다(그 32는 버튼 높이다). 조사·연결어가 끼면 주장이 아니라고 본다 —
        // 공백·`=`·`:`·백틱만 사이에 허용한다.
        const claim = /^[^0-9]{0,12}?(-?\d+(?:\.\d+)?)\s*(?:px|ms|%)?/.exec(bounded);
        if (!claim) continue;
        const tokenValue = numberOf(TOKENS.get(cited));
        const claimed = numberOf(claim[1]);
        if (tokenValue === null || claimed === null) continue;
        if (tokenValue !== claimed) {
          failures.push(
            where + ': 산문이 "' + cited + " … " + claim[1] + '" 라고 말하는데 그 토큰의 값은 ' +
              TOKENS.get(cited) + " 입니다.",
          );
        }
      }

      // `"<토큰> <숫자>"` 로 시작하는 주석은 그 숫자가 토큰의 값이어야 한다.
      const leading = /^([a-z0-9-]+)\s+(-?[\d.]+)\b/.exec(value);
      if (!leading) continue;
      const [, name, stated] = leading;
      if (!TOKENS.has(name)) continue; // 위에서 이미 잡혔거나 계열 이름이다
      const tokenValue = numberOf(TOKENS.get(name));
      const statedValue = numberOf(stated);
      if (tokenValue === null || statedValue === null) continue;
      if (tokenValue !== statedValue) {
        failures.push(
          where + ': "' + name + " " + stated + '"라고 적었는데 그 토큰의 값은 ' +
            TOKENS.get(name) + " 입니다.",
        );
        continue;
      }
      // 주석이 값을 옳게 적었으면, 그 값이 기록된 실제 값과도 같아야 한다.
      const siblingValue = typeof sibling === "number" ? sibling : null;
      if (siblingValue !== null && siblingValue !== statedValue) {
        failures.push(
          where + ': 사유는 "' + name + " " + stated + '"인데 기록된 값은 ' + siblingValue + " 입니다.",
        );
      }
    }
  };

  for (const [name, spec] of Object.entries(components)) walk(spec, [name]);
  return { failures, checked };
}

/** 표 행에서 「값 칸 ↔ 토큰 칸」을 대조한다.
 *
 * **왜 따로 필요한가.** 값 주장 검사는 토큰 **뒤**만 본다. 그런데 이 저장소의 규범 표는
 * 값을 먼저 쓰고 근거 토큰을 뒤에 쓴다:
 *
 *     | 행 높이 | 32px | `layout-control-height-md` |
 *
 * DS-D-0027 개명이 새어 나간 다섯 줄이 **정확히 이 모양**이었다. 뒤만 보는 검사로는
 * 하나도 잡지 못한다 — 실제로 2026-08-31 에 이 검사를 붙이기 전 재현 실험에서 통과했다.
 *
 * 칸이 **딱 하나의 스칼라**이고 다른 칸이 **딱 하나의 토큰 인용**일 때만 본다. 그보다
 * 복잡한 행(값 둘 · 토큰 둘의 대응)은 위치를 추측해야 하므로 건드리지 않는다.
 */
function auditTableRow(line, where, failures) {
  if (!line.trimStart().startsWith("|")) return;
  const cells = line.split("|").slice(1, -1).map((c) => c.trim());
  if (cells.length < 2) return;

  const scalars = [];
  const tokens = [];
  cells.forEach((cell, i) => {
    const bare = /^(-?\d+(?:\.\d+)?)\s*(px|ms|%)?$/.exec(cell.replace(/\*\*/g, ""));
    if (bare) scalars.push({ i, value: Number.parseFloat(bare[1]) });
    const cited = [...cell.matchAll(/`(?:--louis-)?([a-z0-9-]+)`/g)]
      .map((m) => m[1])
      .filter((n) => TOKENS.has(n));
    if (cited.length === 1 && cell.replace(/`[^`]*`/g, "").trim() === "") {
      tokens.push({ i, name: cited[0] });
    }
  });
  if (scalars.length !== 1 || tokens.length !== 1) return;

  const tokenValue = numberOf(TOKENS.get(tokens[0].name));
  if (tokenValue === null) return;
  if (tokenValue !== scalars[0].value) {
    failures.push(
      where + ': 표가 값 ' + scalars[0].value + ' 의 근거로 "' + tokens[0].name +
        '" 을 드는데 그 토큰의 값은 ' + TOKENS.get(tokens[0].name) + " 입니다.",
    );
  }
}

/** 규범 markdown 을 훑는다.
 *
 * **제외 두 곳.** `design/llms/` 는 생성물이라 원본에서 이미 본다.
 * `design/updates/` 는 갱신 로그다 — 과거 항목은 **그 시점의 기록**이고, 그때는 참이었다.
 * 그것을 현재 값으로 고치면 「무엇이 언제 바뀌었나」가 지워진다(이 저장소가 이미 정한 규칙).
 */
export function auditDocs(root) {
  const failures = [];
  const checked = [];
  const skip = [resolve(root, "design/llms"), resolve(root, "design/updates")];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (skip.some((s) => full === s)) continue;
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      const text = readFileSync(full, "utf8");
      const rel = full.slice(root.length + 1);
      text.split("\n").forEach((line, i) => {
        // **백틱 안만 본다.** 산문은 토큰이 아닌 것을 토큰처럼 생긴 말로 부른다 —
        // `justify-content: space-between` 의 `space-between`, motion lifecycle 이름
        // `layout-change`, `animation` 값 `motion-loop`, Tailwind 클래스 `rounded-12`.
        // 이 문서들이 **토큰을 인용할 때는 백틱**을 쓴다(`layout-control-height-md`).
        // 그 관례로 좁히지 않으면 오탐이 실탐을 덮는다 — 넓게 켰을 때 94건 중 대부분이
        // 그런 말이었다.
        // **존재 검사는 끄고 값 주장만 본다.** 산문의 백틱은 토큰만이 아니라 CSS 값
        // (`space-between`) · Tailwind 변형(`motion-reduce`) · lifecycle 이름
        // (`layout-change`) 도 감싼다. 그 셋을 「없는 토큰」이라 부르면 오탐이 실탐을 덮는다
        // (넓게 켰을 때 94건 중 대부분이 그런 말이었다).
        //
        // 값 주장 검사는 이름이 **실재하는 토큰일 때만** 발화하므로 오탐이 없다. 그리고
        // 그것이 DS-D-0027 개명이 규범에 안 퍼진 것을 실제로 잡아낸 검사다.
        //
        // **줄 전체를 넘긴다.** 백틱 안쪽만 넘기면 `` `radius-control` 32px `` 처럼 숫자가
        // 백틱 밖에 있는 주장이 잘려 나가 아무것도 못 잡는다.
        auditText(line, rel + ":" + (i + 1), failures, checked, { requireExists: false, strict: true });
        auditTableRow(line, rel + ":" + (i + 1), failures);
      });
    }
  };
  walk(resolve(root, "design"));
  return { failures, checked };
}

const recordPath = resolve(repoRoot, "figma/components.measured.json");
const record = JSON.parse(readFileSync(recordPath, "utf8"));
const { failures, checked } = auditRecord(record.components);

// 규범 markdown 도 같은 잣대로 본다.
const docs = auditDocs(repoRoot);
failures.push(...docs.failures);

// **이 게이트가 무엇을 잡는지 스스로 증명한다.** 변조가 없던 실패를 새로 만들어야 한다.
if (!process.argv.includes("--no-canary")) {
  const baseline = new Set(failures);
  const TAMPERS = [
    [
      "없는 토큰 이름으로 바꾸기",
      (components) => {
        const clone = structuredClone(components);
        clone.button.sizes.md.$radius = "radius-control-xl 12";
        return clone;
      },
    ],
    [
      "토큰은 맞는데 값을 틀리게 적기",
      (components) => {
        const clone = structuredClone(components);
        clone.button.sizes.md.$radius = "radius-control 999";
        return clone;
      },
    ],
    [
      "산문 한가운데에서 값을 틀리게 말하기",
      (components) => {
        const clone = structuredClone(components);
        // 시작 형태는 그대로 두고 문장 안에서만 거짓을 말한다 — 앞의 두 카나리아가
        // 잡지 못하는 자리이며, 2026-08-30 에 내가 실제로 저지른 형태다.
        clone.button.sizes.md.$radius = "radius-control 12. 그런데 radius-control 은 아직 999 다";
        return clone;
      },
    ],
  ];
  // **산문 경로의 검출력도 증명한다.** 위 셋은 JSON 기록만 변조한다. markdown 을 보는
  // 검사가 실제로 무언가를 잡는지는 따로 보여야 한다 — 안 그러면 「초록인데 아무것도 안 보는」
  // 게이트가 된다. 2026-08-31 에 이 검사가 없어서 DS-D-0027 개명이 규범 다섯 줄에 안 퍼진 것을
  // 아무도 잡지 못했다.
  {
    const proseFailures = [];
    const proseChecked = [];
    auditText(
      "행 높이는 `layout-control-height-md` 999px 이다",
      "canary",
      proseFailures,
      proseChecked,
      { requireExists: false, strict: true },
    );
    if (proseFailures.length === 0) {
      failures.push("canary가 산문의 틀린 값 주장을 잡지 못했습니다.");
    }
    // 반대 방향 — 조사가 끼면 주장이 아니라고 봐야 한다(오탐 canary).
    const falsePositive = [];
    auditText(
      "`radius-control`은 32에서 완전한 원이 된다",
      "canary",
      falsePositive,
      [],
      { requireExists: false, strict: true },
    );
    if (falsePositive.length > 0) {
      failures.push("canary: 산문 검사가 주장이 아닌 수를 주장으로 읽습니다 — 오탐이 실탐을 덮습니다.");
    }
  }

  for (const [label, mutate] of TAMPERS) {
    const introduced = auditRecord(mutate(record.components)).failures.filter((f) => !baseline.has(f));
    if (introduced.length === 0) {
      failures.push(
        baseline.size === 0
          ? "canary가 변조를 잡지 못했습니다: " + label
          : "canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: " + label,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("[record-citations] 사유가 인용한 토큰이 틀린 곳 " + failures.length + "건입니다:");
  for (const failure of failures) console.error("[record-citations]   " + failure);
  process.exit(1);
}

console.log(
  "[record-citations] 기록의 `$` 사유 " + checked.length + "건과 규범 markdown 의 토큰 값 주장이 " +
    "**실재하고 값이 맞습니다** (canary 5종 통과).",
);
