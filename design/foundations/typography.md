---
id: foundation-typography
status: experimental
authority: normative
---

# Typography

Typography는 글꼴 크기 목록이 아니라 정보 위계, 읽기 흐름, locale fallback과 확대 수용 조건을 함께
정의한다. P2 source와 projection은 로컬 release-candidate다. Public package API와 제품 adoption은 아직
`not-ready`다.

## Source and artifacts

| 구분           | 계약 경로                                     | 현재 상태               |
| -------------- | --------------------------------------------- | ----------------------- |
| DTCG source    | `packages/tokens/src/klipse.tokens.json`      | local release-candidate |
| Validator      | `scripts/lib/token-model.mjs`                 | local release-candidate |
| CSS            | `packages/tokens/generated/tokens.css`        | done projection         |
| JavaScript     | `packages/tokens/generated/index.js`          | done projection         |
| TypeScript     | `packages/tokens/generated/index.d.ts`        | done projection         |
| Resolved JSON  | `packages/tokens/generated/tokens.json`       | done projection         |
| Figma proposal | `packages/tokens/generated/figma.tokens.json` | done, not published     |
| Manifest       | `packages/tokens/generated/manifest.json`     | done projection         |
| Diff baseline  | `packages/tokens/baseline/manifest.json`      | local release-candidate |

Primitive와 semantic typography는 단일 DTCG source 안의 논리적 계층이며 별도 정본 파일이 아니다.

## Token model

- primitive는 font family, weight, size, line-height와 letter-spacing 재료를 소유한다.
- semantic role은 display, title, heading, body, label, caption, code처럼 사용 목적을 소유한다.
- semantic typography는 필요한 primitive field를 묶는 composite contract다.
- 컴포넌트가 임의 size/weight 조합을 새 role처럼 만들지 않는다.
- source의 dimension은 값과 unit을 명시하며 generator가 px/rem을 추측하지 않는다.

## Locale and font loading

- P2 source는 공용 multi-script fallback 후보를 ordered font-family 배열로 보존한다. Validator는 trim된
  non-empty string 배열과 typography composite 구조를 검사하며 실제 script별 glyph 지원을 증명하지 않는다.
- locale별 font 선택, asset 제공과 실제 glyph coverage 검증은 소비 환경이 소유하며 P3/P5 전에는 완료로
  간주하지 않는다.
- fallback은 weight와 glyph coverage가 없는 font를 무조건 첫 순서에 두지 않는다.
- webfont 로딩 전후에도 button, navigation, card title과 dialog action이 잘리거나 순서가 바뀌지 않아야
  한다.
- 숫자, timestamp, code처럼 정렬 안정성이 필요한 role은 별도 요구를 선언한다.
- 제품별 branding font는 공용 role의 접근성과 fallback 계약을 만족할 때만 alias target으로 제안한다.

## Responsive and inclusive behavior

- 200% text zoom에서도 핵심 정보와 action이 사라지지 않는다.
- line-height를 고정 box 높이로 상쇄하지 않는다.
- 긴 KO/EN/JA 문구에서 truncation은 정보 우선순위와 대체 접근 경로가 있을 때만 허용한다.
- font size만으로 heading semantics를 대신하지 않는다.
- 사용자가 브라우저 기본 크기를 바꿨을 때 semantic hierarchy가 유지되어야 한다.

## Platform mapping

- CSS는 font family, size, weight, line-height, letter-spacing을 안정된 semantic custom property로 생성한다.
- JavaScript와 resolved JSON은 composite field와 unit을 보존한다. TypeScript declaration은 안정 token ID,
  type·mode·alias target, `TypographyValue`와 nested dimension value 구조, primitive/semantic container를
  선언한다. Token별 실제 resolved 숫자와 문자열은 runtime data이며 literal value union으로 고정하지 않는다.
- Figma proposal에서 native variable로 표현할 수 없는 composite는 field별 mapping과 loss metadata를
  포함한다.
- platform 변환이 의미를 잃으면 조용히 근사하지 않고 build warning 또는 error로 분류한다.

## Acceptance tests

P2 local RC는 아래의 구조·생성 검사를 자동화한다.

- schema가 허용되지 않은 weight, unit과 불완전한 composite를 거부한다.
- 모든 semantic role이 필요한 field를 빠짐없이 resolve한다.
- CSS의 semantic field projection과 JS·JSON·Figma proposal·manifest의 primitive/semantic composite가
  normalized model과 일치하고 TypeScript가 해당 ID/type/value shape를 선언한다.
- Figma가 composite를 직접 표현하지 못하면 field mapping과 loss metadata를 제공한다.
- 같은 process에서 동일 source를 반복 render한 결과가 byte-for-byte 동일하다.

다음은 P3/P5 소비 구현 게이트이며 아직 `not-ready`다.

- KO/EN/JA별 실제 fallback 순서, font asset과 glyph coverage 근거가 준비되어 있다.
- 320px container, 200% zoom과 긴 KO/EN/JA fixture에서 핵심 label/action이 잘리지 않는다.
- font loading 전후의 주요 layout shift가 승인된 기준을 넘지 않는다.
