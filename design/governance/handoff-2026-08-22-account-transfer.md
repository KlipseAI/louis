---
id: governance-handoff-2026-08-22-account-transfer
status: beta
authority: reference
---

# 계정 이전 인계서 (2026-08-22)

작업이 **다른 계정·다른 컴퓨터로 넘어간다.** 이 문서는 그 경계에서 사라지는 것과, 사라지기
전에 저장소로 옮겨 둔 것을 적는다. 큐와 임무는 [실행 인계서](execution-handoff.md)가,
본류 작업은 [제품 실측 대조 인계서](handoff-2026-08-19-product-parity.md)가 소유한다.

## 1. 저장소를 따라오지 않는 것 넷

`git clone git@github.com:KlipseAI/louis.git` 로 오는 것은 이 저장소뿐이다. 다음 넷은 안 온다.

| 없는 것 | 없으면 벌어지는 일 | 갖추는 법 |
| --- | --- | --- |
| 제품 저장소 `klipse-web` | **게이트 13개가 `SKIPPED` 를 찍고 exit 0 한다.** 실패가 아니라 조용한 통과라서, 검증하지 않은 것을 검증했다고 착각한다 | clone 후 `export KLIPSE_PRODUCT_REPO=<경로>`. **`design` 브랜치를 fetch 했는지 확인한다** — 저장소 기본 브랜치는 `dev` 이고 `origin/main` 은 두 세대 낡았다 |
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

2026-08-19~22 에 hosted CI 가 9회 연속 빨갰고, 고치는 과정에서 결함 넷이 나왔다.
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
- **`pnpm verify` 출력에 `SKIPPED` 가 있으면 그 게이트는 안 돈 것이다.** 환경변수를 확인하라.
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
export KLIPSE_PRODUCT_REPO=~/klipse-web        # 없으면 게이트 13개가 조용히 꺼진다
pnpm build && pnpm check && pnpm verify        # 26단계가 다 돌았는지 SKIPPED 로 확인
```

그다음 읽는 순서는 `CLAUDE.md` → [실행 인계서](execution-handoff.md) →
[08-19 인계서](handoff-2026-08-19-product-parity.md) 다. Figma 를 만질 거라면
`.claude/skills/klipse-figma-transplant/SKILL.md` 를 먼저 읽는다.
