# @klipse-design/css

**상태:** P3 foundation 구현됨, private, public release 없음

토큰 CSS를 재export하고 opt-in reset과 base 유틸리티를 제공한다. 저작 방식은
[DS-D-0004](../../design/governance/decisions/DS-D-0004-css-authoring.md)가 소유한다.

Token CSS의 source와 generator는 `@klipse-design/tokens`가 P2부터 소유한다. 이 package는 그 결과를
**그대로 재export**할 뿐 같은 token CSS를 다시 생성하거나 별도 정본을 만들지 않는다.

## 배포 파일

| 서브패스 | 내용 |
| --- | --- |
| `./layers.css` | `@layer` 순서 선언만. **root layout 최상단에서 가장 먼저** import한다 |
| `./tokens.css` | 토큰 CSS 재export |
| `./styles.css` | base + 컴포넌트, 언레이어드 |
| `./styles.layer.css` | 같은 내용, `@layer kds.base`/`kds.component` 래핑 |
| `./reset.css` | opt-in reset. `:where()` 기반이라 특이도 0 |

`styles.css`와 `styles.layer.css`를 **동시에 import하지 않는다.** Tailwind를 쓰는 소비자는
`styles.layer.css`를 써야 유틸리티가 라이브러리 스타일을 이긴다.

## 저작 규칙

`packages/css/src`의 원본을 고치고 `pnpm build:css`로 생성한다. 생성물을 직접 수정하지 않는다.
다음은 게이트가 차단한다.

- `!important` — layer 우선순위가 역전돼 소비자가 이길 수 없게 된다
- 숫자 z-index — `var(--kds-layer-*)`만 쓴다
- raw color 리터럴 — semantic 토큰만 쓴다
- primitive 직접 소비 — CSS에는 semantic만 노출된다
- 전역 선택자(`html`/`body`/`*`) — `reset.css` 안에서만 허용

`scripts/verify-css-gates.mjs`가 위 규칙 각각에 대해 위반을 실제로 잡는지 canary로 증명한다.

## 검증

`packages/css/test`의 브라우저 테스트가 계산값과 실제 상호작용을 확인한다 — visually-hidden의
accessible name 보존, focus-visible이 키보드에서만 나타나는지, layer 유틸이 토큰 값을 쓰는지,
closing 상태가 pointer를 놓는지.

제품별 layout이나 scene 스타일은 이 패키지의 책임이 아니다. 공용 primitive로 승격할 때는 두 개
이상의 실제 소비처, 접근성 계약, visual regression 근거가 필요하다.
