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

/** 면 있는 좌측 정렬 패널 — 대시보드 섹션의 자리다(2슬롯: 제목 + 본문). */
export const Compact: Story = {
  render: () => (
    <div style={{ inlineSize: 420 }}>
      <EmptyState
        layout="compact"
        title="아직 데이터가 없습니다"
        description="영상을 올리면 이 자리에 지표가 쌓입니다."
      />
    </div>
  ),
};

/** 그래픽 없이 큰 제목 한 줄과 행동 유도 둘 — 빈 캔버스 오버레이의 자리다. */
export const Canvas: Story = {
  render: () => (
    <EmptyState
      layout="canvas"
      title="첫 노드를 만들어 시작하세요"
      action={
        <>
          <Button variant="secondary">이미지 생성</Button>
          <Button variant="secondary">비디오 생성</Button>
        </>
      }
    />
  ),
};
