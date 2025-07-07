"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Users, Target, Coins, TrendingUp, RefreshCw, ExternalLink, User, AlertCircle } from "lucide-react"
import { getAllCampaigns, contributeToCampaign, getTokenBalance } from "@/lib/web3"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CampaignsPage() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [contributing, setContributing] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [contributionAmount, setContributionAmount] = useState("")
  const [userBalance, setUserBalance] = useState("0")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

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
      const campaignData = await getAllCampaigns()
      setCampaigns(campaignData)
    } catch (error) {
      console.error("Error loading campaigns:", error)
      setError("Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }

  const loadUserBalance = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const balance = await getTokenBalance(accounts[0])
          setUserBalance(balance)
        }
      }
    } catch (error) {
      console.error("Error loading balance:", error)
    }
  }

  const handleContribute = async () => {
    if (!selectedCampaign || !contributionAmount) return

    try {
      setContributing(true)
      setError(null)

      await contributeToCampaign(selectedCampaign.address, contributionAmount)

      setSuccess(`Successfully contributed ${contributionAmount} ETH!`)
      setContributionAmount("")
      setSelectedCampaign(null)

      // Reload campaigns to show updated amounts
      await loadCampaigns()
    } catch (error) {
      console.error("Error contributing:", error)
      setError(error.message || "Failed to contribute")
    } finally {
      setContributing(false)
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

  const getTotalStats = () => {
    const totalRaised = campaigns.reduce((sum, campaign) => sum + Number.parseFloat(campaign.raised), 0)
    const activeCampaigns = campaigns.filter((c) => c.isActive).length
    return { totalRaised: totalRaised.toFixed(2), activeCampaigns, totalCampaigns: campaigns.length }
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

  const stats = getTotalStats()

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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stats.totalRaised} ETH</div>
              <div className="text-blue-200 text-sm">Total Raised</div>
            </CardContent>
          </Card>

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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-200">Loading campaigns...</p>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && campaigns.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
            <p className="text-blue-200 mb-6">Be the first to create a campaign!</p>
            <Link href="/create">
              <Button className="btn-primary">Create First Campaign</Button>
            </Link>
          </div>
        )}

        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="glass-card border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-bold text-white">{campaign.title}</CardTitle>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 rounded-full">
                      <span className="text-lg">⟠</span>
                      <span className="text-xs text-blue-300">ETH</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-blue-300 mb-3">
                    <User className="w-4 h-4 mr-1" />
                    {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                  </div>
                  <p className="text-blue-200 text-sm line-clamp-3">{campaign.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-200">Progress</span>
                      <span className="text-emerald-400 font-medium">
                        {getProgressPercentage(campaign.raised, campaign.goal).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(campaign.raised, campaign.goal)}%` }}
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
                      <div className={`font-semibold ${campaign.isActive ? "text-emerald-400" : "text-red-400"}`}>
                        {campaign.isActive ? "Active" : "Ended"}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300">Days Left</div>
                      <div className="text-white font-semibold">{getDaysLeft(campaign.deadline)}</div>
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

                  {/* Action Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="btn-primary w-full"
                        disabled={!campaign.isActive}
                        onClick={() => {
                          setSelectedCampaign(campaign)
                          loadUserBalance()
                        }}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        {campaign.isActive ? "Contribute" : "Campaign Ended"}
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
                              <div className="text-blue-300">Your Balance</div>
                              <div className="text-white font-semibold">
                                {Number.parseFloat(userBalance).toFixed(4)} ETH
                              </div>
                            </div>
                            <div>
                              <div className="text-blue-300">Campaign Goal</div>
                              <div className="text-white font-semibold">{selectedCampaign?.goal} ETH</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-2">
                            Contribution Amount (ETH)
                          </label>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            max={userBalance}
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            placeholder="0.001"
                            className="input-field"
                          />
                        </div>

                        <Button
                          onClick={handleContribute}
                          disabled={
                            contributing ||
                            !contributionAmount ||
                            Number.parseFloat(contributionAmount) > Number.parseFloat(userBalance)
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
                              <Coins className="w-4 h-4 mr-2" />
                              Contribute {contributionAmount} ETH
                            </div>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
