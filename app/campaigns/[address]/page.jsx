"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getCampaignDetails } from "@/lib/web3"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CampaignDetailPage() {
  const { address } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const details = await getCampaignDetails(address)

        let metadata = {}
        if (details.metadataURI) {
          const uri = details.metadataURI.startsWith("ipfs://")
            ? details.metadataURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
            : details.metadataURI

          const res = await fetch(uri)
          metadata = await res.json()
        }

        setCampaign({ ...details, ...metadata })
      } catch (err) {
        console.error("Failed to load campaign:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDetails()
  }, [address])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="animate-spin w-6 h-6" />
          <span>Loading campaign...</span>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p> failed to fetch Campaign.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 text-white py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/campaigns">
          <Button variant="ghost" className="mb-6 text-blue-200 hover:text-white hover:bg-blue-800/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>

        <Card className="glass-card border-emerald-400/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{campaign.title || "Untitled Campaign"}</CardTitle>
            <p className="text-sm text-blue-200 mt-2">Campaign Address: <code className="text-blue-300">{address}</code></p>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-lg text-blue-100">{campaign.description || "No description provided."}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-semibold text-white">Goal</h4>
                <p className="text-blue-200">{campaign.goal} ETH</p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Duration</h4>
                <p className="text-blue-200">{campaign.duration} days</p>
              </div>
              {campaign.githubRepo && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-white">GitHub Repository</h4>
                  <Link href={campaign.githubRepo} target="_blank" className="text-blue-400 hover:underline inline-flex items-center">
                    {campaign.githubRepo}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
              {campaign.liveSiteUrl && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-white">Live URl</h4>
                  <Link href={campaign.liveSiteUrl} target="_blank" className="text-blue-400 hover:underline inline-flex items-center">
                    {campaign.liveSiteUrl}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
