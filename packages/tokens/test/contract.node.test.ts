// 소비자 관점에서 본 token package의 공개 계약을 검증한다.
// 생성기 내부 검증(verify-token-gates)과 달리 여기서는 "실제로 import해서 쓸 때"의 계약만 본다.
import { expect, test } from "vitest";
import { metadata, primitives, themes, tokens } from "@klipse-design/tokens";

test("theme별 token ID 집합이 동일하다", () => {
  const light = Object.keys(tokens.light).sort();
  const dark = Object.keys(tokens.dark).sort();
  expect(dark).toEqual(light);
  expect(light.length).toBeGreaterThan(0);
});

test("semantic alias는 실재하는 token을 가리킨다", () => {
  const known = new Set([
    ...Object.keys(primitives),
    ...themes.flatMap((theme) => Object.keys(tokens[theme] ?? {})),
    ...Object.keys(tokens.global ?? {}),
  ]);
  for (const [mode, modeTokens] of Object.entries(tokens)) {
    for (const token of Object.values(modeTokens)) {
      if (token.aliasTarget === null) continue;
      expect(
        known.has(token.aliasTarget.id),
        `${token.id}@${mode}의 alias 대상 ${token.aliasTarget.id}이 없습니다`,
      ).toBe(true);
    }
  }
});

test("primitive는 alias를 갖지 않는다", () => {
  for (const token of Object.values(primitives)) {
    expect(token.aliasTarget, `${token.id}가 alias를 가집니다`).toBeNull();
  }
});

test("layer 순서가 strictly increasing이다", () => {
  // metadata.layerOrder는 semantic ID 전체 union이고 tokens.global은 global 모드만 담는
  // 정밀 레코드다. 조회 자체는 런타임 계약이므로 넓혀서 읽는다.
  const globalTokens = tokens.global as unknown as Readonly<
    Record<string, { readonly value: unknown } | undefined>
  >;
  const values = metadata.layerOrder.map((id) => {
    const token = globalTokens[id];
    expect(token, `${id}가 global에 없습니다`).toBeDefined();
    return token?.value as number;
  });
  for (let index = 1; index < values.length; index += 1) {
    expect(
      (values[index] ?? 0) > (values[index - 1] ?? 0),
      `layerOrder가 ${metadata.layerOrder[index - 1]} → ${metadata.layerOrder[index]}에서 증가하지 않습니다`,
    ).toBe(true);
  }
});
