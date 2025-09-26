'use client';
import React, { FC, useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
    const wallets = useMemo(() => [ new PhantomWalletAdapter(), new SolflareWalletAdapter() ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
