// 생성물. scripts/build-figma-styles.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 그대로 넘긴다. text style 18개 · effect style 11개.
// **변수를 먼저 적용한다** — text style이 font-size·font-weight 변수를 이름으로 찾아 바인딩한다.
// effect style에는 모드가 없어 **Light 값**으로 만든다. 다크는 Figma가 표현하지 못한다.
const FAMILY="Pretendard";
const TEXT=[{"i":"typography-body-lg-medium","n":"typography/body-lg-medium","fam":"Pretendard","st":"Medium","size":20,"lh":150,"ls":-0.2,"bind":{"fontSize":"font-size/body-lg","fontWeight":"font-weight/medium"}},{"i":"typography-body-lg-regular","n":"typography/body-lg-regular","fam":"Pretendard","st":"Regular","size":20,"lh":150,"ls":-0.2,"bind":{"fontSize":"font-size/body-lg","fontWeight":"font-weight/regular"}},{"i":"typography-body-lg-semibold","n":"typography/body-lg-semibold","fam":"Pretendard","st":"SemiBold","size":20,"lh":150,"ls":-0.2,"bind":{"fontSize":"font-size/body-lg","fontWeight":"font-weight/semibold"}},{"i":"typography-body-md-medium","n":"typography/body-md-medium","fam":"Pretendard","st":"Medium","size":16,"lh":150,"ls":-0.16,"bind":{"fontSize":"font-size/body-md","fontWeight":"font-weight/medium"}},{"i":"typography-body-md-regular","n":"typography/body-md-regular","fam":"Pretendard","st":"Regular","size":16,"lh":150,"ls":-0.16,"bind":{"fontSize":"font-size/body-md","fontWeight":"font-weight/regular"}},{"i":"typography-body-md-semibold","n":"typography/body-md-semibold","fam":"Pretendard","st":"SemiBold","size":16,"lh":150,"ls":-0.16,"bind":{"fontSize":"font-size/body-md","fontWeight":"font-weight/semibold"}},{"i":"typography-body-sm-medium","n":"typography/body-sm-medium","fam":"Pretendard","st":"Medium","size":14,"lh":150,"ls":-0.14,"bind":{"fontSize":"font-size/body-sm","fontWeight":"font-weight/medium"}},{"i":"typography-body-sm-regular","n":"typography/body-sm-regular","fam":"Pretendard","st":"Regular","size":14,"lh":150,"ls":-0.14,"bind":{"fontSize":"font-size/body-sm","fontWeight":"font-weight/regular"}},{"i":"typography-body-sm-semibold","n":"typography/body-sm-semibold","fam":"Pretendard","st":"SemiBold","size":14,"lh":150,"ls":-0.14,"bind":{"fontSize":"font-size/body-sm","fontWeight":"font-weight/semibold"}},{"i":"typography-caption-medium","n":"typography/caption-medium","fam":"Pretendard","st":"Medium","size":12,"lh":150,"ls":-0.12,"bind":{"fontSize":"font-size/caption","fontWeight":"font-weight/medium"}},{"i":"typography-caption-regular","n":"typography/caption-regular","fam":"Pretendard","st":"Regular","size":12,"lh":150,"ls":-0.12,"bind":{"fontSize":"font-size/caption","fontWeight":"font-weight/regular"}},{"i":"typography-caption-semibold","n":"typography/caption-semibold","fam":"Pretendard","st":"SemiBold","size":12,"lh":150,"ls":-0.12,"bind":{"fontSize":"font-size/caption","fontWeight":"font-weight/semibold"}},{"i":"typography-heading-lg-medium","n":"typography/heading-lg-medium","fam":"Pretendard","st":"Medium","size":48,"lh":135,"ls":-0.96,"bind":{"fontSize":"font-size/heading-lg","fontWeight":"font-weight/medium"}},{"i":"typography-heading-lg-semibold","n":"typography/heading-lg-semibold","fam":"Pretendard","st":"SemiBold","size":48,"lh":135,"ls":-0.96,"bind":{"fontSize":"font-size/heading-lg","fontWeight":"font-weight/semibold"}},{"i":"typography-heading-md-medium","n":"typography/heading-md-medium","fam":"Pretendard","st":"Medium","size":36,"lh":135,"ls":-0.72,"bind":{"fontSize":"font-size/heading-md","fontWeight":"font-weight/medium"}},{"i":"typography-heading-md-semibold","n":"typography/heading-md-semibold","fam":"Pretendard","st":"SemiBold","size":36,"lh":135,"ls":-0.72,"bind":{"fontSize":"font-size/heading-md","fontWeight":"font-weight/semibold"}},{"i":"typography-heading-sm-medium","n":"typography/heading-sm-medium","fam":"Pretendard","st":"Medium","size":28,"lh":135,"ls":-0.56,"bind":{"fontSize":"font-size/heading-sm","fontWeight":"font-weight/medium"}},{"i":"typography-heading-sm-semibold","n":"typography/heading-sm-semibold","fam":"Pretendard","st":"SemiBold","size":28,"lh":135,"ls":-0.56,"bind":{"fontSize":"font-size/heading-sm","fontWeight":"font-weight/semibold"}}];
const EFFECT=[{"i":"elevation-coverflow-card","n":"elevation/coverflow-card","layers":[{"y":24,"x":0,"b":60,"s":0,"inset":false,"c":[0,0,0,0.28]}]},{"i":"elevation-coverflow-card-active","n":"elevation/coverflow-card-active","layers":[{"y":32,"x":0,"b":80,"s":0,"inset":false,"c":[0,0,0,0.4]}]},{"i":"elevation-focus-ring","n":"elevation/focus-ring","layers":[{"y":0,"x":0,"b":0,"s":3,"inset":false,"c":[0,0.533333,1,0.42]}]},{"i":"elevation-modal","n":"elevation/modal","layers":[{"y":16,"x":0,"b":48,"s":-8,"inset":false,"c":[0,0,0,0.22]}]},{"i":"elevation-popover","n":"elevation/popover","layers":[{"y":8,"x":0,"b":24,"s":-4,"inset":false,"c":[0,0,0,0.14]}]},{"i":"elevation-surface","n":"elevation/surface","layers":[{"y":2,"x":0,"b":8,"s":0,"inset":false,"c":[0,0,0,0.06]}]},{"i":"elevation-switch-thumb","n":"elevation/switch-thumb","layers":[{"y":1,"x":0,"b":3,"s":0,"inset":false,"c":[0,0,0,0.2]}]},{"i":"elevation-toast","n":"elevation/toast","layers":[{"y":8,"x":0,"b":20,"s":0,"inset":false,"c":[0,0,0,0.16]}]},{"i":"elevation-menu","n":"elevation/menu","layers":[{"y":12,"x":0,"b":32,"s":0,"inset":false,"c":[0,0,0,0.24]}]},{"i":"elevation-tooltip","n":"elevation/tooltip","layers":[{"y":12,"x":0,"b":24,"s":0,"inset":false,"c":[0.466667,0.490196,0.537255,0.12]}]},{"i":"elevation-upgrade","n":"elevation/upgrade","layers":[{"y":0,"x":0,"b":0,"s":1,"inset":true,"c":[0.980392,0.980392,0.980392,0.08]},{"y":1,"x":0,"b":2,"s":0,"inset":false,"c":[0,0,0,0.04]}]}];

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
return {text:{created:report.createdText.length,updated:report.updatedText.length},
  effect:{created:report.createdEffect.length,updated:report.updatedEffect.length},
  missingBind:report.missingBind};
