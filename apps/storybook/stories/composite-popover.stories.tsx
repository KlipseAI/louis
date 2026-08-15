import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CompositePopover,
  CompositePopoverContent,
  CompositePopoverTitle,
  CompositePopoverTrigger,
} from "@klipse-design/react";
import { Button } from "@klipse-design/react";

const meta: Meta<typeof CompositePopover> = {
  title: "Components/CompositePopover",
  component: CompositePopover,
};
export default meta;

type Story = StoryObj<typeof CompositePopover>;

/**
 * 프로필 패널은 서로 다른 종류의 컨트롤을 묶으므로 `role="dialog"`다.
 * 여기에 `role="menu"`를 붙이는 것을 규범이 금지한다.
 */
export const Profile: Story = {
  render: () => (
    <CompositePopover>
      <CompositePopoverTrigger asChild>
        <Button variant="ghost">프로필</Button>
      </CompositePopoverTrigger>
      <CompositePopoverContent>
        <CompositePopoverTitle>내 계정</CompositePopoverTitle>
        <p style={{ margin: 0 }}>sniperfactory@example.com</p>
        <Button variant="secondary" size="sm">
          설정
        </Button>
        <Button variant="ghost" size="sm">
          로그아웃
        </Button>
      </CompositePopoverContent>
    </CompositePopover>
  ),
};
