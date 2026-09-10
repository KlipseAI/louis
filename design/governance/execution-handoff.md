---
id: governance-execution-handoff
status: experimental
authority: normative
---

# Claude Code 실행 인계서

> **2026-08-23 — 제품 전 페이지 Figma 이식 작업은
> [현재 인계서](handoff-2026-08-23-figma-product-pages.md)에서 이어간다.** `/`, `/privacy`,
> `/terms` 6프레임이 권위 프레임이고 `/pricing`은 측정 완료·Figma 캡처 전 상태다. 공개·문서·법무·인증
> 22개 route의 desktop/mobile 측정도 완료됐다. pinned commit의 page file은 49개이며 27개 route
> pattern 중 16개 static route는 제품이 선언한 development-only auth fixture의 실패/빈 기본 상태까지
> desktop/mobile로 측정했다. 운영 인증·API 성공·dynamic data parity는 아직 남았다.

> **2026-08-24 — 공통 desktop GNB/top bar, 결제 실패 4장면, VideoEditor project grid,
> Analytics 기본 상태와 Highlight 5열 Auto Layout의 최신 node ID·생성기 상태는 위 현재 인계서의
> `2026-08-24 한도 인계` 절이 소유한다.** collapsed Upgrade CTA는 라이브 Figma 수정은 끝났지만
> typography 재측정과 sidebar-state renderer 반영이 남았으므로, generated runner를 재실행하기 전에
> 반드시 그 절의 첫 3단계를 완료한다.

> **2026-08-22 — 새 Claude Code 세션이라면 [계정 이전 인계서](handoff-2026-08-22-account-transfer.md)를
> 가장 먼저 읽는다.** 대화 맥락은 0에서 시작하고, `KLIPSE_PRODUCT_REPO` 를 세우지 않으면
> `pnpm verify` 가 `verify:product` 첫 게이트에서 exit 1 로 죽는다.
>
> **2026-08-19 — 이어받는 사람은 [제품 실측 대조 인계서](handoff-2026-08-19-product-parity.md)를
> 먼저 읽는다.** 아래 큐보다 그것이 앞선다. DS 값이 제품을 확인하지 않고 정해져 있던 **빚의
> 정본은 `figma/unverified-values.json`의 `$count`이며, 그 수는 지금 0이다** — 그 인계서의 (A)
> 절이 소진 과정의 기록이다. 그 문서에 절대 하지 말 것과 다음 순서가 있다.

이 문서는 Claude Code Opus 5를 포함한 후속 작업자가 Klipse Design의 P3–P5를 중단 없이 이어가기 위한
실행 계약이다. 특정 모델의 기억이나 대화 기록에 의존하지 않는다. 실제 상태는 항상
[`design/manifest.json`](../manifest.json), 행동 계약은 관련 규범 문서, 배포 가능 여부는 package와 검증
근거로 판정한다.

작업별 상세 절차, 완성의 최종 판정표, 환경 게이트와 Figma 실행 경계는
[실행 플레이북](execution-playbook.md)이 소유한다. 큐 ID, 의존성과 완료 조건이 충돌하면 이 문서가
우선한다.

## 1. 임무와 최종 결과

Klipse Design을 제품 화면 코드와 분리된 독립 디자인 시스템으로 운영한다. SEED Design의 시각 스타일이나
코드를 복제하는 것이 아니라 다음 운영 흐름을 Klipse 규모에 맞게 구현한다.

```text
token source
  -> deterministic projections
  -> CSS foundations and recipes
  -> accessible headless behavior
  -> styled React components
  -> human docs, AI docs and Figma library
  -> versioned product adoption with rollback
```

최종 성공은 문서 수나 component 수가 아니다. 제품이 source path나 legacy UI 값 대신 version이 고정된
공개 package를 소비하고, 변경 영향·접근성·Figma parity·migration·rollback을 release마다 검증할 수 있어야
한다.

## 2. 권위와 저장소 경계

충돌이 생기면 다음 순서로 판단한다.

1. `design/manifest.json` — ID, maturity와 surface별 준비 상태
2. `design/` normative docs — 의미, 행동, 접근성, 수용 조건
3. `packages/tokens/src/klipse.tokens.json` — token value와 alias graph
4. `packages/css`, `packages/react`의 테스트된 source — 공개 Web API와 동작
5. generated artifact — 위 정본의 projection
6. 소비 제품의 integration evidence — 특정 route에서의 실제 채택 결과

이 저장소는 공용 token, CSS, React API, Figma 계약, 문서와 release tooling을 소유한다. 소비 제품은 scene,
route composition, 제품 전용 layout, legacy adapter와 E2E evidence를 소유한다. 제품 결함이나 과거 debt를
공용 규범에 복사하지 않고 stable manifest ID와 release version으로 연결한다.

Figma proposal과 published library도 token 정본이 아니다. 현재 방향은 code-first DTCG source에서 Figma로
전달하는 것이다. 반대 방향 동기화가 필요해지면 별도 Decision과 conflict policy가 먼저다.

## 3. 현재 기준선

작업 시작 때마다 manifest와 [Roadmap](roadmap.md)을 다시 확인한다. 이 문서 작성 시의 정직한 기준선은
다음과 같다.

- P1 portable contract는 로컬 release-candidate다.
- P2 token source/projection pipeline은 `experimental` local release-candidate다.
- P2 token artifact 여섯 개는 생성되지만 public package release, 제품 adoption과 published Figma library는
  모두 `not-ready`다.
- Browser UI, glyph, 접근성, layout과 interaction acceptance는 P3/P5 소비 구현 전까지 `not-ready`다.
- 모든 catalog component와 pattern의 Web/Figma 구현 상태는 아직 실제 근거가 생기기 전까지 올리지 않는다.
- 원격 저장소, hosted CI와 owner approval은 P1/P2의 `complete` 승격 조건이지만 안전한 로컬 P3 구현의
  선행 조건은 아니다.

로컬 산출물이 존재한다는 이유로 `public`, `published`, `adopted`, `stable`이라고 표현하지 않는다.

## 4. SEED에서 가져올 것과 가져오지 않을 것

