import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Checking for existing KnowRole Pro product...');
  
  const existingProducts = await stripe.products.search({ 
    query: "name:'KnowRole Pro'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('KnowRole Pro already exists:', existingProducts.data[0].id);
    const prices = await stripe.prices.list({ product: existingProducts.data[0].id });
    console.log('Existing prices:', prices.data.map(p => ({ id: p.id, amount: p.unit_amount })));
    return;
  }

  console.log('Creating KnowRole Pro product...');
  
  const product = await stripe.products.create({
    name: 'KnowRole Pro',
    description: 'Unlock deep personality insights with arc tracking, retest versions, and full history access. One-time purchase, lifetime access.',
    images: [],
    metadata: {
      tier: 'pro',
      type: 'one_time',
      features: 'arc_tracker,retest_versions,full_history,deep_analysis,extra_roles',
    },
  });

  console.log('Created product:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 900,
    currency: 'usd',
    metadata: {
      display_name: '$9 One-Time',
    },
  });

  console.log('Created price:', price.id, '- $9.00 one-time');
  console.log('\nProduct setup complete!');
  console.log('Product ID:', product.id);
  console.log('Price ID:', price.id);
}

createProducts().catch(console.error);
