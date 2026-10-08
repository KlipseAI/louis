// **로캘 글자 짝짓기(DS-D-0081, 2026-10-08).**
//
// Figma 보드는 en 측정의 사진이다. 로캘마다 같은 화면을 다시 잰 원장(`migration/product-locale/<mode>.<locale>.json`)에서
// **같은 DOM 경로**의 글자를 찾아 보드 글자 하나에 en · ko · ja 세 값을 붙인다. 값은 보드가 그리는 글자와 같은 식
// (`figmaTextValue` — 보이는 줄을 `\n` 으로 잇고 앞뒤 공백을 NBSP 로)으로 만든다. 그 식은 생성기 `slimNode` 의 `x` 와
// 함수 하나로 공유한다 — 두 벌이면 en 모드의 변수 값이 보드 리터럴과 어긋나도 아무도 모른다.
//
// 로캘 원장도 보드와 같은 변환(`normalizeAuthFixtureTree` → `toFigmaTreeSpec`)을 거친다. 섞인 문단의 합치기(richInlineText)와
// 글자 떼어내기(`<path>.t`)가 en 과 똑같은 규칙으로 일어나야 경로가 맞는다. 떼어내기가 로캘마다 갈리면(한쪽만 요소 자식을 가진다)
// 부모 경로 ↔ `.t` 경로를 서로 대신 찾는다.
//
// 이 파일은 짝만 짓는다. 변수 이름 · 계획 · 러너는 `scripts/build-figma-locale-strings.mjs` 가 정한다.

import { normalizeAuthFixtureTree, toFigmaTreeSpec } from "./figma-tree-spec.mjs";

export const LOCALES = Object.freeze(["en", "ko", "ja"]);

/**
 * 보드가 그리는 글자 — 생성기 `slimNode` 의 `x`. 제품 글꼴로 보이는 줄(`wrapLines`)이 둘 이상이면 줄바꿈으로 잇고,
 * 앞뒤 공백은 NBSP 로 바꾼다(Figma 의 폭 자동 글자는 끝 공백을 폭에 넣지 않는다 — slimNode 주석).
 */
export const figmaTextValue = (node) =>
  (node.wrapLines?.length > 1 ? node.wrapLines.join("\n") : node.text).replace(/^ /, " ").replace(/ $/, " ");

/** 인스턴스 라벨의 글자 — 치환 모듈(`figma-component-substitution.mjs` matchText)과 같은 정규화다. */
export const labelText = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

/**
 * 측정 화면 하나를 보드 생성기와 같은 옵션으로 트리 스펙으로 바꾼다. `rootPath` 가 없으면 화면(보드) 변환,
 * 있으면 부품 변환이다(생성기 PARTS 는 `recordedBottom` 을 주지 않는다). 화면이 없으면 null.
 */
export function measuredSpecOf(ledger, contextId, route, rootPath = null) {
  const measured = ledger?.screens?.[contextId]?.[route];
  if (!measured?.tree?.length) return null;
  const tree = normalizeAuthFixtureTree(measured.tree, ledger.computedStyles);
  const options = rootPath
    ? { rootPath, contextId }
    : { rootPath: measured.rootPath, contextId, recordedBottom: measured.fullPage ? null : measured.viewport.height };
  return toFigmaTreeSpec(tree, options).spec;
}

export const indexByPath = (spec) => {
  const index = new Map();
  const walk = (node) => {
    index.set(node.path, node);
    for (const child of node.children ?? []) walk(child);
  };
  if (spec) walk(spec);
  return index;
};

/** 생성기가 지은 감싸개(`~margin` · `~pair`)는 측정 노드가 아니다 — 존재 판정에서 부모를 따른다. */
const synthetic = (path) => path.includes("~");

