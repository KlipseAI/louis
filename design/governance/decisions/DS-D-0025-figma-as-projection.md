---
id: decision-figma-as-projection
status: experimental
authority: normative
---

# DS-D-0025 Figma는 참조용 projection이다 — 라이브러리를 발행하지 않는다

- Status: accepted
- Date: 2026-08-26
- Owners: repository owner
- Affects: `governance-figma-sync`, `governance-execution-playbook`,
  `klipse-figma-transplant` 스킬, LOUIS 현행 파일 `OlYKERKOkgbxBEEoXGZW2c`,
  선행 라이브러리 `bxGEp0km5zluMJGulaTvFW`

## Context

Figma를 두 가지로 쓸 수 있는데 문서가 어느 쪽인지 확정하지 않은 채 양쪽 규칙을 함께 적고 있었다.

- **A. 참조용 projection** — 코드가 정본이고, Figma는 "지금 시스템이 이렇게 생겼다"를 사람이 보는 곳.
- **B. 작업 도구** — 디자이너가 DS 컴포넌트를 끌어다 제품 화면을 조립하는 곳.

B는 **library publish 없이는 성립하지 않는다.** Figma에서 미발행 파일의 컴포넌트·변수·스타일은
다른 파일이 소비할 수 없다. 2026-08-26 실측으로 그 결과가 확인됐다.

| | `OlYKERKOkgbxBEEoXGZW2c` — **LOUIS, 현행 작업 파일** | `bxGEp0km5zluMJGulaTvFW` — 선행 라이브러리 |
| --- | --- | --- |
| DS 컴포넌트 | **0개** | 26개 |
| 있는 컴포넌트 | logo·tile·icon 326 + `Product/*` 화면 조립 27세트 | — |
| 변수 | 643 = 보드 고유 299 + **Klipse\* 수동 복사본 344** | 378 |
| 구독 라이브러리 | Material 3 · Simple DS · Apple UI kit **8종** | — |

`get_libraries`의 `libraries_available_to_add`가 **빈 배열**이다 — 미발행이라 추가 목록에 뜨지도
않는다. 그래서 보드는 자기 DS를 구독하지 못하고 변수만 손으로 복사해 두었으며, 그 복사본이
정본보다 34개 뒤처져 있다(2026-08-26 세션에서 정본에만 추가된 분).

publish를 미뤄 온 근거는 타당했다 — 미발행이라 rename 99건(DS-D-0024 색 마이그레이션)을 무비용으로
할 수 있었다. 발행하는 순간 변수 이름이 계약이 되고 이후 rename·삭제가 구독 파일의 바인딩을 깬다.

**어느 파일이 LOUIS 인지도 이 결정과 함께 확정한다.** 소유자 기준 LOUIS 는
`OlYKERKOkgbxBEEoXGZW2c`(Figma 상 이름 "LOUIS")다. `bxGEp0km…` 은 2026-08-21 이전을 시작하고
끝내지 못한 **선행 파일**이며, 문서가 그것을 계속 「정본 라이브러리」로 적어 둔 탓에 작업자가
소유자에게 그 파일을 열어 달라고 반복 요청하는 일이 벌어졌다. `figma-sync.md` 의 운영 파일 표를
이 결정과 같은 커밋에서 고쳤다.

## Decision

**A를 채택한다. 라이브러리를 발행하지 않는다.**

그리고 **목표는 「제품을 다 표현한다」임을 함께 못박는다.** A 는 「무엇으로 쓰는가」를 정한
것이고, 「무엇을 담는가」는 별개인데 그것이 어디에도 적혀 있지 않았다. 순서는
**제품 → Figma 에 전부 표현 → (사람이) 합칠 것을 판단 → DS 문서화 · 제품 최신화** 이며,
컴포넌트 라이브러리는 그 흐름의 **산출물이지 선행 조건이 아니다.**
방법과 현재 커버리지는 [figma-sync](../figma-sync.md) 「목표는 「제품을 다 표현한다」다」 절이 소유한다.

정본은 저장소다. Figma 라이브러리는 그 정본의 projection이며, `verify-figma-parity`가 양방향으로
대조하는 대상으로만 존재한다. 사람이 "지금 시스템이 이렇게 생겼는지" 보러 오는 곳이다.

따라서:

1. **`figma: done` 승격을 추구하지 않는다.** 승격 조건이 published library를 요구하므로 이 결정과
   양립하지 않는다. 상태는 의도적으로 `not-ready`에 머문다 — 미달이 아니라 **선택**이다.
   catalog·문서에서 publish를 남은 과제로 적지 않는다.
