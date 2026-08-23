---
id: governance-execution-playbook
status: experimental
authority: normative
---

# Claude Code 실행 플레이북

이 문서는 [실행 인계서](execution-handoff.md)의 작업 큐를 실제로 수행하기 위한 작업별 상세 절차다.
큐 ID, 의존성, 상태와 완료 조건의 정본은 인계서가 소유하며 두 문서가 충돌하면 인계서가 우선한다.
이 문서는 "무엇이 완료인가"를 바꾸지 않고 "어떤 순서로 무엇을 하는가"를 상세화한다.

작업 절차가 이 문서와 달라도 인계서의 완료 증거를 더 잘 충족한다면 그 방식이 옳다. 반대로 이
문서의 절차를 그대로 따랐다는 사실은 완료 증거를 대체하지 않는다.

## 1. 완성의 정의

이 저장소의 최종 목표는 두 가지다.

**목표 A — SEED 수준의 운영 사이클.** 제품이 version이 고정된 공개 package를 소비하고, token →
CSS → React → docs → release → adoption의 전체 사이클이 검증 게이트와 함께 반복 가능해야 한다.

**목표 B — Figma 재조립 능력.** published Klipse Design Figma library의 variables, styles,
component만으로 Klipse 제품의 실제 배포 화면을 detach 없이 재조립할 수 있어야 한다. SEED가
Figma library에 token, icon, component와 화면 template을 함께 제공하는 것과 같은 상태다.

### 최종 판정표

아래 항목이 전부 증거와 함께 충족될 때만 "완성"이라고 말한다. 부분 충족은 각 surface의
`partial`로만 표현한다.

| # | 판정 항목 | 증거 |
| --- | --- | --- |
| 1 | 공개 registry에서 `@klipse-design/tokens`, `css`, `react` 설치 가능 | registry artifact, 신규 consumer 설치 검증 |
| 2 | clean-checkout hosted CI에서 build/check/verify 통과 | hosted CI run 링크 |
| 3 | manifest 의 `not-planned` 아닌 모든 component·pattern 의 Web 상태가 실제 구현·테스트 근거를 가짐 | manifest + 테스트 결과 |
| 4 | 검색 가능한 공개 docs site와 stable llms.txt URL | hosted docs URL |
| 5 | published Figma library의 variables/styles/components가 코드와 parity 검증됨 | library key/version, parity report |
| 6 | 인스코프 배포 화면이 library instance만으로 Figma에서 재조립됨 — 대상과 등급은 `migration/product-screens/` 가 소유한다 | template 파일, gap 0 또는 승인된 gap 목록 |
| 7 | Klipse 제품의 핵심 route가 versioned package를 소비하고 legacy 신규 참조 0 | 제품 integration PR, rollback 검증 |
| 8 | breaking change에 changelog, migration, deprecation window 운영 | Updates, deprecation 대장 |

## 2. 실행 환경 게이트

세션을 시작하면 작업 선택 전에 다음을 확인한다.

```sh
node --version && pnpm --version          # Node 22 이상 · pnpm
pnpm install --frozen-lockfile            # devDependencies 가 실재한다 — 건너뛸 수 없다
pnpm exec playwright install --with-deps chromium   # 브라우저 바이너리는 lockfile 에 없다
export KLIPSE_PRODUCT_REPO=<klipse-web 경로>        # 없으면 verify:product 첫 게이트가 죽는다
git status --short --branch
```

**넷 다 갖춰져야 표준 명령(`pnpm build`·`check`·`verify`·`test`)이 성립한다.** 하나라도 빠지면
초록이 초록을 뜻하지 않는다.

- **`pnpm install` 은 항상 필요하다.** 「P3에서 devDependencies 가 생기기 전까지는 필요 없다」는
  전제가 깨졌다 — 루트에 devDependencies 가 있고 `typecheck`(tsc)와 `test`(vitest)가 그것을 쓴다.
  `--frozen-lockfile` 로 lockfile 을 고정한다.
- **브라우저 바이너리는 lockfile 에 없다.** 빠뜨리면 `verify-test-harness` 가
  `Executable doesn't exist at …chrome-headless-shell` 로 죽는다. hosted CI 의 첫 실행이 정확히
  그렇게 실패했다.
- **`KLIPSE_PRODUCT_REPO` 가 가장 조용한 함정이다.** 이 변수를 읽는 스크립트가 17개이고 그중
  **15개가 원저자 맥의 절대 경로를 기본값으로 갖는다.** 그 맥에서는 변수를 안 세워도 우연히
  통과하고, 다른 맥에서는 `verify:product` 첫 게이트가 `fatal: cannot change to …` 로 죽는다.
- **pnpm 없이 검증하는 등가 경로는 존재하지 않는다.** 한때 이 자리에 `node scripts/*.mjs` 세 줄
  체인이 「pnpm 은 순서 실행기일 뿐」이라는 근거와 함께 적혀 있었으나 셋 다 성립하지 않는다 —
  스크립트가 Node 표준 라이브러리 밖(vitest·tsc·playwright)을 쓰고, `build` 는 5단계인데 체인은
  3개뿐이며, `verify` 는 그 체인이 아는 것보다 훨씬 많다.
- **Node 자체가 없으면 generated 산출물이 바뀌는 작업을 시작하지 않는다.** 조사와 초안만
  scratchpad 에 남기고 "환경 blocker: Node 없음"을 보고한다. **검증을 실행한 척하지 않는다.**
  다른 응용프로그램에 번들된 Node 바이너리는 사용자가 명시적으로 승인한 경우에만 임시로 쓰고,
  사용 사실·경로·버전을 보고에 명시한다.

## 3. 공통 실행 규칙

인계서 6절의 자율 작업 프로토콜에 다음을 추가한다.

### Spike 규칙

외부 라이브러리 비교나 동작 확인이 필요한 spike는 **저장소 밖 임시 디렉터리**(scratchpad 등)에서
수행한다. 이 저장소의 `pnpm-lock.yaml`과 package.json을 spike 목적으로 수정하지 않는다. spike
결과(측정치, 코드 조각, 판단 근거)만 Decision 문서에 기록한다. 의존성 도입이 Decision으로 승인된
뒤에야 저장소에 실제로 추가한다.

### Baseline 갱신 절차 (의도적 breaking)

`packages/tokens/baseline/manifest.json`은 승인된 diff 비교점이다. `pnpm verify`가 breaking diff로
실패한다는 이유로 조용히 덮어쓰지 않는다. 의도적 breaking을 반영하는 순서는 다음과 같다.

