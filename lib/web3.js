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
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found")
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }], // Base mainnet
    })
  } catch (switchError) {
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

// Get fee percentage from factory contract
export const getFeePercentage = async () => {
  try {
    const provider = getProvider()
    if (!provider) return 0

    const contract = new ethers.Contract(CONTRACTS.CROWDFUND_FACTORY, CROWDFUND_FACTORY_ABI, provider)
    const fee = await contract.feePercentage()
    return Number(fee)
  } catch (error) {
    console.error("Error getting fee percentage:", error)
    return 0
  }
}

// Campaign operations
export const createCampaign = async (campaignData) => {
  try {
    const contract = await getCrowdfundFactoryContract()
    const { goal, duration } = campaignData

    const goalInWei = parseTokenAmount(goal, 18)
    const durationInSeconds = duration * 24 * 60 * 60

    const tx = await contract.createCrowdfund(goalInWei, durationInSeconds)
    return await tx.wait()
  } catch (error) {
    console.error("Error creating campaign:", error)
    throw new Error(`Failed to create campaign: ${error.message}`)
  }
}

export const getAllCampaigns = async () => {
  if (typeof window === "undefined") return []

  try {
    const provider = getProvider()
    if (!provider) return []

    const contract = new ethers.Contract(CONTRACTS.CROWDFUND_FACTORY, CROWDFUND_FACTORY_ABI, provider)
    const campaignAddresses = await contract.getAllCampaigns()

    const campaigns = await Promise.all(
      campaignAddresses.map(async (address, index) => {
        try {
          const crowdfundContract = new ethers.Contract(address, CROWDFUND_ABI, provider)

          const [fundingGoal, deadline, totalFundsRaised, owner, isGoalMet, withdrawn, withdrawalDeadline] =
            await Promise.all([
              crowdfundContract.fundingGoal(),
              crowdfundContract.deadline(),
              crowdfundContract.getTotalFundsRaised(),
              crowdfundContract.owner(),
              crowdfundContract.isGoalMet,  // no ()
              crowdfundContract.withdrawn,  // no ()
              crowdfundContract.getWithdrawalDeadline(),
            ])

          const now = Math.floor(Date.now() / 1000)
          const isActive = Number(deadline) > now
          const canAutoRefund =
            (!isGoalMet && !isActive) || (isGoalMet && !withdrawn && Number(withdrawalDeadline) < now)

          return {
            id: index,
            address,
            title: `Campaign #${index + 1}`,
            description: `Crowdfunding campaign created by ${owner.slice(0, 6)}...${owner.slice(-4)}`,
            goal: formatTokenAmount(fundingGoal),
            raised: formatTokenAmount(totalFundsRaised),
            deadline: new Date(Number(deadline) * 1000),
            withdrawalDeadline: new Date(Number(withdrawalDeadline) * 1000),
            creator: owner,
            githubRepo: "",
            liveSiteUrl: "",
            tokenSymbol: "ETH",
            isActive,
            isGoalMet,
            withdrawn,
            canAutoRefund,
          }
        } catch (error) {
          console.error(`Error fetching campaign ${address}:`, error)
          return null
        }
      })
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

export const getContribution = async (campaignAddress, userAddress) => {
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

// Get detailed campaign info
export const getCampaignDetails = async (campaignAddress) => {
  try {
    const provider = getProvider()
    if (!provider) return null

    const crowdfundContract = new ethers.Contract(campaignAddress, CROWDFUND_ABI, provider)

    const [fundingGoal, deadline, totalFundsRaised, owner, isGoalMet, withdrawn, withdrawalDeadline, feePercentage] =
      await Promise.all([
        crowdfundContract.fundingGoal(),
        crowdfundContract.deadline(),
        crowdfundContract.getTotalFundsRaised(),
        crowdfundContract.owner(),
        crowdfundContract.isGoalMet,
        crowdfundContract.withdrawn,
        crowdfundContract.getWithdrawalDeadline(),
        crowdfundContract.feePercentage(),
      ])

    const now = Math.floor(Date.now() / 1000)
    const isActive = Number(deadline) > now
    const canAutoRefund =
      (!isGoalMet && !isActive) || (isGoalMet && !withdrawn && Number(withdrawalDeadline) < now)

    return {
      fundingGoal: formatTokenAmount(fundingGoal),
      deadline: new Date(Number(deadline) * 1000),
      totalFundsRaised: formatTokenAmount(totalFundsRaised),
      withdrawalDeadline: new Date(Number(withdrawalDeadline) * 1000),
      owner,
      isGoalMet,
      withdrawn,
      isActive,
      canAutoRefund,
      feePercentage: Number(feePercentage),
    }
  } catch (error) {
    console.error("Error getting campaign details:", error)
    return null
  }
}
