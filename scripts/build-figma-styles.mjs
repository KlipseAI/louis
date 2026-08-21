import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

// Figma text style · effect style **적용** 코드를 생성물로 만든다. `build-figma-variables.mjs`의
// 자매 스크립트이며 같은 이유로 존재한다 — 쓰는 코드가 대화에만 있으면 무엇을 적용했는지 남지 않는다.
//
// **effect style에는 모드가 없다.** DTCG shadow는 테마별로 값이 갈리는데 Figma effect style은
// 단일 값이다. 그래서 **Light를 명시적으로 고른다.** 고르지 않고 첫 모드를 쓰면 Dark가 잡혀
// `elevation/menu`의 헤어라인이 neutral-700(어두움)으로 들어간다 — 라이트 화면에서 검은 테두리가 된다.
//
// text style의 fontFamily는 스택이 아니라 Figma에 실재하는 한 벌(`Pretendard`)이다.
// weight는 style 이름으로 바뀐다(400 Regular · 500 Medium · 600 SemiBold).

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const proposal = JSON.parse(readFileSync(resolve(repoRoot, "packages/tokens/generated/figma.tokens.json"), "utf8"));
const check = process.argv.includes("--check");

const FAMILY = "Pretendard";
const WEIGHT = { 400: "Regular", 500: "Medium", 600: "SemiBold" };
const px = (v) => (typeof v === "number" ? v : v?.value);
const errors = [];

// 테마 의존 값은 Light를 고른다. 단일 모드면 그것을 쓴다.
const pickMode = (valuesByMode, id) => {
  if (valuesByMode.Light) return valuesByMode.Light;
  const keys = Object.keys(valuesByMode);
  if (keys.length === 1) return valuesByMode[keys[0]];
  errors.push(`${id}: Light 모드가 없고 모드가 ${keys.length}개다 — 어느 것을 쓸지 정해야 한다.`);
  return null;
};

const text = [];
const effect = [];
for (const col of Object.values(proposal.collections)) {
  for (const [id, v] of Object.entries(col.variables)) {
    if (v.representation !== "text-style" && v.representation !== "effect-style") continue;
    const entry = pickMode(v.valuesByMode, id);
    if (!entry) continue;
    const rv = entry.resolvedValue;
    if (v.representation === "text-style") {
      const style = WEIGHT[rv.fontWeight];
      if (!style) {
        errors.push(`${id}: weight ${rv.fontWeight}에 대응하는 Figma style 이름이 없다.`);
        continue;
      }
      // typography-{size}-{weight} — 마지막 조각이 weight, 나머지가 size다 (DS-D-0010 §2).
      const rest = id.replace(/^typography-/, "");
      const cut = rest.lastIndexOf("-");
      text.push({
        i: id, n: v.figmaName, fam: FAMILY, st: style,
        size: px(rv.fontSize), lh: Math.round(rv.lineHeight * 1000) / 10,
        ls: px(rv.letterSpacing),
        bind: { fontSize: `font-size/${rest.slice(0, cut)}`, fontWeight: `font-weight/${rest.slice(cut + 1)}` },
      });
    } else {
      const layers = (Array.isArray(rv) ? rv : [rv]).map((l) => ({
        y: px(l.offsetY), x: px(l.offsetX), b: px(l.blur), s: px(l.spread),
        inset: l.inset === true,
        c: [...l.color.components, l.color.alpha ?? 1],
      }));
      effect.push({ i: id, n: v.figmaName, layers });
    }
  }
}

if (errors.length) {
  for (const e of errors) console.error("[figma-styles] " + e);
  process.exit(1);
}

const RUNNER = `
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
`;

const body =
  `// 생성물. scripts/build-figma-styles.mjs가 만든다. 직접 수정하지 않는다.\n` +
  `// use_figma에 그대로 넘긴다. text style ${text.length}개 · effect style ${effect.length}개.\n` +
  `// **변수를 먼저 적용한다** — text style이 font-size·font-weight 변수를 이름으로 찾아 바인딩한다.\n` +
  `// effect style에는 모드가 없어 **Light 값**으로 만든다. 다크는 Figma가 표현하지 못한다.\n` +
  `const FAMILY=${JSON.stringify(FAMILY)};\n` +
  `const TEXT=${JSON.stringify(text)};\nconst EFFECT=${JSON.stringify(effect)};\n` +
  RUNNER;

const path = resolve(repoRoot, "figma/apply-styles.js");
if (check) {
  if (readFileSync(path, "utf8") !== body) {
    console.error("[figma-styles] 적용 코드가 최신이 아닙니다. 다시 생성하세요.");
    process.exit(1);
  }
  console.log(`[figma-styles] checked: text ${text.length} · effect ${effect.length}`);
} else {
  atomicWriteBatch([{ absolute: path, expected: body }]);
  console.log(`[figma-styles] built: text ${text.length} · effect ${effect.length} · ${body.length}자`);
}
