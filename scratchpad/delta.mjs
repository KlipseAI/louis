import fs from 'node:fs';
const rb=JSON.parse(fs.readFileSync('figma/readback.json','utf8'));
// rename rule (names + alias targets)
const RULES=[[/^color\/neutral\//,'color/gray/'],[/^color\/ink-alpha\//,'color/static-black-alpha/'],[/^color\/black-alpha\//,'color/static-black-alpha/'],[/^color\/paper-alpha\//,'color/static-white-alpha/'],[/^color\/background-/,'color/bg-'],[/^color\/foreground-/,'color/fg-'],[/^color\/border-/,'color/stroke-'],[/^color\/action-/,'color/accent-'],[/^color\/scrim-/,'color/dim-']];
const ren=n=>{for(const[re,rep]of RULES)if(re.test(n))return n.replace(re,rep);return n;};
const near=(a,b)=>Math.abs((a??1)-(b??1))<1e-5;
// LIVE map (post-rename): key=newName -> {mode -> {alias:targetNewName} | {color:[r,g,b,a]}}
const live={};
for(const [cn,c] of Object.entries(rb.collections)){
  for(const r of (c.rows||[])){
    const name=ren(r[0]); const type=r[1];
    if(type!=='COLOR') continue;
    live[name]={};
    for(const [mode,ali,raw] of r[3]){
      if(ali){ const t=ren(ali.split('::').pop()); live[name][mode]={alias:t}; }
      else if(raw){ // raw color: could be {r,g,b,a} or [..] or hex
        let col;
        if(Array.isArray(raw)) col=raw;
        else if(raw&&typeof raw==='object'&&'r'in raw) col=[raw.r,raw.g,raw.b,raw.a??1];
        else col=raw; // hex string?
        live[name][mode]={color:col};
      }
    }
  }
}
// PROPOSAL map from apply-variables files
const prop={}; const modeAlias={};
for(let i=1;i<=7;i++){
  const t=fs.readFileSync('figma/apply-variables.'+i+'.js','utf8');
  const NAME=JSON.parse(t.match(/const NAME=({[\s\S]*?});\n/)[1]);
  const COL=JSON.parse(t.match(/const COL=({[\s\S]*?});\n/)[1]);
  for(const spec of COL.vars){
    if(spec.t!=='COLOR') continue;
    prop[spec.n]={};
    for(const [mode,val] of Object.entries(spec.v)){
      if(val.a!==undefined) prop[spec.n][mode]={alias:NAME[val.a]};
      else if(val.c) prop[spec.n][mode]={color:val.c};
    }
  }
}
// DIFF
const create=[], valDiff=[], aliasDiff=[], extra=[];
for(const name of Object.keys(prop)){
  if(!live[name]){ create.push(name); continue; }
  for(const mode of Object.keys(prop[name])){
    const p=prop[name][mode]; const l=live[name][mode];
    if(!l){ valDiff.push(name+'@'+mode+' (live에 mode 없음)'); continue; }
    if(p.alias!==undefined){
      if(l.alias!==p.alias) aliasDiff.push(name+'@'+mode+': live='+l.alias+' → prop='+p.alias);
    } else if(p.color){
      const lc=l.color;
      if(!lc||!Array.isArray(lc)||!(near(lc[0],p.color[0])&&near(lc[1],p.color[1])&&near(lc[2],p.color[2])&&near(lc[3],p.color[3])))
        valDiff.push(name+'@'+mode+': live='+JSON.stringify(lc)+' → prop='+JSON.stringify(p.color));
    }
  }
}
for(const name of Object.keys(live)) if(!prop[name]) extra.push(name);
console.log('CREATE (proposal에 있고 live에 없음):', create.length); create.forEach(x=>console.log('  +',x));
console.log('VALUE DIFF (primitive 값 변경):', valDiff.length); valDiff.forEach(x=>console.log('  ~',x));
console.log('ALIAS DIFF (semantic 재지정):', aliasDiff.length); aliasDiff.forEach(x=>console.log('  ~',x));
console.log('EXTRA (live에 있고 proposal에 없음 → 삭제):', extra.length); extra.forEach(x=>console.log('  -',x));
