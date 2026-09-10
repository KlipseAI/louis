"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";

export type ToastTone = "neutral" | "danger";

/**
 * 표면에 담기는 것이 달라지는 축. 크기 사다리가 아니다.
 *
 * `base` 는 한 줄 메시지, `callout` 은 제목/본문 두 줄과 그 옆의 액션이다. 제품 정본은
 * 캔버스 온보딩 힌트 두 벌(`CanvasConnectHint` · `CanvasNextStepHint`)이며, 표면 원장이
 * 뒤엣것을 「같은 CALLOUT 표면을 공유하고 문구만 다르다」로 이미 접어 두었다.
 */
export type ToastLayout = "base" | "callout";

/** callout 의 액션 슬롯. 라벨 하나와 그것을 누른 결과 하나다. */
export interface ToastAction {
  readonly label: string;
  readonly onAction: () => void;
  /** 누른 뒤 toast 를 닫는다. 온보딩 힌트의 「알겠어요」가 그렇다. */
  readonly dismissOnAction?: boolean;
}

export interface ToastInput {
  /** 한 줄. live region이 읽는 것이므로 문자열만 받는다. */
  readonly message: string;
  readonly tone?: ToastTone;
  /** 자동 소멸까지. 0이면 스스로 사라지지 않는다. */
  readonly duration?: number;
  /**
   * callout 의 제목. 있으면 `message` 가 본문이 된다.
   *
   * live region 이 읽는 순서가 DOM 순서이므로 제목이 먼저 읽힌다 — 두 줄을 따로 통지하지
   * 않는다.
   */
  readonly title?: string;
  /** callout 의 액션. */
  readonly action?: ToastAction;
  /**
   * 비우면 **내용에서 정한다** — 제목이나 액션이 있으면 `callout`, 없으면 `base`.
   *
   * 축을 명시로도 열어 두는 이유는 Figma 의 `Layout` variant 와 이름이 1:1로 맞아야 하기
   * 때문이다. 유추만 두면 계약이 대조할 타입이 없다.
   */
  readonly layout?: ToastLayout;
}

export interface ToastHandle {
  /** 이 toast를 지운다. 이미 사라졌으면 아무 일도 하지 않는다. */
  (): void;
}

export interface ToastContextValue {
  readonly toast: (input: ToastInput | string) => ToastHandle;
  /** 모두 지운다. 라우트 전환처럼 문맥이 바뀔 때 쓴다. */
  readonly dismissAll: () => void;
}

interface ToastRecord {
  readonly id: string;
  readonly message: string;
  readonly tone: ToastTone;
  readonly duration: number;
  readonly layout: ToastLayout;
  readonly title?: string;
  readonly action?: ToastAction;
}

/** 동시에 보이는 최대 개수. 초과분은 자리가 날 때까지 기다린다. */
export const TOAST_VISIBLE_LIMIT = 3;
const DEFAULT_DURATION = 4000;

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (value === null) {
    throw new Error(
      "useToast는 ToastProvider 안에서만 쓸 수 있습니다. 앱 최상단에 <ToastProvider>를 두십시오.",
    );
  }
  return value;
}

export interface ToastProviderProps {
  readonly children: ReactNode;
  /** 기본 자동 소멸 시간. 개별 toast가 덮어쓸 수 있다. */
  readonly duration?: number;
}

/**
 * design/components/toast.md의 계약을 구현한다.
 *
 * live region 둘을 **처음부터** 렌더한다. 보조 기술은 region이 존재한 뒤의 변화만 감지하므로,
 * toast가 생길 때 region을 함께 만들면 그 첫 메시지가 읽히지 않는다.
 *
 * polite와 assertive를 **별도 region**에 둔다. 하나의 region에서 `aria-live`를 바꾸면 그 시점의
 * 변경이 유실된다.
 */
