// design/components/app-shell-parts.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 제품 실측에서 **사이드바 항목에 포커스 표시가 아예 없다는 것**을 찾았다 — globals.css의
// `button:focus-visible { outline: none }`이 `@layer base` 밖에 있어 항목이 선언한 링 세 줄이
// 전부 사문이고, 앱 셸 소비처 25곳이 모두 `<button>` 분기를 탄다. 그래서 이 파일에서 가장 중요한
// 단언은 "포커스 링이 실제로 그려진다"와 "선택이 aria로 전달된다"이다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { AppTopBar, IconButton, SidebarNavItem, SidebarNavRow } from "@klipse-design/react";
import { IconHouse } from "@klipse-design/react/icons";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--louis-${id})`);
  document.body.append(probe);
  const value =
    property === "color" ? getComputedStyle(probe).color : getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

test("SidebarNavItem의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components["app-shell-parts"].sizes.navItem;
  await render(
    <div style={{ inlineSize: "280px" }}>
      <SidebarNavItem href="/archive" icon={<IconHouse />}>
        보관함
      </SidebarNavItem>
    </div>,
  );
  const item = find(".louis-sidebar-nav-item");
  const style = getComputedStyle(item);

  expect(round(item.getBoundingClientRect().height), "height").toBe(spec.height);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.columnGap), "gap").toBe(spec.gap);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(round(find(".louis-sidebar-nav-item__icon").getBoundingClientRect().width), "icon").toBe(
    spec.icon,
  );
});

test("포커스 링이 실제로 그려진다", async () => {
  // **제품에서 죽어 있던 축이다.** 전역 리셋이 항목의 링 선언을 특이도와 무관하게 이겼다.
  await render(
    <SidebarNavItem href="/archive" icon={<IconHouse />}>
      보관함
    </SidebarNavItem>,
  );
  const item = find(".louis-sidebar-nav-item");
  item.focus();

  const style = getComputedStyle(item);
  expect(document.activeElement, "포커스를 받는다").toBe(item);
  expect(style.outlineStyle, "링이 그려진다").toBe("solid");
  expect(px(style.outlineWidth), "링 두께").toBe(
    px(getComputedStyle(document.documentElement).getPropertyValue("--louis-border-width-ring")),
  );
  expect(style.outlineColor, "링 색").toBe(tokenValue("color-stroke-focus", "color"));
});

test("선택이 aria로 전달된다", async () => {
  // 시각 전용 속성을 따로 두면 화면에는 선택으로 보이는데 보조기술에는 아무것도 전달되지 않는다.
  const states = measured.components["app-shell-parts"].states.navItem;
  await render(
    <div>
      <SidebarNavItem href="/a" current data-testid="current">
        현재
      </SidebarNavItem>
      <SidebarNavItem href="/b" data-testid="other">
        다른 곳
      </SidebarNavItem>
    </div>,
  );
  const current = find('[data-testid="current"]');
  const other = find('[data-testid="other"]');

  expect(current.getAttribute("aria-current"), "현재 화면").toBe("page");
  expect(other.getAttribute("aria-current"), "나머지").toBeNull();

  // 면과 글자가 states 표와 같다.
  expect(getComputedStyle(current).backgroundColor, "Current background").toBe(
    tokenValue(states.Current.background, "background-color"),
  );
  expect(getComputedStyle(current).color, "Current foreground").toBe(
    tokenValue(states.Current.foreground, "color"),
  );
  expect(getComputedStyle(other).color, "Default foreground").toBe(
    tokenValue(states.Default.foreground, "color"),
  );
});

test("접혀도 라벨이 DOM에 남는다", async () => {
  // 지우면 접기/펴기마다 접근성 이름이 사라졌다 나타나고, 스크린 리더 사용자에게는 접힘이
  // 보이지 않는 상태 변화가 된다.
  const spec = measured.components["app-shell-parts"].sizes.navItemCollapsed;
  await render(
    <SidebarNavItem href="/archive" icon={<IconHouse />} trailing={<span>3</span>} collapsed>
      보관함
    </SidebarNavItem>,
  );
  const item = find(".louis-sidebar-nav-item");
  const label = find(".louis-sidebar-nav-item__label");

  expect(item.dataset.collapsed, "접힘 표시").toBe("true");
  expect(label.textContent, "라벨이 DOM에 있다").toBe("보관함");
  expect(item.textContent, "접근성 이름이 유지된다").toContain("보관함");
  // 시각에서만 숨는다 — display:none이 아니라 clip이다.
  expect(getComputedStyle(label).display, "display로 지우지 않는다").not.toBe("none");
  expect(round(label.getBoundingClientRect().width), "시각에서는 1px").toBe(1);

  expect(px(getComputedStyle(item).paddingInlineStart), "좌우 여백 0").toBe(spec.paddingInline);
  // trailing은 접힘에서 사라진다 — 자리가 없다.
  expect(getComputedStyle(find(".louis-sidebar-nav-item__trailing")).display).toBe("none");
});

test("목적지가 있으면 링크, 없으면 버튼이다", async () => {
  // 제품의 앱 셸 소비처 25곳이 전부 button 분기를 타 새 탭·링크 복사·미들클릭이 죽어 있다.
  await render(
    <div>
      <SidebarNavItem href="/archive">링크</SidebarNavItem>
      <SidebarNavItem onClick={() => {}}>버튼</SidebarNavItem>
    </div>,
  );
  const items = [...document.querySelectorAll(".louis-sidebar-nav-item")];
  expect(items.map((node) => node.tagName)).toEqual(["A", "BUTTON"]);
  expect(items[0]?.getAttribute("href")).toBe("/archive");
  expect(items[1]?.getAttribute("type")).toBe("button");
});

test("아이콘은 보조기술에서 숨는다", async () => {
  await render(
    <SidebarNavItem href="/a" icon={<IconHouse />}>
      보관함
    </SidebarNavItem>,
  );
  expect(find(".louis-sidebar-nav-item__icon").getAttribute("aria-hidden")).toBe("true");
});

test("복합 행은 버튼 안에 버튼을 넣지 않는다", async () => {
  await render(
    <div data-louis-fixture style={{ inlineSize: "280px" }}>
      <SidebarNavRow action={<IconButton size="sm" variant="ghost" label="새로 만들기"><span /></IconButton>}>
        <SidebarNavItem href="/highlight">하이라이트</SidebarNavItem>
      </SidebarNavRow>
    </div>,
  );
  const row = find(".louis-sidebar-nav-row");
  // 배포본도 같은 이유로 행을 div로 두고 내비와 액션을 형제로 놓는다.
  expect(row.tagName).toBe("DIV");
  expect(row.querySelectorAll("button button")).toHaveLength(0);
  expect(row.querySelectorAll("a button")).toHaveLength(0);
  // 두 목적지가 각자 tab stop을 갖는다.
  expect(row.querySelector("a")).not.toBeNull();
  expect(row.querySelector("button")).not.toBeNull();
});

test("접히면 보조 액션이 사라진다 — 아이콘 하나 자리에 둘이 들어갈 수 없다", async () => {
  await render(
    <div data-louis-fixture style={{ inlineSize: "72px" }}>
      <SidebarNavRow collapsed action={<IconButton size="sm" variant="ghost" label="새로 만들기"><span /></IconButton>}>
        <SidebarNavItem href="/highlight" collapsed>
          하이라이트
        </SidebarNavItem>
      </SidebarNavRow>
    </div>,
  );
  const row = find(".louis-sidebar-nav-row");
  expect(row.querySelector(".louis-sidebar-nav-row__action")).toBeNull();
  expect(row.querySelector(".louis-sidebar-nav-item")).not.toBeNull();
});

test("AppTopBar의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components["app-shell-parts"].sizes.topBar;
  await render(<AppTopBar title="보관함" />);
  const bar = find(".louis-app-top-bar");
  const style = getComputedStyle(bar);

  expect(round(bar.getBoundingClientRect().height), "height").toBe(spec.height);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.columnGap), "gap").toBe(spec.gap);
  expect(px(style.borderBottomWidth), "경계선은 기본이 아니다").toBe(spec.borderWidth);
});

test("AppTopBar의 제목이 남는 자리를 먹고 한 줄로 잘린다", async () => {
  await render(
    <div style={{ inlineSize: "320px" }}>
      <AppTopBar
        leading={<button type="button">토글</button>}
        title="아주 긴 페이지 제목이 들어온 경우에도 한 줄로 잘린다"
        trailing={<button type="button">프로필</button>}
      />
    </div>,
  );
  const title = find(".louis-app-top-bar__title");
  const style = getComputedStyle(title);
  expect(style.whiteSpace, "줄바꿈하지 않는다").toBe("nowrap");
  expect(style.textOverflow, "말줄임").toBe("ellipsis");
  // 양옆 슬롯이 자기 크기를 갖고 제목이 나머지를 쓴다.
  const bar = find(".louis-app-top-bar").getBoundingClientRect();
  const leading = find(".louis-app-top-bar__leading").getBoundingClientRect();
  const trailing = find(".louis-app-top-bar__trailing").getBoundingClientRect();
  expect(title.getBoundingClientRect().width, "남는 자리를 먹는다").toBeGreaterThan(0);
  expect(leading.width + trailing.width, "슬롯이 자기 크기를 갖는다").toBeLessThan(bar.width);
});

test("divider는 켤 때만 그려진다", async () => {
  // 제품의 경계선은 스크롤 진행률에 따라 색이 변하는 런타임 계약이라 컴포넌트가 소유할 수 없다.
  await render(
    <div>
      <AppTopBar title="꺼짐" data-testid="off" />
      <AppTopBar title="켜짐" divider data-testid="on" />
    </div>,
  );
  // divider는 방향성 inset box-shadow다 (DS-D-0023) — border-block-end가 아니다.
  const off = getComputedStyle(find('[data-testid="off"]'));
  const on = getComputedStyle(find('[data-testid="on"]'));
  expect(px(off.borderBottomWidth), "꺼짐: border 없음").toBe(0);
  expect(off.boxShadow, "꺼짐: divider 없음").toBe("none");
  expect(px(on.borderBottomWidth), "켜짐: border 아님").toBe(0);
  expect(on.boxShadow, "켜짐: inset divider").toContain("inset");
});

test("layer-sticky 유틸리티가 토큰에서 온다", async () => {
  // 토큰은 있는데 쓸 클래스가 없어 셸을 짓는 사람이 숫자를 쓰게 되어 있었다 (DS-D-0018).
  await render(<div className="louis-layer-sticky">rail</div>);
  const node = find(".louis-layer-sticky");
  expect(getComputedStyle(node).zIndex).toBe(
    getComputedStyle(document.documentElement).getPropertyValue("--louis-layer-sticky").trim(),
  );
});

export type _EnsureTsx = JSX.Element;
