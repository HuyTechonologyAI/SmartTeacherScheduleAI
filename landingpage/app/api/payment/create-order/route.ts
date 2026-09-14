import { NextRequest, NextResponse } from 'next/server';
import { PRICING_PLANS, PAYMENT_BENEFICIARY, generateTransferSyntax, generateVietQrImageUrl } from '@/app/lib/paymentConfig';
import { PaymentStore, PaymentOrder } from '@/app/lib/paymentStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syncCode, planId } = body;

    if (!syncCode) {
      return NextResponse.json({ success: false, error: 'Thiếu mã đồng bộ giáo viên (syncCode)' }, { status: 400 });
    }

    const selectedPlan = PRICING_PLANS.find(p => p.id === planId) || PRICING_PLANS[1];
    const syntax = generateTransferSyntax(syncCode, selectedPlan.id);
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order: PaymentOrder = {
      id: orderId,
      syncCode: syncCode.toUpperCase(),
      planId: selectedPlan.id,
      tier: selectedPlan.tier,
      amount: selectedPlan.price,
      syntax,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    PaymentStore.createOrder(order);
    const qrUrl = generateVietQrImageUrl(selectedPlan.price, syntax);

    return NextResponse.json({
      success: true,
      order,
      qrUrl,
      syntax,
      beneficiary: PAYMENT_BENEFICIARY,
      plan: selectedPlan
    });
  } catch (err: any) {
    console.error('Lỗi create-order:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
