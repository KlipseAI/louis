/**
 * **서버가 받는 가짜 Supabase(2026-09-29).**
 *
 * 허브 셋(`/nodecanvas` · `/videoeditor` · `/highlight`)과 편집기 · 어드민은 서버 컴포넌트에서 `supabase.auth.getUser()` 로
 * 사용자를 확인하고 없으면 랜딩으로 보낸다(측정기 ROUTES 주석). 인증 우회(`NEXT_PUBLIC_DEV_AUTH_BYPASS`)는 브라우저 쪽이라
 * 이 확인을 통과하지 못해, 손 조립 보드 47장 가운데 앱 화면이 잴 수 없는 채로 남았다.
 *
 * `getUser()` 는 토큰을 풀지 않고 `${SUPABASE_URL}/auth/v1/user` 에 묻는다(auth-js 2.98). 그래서 이 서버가 그 요청에
 * 고정 사용자로 답하고, 측정기가 세션 쿠키(`sb-<호스트 첫 마디>-auth-token`, `@supabase/ssr` 0.9 의 `base64-` 인코딩)를
 * 넣으면 서버 확인을 통과한다. 데이터 조회(`/rest/v1/*`)는 **빈 목록**으로 답한다 — 지어낸 데이터로 화면을 채우지 않는다.
 * 들어온 요청은 모두 기록해(`requests`) 어떤 표를 읽는지 원장에 남긴다. 바깥 네트워크는 여전히 없다.
 */
import { createServer } from "node:http";

export const FIXTURE_USER_ID = "00000000-0000-4000-8000-00000000f1c5";
const FAR_FUTURE = 4102444800; // 2100-01-01T00:00:00Z

const base64url = (value) => Buffer.from(value).toString("base64url");

export const fixtureUser = () => ({
  id: FIXTURE_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "fixture@klipse.test",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  phone: "",
  confirmed_at: "2026-01-01T00:00:00.000Z",
  last_sign_in_at: "2026-01-01T00:00:00.000Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  identities: [],
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  is_anonymous: false,
});

// 서명은 검증되지 않는다(서버가 `/auth/v1/user` 로 묻는다). 모양만 JWT 로 둔다 — 토큰을 푸는 경로(getClaims 등)가 있어도 깨지지 않게.
const accessToken = () => [
  base64url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
  base64url(JSON.stringify({ sub: FIXTURE_USER_ID, aud: "authenticated", role: "authenticated", email: "fixture@klipse.test", exp: FAR_FUTURE, iat: 1767225600 })),
  base64url("fixture-signature"),
].join(".");

export const fixtureSession = () => ({
  access_token: accessToken(),
  token_type: "bearer",
  expires_in: FAR_FUTURE - 1767225600,
  expires_at: FAR_FUTURE,
  refresh_token: "fixture-refresh-token",
  user: fixtureUser(),
});

/** 브라우저 문맥에 넣을 세션 쿠키 — `supabaseUrl` 은 Next 서버에 넘긴 `NEXT_PUBLIC_SUPABASE_URL` 과 같아야 한다. */
export const sessionCookie = (supabaseUrl, cookieUrl) => ({
  name: `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`,
  value: "base64-" + base64url(JSON.stringify(fixtureSession())),
  url: cookieUrl,
});

export async function startFakeSupabase() {
  const requests = [];
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://fixture.invalid");
    const origin = request.headers.origin;
    const headers = {
      "content-type": "application/json; charset=utf-8",
      ...(origin ? {
        "access-control-allow-origin": origin,
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": request.headers["access-control-request-headers"] ?? "*",
        "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,HEAD,OPTIONS",
        "access-control-expose-headers": "content-range",
      } : {}),
    };
    const send = (status, body, extra = {}) => {
      requests.push({ method: request.method, path: url.pathname, search: url.search, status });
      response.writeHead(status, { ...headers, ...extra });
      response.end(body === undefined ? "" : JSON.stringify(body));
    };
    if (request.method === "OPTIONS") return send(204);
    const path = url.pathname;
    if (path === "/auth/v1/user") return send(200, fixtureUser());
    if (path === "/auth/v1/token") return send(200, fixtureSession());
    if (path === "/auth/v1/logout") return send(204);
    if (path.startsWith("/rest/v1/rpc/")) return send(200, null);
    if (path.startsWith("/rest/v1/")) {
      // PostgREST: 한 행을 요구하면(`application/vnd.pgrst.object+json`) 행이 없을 때 406 PGRST116, 목록이면 빈 배열.
      const single = String(request.headers.accept ?? "").includes("vnd.pgrst.object");
      if (request.method === "HEAD") return send(200, undefined, { "content-range": "*/0" });
      if (request.method !== "GET") return send(201, []);
      if (single) return send(406, { code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" });
      return send(200, [], { "content-range": "*/0" });
    }
    return send(404, { message: "fixture: not found" });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
