// **「값이 같기만 한 것」과 「같은 것을 가리키는 것」을 가르는 판정기.**
//
// 왜 있나: 제품이 면 사다리(`bg-canvas`·`bg-inset`·`bg-surface`·`bg-raised`·`bg-menu`·
// `bg-overlay`)와 **값이 같은 팔레트 칸을 이름으로 직접 물고** 있으면, 값이 같은 동안은
// 아무 차이가 없다. 그런데 사다리를 옮기는 순간 **그 자리만 뒤처진다.** 2026-09-08~09 에
// 그 형태를 넷 고쳤고 **제품 게이트 열 개가 전부 초록이었다** — 계산 스타일이 유효하고
// 대비도 멀쩡해서다. 잰 적이 없는 것은 어떤 게이트도 잡지 못한다.
//
//   `.appMainCardChromeSurface`        다크가 `--palette-gray-800` 직행
//   `gnb-menuSidebarActiveIndicator`   다크가 `--palette-gray-800` 직행
//   `gnb-mainChromeTopBarInPanel`      테마별 덮개 **두 줄**이 사다리 토큰 한 줄을 이겼다
//
// 마지막 형태가 가장 고약하다. 같은 클래스 목록 안에 `[background:var(--louis-color-bg-surface)]`
// 가 이미 있는데도 뒤에 오는 `light → palette-gray-000` · `dark → palette-gray-800` 두 줄이
// 특이도로 이겨서, 브라우저로 재기 전에는 「고쳤는데 값이 안 바뀐다」로만 보였다.
// 그래서 판정을 **선언 단위·테마 단위**로 한다 — 한 요소에 사다리 줄이 있다는 사실은
// 면제 사유가 아니다.
//
// ── 판정 규칙 ─────────────────────────────────────────────────────────────
// **팔레트를 직접 무는 것 자체는 위반이 아니다.** 고정색으로 의도된 자리가 많다 —
// 브랜드 색, 테마를 따라 뒤집으면 안 되는 것, 미디어 위 잉크. 위반은 하나뿐이다:
//
//   **그 값이 그 테마의 사다리 칸과 정확히 같은데, 사다리 이름이 아니라 팔레트 이름으로
//   적혀 있다.**
//
// ── 왜 평면 색만 보는가 ───────────────────────────────────────────────────
// 그라디언트 색 정지점·알파 합성은 제외한다. 알파가 100% 미만이면 화면에 나오는 값이
// 사다리 칸이 아니라 **그 아래 면과의 합성값**이라 「같은 값」이 성립하지 않고, 그라디언트는
// 애초에 한 칸이 아니다. 여기서 그것들까지 세면 baseline 이 「사다리와 무관한 것」으로
// 부풀어 아무도 안 읽는 목록이 된다 — 이 저장소가 이미 겪은 실패다.
//
// ── 왜 background 계열만 보는가 ───────────────────────────────────────────
// 사다리 칸은 **면**이다. 테두리색이나 글자색이 우연히 어떤 칸과 같은 값인 것은
// 「사다리가 움직이면 뒤처진다」와 다른 사건이다(그 자리는 원래 그 칸을 가리킬 이유가 없다).
// 고친 넷은 전부 `background` / `background-color` 였다.
//
// 이 모듈은 **순수하다** — 파일도 제품 저장소도 모른다. 그래서 게이트가 제품을 읽는 레인에
// 있어도 카나리아는 합성 입력으로 이 판정을 그대로 시험할 수 있다.

/** 주석을 지우되 **바이트 오프셋을 보존한다** — 줄 번호를 그대로 쓰기 위해서다. */
export function stripCssComments(css) {
  let out = "";
  for (let i = 0; i < css.length; ) {
    if (css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? css.length : end + 2;
      for (let j = i; j < stop; j++) out += css[j] === "\n" ? "\n" : " ";
      i = stop;
    } else {
      out += css[i];
      i += 1;
    }
  }
  return out;
}

/**
 * 중괄호 깊이를 따라가며 선언을 뽑는다. 전체 CSS 파서를 들이지 않는 이유는 필요한 것이
 * **선언 하나와 그것을 감싼 prelude 사슬** 둘뿐이기 때문이다(테마 스코프 판정에 쓴다).
 * @returns {{chain: string[], prop: string, value: string, line: number}[]}
 */
