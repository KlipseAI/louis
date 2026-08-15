import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, IconButton } from "@klipse-design/react";
import {
  IconDotsThreeVertical,
  IconEye,
  IconEyeSlash,
  IconMagnifyingGlass,
  IconPlus,
  IconTrashSimple,
  IconX,
} from "@klipse-design/react/icons";

const meta: Meta<typeof IconButton> = {
  title: "Components/Icon Button",
  component: IconButton,
  args: { label: "삭제", children: <IconTrashSimple /> },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

/** design/components/icon-button.md의 Hierarchy와 States를 한 화면에서 대조한다. */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["md", "sm"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code style={{ width: 32 }}>{size}</code>
          {(["primary", "secondary", "ghost", "danger"] as const).map((variant) => (
            <IconButton key={variant} label={variant} variant={variant} size={size}>
              <IconTrashSimple />
            </IconButton>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <code style={{ width: 32 }}>state</code>
        <IconButton label="비활성" disabled>
          <IconX />
        </IconButton>
        <IconButton label="켜짐" pressed>
          <IconEye />
        </IconButton>
        <IconButton label="꺼짐" pressed={false}>
          <IconEyeSlash />
        </IconButton>
      </div>
    </div>
  ),
};

/**
 * **별도 컴포넌트인 근거를 눈으로 본다.** Button을 아이콘 전용으로 렌더하면 빈 라벨과의 gap과
 * 좌우 padding이 남아 정사각이 되지 않는다 — md 54×38이다. 아래 두 줄을 나란히 두면 그 차이가
 * 그대로 보인다.
 */
export const WhyNotButton: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <code style={{ width: 120 }}>IconButton</code>
        <IconButton label="삭제" variant="secondary">
          <IconTrashSimple />
        </IconButton>
        <IconButton label="삭제" variant="secondary" size="sm">
          <IconTrashSimple />
        </IconButton>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <code style={{ width: 120 }}>Button (icon only)</code>
        <Button aria-label="삭제" variant="secondary" leftIcon={<IconTrashSimple />}>
          {null}
        </Button>
        <Button aria-label="삭제" variant="secondary" size="sm" leftIcon={<IconTrashSimple />}>
          {null}
        </Button>
      </div>
    </div>
  ),
};

/** 토글. 라벨은 현재 상태가 아니라 **수행할 동작**을 말한다. */
export const Toggle: Story = {
  render: function ToggleStory() {
    const [visible, setVisible] = useState(false);
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <IconButton
          label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
          pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <IconEye /> : <IconEyeSlash />}
        </IconButton>
        <span>{visible ? "표시 중" : "숨김"}</span>
      </div>
    );
  },
};

/** 밀집한 도구 영역. 강조를 나누지 않고 전부 ghost로 둔다. */
export const InToolbar: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 4,
        alignItems: "center",
        padding: 8,
        borderRadius: "var(--kds-radius-control)",
        background: "var(--kds-color-background-inset)",
      }}
    >
      <IconButton label="검색" size="sm">
        <IconMagnifyingGlass />
      </IconButton>
      <IconButton label="추가" size="sm">
        <IconPlus />
      </IconButton>
      <IconButton label="삭제" size="sm" variant="danger">
        <IconTrashSimple />
      </IconButton>
      <IconButton label="더 보기" size="sm">
        <IconDotsThreeVertical />
      </IconButton>
    </div>
  ),
};
