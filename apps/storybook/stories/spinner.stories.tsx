import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "@klipse-design/react";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  args: {
    size: "md",
  },
};
export default meta;

export const Sizes: StoryObj<typeof Spinner> = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <code>md (16px)</code>
        <Spinner size="md" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <code>sm (12px)</code>
        <Spinner size="sm" />
      </div>
    </div>
  ),
};
