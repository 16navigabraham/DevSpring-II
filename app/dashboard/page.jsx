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
  TrendingUp,
  RefreshCw,
  ExternalLink,
  User,
  AlertCircle,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { getAllCampaigns, withdrawFunds } from "@/lib/web3"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState([])
  const [userCampaigns, setUserCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [userAddress, setUserAddress] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      router.push("/")
      return
    }

    // Get user wallet address
    if (user?.wallet?.address) {
      setUserAddress(user.wallet.address)
      loadCampaigns()
    }
  }, [ready, authenticated, user, router])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      const allCampaigns = await getAllCampaigns()
      setCampaigns(allCampaigns)

      // Filter campaigns created by current user
      if (user?.wallet?.address) {
        const userCreatedCampaigns = allCampaigns.filter(
          (campaign) => campaign.creator.toLowerCase() === user.wallet.address.toLowerCase(),
        )
        setUserCampaigns(userCreatedCampaigns)
      }
    } catch (error) {
      console.error("Error loading campaigns:", error)
      setError("Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawFunds = async (campaign) => {
    if (!campaign) return

    try {
      setWithdrawing(true)
      setError(null)

      await withdrawFunds(campaign.address)
      setSuccess(`Successfully withdrew funds from ${campaign.title}!`)
      setSelectedCampaign(null)

      // Reload campaigns to show updated status
      await loadCampaigns()
    } catch (error) {
      console.error("Error withdrawing funds:", error)
      setError(error.message || "Failed to withdraw funds")
    } finally {
      setWithdrawing(false)
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

  const canWithdraw = (campaign) => {
    const progress = getProgressPercentage(campaign.raised, campaign.goal)
    const isEnded = !campaign.isActive || getDaysLeft(campaign.deadline) === 0
    return isEnded && progress >= 100 // Can withdraw if campaign ended and goal reached
  }

  const getUserStats = () => {
    const totalRaised = userCampaigns.reduce((sum, campaign) => sum + Number.parseFloat(campaign.raised), 0)
    const activeCampaigns = userCampaigns.filter((c) => c.isActive).length
    const successfulCampaigns = userCampaigns.filter((c) => getProgressPercentage(c.raised, c.goal) >= 100).length

    return {
      totalRaised: totalRaised.toFixed(2),
      activeCampaigns,
      totalCampaigns: userCampaigns.length,
      successfulCampaigns,
    }
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

  const stats = getUserStats()

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
            <Link href="/create">
              <Button className="btn-primary">Create Campaign</Button>
            </Link>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            My Dashboard
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">Monitor and manage your crowdfunding campaigns</p>
          {userAddress && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <User className="w-4 h-4 text-blue-300" />
              <span className="text-blue-300 text-sm">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>
              <a
                href={`https://basescan.org/address/${userAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
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

        {/* User Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.totalCampaigns}</div>
              <div className="text-blue-200 text-sm">Total Campaigns</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.activeCampaigns}</div>
              <div className="text-blue-200 text-sm">Active Campaigns</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.successfulCampaigns}</div>
              <div className="text-blue-200 text-sm">Successful</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.totalRaised} ETH</div>
              <div className="text-blue-200 text-sm">Total Raised</div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-200">Loading your campaigns...</p>
          </div>
        )}

        {/* No Campaigns State */}
        {!loading && userCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
            <p className="text-blue-200 mb-6">Create your first campaign to get started!</p>
            <Link href="/create">
              <Button className="btn-primary">Create First Campaign</Button>
            </Link>
          </div>
        )}

        {/* User Campaigns Grid */}
        {!loading && userCampaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userCampaigns.map((campaign) => {
              const progress = getProgressPercentage(campaign.raised, campaign.goal)
              const daysLeft = getDaysLeft(campaign.deadline)
              const isEnded = !campaign.isActive || daysLeft === 0
              const goalReached = progress >= 100
              const canWithdrawFunds = canWithdraw(campaign)

              return (
                <Card
                  key={campaign.id}
                  className="glass-card border-blue-500/20 hover:border-blue-400/40 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-bold text-white">{campaign.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 rounded-full">
                          <span className="text-lg">⟠</span>
                          <span className="text-xs text-blue-300">ETH</span>
                        </div>
                        {goalReached && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        {isEnded && !goalReached && <XCircle className="w-5 h-5 text-red-400" />}
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
                        <div className="text-blue-300">Status</div>
                        <div
                          className={`font-semibold ${
                            goalReached ? "text-emerald-400" : campaign.isActive ? "text-blue-400" : "text-red-400"
                          }`}
                        >
                          {goalReached ? "Success" : campaign.isActive ? "Active" : "Ended"}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-300">Days Left</div>
                        <div className="text-white font-semibold">{daysLeft}</div>
                      </div>
                    </div>

                    {/* Links */}
                    {(campaign.githubRepo || campaign.liveSiteUrl) && (
                      <div className="flex space-x-2">
                        {campaign.githubRepo && (
                          <a
                            href={campaign.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            GitHub
                          </a>
                        )}
                        {campaign.liveSiteUrl && (
                          <a
                            href={campaign.liveSiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Live Site
                          </a>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Withdraw Funds Button */}
                      {canWithdrawFunds && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="btn-primary w-full" onClick={() => setSelectedCampaign(campaign)}>
                              <Download className="w-4 h-4 mr-2" />
                              Withdraw Funds
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card border-blue-500/20">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-white">
                                Withdraw Funds from {selectedCampaign?.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                                  <span className="text-emerald-300 font-medium">Campaign Successful!</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-emerald-300">Amount to Withdraw</div>
                                    <div className="text-white font-semibold text-lg">
                                      {selectedCampaign?.raised} ETH
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-emerald-300">Goal Achievement</div>
                                    <div className="text-white font-semibold">
                                      {getProgressPercentage(selectedCampaign?.raised, selectedCampaign?.goal).toFixed(
                                        1,
                                      )}
                                      %
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <p className="text-blue-200 text-sm">
                                  <strong>Note:</strong> Once you withdraw the funds, they will be transferred to your
                                  wallet. This action cannot be undone.
                                </p>
                              </div>

                              <Button
                                onClick={() => handleWithdrawFunds(selectedCampaign)}
                                disabled={withdrawing}
                                className="btn-primary w-full"
                              >
                                {withdrawing ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Withdrawing...
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Download className="w-4 h-4 mr-2" />
                                    Confirm Withdrawal
                                  </div>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Campaign Status Info */}
                      {!canWithdrawFunds && (
                        <div className="text-center p-3 bg-slate-700/20 rounded-lg">
                          <div className="text-sm text-blue-300">
                            {!isEnded ? (
                              <div className="flex items-center justify-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>Campaign Active - {daysLeft} days left</span>
                              </div>
                            ) : !goalReached ? (
                              <div className="flex items-center justify-center space-x-2 text-red-300">
                                <XCircle className="w-4 h-4" />
                                <span>Goal not reached - No funds to withdraw</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2 text-yellow-300">
                                <AlertCircle className="w-4 h-4" />
                                <span>Funds already withdrawn</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Quick Actions */}
        {!loading && userCampaigns.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex space-x-4">
              <Link href="/create">
                <Button className="btn-primary">
                  <Target className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button className="btn-secondary">
                  <Users className="w-4 h-4 mr-2" />
                  Explore All Campaigns
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
