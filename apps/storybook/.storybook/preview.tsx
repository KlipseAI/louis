import type { Decorator, Preview } from "@storybook/react-vite";
import { OverlayProvider } from "@klipse-design/react";

// 소비자와 같은 순서로 불러온다. layers.css가 먼저여야 cascade layer 순서가 선다.
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

/**
 * 테마는 `data-theme` 속성 하나로 갈린다 — `:root`가 light이고 `[data-theme="dark"]`가
 * override다. 툴바가 그 속성을 바꾸는 것이 곧 소비자가 하는 일과 같다.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = String(context.globals["theme"] ?? "light");
  document.documentElement.dataset["theme"] = theme;
  document.body.style.background = "var(--kds-color-background-canvas)";
  document.body.style.color = "var(--kds-color-foreground-primary)";
  return <Story />;
};

/**
 * overlay host와 scroll owner는 앱이 한 번 해석한다. 워크샵도 소비자이므로 같은 규칙을 따른다.
 */
const withOverlayProvider: Decorator = (Story) => (
  <OverlayProvider>
    <Story />
  </OverlayProvider>
);

const preview: Preview = {
  decorators: [withOverlayProvider, withTheme],
  globalTypes: {
    theme: {
      description: "semantic 토큰 테마",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    controls: { expanded: true },
    a11y: {
      // 위반이 나오면 컴포넌트를 고친다. 스토리를 고쳐서 통과시키지 않는다.
      test: "error",
    },
  },
};

export default preview;
