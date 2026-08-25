import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// DS-D-0005: 실브라우저 러너를 1단계에 둔다. jsdom·happy-dom은 쓰지 않는다.
// 두 환경 모두 HTMLDialogElement를 제대로 구현하지 않아 modal/non-modal 구분 테스트를
// 구현과 무관하게 통과시킨다. packages/tokens/test/environment.browser.test.ts가 이를 강제한다.
//
// reducedMotion은 provider 수준 contextOptions이므로 instance가 아니라 project를 나눈다.
const browserInclude = ["packages/*/test/**/*.browser.test.{ts,tsx}"];

// fixture가 dist를 거쳐 하부 유틸을 끌어오므로, 첫 실행에서 Vite가 이들을 "새 의존성"으로
// 발견하고 페이지를 리로드한다. 그 리로드는 진행 중이던 테스트를 통째로 실패시킨다.
// 미리 지정해 두면 발견 단계가 사라져 첫 실행부터 결정적으로 돈다.
//
// **`>` 문법이 필수다.** 2026-08-21까지 이 목록이 맨 이름("@radix-ui/react-portal")이었는데,
// 그 이름들은 pnpm 배치상 **저장소 루트에서 해석되지 않는다**(`packages/react`에서만 된다).
// Vite optimizer는 루트에서 도므로 매 실행이 `Failed to resolve dependency: …, present in
// client 'optimizeDeps.include'` 를 찍고 **사전 번들링이 통째로 걸리지 않았다.** 즉 이 배열이
// 막으려던 리로드가 그대로 일어나고 있었다 — 브라우저 테스트가 약 5% 확률로 엉뚱한 DOM을
// 읽고 실패한 원인이다. 부모 패키지를 앞에 적어 그 경로로 해석하게 한다.
const overlayDeps = [
  "@klipse-design/react > @radix-ui/react-dismissable-layer",
  "@klipse-design/react > @radix-ui/react-focus-scope",
  "@klipse-design/react > @radix-ui/react-popper",
  "@klipse-design/react > @radix-ui/react-portal",
];

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          include: ["packages/*/test/**/*.node.test.ts"],
          environment: "node",
        },
      },
      {
        // __LOUIS_REDUCED_MOTION__은 "이 project가 어느 컨텍스트인지"를 테스트가 알게 한다.
        // 이것이 없으면 matchMedia 분기 테스트가 어느 쪽으로 갔든 통과해 버려서,
        // contextOptions가 실제로 적용됐는지를 증명하지 못한다.
        define: { __LOUIS_REDUCED_MOTION__: "false" },
        optimizeDeps: { include: overlayDeps },
        test: {
          name: "browser",
          include: browserInclude,
          setupFiles: ["./test/setup-styles.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        define: { __LOUIS_REDUCED_MOTION__: "true" },
        optimizeDeps: { include: overlayDeps },
        test: {
          name: "browser-reduced-motion",
          include: browserInclude,
          setupFiles: ["./test/setup-styles.ts"],
          browser: {
            enabled: true,
            // motion.md: reduced-motion에서도 focus 이동·scroll lock·unmount 순서는 같다.
            // matchMedia 목킹 대신 실제 컨텍스트로 검증한다.
            provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
