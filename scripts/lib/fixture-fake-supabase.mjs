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
 * 예외는 `seeds` 로 받은 표뿐이다(2026-10-07, `fixture-seeds.mjs` — 소유자가 허용한 자리표시 내용).
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

// **시드가 든 표만 PostgREST 처럼 거른다(2026-10-07).** 제품이 쓰는 조회 모양만 받는다 — 필터 `eq` · `neq` · `is.null` · `in.(…)`,
// `order=<열>.asc|desc`(쉼표로 여럿), `limit` · `offset`, `select` 의 평범한 열 목록. 모르는 연산자나 관계 조회(`select` 에 괄호)를
// 만나면 **추측하지 않고 400 으로 답한다** — 조용히 거르지 않은 행을 돌려주면 제품이 그리지 않을 화면을 재게 된다. 요청 기록에 남는다.
const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"]);
const queryRows = (rows, params) => {
  let out = [...rows];
  for (const [column, raw] of params) {
    if (RESERVED.has(column)) continue;
    const dot = raw.indexOf(".");
    const op = raw.slice(0, dot);
    const value = raw.slice(dot + 1);
    if (op === "eq") out = out.filter((row) => String(row[column]) === value);
    else if (op === "neq") out = out.filter((row) => String(row[column]) !== value);
    else if (op === "is" && value === "null") out = out.filter((row) => row[column] == null);
    else if (op === "in" && value.startsWith("(") && value.endsWith(")")) {
      const set = new Set(value.slice(1, -1).split(",").map((item) => item.replace(/^"|"$/g, "")));
      out = out.filter((row) => set.has(String(row[column])));
    } else return { error: `unsupported filter ${column}=${raw}` };
  }
  const order = params.get("order");
  if (order) {
    const keys = order.split(",").map((part) => { const [column, direction] = part.split("."); return { column, desc: direction === "desc" }; });
    out.sort((a, b) => {
      for (const { column, desc } of keys) {
        if (a[column] === b[column]) continue;
        const less = a[column] == null ? false : b[column] == null ? true : a[column] < b[column];
        return (less ? -1 : 1) * (desc ? -1 : 1);
      }
      return 0;
    });
  }
  const offset = Number(params.get("offset") ?? 0);
  const limit = params.has("limit") ? Number(params.get("limit")) : Infinity;
  out = out.slice(offset, offset + limit);
  const select = params.get("select");
  if (select && select !== "*") {
    if (/[()]/.test(select)) return { error: `unsupported embedded select ${select}` };
    const columns = select.split(",").map((column) => column.trim()).filter(Boolean);
    out = out.map((row) => Object.fromEntries(columns.map((column) => [column, row[column] ?? null])));
  }
  return { rows: out };
};

export async function startFakeSupabase({ seeds = {} } = {}) {
  const requests = [];
  // **상태 레시피 오버레이(2026-10-08, 상태 레시피 설계서 2절 5번).** 한 화면 동안만 표(`tables` — 시드와 같은 꼴, 그 표는 통째로 바뀐다)와
  // RPC 응답(`rpc`)을 바꾼다. 측정기가 레시피 화면의 `goto` 전에 걸고 `finally` 에서 `null` 로 푼다. `null` 이면 아래 분기는 종전과 같다.
  let overlay = null;
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
    if (path.startsWith("/rest/v1/rpc/")) return send(200, overlay?.rpc && Object.hasOwn(overlay.rpc, path.slice("/rest/v1/rpc/".length)) ? overlay.rpc[path.slice("/rest/v1/rpc/".length)] : null);
    if (path.startsWith("/rest/v1/")) {
      // PostgREST: 한 행을 요구하면(`application/vnd.pgrst.object+json`) 행이 정확히 하나가 아닐 때 406 PGRST116, 목록이면 배열.
      // `maybeSingle()` 은 GET 에 `application/json` 을 보내고 길이 1 배열에서 행을 꺼낸다(postgrest-js 2.98) — 목록 갈래가 맞다.
      const single = String(request.headers.accept ?? "").includes("vnd.pgrst.object");
      const table = path.slice("/rest/v1/".length);
      // 시드는 행 배열이거나 `{ rows, requireFilter }` 다 — `requireFilter` 열로 집어 읽을 때만(`<열>=eq.…`) 행을 내고, 목록 조회에는 빈 목록이다.
      // 같은 세션 측정의 허브(`/nodecanvas` 목록)가 같은 표를 `user_id` 로만 읽으므로, 상세용 시드가 허브 보드의 빈 상태를 바꾸지 않게 한다(2026-10-07).
      const entry = overlay?.tables && Object.hasOwn(overlay.tables, table) ? overlay.tables[table] : (Object.hasOwn(seeds, table) ? seeds[table] : null);
      const rowsOf = Array.isArray(entry) ? entry : entry?.rows ?? null;
      const gated = entry && !Array.isArray(entry) && entry.requireFilter && !url.searchParams.has(entry.requireFilter);
      const result = rowsOf && !gated ? queryRows(rowsOf, url.searchParams) : { rows: [] };
      if (result.error) return send(400, { code: "FIXTURE", message: result.error, hint: "fixture-fake-supabase 가 이 조회 모양을 모른다" });
      const rows = result.rows;
      const range = rows.length ? `0-${rows.length - 1}/${rows.length}` : "*/0";
      if (request.method === "HEAD") return send(200, undefined, { "content-range": range });
      if (request.method !== "GET") return send(201, []);
      if (single) {
        if (rows.length === 1) return send(200, rows[0], { "content-range": range });
        return send(406, { code: "PGRST116", details: `The result contains ${rows.length} rows`, hint: null, message: "JSON object requested, multiple (or no) rows returned" });
      }
      return send(200, rows, { "content-range": range });
    }
    return send(404, { message: "fixture: not found" });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    /** 레시피 화면의 표 · RPC 오버레이를 건다(`null` 이면 푼다). */
    setOverlay: (next) => { overlay = next; },
    /** 지금까지의 요청 수 — `requests.slice(mark)` 가 이 화면 동안의 요청이다. */
    beginMark: () => requests.length,
    close:() => new Promise((resolve) => server.close(() => resolve())),
  };
}
