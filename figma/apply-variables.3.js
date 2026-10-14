// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 3/12 — Klipse Primitive 3/4 (변수 64개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={};
const COL={"c":"Klipse Primitive","m":["Base"],"d":"Base","vars":[{"i":"color-static-white-alpha-40","n":"color/static-white-alpha/40","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.4]}}},{"i":"color-static-white-alpha-48","n":"color/static-white-alpha/48","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.48]}}},{"i":"color-static-white-alpha-56","n":"color/static-white-alpha/56","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.56]}}},{"i":"color-static-white-alpha-64","n":"color/static-white-alpha/64","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.64]}}},{"i":"color-static-white-alpha-72","n":"color/static-white-alpha/72","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.72]}}},{"i":"color-static-white-alpha-80","n":"color/static-white-alpha/80","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.8]}}},{"i":"color-static-white-alpha-88","n":"color/static-white-alpha/88","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.88]}}},{"i":"color-static-white-alpha-96","n":"color/static-white-alpha/96","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.980392,0.980392,0.980392,0.96]}}},{"i":"color-violet-100","n":"color/violet/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.921569,0.909804,1,1]}}},{"i":"color-violet-200","n":"color/violet/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.788235,0.760784,1,1]}}},{"i":"color-violet-300","n":"color/violet/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.615686,0.568627,1,1]}}},{"i":"color-violet-400","n":"color/violet/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.517647,0.470588,1,1]}}},{"i":"color-violet-500","n":"color/violet/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.376471,0.333333,1,1]}}},{"i":"color-violet-600","n":"color/violet/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.309804,0.270588,0.890196,1]}}},{"i":"color-violet-700","n":"color/violet/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.207843,0.156863,0.721569,1]}}},{"i":"color-violet-800","n":"color/violet/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.133333,0.101961,0.501961,1]}}},{"i":"color-violet-900","n":"color/violet/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.082353,0.062745,0.301961,1]}}},{"i":"color-violet-alpha-08","n":"color/violet-alpha/08","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.376471,0.333333,1,0.08]}}},{"i":"color-violet-alpha-16","n":"color/violet-alpha/16","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.376471,0.333333,1,0.16]}}},{"i":"color-yellow-100","n":"color/yellow/100","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.960784,0.839216,1]}}},{"i":"color-yellow-200","n":"color/yellow/200","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.909804,0.639216,1]}}},{"i":"color-yellow-300","n":"color/yellow/300","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.85098,0.501961,1]}}},{"i":"color-yellow-400","n":"color/yellow/400","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.760784,0.2,1]}}},{"i":"color-yellow-500","n":"color/yellow/500","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0.698039,0,1]}}},{"i":"color-yellow-600","n":"color/yellow/600","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.894118,0.603922,0,1]}}},{"i":"color-yellow-700","n":"color/yellow/700","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.721569,0.462745,0,1]}}},{"i":"color-yellow-800","n":"color/yellow/800","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.478431,0.321569,0,1]}}},{"i":"color-yellow-900","n":"color/yellow/900","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[0.298039,0.2,0,1]}}},{"i":"color-youtube-red","n":"color/youtube/red","t":"COLOR","h":true,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Base":{"c":[1,0,0.2,1]}}},{"i":"duration-fast","n":"duration/fast","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":120}}},{"i":"duration-instant","n":"duration/instant","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":0}}},{"i":"duration-normal","n":"duration/normal","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":200}}},{"i":"duration-slow","n":"duration/slow","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":320}}},{"i":"font-family-mono","n":"font-family/mono","t":"STRING","h":true,"sc":["FONT_FAMILY"],"v":{"Base":{"s":"SFMono-Regular, Consolas, Liberation Mono, monospace"}}},{"i":"font-family-sans","n":"font-family/sans","t":"STRING","h":true,"sc":["FONT_FAMILY"],"v":{"Base":{"s":"Pretendard Variable, Pretendard, Inter, Noto Sans KR, Noto Sans JP, system-ui, sans-serif"}}},{"i":"font-size-body-lg","n":"font-size/body-lg","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":20}}},{"i":"font-size-body-md","n":"font-size/body-md","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":16}}},{"i":"font-size-body-sm","n":"font-size/body-sm","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":14}}},{"i":"font-size-caption","n":"font-size/caption","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":12}}},{"i":"font-size-heading-lg","n":"font-size/heading-lg","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":48}}},{"i":"font-size-heading-md","n":"font-size/heading-md","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":36}}},{"i":"font-size-heading-sm","n":"font-size/heading-sm","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":28}}},{"i":"font-weight-medium","n":"font-weight/medium","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":500}}},{"i":"font-weight-regular","n":"font-weight/regular","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":400}}},{"i":"font-weight-semibold","n":"font-weight/semibold","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":600}}},{"i":"layer-base-content","n":"layer/content","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":0}}},{"i":"layer-base-critical","n":"layer/critical","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":13000}}},{"i":"layer-base-modal","n":"layer/modal","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":10200}}},{"i":"layer-base-popover","n":"layer/popover","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":1100}}},{"i":"layer-base-sticky","n":"layer/sticky","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":1000}}},{"i":"line-height-percent-120","n":"line-height/percent-120","t":"FLOAT","h":true,"sc":["LINE_HEIGHT"],"v":{"Base":{"n":120}}},{"i":"line-height-percent-135","n":"line-height/percent-135","t":"FLOAT","h":true,"sc":["LINE_HEIGHT"],"v":{"Base":{"n":135}}},{"i":"line-height-percent-150","n":"line-height/percent-150","t":"FLOAT","h":true,"sc":["LINE_HEIGHT"],"v":{"Base":{"n":150}}},{"i":"radius-0","n":"radius/0","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":0}}},{"i":"radius-10","n":"radius/10","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":10}}},{"i":"radius-12","n":"radius/12","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":12}}},{"i":"radius-16","n":"radius/16","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":16}}},{"i":"radius-2","n":"radius/2","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":2}}},{"i":"radius-20","n":"radius/20","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":20}}},{"i":"radius-24","n":"radius/24","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":24}}},{"i":"radius-4","n":"radius/4","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":4}}},{"i":"radius-6","n":"radius/6","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":6}}},{"i":"radius-8","n":"radius/8","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":8}}},{"i":"radius-full","n":"radius/full","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":999}}}]};

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
// 2차 — 값을 넣는다. 별칭은 **컬렉션::이름** 으로 파일 전체에서 찾는다.
// 이름만으로 찾으면 안 된다 — border-width/default 와 layer/* 8개는 Primitive 와 Semantic
// 양쪽에 같은 이름으로 존재한다. Map 은 나중 것이 이기므로 semantic 이 자기 자신을 별칭
// 대상으로 잡아 Figma 가 값을 0 으로 떨어뜨린다(2026-08-26 LOUIS 파일에서 8건 실측).
all=await figma.variables.getLocalVariablesAsync();
cols=await figma.variables.getLocalVariableCollectionsAsync();
const collName=new Map(cols.map(x=>[x.id,x.name]));
const byName=new Map(all.map(v=>[collName.get(v.variableCollectionId)+"::"+v.name,v]));
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
return {collection:COL.c,collectionsCreated:report.collectionsCreated,modesAdded:report.modesAdded,
  created:report.created.length,updated:report.updated.length,unchanged:report.unchanged,
  missingAlias:report.missingAlias};
