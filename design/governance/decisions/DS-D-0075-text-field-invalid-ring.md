---
id: decision-text-field-invalid-ring
status: experimental
authority: normative
---

# DS-D-0075 TextField 오류 상태는 상자에 위험색 링을 건다

- Status: accepted (코드 · 시험 · 문서 2026-10-07)
- Date: 2026-10-07
- Owners: design system maintainer (소유자 결정)
- Affects: `text-field`, `decision-hairline-inset`

## Context

[DS-D-0023](DS-D-0023-hairline-inset.md) 5항은 TextField 의 기본 · 오류 · 잠김 상자를 같은 generic 헤어라인으로 통일하고,
오류를 메시지(`color-fg-danger`) · `aria-invalid` · `role="alert"` 에만 맡겼다. 상자에서 색 축이 사라졌다.

제품 작업 브랜치 `feat/ambassador-links` 의 앰배서더 지원서(`ApplyFlow.tsx`)가 그 결과를 실측으로 되짚었다. 오류가
12px 빨간 글자 하나뿐이라 대비가 2.91:1 이고, 맞는 칸과 틀린 칸의 상자가 같아서 어느 칸이 틀렸는지 한눈에 보이지 않는다.
제품은 `data-invalid` 일 때 상자에 `border-width-ring`(2px) 두께의 `color-fg-danger-on-surface` 링을 지역으로 다시 걸었다.

같은 브랜치에서 결함도 하나 드러났다. 제품이 `data-invalid=""`(빈 값)로 달자 LOUIS 의 `[data-invalid="true"]` 선택자가
오류 메시지 색을 놓쳤고, 제품이 메시지 색을 손으로 칠했다.

소유자가 2026-10-07 「2px 위험색 링을 정본으로」를 골랐다.

## Decision

1. **오류 상태의 상자는 ring 두께의 위험색 링을 갖는다.**

   ```css
   .louis-text-field[data-invalid]:not([data-invalid="false"]) .louis-text-field__box {
     box-shadow: inset 0 0 0 var(--louis-border-width-ring) var(--louis-color-fg-danger-on-surface);
   }
   ```

   링은 헤어라인을 **대신**한다(box-shadow 한 겹). 면 위의 오류 잉크라서 `fg-danger-on-surface` 를 쓴다.
2. **`data-invalid` 는 있으면 오류다.** `"true"` 만이 아니라 속성의 존재를 잡고, `"false"` 만 예외로 둔다. 메시지 색
   (`color-fg-danger`) 선택자도 같은 규칙을 쓴다.
3. **색 하나로만 알리지 않는 규범은 그대로다.** 메시지 · `aria-invalid` · `role="alert"` 가 계속 함께 간다. 링은 그 위에
   얹는 시각 단서다.
4. **기본 · 잠김은 DS-D-0023 그대로다.** 이 결정은 DS-D-0023 5항의 invalid 부분만 바꾼다.

## Alternatives

- **지금처럼 메시지만 둔다.** 기각. 소유자가 고르지 않았고, 제품이 이미 지역 링으로 덮어 화면마다 오류 표현이 갈리기 시작했다.
- **헤어라인을 그대로 두고 링을 바깥에 더한다.** 기각. 두 겹이면 상자 바깥 크기가 달라 보이고, 포커스 링을 없앤
  [DS-D-0074](DS-D-0074-focus-ring-removed.md) 와 모양이 겹친다.
- **메시지 잉크도 `fg-danger-on-surface` 로 바꾼다.** 이번에는 하지 않았다. 메시지 색은 모든 입력칸에 걸리는 값이라 따로 잰 뒤
  정한다 — 제품 지원서는 아직 둘 다 on-surface 로 칠한다.

## Consequences

- 오류인 칸은 상자만 봐도 구분된다. 제품 앰배서더 지원서의 지역 링(`BOX_INVALID`)과 메시지 색 덮어쓰기는 핀을 이 판으로
  올릴 때 지운다.
- Figma `TextField` 의 `State=Invalid` 변형은 헤어라인 대신 2px 위험색 inner shadow 를 가져야 한다 — 다음 Figma 회차의 일이다.
- `text-field.browser.test.tsx` 의 상태 시험이 오류 링의 색과 두께를 잰다.
