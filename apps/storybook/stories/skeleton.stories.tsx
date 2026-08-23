import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "@klipse-design/react";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
};
export default meta;

export const Shapes: StoryObj<typeof Skeleton> = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <code>circle (40x40)</code>
        <Skeleton shape="circle" style={{ width: 40, height: 40 }} />
      </div>
      <div>
        <code>text (200x16)</code>
        <Skeleton shape="text" style={{ width: 200, height: 16 }} />
      </div>
      <div>
        <code>block (300x120)</code>
        <Skeleton shape="block" style={{ width: 300, height: 120 }} />
      </div>
    </div>
  ),
};
