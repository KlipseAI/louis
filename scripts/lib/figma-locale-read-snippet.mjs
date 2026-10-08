// **되읽기 탐침이 글자를 en 모드로 푼 값으로 읽게 하는 플러그인 코드 조각(DS-D-0080, 2026-10-08).**
//
// 보드 글자가 「Klipse Locale」 변수에 묶이면 `node.characters` 는 그 노드가 선 자리의 모드(페이지 · 섹션이 ko 로 남아 있으면 ko)로 풀린
// 값을 돌려준다 — 되읽기 · 라이브 대조가 en 측정과 어긋나 빨개진다. 탐침은 읽기 전용이라 모드를 바꿨다 되돌리지 않는다(원칙). 대신
// `boundVariables.characters` (인스턴스 글자 속성이면 `componentProperties[…].boundVariables.value`) 가 Locale 변수를 가리키면 그 변수의
// `valuesByMode[en 모드]` 를 값으로 쓰고, 어떤 변수를 읽었는지 `LOCALE.bound[LOCALE.scope][변수 이름]` 에 센다.
//
// 컬렉션이 없으면 `LOCALE` 은 null 이고 `charactersOf` · `propertyValueOf` 는 `node.characters` · `property.value` 를 그대로 돌려준다 —
// 탐침의 결과 바이트는 지금과 같다. 컬렉션이 있어도 묶인 글자가 하나도 없으면 `localeBoundOf()` 는 null 이다(결과에 아무것도 더하지 않는다).
//
// 낸 코드에 끼워 넣는 문자열이므로 역따옴표와 `${` 를 쓰지 않는다. 함수 본문(async) 안, 최상위에 한 번 놓는다.

export const LOCALE_COLLECTION = "Klipse Locale";

export const LOCALE_READ_SNIPPET = String.raw`// DS-D-0080 — 「Klipse Locale」 이 있으면 글자는 en 모드로 푼 값을 읽는다(페이지가 ko · ja 로 남아 있어도 같다). 읽기 전용: 모드를 바꾸지 않는다.
const LOCALE = await (async () => {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collection = collections.find((entry) => entry.name === "Klipse Locale");
  if (!collection) return null;
  const en = collection.modes.find((mode) => mode.name === "en");
  if (!en) throw new Error("되읽기 실패 — Klipse Locale 컬렉션에 en 모드가 없습니다: " + collection.modes.map((mode) => mode.name).join(" | "));
  const variables = await figma.variables.getLocalVariablesAsync("STRING");
  const byId = new Map(variables.map((variable) => [variable.id, variable]));
  const modeIdOf = (variable) => variable.variableCollectionId === collection.id
    ? en.modeId
    : (collections.find((entry) => entry.id === variable.variableCollectionId) || {}).defaultModeId;
  const values = new Map();
  for (const variable of variables) {
    if (variable.variableCollectionId !== collection.id) continue;
    let value = variable.valuesByMode[en.modeId];
    for (let hop = 0; hop < 8 && value && typeof value === "object" && value.type === "VARIABLE_ALIAS"; hop += 1) {
      const next = byId.get(value.id);
      value = next ? next.valuesByMode[modeIdOf(next)] : undefined;
    }
    if (typeof value !== "string") throw new Error("되읽기 실패 — Klipse Locale 변수의 en 값이 글자가 아닙니다: " + variable.name);
    values.set(variable.id, { name: variable.name, value });
  }
  return { values, bound: {}, scope: "" };
})();
const localeRead = (alias, fallback) => {
  const hit = alias && LOCALE ? LOCALE.values.get(alias.id) : null;
  if (!hit) return fallback;
  const bag = (LOCALE.bound[LOCALE.scope] = LOCALE.bound[LOCALE.scope] || {});
  bag[hit.name] = (bag[hit.name] || 0) + 1;
  return hit.value;
};
const charactersOf = (node) => {
  const bound = node.boundVariables && node.boundVariables.characters;
  return localeRead(Array.isArray(bound) ? bound[0] : bound, node.characters);
};
const propertyValueOf = (property) => localeRead(property.boundVariables && property.boundVariables.value, property.value);
const localeBoundOf = () => (LOCALE && Object.keys(LOCALE.bound).length > 0
  ? { collection: "Klipse Locale", mode: "en", variables: LOCALE.bound }
  : null);
`;
