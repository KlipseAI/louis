// **라이브 LOUIS 변수를 되읽기에서 푸는 공용 헬퍼(2026-09-14).**
//
// 제품 컴포넌트 러너는 라이브 파일 `OlYKERKOkgbxBEEoXGZW2c` 의 변수에 칠과 간격을 묶는다. 그 파일의 컬렉션은
// `Klipse Primitive[Base]` · `Klipse Semantic[Global]` · `Klipse Semantic Color[Light/Dark]` 셋이고, 은퇴한
// `1 · Palette` · `2 · Semantic` · `3 · Scale` 을 찾는 러너는 첫머리에서 던진다(조립 규칙 27번). 앱 셸 생성기가
// 2026-09-13 에 먼저 옮겼고, 이 헬퍼는 그 방식 — 되읽기(`figma/readback.json`)에서 이름과 값을 확인하고, 측정 색과
// 라이브 해석값을 나란히 적는다 — 을 나머지 생성기가 같이 쓰도록 뽑은 것이다. 렌더러 쪽 짝은
// `scripts/templates/lib/figma-live-variables.js` 다(생성기가 렌더러 앞에 붙인다).
// **앱 셸 생성기 자신은 이 헬퍼로 옮기지 않았다** — 그 러너는 라이브 적용 순서의 첫 단계로 포장 · 해시가 떠 있어,
// 같은 뜻의 코드라도 생성물 바이트를 바꾸면 적용 준비가 무효가 된다.
//
// **색은 이름을 짐작하지 않는다.** 역할마다 제품 선언(토큰 — 소스 인용)과 그 선언이 가리키는 라이브 변수를 적고,
// 측정 색이 그 변수의 해석값(측정 테마의 모드)과 **같아야** 묶는다. 같은 값의 변수가 없으면 둘 중 하나만 허용한다:
//   · `mix` + `reason`(근사 결합) — 제품이 `rgb(var(--x-rgb) / N%)` 로 칠하고, 라이브에 같은 이름 계열의 알파 변수가
//     있지만 그 변수의 RGB 가 제품과 다른 자리. 측정은 `mix.base` 변수의 RGB + N% 와 같아야 하고, 결합 대상 변수와는
//     달라야 한다(같아지면 사유가 낡은 것이라 실패한다). 앱 셸 계획의 `bindingEvidence.*.exact=false` 와 같은 처리다.
//   · `unbound` + `mix` + `reason`(고정 페인트) — 제품 토큰에 대응하는 라이브 변수가 없는 자리. 러너는 측정 색으로
//     칠하고 `unboundColors` 로 역할과 페인트 수를 돌려준다(앱 화면 러너의 `unboundColors` 보고와 같은 뜻). 값이 같은
//     라이브 변수가 하나라도 있으면(`liveValueTwins`) 고정 페인트를 허용하지 않는다 — 묶을 수 있는 색을 고정하는 것이다.
//     조용히 고정 페인트로 떨어지는 경로는 없다 — 역할에 없는 측정 색은 생성기가 멈춘다.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// 역할의 `declared` 는 제품 소스 줄 인용이다 — 같은 커밋의 그 줄이 문자 그대로 같아야 한다. 근거 문자열에는 기계마다
// 다른 절대경로를 적지 않는다(check 가 KLIPSE_PRODUCT_REPO 철자에 따라 갈린다). DS 레시피(LOUIS CSS)는 이 저장소의
// 파일이라 `repoRoot` 에서 읽는다 — 제품이 핀한 LOUIS 와 같은 뜻인지는 측정 색 대조가 판정한다.
export const sourceQuotes = ({ repoRoot, productRoot, productCommit, fail }) => {
  const cache = new Map();
  const lineOf = (key, read, line) => {
    if (!cache.has(key)) cache.set(key, read().split("\n"));
    return cache.get(key)[line - 1] ?? "";
  };
  return {
    product: (path, line, expected) => {
      const quote = lineOf(`product:${path}`, () => execFileSync("git", ["-C", productRoot, "show", `${productCommit}:${path}`], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }), line);
      if (quote !== expected) fail(`source quote drift ${path}:${line}: ${JSON.stringify(quote)}`);
      return { command: `git -C "$KLIPSE_PRODUCT_REPO" show ${productCommit}:${path}`, path, line, quote };
    },
    ds: (path, line, expected) => {
      const quote = lineOf(`ds:${path}`, () => readFileSync(resolve(repoRoot, path), "utf8"), line);
      if (quote !== expected) fail(`DS source quote drift ${path}:${line}: ${JSON.stringify(quote)}`);
      return { path, line, quote };
    },
  };
};

