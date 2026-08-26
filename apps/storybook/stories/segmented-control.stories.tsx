import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl, SegmentedControlItem } from "@klipse-design/react";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

function Themed({ size = "lg" }: { size?: "lg" | "md" }) {
  const [value, setValue] = useState("light");
  return (
    <SegmentedControl label="테마" size={size} value={value} onValueChange={setValue}>
      <SegmentedControlItem value="system">시스템</SegmentedControlItem>
      <SegmentedControlItem value="light">라이트</SegmentedControlItem>
      <SegmentedControlItem value="dark">다크</SegmentedControlItem>
    </SegmentedControl>
  );
}

export const Playground: Story = { render: () => <Themed /> };

/**
 * design/components/segmented-control.md의 Specification과 States를 한 화면에서 대조한다.
 *
 * **트랙 면과 선택 면이 두 테마 모두에서 달라야 한다.** 다크에서 inset·surface·menu·overlay
 * 넷이 같은 색이고 라이트에서 raised·overlay·surface 셋이 같아, 짝을 잘못 고르면 한 테마에서
 * 선택이 통째로 사라진다. 테마를 바꿔 가며 보는 것이 이 화면의 목적이다.
 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20, justifyItems: "start" }}>
      <Themed size="lg" />
      <Themed size="md" />
      <SegmentedControl label="정렬" value="recent" onValueChange={() => {}}>
        <SegmentedControlItem value="recent">최신</SegmentedControlItem>
        <SegmentedControlItem value="name">이름</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl label="비활성 그룹" value="a" onValueChange={() => {}} disabled>
        <SegmentedControlItem value="a">하나</SegmentedControlItem>
        <SegmentedControlItem value="b">둘</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl label="항목 하나만 비활성" value="a" onValueChange={() => {}}>
        <SegmentedControlItem value="a">가능</SegmentedControlItem>
        <SegmentedControlItem value="b" disabled>
          불가
        </SegmentedControlItem>
      </SegmentedControl>
      <div style={{ inlineSize: 240 }}>
        <SegmentedControl
          label="좁은 폭에서 긴 라벨"
          value="a"
          onValueChange={() => {}}
          className="w-full"
        >
          <SegmentedControlItem value="a">아주 긴 라벨입니다</SegmentedControlItem>
          <SegmentedControlItem value="b">짧음</SegmentedControlItem>
        </SegmentedControl>
      </div>
    </div>
  ),
};
