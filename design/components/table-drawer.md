---
id: table-drawer
status: experimental
authority: normative
summary: 표 행을 펼치면 그 아래에 올린 면 · 머리 줄 · 두 번째 표를 담은 서랍을 엽니다.
---

# Table Drawer

표의 한 줄을 펼치면 그 아래 `colSpan` 칸 하나에 서는 서랍이다. 올린 면 안에 머리 줄(제목 · 보조 글 + 복사 단추), 두 번째 표, 「더 보기」가 선다.
표를 **담는** 면이고 표 자신의 문법(칸 · 머리 · 행)은 [Table](table.md) 이 갖는다([DS-D-0107](../governance/decisions/DS-D-0107-table-drawer.md)).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS 레시피 `.louis-table-drawer` 만 있다(`packages/css/src/component/table-drawer.css`). React 표면은 없다 |
| Figma         | `done`         | `TableDrawer`(640 폭 표본). 계약 · 기하 · 되재기 시험이 선다 — 2026-10-15 되재기 `table-drawer.browser.test.tsx` 로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품 어드민이 이 레시피를 물면 승격 후보 |

## When to use

- 요약 표의 한 줄이 **자기 아래 목록**을 가질 때 — 광고 한 줄 아래의 가입 계정들.
- 쓰지 말아야 할 때: 한 기록의 라벨/값 상세를 펼치는 자리. 그것은 [Record Card](record-card.md) 다.
- 쓰지 말아야 할 때: 숫자 하나를 크게 보이는 자리. 그것은 [Stat Tile](stat-tile.md) 이다.
- 쓰지 말아야 할 때: 펼친 내용이 한두 줄의 글뿐일 때. 표 행 아래 글 한 줄이면 된다.

## Anatomy

1. **Drawer** — `.louis-table-drawer`. 면 `bg-raised` + 헤어라인 · 반경 16 · 여백 16 · 세로 간격 12. 펼친 행의 `<td colspan>` 안에 둔다.
2. **Head** — `__head`. 제목(`__title`)과 보조 묶음(`__meta`, 보조 글 + IconButton sm)이 양 끝. 좁으면 줄을 바꾼다.
3. **Body** — `__body`. 안쪽 `.louis-table` 을 담고 좁은 화면에서 가로로 민다.
4. **More** — `.louis-button` secondary, 왼쪽 정렬. 남은 것이 없으면 그리지 않는다.

## Properties

속성이 없다. 담기는 표 · 열 · 「더 보기」 묶음 수는 소비처 데이터다.

| 클래스 | 뜻 |
| --- | --- |
| `.louis-table-drawer` | 서랍 면 |
| `__head` · `__title` · `__meta` | 머리 · 제목 · 보조 묶음 |
| `__body` | 안쪽 표의 가로 스크롤 상자 |

## Variants, sizes, and states

변형 · 크기 축이 없다. 서랍 자신은 상태가 없다 — 열림 · 닫힘은 표 행 끝 트리거의 `aria-expanded` 가 갖고 서랍은 열렸을 때만 DOM 에 선다.

## States

| 상태 | 무엇이 바뀌나 | 어디가 소유하나 |
| --- | --- | --- |
| 닫힘 | 서랍 행이 없다 | 소비처(트리거 `aria-expanded="false"`) |
| 열림 | 펼친 행 아래 `colspan` 행에 서랍이 선다 | 소비처 |
| 더 보기 | 다음 묶음이 표에 붙고 포커스가 새로 열린 첫 줄로 간다 | 소비처 |
| 남은 것 없음 | 「더 보기」를 그리지 않는다 | 소비처 |

## Interaction and responsive behavior

- 트리거는 표 행 끝의 IconButton(셰브론)이다 — `aria-expanded` · `aria-controls` 가 서랍의 `id` 를 가리킨다.
- 「더 보기」를 누르면 새로 열린 첫 줄로 포커스를 옮긴다. 마지막 묶음을 열면 버튼이 사라져 포커스가 문서 처음으로 튀기 때문이다(제품 `AdAttributionPanel.tsx:484-498`).
- 안쪽 표는 열을 숨기지 않고 가로로 민다 — 열마다 뜻이 달라 한 칸에 뭉치면 읽을 수 없다.

