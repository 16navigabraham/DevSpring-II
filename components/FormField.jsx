"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

export function FormField({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  maxLength,
  minLength,
  required = false,
  disabled = false,
  validation,
  suggestions = [],
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const isValid = validation ? validation(value) : !error
  const characterCount = value?.length || 0
  const isNearLimit = maxLength && characterCount > maxLength * 0.8

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  const InputComponent = type === "textarea" ? Textarea : Input

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-blue-200">
        {Icon && <Icon className="w-4 h-4 inline mr-1" />}
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative">
        <InputComponent
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input-field transition-all duration-200 ${isFocused ? "ring-2 ring-blue-400/50" : ""} ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
          } ${isValid && value ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20" : ""}`}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={() => {
            setIsFocused(true)
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          onBlur={() => {
            setIsFocused(false)
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          {...props}
        />

        {/* Validation Icon */}
        {value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-slate-800 border border-blue-500/20 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/20 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Character Counter */}
      {maxLength && (
        <div className="flex justify-between items-center text-xs">
          <div></div>
          <div className={`${isNearLimit ? "text-yellow-400" : "text-blue-400"}`}>
            {characterCount}/{maxLength}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hint Message */}
      {hint && !error && (
        <div className="flex items-start space-x-2 text-blue-300 text-sm">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  )
}
