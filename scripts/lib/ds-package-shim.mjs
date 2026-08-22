import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// **제품이 이 저장소의 패키지를 직접 `@import` 한다.**
//
// klipse-web `design` 브랜치의 진입 CSS(`apps/web/app/tailwind.css`)는
// `@klipse-design/css/tokens.css`와 `@klipse-design/css/theme.css`를 불러온다 — 채택이 켜진
// 자리다. 우리가 그 CSS를 임시 작업공간에서 컴파일할 때 Tailwind의 `loadStylesheet`는
// tailwindcss 외의 id를 **작업공간 기준 상대 경로**로 풀므로, 그 자리에 파일을 실제로 놓아
// 주지 않으면 `ENOENT`로 죽는다.
//
// **HEAD의 생성물을 넣으면 안 된다.** 제품은 `apps/web/package.json`에서 이 저장소를 커밋
// SHA로 고정해 받는다(`github:KlipseAI/louis#<sha>&path:/packages/css`). 로컬 HEAD는 그 핀보다
// 앞서 있을 수 있고 — 2026-08-21 실측으로 147커밋 앞서 `packages/css`가 4,000줄 넘게 달랐다 —
// HEAD를 쓰면 **제품에 없는 DS**로 재게 된다. `scripts/lib/product-ref.mjs`가 경계하는
// 「게이트가 초록인 채로 값이 낡는」 실패와 같은 종류다.
//
// 그래서 핀을 제품에서 읽어 **그 커밋의 생성물**을 꺼낸다. 핀이 이 저장소에 없으면(예: 아직
// 받아오지 않은 커밋) HEAD로 떨어지되 그 사실을 로그로 드러낸다 — 조용히 대체하지 않는다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const FILES = [
  "tokens.css",
  "theme.css",
  "styles.css",
  "styles.layer.css",
  "layers.css",
  "reset.css",
];

/**
 * 임시 작업공간에 `@klipse-design/css/*`를 실체화하고, 어떤 DS 커밋을 썼는지 돌려준다.
 *
 * @param {object} options
 * @param {string} options.workspace  컴파일 base 디렉터리
 * @param {(args: string[]) => string} options.git  제품 저장소에서 실행되는 git 러너
 * @param {string} options.commit  제품 커밋(고정된 productRef의 해석 결과)
 * @param {string} options.tag  로그 접두사 (예: "product-variants")
 * @returns {string} 사용한 DS 커밋의 짧은 해시, 또는 "HEAD"
 */
export function materializeDsPackage({ workspace, git, commit, tag }) {
  let pinned = null;
  try {
    const productPkg = JSON.parse(git(["show", commit + ":apps/web/package.json"]));
    const dep = (productPkg.dependencies ?? {})["@klipse-design/css"] ?? "";
    pinned = /#([0-9a-f]{7,40})/.exec(dep)?.[1] ?? null;
  } catch {
    // 제품에 package.json이 없거나 읽지 못하면 핀 없이 진행한다.
  }

  const selfGit = (args) =>
    execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

  let dsRef = null;
  if (pinned) {
    try {
      selfGit(["cat-file", "-e", pinned + "^{commit}"]);
      dsRef = pinned;
    } catch {
      console.log(
        "[" + tag + "] 제품이 고정한 DS 커밋 " + pinned +
          "이 이 저장소에 없습니다 — HEAD 생성물로 대체합니다(값이 제품과 다를 수 있습니다).",
      );
    }
  }

  const pkgDir = join(workspace, "@klipse-design", "css");
  mkdirSync(pkgDir, { recursive: true });
  for (const name of FILES) {
    let content = null;
    if (dsRef) {
      try {
        content = selfGit(["show", dsRef + ":packages/css/generated/" + name]);
      } catch {
        content = null;
      }
    }
    if (content == null) {
      const from = resolve(repoRoot, "packages/css/generated", name);
      if (existsSync(from)) content = readFileSync(from, "utf8");
    }
    if (content != null) writeFileSync(join(pkgDir, name), content);
  }

  return dsRef ? dsRef.slice(0, 7) : "HEAD";
}
