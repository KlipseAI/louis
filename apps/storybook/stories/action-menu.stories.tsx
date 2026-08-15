import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@klipse-design/react";
import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuGroup,
  ActionMenuItem,
  ActionMenuLinkItem,
  ActionMenuSeparator,
  ActionMenuSub,
  ActionMenuSubContent,
  ActionMenuSubTrigger,
  ActionMenuTrigger,
} from "@klipse-design/react";

/**
 * Trigger는 시각 표현을 소유하지 않는다 — 이름과 aria 관계만 소유한다.
 * 그래서 소비자가 `asChild`로 자기 Button을 넣는 것이 의도된 경로이며,
 * 넣지 않으면 브라우저 기본 버튼이 그대로 보인다.
 */
const meta: Meta<typeof ActionMenu> = {
  title: "Components/ActionMenu",
  component: ActionMenu,
};
export default meta;

type Story = StoryObj<typeof ActionMenu>;

export const Basic: Story = {
  render: () => (
    <ActionMenu panelLabel="프로젝트 액션">
      <ActionMenuTrigger asChild>
        <Button variant="secondary">액션</Button>
      </ActionMenuTrigger>
      <ActionMenuContent>
        <ActionMenuGroup label="파일">
          <ActionMenuItem onSelect={() => {}}>저장</ActionMenuItem>
          <ActionMenuLinkItem href="#docs">문서 열기</ActionMenuLinkItem>
        </ActionMenuGroup>
        <ActionMenuSeparator />
        <ActionMenuItem danger onSelect={() => {}}>
          삭제
        </ActionMenuItem>
      </ActionMenuContent>
    </ActionMenu>
  ),
};

/** disabled 표기는 menu 단위 단일 전략이다. 두 스토리를 나란히 두고 차이를 본다. */
export const DisabledStrategies: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24 }}>
      {(["announce", "skip"] as const).map((strategy) => (
        <ActionMenu key={strategy} panelLabel={strategy} disabledItems={strategy}>
          <ActionMenuTrigger asChild>
            <Button variant="secondary">{strategy}</Button>
          </ActionMenuTrigger>
          <ActionMenuContent>
            <ActionMenuItem disabled disabledReason="권한이 없습니다">
              비활성 항목
            </ActionMenuItem>
            <ActionMenuItem onSelect={() => {}}>정상 항목</ActionMenuItem>
          </ActionMenuContent>
        </ActionMenu>
      ))}
    </div>
  ),
};

/** 선택은 면 강조가 아니라 글리프가 표현한다 — hover와 구분되고 고대비에서도 살아남는다. */
export const Checkable: Story = {
  render: function Render() {
    const [theme, setTheme] = useState("light");
    return (
      <ActionMenu panelLabel="테마">
        <ActionMenuTrigger asChild>
            <Button variant="secondary">테마: {theme}</Button>
          </ActionMenuTrigger>
        <ActionMenuContent>
          {["light", "dark", "system"].map((value) => (
            <ActionMenuItem
              key={value}
              role="menuitemradio"
              checked={theme === value}
              closeOnSelect={false}
              onSelect={() => setTheme(value)}
            >
              {value}
            </ActionMenuItem>
          ))}
        </ActionMenuContent>
      </ActionMenu>
    );
  },
};

export const Submenu: Story = {
  render: () => (
    <ActionMenu panelLabel="내보내기">
      <ActionMenuTrigger asChild>
        <Button variant="secondary">액션</Button>
      </ActionMenuTrigger>
      <ActionMenuContent>
        <ActionMenuItem onSelect={() => {}}>저장</ActionMenuItem>
        <ActionMenuSub>
          <ActionMenuSubTrigger>내보내기</ActionMenuSubTrigger>
          <ActionMenuSubContent>
            <ActionMenuItem onSelect={() => {}}>PDF</ActionMenuItem>
            <ActionMenuItem onSelect={() => {}}>PNG</ActionMenuItem>
          </ActionMenuSubContent>
        </ActionMenuSub>
      </ActionMenuContent>
    </ActionMenu>
  ),
};

/** 긴 목록은 패널이 스크롤한다. viewport 밖 항목을 잘라내지 않는다. */
export const Scrolling: Story = {
  render: () => (
    <ActionMenu panelLabel="긴 목록">
      <ActionMenuTrigger asChild>
        <Button variant="secondary">긴 목록</Button>
      </ActionMenuTrigger>
      <ActionMenuContent>
        {Array.from({ length: 30 }, (_, index) => (
          <ActionMenuItem key={index} onSelect={() => {}}>
            항목 {index + 1}
          </ActionMenuItem>
        ))}
      </ActionMenuContent>
    </ActionMenu>
  ),
};