2. **「제품 screen은 published library component instance를 소비한다」 규칙은 목표에서 내린다.**
   보드의 화면 조립은 보드 고유 컴포넌트와 `1 · Palette`/`2 · Semantic`/`3 · Scale`로 계속한다.
3. **보드의 Klipse\* 복사본은 삭제하지 않고 동결한다.** 처음에는 "쓰지 않는 사본이면 지운다"로
   갈 생각이었으나 실측이 그 전제를 뒤집었다.

   2026-08-26 페이지 8개 전수 스캔(페이지당 use_figma 1회, 병렬):

   | 페이지 | 총 노드 | Klipse\* 바인딩 | 보드 고유 바인딩 |
   | --- | ---: | ---: | ---: |
   | 00 · START HERE | 498 | 0 | 0 |
   | 01 · 획득 | 9,211 | **1,144** | 5,420 |
   | 02 · 가입 | 487 | 0 | 237 |
   | 03 · 제작 | 10,709 | **237** | 8,635 |
   | 04 · 결제 | 4,598 | **264** | 2,451 |
   | 05 · 운영 | 1,193 | 0 | 686 |
   | 90 · ASSETS | 9,436 | **932** | 5,959 |
   | 99 · 보류 | 50 | 0 | 22 |

   **2,577개 노드가 Klipse\* 에 바인딩돼 있고 컬렉션 3개가 모두 쓰인다.** Primitive 는 spacing·radius
   골격으로 네 페이지에 박혀 있고, Semantic·Semantic Color 는 01·90 의 `color/bg-canvas` 등 배경
   근간에 물려 있다. 삭제하면 그 바인딩이 끊기고 raw 값으로 detach 된다.

   측정의 한계를 함께 남긴다 — 독립 재확인을 돌린 두 페이지에서 실측치가 스캔값보다 각각 12건
   많았다(paint 단위 바인딩 일부 누락). **0으로 나온 네 페이지는 재검증하지 않았으므로 진짜 0이라는
   보장이 없다.** 실제 삭제는 이 둘을 해소하고 2,601건을 보드 고유 컬렉션으로 재매핑한 뒤에만 가능하다.

   그래서 **34개를 맞추지도, 지우지도 않는다.** 코드가 정본인 A 모델에서 수동 재동기화는 무기한
   반복되는 순수 비용이고, 삭제는 지금 위험하다. 대신 2026-08-26 에 보드의 세 컬렉션 이름에
   동결 표식을 달았다 — 비용 0, 위험 0.

   | 이전 | 이후 | 변수 |
   | --- | --- | ---: |
   | `Klipse Primitive` | `Klipse Primitive · frozen — 코드가 정본` | 187 |
   | `Klipse Semantic` | `Klipse Semantic · frozen — 코드가 정본` | 76 |
   | `Klipse Semantic Color` | `Klipse Semantic Color · frozen — 코드가 정본` | 81 |

   바인딩은 id 로 맺어지므로 2,577건은 그대로다. 보드 고유 `1 · Palette`·`2 · Semantic`·`3 · Scale`
   은 건드리지 않았다.

   **표식이 만든 함정 하나를 남긴다.** `figma/apply-variables.*.js` 는 컬렉션을 이름 **정확 일치**로
   찾는다(`cols.find(x => x.name === COL.c)`). 라이브러리는 이름을 그대로 두었으므로 그쪽 경로는
   멀쩡하지만, 누군가 보드에 대고 apply 를 실행하면 이름이 안 맞아 **`Klipse Primitive` 를 새로
   만들어 버린다.** 보드는 이 결정으로 동결 대상이므로 **apply-variables 를 보드에 실행하지 않는다.**


### 정정 (2026-08-26, 같은 날)

**위 항목 3의 전제가 틀렸다.** 동결을 결정할 때 나는 `bxGEp0km…` 을 정본 라이브러리로,
`OlYKERK…` 의 `Klipse*` 를 「낡은 사본」으로 알고 있었다. 소유자가 바로잡아 준 대로
**LOUIS 는 `OlYKERK…` 이고, 그 파일의 `Klipse*` 는 사본이 아니라 DS 의 Figma 투영 본체다.**

투영 본체를 얼리면 A 모델 자체가 성립하지 않는다 — 코드가 자라도 Figma 가 따라오지 않으니
「시스템이 이렇게 생겼다」를 볼 수 없다. 실제로 색 프리미티브 21 개를 올리자
`verify-figma-parity` 가 곧바로 red 가 됐고, 그것이 옳은 신호였다.

따라서:

