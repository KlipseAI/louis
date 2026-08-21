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
// 산출물 `figma/apply-variables.js`를 `use_figma`에 그대로 넘긴다. 손대지 않는다.
// 코드는 idempotent하다 — 있으면 값만 맞추고 없으면 만들며, 실행 후 created/updated/unchanged를
// 보고한다. 이름으로 찾으므로 변수 ID가 유지되어 바인딩이 끊기지 않는다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const proposal = JSON.parse(
  readFileSync(resolve(repoRoot, "packages/tokens/generated/figma.tokens.json"), "utf8"),
);
const check = process.argv.includes("--check");

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

const body = `// 생성물. scripts/build-figma-variables.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. idempotent하다 — 있으면 값만 맞추고 없으면 만든다.
// 이름으로 찾으므로 변수 ID가 유지되고 기존 바인딩이 끊기지 않는다.
const PLAN=${JSON.stringify(plan)};
const report={created:[],updated:[],unchanged:0,modesAdded:[],collectionsCreated:[]};
const cols=await figma.variables.getLocalVariableCollectionsAsync();
const byName=new Map(cols.map(c=>[c.name,c]));
const idMap=new Map();
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// 1차 — 컬렉션·모드·변수 자체를 맞춘다. 별칭은 2차에서 건다(대상이 먼저 있어야 한다).
for(const col of PLAN){
  let c=byName.get(col.c);
  if(!c){c=figma.variables.createVariableCollection(col.c);report.collectionsCreated.push(col.c);}
  const modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
  if(c.modes.length===1&&modeName.has(c.modes[0].name)&&!modeName.has(col.d)){
    c.renameMode(c.modes[0].modeId,col.d);modeName.clear();modeName.set(col.d,c.modes[0].modeId);
  }
  for(const m of col.m){ if(!modeName.has(m)){modeName.set(m,c.addMode(m));report.modesAdded.push(col.c+"/"+m);} }
  const existing=await figma.variables.getLocalVariablesAsync();
  const inCol=new Map(existing.filter(v=>v.variableCollectionId===c.id).map(v=>[v.name,v]));
  for(const spec of col.vars){
    let v=inCol.get(spec.n);
    if(!v){v=figma.variables.createVariable(spec.n,c,spec.t);report.created.push(spec.i);}
    v.hiddenFromPublishing=spec.h;
    if(spec.sc.length) v.scopes=spec.sc;
    idMap.set(spec.i,v);
  }
}
// 2차 — 값을 넣는다.
for(const col of PLAN){
  const c=byName.get(col.c)??(await figma.variables.getLocalVariableCollectionsAsync()).find(x=>x.name===col.c);
  const modeName=new Map(c.modes.map(m=>[m.name,m.modeId]));
  for(const spec of col.vars){
    const v=idMap.get(spec.i); if(!v) continue;
    let touched=false;
    for(const [mode,val] of Object.entries(spec.v)){
      const modeId=modeName.get(mode); if(!modeId) continue;
      let next;
      if(val.a!==undefined){const t=idMap.get(val.a); if(!t) continue; next=figma.variables.createVariableAlias(t);}
      else if(val.c) next={r:val.c[0],g:val.c[1],b:val.c[2],a:val.c[3]};
      else if(val.n!==undefined) next=val.n;
      else next=val.s;
      const cur=v.valuesByMode[modeId];
      if(!eq(cur,next)){v.setValueForMode(modeId,next);touched=true;}
    }
    if(touched&&!report.created.includes(spec.i)) report.updated.push(spec.i);
    if(!touched&&!report.created.includes(spec.i)) report.unchanged+=1;
  }
}
JSON.stringify({collectionsCreated:report.collectionsCreated,modesAdded:report.modesAdded,
  created:report.created.length,createdIds:report.created.slice(0,60),
  updated:report.updated.length,updatedIds:report.updated.slice(0,60),unchanged:report.unchanged});
`;

const outPath = resolve(repoRoot, "figma/apply-variables.js");
if (check) {
  const current = readFileSync(outPath, "utf8");
  if (current !== body) {
    console.error("[figma-variables] 적용 코드가 최신이 아닙니다. 다시 생성하세요.");
    process.exit(1);
  }
  console.log(`[figma-variables] checked: 변수 ${total}개 · 컬렉션 ${plan.length}개`);
} else {
  atomicWriteBatch([{ absolute: outPath, expected: body }]);
  console.log(
    `[figma-variables] built: 변수 ${total}개 · 컬렉션 ${plan.length}개 · 변수로 표현 안 되는 항목 ${skipped}개 제외`,
  );
}