export function ToastProvider({
  children,
  duration = DEFAULT_DURATION,
}: ToastProviderProps): JSX.Element {
  const [items, setItems] = useState<readonly ToastRecord[]>([]);
  const sequence = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput | string): ToastHandle => {
      const normalized: ToastInput =
        typeof input === "string" ? { message: input } : input;
      sequence.current += 1;
      const id = `louis-toast-${sequence.current}`;
      const derived: ToastLayout =
        normalized.title !== undefined || normalized.action !== undefined
          ? "callout"
          : "base";
      const record: ToastRecord = {
        id,
        message: normalized.message,
        tone: normalized.tone ?? "neutral",
        duration: normalized.duration ?? duration,
        layout: normalized.layout ?? derived,
        ...(normalized.title === undefined ? {} : { title: normalized.title }),
        ...(normalized.action === undefined ? {} : { action: normalized.action }),
      };
      // 최신이 뒤에 온다 — 시선이 마지막으로 머문 곳에 가장 새 소식이 온다.
      setItems((current) => [...current, record]);
      return () => dismiss(id);
    },
    [dismiss, duration],
  );

  const dismissAll = useCallback(() => setItems([]), []);
  const value = useMemo<ToastContextValue>(
    () => ({ toast, dismissAll }),
    [dismissAll, toast],
  );

  // 대기열의 앞에서부터 정해진 수만 렌더한다. 타이머는 렌더된 것만 돌기 때문에,
  // 대기 중인 toast는 자기 차례가 와야 소멸 시계가 시작된다.
  const visible = items.slice(0, TOAST_VISIBLE_LIMIT);
  const polite = visible.filter((item) => item.tone !== "danger");
  const assertive = visible.filter((item) => item.tone === "danger");

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="louis-toast-viewport" data-louis-toast-viewport="">
        <ToastRegion role="status" items={polite} onDismiss={dismiss} />
        <ToastRegion role="alert" items={assertive} onDismiss={dismiss} />
      </div>
    </ToastContext.Provider>
  );
}

function ToastRegion({
  role,
  items,
  onDismiss,
}: {
  readonly role: "status" | "alert";
  readonly items: readonly ToastRecord[];
  readonly onDismiss: (id: string) => void;
}): JSX.Element {
  return (
    <div
      role={role}
      // status는 polite, alert는 assertive가 암묵 기본이지만 명시한다 — 일부 보조 기술이
      // role만으로는 live 속성을 유추하지 않는다.
      aria-live={role === "alert" ? "assertive" : "polite"}
      className="louis-toast-region"
    >
      {items.map((item) => (
        <ToastItem key={item.id} record={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  record,
  onDismiss,
}: {
  readonly record: ToastRecord;
  readonly onDismiss: (id: string) => void;
}): JSX.Element {
  const [paused, setPaused] = useState(false);
  // 남은 시간을 들고 있는다. 다시 흐를 때 처음부터 세면 읽는 동안 얹어 둔 것이 벌이 된다.
  const remaining = useRef(record.duration);
  const startedAt = useRef<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (record.duration <= 0) return undefined;
    if (paused) return undefined;
    startedAt.current = Date.now();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      onDismiss(record.id);
    }, remaining.current);
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      if (startedAt.current !== null) {
        remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
        startedAt.current = null;
      }
    };
  }, [onDismiss, paused, record.duration, record.id]);

  const action = record.action;
  return (
    <div
      className="louis-toast"
      data-tone={record.tone}
      data-layout={record.layout}
      {...(paused ? { "data-louis-paused": "true" } : {})}
      // 읽는 중에 사라지면 알림이 아니다. 포인터와 focus 둘 다 멈춤 신호다.
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {record.layout === "callout" ? (
        <>
          <div className="louis-toast__content">
            {record.title === undefined ? null : (
              <p className="louis-toast__title">{record.title}</p>
            )}
            <p className="louis-toast__body">{record.message}</p>
          </div>
          {action === undefined ? null : (
            <button
              type="button"
              className="louis-toast__action"
              onClick={() => {
                action.onAction();
                // 기본은 닫는다. 온보딩 안내의 액션은 「봤다」이고, 누른 뒤에도 남아 있으면
                // 그 뜻이 전달되지 않는다.
                if (action.dismissOnAction !== false) onDismiss(record.id);
              }}
            >
              {action.label}
            </button>
          )}
        </>
      ) : (
        record.message
      )}
    </div>
  );
}
