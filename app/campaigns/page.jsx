"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Users,
  Target,
  ExternalLink,
  Wallet,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react"
import { getAllCampaigns, contributeToCampaign,getContribution, refundContribution } from "@/lib/web3"
import { LogoutButton } from "@/components/LogoutButton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function CampaignsPage() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [contributing, setContributing] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [contributionAmount, setContributionAmount] = useState("")
  const [userContributions, setUserContributions] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [userAddress, setUserAddress] = useState("")

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      router.push("/")
      return
    }
    loadCampaigns()
  }, [ready, authenticated, router])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's wallet address
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setUserAddress(accounts[0])

          // Load all campaigns
          const allCampaigns = await getAllCampaigns()
          setCampaigns(allCampaigns)

          // Load user contributions for each campaign
          const contributions = {}
          for (const campaign of allCampaigns) {
            try {
              const contribution = awaitgetContribution(campaign.address, accounts[0])
              contributions[campaign.address] = contribution
            } catch (error) {
              console.error(`Error getting contribution for ${campaign.address}:`, error)
              contributions[campaign.address] = "0"
            }
          }
          setUserContributions(contributions)
        }
      }
    } catch (error) {
      console.error("Error loading campaigns:", error)
      setError("Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = async () => {
    if (!selectedCampaign || !contributionAmount) return

    try {
      setContributing(true)
      setError(null)

      await contributeToCampaign(selectedCampaign.address, contributionAmount)

      setSuccess(`Successfully contributed ${contributionAmount} ETH to ${selectedCampaign.title}!`)
      setSelectedCampaign(null)
      setContributionAmount("")

      // Reload campaigns
      await loadCampaigns()
    } catch (error) {
      console.error("Error contributing to campaign:", error)
      setError(error.message || "Failed to contribute to campaign")
    } finally {
      setContributing(false)
    }
  }

  const handleRefund = async (campaign) => {
    try {
      setRefunding(true)
      setError(null)

      await refundContribution(campaign.address)

      setSuccess(`Successfully requested refund from ${campaign.title}!`)

      // Reload campaigns
      await loadCampaigns()
    } catch (error) {
      console.error("Error requesting refund:", error)
      setError(error.message || "Failed to request refund")
    } finally {
      setRefunding(false)
    }
  }

  const getProgressPercentage = (raised, goal) => {
    return Math.min((Number.parseFloat(raised) / Number.parseFloat(goal)) * 100, 100)
  }

  const getDaysLeft = (deadline) => {
    const now = new Date()
    const end = new Date(deadline)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getCampaignStatus = (campaign) => {
    const progress = getProgressPercentage(campaign.raised, campaign.goal)
    const daysLeft = getDaysLeft(campaign.deadline)

    if (campaign.withdrawn) {
      return { status: "withdrawn", label: "Withdrawn", icon: CheckCircle, color: "text-emerald-400" }
    } else if (!campaign.isActive && campaign.isGoalMet) {
      return { status: "success", label: "Successful", icon: CheckCircle, color: "text-emerald-400" }
    } else if (!campaign.isActive && !campaign.isGoalMet) {
      return { status: "failed", label: "Failed", icon: XCircle, color: "text-red-400" }
    } else if (campaign.isActive && daysLeft > 0) {
      return { status: "active", label: "Active", icon: Clock, color: "text-blue-400" }
    } else {
      return { status: "ended", label: "Ended", icon: XCircle, color: "text-gray-400" }
    }
  }

  const canContribute = (campaign) => {
    return campaign.isActive && getDaysLeft(campaign.deadline) > 0
  }

  const canRefund = (campaign) => {
    const userContribution = Number.parseFloat(userContributions[campaign.address] || "0")
    return userContribution > 0 && (campaign.canAutoRefund || (!campaign.isActive && !campaign.isGoalMet))
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-800/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex space-x-3">
            <Button
              onClick={loadCampaigns}
              variant="ghost"
              className="text-blue-200 hover:text-white hover:bg-blue-800/20"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-800/20">
                <Users className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/create">
              <Button className="btn-primary">Create Campaign</Button>
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image src="/SpringDev.png" alt="DevSpring" width={64} height={64} className="rounded-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Explore Campaigns
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Discover and support innovative projects from verified builders
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium text-sm">Error</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
            <p className="text-emerald-300 text-sm">{success}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-200">Loading campaigns...</p>
          </div>
        )}

        {/* No Campaigns State */}
        {!loading && campaigns.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Available</h3>
            <p className="text-blue-200 mb-6">Be the first to create a campaign!</p>
            <Link href="/create">
              <Button className="btn-primary">Create First Campaign</Button>
            </Link>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => {
              const campaignStatus = getCampaignStatus(campaign)
              const StatusIcon = campaignStatus.icon
              const progress = getProgressPercentage(campaign.raised, campaign.goal)
              const userContribution = userContributions[campaign.address] || "0"

              return (
                <Card
                  key={campaign.id}
                  className="glass-card border-blue-500/20 hover:border-blue-400/40 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-bold text-white">{campaign.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-5 h-5 ${campaignStatus.color}`} />
                        <span className={`text-sm font-medium ${campaignStatus.color}`}>{campaignStatus.label}</span>
                      </div>
                    </div>
                    <p className="text-blue-200 text-sm line-clamp-3">{campaign.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-blue-200">Progress</span>
                        <span className="text-emerald-400 font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-blue-300">Raised</div>
                        <div className="text-white font-semibold">{campaign.raised} ETH</div>
                      </div>
                      <div>
                        <div className="text-blue-300">Goal</div>
                        <div className="text-white font-semibold">{campaign.goal} ETH</div>
                      </div>
                      <div>
                        <div className="text-blue-300">Days Left</div>
                        <div className="text-white font-semibold">{getDaysLeft(campaign.deadline)}</div>
                      </div>
                      <div>
                        <div className="text-blue-300">Your Contribution</div>
                        <div className="text-white font-semibold">
                          {Number.parseFloat(userContribution).toFixed(4)} ETH
                        </div>
                      </div>
                    </div>

                    {/* Creator Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-300">Creator:</span>
                      <a
                        href={`https://basescan.org/address/${campaign.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono"
                      >
                        {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                      </a>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {canContribute(campaign) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="btn-primary flex-1" onClick={() => setSelectedCampaign(campaign)}>
                              <Wallet className="w-4 h-4 mr-2" />
                              Contribute
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card border-blue-500/20">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-white">
                                Contribute to {selectedCampaign?.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-blue-300">Goal</div>
                                    <div className="text-white font-semibold">{selectedCampaign?.goal} ETH</div>
                                  </div>
                                  <div>
                                    <div className="text-blue-300">Raised</div>
                                    <div className="text-white font-semibold">{selectedCampaign?.raised} ETH</div>
                                  </div>
                                  <div>
                                    <div className="text-blue-300">Days Left</div>
                                    <div className="text-white font-semibold">
                                      {selectedCampaign ? getDaysLeft(selectedCampaign.deadline) : 0}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-blue-300">Your Previous</div>
                                    <div className="text-white font-semibold">
                                      {selectedCampaign
                                        ? Number.parseFloat(userContributions[selectedCampaign.address] || "0").toFixed(
                                            4,
                                          )
                                        : 0}{" "}
                                      ETH
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-blue-200 mb-2">
                                  Contribution Amount (ETH)
                                </label>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  value={contributionAmount}
                                  onChange={(e) => setContributionAmount(e.target.value)}
                                  placeholder="0.001"
                                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <Button
                                onClick={handleContribute}
                                disabled={
                                  contributing || !contributionAmount || Number.parseFloat(contributionAmount) <= 0
                                }
                                className="btn-primary w-full"
                              >
                                {contributing ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Contributing...
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Wallet className="w-4 h-4 mr-2" />
                                    Contribute {contributionAmount || "0"} ETH
                                  </div>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {canRefund(campaign) && (
                        <Button
                          onClick={() => handleRefund(campaign)}
                          disabled={refunding}
                          className="btn-secondary flex-1"
                        >
                          {refunding ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Refunding...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Refund
                            </div>
                          )}
                        </Button>
                      )}

                      <a
                        href={`https://basescan.org/address/${campaign.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full text-blue-300 border-blue-500/20 hover:bg-blue-500/10 bg-transparent"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Contract
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
