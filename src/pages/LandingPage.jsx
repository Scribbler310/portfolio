import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, Zap } from 'lucide-react';

const questions = [
  {
    id: 1,
    text: "What are you saving for?",
    options: [
      { label: "A major purchase soon (house, car)", score: 1 },
      { label: "General wealth building", score: 2 },
      { label: "Retirement (20+ years away)", score: 3 }
    ]
  },
  {
    id: 2,
    text: "How do you feel about sudden market drops?",
    options: [
      { label: "I'd panic and want to sell", score: 1 },
      { label: "I'd be concerned but hold on", score: 2 },
      { label: "I'd see it as a buying opportunity", score: 3 }
    ]
  },
  {
    id: 3,
    text: "What is your primary investment goal?",
    options: [
      { label: "Protect my money from losing value", score: 1 },
      { label: "Steady, moderate growth over time", score: 2 },
      { label: "Maximum growth, regardless of ups and downs", score: 3 }
    ]
  }
];

export default function LandingPage({ setRiskProfile }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const navigate = useNavigate();

  const handleOptionSelect = (score) => {
    setTotalScore(prev => prev + score);
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      determineProfile(totalScore + score);
    }
  };

  const determineProfile = (finalScore) => {
    let profile = 'Balanced';
    if (finalScore <= 4) profile = 'Cautious';
    if (finalScore >= 8) profile = 'Bold';
    
    setRiskProfile(profile);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gs-navy flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gs-gold/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]"></div>

      <div className="z-10 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
          Wealth management, <span className="text-gs-gold font-normal">simplified.</span>
        </h1>
        <p className="text-gs-light/70 text-lg md:text-xl max-w-xl mx-auto font-light">
          No jargon. No hidden fees. Just clear strategies tailored to your goals. Let's find out what kind of investor you are.
        </p>
      </div>

      <div className="z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="flex justify-between mb-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="flex-1 flex items-center">
              <div className={`h-2 w-full rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-gs-gold' : 'bg-white/20'}`}></div>
              {idx < questions.length - 1 && <div className="w-4"></div>}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl text-white font-medium mb-6 text-center">
              {questions[currentStep].text}
            </h2>
            <div className="space-y-4">
              {questions[currentStep].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option.score)}
                  className="w-full text-left px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-gs-gold/20 hover:border-gs-gold/50 transition-all duration-300 text-white font-light flex items-center group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 group-hover:bg-gs-gold/30 group-hover:text-gs-gold transition-colors">
                    {idx === 0 && <ShieldCheck size={18} />}
                    {idx === 1 && <TrendingUp size={18} />}
                    {idx === 2 && <Zap size={18} />}
                  </div>
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
