#!/usr/bin/env node
// Figma 되읽기(`figma/readback.json`)의 `components` 블록을 **뜨는 절차 그 자체**를 코드로 갖는다.
//
// **왜 있는가.** `figma/readback.json` 은 손으로 떠 오는 파일이다. 채취 절차는
// `scripts/build-figma-snapshot.mjs` 머리말에 **산문으로만** 적혀 있었고 실행 가능한 스크립트가
// 없었다. 그래서 Figma 를 고치고 되읽기를 빠뜨리면 게이트가 **초록인 채로** 어긋난다 —
// parity 게이트는 되읽기를 정본으로 읽으므로, 되읽기가 낡으면 낡은 사실을 성실하게 검증한다.
// 실제로 세 번 그랬고, 이 스크립트를 처음 돌렸을 때 네 번째가 드러났다(아래 「알려진 어긋남」).
//
// 사용법
//   node scripts/figma-readback-emit.mjs --components [--only Name1,Name2]
//       Figma 플러그인(`use_figma`)에서 그대로 돌릴 JS 를 stdout 으로 낸다. 그 코드의
//       반환값이 `readback.json` 의 `components` 블록과 **같은 모양**이다.
//       한 응답이 20KB 를 넘으면 잘리므로 `--only` 로 나눠 뜬다.
//   node scripts/figma-readback-emit.mjs --merge <결과.json>
//       그 반환 JSON 을 `figma/readback.json` 의 `components` 에 병합한다. 키는 알파벳순을
//       유지하고 **나머지 블록은 건드리지 않는다.**
//   node scripts/figma-readback-emit.mjs --spec [--only ...]
//   node scripts/figma-readback-emit.mjs --variables --only color/a,color/b   # 변수 행만 뜬다
//   node scripts/figma-readback-emit.mjs --merge-variables <결과.json>
//       채취 명세만 낸다(디버그용).
//
// **채취 명세(`CAPTURE`)가 왜 필요한가.** 되읽기는 「Figma 를 전부 덤프한 것」이 아니라
// **계약이 보는 축만** 담는다. 어느 자손을 `parts` 로 뜨는지, 그중 어느 필드를 뜨는지, 어느
// stroke·effect 역할을 담는지가 컴포넌트마다 다르다 — TextField 는 `Box` 만 담고 `Focus ring`
// 은 담지 않으며, Badge 는 라벨의 `fontSize` 만 담고 폭은 담지 않는다(라벨 폭은 글꼴 렌더링에
// 달려 있어 브라우저와 Figma 가 원래 다르다). 그 선택은 계약이 소유하는 판단이라 코드가
// 추론할 수 없다. 그래서 **명세를 선언으로 적고 값만 Figma 에서 읽는다.**
// 아래 표는 2026-08-26 시점의 `readback.json` 41개 항목에서 역설계했다 — 새 컴포넌트를 더할
// 때는 항목을 손으로 적는다.
//
// 명세 항목
//   key         geometry 키 규칙. `{by:["Size"]}` 면 그 variant 축의 값이 키가 되고,
//               `{by:["Size","Variant"]}` 면 `{size}/{variant}` 복합 키(Slider),
//               `{name:"base"}` 면 전 variant 를 한 키에 묶는다. **키를 해석하는 코드는 없다** —
//               되읽기와 `figma/components.measured.json` 이 같은 키를 쓰기만 하면
//               verify-figma-parity 가 그대로 대조한다.
//   fields      root 에서 담을 기하 필드와 **그 순서**. 생략하면 DEFAULT_FIELDS.
//   slots       `WxH` 로 담을 자손 이름(`"size"`) 또는 존재 여부로 담을 이름(`"present"`).
//   parts       자손별로 담을 필드.
//   strokes     담을 stroke 역할 이름. `self` 는 variant 루트다.
//   effects     담을 effect 역할 이름.
//   childOrder  칠 순서를 담을지. 숫자 z-index 가 없는 컴포넌트는 자식 순서가 곧 칠 순서다.
//   outsideParts  **일부러** 프레임 밖으로 나가는 자손(포커스 링·말풍선 화살표).
//
// 채취 규칙(하나로 통일했다 — 아래 「어긋남」이 규칙이 여럿이었다는 증거다)
//   1. 변형마다 한 번 훑고 **INSTANCE 에서 멈춘다.** instance 노드 자신은 담되 내부로는
//      들어가지 않는다 — 그 값은 원본 컴포넌트의 것이고, 아이콘 instance 의 원시값은 icon
//      게이트가 각 아이콘 component 에서 따로 잡는다. build-figma-snapshot 머리말이 적어 둔
//      의도와 같다(다만 거기 적힌 이유 「INSTANCE.children 이 비어 있다」는 사실이 아니다 —
//      Plugin API 는 instance 자식을 노출한다. 규칙은 맞고 이유가 틀렸다).
//   2. stroke·effect 역할 이름은 `self`(변형 루트) 아니면 **그 노드의 이름**이다.
//   3. `geometry.strokeWeight` 는 stroke 를 가진 노드의 두께인데 **VECTOR 는 뺀다** —
//      벡터의 stroke 는 테두리가 아니라 그림 자체다(캐럿 1px, 아이콘 획 1.5px).
//   4. 숫자는 기하 1자리, effect 좌표 6자리에서 접는다.
//
// **알려진 어긋남(2026-08-26, 이 스크립트를 처음 돌려 확인).** 되읽기 41개 항목은 한 절차로
// 만들어지지 않았다. 서로 **양립하지 않는 규칙**이 섞여 있어서 어떤 emitter 도 41개를 전부
// 재현할 수 없다. 확인된 것:
//   · `Button` — `strokes.self = 0.5|INSIDE` 와 `Spinner = 2|INSIDE` 를 담고 있는데 Figma 의
//     Button 변형 200개 중 stroke 를 가진 노드는 글리프 벡터(1.5|CENTER)뿐이다. secondary 의
//     헤어라인은 DS-D-0023 대로 `INNER_SHADOW:0:0:0.5` 로 옮겨졌는데 되읽기의 effects 는 비어
//     있다. `IconButton` 도 같은 시기 값(self 0.5|INSIDE)을 그대로 갖고 있다.
//   · `Slider` — `variantCount:12` 와 `State` 축은 있는데 `binding` 은 정확히 3분의 1이다
//     (16/2/4 대 48/10/12). State 축이 생기기 전 4변형 시절의 수를 그대로 갖고 있다는 뜻이다.
//     `overflowingParts` 에 `FocusRing` 이 없는 것도 같은 이유다.
//   · `ProjectCard` — **해소됐다(2026-08-30).** 자손 이름이 Figma 에서 `Adornment` → `More`
//     로 어긋나 있었고 계약이 두 이름을 따로 셌다. Figma 를 공개 API 이름 `Adornment` 로
//     되돌리고 계약을 한 줄로 합쳤다. 비-오토레이아웃 프레임의 padding 을 빈 배열로 담는데
//     `VideoPlayer` 는 같은 상황에서 0 을 담는 것은 그대로 남아 있다 — 같은 축을 두 규칙으로 잰다.
// 이 스크립트는 그 사실을 **드러내기만** 한다. 되읽기를 고치면 계약도 함께 움직이므로 별도
// 판단이 필요하다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const READBACK_PATH = "figma/readback.json";

