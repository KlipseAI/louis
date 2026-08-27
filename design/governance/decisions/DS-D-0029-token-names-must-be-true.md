---
id: decision-token-names-must-be-true
status: experimental
authority: normative
---

# DS-D-0029 이름이 값과 다른 토큰은 없는 것보다 나쁘다

- Status: accepted
- Date: 2026-08-27
- Owners: repository owner
- Affects: `primitive.line-height.*` · `semantic.global.type-line-height.*` ·
  `semantic.global.button.*` · `semantic.global.footer.safe-bottom` ·
  `semantic.{light,dark}.color.gray.{900,300,500,800}-alpha.*`,
  `scripts/lib/token-model.mjs` 의 Figma scope 산출, Figma 변수 24개

## Context

2026-08-27 감사가 이름과 값이 어긋난 토큰 네 무리를 찾았다. 넷 다 **오늘 깨지는 화면이 없다** —
전부 소비처 0 이기 때문이다. 그것이 이 결정의 이유다. 소비처가 0 인 동안에는 아무도 틀린 것을
모르고, 처음 집는 사람이 화면을 깨뜨리며 그때는 이 토큰이 왜 그 값인지 아무도 기억하지 못한다.

이 저장소는 같은 함정을 이미 이름으로 부르고 있다 — `radius-card` 를 이름으로 집으면 화면이
달라진다(`execution-handoff.md` (1b)). 아래 넷은 그것의 더 나쁜 형태다. `radius-card` 는 값이
맞고 이름만 좁았지만, 아래는 **값이 이름을 배반한다.**

## Decision

### 1. 행간 토큰은 단위를 이름에 드러낸다 — `type-line-height-percent/*`

`--louis-type-line-height-body-14` 의 값은 **150** 이었다. CSS 로 옮기면
`line-height: 150` 은 글자 크기의 150 배다 — 의도의 100 배. 값이 percent 인 것은 사고가 아니라
필요다: Figma 는 텍스트 행간을 PERCENT 로 보관하고(`readback.json` 의 text style 15 개가 전부
`lineHeightPercent`), 그 축을 Figma 변수로 세우려면 150 이어야 한다.

그래서 **값을 고치지 않고 이름을 고친다.** semantic 축을 `type-line-height` →
`type-line-height-percent` 로 옮겨 CSS 가
`--louis-type-line-height-percent-body-14: 150` 을 발행한다. primitive 는 이미
`line-height/percent-150` 으로 정직했고, `$description` 에 「100 으로 나누면 CSS 비율」을 적었다.
규약은 [Typography](../../foundations/typography.md) 의 「행간의 단위」가 소유한다.

같은 그룹에 있던 비율 3종(`line-height/tight` 1.2 · `/heading` 1.35 · `/body` 1.5)은 **지운다.**
참조가 0 이다 — semantic 9 개가 전부 `percent-*` 를 가리키고, CSS 는 primitive 를 발행하지 않으며,
composite `typography-*` 는 행간을 alias 없이 자기 안에 담는다. 한 축에 단위가 둘이면 다음 사람이
아무거나 집는다. 쓰지 않는 계단은 스케일이 아니라 재고다([DS-D-0026](DS-D-0026-alpha-scale.md)).

**scope 도 함께 고친다 — 다만 이유는 감사가 적은 것과 다르다.** `figmaScopesForToken` 이
`$type: "number"` 갈래를 갖지 않아 행간 토큰 15 행이 proposal 에서 `scopes: []` 로 나간다.
여기까지는 사실이고 `readback.json` 의 scopes 열도 빈 문자열이다. **그러나 그것이 「Figma 에서
바인딩이 안 된다」는 뜻은 아니다.** 되읽기의 scopes 열은 Figma 실물이 아니라 proposal 값을 옮겨
적은 것이고(`capturedBy` 가 그렇게 정해 두었다), 라이브를 직접 읽으면
`line-height/percent-*` 는 `ALL_SCOPES`, `type-line-height/*` 아홉은 **이미 `LINE_HEIGHT`** 다.
누군가 Figma 에서 손으로 넣었고 DS 는 그것을 모른다.

