import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// 토큰이 없으면: scripts/figma-live-assets-probe.mjs 가 같은 walk 를 use_figma 읽기 탐침으로 돌려 세션 기록에서 합친다(lastModified · version 은 null).

// 토큰에 리터럴 폴백을 두지 않는다. 예전에는 `process.env.X || "figd_…"` 형태로 개인 토큰이
// 박혀 있었고, 그대로 원격에 푸시돼 유출됐다. 폴백이 있으면 환경변수를 잊어도 조용히 남의
// 계정 권한으로 돌아가기 때문에 잘못을 알아챌 방법이 없다 — 없으면 즉시 실패한다.
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

// 파일 key 는 비밀이 아니다(design/governance/figma-sync.md 「운영 파일」 절에 공개돼 있다).
// 기본값은 제품 화면 이식 보드다. DS 정본 라이브러리를 읽으려면 FIGMA_FILE_KEY 로 덮어써라.
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || "OlYKERKOkgbxBEEoXGZW2c";

async function fetchFigma(endpoint) {
  // 모듈 최상단이 아니라 실제로 네트워크를 타는 지점에서 검사한다 — `figma:audit` 은 로컬
  // 파일만 읽으므로 토큰 없이도 돌아야 한다. 최상단에서 throw 하면 그것까지 막힌다.
  if (!FIGMA_ACCESS_TOKEN) {
    throw new Error(
      "FIGMA_ACCESS_TOKEN 이 설정되지 않았습니다.\n" +
        "  Figma > Settings > Security > Personal access tokens 에서 발급한 뒤\n" +
        "  FIGMA_ACCESS_TOKEN=figd_... pnpm run figma:sync\n" +
        "  처럼 환경변수로 넘기세요. 토큰을 소스에 적으면 저장소에 유출됩니다.",
    );
  }
  const url = `https://api.figma.com/v1/${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "X-Figma-Token": FIGMA_ACCESS_TOKEN,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Figma API HTTP ${res.status}: ${errorText}`);
  }
  return res.json();
}

export async function fetchLiveFigmaAssets() {
  console.log(`[figma-sync] Connecting to Figma file: ${FIGMA_FILE_KEY}...`);
  const fileData = await fetchFigma(`files/${FIGMA_FILE_KEY}?depth=3`);
  
  const manifest = {
    fileKey: FIGMA_FILE_KEY,
    name: fileData.name,
    lastModified: fileData.lastModified,
    version: fileData.version,
    fetchedAt: new Date().toISOString(),
    pages: [],
    components: {},
    componentSets: {},
  };

  for (const page of fileData.document?.children || []) {
    const pageEntry = {
      id: page.id,
      name: page.name,
      sections: [],
    };

    function walk(node, sectionName = null) {
      if (node.type === "SECTION") {
        const sec = { id: node.id, name: node.name, items: [] };
        pageEntry.sections.push(sec);
        for (const child of node.children || []) {
          walk(child, node.name);
        }
        return;
      }
      if (node.type === "COMPONENT") {
        manifest.components[node.id] = {
          id: node.id,
          name: node.name,
          page: page.name,
          section: sectionName,
          key: node.key,
        };
      } else if (node.type === "COMPONENT_SET") {
        manifest.componentSets[node.id] = {
          id: node.id,
          name: node.name,
          page: page.name,
          section: sectionName,
          variantsCount: node.children?.length || 0,
        };
      }
      for (const child of node.children || []) {
        if (node.type !== "SECTION") {
          walk(child, sectionName);
        }
      }
    }

    walk(page);
    manifest.pages.push(pageEntry);
  }

  const outPath = resolve(repoRoot, "figma/live-assets.json");
  writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`[figma-sync] Fetched ${Object.keys(manifest.components).length} components, ${Object.keys(manifest.componentSets).length} component sets from Figma.`);
  console.log(`[figma-sync] Saved live snapshot to figma/live-assets.json`);
  return manifest;
}

export async function auditFigmaAssets() {
  const livePath = resolve(repoRoot, "figma/live-assets.json");
  if (!existsSync(livePath)) {
    await fetchLiveFigmaAssets();
  }
  const live = JSON.parse(readFileSync(livePath, "utf8"));
  const measured = JSON.parse(readFileSync(resolve(repoRoot, "figma/components.measured.json"), "utf8"));

  console.log(`\n=== Figma ↔ Code Parity Audit ===`);
  console.log(`- Figma File: ${live.name} (Modified: ${live.lastModified})`);
  console.log(`- Total Figma Components: ${Object.keys(live.components).length}`);
  console.log(`- Code Design System Components: ${Object.keys(measured.components).length}`);

  let matchCount = 0;
  for (const compName of Object.keys(measured.components)) {
    const found = Object.values(live.components).some(c => c.name.includes(compName)) ||
                  Object.values(live.componentSets).some(c => c.name.includes(compName));
    if (found) {
      matchCount++;
    }
  }
  console.log(`- System Component Parity: ${matchCount}/${Object.keys(measured.components).length} components mapped in Figma workspace.`);
}

async function main() {
  const cmd = process.argv[2] || "sync";
  if (cmd === "fetch" || cmd === "sync") {
    await fetchLiveFigmaAssets();
    await auditFigmaAssets();
  } else if (cmd === "audit") {
    await auditFigmaAssets();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(`[figma-sync] Error:`, err.message);
    process.exit(1);
  });
}
