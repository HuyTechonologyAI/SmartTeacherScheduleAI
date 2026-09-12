import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isTestSyncData, isTestClassroom, isTestStudent } from '@/app/app/testDataSanitizer';

interface LeaveRequestItem {
  id: string;
  studentId: string;
  studentCode?: string;
  studentName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  date: string; // YYYY-MM-DD
  reason: string;
  type: 'SICK' | 'FAMILY' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
  reviewedAt?: number;
  teacherNote?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const syncCode = searchParams.get('code')?.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const className = searchParams.get('class')?.trim();
    const phone = searchParams.get('phone')?.replace(/[^0-9]/g, '');
    const studentCode = searchParams.get('studentCode')?.trim().toLowerCase();
    const role = searchParams.get('role')?.trim().toLowerCase(); // 'student' | 'parent'

    if (!syncCode) {
      return NextResponse.json({ error: 'Thiếu mã lớp / mã liên kết trường (code)' }, { status: 400 });
    }

    let rawPayload: any = null;
    try {
      const { data, error } = await supabase
        .from('teacher_sync_stores')
        .select('data')
        .eq('sync_code', syncCode)
        .single();
      if (data && !error) {
        rawPayload = data.data;
      }
    } catch (err) {
      console.warn('Supabase fetch error in portal:', err);
    }

    if (!rawPayload) {
      return NextResponse.json(
        { error: 'Không tìm thấy dữ liệu lớp học với mã liên kết này. Thầy/Cô vui lòng bấm "Đồng bộ Đám mây" trên ứng dụng trước.' },
        { status: 404 }
      );
    }

    const classrooms: any[] = (rawPayload.classrooms || []).filter((c: any) => !isTestClassroom(c) && !isTestSyncData(c));
    const allStudents: any[] = (rawPayload.students || []).filter((s: any) => !isTestStudent(s) && !isTestSyncData(s));
    const allEvents: any[] = (rawPayload.events || []).filter((e: any) => !isTestSyncData(e));
    const allAttendance: any[] = (rawPayload.attendanceRecords || []).filter((a: any) => !isTestSyncData(a));
    const leaveRequests: LeaveRequestItem[] = rawPayload.leaveRequests || [];