1. breaking을 일으키는 source 변경과 그 이유를 Decision 또는 Updates 항목으로 먼저 기록한다.
2. `node scripts/diff-tokens.mjs`로 분류별 diff를 출력해 의도한 항목만 breaking인지 확인한다.
3. 의도하지 않은 breaking이 섞여 있으면 source를 수정해 제거한다.
4. 새 generated manifest를 baseline으로 복사하고, 같은 commit에 diff 요약과 migration note를 남긴다.
5. `node scripts/diff-tokens.mjs --fail-on-breaking`이 0으로 종료하는지 재확인한다.

published Figma library와 공개 package가 존재하기 전까지 Figma 전용 metadata(`figmaCollection` 등)
변경은 소비자가 없으므로 이 절차로 처리할 수 있는 breaking이다. 공개 release 이후에는 deprecation
window가 먼저다.

### 게이트 확장 억제

이 저장소는 이미 UI 코드보다 많은 검증 코드를 가진다. P3 동안 새 failure canary는 **실제로 발생한
회귀**나 인계서가 명시한 완료 증거에만 추가한다. "있으면 좋을" 게이트를 선제 작성하지 않는다.

### 증거 2단 모델

인계서 9절의 component 완료 정의는 **Web `done`과 `stable` 승격의 기준**이다. Web `partial` 승격에는
다음 최소 세트만 요구한다.

- unit/state test와 DOM keyboard/focus interaction test 통과
- automated accessibility check 통과
- package self-reference consumer build와 public import example
- 규범 문서와 manifest Availability 일치

real browser hit-test, visual regression, 수동 screen-reader review, SSR/hydration, KO/EN/JA/RTL 검증은
Web `done`과 `stable` 승격 조건으로 남긴다. 이 구분은 Button 하나에 여러 세션을 쓰는 대신 core RC를
먼저 완성하기 위한 것이다.

### Dirty 작업 트리와 세션 경계

세션 시작 시 `git status`에 이전 작업자의 미커밋 변경이 있으면, 자기 변경만 부분 커밋해 manifest가
untracked 파일을 참조하는 상태를 만들지 않는다. 선행 변경의 커밋 여부를 먼저 확정하거나(사용자
확인), 전체를 하나의 일관된 변경 단위로 함께 다룬다. manifest에 등록된 파일은 커밋 전에 최소한
`git add`로 추적 상태에 두어야 `--require-tracked` 검사(hosted CI의 `CI=true` 경로)와 어긋나지
않는다.

### 큐 상태와 표면 상태를 섞지 않기

큐 상태(`pending`/`ready`/`in-progress`/`blocked`/`done`)는 작업 진행 표시이고, surface 상태
(`not-ready`/`partial`/`done`)와 maturity(`experimental`/`beta`/`stable`)는 manifest의 소비 가능성
표시다. 작업 큐가 `done`이어도 surface 상태는 증거 조건을 충족한 값만 갖는다.

## 4. Figma 실행 경계

Figma 관련 작업 전에 이 표를 그대로 따른다. 2026-08 조사 기준이며, 요금제나 API가 바뀌면 DS-F-000을
재실행해 이 절을 갱신한다.

| 경로 | 판정 | 근거 |
| --- | --- | --- |
| Figma MCP `use_figma` (Plugin API) | **유일한 자동화 쓰기/읽기 경로.** collection·mode·variable 생성, alias, style 생성, component set과 componentPropertyDefinitions 생성 모두 가능 | Plugin API는 Enterprise 게이트 없음 |
| Variables REST API | 사용 불가로 간주 | GET 포함 전부 Enterprise 전용 |
| library publish 자동화 | **전 요금제 불가능. 항상 사람이 Figma UI에서 수동 publish** | publish API 부재 |
| Code Connect | 백로그. Organization 이상 + Dev/Full seat 확보 시에만 재검토 | 요금제 게이트 |
| Tokens Studio 등 외부 plugin | 도입하지 않음. MCP 경로로 충분하며 composite 스킵 한계도 동일 | 의존 최소화 |

**모드 한도:** variables mode는 Starter 1개, Professional 10개, Organization 20개, Enterprise 40개다.
light/dark 2-mode collection은 Professional 이상에서만 만들 수 있다. **이 저장소의 라이브러리 파일은
2026-08-14 실측에서 상한 10개(Professional)로 확인됐다** — 필요한 mode는 2개이므로 여유가 있다.
다른 환경에서는 DS-F-000이 실제 한도를 확인하기 전에 mode가 필요한 쓰기 작업을 시작하지 않는다.

**쓰기 정책:** MCP 쓰기는 실제 Figma 파일을 바꾸는 외부 부수효과다. 다음 규칙을 지킨다.

1. 사용자가 명시적으로 지정한 draft 파일 key에만 쓴다. 지정 전에는 모든 쓰기 작업이 `blocked`다.
2. publish는 어떤 방법으로도 자동화하지 않고, publish 여부를 추측해 상태를 올리지 않는다.
3. 쓰기 작업 전후로 스냅샷을 남겨 무엇이 바뀌었는지 재현 가능하게 한다.
4. Figma 쪽 수동 편집과 충돌하면 덮어쓰지 않고 diff를 보고한다.

**Figma가 표현하지 못하는 것과 정책:** 변수 타입은 COLOR/FLOAT/STRING/BOOLEAN 4종뿐이다.
composite typography는 text style로, shadow는 effect style로 표현하고 내부 속성에 변수를 바인딩한다.
cubicBezier easing과 transition은 네이티브 표현이 없으므로 문서용 STRING 변수로 격하하고 loss를
기록한다. 세부 정책은 DS-F-001 Decision이 확정한다.

## 5. 트랙과 단계 지도

작업 큐는 네 트랙으로 나뉜다. 코드 트랙과 Figma 트랙은 **병렬**이며, Figma variables 구축은 React
구현을 기다리지 않는다. component parity(DS-F-006)만 해당 컴포넌트의 코드 구현과 짝을 이룬다.

```text
GOV 트랙   DS-GOV-000(외부 권한, blocked) · DS-GOV-001(baseline 규범)
코드 트랙  DS-P3-001 → 002a → 002 → 003 → (004 ∥ 005) → (006 ∥ 007) → 008 → 009
           DS-P3-010(← 003, 005; 병렬) · DS-P3-012(← 008, DS-F-004 1단계, GOV-000)
           DS-P3-009a(화면 인벤토리; 제품 저장소 확인 필요) · DS-P3-013(아이콘; ← 009a)
Figma 트랙 DS-F-000 → 001 → 002 → (003 ∥ 004 1단계) → 004 2단계 → 005
           → 006-{cmp}(← 코드 구현) → 007-{screen} → 008 → (수요 시 009)
문서 트랙  DS-P4-001 → 002 → 003 → 004
채택 트랙  DS-P5-001 → 002 → 003/004/005 → 006
```

