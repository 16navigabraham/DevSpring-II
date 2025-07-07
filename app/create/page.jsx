"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Rocket, Calendar, Target, FileText, Lightbulb, Users, TrendingUp, CheckCircle } from "lucide-react"
import { FormField } from "@/components/FormField"
import { validationRules, getValidationHints, getSuggestions } from "@/lib/validation"

export default function CreateCampaign() {
  const [isLoading, setIsLoading] = useState(false)
  const [isBuilderVerified, setIsBuilderVerified] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    duration: "",
    githubRepo: "",
    liveSiteUrl: "",
  })
  const [validationState, setValidationState] = useState({})
  const [formScore, setFormScore] = useState(0)

  // Simulate form validation
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTimeout(updateValidation, 100)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate campaign creation
    setTimeout(() => {
      setIsLoading(false)
      alert("Campaign created successfully! (Demo mode)")
    }, 2000)
  }

  const handleVerifyBuilder = () => {
    setIsBuilderVerified(true)
  }

  const isFormValid = formScore === 100 && isBuilderVerified

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="ghost"
            className="text-blue-200 hover:text-white hover:bg-blue-800/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <Button
            onClick={() => (window.location.href = "/campaigns")}
            variant="ghost"
            className="text-blue-200 hover:text-white hover:bg-blue-800/20"
          >
            <Users className="w-4 h-4 mr-2" />
            View Campaigns
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              Launch Your Campaign
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Turn your innovative ideas into reality with decentralized crowdfunding
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Progress & Tips */}
            <div className="lg:col-span-1 space-y-6">
              {/* Builder Score Verification */}
              <Card className="glass-card border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="font-semibold text-white">Builder Score</div>
                        <div className="text-sm text-blue-300">
                          {isBuilderVerified ? "Verified" : "Verification Required"}
                        </div>
                      </div>
                    </div>
                    {!isBuilderVerified && (
                      <Button onClick={handleVerifyBuilder} className="btn-primary">
                        Verify
                      </Button>
                    )}
                    {isBuilderVerified && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                  </div>
                </CardContent>
              </Card>

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
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="glass-card border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-blue-200">
                    <div className="font-medium text-white mb-1">• Be Specific</div>
                    <div>Clear goals and timelines build trust</div>
                  </div>
                  <div className="text-sm text-blue-200">
                    <div className="font-medium text-white mb-1">• Show Progress</div>
                    <div>Share updates and milestones regularly</div>
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
                      disabled={!isBuilderVerified}
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
                      disabled={!isBuilderVerified}
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
                        disabled={!isBuilderVerified}
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
                        disabled={!isBuilderVerified}
                        validation={validationRules.duration.validate}
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
                      ) : !isBuilderVerified ? (
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Verify Builder Score First
                        </div>
                      ) : formScore < 100 ? (
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          Complete Form ({formScore}%)
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Rocket className="w-5 h-5 mr-2" />
                          Launch Campaign (Demo)
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