/**
 * 보드 스펙의 글자 · 라벨 · 존재를 로캘 스펙과 짝짓는다.
 *
 * @param boardSpec   보드(또는 부품)가 그리는 en 스펙 — 인스턴스 치환 뒤. 글자 노드의 `path` 가 짝짓기 열쇠다.
 * @param enSpec      같은 화면 en 원장의 치환 전 스펙 — 인스턴스 라벨의 출처 글자를 찾고, 보드와 en 원장이 같은 글자인지 본다.
 * @param localeSpecs `{ ko: spec, ja: spec }` — 로캘 원장의 같은 변환.
 * @param remap       `{ from, to }` — 로캘 쪽 경로가 다른 자리에 있을 때(부품을 그 부품이 선 보드에서 짝짓는다) en 경로 접두를 바꾼다.
 */
export function pairLocaleTexts({ boardSpec, enSpec, localeSpecs, remap = null }) {
  const targets = LOCALES.filter((locale) => locale !== "en");
  for (const locale of targets) if (!localeSpecs[locale]) throw new Error(`[locale-pairing] ${locale} 스펙이 없습니다`);
  const enIndex = indexByPath(enSpec);
  const localeIndex = Object.fromEntries(targets.map((locale) => [locale, indexByPath(localeSpecs[locale])]));
  const mapped = (path) => (remap && (path === remap.from || path.startsWith(`${remap.from}.`)) ? remap.to + path.slice(remap.from.length) : path);
  /** 로캘 쪽 글자 노드 — 떼어내기가 갈린 자리는 부모 ↔ `.t` 를 대신 본다. */
  const textIn = (index, path) => {
    const at = mapped(path);
    const direct = index.get(at);
    if (direct?.text) return direct;
    if (at.endsWith(".t")) {
      const parent = index.get(at.slice(0, -2));
      if (parent?.text) return parent;
    }
    const split = index.get(`${at}.t`);
    if (split?.text) return split;
    return null;
  };
  const present = (index, path, isText) => (isText ? Boolean(textIn(index, path)) || index.has(mapped(path)) : index.has(mapped(path)));

  const texts = [];
  const labels = [];
  const presence = [];
  const issues = { enDrift: [], textMissing: [], tagMismatch: [], labelUnresolved: [], localeRichLost: [] };
  const boardPaths = new Set();
  const instancePaths = [];

  // 존재 패턴이 부모와 다를 때만 묶는다 — 부모가 숨으면 자식도 숨는다.
  const walk = (node, ancestors, parentPattern) => {
    boardPaths.add(node.path);
    let pattern = parentPattern;
    if (!synthetic(node.path)) {
      const isText = Boolean(node.text);
      const here = ["en", ...targets.filter((locale) => present(localeIndex[locale], node.path, isText))];
      pattern = here.join("+");
      if (pattern !== parentPattern) presence.push({ path: node.path, pattern });
    }
    if (node.instance) {
      instancePaths.push(node.path);
      if (node.instance.label != null) pairLabel(node);
      return;
    }
    if (node.text) pairText(node, ancestors);
    for (const child of node.children ?? []) walk(child, [...ancestors, node], pattern);
  };

  const pairText = (node, ancestors) => {
    const enValue = figmaTextValue(node);
    const reference = enIndex.get(node.path);
    if (!reference?.text || figmaTextValue(reference) !== enValue) {
      issues.enDrift.push({ path: node.path, board: enValue, ledger: reference?.text ? figmaTextValue(reference) : null });
    }
    const entry = {
      path: node.path,
      values: { en: enValue },
      plain: { en: labelText(node.text) },
      present: { en: true },
      rich: Boolean(node.textRanges?.length),
    };
    for (const locale of targets) {
      const hit = textIn(localeIndex[locale], node.path);
      const shell = localeIndex[locale].get(mapped(node.path));
      entry.present[locale] = Boolean(hit || shell);
      if (!hit) {
        // 경로는 있는데 글자가 없다 — 로캘에서 모양이 달라졌다. 값은 en 으로 두고 보고한다(조용히 en 을 ko 라고 부르지 않는다).
        if (shell) issues.textMissing.push({ path: node.path, locale, tag: shell.tag });
        entry.values[locale] = enValue;
        entry.plain[locale] = entry.plain.en;
        continue;
      }
      if (hit.tag !== node.tag && !hit.path.endsWith(".t") && !node.path.endsWith(".t")) {
        issues.tagMismatch.push({ path: node.path, locale, en: node.tag, [locale]: hit.tag });
      }
      if (!entry.rich && hit.textRanges?.length) issues.localeRichLost.push({ path: node.path, locale });
      entry.values[locale] = figmaTextValue(hit);
      entry.plain[locale] = labelText(hit.text);
      const enRect = reference?.rect ?? node.rect;
      const dw = Math.round((hit.rect.width - enRect.width) * 100) / 100;
      const dh = Math.round((hit.rect.height - enRect.height) * 100) / 100;
      if (Math.abs(dw) > 2 || Math.abs(dh) > 2) {
        // 보드는 en 배치다 — 글자가 커진 축이 고정(FIXED)인 가장 가까운 조상이 넘침 · 잘림의 자리다(없으면 보드 뿌리).
        const fixed = [...ancestors].reverse().find((ancestor) =>
          (Math.abs(dw) > 2 && ancestor.sizing?.layoutSizingHorizontal === "FIXED")
          || (Math.abs(dh) > 2 && ancestor.sizing?.layoutSizingVertical === "FIXED"));
        (entry.delta ??= {})[locale] = { dw, dh, fixedAncestor: fixed?.path ?? null };
      }
    }
    texts.push(entry);
  };

  const pairLabel = (node) => {
    const root = enIndex.get(node.path);
    const sources = [];
    const collect = (at) => {
      if (at.text) sources.push(at);
      for (const child of at.children ?? []) collect(child);
    };
    if (root) collect(root);
    const wanted = typeof node.instance.label === "object"
      ? Object.entries(node.instance.label).filter(([, value]) => value != null)
      : [[null, node.instance.label]];
    for (const [prop, value] of wanted) {
      const hits = sources.filter((source) => labelText(source.text) === labelText(value));
      if (hits.length !== 1) {
        issues.labelUnresolved.push({ path: node.path, prop, label: value, sources: hits.length });
        continue;
      }
      const entry = { path: node.path, prop, src: hits[0].path, values: { en: String(value) }, plain: { en: labelText(value) }, present: { en: true } };
      for (const locale of targets) {
        const hit = textIn(localeIndex[locale], hits[0].path);
        entry.present[locale] = Boolean(hit);
        entry.values[locale] = hit ? labelText(hit.text) : String(value);
        entry.plain[locale] = hit ? labelText(hit.text) : labelText(value);
      }
      labels.push(entry);
    }
  };

  walk(boardSpec, [], "en+ko+ja");

  // 로캘에만 있는 글자 — 보드에 그 노드가 없어 묶을 수 없다(en 배치다). 치환된 인스턴스 안쪽은 컴포넌트가 그린다.
  const localeOnly = [];
  const back = remap ? (path) => (path === remap.to || path.startsWith(`${remap.to}.`) ? remap.from + path.slice(remap.to.length) : null) : (path) => path;
  const rootPath = boardSpec.path;
  for (const locale of targets) {
    for (const [path, node] of localeIndex[locale]) {
      if (!node.text) continue;
      const enPath = back(path);
      if (enPath == null || !(enPath === rootPath || enPath.startsWith(`${rootPath}.`))) continue;
      if (instancePaths.some((instance) => enPath.startsWith(`${instance}.`))) continue;
      const known = boardPaths.has(enPath) || (enPath.endsWith(".t") && boardPaths.has(enPath.slice(0, -2))) || boardPaths.has(`${enPath}.t`);
      if (!known) localeOnly.push({ locale, path: enPath, text: labelText(node.text).slice(0, 80) });
    }
  }
  return { texts, labels, presence, localeOnly, issues };
}
