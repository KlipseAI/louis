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
import measured from "../../../figma/components.measured.json" with { type: "json" };

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

test("이름 변경 입력은 밑줄 하나만 그린다 — 글자를 밀지 않는다", async () => {
  await mount(
    <ProjectCard>
      <ProjectCardRename label="프로젝트 이름" defaultValue="여름 여행" />
    </ProjectCard>,
  );
  const input = scope().querySelector<HTMLInputElement>(".louis-project-card-rename")!;
  const style = getComputedStyle(input);
  const size = measured.components["project-card"].sizes.base;

  // **글자를 미는 크롬은 여전히 없다.** 위·좌·우 테두리와 면과 위쪽 여백이 0이라 밑줄을 켜도
  // 글자의 시작점이 움직이지 않는다 — 이것이 "다른 곳으로 갔다"를 막는 조건이다.
  expect(px(style.borderTopWidth)).toBe(0);
  expect(px(style.borderLeftWidth)).toBe(0);
  expect(px(style.borderRightWidth)).toBe(0);
  expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(px(style.paddingTop)).toBe(0);
  expect(input.getAttribute("aria-label")).toBe("프로젝트 이름");

  // **소유자 판정으로 밑줄형이 정본이다**(DS-D-0051). Figma 의 `State=Renaming` 안 `Rename`
  // 부품과 그 아래 `Underline` 이 같은 계약값을 대조하므로 이 셋이 그 대조의 코드 쪽 절반이다 —
  // 없으면 measured 와 Figma 만 서로를 보고 CSS 는 아무도 안 본다.
  expect(px(style.borderBottomWidth), "renameUnderlineWidth").toBe(
    size.renameUnderlineWidth,
  );
  expect(px(style.paddingBottom), "renameUnderlineGap").toBe(size.renameUnderlineGap);
  expect(px(style.borderTopLeftRadius), "renameRadius").toBe(size.renameRadius);

  // **반경 0 은 밑줄이 정본이 된 결과다.** 반경이 남아 있으면 선 끝이 말려 올라간다 — 제품
  // 두 벌이 정본을 얹지 않은 사유가 낱말 그대로 그것이었다. 네 모서리를 전부 잰다.
  expect(px(style.borderBottomLeftRadius)).toBe(0);
  expect(px(style.borderBottomRightRadius)).toBe(0);
  expect(px(style.borderTopRightRadius)).toBe(0);

  // **선 색은 리터럴이 아니라 토큰에서 온다.** 변수의 선언 문자열을 그대로 비교하면 아무것도
  // 검증하지 않으므로(그 문자열은 자기 자신이다) 같은 토큰을 물린 탐침의 **계산된** 색과 맞춘다 —
  // 둘이 같은 직렬화를 거치므로 이 대조는 "밑줄이 이 토큰에서 온다"를 실제로 말한다.
  const probe = document.createElement("span");
  probe.style.color = "var(--louis-color-stroke-underline)";
  // `<input>` 은 void 요소라 자식을 못 받는다. 형제로 붙여도 같은 트리에서 같은 변수를 본다.
  input.parentElement!.append(probe);
  expect(style.borderBottomColor).toBe(getComputedStyle(probe).color);
  probe.remove();
});
