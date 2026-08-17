---
id: get-started
status: beta
authority: normative
---

# Klipse Design

Klipse 제품군이 공통으로 소비하는 디자인 언어다. 접근성·상태·반응형·콘텐츠 품질을 규범으로
정의하고, 토큰과 컴포넌트를 버전이 지정된 패키지로 배포한다.

## 시작하기

| 작업                     | 먼저 읽을 문서                                       |
| ------------------------ | ---------------------------------------------------- |
| 색·타입·간격·접근성 결정 | [Foundations](foundations/README.md)                 |
| 공용 UI를 찾거나 추가    | [Components](components/README.md)                   |
| 반복되는 제품 흐름 구현  | [Patterns](patterns/README.md)                       |
| 문구·로컬라이제이션      | [Content](content/README.md)                         |
| 패키지 소비와 검증       | [Develop](develop/README.md)                         |
| 변경 제안과 리뷰         | [Contributing](governance/contributing.md)           |
| 역할·승인·운영 주기      | [Operating Model](governance/operating-model.md)     |
| 제품 레포 적용           | [Product Adoption](governance/migration.md)          |
| 단계별 완료 조건         | [Roadmap](governance/roadmap.md)                     |
| Claude Code 후속 실행    | [Execution Handoff](governance/execution-handoff.md) |
| 사용자 영향 변경         | [Updates](updates/README.md)                         |

## 권위 모델

문서나 구현이 충돌하면 다음 순서로 판단한다.

1. **Catalog** — [`manifest.json`](manifest.json)이 ID, maturity, Web/Figma/Docs 상태와 생성물
   provenance를 소유한다.
2. **Normative** — `foundations/`, `components/`, `patterns/`, `content/`,
   `governance/`가 새 작업의 행동·상태·수용 조건을 정의한다.
3. **Package source** — P2 이후 `packages/tokens`, `packages/css`, `packages/react`의
   테스트된 source가 배포 값과 API를 소유한다.
4. **Generated** — `design/llms/*`는 위 정본의 projection이며 직접 편집하지 않는다.

소비 제품의 route audit, legacy CSS, 화면별 예외는 이 저장소의 정본이 아니다. 필요하면
stable manifest ID를 참조하는 제품 통합 이슈로 관리한다.

## 현재 상태

P1 규범·게이트와 P2 토큰 패키지가 각각 로컬 release-candidate다. 토큰 정본과 여섯 생성물은
`experimental`로 준비됐지만 public package release, 제품 적용, React/CSS component 구현과 published
Figma library는 아직 `not-ready`다. 시스템 전체 maturity도 `experimental`이다.

## Maturity lifecycle

| 상태           | 의미                                              | 승격·사용 규칙                                            |
| -------------- | ------------------------------------------------- | --------------------------------------------------------- |
| `experimental` | 계약이나 API가 검증 중                            | breaking change 가능, production 기본값으로 권장하지 않음 |
| `beta`         | 규범과 핵심 검증이 준비됨                         | 제한된 adoption 가능, breaking change에는 migration 필요  |
| `stable`       | Web/Figma/Docs와 실제 제품 adoption 근거가 준비됨 | compatibility와 deprecation 정책 보장                     |
| `legacy`       | 과거 소비처만 유지                                | 신규 사용 금지, 대체 경로 준비                            |
| `deprecated`   | 제거가 예정됨                                     | 대체 항목, 제거 version, owner 필수                       |

<!-- prettier-ignore-start -->
<!-- GENERATED:catalog START -->
| 항목 | 현재 값 |
| --- | --- |
| System maturity | `experimental` |
| Normative documents | 59 |
| Generated documents | 5 |
| Components | 11 |
| Patterns | 4 |
| Web done | 0 |
| Token artifacts done | 6/6 |
| Figma library | `not-ready` |
| Package release | `not-ready` |
<!-- GENERATED:catalog END -->
<!-- prettier-ignore-end -->

## 로컬 명령

```sh
pnpm build
pnpm check
pnpm verify
```

`verify`는 정상 입력 검사뿐 아니라 고의로 오류를 주입해 게이트가 실제로 실패하는지도 확인한다.
