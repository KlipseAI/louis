// figma/components.measured.json 의 **노드 캔버스 하위 부품 다섯**(node-count-row · node-response · node-media ·
// node-channel · node-resize-handle) 기록을 코드가 실제로 만드는지 잰다(DS-D-0035).
//
// parity 게이트는 Figma 의 NodeCountRow · NodeResponse · NodeMedia · NodeChannel · NodeResizeHandle 이 기록과 같은지만 본다.
// 레시피가 조용히 바뀌면 Figma 와 기록은 서로 맞고 둘 다 코드와 틀린 채로 통과한다 — 이 파일이 그 틈이다. React 표면이
// 없어 정본 packages/css/src/component/node-shell.css 의 클래스 마크업(design/components/node-shell.md Anatomy)을 렌더한다.
//
// **응답 칸 · 미디어 칸 · 손잡이는 노드 셸 카드 안에 렌더한다.** 응답 칸과 미디어 칸의 폭은 자기 선언이 아니라 카드
// 안쪽 폭(셸 400 − 테두리 2 × 2)을 받은 결과이고, 손잡이는 카드를 기준 상자로 선다. 기록의 396 은 그 결과를 적은 수라
// 시험이 규칙(띠 폭 = 카드 안쪽 폭)도 함께 잰다 — 셸 폭이 움직이면 여기가 먼저 빨개진다.
//
// 기록의 키는 Figma 되읽기 geometry 의 키(변형 이름)와 같다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/node-shell.css";
import "../../css/src/component/node-chrome-button.css";

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/** `sizes` 한 칸. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function sizeOf(spec: unknown, label: string, field: string): number {
  const value = (spec as Record<string, unknown>)[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

/** 노드 셸 카드 한 벌. 부품은 카드의 자식으로 선다(문서 Anatomy). */
function Card({ id, children }: { id: string; children: JSX.Element }): JSX.Element {
  return (
    <div className="louis-node-shell" data-accent="text">
      <div className="louis-node-shell__card" data-testid={`${id}-card`}>
        {children}
      </div>
    </div>
  );
}

// ── 복사 · 글자 수 줄 ─────────────────────────────────────────────────────────

test("node-count-row row: 높이 · 간격 · 방향이 NodeCountRow 기록과 같다", async () => {
  const spec = measured.components["node-count-row"].sizes["row"];
  const field = (name: string): number => sizeOf(spec, "node-count-row.row", name);
  // `flex: 0 0 28` 이 걸리는 자리(응답 칸 · 입력칸 위의 세로 흐름)에 세운다.
  await render(
    <div style={{ display: "flex", flexDirection: "column", inlineSize: 380 }}>
      <div className="louis-node-shell__count-row" data-testid="count-row">
        <button type="button" className="louis-node-chrome-button" data-size="sm" aria-label="프롬프트 복사">
          <span className="louis-node-chrome-button__glyph" />
        </button>
        <span className="louis-node-shell__count">312자</span>
      </div>
    </div>,
  );
  const row = find("count-row");
  const style = getComputedStyle(row);
  expect(row.getBoundingClientRect().height).toBe(field("height"));
  expect(px(style.minHeight)).toBe(field("height"));
  expect(px(style.columnGap)).toBe(field("gap"));
  expect(style.display).toBe("flex");
  expect(style.flexDirection).toBe("row");
});

// ── 응답 칸 ───────────────────────────────────────────────────────────────────

type ResponseKey = "empty" | "generating" | "filled" | "error";

