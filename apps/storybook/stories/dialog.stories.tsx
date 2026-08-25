import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogCancel,
  DialogClose,
  DialogConfirm,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSurface,
  DialogTitle,
  type DialogVariant,
} from "@klipse-design/react";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
};
export default meta;

type Story = StoryObj<typeof Dialog>;

function Demo({
  variant,
  busy = false,
  dismissible = true,
  label,
}: {
  readonly variant: DialogVariant;
  readonly busy?: boolean;
  readonly dismissible?: boolean;
  readonly label: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog
        open={open}
        variant={variant}
        busy={busy}
        dismissible={dismissible}
        onOpenChange={(next) => setOpen(next)}
      >
        <DialogSurface>
          <DialogHeader>
            <div className="louis-dialog__heading">
              <DialogTitle>프로젝트를 삭제할까요?</DialogTitle>
              <DialogDescription>
                삭제하면 되돌릴 수 없습니다. 함께 업로드한 원본도 사라집니다.
              </DialogDescription>
            </div>
            <DialogClose label="닫기" />
          </DialogHeader>
          <DialogBody>
            <p style={{ margin: 0 }}>
              이 작업은 즉시 적용되며 복구 요청을 받지 않습니다.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogActions>
              <DialogCancel>취소</DialogCancel>
              <DialogConfirm closeOnActivate>삭제</DialogConfirm>
            </DialogActions>
          </DialogFooter>
        </DialogSurface>
      </Dialog>
    </>
  );
}

/** 되돌릴 수 있는 확인. backdrop 클릭으로 닫힌다. */
export const Confirm: Story = {
  render: () => <Demo variant="confirm" label="확인 열기" />,
};

/** 파괴적 결과. 초기 포커스가 취소이고 backdrop 클릭으로 닫히지 않는다. */
export const DangerConfirm: Story = {
  render: () => <Demo variant="danger-confirm" label="삭제 확인 열기" />,
};

/** 짧은 폼. 초기 포커스가 첫 필드다. */
export const Task: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          이름 바꾸기
        </Button>
        <Dialog open={open} variant="task" onOpenChange={setOpen}>
          <DialogSurface>
            <DialogHeader>
              <div className="louis-dialog__heading">
                <DialogTitle>프로젝트 이름</DialogTitle>
              </div>
              <DialogClose label="닫기" />
            </DialogHeader>
            <DialogBody>
              <label style={{ display: "grid", gap: 4 }}>
                이름
                <input defaultValue="여름 브이로그" />
              </label>
            </DialogBody>
            <DialogFooter>
              <DialogActions>
                <DialogCancel>취소</DialogCancel>
                <DialogConfirm closeOnActivate>저장</DialogConfirm>
              </DialogActions>
            </DialogFooter>
          </DialogSurface>
        </Dialog>
      </>
    );
  },
};

/** 진행 중. Escape와 확인이 차단되고 안내가 읽힌다. 취소는 살아 있다. */
export const Busy: Story = {
  render: () => <Demo variant="task" busy label="저장 중 열기" />,
};

/** 닫을 수 없는 Dialog. 닫기 버튼 자체가 렌더되지 않는다. */
export const NotDismissible: Story = {
  render: () => <Demo variant="task" dismissible={false} label="필수 확인 열기" />,
};
