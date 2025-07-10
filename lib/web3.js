import { ethers } from "ethers"
import { CONTRACTS, CROWDFUND_FACTORY_ABI, CROWDFUND_ABI } from "./contracts"
import { getFriendlyErrorMessage } from "./errorHandler"

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

    let message = "Something went wrong while creating the campaign."

    if (error.code === "CALL_EXCEPTION" || error.message.includes("missing revert data")) {
      message = "Campaign creation failed. Please double-check your inputs."
    } else if (error.message.includes("user rejected")) {
      message = "You cancelled the transaction."
    } else if (error.message.includes("insufficient funds")) {
      message = "Your wallet doesn't have enough ETH to cover gas fees."
    }

    throw new Error(message)
  }
}

export const getAllCampaigns = async () => {
  if (typeof window === "undefined") return []

  try {
    const provider = getProvider()
    if (!provider) return []

    const factoryContract = new ethers.Contract(CONTRACTS.CROWDFUND_FACTORY, CROWDFUND_FACTORY_ABI, provider)
    const campaignAddresses = await factoryContract.getAllCampaigns()

    const campaigns = await Promise.all(
      campaignAddresses.map(async (address, index) => {
        try {
          const contract = new ethers.Contract(address, CROWDFUND_ABI, provider)

          // Safe sequential calls
          let fundingGoal = "0"
          let deadline = 0
          let totalFundsRaised = "0"
          let owner = ""
          let isGoalMet = false
          let withdrawn = false
          let withdrawalDeadline = 0

          try {
            fundingGoal = await contract.fundingGoal()
          } catch (e) {
            console.warn(`⚠️ fundingGoal() failed for ${address}`)
          }

          try {
            deadline = await contract.deadline()
          } catch (e) {
            console.warn(`⚠️ deadline() failed for ${address}`)
          }

          try {
            totalFundsRaised = await contract.getTotalFundsRaised()
          } catch (e) {
            console.warn(`⚠️ getTotalFundsRaised() failed for ${address}`)
          }

          try {
            owner = await contract.owner()
          } catch (e) {
            console.warn(`⚠️ owner() failed for ${address}`)
          }

          try {
            isGoalMet = await contract.isGoalMet()
          } catch (e) {
            console.warn(`⚠️ isGoalMet() failed for ${address}`)
          }

          try {
            withdrawn = await contract.withdrawn()
          } catch (e) {
            console.warn(`⚠️ withdrawn() failed for ${address}`)
          }

          try {
            withdrawalDeadline = await contract.getWithdrawalDeadline()
          } catch (e) {
            console.warn(`⚠️ getWithdrawalDeadline() failed for ${address}`)
          }

          const now = Math.floor(Date.now() / 1000)
          const isActive = Number(deadline) > now
          const canAutoRefund =
            (!isGoalMet && !isActive) ||
            (isGoalMet && !withdrawn && Number(withdrawalDeadline) < now)

          return {
            id: index,
            address,
            title: `Campaign #${index + 1}`,
            description: `Crowdfunding campaign by ${owner?.slice(0, 6)}...${owner?.slice(-4)}`,
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
        } catch (err) {
          console.error(`❌ Skipping campaign at ${address}:`, err)
          return null
        }
      })
    )
    return campaigns.filter(Boolean) // Remove nulls
  } catch (error) {
    console.error("❌ Error in getAllCampaigns:", error)
    return []
  }
}

export const getCampaignsByOwner = async (ownerAddress) => {
  if (typeof window === "undefined") return []

  try {
    const provider = getProvider()
    if (!provider) return []

    const factoryContract = new ethers.Contract(CONTRACTS.CROWDFUND_FACTORY, CROWDFUND_FACTORY_ABI, provider)
    const allCampaigns = await factoryContract.getAllCampaigns()

    const campaigns = await Promise.all(
      allCampaigns.map(async (address) => {
        const contract = new ethers.Contract(address, CROWDFUND_ABI, provider)
        const owner = await contract.owner()
        if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
          return address
        }
        return null
      })
    )

    return campaigns.filter(Boolean)
  } catch (error) {
    console.error("Error getting campaigns by owner:", error)
    return []
  }
}

export const contributeToCampaign = async (campaignAddress, amount) => {
  try {
    const crowdfundContract = await getCrowdfundContract(campaignAddress)
    const contributionAmount = parseTokenAmount(amount, 18)
    const tx = await crowdfundContract.contribute({ value: contributionAmount })
    return await tx.wait()
  }catch (error) {
    console.error("Error contributing to campaign:", error)
    throw new Error(getFriendlyErrorMessage(error, "Failed to contribute to campaign."))
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
    console.error("Error withdrawing refund:", error)
    throw new Error(getFriendlyErrorMessage(error, "Failed to request withdrawal."))
  }
}


export const refundContribution = async (campaignAddress) => {
  try {
    const crowdfundContract = await getCrowdfundContract(campaignAddress)
    const tx = await crowdfundContract.refund()
    return await tx.wait()
  } catch (error) {
    console.error("Error requesting refund:", error)
    throw new Error(getFriendlyErrorMessage(error, "Failed to request refund."))
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
