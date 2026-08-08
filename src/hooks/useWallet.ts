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
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    network: null,
  });

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const { isConnected: installed, error } = await isConnected();
      if (error || !installed) return;

      const { address: addr, error: addressError } = await getAddress();
      if (addressError || !addr) return;

      const { network: net, error: networkError } = await getNetwork();
      if (networkError) return;

      setState({ connected: true, address: addr, network: net });
    } catch {
      // wallet not available
    }
  }

  const connect = useCallback(async () => {
    const { isConnected: installed, error } = await isConnected();
    if (error || !installed) throw new Error("Freighter extension not installed");

    const { address: addr, error: accessError } = await requestAccess();
    if (accessError) throw new Error(accessError.message);

    const { network: net, error: networkError } = await getNetwork();
    if (networkError) throw new Error(networkError.message);

    setState({ connected: true, address: addr, network: net });
    return addr;
  }, []);

  const disconnect = useCallback(() => {
    setState({ connected: false, address: null, network: null });
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

  const networkMismatch =
    state.connected && state.network && state.network !== stellarConfig.network.toUpperCase();

  return { ...state, connect, disconnect, sign, networkMismatch };
}
