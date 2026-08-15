import type { JSX } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ToastProvider, useToast } from "@klipse-design/react";

const meta: Meta<typeof ToastProvider> = {
  title: "Components/Toast",
  component: ToastProvider,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof ToastProvider>;

function Trigger({
  children,
  ...input
}: {
  children: string;
  message: string;
  tone?: "neutral" | "danger";
  duration?: number;
}): JSX.Element {
  const { toast } = useToast();
  return (
    <Button variant="secondary" onClick={() => toast(input)}>
      {children}
    </Button>
  );
}

export const Playground: Story = {
  render: () => (
    <ToastProvider>
      <Trigger message="저장했습니다">저장</Trigger>
    </ToastProvider>
  ),
};

/**
 * `tone` 둘뿐이다. 성공을 따로 두지 않는다 — toast가 떴다는 사실 자체가 이미 "그 일이 일어났다"다.
 * `danger`는 `role="alert"` region으로 가서 즉시 읽힌다.
 */
export const Tones: Story = {
  render: () => (
    <ToastProvider>
      <div style={{ display: "flex", gap: 12 }}>
        <Trigger message="3개 항목을 지웠습니다">neutral</Trigger>
        <Trigger message="저장하지 못했습니다" tone="danger">
          danger
        </Trigger>
      </div>
    </ToastProvider>
  ),
};

/**
 * **포인터를 얹으면 타이머가 멈춘다.** 떠나면 남은 시간부터 다시 흐른다 — 처음부터 다시 세면
 * 읽으려고 얹어 둔 것이 벌이 된다.
 */
export const PauseOnHover: Story = {
  render: () => (
    <ToastProvider>
      <Trigger message="포인터를 얹어 보십시오. 4초가 멈춥니다" duration={4000}>
        띄우기
      </Trigger>
    </ToastProvider>
  ),
};

/** 동시에 최대 3개다. 초과분은 대기했다가 자리가 나면 들어오며, 그때 소멸 시계가 시작된다. */
export const Stacking: Story = {
  render: () => (
    <ToastProvider>
      <div style={{ display: "flex", gap: 12 }}>
        <Trigger message="내보내기가 끝났습니다" duration={2500}>
          하나씩
        </Trigger>
        <StackAll />
      </div>
    </ToastProvider>
  ),
};

function StackAll(): JSX.Element {
  const { toast } = useToast();
  return (
    <Button
      onClick={() => {
        for (let index = 1; index <= 5; index += 1) {
          toast({ message: `알림 ${index}`, duration: 2500 });
        }
      }}
    >
      5개 한꺼번에
    </Button>
  );
}

/** `duration: 0`이면 스스로 사라지지 않는다. 반환된 함수로만 지운다. */
export const Persistent: Story = {
  render: () => (
    <ToastProvider>
      <PersistentDemo />
    </ToastProvider>
  ),
};

function PersistentDemo(): JSX.Element {
  const { toast, dismissAll } = useToast();
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Button
        variant="secondary"
        onClick={() => toast({ message: "사라지지 않습니다", duration: 0 })}
      >
        띄우기
      </Button>
      <Button variant="secondary" onClick={dismissAll}>
        모두 지우기
      </Button>
    </div>
  );
}
