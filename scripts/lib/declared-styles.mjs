// **선언된 CSS 원문을 브라우저에게 직접 받아온다.** `getComputedStyle`이 해결해 버린 의도를 되살리는
// 유일하게 권위 있는 경로다.
//
// ## 왜 CDP인가
//
// 대안 셋을 검토했고 전부 더 나빴다.
//   1. **Tailwind 재구현** — 유틸리티 정렬 순서, `@layer`, `--spacing` 같은 테마 변수, 임의값 이스케이프를
//      전부 흉내내야 한다. 제품이 클래스를 바꾸면 조용히 틀린다.
//   2. **오프라인 캐스케이드 재구성** — `document.styleSheets`를 덤프해 우리가 specificity/순서/`!important`/
//      layer를 다시 계산해야 한다. 캐스케이드 규칙을 우리가 다시 구현하는 셈이라 틀리기 쉽다.
//   3. **in-page `element.matches()` 순회** — 셀렉터 매칭 자체는 브라우저가 하지만 규칙 수 × 노드 수가
//      곱으로 늘어난다(Tailwind는 규칙이 수천 개다).
//
// CDP `CSS.getMatchedStylesForNode`는 **브라우저 자신의 캐스케이드 결과**를 순서대로 준다. 실측 검증:
// `width:50%`가 `"50%"` 원문 그대로 나온다.
//
// ## 비용 (실측)
//
// 902노드 + CSS 규칙 3,000개 페이지에서 **총 419ms**
// (`DOM.getDocument` 10ms · 경로 매핑 0ms · `CSS.getMatchedStylesForNode` 409ms, 64개씩 병렬).
// route당 1초 미만이므로 20 route로 확장해도 문제없다.

/** 크기 출처 판정에 필요한 선언 속성. 이 목록 밖은 버려 payload를 줄인다. */
export const DECLARED_PROPERTIES = Object.freeze([
  "width", "height",
  "min-width", "min-height", "max-width", "max-height",
  "flex", "flex-grow", "flex-shrink", "flex-basis",
  "align-self", "justify-self",
  "grid-template-columns", "grid-template-rows", "grid-column", "grid-row",
  "margin", "margin-left", "margin-right", "margin-top", "margin-bottom",
  "padding", "gap", "row-gap", "column-gap",
  "position", "inset", "top", "right", "bottom", "left",
  "aspect-ratio", "flex-wrap", "overflow",
]);

const ELEMENT_NODE = 1;

/**
 * 측정 트리와 **동일한 경로 스킴**으로 CDP DOM 트리를 걸어 `path → nodeId` 지도를 만든다.
 * 스킴이 어긋나면 선언값이 엉뚱한 노드에 붙으므로 `measure-dom.mjs`의 순회와 반드시 같아야 한다:
 * 요소 자식만 인덱스를 매기고, 경로는 `루트라벨 + "." + 인덱스` 체인이다.
 */
export function mapPathsToNodeIds(rootCdpNode, rootPath = "main") {
  const map = new Map();
  const walk = (node, path) => {
    map.set(path, node.nodeId);
    const children = (node.children || []).filter((child) => child.nodeType === ELEMENT_NODE);
    children.forEach((child, index) => walk(child, `${path}.${index}`));
  };
  walk(rootCdpNode, rootPath);
  return map;
}

/** CDP DOM 트리에서 셀렉터에 해당하는 루트 요소를 찾는다(간단한 tag/attribute만 지원). */
export function findCdpElement(node, predicate) {
  if (node.nodeType === ELEMENT_NODE && predicate(node)) return node;
  for (const child of node.children || []) {
    const found = findCdpElement(child, predicate);
    if (found) return found;
  }
  return null;
}

/** CDP 노드의 속성 배열(`["class","a b","id","x"]`)을 객체로 만든다. */
export function cdpAttributes(node) {
  const attributes = {};
  const list = node.attributes || [];
  for (let index = 0; index < list.length; index += 2) attributes[list[index]] = list[index + 1];
  return attributes;
}

