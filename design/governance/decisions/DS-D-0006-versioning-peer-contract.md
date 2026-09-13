---
id: decision-versioning-peer-contract
status: experimental
authority: normative
---

# DS-D-0006 Versioning과 peer 계약

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, package maintainer
- Affects: `@klipse-design/tokens`, `@klipse-design/css`, `@klipse-design/react`,
  `governance-releases`

## Context

[Releases](../releases.md)는 package 배포가 시작되면 fixed와 independent 중 무엇을 쓸지 Decision으로
확정하라고 요구한다. 아직 배포 전이지만 CSS와 React를 만들기 전에 정해야 exports 맵과 peer 방향이
흔들리지 않는다.

핵심 제약은 규범에서 나온다. Menu의 "Closed: unmount 또는 `hidden` + `inert`, hit testing 불가"와
Dialog의 "Closing: 즉시 action과 focusable child를 inert 처리"는 **CSS와 React가 같은 버전의 `data-*`
계약을 공유해야** 성립한다. 이 불일치는 타입 오류로 절대 잡히지 않는다.

## Decision

1. **changesets를 도입**하고 `fixed`로 `@klipse-design/css`와 `@klipse-design/react`를 동반 버저닝한다.
   `@klipse-design/tokens`는 독립이다.
2. **`@klipse-design/react`는 `@klipse-design/css`를 required peerDependency로 강제**한다. optional로
   두지 않는다.
3. **배포는 ESM 전용이고 서브패스는 명시적으로만 노출**한다. 와일드카드 서브패스를 쓰지 않는다.
4. **exports 맵 규칙:** `types`를 반드시 첫 조건에 둔다(순차 매칭이라 `import`가 앞서면 타입 해석이
   실패한다). `./package.json`을 항상 노출한다.
5. **`sideEffects`를 지금 명시한다.** `packages/tokens`는 `./css` 서브패스로 CSS를 노출하면서
   `sideEffects` 필드가 없다. 지금은 필드 부재가 "side effect 있음"으로 해석돼 안전하지만, 나중에
   최적화 목적으로 `sideEffects: false`를 추가하는 순간 **토큰 CSS가 프로덕션 빌드에서만 조용히
   사라져 테마 전체가 붕괴**한다. `["*.css"]`를 지금 박는다.
6. **changeset 작성 규칙:** 시각 변화가 없어도 **layer 순서 변경과 exit duration 변경은 breaking**으로
   분류한다. [Elevation & Layer](../../foundations/elevation-layer.md)와
   [Motion](../../foundations/motion.md)이 이미 behavior breaking으로 규정한 항목이다.

## Alternatives

### independent (SEED 방식)

SEED가 independent인 이유는 패키지가 40개 이상이고 per-component 패키지가 각자 리듬을 갖기
때문이다. 실제로 SEED의 css와 react는 버전이 벌어져 있다. 2~3 패키지 규모에 그 트레이드오프는
적용되지 않는다.

### linked

이름이 `fixed`와 비슷하지만 **changeset이 있는 패키지만** 그룹 최고 버전에 정렬되므로 버전이 어긋나는
구간이 존재한다. "항상 같이 간다"는 보장을 주지 못한다.

### CSS를 react의 dependencies로

소비자가 CSS를 두 벌 설치할 수 있고, 그 경우 `--louis-*`가 중복 정의되고 레이어가 중복 선언된다.

### CSS를 optional peer로

"열리지만 스타일 없음"은 Menu와 Dialog에서 **조용한 접근성 파손**이 된다. focus ring이 사라지고
44px 타겟이 무너지며, `[data-state="closed"]`의 `display:none`이 적용되지 않아 닫힌 panel이 Tab 순서에
남는다. Menu 규범의 "닫힌 panel의 자손이 Tab 순서와 accessibility tree에 없다"가 CSS 없이 성립하지
않는다.

### tokens를 react의 peer로

css가 tokens를 흡수해 CSS 변수로 굽는 구조이므로 react는 tokens를 알 필요가 없다. 노출 표면을 늘리지
않는다.

### 와일드카드 서브패스

dist 안 모든 파일이 공개 API가 되어 되돌릴 수 없다. 컴포넌트 3종 단계에서는 명시 서브패스가 규범
관리에 유리하다. 서브패스는 **추가가 minor, 제거가 major**이므로 최소 노출로 시작한다.

## Consequences

- 새 devDependency 1개(changesets CLI).
- 배포 전 단계에서 버전을 굴리려면 private 패키지 버저닝 옵션을 켜야 한다. 현재 세 패키지가 모두
  `private: true`다.
- 루트 `engines.node`를 changesets가 요구하는 하한에 맞춰 좁힌다. 소비자 계약 변경이므로 보고에
  명시한다.
- 소비자는 `@klipse-design/css`를 명시적으로 설치해야 한다. pnpm은 peer를 자동 설치하지 않으므로 의도한
  강제가 실제로 작동하고, npm은 자동 설치하므로 환경 차이를 문서에 명시한다.
- 인계서 5절의 역방향 의존 금지가 exports 맵과 peer 방향(tokens ← css ← react)에 그대로 반영된다.

### 규범 충족 근거

Dialog의 "닫힘 타이머는 가장 긴 exit duration과 같은 token에서 계산한다"가 이 결정의 핵심 근거다.
CSS의 exit duration과 React의 타이머가 갈라지면 "카드가 사라진 뒤 투명 root가 pointer를 가로채거나,
root가 먼저 사라져 focus return이 실패"한다 — 규범이 명시적으로 금지한 두 실패다. `fixed`와 required
peer가 "react만 올리고 css는 그대로"라는 조합을 install 단계에서 제거한다.

## Rollback

