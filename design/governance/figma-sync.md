---
id: governance-figma-sync
status: experimental
authority: normative
---

# Figma Sync Governance

Figma와 코드는 서로를 자동으로 덮어쓰는 두 정본이 아니다. 승인된 design decision을 중심으로
token과 component parity를 검토하며, 자동 sync가 구현되기 전까지 상태를 과장하지 않는다.

## 현재 상태

- published Klipse Design library: `not-ready`
- P2 token/Figma proposal pipeline: local `release-candidate`
- generated proposal: `packages/tokens/generated/figma.tokens.json` — `done`, not published
- component parity checker: `not-ready`
- snapshot import/export: `not-ready`

P2는 review 가능한 proposal까지만 소유한다. 실제 library evidence가 생길 때까지 manifest의 Figma 상태는
`not-ready`다.

## P2 proposal contract

- `packages/tokens/src/klipse.tokens.json`의 안정 token ID, type, mode, alias와 description을 보존한다.
- `scripts/lib/token-model.mjs`가 proposal의 primitive/semantic token, raw/resolved value, alias,
  description/deprecation과 root metadata를 JS·JSON·manifest와 같은 normalized graph에서 검증한다. CSS는
  같은 graph의 semantic consumption surface다.
- TypeScript declaration은 별도로 JavaScript export와 token ID/type/mode/alias/value-shape contract를
  맞춘다.
- Figma collection, mode와 variable name 변환을 명시하고 이름 충돌을 build error로 처리한다.
- Figma가 composite typography, shadow, easing이나 runtime layer를 완전히 표현하지 못하면 field expansion과
  loss metadata를 포함한다.
- 이전 proposal과의 diff는 create, stable ID/mode remove, source-path-only move, value/alias change, mode change,
  description/deprecation과 collection change를 구분한다. 공개 ID rename은 create + deprecated replacement +
  remove 순서로 다룬다.
- proposal은 credential 없이 CI에서 생성·검증할 수 있어야 하며 자동 publish하지 않는다.

## 목표 흐름

1. P2 구조화 token source에서 Figma-compatible proposal을 생성한다.
2. proposal은 자동 적용하지 않고 token maintainer와 design maintainer가 diff를 review한다.
3. P3에서 승인된 proposal을 library draft에 적용하고 stable variable key를 기록한다.
4. 이름, mode, alias, component property와 variant parity를 검사한다.
5. 승인한 Figma change와 code change를 같은 DS release에 연결한다.
6. 제품 screen은 published library component instance를 소비하고 detach 이유를 제품 이슈에 기록한다.

## 승격 조건

P2 private release-candidate와 proposal만으로는 `figma: not-ready`를 유지한다.
`figma: partial`에는 review 가능한 P3 library draft와 stable variable/component key가 필요하다.
`figma: done`에는 published library, token/variant parity check, usage guidance와 owner가 필요하다.

credential이나 plugin session이 없는 CI에서도 catalog가 정직해야 하므로, Figma 연결 실패를
`done`으로 캐시하지 않는다.
