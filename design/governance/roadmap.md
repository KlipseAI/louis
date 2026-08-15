---
id: governance-roadmap
status: beta
authority: normative
---

# Roadmap

목표는 문서 수가 아니라 제품이 versioned design contract를 안전하게 소비하게 만드는 것이다.

## P1 — Portable contracts

**상태:** `release-candidate`

완료:

- 독립 catalog/schema와 권위 모델
- responsive layout, app shell, project grid, editor workspace 계약
- Button, Menu/Popover, Dialog, Loading 규범
- manifest 기반 progress board와 AI 문서
- 오류 주입 canary가 있는 독립 gate

`complete` 조건:

- 별도 저장소 첫 추적 commit
- clean checkout CI 통과
- repository owner 승인

## P2 — Token source inversion

**상태:** local `release-candidate` (`experimental`)

이 상태는 token source, projection, diff와 package surface에만 적용된다. Browser UI, glyph, 접근성,
layout, interaction acceptance는 P3/P5 소비 구현 게이트이며 아직 `not-ready`다.

범위:

- DTCG 2025.10-compatible 단일 정본 `packages/tokens/src/klipse.tokens.json`
- `scripts/lib/token-model.mjs`의 외부 패키지 무의존 Node 표준 라이브러리 기반 repository-supported DTCG
  subset/Klipse extension validation
- Color/theme, typography, spacing, radius, elevation, layer, motion contract
- raw primitive와 semantic role 분리, light/dark alias graph
- 단일 source에서 CSS·JavaScript·TypeScript·JSON·manifest projection 생성. CSS는 semantic consumption
  surface이고 JS·TS·JSON·manifest는 검증 가능한 primitive/semantic graph를 포함
- reviewable Figma proposal 생성. Published Figma variables/components는 P3
- token diff, breaking migration과 deprecation policy
- App Shell spacing, container 기반 Project Grid profile, overlay layer, lifecycle별 motion property와
  reduced-motion 계약의 기계적 연결

`release-candidate` 조건:

- 단일 source와 validator가 alias cycle, dangling reference, type/unit/mode/extension 오류를 차단
- light/dark mode completeness, contrast pair, typography composite, layer order와 reduced-motion 검증 통과
- Project Grid의 container measurement, stable minimum-card/gap ID와 ordered 0/720/1200/1800px preferred
  2/3/4/5열 profile shape 검증 통과. 실제 capacity와 1열 fallback은 P3/P5 소비 구현 게이트
- enter/exit lifecycle별 허용 CSS property 검증 통과
- CSS semantic selector/theme output, JS·JSON·Figma proposal·manifest의 primitive/semantic metadata·값·alias
  projection과 JavaScript/TypeScript token-graph parity 통과
- 같은 process에서 동일 source를 두 번 render한 artifact가 byte-for-byte 동일
- private package export map, type declaration과 최소 소비 fixture 준비
- additive/breaking token diff와 failure canary 준비
- Foundations, Develop, Figma, release, deprecation과 Updates 문서가 실제 artifact 상태와 일치

`complete` 조건:

- clean-checkout hosted CI에서 token build, generated drift, parity와 deterministic rebuild 통과
- migration/rollback이 포함된 private package release-candidate
- repository owner 승인

P2 로컬 RC와 향후 완료 모두 public registry 배포, 제품 adoption 또는 published Figma library를 뜻하지
않는다. 이 세 상태는 별도 release/adoption gate 전까지 `not-ready`다.

## P3 — Components and Figma library

**상태:** `planned`

- core local RC, catalog coverage와 P3 complete를 서로 다른 gate로 판정
- Button → Menu/Popover → Dialog 순으로 public implementation
- 이후 Input, Select, Tooltip, Toast, Empty State와 공용 pattern fixture를 독립적으로 확장
- keyboard/focus/accessibility tests
- CSS/React package API와 compatibility policy
- 배포 화면 인벤토리와 아이콘 트랙

Figma 작업은 코드 트랙과 병렬인 **Figma 트랙(DS-F-000~008)**이 소유한다: 운영 전제와 구조 Decision
→ multi-collection proposal → variables/styles 구축 → snapshot parity gate → component library →
배포 화면 재조립 검증 → 수동 publish 운영. Variables 구축은 React 구현을 기다리지 않으며, component
parity만 코드 구현과 짝을 이룬다.

Core local RC는 P3 전체 완료가 아니다. 세부 의존성, surface별 승격 근거와 작업 큐는
[Claude Code 실행 인계서](execution-handoff.md)를, 작업별 상세 절차와 완성 판정표는
[실행 플레이북](execution-playbook.md)을 따른다.

## P4 — Documentation and distribution

**상태:** `planned`

- 검색 가능한 공개 docs site
- isolated examples와 version badge
- stable `llms.txt` URLs
- changelog, deprecation, migration discoverability

## P5 — Product adoption

**상태:** `planned`

- Klipse product가 versioned packages 소비
- Home/Highlight/Editor 핵심 route integration evidence
- legacy UI 신규 참조 차단
- adoption과 rollback dashboard
- 각 route 전환과 짝을 이루는 Figma 화면 재조립 재검증 (목표 B 유지)

Home/Highlight/Editor의 실제 route 검증은 P5가 소유하고, 재사용 가능한 App Shell/Grid fixture는
P3에서 먼저 검증한다. Editor Workspace geometry 검증은 DS-P5-005의 실제 adoption에서 수행한다. 구체
순서는 [실행 인계서](execution-handoff.md)를 따른다.
