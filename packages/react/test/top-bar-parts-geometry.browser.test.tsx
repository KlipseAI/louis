// figma/components.measured.json 의 **top-bar-title · top-bar-home** 값을 코드가 여전히 만드는지 검증한다.
//
// parity 게이트는 Figma(AppTopBarTitle · AppTopBarHome)가 기록과 같은지만 본다. 이 파일이 없으면
// app-shell.css 의 캔버스 판 레시피가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다 코드와 틀린**
// 상태로 통과한다. DS-D-0035 (c) 가 요구하는 반대 방향이 이것이다.
//
// **React 표면이 없어 클래스 마크업을 렌더한다.** 마크업은 design/components/app-shell-parts.md 캔버스 판
// Anatomy 의 계약 그대로다(`header[data-surface="canvas"]` 안의 `__home` · `__title` > `__title-button`).
// 기록의 키는 Figma State 다. Hover · Active 는 면 색(그리고 홈의 누름 `scale`)만 바꿔 레이아웃 기하가
// 같으므로 같은 노드를 키마다 맞대고, 제목의 Focus 는 같은 자리에 선 편집 입력 `__title-input` 을 잰다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/app-shell.css";

type TitleKey = "Default" | "Hover" | "Active" | "Focus";
type HomeKey = "Default" | "Hover" | "Active";

const TITLE_KEYS: readonly TitleKey[] = ["Default", "Hover", "Active", "Focus"];
const HOME_KEYS: readonly HomeKey[] = ["Default", "Hover", "Active"];

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/** `sizes` 한 칸의 수. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(cell: Record<string, unknown>, field: string, label: string): number {
  const value = cell[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function Bar({ children }: { children: JSX.Element }): JSX.Element {
  return (
    <header className="louis-app-top-bar" data-surface="canvas">
      {children}
    </header>
  );
}

for (const key of TITLE_KEYS) {
  test(`top-bar 제목 ${key}: 높이 · 좌우 여백이 AppTopBarTitle 기록과 같다`, async () => {
    const cell = measured.components["top-bar-title"].sizes[key] as Record<string, unknown>;
    const label = `top-bar-title.sizes.${key}`;
    await render(
      <Bar>
        <div className="louis-app-top-bar__title">
          {key === "Focus" ? (
            <input
              className="louis-app-top-bar__title-input"
              defaultValue="새 프로젝트"
              aria-label="프로젝트 이름"
              data-testid="title"
            />
          ) : (
            <button
              type="button"
              className="louis-app-top-bar__title-button"
              aria-label="프로젝트 이름 바꾸기"
              data-testid="title"
            >
              새 프로젝트
            </button>
          )}
        </div>
      </Bar>,
    );
    const node = find("title");
    const style = getComputedStyle(node);
    expect(Math.round(node.getBoundingClientRect().height)).toBe(num(cell, "height", label));
    expect(px(style.blockSize)).toBe(num(cell, "height", label));
    expect(px(style.paddingInlineStart)).toBe(num(cell, "paddingInline", label));
    expect(px(style.paddingInlineEnd)).toBe(num(cell, "paddingInline", label));
  });
}

for (const key of HOME_KEYS) {
  test(`top-bar 홈 ${key}: 높이 · 최소 폭 · 비대칭 여백이 AppTopBarHome 기록과 같다`, async () => {
    const cell = measured.components["top-bar-home"].sizes[key] as Record<string, unknown>;
    const label = `top-bar-home.sizes.${key}`;
    await render(
      <Bar>
        <a className="louis-app-top-bar__home" href="#home" aria-label="아카이브로" data-testid="home">
          <span style={{ display: "inline-block", inlineSize: 20, blockSize: 20 }} aria-hidden="true" />
        </a>
      </Bar>,
    );
    const node = find("home");
    const style = getComputedStyle(node);
    expect(Math.round(node.getBoundingClientRect().height)).toBe(num(cell, "height", label));
    expect(px(style.minInlineSize)).toBe(num(cell, "minWidth", label));
    // 심볼 20 + 시작 여백 6 = 26 이라 최소 폭 32 가 이긴다 — 하한이 실제로 선다.
    expect(Math.round(node.getBoundingClientRect().width)).toBe(num(cell, "minWidth", label));
    expect(px(style.paddingInlineStart)).toBe(num(cell, "paddingInlineStart", label));
    expect(px(style.paddingInlineEnd)).toBe(num(cell, "paddingInlineEnd", label));
  });
}
