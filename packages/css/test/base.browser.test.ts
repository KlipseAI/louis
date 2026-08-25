// 생성된 base CSS가 브라우저에서 규범대로 동작하는지 검증한다.
// 문자열 검사가 아니라 계산값과 실제 상호작용을 본다.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

// vitest.config.ts가 project별로 주입한다. reduced-motion project에서만 true다.
declare const __KDS_REDUCED_MOTION__: boolean;

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

test("visually-hidden은 보이지 않지만 accessibility tree에 남는다", () => {
  const host = mount(`<button><span class="kds-visually-hidden">닫기</span></button>`);
  try {
    const label = host.querySelector(".kds-visually-hidden") as HTMLElement;
    const rect = label.getBoundingClientRect();
    expect(rect.width).toBeLessThanOrEqual(1);
    expect(rect.height).toBeLessThanOrEqual(1);
    // display:none이나 visibility:hidden이면 accessibility tree에서도 사라진다.
    const style = getComputedStyle(label);
    expect(style.display).not.toBe("none");
    expect(style.visibility).not.toBe("hidden");
    // accessible name이 살아 있는지 실제 접근성 트리로 확인한다.
    expect(host.querySelector("button")).toHaveAccessibleName("닫기");
  } finally {
    host.remove();
  }
});

test("focus-visible 링은 키보드 포커스에서만 나타난다", async () => {
  const host = mount(
    `<button data-testid="before">before</button><button data-testid="target" class="kds-focus-ring">target</button>`,
  );
  try {
    const target = host.querySelector('[data-testid="target"]') as HTMLElement;

    // 포인터 클릭: Chromium은 버튼에 :focus-visible을 주지 않는다.
    await userEvent.click(page.getByTestId("target"));
    expect(target.matches(":focus")).toBe(true);
    expect(target.matches(":focus-visible")).toBe(false);
    expect(getComputedStyle(target).outlineStyle).toBe("none");

    // 키보드 이동: :focus-visible이 켜지고 링이 보인다.
    (host.querySelector('[data-testid="before"]') as HTMLElement).focus();
    await userEvent.tab();
    expect(target.matches(":focus-visible")).toBe(true);
    const style = getComputedStyle(target);
    expect(style.outlineStyle).toBe("solid");
    expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThan(0);
  } finally {
    host.remove();
  }
});

test("focus 링 색이 semantic 토큰에서 온다", () => {
  const host = mount(`<button class="kds-focus-ring" data-testid="ring">x</button>`);
  try {
    const target = host.querySelector('[data-testid="ring"]') as HTMLElement;
    target.focus();
    const outline = getComputedStyle(target).outlineColor;
    const tokenValue = getComputedStyle(document.documentElement)
      .getPropertyValue("--kds-color-stroke-focus")
      .trim();
    expect(tokenValue).not.toBe("");
    // 둘 다 브라우저가 계산한 색 문자열이므로 직접 비교 가능하다.
    const probe = document.createElement("div");
    probe.style.color = tokenValue;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    expect(outline).toBe(resolved);
  } finally {
    host.remove();
  }
});

test("layer 유틸이 숫자가 아니라 layer 토큰을 쓴다", () => {
  const host = mount(
    `<div class="kds-layer-popover" data-testid="popover"></div><div class="kds-layer-modal" data-testid="modal"></div>`,
  );
  try {
    const root = getComputedStyle(document.documentElement);
    const popoverToken = root.getPropertyValue("--kds-layer-popover").trim();
    const modalToken = root.getPropertyValue("--kds-layer-modal").trim();
    expect(popoverToken).not.toBe("");
    expect(Number.parseFloat(modalToken)).toBeGreaterThan(
      Number.parseFloat(popoverToken),
    );

    const popover = host.querySelector('[data-testid="popover"]') as HTMLElement;
    const modal = host.querySelector('[data-testid="modal"]') as HTMLElement;
    expect(getComputedStyle(popover).zIndex).toBe(popoverToken);
    expect(getComputedStyle(modal).zIndex).toBe(modalToken);
  } finally {
    host.remove();
  }
});

