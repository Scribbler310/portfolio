import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { getHistoricalData } from '../data/historicalData';
import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';

const HeatmapContent = (props) => {
  const { x, y, width, height, name, performance } = props;
  
  if (width < 5 || height < 5) return null;

  const color = performance > 0 
    ? `rgba(0, 200, 5, ${Math.min(0.2 + Math.abs(performance) / 5, 0.9)})` 
    : `rgba(255, 80, 0, ${Math.min(0.2 + Math.abs(performance) / 5, 0.9)})`;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: '#fff',
          strokeWidth: 1,
          strokeOpacity: 0.2,
        }}
      />
      {width > 40 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 5}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 6, 12)}
          fontWeight="bold"
          className="pointer-events-none select-none"
        >
          {name}
        </text>
      )}
    </g>
  );
};

export default function PortfolioHeatmap({ onClose, allocation }) {
  const heatmapData = useMemo(() => {
    if (!allocation) return [];
    return allocation.map(asset => {
      try {
        const hist = getHistoricalData(asset.ticker);
        return {
          name: asset.ticker,
          size: asset.value || 1,
          performance: hist?.percentChange || 0,
          fullName: asset.name
        };
      } catch (e) {
        return {
          name: asset.ticker,
          size: asset.value || 1,
          performance: 0,
          fullName: asset.name
        };
      }
    });
  }, [allocation]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gs-navy/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#111111] rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              Portfolio Heatmap
              <span className="ml-3 px-2 py-1 bg-white/10 rounded text-[10px] uppercase tracking-widest text-white/60 font-medium">
                Live Analysis
              </span>
            </h2>
            <p className="text-gray-400 text-sm mt-1 font-light">
              Box size: Allocation % | Color: Daily Performance
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="h-[400px] md:h-[500px] w-full bg-black/40 rounded-2xl overflow-hidden border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={heatmapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                content={<HeatmapContent />}
              >
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#222] border border-white/10 p-4 rounded-xl shadow-2xl min-w-[180px]">
                          <p className="text-white font-bold text-base">{data.name}</p>
                          <p className="text-gray-400 text-[10px] mb-3 truncate max-w-[160px]">{data.fullName}</p>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <div className="text-left">
                              <span className="text-[9px] text-gray-500 uppercase block">Allocation</span>
                              <span className="text-white text-sm font-medium">{data.size}%</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-500 uppercase block">Day Change</span>
                              <span className={`text-sm font-bold ${data.performance > 0 ? 'text-[#00C805]' : 'text-[#FF5000]'}`}>
                                {data.performance > 0 ? '+' : ''}{data.performance}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FF5000] rounded-sm shadow-[0_0_10px_rgba(255,80,0,0.3)]"></div>
                <span className="text-[11px] text-gray-400 font-medium">Down</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#00C805] rounded-sm shadow-[0_0_10px_rgba(0,200,5,0.3)]"></div>
                <span className="text-[11px] text-gray-400 font-medium">Up</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
              <Info size={14} className="text-gs-gold" />
              <span className="text-[10px] uppercase tracking-wider font-medium">Color intensity scales with volatility</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
