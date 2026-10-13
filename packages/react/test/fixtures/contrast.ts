// 작은 새 부품(asset-tile · color-swatch · logo-tile · notice-pill · canvas-guide) 시험이 함께 쓰는 대비 도구.
//
// 반투명 면이 겹겹이라 토큰 값만으로는 대비가 나오지 않는다 — 조상 면을 합성한 바탕 위에서 잉크의 계산 색을 잰다
// (prompt-variant 시험과 같은 방식).

export type Rgba = readonly [number, number, number, number];

export const px = (value: string): number => Number.parseFloat(value);

export function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/** 계산 색 문자열(`rgb()` · `rgba()` · `color(srgb …)`)을 0~255 채널 + 알파로 푼다. */
export function parseColor(value: string): Rgba {
  const srgb = /^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.e-]+))?\)$/.exec(value);
  if (srgb !== null) {
    return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] === undefined ? 1 : Number(srgb[4])];
  }
  const rgb = /^rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)$/.exec(value);
  if (rgb !== null) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] === undefined ? 1 : Number(rgb[4])];
  }
  throw new Error(`색을 풀지 못했습니다: ${value}`);
}

export const over = (top: Rgba, bottom: Rgba): Rgba => {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
};

/** 요소 뒤에 실제로 깔린 바탕 — `from` 부터 조상의 배경색을 위에서부터 합성한다(불투명을 만나면 멈춘다). */
export function backdrop(from: HTMLElement | null): Rgba {
  const layers: Rgba[] = [];
  for (let current = from; current !== null; current = current.parentElement) {
    const layer = parseColor(getComputedStyle(current).backgroundColor);
    if (layer[3] > 0) layers.push(layer);
    if (layer[3] >= 1) break;
  }
  return layers.reduceRight<Rgba>((bottom, top) => over(top, bottom), [255, 255, 255, 1]);
}

function luminance([r, g, b]: Rgba): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function ratio(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** 잉크 색(계산 문자열)을 바탕에 합성해 WCAG 대비를 낸다. */
export function contrastOn(ink: string, ground: Rgba): number {
  return ratio(over(parseColor(ink), ground), ground);
}

/** 요소의 글자색을 그 요소 자신부터 쌓인 바탕 위에서 잰다. */
export function textContrast(node: HTMLElement): number {
  return contrastOn(getComputedStyle(node).color, backdrop(node));
}

/** 토큰 하나의 계산 색 — 같은 문서 테마에서 탐침을 칠해 읽는다. */
export function tokenColor(token: string, property: "color" | "backgroundColor" = "color"): string {
  const probe = document.createElement("span");
  if (property === "color") probe.style.color = `var(--louis-${token})`;
  else probe.style.backgroundColor = `var(--louis-${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}
