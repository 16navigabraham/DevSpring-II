"use client"

import { ReownProvider } from "@/lib/reown"

export function Providers({ children }) {
  // The Reown adapter reads NEXT_PUBLIC_REOWN_APP_ID or falls back to
  // NEXT_PUBLIC_PRIVY_APP_ID for compatibility. Configure any provider-level
  // options inside `lib/reown.js` if the real SDK requires them.
  return <ReownProvider>{children}</ReownProvider>
}
