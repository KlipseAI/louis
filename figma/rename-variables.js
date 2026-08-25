// 생성 보조물이 아니라 손으로 쓴 1회성 마이그레이션 도구다. use_figma에 그대로 넘긴다.
// **apply-variables.*.js 보다 먼저, 한 번 실행한다.** DS-D-0024(SEED식 색 아키텍처)로의
// 이름 이전을 **변수 ID를 보존한 채** in-place로 수행한다 — 그래야 컴포넌트 바인딩과 alias가
// 그대로 살아남는다. apply-variables 는 이름으로 변수를 찾으므로 rename을 표현하지 못한다
// (새 이름을 못 찾아 새 변수를 만들고 옛 변수를 orphan으로 남긴다). 이 스크립트가 그 간극을 메운다.
//
// 규칙(접두 치환, color/ 네임스페이스 한정):
//   neutral→gray · ink-alpha→static-black-alpha · black-alpha→static-black-alpha
//   paper-alpha→static-white-alpha · background-→bg- · foreground-→fg-
//   border-→stroke- · action-→accent- · scrim-→dim-
// inverse-alpha 는 새 아키텍처에서 제거 대상이라 rename하지 않는다 — remove-variables.js 가
// apply 이후(alias 재지정 후) 삭제한다.
//
// idempotent — 이미 새 이름이면 건너뛴다. 대상 새 이름이 이미 있으면 덮지 않고 conflict로 보고한다.
const RULES = [
  [/^color\/neutral\//, "color/gray/"],
  [/^color\/ink-alpha\//, "color/static-black-alpha/"],
  [/^color\/black-alpha\//, "color/static-black-alpha/"],
  [/^color\/paper-alpha\//, "color/static-white-alpha/"],
  [/^color\/background-/, "color/bg-"],
  [/^color\/foreground-/, "color/fg-"],
  [/^color\/border-/, "color/stroke-"],
  [/^color\/action-/, "color/accent-"],
  [/^color\/scrim-/, "color/dim-"],
];
function newName(n) {
  for (const [re, rep] of RULES) if (re.test(n)) return n.replace(re, rep);
  return null;
}
const report = { renamed: [], skipped: 0, conflicts: [] };
const all = await figma.variables.getLocalVariablesAsync();
const names = new Set(all.map((v) => v.name));
for (const v of all) {
  const nn = newName(v.name);
  if (!nn || nn === v.name) continue;
  if (names.has(nn)) {
    report.conflicts.push(v.name + " → " + nn + " (대상 이름 이미 존재)");
    continue;
  }
  const old = v.name;
  v.name = nn; // ID 보존 — 바인딩·alias 유지
  names.delete(old);
  names.add(nn);
  report.renamed.push(old + " → " + nn);
}
return {
  renamed: report.renamed.length,
  skipped: report.skipped,
  conflicts: report.conflicts,
  sample: report.renamed.slice(0, 12),
};
