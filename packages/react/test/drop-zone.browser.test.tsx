// design/components/drop-zone.md 의 Acceptance tests 를 실제 브라우저에서 검증한다.
//
// 제품에 공용 구현이 없다. 기하는 하이라이트 업로드 면(`highlightSceneStyles.ts uploadDropZone`)에서 옮겼고,
// 끌어다 놓기 · 포커스 링은 이 컴포넌트가 더한 계약이라 이 파일이 고정한다.
import type { JSX } from "react";
import axe from "axe-core";
import { expect, test, vi } from "vitest";
import { cdp, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DropZone } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

// DS-D-0074 — 강제 색(Windows 고대비)을 CDP 로 흉내 낸다. 포커스 링은 그 모드에서만 선다.
async function setForcedColors(active: boolean): Promise<void> {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: active ? [{ name: "forced-colors", value: "active" }] : [],
  });
}

const px = (value: string): number => Number.parseFloat(value);
const spec = measured.components["drop-zone"].sizes.base;
const states = measured.components["drop-zone"].states.base;

// **마지막으로 렌더된 무리만 본다.** 앞 테스트가 남긴 DOM 이 있으면 첫 요소가 다른 렌더를 가리킨다.
function scope(): ParentNode {
  const groups = document.querySelectorAll("[data-louis-fixture]");
  return groups.length > 0 ? groups[groups.length - 1]! : document;
}
function find<T extends HTMLElement = HTMLElement>(selector: string): T {
  const node = scope().querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as T;
}
const zone = (): HTMLButtonElement => find<HTMLButtonElement>(".louis-drop-zone");
const input = (): HTMLInputElement => find<HTMLInputElement>(".louis-drop-zone__input");

