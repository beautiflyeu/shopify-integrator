import type { SyncedProduct, ProductStatus } from "@/types/product";

export function createSyncState(
  pimId: string,
  shopifyId: string | null = null
): SyncedProduct {
  return {
    pimId,
    shopifyId,
    lastSyncedHash: null,
    lastSyncedAt: null,
    status: shopifyId ? "unchanged" : "new",
  };
}

export function updateSyncState(
  state: SyncedProduct,
  newHash: string,
  newStatus: ProductStatus
): SyncedProduct {
  return {
    ...state,
    lastSyncedHash: newHash,
    lastSyncedAt: new Date().toISOString(),
    status: newStatus,
  };
}

export function resolveSyncStatus(
  currentHash: string,
  lastSyncedHash: string | null,
  existsInShopify: boolean
): ProductStatus {
  if (!existsInShopify) return "new";
  if (!lastSyncedHash) return "needs_decision";
  if (currentHash !== lastSyncedHash) return "changed";
  return "unchanged";
}
