// Re-exports thin wrappers around the in-memory mock store so pages can
// import actions without depending on the state library directly.
// Production: replace with real API calls via the backend AI Gateway / Supabase.
import { useAppStore } from "@/store/useAppStore";

export const mockActions = {
  notifyOwner: (...a: Parameters<typeof useAppStore.getState>["arguments"] extends never ? never : never) => null,
};

// Convenience accessor
export const getStore = () => useAppStore.getState();
