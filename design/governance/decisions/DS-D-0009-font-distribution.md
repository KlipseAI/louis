---
id: decision-font-distribution
status: experimental
authority: normative
---

# DS-D-0009 Font distribution

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, token maintainer, package maintainer
- Affects: `@klipse-design/tokens`, `@klipse-design/css`, `foundation-typography`

## Context

토큰의 `font-family-sans`는 `Pretendard Variable, Pretendard, Inter, Noto Sans KR, Noto Sans JP,
system-ui, sans-serif` 스택이고 KO/EN/JA를 다룬다. 컴포넌트 규범 세 개가 모두 "KO/EN/JA 긴 라벨,
200% zoom, 320px container에서 내용이 잘리지 않는다"를 acceptance test로 요구하는데, 이 테스트는
**폰트 폭에 직접 의존**한다.

현재 생성물에 두 가지 결함이 있다.

1. **`--louis-font-family-sans` primitive가 CSS로 방출되지 않는다.** 대신 동일한 스택 리터럴이
   `--louis-typography-*-font-family`에 **15번 중복 인라인**된다. 소비자가 폰트를 교체하려면 15개를 전부
   덮어야 한다.
2. **폴백 스택에 실제 시스템 한글 폰트가 하나도 없다.** `Inter`, `Noto Sans KR`, `Noto Sans JP`는
   시스템 설치 폰트가 아니므로 소비자가 별도로 로드하지 않으면 셋 다 no-op이고 폴백은 곧장
   `system-ui`로 간다. 테스트 환경과 제품 환경의 렌더 폭이 갈리면 위 acceptance test의 재현성이
   무너진다.

## Decision

**디자인 시스템 패키지는 폰트 바이너리를 동봉하지 않는다.** 폰트 소유권은 소비자에게 두되, 교체
지점을 하나로 만든다.

1. **`--louis-font-family-sans`를 CSS로 방출**하고 typography composite가 `var()`로 참조하게 생성기를
   바꾼다. 소비 제품은 `--louis-font-family-sans: var(--font-pretendard), <stack>` **한 줄**로 자기 폰트
   로더와 결합한다. DTCG 소스는 그대로 두고 **생성 단계만** 바꾸므로 게이트가 늘지 않는다.
2. **폴백 스택을 교정**해 실제 OS 한글 폰트를 포함시킨다. 이는 토큰 소스 변경이므로
   [DS-P3-014](DS-D-0010-token-coverage.md)의 변경 단위와 함께 처리한다.
3. **JA를 별도 토큰으로 분리**한다. Pretendard 본체에는 한자가 없고, Pretendard JP는 한글을 포함하지만
   JP 서브셋 CSS가 한글 음절을 선언하지 않는다. 두 로케일을 하나의 스택으로 합칠 수 없다.
4. **`local()` 기반 metric 폴백 face를 opt-in·기본 비활성**으로 제공한다. 지금 특정 폰트 기준값을
   확정하면 다른 플랫폼에서 오히려 폭을 틀어놓는다. 실측 후 활성화를 판정한다.
5. **소비자 가이드**로 로컬 폰트 로딩 레시피를 문서에 제공하고, 다음을 **금지 목록**으로 명시한다 —
   런타임 CDN 참조, 자체 서브셋 생성, 그리고 "latin"으로 라벨링됐지만 실제로는 전체 한글을 포함하는
   서드파티 폰트 패키지.

## Alternatives

### 폰트를 dependencies로 동봉

라이선스 문제는 아니다. OFL 1.1은 번들과 재배포를 허용하고 웹폰트 변환은 수정이 아니다. 문제는
**운영 비용**이다. 업스트림 패키지는 데스크톱 OTF/TTF와 dynamic subset을 모두 포함해 수십~수백 MiB에
이르고, 그것이 모든 소비 제품의 `node_modules`에 들어간다. 또한 제품이 이미 자체 폰트 로더로
Pretendard를 로드 중이면 같은 패밀리가 두 번 정의되고 두 번 다운로드될 수 있다.

### 필요한 woff2만 복사해 self-host

git에 바이너리가 들어가고, 디자인 시스템의 `@font-face`는 제품의 폰트 로더 밖이라 자동 metric fallback과
preload 대상에서 빠진다. 제품이 폰트를 바꾸려면 디자인 시스템의 선언을 무력화해야 한다.

### 자체 서브셋 파이프라인

**라이선스 근거로 폐기한다.** OFL에서 글리프 제거는 Modified Version이므로 Reserved Font Name 제약이
걸린다. 개명한 폰트를 만들면 `font-family` 토큰, Figma parity, 제품 CSS가 전부 갈라지고 서브셋 도구
추가로 게이트도 늘어난다. 업스트림이 만든 서브셋을 **원본 그대로 복사**하는 것은 원본 재배포이므로
개명이 필요 없고, 이는 소비자 가이드의 선택지로만 남긴다.

### 폰트 토큰 자체를 두지 않기 (SEED 방식)

SEED의 CSS 패키지에는 폰트 파일도 `@font-face`도 `font-family` 토큰도 없고 컴포넌트는 전부
`font-family: inherit`이다. Klipse는 이미 typography composite에 fontFamily가 들어 있으므로 여기까지
가지 않고, **교체 가능한 단일 primitive로 간접화하는 중간 지점**을 택한다.

## Consequences

- **새 의존성 0, 새 도구 0, 새 CI 단계 0.** 변경 범위는 생성기의 CSS 방출부 한 곳, CSS 패키지의 opt-in
  파일 하나, 그리고 문서다.
