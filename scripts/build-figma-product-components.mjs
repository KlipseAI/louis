import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { BINDING_POLICY, RENDERER_LIB, liveVariables, sourceQuotes } from "./lib/figma-live-variables.mjs";
import { drawnText } from "./lib/measured-text.mjs";

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
  // 근거 문자열에는 기계마다 다른 절대경로를 적지 않는다 — 적으면 check 가 KLIPSE_PRODUCT_REPO 철자에 따라 갈린다.
  const command = `git -C "$KLIPSE_PRODUCT_REPO" show ${fixture.productCommit}:${path}`;
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
/* 직계 행은 여섯이다(검색 · 홈 · 캔버스 · 컴포지션 · 하이라이트 · YouTube 분석). 제품 `2c6bdacf` 가 「분석」 아이브로우 행을 걷었다 —
   `git show 2c6bdacf:apps/web/components/navigation/Gnb.tsx` :2158 `const SIDEBAR_MENU_ROWS: ReadonlyArray<{ type: "link"; href: AppNavMenuHref }> = [`
   (그 전 `6f6282c1` :2191 `  { type: "eyebrow", id: "analytics" },`). Instagram 행은 `isNavHrefHidden` 으로 렌더되지 않는다. */
if (rowNodes.length !== 6) fail(`expected 6 direct menu rows, got ${rowNodes.length}`);

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
const betaNode = byText(routes.default.route, "BETA");
const betaStyle = style(betaNode);
/* 라벨 ↔ 딱지 간격 — 딱지는 라벨과 같은 flex 줄의 형제이고, 줄 간격(10)에 딱지의 `margin-left: -2px` 가 더해져 8 이 된다. Figma 는
   자식마다 간격을 다르게 둘 수 없어 렌더러가 라벨 · 딱지를 이 간격의 묶음으로 싼다. 계산 스타일로 정하고 두 rect 의 차와 맞대 본다. */
const betaLabel = byText(routes.default.route, "Highlight");
if (betaNode.parentPath !== betaLabel.parentPath) fail("BETA chip is no longer a sibling of the Highlight label");
const betaGap = px(style(node(routes.default.route, betaLabel.parentPath)).columnGap) + px(betaStyle.marginLeft);
if (Math.abs(betaNode.rect.x - (betaLabel.rect.x + betaLabel.rect.width) - betaGap) > 0.01) {
  fail(`BETA chip gap ${betaGap} (column-gap + margin-left) disagrees with the measured rects`);
}
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
   실제로 바뀐 자리에서만 움직인다 — 다음에 이 가드가 물면 이름 갈림이 아니라 진짜 변경이다.

   네 번째로 갈렸다(eff38326a288 → 4a764af3ad4d, 2026-09-10 재고정 5a67d692 → 91e5ea2a).
   **위 예고대로 진짜 변경이었고, 4px 이다.** 가드가 물기에 서명을 전수 대조했다 —
   nodeCount 47 · routeCount 10 · occurrenceCount 10 · score 470 · 최상위 후보 · 경로
   `body.1.0.0.0.0.1` · 크기 256×250 이 **전부 같고**, `roots[].rect.y` 만 64 → 60 이다.
   원인은 제품 `e59b1003` 계열의 앱 셸 여백 정리다 — 사이드바 상단 안전 여백
   `--app-gnb-safe-top` 이 `max(12px, env(safe-area-inset-top))` 에서 `max(8px, …)` 로
   내려가 메뉴가 4px 올라왔다. 구조가 아니라 위치 하나가 움직인 것이므로 47/10 은 그대로
   두고 id 만 못박는다. */
/* 다섯 번째로 갈렸다(4a764af3ad4d → 7eb3e2833a3e, 2026-09-11 재고정 f19cc41c → 38a7d5a4).
   **예고대로 진짜 변경이고, 이번엔 노드가 줄었다 — 47 → 43.** 판정은 서명 전수 대조다:
   routeCount 10 · occurrenceCount 10 · `roots` 의 route·path·tag·rect 가 **바이트 동일**하고
   (`body.1.0.0.0.0.1` · div · 12,60,256x250, 10개 route 전부), nodeCount 와 그에 딸린
   score(470 → 430 = 43x10)만 움직였다. 같은 routeCount 10 의 다른 후보
   `subtree-d5c53265893d`(42)는 path 가 `body.1.0.0.0.0.1.0` · tag `ul` 로 **안쪽 목록**이며
   사이드바가 아니다 — nodeCount 만으로 고르면 그것을 집는다.
   원인은 제품 `658ece13`「사이드바에서 + 버튼을 걷고 베타 딱지를 라벨 옆으로 옮긴다」다.
   그 커밋은 + 버튼 **넷**을 걷었다(데스크톱 사이드바 Canvas · Composition 행, 접힌 사이드바,
   모바일 드로어). 이 후보가 재는 데스크톱 사이드바 안에 있던 것은 그중 **둘**이고, -4 는 그 둘의
   `<button>` + `<svg>`(`NavPlusGlyph`) **두 쌍**이다. desktop `/settings` 의 사이드바 후보 루트
   `body.1.0.0.0.0.1` **아래**만 path 로 견주면 사라진 노드는 `body.1.0.0.0.0.1.0.2.0.0.1` button "New project (open canvas)" 와 그 `.0` svg,
   `body.1.0.0.0.0.1.0.3.0.0.1` button "New project (Composition)" 와 그 `.0` svg 넷뿐이고 더해진
   노드는 0 이다(화면 전체로 견주면 다른 자리도 움직였으므로 이 주장은 사이드바 서브트리에 한정한다).
   `NavPlusGlyph` 의 path 둘은 옛 트리에도 실려 있지 않았다(두 svg 를 parentPath 로
   갖는 항목 0, 사이드바 안 path 태그 0 → 0) — 4노드에 path 는 들지 않는다.
   2026-09-13 정정: 이 자리는 「`NavPlusGlyph`(svg + path 2)와 그 `<button>` 래퍼 = 정확히 4노드」,
   즉 버튼 하나로 적혀 있었으나 측정 트리와 맞지 않았다. 확인은
   `git show 7f41d5a^:migration/product.auth-fixture.json` 과 `git show 4ebbe46:…` 의
   `screens["desktop-1920x1080"][route].tree` 를 path 로 견준 것이다.
   사이드바를 자식으로 품는 헤더 둘(59 → 55)과 그 헤더를 품는 결제 장면 둘(87 → 83 · 83 → 79)도
   전부 같은 -4 다 — 같은 비교에서 두 헤더 후보의 route 10개 전부, 헤더(`body.1.0.0.0`) 아래
   사라진 노드가 위 두 쌍과 같고 더해진 노드는 0 이다. 하나의 원인이 중첩 서브트리를 타고
   올라간 것이다. */
