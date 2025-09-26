import type { Metadata } from "next";
import "./globals.css";
import { WalletContextProvider } from "@/contexts/WalletContextProvider";

export const metadata: Metadata = {
  title: "Saros LP Strategist",
  description: "Analyze, Simulate, and Backtest Saros DLMM LP Strategies",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
