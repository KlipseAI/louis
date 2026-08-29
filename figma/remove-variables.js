// 손으로 쓴 1회성 마이그레이션 도구다. use_figma에 그대로 넘긴다.
// **apply-variables.*.js 를 모두 실행한 뒤 마지막에 한 번 실행한다.** 아키텍처에서 제거된 토큰을
// 라이브 라이브러리에서 지운다. apply 가 semantic 의 alias 를 새 정본으로 이미 재지정한 뒤라야
// 안전하다 — 그 전에 지우면 아직 이 변수를 가리키는 alias 가 깨진다.
//
// 대상(DS-D-0030): 같은 역할을 두 이름으로 말하던 미러 9개. 제품이 미러가 아니라 역할 토큰을
// 집으면서 어느 쪽이 정본인지 실증됐다 — app/gnb 둘은 layout-app-shell-* 로, app/tooltip 넷은
// space-control-*·radius-control-sm·typography-caption-regular-* 로, dropdown 셋은
// radius-overlay·radius-overlay-item·space-overlay-inset 로 간다. 값은 하나도 바뀌지 않는다.
// verify-figma-parity(:1343)가 proposal 이 선언하지 않은 변수를 실패로 보므로 반드시 지운다.
//
// **`color/dropdown/*` 넷은 색이고 대상이 아니다.** 이름이 비슷해 휩쓸리기 쉬우니 적어 둔다.
// idempotent — 이미 없으면 건너뛴다.
//
// 앞선 대상(DS-D-0024 의 `color/inverse-alpha/{dark,light}-70`)은 2026-08-25 에 적용을 마쳤고
// 라이브에 없다. 이 도구는 규칙이 아니라 목록 기반이라, 새 삭제가 필요할 때 목록을 갈아 끼운다.
const REMOVE = [
  "app/gnb-main-inline-padding",
  "app/gnb-sidebar-padding-x",
  "app/tooltip-font-size",
  "app/tooltip-padding-block",
  "app/tooltip-padding-inline",
  "app/tooltip-radius",
  "dropdown/radius",
  "dropdown/item-radius",
  "dropdown/padding",
];
const report = { removed: [], notFound: [], blocked: [] };
const all = await figma.variables.getLocalVariablesAsync();
const byName = new Map(all.map((v) => [v.name, v]));
for (const name of REMOVE) {
  const v = byName.get(name);
  if (!v) {
    report.notFound.push(name);
    continue;
  }
  try {
    v.remove();
    report.removed.push(name);
  } catch (e) {
    report.blocked.push(name + " (" + (e && e.message) + ")");
  }
}
report.remainingTotal = (await figma.variables.getLocalVariablesAsync()).length;
return report;
