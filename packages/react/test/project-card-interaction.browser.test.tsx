// design/components/project-card.md의 상호작용 축을 실제 브라우저에서 검증한다.
//
// **이 파일의 요지는 "숨은 컨트롤은 초점에서 드러나야 한다"와 "진입 순서는 소비처가 준다" 둘이다.**
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { ProjectCard, ProjectCardMore, ProjectCardRename } from "@klipse-design/react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);

function scope(): ParentNode {
  const fixtures = document.querySelectorAll("[data-louis-fixture]");
  return fixtures.length > 0 ? fixtures[fixtures.length - 1]! : document;
}

async function mount(node: JSX.Element): Promise<void> {
  await render(<div data-louis-fixture style={{ inlineSize: "320px" }}>{node}</div>);
}

test("더보기 버튼은 평소 숨어 있다", async () => {
  await mount(
    <ProjectCard>
      <ProjectCardMore label="더보기" />
    </ProjectCard>,
  );
  const more = scope().querySelector<HTMLElement>(".louis-project-card-more")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 움직임을 줄여 달라고 한 사람에게 hover로만 드러나는 컨트롤은 찾기 어렵다 — 항상 보인다.
  expect(px(getComputedStyle(more).opacity)).toBe(reduced ? 1 : 0);
});

test("초점을 받으면 드러난다 — 키보드로 닿을 수 있어야 한다", async () => {
  await mount(
    <ProjectCard>
      <ProjectCardMore label="더보기" />
    </ProjectCard>,
  );
  const more = scope().querySelector<HTMLButtonElement>(".louis-project-card-more")!;
  await userEvent.tab();
  expect(document.activeElement).toBe(more);
  // opacity 전환이 160ms다. 바로 읽으면 진행 중인 값이 나온다.
  await expect
    .poll(() => px(getComputedStyle(more).opacity), { timeout: 1000 })
    .toBe(1);
});

test("더보기 버튼에 접근 가능한 이름이 있다", async () => {
  await mount(
    <ProjectCard>
      <ProjectCardMore label="프로젝트 메뉴" />
    </ProjectCard>,
  );
  const more = scope().querySelector<HTMLButtonElement>(".louis-project-card-more")!;
  expect(more.getAttribute("aria-label")).toBe("프로젝트 메뉴");
});

test("진입 순서는 소비처가 준다 — 주지 않으면 애니메이션하지 않는다", async () => {
  await mount(<ProjectCard>내용</ProjectCard>);
  const card = scope().querySelector<HTMLElement>(".louis-project-card")!;
  expect(card.hasAttribute("data-enter")).toBe(false);
  expect(getComputedStyle(card).animationName).toBe("none");
});

test("index를 주면 그만큼 지연된다", async () => {
  await mount(<ProjectCard enterIndex={3}>내용</ProjectCard>);
  const card = scope().querySelector<HTMLElement>(".louis-project-card")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    expect(getComputedStyle(card).animationName).toBe("none");
  } else {
    expect(getComputedStyle(card).animationName).toBe("louis-project-card-enter");
    // 배포본 실측: 항목당 36ms.
    expect(px(getComputedStyle(card).animationDelay)).toBeCloseTo(0.108, 3);
  }
});

test("이름 변경 입력에 크롬이 없다 — 자리가 흔들리지 않는다", async () => {
  await mount(
    <ProjectCard>
      <ProjectCardRename label="프로젝트 이름" defaultValue="여름 여행" />
    </ProjectCard>,
  );
  const input = scope().querySelector<HTMLInputElement>(".louis-project-card-rename")!;
  const style = getComputedStyle(input);
  expect(px(style.borderTopWidth)).toBe(0);
  expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(px(style.paddingTop)).toBe(0);
  expect(input.getAttribute("aria-label")).toBe("프로젝트 이름");
});
