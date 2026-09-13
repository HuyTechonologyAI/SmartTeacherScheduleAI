import { dbGetSync, dbSet } from '@/lib/storageEngine';
export type EducationLevel = 'primary' | 'secondary' | 'high_school' | 'college';

export interface StudentProfile {
  id: string; // Mã học sinh hoặc số CCCD
  fullName: string;
  avatar: string;
  studentCode: string; // Số CCCD hoặc Mã định danh cá nhân không trùng lặp (12 số)
  birthDate: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  educationLevel: EducationLevel;
  className: string;
  schoolName: string;
  parentPhone: string;
  bioQuote: string;
  kudosPoints: number;
  isLoggedIn: boolean;
  lastLoginAt?: string;

  // Trường quản lý & xếp lớp bởi Nhà Trường / Ban Giám Hiệu
  isSchoolVerified?: boolean; // Lớp học đã được nhà trường/giáo viên phê duyệt chính thức
  schoolAssignedClass?: string; // Lớp chính thức do nhà trường chỉ định
  homeroomTeacher?: string; // Giáo viên chủ nhiệm / Giảng viên cố vấn
  academicYear?: string; // Niên khóa (VD: 2025 - 2026)
  attendanceSummary?: {
    present: number;
    absent: number;
    late: number;
  };
  teacherNotes?: string; // Lời nhận xét, dặn dò xuyên suốt từ giáo viên
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: '001208012345',
  fullName: 'Nguyễn Bảo An',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidCat',
  studentCode: '001208012345',
  birthDate: '2015-05-15',
  gender: 'Nam',
  educationLevel: 'primary',
  className: 'Lớp 3A1',
  schoolName: 'Trường Tiểu Học Việt Nam',
  parentPhone: '0961364600',
  bioQuote: 'Chăm ngoan, học giỏi, vâng lời thầy cô và cha mẹ!',
  kudosPoints: 125,
  isLoggedIn: true,
  isSchoolVerified: true,
  schoolAssignedClass: 'Lớp 3A1',
  homeroomTeacher: 'Cô Trần Thị Mai',
  academicYear: '2025 - 2026',
  attendanceSummary: {
    present: 36,
    absent: 1,
    late: 0
  },
  teacherNotes: 'Bảo An tiếp thu bài nhanh, chăm chỉ phát biểu và rất hòa đồng với bạn bè.'
};

