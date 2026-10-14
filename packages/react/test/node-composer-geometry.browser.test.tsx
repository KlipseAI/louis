// figma/components.measured.json 의 **node-composer**(`composer` · `error` 두 칸) 기하를 코드가 여전히 만드는지 잰다
// (DS-D-0035 (c)). 입력판은 React 표면이 없는 CSS 레시피(packages/css/src/component/node-shell.css 의
// `.louis-node-shell__composer` 이하)라 문서(design/components/node-shell.md 「입력판」)의 클래스 마크업을 렌더한다.
// 칸마다 verify-figma-parity 의 NodeComposer · NodeComposerError 계약이 대조하는 필드를 전부 계산값과 맞댄다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/node-shell.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

/** `sizes` 한 칸의 수 필드. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function expectPadding(style: CSSStyleDeclaration, value: number, label: string): void {
  expect(px(style.paddingTop), `${label} paddingTop`).toBe(value);
  expect(px(style.paddingBottom), `${label} paddingBottom`).toBe(value);
  expect(px(style.paddingLeft), `${label} paddingLeft`).toBe(value);
  expect(px(style.paddingRight), `${label} paddingRight`).toBe(value);
}

const sizes = measured.components["node-composer"].sizes as unknown as Sizes;

/** 문서 「입력판」 절의 마크업 — 면 첫 줄(Lead) 하나 · 푸터(설정 줄 · 오류 배너). 폭은 카드 400. */
function Composer(): JSX.Element {
  return (
    <div style={{ inlineSize: 400 }}>
      <div className="louis-node-shell__composer" data-testid="composer">
        <div className="louis-node-shell__field" data-testid="field">
          <textarea aria-label="프롬프트" data-testid="lead" style={{ display: "block", blockSize: 48 }} />
          <div className="louis-node-shell__footer" data-testid="footer">
            <div className="louis-node-shell__footer-controls" data-testid="controls">
              <div className="louis-node-shell__meta" data-testid="meta">
                <span style={{ inlineSize: 40, blockSize: 32 }} />
                <span style={{ inlineSize: 40, blockSize: 32 }} />
              </div>
              <div className="louis-node-shell__generate" data-testid="generate">
                <span style={{ display: "block", inlineSize: 32, blockSize: 32 }} />
              </div>
            </div>
            <div className="louis-node-shell__error" role="alert" data-testid="error">
              <span className="louis-node-shell__error-text">생성에 실패했습니다.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

test("node-composer composer — 영역 · 면 · 푸터 · 설정 줄 · 알약 줄 · 생성 자리가 기록과 같다", async () => {
  const spec = sizes["composer"];
  if (spec === undefined) throw new Error("node-composer.sizes.composer 가 없습니다");
  const label = "node-composer.composer";
  await render(<Composer />);

  const composer = getComputedStyle(find("composer"));
  expectPadding(composer, num(spec, "padding", label), `${label} 영역`);
  expect(px(composer.rowGap), `${label} gap`).toBe(num(spec, "gap", label));
  expect(composer.flexDirection, `${label} 세로`).toBe("column");
  // 영역은 투명한 흐름 상자다 — 계약의 cornerRadius 0 이 그 뜻이다.
  expect(px(composer.borderTopLeftRadius), `${label} 영역 곡률`).toBe(0);

  const field = getComputedStyle(find("field"));
  expectPadding(field, num(spec, "fieldPadding", label), `${label} 면`);
  expect(px(field.borderTopLeftRadius), `${label} fieldRadius`).toBe(num(spec, "fieldRadius", label));
  expect(field.flexDirection, `${label} 면 세로`).toBe("column");

  // 푸터 위 8 은 앞 형제가 있을 때의 margin 이다 — 선언과 실제 틈을 같이 본다.
  expect(px(getComputedStyle(find("footer")).marginTop), `${label} footerOffset 선언`).toBe(
    num(spec, "footerOffset", label),
  );
  expect(
    find("footer").getBoundingClientRect().top - find("lead").getBoundingClientRect().bottom,
    `${label} footerOffset 틈`,
  ).toBe(num(spec, "footerOffset", label));
  const footer = getComputedStyle(find("footer"));
  expect(px(footer.rowGap), `${label} footerGap`).toBe(num(spec, "footerGap", label));
  expect(
    find("error").getBoundingClientRect().top - find("controls").getBoundingClientRect().bottom,
    `${label} footerGap 틈`,
  ).toBe(num(spec, "footerGap", label));

  expect(find("controls").getBoundingClientRect().height, `${label} controlsHeight 설정 줄`).toBe(
    num(spec, "controlsHeight", label),
  );
  expect(find("meta").getBoundingClientRect().height, `${label} controlsHeight 알약 줄`).toBe(
    num(spec, "controlsHeight", label),
  );
  expect(px(getComputedStyle(find("meta")).columnGap), `${label} metaGap`).toBe(num(spec, "metaGap", label));
  expect(px(getComputedStyle(find("generate")).marginLeft), `${label} generateOffset`).toBe(
    num(spec, "generateOffset", label),
  );
  expect(
    find("generate").getBoundingClientRect().left - find("meta").getBoundingClientRect().right,
    `${label} generateOffset 틈`,
  ).toBe(num(spec, "generateOffset", label));
});

test("node-composer error — 오류 배너의 최소 높이 · 여백 · 간격 · 반경이 기록과 같다", async () => {
  const spec = sizes["error"];
  if (spec === undefined) throw new Error("node-composer.sizes.error 가 없습니다");
  const label = "node-composer.error";
  await render(<Composer />);
  const error = getComputedStyle(find("error"));
  expect(px(error.minHeight), `${label} minHeight`).toBe(num(spec, "minHeight", label));
  expect(find("error").getBoundingClientRect().height, `${label} 한 줄 높이 ≥ minHeight`).toBeGreaterThanOrEqual(
    num(spec, "minHeight", label),
  );
  expectPadding(error, num(spec, "padding", label), label);
  expect(px(error.columnGap), `${label} gap`).toBe(num(spec, "gap", label));
  expect(px(error.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
  expect(error.flexDirection, `${label} 가로`).toBe("row");
});
