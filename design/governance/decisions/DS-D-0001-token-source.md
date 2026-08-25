---
id: decision-token-source
status: beta
authority: normative
---

# DS-D-0001 Token source architecture

- Status: accepted
- Date: 2026-08-13
- Owners: repository owner, token maintainer
- Affects: `foundation-color-theme`, `foundation-typography`, `foundation-spacing-radius`,
  `foundation-elevation-layer`, `foundation-motion`, `@klipse-design/tokens`

## Context

Klipse 제품에는 CSS 변수와 화면별 literal이 존재하지만 해당 파일은 의미, 안정 ID, mode, alias와
platform projection을 함께 설명하지 않는다. CSS를 역파싱하거나 color·spacing 같은 domain별 JSON을 각각
정본으로 두면 동일한 token이 여러 파일에서 다른 상태가 되고 platform output의 provenance를 증명하기
어렵다.

P2는 제품 구현을 그대로 복제하는 일이 아니라, 접근성·theme·호환성을 검증할 수 있는 독립 token
contract를 세우는 작업이다. Source는 사람과 도구가 함께 검토할 수 있어야 하고 CSS, JavaScript,
TypeScript, JSON과 Figma proposal이 동일한 의미를 가져야 한다.

## Decision

1. `packages/tokens/src/klipse.tokens.json` 하나를 token value와 alias의 유일한 정본으로 사용한다.
2. Source format은 Design Tokens Community Group의 `DTCG 2025.10`-compatible subset을 따른다.
3. 제품 CSS 역파싱 결과와 domain별 분할 JSON은 migration evidence 또는 projection일 수 있지만 정본이
   아니다.
