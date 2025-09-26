'use client';
import { useState, useMemo } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPoolData, PoolData } from '@/services/sarosService';
import { getPriceFromId } from "@/utils/price";
import { calculateTokenAmount } from '@/utils/token';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type ChartData = { name: string; price: number; liquidity: number; simulatedLiquidity?: number };

function HeroSection({ setPoolAddress, handleFetchData, poolAddress, isLoading }: any) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border p-6 rounded-lg text-center"
    >
      <h2 className="font-heading text-5xl text-primary mb-4">Fortify Your Liquidity</h2>
      <p className="font-sans text-zinc-400 max-w-2xl mx-auto mb-6">
        Input a Saros DLMM pool address to analyze its live liquidity distribution. Then, simulate your own position to find the optimal strategy before you commit a single token.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center max-w-xl mx-auto">
          <input value={poolAddress} onChange={(e) => setPoolAddress(e.target.value)} placeholder="Enter Pool Address (Devnet)..." className="flex-grow w-full bg-background font-sans p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={handleFetchData} disabled={isLoading} className="w-full sm:w-auto bg-primary hover:brightness-90 disabled:bg-zinc-500 disabled:cursor-not-allowed font-bold p-3 px-8 rounded-md transition-all">
              {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
      </div>
    </motion.section>
  );
}