function Response({ state }: { state: ResponseKey }): JSX.Element {
  const id = `response-${state}`;
  return (
    <Card id={id}>
      <div
        className="louis-node-shell__response"
        data-state={state === "empty" ? undefined : state}
        tabIndex={-1}
        data-testid={id}
      >
        {state === "generating" ? (
          <div className="louis-node-shell__response-status" role="status">
            <svg className="louis-node-shell__response-icon" viewBox="0 0 16 16" aria-hidden="true" />
            <span className="louis-loading-word louis-node-shell__response-caption">프롬프트를 쓰는 중</span>
          </div>
        ) : state === "filled" ? (
          <>
            <div className="louis-node-shell__response-scroll">
              <p className="louis-node-shell__response-text">해 질 녘 옥상, 역광 속 실루엣</p>
            </div>
            <div className="louis-node-shell__count-row">
              <button type="button" className="louis-node-chrome-button" data-size="sm" aria-label="프롬프트 복사">
                <span className="louis-node-chrome-button__glyph" />
              </button>
              <span className="louis-node-shell__count">16자</span>
            </div>
          </>
        ) : state === "error" ? (
          <p className="louis-node-shell__response-text">생성하지 못했습니다.</p>
        ) : (
          <div className="louis-node-shell__response-empty">
            <svg className="louis-node-shell__response-icon" viewBox="0 0 16 16" aria-hidden="true" />
            <span>생성한 프롬프트가 여기에 표시됩니다.</span>
          </div>
        )}
      </div>
    </Card>
  );
}

const RESPONSE_KEYS: readonly ResponseKey[] = ["empty", "generating", "filled", "error"];

for (const key of RESPONSE_KEYS) {
  test(`node-response ${key}: 띠 폭 · 높이 · 정사각 · 방향이 NodeResponse 기록과 같다`, async () => {
    const spec = measured.components["node-response"].sizes[key];
    const field = (name: string): number => sizeOf(spec, `node-response.${key}`, name);
    await render(<Response state={key} />);
    const node = find(`response-${key}`);
    const card = find(`response-${key}-card`);
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    // 칸 자신은 정사각이다(`aspect-ratio: 1`).
    expect(rect.width).toBe(field("side"));
    expect(rect.height).toBe(field("side"));
    // 띠 = 칸 + 바깥 여백. Figma 루트 프레임이 이 상자다.
    const bandWidth = rect.width + px(style.marginLeft) + px(style.marginRight);
    const bandHeight = rect.height + px(style.marginTop) + px(style.marginBottom);
    expect(bandWidth).toBe(field("width"));
    expect(bandHeight).toBe(field("height"));
    // 규칙 — 띠 폭은 카드 안쪽 폭이고, 칸 하나만 둔 카드의 안쪽 높이가 띠 높이다.
    expect(card.clientWidth).toBe(field("width"));
    expect(card.clientHeight).toBe(field("height"));
    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
  });
}

// ── 미디어 칸 ─────────────────────────────────────────────────────────────────

type MediaKey = "Empty" | "Result";

function Media({ state }: { state: MediaKey }): JSX.Element {
  const id = `media-${state}`;
  return (
    <Card id={id}>
      {state === "Empty" ? (
        <div className="louis-node-shell__media" data-empty="" style={{ aspectRatio: "16 / 9" }} data-testid={id}>
          <div className="louis-node-shell__media-empty">
            <svg viewBox="0 0 16 16" aria-hidden="true" />
            <span>생성한 영상이 여기에 표시됩니다.</span>
          </div>
        </div>
      ) : (
        <div className="louis-node-shell__media" data-state="result" style={{ aspectRatio: "1 / 1" }} data-testid={id}>
          <div />
        </div>
      )}
    </Card>
  );
}

const MEDIA_KEYS: readonly MediaKey[] = ["Empty", "Result"];

for (const key of MEDIA_KEYS) {
  test(`node-media ${key}: 폭 · 방향이 NodeMedia 기록과 같다`, async () => {
    const spec = measured.components["node-media"].sizes[key];
    const field = (name: string): number => sizeOf(spec, `node-media.${key}`, name);
    await render(<Media state={key} />);
    const node = find(`media-${key}`);
    const style = getComputedStyle(node);
    expect(node.getBoundingClientRect().width).toBe(field("width"));
    // 규칙 — 폭은 `inline-size: 100%` 가 받은 카드 안쪽 폭이다.
    expect(find(`media-${key}-card`).clientWidth).toBe(field("width"));
    // 높이는 기록에 없다 — 소비처의 인라인 비율(데이터)이 정한다.
    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("row");
  });
}

