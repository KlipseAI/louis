---
id: governance-figma-sync
status: experimental
authority: normative
---

> **Figma 를 건드렸으면 마지막에 `pnpm figma-live-check` 를 돌린다.**
>
> `verify-figma-parity` 는 **계약과 스냅숏**을 대조한다. 스냅숏(`figma/readback.json`)은 사람이
> 떠 오는 파일이라, Figma 를 고치고 되읽기를 빠뜨리면 **둘이 함께 낡아 게이트가 초록인 채로
> 어긋난다.** 실제로 세 번 그랬다 — 컴포넌트를 세우고 등재를 빠뜨렸고, 스킨 축을 없애고 LOUIS 를
> 안 맞췄고, SegmentedControl 을 다시 만들고 되읽기를 안 떴다. 셋 다 게이트는 통과했고 사람이
> 물어봐서 드러났다.
>
> ```
> node scripts/figma-live-check.mjs --emit      # 붙여 넣을 코드
> node scripts/figma-live-check.mjs --check <결과.json>
> ```
>
> 이 검사는 CI 에서 돌 수 없다(Figma 접근이 필요하다). **규칙이 아니라 관측 장치**이고,
> DS-D-0028 이 규칙이다. 규칙만으로는 안 지켜진다는 것이 이미 세 번 증명됐다.

# Figma Sync Governance

> ## 규칙 1 — 바꾸면 세 곳을 같이 바꾼다
>
> LOUIS 저장소 · 제품 저장소 · Figma. **하나라도 뒤에 미루면 그 작업은 끝난 것이 아니다.**
> 특히 Figma 를 건드렸으면 같은 작업 안에서 `figma/readback.json` 을 재캡처한다 — 미루면
> 게이트가 낡은 캡처를 보고 **거짓 초록**을 낸다. 근거와 사고 기록은 DS-D-0028.

Figma와 코드는 서로를 자동으로 덮어쓰는 두 정본이 아니다. 승인된 design decision을 중심으로
token과 component parity를 검토하며, 자동 sync가 구현되기 전까지 상태를 과장하지 않는다.

## 운영 파일

Figma에는 역할이 다른 **파일 셋**이 있다. 섞지 않는다. **쓰기 전에 이 표를 확인한다.**

| 역할 | File key | 소유 | 쓰기 |
| --- | --- | --- | --- |
| **LOUIS — 현행 작업 파일** | `OlYKERKOkgbxBEEoXGZW2c` — Figma 상 이름 **"LOUIS"** | 이 저장소 | 허용. **소유자가 「LOUIS 피그마」라고 부르는 파일이 이것이다.** 제품 화면 8페이지 + 자산 + DS 변수 사본. DS 컴포넌트 레이어는 여기에 만든다 |
| 선행 라이브러리 (은퇴 진행 중) | `bxGEp0km5zluMJGulaTvFW` — "Klipse Design System — Library" | 이 저장소 | 조건부. DS 컴포넌트 26개와 변수 378개가 여기 남아 있다. **게이트는 더 이상 이 파일을 보지 않는다** — 2026-08-26 에 대상을 LOUIS 로 옮겼다(`node -e 'console.log(require("./figma/readback.json").figmaFileKey)'` → `OlYKERKOkgbxBEEoXGZW2c`). 이 행이 남는 이유는 폐기가 아직 안 끝났기 때문이다 — 아래 「게이트가 은퇴 파일을 가리켰다 (해소됨)」 참조 |
| 제품 미러 reference | `CNORJOONt4z0a4Bl22Kjuu` — "Klipse 3.0" | 제품/디자인 작업자 | **금지.** 읽기 전용 evidence ([KP-FIGMA-001](../../migration/product-baseline.md)) |

**어느 파일이 LOUIS 인지 헷갈리지 마라.** 이 문서는 오래도록 `bxGEp0km…` 을 「정본 라이브러리」로
적어 왔고, 그 기술을 믿은 작업자가 소유자에게 그 파일을 열어 달라고 반복 요청하는 일이 실제로
일어났다(2026-08-26). 소유자 기준 LOUIS 는 `OlYKERKOkgbxBEEoXGZW2c` 다.

## 목표는 「제품을 다 표현한다」다

Figma 작업의 목표는 **제품에 있는 디자인을 하나도 빠짐없이 Figma 에 올려 두는 것**이다. 그래야
소유자가 그것을 보고 「이건 이거랑 합치자」를 정할 수 있고, 그 결정이 DS 문서화와 제품 최신화로
이어진다. 순서는 이렇다.

**제품 → Figma 에 전부 표현 → (사람이) 합칠 것을 판단 → DS 문서화 · 제품 최신화**

컴포넌트 라이브러리는 이 흐름의 **산출물이지 선행 조건이 아니다.** DS 컴포넌트가 아직 적다는
것은 미달이 아니라 순서상 당연하다.

### green 이 「다 표현했다」는 뜻이 아니다

`verify-figma-parity` 는 **선언된 계약만** 본다. `COMPONENT_CONTRACTS` 에 없는 제품 표면은
게이트의 시야 밖이라, 아무리 많이 빠져 있어도 green 이 나온다.

`figma/product-coverage.json` 이 이미 반대 방향을 보여 준다 — 「제품이 선언한 것을 기계가
열거하고 분류되지 않은 것을 나열한다」. Figma 커버리지도 그 방향이어야 한다.

**2026-09-01: 그 열거기가 섰다.** `migration/product.surfaces.json` 이 앵커 커밋의 제품
트리를 기계로 열거한 원장이고, 분모의 입자도 규칙은
[DS-D-0037](decisions/DS-D-0037-product-surface-denominator.md)이 소유한다 — 표면 하나 =
모듈 최상위의 PascalCase React 컴포넌트 하나. 첫 실측은 **표면 400종 · Figma 대응 10 ·
범위 밖 2 · 미분류 388** 이었다. `check-figma-surface-coverage` 가 그 수를 래칫으로 잠근다:
사유 없는 표면이 늘면 실패하고, 줄면 baseline 을 내리라고 요구한다.

