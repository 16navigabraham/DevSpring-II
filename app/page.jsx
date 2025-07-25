"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Rocket, Users, TrendingUp, Wallet, ArrowRight, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAllCampaigns } from "@/lib/web3"
import { ClientOnly } from "@/components/ClientOnly"
import Image from "next/image"

function AuthenticatedContent() {
  const { ready, authenticated, login } = usePrivy()

  if (!ready) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="text-blue-200">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {authenticated ? (
        <>
          <Link href="/dashboard">
            <Button className="btn-secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/campaigns">
            <Button className="btn-secondary">
              <Users className="w-4 h-4 mr-2" />
              Explore
            </Button>
          </Link>
        </>
      ) : (
        <Button onClick={login} className="btn-primary">
          <Wallet className="w-4 h-4 mr-2" />
          Connect your Wallet
        </Button>
      )}
    </div>
  )
}

function ActionButtons() {
  const { ready, authenticated, login } = usePrivy()

  if (!ready) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
      {authenticated ? (
        <>
          <Link href="/create">
            <Button className="btn-primary group relative overflow-hidden px-8 py-4 text-lg font-semibold">
              <span className="relative z-10 flex items-center">
                <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Create Campaign
              </span>
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button className="btn-secondary group px-8 py-4 text-lg font-semibold">
              <span className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                My Dashboard
              </span>
            </Button>
          </Link>

          <Link href="/campaigns">
            <Button className="btn-secondary group px-8 py-4 text-lg font-semibold">
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore available Campaigns
              </span>
            </Button>
          </Link>
        </>
      ) : (
        <Button onClick={login} className="btn-primary group relative overflow-hidden px-8 py-4 text-lg font-semibold">
          <span className="relative z-10 flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Connect your Wallet to GetStarted
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      )}
    </div>
  )
}

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRaised: "0",
    activeCampaigns: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const campaigns = await getAllCampaigns()
        const totalRaised = campaigns.reduce((sum, campaign) => sum + Number.parseFloat(campaign.raised), 0)
        const activeCampaigns = campaigns.filter((c) => c.isActive).length

        setStats({
          totalCampaigns: campaigns.length,
          totalRaised: totalRaised.toFixed(2),
          activeCampaigns,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Image src="/SpringDev.png" alt="DevSpring" width={24} height={24} className="rounded" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              DevSpring
            </h1>
          </div>

          <ClientOnly fallback={<div className="w-32 h-10 bg-blue-500/20 rounded animate-pulse"></div>}>
            <AuthenticatedContent />
          </ClientOnly>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-12">
              {/* <div className="flex justify-center mb-6">
                <Image src="/SpringDev.png" alt="DevSpring" width={80} height={80} className="rounded-lg" />
              </div> */}
              <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
                Fund the Future
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Decentralized crowdfunding for verified builders. Connect builders with supporters through the blockchain
                 on Base.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="glass-card border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stats.activeCampaigns}</div>
                  <div className="text-blue-200 text-sm">Active Campaigns</div>
                </CardContent>
              </Card>
              <Card className="glass-card border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <Rocket className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stats.totalCampaigns}</div>
                  <div className="text-blue-200 text-sm">Total Projects</div>
                </CardContent>
              </Card>
              <Card className="glass-card border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stats.totalRaised} ETH</div>
                  <div className="text-blue-200 text-sm">Total Fund Raised</div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <ClientOnly fallback={<div className="w-64 h-12 bg-blue-500/20 rounded mx-auto animate-pulse"></div>}>
              <ActionButtons />
            </ClientOnly>

            {/* Features */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="glass-card border-blue-500/20 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Campaign Management</h3>
                  <p className="text-blue-200 text-sm">
                    Monitor your campaigns, track progress, and withdraw funds when goals are reached.
                  </p>
                </div>
              </Card>

              <Card className="glass-card border-blue-500/20 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Transparent & Secure</h3>
                  <p className="text-blue-200 text-sm">
                    All transactions are on-chain and transparent. Smart contracts ensure funds are handled securely.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-blue-300 text-sm">Powered by Base • Built for the decentralized future</p>
        </footer>
      </div>
    </div>
  )
}