export const EDUCATION_LEVELS = [
  { id: 'primary' as EducationLevel, label: '🎒 Tiểu học (Lớp 1 - 5)', shortLabel: 'Tiểu học', grades: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'] },
  { id: 'secondary' as EducationLevel, label: '📘 THCS (Lớp 6 - 9)', shortLabel: 'THCS', grades: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'] },
  { id: 'high_school' as EducationLevel, label: '🎓 THPT (Lớp 10 - 12)', shortLabel: 'THPT', grades: ['Lớp 10', 'Lớp 11', 'Lớp 12'] },
  { id: 'college' as EducationLevel, label: '🏛️ Trung cấp / CĐ / ĐH (Mã lớp chuyên ngành)', shortLabel: 'Trung cấp / CĐ / ĐH', grades: ['CNTT-K24', 'QTKD-01', 'DTVT-A', 'DL-K22', 'KT-02'] }
];

export const STORAGE_KEY_STUDENT_PROFILE = 'smart_student_current_profile';
export const STORAGE_KEY_STUDENT_ACCOUNTS = 'smart_student_saved_accounts';

// Các key lưu trữ của Giáo Viên & Nhà Trường (liên kết với studentRosterData)
export const TEACHER_ROSTER_STORAGE_KEY = 'smart_teacher_students_v1';
export const TEACHER_CLASSROOMS_STORAGE_KEY = 'smart_teacher_classrooms_v1';
export const TEACHER_ATTENDANCE_STORAGE_KEY = 'smart_teacher_attendance_v1';

/**
 * Lấy danh sách lớp học chính thức đã được Nhà Trường / Giáo viên xếp duyệt
 */
export function getSchoolApprovedClassrooms(): { id: string; name: string; grade?: string; homeroomTeacher?: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEACHER_CLASSROOMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: any) => ({
          id: c.id || c.name,
          name: c.name,
          grade: c.grade || '',
          homeroomTeacher: c.homeroomTeacher || ''
        }));
      }
    }
  } catch (e) {
    console.error('Error loading school approved classrooms:', e);
  }

  // Danh mục lớp học chính thức mặc định do trường xếp (khi chưa có dữ liệu tùy biến)
  return [
    { id: 'cls_3a1', name: 'Lớp 3A1', grade: 'Lớp 3', homeroomTeacher: 'Cô Trần Thị Mai' },
    { id: 'cls_1a', name: 'Lớp 1A', grade: 'Lớp 1', homeroomTeacher: 'Cô Nguyễn Thị Lan' },
    { id: 'cls_2b', name: 'Lớp 2B', grade: 'Lớp 2', homeroomTeacher: 'Thầy Lê Văn Hùng' },
    { id: 'cls_4a', name: 'Lớp 4A', grade: 'Lớp 4', homeroomTeacher: 'Cô Hoàng Thu Thảo' },
    { id: 'cls_5a', name: 'Lớp 5A', grade: 'Lớp 5', homeroomTeacher: 'Thầy Vũ Đình Trọng' },
    { id: 'cls_cntt_k24', name: 'CNTT-K24', grade: 'Cao đẳng / ĐH', homeroomTeacher: 'Thầy TS. Phạm Quang Huy' },
    { id: 'cls_qtkd_01', name: 'QTKD-01', grade: 'Cao đẳng / ĐH', homeroomTeacher: 'Cô ThS. Đỗ Phương Nga' }
  ];
}

/**
 * Tra cứu thông tin học sinh trong Sổ quản lý lớp của Giáo viên theo CCCD hoặc Mã định danh
 */
export function findStudentInTeacherRoster(studentCodeOrId: string): any | null {
  if (typeof window === 'undefined' || !studentCodeOrId) return null;
  try {
    const raw = localStorage.getItem(TEACHER_ROSTER_STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const query = studentCodeOrId.trim().toLowerCase();
        return list.find((s: any) => 
          (s.studentCode && s.studentCode.trim().toLowerCase() === query) ||
          (s.id && s.id.trim().toLowerCase() === query)
        ) || null;
      }
    }
  } catch (e) {
    console.error('Error finding student in teacher roster:', e);
  }
  return null;
}

/**
 * Đồng bộ dữ liệu 2 chiều giữa Hồ sơ học sinh và Danh sách lớp của Giáo viên
 */
export function syncStudentWithTeacherRoster(profile: StudentProfile): StudentProfile {
  if (typeof window === 'undefined') return profile;
  try {
    // 1. Kiểm tra trong danh sách học sinh của giáo viên
    const matched = findStudentInTeacherRoster(profile.studentCode || profile.id);
    let updatedProfile = { ...profile };

    if (matched) {
      // Học sinh đã có trong danh sách chính thức do nhà trường xếp
      updatedProfile.isSchoolVerified = true;
      updatedProfile.schoolAssignedClass = matched.className || profile.className;
      updatedProfile.className = matched.className || profile.className;
      if (typeof matched.kudosPoints === 'number') {
        updatedProfile.kudosPoints = matched.kudosPoints;
      }
      if (matched.notes) {
        updatedProfile.teacherNotes = matched.notes;
      }
    }

    // 2. Tra cứu điểm danh nếu có
    const rawAtt = localStorage.getItem(TEACHER_ATTENDANCE_STORAGE_KEY);
    if (rawAtt) {
      const attList = JSON.parse(rawAtt);
      if (Array.isArray(attList)) {
        const myRecords = attList.filter((a: any) => 
          a.studentId === profile.id || 
          a.studentCode === profile.studentCode
        );
        if (myRecords.length > 0) {
          const present = myRecords.filter((a: any) => a.status === 'PRESENT').length;
          const absent = myRecords.filter((a: any) => a.status?.startsWith('ABSENT')).length;
          const late = myRecords.filter((a: any) => a.status === 'LATE').length;
          updatedProfile.attendanceSummary = { present, absent, late };
        }
      }
    }

    // 3. Tra cứu giáo viên chủ nhiệm từ danh sách lớp của trường
    const approvedClasses = getSchoolApprovedClassrooms();
    const classInfo = approvedClasses.find(c => 
      c.name.toLowerCase().trim() === updatedProfile.className.toLowerCase().trim()
    );
    if (classInfo?.homeroomTeacher) {
      updatedProfile.homeroomTeacher = classInfo.homeroomTeacher;
    }

    return updatedProfile;
  } catch (e) {
    console.error('Error syncing student with teacher roster:', e);
    return profile;
  }
}