SEED의 [공식 monorepo](https://github.com/daangn/seed-design)는 definition, generated style, headless behavior,
styled component, docs와 migration tooling을 한 저장소 안에서 책임별로 나눈다. 공식
[기술 문서](https://github.com/daangn/seed-design/blob/dev/TECH.md)는 생성 파일을 직접 수정하지 않고
정의에서 CSS와 component까지 전달하는 흐름을 설명한다. Klipse는 다음 원칙을 채택한다.

- 하나의 독립 monorepo에서 token, CSS, React, docs와 release evidence를 함께 변경한다.
- source와 generated artifact를 분리하고 생성물 직접 수정을 게이트로 차단한다.
- style과 interaction behavior를 분리하되 처음부터 불필요한 package를 늘리지 않는다.
- component spec과 개발 API 문서를 연결하고 surface별 상태와 근거를 공개한다.
- 사용자 영향 변경에는 changelog, migration과 deprecation window를 제공한다.
- 사람용 규범에서 `llms.txt`를 생성하고 AI 문서를 별도 정본으로 만들지 않는다.

다음은 현 단계에서 복제하지 않는다.

- SEED의 Figma-first Rootage/Qvism pipeline과 독자 engine
- iOS, Android, Lynx와 여러 bundler plugin
- 수요가 검증되지 않은 CLI, codemod, Skill, MCP server
- SEED의 token 이름·값·font·brand look·component API
- SEED가 선택한 package manager, docs framework와 test stack 자체

새 도구는 “SEED에 있다”가 아니라 Klipse consumer, 유지 책임과 rollback이 확인될 때만 도입한다. 공식
[Progress Board](https://seed-design.io/components/progress-board),
[React 설치 문서](https://seed-design.io/react/getting-started/installation/manual),
[Changelog](https://seed-design.io/react/updates/changelog)는 운영 방식의 참고 자료이며 Klipse 규범을
대체하지 않는다.

## 5. 목표 package 경계

| Surface                     | 단독 책임                                                        | 의존 방향                         |
| --------------------------- | ---------------------------------------------------------------- | --------------------------------- |
| `@klipse-design/tokens`     | DTCG source, semantic token projection, diff와 Figma proposal    | runtime dependency 없음           |
| `@klipse-design/css`        | token CSS 재export, opt-in base/reset, primitives와 recipes      | tokens만 소비                     |
| `@klipse-design/react`      | 접근 가능한 behavior와 styled React public API                   | tokens/CSS public surface만 소비  |
| `apps/docs`                 | 실제 package를 소비하는 spec, API, example, search와 update 문서 | 공개 package만 소비               |
| published Figma library     | token variable와 검증된 component representation                 | token/component 계약의 downstream |
| product integration adapter | release adoption, legacy bridge와 rollback                       | versioned public package 소비     |

역방향 의존은 금지한다. Token package가 CSS/React를 알거나 React source가 docs/product code를 import하면 안
된다. `packages/react` 안에서는 headless behavior와 styled layer를 내부 모듈로 분리한다. 두 개 이상의 실제
consumer가 독립 headless API를 요구하기 전에는 별도 public headless package를 만들지 않는다.

## 6. 자율 작업 프로토콜

### 세션 시작

1. `git status --short`로 기존 변경을 확인하고 다른 작업자의 변경을 보존한다.
2. 루트 `AGENTS.md`, `CLAUDE.md`, manifest, 이 문서와 대상 규범을 읽는다.
3. [작업 큐](#8-작업-큐)에서 의존성이 충족된 가장 앞의 작은 작업을 선택한다.
4. 관련 package source, tests와 product extraction reference를 읽어 가정을 확인한다.
5. 행동이 바뀌는 작업은 회귀 검사를 먼저 만들고 짧은 실행 계획을 적는다.

### 구현 중

- 한 번에 한 계약 또는 한 기반 layer만 바꾼다.
- generated 파일과 `GENERATED:*` 구간은 수정하지 않고 source 변경 후 재생성한다.
- raw primitive보다 semantic token, 숫자 z-index보다 layer token, 임의 media query보다 승인된 responsive
  profile을 사용한다.
- 공개 API, package 경계, dependency, styling cascade 또는 sync 방향이 갈리면 Decision에 대안·선택·영향·
  rollback을 먼저 기록한다.
- 익숙하지 않은 framework/library 동작과 접근성 규칙은 해당 시점의 공식 문서로 확인한다.
- 외부 publish, 자격 증명, hosted 설정처럼 권한이 필요한 일은 상태를 올리지 않은 채 blocker로 분리하고
  다음 로컬 작업을 계속한다.
- Figma 쓰기는 사용자가 지정한 draft 파일에만 MCP(Plugin API)로 수행한다. library publish는 어떤
  방법으로도 자동화하지 않으며, 표준 검증을 실행할 수 없는 환경이면 실행하지 못했다는 사실을 그대로
  보고한다. 세부 경계는 [플레이북 4절](execution-playbook.md)을 따른다.
- 독립적인 공식 문서 조사, 접근성 검토와 QA는 보조 agent에 병렬 위임할 수 있다. 같은 파일의 동시 편집,
  manifest/status 최종 판단과 generated output 갱신은 주 작업자가 소유한다.

### 변경 단위

사용자에게 보이는 변경은 가능하면 다음을 같은 commit에 포함한다.

1. manifest/status
2. normative contract 또는 Decision
3. package source
4. unit, interaction, accessibility, browser/visual 또는 consumer test
5. example/API docs
6. Updates와 migration/deprecation note
7. 재생성된 artifact

### 세션 종료

**커밋 전**에 이 다섯을 돌린다.

```sh
export KLIPSE_PRODUCT_REPO=<klipse-web 경로>
pnpm build
pnpm check
pnpm verify
pnpm test
git diff --check
```

**커밋 뒤, 푸시 전**에 하나 더 돌린다.

```sh
pnpm clean-room
```

- `KLIPSE_PRODUCT_REPO` — 세우지 않으면 `verify:product` 첫 게이트가 죽는다. 이 저장소의 스크립트
  다수가 원저자 맥 경로를 기본값으로 갖고 있어 **그 맥에서만 우연히 통과한다.**
- `pnpm test` 는 `verify` 안에 없다. `verify` 의 test-harness 는 러너가 실패를 전파하는지와
  suite 가 도는지를 보지만, 컴포넌트 acceptance 회귀 전량은 `pnpm test` 가 돈다.
- **`pnpm clean-room` 은 워킹트리가 더러우면 거부한다** — 커밋 *뒤* 단계다. 커밋 전 목록에 넣으면
  항상 실패한다. 이것이 커밋된 HEAD 만 clone 해 러너를 재현하며, 추적되지 않은 파일과 낡은
  `node_modules` 를 잡는다.
- `build-design-docs --check --require-tracked` 는 `clean-room` 과 hosted CI 안에서 돈다 —
  따로 부를 필요는 없지만, manifest 에 등록됐는데 `git add` 안 된 파일을 잡는 것이 그것이다.

실패한 표준 검증을 생략하고 완료라고 말하지 않는다. **외부 상태를 바꾼 뒤에는(푸시 · 제품 저장소
조작) 검증을 다시 돌린다** — 그 전에 돈 초록은 바뀐 상태를 보지 않았다. 최종 보고에는 변경 파일,
달라진 public contract, 검증 결과, 남은 위험과 다음 작업 ID를 쓴다.

## 7. 상태 승격 규칙

| 상태            | 최소 근거                                                                    |
| --------------- | ---------------------------------------------------------------------------- |
| `not-ready`     | public 소비 surface 또는 필수 검증이 없음                                    |
| Web `partial`   | public API 후보와 핵심 test가 있으나 release, 호환성 또는 consumer 근거 부족 |
| Web `done`      | package public export, 접근성/interaction/browser test와 release evidence    |
| Figma `partial` | Figma 파일 안의 reviewable library draft(variable/component)와 stable key, draft↔proposal parity report — proposal JSON만으로는 불충분 |
| Figma `done`    | 같은 파일 안에서 인스턴스로 소비 가능한 component set, 게이트가 지키는 variant/state parity, **두 방향** 기하 evidence(계약 ↔ `components.measured.json` ↔ 브라우저 테스트). **게시는 조건이 아니다** — [DS-D-0035](decisions/DS-D-0035-figma-done-without-publish.md) |
| Docs `done`     | 규범, API, 상태, 접근성, responsive/content, 실행 example과 migration        |
| `beta`          | 제한된 adoption이 가능하고 breaking change에 migration을 제공                |
| `stable`        | Web/Figma/Docs 완료와 실제 제품 adoption/rollback evidence                   |

`partial`은 일정 진척 표현이 아니라 소비 가능한 범위와 남은 결함이 명시된 상태다. Code가 merge됐거나 local
example이 보인다는 사실만으로 Web `done`이 되지 않는다.

P3는 다음 세 경계로 나눈다.

- **P3 core local RC:** CSS/React package와 Button, Menu/Popover, Dialog의 local consumer fixture 통과
- **P3 catalog coverage:** manifest의 Input, Tooltip, Toast, Empty State와 Loading까지 각 규범과
  필요한 구현 상태를 정직하게 제공. **`select` 는 범위 밖이다** — 「고르기는 Menu 가 소유한다」로
  판정이 끝났고 manifest 가 `not-planned` 다(아래 (1d))
- **P3 complete:** public release, hosted CI, **parity 검증된** Figma variable/component, 호환성·접근성
  증거와 owner 승인. 여기서 「published」를 걷어낸 근거는
  [DS-D-0035](decisions/DS-D-0035-figma-done-without-publish.md)다 — 소비자가 같은 파일 안에 있는
  동안 게시는 검증을 대신하지 못한다

Core RC는 P3 전체 완료가 아니다.

## 8. 작업 큐

큐 ID는 순서와 인계 단위다. 하나의 ID가 너무 크면 하위 ID로 나누되 완료 조건을 약화하지 않는다.

상태는 `pending`, `ready`, `in-progress`, `blocked`, `done`만 사용하고 동시에 하나만 `in-progress`로 둔다.
각 작업을 마칠 때 이 문서의 다음 포인터와 Updates를 함께 갱신한다.

큐는 네 트랙으로 나뉜다. 코드 트랙(P3)과 Figma 트랙(DS-F)은 병렬이며, Figma variables 구축은 React
구현을 기다리지 않는다. DS-F-006 component parity만 해당 컴포넌트의 코드 구현과 짝을 이룬다.

**DS↔제품 게이트가 생겼다 (2026-08-15).** `scripts/verify-product-parity.mjs`가 `pnpm verify`에
들어 있다. 제품 공용 구현을 정본으로 삼아 축마다 판정하며 셋 중 하나로 갈린다 — **채택** ·
사유를 적은 **의도적 편차** · 제품에 공용 정본이 없어 대조 대상이 아닌 것. **현재 수는
`pnpm verify-product-parity` 출력이 낸다**(한때 여기 적혀 있던 205축·143건은 낡았다). 근거는
[`migration/product.measured.json`](../../migration/product.measured.json)과
[`migration/component-parity.md`](../../migration/component-parity.md)에 있다.

이 게이트가 없던 동안 DS의 다른 게이트는 **전부 DS 내부 일관성만** 봤다(코드↔Figma, 토큰↔생성물).
그래서 DS가 제품과 백여 축이 다른데도 전부 초록이었다. 앞으로 제품과의 차이는 고쳐지거나 사유가
적힌 편차로 선언되거나 둘 중 하나여야 한다.

**제품에 공용 정본이 있는지 없는지는 컴포넌트마다 다르다.** 정본은
[`migration/product.measured.json`](../../migration/product.measured.json)의 각 컴포넌트
`canon.kind` 이며 `shared-component` · `shared-tokens` · `shared-css` · `none` 중 하나다.
한때 이 자리에 「셋뿐이다」가 적혀 있었으나 `canon.kind !== "none"` 을 세면 그보다 많다 —
**그 문장은 제품에 정본이 있는데도 DS가 값을 임의로 정하게 만드는 지시로 읽힌다.** 값을 정하기
전에 그 필드를 먼저 열어라.

Icon Button 의 정본으로 지목됐던 제품의 공유 UI 패키지는 Turborepo 스타터 보일러플레이트였고
어떤 컴포넌트도 쓰지 않는다 — 그 기각 근거도 같은 파일에 있다.

**현재 다음 포인터 (2026-08-18 갱신).**

## 지금 어디에 있는가

| 축 | 상태 |
| --- | --- |
| GOV 트랙 | `DS-GOV-000`이 `partial` — 원격 done. **hosted CI 는 `verify:ci` 갈래만 돌고 2026-08-22 부터 결제로 정지.** 두 갈래의 단계 수는 `package.json`의 `verify:ci`·`verify:product`가 소유한다 — 표에 박지 않는다. owner 승인과 publish 권한 남음 |
| `DS-F-000`~`DS-F-005` | `done` |
| `DS-P3-002a` · `002`(1단계) · `003` · `009a` · `013` | `done` |
| `DS-P3-001` | `in-progress`. Decision 6종을 다 썼고 owner 확인만 남았다 |
| Decision | `ls design/governance/decisions/DS-D-*.md \| wc -l` · 대기는 `grep -l '^- Status: proposed' …` |
| 카탈로그 | gap registry 합산 우선순위 15종이 닫혔다. **화면별 세부 부품은 그 목록에 처음부터 없었다**(아래 정정 참조) |
| manifest component | [`manifest.json`](../manifest.json)이 정본이다 — `select` 만 `not-planned` 이고 `not-ready` 는 없다 |
| Figma | `pnpm verify-figma-parity` 출력이 변수·collection·style·component 수를 낸다 |
| 검증 | `pnpm test` 가 브라우저 회귀 수를, 각 `verify-*` 게이트가 자기 canary 수를 출력한다 |

**이 표에 수를 다시 박지 마라.** 한때 여기에 Decision 18종 · component 18개 · Figma 19/29/210/22 ·
브라우저 632건이 적혀 있었고 **여섯 개가 전부 낡았다.** 손으로 유지되는 수는 「무엇이 남았는가」의
판단을 직접 틀리게 한다. 수가 필요하면 위 명령을 그 자리에서 돌린다.
**2026-08-30에 하나가 더 빠졌다 — GOV 행이 싣고 있던 「`verify:ci` 13개」다.** 실측에서 두 갈래
어느 쪽도 그 수가 아니었다. 게이트 수의 정본은 `package.json`의 `verify:ci`·`verify:product` 두
스크립트다. **산문에서 그 수를 보거든 고쳐 쓰지 말고 그 자리에서 `package.json`을 연다** — 같은
수가 이 저장소의 문서군에 여러 벌 실려 있었고, 한 자리만 고치면 나머지가 그것을 되살린다.

**"카탈로그가 닫혔다"는 틀린 요약이었다(2026-08-18 정정).** 닫힌 것은 gap registry의 **합산
우선순위 15종**이다 — 여러 화면에 걸치는 공용 부품 목록. **화면별 세부 부품은 그 목록에 처음부터
없었고, 지금도 카탈로그에 없다.** 이 문장을 그대로 읽으면 "세 화면을 그릴 수 있다"로 오해하게
되며 실제로 그런 오해가 한 번 일어났다. 같은 문서군의 gap registry는 정반대를 적어 두고 있다 —
*"현재 셋 다 미달이고, 가장 먼 것은 에디터다."*

정확한 상태는 이렇다.

| 층 | 무엇 | 수 |
| --- | --- | ---: |
| 카탈로그에 등록조차 없음 | 타임라인 · 트랙레인 · 룰러 · 플레이헤드 · 파형 · 필름스트립 · 인스펙터 · 캔버스 노드 · 엣지 · 미니맵 · 툴바 · 줌 컨트롤 · 드롭존 · 비디오 플레이어 · 탭 · 칩 · 컬러 피커 · 코치마크 · 투어 · 리사이즈 디바이더 등 | 미등록 |
| 규범 문서만 있고 구현 없음 | `landing-shell` · `auth-two-panel` · `status-result` · `route-boundary` · `editor-workspace` | 5 |
| 규범·구현 있고 Figma만 없음 | `loading` · `app-shell` · `project-grid` | 3 |

**아래 두 행의 정본은 [`manifest.json`](../manifest.json)이다** — `web: not-ready` 가 2행,
`web: partial` + `figma: not-ready` 가 3행이며 둘 다 지금은 pattern 만 해당한다. 손으로 센 수를
믿지 말고 manifest 를 다시 읽어 판단한다.

1행은 **카탈로그에 등록조차 되지 않은 것들**이며 이 문서 어디에도 그 목록이 따로 있지 않다.
새로 세우려면 gap registry 와 제품 실측으로 수요를 먼저 확인한다. (1a)~(1d)와 아래 새
판정 둘은 owner 결정이 필요해 병렬로 열려 있다.

## 다음 작업

**(1a) 소비처 0인 semantic 토큰이 41/132다 — 전수 감사(2026-08-17).** 셋으로 갈린다.

| 갈래 | 수 | 판정 |
| --- | ---: | --- |
| **컴포넌트를 기다리는 중** | 28 | 정상이다. `color-status-{info,success,warning}-*`는 Badge가, `layout-app-shell-*`는 AppTopBar가, `layout-project-*`는 Project Grid 패턴이 소비한다. 미사용 typography weight도 여기다 |
| **구조상 참조될 일이 없다** | 9 | `motion-*-delay` 8종은 전부 0ms이고 CSS는 delay를 생략한다. `layer-content`(0)도 같다 |
| **이름이 가리키는 것이 그 이름을 안 쓴다** | **4 → 3** | 아래. `radius-card`·`elevation-focus-ring`과 같은 종류다 |

넷은 이렇다.

- **`elevation-popover`** — `.louis-popover`는 action-menu와 composite-popover **둘 다**
  `elevation-menu`를 쓴다. popover라는 이름의 토큰을 popover가 안 쓴다
- **`elevation-focus-ring`** — 실제 링은 `outline`이고 이 토큰은 box-shadow `0 0 0 3px` 파랑 42%다
- **`blur-panel`**(12px) — 흐림을 쓰는 둘이 각각 `blur-toast`(16px · Toast)와 `blur-surface`(10px ·
  ProjectCard)를 쓴다. panel 을 쓰는 자리가 없다
- ~~**`color-stroke-strong`**~~ — **해소됨(2026-08-18).** Checkbox가 첫 소비처이고 이름이 뜻과
  맞는다 — 경계가 반드시 보여야 하는 자리다. **폐기 후보에서 뺀다.** 남은 것은 위 셋이다

**넷 다 Figma 변수나 effect style로 발행돼 있어 폐기가 breaking이다.** DS-D-0014와 같은 절차가
필요하며 owner 결정이다. "기다리는 중"과 "이름이 틀린 것"을 가르는 것이 이 감사의 값이다 —
전자는 두면 되고 후자는 다음 사람이 집으면 화면이 달라진다.

**(1b) 위 넷 중 `elevation-focus-ring`은 이미 한 번 걸렸다.** 이름은 focus ring인데
실제 focus ring은 `outline: var(--louis-border-width-ring) solid var(--louis-color-stroke-focus)`이고
그 토큰(box-shadow `0 0 0 3px` 파랑 42%)은 아무 데서도 쓰이지 않는다. `radius-card`와 **같은
종류의 함정**이다 — 이름으로 집으면 화면이 달라진다. 다만 Figma effect style로도 발행돼 있어
폐기는 breaking이며, DS-D-0014와 같은 절차가 필요하다. 지금은 리터럴 2px만 토큰으로 바꿔 두었다.

**(1c) Spinner(10순위) — `done`(2026-08-17).** 남은 것은 같은 순위 안의 세 갈래다.

- ~~**determinate 진행률**~~ — **해소됐다.** 접근성 계약은
  [DS-D-0022](decisions/DS-D-0022-determinate-progress-a11y.md)가 소유하고 `progress` 는 manifest 에서
  web·figma 모두 `partial` 이다. 「계약부터 정해야 한다」를 읽고 다시 조사하지 마라
- **스켈레톤과 텍스트 쉬머** — 재실측(2026-08-17)으로 수가 늘었다. 자리표시 정의 **32벌**
  (면 계열 19 + 텍스트 쉬머 13), 로딩용 keyframe **12종**, 기법 **5갈래**. 앞선 조사의
  "15벌 · 4종 · 3기법"은 전부 과소집계였다. 우세 기법은 면 그라디언트 `background-position`
  이동이고 그 8개 소비처 중 6개가 바이트 동일하다. **선행 작업은 끝났다**(DS-D-0017) —
  `motion-shimmer`와 `background-position` 허용이 섰다
- ~~**면 색이 문제다.**~~ — **해소됨(2026-08-18). 이것은 답이 아니라 틀린 질문이었다.**
  제품을 직접 재보니 면은 `rgb(var(--gray-000-rgb) / 8%)`, 하이라이트는 같은 색 9%다.
  `--gray-000`은 **전경색**이고 테마마다 뒤집히므로 **제품은 테마별 면을 고른 적이 없다.**
  위 문장은 "solid 면 토큰이 필요하다"를 전제했고 실측이 그 전제를 부정한다 — 고를 면이 없으므로
  죽을 조합도 없다. Skeleton이 `currentcolor` 알파로 섰고 owner 판정은 필요하지 않았다.
  **인계서에 적힌 판정 문장도 실측을 면제받지 않는다**

아래는 해소된 기록이다. 실측은 끝났다(약 62벌). 실측은 끝났고(약 62벌 — 회전 22 ·
스켈레톤 15 · 진행률 5 · 텍스트 쉬머 11), 막고 있던 셋을 [DS-D-0016](decisions/DS-D-0016-loop-motion.md)이
풀었다 — `loop` lifecycle, `reducedMotionPairs` 면제, `rotate` 허용. `motion-loop`(700ms · linear)가
서고 기존 spinner 둘이 그 토큰을 가리킨다. **이제 컴포넌트를 지을 수 있다.**

지을 때의 입력.

- 크기 단계가 없다. 제품 LoadingSpinner는 md 16 / sm 12이고 DS spinner는 `1em`(=18px)이다
- 트랙 색이 없다. 제품은 `currentColor`를 0.22로 깐 링, DS는 위쪽 테두리만 비운다
- 스켈레톤 15벌과 텍스트 쉬머 11벌은 **다른 컴포넌트**다. 같은 loop lifecycle을 쓰되 축이 다르다
- 진행률(determinate) 2벌은 두께·색·전환이 셋 다 다르다. `role="progressbar"`는 저장소 전체에
  1곳뿐이고 `<progress>`는 0곳이다

아래는 해소된 기록이다.

- [motion.md](../foundations/motion.md)가 **무한 반복을 다루지 않는다.** 소유 목적을
  enter/exit/layout-change로 한정해 두었고, 무한이 등장하는 유일한 문장은 P3/P5 게이트의
  "reduced-motion에서 무한 shimmer가 제거된다" 하나이며 아직 `not-ready`다
- `scripts/lib/token-model.mjs`가 semantic transition 토큰 전량에 reduced-motion 짝을 강제한다.
  루프 토큰을 만들면 짝이 필수인데 `0ms + infinite`는 의미가 성립하지 않는다
- 허용 property가 `opacity`·`transform` 둘뿐인데 기존 스피너 둘은 개별 속성 `rotate`를
  애니메이션한다 — 선언과 실제가 어긋난다

**(1d) `select`는 `not-planned`다 — 판정이 끝났다(2026-08-18).** 다시 실측하니 네이티브
`<select>` **12벌이 전부 `/admin` 아래**이고 배포 화면(Home·Highlight·Editor)에는 **0벌**이다.
제품은 트리거 + 메뉴 패널로 고르며 그 파일이 11개다. DS에는 이미 `ActionMenu`와
`CompositePopover`가 있어 그 자리를 덮는다. **고르기는 Menu가 소유한다**로 정하고 manifest를
`not-planned`로 바꿨다 — 관리자 도구는 이 저장소의 소비 surface가 아니다. 수요가 생기면
Decision으로 이 판정을 뒤집고 다시 연다.

아래는 그 판정의 근거가 된 기록이다.

**~~(1d) `select`가 계획에 없다 — 판정이 필요하다.~~** manifest에 `not-ready`로 남아 있는 유일한
component인데 **gap registry 우선순위 1~15 어디에도 없다.** 실측 이유가 있다 — 제품은 네이티브
`<select>`를 **5파일**에서만 쓰고(2026-08-21 재실측 — 원래 3파일이라 적었다. 5파일 전부
admin·운영 화면이다), 고르는 일은 대부분 트리거 + 메뉴 패널로 한다(`CustomDropdown`·
`VideoModelMenu` 계열 9파일 — 이 수는 재실측에서 확인됐다). DS에는 이미 `ActionMenu`와 `CompositePopover`가 있다.

셋 중 하나를 골라야 한다 — (a) Select를 세운다, (b) "고르기는 Menu가 소유한다"로 정하고 manifest
항목을 `not-planned`로 바꾼다, (c) 남겨 둔다. 지금처럼 계획 없이 `not-ready`로 두면 카탈로그가
영원히 미완으로 읽힌다.

**(2) gap registry가 닫혔다 — 1~15순위가 전부 `done`이다(2026-08-18).**

**15순위 SelectableListRow에서 등록부의 수치가 아홉 번 만에 처음으로 맞았다**(하이라이트 2 ·
에디터 1 = 3벌). 그 전 여덟 번은 매번 틀렸다. 다음 사람이 알아야 할 것 둘.

- **선택 면 하나에 기대면 다크에서 사라진다.** 표면 위에 놓고 재면 light는 `#fafafa`↔`#eaebee`로
  구분되는데 **dark는 `#313644`↔`#313644`로 같다.** 워크샵에서 눈으로 확인했고, 3px 선행 표식이
  없었으면 선택이 보이지 않았다. **같은 위험이 `SidebarNavItem`에 그대로 남아 있다** — 그것은
  면만으로 선택을 표현하며 사이드바가 캔버스 위에 있는 동안에만 성립한다. 앱 셸 composition을
  지을 때 이 사실을 함께 본다
- **두 선택 모델을 한 컴포넌트에 담지 않았다.** 행의 면이 선택을 갖는 쪽(2벌)만 이 컴포넌트이고,
  체크박스가 갖는 쪽(1벌)은 Checkbox + 행 레이아웃이다. 행을 버튼으로 만들면서 안에 체크박스를
  넣으면 컨트롤이 중첩된다

**hosted CI가 로컬에서 보이지 않던 것을 네 개 잡았다(2026-08-18).** 초록에 이르기까지의 기록이다.

1. **브라우저 바이너리 설치 단계 없음.** 브라우저는 lockfile에 없는데 DS-D-0005가 실브라우저
   러너를 1단계에 뒀다. 로컬에는 2026-08-14에 받아 둔 캐시가 있어 **로컬에서만 통과했다**
2. **실브라우저 632건이 CI에서 한 번도 돈 적이 없었다.** `verify`의 test-harness는 러너가 실패를
   전파하는지만 증명하고 suite를 돌리지 않는다. `pnpm test` 단계를 붙였다
3. **`selectable-list-row`의 Default background 실패.** 원인은 **앞 테스트가 얹어 둔 포인터**였다 —
   받은 값이 `#171b22 / 0.08`, 곧 `color-accent-ghost-hover`였고 그 행이 `:hover`였다. 같은 좌표에
   새로 렌더된 요소가 hover를 받는 함정을 `surface-states` 테스트가 이미 적어 두었는데 이 파일이
   그것을 따르지 않았다. 단언 앞에 `unhover`를 넣었다 — **기대값은 바꾸지 않았다**
4. **틀린 진단 하나.** 3번을 "테스트의 범위 한정 누락"이라고 단정했다가 CI가 반증했다. 범위
   한정 자체는 옳아 남겼지만 원인이 아니었다

**교훈은 하나다 — 로컬 초록은 이 종류를 증명하지 못한다.** 포인터 위치·브라우저 캐시·러너 환경에
달린 실패는 clean checkout에서만 드러난다. 앞으로 실패 원인을 단정하기 전에 **CI에 진단을 실어
한 사이클 돌린다.** 그것이 3번을 한 번에 풀었다.

**남은 위험.** `document`에서 첫 요소를 집는 `find` 헬퍼와 hover 뒤 `unhover`를 빠뜨린 자리가 다른
테스트 파일에도 있을 수 있다. CI가 반복 실행으로 드러낼 것이고 그때마다 파일 단위로 고친다.

**카탈로그가 닫혀 코드 트랙에서 막는 것이 없어졌다.** 남은 것은 셋이다.

1. **`DS-F-006` Figma component set 넷** — Slider · SegmentedControl · Checkbox ·
   SelectableListRow. 목표 B의 병목이며 사용자가 지정한 draft 파일에 MCP로 쓴다.
   **착수 전 조사를 2026-08-18에 마쳤다 — 아래가 그 결과다.**

##### DS-F-006 착수 조사 (2026-08-18)

파일(`bxGEp0km5zluMJGulaTvFW`) 규약은 이렇다. Components 페이지가 SECTION 여섯(Actions ·
Overlays · Feedback · Icons · Content · Shell)으로 묶여 있고, component set 프레임은
HORIZONTAL auto-layout(padding 24 · gap 16~24 · radius 5)이다. 변형 이름은 코드의 union과
1:1(`Size=md`)이고, 부품 이름이 parity 계약의 `parts` 키와 짝을 이룬다(Spinner의 `Track`·`Arc`,
Badge의 `Label`). **모든 fill이 변수 바인딩이고 raw 값이 0이다.**

필요한 변수·style은 전부 이미 있다 — `spacing/control-{xs,sm,md,lg}` · `spacing/stack-xs` ·
`radius/{control,control-sm,overlay-item,pill}` · `layout/control-height-{md,sm}` ·
`border-width/{hairline,ring}` · 색 14종 · text style 15종. **새로 만들 토큰이 없다.**

**막는 것이 하나 있다 — 게이트의 기하 모델이 variant 축을 다루지 못한다.**
`verify-figma-parity.mjs`는 기하를 `geometry[size]` 하나로 읽고 각 필드를 배열로 모아 measured의
단일 값과 대조한다. 그래서 **같은 size 안에서 variant마다 기하가 달라지면 대조가 성립하지 않는다.**

| 컴포넌트 | 지금 가능한가 | 왜 |
| --- | --- | --- |
| Checkbox | **가능** | size 축이 없고 State가 색만 바꾼다. Badge와 같은 모델 |
| SelectableListRow | **가능** | 같음 |
| SegmentedControl | **가능** | ~~막힘~~ **정정(2026-08-18).** 선택/비선택이 색만 바꾸고 기하는 md/sm 두 값뿐이라 기존 Size 모델에 그대로 맞는다. Button처럼 `State`를 Figma 전용 property로 선언하면 된다 |
| Slider | 확장 필요 | `Variant=thumb\|track`이 레일 두께 4↔28과 썸 16↔2×14를 **바꾼다** — 복합 키가 필요한 유일한 컴포넌트다 |

**owner가 게이트 확장을 택했다(2026-08-18). 그 확장이 무엇인지 조사해 보니 처음 생각보다
작다 — 비교 로직이 아니라 키 규약 문제다.**

`geometry`의 키는 게이트가 정하지 않는다. `build-figma-snapshot.mjs`는
`geometry: sortByKey(component.geometry)`로 **되읽기가 준 키를 그대로 옮기고**,
`verify-figma-parity.mjs`는 `Object.entries(measured)`로 **measured의 키를 그대로 순회**한다.
즉 되읽기가 `md` 대신 `md/thumb`·`md/track`으로 묶어 주고 measured가 같은 키를 쓰면
**비교 코드를 한 줄도 바꾸지 않고** variant별 기하가 대조된다. 같은 그룹 안에서는 배열이
그대로 남아 "40개 중 하나만 어긋난" 것을 여전히 잡는다.

그래서 확장의 실제 범위는 넷이었고 **셋은 끝났다(2026-08-18).**

1. ~~복합 키 규약을 `build-figma-snapshot.mjs`의 되읽기 절차 주석에 적는다~~ — **done.**
   기본은 Size 값, size 축이 없으면 `base`, **Size 말고 다른 축이 기하를 바꿀 때만**
   `{size}/{variant}`
2. ~~measured를 복합 키로 재구성한다~~ — **done.** Slider만 해당한다(`md/thumb`·`md/track`·
   `sm/thumb`·`sm/track`). `railHeight`와 `thumbInline`/`thumbBlock`을 두 variant가 **같은
   이름으로** 쓴다 — track의 굵은 막대는 레일이고 얇은 표식은 썸이라 같은 부품의 다른 값이다.
   전에는 `railHeight`(4)와 `trackBarHeight`(28)가 한 항목에 섞여 있었다
3. ~~브라우저 테스트가 복합 키를 읽게 고친다~~ — **done.** 16건 그대로 통과하며 track 변형의
   `thumbBorderWidth: 0`까지 대조한다
4. ~~변조 canary를 하나 더 세운다~~ — **done.** `tamperCompositeKeyGeometry`가 `md/track`의 레일
   높이를 `md/thumb`의 값으로 바꿔 넣고, 게이트가 그것을 잡는지 매 실행에서 증명한다
   (canary 33 → **34종**)

`(b) Slider를 Figma에서 두 set으로 나누기`는 택하지 않는다 — 코드의 한 컴포넌트가 Figma에서
둘이 되면 대응이 1:1이 아니게 되고, parity 계약의 전제가 그것이다.

**게이트를 약하게 만드는 방향은 택하지 않는다.**

**착수 순서.** (1)~(3)이 끝났고 **SegmentedControl은 2026-08-18에 섰다**(component 15개, parity
통과). **넷이 전부 섰다(2026-08-18). `DS-F-006`이 닫혔다** — component 18개, parity canary 34종. **`DS-F-007` 카탈로그 재계수를 했다(2026-08-18) — Home이 요구한 8종 중 6종이 섰고 둘이 남았다:
`Avatar`와 `BannerCarousel`/`HomeBannerSlide`.** 배너 캐러셀은 허브 3곳이 공유하고 아바타는 셸
파일에 인라인이다. **화면 gap의 수(72·130·144)는 갱신하지 않았다** — 그것은 Figma에서 Home을
실제로 다시 조립해야 나오고 아직 하지 않았다. 배너 캐러셀의 선행 조건이던 아이콘
`caret-left`·`caret-right`·`caret-down` 셋은 **2026-08-18에 섰다**(글리프와 Figma component 가
함께 늘었다 — 현재 수는 `figma/snapshot.json` 이 낸다). **Avatar 와 BannerCarousel 이 둘 다 섰다** — manifest 에서 web·figma
모두 `partial` 이고 `figma/snapshot.json` 에 `BannerCarousel` 이 있다. census 는
[gap registry](../../migration/figma-gap-registry.md)에 있다.

한때 이 자리에 「`BannerCarousel` 은 지금 착수할 수 없다 — 막는 것 넷」이 적혀 있었다.
**그중 하나(점의 폭 전환)는 `layout-change` 토큰이 서면서 반증된다** — 생성 CSS 가 이미
`var(--louis-motion-layout-change-duration)` 을 쓴다. **그대로 읽으면 존재하는 컴포넌트를 처음부터
다시 설계하게 된다.** 남은 표현 한계(런타임 톤 샘플링 · progressive blur · stagger)는 그
컴포넌트의 Known deviations 가 소유한다.

**`Avatar`의 census는 2026-08-18에 끝냈다** — [gap registry](../../migration/figma-gap-registry.md)의
"Avatar 실측" 절에 있다. 공용 구현이 **부분만**(기본 아바타 SVG 하나) 있고 본체는 셸 파일에
인라인이며, 크기 축은 24·28 둘이다. **링 소유 판정도 끝났다 — Avatar는 링을 소유하지
않는다.** 아바타는 신원 표식이고 링은 사용량/진행률이라 뜻이 다르다. 흡수하면 모든 Avatar가
쓰지 않을 progress API를 갖고, 링을 아바타 밖에서 쓸 수 없게 되며, 무엇보다 **(1c)의 미결
판정(determinate 진행률의 접근성 계약)이 Avatar의 API로 새어 들어온다.** 링 사용처는 프로필
트리거 하나뿐이라 급하지 않다.

**그래서 Avatar는 착수 조건이 전부 충족됐다** — census 완료, 경계 판정 완료, 새 토큰 불필요
(크기 24·28은 제품 값을 그대로 옮기고 색은 기본 아바타에만 해당한다). 남은 것은 구현뿐이다.

남은 Figma 작업은 `DS-F-007` 화면 재조립(Avatar·Banner 선행)과 `DS-F-008` 수동 publish다.

**빌드 루프가 검증됐다.** 순서는 이렇다 — ① `use_figma`로 set 생성(모든 시각 속성을 변수·style에
바인딩, raw 0) ② 되읽기 덤프 ③ `figma/readback.json`의 `components`에 **그 컴포넌트만 병합**
(나머지는 바뀌지 않았으므로 건드리지 않는다) ④ `pnpm run build-figma-snapshot`
⑤ `verify-figma-parity.mjs`에 계약 추가 ⑥ manifest·규범 문서의 Figma 상태를 `partial`로.

**등록에서 걸리는 지점 둘을 미리 적는다.** stroke 되읽기 형식은 `{역할: ["두께|정렬"]}` 문자열
배열이고, 보이는 테두리 두께의 measured 키는 반드시 **`borderWidth`**여야 한다 —
게이트가 `spec.borderWidth`로 허용 stroke 집합을 만들기 때문에 다른 이름이면 집합이 비어
모든 stroke가 거부된다.

**준비는 해 두었다.** size 축이 없는 두 컴포넌트의 measured 키를 `md` → `base`로 옮겼다 —
게이트의 `sizeKey: "base"` 계약이 그 이름으로 readback을 찾는다(Badge·EmptyState와 같다).
이 상태에서 Checkbox와 SelectableListRow는 **build → snapshot 재덤프 → 계약 추가 → parity**
순서로 바로 진행할 수 있다
2. **owner 판정 — 넷이 닫혔다.** ~~(1a) `color-stroke-strong`~~(소비처가 생겨 폐기 후보에서
   빠졌다) · ~~(1d) `select`~~(`not-planned`) · ~~(1c) Skeleton 면 색~~(제품이 테마별 면을 고른
   적이 없어 고를 면 자체가 없었다) · ~~`layout-change` motion lifecycle~~(DS-D-0019).
   **남은 것은 (2b) 컨트롤 테두리 하나다**(셋 다 3:1 미달) — 새 값이 필요해 token source 를
   바꾸고 Figma 재적용이 따라온다
3. **`DS-P3-010` 공용 Pattern fixture** — Project Grid · Loading · App Shell 이 **전부 Web
   `partial` 로 섰다.** 한때 여기에 「남은 둘은 Loading(Skeleton에 막힘)과 App Shell」이 적혀
   있었으나 셋 다 manifest 가 `partial` 로 싣는다. **「아직 없다」를 읽고 App Shell 을 새로 지으면
   `.louis-app-shell` 계열을 두 번 만들게 된다.** 남은 것은 이 셋의 Figma 쪽이다(`not-ready`)

**14순위 Checkbox가 섰다(2026-08-18).** 등록부의 "4 파일"에 대해 실제는 **21벌 · 5레시피 ·
14파일**이다. 앞의 셋과 달리 **제품에 정본이 있었는데 21벌 중 2벌만 쓴다.** 이유를 제품이 스스로
적어 두었다 — 그 전역 클래스가 **cascade layer 밖**이라 `@layer utilities`를 무조건 이겨서,
색 하나를 바꾸려는 소비처가 클래스를 떼고 선언을 베껴야 했다. **레이어 밖 전역 선언은 정본으로
기능하지 못한다.** 제품 CSS를 정본으로 인용할 때 이 사실을 함께 본다.

**여기서 나온 실측이 열린 판정 둘을 직접 겨눈다.**

- **(2b) 컨트롤 테두리 정본** — 선택하지 않은 체크박스는 테두리가 어포던스의 전부라 SC 1.4.11의
  3:1이 걸린다. 상자 면 대비 실측은 `control` 1.27/1.63 · `default` 1.38/2.93 ·
  `strong` 2.52/4.61(라이트/다크)이고 **셋 다 라이트에서 미달한다.** "셋 중 하나가 틀렸다"가
  아니라 **셋 다 이 자리에는 모자란다**는 것이 답이다. 해소하려면 새 값이 필요하다
- **(1a) `color-stroke-strong` 처분** — 소비처 0이던 그 토큰의 첫 소비처가 생겼고 이름이 뜻과
  맞는다(경계가 반드시 보여야 하는 자리). **폐기 후보에서 빼고 다시 판정해야 한다.** 남은 셋
  (`elevation-popover`·`elevation-focus-ring`·`blur-panel`)은 그대로다

**13순위 SegmentedControl이 섰다(2026-08-18).** 등록부의 "3 파일"은 틀렸고 실제 **11벌 ·
6레시피 · 8파일**이다.

> **재실측(2026-08-21).** 벌 수 11은 그대로인데 **파일은 10개**다(빠뜨린 것 중 하나가
> `CropModal.tsx:471`의 `ASPECT_TOOLBAR`). 「레시피」는 묶는 기준에 판단이 들어가 기계로 셀 수
> 없다 — 그 수는 이 문서의 판정이지 실측이 아니다. Slider와 다른 점이 있다 — **공용 구현이 둘인데 서로 아무것도 공유하지
않는다.** `SegmentedToggle` 컴포넌트(3벌, 파일 주석이 스스로 SSOT라고 적어 두었다)와
`useSegmentedControlThumb` 훅(4벌, 훅만 공유하고 스타일은 복붙 — Youtube·Instagram의 5상수가
바이트 동일). 전자를 정본으로 잡고 반경·padding 3축에 기계 대조를 붙였다.

다음 사람이 알아야 할 것 셋.

- **`role="tablist"` 15곳 중 5곳은 패널을 바꾸는 탭이고 3곳은 카루셀 점이다.**
  (2026-08-21 재실측 — 원래 14곳이라 적었다.) 세그먼트 컨트롤은
  값을 고르고 자리를 옮기지 않는다. 갈라 두지 않으면 **Tabs를 만들 때 같은 것을 두 번 만든다.**
  Tabs는 아직 카탈로그에 없고 제품에 5자리가 있다
- **(1c)의 면 충돌이 실제로 컴포넌트를 막는다.** 다크에서 `background-inset`·`surface`·`menu`·
  `overlay` 넷이 같은 색이고 라이트에서 `raised`·`overlay`·`surface` 셋이 같아, 트랙/선택 면으로
  쓸 수 있는 조합이 `inset` ↔ `raised` **하나뿐이다.** 다음에 면 두 겹이 필요한 컴포넌트도 같은
  벽을 만나며, owner 판정 전까지는 이 짝 말고 선택지가 없다
- ~~**`layout-change` motion 토큰이 없다.**~~ — **해소됐다.**
  [DS-D-0019](decisions/DS-D-0019-layout-change-motion.md)가 넷째 lifecycle 을 세웠고
  `motion-layout-change` 가 token source · 생성 CSS · Figma snapshot 셋 다에 실재한다

**12순위 Slider가 섰다(2026-08-18).** 등록부의 "에디터 `Slider.Root` 9"는 네 배 틀렸고 —
실제 **37벌 · 7레시피**, 그중 네이티브 `input[type=range]` 15벌은 등록부에 아예 없었다 —
일곱 레시피가 **합의하는 축이 하나도 없어** 정본이 없다. 여기서 나온 것 둘을 다음 사람이 알아야
한다.

- **게이트가 볼 수 없는 자리가 있다.** Chromium은
  `getComputedStyle(input, "::-webkit-slider-runnable-track")`에 섀도우 pseudo-element가 아니라
  **호스트 요소의 값**을 돌려준다(실측 320×40 · 배경 투명 · 반경 0). 레일·채움·썸의 렌더 결과를
  계산값으로 잴 수 없어 states 표를 두지 않았고 기하는 CSSOM 선언을 대조한다. `<select>`,
  `<progress>`, `<meter>`, 파일 입력의 버튼도 같은 성질이라 **(1d)의 Select와 (1c)의 진행률이
  같은 벽을 만난다.**
- **워크샵이 헤드리스가 못 보는 결함을 또 잡았다.** `color-fg-on-inverse`는 테마마다
  뒤집히는데(#fafafa ↔ #171b22) `color-accent-primary`는 두 테마가 같다. 그래서 파란 면 위의
  표식이 다크에서만 검게 변했다. 선언도 토큰도 정상이라 테스트가 통과한다 —
  **면과 전경의 테마 축이 다르면 한 테마에서만 죽는다.** Badge의 죽은 축과 같은 종류다.

**절차는 앞선 여섯과 같다.** 매번 이 순서로 했고 매번 등록부의 수가 틀렸다.

1. 제품을 **전수로 실측한다.** 등록부의 확산도 수치를 믿지 않는다 — ProjectCard "3벌"은 4벌,
   EmptyState "7벌"은 9벌, TextField "16"은 약 40벌, Badge "톤 4 + 상태 5"는 **두 축 다 죽어
   있었고**, Spinner "5종 · Skeleton 0종"은 22벌·15벌, 앱 셸 "31곳"은 두 컴포넌트 합산이었다.
   **축이 코드에 있다고 해서 실제로 다른 결과를 내는지는 별개다** — 그것을 반드시 확인한다.
2. 정본을 판정한다. 제품에 공용 구현이 있으면 그 값을 옮기고, 없으면 DS가 정하되
   `migration/product.measured.json`에 `no-canon`으로 명시한다.
3. 옮기지 않을 것을 고른다 — 접근성 결함(포커스 표시 부재·색만으로 전달하는 상태·라벨 없는 입력)은
   제품에 있어도 옮기지 않고 `accepted-deviation`으로 사유를 적는다.
4. 토큰이 모자라면 **Decision을 먼저 쓴다.** 이름이 실제 뜻과 어긋나지 않는지 확인한다.
5. CSS recipe → React → `figma/components.measured.json` → 브라우저 테스트 → 규범 문서 →
   manifest 등록 → Figma component → parity 계약 + 되읽기 → 등록부·Updates·인계서.
6. `surface-states.browser.test.tsx`의 `covered` 목록에 새 id를 넣는다. 잊으면 가드가 잡는다.

**셸 composition 은 섰다** — `app-shell` 이 Web `partial` 이고 rail·drawer·scrim·scroll root·
`env(safe-area-inset-*)` 가 `.louis-app-shell*` 에 있으며 `AppShell` 이 public export 다. 상태의
정본은 [`manifest.json`](../manifest.json)이다.

남은 것은 Figma(`figma: not-ready`)와 **compact 드로어의 layer 자리**다 — 제품의 드로어(1400)는
popover(1100)보다 위인데 DS 사다리는 `sticky < popover` 라 그 조합이 없다.

**(2b) 컨트롤 테두리의 정본이 정해지지 않았다.** Button secondary는 `color-stroke-control`(반투명),
IconButton secondary는 `color-stroke-default`(불투명)를 쓴다. TextField는 Button을 따랐다. 셋 중
하나가 틀렸거나 셋 다 맞고 이름이 부족한 것이며, 어느 쪽인지는 owner가 정해야 한다.

**(2c) Textarea가 없다.** 제품에 여러 줄 입력이 최소 5벌 있다(캔버스 프롬프트 계열). TextField와
같은 박스 구조로 확장할 수 있다.

**`DS-F-007-home`의 gap 72건은 다시 재야 한다.** 그 실측은 Figma에 Button 하나만 있을 때 한 것이고
지금은 여덟이다. 재측정 전까지 72라는 숫자를 현재 상태로 인용하지 않는다.

**gap registry의 ProjectCard 항목은 "정의 3벌"로 적혀 있으나 실제로는 4벌이다** — 앱 홈,
캔버스 홈, 하이라이트 허브, 비디오 에디터 허브. 등록부가 NodeCanvasHome을 빠뜨렸다.

**`DS-P3-008`(Core local RC)의 소비자 검증이 섰다(2026-08-18).** `verify-consumer`가 `pnpm verify`에
들어 있고, 루트를 실제 소비자로 두어 서브패스 16개 resolve · 타입 선언 · **Node SSR 렌더** ·
**production 번들 tree-shaking**(canary 포함)을 매 실행 확인한다. **그 전까지 테스트는 package
self-reference로 해석돼 바깥 소비를 증명하지 못했고, 워크스페이스 패키지는 루트에 링크조차 돼
있지 않았다.** **release dry-run과 공개 API 표면도 붙었다** — `npm pack --dry-run`으로 세 패키지의 배포 목록을
계약과 대조하고(담길 것·금지 경로 양방향), `packages/react/api-surface.json`이 공개 심볼과 타입을
고정해 사라짐은 breaking, 새로 생김은 additive로 각각 잡는다. **수는 그 파일이 소유한다** —
컴포넌트가 늘 때마다 바뀌므로 문서에 적지 않는다. 검출력은 실측으로 증명했다.

**남은 것은 changesets 도입 · `private: true` 해제 · 버전 정책 셋이고, 지금 하지 않는다.**
`DS-D-0006`이 `proposed`인 동안 의존성을 넣는 것은 플레이북의 spike 규칙("의존성 도입은 Decision
승인 뒤")에 어긋나고, `private`를 푸는 것은 릴리스 흐름이 서기 전에 **실수로 publish될 수 있는
문을 여는 일**이다. owner가 DS-D-0006을 `accepted`로 옮기면 셋을 한 변경 단위로 한다. `DS-P3-009`
카탈로그도 열려 있고, 남은 것은 Input·Empty State와 gap registry 6순위 이하다. **`select` 는 빠진다** —
`not-planned` 판정이 끝났다.

**큐 순서를 바꾼 사실을 명시한다.** `DS-P3-009`는 문서상 `DS-P3-008` 의존이지만, Icon Button·Tooltip·
Toast는 DS-P3-008보다 먼저 구현했다. 이유는 DS-P3-009a 인벤토리와 Home 재조립이 만든 gap registry가
"무엇을 먼저 만들어야 하는가"의 근거를 실측으로 제공했고, RC 패키징이 그 판단의 입력이 아니기
때문이다. 완료 조건은 약화하지 않았다 — 세 component 모두 규범·구현·실브라우저 acceptance test·
Storybook·Updates·manifest를 같은 변경 단위에서 갖췄다.

**Icon Button은 원래 큐에 없던 항목이다.** DS-P3-009의 목록(Input, Select, Tooltip, Toast, Empty
State)에 없었고, 제품 실측에서 raw `<button>` 108개의 다수가 아이콘 전용이라는 사실이 나온 뒤
gap registry 1순위로 추가됐다.

**컴포넌트 워크샵이 섰다** — `pnpm --filter @klipse-design/storybook dev`.
[DS-D-0012](decisions/DS-D-0012-component-workshop.md)가 경계를 소유하고, 게이트 수 변화는 0이다.
도입 직후 실측에서 헤드리스 테스트가 못 보던 결함 셋이 나왔고 그 기록은 그 Decision에 있다.
남은 component와 pattern은 **눈으로 확인하며** 만든다.

`DS-P3-014`(token coverage 확장)는 `in-progress`이며 병렬로 진행할 수 있다. 다만 계획된 10개 단위
바깥에서 component가 요구한 토큰이 이미 여럿 들어왔다 — `icon-size-*`, `layout-control-height-*`,
`radius-control-sm`, `color-bg-inverse`/`color-fg-on-inverse`. 각각은 해당 component의
변경 단위 안에서 규범·Figma 변수·snapshot까지 함께 반영했으므로 누락은 없으나, 단위 6·7의 잔여
범위는 다시 세어야 한다.

그 외 항목은 `pending`이며, 예외는 DS-GOV-000(`blocked`)과 DS-P3-011(해체됨)이다.

**순서 주의:** `DS-P3-014`가 token source를 확장하면 proposal이 바뀌므로 Figma 변수·style을 다시
적용하고 snapshot을 재덤프해야 한다. 적용 스크립트는 idempotent하며 parity 게이트가 stale snapshot을
경고한다.

환경 blocker는 해소됐다 — Node 22 LTS와 pnpm 10.30.2가 설치돼 표준 명령이 실행된다. 세션 종료
검증에 `pnpm verify`가 Figma parity 게이트를 포함한다.

#### DS-GOV-000 — 외부 운영 gate

**상태:** `partial` (2026-08-18). **넷 중 둘이 done**이고 둘이 남았다. 로컬 P3 작업과 병렬이며 이를
막지 않는다.

- ~~원격 Git 저장소 연결~~ — **done.** `git@github.com:KlipseAI/louis.git` (private, 기본 브랜치
  `main`). 로컬 `main`이 `origin/main`보다 앞서 있을 수 있으므로 세션 시작 때 `git fetch`로 확인한다
- ~~clean-checkout hosted CI~~ — **선다는 것은 증명됐다(2026-08-18).** clean checkout에서
  install → 브라우저 설치 → build → check → verify → `--require-tracked` → 실브라우저 회귀가
  전부 통과한 초록 실행이 있다. 초록에 이르기까지 네 번 실패했고 그 넷이 전부 로컬에서
  보이지 않던 것이었다.
  **다만 「hosted CI done」은 두 가지를 오해하게 한다.** ① 러너가 도는 것은 `verify:ci` 갈래이지
  전량이 아니다(`verify:product` 갈래는 제품 저장소가 필요하다). 두 갈래의 단계 수를 여기 적지
  않는다 — `package.json`의 그 두 스크립트가 정본이고, 손으로 적은 수는 게이트가 늘 때마다
  낡는다. ② **2026-08-22 기준 러너는 GitHub 결제 문제로 멈춰 있다** — 판별법은
  [계정 이전 인계서 3절](handoff-2026-08-22-account-transfer.md)
- repository owner 승인 — 미해소
- registry, docs hosting과 Figma publish 권한 — 미해소

**첫 hosted CI 실행이 잡은 것(2026-08-18).** `bf62eba` push에서 `pnpm verify`가 실패했다 —
`browserType.launch: Executable doesn't exist at .../chrome-headless-shell`. 워크플로에
**브라우저 바이너리 설치 단계가 없었다.** 브라우저는 lockfile에 없는데 DS-D-0005가 실브라우저
러너를 1단계에 뒀으므로 `verify`가 실제로 Chromium을 띄운다. 로컬에는 2026-08-14에 승인받아 받아
둔 캐시가 있어 **로컬에서만 통과하고 clean checkout에서만 실패하는** 상태였다.

`pnpm exec playwright install --with-deps chromium` 단계를 넣었고, 같은 김에 **실브라우저 회귀
전량(`pnpm test`)을 CI에 붙였다** — 그때는 「`verify`의 test-harness가 suite 를 돌리지 않는다」로
판단했으나 **그 판단은 틀렸다**(2026-08-23 코드 확인: `scripts/verify-test-harness.mjs` 가 canary
제거 후 node·browser suite 를 실제로 돌린다). CI 단계를 따로 둔 것은 여전히 유용하다 — 실패
지점이 게이트가 아니라 회귀 자체임이 로그에서 바로 보인다.
로컬에서 두 번 관측된 간헐 실패도 이 단계가 반복 실행으로 드러낼 자리다.

**이것이 hosted CI의 값이다.** 로컬 게이트는 스무 번 초록이었고 clean checkout이 한 번에 잡았다.

**완료 근거:** 실제 remote/hosted run/owner evidence. 사용자가 연결을 요청하기 전에는 임의로 생성하거나
가짜 URL·승인 기록을 만들지 않는다.

#### DS-GOV-001 — Baseline 갱신 규범

**상태:** `done` (2026-08-14). [Releases](releases.md)의 "의도적 breaking과 baseline 갱신" 절이
절차를 소유하며, DS-F-002의 `figmaCollection` breaking에 최초 적용됐다.

- 의도적 breaking token 변경 시 baseline 재고정 절차(선언 → diff 확인 → baseline 갱신 → 재검증)를
  [Releases](releases.md)에 규범으로 기록한다.
- published 소비자가 없는 동안의 Figma 전용 metadata 변경 분류를 함께 명시한다.

**완료 근거:** releases.md 개정과 Updates 항목. baseline을 조용히 덮어쓰는 경로가 규범상 존재하지
않게 된다. 상세 절차는 [플레이북](execution-playbook.md)을 따른다.

### P3 — CSS, React와 Figma

#### DS-P3-001 — Web architecture Decision과 status model

**상태:** `in-progress` (2026-08-14). Decision 6종을 `proposed`로 작성했다. manifest schema 확장은
DS-P3-002a가 소유하고, spike 3건은 아래 조건이다.

| Decision | 결정 요약 |
| --- | --- |
| [DS-D-0002](decisions/DS-D-0002-web-support-scope.md) | React 19 단일 major · ESM 전용 · leaf `"use client"` · `baseline widely available` · `tsc` + `isolatedDeclarations` |
| [DS-D-0003](decisions/DS-D-0003-behavior-dependency.md) | 하부 유틸(dismissable layer·focus scope·positioning·portal)만 채택, **순서와 정책은 Klipse 소유**. 완제품 Menu·Dialog 미채택 |
| [DS-D-0004](decisions/DS-D-0004-css-authoring.md) | authored plain CSS + cascade layer 두 벌 배포 · 상태는 `data-*` · 런타임 스타일 라이브러리 0 · reset은 opt-in |
| [DS-D-0005](decisions/DS-D-0005-test-stack.md) | 실브라우저 러너를 1단계에 둔다. **jsdom·happy-dom 배제** — Dialog 규범을 거짓 통과시킨다 |
| [DS-D-0006](decisions/DS-D-0006-versioning-peer-contract.md) | changesets `fixed`로 css·react 동반 버저닝 · css를 required peer로 강제 · `sideEffects` 즉시 명시 |
| [DS-D-0009](decisions/DS-D-0009-font-distribution.md) | 폰트 바이너리 미동봉 · `--louis-font-family-sans` 방출로 교체 지점 단일화 · 폴백 스택 교정 |

**남은 선행 조건 (spike, 저장소 밖에서 수행):**

- **S1** 하부 유틸 조합이 activation exactly-once와 nested Escape 순서를 실제로 만족하는지 실측.
  실패 시 fallback 경로로 내려가되 public API는 바꾸지 않는다.
- **S2** fallback 후보의 저수준 훅이 Server Component 경계를 넘는지 확인.
- **S3** `baseline widely available`의 실제 브라우저 집합과 `inert` 포함 여부, `tsc` declaration emit
  실측.

S1이 통과한 뒤에만 DS-D-0003의 `accepted` 전환을 요청한다. Decision 6종의 `accepted` 전환은
repository owner의 확인 사항이다.

**목표:** 구현 전에 public 경계와 상태 증거를 고정한다.

- React/TypeScript 지원 범위, ESM와 type export, SSR/hydration/RSC/client boundary를 결정한다.
- authored CSS와 recipe generation 중 현 규모에 맞는 방식을 선택한다.
- CSS layer/import order, reset opt-in, theme scope와 font asset 책임을 확정한다.
- custom implementation과 검증된 accessibility primitive dependency의 선택 기준을 기록한다.
- CSS/React package release 상태와 evidence를 manifest가 표현하도록 schema/gate 확장안을 정한다.
- versioning/Changesets 도입 시점, bundle target와 browser support를 정한다.

**완료 근거:** accepted Decision, package dependency graph, public export 초안, test matrix, migration/rollback,
manifest/status가 서로 모순되지 않는다.

#### DS-P3-002a — 게이트 전환

**상태:** `done` (2026-08-14).

- scaffold 계약을 "선언된 서브패스만 허용"으로 바꾸고, 선언 밖 exports와 CSS 노출 패키지의
  `sideEffects` 누락을 각각 잡는 canary 2종을 신설했다(canary 17 → 19).
- manifest schema에 `webPackages`를 추가해 CSS/React 패키지의 상태와 evidence를 표현하게 했다.
  `tokenPackage.figmaLibrary`·`packageRelease`의 고정값도 status enum + evidence 요구로 완화했다.
- `packages/tokens`에 `sideEffects: ["*.css"]`와 `./package.json` export를 명시했다. 이 값이 없으면
  나중에 `sideEffects: false`를 넣는 순간 토큰 CSS가 프로덕션 빌드에서만 조용히 사라진다.
- CI에 `pnpm install --frozen-lockfile`, `pnpm build`, tracked 검사를 추가했다.

**남은 항목:** 루트 `engines.node` 좁히기는 changesets를 실제로 도입하는 시점에 함께 한다.

**의존성:** DS-P3-001

`scripts/verify-gates.mjs`의 scaffold 계약은 현재 css/react/docs의 exports 추가를 의도적으로 차단한다.
구현 착수 전에 이 게이트 전환을 독립 변경으로 수행하며, 게이트가 실패한다는 이유로 게이트를 임의로
약화하지 않는다.

- scaffold 계약(canary 없는 positive check)을 "선언되지 않은 exports 금지" 형태로 대체하고 이를
  검증하는 canary를 신설한다.
- manifest/schema가 CSS/React package 상태와 evidence를 표현하게 확장하고,
  `tokenPackage.packageRelease`의 `const` 고정을 함께 완화한다.
- `.github/workflows/ci.yml`에 install/build 단계를 추가해 devDependencies 도입과 CI 계약을 함께
  갱신한다.

**완료 근거:** 갱신된 gate/schema/CI가 서로 모순되지 않고, 이후 package 구현 커밋이 `pnpm verify`를
깨뜨리지 않는 경로가 존재한다.

#### DS-P3-002 — Package build와 품질 harness

**상태:** 1단계 `done` (2026-08-14). 2단계(시각 회귀·다중 브라우저)는 hosted CI 확보 후다.

1단계에서 구축한 것:

- `tsconfig.base.json`(공통 strictness) / `tsconfig.build.json`(declaration + `isolatedDeclarations`) /
  `tsconfig.json`(typecheck). `pnpm typecheck`를 `pnpm check`에 연결했다.
- Vitest 실브라우저 harness. project 3개 — `node`, `browser`, `browser-reduced-motion`.
  reduced-motion은 provider 수준 옵션이라 instance가 아니라 project로 나눈다.
- `scripts/verify-test-harness.mjs` — 각 project에 의도적 실패 테스트를 심어 러너가 실패를
  전파하는지 증명하고, 제거 후 실제 suite가 통과하는지 확인한다. `pnpm verify`에 연결됐다.
- 첫 실테스트 20건. 토큰 CSS가 **브라우저에서** theme 계약대로 계산되는지(기존 게이트는 CSS 문자열만
  검사한다), 그리고 소비자 관점의 token 공개 계약을 검증한다.
- `packages/tokens/test/environment.browser.test.ts` — 레이아웃 계산, hit test,
  `HTMLDialogElement`의 modal/non-modal 구분, `inert` 구현을 확인한다. **jsdom·happy-dom으로 몰래
  후퇴하면 이 테스트가 실패**하므로 DS-D-0005의 rollback 규칙이 기계적으로 강제된다.

**의존성:** DS-P3-001, DS-P3-002a

unit/DOM 단계와 real browser/visual 단계를 분리해 2단계로 도입한다. 1단계는 이 작업, 2단계는
DS-P3-008 전까지의 후속 변경이다.

- TypeScript build, typecheck, lint/format과 package self-reference consumer fixture를 구성한다.
- DOM interaction, accessibility automation, real browser, visual regression과 bundle test의 역할을 나눈다.
- SSR render/hydration과 client-only API 경계를 검증한다.
- generated output boundary와 clean rebuild 검사를 유지한다.
- package-level command를 root `build`, `check`, `verify`에 연결한다.

**완료 근거:** 빈 scaffold 성공이 아니라 의도적 failure canary가 실제로 각 gate를 실패시키고, clean local
checkout에서 root 명령이 통과한다.

#### DS-P3-003 — CSS foundation package

**상태:** foundation `done` (2026-08-14). 컴포넌트 recipe는 DS-P3-004 이후 각 컴포넌트와 함께 붙는다.

- `packages/css/src`의 저작 원본에서 `scripts/build-css.mjs`가 배포 CSS 5종을 생성한다 —
  `layers.css`(layer 순서 선언), `tokens.css`(재export), `reset.css`(opt-in), `styles.css`(언레이어드),
  `styles.layer.css`(레이어드). 두 벌 배포는 Tailwind 소비자가 유틸리티로 라이브러리를 이길 수 있게
  한다.
- base 유틸리티: `louis-visually-hidden`, `louis-focus-ring`, `louis-hit-target`, `louis-layer-*`,
  그리고 `[data-louis-state]`의 closing/closed 계약.
- 저작 규칙 게이트 5종 + drift 1종을 `scripts/verify-css-gates.mjs`가 canary로 증명한다 —
  `!important`, 숫자 z-index, raw color, primitive 직접 소비, reset 밖 전역 선택자.
- 브라우저 테스트 6건이 계산값과 실제 상호작용을 검증한다. focus-visible이 **키보드에서만** 나타나고
  포인터 클릭에서는 나타나지 않는 것까지 확인한다.
- theme scope는 [Color & Theme](../foundations/color-theme.md)의 `[data-theme]` 계약을 그대로
  소비하며 CSS package가 별도 selector 정책을 만들지 않는다.

**의존성:** DS-P3-001, DS-P3-002a, DS-P3-002

- `@klipse-design/tokens/css`를 유일한 token CSS 입력으로 소비·재export한다.
- opt-in reset/base, focus-visible, visually-hidden, theme scope와 recipe layer를 구현한다.
- Tailwind 사용 여부와 무관한 CSS API를 제공하고 preflight/cascade 계약을 문서화한다.
- raw palette 직접 사용, primitive scope override와 임의 z-index를 검사한다.
- light/dark, forced-colors, reduced-motion과 200% zoom fixture를 추가한다.

**완료 근거:** documented export map, cascade test, theme fixture, consumer import test, CSS package가 별도 token
값이나 generator를 소유하지 않음.

#### DS-P3-004 — Button

**상태:** Web `partial` (2026-08-14). `import { Button } from "@klipse-design/react"`가 동작한다.

- `packages/react/src/button/button.tsx` + `packages/css/src/component/button.css`
- 실브라우저 acceptance test 11건이 규범의 Acceptance tests를 그대로 검증한다 — activation
  exactly-once(click/Enter/Space), disabled·loading 차단, loading 중 focus 유지, accessible name 안정성,
  focus-visible이 키보드에서만, 44px 타깃, 320px에서 KO/EN/JA 긴 라벨, variant 4종 axe 검사.
- 활성화는 네이티브 `<button>`에 맡긴다. keydown으로 클릭을 흉내 내면 중복 실행이 되기 때문이다.
- `loading`은 네이티브 `disabled`를 쓰지 않는다(focus가 제거된다). `aria-disabled` + 명시적 차단으로
  하고, actionability와 컴포넌트 두 층에서 검증한다.

**Known deviations:** `danger`가 tonal이고(solid를 표현할 action 토큰 부재) 고정 높이 토큰이 없다.
둘 다 DS-P3-014가 해소한다.

**`done` 승격에 남은 것:** visual regression(hosted CI 후), 수동 screen-reader review, SSR/hydration,
제품 사용처 2곳. ~~published Figma component(DS-F-006)~~ **해소** — Button 은 Figma `done` 이다
([DS-D-0035](decisions/DS-D-0035-figma-done-without-publish.md)).

**의존성:** DS-P3-003

- [Button 규범](../components/button.md)의 anatomy, variant, size, loading/disabled와 content contract를
  구현한다.
- native semantics, accessible name, focus-visible, keyboard activation과 double activation 방지를 검증한다.
- KO/EN/JA 긴 label, icon-only, 200% zoom, high contrast와 touch target을 검증한다.
- public import, types, isolated example와 Figma proposal을 연결한다.

**완료 근거:** [컴포넌트 완료 정의](#9-component-완료-정의) 전 항목과 manifest Availability가 실제 artifact와
일치.

#### DS-P3-005 — 공용 overlay behavior layer — `done`

**의존성:** DS-P3-002, DS-P3-003

- Portal/host ownership, Presence, dismissible layer, focus scope/return, scroll lock/inert와 position anchor의
  책임을 분리한다.
- App Shell과 overlay layer token의 단일 ownership을 유지한다.
- nested portal, `composedPath`, outside interaction, Escape order와 activation exactly-once를 검증한다.
- 내부 primitive를 우선하고 독립 consumer가 검증되기 전 public package로 분리하지 않는다.

**완료 근거:** 두 개 이상 overlay fixture에서 pointer/keyboard/focus/stacking 회귀가 재현·차단됨.

**산출물과 증거 (2026-08-14):**

- 경계 Decision [DS-D-0011](decisions/DS-D-0011-overlay-primitive-boundary.md) — public export 금지,
  테스트의 dist 상대 import 예외, reduced-motion duration, Tab 이탈 reason.
- `packages/react/src/overlay/` 13개 모듈. `packages/react`의 **public 표면과 게이트는 변하지 않았다**
  (`declaredPackageSurfaces` diff 0, `exports` diff 0).
- fixture 2종 — `packages/react/test/fixtures/anchored-overlay.tsx`(non-modal, portal된 submenu·React
  트리 밖 Listbox·내부 스크롤·pointer capture), `packages/react/test/fixtures/modal-overlay.tsx`(modal, backdrop, 중첩 modal,
  modal 안 popover, 긴 배경 문서).
- 실브라우저 회귀 45건이 `browser`와 `browser-reduced-motion` 두 컨텍스트에서 각각 돈다. node 단위
  14건이 비교자와 registry를 DOM 없이 검증한다.
- 변조 canary 5종을 실행해 실패를 확인하고 byte 단위로 복원했다 — lineage 규칙 제거, "마지막 등록이
  topmost"로 교체, 보류 member 미등록, modal host 내부 형제 격리 제거, 자손 layer 승계 제거.

**구현 중 실측으로 드러난 것:**

- React는 언마운트 시 effect cleanup을 **부모 → 자식** 순으로 돌린다. branch를 즉시 제거하면 그
  구간에 자식의 lineage가 끊기므로, 마지막 자식이 닫힐 때까지 제거를 미루고 연쇄로 정리한다.
- `composedPath()`에는 `document`와 `window`가 들어 있어 `contains()`가 던진다. 그 예외는 하부 유틸의
  이벤트 dispatch 안에서 삼켜져 **판정이 조용히 실패**한다.
- reduced-motion 대입은 media query가 specificity를 더하지 않으므로 state 규칙과 같은 형태로 적어야
  이긴다. 클래스 하나로 적으면 exit가 그대로 남는다.
- Dialog 안에서 연 Popover는 layer 값을 그대로 두면 Dialog 뒤에 깔린다. 자손 branch가 부모 layer를
  물려받아야 "보이지만 누를 수 없는" 상태를 피한다.
- modal 격리는 host 단위만으로 부족하다. 중첩 Dialog는 같은 host에 나란히 들어가므로 host **안**의
  형제도 격리해야 한다.

**남긴 것:** iOS Safari의 `overflow: hidden` scroll lock은 headless Chromium으로 검증할 수 없어
미확인이다. `deferPointerDownOutside`와 `useDismissableLayerSurface()`는 우리 정책이 이미 지연을
소유하므로 **쓰지 않았다.**

#### DS-P3-006 — Menu / Popover — `done`

**의존성:** DS-P3-005

- [Menu / Popover 규범](../components/menu-popover.md)을 구현한다.
- trigger/anchor/content/item/group/separator 구조와 controlled/uncontrolled API를 정의한다.
- roving focus 또는 적합한 focus model, 방향키, Home/End, typeahead, Escape와 focus return을 검증한다.
- item click이 outside-dismiss보다 먼저 정확히 한 번 실행되고 nested portal에서도 선택 가능해야 한다.
- viewport collision, compact layout, long localized content와 zoom을 검증한다.

**산출물과 증거 (2026-08-14):**

- 규범 개정 — Properties 표 교체(`kind`가 prop이 아님, `programmatic` reason 추가, `disabledItems`
  신설, `offset`·`collisionPadding`·`branchId`를 prop에서 제외), 새 `## Focus` 절, States Closing 행,
  외부 이벤트 정책 5번, Accessibility 2줄, acceptance test 14항목 추가.
- [DS-D-0011](decisions/DS-D-0011-overlay-primitive-boundary.md) 결정 5 — 공개 진입점은 recipe
  계층이 소유한다. `declaredPackageSurfaces`와 `exports`는 변하지 않는다.
- `packages/react/src/{internal,anchored,menu,popover}/**` 16개 모듈, 공개 심볼 16개.
- `packages/css/src/component/menu-popover.css`와 `overlay.css` 보정(enter motion 값, seam fallback).
- 실브라우저 회귀 35건이 두 motion context에서 각각 돈다.

**구현 중 실측으로 드러난 것:**

- overlay `Surface`가 소비자 `ref`를 덮어써 recipe가 패널 노드를 잡을 수 없었다. primitive에서 ref를
  합성하도록 고쳤다 — id로 다시 질의하는 우회는 상태 전이마다 반복해야 하고 실패해도 조용하다.
- `Enter`/`Space`에 keydown을 더하면 브라우저 합성 click과 겹쳐 두 번 실행된다. `<a>`는 반대로
  Space가 click을 합성하지 않아 **링크 item만** keydown이 필요하다.
- React 이벤트는 React 트리로 전파되므로 submenu의 방향키가 부모 핸들러까지 실행한다. panel들이
  DOM에서 형제라는 사실이 native 리스너를 정답으로 만든다.
- `.louis-hit-target`의 44px `::after`는 간격 없이 쌓이는 메뉴 행에서 인접 항목의 hit 영역을 침범한다.
- Playwright는 IME 없이 한글 keydown을 만들지 못한다. 한국어 typeahead는 실기 측정 전까지 미검증이다.

**남긴 것:** `Shift+Tab` 역방향 이탈과 scroll·resize·zoom anchor 추종에 아직 테스트가 없다. 규범
acceptance에 명시해 두었고 `done` 승격 조건에 포함했다.

**완료 근거:** profile menu와 nested overlay에 해당하는 generic fixture, screen-reader semantics, browser
hit-test와 public consumer example 통과.

#### DS-P3-007 — Dialog — `done`

**의존성:** DS-P3-005

- [Dialog 규범](../components/dialog.md)의 modal과 non-modal/docked workspace 경계를 유지한다.
- accessible title/description, initial focus, trap, Escape, close button, focus return과 nested dialog order를
  검증한다.
- scroll lock, inert/scrim, danger action의 Enter 정책과 reduced-motion unmount를 검증한다.
- App Shell sidebar와 route workspace는 겹치지 않는 별도 composition으로 남긴다.

**완료 근거:** modal browser fixture, keyboard-only flow, screen-reader contract, layer/scroll/reduced-motion test와
public consumer example 통과.

**산출물과 증거 (2026-08-14):**

- 규범 개정 — Variants(자동 전환 금지, media-workbench 초기 포커스), Properties(제목·설명을 하위
  컴포넌트로, `onDismissBlocked` 추가, `closeOnBackdrop` 종속), States(busy의 aria와 취소 활성),
  Pointer(backdrop을 형제로, mousedown 취소), Accessibility(alertdialog 미지원 확정), Migration 2번.
- `packages/react/src/dialog/**` 8개 모듈과 `packages/css/src/component/dialog.css`.
- 실브라우저 회귀 15건이 두 motion context에서 각각 돈다. Storybook 스토리 5종이 public consumer
  example을 겸한다.
- 변조 canary 2종 — 격리 해제를 복원 뒤로 미루기, inert를 복원 뒤로 미루기.

**구현이 드러낸 primitive 결함 셋 (전부 수정):**

- modal의 focus 복원이 배경이 inert인 상태에서 일어나 body로 떨어졌다. non-modal에는 격리가 없어
  Menu에서는 보이지 않던 경로다.
- focus trap의 해제가 하부 유틸의 **passive effect**인데 복원은 layout effect라, 복원한 포커스를 trap이
  즉시 되끌어왔다. 닫히는 subtree를 복원 **전에** inert로 만들어 되끌기 대상을 없앴다.
- scroll lock의 위치 저장·복원이 기본 경로에서 no-op이었다(`body.scrollTop`은 항상 0).

**남긴 것:** `env(safe-area-inset-*)`와 `100dvh`는 harness iframe에서 측정되지 않아 선언 존재만
고정했다. virtual keyboard 추종은 CSS만으로 불가능해 별도 결정이 필요하다. Workspace 쪽 acceptance
8항목은 DS-P3-010(pattern) 범위로 남는다.

#### DS-P3-008 — Core local RC

**의존성:** DS-P3-004, DS-P3-006, DS-P3-007

- CSS/React export, peer dependency, type declaration, tree-shaking과 production build를 검증한다.
- Button/Menu/Dialog를 실제 public import name으로 쓰는 최소 consumer app을 빌드한다.
- core component API diff와 migration note를 생성한다.
- local package RC와 public release 상태를 분리한다.

**완료 근거:** clean local consumer build와 browser suite, release dry-run, Updates. 이 단계만으로 P3
`complete`나 component `stable`을 선언하지 않는다.

#### DS-P3-009a — 배포 화면 인벤토리

**상태:** `done` (2026-08-14). 산출물은 [`migration/screen-inventory.md`](../../migration/screen-inventory.md)다.
Home/Highlight/Editor가 각각 단일 route가 아니라는 사실과 카탈로그 gap이 기록됐다.

**의존성:** 없음. 시작 전에 제품 저장소 절대 경로/기준 commit의 사용자 확인이 필요하다.

- 제품 저장소 위치와 기준 commit을 사용자에게 확인받아 `migration/product-baseline.md`에 먼저
  기록한다. 비슷한 이름의 디렉터리를 추측으로 고르지 않는다.
- Klipse 배포 화면(최소 Home, Highlight, Editor)을 component/pattern/icon/token으로 분해한 표를
  만든다. 제품 코드는 읽기만 하고 이 저장소로 복사하지 않는다.
- 결과를 `migration/screen-inventory.md` 비규범 reference로 저장하고 manifest에 등록한다.
- "카탈로그에 없음" 목록이 DS-P3-009 순서, DS-P3-013 아이콘 범위와 DS-F-007 gap 예측의 입력이 된다.

**완료 근거:** 화면별 구성 요소 표와 카탈로그 gap 목록이 실제 배포 화면 근거와 연결된다.

#### DS-P3-009 — Catalog coverage

**상태:** `in-progress` (2026-08-15). 순서를 문서상 목록이 아니라
[gap registry](../../migration/figma-gap-registry.md)의 실측 우선순위로 바꿨다.

| 순위 | 항목 | 상태 |
| --- | --- | --- |
| 1 | Icon Button | `done` — Web `partial`. 원래 목록에 없던 항목이다 |
| 2 | Tooltip | `done` — Web `partial` |
| 3 | Toast | `done` — Web `partial` |
| 6~11 | ProjectCard, TextField/Input, EmptyState, Badge, Spinner, 셸 부품 | `done` — 전부 Web·Figma `partial` |
| 12 | Slider | `done` — Web `partial`. Figma는 `DS-F-006-slider`가 소유한다 |
| 13 | SegmentedControl | `done` — Web `partial`. Figma는 `DS-F-006-segmented-control`이 소유한다 |
| 14 | Checkbox | `done` — Web `partial`. Figma는 `DS-F-006-checkbox`가 소유한다 |
| 15 | SelectableListRow | `done` — Web `partial`. Figma는 `DS-F-006-selectable-list-row`가 소유한다 |
| — | Select | **`not-planned`** — 「고르기는 Menu 가 소유한다」로 판정이 끝났다(아래 (1d)). manifest 가 정본이다 |

4·5순위(Menu/Popover, Dialog)는 코드가 이미 서 있어 이 항목이 아니라 DS-F-006이 남은 몫이다.

**의존성:** DS-P3-008. 우선순위 근거는 DS-P3-009a.

**의존성을 앞질렀다는 사실을 기록한다.** 1·2·3순위는 DS-P3-008(RC 패키징) 전에 구현했다. RC는 무엇을
먼저 만들지의 입력이 아니고, gap registry가 그 근거를 실측으로 제공했기 때문이다. 완료 조건은
약화하지 않았다.

- product adoption 우선순위와 접근성 위험을 기준으로 Input, Select, Tooltip, Toast, Empty State를 순서화한다.
- docs가 `not-ready`인 항목은 component template에 맞는 규범부터 작성한다.
- 각 항목을 독립 변경으로 구현하고 동일 완료 정의를 적용한다.

**완료 근거:** manifest의 여덟 component가 실제 surface별 근거를 가지며 빈 `done`이 없음.

#### DS-P3-010 — 공용 Pattern fixture

**의존성:** DS-P3-003, DS-P3-005

- Loading은 Skeleton/Spinner/Progress의 선택, content와 reduced-motion contract를 구현한다.
- App Shell은 sidebar/main/overlay ownership과 responsive state를 generic layout fixture로 검증한다.
- Project Grid는 content box 측정, minimum card/gap, capacity 계산과 1열 fallback resolver를 검증한다.
- Editor Workspace fixture는 제품 재구현 위험이 커서 이 작업에서 제외하고 DS-P5-005의 실제 adoption
  검증으로 이동한다. 그때까지 editor-workspace pattern의 Web 상태는 `not-ready`를 유지한다.
- 제품 route, 제품 데이터와 제품 전용 visual theme는 P5 integration에 남긴다.

**완료 근거:** Loading, App Shell, Project Grid 세 pattern의 public recipe/utility 여부와 Web 상태가 실제
generic fixture·test에 맞고, 제품 화면 screenshot을 공용 구현 근거로 대신하지 않음.

#### DS-P3-011 — Published Figma library와 parity (해체됨)

이 작업은 성질이 다른 다섯 가지 이상을 포함해 [Figma 트랙](#figma-트랙--ds-f-000--ds-f-008)의
DS-F-000~008로 해체됐다. 기존 완료 근거는 DS-F-004(parity), DS-F-008(published library)이 나눠
소유한다. 이 ID는 재사용하지 않는다.

#### DS-P3-012 — P3 public release

**의존성:** DS-P3-008, DS-F-004의 parity report 존재, hosted CI와 owner approval. published Figma
library(DS-F-008)는 선행 조건이 아니며, npm 공개와 Figma publish는 같은 release note에서 서로를
참조하는 별도 트랙이다.

- approved version policy로 package를 publish하고 immutable release를 기록한다.
- changelog, migration, deprecation, browser support와 compatibility matrix를 공개한다.
- public registry에서 새 consumer가 source/deep import 없이 설치되는지 검증한다.

**완료 근거:** registry artifact, hosted CI, parity report, release note, owner approval. Catalog
coverage가 끝나지 않았다면 P3 core release라고 명시한다. published Figma library는 DS-F-008의 완료
근거다.

#### DS-P3-013 — 아이콘 트랙 — `done`

**상태:** `done` (2026-08-15). 정본은 저장소 SVG이고
[DS-D-0008](decisions/DS-D-0008-icon-source.md)이 그 경계를 소유한다. 글리프가 React·Figma
양쪽에 서 있으며 provenance와 라이선스 원문이 글리프마다 붙는다.

- 정본은 `packages/react/src/icons/svg/*.svg` 이고 generated React component·manifest·Figma
  component 가 그 투영이다. **수는 `pnpm verify-icon-gates` 출력과 `figma/snapshot.json` 의
  `icons` 가 낸다** — 한때 세 자리에 26 이 박혀 있었고 셋 다 낡았다.
- 게이트는 positive 검사와 변조 canary 다. 수는 같은 출력이 낸다. 그중 셋은 여기서 실제로 잡은 결함이다 —
  작은따옴표 속성을 파서가 조용히 흘려 **게이트를 통과하면서 출력에서 사라지던** 버그, 혼합
  라이선스를 하나로 뭉개 `ISC AND MIT`를 감추던 고지문, 최상위 부수효과.
- 남은 owner 판정: `eye-slash` 은유 변경(제품 **12곳**, 2026-08-21 재실측 — 원래 17곳이라 적었다.
  비밀번호 입력 필드 12개와 토글 12개가 1:1로 대응한다), `x-circle` Fill→regular, `magic-wand` 처리,
  Wave B 4개.

**의존성:** DS-P3-009a

현재 시스템에는 아이콘 자산, 파이프라인, 규범이 없다. 배포 화면 재조립(목표 B)은 아이콘 없이
달성될 수 없다.

- DS-P3-009a 인벤토리에서 실사용 아이콘 목록을 추출한다.
- 아이콘 정본 위치(저장소 SVG 정본 vs Figma 정본)를 Decision으로 확정한다.
- 결정에 따라 최소 파이프라인(SVG → React/Figma component)과 아이콘 manifest를 구축한다.

**완료 근거:** 아이콘 인벤토리, accepted Decision, 실사용 아이콘의 React·Figma 산출물과 manifest
등록.

#### DS-P3-014 — Token coverage 확장

**상태:** `in-progress` (2026-08-14). 판정 원칙은
[DS-D-0010](decisions/DS-D-0010-token-coverage.md)이 소유한다. 실측 결과 확장 규모는 약 169개이며 10개
변경 단위로 나눈다.

| 단위 | 내용 | 상태 |
| --- | --- | --- |
| 1 | 판정 원칙 Decision | `done` |
| 2 | 알파 축 26개 (색 사용의 70%) | `done` (2026-08-21) |
| 3 | 채널 팔레트 primitive 40개 (mint/yellow/pink/violet/red 보강) | `done` — 실측 39개 (2026-08-21) |
| 4 | 채널 semantic 24개 (노드 타입 식별자) | `partial` — 19종 `done`, disabled 12종은 Open question 3 대기 |
| 5 | 타이포 15종 재편 — **breaking** | `done` |
| 6 | contrastPairs 7 → 19 | `partial` — 12 → 14쌍 (2026-08-21) |
| 7 | elevation / border-width / radius 16개 | `partial` — 실측 결과 아래 |
| 8 | layer / motion 10개 — layerOrder 배열 변경 | `partial` — 실측 결과 아래 |
| 9 | sky / editor / danger action 14개 | `partial` — danger foreground 해소 (2026-08-21) |
| 10 | space / surface 보강 13개 | `partial` — blocked 해제, 실측 결과 아래 |

**단위 9 — danger foreground 공백은 해소됐다 (2026-08-21).**

`color-fg-danger-on-surface`를 세웠다. light `red.700`(표면 6.08 · 메뉴 5.62 · 본문색과
2.72) · dark `red.400`(4.51 · 4.51 · 2.57)이며 **두 표면 모두 4.5를 넘으면서 본문색과도 구분되는
유일한 조합**이다. `red-600`(light 4.15)·`red-500`(dark 3.70)은 미달이고, `red-800`은 대비는
높지만 본문색과 1.77이라 「빨강」으로 읽히지 않는다. contrastPairs 두 쌍(`background-surface` ·
`background-menu`)을 함께 올려 게이트가 매번 실제 WCAG 계산으로 확인한다.

**남은 sky/editor 계열은 아직이다.** 아래 원래 기록을 남긴다.

**단위 9가 반드시 포함해야 하는 것 (2026-08-14 워크샵 실측):**

중립 표면 위에서 성립하는 **danger foreground**가 없다. 현재 `color-fg-danger`는
`color-bg-danger`와 **쌍으로** 쓰도록 만들어졌고 두 테마에서 값이 서로 뒤바뀐다. 그래서
텍스트 색으로만 쓰면 일반 텍스트와의 대비가 light 1.21, dark 1.14로 사실상 구분되지 않는다.
Button은 쌍으로 써서 성립하지만 Menu의 danger item은 이 공백을 그대로 밟는다 —
[Menu / Popover](../components/menu-popover.md)의 Known deviations에 실측이 있다.

**토큰을 더하는 단위의 선행 조건은 「parity 원천에 새 토큰이 있는 것」이다.**

한때 이 자리에 「모든 토큰 확장 단위가 `verify-figma-parity`에서 막힌다」가 적혀 있었으나
그것은 **해소됐다** — 단위 2·3의 토큰은 이미 들어가 있고 `verify-figma-parity`는 통과한다.
현재 수는 `pnpm verify-figma-parity` 출력이 낸다. 막힘을 전제로 다시 조사하지 마라.

처음에는 Figma 이전을 끝내야 열린다고 적었으나 그것은 틀렸다. `verify-figma-parity`가 보는 것은
`figma/snapshot.json`이고, 그것은 `figma/readback.json`의 투영이다. 따라서 필요한 것은 다음 둘뿐이다.

1. **LOUIS 파일**에 새 토큰을 적용한다 — `figma/apply-variables.*.js`가 그 경로다.
2. readback의 **변수 구간만** 다시 뜬다. style·component·icon은 그 작업으로 바뀌지 않으므로
   전면 재덤프가 필요 없다. 절차는 `build-figma-snapshot.mjs` 헤더 (1)에 코드까지 있다.

> **정정 (2026-09-01).** 이 문단은 「readback 은 **이전 라이브러리**
> (`bxGEp0km5zluMJGulaTvFW`)를 가리킨다 → 이전 라이브러리에 새 토큰을 적용한다」고 적고 있었다.
> 2026-08-26 에 대상이 LOUIS 로 옮겨졌으므로 둘 다 거짓이고, **그대로 따르면 은퇴 파일에 토큰을
> 써 넣고 게이트는 꿈쩍도 하지 않는다** — 이 목록에서 가장 위험한 종류의 낡음이라 문장을 고쳤다.
> 확인: `node -e 'console.log(require("./figma/readback.json").figmaFileKey)'` →
> `OlYKERKOkgbxBEEoXGZW2c`. 이력은 `figma-sync.md` 「게이트가 은퇴 파일을 가리켰다 (해소됨)」.

**component·icon 이전은 별개 트랙이다.** 그것을 기다릴 이유가 없다.

**component는 스냅샷으로 재구성할 수 없다.** 스냅샷의 component 항목은 `variantCount` ·
property 이름 · 바인딩 **개수** · 기하 요약뿐이고 노드 트리가 없다 — **검증용 투영이지 빌드
사양이 아니다.** 변수·style은 token proposal에서 파생되지만 component의 원천은 Figma 파일 자체다.
그래서 새 파일에 component를 세우는 것은 기계적 이전이 아니라 `figma-generate-library` 계열의
저작 작업이며, 토큰 단위와 묶으면 안 된다.

각 자산은 변수와 같은 방식이 필요하다 — 생성기(`build-figma-*.mjs`)와 적용 코드
(`figma/apply-*.js`)를 만들고, **돌리기 전에 스냅샷과 전수 대조**한다. 변수에서 그 대조가
`motion-*` 23개 누락과 빈 폰트 스택을 실제로 잡았다.

**단위 2 — 실측 결과 (2026-08-21):**

없는 계단을 실사용 근거로 세면 **정확히 26개**다. ADR이 추정한 「알파 축 26개」와 일치한다.

    ink-alpha    +9   4 · 16 · 25 · 30 · 40 · 50 · 60 · 70 · 80
    paper-alpha  +10  4 · 6 · 12 · 25 · 30 · 40 · 50 · 60 · 70 · 80
    red-alpha    +7   6 · 8 · 16 · 20 · 25 · 60 · 80

실제로 넣고 `build-tokens`를 돌려 `verify-token-gates`와 `check-token-diff`가 통과하는 것을
확인한 뒤 되돌렸다. **코드는 준비됐고 Figma 이전만 남았다.**

**단위 10 — blocked가 풀렸고, spacing도 같은 드리프트다 (2026-08-21):**

`blocked` 사유였던 제품 확인 2건은 (59)와 (63)에서 닫혔다 — 미커밋 `--surface-*` 9개는 어느
저장소에도 없었고, 앱 셸 램프는 `palette-gray-200`의 G를 238로 확정했다. **surface 보강은 대상이
존재하지 않으므로 미채택으로 닫는다.**

space 쪽은 실측했다. **제품 43단 1,023회 중 DS의 23단이 76.1%를 덮는다.**

| 결손 | 3px | 5px | 7px | 1px | 9px | 11px | 합 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 사용 | 62 | 42 | 32 | 27 | 26 | 8 | **197** |

**보완(2026-08-21).** 이 표는 홀수만 골라 적었는데 **순위 중간을 건너뛰었다** — `112px`(9회)와
`160px`(7회)도 토큰이 없고, `112px`는 표에 넣은 `11px`(8회)보다 많이 쓰인다. 「짝수 사이 홀수」가
결손의 전부는 아니다. 전체 분포는 이제
[product-confirmations](product-confirmations.md)의 생성 표가 낸다.

**radius와 똑같이 짝수 스케일 사이의 홀수다.** DS의 짝수 계단(0·2·4·6·8·10·12·14·16·18·20·24…)이
이미 촘촘하므로 **승격이 아니라 축소 대상**이며, 접는 것은 제품 변경이라 여기서 하지 않는다.
`112px`(9회)·`160px`(7회) 같은 큰 값은 레이아웃 상수로 보이며 별도 판단이 필요하다.

**이 축은 `measure-product-drift.mjs`가 잡았다.** 알파·radius·border-width·duration에 이어
**다섯 번째**이고, 한 축씩 찾던 방식이었다면 놓쳤을 것이다. 계기를 세운 것이 값을 했다.

**단위 8 — layer는 차 있고 motion에 구멍이 있다 (2026-08-21 실측):**

**layer — 추가할 것이 없다.** primitive 5 · semantic 5가 이미 있고 `layerOrder` 배열
(`content → sticky → popover → modal → critical`)도 서 있다. 제품의 z-index는 `9999`·`1400`·`1200`
같은 값이 섞인 상태지만 **그것을 가져오지 않는 것이 계약이다**
([App Shell](../patterns/app-shell.md)의 Overlay contract). 배열 변경이 필요 없다.

**motion — 최다 사용값에 대응하는 모션이 없다.** 배포본의 `ms` 값을 세니 **58단 1,342회**이고
DS의 duration·motion이 덮는 것은 **56.9%**다.

| ms | 사용 | 파일 | DS |
| ---: | ---: | ---: | --- |
| **180** | **240** | 55 | **없다** |
| 120 | 144 | 51 | `duration-fast` |
| 140 | 139 | 44 | `motion-tooltip-enter` |
| 160 | 109 | 36 | `motion-control-hover` |
| 320 | 84 | 35 | `duration-slow` |
| 150 | 68 | 18 | **없다** |
| 280 | 44 | 22 | **없다** |

**보완(2026-08-21).** 위 표는 `320ms` 다음에 `150ms`로 건너뛰는데, 그 사이에 `200ms`(79회)와
`220ms`(74회)가 있다. 둘 다 토큰이 있어 결손은 아니지만, **표가 상위 7개처럼 보이는데 아니다.**

**180ms가 240회로 최다인데 어떤 DS 모션도 그 길이를 쓰지 않는다.** 55개 파일에 퍼져 있어
한 자리의 예외가 아니다. 다만 **180ms가 어느 역할인지는 무엇이 움직이는지를 봐야 정해진다** —
길이만 보고 `motion-*` 이름을 붙이면 그것이야말로 근거 없는 토큰이 된다. 제품 확인이 필요하다.

**네 축에서 같은 자국이 나왔고, 이제 한 번에 잰다.** `scripts/measure-product-drift.mjs`가
alpha·radius·border-width·duration을 함께 재고 `verify-product-drift`가 게이트다. 한 축씩
발견하는 방식으로는 다섯 번째를 놓친다.

**단위 7 — 실측 결과 「16개」가 아니라 1개 + 드리프트 기록이다 (2026-08-21):**

배포본에서 세어 보니 세 축의 상태가 서로 다르다.

**elevation — 결손 없다.** semantic 8종(`focus-ring`·`modal`·`popover`·`surface`·`toast`·
`menu`·`tooltip`·`upgrade`)과 primitive 11종이 이미 있고, 그때 제품의 그림자 토큰이던
`app-tooltip-shadow`·`dropdown-ambient-shadow`·`node-meta-dropdown-shadow` 등이 그 안에 들었다.
추가할 것이 없다. (`--dropdown-ambient-shadow`는 그 뒤 P#1이 걷어냈고 제품이 `--louis-elevation-menu`를
직접 소비한다 — 이 절의 판정은 그대로다.)

**border-width — 최다 사용값에 토큰이 없었다.** 실사용은 `1px` **142회** · `2px` 25 · `0.5px` 20 ·
`1.5px` 10이고(총 203회) LOUIS에는 `hairline`(0.5)과 `ring`(2)뿐이었다. **가장 많이 쓰이는 1px이
빠져 있었다.** `border-width-default`(1px)를 primitive·semantic 양쪽에 세웠다. `1.5px`(10회)은
올리지 않는다 — `hairline`과 `default` 사이의 드리프트로 보인다.

> **수치 정정(2026-08-21).** 이 절을 처음 쓸 때 `1px 111회 · 0.5px 18 · 2px 12 · 1.5px 6`이라고
> 적었는데 틀렸다. 그때 쓴 일회성 `git grep`이 대상에서 **`.ts` 파일을 빼먹었고** 라인 기반이라
> 한 줄에 여러 번 나오는 경우도 놓쳤다. `measure-product-drift.mjs`는 파일 전체를 스캔하므로
> 처음부터 203회로 맞게 세고 있었다 — **계기의 수치가 맞고 산문이 틀렸다.**
> 결론(1px이 최다이고 토큰이 없었다)은 그대로다.

**radius — 알파와 같은 드리프트가 있다.** LOUIS의 짝수 스케일(0·2·4·6·8·10·12·16·20·24·full)이
실사용 **587회 중 83.5%**를 덮고 나머지 **약 97회**가 결손이다.

| 결손 | 7px | 3px | 5px | 1px | 9px | 14px | 18px | 1.5px |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 사용 | 21 | 18 | 15 | 12 | 7 | 6 | 5 | 4 |

**홀수 다섯(1·3·5·7·9)이 73회**로 대부분이고 전부 이웃 계단과 1px 차다. 반경에서 1px은 화면에서
구분되지 않으므로 접는 것이 안전하고, 알파(73단)와 달리 사람이 확인할 자리가 없다.
**다만 `14px`·`18px`은 1px 차가 아니므로 따로 봐야 한다** — LOUIS spacing에는 있지만 radius에는 없는
계단이다. 접는 것은 제품 변경이므로 여기서 하지 않는다.

> **수치 정정(2026-08-21).** 이 절을 처음 쓸 때 「홀수 5단 45회 / 전체 320회」라고 적었는데 틀렸다.
> border-width와 **같은 원인**이다 — 그때 쓴 일회성 `git grep`이 `.ts` 파일을 빼먹었고 라인 기반이라
> 한 줄에 여러 번 나오는 경우를 놓쳤다. `measure-product-drift.mjs`는 파일 전체를 스캔하므로
> 처음부터 587회로 맞게 세고 있었다. **계기가 맞고 산문이 틀렸다.**

**즉 단위 7에서 DS가 세울 것은 `border-width-default` 하나였고, 나머지는 제품 정리 대상이다.**
「16개」라는 추정은 실측 전 수치이며, 실제로는 elevation이 이미 차 있고 radius는 승격이 아니라
축소가 필요한 상태였다.

**단위 3 — accent 램프 (2026-08-21 실측, 2026-08-23 완료):**

제품의 accent 램프를 배포본에서 셌다. **램프 11종 · 정의 67단 · 참조되는 단계 67단** —
미참조 단계가 **0개**다. 원칙 6의 「램프 일부 단계가 미참조여도 허용한다」를 적용할 일이 없다.

| 램프 | 제품 단계 | LOUIS 현재 | 추가 필요 |
| --- | ---: | ---: | ---: |
| mint | 9 | 1 | 8 |
| yellow | 9 | 0 | 9 |
| pink | 9 | 0 | 9 |
| violet | 9 | 0 | 9 |
| red | 9 | 5 | 4 |
| | | | **39** |

**겹치는 11개 토큰의 값이 제품과 전부 일치한다**(불일치 0). 기존 램프가 제품에서 온 것이 맞다는
확인이며, 추가분도 같은 원천에서 그대로 가져오면 된다. 값은 리터럴 hex라 정규화 판단이 없다 —
단위 2와 성격이 다르다.

**이 단위는 끝났다(2026-08-23 확인).** 램프 토큰이 `packages/tokens/src/klipse.tokens.json` ·
`figma/readback.json` · `figma/snapshot.json` 셋 다에 실재하고 `pnpm verify-figma-parity` 가
통과한다.

> 한때 이 자리에 「막히는 곳은 Figma다」와 실패 출력 리터럴이 적혀 있었다. **그 리터럴을 지운
> 이유는 grep 으로 만난 사람이 없는 실패를 재현하려 들기 때문이다.** 위 표는 그 시점의 실측
> 기록으로 남긴다.

**적용 경로는 `figma/apply-variables.*.js` 다.** `scripts/build-figma-variables.mjs` 가 token
proposal 에서 생성하고 `verify-figma-variables` 가 드리프트를 잡으며, [figma-sync](figma-sync.md)
쓰기 정책 4항이 「그것이 유일한 경로다」를 소유한다. 번호순으로 전부 실행한다.

> 한때 이 자리에 「그 적용 스크립트가 저장소에 없다 — 지금까지 MCP 로 즉석 코드를 실행해 왔다」가
> 적혀 있었다. **그대로 읽으면 이미 있는 경로를 다시 만들거나, 더 나쁘게는 「즉석 코드를 써도
> 된다」로 읽혀 쓰기 정책을 깬다.** 즉석 코드를 쓰지 않는 이유는 무엇을 적용했는지가 기록에
> 남지 않기 때문이다.

**단위 2 — 제안된 10단 사다리가 실사용 최다값을 빠뜨린다 (2026-08-21 실측):**

[DS-D-0010](decisions/DS-D-0010-token-coverage.md) 원칙 1은 「정의가 아니라 실사용을 승격한다.
승격 근거에는 사용 화면과 빈도를 남긴다」인데, 그 빈도 데이터가 저장소에 없었다. 배포본에서
세어 [`migration/product.alpha.json`](../../migration/product.alpha.json)에 넣었다. 생성기는
`scripts/measure-product-alpha.mjs`이고 `verify-product-alpha`가 드리프트를 잡는다.

**스톱 73단**이 나왔다 — 결정 문서가 적어 둔 「제품의 73개 변형」이 현재 배포본에서 그대로
재현된다. 토큰 알파 3,532회, rgba 리터럴 296회.

그런데 **제안된 10단(4/8/12/16/24/32/48/56/64/72)이 실사용 상위를 비껴간다.**

| 실사용 | 횟수 | 사다리에 | 사다리의 이웃 |
| --- | ---: | --- | --- |
| **10%** | **239** | **없다** | — (최다 사용인데 이웃도 없다) |
| 8% | 215 | 있다 | |
| **25%** | **208** | **없다** | 24% — 실사용 36회 |
| 12% | 203 | 있다 | |
| 6% | 123 | 없다 | 4%(57) · 8%(215) |
| 20% | 110 | 없다 | 16%(68) · 24%(36) |
| **50%** | **74** | **없다** | 48% — 실사용 30회 |

**최다 사용값 10%가 사다리에 없고, 25%(208회) 자리에 24%(36회)가, 50%(74회) 자리에 48%(30회)가
들어가 있다.** 이대로 정규화하면 가장 많이 쓰이는 값들이 반올림된다.

「88% 이상은 불투명 잉크로 흡수한다」는 관측은 성립한다 — 88% 이상이 800회로 전체의 23%다.
88% 미만의 진짜 알파는 2,732회이며 64단에 흩어져 있다.

**사다리를 다시 정했다(2026-08-21).**

    4 · 6 · 8 · 10 · 12 · 16 · 20 · 25 · 30 · 40 · 50 · 60 · 70 · 80

저역 2단위 · 중역 4~5단위 · 고역 10단위다. **규칙적인 사다리를 고르지 않은 이유**는 알파가
절대 차이가 아니라 **상대 차이**로 보이기 때문이다 — 5%p가 8%에서는 25%지만 55%에서는 9%다.
균등 사다리(5·10·15…)는 상대 15% 이상 이동이 654회지만 이 사다리는 **79회**다.

「외우기 쉬운 사다리라야 다시 흘러내리지 않는다」는 반론이 있으나, 토큰의 요점은 목록에서 고르는
것이지 숫자를 외워 타이핑하는 것이 아니다. 값을 직접 쓰지 못하게 막으면 규칙성 없이도 드리프트는
막힌다. 그러면 규칙성이 아니라 **충실도**로 고른다.

**73단이 왜 생겼는가 — 설계가 아니라 흘러내린 자국이다.** 최다 사용값(10%)조차 전체의 **9%**이고
상위 14단을 합쳐도 64%다. 설계된 스케일이면 상위 5~6단이 80~90%를 덮는다. 0~86% 사이가 1~2%p
간격으로 빈틈없이 차 있어 군집이 갈리지도 않는다. **값이 그때그때 눈대중으로 들어갔다는 뜻이다.**

**사다리를 정하는 것은 절반이고 제품을 접는 것이 나머지 절반이다.** 접지 않으면 DS만 14단이고
제품은 계속 73단이다. `scripts/build-alpha-consolidation.mjs`가 매핑표와 **사람이 봐야 할 자리**를
[alpha-consolidation.json](../../migration/alpha-consolidation.json)에 낸다. `verify-alpha-consolidation`이
게이트다.

| 확인 대상 | 자리 | 성격 |
| --- | ---: | --- |
| `5% → 4%` · `3% → 4%` | 76 | 1%p 병합. 그 농도에서는 화면에 보이지 않는다 |
| `1%` · `1.5%` · `2.5% → 4%` | 3 | **각각 딱 한 곳에서만 쓰인 값.** 의도가 아니라 사고다 |

접으면 안 되는 값을 찾으면 스크립트의 `KEEP`에 넣고 다시 생성한다 — 73개 중에 진짜 의도가 있는
값이 섞여 있을 수 있고, 구분 없이 일괄로 밀면 그것도 부서진다.

**제품 저장소 확인이 필요한 blocker (2026-08-21 갱신):**

1. ~~제품의 미커밋 `--surface-*`/`--border-*` 9개 — 역할을 먼저 정하고 제품이 역이관하는 방향을
   권장한다.~~ **해소 — 역이관할 대상이 없다.** 제품 정본 `design` 브랜치에 그 9개가 **존재하지 않는다**
   (2026-08-23 재확인: `--surface-*` 0건 · `--border-*` 0건).
   구 제품 저장소의 **추적되지 않는 작업 트리에만** 있었고, 그것도 이관 번들 자신의 패치가 만든
   것이다(커밋 HEAD에는 0건, 작업 트리에 2곳). 어느 저장소에도 커밋된 적이 없으므로 「제품이
   역이관한다」가 성립하지 않는다. **미채택으로 닫고 사유를 남긴다** — 제품에 존재한 적 없는 값이다.

   ~~같은 근거로 구 저장소의 `globals.css` HEAD는 배포본 `origin/main`과 **바이트 단위로 동일**하다.~~
   **이 문장은 더 이상 성립하지 않는다(2026-08-23).** 그때의 비교 대상이 `origin/main` 이었고
   지금 정본은 `design` 이다. 두 브랜치는 실제로 갈렸다 — `globals.css` 만 113줄 다르고
   폐지된 글래스 섀도우가 `origin/main` 에만 남아 있다(`glass-` 30건 대 **0건**).
   **`origin/main` 으로 재실측하면 죽은 값을 DS 로 올리게 된다.** 측정 기준은 언제나
   `migration/product-evidence.lock.json` 의 `productCommit` 이다.

2. 앱 셸 라이트 램프 — **값 불일치를 정확히 좁혔다.** `body:has(...)` 런타임 DOM 조건이라 light/dark
   축으로 표현되지 않는 것은 그대로다. 다만 「값 자체가 미확정」의 범위는 **한 단계 한 채널**이다.

   | 램프 단계 | 앱 셸 hex | 앱 셸 rgb mirror | 판정 |
   | --- | --- | --- | --- |
   | `palette-gray-100` | `#f8f8f9` → 248 248 249 | `248 248 249` | 일치 |
   | `palette-gray-150` | `#f1f1f3` → 241 241 243 | `241 241 243` | 일치 |
   | **`palette-gray-200`** | **`#eeeef1` → 238 238 241** | **`238 239 241`** | **G 채널 1 차이** |
   | `palette-gray-300` | `#e4e5e9` → 228 229 233 | `228 229 233` | 일치 |

   **같은 색이 소비 경로에 따라 다르게 렌더된다** — `var(--palette-gray-200)`을 읽으면 238 238 241,
   `rgb(var(--palette-gray-200-rgb) / n%)`을 읽으면 238 239 241이다. 어느 쪽이 정본인지는 제품
   결정이며 램프의 다른 단계에서 규칙을 추론할 수 없다(150은 R=G, 300은 R≠G라 양쪽 선례가 있다).

   **결정(2026-08-21): `G = 238`. hex `#eeeef1`을 정본으로 삼는다.** 근거 셋이다.

   1. **주 소비 경로가 hex다.** `var(--palette-gray-200)`은 불투명 면색으로 쓰이고, `-rgb` 미러는
      알파 합성 보조다. 램프 단계의 대표값은 면색 쪽이다.
   2. **이웃과 맞는다.** 앱 셸 램프의 `palette-gray-100`(248 248 249)과 `palette-gray-150`
      (241 241 243)이 둘 다 R=G다. 238 238이 그 패턴이고 238 239는 아니다.
   3. **반대로 골라도 잃는 것이 없다.** 차이는 G 채널 1/255이며 알파 합성에서만 나타난다.
      두 값의 색차는 감지 한계 아래다.

   **제품 쪽 결함은 남는다** — `--palette-gray-200-rgb`가 `238 239 241`인 채로 있어 같은 색이
   소비 경로에 따라 다르게 렌더된다. 제품이 미러를 `238 238 241`로 고치는 것이 정합이며, 그전까지
   DS는 238을 쓴다. 이 blocker는 **닫는다.**

   런타임 DOM 조건(`body:has(...)`) 자체는 여전히 light/dark 축으로 표현되지 않는다 —
   DS-D-0010 원칙 3이 「DOM 상태 스코프는 토큰 축이 아니다」로 이미 정해 두었고, 소비 계층이
   mode를 다시 적용해 해결한다. 값이 확정됐으므로 **앱 셸 라이트 화면 제외는 해제할 수 있다.**

**의존성:** DS-P3-009a

2026-08-14 실측(KP-FIGMA-001)에서 제품이 실제로 쓰는 색 계열과 타이포 스케일이 현재
`packages/tokens/src/klipse.tokens.json`의 범위보다 넓다는 사실이 확인됐다. 배포 화면을 라이브러리로
재조립하려면(목표 B) token source가 그 범위를 덮어야 한다.

- 화면 인벤토리와 제품 CSS에서 실제 사용되는 색·타이포·간격을 추출해 현재 token source와 대조한다.
- 추가할 것, 제품 전용으로 남길 것, 의도적으로 채택하지 않을 것을 분류하고 근거를 기록한다.
- 추가는 semantic 역할 기준으로 하며 제품 CSS 이름을 그대로 복사하지 않는다. primitive 확장이
  필요하면 alias graph와 contrast pair 게이트를 함께 갱신한다.
- additive 변경과 breaking 변경을 분리하고, breaking이면 DS-GOV-001 절차를 적용한다.

**완료 근거:** 확장된 token source가 게이트를 통과하고, 인벤토리의 화면 구성 요소가 raw 값 없이
semantic token으로 표현 가능함을 대조로 보인다. 채택하지 않은 항목은 사유와 함께 남긴다.

### Figma 트랙 — DS-F-000 ~ DS-F-008

목표 B(published library로 배포 화면 재조립) 전용 트랙이다. **DS-F-000~005가 코드 트랙과 병렬
구간**이며, DS-F-006부터는 해당 컴포넌트의 코드 구현이, DS-F-007은 화면 인벤토리(제품 저장소
접근)가 추가로 필요하다. 실행 경계(MCP Plugin API가 유일한 자동화 경로, Variables REST API는
Enterprise 전용으로 사용 불가, publish는 전 요금제에서 사람 수동, **publish 전에는 파일 간 변수·
component 소비가 불가능하므로 단일 파일 3-페이지 구조가 강제**)와 작업별 상세 절차는
[플레이북](execution-playbook.md)이 소유한다.

#### DS-F-000 — Figma 운영 전제

**상태:** `done` (2026-08-14).

- 사용자 지시로 디자인 시스템 전용 파일 `bxGEp0km5zluMJGulaTvFW`를 `SEJUNKI` 팀(pro tier)에
  생성하고 Foundations / Components / Templates 3개 페이지를 만들었다.
- 실측: mode 2개 생성 가능, collection당 mode 상한 10개, `Pretendard` 사용 가능.
- 기존 파일 `CNORJOONt4z0a4Bl22Kjuu`("Klipse 3.0")는 제품 코드를 정본으로 미러링한 별도 자산이며
  이 저장소는 **읽기 전용 reference**로만 쓴다. 관측 내용은
  [KP-FIGMA-001](../../migration/product-baseline.md)에 있다.
- 쓰기 정책과 운영 파일 표를 [Figma Sync Governance](figma-sync.md)에 규범으로 기록했다.

**완료 근거:** figma-sync.md의 운영 파일·capability·쓰기 정책 절, product-baseline의 KP-FIGMA-001,
생성된 파일의 3-페이지 구조. 파일 생성만으로는 어떤 Figma 상태도 올리지 않는다.

#### DS-F-001 — Figma 구조 Decision

**상태:** `done` (2026-08-14). [DS-D-0007](decisions/DS-D-0007-figma-library-structure.md)이
`proposed`로 작성됐다. owner 승인은 별도로 요청한다.

**의존성:** DS-F-000

현재 proposal의 단일 collection 4-mode 구조는 Figma 모델과 충돌한다(mode는 collection의 모든 변수에
적용된다). Decision으로 collection 분리(primitive 1-mode / semantic-global 1-mode / semantic-color
light·dark 2-mode), publish 전 단일 파일 3-페이지 구조(파일 분리는 publish 후 DS-F-009), 이름 변환
규칙, composite→style 정책(semantic tier 이름 사용)과 motion 격하 정책을 확정한다.

KP-FIGMA-001의 제품 미러 구조(Primitives / Dimensions / Semantic Light·Dark)를 참고 입력으로
검토하되, 그 파일의 이름·값을 이 저장소의 정본으로 채택하지 않는다. 채택하려면 token source 변경과
DS-D-0001 재검토가 먼저다.

**완료 근거:** Decision 문서(proposed + owner 확인 요청 기록)와 갱신된 figma-sync.md.

#### DS-F-002 — Proposal 재구조화

**상태:** `done` (2026-08-14). proposal이 3-collection 구조를 출력하고, 토큰 200 레코드(고유 ID 174)가
변수 146 · style 10 · 미표현 18로 전수 분류된다. `figmaCollection`을 `Klipse`로 바꾼 breaking을
DS-GOV-001 절차로 처리했다.

**의존성:** DS-F-001, DS-GOV-001

- generator, validator/diff(`token-model.mjs`), 공개 d.ts 타입, token 게이트를 multi-collection
  구조로 한 변경 단위에서 갱신한다.
- `figmaCollection`과 d.ts breaking diff를 DS-GOV-001 절차로 선언하고 baseline을 갱신한다.
- manifest schema의 `tokenPackage.figmaLibrary` `const: "not-ready"` 고정을 status enum + evidence
  요구로 완화한다 (승격은 이후 작업).

**완료 근거:** 재생성된 artifact 6종, 갱신된 baseline/게이트/schema, `pnpm verify` 통과, Updates의
breaking 기록.

#### DS-F-003 — Variables 구축

**상태:** `done` (2026-08-14). 라이브러리 파일에 collection 3개와 변수 146개(Primitive 92 ·
Semantic 28 · Semantic Color 26×2 mode)를 생성했다. 되읽은 정규화 직렬화의 FNV-1a 해시가 proposal
기대값과 일치(146 토큰, 10132자, `cc72b724`)함을 실측했다. publish하지 않았고 Figma 상태도 올리지
않았다.

**의존성:** DS-F-002, DS-F-000의 파일 key

- MCP `use_figma`로 proposal의 collection/mode/variable/alias를 Foundations draft 파일에 idempotent하게
  적용한다.
- 실행 후 전체를 다시 읽어 proposal과 대조하고 불일치 0을 확인한다. publish하지 않는다.

**완료 근거:** draft 파일의 변수 세트가 proposal과 자동 대조로 일치. manifest Figma 상태는 DS-F-004
통과 전까지 올리지 않는다.

#### DS-F-004 — Snapshot과 parity checker

**상태:** `done` (2026-08-14). `scripts/verify-figma-parity.mjs`가 credential 없이
`figma/snapshot.json`과 proposal을 대조하고, 값·alias·collection 변조 canary 3종이 매 실행마다 게이트가
실제로 실패할 수 있음을 보증한다. `pnpm verify`에 연결됐다. staleness는 실패가 아닌 경고다.

**의존성:** 1단계(checker + fixture snapshot + canary + verify 연결)는 DS-F-002만. 2단계(실제 draft
덤프로 fixture 대체)는 DS-F-003과 DS-F-000의 파일 key. 빈 draft 대조는 전량 mismatch로 verify를
상시 실패시키므로 단계를 지킨다.

- `scripts/verify-figma-parity.mjs`가 credential 없이 커밋된 snapshot과 proposal을 비교해 분류
  완전성과 mismatch를 실패로, staleness를 경고로 보고한다.
- mismatch canary 1건을 추가하고 root `verify`에 연결한다 (fixture 단계에서 가능).
- DS-F-003 이후 MCP 읽기로 실제 상태를 최상위 `figma/snapshot.json`으로 덤프해 커밋한다 (source
  hash와 날짜 포함). figma-sync.md의 현재 상태 목록을 함께 갱신한다.
- 이 작업 통과만으로는 어떤 Figma 상태도 올리지 않는다.

**완료 근거:** 변조된 snapshot이 게이트를 실제로 실패시키고, clean 상태에서 verify가 통과한다.

#### DS-F-005 — Composite → Styles

**상태:** `done` (2026-08-14). semantic tier 이름으로 text style 6종(`typography/*`)과 effect style
4종(`elevation/*`)을 생성했고, text style의 fontSize·fontWeight를 primitive 변수에 12건 바인딩했다.
loss(fontFamily fallback 배열, unitless lineHeight, shadow color 변수 부재, tier alias 소실)를 style
description에 기록했다. parity 게이트가 style 10종까지 검증하므로 고유 토큰 174개가 전수 대조된다.

**Known deviation:** primitive 변수가 `hiddenFromPublishing: true`인 상태에서 style이 이를
바인딩한다. publish 후 소비자 측에서 바인딩이 해석되는지 DS-F-008 체크리스트에서 확인한다.

**의존성:** DS-F-003

- typography 를 text style, shadow 를 effect style 로 생성하고 내부 속성을 변수에 바인딩한다.
  **수를 여기에 적지 않는다** — `figma/snapshot.json` 의 `styles.text`·`styles.effect` 가 정본이다.
- 표현 불가 필드는 loss metadata를 style description에 기록한다.

**완료 근거:** snapshot에 style이 포함되고 composite parity 대조를 통과한다.

#### DS-F-006-{component} — Component library

**상태:** `done` — 이 절의 하위 작업이 전부 닫혔다. publish 는 DS-F-008 이 소유한다.

**여기에 상태 표를 다시 만들지 마라.** 한때 이 자리에 하위 작업 11행 표와 「나머지 다섯은
`ready` 이며 이것이 현재 다음 포인터다」가 있었는데, 표의 `not-ready` 넷(Tooltip · Toast ·
Menu/Popover · Dialog)이 전부 낡았고 같은 문서 위쪽은 이미 「넷이 전부 섰다. `DS-F-006` 이
닫혔다」로 적고 있었다 — **한 문서가 자기를 반박했다.**

상태의 정본은 둘이다.

- 코드·Figma 상태 → [`manifest.json`](../manifest.json)의 각 component `web`/`figma`
- Figma 에 실제로 무엇이 있는가 → `figma/snapshot.json` 의 `components`,
  그리고 그것을 코드와 대조하는 `pnpm verify-figma-parity`

DS-F-007-home 실측이 이 절이 열려 있던 시절의 격차를 숫자로 확인했다 — 재조립이 요구한 자산
대부분이 Figma 에 없어 gap 이 크게 나왔다. **그 수는 그 시점의 기록이며 지금 값이 아니다.**

- `Button` component set 40 variant (Variant 4 × Size 2 × State 5). fill 72·stroke 18이 전부 변수
  바인딩이고 텍스트 40개가 전부 text style이다 — **raw 값 0**.
- parity 게이트가 Figma variant 옵션을 코드의 `ButtonVariant`·`ButtonSize` 선언과 대조한다. Figma에만
  있는 `State`는 사유와 함께 계약에 선언돼야 통과하고, 선언되지 않은 property가 생기면 실패한다.
- 변조 canary 2종(variant 옵션, raw 값)이 게이트의 검출력을 매 실행에서 증명한다.

**여기서 발견해 고친 결함:** Figma의 `Klipse Semantic Color` collection이 **Dark를 기본 모드로**
쓰고 있었다. mode를 알파벳 정렬한 탓인데, token source는 `themes: ["light", "dark"]`로 light를 먼저
선언하고 CSS도 `:root`가 light다. 생성기가 source 순서를 따르도록 고치고 `defaultMode`를 명시했으며,
parity 게이트가 이제 mode 순서와 기본 모드를 검증한다. token graph는 바뀌지 않아 baseline 갱신은
필요 없었다.

**의존성:** 해당 컴포넌트의 코드 구현(DS-P3-004/006/007/009)과 DS-F-005. Button부터 시작한다.

- 코드 prop/variant와 1:1인 componentPropertyDefinitions로 component set을 생성하고 모든 시각 속성을
  변수·style에 바인딩한다 (raw 값 0).
- parity checker를 componentPropertyDefinitions ↔ 코드 prop 스키마 비교로 확장한다.
- 통과 시 해당 컴포넌트의 `figma`를 `partial`로 올린다. `done`은 DS-F-008 이후다.

**완료 근거:** component set, 상태별 시각 대조 기록, 확장된 parity report.

#### DS-F-007-{screen} — 배포 화면 재조립 검증

**상태:** `DS-F-007-home` 1차 수행 완료 (2026-08-15), 그러나 화면 기준은 **미충족**이다. 산출물은
[gap registry](../../migration/figma-gap-registry.md)이고 template은 `figma/templates.measured.json`이
제품 실측값에 묶는다.

- 제품 홈(`/archive`)을 축 4개로 321건 실측해 **gap 72건**을 찾았다. Figma에 있던 자산은 Button
  component set 하나와 아이콘 26개뿐이라 ProjectCard·SidebarNavItem·AppTopBar·Menu·EmptyState·
  Avatar·Badge·BannerCarousel이 전부 없었다.
- 그래서 이 단계는 픽셀 재현이 아니라 **coverage 측정**이다. 자홍색 파선이 raw 영역을 드러내며,
  그 파선이 화면 대부분을 차지한다는 사실 자체가 판정이다.
- Highlight 130건, Editor 144건의 gap도 같은 방식으로 기록했다.
- 이름만 보고 집으면 화면이 달라지는 토큰 둘을 여기서 찾았다 — `radius-card`(20px)의 유일한
  소비처가 dialog sheet인데 제품의 실제 카드는 전부 16px이고, `layout-project-card-minimum`은
  CSS 소비자가 0이며 제품이 쓰지 않는 `minmax` 알고리즘을 서술한다. 둘 다 owner 판정 대기다.

**대상 화면이 전부 gap 0이 될 때까지 이 항목은 `done`이 아니다.** **대상 범위와 등급 체계는
[`migration/product-screens/`](../../migration/product-screens/) 가 소유한다** — 한때 여기가
「Home·Highlight·Editor 3개」였고 그 인벤토리가 서기 전의 기준이다.

**의존성:** DS-F-005, 해당 화면에 필요한 DS-F-006 component, DS-P3-009a. 화면별로 하위 작업 단위다.

- component instance·변수·style만으로 배포 화면을 재조립한다 (publish 전에는 같은 파일 안에서).
  **조립 규칙은 [figma-screen-assembly](figma-screen-assembly.md)가, 실행 절차는
  `.claude/skills/klipse-figma-transplant/SKILL.md` 가 소유한다** — 이 절만 따르면 2026-08-21
  조립 실패에서 나온 규칙을 통째로 놓친다. **어느 Figma 파일에 쓰는지는
  [figma-sync](figma-sync.md) 「운영 파일」 절이 소유한다.**
- detach, raw override, 카탈로그 부재 요소를 gap registry로 기록하고 카탈로그/아이콘 우선순위에
  반영한다.
- 대상 화면이 카탈로그 gap과 parity 결함 없이 재조립되면 목표 B의 검증 기준을 충족한다.

**완료 근거:** 재조립된 template, 배포 화면과의 대조 기록, gap registry.

#### DS-F-008 — Publish 운영 절차

**의존성:** DS-F-003~006, repository owner의 수동 publish

- publish 전 체크리스트와 rollback runbook을 만든다.
- owner가 Figma UI에서 수동 publish한 뒤 snapshot을 재덤프하고 library key/version을 기록한다.
- 이 시점에만 관련 항목의 `figma: done` 승격이 가능하다.
- SEED식 3-파일 분리는 publish 후 수요가 확인될 때 별도 작업 `DS-F-009`로 다룬다.

**완료 근거:** published library key/version evidence, publish 후 재검증 통과, runbook.

### P4 — Documentation과 distribution

#### DS-P4-001 — Docs product contract와 architecture Decision

**의존성:** DS-P3-001; 구현은 core public API가 안정된 뒤

- 검색, information architecture, 접근성, theme, version badge, isolated example와 stable URL을 먼저 정한다.
- source Markdown/frontmatter/manifest 중 metadata ownership을 확정한다.
- framework는 위 요구와 build/deploy/maintenance 비교 후 선택한다.

#### DS-P4-002 — Docs site foundation

**의존성:** DS-P4-001, DS-P3-003

- Get Started, Foundations, Components, Patterns, Develop, Updates/Migration navigation을 구현한다.
- keyboard/search/heading/landmark, 200% zoom와 mobile navigation을 검증한다.
- live example은 실제 released 또는 workspace public export만 소비한다.

#### DS-P4-003 — Component/API/example pages

**의존성:** DS-P4-002, DS-P3-008

- 각 component에 design guidance와 developer API를 구분해 제공한다.
- anatomy, variants, states, accessibility, content, tokens, install/import, examples와 availability evidence를
  한 페이지에서 연결한다.
- example은 독립 theme/viewport/locale/forced-colors/reduced-motion으로 실행한다.

#### DS-P4-004 — AI와 release discoverability

**의존성:** DS-P4-002

- 현재 generated `design/llms/*`를 stable public URL로 제공하고 source link와 version을 표시한다.
- sitemap, changelog, deprecation과 migration을 검색 가능하게 만든다.
- docs가 안정되고 실제 수요가 생기기 전에는 MCP/Skill/CLI를 만들지 않는다.

**P4 complete:** hosted docs URL, search/accessibility/browser 검증, versioned component examples, stable AI document
URLs, release/migration discoverability와 owner approval.

### P5 — Product adoption

P5 작업은 디자인 시스템 release와 소비 제품 integration을 별도 변경으로 관리한다. 제품 저장소의 기존
변경을 덮어쓰거나 디자인 시스템 commit과 섞지 않는다.

#### DS-P5-001 — Adoption plan과 adapter

**의존성:** DS-P3-012

- [Product Adoption](migration.md)과 [token mapping](../../migration/token-mapping.md)을 최신 release에 맞춘다.
- old semantic alias와 new package를 한 방향으로 연결하는 임시 adapter와 제거 조건을 정의한다.
- feature flag 또는 독립 rollback 단위를 준비하고 baseline screenshot/interaction evidence를 고정한다.

#### DS-P5-002 — Leaf component shadow adoption

**의존성:** DS-P5-001

- Button, Menu/Popover, Dialog 같은 leaf component를 작은 surface부터 교체한다.
- old/new를 동일 fixture에서 비교하고 keyboard, focus, hit-test, theme와 layout shift를 검증한다.

#### DS-P5-003 — Home와 Project Grid

**의존성:** DS-P5-002

- App Shell ownership, sidebar rhythm과 container 기반 실제 card capacity를 검증한다.
- 넓은 화면을 3열로 고정하지 않고 minimum card/gap과 available content box로 열 수를 계산한다.
- loading/empty/error와 keyboard navigation을 같은 contract로 검증한다.

#### DS-P5-004 — Highlight

**의존성:** DS-P5-002

- Home/history/detail의 shell, grid, overlay와 localized content를 각각 검증한다.
- 제품 전용 visual theme는 extension으로 남기고 core primitive를 scope override하지 않는다.

#### DS-P5-005 — Editor workspace

**의존성:** DS-P5-002

- route workspace와 modal editor를 명시적 mode로 분리한다.
- App Shell sidebar, asset panel, canvas, inspector와 timeline의 bounding box가 겹치지 않게 한다.
- portal/layer/focus ownership, compact layout, canvas token parity와 return behavior를 검증한다.

#### DS-P5-006 — Legacy 차단과 rollback dashboard

**의존성:** DS-P5-003, DS-P5-004, DS-P5-005

- 신규 raw token, deep/source import와 deprecated UI reference를 정적 gate로 차단한다.
- adapter 사용량, route adoption, rollback owner와 제거 version을 추적한다.
- 모든 route가 새 release를 소비하고 rollback window가 끝난 뒤 legacy를 제거한다.

**P5 complete:** versioned package adoption, Home/Highlight/Editor route evidence, 신규 legacy reference 0, rollback
검증과 제품 owner 승인. 일부 route adoption은 시스템 `stable` 근거가 아니다.

## 9. Component 완료 정의

아래 전체 목록은 Web `done`과 `stable` 승격의 기준이다. Web `partial` 승격에는
[플레이북 3절](execution-playbook.md)의 최소 증거 세트(unit/state test, DOM keyboard/focus test,
automated accessibility check, consumer build와 public import example, manifest 일치)만 요구한다. core
RC를 먼저 완성하기 위한 구분이며, `partial`인 항목은 남은 전체 세트 항목을 Known deviations로
기록한다.

각 component의 `done`/`stable` 승격은 다음 항목을 모두 다룬다.

### Contract

- 사용/비사용 기준과 대체 component
- anatomy와 part별 ownership
- public props, defaults, controlled/uncontrolled state와 ref/event contract
- variants, sizes, loading/disabled/error/empty 상태
- semantic token/recipe mapping; raw color, 임의 spacing/z-index 금지
- breaking/additive 분류, migration과 deprecation

### Interaction과 접근성

- native element 우선, accessible name/role/state
- pointer, keyboard, focus-visible, focus entry/order/return
- duplicate activation, outside interaction, nested overlay와 Escape order
- touch target, 200% zoom, 320px급 좁은 viewport와 text reflow
- KO/EN/JA 긴 콘텐츠, 빈 문자열/동적 상태와 RTL 영향을 검토
- light/dark, forced-colors/high contrast, reduced motion
- SSR render, hydration과 client boundary

### Evidence

- unit/state test
- DOM keyboard/focus interaction test
- automated accessibility check와 수동 keyboard/screen-reader review record
- real-browser hit-test/layout test
- stable visual regression fixture
- package self-reference/type/production consumer build
- actual public import를 쓰는 isolated example
- normative/API docs, Updates와 migration
- Figma proposal 또는 published component의 상태별 근거

하나라도 미충족이면 `Known deviations`와 다음 task를 적고 해당 surface를 `partial` 또는 `not-ready`로
유지한다.

## 10. Decision이 필요한 항목

다음은 암묵적으로 선택하지 않는다.

| 결정                           | 반드시 비교할 내용                                                     |
| ------------------------------ | ---------------------------------------------------------------------- |
| React behavior dependency      | 접근성 완성도, bundle, SSR, maintenance, escape hatch, license         |
| CSS recipe 방식                | source readability, variants, type safety, generated drift, size       |
| package version 정책           | fixed/independent, coordinated CSS/React change, rollback              |
| browser/a11y/visual test stack | CI cost, determinism, local debug, coverage와 false positive           |
| font distribution              | asset license, preload/layout shift, locale glyph와 consumer injection |
| docs framework                 | search, accessibility, isolated example, versioning, maintenance       |
| Figma sync 방향                | code-first conflict handling, stable IDs, publish credentials          |
| Figma collection/파일 구조     | mode 적용 범위, 요금제 한도, breaking 영향과 재작성 비용               |
| 아이콘 정본 위치               | 코드 SVG 정본 vs Figma 정본, 유지 책임, 추출 파이프라인과 rollback     |
| public headless package        | 실제 독립 consumer 수, API stability와 duplication                     |

선택은 공식 문서와 작은 spike로 검증하고 Decision에 대안, 이유, 결과, rollback과 재검토 조건을 남긴다.

## 11. 금지되는 지름길

- SEED source, token/API 또는 화면 모양을 그대로 복사한다.
- component code부터 만든 뒤 접근성·상태 계약을 사후에 맞춘다.
- token source가 있는데 CSS/TS/Figma에 같은 값을 다시 수기 작성한다.
- raw primitive를 public component API나 제품 기본 스타일로 노출한다.
- CSS reset 또는 Tailwind preflight가 있다고 가정한다.
- `body` portal과 숫자 z-index로 App Shell ownership을 우회한다.
- screenshot 하나로 responsive, hit-test 또는 접근성 완료를 주장한다.
- local build를 public release, Figma proposal을 published library라고 부른다.
- docs/AI/MCP 도구 수를 design-system 성숙도로 착각한다.
- remote, publish 권한 하나가 없다는 이유로 모든 독립 로컬 작업을 멈춘다.
- 사용자가 지정하지 않은 Figma 파일에 쓰거나, Figma library publish를 자동화했다고 주장한다.
- breaking diff를 통과시키려고 baseline을 선언 없이 덮어쓴다.
- 검증 명령을 실행할 수 없는 환경에서 실행한 것처럼 보고한다.

## 12. 다음 작업자가 즉시 시작할 일

세션을 시작하면 [플레이북 2절](execution-playbook.md)의 환경 게이트를 먼저 확인한다.

**이 절은 고정 목록을 갖지 않는다.** 한때 여기에 `DS-P3-001` · `DS-F-000` · `DS-GOV-001` ·
`DS-P3-009a` 넷이 「즉시 시작할 일」로 적혀 있었는데, **그중 셋을 이 문서가 다른 절에서 이미
`done` 으로 적고 있었다.** 손으로 유지되는 시작점 목록은 반드시 그렇게 낡는다.

무엇을 집을지는 이 순서로 판단한다.

1. 문서 최상단 배너가 가리키는 선행 인계서 — 그것이 큐보다 앞선다.
2. [작업 큐](#8-작업-큐)에서 의존성이 충족된 가장 앞의 `ready` 항목.
3. 상태가 의심스러우면 [`manifest.json`](../manifest.json)과 게이트 출력으로 판정한다.
   이 문서의 산문이 아니라 그쪽이 정본이다.

각 작업의 단계별 절차는 [플레이북 6절](execution-playbook.md)을 따른다. 외부 권한이 필요한
단계(publish · 자격 증명)는 [§11](#11-금지되는-지름길)이 소유한다.

## 13. 인계 보고 형식

```text
완료한 작업 ID:
변경한 계약과 사용자 영향:
변경 파일:
상태 변경과 근거:
실행한 검증:
남은 deviation/외부 blocker:
다음 권장 작업 ID:
```

상태를 올리지 않았다면 그것도 성공적인 결과일 수 있다. 중요한 것은 다음 작업자가 추측하지 않아도 되는
검증 가능한 근거를 남기는 것이다.
