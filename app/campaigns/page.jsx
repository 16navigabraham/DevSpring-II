"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Target, Coins, TrendingUp, RefreshCw } from "lucide-react"

export default function CampaignsPage() {
  const [loading, setLoading] = useState(false)

  // Mock campaign data
  const campaigns = [
    {
      id: 1,
      title: "DeFi Protocol Development",
      description: "Building the next generation of decentralized finance tools",
      goal: "10.0",
      raised: "7.5",
      creator: "0x1234...5678",
      isActive: true,
      daysLeft: 15,
    },
    {
      id: 2,
      title: "NFT Marketplace Platform",
      description: "Creating a user-friendly NFT trading platform",
      goal: "5.0",
      raised: "3.2",
      creator: "0xabcd...efgh",
      isActive: true,
      daysLeft: 8,
    },
    {
      id: 3,
      title: "Web3 Social Network",
      description: "Decentralized social media for the future",
      goal: "15.0",
      raised: "12.8",
      creator: "0x9876...5432",
      isActive: false,
      daysLeft: 0,
    },
  ]

  const getProgressPercentage = (raised, goal) => {
    return Math.min((Number.parseFloat(raised) / Number.parseFloat(goal)) * 100, 100)
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="ghost"
            className="text-blue-200 hover:text-white hover:bg-blue-800/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex space-x-3">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-blue-200 hover:text-white hover:bg-blue-800/20"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => (window.location.href = "/create")} className="btn-primary">
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Explore Campaigns
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Discover crowdfunding campaigns and support innovative projects
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">23.5 ETH</div>
              <div className="text-blue-200 text-sm">Total Raised</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{campaigns.length}</div>
              <div className="text-blue-200 text-sm">Total Campaigns</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{campaigns.filter((c) => c.isActive).length}</div>
              <div className="text-blue-200 text-sm">Active Campaigns</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Grid */}
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
                  <Users className="w-4 h-4 mr-1" />
                  {campaign.creator}
                </div>
                <p className="text-blue-200 text-sm">{campaign.description}</p>
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
                    <div className="text-white font-semibold">{campaign.daysLeft}</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="btn-primary w-full"
                  disabled={!campaign.isActive}
                  onClick={() => alert("Demo: Contribution feature would open here")}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  {campaign.isActive ? "Contribute (Demo)" : "Campaign Ended"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Notice */}
        <div className="mt-12 text-center">
          <div className="inline-block p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              🚀 This is a demo interface. In production, campaigns would be loaded from smart contracts on Base
              network.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
