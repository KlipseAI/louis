#!/usr/bin/env node
// 새 LOUIS 문서의 뼈대를 만든다 — 머리 · 결정 요청 · 요약 절 · 번호 절 · 맺음 절 · 출처 · 맺음 줄.
//   node .claude/skills/klipse-document/scripts/new-document.mjs <슬러그> "<제목>" [--dir documents] [--publisher "Klipse"]
// 산출: <dir>/<슬러그>/index.html · BRIEF.md · media/. 채울 자리는 「〔채울 자리: …〕」로 남고, check-document 가 남은 자리를 오류로 센다.
// CSS 는 packages/css/generated 를 상대 경로로 링크한다 — 저장소 안에서 그대로 열린다. 파일 하나로 보낼 때는 export-document 를 쓴다.
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../../../..");
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  if (index < 0) return fallback;
  const [value] = args.splice(index, 2).slice(1);
  return value;
};
const baseDir = resolve(repo, option("dir", "documents"));
const publisher = option("publisher", "Klipse");
const [slug, title] = args;
if (!slug || !title || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('사용법: new-document.mjs <슬러그(영문 소문자 · 숫자 · 하이픈)> "<제목>" [--dir documents] [--publisher "Klipse"]');
  process.exit(1);
}
const docDir = join(baseDir, slug);
if (existsSync(join(docDir, "index.html"))) {
  console.error(`이미 있다: ${relative(repo, join(docDir, "index.html"))} — 덮어쓰지 않는다.`);
  process.exit(1);
}
mkdirSync(join(docDir, "media"), { recursive: true });

// 발행 주체 표식 — 승인본(예시)의 로고를 그대로 쓴다. 로고를 글자나 그라디언트로 흉내 내지 않는다(document.md 「하지 않는 것」).
const example = readFileSync(join(repo, "packages/css/examples/document.html"), "utf8");
const brandMark = example.match(/class="louis-document__brand-mark" src="([^"]+)"/)?.[1];
if (!brandMark) throw new Error("예시에서 로고를 찾지 못했다: packages/css/examples/document.html");
const css = relative(docDir, join(repo, "packages/css/generated"));
const today = new Date();
const iso = today.toISOString().slice(0, 10);
const human = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
const fill = (what) => `〔채울 자리: ${what}〕`;

const html = `<!doctype html>
<html lang="ko" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<!--
  LOUIS Document 패턴 — design/patterns/document.md · 스킬 .claude/skills/klipse-document/SKILL.md
  LOUIS 클래스만 쓴다. <style> · 인라인 색을 두지 않는다. 부품 마크업은 packages/css/examples/document-report.html 에서 옮긴다.
-->
<script>
  (function () {
    var q = new URLSearchParams(location.search).get("theme");
    var dark = q ? q === "dark" : window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  })();
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="${css}/layers.css">
<link rel="stylesheet" href="${css}/reset.css">
<link rel="stylesheet" href="${css}/tokens.css">
<link rel="stylesheet" href="${css}/styles.css">
</head>
<body>
<div class="louis-document">
<main class="louis-document__sheet">
<article class="louis-document__column">

  <header class="louis-document__head">
    <p class="louis-document__brand"><img class="louis-document__brand-mark" src="${brandMark}" alt="" width="20" height="20"> ${publisher}</p>
    <h1 class="louis-document__title">${title}</h1>
    <p class="louis-document__lead">${fill("결론 한 문장: 무엇을 했고 무엇을 결정해야 하는지")}</p>
    <p class="louis-document__meta"><time datetime="${iso}">${human}</time></p>
  </header>

  <section class="louis-document-decision" aria-labelledby="decision-title">
    <h2 class="louis-document-decision__title" id="decision-title">승인과 확인이 필요한 사항</h2>
    <ol class="louis-document-decision__list" role="list">
      <li class="louis-document-decision__item">
        <span class="louis-document-marker" aria-hidden="true">1</span>
        <p class="louis-document-decision__label">${fill("결정할 사항: 명사구(「예산 승인」, 「개발 착수」)")}</p>
        <p class="louis-document-decision__detail">${fill("조건, 기한, 비용 한 줄")}</p>
      </li>
    </ol>
  </section>

  <section class="louis-document-section" aria-labelledby="s0">
    <div class="louis-document-section__head">
      <p class="louis-document-section__kicker">요약</p>
      <h2 class="louis-document-section__title" id="s0">${fill("요약 절의 주장 한 문장")}</h2>
    </div>
    <ol class="louis-document-grid" role="list" aria-label="${fill("격자의 이름")}">
      <li class="louis-document-card">
        <div class="louis-document-card__head"><span class="louis-document-marker" aria-hidden="true">01</span><p class="louis-document-card__title">${fill("카드 제목")}</p></div>
        <p class="louis-document-card__description">${fill("한두 문장")}</p>
      </li>
      <li class="louis-document-card">
        <div class="louis-document-card__head"><span class="louis-document-marker" aria-hidden="true">02</span><p class="louis-document-card__title">${fill("카드 제목")}</p></div>
        <p class="louis-document-card__description">${fill("한두 문장")}</p>
      </li>
      <li class="louis-document-card">
        <div class="louis-document-card__head"><span class="louis-document-marker" aria-hidden="true">03</span><p class="louis-document-card__title">${fill("카드 제목")}</p></div>
        <p class="louis-document-card__description">${fill("한두 문장")}</p>
      </li>
    </ol>
  </section>

  <section class="louis-document-section" aria-labelledby="s1">
    <div class="louis-document-section__head">
      <p class="louis-document-section__kicker">01</p>
      <h2 class="louis-document-section__title" id="s1">${fill("이 절의 주장 한 문장")}</h2>
      <p class="louis-document-section__source">${fill("기준 시점과 출처")}</p>
    </div>
    <div class="louis-document-prose">
      <p>${fill("주장, 근거, 해석 순서. 수치는 격자, 막대, 표로, 산문은 해석으로")}</p>
    </div>
  </section>

  <section class="louis-document-section" aria-labelledby="s-end">
    <div class="louis-document-section__head">
      <p class="louis-document-section__kicker">정할 내용</p>
      <h2 class="louis-document-section__title" id="s-end">${fill("결정 요청을 근거와 함께 다시 한 문장")}</h2>
    </div>
    <div class="louis-document-prose">
      <p>${fill("결정 요청 항목마다 근거 한 줄")}</p>
    </div>
  </section>

  <footer class="louis-document__foot"><span>${title}</span><span>${iso.slice(0, 7).replace("-", ".")}</span></footer>
</article>
</main>
</div>
</body>
</html>
`;

writeFileSync(join(docDir, "index.html"), html);
copyFileSync(join(here, "../BRIEF.md"), join(docDir, "BRIEF.md"));
console.log(`만들었다: ${relative(repo, docDir)}/ — index.html · BRIEF.md · media/`);
console.log(`검사: node .claude/skills/klipse-document/scripts/check-document.mjs ${relative(repo, docDir)}`);
