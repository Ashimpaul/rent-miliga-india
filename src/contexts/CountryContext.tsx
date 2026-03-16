import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Country = "India" | "Nepal";

interface CountryContextType {
  country: Country;
  setCountry: (country: Country) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const [country, setCountryState] = useState<Country>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("selected_country") as Country) || "India";
    }
    return "India";
  });

  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);
    localStorage.setItem("selected_country", newCountry);
  };

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
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
