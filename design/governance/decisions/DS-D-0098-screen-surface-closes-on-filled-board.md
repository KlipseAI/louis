---
id: decision-screen-surface-closes-on-filled-board
status: experimental
authority: normative
---

# DS-D-0098 화면 표면은 채운 보드 · 늘림 통과 · 안의 부품 needed 0 으로 Figma 대응이 된다

- Status: accepted (소유자 결정, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `governance-figma-screen-assembly`, `decision-product-parts-become-louis`

## Context

표면 원장(`migration/product.surfaces.json`)의 needed 가운데 화면(kind `screen`)이 93 으로 대상 288 의 3 분의 1 이다.
원장의 `$kindRule` 은 화면을 needed 밖으로 내보낼 조건 둘 — (가) 그 화면의 보드가 실재한다, (나) 화면 안에서 꺼낼 부품을 다 꺼냈다 —
가운데 (나)를 기계로 잴 수 없다고 적고 문을 닫아 두었다(2026-09-09 실측). 그 근거가 셋이었다 — 보드 원장의 `replaceable 0` 은 공허하고,
순환이고, 빈 상태 보드는 화면이 아니다(/archive 보드가 「No projects yet」 한 장이었다). 그 사이 시드 데이터 보드(10-06 소유자 결정)와
늘림 시험(10-08 소유자 결정, `figma/resize-check.json`)이 생겼다. 규칙 없이는 Figma 100% 에 닿을 수 없다.

## Decision

화면 표면은 다음 셋을 모두 만족할 때 `verdict: "figma"` · `figma: "screen:<보드 라우트>"` 로 대응이 된다.

1. **채운 보드.** `figma/app-screens.plan.json` 에 그 라우트의 보드가 데스크톱 · 모바일 둘 다 있고, 그 보드가 시드 데이터로 **채운 상태**를
   그린다. 빈 상태 · 연결 이전 · 결과 이전 보드는 해당하지 않는다. 채움의 근거(어느 시드가 무엇을 채웠나)를 표면의 `filled` 에 적는다.
2. **늘림 통과.** 그 라우트의 보드 전부가 늘림 원장에서 실패 0 이다 — 폭 시험의 넘침 · 자식 넘침 · 글자 잘림 · 루트 폭 추종, 높이 +30% 의
   루트 높이 추종, 측정 크기의 넘침. 보드 id(`figmaFrameId`)로 맞댄다.
3. **안의 부품 needed 0.** 같은 파일(`file`)에 needed · unclear 표면이 없다. (나) 「다 꺼냈다」를 이 조건으로 잰다 — 입자도 규칙상 파일 안에
   정의된 시각 단위는 모두 표면으로 열거되므로, 그 표면이 모두 대응 · 범위 밖으로 갈렸으면 꺼낼 것이 남지 않았다.

`check-figma-surface-coverage` 가 2 · 3 과 1 의 보드 존재 · `filled` 기재를 기계로 확인하고, 화면 대응을 컴포넌트 · 패턴 · 제품 세트 대응과
따로 센다(`MAPPED_SCREEN_BASELINE`).

## Alternatives

| 안 | 버린 이유 |
| --- | --- |
| 보드만 있으면 대응 | 빈 상태 보드가 통과한다 — `$kindRule` 이 경고한 「빈 방을 보고 이사 끝」 |
| 화면을 분모에서 뺀다 | 수는 85% 대로 오르지만 화면 보드 일이 목표 밖이 된다 — 분모를 옮겨 오르는 커버리지다 |
| 지금 규칙 유지 | 화면 93 이 영원히 needed 라 100% 가 정의상 닿지 않는다 |

## Consequences

- 화면 하나를 닫는 일은 「시드 측정 → 보드 재생성 → 늘림 실패 0 → 같은 파일의 부품 정리」다. 늘림 반응 개선이 화면 대응의 선행 조건이 된다.
- 한 라우트 보드가 여러 화면 표면(랜딩 절 · 탭 본문)을 덮을 수 있다. 그 보드가 그 표면을 실제로 그리는지는 `filled` 에 적는 사람 몫이다.
- 늘림 원장이 다시 재져 실패가 생기면 그 화면 대응은 게이트에서 빨갛게 된다 — 대응이 낡지 않는다.

## Rollback

`screen:` 대응을 needed(kind `screen`)로 되돌리고 게이트의 화면 어휘 · 검사를 지운다. 보드 · 시드 · 늘림 원장은 그대로 쓸모가 있다.