/* 여섯 번째로 갈렸다(7eb3e2833a3e → 9c4c0327c2b0, 2026-09-15 재고정 6f6282c1 → 2c6bdacf). **진짜 변경이고 둘이다 — 노드
   43 → 41, 크기 256×250 → 216×212.** 서명 전수 대조(`git show HEAD:migration/product.auth-fixture.json` 과 새 원장): routeCount 10 ·
   occurrenceCount 10 · roots 의 route·path·tag 가 바이트 동일(`body.1.0.0.0.0.1` · div, 10개 route)이고, rect 는 10개 모두
   x 12 · y 60 그대로 폭 · 높이만 줄었다. 원인은 제품 둘이다 — `bc3e6fa3` 가 레일을 280 → 240 으로 줄여 목록 폭이 216(= 240 −
   레일 패딩 12 × 2)이 됐고, `2c6bdacf` 가 「분석」 아이브로우 행(`<li role="presentation">` + `<span>`)을 걷어 두 노드와 한 행
   (34 + 간격 4)이 빠졌다. `/settings` 서브트리를 path 로 견주면 옛 `….1.0.5`(li) · `….1.0.5.0`(span 「Analytics」)이 사라지고
   YouTube 분석 행이 `….1.0.6` 에서 `….1.0.5` 로 한 칸 당겨졌을 뿐 다른 노드는 더해지지도 사라지지도 않았다. */
/* 2026-09-26: id · nodeCount 41 은 그대로이고 **걸친 라우트 수만** 10 → 19 로 늘었다 — 인증 fixture 에 데스크톱 사이드바를 쓰는
   화면이 늘어서다(같은 앵커 2c6bdacf). 보드 없던 실제 화면 셋(bulk-success · bulk-fail · coupons)이 10 → 13, 결제 성공 화면 넷의
   `?preview=` 상태 여섯이 13 → 19. 앱 셸 생성기의 상단 바 후보 가드와 같은 사유다. */
const candidate = fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find(
  (entry) => entry.id === "subtree-9c4c0327c2b0",
);
if (!candidate || candidate.nodeCount !== 41 || candidate.routeCount !== 19) {
  fail("measured repeated sidebar candidate changed; inspect before regenerating Figma");
}

