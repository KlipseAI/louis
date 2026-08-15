import { itemLabel } from "./roving.js";

/**
 * 접두 검색 버퍼와 IME 가드.
 *
 * 한국어에 대한 정직한 입장을 먼저 적는다. 비편집 요소에서 IME가 켜져 있으면 keydown의 `key`가
 * 완성 음절로 오지 않는다. 그래서 v1은 **조합 중 오작동만 막고** 매칭은 `compositionend`가
 * 실제로 도착하는 환경에서만 시도한다. 조합이 시작조차 되지 않는 환경에서는 자동으로
 * no-op으로 퇴화한다 — 잘못 매칭해서 엉뚱한 항목으로 뛰는 것보다 아무것도 안 하는 편이 낫다.
 */

/**
 * 한글 **낱자모** 전 영역. 완성형 음절(AC00–D7A3)은 여기 없다.
 *
 * 메뉴 라벨은 완성형이므로 낱자모는 어떤 경로로 들어와도 질의가 될 수 없다. IME 없이
 * `new KeyboardEvent("keydown", { key: "ㅅ" })` 하나로 검증되는 가드라는 점이 중요하다.
 */
const LONE_JAMO = /^[ᄀ-ᇿ㄰-㆏ꥠ-꥿ힰ-퟿]$/u;

/**
 * 네이티브 `<select>`는 1000ms를 쓰지만 그 값의 근거를 이 저장소가 측정한 적이 없다.
 * 수동 screen-reader 리뷰 뒤 재검토한다.
 */
export const TYPEAHEAD_RESET_MS = 500;

export function isTypeaheadKey(event: KeyboardEvent): boolean {
  if (event.isComposing || event.keyCode === 229) return false;
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  // "Process"·"ArrowDown" 같은 이름 키가 여기서 걸린다.
  if (Array.from(event.key).length !== 1) return false;
  if (LONE_JAMO.test(event.key)) return false;
  return true;
}

export interface MenuTypeahead {
  isEmpty(): boolean;
  reset(): void;
  /** 다음 일치 항목. 없으면 null. */
  push(
    key: string,
    list: readonly HTMLElement[],
    from: number,
  ): HTMLElement | null;
}

export function createTypeahead(locale: string | undefined): MenuTypeahead {
  const collator = new Intl.Collator(locale, {
    sensitivity: "base",
    usage: "search",
  });
  let buffer = "";
  let timer = 0;

  /**
   * `slice()`를 코드 단위로 쓰지 않는다. 선두 이모지에서 대리 쌍이 쪼개져 비교가 무의미해진다.
   * NFC로 정규화한 뒤 코드포인트 단위로 자른다.
   *
   * 초성 검색은 `sensitivity` 설정으로 얻어지지 않는다 — Collator는 한글을 자모로 분해하지 않는다.
   */
  const matches = (element: HTMLElement, query: readonly string[]): boolean => {
    const label = Array.from(itemLabel(element).normalize("NFC"));
    if (label.length < query.length) return false;
    return collator.compare(label.slice(0, query.length).join(""), query.join("")) === 0;
  };

  return {
    isEmpty: () => buffer === "",
    reset() {
      window.clearTimeout(timer);
      buffer = "";
    },
    push(key, list, from) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        buffer = "";
      }, TYPEAHEAD_RESET_MS);
      // 같은 문자를 반복하면 질의를 늘리지 않고 같은 머리글자 항목들을 순회한다.
      buffer = buffer === key ? key : buffer + key;
      const query = Array.from(buffer.normalize("NFC"));
      for (let step = 1; step <= list.length; step += 1) {
        const candidate = list[(from + step + list.length) % list.length];
        if (candidate !== undefined && matches(candidate, query)) return candidate;
      }
      return null;
    },
  };
}