// ── 채널 줄 ───────────────────────────────────────────────────────────────────

type ChannelKey = "md" | "sm";

const CHANNEL_KEYS: readonly ChannelKey[] = ["md", "sm"];

for (const key of CHANNEL_KEYS) {
  test(`node-channel ${key}: 높이 · 여백 · 간격 · 아바타 · 방향이 NodeChannel 기록과 같다`, async () => {
    const spec = measured.components["node-channel"].sizes[key];
    const field = (name: string): number => sizeOf(spec, `node-channel.${key}`, name);
    await render(
      <div style={{ inlineSize: 396 }}>
        <div
          className="louis-node-shell__channel"
          data-size={key === "md" ? undefined : key}
          data-testid={`channel-${key}`}
        >
          <span className="louis-node-shell__channel-avatar" data-testid={`channel-${key}-avatar`}>
            <svg viewBox="0 0 16 16" aria-hidden="true" />
          </span>
          <span className="louis-node-shell__channel-name">Klipse Studio</span>
        </div>
      </div>,
    );
    const node = find(`channel-${key}`);
    const style = getComputedStyle(node);
    expect(node.getBoundingClientRect().height).toBe(field("height"));
    expect(px(style.paddingTop)).toBe(field("paddingBlockStart"));
    expect(px(style.paddingBottom)).toBe(field("paddingBlockEnd"));
    expect(px(style.paddingLeft)).toBe(field("paddingInline"));
    expect(px(style.paddingRight)).toBe(field("paddingInline"));
    expect(px(style.columnGap)).toBe(field("gap"));
    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("row");
    const avatar = find(`channel-${key}-avatar`).getBoundingClientRect();
    expect(avatar.width).toBe(field("avatarSize"));
    expect(avatar.height).toBe(field("avatarSize"));
  });
}

// ── 크기 손잡이 ───────────────────────────────────────────────────────────────

type ResizeKey = "Rest" | "Hover";

const RESIZE_KEYS: readonly ResizeKey[] = ["Rest", "Hover"];

for (const key of RESIZE_KEYS) {
  test(`node-resize-handle ${key}: 높이 · 좌우 여백 · 방향이 NodeResizeHandle 기록과 같다`, async () => {
    const spec = measured.components["node-resize-handle"].sizes[key];
    const field = (name: string): number => sizeOf(spec, `node-resize-handle.${key}`, name);
    const id = `resize-${key}`;
    // Hover 는 CSS :hover 와 같은 그림인 `data-louis-state="active"` 로 세운다 — 기하는 상태와 무관해야 한다.
    await render(
      <Card id={id}>
        <>
          <div style={{ blockSize: 120 }} />
          <div
            className="louis-node-shell__resize"
            role="separator"
            aria-orientation="horizontal"
            aria-label="드래그하여 크기 조절"
            data-louis-state={key === "Hover" ? "active" : undefined}
            data-testid={id}
          >
            <span className="louis-node-shell__resize-label" aria-hidden="true">
              드래그하여 크기 조절
            </span>
          </div>
        </>
      </Card>,
    );
    const node = find(id);
    const style = getComputedStyle(node);
    expect(node.getBoundingClientRect().height).toBe(field("height"));
    expect(px(style.paddingLeft)).toBe(field("paddingInline"));
    expect(px(style.paddingRight)).toBe(field("paddingInline"));
    // 선언은 `inline-flex` 이지만 절대 배치가 블록화해 계산값은 `flex` 다 — 어느 쪽이든 가로 흐름이다.
    expect(["flex", "inline-flex"]).toContain(style.display);
    expect(style.flexDirection).toBe("row");
    // 손잡이는 카드 바닥선에 가운데를 걸친다 — 카드가 기준 상자다(`:has(> __resize)`).
    expect(getComputedStyle(find(`${id}-card`)).position).toBe("relative");
  });
}