/* 위와 같은 자리번호 밀림이다. route 집합이 옛 후보와 문자 그대로 같음을 확인했다 —
   fe34aa819557 은 settings·subscription·billing-change-success/fail·topup-success/fail 6개,
   103b6e563038 은 upgrade·billing-success·billing-fail·upgrade-fail 4개.
   제품이 더한 `?__phase=` 6개는 60노드짜리 별도 후보(subtree-19636a6ae1fa)로 따로 묶였고
   이 생성기는 그것을 쓰지 않는다(2026-09-13: 그 id 는 지금 원장에 없다 — 같은 셸이
   `subtree-6d62a3684fe6` 56/6/336 이고, 60 → 56 도 사이드바 「+」 두 쌍이 걷힌 -4 다). 헤더 두 벌은 여전히 각각 59노드다(당시 기록이다 — 2026-09-11
   재고정 38a7d5a4 부터는 각각 55노드. 아래 2026-09-13 주석).

   ae8fd627 → 5a67d692 에서 다시 갈렸다(fe34aa819557→bd975676e6bb, 103b6e563038→23a203251141).
   판정 근거는 위 사이드바와 **같은 하나**다: 두 헤더 59노드를 순서대로 견줘 path·tag·ownText·
   rect 차이 0, `roots` 배열도 byte 동일이고, 바뀐 값은 gray-700 잉크
   #575d68 → #40454f 뿐이다(59노드 중 30개, 아이콘 6개는 mask 잉크라 backgroundColor 도 함께).
   헤더가 사이드바를 자식으로 품으므로 같은 30개다. 출처는 LOUIS 3ec5966, 제품 5a67d692.

   세 번째로 갈렸다(bd975676e6bb→d1dc5adb9fa0, 23a203251141→c3cf629b9e07). 위 사이드바와
   **같은 하나**다 — 제품이 아니라 측정기가 움직였고(앵커 `5a67d692` 그대로, styleRef 를
   자리번호에서 내용 해시로 교체 + `content-visibility: auto` 래치를 스크롤 훑기로 못박음),
   서명 전수 대조에서 불일치 0 이었다. 59/6 · 59/4 는 그대로 둔다.

   네 번째로 갈렸다(d1dc5adb9fa0→79b78b9dcc94, c3cf629b9e07→30c5289f8743, 2026-09-10
   재고정 5a67d692 → 91e5ea2a). 옛↔새를 **roots 까지 포함해 전수 대조했고 불일치 0** 이다
   (nodeCount · routeCount · occurrenceCount · score · roots 의 route·path·tag·rect 전부).
   위 사이드바 후보는 y 가 4px 움직였는데 헤더 둘은 그마저도 없다 — 여백 변경이 사이드바
   메뉴 안쪽이었기 때문이다.

   **다만 59/6 후보가 하나 더 생겼다**(`subtree-d6ac743feeba`, score 354). 이것은 헤더가
   아니라 `/highlight/[projectId]` 여섯 단계(loading·uploading·upload·analyzing·extracting·
   failed)가 공유하는 `body.1.0.0.0.0` 셸이다 — 같은 수치를 갖지만 다른 것이므로 nodeCount
   만으로 고르면 엉뚱한 것을 집는다. 그래서 여기서는 **id 로** 집는다(아래).

   2026-09-13: 위 문단의 이름과 수치(`subtree-d6ac743feeba` · 59/6 · score 354)는 f19cc41c
   fixture(`git show 7f41d5a^:`)까지의 것이고 커밋된 fixture 에는 없다. 38a7d5a4 재고정의
   사이드바 -4(위 사이드바 가드 주석의 button + svg 두 쌍)가 이 셸에도 똑같이 올라와, 지금
   닮은꼴은 `subtree-3b6cdffb3172` 55/6 ·
   occurrenceCount 6 · score 330 이다. 첫 헤더 후보 `subtree-010a934d5c3b` 도 55/6 · 6 · 330 —
   nodeCount·routeCount·occurrenceCount·score 가 **넷 다 같고**, desktop 에서 55/6 인 후보는
   이 둘뿐이다. 갈리는 것은 roots 다(헤더: `/settings` 등 6개 route 의 `body.1.0.0.0` header,
   닮은꼴: `/highlight/[projectId]?__phase=` 6개의 `body.1.0.0.0.0` nav). 옛 d6ac743feeba 와
   roots 의 route·path·tag·rect 가 동일하고, 여섯 phase 모두 사라진 노드가
   `body.1.0.0.0.0.1.1.2.0.0.1` button·그 `.0` svg, `body.1.0.0.0.0.1.1.3.0.0.1` button·그 `.0` svg
   넷뿐이다(더해진 노드 0). 확인: `git show HEAD:migration/product.auth-fixture.json`
   (`productCommit` 6fbdac16)의 `componentCandidateAudit.repeatedSubtreesByContext["desktop-1920x1080"]`,
   노드 대조는 `git show 7f41d5a^:` 과 `git show 4ebbe46:` 의 같은 파일 `screens` 트리. */
/* 2026-09-15 재고정(6f6282c1 → 2c6bdacf)에서 두 헤더도 사이드바와 같은 하나로 갈렸다(010a934d5c3b → aa1c1412d5c4 · 55/6 → 53/6,
   5975d39c8e46 → 31a49ffcdd32 · 55/4 → 53/4). roots 의 route·path·tag 가 바이트 동일하고 rect 는 폭만 280 → 240(레일 `bc3e6fa3`)이다.
   헤더(`body.1.0.0.0`) 아래 사라진 노드는 위 사이드바 가드 주석의 아이브로우 li · span 둘뿐이다. 닮은꼴이던 `/highlight/[projectId]`
   여섯 phase 셸도 같은 −2 를 받아 여전히 id 로만 갈린다. */
const headerCandidates = ["subtree-aa1c1412d5c4", "subtree-31a49ffcdd32"].map((id) =>
  fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find((entry) => entry.id === id),
);
// 2026-09-26: 사이드바 가드와 같은 사유로 걸친 라우트 수만 늘었다 — Current=Default 헤더 6 → 13(bulk 둘 · coupons ·
// 미리보기 넷), Current=Upgrade 헤더 4 → 6(billing-success 미리보기 둘). id · nodeCount 53 은 그대로다.
if (
  !headerCandidates[0] ||
  headerCandidates[0].nodeCount !== 53 ||
  headerCandidates[0].routeCount !== 13 ||
  !headerCandidates[1] ||
  headerCandidates[1].nodeCount !== 53 ||
  headerCandidates[1].routeCount !== 6
) {
  fail("measured Gnb header variant candidates changed; inspect before regenerating Figma");
}
const headerPath = "body.1.0.0.0";
const headerNodes = (route) =>
  screen(route).tree.filter((entry) => entry.path === headerPath || entry.path.startsWith(`${headerPath}.`));
