/**
 * 인스턴스별 id 발급.
 *
 * dialog.md F10: 같은 화면에 두 인스턴스가 있어도 title/description/panel id가 겹치지 않아야
 * 한다. 고정 문자열 id는 두 번째 인스턴스에서 aria 참조를 첫 번째로 보낸다.
 */
export interface OverlayIds {
    readonly panel: string;
    readonly title: string;
    readonly description: string;
}
export declare function useOverlayIds(): OverlayIds;
//# sourceMappingURL=ids.d.ts.map