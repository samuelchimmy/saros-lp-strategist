import type { Metadata } from "next";
// THE FIX IS ON THIS LINE: We are importing globals.css with an absolute path alias.
import "@/app/globals.css";
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
