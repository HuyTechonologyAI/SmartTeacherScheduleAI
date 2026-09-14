import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/app/lib/paymentStore';
import { PRICING_PLANS } from '@/app/lib/paymentConfig';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syncCode, planId } = body;

    if (!syncCode) {
      return NextResponse.json({ success: false, error: 'Thiếu syncCode' }, { status: 400 });
    }

    const cleanSync = syncCode.toUpperCase();
    const plan = PRICING_PLANS.find(p => p.id === planId) || PRICING_PLANS[1];
    const txRef = `SIM_${Date.now()}`;

    const { order, license } = PaymentStore.markOrderPaid(
      cleanSync,
      plan.id,
      plan.price,
      txRef,
      'Sandbox Simulator (ACB 37780997)'
    );

    return NextResponse.json({
      success: true,
      message: 'Đã giả lập nhận tiền thành công trong 3 giây!',
      syncCode: cleanSync,
      tier: license.tier,
      expiresAt: license.expiresAt,
      receiptId: license.receiptId,
      receiptHash: license.receiptHash,
      order
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
