import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(repoRoot, "migration/product.auth-fixture.json");
const planPath = resolve(repoRoot, "figma/product-components.plan.json");
const drawPath = resolve(repoRoot, "figma/product-components.draw.js");
const checkOnly = process.argv.includes("--check");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const contextName = "desktop-1920x1080";
const screens = fixture.screens[contextName];
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));

const fail = (message) => {
  throw new Error(`[figma-product-components] ${message}`);
};
const sourceQuote = (path, line, expected) => {
  const command = `git -C ${productRoot} show ${fixture.productCommit}:${path}`;
  const source = execFileSync("git", ["-C", productRoot, "show", `${fixture.productCommit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  const quote = source.split("\n")[line - 1] ?? "";
  if (quote !== expected) fail(`source quote drift ${path}:${line}: ${JSON.stringify(quote)}`);
  return { command, path, line, quote };
};
const screen = (route) => screens[route] ?? fail(`missing screen ${route}`);
const node = (route, path) =>
  screen(route).tree.find((entry) => entry.path === path) ?? fail(`missing node ${route} ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const byText = (route, text) =>
  screen(route).tree.find((entry) => entry.ownText === text) ?? fail(`missing text ${route} ${text}`);
const byAria = (route, ariaLabel) =>
  screen(route).tree.find((entry) => entry.ariaLabel === ariaLabel) ??
  fail(`missing aria label ${route} ${ariaLabel}`);
const px = (value) => {
  const match = /^(-?[\d.]+)px$/.exec(value ?? "");
  return match ? Number(match[1]) : 0;
};
// 색 표기가 두 가지다. 제품이 `--palette-gray-1000: #000000` 을
// `var(--louis-color-static-black)` 로 옮기면서(a3ed8e03..74a7303b) 상속되는 `color` 가
// LOUIS 별칭을 거치게 됐고, Chromium 은 그 계산값을 legacy `rgb()` 가 아니라
// `color(srgb …)` 로 직렬화한다. 칠은 그대로다 — `rgb(87, 93, 104)` 와
// `color(srgb 0.341176 0.364706 0.407843)` 는 87/255 = 0.341176 으로 같은 색이다.
// 실측 fixture 안에서 두 표기가 섞여 있으므로(586개 style 중 476개가 새 표기) 둘 다 읽는다.
// srgb 채널은 이미 0..1 이라 255로 나누지 않는다 — 되돌려 곱했다가 다시 나누면 없던
// 값을 지어내는 셈이 된다.
const rgba = (value) => {
  const legacy =
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(
      value ?? "",
    );
  if (legacy) {
    return [Number(legacy[1]) / 255, Number(legacy[2]) / 255, Number(legacy[3]) / 255, legacy[4] === undefined ? 1 : Number(legacy[4])];
  }
  const srgb =
    /^color\(srgb\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/.exec(
      value ?? "",
    );
  if (srgb) {
    return [Number(srgb[1]), Number(srgb[2]), Number(srgb[3]), srgb[4] === undefined ? 1 : Number(srgb[4])];
  }
  fail(`unsupported color ${value}`);
};
const shadows = (value) => {
  if (!value || value === "none") return [];
  const result = [];
  // 위 `rgba` 와 같은 이유로 `color(srgb …)` 도 받는다. 두 표기 모두 괄호 중첩이 없어
  // `[^)]*` 로 끝까지 집힌다.
  const pattern = /((?:rgba?|color)\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+(inset))?/g;
  for (const match of value.matchAll(pattern)) {
    result.push({
      type: match[6] === "inset" ? "INNER_SHADOW" : "DROP_SHADOW",
      color: rgba(match[1]),
      offset: { x: Number(match[2]), y: Number(match[3]) },
      radius: Number(match[4]),
      spread: Number(match[5]),
    });
  }
  if (result.length === 0) fail(`unsupported box shadow ${value}`);
  return result;
};
const relRect = (entry, rootRect) => ({
  x: entry.rect.x - rootRect.x,
  y: entry.rect.y - rootRect.y,
  width: entry.rect.width,
  height: entry.rect.height,
});
const textSpec = (route, text, rootRect) => {
  const entry = byText(route, text);
  const computed = style(entry);
  return {
    text,
    rect: relRect(entry, rootRect),
    fontFamily: computed.fontFamily,
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    color: rgba(computed.color),
  };
};

const routes = {
  default: { route: "/settings", menuPath: "body.1.0.0.0.0.1.0" },
  home: { route: "/archive", menuPath: "body.1.0.0.0.0.1.1" },
  youtube: { route: "/analytics/youtube", menuPath: "body.1.0.0.0.0.1.1" },
};
const defaultMenu = node(routes.default.route, routes.default.menuPath);
const rootRect = defaultMenu.rect;
const menuStyle = style(defaultMenu);
const rowNodes = screen(routes.default.route).tree.filter(
  (entry) => entry.parentPath === routes.default.menuPath,
);
if (rowNodes.length !== 7) fail(`expected 7 direct menu rows, got ${rowNodes.length}`);

const iconForText = (route, text) => {
  const label = byText(route, text);
  const parent = node(route, label.parentPath);
  const icon = screen(route).tree.find(
    (entry) => entry.parentPath === parent.path && entry.rect.width === 20 && entry.rect.height === 20,
  );
  if (!icon) fail(`missing 20px icon beside ${text}`);
  const computed = style(icon);
  return {
    rect: relRect(icon, rootRect),
    asset: computed.maskImage.replace(/^url\(["']?/, "").replace(/["']?\)$/, ""),
    color: rgba(computed.backgroundColor),
    opacity: Number(computed.opacity),
  };
};
const rowRect = (index) => relRect(rowNodes[index], rootRect);
const simpleRow = (key, index, text) => {
  const actionStyle = style(node(routes.default.route, `${routes.default.menuPath}.${index}.0.0`));
  return {
    kind: "simple",
    key,
    rect: rowRect(index),
    label: textSpec(routes.default.route, text, rootRect),
    icon: iconForText(routes.default.route, text),
    radius: px(actionStyle.borderTopLeftRadius),
    padding: {
      top: px(actionStyle.paddingTop),
      right: px(actionStyle.paddingRight),
      bottom: px(actionStyle.paddingBottom),
      left: px(actionStyle.paddingLeft),
    },
  };
};
/* `text` 는 **앵커 트리에서 노드를 찾는 열쇠**라 앵커가 가진 문자열이어야 한다.
   `displayText` 는 그 위에 얹는 **표시 이름**이다 — 앵커 `5a67d692` 는 2026-09-09
   「노드캔버스 → 캔버스」 개명 **이전** 트리라 사이드바 행 글자가 아직 "NodeCanvas" 인데,
   라이브 Figma 와 현재 제품은 "Canvas" 다. 열쇠를 바꾸면 측정이 못 찾아 즉시 죽고,
   표시를 안 바꾸면 draw.js 가 `row/NodeCanvas` 로 이름 지어 라이브 개명을 되돌린다.
   **앵커를 다시 고정하는 회차에서 이 인자는 사라진다.** */
const compoundRow = (key, index, text, ariaLabel, displayText = text) => {
  const label = byText(routes.default.route, text);
  const icon = iconForText(routes.default.route, text);
  const main = node(routes.default.route, label.parentPath.replace(/\.\d+$/, ""));
  const add = byAria(routes.default.route, ariaLabel);
  const addStyle = style(add);
  const outerStyle = style(node(routes.default.route, `${routes.default.menuPath}.${index}.0.0`));
  return {
    kind: "compound",
    key,
    rect: rowRect(index),
    label: { ...textSpec(routes.default.route, text, rootRect), text: displayText },
    icon,
    mainRect: relRect(main, rootRect),
    addRect: relRect(add, rootRect),
    addRadius: px(addStyle.borderTopLeftRadius),
    addBackground: rgba(addStyle.backgroundColor),
    radius: px(outerStyle.borderTopLeftRadius),
    gap: px(outerStyle.gap),
    padding: {
      top: px(outerStyle.paddingTop),
      right: px(outerStyle.paddingRight),
      bottom: px(outerStyle.paddingBottom),
      left: px(outerStyle.paddingLeft),
    },
    ariaLabel,
  };
};

const betaNode = byText(routes.default.route, "BETA");
const betaStyle = style(betaNode);
const sectionNode = byText(routes.default.route, "Analytics");
const sectionStyle = style(sectionNode);
const sectionRowStyle = style(rowNodes[5]);
/* **후보 id 의 스타일 축은 이제 내용 주소다 — 아래 두 판정은 그 전의 기록이다.**
   («내용 주소»라고만 적었다가 반증에서 잡혀 좁혔다. 해시 재료에는 `path`/`parentPath` 가
   남아 있고 그것은 **보이지 않는 형제까지 세는** 자식 인덱스 체인이다(`describe` 의
   `path + "." + index`). 사라진 것은 **화면 사이의 결합** — 무관한 스타일 하나가 늘고 줄어
   전 후보의 id 가 밀리던 것 — 이고, 한 화면 안의 위치 의존은 그대로다.) 종전에는
   `measure-product-auth-fixture.mjs` 가 styleRef 를 `"s" + computedStyles.length` — 첫 등장
   순서의 자리번호 — 로 붙였고 후보 해시가 그 문자열을 그대로 재료로 썼다. 그래서 style table
   앞쪽에 항목이 하나 늘기만 해도 뒤따르는 번호가 밀려 같은 subtree 의 id 가 바뀌었다. 사이드바
   47노드 중 실제로 번호가 밀린 건 둘(s84→s85, s85→s86)뿐인데 id 는 통째로 갈렸다. 그 소음을
   없애려 styleRef 를 값의 sha256 로 바꿨다(같은 파일의 `internStyle`) — 전환에서 모든 id 가
   한 번 갈리고, 그 뒤로는 값이 바뀐 자리에서만 움직인다. 아래 두 문단은 자리번호 시절의
   「이름만 갈렸다」 판정이므로 그때의 근거로 읽는다.

   a3ed8e03 → ae8fd627 판정(전부 (가) 정상 변화, 제품 소스에서 확인):
   - 이 fixture 는 lock 이 48f05c2a·74a7303b 를 지나는 동안 a3ed8e03 에 머물러 있었다.
     그래서 이번 재측정이 따라잡는 구간은 커밋 5개가 아니라 25개다.
   - 사이드바 행이 `.louis-sidebar-nav-item` 으로 이관됐다(Gnb.tsx, a3ed8e03..74a7303b):
     `gap: normal→8px`, `min-width: auto→0px`, `text-align: center→start`.
   - 행 끝 슬롯 배경 `rgb(var(--palette-gray-500-rgb) / 14%)` → `/ 12%`(Gnb.tsx:155→158).
   - 색 표기가 `rgb()` → `color(srgb …)` 로 바뀌었다. 위 `rgba` 주석 참고 — 칠은 그대로다.
   구조는 그대로다: 47노드·10route·같은 root path·rect 차이 0. route 집합도 문자 그대로 같다.
   그래서 이름만 새로 못박는다. 값을 따라가는 게 아니라 **같은 것의 새 이름**을 적는 것이다.

   ae8fd627 → 5a67d692 판정((가) 정상 변화, LOUIS 램프에서 값까지 확인):
   - 구조는 또 그대로다. 옛 후보와 `roots` 배열(route·path·rect)이 byte 동일하고, 47노드·
     10route·후보 총수 51개까지 같다. 47노드를 순서대로 견줘 path·tag·ownText·rect 차이 0.
   - 값에서 실제로 움직인 것은 **잉크 한 칸뿐이다**: 행에 상속되는 `color` 가
     `color(srgb 0.341176 0.364706 0.407843)`(#575d68) → `color(srgb 0.25098 0.270588 0.309804)`
     (#40454f). 47노드 중 30개가 이 색을 받고(아이콘 6개는 mask 잉크라 `backgroundColor` 로도
     같이 움직인다), 나머지 17개는 한 바이트도 다르지 않다. 그 외 어떤 속성도 바뀌지 않았다.
   - 출처는 이 저장소다. `.louis-sidebar-nav-item` 이 `color: var(--louis-color-fg-secondary)`
     (packages/css/src/component/app-shell.css)이고 fg-secondary 는 palette gray-700 을 받는데,
     회색 램프를 지각 균일로 다시 잡으면서 700 이 #575d68 → #525761(5c1137c) → #444953(888d1a3)
     → #40454f(3ec5966) 로 옮겨갔다. 제품 팔레트는 `--palette-gray-700: var(--louis-color-palette
     -gray-700)`(globals.css)으로 단일 출처라 그대로 따라온다. 제품은 이것을 **한 커밋에 받지 않았다.**
     `5a67d692` 자신의 핀 델타는 `888d1a3 → 3ec5966` 이고, 두 앵커 사이에 핀 상향이
     **13번** 있었다(`git log ae8fd627..5a67d692 -G'louis#' -- apps/web/package.json`).
     `425a9c3d → 3ec5966` 은 그 열셋의 **누적**이지 한 커밋의 델타가 아니다 —
     한 커밋으로 적었다가 반증에서 잡혔다.
   - style table 이 586 → 580 항목으로 줄며 자리번호가 밀렸고 색까지 바뀌었으니 해시는 당연히
     갈린다. 여기서도 **같은 것의 새 이름**을 못박는다.

   세 번째로 갈렸다(subtree-557568349002→eff38326a288). 이번에는 **제품이 아니라 측정기가
   움직였다** — 앵커는 그대로 `5a67d692` 이고(새 fixture 의 `productCommit` 도 같다),
   위 문단들이 원인으로 지목한 자리번호 styleRef 자체를 걷어냈다: styleRef 를 「최초 등장
   순서」 인덱스에서 **스타일 내용의 해시**로 바꾸고, `content-visibility: auto` 가 화면 밖
   서브트리를 렌더링에서 걷어내던 래치를 측정 전 스크롤 훑기로 풀었다. 같은 앵커에서 다시
   재고 옛 측정과 전수 대조한 결과 후보 수 desktop 51 → 51 · mobile 16 → 16, 서명
   (nodeCount·routeCount·occurrenceCount·score·roots) 다중집합 불일치 **0**,
   computedStyles 580 → 579 — 구조는 한 곳도 안 움직였고 id 체계만 한 번 갈렸다. 그 서명으로
   옛→새를 1:1 로 이어 붙였으므로 47/10 은 손대지 않는다.
   **이것이 마지막 일괄 이동이다.** styleRef 가 더는 자리번호가 아니므로 앞으로 id 는 값이
   실제로 바뀐 자리에서만 움직인다 — 다음에 이 가드가 물면 이름 갈림이 아니라 진짜 변경이다. */
const candidate = fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find(
  (entry) => entry.id === "subtree-eff38326a288",
);
if (!candidate || candidate.nodeCount !== 47 || candidate.routeCount !== 10) {
  fail("measured repeated sidebar candidate changed; inspect before regenerating Figma");
}

/* 위와 같은 자리번호 밀림이다. route 집합이 옛 후보와 문자 그대로 같음을 확인했다 —
   fe34aa819557 은 settings·subscription·billing-change-success/fail·topup-success/fail 6개,
   103b6e563038 은 upgrade·billing-success·billing-fail·upgrade-fail 4개.
   제품이 더한 `?__phase=` 6개는 60노드짜리 별도 후보(subtree-19636a6ae1fa)로 따로 묶였고
   이 생성기는 그것을 쓰지 않는다. 헤더 두 벌은 여전히 각각 59노드다.

   ae8fd627 → 5a67d692 에서 다시 갈렸다(fe34aa819557→bd975676e6bb, 103b6e563038→23a203251141).
   판정 근거는 위 사이드바와 **같은 하나**다: 두 헤더 59노드를 순서대로 견줘 path·tag·ownText·
   rect 차이 0, `roots` 배열도 byte 동일이고, 바뀐 값은 gray-700 잉크
   #575d68 → #40454f 뿐이다(59노드 중 30개, 아이콘 6개는 mask 잉크라 backgroundColor 도 함께).
   헤더가 사이드바를 자식으로 품으므로 같은 30개다. 출처는 LOUIS 3ec5966, 제품 5a67d692.

   세 번째로 갈렸다(bd975676e6bb→d1dc5adb9fa0, 23a203251141→c3cf629b9e07). 위 사이드바와
   **같은 하나**다 — 제품이 아니라 측정기가 움직였고(앵커 `5a67d692` 그대로, styleRef 를
   자리번호에서 내용 해시로 교체 + `content-visibility: auto` 래치를 스크롤 훑기로 못박음),
   서명 전수 대조에서 불일치 0 이었다. 59/6 · 59/4 는 그대로 둔다. */
const headerCandidates = ["subtree-d1dc5adb9fa0", "subtree-c3cf629b9e07"].map((id) =>
  fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find((entry) => entry.id === id),
);
if (
  !headerCandidates[0] ||
  headerCandidates[0].nodeCount !== 59 ||
  headerCandidates[0].routeCount !== 6 ||
  !headerCandidates[1] ||
  headerCandidates[1].nodeCount !== 59 ||
  headerCandidates[1].routeCount !== 4
) {
  fail("measured Gnb header variant candidates changed; inspect before regenerating Figma");
}
const headerPath = "body.1.0.0.0";
const headerNodes = (route) =>
  screen(route).tree.filter((entry) => entry.path === headerPath || entry.path.startsWith(`${headerPath}.`));
const headerDefault = headerNodes("/settings");
const headerCurrent = headerNodes("/mypage/upgrade");
if (headerDefault.length !== 59 || headerCurrent.length !== 59) fail("expected two 59-node Gnb headers");
const headerDiffs = [];
for (let index = 0; index < headerDefault.length; index += 1) {
  const left = headerDefault[index];
  const right = headerCurrent[index];
  const sameStructure =
    left.path === right.path &&
    left.tag === right.tag &&
    left.ownText === right.ownText &&
    JSON.stringify(left.rect) === JSON.stringify(right.rect);
  if (!sameStructure) fail(`Gnb header structure changed at node ${index}`);
  if (left.styleRef !== right.styleRef) headerDiffs.push(left.path.slice(headerPath.length));
}
if (JSON.stringify(headerDiffs) !== JSON.stringify([".0.2.0.0", ".0.2.0.0.0"])) {
  fail(`Gnb header variants differ outside measured Upgrade CTA: ${headerDiffs.join(", ")}`);
}
const upgradeButtonPath = `${headerPath}.0.2.0.0`;
const upgradeLabelPath = `${upgradeButtonPath}.0`;
const upgradeSpec = (route, state) => {
  const button = node(route, upgradeButtonPath);
  const label = node(route, upgradeLabelPath);
  const buttonStyle = style(button);
  const labelStyle = style(label);
  return {
    state,
    route,
    rect: { width: button.rect.width, height: button.rect.height },
    padding: {
      top: px(buttonStyle.paddingTop),
      right: px(buttonStyle.paddingRight),
      bottom: px(buttonStyle.paddingBottom),
      left: px(buttonStyle.paddingLeft),
    },
    gap: px(buttonStyle.gap),
    radius: px(buttonStyle.borderTopLeftRadius),
    fill: rgba(buttonStyle.backgroundColor),
    color: rgba(labelStyle.color),
    effects: shadows(buttonStyle.boxShadow),
    label: {
      text: label.ownText,
      rect: relRect(label, button.rect),
      fontFamily: labelStyle.fontFamily,
      fontSize: px(labelStyle.fontSize),
      fontWeight: Number(labelStyle.fontWeight),
      lineHeight: px(labelStyle.lineHeight),
      letterSpacing: px(labelStyle.letterSpacing),
    },
  };
};
/* 브랜드 후보만 id 가 살아남았다 — 6노드의 styleRef 가 style table 맨 앞이라 번호가 밀리지
   않았기 때문이다(자리번호 시절의 이야기다. 위 문단 참고). 대신 routeCount 가 12 → 18 로 늘었다. 늘어난 6개는 제품이 더한 개발 전용
   후크 `?__phase=`(HighlightProjectScene.tsx, 74a7303b..ae8fd627)로 열리는 하이라이트 상세
   6단계이고, 그 화면들도 같은 브랜드 블록을 그대로 그린다. 후보가 넓어진 것이지 바뀐 게
   아니다 — 앞 12개 route 는 순서까지 그대로다.

   ae8fd627 → 5a67d692 에서는 브랜드 후보도 이름이 갈렸다(08a5cfbcf527→a8869908a7f3). style
   table 이 586 → 580 으로 **줄어** 맨 앞 6노드의 자리번호까지 밀린 것이다. 이 6노드는 회색 램프
   재조정의 영향을 받지 않는다 — 옛 후보와 견줘 구조도 계산 스타일도 차이 0, routeCount 18 그대로.
   순수한 이름 갈림이라 이름만 새로 못박는다.

   세 번째로 갈렸다(a8869908a7f3→ffebd1510282). 이번엔 자리번호가 밀린 것이 아니라 자리번호
   **자체를 걷어낸** 것이다 — 측정기의 styleRef 가 등장 순서 인덱스에서 스타일 내용의 해시로
   바뀌었고(`content-visibility: auto` 래치도 스크롤 훑기로 풀었다), 앵커는 그대로
   `5a67d692` 다. 서명 전수 대조에서 불일치 0, 6/18 그대로. */
const brandCandidate = fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find(
  (entry) => entry.id === "subtree-ffebd1510282",
);
if (!brandCandidate || brandCandidate.nodeCount !== 6 || brandCandidate.routeCount !== 18) {
  fail("measured Gnb brand candidate changed; inspect before regenerating Figma");
}
const navNode = node("/settings", `${headerPath}.0`);
const brandNode = node("/settings", `${headerPath}.0.0`);
const brandImage = node("/settings", `${headerPath}.0.0.0.0.0.0.0`);
const headerNode = node("/settings", headerPath);
const headerStyle = style(headerNode);
const brandStyle = style(brandNode);
const shellSpec = {
  id: "product/gnb-desktop-shell",
  componentSetName: "Product/Gnb Desktop Shell",
  sourceCandidates: [brandCandidate, ...headerCandidates],
  root: {
    width: headerNode.rect.width,
    height: headerNode.rect.height,
    padding: {
      top: px(headerStyle.paddingTop),
      right: px(headerStyle.paddingRight),
      bottom: px(headerStyle.paddingBottom),
      left: px(headerStyle.paddingLeft),
    },
    background: rgba(headerStyle.backgroundColor),
  },
  nav: relRect(navNode, headerNode.rect),
  brand: {
    rect: relRect(brandNode, headerNode.rect),
    paddingLeft: px(brandStyle.paddingLeft),
    gap: px(brandStyle.gap),
    image: {
      rect: relRect(brandImage, headerNode.rect),
      asset: brandImage.src,
      darkAsset: "/klipse-dark.svg",
      darkAssetSource: sourceQuote(
        "apps/web/components/ui/BrandLogo.tsx",
        97,
        '        src="/klipse-dark.svg"',
      ),
    },
  },
  menu: relRect(defaultMenu, headerNode.rect),
  upgradeCta: relRect(node("/settings", upgradeButtonPath), headerNode.rect),
  variants: [
    { current: "Default", route: "/settings", menuCurrent: "Default", ctaState: "Current" },
    { current: "Home", route: "/archive", menuCurrent: "Home", ctaState: "Current" },
    { current: "Canvas", route: "/canvas", menuCurrent: "Canvas", ctaState: "Current" },
    { current: "VideoEditor", route: "/videoeditor", menuCurrent: "VideoEditor", ctaState: "Current" },
    { current: "Highlight", route: "/highlight", menuCurrent: "Highlight", ctaState: "Current" },
    { current: "YouTube", route: "/analytics/youtube", menuCurrent: "YouTube", ctaState: "Current" },
    { current: "Upgrade", route: "/mypage/upgrade", menuCurrent: "Default", ctaState: "Current" },
  ],
};
const resultSectionPath = "body.1.0.0.1.1";
const contextScreens = fixture.screens;
const resultNode = (context, route, path) =>
  contextScreens[context]?.[route]?.tree.find((entry) => entry.path === path) ??
  fail(`missing result node ${context} ${route} ${path}`);
const resultText = (entry, rootRect) => {
  const computed = style(entry);
  return {
    text: entry.ownText,
    rect: relRect(entry, rootRect),
    fontFamily: computed.fontFamily,
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    color: rgba(computed.color),
    textAlign: computed.textAlign,
  };
};
const paymentResultSpec = (context, route, outcome, viewport) => {
  const root = resultNode(context, route, resultSectionPath);
  const rootStyle = style(root);
  const failure = outcome === "Failure";
  const buttonPath = `${resultSectionPath}.${failure ? 3 : 2}.0`;
  const button = resultNode(context, route, buttonPath);
  const buttonStyle = style(button);
  const spec = {
    outcome,
    viewport,
    route,
    rect: { width: root.rect.width, height: root.rect.height },
    gap: px(rootStyle.gap),
    background: rgba(rootStyle.backgroundColor),
    title: resultText(resultNode(context, route, `${resultSectionPath}.0`), root.rect),
    body: resultText(resultNode(context, route, `${resultSectionPath}.1`), root.rect),
    action: {
      rect: relRect(button, root.rect),
      radius: px(buttonStyle.borderTopLeftRadius),
      padding: {
        top: px(buttonStyle.paddingTop),
        right: px(buttonStyle.paddingRight),
        bottom: px(buttonStyle.paddingBottom),
        left: px(buttonStyle.paddingLeft),
      },
      fill: rgba(buttonStyle.backgroundColor),
      label: resultText(button, root.rect),
    },
  };
  if (failure) {
    const detail = resultNode(context, route, `${resultSectionPath}.2.0`);
    const detailStyle = style(detail);
    spec.detail = {
      rect: relRect(detail, root.rect),
      direction: detailStyle.flexDirection,
      alignItems: detailStyle.alignItems,
      justifyContent: detailStyle.justifyContent,
      gap: px(detailStyle.gap),
      padding: {
        top: px(detailStyle.paddingTop),
        right: px(detailStyle.paddingRight),
        bottom: px(detailStyle.paddingBottom),
        left: px(detailStyle.paddingLeft),
      },
      term: resultText(resultNode(context, route, `${resultSectionPath}.2.0.0`), root.rect),
      value: resultText(resultNode(context, route, `${resultSectionPath}.2.0.1`), root.rect),
    };
  }
  return spec;
};
const repeatedCandidates = fixture.componentCandidateAudit.repeatedSubtreesByContext;
/* 셋 다 자리번호 밀림으로 이름만 갈렸다(eca01d4c1ecf→a1f0d8b59b32, 6431e73e726b→198dbf4bbdd0,
   d1aea0da5d0f→5a97e6ce252e). route 집합·root path(body.1.0.0.1.1)·노드 수 모두 그대로다.
   다만 이 화면의 CTA 는 **기하가 실제로 바뀌었다**: 40px 높이·20px 좌우 패딩 → 32px·12px.
   제품 소스에서 확인 — `app/mypage/upgrade/billing-change-fail/page.tsx` 의
   `STATUS_BUTTON_PRIMARY` 가 `h-20 px-10` → `h-16 px-6` 이다(a3ed8e03..74a7303b,
   `--spacing: 2px` 격자라 40→32·20→12). 의도된 제품 변화이므로 생성기가 따라간다.

   같은 CTA 의 **글자색은 옛 기준선 쪽이 설명되지 않는다.** 옛 실측은 #f8f8f9(palette-gray-50),
   새 실측은 #f1f1f3(palette-gray-100)인데, 버튼 클래스는 두 커밋 모두 `text-gray-900!` 이고
   `html[data-theme="light"]` 는 두 커밋 모두 `--gray-900: var(--palette-gray-100)` 다
   (globals.css). 즉 **새 값이 제품 소스와 맞고 옛 값이 어긋난다** — 이 재생성이 낡은 값을
   굳히는 게 아니라 되돌리는 쪽이다. 옛 fixture 가 자기가 적은 커밋과 다른 트리에서 측정된
   것으로 보이나(lock 이력의 「락은 움직이는 ref 를 가리킨다」와 같은 계열), fixture 는 이
   작업자에게 읽기 전용이라 원인까지는 확정하지 못했다.

   ae8fd627 → 5a67d692 에서 셋 다 또 이름이 갈렸다(a1f0d8b59b32→0c0f510a5eea,
   198dbf4bbdd0→83dc162f593e, 5a97e6ce252e→cd13bafaafe1). 이번에는 기하가 움직이지 않았다 —
   네 subtree(desktop/mobile change-fail 9노드, change-success·topup-success 5노드)를 순서대로
   견줘 path·tag·ownText·rect 차이 0, `roots` 도 byte 동일이다. 바뀐 값은 CTA 라벨 색 **한 자리**
   뿐이고, 그것도 위와 같은 램프 재조정이다: `color(srgb 0.945098 0.945098 0.952941)`(#f1f1f3)
   → `color(srgb 0.866667 0.870588 0.878431)`(#dddee0) — LOUIS palette gray-100 이 3ec5966 에서
   #eeeff1 → #dddee0 로 옮겨간 값이고(그 앞 37509da 에서 #f1f1f3 → #eeeff1), 라이트에서
   `--gray-900: var(--palette-gray-100)` 이라 `text-gray-900!` 인 이 CTA 가 그대로 받는다.
   제품이 받은 커밋은 역시 5a67d692 하나다.

   세 번째로 갈렸다(0c0f510a5eea→1c5b53bcf0bf, 83dc162f593e→b9e2626a8aae,
   cd13bafaafe1→56ee03ac380f). 위 셋과 **같은 하나**다 — 제품이 아니라 측정기가 움직였고
   (앵커 `5a67d692` 그대로, styleRef 를 자리번호에서 내용 해시로 교체 + `content-visibility:
   auto` 래치를 스크롤 훑기로 못박음), 서명 전수 대조에서 불일치 0 이었다. 9·9·5 는 그대로. */
const resultCandidateIds = ["subtree-1c5b53bcf0bf", "subtree-b9e2626a8aae", "subtree-56ee03ac380f"];
const resultCandidates = resultCandidateIds.map(
  (id) =>
    repeatedCandidates[contextName].find((entry) => entry.id === id) ??
    repeatedCandidates["mobile-402x874"].find((entry) => entry.id === id),
);
if (
  !resultCandidates[0] ||
  resultCandidates[0].nodeCount !== 9 ||
  !resultCandidates[1] ||
  resultCandidates[1].nodeCount !== 9 ||
  !resultCandidates[2] ||
  resultCandidates[2].nodeCount !== 5
) {
  fail("measured payment-result candidates changed; inspect before regenerating Figma");
}
const paymentResult = {
  id: "product/payment-result-content",
  sectionName: "J · product/Payment result · measured component",
  componentSetName: "Product/Payment Result Content",
  sourceCandidates: resultCandidates,
  variants: [
    paymentResultSpec(contextName, "/mypage/upgrade/billing-change-fail", "Failure", "Desktop"),
    paymentResultSpec("mobile-402x874", "/mypage/upgrade/billing-change-fail", "Failure", "Mobile"),
    paymentResultSpec(contextName, "/mypage/upgrade/billing-change-success", "PlanDelayed", "Desktop"),
    paymentResultSpec("mobile-402x874", "/mypage/upgrade/billing-change-success", "PlanDelayed", "Mobile"),
    paymentResultSpec(contextName, "/mypage/topup/success", "TopupDelayed", "Desktop"),
    paymentResultSpec("mobile-402x874", "/mypage/topup/success", "TopupDelayed", "Mobile"),
  ],
};

/* 줄번호와 커밋이 박혀 있어 앵커가 움직일 때마다 조용히 낡던 문장이다. 커밋은 fixture 에서
   읽어 **고정 문자열이 아니게** 만든다 — 이 note 가 말하는 「고정 커밋」은 언제나 이 생성물이
   읽은 fixture 의 커밋이다. 줄번호 4691-4692 → 4614-4615, 563/569 → 564/570 은 실측이다:
   ae8fd627..5a67d692 에서 인용 대상 세 줄의 **내용은 그대로**고 위치만 옮겼다(위 darkThemeSource
   주석 참고. 4614-4615 는 `const href = row.href;` / `const isActive = isSidebarMenuHrefActive(href);`
   로 두 앵커에서 문자 그대로 같다). */
const sharedActiveColourNote =
  `No new visual value: Gnb.tsx:4614-4615 applies the common isSidebarMenuHrefActive result ` +
  `and Gnb.tsx:564/570 supplies the shared inactive/active colours at pinned commit ` +
  `${fixture.productCommit}.`;

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma candidate; not a normative design-system contract",
  productCommit: fixture.productCommit,
  context: contextName,
  sourceCandidate: candidate,
  component: {
    id: "product/gnb-sidebar-menu",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "I · product/Gnb sidebar · measured component",
    componentSetName: "Product/Gnb Sidebar Menu",
    root: {
      width: rootRect.width,
      height: rootRect.height,
      gap: px(menuStyle.gap),
      background: rgba(menuStyle.backgroundColor),
    },
    variants: [
      { current: "Default", route: routes.default.route, activeRow: null },
      {
        current: "Home",
        route: routes.home.route,
        activeRow: "Home",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
      },
      {
        current: "YouTube",
        route: routes.youtube.route,
        activeRow: "YouTube analytics",
        activeColor: rgba(style(byText(routes.youtube.route, "YouTube analytics")).color),
        activeIconOpacity: iconForText(routes.youtube.route, "YouTube analytics").opacity,
      },
      {
        current: "Canvas",
        route: "/canvas",
        activeRow: "Canvas",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
        $note: sharedActiveColourNote,
      },
      {
        current: "VideoEditor",
        route: "/videoeditor",
        activeRow: "VideoEditor",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
        $note: sharedActiveColourNote,
      },
      {
        current: "Highlight",
        route: "/highlight",
        activeRow: "Highlight",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
        $note: sharedActiveColourNote,
      },
    ],
    rows: [
      simpleRow("search", 0, "Search"),
      simpleRow("home", 1, "Home"),
      compoundRow("canvas", 2, "NodeCanvas", "New project (open canvas)", "Canvas"),
      compoundRow("video-editor", 3, "VideoEditor", "New project (video edit)"),
      {
        ...simpleRow("highlight", 4, "Highlight"),
        kind: "highlight",
        beta: {
          rect: relRect(betaNode, rootRect),
          label: {
            ...textSpec(routes.default.route, "BETA", rootRect),
            rect: {
              x: betaNode.rect.x - rootRect.x + px(betaStyle.paddingLeft),
              y: betaNode.rect.y - rootRect.y + px(betaStyle.paddingTop),
              width: betaNode.rect.width - px(betaStyle.paddingLeft) - px(betaStyle.paddingRight),
              height: betaNode.rect.height - px(betaStyle.paddingTop) - px(betaStyle.paddingBottom),
            },
          },
          radius: px(betaStyle.borderTopLeftRadius),
          background: rgba(betaStyle.backgroundColor),
          padding: {
            top: px(betaStyle.paddingTop),
            right: px(betaStyle.paddingRight),
            bottom: px(betaStyle.paddingBottom),
            left: px(betaStyle.paddingLeft),
          },
        },
      },
      {
        kind: "section-label",
        key: "analytics",
        rect: rowRect(5),
        label: textSpec(routes.default.route, "Analytics", rootRect),
        padding: {
          top: px(sectionRowStyle.paddingTop),
          right: px(sectionRowStyle.paddingRight),
          bottom: px(sectionRowStyle.paddingBottom),
          left: px(sectionStyle.paddingLeft),
        },
      },
      simpleRow("youtube", 6, "YouTube analytics"),
    ],
    bindings: {
      paletteCollection: "1 · Palette",
      paletteMode: "default",
      ctaPaletteMode: "sidebar",
      semanticCollection: "2 · Semantic",
      semanticMode: "dark",
      inactive: { collection: "2 · Semantic", name: "gray/300" },
      active: { collection: "2 · Semantic", name: "gray/000" },
      activeIndicator: { collection: "1 · Palette", name: "palette/gray-800" },
      createButtonBackground: { collection: "1 · Palette", name: "palette/gray-200" },
      betaBackground: { collection: "2 · Semantic", name: "app/nav-chip-tint" },
      muted: { collection: "1 · Palette", name: "palette/gray-600" },
      spacing4: { collection: "Klipse Primitive", name: "spacing/4" },
      spacing8: { collection: "Klipse Primitive", name: "spacing/8" },
      spacing10: { collection: "Klipse Primitive", name: "spacing/10" },
      spacing12: { collection: "Klipse Primitive", name: "spacing/12" },
      radius6: { collection: "Klipse Primitive", name: "radius/6" },
      radius10: { collection: "Klipse Primitive", name: "radius/10" },
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
      spacing14: { collection: "Klipse Primitive", name: "spacing/14" },
      spacing16: { collection: "Klipse Primitive", name: "spacing/16" },
      spacing20: { collection: "Klipse Primitive", name: "spacing/20" },
      spacing24: { collection: "Klipse Primitive", name: "spacing/24" },
      surfaceStrong: { collection: "1 · Palette", name: "palette/gray-900" },
      surfaceInverse: { collection: "1 · Palette", name: "palette/gray-100" },
      textSecondary: { collection: "2 · Semantic", name: "gray/000 · a56" },
      textTertiary: { collection: "2 · Semantic", name: "gray/000 · a48" },
    },
    iconComponents: {
      "/icons/MagnifyingGlass.svg": "icon/MagnifyingGlass",
      "/icons/House.svg": "icon/House",
      "/icons/Graph.svg": "icon/Graph",
      "/icons/MagicWand.svg": "icon/MagicWand",
      "/highlight_symbol.svg": "root/highlight_symbol",
      "/icons/youtube.svg": "icon/youtube",
      "/klipse-light.svg": "logo/klipse-light (291×85 · 라이트 서피스용 · 워드마크 black)",
      "/klipse-dark.svg": "logo/klipse-dark (291×85 · 다크 서피스용 · 워드마크 white)",
      plus: ".glyph/NavPlusGlyph",
    },
    /* 세 줄 다 인용문은 한 글자도 안 바뀌었고 **줄번호만 +1** 이다(563/569/573 → 564/570/574).
       ae8fd627..5a67d692 에서 Gnb.tsx 파일 앞쪽에 import 한 줄이 늘었을 뿐이다 —
       `41ea8099 feat(landing): GNB 언어 버튼 옆에 현재 테마 버튼을 둔다` 가 더한
       `import { ThemeDarkIcon, … } from "@/components/theme/ThemeIcons";`(28행). 그 위아래로
       600행까지 다른 차이는 없다. `menuLinkActive` 블록 자체는 그대로이므로 인용을 옮긴다. */
    darkThemeSource: {
      inactive: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        564,
        '    "[.gnb-menuSidebar_.gnb-menuLink:not(&)]:[color:var(--gray-300)]",',
      ),
      active: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        570,
        '    "[color:var(--gray-000)]",',
      ),
      activeIndicator: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        574,
        '    "[html[data-theme=dark]_&]:[background-color:var(--palette-gray-800)]",',
      ),
    },
    upgradeCta: {
      id: "product/gnb-upgrade-cta",
      componentSetName: "Product/Gnb Upgrade CTA",
      sourceCandidates: headerCandidates,
      variants: [upgradeSpec("/settings", "Default"), upgradeSpec("/mypage/upgrade", "Current")],
    },
    shell: shellSpec,
    paymentResult,
  },
};

const candidateSummary = ({ id, nodeCount, routeCount, occurrenceCount, score }) => ({
  id,
  nodeCount,
  routeCount,
  occurrenceCount,
  score,
});
const runnerPlan = structuredClone(plan);
delete runnerPlan.$comment;
delete runnerPlan.$evidenceClass;
delete runnerPlan.component.darkThemeSource;
delete runnerPlan.component.shell.brand.image.darkAssetSource;
for (const variant of runnerPlan.component.variants) {
  delete variant.$note;
  delete variant.activeColor;
  delete variant.route;
}
runnerPlan.sourceCandidate = candidateSummary(plan.sourceCandidate);
delete runnerPlan.component.upgradeCta.sourceCandidates;
delete runnerPlan.component.shell.sourceCandidates;
delete runnerPlan.component.paymentResult.sourceCandidates;
const runnerSource = readFileSync(
  resolve(repoRoot, "scripts/templates/figma-product-components-renderer.js"),
  "utf8",
)
  .split("\n")
  .map((line) => line.trimStart())
  .filter((line) => line.length > 0)
  .join("\n");
const draw = `// Generated by scripts/build-figma-product-components.mjs. Do not edit by hand.\n` +
  `// Pass this file verbatim to use_figma. It creates only missing measured product components.\n` +
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
  runnerSource;
const payload = `${JSON.stringify(plan, null, 2)}\n`;
const expected = [
  { absolute: planPath, expected: payload },
  { absolute: drawPath, expected: draw },
];

if (checkOnly) {
  for (const entry of expected) {
    let current = "";
    try {
      current = readFileSync(entry.absolute, "utf8");
    } catch {
      fail(`missing generated output ${entry.absolute.slice(repoRoot.length + 1)}`);
    }
    if (current !== entry.expected) fail(`generated output drift: ${entry.absolute.slice(repoRoot.length + 1)}`);
  }
} else {
  atomicWriteBatch(expected);
}

console.log(
  `[figma-product-components] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ` +
    `${plan.component.variants.length + plan.component.upgradeCta.variants.length + plan.component.shell.variants.length + plan.component.paymentResult.variants.length} variants · ` +
    `${plan.component.rows.length} menu rows · ${candidate.nodeCount + 2 + brandCandidate.nodeCount} Gnb measured nodes · ` +
    `result candidates ${resultCandidates.map((entry) => entry.nodeCount).join("/")} nodes · ` +
    `${candidate.routeCount} sidebar routes + ${headerCandidates[0].routeCount}/${headerCandidates[1].routeCount} header routes`,
);
