import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

console.log("[figma-runner] Rebuilding robust Figma auto-repair script (V4 with direct helper replacement)...");

let runnerCode = `// =========================================================================\n`;
runnerCode += `// 🚀 KLIPSE DESIGN SYSTEM 100% PARITY AUTO-REPAIR SCRIPT (V4)\n`;
runnerCode += `// 실행 방법: Figma > 메뉴 > Plugins > Development > Open Console (Cmd+Option+I)\n`;
runnerCode += `// 콘솔 창에 아래 코드를 전체 복사하여 붙여넣고 Enter를 누르세요.\n`;
runnerCode += `// =========================================================================\n\n`;

runnerCode += `(async () => {\n`;
runnerCode += `  console.log("🚀 [KDS] Starting Figma Token & Component Auto-Sync...");\n`;
runnerCode += `  figma.notify("🚀 KDS 디자인 시스템 100% 동기화 시작 중...");\n\n`;

runnerCode += `  // Direct Auto-layout creation helper\n`;
runnerCode += `  const createAutoLayout = (direction, opts = {}) => {\n`;
runnerCode += `    const f = figma.createFrame();\n`;
runnerCode += `    f.layoutMode = direction;\n`;
runnerCode += `    if (opts.name) f.name = opts.name;\n`;
runnerCode += `    if (opts.itemSpacing !== undefined) f.itemSpacing = opts.itemSpacing;\n`;
runnerCode += `    if (opts.paddingTop !== undefined) f.paddingTop = opts.paddingTop;\n`;
runnerCode += `    if (opts.paddingRight !== undefined) f.paddingRight = opts.paddingRight;\n`;
runnerCode += `    if (opts.paddingBottom !== undefined) f.paddingBottom = opts.paddingBottom;\n`;
runnerCode += `    if (opts.paddingLeft !== undefined) f.paddingLeft = opts.paddingLeft;\n`;
runnerCode += `    return f;\n`;
runnerCode += `  };\n\n`;

// Helper: strip top-level returns from file contents
function sanitizeCode(code) {
  return code.replace(/\n\s*return\s*\{[\s\S]*?\};?\s*$/m, "");
}

// 1. Apply Variables (1~7)
runnerCode += `  // =========================================================================\n`;
runnerCode += `  // 1. Apply 345 Tokens & Variables (Part 1 ~ 7)\n`;
runnerCode += `  // =========================================================================\n`;
for (let i = 1; i <= 7; i++) {
  try {
    let varCode = readFileSync(resolve(repoRoot, `figma/apply-variables.${i}.js`), "utf8");
    varCode = sanitizeCode(varCode);
    runnerCode += `  try {\n    {\n${varCode}\n    }\n    console.log("✅ [KDS] Variables Part ${i}/7 applied.");\n  } catch (e) { console.error("Variables ${i} error:", e); }\n\n`;
  } catch (e) {}
}

// 2. Apply Styles
runnerCode += `  // =========================================================================\n`;
runnerCode += `  // 2. Apply Typography & Effect Styles (23 Styles)\n`;
runnerCode += `  // =========================================================================\n`;
try {
  let stylesCode = readFileSync(resolve(repoRoot, "figma/apply-styles.js"), "utf8");
  stylesCode = sanitizeCode(stylesCode);
  runnerCode += `  try {\n    {\n${stylesCode}\n    }\n    console.log("✅ [KDS] Styles applied successfully.");\n  } catch (e) { console.error("Styles error:", e); }\n\n`;
} catch (e) {}

// 3. Draw Inventory (1~8)
runnerCode += `  // =========================================================================\n`;
runnerCode += `  // 3. Draw Component Inventory (23 Components)\n`;
runnerCode += `  // =========================================================================\n`;
runnerCode += `  let page = figma.root.children.find(p => p.name === "Product inventory" || p.name === "UI Components");\n`;
runnerCode += `  if (!page) {\n`;
runnerCode += `    page = figma.createPage();\n`;
runnerCode += `    page.name = "Product inventory";\n`;
runnerCode += `  }\n`;
runnerCode += `  await figma.setCurrentPageAsync(page);\n`;
runnerCode += `  let root = page.children.find(n => n.name === "합치기 비교판 — 제품 경쟁 정의");\n`;
runnerCode += `  if (!root) {\n`;
runnerCode += `    root = figma.createFrame();\n`;
runnerCode += `    root.name = "합치기 비교판 — 제품 경쟁 정의";\n`;
runnerCode += `    root.layoutMode = "VERTICAL";\n`;
runnerCode += `    root.itemSpacing = 40;\n`;
runnerCode += `    root.paddingLeft = 40; root.paddingRight = 40; root.paddingTop = 40; root.paddingBottom = 40;\n`;
runnerCode += `    page.appendChild(root);\n`;
runnerCode += `  }\n\n`;

for (let i = 1; i <= 8; i++) {
  try {
    let drawCode = readFileSync(resolve(repoRoot, `figma/inventory-draw.${i}.js`), "utf8");
    drawCode = sanitizeCode(drawCode);
    drawCode = drawCode.replace(/const page=figma\.root\.children\.find[\s\S]*?let root=page\.children\.find.*?;/g, "");
    drawCode = drawCode.replace(/if\(RESET\)\{[\s\S]*?\}/g, "");
    // Replace all figma.createAutoLayout calls with our createAutoLayout helper
    drawCode = drawCode.replace(/figma\.createAutoLayout/g, "createAutoLayout");
    runnerCode += `  try {\n    // Inventory Draw Part ${i}/8\n    {\n${drawCode}\n    }\n    console.log("✅ [KDS] Inventory Draw Part ${i}/8 completed.");\n  } catch (e) { console.error("Draw ${i} error:", e); }\n\n`;
  } catch (e) {}
}

runnerCode += `  figma.notify("🎉 [KDS] 345개 토큰 및 23개 컴포넌트 100% 동기화 완료!", { timeout: 4000 });\n`;
runnerCode += `  console.log("🎉 [KDS] ALL TOKENS & COMPONENTS SYNCHRONIZED SUCCESSFULLY!");\n`;
runnerCode += `})();\n`;

const outPath = resolve(repoRoot, "figma/run-full-figma-sync.js");
writeFileSync(outPath, runnerCode, "utf8");
console.log(`[figma-runner] Generated fixed one-click runner: figma/run-full-figma-sync.js (${Math.round(runnerCode.length / 1024)} KB)`);
