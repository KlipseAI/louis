// 생성된 base CSS가 브라우저에서 규범대로 동작하는지 검증한다.
// 문자열 검사가 아니라 계산값과 실제 상호작용을 본다.
import { expect, test } from "vitest";
import { cdp, userEvent } from "vitest/browser";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

// vitest.config.ts가 project별로 주입한다. reduced-motion project에서만 true다.
declare const __LOUIS_REDUCED_MOTION__: boolean;

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

test("visually-hidden은 보이지 않지만 accessibility tree에 남는다", () => {
  const host = mount(`<button><span class="louis-visually-hidden">닫기</span></button>`);
  try {
    const label = host.querySelector(".louis-visually-hidden") as HTMLElement;
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

// DS-D-0074 — 포커스는 링도 번짐도 그리지 않는다. base.css 의 한 규칙이 LOUIS 클래스를 단 요소의
// outline 을 지우므로 브라우저 기본 링으로도 돌아가지 않는다. 강제 색에서만 Highlight 링이 선다.
async function setForcedColors(active: boolean): Promise<void> {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: active ? [{ name: "forced-colors", value: "active" }] : [],
  });
}

test("키보드 포커스에도 링과 번짐이 없다 — 브라우저 기본 링도 없다", async () => {
  const host = mount(
    `<button data-testid="before">before</button><button data-testid="target" class="louis-probe">target</button>`,
  );
  try {
    const target = host.querySelector('[data-testid="target"]') as HTMLElement;
    const restShadow = getComputedStyle(target).boxShadow;

    (host.querySelector('[data-testid="before"]') as HTMLElement).focus();
    await userEvent.tab();
    expect(target.matches(":focus-visible"), "키보드 포커스다").toBe(true);
    const style = getComputedStyle(target);
    expect(style.outlineStyle, "링 없음").toBe("none");
    expect(style.boxShadow, "번짐 없음").toBe(restShadow);
  } finally {
    host.remove();
  }
});

test("강제 색에서만 Highlight 링이 선다", async () => {
  const host = mount(
    `<button data-testid="before">before</button><button data-testid="target" class="louis-probe">target</button>`,
  );
  await setForcedColors(true);
  try {
    expect(matchMedia("(forced-colors: active)").matches).toBe(true);
    const target = host.querySelector('[data-testid="target"]') as HTMLElement;
    (host.querySelector('[data-testid="before"]') as HTMLElement).focus();
    await userEvent.tab();
    expect(target.matches(":focus-visible")).toBe(true);
    const style = getComputedStyle(target);
    expect(style.outlineStyle, "링이 선다").toBe("solid");
    const ring = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--louis-border-width-ring"),
    );
    expect(Number.parseFloat(style.outlineWidth), "두께가 border-width-ring").toBe(ring);
    const probe = document.createElement("div");
    probe.style.color = "Highlight";
    document.body.append(probe);
    const highlight = getComputedStyle(probe).color;
    probe.remove();
    expect(style.outlineColor, "시스템 색 Highlight").toBe(highlight);
  } finally {
    await setForcedColors(false);
    host.remove();
  }
});

// DS-D-0068 — 헤어라인 recipe 는 토큰을 조합한 값이라 var() 가 **선언한 요소에서** 풀리고 자손은
// 풀린 값을 상속한다. `:root` 에만 두면 중첩된 테마 스코프가 바깥 테마의 색을 물려받는다 — 제품 홈
// (`html[data-theme=dark] > main[data-theme=light]`)에서 라이트 면 위 헤어라인이 다크의 흰색 8% 로
// 칠해져 윤곽이 사라졌다. 색 토큰 자체는 tokens.css 가 테마 스코프마다 다시 선언하므로 멀쩡하다.
test("헤어라인 recipe 가 중첩된 테마 스코프의 색을 칠한다", () => {
  const RECIPES = [
    "--louis-hairline-inset",
    "--louis-hairline-inset-block-start",
    "--louis-hairline-inset-block-end",
  ];
  // 스코프 안에서 토큰이 푸는 색. box-shadow 의 색과 같은 직렬화로 비교하려고 계산값으로 읽는다.
  const strokeIn = (parent: Element): string => {
    const probe = document.createElement("div");
    probe.style.color = "var(--louis-color-stroke-hairline)";
    parent.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  };

  for (const [outer, inner] of [
    ["dark", "light"],
    ["light", "dark"],
  ] as const) {
    document.documentElement.setAttribute("data-theme", outer);
    const host = mount(`<main data-theme="${inner}"></main>`);
    try {
      const scope = host.querySelector("main") as HTMLElement;
      const want = strokeIn(scope);
      const outerStroke = strokeIn(document.body);
      // 두 테마의 헤어라인 색이 같으면 아래 단언이 무엇도 가르지 못한다. 먼저 고정한다.
      expect(want, `${outer} 안의 ${inner}: 두 테마의 헤어라인 색이 갈린다`).not.toBe(outerStroke);
      for (const name of RECIPES) {
        const probe = document.createElement("div");
        probe.style.boxShadow = `var(${name})`;
        scope.append(probe);
        const shadow = getComputedStyle(probe).boxShadow;
        expect(shadow, `${outer} 안의 ${inner}: ${name} 이 안쪽이다`).toContain("inset");
        expect(shadow, `${outer} 안의 ${inner}: ${name} 이 안쪽 테마의 색이다`).toContain(want);
        expect(shadow, `${outer} 안의 ${inner}: ${name} 이 바깥 테마의 색이 아니다`).not.toContain(
          outerStroke,
        );
      }
    } finally {
      host.remove();
      document.documentElement.removeAttribute("data-theme");
    }
  }
});

test("layer 유틸이 숫자가 아니라 layer 토큰을 쓴다", () => {
  const host = mount(
    `<div class="louis-layer-popover" data-testid="popover"></div><div class="louis-layer-modal" data-testid="modal"></div>`,
  );
  try {
    const root = getComputedStyle(document.documentElement);
    const popoverToken = root.getPropertyValue("--louis-layer-popover").trim();
    const modalToken = root.getPropertyValue("--louis-layer-modal").trim();
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
    `<div data-louis-state="closing" data-testid="closing"></div><div data-louis-state="closed" data-testid="closed"></div>`,
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
  const host = mount(`<div data-louis-state="opening" data-testid="opening">x</div>`);
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
    `<div data-louis-scroll-locked="true" data-testid="owner"></div><div data-testid="other"></div>`,
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
    `<div class="louis-overlay-panel" data-louis-state="closing" data-testid="panel"></div>`,
  );
  try {
    const panel = host.querySelector('[data-testid="panel"]') as HTMLElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // provider의 contextOptions가 실제로 media query를 매치시켰는지 먼저 고정한다.
    // 이 단언이 없으면 아래 분기가 어느 쪽으로 가든 통과해 아무것도 증명하지 못한다.
    expect(reduced).toBe(__LOUIS_REDUCED_MOTION__);
    const duration = getComputedStyle(panel).transitionDuration;
    const token = getComputedStyle(document.documentElement)
      .getPropertyValue("--louis-motion-reduced-duration")
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