const headerDefault = headerNodes("/settings");
const headerCurrent = headerNodes("/mypage/upgrade");
// 두 헤더의 노드 수는 위 후보 서명이 쥔다 — 같은 수를 여기 한 번 더 적으면 앵커가 옮길 때 사본만 낡는다(2026-09-15, 55 → 53).
if (headerDefault.length !== headerCandidates[0].nodeCount || headerCurrent.length !== headerCandidates[1].nodeCount) {
  fail(`expected Gnb headers of ${headerCandidates[0].nodeCount} · ${headerCandidates[1].nodeCount} nodes, got ${headerDefault.length} · ${headerCurrent.length}`);
}
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
      text: drawnText(label),
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
/* 네 번째로 갈렸다(ffebd1510282 → 62c4e4642ab9, 2026-09-15 재고정 6f6282c1 → 2c6bdacf). 6/18 · roots 의 route·path·tag 그대로,
   rect 는 18개 모두 폭만 256 → 216 이다 — 브랜드 행이 레일 내용 폭을 채우고(`.louis-sidebar-brand` 의 `inline-size: 100%`) 레일이
   280 → 240 으로 줄었다(`bc3e6fa3`). 서브트리 6노드는 path · 글자 그대로이고 폭을 채우는 넷의 rect 만 움직였다. */