의존성의 정본은 인계서 큐이며 이 지도는 요약이다. 실제 병렬 구간은 **DS-F-000~005와 코드
트랙 전체**다. DS-F-006부터는 해당 컴포넌트의 코드 구현이, DS-F-007은 DS-P3-009a 인벤토리(제품
저장소 접근)가 추가로 필요하므로, 목표 B의 종반부는 코드 트랙·제품 접근과 합류한다.

### 사용자 차단 해제 목록

다음은 에이전트가 스스로 해결할 수 없고 사용자만 풀 수 있는 입력이다. 세션 보고에서 남은 항목을
반복해 요청한다.

1. ~~**Node 22 LTS 설치**~~ — 해소됨 (2026-08-14, `~/.local/node22`, pnpm 10.30.2).
2. ~~**Figma 요금제 확인과 파일 지정**~~ — 해소됨 (2026-08-14, DS-F-000).
3. ~~**제품 저장소 절대 경로**~~ — 해소됨. 정본은 `KlipseAI/klipse-web` 의 **`design` 계열**이고
   정확한 커밋은 `migration/product-evidence.lock.json` 의 `productCommit` 이 소유한다.
   **구 저장소 `~/klipse` 를 열지 마라** — 경로가 아직 살아 있어서 오류 없이 *조용히* 다른
   조직의 낡은 저장소를 제품으로 읽게 된다. 그 정정은 `migration/product-baseline.md` 에 있다.
4. **npm 배포 권한과 owner 승인** — DS-P3-012 시점에 필요. 미해소. 원격 Git 과 hosted CI 는
   섰다(`git@github.com:KlipseAI/louis.git`).
   - **hosted CI 가 빨갛다면 게이트를 고치기 전에 먼저 결제를 의심하라.** 결제 거부는 목록에서
     게이트 실패와 똑같이 `failure` 로 보이고 실패 로그도 없다. 판별법은
     [계정 이전 인계서 3절](handoff-2026-08-22-account-transfer.md)이 소유한다.
5. **Figma library publish** — DS-F-008에서 owner가 Figma UI에서 직접 수행. 자동화 불가. 미해소.
6. ~~**브라우저 테스트 바이너리 다운로드 승인**~~ — 해소됨 (2026-08-14). Chromium headless shell을
   받아 Vitest 실브라우저 harness가 동작한다.
7. **Decision `accepted` 전환** — 자율 세션은 `proposed`까지만 쓴다. 대기 목록의 정본은
   `grep -l '^- Status: proposed' design/governance/decisions/DS-D-*.md` 다 — 손으로 유지되는
   ID 목록은 반드시 낡는다(한때 8건이 적혀 있었고 그 사이 Decision 이 더 늘었다).
   대기 중에도 후속 구현은 진행할 수 있다.
8. ~~**제품 저장소 확인 2건**~~ — **둘 다 해소됐다(2026-08-21).** 미커밋 `--surface-*` 사다리는
   배포본에 존재한 적이 없어 역이관할 대상이 없고, 앱 셸 라이트 램프는 `palette-gray-200`의
   **G를 238로 확정**했다(hex `#eeeef1`이 정본, `-rgb` 미러 `238 239 241`은 제품 결함으로 남긴다).
   근거와 판단은 [실행 인계서](execution-handoff.md)의 DS-P3-014 절에 있다. **DS-P3-014 단위 10의
   대기 사유가 없어졌다.**

9. ~~**parity 원천에 새 토큰이 없다**~~ — **해소됐다.** 토큰을 더하는 단위가 여기서 막히지
   않는다. 여는 방법은 ① 라이브러리에 `figma/apply-variables.*.js` 를 적용하고 ② readback 의
   **변수 구간만** 다시 뜨는 것이며 절차는 `build-figma-snapshot.mjs` 헤더 (1)에 있다.
   현재 통과 여부는 `pnpm verify-figma-parity` 출력이 낸다.

## 6. 작업별 플레이북

각 작업의 완료 증거는 [실행 인계서](execution-handoff.md) 8절이 소유한다. 아래는 절차다.

---

### DS-GOV-001 — Baseline 갱신 규범

**의존성:** 없음. 즉시 가능.

1. [Releases](releases.md)에 "의도적 breaking과 baseline 갱신" 절을 추가하고 이 문서 3절의 절차를
   규범으로 옮긴다.
2. published 전 Figma 전용 metadata 변경의 분류(비소비 breaking으로서 baseline 갱신 허용)를 같은
   절에 명시한다.
3. Updates에 항목을 추가하고 문서 게이트를 재생성·통과시킨다.

**산출물:** releases.md 개정, Updates 항목.

---

### P3 코드 트랙

#### DS-P3-001 — Web architecture Decision과 status model

**의존성:** 없음. 코드 트랙의 시작점.

**시작 전 읽기:** [Button](../components/button.md), [Dialog](../components/dialog.md),
[Menu/Popover](../components/menu-popover.md)의 Pre-implementation blockers와 acceptance tests,
`packages/css`·`packages/react`·`apps/docs`의 package.json과 README,
[DS-D-0001](decisions/DS-D-0001-token-source.md), [제품 baseline](../../migration/product-baseline.md).

**절차:**

1. 세 컴포넌트 규범의 acceptance tests를 하나의 test matrix 표로 추출한다 (축: 컴포넌트 × 검증 종류
   × 필요한 도구).
