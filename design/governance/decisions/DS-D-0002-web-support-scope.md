---
id: decision-web-support-scope
status: experimental
authority: normative
---

# DS-D-0002 Web 지원 범위

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, package maintainer
- Affects: `@klipse-design/react`, `@klipse-design/css`, `develop-overview`

## Context

P3 package를 만들기 전에 React 버전, 모듈 포맷, client boundary, 브라우저 하한, 빌드 도구를 고정해야
한다. 이 저장소는 현재 런타임 의존성이 0이고 TypeScript 설정도 없다.

컴포넌트 규범이 요구하는 것 중 이 결정에 직접 걸리는 항목이 있다. Dialog는 "모든 Modal Dialog가 앱의
하나인 modal overlay root로 portal한다"를 요구하고, Menu는 중첩 portal을 같은 내부 영역으로 판정하는
`branchId` 계약을 요구한다. 두 계약 모두 **단일 React context 인스턴스**를 전제한다.

## Decision

`@klipse-design/react`는 다음 범위로 시작한다.

| 항목 | 결정 |
| --- | --- |
| React | `^19.0.0` 단일 major (peer) |
| 모듈 포맷 | **ESM 전용.** CJS dual 배포 없음 |
| client boundary | leaf 모듈에 `"use client"`. 패키지 루트에 붙이지 않는다 |
| 브라우저 하한 | `baseline widely available` |
| 빌드 | `tsc` 단독 + `isolatedDeclarations: true` |

1. **dual 배포를 하지 않는 이유:** dual package hazard로 React context 인스턴스가 이중화되면 Menu의
   branch registry와 Dialog의 modal stack이 갈라진다. 이는 규범이 금지한 실패가 **런타임에서만,
   간헐적으로** 나타나는 형태여서 디버깅이 사실상 불가능하다. 소비 제품이 Next.js App Router 하나인
   지금 dual로 얻는 이득이 없다.
2. **React 범위를 좁게 두는 이유:** Dialog의 `inert`/top-layer와 Menu의 portal·`composedPath`는 React
   major의 이벤트 위임 루트와 hydration 변화에 노출도가 가장 높은 코드다. 검증 수단이 없는 상태에서
   범위를 넓히는 것은 인계서 7절의 증거 규칙 위반이다. **넓히는 것은 minor이고 좁히는 것만
   breaking**이므로 지금 좁게 두는 선택이 rollback-safe하다.
3. **`isolatedDeclarations`를 지금 켜는 이유:** 컴포넌트 3종 규모에서 반환 타입 애노테이션 비용은
   사실상 0이지만, 나중에 켜려면 public API 표면 전체를 재작성해야 한다.
4. **언마운트를 CSS에 위임하지 않는다.** [Motion](../../foundations/motion.md)이 "unmount timer와
   interaction lock은 시각 transition과 같은 resolved recipe를 읽는다"고 규정하므로, `@starting-style`이나
   `transition-behavior: allow-discrete`의 Baseline 편입 여부는 크리티컬 패스가 아니다. 이 사실을 여기
   기록해 나중에 CSS 전용 언마운트를 재도입하지 않게 한다.
5. **`inert`를 Dialog의 기본 경로로 쓴다.** S3 spike(2026-08-14) 실측 결과 실행 브라우저에 구현돼
   있고, `baseline widely available`이 해석하는 하한은 chrome 121 · edge 121 · firefox 122 ·
   safari 17.2 · ios_saf 17.2로 `inert` 도입 시점보다 뒤다. 다만 caniuse-lite가 `inert`를 추적하지
   않아 **하한 대조는 도구로 자동 확인되지 않는다** — 지원 대상이 넓어질 때 재실측한다. `inert`가
   없는 환경이 지원 대상에 들어오면 `aria-hidden` + focus scope 병행을 Known deviation으로 기록한다.

## Alternatives

### ESM + CJS dual 배포

소비자 범위가 넓어진다. 그러나 위 1번의 context 이중화 위험이 규범 위반을 은폐하는 형태로 나타난다.
소비 제품이 하나인 지금 정당화되지 않는다.

### 상한 없는 `react: ">=18.0.0"`

SEED가 쓰는 방식이다. 그러나 검증하지 않은 major를 install이 아니라 런타임에서 통과시킨다. Radix,
Base UI, React Aria는 모두 `||` 나열형 상한을 쓴다.

### `^18 || ^19` 동시 지원

18과 19는 `ref` as prop, `useId` 포맷, `inert`의 boolean 처리에서 갈린다. 검증 수단(React matrix CI)이
없는 상태의 지원 선언은 근거 없는 상태 표기다. 필요해지면 matrix CI와 함께 넓힌다.

### 빌드 도구로 tsup / tsdown

tsup은 유지보수 중단을 선언했으므로 2026년 신규 채택은 잘못된 기본값이다. tsdown은 `publint`·`attw`를
빌드 옵션으로 내장해 게이트를 늘리지 않고 패키지 정합성 검증을 얻는 드문 수단이라 **첫 publish 직전
(DS-P3-012)의 1순위 후보**로 남긴다. 지금은 단일 엔트리에 서브패스가 없어 번들러가 필요 없다.

### 브라우저 하한을 browserslist `defaults`로

점유율 기반이라 caniuse 데이터 갱신에 따라 같은 소스가 다른 산출물을 낸다. byte-for-byte 재현성을
요구하는 저장소에 비결정적 하한은 맞지 않는다. `baseline widely available`은 이동 규칙이 명시적이다.

## Consequences

- 새 런타임 의존성 0. devDependency는 `typescript` 1개.
- `peerDependencies`: `react ^19.0.0`, `react-dom ^19.0.0`, `@types/react ^19.0.0`(optional).
- React 19가 아닌 소비자는 설치 단계에서 막힌다. **의도한 실패**다.
- 브라우저 하한은 자동 검사 게이트를 만들지 않고 Foundation 규범 문장과 리뷰로 판정한다.

## Rollback

- React 범위 확대와 `require` 조건 추가는 모두 minor다. 되돌리는 쪽만 breaking이므로 현재 선택이
  안전하다.
- TypeScript의 declaration emit이 기대대로 나오지 않으면 이전 major로 즉시 후퇴한다.
- `tsc`에서 tsdown 전환은 `isolatedDeclarations`가 켜져 있으면 저비용이다.

## Rollout and verification

1. ~~`tsc` declaration emit 실측~~ — **완료(2026-08-14, S3 spike).** TypeScript 7.0.2에서
   `declaration: true` + `isolatedDeclarations: true` 조합이 `.d.ts`와 `.js`를 정상 방출했다. 이전
   major로의 fallback은 필요 없다.
2. ~~브라우저 하한 확인~~ — **완료(2026-08-14).** 위 Decision 5번에 결과를 기록했다.
3. peer 범위가 install 단계에서 실제로 막는지 확인한다(pnpm의 `auto-install-peers` 기본값이 `false`라
   의도한 강제가 작동한다. npm은 자동 설치하므로 문서에 명시한다).
4. SSR render와 hydration을 첫 컴포넌트 구현 시점에 검증한다.

## 재검토 조건

- 소비 제품 또는 두 번째 consumer가 React 18을 요구하면 범위 확대와 matrix CI를 함께 도입한다.
- 서브패스 export나 CSS 번들링이 필요해지면 tsdown을 1순위로 검토한다.
- 첫 publish 직전에 `publint`/`attw` 수준의 패키지 정합성 검증을 도입한다.
- 하한 이동으로 `inert` 판정이 바뀌면 연도 고정 쿼리로 전환하고 갱신 Decision을 남긴다.
