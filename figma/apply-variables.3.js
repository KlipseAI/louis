// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. 3/9 — Klipse Primitive 3/3 (변수 53개).
// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.
// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.
const NAME={};
const COL={"c":"Klipse Primitive","m":["Base"],"d":"Base","vars":[{"i":"font-size-heading-lg","n":"font-size/heading-lg","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":48}}},{"i":"font-size-heading-md","n":"font-size/heading-md","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":36}}},{"i":"font-size-heading-sm","n":"font-size/heading-sm","t":"FLOAT","h":true,"sc":["WIDTH_HEIGHT"],"v":{"Base":{"n":28}}},{"i":"font-weight-medium","n":"font-weight/medium","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":500}}},{"i":"font-weight-regular","n":"font-weight/regular","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":400}}},{"i":"font-weight-semibold","n":"font-weight/semibold","t":"FLOAT","h":true,"sc":["FONT_WEIGHT"],"v":{"Base":{"n":600}}},{"i":"layer-base-content","n":"layer/content","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":0}}},{"i":"layer-base-critical","n":"layer/critical","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":400}}},{"i":"layer-base-modal","n":"layer/modal","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":300}}},{"i":"layer-base-popover","n":"layer/popover","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":200}}},{"i":"layer-base-sticky","n":"layer/sticky","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":100}}},{"i":"line-height-percent-120","n":"line-height/percent-120","t":"FLOAT","h":true,"sc":["LINE_HEIGHT"],"v":{"Base":{"n":120}}},{"i":"line-height-percent-135","n":"line-height/percent-135","t":"FLOAT","h":true,"sc":["LINE_HEIGHT"],"v":{"Base":{"n":135}}},{"i":"line-height-percent-150","n":"line-height/percent-150","t":"FLOAT","h":true,"sc":["LINE_HEIGHT"],"v":{"Base":{"n":150}}},{"i":"radius-0","n":"radius/0","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":0}}},{"i":"radius-10","n":"radius/10","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":10}}},{"i":"radius-12","n":"radius/12","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":12}}},{"i":"radius-16","n":"radius/16","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":16}}},{"i":"radius-2","n":"radius/2","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":2}}},{"i":"radius-20","n":"radius/20","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":20}}},{"i":"radius-24","n":"radius/24","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":24}}},{"i":"radius-4","n":"radius/4","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":4}}},{"i":"radius-6","n":"radius/6","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":6}}},{"i":"radius-8","n":"radius/8","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":8}}},{"i":"radius-full","n":"radius/full","t":"FLOAT","h":true,"sc":["CORNER_RADIUS"],"v":{"Base":{"n":999}}},{"i":"scale-tooltip-rest","n":"scale/tooltip-rest","t":"FLOAT","h":true,"sc":[],"v":{"Base":{"n":0.97}}},{"i":"space-0","n":"spacing/0","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":0}}},{"i":"space-10","n":"spacing/10","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":10}}},{"i":"space-12","n":"spacing/12","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":12}}},{"i":"space-120","n":"spacing/120","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":120}}},{"i":"space-14","n":"spacing/14","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":14}}},{"i":"space-16","n":"spacing/16","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":16}}},{"i":"space-18","n":"spacing/18","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":18}}},{"i":"space-2","n":"spacing/2","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":2}}},{"i":"space-20","n":"spacing/20","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":20}}},{"i":"space-24","n":"spacing/24","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":24}}},{"i":"space-240","n":"spacing/240","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":240}}},{"i":"space-28","n":"spacing/28","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":28}}},{"i":"space-280","n":"spacing/280","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":280}}},{"i":"space-32","n":"spacing/32","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":32}}},{"i":"space-320","n":"spacing/320","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":320}}},{"i":"space-4","n":"spacing/4","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":4}}},{"i":"space-40","n":"spacing/40","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":40}}},{"i":"space-44","n":"spacing/44","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":44}}},{"i":"space-48","n":"spacing/48","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":48}}},{"i":"space-56","n":"spacing/56","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":56}}},{"i":"space-6","n":"spacing/6","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":6}}},{"i":"space-60","n":"spacing/60","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":60}}},{"i":"space-64","n":"spacing/64","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":64}}},{"i":"space-8","n":"spacing/8","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":8}}},{"i":"space-80","n":"spacing/80","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":80}}},{"i":"space-96","n":"spacing/96","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":96}}},{"i":"space-960","n":"spacing/960","t":"FLOAT","h":true,"sc":["GAP","WIDTH_HEIGHT"],"v":{"Base":{"n":960}}}]};

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