/**
 * 경로별 **선언된** 스타일을 수집한다.
 *
 * 캐스케이드 적용 순서: `matchedCSSRules`는 약한 것부터 강한 순으로 오므로 순서대로 덮어쓰고,
 * 인라인 스타일을 마지막에 덮는다(가장 강함). `!important`는 CDP가 `important` 플래그로 알려주므로
 * 한 번 걸린 important 선언은 이후 일반 선언에 덮이지 않게 잠근다.
 *
 * @param {import("playwright").CDPSession} cdp
 * @param {Map<string, number>} pathToNodeId
 * @param {{chunkSize?: number, properties?: readonly string[]}} [options]
 * @returns {Promise<Map<string, Record<string,string>>>}
 */
export async function collectDeclaredStyles(cdp, pathToNodeId, options = {}) {
  const wanted = new Set(options.properties ?? DECLARED_PROPERTIES);
  const chunkSize = options.chunkSize ?? 64;
  const entries = [...pathToNodeId.entries()];
  const declared = new Map();

  for (let offset = 0; offset < entries.length; offset += chunkSize) {
    const slice = entries.slice(offset, offset + chunkSize);
    const responses = await Promise.all(
      slice.map(([, nodeId]) =>
        cdp.send("CSS.getMatchedStylesForNode", { nodeId }).catch(() => null),
      ),
    );
    responses.forEach((matched, index) => {
      if (!matched) return;
      const out = {};
      const important = new Set();
      const apply = (properties) => {
        for (const property of properties || []) {
          if (!wanted.has(property.name) || property.disabled) continue;
          // important로 굳은 선언은 일반 선언이 덮지 못한다.
          if (important.has(property.name) && !property.important) continue;
          out[property.name] = property.value;
          if (property.important) important.add(property.name);
        }
      };
      for (const rule of matched.matchedCSSRules || []) apply(rule.rule?.style?.cssProperties);
      apply(matched.inlineStyle?.cssProperties); // 인라인이 최우선
      declared.set(slice[index][0], out);
    });
  }
  return declared;
}

/**
 * 한 페이지의 선언 스타일을 통째로 받아온다. 측정기에서 이 함수 하나만 부르면 된다.
 *
 * @param {import("playwright").BrowserContext} context
 * @param {import("playwright").Page} page
 * @param {(node: object, attributes: Record<string,string>) => boolean} rootPredicate 루트 요소 판정
 * @param {{rootPath?: string, properties?: readonly string[]}} [options]
 */
export async function captureDeclaredStyles(context, page, rootPredicate, options = {}) {
  const cdp = await context.newCDPSession(page);
  try {
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: -1, pierce: false });

    // 루트를 body 자식 인덱스로 찾는 경우를 함께 지원한다. auth-fixture의 트리 루트는 런타임에
    // 정해지므로(viewport와 가장 크게 겹치는 body 자식) predicate가 그 인덱스를 받아야 한다.
    const body = findCdpElement(root, (node) => node.localName === "body");
    const bodyElements = (body?.children || []).filter((child) => child.nodeType === ELEMENT_NODE);
    const indexOfBodyChild = new Map(bodyElements.map((child, index) => [child.nodeId, index]));

    const rootElement = findCdpElement(root, (node) =>
      rootPredicate(node, cdpAttributes(node), indexOfBodyChild.get(node.nodeId)),
    );
    if (!rootElement) throw new Error("[declared-styles] 측정 루트 요소를 CDP 트리에서 찾지 못했습니다.");
    const pathToNodeId = mapPathsToNodeIds(rootElement, options.rootPath ?? "main");
    const declared = await collectDeclaredStyles(cdp, pathToNodeId, options);
    return { declared, nodeCount: pathToNodeId.size };
  } finally {
    await cdp.detach().catch(() => {});
  }
}

