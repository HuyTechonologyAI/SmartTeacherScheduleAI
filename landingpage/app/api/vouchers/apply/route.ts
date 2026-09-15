import { NextRequest, NextResponse } from 'next/server';
import { redeemVoucher, getVoucherByCode } from '@/app/lib/voucherStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || '';

    if (!code) {
      return NextResponse.json({ success: false, error: 'Thiếu mã voucher' }, { status: 400 });
    }

    const voucher = await getVoucherByCode(code);
    if (!voucher) {
      return NextResponse.json({
        success: false,
        error: 'Mã voucher không tồn tại trên hệ thống.'
      }, { status: 404 });
    }

    if (!voucher.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Mã voucher này hiện đang tạm dừng hoạt động.'
      }, { status: 400 });
    }

    const nowStr = new Date().toISOString().split('T')[0];
    if (voucher.endDate && nowStr > voucher.endDate) {
      return NextResponse.json({
        success: false,
        error: 'Mã voucher đã hết hạn sử dụng.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      voucher: {
        code: voucher.code,
        title: voucher.title,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        targetTier: voucher.targetTier,
        grantTier: voucher.grantTier,
        grantDurationDays: voucher.grantDurationDays,
        features: voucher.features,
        giftMessage: voucher.giftMessage
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, syncCode, teacherName, schoolName, phone, planId, originalPrice } = body;

    if (!code) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng nhập mã Voucher khuyến mãi!'
      }, { status: 400 });
    }

    const result = await redeemVoucher({
      code,
      syncCode: syncCode || 'ANON-SYNC-001',
      teacherName: teacherName || 'Giáo viên',
      schoolName,
      phone,
      planId: planId || 'VIP1_1Y',
      originalPrice: Number(originalPrice || 0)
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Lỗi khi áp dụng voucher:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Lỗi khi kích hoạt voucher'
    }, { status: 500 });
  }
}
