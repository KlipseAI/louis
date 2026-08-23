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
| Figma 파일 권한 | 조립도 검증도 못 한다 | **파일이 둘이고 역할이 다르다.** DS 정본 라이브러리 `bxGEp0km5zluMJGulaTvFW`(변수·style·component, `verify-figma-parity` 대상)와 제품 화면 이식 보드 `OlYKERKOkgbxBEEoXGZW2c`. 둘 다 쓰기 권한이 필요하다. 제품 미러 `CNORJOONt4z0a4Bl22Kjuu` 는 **읽기 전용**이다 |
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
pnpm verify        # 27단계 전량 — 제품 저장소가 있어야 한다
pnpm verify:ci     # 13단계 — 제품 저장소 없이 도는 것만. hosted CI 가 이걸 돈다
                   # 나머지 14단계는 verify:product 다
pnpm clean-room    # 러너 재현: 커밋된 HEAD 만 clone + --frozen-lockfile 새 설치
```

- **CI 초록은 게이트 13개가 통과했다는 뜻이다.** 전량이 아니다.
- **`pnpm verify` 는 exit 0 이어야 한다.** 제품 저장소가 없으면 exit 1 로 그 자리에서 멈춘다 —
  「조용히 초록」이 되지는 않는다. 실측으로 확인했다: 없는 경로를 주면 exit 1 · `SKIPPED` **0줄**.
- `SKIPPED` 를 눈으로 보려면 개별 게이트를 직접 돌려야 한다(`verify-product-render` 등 7개).
  `verify:product` 전체는 첫 게이트에서 죽어 거기까지 가지 않는다.
- 푸시 전 절차: `pnpm build` → `pnpm check` → `pnpm verify` → `pnpm clean-room`.
### CI 가 빨갛다면 — 먼저 결제를 의심하라

2026-08-22 기준 **hosted CI 는 GitHub 결제 문제로 멈춰 있다.** 마지막 러너 검증은 `bc6a8b47`
초록이고, 그 뒤 `01b767b9` · `524bc986` 두 커밋은 러너가 **작업을 시작조차 하지 않았다.**

```
$ gh api repos/KlipseAI/louis/check-runs/<job-id>/annotations -q '.[0].message'
The job was not started because recent account payments have failed or your spending
limit needs to be increased. Please check the 'Billing & plans' section in your settings
```

이 실패는 목록에서 게이트 실패와 **똑같이 `failure` 로 보인다.** 실패 로그도 없다. 코드를
고치려 들기 전에 이렇게 구별하라.

```bash
rid=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')
jid=$(gh api repos/KlipseAI/louis/actions/runs/$rid/jobs -q '.jobs[0].id')
gh api repos/KlipseAI/louis/actions/runs/$rid/jobs -q '.total_count'    # 0 이면 워크플로 파일이 거부됨
gh api repos/KlipseAI/louis/check-runs/$jid/annotations -q '.[].message'  # ← 판정은 여기서 한다
gh api repos/KlipseAI/louis/actions/runs/$rid/jobs \
  -q '.jobs[0].steps[] | select(.conclusion=="failure") | .name'        # 비면 단계가 하나도 안 돌았다
