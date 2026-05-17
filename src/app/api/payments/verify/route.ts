import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = await req.json();

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        product_id: bookingData.productId,
        renter_id: user.id,
        owner_id: bookingData.ownerId,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        days: bookingData.days,
        rental_amount: bookingData.rentalAmount,
        deposit_amount: bookingData.depositAmount,
        platform_fee: bookingData.platformFee,
        gst_amount: bookingData.gstAmount,
        total_amount: bookingData.totalAmount,
        delivery_type: bookingData.deliveryType,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError || !booking) {
      throw new Error(bookingError?.message || 'Failed to create booking');
    }

    // Create payment record
    await supabase.from('payments').insert({
      booking_id: booking.id,
      razorpay_order_id,
      razorpay_payment_id,
      amount: bookingData.totalAmount,
      currency: 'INR',
      status: 'paid',
    });

    // Block product availability dates
    const dates: string[] = [];
    const current = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    await supabase.from('product_availability').insert(
      dates.map((date) => ({ product_id: bookingData.productId, date, available: false, booking_id: booking.id }))
    );

    // Notify owner
    await supabase.from('notifications').insert({
      user_id: bookingData.ownerId,
      type: 'booking_request',
      title: 'New Booking Request!',
      body: `You have a new booking request for ${bookingData.startDate} – ${bookingData.endDate}`,
      link: `/owner/bookings/${booking.id}`,
      read: false,
    });

    return NextResponse.json({ bookingId: booking.id, success: true });
  } catch (err) {
    console.error('Payment verify error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
