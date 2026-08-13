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
- variable/token pipeline: `not-ready`
- component parity checker: `not-ready`
- snapshot import/export: `not-ready`

따라서 manifest의 Figma 상태는 실제 library evidence가 생길 때까지 `not-ready`다.

## 목표 흐름

1. 구조화 token source에서 Figma-compatible proposal을 생성한다.
2. proposal은 자동 적용하지 않고 diff로 review한다.
3. 이름, mode, alias, component property와 variant를 검사한다.
4. 승인한 Figma change와 code change를 같은 DS release에 연결한다.
5. 제품 screen은 library component instance를 소비하고 detach 이유를 제품 이슈에 기록한다.

## 승격 조건

`figma: partial`에는 review 가능한 library draft와 stable component key가 필요하다.
`figma: done`에는 published library, token/variant parity check, usage guidance와 owner가 필요하다.

credential이나 plugin session이 없는 CI에서도 catalog가 정직해야 하므로, Figma 연결 실패를
`done`으로 캐시하지 않는다.
