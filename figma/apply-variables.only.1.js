// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 1/1 — Klipse Semantic Color 1/1 (변수 12개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={"color-pink-900":"Klipse Primitive::color/pink/900","color-node-handle-disabled-light-pink-bg":"Klipse Primitive::color/node-handle-disabled-light/pink-bg","color-violet-900":"Klipse Primitive::color/violet/900","color-node-handle-disabled-light-violet-bg":"Klipse Primitive::color/node-handle-disabled-light/violet-bg","color-green-900":"Klipse Primitive::color/green/900","color-node-handle-disabled-light-green-bg":"Klipse Primitive::color/node-handle-disabled-light/green-bg","color-red-900":"Klipse Primitive::color/red/900","color-node-handle-disabled-light-red-bg":"Klipse Primitive::color/node-handle-disabled-light/red-bg","color-yellow-900":"Klipse Primitive::color/yellow/900","color-node-handle-disabled-light-yellow-bg":"Klipse Primitive::color/node-handle-disabled-light/yellow-bg","color-pink-700":"Klipse Primitive::color/pink/700","color-node-handle-disabled-light-pink-icon":"Klipse Primitive::color/node-handle-disabled-light/pink-icon","color-violet-700":"Klipse Primitive::color/violet/700","color-node-handle-disabled-light-violet-icon":"Klipse Primitive::color/node-handle-disabled-light/violet-icon","color-green-700":"Klipse Primitive::color/green/700","color-node-handle-disabled-light-green-icon":"Klipse Primitive::color/node-handle-disabled-light/green-icon","color-red-700":"Klipse Primitive::color/red/700","color-node-handle-disabled-light-red-icon":"Klipse Primitive::color/node-handle-disabled-light/red-icon","color-yellow-700":"Klipse Primitive::color/yellow/700","color-node-handle-disabled-light-yellow-icon":"Klipse Primitive::color/node-handle-disabled-light/yellow-icon"};
const COL={"c":"Klipse Semantic Color","m":["Light","Dark"],"d":"Light","vars":[{"i":"color-node-handle-bg-disabled-audio","n":"color/node/handle-bg-disabled-audio","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-pink-900"},"Light":{"a":"color-node-handle-disabled-light-pink-bg"}}},{"i":"color-node-handle-bg-disabled-edit","n":"color/node/handle-bg-disabled-edit","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-violet-900"},"Light":{"a":"color-node-handle-disabled-light-violet-bg"}}},{"i":"color-node-handle-bg-disabled-image","n":"color/node/handle-bg-disabled-image","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-green-900"},"Light":{"a":"color-node-handle-disabled-light-green-bg"}}},{"i":"color-node-handle-bg-disabled-instagram","n":"color/node/handle-bg-disabled-instagram","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-900"},"Light":{"a":"color-node-handle-disabled-light-red-bg"}}},{"i":"color-node-handle-bg-disabled-text","n":"color/node/handle-bg-disabled-text","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-yellow-900"},"Light":{"a":"color-node-handle-disabled-light-yellow-bg"}}},{"i":"color-node-handle-bg-disabled-youtube","n":"color/node/handle-bg-disabled-youtube","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-900"},"Light":{"a":"color-node-handle-disabled-light-red-bg"}}},{"i":"color-node-handle-icon-disabled-audio","n":"color/node/handle-icon-disabled-audio","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-pink-700"},"Light":{"a":"color-node-handle-disabled-light-pink-icon"}}},{"i":"color-node-handle-icon-disabled-edit","n":"color/node/handle-icon-disabled-edit","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-violet-700"},"Light":{"a":"color-node-handle-disabled-light-violet-icon"}}},{"i":"color-node-handle-icon-disabled-image","n":"color/node/handle-icon-disabled-image","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-green-700"},"Light":{"a":"color-node-handle-disabled-light-green-icon"}}},{"i":"color-node-handle-icon-disabled-instagram","n":"color/node/handle-icon-disabled-instagram","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-700"},"Light":{"a":"color-node-handle-disabled-light-red-icon"}}},{"i":"color-node-handle-icon-disabled-text","n":"color/node/handle-icon-disabled-text","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-yellow-700"},"Light":{"a":"color-node-handle-disabled-light-yellow-icon"}}},{"i":"color-node-handle-icon-disabled-youtube","n":"color/node/handle-icon-disabled-youtube","t":"COLOR","h":false,"sc":["FRAME_FILL","SHAPE_FILL","STROKE_COLOR","TEXT_FILL"],"v":{"Dark":{"a":"color-red-700"},"Light":{"a":"color-node-handle-disabled-light-red-icon"}}}]};

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
