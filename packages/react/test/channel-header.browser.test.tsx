// Channel Header(`.louis-channel-header`)의 레시피가 실제로 그 배치 · 좁은 화면 단 · 로딩 전후 높이를 만드는지 잰다(DS-D-0087).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/channel-header.css 이고 마크업은
// design/components/channel-header.md 의 예시 그대로다. 뷰포트 단(560 · 480)이 뷰포트 질의라 시험이 뷰포트를 스스로 정한다.
// 대비는 토큰 값으로 손 계산하지 않고 계산 색을 `bg-surface` 바탕 위에서 잰다(fixtures/contrast).
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, parseColor, px, textContrast, tokenColor } from "./fixtures/contrast";

afterEach(async () => {
  document.documentElement.removeAttribute("data-theme");
  await page.viewport(1440, 900);
});

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const LONG = "채널 설명 원문이 아주 길게 이어집니다. ".repeat(12);

interface HeaderProps {
  readonly banner?: boolean;
  readonly description?: boolean;
  /** 수치 항목 수. 375 의 글 칸(약 230)에는 셋이 한 줄에 들지 않아 항목째 둘째 줄로 간다 — 그때 높이가 줄 하나(21 + 2)만큼 다른 것은 내용이다. */
  readonly stats?: 2 | 3;
}

