"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

// NOTE: This file is an adapter that provides a small subset of the original
// `@privy-io/react-auth` API used across the app. It wraps the (hypothetical)
// Reown AppKit SDK so the rest of the codebase can be updated with minimal
// behavioural changes.

// Assumptions about Reown AppKit SDK (adjust if the actual SDK differs):
// - There's a client SDK you can import as `reown` (replace with the real
//   package name when installing).
// - It exposes `init({ appId, options })`, `login()`, `logout()`,
//   `connectWallet()`, and an `on(event, cb)` API for events like
//   'authChanged' and 'walletChanged'.
// If the real SDK uses different methods, map them here.

let reown = null
try {
  // Replace this with the real package name, e.g. `import reown from 'reown-appkit'`
  // We use dynamic require to avoid build-time errors if the package is not yet installed.
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  reown = require("reown-appkit").default
} catch (e) {
  // SDK not installed; we'll fallback to a no-op adapter that keeps app stable.
  reown = null
}

const ReownContext = createContext(null)

export function ReownProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const setup = async () => {
      try {
        if (!reown) {
          // SDK missing - remain in a ready state but unauthenticated
          setReady(true)
          return
        }

        // Initialize with environment variable if available
        const appId = process.env.NEXT_PUBLIC_REOWN_APP_ID || process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""
        await reown.init({ appId })

        // Example event subscriptions - adapt to actual SDK
        if (reown.on) {
          reown.on("authChanged", (state) => {
            setAuthenticated(!!state?.authenticated)
            setUser(state?.user || null)
          })

          reown.on("walletChanged", (wallet) => {
            setUser((prev) => ({ ...(prev || {}), wallet }))
          })
        }

        // Query initial state if SDK exposes it
        const initial = reown.getState ? await reown.getState() : null
        if (initial) {
          setAuthenticated(!!initial.authenticated)
          setUser(initial.user || null)
        }

        setReady(true)
      } catch (e) {
        console.error("Reown init error:", e)
        setReady(true)
      }
    }

    setup()
  }, [])

  const login = async () => {
    if (!reown) throw new Error("Reown SDK not installed")
    return reown.login()
  }

  const logout = async () => {
    if (!reown) throw new Error("Reown SDK not installed")
    return reown.logout()
  }

  const connectWallet = async () => {
    if (!reown) throw new Error("Reown SDK not installed")
    return reown.connectWallet()
  }

  const value = {
    ready,
    authenticated,
    user,
    login,
    logout,
    connectWallet,
  }

  return <ReownContext.Provider value={value}>{children}</ReownContext.Provider>
}

export function useReown() {
  const ctx = useContext(ReownContext)
  if (!ctx) {
    throw new Error("useReown must be used within ReownProvider")
  }
  return ctx
}

export default {
  ReownProvider,
  useReown,
}
