import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "@klipse-design/react";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  args: { label: "투명도", min: 0, max: 100, defaultValue: 40 },
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ inlineSize: 320 }}>
      <Slider {...args} />
    </div>
  ),
};

/**
 * design/components/slider.md의 Hierarchy와 States를 한 화면에서 대조한다.
 *
 * 레일·썸은 섀도우 pseudo-element라 게이트가 렌더 결과를 보지 못한다. **이 화면이 그 자리를
 * 사람이 확인하는 유일한 경로다**(DS-D-0012).
 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, inlineSize: 320 }}>
      {(["thumb", "track"] as const).map((variant) =>
        (["lg", "md"] as const).map((size) => (
          <Slider
            key={`${variant}-${size}`}
            label={`${variant} · ${size}`}
            variant={variant}
            size={size}
            min={0}
            max={100}
            defaultValue={40}
            formatValue={(value) => `${value}%`}
          />
        )),
      )}
      <Slider label="min (0%)" min={0} max={100} defaultValue={0} />
      <Slider label="max (100%)" min={0} max={100} defaultValue={100} />
      <Slider label="disabled" min={0} max={100} defaultValue={40} disabled />
      <Slider label="disabled · track" variant="track" min={0} max={100} defaultValue={40} disabled />
    </div>
  ),
};

/** 값 표시는 컴포넌트의 부품이 아니다 — 호출부의 격자가 그 자리를 소유한다. */
export const WithValue: Story = {
  render: () => {
    const [speed, setSpeed] = useState(1);
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "end", inlineSize: 320 }}>
        <Slider
          label="재생 속도"
          min={0.5}
          max={2}
          step={0.05}
          value={speed}
          onValueChange={setSpeed}
          formatValue={(value) => `${value.toFixed(2)}배`}
        />
        <output
          style={{ minInlineSize: 56, blockSize: 40, display: "grid", placeItems: "center" }}
        >
          {speed.toFixed(2)}배
        </output>
      </div>
    );
  },
};
