# Stripe Backend Integration Reference

## Frontend Request Format

The frontend sends this request to `/api/Payment/create-checkout-session`:

```json
{
  "ticketId": "abc123",
  "ticketType": "Event Ticket",
  "unitPrice": 50000,
  "quantity": 3
}
```

**Note**: `unitPrice` is already converted to cents in the frontend (LKR 500.00 → 50000 cents)

## Complete Express.js API Route

Drop this route straight into your backend:

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// POST /api/Payment/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { ticketId, ticketType, unitPrice, quantity } = req.body;

    // Validation
    if (!ticketId || !ticketType || !unitPrice || !quantity) {
      return res.status(400).json({
        message: 'Missing required fields: ticketId, ticketType, unitPrice, quantity'
      });
    }

    if (unitPrice <= 0 || quantity <= 0) {
      return res.status(400).json({
        message: 'unitPrice and quantity must be positive numbers'
      });
    }

    console.log('=== STRIPE CHECKOUT SESSION CREATION ===');
    console.log('Request body:', req.body);
    console.log('Unit Price (cents):', unitPrice);
    console.log('Quantity:', quantity);
    console.log('Expected total (cents):', unitPrice * quantity);
    console.log('Expected total (LKR):', (unitPrice * quantity) / 100);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: ticketType,
              metadata: {
                ticketId: ticketId
              }
            },
            unit_amount: unitPrice, // Already in cents from frontend
          },
          quantity: quantity, // Pass quantity separately
        },
      ],
      metadata: {
        ticketId: ticketId,
        originalUnitPrice: unitPrice.toString(),
        originalQuantity: quantity.toString()
      },
      success_url: `${req.headers.origin || 'http://localhost:3000'}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/events`,
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('✅ Redirect URL:', session.url);

    res.json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('❌ Stripe checkout session creation failed:', error);
    res.status(500).json({ 
      message: 'Failed to create checkout session',
      error: error.message 
    });
  }
});

module.exports = router;
```

## Request → Stripe Mapping

### ✅ Frontend Request Body
```typescript
const requestBody = {
  ticketId: ticketId,
  ticketType: eventTitle || "Event Ticket",
  unitPrice: Math.round(Number(unitPrice) * 100), // convert LKR to cents
  quantity: Number(quantity)
};
```

### ✅ Backend Stripe Line Items
```typescript
line_items: [
  {
    price_data: {
      currency: "lkr",
      product_data: {
        name: requestBody.ticketType
      },
      unit_amount: requestBody.unitPrice // already in cents
    },
    quantity: requestBody.quantity
  }
]
```

## Example with Real Numbers

**Input:**
- `unitPrice = 500 LKR`
- `quantity = 3`

**Frontend sends:**
```json
{
  "ticketId": "abc123",
  "ticketType": "Event Ticket", 
  "unitPrice": 50000,
  "quantity": 3
}
```

**Backend creates:**
```json
{
  "line_items": [{
    "price_data": {
      "currency": "lkr",
      "product_data": { "name": "Event Ticket" },
      "unit_amount": 50000
    },
    "quantity": 3
  }]
}
```

**Result:** Stripe calculates `50000 × 3 = 150000` cents = **LKR 1,500.00** ✅

## Key Points

⚠️  **DO NOT** multiply `unitPrice * quantity` in the backend
✅  **DO** pass `unitPrice` directly to `unit_amount` (already in cents)
✅  **DO** pass `quantity` separately to the `quantity` field  
✅  Stripe automatically calculates: `unit_amount × quantity`

## Environment Setup

Add to your `.env` file:
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Package Dependencies

```bash
npm install stripe express
```
