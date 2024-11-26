// Add this type declaration before the imports
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
      };
    };
  }
}

import { Connection, PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { TerminalContext } from "../terminal/TerminalContext";

export class WalletService {
  private wallet: PhantomWalletAdapter | null = null;
  private connection: Connection;
  private terminalContext: TerminalContext;

  // PROJECT89 token mint address on mainnet
  private PROJECT89_MINT = "Bz4MhmVRQENiCou7ZpJ575wpjNFjBjVBSiVhuNg1pump";

  constructor() {
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL ||
        "https://api.mainnet-beta.solana.com",
      "confirmed"
    );
    this.terminalContext = TerminalContext.getInstance();

    // Try to restore wallet connection if previously connected
    this.tryRestoreConnection();
  }

  private async tryRestoreConnection() {
    const state = this.terminalContext.getState();
    if (state.walletConnected && state.walletAddress) {
      try {
        // Only attempt reconnect if last seen within 24 hours
        const lastSeen = state.lastSeen ? new Date(state.lastSeen) : null;
        const isRecent =
          lastSeen &&
          new Date().getTime() - lastSeen.getTime() < 24 * 60 * 60 * 1000;

        if (isRecent) {
          await this.connect();
        } else {
          // Clear stale wallet state
          this.terminalContext.setState({
            walletConnected: false,
            walletAddress: undefined,
            lastSeen: undefined,
          });
        }
      } catch (error) {
        console.error("Failed to restore wallet connection:", error);
        // Clear wallet state on failed reconnect
        this.terminalContext.setState({
          walletConnected: false,
          walletAddress: undefined,
          lastSeen: undefined,
        });
      }
    }
  }

  private async initializeWallet() {
    if (!this.wallet) {
      this.wallet = new PhantomWalletAdapter();
      await this.wallet.connect();
    }
  }

  private async detectPhantom(): Promise<boolean> {
    // Wait for window.phantom to be available
    let retries = 0;
    while (!window.phantom?.solana && retries < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }

    if ("phantom" in window && window.phantom?.solana?.isPhantom) {
      return true;
    }
    throw new Error("Phantom wallet not found - Please install Phantom");
  }

  async connect(): Promise<string> {
    try {
      await this.detectPhantom();
      await this.initializeWallet();

      if (!this.wallet?.connected || !this.wallet?.publicKey) {
        throw new Error("Failed to connect to wallet");
      }

      const address = this.wallet.publicKey.toBase58();

      // Update terminal context with wallet info
      this.terminalContext.setState({
        walletConnected: true,
        walletAddress: address,
        lastSeen: new Date(),
      });

      return address;
    } catch (error: any) {
      // Clear wallet state on error
      this.terminalContext.setState({
        walletConnected: false,
        walletAddress: undefined,
        lastSeen: undefined,
      });
      throw error;
    }
  }

  async checkTokenBalance(): Promise<number> {
    if (!this.wallet?.publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      // Create PublicKey from mint address string
      const mintPubkey = new PublicKey(this.PROJECT89_MINT);

      // First check if the token account exists
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        this.wallet.publicKey,
        { mint: mintPubkey }
      );

      console.log("Token accounts:", tokenAccounts);

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      // Get balance from the first token account
      const balance =
        tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount ||
        0;

      // Add debug logging
      console.log("Token account data:", {
        mint: this.PROJECT89_MINT,
        accounts: tokenAccounts.value,
        balance,
      });

      return balance;
    } catch (error) {
      console.error("Error checking token balance:", error);
      // Add more detailed error logging
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.wallet) {
        await this.wallet.disconnect();
        this.wallet = null;

        // Clear wallet state in context
        this.terminalContext.setState({
          walletConnected: false,
          walletAddress: undefined,
          lastSeen: undefined,
        });
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      throw new Error("Failed to disconnect wallet");
    }
  }

  isConnected(): boolean {
    return this.wallet?.connected || false;
  }
}