4. `scripts/lib/token-model.mjs`를 Node 표준 라이브러리만 사용하는 repository validator로 사용한다. 현재
   P2 subset은 `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `shadow`,
   `typography`, `transition` 10개 type과 whole-token curly alias인 `{group.token}`을 지원한다. 범용 DTCG
   validator 전체를 구현한 것이 아니며, 지원하지 않는 type과 `$ref`/`$extends` 형식은 별도 결정 없이
   허용하지 않는다. Validator는 이 subset의 기본 구조와 다음 Klipse extension을 검증한다.
   - light/dark mode completeness
   - platform 이름과 분리된 stable token ID
   - 허용 foreground/background contrast pair
   - semantic layer relative order
   - motion과 reduced-motion pair
   - enter/exit lifecycle별 허용 CSS property인 `motionProperties`
   - container 기반 Project Grid 계약인 `responsiveProfiles.projectGrid`
5. 다음 파일은 모두 source의 결정론적 projection이며 직접 편집하지 않는다.
   - `packages/tokens/generated/tokens.css`
   - `packages/tokens/generated/index.js`
   - `packages/tokens/generated/index.d.ts`
   - `packages/tokens/generated/tokens.json`
   - `packages/tokens/generated/figma.tokens.json`
   - `packages/tokens/generated/manifest.json`
     CSS는 semantic custom property를 노출하며, **2026-08-25 개정으로 primitive `color`도 함께 노출한다**
     — downstream 제품이 자기 palette를 LOUIS 원시값 하나로 alias해 값 드리프트를 없애기 위함이다(TDS/SEED
     관행과 일치). primitive color는 `color()` 형식과 파라메트릭 알파(`rgb(... / N%)`)용 space-separated
     0–255 `-rgb` triplet 두 형식으로 낸다. **LOUIS 자신의 component CSS는 여전히 semantic만 소비한다**
     (`build-css.mjs`의 primitive-소비 게이트가 component 저작 CSS에 대해 그대로 강제된다) — 공개는
     downstream 소비 계약을 넓힌 것이지 내부 계층 규칙을 바꾼 것이 아니다. color 이외의 primitive(치수·
     반경·모션 등)는 계속 CSS로 내지 않는다. JS·resolved JSON·Figma proposal·manifest는 검증과 provenance를
     위해 primitive/semantic graph를 함께 보존한다. TypeScript declaration은 JavaScript export surface와 안정
     token ID, token별 type·mode·alias target, DTCG value shape를 선언한다.
6. `packages/tokens/baseline/manifest.json`은 token diff의 비교 기준이다. Source authority를 갖지 않으며
   승인된 baseline 갱신 없이 현재 출력을 덮어쓰지 않는다.
7. Figma JSON은 review proposal이다. 생성 또는 승인만으로 published Figma variables/library가 되거나
   manifest의 Figma 상태를 올리지 않는다.
8. P2는 local private release-candidate까지 소유한다. Public package release, 제품 adoption과 published
   Figma library는 별도 gate를 통과해야 한다.

## Alternatives

### Product CSS를 역파싱해 source로 사용

기존 화면과 빠르게 일치하지만 의미 없는 alias와 제품 debt를 새 시스템의 정본으로 고정한다. Theme,
contrast와 platform metadata도 CSS만으로 복원할 수 없어 선택하지 않았다.

### Domain별 source 파일을 독립 정본으로 사용

파일은 작아지지만 schema version, stable ID와 cross-domain alias가 여러 root에서 갈릴 수 있다. 단일
graph validation과 deterministic ordering을 우선해 선택하지 않았다.

### 외부 transform dependency를 source of truth로 사용

도구 업데이트가 validation 의미와 출력에 영향을 주고 clean environment 재현성이 외부 package에
의존한다. P2 core validator와 generator는 외부 패키지 없이 Node 표준 라이브러리만 사용한다.

### Figma를 token source로 사용

디자인 작업에는 편리하지만 runtime-only layer, accessibility pair와 loss metadata를 완전히 소유하지
못하며 credential 없는 CI 검증이 어렵다. Figma는 projection 소비자로 유지한다.

## Consequences

- 모든 변경은 단일 graph에서 review되므로 alias, mode와 platform parity를 한 번에 검증할 수 있다.
- Domain별 담당자도 같은 source 파일을 수정하므로 merge conflict 가능성이 늘어난다. 안정 ID와 작은
  focused diff, deterministic formatting으로 완화한다.
- Source가 DTCG보다 엄격한 Klipse extension을 포함하므로 범용 도구는 extension을 무시할 수 있다. 공식
  build는 반드시 Klipse validator를 통과해야 한다.
- Generated artifact와 Figma proposal은 편집 편의보다 provenance와 반복 생성 가능성을 우선한다.
- Product CSS와 수치가 달라질 수 있으며, adoption 전에 legacy→semantic mapping과 시각 회귀를 별도로
  수행해야 한다.

## Rollback

P2 release-candidate에 문제가 생기면 소비자는 아직 public package를 사용하지 않으므로 제품 코드를
변경하지 않는다. 저장소에서는 마지막 승인 source와 `packages/tokens/baseline/manifest.json`으로 돌아가
artifact를 재생성한다. Baseline 자체에 결함이 있으면 임의 수정하지 않고 이 결정을 supersede하는 ADR과
수정 migration을 먼저 승인한다. Published Figma 적용 전이므로 proposal은 폐기하고 library에는 반영하지
않는다.

## Rollout and verification

1. Source를 repository-supported DTCG subset validator로 읽어 token ID, type, alias, mode와 extension을
   검증한다.
2. CSS·JS·TS·JSON·Figma proposal·manifest를 한 실행에서 생성한다.
3. CSS의 semantic selector/theme output과 JS·JSON·Figma proposal·manifest의 primitive/semantic token
   metadata·raw/resolved value·alias projection을 비교하고 JavaScript/TypeScript token graph를 대조한다.
4. 선언한 contrast pair, layer order와 reduced-motion pair를 검증한다.
5. `motionProperties`의 lifecycle/property와 Project Grid의 container measurement, stable minimum-card/gap ID,
   ordered 0/720/1200/1800px preferred 2/3/4/5열 profile shape를 검증한다. 실제 capacity와 1열 fallback은
   P3/P5 소비 구현에서 검증한다.
6. 같은 process에서 동일 source를 두 번 render해 byte-for-byte 동일함을 확인한다.
7. 현재 generated manifest와 baseline을 비교해 additive와 breaking change를 분류한다.
8. Catalog는 source, validator, baseline과 여섯 artifact가 실제 파일이며 추적되는지 확인한다.
9. clean-checkout hosted CI, public release와 Figma publish는 별도 completion/release gate 전까지
   `not-ready`로 유지한다.