2. 후보를 공식 문서로 비교한다. 각 결정을 **별도 Decision 문서**로 작성한다.
   - `DS-D-0002` Web 지원 범위: React 버전, ESM/type export, SSR·hydration·RSC/client 경계, browser
     support, bundle target.
   - `DS-D-0003` accessibility behavior dependency: **검증된 headless primitive 채택이 기본값이다.**
     직접 구현은 해당 primitive가 규범 계약(예: Dialog의 nested order, Menu의 activation
     exactly-once)을 충족하지 못한다는 반증이 있을 때만 선택한다. 후보(Radix Primitives, Base UI,
     React Aria, Zag 등)를 bundle, SSR, focus 관리, license, escape hatch로 비교한다.
   - `DS-D-0004` CSS 저작 방식: authored plain CSS vs recipe generation. 현 규모(컴포넌트 8종)에서는
     예측 가능한 클래스명의 authored CSS가 기본 후보다. 선택 기준과 재검토 조건(컴포넌트 수, 중복
     발생)을 기록한다. reset opt-in과 `@layer`/import order 계약도 이 Decision이 소유한다.
   - `DS-D-0005` test stack: unit/DOM(예: vitest + testing-library), automated a11y, browser/visual의
     역할 분리와 도입 시점. browser/visual은 DS-P3-002에서 즉시 도입하지 않고 후속 게이트로 미룬다.
   - `DS-D-0006` versioning: changesets 도입, fixed vs independent(초기에는 소수 package이므로 fixed가
     기본 후보), css↔react peer 쌍 계약(`@klipse-design/react`가 `@klipse-design/css` 호환 범위를
     peerDependencies로 강제).
   - `DS-D-0009` font distribution: self-host vs consumer injection, license, preload와
     `font-display`/layout shift, KO/JA glyph subset. 토큰 소스의 fontFamily fallback 배열이 이미
     존재하므로 CSS package와 docs example이 결정 없이 암묵 선택하지 않게 한다.
     (0007은 Figma 구조, 0008은 아이콘 정본, 0010은 token coverage에 예약되어 있다.)

   **작성 순서 권고:** 0004 → 0002 → 0006 → 0009 → 0005 → 0003. 앞의 넷은 spike와 무관하게 확정할 수
   있고, 0005는 브라우저 바이너리 확보에, 0003은 하부 유틸 실측에 의존한다.
3. spike는 3절 spike 규칙대로 저장소 밖에서 수행한다.
4. manifest schema에 CSS/React package 상태 표현을 추가하는 확장안을 Decision에 포함한다
   (`tokenPackage`처럼 package별 artifacts/status/evidence 필드).
5. devDependencies 도입 허용 여부 자체는 논쟁 대상이 아니므로 Decision에 한 줄로 기록한다. 단
   **이 작업에서 package.json/lockfile을 실제로 수정하지 않는다** — 실제 도구 설치는
   DS-P3-002a/002의 몫이고, spike는 3절 규칙대로 저장소 밖에서 한다.

**Decision 작성 규칙 (모든 DS-D 공통):**

- 자율 세션은 Decision을 본문 `Status: proposed`로 작성하고, 그 Decision에 의존하는 후속 구현을
  계속할 수 있다. `accepted` 전환은 repository owner(사용자)의 확인 근거가 생겼을 때만 한다.
  스스로 `accepted`를 쓰지 않는다. 큐 완료 근거의 "accepted Decision"은 "proposed Decision +
  owner 확인 요청이 보고에 기록됨"으로 충족된다.
- frontmatter `status:`는 manifest maturity 어휘(experimental/beta/...)이고, 본문 `Status:`는
  proposed/accepted 수명주기다. 두 축을 섞지 않는다.
- manifest `documents[]`의 `id`는 kebab-case만 유효하다. `DS-D-0002` 같은 표기는 제목에만 쓰고
  id는 선례(`decision-token-source`)처럼 `decision-web-architecture` 형태로 짓는다.

**산출물:** `design/governance/decisions/DS-D-0002~0006`과 `DS-D-0009`, test matrix(Decision 부록),
manifest schema 확장안, Updates 항목.

**함정:** 여러 결정을 한 문서로 뭉치면 rollback 단위가 사라진다. 결정마다 대안·이유·rollback을
분리해 기록한다.

#### DS-P3-002a — 게이트 전환

**의존성:** DS-P3-001

`scripts/verify-gates.mjs`의 `validatePackageScaffolds()`는 현재 css/react/docs의 exports 추가를
**적극적으로 차단**한다. 구현을 시작하면 `pnpm verify`가 깨지므로, 게이트 전환을 독립 변경으로 먼저
수행한다. 게이트가 실패한다는 이유로 게이트를 임의로 약화하지 않는다.

1. `validatePackageScaffolds()`(canary 없는 positive check)의 scaffold 계약을 "구현 중" 상태를
   표현할 수 있게 갱신하고, "선언되지 않은 exports 금지"를 검증하는 canary 1건을 신설한다. 이
   함수의 `private: true` 강제는 유지하되, 해제 조건이 DS-P3-012 public release 시점임을 주석으로
   남긴다.
2. DS-P3-001의 확장안대로 `design/manifest.schema.json`과 manifest에 CSS/React package 상태 필드를
   추가한다. `tokenPackage.packageRelease`의 `const: "not-ready"` 고정도 이때
   `implementationStatus` enum + evidence 요구로 완화했다 — **완화는 끝났고 schema 에 그 고정이
   남아 있지 않다.** (실제 승격은 DS-P3-012 이후.)
3. `.github/workflows/ci.yml`에 `pnpm install --frozen-lockfile`과 필요한 build 단계를 추가한다.
   의존성 0 전제가 깨지는 시점이 바로 이 작업이다.
4. 문서(develop, package README)와 게이트, manifest가 서로 모순되지 않는지 재생성·검증한다.

**산출물:** 갱신된 verify-gates, manifest/schema, ci.yml, Updates 항목.

#### DS-P3-002 — Package build와 품질 harness

**의존성:** DS-P3-001, DS-P3-002a

범위 폭발을 막기 위해 **2단계로 나눈다.**

1. **1단계 (이 작업):** TypeScript build/typecheck(tsconfig 루트+package), lint/format, unit/DOM test
   runner, package self-reference consumer fixture, root `build`/`check`/`verify` 연결. 의도적 failure
   canary는 "test runner가 실패를 실제로 전파하는가" 1건이면 충분하다.
2. **2단계 (별도 후속, DS-P3-008 전까지):** real browser 테스트와 visual regression. hosted CI가 없는
   환경에서 browser 바이너리 다운로드가 실패할 수 있으므로, 로컬 실행 절차와 CI 절차를 분리해
   문서화한다.

**함정:** 5종 테스트 스택을 한 세션에 모두 설치하려 하지 않는다. SSR/hydration 검증은 첫 컴포넌트가
생긴 뒤(DS-P3-004)에 의미가 있다.

#### DS-P3-003 — CSS foundation package

**의존성:** DS-P3-001, DS-P3-002a, DS-P3-002

인계서 큐 항목의 요구를 그대로 따른다. 추가 지침:

1. `@klipse-design/tokens/css`를 재export하는 진입점부터 만들고, reset/base는 opt-in 파일로 분리한다.
2. cascade 계약(`@layer` 사용 여부 포함)을 DS-D-0004에 따라 문서화한다.
3. theme scope는 [Color & Theme](../foundations/color-theme.md)의 `[data-theme]` 계약을 그대로
   소비한다. CSS package가 별도 selector 정책을 만들지 않는다.

#### DS-P3-004 — Button / DS-P3-005 — Overlay behavior layer / DS-P3-006 — Menu·Popover / DS-P3-007 — Dialog

**의존성:** 인계서와 동일.

공통 절차:

1. 해당 규범 문서의 acceptance tests를 테스트 파일로 옮기는 것에서 시작한다 (행동이 바뀌는 작업은
   회귀 검사 먼저).
2. DS-D-0003이 채택한 headless primitive 위에 styled layer를 만든다. primitive가 규범과 어긋나는
   지점만 내부 래퍼로 보정하고 그 사유를 규범의 Known deviations에 기록한다.
3. Web `partial` 승격은 3절의 최소 증거 세트로 판정한다. 전체 세트는 `done` 승격 때 요구한다.
4. 각 컴포넌트 완료 시 manifest Availability, 규범 Implementation 절, Updates를 같은 변경 단위로
   갱신하고, 대응하는 DS-F-006-{component} 작업이 `ready`가 됐음을 인계 보고에 적는다.

DS-P3-005의 focus scope/inert/scroll lock/positioning은 **직접 구현하지 않는 것이 기본값**이다
(DS-D-0003). 채택한 primitive가 제공하지 않는 것(예: layer token 연동, App Shell host 규약)만 이
저장소가 소유한다.

#### DS-P3-008 — Core local RC

**의존성:** DS-P3-004, DS-P3-006, DS-P3-007. 인계서와 동일하게 수행한다. 이 시점에 DS-P3-002의
2단계(browser/visual)를 완료해 core 3종에 적용한다.

#### DS-P3-009a — 배포 화면 인벤토리

**의존성:** 없음. 단 시작 전에 제품 저장소의 위치 확인이 필요하다.

1. **저장소 확정:** 제품 저장소의 절대 경로(또는 remote URL)와 기준 branch/commit을 사용자에게
   확인받아 [제품 baseline](../../migration/product-baseline.md)에 기록한다. 파일시스템에 이름이
   비슷한 디렉터리가 여럿 있어도 **추측으로 고르지 않는다.** 확인 전에는 이 작업이 사용자 입력
   대기다.
2. Klipse 제품의 배포 화면(최소 Home, Highlight, Editor와 그 하위 상태)을 화면별로 캡처하거나 제품
   저장소의 route 구조를 읽는다. 인벤토리 표 상단에 출처 저장소와 기준 commit을 기재한다. 제품
   코드는 **읽기만** 하고 이 저장소로 복사하지 않는다. "Home/Highlight/Editor"와 실제 route가
   1:1이 아니면 매핑 표를 함께 만든다.
3. 화면마다 필요한 component/pattern/icon/token을 분해한 표를 만든다: 화면 → 구성 요소 → 카탈로그
   ID 또는 "카탈로그에 없음". 입도는 "카탈로그 component/pattern 후보가 될 수 있는 단위"다 — 버튼
   하나, 메뉴 하나 수준까지 내려가고 레이아웃 섹션에서 멈추지 않는다.
4. 결과를 `migration/screen-inventory.md`(비규범 reference)로 저장하고 manifest
   `referenceSurfaces`에 등록한다.
5. "카탈로그에 없음" 목록이 DS-P3-009 순서와 DS-P3-013 아이콘 인벤토리, DS-F-007 gap 예측의
   입력이 된다.

**산출물:** `migration/screen-inventory.md`, manifest referenceSurfaces 항목, Updates 항목.

#### DS-P3-009 — Catalog coverage

**의존성:** DS-P3-008. 우선순위는 DS-P3-009a의 화면 인벤토리 근거로 정한다. 각 컴포넌트는
[template](../components/_template.md) 구조의 규범 작성 → 구현 → 검증 순서로 독립 변경 단위를
만든다.

#### DS-P3-010 — 공용 Pattern fixture

**의존성:** DS-P3-003, DS-P3-005. 범위는 Loading, App Shell, Project Grid 세 pattern이다. Editor
Workspace fixture는 제품 재구현 위험이 커서 DS-P5-005의 실제 adoption 검증으로 이동했다. manifest의
editor-workspace pattern은 그때까지 Web `not-ready`를 유지한다.

#### DS-P3-012 — P3 public release

**의존성:** DS-P3-008, hosted CI, owner approval. **published Figma library는 선행 조건이 아니다.**
Figma 트랙에서는 DS-F-004의 parity report 존재만 요구한다. npm 공개와 Figma publish는 별도 트랙으로
진행하고 같은 release note에서 서로를 참조한다.

#### DS-P3-013 — 아이콘 트랙

**의존성:** DS-P3-009a (인벤토리 근거).

현재 시스템에는 아이콘 자산·파이프라인·규범이 전혀 없다. 배포 화면에는 아이콘이 반드시 존재하므로
목표 B는 아이콘 없이 달성될 수 없다.

1. DS-P3-009a 결과에서 실제 사용 아이콘 인벤토리를 추출한다 (이름, 사용 화면, 중복 변형).
2. `DS-D-0008` Decision: 아이콘 정본 위치를 결정한다. 후보 — (a) 저장소 내 SVG 정본 + 생성
   파이프라인(코드 우선, 현 토큰 모델과 일관), (b) Figma 정본 + 추출(SEED의 Icona 방식, 디자이너
   주도). 유지 책임과 rollback을 함께 기록한다.
3. 결정에 따라 최소 파이프라인(SVG → React component + Figma component)과 아이콘 manifest를
   구축한다. 첫 범위는 인벤토리의 실사용 아이콘으로 제한한다. 신설 workspace package는
   `validatePackageScaffolds()`의 package 목록과 manifest schema에 같은 변경 단위로 편입한다.

**산출물:** 아이콘 인벤토리, DS-D-0008, `packages/icons`(또는 결정된 위치), Figma 아이콘 컴포넌트,
Updates 항목.

---

### Figma 트랙 (DS-F-000 ~ DS-F-008)

목표 B의 전용 트랙이다. DS-F-006 이외에는 React 구현에 의존하지 않는다.

#### DS-F-000 — Figma 운영 전제 (2026-08-14 완료)