export function walkDeclarations(css) {
  const clean = stripCssComments(css);
  const decls = [];
  const stack = [];
  let buf = "";
  let start = 0;
  // 줄 번호는 개행 위치를 한 번만 훑어 이분 탐색한다. 선언마다 앞에서부터 세면
  // 2천 줄짜리 `globals.css` 에서 O(n^2) 가 된다.
  const newlines = [];
  for (let i = 0; i < clean.length; i++) if (clean[i] === "\n") newlines.push(i);
  const lineAt = (index) => {
    let lo = 0;
    let hi = newlines.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (newlines[mid] < index) lo = mid + 1;
      else hi = mid;
    }
    return lo + 1;
  };
  const flush = () => {
    const text = buf.trim();
    if (!text) return;
    const colon = text.indexOf(":");
    if (colon <= 0) return;
    decls.push({
      chain: [...stack],
      prop: text.slice(0, colon).trim(),
      value: text.slice(colon + 1).trim(),
      line: lineAt(start + buf.search(/\S/)),
    });
  };
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (c === "{") {
      stack.push(buf.trim().replace(/\s+/g, " "));
      buf = "";
      start = i + 1;
    } else if (c === "}") {
      flush();
      stack.pop();
      buf = "";
      start = i + 1;
    } else if (c === ";") {
      flush();
      buf = "";
      start = i + 1;
    } else {
      buf += c;
    }
  }
  return decls;
}

export const THEMES = ["light", "dark"];

/**
 * 어떤 테마에서 이 선언이 살아 있나.
 *
 * `:root` 는 **두 테마 다**다. `html[data-theme="dark"]` 가 html 을 겨눠도 `:root` 규칙은
 * 여전히 매치하고, 나중에 오는 다크 블록이 겹치는 이름만 덮는다 — 덮지 않은 이름은 다크에서도
 * `:root` 값이다. LOUIS 의 `:root, [data-theme="light"]` 블록을 「라이트 전용」으로 읽으면
 * 팔레트 프리미티브가 다크 지도에서 통째로 사라진다.
 */
export function themesFor(scope) {
  if (/:root\b/.test(scope)) return [...THEMES];
  const light = /\[data-theme=["']?light["']?\]|data-landing-walkthrough-light|(?:^|[^\w-])(?:walkthrough-)?light:/.test(scope);
  const dark = /\[data-theme=["']?dark["']?\]|data-landing-walkthrough-dark|(?:^|[^\w-])(?:walkthrough-)?dark:/.test(scope);
  if (light && !dark) return ["light"];
  if (dark && !light) return ["dark"];
  return [...THEMES];
}

/** 색을 비교 가능한 정본 문자열로 만든다. 표기가 달라도 같은 색이면 같은 키가 나와야 한다. */
export function normalizeColor(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase();
  const srgb = /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?)\s*)?\)$/.exec(value);
  if (srgb) return channels([srgb[1], srgb[2], srgb[3]].map(Number), srgb[4]);
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(value);
  if (hex) {
    const h = hex[1];
    const pair = (i) =>
      h.length === 3 ? parseInt(h[i] + h[i], 16) : parseInt(h.slice(i * 2, i * 2 + 2), 16);
    const alpha = h.length === 8 ? pair(3) / 255 : 1;
    return channels([pair(0) / 255, pair(1) / 255, pair(2) / 255], String(alpha));
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?)\s*)?\)$/.exec(value);
  if (rgb) return channels([rgb[1], rgb[2], rgb[3]].map((n) => Number(n) / 255), rgb[4]);
  return null;
}

function channels(rgb, alphaRaw) {
  const alpha =
    alphaRaw === undefined || alphaRaw === null || alphaRaw === ""
      ? 1
      : alphaRaw.endsWith("%")
        ? Number(alphaRaw.slice(0, -1)) / 100
        : Number(alphaRaw);
  if (rgb.some((n) => !Number.isFinite(n)) || !Number.isFinite(alpha)) return null;
  const round = (n) => Math.round(n * 1e6) / 1e6;
  return rgb.map(round).join(" ") + " / " + round(alpha);
}

/** LOUIS 생성 토큰에서 이름 → 값 지도를 테마별로 만든다(문서 순서대로 덮어쓴다). */
export function readTokenMaps(cssText) {
  const maps = { light: new Map(), dark: new Map() };
  for (const decl of walkDeclarations(cssText)) {
    if (!decl.prop.startsWith("--")) continue;
    for (const theme of themesFor(decl.chain.join(" "))) maps[theme].set(decl.prop, decl.value);
  }
  return maps;
}

