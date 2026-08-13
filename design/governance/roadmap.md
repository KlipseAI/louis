---
id: governance-roadmap
status: beta
authority: normative
---

# Roadmap

목표는 문서 수가 아니라 제품이 versioned design contract를 안전하게 소비하게 만드는 것이다.

## P1 — Portable contracts

**상태:** `release-candidate`

완료:

- 독립 catalog/schema와 권위 모델
- responsive layout, app shell, project grid, editor workspace 계약
- Button, Menu/Popover, Dialog, Loading 규범
- manifest 기반 progress board와 AI 문서
- 오류 주입 canary가 있는 독립 gate

`complete` 조건:

- 별도 저장소 첫 추적 commit
- clean checkout CI 통과
- repository owner 승인

## P2 — Token source inversion

**상태:** `planned`

- Color, typography, spacing, radius, elevation, motion schema
- light/dark semantic alias graph
- CSS/TypeScript/Figma deterministic output
- token diff와 breaking migration

## P3 — Components and Figma library

**상태:** `planned`

- Button → Menu/Popover → Dialog 순으로 public implementation
- keyboard/focus/accessibility tests
- CSS/React package API와 compatibility policy
- published Figma variables/components와 parity check

## P4 — Documentation and distribution

**상태:** `planned`

- 검색 가능한 공개 docs site
- isolated examples와 version badge
- stable `llms.txt` URLs
- changelog, deprecation, migration discoverability

## P5 — Product adoption

**상태:** `planned`

- Klipse product가 versioned packages 소비
- Home/Highlight/Editor 핵심 route integration evidence
- legacy UI 신규 참조 차단
- adoption과 rollback dashboard
