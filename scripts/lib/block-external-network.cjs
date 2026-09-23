// **재는 서버를 바깥과 끊는다.** `node --require` 로 제품 서버 프로세스에 먼저 실려, localhost 밖으로 나가는
// fetch · http(s) 요청을 거절한다.
//
// 왜 있는가: `measure-product-scenes.mjs` 는 고정 커밋으로 빌드된 제품 서버를 띄워 화면을 잰다. 그런데 그 서버가
// Supabase 를 실제로 불러, `/blog` 가 **그때그때의 게시글 목록**을 그렸다. 원장에 실제 글 제목이 박혔고, 데이터가
// 바뀐 날 `verify-product-scenes` 가 「제품 장면 렌더가 기록과 다릅니다: /blog.headings.0.y 115 ≠ 141」로 빨갰다.
// 제품 커밋도 빌드도 그대로인데 게이트 결과가 날마다 달라지면, 그 게이트는 제품을 재는 것이 아니라 데이터베이스의
// 오늘을 재는 것이다(2026-09-23, 소유자 판정 「네트워크 끊고 다시 재기」).
//
// **환경 변수로는 못 막는다.** Next 는 `NEXT_PUBLIC_*` 를 빌드 때 번들에 인라인한다 — 고정 빌드에 이미 실제 주소가
// 들어 있어, 서버를 띄울 때 `NEXT_PUBLIC_SUPABASE_URL` 을 죽은 주소로 줘도 페이지는 그대로 실데이터를 불러왔다(실측).
// 그래서 프로세스 안에서 요청 자체를 막는다. 형제 하네스(`measure-product-auth-fixture.mjs`)는 `next dev` 를 띄워
// 런타임 env 가 먹으므로 env 고정만으로 같은 효과를 얻는다.
//
// 막으면 화면은 **데이터 없는 상태**(블로그 「Coming soon」 등)를 그린다. 그것이 이 원장이 기록하는 상태다 —
// 데이터가 정하는 자리를 재지 않는다는 뜻이고, 빈 상태의 기하는 제품 코드가 정한다.
const http = require("node:http");
const https = require("node:https");

const isLocalHost = (host) =>
  !host || host === "127.0.0.1" || host === "localhost" || host === "::1" || host === "[::1]";

const hostOf = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    try { return new URL(value).hostname; } catch { return null; }
  }
  if (typeof value === "object") {
    if (typeof value.url === "string") { try { return new URL(value.url).hostname; } catch { return null; } }
    if (typeof value.href === "string") { try { return new URL(value.href).hostname; } catch { return null; } }
    return value.hostname || value.host || null;
  }
  return null;
};

const originalFetch = globalThis.fetch;
if (typeof originalFetch === "function") {
  globalThis.fetch = (input, init) => {
    const host = hostOf(input);
    if (!isLocalHost(host)) {
      return Promise.reject(new Error("[block-external-network] 바깥 요청을 막았다: " + host));
    }
    return originalFetch(input, init);
  };
}

for (const module of [http, https]) {
  const originalRequest = module.request.bind(module);
  module.request = (...args) => {
    const host = hostOf(args[0]);
    if (!isLocalHost(host)) {
      throw new Error("[block-external-network] 바깥 요청을 막았다: " + host);
    }
    return originalRequest(...args);
  };
}
