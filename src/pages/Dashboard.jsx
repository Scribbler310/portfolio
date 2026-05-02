import React, { useState, useMemo } from 'react';
import { mockPortfolios } from '../data/mockData';
import { tickerMetrics } from '../data/tickerMetrics';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Indicators from '../components/Indicators';
import FeeTransparencyModule from '../components/FeeTransparencyModule';
import RebalancingEngine from '../components/RebalancingEngine';
import TransparencyModal from '../components/TransparencyModal';
import MacroTracker from '../components/MacroTracker';
import StockPopup from '../components/StockPopup';

export default function Dashboard({ riskProfile }) {
  const initialPortfolio = mockPortfolios[riskProfile];
  const [currentPortfolio, setCurrentPortfolio] = useState(initialPortfolio);
  const [modalData, setModalData] = useState(null);
  
  // State for the new stock popup
  const [activePopupAsset, setActivePopupAsset] = useState(null);

  // Dynamic Calculation of Health and Risk based on real metrics
  const calculatedMetrics = useMemo(() => {
    let totalBeta = 0;
    let totalExpense = 0;
    const numAssets = currentPortfolio.allocation.length;

    currentPortfolio.allocation.forEach(asset => {
      const metrics = tickerMetrics[asset.ticker] || { beta: 1, expenseRatio: 0.1 };
      const weight = asset.value / 100;
      totalBeta += (metrics.beta || 1) * weight;
      totalExpense += (metrics.expenseRatio || 0.1) * weight;
    });

    // Determine Risk Level
    let riskLevel = 'Medium';
    if (totalBeta < 0.6) riskLevel = 'Low';
    else if (totalBeta > 1.2) riskLevel = 'High';

    // Determine Health Score (Base 100)
    let healthScore = 100;
    
    // Penalty for high fees
    healthScore -= Math.min(totalExpense * 100 * 2, 20);
    
    // Bonus for diversification (number of assets)
    if (numAssets >= 5) healthScore += 5;
    
    // Penalty if risk doesn't match profile
    const profileMap = { 'Cautious': 'Low', 'Balanced': 'Medium', 'Bold': 'High' };
    if (riskLevel !== profileMap[riskProfile]) {
      healthScore -= 15;
    }

    // Clamp score
    healthScore = Math.min(Math.max(Math.round(healthScore), 0), 100);

    return { healthScore, riskLevel, avgBeta: totalBeta.toFixed(2) };
  }, [currentPortfolio, riskProfile]);

  // Merge static portfolio data with calculated metrics
  const displayPortfolio = {
    ...currentPortfolio,
    healthScore: calculatedMetrics.healthScore,
    riskLevel: calculatedMetrics.riskLevel
  };

  const handleRebalance = (scenario) => {
    setModalData(scenario);
  };

  const closeModal = () => setModalData(null);
  const closeStockPopup = () => setActivePopupAsset(null);

  return (
    <div className="min-h-screen bg-gs-light p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-gs-navy mb-2">
              Your <span className="font-semibold">{riskProfile}</span> Portfolio
            </h1>
            <p className="text-gs-slate text-lg font-light">
              Built for your goals. Transparently managed.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs text-gs-slate uppercase tracking-widest block mb-1">Portfolio Beta</span>
            <span className="text-xl font-medium text-gs-navy">{calculatedMetrics.avgBeta}</span>
          </div>
        </header>

        {/* Top Section: Allocation (Moved to Top as requested) */}
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
                  stroke="none"
                >
                  {displayPortfolio.allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Allocation']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-xl font-medium text-gs-navy mb-4">Current Allocation</h3>
            <p className="text-xs text-gs-slate mb-3 italic">Click an asset to view historical performance and AI analysis.</p>
            <div className="max-h-60 overflow-y-auto pr-2">
              {displayPortfolio.allocation.map((asset, idx) => (
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
                        <span className="text-xs text-gray-400 mt-0.5">{asset.shares} shares • Bought {asset.dateBought}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gs-navy text-sm ml-4">{asset.value}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Next Section: MacroTracker */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column: Indicators */}
          <div className="lg:col-span-2 space-y-8">
            <Indicators portfolio={displayPortfolio} />
            <FeeTransparencyModule portfolio={displayPortfolio} />
          </div>

          {/* Right Column: Rebalancing Engine */}
          <div className="space-y-8">
            {/* InvestmentCommittee removed from here, now inside StockPopup */}
            <RebalancingEngine onScenarioSelect={handleRebalance} />
          </div>
        </div>

        {/* Bottom Section: MacroTracker */}
        <MacroTracker />
      </div>

      <TransparencyModal isOpen={!!modalData} onClose={closeModal} data={modalData} />
      
      {/* The new interactive Stock Popup */}
      <StockPopup 
        ticker={activePopupAsset?.ticker} 
        assetName={activePopupAsset?.name} 
        onClose={closeStockPopup} 
      />
    </div>
  );
}
