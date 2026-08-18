import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@klipse-design/react";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { label: "약관에 동의합니다" },
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

/** design/components/checkbox.md의 States를 한 화면에서 대조한다. */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Checkbox label="선택 안 함" />
      <Checkbox label="선택함" defaultChecked />
      <Checkbox label="일부 선택" indeterminate />
      <Checkbox label="일부 + 선택 (막대가 이긴다)" defaultChecked indeterminate />
      <Checkbox label="비활성" disabled />
      <Checkbox label="비활성 + 선택" defaultChecked disabled />
      <Checkbox label="비활성 + 일부" indeterminate disabled />
      <Checkbox aria-label="라벨 없음" />
      <div style={{ inlineSize: 260 }}>
        <Checkbox label="라벨이 여러 줄로 넘어갈 때 상자는 첫 줄 옆에 남아야 한다" />
      </div>
    </div>
  ),
};

/** 일괄 선택 — 제품에서 indeterminate를 쓰는 유일한 자리의 형태다. */
export const SelectAll: Story = {
  render: () => {
    const [items, setItems] = useState([true, false, false]);
    const checkedCount = items.filter(Boolean).length;
    return (
      <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
        <Checkbox
          label={`전체 선택 (${checkedCount}/${items.length})`}
          checked={checkedCount === items.length}
          indeterminate={checkedCount > 0 && checkedCount < items.length}
          onCheckedChange={(next) => setItems(items.map(() => next))}
        />
        {items.map((checked, index) => (
          <Checkbox
            key={index}
            label={`클립 ${index + 1}`}
            checked={checked}
            onCheckedChange={(next) =>
              setItems(items.map((value, i) => (i === index ? next : value)))
            }
          />
        ))}
      </div>
    );
  },
};
