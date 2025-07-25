"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 flex items-center justify-center p-6">
      <Card className="glass-card border-red-500/20 max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
          <p className="text-red-200 mb-6">{error?.message || "An unexpected error occurred. Please try again."}</p>
          <Button onClick={reset} className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Please try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
