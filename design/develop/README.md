---
id: develop-overview
status: beta
authority: normative
---

# Develop

디자인 규범을 제품 코드로 전달하는 패키지 경계와 검증 계약이다.

## Delivery surfaces

| Surface                 | 책임                        | 현재 상태               |
| ----------------------- | --------------------------- | ----------------------- |
| `@klipse-design/tokens` | 구조화 토큰과 플랫폼 변환물 | P2, private, no exports |
| `@klipse-design/css`    | reset, primitives, recipes  | P3, private, no exports |
| `@klipse-design/react`  | 접근 가능한 React 컴포넌트  | P3, private, no exports |
| `design/llms/*`         | AI가 읽는 규범 projection   | P1, generated           |

export가 생기기 전에는 제품에서 package deep import나 source path import를 만들지 않는다.

## 소비 규칙

1. 제품은 명시된 package version을 설치한다.
2. semantic token과 공개 component API만 사용한다.
3. 제품 전용 scene layout은 제품 레포가 소유한다.
4. 공용 규범을 바꿔야 하면 제품 workaround보다 이 저장소의 decision과 package 변경을 먼저 제안한다.
5. DS release PR과 제품 integration PR을 서로 링크한다.

## 생성 파일

`design/llms/*`와 README의 `GENERATED:*` 구간은 직접 수정하지 않는다.

```sh
pnpm build
pnpm verify
```

P2/P3에서 package source가 생기면 각 package의 typecheck, unit, accessibility, visual regression과
bundle/API compatibility 검사를 루트 `verify`에 추가한다.
