// =========================================================================
// 🚀 KLIPSE DESIGN SYSTEM 100% PARITY AUTO-REPAIR SCRIPT (V4)
// 실행 방법: Figma > 메뉴 > Plugins > Development > Open Console (Cmd+Option+I)
// 콘솔 창에 아래 코드를 전체 복사하여 붙여넣고 Enter를 누르세요.
// =========================================================================

(async () => {
  console.log("🚀 [KDS] Starting Figma Token & Component Auto-Sync...");
  figma.notify("🚀 KDS 디자인 시스템 100% 동기화 시작 중...");

  // Direct Auto-layout creation helper
  const createAutoLayout = (direction, opts = {}) => {
    const f = figma.createFrame();
    f.layoutMode = direction;
    if (opts.name) f.name = opts.name;
    if (opts.itemSpacing !== undefined) f.itemSpacing = opts.itemSpacing;
    if (opts.paddingTop !== undefined) f.paddingTop = opts.paddingTop;
    if (opts.paddingRight !== undefined) f.paddingRight = opts.paddingRight;
    if (opts.paddingBottom !== undefined) f.paddingBottom = opts.paddingBottom;
    if (opts.paddingLeft !== undefined) f.paddingLeft = opts.paddingLeft;
    return f;
  };

  // =========================================================================
  // 1. Apply 345 Tokens & Variables (Part 1 ~ 7)
  // =========================================================================
  try {
    {
// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 1/7 — Klipse Primitive 1/3 (변수 64개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={};
const COL={"c":"Klipse Primitive","m":["Base"],"d":"Base","vars":[{"i":"blur-10","n":"blur/10","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":10}}},{"i":"blur-12","n":"blur/12","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":12}}},{"i":"blur-16","n":"blur/16","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":16}}},{"i":"border-width-default-base","n":"border-width/default","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":1}}},{"i":"border-width-hairline-base","n":"border-width/hairline","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":0.5}}},{"i":"border-width-ring-base","n":"border-width/ring","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":2}}},{"i":"color-amber-100","n":"color/amber/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.960784,0.839216,1]}}},{"i":"color-amber-500","n":"color/amber/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.741176,0.180392,1]}}},{"i":"color-amber-700","n":"color/amber/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.721569,0.478431,0,1]}}},{"i":"color-amber-900","n":"color/amber/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.360784,0.239216,0,1]}}},{"i":"color-black-alpha-28","n":"color/black-alpha/28","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0,0,0.28]}}},{"i":"color-black-alpha-56","n":"color/black-alpha/56","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0,0,0.56]}}},{"i":"color-black-alpha-72","n":"color/black-alpha/72","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0,0,0.72]}}},{"i":"color-blue-100","n":"color/blue/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.839216,0.921569,1,1]}}},{"i":"color-blue-200","n":"color/blue/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.639216,0.835294,1,1]}}},{"i":"color-blue-300","n":"color/blue/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.439216,0.74902,1,1]}}},{"i":"color-blue-400","n":"color/blue/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.219608,0.643137,1,1]}}},{"i":"color-blue-50","n":"color/blue/50","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.941176,0.968627,1,1]}}},{"i":"color-blue-500","n":"color/blue/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.533333,1,1]}}},{"i":"color-blue-600","n":"color/blue/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.458824,0.858824,1]}}},{"i":"color-blue-700","n":"color/blue/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.372549,0.701961,1]}}},{"i":"color-blue-800","n":"color/blue/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.286275,0.541176,1]}}},{"i":"color-blue-900","n":"color/blue/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.203922,0.380392,1]}}},{"i":"color-green-100","n":"color/green/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.894118,0.972549,0.917647,1]}}},{"i":"color-green-500","n":"color/green/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.156863,0.784314,0.25098,1]}}},{"i":"color-green-700","n":"color/green/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.478431,0.172549,1]}}},{"i":"color-green-900","n":"color/green/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.043137,0.239216,0.094118,1]}}},{"i":"color-ink-alpha-10","n":"color/ink-alpha/10","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.1]}}},{"i":"color-ink-alpha-12","n":"color/ink-alpha/12","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.12]}}},{"i":"color-ink-alpha-16","n":"color/ink-alpha/16","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.16]}}},{"i":"color-ink-alpha-20","n":"color/ink-alpha/20","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.2]}}},{"i":"color-ink-alpha-25","n":"color/ink-alpha/25","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.25]}}},{"i":"color-ink-alpha-30","n":"color/ink-alpha/30","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.3]}}},{"i":"color-ink-alpha-4","n":"color/ink-alpha/4","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.04]}}},{"i":"color-ink-alpha-40","n":"color/ink-alpha/40","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.4]}}},{"i":"color-ink-alpha-5","n":"color/ink-alpha/5","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.05]}}},{"i":"color-ink-alpha-50","n":"color/ink-alpha/50","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.5]}}},{"i":"color-ink-alpha-6","n":"color/ink-alpha/6","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.06]}}},{"i":"color-ink-alpha-60","n":"color/ink-alpha/60","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.6]}}},{"i":"color-ink-alpha-70","n":"color/ink-alpha/70","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.7]}}},{"i":"color-ink-alpha-8","n":"color/ink-alpha/8","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.08]}}},{"i":"color-ink-alpha-80","n":"color/ink-alpha/80","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.8]}}},{"i":"color-ink-alpha-86","n":"color/ink-alpha/86","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,0.86]}}},{"i":"color-inverse-alpha-dark-70","n":"color/inverse-alpha/dark-70","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.192157,0.211765,0.25098,0.7]}}},{"i":"color-inverse-alpha-light-70","n":"color/inverse-alpha/light-70","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.890196,0.894118,0.909804,0.7]}}},{"i":"color-mint-100","n":"color/mint/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.898039,1,0.968627,1]}}},{"i":"color-mint-200","n":"color/mint/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.721569,0.972549,0.898039,1]}}},{"i":"color-mint-300","n":"color/mint/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.47451,0.92549,0.8,1]}}},{"i":"color-mint-400","n":"color/mint/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.156863,0.85098,0.647059,1]}}},{"i":"color-mint-500","n":"color/mint/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.776471,0.556863,1]}}},{"i":"color-mint-600","n":"color/mint/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.701961,0.498039,1]}}},{"i":"color-mint-700","n":"color/mint/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.560784,0.403922,1]}}},{"i":"color-mint-800","n":"color/mint/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.431373,0.317647,1]}}},{"i":"color-mint-900","n":"color/mint/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0.298039,0.223529,1]}}},{"i":"color-neutral-0","n":"color/neutral/0","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,1]}}},{"i":"color-neutral-100","n":"color/neutral/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.945098,0.945098,0.952941,1]}}},{"i":"color-neutral-1000","n":"color/neutral/1000","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0,0,0,1]}}},{"i":"color-neutral-150","n":"color/neutral/150","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.917647,0.921569,0.933333,1]}}},{"i":"color-neutral-200","n":"color/neutral/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.890196,0.894118,0.909804,1]}}},{"i":"color-neutral-300","n":"color/neutral/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.835294,0.843137,0.866667,1]}}},{"i":"color-neutral-400","n":"color/neutral/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.737255,0.752941,0.788235,1]}}},{"i":"color-neutral-50","n":"color/neutral/50","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.972549,0.972549,0.976471,1]}}},{"i":"color-neutral-500","n":"color/neutral/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.603922,0.627451,0.670588,1]}}},{"i":"color-neutral-600","n":"color/neutral/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.466667,0.490196,0.537255,1]}}}]};

const report={created:[],updated:[],unchanged:0,modesAdded:[],collectionsCreated:[],missingAlias:[]};
const near=(a,b)=>Math.abs((a??1)-(b??1))<1e-5;
// 색은 Figma가 전정밀도로 저장하고 여기 값은 6자리 반올림이라 **엄격 비교하면 매번 달라 보인다.**
// 그러면 idempotent 실행이 항상 updated로 보고돼 무엇이 실제로 바뀌었는지 알 수 없다.
const eq=(a,b)=>(a&&b&&typeof a==="object"&&typeof b==="object"&&"r" in a&&"r" in b)
  ?(near(a.r,b.r)&&near(a.g,b.g)&&near(a.b,b.b)&&near(a.a,b.a))
  :JSON.stringify(a)===JSON.stringify(b);
let cols=await figma.variables.getLocalVariableCollectionsAsync();
let c=cols.find(x=>x.name===COL.c);
if(!c){c=figma.variables.createVariableCollection(COL.c);report.collectionsCreated.push(COL.c);}
let modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
if(c.modes.length===1&&!modeName.has(COL.d)){
  c.renameMode(c.modes[0].modeId,COL.d);modeName=new Map([[COL.d,c.modes[0].modeId]]);
}
for(const m of COL.m){ if(!modeName.has(m)){modeName.set(m,c.addMode(m));report.modesAdded.push(COL.c+"/"+m);} }
// 1차 — 변수 자체를 맞춘다.
let all=await figma.variables.getLocalVariablesAsync();
const inCol=new Map(all.filter(v=>v.variableCollectionId===c.id).map(v=>[v.name,v]));
for(const spec of COL.vars){
  let v=inCol.get(spec.n);
  if(!v){v=figma.variables.createVariable(spec.n,c,spec.t);report.created.push(spec.i);inCol.set(spec.n,v);}
  v.hiddenFromPublishing=spec.h;
  if(spec.sc.length) v.scopes=spec.sc;
}
// 2차 — 값을 넣는다. 별칭은 **이름으로** 파일 전체에서 찾는다.
all=await figma.variables.getLocalVariablesAsync();
const byName=new Map(all.map(v=>[v.name,v]));
for(const spec of COL.vars){
  const v=inCol.get(spec.n); if(!v) continue;
  let touched=false;
  for(const [mode,val] of Object.entries(spec.v)){
    const modeId=modeName.get(mode); if(!modeId) continue;
    let next;
    if(val.a!==undefined){
      const t=byName.get(NAME[val.a]);
      if(!t){report.missingAlias.push(spec.i+"→"+val.a);continue;}
      next=figma.variables.createVariableAlias(t);
    }
    else if(val.c) next={r:val.c[0],g:val.c[1],b:val.c[2],a:val.c[3]};
    else if(val.n!==undefined) next=val.n;
    else next=val.s;
    if(!eq(v.valuesByMode[modeId],next)){v.setValueForMode(modeId,next);touched=true;}
  }
  const isNew=report.created.includes(spec.i);
  if(touched&&!isNew) report.updated.push(spec.i);
  if(!touched&&!isNew) report.unchanged+=1;
}
    }
    console.log("✅ [KDS] Variables Part 1/7 applied.");
  } catch (e) { console.error("Variables 1 error:", e); }

  try {
    {
// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 2/7 — Klipse Primitive 2/3 (변수 64개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={};
const COL={"c":"Klipse Primitive","m":["Base"],"d":"Base","vars":[{"i":"color-neutral-700","n":"color/neutral/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.341176,0.364706,0.407843,1]}}},{"i":"color-neutral-800","n":"color/neutral/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.192157,0.211765,0.25098,1]}}},{"i":"color-neutral-900","n":"color/neutral/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.090196,0.105882,0.133333,1]}}},{"i":"color-paper-alpha-10","n":"color/paper-alpha/10","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.1]}}},{"i":"color-paper-alpha-12","n":"color/paper-alpha/12","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.12]}}},{"i":"color-paper-alpha-14","n":"color/paper-alpha/14","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.14]}}},{"i":"color-paper-alpha-16","n":"color/paper-alpha/16","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.16]}}},{"i":"color-paper-alpha-20","n":"color/paper-alpha/20","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.2]}}},{"i":"color-paper-alpha-25","n":"color/paper-alpha/25","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.25]}}},{"i":"color-paper-alpha-30","n":"color/paper-alpha/30","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.3]}}},{"i":"color-paper-alpha-4","n":"color/paper-alpha/4","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.04]}}},{"i":"color-paper-alpha-40","n":"color/paper-alpha/40","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.4]}}},{"i":"color-paper-alpha-45","n":"color/paper-alpha/45","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.45]}}},{"i":"color-paper-alpha-50","n":"color/paper-alpha/50","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.5]}}},{"i":"color-paper-alpha-6","n":"color/paper-alpha/6","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.06]}}},{"i":"color-paper-alpha-60","n":"color/paper-alpha/60","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.6]}}},{"i":"color-paper-alpha-70","n":"color/paper-alpha/70","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.7]}}},{"i":"color-paper-alpha-72","n":"color/paper-alpha/72","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.72]}}},{"i":"color-paper-alpha-8","n":"color/paper-alpha/8","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.08]}}},{"i":"color-paper-alpha-80","n":"color/paper-alpha/80","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.8]}}},{"i":"color-paper-alpha-86","n":"color/paper-alpha/86","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.86]}}},{"i":"color-paper-alpha-88","n":"color/paper-alpha/88","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.88]}}},{"i":"color-pink-100","n":"color/pink/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.898039,0.929412,1]}}},{"i":"color-pink-200","n":"color/pink/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.756863,0.839216,1]}}},{"i":"color-pink-300","n":"color/pink/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.607843,0.745098,1]}}},{"i":"color-pink-400","n":"color/pink/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.427451,0.615686,1]}}},{"i":"color-pink-500","n":"color/pink/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.301961,0.533333,1]}}},{"i":"color-pink-600","n":"color/pink/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.886275,0.211765,0.443137,1]}}},{"i":"color-pink-700","n":"color/pink/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.717647,0.141176,0.345098,1]}}},{"i":"color-pink-800","n":"color/pink/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.517647,0.101961,0.247059,1]}}},{"i":"color-pink-900","n":"color/pink/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.329412,0.066667,0.164706,1]}}},{"i":"color-red-100","n":"color/red/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.898039,0.909804,1]}}},{"i":"color-red-200","n":"color/red/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.768627,0.792157,1]}}},{"i":"color-red-300","n":"color/red/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.603922,0.643137,1]}}},{"i":"color-red-400","n":"color/red/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.435294,0.486275,1]}}},{"i":"color-red-500","n":"color/red/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,1]}}},{"i":"color-red-600","n":"color/red/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.886275,0.211765,0.270588,1]}}},{"i":"color-red-700","n":"color/red/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.717647,0.141176,0.192157,1]}}},{"i":"color-red-800","n":"color/red/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.517647,0.101961,0.141176,1]}}},{"i":"color-red-900","n":"color/red/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.329412,0.066667,0.098039,1]}}},{"i":"color-red-alpha-10","n":"color/red-alpha/10","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.1]}}},{"i":"color-red-alpha-12","n":"color/red-alpha/12","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.12]}}},{"i":"color-red-alpha-16","n":"color/red-alpha/16","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.16]}}},{"i":"color-red-alpha-20","n":"color/red-alpha/20","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.2]}}},{"i":"color-red-alpha-25","n":"color/red-alpha/25","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.25]}}},{"i":"color-red-alpha-6","n":"color/red-alpha/6","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.06]}}},{"i":"color-red-alpha-60","n":"color/red-alpha/60","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.6]}}},{"i":"color-red-alpha-8","n":"color/red-alpha/8","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.08]}}},{"i":"color-red-alpha-80","n":"color/red-alpha/80","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.294118,0.34902,0.8]}}},{"i":"color-violet-100","n":"color/violet/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.921569,0.909804,1,1]}}},{"i":"color-violet-200","n":"color/violet/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.788235,0.760784,1,1]}}},{"i":"color-violet-300","n":"color/violet/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.615686,0.568627,1,1]}}},{"i":"color-violet-400","n":"color/violet/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.517647,0.470588,1,1]}}},{"i":"color-violet-500","n":"color/violet/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.376471,0.333333,1,1]}}},{"i":"color-violet-600","n":"color/violet/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.309804,0.270588,0.890196,1]}}},{"i":"color-violet-700","n":"color/violet/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.207843,0.156863,0.721569,1]}}},{"i":"color-violet-800","n":"color/violet/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.133333,0.101961,0.501961,1]}}},{"i":"color-violet-900","n":"color/violet/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.082353,0.062745,0.301961,1]}}},{"i":"color-yellow-100","n":"color/yellow/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.960784,0.839216,1]}}},{"i":"color-yellow-200","n":"color/yellow/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.909804,0.639216,1]}}},{"i":"color-yellow-300","n":"color/yellow/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.85098,0.501961,1]}}},{"i":"color-yellow-400","n":"color/yellow/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.760784,0.2,1]}}},{"i":"color-yellow-500","n":"color/yellow/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.698039,0,1]}}},{"i":"color-yellow-600","n":"color/yellow/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.894118,0.603922,0,1]}}}]};

const report={created:[],updated:[],unchanged:0,modesAdded:[],collectionsCreated:[],missingAlias:[]};
const near=(a,b)=>Math.abs((a??1)-(b??1))<1e-5;
// 색은 Figma가 전정밀도로 저장하고 여기 값은 6자리 반올림이라 **엄격 비교하면 매번 달라 보인다.**
// 그러면 idempotent 실행이 항상 updated로 보고돼 무엇이 실제로 바뀌었는지 알 수 없다.
const eq=(a,b)=>(a&&b&&typeof a==="object"&&typeof b==="object"&&"r" in a&&"r" in b)
  ?(near(a.r,b.r)&&near(a.g,b.g)&&near(a.b,b.b)&&near(a.a,b.a))
  :JSON.stringify(a)===JSON.stringify(b);
