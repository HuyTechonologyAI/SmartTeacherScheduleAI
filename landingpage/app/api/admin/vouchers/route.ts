import { NextRequest, NextResponse } from 'next/server';
import {
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  toggleVoucherStatus,
  giftVoucherToUser,
  getVoucherAnalytics
} from '@/app/lib/voucherStore';

export async function GET() {
  try {
    const vouchers = await getAllVouchers();
    const analytics = await getVoucherAnalytics();

    return NextResponse.json({
      success: true,
      vouchers,
      analytics
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách vouchers:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi máy chủ'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'CREATE';

    switch (action) {
      case 'CREATE': {
        const { voucher } = body;
        if (!voucher || !voucher.code || !voucher.title) {
          return NextResponse.json({
            success: false,
            error: 'Vui lòng cung cấp đầy đủ Mã Voucher và Tên chương trình!'
          }, { status: 400 });
        }
        const created = await createVoucher(voucher);
        return NextResponse.json({
          success: true,
          message: `Đã tạo thành công Voucher '${created.code}'!`,
          voucher: created
        });
      }

      case 'UPDATE': {
        const { id, updates } = body;
        if (!id || !updates) {
          return NextResponse.json({
            success: false,
            error: 'Thiếu ID hoặc thông tin chỉnh sửa voucher!'
          }, { status: 400 });
        }
        const updated = await updateVoucher(id, updates);
        return NextResponse.json({
          success: true,
          message: `Đã cập nhật thành công Voucher '${updated.code}'!`,
          voucher: updated
        });
      }

      case 'TOGGLE_STATUS': {
        const { id } = body;
        if (!id) {
          return NextResponse.json({ success: false, error: 'Thiếu ID voucher' }, { status: 400 });
        }
        const toggled = await toggleVoucherStatus(id);
        return NextResponse.json({
          success: true,
          message: `Đã ${toggled.isActive ? 'Kích hoạt' : 'Tạm dừng'} Voucher '${toggled.code}'!`,
          voucher: toggled
        });
      }

      case 'GIFT_TEACHER': {
        const { voucherId, teacher } = body;
        if (!voucherId || !teacher || !teacher.syncCode || !teacher.teacherName) {
          return NextResponse.json({
            success: false,
            error: 'Thiếu thông tin giáo viên nhận quà hoặc ID voucher!'
          }, { status: 400 });
        }
        const giftedVoucher = await giftVoucherToUser(voucherId, teacher);
        return NextResponse.json({
          success: true,
          message: `Đã gửi tặng thành công Voucher '${giftedVoucher.code}' tới Thầy/Cô ${teacher.teacherName} (${teacher.syncCode})!`,
          voucher: giftedVoucher
        });
      }

      case 'DELETE': {
        const { id } = body;
        if (!id) {
          return NextResponse.json({ success: false, error: 'Thiếu ID voucher' }, { status: 400 });
        }
        await deleteVoucher(id);
        return NextResponse.json({
          success: true,
          message: 'Đã xóa Voucher thành công!'
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Hành động không hợp lệ: ${action}`
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Lỗi POST admin vouchers:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Lỗi xử lý yêu cầu'
    }, { status: 500 });
  }
}
