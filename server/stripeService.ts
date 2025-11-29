import { getUncachableStripeClient } from './stripeClient';

export class StripeService {
  async createCustomer(email: string, metadata?: Record<string, string>) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata,
    });
  }

  async createOneTimeCheckoutSession(
    customerId: string | undefined, 
    priceId: string, 
    successUrl: string, 
    cancelUrl: string,
    customerEmail?: string
  ) {
    const stripe = await getUncachableStripeClient();
    
    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    return await stripe.checkout.sessions.create(sessionParams);
  }

  async getCheckoutSession(sessionId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.retrieve(sessionId);
  }
}

export const stripeService = new StripeService();
