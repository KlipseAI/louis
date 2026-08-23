import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar, ProgressRing } from "@klipse-design/react";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/Progress",
  component: ProgressBar,
  args: {
    value: 60,
  },
};
export default meta;

export const Bar: StoryObj<typeof ProgressBar> = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      <div>
        <code>25%</code>
        <ProgressBar value={25} />
      </div>
      <div>
        <code>60%</code>
        <ProgressBar value={60} />
      </div>
      <div>
        <code>100%</code>
        <ProgressBar value={100} />
      </div>
    </div>
  ),
};

export const Ring: StoryObj<typeof ProgressRing> = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <ProgressRing value={30}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb" }} />
      </ProgressRing>
      <ProgressRing value={75}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb" }} />
      </ProgressRing>
      <ProgressRing value={100}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb" }} />
      </ProgressRing>
    </div>
  ),
};
