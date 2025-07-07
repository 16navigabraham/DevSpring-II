import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CrowdfundMe - Decentralized Crowdfunding",
  description: "Fund the future with blockchain-powered crowdfunding on Base",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarnings>
      <body className={inter.className} suppressHydrationWarnings>
        {children}
      </body>
    </html>
  )
}
