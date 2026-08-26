// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 6/8 — Klipse Semantic 2/2 (변수 23개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={"radius-12":"Klipse Primitive::radius/12","radius-8":"Klipse Primitive::radius/8","radius-10":"Klipse Primitive::radius/10","radius-16":"Klipse Primitive::radius/16","radius-24":"Klipse Primitive::radius/24","radius-full":"Klipse Primitive::radius/full","radius-4":"Klipse Primitive::radius/4","space-16":"Klipse Primitive::spacing/16","space-12":"Klipse Primitive::spacing/12","space-8":"Klipse Primitive::spacing/8","space-4":"Klipse Primitive::spacing/4","space-24":"Klipse Primitive::spacing/24","space-20":"Klipse Primitive::spacing/20","space-6":"Klipse Primitive::spacing/6","space-2":"Klipse Primitive::spacing/2"};
const COL={"c":"Klipse Semantic","m":["Global"],"d":"Global","vars":[{"i":"radius-control","n":"radius/control","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-12"}}},{"i":"radius-control-sm","n":"radius/control-sm","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-8"}}},{"i":"radius-inspector-control","n":"radius/inspector-control","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-10"}}},{"i":"radius-node-chip","n":"radius/node-chip","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-12"}}},{"i":"radius-overlay","n":"radius/overlay","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-16"}}},{"i":"radius-overlay-item","n":"radius/overlay-item","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-10"}}},{"i":"radius-overlay-lg","n":"radius/overlay-lg","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-24"}}},{"i":"radius-pill","n":"radius/pill","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-full"}}},{"i":"radius-table-header","n":"radius/table-header","t":"FLOAT","h":false,"sc":["CORNER_RADIUS"],"v":{"Global":{"a":"radius-4"}}},{"i":"space-control-lg","n":"spacing/control-lg","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-16"}}},{"i":"space-control-md","n":"spacing/control-md","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-12"}}},{"i":"space-control-sm","n":"spacing/control-sm","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-8"}}},{"i":"space-control-xs","n":"spacing/control-xs","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-4"}}},{"i":"space-layout-gutter","n":"spacing/layout-gutter","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-16"}}},{"i":"space-layout-section","n":"spacing/layout-section","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-24"}}},{"i":"space-media-inset","n":"spacing/media-inset","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-20"}}},{"i":"space-overlay-inset","n":"spacing/overlay-inset","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-6"}}},{"i":"space-overlay-item-content-gap","n":"spacing/overlay-item-content-gap","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-6"}}},{"i":"space-overlay-item-gap","n":"spacing/overlay-item-gap","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-2"}}},{"i":"space-progress-ring-gap","n":"spacing/progress-ring-gap","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-2"}}},{"i":"space-stack-md","n":"spacing/stack-md","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-12"}}},{"i":"space-stack-xs","n":"spacing/stack-xs","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-4"}}},{"i":"space-toast-inline","n":"spacing/toast-inline","t":"FLOAT","h":false,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Global":{"a":"space-20"}}}]};

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