## Content

- 제목은 무엇의 목록인지와 개수를 담는다 — 「여름 세일 · 릴스 광고 — 가입 계정 24」.
- 보조 글은 복사할 식별자 하나다 — 「광고 ID 1202…」, 복사 단추의 이름은 「광고 ID 복사」.
- 「더 보기」는 다음 묶음 수를 말한다 — 「10명 더 보기」 · 「Show 10 more」.

## Accessibility

- 서랍은 트리거가 가리키는 `id` 를 갖는다. 표는 `<th scope="col">` 머리를 갖는다(Table 계약).
- 대비: 제목 `fg-primary` · 보조 글 `fg-tertiary` 가 두 테마의 `bg-raised` 위 4.5:1 을 넘는다(시험 2).
- 강제 색에서는 헤어라인 그림자 대신 시스템 색 실선 경계를 긋는다.

## Specification

| Part/state | Token or recipe | 구현 근거 |
| --- | --- | --- |
| 면 | `color-bg-raised` + `hairline-inset` | 제품 `ADMIN_SURFACE`(`AdminSection.tsx:69-70`) |
| 반경 · 여백 · 간격 | `radius-overlay` 16 · `space-control-lg` 16 · `space-control-md` 12 | 제품 `rounded-16 p-8 gap-6`(`AdAttributionPanel.tsx:95`) |
| 머리 | 양 끝 · 간격 12 · 줄바꿈 | 제품 `justify-between gap-6 flex-wrap`(`:506`) |
| 제목 | `body-sm-medium` · `fg-primary` | 제품 `type-body-14-medium`(`:507`) |
| 보조 묶음 | 간격 4 · `caption-regular` · `fg-tertiary` | 제품 `gap-2 type-caption-12-regular text-fg-tertiary`(`:509`) |
| 더 보기 | `.louis-button` secondary · 왼쪽 정렬 | 제품 `Button variant="secondary" className="self-start"`(`:562`) |

## Implementation

- Web source: packages/css/src/component/table-drawer.css
- Public import: `@klipse-design/css` (레시피 클래스). React 표면 없음
- Figma component: `TableDrawer` — DS · Components 의 「R1 · 캔버스 · 편집기 부품 (2026-10-15)」 섹션
- Tests/visual evidence: packages/react/test/table-drawer.browser.test.tsx 가 figma/components.measured.json 의 table-drawer 를 되잰다

### Usage

```html
<tr>
  <td colspan="6">
    <div class="louis-table-drawer" id="drawer-ad-1">
      <div class="louis-table-drawer__head">
        <span class="louis-table-drawer__title">여름 세일 · 릴스 광고 — 가입 계정 24</span>
        <span class="louis-table-drawer__meta">광고 ID 120210000000000 <button class="louis-icon-button" data-size="sm" aria-label="광고 ID 복사">…</button></span>
      </div>
      <div class="louis-table-drawer__body">
        <table class="louis-table">…</table>
      </div>
      <button type="button" class="louis-button" data-variant="secondary">10명 더 보기</button>
    </div>
  </td>
</tr>
```

## Acceptance tests

1. 여백 16 · 간격 12 · 반경 16 · 머리 간격 12 · 보조 묶음 간격 4 · 제목 14 · 보조 글 12 가 `figma/components.measured.json` 의 `table-drawer.drawer` 와 같고,
   「더 보기」가 왼쪽에 선다.
2. 두 테마에서 면이 `bg-raised` 이고 헤어라인 그림자가 있으며, 제목 · 보조 글이 그 면 위 4.5:1 을 넘는다.
3. Figma 되읽기에서 `TableDrawer` 의 `rawFills` 가 0 이고 효과가 헤어라인 하나다(parity 게이트).

1~2 는 `packages/react/test/table-drawer.browser.test.tsx` 가 실브라우저에서 잰다.

## Known deviations

1. **제품이 아직 이 레시피를 물지 않는다.** 대응은 제품이 클래스를 바꿔 물 때 선다.

## Migration and changelog

2026-10-15 — 새 부품([DS-D-0107](../governance/decisions/DS-D-0107-table-drawer.md)).
