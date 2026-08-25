// design/components/toast.md의 Acceptance tests를 실제 브라우저에서 검증한다.
import type { JSX } from "react";
import { useRef } from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
  Button,
  TOAST_VISIBLE_LIMIT,
  ToastProvider,
  useToast,
  type ToastHandle,
  type ToastInput,
} from "@klipse-design/react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const toasts = (): HTMLElement[] => [...document.querySelectorAll(".louis-toast")] as HTMLElement[];
const region = (role: "status" | "alert"): HTMLElement | null =>
  document.querySelector(`.louis-toast-region[role="${role}"]`);

function Emitter({ inputs }: { inputs: readonly (ToastInput | string)[] }): JSX.Element {
  const { toast } = useToast();
  const handles = useRef<ToastHandle[]>([]);
  return (
    <>
      <Button
        onClick={() => {
          handles.current = inputs.map((input) => toast(input));
        }}
      >
        띄우기
      </Button>
      <Button
        data-testid="dismiss-first"
        onClick={() => {
          handles.current[0]?.();
        }}
      >
        첫 번째 지우기
      </Button>
    </>
  );
}

const fire = async (): Promise<void> => {
  const button = [...document.querySelectorAll("button.louis-button")][0] as HTMLButtonElement;
  await userEvent.click(button);
};

test("toast를 부르면 메시지가 나타난다", async () => {
  await render(
    <ToastProvider>
      <Emitter inputs={["저장했습니다"]} />
    </ToastProvider>,
  );
  expect(toasts()).toHaveLength(0);
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(1);
  });
  expect(toasts()[0]?.textContent).toBe("저장했습니다");
});

test("duration이 지나면 스스로 사라진다", async () => {
  await render(
    <ToastProvider>
      <Emitter inputs={[{ message: "잠깐", duration: 80 }]} />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(1);
  });
  await vi.waitFor(
    () => {
      expect(toasts()).toHaveLength(0);
    },
    { timeout: 2000 },
  );
});

test("duration 0이면 사라지지 않는다", async () => {
  await render(
    <ToastProvider>
      <Emitter inputs={[{ message: "계속", duration: 0 }]} />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(1);
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(toasts()).toHaveLength(1);
});

test("반환된 함수를 부르면 사라진다", async () => {
  await render(
    <ToastProvider>
      <Emitter inputs={[{ message: "지울 것", duration: 0 }]} />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(1);
  });
  const dismiss = document.querySelector('[data-testid="dismiss-first"]') as HTMLButtonElement;
  await userEvent.click(dismiss);
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(0);
  });
});

test("포인터를 얹으면 타이머가 멈추고 떠나면 다시 흐른다", async () => {
  await render(
    <ToastProvider>
      <Emitter inputs={[{ message: "읽는 중", duration: 700 }]} />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(1);
  });
  const node = toasts()[0];
  if (node === undefined) throw new Error("toast가 없습니다");

  await userEvent.hover(node);
  expect(node.getAttribute("data-louis-paused")).toBe("true");
  // duration을 훌쩍 넘겨도 얹혀 있는 동안에는 사라지지 않는다.
  await new Promise((resolve) => setTimeout(resolve, 1200));
  expect(toasts()).toHaveLength(1);

  await userEvent.unhover(node);
  await vi.waitFor(
    () => {
      expect(toasts()).toHaveLength(0);
    },
    { timeout: 2000 },
  );
});

test("동시 표시가 상한을 넘지 않고 초과분은 자리가 나면 들어온다", async () => {
  const many = Array.from({ length: TOAST_VISIBLE_LIMIT + 2 }, (_, index) => ({
    message: `알림 ${index + 1}`,
    duration: 0,
  }));
  await render(
    <ToastProvider>
      <Emitter inputs={many} />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(TOAST_VISIBLE_LIMIT);
  });
  // 앞에서부터 보인다.
  expect(toasts().map((node) => node.textContent)).toEqual(["알림 1", "알림 2", "알림 3"]);

  // **보이는** 것을 지워야 자리가 난다. 대기 중인 것을 지우면 표시는 그대로다.
  const dismiss = document.querySelector('[data-testid="dismiss-first"]') as HTMLButtonElement;
  await userEvent.click(dismiss);
  await vi.waitFor(() => {
    expect(toasts().map((node) => node.textContent)).toContain("알림 4");
  });
  expect(toasts()).toHaveLength(TOAST_VISIBLE_LIMIT);
});

test("tone에 따라 status와 alert region으로 갈린다", async () => {
  await render(
    <ToastProvider>
      <Emitter
        inputs={[
          { message: "보통", duration: 0 },
          { message: "실패", tone: "danger", duration: 0 },
        ]}
      />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(2);
  });
  expect(region("status")?.textContent).toBe("보통");
  expect(region("alert")?.textContent).toBe("실패");
  expect(region("status")?.getAttribute("aria-live")).toBe("polite");
  expect(region("alert")?.getAttribute("aria-live")).toBe("assertive");
});

test("두 region이 toast 없이도 처음부터 DOM에 있다", async () => {
  // 보조 기술은 region이 존재한 뒤의 변화만 감지한다. 나중에 만들면 첫 메시지가 읽히지 않는다.
  await render(
    <ToastProvider>
      <Emitter inputs={["나중"]} />
    </ToastProvider>,
  );
  expect(toasts()).toHaveLength(0);
  expect(region("status")).not.toBeNull();
  expect(region("alert")).not.toBeNull();
});

