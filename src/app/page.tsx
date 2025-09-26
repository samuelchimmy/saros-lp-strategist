'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchPoolData, PoolData } from '@/services/sarosService';
import { getPriceFromId } from "@/utils/price";
import { calculateTokenAmount } from '@/utils/token';
import WalletConnectButton from '@/components/WalletConnectButton';

type ChartData = { name: string; price: number; liquidity: number; };

export default function HomePage() {
    const [poolAddress, setPoolAddress] = useState('C8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQB');
    const [poolData, setPoolData] = useState<PoolData | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        return <div className="p-3 bg-gray-800 border-gray-600 rounded text-white text-sm"><p>{`Bin ID: ${label}`}</p><p>{`Price: $${payload[0].payload.price.toFixed(6)}`}</p><p>{`Liquidity: $${payload[0].value.toLocaleString()}`}</p></div>;
      } return null;
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-12 bg-gray-900 text-white font-sans">
            <div className="w-full max-w-7xl">
                <header className="flex justify-between items-center mb-8 gap-4"><h1 className="text-4xl font-bold">Saros LP Strategist</h1><WalletConnectButton /></header>
                <section className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-center">
                    <label className="font-semibold">Pool Address (Devnet):</label>
                    <input value={poolAddress} onChange={(e) => setPoolAddress(e.target.value)} className="flex-grow w-full bg-gray-700 p-2 rounded border-gray-600" />
                    <button onClick={handleFetchData} disabled={isLoading} className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 p-2 px-6 rounded">{isLoading ? 'Loading...' : 'Analyze'}</button>
                </section>
                {error && <div className="mt-4 text-red-400 p-3 rounded">{error}</div>}
                <section className="mt-8 bg-gray-800 p-4 rounded-lg min-h-[500px] flex items-center justify-center">
                    {isLoading ? <p>Fetching data...</p> : !poolData || chartData.length === 0 ? <p>Enter a pool address to analyze.</p> :
                     (<div className="w-full">
                           <div className='mb-4 text-center'><h2 className="text-2xl font-semibold">Live Liquidity Distribution</h2><p className="text-gray-400">Current Price: ~${poolData.price.toFixed(4)} | Active Bin: {poolData.activeBin}</p></div>
                            <ResponsiveContainer width="100%" height={450}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                    <XAxis dataKey="name" tick={{ fill: '#A0AEC0' }} />
                                    <YAxis tickFormatter={(val) => `$${Number(val).toLocaleString()}`} tick={{ fill: '#A0AEC0' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="liquidity">{chartData.map(e => (<Cell key={e.name} fill={parseInt(e.name) === poolData.activeBin ? '#F59E0B' : '#22D3EE'} />))}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>)}
                </section>
            </div>
        </main>
    );
}
