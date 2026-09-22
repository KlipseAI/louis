import type { ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";
export interface SelectableListRowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "aria-current" | "title"> {
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
/**
 * design/components/selectable-list-row.md의 계약을 구현한다.
 *
 * master-detail의 좌측 열에서 **하나를 고르는** 행이다. 선택은 `aria-current`가 소유하고,
 * 화면에는 면(`color-bg-inset`)과 전경으로 선다. 선행 표식은 없다(DS-D-0070) — 다크에서 선택 면이
 * 캔버스와 같은 값이므로 목록은 올라온 면 위에 둔다.
 *
 * **여럿을 고르는 목록은 이 컴포넌트가 아니다.** 그 경우 선택은 행이 아니라 Checkbox가 갖고,
 * 행을 버튼으로 만들면서 안에 체크박스를 넣으면 컨트롤이 중첩된다.
 */
export declare function SelectableListRow({ selected, media, title, meta, trailing, className, ...rest }: SelectableListRowProps): JSX.Element;
//# sourceMappingURL=selectable-list-row.d.ts.map