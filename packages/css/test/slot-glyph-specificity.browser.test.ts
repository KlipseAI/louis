// 글리프 슬롯 안의 `svg` 규칙이 소비자의 클래스 하나를 이기지 않는지 본다 (DS-D-0004).
//
// DS-D-0004 저작 규칙은 「요소·ID 선택자 금지」「컴포넌트 루트 클래스 1개 + `:where()`로 내부
// 특이도 0」이다. 세 슬롯(`.louis-menu-trigger__icon` · `.louis-select-trigger__icon` ·
// `.louis-select-trigger__caret`)이 `… svg` 로 적혀 있어 특이도가 (0,1,1)이었고, 언레이어드
// `styles.css` 를 쓰는 소비자가 글리프에 클래스 하나로 크기를 주면 **순서와 무관하게 졌다.**
// `:where(svg)` 로 (0,1,0)이 되면 뒤에 오는 소비자 규칙이 이긴다.
//
// 반대 방향도 고정한다 — 특이도를 내린 뒤에도 슬롯이 글리프를 채우는 기본 동작은 그대로여야
// 한다. 같은 요소에 붙는 `.louis-icon`(icon.css, 같은 (0,1,0))이 **앞에** 오므로 슬롯 규칙이
// 이긴다. 파일 순서가 뒤집히면 여기서 잡힌다.
import { afterEach, expect, test } from "vitest";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const SLOTS = [
  "louis-menu-trigger__icon",
  "louis-select-trigger__icon",
  "louis-select-trigger__caret",
] as const;

const cleanups: Array<() => void> = [];
afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  cleanups.push(() => host.remove());
  return host;
}

// Vite 는 CSS import 를 `<style>` 로 먼저 넣는다. 이 태그는 그 뒤에 붙으므로 캐스케이드에서도 뒤다.
function consumerStyle(css: string): void {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  cleanups.push(() => style.remove());
}

for (const slot of SLOTS) {
  test(`${slot}: 소비자 클래스 하나가 글리프 크기를 이긴다`, () => {
    consumerStyle(".consumer-glyph { inline-size: 7px; block-size: 7px; }");
    const host = mount(
      `<span class="${slot}"><svg class="consumer-glyph" viewBox="0 0 24 24" aria-hidden="true"></svg></span>`,
    );
    const glyph = host.querySelector("svg") as SVGSVGElement;
    const rect = glyph.getBoundingClientRect();
    expect(rect.width).toBe(7);
    expect(rect.height).toBe(7);
  });

  // 슬롯을 30px 로 벌린다. 아이콘 슬롯의 기본 20px 은 `.louis-icon` 의 md 크기와 같아서, 그대로
  // 재면 어느 규칙이 이겼든 20 이 나와 순서 역전을 잡지 못한다.
  test(`${slot}: 기본값은 여전히 슬롯을 채운다 (.louis-icon 이 붙어도)`, () => {
    const host = mount(
      `<span class="${slot}" style="inline-size: 30px; block-size: 30px"><svg class="louis-icon" viewBox="0 0 24 24" aria-hidden="true"></svg></span>`,
    );
    const glyph = (host.querySelector("svg") as SVGSVGElement).getBoundingClientRect();
    expect(glyph.width).toBe(30);
    expect(glyph.height).toBe(30);
  });
}