// 렌더러 앞에 붙이는 샌드박스 조각 — 생성기가 `PLAN` 줄 뒤 · 템플릿 앞에 싣는다.
export const RENDERER_LIB = "scripts/templates/lib/figma-live-variables.js";
export const LIVE_COLLECTIONS = ["Klipse Primitive", "Klipse Semantic", "Klipse Semantic Color"];
export const COLOR_COLLECTION = "Klipse Semantic Color";
export const PRIMITIVE_COLLECTION = "Klipse Primitive";
export const RETIRED_COLLECTIONS = ["1 · Palette", "2 · Semantic", "3 · Scale"];
export const THEME_MODE = { light: "Light", dark: "Dark" };

const channel = (value) => Math.round(value * 255);
const hexOf = (rgba) => `#${rgba.slice(0, 3).map((value) => channel(value).toString(16).padStart(2, "0")).join("")}`;
// 렌더러 프렐류드의 `colorKey` 와 같은 식이다 — 8비트 채널과 천분의 일 알파.
export const colorKey = (rgba) => `${channel(rgba[0])},${channel(rgba[1])},${channel(rgba[2])},${Math.round((rgba[3] ?? 1) * 1000) / 1000}`;
const sameColor = (left, right) =>
  [0, 1, 2].every((index) => channel(left[index]) === channel(right[index])) && channel(left[3] ?? 1) === channel(right[3] ?? 1);

// 브라우저 계산 색의 두 직렬화(legacy `rgb()` 0–255 · `color(srgb …)` 0–1)를 함께 읽는다. 알파는 두 꼴 모두 수(`0.08`)나
// 백분율(`/ 8%`)로 올 수 있다 — 백분율을 받지 않으면 `unsupported color` 로 멈추거나(여기), 다른 파서처럼 알파를 잃고 1 로
// 떨어진다. 아래 단위 확인이 모듈을 읽을 때 두 꼴 · 두 알파 표기를 한 번씩 푼다(verify-gates 카나리아가 그 확인을 문다).
const alphaOf = (raw) => (raw === undefined ? 1 : raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw));
export const parseCssColor = (value, fail) => {
  const raw = String(value ?? "").trim();
  const legacy = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+%?))?\s*\)$/.exec(raw);
  if (legacy) return [Number(legacy[1]) / 255, Number(legacy[2]) / 255, Number(legacy[3]) / 255, alphaOf(legacy[4])];
  const modern = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(raw);
  if (modern) return [Number(modern[1]), Number(modern[2]), Number(modern[3]), alphaOf(modern[4])];
  return fail(`unsupported color ${value}`);
};
for (const [input, expected] of [
  ["rgb(23, 27, 34)", [23 / 255, 27 / 255, 34 / 255, 1]],
  ["rgba(0, 0, 0, 0.48)", [0, 0, 0, 0.48]],
  ["rgb(23 27 34 / 56%)", [23 / 255, 27 / 255, 34 / 255, 0.56]],
  ["color(srgb 0.25 0.5 1)", [0.25, 0.5, 1, 1]],
  ["color(srgb 0.25 0.5 1 / 0.08)", [0.25, 0.5, 1, 0.08]],
  ["color(srgb 0.25 0.5 1 / 8%)", [0.25, 0.5, 1, 0.08]],
]) {
  const actual = parseCssColor(input, (message) => { throw new Error(`parseCssColor 단위 확인: ${message}`); });
  if (actual.length !== 4 || actual.some((channel, index) => !(Math.abs(channel - expected[index]) <= 1e-9))) {
    throw new Error(`parseCssColor 단위 확인: ${input} → ${JSON.stringify(actual)} (기대 ${JSON.stringify(expected)})`);
  }
}

