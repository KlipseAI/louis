---
id: decision-card-radius
status: experimental
authority: normative
---

# DS-D-0014 카드 반경 — `radius-card`를 제품 정본 16px에 맞춘다

- Status: proposed
- Date: 2026-08-16
- Owners: repository owner, token maintainer
- Affects: `radius-card`(breaking), Dialog compact, Project Card, DS-D-0010

## Context

`radius-card`는 20px인데 **제품의 프로젝트 카드는 4벌 전부 16px이다.**

| 정의 | 파일 | 반경 |
| --- | --- | ---: |
| 앱 홈 | `appHomeSceneStyles.ts` `archiveCard` | 16px |
| 캔버스 홈 | `NodeCanvasHomeScene.tsx` `ARCHIVE_CARD` | 16px |
| 하이라이트 허브 | `highlightSceneStyles.ts` `historyCard` | 16px |
| 비디오 에디터 허브 | `VideoEditScene.tsx` `HISTORY_CARD` | 16px |

owner가 정한 정본 규칙은 **제품의 공용 구현**이다. 네 벌이 이견 없이 같은 값을 쓰므로 카드 반경의
정본은 16px이다.

`radius-card`의 현재 유일한 소비처는 **Dialog compact**이며, 그 자리에서 20px이 맞다. Dialog는 이것을
이미 known deviation으로 적어 두었다 — "20px의 토큰이 소스에 없어 `radius-card`를 빌려 쓴다."
즉 지금 `radius-card`는 **카드가 쓰지 않고 카드가 아닌 것이 빌려 쓰는** 이름이다.

제품의 20px 사용처도 카드가 아니거나 큰 표면이다 — `clipModalContent`(모달), `uploadCard`(드롭 존),
`floatingCreateButton`(≤780px). 20px은 값이 틀린 것이 아니라 **이름이 틀렸다.**

## Decision

**`radius-card`를 16px로 내리고, 20px을 `radius-card-lg`로 새로 만든다.**

1. `radius-card` = `{primitive.radius.16}`. Project Card가 이것을 쓴다.
2. `radius-card-lg` = `{primitive.radius.20}`. Dialog compact가 빌려 쓰던 자리를 이것으로 바꾼다.
3. **화면은 바뀌지 않는다.** 유일한 기존 소비처인 Dialog compact가 같은 변경 단위에서 새 토큰을
   가리키므로 20px이 그대로 유지된다.

## 왜 반대로 하지 않는가

Project Card가 `radius-overlay`(16px)를 쓰면 토큰을 건드리지 않아도 된다. 그러나 그것은 같은 거짓말을
방향만 바꾼 것이다 — 카드가 overlay 이름을 쓰고, 카드 이름은 여전히 카드가 아닌 것에 붙는다. 이름으로
집는 사람이 두 번 틀린다.

## Consequences

- `radius-card`의 값이 바뀌므로 **breaking**이다. DS-GOV-001의 baseline 절차를 적용한다.
- 소비자는 아직 없다. package는 미발행이고 Figma library는 미공개다.
- 제품(klipse-web)의 카드 16px과 DS `radius-card`가 처음으로 같은 값이 된다.
- 이름으로 토큰을 집었을 때 화면이 달라지던 함정 하나가 사라진다.

## Rollback

`radius-card`를 `{primitive.radius.20}`으로 되돌리고 `radius-card-lg`를 지운 뒤 Dialog compact의
참조를 `radius-card`로 되돌린다. 세 줄이며 primitive는 손대지 않는다.

## Acceptance tests

1. `radius-card`가 16px, `radius-card-lg`가 20px로 생성된다.
2. Dialog compact의 계산 반경이 변경 전후 20px로 같다(브라우저 테스트).
3. `diff-tokens.mjs`가 이 변경을 breaking으로 분류하고, baseline 갱신 후 `--fail-on-breaking`이 통과한다.
4. Project Card의 계산 반경이 16px이며 `radius-card`에서 온다.