**2026-09-01: 400종을 전수 판정하고 판정 축을 넷으로 열었다 — 미분류는 0 이 됐다.**
축이 둘(대응 / 범위 밖)이던 동안에는 **「Figma 에 세워야 하는데 아직 없다」를 적을 자리가
없었다.** 그것을 `reason` 에 적으면 미등록이 사유로 둔갑해 「범위 밖」으로 세어지고,
커버리지가 올라간 것처럼 보인다 — 손으로 센 원장이 낡는 것과 같은 종류의 거짓 초록이다.
그래서 `verdict` 가 넷이다: `figma` · `scoped` · `needed` · `unclear`.

| 판정 | 뜻 | 실측 | 래칫 |
| --- | --- | ---: | --- |
| `figma` | 그 Figma 컴포넌트 「인」 표면 | 15 | 정확히 일치(떨어질 수 없다) |
| `scoped` | 범위 밖 — 다른 축(보드·아이콘·상태)이 소유하거나 그릴 것이 없다 | 213 | 없음 |
| `needed` | **Figma 에 세워야 하는데 아직 없다** | 160 | **없음 — 늘어도 실패시키지 않는다** |
| `unclear` | 소유자 판단 대기 | 12 | 없음(인쇄만) |
| `unclassified` | 아무도 안 본 표면 | **0** | 정확히 일치(늘면 실패) |

`needed` 가 늘어도 실패하지 않는 이유는 **늘어난 것이 후퇴가 아니라 발견이기 때문이다** —
안 본 표면을 열어 보고 「이건 그려야 한다」를 적은 결과이고, 그것을 빨갛게 만들면 다음 사람은
열어 보지 않는 쪽을 고른다. 줄어드는 방향이 목표이므로 수만 인쇄한다.

**커버리지 비율은 둘을 함께 찍는다** — 전체 대비 3.8%(15/400)와 **대상 대비 8.0%**(15/187,
분모에서 `scoped` 를 뺀 수). 그릴 생각이 없는 표면까지 분모에 넣으면 영원히 낮은 수가 나오고,
반대로 대상 대비만 찍으면 분모를 좁혀 수를 예쁘게 만들 수 있다. 두 수가 서로의 대조군이다.

**`needed` 160건이 곧 「Figma 에 무엇을 그려야 하는가」의 답이다** — high 47 · medium 83 ·
low 30. 우선순위는 원장의 `weight` 가 소유하고, needed 판정에 weight 가 없으면 게이트가 잡는다.

**아래의 손으로 센 표는 그래서 더 이상 유일한 커버리지 원장이 아니다.** 손으로 센 수와
열거기의 수가 갈리면 열거기가 이긴다 — 손으로 센 원장은 낡고, 낡았다는 사실을 재는 자가
없다는 것이 애초에 이 열거기를 세운 이유다.

### 변수 컬렉션 정리 — `1 · Palette` 은퇴 (2026-08-26)

파일에 컬렉션이 여섯이었다. 셋은 DS 정본(`Klipse Primitive`·`Semantic`·`Semantic Color`,
[DS-D-0007](decisions/DS-D-0007-figma-library-structure.md))이고 셋은 이식 과정에서 생긴
보드 고유(`1 · Palette`·`2 · Semantic`·`3 · Scale`)였다. 같은 것을 두 벌 갖고 있었다.

**`1 · Palette` 99개를 없앴다. 컬렉션은 여섯에서 다섯이 됐다.**

값으로 짝을 찾으려던 첫 시도는 **버려야 했다** — 숫자 토큰이 값만 같으면 걸려서
`app/gnb-main-inline-padding`(16)이 `blur/16`에, `app/gnb-sidebar-logo-h`(28)가
`font-size/heading-sm`에 잡혔다. 우연의 일치이지 같은 것이 아니다. **숫자는 값으로 매핑하지
않는다.**

이름으로 다시 맞추니 의미가 보존됐다 — `accent/amber/100` → `color/amber/100`,
`palette/gray-900` → `color/gray/900`, `primary/500` → `color/blue/500`. 95개가 이렇게 짝이
났고, 값 비교가 어긋나 보인 94건은 **저장 정밀도 차이**였다(보드 4자리 `0.9608` ↔ LOUIS 6자리
`0.960784`, 8비트로는 둘 다 245).

이전 절차와 실측:

| 단계 | 건수 |
| --- | ---: |
| 변수→변수 별칭 이전 (`2 · Semantic` → LOUIS) | 173 |
| 노드 바인딩 이전 (8페이지) | 3,358 |
| 이전 뒤 잔여 참조 (12페이지 전수 재확인) | **0** |
| 삭제한 변수 | 97 (매핑 95 + 제품 소비처 0인 `yellow/deep`·`yellow/ink`) |
| 브랜드색 2종 | LOUIS `color/node-{instagram,youtube}-icon` 으로 이전 후 삭제 |

**픽셀 변화 0** — 값이 같은 변수로만 옮겼다.

그 과정에서 버그 하나를 찾았다. `2 · Semantic/node/handle-icon-youtube` 가 네 모드 전부
`accent/youtube/500` 이 아니라 **`accent/instagram/500`** 을 가리키고 있었다. 두 색이 같은
`#ff4b59` 라 지금은 드러나지 않지만 브랜드색이 갈리는 순간 유튜브 핸들이 인스타 색으로 그려진다.

