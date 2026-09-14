import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/app/lib/paymentStore';
import { calculateDetailedQuote } from '@/app/lib/paymentConfig';

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
      hasVat,
      notes
    } = body;

    if (!contactName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp họ tên và số điện thoại liên hệ' },
        { status: 400 }
      );
    }

    // AI Tính toán bảng dự toán chi tiết chuẩn Trụ cột 5
    const quoteDetails = calculateDetailedQuote({
      type: type || 'SCHOOL_SCALE',
      organizationName: organizationName || (type === 'VIP2_CLASS' ? 'Lớp học tiêu chuẩn' : 'Trường học đối tác'),
      contactName,
      phone,
      email: email || '',
      teacherCount: Number(teacherCount || 0),
      studentCount: Number(studentCount || 0),
      parentCount: Number(parentCount || 0),
      hasVat: !!hasVat
    });

    const record = PaymentStore.saveQuoteRequest({
      type: type || 'SCHOOL_SCALE',
      syncCode: (syncCode || 'GV').toUpperCase(),
      contactName,
      phone,
      email: email || '',
      organizationName: organizationName || (type === 'VIP2_CLASS' ? 'Lớp học tiêu chuẩn' : 'Trường học đối tác'),
      teacherCount: Number(teacherCount || 0),
      studentCount: Number(studentCount || 0),
      parentCount: Number(parentCount || 0),
      notes: notes || '',
      quoteDetails
    });

    return NextResponse.json({
      success: true,
      message: 'AI đã tính toán và xuất bản thành công Bảng Báo Giá Dự Toán chi tiết!',
      record,
      quoteDetails
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