결과와 운영 규범은 [Figma Sync Governance](figma-sync.md)의 운영 파일·capability·쓰기 정책 절이
소유한다. 요약: 라이브러리 파일 `bxGEp0km5zluMJGulaTvFW`를 새로 만들어 Foundations / Components /
Templates 3개 페이지를 구성했고, 제품 미러 파일 `CNORJOONt4z0a4Bl22Kjuu`는 읽기 전용 reference로
분리했다. 실측 결과는 mode 상한 10개(Professional)와 `Pretendard` 사용 가능이다.

**이 절차를 다시 수행할 때의 순서** — 쓰기(모드 생성 포함)는 항상 대상이 확정된 파일 안에서만 한다:

1. **읽기 전용 확인:** `whoami`로 계정과 팀/요금제를 확인한다. 파일을 만들거나 수정하지 않는다.
2. **요금제 확인:** Starter면 mode 기능이 없어 트랙 전체가 `blocked`다 — 필요를 보고하고 멈춘다.
3. **대상 파일 확정:** 사용자가 기존 파일을 지정하거나, 사용자 지시가 있을 때만 신규 파일을
   만든다. 지정·지시 없이 임의로 "시험 파일"을 만들어 쓰지 않는다.
4. **확정된 파일에서 실측:** collection 생성과 mode 추가로 상한을 확인하고 시험 collection은
   제거한다. `Pretendard` 가용성도 확인하고, 없으면 대체 폰트 정책을 DS-F-001 입력으로 남긴다.
5. capability와 파일 key를 figma-sync.md의 운영 파일 절에 기록한다.

**산출물:** 갱신된 figma-sync.md, 기록된 capability와 파일 key, Updates 항목.

#### DS-F-001 — Figma 구조 Decision

**의존성:** DS-F-000

현재 generated proposal은 단일 collection(`Klipse Design`)에 base/global/light/dark 4개 mode를 담는데,
Figma에서 mode는 collection의 **모든** 변수에 적용되므로 이 구조는 성립하지 않는다. primitive 110개가
light/dark 값을 강제로 갖게 되기 때문이다. `DS-D-0007` Decision으로 다음을 확정한다.

1. **Collection 분리 (기본안):** 토큰은 Figma에서 표현 형태가 셋으로 갈린다. **아래 개수는
   2026-08-14 DS-D-0007 시점의 추정이며 지금 값이 아니다** — collection 별 실제 변수 수는
   `packages/tokens/generated/figma.tokens.json` 이, Figma 에 실제로 선 수는
   `pnpm verify-figma-parity` 출력이 낸다 —
   네이티브 변수, style, STRING 격하. 변수 개수는 토큰 개수와 다르다는 사실을 Decision에 명시한다.
   - `Klipse Primitive` — mode 1개(base). 네이티브 변수 약 92개(COLOR 38, FLOAT 52, STRING 2).
     composite인 typography 6·shadow 4는 변수가 아니라 style로, transition 5·cubicBezier 3은 STRING
     격하 또는 미표현으로 분류한다. library에서 hidden 처리 검토.
   - `Klipse Semantic` — mode 1개(global). theme 비의존 semantic 중 네이티브 변수 약 23개(FLOAT).
     composite semantic(typography/elevation/transition)은 style·격하로 분류한다.
   - `Klipse Semantic Color` — mode 2개(light/dark), theme 의존 color semantic 26개. 값은 primitive
     변수 alias.
2. **파일 구조 — publish 전에는 단일 파일이 강제다:** Figma에서 다른 파일의 변수·style·component를
   소비하려면 원본 파일이 **library로 publish되어 있어야 한다.** publish는 DS-F-008의 수동 단계이므로,
   DS-F-003~007은 **한 파일 안**에서 작업한다. **어느 파일인지와 그 파일의 페이지 구성은
   [figma-sync](figma-sync.md) 「운영 파일」 절이 소유한다** — 이 문서에 파일 키나 페이지
   목록을 적지 않는다. **Figma 파일이 셋이고 역할이 다르며 그중 하나(`CNORJOONt4z0a4Bl22Kjuu`,
   제품 미러)는 읽기 전용이다 — 쓰기 전에 반드시 확인한다.**
   SEED식 3-파일 분리는 publish 이후의 후속 작업(DS-F-009)으로 두고, 파일 분리 전환은 Figma 파일
   재작성이 필요한 breaking임을 rollback 절에 기록한다.
3. **이름 변환:** 안정 token ID(`color-action-primary`) → Figma 변수 경로(`color/action/primary` 등)
   규칙과 충돌 시 build error 정책.
4. **Composite 정책:** text/effect style은 **semantic tier 이름**(`typography-*`, `elevation-*`)으로
   생성하고 내부 속성에 변수를 바인딩한다. primitive tier의 `type-style-*`/`shadow-*`는 Figma
   미표현으로 분류해 loss registry에 기록한다 (Figma에는 style→style alias가 없어 tier 관계가
   소실된다 — 이 소실 자체를 loss로 등록한다). duration 4종은 FLOAT 변수로 유지하고 collection
   배정을 명시한다. transition/cubicBezier는 문서용 STRING 격하 + loss 기록.
5. rollback: proposal 재생성만으로 되돌릴 수 있는 단계와 Figma 파일 재작성이 필요한 단계(파일 분리,
   collection 재편)를 구분한다.

**산출물:** `design/governance/decisions/DS-D-0007`, 갱신된 figma-sync.md.

#### DS-F-002 — Proposal 재구조화

**의존성:** DS-F-001, DS-GOV-001

`figmaCollection`은 generator만의 문제가 아니다. 다음 위치가 단일 문자열 구조를 전제하므로 **한
변경 단위에서 함께** 수정한다.

1. `scripts/lib/token-model.mjs` — figmaCollection 문자열 검증, diff 비교, 생성되는 d.ts 타입.
2. `scripts/build-tokens.mjs`의 Figma proposal 생성부 — DS-D-0007의 multi-collection 구조 출력.
3. token source의 `figmaCollection` extension — collection 배정 규칙에 맞게 갱신.
4. `scripts/verify-token-gates.mjs` — 산출물 간 collection 일치 검사, `modes` 키잉 전제, 1:1 개수
   검사, figmaCollection breaking canary를 새 구조에 맞게 갱신.
5. `packages/tokens/generated/index.d.ts` 공개 타입이 바뀌므로 이 역시 breaking으로 분류해
   DS-GOV-001의 baseline 갱신 절차를 최초로 적용한다. published 소비자가 없음을 Updates에 명시한다.
