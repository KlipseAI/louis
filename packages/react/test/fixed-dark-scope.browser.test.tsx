// 테마 계약 밖의 「고정 다크」 화면이 LOUIS 부품을 그대로 쓸 수 있는가를 잰다(DS-D-0109).
//
// 제품 부스 화면(components/creative-media/CreativeMediaClient.tsx:26-28)은 「공용 Button 의 secondary/ghost 는 html[data-theme] 를 따라가서 여기선
// 못 쓴다」며 palette-* 고정 버튼을 따로 짰다. LOUIS 의 다크 토큰 블록은 `:root` 가 아니라 속성 선택자 `[data-theme="dark"]` 에 걸려 있어
// (packages/css/generated/tokens.css) **하위 트리에 다크를 고정**할 수 있다. 문서가 라이트일 때 다크 고정 상자 안의 부품이, 문서 전체가
// 다크일 때와 같은 계산값을 갖는지 맞댄다.
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

function Parts({ prefix }: { readonly prefix: string }) {
  return (
    <div style={{ background: "var(--louis-color-bg-canvas)", color: "var(--louis-color-fg-primary)", padding: 16 }} data-testid={`${prefix}-floor`}>
      <button type="button" className="louis-button" data-variant="secondary" data-size="lg" data-testid={`${prefix}-secondary`}>
        다시 만들기
      </button>
      <button type="button" className="louis-button" data-variant="ghost" data-size="lg" data-testid={`${prefix}-ghost`}>
        닫기
      </button>
      <span className="louis-badge" data-testid={`${prefix}-badge`}>
        남은 횟수 2
      </span>
    </div>
  );
}

const PROPS = ["backgroundColor", "color", "boxShadow"] as const;

function snapshot(prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of ["floor", "secondary", "ghost", "badge"]) {
    const style = getComputedStyle(find(`${prefix}-${part}`));
    for (const prop of PROPS) out[`${part}.${prop}`] = style[prop];
  }
  return out;
}

test("문서가 라이트여도 [data-theme=\"dark\"] 상자 안의 Button · Badge · 바닥이 문서 전체 다크와 같은 값을 갖는다", async () => {
  // 1) 문서 전체 다크 — 기준값.
  document.documentElement.setAttribute("data-theme", "dark");
  const reference = await render(<Parts prefix="root" />);
  const dark = snapshot("root");
  await reference.unmount();

  // 2) 문서는 라이트, 화면 상자만 다크 고정.
  document.documentElement.setAttribute("data-theme", "light");
  await render(
    <div data-theme="dark">
      <Parts prefix="scoped" />
    </div>,
  );
  const scoped = snapshot("scoped");
  expect(scoped).toEqual(dark);

  // 3) 대조군 — 고정이 없으면 라이트 값이 나온다(시험이 「같다」를 우연히 얻지 않았다).
  const light = getComputedStyle(document.body).getPropertyValue("--louis-color-bg-canvas").trim();
  const scopedFloor = getComputedStyle(find("scoped-floor")).getPropertyValue("--louis-color-bg-canvas").trim();
  expect(scopedFloor).not.toBe(light);
});