```

**`total_count` 만으로는 못 가른다 — 2026-08-23 에 실측으로 드러났다.** `cc11fac0` 의 런은
`total_count` 가 **1** 인데도 결제 차단이었다. job 레코드는 만들어지고 **단계가 하나도
실행되지 않는다.** 즉 `total_count: 0` 은 워크플로 파일 거부(Updates (96))를 뜻하지만, 그
역은 성립하지 않는다.

판정 순서는 이렇다.

| 신호 | 뜻 |
| --- | --- |
| `total_count` 가 0 | 워크플로 파일이 파싱되지 않았다 — 저장소 문제다 |
| annotation 이 결제를 말한다 | 저장소 문제가 아니다. **실패한 단계는 0개다** |
| 실패한 단계 이름이 나온다 | 진짜 게이트 실패다. 그때 코드를 본다 |

**결제가 풀릴 때까지 로컬 `pnpm verify` + `pnpm test` + `pnpm clean-room` 이 유일한 검증
통로다.** 밀린 커밋은 결제 복구 후 러너에서 한 번 확인해야 한다.

- 배분은 `scripts/verify-gate-split.mjs` 가 지킨다. 게이트를 추가하면 `verify:ci` 나
  `verify:product` 중 한쪽에 넣는다 — `verify` 에 직접 붙이면 막힌다.

## 4. Figma 보드의 현재 상태

**파일이 둘이다. 섞지 마라.** 2026-08-22 에 Figma 에서 직접 세었다.

| | `bxGEp0km5zluMJGulaTvFW` (DS 정본 라이브러리) | `OlYKERKOkgbxBEEoXGZW2c` (제품 화면 이식 보드) |
| --- | --- | --- |
| 페이지 | Cover · Foundations · Components · Patterns · Templates · Product inventory | 여정 순 8페이지 |
| collection | `Klipse Primitive` · `Klipse Semantic` · `Klipse Semantic Color` | `1 · Palette` · `2 · Semantic`(4모드) · `3 · Scale` |
| 변수 · text · effect | 345 · 15 · 8 | 299 · 46 · 4 |
| 게이트 대상 | `verify-figma-parity` · `readback.json` · `snapshot.json` | 없음(보드는 게이트 밖) |

**collection 이름 체계가 달라 그냥 옮길 수 없다.** `figma-sync.md` 가 「이전 중」이라 적은
작업은 끝나지 않았고, 그 사이 이식 보드가 독자 구조로 자랐다. 옮기려면 매핑을 먼저 정한다.

이식 보드는 8페이지 · 21섹션 · **95프레임** · 컴포넌트 319개 · 인스턴스 907개다.
검산식은 `48개 × 2 − 1(print 는 반응형 분기 없음) = 95` 다.

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
| **제품 커밋 `a3ed8e03` 이 원격에 없다** | 락은 2026-08-22에 `origin/design` `a89fc0d5` 로 내렸으므로 **더는 이 커밋에 의존하지 않는다**. 다만 커밋 자체는 여전히 이 맥의 로컬 `design` 브랜치에만 있다(`origin/design` +1). 푸시는 owner 결정이다 — Updates (98) |
| **제품 워킹트리에 미커밋 12줄** | `apps/web/app/globals.css` 가 `html[data-theme="dark"]` 와 `[data-landing-walkthrough-dark]` 에서 `--dropdown-frame` 을 `palette-gray-000-rgb / 16%` 로 뒤집는다 — 곧 **다크에서 `--dropdown-frame` 이 `--dropdown-frame-on-dark`(`globals.css:59`)와 같은 값이 된다.** 제품 주석이 그렇게 적는다. **DS 규범 셋은 그 반대를 적는다** — [elevation-layer](../foundations/elevation-layer.md) 46행(단일 값) · [product-reading-traps](../foundations/product-reading-traps.md) 215행(「같다 — 테마 무관」) · [Updates](../updates/README.md) 배너. 측정은 `git show <commit>:<path>` 로 읽으므로 지금은 게이트가 못 본다. **커밋되는 순간** `verify-product-evidence` 가 빨개지고 규범 셋을 같은 변경 단위에서 고쳐야 한다. 커밋 전에는 규범을 고치지 마라 — 인용할 커밋이 없다 |
| **락 신선도를 보는 게이트가 없다** | 근거 락이 인용 집합과 어긋나도 통과한다 — 실제로 근거 하나(`mypage/upgrade/checkout/page.tsx`)가 아무도 인용하지 않는 채 남아 있었다. 새로 인용된 파일이 빠지는 쪽이 더 위험하다. Updates (98) ④ |
| DS 값 359건이 제품 대조 없이 정해져 있음 | [08-19 인계서](handoff-2026-08-19-product-parity.md)가 소유하는 **본류**. (A2) 반증 285축은 2026-08-22에 [`migration/product-has-refutation.json`](../../migration/product-has-refutation.json) 으로 건져 냈고 `verify-refutation-quotes` 가 지킨다 — 확인 231 · 인용 무효로 기각 15 |
| `.authored/` 컴포넌트 13종(34회 사용)에 제품 출처 없음 | 미해결 |
| P3 `packages/{css,react}` 가 `private: true` · `0.0.0` | 발행 미결정 |
| P4 `apps/docs` 가 placeholder | 검색·접근성·버전 표시·예제 격리·AI 문서 URL 계약을 먼저 승인해야 프레임워크를 고른다 |
| ActionMenu 트리거의 중첩 `<button>` | 브라우저 테스트 2곳에서 하이드레이션 경고. `AnchoredTrigger` 에 `asChild` 가 없어 소비자에게 대안이 없다 |
| `/mypage/upgrade` 비교표 대비 1.42:1 | **제품 결함이다.** 보드에서 고치지 마라 |
| **낡은 지시 43건** | [정리 목록](../../migration/stale-doc-worklist.md)에 있다. `execution-handoff`(16) · `execution-playbook`(11) · [08-19 인계서](handoff-2026-08-19-product-parity.md)(13) · `roadmap`(3). **이 넷은 지금도 작업 계약으로 읽히므로 배너로 못 덮는다** — 항목별로 고쳐야 한다. 기록 성격 문서 6종은 경고 배너로 처리 완료 |
| 구 저장소 `~/klipse` | `design/audits/` · `design/legacy/highlight-standalone.md` · `design/figma/` · DS 스크립트 8개 · `DESIGN_SYSTEM.md`(4,412줄)를 단독 보유. 지우기 전에 대조가 필요하다 |

## 6. 처음 30분

```bash
git clone git@github.com:KlipseAI/louis.git && cd louis
corepack enable && pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium   # 없으면 verify-test-harness 가 죽는다
export KLIPSE_PRODUCT_REPO=~/klipse-web        # 없으면 verify:product 첫 게이트에서 exit 1 로 죽는다
pnpm build && pnpm check && pnpm verify        # exit 0 이면 27단계 전량 통과. exit 1 이면 그 자리에서 멈춘 것이다
```

그다음 읽는 순서는 `CLAUDE.md` → [실행 인계서](execution-handoff.md) →
[08-19 인계서](handoff-2026-08-19-product-parity.md) 다. Figma 를 만질 거라면
`.claude/skills/klipse-figma-transplant/SKILL.md` 를 먼저 읽는다.
