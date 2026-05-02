import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Country = "India";

interface CountryContextType {
  country: Country;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const [country] = useState<Country>("India");

  return (
    <CountryContext.Provider value={{ country }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
};
