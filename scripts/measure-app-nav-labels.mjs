import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// **라우트 이름에서 라벨을 유추하면 틀린다.** `/archive`의 라벨은 「보관함」이 아니라 「홈」이다.
//
// 2026-08-21에 app-shell-parts.md가 네 곳에서 「보관함」이라고 적고 있었다. 경로만 보고 지은
// 이름이었고, 배포본에는 그런 라벨이 없다. 라벨은 「화면의 이름」이라고 그 문서가 규범으로
// 적어 두었으므로, 틀린 이름은 규칙을 타고 화면 전체로 번진다.
//
// 라벨은 문서가 소유할 값이 아니라 **제품이 소유한 값**이다. 여기서 배포본에서 뽑아 고정한다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref } = resolveProductRef();
const check = process.argv.includes("--check");
const git = (a) => execFileSync("git", ["-C", productRoot, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const commit = git(["rev-parse", ref]).trim();

const SOURCES = {
  ko: "apps/web/components/landing/system/messages/ko.ts",
  en: "apps/web/components/landing/system/messages/en.ts",
};

// `appNav: { ... }` 블록만 떼어 낸다. 중괄호 깊이로 끝을 찾는다 — 정규식으로 자르면
// 안쪽 객체에서 먼저 끊긴다.
function readAppNav(path) {
  const text = git(["show", commit + ":" + path]);
  const start = text.indexOf("appNav:");
  if (start < 0) throw new Error(path + "에 appNav 블록이 없습니다.");
  const open = text.indexOf("{", start);
  let depth = 0;
  let end = -1;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end < 0) throw new Error(path + "의 appNav 블록이 닫히지 않습니다.");
  const body = text.slice(open + 1, end);
  const lineOf = (index) => text.slice(0, index).split("\n").length;
  const out = {};
  // 문자열 리터럴 라벨만 담는다. 함수·템플릿은 화면 이름이 아니다.
  for (const m of body.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/gm)) {
    out[m[1]] = { value: m[2], line: lineOf(open + 1 + m.index) + body.slice(0, m.index).split("\n").length - 1 };
  }
  return { out, blockLine: lineOf(start) };
}

const ko = readAppNav(SOURCES.ko);
const en = readAppNav(SOURCES.en);

// **경로 대응은 제품이 소유한다.** 처음에 이 스크립트가 라우트를 손으로 적었는데 틀렸다 —
// `analytics`를 `/analytics`라고 적었지만 실제는 `/analytics/youtube`·`/analytics/instagram`
// 둘이고, `explore`는 앱 내비에 아예 없다. 제품이 `appNavItemLabels`로 대응을 직접 선언하므로
// 그것을 읽는다. 유추하지 않는다.
const GNB = "apps/web/components/navigation/Gnb.tsx";
const APP_PATHS = "apps/web/lib/app-paths.ts";

const gnbText = git(["show", commit + ":" + GNB]);
const navStart = gnbText.indexOf("appNavItemLabels");
if (navStart < 0) {
  console.error("[app-nav-labels] " + GNB + "에 appNavItemLabels가 없습니다.");
  process.exit(1);
}
const navOpen = gnbText.indexOf("({", navStart);
const navClose = gnbText.indexOf("}),", navOpen);
if (navOpen < 0 || navClose < 0) {
  console.error("[app-nav-labels] appNavItemLabels 블록을 자를 수 없습니다.");
  process.exit(1);
}
const navBody = gnbText.slice(navOpen + 2, navClose);
const navLine = gnbText.slice(0, navStart).split("\n").length;

// 상수로 적힌 경로(`[NODE_CANVAS_HUB_PATH]:`)를 정의에서 해결한다.
const pathsText = git(["show", commit + ":" + APP_PATHS]);
const constants = new Map();
for (const m of pathsText.matchAll(/export const ([A-Z_][A-Z0-9_]*)\s*=\s*"([^"]+)"/g)) {
  constants.set(m[1], m[2]);
}

const labels = [];
for (const m of navBody.matchAll(
  /(?:"([^"]+)"|\[([A-Za-z_][A-Za-z0-9_]*)\])\s*:\s*messages\.appNav\.([A-Za-z0-9]+)\s*,/g,
)) {
  const literal = m[1];
  const constName = m[2];
  const key = m[3];
  let route = literal;
  if (!route) {
    route = constants.get(constName);
    if (!route) {
      console.error("[app-nav-labels] 상수를 해결하지 못했습니다: " + constName);
      process.exit(1);
    }
  }
  if (!ko.out[key] || !en.out[key]) {
    console.error("[app-nav-labels] 라벨이 messages에 없습니다: " + key);
    process.exit(1);
  }
  const tail = route.replace(/^.*\//, "");
  labels.push({
    key,
    route,
    routeSource: literal ? "리터럴" : constName + " (" + APP_PATHS + ")",
    ko: ko.out[key].value,
    en: en.out[key].value,
    // 경로 마지막 조각과 영문 라벨이 다르면 「유추하면 틀리는」 자리다.
    inferable: en.out[key].value.toLowerCase().replace(/\s+/g, "") === tail.toLowerCase(),
  });
}
if (labels.length === 0) {
  console.error("[app-nav-labels] 내비 항목을 하나도 읽지 못했습니다.");
  process.exit(1);
}

// 사이드바 바닥 CTA는 라우트 대응표에 없다 — 같은 자리를 archive와 upgrade가 나눠 쓴다.
const cta = ["archive", "upgrade"]
  .filter((k) => ko.out[k] && en.out[k])
  .map((k) => ({ key: k, ko: ko.out[k].value, en: en.out[k].value }));

const output = {
  $comment: "생성물. scripts/measure-app-nav-labels.mjs가 배포본에서 뽑는다. 직접 수정하지 않는다.",
  $whyThisExists:
    "`/archive`의 라벨은 「보관함」이 아니라 「홈」이다. 2026-08-21에 app-shell-parts.md가 네 곳에서 경로로부터 유추한 이름을 적고 있었고, 그 문서는 「라벨은 화면의 이름이다」를 규범으로 두므로 틀린 이름이 규칙을 타고 번진다. 라벨은 제품이 소유한 값이라 여기서 고정한다.",
  $howToRead:
    "inferable이 false면 **경로에서 라벨을 유추할 수 없다는 뜻**이다. 그런 자리를 문서가 손으로 적으면 틀린다.",
  productRef: ref,
  productCommit: commit,
  sources: { ...SOURCES, gnb: GNB, appPaths: APP_PATHS },
  gnbNavMapLine: navLine,
  labels,
  sidebarCtaLabels: cta,
};

const path = resolve(repoRoot, "migration/app-nav-labels.json");
const body = JSON.stringify(output, null, 2) + "\n";
const notInferable = labels.filter((l) => !l.inferable).length;
const line = `내비 ${labels.length}개 · 경로로 유추 불가 ${notInferable}개 · 바닥 CTA ${cta.length}개 @ ${commit.slice(0, 8)}`;
if (check) {
  const current = execFileSync("cat", [path], { encoding: "utf8" });
  if (current !== body) {
    console.error("[app-nav-labels] 기록이 배포본과 다릅니다. 다시 뽑아 갱신하세요.");
    process.exit(1);
  }
  console.log("[app-nav-labels] checked: " + line);
} else {
  atomicWriteBatch([{ absolute: path, expected: body }]);
  console.log("[app-nav-labels] built: " + line);
}
