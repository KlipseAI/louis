// **스타일이 붙기 전에 읽는 경합을 막는다.**
//
// 브라우저 테스트가 약 5% 확률로 흔들렸다. 실패 모습이 늘 같았다 — 요소의 색이 토큰 값이 아니라
// **상속색**(#171b22 등)으로 읽힌다. Vite는 CSS import를 `<style>` 삽입으로 처리하는데, 그
// 삽입이 첫 테스트의 `getComputedStyle`보다 늦으면 규칙이 아직 없는 상태를 재고 그 값이
// 「그럴듯한 다른 색」이라 단언이 조용히 어긋난다.
//
// 토큰만 확인하면 부족하다 — `tokens.css`와 `styles.css`는 별개 파일이라 따로 도착한다.
// 그래서 **둘 다** 실제로 적용됐는지 탐침으로 확인하고, 안 되면 기다린다.
import { afterEach, beforeAll, beforeEach } from "vitest";
import { userEvent } from "vitest/browser";
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
// **남은 마우스 포인터가 다음 테스트의 색을 바꾼다 — 이것이 플레이크의 원인이었다.**
//
// 40회 반복에서 2건이 실패했고 둘 다 「기대한 색 대신 hover 색」이었다. 토큰 값이 정확히
// 일치해서 추측이 아니다.
//
//   sidebar CTA   기대 `--kds-color-background-upgrade`      #171b22
//                 실제 `--kds-color-background-upgrade-hover` #313640
//   segmented     기대 Default = `color-foreground-secondary` #575d68
//                 실제 Hover   = `color-foreground-primary`   #171b22
//
// `userEvent.hover()`는 **진짜 마우스를 움직인다.** 얹은 채로 테스트가 끝나면 다음 테스트에서
// 같은 좌표에 렌더된 요소가 `:hover`를 받는다. 렌더 위치와 실행 순서에 따라 갈리므로 드물게
// 나고, 값이 「그럴듯한 다른 색」이라 원인이 안 보인다.
//
// `segmented-control.browser.test.tsx:151`이 이미 같은 위험을 주석으로 적고 개별 `unhover`를
// 넣어 두었는데, **단언이 먼저 실패하면 그 줄에 도달하지 못한다.** 그래서 여기서 무조건 치운다.
//
// 화면 우하단 1px 자리에 최상위 요소를 잠깐 만들어 그리로 포인터를 옮기고 지운다. 지운 뒤
// 포인터는 그 좌표의 배경 위에 남는다 — 어떤 fixture 위도 아니다.
// 매 테스트마다 포인터를 옮기면 playwright 왕복이 756번 생겨 suite가 10배 느려진다.
// **hover가 실제로 일어난 테스트에서만** 치운다 — `mouseover`가 한 번이라도 떴는지로 판별한다.
let pointerMoved = false;
const markPointerMoved = () => {
  pointerMoved = true;
};

beforeEach(() => {
  pointerMoved = false;
  document.addEventListener("mouseover", markPointerMoved, { capture: true });
});

afterEach(async () => {
  document.removeEventListener("mouseover", markPointerMoved, { capture: true });
  document.documentElement.removeAttribute("data-theme");
  if (!pointerMoved) return;

  const park = document.createElement("div");
  park.setAttribute("data-kds-pointer-park", "");
  park.style.cssText =
    "position:fixed;right:0;bottom:0;width:1px;height:1px;z-index:2147483647;background:transparent";
  document.body.append(park);
  try {
    await userEvent.hover(park);
  } catch {
    // 포인터를 못 옮기는 것은 테스트 실패로 만들지 않는다. 이 훅은 보호막이지 단언이 아니다.
  }
  park.remove();
});
