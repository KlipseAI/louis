#!/usr/bin/env node
// design 문서가 인용하는 제품 좌표가 **배포본에 실재하는지** 확인한다.
//
// 2026-08-21 감사에서 이식번들의 인용 좌표 124건이 낡은 것으로 드러났다 — 사실은 맞는데 제품이
// 움직여 줄이 밀렸다. KDS는 blob 해시 락으로 그것을 잡게 되어 있었는데, 락이
// `product.measured.json`이 인용한 파일만 고정하고 **산문이 인용한 파일은 안 보고 있었다.**
//
// 세 가지를 실패로 만든다.
//   모호   제품에 같은 이름 파일이 여럿인데 경로 없이 인용했다.
//          (`Gnb.tsx`는 제품에 셋이다 — navigation · landing/navigation · demo-snapshots/StaticGnb)
//   부재   그 파일이 배포본에 없거나, 인용한 줄이 파일 길이를 넘는다.
//   비고정 그 파일이 evidence lock에 없다 — 제품이 바꿔도 아무도 모른다.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectDocCitations, resolveCitation } from "./lib/doc-citations.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const lock = JSON.parse(
  readFileSync(resolve(repoRoot, "migration/product-evidence.lock.json"), "utf8"),
);
const commit = lock.productCommit;
const locked = new Set(Object.keys(lock.evidence ?? {}));
const git = (args) =>
  execFileSync("git", ["-C", productRoot, ...args], { encoding: "utf8", maxBuffer: 1 << 30 });

const tree = new Set(git(["ls-tree", "-r", "--name-only", commit]).split("\n").filter(Boolean));

// 짧은 이름이 여럿에 걸릴 때 어느 파일인지는 문서 밖에서 고정한다 — 규범 문서는 `apps/web/...`을
// 본문에 쓸 수 없기 때문이다(build-design-docs의 저장소 경계 규칙).
const aliasFile = JSON.parse(
  readFileSync(resolve(repoRoot, "migration/citation-aliases.json"), "utf8"),
);
const aliases = new Map(Object.entries(aliasFile.aliases ?? {}));
const citations = collectDocCitations(repoRoot);
const errors = [];
const lengths = new Map();
const lineCount = (path) => {
  if (!lengths.has(path)) lengths.set(path, git(["show", commit + ":" + path]).split("\n").length);
  return lengths.get(path);
};

const resolved = new Set();
for (const citation of citations) {
  const where = citation.doc + ":" + citation.docLine;
  const alias = aliases.get(citation.file);
  // 별칭이 없는 파일을 가리키면 여기서 걸러 낸다. 아래 별칭 자체 검증이 원인을 따로 보고하므로
  // 인용마다 같은 말을 반복하지 않는다.
  if (alias && !tree.has(alias)) continue;
  const result = alias ? { path: alias } : resolveCitation(citation.file, tree);
  if (result.error === "이름이 모호함") {
    errors.push(
      `${where} — \`${citation.file}\`이 제품에 ${result.candidates.length}개 있습니다. ` +
        `경로를 적어 하나로 좁히세요: ${result.candidates.join(" · ")}`,
    );
    continue;
  }
  if (result.error) {
    errors.push(`${where} — 배포본 ${commit.slice(0, 8)}에 \`${citation.file}\`이 없습니다.`);
    continue;
  }
  const path = result.path;
  resolved.add(path);
  const last = citation.end ?? citation.line;
  const total = lineCount(path);
  if (last > total) {
    errors.push(
      `${where} — \`${path}\`은 ${total}줄인데 :${citation.line}${citation.end ? "-" + citation.end : ""}을 인용합니다.`,
    );
    continue;
  }
  if (!locked.has(path)) {
    errors.push(
      `${where} — \`${path}\`이 evidence lock에 없습니다. 제품이 이 파일을 바꿔도 게이트가 모릅니다. ` +
        `\`node ./scripts/build-product-evidence.mjs\`로 갱신하세요.`,
    );
  }
}

// **별칭이 썩는 것도 실패로 만든다.** 가리키는 파일이 사라지거나, 이름이 더는 모호하지 않아
// 별칭이 필요 없어졌으면 알아야 한다 — 안 그러면 없는 이유를 계속 들고 다닌다.
for (const [name, path] of aliases) {
  if (!tree.has(path)) {
    errors.push(`citation-aliases.json — \`${name}\` → \`${path}\`이 배포본 ${commit.slice(0, 8)}에 없습니다.`);
    continue;
  }
  const probe = resolveCitation(name, tree);
  if (probe.error !== "이름이 모호함") {
    errors.push(
      `citation-aliases.json — \`${name}\`은 더는 모호하지 않습니다(${probe.path ?? probe.error}). 별칭을 지우세요.`,
    );
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error("[citations] " + error);
  console.error(`[citations] 인용 ${citations.length}건 중 ${errors.length}건이 어긋납니다.`);
  process.exit(1);
}
console.log(
  `[citations] OK (제품 인용 ${citations.length}건 · 파일 ${resolved.size}개가 전부 유일하게 해결되고 ` +
    `lock에 고정됨 @ ${commit.slice(0, 8)})`,
);
