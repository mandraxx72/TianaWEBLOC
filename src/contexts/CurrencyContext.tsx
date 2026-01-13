import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cveToEur, eurToCve } from "@/utils/currency";

type CurrencyCode = "CVE" | "EUR";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatAmount: (amountCVE: number) => string;
  formatAmountWithSecondary: (amountCVE: number) => { primary: string; secondary: string };
  convertToDisplay: (amountCVE: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CVE_TO_EUR_RATE = 110.265;

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferredCurrency");
      return (saved === "EUR" || saved === "CVE") ? saved : "CVE";
    }
    return "CVE";
  });

  useEffect(() => {
    localStorage.setItem("preferredCurrency", currency);
  }, [currency]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
  };

  const formatCVE = (amount: number): string => {
    return `${amount.toLocaleString("pt-CV")} CVE`;
  };

  const formatEUR = (amount: number): string => {
    return `${amount.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  };

  const formatAmount = (amountCVE: number): string => {
    if (currency === "EUR") {
      return formatEUR(cveToEur(amountCVE));
    }
    return formatCVE(amountCVE);
  };

  const formatAmountWithSecondary = (amountCVE: number) => {
    if (currency === "EUR") {
      return {
        primary: formatEUR(cveToEur(amountCVE)),
        secondary: formatCVE(amountCVE),
      };
    }
    return {
      primary: formatCVE(amountCVE),
      secondary: formatEUR(cveToEur(amountCVE)),
    };
  };

  const convertToDisplay = (amountCVE: number): number => {
    if (currency === "EUR") {
      return cveToEur(amountCVE);
    }
    return amountCVE;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        formatAmountWithSecondary,
        convertToDisplay,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
