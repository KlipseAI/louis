// figma/components.measured.json 의 **comment-thread · comment-thread-form · comment-thread-item · comment-thread-empty** 값을 코드가
// 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-15 DS-D-0113). 기록의 필드를 클래스 마크업의 계산값과 맞댄다.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

test("comment-thread 의 네 기록이 레시피의 계산값과 같다", async () => {
  await page.viewport(1280, 800);
  await render(
    <section className="louis-comment-thread" style={{ inlineSize: 720 }}>
      <h2 className="louis-comment-thread__title" data-testid="title">
        댓글 1
      </h2>
      <form className="louis-comment-thread__form" data-testid="form">
        <div className="louis-text-field louis-comment-thread__name" data-testid="name">
          <div className="louis-text-field__box">
            <input className="louis-text-field__control" aria-label="이름" />
          </div>
        </div>
      </form>
      <ul className="louis-comment-thread__list">
        <li className="louis-comment-thread__item" data-testid="item">
          <div className="louis-comment-thread__item-head" data-testid="head">
            <span className="louis-comment-thread__author" data-testid="author">
              익명
            </span>
            <time className="louis-comment-thread__date" data-testid="date">
              2026.10.14
            </time>
            <button className="louis-bare-button louis-comment-thread__delete" type="button" data-testid="delete">
              삭제
            </button>
          </div>
          <p className="louis-comment-thread__content" data-testid="content">
            본문
          </p>
        </li>
        <li className="louis-comment-thread__empty" data-testid="empty">
          첫 댓글을 남겨보세요.
        </li>
      </ul>
    </section>,
  );
  const thread = measured.components["comment-thread"].sizes["base"] as Record<string, unknown>;
  expect(px(getComputedStyle(find("title")).marginBottom), "titleGap").toBe(thread.titleGap);
  expect(px(getComputedStyle(find("title")).fontSize), "titleFontSize").toBe(thread.titleFontSize);
  expect(px(getComputedStyle(find("form")).marginBottom), "formGap").toBe(thread.formGap);

  const form = measured.components["comment-thread-form"].sizes["base"] as Record<string, unknown>;
  const f = getComputedStyle(find("form"));
  expect(px(f.paddingTop), "padding").toBe(form.padding);
  expect(px(f.paddingLeft), "padding").toBe(form.padding);
  expect(px(f.borderTopWidth), "borderWidth").toBe(form.borderWidth);
  expect(px(f.rowGap), "gap").toBe(form.gap);
  expect(px(f.borderTopLeftRadius), "radius").toBe(form.radius);
  expect(find("name").getBoundingClientRect().width, "nameWidth").toBe(form.nameWidth);

  const item = measured.components["comment-thread-item"].sizes["base"] as Record<string, unknown>;
  const i = getComputedStyle(find("item"));
  expect(px(i.paddingTop), "paddingBlock").toBe(item.paddingBlock);
  expect(px(i.paddingBottom), "paddingBlock").toBe(item.paddingBlock);
  expect(px(i.borderTopWidth), "borderWidth").toBe(item.borderWidth);
  expect(px(getComputedStyle(find("head")).marginBottom), "headGap").toBe(item.headGap);
  expect(px(getComputedStyle(find("head")).columnGap), "metaGap").toBe(item.metaGap);
  expect(px(getComputedStyle(find("author")).fontSize), "authorFontSize").toBe(item.authorFontSize);
  expect(px(getComputedStyle(find("date")).fontSize), "dateFontSize").toBe(item.dateFontSize);
  expect(find("delete").getBoundingClientRect().height, "deleteHeight").toBe(item.deleteHeight);
  expect(px(getComputedStyle(find("delete")).paddingLeft), "deletePaddingInline").toBe(item.deletePaddingInline);
  expect(px(getComputedStyle(find("content")).fontSize), "contentFontSize").toBe(item.contentFontSize);

  const empty = measured.components["comment-thread-empty"].sizes["base"] as Record<string, unknown>;
  const e = getComputedStyle(find("empty"));
  expect(px(e.paddingTop), "paddingBlock").toBe(empty.paddingBlock);
  expect(px(e.borderTopWidth), "borderWidth").toBe(empty.borderWidth);
  expect(px(e.fontSize), "fontSize").toBe(empty.fontSize);
});
