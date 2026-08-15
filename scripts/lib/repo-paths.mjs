// 생성 스크립트가 공유하는 저장소 경로 안전 검사.
//
// build-tokens.mjs가 먼저 갖고 있던 검사를 그대로 옮긴 것이다. 아이콘 파이프라인이 같은
// 보증을 필요로 하는데, 두 번째 사본을 만들면 한쪽만 고쳐지는 종류의 부채가 된다. 동작을
// 바꾸지 않고 위치만 옮긴다.
//
// 이 검사들이 막는 것은 "생성 스크립트가 저장소 밖에 쓰는 것"이다. symlink·hardlink·상위
// 경로 탈출은 전부 그 한 가지 사고의 변종이다. 검사는 오류를 던지지 않고 호출자의 errors
// 배열에 쌓는다 — 한 번에 모든 문제를 보고하는 기존 스크립트의 관행을 유지하기 위해서다.
import { execFileSync } from "node:child_process";
import { lstatSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

/**
 * @param {string} repoRoot 저장소 루트의 절대 경로
 * @param {string[]} errors 호출자가 소유하는 오류 누적 배열
 */
export function createRepoGuard(repoRoot, errors) {
  const realRepoRoot = realpathSync(repoRoot);

  function repoPath(absolute) {
    return relative(repoRoot, absolute).split(sep).join("/");
  }

  function absoluteRepoPath(candidate, label) {
    if (
      typeof candidate !== "string" ||
      candidate.length === 0 ||
      isAbsolute(candidate) ||
      candidate.includes("\\")
    ) {
      errors.push(
        `${label}는 저장소 상대 POSIX 경로여야 합니다: ${String(candidate)}`,
      );
      return null;
    }
    const absolute = resolve(repoRoot, candidate);
    if (absolute === repoRoot || !absolute.startsWith(repoRoot + sep)) {
      errors.push(`${label}가 저장소 밖을 가리킵니다: ${candidate}`);
      return null;
    }
    return absolute;
  }

  function lstatOrNull(path) {
    try {
      return lstatSync(path);
    } catch (error) {
      if (error.code === "ENOENT") return null;
      errors.push(`${repoPath(path)} 상태를 읽을 수 없습니다: ${error.message}`);
      return null;
    }
  }

  function isInsideRealRepo(path) {
    const real = realpathSync(path);
    return real === realRepoRoot || real.startsWith(realRepoRoot + sep);
  }

  function validateExistingFile(absolute, label, required) {
    const metadata = lstatOrNull(absolute);
    if (!metadata) {
      if (required)
        errors.push(`${label} 파일이 없습니다: ${repoPath(absolute)}`);
      return false;
    }
    if (metadata.isSymbolicLink()) {
      errors.push(
        `${label} 파일은 symbolic link일 수 없습니다: ${repoPath(absolute)}`,
      );
      return false;
    }
    if (!metadata.isFile()) {
      errors.push(`${label} 경로가 파일이 아닙니다: ${repoPath(absolute)}`);
      return false;
    }
    if (metadata.nlink > 1) {
      errors.push(
        `${label} 파일은 hard link일 수 없습니다: ${repoPath(absolute)}`,
      );
      return false;
    }
    if (!isInsideRealRepo(absolute)) {
      errors.push(
        `${label} 파일이 저장소 밖으로 해석됩니다: ${repoPath(absolute)}`,
      );
      return false;
    }
    return true;
  }

  function validateDirectoryChain(absolute, label, allowMissing) {
    const parts = relative(repoRoot, absolute).split(sep).filter(Boolean);
    let current = repoRoot;
    for (const part of parts) {
      current = resolve(current, part);
      const metadata = lstatOrNull(current);
      if (!metadata) return allowMissing;
      if (metadata.isSymbolicLink()) {
        errors.push(
          `${label} 경로에 symbolic link directory가 있습니다: ${repoPath(current)}`,
        );
        return false;
      }
      if (!metadata.isDirectory()) {
        errors.push(
          `${label} parent가 directory가 아닙니다: ${repoPath(current)}`,
        );
        return false;
      }
      if (!isInsideRealRepo(current)) {
        errors.push(
          `${label} directory가 저장소 밖으로 해석됩니다: ${repoPath(current)}`,
        );
        return false;
      }
    }
    return true;
  }

  /**
   * git이 실제로 추적하는 파일인지 확인한다. CI에서 생성물이 커밋되지 않은 채 통과하는
   * 경로를 막는다. git root가 script의 repo root와 다르면 그 자체가 오류다 — 다른
   * 저장소의 추적 상태를 우리 것으로 오인하지 않기 위해서다.
   *
   * @param {string[]} paths 저장소 상대 POSIX 경로
   */
  function requireTrackedFiles(paths) {
    let gitRoot = null;
    try {
      gitRoot = realpathSync(
        execFileSync("git", ["rev-parse", "--show-toplevel"], {
          cwd: repoRoot,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        }).trim(),
      );
    } catch (error) {
      errors.push(`Git 저장소를 확인할 수 없습니다: ${error.message}`);
    }
    if (gitRoot && gitRoot !== realRepoRoot) {
      errors.push(`Git root가 script repo root와 다릅니다: ${gitRoot}`);
    }
    for (const path of paths) {
      try {
        execFileSync("git", ["ls-files", "--error-unmatch", "--", path], {
          cwd: repoRoot,
          stdio: "ignore",
        });
      } catch {
        errors.push(`Git에 추적되지 않은 파일: ${path}`);
      }
    }
  }

  return {
    repoPath,
    absoluteRepoPath,
    lstatOrNull,
    isInsideRealRepo,
    validateExistingFile,
    validateDirectoryChain,
    requireTrackedFiles,
  };
}
