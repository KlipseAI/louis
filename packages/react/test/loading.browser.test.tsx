// design/patterns/loading.md의 합성 계약을 실제 브라우저에서 검증한다.
//
// 이 패턴은 **컴포넌트가 아니라 경계**다. 무엇을 언제 쓰는가와 **누가 로딩을 알리는가**를 정한다.
// 그래서 새 CSS가 없고, 대신 Spinner·Skeleton을 실제로 합성해 그 경계를 잰다.
import type { JSX } from "react";
import { useState } from "react";
import axe from "axe-core";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Skeleton, Spinner } from "@klipse-design/react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

function scope(): ParentNode {
  const g = document.querySelectorAll("[data-kds-fixture]");
  return g.length > 0 ? g[g.length - 1]! : document;
}
const find = (s: string): HTMLElement => {
  const n = scope().querySelector(s);
  if (n === null) throw new Error(`찾지 못했습니다: ${s}`);
  return n as HTMLElement;
};

/** 규범이 말하는 합성 — 영역이 aria-busy를 갖고 자리표시는 장식이다. */
function Region({ busy, children }: { busy: boolean; children: JSX.Element }): JSX.Element {
  return (
    <section data-kds-fixture aria-busy={busy} aria-label="프로젝트 목록">
      {children}
    </section>
  );
}

test("로딩을 알리는 것은 자리표시가 아니라 영역이다", async () => {
  await render(
    <Region busy>
      <div>
        <Skeleton style={{ inlineSize: "120px", blockSize: "20px" }} />
        <Skeleton style={{ inlineSize: "80px", blockSize: "20px" }} />
      </div>
    </Region>,
  );
  // 스켈레톤마다 읽히면 소음이 된다. 영역이 한 번 말한다.
  for (const node of Array.from(scope().querySelectorAll(".kds-skeleton"))) {
    expect(node.getAttribute("aria-hidden"), "자리표시는 장식이다").toBe("true");
  }
  expect((scope() as HTMLElement).getAttribute("aria-busy"), "영역이 알린다").toBe("true");
});

test("끝나면 aria-busy가 내려가고 내용이 그 자리를 대신한다", async () => {
  function Fixture(): JSX.Element {
    const [busy, setBusy] = useState(true);
    return (
      <>
        <Region busy={busy}>
          {busy ? (
            <Skeleton style={{ inlineSize: "120px", blockSize: "20px" }} />
          ) : (
            <p>프로젝트 3개</p>
          )}
        </Region>
        <button type="button" onClick={() => setBusy(false)}>
          완료
        </button>
      </>
    );
  }
  await render(<Fixture />);
  expect((scope() as HTMLElement).getAttribute("aria-busy")).toBe("true");
  await userEvent.click(document.querySelector("button") as HTMLElement);
  expect((scope() as HTMLElement).getAttribute("aria-busy"), "내려간다").toBe("false");
  expect(scope().querySelector(".kds-skeleton"), "자리표시가 사라진다").toBeNull();
});

test("모양을 아는 자리와 모르는 자리가 서로 다른 것을 쓴다", async () => {
  // 규범의 선택 규칙을 합성으로 고정한다 — 목록은 Skeleton, 버튼 안은 Spinner다.
  await render(
    <Region busy>
      <div>
        <Skeleton style={{ inlineSize: "120px", blockSize: "20px" }} />
        <Spinner />
      </div>
    </Region>,
  );
  expect(find(".kds-skeleton"), "모양을 아는 자리").toBeTruthy();
  expect(find(".kds-spinner"), "모양을 모르는 자리").toBeTruthy();
  // 둘 다 스스로 읽히지 않는다. 영역이 소유한다.
  expect(find(".kds-skeleton").getAttribute("aria-hidden")).toBe("true");
});

test("reduced-motion에서 둘 다 반복을 멈춘다", async () => {
  await render(
    <Region busy>
      <div>
        <Skeleton style={{ inlineSize: "120px", blockSize: "20px" }} />
        <Spinner />
      </div>
    </Region>,
  );
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const want = reduced ? "1" : "infinite";
  expect(getComputedStyle(find(".kds-skeleton")).animationIterationCount, "skeleton").toBe(want);
  expect(
    getComputedStyle(find(".kds-spinner__ring")).animationIterationCount, "spinner",
  ).toBe(want);
});

test("합성에 접근성 위반이 없다", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  try {
    await render(
      <Region busy>
        <div>
          <Skeleton style={{ inlineSize: "120px", blockSize: "20px" }} />
          <Spinner />
        </div>
      </Region>,
      { container: host },
    );
    const results = await axe.run(host, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
    });
    expect(results.violations.map((v) => v.id).sort(), "접근성 위반").toEqual([]);
  } finally {
    host.remove();
  }
});

export type _EnsureTsx = JSX.Element;
