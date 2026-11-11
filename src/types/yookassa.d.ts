declare module '@light-stack/yookassa-payments/server' {
  export function createYookassaPaymentSession(
    credentials: { shopId: string; secretKey: string },
    data: any
  ): Promise<{ confirmationUrl: string; paymentId: string }>;
}