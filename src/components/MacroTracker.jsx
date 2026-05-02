import React, { useState, useEffect } from 'react';
import { Globe, Ship, AlertTriangle, ShieldCheck, Loader2, X } from 'lucide-react';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const newsHeadlines = [
  { source: 'Right-Leaning', headline: 'Supply Chain Bottlenecks Expose Dependence on Foreign Imports', sentiment: 'negative' },
  { source: 'Left-Leaning', headline: 'Global Trade Disruptions Threaten Consumer Price Stability', sentiment: 'negative' },
  { source: 'Financial Times', headline: 'Port Congestion Peaks as Holiday Inventory Arrives Early', sentiment: 'neutral' }
];

// Fallback data in case the ArcGIS API fails due to CORS or downtime
const mockPortData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  calls: Math.floor(12000 + Math.random() * 3000 + (i > 20 ? -2000 : 0)) // Simulating a recent dip
}));

export default function MacroTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchPortWatchData = async () => {
      try {
        const apiUrl = "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/Daily_Trade_Data/FeatureServer/0/query?where=1=1&outFields=date,calls&orderByFields=date DESC&resultRecordCount=30&f=json";
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (data && data.features && data.features.length > 0) {
          const parsedData = data.features.map(f => ({
            date: new Date(f.attributes.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            calls: f.attributes.calls || 0
          })).reverse();
          setChartData(parsedData);
          setIsLive(true);
        } else {
          throw new Error('No features returned');
        }
      } catch (error) {
        console.warn("Failed to fetch live ArcGIS data. Falling back to mock dataset.", error);
        setChartData(mockPortData);
        setIsLive(false);
      }
    };
    fetchPortWatchData();
  }, []);

  const synthesizeNews = async () => {
    setLoading(true);
    setAnalysis(null);
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey && apiKey.length > 10) {
      try {
        const llm = new ChatGoogleGenerativeAI({
          apiKey: apiKey,
          modelName: 'gemini-1.5-flash',
          maxOutputTokens: 2048,
        });

        const recentDataSummary = chartData.slice(-5).map(d => `${d.date}: ${d.calls} calls`).join(", ");

        const promptText = `
          You are an expert, calming financial advisor speaking to a novice investor. 
          The user is looking at a custom dashboard of global maritime trade data (port calls). 
          Here is the raw data for the last 5 days indicating recent activity levels: [${recentDataSummary}].
          
          Additionally, read these recent news headlines causing panic:
          1. ${newsHeadlines[0].headline}
          2. ${newsHeadlines[1].headline}
          3. ${newsHeadlines[2].headline}
          
          Provide a grounded, jargon-free explanation (max 3-4 sentences) that synthesizes this numerical data and the news. 
          Explain why this data represents normal market noise and why they should not panic sell their portfolio.
        `;

        const message = new HumanMessage({
          content: [{ type: "text", text: promptText }]
        });

        const response = await llm.invoke([message]);
        setAnalysis(response.content);
        setLoading(false);
      } catch (error) {
        console.error("Gemini Error:", error);
        runMockAnalysis();
      }
    } else {
      runMockAnalysis();
    }
  };

  const runMockAnalysis = () => {
    setTimeout(() => {
      setAnalysis("While the news highlights supply chain bottlenecks, the port data shows that daily ship calls remain within normal seasonal ranges, despite a slight recent dip. This indicates that global trade is still flowing actively. Temporary disruptions and the resulting inflation spikes rarely derail a well-diversified, long-term portfolio. Stay the course and avoid making emotional decisions based on short-term headlines.");
      setLoading(false);
    }, 2000);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!analysis) {
      synthesizeNews();
    }
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="w-full mt-8 py-4 bg-gs-navy text-white rounded-xl hover:bg-gs-navy/90 transition-all flex justify-center items-center font-medium shadow-md group"
      >
        <Globe className="mr-3 text-gs-gold group-hover:rotate-12 transition-transform" size={24} />
        Generate Ground Truth (Global Uncertainty Tracker)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gs-navy p-6 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-medium flex items-center">
                  <Globe className="mr-2 text-gs-gold" size={20} /> Global Uncertainty Tracker
                </h2>
                <p className="text-sm text-gs-light/70 font-light mt-1">
                  Contextualizing geopolitical noise with real-world data to keep you grounded.
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left: Custom Port Data Chart */}
                <div className="flex flex-col">
                  <h3 className="text-sm text-gs-slate uppercase tracking-wider font-medium mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Ship size={16} className="mr-2 text-blue-500" /> Global Port Activity
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {isLive ? 'LIVE IMF DATA' : 'MOCK DATA FALLBACK'}
                    </span>
                  </h3>
                  <div className="rounded-xl border border-gray-200 p-4 h-64 w-full bg-gray-50/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1E293B" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={30} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
                        />
                        <Area type="monotone" dataKey="calls" stroke="#1E293B" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-gs-slate mt-2 italic">Daily maritime trade volume index based on global port calls.</p>
                </div>

                {/* Right: News */}
                <div className="flex flex-col">
                  <h3 className="text-sm text-gs-slate uppercase tracking-wider font-medium mb-3 flex items-center">
                    <AlertTriangle size={16} className="mr-2 text-red-500" /> The News Cycle
                  </h3>
                  <div className="space-y-3 mb-6 flex-grow">
                    {newsHeadlines.map((news, idx) => (
                      <div key={idx} className="bg-gray-50 border-l-2 border-gs-gold p-3 rounded-r-lg text-sm">
                        <span className="text-xs font-semibold text-gs-slate mb-1 block uppercase tracking-wide">{news.source}</span>
                        <span className="text-gs-navy font-medium italic">"{news.headline}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Output */}
              <div className="bg-gs-light p-6 rounded-xl border border-gray-200">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 rounded-full bg-gs-navy flex items-center justify-center text-gs-gold">
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gs-navy mb-1">
                      {loading ? 'Synthesizing Ground Truth...' : 'Grounded Analysis'}
                    </h4>
                    {analysis ? (
                       <p className="text-gs-slate leading-relaxed font-light">{analysis}</p>
                    ) : (
                       <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
