import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/app/lib/paymentStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type, // 'VIP2_CLASS' | 'SCHOOL_SCALE'
      syncCode,
      contactName,
      phone,
      email,
      organizationName,
      teacherCount,
      studentCount,
      parentCount,
      notes
    } = body;

    if (!contactName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp họ tên và số điện thoại liên hệ' },
        { status: 400 }
      );
    }

    const record = PaymentStore.saveQuoteRequest({
      type: type || 'SCHOOL_SCALE',
      syncCode: (syncCode || 'GV').toUpperCase(),
      contactName,
      phone,
      email: email || '',
      organizationName: organizationName || 'Trường học / Lớp học',
      teacherCount: Number(teacherCount || 0),
      studentCount: Number(studentCount || 0),
      parentCount: Number(parentCount || 0),
      notes: notes || ''
    });

    return NextResponse.json({
      success: true,
      message: 'Đã gửi yêu cầu báo giá thành công! Chuyên viên Huy Technology AI sẽ liên hệ gửi bảng báo giá chi tiết trong 15 phút.',
      record
    });
  } catch (err: any) {
    console.error('Lỗi quote request:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const list = PaymentStore.getAllQuoteRequests();
  return NextResponse.json({ success: true, count: list.length, quotes: list });
}