/**
 * **측정한 노드 그 자체를 키로 삼아** 선언 스타일을 받아온다.
 *
 * ## 왜 경로가 아니라 노드인가
 *
 * `mapPathsToNodeIds`는 `루트 + 자식 인덱스` 체인으로 두 패스를 잇는다. 그 키는 **위치**이므로
 * 두 패스 사이에 노드가 하나라도 mount/unmount 되면 뜻이 달라진다. 그리고 나빠지는 방식이 둘이다.
 *
 *   노드가 **사라지면** 뒤 형제가 그 인덱스로 당겨 들어온다 → 남은 경로들이 **엉뚱한 노드**의
 *   선언을 받는다. 경로가 존재하므로 아무도 실패하지 않는다. **조용히 틀린 데이터**다.
 *   노드가 **생기면** 뒤 형제가 밀린다 → 같은 일이 반대 방향으로 난다.
 *   운이 좋을 때만(체인이 짧아져 경로가 아예 없어질 때만) 「선언 스타일이 없는 측정 노드」로
 *   걸린다. 즉 지금의 하드 실패는 **증상의 일부만** 잡고 있었다.
 *
 * 반면 노드 참조는 위치가 아니라 동일성이다. React 의 재렌더는 대부분 같은 DOM 노드를 그대로
 * 두고 속성·텍스트만 바꾸므로 참조가 살아남고, 진짜 mount/unmount 만이 참조를 끊는다. 그리고
 * 끊긴 것은 `isConnected === false` 로 **정확히** 드러난다 — 몇 개가, 어느 노드가 빠졌는지까지.
 *
 * ## 어떻게 잇는가
 *
 * 측정 evaluate 가 잰 노드를 순서대로 페이지 전역 배열에 남긴다. 여기서는
 *   `Runtime.evaluate`   그 배열의 RemoteObject 를 얻고
 *   `Runtime.getProperties` 원소마다 objectId 를 **한 번의 호출로** 받고
 *   `DOM.requestNode`    objectId → nodeId 로 바꾼다
 * 그래서 왕복은 노드 수 + 2 회이고, 종전(`DOM.getDocument` 한 번 + 노드마다 조회)과 같은 차수다.
 *
 * @param {import("playwright").BrowserContext} context
 * @param {import("playwright").Page} page
 * @param {string} handleExpression 측정 노드 배열을 내는 페이지 표현식(예: `window.__x`)
 * @param {{properties?: readonly string[], chunkSize?: number}} [options]
 * @returns {Promise<{declared: Map<number, Record<string,string>>, resolved: number, total: number}>}
 *   `declared`는 **배열 인덱스**로 키를 매긴다 — 측정 트리의 순서와 1:1이다.
 */
export async function captureDeclaredStylesForHandles(context, page, handleExpression, options = {}) {
  const cdp = await context.newCDPSession(page);
  try {
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    await cdp.send("Runtime.enable");
    // `DOM.requestNode`는 프런트엔드가 document를 한 번 받아 둔 뒤에만 nodeId를 발급한다.
    await cdp.send("DOM.getDocument", { depth: -1, pierce: false });

    const handle = await cdp.send("Runtime.evaluate", {
      expression: handleExpression,
      returnByValue: false,
    });
    const arrayObjectId = handle.result?.objectId;
    if (!arrayObjectId) {
      throw new Error("[declared-styles] 측정 노드 배열을 페이지에서 찾지 못했습니다: " + handleExpression);
    }

    const { result: properties } = await cdp.send("Runtime.getProperties", {
      objectId: arrayObjectId,
      ownProperties: true,
    });
    // 숫자 키만, 그리고 **숫자로** 정렬한다. 문자열 정렬이면 10이 2보다 앞선다.
    const handles = properties
      .filter((entry) => /^\d+$/.test(entry.name) && entry.value?.objectId)
      .map((entry) => ({ index: Number(entry.name), objectId: entry.value.objectId }))
      .sort((left, right) => left.index - right.index);

    // 문서에서 떨어져 나간 노드는 nodeId 발급이 실패한다. 어느 쪽이든 **엉뚱한 노드에 붙지는
    // 않는다** — 그것이 이 조인을 쓰는 이유다. 왕복이 노드 수만큼이므로 아래 선언 조회와 같은
    // 폭으로 묶어 보낸다.
    const indexToNodeId = new Map();
    const requestChunk = options.chunkSize ?? 64;
    for (let offset = 0; offset < handles.length; offset += requestChunk) {
      const slice = handles.slice(offset, offset + requestChunk);
      const nodes = await Promise.all(slice.map(({ objectId }) =>
        cdp.send("DOM.requestNode", { objectId }).catch(() => null)));
      nodes.forEach((node, position) => {
        if (node?.nodeId) indexToNodeId.set(slice[position].index, node.nodeId);
      });
    }

    const declared = await collectDeclaredStyles(cdp, indexToNodeId, options);
    return { declared, resolved: indexToNodeId.size, total: handles.length };
  } finally {
    await cdp.detach().catch(() => {});
  }
}
