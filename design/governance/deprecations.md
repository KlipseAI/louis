---
id: governance-deprecations
status: beta
authority: normative
---

# Deprecations

폐기는 파일을 조용히 방치하는 상태가 아니다. 대체 경로, 신규 사용 금지, 영향 범위, 제거 version과
owner를 공개한다.

## 정책

- deprecated 항목은 manifest, 원문, public API annotation과 Updates에 표시한다.
- 대체 항목 또는 범위 밖인 이유를 명시한다.
- 신규 예제와 AI 문서의 권장 경로에서 제외한다.
- 최소 한 migration window를 제공한다. 긴급 보안·접근성 결함은 예외 사유를 기록한다.
- 제거 전 제품 저장소의 참조가 0건임을 확인한다.

## Token deprecation

- token rename은 가능한 경우 같은 type과 mode를 유지하는 deprecated alias를 제공한다.
- alias target, type/unit, mode 또는 layer order가 바뀌면 이름이 같아도 migration impact를 기록한다.
- deprecated alias는 기본 문서와 신규 Figma proposal의 권장 경로에서 제외하되 validation과 migration
  metadata에는 남긴다.
- public release 뒤 최소 한 migration window가 지나고 소비 제품 참조가 0건일 때만 제거한다.
- `packages/tokens/generated/manifest.json`과 `packages/tokens/baseline/manifest.json`의 diff에서 제거와
  deprecated alias를 확인한다. Baseline을 편집해 제거 기록을 숨기지 않는다.
- P2 이전 제품 CSS 이름은 자동으로 DS deprecation 항목이 되지 않는다. 먼저 legacy→semantic mapping을
  검토하고 public DS contract로 실제 제공한 항목만 이 정책을 적용한다.

## 활성 항목

| 항목 | 종류 | 대체 | 시작 | 제거 조건 | 근거 |
| --- | --- | --- | --- | --- | --- |
| `elevation-focus-ring` | semantic token · Figma effect style `elevation/focus-ring` | 없다 — 포커스 링을 그리지 않는다 | 2026-10-06 | 한 migration window 뒤 제품 · 문서 사이트 참조 0 | [DS-D-0074](decisions/DS-D-0074-focus-ring-removed.md) |
| `shadow-focus-ring` | primitive token | 없다 | 2026-10-06 | 위와 같다 | [DS-D-0074](decisions/DS-D-0074-focus-ring-removed.md) |

**`.louis-focus-ring` 클래스는 window 없이 없앴다.** 붙여 둔 소비처에 남는 결과가 「링 없음」이고
그것이 결정이 원하는 결과라 깨지는 화면이 없다. 같은 이유로 deprecated alias 를 두지 않았다.

monolith 제품의 legacy 폐기 항목은 제품 저장소가 계속 소유한다.
