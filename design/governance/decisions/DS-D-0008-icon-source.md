---
id: decision-icon-source
status: experimental
authority: normative
---

# DS-D-0008 Icon source architecture

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, design maintainer, package maintainer
- Affects: `foundation-iconography`, `@klipse-design/react`, `component-button`,
  DS-P3-013, DS-F-006

## Context

Klipse Design에는 아이콘 자산, 파이프라인, 규범이 하나도 없다. 배포 화면 재조립(목표 B)은 아이콘
없이 성립하지 않는다.

제품 실측이 드러낸 것은 "라이브러리를 안 골랐다"가 아니라 **같은 글리프가 네 곳에서 수동
동기화되고 있다**는 것이다 — `public/icons/`의 정적 SVG, `node-canvas-v2/icons/`의 인라인 TSX,
Canvas Path2D 재현본, 그리고 `public/` 루트의 80×80 컬러 타일. 세 번째와 네 번째 계층의 주석이
중복을 명시적으로 인정한다.

추가 실측:

- `@phosphor-icons/react`와 `lucide-react`가 선언돼 있으나 실제 import는 각각 1건과 0건이다.
  락인은 없고 dead dependency가 하나 있다.
- 정적 자산의 다수가 `black`/`white` 하드코딩이며 mask로 덮어쓰는 것을 전제로 만들어졌다. 그 전제가
  깨지는 `<img>` 소비처에서 라이트 테마 흰 배경에 흰 선이 그려진다.
- viewBox가 32 / 24 / 20 / 16으로, `stroke-width`가 2 / 2.4 / 1.5 / 1.4 / 1.2로 분열돼 있다.
- 제품에는 정본 두께 공식이 있다 — `strokeWidth = screenPx × viewBox / size`이고 표준
  `screenPx = size / 16`이므로 **viewBox 32에서 stroke-width는 크기와 무관하게 항상 2**다. 24
  격자로 옮기면 정확히 1.5다. 준수율이 낮은 이유는 공식이 없어서가 아니라 게이트가 없어서다.
- **자산 63개 어디에도 라이선스·저작권·출처 metadata가 없다.** `<title>`, `<desc>`, `<metadata>`,
  주석이 전부 부재하며 전량 Figma 내보내기 형태다.

출처는 좌표 대조로 상당 부분 특정된다. Phosphor 원본(`raw/regular/*`, 256 격자 stroke 16)을 ÷8하면
제품의 32 격자 자산과, ×24/256하면 제품의 24 격자 자산과 좌표가 일치하는 글리프가 다수 확인됐다.
Iconoir(24/1.5)와 Lucide(24/2)도 마찬가지로 확인됐다. 그러나 어떤 대조도 **배포 권한의 확인이
아니다.**

## Decision

1. **`packages/react/src/icons/svg/{name}.svg` 하나를 아이콘 지오메트리의 유일한 정본으로 한다.**
   Figma component, React 컴포넌트, 아이콘 manifest, 고지문은 모두 이 정본의 결정론적 projection이다.
2. **Figma는 아이콘의 downstream이다.** 디자이너가 Figma에서 authoring하는 것은 권장하지만, 승인된
   결과는 SVG로 내보내 저장소에 커밋해야 정본이 된다. 역방향 동기화가 필요해지면 별도 Decision과
   conflict policy가 먼저다.
3. **개별 글리프는 provenance 없이 채택되지 않는다.** `provenance.json`의 각 항목은
   `{ "origin": "original" }` 또는
   `{ "origin": "upstream", "project", "icon", "license", "licenseFile", "sourceUrl", "retrievedAt", "modifications" }`
   중 하나이며, upstream 항목은 **`modifications`를 포함해 일곱 필드를 모두** 갖춘다. 빈 값,
   `"unknown"`류 상투어(대소문자 무관), 추정 출처는 빌드 실패다. provenance를 확인할 수 없는
   글리프는 **채택하지 않고 다시 그린다.** 이 Decision은 어떤 글리프의 라이선스도 판정하지 않는다 —
   판정하는 것은 "확인된 것만 들어온다"는 절차다.
   - 같은 그림이 두 이름으로 들어오지 않는다. 지오메트리가 같은 두 글리프는 실패다 — 한쪽을
     `original`로 선언하면 다른 쪽의 고지 의무가 조용히 가려지기 때문이다.
   - 이름이 다른 두 글리프가 같은 React 심볼로 방출되지 않는다(`x-2`와 `x2`는 둘 다 `IconX2`다).
4. **upstream 글리프는 고지문과 함께만 배포한다.** `licenseFile`이 가리키는 라이선스 원문을
   `packages/react/src/icons/licenses/`에 커밋하고, 빌드가 `packages/react/THIRD-PARTY-NOTICES.md`를
   생성한다. 이 파일은 패키지 `files`에 포함된다. MIT와 ISC가 공통으로 요구하는 "copies 또는
   substantial portions에 고지문을 포함한다"를 기계로 충족하기 위한 것이며, 고지문 생성 없이
   upstream 글리프를 배포하는 경로는 규범상 존재하지 않는다.
