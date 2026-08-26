import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

// Figma 변수 **적용** 코드를 생성물로 만든다.
//
// **왜 있는가.** 이 저장소는 되읽기 절차를 `build-figma-snapshot.mjs` 헤더에 적어 두었지만
// **쓰는 경로는 대화에만 있었다.** 매 단위마다 즉석 Plugin API 코드를 다시 쓰게 되고, 무엇을
// 적용했는지가 기록에 남지 않는다. `figma/inventory-draw.*.js`가 그리는 코드를 생성물로 만든 것과
// 같은 이유다 — 「손으로 쓰지 않는 경로가 실제로 존재해야 한다」를 쓰기 쪽에도 적용한다.
//
// 산출물 `figma/apply-variables.*.js`를 `use_figma`에 그대로 넘긴다. 손대지 않는다.
// 코드는 idempotent하다 — 있으면 값만 맞추고 없으면 만들며, 실행 후 created/updated/unchanged를
// 보고한다. 이름으로 찾으므로 변수 ID가 유지되어 바인딩이 끊기지 않는다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const proposal = JSON.parse(
  readFileSync(resolve(repoRoot, "packages/tokens/generated/figma.tokens.json"), "utf8"),
);
const check = process.argv.includes("--check");
// `--delta` — 현재 snapshot에 **없는** 변수만 낸다. 토큰을 더한 직후 라이브러리를 따라잡힐 때
// 전량을 다시 밀 필요가 없다. idempotent라 전량을 밀어도 결과는 같지만 호출 수가 몇 배가 된다.
const delta = process.argv.includes("--delta");
const known = delta
  ? new Set(Object.keys(JSON.parse(readFileSync(resolve(repoRoot, "figma/snapshot.json"), "utf8")).variables ?? {}))
  : null;

const plan = [];
let skipped = 0;
for (const [collectionName, collection] of Object.entries(proposal.collections)) {
  const vars = [];
  for (const [id, v] of Object.entries(collection.variables)) {
    if (v.representation !== "variable" && v.representation !== "variable-documentation") {
      skipped += 1;
      continue;
    }
    const vals = {};
    for (const [mode, entry] of Object.entries(v.valuesByMode)) {
      // transition 복합값은 Figma가 해석하지 않는 문서용 STRING으로 격하된다.
      // 별칭이어도 스냅샷은 **해결된 문자열**을 담으므로 여기서도 문자열로 굳힌다.
      if (v.$type === "transition" && v.nativeVariableType === "STRING") {
        const r = entry.resolvedValue;
        if (!r) {
          skipped += 1;
          continue;
        }
        const tf = r.timingFunction.join(", ");
        vals[mode] = {
          s: `${r.duration.value}ms cubic-bezier(${tf}) delay ${r.delay.value}ms`,
        };
        continue;
      }
      if (entry.aliasTarget) {
        vals[mode] = { a: entry.aliasTarget.id };
        continue;
      }
      const raw = entry.$value;
      if (v.nativeVariableType === "COLOR") {
        const c = entry.resolvedValue ?? raw;
        const [r, g, b] = c.components;
        vals[mode] = { c: [r, g, b, c.alpha ?? 1] };
      } else if (v.nativeVariableType === "FLOAT") {
        const n = typeof raw === "number" ? raw : (raw?.value ?? entry.resolvedValue?.value);
        if (typeof n !== "number") {
          skipped += 1;
          continue;
        }
        vals[mode] = { n };
      } else if (v.nativeVariableType === "STRING") {
        // font-family는 스택 배열이다. Figma STRING은 CSS와 같은 표기로 굳힌다.
        const src = raw ?? entry.resolvedValue;
        vals[mode] = {
          s: Array.isArray(src)
            ? src.join(", ")
            : String(typeof src === "object" ? (src?.value ?? "") : src),
        };
      } else {
        skipped += 1;
        continue;
      }
    }
    if (Object.keys(vals).length === 0) continue;
    if (delta && known.has(id)) continue;
    vars.push({
      i: id,
      n: v.figmaName,
      t: v.nativeVariableType,
      h: v.hiddenFromPublishing === true,
      sc: v.scopes ?? [],
      v: vals,
    });
  }
  plan.push({ c: collectionName, m: collection.modes, d: collection.defaultMode, vars });
}

const total = plan.reduce((n, c) => n + c.vars.length, 0);

// 별칭 대상을 이름으로 찾을 수 있도록 id → figmaName 표를 함께 싣는다.
// 컬렉션마다 파일을 나눠도(=따로 실행해도) 별칭이 끊기지 않는다.
const nameById = {};
for (const col of plan) for (const v of col.vars) nameById[v.i] = `${col.c}::${v.n}`;

// 조각 크기 — use_figma 한도(50,000자)보다 훨씬 작게 잡는다. 붙여넣기와 검토가 가능해야 한다.
const CHUNK = 64;

const RUNNER = `
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
`;

// 컬렉션을 조각으로 나눈다. 조각마다 그 조각이 실제로 참조하는 별칭 이름만 싣는다.
const chunks = [];
for (const col of plan) {
  if (col.vars.length === 0) continue;
  for (let start = 0; start < col.vars.length; start += CHUNK) {
    const vars = col.vars.slice(start, start + CHUNK);
    const names = {};
    for (const v of vars)
      for (const val of Object.values(v.v))
        if (val.a !== undefined) names[val.a] = nameById[val.a];
    chunks.push({ col: { ...col, vars }, names, part: Math.floor(start / CHUNK) + 1,
      parts: Math.ceil(col.vars.length / CHUNK) });
  }
}

const files = chunks.map((ch, i) => ({
  absolute: resolve(repoRoot, delta ? `figma/apply-variables.delta.${i + 1}.js` : `figma/apply-variables.${i + 1}.js`),
  expected:
    `// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.\n` +
    `// use_figma에 그대로 넘긴다. ${i + 1}/${chunks.length} — ${ch.col.c} ${ch.part}/${ch.parts} (변수 ${ch.col.vars.length}개).\n` +
    `// **번호 순서대로 실행한다.** 별칭이 대상 변수를 이름으로 찾으므로 대상이 먼저 있어야 한다.\n` +
    `// idempotent — 있으면 값만 맞추고 없으면 만든다. 이름으로 찾으므로 변수 ID가 유지된다.\n` +
    `const NAME=${JSON.stringify(ch.names)};\nconst COL=${JSON.stringify(ch.col)};\n` +
    RUNNER,
}));

if (check) {
  for (const f of files) {
    const current = readFileSync(f.absolute, "utf8");
    if (current !== f.expected) {
      console.error("[figma-variables] 적용 코드가 최신이 아닙니다: " + f.absolute);
      process.exit(1);
    }
  }
  console.log(`[figma-variables] checked: 변수 ${total}개 · 조각 ${files.length}개`);
} else {
  atomicWriteBatch(files);
  const max = Math.max(...files.map((f) => f.expected.length));
  console.log(
    `[figma-variables] built: 변수 ${total}개 · 조각 ${files.length}개 · 최대 ${max}자 · 변수로 표현 안 되는 항목 ${skipped}개 제외`,
  );
}