    // 1. TRƯỜNG HỢP TRA CỨU CỦA PHỤ HUYNH
    if (phone || (studentCode && role === 'parent')) {
      const matchedStudent = allStudents.find((st: any) => {
        const cleanStPhone = (st.parentPhone || '').replace(/[^0-9]/g, '');
        const matchPhone = phone && cleanStPhone && (cleanStPhone === phone || cleanStPhone.endsWith(phone) || phone.endsWith(cleanStPhone));
        const matchCode = studentCode && st.studentCode && st.studentCode.toLowerCase().trim() === studentCode;
        return matchPhone || matchCode;
      });

      if (!matchedStudent) {
        return NextResponse.json(
          { error: 'Không tìm thấy thông tin học sinh với Số điện thoại hoặc Mã HS này. Phụ huynh vui lòng kiểm tra lại thông tin đã đăng ký với giáo viên.' },
          { status: 404 }
        );
      }

      const studentAttendance = allAttendance
        .filter((a: any) => a.studentId === matchedStudent.id)
        .sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));

      const studentLeaveRequests = leaveRequests
        .filter((r) => r.studentId === matchedStudent.id || (r.parentPhone && r.parentPhone.replace(/[^0-9]/g, '') === phone))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      const upcomingEvents = allEvents
        .filter((e: any) => (e.className || '').toLowerCase().trim() === matchedStudent.className.toLowerCase().trim())
        .sort((a: any, b: any) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.startTime.localeCompare(b.startTime);
        })
        .slice(0, 10);

      return NextResponse.json({
        type: 'parent',
        syncCode,
        student: {
          id: matchedStudent.id,
          studentCode: matchedStudent.studentCode,
          fullName: matchedStudent.fullName,
          className: matchedStudent.className,
          gender: matchedStudent.gender,
          kudosPoints: matchedStudent.kudosPoints || 0,
          parentName: matchedStudent.parentName || 'Phụ huynh',
          parentPhone: matchedStudent.parentPhone || phone
        },
        attendance: studentAttendance,
        leaveRequests: studentLeaveRequests,
        upcomingEvents,
        classroom: classrooms.find(c => (c.name || '').toLowerCase() === matchedStudent.className.toLowerCase()) || { name: matchedStudent.className }
      });
    }

    // 2. TRƯỜNG HỢP TRA CỨU CỦA HỌC SINH (THEO LỚP & CCCD)
    let matchedStudentForStudent: any = null;
    if (studentCode) {
      matchedStudentForStudent = allStudents.find((st: any) => 
        (st.studentCode && st.studentCode.toLowerCase().trim() === studentCode) ||
        (st.id && st.id.toLowerCase().trim() === studentCode)
      );
    }

    const targetClass = (matchedStudentForStudent ? matchedStudentForStudent.className : className) || (classrooms.length > 0 ? classrooms[0].name : '');
    
    const classEvents = allEvents
      .filter((e: any) => !targetClass || (e.className || '').toLowerCase().trim() === targetClass.toLowerCase().trim())
      .sort((a: any, b: any) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

    const classStudents = allStudents
      .filter((s: any) => !targetClass || (s.className || '').toLowerCase().trim() === targetClass.toLowerCase().trim())
      .map((s: any) => ({
        id: s.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        className: s.className,
        gender: s.gender,
        kudosPoints: s.kudosPoints || 0
      }))
      .sort((a: any, b: any) => (b.kudosPoints || 0) - (a.kudosPoints || 0));

    // Điểm danh của học sinh nếu có mã định danh
    let studentAttendanceSummary = null;
    if (matchedStudentForStudent) {
      const myAttendance = allAttendance.filter((a: any) => a.studentId === matchedStudentForStudent.id || a.studentCode === matchedStudentForStudent.studentCode);
      const present = myAttendance.filter((a: any) => a.status === 'PRESENT').length;
      const absent = myAttendance.filter((a: any) => a.status?.startsWith('ABSENT')).length;
      const late = myAttendance.filter((a: any) => a.status === 'LATE').length;
      studentAttendanceSummary = { present, absent, late };
    }

    return NextResponse.json({
      type: 'student',
      syncCode,
      currentClass: targetClass,
      officialAssignedClass: matchedStudentForStudent ? matchedStudentForStudent.className : null,
      matchedStudent: matchedStudentForStudent ? {
        id: matchedStudentForStudent.id,
        studentCode: matchedStudentForStudent.studentCode,
        fullName: matchedStudentForStudent.fullName,
        className: matchedStudentForStudent.className,
        gender: matchedStudentForStudent.gender,
        kudosPoints: matchedStudentForStudent.kudosPoints || 0,
        notes: matchedStudentForStudent.notes || '',
        attendanceSummary: studentAttendanceSummary
      } : null,
      availableClasses: classrooms.map(c => ({ id: c.id, name: c.name, grade: c.grade, homeroomTeacher: c.homeroomTeacher || '' })),
      events: classEvents,
      kudosLeaderboard: classStudents
    });
  } catch (error: any) {
    console.error('Portal API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ cổng thông tin: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syncCode, studentId, studentCode, studentName, className, parentName, parentPhone, date, reason, type } = body;

    if (!syncCode || !studentId || !studentName || !date || !reason) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin: Mã trường/lớp, Họ tên học sinh, Ngày xin nghỉ và Lý do.' },
        { status: 400 }
      );
    }

    const cleanCode = syncCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');

    const { data: storeData, error: fetchErr } = await supabase
      .from('teacher_sync_stores')
      .select('data')
      .eq('sync_code', cleanCode)
      .single();

    if (fetchErr || !storeData) {
      return NextResponse.json(
        { error: 'Không tìm thấy lớp học với mã này để nộp đơn. Vui lòng liên hệ Giáo viên.' },
        { status: 404 }
      );
    }

    const currentData = storeData.data || {};
    const existingLeaveRequests: LeaveRequestItem[] = Array.isArray(currentData.leaveRequests) ? currentData.leaveRequests : [];

    const newRequest: LeaveRequestItem = {
      id: `lr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: String(studentId).trim(),
      studentCode: studentCode ? String(studentCode).trim() : '',
      studentName: String(studentName).trim(),
      className: String(className || '').trim(),
      parentName: String(parentName || 'Phụ huynh').trim(),
      parentPhone: String(parentPhone || '').trim(),
      date: String(date).trim(),
      reason: String(reason).trim(),
      type: type === 'SICK' || type === 'FAMILY' ? type : 'OTHER',
      status: 'PENDING',
      createdAt: Date.now()
    };

    const updatedLeaveRequests = [newRequest, ...existingLeaveRequests];
    const updatedPayload = {
      ...currentData,
      leaveRequests: updatedLeaveRequests,
      updatedAt: Date.now()
    };

    const { error: updateErr } = await supabase
      .from('teacher_sync_stores')
      .update({
        data: updatedPayload,
        updated_at: new Date().toISOString()
      })
      .eq('sync_code', cleanCode);

    if (updateErr) {
      console.error('Supabase update leave request error:', updateErr);
      return NextResponse.json({ error: 'Không thể lưu đơn xin phép lên đám mây.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã gửi đơn xin phép nghỉ học ngày ${date} của em ${studentName} thành công tới Giáo viên!`,
      request: newRequest
    });
  } catch (error: any) {
    console.error('Portal Leave Request Error:', error);
    return NextResponse.json({ error: 'Lỗi khi gửi đơn xin phép: ' + (error?.message || String(error)) }, { status: 500 });
  }
}