### 남은 둘은 이름 체계가 다르다

`2 · Semantic`(143) · `3 · Scale`(57)은 이름 매핑이 **0건**이다. 규칙이 없어서가 아니라 체계가
다르다 — `node/handle-icon-audio` ↔ `color/node-audio-icon`, `button/height` ↔
`layout/control-height-sm`, `app/gnb-main-inline-padding` ↔ (대응 없음, 제품 셸 고유).

미매칭 접두사: `gray` 58 · `node` 35 · `palette` 31 · `app` 26 · `type` 17.
**이 중 `gray`+`palette` 89개가 알파 변형**(`gray-000 · a78` 류)이며, 이름 매핑이 아니라
static-alpha 정책 결정이 선행돼야 한다.

### 실측 — 모달 (2026-08-26)

`role="dialog"` · `aria-modal` · `.louis-dialog` 중 하나를 쓰는 제품 표면이 **22곳**이다.
그중 `.louis-dialog` 를 실제로 소비하는 곳은 **8곳**(하나는 렌더 계약 픽스처라 실질 7).

| LOUIS 채택 (8) | 자체 구현 (14) |
| --- | --- |
| ConfirmModal · GlassConfirmModal · CreateProjectModal · PricingModal · PromptVariantCompareModal · SignupLegalModal · RenderContractClient(픽스처) | CommandPalette · Gnb · SettingsScene · CreativeMediaClient · ImageCropModal · CropModal · ClipCropModal · NodeCanvasGuideModal · NodeCanvasAnalysisModal · ProjectVideosPopover · YoutubeSchedulePickers · YoutubeUploadModal · VideoEditModal · ColorPopover · VideoPlayer |

**Figma 의 `Dialog` 는 이 22곳 중 어느 것도 온전히 대표하지 못한다.** 지금은
`Size`(compact·medium·large) 축 하나에 「제목 + 설명 + 액션 2개」 골격뿐이다.

빠진 것 중 확실한 하나: **파괴적 확인(삭제)이 없다.** 제품의 확인 모달 두 벌이 모두
`confirmVariant?: "primary" | "danger"` 를 갖는데(`ConfirmModal.tsx:31`,
`GlassConfirmModal.tsx:35`) Figma 에는 그 축이 없다. 계약도 `Size` 하나만 선언한다 —
**축을 늘리려면 `COMPONENT_CONTRACTS` 를 먼저 고친다**([figma-component-authoring](figma-component-authoring.md) 10절).

### 다음에 할 일

1. 모달 22곳을 Figma 에 표현한다(합치기 전에 **있는 그대로**).
2. 소유자가 보고 합칠 것을 정한다.
3. 정해진 대로 계약을 고치고 컴포넌트를 줄인다.
4. 같은 열거를 모달 밖으로 넓힌다 — 이 절이 모달만 다루는 것은 거기서 시작했기 때문이지
   그것만 부족해서가 아니다.

### 게이트가 은퇴 파일을 가리켰다 (해소됨 2026-08-26 — 5단계 중 1~4)

> **해소 확인 (2026-09-01).** 이 절은 아래 5단계를 적으면서 「그 전까지 이 절을 지우지 않는다」는
> 조건을 스스로 달아 두었다. **그 조건이 충족됐다.** 그래도 지우지 않고 이력으로 남긴다 —
> 「red 를 감수하고 먼저 옮기는 편이 정직하다」는 판단이 어떻게 뒤집혀 나왔는지가 다음에 같은
> 상황을 만났을 때 쓰는 재료이고, 이 저장소는 판정의 이력을 보존한다.
>
> 확인은 세 축이다. **수를 이 표에서 읽지 말고 명령을 다시 돌려라** — 산 숫자를 산문에 적으면
> 반드시 낡는다(`figma/readback.json` 머리말이 같은 함정을 이미 기록한다: 「43 인 채로
> 47·49·50 을 지나왔다」).
>
> | 확인 | 명령 | 2026-09-01 결과 |
> | --- | --- | --- |
> | 되읽기의 대상 파일 | `node -e 'const r=require("./figma/readback.json");console.log(r.figmaFileKey,r.capturedAt)'` | `OlYKERKOkgbxBEEoXGZW2c 2026-08-29` |
> | 스냅숏의 대상 파일 | `node -e 'console.log(require("./figma/snapshot.json").provenance.figmaFileKey)'` | `OlYKERKOkgbxBEEoXGZW2c` |
> | 「DS 컴포넌트 0 개」 | `node -e 'console.log(Object.keys(require("./figma/readback.json").components).length)'` | `51` |
>
> `verify-figma-parity` 는 파일 키를 스스로 갖지 않는다 — `scripts/verify-figma-parity.mjs:16` 이
> `figma/snapshot.json` 만 읽으므로, 스냅숏이 옮겨간 순간 게이트도 함께 옮겨졌다. 「게이트를 돌린다」에
> 별도 조치가 없었던 이유가 이것이다.
>
> **남은 것은 5 단계(선행 파일 폐기) 하나이고, 소유자 행동이다.** 그때까지 위 「운영 파일」 표의
> 선행 라이브러리 행은 남는다.

**아래는 2026-08-26 당시의 기록이다 — 현재 상태가 아니다.** 문장은 그때 쓴 그대로 둔다.

`readback.json` · `snapshot.json` · `verify-figma-parity` 는 여전히 `bxGEp0km…` 를 읽는다.
**이것은 의도가 아니라 미완결이다.** 그대로 두면 게이트는 아무도 안 쓰는 파일에 대해 green 을 낸다.