/** 사다리 칸. `bg-*` 여섯을 다 본다 — 「카드 위 한 칸」 사고가 `bg-raised` 에서 났다. */
export const LADDER_RUNGS = ["canvas", "inset", "surface", "raised", "menu", "overlay"];

export function readLadder(louisTokenMaps) {
  const ladder = { light: new Map(), dark: new Map() };
  for (const theme of THEMES) {
    for (const rung of LADDER_RUNGS) {
      const value = normalizeColor(louisTokenMaps[theme].get("--louis-color-bg-" + rung));
      if (value) ladder[theme].set(rung, value);
    }
  }
  return ladder;
}

/** 제품이 정의한 팔레트/시맨틱 별칭 이름. `-rgb` 짝까지 걷는다. */
const ALIAS_NAME = /^--(?:palette-gray-\d+|palette-white|gray-\d+)(?:-rgb)?$/;

export function readProductAliases(globalsCss) {
  const aliases = { light: new Map(), dark: new Map() };
  for (const decl of walkDeclarations(globalsCss)) {
    if (!ALIAS_NAME.test(decl.prop)) continue;
    for (const theme of themesFor(decl.chain.join(" "))) aliases[theme].set(decl.prop, decl.value);
  }
  return aliases;
}

/**
 * 별칭 이름을 그 테마의 실제 색으로 푼다. 제품 별칭 → LOUIS 프리미티브까지 사슬을 따라간다.
 * `-rgb` 채널 별칭은 짝이 되는 색 이름으로 갈아탄다 — 채널 목록만으로는 색이 아니다.
 */
export function resolveAliasColor(name, theme, { aliases, louis }, depth = 0) {
  if (depth > 8) return null;
  const bare = name.endsWith("-rgb") ? name.slice(0, -4) : name;
  if (bare.startsWith("--louis-")) return normalizeColor(louis[theme].get(bare));
  const raw = aliases[theme].get(bare);
  if (raw === undefined) return null;
  const indirect = /^var\(\s*(--[\w-]+)\s*\)$/.exec(raw.trim());
  if (indirect) return resolveAliasColor(indirect[1], theme, { aliases, louis }, depth + 1);
  return normalizeColor(raw);
}

// ── 「평면 면 색」의 형태 ───────────────────────────────────────────────────
// 알파를 붙인 `rgb(var(--x-rgb) / 24%)` 는 여기 들지 않는다(위 머리말). `/ 100%` 는 든다 —
// 그건 알파를 쓴 것이 아니라 같은 색을 다르게 적은 것이다.
const ALIAS_TOKEN = String.raw`--(?:palette-gray-\d+|palette-white|gray-\d+)`;
const FLAT_COLOR = new RegExp(
  String.raw`^(?:var\(\s*(${ALIAS_TOKEN})\s*\)|rgb\(\s*var\(\s*(${ALIAS_TOKEN})-rgb\s*\)\s*(?:/\s*100%\s*)?\))$`,
);
const BACKGROUND_PROP = /^(?:background|background-color)$/;

function verdictsFor({ file, line, scope, token, prop, evidence }, context) {
  const found = [];
  for (const theme of themesFor(scope)) {
    const color = resolveAliasColor(token, theme, context);
    if (!color) continue;
    const rungs = LADDER_RUNGS.filter((rung) => context.ladder[theme].get(rung) === color);
    if (rungs.length === 0) continue;
    found.push({ file, line, theme, token, prop, rungs, evidence, color });
  }
  return found;
}

/** 제품 CSS 한 벌에서 위반 후보를 뽑는다. */
export function scanCss(file, cssText, context) {
  const found = [];
  for (const decl of walkDeclarations(cssText)) {
    if (!BACKGROUND_PROP.test(decl.prop)) continue;
    const flat = FLAT_COLOR.exec(decl.value.replace(/\s+/g, " ").trim());
    if (!flat) continue;
    found.push(
      ...verdictsFor(
        {
          file,
          line: decl.line,
          scope: decl.chain.join(" "),
          token: flat[1] ?? flat[2],
          prop: decl.prop,
          evidence: (decl.chain.at(-1) ?? "") + " { " + decl.prop + ": " + decl.value + " }",
        },
        context,
      ),
    );
  }
  return found;
}

