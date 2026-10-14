// figma/components.measured.json 의 **record-card** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-14).
//
// parity 게이트는 Figma 가 기록과 같은지만 보고, verify-recipe-record 는 레시피의 **선언**을 기록과 맞댄다. 둘 다
// 계산값을 보지 않는다 — 토큰 값이 움직이거나 선택자 우선순위가 선언을 덮어도 기록 · 레시피 · Figma 는 서로 맞은 채로
// 통과한다. 그래서 기록의 키(= Figma 되읽기의 Layout 키 base · raised)마다 문서 API 절의 마크업을 렌더하고, 계약
// (verify-figma-parity.mjs 의 record-card geometry)이 거는 필드를 계산값과 맞댄다. 대비 · 동작은 이 파일의 몫이 아니다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** record-card 는 packages/react/src 에 표면이 없고 정본이
// packages/css/src/component/record-card.css 다. 저작 CSS 를 직접 import 한다 — 재는 대상은 「생성물이 최신인가」가
// 아니라 「저작 CSS 가 기록값을 만드는가」다(faq-row 와 같다).
//
// 상세 이하(Detail · Grid · Label · Value · Actions)는 Expanded=true 칸에만 있으므로 펼친 카드를 잰다. 기하는 펼침이
// 바꾸지 않는다 — 계약의 `$keyRule` 대로 Expanded 는 상세의 유무와 셰브런 회전만 바꾼다.
import type { JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/record-card.css";
import { find, px } from "./fixtures/contrast";

type Spec = Record<string, unknown>;

/** `sizes` 한 칸의 수 필드. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Spec, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

/** 문서 API 절의 마크업 그대로. `raised` 만 `data-surface` 를 단다 — 없음이 기본 갈래 `base`(면 없는 줄)다. */
function Card({ surface }: { readonly surface: "base" | "raised" }): JSX.Element {
  return (
    <div style={{ inlineSize: 720 }}>
      <div className="louis-record-card" data-surface={surface === "raised" ? "raised" : undefined} data-testid="root">
        <button
          type="button"
          className="louis-record-card__head"
          aria-expanded="true"
          aria-controls="detail-1"
          data-testid="head"
        >
          <span className="louis-record-card__top" data-testid="top">
            <span className="louis-record-card__meta" data-testid="meta">
              <span className="louis-badge" data-tone="warning">
                접수
              </span>
              <span className="louis-record-card__title" data-testid="title">
                홍길동
              </span>
              <span className="louis-record-card__note" data-testid="note">
                크리에이터 협업
              </span>
            </span>
            <svg
              className="louis-record-card__chevron"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              data-testid="chevron"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="louis-record-card__sub" data-testid="sub">
            <span className="louis-record-card__sub-item" data-testid="sub-item">
              gil@example.com
            </span>
            <span className="louis-record-card__sub-item">Instagram</span>
            <span className="louis-record-card__sub-item" data-align="end">
              10.07 14:20
            </span>
          </span>
        </button>
        <div className="louis-record-card__detail" id="detail-1" data-testid="detail">
          <dl className="louis-record-card__grid" data-testid="grid">
            <dt className="louis-record-card__label" data-testid="label">
              접수 시각
            </dt>
            <dd className="louis-record-card__value" data-testid="value">
              2026-10-07 14:20
            </dd>
            <dt className="louis-record-card__label">계정</dt>
            <dd className="louis-record-card__value" data-tone="muted">
              3f9c…
            </dd>
          </dl>
          <div className="louis-record-card__actions" data-testid="actions">
            <button type="button" className="louis-button" data-variant="secondary" data-size="sm">
              반려
            </button>
            <button type="button" className="louis-button" data-variant="primary" data-size="sm">
              승인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

beforeEach(async () => {
  // 600 이하에서는 격자가 한 열로 접힌다(레시피 끝의 @media). 기록은 두 열 격자의 값이다.
  await page.viewport(1440, 900);
});

const sizes = measured.components["record-card"].sizes as Record<string, Spec>;

test("기록의 키가 Figma 의 Layout 과 같다", () => {
  expect(Object.keys(sizes).sort()).toEqual(["base", "raised"]);
});

for (const [key, spec] of Object.entries(sizes)) {
  test(`${key} — 기록의 기하를 코드가 만든다`, async () => {
    await render(<Card surface={key as "base" | "raised"} />);
    const style = (testId: string) => getComputedStyle(find(testId));
    const asserted = new Set<string>();
    const check = (field: string, got: number) => {
      asserted.add(field);
      expect(got, `${key}.${field}`).toBe(num(spec, field, key));
    };

    // 루트 — 여백 · 간격이 없는 세로 흐름. 반경만 Layout 이 다시 쓴다.
    const root = style("root");
    expect(root.flexDirection, "root layoutMode VERTICAL").toBe("column");
    expect(px(root.paddingTop) + px(root.paddingBottom) + px(root.paddingLeft) + px(root.paddingRight), "root padding").toBe(0);
    expect(px(root.rowGap === "normal" ? "0" : root.rowGap), "root itemSpacing").toBe(0);
    check("radius", px(root.borderTopLeftRadius));
    expect(px(root.borderBottomRightRadius), `${key}.radius (맞은편 모서리)`).toBe(num(spec, "radius", key));

    // 머리 — 위아래 14 · 옆 20 · 두 줄 사이 8, 세로 흐름.
    const head = style("head");
    expect(head.flexDirection, "head layoutMode VERTICAL").toBe("column");
    check("headPaddingBlock", px(head.paddingTop));
    expect(px(head.paddingBottom), `${key}.headPaddingBlock (아래)`).toBe(num(spec, "headPaddingBlock", key));
    check("headPaddingInline", px(head.paddingLeft));
    expect(px(head.paddingRight), `${key}.headPaddingInline (오른쪽)`).toBe(num(spec, "headPaddingInline", key));
    check("headGap", px(head.rowGap));

    check("topGap", px(style("top").columnGap));
    check("metaGap", px(style("meta").columnGap));
    check("titleFontSize", px(style("title").fontSize));
    check("noteFontSize", px(style("note").fontSize));

    const chevron = find("chevron").getBoundingClientRect();
    check("chevronSize", Math.round(chevron.width));
    expect(Math.round(chevron.height), `${key}.chevronSize (높이)`).toBe(num(spec, "chevronSize", key));

    const sub = style("sub");
    check("subColumnGap", px(sub.columnGap));
    check("subRowGap", px(sub.rowGap));
    check("subItemFontSize", px(style("sub-item").fontSize));

    // 상세 — 위 12 · 아래 16 · 옆 20 · 안의 간격 12.
    const detail = style("detail");
    check("detailPaddingBlockStart", px(detail.paddingTop));
    check("detailPaddingBlockEnd", px(detail.paddingBottom));
    check("detailPaddingInline", px(detail.paddingLeft));
    expect(px(detail.paddingRight), `${key}.detailPaddingInline (오른쪽)`).toBe(num(spec, "detailPaddingInline", key));
    check("detailGap", px(detail.rowGap));

    const grid = style("grid");
    expect(grid.display, "grid layoutMode GRID").toBe("grid");
    check("gridColumnGap", px(grid.columnGap));
    check("gridRowGap", px(grid.rowGap));
    check("labelFontSize", px(style("label").fontSize));
    check("valueFontSize", px(style("value").fontSize));

    // 행동 줄 — 버튼 사이 8 · 위 4, 오른쪽 끝 정렬(Figma primaryAxisAlignItems MAX).
    const actions = style("actions");
    check("actionsGap", px(actions.columnGap));
    check("actionsPaddingBlockStart", px(actions.paddingTop));
    expect(actions.justifyContent, "actions primaryAxisAlignItems MAX").toBe("flex-end");

    // 기록의 수 필드를 하나도 빠뜨리지 않는다 — 기록에 칸이 늘면 여기가 먼저 빨개진다.
    const recorded = Object.keys(spec).filter((field) => !field.startsWith("$"));
    expect([...asserted].sort(), `${key} 의 잰 필드 = 기록의 필드`).toEqual(recorded.sort());
  });
}
