// figma/components.measured.json 의 **video-player-chip · video-player-volume** 값을 코드가 실제로 만드는지 검증한다.
//
// **왜 필요한가.** parity 게이트는 Figma 의 VideoPlayerChip · VideoPlayerVolume 이 기록과 같은지만 본다. 그래서
// 레시피가 조용히 바뀌면 **Figma 와 기록은 서로 맞고 둘 다 코드와 틀린** 상태로 통과한다. DS-D-0035 가 요구하는
// 반대 방향(기록 → 코드)이 이 파일이다.
//
// **React 표면이 없어 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/video-player.css 의 `__chip` ·
// `__volume` 이고(계약의 figmaAhead), 마크업은 design/components/video-player.md Anatomy 의 하단 줄 그대로다.
//
// **크기는 레이아웃 상자(offsetWidth · offsetHeight)로 잰다.** 칩의 눌림은 `transform: scale(0.94)` 라 화면 사각형은
// 줄지만 Figma 프레임이 대응하는 것은 변환 전의 상자다. 볼륨 패널은 흐름 밖(`inset-block-end: 100%`)이라 열려도
// 칸 크기가 그대로여야 한다 — Figma 가 패널을 outsideParts 로 프레임 밖에 두는 것과 같은 사실이다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/video-player.css";

type ChipKey = "Default" | "Hover" | "Active";
type VolumeKey = "Closed" | "Open" | "Muted";

const CHIP_KEYS: readonly ChipKey[] = ["Default", "Hover", "Active"];
const VOLUME_KEYS: readonly VolumeKey[] = ["Closed", "Open", "Muted"];

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (!(node instanceof HTMLElement)) throw new Error(`찾지 못했습니다: ${testId}`);
  return node;
}

function sizeOf(spec: Record<string, unknown>, key: string, label: string): number {
  const value = spec[key];
  if (typeof value !== "number") throw new Error(`${label}.${key}가 수가 아닙니다`);
  return value;
}

const chip = (state: ChipKey, key: string): number =>
  sizeOf(
    measured.components["video-player-chip"].sizes[state] as Record<string, unknown>,
    key,
    `video-player-chip.sizes.${state}`,
  );

const volume = (state: VolumeKey, key: string): number =>
  sizeOf(
    measured.components["video-player-volume"].sizes[state] as Record<string, unknown>,
    key,
    `video-player-volume.sizes.${state}`,
  );

function Glyph(): JSX.Element {
  return <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" />;
}

// 하단 줄 — 알약 → 볼륨 칸 → 확대 칩. 플레이어 폭은 노드 카드 한 칸(320 × 180) 표본이다.
function Player({ open = false, muted = false }: { readonly open?: boolean; readonly muted?: boolean }): JSX.Element {
  return (
    <div style={{ inlineSize: 320, blockSize: 180 }}>
      <div
        className="louis-video-player"
        style={{ ["--louis-video-player-volume" as string]: muted ? 0 : 60 }}
      >
        <div className="louis-video-player__bottom">
          <div className="louis-video-player__bar">
            <span className="louis-video-player__time">0:12</span>
            <div className="louis-video-player__scrubber" role="slider" aria-label="재생 위치" aria-valuenow={0}>
              <div className="louis-video-player__scrubber-track">
                <div className="louis-video-player__scrubber-fill" />
              </div>
              <div className="louis-video-player__scrubber-thumb" />
            </div>
            <span className="louis-video-player__time">-0:48</span>
          </div>
          <div className="louis-video-player__volume" data-open={open ? "true" : undefined} data-testid="volume">
            <button type="button" className="louis-video-player__chip" aria-label={muted ? "소리 켜기" : "음소거"}>
              <Glyph />
            </button>
            <div className="louis-video-player__volume-panel">
              <div className="louis-video-player__volume-surface" data-testid="volume-surface">
                <div className="louis-video-player__volume-slider" role="slider" aria-label="볼륨" aria-valuenow={muted ? 0 : 60}>
                  <div className="louis-video-player__volume-track">
                    <div className="louis-video-player__volume-fill" />
                  </div>
                  <div className="louis-video-player__volume-thumb" />
                </div>
              </div>
            </div>
          </div>
          <button type="button" className="louis-video-player__chip" aria-label="크게 보기" data-testid="chip">
            <Glyph />
          </button>
        </div>
      </div>
    </div>
  );
}

function expectChip(element: HTMLElement, state: ChipKey): void {
  expect(element.offsetWidth).toBe(chip(state, "size"));
  expect(element.offsetHeight).toBe(chip(state, "size"));
  expect(px(getComputedStyle(element).borderTopLeftRadius)).toBe(chip(state, "radius"));
}

for (const state of CHIP_KEYS) {
  test(`video-player 칩 ${state}: 크기 · 곡률이 VideoPlayerChip 기록과 같다`, async () => {
    await render(<Player />);
    const element = find("chip");
    if (state === "Hover") await userEvent.hover(element);
    expectChip(element, state);
  });
}

// 홀로 선 칩 — `data-standalone` 은 유리 · 잉크 · 흐림을 칩 자신에게 세울 뿐이라 기하가 플레이어 안의 칩과 같다.
// Figma 는 Standalone 축 두 값을 같은 키에 묶으므로 한쪽이 갈리면 되읽기 배열이 길어진다. 코드 쪽도 같은 기록으로 잰다.
test("video-player 홀로 선 칩: 플레이어 밖에서도 Default 기록과 같다", async () => {
  await render(
    <button type="button" className="louis-video-player__chip" data-standalone="true" aria-label="크게 보기" data-testid="standalone">
      <Glyph />
    </button>,
  );
  expectChip(find("standalone"), "Default");
});

for (const state of VOLUME_KEYS) {
  test(`video-player 볼륨 ${state}: 칸 크기가 VideoPlayerVolume 기록과 같다`, async () => {
    await render(<Player open={state === "Open"} muted={state === "Muted"} />);
    const element = find("volume");
    expect(element.offsetWidth).toBe(volume(state, "size"));
    expect(element.offsetHeight).toBe(volume(state, "size"));
    // 열림이면 패널이 칸 밖(위)으로 펼쳐져 있어야 한다 — 칸 크기가 그대로인 것이 흐름 밖이어서이지 패널이 닫혀서가 아님을 확인한다.
    const surface = find("volume-surface");
    if (state === "Open") {
      expect(surface.getBoundingClientRect().height).toBeGreaterThan(0);
      expect(surface.getBoundingClientRect().bottom).toBeLessThanOrEqual(element.getBoundingClientRect().top);
    } else {
      expect(surface.getBoundingClientRect().height).toBe(0);
    }
  });
}
