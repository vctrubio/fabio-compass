'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Wallet, UserRole } from '@/rails/types';
import { createClient } from '@/lib/supabase/client';

interface WalletContextType {
  wallet: Wallet | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createDefaultWallet = (authenticated: boolean = false, user?: any): Wallet => ({
    sk: user?.id || '',
    pk: '',
    role: 'guest' as UserRole,
    status: authenticated,
    email: user?.email || '',
  });

  const fetchWallet = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setWallet(createDefaultWallet());
        return;
      }

      // For now, create a basic authenticated wallet
      // In a real implementation, this would fetch the user's role from the database
      const authenticatedWallet: Wallet = {
        sk: user.id,
        pk: '', // Would be populated from user profile/role lookup
        role: 'admin', // Default to admin for development
        status: true,
        email: user.email || '',
      };

      setWallet(authenticatedWallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setWallet(createDefaultWallet());
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setWallet(createDefaultWallet());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshWallet = async () => {
    setIsLoading(true);
    await fetchWallet();
  };

  useEffect(() => {
    fetchWallet();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        await fetchWallet();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, isLoading, signOut, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}