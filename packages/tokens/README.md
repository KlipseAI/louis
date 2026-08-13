# @klipse-design/tokens

**상태:** P2 local `release-candidate`, `experimental`, private, no public release

이 패키지는 primitive/semantic token의 구조화 원본과 CSS·JavaScript·TypeScript·JSON·Figma proposal을
소유한다.

단일 DTCG 2025.10-compatible source, repository subset validator, 여섯 projection과 private export map은 로컬
RC로 구현되어 있다.
Package는 아직 public release가 아니므로 제품 dependency로 사용할 수 없다. 기존 제품 CSS에서 역생성한
값은 새 정본이 아니며 의미 검토 없이 이 패키지에 복사하지 않는다.

## Ownership boundary

- P2 `@klipse-design/tokens`가 token source, schema, generator와 모든 platform artifact를 소유한다.
- P3 `@klipse-design/css`는 token CSS를 다시 생성하지 않는다. 이 package의 CSS export를 소비·재export하고
  reset, primitive와 recipe를 추가한다.
- P2 Figma 산출물은 reviewable proposal이다. published Figma variables/components와 library parity는 P3다.
- P2 범위는 private release-candidate까지다. public version, registry 배포와 제품 adoption을 선점하지
  않는다.

## Source contract

| 경로                                | 책임                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `src/klipse.tokens.json`            | DTCG 2025.10-compatible token value와 alias의 단일 정본                 |
| `../../scripts/lib/token-model.mjs` | Node 표준 라이브러리만 사용하는 repository validator와 projection model |
| `baseline/manifest.json`            | additive/breaking diff의 승인 비교점. Source authority는 없음           |

Primitive/semantic tier, light/dark mode, contrast pair, layer order, reduced-motion pair,
`motionProperties`와 `responsiveProfiles.projectGrid`는 단일 source 안의 논리적 계층과 Klipse extension이다.
Token은 플랫폼 이름과 분리된 안정 ID를 가지며 validator는 unknown field, 불완전 extension과 projection 이름
충돌을 거부한다.

현재 P2 validator가 지원하는 DTCG subset은 `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`,
`cubicBezier`, `number`, `shadow`, `typography`, `transition` 10개 type과 whole-token curly alias
`{group.token}`다.

범용 DTCG validator 전체가 아니며 지원하지 않는 type과 `$ref`/`$extends` 형식은 별도 결정 전까지 거부한다.

## Generated artifacts and exports

다음 로컬 RC artifact를 생성·추적하고 private package export map으로만 노출한다.

| Export                           | Artifact                      | 용도                                            |
| -------------------------------- | ----------------------------- | ----------------------------------------------- |
| `@klipse-design/tokens`          | `generated/index.js`          | primitive/semantic runtime graph와 metadata     |
| `@klipse-design/tokens`의 types  | `generated/index.d.ts`        | token graph와 JavaScript export declaration     |
| `@klipse-design/tokens/css`      | `generated/tokens.css`        | semantic CSS custom properties와 theme modes    |
| `@klipse-design/tokens/json`     | `generated/tokens.json`       | primitive/semantic machine-readable graph       |
| `@klipse-design/tokens/figma`    | `generated/figma.tokens.json` | review proposal, published Figma library가 아님 |
| `@klipse-design/tokens/manifest` | `generated/manifest.json`     | provenance, hash와 token diff 입력              |

`generated/`는 source가 아니며 직접 편집하지 않는다. deep import와 `src/` import는 지원하지 않는다. CSS는
제품 소비용 semantic custom property만 노출한다. Private RC package root JS와 resolved JSON, Figma proposal,
manifest는 검증·도구화를 위해 primitive/semantic graph, raw/resolved value, alias와 provenance를 함께
보존한다. 제품 코드는 primitive를 직접 소비하지 않는다. TypeScript declaration은 안정 token ID,
token별 type·mode·alias target, DTCG value shape와 runtime container를 선언한다. Token별 실제 raw/resolved
값은 runtime data이며 literal value union으로 고정하지 않는다.

현재 source와 manifest는 200개 variant record(primitive 110, semantic 90)를 포함한다. Package root JS는
`formatVersion`, `themes`, `metadata`, `primitives`, `tokens`를 export하고 TypeScript declaration이 같은 export와
token graph를 선언한다.

## Validation contract

