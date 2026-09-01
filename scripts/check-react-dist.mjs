#!/usr/bin/env node
// 커밋된 `packages/react/dist` 가 `src` 와 어긋나지 않았는지 본다.
//
// 왜 있나: 2026-09-01 에 이 저장소는 `packages/react/dist` 를 **커밋하기 시작했다**(DS-D-0036).
// 제품이 이 패키지를 `github:KlipseAI/louis#<sha>&path:/packages/react` 로 설치하는데, git
// 설치는 `npm publish` 도 `prepare` 도 거치지 않아 커밋되지 않은 파일은 소비자에게 아예
// 존재하지 않기 때문이다.
//
// 그 선택은 **새로운 실패 하나를 만든다** — 소스를 고치고 dist 를 다시 커밋하지 않으면,
// 저장소 안에서는 아무도 눈치채지 못한 채 소비자만 낡은 코드를 받는다. `packages/css` 와
// `packages/tokens` 가 커밋 생성물에 대해 `--check` 를 갖는 것과 정확히 같은 이유로 이
// 게이트가 있다.
//
// **비교용 재빌드는 `packages/react/.dist-check` 로 낸다.** 임의의 임시 폴더가 아니라
// `dist` 와 같은 깊이의 형제여야 한다 — sourcemap 의 `sources` 는 map 파일 위치에서 소스까지의
// **상대 경로**라, 깊이가 달라지면 내용이 달라져 게이트가 거짓 빨강을 낸다(2026-09-01 실측:
// 같은 깊이로 내면 `icons/manifest.json` 을 뺀 252개 파일이 바이트 동일).
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(repoRoot, "packages/react");
const committed = join(packageRoot, "dist");
const rebuilt = join(packageRoot, ".dist-check");

function walk(root) {
  const found = new Map();
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) found.set(relative(root, full), full);
    }
  };
  if (statSync(root, { throwIfNoEntry: false })?.isDirectory()) visit(root);
  return found;
}

rmSync(rebuilt, { recursive: true, force: true });
try {
  execFileSync(
    join(repoRoot, "node_modules/.bin/tsc"),
    ["-p", join(packageRoot, "tsconfig.build.json"), "--outDir", rebuilt],
    { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  // `packages/react/package.json` 의 build 는 tsc 다음에 아이콘 manifest 를 복사한다.
  // 여기서도 같은 두 단계를 밟지 않으면 그 파일만 "커밋에는 있는데 재빌드에는 없는" 것으로
  // 잡혀 영구 빨강이 된다.
  const manifest = join(packageRoot, "src/icons/generated/manifest.json");
  mkdirSync(join(rebuilt, "icons"), { recursive: true });
  copyFileSync(manifest, join(rebuilt, "icons/manifest.json"));

  const actual = walk(committed);
  const expected = walk(rebuilt);
  const failures = [];

  for (const name of expected.keys()) {
    if (!actual.has(name)) failures.push(`커밋된 dist 에 없습니다: ${name}`);
  }
  for (const name of actual.keys()) {
    if (!expected.has(name)) failures.push(`재빌드에 없는 파일이 커밋돼 있습니다: ${name}`);
  }
  for (const [name, path] of expected) {
    const mirror = actual.get(name);
    if (mirror === undefined) continue;
    if (!readFileSync(path).equals(readFileSync(mirror))) {
      failures.push(`내용이 다릅니다: ${name}`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures.slice(0, 20)) console.error(`[react-dist] ${failure}`);
    if (failures.length > 20) console.error(`[react-dist] ... 외 ${failures.length - 20}건`);
    console.error(
      "[react-dist] 커밋된 배포물이 소스와 다릅니다. `pnpm run build:react` 뒤 " +
        "`packages/react/dist` 를 같은 변경 단위에서 커밋하세요.",
    );
    process.exit(1);
  }
  console.log(`[react-dist] OK (재빌드와 바이트 동일, 파일 ${expected.size}개)`);
} finally {
  rmSync(rebuilt, { recursive: true, force: true });
}
