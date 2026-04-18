import React, { createContext, useContext, useState } from 'react';

export type Currency = 'PKR' | 'USD' | 'AED';

// Fixed exchange rates (PKR as base)
const RATES: Record<Currency, number> = {
  PKR: 1,
  USD: 0.0036,
  AED: 0.013,
};

const SYMBOLS: Record<Currency, string> = {
  PKR: 'PKR',
  USD: '$',
  AED: 'AED',
};

interface CurrencyContextProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (pkrAmount: number) => number;
  formatPrice: (pkrAmount: number) => string;
  symbol: string;
  rate: number;
}

export const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('PKR');

  const rate   = RATES[currency];
  const symbol = SYMBOLS[currency];

  const convert = (pkrAmount: number): number => {
    if (currency === 'PKR') return pkrAmount;
    return pkrAmount * rate;
  };

  const formatPrice = (pkrAmount: number): string => {
    const val = convert(pkrAmount);
    if (currency === 'PKR') return `PKR ${val.toLocaleString()}`;
    if (currency === 'USD') return `$${val.toFixed(2)}`;
    if (currency === 'AED') return `AED ${val.toFixed(2)}`;
    return `${currency} ${val.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, formatPrice, symbol, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextProps => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
