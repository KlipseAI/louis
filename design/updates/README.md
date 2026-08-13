---
id: updates-overview
status: beta
authority: normative
---

# Updates

디자이너와 개발자가 알아야 할 사용자 영향 변경과 migration을 최신순으로 기록한다.

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
