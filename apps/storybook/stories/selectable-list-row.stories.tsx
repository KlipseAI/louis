import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectableListRow } from "@klipse-design/react";

const meta: Meta<typeof SelectableListRow> = {
  title: "Components/SelectableListRow",
  component: SelectableListRow,
  args: { title: "첫 클립", meta: "00:00 · 12초" },
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof SelectableListRow>;

const Thumb = () => (
  <span
    style={{
      inlineSize: 96,
      blockSize: 54,
      display: "block",
      background: "var(--louis-color-bg-inset)",
    }}
  />
);

export const Playground: Story = {
  render: (args) => (
    <div style={{ inlineSize: 340 }}>
      <SelectableListRow {...args} />
    </div>
  ),
};

/**
 * **표면 위에서 확인하는 것이 이 화면의 목적이다.** 다크에서 `background-inset`이 `surface`와
 * 같은 색이라 선택 면이 배경에 녹는다 — 3px 선행 표식이 그 자리를 지킨다.
 */
export const OnSurface: Story = {
  render: () => {
    const [selected, setSelected] = useState(1);
    return (
      <div
        style={{
          inlineSize: 340,
          padding: 8,
          borderRadius: 16,
          background: "var(--louis-color-bg-surface)",
        }}
      >
        {["첫 클립", "둘째 클립", "셋째 클립"].map((label, index) => (
          <SelectableListRow
            key={label}
            selected={index === selected}
            media={<Thumb />}
            title={label}
            meta={`00:0${index} · 12초`}
            trailing={<span>{index + 1}</span>}
            onClick={() => setSelected(index)}
          />
        ))}
      </div>
    );
  },
};

/** design/components/selectable-list-row.md의 States를 한 화면에서 대조한다. */
export const Matrix: Story = {
  render: () => (
    <div style={{ inlineSize: 340, display: "grid", gap: 4 }}>
      <SelectableListRow title="기본" meta="00:00 · 12초" />
      <SelectableListRow selected title="선택됨" meta="00:01 · 8초" />
      <SelectableListRow disabled title="비활성" meta="00:02 · 5초" />
      <SelectableListRow media={<Thumb />} title="썸네일" meta="00:03 · 20초" trailing={<span>4</span>} />
      <SelectableListRow
        selected
        media={<Thumb />}
        title="아주 아주 아주 긴 클립 제목이 들어오는 경우"
        meta="아주 아주 긴 보조 문구도 한 줄로 잘린다"
        trailing={<span>5</span>}
      />
    </div>
  ),
};
