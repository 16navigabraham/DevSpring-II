"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, Shield, ExternalLink, AlertCircle, Loader2 } from "lucide-react"
import { getBuilderScore, verifyBuilderEligibility } from "@/lib/builderScore"

export function BuilderScoreCard({ walletAddress, onVerificationComplete }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [builderData, setBuilderData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (walletAddress && !builderData) {
      loadBuilderScore()
    }
  }, [walletAddress])

  const loadBuilderScore = async () => {
    try {
      setError(null)
      const data = await getBuilderScore(walletAddress)
      setBuilderData(data)

      if (data.isEligible) {
        setIsVerified(true)
        onVerificationComplete?.(true)
      }
    } catch (error) {
      console.error("Error loading builder score:", error)
      setError("Failed to load builder score")
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    setError(null)

    try {
      const eligibility = await verifyBuilderEligibility(walletAddress)

      if (eligibility.isEligible) {
        setIsVerified(true)
        setIsModalOpen(false)
        onVerificationComplete?.(true)
      } else {
        setError(
          `Builder Score too low. Need ${eligibility.requirements.minimumScore}, have ${eligibility.requirements.currentScore}`,
        )
      }
    } catch (error) {
      console.error("Error verifying builder:", error)
      setError("Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
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
                  Verify Builder Score
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
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-red-300 font-medium text-sm">Verification Failed</p>
                          <p className="text-red-200 text-sm mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {builderData && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-white">{builderData.score}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Your Builder Score</h3>
                        <p className="text-blue-200 text-sm">
                          {builderData.isEligible
                            ? "You're eligible to create campaigns!"
                            : `Need ${40 - builderData.score} more points to qualify`}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-blue-400 font-semibold">{builderData.breakdown.github || 0}</div>
                          <div className="text-xs text-blue-300">GitHub</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-emerald-400 font-semibold">{builderData.breakdown.onchain || 0}</div>
                          <div className="text-xs text-blue-300">On-Chain</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-cyan-400 font-semibold">{builderData.breakdown.social || 0}</div>
                          <div className="text-xs text-blue-300">Social</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-purple-400 font-semibold">{builderData.breakdown.reputation || 0}</div>
                          <div className="text-xs text-blue-300">Reputation</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center space-x-2 text-blue-300 text-sm">
                    <span>Powered by</span>
                    <ExternalLink className="w-4 h-4" />
                    <span className="font-medium">Talent Protocol</span>
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying || (builderData && !builderData.isEligible)}
                    className="btn-primary w-full"
                  >
                    {isVerifying ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </div>
                    ) : builderData && !builderData.isEligible ? (
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Score Too Low
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Eligibility
                      </div>
                    )}
                  </Button>
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
                You need a Builder Score of 40+ to create campaigns. This ensures quality projects and reduces spam.
              </p>
            </div>
          </div>
        )}

        {isVerified && builderData && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{builderData.score}</div>
                <div className="text-sm text-blue-300">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">{builderData.breakdown.github || 0}</div>
                <div className="text-xs text-blue-300">GitHub</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-400">{builderData.breakdown.onchain || 0}</div>
                <div className="text-xs text-blue-300">On-Chain</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-cyan-400">{builderData.breakdown.social || 0}</div>
                <div className="text-xs text-blue-300">Social</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
