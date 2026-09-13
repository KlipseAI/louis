---
id: decision-token-coverage
status: experimental
authority: normative
---

# DS-D-0010 Token coverage 확장 원칙

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, token maintainer
- Affects: `@klipse-design/tokens`, `foundation-typography`, `foundation-color-theme`,
  `governance-execution-handoff` (DS-P3-014)

## Context

[화면 인벤토리](../../../migration/screen-inventory.md)와 제품 CSS 실측으로, 현재 token source가
배포 화면을 재조립하기에 좁다는 사실이 확인됐다. 확장 규모는 약 169개(primitive 98 + semantic 71)이며
그중 108개가 배포 화면 재조립에 필수다.

동시에 **기존 토큰의 값 오류**가 드러났다. `typography-title-sm`(28px)과 `typography-title-md`(36px)는
weight 600인데, 배포 화면의 heading은 전량 medium 500이다(semibold·regular 사용 0회). 제품에
`.type-heading-28-semibold` 클래스가 *정의*돼 있어 [token mapping](../../../migration/token-mapping.md)이
그 클래스를 매핑했지만, 실사용은 medium뿐이었다. 정의된 값과 사용되는 값을 구분하지 않은 결과다.

> **낡음 표시(2026-08-21).** 위 「semibold 사용 0회」는 **이 결정이 쓰인 2026-08-15에는 맞았다.**
> 지금은 `.type-heading-28-semibold`가 **5곳** 쓰인다 — `CreativeMediaAdminClient.tsx:252`와
> `CreativeMediaClient.tsx:703·794·913·963`. 전부 `creative-media`(부스 체험)이고, 그 기능은
> **나흘 뒤인 2026-08-19**에 들어왔다(`750f0fc8`). `regular 사용 0회`는 지금도 맞고,
> `type-heading-36-semibold`·`-48-semibold`도 여전히 정의만 있고 사용은 0이다.
>
> **판정 원칙은 그대로다** — 오히려 이 사례가 원칙을 강화한다. 「정의가 아니라 실사용을
> 승격한다」면 실사용은 **계속 다시 재야 한다.** 한 번 재고 문서에 적어 두면 제품이 그 밑에서
> 움직인다.

이 결정은 무엇을 승격하고 무엇을 승격하지 않을지의 **판정 원칙**을 고정한다. 개별 토큰 추가는 이
원칙에 따른 후속 변경 단위가 수행한다.

## Decision

### 1. 판정 원칙

1. **정의가 아니라 실사용을 승격한다.** 제품 CSS에 정의만 되고 사용되지 않는 값은 승격하지 않는다.
   승격 근거에는 사용 화면과 빈도를 남긴다.
2. **반전 램프를 승격하지 않는다.** 제품의 `--gray-*` 반전 램프가 하는 일은 semantic role이 이미
   mode로 흡수한다. 반전을 primitive로 옮기면 mode 축이 두 벌이 된다.
3. **DOM 상태 스코프는 토큰 축이 아니다.** `[data-page-root]`나 `body:has(...)` 같은 런타임 조건으로
   갈리는 값은 새 mode를 만들지 않고 소비 계층이 mode를 다시 적용해 해결한다.
4. **알파는 primitive로 세운다.** DTCG에 연산이 없어 alias로 파생할 수 없다. 알파 스톱은 제품의 73개
   변형을 10단(4/8/12/16/24/32/48/56/64/72)으로 정규화한다. 88% 이상은 알파가 아니라 불투명 잉크이므로
   `color-fg-*` solid role로 흡수한다.

   > **낡음 표시(2026-09-13).** 「알파는 primitive로 세운다」는 그대로다. **계단은 바뀌었다** —
   > [DS-D-0026](DS-D-0026-alpha-scale.md)(accepted, 2026-08-26)이 알파를 **16단(32까지 4씩, 그 위
   > 8씩)**으로 다시 정했고 `static-black-alpha` · `static-white-alpha` 가 같은 16단을 갖는다. 위의
   > 10단과 실행 인계서 단위 2 절의 14단은 그 결정 이전의 기록이다. 현재 계단은 DS-D-0026 이 소유한다.
5. **제품 부채를 승격하지 않는다.** 근거 불명 리터럴, 중복 팔레트, 소비처 0인 변수는 승격 대상이
   아니라 제품이 정리할 대상이다. 이런 항목은 미채택 목록에 사유와 함께 남긴다.
