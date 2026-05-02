import React from 'react';
import { rebalancingScenarios } from '../data/mockData';
import { TrendingDown, ArrowUpRight, HandCoins } from 'lucide-react';

export default function RebalancingEngine({ onScenarioSelect }) {
  const scenarios = [
    { id: 'marketDrop', icon: <TrendingDown size={20} />, data: rebalancingScenarios.marketDrop },
    { id: 'inflation', icon: <ArrowUpRight size={20} />, data: rebalancingScenarios.inflation },
    { id: 'withdrawal', icon: <HandCoins size={20} />, data: rebalancingScenarios.withdrawal },
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
      <header className="mb-8">
        <h2 className="text-2xl font-light text-gs-navy mb-2">Scenario Planner</h2>
        <p className="text-sm text-gs-slate font-light">
          Life happens. See how your portfolio should adapt to different situations.
        </p>
      </header>

      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onScenarioSelect(scenario.data)}
            className="w-full text-left p-5 rounded-xl border border-gray-200 hover:border-gs-gold hover:shadow-md transition-all duration-300 group bg-gs-light/50 hover:bg-white"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mr-4 text-gs-slate group-hover:text-gs-gold transition-colors">
                {scenario.icon}
              </div>
              <h3 className="font-medium text-gs-navy">{scenario.data.trigger}</h3>
            </div>
            <p className="text-sm text-gs-slate font-light ml-14 group-hover:text-gs-navy transition-colors">
              Click to see recommended actions
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