1. **동결을 해제한다.** 컬렉션 이름의 ` · frozen — 코드가 정본` 표식을 되돌리고,
   `apply-variables.*.js` 로 코드의 토큰 전량(399)을 LOUIS 파일에 동기화한다.
   `apply-variables` 가 이름 정확 일치로 컬렉션을 찾으므로 표식이 남아 있으면 새 컬렉션을
   만들어 버린다 — 해제가 동기화의 선행 조건이다.
2. **parity 대상을 LOUIS 파일로 옮긴다.** `readback.json` 을 `OlYKERK…` 에서 다시 뜬다.
   옮기면 컴포넌트 0 개 때문에 게이트가 red 로 남는데, **그 red 가 지금 상태의 정직한 표현이다.**
   은퇴 파일에 대고 내는 green 보다 낫다.
3. **보드 고유 `1 · Palette`·`2 · Semantic`·`3 · Scale` 은 그대로 둔다.** 화면 23,410 곳이
   여기 묶여 있다. 이 셋의 은퇴는 컴포넌트로 화면을 재조립하면서 바인딩이 LOUIS 로 옮겨간
   뒤의 일이다.

항목 3 의 실측(2,577 노드가 `Klipse*` 에 바인딩)은 여전히 유효하다 — **삭제하면 안 된다**는
결론도 그대로다. 바뀐 것은 「얼린다」에서 「동기화한다」로다.
## Alternatives

- **발행한다(B).** 컴포넌트 26개를 보드에서 바로 쓸 수 있고 변수 수동 복사가 사라진다. 대가는
  이름이 계약이 되는 것 — 아키텍처가 아직 experimental인 지금은 이르다. 나중에 디자이너가
  Figma에서 화면을 조립할 필요가 실제로 생기면 이 결정을 superseded로 바꾸고 발행한다.
- **현상 유지.** A라고 말하면서 사본을 방치하는 상태. 이번에 34개가 조용히 어긋난 것이 그 비용을
  이미 보여 줬다.


## 후속

- ~~**게이트가 은퇴 파일을 가리킨다.**~~ **해소됨 (2026-08-26, 확인 2026-09-01).** 이 항목은
  「지금 대상을 옮기면 … 게이트가 즉시 red 가 된다」를 근거로 이전을 미뤘는데, **같은 날 이 문서의
  「정정」 절이 그 미룸을 뒤집었다** — red 를 감수하고 먼저 옮기는 편이 정직하다. 실제로 그렇게 했다.
  지금 `readback.json`·`snapshot.json` 은 LOUIS 를 가리키고, `verify-figma-parity` 는 파일 키를
  스스로 갖지 않으므로(`scripts/verify-figma-parity.mjs:16` 이 `figma/snapshot.json` 만 읽는다)
  함께 옮겨졌다. 확인 명령은 `figma-sync.md` 「게이트가 은퇴 파일을 가리켰다 (해소됨)」 에 있다.
  남은 것은 **선행 파일 폐기** 하나이고 소유자 행동이다.

- ~~**LOUIS 파일에 DS 컴포넌트 레이어가 없다.**~~ **해소됨 (확인 2026-09-01).** 「DS 프리미티브는
  0 개」와 「`alert`·`node-chip`·`switch`·`table`·`tabs` 다섯은 선행 라이브러리에도 없다」는 둘 다
  더 이상 참이 아니다 — 다섯이 전부 LOUIS 파일에 서 있다
  (`node -e 'const c=Object.keys(require("./figma/readback.json").components);console.log(c.length, ["Alert","NodeChip","Switch","Table","Tabs"].every(n=>c.includes(n)))'`
  → `51 true`). 예측대로 CSS·토큰에서 도출해 세웠다.
  **그 대가가 하나 남는다** — `figma/components.measured.json` 의 실측 스펙은 여전히 31 종뿐이고
  이 다섯은 거기 없다(같은 명령 꼴로 `require("./figma/components.measured.json").components`).
  즉 다섯은 Figma 에 있지만 **코드 실측과 대조되는 축이 없다.** 그 결손은 `verify-figma-parity`
  계약의 geometry 미부착으로 나타난다.
- **선행 라이브러리는 Plugin API 로 열리지 않는다.** 2026-08-26 기준 `bxGEp0km…` 는
  `get_metadata`(읽기)는 되는데 `use_figma` 가 `User does not have permission to access this file
  using MCP` 로 거부한다. LOUIS 파일과 미러는 정상 동작한다. **은퇴 대상이므로 이 접근을 회복하려
  애쓰지 않는다** — 필요한 정보는 이미 `readback.json` 에 캡처돼 있다.
