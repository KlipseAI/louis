// **인스턴스의 TEXT 속성을 계획 값으로 채우는 렌더러 공용 조각(2026-09-14).** Figma 플러그인 샌드박스 안에서 돈다 —
// 생성기가 payload 줄 뒤, 렌더러 템플릿 앞에 붙인다. 생성기 쪽 짝은 `scripts/lib/figma-top-bar-text.mjs` 다.
//
// **키는 파일이 소유한다.** Figma 는 속성 이름 뒤에 id 를 붙여(`Label#1521:0`) 키를 만들고, 그 꼬리는 파일마다 다르다.
// 계획은 이름만 안다. 인스턴스의 TEXT 속성 이름 집합이 계획의 키 집합과 하나라도 다르면 던진다 — 속성이 없는 옛 세트에서
// 조용히 넘어가면 기본 라벨이 화면에 남는다(앱 셸 러너를 먼저 돌린다). 값이 null 인 속성(이 variant 가 묶지 않은 것)과
// 이미 같은 값인 속성은 건드리지 않는다. 바꾼 속성 이름을 돌려준다 — 적용 전 글자와 달라진 소비처를 러너 반환으로 센다.
const setTextProperties = (instance, values, where) => {
  const properties = instance.componentProperties;
  const keys = Object.keys(properties).filter((key) => properties[key].type === "TEXT");
  const nameOf = (key) => (key.includes("#") ? key.slice(0, key.indexOf("#")) : key);
  const names = keys.map(nameOf);
  const wanted = Object.keys(values);
  if (keys.length !== wanted.length || wanted.some((name) => names.filter((own) => own === name).length !== 1)) {
    throw new Error(`${where}: TEXT properties ${names.join(" | ") || "none"} differ from the plan ${wanted.join(" | ")} — run the app shell runner first`);
  }
  const patch = {};
  for (const name of wanted) {
    const key = keys[names.indexOf(name)];
    if (values[name] != null && properties[key].value !== values[name]) patch[key] = String(values[name]);
  }
  if (Object.keys(patch).length) instance.setProperties(patch);
  return Object.keys(patch).map(nameOf);
};
