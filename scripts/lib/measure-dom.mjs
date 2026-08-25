// 브라우저 안에서 도는 DOM 측정 helper의 **공용 원본**이다.
//
// **왜 소스 문자열인가.** 이 helper들은 Playwright `page.evaluate()` 안에서 실행된다. evaluate에 넘긴
// 함수는 문자열로 직렬화되어 브라우저로 건너가므로 **Node 쪽 import를 참조할 수 없다.** 그래서 helper를
// 보통의 ESM export로 빼면 쓸 수가 없다. 대신 소스를 문자열로 내보내고 `page.addInitScript()`로 주입해
// 모든 문서에서 `window.__km`으로 쓰게 한다.
//
// **왜 공용화하는가.** 2026-08-25 감사에서 route별 측정이 같은 helper를 복붙하고 있고, 더 나쁘게는
// **경로 스킴이 갈라져 있었다**(`/pricing`은 `"main.2.0.1"`, generic 측정은 `"."` 루트). 빌더가 경로로
// 조상을 거슬러 올라가므로(가시성 판정) 스킴이 갈리면 한 빌더가 두 측정을 못 읽는다. 여기서 통일한다.
//
// **capture 계약 (2026-08-25 추가):** `className`을 반드시 담는다. `getComputedStyle`은 **해결된 값**을
// 주기 때문에 `width:100%`와 `width:1920px`가 둘 다 `"1920px"`로 보인다 — 즉 "왜 그 크기인가"가 측정
// 단계에서 이미 소실된다. 제품은 Tailwind 임의값 클래스(`[width:100%]`, `flex-1`,
// `[grid-template-columns:...]`)로 의도를 선언하므로 className이 그 의도를 되살릴 1차 신호다.

