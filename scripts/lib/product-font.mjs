import { execFileSync } from "node:child_process";

// **하네스에 제품 글꼴을 싣는다.**
//
// 제품은 `font-family: var(--type-font-family)` → `var(--font-pretendard)`를 쓰는데, 그 변수는
// Next.js `localFont`가 런타임에 주입한다(app/layout.tsx:41). 빈 문서에 제품 CSS만 올리면 그
// 변수가 정의되지 않아 **브라우저 기본 글꼴(Times)로 떨어진다.**
//
// 그러면 글자가 폭을 정하는 모든 것이 틀린 값으로 측정된다 — 배지·칩처럼 내용에 맞춰 줄어드는
// 상자, 인라인 텍스트, 내용으로 넓어지는 버튼이 전부 그렇다. 2026-08-20에 표본을 Figma로 옮기다
// 발견했다. 실측 79.13px이던 토스트 글자가 Pretendard로는 70px이었고, 어긋남이 어디서 왔는지
// `fontFamily`를 재고 나서야 알았다(그 축도 그때 측정에 추가했다).
//
// 제품이 쓰는 그 파일을 그대로 심는다. 추정하지 않는다.
/** 제품 글꼴 파일(`apps/web/app/fonts/PretendardVariable.woff2`)의 바이트 — 다른 이름으로 실을 때 쓴다(LOUIS 예시 측정). */
export function productFontFile(productRoot, commit) {
  return execFileSync("git", ["show", commit + ":apps/web/app/fonts/PretendardVariable.woff2"], { cwd: productRoot, maxBuffer: 64 * 1024 * 1024, encoding: "buffer" });
}

export function productFontFace(productRoot, commit) {
  const path = "apps/web/app/fonts/PretendardVariable.woff2";
  const blob = execFileSync("git", ["show", commit + ":" + path], {
    cwd: productRoot,
    maxBuffer: 64 * 1024 * 1024,
    encoding: "buffer",
  });
  const b64 = blob.toString("base64");
  return (
    '@font-face{font-family:"PretendardHarness";' +
    'src:url(data:font/woff2;base64,' + b64 + ') format("woff2");' +
    // 제품 선언과 같은 가변 축 범위다(layout.tsx:41 weight "45 920").
    "font-weight:45 920;font-style:normal;font-display:block}\n" +
    // 제품이 참조하는 변수 이름에 그대로 꽂는다.
    ':root{--font-pretendard:"PretendardHarness";--font-pretendard-jp:"PretendardHarness"}\n'
  );
}
