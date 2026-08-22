# Claude Code entry point

이 파일은 Claude Code Opus 5를 위한 얇은 진입점이다. 디자인 시스템의 정본이나 상태표가 아니며,
상세 실행 계약은 저장소의 규범 문서가 소유한다.

## 매 세션의 필수 읽기 순서

1. [`AGENTS.md`](AGENTS.md)
2. [`design/manifest.json`](design/manifest.json)
3. [`design/governance/execution-handoff.md`](design/governance/execution-handoff.md) — 작업 큐와 완료
   조건
4. [`design/governance/execution-playbook.md`](design/governance/execution-playbook.md) — 선택한 작업의
   상세 절차와 환경 게이트
5. 현재 작업과 직접 관련된 Foundation, Component, Pattern, Governance 문서
6. [`design/updates/README.md`](design/updates/README.md)

하위 디렉터리에 `AGENTS.md`가 생기면 해당 경로를 읽거나 수정하기 전에 함께 읽는다.

## 임무

Klipse Design을 SEED Design처럼 제품 저장소와 분리된, 버전이 지정되고 검증 가능한 디자인 시스템으로
운영한다. SEED의 코드를 복제하는 것이 아니라 단일 정본, 생성 파이프라인, 패키지 경계, 접근 가능한
컴포넌트, 검색 가능한 문서, Figma parity, 단계적 제품 adoption이라는 운영 원리를 Klipse 규모에 맞게
구현한다.

## 작업 선택

- `execution-handoff.md`의 작업 큐에서 의존성이 충족된 가장 앞의 항목을 선택한다.
- 원격 저장소와 hosted CI는 2026-08-18에 생겼다(`.github/workflows/ci.yml`, push·PR 트리거).
  **CI가 도는 것은 `pnpm verify:ci` 이지 `pnpm verify` 가 아니다** — 게이트 26개 중 **13개**는
  제품 저장소를 읽어야 해서 러너에서 돌 수 없다. 배분은 `scripts/verify-gate-split.mjs` 가
  지킨다. 그러므로 **CI 초록은 게이트 13개가 통과했다는 뜻이지 전량 통과가 아니다.**
  나머지 13개는 제품 저장소가 있는 로컬에서 `pnpm verify` 로만 증명된다.
  푸시 전에 로컬 `pnpm verify` 와 `pnpm clean-room` 을 돈다.
- 외부 권한이 필요한 publish와 Figma library 공개는 `not-ready`로 남기고 다음 독립 작업을 진행한다.
- 구현 상태는 추측하지 않는다. 실제 상태는 항상 manifest와 검증 근거로 판정한다.

## 변경 규칙

- generated 파일과 generated 구간을 직접 수정하지 않는다.
- 규범, manifest, 구현, 테스트, Updates를 같은 변경 단위에서 일치시킨다.
- 제품 전용 화면 코드와 과거 UI 부채를 이 저장소의 공용 규범으로 복사하지 않는다.
- 새 의존성이나 package architecture는 먼저 Decision으로 선택 기준과 rollback을 기록한다.
- `web: done`, `figma: done`, `stable`은 인계서의 증거 조건을 모두 충족할 때만 사용한다.
- 안전하고 되돌릴 수 있는 로컬 작업은 자율적으로 끝까지 진행한다. 자격 증명, 외부 publish, 파괴적
  migration처럼 새 권한이 필요한 단계만 차단 사유로 남긴다.

## 인계 전 검증

```sh
pnpm build
pnpm check
pnpm verify
git diff --check
```

마지막 보고에는 변경 파일, 사용자에게 달라진 계약, 실행한 검증, 남은 위험과 다음 작업 ID를 포함한다.
