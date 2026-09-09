// figma/components.measured.json 의 **transform-frame** 값을 코드가 여전히 만드는지 검증한다.
//
// 이 파일이 없으면 그 칸은 한 번 적어 두고 잊히는 숫자가 된다. parity 게이트는 Figma 가
// measured 와 같은지만 보므로, CSS 가 조용히 바뀌면 **Figma 와 measured 는 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. DS-D-0035 (c) 의 뒷절이 요구하는 되재기가 이것이고,
// verify-figma-done 이 이 파일의 존재를 조건으로 센다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** transform-frame 은 packages/react/src 에
// 표면이 없고 정본이 packages/css/src/component/transform-frame.css 다(계약의 figmaAhead 가 그
// 사실을 적는다). 그래서 여기서 렌더하는 마크업은 그 파일의 Usage 절이 적은 계약 그대로여야
// 한다 — 소비처가 지켜야 하는 것과 다른 마크업을 재면 이 파일이 제품에 없는 값을 지키게 된다.
//
// **손잡이 여덟 자리는 축이 아니라 좌표다**(DS-D-0060). 갈리는 것은 어느 벌을 내놓느냐 하나이고,
// 그것이 measured 의 두 size 키다 — corners 는 넷, corners-and-edges 는 여덟. 없는 벌을
// `display: none` 으로 숨기지 않고 **그리지 않는** 것도 계약이라 아래에서 함께 잰다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

type HandleSet = "corners" | "corners-and-edges";

const CORNERS = ["nw", "ne", "se", "sw"] as const;
const EDGES = ["n", "e", "s", "w"] as const;
const SETS: readonly HandleSet[] = ["corners", "corners-and-edges"];

const px = (value: string): number => Number.parseFloat(value);
const rect = (node: Element): DOMRect => node.getBoundingClientRect();
const round = (value: number): number => Math.round(value * 1000) / 1000;

/**
 * 프레임 하나를 고정 크기 무대 안에 렌더한다.
 *
 * 무대 크기를 고정하는 이유는 삼분할 선 때문이다. 선의 자리는 프레임 크기의 백분율이라
 * 무대가 없으면 절대 배치된 프레임이 0×0 이 되고, 그러면 선의 **두께**는 재도 그 두께가
 * 어느 축의 것인지 알 수 없다.
 */
function Specimen({ handles }: { handles: HandleSet }): JSX.Element {
  const positions = handles === "corners" ? CORNERS : [...CORNERS, ...EDGES];
  return (
    <div style={{ position: "relative", inlineSize: "240px", blockSize: "160px" }}>
      <div
        className="louis-transform-frame"
        data-testid="frame"
        style={{ inset: "0" }}
      >
        <div className="louis-transform-frame__grid" data-testid="grid">
          <i
            className="louis-transform-frame__grid-line"
            data-axis="vertical"
            data-third="1"
            data-testid="grid-line-v"
          />
          <i
            className="louis-transform-frame__grid-line"
            data-axis="vertical"
            data-third="2"
          />
          <i
            className="louis-transform-frame__grid-line"
            data-axis="horizontal"
            data-third="1"
            data-testid="grid-line-h"
          />
          <i
            className="louis-transform-frame__grid-line"
            data-axis="horizontal"
            data-third="2"
          />
        </div>
        {positions.map((position) => (
          <span
            key={position}
            className="louis-transform-frame__handle"
            data-position={position}
            data-testid={`handle-${position}`}
          />
        ))}
      </div>
    </div>
  );
}

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