6. ~~`design/manifest.schema.json`의 `tokenPackage.figmaLibrary`가 `const: "not-ready"`로 고정되어
   있어 이후 상태 승격이 불가능하다.~~ **끝났다** — 그 필드는 `implementationStatus` enum 이고
   `not-ready` 이외 값에는 evidence 를 요구한다. 그 고정은 schema 어디에도 남아 있지 않다
   (승격 자체는 DS-F-008 이후).

**산출물:** 갱신된 generator/validator/게이트/schema, 재생성된 artifact 6종, 갱신된 baseline, Updates
항목.

#### DS-F-003 — Variables 구축

**의존성:** DS-F-002, DS-F-000의 파일 key. 파일 key 미지정이면 `blocked`.

1. Figma MCP `use_figma` 실행 전에 `figma-use` skill 지침을 로드한다.
2. proposal JSON을 입력으로 지정 파일의 Foundations 페이지에 collection/mode/variable/alias를
   생성하는 스크립트를 MCP로 실행한다. **idempotent**해야 한다: 이름으로 기존 변수를 조회해 create
   대신 update하고, 실행 결과(생성/갱신/스킵 수)를 보고한다. 잘못된 값으로 중단되면 직전 스냅샷을
   기준으로 mismatch 항목만 재적용해 복구한다 — 전체 삭제 후 재생성은 변수 ID를 바꿔 바인딩을
   깨뜨리므로 금지한다.
3. primitive → semantic alias는 Figma 변수 alias로 연결한다. 같은 collection 안에서만 mode가
   분기되는지 확인한다.
4. 실행 후 전체를 다시 읽어 대조한다. 기준은 개수 일치가 아니라 **완전 분류다**: 토큰 각각이
   variable / style(DS-F-005) / STRING 격하 / 의도적 미표현 중 정확히 하나로 매핑되고 미분류 0,
   그리고 variable로 분류된 항목의 이름·값·mode·alias 불일치 0.
5. publish하지 않는다. manifest의 Figma 상태는 `not-ready`를 유지한다. DS-F-004 통과와 schema
   완화(DS-F-002) 이후에만 `partial` 후보가 된다.

**산출물:** 지정 파일 Foundations 페이지의 변수 세트, 실행 로그와 분류 대조 결과.

#### DS-F-004 — Snapshot과 parity checker

**의존성:** 1단계는 DS-F-002만. 2단계는 DS-F-003과 DS-F-000의 파일 key. 빈 draft를 대조하면 전량
mismatch로 verify가 상시 실패하므로 단계를 지킨다.

**1단계 — checker와 fixture (DS-F-003 없이 가능):**

1. `scripts/verify-figma-parity.mjs`를 추가한다: **credential 없이** 커밋된 snapshot과
   `packages/tokens/generated/figma.tokens.json`을 비교해 분류 완전성(variable/style/격하/미표현)과
   variable 이름/값/mode/alias mismatch를 실패로 보고한다.
2. proposal에서 파생한 **fixture snapshot**으로 checker와 mismatch canary 1건(변조된 snapshot이
   실제로 실패하는지)을 검증하고 root `verify`에 연결한다.

**2단계 — 실제 덤프 (DS-F-003 이후):**

3. MCP 읽기(`get_variable_defs` 또는 `use_figma` 읽기 스크립트)로 지정 파일의 variables/styles
   상태를 덤프해 최상위 `figma/snapshot.json`으로 커밋하고 fixture를 대체한다. 덤프 시점의 token
   source hash와 날짜를 snapshot에 포함한다. `design/` 하위에 두지 않는 이유: `design/` Markdown은
   normative 등록 게이트 대상이고, snapshot은 규범이 아닌 기계 evidence이기 때문이다.
4. staleness 정책: snapshot의 source hash가 현재 generated manifest와 다르면 "stale snapshot"
   경고(게이트 실패가 아닌 보고)로 처리한다. Figma 접근 실패를 통과로 캐시하지 않는다.
5. `figma/snapshot.json`을 manifest `referenceSurfaces`에 등록하고 `.prettierignore`에 추가한다.
6. [figma-sync.md](figma-sync.md)의 "현재 상태" 목록에서 parity checker와 snapshot 상태를 실제
   상태로 갱신한다. 컴포넌트 parity(componentPropertyDefinitions ↔ 코드 prop 스키마)는 DS-F-006에서
   확장한다.

**산출물:** verify-figma-parity 스크립트와 canary, snapshot, verify 연결, 갱신된 figma-sync.md,
Updates 항목.

#### DS-F-005 — Composite → Styles

**의존성:** DS-F-003, DS-F-000의 폰트 가용성 확인

1. DS-D-0007의 composite 정책대로 **semantic tier 이름**으로 생성한다: `typography-*` → text
   style, `elevation-*` → effect style, Foundations 페이지에. **수는 여기에 적지 않는다** —
   `figma/snapshot.json` 의 `styles.text`·`styles.effect` 가 정본이다. style 내부의 색·숫자 속성은
   DS-F-003의 변수에 바인딩한다. primitive `type-style-*`/`shadow-*`는 만들지 않고 loss registry에
   기록한다.
2. Figma가 표현하지 못하는 필드(fallback 배열, easing, tier alias 관계)는 proposal의 loss metadata
   그대로 style description에 기록한다.
3. snapshot과 parity checker가 style을 포함하도록 확장하고 분류 대조를 통과시킨다.

**산출물:** text/effect styles, 확장된 snapshot/parity, Updates 항목.

#### DS-F-006-{component} — Component library

**의존성:** 해당 컴포넌트의 코드 구현(DS-P3-004/006/007/009)과 DS-F-005. Button부터 시작한다.

1. 컴포넌트 규범의 Anatomy/Properties/States와 코드 public API를 나란히 놓고 Figma component set의
   property/variant 정의를 설계한다. **코드 prop과 Figma property가 1:1**이 되게 한다 (예: Button
   `variant` 4종 × `size` × `loading` × `iconOnly`).
2. MCP로 지정 파일의 Components 페이지에 component set을 생성하고 모든 색/치수/radius/typography를
   같은 파일의 변수와 style에 바인딩한다. raw 값 사용 0이어야 한다 (같은 파일이므로 publish 없이
   바인딩 가능하다 — DS-F-001의 단일 파일 구조가 이 때문에 강제다).
3. parity checker를 확장한다: Figma `componentPropertyDefinitions` 덤프 ↔ 코드 prop 스키마(타입
   정의에서 추출) 비교.