진짜 결함은 그 **어긋남**이다. `apply-variables` 는 `if (spec.sc.length)` 로 빈 배열을 건너뛰므로,
proposal 이 `[]` 인 동안 DS 는 이 축에 대해 아무 말도 하지 않고 Figma 기본값 `ALL_SCOPES` 가
남는다 — 150 이라는 행간 값이 모서리 반경·간격 선택기에도 뜬다는 뜻이다. proposal 이
`LINE_HEIGHT` 를 선언하게 하고 primitive 3개의 라이브 scope 도 거기에 맞춘다. semantic 아홉은
라이브가 이미 그 값이라 적용이 무연산이고, 이제 DS 가 그것을 근거로 갖는다.

### 2. `button/*` 는 DS-D-0027 사다리를 따른다

[DS-D-0027](DS-D-0027-control-size-ladder.md)이 사다리를 `lg`(40) · `md`(32) 로 세우고 밑단
토큰을 옮겼는데 `button/*` 블록은 **alias 만 따라가고 이름은 남았다.** 그 결과 접미사 없는
`--louis-button-height` 가 40 인데 `Button` 의 기본값은 `md`(32)이고 `button.css` 도 32 를 쓴다.
접미사 없는 이름은 「기본값」으로 읽히므로, 이름만 보고 집으면 8px 큰 버튼이 나온다.

| 옛 이름 | 새 이름 | 값 |
| --- | --- | ---: |
| `button-height` | `button-height-lg` | 40 |
| `button-height-sm` | `button-height-md` | 32 |
| `button-min-width-sm` | `button-min-width-md` | 48 |
| `button-padding-inline` | `button-padding-inline-lg` | 16 |
| `button-padding-inline-sm` | `button-padding-inline-md` | 12 |

`button-radius` 는 크기 축이 아니라 그대로 둔다. **값은 하나도 바뀌지 않는다.**

### 3. `footer-safe-bottom` 을 지운다

제품은 `env(safe-area-inset-bottom)` 을 쓰는데 LOUIS 는 그 자리를 `{primitive.spacing.0}` 에
묶어 **0px 고정**으로 발행하고 있었다. [Spacing & Radius](../../foundations/spacing-radius.md)가
「safe-area inset은 환경 입력이며 고정 spacing primitive가 아니다」로 이 모델링을 이미 금지한다.
규범이 옳고 토큰이 틀렸으므로 토큰을 지운다. 환경 입력에는 이름을 주지 않는다 — Figma 변수로
표현할 수 있는 값이 아니고, 0 을 발행하면 그 0 이 디자인 결정으로 읽힌다.

같은 그룹의 `footer-reveal-height`(0px)는 **남긴다.** 제품이 런타임에 써 넣는 값이라 성격이
비슷하지만, safe-area 처럼 그것을 금지하는 규범 문장이 없고 「기본 0, 소비처가 덮는다」로 읽을
여지가 있다. 판정이 서지 않은 것을 파괴적 변경에 묶지 않는다.

### 4. 이름이 거짓인 알파 토큰 6개를 지운다

| 토큰 | 이름이 말하는 것 | 실제 (light / dark) |
| --- | --- | --- |
| `color-gray-800-alpha-48` | gray-800 의 48% | 검정 4% / 흰색 4% — `gray-000-alpha-04` 와 같다 |
| `color-gray-800-alpha-72` | gray-800 의 72% | 검정 8% / 흰색 8% — `gray-000-alpha-08` 과 같다 |
| `color-gray-900-alpha-08` | gray-900 의 8% | **흰색 4%** / 검정 8% |
| `color-gray-900-alpha-12` | gray-900 의 12% | **흰색 4%** / 검정 12% |
| `color-gray-300-alpha-88` | gray-300 의 88% | `palette-gray.700` / `palette-gray.300` — **알파 1** |
| `color-gray-500-alpha-88` | gray-500 의 88% | `palette-gray.500` 양쪽 — **알파 1** |

