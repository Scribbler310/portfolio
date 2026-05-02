import React from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

export default function Indicators({ portfolio }) {
  // A simple gauge visualization using SVG
  const dashArray = 283; // 2 * pi * r (r=45)
  const dashOffset = dashArray - (dashArray * portfolio.healthScore) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Portfolio Health Score */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gs-slate uppercase tracking-wider mb-1 font-medium flex items-center">
            <Activity size={16} className="mr-2 text-gs-gold" /> Health Score
          </h3>
          <p className="text-3xl font-light text-gs-navy">
            {portfolio.healthScore} <span className="text-base text-gray-400">/ 100</span>
          </p>
          <p className="text-sm text-gray-500 mt-2 font-light">Based on diversification & goals</p>
        </div>
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="45" fill="none" 
              stroke="#0B233F" strokeWidth="8" 
              strokeDasharray={dashArray} strokeDashoffset={dashOffset} 
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
        </div>
      </div>

      {/* Risk Meter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
        <h3 className="text-sm text-gs-slate uppercase tracking-wider mb-4 font-medium flex items-center">
          <ShieldAlert size={16} className="mr-2 text-gs-gold" /> Risk Level
        </h3>
        <div className="flex w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full ${portfolio.riskLevel === 'Low' ? 'bg-gs-navy w-1/3' : portfolio.riskLevel === 'Medium' ? 'bg-gs-gold w-2/3' : 'bg-red-500 w-full'} transition-all duration-500`}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 font-medium uppercase">
          <span className={portfolio.riskLevel === 'Low' ? 'text-gs-navy font-bold' : ''}>Low</span>
          <span className={portfolio.riskLevel === 'Medium' ? 'text-gs-gold font-bold' : ''}>Medium</span>
          <span className={portfolio.riskLevel === 'High' ? 'text-red-500 font-bold' : ''}>High</span>
        </div>
      </div>
    </div>
  );
}
