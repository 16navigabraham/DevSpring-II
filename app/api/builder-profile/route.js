import { NextResponse } from "next/server"

// Server-side Builder Profile API integration
const BUILDER_SCORE_API = "https://api.builderscore.com/v1"

export async function POST(request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const apiKey = process.env.BUILDER_SCORE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const response = await fetch(`${BUILDER_SCORE_API}/profile/${address}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      address: data.address,
      ens: data.ens,
      github: data.github,
      twitter: data.twitter,
      projects: data.projects || [],
      contributions: data.contributions || [],
    })
  } catch (error) {
    console.error("Error fetching Builder Profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
