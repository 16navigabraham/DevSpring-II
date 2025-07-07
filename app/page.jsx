"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Rocket, Users, TrendingUp } from "lucide-react"

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAction = (route) => {
    setError(null)
    setIsLoading(true)

    // Simulate navigation
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = route
    }, 1000)
  }

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
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              CrowdfundMe
            </h1>
          </div>

          <div className="glass-card px-4 py-2 rounded-full">
            <span className="text-sm text-blue-200">Demo Mode</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-12">
              <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
                Fund the Future
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Decentralized crowdfunding for innovative projects. Connect creators with supporters through the power
                of blockchain technology.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-card p-6 rounded-2xl">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">10K+</div>
                <div className="text-blue-200 text-sm">Active Users</div>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <Rocket className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-blue-200 text-sm">Projects Funded</div>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">1.2M ETH</div>
                <div className="text-blue-200 text-sm">Total Raised</div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={() => handleAction("/create")}
                disabled={isLoading}
                className="btn-primary group relative overflow-hidden px-8 py-4 text-lg font-semibold"
              >
                <span className="relative z-10 flex items-center">
                  <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  {isLoading ? "Loading..." : "Create Campaign"}
                </span>
              </Button>

              <Button
                onClick={() => handleAction("/campaigns")}
                disabled={isLoading}
                className="btn-secondary group px-8 py-4 text-lg font-semibold"
              >
                <span className="flex items-center">
                  <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Explore Campaigns
                </span>
              </Button>
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                🚀 This is a demo of the CrowdfundMe dApp interface. In production, this would connect to Web3 wallets
                and smart contracts on Base network.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-blue-300 text-sm">Powered by Ethereum • Built with ❤️ for the decentralized future</p>
        </footer>
      </div>
    </div>
  )
}
