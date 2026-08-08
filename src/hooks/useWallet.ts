import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  getAddress,
  requestAccess,
  signTransaction,
  getNetwork,
} from "@stellar/freighter-api";
import { stellarConfig } from "../lib/stellar";

interface WalletState {
  connected: boolean;
  address: string | null;
  network: string | null;
  installed: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    network: null,
    installed: false,
  });

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const { isConnected: installed, error } = await isConnected();
      if (error || !installed) return;

      const { address: addr, error: addressError } = await getAddress();
      if (addressError || !addr) {
        setState((current) => ({ ...current, installed: true }));
        return;
      }

      const { network: net, error: networkError } = await getNetwork();
      if (networkError) return;

      setState({ connected: true, address: addr, network: net, installed: true });
    } catch {
      // wallet not available
    }
  }

  const connect = useCallback(async () => {
    const { isConnected: installed, error } = await isConnected();
    if (error || !installed) throw new Error("Freighter is not installed. Install the extension, then try again.");

    const { address: addr, error: accessError } = await requestAccess();
    if (accessError) throw new Error(accessError.message);

    const { network: net, error: networkError } = await getNetwork();
    if (networkError) throw new Error(networkError.message);

    setState({ connected: true, address: addr, network: net, installed: true });
    return addr;
  }, []);

  const disconnect = useCallback(() => {
    setState((current) => ({ ...current, connected: false, address: null, network: null }));
  }, []);

  const sign = useCallback(
    async (xdr: string) => {
      if (!state.connected || !state.address) throw new Error("Wallet not connected");
      const { signedTxXdr, error } = await signTransaction(xdr, {
        networkPassphrase: stellarConfig.networkPassphrase,
        address: state.address,
      });
      if (error) throw new Error(error.message);
      return signedTxXdr;
    },
    [state.connected, state.address],
  );

  const expectedNetwork = stellarConfig.network === "testnet" ? "TESTNET" : "PUBLIC";
  const networkMismatch = state.connected && state.network && !state.network.toUpperCase().includes(expectedNetwork);

  return { ...state, connect, disconnect, sign, networkMismatch };
}
