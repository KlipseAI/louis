#!/usr/bin/env node
// `@klipse-design/react` 의 client boundary 를 정적으로 지킨다 (DS-D-0002 「leaf 모듈에
// `"use client"`. 패키지 루트에 붙이지 않는다」).
//
// 왜 있나: 그 규칙은 2026-08-14 에 정해졌는데 **지키는 기계가 없었다.** 그 사이 컴포넌트가
// 늘며 클라이언트 전용 코드를 쓰는 leaf 7개(app-shell · banner-carousel · button · checkbox ·
// project-card · segmented-control · slider)가 지시문 없이 들어왔고 게이트는 전부 초록이었다
// (2026-09-13 발견, Updates (129)). Node SSR(`verify-consumer`)은 이 누락을 잡지 못한다 —
// `renderToStaticMarkup` 은 `react-server` 조건으로 React 를 풀지 않으므로 `createContext` 가
// 멀쩡히 있다. 누락이 드러나는 곳은 **소비자의 Server Component 에서 루트를 import 하는 순간**
// 이다: 번들러가 `project-card.js` 를 서버 층에서 평가하고, 거기엔 `createContext` 가 없다.
//
// 판정하는 것.
//   1. 클라이언트 전용 코드를 쓰는 모듈은 첫 문장이 `"use client"` 다. 클라이언트 전용 코드는
//      (a) React·ReactDOM 이 `react-server` 조건에서 **내보내지 않는** API 를 값으로 import,
//      (b) JSX 속성에 인라인 함수(`onClick={() => …}` · `ref={(node) => …}`),
//      (c) `on*`·`ref` 속성(JSX 또는 Slot 에 넘기는 props 객체)에 그 모듈이 만든 함수
//      (`const handle = () => …` · `useCallback(…)`)를 넘기는 것이다. (b)·(c) 는 서버에서
//      직렬화할 수 없는 값이라 RSC 가 거부한다.
//   2. 재export 만 하는 배럴과 패키지 루트 진입점에는 지시문을 붙이지 않는다 — 붙이면 서버에서
//      안전한 export 까지 전부 클라이언트 참조가 된다.
//   3. `dist` 가 소스의 지시문을 그대로 보존한다. `check-react-dist` 는 dist 와 **재빌드**를
//      비교하므로, 빌드 도구가 지시문을 걷는 도구로 바뀌면(번들러 대부분이 그렇다 — DS-D-0002
//      재검토 조건의 tsdown 전환이 그 자리다) 두 쪽이 함께 바뀌어 초록으로 남는다.
//
// **클라이언트 전용 API 목록을 손으로 적지 않는다.** 설치된 React 를 `--conditions=react-server`
// 로 한 번, 조건 없이 한 번 풀어 export 이름의 차집합을 쓴다. React 가 서버 층의 표면을 바꾸면
// 이 목록이 따라 바뀐다.
//
// 판정하지 못하는 것. 이 검사는 문자열 수준이다 — 다른 모듈에서 import 한 함수를 `on*` 로 넘기는
// 경우, 브라우저 전역(`window` · `document`)을 렌더 중에 만지는 경우는 보지 않는다(후자는
// `verify-consumer` 의 Node SSR 이 잡는다). 실제 RSC 번들러로 서버 층을 평가하는 검사는 아직
// 없다(DS-D-0002 Rollout 4).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(repoRoot, "packages/react");
const srcRoot = join(packageRoot, "src");
const distRoot = join(packageRoot, "dist");
const rel = (path) => relative(repoRoot, path);
const failures = [];

// ── 클라이언트 전용 API: react-server 조건 export 의 차집합 ────────────────────
function exportNames(specifier, conditions) {
  const args = [
    ...conditions.map((condition) => `--conditions=${condition}`),
    "-e",
    `process.stdout.write(JSON.stringify(Object.keys(require(${JSON.stringify(specifier)}))))`,
  ];
  return new Set(JSON.parse(execFileSync(process.execPath, args, { cwd: packageRoot, encoding: "utf8" })));
}

const clientOnly = new Map();
for (const specifier of ["react", "react-dom"]) {
  let server;
  let client;
  try {
    server = exportNames(specifier, ["react-server"]);
    client = exportNames(specifier, []);
  } catch (error) {
    console.error(
      `[react-client-boundary] ${specifier} 를 풀지 못했습니다 — 판정 기준이 없으므로 건너뛰지 않고 실패합니다: ` +
        String(error.message).slice(0, 200),
    );
    process.exit(1);
  }
  clientOnly.set(
    specifier,
    new Set([...client].filter((name) => !server.has(name) && !name.startsWith("__"))),
  );
}
// 기준 자체가 죽으면 모든 모듈이 「클라이언트 전용 코드 없음」으로 통과한다. 그 경로를 막는다.
for (const [specifier, name] of [["react", "useState"], ["react", "createContext"], ["react-dom", "createPortal"]]) {
  if (!clientOnly.get(specifier).has(name)) {
    console.error(
      `[react-client-boundary] ${specifier} 의 클라이언트 전용 목록에 ${name} 이 없습니다. ` +
        "react-server 조건 해석이 바뀌었거나 차집합이 비었습니다 — 이 상태의 통과는 아무것도 보지 않은 것입니다.",
    );
    process.exit(1);
  }
}