// component set 이 사는 페이지. 아이콘은 `DS · Icons` 에 있고 `icon/` 접두사로 갈린다.
const COMPONENT_PAGE = "DS · Components";

// 기본 root 기하 필드와 그 순서.
const DEFAULT_FIELDS = [
  "height",
  "width",
  "paddingBlock",
  "paddingBlockEnd",
  "paddingInline",
  "paddingInlineEnd",
  "itemSpacing",
  "cornerRadius",
  "layoutMode",
  "strokeWeight",
];

// 컴포넌트당 한 줄로 적는다 — 항목이 늘어도 diff 가 그 줄 하나로 남는다.
const CAPTURE = {
  "Alert": {"key":{"by":["Tone"]},"parts":{"Icon":["width","height"],"Content":["width","height"]},"strokes":["self"]},
  "AppTopBar": {"key":{"name":"topBar"},"slots":{"LeadingSlot":"present","TrailingSlot":"present"},"parts":{"Leading":["height"],"Trailing":["height"]}},
  "Avatar": {"key":{"by":["Size"]},"slots":{"Fallback":"size"},"parts":{"Fallback":["width","height"]}},
  "Badge": {"key":{"name":"base"},"slots":{"Icon":"size","Dot":"size"},"parts":{"Label":["fontSize"]}},
  "BannerCarousel": {"key":{"by":["Bleed"]},"fields":["width","height","cornerRadius","layoutMode","strokeWeight"],"parts":{"Content":["width","height","paddingLeft","paddingTop"],"Controls":["width","height","cornerRadius","itemSpacing","paddingLeft"],"ArrowPrevious":["width","height","cornerRadius","children"],"ArrowNext":["width","height","cornerRadius","children"],"DotActive":["width","height","cornerRadius"],"DotRest1":["width","height","cornerRadius"],"PlaybackToggle":["width","height","cornerRadius","children"]}},
  "Breadcrumb": {"key":{"by":["Kind"]},"parts":{"Current":["width","height","fontSize"],"Parent":["width","height","fontSize"],"Separator":["width","height","fontSize"]}},
  "Button": {"key":{"by":["Size"]},"slots":{"LeftIcon":"size","RightIcon":"size","Spinner":"size"},"strokes":["LeftIcon.glyph","RightIcon.glyph","Spinner","self"]},
  "CarouselArrow": {"key":{"name":"base"},"parts":{"Caret":["width","height"],"glyph":["width","height"]},"strokes":["glyph"],"effects":["self"]},
  "Checkbox": {"key":{"name":"base"},"parts":{"Box":["width","height","cornerRadius"],"Check":["width","height"],"Dash":["width","height","cornerRadius"],"Label":["width","height","fontSize"]},"strokes":["Box","Check"]},
  "Dialog": {"key":{"by":["Size"]},"parts":{"Footer":["paddingTop","paddingInline","paddingInlineEnd","paddingBottom","children"],"Actions":["itemSpacing","children","layoutMode","primaryAxisAlignItems"]},"strokes":["self"],"effects":["self"]},
  "EmptyState": {"key":{"name":"base"},"fields":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","layoutMode","strokeWeight"],"parts":{"Graphic":["width","height"],"Title":["width","height","fontSize","lineHeightPercent"],"Description":["width","height","fontSize","lineHeightPercent"],"Action":["width","height","paddingBlock","itemSpacing","layoutMode"]}},
  "FaqRow": {"key":{"by":["Expanded"]},"parts":{"Question":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing"],"QuestionText":["width","height","fontSize","lineHeightPercent"],"Icon":["width","height"],"Glyph":["fontSize"]}},
  "FormMessage": {"key":{"by":["Tone"]},"parts":{"Message":["width","height","fontSize"]}},
  "IconButton": {"key":{"by":["Size"]},"slots":{"Glyph":"size"},"strokes":["self","Glyph.glyph"]},
  "InlineLoadingLabel": {"key":{"by":["Size","Loading"]},"slots":{"Slot":"size"},"parts":{"Label":["width","height","fontSize","lineHeightPercent"],"Slot":["width","height"]}},
  "Keycap": {"key":{"by":["Kind"]},"parts":{"Label":["width","height","fontSize"]},"effects":["self"]},
  "MediaCard": {"key":{"name":"base"},"slots":{"Glyph":"size"},"parts":{"TopBar":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd"],"Badge":["height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","cornerRadius"],"BadgeLabel":["fontSize","lineHeightPercent"],"InfoBar":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","layoutMode"],"NameRow":["height","itemSpacing"],"Title":["fontSize","lineHeightPercent"],"Description":["fontSize","lineHeightPercent"]},"effects":["Badge","InfoBar"]},
  "MediaScrubber": {"key":{"name":"base"},"parts":{"Track":["width","height"],"Thumb":["width","height"]}},
  "Menu": {"key":{"name":"panel"}},
  "MenuPanel": {"key":{"name":"panel"},"fields":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","minWidth","layoutMode"],"effects":["self"]},
  "MenuSeparator": {"key":{"name":"default"}},
  "GnbMenuItem": {"key":{"by":["Surface","State"]},"fields":["height","width","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","layoutMode","strokeWeight","opacity"],"parts":{"Label":["width","height","fontSize","lineHeightPercent"]}},
  "NodeChip": {"key":{"by":["Shape"]},"slots":{"Glyph":"size"},"parts":{"Glyph":["width","height"],"Label":["width","height","fontSize"]},"effects":["self"]},
  "NewsCard": {"key":{"by":["Featured"]},"parts":{"Body":["width","height","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","itemSpacing"],"Date":["width","height","fontSize"],"Headline":["width","height","fontSize","lineHeightPercent"]}},
  "PaneDivider": {"key":{"by":["Orientation","State"]},"parts":{"Grip":["width","height","cornerRadius","opacity"]}},
  "ProgressBar": {"key":{"name":"base"},"parts":{"Fill":["width","height","cornerRadius","layoutMode"]}},
  "ProgressRing": {"key":{"name":"base"},"parts":{"Track":["width","height"],"Content":["width","height"]}},
  "ProjectCard": {"key":{"name":"base"},"parts":{"Media":["width","height"],"Title overlay":["width","height","itemSpacing","paddingBlock","paddingBlockEnd","paddingInline","paddingInlineEnd","layoutMode"],"Eyebrow":["width","height","fontSize","lineHeightPercent"],"Title":["width","height","fontSize","lineHeightPercent"],"Meta":["width","height","fontSize","lineHeightPercent"],"Thumbnail":["width","height"],"Action":["width","height"],"Adornment":["width","height"]},"strokes":["self"],"effects":["Title overlay"],"childOrder":true},
  "SegmentedControl": {"key":{"by":["Size"]},"slots":{"Item 1":"size","Item 2":"size","Item 3":"size"},"parts":{"Item 1":["width","height"],"Item 2":["width","height"],"Item 3":["width","height"]},"effects":["self"]},
  "SegmentedControlItem": {"key":{"by":["Size"]},"parts":{"Label":["width","height","fontSize"],"FocusRing":["width","height"]},"strokes":["FocusRing"],"outsideParts":["FocusRing"]},
  "SegmentedCodeInput": {"key":{"by":["State"]},"parts":{"Cell 1":["width","height","cornerRadius"],"Separator":["width","height"],"Dash":["fontSize"],"Char":["height","fontSize"]},"strokes":["Cell 1"]},
  "SelectableListRow": {"key":{"name":"base"},"parts":{"Marker":["width","height","cornerRadius"],"Media":["width","height","cornerRadius"],"Text":["width","height","itemSpacing","cornerRadius"],"Title":["width","height","fontSize"],"Meta":["width","height","fontSize"],"Trailing":["width","height","fontSize"]}},
  "SidebarBrand": {"key":{"by":["Collapsed"]},"fields":["strokeWeight","width","height","cornerRadius","layoutMode","paddingInline","paddingInlineEnd","paddingBlock","paddingBlockEnd","itemSpacing"],"parts":{"Mark":["width","height"],"Wordmark":["width","height"]}},
  "SidebarCta": {"key":{"by":["Collapsed"]},"parts":{"Label":["width"]},"effects":["self"]},
  "SidebarNavItem": {"key":{"name":"navItem"},"parts":{"Icon":["width","height"]}},
  "SidebarNavRow": {"key":{"name":"navRow"},"fields":["strokeWeight","width","height","cornerRadius","layoutMode","itemSpacing","paddingInline","paddingInlineEnd","paddingBlock","paddingBlockEnd"],"parts":{"Item":["height"],"Action":["width","height"]},"childOrder":true},
  "Skeleton": {"key":{"by":["Shape"]}},
  "Slider": {"key":{"by":["Size","Variant"]},"parts":{"Label":["width","height","fontSize","lineHeightPercent"],"Control":["width","height"],"Rail":["width","height"],"Fill":["width","height"],"Thumb":["width","height"]},"strokes":["Thumb"]},
  "Spinner": {"key":{"by":["Size"]},"fields":["width","height","strokeWeight"],"parts":{"Track":["width","height"],"Arc":["width","height"]}},
  "StepTile": {"key":{"name":"base"},"slots":{"Description":"present"},"parts":{"Tile":["width","height","cornerRadius"],"Caption":["width","height","itemSpacing","layoutMode"],"Label":["width","height","fontSize","lineHeightPercent"],"Description":["width","height","fontSize","lineHeightPercent"]}},
  "Switch": {"key":{"by":["Checked"]},"parts":{"Thumb":["width","height"]},"effects":["Thumb"]},
  "TabItem": {"key":{"by":["State"]},"parts":{"Label":["width","height","fontSize"]}},
  "Table": {"key":{"name":"base"},"parts":{"HeaderRow":["width","height"],"Row 1":["width","height"],"Row 2":["width","height"],"Row 3":["width","height"]},"strokes":["TableCell"],"effects":["HeaderRow"]},
  "TableCell": {"key":{"by":["Align"]},"parts":{"Label":["width","height","fontSize"]},"strokes":["self"]},
  "TableHeaderCell": {"key":{"by":["Align"]},"parts":{"Label":["width","height","fontSize"]}},
  "Tabs": {"key":{"name":"base"},"slots":{"TabItem":"size"},"parts":{"TabItem":["width","height"]}},
  "TextField": {"key":{"by":["Size"]},"parts":{"Box":["height","width","paddingInline","paddingInlineEnd","itemSpacing","cornerRadius","layoutMode"],"Label":["height","width","fontSize","lineHeightPercent"],"Value":["height","width","fontSize","lineHeightPercent"],"Message":["height","width","fontSize","lineHeightPercent"]},"strokes":["Box"]},
  "Toast": {"key":{"name":"base"},"effects":["self"]},
  "Tooltip": {"key":{"name":"base"},"parts":{"Arrow":["width","height"]},"strokes":["self"],"effects":["self"],"outsideParts":["Arrow"]},
  "VideoPlayer": {"key":{"name":"base"},"parts":{"Video (placeholder)":["width","height"],"Scrim (opacity 0)":["width","height"],"Center chrome":["width","height"],"Bottom chrome":["width","height"]},"strokes":["Vector"],"effects":["Skip back 10s","Play","Skip forward 10s","Progress pill","Expand"]},
};

function usage(message) {
  if (message) console.error(`[readback-emit] ${message}`);
  console.error(
    [
      "사용법:",
      "  node scripts/figma-readback-emit.mjs --components [--only Name1,Name2]",
      "  node scripts/figma-readback-emit.mjs --merge <결과.json>",
      "  node scripts/figma-readback-emit.mjs --spec [--only Name1,Name2]",
      "  node scripts/figma-readback-emit.mjs --variables --only color/a,color/b",
      "  node scripts/figma-readback-emit.mjs --merge-variables <결과.json>",
    ].join("\n"),
  );
  process.exit(message ? 1 : 0);
}

const argv = process.argv.slice(2);
const onlyIndex = argv.indexOf("--only");
const only =
  onlyIndex === -1
    ? null
    : String(argv[onlyIndex + 1] ?? "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
if (onlyIndex !== -1 && (only === null || only.length === 0)) {
  usage("--only 뒤에 이름이 필요합니다.");
}

function selectedSpec() {
  if (only === null) return CAPTURE;
  const picked = {};
  for (const name of only) {
    if (CAPTURE[name] === undefined) {
      usage(
        `채취 명세에 없는 컴포넌트입니다: ${name}. 새 컴포넌트라면 이 파일의 CAPTURE 에 항목을 먼저 적습니다.`,
      );
    }
    picked[name] = CAPTURE[name];
  }
  return picked;
}

/** 플러그인에서 돌릴 채취 코드. 반환값이 readback.components 와 같은 모양이다. */
function pluginSource(spec) {
  return `// 생성물 — \`node scripts/figma-readback-emit.mjs --components\` 가 낸 코드다. 손으로 고치지 않는다.
const SPEC = ${JSON.stringify(spec)};
const PAGE = ${JSON.stringify(COMPONENT_PAGE)};
const DEFAULT_FIELDS = ${JSON.stringify(DEFAULT_FIELDS)};

// Figma FLOAT 는 float32 라 0.45 가 0.44999998807907104 로, 120% 가 120.00000476837158 로
// 돌아온다. effect 좌표는 6자리(r6), 기하는 **1자리**(r1)에서 접는다 — 되읽기의 기하 값은
// 소수 한 자리를 넘지 않으며(전수 확인) parity 는 root 필드를 완전 일치로 본다.
const r6 = (n) => (typeof n === "number" ? Math.round(n * 1e6) / 1e6 : n);
const r1 = (n) => (typeof n === "number" ? Math.round(n * 10) / 10 : n);
const num = (n) => (typeof n === "number" && Number.isFinite(n) ? r1(n) : undefined);

const page = figma.root.children.find((p) => p.name === PAGE);
if (!page) throw new Error("페이지를 찾지 못했습니다: " + PAGE);
// figma.currentPage 는 매 호출 첫 페이지로 초기화된다. 이 줄 없이 세면 component 가 0개다.
await figma.setCurrentPageAsync(page);

// blur 반경이 묶인 변수의 Figma 이름. effect 문자열이 var(이름) 을 쓴다.
const VARNAME = new Map((await figma.variables.getLocalVariablesAsync()).map((v) => [v.id, v.name]));

// **COMPONENT_SET 만 세지 않는다.** variant 축이 없는 컴포넌트(ProjectCard)는 단일 COMPONENT 이고,
// 그것만 빠뜨리면 계약을 추가해도 "snapshot 에 없습니다" 로 막힌다.
const tops = page
  .findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] })
  .filter((n) => n.parent && n.parent.type !== "COMPONENT_SET" && n.name.indexOf("icon/") !== 0);
const byName = new Map(tops.map((n) => [n.name, n]));

const hasPaint = (paints) => Array.isArray(paints) && paints.some((p) => p.visible !== false);

/**
 * effect 직렬화. 문자열 완전 일치로 비교되므로 형식을 지킨다.
 *   DROP_SHADOW|INNER_SHADOW → {TYPE}:{offsetY}:{radius}:{spread}
 *   BACKGROUND_BLUR|LAYER_BLUR (NORMAL) → {TYPE}:{blurType}:{radius|var(figmaName)}
 *   BACKGROUND_BLUR (PROGRESSIVE) → {TYPE}:PROGRESSIVE:{radius}:{startRadius}:{sx},{sy}:{ex},{ey}
 * 여러 겹은 " + " 로 잇는다.
 */
const effectString = (effects) => {
  const layers = [];
  for (const e of effects || []) {
    if (e.visible === false) continue;
    if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") {
      layers.push(e.type + ":" + r6(e.offset.y) + ":" + r6(e.radius) + ":" + r6(e.spread || 0));
    } else if (e.type === "BACKGROUND_BLUR" || e.type === "LAYER_BLUR") {
      const bound = e.boundVariables && e.boundVariables.radius;
      const radius = bound ? "var(" + (VARNAME.get(bound.id) || bound.id) + ")" : String(r6(e.radius));
      if (e.blurType === "PROGRESSIVE") {
        layers.push(
          e.type + ":PROGRESSIVE:" + radius + ":" + r6(e.startRadius || 0) + ":" +
            r6(e.startOffset.x) + "," + r6(e.startOffset.y) + ":" +
            r6(e.endOffset.x) + "," + r6(e.endOffset.y),
        );
      } else {
        layers.push(e.type + ":" + (e.blurType || "NORMAL") + ":" + radius);
      }
    }
  }
  return layers.length === 0 ? null : layers.join(" + ");
};

// 값마다 **배열**인 이유는 같은 키의 variant 가 서로 다르면 배열이 길어져 "40개 중 하나만
// 어긋난" 경우가 보이기 때문이다.
const push = (bag, key, value) => {
  if (value === undefined || value === null) return;
  const list = bag[key] || (bag[key] = []);
  if (list.indexOf(value) === -1) list.push(value);
};

const rootField = (node, field) => {
  if (field === "layoutMode") return node.layoutMode;
  // 불투명도가 **계약 그 자체**인 컴포넌트가 있다(GnbMenuItem 은 여덟 변형의 기하가 완전히
  // 같고 잉크 한 색의 불투명도만 바뀐다). Figma FLOAT 는 float32 라 0.65 가
  // 0.6499999761581421 로 돌아오므로 두 자리에서 접는다.
  if (field === "opacity") return Math.round(node.opacity * 100) / 100;
  if (field === "paddingBlock") return num(node.paddingTop);
  if (field === "paddingBlockEnd") return num(node.paddingBottom);
  if (field === "paddingInline") return num(node.paddingLeft);
  if (field === "paddingInlineEnd") return num(node.paddingRight);
  if (field === "cornerRadius") return typeof node.cornerRadius === "number" ? num(node.cornerRadius) : undefined;
  return num(node[field]);
};

const partField = (node, field) => {
  if (field === "fontSize") return num(node.fontSize);
  if (field === "fontStyle") return node.fontName && node.fontName.style;
  if (field === "lineHeightPercent") {
    const lh = node.lineHeight;
    return lh && lh.unit === "PERCENT" ? num(lh.value) : undefined;
  }
  if (field === "children") return (node.children || []).length;
  if (field === "layoutMode") return node.layoutMode;
  if (field === "primaryAxisAlignItems") return node.primaryAxisAlignItems;
  if (field === "paddingTop" || field === "paddingBlock") return num(node.paddingTop);
  if (field === "paddingBottom" || field === "paddingBlockEnd") return num(node.paddingBottom);
  if (field === "paddingLeft" || field === "paddingInline") return num(node.paddingLeft);
  if (field === "paddingRight" || field === "paddingInlineEnd") return num(node.paddingRight);
  if (field === "cornerRadius") return typeof node.cornerRadius === "number" ? num(node.cornerRadius) : undefined;
  return num(node[field]);
};

const result = {};
for (const name of Object.keys(SPEC)) {
  const spec = SPEC[name];
  const set = byName.get(name);
  if (!set) { result[name] = { $missing: true }; continue; }
  const variants = set.type === "COMPONENT_SET" ? set.children : [set];
  const fields = spec.fields || DEFAULT_FIELDS;

  const properties = {};
  for (const raw of Object.keys(set.componentPropertyDefinitions || {})) {
    const def = set.componentPropertyDefinitions[raw];
    const key = raw.split("#")[0];
    properties[key] =
      def.type === "VARIANT" ? { type: "VARIANT", options: def.variantOptions.slice() } : { type: def.type };
  }

  const binding = { boundFills: 0, rawFills: 0, boundStrokes: 0, rawStrokes: 0, textStyled: 0, textUnstyled: 0 };
  const strokes = {};
  const effects = {};
  const bags = {};
  const order = [];

  const countNode = (node) => {
    const bvFills = (node.boundVariables && node.boundVariables.fills) || [];
    const fillList = Array.isArray(node.fills) ? node.fills : [];
    for (let i = 0; i < fillList.length; i += 1) {
      const paint = fillList[i];
      if (paint.visible === false) continue;
      if (paint.type && paint.type.indexOf("GRADIENT") === 0) {
        // **그라디언트는 paint 가 아니라 stop 단위로 센다.** paint 에는 boundVariables.color 가
        // 아예 없어서 paint 로 세면 어떤 그라디언트든 raw 로 잡힌다. 알파 0 stop 은 색을
        // 나르지 않고 파일에 알파 0 색 변수도 없으므로 세지 않는다.
        for (const stop of paint.gradientStops || []) {
          if (!stop.color || stop.color.a <= 0) continue;
          if (stop.boundVariables && stop.boundVariables.color) binding.boundFills += 1;
          else binding.rawFills += 1;
        }
        continue;
      }
      if (paint.type !== "SOLID") continue;
      // 완전히 투명한 fill 은 색이 아니다 — Figma 배경 흐림이 렌더되려면 그 층에 fill 이
      // 있어야 해서 생기는 것이다.
      if ((paint.opacity === undefined ? 1 : paint.opacity) === 0) continue;
      if (bvFills[i]) binding.boundFills += 1;
      else binding.rawFills += 1;
    }
    const bvStrokes = (node.boundVariables && node.boundVariables.strokes) || [];
    const strokeList = Array.isArray(node.strokes) ? node.strokes : [];
    for (let i = 0; i < strokeList.length; i += 1) {
      const paint = strokeList[i];
      if (paint.visible === false) continue;
      if (paint.type !== "SOLID") continue;
      if ((paint.opacity === undefined ? 1 : paint.opacity) === 0) continue;
      if (bvStrokes[i]) binding.boundStrokes += 1;
      else binding.rawStrokes += 1;
    }
    if (node.type === "TEXT") {
      if (node.textStyleId && node.textStyleId !== "") binding.textStyled += 1;
      else binding.textUnstyled += 1;
    }
  };

  const variantValues = (node) => {
    const out = {};
    for (const part of String(node.name).split(",")) {
      const at = part.indexOf("=");
      if (at !== -1) out[part.slice(0, at).trim()] = part.slice(at + 1).trim();
    }
    return out;
  };

  for (const variant of variants) {
    const key = spec.key.name !== undefined
      ? spec.key.name
      : spec.key.by.map((axis) => variantValues(variant)[axis]).join("/");
    if (!bags[key]) { bags[key] = { slots: {}, parts: {}, root: {}, weights: [], overflowing: [], childOrder: null }; order.push(key); }
    const bag = bags[key];

    for (const field of fields) {
      if (field === "strokeWeight") continue;
      push(bag.root, field, rootField(variant, field));
    }
    if (spec.childOrder) bag.childOrder = (variant.children || []).map((c) => c.name);

    const box = variant.absoluteBoundingBox;
    // 숨긴 레이어의 **자손**은 화면에 없다. 넘침·슬롯·자손 치수를 셀 때 그 subtree 를 빼지
    // 않으면 「안 보이는 것이 프레임 밖으로 나갔다」는 거짓 결함이 잡힌다 — 실제로
    // InlineLoadingLabel 의 닫힌 변형(슬롯을 숨겨 폭 0 을 표현한다)에서 그랬다.
    // **바인딩은 계속 센다** — 숨긴 레이어의 원시 fill 도 라이브러리에는 그대로 실린다.
    const visit = (node, hidden) => {
      countNode(node);
      const invisible = hidden || node.visible === false;
      if (node.id !== variant.id && !invisible) {
        // **VECTOR 의 stroke 는 테두리가 아니라 그림 자체다.** 글리프 외곽선을 테두리 두께로
        // 세면 "보이는 테두리는 CSS border 두께여야 한다" 검사가 아이콘 획을 잡는다.
        if (hasPaint(node.strokes) && typeof node.strokeWeight === "number" && node.type !== "VECTOR") {
          if (bag.weights.indexOf(r1(node.strokeWeight)) === -1) bag.weights.push(r1(node.strokeWeight));
        }
        const role = node.name;
        if ((spec.strokes || []).indexOf(role) !== -1 && hasPaint(node.strokes)) {
          push(strokes, role, r1(node.strokeWeight) + "|" + node.strokeAlign);
        }
        if ((spec.effects || []).indexOf(role) !== -1) push(effects, role, effectString(node.effects));
        const slotKind = (spec.slots || {})[node.name];
        if (slotKind === "present") bag.slots[node.name] = true;
        else if (slotKind === "size") push(bag.slots, node.name, r1(node.width) + "x" + r1(node.height));
        const partFields = (spec.parts || {})[node.name];
        if (partFields) {
          const target = bag.parts[node.name] || (bag.parts[node.name] = {});
          for (const field of partFields) push(target, field, partField(node, field));
        }
        // 보이는 자손이 variant 프레임 밖으로 나가면 썸네일과 인스턴스에서 잘려 보인다.
        const own = node.absoluteBoundingBox;
        if (own && box) {
          const outside =
            own.x < box.x - 0.01 || own.y < box.y - 0.01 ||
            own.x + own.width > box.x + box.width + 0.01 ||
            own.y + own.height > box.y + box.height + 0.01;
          if (outside && bag.overflowing.indexOf(node.name) === -1) bag.overflowing.push(node.name);
        }
      }
      // **instance 내부로 들어가지 않는다.** instance 가 품은 값은 그 원본 컴포넌트의 것이고,
      // 아이콘 instance 의 원시값은 icon 게이트가 각 아이콘 component 에서 따로 잡는다.
      // 여기서 세면 같은 값이 두 곳에서 두 번 계약된다.
      if (node.type !== "INSTANCE") for (const child of node.children || []) visit(child, invisible);
    };

    countNode(variant);
    if ((spec.strokes || []).indexOf("self") !== -1 && hasPaint(variant.strokes)) {
      push(strokes, "self", r1(variant.strokeWeight) + "|" + variant.strokeAlign);
      if (bag.weights.indexOf(r1(variant.strokeWeight)) === -1) bag.weights.push(r1(variant.strokeWeight));
    }
    if ((spec.effects || []).indexOf("self") !== -1) push(effects, "self", effectString(variant.effects));
    for (const child of variant.children || []) visit(child, false);
  }
  // set 프레임 자신도 센다 — 여기에 원시 fill 이 남아 있으면 라이브러리에 그대로 실린다.
  if (set.type === "COMPONENT_SET") countNode(set);

  const geometry = {};
  for (const key of order) {
    const bag = bags[key];
    const one = { slots: bag.slots, parts: bag.parts };
    for (const field of fields) one[field] = field === "strokeWeight" ? bag.weights : bag.root[field] || [];
    if (spec.childOrder) one.childOrder = bag.childOrder;
    one.overflowingParts = bag.overflowing;
    // 회전한 도형은 자기 상자 안에서 치우쳐 보인다. 지금 파일에는 어긋난 표식이 없고,
    // 생기면 verify-figma-parity 의 compareOpticalCentering 이 잡는다.
    one.offCenterMarks = [];
    geometry[key] = one;
  }

  const entry = {
    variantCount: variants.length,
    hasDescription: typeof set.description === "string" && set.description.trim().length > 0,
    properties: properties,
    binding: binding,
    geometry: geometry,
    strokes: strokes,
    effects: effects,
  };
  if (spec.outsideParts) entry.outsideParts = spec.outsideParts;
  result[name] = entry;
}
return result;
`;
}

function mergeInto(resultPath) {
  const readbackFile = resolve(repoRoot, READBACK_PATH);
  const readback = JSON.parse(readFileSync(readbackFile, "utf8"));
  const incomingRaw = JSON.parse(readFileSync(resolve(process.cwd(), resultPath), "utf8"));
  // `use_figma` 응답을 그대로 저장한 파일도 받는다 — 한 겹 감싸여 있을 수 있다.
  const incoming = incomingRaw.components ?? incomingRaw;
  const missing = Object.entries(incoming)
    .filter(([, value]) => value && value.$missing === true)
    .map(([name]) => name);
  if (missing.length > 0) {
    console.error(
      `[readback-emit] Figma 에서 찾지 못한 component set 이 있습니다: ${missing.join(", ")}`,
    );
    process.exit(1);
  }
  const merged = { ...(readback.components ?? {}), ...incoming };
  const sorted = {};
  for (const name of Object.keys(merged).sort()) sorted[name] = merged[name];
  readback.components = sorted;
  writeFileSync(readbackFile, `${JSON.stringify(readback, null, 2)}\n`);
  console.error(
    `[readback-emit] ${Object.keys(incoming).length}개를 병합했습니다: ${Object.keys(incoming)
      .sort()
      .join(", ")}`,
  );
}


/** 변수 부분 채취 — 이름을 지정한 변수의 행만 뜬다.
 *
 * 컬렉션 전체(191행)를 한 번에 뜨면 `use_figma` 응답 20KB 제한에서 잘린다. 토큰 하나를 고쳤을
 * 때 되읽기를 손으로 고치지 않으려면 **그 행만 다시 뜨는 길**이 있어야 한다. 행 형식은
 * `readback.json` 의 `rowFormat` 이 정한다:
 *   [figmaName, resolvedType, scopesCsv, [[modeName, aliasRef|null, rawValue|null], ...]] */
function variablesPluginSource(names) {
  return `// 생성물 — \`node scripts/figma-readback-emit.mjs --variables\` 가 낸 코드다. 손으로 고치지 않는다.
const NAMES = ${JSON.stringify(names)};
const cs = await figma.variables.getLocalVariableCollectionsAsync();
const all = await figma.variables.getLocalVariablesAsync();
const byId = new Map(all.map((v) => [v.id, v]));
const collById = new Map(cs.map((c) => [c.id, c.name]));
const r6 = (n) => Math.round(n * 1e6) / 1e6;
const out = {};
for (const v of all) {
  if (NAMES.indexOf(v.name) === -1) continue;
  const coll = cs.find((c) => c.id === v.variableCollectionId);
  const modeName = new Map(coll.modes.map((m) => [m.modeId, m.name]));
  const modes = [];
  for (const [modeId, raw] of Object.entries(v.valuesByMode)) {
    const name = modeName.get(modeId);
    if (name === undefined) continue;
    if (raw && raw.type === "VARIABLE_ALIAS") {
      const t = byId.get(raw.id);
      modes.push([name, collById.get(t.variableCollectionId) + "::" + t.name, null]);
    } else if (raw && typeof raw === "object" && "r" in raw) {
      modes.push([name, null, [r6(raw.r), r6(raw.g), r6(raw.b), r6(raw.a)]]);
    } else modes.push([name, null, raw]);
  }
  (out[coll.name] = out[coll.name] || []).push([v.name, v.resolvedType, v.scopes.join(","), modes]);
}
const missing = NAMES.filter((n) => !Object.values(out).some((rows) => rows.some((r) => r[0] === n)));
return { rows: out, missing };
`;
}

/** `--variables` 결과를 `readback.json` 의 컬렉션 행에 **이름으로 덮어쓴다.** 순서는 건드리지 않는다. */
function mergeVariables(resultPath) {
  const readbackFile = resolve(repoRoot, READBACK_PATH);
  const readback = JSON.parse(readFileSync(readbackFile, "utf8"));
  const incoming = JSON.parse(readFileSync(resolve(process.cwd(), resultPath), "utf8"));
  if (Array.isArray(incoming.missing) && incoming.missing.length > 0) {
    console.error(`[readback-emit] Figma 에서 찾지 못한 변수가 있습니다: ${incoming.missing.join(", ")}`);
    process.exit(1);
  }
  let touched = 0;
  let added = 0;
  // 새 행의 scopes 는 여기서 읽는다(위 삽입 분기의 주석 참고). 갱신 경로는 이 표를 보지 않는다.
  const proposalScopes = new Map();
  {
    const proposal = JSON.parse(
      readFileSync(resolve(repoRoot, "packages/tokens/generated/figma.tokens.json"), "utf8"),
    );
    for (const [collName, coll] of Object.entries(proposal.collections ?? {})) {
      for (const spec of Object.values(coll.variables ?? {})) {
        if (!spec.figmaName) continue;
        proposalScopes.set(`${collName}::${spec.figmaName}`, (spec.scopes ?? []).join(","));
      }
    }
  }
  for (const [collName, rows] of Object.entries(incoming.rows ?? {})) {
    const target = readback.collections?.[collName];
    if (target === undefined) {
      console.error(`[readback-emit] 되읽기에 없는 컬렉션입니다: ${collName}`);
      process.exit(1);
    }
    for (const row of rows) {
      const at = target.rows.findIndex((r) => r[0] === row[0]);
      if (at === -1) {
        /* **새 변수는 넣는다.** 예전에는 여기서 죽었다. 그러면 Figma 에 변수를 더한 날
           되읽기를 갱신할 길이 이 스크립트에 없어져 — 손으로 고치는 것 말고는 — 되읽기가
           영구히 낡고, parity 게이트가 낡은 사실을 성실하게 검증한다. 이 스크립트가 막으려던
           바로 그 상태다. 형식 문제의 처방은 삭제가 아니라 형식 수정이다(DS-D-0030).

           **이름은 이미 검증돼 있다** — 방출 코드가 Figma 에서 못 찾은 이름을 `missing` 으로
           내고 위에서 걸러 죽는다. 그러므로 여기 도달한 행은 Figma 에 실재한다.

           행 순서는 세 컬렉션 모두 figmaName 알파벳순이 불변식이라 그 자리에 꽂는다.

           **scopes 는 Figma 가 아니라 proposal 에서 가져온다.** 아래 갱신 경로가 기존 행의
           scopes 를 보존하는 이유와 같은 이유다 — 두 표기가 갈린다. 갈리는 방식이 둘이다:
           COLOR 는 어휘가 다르고(`ALL_FILLS` ↔ `FRAME_FILL,SHAPE_FILL,…`), FLOAT 는 어휘는
           같은데 **순서**가 다르다(Figma `WIDTH_HEIGHT,GAP` ↔ proposal `GAP,WIDTH_HEIGHT`).
           새 행에는 보존할 이전 값이 없으므로 Figma 표기를 그대로 쓰면 같은 컬렉션 안에서
           같은 축이 두 표기로 적힌다. proposal 을 읽으면 그 문제가 통째로 사라진다. */
        const proposed = proposalScopes.get(`${collName}::${row[0]}`);
        if (proposed === undefined) {
          /* Figma 에는 있는데 토큰 정본이 모르는 변수다. 되읽기에 넣으면 「정본에 없는 것」이
             정본 행세를 하게 되므로 멈춘다 — 지우든 정본에 더하든 사람이 정할 일이다. */
          console.error(
            `[readback-emit] 토큰 정본이 모르는 변수라 넣지 않습니다: ${collName}::${row[0]}\n` +
              "  packages/tokens/generated/figma.tokens.json 에 해당 figmaName 이 없습니다.",
          );
          process.exit(1);
        }
        const insertAt = target.rows.findIndex((r) => r[0] > row[0]);
        const placed = insertAt === -1 ? target.rows.length : insertAt;
        target.rows.splice(placed, 0, [row[0], row[1], proposed, row[3]]);
        added += 1;
        continue;
      }
      /* **scopes 문자열은 덮어쓰지 않는다.** 되읽기의 `capturedBy` 가 「scopes 는 Figma 쪽 저장
         형태라 proposal 값을 쓴다 — 게이트가 보는 축이 아니다」로 정해 두었다. Figma 는 같은
         변수를 `ALL_FILLS,STROKE_COLOR,EFFECT_COLOR` 로, proposal 은
         `FRAME_FILL,SHAPE_FILL,STROKE_COLOR,TEXT_FILL` 로 적는다 — 뜻은 같고 표기만 다르다.
         여기서 덮으면 게이트와 무관한 diff 가 매번 생긴다. 갈아 끼우는 것은 **모드 값**뿐이다. */
      const [, type, , modes] = row;
      if (target.rows[at][1] !== type) {
        console.error(`[readback-emit] resolvedType 이 바뀌었습니다: ${collName}::${row[0]} — ${target.rows[at][1]} → ${type}`);
        process.exit(1);
      }
      target.rows[at] = [target.rows[at][0], type, target.rows[at][2], modes];
      touched += 1;
    }
  }
  writeFileSync(readbackFile, `${JSON.stringify(readback, null, 2)}\n`);
  console.error(
    `[readback-emit] 변수 ${touched}개 행을 갱신하고 ${added}개를 새로 넣었습니다.`,
  );
}

if (argv.includes("--components")) {
  process.stdout.write(pluginSource(selectedSpec()));
} else if (argv.includes("--spec")) {
  process.stdout.write(`${JSON.stringify(selectedSpec(), null, 2)}\n`);
} else if (argv.includes("--variables")) {
  const only = argv[argv.indexOf("--only") + 1];
  if (!argv.includes("--only") || !only) usage("--variables 에는 --only <이름,이름> 이 필요합니다.");
  process.stdout.write(variablesPluginSource(only.split(",").map((n) => n.trim()).filter(Boolean)));
} else if (argv.includes("--merge-variables")) {
  const path = argv[argv.indexOf("--merge-variables") + 1];
  if (!path) usage("--merge-variables 뒤에 결과 파일 경로가 필요합니다.");
  mergeVariables(path);
} else if (argv.includes("--merge")) {
  const path = argv[argv.indexOf("--merge") + 1];
  if (!path) usage("--merge 뒤에 결과 파일 경로가 필요합니다.");
  mergeInto(path);
} else {
  usage(argv.length === 0 ? null : `알 수 없는 인자입니다: ${argv.join(" ")}`);
}