6. **팔레트 램프는 완결성을 우선한다.** 램프의 일부 단계가 미참조여도 허용한다. 다만 램프에 속하지
   않으면서 역할 없이 남은 primitive는 `$deprecated`로 표시한다.

### 2. 타이포 스케일 — 실사용 15종

`typography` composite를 실사용 15종으로 재편한다.

- body 계열 4 size(caption 12 · body-sm 14 · body-md 16 · body-lg 20) × 3 weight(400/500/600) = 12
- heading 계열 3 size(heading-sm 28 · heading-md 36 · heading-lg 48) × medium(500) = 3

명명은 `typography-{font-size 이름}-{font-weight 이름}`이며 두 조각 모두 기존 primitive ID에서
그대로 가져온다. `label`, `title` 같은 새 어휘를 만들지 않는다.

파생 규칙: `letterSpacing = fontSize × -0.01em`(body·caption) 또는 `× -0.02em`(heading),
`lineHeight` 1.5(body·caption) / 1.35(heading), `fontFamily`는 `font-family-sans`와 같은 스택.

**21종 전량 미러(7×3)는 채택하지 않는다** — 실사용 0인 heading regular/semibold 6종을 승격하게 되어
원칙 1에 어긋난다. **크기와 weight 분리도 채택하지 않는다** — DTCG `typography` composite가
`fontWeight`를 필수로 요구해 분리가 성립하지 않는다.

### 3. 도메인 색은 semantic으로 승격하되 오염을 기록한다

캔버스의 채널 색(video·image·text·social·audio·edit)은 장식이 아니라 **노드 타입 식별자**이므로
semantic role로 승격한다. 현재 tier가 `primitive`/`semantic` 2단뿐이라 도메인 전용 토큰이 semantic에
들어간다. 이는 계층 오염이며, component tier 도입은 컴포넌트 패키지 착수 시 재검토한다. tier 추가는
schema breaking이므로 지금 하지 않는다.

### 4. 표현 불가 항목은 재현 불가로 문서화한다

- **gradient:** 지원 타입에 없고 실사용이 1건이라 타입 추가를 정당화하지 않는다. 재현 불가로 남긴다.
- **backdrop-filter / mask:** 토큰 타입이 없다. blur 반경만 `number` primitive로 올리고 나머지는 재현
  불가로 문서화한다.
- **inset shadow:** 현재 shadow 스키마가 5개 속성을 exact로 강제해 `inset`을 받지 못한다. DTCG는
  `inset`을 정의하므로 스키마 확장은 스펙 이탈이 아니지만, 검증기 변경을 동반하므로 별도 결정으로
  분리한다.

### 5. 채택 범위

`(highlight-standalone)` route group은 제품이 이미 폐기 예정으로 선언했으므로 범위 밖이다. `admin`은
범위 안이되 Tailwind 잔재 hex를 제품이 정리한 뒤 반영한다.

## Alternatives

### 제품 CSS를 그대로 흡수

배포 화면과 즉시 일치한다. 그러나 제품이 스스로 부채로 기록한 항목(소비처 0인 변수 사다리, 근거 불명
리터럴, 중복 팔레트)까지 정본이 된다. [DS-D-0001](DS-D-0001-token-source.md)이 제품 CSS 역파싱을
정본으로 삼지 않기로 한 이유가 그대로 적용된다.

### 확장하지 않고 현행 유지

변경 비용이 없다. 그러나 배포 화면 재조립(목표 B)이 불가능하고, 이미 발견된 heading weight 오류가
남는다. 목표 자체를 포기하는 선택이다.

### 필요할 때마다 개별 추가

점진적이지만 판정 기준이 매번 달라져 semantic 계층이 일관성을 잃는다. 원칙을 먼저 고정하는 편이
후속 변경 단위의 리뷰 비용을 줄인다.

## Consequences

- 토큰 수가 174에서 약 340으로 늘어난다. 검증 시간과 생성물 크기가 함께 늘어난다.
- 타이포 재편은 breaking이다. `typography-title-sm/md`의 weight가 600에서 500으로 바뀌고 ID가
  `typography-heading-{sm,md}-medium`으로 대체된다. 공개 release와 published library가 없으므로
  [Releases](../releases.md)의 baseline 갱신 절차로 처리한다.
