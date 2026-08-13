---
id: governance-releases
status: beta
authority: normative
---

# Releases

디자인 시스템의 사용자 영향 변경을 version과 migration으로 전달한다. 최초 public package 배포
전까지 package는 `private: true`이며, 저장소 [Updates](../updates/README.md)를 release record로
사용한다.

P2 `@klipse-design/tokens`는 private release-candidate로만 검증한다. CSS·JS·TS·JSON artifact와 Figma
proposal이 준비돼도 public registry release, 제품 adoption 또는 published Figma library를 의미하지
않는다. 현재 `0.0.0`은 배포 version이 아니다.

P2 diff는 `packages/tokens/generated/manifest.json`을 `packages/tokens/baseline/manifest.json`과 비교한다.
Baseline은 승인 비교점이지 token source가 아니며, 단일 정본은
`packages/tokens/src/klipse.tokens.json`이다.

## 변경 분류

| 분류  | 예                                               | 요구 사항                               |
| ----- | ------------------------------------------------ | --------------------------------------- |
| Patch | 문서 명확화, 동작을 바꾸지 않는 버그 수정        | Updates 항목, 검증                      |
| Minor | additive token, variant, component API           | 사용법, tests, adoption note            |
| Major | token rename/removal, API/behavior contract 변경 | decision, migration, deprecation window |

Token diff는 additive, stable ID/mode 제거, source-path-only move, type/unit, mode, raw/resolved value,
semantic alias target, description/deprecation, layer order와 Figma collection 변경을 구분한다. 공개 ID
rename은 새 ID 추가와 기존 ID 제거이며 가능한 경우 deprecated replacement window를 먼저 제공한다. Contrast
pair, motion/reduced-motion, responsive profile 같은 공용 root metadata 변경도 behavior breaking으로 검토한다.
이름이 유지돼도 semantic 결과나 interaction order가 달라지면 consumer impact에 따라 Minor 또는 Major로
판정한다.

package 배포가 시작되면 workspace package version을 독립적으로 올릴지 fixed version을 사용할지
Design Decision으로 확정한다. 확정 전에는 가짜 version이나 changelog를 만들지 않는다.

## Release gate

- manifest와 실제 package exports 일치
- normative docs와 generated docs 최신
- tests, accessibility, compatibility 통과
- repository-supported DTCG subset/Klipse extension, alias graph, mode completeness, contrast, layer,
  motion/responsive profile, primitive/semantic metadata projection, CSS selector/theme와 JS/TypeScript token-graph
  parity 통과
- clean-checkout hosted CI에서 반복 생성 결과가 byte-for-byte 동일
- Figma proposal과 published library 상태를 구분해 기록
- consumer impact와 rollback 기록
- breaking change migration과 owner 승인
