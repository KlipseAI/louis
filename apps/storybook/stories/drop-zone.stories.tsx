import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DropZone } from "@klipse-design/react";

const meta: Meta<typeof DropZone> = {
  title: "Components/DropZone",
  component: DropZone,
  args: {
    prompt: "긴 영상을 올리세요.",
    caption: "올린 원본 영상은 30일 동안 보관합니다. 그 뒤에는 클립을 다시 뽑을 수 없습니다.",
    accept: "video/*",
    onFiles: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof DropZone>;

/** 업로드 글리프 — 스토리 전용 그림이다. 소비처가 자기 아이콘을 넣는다. */
const UploadGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </svg>
);

export const Playground: Story = {};

export const WithGraphic: Story = {
  args: { graphic: <UploadGlyph /> },
};

export const Disabled: Story = {
  args: { disabled: true, graphic: <UploadGlyph /> },
};

export const Received: Story = {
  render: (args) => {
    const [names, setNames] = useState<readonly string[]>([]);
    return (
      <div style={{ display: "grid", gap: 12, maxInlineSize: 640 }}>
        <DropZone {...args} graphic={<UploadGlyph />} multiple onFiles={(files) => setNames(files.map((file) => file.name))} />
        <output>{names.length === 0 ? "아직 받은 파일이 없습니다." : names.join(", ")}</output>
      </div>
    );
  },
};
