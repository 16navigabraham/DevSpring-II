"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Target,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  RotateCcw,
  Info,
} from "lucide-react"
import {
  getAllCampaigns,
  withdrawFunds,
  getTokenBalance,
  getCampaignDetails,
  getFeePercentage,
  refundContribution,
} from "@/lib/web3"
import { LogoutButton } from "@/components/LogoutButton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState([])
  const [userCampaigns, setUserCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [campaignDetails, setCampaignDetails] = useState(null)
  const [userBalance, setUserBalance] = useState("0")
  const [feePercentage, setFeePercentage] = useState(0)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [userAddress, setUserAddress] = useState("")

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      router.push("/")
      return
    }
    loadDashboardData()
  }, [ready, authenticated, router])

  const loadDashboardData = async () => {
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

          // Filter campaigns created by this user
          const userCreatedCampaigns = allCampaigns.filter(
            (campaign) => campaign.creator.toLowerCase() === accounts[0].toLowerCase(),
          )
          setUserCampaigns(userCreatedCampaigns)

          // Load user balance and fee percentage
          const [balance, fee] = await Promise.all([getTokenBalance(accounts[0]), getFeePercentage()])
          setUserBalance(balance)
          setFeePercentage(fee)
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!selectedCampaign) return

    try {
      setWithdrawing(true)
      setError(null)

      await withdrawFunds(selectedCampaign.address)

      setSuccess(
        `Successfully withdrew funds from ${selectedCampaign.title}! Dev fee of ${feePercentage}% was deducted.`,
      )
      setSelectedCampaign(null)
      setCampaignDetails(null)

      // Reload dashboard data
      await loadDashboardData()
    } catch (error) {
      console.error("Error withdrawing funds:", error)
      setError(error.message || "Failed to withdraw funds")
    } finally {
      setWithdrawing(false)
    }
  }

  const handleAutoRefund = async (campaign) => {
    try {
      setRefunding(true)
      setError(null)

      await refundContribution(campaign.address)

      setSuccess(`Auto-refund initiated for ${campaign.title}. Contributors can now claim their refunds.`)

      // Reload dashboard data
      await loadDashboardData()
    } catch (error) {
      console.error("Error initiating auto-refund:", error)
      setError(error.message || "Failed to initiate auto-refund")
    } finally {
      setRefunding(false)
    }
  }

  const loadCampaignDetails = async (campaign) => {
    try {
      const details = await getCampaignDetails(campaign.address)
      setCampaignDetails(details)
      setSelectedCampaign(campaign)
    } catch (error) {
      console.error("Error loading campaign details:", error)
      setError("Failed to load campaign details")
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

  const getWithdrawalDaysLeft = (withdrawalDeadline) => {
    const now = new Date()
    const end = new Date(withdrawalDeadline)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getCampaignStatus = (campaign) => {
    const progress = getProgressPercentage(campaign.raised, campaign.goal)
    const daysLeft = getDaysLeft(campaign.deadline)

    if (campaign.withdrawn) {
      return { status: "withdrawn", label: "Withdrawn", icon: CheckCircle, color: "text-emerald-400" }
    } else if (!campaign.isActive && campaign.isGoalMet && !campaign.withdrawn) {
      const withdrawalDaysLeft = getWithdrawalDaysLeft(campaign.withdrawalDeadline)
      if (withdrawalDaysLeft > 0) {
        return {
          status: "withdrawal_period",
          label: `Withdraw (${withdrawalDaysLeft}d left)`,
          icon: Clock,
          color: "text-yellow-400",
        }
      } else {
        return { status: "grace_expired", label: "Grace Period Expired", icon: XCircle, color: "text-red-400" }
      }
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

  const canWithdraw = (campaign) => {
    return (
      !campaign.isActive &&
      campaign.isGoalMet &&
      !campaign.withdrawn &&
      getWithdrawalDaysLeft(campaign.withdrawalDeadline) > 0
    )
  }

  const getUserStats = () => {
    const totalCampaigns = userCampaigns.length
    const activeCampaigns = userCampaigns.filter((c) => c.isActive).length
    const successfulCampaigns = userCampaigns.filter((c) => c.isGoalMet && c.withdrawn).length
    const totalRaised = userCampaigns.reduce((sum, campaign) => sum + Number.parseFloat(campaign.raised), 0)

    return { totalCampaigns, activeCampaigns, successfulCampaigns, totalRaised: totalRaised.toFixed(4) }
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
              onClick={loadDashboardData}
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
            <LogoutButton />
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image src="/SpringDev.png" alt="DevSpring" width={64} height={64} className="rounded-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            My Dashboard
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">Monitor your campaigns and manage your funds</p>
          {userAddress && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <Wallet className="w-4 h-4 text-blue-300" />
              <a
                href={`https://basescan.org/address/${userAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 text-sm font-mono"
              >
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </a>
              <ExternalLink className="w-3 h-3 text-blue-400" />
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

        {/* Stats Overview */}
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
              <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
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
              const campaignStatus = getCampaignStatus(campaign)
              const StatusIcon = campaignStatus.icon
              const progress = getProgressPercentage(campaign.raised, campaign.goal)

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
                        <div className="text-blue-300">Withdrawal Days</div>
                        <div className="text-white font-semibold">
                          {campaign.isGoalMet && !campaign.withdrawn
                            ? getWithdrawalDaysLeft(campaign.withdrawalDeadline)
                            : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
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

                      {canWithdraw(campaign) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="btn-primary flex-1" onClick={() => loadCampaignDetails(campaign)}>
                              <Wallet className="w-4 h-4 mr-2" />
                              Withdraw
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card border-blue-500/20">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-white">Withdraw Funds</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                                  <span className="text-emerald-300 font-medium">Campaign Successful!</span>
                                </div>
                                <p className="text-emerald-200 text-sm">
                                  Your campaign reached its funding goal. You can withdraw the raised funds.
                                </p>
                              </div>

                              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Info className="w-5 h-5 text-yellow-400" />
                                  <span className="text-yellow-300 font-medium">Dev Fee Notice</span>
                                </div>
                                <p className="text-yellow-200 text-sm">
                                  A {feePercentage}% development fee will be deducted from the withdrawal amount.
                                </p>
                              </div>

                              {campaignDetails && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <div className="text-blue-300">Amount to Withdraw</div>
                                      <div className="text-white font-semibold">
                                        {campaignDetails.totalFundsRaised} ETH
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-blue-300">Dev Fee ({feePercentage}%)</div>
                                      <div className="text-white font-semibold">
                                        {(
                                          (Number.parseFloat(campaignDetails.totalFundsRaised) * feePercentage) /
                                          100
                                        ).toFixed(4)}{" "}
                                        ETH
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-blue-300">You'll Receive</div>
                                      <div className="text-white font-semibold">
                                        {(
                                          (Number.parseFloat(campaignDetails.totalFundsRaised) *
                                            (100 - feePercentage)) /
                                          100
                                        ).toFixed(4)}{" "}
                                        ETH
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-blue-300">Withdrawal Deadline</div>
                                      <div className="text-white font-semibold">
                                        {getWithdrawalDaysLeft(campaignDetails.withdrawalDeadline)} days left
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <Button onClick={handleWithdraw} disabled={withdrawing} className="btn-primary w-full">
                                {withdrawing ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Withdrawing...
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Wallet className="w-4 h-4 mr-2" />
                                    Confirm Withdrawal
                                  </div>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {campaign.canAutoRefund && (
                        <Button
                          onClick={() => handleAutoRefund(campaign)}
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
                              Auto-Refund
                            </div>
                          )}
                        </Button>
                      )}
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
