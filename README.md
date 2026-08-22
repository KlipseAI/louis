# Klipse Design System

Klipse 제품들이 공통으로 소비하는 디자인 언어와 배포 자산을 관리하는 독립 모노레포다.
[SEED Design](https://seed-design.io/)의 운영 모델처럼 제품 화면 코드와 분리하고, 토큰·컴포넌트·문서·
릴리스 게이트를 한 저장소에서 함께 관리한다.

현재 단계는 **P1 portable contracts + P2 token package 로컬 release-candidate**다. P2에는 DTCG 토큰
정본과 CSS·JavaScript·TypeScript·JSON·Figma 검토안 생성물이 준비됐다. 원격 저장소의 clean-checkout
hosted CI와 repository owner 승인은 이후 승격 조건으로 남겨 두며, public package·제품 적용·published
Figma library는 아직 `not-ready`다. 실제 상태는 [`design/manifest.json`](design/manifest.json)에만
기록한다.

## 저장소 구조

| 경로               | 책임                                  |
| ------------------ | ------------------------------------- |
| `design/`          | 규범 문서, 카탈로그, AI용 생성 문서   |
| `packages/tokens/` | P2 구조화 토큰과 플랫폼 변환물        |
| `packages/css/`    | P3 CSS primitives와 recipes           |
| `packages/react/`  | P3 React 컴포넌트                     |
| `apps/docs/`       | P4 공개 문서 사이트                   |
| `scripts/`         | 카탈로그·AI 문서 생성과 회귀 게이트   |
| `migration/`       | 제품 레포에서 가져온 근거와 이관 경계 |

## 시작하기

```sh
corepack enable
pnpm build
pnpm verify
```

현재 스크립트는 Node 표준 라이브러리만 사용하므로 의존성 설치 없이도 실행된다.

`pnpm verify`는 게이트 26단계 전량이고, 그중 6단계는 제품 저장소(`klipse-web`)를 읽는다.
제품 저장소가 없는 환경에서는 `pnpm verify:ci`(20단계)만 돈다 — hosted CI가 그렇게 돈다.
**따라서 CI 초록은 전량 통과가 아니다.** 배분은 `scripts/verify-gate-split.mjs`가 지킨다.

## 운영 원칙

- 제품은 이 저장소의 버전이 지정된 패키지를 소비한다.
- 제품 전용 scene, route audit, 레거시 CSS는 이 저장소로 가져오지 않는다.
- 변경은 manifest 상태, 규범, 구현, 테스트, release note를 한 PR에서 함께 갱신한다.
- 생성 파일은 `pnpm build`로 만들고 `pnpm verify`로 drift와 누락을 차단한다.

세부 정보는 [Design 문서 진입점](design/README.md)과
[제품 이관 경계](migration/README.md)를 참고한다. Claude Code 후속 작업은
[`CLAUDE.md`](CLAUDE.md)에서 시작하며, 상세 순서와 완료 조건은
[실행 인계서](design/governance/execution-handoff.md)가 소유한다.
