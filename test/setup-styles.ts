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

const TOKEN = "--louis-color-bg-upgrade";
const TIMEOUT_MS = 5000;

function tokensReady(): boolean {
  return getComputedStyle(document.documentElement).getPropertyValue(TOKEN).trim() !== "";
}

// 컴포넌트 규칙이 실제로 매칭되는지 본다. `.louis-segmented-control`은 styles.css가 소유하고
// `display: inline-flex`를 준다 — 규칙이 없으면 div의 기본값 `block`이 나온다.
function componentStylesReady(): boolean {
  const probe = document.createElement("div");
  probe.className = "louis-segmented-control";
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
//   sidebar CTA   기대 `--louis-color-bg-upgrade`       #171b22
//                 실제 `--louis-color-bg-upgrade-hover` #313640
//   segmented     기대 Default = `color-fg-secondary` #575d68
//                 실제 Hover   = `color-fg-primary`   #171b22
//
// `userEvent.hover()`는 **진짜 마우스를 움직인다.** 얹은 채로 테스트가 끝나면 다음 테스트에서
// 같은 좌표에 렌더된 요소가 `:hover`를 받는다.
//
// **매 테스트마다 포인터를 치우면 안 된다.** 그렇게 해 봤더니 suite가 멈췄다 — playwright의
// hover는 대상이 실제로 이벤트를 받을 때까지 기다리는데, 앞 테스트가 남긴 오버레이가 덮고
// 있으면 그 대기가 끝나지 않는다. 포인터를 쓰는 파일이 27개라 비용도 크다.
//
// **실패한 테스트 뒤에만 치운다.** 통과한 테스트는 자기 `unhover`가 이미 돌았고, 실패한
// 테스트는 그 줄에 도달하지 못한 바로 그 경우다 — 즉 **첫 실패가 둘째·셋째를 만드는 연쇄만**
// 끊으면 된다. 정상 경로에는 왕복이 하나도 추가되지 않는다.
//
// `unhover`는 vitest가 내부적으로 `html > body`를 hover하는 것이라 대상 요소를 따로 만들지
// 않는다.
// **읽기 전에 치운다 — 뒤가 아니라 앞이다.**
//
// 뒤에서 치우는 판을 먼저 만들었는데 두 가지가 틀렸다.
//
// 1. **suite가 멈췄다.** afterEach 시점에는 그 테스트의 fixture가 아직 DOM에 있어서, playwright의
//    hover가 「대상이 이벤트를 받을 때까지」 기다리다 끝나지 않는다.
// 2. **연쇄만 끊어서는 부족했다.** 남기는 것은 `hover`만이 아니다 — `click`도 마우스를 그 자리에
//    두고, vitest는 파일을 **병렬로** 돌리며 같은 마우스를 공유한다. 그래서 이 파일이 아무것도
//    안 눌러도 **다른 파일이 남긴 포인터** 위에 자기 요소가 렌더될 수 있다.
//
// beforeEach 시점에는 아직 아무것도 렌더되지 않았다. 그래서 `html > body`가 비어 있고 대기가
// 걸리지 않는다. `unhover`는 vitest가 내부적으로 `html > body`를 hover하는 것이라 대상 요소를
// 따로 만들 필요도 없다.
beforeEach(async () => {
  try {
    await userEvent.unhover(document.body);
  } catch {
    // 포인터를 못 옮기는 것을 테스트 실패로 만들지 않는다. 이 훅은 보호막이지 단언이 아니다.
  }
});

afterEach(async (context) => {
  document.documentElement.removeAttribute("data-theme");
  if (context.task.result?.state !== "fail") return;
  try {
    await userEvent.unhover(document.body);
  } catch {
    // 포인터를 못 옮기는 것을 테스트 실패로 만들지 않는다. 이 훅은 보호막이지 단언이 아니다.
  }
});
