---
id: develop-overview
status: beta
authority: normative
---

# Develop

디자인 규범을 제품 코드로 전달하는 패키지 경계와 검증 계약이다.

## Delivery surfaces

| Surface                 | 책임                                                | 현재 상태                                               |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| `@klipse-design/tokens` | 구조화 토큰과 CSS·JS·TS·JSON·Figma proposal         | P2 local RC, `experimental`, private, no public release |
| `@klipse-design/css`    | token CSS 재export, opt-in reset, base 유틸리티     | P3 foundation 구현, private, no public release          |
| `@klipse-design/react`  | 접근 가능한 React 컴포넌트                          | 컴포넌트 20종, 서브패스 3(`.` · `./icons` · `./icons/manifest.json`). 공개 심볼 58 · 타입 95. **private, 미배포** |
| `design/llms/*`         | AI가 읽는 규범 projection                           | P1, generated                                           |

Public release 전에는 제품에서 package import, generated deep import나 source path import를 만들지 않는다.

## P2 token delivery contract

`@klipse-design/tokens`의 로컬 RC는 다음 private export를 검증한다.

| Import                           | Source artifact                                                               | 상태                         |
| -------------------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| `@klipse-design/tokens`          | `packages/tokens/generated/index.js`와 `packages/tokens/generated/index.d.ts` | local RC                     |
| `@klipse-design/tokens/css`      | `packages/tokens/generated/tokens.css`                                        | local RC                     |
| `@klipse-design/tokens/json`     | `packages/tokens/generated/tokens.json`                                       | local RC                     |
| `@klipse-design/tokens/figma`    | `packages/tokens/generated/figma.tokens.json`                                 | done proposal, not published |
| `@klipse-design/tokens/manifest` | `packages/tokens/generated/manifest.json`                                     | local RC                     |

모든 artifact는 DTCG 2025.10-compatible 단일 source `packages/tokens/src/klipse.tokens.json`에서 생성하며
`generated/`를 직접 수정하지 않는다. `scripts/lib/token-model.mjs`가 이 저장소가 지원하는 DTCG subset과
Klipse extension validation, projection model을 소유하고 `packages/tokens/baseline/manifest.json`은 diff
비교점만 소유한다. Figma proposal은 review 입력이지 published library나 제품 runtime API가 아니다.

CSS는 제품 소비용 semantic custom property만 projection한다. Package root JS와 token graph JSON, Figma
proposal, manifest는 검증·도구화를 위해 primitive/semantic graph와 provenance를 함께 보존한다. 제품 코드는
primitive를 직접 소비하지 않는다. `index.d.ts`는 JavaScript export surface뿐 아니라 안정 token ID,
token별 type·mode·alias target과 DTCG value shape를 선언한다. Token별 실제 raw/resolved 값은 runtime data이며
literal value union으로 고정하지 않는다.

P3 `@klipse-design/css`는 `@klipse-design/tokens/css`를 소비·재export할 수 있지만 token generator나 별도
token value를 소유하지 않는다. Reset, primitive와 recipe가 CSS package의 고유 책임이다.

## 소비 규칙

1. 제품은 public release 뒤 명시된 package version을 설치한다. P2 private release-candidate를 production
   dependency로 사용하지 않는다.
2. semantic token과 공개 component API만 사용하고 raw primitive나 source path를 import하지 않는다.
3. 제품 전용 scene layout은 제품 레포가 소유한다.
4. 공용 규범을 바꿔야 하면 제품 workaround보다 이 저장소의 decision과 package 변경을 먼저 제안한다.
5. DS release PR과 제품 integration PR을 서로 링크한다.

## 생성 파일

`design/llms/*`와 README의 `GENERATED:*` 구간은 직접 수정하지 않는다.

```sh
pnpm build
pnpm verify
```

루트 `check`/`verify`는 repository-supported DTCG subset/Klipse extension validation, alias graph, mode
completeness, contrast, motion property, responsive profile shape, primitive/semantic metadata projection,
CSS selector/theme output, 같은 process의 deterministic render, JS/d.ts token-graph compatibility와 generated
drift를 검사한다. P3에서는 각 CSS/React package의 unit, accessibility, visual regression과 bundle
compatibility를 추가한다.
