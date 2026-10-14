#!/usr/bin/env node
// **보드를 늘리고 줄였을 때 제품처럼 반응하는지 — 시험 원장의 실패 수를 기준선으로 잠그는 래칫(2026-10-08).**
//
// 왜 있나: 기존 게이트는 측정 폭(1920 · 402)의 위치만 본다. 「Figma 100%」에 «프레임을 늘리고 줄였을 때
// 제품처럼 반응»이 들어왔고, 그것을 재는 탐침이 `scripts/build-figma-resize-probe.mjs` 다(보드를 시험 크기마다
// 작업 페이지에 복제해 재고 지운다). 이 게이트는 그 원장 `figma/resize-check.json` 을 읽어 보드별 실패를 센다.
// 원장은 Figma 를 다시 재야 바뀐다 — 생성기를 고친 뒤 탐침을 다시 보내고 merge 한 다음 이 게이트를 돈다.
//
// ── 실패 유형(시험 하나 = 보드 × 시험 크기) ─────────────────────────────────
//   overflow      폭 시험(데스크톱 1440 · 2560, 모바일 360 · 430)에서 보드 왼쪽 · 오른쪽 밖으로 나간 보이는 노드가 있다.
//   childOutside  부모 상자 밖으로 나간 자식이 원래 크기보다 늘었다(pn > 0 — 같은 보드를 크기 바꾸기 전에 잰 집합과 맞댄다).
//   textClip      고정 폭 글자가 부모보다 넓어진 것이 새로 생겼다(tn > 0).
//   heightFollow  높이 +30% 에서 보드 루트(`generated/…`)가 따라오지 않았다(루트 높이 / 보드 높이 < 0.99). 보드당 하나.
//   widthFollow   폭 시험에서 루트 폭이 보드 폭을 따라오지 않았다(rw < 0.99 — 넘침은 overflow 가 센다).
//   clamped       보드가 시험 크기를 받지 않았다(보드 자체의 최대 폭 등) — 반응을 잴 수 없었다.
//   noRoot        보이는 루트가 없다(보드 자식이 전부 숨김) — 루트 추종을 잴 수 없었다. 보드당 하나.
//   baseOverflow  측정 크기(크기를 바꾸기 전)에서 이미 보드 밖으로 넘친다. 보드당 하나.
//
// ── 래칫의 방향 ───────────────────────────────────────────────────────────
// 페이지 × 유형마다 `BASELINE` 과 같아야 한다. **늘면 빨강**(반응이 나빠졌다), **줄어도 빨강** — 고친 만큼 기준선을
// 내려 잠그라는 뜻이다(`check-derived-size-literals` 와 같은 관용: 한쪽만 잠그면 줄어든 여유로 다음 후퇴가 조용히 들어온다).
// 보드 수도 잠근다 — 보드가 빠져서 실패가 준 것을 이득으로 읽지 않게.
//
// ── 어느 갈래인가 (제안만, 아직 package.json 에 넣지 않았다) ─────────────────
// 원장이 저장소 안에 있고 제품 저장소를 읽지 않으므로 verify:ci 에 들어갈 수 있다. 다만 원장은 사람이 탐침을 다시
// 보내야만 바뀌므로, 생성기 수정과 원장 갱신이 같은 변경 단위에 오지 않으면 이 게이트는 낡은 값을 잠근다.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LEDGER = "figma/resize-check.json";
const TYPES = ["overflow", "childOutside", "textClip", "heightFollow", "widthFollow", "clamped", "noRoot", "baseOverflow"];
const FOLLOW_MIN = 0.99;

