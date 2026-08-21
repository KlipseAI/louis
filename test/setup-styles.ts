// **스타일이 붙기 전에 읽는 경합을 막는다.**
//
// 브라우저 테스트가 약 5% 확률로 흔들렸다. 실패 모습이 늘 같았다 — 요소의 색이 토큰 값이 아니라
// **상속색**(#171b22 등)으로 읽힌다. Vite는 CSS import를 `<style>` 삽입으로 처리하는데, 그
// 삽입이 첫 테스트의 `getComputedStyle`보다 늦으면 규칙이 아직 없는 상태를 재고 그 값이
// 「그럴듯한 다른 색」이라 단언이 조용히 어긋난다.
//
// 토큰만 확인하면 부족하다 — `tokens.css`와 `styles.css`는 별개 파일이라 따로 도착한다.
// 그래서 **둘 다** 실제로 적용됐는지 탐침으로 확인하고, 안 되면 기다린다.
import { afterEach, beforeAll } from "vitest";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const TOKEN = "--kds-color-background-upgrade";
const TIMEOUT_MS = 5000;

function tokensReady(): boolean {
  return getComputedStyle(document.documentElement).getPropertyValue(TOKEN).trim() !== "";
}

// 컴포넌트 규칙이 실제로 매칭되는지 본다. `.kds-segmented-control`은 styles.css가 소유하고
// `display: inline-flex`를 준다 — 규칙이 없으면 div의 기본값 `block`이 나온다.
function componentStylesReady(): boolean {
  const probe = document.createElement("div");
  probe.className = "kds-segmented-control";
  document.body.append(probe);
  const display = getComputedStyle(probe).display;
  probe.remove();
  return display === "inline-flex";
}

beforeAll(async () => {
  const deadline = Date.now() + TIMEOUT_MS;
  while (!tokensReady() || !componentStylesReady()) {
    if (Date.now() > deadline) {
      throw new Error(
        `스타일시트가 ${TIMEOUT_MS}ms 안에 적용되지 않았습니다 — ` +
          `토큰 ${tokensReady() ? "OK" : "미적용"} · 컴포넌트 규칙 ${componentStylesReady() ? "OK" : "미적용"}. ` +
          `이 상태로 진행하면 상속색을 토큰 값으로 착각해 단언이 조용히 어긋납니다.`,
      );
    }
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  }
});

// **테마 복원을 실패에 견디게 만든다.**
//
// 여러 테스트가 `document.documentElement.setAttribute("data-theme", …)`로 테마를 바꾸고
// **본문 마지막 줄에서** 지운다. 단언이 중간에 실패하면 그 줄에 도달하지 못해 테마가 남고,
// 뒤따르는 테스트가 다른 테마에서 색을 읽는다 — 첫 실패가 둘째·셋째를 만든다.
// 여기서 매 테스트 뒤에 무조건 지워 그 연쇄를 끊는다.
afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});
