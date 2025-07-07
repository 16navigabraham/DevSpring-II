// Validation utilities and rules

export const validationRules = {
  title: {
    minLength: 5,
    maxLength: 80,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
    validate: (value) => {
      if (!value) return "Title is required"
      if (value.length < 5) return "Title must be at least 5 characters"
      if (value.length > 80) return "Title must be less than 80 characters"
      if (!/^[a-zA-Z0-9\s\-_.,!?()]+$/.test(value)) return "Title contains invalid characters"
      if (value.trim() !== value) return "Title cannot start or end with spaces"
      return null
    },
    hint: "Create a clear, compelling title that describes your project (5-80 characters)",
  },

  description: {
    minLength: 50,
    maxLength: 1000,
    validate: (value) => {
      if (!value) return "Description is required"
      if (value.length < 50) return "Description must be at least 50 characters"
      if (value.length > 1000) return "Description must be less than 1000 characters"

      const wordCount = value.trim().split(/\s+/).length
      if (wordCount < 10) return "Description should contain at least 10 words"

      return null
    },
    hint: "Explain your project's purpose, goals, and how funds will be used (50-1000 characters)",
  },

  goal: {
    min: 0.01,
    max: 1000,
    validate: (value) => {
      if (!value) return "Funding goal is required"

      const numValue = Number.parseFloat(value)
      if (isNaN(numValue)) return "Please enter a valid number"
      if (numValue <= 0) return "Goal must be greater than 0"
      if (numValue < 0.01) return "Minimum goal is 0.01 ETH"
      if (numValue > 1000) return "Maximum goal is 1000 ETH"

      // Check for reasonable decimal places
      const decimalPlaces = (value.split(".")[1] || "").length
      if (decimalPlaces > 6) return "Maximum 6 decimal places allowed"

      return null
    },
    hint: "Set a realistic funding target between 0.01 and 1000 ETH",
  },

  duration: {
    min: 1,
    max: 365,
    validate: (value) => {
      if (!value) return "Campaign duration is required"

      const numValue = Number.parseInt(value)
      if (isNaN(numValue)) return "Please enter a valid number"
      if (numValue < 1) return "Minimum duration is 1 day"
      if (numValue > 365) return "Maximum duration is 365 days"

      return null
    },
    hint: "Choose campaign duration between 1 and 365 days",
  },

  githubRepo: {
    pattern: /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/,
    validate: (value) => {
      if (!value) return null // Optional field

      if (!value.startsWith("https://github.com/")) {
        return "Must be a valid GitHub repository URL"
      }

      const pathParts = value.replace("https://github.com/", "").split("/")
      if (pathParts.length < 2) return "Invalid GitHub repository format"

      return null
    },
    hint: "Optional: Link to your project's GitHub repository",
  },

  liveSiteUrl: {
    pattern: /^https?:\/\/.+/,
    validate: (value) => {
      if (!value) return null // Optional field

      try {
        new URL(value)
        return null
      } catch {
        return "Please enter a valid URL starting with http:// or https://"
      }
    },
    hint: "Optional: Link to your project's live demo or website",
  },
}

export const getValidationHints = (field, value) => {
  const rule = validationRules[field]
  if (!rule) return null

  const error = rule.validate(value)
  if (error) return { type: "error", message: error }

  // Dynamic hints based on current value
  switch (field) {
    case "title":
      if (!value) return { type: "hint", message: rule.hint }
      if (value.length < 10) return { type: "hint", message: "Consider making your title more descriptive" }
      if (value.length > 60) return { type: "hint", message: "Shorter titles are often more impactful" }
      return { type: "success", message: "Great title length!" }

    case "description":
      if (!value) return { type: "hint", message: rule.hint }
      if (value.length < 100) return { type: "hint", message: "Add more details about your project goals" }
      if (value.length > 800) return { type: "hint", message: "Consider being more concise" }
      return { type: "success", message: "Good description length!" }

    case "goal":
      if (!value) return { type: "hint", message: rule.hint }
      const numValue = Number.parseFloat(value)
      if (numValue < 1) return { type: "hint", message: "Small goals are easier to achieve" }
      if (numValue > 10) return { type: "hint", message: "Large goals may take longer to fund" }
      return { type: "success", message: "Reasonable funding goal!" }

    case "duration":
      if (!value) return { type: "hint", message: rule.hint }
      const durationValue = Number.parseInt(value)
      if (durationValue < 7) return { type: "hint", message: "Short campaigns create urgency" }
      if (durationValue > 60) return { type: "hint", message: "Longer campaigns may lose momentum" }
      return { type: "success", message: "Good campaign duration!" }

    default:
      return { type: "hint", message: rule.hint }
  }
}

export const getSuggestions = (field, value) => {
  switch (field) {
    case "title":
      return [
        "Revolutionary DeFi Protocol",
        "Next-Gen NFT Marketplace",
        "AI-Powered Trading Bot",
        "Decentralized Social Network",
        "Cross-Chain Bridge Solution",
      ]

    case "description":
      if (!value || value.length < 20) {
        return [
          "Our project aims to solve...",
          "We are building a platform that...",
          "This innovative solution will...",
          "Join us in creating...",
        ]
      }
      return []

    case "goal":
      return ["0.5", "1.0", "2.5", "5.0", "10.0"]

    case "duration":
      return ["7", "14", "30", "45", "60", "90"]

    default:
      return []
  }
}
