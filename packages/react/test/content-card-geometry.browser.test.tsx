// figma/components.measured.json 의 **content-card** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-14 DS-D-0088).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 Layout/State 키)마다 클래스 마크업을 렌더하고 기록의 필드를
// 계산값과 맞댄다. stack 은 Figma 표본과 같은 300 칸에 둔다(커버 폭이 표본 폭의 결과다). 대비 · 호버는 content-card.browser.test.tsx 가 소유한다.
import type { JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

function Card({ layout }: { readonly layout: "row" | "stack" }): JSX.Element {
  const row = layout === "row";
  const cover = (
    <div className="louis-content-card__cover" data-testid="cover">
      <img className="louis-content-card__media" src={PIXEL} alt="" />
    </div>
  );
  return (
    <div style={{ inlineSize: row ? 720 : 300 }}>
      <a className="louis-content-card" data-layout={row ? undefined : "stack"} href="#x" data-testid="card">
        {row ? null : cover}
        <div className="louis-content-card__body" data-testid="body">
          <h2 className="louis-content-card__title" data-testid="title">
            제목
          </h2>
          <p className="louis-content-card__description">설명</p>
          {row ? (
            <span className="louis-content-card__meta" data-testid="meta">
              2026.10.13
            </span>
          ) : null}
        </div>
        {row ? cover : null}
      </a>
    </div>
  );
}

beforeEach(async () => {
  await page.viewport(1440, 900);
});

const sizes = measured.components["content-card"].sizes as Sizes;

test("기록의 키가 Figma 의 Layout × State 와 같다", () => {
  expect(Object.keys(sizes).sort()).toEqual(["row/Default", "row/Hover", "stack/Default", "stack/Hover"]);
});

for (const [key, spec] of Object.entries(sizes)) {
  test(`${key} — 기록의 기하를 코드가 만든다`, async () => {
    const layout = key.split("/")[0] as "row" | "stack";
    await render(<Card layout={layout} />);
    const card = getComputedStyle(find("card"));
    expect(px(card.columnGap === "normal" ? "0" : card.columnGap), "gap").toBe(num(spec, "gap", key));
    expect(px(card.paddingTop), "padding").toBe(num(spec, "padding", key));
    expect(px(card.borderTopWidth), "borderWidth").toBe(num(spec, "borderWidth", key));
    expect(card.flexDirection, "direction").toBe(spec.direction);
    expect(px(card.borderTopLeftRadius), "radius").toBe(num(spec, "radius", key));
    const cover = find("cover").getBoundingClientRect();
    expect(cover.width, "coverWidth").toBeCloseTo(num(spec, "coverWidth", key), 1);
    expect(cover.height, "coverHeight").toBeCloseTo(num(spec, "coverHeight", key), 1);
    expect(px(getComputedStyle(find("cover")).borderTopLeftRadius), "coverRadius").toBe(num(spec, "coverRadius", key));
    const body = getComputedStyle(find("body"));
    expect(px(body.rowGap), "bodyGap").toBe(num(spec, "bodyGap", key));
    expect(px(body.paddingTop), "bodyPaddingTop").toBe(num(spec, "bodyPaddingTop", key));
    expect(px(body.paddingBottom), "bodyPaddingBottom").toBe(num(spec, "bodyPaddingBottom", key));
    expect(px(body.paddingLeft), "bodyPaddingInline").toBe(num(spec, "bodyPaddingInline", key));
    expect(px(getComputedStyle(find("title")).fontSize), "titleSize").toBe(num(spec, "titleSize", key));
    if (layout === "row") expect(px(getComputedStyle(find("meta")).marginTop), "metaOffset").toBe(num(spec, "metaOffset", key));
    else expect(spec.metaOffset, "stack 은 메타가 없다").toBeUndefined();
  });
}
