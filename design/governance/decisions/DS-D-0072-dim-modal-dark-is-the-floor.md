---
id: decision-dim-modal-dark-is-the-floor
status: experimental
authority: normative
---

# DS-D-0072 다크 모달 가림막(`color-dim-modal`)은 바닥색으로 칠한다 — `static-black-alpha.72` → `palette-gray-950-alpha.72`

- Status: accepted (소유자 결정, 2026-09-28 대화 — 제품 어드민 디자인 보고의 시안 4 「안 A: 바닥색 72%」)
- Date: 2026-09-28
- Owners: repository owner, design system maintainer
- Affects: `component-dialog`, `transform-frame`, `pattern-app-shell`, `governance-figma-sync`,
  `decision-three-in-one-change`

## Context

제품 어드민의 디자인 보고(2026-09-28)에서 「다크에서 대화상자를 열어도 뒤 화면이 어두워지지 않는다」가 나왔다.
쿠폰 발급 창을 다크로 열면 뒤의 목록 카드가 창과 같은 색으로 남아, 창의 가장자리는 헤어라인과 그림자만 만든다.

원인은 알파가 아니라 **가림막의 바탕색**이다. 다크 사다리에서 그 값이 카드 면과 같다.

| 층 | 다크 값 |
| --- | --- |
| 가림막 `color-dim-modal` | `static-black-alpha.72` — `#171b22` 의 72% |
| 카드 `bg-surface`, 대화상자 면, `bg-raised`, `bg-menu`, `bg-overlay` | `palette-gray-900` `#171b22` |
| 바닥 `bg-canvas` | `palette-gray-950` `#0d1118` |

`static-black-alpha` 의 바탕은 2026-09-04 부터 팔레트 끝인 `palette-gray-900` 이다(순수 흑에서 옮겼다). 그 뒤 다크
사다리가 내려가 카드가 같은 `palette-gray-900` 이 되고 바닥이 한 칸 아래 `palette-gray-950` 으로 갔다. 그래서 가림막을
씌운 결과가 이렇다(sRGB 8비트 합성).

| 가림막 아래 | 지금 | 이 결정 뒤 |
| --- | --- | --- |
| 카드 `#171b22` | `#171b22` — **바뀌지 않는다** | `#10141b` |
| 바닥 `#0d1118` | `#14181f` — **오히려 밝아진다** | `#0d1118` |

카드 위의 글자와 그림만 흐려지고 면은 그대로다. 대화상자 면(`#171b22`)은 뒤 카드와 한 값이라 떠 보이지 않는다.

## Decision

- 원시 토큰 `palette-gray-950-alpha.72`(`#0d1118`, 72%)를 연다. 이름은 `green-500-alpha` 와 같은 「팔레트 칸 + 알파」
  규칙이다. 칸은 이 결정이 쓰는 하나뿐이다.
- 다크 `color-dim-modal` 을 이 토큰으로 옮긴다. 라이트는 그대로 `static-black-alpha.56` 이다.

가림막 아래는 모두 바닥색 쪽으로 가라앉고, 대화상자 면은 그보다 한 칸 위에 선다. 알파 72% 는 그대로라 뒤 화면의 글자가
흐려지는 정도도 거의 같다(`#fafafa` 글자: `#57595e` → `#4f5257`).

## Alternatives

| 대안 | 버린 이유 |
| --- | --- |
| 안 B: 순수 검정 56% | 소유자가 고르지 않았다. 알파 바탕을 팔레트 밖의 순수 흑으로 되돌리는 일이 된다 — 2026-09-04 에 알파 바탕을 팔레트 끝으로 옮긴 것과 거꾸로다 |
| `static-black-alpha` 의 바탕을 `palette-gray-950` 으로 옮긴다 | 원시 16칸과 그것을 부르는 시맨틱 전부(헤어라인, `accent-secondary` 계열 등)가 함께 움직인다. 제품 `check-rendering` 이 헤어라인 색을 정확값으로 잠그고 있다. 이 문제에 비해 반경이 너무 크다 |
| 알파만 올린다(80% 등) | 카드 위에서는 같은 색끼리라 몇 %를 올려도 면이 바뀌지 않는다 |
| 가림막 전용 시맨틱을 새로 세운다 | `color-dim-modal` 이 이미 그 이름이고 소비처가 모두 그것을 부른다 |

## Consequences

- **LOUIS 소비처 셋이 다크에서 함께 바뀐다** — `.louis-dialog__backdrop`(Dialog), `.louis-app-shell__scrim`(모바일 드로어),
  `.louis-transform-frame[data-louis-scrim]`(버려질 바깥). 셋 다 「뒤를 낮추는 막」이라 같은 재료가 맞다. 변형 프레임의
  바깥은 대개 사진 위라 차이가 작다.
