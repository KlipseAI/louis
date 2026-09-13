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
(DS-P3-012)의 1순위 후보**로 남긴다. ~~지금은 단일 엔트리에 서브패스가 없어 번들러가 필요 없다.~~
**2026-09-13 재검토:** `./icons` 서브패스가 생겼지만 진입점마다 소스 파일을 그대로 방출하면 되므로
여전히 번들러가 필요 없다(아래 구현 대조).

### 브라우저 하한을 browserslist `defaults`로

점유율 기반이라 caniuse 데이터 갱신에 따라 같은 소스가 다른 산출물을 낸다. byte-for-byte 재현성을
요구하는 저장소에 비결정적 하한은 맞지 않는다. `baseline widely available`은 이동 규칙이 명시적이다.

## Consequences

- 새 런타임 의존성 0. devDependency는 `typescript` 1개.
- `peerDependencies`: `react ^19.0.0`, `react-dom ^19.0.0`, `@types/react ^19.0.0`(optional).
- ~~React 19가 아닌 소비자는 설치 단계에서 막힌다. **의도한 실패**다.~~ **틀렸다(2026-09-13 pnpm 10
  실측).** pnpm 기본 설정에서는 경고만 나고 설치가 끝난다. peer 범위는 설치를 막는 계약이 아니라 경고
  계약이다 — 아래 구현 대조.
- 브라우저 하한은 자동 검사 게이트를 만들지 않고 Foundation 규범 문장과 리뷰로 판정한다.

## Rollback

- React 범위 확대와 `require` 조건 추가는 모두 minor다. 되돌리는 쪽만 breaking이므로 현재 선택이
  안전하다.
- TypeScript의 declaration emit이 기대대로 나오지 않으면 이전 major로 즉시 후퇴한다.
- `tsc`에서 tsdown 전환은 `isolatedDeclarations`가 켜져 있으면 저비용이다.

## Rollout and verification

1. ~~`tsc` declaration emit 실측~~ — **완료(2026-08-14, S3 spike).** `declaration: true` +
   `isolatedDeclarations: true` 조합이 `.d.ts`와 `.js`를 정상 방출했다. 이전 major로의 fallback은 필요
   없다. **버전은 저장소가 고정한 TypeScript `~5.9.3`(lockfile 5.9.3)이다** — 처음 적은 「7.0.2」는
   저장소 밖 spike 환경의 표기로, 원본 로그가 없어 확인할 수 없어 걷었다(아래 구현 대조).
2. ~~브라우저 하한 확인~~ — **완료(2026-08-14).** 위 Decision 5번에 결과를 기록했다.
3. ~~peer 범위가 install 단계에서 실제로 막는지 확인한다~~ — **확인했다(2026-09-13). pnpm 10 기본값에서는
   막지 않는다.** 처음 적은 「pnpm의 `auto-install-peers` 기본값이 `false`」는 틀렸다(기본값 `true`).
   npm은 재지 않았다. 아래 구현 대조.
4. SSR render와 hydration을 첫 컴포넌트 구현 시점에 검증한다.

## 재검토 조건

- 소비 제품 또는 두 번째 consumer가 React 18을 요구하면 범위 확대와 matrix CI를 함께 도입한다.
- 서브패스 export나 CSS 번들링이 필요해지면 tsdown을 1순위로 검토한다.
- 첫 publish 직전에 `publint`/`attw` 수준의 패키지 정합성 검증을 도입한다.
- 하한 이동으로 `inert` 판정이 바뀌면 연도 고정 쿼리로 전환하고 갱신 Decision을 남긴다.

## 구현 대조 (2026-09-13)

Status 는 `proposed` 그대로다. 아래는 owner 확인을 요청하기 전에 결정과 구현을 대조해 어긋난 것을
적고, 저장소 안에서 고칠 수 있는 것은 고친 기록이다([Updates (129)](../../updates/README.md)).

### leaf `"use client"` — 지켜지지 않았고, 이제 게이트가 지킨다

클라이언트 전용 코드를 쓰는 leaf 7개(`app-shell` · `banner-carousel` · `button` · `checkbox` ·
`project-card` · `segmented-control` · `slider`)에 지시문이 없었다. 규칙을 보는 검사가 하나도 없었고,
Node SSR(`verify-consumer`)은 React 를 `react-server` 조건으로 풀지 않아 이 누락을 원리적으로 못
잡는다. 일곱 모두에 지시문을 붙이고 `dist` 를 재빌드했다.

`scripts/check-react-client-boundary.mjs` 가 `verify:ci` 에서 이 결정의 client boundary 행을
판정한다. 「클라이언트 전용」의 기준은 손으로 적은 목록이 아니라 설치된 React·ReactDOM 이
`react-server` 조건에서 내보내지 않는 export 의 차집합이다. 판정 경로 셋(API import · JSX 인라인 함수 ·
모듈이 만든 함수를 props 로)과 「루트·배럴에는 붙이지 않는다」, 「`dist` 가 지시문을 보존한다」를 각각
`verify-gates` 카나리아가 증명한다. **남은 것:** 실제 RSC 번들러로 서버 층을 평가하는 검사와
hydration 복구 오류 관찰(위 Rollout 4)은 여전히 없다. 이 검사는 문자열 수준이라 다른 모듈에서
import 한 함수를 핸들러로 넘기는 경우는 보지 않는다.

