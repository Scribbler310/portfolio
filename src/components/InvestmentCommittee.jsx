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
    { agent: 'macro', text: 'People are still buying phones, but they aren\'t upgrading as often. This means slower growth, but the company remains highly stable.' },
    { agent: 'tech', text: 'The stock price is resting at a strong historical support level. If it holds here, it’s a good sign for long-term buyers.' },
    { agent: 'skeptic', text: 'They rely too much on hardware sales. However, their services (like App Store and Music) provide a strong, reliable safety net.' },
    { agent: 'system', text: 'Reason: Stable services income offsets slower hardware sales. It\'s a reliable hold. Conviction Score: 65/100 (Hold).' }
  ],
  'TSLA': [
    { agent: 'macro', text: 'Car loans are expensive right now, which makes it harder for people to buy new electric vehicles. This is a temporary headwind.' },
    { agent: 'tech', text: 'The stock has dropped recently. It’s best to wait until the price stops falling before buying more.' },
    { agent: 'skeptic', text: 'The company has had to cut prices, which hurts profits. The promise of robots is exciting, but car sales pay the bills today.' },
    { agent: 'system', text: 'Reason: High risk due to price cuts, but strong long-term potential. Conviction Score: 40/100 (Underweight).' }
  ],
  'default': [
    { agent: 'macro', text: 'This asset broadly tracks economic growth. We see a soft landing scenario which is generally supportive.' },
    { agent: 'tech', text: 'Trend is generally upward with normal pullbacks. Looks like a solid long-term hold.' },
    { agent: 'skeptic', text: 'While steady, don\'t expect massive alpha. Keep an eye on broad market valuations.' },
    { agent: 'system', text: 'Solid foundation, low risk. Conviction Score: 85/100 (Overweight).' }
  ]
};

export default function InvestmentCommittee({ ticker, isDebating, setIsDebating }) {
  const [messages, setMessages] = useState([]);
  const [convictionScore, setConvictionScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

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
      // Live LangChain AI Agents using Gemini
      try {
        const llm = new ChatGoogleGenerativeAI({ 
          apiKey: apiKey, 
          modelName: 'gemini-1.5-flash',
          maxOutputTokens: 2048,
        });
        
        // Agent 1: Macro
        setMessages([{ agent: 'macro', text: 'Analyzing macroeconomic environment...' }]);
        const macroResponse = await llm.invoke([
          new SystemMessage("You are a Macro Economist advising a beginner investor. Analyze the stock in 1 short, jargon-free sentence based on economic trends. Give a clear reason."),
          new HumanMessage(`Analyze ticker: ${ticker}`)
        ]);
        setMessages([{ agent: 'macro', text: macroResponse.content }]);

        // Agent 2: Tech
        setMessages(prev => [...prev, { agent: 'tech', text: 'Analyzing charts and momentum...' }]);
        const techResponse = await llm.invoke([
          new SystemMessage("You are a Technical Analyst advising a beginner investor. Provide a 1-sentence view on the stock's trend using simple language. Avoid terms like 'moving average' or 'support'. Give a clear reason."),
          new HumanMessage(`Analyze ticker: ${ticker}`)
        ]);
        setMessages(prev => [prev[0], { agent: 'tech', text: techResponse.content }]);

        // Agent 3: Skeptic
        setMessages(prev => [...prev, { agent: 'skeptic', text: 'Looking for risks and flaws...' }]);
        const skepticResponse = await llm.invoke([
          new SystemMessage("You are a Skeptic advising a beginner. Point out the biggest risk in 1 short, easy-to-understand sentence. Give a clear reason without causing panic."),
          new HumanMessage(`Analyze ticker: ${ticker}`)
        ]);
        setMessages(prev => [prev[0], prev[1], { agent: 'skeptic', text: skepticResponse.content }]);

        // System consensus
        setMessages(prev => [...prev, { agent: 'system', text: 'Calculating consensus...' }]);
        const consensusResponse = await llm.invoke([
          new SystemMessage("You are the Committee Moderator. Given the 3 previous opinions, output ONLY a number between 0 and 100 representing the final Conviction Score."),
          new HumanMessage(`Opinions: 1. ${macroResponse.content} 2. ${techResponse.content} 3. ${skepticResponse.content}`)
        ]);
        
        let score = parseInt(consensusResponse.content.replace(/\D/g,''));
        if (isNaN(score)) score = 50;
        
        setMessages(prev => [prev[0], prev[1], prev[2], { agent: 'system', text: `Debate concluded. Generating final metrics.` }]);
        setConvictionScore(score);

      } catch (error) {
        console.error("LLM Error:", error);
        runMockDebate();
      }
    } else {
      // Mock Fallback
      runMockDebate();
    }
    
    setLoading(false);
  };

  const runMockDebate = () => {
    const debateScript = mockDebates[ticker] || mockDebates['default'];
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
    }, 1500); // 1.5 seconds per message for realistic reading time
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
          <div className="flex justify-between items-center bg-gs-light p-4 rounded-xl">
            <span className="font-medium text-gs-navy">Consensus Conviction Score</span>
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${convictionScore >= 70 ? 'text-green-600' : convictionScore >= 40 ? 'text-gs-gold' : 'text-red-500'}`}>
                {convictionScore}
              </span>
              <span className="text-gray-400 ml-1">/ 100</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
