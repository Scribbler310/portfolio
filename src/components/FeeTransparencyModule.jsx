import React from 'react';
import { Search } from 'lucide-react';

export default function FeeTransparencyModule({ portfolio }) {
  const { hiddenFees } = portfolio;
  
  // Convert percentages to an illustrative dollar amount based on a $10,000 investment over 1 year
  const illustrativeInvestment = 10000;
  const expenseRatioCost = (illustrativeInvestment * (hiddenFees.expenseRatio / 100)).toFixed(2);
  const advisoryCost = (illustrativeInvestment * (hiddenFees.advisoryFee / 100)).toFixed(2);
  const totalCost = (parseFloat(expenseRatioCost) + parseFloat(advisoryCost) + hiddenFees.tradingCosts).toFixed(2);

  return (
    <div className="bg-gs-navy text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        <header className="mb-6 flex justify-between items-end border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-light mb-1 flex items-center">
              <Search className="mr-2 text-gs-gold" size={24} /> Radical Transparency
            </h2>
            <p className="text-white/60 text-sm font-light">What you actually pay per $10,000 invested yearly</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-gs-gold font-semibold block mb-1">Fee Rating</span>
            <span className="text-lg font-medium">{portfolio.feeImpact}</span>
          </div>
        </header>

        <div className="space-y-4 font-light text-sm">
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span className="text-white/80">Fund Expense Ratios ({hiddenFees.expenseRatio}%)</span>
            <span className="font-medium text-white">${expenseRatioCost}</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span className="text-white/80">Platform/Advisory Fee ({hiddenFees.advisoryFee}%)</span>
            <span className="font-medium text-white">${advisoryCost}</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span className="text-white/80">Estimated Trading Costs</span>
            <span className="font-medium text-white">${hiddenFees.tradingCosts.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="font-medium">Total Yearly Cost</span>
            <span className="text-xl font-medium text-gs-gold">${totalCost}</span>
          </div>
        </div>
        
        <p className="text-xs text-white/40 mt-6 italic">
          *Many traditional brokerages hide these numbers in dense prospectuses. We show them to you upfront so there are no surprises.
        </p>
      </div>
    </div>
  );
}
