/**
 * **서버가 받는 가짜 S3(2026-10-14, 측정기 `--session-deck`).**
 *
 * Klipse Deck 화면은 교안 판을 DB 가 아니라 S3 에서 읽는다(앵커 `app/lib/deck/releases.server.ts` — `current.json` 포인터와 판 파일).
 * 제품의 S3 어댑터(`app/lib/storage/s3.ts`)는 `S3_ENDPOINT` 가 있으면 그 주소에 path-style 로 붙는다(검증 · 로컬용). 이 서버가 그 주소다 —
 * 받은 `objects`(키 → JSON 값 또는 문자열)만 내주고 나머지 키는 404 `NoSuchKey` 로 답한다. 쓰기(PUT · DELETE)는 받지 않는다(403).
 *
 * 답하는 요청: GetObject(`GET /<버킷>/<키>`), HeadObject(`HEAD /<버킷>/<키>`), ListObjectsV2(`GET /<버킷>?list-type=2&prefix=…&delimiter=/`).
 * 버킷 이름은 보지 않는다(공개 · 비공개 둘 다 같은 객체). 서명도 보지 않는다. 들어온 요청은 기록해(`requests`) 원장에 남긴다.
 *
 * **이 서버는 `--session-deck` 모드에서만 뜬다.** S3 환경변수를 세션 모드 전체에 주면 저장소를 읽는 다른 화면(`/api/auth/me` 의 서명 주소 등)의
 * 측정이 바뀐다 — 덱 화면만 따로 재서 따로 원장(migration/product.session-deck-fixture.json — 앵커가 덱 레이아웃을 가진 뒤에 커밋한다)에 쓴다.
 */
import { createServer } from "node:http";

const xmlEscape = (value) => String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

export async function startFakeS3({ objects = {} } = {}) {
  const requests = [];
  const bodies = new Map(Object.entries(objects).map(([key, value]) => [key, Buffer.from(typeof value === "string" ? value : JSON.stringify(value))]));
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://fixture.invalid");
    // path-style: /<버킷>/<키…>
    const [, bucket = "", ...rest] = url.pathname.split("/");
    const key = decodeURIComponent(rest.join("/"));
    const send = (status, body, headers = {}) => {
      requests.push({ method: request.method, bucket, key, list: url.searchParams.get("prefix"), status });
      response.writeHead(status, { "content-type": "application/xml", ...headers });
      response.end(request.method === "HEAD" ? "" : body);
    };
    const error = (status, code) => send(status, `<?xml version="1.0" encoding="UTF-8"?><Error><Code>${code}</Code><Message>${code}</Message><Key>${xmlEscape(key)}</Key></Error>`);
    if (request.method !== "GET" && request.method !== "HEAD") return error(403, "AccessDenied");
    if (!key && url.searchParams.get("list-type") === "2") {
      const prefix = url.searchParams.get("prefix") ?? "";
      const delimiter = url.searchParams.get("delimiter");
      const max = Number(url.searchParams.get("max-keys") ?? 1000);
      const keys = [...bodies.keys()].filter((k) => k.startsWith(prefix) && (!delimiter || !k.slice(prefix.length).includes(delimiter))).sort().slice(0, max);
      const contents = keys.map((k) => `<Contents><Key>${xmlEscape(k)}</Key><LastModified>2026-10-01T09:00:00.000Z</LastModified><ETag>"fixture"</ETag><Size>${bodies.get(k).length}</Size><StorageClass>STANDARD</StorageClass></Contents>`).join("");
      return send(200, `<?xml version="1.0" encoding="UTF-8"?><ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>${xmlEscape(bucket)}</Name><Prefix>${xmlEscape(prefix)}</Prefix><KeyCount>${keys.length}</KeyCount><MaxKeys>${max}</MaxKeys>${delimiter ? `<Delimiter>${xmlEscape(delimiter)}</Delimiter>` : ""}<IsTruncated>false</IsTruncated>${contents}</ListBucketResult>`);
    }
    const body = bodies.get(key);
    if (!body) return error(404, "NoSuchKey");
    return send(200, body, { "content-type": "application/json", "content-length": String(body.length), etag: '"fixture"', "last-modified": "Thu, 01 Oct 2026 09:00:00 GMT" });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    keys: [...bodies.keys()].sort(),
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