// 2026-10-08 run 2026-10-08a 실측(보드 142장 · 시험 426). 줄면 여기를 같은 수로 내린다.
const BOARDS = { "01-public": 20, "02-auth": 18, "03-app": 56, "04-billing": 34, "05-ops": 14 };
// 무엇이 들어 있나: heightFollow 는 거의 전부다 — 보드 루트가 세로 HUG 라 보드 높이를 따라오지 않는다(루트 높이 / 보드 높이
// 0.769 = 1/1.3). overflow 의 뿌리는 대부분 고정 폭 상단 바(`header`, 1920 · 402 에 묶여 1440 에서 +480, 360 에서 +42)다.
// clamped 6 은 랜딩 · /privacy · /terms 의 데스크톱 2560 · 모바일 430(보드가 넓어지지 않는다), noRoot 16 은 03 앱의
// 레시피 측정 보드(2909:*)로 보이는 자식이 없었다. baseOverflow 4 는 측정 크기에서 이미 넘친다(/privacy 모바일 550 노드 등).
// run 2026-10-08b(d09ff6a1 반응 수정 · e82574a7 재측정을 보낸 뒤): 높이 미추종 126 → 24(공개 17 은 문서 길이 페이지라 기대값 —
// 높이 +30% 에서 루트가 내용 높이에 머문다). 03-app 의 넘침 2 → 10 · 부모 밖 14 → 23 은 처음 그린 상태 보드(커맨드 팔레트 넷 · 연체 배너)가
// 잴 수 있게 된 몫이다(전에는 noRoot 16) — 팔레트 배경 div 가 1440 에서 +480, 연체 배너 닫기 단추가 +468/+30. 공개 모바일 360 의 상단 바
// +42 는 /pricing · /inquiry · /blog/[slug] 모바일이 안전 검사로 재전송되지 못한 옛 렌더라 남았다.
// run 2026-10-08c(b868655e · e3a2b8d8 를 보낸 뒤): 03-app 넘침 10 → 1 · 부모 밖 23 → 14(팔레트 배경 STRETCH · 대화 상자 FILL + 최대 폭 ·
// 배너 닫기 단추 오른쪽 · 가운데), 01-public 12 → 11. 남은 공개 넘침은 안전 검사로 재전송되지 못한 /pricing · /inquiry · /blog/[slug] 모바일의
// 옛 상단 바와 측정 폭에서부터 넘치는 /privacy · /terms 모바일이다.
// run 2026-10-09a(새 앵커 54b62a8a · DS-D-0082 보드를 보낸 뒤): **후퇴 둘 — 다음 세션에서 고친다.** ① 01-public 글자 잘림 1 → 8: 푸터
// 모바일 주소 칸이 「감기는 줄의 외톨이는 측정 폭 FIXED」(a51d4b7c) 규칙으로 362 에 굳어 360 에서 +22 넘친다(보드 일곱). FIXED 대신 줄 폭을
// 따르는 규칙이 필요하다. ② 03-app 부모 밖 14 → 22: 하이라이트 상세 단계 보드가 새 스튜디오 판으로 바뀌며 늘었다. 원인(2026-10-09 조사): 넷(불러오기 · 분석 중 ·
// 실패 · 완료 데스크톱 1440)은 알림 줄의 auto margin 이 감싸개 padding 으로 굳은 것 — 조립 규칙 15조의 7 로 고쳤다(재측정 전, 기준선 그대로).
// 남은 넷은 모바일 360 · 430: 분석 중 · 업로드 중 모바일의 안내 문구 감싸개(감기는 줄에서 혼자 한 줄 — 15조의 7 밖)와 가운데 정렬 두 줄 글자
// (340 · 줄을 옮긴 HUG), 업로드 중 430 의 진행 막대(`flex-basis: 100%` 가 감기 줄에서 앞 줄로 붙는다), /highlight 모바일 설명 문단(제품 줄을
// 옮긴 글자 hugCarriedLines 의 HUG 390).
// run 2026-10-09b(56d60213 auto 여백 감싸개를 보낸 뒤): 03-app 부모 밖 22 → 18(하이라이트 데스크톱 1440 넷 해소, 모바일 넷 남음 — 조립 규칙
// 15조의 7 주석). 03-app 글자 잘림 0 → 1 은 /subscription/coupons 데스크톱(2076:3371) — 생성기가 더는 그리지 않는 옛 보드(리다이렉트된 화면)다.
// 은퇴 판정 전까지 기준선에 둔다.
// 2026-10-12(재측정 전, 기준선 그대로): 남은 하이라이트 모바일 넷 중 분석 중 · 업로드 중의 안내 문구 감싸개와 업로드 중 430 의 진행 막대를
// 「감기는 줄을 끊는 항목」(auto · basis, 조립 규칙 28조 표)으로 고쳤다. 가운데 정렬 두 줄 안내(340)와 /highlight 설명 문단(390)은
// 줄을 옮긴 HUG 를 FILL 로 돌리면 측정 폭 parity 를 잃어(hugCarriedLines 주석의 2026-10-12 판단) 남겼다.
// run 2026-10-12a(ea41f69d 보드 여섯을 보낸 뒤): 03-app 부모 밖 18 → 17. 분석 중 · 업로드 중 모바일 360 의 넘친 자식이 2 → 1(남은 하나는
// 가운데 정렬 두 줄 안내), 업로드 중 430 은 1 → 0. 글자 잘림 1 → 0 — /subscription/coupons 옛 보드 1440 의 넘친 글자가 사라졌다(보드 자체는 은퇴 판정 대기 그대로).
// run 2026-10-12b(막힌 33개를 소유자가 직접 실행한 뒤 — 그 보드들이 처음 새 판으로 재졌다): 01-public 글자 잘림 8 → 1, 03-app 넘침 1 → 0 ·
// 높이 따름 4 → 2 · 뿌리 없음 6 → 0, 05-ops 높이 따름 1 → 0. **03-app 부모 밖은 17 → 21 로 올린다** — 늘어난 넷 모두 새 판 보드의 360 칸이다.
// 셋(노드캔버스 「더 불러오기」 · 편집기 아카이브 · 편집기 「더보기 메뉴」 모바일)은 카드 제목 `truncate` 글자가 열 140 밖으로 나간 것인데 **제품도
// 그렇다** — 세로 flex · `items-start` 안의 nowrap 글자는 min-content 가 max-content 와 같아 열보다 좁아지지 않는다(크로미움 실측: 열 140 에 글자 172,
// 말줄임 없음). HUG 가 제품과 같은 반응이라 FILL · 말줄임으로 바꾸지 않는다. 나머지 하나(하이라이트 완료 모바일 220:3759)는 폭 324
// 고정 줄 안의 시간 글자 「1:30」 · 딱지 · 버튼 줄이 360 에서 밖으로 나간다(숨긴 `legacy//…` 묶음은 시험이 세지 않는다) — 조사 전.
// run 2026-10-14a(01-public 만 다시 쟀다 — `merge --pages 01-public`, 나머지 네 페이지는 2026-10-12b 그대로): 01-public 넘침 11 → 5 ·
// 부모 밖 15 → 10. 고친 셋 — ① 랜딩 하이라이트 · 끝 장면의 칸 · 카드(스크립트가 무대 크기로 `translate3d` 를 쓴다)가 MIN 으로 서서 1440 에서
// 무대 밖으로 108 · 151, 360 에서 22 나갔다 → 뷰포트 무대의 변환 배치 층은 SCALE, 같은 여백의 모바일 제목 칸은 STRETCH(조립 규칙 15조의 8).
// ② 공개 모바일 메뉴 판의 grid(366)가 360 에서 판 밖으로 24 — Figma 가 제약으로 줄어든 자동 배치 프레임의 FILL 자식을 다시 배치하지 않는다 →
// `fixed` 겹침을 채운 외동 절대 자식을 흐름 FILL 로(15조의 9). 공개 모바일 일곱(/ · /pricing · /templates · /templates/[slug] · /blog ·
// /blog/[slug] · /inquiry)을 다시 보냈다. ③ 탐침이 문서 뿌리(보드의 세로 HUG 자식)의 아래쪽 길어짐을 부모 밖으로 세던 것을 뺐다(랜딩 모바일
// 360 의 뿌리 +32 · /pricing 모바일 +1.8 — FAQ 답 · 푸터 링크가 한 줄씩 늘어난 것, 제품 문서도 길어진다).
// 남은 01-public 부모 밖 10: **데스크톱 1440 일곱(/ · /pricing · /templates · /templates/[slug] · /blog · /blog/[slug] · /inquiry)은 제품도
// 그렇다** — 푸터 눈금자(`TimelineFooter.tsx` RULER — `relative overflow-hidden`, 눈금 글자 72 개가 `left: index × 60px`)의 오른쪽 끝을 가로지르는
// 글자가 폭마다 바뀐다(크로미움 실측 앵커 54b62a8a: 1920 은 「00:29」 x 1908, 1440 은 눈금자 1272 에 「00:21」 x 1428 — 둘 다 잘린다). 랜딩 모바일
// 360 하나는 뉴스 카드 제목 둘(`h3` line-clamp-2, 줄을 옮긴 HUG 145 / 칸 129)이다 — 15 조 「줄을 옮긴 글자」의 2026-10-12 판단(Figma 에서 줄 폭을
// 재기 전에는 FILL 로 돌리지 않는다)에 걸려 남겼다. 나머지 둘은 /blog/[slug] 모바일 360(본문 그림 · 표 +26)과 /terms 모바일 360(목록 글자) — 조사 전.
// run 2026-10-14b(01-public · 03-app 만 다시 쟀다 — `merge --pages 01-public,03-app`, 02 · 04 · 05 는 2026-10-12b 그대로): 01-public 부모 밖 10 → 9 ·
// 03-app 21 → 17. 고친 셋 — ① 랜딩 모바일 360 의 뉴스 카드 제목(`line-clamp-2`)이 줄을 옮긴 HUG 145 로 129 칸 밖으로 16 → 줄 수를 자르는 글자는 칸 폭
// FILL + `maxLines` 말줄임(조립 규칙 15조의 10, 줄을 옮긴 글자 HUG 의 예외 — N 줄보다 길어질 수 없어 다시 감겨도 높이가 바뀌지 않는다). ② 하이라이트 완료
// 모바일 360 의 시간 눈금 「1:30」 · 끝 구간 막대가 MIN 으로 324 줄 밖에 6 · 42 → 백분율 시작 변의 절대 배치는 SCALE, 글자는 가까운 닻(15조의 11).
// ③ /archive seeded 데스크톱 1440 의 홈 배너 글 상자(`margin-inline: auto` 를 측정기가 잃어 padding 550 / 550 으로 굳음)가 60 으로 접혀 제목 · 버튼이 밖으로
// → 가로 줄 외동 항목의 auto 여백은 주축 CENTER(15조의 12). 보낸 보드: 랜딩 모바일 · 데스크톱 조각 01, 하이라이트 완료 데스크톱 · 모바일, /archive seeded
// 데스크톱, 편집기 데스크톱 조각 01 · 02(타임라인 구간 · 눈금의 SCALE). 03-app 의 나머지 둘(하이라이트 분석 중 · 업로드 중 모바일 360, 1 → 0)은 이 변경이 아니라
// 2026-10-12b 이후 다른 작업이 보낸 보드에서 줄었다. 같은 run 에서 시험 수는 그대로이고 보드 안 넘친 자식 수만 는 것: 노드캔버스 · 편집기 시드 모바일
// 360(2909:19790 · 19792 · 19794 — 카드 제목 nowrap, 제품 같음) · 편집기 모바일 360(39:1520) · 편집기 데스크톱 1440(39:3 — 타임라인 트랙 1888 고정 폭 둘 ·
// 미리보기 1216, 이 변경의 제약은 아니다).
const BASELINE = {
  "01-public": { overflow: 5, childOutside: 9, textClip: 1, heightFollow: 17, baseOverflow: 2 },
  "02-auth": { childOutside: 5 },
  "03-app": { childOutside: 17, heightFollow: 2 },
  "04-billing": { childOutside: 8, heightFollow: 2 },
  "05-ops": { overflow: 4, childOutside: 4 },
};

