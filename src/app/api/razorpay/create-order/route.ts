import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: 'rzp_test_Sq6bNreDFozlcx',
  key_secret: 'Qwd3NMJOhxH04L497fY6KiTV',
});

// Create a server client to verify auth and perform DB ops safely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, productId, startDate, endDate, ownerId, renterId } = body;

    // 1. Validate the request
    if (!amount || !productId || !renterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Create Razorpay order
    // Amount is in paise for INR (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${productId}`,
      notes: {
        productId,
        renterId,
        startDate,
        endDate
      }
    };

    const order = await razorpay.orders.create(options);

    // Return the created order
    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
