// 손으로 쓴 1회성 마이그레이션 도구다. use_figma에 그대로 넘긴다.
// **apply-variables.*.js 를 모두 실행한 뒤 마지막에 한 번 실행한다.** 아키텍처에서 제거된 토큰을
// 라이브 라이브러리에서 지운다. apply 가 semantic 의 alias 를 새 정본으로 이미 재지정한 뒤라야
// 안전하다 — 그 전에 지우면 아직 이 변수를 가리키는 alias 가 깨진다.
//
// 대상(DS-D-0047): 역할 이름을 가졌는데 아무도 그 역할을 쓰지 않는 여덟. 세 그룹을 통째로 지운다.
// `color/dropdown/*` 넷은 DS-D-0030 이 같은 그룹의 기하 셋을 지우며 「색이고 대상이 아니다」로
// 남겼던 나머지다 — 그 유예는 「그 결정의 범위 밖」이라는 뜻이었지 「남긴다」가 아니었고,
// 이제 일곱 이름 전체가 제품에서 사라진 것이 실증됐다(menu-popover.md, 앵커 ae8fd627 에서 참조 0).
// `color/surface/*` 셋과 `color/vem/properties-label` 은 `color/bg-canvas`·`color/fg-tertiary` 와
// 별칭 대상까지 같은 방치된 미러다. 값은 하나도 바뀌지 않는다 — check-token-diff 가 removal 16 ·
// value/aliasTarget 0 을 냈다. verify-figma-parity(:1343)와 check-figma-snapshot 이 proposal 이
// 선언하지 않은 변수를 실패로 보므로 반드시 지운다.
//
// 지우기 전에 확인한 것: 이 여덟을 alias 로 가리키는 다른 변수 0건(2026-09-03 라이브 전수).
// idempotent — 이미 없으면 건너뛴다.
//
// 앞선 대상(DS-D-0024 의 `color/inverse-alpha/{dark,light}-70`, DS-D-0030 의 미러 9개)은 적용을
// 마쳤고 라이브에 없다. 이 도구는 규칙이 아니라 목록 기반이라, 새 삭제가 필요할 때 목록을 갈아 끼운다.
const REMOVE = [
  "color/dropdown/ambient-ink",
  "color/dropdown/frame-ink",
  "color/dropdown/frame-ink-on-dark",
  "color/dropdown/surface-bg",
  "color/surface/background",
  "color/surface/foreground",
  "color/surface/primary-on",
  "color/vem/properties-label",
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
