"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Rocket, Calendar, Target, FileText, Users, CheckCircle, AlertCircle, Info } from "lucide-react"
import { FormField } from "@/components/FormField"
import { validationRules, getValidationHints, getSuggestions } from "@/lib/validation"
import { WalletConnection } from "@/components/WalletConnection"
import { LogoutButton } from "@/components/LogoutButton"
import { createCampaign, getFeePercentage } from "@/lib/web3"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { uploadCampaignMetadata } from "@/lib/ipfs"

export default function CreateCampaign() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [feePercentage, setFeePercentage] = useState(0)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    duration: "",
    githubRepo: "",
    liveSiteUrl: "",
  })
  const handleInputChange = (field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }))
  updateValidation()
}
  const [validationState, setValidationState] = useState({})
  const [formScore, setFormScore] = useState(0)

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      router.push("/")
      return
    }
    loadFeePercentage()
  }, [ready, authenticated, router])

  const loadFeePercentage = async () => {
    try {
      const fee = await getFeePercentage()
      setFeePercentage(fee)
    } catch (error) {
      console.error("Error loading fee percentage:", error)
    }
  }

  // Update form validation
  const updateValidation = () => {
    const newValidationState = {}
    let score = 0

    Object.keys(formData).forEach((field) => {
      const rule = validationRules[field]
      if (rule) {
        const error = rule.validate(formData[field])
        const hint = getValidationHints(field, formData[field])

        newValidationState[field] = {
          error,
          hint: hint?.message,
          hintType: hint?.type,
          isValid: !error && formData[field],
        }

        if (["title", "description", "goal", "duration"].includes(field)) {
          if (!error && formData[field]) {
            score += 25
          }
        }
      }
    })

    setValidationState(newValidationState)
    setFormScore(score)
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!walletAddress) return

  setIsLoading(true)
  setError(null)

  try {
    const metadata = {
      title: formData.title,
      description: formData.description,
      githubRepo: formData.githubRepo,
      liveSiteUrl: formData.liveSiteUrl,
    }

    const metadataURI = await uploadCampaignMetadata(metadata)

    const campaignData = {
      goal: formData.goal,
      duration: Number.parseInt(formData.duration),
      metadataURI: metadataURI,
    }

    const result = await createCampaign(campaignData)

    if (result?.logs?.[0]?.address && metadataURI) {
      localStorage.setItem(result.logs[0].address, metadataURI)
    }

    setSuccess(true)
    setTimeout(() => {
      router.push("/campaigns")
    }, 2000)
  } catch (error) {
    console.error("Error creating campaign:", error)
    setError(error.message || "Failed to create campaign")
  } finally {
    setIsLoading(false)
  }
}



  const isFormValid = formScore === 100 && walletAddress

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 flex items-center justify-center">
        <Card className="glass-card border-emerald-500/20 max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            {/* <div className="flex justify-center mb-4">
              <Image src="/SpringDev.png" alt="DevSpring" width={64} height={64} className="rounded-lg" />
            </div> */}
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Campaign Created!</h2>
            <p className="text-blue-200 mb-4">Your campaign has been successfully deployed to the blockchain.</p>
            <p className="text-sm text-blue-300">Redirecting to campaigns page...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-800/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center space-x-3">
            <Link href="/campaigns">
              <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-800/20">
                <Users className="w-4 h-4 mr-2" />
                View Campaigns
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full mb-6">
              <Image src="/SpringDev.png" alt="DevSpring" width={32} height={32} className="rounded" />
            </div> */}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              Launch Your Campaign
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Turn your innovative ideas into reality with decentralized crowdfunding
            </p>
          </div>

          {/* Wallet Connection */}
          <WalletConnection onWalletConnected={setWalletAddress} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Progress & Tips */}
            <div className="lg:col-span-1 space-y-6">
              {/* Form Progress */}
              <Card className="glass-card border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                    Form Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">Completion</span>
                    <span className="text-white font-semibold">{formScore}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${formScore}%` }}
                    ></div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className={`flex items-center ${walletAddress ? "text-emerald-400" : "text-yellow-400"}`}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Wallet Connected
                    </div>
                    <div className={`flex items-center ${formScore === 100 ? "text-emerald-400" : "text-yellow-400"}`}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Form Complete
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dev Fee Info */}
              <Card className="glass-card border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <Info className="w-5 h-5 mr-2 text-yellow-400" />
                    Platform Fee
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-yellow-200">
                    <div className="font-medium text-white mb-1">• Dev Fee: {feePercentage}%</div>
                    <div>A {feePercentage}% fee is deducted when you withdraw funds</div>
                  </div>
                  <div className="text-sm text-yellow-200">
                    <div className="font-medium text-white mb-1">• 7-Day Grace Period</div>
                    <div>You have 7 days after campaign ends to withdraw</div>
                  </div>
                  <div className="text-sm text-yellow-200">
                    <div className="font-medium text-white mb-1">• Auto-Refund</div>
                    <div>Contributors get refunded if goal not met or you don't withdraw in time</div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Start Info */}
              <Card className="glass-card border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-blue-400" />
                    Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-blue-200">
                    <div className="font-medium text-white mb-1">• Connect Wallet</div>
                    <div>Connect your wallet to Base network</div>
                  </div>
                  <div className="text-sm text-blue-200">
                    <div className="font-medium text-white mb-1">• Fill Details</div>
                    <div>Complete all required campaign information</div>
                  </div>
                  <div className="text-sm text-blue-200">
                    <div className="font-medium text-white mb-1">• Launch Campaign</div>
                    <div>Deploy your campaign to the blockchain</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Campaign Form */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center">
                    <Rocket className="w-6 h-6 mr-3 text-blue-400" />
                    Campaign Details
                  </CardTitle>
                  <p className="text-blue-200">Create your crowdfunding campaign</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-red-300 font-medium text-sm">Error Creating Campaign</p>
                        <p className="text-red-200 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campaign Title */}
                    <FormField
                      label="Campaign Title"
                      icon={FileText}
                      value={formData.title}
                      onChange={(value) => handleInputChange("title", value)}
                      placeholder="Enter a compelling campaign title"
                      error={validationState.title?.error}
                      hint={validationState.title?.hint}
                      maxLength={validationRules.title.maxLength}
                      required
                      disabled={!walletAddress}
                      validation={validationRules.title.validate}
                      suggestions={getSuggestions("title", formData.title)}
                    />

                    {/* Campaign Description */}
                    <FormField
                      label="Project Description"
                      icon={FileText}
                      type="textarea"
                      value={formData.description}
                      onChange={(value) => handleInputChange("description", value)}
                      placeholder="Describe your project, its goals, and how funds will be used..."
                      rows={4}
                      error={validationState.description?.error}
                      hint={validationState.description?.hint}
                      maxLength={validationRules.description.maxLength}
                      required
                      disabled={!walletAddress}
                      validation={validationRules.description.validate}
                    />

                    {/* Goal and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="Funding Goal (ETH)"
                        icon={Target}
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.goal}
                        onChange={(value) => handleInputChange("goal", value)}
                        placeholder="0.00"
                        error={validationState.goal?.error}
                        hint={validationState.goal?.hint}
                        required
                        disabled={!walletAddress}
                        validation={validationRules.goal.validate}
                      />

                      <FormField
                        label="Duration (Days)"
                        icon={Calendar}
                        type="number"
                        min="1"
                        max="365"
                        value={formData.duration}
                        onChange={(value) => handleInputChange("duration", value)}
                        placeholder="30"
                        error={validationState.duration?.error}
                        hint={validationState.duration?.hint}
                        required
                        disabled={!walletAddress}
                        validation={validationRules.duration.validate}
                      />
                    </div>

                    {/* Optional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="GitHub Repository (Optional)"
                        value={formData.githubRepo}
                        onChange={(value) => handleInputChange("githubRepo", value)}
                        placeholder="https://github.com/username/repo"
                        error={validationState.githubRepo?.error}
                        hint={validationState.githubRepo?.hint}
                        disabled={!walletAddress}
                        validation={validationRules.githubRepo.validate}
                      />

                      <FormField
                        label="Live Site URL (Optional)"
                        value={formData.liveSiteUrl}
                        onChange={(value) => handleInputChange("liveSiteUrl", value)}
                        placeholder="https://yourproject.com"
                        error={validationState.liveSiteUrl?.error}
                        hint={validationState.liveSiteUrl?.hint}
                        disabled={!walletAddress}
                        validation={validationRules.liveSiteUrl.validate}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading || !isFormValid}
                      className="btn-primary w-full py-3 text-lg font-semibold"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Campaign...
                        </div>
                      ) : !walletAddress ? (
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Connect Wallet First
                        </div>
                      ) : formScore < 100 ? (
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          Complete Form ({formScore}%)
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Rocket className="w-5 h-5 mr-2" />
                          Launch Campaign
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
