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

export class WalletService {
  private wallet: PhantomWalletAdapter | null = null;
  private connection: Connection;

  // PROJECT89 token mint address on mainnet
  private PROJECT89_MINT = "Bz4MhmVRQENiCou7ZpJ575wpjNFjBjVBSiVhuNg1pump";

  constructor() {
    // Use Alchemy endpoint
    this.connection = new Connection(
      "https://solana-mainnet.g.alchemy.com/v2/Mhtfn7T2mB7i3tsApF_2vOob_0AqRMLm",
      "confirmed"
    );
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
      // Check if Phantom is installed
      await this.detectPhantom();

      // Initialize wallet
      await this.initializeWallet();

      if (!this.wallet?.connected || !this.wallet?.publicKey) {
        throw new Error("Failed to connect to wallet");
      }

      return this.wallet.publicKey.toBase58();
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.message.includes("not found")) {
        throw new Error("Please install Phantom wallet from phantom.app");
      }
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

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      console.log("tokenAccounts", tokenAccounts);

      // Get balance from the first token account
      const balance =
        tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance;
    } catch (error) {
      console.error("Error checking token balance:", error);
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.wallet) {
        await this.wallet.disconnect();
        this.wallet = null;
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
