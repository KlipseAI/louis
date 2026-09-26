import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@klipse-design/react";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  args: {
    name: "기세준",
    size: "md",
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <code>lg (40px)</code>
        <Avatar name="기세준" size="lg" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <code>md (28px)</code>
        <Avatar name="기세준" size="md" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <code>sm (24px)</code>
        <Avatar name="기세준" size="sm" />
      </div>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Avatar
        name="Klipse User"
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        size="md"
      />
      <Avatar
        name="Fallback User"
        size="md"
      />
    </div>
  ),
};