### Rollout 1 의 TypeScript 버전 표기가 틀렸다

Rollout 1 은 declaration emit 을 「TypeScript 7.0.2 에서」 실측했다고 적었다. 저장소가 고정하고 설치한
것은 5.9.3 이다 — 루트 `package.json` 의 `"typescript": "~5.9.3"`, `pnpm-lock.yaml` 의 importer
항목(specifier `~5.9.3` · version `5.9.3`). `git log -G'"typescript": "' -- package.json` 로 보면 이
줄을 바꾼 커밋은 처음 들어온 `b56909b`(2026-08-15) 하나뿐이고 그때부터 `~5.9.3` 이다. S3 spike 는
저장소 밖에서 돌았고 원본 로그가 저장소에 없어 7.0.2 가 어느 환경이었는지 확인할 수 없다.

**판정 근거는 spike 가 아니라 지금 저장소다.** `tsc` 5.9.3 과 루트 `tsconfig.build.json` 의
`isolatedDeclarations: true` 로 `packages/react/dist` 의 `.d.ts`·`.js` 가 나오고, `check-react-dist` 가
`pnpm check` 마다 재빌드와 바이트 비교한다. 결정(`tsc` 단독 + `isolatedDeclarations`)은 그대로 선다.

### peer 범위가 설치를 막는다는 전제가 틀렸다 (pnpm 10)

Consequences 와 Rollout 3 은 「pnpm 의 `auto-install-peers` 기본값이 `false` 라 React 19 가 아닌 소비자는
설치 단계에서 막힌다」고 적었다. 둘 다 pnpm 10 에서 사실이 아니다.

- **문서.** pnpm 공식 설정 문서(Peer Dependency Settings)는 `autoInstallPeers` 기본값을 `true`,
  `strictPeerDependencies` 기본값을 `false` 로 적는다. 이 저장소는 둘 다 설정하지 않는다 —
  `pnpm config get auto-install-peers` · `strict-peer-dependencies` 가 모두 `undefined` 이고
  `pnpm-workspace.yaml` 에도 없다.
- **실측** (2026-09-13 · pnpm 10.30.2 · 저장소 밖 임시 디렉터리 · `--offline` · 전용 store). React 18
  소비자와 같은 모양을 가짜 패키지 둘로 만들었다 — peer `^2.0.0` 을 요구하는 패키지와, 설치된 1.0.0.

  | 상황 | 결과 |
  | --- | --- |
  | 범위 밖 peer 가 설치돼 있음(기본 설정) | `WARN Issues with peer dependencies found` · `unmet peer … found 1.0.0` · **exit 0** |
  | 같은 조합 + `strict-peer-dependencies=true` | **exit 1** |
  | peer 를 설치하지 않음(기본 설정) | pnpm 이 peer 를 레지스트리에서 풀려 들었다 — 오프라인이라 `ERR_PNPM_NO_OFFLINE_META` 로 멈췄다. 자동 설치가 켜져 있다는 뜻이다 |
  | 같은 조합 + `auto-install-peers=false` | `missing peer` 경고 · exit 0 |

**결론.** `peerDependencies: react ^19.0.0` 은 소비자에게 **경고**를 줄 뿐 설치에서 조합을 제거하지
못한다. 결정(React 19 단일 major)은 그대로 서지만, 그 보증은 설치 단계가 아니라 이 저장소가 React 19
에서만 테스트한다는 사실에서 온다. 설치에서 막으려면 소비자가 `strictPeerDependencies` 를 켜야 한다.
npm 의 동작은 재지 않았다.
[DS-D-0036](DS-D-0036-git-install-distribution.md)이 git 설치에서 관측한 「pnpm 은 경고만 낸다」와 같은
방향이다.

### 서브패스 export 로 발동한 tsdown 재검토 — `tsc` 를 유지한다

재검토 조건 「서브패스 export 나 CSS 번들링이 필요해지면 tsdown 을 1순위로 검토한다」가 `./icons` ·
`./icons/manifest.json` 서브패스(`packages/react/package.json` exports)로 발동했다. **검토 결과
`tsc` 를 유지한다.** 새 진입점 `./icons` 도 소스 파일 하나(`dist/icons/generated/index.js`)를 그대로
방출한 것이고 manifest 는 복사다 — 합칠 모듈이 없다. 그리고 `tsc` 의 파일 단위 방출이 leaf
`"use client"` 를 보존한다. 번들 모드는 모듈을 합치므로 파일 단위 지시문이 그대로 남지 않고, 파일 단위
방출 모드를 쓰면 결과가 `tsc` 와 같아져 전환 이득이 `publint`·`attw` 내장뿐이다. 그 도구의 도입 시점
(첫 publish 직전)은 바뀌지 않는다. 전환하게 되면 `check-react-client-boundary` 의 dist 보존 판정이
먼저 결과를 알려 준다.
