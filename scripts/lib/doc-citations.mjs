// design 문서가 인용하는 **제품 좌표**(`<파일>:<줄>`)를 한 곳에서 파싱한다.
//
// **왜 필요한가.** 2026-08-21 감사에서 이식번들의 인용 좌표 124건이 낡은 것으로 드러났다 —
// 사실은 맞는데 제품이 움직여 줄이 밀렸다. KDS도 같은 위험을 안고 있는데, 락이
// `product.measured.json`이 인용한 파일만 고정하고 **산문이 인용한 파일은 안 보고 있었다.**
//
// 세 가지를 계약으로 만든다.
//   1. 산문이 인용한 제품 파일도 락에 들어간다 → 제품이 바뀌면 게이트가 잡는다.
//   2. 인용은 **모호하면 안 된다** — 제품에 같은 이름 파일이 여럿이면 경로를 적어야 한다.
//      (`Gnb.tsx`는 제품에 셋이다. 오늘 그중 엉뚱한 것을 열어 「파일이 없다」고 한 적이 있다.)
//   3. 인용한 줄이 **그 커밋에 실재해야 한다.**
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// 인용 형태: `globals.css:63`, `Gnb.tsx:1911-1925`, `apps/web/app/globals.css:104`
const CITATION = /`?([A-Za-z0-9_.\-/]+\.(?:tsx?|jsx?|css|mjs))`?\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?/g;

// KDS 자신의 파일은 제품 인용이 아니다.
const OWN_PREFIXES = ["scripts/", "packages/", "figma/", "test/"];

export function collectDocCitations(repoRoot, { includeUpdates = false } = {}) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        if (name === "llms") continue; // 생성물 — 원본에서 이미 본다
        walk(path);
        continue;
      }
      if (!name.endsWith(".md")) continue;
      const rel = relative(repoRoot, path);
      // updates/README.md는 시점 기록이라 옛 좌표가 남는 것이 정상이다.
      if (!includeUpdates && rel.startsWith("design/updates/")) continue;
      const lines = readFileSync(path, "utf8").split("\n");
      lines.forEach((line, index) => {
        for (const match of line.matchAll(CITATION)) {
          const file = match[1];
          if (OWN_PREFIXES.some((prefix) => file.startsWith(prefix))) continue;
          if (/\.mjs$/.test(file) && !file.includes("/")) continue; // 우리 스크립트 이름
          out.push({
            doc: rel,
            docLine: index + 1,
            file,
            line: Number(match[2]),
            end: match[3] ? Number(match[3]) : null,
            context: line.trim().slice(0, 200),
          });
        }
      });
    }
  };
  walk(join(repoRoot, "design"));
  return out;
}

/** 인용 파일명을 제품 트리의 유일한 경로로 해결한다. 못 하면 이유를 돌려준다. */
export function resolveCitation(file, tree) {
  if (tree.has(file)) return { path: file };
  const prefixed = "apps/web/" + file;
  if (tree.has(prefixed)) return { path: prefixed };
  const base = file.split("/").pop();
  const candidates = [...tree].filter((p) => p.endsWith("/" + base) || p === base);
  if (candidates.length === 1) return { path: candidates[0] };
  if (candidates.length === 0) return { error: "제품에 없는 파일", candidates: [] };
  return { error: "이름이 모호함", candidates };
}
