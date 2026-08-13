# @klipse-design/css

**상태:** P3 `planned`, private, no exports

P3에서 reset, CSS primitives와 recipes를 제공한다. Token CSS의 source와 generator는
`@klipse-design/tokens`가 P2부터 소유한다. 이 package는 `@klipse-design/tokens/css`를 소비·재export할 수
있지만 같은 token CSS를 다시 생성하거나 별도 정본을 만들지 않는다.

P2의 실제 projection은 `packages/tokens/generated/tokens.css`이며 단일 DTCG source
`packages/tokens/src/klipse.tokens.json`에서 생성된다. 이는 로컬 RC이지만 package public release가 아니며
P3 CSS package 상태를 올리지 않는다.

현재 import 가능한 export가 없으며 `private: true` 상태다. P2 token artifact가 준비됐다는 이유만으로
이 package 또는 Web component 상태를 올리지 않는다.

제품별 layout이나 scene 스타일은 이 패키지의 책임이 아니다. 공용 primitive로 승격할 때는
두 개 이상의 실제 소비처, 접근성 계약, visual regression 근거가 필요하다.
