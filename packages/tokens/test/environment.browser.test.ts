// 테스트 환경이 실제 브라우저인지 강제한다.
// DS-D-0005는 jsdom·happy-dom을 배제한다 — 두 환경은 레이아웃과 HTMLDialogElement를 구현하지 않아
// Dialog의 modal/non-modal 구분 테스트를 구현과 무관하게 통과시킨다.
// 여기서 실패하면 누군가 환경을 조용히 되돌린 것이므로, 해당 컴포넌트 surface 상태도 함께 되돌려야 한다.
import { expect, test } from "vitest";

test("레이아웃이 실제로 계산된다", () => {
  const probe = document.createElement("div");
  probe.style.width = "120px";
  probe.style.height = "40px";
  document.body.append(probe);
  try {
    const rect = probe.getBoundingClientRect();
    // jsdom·happy-dom은 전 필드 0을 반환한다.
    expect(rect.width).toBeCloseTo(120, 0);
    expect(rect.height).toBeCloseTo(40, 0);
  } finally {
    probe.remove();
  }
});

test("hit test가 동작한다", () => {
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;top:0;left:0;width:50px;height:50px";
  document.body.append(probe);
  try {
    // jsdom은 elementFromPoint를 구현하지 않고, happy-dom은 항상 null을 반환한다.
    expect(document.elementFromPoint(10, 10)).not.toBeNull();
  } finally {
    probe.remove();
  }
});

test("HTMLDialogElement가 modal과 non-modal을 구분한다", () => {
  const dialog = document.createElement("dialog");
  document.body.append(dialog);
  try {
    // jsdom은 showModal 자체가 없고, happy-dom은 showModal과 show가 동일하다.
    expect(typeof dialog.showModal).toBe("function");
    expect(typeof dialog.show).toBe("function");

    dialog.show();
    expect(dialog.open).toBe(true);
    // non-modal은 top layer에 올라가지 않으므로 ::backdrop이 없다.
    expect(dialog.matches(":modal")).toBe(false);
    dialog.close();

    dialog.showModal();
    expect(dialog.open).toBe(true);
    expect(dialog.matches(":modal")).toBe(true);
    dialog.close();
  } finally {
    dialog.remove();
  }
});

test("inert가 구현돼 있다", () => {
  const probe = document.createElement("div");
  document.body.append(probe);
  try {
    expect("inert" in probe).toBe(true);
    probe.inert = true;
    expect(probe.hasAttribute("inert")).toBe(true);
  } finally {
    probe.remove();
  }
});
