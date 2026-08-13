---
id: governance-releases
status: beta
authority: normative
---

# Releases

디자인 시스템의 사용자 영향 변경을 version과 migration으로 전달한다. 최초 public package 배포
전까지 package는 `private: true`이며, 저장소 [Updates](../updates/README.md)를 release record로
사용한다.

## 변경 분류

| 분류  | 예                                               | 요구 사항                               |
| ----- | ------------------------------------------------ | --------------------------------------- |
| Patch | 문서 명확화, 동작을 바꾸지 않는 버그 수정        | Updates 항목, 검증                      |
| Minor | additive token, variant, component API           | 사용법, tests, adoption note            |
| Major | token rename/removal, API/behavior contract 변경 | decision, migration, deprecation window |

package 배포가 시작되면 workspace package version을 독립적으로 올릴지 fixed version을 사용할지
Design Decision으로 확정한다. 확정 전에는 가짜 version이나 changelog를 만들지 않는다.

## Release gate

- manifest와 실제 package exports 일치
- normative docs와 generated docs 최신
- tests, accessibility, compatibility 통과
- consumer impact와 rollback 기록
- breaking change migration과 owner 승인
