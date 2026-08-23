import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "@klipse-design/react";

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  args: {
    label: "프로젝트 제목",
    placeholder: "제목을 입력하세요",
  },
};
export default meta;

export const Sizes: StoryObj<typeof TextField> = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      <TextField label="Medium (40px)" size="md" placeholder="기본 크기" />
      <TextField label="Small (32px)" size="sm" placeholder="작은 크기" />
    </div>
  ),
};

export const States: StoryObj<typeof TextField> = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      <TextField label="기본 상태" placeholder="입력 가능" />
      <TextField
        label="오류 상태"
        defaultValue="잘못된 형식"
        invalid
        description="올바른 이메일 주소를 입력해주세요"
      />
      <TextField label="비활성 상태" disabled defaultValue="수정 불가" />
    </div>
  ),
};