const fail = (message) => {
  console.error(`[figma-resize] ${message}`);
  process.exit(1);
};

let ledger;
try {
  ledger = JSON.parse(readFileSync(resolve(repoRoot, LEDGER), "utf8"));
} catch (error) {
  fail(`${LEDGER} 를 읽지 못했습니다(${error.message}) — scripts/build-figma-resize-probe.mjs 로 재고 merge 한다.`);
}
if (!Array.isArray(ledger.pages) || ledger.pages.length === 0) fail("원장에 페이지가 없습니다 — 잴 것이 없는 통과는 통과가 아닙니다.");

// 시험 키 → 요청 크기. 높이 시험은 보드 높이(소수 1자리로 반올림돼 실렸다)의 1.3배라 1px 를 허용한다.
const requested = (key, board) => {
  if (key === "h130") return { w: board.w, h: Math.round(board.h * 1.3) };
  const m = /^w(\d+)$/.exec(key);
  if (!m) fail(`${board.name}: 알 수 없는 시험 키 ${key}`);
  return { w: Number(m[1]), h: board.h };
};

const errors = [];
const counts = {};
const causes = new Map(); // 넘친 뿌리 이름 → { boards, px }
let tests = 0;
for (const page of ledger.pages) {
  const c = Object.fromEntries(TYPES.map((t) => [t, 0]));
  counts[page.slug] = c;
  if (BOARDS[page.slug] === undefined) errors.push(`${page.slug}: 기준선에 없는 페이지 — BOARDS · BASELINE 에 넣는다.`);
  else if (page.boards.length !== BOARDS[page.slug]) {
    errors.push(`${page.slug}: 보드 ${page.boards.length}장(기준 ${BOARDS[page.slug]}) — 보드 수가 바뀌면 BOARDS 를 고치고 실패 수를 다시 본다.`);
  }
  for (const board of page.boards) {
    const keys = board.name.startsWith("desktop") ? ledger.sizes.desktop : ledger.sizes.mobile;
    for (const key of keys) if (!board.v?.[key]) errors.push(`${page.slug} ${board.name.slice(0, 60)}: 시험 ${key} 결과가 없다.`);
    if (board.base?.o > 0) c.baseOverflow++;
    if (board.base?.rw == null) c.noRoot++;
    for (const key of keys) {
      const v = board.v?.[key];
      if (!v) continue;
      tests++;
      const want = requested(key, board);
      if (Math.abs(v.w - want.w) > 1 || Math.abs(v.h - want.h) > 1) c.clamped++;
      if (v.pn > 0) c.childOutside++;
      if (v.tn > 0) c.textClip++;
      if (key === "h130") {
        if (v.rh != null && v.rh < FOLLOW_MIN) c.heightFollow++;
      } else {
        if (v.o > 0) {
          c.overflow++;
          for (const [name, px] of v.top ?? []) {
            const label = `${name} (+${Math.round(px)}px @${key})`;
            causes.set(label, (causes.get(label) ?? 0) + 1);
          }
        }
        if (v.rw != null && v.rw < FOLLOW_MIN) c.widthFollow++;
      }
    }
  }
}

