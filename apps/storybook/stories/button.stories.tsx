import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@klipse-design/react";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: { children: "저장" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

/** design/components/button.md의 Hierarchy와 States를 한 화면에서 대조한다. */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["md", "sm"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code style={{ width: 32 }}>{size}</code>
          {(["primary", "secondary", "ghost", "danger"] as const).map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <code style={{ width: 32 }}>state</code>
        <Button loading>진행 중</Button>
        <Button disabled>비활성</Button>
        <Button aria-disabled>aria-disabled</Button>
      </div>
    </div>
  ),
};

/**
 * 고정 높이를 쓰지 않으므로 긴 라벨과 좁은 폭에서 잘리지 않아야 한다.
 * 320px 컨테이너는 규범이 지정한 하한이다.
 */
export const LongLabels: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, width: 320, border: "1px dashed #999", padding: 8 }}>
      <Button>새 프로젝트 만들기</Button>
      <Button variant="secondary">Create a new collaborative workspace</Button>
      <Button variant="danger">プロジェクトを完全に削除する</Button>
    </div>
  ),
};

/** 아이콘 전용 버튼은 accessible name을 반드시 제공한다. */
export const IconOnly: Story = {
  render: () => (
    <Button aria-label="닫기">
      <span aria-hidden="true">✕</span>
    </Button>
  ),
};
