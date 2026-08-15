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
const overlayDeps = [
  "@radix-ui/react-dismissable-layer",
  "@radix-ui/react-focus-scope",
  "@radix-ui/react-popper",
  "@radix-ui/react-portal",
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
        // __KDS_REDUCED_MOTION__은 "이 project가 어느 컨텍스트인지"를 테스트가 알게 한다.
        // 이것이 없으면 matchMedia 분기 테스트가 어느 쪽으로 갔든 통과해 버려서,
        // contextOptions가 실제로 적용됐는지를 증명하지 못한다.
        define: { __KDS_REDUCED_MOTION__: "false" },
        optimizeDeps: { include: overlayDeps },
        test: {
          name: "browser",
          include: browserInclude,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        define: { __KDS_REDUCED_MOTION__: "true" },
        optimizeDeps: { include: overlayDeps },
        test: {
          name: "browser-reduced-motion",
          include: browserInclude,
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
