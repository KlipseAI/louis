import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN || "figd_jYLFp-M28KLBypUvpwO9Py1tTO-NSx3heFGqbUTm";
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || "OlYKERKOkgbxBEEoXGZW2c";

async function fetchFigma(endpoint) {
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
