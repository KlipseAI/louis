// 생성된 token CSS가 실제 브라우저에서 theme 계약대로 동작하는지 검증한다.
// 기존 게이트는 CSS "문자열"을 검사한다. 이 테스트는 브라우저가 해석한 "계산값"을 검사하므로
// selector 우선순위나 color() 표기 지원 같은 실제 실패를 잡는다.
import { expect, test } from "vitest";
import tokens from "../generated/tokens.json" with { type: "json" };
import "../generated/tokens.css";

type ResolvedColor = {
  readonly colorSpace: string;
  readonly components: readonly number[];
  readonly alpha?: number;
};

type PublicToken = {
  readonly id: string;
  readonly mode: string;
  readonly type: string;
  readonly value: unknown;
};

const publicTokens = tokens as unknown as {
  readonly modes: Readonly<Record<string, Readonly<Record<string, PublicToken>>>>;
};

function themeTokens(mode: "light" | "dark"): readonly PublicToken[] {
  return Object.values(publicTokens.modes[mode] ?? {});
}

function withTheme<T>(theme: "light" | "dark", run: (root: HTMLElement) => T): T {
  const previous = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", theme);
  try {
    return run(document.documentElement);
  } finally {
    if (previous === null) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", previous);
  }
}

function readVariable(root: HTMLElement, id: string): string {
  return getComputedStyle(root).getPropertyValue(`--louis-${id}`).trim();
}

function parseSrgb(value: string): readonly number[] | null {
  const match = /color\(srgb\s+([^)]+)\)/.exec(value);
  if (match?.[1] === undefined) return null;
  return match[1]
    .split(/[\s/]+/)
    .map((part) => Number.parseFloat(part))
    .filter((part) => !Number.isNaN(part));
}

test("theme 의존 color 토큰이 브라우저에서 모두 계산값을 갖는다", () => {
  const light = themeTokens("light");
  expect(light.length).toBeGreaterThan(0);

  for (const theme of ["light", "dark"] as const) {
    withTheme(theme, (root) => {
      for (const token of themeTokens(theme)) {
        const computed = readVariable(root, token.id);
        expect(computed, `${token.id}@${theme}이 비어 있습니다`).not.toBe("");
      }
    });
  }
});

test("light와 dark의 계산값이 실제로 다르다", () => {
  const lightValues = withTheme("light", (root) =>
    themeTokens("light").map((token) => [token.id, readVariable(root, token.id)] as const),
  );
  const darkValues = withTheme("dark", (root) =>
    Object.fromEntries(themeTokens("dark").map((token) => [token.id, readVariable(root, token.id)])),
  );

  const differing = lightValues.filter(([id, value]) => darkValues[id] !== value);
  // 모든 토큰이 달라야 하는 것은 아니다(brand 계열은 양 모드 동일). 다만 대다수는 달라야 한다.
  expect(differing.length).toBeGreaterThan(lightValues.length / 2);
});

test("계산값이 token source의 resolved value와 일치한다", () => {
  for (const theme of ["light", "dark"] as const) {
    withTheme(theme, (root) => {
      for (const token of themeTokens(theme)) {
        if (token.type !== "color") continue;
        const resolved = token.value as ResolvedColor;
        const parsed = parseSrgb(readVariable(root, token.id));
        expect(parsed, `${token.id}@${theme}이 srgb로 해석되지 않았습니다`).not.toBeNull();
        const [r, g, b] = parsed as readonly number[];
        const [sr, sg, sb] = resolved.components;
        expect(Math.abs((r ?? -1) - (sr ?? -2))).toBeLessThan(0.01);
        expect(Math.abs((g ?? -1) - (sg ?? -2))).toBeLessThan(0.01);
        expect(Math.abs((b ?? -1) - (sb ?? -2))).toBeLessThan(0.01);
      }
    });
  }
});

test("color-scheme이 theme마다 선언된다", () => {
  const light = withTheme("light", (root) => getComputedStyle(root).colorScheme);
  const dark = withTheme("dark", (root) => getComputedStyle(root).colorScheme);
  expect(light).toBe("light");
  expect(dark).toBe("dark");
});
