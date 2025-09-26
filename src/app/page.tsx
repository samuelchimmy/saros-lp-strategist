'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchPoolData, PoolData } from '@/services/sarosService';
import { getPriceFromId } from "@/utils/price";
import { calculateTokenAmount } from '@/utils/token';
import WalletConnectButton from '@/components/WalletConnectButton';
import { ModeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

type ChartData = { name: string; price: number; liquidity: number; };

export default function HomePage() {
    const [poolAddress, setPoolAddress] = useState('C8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQB');
    const [poolData, setPoolData] = useState<PoolData | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();
    const [chartColors, setChartColors] = useState({ grid: '#4A5568', tick: '#A0AEC0', activeBin: '#F59E0B', bin: '#22D3EE' });

    useEffect(() => {
        if (theme === 'dark') {
            setChartColors({ grid: '#4A5568', tick: '#A0AEC0', activeBin: '#F59E0B', bin: '#22D3EE' });
        } else {
            setChartColors({ grid: '#CBD5E0', tick: '#4A5568', activeBin: '#22D3EE', bin: '#F59E0B' });
        }
    }, [theme]);

    const handleFetchData = async () => {
        setIsLoading(true); setError(null); setPoolData(null); setChartData([]);
        try {
            const data = await fetchPoolData(poolAddress);
            setPoolData(data);
            const { metadata, binStep, activeBin, binArrays, price } = data;
            const processedBins: ChartData[] = [];
            const BIN_ARRAY_SIZE = 256;
            binArrays.forEach(arr => {
                if (arr && arr.bins) arr.bins.forEach((bin: any, i: number) => {
                    const binId = (arr.index * BIN_ARRAY_SIZE) + i;
                    if (Number(bin.reserveX) > 0 || Number(bin.reserveY) > 0) {
                        const baseAmt = calculateTokenAmount(bin.reserveX, metadata.extra.tokenBaseDecimal);
                        const quoteAmt = calculateTokenAmount(bin.reserveY, metadata.extra.tokenQuoteDecimal);
                        processedBins.push({ name: `${binId}`, price: getPriceFromId(binStep, binId, metadata.extra.tokenBaseDecimal, metadata.extra.tokenQuoteDecimal), liquidity: (baseAmt * price) + quoteAmt });
                    }
                });
            });
            const activeIdx = processedBins.findIndex(b => parseInt(b.name) === activeBin);
            const range = 25;
            setChartData(processedBins.slice(Math.max(0, activeIdx - range), activeIdx + range + 1));
        } catch (err: any) { setError(`Failed: ${err.message}`); }
        finally { setIsLoading(false); }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload?.length) {
        return <div className="p-3 bg-card border rounded text-card-foreground text-sm"><p>{`Bin ID: ${label}`}</p><p>{`Price: $${payload[0].payload.price.toFixed(6)}`}</p><p>{`Liquidity: $${payload[0].value.toLocaleString()}`}</p></div>;
      } return null;
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-12 font-sans">
            <div className="w-full max-w-7xl">
                <header className="flex justify-between items-center mb-8 gap-4">
                    <h1 className="text-4xl font-bold">Saros LP Strategist</h1>
                    <div className="flex gap-4 items-center">
                        <WalletConnectButton />
                        <ModeToggle />
                    </div>
                </header>
                <section className="bg-card p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-center">
                    <label className="font-semibold">Pool Address (Devnet):</label>
                    <input value={poolAddress} onChange={(e) => setPoolAddress(e.target.value)} className="flex-grow w-full bg-background p-2 rounded border-input border" />
                    <button onClick={handleFetchData} disabled={isLoading} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 p-2 px-6 rounded">{isLoading ? 'Loading...' : 'Analyze'}</button>
                </section>
                {error && <div className="mt-4 text-destructive p-3 rounded">{error}</div>}
                <section className="mt-8 bg-card p-4 rounded-lg min-h-[500px] flex items-center justify-center">
                    {isLoading ? <p>Fetching data...</p> : !poolData || chartData.length === 0 ? <p>Enter a pool address to analyze.</p> :
                     (<div className="w-full">
                           <div className='mb-4 text-center'><h2 className="text-2xl font-semibold">Live Liquidity Distribution</h2><p className="text-muted-foreground">Current Price: ~${poolData.price.toFixed(4)} | Active Bin: {poolData.activeBin}</p></div>
                            <ResponsiveContainer width="100%" height={450}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                    <XAxis dataKey="name" tick={{ fill: chartColors.tick }} />
                                    <YAxis tickFormatter={(val) => `$${Number(val).toLocaleString()}`} tick={{ fill: chartColors.tick }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="liquidity">{chartData.map(e => (<Cell key={e.name} fill={parseInt(e.name) === poolData.activeBin ? chartColors.activeBin : chartColors.bin} />))}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>)}
                </section>
            </div>
        </main>
    );
}