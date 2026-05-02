import React, { useState } from 'react';
import { Activity, ShieldAlert, Info, X, PieChart, DollarSign, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Indicators({ portfolio }) {
  const [activeInfo, setActiveInfo] = useState(null); // 'health' or 'risk'

  // A simple gauge visualization using SVG
  const dashArray = 283; // 2 * pi * r (r=45)
  const dashOffset = dashArray - (dashArray * portfolio.healthScore) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      {/* Portfolio Health Score */}
      <div 
        onClick={() => setActiveInfo('health')}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-gs-gold transition-all group"
      >
        <div>
          <h3 className="text-sm text-gs-slate uppercase tracking-wider mb-1 font-medium flex items-center">
            <Activity size={16} className="mr-2 text-gs-gold" /> Health Score
          </h3>
          <p className="text-3xl font-light text-gs-navy">
            {portfolio.healthScore} <span className="text-base text-gray-400">/ 100</span>
          </p>
          <p className="text-sm text-gray-500 mt-2 font-light flex items-center group-hover:text-gs-gold transition-colors">
            <Info size={14} className="mr-1" /> Click to see how this is calculated
          </p>
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
      <div 
        onClick={() => setActiveInfo('risk')}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer hover:border-gs-gold transition-all group"
      >
        <h3 className="text-sm text-gs-slate uppercase tracking-wider mb-4 font-medium flex items-center">
          <ShieldAlert size={16} className="mr-2 text-gs-gold" /> Risk Level
        </h3>
        <div className="flex w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full ${portfolio.riskLevel === 'Low' ? 'bg-gs-navy w-1/3' : portfolio.riskLevel === 'Medium' ? 'bg-gs-gold w-2/3' : 'bg-red-500 w-full'} transition-all duration-500`}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 font-medium uppercase mb-2">
          <span className={portfolio.riskLevel === 'Low' ? 'text-gs-navy font-bold' : ''}>Low</span>
          <span className={portfolio.riskLevel === 'Medium' ? 'text-gs-gold font-bold' : ''}>Medium</span>
          <span className={portfolio.riskLevel === 'High' ? 'text-red-500 font-bold' : ''}>High</span>
        </div>
        <p className="text-xs text-gray-400 font-light flex items-center group-hover:text-gs-gold transition-colors">
          <Info size={12} className="mr-1" /> How we measure risk
        </p>
      </div>

      {/* Calculation Modal */}
      <AnimatePresence>
        {activeInfo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInfo(null)}
              className="absolute inset-0 bg-gs-navy/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-gs-light rounded-xl mr-4 text-gs-gold">
                      {activeInfo === 'health' ? <Activity size={24} /> : <ShieldAlert size={24} />}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gs-navy">
                        {activeInfo === 'health' ? 'Health Score Logic' : 'Risk Calculation'}
                      </h4>
                      <p className="text-sm text-gs-slate font-light">Radical Transparency Report</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveInfo(null)} className="text-gray-400 hover:text-gs-navy transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {activeInfo === 'health' ? (
                    <>
                      <div className="flex gap-4">
                        <div className="mt-1 text-gs-gold"><DollarSign size={18} /></div>
                        <div>
                          <p className="font-medium text-gs-navy text-sm">Fee Efficiency</p>
                          <p className="text-xs text-gs-slate font-light leading-relaxed">We subtract points for high expense ratios. Every 0.1% in fees costs your portfolio health (Max -20 pts).</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="mt-1 text-gs-gold"><PieChart size={18} /></div>
                        <div>
                          <p className="font-medium text-gs-navy text-sm">Diversification Bonus</p>
                          <p className="text-xs text-gs-slate font-light leading-relaxed">Holding 5+ different asset classes grants a +5 point bonus for reduced concentration risk.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="mt-1 text-gs-gold"><Target size={18} /></div>
                        <div>
                          <p className="font-medium text-gs-navy text-sm">Profile Alignment</p>
                          <p className="text-xs text-gs-slate font-light leading-relaxed">If your portfolio's actual volatility doesn't match your goal (e.g. Cautious vs Balanced), we subtract 15 points.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gs-light p-5 rounded-2xl border border-gs-gold/20">
                      <p className="text-sm text-gs-navy font-medium mb-2">Market Sensitivity Logic</p>
                      <p className="text-xs text-gs-slate font-light leading-relaxed mb-4">
                        Risk isn't a guess. We measure how much your portfolio typically swings compared to the broader market to categorize your risk level.
                      </p>
                      
                      <div className="bg-white/80 p-3 rounded-xl border border-gs-gold/10 mb-4 flex justify-between items-center shadow-sm">
                        <span className="text-[10px] uppercase tracking-widest text-gs-slate font-bold">Portfolio Beta</span>
                        <span className="text-xl font-bold text-gs-navy">{portfolio.avgBeta}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase tracking-wider text-gs-slate font-bold">
                          <span>Low Risk</span>
                          <span className="text-gs-navy">Minimal Volatility</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-wider text-gs-slate font-bold">
                          <span>Medium Risk</span>
                          <span className="text-gs-gold">Market Standard</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-wider text-gs-slate font-bold">
                          <span>High Risk</span>
                          <span className="text-red-500">Aggressive Growth</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setActiveInfo(null)}
                  className="w-full mt-8 bg-gs-navy text-white py-4 rounded-xl font-medium hover:bg-gs-navy/90 transition-colors shadow-md"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
