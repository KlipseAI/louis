import type { ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";
export interface DropZoneProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type" | "onDrop" | "onDragOver" | "onDragEnter" | "onDragLeave"> {
    /** 무엇을 올리는지 한 문장. 면의 접근성 이름이 된다 — "긴 영상을 올리세요". */
    readonly prompt: ReactNode;
    /** 올리기 전에 알아야 할 조건(보존 기간 · 용량 · 형식). 없어도 된다. */
    readonly caption?: ReactNode;
    /** 56px 글리프. **선택이다** — 안내 문구가 이미 말하는 것을 반복하는 장식이라 보조기술에서 숨긴다. */
    readonly graphic?: ReactNode;
    /** 받을 형식. `input[type=file]` 의 `accept` 와 같다 — `"video/*"`. */
    readonly accept?: string;
    /** 여러 파일을 한 번에 받는가. 기본은 하나다. */
    readonly multiple?: boolean;
    /**
     * 파일을 받았을 때. 선택 창과 끌어다 놓기가 **같은 콜백**으로 온다 — 호출부가 두 경로를 따로 다루지 않게 한다.
     *
     * 끌어다 놓은 파일은 `accept` 로 거르지 않는다. 브라우저가 선택 창에서만 `accept` 를 적용하므로, 형식 검사는
     * 받은 쪽이 한 곳에서 한다(선택 창이 거른 것도 다시 볼 수 있다).
     */
    readonly onFiles: (files: readonly File[]) => void;
    readonly ref?: Ref<HTMLButtonElement>;
}
/**
 * design/components/drop-zone.md 의 계약을 구현한다.
 *
 * **면은 버튼이다.** 누르거나 Enter · Space 로 숨긴 파일 입력을 연다 — 제품의 업로드 면도 그렇게 동작한다.
 * 끌어다 놓기는 제품에 없던 것을 이 컴포넌트가 더한다. 끌어다 놓기만으로는 키보드 사용자가 닿지 못하므로
 * 버튼이 늘 먼저다.
 *
 * `dragenter` · `dragleave` 는 자식 요소를 지날 때마다 짝을 이뤄 쏟아진다. 깊이를 세어 마지막으로 나갈 때만
 * 상태를 푼다 — 그렇지 않으면 안내 글자 위를 지나는 순간 면이 깜빡인다.
 */
export declare function DropZone({ prompt, caption, graphic, accept, multiple, onFiles, disabled, className, onClick, ref, ...rest }: DropZoneProps): JSX.Element;
//# sourceMappingURL=drop-zone.d.ts.map