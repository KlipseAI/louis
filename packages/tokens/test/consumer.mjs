import {
  formatVersion,
  metadata,
  primitives,
  themes,
  tokens,
} from "@klipse-design/tokens";
import figma from "@klipse-design/tokens/figma" with { type: "json" };
import manifest from "@klipse-design/tokens/manifest" with { type: "json" };
import json from "@klipse-design/tokens/json" with { type: "json" };

const cssUrl = import.meta.resolve("@klipse-design/tokens/css");
const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

invariant(formatVersion === 1, "formatVersion export mismatch");
invariant(JSON.stringify(themes) === '["light","dark"]', "theme mismatch");
invariant(metadata.figmaCollection === "Klipse", "metadata mismatch");
invariant(Object.keys(primitives).length > 0, "primitive export is empty");
invariant(Object.keys(tokens.light).length > 0, "light token export is empty");
invariant(
  tokens.light["color-bg-canvas"].aliasTarget?.id ===
    "color-palette-gray-025",
  "semantic alias export mismatch",
);
invariant(
  json.metadata.figmaCollection === metadata.figmaCollection,
  "JSON mismatch",
);
const runtimeTokenCount =
  Object.keys(primitives).length +
  Object.values(tokens).reduce(
    (count, modeTokens) => count + Object.keys(modeTokens).length,
    0,
  );
invariant(
  manifest.tokenCount === runtimeTokenCount,
  "manifest token count mismatch",
);
invariant(
  figma.$extensions["com.klipse-design"].figmaCollection ===
    metadata.figmaCollection,
  "Figma collection mismatch",
);
invariant(
  JSON.stringify(Object.keys(figma.collections).sort()) ===
    JSON.stringify([
      "Klipse Primitive",
      "Klipse Semantic",
      "Klipse Semantic Color",
    ]),
  "Figma collection split mismatch",
);
// mode 순서는 source의 themes 순서를 따른다. Figma는 첫 mode를 default로 쓰므로
// 이 순서가 CSS의 `:root`(light) 계약과 어긋나면 라이브러리 기본 표시가 틀린다.
invariant(
  JSON.stringify(figma.collections["Klipse Semantic Color"].modes) ===
    JSON.stringify(themes.map((t) => t[0].toUpperCase() + t.slice(1))),
  "Figma theme mode order mismatch",
);
invariant(
  figma.collections["Klipse Semantic Color"].defaultMode === "Light",
  "Figma default theme mode mismatch",
);
invariant(cssUrl.endsWith("/generated/tokens.css"), "CSS export mismatch");
const css = readFileSync(new URL(cssUrl), "utf8");
invariant(
  css.includes("--louis-color-bg-canvas") &&
    css.includes("color-scheme: dark"),
  "CSS artifact content mismatch",
);

try {
  await import("@klipse-design/tokens/generated/index.js");
  throw new Error("private generated subpath was exported");
} catch (error) {
  invariant(
    error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
    `unexpected private subpath error: ${error?.code ?? error}`,
  );
}

console.log("Token package consumer fixture OK.");
import { readFileSync } from "node:fs";
