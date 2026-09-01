---
id: governance-operating-model
status: beta
authority: normative
---

# Operating Model

Klipse Design은 문서 모음이 아니라 제품이 소비하는 계약과 배포 자산을 승인·추적하는 운영 체계다.
전담 팀이 지정되기 전까지 `repository-owner`가 최종 승인 책임을 가진다.

## 소유권

| 자산                | 정본                                  | 책임                       |
| ------------------- | ------------------------------------- | -------------------------- |
| Catalog와 상태      | `design/manifest.json`                | repository owner           |
| 행동·사용 규범      | `design/` normative docs              | component/pattern proposer |
| Token values        | `packages/tokens/src/` (P2)           | token maintainer           |
| Web API             | `packages/css`, `packages/react` (P3) | package maintainer         |
| Figma library       | LOUIS Figma 파일의 library 계층 (P3) — 게시는 정본의 조건이 아니다([DS-D-0035](decisions/DS-D-0035-figma-done-without-publish.md)) | design maintainer |
| 제품 route evidence | 각 소비 제품 저장소                   | product owner              |
| Generated docs      | build scripts                         | generator owner            |

## 승인

- typo나 링크 수정: 1 reviewer.
- additive token/component/pattern: owner 또는 지정 maintainer 1명.
- breaking API, token rename, accessibility contract 변경: owner + 영향 제품 owner.
- maturity를 `stable`로 승격: Web/Figma/Docs 근거와 실제 소비 제품 adoption evidence가 모두 필요하다.

## 저장소 간 변경

1. 디자인 시스템 PR에서 규범, 구현, 테스트, version과 migration을 승인한다.
2. release 또는 immutable commit을 만든다.
3. 제품 integration PR이 해당 version과 manifest ID를 참조한다.
4. 제품 route test 결과를 integration PR에 남긴다.
5. 문제가 공용 계약이면 DS 이슈로, 제품 composition 문제면 제품 이슈로 분류한다.

하나의 PR에서 두 저장소를 동시에 바꿀 수 있다는 전제에 의존하지 않는다.

## 운영 주기

- PR마다 catalog/generator gate 실행.
- 월 1회 `not-ready`, `partial`, deprecated 항목과 adoption blocker review.
- 분기 1회 accessibility, package API, Figma parity와 docs discoverability review.
