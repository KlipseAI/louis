import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, IconButton, Tooltip } from "@klipse-design/react";
import {
  IconArrowUp,
  IconDownloadSimple,
  IconMagnifyingGlass,
  IconTrashSimple,
} from "@klipse-design/react/icons";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  args: { content: "삭제 (⌫)" },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <IconButton label="삭제">
        <IconTrashSimple />
      </IconButton>
    </Tooltip>
  ),
};

/** 네 방향. 공간이 없으면 뒤집힌다 — 위치 계산은 overlay primitive가 소유한다. */
export const Sides: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(4, auto)" }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} content={`side=${side}`} side={side}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

/**
 * **아이콘 전용 컨트롤이 주 사용처다.** 이름은 IconButton의 `label`이 소유하고 tooltip은 그것을
 * 눈으로도 보이게 한다. 둘이 같은 문자열이면 tooltip을 두지 않는다 — 스크린리더가 두 번 읽는다.
 */
export const OnIconButton: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 4 }}>
      <Tooltip content="검색 (⌘K)">
        <IconButton label="검색">
          <IconMagnifyingGlass />
        </IconButton>
      </Tooltip>
      <Tooltip content="원본 내려받기">
        <IconButton label="내려받기">
          <IconDownloadSimple />
        </IconButton>
      </Tooltip>
      <Tooltip content="맨 위로 (Home)">
        <IconButton label="맨 위로">
          <IconArrowUp />
        </IconButton>
      </Tooltip>
      <Tooltip content="되돌릴 수 없습니다">
        <IconButton label="삭제" variant="danger">
          <IconTrashSimple />
        </IconButton>
      </Tooltip>
    </div>
  ),
};

/** 길어지면 288px에서 줄바꿈한다. 잘라내지 않는다 — 잘린 설명은 설명이 아니다. */
export const LongContent: Story = {
  render: () => (
    <Tooltip content="이 작업은 프로젝트의 모든 클립과 렌더 결과를 함께 지우며 되돌릴 수 없습니다.">
      <Button variant="danger">프로젝트 삭제</Button>
    </Tooltip>
  ),
};

/** `disabled`면 열리지 않는다. trigger의 동작은 그대로다. */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Tooltip content="이건 보인다">
        <Button variant="secondary">기본</Button>
      </Tooltip>
      <Tooltip content="이건 안 보인다" disabled>
        <Button variant="secondary">disabled</Button>
      </Tooltip>
    </div>
  ),
};
