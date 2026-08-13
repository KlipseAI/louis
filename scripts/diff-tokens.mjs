import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TOKEN_BASELINE_PATH,
  TOKEN_OUTPUT_DIRECTORY,
  TokenValidationError,
  breakingTokenDiffCount,
  canonicalJson,
  diffTokenManifests,
  parseTokenManifest,
} from "./lib/token-model.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const realRepoRoot = realpathSync(repoRoot);
const rawArgs = process.argv.slice(2);
const options = {
  baseline: TOKEN_BASELINE_PATH,
  current: `${TOKEN_OUTPUT_DIRECTORY}/manifest.json`,
  json: false,
  failOnBreaking: false,
};

for (let index = 0; index < rawArgs.length; index += 1) {
  const arg = rawArgs[index];
  if (arg === "--help") {
    console.log(
      "Usage: node scripts/diff-tokens.mjs [--baseline PATH] [--current PATH] [--json] [--fail-on-breaking]",
    );
    process.exit(0);
  }
  if (arg === "--json") options.json = true;
  else if (arg === "--fail-on-breaking") options.failOnBreaking = true;
  else if (arg === "--baseline" || arg === "--current") {
    if (!rawArgs[index + 1]) throw new Error(`${arg} 값이 필요합니다.`);
    options[arg.slice(2)] = rawArgs[++index];
  } else if (arg.startsWith("--baseline=")) options.baseline = arg.slice(11);
  else if (arg.startsWith("--current=")) options.current = arg.slice(10);
  else throw new Error(`알 수 없는 옵션: ${arg}`);
}

function readSafeManifest(candidate, label) {
  if (
    typeof candidate !== "string" ||
    candidate.length === 0 ||
    isAbsolute(candidate) ||
    candidate.includes("\\")
  ) {
    throw new Error(
      `${label}은 저장소 상대 POSIX 경로여야 합니다: ${candidate}`,
    );
  }
  const absolute = resolve(repoRoot, candidate);
  if (absolute === repoRoot || !absolute.startsWith(repoRoot + sep)) {
    throw new Error(`${label}이 저장소 밖을 가리킵니다: ${candidate}`);
  }
  const metadata = lstatSync(absolute);
  if (metadata.isSymbolicLink() || !metadata.isFile() || metadata.nlink > 1) {
    throw new Error(
      `${label}은 symlink/hardlink가 아닌 regular file이어야 합니다.`,
    );
  }
  const real = realpathSync(absolute);
  if (real !== realRepoRoot && !real.startsWith(realRepoRoot + sep)) {
    throw new Error(`${label}이 저장소 밖으로 해석됩니다: ${candidate}`);
  }
  return parseTokenManifest(readFileSync(absolute, "utf8"), label);
}

try {
  const baseline = readSafeManifest(options.baseline, "baseline manifest");
  const current = readSafeManifest(options.current, "current manifest");
  const diff = diffTokenManifests(baseline, current);
  if (options.json) {
    process.stdout.write(canonicalJson(diff));
  } else {
    console.log("Token manifest diff");
    for (const category of [
      "additive",
      "sourcePathMove",
      "removal",
      "type",
      "rawValue",
      "value",
      "aliasTarget",
      "mode",
      "description",
      "deprecation",
      "layerOrder",
      "figmaCollection",
      "contrastPairs",
      "motionProperties",
      "reducedMotionPairs",
      "responsiveProfiles",
    ]) {
      console.log(`- ${category}: ${diff[category].length}`);
      for (const item of diff[category])
        console.log(`  ${JSON.stringify(item)}`);
    }
  }
  const breaking = breakingTokenDiffCount(diff);
  if (options.failOnBreaking && breaking > 0) process.exitCode = 2;
} catch (error) {
  if (error instanceof TokenValidationError) {
    console.error(error.issues.map((issue) => `- ${issue}`).join("\n"));
  } else {
    console.error(error.stack ?? error.message);
  }
  process.exitCode = 1;
}
