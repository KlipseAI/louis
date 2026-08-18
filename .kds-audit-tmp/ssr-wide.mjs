import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import * as K from "@klipse-design/react";
const cases = [
  ["Button", () => h(K.Button, null, "저장")],
  ["Dialog(open)", () => h(K.OverlayProvider, null, h(K.Dialog, { open: true }, h(K.DialogSurface, null, h(K.DialogTitle, null, "제목"), h(K.DialogBody, null, "내용"))))],
  ["ActionMenu(open)", () => h(K.OverlayProvider, null, h(K.ActionMenu, { open: true }, h(K.ActionMenuTrigger, null, "메뉴"), h(K.ActionMenuContent, null, h(K.ActionMenuItem, null, "항목"))))],
  ["Tooltip", () => h(K.OverlayProvider, null, h(K.Tooltip, { label: "설명" }, h(K.IconButton, { label: "닫기" }, "x")))],
  ["TextField", () => h(K.TextField, { label: "이름" })],
  ["ToastProvider", () => h(K.ToastProvider, null, "child")],
  ["Slider", () => h(K.Slider, { label: "볼륨", value: 3, onValueChange: () => {} })],
  ["Dialog(no provider)", () => h(K.Dialog, { open: true }, h(K.DialogSurface, null, h(K.DialogTitle, null, "제목")))],
];
for (const [name, make] of cases) {
  try { const html = renderToStaticMarkup(make()); console.log(`OK   ${name} -> ${html.slice(0,70).replace(/\n/g," ")}`); }
  catch (e) { console.log(`FAIL ${name} -> ${String(e.message).split("\n")[0].slice(0,160)}`); }
}
