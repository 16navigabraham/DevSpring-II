"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, Shield, ExternalLink, Clock, AlertCircle } from "lucide-react"

export default function BuilderScoreCard({ walletAddress, onVerificationComplete }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleAttest = async () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false)
      setIsVerified(true)
      setIsModalOpen(false)
      onVerificationComplete?.(true)
    }, 3000)
  }

  if (!walletAddress) return null

  return (
    <Card className="glass-card border-blue-500/20 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-white text-lg">Builder Score Verification</div>
              <div className="text-sm text-blue-300">{isVerified ? "Verified Builder" : "Verification Required"}</div>
            </div>
          </div>

          {isVerified ? (
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Verified</span>
            </div>
          ) : (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Shield className="w-4 h-4 mr-2" />
                  Attest Builder Score
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-blue-500/20 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-blue-400" />
                    Verify Builder Score
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-yellow-300 font-medium text-sm">Coming Soon</p>
                        <p className="text-blue-200 text-sm mt-1">
                          Builder Score verification through Talent Protocol is currently in development. For now, you
                          can proceed without verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">What is Builder Score?</h3>
                      <p className="text-blue-200 text-sm">
                        Builder Score measures your contributions to the developer ecosystem through GitHub activity,
                        on-chain transactions, and community engagement.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="text-blue-400 font-semibold">GitHub</div>
                        <div className="text-xs text-blue-300">Code Contributions</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="text-emerald-400 font-semibold">On-Chain</div>
                        <div className="text-xs text-blue-300">Transaction History</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="text-cyan-400 font-semibold">Social</div>
                        <div className="text-xs text-blue-300">Community Activity</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="text-purple-400 font-semibold">Reputation</div>
                        <div className="text-xs text-blue-300">Peer Recognition</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-blue-300 text-sm">
                      <span>Powered by</span>
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-medium">Talent Protocol</span>
                    </div>
                  </div>

                  <Button onClick={handleAttest} disabled={isVerifying} className="btn-primary w-full">
                    {isVerifying ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Simulate Verification
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-blue-400 text-center">
                    This is a demo. Real verification will connect to Talent Protocol APIs.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!isVerified && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-medium text-sm">Verification Required</p>
              <p className="text-yellow-200 text-sm mt-1">
                You need to verify your Builder Score to create campaigns. Click "Attest Builder Score" to begin
                verification.
              </p>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">85</div>
                <div className="text-sm text-blue-300">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">25</div>
                <div className="text-xs text-blue-300">GitHub</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-400">30</div>
                <div className="text-xs text-blue-300">On-Chain</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-cyan-400">30</div>
                <div className="text-xs text-blue-300">Social</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
