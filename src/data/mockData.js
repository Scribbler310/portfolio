export const mockPortfolios = {
  Cautious: {
    allocation: [
      { name: 'Vanguard Total Bond (BND)', ticker: 'BND', value: 40, color: '#1E293B', shares: 145, dateBought: '2023-01-15', type: 'mf' },
      { name: 'Vanguard Intl Bond (BNDX)', ticker: 'BNDX', value: 20, color: '#334155', shares: 85, dateBought: '2023-03-22', type: 'mf' },
      { name: 'SPDR S&P 500 (SPY)', ticker: 'SPY', value: 15, color: '#C5A880', shares: 12, dateBought: '2022-11-10', type: 'mf' },
      { name: 'Johnson & Johnson (JNJ)', ticker: 'JNJ', value: 15, color: '#64748B', shares: 35, dateBought: '2023-05-05', type: 'stock' },
      { name: 'Cash Equivalents', ticker: 'CASH', value: 10, color: '#E5E7EB', shares: 2500, dateBought: '2024-01-01', type: 'stock' }
    ],
    riskLevel: 'Low',
    expectedReturn: '4-5%',
    feeImpact: 'Low',
    hiddenFees: { expenseRatio: 0.05, advisoryFee: 0.0, tradingCosts: 2.0 }
  },
  Balanced: {
    allocation: [
      { name: 'Vanguard S&P 500 (VOO)', ticker: 'VOO', value: 30, color: '#0B233F', shares: 45, dateBought: '2022-08-14', type: 'mf' },
      { name: 'Microsoft Corp (MSFT)', ticker: 'MSFT', value: 15, color: '#C5A880', shares: 25, dateBought: '2021-12-01', type: 'stock' },
      { name: 'Apple Inc. (AAPL)', ticker: 'AAPL', value: 15, color: '#1E293B', shares: 60, dateBought: '2022-02-18', type: 'stock' },
      { name: 'Vanguard Total Intl (VXUS)', ticker: 'VXUS', value: 15, color: '#64748B', shares: 90, dateBought: '2023-06-30', type: 'mf' },
      { name: 'Berkshire Hathaway (BRK-B)', ticker: 'BRK-B', value: 10, color: '#334155', shares: 18, dateBought: '2022-05-12', type: 'stock' },
      { name: 'Vanguard Total Bond (BND)', ticker: 'BND', value: 15, color: '#94A3B8', shares: 70, dateBought: '2023-11-20', type: 'mf' }
    ],
    riskLevel: 'Medium',
    expectedReturn: '7-9%',
    feeImpact: 'Medium',
    hiddenFees: { expenseRatio: 0.04, advisoryFee: 0.0, tradingCosts: 10.0 }
  },
  Bold: {
    allocation: [
      { name: 'Invesco QQQ Trust (QQQ)', ticker: 'QQQ', value: 25, color: '#0B233F', shares: 35, dateBought: '2021-09-10', type: 'mf' },
      { name: 'Tesla, Inc. (TSLA)', ticker: 'TSLA', value: 20, color: '#C5A880', shares: 40, dateBought: '2022-10-05', type: 'stock' },
      { name: 'Amazon.com (AMZN)', ticker: 'AMZN', value: 15, color: '#1E293B', shares: 55, dateBought: '2023-02-28', type: 'stock' },
      { name: 'Google (GOOGL)', ticker: 'GOOGL', value: 15, color: '#64748B', shares: 65, dateBought: '2023-04-14', type: 'stock' },
      { name: 'JPMorgan Chase (JPM)', ticker: 'JPM', value: 15, color: '#334155', shares: 42, dateBought: '2022-07-22', type: 'stock' },
      { name: 'Vanguard S&P 500 (VOO)', ticker: 'VOO', value: 10, color: '#94A3B8', shares: 15, dateBought: '2024-01-10', type: 'mf' }
    ],
    riskLevel: 'High',
    expectedReturn: '12-15%',
    feeImpact: 'High',
    hiddenFees: { expenseRatio: 0.12, advisoryFee: 0.0, tradingCosts: 25.0 }
  }
};

export const rebalancingScenarios = {
  marketDrop: {
    trigger: "Market Drop of 10%+",
    title: "Market Correction Strategy",
    advice: "Reallocate 5% from Bonds to Equities (Buy the Dip).",
    explanation: "During a drop of 10% or more, high-quality stocks go 'on sale'. We automatically shift a small portion of your stable bond holdings into equities to capture the eventual recovery. This is a standard, disciplined approach to buy low and sell high without timing the market.",
    feeImpactDollars: "$2.50 (ETF Bid/Ask Spread)",
    taxImpact: "None (Done within tax-advantaged accounts if applicable)"
  },
  inflation: {
    trigger: "High Inflation (4%+)",
    title: "Inflation Protection Shift",
    advice: "Increase allocation to Value Stocks and International Equities.",
    explanation: "When inflation runs hot, growth stocks often suffer while value companies (with current cash flows) and international equities can provide better protection. This shift acts as a shield to preserve your real purchasing power.",
    feeImpactDollars: "$1.20 (Rebalancing Costs)",
    taxImpact: "Minimal (Loss harvesting applied where possible)"
  },
  withdrawal: {
    trigger: "Major Life Expense",
    title: "Capital Preservation Mode",
    advice: "Shift 20% of Equities into Cash Equivalents and Short-Term Bonds.",
    explanation: "When you have a major life event coming up (like buying a house), you cannot afford short-term market volatility. We lock in your gains by shifting to highly liquid, stable assets so your money is guaranteed to be there when you need it.",
    feeImpactDollars: "$0.00 (Zero-fee transaction)",
    taxImpact: "Moderate (Capital gains realized; tax-loss harvesting offset attempted)"
  }
};