for (const [slug, c] of Object.entries(counts)) {
  const base = BASELINE[slug] ?? {};
  for (const type of TYPES) {
    const want = base[type] ?? 0;
    if (c[type] > want) {
      errors.push(`${slug} ${type}: ${c[type]}(기준선 ${want}) — 늘었다. 보드가 크기 변화에 덜 반응한다.`);
    } else if (c[type] < want) {
      errors.push(
        `${slug} ${type}: ${c[type]} 로 기준선 ${want} 보다 줄었다 — scripts/check-figma-resize.mjs 의 BASELINE["${slug}"].${type} 를 ${c[type]} 로 내려 잠근다.`,
      );
    }
  }
}
for (const slug of Object.keys(BASELINE)) if (!counts[slug]) errors.push(`${slug}: 기준선에 있는데 원장에 페이지가 없다.`);

const table = Object.entries(counts)
  .map(([slug, c]) => `  ${slug}: ` + TYPES.filter((t) => c[t]).map((t) => `${t} ${c[t]}`).join(" · "))
  .join("\n");
const topCauses = [...causes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, n]) => `  ${n}× ${label}`).join("\n");

if (errors.length) {
  for (const error of errors) console.error(`[figma-resize] ${error}`);
  console.error(`[figma-resize] 지금 수(run ${ledger.run}, 시험 ${tests}):\n${table}\n[figma-resize] 넘친 뿌리 상위:\n${topCauses}`);
  process.exit(1);
}
console.log(`[figma-resize] OK: run ${ledger.run} · 페이지 ${ledger.pages.length} · 시험 ${tests} — 기준선과 같다.\n${table}`);
