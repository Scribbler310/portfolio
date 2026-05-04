import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, BarChart2, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const agents = {
  macro: { name: 'Macro Economist', role: 'Analyzes broader economic trends, rates, and inflation', icon: <BarChart2 size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  tech: { name: 'Technical Analyst', role: 'Focuses on momentum, moving averages, and charts', icon: <User size={16} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  skeptic: { name: 'The Skeptic', role: 'Looks for flaws, overvaluation, and risks', icon: <AlertCircle size={16} />, color: 'text-red-500', bg: 'bg-red-500/10' },
  system: { name: 'System', role: 'Moderator', icon: <Users size={16} />, color: 'text-gs-gold', bg: 'bg-gs-gold/10' }
};

const mockDebates = {
  'AAPL': [
    { agent: 'macro', text: 'iPhone demand remains steady globally, but services growth is the real story for Apple.' },
    { agent: 'tech', text: 'AAPL is consolidating near its 200-day average. A breakout above current levels would be very bullish.' },
    { agent: 'skeptic', text: 'Regulatory pressure in the EU and US is a massive dark cloud that could hurt margins.' },
    { agent: 'system', text: 'Consensus: Strong ecosystem but legal risks. Conviction Score: 72/100 (Hold).' }
  ],
  'TSLA': [
    { agent: 'macro', text: 'High interest rates are cooling the EV market, forcing aggressive price cuts.' },
    { agent: 'tech', text: 'Tesla is in a clear downtrend. We need to see a higher low before turning bullish.' },
    { agent: 'skeptic', text: 'Elon is distracted and competition from China is fierce. Valuation is still disconnected from reality.' },
    { agent: 'system', text: 'Consensus: High volatility and macro headwinds. Conviction Score: 35/100 (Underweight).' }
  ],
  'NVDA': [
    { agent: 'macro', text: 'The AI infrastructure build-out is a once-in-a-generation shift that favors NVIDIA.' },
    { agent: 'tech', text: 'Parabolic move. It is overextended, but momentum like this can last longer than expected.' },
    { agent: 'skeptic', text: 'At some point, the hyperscalers will stop buying at this rate. The drop will be as fast as the rise.' },
    { agent: 'system', text: 'Consensus: Unrivaled leader in a booming sector. Conviction Score: 88/100 (Overweight).' }
  ],
  'MSFT': [
    { agent: 'macro', text: 'Enterprise software and cloud (Azure) are the backbone of the modern economy.' },
    { agent: 'tech', text: 'Steady uptrend. Microsoft is a "safe haven" in the tech world right now.' },
    { agent: 'skeptic', text: 'The Activision deal is done, but integrating it perfectly won\'t be easy or cheap.' },
    { agent: 'system', text: 'Consensus: Solid growth and AI tailwinds. Conviction Score: 82/100 (Overweight).' }
  ],
  'default': [
    { agent: 'macro', text: 'The macro outlook for [TICKER] is heavily dependent on current sector trends and inflationary pressures affecting production costs.' },
    { agent: 'tech', text: '[TICKER] is currently testing a key resistance level. We need to see sustained volume before confirming a new upward trajectory.' },
    { agent: 'skeptic', text: 'A primary concern for [TICKER] is the potential for margin compression if competitors maintain aggressive pricing strategies.' },
    { agent: 'system', text: 'Consensus: Position is stable for [TICKER], but suggests a cautious stance until quarterly data confirms growth. Conviction Score: 62/100 (Neutral).' }
  ]
};

export default function InvestmentCommittee({ ticker, isDebating, setIsDebating }) {
  const [messages, setMessages] = useState([]);
  const [convictionScore, setConvictionScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setConvictionScore(null);
    setIsDebating(false);
  }, [ticker]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const runDebate = async () => {
    if (!ticker) return;
    setIsDebating(true);
    setMessages([]);
    setConvictionScore(null);
    setLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey && apiKey.length > 10) {
      try {
        const llm = new ChatGoogleGenerativeAI({ 
          apiKey: apiKey, 
          modelName: 'gemini-1.5-flash',
          maxOutputTokens: 2048,
        });
        
        // Agent 1: Macro
        setMessages([{ agent: 'macro', text: `Quantifying macro factors for ${ticker}...` }]);
        const macroResponse = await llm.invoke([
          new SystemMessage(`You are a top-tier Macro Economist. Analyze the stock ${ticker} with extreme specificity. Mention a specific economic factor like "global logistics", "energy costs", or "labor markets" as it relates to this EXACT company. Provide a 12-month price target. 1 short sentence.`),
          new HumanMessage(`What is your unique macro view on ${ticker}?`)
        ]);
        setMessages([{ agent: 'macro', text: macroResponse.content }]);

        // Agent 2: Tech
        setMessages(prev => [...prev, { agent: 'tech', text: `Evaluating technical metrics for ${ticker}...` }]);
        const techResponse = await llm.invoke([
          new SystemMessage(`You are a Technical Analyst. Analyze ${ticker}'s price chart. Mention a specific "support zone", "RSI divergence", or "moving average cross" observation for this company. Provide a specific Fair Value. 1 sentence.`),
          new HumanMessage(`Provide a non-generic technical view on ${ticker}.`)
        ]);
        setMessages(prev => [prev[0], { agent: 'tech', text: techResponse.content }]);

        // Agent 3: Skeptic
        setMessages(prev => [...prev, { agent: 'skeptic', text: `Quantifying downside risks for ${ticker}...` }]);
        const skepticResponse = await llm.invoke([
          new SystemMessage(`You are a Professional Skeptic. Find a "poison pill" for ${ticker}. What is the one specific, non-obvious risk (e.g. patent cliff, specific litigation, supply chain bottleneck) for this stock? 1 sentence.`),
          new HumanMessage(`What is the hidden risk in ${ticker}?`)
        ]);
        setMessages(prev => [prev[0], prev[1], { agent: 'skeptic', text: skepticResponse.content }]);

        // System consensus
        setMessages(prev => [...prev, { agent: 'system', text: 'Synthesizing quantitative consensus...' }]);
        const consensusResponse = await llm.invoke([
          new SystemMessage("Committee Moderator. Based on the previous data points, output a final Conviction Score (0-100). Format: [SCORE] followed by a 1-sentence quantitative justification."),
          new HumanMessage(`Synthesize these quantitative views for ${ticker}: 1. ${macroResponse.content} 2. ${techResponse.content} 3. ${skepticResponse.content}`)
        ]);
        
        let score = parseInt(consensusResponse.content.replace(/\D/g,''));
        if (isNaN(score)) score = 50;
        
        setMessages(prev => [prev[0], prev[1], prev[2], { agent: 'system', text: consensusResponse.content }]);
        setConvictionScore(score);

      } catch (error) {
        console.error("LLM Error:", error);
        runMockDebate();
      }
    } else {
      runMockDebate();
    }
    
    setLoading(false);
  };

  const runMockDebate = () => {
    const script = mockDebates[ticker] || mockDebates['default'];
    const debateScript = script.map(msg => ({
      ...msg,
      text: msg.text.replace(/\[TICKER\]/g, ticker)
    }));

    let step = 0;
    const interval = setInterval(() => {
      if (step < debateScript.length) {
        const msg = debateScript[step];
        if (msg.agent === 'system' && msg.text.includes('Conviction Score')) {
          const match = msg.text.match(/(\d+)\/100/);
          if (match) setConvictionScore(parseInt(match[1]));
        }
        setMessages(prev => [...prev, msg]);
        step++;
      } else {
        clearInterval(interval);
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
      <header className="mb-4 flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-medium text-gs-navy flex items-center">
            <Users className="mr-2 text-gs-gold" size={20} /> AI Investment Committee
          </h2>
          <p className="text-sm text-gs-slate font-light mt-1">
            {ticker ? `Analyzing: ${ticker}` : 'Select an asset from your portfolio chart to debate.'}
          </p>
        </div>
        {ticker && !isDebating && !convictionScore && (
          <button 
            onClick={runDebate}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gs-navy text-white text-sm rounded-lg hover:bg-gs-navy/90 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <PlayCircle size={16} className="mr-2" />}
            Start Debate
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar" ref={scrollRef}>
        {!ticker && (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
            Waiting for asset selection...
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full ${agents[msg.agent].bg} ${agents[msg.agent].color} flex items-center justify-center`}>
                {agents[msg.agent].icon}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gs-slate border border-gray-100 w-full">
                <span className={`text-xs font-semibold uppercase tracking-wider block mb-1 ${agents[msg.agent].color}`}>
                  {agents[msg.agent].name}
                </span>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && messages.length > 0 && messages.length < 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-gray-400 text-sm ml-11">
            <Loader2 size={14} className="animate-spin mr-2" /> Typing...
          </motion.div>
        )}
      </div>

      {convictionScore !== null && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 pt-4 border-t"
        >
          <div className="bg-gs-light p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gs-navy">Consensus Conviction Score</span>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${convictionScore >= 70 ? 'text-green-600' : convictionScore >= 40 ? 'text-gs-gold' : 'text-red-500'}`}>
                  {convictionScore}
                </span>
                <span className="text-gray-400 ml-1">/ 100</span>
              </div>
            </div>
            <p className="text-[10px] text-gs-slate mt-2 italic leading-tight border-t border-gray-200 pt-2">
              The committee's confidence in this asset's current risk-to-reward. 
              <span className="font-bold ml-1">70+ Overweight</span>, 
              <span className="font-bold ml-1">40-69 Hold</span>, 
              <span className="font-bold ml-1">Below 40 Underweight</span>.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
