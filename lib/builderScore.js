// COMMENTED OUT: Builder Score functionality
// This file is kept for future use when builder score verification is needed

/*
// Client-side Builder Score utilities (no API key needed)

// Fallback builder score for development/testing
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

// Client-side function that calls server action
export const getBuilderScore = async (address) => {
  try {
    // Call server action instead of direct API call
    const response = await fetch("/api/builder-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      score: data.score || 0,
      breakdown: data.breakdown || {},
      lastUpdated: data.lastUpdated,
      isEligible: (data.score || 0) >= 40,
    }
  } catch (error) {
    console.error("Error fetching Builder Score:", error)
    return getFallbackBuilderScore()
  }
}

export const getBuilderProfile = async (address) => {
  try {
    const response = await fetch("/api/builder-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      address: data.address,
      ens: data.ens,
      github: data.github,
      twitter: data.twitter,
      projects: data.projects || [],
      contributions: data.contributions || [],
    }
  } catch (error) {
    console.error("Error fetching Builder Profile:", error)
    return null
  }
}

// Verify builder eligibility for campaign creation
export const verifyBuilderEligibility = async (address) => {
  const builderData = await getBuilderScore(address)

  return {
    isEligible: builderData.isEligible,
    score: builderData.score,
    requirements: {
      minimumScore: 40,
      currentScore: builderData.score,
      missing: Math.max(0, 40 - builderData.score),
    },
    breakdown: builderData.breakdown,
  }
}
*/

// TEMPORARY: Always return eligible for now
export const getBuilderScore = async (address) => {
  return {
    score: 100,
    breakdown: {
      github: 30,
      onchain: 30,
      social: 20,
      reputation: 20,
    },
    lastUpdated: new Date().toISOString(),
    isEligible: true,
  }
}

export const verifyBuilderEligibility = async (address) => {
  return {
    isEligible: true,
    score: 100,
    requirements: {
      minimumScore: 40,
      currentScore: 100,
      missing: 0,
    },
    breakdown: {
      github: 30,
      onchain: 30,
      social: 20,
      reputation: 20,
    },
  }
}
