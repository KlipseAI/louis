// design/patterns/app-shell.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// **이 파일의 요지는 "겹치지 않는다"와 "구르는 곳이 하나다" 둘이다.** 레일이 문서 흐름 밖에
// 있어도 main이 같은 상태 원천으로 자리를 예약하므로 어떤 상태에서도 겹치지 않아야 한다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { AppShell } from "@klipse-design/react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

function scope(): ParentNode {
  const fixtures = document.querySelectorAll("[data-louis-fixture]");
  return fixtures.length > 0 ? fixtures[fixtures.length - 1]! : document;
}

const shell = (): HTMLElement => scope().querySelector<HTMLElement>(".louis-app-shell")!;
const rail = (): HTMLElement => scope().querySelector<HTMLElement>(".louis-app-shell__rail")!;
const main = (): HTMLElement => scope().querySelector<HTMLElement>(".louis-app-shell__main")!;
const content = (): HTMLElement => scope().querySelector<HTMLElement>(".louis-app-shell__content")!;

const overlaps = (a: DOMRect, b: DOMRect): boolean =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

async function mount(node: JSX.Element): Promise<void> {
  await render(
    <div data-louis-fixture style={{ inlineSize: "1200px", blockSize: "600px" }}>
      {node}
    </div>,
  );
}

test("펼침·접힘 어느 상태에서도 레일과 본문이 겹치지 않는다", async () => {
  for (const collapsed of [false, true]) {
    await mount(
      <AppShell rail={<div style={{ blockSize: "100px" }} />} collapsed={collapsed}>
        <p>본문</p>
      </AppShell>,
    );
    const railBox = rail().getBoundingClientRect();
    // 본문의 실제 내용 상자를 잰다 — main은 padding으로 자리를 예약하므로 그 안쪽이 기준이다.
    const contentBox = content().getBoundingClientRect();
    expect(overlaps(railBox, contentBox), `collapsed=${collapsed}`).toBe(false);
  }
});

test("접히면 예약 폭이 줄어든다", async () => {
  const compact = window.matchMedia("(max-width: 719px)").matches;

  await mount(
    <AppShell rail={<div />}>
      <p>본문</p>
    </AppShell>,
  );
  const expanded = Number.parseFloat(getComputedStyle(main()).paddingInlineStart);

  await mount(
    <AppShell rail={<div />} collapsed>
      <p>본문</p>
    </AppShell>,
  );
  const collapsed = Number.parseFloat(getComputedStyle(main()).paddingInlineStart);

  if (compact) {
    // compact에서는 예약이 0이고 레일이 drawer로 열린다 — 접힘 선호를 여기 적용하지 않는다.
    expect(expanded).toBe(0);
    expect(collapsed).toBe(0);
  } else {
    expect(collapsed).toBeLessThan(expanded);
    expect(expanded).toBe(280);
  }
});

test("구르는 곳이 하나다 — 본문만 구르고 셸은 넘치지 않는다", async () => {
  await mount(
    <AppShell rail={<div />} chrome={<div>크롬</div>}>
      <div style={{ blockSize: "2000px" }}>긴 본문</div>
    </AppShell>,
  );
  expect(getComputedStyle(content()).overflowY).toBe("auto");
  expect(getComputedStyle(shell()).overflow).toBe("hidden");
});

test("workspace variant는 본문이 구르지 않는다 — 에디터가 안쪽 스크롤을 소유한다", async () => {
  await mount(
    <AppShell rail={<div />} variant="workspace">
      <div style={{ blockSize: "2000px" }}>워크스페이스</div>
    </AppShell>,
  );
  expect(getComputedStyle(content()).overflowY).toBe("hidden");
});

test("상단 크롬은 스크롤 루트 안에 sticky로 있다", async () => {
  await mount(
    <AppShell rail={<div />} chrome={<div>크롬</div>}>
      <p>본문</p>
    </AppShell>,
  );
  const chrome = scope().querySelector<HTMLElement>(".louis-app-shell__chrome")!;
  expect(getComputedStyle(chrome).position).toBe("sticky");
  // 크롬과 본문이 같은 좌우 inset 원천을 읽는다. 다르면 줄이 어긋난다.
  expect(getComputedStyle(chrome).paddingInlineStart).toBe(
    getComputedStyle(content()).paddingInlineStart,
  );
});

test("drawer가 열리면 뒤 콘텐츠가 pointer와 focus 양쪽에서 죽는다", async () => {
  await mount(
    <AppShell rail={<div />} drawerOpen onDrawerClose={() => {}}>
      <button type="button">뒤 버튼</button>
    </AppShell>,
  );
  expect(main().hasAttribute("inert")).toBe(true);
});

test("Escape로 drawer가 닫힌다", async () => {
  let closed = false;
  await mount(
    <AppShell rail={<div />} drawerOpen onDrawerClose={() => { closed = true; }}>
      <p>본문</p>
    </AppShell>,
  );
  await userEvent.keyboard("{Escape}");
  expect(closed).toBe(true);
});

test("건너뛰기 링크가 본문을 가리킨다", async () => {
  await mount(
    <AppShell rail={<div />}>
      <p>본문</p>
    </AppShell>,
  );
  const skip = scope().querySelector<HTMLAnchorElement>(".louis-app-shell__skip")!;
  const target = skip.getAttribute("href")!.slice(1);
  expect(content().id).toBe(target);
  // 평소에는 화면 밖에 있다.
  expect(getComputedStyle(skip).translate).not.toBe("none");
});
