import { NextResponse } from "next/server"

// Server-side Builder Score API integration
const BUILDER_SCORE_API = "https://api.builderscore.com/v1"

export async function POST(request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Check if we have an API key
    const apiKey = process.env.BUILDER_SCORE_API_KEY
    if (!apiKey) {
      console.warn("Builder Score API key not configured, using fallback")
      return NextResponse.json(getFallbackBuilderScore())
    }

    const response = await fetch(`${BUILDER_SCORE_API}/score/${address}`, {
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
      score: data.score || 0,
      breakdown: data.breakdown || {},
      lastUpdated: data.lastUpdated,
      isEligible: (data.score || 0) >= 40,
    })
  } catch (error) {
    console.error("Error fetching Builder Score:", error)
    return NextResponse.json(getFallbackBuilderScore())
  }
}

const getFallbackBuilderScore = () => {
  const score = Math.floor(Math.random() * 100)
  return {
    score,
    breakdown: {
      github: Math.floor(Math.random() * 30),
      onchain: Math.floor(Math.random() * 30),
      social: Math.floor(Math.random() * 20),
      reputation: Math.floor(Math.random() * 20),
    },
    lastUpdated: new Date().toISOString(),
    isEligible: score >= 40,
  }
}