/** 문서 예시의 불러온 판 — 유튜브(띠 · 설명 · 액션). */
function Loaded({ banner = true, description = true, stats = 3 }: HeaderProps): JSX.Element {
  return (
    <div style={{ background: "var(--louis-color-bg-surface)", padding: 16 }} data-testid="surface">
      <header className="louis-channel-header" data-testid="root">
        {banner ? (
          <div className="louis-channel-header__banner" data-testid="banner">
            <img className="louis-channel-header__banner-image" src={PIXEL} alt="" />
          </div>
        ) : null}
        <div className="louis-channel-header__profile" data-testid="profile">
          <span className="louis-avatar louis-channel-header__avatar" aria-hidden="true" data-testid="avatar">
            <img className="louis-avatar__image" src={PIXEL} alt="" />
          </span>
          <div className="louis-channel-header__text" data-testid="text">
            <h1 className="louis-channel-header__name" data-testid="name">채널 이름</h1>
            <p className="louis-channel-header__stats" data-testid="stats">
              <span data-testid="stat1">
                구독자 1.2천명<span className="louis-visually-hidden">, </span>
              </span>
              <span data-testid="stat2">
                동영상 48개{stats === 3 ? <span className="louis-visually-hidden">, </span> : null}
              </span>
              {stats === 3 ? <span data-testid="stat3">조회수 3.4만회</span> : null}
            </p>
            {description ? (
              <button
                type="button"
                className="louis-bare-button louis-channel-header__description"
                aria-haspopup="dialog"
                title="채널 정보"
                data-testid="description"
              >
                {LONG}
              </button>
            ) : null}
          </div>
          <div className="louis-channel-header__actions" data-testid="actions">
            <button type="button" className="louis-icon-button" data-variant="ghost" aria-label="더보기">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

/** 문서 예시의 로딩 판 — 띠 · 설명 자리를 미리 잡는다. 액션 슬롯은 불러온 판과 같게 둔다(높이 비교를 위해). */
function Loading({ banner = true, description = true }: HeaderProps): JSX.Element {
  return (
    <div style={{ background: "var(--louis-color-bg-surface)", padding: 16 }}>
      <header className="louis-channel-header" aria-busy="true" data-testid="root">
        {banner ? (
          <div className="louis-skeleton louis-channel-header__banner" data-shape="block" aria-hidden="true" data-testid="banner" />
        ) : null}
        <div className="louis-channel-header__profile" data-testid="profile">
          <div className="louis-skeleton louis-channel-header__avatar" data-shape="circle" aria-hidden="true" data-testid="avatar" />
          <div className="louis-channel-header__text" aria-hidden="true" data-testid="text">
            <div className="louis-channel-header__name" data-testid="name">
              <span className="louis-skeleton" data-shape="line" data-testid="bar-name" />
            </div>
            <div className="louis-channel-header__stats" data-testid="stats">
              <span className="louis-skeleton" data-shape="line" data-testid="bar-stats" />
            </div>
            {description ? (
              <div className="louis-channel-header__description" data-testid="description">
                <span className="louis-skeleton" data-shape="line" data-testid="bar-description" />
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </div>
  );
}

const rect = (id: string): DOMRect => find(id).getBoundingClientRect();

for (const [width, ratio, avatar] of [
  [1440, 6, 64],
  [561, 6, 64],
  [560, 4, 48],
  [375, 4, 48],
] as const) {
  test(`${width} — 띠 ${ratio}:1 · 반경 12, 아바타 ${avatar}, 로딩 판도 같다`, async () => {
    await page.viewport(width, 900);
    const loaded = await render(<Loaded />);
    const banner = rect("banner");
    expect(banner.width / banner.height).toBeCloseTo(ratio, 1);
    expect(px(getComputedStyle(find("banner")).borderTopLeftRadius)).toBe(12);
    expect(rect("avatar").width).toBe(avatar);
    expect(rect("avatar").height).toBe(avatar);
    await loaded.unmount();

    await render(<Loading />);
    const skeleton = rect("banner");
    expect(skeleton.width / skeleton.height).toBeCloseTo(ratio, 1);
    // block 의 16 이 아니라 띠의 12.
    expect(px(getComputedStyle(find("banner")).borderTopLeftRadius)).toBe(12);
    expect(rect("avatar").width).toBe(avatar);
    expect(rect("avatar").height).toBe(avatar);
    expect(px(getComputedStyle(find("avatar")).borderTopLeftRadius)).toBeGreaterThanOrEqual(avatar / 2);
  });
}

test("간격 — 띠 → 줄 16 · 줄 안 16 · 글 칸 4 · 수치 사이 12 · 넘친 수치 줄 사이 2 · 가운데 정렬", async () => {
  await render(<Loaded />);
  expect(rect("profile").top - rect("banner").bottom).toBe(16);
  expect(rect("text").left - rect("avatar").right).toBe(16);
  expect(rect("actions").left - rect("text").right).toBe(16);
  expect(rect("stats").top - rect("name").bottom).toBeCloseTo(4, 1);
  expect(rect("description").top - rect("stats").bottom).toBeCloseTo(4, 1);
  expect(rect("stat2").left - rect("stat1").right).toBeCloseTo(12, 0);
  // 가운데 정렬 — 아바타 중심 = 줄 중심.
  const profile = rect("profile");
  const avatar = rect("avatar");
  expect(avatar.top + avatar.height / 2).toBeCloseTo(profile.top + profile.height / 2, 0);
  // 액션은 줄 끝.
  expect(rect("actions").right).toBeCloseTo(profile.right, 0);
  // 바깥 여백이 없다.
  const root = getComputedStyle(find("root"));
  expect(root.paddingTop).toBe("0px");
  expect(root.paddingLeft).toBe("0px");
  expect(root.marginBottom).toBe("0px");

  // 좁은 열 — 항목째 다음 줄로 간다. 줄 사이 2.
  find("stats").style.inlineSize = "120px";
  const first = rect("stat1");
  const second = rect("stat2");
  expect(second.top - first.bottom).toBeCloseTo(2, 0);
  expect(second.left).toBeCloseTo(first.left, 0);
});

test("글자 — 이름 heading-sm medium 28 / 37.8 한 줄 말줄임, 수치 · 설명 body-sm 14 / 21, 설명은 375 에서도 한 줄", async () => {
  await render(<Loaded />);
  const name = getComputedStyle(find("name"));
  expect(name.fontSize).toBe("28px");
  expect(px(name.lineHeight)).toBeCloseTo(37.8, 1);
  expect(name.fontWeight).toBe("500");
  expect(name.whiteSpace).toBe("nowrap");
  expect(name.textOverflow).toBe("ellipsis");
  expect(getComputedStyle(find("stats")).fontSize).toBe("14px");
  expect(rect("description").height).toBeCloseTo(21, 0);

  await page.viewport(375, 812);
  expect(rect("description").height).toBeCloseTo(21, 0);
  expect(find("description").scrollHeight).toBeGreaterThan(rect("description").height);
});

for (const [width, size, leading] of [
  [481, 28, 37.8],
  [480, 20, 30],
  [375, 20, 30],
] as const) {
  test(`${width} — 이름 ${size} / ${leading}`, async () => {
    await page.viewport(width, 900);
    await render(<Loaded />);
    const name = getComputedStyle(find("name"));
    expect(px(name.fontSize)).toBe(size);
    expect(px(name.lineHeight)).toBeCloseTo(leading, 1);
    expect(rect("name").height).toBeCloseTo(leading, 0);
  });
}

for (const width of [1440, 560, 480, 375] as const) {
  for (const variant of [
    { banner: true, description: true },
    { banner: false, description: false },
  ]) {
    test(`${width} · 띠 ${variant.banner ? "있음" : "없음"} — 로딩 전후 머리 높이가 같다`, async () => {
      await page.viewport(width, 900);
      // 375 에서는 수치 둘 — 한 줄에 드는 내용으로 잰다(셋이면 항목째 줄바꿈이 한 줄을 더한다).
      const loaded = await render(<Loaded {...variant} stats={width === 375 ? 2 : 3} />);
      expect(rect("stats").height).toBeCloseTo(21, 0);
      const before = rect("root").height;
      const text = rect("text").height;
      await loaded.unmount();
      await render(<Loading {...variant} />);
      expect(rect("root").height).toBeCloseTo(before, 1);
      expect(rect("text").height).toBeCloseTo(text, 1);
    });
  }
}

test("로딩 — 막대는 줄 안의 line(0.75em), 폭 180 · 260 · 360, 잉크는 fg-primary 로 고정", async () => {
  await render(<Loading />);
  expect(rect("bar-name").height).toBeCloseTo(21, 1);
  expect(rect("bar-stats").height).toBeCloseTo(10.5, 1);
  expect(rect("bar-description").height).toBeCloseTo(10.5, 1);
  expect(rect("bar-name").width).toBe(180);
  expect(rect("bar-stats").width).toBe(260);
  expect(rect("bar-description").width).toBe(360);
  // 줄 상자 높이는 그 줄의 행간.
  expect(rect("name").height).toBeCloseTo(37.8, 0);
  expect(rect("stats").height).toBeCloseTo(21, 0);
  expect(rect("description").height).toBeCloseTo(21, 0);
  // 막대가 줄 가운데에 선다(vertical-align middle — x 높이 반만큼 위라 1px 안).
  const line = rect("stats");
  const bar = rect("bar-stats");
  expect(Math.abs(bar.top + bar.height / 2 - (line.top + line.height / 2))).toBeLessThan(2);
  const primary = tokenColor("color-fg-primary");
  for (const id of ["bar-name", "bar-stats", "bar-description", "avatar", "banner"]) {
    expect(getComputedStyle(find(id)).color, id).toBe(primary);
  }
  expect(find("root").getAttribute("aria-busy")).toBe("true");
});

test("설명 호버 — 3단 잉크에서 1단 잉크로(호버 기기)", async () => {
  await render(<Loaded />);
  const description = find("description");
  expect(getComputedStyle(description).color).toBe(tokenColor("color-fg-tertiary"));
  await userEvent.hover(description);
  await expect.poll(() => getComputedStyle(description).color).toBe(tokenColor("color-fg-primary"));
  await userEvent.unhover(description);
});

test("띠 면(그림 전) — bg-inset, 스켈레톤이 아닐 때만", async () => {
  await render(<Loaded />);
  expect(getComputedStyle(find("banner")).backgroundColor).toBe(tokenColor("color-bg-inset", "backgroundColor"));
});

const measuredContrast: Record<string, Record<string, number>> = {};

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 이름 · 수치 · 설명 · 설명 호버의 글자 대비를 bg-surface 위에서 잰다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Loaded />);
    const name = textContrast(find("name"));
    const stats = textContrast(find("stats"));
    const description = textContrast(find("description"));
    await userEvent.hover(find("description"));
    await expect.poll(() => getComputedStyle(find("description")).color).toBe(tokenColor("color-fg-primary"));
    const hover = textContrast(find("description"));
    await userEvent.unhover(find("description"));
    for (const [label, value] of Object.entries({ name, stats, description, hover })) {
      expect(value, label).toBeGreaterThanOrEqual(4.5);
    }
    // 바탕이 실제로 bg-surface 다.
    expect(parseColor(getComputedStyle(find("surface")).backgroundColor)).toEqual(
      parseColor(tokenColor("color-bg-surface", "backgroundColor")),
    );
    measuredContrast[theme] = { name, stats, description, hover };
    // 문서 Accessibility 의 기록값.
    const recorded = theme === "light" ? { name: 16.54, stats: 6.44 } : { name: 16.54, stats: 5.25 };
    expect(name).toBeCloseTo(recorded.name, 1);
    expect(stats).toBeCloseTo(recorded.stats, 1);
    expect(description).toBeCloseTo(stats, 2);
    expect(hover).toBeCloseTo(name, 2);
  });
}
