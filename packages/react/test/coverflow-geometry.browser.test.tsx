// figma/components.measured.json 의 **coverflow-card · coverflow-nav · coverflow-dot · coverflow** 값을 코드가 여전히 만드는지 검증한다
// (DS-D-0035 (c), 2026-10-14 DS-D-0090).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// 겹 순서 · 거리 식 · 대비는 coverflow.browser.test.tsx 가 소유한다.
import type { CSSProperties, JSX } from "react";
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

const vars = (entries: Record<string, string>): CSSProperties => entries as CSSProperties;
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

/** 묶음 폭 `width`(base 1120 · compact 600) — 세 장, 가운데 1, 가운데 카드에 라벨. */
function Coverflow({ width, active = 1 }: { readonly width: number; readonly active?: number }): JSX.Element {
  return (
    <div style={{ inlineSize: width }}>
      <div className="louis-coverflow">
        <div className="louis-coverflow__stage" tabIndex={0} data-testid="stage">
          <div className="louis-coverflow__deck">
            {[0, 1, 2].map((i) => {
              const offset = i - active;
              return (
                <div
                  key={i}
                  className="louis-coverflow__card"
                  data-active={offset === 0 ? "true" : undefined}
                  style={vars({ "--louis-coverflow-offset": String(offset), "--louis-coverflow-depth": String(Math.abs(offset)) })}
                  data-testid={offset === 0 ? "card" : `card-${offset}`}
                >
                  <img className="louis-coverflow__media" src={PIXEL} alt="" />
                  {offset === 0 ? (
                    <span className="louis-coverflow__label" data-testid="label">
                      <span className="louis-badge" data-surface="media">
                        워크플로
                      </span>
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="louis-coverflow__controls" data-testid="controls">
          <button type="button" className="louis-coverflow__nav" aria-label="이전" disabled={active === 0} data-testid="prev">
            <svg className="louis-coverflow__nav-glyph" viewBox="0 0 24 24" aria-hidden="true" data-testid="glyph" />
          </button>
          <div className="louis-coverflow__dots" data-testid="dots">
            {[0, 1, 2].map((i) => (
              <button key={i} type="button" className="louis-coverflow__dot" aria-current={i === active ? "true" : undefined} aria-label={`${i + 1}번째 미디어`} data-testid={i === active ? "dot-active" : `dot-${i}`} />
            ))}
          </div>
          <button type="button" className="louis-coverflow__nav" aria-label="다음" data-testid="next">
            <svg className="louis-coverflow__nav-glyph" viewBox="0 0 24 24" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

beforeEach(async () => {
  await page.viewport(1440, 900);
});

// 기록을 id 문자열 인덱스로 **직접** 읽는다(간접 함수를 거치지 않는다) — verify-figma-done 이 그 모양으로 (c) 의 되재기를 센다.
const cardSizes = measured.components["coverflow-card"].sizes as Sizes;
const navSizes = measured.components["coverflow-nav"].sizes as Sizes;
const dotSizes = measured.components["coverflow-dot"].sizes as Sizes;
const boardSizes = measured.components["coverflow"].sizes as Sizes;
const widthOf = (layout: string): number => (layout === "compact" ? 600 : 1120);
const rect = (id: string): DOMRect => find(id).getBoundingClientRect();

for (const [key, spec] of Object.entries(cardSizes)) {
  test(`coverflow-card ${key} — 카드 크기 · 반경 · 라벨 자리`, async () => {
    const [layout, selected] = key.split("/") as [string, string];
    await render(<Coverflow width={widthOf(layout)} />);
    const id = selected === "true" ? "card" : "card-1";
    const card = find(id);
    // 옆 카드는 원근에 투영된 상자라 크기는 레이아웃 상자(offsetWidth · offsetHeight)로 잰다.
    expect(card.offsetWidth, `${key} 폭`).toBeCloseTo(num(spec, "width", key), 1);
    expect(card.offsetHeight, `${key} 높이`).toBeCloseTo(num(spec, "height", key), 1);
    expect(px(getComputedStyle(card).borderTopLeftRadius), `${key} 반경`).toBe(num(spec, "radius", key));
    const label = getComputedStyle(find("label"));
    expect(px(label.left), `${key} 라벨 왼쪽`).toBe(num(spec, "labelInset", key));
    expect(px(label.bottom), `${key} 라벨 아래`).toBe(num(spec, "labelInset", key));
  });
}

for (const [key, spec] of Object.entries(navSizes)) {
  test(`coverflow-nav ${key} — 버튼 크기 · 글리프`, async () => {
    const [direction, state] = key.split("/") as [string, string];
    await render(<Coverflow width={1120} active={state === "Disabled" ? 0 : 1} />);
    const id = direction === "prev" ? "prev" : "next";
    expect(rect(id).width, `${key} 폭`).toBe(num(spec, "size", key));
    expect(rect(id).height, `${key} 높이`).toBe(num(spec, "size", key));
    expect(rect("glyph").width, `${key} 글리프`).toBe(num(spec, "glyphSize", key));
  });
}

for (const [key, spec] of Object.entries(dotSizes)) {
  test(`coverflow-dot ${key} — 점 크기`, async () => {
    const [selected] = key.split("/") as [string];
    await render(<Coverflow width={1120} />);
    const box = rect(selected === "true" ? "dot-active" : "dot-0");
    expect(box.width, `${key} 폭`).toBeCloseTo(num(spec, "size", key), 1);
    expect(box.height, `${key} 높이`).toBeCloseTo(num(spec, "size", key), 1);
  });
}

for (const [key, spec] of Object.entries(boardSizes)) {
  test(`coverflow ${key} — 무대 높이 · 조작 줄 위 · 사이 · 점 사이`, async () => {
    await render(<Coverflow width={widthOf(key)} />);
    expect(rect("stage").height, `${key} 무대`).toBe(num(spec, "stageHeight", key));
    expect(rect("controls").top - rect("stage").bottom, `${key} 조작 줄 위`).toBeCloseTo(num(spec, "controlsOffset", key), 1);
    expect(px(getComputedStyle(find("controls")).columnGap), `${key} 조작 줄 사이`).toBe(num(spec, "controlsGap", key));
    expect(px(getComputedStyle(find("dots")).columnGap), `${key} 점 사이`).toBe(num(spec, "dotsGap", key));
  });
}
