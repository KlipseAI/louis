import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { productFontFace } from "./lib/product-font.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// **표본을 부모 문맥 없이 재면 값이 틀린다.**
//
// 표본은 빈 block div에 홀로 담겨 측정됐다. 그런데 제품에서 이 부품들은 flex 행 안에 있고,
// flex 자식이 되면 inline 요소가 blockify되어 높이가 `여백 + 인라인상자`에서 `여백 + 행간상자`로
// 바뀐다. 폭도 부모가 늘여 주느냐 아니냐로 갈린다.
//
// 2026-08-20에 owner가 제품에서 직접 재서 잡았다 — 플랜 배지가 22인데 18로, 예정 칩이 24인데
// 20으로 기록돼 있었다. 나는 그 값을 "실측"이라고 불렀다. 재지 않은 것을 잰 것처럼 말한 것이고,
// 이 저장소가 막으려는 실패 그대로다.
//
// 그래서 기계가 판정한다. 표본마다 ① 지금 담기는 자리와 ② flex 행 안에 각각 담아 재고,
// 값이 달라지면 그 표본은 문맥이 결과를 바꾸는 것이므로 `host`를 선언해야 한다.
// `host`가 있으면 그 문맥으로 재므로 두 값이 같아진다 — 그때 이 게이트가 통과한다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref } = resolveProductRef();

const specimenPath = resolve(repoRoot, "figma/product-specimens.json");
const variantsPath = resolve(repoRoot, "migration/product.variants.json");
if (!existsSync(specimenPath) || !existsSync(variantsPath)) {
  console.error("[specimen-context] 표본이나 측정 결과가 없습니다.");
  process.exit(1);
}
if (!existsSync(resolve(productRoot, ".git"))) {
  console.log("[specimen-context] SKIPPED (제품 저장소 없음: " + productRoot + ").");
  process.exit(0);
}

const git = (args) =>
  execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const commit = git(["rev-parse", ref]).trim();
const specimenFile = JSON.parse(readFileSync(specimenPath, "utf8"));
const measured = JSON.parse(readFileSync(variantsPath, "utf8"));
const hostOf = new Map(specimenFile.specimens.map((s) => [s.id, s.host ?? null]));
// `host: []` + `hostNone` = 크기를 바꾸는 부모가 없음을 **확인한** 것이다.
// 선언 자체가 없는 것(`host` 미지정)과 다르다 — 후자는 아직 아무도 안 본 상태다.
const noneOf = new Map(specimenFile.specimens.map((s) => [s.id, (s.hostNone ?? "").trim()]));

const css = [
  productFontFace(productRoot, commit),
  git(["show", commit + ":apps/web/app/globals.css"]),
].join("\n");

const render = (node) => {
  const tag = node.tag ?? "div";
  const cls = String(node.classes ?? "").replace(/"/g, "&quot;");
  const kids = node.children ?? [];
  return (
    "<" + tag + ' class="' + cls + '">' +
    (kids.length ? kids.map(render).join("") : (node.text ?? "")) +
    "</" + tag + ">"
  );
};

const browser = await chromium.launch();
const failures = [];
let checked = 0;
let hosted = 0;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const spec of measured.specimens) {
    const inner = render(spec.tree);
    if (!inner.includes('class="')) continue;
    checked += 1;
    const declared = hostOf.get(spec.id);
    if (declared === null) {
      failures.push({ id: spec.id, plain: "-", flex: "host 선언 자체가 없음" });
      continue;
    }
    if (declared.length > 0) { hosted += 1; continue; }
    if (noneOf.get(spec.id)) { hosted += 1; continue; } // 없음을 확인하고 사유를 적었다
    await page.setContent(
      '<!doctype html><html data-theme="dark"><head><style>' + css + "</style></head><body>" +
        '<div id="plain" style="position:relative;width:420px;padding:24px">' + inner + "</div>" +
        '<div id="flex" style="position:relative;width:420px;padding:24px;display:flex;align-items:center">' +
        inner + "</div></body></html>",
      { waitUntil: "load" },
    );
    const box = await page.evaluate(() => {
      const pick = (id) => {
        const el = document.getElementById(id).firstElementChild;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return [Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100];
      };
      return { plain: pick("plain"), flex: pick("flex") };
    });
    if (!box.plain || !box.flex) continue;
    if (box.plain[0] !== box.flex[0] || box.plain[1] !== box.flex[1]) {
      failures.push({
        id: spec.id,
        plain: box.plain.join("×"),
        flex: box.flex.join("×"),
      });
    }
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(
    "[specimen-context] 부모 문맥에 따라 값이 달라지는 표본 " + failures.length + "건입니다. " +
      "`figma/product-specimens.json`의 해당 표본에 제품의 실제 부모 클래스를 `host`로 적으세요 — " +
      "문맥 없이 잰 값은 실측이 아닙니다.",
  );
  for (const f of failures.slice(0, 40)) {
    console.error("[specimen-context]   " + f.id.padEnd(40) + f.plain.padEnd(16) + "→ flex 안에서는 " + f.flex);
  }
  if (failures.length > 40) console.error("[specimen-context]   … 외 " + (failures.length - 40) + "건");
  process.exit(1);
}

console.log(
  "[specimen-context] OK @ " + commit.slice(0, 8) + ": 표본 " + checked + "종 · host 선언됨 " + hosted +
    " · 문맥이 결과를 바꾸는 표본 없음",
);
