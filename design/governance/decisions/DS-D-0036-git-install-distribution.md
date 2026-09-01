---
id: decision-git-install-distribution
status: experimental
authority: normative
---

# DS-D-0036 정본 배포 경로는 git 설치다

- Status: accepted
- Date: 2026-09-01
- Owners: repository owner, package maintainer
- Affects: `@klipse-design/css`, `@klipse-design/react`, `@klipse-design/tokens`,
  `decision-versioning-peer-contract`, `governance-releases`

## Context

[DS-D-0006](DS-D-0006-versioning-peer-contract.md)은 배포를 **npm 레지스트리 + changesets**로
전제하고 exports 맵과 peer 방향을 정했다. 그 전제는 아직 한 번도 실행되지 않았다 — 게시는 없었고
changesets도 들어오지 않았다.

그 사이에 실제 배포 경로가 하나 생겼다. 제품이 CSS를 이렇게 설치한다.

```json
"@klipse-design/css": "github:KlipseAI/louis#<sha>&path:/packages/css"
```

문제는 이 채널이 레지스트리 채널과 **다른 두 가지를 공짜로 주지 않는다**는 것이다.

1. `pnpm publish`만이 `workspace:`를 실제 버전으로 치환한다. git 설치는 그 단계를 거치지 않으므로
   프로토콜 문자열이 그대로 소비자의 resolver에 도착한다.
2. 레지스트리 tarball은 **방금 빌드한 것**을 담는다. git 설치가 받는 것은 워킹트리가 아니라
   **커밋된 것**이다. 커밋되지 않은 파일은 소비자에게 존재하지 않는다.

`packages/css`는 두 가지를 우연히 만족했다 — `peerDependencies`가 없고, `generated/` 6개가
커밋돼 있다. `packages/react`는 둘 다 어겼고, 그래서 **66개 export가 한 번도 소비된 적이 없다**.

2026-09-01 실측.

| 관측 | 결과 |
| --- | --- |
| `git log --all -S'@klipse-design/react' -- '*package.json'` | 0건 — 제품이 이 패키지를 참조한 커밋이 없다 |
| clean clone에서 `npm pack --dry-run` (`packages/react`) | `files: 3` (README · THIRD-PARTY-NOTICES · package.json). `dist` 253개 전부 없음 |
| 빌드된 워킹트리의 tarball을 `npm install` | `EUNSUPPORTEDPROTOCOL  Unsupported URL Type "workspace:": workspace:^` |
| `git+file://…#9ba97e5&path:/packages/react`를 pnpm으로 설치 | 설치는 되지만(`workspace:^`를 `^`로 낮추고 경고) `import` 시 `ERR_MODULE_NOT_FOUND … /dist/index.js` |

마지막 줄이 이 채널의 실패 방식을 잘 보여준다. **설치는 성공한다.** 무엇도 빨갛지 않고, 저장소 안
게이트 전부가 초록이며, 깨지는 곳은 소비자의 첫 `import` 하나뿐이다.

## Decision

1. **git 설치를 정본 배포 경로로 선언한다.** 레지스트리 게시는 폐기가 아니라 아직 오지 않았다 —
   DS-D-0006은 그대로 선다.
2. **배포물(`files`가 가리키는 것)은 전부 커밋한다.** `packages/css/generated`와
   `packages/tokens/generated`가 이미 그렇고, `packages/react/dist`를 같은 규칙으로 옮긴다.
   루트 `.gitignore`의 `dist/`에 그 경로 하나만 예외를 둔다.
3. **소비자에게 가는 의존성 필드에 `workspace:`를 쓰지 않는다.** `dependencies` ·
   `peerDependencies` · `optionalDependencies` 셋이다. workspace 링크가 필요하면
   `devDependencies`로 잡는다 — 소비자는 의존성의 devDependencies를 설치하지 않으므로 그 프로토콜이
   소비자의 resolver에 닿지 않는다.
4. **커밋된 생성물은 `--check`를 갖는다.** `packages/react/dist`에 대해 `pnpm run check:react`가
   재빌드와 바이트 비교한다. 생성물을 커밋하기로 한 이상 낡을 수 있고, 낡으면 저장소 안에서는
   아무도 모르는 채 소비자만 옛 코드를 받는다.
5. **호환은 semver가 아니라 sha로 표현한다.** git 설치는 범위를 보지 않는다. 제품은
   `@klipse-design/css`와 `@klipse-design/react`를 **같은 sha**로 고정한다. DS-D-0006의 `fixed`
   동반 버저닝이 install 단계에서 하려던 일을 이 채널에서는 sha 하나가 한다.

## Alternatives

### `prepare` 스크립트로 소비자 머신에서 빌드한다

npm과 pnpm 모두 git 의존성에서 `prepare`를 돌린다. 그러려면 소비자 머신에서 이 모노레포의
devDependencies를 설치하고 `tokens → icons → css → react` 사슬을 돌려야 한다. 설치 시간과
실패 표면이 늘고, **이미 동작하는 방식이 저장소 안에 있는데 두 번째 방식을 만드는 것**이다.
`packages/css`가 제품에서 실제로 도는 증거이므로 그 선택을 그대로 따른다.

### 지금 레지스트리에 게시한다

