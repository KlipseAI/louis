---
id: updates-overview
status: beta
authority: normative
---

# Updates

디자이너와 개발자가 알아야 할 사용자 영향 변경과 migration을 최신순으로 기록한다.

## 2026-08-13 — P2 token source inversion 로컬 RC 구현

### Added

- Color/Theme, Typography, Spacing/Radius, Elevation/Layer, Motion 규범과 acceptance criteria
- DTCG 2025.10-compatible 단일 정본 `packages/tokens/src/klipse.tokens.json`
- 외부 패키지 없이 Node 표준 라이브러리만 사용하는 repository-supported DTCG subset validator
  `scripts/lib/token-model.mjs`
- semantic CSS projection, primitive/semantic JS·JSON·Figma proposal·manifest와 token ID/type/mode/alias/value
  shape를 선언하는 TypeScript projection
- token diff 비교점 `packages/tokens/baseline/manifest.json`
- alias graph, mode completeness, contrast, primitive/semantic metadata projection, CSS theme/selector,
  JS/TypeScript token graph, same-process deterministic render와 token diff 완료 게이트
- 여섯 token artifact atomic batch 교체/rollback과 package self-reference consumer fixture
- lifecycle별 motion property와 container 기반 Project Grid ordered compatibility profile shape 검증

### Changed

- P2 상태를 local `release-candidate`, maturity를 `experimental`로 유지
- token CSS의 source/generator는 `@klipse-design/tokens`가 소유하고 P3 `@klipse-design/css`는 이를
  소비·재export하도록 package 경계를 명확히 함
- P2 Figma 범위를 reviewable proposal까지로 제한하고 published variables/components는 P3로 유지

### Current impact

구조화 source, generated artifact와 private export map은 로컬 RC로 구현됐다. Package public release와
제품 adoption은 `not-ready`이며, Figma proposal 생성은 published library나 Figma 상태 승격의 근거가
아니다. Browser UI, glyph, 접근성, layout과 interaction acceptance도 P3/P5 소비 구현 전까지
`not-ready`다.

## 2026-08-11 — 독립 디자인 시스템 저장소 시작

### Added

- 제품 저장소와 분리된 Klipse Design 모노레포 구조
- strict manifest/schema, generated progress board와 AI 문서
- token, CSS, React package의 정직한 private scaffold
- catalog/LLM drift와 오류 주입 canary를 검증하는 CI gate

### Changed

- Web/Figma 구현 상태를 이 저장소의 실제 상태인 `not-ready`로 초기화
- 제품 route audit과 324건의 과거 debt를 normative catalog에서 분리
- DS release PR과 제품 integration PR을 상호 링크하는 운영 모델로 전환

### Migration

제품 구현은 즉시 바뀌지 않는다. P2 token source와 P3 package가 release된 뒤
[Product Adoption](../governance/migration.md) 절차로 단계적으로 전환한다.
