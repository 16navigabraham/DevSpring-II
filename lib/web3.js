import { ethers } from "ethers"
import { CONTRACTS, CROWDFUND_FACTORY_ABI, CROWDFUND_ABI } from "./contracts"

// Get provider and signer
export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  return null
}

export const getSigner = async () => {
  const provider = getProvider()
  if (!provider) throw new Error("No wallet connected")
  return await provider.getSigner()
}

// Contract instances
export const getCrowdfundFactoryContract = async () => {
  const signer = await getSigner()
  return new ethers.Contract(CONTRACTS.CROWDFUND_FACTORY, CROWDFUND_FACTORY_ABI, signer)
}

export const getCrowdfundContract = async (crowdfundAddress) => {
  const signer = await getSigner()
  return new ethers.Contract(crowdfundAddress, CROWDFUND_ABI, signer)
}

// Utility functions
export const formatTokenAmount = (amount, decimals = 18) => {
  try {
    return ethers.formatUnits(amount.toString(), decimals)
  } catch (error) {
    console.error("Error formatting token amount:", error)
    return "0"
  }
}

export const parseTokenAmount = (amount, decimals = 18) => {
  try {
    return ethers.parseUnits(amount.toString(), decimals)
  } catch (error) {
    console.error("Error parsing token amount:", error)
    throw new Error("Invalid amount format")
  }
}

export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address)
  } catch (error) {
    return false
  }
}

// Network utilities
export const switchToBase = async () => {
  if (!window.ethereum) throw new Error("No wallet found")

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }], // Base mainnet
    })
  } catch (switchError) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x2105",
            chainName: "Base",
            nativeCurrency: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      })
    } else {
      throw switchError
    }
  }
}

// Campaign operations
export const createCampaign = async (campaignData) => {
  try {
    const contract = await getCrowdfundFactoryContract()
    const { goal, duration } = campaignData

    // Convert goal to wei and duration to seconds
    const goalInWei = parseTokenAmount(goal, 18)
    const durationInSeconds = duration * 24 * 60 * 60 // Convert days to seconds

    const tx = await contract.createCrowdfund(goalInWei, durationInSeconds)
    return await tx.wait()
  } catch (error) {
    console.error("Error creating campaign:", error)
    throw new Error(`Failed to create campaign: ${error.message}`)
  }
}

export const getAllCampaigns = async () => {
  try {
    const provider = getProvider()
    if (!provider) return []

    const contract = new ethers.Contract(CONTRACTS.CROWDFUND_FACTORY, CROWDFUND_FACTORY_ABI, provider)
    const campaignAddresses = await contract.getAllCampaigns()

    const campaigns = await Promise.all(
      campaignAddresses.map(async (address, index) => {
        try {
          const crowdfundContract = new ethers.Contract(address, CROWDFUND_ABI, provider)

          // Get campaign details
          const [fundingGoal, deadline, totalFundsRaised, owner] = await Promise.all([
            crowdfundContract.fundingGoal(),
            crowdfundContract.deadline(),
            crowdfundContract.getTotalFundsRaised(),
            crowdfundContract.owner(),
          ])

          const now = Math.floor(Date.now() / 1000)
          const isActive = Number(deadline) > now

          return {
            id: index,
            address,
            title: `Campaign #${index + 1}`,
            description: `Crowdfunding campaign created by ${owner.slice(0, 6)}...${owner.slice(-4)}`,
            goal: formatTokenAmount(fundingGoal, 18),
            raised: formatTokenAmount(totalFundsRaised, 18),
            deadline: new Date(Number(deadline) * 1000),
            creator: owner,
            githubRepo: "",
            liveSiteUrl: "",
            tokenSymbol: "ETH",
            isActive,
          }
        } catch (error) {
          console.error(`Error fetching campaign ${address}:`, error)
          return null
        }
      }),
    )

    return campaigns.filter(Boolean)
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return []
  }
}

export const contributeToCampaign = async (campaignAddress, amount) => {
  try {
    const crowdfundContract = await getCrowdfundContract(campaignAddress)
    const contributionAmount = parseTokenAmount(amount, 18)

    // ETH contribution
    const tx = await crowdfundContract.contribute({ value: contributionAmount })
    return await tx.wait()
  } catch (error) {
    console.error("Error contributing to campaign:", error)
    throw new Error(`Contribution failed: ${error.message}`)
  }
}

export const getTokenBalance = async (userAddress) => {
  try {
    const provider = getProvider()
    if (!provider) return "0"

    const balance = await provider.getBalance(userAddress)
    return formatTokenAmount(balance, 18)
  } catch (error) {
    console.error("Error getting ETH balance:", error)
    return "0"
  }
}

export const getUserContribution = async (campaignAddress, userAddress) => {
  try {
    const provider = getProvider()
    if (!provider) return "0"

    const crowdfundContract = new ethers.Contract(campaignAddress, CROWDFUND_ABI, provider)
    const contribution = await crowdfundContract.getContribution(userAddress)
    return formatTokenAmount(contribution, 18)
  } catch (error) {
    console.error("Error getting user contribution:", error)
    return "0"
  }
}

export const withdrawFunds = async (campaignAddress) => {
  try {
    const crowdfundContract = await getCrowdfundContract(campaignAddress)
    const tx = await crowdfundContract.withdrawFunds()
    return await tx.wait()
  } catch (error) {
    console.error("Error withdrawing funds:", error)
    throw new Error(`Withdrawal failed: ${error.message}`)
  }
}

export const refundContribution = async (campaignAddress) => {
  try {
    const crowdfundContract = await getCrowdfundContract(campaignAddress)
    const tx = await crowdfundContract.refund()
    return await tx.wait()
  } catch (error) {
    console.error("Error requesting refund:", error)
    throw new Error(`Refund failed: ${error.message}`)
  }
}