/** 브라우저 문맥에 `window.__km`을 설치하는 소스. `page.addInitScript(MEASURE_DOM_SOURCE)`로 주입한다. */
export const MEASURE_DOM_SOURCE = `(() => {
  if (window.__km) return;
  const round = (value) => Math.round(value * 10000) / 10000;

  const rect = (element, relativeTo = null) => {
    if (!(element instanceof Element)) throw new Error("측정할 노드가 없습니다.");
    const bounds = element.getBoundingClientRect();
    const base = relativeTo ? relativeTo.getBoundingClientRect() : null;
    return {
      x: round(bounds.x - (base ? base.x : 0)),
      y: round(bounds.y - (base ? base.y : 0) + (base ? 0 : window.scrollY)),
      width: round(bounds.width),
      height: round(bounds.height),
    };
  };

  const ownText = (element) => [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\\s+/g, " ")
    .trim();

  const normalizeAssetUrl = (value) => {
    if (!value) return null;
    try {
      const url = new URL(value, location.origin);
      return url.origin === location.origin ? url.pathname + url.search : url.href;
    } catch {
      return value;
    }
  };

  const vectorAttributes = (element) => {
    if (!(element instanceof SVGElement)) return null;
    const attributes = {};
    for (const name of [
      "viewBox", "d", "points", "x", "y", "x1", "y1", "x2", "y2",
      "cx", "cy", "r", "rx", "ry", "fill", "stroke", "stroke-width",
      "stroke-linecap", "stroke-linejoin", "transform",
    ]) {
      const value = element.getAttribute(name);
      if (value !== null) attributes[name] = value;
    }
    return Object.keys(attributes).length > 0 ? attributes : null;
  };

  // 글자 한 자씩 Range로 재서 **실제 시각적 줄**을 만든다. Figma의 Pretendard 메트릭이 브라우저와
  // 미세하게 달라 줄바꿈 위치가 어긋나는 문제를 이 실측으로 막는다(가격/표 라벨이 잘못 접혔던 사고).
  const ownTextLines = (element) => {
    const lines = [];
    const textNodes = [...element.childNodes].filter((node) =>
      node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim());
    for (const textNode of textNodes) {
      const source = textNode.textContent ?? "";
      let active = null;
      for (let index = 0; index < source.length; index += 1) {
        const range = document.createRange();
        range.setStart(textNode, index);
        range.setEnd(textNode, index + 1);
        const bounds = range.getBoundingClientRect();
        range.detach();
        if (!bounds.width && !bounds.height) continue;
        const top = round(bounds.top + window.scrollY);
        const bottom = round(bounds.bottom + window.scrollY);
        if (!active || Math.abs(active.top - top) > 0.5) {
          active = {
            text: source[index],
            x: round(bounds.left + window.scrollX),
            y: top,
            width: round(bounds.width),
            height: round(bounds.height),
            top,
            right: round(bounds.right + window.scrollX),
            bottom,
          };
          lines.push(active);
        } else {
          active.text += source[index];
          active.x = Math.min(active.x, round(bounds.left + window.scrollX));
          active.right = Math.max(active.right, round(bounds.right + window.scrollX));
          active.bottom = Math.max(active.bottom, bottom);
          active.width = round(active.right - active.x);
          active.height = round(active.bottom - active.y);
        }
      }
    }
    return lines
      .map(({ top: _t, right: _r, bottom: _b, ...line }) => ({ ...line, text: line.text.replace(/\\s+/g, " ").trim() }))
      .filter((line) => line.text);
  };

  const snapshot = (element, path, axes) => {
    const computed = getComputedStyle(element);
    const style = {};
    for (const axis of axes) {
      let value = computed[axis];
      // 포트가 매번 달라지므로 origin을 지운다 — 안 지우면 --check가 매 실행 흔들린다.
      if (typeof value === "string") value = value.replaceAll(location.origin, "");
      style[axis] = value;
    }
    if (style.transformOrigin) style.transformOrigin = style.transformOrigin.replace(/\\s+/g, " ").trim();
    // Chrome은 폭 0인 테두리에도 살아 있는 색을 보고한다 — 게이트가 흔들리므로 투명으로 못박는다.
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      if (style["border" + side + "Width"] === "0px" || style["border" + side + "Style"] === "none") {
        style["border" + side + "Color"] = "rgba(0, 0, 0, 0)";
      }
    }
    if (element instanceof HTMLImageElement) style.color = "rgba(0, 0, 0, 0)";
    return {
      path,
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      role: element.getAttribute("role"),
      ariaLabel: element.getAttribute("aria-label"),
      // 크기 출처(sizing provenance)의 1차 신호. computed는 해결된 값이라 의도가 사라진다.
      className: typeof element.className === "string"
        ? element.className
        : (element.getAttribute("class") || null),
      ownText: ownText(element),
      ownTextLines: ownTextLines(element),
      href: element instanceof HTMLAnchorElement ? normalizeAssetUrl(element.href) : null,
      src: element instanceof HTMLImageElement ? normalizeAssetUrl(element.src) : null,
      alt: element instanceof HTMLImageElement ? element.alt : null,
      vector: vectorAttributes(element),
      rect: rect(element),
      style,
    };
  };

  // 경로 스킴은 **루트 라벨 + 자식 인덱스 체인** 하나로 통일한다(기본 "main").
  // 빌더가 이 문자열로 조상을 거슬러 가시성을 판정하므로 스킴이 갈리면 안 된다.
  const subtreeSnapshots = (root, options = {}) => {
    const axes = options.axes || [];
    const rootPath = options.rootPath || "main";
    const maxNodes = options.maxNodes || 2000;
    const nodes = [];
    const visit = (element, path) => {
      nodes.push(snapshot(element, path, axes));
      [...element.children].forEach((child, index) => visit(child, path + "." + index));
    };
    visit(root, rootPath);
    if (nodes.length > maxNodes) {
      throw new Error("측정 트리가 상한을 넘었습니다: " + nodes.length + " > " + maxNodes);
    }
    return nodes;
  };

  window.__km = { round, rect, ownText, ownTextLines, vectorAttributes, normalizeAssetUrl, snapshot, subtreeSnapshots };
})();`;

/**
 * route별 트리 상한. `/pricing`은 883노드지만 docs 계열은 2000을 넘을 것으로 예상돼 상한을 설정값으로 뺀다.
 * 상한의 목적은 무한 순회 방지이지 콘텐츠 절단이 아니다 — 넘으면 조용히 자르지 않고 **throw** 한다.
 */
export const DEFAULT_MAX_NODES = 2000;

/** 측정 트리의 경로에서 조상 경로들을 만든다. `"main.2.0"` → `["main", "main.2", "main.2.0"]` */
export function ancestorPaths(path) {
  const parts = path.split(".");
  return parts.map((_, index) => parts.slice(0, index + 1).join("."));
}