- semantic 계층에 도메인 색이 들어가 tier 계약이 부분적으로 오염된다. 이 사실을 감수하고 기록한다.
- Figma 라이브러리의 변수·style을 재적용해야 한다. 적용 스크립트가 idempotent하고 parity 게이트가
  stale snapshot을 경고하므로 절차상 안전하다.
- 그라디언트·마스크가 필요한 화면 일부는 라이브러리만으로 재조립되지 않는다. 이 한계를 화면 재조립
  검증(DS-F-007)의 gap registry에 명시한다.

## Rollback

각 변경 단위는 독립 커밋이므로 단위별로 되돌릴 수 있다. 타이포 재편만 breaking이므로 되돌릴 때
baseline도 함께 되돌린다. Figma는 이전 proposal로 재적용하면 되며, 변수 ID가 유지되므로 바인딩이
끊기지 않는다.

원칙 자체를 되돌리는 경우 이 결정을 supersede하는 ADR을 먼저 승인한다.

## Rollout and verification

1. 이 결정을 기록한다(코드 변경 없음).
2. 타이포 15종 재편 — breaking. baseline 갱신과 Updates를 같은 변경 단위에 담는다.
3. 알파 축 26개 — 순증.
4. 채널 팔레트 40개와 채널 semantic 24개 — 순증.
5. contrastPairs 확장 — 추가 쌍이 실제 WCAG 계산을 통과하는지 게이트로 확인한다.
6. elevation/border-width/radius, layer/motion, sky/editor 계열을 순서대로 추가한다.
   (2026-09-13 표시: sky 는 2026-08-26 에 blue 로 접혀 대상이 사라졌다.)
7. 각 단위마다 `pnpm build`, `pnpm check`, `pnpm verify`를 통과시키고 Figma를 재적용한 뒤 snapshot을
   재덤프한다.

## Open questions

다음은 이 저장소가 단독으로 결정할 수 없다. 제품 저장소의 확인이 필요하다.

| # | 질문 | 왜 막히는가 |
| --- | --- | --- |
| ~~1~~ | ~~제품의 미커밋 `--surface-*`/`--border-*` 9개를 정본으로 볼 것인가~~ | **해소(2026-08-21). 질문이 성립하지 않는다** — 아래 참조 |
| ~~2~~ | ~~앱 셸 라이트 램프를 어떻게 처리할 것인가~~ | **대상이 사라졌다(2026-09-13 확인).** 제품이 `--palette-gray-200` 과 `-rgb` 미러를 LOUIS 토큰 별칭으로 바꾸고 앱 셸 재매핑을 걷었다 — 아래 참조 |
| 3 | ~~채널 disabled의 light 값~~ → **라이트 비활성을 만드는 필터 연산을 DS가 값으로 표현할 것인가** | 2026-09-13 에 질문을 바꿨다. disabled 12종은 이미 원천에 있고, 제품은 라이트에서 disabled 토큰이 아니라 활성 토큰에 필터를 건다. **소유자 판정** — 아래 참조 |

**1 — 미채택으로 닫는다.** 그 9개는 제품에 **존재하지 않는다** (2026-08-23 재확인: 정본 `design` 계열에서도 `--surface-*` 0건 · `--border-*` 0건. 당시 확인 대상은 `origin/main` 이었고 정본은 그 뒤 옮겨졌다). 구 제품 저장소의
추적되지 않는 작업 트리에만 있었고 그것도 이관 번들 자신의 패치가 만든 것이다(커밋 HEAD 0건,
작업 트리 2곳). 어느 저장소에도 커밋된 적이 없으므로 「정본으로 볼 것인가」가 성립하지 않는다.
~~같은 대조에서 구 저장소의 `globals.css` HEAD가 배포본과 **바이트 단위로 동일**함도 확인됐다
(토큰 358 대 358, diff 0줄) — 두 저장소가 갈렸다는 전제 자체가 성립하지 않는다.~~

> **2026-08-23 정정.** 이 문장은 더 이상 성립하지 않는다. 그때의 비교 대상은 `origin/main` 이었고
> 그 뒤 정본이 `design` 계열로 옮겨졌다. 두 브랜치는 실제로 갈렸다 — `globals.css` 만
> `glass-` 30건 대 **0건**이다. **미채택 판정 자체는 유지된다**(위 재확인 참조) — 근거로 든
> 「바이트 동일」만 무효다. `origin/main` 으로 재실측하면 폐지된 글래스 섀도우를 다시 읽게 된다.

