"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { switchToBase } from "@/lib/web3"
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"

export function WalletConnection({ onWalletConnected }) {
  const { ready, authenticated, user, connectWallet } = usePrivy()
  const [walletAddress, setWalletAddress] = useState(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (ready && authenticated && user?.wallet) {
      checkWalletConnection()
      checkNetwork()
    }
  }, [ready, authenticated, user])

  const checkWalletConnection = async () => {
    if (!authenticated || !user?.wallet) return

    try {
      setError(null)
      const address = user.wallet.address
      setWalletAddress(address)
      onWalletConnected?.(address)
    } catch (error) {
      console.error("Error checking wallet connection:", error)
      setError("Failed to connect wallet")
    }
  }

  const checkNetwork = async () => {
    if (!window.ethereum) return

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      setIsCorrectNetwork(chainId === "0x2105") // Base mainnet
    } catch (error) {
      console.error("Error checking network:", error)
    }
  }

  const handleConnectWallet = async () => {
    if (!authenticated) return

    setIsConnecting(true)
    setError(null)

    try {
      await connectWallet()
      await checkNetwork()
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setError("Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const switchNetwork = async () => {
    try {
      setError(null)
      await switchToBase()
      await checkNetwork()
    } catch (error) {
      console.error("Error switching network:", error)
      setError("Failed to switch network")
    }
  }

  if (!ready || !authenticated) {
    return null
  }

  return (
    <Card className="glass-card border-blue-500/20 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-blue-400" />
            <div>
              <div className="font-medium text-white">Wallet Connection</div>
              {walletAddress ? (
                <div className="text-sm text-blue-300 flex items-center space-x-2">
                  <span>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <a
                    href={`https://basescan.org/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="text-sm text-blue-300">Not connected</div>
              )}
              {error && <div className="text-sm text-red-400">{error}</div>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!walletAddress ? (
              <Button onClick={handleConnectWallet} disabled={isConnecting} className="btn-primary">
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : !isCorrectNetwork ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <Button onClick={switchNetwork} className="btn-secondary">
                  Switch to Base
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