// Tailwind 임의값(`[background:var(--palette-gray-800)]`)과 유틸리티(`bg-palette-gray-050`).
// **오늘 고친 셋 중 둘이 `.tsx` 였다** — CSS 파일만 보면 그 둘을 통째로 놓친다.
const ARBITRARY = new RegExp(
  String.raw`\[(background|background-color):(var\(\s*${ALIAS_TOKEN}\s*\)|rgb\(\s*var\(\s*${ALIAS_TOKEN}-rgb\s*\)(?:\s*/\s*100%)?\))\]`,
);
const UTILITY = new RegExp(String.raw`(?:^|:)bg-(palette-gray-\d+|palette-white|gray-\d+)!?$`);

/** `.ts`/`.tsx` 한 벌에서 위반 후보를 뽑는다. */
export function scanScript(file, sourceText, context) {
  const text = stripCssComments(sourceText); // `/* */` 주석은 클래스가 아니다
  const found = [];
  // 공백과 따옴표로만 자른다. 괄호를 구분자로 넣으면 `[background:var(--palette-gray-800)]`
  // 이 세 조각으로 갈려 **가장 흔한 형태를 통째로 놓친다**(실제로 46 대 78 로 셌다).
  const tokenPattern = /[^\s"'`]+/g;
  let match;
  let line = 1;
  let cursor = 0;
  while ((match = tokenPattern.exec(text)) !== null) {
    const raw = match[0];
    if (!/palette-gray-|palette-white|gray-\d/.test(raw)) continue;
    while (cursor < match.index) {
      if (text[cursor] === "\n") line += 1;
      cursor += 1;
    }
    const arbitrary = ARBITRARY.exec(raw);
    const utility = UTILITY.exec(raw);
    let token = null;
    let prop = null;
    if (arbitrary) {
      prop = arbitrary[1];
      token = new RegExp(ALIAS_TOKEN).exec(arbitrary[2])[0];
    } else if (utility) {
      prop = "background-color";
      token = "--" + utility[1];
    }
    if (!token) continue;
    found.push(
      ...verdictsFor(
        { file, line, scope: raw, token, prop, evidence: raw.slice(0, 160) },
        context,
      ),
    );
  }
  return found;
}

/** 한 위반의 **모양**. 줄 번호는 넣지 않는다 — 줄이 움직였다고 새 위반이 아니다. */
export function findingKey(finding) {
  return [finding.file, finding.theme, finding.token, finding.prop, finding.evidence].join("|");
}

/**
 * 모양이 같은 자리를 **접지 않고 세는** 정체를 붙인다.
 *
 * `findingKey` 만으로 Map 에 담으면 **한 파일 안에 글자까지 같은 자리가 둘 있을 때 하나로
 * 접힌다.** 그러면 그 파일의 수가 오르지 않아 래칫이 새 위반을 못 본다 — 실제로 그랬다:
 * `navigation/Gnb.tsx` 에는 `[html[data-theme=dark]_&]:[background:var(--palette-gray-800)]`
 * 이 이미 있어서, 같은 글자로 새로 들어온 자리가 그 칸으로 접혀 9→9 였다. 두 줄을 지웠는데
 * 1 만 줄어드는 것도 같은 원인이다.
 *
 * 그래서 **그 파일 안에서 같은 모양의 몇 번째인가**를 정체에 더한다. 줄이 움직여도 개수는
 * 변하지 않으므로 「줄 번호를 키에 넣지 않는다」는 원칙은 그대로다. 순서가 바뀌어도 파일의
 * 수는 같아 래칫은 흔들리지 않는다.
 */
export function dedupe(findings) {
  const seen = new Map();
  const out = new Map();
  for (const finding of findings) {
    const shape = findingKey(finding);
    const nth = (seen.get(shape) ?? 0) + 1;
    seen.set(shape, nth);
    out.set(shape + "#" + nth, finding);
  }
  return [...out.values()];
}

// ── 면제 ──────────────────────────────────────────────────────────────────
// 「값이 같지만 의도적으로 고정색인」 자리를 위한 문이다. 브랜드 색, 테마를 따라 뒤집으면
// 안 되는 것, 미디어 위 잉크가 여기 든다.
//
// **사유 없는 면제는 받지 않는다.** 사유 없는 목록은 시간이 지나면 「왜 여기 있는지 아무도
// 모르는 침묵」이 되고, 그 침묵이 곧 게이트를 끄는 방법이 된다. **아무 자리도 안 무는 면제도
// 받지 않는다** — 남은 면제는 같은 자리로 돌아오는 위반을 조용히 통과시킨다
// (`migration/doc-path-exemptions.json` 이 같은 규칙을 쓴다).
export const EXEMPTION_THEMES = ["light", "dark", "both"];
const MIN_WHY = 10;

export function readExemptions(doc, label = "면제 명부") {
  const problems = [];
  const index = new Map();
  if (!Array.isArray(doc?.exemptions)) {
    problems.push(label + " 의 `exemptions` 가 배열이 아닙니다.");
    return { problems, index };
  }
  doc.exemptions.forEach((entry, i) => {
    const at = label + "[" + i + "]";
    // `evidence` 는 아래에서 따로 본다 — 없을 때 「왜 필요한가」를 말해야 하기 때문이다.
    for (const field of ["file", "token", "theme"]) {
      if (typeof entry?.[field] !== "string" || entry[field].trim() === "")
        problems.push(at + " 에 `" + field + "` 가 없습니다.");
    }
    if (typeof entry?.why !== "string" || entry.why.trim().length < MIN_WHY) {
      problems.push(
        at + " (" + (entry?.file ?? "?") + " · " + (entry?.token ?? "?") + ") 에 사유(`why`)가 " +
          "없습니다. **사유 없는 면제는 받지 않습니다** — 이 자리가 왜 고정색이어야 하는지 " +
          "한 문장으로 적으세요.",
      );
    }
    if (typeof entry?.theme === "string" && !EXEMPTION_THEMES.includes(entry.theme))
      problems.push(at + " 의 `theme` 는 " + EXEMPTION_THEMES.join(" · ") + " 중 하나여야 합니다: " + entry.theme);
    if (typeof entry?.evidence !== "string" || entry.evidence.trim() === "")
      problems.push(
        at + " (" + (entry?.file ?? "?") + " · " + (entry?.token ?? "?") + ") 에 `evidence` 가 " +
          "없습니다. 면제는 **그 자리의 모양**에 붙습니다 — 파일×토큰×테마로만 적으면 그 파일의 " +
          "같은 토큰 배경이 한꺼번에 열리고, 나중에 더해지는 같은 형태까지 조용히 통과합니다. " +
          "게이트 출력의 `evidence` 를 그대로 옮기세요.",
      );
    index.set(
      [entry?.file, entry?.token, entry?.theme, entry?.evidence].join("|"),
      { entry, used: false },
    );
  });
  return { problems, index };
}

export function partitionByExemption(findings, index, label = "면제 명부") {
  const live = [];
  const exempted = [];
  for (const finding of findings) {
    const hit =
      index.get([finding.file, finding.token, finding.theme, finding.evidence].join("|")) ??
      index.get([finding.file, finding.token, "both", finding.evidence].join("|"));
    if (hit) {
      hit.used = true;
      exempted.push(finding);
    } else {
      live.push(finding);
    }
  }
  const stale = [];
  for (const [key, value] of index) {
    if (!value.used)
      stale.push(
        label + " 의 면제가 아무 자리도 가리키지 않습니다: " + key + ". 위반이 사라졌다면 " +
          "면제도 지우세요 — 남은 면제는 같은 자리로 돌아오는 위반을 조용히 통과시킵니다.",
      );
  }
  return { live, exempted, stale };
}

// ── 파일 단위 한 방향 래칫 ────────────────────────────────────────────────
// 합계 하나로 잠그면 A 에서 하나 고치고 B 에 하나 넣는 것이 통과한다. 제품 저장소의
// `lint-baseline.json` 이 per file 로 얼린 것과 같은 이유로 파일마다 잠근다.
export function countByFile(findings) {
  const counts = {};
  for (const finding of findings) counts[finding.file] = (counts[finding.file] ?? 0) + 1;
  return counts;
}

export function ratchet(counts, baseline) {
  const grew = [];
  const shrank = [];
  for (const file of [...new Set([...Object.keys(baseline ?? {}), ...Object.keys(counts)])].sort()) {
    const was = baseline?.[file] ?? 0;
    const now = counts[file] ?? 0;
    if (now > was) grew.push({ file, was, now });
    else if (now < was) shrank.push({ file, was, now });
  }
  return { grew, shrank };
}
