"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getCampaignDetails } from "@/lib/web3"
import { fetchCampaignMetadata } from "@/lib/ipfs"
import { fetchETHPriceInUSD } from "@/lib/prices"


export default function CampaignDetailPage() {
  const { address } = useParams()
  const [campaign, setCampaign] = useState(null)

  useEffect(() => {
    const loadCampaign = async () => {
      const onchain = await getCampaignDetails(address)
      const ipfsUrl = localStorage.getItem(address)
      const offchain = ipfsUrl ? await fetchCampaignMetadata(ipfsUrl) : {}

      setCampaign({
        ...onchain,
        ...offchain,
        address,
      })
    }

    loadCampaign()
  }, [address])

  if (!campaign) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">{campaign.title}</h1>
      <p className="text-gray-300 mt-2">{campaign.description}</p>

      {campaign.githubRepo && (
        <a href={campaign.githubRepo} className="text-blue-400 mt-4 block" target="_blank">
          GitHub Repo
        </a>
      )}
      {campaign.liveSiteUrl && (
        <a href={campaign.liveSiteUrl} className="text-green-400 mt-1 block" target="_blank">
          Live URL
        </a>
      )}
    </div>
  )
}
