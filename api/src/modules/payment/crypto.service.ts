import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type CryptoPaymentStatus = 'pending' | 'paid' | 'failed';

export interface CryptoPayment {
  paymentId: string;
  amount: string;
  currency: string;
  provider: string;
  status: CryptoPaymentStatus;
  checkoutUrl: string;
  reference: string;
  createdAt: number;
}

// Time before a pending mock payment resolves (ms).
const SETTLE_AFTER = 3000;

@Injectable()
export class CryptoService {
  private readonly provider = 'BinancePay';
  private readonly sessions = new Map<string, CryptoPayment>();

  createSession(amount: string, currency = 'USDT'): CryptoPayment {
    const paymentId = randomUUID();
    const reference = `BP-${Date.now()}`;
    const numericAmount = Number(amount);

    const session: CryptoPayment = {
      paymentId,
      amount,
      currency,
      provider: this.provider,
      // Invalid amounts fail immediately, everything else starts pending.
      status: !numericAmount || numericAmount <= 0 ? 'failed' : 'pending',
      checkoutUrl: `https://pay.example.com/checkout/${paymentId}`,
      reference,
      createdAt: Date.now(),
    };

    this.sessions.set(paymentId, session);
    return session;
  }

  getStatus(paymentId: string): CryptoPayment {
    const session = this.sessions.get(paymentId);
    if (!session) {
      throw new NotFoundException('Payment session not found.');
    }

    // Real Binance Pay call: query the order status via the v2 query API here.
    // For the mock we settle pending sessions to paid after a short delay.
    if (session.status === 'pending' && Date.now() - session.createdAt > SETTLE_AFTER) {
      session.status = 'paid';
    }

    return session;
  }
}
