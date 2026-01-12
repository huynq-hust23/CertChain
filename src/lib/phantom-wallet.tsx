"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string; toBuffer(): Buffer; toBase58(): string };
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signAndSendTransaction: (transaction: any, options?: any) => Promise<{ signature: string }>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

type PhantomWalletState = {
  publicKey: string | null;
  isConnecting: boolean;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
};

const PhantomWalletContext = createContext<PhantomWalletState | null>(null);

export function PhantomWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state

  React.useEffect(() => {
    const checkPhantom = () => {
      if ("solana" in window && window.solana?.isPhantom) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Initial check
    checkPhantom();

    // Polling to detect injection
    const interval = setInterval(() => {
      if (checkPhantom()) {
        clearInterval(interval);
      }
    }, 1000);

    window.addEventListener('load', checkPhantom);

    // Simulate loading delay for better UX (as requested)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds "simulator" delay

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener('load', checkPhantom);
    };
  }, []);

  // Eager connection to persist session
  React.useEffect(() => {
    // Only attempt to auto-connect if the user has a stored "connected" state
    const shouldAutoConnect = localStorage.getItem("phantom_wallet_connected") === "true";

    if (shouldAutoConnect && isInstalled && !publicKey && "solana" in window) {
      setIsConnecting(true); // Show connecting state during auto-connect
      window.solana?.connect({ onlyIfTrusted: true })
        .then((resp) => {
          const key = resp?.publicKey?.toString();
          if (key) {
            setPublicKey(key);
            // Ensure flag is set (redundant but safe)
            localStorage.setItem("phantom_wallet_connected", "true");
          }
        })
        .catch(() => {
          // If auto-connect fails, clear the flag so we don't keep trying or in case of revoked trust
          localStorage.removeItem("phantom_wallet_connected");
        })
        .finally(() => {
          setIsConnecting(false);
        });
    }
  }, [isInstalled]); // removed publicKey from deps to avoid loop, though !publicKey check handles it

  const connect = useCallback(async () => {
    if (!isInstalled) {
      throw new Error("Phantom wallet is not installed");
    }

    setIsConnecting(true);
    try {
      const resp = await window.solana!.connect();
      const key = resp?.publicKey?.toString?.() ?? window.solana?.publicKey?.toString?.();
      if (!key) {
        throw new Error("Failed to read public key from Phantom");
      }
      setPublicKey(key);
      localStorage.setItem("phantom_wallet_connected", "true");
    } finally {
      setIsConnecting(false);
    }
  }, [isInstalled]);

  const disconnect = useCallback(async () => {
    if (!isInstalled) {
      setPublicKey(null);
      localStorage.removeItem("phantom_wallet_connected");
      return;
    }

    await window.solana!.disconnect();
    setPublicKey(null);
    localStorage.removeItem("phantom_wallet_connected");
  }, [isInstalled]);

  const value = useMemo<PhantomWalletState>(
    () => ({
      publicKey,
      isConnecting,
      isInstalled,
      connect,
      disconnect,
      isLoading,
    }),
    [publicKey, isConnecting, isInstalled, connect, disconnect, isLoading]
  );

  return (
    <PhantomWalletContext.Provider value={value}>
      {children}
    </PhantomWalletContext.Provider>
  );
}

export function usePhantomWallet() {
  const ctx = useContext(PhantomWalletContext);
  if (!ctx) {
    throw new Error("usePhantomWallet must be used within PhantomWalletProvider");
  }
  return ctx;
}
