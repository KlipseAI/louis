import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// **Figma Product inventory를 그리는 계획을 생성한다.**
//
// 그전까지 이 변환 규칙은 대화 안에만 있었다. 그래서 다시 그릴 때마다 합의한 것이 사라졌다 —
// 모달의 여백 분할, 아바타의 선언 크기, 텍스트 자동 크기, 중첩 오토레이아웃이 매번 유실됐고
// owner가 매번 다시 잡아 줘야 했다. 규칙을 코드로 옮겨 그 고리를 끊는다.
//
// 이 파일이 소유하는 규칙:
//
//   ① 크기는 **제품이 선언한 것만** 고정한다.
//      `[width:32px]` · `w-22` · `w-[260px]` · `w-[min(...)]` → 고정
//      `w-full` · `[width:100%]`                              → 부모가 준다(FILL)
//      선언 없음                                              → 내용이 정한다(HUG)
//      결과값(36.44 같은)을 고정하면 문구가 바뀔 때 깨진다.
//
//   ② 글자는 **언제나 자동**이다. 손으로 크기를 잡으면 글리프가 잘리고 리플로우가 죽는다.
//      block으로 잰 글자만 폭을 부모에게 받는다.
//
//   ③ 행간은 **비율**이다. 제품이 무단위 1.5/1.35로 선언하고 브레이크포인트에서 글자 크기만
//      바뀐다. px로 굳히면 그 계약이 끊긴다.
//
//   ④ 간격이 제각각이면 **중첩 오토레이아웃**으로 묶는다. spacer 프레임은 쓰지 않는다.
//
//   ⑤ 음수 마진으로 자식이 부모 안쪽보다 밖으로 나가면 **여백을 바깥·안쪽으로 나눈다.**
//      모달이 그렇다 — 카드 여백 16 + 액션 마진 -8을 카드 8 + 본문 묶음 8로 옮기면
//      결과가 같으면서 비대칭 여백도 오버플로도 없다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref } = resolveProductRef();
const outputPath = resolve(repoRoot, "figma/inventory-plan.json");
const checkOnly = process.argv.includes("--check");

const specimenFile = JSON.parse(readFileSync(resolve(repoRoot, "figma/product-specimens.json"), "utf8"));
const measured = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.variants.json"), "utf8"));

if (!existsSync(resolve(productRoot, ".git"))) {
  console.log("[figma-inventory] SKIPPED (제품 저장소 없음: " + productRoot + ").");
  process.exit(0);
}
const git = (args) =>
  execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
const commit = git(["rev-parse", ref]).trim();

