export type EducationLevel = 'primary' | 'secondary' | 'high_school' | 'college';

export interface StudentProfile {
  id: string; // Mã học sinh hoặc số CCCD
  fullName: string;
  avatar: string;
  studentCode: string; // Số CCCD hoặc Mã định danh cá nhân không trùng lặp
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
  isLoggedIn: true
};

export const EDUCATION_LEVELS = [
  { id: 'primary' as EducationLevel, label: '🎒 Tiểu học (Lớp 1 - 5)', shortLabel: 'Tiểu học', grades: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'] },
  { id: 'secondary' as EducationLevel, label: '📘 THCS (Lớp 6 - 9)', shortLabel: 'THCS', grades: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'] },
  { id: 'high_school' as EducationLevel, label: '🎓 THPT (Lớp 10 - 12)', shortLabel: 'THPT', grades: ['Lớp 10', 'Lớp 11', 'Lớp 12'] },
  { id: 'college' as EducationLevel, label: '🏛️ Trung cấp / CĐ / ĐH (Mã lớp chuyên ngành)', shortLabel: 'Trung cấp / CĐ / ĐH', grades: ['CNTT-K24', 'QTKD-01', 'DTVT-A', 'DL-K22', 'KT-02'] }
];

export const STORAGE_KEY_STUDENT_PROFILE = 'smart_student_current_profile';
export const STORAGE_KEY_STUDENT_ACCOUNTS = 'smart_student_saved_accounts';

export function getStoredStudentProfile(): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_STUDENT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STUDENT_PROFILE, ...parsed };
    }
  } catch (e) {
    console.error('Error reading student profile:', e);
  }
  return DEFAULT_STUDENT_PROFILE;
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_STUDENT_PROFILE, JSON.stringify(profile));
    saveStudentAccountToList(profile);
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
  } catch (e) {
    console.error('Error saving student account list:', e);
  }
}
