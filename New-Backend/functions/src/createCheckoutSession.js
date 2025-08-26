const {onCall} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");

exports.createCheckoutSession = onCall({
  secrets: ["STRIPE_SECRET_KEY"],
  cors: true,
}, async (request) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const { amount = 50 } = request.data; // Default to 50 cents for testing
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'SnapForge Pro License',
              description: amount === 50 ? 'TEST PRICING - Lifetime Access' : 'Lifetime Access to All Pro Tools',
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${request.rawRequest.headers.origin || 'http://localhost:5174'}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.rawRequest.headers.origin || 'http://localhost:5174'}/checkout`,
      metadata: {
        license_type: 'pro',
        test_mode: amount === 50 ? 'true' : 'false',
      },
    });

    logger.info('Checkout session created', { 
      sessionId: session.id, 
      amount: amount,
      testMode: amount === 50 
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    logger.error('Error creating checkout session', error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
});
