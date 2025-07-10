import { ethers } from "ethers"
import { CONTRACTS, CROWDFUND_FACTORY_ABI, CROWDFUND_ABI } from "./contracts"

// Provider utilities
export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }

  // Fallback: read-only provider (no wallet)
  return new ethers.JsonRpcProvider("https://mainnet.base.org")
}

export const getSigner = async () => {
  const provider = getProvider()
  if (!provider || !provider.getSigner) throw new Error("No wallet connected")
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

// Token formatting
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

// Network switch
export const switchToBase = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found")
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
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

// Factory read
export const getFeePercentage = async () => {
  try {
    const provider = getProvider()
    const contract = new ethers.Contract(CONTRACTS.CROWDFUND_FACTORY, CROWDFUND_FACTORY_ABI, provider)
    const fee = await contract.feePercentage()
    return Number(fee)
  } catch (error) {
    console.error("Error getting fee percentage:", error)
    return 0
  }
}

// Create campaign
export const createCampaign = async ({ goal, duration }) => {
  try {
    const contract = await getCrowdfundFactoryContract()
    const goalInWei = parseTokenAmount(goal)
    const durationInSeconds = duration * 24 * 60 * 60
    const tx = await contract.createCrowdfund(goalInWei, durationInSeconds)
    return await tx.wait()
  } catch (error) {
    console.error("Error creating campaign:", error)
    throw new Error(`Failed to create campaign: ${error.message}`)
  }
}

// Get all campaigns
export const getAllCampaigns = async () => {
  if (typeof window === "undefined") return []

  try {
    const provider = getProvider()
    const factoryContract = new ethers.Contract(CONTRACTS.CROWDFUND_FACTORY, CROWDFUND_FACTORY_ABI, provider)
    const campaignAddresses = await factoryContract.getAllCampaigns()

    const now = Math.floor(Date.now() / 1000)

    const campaigns = await Promise.all(
      campaignAddresses.map(async (address, index) => {
        try {
          const contract = new ethers.Contract(address, CROWDFUND_ABI, provider)

          const [
            fundingGoal,
            deadline,
            totalFundsRaised,
            owner,
            isGoalMet,
            withdrawn,
            withdrawalDeadline,
          ] = await Promise.all([
            contract.fundingGoal(),
            contract.deadline(),
            contract.getTotalFundsRaised(),
            contract.owner(),
            contract.isGoalMet(),
            contract.withdrawn(),
            contract.getWithdrawalDeadline(),
          ])

          const isActive = Number(deadline) > now
          const canAutoRefund =
            (!isGoalMet && !isActive) || (isGoalMet && !withdrawn && Number(withdrawalDeadline) < now)

          return {
            id: index,
            address,
            title: `Campaign #${index + 1}`,
            description: `Crowdfunding campaign by ${owner.slice(0, 6)}...${owner.slice(-4)}`,
            goal: formatTokenAmount(fundingGoal),
            raised: formatTokenAmount(totalFundsRaised),
            deadline: new Date(Number(deadline) * 1000),
            withdrawalDeadline: new Date(Number(withdrawalDeadline) * 1000),
            creator: owner,
            tokenSymbol: "ETH",
            isActive,
            isGoalMet,
            withdrawn,
            canAutoRefund,
            githubRepo: "",
            liveSiteUrl: "",
          }
        } catch (err) {
          console.warn(`⚠️ Skipping campaign at ${address}:`, err)
          return null
        }
      })
    )

    return campaigns.filter(Boolean)
  } catch (error) {
    console.error("❌ Error loading campaigns:", error)
    return []
  }
}

// Interactions
export const contributeToCampaign = async (campaignAddress, amount) => {
  try {
    const contract = await getCrowdfundContract(campaignAddress)
    const value = parseTokenAmount(amount)
    const tx = await contract.contribute({ value })
    return await tx.wait()
  } catch (error) {
    console.error("Contribution error:", error)
    throw new Error(`Contribution failed: ${error.message}`)
  }
}

export const getContribution = async (campaignAddress, userAddress) => {
  try {
    const provider = getProvider()
    const contract = new ethers.Contract(campaignAddress, CROWDFUND_ABI, provider)
    const result = await contract.getContribution(userAddress)
    return formatTokenAmount(result)
  } catch (error) {
    console.error("Get contribution error:", error)
    return "0"
  }
}

export const withdrawFunds = async (campaignAddress) => {
  try {
    const contract = await getCrowdfundContract(campaignAddress)
    const tx = await contract.withdrawFunds()
    return await tx.wait()
  } catch (error) {
    console.error("Withdraw error:", error)
    throw new Error(`Withdrawal failed: ${error.message}`)
  }
}

export const refundContribution = async (campaignAddress) => {
  try {
    const contract = await getCrowdfundContract(campaignAddress)
    const tx = await contract.refund()
    return await tx.wait()
  } catch (error) {
    console.error("Refund error:", error)
    throw new Error(`Refund failed: ${error.message}`)
  }
}

export const getTokenBalance = async (userAddress) => {
  try {
    const provider = getProvider()
    const balance = await provider.getBalance(userAddress)
    return formatTokenAmount(balance)
  } catch (error) {
    console.error("Balance fetch error:", error)
    return "0"
  }
}

export const getCampaignDetails = async (address) => {
  try {
    const provider = getProvider()
    const contract = new ethers.Contract(address, CROWDFUND_ABI, provider)

    const [
      fundingGoal,
      deadline,
      totalFundsRaised,
      owner,
      isGoalMet,
      withdrawn,
      withdrawalDeadline,
      feePercentage,
    ] = await Promise.all([
      contract.fundingGoal(),
      contract.deadline(),
      contract.getTotalFundsRaised(),
      contract.owner(),
      contract.isGoalMet(),
      contract.withdrawn(),
      contract.getWithdrawalDeadline(),
      contract.feePercentage(),
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
    console.error("Campaign detail fetch error:", error)
    return null
  }
}
