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
invariant(metadata.figmaCollection === "Klipse Design", "metadata mismatch");
invariant(Object.keys(primitives).length > 0, "primitive export is empty");
invariant(Object.keys(tokens.light).length > 0, "light token export is empty");
invariant(
  tokens.light["color-background-canvas"].aliasTarget?.id ===
    "color-neutral-100",
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
invariant(cssUrl.endsWith("/generated/tokens.css"), "CSS export mismatch");
const css = readFileSync(new URL(cssUrl), "utf8");
invariant(
  css.includes("--kds-color-background-canvas") &&
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