> **2 — 대상이 사라졌다(2026-09-13 확인).** 앵커 `6fbdac16` 에서 제품은 `--palette-gray-200` 과
> `--palette-gray-200-rgb` 를 둘 다 LOUIS 토큰의 별칭으로 선언한다(`globals.css:49` ·
> `globals.css:66`). hex 와 미러가 같은 원천을 읽으므로 238/239 어긋남이 생길 자리가 없고,
> `body:has(...)` 로 램프를 재매핑하던 앱 셸 규칙도 걷혔다(`Gnb.tsx:1391-1396` 주석). 아래 2의 두
> 문단(「남은 질문은 하나다」 · 「2도 닫혔다」)과 제품 미러 결함 서술은 2026-08-21 의 기록이다.

**2 — 남은 질문은 하나다.** 앱 셸 램프 네 단계를 전부 쟀고 어긋나는 곳은 `palette-gray-200`
하나다. hex `#eeeef1`은 238 238 241인데 rgb mirror는 `238 239 241`이라 **G 채널만 1 차이**이며,
`palette-gray-100`·`150`·`300`은 모두 일치한다. 같은 색이 소비 경로에 따라 다르게 렌더된다는 뜻이고,
램프의 다른 단계에서 규칙을 추론할 수 없다(150은 R=G, 300은 R≠G). **G가 238인가 239인가**가
정해지면 닫힌다. 실측 근거는 [실행 인계서](../execution-handoff.md)의 `DS-P3-014` 절에 있다.

> **3 — 질문을 바꿨다(2026-09-13).** 아래 2026-08-21 실측의 **토큰 표는 지금도 맞다** — 제품
> 라이트 오버라이드는 여전히 `--node-handle-bg-{channel}` 만 200 으로 바꾼다(`globals.css:626-627`
> 등). **그러나 「라이트에서 비활성 핸들이 거의 검정이 된다」는 제품 화면에서 일어나지 않는다.**
> 제품 소비처는 라이트에서 disabled 토큰을 읽지 않고, 활성 토큰(`--node-handle-bg-{channel}` ·
> `--node-handle-icon-{channel}`)에 `brightness(0.78) saturate(0.95)` 를 건다
> (`NodeSideButtons.tsx:182-214` · `VideoNode.tsx:317-350` · `EditNode.tsx:203-230`). 제품 토큰
> 주석도 그렇게 적는다 — 「비활성(라이트)은 소비자 유틸리티에서 필터+채널 토큰 유지」
> (`globals.css:502`).
>
> 그리고 disabled 12종은 이미 원천에 있다 — `color-node-handle-{bg,icon}-disabled-{channel}`
> (`8de65bb`, 2026-08-26), 두 모드 값이 같은 `{ramp}.900` · `{ramp}.700` 이다. LOUIS 레시피는 두
> 테마 모두 그것을 읽고, 라이트에서 제품과 갈리는 것을
> [Node Side Handle](../../components/node-side-handle.md) Known deviations 1이 편차로 적는다.
>
> **그래서 남은 질문은 「필터 연산을 DS 가 값으로 표현할 것인가」다.** 필터는 연산이라 옮길 토큰
> 값이 없다. (a) 지금처럼 두 테마가 같은 disabled 토큰을 읽고 편차로 남긴다, (b) 필터가 만든 색을 재서
> 라이트 disabled 값을 따로 세운다(값 변경 · breaking), (c) 레시피가 라이트에서 활성 토큰에 같은
> 필터를 건다. 이 저장소가 단독으로 고르지 않는다 — **소유자 판정**이다.
>
> 같은 자리의 두 번째 소유자 질문: `color-node-{audio,edit,image,instagram,text,youtube}-{icon,surface}`
> 12개는 두 모드 모두 `color-node-handle-icon-*` · `color-node-handle-bg-*` 와 같은 primitive 를 가리키고
> 소비처가 없다. 지울 것인가 — removal breaking 이고 Figma 변수 삭제가 따라오므로 **지우지 않았다**.
> 경위는 [실행 인계서](../execution-handoff.md) DS-P3-014 단위 4 절.

**3 — 실측(2026-08-21). 라이트에서 비활성 핸들이 거의 검정이 된다.**

