---
id: governance-decisions
status: beta
authority: normative
---

# Design Decisions

코드의 다수결로 정할 수 없거나 제품 의미가 갈리는 결정을 기록한다.

## 형식

파일명은 `DS-D-0001-short-title.md` 형식을 사용한다.

```md
# DS-D-0001 결정 제목

- Status: proposed | accepted | superseded | rejected
- Date: YYYY-MM-DD
- Owners: 역할 또는 팀
- Affects: manifest ID 목록

## Context

## Decision

## Alternatives

## Consequences

## Rollout and verification
```

단순 구현 버그, 현재 화면 실측, 조사 로그는 decision이 아니라 audit/debt다. 결정이 accepted되면 같은
변경에서 관련 Foundation·Component·Pattern과 구현을 갱신한다.
