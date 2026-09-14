// **라이브 LOUIS 변수로 칠하는 렌더러 공용 조각(2026-09-14).** 이 파일은 Figma 플러그인 샌드박스 안에서 돈다 —
// 생성기가 `PLAN` 줄 바로 뒤, 렌더러 템플릿 앞에 붙여 draw.js 로 합친다. 생성기 쪽 짝은
// `scripts/lib/figma-live-variables.mjs` 다(계획의 `bindings` · `colorEvidence` 를 만든다).
//
// 앱 셸 렌더러(`figma-product-app-shell-renderer.js` 머리의 변수 블록)가 2026-09-13 에 먼저 세운 방식을 그대로 옮겼다:
//   · 컬렉션은 라이브 셋(`Klipse Primitive` · `Klipse Semantic` · `Klipse Semantic Color`)뿐이다. 은퇴한 컬렉션(조립 규칙
//     27번)을 찾지 않는다 — 계획이 라이브에 없는 컬렉션을 실으면 생성기(`assertBindings`)가 먼저 멈춘다.
//   · 모드가 여럿인 컬렉션(`B.modeCollection`)에만 측정 테마의 모드(`B.mode`)를 고정한다. 나머지는 기본 모드로 푼다.
//   · 페인트의 저장 색은 변수가 그 모드에서 풀리는 실제 값이다(조립 규칙 1번). 알파는 변수가 갖는다(2번).
// 계획은 칠하는 자리마다 **역할 이름**을 싣고(`paint: "<role>"`), 역할은 `B[role]`(변수) 이거나 `B.unbound[role]`
// (측정 색 고정 페인트 + 사유, 계획 `colorEvidence` 가 이유를 갖는다) 둘 중 하나다. 그 밖의 역할은 던진다.
const liveVariables = async (B) => {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionById = new Map(collections.map((entry) => [entry.id, entry]));
  const variables = await figma.variables.getLocalVariablesAsync();
  const variableById = new Map(variables.map((entry) => [entry.id, entry]));
  const variableByKey = new Map(variables.map((entry) => [`${collectionById.get(entry.variableCollectionId)?.name}\u0000${entry.name}`, entry]));
  const V = {};
  for (const [key, binding] of Object.entries(B)) {
    if (!binding || typeof binding !== "object" || typeof binding.collection !== "string") continue;
    const variable = variableByKey.get(`${binding.collection}\u0000${binding.name}`);
    if (!variable) throw new Error(`Missing variable ${binding.collection}/${binding.name}`);
    V[key] = variable;
  }
  const modeCollection = collections.find((entry) => entry.name === B.modeCollection);
  const pinnedMode = modeCollection?.modes.find((entry) => entry.name === B.mode);
  if (!modeCollection || !pinnedMode) throw new Error(`Missing mode ${B.modeCollection}/${B.mode}`);
  const resolve = (variable, seen = new Set()) => {
    if (seen.has(variable.id)) throw new Error(`Circular variable ${variable.name}`);
    seen.add(variable.id);
    const collection = collectionById.get(variable.variableCollectionId);
    const value = variable.valuesByMode[collection === modeCollection ? pinnedMode.modeId : collection?.defaultModeId];
    if (value?.type === "VARIABLE_ALIAS") {
      const target = variableById.get(value.id);
      if (!target) throw new Error(`Missing alias ${value.id} of ${variable.name}`);
      return resolve(target, seen);
    }
    if (value === undefined) throw new Error(`Missing mode value ${variable.name}`);
    return value;
  };
  const unbound = B.unbound ?? {};
  const channel = (value) => Math.round(value * 255);
  const keyOf = (r, g, b, a) => `${channel(r)},${channel(g)},${channel(b)},${Math.round(a * 1000) / 1000}`;
  const hex = (rgba) => `#${rgba.slice(0, 3).map((value) => channel(value).toString(16).padStart(2, "0")).join("")}`;
  const paint = (role) => {
    const variable = V[role];
    if (variable) {
      const value = resolve(variable);
      if (typeof value !== "object" || !("r" in value)) throw new Error(`${role} is not a colour variable`);
      return figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: value.r, g: value.g, b: value.b } }, "color", variable);
    }
    const fixed = unbound[role];
    if (!fixed) throw new Error(`Unknown colour role ${role}`);
    const [r, g, b, a] = fixed.color;
    return { type: "SOLID", color: { r, g, b }, opacity: a };
  };
  const pin = (node) => node.setExplicitVariableModeForCollection(modeCollection, pinnedMode.modeId);
  const bindCorners = (node, variable) => {
    for (const field of ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"]) node.setBoundVariable(field, variable);
  };
  // 아이콘 인스턴스의 벡터 칠 · 획을 한 역할로 칠한다(보이던 페인트만, visible 은 그대로 둔다 — 조립 규칙 1번).
  const paintIcon = (instance, role) => {
    for (const vector of instance.findAllWithCriteria({ types: ["VECTOR"] })) {
      for (const field of ["fills", "strokes"]) {
        if (!Array.isArray(vector[field])) continue;
        vector[field] = vector[field].map((entry) => (entry.type === "SOLID" ? { ...paint(role), visible: entry.visible !== false } : entry));
      }
    }
  };
  // **보이는 페인트 감사.** 숨은 노드(자기 또는 조상이 visible=false — `retired/` 가 그렇다)와 `skip` 노드는 세지 않는다.
  // 변수에 묶이지 않은 보이는 페인트는 계획의 고정 역할(`B.unbound`) 색이거나, 인스턴스 안에서 품은 세트의 고정 역할
  // (`nested` — 다른 러너 계획이 사유와 함께 고정한 색)이거나, `allow(node)` 가 이름을 댄 것이어야 한다.
  // 돌려주는 `unboundColors` 는 앱 화면 러너의 같은 이름 보고와 같은 뜻이다 — 이 러너가 고정 페인트로 칠한 역할과 그 수.
  const audit = (roots, { allow = () => null, skip = [], nested = [] } = {}) => {
    const fixedRoles = new Map(Object.entries(unbound).map(([role, entry]) => [keyOf(...entry.color), role]));
    const nestedRoles = new Map(nested.map((entry) => [keyOf(...entry.color), `nested ${entry.source}/${entry.role}`]));
    // 노드는 id 로 가린다 — 플러그인 API 의 노드 객체가 조회마다 같은 참조라고 기대하지 않는다.
    const skipIds = new Set(skip.map((node) => node.id));
    const counts = {};
    const allowed = {};
    const unexpected = [];
    let visible = 0;
    let bound = 0;
    const walk = (node, inInstance) => {
      if (node.visible === false || skipIds.has(node.id)) return;
      const inside = inInstance || node.type === "INSTANCE";
      for (const field of ["fills", "strokes"]) {
        if (!Array.isArray(node[field])) continue;
        for (const entry of node[field]) {
          if (entry.type !== "SOLID" || entry.visible === false || entry.opacity === 0) continue;
          visible += 1;
          if (entry.boundVariables?.color) {
            bound += 1;
            continue;
          }
          const key = keyOf(entry.color.r, entry.color.g, entry.color.b, entry.opacity ?? 1);
          const role = fixedRoles.get(key);
          const reason = role ? null : (inside && nestedRoles.get(key)) || allow(node, field);
          if (role) counts[role] = (counts[role] ?? 0) + 1;
          else if (reason) allowed[reason] = (allowed[reason] ?? 0) + 1;
          else unexpected.push({ node: node.name, id: node.id, field, color: hex([entry.color.r, entry.color.g, entry.color.b]), opacity: entry.opacity ?? 1 });
        }
      }
      if ("children" in node) for (const child of node.children) walk(child, inside);
    };
    for (const root of roots) walk(root, false);
    if (unexpected.length) throw new Error(`Unexpected unbound visible paints ${JSON.stringify(unexpected.slice(0, 12))}`);
    return {
      visiblePaintCount: visible,
      boundVisiblePaintCount: bound,
      allowedFixedPaintCounts: allowed,
      unboundColors: Object.entries(unbound).map(([role, entry]) => ({ role, color: hex(entry.color), alpha: entry.color[3], paints: counts[role] ?? 0 })),
    };
  };
  return { V, pin, paint, paintIcon, bindCorners, audit, mode: `${B.modeCollection}/${B.mode}` };
};
