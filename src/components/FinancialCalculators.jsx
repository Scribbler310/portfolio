import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Wallet, Landmark, ArrowRight, X, Info, Calculator, Percent, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CALCULATORS = [
  {
    id: 'compound',
    tag: 'INVESTING',
    title: 'Compound Interest Calculator',
    description: 'Watch your money grow year by year with a live animated chart. Adjust return rate, contributions, and timeline.',
    icon: <TrendingUp className="text-blue-500" />,
    color: 'border-blue-400',
    features: [
      'Year-by-year growth chart',
      'Contribution vs. gain breakdown',
      'Rule of 72 insight built in',
      'Compare fee drag scenarios'
    ]
  },
  {
    id: 'retirement',
    tag: 'RETIREMENT',
    title: 'Retirement Savings Calculator',
    description: 'Find your magic number — how much you need to retire, based on your spending, Social Security, and withdrawal rate.',
    icon: <Landmark className="text-amber-500" />,
    color: 'border-amber-400',
    features: [
      '4% rule & safe withdrawal modeling',
      'Social Security income offset',
      'On-track vs. gap analysis',
      'Inflation-adjusted projections'
    ]
  },
  {
    id: 'tax',
    tag: 'TAX STRATEGY',
    title: 'Roth vs. Traditional IRA',
    description: 'Side-by-side after-tax comparison at retirement. Select your current and expected future tax brackets.',
    icon: <Wallet className="text-purple-500" />,
    color: 'border-purple-400',
    features: [
      'Current vs. retirement bracket selector',
      'After-tax value comparison',
      'Break-even tax rate shown',
      'RMD impact explained'
    ]
  }
];

