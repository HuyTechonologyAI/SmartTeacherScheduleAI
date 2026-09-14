import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/app/lib/paymentStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, syncCode, companyName, taxCode, address, email, notes, amount } = body;

    if (!companyName || !taxCode || !email) {
      return NextResponse.json({ success: false, error: 'Vui lòng điền đầy đủ Tên cơ quan, Mã số thuế và Email nhận hóa đơn' }, { status: 400 });
    }

    const vatRecord = PaymentStore.saveVatRequest({
      orderId: orderId || `ORD_${Date.now()}`,
      syncCode: (syncCode || 'GV').toUpperCase(),
      companyName,
      taxCode,
      address: address || '',
      email,
      notes: notes || '',
      amount: Number(amount) || 399000
    });

    return NextResponse.json({
      success: true,
      message: 'Đã tiếp nhận yêu cầu xuất hóa đơn GTGT (VAT) điện tử thành công!',
      invoice: vatRecord
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const list = PaymentStore.getAllVatRequests();
  return NextResponse.json({ success: true, total: list.length, vatRequests: list });
}
