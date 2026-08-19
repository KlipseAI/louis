import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// 아이콘 목록과 검색 키워드를 배포물에 싣는다.
//
// 생성된 index.tsx에 상수로 둘 수는 없다 — DS-D-0008 결정 8이 생성물 최상위에 함수 아닌 문장을
// 금지하고, 그것이 tree-shaking을 지킨다. 그래서 JSON을 dist로 복사해 서브패스로 내보낸다.
// 이 파일이 없으면 소비 개발자에게 아이콘을 이름으로 찾는 채널이 없다(2026-08-18 실무 감사).
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(repoRoot, "packages/react/src/icons/generated/manifest.json");
const target = resolve(repoRoot, "packages/react/dist/icons/manifest.json");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log("[icons] manifest를 배포물에 복사했습니다: dist/icons/manifest.json");
