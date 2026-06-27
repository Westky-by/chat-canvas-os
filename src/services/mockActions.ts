// Thin re-export of mock store actions so pages can import from a stable
// services entrypoint. Production: swap these for real API calls routed
// through the backend AI Gateway / Supabase.
import { useAppStore } from "@/store/useAppStore";

export const getStore = () => useAppStore.getState();
