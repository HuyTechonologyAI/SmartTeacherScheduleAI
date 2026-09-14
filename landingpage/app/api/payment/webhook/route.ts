import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/app/lib/paymentStore';
import { PRICING_PLANS } from '@/app/lib/paymentConfig';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const transferContent = (
      body.content ||
      body.description ||
      body.data?.description ||
      body.orderDescription ||
      ''
    ).toString();

    const transferAmount = Number(
      body.transferAmount ||
      body.amount ||
      body.data?.amount ||
      0
    );

    const gateway = body.gateway || (body.data ? 'PayOS' : 'SePay/ACB');
    const transactionRef = (
      body.referenceCode ||
      body.id ||
      body.data?.reference ||
      `TX-${Date.now()}`
    ).toString();

    // Regex trích xuất cú pháp duy nhất: ST <Mã_Đồng_Bộ> <Mã_Gói>
    const match = transferContent.match(/ST\s+([A-Za-z0-9_-]+)(?:\s+([A-Za-z0-9_-]+))?/i);

    if (!match) {
      console.warn('Webhook received transaction without standard ST syntax:', transferContent);
      return NextResponse.json({
        success: true,
        message: 'Transaction received but no matching ST syntax found. Stored for auditing.',
        rawContent: transferContent
      });
    }

    const syncCode = match[1].trim().toUpperCase();
    const rawPlanCode = (match[2] || 'PRO1Y').trim().toUpperCase();

    let planId: string = 'VIP1_1Y';
    if (rawPlanCode.startsWith('SCHOOL')) {
      planId = 'SCHOOL';
    } else if (rawPlanCode.startsWith('VIP2')) {
      planId = 'VIP2';
    } else if (rawPlanCode.includes('1M') || rawPlanCode.includes('THANG')) {
      planId = 'VIP1_1M';
    } else {
      planId = 'VIP1_1Y';
    }

    const expectedPlan = PRICING_PLANS.find(p => p.id === planId) || PRICING_PLANS[1];
    const finalAmount = transferAmount > 0 ? transferAmount : (expectedPlan.price || 399000);

    // Tự động kích hoạt & Nâng hạng License ngay lập tức
    const { order, license } = PaymentStore.markOrderPaid(
      syncCode,
      planId,
      finalAmount,
      transactionRef,
      gateway
    );

    console.log(`✅ [PAYMENT WEBHOOK SUCCESS] Upgraded ${syncCode} to ${license.tier} (${license.planId}) - Amount: ${finalAmount} đ`);

    return NextResponse.json({
      success: true,
      message: 'License upgraded successfully in 3 seconds!',
      syncCode,
      tier: license.tier,
      expiresAt: license.expiresAt,
      receiptId: license.receiptId,
      receiptHash: license.receiptHash
    });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ONLINE',
    service: 'VietQR / SePay / PayOS Universal Webhook Gateway',
    beneficiary: 'ACB - 37780997 - NGO QUOC HUY',
    syntaxPattern: 'ST <Mã_Đồng_Bộ> <Mã_Gói>',
    timestamp: new Date().toISOString()
  });
}
