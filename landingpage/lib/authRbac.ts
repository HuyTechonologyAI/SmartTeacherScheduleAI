// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) & SESSION ENGINE - SMART TEACHER SCHEDULE
// 4 Nhóm vai trò cốt lõi: BGH (PRINCIPAL), Giáo viên (TEACHER), Học sinh (STUDENT), Phụ huynh (PARENT)
// ============================================================================

export type UserRole = 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'GUEST';

export type Permission =
  | 'CAN_APPROVE_LESSON_PLAN'    // Duyệt giáo án CV 5512 (Chỉ BGH / Tổ trưởng)
  | 'CAN_SUBMIT_LESSON_PLAN'     // Nộp giáo án lên trường (Giáo viên)
  | 'CAN_MANAGE_STAFF'           // Thêm, sửa, điều chuyển nhân sự (BGH)
  | 'CAN_EDIT_ATTENDANCE_SCORE'  // Điểm danh và nhập sổ điểm (Giáo viên, BGH)
  | 'CAN_SUBMIT_LEAVE_REQUEST'   // Nộp đơn xin nghỉ học (Phụ huynh)
  | 'CAN_APPROVE_LEAVE_REQUEST'  // Phê duyệt đơn xin nghỉ (Giáo viên, BGH)
  | 'CAN_ACCESS_EARLY_WARNING_AI'// Xem cảnh báo rủi ro giáo dục sớm (BGH, GVCN)
  | 'CAN_PAY_SCHOOL_FEES'        // Đóng các khoản học phí (Phụ huynh)
  | 'CAN_USE_AI_STUDY_TUTOR';    // Sử dụng Gia sư AI học tập (Học sinh)

export interface AuthSession {
  userId: string;
  role: UserRole;
  fullName: string;
  emailOrPhone: string;
  schoolCode: string;
  schoolName: string;
  departmentOrClass?: string;
  token: string;
  expiresAt: number;
}

export const COOKIE_ROLE_KEY = 'smart_auth_role';
export const COOKIE_SESSION_KEY = 'smart_school_session';
export const STORAGE_SESSION_KEY = 'smart_auth_session_v1';

// Mẫu tài khoản BGH mặc định
export const DEFAULT_PRINCIPAL_SESSION: AuthSession = {
  userId: 'principal_001',
  role: 'PRINCIPAL',
  fullName: 'Thầy Nguyễn Văn An',
  emailOrPhone: 'bgh.nguyenvanan@eduviet.edu.vn',
  schoolCode: 'BGH-EDUVIET',
  schoolName: 'Trường THPT Chu Văn An - Hà Nội',
  departmentOrClass: 'Ban Giám Hiệu (Hiệu Trưởng)',
  token: 'mock_jwt_principal_token_2025_safe',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
};

// Mẫu tài khoản Giáo viên
export const DEFAULT_TEACHER_SESSION: AuthSession = {
  userId: 'teacher_001',
  role: 'TEACHER',
  fullName: 'Cô Lê Thị Mai',
  emailOrPhone: '0961364600',
  schoolCode: 'GV-TOAN-2025',
  schoolName: 'Trường THPT Chu Văn An',
  departmentOrClass: 'Tổ Toán - Tin',
  token: 'mock_jwt_teacher_token_2025',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
};

// Ma trận quyền hạn sư phạm
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PRINCIPAL: [
    'CAN_APPROVE_LESSON_PLAN',
    'CAN_MANAGE_STAFF',
    'CAN_EDIT_ATTENDANCE_SCORE',
    'CAN_APPROVE_LEAVE_REQUEST',
    'CAN_ACCESS_EARLY_WARNING_AI'
  ],
  TEACHER: [
    'CAN_SUBMIT_LESSON_PLAN',
    'CAN_EDIT_ATTENDANCE_SCORE',
    'CAN_APPROVE_LEAVE_REQUEST',
    'CAN_ACCESS_EARLY_WARNING_AI'
  ],
  STUDENT: [
    'CAN_USE_AI_STUDY_TUTOR'
  ],
  PARENT: [
    'CAN_SUBMIT_LEAVE_REQUEST',
    'CAN_PAY_SCHOOL_FEES'
  ],
  GUEST: []
};

/**
 * Kiểm tra xem một vai trò có quyền thực hiện hành động hay không
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

/**
 * Lấy phiên đăng nhập hiện tại từ Cookies / LocalStorage
 */
export function getCurrentAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as AuthSession;
      if (session && session.expiresAt > Date.now()) {
        return session;
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Lưu phiên đăng nhập & thiết lập Cookie để Next.js Middleware đọc được
 */
export function setAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    
    // Đặt Cookie cho Edge Middleware (Hạn dùng 7 ngày)
    const maxAge = 7 * 24 * 60 * 60;
    document.cookie = `${COOKIE_ROLE_KEY}=${session.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `${COOKIE_SESSION_KEY}=${encodeURIComponent(JSON.stringify({
      userId: session.userId,
      role: session.role,
      fullName: session.fullName,
      schoolCode: session.schoolCode
    }))}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (e) {
    console.error('[RBAC] Lỗi lưu session:', e);
  }
}

/**
 * Đăng xuất và xóa sạch Session & Cookies
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    document.cookie = `${COOKIE_ROLE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${COOKIE_SESSION_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch (e) {
    console.error('[RBAC] Lỗi xóa session:', e);
  }
}