4. 상태별 시각 샘플(기본/hover 유사 상태/disabled/loading)을 코드 예제 스크린샷과 나란히 대조하고
   기록한다.
5. 통과 시 해당 컴포넌트의 manifest `figma` 상태를 `partial`(reviewable draft + stable key)로
   올린다. `done`은 DS-F-008 publish 이후다.

**산출물:** component set, 확장된 parity report, manifest 갱신, Updates 항목.

#### DS-F-007-{screen} — 배포 화면 재조립 검증

**의존성:** DS-F-005, DS-F-006 중 해당 화면에 필요한 component, DS-P3-009a 인벤토리. 화면
하나가 각각 하위 작업 단위이며 **대상 범위는 `migration/product-screens/` 가 소유한다.**

목표 B를 처음으로 실측하는 작업이다. 첫 화면은 Home을 권장한다.

1. DS-P3-009a의 인벤토리에서 대상 화면의 구성 요소 목록을 가져온다.
2. **component instance, 변수, style만으로** 화면을 재조립한다 (publish 전에는 같은 파일의 것을,
   publish 후에는 published library의 것을 소비한다). detach, raw 값 override, 카탈로그에 없는
   요소가 필요해지는 지점을 전부 기록한다.
   **조립 규칙은 이 문서가 소유하지 않는다** — [figma-screen-assembly](figma-screen-assembly.md)
   가 규범이고 실행 절차는 `.claude/skills/klipse-figma-transplant/SKILL.md` 다. 2026-08-21 조립
   실패에서 나온 규칙들이 거기 있으며 이 절차만 따르면 그것을 전부 놓친다.
3. 결과를 배포 화면 스크린샷과 나란히 대조하고, 차이를 세 종류로 분류한다: (a) 카탈로그 gap(새
   component/token 필요), (b) 제품 전용 스타일(시스템 범위 아님), (c) parity 결함(코드/Figma
   불일치).
4. gap registry를 `migration/screen-inventory.md`에 통합해 DS-P3-009와 DS-P3-013의 우선순위를
   갱신한다.
5. 화면 하나가 (a)와 (c) 없이 재조립되면 그 화면을 검증 완료로 기록한다. **대상 화면의 범위와
   등급 체계는 `migration/product-screens/` 가 소유한다** — 「Home·Highlight·Editor 3개」는
   그 인벤토리가 서기 전의 기준이었다.

**산출물:** 재조립 화면, gap registry, 대조 기록.

#### DS-F-008 — Publish 운영 절차

**의존성:** DS-F-003~006 완료, repository owner의 수동 행동.

1. publish 전 체크리스트를 만든다: parity 통과, snapshot 최신, 미사용/실험 요소 정리, 컴포넌트
   description과 deprecated 표기.
2. **owner가 Figma UI에서 수동으로 publish한다.** 이 단계는 자동화 대상이 아니다.
3. publish 직후 snapshot을 다시 덤프해 published 상태를 기록하고, library key/version을
   figma-sync.md와 manifest에 기록한다.
4. rollback runbook을 작성한다: Figma library 버전 복원 절차와 코드 쪽 대응(어느 release와 짝인지).
5. 이 시점에만 관련 항목의 `figma: done` 승격이 가능하다.
6. publish 이후 SEED식 3-파일 분리(Foundations/Components/Templates)가 필요해지면 별도 작업
   `DS-F-009`로 다룬다. 파일 분리는 Figma 파일 재작성이 필요한 breaking이므로 수요가 확인되기
   전에는 단일 파일 구조를 유지한다.

**산출물:** published library key/version evidence, publish 체크리스트/runbook, manifest 갱신.

---

### P4 — 문서 트랙 보강 지침

인계서의 DS-P4-001~004를 따르되, seed-design.io 실측 구조에서 다음을 요구 사항에 포함한다.

- **디자인 규범과 개발 API의 URL 분리:** `/components/{slug}`(플랫폼 중립 규범: anatomy, properties,
  guidelines, specification)와 `/react/components/{slug}`(설치, props, live example). 상단에서 상호
  링크한다.
- **Progress board:** manifest에서 생성하며 컬럼은 surface(Web/Figma/Docs) × 상태 4단계
  (`done`/`partial`/`not-ready`/`not-planned`)로 하고, `not-planned`에는 사유를 병기한다.
- **Changelog:** package@version 단위, 변경 설명 + 함께 갱신된 package 목록. changesets 출력을
  재사용한다.
- **Do/Don't 시각 자산:** 텍스트 규범을 이미지로 재작성하지 않는다. DS-F-006/007의 Figma 산출물을
  export해 사용한다 (Figma 트랙이 문서 트랙의 시각 자산 공급원이다).
- **llms.txt:** 현재 generated `design/llms/*`를 stable URL로 서빙하고 섹션별 분할을 유지한다.
- 버전 스위처와 backport 채널은 두 번째 major가 생기기 전까지 만들지 않는다.

### P5 — 채택 트랙 보강 지침

인계서의 DS-P5-001~006을 따르되 다음을 추가한다.

- DS-P5-005(Editor workspace)는 DS-P3-010에서 이동한 workspace geometry fixture 검증을 포함한다.
  generic fixture를 먼저 만들 필요 없이 실제 route adoption에서 panel/canvas/timeline 경계를
  검증한다.
- 각 route 전환(DS-P5-003/004/005) 완료 시 대응하는 DS-F-007 화면 재조립을 같은 release 주기에서
  재검증한다. 코드 화면과 Figma template이 같은 版의 시스템을 가리켜야 목표 B가 유지된다.
- P5 complete와 DS-F-007 대상 화면 완료가 모두 충족되면 1절의 최종 판정표를 실측해 결과를 Updates에
  기록한다.

## 7. 이 계획이 의도적으로 하지 않는 것

- SEED의 Bun/yarn, fumadocs, per-component 패키지 분할, CLI snippet 배포(shadcn 방식), Stackflow
  통합, MCP 서버 제공을 복제하지 않는다. 수요가 검증되면 별도 Decision으로 다룬다.
- Code Connect, Library Analytics API, LIBRARY_PUBLISH webhook은 요금제 확보 전까지 백로그다.
- Figma → 코드 방향 동기화(SEED의 figma-extractor cron)는 published library와 디자이너 편집 흐름이
  생긴 뒤에만 Decision으로 검토한다. 그 전까지 정본은 항상 코드 쪽 DTCG source다.
