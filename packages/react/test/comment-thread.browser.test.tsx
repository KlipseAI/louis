// Comment Thread(`.louis-comment-thread`)의 레시피가 실제로 그 픽셀을 만드는지 잰다(DS-D-0113).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/comment-thread.css 이고 마크업은
// design/components/comment-thread.md 의 예시 그대로다. 바닥은 랜딩 면(`landing-page-bg`)이다 — 블로그 글의 바닥.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px, textContrast } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

function Thread({ empty = false }: { readonly empty?: boolean }): JSX.Element {
  return (
    <div style={{ padding: 16, background: "var(--louis-color-landing-page-bg)", inlineSize: 760 }}>
      <section className="louis-comment-thread" aria-labelledby="ct" data-testid="thread">
        <h2 className="louis-comment-thread__title" id="ct" data-testid="title">
          댓글 1
        </h2>
        <form className="louis-comment-thread__form" data-testid="form">
          <div className="louis-text-field louis-comment-thread__name" data-testid="name">
            <label className="louis-text-field__label louis-visually-hidden" htmlFor="c-name">
              이름
            </label>
            <div className="louis-text-field__box" data-testid="name-box">
              <input className="louis-text-field__control" id="c-name" placeholder="이름 (비우면 익명)" />
            </div>
          </div>
          <div className="louis-text-field louis-comment-thread__body" data-multiline="true">
            <label className="louis-text-field__label louis-visually-hidden" htmlFor="c-body">
              댓글
            </label>
            <div className="louis-text-field__box">
              <textarea className="louis-text-field__control" id="c-body" rows={3} data-testid="body" />
            </div>
          </div>
          <div className="louis-comment-thread__form-foot" data-testid="foot">
            <button className="louis-button" data-variant="primary" type="submit" data-testid="submit">
              댓글 등록
            </button>
          </div>
        </form>
        <ul className="louis-comment-thread__list">
          {empty ? (
            <li className="louis-comment-thread__empty" data-testid="empty">
              첫 댓글을 남겨보세요.
            </li>
          ) : (
            <li className="louis-comment-thread__item" data-testid="item">
              <div className="louis-comment-thread__item-head" data-testid="head">
                <span className="louis-comment-thread__author" data-testid="author">
                  익명
                </span>
                <time className="louis-comment-thread__date" dateTime="2026-10-14" data-testid="date">
                  2026.10.14
                </time>
                <button className="louis-bare-button louis-comment-thread__delete" type="button" data-testid="delete">
                  삭제
                </button>
              </div>
              <p className="louis-comment-thread__content" data-testid="content">
                좋은 글 감사합니다.
              </p>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

test("폼 면은 안쪽 20 · 반경 16 · 사이 12 · 선 1 이고 이름은 240 · 40, 본문은 최소 96, 제출은 오른쪽이다", async () => {
  await page.viewport(1280, 800);
  await render(<Thread />);
  const form = getComputedStyle(find("form"));
  expect(px(form.paddingTop)).toBe(20);
  expect(px(form.borderTopLeftRadius)).toBe(16);
  expect(px(form.rowGap)).toBe(12);
  expect(px(form.borderTopWidth)).toBe(1);
  expect(find("name").getBoundingClientRect().width).toBe(240);
  expect(find("name-box").getBoundingClientRect().height).toBe(40);
  expect(find("body").getBoundingClientRect().height).toBeGreaterThanOrEqual(96);
  expect(getComputedStyle(find("body")).resize).toBe("vertical");
  expect(Math.abs(find("submit").getBoundingClientRect().right - find("foot").getBoundingClientRect().right)).toBeLessThan(1);
  expect(px(getComputedStyle(find("title")).marginBottom)).toBe(20);
  expect(px(form.marginBottom)).toBe(24);
});

test("댓글 줄은 위아래 16 · 머리 사이 8 · 아래 4 이고 삭제는 24 이상 · 오른쪽 끝이다", async () => {
  await page.viewport(1280, 800);
  await render(<Thread />);
  const item = getComputedStyle(find("item"));
  expect(px(item.paddingTop)).toBe(16);
  expect(px(item.borderTopWidth)).toBe(1);
  const head = getComputedStyle(find("head"));
  expect(px(head.columnGap)).toBe(8);
  expect(px(head.marginBottom)).toBe(4);
  const del = find("delete").getBoundingClientRect();
  expect(del.height).toBeGreaterThanOrEqual(24);
  expect(Math.abs(del.right - find("head").getBoundingClientRect().right)).toBeLessThan(1);
  expect(getComputedStyle(find("content")).whiteSpace).toBe("pre-wrap");
});

test("빈 줄은 위아래 24 · 가운데다", async () => {
  await page.viewport(1280, 800);
  await render(<Thread empty />);
  const empty = getComputedStyle(find("empty"));
  expect(px(empty.paddingTop)).toBe(24);
  expect(empty.textAlign).toBe("center");
});

test("두 테마에서 날짜 · 삭제 · 빈 줄 · 본문이 4.5:1 을 넘는다(랜딩 바닥 위)", async () => {
  await page.viewport(1280, 800);
  const measured: Record<string, number> = {};
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    let screen = await render(<Thread />);
    measured[`${theme}/date`] = textContrast(find("date"));
    measured[`${theme}/delete`] = textContrast(find("delete"));
    measured[`${theme}/content`] = textContrast(find("content"));
    measured[`${theme}/author`] = textContrast(find("author"));
    await screen.unmount();
    screen = await render(<Thread empty />);
    measured[`${theme}/empty`] = textContrast(find("empty"));
    await screen.unmount();
  }
  for (const [key, value] of Object.entries(measured)) expect(value, key).toBeGreaterThanOrEqual(4.5);
  // 실측(2026-10-15): 날짜 6.44 · 6.39, 삭제 6.08 · 7.82, 본문 6.69 · 10.13, 작성자 16.54 · 20.12, 빈 줄 6.44 · 6.39(라이트 · 다크).
});
