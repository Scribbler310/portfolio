import React, { useEffect, useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getHistoricalData, fetchRealData } from '../data/historicalData';
import { Loader2 } from 'lucide-react';
import InvestmentCommittee from './InvestmentCommittee';

const TIMEFRAME_DAYS = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  'ALL': 365
};

export default function StockPopup({ ticker, assetName, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [timeframe, setTimeframe] = useState('1M');

  useEffect(() => {
    async function loadData() {
      if (ticker) {
        setLoading(true);
        const realData = await fetchRealData(ticker);
        setData(realData);
        setLoading(false);
        setIsDebating(false);
      }
    }
    loadData();
  }, [ticker]);

  const viewData = useMemo(() => {
    if (!data) return null;
    
    // Slice history based on timeframe
    const daysToShow = TIMEFRAME_DAYS[timeframe] || 30;
    const startIndex = Math.max(0, data.history.length - daysToShow);
    const slicedHistory = data.history.slice(startIndex);
    
    // Recalculate metrics for the specific timeframe
    if (slicedHistory.length === 0) return null;
    
    const currentPrice = slicedHistory[slicedHistory.length - 1].price;
    const oldPrice = slicedHistory[0].price;
    const change = Number((currentPrice - oldPrice).toFixed(2));
    const percentChange = Number(((change / oldPrice) * 100).toFixed(2));
    const isPositive = change >= 0;
    
    return {
      ...data,
      history: slicedHistory,
      change,
      percentChange,
      isPositive
    };
  }, [data, timeframe]);

  if (!ticker) return null;

  if (loading || !viewData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="text-center">
          <Loader2 className="animate-spin text-gs-gold mb-4 mx-auto" size={48} />
          <p className="text-white text-lg font-light">Connecting to Yahoo Finance...</p>
        </div>
      </div>
    );
  }

  const color = viewData.isPositive ? '#00C805' : '#FF5000';
  const bgColor = '#111111'; // Dark theme background

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-start sticky top-0 bg-[#111111] z-10 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              {assetName} <Star size={18} className="ml-3 text-gray-500 hover:text-yellow-400 cursor-pointer" />
            </h2>
            <div className="flex items-end mt-2 space-x-3">
              <span className="text-4xl font-bold text-white">${viewData.currentPrice}</span>
              <div className={`flex items-center text-lg font-medium pb-1 ${viewData.isPositive ? 'text-[#00C805]' : 'text-[#FF5000]'}`}>
                {viewData.isPositive ? '+' : ''}{viewData.change} ({viewData.isPositive ? '+' : ''}{viewData.percentChange}%)
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-1">At close: {viewData.history[viewData.history.length-1].date}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewData.history} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#888' }}
                  />
                  <ReferenceLine y={viewData.history[0].price} stroke="#333" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={color} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Time Controls */}
            <div className="flex space-x-4 mt-6 border-b border-gray-800 pb-2">
              {['1W', '1M', '3M', '1Y', 'ALL'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setTimeframe(t)}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    t === timeframe 
                      ? (viewData.isPositive ? 'text-[#00C805] border-[#00C805]' : 'text-[#FF5000] border-[#FF5000]') 
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-6 text-gray-300 text-sm leading-relaxed">
              <p>Historical charting for {assetName} over the selected period. Notice the volatility patterns represented by the area chart.</p>
            </div>
          </div>

          {/* Right Sidebar: AI Committee */}
          <div className="lg:col-span-1">
            {/* We render the Investment Committee inside a styled container so it fits the dark theme or stands out as a module */}
            <div className="bg-white rounded-xl shadow-inner overflow-hidden border border-gray-200">
               <InvestmentCommittee 
                ticker={ticker}
                isDebating={isDebating}
                setIsDebating={setIsDebating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