// ── 제품이 선언한 크기 의도를 소스에서 읽는다 ──────────────────────────────
const sourceCache = new Map();
const source = (path) => {
  if (!sourceCache.has(path)) sourceCache.set(path, git(["show", commit + ":" + path]));
  return sourceCache.get(path);
};
const declCache = new Map();
const declarationOf = (file, part) => {
  const key = file + "|" + part;
  if (declCache.has(key)) return declCache.get(key);
  const body = source(file);
  const found = new RegExp("^\\s*(?:const\\s+)?" + part + "\\s*[:=]\\s*(\\[[\\s\\S]*?\\]\\.join|\"[^\"]*\")", "m").exec(body);
  const text = found ? found[1] : "";
  const has = (re) => re.test(text);
  const decl = {
    // 숫자 유틸리티(`w-22`)도 선언이다. 이 저장소는 spacing 1단위가 2px이라 w-22 = 44px이다.
    wFixed: has(/\[width:\s*(?:\d|min\(|calc\(|var\()/) || has(/\bw-\[(?:\d|min\(|calc\()/) || has(/\bw-\d+\b/),
    wFill: has(/\bw-full\b/) || has(/\[width:\s*100%\]/),
    hFixed: has(/\[height:\s*(?:\d|min\(|calc\(|var\()/) || has(/\bh-\[(?:\d|min\(|calc\()/) || has(/\bh-\d+\b/),
    hFill: has(/\bh-full\b/) || has(/\[height:\s*100%\]/),
    maxW: Number((/\[max-width:\s*(\d+(?:\.\d+)?)px\]/.exec(text) || [])[1] || 0),
    minW: Number((/\[min-width:\s*(\d+(?:\.\d+)?)px\]/.exec(text) || [])[1] || 0),
  };
  declCache.set(key, decl);
  return decl;
};

// ── 측정값 읽기 ─────────────────────────────────────────────────────────
const px = (v) => {
  const m = /^(-?[\d.]+)px$/.exec(v ?? "");
  return m ? Math.round(parseFloat(m[1]) * 100) / 100 : 0;
};
const round3 = (n) => Math.round(n * 1000) / 1000;
const colorOf = (v) => {
  const m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec((v ?? "").trim());
  if (!m) return null;
  return [round3(+m[1] / 255), round3(+m[2] / 255), round3(+m[3] / 255), m[4] === undefined ? 1 : round3(+m[4])];
};
const firstOuterShadow = (v) => {
  if (!v || v === "none") return null;
  const seg = v.split(/,(?![^(]*\))/).map((s) => s.trim()).find((s) => !s.includes("inset"));
  if (!seg) return null;
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/.exec(seg);
  if (!m) return null;
  return {
    color: [round3(+m[1] / 255), round3(+m[2] / 255), round3(+m[3] / 255), m[4] === undefined ? 1 : round3(+m[4])],
    x: +m[5], y: +m[6], blur: +m[7],
  };
};

const fileOfSpecimen = new Map(specimenFile.specimens.map((s) => [s.id, s.file]));

// 자식 위치를 실측 padding·margin·gap에서 계산한다. 추정하지 않는다.
// parentCtx: null(부모 없음) | {flex:true,row:true|false}
const layout = (node, file, specimenId, parentCtx) => {
  const V = node.values ?? {};
  const width = V.$width ?? 0;
  const height = V.$height ?? 0;
  const cssPad = [px(V.paddingTop), px(V.paddingRight), px(V.paddingBottom), px(V.paddingLeft)];
  const row = (V.display ?? "").includes("flex") && V.flexDirection === "row";
  const gap = V.rowGap && V.rowGap !== "normal" ? px(V.rowGap)
    : (V.columnGap && V.columnGap !== "normal" ? px(V.columnGap) : 0);
  const selfIsFlex = (V.display ?? "").includes("flex") || (V.display ?? "").includes("grid");
  const selfCtx = selfIsFlex ? { flex: true, row: V.flexDirection === "row" } : { flex: false, row: false };
  const children = (node.children ?? []).map((c) => layout(c, file, specimenId, selfCtx));

  // 자식 좌표: 여백 → 마진 → 크기 → 간격 순으로 쌓는다.
  let cursor = row ? cssPad[3] : cssPad[0];
  children.forEach((child, i) => {
    const raw = (node.children[i].values ?? {});
    const m = [px(raw.marginTop), px(raw.marginRight), px(raw.marginBottom), px(raw.marginLeft)];
    if (row) {
      cursor += m[3];
      child.x = round3(cursor); child.y = round3(cssPad[0] + m[0]);
      cursor += child.w + m[1] + (i < children.length - 1 ? gap : 0);
    } else {
      cursor += m[0];
      child.x = round3(cssPad[3] + m[3]); child.y = round3(cursor);
      cursor += child.h + m[2] + (i < children.length - 1 ? gap : 0);
    }
  });

  // ⑤ 음수 마진: 실제 바깥 여백은 첫 자식의 자리다. 나머지는 그만큼 안쪽으로 들어간다.
  const pad = [...cssPad];
  if (children.length) {
    const leadCross = Math.min(...children.map((c) => (row ? c.y : c.x)));
    const leadMain = Math.min(...children.map((c) => (row ? c.x : c.y)));
    const crossIdx = row ? 0 : 3;
    const mainIdx = row ? 3 : 0;
    if (leadCross < cssPad[crossIdx] - 0.02) pad[crossIdx] = Math.max(0, round3(leadCross));
    if (leadMain < cssPad[mainIdx] - 0.02) pad[mainIdx] = Math.max(0, round3(leadMain));
    const tailMain = (row ? width - Math.max(...children.map((c) => c.x + c.w)) : height - Math.max(...children.map((c) => c.y + c.h)));
    const tailIdx = row ? 1 : 2;
    if (tailMain < cssPad[tailIdx] - 0.02) pad[tailIdx] = Math.max(0, round3(tailMain));
  }
  const inset = cssPad.map((c, i) => Math.max(0, round3(c - pad[i])));

  // ④ 이웃 사이 빈틈. 모두 같으면 itemSpacing 하나, 아니면 큰 간격에서 잘라 중첩한다.
  const gaps = [];
  for (let i = 1; i < children.length; i++) {
    const a = children[i - 1], b = children[i];
    gaps.push(round3(row ? b.x - (a.x + a.w) : b.y - (a.y + a.h)));
  }
  const uniform = gaps.length === 0 || gaps.every((g) => Math.abs(g - gaps[0]) < 0.02);

  const decl = declarationOf(file, node.part);
  const empty = children.length === 0 && !node.text;
  const lineHeight = px(V.lineHeight);
  const fontSize = px(V.fontSize);
  const plain = !colorOf(V.backgroundColor)?.[3] && px(V.borderTopWidth) === 0 && px(V.borderTopLeftRadius) === 0;

  return {
    part: node.part,
    text: node.text ?? "",
    w: width, h: height, x: 0, y: 0,
    pad, inset,
    gap: uniform ? (gaps[0] ?? 0) : 0,
    gaps: uniform ? [] : gaps,
    dir: row ? "H" : "V",
    bg: colorOf(V.backgroundColor),
    fg: colorOf(V.color),
    radius: px(V.borderTopLeftRadius) || (V.borderTopLeftRadius === "50%" ? -1 : 0),
    borderWidth: px(V.borderTopWidth),
    borderColor: colorOf(V.borderTopColor),
    shadow: firstOuterShadow(V.boxShadow),
    fontSize,
    // ③ 행간은 비율로 옮긴다.
    lineHeightPct: fontSize ? Math.round((lineHeight / fontSize) * 1000) / 10 : 150,
    weight: parseInt(V.fontWeight ?? "400", 10),
    letterSpacing: px(V.letterSpacing),
    // ② 글자는 언제나 자동. block으로 잰 글자만 폭을 부모에게 받는다.
    isText: Boolean(node.text) && children.length === 0 && plain,
    textFill: (V.display ?? "") === "block",
    // ① 크기는 선언된 것만 고정한다.
    // 폭을 누가 정하는가.
    //   선언이 있으면 그것이 정한다.
    //   **flex/grid 자식**은 blockify돼도 폭이 내용에서 나온다 → 내용이 정한다.
    //   일반 흐름의 block은 부모 폭을 채운다 → 부모가 준다.
    //   inline 계열도 내용이 정한다.
    // 이 구분을 놓쳐 빈 상태 패널이 372에서 225로 줄고, 배지가 반대로 늘어났었다.
    // 폭을 누가 정하는가. 부모의 축이 가른다.
    //   flex **행**의 자식 → 폭이 주축이라 내용이 정한다(HUG). 배지·칩이 그렇다.
    //   flex **열**의 자식 → 폭이 교차축이고 stretch가 기본이라 부모가 준다(FILL). 빈 상태가 그렇다.
    //   일반 흐름의 block → 부모 폭을 채운다(FILL).
    //   inline 계열 → 내용이 정한다(HUG).
    // 이 구분을 놓쳐 빈 상태 패널이 372에서 225로 줄고 배지가 반대로 늘어났었다.
    wx: decl.wFixed ? "FIX"
      : (decl.wFill ? "FILL"
        : (empty ? "FIX"
          : ((parentCtx && parentCtx.flex && parentCtx.row) || (V.display ?? "").startsWith("inline") ? "HUG" : "FILL"))),
    hx: decl.hFixed ? "FIX" : (decl.hFill ? "FILL" : (empty ? "FIX" : "HUG")),
    minW: decl.minW || px(V.minWidth) || 0,
    minH: px(V.minHeight) || 0,
    maxW: decl.maxW || 0,
    children,
  };
};

const KIND_LABEL = {
  dialog: "모달", toast: "토스트", "icon-button": "아이콘 버튼", badge: "배지·칩",
  spinner: "스피너", avatar: "아바타", tooltip: "툴팁", "text-field": "텍스트 필드",
  slider: "슬라이더", "progress-bar": "진행 막대", checkbox: "체크박스",
  "empty-state": "빈 상태", "segmented-control": "세그먼트 컨트롤",
  "selectable-list-row": "선택 가능한 목록 행", skeleton: "스켈레톤",
  "menu-popover": "메뉴 팝오버", "project-card": "프로젝트 카드",
};

const byKind = new Map();
for (const spec of measured.specimens) {
  const file = fileOfSpecimen.get(spec.id);
  if (!file) continue;
  const meta0 = specimenFile.specimens.find((s) => s.id === spec.id);
  // 표본 루트의 부모는 host다. host를 선언했다면 그것은 크기를 바꾸는 부모이며
  // (scripts/verify-specimen-context.mjs가 그것만 host로 받는다) 사실상 flex다.
  const host = (meta0?.host ?? [])[0];
  // host가 flex 열이면 표본은 부모 폭으로 늘어난다. 행이면 내용이 폭을 정한다.
  let rootCtx = { flex: false, row: false };
  if (host) {
    const hostFile = typeof host === "string" ? file : host.file;
    const hostPart = typeof host === "string" ? host : host.part;
    const body = source(hostFile);
    const m = new RegExp("^\\s*(?:const\\s+)?" + hostPart + "\\s*[:=]\\s*(\\[[\\s\\S]*?\\]\\.join|\"[^\"]*\")", "m").exec(body);
    const text = m ? m[1] : "";
    const isCol = /\bflex-col\b/.test(text) || /flex-direction:\s*column/.test(text);
    rootCtx = { flex: true, row: !isCol };
  }
  const tree = layout(spec.tree, file, spec.id, rootCtx);
  const meta = specimenFile.specimens.find((s) => s.id === spec.id);
  const entry = {
    id: spec.id,
    label: spec.label,
    jsx: (spec.jsx ?? "").replace(/^apps\/web\/.*\//, ""),
    hosted: (meta?.host ?? []).length > 0,
    hostNone: meta?.hostNone ?? "",
    tree,
  };
  if (!byKind.has(spec.kind)) byKind.set(spec.kind, []);
  byKind.get(spec.kind).push(entry);
}

const sections = [...byKind.entries()]
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  .map(([kind, specimens]) => ({
    kind,
    label: KIND_LABEL[kind] ?? kind,
    count: specimens.length,
    specimens: specimens.sort((a, b) => a.id.localeCompare(b.id)),
  }));

const countNodes = (n) => 1 + n.children.reduce((s, c) => s + countNodes(c), 0);
const totalNodes = sections.reduce((s, sec) => s + sec.specimens.reduce((t, x) => t + countNodes(x.tree), 0), 0);


// ── Figma 실행 코드 ────────────────────────────────────────────────────────
// **렌더러도 여기서 만든다.** 계획만 코드로 옮기고 그리는 코드를 대화에 두었더니
// 배치마다 손으로 조정하다 또 어긋났다(세그먼트 컨트롤이 그랬다). 실행 코드까지 생성해
// 그대로 전달만 하게 한다.
const RENDERER = String.raw`
const page=figma.root.children.find(p=>p.name==="Product inventory");
await figma.setCurrentPageAsync(page);
let root=page.children.find(n=>n.name==="합치기 비교판 — 제품 경쟁 정의");
if(RESET){for(const s of [...root.children]) if(s.name!=="읽는 법") s.remove();}
const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
const addKids=(f,n)=>{const kids=n.c||[];
 const ins=n.ins||[0,0,0,0];
 if(!n.gs||!n.gs.length){
  if(ins[0]||ins[1]||ins[2]||ins[3]){
   const grp=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:P(n.gap)});
   grp.fills=[];grp.paddingTop=P(ins[0]);grp.paddingRight=P(ins[1]);grp.paddingBottom=P(ins[2]);grp.paddingLeft=P(ins[3]);
   f.appendChild(grp);for(const k of kids)place(grp,k);
   grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs){
  const grp=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
  grp.fills=[];grp.paddingRight=P(ins[1]);grp.paddingLeft=P(ins[3]);
  f.appendChild(grp);for(const k of seg)place(grp,k);
  grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";}};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=paint(n.bg);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 f.primaryAxisAlignItems="CENTER";f.counterAxisAlignItems="CENTER";f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 if(n.wx==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(n.hx==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 const s=figma.createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=figma.createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=figma.createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=figma.createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   const built=build(sp.t);stage.appendChild(built);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=figma.createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h+" · 폭 "+(sp.t.wx==="FIX"?"선언":sp.t.wx==="FILL"?"부모가 줌":"내용이 정함")+
   " · 높이 "+(sp.t.hx==="FIX"?"선언":sp.t.hx==="FILL"?"부모가 줌":"내용이 정함"),11,"r",0.62,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
return {count:created.length,어긋난것:drift.length,drift:drift.slice(0,12),그릴수없음:skipped};
`;

// 계획을 그리기 좋은 최소 형태로 줄인다.
const zero = (a) => a.every((x) => !x);
const compact = (n) => {
  const o = { p: n.part, w: n.w, h: n.h, wx: n.wx, hx: n.hx };
  if (!zero(n.pad)) o.pad = n.pad;
  if (!zero(n.inset)) o.ins = n.inset;
  if (n.gap) o.gap = n.gap;
  if (n.gaps.length) o.gs = n.gaps;
  if (n.dir === "H") o.H = 1;
  if (n.bg && n.bg[3]) o.bg = n.bg;
  if (n.radius) o.r = n.radius;
  if (n.borderWidth > 0) { o.bw = n.borderWidth; o.bc = n.borderColor; }
  if (n.shadow && n.shadow.blur > 0) o.sh = [n.shadow.color, n.shadow.x, n.shadow.y, n.shadow.blur];
  if (n.text) { o.t = n.text; o.fg = n.fg; o.fs = n.fontSize; o.fw = n.weight; if (n.letterSpacing) o.ls = n.letterSpacing; o.lp = n.lineHeightPct; }
  if (n.isText) o.T = 1;
  if (n.minW) o.mw = n.minW;
  if (n.minH) o.mh = n.minH;
  if (n.maxW) o.xw = n.maxW;
  if (n.children.length) o.c = n.children.map(compact);
  return o;
};
const drawSections = sections.map((s) => ({
  k: s.kind, L: s.label,
  sp: s.specimens.map((x) => ({ i: x.id, l: x.label, j: x.jsx, t: compact(x.tree) })),
}));
const chunks = [];
let bucket = [], size = 0;
for (const s of drawSections) {
  const n = JSON.stringify(s).length;
  if (size + n > 13000 && bucket.length) { chunks.push(bucket); bucket = []; size = 0; }
  bucket.push(s); size += n;
}
if (bucket.length) chunks.push(bucket);
const drawFiles = chunks.map((chunk, i) => ({
  absolute: resolve(repoRoot, "figma/inventory-draw." + (i + 1) + ".js"),
  expected:
    "// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.\n" +
    "// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.\n" +
    "const RESET=" + (i === 0 ? "true" : "false") + ";\n" +
    "const PLAN=" + JSON.stringify(chunk) + ";\n" +
    RENDERER,
}));

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/build-figma-inventory.mjs가 실측에서 만든다. 직접 수정하지 않는다.",
      $whyThisExists:
        "Figma 변환 규칙이 대화 안에만 있어서 다시 그릴 때마다 합의한 것이 사라졌다 — 모달의 여백 분할, 아바타의 선언 크기, 텍스트 자동 크기, 중첩 오토레이아웃이 매번 유실됐다. 규칙을 코드로 옮겨 그 고리를 끊는다.",
      $rules: [
        "크기는 제품이 선언한 것만 고정한다. 결과값을 고정하면 내용이 바뀔 때 깨진다.",
        "글자는 언제나 자동이다. block으로 잰 글자만 폭을 부모에게 받는다.",
        "행간은 비율이다. 제품이 무단위로 선언하고 브레이크포인트에서 글자 크기만 바뀐다.",
        "간격이 제각각이면 중첩 오토레이아웃으로 묶는다. spacer 프레임은 쓰지 않는다.",
        "음수 마진은 여백을 바깥·안쪽으로 나눠 만든다.",
      ],
      productRef: ref,
      productCommit: commit,
      sections,
    },
    null,
    2,
  ) + "\n";

if (checkOnly) {
  let current = "";
  try {
    current = readFileSync(outputPath, "utf8");
  } catch {
    console.error("[figma-inventory] 생성물이 없습니다: figma/inventory-plan.json");
    process.exit(1);
  }
  if (current !== payload) {
    console.error("[figma-inventory] 계획이 실측과 다릅니다. `node scripts/build-figma-inventory.mjs`로 다시 만드세요.");
    process.exit(1);
  }
  for (const f of drawFiles) {
    let now = "";
    try { now = readFileSync(f.absolute, "utf8"); } catch { now = ""; }
    if (now !== f.expected) {
      console.error("[figma-inventory] 그리기 코드가 계획과 다릅니다: " + f.absolute.split("/").pop());
      process.exit(1);
    }
  }
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }, ...drawFiles]);
}

console.log(
  "[figma-inventory] " + (checkOnly ? "checked" : "built") + " @ " + commit.slice(0, 8) +
    ": 종류 " + sections.length + " · 표본 " + sections.reduce((s, x) => s + x.count, 0) +
    " · 노드 " + totalNodes +
    " · 폭 선언고정 " + [...declCache.values()].filter((d) => d.wFixed).length +
    " · 폭 부모지정 " + [...declCache.values()].filter((d) => d.wFill).length +
    " · 그리기 코드 " + drawFiles.length + "개",
);