5. **브랜드 로고와 제3자 상표는 아이콘 세트가 아니다.** 다색·고정색이라 `currentColor` 계약을
   만족할 수 없고, 상표 사용 조건은 오픈소스 라이선스와 다른 축이다. 별도 트랙으로 남긴다.
6. **정본은 정규화된 형태로만 커밋한다.** viewBox `0 0 24 24`, 색 슬롯은 `currentColor`와
   `fill="none"`만, `stroke-width`는 선언된 허용 집합(초기값 `1.5`)만, root `width`/`height` 없음,
   `id`/`clip-path` 없음, 편집기 metadata·`<title>`·`<desc>`·주석 없음, 결정론적 속성 순서.
   좌표 스케일 변환은 **이관 시 한 번만** 수행해 정본에 커밋하며 파이프라인이 매 실행 스케일하지
   않는다. `d` 속성의 숫자는 재작성하지 않는다.
7. 다음 파일은 정본의 결정론적 projection이며 직접 편집하지 않는다.
   - `packages/react/src/icons/generated/index.tsx`
   - `packages/react/src/icons/generated/manifest.json`
   - `packages/react/THIRD-PARTY-NOTICES.md`
8. **생성물은 모듈 스코프 호출을 포함하지 않는다.** 글리프는 `export function`으로 방출한다.
   `packages/react`는 `tsc`로만 빌드하고 tsc의 JSX 변환은 `/*#__PURE__*/`를 붙이지 않으므로, 팩토리
   호출 형태로 방출하면 `sideEffects: false`가 있어도 번들러가 미사용 글리프를 제거하지 못한다.
   생성기는 렌더 결과에 최상위 호출식이 없음을 검증한다.
9. **새 workspace package를 만들지 않는다.** 아이콘은 `@klipse-design/react`의 `./icons` 서브패스로
   배포한다. 근거는 Consequences에 있다.

## Alternatives

### 저장소 SVG 정본 + 생성 파이프라인 (선택)

DS-D-0001의 code-first 논리를 지오메트리에 적용한다. credential 없이 검증되고, 글리프 하나가 교체
단위이며, 총량이 수십 KB라 동봉 비용이 무시할 수 있다. 비용은 정규화 규칙을 사람이 지켜야 한다는
것인데 이는 게이트로 강제 가능하다.

### Figma 정본 + 추출

디자이너 workflow에 자연스럽고 이름·크기·프레임을 디자인 도구가 소유한다. 폐기 근거는 셋이다.

**credential 의존.** 정본을 읽는 데 Figma 접근이 필요해 아이콘 추가·수정이 외부 권한 gate 뒤로
들어간다. 인계서가 금지한 상태다. DS-F-004의 credential-free 우회는 Figma가 downstream일 때만
성립하며, Figma가 정본이면 `figma/snapshot.json`이 정본이 되어 "snapshot은 손으로 수정하지 않는다"는
쓰기 정책과 충돌한다.

**지오메트리 왕복 손실.** 제품 자산이 그 증거다 — upstream의 arc 명령이 제품 사본에서 cubic으로
평탄화돼 있고, 이는 Figma 재내보내기 흔적이다. 정본이 byte 재현 불가능하면 DS-D-0001에 해당하는
검증이 존재할 수 없다.

**publish 순서 역전.** publish 전에는 파일 간 component 소비가 불가능하므로 Figma 정본을 코드가
소비하려면 publish가 선행 조건이 된다. publish는 사람 수동이며 권한 밖이다.

### 외부 아이콘 라이브러리 의존

라이선스 축만 보면 유일하게 확정적인 선택지다 — 고지 의무가 패키지 metadata로 전달된다. 그럼에도
폐기하는 근거는 셋이다.

**교체 지점 부재.** 글리프 하나가 Klipse 시각 언어와 맞지 않을 때 덮어쓸 지점이 없다. 제품이 이미 이
벽에 부딪혀 19개를 손으로 복제했고 그 복제본이 지금의 다중 정의 부채다.

**정규화 계약 부재.** 라이브러리의 viewBox·stroke·색 규약은 우리 것이 아니다. 둘을 섞으면(제품이
이미 그렇다) 좌표계가 갈라지고 DS-F-006의 "raw 값 0"을 Figma 쪽에서 만족시킬 방법이 사라진다.

**Figma parity 불가.** 라이브러리 아이콘에 대응하는 Figma component를 우리가 소유하지 않으므로 목표
B의 검증 대상이 존재하지 않는다.

**이 대안은 완전히 죽지 않는다.** 결정 3은 "upstream SVG를 라이선스와 함께 vendoring한다"를 명시적
허용한다. 폐기하는 것은 라이브러리 자체가 아니라 **라이브러리를 런타임 의존성으로 두는 것**이며,
입력으로 쓰면 교체 지점과 정규화 계약이 우리에게 남는다.

### DS-D-0009와 갈리는 지점

폰트는 "동봉하지 않는다"였고 아이콘은 동봉한다. 세 축이 각각 다른 이유로 뒤집힌다.

