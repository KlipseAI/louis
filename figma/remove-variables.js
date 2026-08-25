// 손으로 쓴 1회성 마이그레이션 도구다. use_figma에 그대로 넘긴다.
// **apply-variables.*.js 를 모두 실행한 뒤 마지막에 한 번 실행한다.** DS-D-0024에서 제거된
// primitive 를 라이브 라이브러리에서 지운다. apply 가 semantic 의 alias 를 새 primitive 로 이미
// 재지정한 뒤라야 안전하다 — 그 전에 지우면 아직 이 변수를 가리키는 alias 가 깨진다.
//
// 대상: inverse-alpha 2계열(dark-70·light-70). 새 아키텍처는 static-white-alpha 로 통합했고
// 이 두 단계는 새 스케일에 대응이 없어 orphan 이다. verify-figma-parity(:1343)가 proposal 이
// 선언하지 않은 변수를 실패로 보므로 반드시 지운다.
// idempotent — 이미 없으면 건너뛴다.
const REMOVE = ["color/inverse-alpha/dark-70", "color/inverse-alpha/light-70"];
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
return report;