export const liveVariables = ({ repoRoot, fail }) => {
  const readback = JSON.parse(readFileSync(resolve(repoRoot, "figma/readback.json"), "utf8"));
  const collections = readback.collections ?? {};
  for (const name of RETIRED_COLLECTIONS) {
    if (collections[name]) fail(`figma/readback.json still carries the retired collection ${name}`);
  }
  for (const name of LIVE_COLLECTIONS) {
    if (!collections[name]) fail(`figma/readback.json has no live collection ${name}`);
  }
  const rowOf = (collection, name) => collections[collection]?.rows?.find((entry) => entry[0] === name) ?? null;
  // 모드가 하나뿐인 컬렉션은 그 모드로, 여럿인 컬렉션(`Klipse Semantic Color`)은 요청한 모드로 푼다.
  const modeEntry = (collection, row, mode) => {
    const modes = collections[collection].modes;
    const wanted = modes.length > 1 ? mode : modes[0];
    return row[3].find((entry) => entry[0] === wanted) ?? fail(`${collection}/${row[0]} has no ${wanted} value in figma/readback.json`);
  };
  const resolveValue = (collection, name, mode, type, chain = []) => {
    const key = `${collection}/${name}`;
    if (chain.includes(key)) fail(`circular Figma variable ${key}`);
    const row = rowOf(collection, name);
    if (!row) return null;
    if (row[1] !== type) fail(`${key} is ${row[1]}, not ${type}`);
    const [, alias, raw] = modeEntry(collection, row, mode);
    if (!alias) return { value: raw, chain: [...chain, key] };
    const at = alias.indexOf("::");
    return resolveValue(alias.slice(0, at), alias.slice(at + 2), mode, type, [...chain, key]) ?? fail(`${key} aliases a missing variable ${alias}`);
  };
  const assertBinding = (binding, where) => {
    if (!LIVE_COLLECTIONS.includes(binding.collection)) fail(`${where}: ${binding.collection} is not a live collection (${LIVE_COLLECTIONS.join(" · ")})`);
    if (!rowOf(binding.collection, binding.name)) fail(`${where}: figma/readback.json has no variable ${binding.collection}/${binding.name}`);
    return binding;
  };
  // 수 변수 — 없으면 null(값이 같은 토큰이 있을 때만 묶는 간격용), 있으면 별칭을 따라 푼 값.
  const floatOrNull = (collection, name) => resolveValue(collection, name, null, "FLOAT")?.value ?? null;
  const float = (collection, name) => floatOrNull(collection, name) ?? fail(`figma/readback.json has no FLOAT variable ${collection}/${name}`);
  // 측정 px 과 값이 같은 `Klipse Primitive/spacing/<n>` 만 묶는다. 토큰이 없는 값(뷰포트 계산값 등)은 빈 배열.
  const spacingBinding = (value) =>
    floatOrNull(PRIMITIVE_COLLECTION, `spacing/${value}`) === value
      ? [[`spacing${value}`, { collection: PRIMITIVE_COLLECTION, name: `spacing/${value}` }]]
      : [];
  const radiusBinding = (value, name, where) => {
    if (float(PRIMITIVE_COLLECTION, name) !== value) fail(`${where}: radius ${value} is not ${PRIMITIVE_COLLECTION}/${name}`);
    return { collection: PRIMITIVE_COLLECTION, name };
  };

  // **색 역할.** `roles[key]` 는 셋 중 하나다:
  //   { name, collection?, declared }                                  — 측정 = 라이브 해석값이어야 한다
  //   { name, collection?, declared, mix: { name, collection?, alpha }, reason } — 근사 결합(위 머리말)
  //   { unbound: true, declared, mix: { name, collection?, alpha }, reason }     — 고정 페인트(위 머리말)
  //   { name, collection?, annotation }                                — 보드 주석(문서 프레임) 잉크. 측정 자리 없음
  //   { name, collection?, declared, unmeasured }                      — 제품이 선언한 칠이지만 이 측정이 재지 않는 자리.
  //                                                                       선언 인용은 있고 측정 대조는 없다(`exact: null`) — 주석 잉크와 다른 종류다
  const colorRoles = ({ theme, roles, where: planName }) => {
    const mode = THEME_MODE[theme] ?? fail(`${planName}: unknown measured theme ${theme}`);
    const colorOf = (binding, label) => {
      const collection = binding.collection ?? COLOR_COLLECTION;
      const resolved = resolveValue(collection, binding.name, mode, "COLOR") ?? fail(`${planName} ${label}: figma/readback.json has no COLOR variable ${collection}/${binding.name}`);
      return { collection, ...resolved };
    };
    const table = Object.fromEntries(Object.entries(roles).map(([key, role]) => {
      if (!role.declared && !role.annotation) fail(`${planName} colour role ${key} has no product declaration`);
      if (role.annotation && role.declared) fail(`${planName} colour role ${key}: an annotation ink has no product declaration — use unmeasured for a declared paint without a measured site`);
      if (role.unmeasured && (!role.declared || role.unbound || role.mix)) fail(`${planName} colour role ${key}: unmeasured needs a product declaration and a live variable`);
      if ((role.unbound || role.mix) && !role.reason) fail(`${planName} colour role ${key} needs a reason`);
      const live = role.unbound ? null : colorOf(role, key);
      const base = role.mix ? colorOf(role.mix, `${key} mix`) : null;
      const expected = base ? [...base.value.slice(0, 3), role.mix.alpha] : live?.value;
      if (role.mix && !role.unbound && sameColor(expected, live.value)) {
        fail(`${planName} colour role ${key}: ${live.collection}/${role.name} now equals the product value — drop the approximate reason`);
      }
      // 근사 · 고정 역할은 측정과 **값이 같은** 라이브 변수를 함께 적는다 — 이름(뜻)이 달라 묶지 않은 것이 보이게.
      const twins = role.mix
        ? LIVE_COLLECTIONS.filter((collection) => collection !== "Klipse Semantic").flatMap((collection) =>
          collections[collection].rows.filter((row) => row[1] === "COLOR")
            .filter((row) => sameColor(resolveValue(collection, row[0], mode, "COLOR").value, expected))
            .map((row) => `${collection}/${row[0]}`))
        : [];
      if (role.unbound && twins.length) {
        fail(`${planName} colour role ${key} is unbound but ${twins.join(" · ")} resolves to the same value in ${mode} — bind it instead of painting a fixed colour`);
      }
      return [key, { role, live, base, expected, twins, sites: 0 }];
    }));
    // 측정 자리 하나의 역할을 고른다 — 후보는 제품 선언이 정한 역할들이고, 그중 기대 색이 측정과 같은 하나여야 한다.
    const paintFor = (candidates, measured, where) => {
      const matches = candidates.filter((key) => {
        const entry = table[key] ?? fail(`${planName} ${where}: unknown colour role ${key}`);
        if (entry.role.annotation) fail(`${planName} ${where}: ${key} is an annotation ink, not a measured paint`);
        if (entry.role.unmeasured) fail(`${planName} ${where}: ${key} is declared without a measured site — it cannot match a measured paint`);
        return sameColor(entry.expected, measured);
      });
      if (matches.length !== 1) {
        fail(`${planName} ${where}: measured ${hexOf(measured)}/${measured[3] ?? 1} matches ${matches.length ? matches.join(" · ") : "none"} of ${candidates.join(" · ")} — add or fix the colour role`);
      }
      table[matches[0]].sites += 1;
      return matches[0];
    };
    // 생성이 끝난 뒤 부른다 — 쓰이지 않은 역할이 남으면 표가 낡은 것이다.
    const finish = () => {
      const unused = Object.entries(table).filter(([, entry]) => !entry.role.annotation && !entry.role.unmeasured && entry.sites === 0).map(([key]) => key);
      if (unused.length) fail(`${planName}: colour roles without a measured site ${unused.join(", ")}`);
      const bindings = {
        modeCollection: COLOR_COLLECTION,
        mode,
        ...Object.fromEntries(Object.entries(table).filter(([, entry]) => !entry.role.unbound).map(([key, entry]) => [
          key,
          assertBinding({ collection: entry.live.collection, name: entry.role.name }, `${planName} ${key}`),
        ])),
      };
      const unbound = Object.fromEntries(Object.entries(table).filter(([, entry]) => entry.role.unbound).map(([key, entry]) => [
        key,
        { color: entry.expected.map((value) => Math.round(value * 1e6) / 1e6), reason: entry.role.reason },
      ]));
      const evidence = Object.fromEntries(Object.entries(table).map(([key, entry]) => {
        const { role, live, base } = entry;
        const via = (resolved) => resolved.chain
          .map((step) => (step.startsWith(`${COLOR_COLLECTION}/`) ? `${COLOR_COLLECTION}[${mode}]${step.slice(COLOR_COLLECTION.length)}` : step))
          .join(" → ");
        return [key, {
          declared: role.declared ?? null,
          ...(role.annotation ? { annotation: role.annotation }
            : role.unmeasured ? { unmeasured: role.unmeasured }
              : { measured: hexOf(entry.expected), measuredAlpha: entry.expected[3] ?? 1, sites: entry.sites }),
          figma: live ? via(live) : null,
          ...(live ? { figmaValue: hexOf(live.value), figmaAlpha: live.value[3] ?? 1 } : {}),
          ...(base ? { productMix: `${via(base)} × ${role.mix.alpha}` } : {}),
          exact: role.annotation || role.unmeasured ? null : Boolean(live) && !role.mix,
          ...(role.reason ? { reason: role.reason, liveValueTwins: entry.twins } : {}),
        }];
      }));
      return { bindings: Object.keys(unbound).length ? { ...bindings, unbound } : bindings, evidence };
    };
    return { mode, paintFor, finish };
  };

  // 계획의 bindings 전부가 라이브 컬렉션의 실재 변수인지 — 은퇴한 컬렉션 이름이 새면 여기서 멈춘다.
  const assertBindings = (bindings, where) => {
    for (const [key, binding] of Object.entries(bindings)) {
      if (binding && typeof binding === "object" && typeof binding.collection === "string") assertBinding(binding, `${where} ${key}`);
    }
    if (bindings.modeCollection !== undefined && !collections[bindings.modeCollection]?.modes.includes(bindings.mode)) {
      fail(`${where}: ${bindings.modeCollection} has no mode ${bindings.mode}`);
    }
    return bindings;
  };

  // 컬렉션의 색 변수 전부를 한 모드에서 푼 값 — 역할 이름 없이 **값으로** 변수를 찾는 앱 화면 보드 렌더러의 짝이다.
  // 렌더러 조각의 `resolve` 와 같은 규칙(여러 모드 컬렉션만 요청 모드, 나머지는 기본 모드)으로 되읽기에서 푼다.
  const colorVariables = (collectionNames, mode) => collectionNames.flatMap((collection) => {
    if (!LIVE_COLLECTIONS.includes(collection)) fail(`${collection} is not a live collection (${LIVE_COLLECTIONS.join(" · ")})`);
    return collections[collection].rows.filter((row) => row[1] === "COLOR")
      .map((row) => ({ collection, name: row[0], value: resolveValue(collection, row[0], mode, "COLOR").value }));
  });

  return { readback, float, floatOrNull, spacingBinding, radiusBinding, colorRoles, assertBindings, colorVariables };
};

