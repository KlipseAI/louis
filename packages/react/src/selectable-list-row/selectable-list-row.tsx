import type { ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";

export interface SelectableListRowProps
  // `title`은 HTML 전역 속성(툴팁)이라 이름이 겹친다. 행의 제목 쪽 뜻으로 덮어쓴다 —
  // TextField의 `prefix`와 같은 처리다.
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "aria-current" | "title"> {
  /** 선택 여부. `aria-current`가 되어 보조기술에도 함께 전달된다. */
  readonly selected?: boolean;
  /** 선행 슬롯. 썸네일이 들어가며 크기는 호출부가 정한다. */
  readonly media?: ReactNode;
  /** 제목 줄. 한 줄로 잘린다. */
  readonly title: ReactNode;
  /** 제목 아래 보조 문구. 한 줄로 잘린다. */
  readonly meta?: ReactNode;
  /**
   * 후행 슬롯. 시간·개수 같은 **짧은 값**이 들어간다.
   *
   * 버튼을 넣지 않는다 — 행 자체가 버튼이라 컨트롤이 중첩된다.
   */
  readonly trailing?: ReactNode;
  readonly className?: string;
  readonly ref?: Ref<HTMLButtonElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/selectable-list-row.md의 계약을 구현한다.
 *
 * master-detail의 좌측 열에서 **하나를 고르는** 행이다. 선택은 `aria-current`가 소유하고,
 * 면과 함께 선행 표식을 그린다 — 다크에서 `background-inset`이 `surface`와 같은 색이라 면 하나에
 * 기대면 표면 위에 놓인 목록에서 선택이 사라진다.
 *
 * **여럿을 고르는 목록은 이 컴포넌트가 아니다.** 그 경우 선택은 행이 아니라 Checkbox가 갖고,
 * 행을 버튼으로 만들면서 안에 체크박스를 넣으면 컨트롤이 중첩된다.
 */
export function SelectableListRow({
  selected = false,
  media,
  title,
  meta,
  trailing,
  className,
  ...rest
}: SelectableListRowProps): JSX.Element {
  return (
    <button
      {...rest}
      type="button"
      className={join("louis-selectable-list-row", className)}
      aria-current={selected ? "true" : undefined}
    >
      {media === undefined ? null : (
        <span className="louis-selectable-list-row__media">{media}</span>
      )}
      <span className="louis-selectable-list-row__text">
        <span className="louis-selectable-list-row__title">{title}</span>
        {meta === undefined ? null : (
          <span className="louis-selectable-list-row__meta">{meta}</span>
        )}
      </span>
      {trailing === undefined ? null : (
        <span className="louis-selectable-list-row__trailing">{trailing}</span>
      )}
    </button>
  );
}
