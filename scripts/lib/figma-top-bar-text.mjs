// **측정 상단 바의 breadcrumb 글자 → 앱 셸 상단 바 세트의 TEXT 속성 값(2026-09-14).**
//
// 앱 셸 러너가 두 상단 바 세트(`Product/Desktop App Top Bar` · `Product/Mobile App Top Bar`)에 `Label`(Single) ·
// `Parent` · `Current`(Trail) TEXT 속성을 열었다. 세트 속성은 기본값이 하나라, 인스턴스가 채우지 않으면 기본 라벨
// (`Home` · `Settings` · `Analytics / YouTube analytics`)이 보인다. 결제 결과 · 체크아웃 · 업그레이드 장면 러너는 컴포넌트 안의
// 바 인스턴스를 제자리에서 다시 쓰면서 이 속성을 채우지 않아, 2026-09-14 앱 셸 적용 뒤 손으로 되채운 글자가 러너 실행이나
// variant 교체(`swapComponent`)에 그대로 남는지를 대조로만 볼 수 있었다. 이제 장면 생성기가 **자기 route 의 측정 바**에서
// 글자를 읽어 계획에 싣고, 렌더러 조각(`scripts/templates/lib/figma-instance-text.js`)이 이름으로 짝지어 채운다.
//
// 어느 글자가 어느 속성인지는 앱 셸 계획의 그 variant 의 `text[].property` 순서가 정한다 — 측정 breadcrumb 에서 구분자
// 「/」를 뺀 문서 순서와 같다. 보드 생성기의 치환 매처(`figma-component-substitution.mjs` 의 `topBarTextProperties`)가 같은
// 규칙을 계층 spec 위에서 쓰고, 여기서는 fixture 의 평탄한 측정 트리 위에서 쓴다. 돌려주는 객체는 세트의 속성 이름 **전부**를
// 키로 갖고, 이 variant 가 묶지 않은 속성은 null 이다(렌더러가 건드리지 않는다).
const byDocumentOrder = (left, right) => {
  const a = left.path.split(".");
  const b = right.path.split(".");
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    if (a[index] === b[index]) continue;
    const [x, y] = [Number(a[index]), Number(b[index])];
    return Number.isFinite(x) && Number.isFinite(y) ? x - y : a[index].localeCompare(b[index]);
  }
  return a.length - b.length;
};

export const topBarTextProperties = ({ tree, bar, appShellPlan, set, variant, fail, where }) => {
  const entry = [appShellPlan.component, appShellPlan.component?.desktopTopBar].find((candidate) => candidate?.componentSetName === set)
    ?? fail(`${where}: figma/product-app-shell.plan.json has no top bar set ${set}`);
  const spec = entry.variants.find((candidate) => candidate.name === variant) ?? fail(`${where}: ${set} plan has no variant ${variant}`);
  const bound = spec.text.filter((text) => text.property).map((text) => text.property);
  const inside = (node, root) => node.path.startsWith(`${root.path}.`);
  const nav = tree.filter((node) => inside(node, bar) && node.tag === "nav").sort(byDocumentOrder)[0]
    ?? fail(`${where}: measured top bar ${bar.path} has no <nav>`);
  const labels = tree.filter((node) => inside(node, nav) && node.ownText).sort(byDocumentOrder)
    .map((node) => node.ownText.trim()).filter((text) => text && text !== "/");
  if (labels.length !== bound.length) {
    fail(`${where}: ${set} · ${variant} binds ${bound.length} TEXT properties (${bound.join(" · ")}) but the measured breadcrumb has ${labels.length} (${labels.join(" | ")})`);
  }
  const names = entry.textProperties.map((property) => property.name);
  for (const name of bound) if (!names.includes(name)) fail(`${where}: ${set} textProperties has no ${name}`);
  return Object.fromEntries(names.map((name) => [name, bound.includes(name) ? labels[bound.indexOf(name)] : null]));
};

// 렌더러 앞에 붙이는 샌드박스 조각 — `setTextProperties(instance, values, where)`.
export const INSTANCE_TEXT_LIB = "scripts/templates/lib/figma-instance-text.js";
