import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = body;

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', 'Qwd3NMJOhxH04L497fY6KiTV')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Insert booking into Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        product_id: bookingData.productId,
        renter_id: bookingData.renterId,
        owner_id: bookingData.ownerId,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_price: bookingData.totalAmount,
        status: 'confirmed',
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Create a notification for the owner
    await supabase.from('notifications').insert({
      user_id: bookingData.ownerId,
      type: 'booking',
      title: 'New Booking Request! 🎉',
      body: `Someone just booked your item for ${bookingData.startDate}.`,
      link: `/owner/bookings`,
    });

    return NextResponse.json({ success: true, bookingId: booking.id }, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
