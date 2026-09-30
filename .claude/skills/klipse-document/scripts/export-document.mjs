#!/usr/bin/env node
// 문서를 파일 하나로 묶는다 — 링크한 LOUIS CSS 와 media/ 그림을 인라인한다(글꼴은 Pretendard CDN 링크를 그대로 둔다).
//   node .claude/skills/klipse-document/scripts/export-document.mjs <문서 폴더> [--pdf]
// 산출: <문서 폴더>/dist/<폴더 이름>.html (+ --pdf 면 같은 이름의 .pdf — A4 · 배경 인쇄 · 라이트).
// 저장소 밖으로 보내는 것은 이 파일이다. 링크된 index.html 은 저장소 안에서만 열린다.
import { mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith("--"));
if (!target) {
  console.error("사용법: export-document.mjs <문서 폴더> [--pdf]");
  process.exit(1);
}
const docDir = statSync(resolve(target)).isDirectory() ? resolve(target) : dirname(resolve(target));
const name = basename(docDir);
let html = readFileSync(join(docDir, "index.html"), "utf8");

// 로컬 CSS 링크 → <style>. 원격(https) 링크는 그대로 둔다.
html = html.replace(/<link rel="stylesheet" href="(?!https?:)([^"]+)">/g, (_, href) => {
  const css = readFileSync(resolve(docDir, href), "utf8");
  return `<style data-from="${basename(href)}">\n${css}\n</style>`;
});
// 로컬 그림 → data URI.
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif" };
let inlined = 0;
html = html.replace(/(<img\b[^>]*\bsrc=")(?!data:|https?:)([^"]+)(")/g, (_, before, src, after) => {
  const path = resolve(docDir, src);
  const mime = MIME[extname(path).toLowerCase()];
  if (!mime) throw new Error(`모르는 그림 형식: ${src}`);
  inlined += 1;
  return `${before}data:${mime};base64,${readFileSync(path).toString("base64")}${after}`;
});

const out = join(docDir, "dist");
mkdirSync(out, { recursive: true });
const htmlOut = join(out, `${name}.html`);
writeFileSync(htmlOut, html);
const size = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;
console.log(`묶었다: ${relative(process.cwd(), htmlOut)} (${size(Buffer.byteLength(html))}, 그림 ${inlined})`);

if (args.includes("--pdf")) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1120, height: 900 } });
  await page.goto(pathToFileURL(htmlOut).href + "?theme=light");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle").catch(() => {});
  const pdfOut = join(out, `${name}.pdf`);
  await page.pdf({ path: pdfOut, format: "A4", printBackground: true, margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" } });
  await browser.close();
  console.log(`인쇄했다: ${relative(process.cwd(), pdfOut)}`);
}
