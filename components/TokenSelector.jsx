"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TOKENS } from "@/lib/contracts"
import { ChevronDown, Check } from "lucide-react"

export default function TokenSelector({ selectedToken, onTokenSelect, className = "" }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTokenSelect = (tokenSymbol) => {
    onTokenSelect(tokenSymbol)
    setIsOpen(false)
  }

  const selectedTokenData = TOKENS[selectedToken]

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-white/5 border-white/20 text-white hover:bg-white/10"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedTokenData.icon}</span>
          <span>{selectedTokenData.symbol}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 glass-card border-blue-500/20">
          <CardContent className="p-2">
            {Object.entries(TOKENS).map(([symbol, token]) => (
              <Button
                key={symbol}
                type="button"
                onClick={() => handleTokenSelect(symbol)}
                className="w-full justify-between p-3 mb-1 last:mb-0 bg-transparent hover:bg-white/10 text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{token.icon}</span>
                  <div>
                    <div className="font-medium text-white">{token.symbol}</div>
                    <div className="text-sm text-blue-300">{token.name}</div>
                  </div>
                </div>
                {selectedToken === symbol && <Check className="w-4 h-4 text-emerald-400" />}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
