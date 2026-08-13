---
id: governance-contributing
status: beta
authority: normative
---

# Contributing

디자인 시스템 변경은 catalog 상태, 규범, 배포 자산, 검증과 사용자 안내를 같은 디자인 시스템
PR에서 일치시킨다. 제품 적용은 별도 integration PR로 진행하고 두 PR을 상호 링크한다.

## 변경 흐름

1. [manifest](../manifest.json)에서 대상 ID와 현재 maturity를 확인한다.
2. 행동, 상태, 접근성, 반응형, 콘텐츠 계약을 규범 문서에 먼저 명시한다.
3. 제품 의미가 갈리면 [Design Decision](decisions/README.md)을 작성한다.
4. package와 Figma 구현을 추가하고 status를 근거에 맞게 갱신한다.
5. 테스트와 예제를 추가한다.
6. [Updates](../updates/README.md)에 사용자 영향과 migration을 기록한다.
7. 생성물을 갱신하고 모든 게이트를 통과시킨다.

## Token change flow

P2 token 변경은 다음을 같은 PR에서 다룬다.

1. 단일 정본 `packages/tokens/src/klipse.tokens.json`의 primitive/semantic tier 또는 Klipse extension을 바꾼다.
2. 관련 [Foundation](../foundations/README.md)의 의미, mode, 접근성과 acceptance criteria를 갱신한다.
3. CSS·JS·TS·JSON·Figma proposal을 같은 generator로 재생성한다.
4. token diff에서 additive, stable ID/mode 제거, source-path-only move, type/unit, mode, raw value,
   semantic alias target와 layer order 변화를 검토한다. 공개 ID rename은 deprecated replacement를 추가한 뒤
   기존 ID 제거로 표현한다.
5. breaking이면 Design Decision, 대체 token, migration, deprecation 기간과 rollback을 추가한다.
6. `scripts/lib/token-model.mjs`로 repository-supported DTCG structure, alias graph, contrast, non-empty
   font-family 배열과 typography composite shape, layer order, reduced-motion, lifecycle별 motion property와
   responsive profile shape를 검사한다. Source의 multi-script 후보가 실제 locale별 font asset, glyph와 layout을
   지원하는지는 P3/P5 소비 검증이다.
7. `packages/tokens/baseline/manifest.json`과 generated manifest의 diff를 검토한 뒤 parity와 deterministic
   rebuild 검사를 실행한다.

`packages/tokens/generated/`를 직접 수정하거나 제품 CSS 값을 semantic review 없이 source로 복사하지
않는다. P2 Figma proposal은 review 대상이지만 published Figma library의 증거가 아니다.

## 완료 정의

- manifest와 문서 frontmatter가 일치한다.
- component의 `docs: done` 문서에는 Availability, public contract, states, content,
  accessibility와 acceptance tests가 있다.
- pattern의 `docs: done` 문서에는 선택 기준, ownership/state lifecycle, responsive,
  accessibility와 acceptance tests가 있다.
- `web: done`은 public export, tests, accessibility와 release evidence가 있을 때만 사용한다.
- `figma: done`은 published library component와 code parity 검증이 있을 때만 사용한다.
- breaking change는 migration과 deprecation window를 제공한다.
- 생성 파일과 source가 일치한다.
- CSS의 semantic output과 JS·JSON·Figma proposal·manifest의 primitive/semantic token graph가 같은
  normalized model에서 생성되고 alias·description/deprecation·source provenance가 source와 일치한다.
  TypeScript declaration은 JavaScript export surface와 token ID/type/mode/alias/value-shape contract를
  일치시킨다.
- token rename뿐 아니라 semantic alias target, mode, type/unit 또는 layer order 변경도 behavior impact를
  분류한다.
- Project Grid profile 변경은 container measurement, stable minimum-card/gap ID와 ordered preferred-column
  shape를 검사한다. 실제 capacity 계산과 1열 fallback은 P3/P5 소비 구현에서 검증한다.
- Motion 변경은 enter/exit lifecycle별 허용 CSS property와 reduced-motion pair를 함께 검증한다.
- private P2 artifact는 public release, 제품 adoption 또는 Figma `done`으로 표시하지 않는다.

## 필수 검증

```sh
pnpm build
pnpm check
pnpm verify
```

CI는 생성물 drift와 추적되지 않은 catalog input을 추가로 차단한다.

## 제품 통합

소비 제품의 route audit과 visual/E2E evidence는 제품 레포가 소유한다. 제품 이슈는 이 저장소의
안정적인 manifest ID와 release version을 참조하며, 제품 결함을 normative status로 섞지 않는다.
