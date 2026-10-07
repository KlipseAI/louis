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

## 행간의 단위

행간은 이 저장소에서 **두 가지 형태**로 산다. 어느 쪽인지는 **이름이 말한다.**

| 형태 | 어디에 | 값의 뜻 | 예 |
| --- | --- | --- | --- |
| 비율 | composite `typography-*` 의 `line-height` field | CSS 무단위 배수 | `--louis-typography-body-sm-regular-line-height: 1.5` |
| percent | `line-height/percent-*` · `type-line-height-percent/*` | Figma PERCENT 단위 | `--louis-type-line-height-percent-body-14: 150` |

**percent 축이 따로 있는 이유는 Figma다.** Figma는 텍스트 행간을 `lineHeightPercent`로 보관하며,
그 속성에 묶이는 변수는 1.5가 아니라 150이어야 한다. 두 형태는 같은 값의 두 표현이고 100배로
환산된다.

**percent 값을 CSS `line-height`에 그대로 넣지 않는다.** `line-height: 150`은 글자 크기의 150배다.
CSS에서 행간이 필요하면 composite의 비율 field를 쓴다. percent 토큰을 CSS에서 쓸 일이 생기면
`calc(<percent> / 100)`으로 환산하고, 그 자리를 규범에 적는다.

**percent를 뜻하는 토큰은 이름에 `percent`를 담는다.** 담지 않은 행간 토큰은 비율이다. 이 규칙이
서기 전에는 `type-line-height/body-14`가 150을 담고 있었고, 이름만 보고 CSS에 넣으면 즉시 깨졌다 —
[DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md).

**행간 변수의 Figma scope는 `LINE_HEIGHT`다.** proposal의 scope가 비면 `apply-variables`가 그 줄을
건너뛰어 Figma 기본값 `ALL_SCOPES`가 남는다 — 안 뜨는 것이 아니라 **모서리 반경·간격 선택기에까지
뜬다.** 좁히는 것이 이 규칙의 목적이다
([DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md)).

## Locale and font loading

- **글꼴 교체 지점은 하나다(DS-D-0009 1항, 2026-10-07).** `--louis-font-family-sans` 가 스택을 갖고 모든 typography 토큰의
  `-font-family` 가 그것을 `var()` 로 읽는다. 소비자가 글꼴을 바꾸거나 로케일별 스택을 쓰려면 문서 루트에서 그 한 줄만 덮는다 —
  예: `html[lang="ja"] { --louis-font-family-sans: <JA 스택>; }`. 조합 토큰 열여섯을 하나씩 덮지 않는다(제품 랜딩 작업 브랜치가 일본어
  화면에서 그렇게 덮고 있었다). **루트에서 덮는다** — 조합 토큰은 `:root` · `[data-theme]` 에서 선언되므로 더 깊은 요소에서
  바꾼 값은 보지 못한다.
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
  포함한다. semantic `typography-*`는 text style로, primitive `type-style-*`는 미표현으로 분류한다
  ([DS-D-0007](../governance/decisions/DS-D-0007-figma-library-structure.md)).
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