DS-D-0006 Rollout이 changesets 도입과 패키지 정합성 검증 도구를 선행 조건으로 걸어 두었고, 둘 다
없다. 소유자 판정이 [DS-D-0035](DS-D-0035-figma-done-without-publish.md)에서 Figma 게시를 「지금
소비자가 나 하나」라는 이유로 미뤘고, 같은 논리가 npm 게시에도 그대로 적용된다. 소비자가 하나면
sha 고정이 버전 범위보다 정확하다.

### `@klipse-design/css`를 optional peer로 낮춘다

`workspace:^`를 지우는 가장 짧은 길이지만 DS-D-0006이 접근성 근거로 막아 두었다 — CSS 없이 열리는
Menu·Dialog는 focus ring과 44px 타겟과 `[data-state="closed"]`의 `display:none`을 잃는다.
필드에서 빼지 않고 **범위만** 소비 가능한 것으로 바꾼다.

### React 패키지를 「Figma·문서 전용 레퍼런스」로 격하한다

설치 경로가 없다는 사실을 인정하고 재현 근거에서 빼는 선택. 소유자 결정으로 기각했다 — 「열어서
제품이 쓰게 한다」. 격하했다면 `design/governance/operating-model.md`의 Web API 항목과 66개 export의
지위를 함께 내려야 했다.

### `dist`에서 sourcemap 126개를 뺀다

커밋 무게가 절반이 된다. 그러나 `files: ["dist"]`가 map을 담으므로, 커밋에서만 빼면 **워킹트리의
pack과 clone의 pack이 달라진다** — 그 어긋남이 정확히 이 결정이 닫으려는 실패다. 테스트가
`@klipse-design/react`를 공개 이름으로 import해 `dist`를 돌기 때문에 스택트레이스를 `src`로 되돌리는
실용적 쓸모도 있다.

## Consequences

- **소스를 고치면 같은 변경 단위에 `dist` 재빌드가 들어간다.** `pnpm run check:react`가 강제한다.
  잊으면 `pnpm check`가 빨갛다.
- 커밋 무게가 늘어난다 — 253개 파일, 약 1.2MB. React 소스를 건드리는 변경마다 diff에 생성물이 함께
  뜬다.
- **npm 소비자와 pnpm 소비자가 다르게 실패한다.** npm은 peer를 자동 설치하므로
  `@klipse-design/css`를 명시하지 않으면 레지스트리에서 찾다가 404로 죽고, pnpm은 경고만 낸다.
  DS-D-0006 Consequences가 예고한 환경 차이가 그대로 나타난다. 두 매니저 모두 css를 함께 적으면
  같은 결과다.
- 게시가 시작되면 결정 2·3항은 무해해진다 — `pnpm publish`가 `workspace:`를 치환하고 `files`로
  팩하므로 커밋 여부와 무관해진다. 그때도 되돌릴 이유는 없다(커밋된 생성물은 그대로 정확하다).

## Rollout and verification

1. `packages/react/package.json`: `peerDependencies["@klipse-design/css"]`를 `workspace:^` →
   `*`로, workspace 링크는 `devDependencies`의 `workspace:*`로 옮긴다.
2. `.gitignore`에 `!/packages/react/dist/`를 두고 `dist` 253개를 커밋한다.
3. `scripts/verify-consumer.mjs`에 두 검사를 더한다 — pack에 담기는 파일이 전부 git에 추적되는가,
   소비자에게 가는 의존성 필드에 `workspace:`가 있는가.
4. `scripts/check-react-dist.mjs`를 세우고 `pnpm check` 사슬에 넣는다.
5. 저장소 밖에서 실제로 설치해 확인한다. 2026-09-01 실측 결과.
   - clean clone의 `npm pack --dry-run`: `files: 256`, `dist/index.js` · `dist/index.d.ts` ·
     `dist/icons/manifest.json` 포함, `src/` 없음.
   - `npm init -y` 소비자에 css·react tarball 설치 → `added 22 packages`, exit 0.
   - Node SSR: `<button type="button" class="louis-button louis-focus-ring louis-hit-target" …>`.
   - `moduleResolution: "bundler"`(제품 `@repo/typescript-config/nextjs.json`과 같음)로 `tsc`
     exit 0 — `Button` · `ButtonProps` · `Dialog` · `IconTrashSimple`이 타입과 함께 잡힌다.
   - 제품과 같은 방식(pnpm + git URL + `path:`)으로 설치 → exit 0, peer 경고 없음, SSR 동작.
6. 제품 `package.json`은 이 결정에서 건드리지 않는다. 소유자의 작업이 끝난 뒤 한 줄을 더한다.

### `moduleResolution: "node16"`은 실패한다

`"type": "module"`이 없는 소비자에서 `node16`으로 재면 `TS1479`가 난다. 이것은 결함이 아니라
[DS-D-0002](DS-D-0002-web-support-scope.md)가 정한 **ESM 전용** 계약이 드러난 것이다. 제품은
`Bundler`를 쓰므로 해당하지 않는다.

## 재검토 조건

- 첫 npm 게시가 실행되면 결정 2·3항의 필요성을 다시 판정한다(계속 유지가 기본값이다).
- 커밋된 `dist`의 무게나 diff 소음이 실제 작업을 방해하기 시작하면 sourcemap 제외를 재검토한다 —
  단, 워킹트리 pack과 clone pack이 같아야 한다는 조건은 유지한다.
- 저장소 밖 소비자가 둘 이상 생기면 sha 고정 대신 버전 범위가 필요해지므로 DS-D-0006 Rollout을 연다.
