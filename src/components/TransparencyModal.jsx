import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, DollarSign, Shield } from 'lucide-react';

export default function TransparencyModal({ isOpen, onClose, data, currentPortfolio, totalValue, prices }) {
  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gs-navy/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col"
        >
          {/* Header (Fixed at top) */}
          <div className="bg-gs-navy p-6 flex justify-between items-start text-white shrink-0">
            <div>
              <span className="text-gs-gold text-xs font-semibold uppercase tracking-wider mb-2 block">Recommendation</span>
              <h2 className="text-2xl font-light">{data.title}</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
            {/* The Advice */}
            <div className="bg-gs-light p-5 rounded-xl border-l-4 border-gs-gold">
              <h3 className="font-medium text-gs-navy mb-1 flex items-center">
                <Info size={18} className="mr-2 text-gs-gold" /> The Action Plan
              </h3>
              <p className="text-gs-slate font-light text-lg">
                {(() => {
                  let advice = data.advice;
                  const hasBonds = currentPortfolio?.allocation?.some(a => 
                    a.ticker?.includes('BND') || 
                    a.name?.toLowerCase().includes('bond')
                  );
                  if (!hasBonds && advice.includes('Bonds')) {
                    advice = advice.replace('Bonds', 'Cash Reserves');
                  }
                  return advice;
                })()}
              </p>
            </div>

            {/* Visual Comparison Section */}
            <div className="bg-gs-light/50 p-6 rounded-2xl border border-gray-100 min-h-[100px] flex flex-col justify-center">
              <h3 className="text-xs uppercase tracking-widest text-gs-slate font-semibold mb-4">
                Visual Rebalance Suggestion
              </h3>
              
              <div className="space-y-6">
                {currentPortfolio?.allocation?.length > 0 ? (
                  currentPortfolio.allocation.slice(0, 3).map((asset, idx) => {
                    if (!asset) return null;
                    
                    // Mock logic for "Target" based on scenario
                    let change = 0;
                    const trigger = data.trigger || "";
                    const assetName = asset.name || "";

                    if (trigger.includes("Market Drop")) {
                      if (assetName.includes("Bond") || assetName.includes("Cash")) change = -5;
                      else change = 5;
                    } else if (trigger.includes("Life Expense")) {
                      if (assetName.includes("Cash")) change = 20;
                      else change = -10;
                    } else if (trigger.includes("Inflation")) {
                      if (assetName.includes("Vanguard") || assetName.includes("Value")) change = 8;
                      else change = -4;
                    }

                    const val = Number(asset.value) || 0;
                    const targetValue = Math.max(0, Math.min(100, val + change));
                    
                    // Calculate Dollar and Share Changes
                    const ticker = asset.ticker;
                    const priceObj = prices[ticker];
                    const price = priceObj?.price;
                    
                    // Use a fallback total value if current calculation is still in flight
                    const activeTotal = totalValue > 0 ? totalValue : 50000; 
                    
                    const currentValue = (val / 100) * activeTotal;
                    const targetValueDollar = (targetValue / 100) * activeTotal;
                    const dollarDiff = targetValueDollar - currentValue;
                    const sharesDiff = price ? Math.abs(Math.round(dollarDiff / price)) : null;
                    
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-gs-navy">{ticker}</span>
                          <div className="text-right">
                            <span className="text-gs-slate">
                              {val.toFixed(2)}% <span className="mx-2">→</span> 
                              <span className={change > 0 ? 'text-green-600' : change < 0 ? 'text-red-500' : 'text-gs-navy'}>
                                {targetValue.toFixed(2)}%
                              </span>
                            </span>
                            <p className={`text-[10px] font-bold ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {change > 0 ? 'Buy' : 'Sell'} ${Math.abs(Math.round(dollarDiff)).toLocaleString()} 
                              {sharesDiff !== null ? ` (${sharesDiff} shares)` : ' (Calculating...)'}
                            </p>
                          </div>
                        </div>
                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex relative">
                          <div 
                            className="h-full bg-gs-navy opacity-30" 
                            style={{ width: `${val}%` }}
                          ></div>
                          <div 
                            className={`h-full absolute top-0 left-0 transition-all duration-1000 ${change >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ width: `${targetValue}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-gs-slate italic">Add at least one stock to see a visual rebalance simulation.</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gs-slate mt-4 italic text-center">
                *Simulated shift based on your {currentPortfolio?.riskLevel || 'selected'} risk profile.
              </p>
            </div>

            {/* The Why */}
            <div>
              <h3 className="font-medium text-gs-navy mb-2 flex items-center">
                <Shield size={18} className="mr-2 text-gs-slate" /> Why we recommend this
              </h3>
              <p className="text-gs-slate font-light text-sm leading-relaxed">
                {data.explanation}
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* Radical Transparency Section */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gs-slate font-semibold mb-4">
                Full Transparency
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-white">
                  <span className="text-sm text-gs-slate font-light flex items-center">
                    <DollarSign size={14} className="mr-2 text-gray-400" /> Fee Impact
                  </span>
                  <span className="font-medium text-gs-navy text-sm">{data.feeImpactDollars}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-white">
                  <span className="text-sm text-gs-slate font-light flex items-center">
                    <Shield size={14} className="mr-2 text-gray-400" /> Tax Considerations
                  </span>
                  <span className="font-medium text-gs-navy text-sm">{data.taxImpact}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full mt-4 bg-gs-navy text-white py-4 rounded-xl font-medium hover:bg-gs-navy/90 transition-colors shadow-md shrink-0"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
