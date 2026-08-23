import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState, Button } from "@klipse-design/react";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: {
    title: "프로젝트가 없습니다",
    description: "새 프로젝트를 생성하여 작업을 시작해보세요.",
  },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {};

export const WithActions: Story = {
  render: () => (
    <div style={{ border: "1px dashed #ccc", borderRadius: 16 }}>
      <EmptyState
        title="동영상이 없습니다"
        description="하이라이트 또는 업로드한 동영상이 여기에 표시됩니다."
        action={<Button variant="primary">동영상 생성하기</Button>}
      />
    </div>
  ),
};