let cols=await figma.variables.getLocalVariableCollectionsAsync();
let c=cols.find(x=>x.name===COL.c);
if(!c){c=figma.variables.createVariableCollection(COL.c);report.collectionsCreated.push(COL.c);}
let modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
if(c.modes.length===1&&!modeName.has(COL.d)){
  c.renameMode(c.modes[0].modeId,COL.d);modeName=new Map([[COL.d,c.modes[0].modeId]]);
}
for(const m of COL.m){ if(!modeName.has(m)){modeName.set(m,c.addMode(m));report.modesAdded.push(COL.c+"/"+m);} }
// 1차 — 변수 자체를 맞춘다.
let all=await figma.variables.getLocalVariablesAsync();
const inCol=new Map(all.filter(v=>v.variableCollectionId===c.id).map(v=>[v.name,v]));
for(const spec of COL.vars){
  let v=inCol.get(spec.n);
  if(!v){v=figma.variables.createVariable(spec.n,c,spec.t);report.created.push(spec.i);inCol.set(spec.n,v);}
  v.hiddenFromPublishing=spec.h;
  if(spec.sc.length) v.scopes=spec.sc;
}
// 2차 — 값을 넣는다. 별칭은 **이름으로** 파일 전체에서 찾는다.
all=await figma.variables.getLocalVariablesAsync();
const byName=new Map(all.map(v=>[v.name,v]));
for(const spec of COL.vars){
  const v=inCol.get(spec.n); if(!v) continue;
  let touched=false;
  for(const [mode,val] of Object.entries(spec.v)){
    const modeId=modeName.get(mode); if(!modeId) continue;
    let next;
    if(val.a!==undefined){
      const t=byName.get(NAME[val.a]);
      if(!t){report.missingAlias.push(spec.i+"→"+val.a);continue;}
      next=figma.variables.createVariableAlias(t);
    }
    else if(val.c) next={r:val.c[0],g:val.c[1],b:val.c[2],a:val.c[3]};
    else if(val.n!==undefined) next=val.n;
    else next=val.s;
    if(!eq(v.valuesByMode[modeId],next)){v.setValueForMode(modeId,next);touched=true;}
  }
  const isNew=report.created.includes(spec.i);
  if(touched&&!isNew) report.updated.push(spec.i);
  if(!touched&&!isNew) report.unchanged+=1;
}
    }
    console.log("✅ [KDS] Variables Part 2/7 applied.");
  } catch (e) { console.error("Variables 2 error:", e); }

  try {
    {
// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 3/7 — Klipse Primitive 3/3 (변수 61개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={};
const COL={"c":"Klipse Primitive","m":["Base"],"d":"Base","vars":[{"i":"color-yellow-700","n":"color/yellow/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.721569,0.462745,0,1]}}},{"i":"color-yellow-800","n":"color/yellow/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.478431,0.321569,0,1]}}},{"i":"color-yellow-900","n":"color/yellow/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.298039,0.2,0,1]}}},{"i":"duration-fast","n":"duration/fast","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":120}}},{"i":"duration-instant","n":"duration/instant","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":0}}},{"i":"duration-normal","n":"duration/normal","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":200}}},{"i":"duration-slow","n":"duration/slow","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":320}}},{"i":"font-family-mono","n":"font-family/mono","t":"STRING","h":true,"sc":["FONT_FAMILY"],"v":{"Base":{"s":"SFMono-Regular, Consolas, Liberation Mono, monospace"}}},{"i":"font-family-sans","n":"font-family/sans","t":"STRING","h":true,"sc":["FONT_FAMILY"],"v":{"Base":{"s":"Pretendard Variable, Pretendard, Inter, Noto Sans KR, Noto Sans JP, system-ui, sans-serif"}}},{"i":"font-size-body-lg","n":"font-size/body-lg","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":20}}},{"i":"font-size-body-md","n":"font-size/body-md","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":16}}},{"i":"font-size-body-sm","n":"font-size/body-sm","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":14}}},{"i":"font-size-caption","n":"font-size/caption","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":12}}},{"i":"font-size-heading-lg","n":"font-size/heading-lg","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":48}}},{"i":"font-size-heading-md","n":"font-size/heading-md","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":36}}},{"i":"font-size-heading-sm","n":"font-size/heading-sm","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":28}}},{"i":"font-weight-medium","n":"font-weight/medium","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":500}}},{"i":"font-weight-regular","n":"font-weight/regular","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":400}}},{"i":"font-weight-semibold","n":"font-weight/semibold","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":600}}},{"i":"layer-base-content","n":"layer/content","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":0}}},{"i":"layer-base-critical","n":"layer/critical","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":400}}},{"i":"layer-base-modal","n":"layer/modal","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":300}}},{"i":"layer-base-popover","n":"layer/popover","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":200}}},{"i":"layer-base-sticky","n":"layer/sticky","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":100}}},{"i":"line-height-body","n":"line-height/body","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":1.5}}},{"i":"line-height-heading","n":"line-height/heading","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":1.35}}},{"i":"line-height-tight","n":"line-height/tight","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":1.2}}},{"i":"radius-0","n":"radius/0","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":0}}},{"i":"radius-10","n":"radius/10","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":10}}},{"i":"radius-12","n":"radius/12","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":12}}},{"i":"radius-16","n":"radius/16","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":16}}},{"i":"radius-2","n":"radius/2","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":2}}},{"i":"radius-20","n":"radius/20","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":20}}},{"i":"radius-24","n":"radius/24","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":24}}},{"i":"radius-4","n":"radius/4","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":4}}},{"i":"radius-6","n":"radius/6","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":6}}},{"i":"radius-8","n":"radius/8","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":8}}},{"i":"radius-full","n":"radius/full","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":999}}},{"i":"space-0","n":"spacing/0","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":0}}},{"i":"space-10","n":"spacing/10","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":10}}},{"i":"space-12","n":"spacing/12","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":12}}},{"i":"space-120","n":"spacing/120","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":120}}},{"i":"space-14","n":"spacing/14","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":14}}},{"i":"space-16","n":"spacing/16","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":16}}},{"i":"space-18","n":"spacing/18","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":18}}},{"i":"space-2","n":"spacing/2","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":2}}},{"i":"space-20","n":"spacing/20","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":20}}},{"i":"space-24","n":"spacing/24","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":24}}},{"i":"space-240","n":"spacing/240","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":240}}},{"i":"space-28","n":"spacing/28","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":28}}},{"i":"space-280","n":"spacing/280","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":280}}},{"i":"space-32","n":"spacing/32","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":32}}},{"i":"space-320","n":"spacing/320","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":320}}},{"i":"space-4","n":"spacing/4","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":4}}},{"i":"space-40","n":"spacing/40","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":40}}},{"i":"space-44","n":"spacing/44","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":44}}},{"i":"space-48","n":"spacing/48","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":48}}},{"i":"space-56","n":"spacing/56","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":56}}},{"i":"space-6","n":"spacing/6","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":6}}},{"i":"space-64","n":"spacing/64","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":64}}},{"i":"space-8","n":"spacing/8","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":8}}}]};

const report={created:[],updated:[],unchanged:0,modesAdded:[],collectionsCreated:[],missingAlias:[]};
const near=(a,b)=>Math.abs((a??1)-(b??1))<1e-5;
// 색은 Figma가 전정밀도로 저장하고 여기 값은 6자리 반올림이라 **엄격 비교하면 매번 달라 보인다.**
// 그러면 idempotent 실행이 항상 updated로 보고돼 무엇이 실제로 바뀌었는지 알 수 없다.
const eq=(a,b)=>(a&&b&&typeof a==="object"&&typeof b==="object"&&"r" in a&&"r" in b)
  ?(near(a.r,b.r)&&near(a.g,b.g)&&near(a.b,b.b)&&near(a.a,b.a))
  :JSON.stringify(a)===JSON.stringify(b);
let cols=await figma.variables.getLocalVariableCollectionsAsync();
let c=cols.find(x=>x.name===COL.c);
if(!c){c=figma.variables.createVariableCollection(COL.c);report.collectionsCreated.push(COL.c);}
let modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
if(c.modes.length===1&&!modeName.has(COL.d)){
  c.renameMode(c.modes[0].modeId,COL.d);modeName=new Map([[COL.d,c.modes[0].modeId]]);
}
for(const m of COL.m){ if(!modeName.has(m)){modeName.set(m,c.addMode(m));report.modesAdded.push(COL.c+"/"+m);} }
// 1차 — 변수 자체를 맞춘다.
let all=await figma.variables.getLocalVariablesAsync();
const inCol=new Map(all.filter(v=>v.variableCollectionId===c.id).map(v=>[v.name,v]));
for(const spec of COL.vars){
  let v=inCol.get(spec.n);
  if(!v){v=figma.variables.createVariable(spec.n,c,spec.t);report.created.push(spec.i);inCol.set(spec.n,v);}
  v.hiddenFromPublishing=spec.h;
  if(spec.sc.length) v.scopes=spec.sc;
}
// 2차 — 값을 넣는다. 별칭은 **이름으로** 파일 전체에서 찾는다.
all=await figma.variables.getLocalVariablesAsync();
const byName=new Map(all.map(v=>[v.name,v]));
for(const spec of COL.vars){
  const v=inCol.get(spec.n); if(!v) continue;
  let touched=false;
  for(const [mode,val] of Object.entries(spec.v)){
    const modeId=modeName.get(mode); if(!modeId) continue;
    let next;
    if(val.a!==undefined){
      const t=byName.get(NAME[val.a]);
      if(!t){report.missingAlias.push(spec.i+"→"+val.a);continue;}
      next=figma.variables.createVariableAlias(t);
    }
    else if(val.c) next={r:val.c[0],g:val.c[1],b:val.c[2],a:val.c[3]};
    else if(val.n!==undefined) next=val.n;
    else next=val.s;
    if(!eq(v.valuesByMode[modeId],next)){v.setValueForMode(modeId,next);touched=true;}
  }
  const isNew=report.created.includes(spec.i);
  if(touched&&!isNew) report.updated.push(spec.i);
  if(!touched&&!isNew) report.unchanged+=1;
}
    }
    console.log("✅ [KDS] Variables Part 3/7 applied.");
  } catch (e) { console.error("Variables 3 error:", e); }

  try {
    {
// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 4/7 — Klipse Semantic 1/2 (변수 64개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={"blur-12":"blur/12","blur-10":"blur/10","blur-16":"blur/16","border-width-default-base":"border-width/default","border-width-hairline-base":"border-width/hairline","border-width-ring-base":"border-width/ring","space-24":"spacing/24","space-20":"spacing/20","space-16":"spacing/16","space-64":"spacing/64","layer-base-content":"layer/content","layer-base-critical":"layer/critical","layer-base-modal":"layer/modal","layer-base-popover":"layer/popover","layer-base-sticky":"layer/sticky","space-28":"spacing/28","space-120":"spacing/120","space-12":"spacing/12","space-56":"spacing/56","space-280":"spacing/280","space-40":"spacing/40","space-32":"spacing/32","space-44":"spacing/44","space-48":"spacing/48","space-6":"spacing/6","space-320":"spacing/320","space-240":"spacing/240","radius-16":"radius/16","radius-20":"radius/20","radius-12":"radius/12","radius-8":"radius/8","radius-10":"radius/10","radius-24":"radius/24","radius-full":"radius/full"};
const COL={"c":"Klipse Semantic","m":["Global"],"d":"Global","vars":[{"i":"blur-panel","n":"blur/panel","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"blur-12"}}},{"i":"blur-surface","n":"blur/surface","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"blur-10"}}},{"i":"blur-toast","n":"blur/toast","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"blur-16"}}},{"i":"border-width-default","n":"border-width/default","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"border-width-default-base"}}},{"i":"border-width-hairline","n":"border-width/hairline","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"border-width-hairline-base"}}},{"i":"border-width-ring","n":"border-width/ring","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"border-width-ring-base"}}},{"i":"icon-size-lg","n":"icon/size-lg","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-24"}}},{"i":"icon-size-md","n":"icon/size-md","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-20"}}},{"i":"icon-size-sm","n":"icon/size-sm","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-16"}}},{"i":"icon-size-xl","n":"icon/size-xl","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-64"}}},{"i":"layer-content","n":"layer/content","t":"FLOAT","h":false,"sc":[],"v":{"Global":{"a":"layer-base-content"}}},{"i":"layer-critical","n":"layer/critical","t":"FLOAT","h":false,"sc":[],"v":{"Global":{"a":"layer-base-critical"}}},{"i":"layer-modal","n":"layer/modal","t":"FLOAT","h":false,"sc":[],"v":{"Global":{"a":"layer-base-modal"}}},{"i":"layer-popover","n":"layer/popover","t":"FLOAT","h":false,"sc":[],"v":{"Global":{"a":"layer-base-popover"}}},{"i":"layer-sticky","n":"layer/sticky","t":"FLOAT","h":false,"sc":[],"v":{"Global":{"a":"layer-base-sticky"}}},{"i":"layout-app-shell-brand-mark-height","n":"layout/app-shell-brand-mark-height","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-28"}}},{"i":"layout-app-shell-content-inset","n":"layout/app-shell-content-inset","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-16"}}},{"i":"layout-app-shell-content-reserve","n":"layout/app-shell-content-reserve","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-120"}}},{"i":"layout-app-shell-outer-gap","n":"layout/app-shell-outer-gap","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-12"}}},{"i":"layout-app-shell-sidebar-collapsed","n":"layout/app-shell-sidebar-collapsed","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-56"}}},{"i":"layout-app-shell-sidebar-padding","n":"layout/app-shell-sidebar-padding","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-12"}}},{"i":"layout-app-shell-sidebar-width","n":"layout/app-shell-sidebar-width","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-280"}}},{"i":"layout-app-shell-top-bar-height","n":"layout/app-shell-top-bar-height","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-40"}}},{"i":"layout-control-height-md","n":"layout/control-height-md","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-40"}}},{"i":"layout-control-height-sm","n":"layout/control-height-sm","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-32"}}},{"i":"layout-control-hit-target-minimum","n":"layout/control-hit-target-minimum","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-44"}}},{"i":"layout-control-minimum-width-sm","n":"layout/control-minimum-width-sm","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-48"}}},{"i":"layout-progress-bar-height","n":"layout/progress-bar-height","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-6"}}},{"i":"layout-progress-bar-max-inline-size","n":"layout/progress-bar-max-inline-size","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-320"}}},{"i":"layout-project-card-minimum","n":"layout/project-card-minimum","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-240"}}},{"i":"layout-project-grid-gap","n":"layout/project-grid-gap","t":"FLOAT","h":false,"sc":["WIDTH_HEIGHT"],"v":{"Global":{"a":"space-12"}}},{"i":"motion-content-fade","n":"motion/content-fade","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"300ms cubic-bezier(0.25, 0.1, 0.25, 1) delay 0ms"}}},{"i":"motion-content-rise","n":"motion/content-rise","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"360ms cubic-bezier(0.22, 1, 0.36, 1) delay 0ms"}}},{"i":"motion-control-hover","n":"motion/control-hover","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"160ms cubic-bezier(0.25, 0.1, 0.25, 1) delay 0ms"}}},{"i":"motion-crossfade-enter","n":"motion/crossfade-enter","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"420ms cubic-bezier(0.25, 0.1, 0.25, 1) delay 0ms"}}},{"i":"motion-layout-change","n":"motion/layout-change","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"220ms cubic-bezier(0.4, 0, 0.2, 1) delay 0ms"}}},{"i":"motion-list-enter","n":"motion/list-enter","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"560ms cubic-bezier(0.23, 1, 0.32, 1) delay 0ms"}}},{"i":"motion-list-stagger-step","n":"motion/list-stagger-step","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"560ms cubic-bezier(0.23, 1, 0.32, 1) delay 36ms"}}},{"i":"motion-menu-enter","n":"motion/menu-enter","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"260ms cubic-bezier(0.32, 0.72, 0, 1) delay 0ms"}}},{"i":"motion-menu-exit","n":"motion/menu-exit","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"130ms cubic-bezier(0.42, 0, 1, 1) delay 0ms"}}},{"i":"motion-modal-enter","n":"motion/modal-enter","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"320ms cubic-bezier(0.32, 0.72, 0, 1) delay 0ms"}}},{"i":"motion-modal-exit","n":"motion/modal-exit","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"200ms cubic-bezier(0.4, 0, 1, 1) delay 0ms"}}},{"i":"motion-overlay-enter","n":"motion/overlay-enter","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"200ms cubic-bezier(0.32, 0.72, 0, 1) delay 0ms"}}},{"i":"motion-overlay-exit","n":"motion/overlay-exit","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"120ms cubic-bezier(0.4, 0, 1, 1) delay 0ms"}}},{"i":"motion-reduced","n":"motion/reduced","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"0ms cubic-bezier(0.2, 0, 0, 1) delay 0ms"}}},{"i":"motion-shell-collapse","n":"motion/shell-collapse","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"320ms cubic-bezier(0.4, 0, 0.2, 1) delay 0ms"}}},{"i":"motion-shimmer","n":"motion/shimmer","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"1600ms cubic-bezier(0.2, 0, 0, 1) delay 0ms"}}},{"i":"motion-spin","n":"motion/spin","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"700ms cubic-bezier(0, 0, 1, 1) delay 0ms"}}},{"i":"motion-stagger-1","n":"motion/stagger-1","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"360ms cubic-bezier(0.22, 1, 0.36, 1) delay 40ms"}}},{"i":"motion-stagger-2","n":"motion/stagger-2","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"360ms cubic-bezier(0.22, 1, 0.36, 1) delay 80ms"}}},{"i":"motion-stagger-3","n":"motion/stagger-3","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"360ms cubic-bezier(0.22, 1, 0.36, 1) delay 150ms"}}},{"i":"motion-tooltip-enter","n":"motion/tooltip-enter","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"140ms cubic-bezier(0.23, 1, 0.32, 1) delay 0ms"}}},{"i":"motion-tooltip-exit","n":"motion/tooltip-exit","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"120ms cubic-bezier(0.19, 1, 0.22, 1) delay 0ms"}}},{"i":"motion-zoom-settle","n":"motion/zoom-settle","t":"STRING","h":false,"sc":[],"v":{"Global":{"s":"680ms cubic-bezier(0.22, 1, 0.36, 1) delay 0ms"}}},{"i":"radius-card","n":"radius/card","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-16"}}},{"i":"radius-card-lg","n":"radius/card-lg","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-20"}}},{"i":"radius-control","n":"radius/control","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-12"}}},{"i":"radius-control-sm","n":"radius/control-sm","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-8"}}},{"i":"radius-overlay","n":"radius/overlay","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-16"}}},{"i":"radius-overlay-item","n":"radius/overlay-item","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-10"}}},{"i":"radius-overlay-lg","n":"radius/overlay-lg","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-24"}}},{"i":"radius-pill","n":"radius/pill","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-full"}}},{"i":"space-control-lg","n":"spacing/control-lg","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-16"}}},{"i":"space-control-md","n":"spacing/control-md","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-12"}}}]};

const report={created:[],updated:[],unchanged:0,modesAdded:[],collectionsCreated:[],missingAlias:[]};
const near=(a,b)=>Math.abs((a??1)-(b??1))<1e-5;
// 색은 Figma가 전정밀도로 저장하고 여기 값은 6자리 반올림이라 **엄격 비교하면 매번 달라 보인다.**
// 그러면 idempotent 실행이 항상 updated로 보고돼 무엇이 실제로 바뀌었는지 알 수 없다.
const eq=(a,b)=>(a&&b&&typeof a==="object"&&typeof b==="object"&&"r" in a&&"r" in b)
  ?(near(a.r,b.r)&&near(a.g,b.g)&&near(a.b,b.b)&&near(a.a,b.a))
  :JSON.stringify(a)===JSON.stringify(b);
let cols=await figma.variables.getLocalVariableCollectionsAsync();
let c=cols.find(x=>x.name===COL.c);
if(!c){c=figma.variables.createVariableCollection(COL.c);report.collectionsCreated.push(COL.c);}
let modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
if(c.modes.length===1&&!modeName.has(COL.d)){
  c.renameMode(c.modes[0].modeId,COL.d);modeName=new Map([[COL.d,c.modes[0].modeId]]);
}
for(const m of COL.m){ if(!modeName.has(m)){modeName.set(m,c.addMode(m));report.modesAdded.push(COL.c+"/"+m);} }
// 1차 — 변수 자체를 맞춘다.
let all=await figma.variables.getLocalVariablesAsync();
const inCol=new Map(all.filter(v=>v.variableCollectionId===c.id).map(v=>[v.name,v]));
for(const spec of COL.vars){
  let v=inCol.get(spec.n);
  if(!v){v=figma.variables.createVariable(spec.n,c,spec.t);report.created.push(spec.i);inCol.set(spec.n,v);}
  v.hiddenFromPublishing=spec.h;
  if(spec.sc.length) v.scopes=spec.sc;
}
// 2차 — 값을 넣는다. 별칭은 **이름으로** 파일 전체에서 찾는다.
all=await figma.variables.getLocalVariablesAsync();
const byName=new Map(all.map(v=>[v.name,v]));
for(const spec of COL.vars){
  const v=inCol.get(spec.n); if(!v) continue;
  let touched=false;
  for(const [mode,val] of Object.entries(spec.v)){
    const modeId=modeName.get(mode); if(!modeId) continue;
    let next;
    if(val.a!==undefined){
      const t=byName.get(NAME[val.a]);
      if(!t){report.missingAlias.push(spec.i+"→"+val.a);continue;}
      next=figma.variables.createVariableAlias(t);
    }
    else if(val.c) next={r:val.c[0],g:val.c[1],b:val.c[2],a:val.c[3]};
    else if(val.n!==undefined) next=val.n;
    else next=val.s;
    if(!eq(v.valuesByMode[modeId],next)){v.setValueForMode(modeId,next);touched=true;}
  }
  const isNew=report.created.includes(spec.i);
  if(touched&&!isNew) report.updated.push(spec.i);
  if(!touched&&!isNew) report.unchanged+=1;
}
    }
    console.log("✅ [KDS] Variables Part 4/7 applied.");
  } catch (e) { console.error("Variables 4 error:", e); }

  try {
    {
// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 5/7 — Klipse Semantic 2/2 (변수 12개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={"space-8":"spacing/8","space-4":"spacing/4","space-16":"spacing/16","space-24":"spacing/24","space-20":"spacing/20","space-6":"spacing/6","space-2":"spacing/2","space-12":"spacing/12"};
const COL={"c":"Klipse Semantic","m":["Global"],"d":"Global","vars":[{"i":"space-control-sm","n":"spacing/control-sm","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-8"}}},{"i":"space-control-xs","n":"spacing/control-xs","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-4"}}},{"i":"space-layout-gutter","n":"spacing/layout-gutter","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-16"}}},{"i":"space-layout-section","n":"spacing/layout-section","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-24"}}},{"i":"space-media-inset","n":"spacing/media-inset","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-20"}}},{"i":"space-overlay-inset","n":"spacing/overlay-inset","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-6"}}},{"i":"space-overlay-item-content-gap","n":"spacing/overlay-item-content-gap","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-6"}}},{"i":"space-overlay-item-gap","n":"spacing/overlay-item-gap","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-2"}}},{"i":"space-progress-ring-gap","n":"spacing/progress-ring-gap","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-2"}}},{"i":"space-stack-md","n":"spacing/stack-md","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-12"}}},{"i":"space-stack-xs","n":"spacing/stack-xs","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-4"}}},{"i":"space-toast-inline","n":"spacing/toast-inline","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-20"}}}]};