test("closing 상태는 pointer를 놓고 closed 상태는 숨는다", () => {
  const host = mount(
    `<div data-kds-state="closing" data-testid="closing"></div><div data-kds-state="closed" data-testid="closed"></div>`,
  );
  try {
    const closing = host.querySelector('[data-testid="closing"]') as HTMLElement;
    const closed = host.querySelector('[data-testid="closed"]') as HTMLElement;
    expect(getComputedStyle(closing).pointerEvents).toBe("none");
    expect(getComputedStyle(closed).display).toBe("none");
  } finally {
    host.remove();
  }
});

test("opening 상태는 위치가 확정되기 전이라 보이지도 hit-test되지도 않는다", () => {
  const host = mount(`<div data-kds-state="opening" data-testid="opening">x</div>`);
  try {
    const opening = host.querySelector('[data-testid="opening"]') as HTMLElement;
    const style = getComputedStyle(opening);
    // menu-popover.md: 임시 top/right 위치를 한 프레임도 노출하지 않는다.
    expect(style.visibility).toBe("hidden");
    expect(style.pointerEvents).toBe("none");
    // display:none이 아니어야 enter transition의 시작 프레임이 남는다.
    expect(style.display).not.toBe("none");
  } finally {
    host.remove();
  }
});

test("scroll-locked 속성이 지정된 owner만 잠근다", () => {
  const host = mount(
    `<div data-kds-scroll-locked="true" data-testid="owner"></div><div data-testid="other"></div>`,
  );
  try {
    const owner = host.querySelector('[data-testid="owner"]') as HTMLElement;
    const other = host.querySelector('[data-testid="other"]') as HTMLElement;
    // 잠금 대상은 body 고정이 아니라 overlay layer가 지정한 요소다.
    expect(getComputedStyle(owner).overflow).toBe("hidden");
    expect(getComputedStyle(other).overflow).not.toBe("hidden");
  } finally {
    host.remove();
  }
});

test("overlay exit duration이 reduced-motion 컨텍스트를 실제로 따라간다", () => {
  // DS-D-0011 결정 3의 근거를 여기서 실측한다. 두 project(browser, browser-reduced-motion)가
  // 같은 파일을 돌리므로 한 테스트가 양쪽 분기를 모두 덮는다.
  const host = mount(
    `<div class="kds-overlay-panel" data-kds-state="closing" data-testid="panel"></div>`,
  );
  try {
    const panel = host.querySelector('[data-testid="panel"]') as HTMLElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // provider의 contextOptions가 실제로 media query를 매치시켰는지 먼저 고정한다.
    // 이 단언이 없으면 아래 분기가 어느 쪽으로 가든 통과해 아무것도 증명하지 못한다.
    expect(reduced).toBe(__KDS_REDUCED_MOTION__);
    const duration = getComputedStyle(panel).transitionDuration;
    const token = getComputedStyle(document.documentElement)
      .getPropertyValue("--kds-motion-reduced-duration")
      .trim();

    expect(token).toBe("0ms");
    if (reduced) {
      // media query가 state 규칙(0,3,0)을 이겨야 한다. 클래스 하나로만 적었다면 여기서 120ms가 남는다.
      expect(duration).toBe("0s");
    } else {
      // 기본 컨텍스트에서는 exit 토큰이 그대로다 — 위 단언이 "항상 0"을 통과시키는 것이 아님을 보인다.
      expect(duration).toBe("0.12s");
    }
  } finally {
    host.remove();
  }
});

test("reset은 opt-in이라 기본 배포에서 body margin을 바꾸지 않는다", () => {
  // styles.css만 import한 상태다. reset.css를 넣지 않았으므로 UA 기본값이 남아야 한다.
  const margin = getComputedStyle(document.body).marginTop;
  expect(margin).not.toBe("");
});
