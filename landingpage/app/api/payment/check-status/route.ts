import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/app/lib/paymentStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const syncCode = searchParams.get('syncCode');
  const orderId = searchParams.get('orderId');

  if (!syncCode && !orderId) {
    return NextResponse.json({ success: false, error: 'Thiếu syncCode hoặc orderId' }, { status: 400 });
  }

  if (syncCode) {
    const license = PaymentStore.getLicense(syncCode);
    const order = PaymentStore.getOrderBySyncCode(syncCode);

    if (license) {
      return NextResponse.json({
        success: true,
        isPaid: true,
        tier: license.tier,
        expiresAt: license.expiresAt,
        receiptId: license.receiptId,
        receiptHash: license.receiptHash,
        order
      });
    }

    if (order && order.status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        isPaid: true,
        tier: order.tier,
        receiptId: order.receiptId,
        receiptHash: order.receiptHash,
        order
      });
    }
  }

  if (orderId) {
    const order = PaymentStore.getOrder(orderId);
    if (order && order.status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        isPaid: true,
        tier: order.tier,
        receiptId: order.receiptId,
        receiptHash: order.receiptHash,
        order
      });
    }
  }

  return NextResponse.json({
    success: true,
    isPaid: false,
    status: 'WAITING_FOR_PAYMENT',
    message: 'Đang lắng nghe tín hiệu chuyển khoản từ ngân hàng...'
  });
}