// **중첩 세트의 고정 역할.** 장면 러너의 감사는 품은 인스턴스 속 칠까지 센다 — 사이드바 셸(컴포넌트 러너)의 BETA 칩처럼
// 다른 러너가 사유와 함께 고정 역할로 칠한 색은 그 러너의 계획에서 읽어 인스턴스 안에서만 받는다. 계획이 이 앵커가
// 아니면 멈춘다(그 생성기를 먼저 돈다). 사유는 원래 계획의 `colorEvidence` 가 갖는다.
export const nestedFixedPaints = ({ repoRoot, fail, productCommit, plans }) => plans.flatMap((path) => {
  const plan = JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
  if (plan.productCommit !== productCommit) fail(`${path} (${String(plan.productCommit).slice(0, 8)}) is not at this anchor — run its generator first`);
  const bindings = plan.component?.bindings ?? plan.figma?.bindings ?? {};
  return Object.entries(bindings.unbound ?? {}).map(([role, entry]) => ({ source: path.replace(/^figma\/|\.plan\.json$/g, ""), role, color: entry.color }));
});

export const BINDING_POLICY =
  "Paints bind to the live LOUIS collections (Klipse Primitive[Base] · Klipse Semantic[Global] · Klipse Semantic Color[Light/Dark]); the retired 1 · Palette / 2 · Semantic are gone. " +
  "The measured theme picks the pinned Klipse Semantic Color mode. Every measured paint takes the colour role its product declaration names, and the role binds only when the measured colour equals the live value (colorEvidence). " +
  "Approximate roles (product rgb(var(--x-rgb) / N%) against a live alpha ramp with other RGB) and unbound roles (no live variable for the product token) are listed with a reason; unbound roles paint the measured colour and the runner reports them as unboundColors.";