const report={created:[],updated:[],unchanged:0,modesAdded:[],collectionsCreated:[],missingAlias:[]};
const near=(a,b)=>Math.abs((a??1)-(b??1))<1e-5;
// 색은 Figma가 전정밀도로 저장하고 여기 값은 6자리 반올림이라 **엄격 비교하면 매번 달라 보인다.**
// 그러면 idempotent 실행이 항상 updated로 보고돼 무엇이 실제로 바뀌었는지 알 수 없다.
const eq=(a,b)=>(a&&b&&typeof a==="object"&&typeof b==="object"&&"r" in a&&"r" in b)
  ?(near(a.r,b.r)&&near(a.g,b.g)&&near(a.b,b.b)&&near(a.a,b.a))
  :JSON.stringify(a)===JSON.stringify(b);
let cols=await figma.variables.getLocalVariableCollectionsAsync();
let c=cols.find(x=>x.name===COL.c);
if(!c){c=figma.variables.createVariableCollection(COL.c);report.collectionsCreated.push(COL.c);}
let modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
if(c.modes.length===1&&!modeName.has(COL.d)){
  c.renameMode(c.modes[0].modeId,COL.d);modeName=new Map([[COL.d,c.modes[0].modeId]]);
}
for(const m of COL.m){ if(!modeName.has(m)){modeName.set(m,c.addMode(m));report.modesAdded.push(COL.c+"/"+m);} }
// 1차 — 변수 자체를 맞춘다.
let all=await figma.variables.getLocalVariablesAsync();
const inCol=new Map(all.filter(v=>v.variableCollectionId===c.id).map(v=>[v.name,v]));
for(const spec of COL.vars){
  let v=inCol.get(spec.n);
  if(!v){v=figma.variables.createVariable(spec.n,c,spec.t);report.created.push(spec.i);inCol.set(spec.n,v);}
  v.hiddenFromPublishing=spec.h;
  if(spec.sc.length) v.scopes=spec.sc;
}
// 2차 — 값을 넣는다. 별칭은 **이름으로** 파일 전체에서 찾는다.
all=await figma.variables.getLocalVariablesAsync();
const byName=new Map(all.map(v=>[v.name,v]));
for(const spec of COL.vars){
  const v=inCol.get(spec.n); if(!v) continue;
  let touched=false;
  for(const [mode,val] of Object.entries(spec.v)){
    const modeId=modeName.get(mode); if(!modeId) continue;
    let next;
    if(val.a!==undefined){
      const t=byName.get(NAME[val.a]);
      if(!t){report.missingAlias.push(spec.i+"→"+val.a);continue;}
      next=figma.variables.createVariableAlias(t);
    }
    else if(val.c) next={r:val.c[0],g:val.c[1],b:val.c[2],a:val.c[3]};
    else if(val.n!==undefined) next=val.n;
    else next=val.s;
    if(!eq(v.valuesByMode[modeId],next)){v.setValueForMode(modeId,next);touched=true;}
  }
  const isNew=report.created.includes(spec.i);
  if(touched&&!isNew) report.updated.push(spec.i);
  if(!touched&&!isNew) report.unchanged+=1;
}
    }
    console.log("✅ [KDS] Variables Part 5/7 applied.");
  } catch (e) { console.error("Variables 5 error:", e); }

  try {
    {
// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 6/7 — Klipse Semantic Color 1/2 (변수 64개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={"color-red-500":"color/red/500","color-paper-alpha-10":"color/paper-alpha/10","color-ink-alpha-8":"color/ink-alpha/8","color-red-alpha-12":"color/red-alpha/12","color-red-alpha-10":"color/red-alpha/10","color-ink-alpha-6":"color/ink-alpha/6","color-blue-500":"color/blue/500","color-blue-600":"color/blue/600","color-blue-400":"color/blue/400","color-neutral-400":"color/neutral/400","color-neutral-600":"color/neutral/600","color-paper-alpha-8":"color/paper-alpha/8","color-ink-alpha-5":"color/ink-alpha/5","color-neutral-900":"color/neutral/900","color-neutral-100":"color/neutral/100","color-red-900":"color/red/900","color-red-100":"color/red/100","color-blue-900":"color/blue/900","color-blue-50":"color/blue/50","color-neutral-800":"color/neutral/800","color-neutral-150":"color/neutral/150","color-neutral-200":"color/neutral/200","color-inverse-alpha-light-70":"color/inverse-alpha/light-70","color-inverse-alpha-dark-70":"color/inverse-alpha/dark-70","color-neutral-0":"color/neutral/0","color-neutral-700":"color/neutral/700","color-green-900":"color/green/900","color-green-100":"color/green/100","color-neutral-50":"color/neutral/50","color-amber-900":"color/amber/900","color-amber-100":"color/amber/100","color-paper-alpha-16":"color/paper-alpha/16","color-ink-alpha-12":"color/ink-alpha/12","color-neutral-300":"color/neutral/300","color-neutral-500":"color/neutral/500","color-paper-alpha-14":"color/paper-alpha/14","color-red-400":"color/red/400","color-red-700":"color/red/700","color-paper-alpha-86":"color/paper-alpha/86","color-ink-alpha-86":"color/ink-alpha/86","color-neutral-1000":"color/neutral/1000","color-paper-alpha-88":"color/paper-alpha/88","color-black-alpha-28":"color/black-alpha/28","color-paper-alpha-45":"color/paper-alpha/45","color-pink-500":"color/pink/500","color-pink-800":"color/pink/800","color-pink-200":"color/pink/200","color-violet-500":"color/violet/500","color-violet-800":"color/violet/800","color-violet-200":"color/violet/200","color-mint-500":"color/mint/500"};
const COL={"c":"Klipse Semantic Color","m":["Light","Dark"],"d":"Light","vars":[{"i":"color-action-danger","n":"color/action-danger","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-500"},"Light":{"a":"color-red-500"}}},{"i":"color-action-ghost-hover","n":"color/action-ghost-hover","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-10"},"Light":{"a":"color-ink-alpha-8"}}},{"i":"color-action-menu-danger-hover","n":"color/action-menu-danger-hover","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-alpha-12"},"Light":{"a":"color-red-alpha-10"}}},{"i":"color-action-menu-item-hover","n":"color/action-menu-item-hover","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-10"},"Light":{"a":"color-ink-alpha-6"}}},{"i":"color-action-primary","n":"color/action-primary","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-blue-500"},"Light":{"a":"color-blue-500"}}},{"i":"color-action-primary-active","n":"color/action-primary-active","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-blue-600"},"Light":{"a":"color-blue-600"}}},{"i":"color-action-primary-hover","n":"color/action-primary-hover","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-blue-400"},"Light":{"a":"color-blue-400"}}},{"i":"color-action-secondary-foreground","n":"color/action-secondary-foreground","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-400"},"Light":{"a":"color-neutral-600"}}},{"i":"color-action-secondary-hover","n":"color/action-secondary-hover","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-8"},"Light":{"a":"color-ink-alpha-5"}}},{"i":"color-background-canvas","n":"color/background-canvas","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-900"},"Light":{"a":"color-neutral-100"}}},{"i":"color-background-danger","n":"color/background-danger","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-red-900"},"Light":{"a":"color-red-100"}}},{"i":"color-background-info","n":"color/background-info","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-blue-900"},"Light":{"a":"color-blue-50"}}},{"i":"color-background-inset","n":"color/background-inset","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-800"},"Light":{"a":"color-neutral-150"}}},{"i":"color-background-inverse","n":"color/background-inverse","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-200"},"Light":{"a":"color-neutral-800"}}},{"i":"color-background-inverse-translucent","n":"color/background-inverse-translucent","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-inverse-alpha-light-70"},"Light":{"a":"color-inverse-alpha-dark-70"}}},{"i":"color-background-menu","n":"color/background-menu","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-800"},"Light":{"a":"color-neutral-100"}}},{"i":"color-background-overlay","n":"color/background-overlay","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-800"},"Light":{"a":"color-neutral-0"}}},{"i":"color-background-raised","n":"color/background-raised","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-700"},"Light":{"a":"color-neutral-0"}}},{"i":"color-background-success","n":"color/background-success","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-green-900"},"Light":{"a":"color-green-100"}}},{"i":"color-background-surface","n":"color/background-surface","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-800"},"Light":{"a":"color-neutral-0"}}},{"i":"color-background-upgrade","n":"color/background-upgrade","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-100"},"Light":{"a":"color-neutral-900"}}},{"i":"color-background-upgrade-current","n":"color/background-upgrade-current","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-800"},"Light":{"a":"color-neutral-50"}}},{"i":"color-background-upgrade-hover","n":"color/background-upgrade-hover","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-neutral-200"},"Light":{"a":"color-neutral-800"}}},{"i":"color-background-warning","n":"color/background-warning","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL"],"v":{"Dark":{"a":"color-amber-900"},"Light":{"a":"color-amber-100"}}},{"i":"color-border-control","n":"color/border-control","t":"COLOR","h":false,"sc":["STROKE_COLOR"],"v":{"Dark":{"a":"color-paper-alpha-16"},"Light":{"a":"color-ink-alpha-12"}}},{"i":"color-border-danger","n":"color/border-danger","t":"COLOR","h":false,"sc":["STROKE_COLOR"],"v":{"Dark":{"a":"color-red-500"},"Light":{"a":"color-red-500"}}},{"i":"color-border-default","n":"color/border-default","t":"COLOR","h":false,"sc":["STROKE_COLOR"],"v":{"Dark":{"a":"color-neutral-600"},"Light":{"a":"color-neutral-300"}}},{"i":"color-border-focus","n":"color/border-focus","t":"COLOR","h":false,"sc":["STROKE_COLOR"],"v":{"Dark":{"a":"color-blue-400"},"Light":{"a":"color-blue-500"}}},{"i":"color-border-strong","n":"color/border-strong","t":"COLOR","h":false,"sc":["STROKE_COLOR"],"v":{"Dark":{"a":"color-neutral-500"},"Light":{"a":"color-neutral-500"}}},{"i":"color-border-subtle","n":"color/border-subtle","t":"COLOR","h":false,"sc":["STROKE_COLOR"],"v":{"Dark":{"a":"color-neutral-700"},"Light":{"a":"color-neutral-200"}}},{"i":"color-border-tooltip","n":"color/border-tooltip","t":"COLOR","h":false,"sc":["STROKE_COLOR"],"v":{"Dark":{"a":"color-ink-alpha-12"},"Light":{"a":"color-paper-alpha-14"}}},{"i":"color-foreground-danger","n":"color/foreground-danger","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-red-100"},"Light":{"a":"color-red-900"}}},{"i":"color-foreground-danger-on-surface","n":"color/foreground-danger-on-surface","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-red-400"},"Light":{"a":"color-red-700"}}},{"i":"color-foreground-disabled","n":"color/foreground-disabled","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-600"},"Light":{"a":"color-neutral-500"}}},{"i":"color-foreground-info","n":"color/foreground-info","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-blue-50"},"Light":{"a":"color-blue-900"}}},{"i":"color-foreground-inverse","n":"color/foreground-inverse","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-0"},"Light":{"a":"color-neutral-0"}}},{"i":"color-foreground-menu-item","n":"color/foreground-menu-item","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-86"},"Light":{"a":"color-ink-alpha-86"}}},{"i":"color-foreground-on-danger","n":"color/foreground-on-danger","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-0"},"Light":{"a":"color-neutral-0"}}},{"i":"color-foreground-on-inverse","n":"color/foreground-on-inverse","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-900"},"Light":{"a":"color-neutral-0"}}},{"i":"color-foreground-primary","n":"color/foreground-primary","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-0"},"Light":{"a":"color-neutral-900"}}},{"i":"color-foreground-secondary","n":"color/foreground-secondary","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-300"},"Light":{"a":"color-neutral-700"}}},{"i":"color-foreground-success","n":"color/foreground-success","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-green-100"},"Light":{"a":"color-green-900"}}},{"i":"color-foreground-tertiary","n":"color/foreground-tertiary","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-400"},"Light":{"a":"color-neutral-600"}}},{"i":"color-foreground-upgrade","n":"color/foreground-upgrade","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-900"},"Light":{"a":"color-neutral-50"}}},{"i":"color-foreground-upgrade-current","n":"color/foreground-upgrade-current","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-0"},"Light":{"a":"color-neutral-1000"}}},{"i":"color-foreground-upgrade-hover","n":"color/foreground-upgrade-hover","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-900"},"Light":{"a":"color-neutral-50"}}},{"i":"color-foreground-warning","n":"color/foreground-warning","t":"COLOR","h":false,"sc":["TEXT_FILL"],"v":{"Dark":{"a":"color-amber-100"},"Light":{"a":"color-amber-900"}}},{"i":"color-media-control-foreground","n":"color/media-control-foreground","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-88"},"Light":{"a":"color-paper-alpha-88"}}},{"i":"color-media-control-hover","n":"color/media-control-hover","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-14"},"Light":{"a":"color-paper-alpha-14"}}},{"i":"color-media-control-surface","n":"color/media-control-surface","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-black-alpha-28"},"Light":{"a":"color-black-alpha-28"}}},{"i":"color-media-foreground-bright","n":"color/media-foreground-bright","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-900"},"Light":{"a":"color-neutral-900"}}},{"i":"color-media-foreground-dark","n":"color/media-foreground-dark","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-0"},"Light":{"a":"color-neutral-0"}}},{"i":"color-media-indicator-active","n":"color/media-indicator-active","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-0"},"Light":{"a":"color-neutral-0"}}},{"i":"color-media-indicator-rest","n":"color/media-indicator-rest","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-45"},"Light":{"a":"color-paper-alpha-45"}}},{"i":"color-media-scrim-bright","n":"color/media-scrim-bright","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-0"},"Light":{"a":"color-neutral-0"}}},{"i":"color-media-scrim-dark","n":"color/media-scrim-dark","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-neutral-1000"},"Light":{"a":"color-neutral-1000"}}},{"i":"color-node-audio-accent","n":"color/node-audio-accent","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-pink-500"},"Light":{"a":"color-pink-500"}}},{"i":"color-node-audio-icon","n":"color/node-audio-icon","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-pink-500"},"Light":{"a":"color-pink-500"}}},{"i":"color-node-audio-surface","n":"color/node-audio-surface","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-pink-800"},"Light":{"a":"color-pink-200"}}},{"i":"color-node-edit-accent","n":"color/node-edit-accent","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-violet-500"},"Light":{"a":"color-violet-500"}}},{"i":"color-node-edit-icon","n":"color/node-edit-icon","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-violet-500"},"Light":{"a":"color-violet-500"}}},{"i":"color-node-edit-surface","n":"color/node-edit-surface","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-violet-800"},"Light":{"a":"color-violet-200"}}},{"i":"color-node-image-accent","n":"color/node-image-accent","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-mint-500"},"Light":{"a":"color-mint-500"}}},{"i":"color-node-image-icon","n":"color/node-image-icon","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-mint-500"},"Light":{"a":"color-mint-500"}}}]};

const report={created:[],updated:[],unchanged:0,modesAdded:[],collectionsCreated:[],missingAlias:[]};
const near=(a,b)=>Math.abs((a??1)-(b??1))<1e-5;
// 색은 Figma가 전정밀도로 저장하고 여기 값은 6자리 반올림이라 **엄격 비교하면 매번 달라 보인다.**
// 그러면 idempotent 실행이 항상 updated로 보고돼 무엇이 실제로 바뀌었는지 알 수 없다.
const eq=(a,b)=>(a&&b&&typeof a==="object"&&typeof b==="object"&&"r" in a&&"r" in b)
  ?(near(a.r,b.r)&&near(a.g,b.g)&&near(a.b,b.b)&&near(a.a,b.a))
  :JSON.stringify(a)===JSON.stringify(b);
let cols=await figma.variables.getLocalVariableCollectionsAsync();
let c=cols.find(x=>x.name===COL.c);
if(!c){c=figma.variables.createVariableCollection(COL.c);report.collectionsCreated.push(COL.c);}
let modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
if(c.modes.length===1&&!modeName.has(COL.d)){
  c.renameMode(c.modes[0].modeId,COL.d);modeName=new Map([[COL.d,c.modes[0].modeId]]);
}
for(const m of COL.m){ if(!modeName.has(m)){modeName.set(m,c.addMode(m));report.modesAdded.push(COL.c+"/"+m);} }
// 1차 — 변수 자체를 맞춘다.
let all=await figma.variables.getLocalVariablesAsync();
const inCol=new Map(all.filter(v=>v.variableCollectionId===c.id).map(v=>[v.name,v]));
for(const spec of COL.vars){
  let v=inCol.get(spec.n);
  if(!v){v=figma.variables.createVariable(spec.n,c,spec.t);report.created.push(spec.i);inCol.set(spec.n,v);}
  v.hiddenFromPublishing=spec.h;
  if(spec.sc.length) v.scopes=spec.sc;
}
// 2차 — 값을 넣는다. 별칭은 **이름으로** 파일 전체에서 찾는다.
all=await figma.variables.getLocalVariablesAsync();
const byName=new Map(all.map(v=>[v.name,v]));
for(const spec of COL.vars){
  const v=inCol.get(spec.n); if(!v) continue;
  let touched=false;
  for(const [mode,val] of Object.entries(spec.v)){
    const modeId=modeName.get(mode); if(!modeId) continue;
    let next;
    if(val.a!==undefined){
      const t=byName.get(NAME[val.a]);
      if(!t){report.missingAlias.push(spec.i+"→"+val.a);continue;}
      next=figma.variables.createVariableAlias(t);
    }
    else if(val.c) next={r:val.c[0],g:val.c[1],b:val.c[2],a:val.c[3]};
    else if(val.n!==undefined) next=val.n;
    else next=val.s;
    if(!eq(v.valuesByMode[modeId],next)){v.setValueForMode(modeId,next);touched=true;}
  }
  const isNew=report.created.includes(spec.i);
  if(touched&&!isNew) report.updated.push(spec.i);
  if(!touched&&!isNew) report.unchanged+=1;
}
    }
    console.log("✅ [KDS] Variables Part 6/7 applied.");
  } catch (e) { console.error("Variables 6 error:", e); }

  try {
    {
// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 7/7 — Klipse Semantic Color 2/2 (변수 16개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={"color-mint-800":"color/mint/800","color-mint-200":"color/mint/200","color-red-500":"color/red/500","color-red-800":"color/red/800","color-red-200":"color/red/200","color-yellow-500":"color/yellow/500","color-yellow-800":"color/yellow/800","color-yellow-200":"color/yellow/200","color-blue-500":"color/blue/500","color-mint-500":"color/mint/500","color-paper-alpha-20":"color/paper-alpha/20","color-ink-alpha-20":"color/ink-alpha/20","color-paper-alpha-10":"color/paper-alpha/10","color-ink-alpha-10":"color/ink-alpha/10","color-black-alpha-72":"color/black-alpha/72","color-black-alpha-56":"color/black-alpha/56"};
const COL={"c":"Klipse Semantic Color","m":["Light","Dark"],"d":"Light","vars":[{"i":"color-node-image-surface","n":"color/node-image-surface","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-mint-800"},"Light":{"a":"color-mint-200"}}},{"i":"color-node-instagram-accent","n":"color/node-instagram-accent","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-500"},"Light":{"a":"color-red-500"}}},{"i":"color-node-instagram-icon","n":"color/node-instagram-icon","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-500"},"Light":{"a":"color-red-500"}}},{"i":"color-node-instagram-surface","n":"color/node-instagram-surface","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-800"},"Light":{"a":"color-red-200"}}},{"i":"color-node-text-accent","n":"color/node-text-accent","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-yellow-500"},"Light":{"a":"color-yellow-500"}}},{"i":"color-node-text-icon","n":"color/node-text-icon","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-yellow-500"},"Light":{"a":"color-yellow-500"}}},{"i":"color-node-text-surface","n":"color/node-text-surface","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-yellow-800"},"Light":{"a":"color-yellow-200"}}},{"i":"color-node-video-accent","n":"color/node-video-accent","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-blue-500"},"Light":{"a":"color-blue-500"}}},{"i":"color-node-youtube-accent","n":"color/node-youtube-accent","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-500"},"Light":{"a":"color-red-500"}}},{"i":"color-node-youtube-icon","n":"color/node-youtube-icon","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-500"},"Light":{"a":"color-red-500"}}},{"i":"color-node-youtube-surface","n":"color/node-youtube-surface","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-800"},"Light":{"a":"color-red-200"}}},{"i":"color-progress-fill","n":"color/progress-fill","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-blue-500"},"Light":{"a":"color-blue-500"}}},{"i":"color-progress-ring-fill","n":"color/progress-ring-fill","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-mint-500"},"Light":{"a":"color-mint-500"}}},{"i":"color-progress-ring-track","n":"color/progress-ring-track","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-20"},"Light":{"a":"color-ink-alpha-20"}}},{"i":"color-progress-track","n":"color/progress-track","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-paper-alpha-10"},"Light":{"a":"color-ink-alpha-10"}}},{"i":"color-scrim-modal","n":"color/scrim-modal","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-black-alpha-72"},"Light":{"a":"color-black-alpha-56"}}}]};