제품의 라이트 오버라이드는 채널 토큰 중 **`--node-handle-bg-{channel}` 하나만** 재정의한다
(다크 `accent-{ramp}-800` → 라이트 `accent-{ramp}-200`). `icon`과 `disabled` 계열 넷은 재정의가
없어 **다크 값을 그대로 물려받는다.**

| 축 | 다크 | 라이트 | 판정 |
| --- | --- | --- | --- |
| `handle-bg` | `{ramp}-800` | `{ramp}-200` | 재정의됨 |
| `handle-icon` | `{ramp}-500` | `{ramp}-500` (상속) | 라이트 면이 200이라 대비가 성립한다 |
| `handle-bg-disabled` | `{ramp}-900` | **`{ramp}-900` (상속)** | **라이트 페이지에 거의 검정 면** |
| `handle-icon-disabled` | `{ramp}-700` | `{ramp}-700` (상속) | 위 면 위라서 보이기는 한다 |

**활성 핸들은 라이트에서 연한 면(200)인데 비활성 핸들만 거의 검정(900)이 된다.** 비활성이 활성보다
훨씬 눈에 띄는 상태이며 의도로 보기 어렵다. 제품 확인이 필요하다.

### 선택 액센트는 채널별 축이다 (2026-08-21 추가)

위 네 축과 별개로 **선택 액센트**가 있고, 그것은 단일 값이 아니라 **채널마다 다른 축**이다.
`[data-node-accent="…"]` 셀렉터가 `--node-selection-accent-rgb`를 채널마다 재선언하며, 그 변수가
카드 외곽선(86%)과 타이틀 색(100%)에 동시에 들어간다.

| `data-node-accent` | 참조하는 팔레트 | 해결 hex |
| --- | --- | --- |
| `video` | `--primary-500-rgb` | `#0088ff` |
| `image` | `--accent-mint-500-rgb` | `#00c68e` |
| `text` | `--accent-yellow-500-rgb` | `#ffb200` |
| `youtube` | `--accent-red-500-rgb` | `#ff4b59` |
| `instagram` | `--accent-red-500-rgb` — **YouTube와 의도적으로 같다** | `#ff4b59` |
| `audio` | `--accent-pink-500-rgb` | `#ff4d88` |
| `edit` | `--accent-violet-500-rgb` | `#6055ff` |

**선택 강조를 한 색으로 옮기면 일곱 중 여섯이 틀린다.**

**양 테마 동일하다.** 일곱 규칙이 전부 테마 셀렉터 **밖**의 속성 선택자라 라이트/다크가 갈리지
않는다 — 위 네 축(`handle-*`)과 성격이 다르다.

`instagram`이 `youtube`와 같은 것은 실수가 아니다. 제품이 그 자리에 주석으로 의도를 적어 두었다.

근거: `globals.css:571-598`(일곱 셀렉터) · `:152`·`:191`·`:210`·`:228`·`:247`·`:267`(팔레트) ·
`components/scenes/create/node-canvas-v2/index.tsx:360`·`:359`(소비).

**그래서 단위 4는 절반만 올렸다.** 두 테마에 값이 정의된 축(`surface` 6 · `icon` 6 ·
`selection accent` 7 = **19종**)을 semantic으로 승격했고, disabled 계열 12종은 **라이트 값이
정해질 때까지 올리지 않는다.** 상속된 값을 정본으로 굳히면 이 결함이 DS 계약이 된다.
(2026-09-13 표시: 12종은 그 뒤 `8de65bb` 로 올라갔다 — 위 3의 표시 참조.)

**2도 닫혔다(2026-08-21). `G = 238`, hex `#eeeef1`이 정본이다.** 주 소비 경로가 hex이고,
앱 셸 램프의 `palette-gray-100`·`150`이 둘 다 R=G라 이웃과 맞으며, 반대로 골라도 색차가 감지
한계 아래다. 제품의 `-rgb` 미러(`238 239 241`)는 결함으로 남으며 제품이 고치는 것이 정합이다.

**두 대기 사유가 모두 없어졌다.** 앱 셸 램프 토큰을 추가할 수 있고, 목표 B의 앱 셸 라이트 화면
제외도 해제할 수 있다. 남은 것은 3(채널 disabled의 light 값)뿐이다.
(2026-09-13 표시: 3은 「필터 연산을 DS 가 값으로 표현할 것인가」로 바뀌었고 소유자 판정 대기다.)
