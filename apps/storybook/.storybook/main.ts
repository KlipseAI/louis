import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
  // 저장소 내용이 외부로 나가지 않게 한다. 워크샵은 로컬 검증 도구다.
  core: { disableTelemetry: true },
};

export default config;