// ── 소스 읽기 ─────────────────────────────────────────────────────────────
function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) found.push(full);
  }
  return found.sort();
}

// 주석을 같은 길이의 공백으로 바꾼다 — 줄 번호를 보존하고, 주석 속 예시 코드를 판정에서 뺀다.
// 문자열 리터럴 안의 `//` 는 건드리지 않도록 따옴표 구간을 건너뛴다.
function blankComments(source) {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '"' || ch === "'" || ch === "`") {
      const start = i;
      i += 1;
      while (i < source.length && source[i] !== ch) i += source[i] === "\\" ? 2 : 1;
      i += 1;
      out += source.slice(start, i);
    } else if (ch === "/" && next === "/") {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? source.length : end;
      out += " ".repeat(stop - i);
      i = stop;
    } else if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? source.length : end + 2;
      out += source.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else {
      out += ch;
      i += 1;
    }
  }
  return out;
}

const DIRECTIVE = /^(["'])use client\1\s*;?/;
const hasDirective = (code) => DIRECTIVE.test(code.trimStart());
const lineOf = (code, index) => code.slice(0, index).split("\n").length;

function clientSignals(code) {
  const signals = [];

  // (a) react-server 에 없는 API 를 값으로 import 한다.
  const importRe = /\bimport\s+(?!type\b)([^;]*?)\s+from\s+["'](react|react-dom)["']/gs;
  for (const match of code.matchAll(importRe)) {
    const clause = match[1];
    const banned = clientOnly.get(match[2]);
    const braces = clause.match(/\{([^}]*)\}/s);
    for (const raw of braces ? braces[1].split(",") : []) {
      const part = raw.trim();
      if (part === "" || part.startsWith("type ")) continue;
      const imported = part.split(/\s+as\s+/)[0].trim();
      if (banned.has(imported)) {
        signals.push(`${lineOf(code, match.index)}행 \`${imported}\` import (${match[2]} 가 react-server 에서 내보내지 않는다)`);
      }
    }
    // `import React from "react"` · `import * as React from "react"` 는 `React.useState` 로 쓴다.
    const bindings = clause.replace(/\{[^}]*\}/s, "").split(",").map((s) => s.trim()).filter(Boolean);
    for (const binding of bindings) {
      const ident = binding.replace(/^\*\s+as\s+/, "");
      if (!/^[A-Za-z_$][\w$]*$/.test(ident)) continue;
      for (const use of code.matchAll(new RegExp(`\\b${ident}\\.([A-Za-z_$][\\w$]*)`, "g"))) {
        if (banned.has(use[1])) {
          signals.push(`${lineOf(code, use.index)}행 \`${ident}.${use[1]}\` (${match[2]} 가 react-server 에서 내보내지 않는다)`);
        }
      }
    }
  }

  // (b) JSX 속성 값이 인라인 함수다.
  for (const match of code.matchAll(/(?<![\w$.-])([A-Za-z][\w-]*)=\{/g)) {
    const rest = code.slice(match.index + match[0].length);
    const body = rest.trimStart();
    let inline = /^(async\s+)?function\b/.test(body) || /^(async\s+)?[A-Za-z_$][\w$]*\s*=>/.test(body);
    if (!inline && /^(async\s*)?\(/.test(body)) {
      const open = body.indexOf("(");
      let depth = 0;
      let close = -1;
      for (let i = open; i < body.length; i += 1) {
        if (body[i] === "(") depth += 1;
        else if (body[i] === ")") {
          depth -= 1;
          if (depth === 0) {
            close = i;
            break;
          }
        }
      }
      inline = close !== -1 && /^\s*(:[^=;{}]*)?=>/.test(body.slice(close + 1));
    }
    if (inline) signals.push(`${lineOf(code, match.index)}행 \`${match[1]}\` 에 인라인 함수`);
  }

  // (c) `on*` 속성에 이 모듈이 만든 함수를 넘긴다.
  const localFunctions = new Set();
  for (const match of code.matchAll(
    /\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(?:async\s+)?(?:function\b|\(|[A-Za-z_$][\w$]*\s*=>|useCallback\s*\()/g,
  )) {
    localFunctions.add(match[1]);
  }
  for (const match of code.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*[<(]/g)) localFunctions.add(match[1]);
  // JSX 속성(`onClick={handle}`)과, Slot 에 넘기는 props 객체(`onClick: handle,`) 두 형태다.
  const handlerRes = [
    /(?<![\w$.])(on[A-Z][\w]*|ref)=\{\s*([A-Za-z_$][\w$]*)\s*\}/g,
    /(?<![\w$.])(on[A-Z][\w]*|ref)\s*:\s*([A-Za-z_$][\w$]*)\s*[,}\n]/g,
  ];
  for (const handlerRe of handlerRes) {
    for (const match of code.matchAll(handlerRe)) {
      // 컴포넌트 이름(대문자 시작)은 함수 선언이지만 핸들러로 넘기는 값이 아니다.
      if (localFunctions.has(match[2]) && !/^[A-Z]/.test(match[2])) {
        signals.push(`${lineOf(code, match.index)}행 \`${match[1]}\` 에 이 모듈의 함수 \`${match[2]}\``);
      }
    }
  }
  return signals;
}

function isBarrel(code) {
  const statements = code
    .trim()
    .replace(DIRECTIVE, "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    statements.length > 0 &&
    statements.every((s) => /^export\s+(type\s+)?(\{[^}]*\}|\*(\s+as\s+[\w$]+)?)\s+from\s+["'][^"']+["']$/s.test(s))
  );
}

// 패키지 루트 진입점. exports["."].import 가 가리키는 dist 파일의 소스다.
const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
const rootEntry = manifest.exports?.["."]?.import;
if (typeof rootEntry !== "string") {
  failures.push("packages/react/package.json 에서 exports[\".\"].import 를 읽지 못했습니다.");
}
const rootSource = typeof rootEntry === "string"
  ? join(srcRoot, relative(distRoot, join(packageRoot, rootEntry))).replace(/\.js$/, ".ts")
  : null;
if (rootSource !== null && !existsSync(rootSource)) {
  failures.push(`패키지 루트 진입점의 소스를 찾지 못했습니다: ${rel(rootSource)}`);
}

const files = walk(srcRoot);
let withDirective = 0;
let barrels = 0;
let clientModules = 0;
let distChecked = 0;
for (const file of files) {
  const code = blankComments(readFileSync(file, "utf8"));
  const directive = hasDirective(code);
  if (directive) withDirective += 1;

  const barrel = isBarrel(code);
  if (barrel) barrels += 1;
  if ((barrel || file === rootSource) && directive) {
    failures.push(
      `${rel(file)}: 재export 만 하는 모듈(또는 패키지 루트)에 "use client" 가 붙었습니다 — 서버에서 안전한 ` +
        "export 까지 전부 클라이언트 참조가 됩니다. 지시문은 클라이언트 코드를 가진 leaf 모듈에 붙입니다(DS-D-0002).",
    );
  }

  const signals = clientSignals(code);
  if (signals.length > 0) clientModules += 1;
  if (signals.length > 0 && !directive) {
    failures.push(
      `${rel(file)}: 첫 문장이 "use client" 가 아닌데 클라이언트 전용 코드를 씁니다 — ${signals.slice(0, 3).join(" · ")}` +
        (signals.length > 3 ? ` 외 ${signals.length - 3}건` : "") +
        ". Server Component 에서 패키지 루트를 import 하면 이 모듈이 서버 층에서 평가되어 깨집니다.",
    );
  }

  // dist 보존. `.tsx`·`.ts` 모두 `.js` 로 나온다.
  const emitted = join(distRoot, relative(srcRoot, file)).replace(/\.tsx?$/, ".js");
  if (!existsSync(emitted)) {
    failures.push(`${rel(file)} 의 dist 산출물이 없습니다: ${rel(emitted)}. \`pnpm run build:react\` 를 먼저 돕니다.`);
    continue;
  }
  distChecked += 1;
  const emittedDirective = hasDirective(blankComments(readFileSync(emitted, "utf8")));
  if (emittedDirective !== directive) {
    failures.push(
      `${rel(emitted)}: dist 의 "use client" 가 소스와 다릅니다(소스 ${directive ? "있음" : "없음"} · dist ` +
        `${emittedDirective ? "있음" : "없음"}). 빌드 도구가 지시문을 걷거나 dist 가 낡았습니다 — 소비자는 dist 를 받습니다.`,
    );
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`[react-client-boundary] ${failure}`);
  console.error(`[react-client-boundary] 실패 ${failures.length}건`);
  process.exit(1);
}
const apiCount = [...clientOnly.values()].reduce((sum, set) => sum + set.size, 0);
console.log(
  `[react-client-boundary] OK (소스 ${files.length}개 · 클라이언트 코드를 가진 모듈 ${clientModules}개가 전부 "use client" · ` +
    `지시문 ${withDirective}개 · 배럴 ${barrels}개와 루트는 무지시문 · dist ${distChecked}개가 지시문 보존 · ` +
    `클라이언트 전용 API ${apiCount}종은 react-server 조건 export 차집합에서 읽음)`,
);
