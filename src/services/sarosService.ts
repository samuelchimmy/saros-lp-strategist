import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { PublicKey } from "@solana/web3.js";
import { calculateTokenAmount } from "@/utils/token";
import { getPriceFromId } from "@/utils/price"; 

export interface PoolData { metadata: any; price: number; activeBin: number; binStep: number; binArrays: any[]; }

const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const liquidityBookServices = new LiquidityBookServices({
    mode: MODE.DEVNET,
    options: { rpcUrl: rpcUrl }
});

export async function fetchPoolData(poolAddress: string): Promise<PoolData> {
    if (!rpcUrl) throw new Error("RPC Host is not defined.");
    if (!poolAddress) throw new Error("Pool address is required.");
    
    const poolPublicKey = new PublicKey(poolAddress);
    const metadata = await liquidityBookServices.fetchPoolMetadata(poolAddress);
    if (!metadata || !metadata.baseMint) throw new Error("Failed to fetch metadata.");

    const quoteAmount = BigInt(1 * Math.pow(10, metadata.extra.tokenBaseDecimal));
    const quote = await liquidityBookServices.getQuote({
        amount: quoteAmount, isExactInput: true, swapForY: true, pair: poolPublicKey,
        tokenBase: new PublicKey(metadata.baseMint),
        tokenQuote: new PublicKey(metadata.quoteMint),
        tokenBaseDecimal: metadata.extra.tokenBaseDecimal,
        tokenQuoteDecimal: metadata.extra.tokenQuoteDecimal,
        slippage: 0.1,
    });
    const price = calculateTokenAmount(quote.amountOut, metadata.extra.tokenQuoteDecimal);

    const pairAccount = await liquidityBookServices.getPairAccount(poolPublicKey);
    const { activeId: activeBin, binStep } = pairAccount;
    
    const BIN_ARRAY_SIZE = 256;
    const activeBinArrayIndex = Math.floor(activeBin / BIN_ARRAY_SIZE);
    const binArrayIndexesToFetch = [activeBinArrayIndex - 1, activeBinArrayIndex, activeBinArrayIndex + 1];

    const binArraysPromises = binArrayIndexesToFetch.map(index =>
        liquidityBookServices.getBinArrayInfo({
            binArrayIndex: index, pair: poolPublicKey,
            payer: new PublicKey("11111111111111111111111111111111"), 
        }).catch(() => null)
    );
    const binArrays = await Promise.all(binArraysPromises);
    
    return { metadata, price, activeBin, binStep, binArrays };
}
