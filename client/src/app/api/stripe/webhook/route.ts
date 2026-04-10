import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/api/_lib/stripe';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';

export const dynamic = 'force-dynamic';

// Disable body parsing - need raw body for Stripe signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    // Get raw body as ArrayBuffer for signature verification
    const body = await request.arrayBuffer();
    const payload = Buffer.from(body);

    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed to mark users as premium
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const customerEmail = session.customer_email || session.customer_details?.email;

      if (customerEmail) {
        console.log(`[Premium] Processing checkout completion for: ${customerEmail}`);

        // Find user by email and mark as premium
        const { data: user, error: userError } = await getSupabaseAdmin()
          .from('users')
          .select('*')
          .eq('email', customerEmail)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error('[Premium] Error finding user:', userError);
        }

        if (user) {
          const { error: updateError } = await getSupabaseAdmin()
            .from('users')
            .update({ is_premium: true })
            .eq('id', user.id);

          if (updateError) {
            console.error('[Premium] Error updating premium status:', updateError);
          } else {
            console.log(`[Premium] User ${user.id} (${customerEmail}) marked as premium`);
          }
        } else {
          console.log(`[Premium] No user found with email ${customerEmail}, premium status will be applied on next login`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
