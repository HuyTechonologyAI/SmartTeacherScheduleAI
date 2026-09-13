import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: stores, error } = await supabase
      .from('teacher_sync_stores')
      .select('sync_code, pin_hash, payload, updated_at')
      .order('updated_at', { ascending: false });

    if (error || !stores || stores.length === 0) {
      return NextResponse.json({
        success: true,
        users: []
      });
    }

    const users = stores.map((item: any) => {
      const p = item.payload || {};
      const profile = p.teacherProfile || {};
      return {
        stCode: item.sync_code,
        name: profile.fullName || 'Giáo viên',
        phone: profile.phoneNumber || 'Chưa thiết lập',
        school: profile.schoolName || 'Chưa liên kết trường',
        role: profile.department || 'Giáo viên Chủ nhiệm',
        students: Array.isArray(p.students) ? p.students.length : 0,
        classes: Array.isArray(p.classrooms) ? p.classrooms.length : 0,
        plan: profile.subscriptionTier || 'FREE_TIER',
        status: 'ACTIVE',
        pin: profile.pin || (item.pin_hash ? 'Đã cài đặt' : 'Mặc định (1234)')
      };
    });

    return NextResponse.json({
      success: true,
      users
    });
  } catch (e: any) {
    return NextResponse.json({
      success: true,
      users: []
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { stCode, newPin } = await req.json();
    if (!stCode || !newPin) {
      return NextResponse.json({ success: false, error: 'Thiếu tham số' }, { status: 400 });
    }

    // Cập nhật mã PIN trong Supabase
    const { data, error } = await supabase
      .from('teacher_sync_stores')
      .select('payload')
      .eq('sync_code', stCode)
      .maybeSingle();

    if (!error && data) {
      const updatedPayload = {
        ...data.payload,
        teacherProfile: {
          ...(data.payload?.teacherProfile || {}),
          pin: newPin
        }
      };
      await supabase
        .from('teacher_sync_stores')
        .update({ payload: updatedPayload })
        .eq('sync_code', stCode);
    }

    return NextResponse.json({
      success: true,
      message: `Đã cấp lại mã PIN ${newPin} cho tài khoản ${stCode}`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
