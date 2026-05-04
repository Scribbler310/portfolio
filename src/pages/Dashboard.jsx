import React, { useState, useMemo, useEffect } from 'react';
import { fetchRealData } from '../data/historicalData';
import { mockPortfolios } from '../data/mockData';
import { tickerMetrics } from '../data/tickerMetrics';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Indicators from '../components/Indicators';
import FeeTransparencyModule from '../components/FeeTransparencyModule';
import RebalancingEngine from '../components/RebalancingEngine';
import TransparencyModal from '../components/TransparencyModal';
import MacroTracker from '../components/MacroTracker';
import StockPopup from '../components/StockPopup';
import PortfolioHeatmap from '../components/PortfolioHeatmap';
import FinancialCalculators from '../components/FinancialCalculators';
import { LayoutGrid, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import StockSearch from '../components/StockSearch';

export default function Dashboard({ riskProfile }) {
  // Initialize with a cached portfolio if available, otherwise an empty one
  const [currentPortfolio, setCurrentPortfolio] = useState(() => {
    const saved = localStorage.getItem('gs_portfolio');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saved portfolio:", e);
      }
    }
    return {
      ...mockPortfolios[riskProfile],
      allocation: []
    };
  });

  // Save to cache whenever portfolio changes
  useEffect(() => {
    localStorage.setItem('gs_portfolio', JSON.stringify(currentPortfolio));
  }, [currentPortfolio]);
  const [modalData, setModalData] = useState(null);
  
  // State for popups
  const [activePopupAsset, setActivePopupAsset] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [totals, setTotals] = useState({ value: 0, change: 0, percent: 0, rawValue: 0, loading: true });
  const [prices, setPrices] = useState({});

  // Dynamic Calculation of Health, Risk, and Weights based on real metrics
  const displayPortfolio = useMemo(() => {
    let totalBeta = 0;
    let totalExpense = 0;
    const numAssets = currentPortfolio.allocation.length;
    
    // Calculate current market total
    let marketTotal = 0;
    currentPortfolio.allocation.forEach(asset => {
      const priceData = prices[asset.ticker] || { price: 0 };
      marketTotal += asset.shares * priceData.price;
    });

    const updatedAllocation = currentPortfolio.allocation.map(asset => {
      const priceData = prices[asset.ticker] || { price: 0, percent: 0 };
      const marketVal = asset.shares * priceData.price;
      const weight = marketTotal > 0 ? (marketVal / marketTotal) * 100 : 0;
      
      const metrics = tickerMetrics[asset.ticker] || { beta: 1, expenseRatio: 0.1 };
      totalBeta += (metrics.beta || 1) * (weight / 100);
      totalExpense += (metrics.expenseRatio || 0.1) * (weight / 100);

      return {
        ...asset,
        value: Number(weight.toFixed(2)),
        dayChange: priceData.percent,
        dollarChange: priceData.change
      };
    });

    if (numAssets === 0) {
      return { 
        ...currentPortfolio,
        healthScore: 0, 
        riskLevel: 'None', 
        avgBeta: '0.00',
        stockSplit: 0,
        mfSplit: 0
      };
    }

    // Determine Risk Level
    let riskLevel = 'Medium';
    if (totalBeta < 0.6) riskLevel = 'Low';
    else if (totalBeta > 1.2) riskLevel = 'High';

    // Determine Health Score (Base 100)
    let healthScore = 100;
    healthScore -= Math.min(totalExpense * 100 * 2, 20);
    if (numAssets >= 5) healthScore += 5;
    
    const profileMap = { 'Cautious': 'Low', 'Balanced': 'Medium', 'Bold': 'High' };
    if (riskLevel !== profileMap[riskProfile]) healthScore -= 15;
    healthScore = Math.min(Math.max(Math.round(healthScore), 0), 100);

    // Calculate Asset Type Split
    let stockWeight = 0;
    let mfWeight = 0;
    updatedAllocation.forEach(asset => {
      if (asset.type === 'mf') mfWeight += asset.value;
      else stockWeight += asset.value;
    });

    return { 
      ...currentPortfolio,
      allocation: updatedAllocation,
      healthScore, 
      riskLevel, 
      avgBeta: totalBeta.toFixed(2),
      stockSplit: stockWeight,
      mfSplit: mfWeight
    };
  }, [currentPortfolio, riskProfile, prices]);

  const handleRebalance = (scenario) => {
    setModalData(scenario);
  };

  const closeModal = () => setModalData(null);
  const closeStockPopup = () => setActivePopupAsset(null);

  const handleAddStock = (newAsset) => {
    setCurrentPortfolio(prev => {
      // If portfolio is empty, the first stock gets 100% allocation
      if (prev.allocation.length === 0) {
        return {
          ...prev,
          allocation: [{ ...newAsset, value: 100 }]
        };
      }

      const scale = (100 - newAsset.value) / 100;
      const updatedExisting = prev.allocation.map(a => ({
        ...a,
        value: Number((a.value * scale).toFixed(2))
      }));
      
      // Ensure sum is exactly 100
      const currentSum = updatedExisting.reduce((acc, a) => acc + a.value, 0) + newAsset.value;
      if (currentSum !== 100 && updatedExisting.length > 0) {
        updatedExisting[0].value += Number((100 - currentSum).toFixed(2));
      }

      return {
        ...prev,
        allocation: [...updatedExisting, newAsset]
      };
    });
  };

  useEffect(() => {
    async function calculateTotals() {
      if (currentPortfolio.allocation.length === 0) {
        setTotals({ value: '$0.00', change: '$0.00', percent: '0.00', isPositive: true, loading: false });
        return;
      }
      
      setTotals(prev => ({ ...prev, loading: true }));
      
      const pricePromises = currentPortfolio.allocation.map(asset => fetchRealData(asset.ticker));
      const results = await Promise.all(pricePromises);
      
      let newTotalValue = 0;
      let newTotalChange = 0;
      const priceMap = {};
      
      results.forEach((data, index) => {
        const ticker = currentPortfolio.allocation[index].ticker;
        priceMap[ticker] = {
          price: data.currentPrice,
          change: data.change,
          percent: (data.change / (data.currentPrice - data.change)) * 100
        };
        newTotalValue += currentPortfolio.allocation[index].shares * data.currentPrice;
        newTotalChange += (currentPortfolio.allocation[index].shares * data.change);
      });

      setPrices(priceMap);

      const percent = newTotalValue > 0 ? (newTotalChange / (newTotalValue - newTotalChange)) * 100 : 0;

      // Update totals
      setTotals({
        value: newTotalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        change: newTotalChange.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        percent: percent.toFixed(2),
        rawValue: newTotalValue,
        isPositive: newTotalChange >= 0,
        loading: false
      });
    }
    calculateTotals();
  }, [JSON.stringify(currentPortfolio.allocation.map(a => `${a.ticker}-${a.shares}`))]); // Only watch ticker/shares, not the derived weights changes

  return (
    <div className="min-h-screen bg-gs-light p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-gs-navy mb-2">
              Your <span className="font-semibold">{riskProfile}</span> Portfolio
            </h1>
            <p className="text-gs-slate text-lg font-light">
              Built for your goals. Transparently managed.
            </p>
          </div>
          
          <div className="bg-white px-8 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-8 min-w-[320px]">
            <div>
              <p className="text-[10px] font-bold text-gs-slate uppercase tracking-widest mb-1">Total Value</p>
              {totals.loading ? (
                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gs-navy">{totals.value}</p>
              )}
            </div>
            <div className="h-10 w-px bg-gray-100"></div>
            <div>
              <p className="text-[10px] font-bold text-gs-slate uppercase tracking-widest mb-1">Day Change</p>
              {totals.loading ? (
                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <p className={`text-lg font-bold ${totals.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                  {totals.isPositive ? '+' : ''}{totals.change}
                  <span className="text-xs ml-1 font-medium">({totals.isPositive ? '+' : ''}{totals.percent}%)</span>
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Top Section: Allocation */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center mb-8">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPortfolio.allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {displayPortfolio.allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gs-navy">Current Allocation</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="bg-gs-navy text-white p-1.5 rounded-lg hover:bg-gs-gold hover:text-gs-navy transition-all shadow-sm"
                  title="Add Asset"
                >
                  <Plus size={18} />
                </button>
                <button 
                  onClick={() => setShowHeatmap(true)}
                  className="text-gs-slate hover:text-gs-gold transition-colors p-1"
                  title="View Heatmap"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
            
            {/* Asset Type Split Indicator */}
            <div className="mb-6 bg-gs-light/30 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between text-[10px] font-bold text-gs-slate uppercase tracking-widest mb-2">
                <span>Stocks ({displayPortfolio.stockSplit.toFixed(2)}%)</span>
                <span>Mutual Funds ({displayPortfolio.mfSplit.toFixed(2)}%)</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-gs-navy transition-all duration-1000" 
                  style={{ width: `${displayPortfolio.stockSplit}%` }}
                ></div>
                <div 
                  className="h-full bg-gs-gold transition-all duration-1000" 
                  style={{ width: `${displayPortfolio.mfSplit}%` }}
                ></div>
              </div>
            </div>

            <p className="text-xs text-gs-slate mb-3 italic">Click an asset to view historical performance and AI analysis.</p>
            <div className="max-h-60 overflow-y-auto pr-2">
              {displayPortfolio.allocation.length > 0 ? (
                displayPortfolio.allocation.map((asset, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      if (asset.ticker) {
                        setActivePopupAsset({ ticker: asset.ticker, name: asset.name });
                      }
                    }}
                    className="w-full text-left flex justify-between items-center p-3 rounded-lg transition-colors mb-2 bg-gs-light/50 hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-gray-200 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: asset.color }}></div>
                        <div className="flex flex-col items-start">
                          <span className="text-gs-slate font-medium text-sm group-hover:text-gs-navy transition-colors">{asset.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-medium">{asset.shares} shares</span>
                            {asset.dayChange !== undefined && (
                              <span className={`text-[10px] font-bold ${asset.dayChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {asset.dayChange >= 0 ? '+' : ''}${Math.abs(asset.dollarChange || 0).toFixed(2)} ({asset.dayChange >= 0 ? '▲' : '▼'} {Math.abs(asset.dayChange).toFixed(2)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-gs-navy text-sm ml-4">{asset.value.toFixed(2)}%</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12 bg-gs-light/20 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gs-slate text-sm font-light mb-6 italic">Your portfolio is currently empty.</p>
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gs-navy text-white rounded-xl hover:bg-gs-gold hover:text-gs-navy transition-all shadow-lg font-bold"
                  >
                    <Plus size={18} />
                    Build Your Portfolio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Investment & Retirement Planning Section */}
        <FinancialCalculators />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column: Indicators */}
          <div className="lg:col-span-2 space-y-8">
            <Indicators portfolio={displayPortfolio} />
            <FeeTransparencyModule portfolio={displayPortfolio} />
          </div>

          {/* Right Column: Rebalancing Engine */}
          <div className="space-y-8">
            <RebalancingEngine onScenarioSelect={handleRebalance} />
          </div>
        </div>

        {/* Bottom Section: MacroTracker */}
        <MacroTracker />
      </div>

      <TransparencyModal 
        isOpen={!!modalData} 
        onClose={closeModal} 
        data={modalData} 
        currentPortfolio={displayPortfolio}
        totalValue={totals.rawValue}
        prices={prices}
      />
      
      <StockPopup 
        ticker={activePopupAsset?.ticker} 
        assetName={activePopupAsset?.name} 
        onClose={closeStockPopup} 
      />
      
      <AnimatePresence>
        {showHeatmap && (
          <PortfolioHeatmap 
            onClose={() => setShowHeatmap(false)} 
            allocation={displayPortfolio.allocation} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <StockSearch 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
            onAddStock={handleAddStock} 
            currentPortfolio={displayPortfolio}
            totalValue={totals.value}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