export function getStoredStudentProfile(): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_STUDENT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULT_STUDENT_PROFILE, ...parsed };
      return syncStudentWithTeacherRoster(merged);
    }
  } catch (e) {
    console.error('Error reading student profile:', e);
  }
  return syncStudentWithTeacherRoster(DEFAULT_STUDENT_PROFILE);
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    // Tự động đồng bộ và xác minh lớp học với cơ sở dữ liệu của giáo viên
    const synced = syncStudentWithTeacherRoster(profile);
    localStorage.setItem(STORAGE_KEY_STUDENT_PROFILE, JSON.stringify(synced));
  dbSet(STORAGE_KEY_STUDENT_PROFILE, synced);
    saveStudentAccountToList(synced);

    // Cập nhật ngược lại vào danh sách lớp của giáo viên nếu học sinh đã tồn tại
    const rawTeacherStudents = localStorage.getItem(TEACHER_ROSTER_STORAGE_KEY);
    if (rawTeacherStudents) {
      const teacherStudents = JSON.parse(rawTeacherStudents);
      if (Array.isArray(teacherStudents)) {
        const targetIdx = teacherStudents.findIndex((s: any) =>
          (s.studentCode && s.studentCode === synced.studentCode) ||
          (s.id && s.id === synced.id)
        );
        if (targetIdx >= 0) {
          teacherStudents[targetIdx] = {
            ...teacherStudents[targetIdx],
            fullName: synced.fullName,
            avatarUrl: synced.avatar,
            parentPhone: synced.parentPhone,
            gender: synced.gender === 'Nữ' ? 'Nữ' : 'Nam',
            updatedAt: Date.now()
          };
          localStorage.setItem(TEACHER_ROSTER_STORAGE_KEY, JSON.stringify(teacherStudents));
        }
      }
    }
  } catch (e) {
    console.error('Error saving student profile:', e);
  }
}

export function getStoredStudentAccounts(): StudentProfile[] {
  if (typeof window === 'undefined') return [DEFAULT_STUDENT_PROFILE];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_ACCOUNTS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {
    console.error('Error reading student accounts:', e);
  }
  return [DEFAULT_STUDENT_PROFILE];
}

export function saveStudentAccountToList(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredStudentAccounts();
    const existingIndex = list.findIndex(a => a.studentCode === profile.studentCode || a.id === profile.id);
    if (existingIndex >= 0) {
      list[existingIndex] = profile;
    } else {
      list.unshift(profile);
    }
    localStorage.setItem(STORAGE_KEY_STUDENT_ACCOUNTS, JSON.stringify(list.slice(0, 10)));
  dbSet(STORAGE_KEY_STUDENT_ACCOUNTS, list.slice(0, 10));
  } catch (e) {
    console.error('Error saving student account list:', e);
  }
}
