import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  message?: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const setLoadingMessage = (newMessage: string) => {
    setMessage(newMessage);
  };

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setLoading, 
      message, 
      setLoadingMessage 
    }}>
      {children}
    </LoadingContext.Provider>
  );
};