function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--louis-${id})`);
  document.body.append(probe);
  const value = property === "color" ? getComputedStyle(probe).color : getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

const video = (name: string): File => new File(["x"], name, { type: "video/mp4" });
function drag(type: "dragenter" | "dragover" | "dragleave" | "drop", target: Element, files: readonly File[] = []): void {
  const data = new DataTransfer();
  for (const file of files) data.items.add(file);
  target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }));
}

const Fixture = (props: Partial<Parameters<typeof DropZone>[0]>): JSX.Element => (
  <div data-louis-fixture style={{ inlineSize: 640 }}>
    <DropZone
      prompt="긴 영상을 올리세요."
      caption="올린 원본은 30일 동안 보관합니다."
      accept="video/*"
      onFiles={() => {}}
      {...props}
    />
  </div>
);

test("DropZone 의 구조값이 components.measured.json 과 같다", async () => {
  await render(<Fixture graphic={<svg viewBox="0 0 10 10" />} />);
  const style = getComputedStyle(zone());
  expect(px(style.paddingTop), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingBottom), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingLeft), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.rowGap), "gap").toBe(spec.gap);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(px(style.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
  expect(find(".louis-drop-zone__graphic").offsetWidth, "graphic").toBe(spec.graphic);
  const prompt = getComputedStyle(find(".louis-drop-zone__prompt"));
  expect(px(prompt.fontSize), "promptFontSize").toBe(spec.promptFontSize);
  expect(px(prompt.lineHeight), "promptLineHeight").toBe(spec.promptLineHeight);
  const caption = getComputedStyle(find(".louis-drop-zone__caption"));
  expect(px(caption.fontSize), "captionFontSize").toBe(spec.captionFontSize);
  expect(px(caption.lineHeight), "captionLineHeight").toBe(spec.captionLineHeight);
});

test("states 표가 코드와 같다", async () => {
  await render(<Fixture />);
  await userEvent.unhover(zone());
  expect(getComputedStyle(zone()).backgroundColor, "Default background").toBe(tokenValue(states.Default.background, "background-color"));
  expect(getComputedStyle(zone()).color, "Default foreground").toBe(tokenValue(states.Default.foreground, "color"));
  expect(getComputedStyle(find(".louis-drop-zone__caption")).color, "caption").toBe(tokenValue(states.Default.caption, "color"));
  await userEvent.hover(zone());
  // 면 색은 hover 전이(control-hover)를 거친다 — 끝난 값을 본다.
  await expect.poll(() => getComputedStyle(zone()).backgroundColor, { timeout: 2000 }).toBe(tokenValue(states.Hover.background, "background-color"));
  await userEvent.unhover(zone());
});

test("누르면 숨긴 파일 입력을 연다", async () => {
  await render(<Fixture />);
  const opened = vi.fn((event: Event) => event.preventDefault());
  input().addEventListener("click", opened);
  await userEvent.click(zone());
  expect(opened, "파일 입력 click").toHaveBeenCalledTimes(1);
  expect(input().hidden, "입력은 보이지 않는다").toBe(true);
  expect(input().accept, "accept 를 넘긴다").toBe("video/*");
});

test("선택 창에서 고른 파일을 onFiles 로 준다", async () => {
  const onFiles = vi.fn();
  await render(<Fixture onFiles={onFiles} />);
  const data = new DataTransfer();
  data.items.add(video("a.mp4"));
  input().files = data.files;
  input().dispatchEvent(new Event("change", { bubbles: true }));
  expect(onFiles).toHaveBeenCalledTimes(1);
  expect(onFiles.mock.calls[0]![0].map((file: File) => file.name)).toEqual(["a.mp4"]);
});

test("끌어다 놓은 파일을 onFiles 로 주고, 끄는 동안만 drag-over 상태다", async () => {
  const onFiles = vi.fn();
  await render(<Fixture onFiles={onFiles} />);
  expect(zone().dataset.dragOver, "처음").toBe("false");
  drag("dragenter", zone(), [video("a.mp4")]);
  await expect.poll(() => zone().dataset.dragOver, { timeout: 1000 }).toBe("true");
  // 안내 글자(자식)를 지나며 쌍으로 오는 enter · leave 에 깜빡이지 않는다.
  drag("dragenter", find(".louis-drop-zone__prompt"), [video("a.mp4")]);
  drag("dragleave", zone());
  await expect.poll(() => zone().dataset.dragOver, { timeout: 1000 }).toBe("true");
  await expect.poll(() => getComputedStyle(zone()).backgroundColor, { timeout: 2000 }).toBe(tokenValue(states.DragOver.background, "background-color"));
  drag("drop", zone(), [video("a.mp4"), video("b.mp4")]);
  await expect.poll(() => zone().dataset.dragOver, { timeout: 1000 }).toBe("false");
  // 여러 파일을 받지 않으면 첫 파일만 준다.
  expect(onFiles.mock.calls[0]![0].map((file: File) => file.name)).toEqual(["a.mp4"]);
});

test("multiple 이면 놓은 파일을 모두 준다", async () => {
  const onFiles = vi.fn();
  await render(<Fixture onFiles={onFiles} multiple />);
  drag("dragenter", zone(), [video("a.mp4"), video("b.mp4")]);
  drag("drop", zone(), [video("a.mp4"), video("b.mp4")]);
  expect(onFiles.mock.calls[0]![0].map((file: File) => file.name)).toEqual(["a.mp4", "b.mp4"]);
  expect(input().multiple, "입력도 multiple").toBe(true);
});

test("disabled 이면 누름도 놓기도 받지 않고 그렇게 보인다", async () => {
  const onFiles = vi.fn();
  await render(<Fixture onFiles={onFiles} disabled />);
  drag("dragenter", zone(), [video("a.mp4")]);
  drag("drop", zone(), [video("a.mp4")]);
  expect(onFiles, "놓기를 받지 않는다").not.toHaveBeenCalled();
  expect(zone().disabled, "버튼이 disabled").toBe(true);
  expect(zone().dataset.dragOver, "상태도 바뀌지 않는다").toBe("false");
  expect(getComputedStyle(zone()).backgroundColor, "Disabled background").toBe(tokenValue(states.Disabled.background, "background-color"));
  expect(getComputedStyle(zone()).color, "Disabled foreground").toBe(tokenValue(states.Disabled.foreground, "color"));
});

test("키보드 포커스에 링이 없고 강제 색에서만 선다", async () => {
  await render(<Fixture />);
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement, "면이 포커스를 받는다").toBe(zone());
  // DS-D-0074 — 포커스 링을 그리지 않는다. 끌어다 놓기의 안쪽 테두리는 포커스가 아니므로 여기서도 없다.
  expect(getComputedStyle(zone()).outlineStyle, "링 없음").toBe("none");
  expect(getComputedStyle(zone()).boxShadow, "포커스는 안쪽 테두리를 켜지 않는다").toBe("none");
  await setForcedColors(true);
  try {
    const style = getComputedStyle(zone());
    expect(style.outlineStyle, "강제 색에서 링이 그려진다").toBe("solid");
    expect(px(style.outlineWidth), "링 두께").toBeGreaterThan(0);
  } finally {
    await setForcedColors(false);
  }
});

test("글리프는 장식이고, 안내 문구가 접근성 이름이 된다", async () => {
  await render(<Fixture graphic={<svg viewBox="0 0 10 10" />} />);
  expect(find(".louis-drop-zone__graphic").getAttribute("aria-hidden"), "글리프 숨김").toBe("true");
  expect(zone().textContent, "이름").toContain("긴 영상을 올리세요.");
  expect(zone().type, "form 을 제출하지 않는다").toBe("button");
});

test("접근성 위반이 없다", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  try {
    await render(
      <div data-louis-fixture>
        <DropZone prompt="긴 영상을 올리세요." caption="올린 원본은 30일 동안 보관합니다." onFiles={() => {}} graphic={<svg viewBox="0 0 10 10" />} />
        <DropZone prompt="파일을 올리세요." onFiles={() => {}} disabled />
      </div>,
      { container: host },
    );
    const results = await axe.run(host, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] } });
    expect(results.violations.map((v) => v.id).sort(), "접근성 위반").toEqual([]);
  } finally {
    host.remove();
  }
});

export type _EnsureTsx = JSX.Element;

// 미디어 무대 `media`(2026-10-13, DS-D-0084). React prop 이 없어 레시피 속성 `data-surface="media"` 를 루트에 직접 건다 — 컴포넌트가
// 나머지 속성을 루트 `<button>` 에 그대로 넘기므로 소비처가 거는 마크업과 같다. 기록 `media` 칸을 레시피가 여전히 만드는지 잰다.
test("DropZone media 의 구조값이 components.measured.json 과 같다", async () => {
  const media = measured.components["drop-zone"].sizes.media;
  await render(<Fixture data-surface="media" graphic={<svg viewBox="0 0 10 10" />} />);
  const style = getComputedStyle(zone());
  expect(zone().getAttribute("data-surface"), "속성이 루트에 선다").toBe("media");
  expect(px(style.paddingTop), "paddingBlock").toBe(media.paddingBlock);
  expect(px(style.paddingBottom), "paddingBlock").toBe(media.paddingBlock);
  expect(px(style.paddingLeft), "paddingInline").toBe(media.paddingInline);
  expect(px(style.paddingRight), "paddingInline").toBe(media.paddingInline);
  expect(px(style.rowGap), "gap").toBe(media.gap);
  expect(px(style.borderTopLeftRadius), "radius").toBe(media.radius);
  expect(px(style.borderTopWidth), "borderWidth").toBe(media.borderWidth);
  expect(find(".louis-drop-zone__graphic").offsetWidth, "graphic").toBe(media.graphic);
  const prompt = getComputedStyle(find(".louis-drop-zone__prompt"));
  expect(px(prompt.fontSize), "promptFontSize").toBe(media.promptFontSize);
  expect(px(prompt.lineHeight), "promptLineHeight").toBe(media.promptLineHeight);
  const caption = getComputedStyle(find(".louis-drop-zone__caption"));
  expect(px(caption.fontSize), "captionFontSize").toBe(media.captionFontSize);
  expect(px(caption.lineHeight), "captionLineHeight").toBe(media.captionLineHeight);
});