- **제품은 핀을 올릴 때 받는다.** 제품 저장소 `origin/dev`(`db846b32`)에서
  `git grep -l -- '--louis-color-dim-modal' db846b32` 는 다섯 파일을 낸다. 값을 직접 칠하는 것은 셋(캔버스 홈,
  아카이브 홈, 마이페이지의 모달 가림막)이고 둘(가입 약관 창, 클립 자르기 창)은 주석이다. `.louis-dialog__backdrop` 을 무는
  확인 창과 어드민 편집 창은 레시피로 받는다.
- **알파 원시 패밀리가 넷에서 다섯이 된다**(`static-black-alpha` 16, `static-white-alpha` 16, `red-alpha` 3, `green-500-alpha` 1,
  `palette-gray-950-alpha` 1). [Figma Sync](../figma-sync.md) 의 「알파 패밀리는 14 에서 4 로」 절에 적었다.
- **라이트는 바뀌지 않는다.** 라이트 가림막은 밝은 면 위라 `#171b22` 56% 로 충분히 낮춘다.

## 세 곳 ([DS-D-0028](DS-D-0028-three-in-one-change.md))

| 자리 | 바꾼 것 |
| --- | --- |
| 코드 | `packages/tokens/src/klipse.tokens.json` 의 원시 칸 하나와 다크 `dim-modal` 한 줄. 생성물과 `figma/apply-variables.*.js` 는 생성기로 |
| Figma | 원시 변수 `color/palette-gray-950-alpha/72` 를 만들고 `color/dim-modal`(`VariableID:341:4507`)의 Dark 별칭을 `static-black-alpha/72` → `palette-gray-950-alpha/72` 로 옮겼다. `build-figma-variables --only color-palette-gray-950-alpha-72,color-dim-modal` 이 낸 조각 둘을 번호순으로 그대로 보냈다(sha256 `ab884f02…` 생성 1, `0ffc5678…` 갱신 1, 둘 다 별칭 누락 0). 조각은 일회성이라 커밋하지 않는다. 되읽기(`--variables --only color/palette-gray-950-alpha/72,color/dim-modal`)를 `readback.json` 에 병합하고 `snapshot.json` 을 다시 만들었다 |
| 문서 | 이 결정, [Dialog](../../components/dialog.md) Known deviations, [Figma Sync](../figma-sync.md) 알파 패밀리, [Updates](../../updates/README.md) (169) |

## Rollout and verification

- 적용 전 라이브 `color/dim-modal` 은 스냅숏과 같았다(Light `static-black-alpha/56`, Dark `static-black-alpha/72`, 읽기 전용 탐침).
  `color/palette-gray-950-alpha/72` 는 없었다.
- 적용 뒤 되읽기: Light `static-black-alpha/56`, Dark `palette-gray-950-alpha/72`, 새 원시 값 `[0.05098, 0.066666, 0.094117, 0.72]`,
  누락 0.
- 토큰 기준선: `node scripts/diff-tokens.mjs` 의 차이는 넷뿐이었다 — 추가 1(`color-palette-gray-950-alpha-72`), 다크 `color-dim-modal`
  의 원값, 값, 별칭 대상. 의도한 것만 남은 것을 확인하고 생성된 manifest 를 `packages/tokens/baseline/manifest.json` 으로 옮겼다
  ([Releases](../releases.md) 「의도적 breaking과 baseline 갱신」). 마이그레이션은 필요 없다 — 소비처는 모두 `color-dim-modal`
  이름으로 부르고, 그 이름은 그대로다.
- 제품 확인(적용 전): 제품 어드민 미리보기(모의 API)에서 다크 쿠폰 발급 창을 열고 가림막만 `#0d1118` 72% 로 덮어 찍은 캡처를
  소유자가 보고 이 안을 골랐다.
- 제품 확인(핀 상향 뒤, 2026-09-28): 제품이 핀을 이 결정의 커밋으로 올린 브랜치에서 같은 창을 실제 CSS 로 다시 쟀다. 가림막의
  계산값은 다크 `color(srgb 0.05098 0.066666 0.094117 / 0.72)`, 라이트 `color(srgb 0.090196 0.105882 0.133333 / 0.56)` 이다
  (쿠폰 발급 창, 자막 편집 창, 삭제 확인 창 셋 다 같다). 다크 화면 픽셀 표본은 뒤 카드 `#171b21` → `#0f141a`, 바닥
  `#15181f` → `#0d1118`, 대화상자 면 `#171b22` 그대로다 — Context 표의 합성값과 한 칸 안에서 맞는다.
