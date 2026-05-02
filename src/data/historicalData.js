import { tickerMetrics } from './tickerMetrics';

// Helper to generate a realistic random walk for a stock price
const generateRandomWalk = (startPrice, days, volatility) => {
  const data = [];
  let currentPrice = startPrice;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random daily return based on volatility (standard deviation)
    const dailyReturn = (Math.random() - 0.5) * volatility;
    currentPrice = currentPrice * (1 + dailyReturn);
    
    data.push({
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(currentPrice.toFixed(2))
    });
  }
  return data;
};

// Base starting prices for realism
const basePrices = {
  'SPY': 510.50,
  'VOO': 468.20,
  'BND': 72.15,
  'BNDX': 48.90,
  'AAPL': 175.40,
  'MSFT': 420.10,
  'GOOGL': 155.30,
  'AMZN': 180.25,
  'JNJ': 155.60,
  'BRK-B': 410.80,
  'JPM': 195.40,
  'VXUS': 58.70,
  'TSLA': 175.20,
  'QQQ': 440.50,
  'VTI': 255.60,
  'CASH': 1.00
};

const mockDataCache = {};

export const getHistoricalData = (ticker) => {
  if (mockDataCache[ticker]) {
    return mockDataCache[ticker];
  }

  const startPrice = basePrices[ticker] || 100;
  // Use beta as a proxy for volatility. Higher beta = higher daily swings
  const metrics = tickerMetrics[ticker] || { beta: 1 };
  const volatility = (metrics.beta * 0.015); // 1.5% base daily volatility scaled by beta
  
  const history = generateRandomWalk(startPrice, 365, volatility);
  const currentPrice = history[history.length - 1].price;
  const oldPrice = history[0].price;
  const change = currentPrice - oldPrice;
  const percentChange = (change / oldPrice) * 100;

  const result = {
    ticker,
    currentPrice: Number(currentPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    percentChange: Number(percentChange.toFixed(2)),
    isPositive: change >= 0,
    history
  };

  mockDataCache[ticker] = result;
  return result;
};
