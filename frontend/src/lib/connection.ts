import { Connection, ConnectionConfig, TransactionConfirmationStrategy, Commitment, RpcResponseAndContext, SignatureResult } from "@solana/web3.js";

export class RateLimitedConnection extends Connection {
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  constructor(endpoint: string, config?: ConnectionConfig) {
    super(endpoint, config);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error as Error;
        
        // If it's a 429 error, wait with exponential backoff
        const errorMessage = (error as Error)?.message || '';
        const errorStatus = (error as { status?: number })?.status;
        if (errorMessage.includes('429') || errorStatus === 429) {
          const delayMs = this.baseDelay * Math.pow(2, attempt);
          console.log(`Rate limited (attempt ${attempt + 1}), waiting ${delayMs}ms...`);
          await this.delay(delayMs);
          continue;
        }
        
        // For non-429 errors, throw immediately
        throw error;
      }
    }
    
    throw lastError;
  }

  // Override key methods that make RPC calls
  async getAccountInfo(...args: Parameters<Connection['getAccountInfo']>) {
    return this.executeWithRetry(() => super.getAccountInfo(...args));
  }

  async getMultipleAccountsInfo(...args: Parameters<Connection['getMultipleAccountsInfo']>) {
    return this.executeWithRetry(() => super.getMultipleAccountsInfo(...args));
  }

  async getBalance(...args: Parameters<Connection['getBalance']>) {
    return this.executeWithRetry(() => super.getBalance(...args));
  }

  async getLatestBlockhash(...args: Parameters<Connection['getLatestBlockhash']>) {
    return this.executeWithRetry(() => super.getLatestBlockhash(...args));
  }

  async sendRawTransaction(...args: Parameters<Connection['sendRawTransaction']>) {
    return this.executeWithRetry(() => super.sendRawTransaction(...args));
  }

  // Handle both overloads of confirmTransaction
  async confirmTransaction(strategy: TransactionConfirmationStrategy, commitment?: Commitment): Promise<RpcResponseAndContext<SignatureResult>>;
  async confirmTransaction(strategy: string, commitment?: Commitment): Promise<RpcResponseAndContext<SignatureResult>>;
  async confirmTransaction(strategy: TransactionConfirmationStrategy | string, commitment?: Commitment): Promise<RpcResponseAndContext<SignatureResult>> {
    return this.executeWithRetry(() => super.confirmTransaction(strategy as TransactionConfirmationStrategy, commitment));
  }

  async getSignatureStatus(...args: Parameters<Connection['getSignatureStatus']>) {
    return this.executeWithRetry(() => super.getSignatureStatus(...args));
  }
} 