지금 바로 대상을 바꿀 수는 없다 — LOUIS 파일에는 **DS 컴포넌트가 0개**이고 변수도 344 개로
선행 파일(378)보다 34 개 적다(그 34 개는 [DS-D-0025](decisions/DS-D-0025-figma-as-projection.md)
에 따라 동결됐다). 대상을 옮기면 게이트가 즉시 red 가 된다.

해소 순서를 2026-08-26 에 바꿨다. 원래는 「컴포넌트를 먼저 세운 뒤 옮긴다」였는데, 색
프리미티브 21 개를 올리자 parity 가 곧바로 red 가 되면서 **먼저 옮기는 편이 정직하다**는 것이
드러났다. 은퇴 파일에 대고 내는 green 을 유지하려고 이전을 미룰 이유가 없다.

**변수를 먼저 옮기고, 게이트를 LOUIS 파일로 돌린 뒤, 컴포넌트를 세운다.**

1. LOUIS 파일의 `Klipse*` 동결 해제 → `apply-variables.*.js` 로 토큰 전량 동기화
   ([DS-D-0025 정정](decisions/DS-D-0025-figma-as-projection.md#정정-2026-08-26-같은-날)) — **완료**
2. `readback.json` 을 LOUIS 파일에서 다시 뜨고 snapshot 재생성 → parity 대상 이전 — **완료**
3. 이 시점에 parity 는 **컴포넌트 0 개 때문에 red 로 남는다. 의도된 상태다** — 지금 상태의
   정직한 표현이며, 컴포넌트를 세우면서 줄어든다 — **지나갔다.** 이 red 는 컴포넌트를 세우면서
   실제로 사라졌다
4. 컴포넌트 레이어 구축([figma-component-authoring](figma-component-authoring.md)) — **완료**
5. 선행 파일 폐기 — **남았다(소유자 행동)**

그 전까지 이 절을 지우지 않는다.

**이전은 끝나지 않았고, 두 파일은 지금 서로 다른 것이 됐다(2026-08-22 실측).**

> **이 절의 수는 2026-08-22 실측이다 — 그 뒤로 전부 움직였다.** LOUIS 열의 collection 이름
> 체계(`1 · Palette` …)는 「변수 컬렉션 — 다섯이고, 각자 하는 일이 있다」 절이, 변수·style 수는
> `figma/readback.json` 이 정본이다(`node -e 'const r=require("./figma/readback.json");console.log(Object.keys(r.collections).length, Object.keys(r.styles.text).length, Object.keys(r.styles.effect).length)'`).
> 표를 지우지 않는 것은 **두 파일이 언제 갈라졌는지**가 이 표에만 남아 있기 때문이다.

2026-08-21에 새 파일 `OlYKERKOkgbxBEEoXGZW2c`를 `SEJUNKI` 팀에 만들고 변수 258개와 style
23개를 옮겼다. 그 뒤 그 파일에서 **제품 화면 이식**이 진행되면서 파일의 성격이 갈렸다.
두 파일을 Figma에서 직접 세면 이렇다.

| | `bxGEp0km5zluMJGulaTvFW` (선행 라이브러리) | `OlYKERKOkgbxBEEoXGZW2c` (**LOUIS** — 현행) |
| --- | --- | --- |
| 페이지 | Cover · Foundations · Components · Patterns · Templates · Product inventory (6) | 여정 순 8페이지 (00 START HERE ~ 99 보류) |
| collection | `Klipse Primitive` · `Klipse Semantic` · `Klipse Semantic Color`(2모드) | `1 · Palette`(2모드) · `2 · Semantic`(4모드) · `3 · Scale` |
| 변수 | 345 | 299 |
| text style · effect style | 15 · 8 | 46 · 4 |

**collection 이름 체계가 서로 다르다.** 한쪽에서 다른 쪽으로 그냥 옮길 수 없고, 옮기려면
매핑을 먼저 결정해야 한다.

`readback.json`·`snapshot.json`과 `verify-figma-parity`는 그때 **선행 라이브러리
`bxGEp0km5zluMJGulaTvFW`를 가리켰다.** 2026-08-26 에 셋 다 LOUIS 로 옮겼다 — 위
「게이트가 은퇴 파일을 가리켰다 (해소됨)」 이 그 이력을 소유한다.
현행 작업 파일은 `OlYKERKOkgbxBEEoXGZW2c`("LOUIS")이고 제품 화면 조립 규약은
[figma-screen-assembly](figma-screen-assembly.md)와 `klipse-figma-transplant` 스킬이 소유한다.
**둘을 섞지 마라 — 어느 파일에 쓰는지 먼저 확인한다.**

선행 라이브러리 파일은 2026-08-14에 `SEJUNKI` 팀(pro tier, Full seat) drafts에 생성됐다. 단일 파일
3-페이지 구조를 유지한다 — 파일 간 변수·component 소비는 발행을 요구하는데
[DS-D-0025](decisions/DS-D-0025-figma-as-projection.md)가 발행하지 않기로 했으므로 파일 분리는
검토 대상이 아니다.

### 실측된 capability (2026-08-14, 라이브러리 파일)

- variable collection 생성과 두 번째 mode 추가: 가능
- collection당 mode 상한: **10개** (Professional tier 값과 일치)
- `Pretendard` 폰트 사용 가능 (Inter, Noto Sans KR/JP도 있음)
- 요금제나 API가 바뀌면 이 절을 재실측해 갱신한다.

### 쓰기 정책

1. 위 표에서 쓰기가 허용된 파일에만 쓴다. 다른 파일에 대한 쓰기는 사용자가 명시적으로 대상을
   지정하기 전까지 `blocked`다.
2. 자동화 경로는 Figma MCP(Plugin API)뿐이다. Variables REST API는 Enterprise 전용이라 쓰지 않는다.
3. **library publish는 어떤 방법으로도 자동화하지 않는다.** publish API가 존재하지 않으며 항상
   사람이 Figma UI에서 수행한다. publish 여부를 추측해 상태를 올리지 않는다.
4. 쓰기 스크립트는 idempotent해야 하고, 실행 전후 상태를 대조해 무엇이 바뀌었는지 보고한다.
   **변수 적용은 `figma/apply-variables.*.js`가 유일한 경로이며 번호순으로 전부 실행한다** — `scripts/build-figma-variables.mjs`가
   token proposal에서 생성하며 `verify-figma-variables`가 드리프트를 잡는다. 그 파일 내용을
   `use_figma`에 그대로 넘기고 손대지 않는다. 즉석 코드를 쓰지 않는 이유는 `inventory-draw.*.js`와
   같다 — 쓰는 코드가 대화에만 있으면 무엇을 적용했는지가 남지 않는다.
   생성 시점에 현재 라이브러리 스냅샷과 **변수 258개·값 318건을 전수 대조해 불일치 0**을 확인했다.
   style도 같다 — `figma/apply-styles.js`는 `scripts/build-figma-styles.mjs`가 만들고
   `verify-figma-styles`가 지키며, **값 140건을 전수 대조해 불일치 0**을 확인한 뒤 적용했다.

   **effect style에는 모드가 없다.** DTCG shadow는 테마별로 값이 갈리는데 Figma effect style은
   단일 값이라 **Light를 명시적으로 고른다.** 고르지 않고 첫 모드를 쓰면 Dark가 잡혀
   `elevation/menu`의 헤어라인이 어두운 값으로 들어간다 — 라이트 화면에 검은 테두리가 생긴다.
   다크 그림자는 Figma가 표현하지 못한다.

   **rename·remove는 apply-variables가 표현하지 못한다.** apply-variables는 변수를 **이름으로**
   찾으므로 이름이 바뀐 토큰은 rename이 아니라 "새 이름 없음 → 새 변수 생성"으로 보이고, 옛 변수는
   orphan으로 남아 컴포넌트 바인딩이 끊기고 `verify-figma-parity`가 실패한다. 이름 이전이 필요할
   때만 쓰는 **1회성 마이그레이션 도구 두 개**가 이 간극을 메운다. 둘 다 손으로 쓴 커밋된 파일이며
   즉석 코드가 아니다(무엇을 적용했는지가 저장소에 남는다):
   - `figma/rename-variables.js` — **apply-variables보다 먼저** 한 번. 접두 규칙으로 변수를
     **ID를 보존한 채** in-place rename해 바인딩·alias를 살린다. idempotent, 대상 이름이 이미
     있으면 conflict로 보고하고 덮지 않는다.
     `apply-variables`가 그 뒤 새 이름으로 값을 맞추고 진짜 신규 변수만 만든다.
   - `figma/remove-variables.js` — **apply-variables를 모두 실행한 뒤** 마지막에 한 번. 아키텍처에서
     제거된 primitive(현재 `inverse-alpha` 2계열)를 지운다. apply가 alias를 새 primitive로
     재지정한 뒤라야 안전하다. idempotent.

     이 두 도구는 규칙 기반이라 특정 스냅샷에 묶이지 않는다 — token proposal에서 생성하지 않으므로
     드리프트 게이트가 없고, 대신 실행 후 `verify-figma-parity`가 전수 대조로 결과를 지킨다.
     이름 이전이 끝나 라이브가 새 이름으로 정착하면 두 도구는 no-op이 된다.
5. Figma 쪽 수동 편집과 충돌하면 덮어쓰지 않고 diff를 보고한다.
6. **되읽기는 페이지를 명시적으로 전환한 뒤 수행한다.** `figma.currentPage`는 매 호출 첫 페이지로
   초기화되므로, `await figma.setCurrentPageAsync(page)` 없이 세면 component가 조용히 0개로 나온다.
   실제로 겪은 사고이며, 덤프가 "없음"과 "안 봄"을 구분하지 못하는 형태다.
7. 아이콘 되읽기는 `icon/` 접두사 component마다 frame 크기·vector 수·stroke 두께·cap·paint
   바인딩 수를 담는다. **좌표는 담지 않는다** — Figma vector 왕복 손실을 아직 실측하지 않았기
   때문이며, 대신 요소 분해 보존(코드 `elementCount` ↔ Figma `vectors`)을 대조한다. 도형이
   병합되거나 사라지는 사고는 좌표를 보지 않아도 이것으로 드러난다.

## Figma로 그대로 옮길 수 없는 것

**근사치를 지어내지 않는다.** 아래는 CSS에서만 성립한다. 재현하지 말고 `재현 불가`로 표시한 뒤
코드를 원천으로 두고, 무엇을 포기하고 무엇으로 대체할지는 이 문서가 정해질 때까지 비워 둔다.
숫자는 배포본 `KlipseAI/klipse-web` 기준이다.

| 항목 | 규모 | 왜 안 되나 |
| --- | --- | --- |
| `backdrop-filter` (뒤 배경 블러) | **50개 파일** | 뒤에 실제로 무엇이 있느냐에 따라 결과가 달라진다. 단색 채우기로 대체하면 다른 화면이 된다 |
| 그라디언트 마스크 | **17개 파일** | 블러·이펙트에 알파 그라디언트를 씌우는 형태다. 레이어 마스크로는 강도가 점진적으로 변하는 구간이 재현되지 않는다 |
| 테마를 따라가지 않는 그림자 | `--louis-elevation-menu` | 드롭다운·메뉴·팝오버의 앰비언트 섀도우다. 제품의 옛 `--dropdown-ambient-shadow` 별칭은 P#1 에서 폐기됐고 지금은 제품이 LOUIS 정본을 직접 소비한다(`globals.css:59-62`). 정의가 한 벌이라 **다크에서도 같은 값이고**, 다크용 변형을 Figma 에서 새로 만들면 코드와 갈린다 |
| `@layer` 밖 규칙의 우선순위 | — | 명시도와 무관하게 유틸리티를 이긴다. 옮길 때 `!`가 필요한 자리는 스타일 결정이 아니라 이 우선순위 때문이며, Figma에 대응 개념이 없다 |

사용처 표본 — `backdrop-filter`: `app/admin/AdminClient.tsx` · `app/admin/BannerManagement.tsx` ·
`app/mypage/upgrade/page.tsx`. 마스크: `components/scenes/appHomeSceneStyles.ts`(배너 슬라이드의
progressive blur) · `components/landing/navigation/Gnb.tsx` · `components/navigation/CommandPalette.tsx`.

> **표본이 한 번 통째로 낡았다.** 앞선 판의 마스크 표본 셋(`app/HomePageClient.tsx` ·
> `components/banners/TabBannerCarousel.tsx` · `app/mypage/upgrade/page.tsx`)은 배포본 `df414c24`
> 에서 **한 곳도 마스크를 갖고 있지 않다.** 캐러셀 파일은 아예 없어졌고(`6602fd24`), 배너의 마스크는
> `appHomeSceneStyles.ts` 의 `bannerSlide` 로 옮겨 갔다. 숫자와 표본은 배포본이 움직이면 같이 낡으므로
> 재기준선 때 함께 다시 센다.

막힌 자리는 근사치로 메우지 말고 기록한다 — 무엇이 없어서 raw로 그렸는지는
[figma-gap-registry](../../migration/figma-gap-registry.md)가 소유한다.

제품 값을 읽어 Figma에 옮길 때의 함정은
[제품을 읽을 때 틀리는 자리](../foundations/product-reading-traps.md)가 소유한다. **그리기 전에 읽는다.**

## 현재 상태

- published Klipse Design library: `not-ready` — **미달이 아니라 선택이다.**
  [DS-D-0025](decisions/DS-D-0025-figma-as-projection.md)가 Figma를 참조용 projection으로 확정했고
  발행하지 않기로 했다. publish를 남은 과제로 적지 않는다. **그리고 카탈로그의 `figma` 상태는
  이 선택과 무관해졌다** — [DS-D-0035](decisions/DS-D-0035-figma-done-without-publish.md)가
  `done` 을 게시가 아니라 대조로 다시 정의했다
- library 파일: collection 3개(`Klipse Primitive` · `Klipse Semantic` · `Klipse Semantic Color`).
  **수는 이 문서가 갖지 않는다** — `pnpm verify-figma-parity` 출력과 `figma/snapshot.json` 이 낸다.
  publish하지 않음
- P2 token/Figma proposal pipeline: local `release-candidate`
- generated proposal: `packages/tokens/generated/figma.tokens.json` — `done`, not published
- variable/style parity checker: `done` — `scripts/verify-figma-parity.mjs`가 `pnpm verify`에
  연결됨. 변수·style·component·icon 을 전수 대조하고 **변조 canary** 를 매 실행에서 자체
  검증한다. 각 수는 그 게이트의 출력 한 줄이 낸다
- snapshot export: `done` — `figma/readback.json`(Plugin API 되읽기 원본)과 `figma/snapshot.json`
  (parity 입력)으로 나뉘며 `scripts/build-figma-snapshot.mjs`가 후자를 생성한다. snapshot을 손으로
  쓰지 않는다는 규칙이 성립하려면 **손으로 쓰지 않는 경로가 실제로 존재해야 한다**
- icon component: `partial` — `icon/{kebab}`, 24×24 frame 하나, 크기 variant 없음. stroke와
  fill을 전부 `color/foreground-primary`에 바인딩해 raw 값 0을 만족한다. publish 전
- text/effect style: `done` — `typography/*` 15종, `elevation/*` 4종 (semantic tier 이름)
- **파일 구조(2026-08-18): Cover → Foundations → Components → Templates.** Foundations는 그 전까지
  **최상위 노드가 0개**였다 — 변수 210개와 style 22개가 파일에 있는데 **보이는 것이 하나도
  없었다.** 색(semantic 41 × Light·Dark 두 열, `setExplicitVariableModeForCollection`으로 한 화면),
  타이포(text style), 간격·반경(막대 길이와 모서리가 변수 값 그대로), 그림자(effect style)를
  세웠고 **전부 변수·style 바인딩이라 값이 바뀌면 문서가 따라온다.**
- **게이트가 검사하는 것만 잘돼 있었다.** parity는 raw 값 0·변수 바인딩·기하를 34종 canary로
  지키지만 "사람이 열었을 때 쓸 수 있는가"는 아무도 검사하지 않는다. 그 부분만 비어 있었다.
- **Components 페이지 정리(2026-08-18): 세트마다 이름과 목적문이 캔버스에 보인다.** 그 전에는
  세트를 클릭해야만 설명이 보였고, 새로 만든 6개(TextField · SegmentedControl · Checkbox · Slider ·
  SelectableListRow · Avatar)는 **아예 섹션 밖에 흩어져 있었다.** Forms 섹션을 만들어 입력 계열을
  모으고, 나머지 둘은 Content로 넣었다. 섹션 순서는 Actions → Forms → Content → Overlays →
  Feedback → Shell → Icons이며 **읽는 순서**를 따른다 — 누르는 것, 값을 넣는 것, 내용, 위에 뜨는
  것, 알리는 것, 껍데기, 글리프
- **라벨의 목적문은 손으로 쓰지 않는다.** `figma/component-summaries.json`이 규범 문서의 H1 다음
  첫 문단 첫 문장을 담고 `scripts/build-figma-summaries.mjs`가 생성한다. `pnpm check`에 연결돼
  있어 규범 문서가 바뀌면 **생성물이 어긋나 실패한다** — Figma 라벨이 조용히 낡는 경로를 닫는다.
  이름 해석은 `build-figma-snapshot.mjs`와 같은 규칙(`figmaNames ?? figmaName`)을 쓴다
- 이 과정에서 실측으로 드러난 것 둘: Forms 섹션이 Figma 기본 짙은 회색으로 만들어져 **검은 글자가
  안 보였고**(나머지 6개는 흰색), Components 페이지 배경만 **순검정**이라 다른 세 페이지와 달랐다.
  둘 다 형제에서 값을 읽어 맞췄다. 섹션은 자식을 붙여도 스스로 커지지 않아 흰 면이 내용 밖에서
  끊겼다 — 자식 경계로 다시 크기를 잡았다
- component library: publish 전. component·아이콘 수는 `pnpm verify-figma-parity` 출력과
  `figma/snapshot.json` 이 낸다. 최신은 SegmentedControl 2 variant(Size)이며
  선택/비선택은 variant 축이 아니라 한 variant 안의 두 자손이다 — 색만 다르고 기하가 같다
- component parity checker: `done` — Figma variant 옵션을 코드 타입 선언과 대조하고, 선언되지 않은
  property와 raw 값 사용을 실패로 처리한다

P2는 review 가능한 proposal까지만 소유한다. 실제 library evidence가 생길 때까지 manifest의 Figma 상태는
`not-ready`다. 파일이 생성됐다는 사실만으로 어떤 상태도 올리지 않는다.

## P2 proposal contract

- `packages/tokens/src/klipse.tokens.json`의 안정 token ID, type, mode, alias와 description을 보존한다.
- `scripts/lib/token-model.mjs`가 proposal의 primitive/semantic token, raw/resolved value, alias,
  description/deprecation과 root metadata를 JS·JSON·manifest와 같은 normalized graph에서 검증한다. CSS는
  같은 graph의 semantic consumption surface다.
- TypeScript declaration은 별도로 JavaScript export와 token ID/type/mode/alias/value-shape contract를
  맞춘다.
- Figma collection, mode와 variable name 변환을 명시하고 이름 충돌을 build error로 처리한다.
- Figma가 composite typography, shadow, easing이나 runtime layer를 완전히 표현하지 못하면 field expansion과
  loss metadata를 포함한다.
- 이전 proposal과의 diff는 create, stable ID/mode remove, source-path-only move, value/alias change, mode change,
  description/deprecation과 collection change를 구분한다. 공개 ID rename은 create + deprecated replacement +
  remove 순서로 다룬다.
- proposal은 credential 없이 CI에서 생성·검증할 수 있어야 하며 자동 publish하지 않는다.

## 목표 흐름

1. P2 구조화 token source에서 Figma-compatible proposal을 생성한다.
2. proposal은 자동 적용하지 않고 token maintainer와 design maintainer가 diff를 review한다.
3. P3에서 승인된 proposal을 library draft에 적용하고 stable variable key를 기록한다.
4. 이름, mode, alias, component property와 variant parity를 검사한다.
5. 승인한 Figma change와 code change를 같은 DS release에 연결한다.
6. ~~제품 screen은 published library component instance를 소비하고 detach 이유를 제품 이슈에 기록한다.~~
   **철회 — [DS-D-0025](decisions/DS-D-0025-figma-as-projection.md).** 발행하지 않기로 했으므로 파일 간
   component 소비가 성립하지 않는다. 이식 보드의 화면 조립은 보드 고유 컴포넌트와
   `1 · Palette`/`2 · Semantic`/`3 · Scale`로 계속한다.

## 승격 조건

P2 private release-candidate와 proposal만으로는 `figma: not-ready`를 유지한다.
`figma: partial`에는 review 가능한 P3 library draft와 stable variable/component key가 필요하다.
`figma: done`에는 **게시가 아니라 대조**가 필요하다. 조건은
[DS-D-0035](decisions/DS-D-0035-figma-done-without-publish.md)가 셋으로 다시 적었다 —
(a) 같은 파일 안에서 인스턴스로 소비 가능한 component set(readback 등재 · description),
(b) `verify-figma-parity`가 지키는 variant/state parity(미선언 property는 실패),
(c) 계약 ↔ `figma/components.measured.json` ↔ 브라우저 테스트로 닫히는 **두 방향** 기하 evidence.
`scripts/verify-figma-done.mjs`가 manifest에 대고 그 셋을 다시 계산하므로, 정의는 문장이 아니라
게이트다.

**published library key/version은 사라진 조건이 아니라 시점이 다른 조건이다** — 파일이
갈라지거나(DS-F-009) 외부 소비자가 생기면 되살아난다. 그 전까지 publish를 남은 과제로 적지
않는다는 [DS-D-0025](decisions/DS-D-0025-figma-as-projection.md)의 판단은 그대로다. parity check는
발행과 무관하게 계속 강제된다.

credential이나 plugin session이 없는 CI에서도 catalog가 정직해야 하므로, Figma 연결 실패를
`done`으로 캐시하지 않는다.

## 변수 컬렉션 — 다섯이고, 각자 하는 일이 있다

`1 · Palette` 은퇴로 여섯이 다섯이 됐고, 2026-08-26 에 남은 둘의 정체를 확정했다.
**`2 · Semantic` 과 `3 · Scale` 은 Klipse 컬렉션과 중복이 아니었다** — 이름 규칙만 달랐을 뿐
계층이 다른, 제품 전용 값들이다(`app/*` · `node/*` · `landing/*` 접두사가 그 사실을 말한다).
그래서 지우는 대신 하는 일이 이름에 드러나게 옮겼다.

| 컬렉션 | 모드 | 개수 | 하는 일 |
| --- | --- | ---: | --- |
| `Klipse Primitive` | Base | 196 | 원시값. 색·간격·반경·글자 크기의 바닥 |
| `Klipse Semantic` | Global | 87 | 의미로 이름 붙인 비색상 값(높이·두께·레이어) |
| `Klipse Semantic Color` | Light · Dark | 104 | 의미로 이름 붙인 색. 테마 두 벌 |
| `Klipse Product Color` | dark · light · light-sidebar · landing-light | 110 | **제품 전용** 색. DS 가 아직 흡수하지 않은 화면별 색 |
| `Klipse Product Scale` | Base | 57 | **제품 전용** 치수. GNB·노드·툴팁 등 화면별 측정값 |

`Klipse Product *` 두 개가 남아 있는 것은 실패가 아니라 **아직 안 끝났다는 표시**다.
여기 있는 값이 DS 로 올라갈 만하면 `Klipse Semantic*` 으로 옮기고, 화면 하나에만 쓰는 값이면
여기 남는다. 그 판단은 사람이 한다.

### 모드가 다르면 합칠 수 없다

`Klipse Product Color` 를 `Klipse Semantic Color` 로 접으려면 후자에 `light-sidebar` 와
`landing-light` 모드를 더해야 한다. Figma 컬렉션은 모드 축을 하나만 갖기 때문이다. 이는
「제품에 테마 스코프가 넷 있다」를 DS 가 인정하는 결정이며, 값 정리가 아니라 모델 변경이다.
그 결정 전에는 합치지 않는다.

### 알파는 여기에도 적용했다

`Klipse Product Color` 의 알파 변형 79 개가 옛 값(a94 · a78 · a65 …)을 그대로 쓰고 있었다.
DS-D-0026 의 16단으로 스냅해 **79 → 46** 으로 줄였다(19 개는 이름·값을 옮기고, 33 개는 이미
있는 단계로 병합했다). 컬렉션은 143 → 110 이 됐다.

병합 과정에서 배운 것 두 가지를 남긴다.

- **인스턴스 자식은 메인만 고쳐서는 안 되는 경우가 있다.** 로컬 오버라이드를 가진 인스턴스는
  자기 바인딩을 따로 들고 있어서, 메인을 고쳐도 따라오지 않는다. 메인을 먼저 고친 뒤 남은 것을
  다시 훑어야 한다.
- **`figma.mixed` 인 TEXT 노드는 `node.fills` 로 못 고친다.** 구간마다 색이 다른 텍스트는
  `getStyledTextSegments(['fills'])` 로 읽고 `setRangeFills` 로 써야 한다. 그리고 고친 뒤에도
  `node.boundVariables.fills` 에는 **옛 변수를 가리키는 잔재 기록이 남는다** — 어떤 문자 범위도
  지배하지 않으므로 렌더에는 영향이 없지만, 바인딩을 세는 스크립트는 이걸 실제 참조로 오인한다.
  참조를 셀 때 TEXT 는 반드시 구간 단위로 세라.

## 색 팔레트 — 여섯에서 여섯으로, 겹치는 것 없이

2026-08-26 에 서로 겹치던 패밀리를 정리했다.

| 폐지 | → | 근거 |
| --- | --- | --- |
| `sky` 9단 | `blue` (제품은 `--primary-*`) | 둘 다 파랑이었다. 단계 대 단계. |
| `ultra` 1단 | `blue/200` | 400 한 단계짜리 연파랑. 단계로 붙이면 Δ143 이라 **최근접**으로 갔다(Δ26). |
| `amber` 9단 | `yellow` | 100 단계는 값이 아예 같았다(#fff5d6). |
| `green` 4단 | `mint` → **`green` 으로 개명** | Klipse 의 초록은 이제 민트 계열(#00c68e)이고 이름은 하나다. |

남은 팔레트: `blue` 16 · `green` 9 · `palette-gray` 12 · `pink` 9 · `red` 9 · `violet` 9 · `yellow` 9
+ 앵커 `static/black` · `static/white`.

### 알파 패밀리는 14 에서 4 로

`gray-{0,100,200,300,500,600,700,800,900,1000}-alpha` 열 종이 있었다. 흡수 기준은 **합성 결과**다 —
쓰이는 배경 위에 올렸을 때 색이 같아 보이는 `static-black/white-alpha` 단계를 골랐다. 최대 오차
11.7/441(2.7%)로 눈에 띄지 않는다. 88% 이상은 배경이 12% 밖에 안 비치므로 불투명 팔레트색으로 보냈다.

- `gray-1000-alpha` → `static-black-alpha` (같은 #000000, 오차 0)
- `gray-0-alpha` → `static-white-alpha` (#fafafa → #ffffff, 2%)
- 남은 알파: `static-black-alpha` 16 · `static-white-alpha` 16 · `red-alpha` 3 · `green-500-alpha` 1

### 표가 순서대로 보이려면 자릿수를 맞춰야 한다

Figma 변수 표는 이름으로 정렬하고 `variableIds` 쓰기를 막아 두었다 — **이름이 유일한 지렛대다.**
알파는 2자리(`04`), 팔레트는 3자리(`050`)로 맞췄다. `gray/1000` 은 순수 검정이라
`static/black` 으로 빼서 gray 를 000~900 균일하게 만들었다.

### 고정 회색은 `palette-gray` 다

적응형 semantic `color/gray/700` 과 고정 primitive 가 같은 id 를 갖고 충돌했다. 제품이 이미
`--gray-*`(적응형)과 `--palette-gray-*`(고정)로 구분하므로 그 어휘를 따랐다.
