"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sparkles,
  Rocket,
  Users,
  TrendingUp,
  Wallet,
  ArrowRight,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAllCampaigns } from "@/lib/web3"
import { ClientOnly } from "@/components/ClientOnly"
import Image from "next/image"
import { motion } from "framer-motion"

/* ------------------------------------------------------------------ */
/*  Background & helpers                                               */
/* ------------------------------------------------------------------ */
const Background = () => (
  <>
    <div className="absolute inset-0">
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-bounce" />
    </div>

    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  </>
)

/* ------------------------------------------------------------------ */
/*  StatCard                                                          */
/* ------------------------------------------------------------------ */
/**
 * @param {{ icon: React.ReactNode, value: string | number, label: string }} props
 */
const StatCard = ({ icon, value, label }) => (
  <Card className="glass-card border-blue-500/20">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="mb-3 text-blue-400">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-blue-200">{label}</div>
    </CardContent>
  </Card>
)

/* ------------------------------------------------------------------ */
/*  AuthenticatedContent                                              */
/* ------------------------------------------------------------------ */
function AuthenticatedContent() {
  const { ready, authenticated, login } = usePrivy()

  if (!ready) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-blue-200">Loading…</span>
      </div>
    )
  }

  return authenticated ? (
    <div className="flex items-center gap-3">
      <Link href="/dashboard">
        <Button variant="secondary" size="sm">
          <BarChart3 className="w-4 h-4 mr-1.5" />
          Dashboard
        </Button>
      </Link>
      <Link href="/campaigns">
        <Button variant="secondary" size="sm">
          <Users className="w-4 h-4 mr-1.5" />
          Explore
        </Button>
      </Link>
    </div>
  ) : (
    <Button onClick={login} className="btn-primary" size="sm">
      <Wallet className="w-4 h-4 mr-1.5" />
      Connect Wallet
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/*  ActionButtons                                                     */
/* ------------------------------------------------------------------ */
function ActionButtons() {
  const { ready, authenticated, login } = usePrivy()

  if (!ready) {
    return (
      <div className="w-40 h-12 bg-blue-500/20 rounded-lg animate-pulse mx-auto" />
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {authenticated ? (
        <>
          <Link href="/create">
            <Button
              size="lg"
              className="btn-primary group relative overflow-hidden px-8 py-3 text-base sm:text-lg font-semibold"
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
              Create Campaign
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              size="lg"
              variant="secondary"
              className="group px-8 py-3 text-base sm:text-lg font-semibold"
            >
              <BarChart3 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              My Dashboard
            </Button>
          </Link>

          <Link href="/campaigns">
            <Button
              size="lg"
              variant="secondary"
              className="group px-8 py-3 text-base sm:text-lg font-semibold"
            >
              <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Explore Campaigns
            </Button>
          </Link>
        </>
      ) : (
        <Button
          onClick={login}
          size="lg"
          className="btn-primary group relative overflow-hidden px-8 py-3 text-base sm:text-lg font-semibold"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Connect Wallet to Get Started
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  LandingPage                                                       */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const [stats, setStats] = useState<{
    totalCampaigns: number,
    totalRaised: string,
    activeCampaigns: number
  } | null>(null)

  useEffect(() => {
    getAllCampaigns()
      .then((campaigns) => {
        const totalRaised = campaigns.reduce(
          (sum, c) => sum + Number.parseFloat(c.raised),
          0,
        )
        setStats({
          totalCampaigns: campaigns.length,
          totalRaised: totalRaised.toFixed(2),
          activeCampaigns: campaigns.filter((c) => c.isActive).length,
        })
      })
      .catch((e) => console.error("Error loading stats:", e))
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 overflow-hidden">
      <Background />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 sm:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-md flex items-center justify-center">
              <Image
                src="/SpringDev.png"
                alt="DevSpring"
                width={22}
                height={22}
                className="rounded"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              DevSpring
            </h1>
          </Link>

          <ClientOnly fallback={<div className="w-28 h-9 bg-blue-500/20 rounded-md animate-pulse" />}>
            <AuthenticatedContent />
          </ClientOnly>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-5xl w-full text-center">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
                Fund the Future
              </h2>
              <p className="text-lg sm:text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
                Decentralized crowdfunding for verified builders. Connect builders with supporters
                through the blockchain on Base.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto"
            >
              {stats ? (
                <>
                  <StatCard icon={<Users size={28} />} value={stats.activeCampaigns} label="Active Campaigns" />
                  <StatCard icon={<Rocket size={28} />} value={stats.totalCampaigns} label="Total Projects" />
                  <StatCard icon={<TrendingUp size={28} />} value={`${stats.totalRaised} ETH`} label="Total Raised" />
                </>
              ) : (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 glass-card border-blue-500/20 rounded-lg animate-pulse"
                  />
                ))
              )}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12"
            >
              <ClientOnly fallback={<div className="w-60 h-12 bg-blue-500/20 rounded-lg animate-pulse mx-auto" />}>
                <ActionButtons />
              </ClientOnly>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              <Card className="glass-card border-blue-500/20 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Campaign Management</h3>
                  <p className="text-sm text-blue-200/80">
                    Monitor campaigns, track progress, and withdraw funds automatically when goals are reached.
                  </p>
                </div>
              </Card>

              <Card className="glass-card border-blue-500/20 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Transparent & Secure</h3>
                  <p className="text-sm text-blue-200/80">
                    All transactions are on-chain and transparent. Smart contracts ensure funds are handled securely.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>

        <footer className="p-6 text-center">
          <p className="text-blue-300/80 text-sm">
            Powered by Base &bull; Built for the decentralized future
          </p>
        </footer>
      </div>
    </div>
  )
}