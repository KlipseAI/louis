// figma/components.measured.json 의 **brand-bar** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-15 DS-D-0112).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일은 기록의 키마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

test("brand-bar base — 기록이 레시피의 계산값과 같다", async () => {
  await page.viewport(1280, 800);
  await render(
    <header className="louis-brand-bar" data-testid="bar">
      <a className="louis-brand-bar__brand" href="#deck" aria-label="Klipse Deck" data-testid="brand">
        <span style={{ display: "block", inlineSize: 186, blockSize: 28 }} />
      </a>
      <nav className="louis-brand-bar__links" aria-label="덱 메뉴" data-testid="links">
        <a className="louis-text-link louis-brand-bar__link" data-underline="none" href="#a">
          교안 관리
        </a>
        <a className="louis-text-link louis-brand-bar__link" data-underline="none" href="#b">
          Klipse로 돌아가기
        </a>
      </nav>
    </header>,
  );
  const spec = measured.components["brand-bar"].sizes["base"] as Record<string, unknown>;
  expect(px(getComputedStyle(find("bar")).columnGap), "gap").toBe(spec.gap);
  const brand = getComputedStyle(find("brand"));
  expect(px(brand.height), "brandHeight").toBe(spec.brandHeight);
  expect(px(brand.borderTopLeftRadius), "brandRadius").toBe(spec.brandRadius);
  const links = getComputedStyle(find("links"));
  expect(px(links.columnGap), "linksGap").toBe(spec.linksGap);
  expect(px(links.rowGap), "linksRowGap").toBe(spec.linksRowGap);
});