function Dashboard({ poolData, chartData, setInvestmentAmount, setMinBin, setMaxBin, investmentAmount, minBin, maxBin, setIsSimulationVisible, isSimulationVisible }: any) {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            const data = payload[0].payload;
            return (
              <div className="p-3 bg-background border border-border rounded-lg shadow-lg text-foreground text-sm font-sans">
                <p className="font-bold text-base">{`Bin ID: ${label}`}</p>
                <p className="text-zinc-400">{`Approx. Price: $${data.price.toFixed(6)}`}</p>
                {payload[0] && <p className="text-cyan-400">{`Pool Liquidity: $${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</p>}
                {payload[1] && payload[1].value > 0 && <p className="text-amber-400">{`Your Liquidity: $${payload[1].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</p>}
              </div>
            );
        } return null;
    };

    return (
        <AnimatePresence>
            {poolData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <section className="bg-card border border-border p-6 rounded-lg mt-8">
                        <h2 className="font-heading text-3xl text-primary mb-4">Simulate Your Strategy</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-400 font-sans">Investment (USD)</label>
                                <input type="number" value={investmentAmount} onChange={e => setInvestmentAmount(e.target.value)} className="mt-1 w-full bg-background font-sans p-3 rounded-md border border-border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 font-sans">Min Bin</label>
                                <input type="number" value={minBin} onChange={e => setMinBin(e.target.value)} className="mt-1 w-full bg-background font-sans p-3 rounded-md border border-border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 font-sans">Max Bin</label>
                                <input type="number" value={maxBin} onChange={e => setMaxBin(e.target.value)} className="mt-1 w-full bg-background font-sans p-3 rounded-md border border-border" />
                            </div>
                        </div>
                         <div className="mt-6 text-center">
                           <button onClick={() => setIsSimulationVisible(!isSimulationVisible)} className="bg-primary hover:brightness-90 text-white font-bold py-2 px-6 rounded-md transition-colors">
                             {isSimulationVisible ? 'Hide Simulation' : 'Visualize Strategy'}
                           </button>
                        </div>
                    </section>
                    
                    <section className="mt-8 bg-card border border-border p-4 rounded-lg min-h-[500px] flex items-center justify-center">
                         <div className="w-full">
                           <div className='mb-4 text-center'>
                              <p className="text-zinc-400 font-sans">Current Price: ~${poolData.price.toFixed(4)} | Active Bin: {poolData.activeBin}</p>
                           </div>
                            <ResponsiveContainer width="100%" height={450}>
                                <ComposedChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                    <YAxis tickFormatter={(val) => `$${Number(val).toLocaleString()}`} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} />
                                    <Legend wrapperStyle={{fontFamily: 'var(--font-kalam)'}}/>
                                    <Bar dataKey="liquidity" name="Pool Liquidity" barSize={20}>
                                      {chartData.map((e: any) => (<Cell key={e.name} fill={parseInt(e.name) === poolData.activeBin ? '#F59E0B' : '#22D3EE'} />))}
                                    </Bar>
                                    <AnimatePresence>
                                        {isSimulationVisible && (
                                            <Bar dataKey="simulatedLiquidity" name="Your Liquidity" barSize={20} fill="rgba(252, 211, 77, 0.6)" />
                                        )}
                                    </AnimatePresence>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function HomePage() {
    const [poolAddress, setPoolAddress] = useState('C8xWcMpzqetpxwLj7tJfSQ6J8Juh1wHFdT5KrkwdYPQB');
    const [poolData, setPoolData] = useState<PoolData | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [investmentAmount, setInvestmentAmount] = useState('1000');
    const [minBin, setMinBin] = useState('');
    const [maxBin, setMaxBin] = useState('');
    const [isSimulationVisible, setIsSimulationVisible] = useState(false);
    
    const processedChartData = useMemo(() => {
        if (chartData.length === 0) return [];
        
        const min = parseInt(minBin);
        const max = parseInt(maxBin);
        const investment = parseFloat(investmentAmount);

        if (!isSimulationVisible || isNaN(min) || isNaN(max) || isNaN(investment) || min >= max) {
            return chartData.map(d => ({ ...d, simulatedLiquidity: 0 }));
        }

        const binsInRange = chartData.filter(d => parseInt(d.name) >= min && parseInt(d.name) <= max);
        const liquidityPerBin = binsInRange.length > 0 ? investment / binsInRange.length : 0;

        return chartData.map(data => ({
            ...data,
            simulatedLiquidity: (parseInt(data.name) >= min && parseInt(data.name) <= max) ? liquidityPerBin : 0
        }));
    }, [chartData, isSimulationVisible, minBin, maxBin, investmentAmount]);

    const handleFetchData = async () => {
        setIsLoading(true); setError(null); setPoolData(null); setChartData([]); setIsSimulationVisible(false);
        try {
            const data = await fetchPoolData(poolAddress);
            setPoolData(data);
            setMinBin(String(data.activeBin - 10));
            setMaxBin(String(data.activeBin + 10));
            const { metadata, binStep, activeBin, binArrays, price } = data;
            const processedBins: ChartData[] = [];
            binArrays.forEach(arr => {
                if (arr && arr.bins) arr.bins.forEach((bin: any, i: number) => {
                    const binId = (arr.index * 256) + i;
                    if (Number(bin.reserveX) > 0 || Number(bin.reserveY) > 0) {
                        const baseAmt = calculateTokenAmount(bin.reserveX, metadata.extra.tokenBaseDecimal);
                        const quoteAmt = calculateTokenAmount(bin.reserveY, metadata.extra.tokenQuoteDecimal);
                        processedBins.push({ name: `${binId}`, price: getPriceFromId(binStep, binId, metadata.extra.tokenBaseDecimal, metadata.extra.tokenQuoteDecimal), liquidity: (baseAmt * price) + quoteAmt });
                    }
                });
            });
            const activeIdx = processedBins.findIndex(b => parseInt(b.name) === activeBin);
            const range = 40;
            setChartData(processedBins.slice(Math.max(0, activeIdx - range), activeIdx + range + 1));
        } catch (err: any) { setError(`Failed: ${err.message}`); }
        finally { setIsLoading(false); }
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center p-4 md:p-8 bg-background font-sans"
        >
            <div className="w-full max-w-7xl">
                <Header />
                <HeroSection 
                  setPoolAddress={setPoolAddress}
                  handleFetchData={handleFetchData}
                  poolAddress={poolAddress}
                  isLoading={isLoading}
                />
                {error && <div className="mt-4 text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/30 font-sans text-center animate-fade-in">{error}</div>}
                <Dashboard 
                  poolData={poolData}
                  chartData={processedChartData}
                  setInvestmentAmount={setInvestmentAmount}
                  setMinBin={setMinBin}
                  setMaxBin={setMaxBin}
                  investmentAmount={investmentAmount}
                  minBin={minBin}
                  maxBin={maxBin}
                  setIsSimulationVisible={setIsSimulationVisible}
                  isSimulationVisible={isSimulationVisible}
                />
                <Footer />
            </div>
        </motion.main>
    );
}
