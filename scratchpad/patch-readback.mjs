import fs from 'node:fs';
const P='figma/readback.json';
const d=JSON.parse(fs.readFileSync(P,'utf8'));
const RULES=[[/^color\/neutral\//,'color/gray/'],[/^color\/ink-alpha\//,'color/static-black-alpha/'],[/^color\/black-alpha\//,'color/static-black-alpha/'],[/^color\/paper-alpha\//,'color/static-white-alpha/'],[/^color\/background-/,'color/bg-'],[/^color\/foreground-/,'color/fg-'],[/^color\/border-/,'color/stroke-'],[/^color\/action-/,'color/accent-'],[/^color\/scrim-/,'color/dim-']];
const ren=n=>{for(const[re,rep]of RULES)if(re.test(n))return n.replace(re,rep);return n;};
const renTarget=t=>{const i=t.indexOf('::'); if(i<0)return t; return t.slice(0,i+2)+ren(t.slice(i+2));};
let renamed=0, valFix=0, removed=0, repointed=0;
// update capture metadata
d.capturedAt='2026-08-25'; d.capturedBy='figma-mcp-plugin-api (patched: DS-D-0024 색 마이그레이션 반영)';
for(const [cn,c] of Object.entries(d.collections)){
  const rows=[];
  for(const r of c.rows){
    let [name,type,scopes,modes]=r;
    // remove inverse-alpha primitives
    if(/^color\/inverse-alpha\//.test(name)){ removed++; continue; }
    const nn=ren(name); if(nn!==name) renamed++;
    // fix static-alpha raw values to pure
    const isBlack=/^color\/static-black-alpha\//.test(nn), isWhite=/^color\/static-white-alpha\//.test(nn);
    const newModes=modes.map(([m,ali,raw])=>{
      if(ali!==null) return [m, renTarget(ali), null];
      if(raw && Array.isArray(raw) && (isBlack||isWhite)){ const v=isWhite?1:0; if(raw[0]!==v||raw[1]!==v||raw[2]!==v) valFix++; return [m,null,[v,v,v,raw[3]]]; }
      return [m,ali,raw];
    });
    rows.push([nn,type,scopes,newModes]);
  }
  c.rows=rows;
}
// re-point bg-inverse-translucent + add stroke-hairline in Klipse Semantic Color
const sc=d.collections['Klipse Semantic Color'];
for(const r of sc.rows){
  if(r[0]==='color/bg-inverse-translucent'){
    r[3]=[['Light','Klipse Primitive::color/static-black-alpha/70',null],['Dark','Klipse Primitive::color/static-white-alpha/70',null]];
    repointed++;
  }
}
if(!sc.rows.find(r=>r[0]==='color/stroke-hairline')){
  sc.rows.push(['color/stroke-hairline','COLOR','FRAME_FILL,SHAPE_FILL,TEXT_FILL,STROKE_COLOR',
    [['Light','Klipse Primitive::color/static-black-alpha/10',null],['Dark','Klipse Primitive::color/static-white-alpha/10',null]]]);
}
// patch elevation/menu -> ambient-only single layer
d.styles.effect['elevation/menu']={layers:[{offsetY:8,blur:15,spread:0,inset:false,color:[0,0,0,0.04]}]};
// sanity: no remaining old-name or inverse-alpha refs
let dangling=[];
for(const [cn,c] of Object.entries(d.collections)) for(const r of c.rows){
  if(/neutral|ink-alpha|paper-alpha|inverse-alpha|^color\/(background|foreground|border|action|scrim)-/.test(r[0])) dangling.push('name:'+r[0]);
  for(const [m,ali] of r[3]) if(ali && /neutral|ink-alpha|paper-alpha|inverse-alpha/.test(ali)) dangling.push('alias:'+r[0]+'->'+ali);
}
fs.writeFileSync(P, JSON.stringify(d,null,1));
console.log(JSON.stringify({renamed,valFix,removed,repointed,dangling},null,0));
