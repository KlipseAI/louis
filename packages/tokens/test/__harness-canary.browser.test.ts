import { expect, test } from 'vitest';
test('의도적 실패 canary', () => {
  expect(document.title).toBe('__never__');
});