- **번들 크기.** DS-D-0009가 동봉을 폐기한 실제 이유는 라이선스가 아니라 업스트림 패키지가 수십~수백
  MiB이고 그것이 모든 소비 제품의 `node_modules`에 들어간다는 것이었다. v1 아이콘 세트의 정본 SVG
  총량은 수십 KB 규모다. 세 자릿수 MiB와 두 자릿수 KB를 같은 축의 같은 방향에 놓을 수 없다.
- **교체 지점.** DS-D-0009의 답은 `--louis-font-family-sans` 한 줄이었다. 아이콘에는 그 등가물이 없다 —
  값이 아니라 자산 N개이고, 교체 단위는 글리프 하나 = 파일 하나다.
- **라이선스.** 여기서만 방향이 같다. DS-D-0009는 OFL을 읽고 확인한 사실로 썼고, 이 결정은 같은
  방식으로 upstream LICENSE를 읽어 고지 의무를 결정 4의 산출물로 만든다. 다른 점은 폰트는 개명
  제약(Reserved Font Name) 때문에 서브셋 파이프라인을 폐기했지만, 아이콘 MIT/ISC에는 그런 제약이
  없어 정규화 변환이 허용된다는 것이다.

## Consequences

- **새 workspace package 0.** 게이트 diff는 `verify-gates.mjs`의 react `subpaths`에 `"./icons"` 한
  줄이다. 별도 `@klipse-design/icons`를 만들면 changesets `fixed`(DS-D-0006) 하에서 어차피 react와
  함께 버전이 오르므로 분리 이득이 없고, 되돌림이 breaking이다. 인계서의 "두 개 이상의 실제
  consumer가 요구하기 전에는 분리하지 않는다"와도 일치한다.
- **새 런타임 의존성 0.** 파서·정규화기·생성기는 Node 표준 라이브러리만 쓴다.
- 새 스크립트 2개(`build-icons.mjs`, `verify-icon-gates.mjs`)와 게이트 명령이 늘어난다.
  `build`/`check`/`verify` 세 명령의 표면은 변하지 않는다.
- CSS는 `packages/css/src/component/icon.css` 파일 하나다. `build-css.mjs`가 component 디렉터리를
  자동 편입하므로 CSS 패키지의 `exports`와 `declaredPackageSurfaces`는 바뀌지 않는다.
- 정본 커밋은 정규화된 SVG만 허용하므로 Figma 내보내기를 그대로 커밋하면 실패한다.
- 지오메트리 정확성은 게이트가 검증할 수 없다. 정규화·해시·이름·고지는 기계가 잡지만 "이 실루엣이
  맞는가"는 사람의 시각 review다. 이 공백을 Known deviation으로 명시한다.
- 제품 자산 이관은 자동이 아니다. upstream 원본에서 재생성하고, provenance를 확인할 수 없는 것은
  채택하지 않는다.

## Rollback

정본이 저장소 안의 일반 파일이므로 되돌림이 싸다. 파이프라인에 결함이 생기면 마지막 승인 정본으로
돌아가 생성물을 재생성한다.

**`"./icons"` 서브패스 공개는 되돌릴 때 breaking이다**(DS-D-0006: 서브패스 추가는 minor, 제거는
major). 그러므로 서브패스는 첫 글리프 세트가 게이트를 전부 통과한 뒤에만 연다. 그 전까지 생성물은
커밋하되 `exports`에 올리지 않는다 — DS-D-0011이 overlay primitive에 쓴 것과 같은 형태다.

Figma 정본으로 전환하는 반대 방향은 비싸다. 정본 이동, 게이트의 credential 의존, snapshot 쓰기 정책
개정이 모두 필요하므로 이 결정을 supersede하는 ADR이 요구된다.

## Rollout and verification

1. 정본 SVG를 저장소 파서로 읽어 요소·속성 allowlist, viewBox, 색 슬롯, stroke 허용 집합, id 부재,
   provenance 완전성, licenseFile 존재를 검증한다.
2. `index.tsx`, `manifest.json`, `THIRD-PARTY-NOTICES.md`를 한 실행에서 생성한다.
3. 같은 process에서 동일 정본을 두 번 render해 byte-for-byte 동일함을 확인한다.
4. 렌더 결과에 최상위 호출식이 없음을 확인한다 (결정 8).
5. 변조 canary가 각 게이트를 실제로 실패시키는지 매 실행에서 증명한다.
6. Figma parity는 snapshot에 `icon/*`이 덤프된 뒤 manifest와 대조한다.
7. published Figma library와 public package release는 별도 gate 전까지 `not-ready`를 유지한다.

## 재검토 조건

- 글리프 수가 100을 넘거나 아이콘만 소비하는 consumer가 생기면 별도 package 분리를 재판정한다.
- Figma vector 왕복 손실을 실측하면 geometry parity를 경고에서 실패로 승격한다.
- `packages/react` 빌드가 tsc 외 번들러로 바뀌면 결정 8의 근거를 재검토한다.
- 제품이 Canvas Path2D 계층을 유지해야 한다면 정본에서 Path2D 상수를 함께 생성할지 별도 결정으로
  정한다.