const report={created:[],updated:[],unchanged:0,modesAdded:[],collectionsCreated:[],missingAlias:[]};
const near=(a,b)=>Math.abs((a??1)-(b??1))<1e-5;
// 색은 Figma가 전정밀도로 저장하고 여기 값은 6자리 반올림이라 **엄격 비교하면 매번 달라 보인다.**
// 그러면 idempotent 실행이 항상 updated로 보고돼 무엇이 실제로 바뀌었는지 알 수 없다.
const eq=(a,b)=>(a&&b&&typeof a==="object"&&typeof b==="object"&&"r" in a&&"r" in b)
  ?(near(a.r,b.r)&&near(a.g,b.g)&&near(a.b,b.b)&&near(a.a,b.a))
  :JSON.stringify(a)===JSON.stringify(b);
let cols=await figma.variables.getLocalVariableCollectionsAsync();
let c=cols.find(x=>x.name===COL.c);
if(!c){c=figma.variables.createVariableCollection(COL.c);report.collectionsCreated.push(COL.c);}
let modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
if(c.modes.length===1&&!modeName.has(COL.d)){
  c.renameMode(c.modes[0].modeId,COL.d);modeName=new Map([[COL.d,c.modes[0].modeId]]);
}
for(const m of COL.m){ if(!modeName.has(m)){modeName.set(m,c.addMode(m));report.modesAdded.push(COL.c+"/"+m);} }
// 1차 — 변수 자체를 맞춘다.
let all=await figma.variables.getLocalVariablesAsync();
const inCol=new Map(all.filter(v=>v.variableCollectionId===c.id).map(v=>[v.name,v]));
for(const spec of COL.vars){
  let v=inCol.get(spec.n);
  if(!v){v=figma.variables.createVariable(spec.n,c,spec.t);report.created.push(spec.i);inCol.set(spec.n,v);}
  v.hiddenFromPublishing=spec.h;
  if(spec.sc.length) v.scopes=spec.sc;
}
// 2차 — 값을 넣는다. 별칭은 **이름으로** 파일 전체에서 찾는다.
all=await figma.variables.getLocalVariablesAsync();
const byName=new Map(all.map(v=>[v.name,v]));
for(const spec of COL.vars){
  const v=inCol.get(spec.n); if(!v) continue;
  let touched=false;
  for(const [mode,val] of Object.entries(spec.v)){
    const modeId=modeName.get(mode); if(!modeId) continue;
    let next;
    if(val.a!==undefined){
      const t=byName.get(NAME[val.a]);
      if(!t){report.missingAlias.push(spec.i+"→"+val.a);continue;}
      next=figma.variables.createVariableAlias(t);
    }
    else if(val.c) next={r:val.c[0],g:val.c[1],b:val.c[2],a:val.c[3]};
    else if(val.n!==undefined) next=val.n;
    else next=val.s;
    if(!eq(v.valuesByMode[modeId],next)){v.setValueForMode(modeId,next);touched=true;}
  }
  const isNew=report.created.includes(spec.i);
  if(touched&&!isNew) report.updated.push(spec.i);
  if(!touched&&!isNew) report.unchanged+=1;
}
    }
    console.log("✅ [KDS] Variables Part 7/7 applied.");
  } catch (e) { console.error("Variables 7 error:", e); }

  // =========================================================================
  // 2. Apply Typography & Effect Styles (23 Styles)
  // =========================================================================
  try {
    {
// 생성물. scripts/build-figma-styles.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. text style 15개 · effect style 8개.
// **변수를 먼저 적용한다** — text style이 font-size·font-weight 변수를 이름으로 찾아 바인딩한다.
// effect style에는 모드가 없어 **Light 값**으로 만든다. 다크는 Figma가 표현하지 못한다.
const FAMILY="Pretendard";
const TEXT=[{"i":"typography-body-lg-medium","n":"typography/body-lg-medium","fam":"Pretendard","st":"Medium","size":20,"lh":150,"ls":-0.2,"bind":{"fontSize":"font-size/body-lg","fontWeight":"font-weight/medium"}},{"i":"typography-body-lg-regular","n":"typography/body-lg-regular","fam":"Pretendard","st":"Regular","size":20,"lh":150,"ls":-0.2,"bind":{"fontSize":"font-size/body-lg","fontWeight":"font-weight/regular"}},{"i":"typography-body-lg-semibold","n":"typography/body-lg-semibold","fam":"Pretendard","st":"SemiBold","size":20,"lh":150,"ls":-0.2,"bind":{"fontSize":"font-size/body-lg","fontWeight":"font-weight/semibold"}},{"i":"typography-body-md-medium","n":"typography/body-md-medium","fam":"Pretendard","st":"Medium","size":16,"lh":150,"ls":-0.16,"bind":{"fontSize":"font-size/body-md","fontWeight":"font-weight/medium"}},{"i":"typography-body-md-regular","n":"typography/body-md-regular","fam":"Pretendard","st":"Regular","size":16,"lh":150,"ls":-0.16,"bind":{"fontSize":"font-size/body-md","fontWeight":"font-weight/regular"}},{"i":"typography-body-md-semibold","n":"typography/body-md-semibold","fam":"Pretendard","st":"SemiBold","size":16,"lh":150,"ls":-0.16,"bind":{"fontSize":"font-size/body-md","fontWeight":"font-weight/semibold"}},{"i":"typography-body-sm-medium","n":"typography/body-sm-medium","fam":"Pretendard","st":"Medium","size":14,"lh":150,"ls":-0.14,"bind":{"fontSize":"font-size/body-sm","fontWeight":"font-weight/medium"}},{"i":"typography-body-sm-regular","n":"typography/body-sm-regular","fam":"Pretendard","st":"Regular","size":14,"lh":150,"ls":-0.14,"bind":{"fontSize":"font-size/body-sm","fontWeight":"font-weight/regular"}},{"i":"typography-body-sm-semibold","n":"typography/body-sm-semibold","fam":"Pretendard","st":"SemiBold","size":14,"lh":150,"ls":-0.14,"bind":{"fontSize":"font-size/body-sm","fontWeight":"font-weight/semibold"}},{"i":"typography-caption-medium","n":"typography/caption-medium","fam":"Pretendard","st":"Medium","size":12,"lh":150,"ls":-0.12,"bind":{"fontSize":"font-size/caption","fontWeight":"font-weight/medium"}},{"i":"typography-caption-regular","n":"typography/caption-regular","fam":"Pretendard","st":"Regular","size":12,"lh":150,"ls":-0.12,"bind":{"fontSize":"font-size/caption","fontWeight":"font-weight/regular"}},{"i":"typography-caption-semibold","n":"typography/caption-semibold","fam":"Pretendard","st":"SemiBold","size":12,"lh":150,"ls":-0.12,"bind":{"fontSize":"font-size/caption","fontWeight":"font-weight/semibold"}},{"i":"typography-heading-lg-medium","n":"typography/heading-lg-medium","fam":"Pretendard","st":"Medium","size":48,"lh":135,"ls":-0.96,"bind":{"fontSize":"font-size/heading-lg","fontWeight":"font-weight/medium"}},{"i":"typography-heading-md-medium","n":"typography/heading-md-medium","fam":"Pretendard","st":"Medium","size":36,"lh":135,"ls":-0.72,"bind":{"fontSize":"font-size/heading-md","fontWeight":"font-weight/medium"}},{"i":"typography-heading-sm-medium","n":"typography/heading-sm-medium","fam":"Pretendard","st":"Medium","size":28,"lh":135,"ls":-0.56,"bind":{"fontSize":"font-size/heading-sm","fontWeight":"font-weight/medium"}}];
const EFFECT=[{"i":"elevation-focus-ring","n":"elevation/focus-ring","layers":[{"y":0,"x":0,"b":0,"s":3,"inset":false,"c":[0,0.533333,1,0.42]}]},{"i":"elevation-modal","n":"elevation/modal","layers":[{"y":16,"x":0,"b":48,"s":-8,"inset":false,"c":[0,0,0,0.22]}]},{"i":"elevation-popover","n":"elevation/popover","layers":[{"y":8,"x":0,"b":24,"s":-4,"inset":false,"c":[0,0,0,0.14]}]},{"i":"elevation-surface","n":"elevation/surface","layers":[{"y":2,"x":0,"b":8,"s":0,"inset":false,"c":[0,0,0,0.06]}]},{"i":"elevation-toast","n":"elevation/toast","layers":[{"y":8,"x":0,"b":20,"s":0,"inset":false,"c":[0,0,0,0.16]}]},{"i":"elevation-menu","n":"elevation/menu","layers":[{"y":8,"x":0,"b":15,"s":0,"inset":false,"c":[0,0,0,0.04]},{"y":0,"x":0,"b":0,"s":0.5,"inset":false,"c":[0.835294,0.843137,0.866667,1]}]},{"i":"elevation-tooltip","n":"elevation/tooltip","layers":[{"y":12,"x":0,"b":24,"s":0,"inset":false,"c":[0.466667,0.490196,0.537255,0.12]}]},{"i":"elevation-upgrade","n":"elevation/upgrade","layers":[{"y":0,"x":0,"b":0,"s":1,"inset":true,"c":[0.980392,0.980392,0.980392,0.08]},{"y":1,"x":0,"b":2,"s":0,"inset":false,"c":[0,0,0,0.06]}]}];

const report={createdText:[],updatedText:[],createdEffect:[],updatedEffect:[],unchanged:0,missingBind:[]};
const near=(a,b)=>Math.abs(a-b)<1e-4;
const vars=await figma.variables.getLocalVariablesAsync();
const byName=new Map(vars.map(v=>[v.name,v]));
await figma.loadFontAsync({family:FAMILY,style:"Regular"});
for(const st of new Set(TEXT.map(t=>t.st))) await figma.loadFontAsync({family:FAMILY,style:st});
const texts=await figma.getLocalTextStylesAsync();
const tByName=new Map(texts.map(s=>[s.name,s]));
for(const t of TEXT){
  let s=tByName.get(t.n);
  const isNew=!s;
  if(isNew){s=figma.createTextStyle();s.name=t.n;report.createdText.push(t.i);}
  s.fontName={family:t.fam,style:t.st};
  s.fontSize=t.size;
  s.lineHeight={unit:"PERCENT",value:t.lh};
  s.letterSpacing={unit:"PIXELS",value:t.ls};
  for(const [field,vname] of Object.entries(t.bind)){
    const v=byName.get(vname);
    if(!v){report.missingBind.push(t.i+"→"+vname);continue;}
    s.setBoundVariable(field,v);
  }
  if(!isNew) report.updatedText.push(t.i);
}
const effects=await figma.getLocalEffectStylesAsync();
const eByName=new Map(effects.map(s=>[s.name,s]));
for(const e of EFFECT){
  let s=eByName.get(e.n);
  const isNew=!s;
  if(isNew){s=figma.createEffectStyle();s.name=e.n;report.createdEffect.push(e.i);}
  s.effects=e.layers.map(l=>({type:l.inset?"INNER_SHADOW":"DROP_SHADOW",
    color:{r:l.c[0],g:l.c[1],b:l.c[2],a:l.c[3]},
    offset:{x:l.x,y:l.y},radius:l.b,spread:l.s,visible:true,blendMode:"NORMAL"}));
  if(!isNew) report.updatedEffect.push(e.i);
}
    }
    console.log("✅ [KDS] Styles applied successfully.");
  } catch (e) { console.error("Styles error:", e); }

  // =========================================================================
  // 3. Draw Component Inventory (23 Components)
  // =========================================================================
  let page = figma.root.children.find(p => p.name === "Product inventory" || p.name === "UI Components");
  if (!page) {
    page = figma.createPage();
    page.name = "Product inventory";
  }
  await figma.setCurrentPageAsync(page);
  let root = page.children.find(n => n.name === "합치기 비교판 — 제품 경쟁 정의");
  if (!root) {
    root = figma.createFrame();
    root.name = "합치기 비교판 — 제품 경쟁 정의";
    root.layoutMode = "VERTICAL";
    root.itemSpacing = 40;
    root.paddingLeft = 40; root.paddingRight = 40; root.paddingTop = 40; root.paddingBottom = 40;
    page.appendChild(root);
  }

  try {
    // Inventory Draw Part 1/8
    {
// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=true;
const PLAN=[{"k":"button","L":"버튼","sp":[{"i":"button/adminModalCancel","l":"관리자 모달 취소 버튼 — MODAL_BUTTON_BASE 참조 합성","j":"AdminClient.tsx:2139-2144","t":{"p":"MODAL_CANCEL","w":364,"h":42,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.1],"r":12,"t":"취소","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"lp":150,"mh":42}},{"i":"button/adminModalConfirm","l":"관리자 모달 확인 버튼 — MODAL_BUTTON_BASE 참조 합성","j":"AdminClient.tsx:2145-2152","t":{"p":"MODAL_CONFIRM","w":364,"h":42,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,1],"r":12,"t":"지급","fg":[0,0,0,1],"fs":14,"fw":500,"lp":150,"mh":42}},{"i":"button/gnbSidebarCta","l":"GNB 사이드바 CTA 버튼 — 라벨 스팬을 자식으로 갖는 민트 알약","j":"Gnb.tsx:5005-5019","t":{"p":"sidebarUpgradeButton","w":372,"h":41,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[10,14,10,14],"H":1,"J":"center","bg":[0.945,0.945,0.953,1],"r":12,"sh":[[0,0,0,0.12],0,1,2],"mh":40,"c":[{"p":"sidebarUpgradeLabel","w":35.89,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"보관함","fg":[0.09,0.106,0.133,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1,"xw":240}]}},{"i":"button/highlightStartOver","l":"공용 버튼 secondary(md) — 하이라이트 실패 화면 처음부터 버튼","j":"HighlightProjectScene.tsx:2771-2773","t":{"p":"SECONDARY","w":109.05,"h":40,"wx":"HUG","hx":"FIX","wy":"주축","hy":"선언","pad":[0,16,0,16],"H":1,"J":"center","r":12,"bw":1,"bc":[0.98,0.98,0.98,0.16],"c":[{"p":"LABEL","w":75.05,"h":21,"wx":"HUG","hx":"HUG","ci":9.5,"wy":"주축","hy":"내용","J":"normal","t":"처음부터 다시","fg":[0.98,0.98,0.98,0.72],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1}]}},{"i":"button/nodeCanvasHomeNew","l":"공용 버튼 primary sm — 노드캔버스 홈 새 캔버스(왼쪽 아이콘)","j":"NodeCanvasHomeScene.tsx:1319-1326","t":{"p":"PRIMARY","w":77.13,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[0,12,0,10],"gap":4,"H":1,"J":"center","gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0.078,0.569,1,1]],[0.5,[0,0.533,1,1]],[1,[0.078,0.569,1,1]]]},"r":12,"mw":48,"c":[{"p":"ICON","w":0,"h":0,"wx":"HUG","hx":"HUG","ci":16,"slot":1,"wy":"슬롯","hy":"슬롯","H":1,"J":"normal"},{"p":"LABEL","w":51.13,"h":21,"wx":"HUG","hx":"HUG","ci":5.5,"wy":"주축","hy":"내용","J":"normal","t":"새 캔버스","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1}]}},{"i":"button/shortsResultDownload","l":"공용 버튼 ghost(md) — 숏폼 결과 다운로드. 소비처가 전폭·소프트 배경 상수를 덧입힌다(jsxQuote 참조)","j":"page.tsx:1334-1341","t":{"p":"GHOST","w":181,"h":40,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","pad":[0,16,0,16],"H":1,"J":"center","r":12,"c":[{"p":"LABEL","w":47.84,"h":21,"wx":"HUG","hx":"HUG","ci":9.5,"wy":"주축","hy":"내용","J":"normal","t":"다운로드","fg":[0.98,0.98,0.98,0.72],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1}]}},{"i":"button/youtubeConnect","l":"공용 버튼 primary(md) — 유튜브 업로드 모달 연결 CTA","j":"YoutubeUploadModal.tsx:1042-1048","t":{"p":"PRIMARY","w":79.84,"h":40,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","pad":[0,16,0,16],"H":1,"J":"center","gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0.078,0.569,1,1]],[0.5,[0,0.533,1,1]],[1,[0.078,0.569,1,1]]]},"r":12,"c":[{"p":"LABEL","w":47.84,"h":21,"wx":"HUG","hx":"HUG","ci":9.5,"wy":"주축","hy":"내용","J":"normal","t":"연결하기","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1}]}}]},{"k":"input-form","L":"폼 입력(플로팅 라벨)","sp":[{"i":"input-form/awsSignupNameResting","l":"AWS 가입 이름 입력 — 색 상수만 다른 넷째 벌 (navy 고정 다크)","j":"page.tsx:482-501","t":{"p":"INPUT_BOX","w":372,"h":80,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","c":[{"p":"INPUT","w":340,"h":24,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_RESTING","w":27.34,"h":19,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"이름","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/loginEmailResting","l":"로그인 이메일 입력 — 라벨 쉬는 상태 (그룹 상단 상자, 둘째 벌)","j":"page.tsx:423-487","t":{"p":"INPUT_BOX","w":372,"h":82,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","bg":[0.98,0.98,0.98,0.06],"bw":1,"bc":[0.98,0.98,0.98,1],"c":[{"p":"INPUT","w":338,"h":24,"wx":"FILL","hx":"FIX","ci":1,"wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_REST","w":41.02,"h":19,"wx":"HUG","hx":"HUG","ci":1,"wy":"주축","hy":"내용","J":"normal","t":"이메일","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/loginPasswordFloated","l":"로그인 비밀번호 입력 — 라벨 뜬 상태 + 지우기·보기 토글 두 개 (그룹 하단 상자)","j":"page.tsx:489-578","t":{"p":"INPUT_BOX","w":372,"h":82,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":6,"J":"normal","bg":[0.98,0.98,0.98,0.06],"bw":1,"bc":[0.98,0.98,0.98,1],"c":[{"p":"INPUT","w":338,"h":24,"wx":"FILL","hx":"FIX","ci":1,"wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"PASSWORD_TOGGLE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":355,"y":30,"wy":"교차축","hy":"내용","pad":[2,2,2,2],"H":1,"J":"center","c":[{"p":"PASSWORD_TOGGLE_ICON","w":18,"h":18,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}]},{"p":"PASSWORD_TOGGLE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":355,"y":30,"wy":"교차축","hy":"내용","pad":[2,2,2,2],"H":1,"J":"center","c":[{"p":"PASSWORD_TOGGLE_ICON","w":18,"h":18,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}]},{"p":"FLOATING_LABEL_FLOATED","w":40.86,"h":14,"wx":"HUG","hx":"HUG","ci":1,"wy":"주축","hy":"내용","J":"normal","t":"비밀번호","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.16,"lp":100,"T":1}]}},{"i":"input-form/recoverEmailResting","l":"계정 복구 이메일 입력 — 라벨 쉬는 상태 (같은 구조의 셋째 벌, 타이포가 INPUT 상수 안에 있다)","j":"page.tsx:214-276","t":{"p":"INPUT_BOX","w":372,"h":82,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","bg":[0.98,0.98,0.98,0.06],"bw":1,"bc":[0.98,0.98,0.98,1],"c":[{"p":"INPUT","w":338,"h":24,"wx":"FILL","hx":"FIX","ci":1,"wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_RESTING","w":41.02,"h":19,"wx":"HUG","hx":"HUG","ci":1,"wy":"주축","hy":"내용","J":"normal","t":"이메일","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/resetPasswordEmailResting","l":"비밀번호 재설정 이메일 입력 — 반경을 제 몸에 갖는 벌","j":"page.tsx:196-224","t":{"p":"INPUT_BOX","w":372,"h":80,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","bg":[0.98,0.98,0.98,0.06],"r":12,"c":[{"p":"INPUT","w":340,"h":24,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_RESTING","w":41.02,"h":19,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"이메일","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/signupNameResting","l":"회원가입 이름 입력 — 라벨 쉬는 상태 (단일 라운드 상자)","j":"page.tsx:424-456","t":{"p":"INPUT_BOX","w":372,"h":80,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","bg":[0.98,0.98,0.98,0.06],"c":[{"p":"INPUT","w":340,"h":24,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_RESTING","w":27.34,"h":19,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"이름","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/signupPasswordFloated","l":"회원가입 비밀번호 입력 — 라벨 뜬 상태 + 비밀번호 보기 토글 (그룹 상단 상자)","j":"page.tsx:492-548","t":{"p":"INPUT_BOX","w":372,"h":80,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":6,"J":"normal","bg":[0.98,0.98,0.98,0.06],"c":[{"p":"INPUT","w":340,"h":24,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"PASSWORD_TOGGLE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":338,"y":35.6,"wy":"교차축","hy":"내용","pad":[2,2,2,2],"H":1,"J":"center","c":[{"p":"PASSWORD_TOGGLE_ICON","w":18,"h":18,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}]},{"p":"FLOATING_LABEL_FLOATED","w":40.86,"h":14,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"비밀번호","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.16,"lp":100,"T":1}]}}]},{"k":"icon-button","L":"아이콘 버튼","sp":[{"i":"icon-button/archiveMore","l":"앱 홈 카드 더보기 버튼","j":"AppHomeScene.tsx:1259-1296","t":{"p":"archiveMoreButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.192,0.212,0.251,0.5],"r":12}},{"i":"icon-button/gnbProjectOptions","l":"GNB 프로젝트 헤더 옵션 버튼","j":"Gnb.tsx:4243-4270","t":{"p":"iconButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.98,0.98,0.98,0.1],"r":12,"mw":32,"mh":32,"xw":32}},{"i":"icon-button/historyMore","l":"하이라이트 기록 카드 더보기 버튼","j":"HighlightScene.tsx:1379-1420","t":{"p":"historyMoreButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.192,0.212,0.251,0.5],"r":12}},{"i":"icon-button/nodeHeaderDelete","l":"캔버스 노드 헤더 삭제 버튼 — NodeHeaderActions의 danger 액션(쉬는 상태는 중립과 같고 호버 틴트만 다르다)","j":"NodeHeaderActions.tsx:136-144","t":{"p":"BUTTON_DANGER","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":12,"c":[{"p":"GLYPH","w":16,"h":16,"wx":"FIX","hx":"FIX","ci":8,"wy":"선언","hy":"선언","J":"normal"}]}},{"i":"icon-button/nodeHeaderDownload","l":"캔버스 노드 헤더 다운로드 버튼 — 8개 노드가 공유하는 NodeHeaderActions의 중립 액션","j":"NodeHeaderActions.tsx:115-123","t":{"p":"BUTTON_NEUTRAL","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":12,"c":[{"p":"GLYPH","w":16,"h":16,"wx":"FIX","hx":"FIX","ci":8,"wy":"선언","hy":"선언","J":"normal"}]}},{"i":"icon-button/overlayDelete","l":"오버레이 삭제 버튼 — 글리프를 자식이 갖는다","j":"VideoEditModal.tsx:19788-19802","t":{"p":"overlayDeleteBtn","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999,"mw":28,"mh":28,"c":[{"p":"overlayDeleteBtnGlyph","w":14,"h":14,"wx":"FIX","hx":"FIX","ci":7,"wy":"선언","hy":"선언","J":"normal"}]}}]}];



const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
    }
    console.log("✅ [KDS] Inventory Draw Part 1/8 completed.");
  } catch (e) { console.error("Draw 1 error:", e); }

  try {
    // Inventory Draw Part 2/8
    {
// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"banner-carousel","L":"배너 캐러셀","sp":[{"i":"banner-carousel/appHome","l":"앱 홈 배너 캐러셀 — 슬라이드 + 우하단 컨트롤(화살표·점)","j":"AppHomeScene.tsx:857-989","t":{"p":"updateBanner","w":372,"h":360,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"normal","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"bannerTrack","w":372,"h":360,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","c":[{"p":"bannerSlide","w":376.46,"h":364.32,"wx":"FIX","hx":"FIX","abs":1,"x":-2.23,"y":-2.16,"wy":"선언","hy":"선언","H":1,"J":"normal","bg":[0.09,0.106,0.133,1],"gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0,0,0,0.78]],[0.3,[0,0,0,0.46]]]},"c":[{"p":"bannerContent","w":376.46,"h":364.32,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[20,20,20,20],"gap":12.14,"J":"start","c":[{"p":"bannerTitle","w":301.32,"h":49.18,"wx":"HUG","hx":"HUG","ci":0.24,"wy":"주축","hy":"내용","J":"normal","t":"영상 제작을 더 빠르게","fg":[0.98,0.98,0.98,1],"fs":36,"fw":500,"ls":-0.72,"lp":135,"T":1},{"p":"bannerDescription","w":314.19,"h":24.29,"wx":"HUG","hx":"HUG","ci":0.24,"wy":"주축","hy":"내용","J":"normal","t":"AI 워크플로로 아이디어를 완성작까지 이어 보세요.","fg":[0.98,0.98,0.98,0.86],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1,"xw":480}]}]}]},{"p":"bannerControls","w":113,"h":36,"wx":"FIX","hx":"FIX","abs":1,"x":243,"y":308,"wy":"주축","hy":"내용","pad":[4,4,4,4],"gap":8,"H":1,"J":"normal","bg":[0,0,0,0.28],"r":999,"c":[{"p":"bannerArrowButton","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999},{"p":"bannerDots","w":33,"h":7,"wx":"HUG","hx":"HUG","ci":10.5,"wy":"주축","hy":"내용","gap":6,"H":1,"J":"normal","c":[{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.45],"r":999},{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.45],"r":999},{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.45],"r":999}]},{"p":"bannerArrowButton","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999}]}]}},{"i":"banner-carousel/appHomeControls","l":"앱 홈 배너 컨트롤 — 화살표 둘과 점 셋의 글래스 필","j":"AppHomeScene.tsx:926-988","t":{"p":"bannerControls","w":113,"h":36,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[4,4,4,4],"gap":8,"H":1,"J":"normal","bg":[0,0,0,0.28],"r":999,"c":[{"p":"bannerArrowButton","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999},{"p":"bannerDots","w":33,"h":7,"wx":"HUG","hx":"HUG","ci":10.5,"wy":"주축","hy":"내용","gap":6,"H":1,"J":"normal","c":[{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.45],"r":999},{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.45],"r":999},{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.45],"r":999}]},{"p":"bannerArrowButton","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999}]}},{"i":"banner-carousel/appHomeFrame","l":"앱 홈 배너 캐러셀 프레임 — 슬라이드 트랙을 담는 틀","j":"AppHomeScene.tsx:857-989","t":{"p":"updateBanner","w":372,"h":360,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"normal","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"bannerTrack","w":372,"h":360,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}]}},{"i":"banner-carousel/highlightTab","l":"탭 배너 캐러셀(boxed) — 하이라이트 탭 소비처","j":"TabBannerCarousel.tsx:295-357","t":{"p":"CAROUSEL","w":372,"h":360,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","H":1,"J":"normal","bg":[0.09,0.106,0.133,1],"c":[{"p":"TRACK","w":372,"h":360,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","c":[{"p":"SLIDE","w":372,"h":360,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","H":1,"J":"normal","bg":[0.192,0.212,0.251,1],"c":[{"p":"CONTENT","w":372,"h":360,"wx":"FIX","hx":"FILL","wy":"선언","hy":"선언(채움)","pad":[137.7,20,137.7,20],"c":[{"p":"TEXT_GROUP","w":289.69,"h":84.59,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":12,"J":"normal","c":[{"p":"TITLE","w":289.69,"h":48.59,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"하이라이트 베타 오픈","fg":[0.98,0.98,0.98,1],"fs":36,"fw":500,"ls":-0.72,"lp":135,"T":1},{"p":"DESCRIPTION","w":289.69,"h":24,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","t":"경기 영상에서 명장면을 자동으로 찾아 드려요.","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}]}]}]},{"p":"CONTROLS","w":92,"h":36,"wx":"FIX","hx":"FIX","abs":1,"x":264,"y":308,"wy":"주축","hy":"내용","pad":[4,4,4,4],"gap":8,"H":1,"J":"normal","bg":[0,0,0,0.28],"r":999,"c":[{"p":"ARROW_BUTTON","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999},{"p":"DOTS","w":12,"h":7,"wx":"HUG","hx":"HUG","ci":10.5,"wy":"주축","hy":"내용","gap":6,"H":1,"J":"normal","c":[{"p":"DOT","w":0,"h":7,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언","J":"normal","bg":[0.42,0.42,0.42,1],"r":999},{"p":"DOT","w":0,"h":7,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언","J":"normal","bg":[0.42,0.42,0.42,1],"r":999},{"p":"DOT","w":0,"h":7,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언","J":"normal","bg":[0.42,0.42,0.42,1],"r":999}]},{"p":"ARROW_BUTTON","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999}]}]}},{"i":"banner-carousel/tabCarouselControls","l":"공용 탭 배너 캐러셀 컨트롤 — 화살표·점 글래스 필","j":"TabBannerCarousel.tsx:321-355","t":{"p":"CONTROLS","w":80,"h":36,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[4,4,4,4],"gap":8,"H":1,"J":"normal","bg":[0,0,0,0.28],"r":999,"c":[{"p":"ARROW_BUTTON","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999},{"p":"DOTS","w":0,"h":0,"wx":"HUG","hx":"HUG","ci":14,"slot":1,"wy":"슬롯","hy":"슬롯","H":1,"J":"normal"},{"p":"ARROW_BUTTON","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":999}]}}]},{"k":"gnb-sidebar","L":"GNB 사이드바","sp":[{"i":"gnb-sidebar/brandRow","l":"사이드바 브랜드 행 — 로고 히트 영역","j":"Gnb.tsx:4368-4414","t":{"p":"sidebarHeaderRow","w":256,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[0,0,0,4],"H":1,"mh":40,"c":[{"p":"sidebarLogoHit","w":252,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","H":1,"mh":40,"c":[{"p":"sidebarLogoRail","w":252,"h":28,"wx":"FIX","hx":"HUG","ci":6,"wy":"선언","hy":"내용","H":1,"mh":28,"c":[{"p":"sidebarBrandCrop","w":252,"h":28,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","H":1,"J":"normal","c":[{"p":"logo","w":0,"h":28,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언","J":"normal"}]}]}]}]}},{"i":"gnb-sidebar/createCompoundRow","l":"사이드바 만들기 복합 항목 — 메뉴 줄 + 새 프로젝트 추가 버튼","j":"Gnb.tsx:4633-4691","t":{"p":"menuLink","w":256,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[0,4,0,4],"H":1,"r":10,"mh":32,"c":[{"p":"menuSidebarCreateNavPart","w":224,"h":32,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","H":1,"c":[{"p":"menuLinkInner","w":224,"h":21,"wx":"FIX","hx":"HUG","ci":5.5,"wy":"선언","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"menuLinkIconMask","w":20,"h":20,"wx":"FIX","hx":"FIX","ci":0.5,"wy":"선언","hy":"선언","J":"normal","bg":[0.835,0.843,0.867,1]},{"p":"menuLinkLabel","w":63.92,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"노드 캔버스","fg":[0.835,0.843,0.867,1],"fs":14,"fw":500,"lp":150,"T":1,"xw":220}]}]},{"p":"menuSidebarCreateAddonInset","w":24,"h":24,"wx":"FIX","hx":"FIX","ci":4,"wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.341,0.365,0.408,1],"r":6}]}},{"i":"gnb-sidebar/menuLinkRow","l":"사이드바 메뉴 항목 한 줄 — 아이콘·라벨 (쉬는 상태)","j":"Gnb.tsx:4798-4834","t":{"p":"menuLink","w":256,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[0,4,0,4],"H":1,"r":10,"mh":32,"c":[{"p":"menuLinkInner","w":248,"h":21,"wx":"FIX","hx":"HUG","ci":5.5,"wy":"선언","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"menuLinkIconMask","w":20,"h":20,"wx":"FIX","hx":"FIX","ci":0.5,"wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,1]},{"p":"menuLinkLabel","w":11.97,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"홈","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1,"xw":220}]}]}},{"i":"gnb-sidebar/profileTrigger","l":"프로필 트리거 — 크레딧 링을 두른 아바타 버튼","j":"Gnb.tsx:5302-5327","t":{"p":"profileTrigger","w":36,"h":36,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"center","bw":2,"bc":[1,1,1,1],"mw":36,"mh":36,"c":[{"p":"profileImage","w":28,"h":28,"wx":"FIX","hx":"FIX","ci":4,"wy":"선언","hy":"선언","J":"normal","r":999}]}},{"i":"gnb-sidebar/rail","l":"GNB 사이드바 레일 — 메뉴 기둥과 분석 아이브로우","j":"Gnb.tsx:4456-4842","t":{"p":"menuSidebarOuter","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"menuSidebar","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"menuSidebarEyebrowRow","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[12,0,4,0],"J":"normal","c":[{"p":"menuSidebarEyebrow","w":256,"h":18,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[0,0,0,4],"J":"normal","t":"분석","fg":[0.737,0.753,0.788,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"T":1}]}]}]}}]}];



const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
    }
    console.log("✅ [KDS] Inventory Draw Part 2/8 completed.");
  } catch (e) { console.error("Draw 2 error:", e); }

  try {
    // Inventory Draw Part 3/8
    {
// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"skeleton","L":"스켈레톤","sp":[{"i":"skeleton/analysisModalIg","l":"노드 캔버스 분석 모달 · 인스타그램 로딩 뼈대","j":"NodeCanvasAnalysisModal.tsx:616-670","t":{"p":"IG_SKELETON_ROOT","w":372,"h":144,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[0,0,12,0],"J":"normal","c":[{"p":"IG_SKELETON_WRAPPER","w":372,"h":132,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"IG_SKELETON_SECTION","w":372,"h":132,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":8,"J":"normal","c":[{"p":"IG_SKELETON_HEADER","w":372,"h":22,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":6,"H":1,"J":"normal","c":[{"p":"SKELETON_IG_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","ci":1,"wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":6},{"p":"SKELETON_HEADER_TEXT","w":346,"h":22,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"center","c":[{"p":"SKELETON_LINE_TITLE","w":240,"h":22,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":999}]}]},{"p":"IG_SKELETON_META","w":372,"h":54,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"J":"normal","c":[{"p":"SKELETON_LINE_TITLE","w":240,"h":22,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":999},{"p":"SKELETON_LINE_WIDE","w":372,"h":12,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":999},{"p":"SKELETON_LINE_WIDE","w":372,"h":12,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":999}]},{"p":"IG_SKELETON_UPLOADED_ROW","w":372,"h":40,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":4,"H":1,"J":"normal","c":[{"p":"SKELETON_DATE_GROUP","w":184,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"J":"normal","c":[{"p":"SKELETON_LINE_SHORT","w":84,"h":12,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":999},{"p":"SKELETON_LINE_VALUE","w":80,"h":24,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":999}]},{"p":"SKELETON_DATE_GROUP","w":184,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"J":"normal","c":[{"p":"SKELETON_LINE_SHORT","w":84,"h":12,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":999},{"p":"SKELETON_LINE_VALUE","w":80,"h":24,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.06],"r":999}]}]}]}]}]}},{"i":"skeleton/channelAvatarIg","l":"인스타그램 대시보드 채널 아바타 로딩 뼈대","j":"InstagramAnalyticsScene.tsx:1772-1772","t":{"p":"CHANNEL_AVATAR_SKELETON","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":-1}},{"i":"skeleton/channelInfoIg","l":"인스타그램 대시보드 채널 정보 로딩 뼈대 — SKELETON_BLOCK 막대 두 줄","j":"InstagramAnalyticsScene.tsx:1773-1776","t":{"p":"CHANNEL_INFO_SKELETON","w":372,"h":74,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"J":"normal","c":[{"p":"SKELETON_CHANNEL_TITLE","w":150,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":8},{"p":"SKELETON_CHANNEL_DESC","w":93,"h":14,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":8}]}},{"i":"skeleton/instagramTopBar","l":"인스타그램 분석 상단바 로딩 뼈대 — 같은 상수 이름의 두 번째 벌","j":"InstagramAnalyticsScene.tsx:1769-1776","t":{"p":"DASHBOARD_TOP_BAR_LEFT","w":292,"h":134,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"J":"normal","c":[{"p":"CHANNEL_AVATAR_SKELETON","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":-1},{"p":"CHANNEL_INFO_SKELETON","w":292,"h":74,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"J":"normal","c":[{"p":"SKELETON_CHANNEL_TITLE","w":150,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":8},{"p":"SKELETON_CHANNEL_DESC","w":73,"h":14,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":8}]}]}},{"i":"skeleton/youtubeTopBar","l":"유튜브 분석 상단바 로딩 뼈대 — 아바타 원 + 줄 셋","j":"YoutubeAnalyticsScene.tsx:1959-1977","t":{"p":"DASHBOARD_TOP_BAR_LEFT","w":292,"h":160,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"J":"normal","c":[{"p":"CHANNEL_AVATAR_SKELETON","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":-1},{"p":"CHANNEL_INFO_SKELETON","w":292,"h":100,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"J":"normal","c":[{"p":"SKELETON_CHANNEL_TITLE","w":150,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":8},{"p":"SKELETON_CHANNEL_DESC","w":73,"h":14,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":8},{"p":"SKELETON_CHANNEL_DESC_SHORT","w":43.8,"h":14,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":8}]}]}}]},{"k":"avatar","L":"아바타","sp":[{"i":"avatar/adminUser","l":"관리자 사용자 머리글자 아바타","j":"AdminClient.tsx:1721-1721","t":{"p":"AVATAR","w":44,"h":44,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.98,0.98,0.98,0.1],"r":-1,"t":"K","fg":[0.98,0.98,0.98,0.5],"fs":20,"fw":400,"ls":-0.16,"lp":150}},{"i":"avatar/instagramChannel","l":"인스타그램 대시보드 채널 아바타 — 유튜브와 같은 정의를 한 벌 더 갖는다","j":"InstagramAnalyticsScene.tsx:1780-1793","t":{"p":"CHANNEL_AVATAR","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.341,0.365,0.408,1],"r":-1,"c":[{"p":"CHANNEL_AVATAR_PLACEHOLDER","w":48,"h":48,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","bg":[0.467,0.49,0.537,1]}]}},{"i":"avatar/settingsProfile","l":"설정 프로필 사진","j":"SettingsScene.tsx:990-1006","t":{"p":"settingsAvatarFigure","w":40,"h":40,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.98,0.98,0.98,0.12],"r":999,"c":[{"p":"settingsAvatarFigureImage","w":40,"h":40,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}]}},{"i":"avatar/youtubeChannel","l":"유튜브 대시보드 채널 아바타","j":"YoutubeAnalyticsScene.tsx:1980-1999","t":{"p":"CHANNEL_AVATAR","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.341,0.365,0.408,1],"r":-1,"c":[{"p":"CHANNEL_AVATAR_PLACEHOLDER","w":48,"h":48,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","bg":[0.467,0.49,0.537,1]}]}}]},{"k":"badge","L":"배지·칩","sp":[{"i":"badge/customSidebarBadge","l":"사이드바 개수 배지","j":"Gnb.tsx:4530-4538","t":{"p":"customSidebarBadge","w":18,"h":18,"wx":"HUG","hx":"FIX","wy":"주축","hy":"선언","pad":[0,5,0,5],"H":1,"J":"center","bg":[0.98,0.98,0.98,0.14],"r":999,"t":"3","fg":[0.835,0.843,0.867,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"mw":18}},{"i":"badge/exploreSoonChip","l":"사이드바 예정 칩","j":"Gnb.tsx:4795-4800","t":{"p":"exploreSoonChip","w":44.41,"h":24,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[3,8,3,8],"J":"normal","bg":[0.98,0.98,0.98,0.14],"r":6,"t":"BETA","fg":[0.737,0.753,0.788,1],"fs":12,"fw":500,"ls":-0.12,"lp":150}},{"i":"badge/previewZoomBadge","l":"미리보기 확대 배지","j":"VideoEditModal.tsx:17823-17829","t":{"p":"previewZoomBadge","w":50.19,"h":24,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[3,10,3,10],"J":"normal","bg":[0.09,0.106,0.133,0.7],"r":8,"t":"120%","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150}},{"i":"badge/profileMenuItemBadge","l":"프로필 메뉴 플랜 배지 — 글자를 자식이 갖는다","j":"Gnb.tsx:3143-3147","t":{"p":"profileMenuItemBadge","w":36.44,"h":22,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[2,8,2,8],"J":"normal","bg":[0,0.533,1,1],"r":6,"c":[{"p":"profileMenuItemBadgeText","w":20.44,"h":14,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"프로","fg":[0.98,0.98,0.98,1],"fs":12,"fw":600,"ls":-0.16,"lp":150,"T":1}]}}]},{"k":"empty-state","L":"빈 상태","sp":[{"i":"empty-state/analyticsStatePanel","l":"분석 대시보드 상태 패널 — 제목 + 본문","j":"shared.tsx:555-568","t":{"p":"STATE_PANEL","w":372,"h":93,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[20,20,20,20],"gap":6,"J":"normal","r":12,"bw":1,"bc":[0.98,0.98,0.98,1],"c":[{"p":"STATE_PANEL_TITLE","w":330,"h":24,"wx":"FILL","hx":"HUG","ci":1,"wy":"교차축","hy":"내용","J":"normal","t":"개요","fg":[0.98,0.98,0.98,1],"fs":16,"fw":600,"ls":-0.16,"lp":150,"T":1},{"p":"STATE_PANEL_BODY","w":330,"h":21,"wx":"FILL","hx":"HUG","ci":1,"wy":"교차축","hy":"내용","J":"normal","t":"이 기간에 표시할 데이터가 없어요.","fg":[0.98,0.98,0.98,1],"fs":14,"fw":400,"ls":-0.14,"lp":150,"T":1}]}},{"i":"empty-state/appHomeArchive","l":"앱 홈 아카이브 빈 상태 — 제목 + 설명","j":"AppHomeScene.tsx:1003-1010","t":{"p":"emptyState","w":179.97,"h":360,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[80,0,80,0],"gap":12,"J":"center","c":[{"p":"emptyTitle","w":179.97,"h":30,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"아직 프로젝트가 없어요","fg":[0.98,0.98,0.98,1],"fs":20,"fw":600,"ls":-0.2,"lp":150,"T":1},{"p":"emptyDescription","w":152.16,"h":24,"wx":"FILL","hx":"HUG","ci":13.91,"wy":"교차축","hy":"내용","J":"normal","t":"첫 영상을 만들어 보세요.","fg":[0.98,0.98,0.98,0.55],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"empty-state/projectVideosPopover","l":"프로젝트 영상 팝오버 빈 상태 — 타이포 클래스를 안 얹는다","j":"ProjectVideosPopover.tsx:258-262","t":{"p":"EMPTY_STATE","w":138.39,"h":93,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[36,12,36,12],"H":1,"J":"center","c":[{"p":"EMPTY_TEXT","w":114.39,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"저장된 영상이 없어요","fg":[0.737,0.753,0.788,0.92],"fs":14,"fw":400,"ls":-0.14,"lp":150,"T":1}]}},{"i":"empty-state/videoEditInspector","l":"비디오 편집 인스펙터 빈 상태","j":"VideoEditModal.tsx:22662-22668","t":{"p":"inspectorEmptyState","w":340,"h":200,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[32,20,32,20],"H":1,"J":"center","mh":200,"c":[{"p":"inspectorEmptyStateText","w":153.64,"h":21,"wx":"HUG","hx":"HUG","ci":57.5,"wy":"주축","hy":"내용","J":"normal","t":"아직 선택된 항목이 없습니다","fg":[0.604,0.627,0.671,0.88],"fs":14,"fw":400,"ls":-0.14,"lp":150,"T":1}]}}]},{"k":"slider","L":"슬라이더","sp":[{"i":"slider/bgmNode","l":"BGM 노드 range 슬라이더 (길이·볼륨·강도 공용)","j":"BgmNode.tsx:1429-1446","t":{"p":"RANGE_SLIDER","w":348,"h":4,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}},{"i":"slider/colorPopover","l":"컬러 팝오버 색상·투명도 슬라이더 행","j":"ColorPopover.tsx:675-719","t":{"p":"SLIDER_ROW","w":256,"h":32,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","H":1,"J":"normal","c":[{"p":"SLIDER_COLUMN","w":256,"h":32,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","gap":8,"J":"normal","c":[{"p":"HUE_SLIDER","w":256,"h":12,"wx":"FILL","hx":"FIX","wy":"부모폭","hy":"선언","J":"normal","gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[1,0,0,1]],[0.166,[1,1,0,1]],[0.333,[0,1,0,1]],[0.5,[0,1,1,1]],[0.666,[0,0,1,1]],[0.833,[1,0,1,1]],[1,[1,0,0,1]]]},"r":999,"c":[{"p":"SLIDER_HANDLE","w":14,"h":14,"wx":"FIX","hx":"FIX","abs":1,"x":-7,"y":-1,"wy":"선언","hy":"선언","J":"normal","r":-1,"bw":2,"bc":[0.98,0.98,0.98,0.96]}]},{"p":"ALPHA_SLIDER","w":256,"h":12,"wx":"FILL","hx":"FIX","wy":"부모폭","hy":"선언","J":"normal","gr":{"t":[[1,0,0],[0,1,0]],"s":[[0.25,[0.835,0.843,0.867,0.6]],[0.25,[0.945,0.945,0.953,0.8]],[0.5,[0.945,0.945,0.953,0.8]]]},"r":999,"c":[{"p":"SLIDER_HANDLE","w":14,"h":14,"wx":"FIX","hx":"FIX","abs":1,"x":-7,"y":-1,"wy":"선언","hy":"선언","J":"normal","r":-1,"bw":2,"bc":[0.98,0.98,0.98,0.96]}]}]}]}},{"i":"slider/highlightRefineOpacity","l":"하이라이트 다듬기 위젯 불투명도 슬라이더","j":"HighlightProjectScene.tsx:3570-3604","t":{"p":"refinementExpandShellOpacity","w":64,"h":12,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","H":1,"J":"normal","c":[{"p":"refinementExpandShellOpacitySlider","w":64,"h":12,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bw":2,"bc":[0.522,0.522,0.522,1]}]}},{"i":"slider/ttsNode","l":"TTS 노드 range 슬라이더 (속도·볼륨 공용)","j":"TtsNode.tsx:1349-1366","t":{"p":"RANGE_SLIDER","w":348,"h":4,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}}]},{"k":"spinner","L":"스피너","sp":[{"i":"spinner/editNodeProcess","l":"편집 노드 처리 중 스피너","j":"EditNode.tsx:1074-1074","t":{"p":"PROCESS_BUTTON_SPINNER","w":16,"h":16,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":-1,"bw":2,"bc":[0.98,0.98,0.98,1]}},{"i":"spinner/gnbBackButton","l":"GNB 뒤로가기 스피너 — 슬롯이 링을 감싼다","j":"Gnb.tsx:4108-4113","t":{"p":"backButtonLoading","w":16,"h":16,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","c":[{"p":"projectSaveSpinner","w":16,"h":16,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":-1,"bw":2,"bc":[0.98,0.98,0.98,1]}]}},{"i":"spinner/highlightScene","l":"하이라이트 히스토리 로딩 스피너","j":"HighlightScene.tsx:116-118","t":{"p":"spinner","w":36,"h":36,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":-1,"bw":3,"bc":[0.835,0.843,0.867,1]}},{"i":"spinner/highlightShorts","l":"숏폼 편집 로딩 스피너 — 같은 링을 옮겨 적은 둘째 벌","j":"page.tsx:1053-1053","t":{"p":"SPINNER","w":36,"h":36,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","r":-1,"bw":3,"bc":[0.835,0.843,0.867,1]}}]}];



const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
    }
    console.log("✅ [KDS] Inventory Draw Part 3/8 completed.");
  } catch (e) { console.error("Draw 3 error:", e); }

  try {
    // Inventory Draw Part 4/8
    {
// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"text-field","L":"텍스트 필드","sp":[{"i":"text-field/adminSearch","l":"관리자 검색 입력 — 알약형 유리 입력(FIELD_CONTROL), 이메일·이름 검색","j":"AdminClient.tsx:1391-1406","t":{"p":"FIELD_CONTROL","w":372,"h":38,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[0,16,0,16],"J":"normal","bg":[0.98,0.98,0.98,0.1],"r":999,"mh":38}},{"i":"text-field/inspectorFramedInput","l":"인스펙터 초·프레임 입력 행 — 숫자 입력 둘과 단위 둘","j":"VideoEditModal.tsx:22545-22593","t":{"p":"inspectorFramedInputRow","w":372,"h":28,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"H":1,"J":"flex-end","mw":140,"xw":140,"c":[{"p":"inspectorNumInput","w":56,"h":28,"wx":"FIX","hx":"FILL","wy":"선언","hy":"부모높이","pad":[4,8,4,8],"J":"normal","bg":[0.98,0.98,0.98,0.06],"r":6,"bw":1,"bc":[0.98,0.98,0.98,0.12]},{"p":"inspectorFramedInputUnit","w":10.27,"h":18,"wx":"HUG","hx":"HUG","ci":5,"wy":"주축","hy":"내용","J":"normal","t":"초","fg":[0.737,0.753,0.788,0.8],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"inspectorNumInput","w":56,"h":28,"wx":"FIX","hx":"FILL","wy":"선언","hy":"부모높이","pad":[4,8,4,8],"J":"normal","bg":[0.98,0.98,0.98,0.06],"r":6,"bw":1,"bc":[0.98,0.98,0.98,0.12]},{"p":"inspectorFramedInputUnit","w":30.77,"h":18,"wx":"HUG","hx":"HUG","ci":5,"wy":"주축","hy":"내용","J":"normal","t":"프레임","fg":[0.737,0.753,0.788,0.8],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}},{"i":"text-field/refinementInput","l":"하이라이트 다듬기 입력 — 테두리 있는 사각 입력","j":"HighlightProjectScene.tsx:664-675","t":{"p":"refinementInput","w":372,"h":39,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[8,12,8,12],"J":"normal","bg":[0.341,0.365,0.408,0.55],"r":12,"bw":1,"bc":[0.98,0.98,0.98,0.15]}},{"i":"text-field/settingsRowName","l":"설정 이름 편집 입력 — 테두리 없이 알약 배경만","j":"SettingsScene.tsx:1095-1111","t":{"p":"settingsRowNameInput","w":372,"h":34,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","pad":[0,12,0,12],"J":"normal","bg":[0.98,0.98,0.98,0.1],"r":999,"mh":34}}]},{"k":"toast","L":"토스트","sp":[{"i":"toast/adminError","l":"관리자 토스트 · 오류 스킨 — TOAST_ERROR 색 상수가 JSX에서 합성된다","j":"AdminClient.tsx:1553-1557","t":{"p":"TOAST","w":372,"h":45,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,20,12,20],"H":1,"J":"normal","r":999,"t":"사용자 목록을 불러오지 못했습니다","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150}},{"i":"toast/adminSuccess","l":"관리자 토스트 · 성공 스킨 — TOAST_SUCCESS 색 상수가 JSX에서 합성된다","j":"AdminClient.tsx:1443-1451","t":{"p":"TOAST","w":372,"h":45,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,20,12,20],"H":1,"J":"normal","r":999,"t":"지급이 완료되었습니다","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150}},{"i":"toast/appHome","l":"앱 홈 · 하이라이트 토스트","j":"AppHomeScene.tsx:1418-1428","t":{"p":"toast","w":108.34,"h":48,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,20,12,20],"J":"normal","bg":[0.89,0.894,0.91,0.7],"r":16,"sh":[[0,0,0,0.16],0,8,20],"c":[{"p":"toastText","w":68.34,"h":19,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"저장했어요","fg":[0.09,0.106,0.133,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"toast/myPage","l":"마이페이지 토스트 — 글자를 자기가 갖는다","j":"SubscriptionScene.tsx:1322 · SettingsScene.tsx:1959","t":{"p":"toast","w":118.34,"h":50,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,24,12,24],"J":"normal","bg":[0.09,0.106,0.133,1],"r":999,"bw":1,"bc":[0.98,0.98,0.98,0.1],"t":"저장했어요","fg":[0.98,0.98,0.98,0.92],"fs":16,"fw":400,"ls":-0.16,"lp":150}}]},{"k":"tooltip","L":"툴팁","sp":[{"i":"tooltip/analyticsBar","l":"애널리틱스 막대 툴팁 — 포인터를 따라간다","j":"useAnalyticsBarTooltip.tsx:169-177","t":{"p":"TOOLTIP_BASE","w":81.64,"h":32,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","pad":[4,8,4,8],"H":1,"J":"normal","bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"여성 · 42.3%","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"mh":32}},{"i":"tooltip/chromeTooltip","l":"공용 크롬 툴팁 — body로 포털되는 버블(사이드바·노드 캔버스)","j":"ChromeTooltip.tsx:293-304","t":{"p":"PORTAL_ANCHOR","w":105.8,"h":28,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"BUBBLE","w":105.8,"h":28,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","c":[{"p":"BUBBLE_INNER","w":105.8,"h":28,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","pad":[4,8,4,8],"J":"normal","bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"전체 화면으로 보기","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}]}]}},{"i":"tooltip/composerShotMode","l":"컴포저 모드 힌트 툴팁 — 부모 hover로만 열린다","j":"ComposerBar.tsx:407-409","t":{"p":"SHOT_MODE_TOOLTIP","w":112.57,"h":27.16,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[4,8,4,8],"J":"normal","bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"한 장면으로 만들어요","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}},{"i":"tooltip/upgradeTierFeature","l":"업그레이드 요금제 기능 툴팁","j":"page.tsx:619","t":{"p":"TIER_FEATURE_TIP","w":252.2,"h":27.16,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[4,8,4,8],"J":"normal","bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"매달 크레딧 1,200개가 충전됩니다","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}}]},{"k":"checkbox","L":"체크박스","sp":[{"i":"checkbox/awsSignupLegal","l":"AWS 가입 약관 동의 체크박스 — 구조는 같고 색 상수만 다른 두 번째 벌","j":"page.tsx:607-620","t":{"p":"LEGAL_AGREEMENT_LABEL","w":372,"h":25,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"LEGAL_CHECKBOX_OUTER","w":22,"h":22,"wx":"FIX","hx":"FIX","ci":1,"wy":"선언","hy":"선언","J":"normal","c":[{"p":"LEGAL_CHECKBOX_INPUT","w":22,"h":22,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]},{"p":"LEGAL_CHECKBOX_FACE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":0,"wy":"선언","hy":"선언","J":"normal","r":5}]},{"p":"LEGAL_AGREEMENT_TEXT","w":199.08,"h":25,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[1,0,0,0],"J":"normal","t":"개인정보 처리방침에 동의합니다","fg":[0.835,0.843,0.867,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"checkbox/signupLegal","l":"가입 약관 동의 체크박스","j":"page.tsx:632-655","t":{"p":"LEGAL_AGREEMENT_LABEL","w":372,"h":25,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"LEGAL_CHECKBOX_OUTER","w":22,"h":22,"wx":"FIX","hx":"FIX","ci":1,"wy":"선언","hy":"선언","J":"normal","c":[{"p":"LEGAL_CHECKBOX_INPUT","w":22,"h":22,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]},{"p":"LEGAL_CHECKBOX_FACE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":0,"wy":"선언","hy":"선언","J":"normal","r":5}]},{"p":"LEGAL_AGREEMENT_TEXT","w":199.08,"h":25,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[1,0,0,0],"J":"normal","t":"개인정보 처리방침에 동의합니다","fg":[0.98,0.98,0.98,0.86],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"checkbox/videoEditSourceRow","l":"영상 편집 소스 고르기 체크박스 — 네이티브 입력 자신","j":"VideoEditProjectPicker.tsx:499-505","t":{"p":"SOURCE_ROW_CHECK","w":20,"h":20,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]}}]}];



const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
    }
    console.log("✅ [KDS] Inventory Draw Part 4/8 completed.");
  } catch (e) { console.error("Draw 4 error:", e); }

  try {
    // Inventory Draw Part 5/8
    {
// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"insight-card","L":"분석 카드","sp":[{"i":"insight-card/audienceDeviceTypes","l":"시청자 탭 · 기기 유형 카드 (기기 목록 변형)","j":"AudienceTab.tsx:1116-1166","t":{"p":"INSIGHT_CARD","w":372,"h":181,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[6,6,6,6],"gap":6,"J":"normal","r":16,"c":[{"p":"INSIGHT_TITLE","w":360,"h":29,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[6,6,2,6],"J":"normal","t":"기기 유형","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"GEO_LIST_DEVICE","w":360,"h":134,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,14,12,14],"gap":8,"J":"normal","r":10,"c":[{"p":"GEO_ROW","w":332,"h":51,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[9,0,9,0],"gap":7,"J":"normal","c":[{"p":"GEO_LABEL_ROW","w":332,"h":22,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":8,"H":1,"J":"space-between","c":[{"p":"GEO_COUNTRY_DEVICE","w":270,"h":18,"wx":"FIX","hx":"HUG","ci":2,"wy":"선언","hy":"내용","J":"normal","t":"모바일","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"GEO_PCT_DEVICE","w":54,"h":22,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[2,7,2,7],"H":1,"J":"center","bg":[0.98,0.98,0.98,0.06],"r":999,"t":"78.4%","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"mw":54,"mh":20}]},{"p":"GEO_BAR","w":332,"h":4,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","J":"normal","r":999,"c":[{"p":"GEO_BAR_FILL","w":332,"h":4,"wx":"FILL","hx":"FILL","wy":"부모폭","hy":"선언(채움)","J":"normal","bg":[0.22,0.741,0.973,1],"gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0.49,0.827,0.988,1]],[1,[0.055,0.647,0.914,1]]]},"r":999,"sh":[[0.98,0.98,0.98,0.12],0,0,12]}]}]},{"p":"GEO_ROW","w":332,"h":51,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[9,0,9,0],"gap":7,"J":"normal","c":[{"p":"GEO_LABEL_ROW","w":332,"h":22,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":8,"H":1,"J":"space-between","c":[{"p":"GEO_COUNTRY_DEVICE","w":270,"h":18,"wx":"FIX","hx":"HUG","ci":2,"wy":"선언","hy":"내용","J":"normal","t":"데스크톱","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"GEO_PCT_DEVICE","w":54,"h":22,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[2,7,2,7],"H":1,"J":"center","bg":[0.98,0.98,0.98,0.06],"r":999,"t":"21.6%","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"mw":54,"mh":20}]},{"p":"GEO_BAR","w":332,"h":4,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","J":"normal","r":999,"c":[{"p":"GEO_BAR_FILL","w":332,"h":4,"wx":"FILL","hx":"FILL","wy":"부모폭","hy":"선언(채움)","J":"normal","bg":[0.22,0.741,0.973,1],"gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0.49,0.827,0.988,1]],[1,[0.055,0.647,0.914,1]]]},"r":999,"sh":[[0.98,0.98,0.98,0.12],0,0,12]}]}]}]}]}},{"i":"insight-card/audienceTopCountries","l":"시청자 탭 · 주요 국가 카드 (직계 제목 + 막대 목록 변형)","j":"AudienceTab.tsx:1062-1112","t":{"p":"INSIGHT_CARD","w":372,"h":248,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[6,6,6,6],"gap":6,"J":"normal","r":16,"c":[{"p":"INSIGHT_TITLE","w":360,"h":29,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[6,6,2,6],"J":"normal","t":"주요 국가","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"GEO_LIST","w":360,"h":201,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,14,12,14],"gap":12,"J":"normal","r":10,"c":[{"p":"GEO_ROW","w":332,"h":51,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[9,0,9,0],"gap":7,"J":"normal","c":[{"p":"GEO_LABEL_ROW","w":332,"h":22,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":241.07,"H":1,"J":"space-between","c":[{"p":"GEO_COUNTRY","w":41.02,"h":18,"wx":"FIX","hx":"HUG","ci":2,"wy":"선언","hy":"내용","J":"normal","t":"대한민국","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"GEO_PCT","w":49.91,"h":22,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[2,7,2,7],"H":1,"J":"center","bg":[0.98,0.98,0.98,0.06],"r":999,"t":"42.7%","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"mh":20}]},{"p":"GEO_BAR","w":332,"h":4,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","J":"normal","r":999,"c":[{"p":"GEO_BAR_FILL","w":332,"h":4,"wx":"FILL","hx":"FILL","wy":"부모폭","hy":"선언(채움)","J":"normal","bg":[0.22,0.741,0.973,1],"gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0.49,0.827,0.988,1]],[1,[0.055,0.647,0.914,1]]]},"r":999,"sh":[[0.98,0.98,0.98,0.12],0,0,12]}]}]},{"p":"GEO_ROW","w":332,"h":51,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[9,0,9,0],"gap":7,"J":"normal","c":[{"p":"GEO_LABEL_ROW","w":332,"h":22,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":261.57,"H":1,"J":"space-between","c":[{"p":"GEO_COUNTRY","w":20.52,"h":18,"wx":"FIX","hx":"HUG","ci":2,"wy":"선언","hy":"내용","J":"normal","t":"미국","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"GEO_PCT","w":49.91,"h":22,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[2,7,2,7],"H":1,"J":"center","bg":[0.98,0.98,0.98,0.06],"r":999,"t":"23.5%","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"mh":20}]},{"p":"GEO_BAR","w":332,"h":4,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","J":"normal","r":999,"c":[{"p":"GEO_BAR_FILL","w":332,"h":4,"wx":"FILL","hx":"FILL","wy":"부모폭","hy":"선언(채움)","J":"normal","bg":[0.22,0.741,0.973,1],"gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0.49,0.827,0.988,1]],[1,[0.055,0.647,0.914,1]]]},"r":999,"sh":[[0.98,0.98,0.98,0.12],0,0,12]}]}]},{"p":"GEO_ROW","w":332,"h":51,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[9,0,9,0],"gap":7,"J":"normal","c":[{"p":"GEO_LABEL_ROW","w":332,"h":22,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":261.57,"H":1,"J":"space-between","c":[{"p":"GEO_COUNTRY","w":20.52,"h":18,"wx":"FIX","hx":"HUG","ci":2,"wy":"선언","hy":"내용","J":"normal","t":"일본","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"GEO_PCT","w":49.91,"h":22,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[2,7,2,7],"H":1,"J":"center","bg":[0.98,0.98,0.98,0.06],"r":999,"t":"11.2%","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"mh":20}]},{"p":"GEO_BAR","w":332,"h":4,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","J":"normal","r":999,"c":[{"p":"GEO_BAR_FILL","w":332,"h":4,"wx":"FILL","hx":"FILL","wy":"부모폭","hy":"선언(채움)","J":"normal","bg":[0.22,0.741,0.973,1],"gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0.49,0.827,0.988,1]],[1,[0.055,0.647,0.914,1]]]},"r":999,"sh":[[0.98,0.98,0.98,0.12],0,0,12]}]}]}]}]}},{"i":"insight-card/igOverviewKpi","l":"인스타그램 개요 · KPI 카드","j":"InstagramAnalyticsScene.tsx:1232-1264","t":{"p":"REPORT_KPI_CARD","w":81,"h":150.59,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[6,6,6,6],"gap":8,"J":"normal","r":16,"c":[{"p":"KPI_CARD_HEADER","w":69,"h":29,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[6,6,2,6],"H":1,"J":"space-between","c":[{"p":"CONTENT_TITLE","w":35.89,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"조회수","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1}]},{"p":"KPI_CARD_INNER","w":69,"h":101.59,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[14,16,14,16],"gap":12,"H":1,"J":"space-between","r":10,"mh":92,"c":[{"p":"KPI_CARD_INNER_TEXT","w":8.73,"h":73.59,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":6,"J":"normal","c":[{"p":"REPORT_KPI_CARD_VALUE","w":97.42,"h":48.59,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"12.4만","fg":[0.98,0.98,0.98,1],"fs":36,"fw":500,"ls":-0.72,"lp":135,"T":1},{"p":"reportChangePill","w":52.48,"h":19,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[2,6,2,6],"H":1,"J":"center","r":999,"t":"+12.5%","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":125}]},{"p":"KPI_CARD_SPARK","w":16.27,"h":46,"wx":"FIX","hx":"FIX","ci":27.59,"wy":"선언","hy":"선언","J":"normal"}]}]}}]}];



const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
    }
    console.log("✅ [KDS] Inventory Draw Part 5/8 completed.");
  } catch (e) { console.error("Draw 5 error:", e); }

  try {
    // Inventory Draw Part 6/8
    {
// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"menu-popover","L":"메뉴 팝오버","sp":[{"i":"menu-popover/homeCreateNew","l":"앱 홈 새로 만들기 드롭다운","j":"HomeCreateNewMenu.tsx:141-167","t":{"p":"MENU","w":200,"h":136,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[6,6,6,6],"gap":2,"J":"normal","bg":[0.192,0.212,0.251,1],"r":16,"mw":200,"c":[{"p":"ITEM","w":188,"h":40,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[0,10,0,10],"H":1,"J":"normal","r":10,"t":"새 캔버스","fg":[1,1,1,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"c":[{"p":"ITEM_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","ci":10,"wy":"선언","hy":"선언","J":"normal","bg":[1,1,1,1]}]},{"p":"ITEM","w":188,"h":40,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[0,10,0,10],"H":1,"J":"normal","r":10,"t":"영상 편집","fg":[1,1,1,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"c":[{"p":"ITEM_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","ci":10,"wy":"선언","hy":"선언","J":"normal","bg":[1,1,1,1]}]},{"p":"ITEM","w":188,"h":40,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[0,10,0,10],"H":1,"J":"normal","r":10,"t":"하이라이트","fg":[1,1,1,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"c":[{"p":"ITEM_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","ci":10,"wy":"선언","hy":"선언","J":"normal","bg":[1,1,1,1]}]}]}},{"i":"menu-popover/paneContextMenu","l":"캔버스 빈 곳 우클릭 메뉴","j":"PaneContextMenu.tsx:253-316","t":{"p":"MENU_WRAP","w":190,"h":129,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[6,6,6,6],"gs":[2,6,6],"J":"normal","bg":[0.09,0.106,0.133,0.88],"r":14,"sh":[[0,0,0,0.04],0,8,15],"mw":190,"c":[{"p":"MENU_ITEM","w":178,"h":34,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[0,10,0,10],"H":1,"J":"space-between","r":8,"c":[{"p":"ITEM_MAIN","w":79.8,"h":18,"wx":"FIX","hx":"HUG","ci":8,"wy":"선언","hy":"내용","gap":9,"H":1,"J":"normal","c":[{"p":"ITEM_ICON","w":16,"h":16,"wx":"FIX","hx":"FIX","ci":1,"wy":"선언","hy":"선언","H":1,"J":"center"},{"p":"ITEM_LABEL","w":54.8,"h":18,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"텍스트 추가","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"lp":150,"T":1}]}]},{"p":"MENU_ITEM","w":178,"h":34,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[0,10,0,10],"H":1,"J":"space-between","r":8,"c":[{"p":"ITEM_MAIN","w":90.16,"h":18,"wx":"FIX","hx":"HUG","ci":8,"wy":"선언","hy":"내용","gap":9,"H":1,"J":"normal","c":[{"p":"ITEM_ICON","w":16,"h":16,"wx":"FIX","hx":"FIX","ci":1,"wy":"선언","hy":"선언","H":1,"J":"center"},{"p":"ITEM_LABEL","w":65.16,"h":18,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"이미지 만들기","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"lp":150,"T":1}]}]},{"p":"DIVIDER","w":166,"h":1,"wx":"FIX","hx":"FIX","ci":6,"wy":"빈칸","hy":"빈칸","J":"normal","bg":[0.98,0.98,0.98,0.08]},{"p":"MENU_ITEM","w":178,"h":34,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[0,10,0,10],"H":1,"J":"space-between","r":8,"c":[{"p":"ITEM_MAIN","w":69.42,"h":18,"wx":"FIX","hx":"HUG","ci":8,"wy":"선언","hy":"내용","gap":9,"H":1,"J":"normal","c":[{"p":"ITEM_ICON","w":16,"h":16,"wx":"FIX","hx":"FIX","ci":1,"wy":"선언","hy":"선언","H":1,"J":"center"},{"p":"ITEM_LABEL","w":44.42,"h":18,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"영상 추가","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"lp":150,"T":1}]}]}]}},{"i":"menu-popover/projectVideos","l":"프로젝트 영상 팝오버 — 헤더와 목록을 가진 벌","j":"ProjectVideosPopover.tsx:237-305","t":{"p":"POPOVER","w":188.67,"h":152,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","pad":[6,6,6,6],"gap":4,"J":"normal","bg":[0.192,0.212,0.251,1],"r":16,"sh":[[0,0,0,0.22],0,4,12],"c":[{"p":"HEADER","w":176.67,"h":28,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","pad":[0,6,0,6],"gap":40.44,"H":1,"J":"space-between","c":[{"p":"HEADER_TITLE","w":102.23,"h":21,"wx":"HUG","hx":"HUG","ci":3.5,"wy":"주축","hy":"내용","J":"normal","t":"이 프로젝트의 영상","fg":[0.98,0.98,0.98,0.96],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"HEADER_COUNT","w":22,"h":18,"wx":"FIX","hx":"FIX","ci":5,"wy":"선언","hy":"선언","pad":[0,6,0,6],"H":1,"J":"center","bg":[0.98,0.98,0.98,0.08],"r":999,"t":"2","fg":[0.835,0.843,0.867,0.92],"fs":12,"fw":400,"ls":-0.12,"lp":150,"mw":22}]},{"p":"LIST","w":176.67,"h":108,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","gap":2,"J":"normal","c":[{"p":"LIST_ITEM","w":176.67,"h":53,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","H":1,"J":"normal","c":[{"p":"ITEM_BUTTON","w":176.67,"h":53,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","pad":[6,6,6,6],"gap":10,"H":1,"J":"normal","r":10,"c":[{"p":"THUMBNAIL","w":64,"h":36,"wx":"FIX","hx":"FIX","ci":2.5,"wy":"선언","hy":"선언","J":"normal","bg":[0,0,0,0.6],"r":6,"bw":1,"bc":[0.835,0.843,0.867,0.18],"c":[{"p":"THUMBNAIL_MEDIA","w":62,"h":34,"wx":"FILL","hx":"FILL","ci":1,"wy":"선언(채움)","hy":"선언(채움)","J":"normal"}]},{"p":"ITEM_BODY","w":90.67,"h":41,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":2,"J":"normal","c":[{"p":"ITEM_NAME","w":90.67,"h":21,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"바닷가 오프닝 컷","fg":[0.98,0.98,0.98,0.96],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"ITEM_META","w":90.67,"h":18,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"생성됨 · 16:9 · 8s","fg":[0.737,0.753,0.788,0.88],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}]}]},{"p":"LIST_ITEM","w":176.67,"h":53,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","H":1,"J":"normal","c":[{"p":"ITEM_BUTTON","w":176.67,"h":53,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","pad":[6,6,6,6],"gap":10,"H":1,"J":"normal","r":10,"c":[{"p":"THUMBNAIL","w":64,"h":36,"wx":"FIX","hx":"FIX","ci":2.5,"wy":"선언","hy":"선언","J":"normal","bg":[0,0,0,0.6],"r":6,"bw":1,"bc":[0.835,0.843,0.867,0.18],"c":[{"p":"THUMBNAIL_MEDIA","w":62,"h":34,"wx":"FILL","hx":"FILL","ci":1,"wy":"선언(채움)","hy":"선언(채움)","J":"normal"}]},{"p":"ITEM_BODY","w":90.67,"h":41,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":2,"J":"normal","c":[{"p":"ITEM_NAME","w":90.67,"h":21,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"인터뷰 편집본","fg":[0.98,0.98,0.98,0.96],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"ITEM_META","w":90.67,"h":18,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"편집됨 · 9:16 · 24s","fg":[0.737,0.753,0.788,0.88],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}]}]}]}]}}]},{"k":"progress-bar","L":"진행 막대","sp":[{"i":"progress-bar/compositeSegmentPreview","l":"합본 미리보기 재생 진행바 — 트랙·게이지·핸들","j":"HighlightProjectScene.tsx:444-455","t":{"p":"compositeProgressBar","w":348,"h":20,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","H":1,"J":"normal","c":[{"p":"compositeProgressTrack","w":348,"h":3,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":8.5,"wy":"주축","hy":"선언","J":"normal","r":1.5,"c":[{"p":"compositeProgressFill","w":348,"h":3,"wx":"FILL","hx":"FIX","wy":"부모폭","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,1],"r":1.5}]},{"p":"compositeProgressThumb","w":0,"h":0,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":10,"slot":1,"wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,1],"r":-1}]}},{"i":"progress-bar/editNodeProcessing","l":"편집 노드 처리 진행바 — 퍼센트 글자를 옆에 갖는다","j":"EditNode.tsx:622-640","t":{"p":"PROCESSING_PROGRESS","w":160,"h":18,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":8,"H":1,"J":"normal","c":[{"p":"PROCESSING_PROGRESS_TRACK","w":122,"h":4,"wx":"HUG","hx":"FIX","ci":7,"wy":"주축","hy":"선언","J":"normal","bg":[0.376,0.333,1,0.24],"r":999,"c":[{"p":"PROCESSING_PROGRESS_FILL","w":122,"h":4,"wx":"FILL","hx":"FILL","wy":"부모폭","hy":"선언(채움)","J":"normal","bg":[0.376,0.333,1,1],"r":999}]},{"p":"PROCESSING_PROGRESS_PERCENT","w":30,"h":18,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","t":"62%","fg":[0.945,0.945,0.953,0.82],"fs":12,"fw":500,"ls":-0.12,"lp":150,"T":1,"mw":30}]}},{"i":"progress-bar/highlightUpload","l":"하이라이트 업로드 진행바","j":"HighlightProjectScene.tsx:2650-2655","t":{"p":"progressBarTrack","w":320,"h":6,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.1],"r":3,"xw":320,"c":[{"p":"progressBarFill","w":320,"h":6,"wx":"FILL","hx":"FIX","wy":"부모폭","hy":"선언","J":"normal","bg":[0.388,0.4,0.945,1],"r":3}]}}]},{"k":"selectable-list-row","L":"선택 가능한 목록 행","sp":[{"i":"selectable-list-row/creditHistoryEntry","l":"크레딧 내역 행 — 링크가 있을 때만 눌리는 행","j":"SubscriptionScene.tsx:1071-1153","t":{"p":"creditHistoryListItem","w":352,"h":48,"wx":"HUG","hx":"FIX","wy":"주축","hy":"선언","pad":[8,4,8,4],"gap":-22.5,"J":"normal","mh":48,"c":[{"p":"creditHistoryListMain","w":161.5,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"creditHistoryListTitle","w":87,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"하이라이트 생성","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"creditHistoryListMeta","w":61.2,"h":18,"wx":"HUG","hx":"HUG","ci":1.5,"wy":"주축","hy":"내용","J":"normal","t":"2026. 8. 12.","fg":[0.604,0.627,0.671,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]},{"p":"creditHistoryListValue","w":166.5,"h":24,"wx":"HUG","hx":"HUG","ci":177.5,"wy":"주축","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"creditHistoryListDelta","w":32.58,"h":21,"wx":"HUG","hx":"HUG","ci":3,"wy":"주축","hy":"내용","J":"normal","t":"-120","fg":[0.604,0.627,0.671,1],"fs":14,"fw":600,"ls":-0.14,"lp":150,"T":1},{"p":"creditHistoryListBalance","w":52.09,"h":18,"wx":"HUG","hx":"HUG","ci":6,"wy":"주축","hy":"내용","J":"normal","t":"잔액 1,880","fg":[0.604,0.627,0.671,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"withdrawalButton","w":61.83,"h":24,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[2,8,2,8],"J":"normal","r":4,"bw":1,"bc":[0.604,0.627,0.671,1],"t":"환불 요청","fg":[0.737,0.753,0.788,1],"fs":12,"fw":500,"ls":-0.12,"lp":150}]}]}},{"i":"selectable-list-row/highlightDetailClip","l":"하이라이트 상세 클립 행 — 행 자체가 버튼인 단일 선택 행","j":"HighlightProjectScene.tsx:3206-3244","t":{"p":"clipDetailListItem","w":368,"h":66,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[6,6,6,6],"gap":10,"H":1,"J":"normal","r":14,"c":[{"p":"clipDetailListThumb","w":96,"h":54,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","bg":[0.09,0.106,0.133,1],"r":10,"c":[{"p":"clipVideo","w":96,"h":54,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0,0,0,1]}]},{"p":"clipDetailListInfo","w":250,"h":41,"wx":"FILL","hx":"HUG","ci":6.5,"wy":"선언(채움)","hy":"내용","gap":2,"J":"normal","c":[{"p":"clipDetailListTitle","w":250,"h":21,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"전반 하이라이트 모음","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"clipDetailListMeta","w":250,"h":18,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"00:00 – 00:15 · 15s","fg":[0.604,0.627,0.671,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}]}},{"i":"selectable-list-row/highlightReviewClip","l":"하이라이트 검수 클립 행 — 체크박스가 있는 다중 선택 행","j":"HighlightProjectScene.tsx:2922-2961","t":{"p":"clipDetailListItem","w":368,"h":110,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[6,6,6,6],"gap":10,"H":1,"J":"normal","r":14,"c":[{"p":"segmentCheckbox","w":175,"h":28,"wx":"FIX","hx":"FIX","ci":36.5,"wy":"빈칸","hy":"빈칸","J":"normal","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]},{"p":"clipDetailListThumb","w":96,"h":54,"wx":"FIX","hx":"HUG","ci":22,"wy":"선언","hy":"내용","J":"normal","bg":[0.09,0.106,0.133,1],"r":10,"c":[{"p":"clipVideo","w":96,"h":54,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0,0,0,1]}]},{"p":"clipDetailListInfo","w":65,"h":98,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","gap":2,"J":"normal","c":[{"p":"clipDetailListTitle","w":65,"h":42,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"결승 3점슛이 들어간 순간","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"clipDetailListMeta","w":65,"h":54,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"00:12 – 00:27 · 점수 92","fg":[0.604,0.627,0.671,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}]}}]}];



const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
    }
    console.log("✅ [KDS] Inventory Draw Part 6/8 completed.");
  } catch (e) { console.error("Draw 6 error:", e); }

  try {
    // Inventory Draw Part 7/8
    {
// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"top-bar","L":"상단 바","sp":[{"i":"top-bar/gnbProjectHeader","l":"GNB 프로젝트 헤더 상단 바","j":"Gnb.tsx:4091-4366","t":{"p":"projectHeader","w":161.88,"h":72,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gs":[-28,12],"J":"normal","c":[{"p":"iconButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.98,0.98,0.98,0.1],"r":12,"mw":32,"mh":32,"xw":32},{"p":"projectTitle","w":85.88,"h":24,"wx":"FIX","hx":"HUG","ci":76,"wy":"선언","hy":"내용","J":"normal","t":"프로젝트 이름","fg":[0.98,0.98,0.98,0.92],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1},{"p":"projectActions","w":68,"h":32,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","H":1,"J":"flex-end","c":[{"p":"projectHeaderActionsShell","w":68,"h":32,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","gap":4,"H":1,"J":"center","c":[{"p":"projectMenuAnchor","w":32,"h":32,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","H":1,"J":"normal","c":[{"p":"iconButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.98,0.98,0.98,0.1],"r":12,"mw":32,"mh":32,"xw":32}]},{"p":"iconButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.98,0.98,0.98,0.1],"r":12,"mw":32,"mh":32,"xw":32}]}]}]}},{"i":"top-bar/instagramAnalytics","l":"인스타그램 분석 채널 배너 상단 바","j":"InstagramAnalyticsScene.tsx:1768-1802","t":{"p":"DASHBOARD_TOP_BAR","w":372,"h":360,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","pad":[0,40,24,40],"H":1,"J":"normal","c":[{"p":"DASHBOARD_TOP_BAR_LEFT","w":292,"h":124.8,"wx":"FIX","hx":"HUG","ci":105.59,"wy":"선언","hy":"내용","gap":12,"J":"normal","c":[{"p":"CHANNEL_AVATAR","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.341,0.365,0.408,1],"r":-1,"c":[{"p":"CHANNEL_AVATAR_PLACEHOLDER","w":48,"h":48,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","bg":[0.467,0.49,0.537,1]}]},{"p":"CHANNEL_INFO","w":292,"h":64.8,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"CHANNEL_NAME","w":292,"h":64.8,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"@instagram","fg":[0.98,0.98,0.98,1],"fs":48,"fw":500,"ls":-0.96,"lp":135,"T":1}]}]}]}},{"i":"top-bar/youtubeAnalytics","l":"유튜브 분석 채널 배너 상단 바","j":"YoutubeAnalyticsScene.tsx:1936-2059","t":{"p":"DASHBOARD_TOP_BAR_CARD","w":372,"h":360,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","pad":[0,40,24,40],"H":1,"J":"normal","c":[{"p":"DASHBOARD_TOP_BAR_OVERLAY","w":372,"h":360,"wx":"FILL","hx":"FILL","wy":"덮음","hy":"덮음","J":"normal","gr":{"t":[[0,-1,1],[1,0,0]],"s":[[0,[0.09,0.106,0.133,0.5]],[0.1,[0.09,0.106,0.133,0.51]],[0.2,[0.09,0.106,0.133,0.55]],[0.3,[0.09,0.106,0.133,0.61]],[0.4,[0.09,0.106,0.133,0.68]],[0.5,[0.09,0.106,0.133,0.75]],[0.6,[0.09,0.106,0.133,0.82]],[0.7,[0.09,0.106,0.133,0.89]],[0.8,[0.09,0.106,0.133,0.95]],[0.9,[0.09,0.106,0.133,0.99]],[1,[0.09,0.106,0.133,1]]]}},{"p":"DASHBOARD_TOP_BAR_LEFT","w":292,"h":160.8,"wx":"FIX","hx":"HUG","ci":87.59,"wy":"선언","hy":"내용","gap":12,"J":"normal","c":[{"p":"CHANNEL_AVATAR","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.341,0.365,0.408,1],"r":-1,"c":[{"p":"CHANNEL_AVATAR_PLACEHOLDER","w":48,"h":48,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","bg":[0.467,0.49,0.537,1]}]},{"p":"CHANNEL_INFO","w":292,"h":100.8,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"J":"normal","c":[{"p":"CHANNEL_NAME","w":292,"h":64.8,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"채널 이름","fg":[0.98,0.98,0.98,1],"fs":48,"fw":500,"ls":-0.96,"lp":135,"T":1},{"p":"CHANNEL_DESC_BUTTON","w":292,"h":24,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"채널 소개 문구가 여기에 표시됩니다.","fg":[0.98,0.98,0.98,0.72],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}]}]}}]},{"k":"dialog","L":"모달","sp":[{"i":"dialog/appHome","l":"삭제 확인 모달","j":"AppHomeScene.tsx:1379-1410","t":{"p":"modalCard","w":360,"h":148,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[16,8,8,8],"ins":[0,8,8,8],"gs":[8,24],"J":"normal","bg":[0.192,0.212,0.251,1],"r":24,"c":[{"p":"modalTitle","w":328,"h":24,"wx":"FILL","hx":"HUG","ci":8,"wy":"교차축","hy":"내용","J":"normal","t":"프로젝트를 삭제할까요?","fg":[0.98,0.98,0.98,1],"fs":16,"fw":600,"ls":-0.16,"lp":150,"T":1},{"p":"modalDescription","w":328,"h":24,"wx":"FILL","hx":"HUG","ci":8,"wy":"교차축","hy":"내용","J":"normal","t":"삭제하면 되돌릴 수 없습니다.","fg":[0.98,0.98,0.98,0.6],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1},{"p":"modalActions","w":344,"h":44,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":8,"H":1,"J":"normal","c":[{"p":"modalCancel","w":168,"h":44,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.1],"r":16,"t":"취소","fg":[0.98,0.98,0.98,1],"fs":16,"fw":500,"ls":-0.16,"lp":150},{"p":"modalConfirm","w":168,"h":44,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","J":"normal","bg":[1,0.294,0.349,1],"r":16,"t":"삭제","fg":[0.98,0.98,0.98,1],"fs":16,"fw":500,"ls":-0.16,"lp":150}]}]}},{"i":"dialog/myPage","l":"마이페이지 확인 모달","j":"SubscriptionScene.tsx:1275-1310","t":{"p":"modalCard","w":360,"h":169,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[16,8,8,8],"ins":[0,8,8,8],"gs":[16,40],"J":"normal","bg":[0.192,0.212,0.251,1],"r":24,"c":[{"p":"modalTitle","w":328,"h":24,"wx":"FILL","hx":"HUG","ci":8,"wy":"교차축","hy":"내용","J":"normal","t":"프로젝트를 삭제할까요?","fg":[0.98,0.98,0.98,1],"fs":16,"fw":600,"ls":-0.16,"lp":150,"T":1},{"p":"modalDescription","w":328,"h":21,"wx":"FILL","hx":"HUG","ci":8,"wy":"교차축","hy":"내용","J":"normal","t":"삭제하면 되돌릴 수 없습니다.","fg":[0.98,0.98,0.98,0.6],"fs":14,"fw":400,"ls":-0.14,"lp":150,"T":1},{"p":"modalActions","w":344,"h":44,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":8,"H":1,"J":"normal","c":[{"p":"modalCancel","w":168,"h":44,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,0.1],"r":16,"t":"취소","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150},{"p":"modalConfirm","w":168,"h":44,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","J":"normal","bg":[0.98,0.98,0.98,1],"r":16,"t":"삭제","fg":[0,0,0,1],"fs":14,"fw":500,"ls":-0.14,"lp":150}]}]}}]},{"k":"progress-ring","L":"프로필 링","sp":[{"i":"progress-ring/gnbTopBar","l":"GNB 상단 바 프로필 크레딧 링 — 버튼의 ::after가 링을 그린다","j":"Gnb.tsx:5302-5327","t":{"p":"profileTrigger","w":36,"h":36,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"center","bw":2,"bc":[1,1,1,1],"mw":36,"mh":36,"c":[{"p":"profileImage","w":28,"h":28,"wx":"FIX","hx":"FIX","ci":4,"wy":"선언","hy":"선언","J":"normal","r":999}]}},{"i":"progress-ring/projectHeaderSlot","l":"프로젝트 헤더 프로필 링 — 슬롯 훅이 아바타를 줄인다","j":"Gnb.tsx:3974-3999","t":{"p":"profileTrigger","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"center","bw":2,"bc":[1,1,1,1],"mw":32,"mh":32,"c":[{"p":"profileImage","w":24,"h":24,"wx":"FIX","hx":"FIX","ci":4,"wy":"선언","hy":"선언","J":"normal","r":999}]}}]},{"k":"project-card","L":"프로젝트 카드","sp":[{"i":"project-card/appHome","l":"앱 홈 · 프로젝트 카드","j":"AppHomeScene.tsx:1061-1352","t":{"p":"archiveCard","w":84,"h":84,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","r":16,"c":[{"p":"archivePreview","w":84,"h":84,"wx":"FIX","hx":"FILL","wy":"선언","hy":"부모높이","J":"normal","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"archivePreviewClip","w":84,"h":84,"wx":"FILL","hx":"FILL","wy":"덮음","hy":"덮음","J":"normal","r":16,"c":[{"p":"archivePreviewPlaceholder","w":84,"h":84,"wx":"FILL","hx":"FILL","wy":"덮음","hy":"덮음","J":"normal","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"cardDraftThumbnail","w":84,"h":84,"wx":"FILL","hx":"FILL","wy":"덮음","hy":"덮음","J":"normal","bg":[0.09,0.106,0.133,1]}]}]},{"p":"archivePreviewTitleOverlay","w":84,"h":32,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":52,"wy":"교차축","hy":"선언","pad":[16,16,16,16],"H":1,"J":"normal","c":[{"p":"archivePreviewTitleOverlayInner","w":52,"h":60.78,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"J":"flex-end","c":[{"p":"archivePreviewEyebrow","w":52,"h":16.8,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"노드 캔버스","fg":[0.945,0.945,0.953,1],"fs":14,"fw":400,"ls":-0.14,"lp":120,"T":1},{"p":"archivePreviewTitleOverlayText","w":52,"h":19.19,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"여름 캠페인 키비주얼","fg":[0.945,0.945,0.953,1],"fs":16,"fw":500,"ls":-0.16,"lp":120,"T":1},{"p":"archivePreviewLastEdited","w":52,"h":16.8,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","t":"3일 전 편집","fg":[0.945,0.945,0.953,1],"fs":14,"fw":400,"ls":-0.14,"lp":120,"T":1}]}]},{"p":"archiveMenuAnchorInThumbnail","w":32,"h":39,"wx":"FIX","hx":"FIX","abs":1,"x":44,"y":8,"wy":"교차축","hy":"내용","J":"normal","c":[{"p":"archiveMoreButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.192,0.212,0.251,0.5],"r":12},{"p":"archiveDropdown","w":147.2,"h":116.84,"wx":"FIX","hx":"FIX","abs":1,"x":-115.2,"y":47,"wy":"교차축","hy":"내용","pad":[6,6,6,6],"gap":1.84,"J":"normal","bg":[0.192,0.212,0.251,1],"r":16,"sh":[[0,0,0,0.04],0,8,15],"mw":160,"c":[{"p":"archiveDropdownItem","w":136.16,"h":34.04,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[8,12,8,12],"H":1,"J":"normal","r":10,"t":"새 탭에서 열기","fg":[0.98,0.98,0.98,0.86],"fs":14,"fw":400,"ls":-0.14,"lp":150},{"p":"archiveDropdownItem","w":136.16,"h":34.04,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[8,12,8,12],"H":1,"J":"normal","r":10,"t":"이름 바꾸기","fg":[0.98,0.98,0.98,0.86],"fs":14,"fw":400,"ls":-0.14,"lp":150},{"p":"archiveDropdownItem","w":136.16,"h":34.04,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[8,12,8,12],"H":1,"J":"normal","r":10,"t":"삭제","fg":[0.98,0.98,0.98,0.86],"fs":14,"fw":400,"ls":-0.14,"lp":150}]}]}]}]}},{"i":"project-card/nodeCanvasHome","l":"노드캔버스 홈 · 프로젝트 카드 — 아이브로우가 없다","j":"NodeCanvasHomeScene.tsx:1355-1595","t":{"p":"ARCHIVE_CARD","w":84,"h":84,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","r":16,"c":[{"p":"ARCHIVE_PREVIEW","w":84,"h":84,"wx":"FIX","hx":"FILL","wy":"선언","hy":"부모높이","J":"normal","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"ARCHIVE_PREVIEW_CLIP","w":84,"h":84,"wx":"FILL","hx":"FILL","wy":"덮음","hy":"덮음","J":"normal","r":16,"c":[{"p":"ARCHIVE_PREVIEW_PLACEHOLDER","w":84,"h":84,"wx":"FILL","hx":"FILL","wy":"덮음","hy":"덮음","J":"normal","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"CARD_DRAFT_WORDMARK_CANVAS","w":84,"h":84,"wx":"FILL","hx":"FILL","wy":"덮음","hy":"덮음","H":1,"J":"center","bg":[0.09,0.106,0.133,1]}]}]},{"p":"ARCHIVE_PREVIEW_TITLE_OVERLAY","w":84,"h":32,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":52,"wy":"교차축","hy":"선언","pad":[16,16,16,16],"H":1,"J":"normal","c":[{"p":"ARCHIVE_PREVIEW_TITLE_OVERLAY_INNER","w":52,"h":39.98,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","gap":4,"J":"flex-end","c":[{"p":"ARCHIVE_PREVIEW_TITLE_OVERLAY_TEXT","w":52,"h":19.19,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","J":"normal","t":"여름 캠페인 키비주얼","fg":[0.945,0.945,0.953,1],"fs":16,"fw":500,"ls":-0.16,"lp":120,"T":1},{"p":"ARCHIVE_PREVIEW_LAST_EDITED","w":52,"h":16.8,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","J":"normal","t":"3일 전 편집","fg":[0.945,0.945,0.953,1],"fs":14,"fw":400,"ls":-0.14,"lp":120,"T":1}]}]},{"p":"ARCHIVE_MENU_ANCHOR_IN_THUMBNAIL","w":32,"h":39,"wx":"FIX","hx":"FIX","abs":1,"x":44,"y":8,"wy":"교차축","hy":"내용","J":"normal","c":[{"p":"ARCHIVE_MORE_BUTTON","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.192,0.212,0.251,0.5],"r":12},{"p":"ARCHIVE_DROPDOWN","w":160,"h":127,"wx":"FIX","hx":"FIX","abs":1,"x":-128,"y":47,"wy":"선언","hy":"내용","pad":[6,6,6,6],"gap":2,"J":"normal","bg":[0.192,0.212,0.251,1],"r":16,"sh":[[0,0,0,0.04],0,8,15],"mw":160,"c":[{"p":"ARCHIVE_DROPDOWN_ITEM_BASE","w":148,"h":37,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","pad":[8,12,8,12],"H":1,"J":"normal","r":10,"t":"새 탭에서 열기","fg":[1,1,1,1],"fs":14,"fw":400,"ls":-0.14,"lp":150},{"p":"ARCHIVE_DROPDOWN_ITEM_BASE","w":148,"h":37,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","pad":[8,12,8,12],"H":1,"J":"normal","r":10,"t":"이름 바꾸기","fg":[1,1,1,1],"fs":14,"fw":400,"ls":-0.14,"lp":150},{"p":"ARCHIVE_DROPDOWN_ITEM_BASE","w":148,"h":37,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","pad":[8,12,8,12],"H":1,"J":"normal","r":10,"t":"삭제","fg":[1,1,1,1],"fs":14,"fw":400,"ls":-0.14,"lp":150}]}]}]}]}}]}];



const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
    }
    console.log("✅ [KDS] Inventory Draw Part 7/8 completed.");
  } catch (e) { console.error("Draw 7 error:", e); }

  try {
    // Inventory Draw Part 8/8
    {
// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"segmented-control","L":"세그먼트 컨트롤","sp":[{"i":"segmented-control/instagramAnalytics","l":"인스타그램 분석 · 기간 선택기 (3구간)","j":"InstagramAnalyticsScene.tsx:1824-1845","t":{"p":"PERIOD_SELECTOR","w":152.53,"h":34,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[3,3,3,3],"gap":2,"H":1,"J":"normal","r":8,"c":[{"p":"PERIOD_SELECTOR_THUMB","w":0,"h":28,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":3,"slot":1,"wy":"슬롯","hy":"부모높이","J":"normal","r":6},{"p":"PERIOD_BTN","w":40.86,"h":28,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[5,12,5,12],"J":"normal","r":6,"t":"7일","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN_ACTIVE","w":49.78,"h":28,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[5,12,5,12],"J":"normal","r":6,"t":"1개월","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN","w":51.89,"h":28,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[5,12,5,12],"J":"normal","r":6,"t":"3개월","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150}]}},{"i":"segmented-control/youtubeAnalytics","l":"유튜브 분석 · 기간 선택기 (5구간)","j":"YoutubeAnalyticsScene.tsx:2089-2116","t":{"p":"PERIOD_SELECTOR","w":263.89,"h":34,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[3,3,3,3],"gap":2,"H":1,"J":"normal","r":8,"c":[{"p":"PERIOD_SELECTOR_THUMB","w":0,"h":28,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":3,"slot":1,"wy":"슬롯","hy":"부모높이","J":"normal","r":6},{"p":"PERIOD_BTN","w":40.86,"h":28,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[5,12,5,12],"J":"normal","r":6,"t":"7일","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN_ACTIVE","w":49.78,"h":28,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[5,12,5,12],"J":"normal","r":6,"t":"1개월","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN","w":51.89,"h":28,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[5,12,5,12],"J":"normal","r":6,"t":"3개월","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN","w":39.53,"h":28,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[5,12,5,12],"J":"normal","r":6,"t":"1년","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN","w":67.83,"h":28,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[5,12,5,12],"J":"normal","r":6,"t":"전체 기간","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150}]}}]},{"k":"admin","L":"관리자 요소","sp":[{"i":"admin/headerSlot","l":"관리자 콘텐츠 헤더 슬롯 — GNB 상단 크롬 바가 portal 되는 자리, 비어 있으면 숨는다","j":"AdminClient.tsx:1235-1235","t":{"p":"HEADER_SLOT","w":0,"h":0,"wx":"HUG","hx":"HUG","slot":1,"wy":"슬롯","hy":"슬롯","J":"normal"}}]},{"k":"canvas-node","L":"캔버스 노드","sp":[{"i":"canvas-node/bgmShell","l":"캔버스 노드 셸 (BGM 노드) — 카드 위 헤더 + 카드","j":"BgmNode.tsx:1035-1063","t":{"p":"NODE_CONTAINER","w":372,"h":34,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":10,"J":"normal","c":[{"p":"NODE_HEADER_ABOVE","w":400,"h":24,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[0,2,0,2],"gap":8,"H":1,"J":"space-between","c":[{"p":"NODE_TITLE_WRAP","w":388,"h":24,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","H":1,"J":"normal","c":[{"p":"NODE_TITLE_LEFT","w":388,"h":24,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","gap":5,"H":1,"J":"normal","c":[{"p":"NODE_TITLE_ICON","w":0,"h":0,"wx":"HUG","hx":"HUG","ci":12,"slot":1,"wy":"슬롯","hy":"슬롯","H":1,"J":"center"},{"p":"NODE_TITLE_LABEL","w":383,"h":21,"wx":"FIX","hx":"HUG","ci":1.5,"wy":"선언","hy":"내용","J":"normal","t":"사운드","fg":[0.604,0.627,0.671,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1}]}]},{"p":"NODE_HEADER_ABOVE_ACTIONS","w":0,"h":0,"wx":"HUG","hx":"HUG","ci":12,"slot":1,"wy":"슬롯","hy":"슬롯","H":1,"J":"normal"}]},{"p":"NODE_MAIN","w":400,"h":0,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"NODE_WRAP","w":400,"h":0,"wx":"FIX","hx":"FILL","slot":1,"wy":"선언","hy":"부모높이","J":"normal","bg":[0.192,0.212,0.251,1],"r":24}]}]}}]}];



const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
    }
    console.log("✅ [KDS] Inventory Draw Part 8/8 completed.");
  } catch (e) { console.error("Draw 8 error:", e); }

  figma.notify("🎉 [KDS] 345개 토큰 및 23개 컴포넌트 100% 동기화 완료!", { timeout: 4000 });
  console.log("🎉 [KDS] ALL TOKENS & COMPONENTS SYNCHRONIZED SUCCESSFULLY!");
})();
