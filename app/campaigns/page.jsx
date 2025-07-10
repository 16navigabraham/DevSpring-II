"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft, Users, Target, ExternalLink, Wallet, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, RotateCcw, Globe, Github
} from "lucide-react"
import { getAllCampaigns, contributeToCampaign, getContribution, refundContribution } from "@/lib/web3"
import { fetchCampaignMetadata } from "@/lib/ipfs"
import { LogoutButton } from "@/components/LogoutButton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchETHPriceInUSD } from "@/lib/prices"

export default function CampaignsPage() {
  const { ready, authenticated } = usePrivy()
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
  const [ethPrice, setEthPrice] = useState(0)

  useEffect(() => {
    fetchETHPriceInUSD().then(setEthPrice)
  }, [])

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

      const accounts = await window.ethereum?.request({ method: "eth_accounts" }) || []
      const address = accounts[0]
      if (!address) return
      setUserAddress(address)

      const onchainCampaigns = await getAllCampaigns()

      const enriched = await Promise.all(
        onchainCampaigns.map(async (c) => {
          let metadata = {}
          try {
          const ipfsUrl = c.metadataURI // ✅ read from contract, not localStorage
         if (ipfsUrl) {
           metadata = await fetchCampaignMetadata(ipfsUrl)
            }
          } catch (err) {
            console.error(`Failed to fetch metadata for ${c.address}`, err)
          }

          const contribution = await getContribution(c.address, address)
          return {
            ...c,
            ...metadata,
            contribution: contribution || "0"
          }
        })
      )

      const contributionsMap = {}
      enriched.forEach(c => {
        contributionsMap[c.address] = c.contribution
      })

      setUserContributions(contributionsMap)
      setCampaigns(enriched)
    } catch (err) {
      console.error("Error loading campaigns:", err)
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
      setSuccess(`Contributed ${contributionAmount} ETH to ${selectedCampaign.title}`)
      setContributionAmount("")
      setSelectedCampaign(null)
      await loadCampaigns()
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to contribute")
    } finally {
      setContributing(false)
    }
  }

  const handleRefund = async (c) => {
    try {
      setRefunding(true)
      await refundContribution(c.address)
      setSuccess(`Refund requested for ${c.title}`)
      await loadCampaigns()
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to refund")
    } finally {
      setRefunding(false)
    }
  }

  const getDaysLeft = (deadline) => {
    const now = new Date()
    const end = new Date(deadline)
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
  }

  const getProgress = (raised, goal) => Math.min((parseFloat(raised) / parseFloat(goal)) * 100, 100)

  const canRefund = (c) => parseFloat(userContributions[c.address] || "0") > 0 &&
    (c.canAutoRefund || (!c.isActive && !c.isGoalMet))

  const campaignStatus = (c) => {
    const progress = getProgress(c.raised, c.goal)
    const days = getDaysLeft(c.deadline)

    if (c.withdrawn) return { icon: CheckCircle, label: "Withdrawn", color: "text-emerald-400" }
    if (!c.isActive && c.isGoalMet) return { icon: CheckCircle, label: "Successful", color: "text-emerald-400" }
    if (!c.isActive && !c.isGoalMet) return { icon: XCircle, label: "Failed", color: "text-red-400" }
    if (c.isActive && days > 0) return { icon: Clock, label: "Active", color: "text-blue-400" }
    return { icon: XCircle, label: "Ended", color: "text-gray-400" }
  }

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-white">Connecting wallet...</div>
  if (!authenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 text-white">
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white"><ArrowLeft className="mr-2" />Back</Button>
          </Link>
          <div className="flex gap-3">
            <Button onClick={loadCampaigns}><RefreshCw className="mr-2" />Refresh</Button>
            <Link href="/create"><Button>Create Campaign</Button></Link>
            <LogoutButton />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">Explore Campaigns</h1>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-1" />
            <div>
              <p className="font-semibold text-red-300">Error</p>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg mb-6 text-green-300">
            {success}
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="text-center">
            <Target className="mx-auto w-12 h-12 text-blue-400 mb-2" />
            <p>No campaigns yet. <Link href="/create" className="underline text-blue-400">Create one</Link>.</p>
          </div>
        )}

        {loading && <p className="text-center">Loading campaigns...</p>}

        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => {
  const status = campaignStatus(c)
  const progress = getProgress(c.raised, c.goal)
  const userContribution = userContributions[c.address] || "0"

  const handleShare = async () => {
    const url = `${window.location.origin}/campaigns/${c.address}`
    await navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  return (
    <Card key={c.address} className="bg-slate-800 border border-slate-600">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg font-bold">{c.title}</CardTitle>
          <span className={`${status.color} flex items-center gap-1 text-sm`}>
            <status.icon className="w-4 h-4" /> {status.label}
          </span>
        </div>
        <p className="text-slate-300 text-sm line-clamp-3">{c.description}</p>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="h-2 bg-slate-600 rounded-full">
          <div
            className="h-2 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>Raised: {c.raised} ETH</div>
          <div>Goal: {c.goal} ETH</div>
          <div>Days Left: {getDaysLeft(c.deadline)}</div>
          <div>Your Contribution: {parseFloat(userContribution).toFixed(4)} ETH</div>
        </div>

        <div className="flex gap-2 items-center text-xs flex-wrap">
          <ExternalLink className="w-4 h-4" />
          <a href={`https://basescan.org/address/${c.address}`} target="_blank" className="hover:underline">
            Contract
          </a>

          {c.liveSiteUrl && (
            <>
              <Globe className="w-4 h-4 ml-4" />
              <a href={c.liveSiteUrl} target="_blank" className="hover:underline">Live site</a>
            </>
          )}

          {c.githubRepo && (
            <>
              <Github className="w-4 h-4 ml-4" />
              <a href={c.githubRepo} target="_blank" className="hover:underline">GitHub</a>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          {c.isActive && (
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedCampaign(c)} className="flex-1">
                  <Wallet className="w-4 h-4 mr-2" /> Contribute
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contribute to {selectedCampaign?.title}</DialogTitle>
                </DialogHeader>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="0.01 ETH"
                  className="w-full p-2 rounded bg-slate-700 text-white mb-4"
                />
                {contributionAmount && ethPrice > 0 && (
                  <p className="text-blue-400 text-sm mt-1">
                    ≈ ${(parseFloat(contributionAmount) * ethPrice).toFixed(2)} USD
                  </p>
                )}
                <Button
                  onClick={handleContribute}
                  disabled={contributing || Number.parseFloat(contributionAmount) <= 0}
                  className="w-full"
                >
                  {contributing ? "Contributing..." : `Contribute ${contributionAmount || 0} ETH`}
                </Button>
              </DialogContent>
            </Dialog>
          )}

          {canRefund(c) && (
            <Button onClick={() => handleRefund(c)} disabled={refunding} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" /> Refund
            </Button>
          )}

          <Button onClick={handleShare} variant="secondary" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" /> Share
          </Button>
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
