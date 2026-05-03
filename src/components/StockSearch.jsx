import React, { useState } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';

export default function StockSearch({ onAddStock }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    
    try {
      const proxy = 'https://corsproxy.io/?';
      // Use Yahoo Search suggestions or Chart to validate
      const url = `${proxy}https://query1.finance.yahoo.com/v8/finance/chart/${query.toUpperCase()}?interval=1d&range=1d`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.chart?.result?.[0]) {
        const symbol = data.chart.result[0].meta.symbol;
        const currency = data.chart.result[0].meta.currency;
        
        onAddStock({
          ticker: symbol,
          name: `${symbol} (${currency})`,
          value: 5, // Default allocation
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
          shares: 1,
          dateBought: new Date().toISOString().split('T')[0]
        });
        setQuery('');
      } else {
        setError('Ticker not found');
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Ticker (e.g. TSLA, BTC-USD)"
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-gs-gold/50 focus:border-gs-gold transition-all shadow-sm group-hover:shadow-md"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gs-gold transition-colors" size={18} />
        <button 
          type="submit"
          disabled={loading || !query}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gs-navy text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-gs-navy/90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add Asset
        </button>
      </form>
      {error && <p className="text-red-500 text-[10px] mt-2 ml-4 animate-pulse">{error}</p>}
    </div>
  );
}
