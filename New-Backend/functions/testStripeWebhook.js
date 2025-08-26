// Test script to simulate a Stripe webhook event
const webhook = require('./src/stripeWebhook');

// Mock Stripe event data
const mockEvent = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123456789',
      payment_status: 'paid',
      customer_details: {
        email: 'test@example.com',
        name: 'Test Customer'
      },
      metadata: {
        license_type: 'pro'
      },
      amount_total: 50, // $0.50 (in cents)
      currency: 'usd'
    }
  }
};

// Mock request/response objects
const mockReq = {
  body: mockEvent,
  headers: {
    'stripe-signature': 'test_signature'
  }
};

const mockRes = {
  status: (code) => ({
    send: (message) => console.log(`Response ${code}: ${message}`)
  }),
  send: (message) => console.log(`Response: ${message}`)
};

console.log('Testing Stripe webhook with mock event...');
console.log('Mock event:', JSON.stringify(mockEvent, null, 2));

// Note: This is just for testing the data flow
// In reality, the webhook verification would fail with mock data
console.log('This test shows the data flow but webhook verification will fail with mock data');