const brandCandidate = fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find(
  (entry) => entry.id === "subtree-62c4e4642ab9",
);
// 2026-09-26: 걸친 라우트 수만 18 → 27(인증 fixture 에 bulk · coupons 셋과 결제 성공 미리보기 여섯이 들어와서). id · 6 노드는 그대로다.
if (!brandCandidate || brandCandidate.nodeCount !== 6 || brandCandidate.routeCount !== 27) {
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
    { current: "Canvas", route: "/nodecanvas", menuCurrent: "Canvas", ctaState: "Current" },
    { current: "Composition", route: "/videoeditor", menuCurrent: "Composition", ctaState: "Current" },
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
    text: drawnText(entry),
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
/* **결제 결과 본문은 흐름이다 — 측정 rect 로 절대배치하지 않는다(2026-09-14, 크기 굳힘 감사 묶음 2).**
   제품(`billing-change-fail/page.tsx` 등 세 화면의 `STATUS_CARD` · `STATUS_META_LIST` · `STATUS_ACTIONS` ·
   `STATUS_BUTTON_PRIMARY`)은 세로 flex 이고, 높이를 선언하는 자리는 버튼 하나(`h-16`)뿐이다. 옛 계획은 글자 ·
   행 · 버튼의 측정 rect 를 실어 렌더러가 `textAutoResize NONE` + x/y 로 박았다 — 줄 수나 앵커가 바뀌면 조용히
   겹치거나 빈다. 이제 계획은 **선언이 정한 축만 값으로** 싣는다: 폭(`width: min(520px, 100%)`), 간격 · 패딩
   (계산 스타일), 버튼 높이(`height`). 나머지는 렌더러가 HUG · FILL 로 둔다.
   선언은 측정 원장의 노드별 `declared` 칸에서 읽는다 — 그 칸이 없거나 꼴이 다르면 던진다(값을 지어내지 않는다).
   rect 는 설명문 · 감사용 증거로만 남기고 러너에는 싣지 않는다. */
const declaredValue = (entry, property, pattern, where) => {
  const value = entry.declared?.[property];
  if (typeof value !== "string" || !pattern.test(value)) {
    fail(`${where} ${entry.path}: declared ${property} ${JSON.stringify(value)} does not match ${pattern}`);
  }
  return value;
};
// 폭 선언 `min(<상한>px, 100%)`. 부모가 상한보다 넓으면 상한(선택값)에 물려 FIXED, 좁으면 100% 라 소비처가
// FILL 로 늘린다 — 판정은 측정 폭과 선언 상한의 대조다. 마스터에는 부모가 없어 FILL 을 걸 수 없으므로 FILL
// 쪽 마스터의 기본 폭은 그 뷰포트의 측정 부모 폭이다.
const cappedWidth = (entry, where) => {
  const declared = declaredValue(entry, "width", /^min\(\d+(?:\.\d+)?px, 100%\)$/, where);
  const cap = Number(/^min\(([\d.]+)px/.exec(declared)[1]);
  return entry.rect.width === cap
    ? { mode: "FIXED", value: cap, declared }
    : { mode: "FILL", value: entry.rect.width, declared };
};
const paymentResultSpec = (context, route, outcome, viewport) => {
  const root = resultNode(context, route, resultSectionPath);
  const rootStyle = style(root);
  const failure = outcome === "Failure";
  const where = `${context} ${route}`;
  const actionsNode = resultNode(context, route, `${resultSectionPath}.${failure ? 3 : 2}`);
  const actionsStyle = style(actionsNode);
  const button = resultNode(context, route, `${actionsNode.path}.0`);
  const buttonStyle = style(button);
  // 버튼 줄은 `flex-wrap` 인데 버튼마다 `width: 100%` 라 한 줄에 하나씩 선다 — 세로 쌓임과 같다.
  // Figma 의 wrap 에서 FILL 자식은 줄을 나눠 가지므로 가로 wrap 으로 옮기면 제품과 다른 배치가 된다.
  declaredValue(actionsNode, "flex-wrap", /^wrap$/, where);
  declaredValue(button, "width", /^100%$/, where);
  const spec = {
    outcome,
    viewport,
    route,
    rect: { width: root.rect.width, height: root.rect.height },
    width: cappedWidth(root, where),
    gap: px(rootStyle.rowGap),
    gapDeclared: declaredValue(root, "gap", /\S/, where),
    background: rgba(rootStyle.backgroundColor),
    title: resultText(resultNode(context, route, `${resultSectionPath}.0`), root.rect),
    body: resultText(resultNode(context, route, `${resultSectionPath}.1`), root.rect),
    actions: {
      direction: "VERTICAL",
      gap: px(actionsStyle.rowGap),
      paddingTop: px(actionsStyle.marginTop),
      declared: {
        flexWrap: declaredValue(actionsNode, "flex-wrap", /^wrap$/, where),
        gap: declaredValue(actionsNode, "gap", /\S/, where),
        marginTop: declaredValue(actionsNode, "margin-top", /\S/, where),
      },
    },
    action: {
      rect: relRect(button, root.rect),
      // 높이는 선언(`h-16` → `height: calc(32px)`)이라 FIXED, 폭은 `width: 100%` 라 FILL 이다.
      height: px(buttonStyle.height),
      heightDeclared: declaredValue(button, "height", /px\)?$/, where),
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
      gap: px(detailStyle.rowGap),
      padding: {
        top: px(detailStyle.paddingTop),
        right: px(detailStyle.paddingRight),
        bottom: px(detailStyle.paddingBottom),
        left: px(detailStyle.paddingLeft),
      },
      // 결과 화면의 목록 행은 하나라 `[&>div:last-child]:[border-bottom:none]` 로 선이 없다.
      borderBottomWidth: px(detailStyle.borderBottomWidth),
      term: resultText(resultNode(context, route, `${resultSectionPath}.2.0.0`), root.rect),
      value: resultText(resultNode(context, route, `${resultSectionPath}.2.0.1`), root.rect),
    };
    if (spec.detail.borderBottomWidth !== 0) fail(`${where}: payment result detail row gained a border — the renderer draws none`);
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
const resultCandidateIds = ["subtree-8d24ecec085d", "subtree-4d3434d8b90b", "subtree-d53f06a79810"];
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

/* **색은 라이브 변수에 역할로 묶는다(2026-09-14, 컬렉션 이전).** 옛 계획은 은퇴한 `1 · Palette[default/sidebar]` ·
   `2 · Semantic[dark]` 의 이름을 실어 라이브에서 첫머리에 던졌고, 사이드바를 **다크 선언**(`[html[data-theme=dark]_&]` 줄)으로
   칠했다 — 이 생성기가 재는 fixture 는 light 인데도 그랬다(행 글자 측정 #41454c 를 다크 `gray/300` #a5a8ad 로, 활성 행에
   제품 사이드바에는 없는 `palette-gray-800/900` 면을). 이제 역할마다 제품 선언(소스 인용)과 라이브 변수를 적고, 칠하는
   자리마다 **측정 색과 값이 같은 역할**을 고른다. 측정 테마가 light 라 `Klipse Semantic Color[Light]` 로 풀고, 사이드바
   셸의 로고도 측정한 자산(`brand.image.asset`)을 쓴다. 앱 셸 러너(2026-09-13)가 상단 바를 옛 다크 캡처 값에서 light 측정
   으로 옮긴 것과 같은 이동이다. 대조표는 계획의 `colorEvidence` 가 갖는다. */
const live = liveVariables({ repoRoot, fail });
const quote = sourceQuotes({ repoRoot, productRoot, productCommit: fixture.productCommit, fail });
const GNB = "apps/web/components/navigation/Gnb.tsx";
/* 줄번호와 커밋이 박혀 있어 앵커가 움직일 때마다 조용히 낡던 문장이다(4614-4615 · 564/570 이 `6f6282c1` 에서 4694-4695 ·
   592/598 로 옮겨 있었다). 이제 활성 판정 두 줄은 소스 인용으로 확인하고, 색 줄은 `colorEvidence` 의 역할을 가리킨다. */
const activeRuleSource = [
  quote.product(GNB, 4664, "                    const href = row.href;"),
  quote.product(GNB, 4665, "                    const isActive = isSidebarMenuHrefActive(href);"),
];
const sharedActiveColourNote =
  `No new visual value: Gnb.tsx:${activeRuleSource[0].line}-${activeRuleSource[1].line} applies the common isSidebarMenuHrefActive result ` +
  `and the shared inactive/active colours are the colorEvidence roles gray300 · gray000 at pinned commit ${fixture.productCommit}.`;
const RESULT = "apps/web/app/mypage/upgrade/billing-change-fail/page.tsx";
const alphaReason = (token, step) =>
  `Product paints rgb(var(${token}) / ${step}%) — pure black at ${step}% in light. The live alpha ramp with that step resolves to ` +
  "static-black-alpha (#171b22 base), so the paint binds to the same-named live step and records the RGB gap (as the app-shell plan's exact=false inks).";
const roles = live.colorRoles({
  theme: "light",
  where: "components",
  roles: {
    gray300: { name: "color/gray/300", declared: [quote.product(GNB, 573, '    "[.gnb-menuSidebar_.gnb-menuLink:not(&)]:[color:var(--gray-300)]",')] },
    gray000: {
      name: "color/gray/000",
      declared: [
        quote.product(GNB, 579, '    "[color:var(--gray-000)]",'),
        quote.product(GNB, 1971, '    "[color:var(--gray-000)]",'),
        quote.product(RESULT, 88, '  "m-0 text-gray-000",'),
        quote.product(RESULT, 113, '  "[&_dd]:text-gray-000",'),
        quote.product(RESULT, 128, '  "[border:none] bg-gray-000 text-gray-900!",'),
      ],
    },
    paletteGray600: {
      collection: "Klipse Primitive", name: "color/palette-gray/600",
      declared: [quote.product(GNB, 171, '    "[color:var(--palette-gray-600)]",')],
    },
    paletteGray500Alpha12: {
      unbound: true, mix: { collection: "Klipse Primitive", name: "color/palette-gray/500", alpha: 0.12 },
      declared: [quote.product(GNB, 172, '    "[background:rgb(var(--palette-gray-500-rgb)_/_12%)]",')],
      reason: "The BETA chip paints rgb(var(--palette-gray-500-rgb) / 12%). The live file has no palette-gray alpha ramp and no variable resolves to palette-gray-500 at 12% (color/app/nav-chip-tint is static-black-alpha/04 in Light), so the chip keeps the measured colour as a fixed paint.",
    },
    paletteGray900: { collection: "Klipse Primitive", name: "color/palette-gray/900", declared: [quote.product(GNB, 1960, '    "[html[data-theme=light]_.gnb-sidebarUpgradeButton:not(&)]:[background:var(--palette-gray-900)]",')] },
    paletteGray100: { collection: "Klipse Primitive", name: "color/palette-gray/100", declared: [quote.product(GNB, 1961, '    "[html[data-theme=light]_.gnb-sidebarUpgradeButton:not(&)]:[color:var(--palette-gray-100)]",')] },
    paletteGray000: { collection: "Klipse Primitive", name: "color/palette-gray/000", declared: [quote.product(GNB, 1970, '    "[background:var(--palette-gray-000)]",')] },
    gray000Alpha56: {
      name: "color/gray/000-alpha/56", mix: { name: "color/gray/000", alpha: 0.56 },
      declared: [quote.product(RESULT, 96, '  "m-0 text-[rgb(var(--gray-000-rgb)/56%)]",')], reason: alphaReason("--gray-000-rgb", 56),
    },
    gray000Alpha48: {
      name: "color/gray/000-alpha/48", mix: { name: "color/gray/000", alpha: 0.48 },
      declared: [quote.product(RESULT, 110, '  "[&_dt]:text-[rgb(var(--gray-000-rgb)/48%)]",')], reason: alphaReason("--gray-000-rgb", 48),
    },
    gray900: { name: "color/gray/900", declared: [quote.product(RESULT, 128, '  "[border:none] bg-gray-000 text-gray-900!",')] },
    boardSurface: { name: "color/bg-canvas", annotation: "section fills behind the sets (board canvas, not a product surface)" },
    docsTitle: { name: "color/fg-primary", annotation: "documentation frame title" },
    docsNote: { name: "color/fg-secondary", annotation: "documentation frame note" },
  },
});
const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma candidate; not a normative design-system contract",
  productCommit: fixture.productCommit,
  context: contextName,
  sourceCandidate: candidate,
  component: {
    id: "product/gnb-sidebar-menu",
    pageId: "240:3529",
    pageName: "90 · 자산 — 아이콘 · 로고 · 제품 부품",
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
        route: "/nodecanvas",
        activeRow: "Canvas",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
        $note: sharedActiveColourNote,
      },
      {
        current: "Composition",
        route: "/videoeditor",
        activeRow: "Composition",
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
      /* **2026-09-11: 이 둘이 compound 에서 simple 로 내려왔다.** 제품 `658ece13` 이 사이드바
         Canvas·Composition 두 행의 + 버튼을 걷었다 — 행마다 `<button>` 과 그 안의
         `NavPlusGlyph` svg 한 쌍, 측정 트리로는 두 쌍 4노드다(path 자식은 트리에 없다. 근거는
         위 사이드바 후보 가드 주석).
         확인: `git grep -n NavPlusGlyph 6fbdac16 -- apps/web` 는 아무것도 내지 않는다(f19cc41c 에는
         Gnb.tsx 에 있다). `createNewCanvasProject` 의 줄 수는 버튼 수가 아니므로 근거로 쓰지 않는다. 문구는 `messages/en.ts` 에 남아 있으나
         부르는 자리가 없는 죽은 키이므로 aria 라벨로는 찾을 수 없다.
         그래서 옛 compound 행 빌더의 addRect·addRadius·addBackground 는 **측정할 대상이 없었다** —
         걷지 않고 두면 없는 버튼을 그리게 된다. 쓰는 곳이 사라진 그 빌더(`compoundRow`)와 aria 조회
         헬퍼는 2026-09-14 에 걷었다(계획이 싣지 않는 행 모양이다 — Updates (133) 「옛 compound 행」). */
      simpleRow("canvas", 2, "Canvas"),
      simpleRow("composition", 3, "Composition"),
      {
        ...simpleRow("highlight", 4, "Highlight"),
        kind: "highlight",
        beta: {
          rect: relRect(betaNode, rootRect),
          gap: betaGap,
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
      simpleRow("youtube", 5, "YouTube analytics"),
    ],
    $bindingPolicy: BINDING_POLICY,
    // 색 역할(`colors.bindings`)은 아래에서 앞에 합친다. 간격 · 반경은 되읽기에서 이름을 확인한다(`assertBindings`).
    bindings: {
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
      // `plus: ".glyph/NavPlusGlyph"` 를 걷었다(2026-09-11). 제품 `658ece13` 이 + 버튼을
      // 걷어 `NavPlusGlyph` 가 새 앵커에 0곳이고, 그것을 그리던 compound 행 둘도 simple 로
      // 내려갔다. 매핑만 남기면 생성물이 없는 버튼을 계속 가리켜, 다음 사람이 아직 있다고 읽는다.
      // **라이브 Figma 의 `.glyph/NavPlusGlyph` 컴포넌트는 이 변경이 지우지 않는다** —
      // 보드에서 걷는 것은 별건이고 사용자 자산이라 여기서 손대지 않았다.
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

const paintOf = (candidates, measured, where) => roles.paintFor(candidates, measured, where);
// 사이드바 행 — 비활성 글자 · 아이콘 잉크, BETA 칩. 활성 행은 variant 마다 측정 route 의 글자 색.
// 섹션 라벨(「Analytics」 아이브로우) 행은 제품 `2c6bdacf` 가 걷어 계획이 싣지 않는다 — 라이브 세트의 그 행은 러너가 `retired/` 로 숨긴다.
const rowPaints = {};
for (const row of plan.component.rows) {
  row.label.paint = paintOf(["gray300", "gray000"], row.label.color, `menu row ${row.label.text}`);
  row.icon.paint = paintOf(["gray300", "gray000"], row.icon.color, `menu icon ${row.label.text}`);
  rowPaints[`${row.label.paint}/${row.icon.paint}/${row.icon.opacity}`] = true;
  if (row.beta) {
    row.beta.paint = paintOf(["paletteGray500Alpha12"], row.beta.background, "menu BETA chip");
    row.beta.label.paint = paintOf(["paletteGray600", "gray300"], row.beta.label.color, "menu BETA label");
  }
}
// 비활성 행은 모두 같은 역할 · 같은 아이콘 불투명도여야 한다 — 러너는 라이브 variant 의 행을 이 한 값으로 다시 칠한다.
if (Object.keys(rowPaints).length !== 1) fail(`inactive sidebar rows disagree on paint: ${Object.keys(rowPaints).join(" | ")}`);
const [inactiveLabelPaint, inactiveIconPaint, inactiveIconOpacity] = Object.keys(rowPaints)[0].split("/");
// 제품 사이드바의 활성 행은 면이 없다(`.gnb-menuSidebar` 안에서 투명) — 옛 러너가 칠하던 인디케이터 면은 다크 비사이드바 선언이었다.
const sidebarActiveTransparent = quote.product(GNB, 585, '    "[html[data-theme=light]_.gnb-menuSidebar_&]:[background-color:transparent]",');
const activeRowButton = (route, text) => {
  let entry = byText(route, text);
  while (entry && entry.tag !== "button") entry = screen(route).tree.find((item) => item.path === entry.parentPath);
  return entry ?? fail(`no button around active row ${text} on ${route}`);
};
for (const [route, text] of [[routes.home.route, "Home"], [routes.youtube.route, "YouTube analytics"]]) {
  const background = rgba(style(activeRowButton(route, text)).backgroundColor);
  if (background[3] !== 0) fail(`active sidebar row ${text} on ${route} is no longer transparent — add an active row surface role`);
}

for (const variant of plan.component.variants) {
  if (!variant.activeRow) continue;
  variant.activePaint = paintOf(["gray000", "gray300"], variant.activeColor, `menu active ${variant.current}`);
}
for (const cta of plan.component.upgradeCta.variants) {
  cta.fillPaint = paintOf(["paletteGray900", "paletteGray000"], cta.fill, `upgrade CTA ${cta.state} fill`);
  cta.labelPaint = paintOf(["paletteGray100", "gray000"], cta.color, `upgrade CTA ${cta.state} label`);
}
for (const variant of plan.component.paymentResult.variants) {
  const where = `payment result ${variant.route} ${variant.viewport}`;
  if (variant.background[3] !== 0) fail(`${where}: result section gained a surface — the renderer draws none`);
  variant.title.paint = paintOf(["gray000"], variant.title.color, `${where} title`);
  variant.body.paint = paintOf(["gray000Alpha56"], variant.body.color, `${where} body`);
  if (variant.detail) {
    variant.detail.term.paint = paintOf(["gray000Alpha48"], variant.detail.term.color, `${where} term`);
    variant.detail.value.paint = paintOf(["gray000"], variant.detail.value.color, `${where} value`);
  }
  variant.action.fillPaint = paintOf(["gray000"], variant.action.fill, `${where} action`);
  variant.action.label.paint = paintOf(["gray900"], variant.action.label.color, `${where} action label`);
}
const colors = roles.finish();
plan.component.menuRowPaint = { label: inactiveLabelPaint, icon: inactiveIconPaint, iconOpacity: Number(inactiveIconOpacity), activeSurface: null, activeSurfaceSource: sidebarActiveTransparent };
plan.component.bindings = live.assertBindings({ ...colors.bindings, ...plan.component.bindings }, "components bindings");
plan.component.colorEvidence = colors.evidence;
// 사이드바 셸 로고는 측정 테마의 자산이다(light fixture → `/klipse-light.svg`).
plan.component.shell.brand.image.logoAsset = plan.component.shell.brand.image.asset;

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
// 결제 결과 러너에는 렌더러가 읽는 값만 싣는다 — 글자 · 행 · 버튼 rect 와 선언 문자열은 계획(감사본)에만 남는다.
for (const variant of runnerPlan.component.paymentResult.variants) {
  for (const text of [variant.title, variant.body, variant.action.label, variant.detail?.term, variant.detail?.value]) {
    if (text) delete text.rect;
  }
  delete variant.action.rect;
  delete variant.action.heightDeclared;
  delete variant.actions.declared;
  delete variant.gapDeclared;
  delete variant.width.declared;
  if (variant.detail) delete variant.detail.rect;
}
// 렌더러는 간격 · 패딩을 값이 같은 `spacing/<n>` 에, 버튼 반경을 `radius/12` 에 묶는다. 계획에 묶을 변수가 없는
// 값이 들어오면 러너가 라이브에서 던지기 전에 여기서 멈춘다.
{
  const bindings = plan.component.bindings;
  for (const variant of plan.component.paymentResult.variants) {
    const spacing = [
      variant.gap, variant.actions.gap, variant.actions.paddingTop,
      variant.action.padding.left, variant.action.padding.right,
      ...(variant.detail ? [variant.detail.gap, variant.detail.padding.top, variant.detail.padding.bottom] : []),
    ];
    for (const value of spacing) {
      if (value && !bindings[`spacing${value}`]) fail(`payment result ${variant.route} needs a spacing/${value} binding`);
    }
    if (variant.action.radius !== Number(bindings.radius12.name.split("/").pop())) {
      fail(`payment result ${variant.route} action radius ${variant.action.radius} is not radius/12`);
    }
  }
  // 사이드바 세트도 같다(2026-09-28) — 셸 패딩 · 브랜드 · 흐름 간격 · 메뉴 행 패딩과 간격 · 딱지 간격과 패딩 · CTA 패딩과 간격.
  // 렌더러가 넷 다 `spacing/12` 에 묶던 셸 패딩(측정 8 · 12 · 0 · 12)이 그렇게 틀렸다 — 이제 값마다 같은 변수를 찾고, 없으면 여기서 멈춘다.
  const C = plan.component;
  const sides = (padding) => [padding.top, padding.right, padding.bottom, padding.left];
  const sidebarSpacing = [
    ...sides(C.shell.root.padding),
    C.shell.brand.paddingLeft,
    C.shell.brand.gap,
    C.shell.menu.y - (C.shell.brand.rect.y + C.shell.brand.rect.height),
    C.root.gap,
    ...C.rows.flatMap((row) => [
      ...sides(row.padding),
      row.label.rect.x - row.icon.rect.x - row.icon.rect.width,
      ...(row.beta ? [row.beta.gap, row.beta.padding.left, row.beta.padding.right] : []),
    ]),
    ...C.upgradeCta.variants.flatMap((cta) => [...sides(cta.padding), cta.gap]),
  ];
  for (const value of sidebarSpacing) {
    if (value && !bindings[`spacing${value}`]) fail(`Gnb sidebar needs a spacing/${value} binding`);
  }
}
// **러너는 압축해 싣는다(2026-09-14).** 결제 결과 세트를 매 실행 reconcile 하게 되면서 템플릿이 자라, 주석을
// 그대로 실은 러너가 `use_figma` 의 50,000자 벽을 넘었다. 형제 생성기 build-figma-product-upgrade-scene 과 같은
// 방법으로 esbuild 로 줄인다 — 템플릿의 주석은 저장소(scripts/templates)에 그대로 남고, 계획은 plan.json 이 든다.
// 색은 역할 이름으로만 싣는다 — 측정 색 · 대조표 · 사유 · 인용은 계획에 남는다.
{
  const C = runnerPlan.component;
  delete C.$bindingPolicy;
  delete C.colorEvidence;
  delete C.menuRowPaint.activeSurfaceSource;
  for (const entry of Object.values(C.bindings.unbound ?? {})) delete entry.reason;
  for (const row of C.rows) {
    delete row.label.color;
    if (row.icon) delete row.icon.color;
    if (row.beta) { delete row.beta.background; delete row.beta.label.color; }
  }
  for (const cta of C.upgradeCta.variants) { delete cta.fill; delete cta.color; }
  for (const variant of C.paymentResult.variants) {
    delete variant.background;
    for (const text of [variant.title, variant.body, variant.action.label, variant.detail?.term, variant.detail?.value]) if (text) delete text.color;
    delete variant.action.fill;
  }
  delete C.shell.brand.image.darkAsset;
  delete C.shell.root.background;
}
const readableDraw =
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
  readFileSync(resolve(repoRoot, RENDERER_LIB), "utf8") +
  readFileSync(resolve(repoRoot, "scripts/templates/figma-product-components-renderer.js"), "utf8");
const wrapperPrefix = "async function __figmaRunner__(){";
const wrappedDraw = transformSync(`${wrapperPrefix}${readableDraw}}`, { minify: true, target: "es2022" }).code.trim();
if (!wrappedDraw.startsWith(wrapperPrefix) || !wrappedDraw.endsWith("}")) fail("unexpected esbuild wrapper output");
const draw = `// Generated and minified by scripts/build-figma-product-components.mjs. Do not edit by hand.\n` +
  `// Pass this file verbatim to use_figma. It creates missing measured product components and reconciles the payment result set in place.\n` +
  wrappedDraw.slice(wrapperPrefix.length, -1);
// `use_figma` 의 code 인자는 50,000자가 상한이다(형제 생성기 build-figma-product-upgrade-scene 과 같은 벽).
if (draw.length > 50_000) fail(`Figma runner exceeds connector limit: ${draw.length}`);
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
