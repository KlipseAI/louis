# 이식 번들 보존본 (2026-08-07 스냅샷)

`~/klipse-design-transplant` 는 **git 저장소가 아니었다.** 원격도 백업도 없이 한 대의 맥에만
있었다. 계정을 옮기면 그대로 사라진다 — 그래서 2026-08-22 에 여기로 옮겼다.

옮긴 것은 **번들에만 있던 것**뿐이다. 그 판단은 짐작이 아니라 전수 대조로 했다.

| 번들 파일 | KDS 이관 상태 | 여기 있는 이유 |
| --- | --- | --- |
| `patterns.txt` (3,304줄) | **이관 완료** — `migration/legacy-design-system.md` 에 사실상 축자. 없는 줄 33개 중 20개가 헤딩 레벨(`##`→`###`), 나머지는 파일 헤더와 의도적 정정 | 옮기지 않음 (중복) |
| `foundations.txt` | 토큰 255개 중 KDS 어디에도 없는 것 **7개** | 그 7개 때문에 보존 |
| `tokens.yaml` | 구체값 118개 미적중 **0** | 생성 계보 기록용 |
| `KNOWN-ERRORS.md` | 구체값 126개 중 미적중 **1** | **정정 서사** 보존용 (아래) |
| `DESIGN_SYSTEM.md` · `components.*` · `skill-references/` | 97~100% | 옮기지 않음 (중복) |
| `wip-page-specs/` 본체 | 94~100% — 이 디렉터리 상위에 이미 있다 | 옮기지 않음 (중복) |
| `wip-page-specs/verification-runs/*.json` (4.6MB) | 0% | **옮기지 않음** — 2026-08 워크플로 실행 로그이고 설계 데이터가 아니다. 그 맥에서만 존재하다 사라진다 |
| 8/7 패치 3종 · tgz 2종 | 이미 적용됨 | 옮기지 않음 |

## `KNOWN-ERRORS.md` 를 왜 남기나

`patterns.txt` §6 의 주장 705건을 배포본과 대조해 **96건이 사실과 다름**을 적은 정오표다.
그 정정들은 **문서로 복사된 게 아니라 값에 적용됐다** — 예컨대 `4.5rem = 45px` 는
`migration/legacy-design-system.md:130` 에서 54px 로 고쳐졌고 정정 사유까지 인라인으로 붙어 있다.
후속 규범 문서는 [product-reading-traps](../../../design/foundations/product-reading-traps.md) 와
[product-confirmations](../../../design/governance/product-confirmations.md) 다.

그럼에도 남기는 이유는 **「무엇이 왜 틀렸었나」의 서사**가 값만으로는 복원되지 않기 때문이다.
정오표는 「좌표를 믿지 말고 값을 믿어라」 같은 읽기 규칙과, 낡은 좌표 124건의 존재를 기록한다.

## 이 번들의 낡음

**2026-08-07 스냅샷이고 제품 정본은 `klipse-web` 의 `design` 브랜치다.** 번들이 배포본으로
삼은 것은 `origin/main`(`a9ead58b`)이라 두 세대 낡은 서술이 있다. 대표적으로 번들은
`--glass-dropdown-frame` 을 5겹이라고 적지만, 제품은 그 계열을 **걷어냈고** 지금은
`--dropdown-frame` 0.5px 헤어라인 한 겹이다
([elevation-layer](../../../design/foundations/elevation-layer.md) 「글래스는 폐지됐다」가 정본).

**여기 있는 값을 현재 값의 근거로 인용하지 마라.** 이 디렉터리는 계보와 서사의 보존이지
값의 권위가 아니다.

## KDS 안에서 이 번들이 단독 근거인 것

`saturate(120%)` 를 동반한 backdrop-blur **12계단 통합표**는 규범/화면 문서에 재조립되지
않았고, KDS 안에서는 `migration/legacy-design-system.md:896-912` 와 `:2420` 이 단독 근거다.
그 파일을 폐기 대상으로 취급하면 그때 실제 손실이 난다.
