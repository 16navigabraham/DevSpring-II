import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CrowdfundMe - Decentralized Crowdfunding",
  description: "Fund the future with blockchain-powered crowdfunding on Base",
  icons: {
    icon: "/SpringDev.png",
  },
  themeColor: "#ffffff",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