- schema는 unknown field, 중복 ID, 잘못된 type/unit/mode를 거부한다.
- alias graph는 cycle, dangling reference, type mismatch와 primitive→semantic 역참조를 거부한다.
- theme-dependent semantic token은 light/dark 모두에서 완전히 resolve된다.
- 선언한 foreground/background pair는 mode별 WCAG contrast gate를 통과한다.
- non-empty font-family 배열과 typography composite 구조, elevation/layer 분리, motion reduced-mode를
  검증한다. Source의 multi-script fallback 후보가 실제 locale별 font asset·glyph·layout을 지원하는지는
  P3/P5 소비 게이트다.
- lifecycle별 `motionProperties`가 허용 CSS property만 선언하는지 검증한다.
- Project Grid profile의 container measurement, 안정 semantic `minimumCard`/`gap` reference와 ordered
  0/720/1200/1800px의 2/3/4/5 preferred-column shape를 검증한다. 실제 capacity 계산과 1열 fallback은 P3/P5
  소비 구현 게이트다.
- CSS semantic selector/theme output과 JS·JSON·Figma proposal·manifest의 primitive/semantic metadata,
  raw/resolved value, alias와 source provenance를 비교한다. TypeScript declaration은 JavaScript export
  surface와 token ID/type/mode/alias/value-shape contract를 대조한다.
- 같은 process에서 동일 source를 두 번 render한 결과는 byte-for-byte 동일하고 timestamp나 절대 경로를
  포함하지 않는다. Clean-checkout hosted CI의 반복 생성은 P2 `complete` 조건이다.
- Generator는 모든 source/output 경계와 전체 write plan을 먼저 검증한 뒤 여섯 artifact를 atomic batch로
  교체한다. 중간 commit 실패 canary는 이전 파일 전체 복원과 임시 파일 정리를 검증한다.
- Package self-reference consumer fixture는 root JS, CSS, JSON, Figma, manifest export를 실제 package 이름으로
  import하고 private generated subpath가 export되지 않는지 검사한다.
- package build, repository subset validation, generated drift와 failure canary를 루트 `check`/`verify`에서
  실행한다.

## Token diff and compatibility

Token diff는 다음을 구분한다.

- additive token
- stable ID/mode key removal과 source-path-only move
- type, raw value의 값/unit과 resolved value 변경
- mode 추가·삭제·누락
- semantic alias target 변경
- description과 deprecation metadata 변경
- layer order, contrast pair, motion property, reduced-motion pair, responsive profile 또는 Figma collection 변경

Additive, source-path-only move와 description 변경은 자동으로 breaking으로 세지 않는다. Removal, type,
raw/resolved value, alias target, mode, layer order와 공용 root metadata 변경, 기존 deprecation 제거는
breaking 분류다. 이름이 같아도 이 semantic 결과나 interaction order가 바뀌면 behavior change다. Breaking 변경은
Design Decision, 영향 token, 대체 token, migration, deprecation 기간과 rollback을 포함한다. 기존 제품
변수와 새 semantic token의 mapping은 제품 integration evidence이며 모호한 mapping을 source에 자동 반영하지
않는다.

## P2 token-pipeline gates

- 단일 DTCG-compatible source가 repository-supported subset validation을 통과한다.
- light/dark alias graph, contrast pair와 각 Foundation의 `P2 local RC` 자동화 항목이 통과한다.
- CSS semantic projection과 primitive/semantic JS·JSON·Figma proposal·manifest, typed TypeScript token graph가
  같은 source에서 결정론적으로 생성된다.
- 여섯 artifact의 atomic batch 교체/rollback canary가 통과한다.
- private export map, type declaration과 package self-reference consumer fixture가 준비된다.
- token diff가 additive와 breaking 변경을 정확히 분류하고 canary로 실패가 증명된다.
- Foundations, Develop, Figma, release, migration과 Updates 문서가 artifact 상태와 일치한다.

위 항목은 token source/projection pipeline 로컬 RC의 구현 증거다. Foundation에 분리해 적은 browser,
accessibility, glyph, layout, interaction acceptance는 P3/P5 소비 구현 게이트이며 실행하지 않았고
`not-ready`다. P2를 `complete`로 승격하려면 root clean-checkout hosted CI에서 build, generated drift,
parity와 반복 생성 검사를 통과하고 repository owner 승인을 받아야 한다. Public registry release, 제품
adoption과 published Figma library도 별도 gate 전까지 `not-ready`다.
