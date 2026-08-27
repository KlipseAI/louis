// design 문서가 인용하는 **제품 좌표**(`<파일>:<줄>`)를 한 곳에서 파싱한다.
//
// **왜 필요한가.** 2026-08-21 감사에서 이식번들의 인용 좌표 124건이 낡은 것으로 드러났다 —
// 사실은 맞는데 제품이 움직여 줄이 밀렸다. LOUIS도 같은 위험을 안고 있는데, 락이
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
//
// **과거형 좌표는 `<파일>@<커밋>:<줄>` 로 적는다** — 예: `Button.tsx@a3ed8e03:82-83`.
// 파일명 뒤가 `:` 가 아니라 `@` 라서 아래 정규식에 걸리지 않고, 그래서 수집되지 않는다.
// 이 형태가 필요한 이유: 제품이 파일을 지우거나 통째로 갈아엎으면 그 줄은 **어느 배포본에도
// 없다.** 좌표를 지우면 「그런 선언이 있었다」는 사실까지 사라지고, 현재형으로 옮기면 거짓이 된다.
// 커밋에 묶어 두면 둘 다 피하면서 사람이 손으로 확인할 수 있다(그 커밋이 원격에 있는 한).
const CITATION = /`?([A-Za-z0-9_.\-/]+\.(?:tsx?|jsx?|css|mjs))`?\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?/g;

// LOUIS 자신의 파일은 제품 인용이 아니다.
const OWN_PREFIXES = ["scripts/", "packages/", "figma/", "test/"];

// **마크다운 링크의 과녁도 본다.** 위 목록은 인용문에 경로가 **직접 적혀 있을 때만** 걸린다.
// 그런데 컴포넌트 문서는 자기 CSS 를 `[table.css:3-5](../../packages/css/src/component/table.css)`
// 처럼 링크로 적는다 — 보이는 글자에는 경로가 없고 과녁에만 있다. 그래서 LOUIS 자신의 파일
// 15건이 「배포본에 `table.css` 가 없습니다」로 잡히고 있었다. 제품 저장소에 그 파일이 없는
// 것은 당연하다. 이것은 게이트를 느슨하게 하는 것이 아니라 **과녁을 보면 이미 답이 적혀 있는
// 오탐**을 없애는 것이다.
const LINK_TARGET = /^`?\]\(([^)\s]+)/;
const targetsOwnTree = (rest) => {
  const match = LINK_TARGET.exec(rest);
  if (!match) return false;
  const path = match[1].replace(/^(?:\.\.\/)+/, "").replace(/^\.\//, "");
  return OWN_PREFIXES.some((prefix) => path.startsWith(prefix));
};

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
          if (targetsOwnTree(line.slice(match.index + match[0].length))) continue;
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
  // **부분 경로를 먼저 본다.** 문서는 `login/page.tsx`처럼 앞을 줄여 인용한다 —
  // 그것으로 유일하게 좁혀지면 파일명만으로 다시 넓히지 않는다. (`page.tsx`는 제품에 49개다.)
  if (file.includes("/")) {
    const bySuffix = [...tree].filter((p) => p.endsWith("/" + file));
    if (bySuffix.length === 1) return { path: bySuffix[0] };
    if (bySuffix.length > 1) return { error: "이름이 모호함", candidates: bySuffix };
  }
  const base = file.split("/").pop();
  const candidates = [...tree].filter((p) => p.endsWith("/" + base) || p === base);
  if (candidates.length === 1) return { path: candidates[0] };
  if (candidates.length === 0) return { error: "제품에 없는 파일", candidates: [] };
  return { error: "이름이 모호함", candidates };
}