- 폴백 스택 값 변경은 토큰 소스 변경이라 diff에 잡힌다. 분류를 먼저 확인하고 breaking이면
  [DS-GOV-001 절차](../releases.md)를 적용한다.
- 소비자 부담은 폰트 로더 설정 한 번이다.
- `--louis-font-family-sans` 방출은 **추가**이므로 되돌림이 breaking이 된다. 문서에서 이 변수를 공개
  override 지점으로 명시하고 이름을 바꾸지 않는다.

### 규범 충족 근거

세 컴포넌트 규범의 "KO/EN/JA 긴 콘텐츠" acceptance test는 폰트 폭에 의존한다. 폰트 소유권이
소비자에게 있으면서 폴백 스택이 no-op이면 검증 자체가 무의미해지므로, **폴백 스택 교정이 곧
acceptance test의 재현성 조건**이다. Menu의 "item height 40px 이상", Dialog의 "action height 44px 이상"도
행 높이가 폰트 메트릭에 의존하므로 같은 근거를 공유한다.

## Rollback

폴백 스택 교정과 primitive 간접화는 생성물이 결정론적이므로 생성기 재실행만으로 되돌아간다. opt-in
폴백 파일은 제거해도 소비자 breaking이 아니다.

반대 방향(동봉으로 전환)은 비싸다. 라이선스 고지 관리, 바이너리의 git 편입, 소비자 중복 로드 해소
안내가 모두 필요하므로 이 결정을 supersede하는 ADR이 요구된다.

## Rollout and verification

1. 생성기가 `--louis-font-family-sans`를 방출하고 composite가 `var()`로 참조하는지 확인한다.
2. 폴백 스택 교정 후 `node scripts/diff-tokens.mjs`로 분류를 확인하고 breaking이면 baseline 절차를
   적용한다.
3. JA 토큰 분리 후 mode completeness와 CSS parity 게이트를 통과시킨다.
4. 소비자가 변수 한 줄로 폰트를 교체할 수 있는지 fixture로 확인한다.
5. KO/EN/JA 긴 라벨 acceptance test를 교정된 스택에서 재실행한다.

## 재검토 조건

- 공식 지원 대상 플랫폼이 늘고 해당 시스템 폰트 메트릭을 실측하면 opt-in 폴백 face의 기본 활성 여부를
  재판정한다.
- JA 로케일이 실제 제품 요구가 되면 JA 토큰과 가이드를 문서에서 승격한다.
- 제품이 Pretendard가 아닌 브랜드 서체를 채택하면 primitive 하나 교체로 끝나는지 확인한다. 그것이 이
  설계의 목적이다.
- 소비 제품이 둘 이상이 되어 폰트 로딩이 중복되면 단일 `@font-face` 소유자를 지정하는 규약을 Decision으로
  추가한다.

## 결정과 구현 상태를 나눠 적는다 (2026-09-13)

Status 는 `proposed` 그대로다. owner 가 이 결정을 확인할 때 **결정의 옳고 그름**과 **구현이 어디까지
왔는가**가 섞이지 않게 둘을 나눈다. 아래 표의 「구현」 열은 2026-09-13 저장소 실측이다.

| 결정 | 구현 | 근거 |
| --- | --- | --- |
| 바이너리 미동봉 | **지켜진다** | `git ls-files` 에 `woff`·`woff2`·`ttf`·`otf` 0건 |
| 1. `--louis-font-family-sans` 방출 + composite 가 `var()` 참조 | **미구현** | `packages/tokens/generated/tokens.css` 에 `--louis-font-family-sans` 0건. typography composite 의 `font-family` 16곳이 스택 리터럴을 그대로 인라인한다(Context 의 「15번」은 그 뒤 composite 가 늘었다) |
| 2. 폴백 스택에 OS 한글 폰트 | **미구현** | `packages/tokens/src/klipse.tokens.json` 의 `font-family-sans` 는 여전히 `Pretendard Variable, Pretendard, Inter, Noto Sans KR, Noto Sans JP, system-ui, sans-serif` |
| 3. JA 토큰 분리 | **미구현** | JA 전용 `font-family` 토큰 없음 |
| 4. `local()` metric 폴백 face(opt-in) | **미구현** | `packages/css/src`·`generated` 에 `@font-face`·`local(` 0건 |
| 5. 소비자 가이드와 금지 목록 | **미구현** — 이 문서 밖에는 없다 | `design/foundations`·세 패키지 README 에 폰트 로딩 안내 0건 |

**번호 붙은 결정 1~5 는 하나도 구현되지 않았다.** 2026-08-14 Updates 는 구현을 DS-P3-003 과 DS-P3-014 에
배정했는데, DS-P3-003 은 CSS foundation 으로 `done` 이 됐고 이 항목을 가져가지 않았다. **후속 구현은
DS-P3-014(Token coverage 확장)의 소관이다** — 결정 2 가 이미 「DS-P3-014 의 변경 단위와 함께」로
적었고, 1·3·4 도 같은 생성기와 토큰 소스를 건드린다. 5 는 1 이 방출할 변수 이름이 정해진 뒤에
쓴다. 인계서 DS-P3-014 표에 단위로 올리는 것은 그 작업이 한다.

**accepted 로 전환할 때 알아야 할 것.** 결정 1 의 변수는 한 번 내보내면 이름을 바꾸거나 없애는 것이
breaking 이다(Consequences). 결정 2 의 스택 교정은 토큰 **값** 변경이라 `diff-tokens` 분류가 먼저이고,
분류가 breaking 이면 [Releases](../releases.md) 의 baseline 절차를 탄다. 결정을 확인하는 것은 이
둘을 떠안겠다는 뜻이지, 지금 구현이 그 상태라는 뜻이 아니다.
