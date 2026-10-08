// **제품 픽스처에 LOUIS CSS 저장소 판을 덮는다(2026-10-07, 소유자 결정).**
//
// 화면 보드는 제품 앵커(design)를 재는데, 그 앵커는 `@klipse-design/css` 를 자기 package.json 의 SHA 로 고정해 받는다
// (a4125565 → 021c2b63, 9월 중순). 그래서 그 뒤 이 저장소에서 한 LOUIS 작업(메뉴 면 · 헤어라인 · 선택 행 표식 · 표 hover ·
// primary 빛 · 모달 가림막 · 코치마크 · 포커스 링 없음 …)이 보드에 들어가지 않았다. 제품의 작업 브랜치들은 이미 더 새 판을
// 고정해 쓴다(dev b31c981f · 기능 브랜치 3ec8830d · cfeedf91 · bab5efdf — 모두 이 저장소 main 의 조상).
//
// 소유자는 「제품 코드는 앵커 그대로, LOUIS CSS 만 최신으로」를 골랐다. 측정기는 개발 서버를 띄우기 전에 픽스처의
// `node_modules/@klipse-design/css/generated` 를 이 저장소 `packages/css/generated` 로 덮는다. 두 판의 내보내기(package.json
// `exports`)가 같은 것을 확인하고, 다르면 멈춘다 — 제품이 읽는 이름이 사라지면 조용히 깨진다.
//
// webpack 개발 서버는 node_modules 를 「패키지 버전이 같으면 같은 내용」으로 캐시한다(managedPaths). 버전은 둘 다 0.0.0 이라
// 덮어도 옛 CSS 가 나올 수 있다 — 놓인 판의 해시가 저장소 판과 다르면 덮고 `apps/web/.next` 를 지운다. node_modules · .next 는
// 픽스처의 .gitignore 안이라 「clean 픽스처」 검사는 그대로 통과한다.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

export const louisCssDigest = (generatedDir) => {
  const hash = createHash("sha256");
  for (const name of readdirSync(generatedDir).filter((entry) => entry.endsWith(".css")).sort()) {
    hash.update(name + "\0" + sha256(readFileSync(resolve(generatedDir, name))) + "\n");
  }
  return hash.digest("hex");
};

export const overlayLouisCss = ({ repoRoot, fixtureRoot, fail }) => {
  const source = resolve(repoRoot, "packages/css");
  const target = resolve(fixtureRoot, "node_modules/@klipse-design/css");
  if (!existsSync(resolve(target, "package.json"))) fail(`픽스처에 @klipse-design/css 가 없습니다: ${target}`);
  const exportsOf = (dir) => JSON.stringify(JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8")).exports);
  if (exportsOf(source) !== exportsOf(target)) {
    fail("LOUIS CSS 내보내기가 픽스처 고정 판과 다릅니다 — 덮으면 제품이 읽는 이름이 사라질 수 있습니다. 이 lib 의 머리말을 보고 판단하세요");
  }
  const pinned = (readFileSync(resolve(fixtureRoot, "apps/web/package.json"), "utf8").match(/louis#([0-9a-f]{40})/) ?? [])[1] ?? null;
  const digest = louisCssDigest(resolve(source, "generated"));
  // 표지 파일이 아니라 놓인 파일 자체를 본다 — 픽스처에서 설치를 다시 돌리면 고정 판으로 돌아간다.
  if (louisCssDigest(resolve(target, "generated")) !== digest) {
    mkdirSync(resolve(target, "generated"), { recursive: true });
    for (const name of readdirSync(resolve(source, "generated")).filter((entry) => entry.endsWith(".css"))) {
      copyFileSync(resolve(source, "generated", name), resolve(target, "generated", name));
    }
    if (louisCssDigest(resolve(target, "generated")) !== digest) fail("LOUIS CSS 를 덮었는데 해시가 맞지 않습니다");
    rmSync(resolve(fixtureRoot, "apps/web/.next"), { recursive: true, force: true });
  }
  // 원장에는 판의 해시를 적지 않는다(`record`). 적으면 LOUIS CSS 를 고친 모든 커밋이 값이 그대로인 원장의 `--check` 까지
  // 빨갛게 만든다(로그인 원장 한 벌이 2시간 넘게 걸린다). 판이 화면 값을 바꿨는지는 `--check` 가 값으로 잡는다.
  return { digest, record: { source: "repo:packages/css/generated", productPinned: pinned } };
};