test("toast가 focus를 가져가지 않는다", async () => {
  await render(
    <ToastProvider>
      <Emitter inputs={[{ message: "알림", duration: 0 }]} />
    </ToastProvider>,
  );
  const trigger = [...document.querySelectorAll("button.louis-button")][0] as HTMLButtonElement;
  await userEvent.click(trigger);
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(1);
  });
  expect(document.activeElement).toBe(trigger);
});

test("최신 toast가 목록의 마지막에 온다", async () => {
  await render(
    <ToastProvider>
      <Emitter
        inputs={[
          { message: "먼저", duration: 0 },
          { message: "나중", duration: 0 },
        ]}
      />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(2);
  });
  expect(toasts().at(-1)?.textContent).toBe("나중");
});

test("빈 viewport가 아래 컨트롤의 포인터를 가로채지 않는다", async () => {
  // viewport는 toast가 없어도 화면 하단에 고정돼 있다. 투명한 판이 되면 그 아래가 눌리지 않는다.
  await render(
    <ToastProvider>
      <Emitter inputs={["x"]} />
    </ToastProvider>,
  );
  const viewport = document.querySelector(".louis-toast-viewport");
  if (viewport === null) throw new Error("viewport가 없습니다");
  expect(getComputedStyle(viewport).pointerEvents).toBe("none");
});

test("Provider 없이 useToast를 쓰면 명확한 오류를 던진다", async () => {
  function Bare(): JSX.Element {
    useToast();
    return <span />;
  }
  // React가 렌더 오류를 콘솔에 찍는다. 테스트 출력만 조용히 한다.
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    await expect(render(<Bare />)).rejects.toThrow(/ToastProvider/);
  } finally {
    spy.mockRestore();
  }
});

test("Specification 표의 값이 실제 계산값과 같다", async () => {
  // Tooltip에서 간격이 0으로 붙어 있었는데 11개 테스트가 모두 통과했다. 동작만 재면 명세 위반이
  // 조용히 지나간다. 여기서는 명세가 지정한 토큰을 계산값과 직접 맞댄다.
  await render(
    <ToastProvider>
      <Emitter
        inputs={[
          { message: "첫째", duration: 0 },
          { message: "둘째", duration: 0 },
        ]}
      />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(2);
  });

  const root = getComputedStyle(document.documentElement);
  const token = (name: string): string => root.getPropertyValue(`--louis-${name}`).trim();

  const viewport = document.querySelector(".louis-toast-viewport") as HTMLElement;
  const viewportStyle = getComputedStyle(viewport);
  expect(viewportStyle.position).toBe("fixed");
  expect(viewportStyle.bottom).toBe(token("space-layout-section"));
  expect(viewportStyle.rowGap).toBe(token("space-control-sm"));
  expect(viewportStyle.zIndex).toBe(token("layer-critical"));

  const node = toasts()[0];
  if (node === undefined) throw new Error("toast가 없습니다");
  const style = getComputedStyle(node);
  expect(style.borderRadius).toBe(token("radius-overlay"));
  expect(style.paddingTop).toBe(token("space-control-md"));
  expect(style.paddingLeft).toBe(token("space-toast-inline"));
  expect(style.maxWidth).toBe("420px");
  expect(style.fontSize).toBe(token("typography-body-sm-regular-font-size"));

  // 색은 토큰이 소유한다. 같은 var를 다른 요소에서 계산해 비교하면 리터럴을 적어 넣을 필요가 없다.
  const probe = document.createElement("div");
  probe.style.background = "var(--louis-color-bg-inverse-translucent)";
  probe.style.color = "var(--louis-color-fg-on-inverse)";
  document.body.append(probe);
  const expected = getComputedStyle(probe);
  const wantBackground = expected.backgroundColor;
  const wantColor = expected.color;
  probe.remove();
  expect(style.backgroundColor).toBe(wantBackground);
  expect(style.color).toBe(wantColor);

  // 실제로 화면 안에 있고 두 개가 세로로 8px 간격으로 쌓인다.
  const [first, second] = toasts();
  if (first === undefined || second === undefined) throw new Error("toast가 둘이 아닙니다");
  const gap = second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
  expect(Math.round(gap)).toBe(Math.round(Number.parseFloat(token("space-control-sm"))));
});

test("danger tone이 status-danger 토큰을 쓴다", async () => {
  await render(
    <ToastProvider>
      <Emitter inputs={[{ message: "실패", tone: "danger", duration: 0 }]} />
    </ToastProvider>,
  );
  await fire();
  await vi.waitFor(() => {
    expect(toasts()).toHaveLength(1);
  });
  const node = toasts()[0];
  if (node === undefined) throw new Error("toast가 없습니다");
  const probe = document.createElement("div");
  probe.style.background = "var(--louis-color-bg-danger)";
  probe.style.color = "var(--louis-color-fg-danger)";
  document.body.append(probe);
  const expected = getComputedStyle(probe);
  const wantBackground = expected.backgroundColor;
  const wantColor = expected.color;
  probe.remove();
  const style = getComputedStyle(node);
  expect(style.backgroundColor).toBe(wantBackground);
  expect(style.color).toBe(wantColor);
});

export type _EnsureTsx = JSX.Element;
