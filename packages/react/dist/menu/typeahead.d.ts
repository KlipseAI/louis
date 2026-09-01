/**
 * 네이티브 `<select>`는 1000ms를 쓰지만 그 값의 근거를 이 저장소가 측정한 적이 없다.
 * 수동 screen-reader 리뷰 뒤 재검토한다.
 */
export declare const TYPEAHEAD_RESET_MS = 500;
export declare function isTypeaheadKey(event: KeyboardEvent): boolean;
export interface MenuTypeahead {
    isEmpty(): boolean;
    reset(): void;
    /** 다음 일치 항목. 없으면 null. */
    push(key: string, list: readonly HTMLElement[], from: number): HTMLElement | null;
}
export declare function createTypeahead(locale: string | undefined): MenuTypeahead;
//# sourceMappingURL=typeahead.d.ts.map