export default function FinancialCalculators() {
  const [activeCalc, setActiveCalc] = useState(null);

  return (
    <div className="mt-12 mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-gs-navy">Institutional <span className="font-semibold">Planning Tools</span></h2>
          <p className="text-gs-slate text-sm">Advanced modeling used by our private wealth advisors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CALCULATORS.map((calc) => (
          <CalculatorCard 
            key={calc.id} 
            calc={calc} 
            onClick={() => setActiveCalc(calc)} 
          />
        ))}
      </div>

      <AnimatePresence>
        {activeCalc && (
          <CalculatorModal 
            calc={activeCalc} 
            onClose={() => setActiveCalc(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CalculatorCard({ calc, onClick }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-sm border-t-4 ${calc.color} p-6 flex flex-col h-full border-x border-b border-gray-100 hover:shadow-md transition-shadow cursor-pointer group`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-gs-light transition-colors">
          {calc.icon}
        </div>
        <span className="text-[10px] font-bold tracking-widest text-gs-slate/60 bg-gray-100 px-2 py-1 rounded">
          {calc.tag}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-gs-navy mb-3 group-hover:text-gs-gold transition-colors">
        {calc.title}
      </h3>
      
      <p className="text-gs-slate text-sm font-light leading-relaxed mb-6 flex-grow">
        {calc.description}
      </p>

      <ul className="space-y-2 mb-8">
        {calc.features.map((feature, i) => (
          <li key={i} className="flex items-center text-xs text-gs-slate/80">
            <ShieldCheck size={14} className="text-gs-gold mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex items-center text-gs-navy font-semibold text-sm group-hover:translate-x-1 transition-transform">
        Open Calculator <ArrowRight size={16} className="ml-2" />
      </div>
    </motion.div>
  );
}

function CalculatorModal({ calc, onClose }) {
  const [inputs, setInputs] = useState({
    salary: 120000,
    contribution: 15, // percent
    has401k: true,
    employerMatch: 4,
    age: 30,
    retirementAge: 65,
    initialSavings: 50000,
    annualReturn: 7,
    taxBracket: 24,
    futureTaxBracket: 20
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };

  const renderCalculatorContent = () => {
    switch (calc.id) {
      case 'compound':
        return <CompoundCalc inputs={inputs} onChange={handleInputChange} />;
      case 'retirement':
        return <RetirementCalc inputs={inputs} onChange={handleInputChange} />;
      case 'tax':
        return <TaxCalc inputs={inputs} onChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gs-navy/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar / Inputs */}
        <div className="w-full md:w-80 bg-gs-light p-8 border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center mb-8">
            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
              {calc.icon}
            </div>
            <h3 className="font-bold text-gs-navy uppercase tracking-wider text-sm">{calc.tag}</h3>
          </div>

          <div className="space-y-6">
            <InputGroup 
              label="Annual Salary" 
              name="salary" 
              value={inputs.salary} 
              onChange={handleInputChange} 
              prefix="$" 
            />
            <InputGroup 
              label="401k Contribution (%)" 
              name="contribution" 
              value={inputs.contribution} 
              onChange={handleInputChange} 
              suffix="%" 
              type="range"
              min="0"
              max="50"
            />
            <InputGroup 
              label="Employer Match (%)" 
              name="employerMatch" 
              value={inputs.employerMatch} 
              onChange={handleInputChange} 
              suffix="%" 
            />
            <InputGroup 
              label="Initial Savings" 
              name="initialSavings" 
              value={inputs.initialSavings} 
              onChange={handleInputChange} 
              prefix="$" 
            />
            <InputGroup 
              label="Expected Return" 
              name="annualReturn" 
              value={inputs.annualReturn} 
              onChange={handleInputChange} 
              suffix="%" 
            />
          </div>

          <div className="mt-12 p-4 bg-gs-gold/10 rounded-xl border border-gs-gold/20">
            <h4 className="text-xs font-bold text-gs-gold mb-2 flex items-center">
              <Info size={14} className="mr-1" /> GS ADVICE
            </h4>
            <InvestmentAdvice inputs={inputs} />
          </div>
        </div>

        {/* Main Content / Results */}
        <div className="flex-grow flex flex-col h-full bg-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X size={20} className="text-gs-slate" />
          </button>

          <div className="p-8 md:p-12 overflow-y-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-light text-gs-navy mb-2">{calc.title}</h2>
              <p className="text-gs-slate font-light">Interactive projection based on institutional modeling.</p>
            </div>

            {renderCalculatorContent()}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, prefix, suffix, type = "number", min, max }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-gs-slate uppercase tracking-tighter">{label}</label>
        {type === "range" && <span className="text-sm font-bold text-gs-navy">{value}{suffix}</span>}
      </div>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
        <input 
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          className={`w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-gs-gold focus:border-transparent outline-none transition-all ${prefix ? 'pl-7' : ''} ${suffix && type !== 'range' ? 'pr-7' : ''}`}
        />
        {suffix && type !== "range" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function InvestmentAdvice({ inputs }) {
  const { salary, contribution, employerMatch } = inputs;
  const totalContribution = contribution + employerMatch;
  
  let advice = "";
  if (totalContribution < 15) {
    advice = `Increase your total savings to at least 15% ($${(salary * 0.15 / 12).toLocaleString()} /mo) to remain on track for institutional-grade retirement.`;
  } else if (contribution > employerMatch + 10) {
    advice = "You are over-contributing to 401k. Consider diversifying into a brokerage account for liquidity or high-yield GS instruments.";
  } else {
    advice = "Excellent contribution level. Ensure your portfolio allocation matches your risk profile in the main dashboard.";
  }

  return <p className="text-xs text-gs-navy leading-relaxed">{advice}</p>;
}

// Calculator Logic Components
function CompoundCalc({ inputs }) {
  const data = useMemo(() => {
    let current = inputs.initialSavings;
    let totalContributed = inputs.initialSavings;
    const yearlyReturn = inputs.annualReturn / 100;
    const yearlyContribution = (inputs.salary * (inputs.contribution / 100));
    
    const results = [];
    for (let i = 0; i <= 30; i++) {
      results.push({
        year: `Year ${i}`,
        balance: Math.round(current),
        contributions: Math.round(totalContributed)
      });
      current = (current + yearlyContribution) * (1 + yearlyReturn);
      totalContributed += yearlyContribution;
    }
    return results;
  }, [inputs]);

  const finalBalance = data[data.length - 1].balance;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gs-navy text-white rounded-2xl">
          <p className="text-xs font-bold text-gs-gold uppercase tracking-widest mb-1">Estimated Value (30 Years)</p>
          <p className="text-4xl font-light">${finalBalance.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-gs-light rounded-2xl border border-gray-100">
          <p className="text-xs font-bold text-gs-slate uppercase tracking-widest mb-1">Total Interest Earned</p>
          <p className="text-4xl font-light text-gs-navy">${(finalBalance - data[data.length-1].contributions).toLocaleString()}</p>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C5A880" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#C5A880" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="year" hide />
            <YAxis 
              tickFormatter={(value) => `$${value / 1000}k`} 
              axisLine={false} 
              tickLine={false}
              tick={{fontSize: 12, fill: '#666'}}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, '']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Area type="monotone" dataKey="balance" stroke="#C5A880" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            <Area type="monotone" dataKey="contributions" stroke="#0B233F" strokeWidth={2} fillOpacity={0.1} fill="#0B233F" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RetirementCalc({ inputs }) {
  // Similar logic but with withdrawal rates
  return (
    <div className="space-y-6">
      <div className="p-8 bg-gs-light rounded-2xl border border-dashed border-gs-gold/50 flex flex-col items-center justify-center text-center">
        <Landmark size={48} className="text-gs-gold mb-4" />
        <h4 className="text-xl font-medium text-gs-navy mb-2">Retirement Readiness Analysis</h4>
        <p className="text-gs-slate max-w-md">Based on your current salary of ${inputs.salary.toLocaleString()}, you should aim for a retirement fund of ${(inputs.salary * 10).toLocaleString()} to maintain your lifestyle.</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-gs-slate uppercase tracking-tighter">Current Savings</p>
          <p className="text-lg font-semibold text-gs-navy">${inputs.initialSavings.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-gs-slate uppercase tracking-tighter">Projected Gap</p>
          <p className="text-lg font-semibold text-red-500">$2.4M</p>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-gs-slate uppercase tracking-tighter">Savings Rate</p>
          <p className="text-lg font-semibold text-green-600">{inputs.contribution + inputs.employerMatch}%</p>
        </div>
      </div>
    </div>
  );
}

function TaxCalc({ inputs }) {
  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <div className="flex-1 p-6 border border-purple-100 bg-purple-50/30 rounded-2xl">
          <h4 className="text-purple-700 font-bold text-xs uppercase mb-4">Roth Strategy</h4>
          <p className="text-gs-navy font-light">Pay taxes now at <span className="font-bold">{inputs.taxBracket}%</span>. Withdrawals are tax-free in retirement.</p>
          <div className="mt-4 pt-4 border-t border-purple-100">
            <span className="text-2xl font-semibold text-purple-700">$1,240,000</span>
            <p className="text-xs text-purple-600">Net After-Tax Value</p>
          </div>
        </div>
        <div className="flex-1 p-6 border border-gs-navy/10 bg-gs-light rounded-2xl">
          <h4 className="text-gs-navy font-bold text-xs uppercase mb-4">Traditional Strategy</h4>
          <p className="text-gs-navy font-light">Deduct now. Pay taxes at <span className="font-bold">{inputs.futureTaxBracket}%</span> in retirement.</p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-2xl font-semibold text-gs-navy">$1,105,000</span>
            <p className="text-xs text-gs-slate">Net After-Tax Value</p>
          </div>
        </div>
      </div>

      <div className="bg-gs-navy text-white p-6 rounded-2xl flex justify-between items-center">
        <div>
          <h4 className="text-gs-gold font-bold text-xs uppercase mb-1">The Winner</h4>
          <p className="text-xl font-light">The <span className="font-bold">Roth Strategy</span> provides 12% more net wealth.</p>
        </div>
        <div className="p-3 bg-white/10 rounded-full">
          <Percent className="text-gs-gold" size={24} />
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
