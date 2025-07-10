"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getCampaignDetails } from "@/lib/web3"
import { fetchCampaignMetadata } from "@/lib/ipfs"
import { fetchETHPriceInUSD } from "@/lib/prices"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default function CampaignDetailPage() {
  const { address } = useParams()
  const [campaign, setCampaign] = useState(null)

  useEffect(() => {
    const loadDetails = async () => {
      const details = await getCampaignDetails(address)
      const res = await fetch(`https://gateway.pinata.cloud/ipfs/${details.metadataURI.replace("ipfs://", "")}`)
      const metadata = await res.json()
      setCampaign({ ...details, ...metadata })
    }

    loadDetails()
  }, [address])

  const handleShare = async () => {
    const url = `${window.location.origin}/campaigns/${address}`
    await navigator.clipboard.writeText(url)
    alert("✅ Link copied to clipboard!")
  }

  if (!campaign) return <div className="text-white p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <Button onClick={handleShare} variant="secondary" className="text-sm">
            <ExternalLink className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>

        <p className="text-gray-300">{campaign.description}</p>

        {campaign.githubRepo && (
          <a href={campaign.githubRepo} className="text-blue-400 block" target="_blank">
            GitHub Repo ↗
          </a>
        )}

        {campaign.liveSiteUrl && (
          <a href={campaign.liveSiteUrl} className="text-green-400 block" target="_blank">
            Live URL ↗
          </a>
        )}
      </div>
    </div>
  )
}