for (const handles of SETS) {
  const spec = measured.components["transform-frame"].sizes[handles];

  test(`TransformFrame ${handles}의 구조값이 components.measured.json과 같다`, async () => {
    await render(<Specimen handles={handles} />);

    const frame = find("frame");
    const style = getComputedStyle(frame);
    expect(px(style.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
    expect(px(style.borderLeftWidth), "borderWidth (왼쪽)").toBe(spec.borderWidth);
    expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
    expect(px(style.borderBottomRightRadius), "radius (아래 오른쪽)").toBe(spec.radius);

    // 삼분할 선. 세로선은 폭이, 가로선은 높이가 계약이다 — 나머지 한 축은 창의 크기다.
    expect(round(rect(find("grid-line-v")).width), "gridLineWidth (세로)").toBe(
      spec.gridLineWidth,
    );
    expect(round(rect(find("grid-line-h")).height), "gridLineWidth (가로)").toBe(
      spec.gridLineWidth,
    );

    for (const position of CORNERS) {
      const handle = find(`handle-${position}`);
      const box = rect(handle);
      expect(round(box.width), `handleSize (${position} 폭)`).toBe(spec.handleSize);
      expect(round(box.height), `handleSize (${position} 높이)`).toBe(spec.handleSize);
      const handleStyle = getComputedStyle(handle);
      expect(px(handleStyle.borderTopLeftRadius), `handleRadius (${position})`).toBe(
        spec.handleRadius,
      );
      // 프레임과 손잡이가 **같은 두께**를 쓰는 것이 계약이다. 계약에 두께 키가 하나뿐인
      // 이유가 이것이고, 그래서 여기서도 같은 값과 대조한다.
      expect(px(handleStyle.borderTopWidth), `handle borderWidth (${position})`).toBe(
        spec.borderWidth,
      );
    }
  });
}

test("TransformFrame corners는 변 손잡이를 숨기는 것이 아니라 그리지 않는다", async () => {
  // 숨김으로 표현하면 잡히지 않는 손잡이가 접근성 트리에 남는다. Figma 도 같은 규칙으로
  // 그 변형에서 노드를 지운다 — 불리언 가시성으로 눌러 두면 세트의 다른 변형까지 사라진다.
  await render(<Specimen handles="corners" />);
  for (const position of EDGES) {
    expect(
      document.querySelector(`[data-testid="handle-${position}"]`),
      `변 손잡이 ${position}`,
    ).toBeNull();
  }
});

test("TransformFrame의 변 손잡이는 모서리와 같은 점이다", async () => {
  // 한때 변만 «움직이지 않는 축» 방향으로 36 만큼 눕혔다. 짧은 상자 위에서 알약이 창보다
  // 커져 접었고(DS-D-0062), 축은 자리와 커서가 말한다. 그래서 여기서 재는 것은 «같다» 다 —
  // 두 축을 각각 대조해야 한 축만 조용히 늘어나는 회귀가 잡힌다.
  const spec = measured.components["transform-frame"].sizes["corners-and-edges"];
  await render(<Specimen handles="corners-and-edges" />);
  for (const position of EDGES) {
    const box = rect(find(`handle-${position}`));
    expect(round(box.width), `edgeHandleSize (${position} 폭)`).toBe(spec.edgeHandleSize);
    expect(round(box.height), `edgeHandleSize (${position} 높이)`).toBe(spec.edgeHandleSize);
  }
  expect(spec.edgeHandleSize, "변과 모서리가 같은 수인 것이 계약이다").toBe(spec.handleSize);
});

test("TransformFrame의 손잡이는 변의 바깥으로 절반 나간다", async () => {
  // 잡는 곳이 창 안쪽에만 있으면 창의 마지막 몇 px 을 손가락이 덮는다. 이 명제는 값 하나가
  // 아니라 **두 상자의 관계**라 계약 표로는 적을 수 없어 여기서 잰다. Figma 쪽의 같은 사실은
  // 되읽기의 outsideParts 가 소유한다.
  const spec = measured.components["transform-frame"].sizes["corners-and-edges"];
  await render(<Specimen handles="corners-and-edges" />);
  const frame = rect(find("frame"));
  const nw = rect(find("handle-nw"));
  const se = rect(find("handle-se"));
  expect(round(frame.left - nw.left), "nw 가 왼쪽으로 나간 만큼").toBe(spec.handleSize / 2);
  expect(round(frame.top - nw.top), "nw 가 위로 나간 만큼").toBe(spec.handleSize / 2);
  expect(round(se.right - frame.right), "se 가 오른쪽으로 나간 만큼").toBe(spec.handleSize / 2);
  expect(round(se.bottom - frame.bottom), "se 가 아래로 나간 만큼").toBe(spec.handleSize / 2);
});
