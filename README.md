# 📈 Saros Smart LP Strategist

Welcome to the Saros Smart LP Strategist, a powerful analytics dashboard designed by **[Jadeofwallstreet](https://www.0xnotes.lol/)** to help DeFi liquidity providers optimize their strategies on the Saros Dynamic Liquidity Market Maker (DLMM). This tool provides live on-chain data analysis, interactive position simulation, and (soon) historical backtesting to empower LPs to maximize their capital efficiency and fee generation.

This project was built for the Saros DLMM SDK Bounty and is intended to serve as a high-quality foundation for a future hackathon project.

**[➡️ View Live Demo](https://saros-lp-strategist-lvbh2369w-jades-projects-3e455543.vercel.app/)**

### ✨ Features

My submission is a multi-feature application that combines several of the bounty's demo ideas into one cohesive and user-friendly platform.

*   **📊 Live Liquidity Analyzer:**
    *   Input any Saros DLMM pool address to instantly visualize its liquidity distribution.
    *   Identifies the current active trading bin, highlighted for clarity.
    *   Fetches and displays the real-time on-chain pool price.

*   **🔬 Interactive Strategy Simulator:**
    *   Visually design a hypothetical liquidity position directly on the live chart.
    *   Define your investment amount and set your desired min/max price bins.
    *   See an immediate representation of how your capital would be distributed across the bins, helping you identify concentration and range strategies.

*   **💡 Dark/Light Mode:** A polished user experience with a theme toggle.
*   **🚀 Built for Performance:** A fast, modern, and responsive interface built with Next.js, Framer Motion, and Vercel.

---

### 🛠️ Tech Stack & Saros SDK Integration

*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **UI & Animations:** Framer Motion, Recharts
*   **Blockchain Integration:**
    *   **@saros-finance/dlmm-sdk (TypeScript):** We use it for `fetchPoolMetadata()`, `getPairAccount()`, `getQuote()`, and `getBinArrayInfo()`.
    *   **@solana/wallet-adapter:** For seamless wallet integration.

---

### 🚀 Getting Started

1.  Clone the repository and install dependencies: `npm install`.
2.  Create `.env.local` and add `NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com`.
3.  Run the development server: `npm run dev`.

Built with ❤️ by [Jadeofwallstreet](https://www.0xnotes.lol/)
