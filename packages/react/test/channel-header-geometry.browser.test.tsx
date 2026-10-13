// figma/components.measured.json 의 **channel-header · channel-header-description** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-13 DS-D-0087).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 variant 키 Loading/Layout)마다 클래스 마크업을 렌더하고
// 기록의 필드를 계산값과 맞댄다. `compact` 는 좁은 화면 단이라 375 뷰포트에서 잰다(560 · 480 두 단이 모두 걸린다).
// 대비 · 로딩 전후 높이는 channel-header.browser.test.tsx 가 소유하고, 이 파일은 계약이 거는 기하만 본다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

afterEach(async () => {
  await page.viewport(1440, 900);
});

type Sizes = Record<string, Record<string, unknown>>;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

function Header({ loading }: { readonly loading: boolean }): JSX.Element {
  if (loading) {
    return (
      <header className="louis-channel-header" aria-busy="true" data-testid="root">
        <div className="louis-skeleton louis-channel-header__banner" data-shape="block" aria-hidden="true" data-testid="banner" />
        <div className="louis-channel-header__profile" data-testid="profile">
          <div className="louis-skeleton louis-channel-header__avatar" data-shape="circle" aria-hidden="true" data-testid="avatar" />
          <div className="louis-channel-header__text" aria-hidden="true" data-testid="text">
            <div className="louis-channel-header__name" data-testid="name">
              <span className="louis-skeleton" data-shape="line" />
            </div>
            <div className="louis-channel-header__stats" data-testid="stats">
              <span className="louis-skeleton" data-shape="line" />
            </div>
            <div className="louis-channel-header__description" data-testid="description">
              <span className="louis-skeleton" data-shape="line" />
            </div>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="louis-channel-header" data-testid="root">
      <div className="louis-channel-header__banner" data-testid="banner">
        <img className="louis-channel-header__banner-image" src={PIXEL} alt="" />
      </div>
      <div className="louis-channel-header__profile" data-testid="profile">
        <span className="louis-avatar louis-channel-header__avatar" aria-hidden="true" data-testid="avatar">
          <img className="louis-avatar__image" src={PIXEL} alt="" />
        </span>
        <div className="louis-channel-header__text" data-testid="text">
          <h1 className="louis-channel-header__name" data-testid="name">채널 이름</h1>
          <p className="louis-channel-header__stats" data-testid="stats">
            <span>구독자 1.2천명</span>
          </p>
          <button type="button" className="louis-bare-button louis-channel-header__description" data-testid="description">
            채널 설명
          </button>
        </div>
      </div>
    </header>
  );
}

for (const [key, spec] of Object.entries(measured.components["channel-header"].sizes as Sizes)) {
  const [loading, layout] = key.split("/");
  test(`channel-header.${key}: 배치 · 아바타 · 이름 · 줄 높이가 기록과 같다`, async () => {
    const label = `channel-header.${key}`;
    await (layout === "compact" ? page.viewport(375, 812) : page.viewport(1440, 900));
    await render(<Header loading={loading === "true"} />);
    const root = getComputedStyle(find("root"));
    expect(px(root.rowGap), `${label}.gap`).toBe(num(spec, "gap", label));
    expect(px(root.paddingTop), `${label}.padding`).toBe(num(spec, "padding", label));
    expect(px(root.paddingLeft), `${label}.padding`).toBe(num(spec, "padding", label));
    expect(root.flexDirection, `${label}.direction`).toBe(spec["direction"]);
    expect(px(getComputedStyle(find("banner")).borderTopLeftRadius), `${label}.bannerRadius`).toBe(num(spec, "bannerRadius", label));
    const profile = getComputedStyle(find("profile"));
    expect(px(profile.columnGap), `${label}.profileGap`).toBe(num(spec, "profileGap", label));
    expect(profile.flexDirection, `${label}.profileDirection`).toBe(spec["profileDirection"]);
    const avatar = find("avatar").getBoundingClientRect();
    expect(avatar.width, `${label}.avatarSize`).toBe(num(spec, "avatarSize", label));
    expect(avatar.height, `${label}.avatarSize`).toBe(num(spec, "avatarSize", label));
    const text = getComputedStyle(find("text"));
    expect(px(text.rowGap), `${label}.textGap`).toBe(num(spec, "textGap", label));
    expect(text.flexDirection, `${label}.textDirection`).toBe(spec["textDirection"]);
    if (loading === "true") {
      expect(find("name").getBoundingClientRect().height, `${label}.nameLeading`).toBeCloseTo(num(spec, "nameLeading", label), 0);
      expect(find("stats").getBoundingClientRect().height, `${label}.statsLeading`).toBeCloseTo(num(spec, "statsLeading", label), 0);
      expect(find("description").getBoundingClientRect().height, `${label}.descriptionLeading`).toBeCloseTo(
        num(spec, "descriptionLeading", label),
        0,
      );
    } else {
      expect(px(getComputedStyle(find("name")).fontSize), `${label}.nameSize`).toBe(num(spec, "nameSize", label));
      expect(px(getComputedStyle(find("stats")).columnGap), `${label}.statsGap`).toBe(num(spec, "statsGap", label));
    }
  });
}

test("channel-header-description: 두 상태 칸의 높이 · 글자 크기가 기록과 같다", async () => {
  await page.viewport(1440, 900);
  await render(<Header loading={false} />);
  const node = find("description");
  for (const [key, spec] of Object.entries(measured.components["channel-header-description"].sizes as Sizes)) {
    const label = `channel-header-description.${key}`;
    // Hover 칸은 실제로 올린다 — 호버가 잉크만 바꾸고 상자를 건드리지 않는다는 것이 기록의 주장이다.
    if (key === "Hover") await userEvent.hover(node);
    expect(node.getBoundingClientRect().height, `${label}.height`).toBeCloseTo(num(spec, "height", label), 0);
    expect(px(getComputedStyle(node).fontSize), `${label}.fontSize`).toBe(num(spec, "fontSize", label));
  }
});