- `fixed` 제거와 independent 전환은 설정 한 줄이고 무손실이다.
- required peer를 optional로 완화하는 것도 한 줄이지만 위 근거로 권장하지 않는다.
- 서브패스는 추가가 minor, 제거가 major이므로 최소 노출로 시작하는 것이 rollback-safe하다.
- dual 배포로 넓히는 것은 minor로 가능하나 [DS-D-0002](DS-D-0002-web-support-scope.md)의 dual package
  hazard 논거로 막혀 있다.

## Rollout and verification

1. changesets 설정을 추가하고 private 패키지 버저닝을 켠다.
2. `packages/tokens`에 `sideEffects`와 `./package.json` export를 추가한다.
3. css/react의 `type`/`exports`/`sideEffects`/`files`/`peerDependencies` 골격을 확정한다.
   `private: true`는 첫 publish 게이트까지 유지한다.
4. peer 강제가 install 단계에서 실제로 작동하는지 확인한다.
5. 첫 publish 직전에 패키지 정합성 검증 도구를 도입한다.

## 재검토 조건

- 패키지가 5개를 넘거나 릴리스 리듬이 실제로 갈리기 시작하면 independent를 재검토한다.
- 독립 headless package를 요구하는 실제 consumer가 둘 이상 생기면 fixed 그룹을 재구성한다.
- 두 번째 major가 생기면 버전 스위처와 backport 채널을 검토한다.

## DS-D-0036 과의 관계 (2026-09-13 개정)

Status 는 `proposed` 그대로다. 이 절은 결정을 바꾸지 않고, 이미 `accepted` 된
[DS-D-0036](DS-D-0036-git-install-distribution.md)(정본 배포 경로는 git 설치)이 이 결정의 **전제**를
어떻게 바꿨는지 적는다. 이 결정은 npm 레지스트리 게시와 changesets 를 전제로 쓰였고, 그 전제는 아직 한
번도 실행되지 않았다.

### 채널별로 누가 무엇을 하는가

| 이 결정이 맡긴 역할 | 레지스트리 채널(이 결정의 전제) | git 채널(DS-D-0036, 지금) |
| --- | --- | --- |
| css·react 가 같은 계약 버전으로 함께 간다 | changesets `fixed` 동반 버저닝(결정 1) | 제품이 두 패키지를 **같은 sha** 로 고정한다(DS-D-0036 결정 5) |
| 「react 만 올리고 css 는 그대로」 조합을 설치에서 제거 | required peer 의 semver 범위(결정 2) | sha 고정이 대신한다. peer 는 `"@klipse-design/css": "*"` 라 범위로 거르지 않는다 |
| css 를 함께 설치하라고 알린다 | required peer | required peer(`*`) — optional 로 낮추지 않았다. css 를 적지 않으면 npm 은 레지스트리에서 찾다 404, pnpm 은 경고로 끝난다(DS-D-0036 실측) — **막는 것은 아니다** |
| 배포 전 버전 굴리기 | private 패키지 버저닝 | 필요 없다 — 세 패키지 모두 `private: true`, 버전 `0.0.0` 이고 sha 가 식별자다 |

즉 **git 채널에서는 sha 고정이 `fixed` 와 required peer 범위가 설치 단계에서 하려던 일을 한다.**
결정 2 의 「install 단계에서 제거한다」(규범 충족 근거 절)는 레지스트리 채널에서만 참이다. 그리고
레지스트리 채널에서도 pnpm 10 기본 설정에서는 범위 밖 peer 가 **경고로만** 끝난다 —
[DS-D-0002](DS-D-0002-web-support-scope.md) 구현 대조의 실측이다. Consequences 의 「pnpm은 peer를
자동 설치하지 않으므로 의도한 강제가 실제로 작동하고」도 같은 이유로 틀렸다: pnpm 10 은
`autoInstallPeers` 기본값이 `true` 다.

### 이연하는 것 — 「첫 레지스트리 게시」 시점으로

아래는 폐기가 아니라 시점 이동이다. 셋 다 git 채널에서는 할 일이 없거나 해가 없다.

- **changesets 도입과 `fixed` 설정**(결정 1 · Rollout 1). git 채널에는 굴릴 버전이 없다.
- **루트 `engines.node` 좁히기**(Consequences). changesets 가 요구하는 하한에 맞추려던 것이라 함께
  간다. 지금 값은 `>=22` 다. [인계서](../execution-handoff.md) DS-P3-002a 「남은 항목」과 같은 판단이다.
- **peer 범위를 semver 로 되돌리기.** `*` 는 `workspace:` 를 git 소비자에게 보내지 않으려는
  DS-D-0036 결정 3 의 결과다. 게시가 시작되면 `pnpm publish` 가 `workspace:` 를 치환하므로 그때 범위를
  다시 판정한다.
- **패키지 정합성 검증 도구**(Rollout 5)는 원래도 「첫 publish 직전」이었다.

### 지금도 그대로 서는 것

결정 3(ESM · 명시 서브패스), 결정 4(`types` 첫 조건 · `./package.json` 노출), 결정 5(`sideEffects` 명시),
결정 6(layer 순서·exit duration 변경은 breaking)은 채널과 무관하게 구현과 일치한다. 선언 서브패스와
`sideEffects` 는 `scripts/verify-gates.mjs` 가, 서브패스 resolve 와 pack 내용은 `scripts/verify-consumer.mjs`
가 지킨다. 결정 6 의 「breaking 분류」는 changeset 이 없는 동안 Updates 의 「의도적 breaking」
절과 [Releases](../releases.md) 절차가 대신 받는다.

**재검토 조건 추가.** 첫 레지스트리 게시가 실행되거나 저장소 밖 소비자가 둘이 되면(DS-D-0036 재검토
조건과 같다) 위 이연 항목을 이 결정대로 연다.