여섯 다 LOUIS 소비처 0 · 제품 소비처 0 이다. 둘은 기존 토큰과 값이 정확히 같고, 둘은 알파가 아예
없어 `gray-300`·`gray-500` 의 중복이며, 나머지 둘은 라이트에서 **08 과 12 가 같은 값**이라
스케일도 아니다. 고쳐 쓸 이름이 없다 — 무엇을 뜻하려 했는지 어디에도 적혀 있지 않다.

## Alternatives

- **행간 값을 1.5·1.35·1.2 로 고친다.** Figma 변수가 PERCENT 축에 묶이는 순간 1.5% 가 된다.
  Figma 를 정본에서 떼어내야 성립하는데 [DS-D-0025](DS-D-0025-figma-as-projection.md)가 반대다.
- **행간 규약을 문서로만 세운다.** `line-height: var(--louis-type-line-height-body-14)` 를 막는
  것이 없다. 문서는 읽은 사람에게만 효과가 있고 이름은 안 읽은 사람에게도 효과가 있다.
- **`button-height` 만 고치고 나머지 넷은 둔다.** 같은 블록 안에서 접미사 규칙이 둘로 갈린다.
- **알파 6개를 값에 맞는 이름으로 옮긴다.** 넷은 이미 있는 토큰과 중복이라 옮길 자리가 없고,
  나머지 둘은 의도를 아는 사람이 없다. 추측한 이름은 지금 이름보다 나을 것이 없다.
- **넷을 따로따로 커밋한다.** 넷 다 Figma 변수를 건드리므로
  [DS-D-0028](DS-D-0028-three-in-one-change.md)에 따라 되읽기 재캡처가 따라와야 한다. 되읽기는
  파일 하나라 네 번 나누면 중간 세 커밋이 전부 거짓 초록이다.

## Consequences

`check-token-diff` 가 breaking 을 낸다 — removal 30 · additive 14 · description 3 이고
**resolved value 변경은 0** 이다. 값이 바뀌는 토큰이 하나도 없으므로 렌더가 달라지는 화면도 없다.
의도된 변경이므로 baseline 을 승인해 잠근다(선례 `3bee005`).

Figma 변수를 같은 작업에서 옮긴다 — 이름 변경 14 · 삭제 10 · scope 좁힘 3. 라이브가 516 → 506
이 된다. 그다음 `figma/readback.json` 을 재캡처하고 `build-figma-snapshot` 을 돌린다. 셋 중
하나라도 미루면 게이트가 과거를 검사한다.

**재캡처는 전수 덤프가 아니라 행 지문으로 확인했다.** `use_figma` 응답 20KB 제한 때문에 컬렉션
전수 덤프는 잘린다. 라이브에서 `[이름, resolvedType, mode 값]` 을 mode 이름순으로 정규화해 행마다
FNV-1a 를 내고, 되읽기에서 같은 방식으로 낸 집합과 대조했다. 506 행 중 어긋난 것은 2 행이고 둘 다
`capturedBy` 가 이미 예외로 적어 둔 float 정밀도다(`scale/tooltip-rest` · `color/green-500-alpha/08`).

**제품 저장소는 바뀌지 않는다.** 옮긴 토큰과 지운 토큰 모두 제품 소비처가 0 이고, 제품이 자기
`globals.css` 에 갖고 있는 `--button-height`(32) · `--footer-safe-bottom`(`env(...)`)는 이름이
비슷할 뿐 다른 변수다. 규칙 1 의 세 곳 중 제품 쪽은 「바꿀 것이 없음」이 결론이며, 그 사실 자체를
여기 적어 다음 사람이 다시 확인하지 않게 한다.
