// figma/components.measured.json 의 **text-link** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// 기록의 값은 브라우저 실측이 아니라 레시피 선언이고 verify-recipe-record 가 선언 문자열을 맞댄다. 그것은 «레시피에
// 그 글자가 적혀 있다»까지다 — 이 파일은 «그 레시피가 브라우저에서 실제로 그 상자와 밑줄을 만든다»를 잰다. 없으면
// 층 순서나 선택자가 바뀌어 선언이 지는 날에도 기록과 Figma 는 서로 맞고 둘 다 코드와 틀린 채 통과한다.
//
// React 표면이 없어 문서 API 절의 클래스 마크업을 렌더한다. 기록의 키는 `Underline/State` 이고 `Tone` 은 잉크만 바꿔
// 같은 키에 모인다($keyRule) — 그래서 키마다 두 톤을 다 재서 접힘이 참인지도 본다. Hover 칸은 실제로 포인터를 올린다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

afterEach(async () => {
  await page.viewport(1440, 900);
});

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

/** Figma 어휘 `UNDERLINE:2` · `NONE` 을 CSS 두 선언(line · offset)으로 푼다. */
function decoration(value: unknown, label: string): { line: string; offset: number | null } {
  if (value === "NONE") return { line: "none", offset: null };
  const match = typeof value === "string" ? /^UNDERLINE:(\d+(?:\.\d+)?)$/.exec(value) : null;
  if (match === null) throw new Error(`${label}.textDecoration 을 읽지 못했습니다: ${String(value)}`);
  return { line: "underline", offset: Number(match[1]) };
}

function Link({ tone, underline }: { readonly tone: "default" | "inherit"; readonly underline: "hover" | "none" }): JSX.Element {
  return (
    <p>
      영수증은{" "}
      <a
        className="louis-text-link"
        href="#receipt"
        data-testid="link"
        {...(tone === "inherit" ? { "data-tone": "inherit" } : {})}
        {...(underline === "none" ? { "data-underline": "none" } : {})}
      >
        여기
      </a>
      에 있습니다.
    </p>
  );
}

/** 기록이 갖는 칸 전부. 기록에 칸이 늘었는데 여기서 재지 않으면 아래 시험이 실패한다. */
const MEASURED_FIELDS = ["paddingBlock", "paddingInline", "underlineOffset", "textDecoration"];

for (const [key, spec] of Object.entries(measured.components["text-link"].sizes as Sizes)) {
  const [underline, state] = key.split("/") as ["hover" | "none", "Default" | "Hover"];
  for (const tone of ["default", "inherit"] as const) {
    test(`text-link.${key} (tone=${tone}): 여백 · 밑줄 간격 · 밑줄 유무가 기록과 같다`, async () => {
      const label = `text-link.${key}.${tone}`;
      expect(
        Object.keys(spec).filter((field) => !field.startsWith("$")).sort(),
        `${label} 기록의 칸이 이 시험이 재는 칸과 같다`,
      ).toEqual([...MEASURED_FIELDS].sort());
      await render(<Link tone={tone} underline={underline} />);
      const node = find("link");
      if (state === "Hover") await userEvent.hover(node);
      else await userEvent.unhover(node);
      const style = getComputedStyle(node);
      expect(px(style.paddingTop), `${label}.paddingBlock`).toBe(num(spec, "paddingBlock", label));
      expect(px(style.paddingBottom), `${label}.paddingBlock(end)`).toBe(num(spec, "paddingBlock", label));
      expect(px(style.paddingLeft), `${label}.paddingInline`).toBe(num(spec, "paddingInline", label));
      expect(px(style.paddingRight), `${label}.paddingInline(end)`).toBe(num(spec, "paddingInline", label));
      expect(px(style.textUnderlineOffset), `${label}.underlineOffset`).toBe(num(spec, "underlineOffset", label));
      const expected = decoration(spec["textDecoration"], label);
      expect(style.textDecorationLine, `${label}.textDecoration`).toBe(expected.line);
      if (expected.offset !== null) {
        expect(px(style.textUnderlineOffset), `${label}.textDecoration 의 간격`).toBe(expected.offset);
      }
      await userEvent.unhover(node);
    });
  }
}
