---
id: governance-handoff-2026-08-22-account-transfer
status: beta
authority: reference
---

# 계정 이전 인계서 (2026-08-22)

작업이 **다른 Claude Code 계정으로 넘어간다.** 이 문서는 그 경계에서 사라지는 것과, 사라지기
전에 저장소로 옮겨 둔 것을 적는다. 큐와 임무는 [실행 인계서](execution-handoff.md)가,
본류 작업은 [제품 실측 대조 인계서](handoff-2026-08-19-product-parity.md)가 소유한다.

## 0. 계정만 바뀌는가, 컴퓨터도 바뀌는가

두 경우의 손실이 다르다. **어느 쪽이든 대화 맥락은 0에서 시작한다** — 이 저장소가 유일한
전달 통로다.

| | 같은 맥 · 다른 Claude Code 계정 | 다른 컴퓨터 |
| --- | --- | --- |
| 대화 맥락 | **사라진다** | **사라진다** |
| 자동 메모(`~/.claude/projects/…/memory/`) | 작업 디렉터리별로 갈린다 — 아래 참조 | 사라진다 |
| 제품 저장소 `klipse-web` | 남는다 | 다시 clone 해야 한다 |
| `~/klipse-design-transplant` 번들 | 남는다 | 사라진다 — **이미 저장소로 옮겼다**(2절) |
| `.claude/settings.local.json` | 남는다(git 제외 대상이다) | 새로 만들어야 한다 |

**메모는 작업 디렉터리로 이름이 갈린다.** 이 작업의 규칙 11건은 원래
`-Users-sejunki-klipse-design-transplant` 이름 아래 쌓여 있었는데, 실제 작업은 이 저장소에서
한다. 2026-08-22 에 `-Users-sejunki-klipse-design-system` 쪽으로 복사해 두었다. 그래도
**메모에 의존하지 마라** — 규칙의 정본은 저장소 문서다. 메모에만 있고 문서에 없는 규칙이
있으면 그것은 문서의 결손이니 문서로 올려라.

## 1. 저장소를 따라오지 않는 것 넷

`git clone git@github.com:KlipseAI/louis.git` 로 오는 것은 이 저장소뿐이다. 다음 넷은 안 온다.

| 없는 것 | 없으면 벌어지는 일 | 갖추는 법 |
| --- | --- | --- |
| 제품 저장소 `klipse-web` | **`pnpm verify` 가 `verify:product` 첫 게이트에서 exit 1 로 죽는다** (`fatal: cannot change to …`). 제품을 읽는 게이트 13개 중 6개가 그렇게 죽고, 7개는 `SKIPPED` 를 찍고 exit 0 하는데 **앞의 6개가 먼저 죽어 거기까지 가지도 못한다** | clone 후 `export KLIPSE_PRODUCT_REPO=<경로>`. **`design` 브랜치를 fetch 했는지 확인한다** — 저장소 기본 브랜치는 `dev` 이고 `origin/main` 은 두 세대 낡았다 |
| Figma 파일 권한 | 조립도 검증도 못 한다 | 라이브러리 파일 `OlYKERKOkgbxBEEoXGZW2c` 쓰기 권한. 제품 미러 파일은 읽기 전용이다 |
| `klipse-docs` 저장소 | `/docs` 화면을 `klipse-web` 기준으로 그리게 된다 — 틀린다 | `/docs` 를 건드릴 때만 필요하다 |
| 원저자 맥의 `~/klipse-design-transplant` | 아래 2절 참조 | **이미 옮겼다.** 다시 만들 필요 없다 |

## 2. 이식 번들은 git 저장소가 아니었다

`~/klipse-design-transplant` 는 원격도 백업도 없이 한 대의 맥에만 있었다. 2026-08-22 에
**번들에만 있던 것**을 `migration/figma-transfer/bundle-2026-08-07/` 로 옮겼다. 판단은 짐작이
아니라 전수 대조로 했다 — 값을 뽑아 이 저장소에서 찾는 방식이다.

| 번들 | 대조 결과 |
| --- | --- |
| `patterns.txt` (3,304줄) | `migration/legacy-design-system.md` 에 **사실상 축자 이관**. 없는 줄 33개 중 20개가 헤딩 레벨, 나머지는 파일 헤더와 의도적 정정 |
| `foundations.txt` 토큰 255개 | 이 저장소 어디에도 없는 것 **7개** → 보존함 |
| `tokens.yaml` 구체값 118개 | 미적중 **0** |
| `KNOWN-ERRORS.md` 정오표 96건 | 구체값 126개 중 미적중 **1**. 정정은 복사가 아니라 **값에 적용**됐다 |
| `wip-page-specs/` 본체 | `migration/figma-transfer/` 에 이미 있다 (94~100%) |

**옮기지 않은 것:** `wip-page-specs/verification-runs/*.json` (4.6MB, 2026-08 워크플로 실행
로그). 설계 데이터가 아니라 과정 산물이라 남기지 않았다. 그 맥에서 사라진다.

자세한 계보와 「이 번들이 왜 낡았는가」는
[bundle-2026-08-07/README](../../migration/figma-transfer/bundle-2026-08-07/README.md) 에 있다.

## 3. 「초록」이 무엇을 뜻하는지가 바뀌었다

2026-08-18T04:12 부터 08-22T06:55 까지 hosted CI 가 **46회 연속** 빨갰고, 고치는 과정에서
결함 넷이 나왔다. (Updates (93)~(96) 은 이 수를 8·9 로 적었다 — 최근 목록만 보고 센 값이라
틀렸다. `gh run list --limit 200` 으로 다시 세면 46 이다.)
Updates (93)~(96) 에 각각의 전말이 있다.

