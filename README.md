---

# 🚀 DevSpring: Crowdfund for Builders

DevSpring is a decentralized crowdfunding platform designed for developers to raise funds and showcase their projects. It ensures legitimacy by requiring >=60 builder score and allows support through on-chain contributions on Base.

---

## 💡 Features

* 🔐 **Privy Authentication** – Connect via wallet or email(embed wallet not functional for now use wallet)
* 🌐 **Builder score** – Only wallets with >=60 bulder score can create campaigns
* 💸 **Contributions on Base Chain**
* 📦 **Smart Contract Powered** – Campaigns are on-chain with full transparency
* 🔍 **Campaign Details Modal** – Users must review and agree before contributing
* 🛠 **GitHub & Live URL Required** – Each campaign must include proof of work

---

## 🧱 Tech Stack

* [Next.js](https://nextjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Privy](https://privy.io/)
* [Ethers.js](https://docs.ethers.org/)
* [ENS.js](https://docs.ens.domains/)
* [Base Chain](https://base.org)

---

## 📂 File Structure

\`\`\`
app
├── abi/
│   └── CrowdfundFactory.json
├── components/
│   ├── CampaignCard.jsx
│   ├── ConnectWallet.jsx
│   ├── ContributeModal.jsx
│   └── providers.tsx
├── contract/
│   ├── CrowdfundFactory.sol
│   └── crowdfund.sol
├── pages/
│   ├── Create.jsx
│   └── Home.jsx
├── styles/
│   └── globals.css
└── utils/
    ├── constants.js
    ├── ens.js
    └── provider.js
\`\`\`

---

## ⚙️ Setup Instructions

1. **Clone the repo**

   \`\`\`bash
   git clone https://github.com/16navigabraham/DevSpring.git
   cd DevSpring
   \`\`\`

2. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

3. **Add environment variable**
   Create a `.env` file and add your Privy App ID:

   \`\`\`env
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
   \`\`\`

4. **Run development server**

   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open in browser**
   Visit [https://dev-spring-five.vercel.app/]()

---

## 🔭 Coming Soon

* 🧠 [Builder Score](https://docs.base.org/tools/builderscore/)
* 🪪 Soulbound Tokens for verified dev identity
* 📊 Campaign analytics dashboard

---

## 🧾 License

MIT © [Abraham Adebanjo](https://github.com/16navigabraham)

---
