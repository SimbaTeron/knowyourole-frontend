import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature, uuid);

    // Additionally handle checkout.session.completed to mark users as premium
    try {
      const stripe = await getUncachableStripeClient();
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const customerEmail = session.customer_email || session.customer_details?.email;
        
        if (customerEmail) {
          console.log(`[Premium] Processing checkout completion for: ${customerEmail}`);
          
          // Find user by email and mark as premium
          const user = await storage.getUserByEmail(customerEmail);
          if (user) {
            await storage.updateUserPremium(user.id, true);
            console.log(`[Premium] User ${user.id} (${customerEmail}) marked as premium`);
          } else {
            console.log(`[Premium] No user found with email ${customerEmail}, premium status will be applied on next login`);
          }
        }
      }
    } catch (err: any) {
      // Don't fail the webhook if our custom handling fails
      // The stripe-replit-sync already handled the main sync
      console.error('[Premium] Error in custom webhook handling:', err.message);
    }
  }
}