| 결함 | 성격 |
| --- | --- |
| 게이트가 제품 저장소를 연다 | 러너에 없음 → 빨강 |
| `node_modules/.bin/esbuild` 가 낡은 심볼릭 링크 | 로컬에만 있음 → clean checkout 에서만 빨강 |
| **게이트 7개가 스스로를 끄고 exit 0** | 양쪽 다 초록인데 실제로는 안 돎 |
| 워크플로에서 `- name:` 이 빠짐 | 작업이 **0개** 실행 · 실패 로그도 없음 |

지금의 계약은 이렇다.

```bash
export KLIPSE_PRODUCT_REPO=~/klipse-web
pnpm verify        # 26단계 전량 — 제품 저장소가 있어야 한다
pnpm verify:ci     # 13단계 — 제품 저장소 없이 도는 것만. hosted CI 가 이걸 돈다
pnpm clean-room    # 러너 재현: 커밋된 HEAD 만 clone + --frozen-lockfile 새 설치
```

- **CI 초록은 게이트 13개가 통과했다는 뜻이다.** 전량이 아니다.
- **`pnpm verify` 는 exit 0 이어야 한다.** 제품 저장소가 없으면 exit 1 로 그 자리에서 멈춘다 —
  「조용히 초록」이 되지는 않는다. 실측으로 확인했다: 없는 경로를 주면 exit 1 · `SKIPPED` **0줄**.
- `SKIPPED` 를 눈으로 보려면 개별 게이트를 직접 돌려야 한다(`verify-product-render` 등 7개).
  `verify:product` 전체는 첫 게이트에서 죽어 거기까지 가지 않는다.
- 푸시 전 절차: `pnpm build` → `pnpm check` → `pnpm verify` → `pnpm clean-room`.
- 배분은 `scripts/verify-gate-split.mjs` 가 지킨다. 게이트를 추가하면 `verify:ci` 나
  `verify:product` 중 한쪽에 넣는다 — `verify` 에 직접 붙이면 막힌다.

## 4. Figma 보드의 현재 상태

라이브러리 파일 `OlYKERKOkgbxBEEoXGZW2c` — 8페이지 · 21섹션 · **95프레임** · 컴포넌트 319개 ·
인스턴스 907개. 검산식은 `48개 × 2 − 1(print 는 반응형 분기 없음) = 95` 다.

- 페이지는 사용자 여정 순이다(획득 → 가입 → 제작 → 결제 → 운영 + 자산 + 보류).
- 섹션 이름이 `§10.N.n · 라우트 글롭 · 한국어 이름 · 등급` 을 담아
  `migration/product-screens/10.*.md` 와 조인된다. 보드가 세 번째 분류 권위를 만들지 않는다.
- 자산 페이지는 **출처별**(= 검증 방법별)로 나뉜다: `logo/` `tile/` `icon/` `root/`
  `.glyph/`(제품 `.tsx` 인라인 — `.` 접두사가 라이브러리 발행을 막는다) `.authored/`.
- 조립 규칙 23조는 `design/governance/figma-screen-assembly.md`, 실행 절차는
  `.claude/skills/klipse-figma-transplant/SKILL.md` 가 소유한다. **스킬 0- 절에 이식 조건이 있다.**

## 5. 열려 있는 것

「완료」로 넘기지만 닫히지 않은 것은 정직하게 적는다.

| 항목 | 상태 |
| --- | --- |
| DS 값 359건이 제품 대조 없이 정해져 있음 | [08-19 인계서](handoff-2026-08-19-product-parity.md)가 소유하는 **본류** |
| `.authored/` 컴포넌트 13종(34회 사용)에 제품 출처 없음 | 미해결 |
| P3 `packages/{css,react}` 가 `private: true` · `0.0.0` | 발행 미결정 |
| P4 `apps/docs` 가 placeholder | 검색·접근성·버전 표시·예제 격리·AI 문서 URL 계약을 먼저 승인해야 프레임워크를 고른다 |
| ActionMenu 트리거의 중첩 `<button>` | 브라우저 테스트 2곳에서 하이드레이션 경고. `AnchoredTrigger` 에 `asChild` 가 없어 소비자에게 대안이 없다 |
| `/mypage/upgrade` 비교표 대비 1.42:1 | **제품 결함이다.** 보드에서 고치지 마라 |
| 구 저장소 `~/klipse` | `design/audits/` · `design/legacy/highlight-standalone.md` · `design/figma/` · DS 스크립트 8개 · `DESIGN_SYSTEM.md`(4,412줄)를 단독 보유. 지우기 전에 대조가 필요하다 |

## 6. 처음 30분

```bash
git clone git@github.com:KlipseAI/louis.git && cd louis
corepack enable && pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium   # 없으면 verify-test-harness 가 죽는다
export KLIPSE_PRODUCT_REPO=~/klipse-web        # 없으면 게이트 13개가 조용히 꺼진다
pnpm build && pnpm check && pnpm verify        # exit 0 이면 26단계 전량 통과. exit 1 이면 그 자리에서 멈춘 것이다
```

그다음 읽는 순서는 `CLAUDE.md` → [실행 인계서](execution-handoff.md) →
[08-19 인계서](handoff-2026-08-19-product-parity.md) 다. Figma 를 만질 거라면
`.claude/skills/klipse-figma-transplant/SKILL.md` 를 먼저 읽는다.
