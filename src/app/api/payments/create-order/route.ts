import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import { calculatePrice, daysBetween } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, startDate, endDate, deliveryType, totalAmount } = await req.json();

    // Validate product exists and is active
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, owner:users!owner_id(id)')
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found or unavailable' }, { status: 404 });
    }

    // Check availability — no overlapping bookings
    const { data: conflicting } = await supabase
      .from('bookings')
      .select('id')
      .eq('product_id', productId)
      .in('status', ['pending', 'accepted', 'active'])
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (conflicting && conflicting.length > 0) {
      return NextResponse.json({ error: 'Product is not available for selected dates' }, { status: 409 });
    }

    // Calculate price server-side
    const days = daysBetween(new Date(startDate), new Date(endDate));
    const pricing = calculatePrice(product.price_per_day, product.deposit_amount, days);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: pricing.totalAmount * 100, // paise
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: {
        productId,
        renterId: user.id,
        ownerId: product.owner_id,
        startDate,
        endDate,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: pricing.totalAmount,
      currency: 'INR',
      bookingData: {
        productId,
        renterId: user.id,
        ownerId: product.owner_id,
        startDate,
        endDate,
        days: pricing.days,
        rentalAmount: pricing.rentalAmount,
        depositAmount: pricing.depositAmount,
        platformFee: pricing.platformFee,
        gstAmount: pricing.gstAmount,
        totalAmount: pricing.totalAmount,
        deliveryType,
      },
    });
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
