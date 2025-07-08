"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton({ variant = "ghost", className = "", showText = true }) {
  const { logout, authenticated } = usePrivy()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (!authenticated) {
    return null
  }

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      className={`text-red-300 hover:text-red-200 hover:bg-red-900/20 ${className}`}
    >
      <LogOut className="w-4 h-4" />
      {showText && <span className="ml-2">Disconnect</span>}
    </Button>
  )
}
