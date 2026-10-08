// **Klipse Locale 변수 러너(DS-D-0081).** `P`(변수 묶음 하나)를 컬렉션 「Klipse Locale」에 세운다.
// 생성기 `scripts/build-figma-locale-strings.mjs` 가 `P` 와 함께 draw.js 로 합쳐 넣는다. 조각은 서로 독립이라 순서가 없다
// (어느 조각이든 컬렉션 · 모드가 없으면 세운다). 보드 러너보다 먼저 돌린다 — 보드 렌더러는 없는 변수를 만나면 던진다.
//
//   P = { collection, modes: ["en", "ko", "ja"], hidden: true,
//         strings: [[id, name, en, ko, ja], …], booleans: [[id, name, en, ko, ja], …] }
//
// **변수의 정체는 이름이 아니라 값 묶음이다.** 이름은 범위(`--only`)가 넓어지면 바뀔 수 있다(첫 화면 경로가 이름에 든다). 그래서 변수 설명에
// `locale:<id>`(세 값의 sha256 앞 12자)를 적고 그것으로 찾는다 — 이름이 바뀌면 같은 변수의 이름만 고쳐, 이미 묶인 보드가 끊기지 않는다.
// 같은 이름의 관리 변수가 다른 id 를 들고 있으면(사전 문구가 바뀌었다) 그 변수의 id · 값을 고친다. 관리 표시가 없는 같은 이름 변수는 던진다.
// 이미 있는 변수는 지우지 않는다 — 계획에 없는 관리 변수(고아)는 되읽기 게이트가 센다(조각 하나는 계획 전체를 모른다).

const collections = await figma.variables.getLocalVariableCollectionsAsync();
let collection = collections.find((entry) => entry.name === P.collection);
const createdCollection = !collection;
if (!collection) collection = figma.variables.createVariableCollection(P.collection);
if (collection.hiddenFromPublishing !== Boolean(P.hidden)) collection.hiddenFromPublishing = Boolean(P.hidden);

// 모드는 이름으로 맞춘다. 갓 만든(변수 없는) 컬렉션의 첫 모드(「Mode 1」)만 en 으로 이름을 바꾼다 — 변수가 든 컬렉션의 모드를 짐작으로 고치지 않는다.
const modeIdOf = {};
for (const [index, name] of P.modes.entries()) {
  let mode = collection.modes.find((entry) => entry.name === name);
  if (!mode && index === 0 && collection.modes.length === 1 && collection.variableIds.length === 0) {
    collection.renameMode(collection.modes[0].modeId, name);
    mode = collection.modes[0];
  }
  if (!mode) {
    const modeId = collection.addMode(name);
    mode = { modeId, name };
  }
  modeIdOf[name] = mode.modeId;
}
// 기본 모드가 en 이어야 모드를 고르지 않은 페이지 · 보드가 측정(en)과 같은 글자를 보인다.
if (collection.defaultModeId !== modeIdOf[P.modes[0]]) {
  throw new Error(`${P.collection} 의 기본 모드가 ${P.modes[0]} 가 아닙니다 — 모드 순서를 손으로 바꾸지 말고 컬렉션을 확인하세요.`);
}

const managed = new Map();
const byName = new Map();
for (const variable of await figma.variables.getLocalVariablesAsync()) {
  if (variable.variableCollectionId !== collection.id) continue;
  byName.set(variable.name, variable);
  const key = /^locale:(\S+)$/.exec(variable.description || "");
  if (key) managed.set(key[1], variable);
}

const counts = { created: 0, renamed: 0, rekeyed: 0, updated: 0, unchanged: 0 };
const createdNames = [];
const apply = (type, [id, name, ...values], scopes) => {
  let variable = managed.get(id) || null;
  if (!variable) {
    const same = byName.get(name);
    if (same && /^locale:/.test(same.description || "")) {
      variable = same;
      variable.description = `locale:${id}`;
      counts.rekeyed += 1;
    } else if (same) {
      throw new Error(`${P.collection} 에 관리 표시 없는 같은 이름 변수가 있습니다: ${name}`);
    } else {
      variable = figma.variables.createVariable(name, collection, type);
      variable.description = `locale:${id}`;
      counts.created += 1;
      if (createdNames.length < 20) createdNames.push(name);
    }
  }
  if (variable.resolvedType !== type) throw new Error(`로캘 변수의 형이 다릅니다: ${variable.name} (${variable.resolvedType} ≠ ${type})`);
  if (variable.name !== name) {
    variable.name = name;
    counts.renamed += 1;
  }
  if (scopes && JSON.stringify(variable.scopes) !== JSON.stringify(scopes)) variable.scopes = scopes;
  let changed = false;
  P.modes.forEach((mode, index) => {
    if (variable.valuesByMode[modeIdOf[mode]] !== values[index]) {
      variable.setValueForMode(modeIdOf[mode], values[index]);
      changed = true;
    }
  });
  if (changed) counts.updated += 1;
  else counts.unchanged += 1;
  byName.set(name, variable);
  managed.set(id, variable);
};
// STRING 은 글자 내용에만 고를 수 있게 한다(색 · 크기 칸에 뜨지 않게). BOOLEAN(존재)은 범위가 없다.
for (const entry of P.strings || []) apply("STRING", entry, ["TEXT_CONTENT"]);
for (const entry of P.booleans || []) apply("BOOLEAN", entry, null);

return {
  collection: collection.id,
  createdCollection,
  modes: modeIdOf,
  ...counts,
  createdNames,
  managedInCollection: managed.size,
};
