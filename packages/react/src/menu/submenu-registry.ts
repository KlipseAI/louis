"use client";

import { createContext, useContext, type Provider } from "react";

/**
 * 부모 menu가 소유하는 submenu 등록소.
 *
 * 별도 모듈인 이유는 순환 import를 끊기 위해서다 — Content가 registry를 만들고 Sub가 그것을
 * 읽는데, 둘을 한 파일에 두면 `action-menu ↔ sub` 사이클이 생긴다. 사이클은 번들러와
 * 평가 순서에 따라 조용히 깨지는 종류의 결함이다.
 */

export interface SubmenuRegistry {
  register(subTriggerId: string, open: () => void): () => void;
  /** 부모의 ArrowRight가 부른다. */
  open(subTriggerId: string): void;
  /** 배치가 끝나 실제로 열렸음을 알린다. 부모는 그동안 세로 이동을 삼키고 있었다. */
  notifyOpened(subTriggerId: string): void;
}

const SubmenuRegistryContext = createContext<SubmenuRegistry | null>(null);

export const SubmenuRegistryProvider: Provider<SubmenuRegistry | null> =
  SubmenuRegistryContext.Provider;

export function useSubmenuRegistry(): SubmenuRegistry | null {
  return useContext(SubmenuRegistryContext);
}

export function createSubmenuRegistry(pendingEntryRef: {
  current: string | null;
}): SubmenuRegistry {
  const openers = new Map<string, () => void>();
  return {
    register(id, open) {
      openers.set(id, open);
      return () => {
        openers.delete(id);
      };
    },
    open(id) {
      openers.get(id)?.();
    },
    notifyOpened(id) {
      if (pendingEntryRef.current === id) pendingEntryRef.current = null;
    },
  };
}
